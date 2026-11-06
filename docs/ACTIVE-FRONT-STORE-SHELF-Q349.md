# Q349 — Storefront verification, rapid-offer shelf, QYRIS cards

## 1. Live state, read first

| fact | value |
| --- | --- |
| shop | ErsatzReality · `sracnp-zg.myshopify.com` · primary `ersatzreality.myshopify.com` |
| plan | Basic |
| ACTIVE products | 1 |
| DRAFT products | 14 (9 pre-existing + 5 created this run) |

## 2. Is the product actually reachable by a stranger

Fetched from Postgres over the real network — not assumed:

| check | result |
| --- | --- |
| HTTP | **200**, 186,050 bytes |
| password wall | **none** |
| "sold out" occurrences | **0** |
| `"available":true` / `"available":false` | **2 / 0** |
| "Add to cart" controls | **3** |
| `/cart/add` forms | **2** |
| `requires_shipping` | **false** |
| price on page | **$1.99** |
| channels | Online Store · Shop · Microsoft Copilot |

**A crude keyword pass first flagged the word "unavailable" on the page. That was theme
boilerplate — a false positive.** Direct inspection cleared it. Reporting it as a defect
would have been wrong.

**Checkout probe is inconclusive, deliberately.** `GET /cart/43711382257741:1` returned
the storefront home page. `pg_net` carries no cookies and a Shopify cart is
cookie-backed, so this probe cannot exercise checkout. That is a limitation of the
probe — **not** evidence checkout is broken, and **not** evidence it works.

## 3. Payment — what can actually be read

`shopifyPaymentsAccount` → `null`, with:

> Access denied for shopifyPaymentsAccount field. Required access: the
> `read_shopify_payments` or the `read_shopify_payments_accounts` access scope.

**Readable:** order #1001 was `test: true`; #1002 and #1003 were `$0.00` draft orders
marked as paid; the capture witness table is empty.

**Not readable:** activation, country, payout state, and **whether Shopify Payments is
still in TEST mode**. Since the store has been in test mode at least once, a real card
might not capture at all. That is UNKNOWN and no inference is drawn either way.

## 4. Vercel authority boundary — established, not guessed

The block is **project-level, not target-level**:

| attempt | result |
| --- | --- |
| Production deploy → `thylora-library` | **403** — no permission to create a Production Deployment for this project |
| **Preview** deploy → `thylora-library` | **403** — no permission to create a Preview Deployment for this Vercel project |
| Create a brand new project | **succeeds** |

There is no bypass that keeps the customer URL. A `*.vercel.app` domain belongs to the
project holding it and cannot be reassigned without access to that project. A new
project means a new origin, a new `localStorage`, and therefore a signed-out Chairman
and another Supabase allow-list entry — the loop that is ruled out.

**Smallest human action:** grant the connected Vercel identity Member-or-higher access
to the `thylora-library` project, or move that project into the Thylora team where this
session can already create. One setting, no code change.

## 5. Shelf created — all DRAFT

Every sellable card carries all eight required fields.

| card | price | turnaround | status |
| --- | --- | --- | --- |
| **Fix My Offer** | $149 | 3 business days | DRAFT |
| **Turn My Story Into Content** | $249 | 5 business days | DRAFT |
| **Business Gap Scan** | $199 | 4 business days | DRAFT |
| **QYRIS Reasoning Engine** | not set | n/a | DRAFT · pre-runtime, not for sale |
| **QYRIS Friction Gate** | not set | n/a | DRAFT · pre-runtime, not for sale |

All three services: no shipping, no inventory tracking, refund on cancellation before
work starts, one free revision or refund after delivery, customer keeps the work either
way, customer owns the output outright, THYLORA keeps no licence and does not reuse the
work or train on it without written permission.

**Why DRAFT and not ACTIVE.** A turnaround is a promise to a paying stranger. Nobody has
confirmed who does the work or how fast, so price and turnaround are the Chairman's to
authorise, not mine. Each is tagged `price-proposed-not-authorized` and says so in the
card text.

**QYRIS claims nothing.** Both cards state there is no runtime, that they are not for
sale, that nothing is priced until it runs, and that rights terms will be written before
anything is ever sold.

**Protection watch.** The QYRIS cards carry price `0.00` and defaulted to
`requiresShipping: true`. If either were ever activated in that state, a stranger could
take nonexistent software for free and be asked for a shipping address. Neither may be
activated until a runtime exists, a price is set, and shipping is set false.

## 6. Chain

| step | verdict |
| --- | --- |
| PRODUCT | **PASS** |
| CHECKOUT | **FAIL** — no real storefront checkout observed |
| PAYMENT | **UNPROVEN — REAL MONEY NOT YET CAPTURED** |
| ORDER | **PASS** |
| WEBHOOK | **PASS** |
| ENTITLEMENT | **PASS** |
| DELIVERY | **PASS** |
| FIRST ACCESS | **PASS** |
| REACCESS | **FAIL** — 0 |

`first_failing_step: CHECKOUT` · `real_money_captured: false` ·
`can_take_first_customer: false`
