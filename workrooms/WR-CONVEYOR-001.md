# WR-CONVEYOR-001 · Continuous Production Conveyor

**Lane:** persistent advancement pipeline for every Chairman-originated idea
**Backend of record:** `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`)
**Source repository:** `vyc2st-ctrl/Thylora`, branch `claude/production-conveyor-pipeline-8kaj6m`
**Opened:** 2026-09-16

---

## 1 · Authority position

Read before execution, and held throughout:

- `DASHBOARD_AUTHORITY.md` — this repository is **not** the deployment authority for
  the Chairman dashboard. Authority remains `vyc2st-ctrl/thylora-executive-dashboard`
  → `thylora-public-world`. **Nothing in this delta touches `dashboard-current-head.html`.**
- `dashboard-baseline.json` — floor `THY-DASH-FLOOR-20260823-001`. **No baseline
  capability was removed, renamed or disconnected.**
- `workrooms/WR-RAELINK-001.md` — read first. Its blocker B1 (backend unreachable)
  is still live and is inherited by this workroom.
- The conveyor board at `/conveyor` is **read-only**: no sign-in, no command, no
  write path, no backend mutation. It is not a dashboard.

Dashboard ≠ member app ≠ RAE Link ≠ conveyor board ≠ backend.

**No second source of truth.** The idea registry, product registry, department
registry and the THY-DPP-003 passport standard already exist. The conveyor holds
**advancement state only** and soft-references those registries by text ref.

---

## 2 · The conveyor

```
CAPTURE → CLASSIFY → ASSIGN → PRODUCE → VERIFY → PRODUCTIZE
        → PRICE → STORE → RELEASE → MEASURE → IMPROVE
```

`IMPROVE` is not an end state: it returns the item to `PRODUCE` at `version_no + 1`,
so a shipped item keeps advancing instead of going quiet.

### BLOCK(X) ≠ BLOCK(Y), implemented at three levels

1. **Across lanes** — `scheduleAllLanes` evaluates all twelve lanes independently.
   A dead lane cannot silence the others.
2. **Within a lane** — a Chairman-gated item is stepped over, not waited on.
3. **Within an item** — `pullForwardWork` finds later-stage BUILD work that does
   not depend on the blocked field. A show parked because no producer has been
   designated still has its rights researched and its provenance recorded.

**The two exceptions, and why they exist.** Pull-forward is suppressed behind
`CONTINUITY_UNVERIFIED` and Chairman-held `RIGHTS_NOT_CLEARED`. Those two gates
are about *permission to make the thing at all*. Producing an adaptation before
family consent, or producing anything for an item whose source record is
unconfirmed, is the exact failure the gate exists to prevent. Working around it
by starting later work early would defeat it.

`CONTINUITY_UNVERIFIED` is a **precondition**: it halts the item at every stage,
including work at the stage it is standing on. It is not merely first in a list.

### Every item always exposes

canonical ID · source/parent · owner department · responsible in-world person ·
stage · blocker (and its authority) · next executable action (and its authority) ·
actions remaining · rights · provenance · serial · QR · cost · price · storefront ·
money distance (and how many of those steps are Chairman gates) · last advancement.

Enforced as a contract in `REQUIRED_EXPOSED_FIELDS`, asserted per item in tests.

### Money distance

Executable actions between now and the far side of `RELEASE` — **not** to a
product record. A product record with no cleared purchase path has not reached
money. Counted from the item's own fields, never estimated, and it reports how
many of the remaining steps are not ours to take.

---

## 3 · Execution delta

### Added — conveyor engine (`conveyor/lib/`)

| File | Contents |
|---|---|
| `stages.js` | 11-stage machine, per-stage exit gates, preconditions, pull-forward, money distance, refusing `advance` |
| `lanes.js` | 12 lanes, item projection, non-blocking scheduler, money ranking, Chairman-gate extraction |
| `serial.js` | Deterministic serials anchored to **THY-DPP-003**, provenance chain, QR binding with visibility, object-registry eligibility |
| `advance.js` | Evidenced advancement — every operation demands the evidence that permits it |
| `registry.js` | Load, validate, board projection, the exposed-field contract |

### Added — registry and records

- `conveyor/registry/conveyor-registry.json` — 21 items captured across 12 lanes.
- `conveyor/rights/internal-origin.json` — internal-origin rights record for four
  artifacts, with an explicit `does_not_cover` list.

### Added — backend spine (reviewable, **not applied**)

`db/conveyor/0001_conveyor_spine.sql` — 5 tables, 6 functions, 1 view, 27 check
constraints, RLS on every table, **zero write policies**. Guarded links into
`idea_registry` and `thylora_departments` via `to_regclass`.

### Added — surface

`conveyor/index.html` · `styles.css` · `app.js` — read-only board at `/conveyor`,
importing the same modules the tests verify so board and gate cannot drift apart.

