# Q341 — Zero-cost proving run, and the customer library

Run code: `Q341_ZERO_COST`. No money was spent. No money was captured.

## 1. The zero-cost path chosen, and why

Options considered: Shopify test-mode gateway (would have to be toggled on the live
store), an isolated fixture product (would need its own EDF package and would prove the
fixture, not the real work), a 100%-discount storefront checkout (needs a browser this
session cannot drive), and a draft order completed as marked-as-paid.

Chosen: **draft order, 100% discount, total $0.00, completed with `paymentPending: false`.**
It creates a genuine Shopify `Order` and fires a genuine signed `orders/paid` webhook,
without touching the live product's price, state, or publication, and without any money
moving. It is the only zero-cost path that exercises the real production webhook.

Order **#1002** — `gid://shopify/Order/6096452517965`, created `2026-09-08T17:50:33Z`,
`$0.00`, `displayFinancialStatus: PAID`, tagged
`THYLORA-ZERO-COST-MECHANISM-TEST` / `NOT-A-REAL-SALE` / `NO-MONEY-CAPTURED`.

**This is not a payment.** It proves the order and delivery mechanism. It proves nothing
whatsoever about capturing real money.

## 2. What the zero-cost order actually proved

Four seconds after the order, delivery `46a0730b-88a0-48b8-92bf-9f76df8a9990`:

| fact | value |
| --- | --- |
| topic | `orders/paid` |
| signature | **VERIFIED** |
| outcome | `ACCEPTED` — all line items ingested |
| shop | `sracnp-zg.myshopify.com` |

This settled something previously unknown: a **live store-level `orders/paid`
subscription exists, points at our endpoint, and its signing secret matches**. The only
prior delivery was Shopify's canonical test notification, which we deliberately refuse
to convert into a purchase — so the real path had never been exercised.

It also exercised, in production, the `ACCOUNT_MATCHED_ALIAS_LINKED` branch built
earlier the same day: `vyc2st@gmail.com` had no commerce alias, a confirmed account held
the address, so the alias was linked at `17:50:36.838Z` and the entitlement granted.
Order event `ENTITLEMENT_GRANTED`, entitlement `ACTIVE`, delivery attempt opened.

Also observed: order **#1001** carries `test: true`. Even that was never real money.

## 3. The customer library

**Live: `https://thylora-library.vercel.app`**

Verified by fetching the live URL from Postgres via `pg_net` — not inferred from a
successful deploy:

| check | result |
| --- | --- |
| status | `200` |
| content-type | `text/html; charset=utf-8` |
| bytes | 9,696 |
| title | `Your THYLORA library` |
| CSP | the page's own policy, intact |
| `X-Frame-Options` | `DENY` |
| service-role key present | **no** |
| publishable key only | yes |

### The first attempt failed, and only live verification caught it

The library was first built and deployed as a Supabase Edge Function. It deployed
cleanly and reported `ACTIVE`. Fetching it showed the gateway forces
`content-type: text/plain` and **replaces the page CSP with `default-src 'none'; sandbox`**.
The page would have rendered as raw source with no script execution. A Supabase Edge
Function cannot serve a customer-facing HTML surface on the default functions domain.
Rebuilt as a static page on Vercel and re-verified. The edge function now serves a 302
to the real page so the address is not a dead end.

### How a buyer is identified

Magic link first: clicking it *is* proof of controlling the address, which is exactly
what releases a held purchase. Password sign-in is offered for existing accounts. The
page holds no secret, and reads nothing directly — every read goes through a per-user
RPC that resolves the caller from the session token. There is no call shaped like
"give me customer X's library", so cross-customer access is prevented in the database,
not by this page being careful.

## 4. Security tests re-run after deployment

**Anonymous, over real HTTP against the live API** (via `pg_net`, publishable key):

