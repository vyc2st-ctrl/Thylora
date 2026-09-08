# Q346 — UI showed "visit 2", the log showed none

## 1. What the evidence says

**The access log was never broken.** The request log shows exactly two successful calls
to `thylora_open_edf_v1` in the entire window, and exactly two rows exist — one per call.

| time | call | row written |
| --- | --- | --- |
| `17:59:31` | POST → **401** | none — anonymous security probe, correctly refused |
| `19:43:55` | POST → 200 | `FIRST_ACCESS` · `vyc2st+library@gmail.com` · entitlement `9102f7cb` |
| `20:02:11` | POST → 200 | `FIRST_ACCESS` · `vyc2st@gmail.com` · entitlement `db0c12f7` |

Two calls, two rows, both correctly classified. Both are genuine *first* opens of two
**different** entitlements — the second account had never opened its own purchase.

Ruled out by direct inspection, not assumption:

- no triggers on `thylora_entitlement_access_log`
- no unique constraint or index that could reject a second row
- RLS enabled but **not** `FORCE`, so the definer-owned insert is not filtered
- both functions are `VOLATILE`, so writes are permitted
- the logging path works: replayed against both real accounts, a second open returns
  `REACCESS` / visit 2 **and writes the row** (three written, transaction rolled back)

## 2. Root cause

The library page decided the label like this:

```js
data.access_kind === 'FIRST_ACCESS' ? 'First time opening this' : 'Opened again'
```

A **two-way test with no third branch**. Any value that is not exactly `'FIRST_ACCESS'`
— including `undefined` from a malformed or partial response — falls through to
**"Opened again"**. The page could therefore assert a re-access that no row backed.

Underneath it was a structural problem: `access_kind` and `access_number` were
*computed* from a count taken **before** the insert, then returned. Display and log were
two separate derivations of the same intent, and nothing forced them to agree.

The dashboard panel (`js/customer-library.js`) tests `=== "REACCESS"` and defaults to
first-time wording, so it cannot make this mistake. Only the library page could.

**Left UNKNOWN, not guessed:** the exact frame showing the numeral **2** could not be
reproduced from any observed response. Only two opens ever reached the server and both
returned `access_number: 1`. The fail-open default explains "Opened again"; it does not
explain the "2". That is recorded as unknown rather than filled in with a story.

## 3. Repair

**Server — `thylora_open_edf_v1`.** The row is now inserted first and the response is
read back **from it**:

- `access_kind` comes from `RETURNING`, so it is literally the committed value
- `access_number` is counted **after** the write, so it includes this visit
- `access_id` is the primary key of the row that was committed — durable proof
- a **per-entitlement advisory lock** serialises concurrent opens, so two simultaneous
  calls cannot both see zero prior rows and both write `FIRST_ACCESS`

Display and log are now the same authoritative event.

**Page — saved at `surfaces/customer-library/`.** Three-way label that refuses to claim
anything without proof:

```js
if (!durable) return 'Opened';                                   // no access_id, no claim
if (kind === 'REACCESS' && n >= 2) return 'Opened again · visit ' + n;
if (kind === 'FIRST_ACCESS')       return 'First time opening this';
return 'Opened';
```

It also fixes something the log exposed: the page reloaded the library on **every** auth
event, appearing as **three concurrent `thylora_customer_library_v1` calls per page
load** (19:43:49 ×3, 20:02:09 ×3) — three concurrent claim attempts and three racing DOM
rebuilds. It now loads once per signed-in user.

**Not deployed.** Production redeploy of the existing Vercel project returns `403`, and a
new project would change the URL and sign the Chairman out — the auth loop he has ruled
out. The corrected page is committed and is one deploy away.

This does not leave the defect live: with the server fix, every label the deployed page
renders now comes from a committed row, because `access_kind` is always a valid value
read back from the log and `access_number` is always the true count. The page's
fail-open branch survives only as a latent weakness for a malformed response.

## 4. Reconciliation — nothing fabricated

| account | entitlement | FIRST_ACCESS | REACCESS |
| --- | --- | --- | --- |
| `vyc2st+library@gmail.com` | `9102f7cb…` | 1 | 0 |
| `vyc2st@gmail.com` | `db0c12f7…` | 1 | 0 |

Each row matches one logged 200 response, one-to-one. No orphans, no duplicates, no
false history. **No REACCESS row was created.** Every REACCESS produced during testing
was written inside a transaction that was rolled back; the production count is 0.

REACCESS therefore remains **FAIL**, honestly, because no second open has actually
happened yet.

## 5. Chain

| step | verdict |
| --- | --- |
| PRODUCT | **PASS** |
| CHECKOUT | **FAIL** — draft orders bypass the storefront |
| PAYMENT | **UNPROVEN — REAL MONEY NOT YET CAPTURED** |
| ORDER | **PASS** |
| WEBHOOK | **PASS** |
| ENTITLEMENT | **PASS** |
| DELIVERY | **PASS** |
| FIRST ACCESS | **PASS** — 2 |
| REACCESS | **FAIL** — 0 |

`first_failing_step: CHECKOUT` · `real_money_captured: false`. Payment untouched; the
capture witness is still empty.
