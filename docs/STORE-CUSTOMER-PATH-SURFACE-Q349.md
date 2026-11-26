# Q349 — the customer path surface, the store's legal gap, and the payment unknown

Continuity: `THY-Q-20260909-ACTIVE-FRONT-OUTREACH-QYRIS-STORE-349`
Read from live records at `2026-09-09T16:23:36Z`.

`PAYMENT: UNPROVEN — REAL MONEY NOT YET CAPTURED.` Nothing in this document changes that.

---

## 1. The shelf is live

`https://thylora-store.vercel.app` — the DISCOVER → UNDERSTAND → BUY → PAY → RECEIVE → REACCESS
surface. It is a new Vercel project. It touches neither the library URL nor any session, so no
sign-in, magic link or reload was required to put it up.

Deployment is proved at the artifact level, not by the deploy response:

| check | value |
|---|---|
| status | `200` |
| content-type | `text/html; charset=utf-8` |
| bytes | `17150` |
| body md5 | `f7eed793c7a7dc4f7663af877774f224` |
| md5 of `surfaces/store-front/index.html` | `f7eed793c7a7dc4f7663af877774f224` |
| fetched by | `pg_net` from Postgres — container egress to `*.vercel.app` is blocked |
| CSP | `default-src 'none'` present on the response |
| `X-Frame-Options` | `DENY` |
| inline scripts | 0 — the page runs no JavaScript at all |
| secrets in body | 0 |

The two hashes match, so the bytes a customer receives are the bytes in the commit.

What it carries:

- **Open now** — one card. *Twelve Miles for Flour — An Unkle Seezin Trail Story*, $1.99, linking
  to the live Shopify product page.
- **Not open yet** — Fix My Offer, Turn My Story Into Content, Business Gap Scan. Each marked
  *not accepting orders*, each price marked *proposed, not yet authorized*.
- **Not for sale** — QYRIS Reasoning Engine, QYRIS Friction Gate. Each marked *not shipped, no
  runtime*, no price, no way to buy.

All eight required fields appear on all six cards: who it helps, problem, deliverable, price,
turnaround, rights, refund and cancellation, delivery proof.

### One thing I removed before deploying

The first build put a green status dot beside each of the six path steps, including **Pay**. The
same page's footer says `PAYMENT UNPROVEN`. A green dot next to "Pay" is a claim that paying works;
the footer is a measurement saying it has never been shown to. Two statements about the same thing,
one of them unearned. The dots are gone — the strip is now wayfinding only, and the footer table is
the only place the page says whether anything passed.

## 2. Gate measurement — what the page publishes

Every row comes from a live table. A step reads PASS only where a row exists.

| gate | state | basis |
|---|---|---|
| DISCOVER | PASS | this page returns 200 |
| UNDERSTAND | PASS | eight fields on every card |
| PRODUCT | PASS | EDF package PUBLISHED, 50 text blocks |
| CHECKOUT | **NOT PROVEN** | needs a real buyer through storefront checkout |
| PAYMENT | **UNPROVEN** | 0 rows in `thylora_payment_capture_witness` |
| ORDER | PASS | 2 orders ingested |
| WEBHOOK | PASS | 5 signed deliveries, HMAC verified |
| ENTITLEMENT | PASS | 2 active |
| DELIVERY | PASS | 2 delivered, 0 failed |
| FIRST ACCESS | PASS | 2 recorded |
| REACCESS | **0** | no second opening recorded |

## 3. The store had no refund policy and no terms

`shopPolicies` held exactly one entry: the Shopify-generated privacy policy. No refund policy, no
terms of service. On a store asking a stranger for money that is a real gap, not a formality.

Writing the Shopify policy slots was refused — `shopPolicyUpdate` needs `write_legal_policies`,
which this app does not hold. Both documents are published as store pages instead, and both were
fetched back to confirm they are actually serving:

- `https://ersatzreality.myshopify.com/pages/refunds-and-cancellation` — 200
- `https://ersatzreality.myshopify.com/pages/terms-of-sale` — 200

Both are linked from the shelf. **Still open:** the checkout footer links only the privacy policy,
because that footer is driven by the policy slots, not by pages. Filling the slots is Chairman-only.

The refund terms say what the product card already said, and nothing more: 30 days; refund if it
never opened, if it was not what the page said, or if it was bought twice; a refunded purchase
leaves the library. No jurisdiction or governing law is stated anywhere, because I do not know
which one applies and will not invent one.

## 4. The library fix is still not published — and the boundary is now exact

The corrected library page (commit `0804770`) is committed and still not live. This turn narrowed
the blocker from "403" to a specific, twice-measured boundary:

| attempt | result |
|---|---|
| `thylora-library`, target **production** | `403 forbidden` — "You don't have permission to create a Production Deployment for this project." |
| `thylora-library`, target **preview** | `403 forbidden` — "You don't have permission to create a Preview Deployment for this Vercel project: thylora-library." |
| `thylora-store`, target **production** | succeeded, live, verified |

So it is not an account limit and not a production-only limit. It is scoped to that one existing
project. The same integration created and published a new project to production minutes earlier.

I did not route around it. Standing up a substitute library on a new origin would give the Chairman
a new URL, and a new origin means empty `localStorage`, which means signing in again — which is
exactly what he has said he is done with.

Consequence while it stays unfixed: the live library can print `Opened again · visit N` from a
response that no committed access row backs. That is a display defect on a live customer surface.
It writes nothing false to the database.

## 5. The payment unknown, stated precisely

Whether a real customer's card would actually be charged is **UNKNOWN**, and it is material.

- `shopifyPaymentsAccount` is unreadable: *Access denied. Required access: `read_shopify_payments`
  or `read_shopify_payments_accounts`.*
- The only order that ever reached the gateway is **#1001** (2026-09-01): gateway
  `shopify_payments`, `test: true` on both the AUTHORIZATION and the CAPTURE.
- **#1002** and **#1003** carry `test: false` but hold **zero** transactions and a **$0.00** total.
  They are draft orders marked paid. They exercised the ingest and webhook path, which is what they
  were for. They say nothing whatever about the gateway.

So the last and only gateway evidence in existence says test mode was ON, dated eight days ago, and
the current state cannot be read. It stays UNKNOWN. It is not being reported as off, and it is not
being reported as on.

Ruled out separately: the sellable variant is not inventory-blocked. `inventoryQuantity` is `-2`,
which looks alarming, but `tracked` is `false` and `requiresShipping` is `false`, so the number is
inert and `availableForSale` is `true`.

## 6. Can a real customer buy right now?

**Not provably.** The shelf is live, the product is ACTIVE and reachable, the price is $1.99, the
variant sells, delivery and re-access work end to end on the records. What is missing is proof that
the checkout takes real money — and the only gateway evidence that exists says it was in test mode.

If Shopify Payments is still in test mode, a real buyer's card is simulated rather than charged, and
the sale is not a sale. That is the difference between no and yes, and it costs nothing to settle.
