# Q343 — Magic-link sign-in fails: redirect goes to localhost

Run code: `Q343_MAGIC_LINK`
Backend finding: `AUTH_REDIRECT_ALLOW_LIST_SENDS_MAGIC_LINKS_TO_LOCALHOST` (BLOCKER, open)

## 1. What is wrong

The library page asks Supabase for a magic link and passes
`emailRedirectTo: https://thylora-library.vercel.app/`. GoTrue **discards it** and
rewrites the verification URL to `redirect_to=http://localhost:3000`, because the
project's redirect allow list holds no usable entry and Site URL is still the Supabase
default. The phone then tries to open `localhost:3000` and there is nothing there.

**The page and its code are not at fault.** Nothing in the deployed page needs to change.

## 2. Proved without opening the Chairman's inbox

`GET /auth/v1/verify?token=probe&type=magiclink&redirect_to=<X>` issued from Postgres
via `pg_net`, which follows redirects:

| `redirect_to` sent | result |
| --- | --- |
| `https://thylora-library.vercel.app/` | Couldn't connect to server |
| `https://thylora-public-world.vercel.app/` | Couldn't connect to server |
| `https://example.com/` | Couldn't connect to server |
| *(omitted entirely)* | Couldn't connect to server |

`example.com` and the THYLORA dashboard are both reachable from Postgres — the dashboard
was fetched successfully minutes earlier and returned `200`. Every probe still failed to
connect, so GoTrue sent all of them to the same unreachable host. That host is
`localhost:3000`, matching the email the Chairman inspected. **The allow list honours
nothing.**

Also read from `/auth/v1/settings`: `mailer_autoconfirm: false`. Email confirmation is
genuinely required, which means the confirmed-address guard on claim release is real and
cannot be bypassed by signing up as someone else.

## 3. Why this session cannot fix it

No Supabase MCP tool exposes auth configuration — the surface covers SQL, migrations,
edge functions, advisors, logs and project metadata, and nothing else. The Management
API endpoint that sets Site URL and the redirect allow list requires a personal access
token, which is a secret this session must not request. This is a genuine
Chairman-credentials action.

## 4. Verification test, ready to run the moment it is changed

Re-run the same probe with `redirect_to=https://thylora-library.vercel.app/`. It must
return **HTTP 200 with title `Your THYLORA library`** instead of a connection failure.
That confirms the allow list honours the URL, before any email is sent.

## 5. Claim-release proof armed on production

So that one sign-in proves the whole remaining chain on real data rather than in a test
harness, a second zero-cost order was placed:

| | |
| --- | --- |
| order | **#1003** `gid://shopify/Order/6096522444877` |
| total | **$0.00**, 100% discount, marked as paid — no money moved |
| checkout email | `vyc2st+library@gmail.com` |
| webhook | signature **VERIFIED**, `ACCEPTED` at `2026-09-08T18:48:14Z` |
| outcome | 1 line item **held as a PENDING claim** |
| order event | `PENDING_BUYER_CLAIM`, `buyer_user_id: null` |

That address has **no THYLORA account and no commerce alias**, so the webhook was forced
down the unlinked-buyer path — the exact path that must release on first confirmed
sign-in. Gmail delivers `+library` to the same inbox.

This is not a payment and must never be counted as revenue.

## 6. Chain — unchanged by this run

PRODUCT ✅ · CHECKOUT ❌ · **PAYMENT ❌ UNPROVEN — REAL MONEY NOT YET CAPTURED** ·
ORDER ✅ · WEBHOOK ✅ · ENTITLEMENT ✅ · DELIVERY ❌ · FIRST ACCESS ❌ · REACCESS ❌

`thylora_payment_capture_witness` remains empty. `real_money_captured: false`.
Nothing in this run touched payment status.

---

## 7. RESOLVED — 2026-09-08T19:43Z

Chairman added both URLs to the Supabase redirect allow list. The identical probe was
re-run before any email was sent:

| `redirect_to` requested | before | after |
| --- | --- | --- |
| `https://thylora-library.vercel.app/` | couldn't connect | **200 · 9,696 bytes · `Your THYLORA library`** |
| `https://thylora-public-world.vercel.app/` | couldn't connect | **200 · 18,929 bytes · `THYLORA Current Head`** |
| `https://example.com/` — negative control, deliberately not added | couldn't connect | **couldn't connect** |

The negative control is what makes this conclusive. Before the fix all three failed
identically. After the fix, exactly the two added URLs resolve and the one not added
still falls back to the unreachable host. The allow list is enforcing, not merely
permitting everything. **`localhost:3000` is no longer used for the library redirect.**

### Magic link sent

`POST /auth/v1/otp?redirect_to=https://thylora-library.vercel.app/` for
`vyc2st+library@gmail.com` returned **HTTP 200** at `2026-09-08T19:43:10Z`.

### Baseline recorded immediately before sign-in

| | |
| --- | --- |
| `vyc2st+library@gmail.com` created | `2026-09-08T19:43:10Z` |
| **email_confirmed** | **false** |
| pending claim | `PENDING` |
| access log total / first / reaccess | `0` / `0` / `0` |
| active entitlements | `1` (order #1002) |
| delivery attempts | `PENDING 1` |
| payment capture witness rows | `0` |

The unconfirmed user is itself evidence the guard is armed: the claim **cannot** release
until the address is confirmed by clicking the link. Everything downstream of that click
is now staged so a single sign-in proves SIGN-IN → CLAIM RELEASE → LIBRARY →
FIRST ACCESS → REACCESS on production data.

PAYMENT untouched: capture witness empty, `real_money_captured: false`.