### Added — tests

`tests/conveyor.stages.test.mjs` (20) · `tests/conveyor.serial.test.mjs` (21) ·
`tests/conveyor.lanes.test.mjs` (20) · `tests/conveyor.surfaces.test.mjs` (9).
**118 tests total, all passing** (48 pre-existing RAE Link tests unchanged).

### Changed — additive only

| File | Change |
|---|---|
| `vercel.json` | Added `/conveyor` and `/conveyor/` rewrites. Existing rewrites untouched. |
| `package.json` | Four conveyor scripts. Test script unchanged. Still no dependencies. |

### Not touched

`dashboard-current-head.html`, `dashboard-baseline.json`, `DASHBOARD_AUTHORITY.md`,
`.github/`, `app/*`, `public-site/*`, `rae-link/*`, `db/rae-link/*`,
`workrooms/WR-RAELINK-001.md`, and all existing tests.

---

## 4 · Evidence

| Claim | Evidence |
|---|---|
| Tests pass | `npm test` → 118 tests, 118 pass, 0 fail |
| No regression to the existing floor | The 48 RAE Link tests are unchanged and still pass |
| Migration applies to a real database | Applied to a fresh PostgreSQL 16.13: 5 tables, 6 functions, 5 policies, 27 check constraints, 12 lanes seeded |
| Migration is idempotent | The same file re-applied to the same database with no error |
| Constraints actually fire | **13 of 13** "expect reject" cases rejected by the database, not by a comment |
| SQL and JS gates agree | Shared parity fixture (PRODUCTIZE, unreachable registry, no serial, no QR) yields `PRODUCT_RECORD_MISSING:CHAIRMAN,QR_NOT_BOUND:BUILD,SERIAL_NOT_ISSUED:BUILD` from both `conv_stage_gate` and `stageGate` |
| Access is not authority | `write policies = 0` and `rls disabled = 0` across every `conv_` table |
| The gate reports everything at once | An empty PRODUCTIZE context returns 3 blockers, each naming route and authority |
| An item cannot advance by asserting it advanced | `advance` returns `GATE_UNMET` and the item does not move; `conv_advance` does the same in SQL |
| A state claim must be backed by a value | Validator rejects `serial_state ISSUED` with no serial, `RECORDED` with no chain, `SET` with no price evidence, `LISTED`/`VERIFIED`/`CONFIRMED`/`CLEARED` with no evidence. Caught my own unbacked claims on CONV-MEM-0001 during the build |
| Serials are unique | 100,000 serials across 12 lanes and 100,000 sequences: 100,000 distinct |
| Serials are deterministic | The same tuple reissues the same serial, so a lost record restores rather than mints a competing one |
| Transcription errors are caught | Every single-character alteration at every position of a serial is rejected |
| Provenance tampering is detected and located | An altered entry returns `ENTRY_ALTERED` at its sequence; a removed entry returns `CHAIN_BROKEN` |
| Public imagery is not cluttered | `REGISTRY_ONLY` objects are fully registered with `renders_on_object = false` |
| The belt is not idle | 10 of 12 lanes have executable work; the 2 held lanes are held by permission gates, correctly |
| One blocked item does not collapse the belt | Blocking `CONV-HRB-0002` leaves ≥ 8 lanes working; blocking the entire GAMES lane leaves ≥ 8 lanes working |
| The board renders | Chromium at `/conveyor`: 12 lanes, 21 items, 10 executable rows, 5 money rows, 21 Chairman gates, **no failed application request** (the one 404 was the browser's default favicon) |
| Surfaces verified for the first time | `app/sports-betting.*` and `app/time-run.*`: element contract holds, escaping boundary holds against `<img src=x onerror=...>`, no third-party origin contacted |
| The storefront offers no purchase control | No `<button>` or `<a>` on `public-site/store.html` carries a buy/subscribe/purchase/pay/checkout label while the checkout path is unverified |
| Storefront and conveyor prices agree | Every tier price recorded in the conveyor appears on the storefront |

### Not measured, and not claimed

Live-backend compatibility. Any payment, subscription, deployment or publication.
Conversion, revenue or audience. Real manufacturing cost for any physical item.
None of these were reachable; each is named as a blocker rather than estimated.

---

## 5 · What moved in this pass

| Item | From → To | Stopped at |
|---|---|---|
| `CONV-GAM-0001` GAME-BET-001 | PRODUCE → **PRODUCTIZE** | `PRODUCT_RECORD_MISSING` · operator |
| `CONV-GAM-0002` Time Run | PRODUCE → **PRODUCTIZE** | `PRODUCT_RECORD_MISSING` · operator |
| `CONV-RAE-0001` RAE Link | VERIFY → **PRODUCTIZE** | `PRODUCT_RECORD_MISSING` · operator |
| `CONV-MEM-0001` Memberships | held at **STORE**, cost/price/storefront/provenance/serial/QR all now backed by evidence | `CHECKOUT_PATH_UNVERIFIED` · **Chairman** |

Serials issued: 4. Provenance chains opened: 4. Rights records produced: 1,
covering 4 artifacts on verified internal origin.

---

## 6 · Unresolved blockers

### B1 · Backend unreachable — **HARD, INHERITED FROM WR-RAELINK-001**
`jvsdxhrfhtlgaknhjxlz.supabase.co:443` returned **403 on CONNECT** from the egress
proxy, logged **2026-09-16T11:36:09.092Z**. Consequences: the live shapes of
`idea_registry`, `products` and `thylora_departments` could not be verified; every
link is a `to_regclass`-guarded soft reference; no product record can be created,
which is why `PRODUCT_RECORD_MISSING` is an operator action on every item rather
than build work being neglected. Column names were read from the dashboard's own
select lists — evidence of shape, not a live check.

### B2 · Production DDL is a held action — **BY RULE**
`db/conveyor/0001_conveyor_spine.sql` mutates the production backend. Complete,
validated on PostgreSQL 16, **not applied**.

### B3 · Membership checkout path — **CHAIRMAN, NEAREST TO MONEY**
Money distance 3, of which 1 is the Chairman gate. Needs provider-side recurring
billing plus the full loop the storefront itself demands: subscribe → payment →
entitlement → access → cancellation → access-removal. `verifyCheckoutPath` refuses
a partial proof and names the missing steps.

### B4 · Two items are named by directive but absent from continuity — **CHAIRMAN**
`CONV-HRB-0002` (herbal product line) and `CONV-ASK-0001` (Ask Ersatz products).
No matching record exists anywhere in this repository. Captured and halted rather
than invented. Confirming the source record unhalts them.

### B5 · `Wick` / `WYCK` spelling — **CHAIRMAN, ONE WORD**
Continuity spells the companion **Wick**; the directive spelled it **WYCK**.
Canonical held as `Wick` with `WYCK` recorded as an alias.

### B6 · In-world people are not designated — **CHAIRMAN**
15 items have no responsible in-world person. Continuity forbids inventing
assigned staff, so this is a designation, not build work. It does not stall those
items: their later BUILD work is pulled forward.

### B7 · Family consent — **CHAIRMAN**
`CONV-SHW-0003` (Green Milk), `CONV-HRB-0001` (Family Story Archive editions) and
`CONV-NWS-0001` (Family Reports) are held on family consent, and pull-forward is
deliberately suppressed behind it.

### B8 · Physical commerce path — **HELD**
Clothing and merchandise carry `cost_state = QUOTE_REQUIRED`. Continuity keeps the
physical commerce path separate from digital checkout and unverified. No cost band
was modelled.

---

## 7 · Restart vector

1. **Read first:** `DASHBOARD_AUTHORITY.md`, `dashboard-baseline.json`,
   `workrooms/WR-RAELINK-001.md`, this file.
2. **Verify the floor:** `npm test` → expect **118 passing**. Then
   `sudo service postgresql start && npm run conveyor:validate` → expect
   `CONVEYOR VALIDATION OK`, 5 tables, 6 functions, 0 write policies,
   13 expect-reject cases rejected.
3. **See the belt:** `npm run conveyor` prints lanes, executable work, money
   ranking and Chairman gates. `/conveyor` renders the same thing.
4. **Check B1 first.** If the backend is reachable, the next executable action is
   to read the live schema, then create the product records that three items are
   waiting on — that alone advances three items out of PRODUCTIZE.
5. **Advance work:** add operations to the plan in `conveyor/produce.mjs` and run
   `npm run conveyor:produce`. It is idempotent and refuses to write a registry
   that does not validate.
6. **Do not:** create a dashboard here, apply DDL to production without Chairman
   execution, invent a person, invent a product for a halted item, or mark any
   state without the value that backs it.

---

## 8 · State

| | |
|---|---|
| Workroom | **OPEN** |
| Conveyor | Built · running · 21 items · 12 lanes · 10 lanes executable |
| Spine | Written · **validated on PostgreSQL 16.13** · idempotent · **not applied** (B1, B2) |
| Surface | Built · renders · read-only |
| Tests | 118 / 118 JavaScript · 13 / 13 constraint rejections · SQL↔JS gate parity confirmed |
| Nearest money | `CONV-MEM-0001`, distance 3, one Chairman gate (B3) |
| Baseline regression | **None.** No baseline capability removed, renamed or disconnected. |

NO LOSS. DO NOT GO BACKWARD. ONE SOURCE OF TRUTH. ACCESS ≠ AUTHORITY.
CURRENT BACKEND OUTRANKS HISTORICAL PROMPTS.
A BLOCKED ITEM MAY NOT STOP UNRELATED EXECUTABLE WORK.
