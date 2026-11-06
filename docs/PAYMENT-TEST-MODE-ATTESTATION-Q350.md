# Q350 — test mode is attested OFF, and cannot be verified from here

Continuity: `THY-Q-20260909-PAYMENT-TEST-MODE-ATTESTATION-350`
Read at `2026-09-09T17:49:51Z`.

`PAYMENT: UNPROVEN — REAL MONEY NOT YET CAPTURED.` `CHECKOUT: NOT PROVEN.` Unchanged.

## What the Chairman said

Shopify Payments test mode is OFF. He looked at the setting himself.

Recorded as **ATTESTED**, not verified — `SHOPIFY-TEST-MODE-OFF-CHAIRMAN-ATTESTED-350`.

## Why it cannot be verified, and why that is not a scope problem

I assumed last turn that the payments read was blocked only by a missing scope. That was wrong,
and the correction matters more than the original claim.

`ShopifyPaymentsAccount` has **no test-mode field**. Its complete field list:

```
accountOpenerName  activated  balance  balanceTransactions  bankAccounts
chargeStatementDescriptors  country  defaultCurrency  disputes  id
onboardable  payoutSchedule  payoutStatementDescriptor  payouts
```

Granting `read_shopify_payments` would still not answer the question. The Admin API does not
expose test mode at all.

The other route also closes. A cookie-less fetch of the cart permalink
`/cart/43711382257741:1` returns `200` with canonical `https://ersatzreality.myshopify.com/` — the
home page. `pg_net` carries no cookies, so Shopify never renders a checkout page, so there is no
test-mode banner to read. That is a probe limitation, not a checkout defect, and it is not
reported as one.

## The consequence

**Test-mode confirmation is not an independent gate.** The only machine proof that test mode is
off is an order transaction carrying `test: false` on a real gateway with a positive amount — and
that is the same event that proves PAYMENT. I was treating them as two steps. They are one.

So the attestation changes no gate. It cannot: an attestation cannot create a capture witness, and
`thylora_payment_capture_witness` still holds **0 rows**. No witness was written.

## Live chain at read time

| gate | state |
|---|---|
| PRODUCT | PASS — PUBLISHED, 50 blocks |
| CHECKOUT | **NOT PROVEN** |
| PAYMENT | **UNPROVEN — REAL MONEY NOT YET CAPTURED** — 0 witnesses |
| ORDER | PASS — 2 |
| WEBHOOK | PASS — 5 verified deliveries |
| ENTITLEMENT | PASS — 2 active |
| DELIVERY | PASS — 2 delivered, 0 failed |
| FIRST ACCESS | PASS — 2 |
| REACCESS | **0** |

Orders unchanged: #1003 and #1002 are `test: false` but hold **zero** transactions at **$0.00** —
draft orders marked paid, counted as neither checkout nor payment. #1001 is the only order that
ever reached a gateway, and it ran `test: true` on both the authorization and the capture.

## The exact next remaining proof

One real purchase of *Twelve Miles for Flour* at $1.99, completed through the storefront checkout
by a buyer paying with a real card. That single event, and only that event, produces all three:

1. CHECKOUT passes — the storefront checkout was actually exercised.
2. PAYMENT passes — a capture arrives with `test: false`, gateway `shopify_payments`, amount `1.99`,
   which is what a witness row requires.
3. Test mode is proved off as a by-product, because a real capture cannot exist in test mode.

Nothing smaller substitutes. A discounted order, a draft order, a manual order, a $0.00 order, or
a test-gateway transaction produces none of the three, and must never be presented as if it did.