| # | test | result |
| --- | --- | --- |
| A1 | `thylora_customer_library_v1` | 401 permission denied |
| A2 | `thylora_open_edf_v1` | 401 permission denied |
| A3 | `thylora_claim_pending_entitlements_v1` | 401 permission denied |
| A4 | `thylora_commerce_record_unlinked_purchase_v1` | 401 permission denied |
| A5 | pending-claims table | 401 permission denied |
| A6 | entitlements table | 200 `[]` — RLS returns nothing |
| A7 | **book text** `thylora_edf_text_blocks` | **200 `[]` — the work is not readable without buying** |
| A8 | `thylora_commerce_event_witness_v1` | 401 permission denied |
| A9 | `public_get_thylora_wares_v1` (anon by design) | catalog only — title, price, cover, handle. No book text |

**Authenticated, against live tables, rolled back:**

| # | test | result |
| --- | --- | --- |
| B1 | unknown buyer purchases | `CLAIM_HELD_FOR_BUYER` |
| B2 | **duplicate webhook** (same event id replayed) | `CLAIM_ALREADY_HELD`, still 1 claim row |
| B3 | unconfirmed address claims | 0, reason `EMAIL_NOT_CONFIRMED`, returned not raised |
| B4 | different authenticated buyer claims | 0 |
| B5 | customer tries to mint a claim | refused, `insufficient_privilege` |
| B6 | confirmed buyer opens library | claim released, 1 item |
| B7 | **duplicate claim** | 0 claimed, still exactly 1 entitlement |
| B8 | first access | `FIRST_ACCESS`, delivered, 50 blocks |
| B9 | re-access | `REACCESS`, delivered |
| B10 | **cross-customer** open + library | refused; 0 items |

**Direct table reads as the real `authenticated` role, bypassing every RPC:**

book text `0` · EDF packages `0` · entitlements `0` · pending claims `0` ·
access log `0` · order events `0` · identity aliases `0` · webhook delivery log `0`.

Supabase advisors: **zero ERROR-level findings**. The `SECURITY DEFINER` view exposure
closed earlier is confirmed gone, and re-confirmed over real HTTP by A8.

## 5. PAYMENT can no longer be faked into a pass

PAYMENT used to be hard-coded `false` with an explanatory string. A string is not a
safeguard. Added `thylora_payment_capture_witness`: PAYMENT passes **only** when a row
exists, a check constraint refuses non-live rows and non-positive amounts, and the table
comment forbids rows for `$0`, discounted, draft, manual, test-mode or simulated orders.

The table is empty. `real_money_captured: false`.

## 6. Chain

| step | pass | note |
| --- | --- | --- |
| PRODUCT | ✅ | EDF `PUBLISHED`, 50 blocks |
| CHECKOUT | ❌ | a draft order bypasses the storefront checkout and must not pass this |
| PAYMENT | ❌ | **UNPROVEN — REAL MONEY NOT YET CAPTURED** |
| ORDER | ✅ | order #1002 ingested, `ENTITLEMENT_GRANTED` |
| WEBHOOK | ✅ | 3 signature-verified deliveries |
| ENTITLEMENT | ✅ | 1 active |
| DELIVERY | ❌ | openable, not yet opened |
| FIRST ACCESS | ❌ | not yet opened |
| REACCESS | ❌ | not yet opened |

## 7. Deployment authority, measured

`deploy_to_vercel` can create a **new** project and its first production deployment.
Redeploying an existing project returns **403 — "You don't have permission to create a
Production Deployment for this project."** Reads are 404 on every project. So the
library page is effectively a one-shot: changing it needs either a new project name or
real Vercel access granted to this connector.

Disclosed leftovers in team `Thylora`, none of which serve THYLORA content:
`thylora-head-authority-probe`, `thylora-head-current`, `thylora-library-open`.

## 8. Still open

- CHECKOUT and PAYMENT — both need a real storefront purchase with real money.
- Mobile shelf preview unwitnessed.
- No refund policy, no terms of service.
- Cover gate `THY-REVIEW-TWELVE-MILES-COVER-001` still OPEN.
- The library page cannot be updated by this session (see §7).
