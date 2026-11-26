# Q337 — First-sale path: what moved, and the defect found on the way

Run code: `Q337_FIRST_SALE_PATH`
Backend finding: `UNLINKED_BUYER_PAID_AND_RECEIVED_NOTHING`
(finding_id `99bb7031-43cf-4dc5-9234-81d5907f1139`, resolved)

## 1. EDF publish — verified, not assumed

`EDF-TWELVE-MILES-FOR-FLOUR-001`

| field | value |
| --- | --- |
| state | `PUBLISHED` |
| published_at | `2026-09-08T15:45:48.913407+00` |
| age_classification | `FAMILY` (by vyc2st@gmail.com) |
| rights | download ✓ stream ✓ `["WORLDWIDE"]` |
| manifest_hash | `643be4d0…a89032` |

The button press was not taken as proof. State was read back from
`thylora_edf_packages`, and deliverability was then proved separately.

## 2. Deliverability — proved, then rolled back

Executed against live tables inside a transaction that was rolled back:

| step | result |
| --- | --- |
| ingest paid order | `ENTITLEMENT_GRANTED` |
| entitlement | `ACTIVE` |
| delivery attempt | `DELIVERED`, attempt 1, no failure |
| first open | `delivered: true`, 50 blocks, 4,627 characters |
| second open | `delivered: true`, 50 blocks |
| access log | `FIRST_ACCESS` 1, `REACCESS` 1 |

Counters re-read afterwards: entitlements 0, delivery_attempts 0, access_log 0,
webhook_events 0. Nothing was left behind.

## 3. The defect

Copy v2 had been approved by the Chairman at `2026-09-08T16:53:01Z` but never
pushed, so the live product still promised *"the PDF is delivered by email within
one business day"* — a manual commitment nobody is staffed to keep. v2 was pushed
to Shopify and recorded `PUSHED`; v1 is `SUPERSEDED`. The new copy promises:

> your purchase opens in your THYLORA library the moment payment clears … Sign in
> with the email you bought with and it is there.

Checking whether that promise was true is what found the defect.

**Webhook v3 resolved the buyer only through `thylora_commerce_identity_aliases`
and answered any unmatched checkout email with `409 BUYER_IDENTITY_NOT_LINKED`,
granting nothing.** Exactly one alias existed in the entire system. Every buyer on
Earth except the Chairman would have paid $1.99 and received nothing —
permanently, unrecoverably — while the page promised them their library.

The product was returned to `DRAFT` within about three minutes of going live, with
zero orders in the window.

## 4. The fix

| checkout email | before | now |
| --- | --- | --- |
| has a commerce alias | granted | granted (unchanged) |
| a **confirmed** account holds it, no alias | **409, nothing** | alias linked, granted |
| nobody holds it yet | **409, nothing** | order witnessed, `PENDING` claim held |

A held claim is released **only to a confirmed address** — that is what stops
someone signing up as a stranger to take what the stranger bought. Held claims now
return **200, not 409**: a 409 makes Shopify retry the same order for days and
still deliver nothing while the money is already taken.

`thylora_customer_library_v1` now releases pending claims when the buyer opens
their library, so **no frontend release was required** — the already-deployed panel
works unchanged. That function moved from `STABLE` to `VOLATILE`, since a claim
performs writes.

New: `thylora_pending_entitlement_claims`,
`thylora_commerce_record_unlinked_purchase_v1` (trusted server only),
`thylora_claim_pending_entitlements_v1` (authenticated), and
`thylora_current_confirmed_email()`. Webhook redeployed as **v5**; the signature
check is byte-for-byte unchanged from v1.

### Tested — 11 properties, all against live tables, all rolled back

1. New buyer, no account → claim held
2. Confirmed account without alias → linked and granted
3. Unpaid order → no claim held
4. Ordinary customer calling the claim-recording RPC → refused, `insufficient_privilege`
5. Stranger calling claim → 0 claimed
6. Unconfirmed address → 0 claimed, returned as a reason rather than raised
7. Buyer claims → 1 granted
8. Opens after claim → `delivered: true`
9. Second claim → no-op, exactly 1 entitlement
10. RLS → buyer sees only their own claim; a stranger sees zero
11. End to end → claim, signup, library releases, 50 blocks, re-open, access log correct

The first RLS policy read `auth.users` directly, which role `authenticated` cannot
select — a real customer would have hit *"permission denied for table users"*. It
now routes through `thylora_current_confirmed_email()`, and was re-tested.

## 5. Unrelated exposure closed in the same pass

`thylora_commerce_event_witness_v1` was a `SECURITY DEFINER` view carrying default
grants, so the **anon** role could read commerce evidence — order references, shop
domain, buyer email domains, delivery timestamps — with only the publishable key.
Set to `security_invoker = on`; anon and authenticated grants revoked.
`thylora_first_sale_chain_v1` still reads it (verified_deliveries still 1).

## 6. Chain state

| step | pass | note |
| --- | --- | --- |
| PRODUCT | ✅ | EDF `PUBLISHED`, 50 blocks, rights recorded |
| CHECKOUT | ❌ | product now ACTIVE and published; awaiting a real checkout |
| PAYMENT | ❌ | `shopify_payments` ENABLED ≠ TESTED. Live capture unobserved |
| WEBHOOK | ✅ | signed delivery `f54dc44f…`, HMAC verified |
| ORDER | ❌ | no real paid order yet |
| ENTITLEMENT | ❌ | needs a real paid order |
| DELIVERY | ❌ | needs a real paid order |
| RE_ACCESS | ❌ | needs a delivery, then a second open |

Live: `https://ersatzreality.myshopify.com/products/twelve-miles-for-flour-an-uncle-seezin-trail-story`
ACTIVE, $1.99, published to Online Store, Shop, Microsoft Copilot, `availableForSale: true`.

## 7. Still open, stated plainly

- **No customer-facing library page.** `thylora_customer_library_v1` and
  `thylora_open_edf_v1` are per-user and work, but the only page calling them is the
  Chairman dashboard `index.html`. A public buyer has nowhere of their own to sign in
  and read. Their money is no longer lost — the claim is durable and converts — but
  delivery to a stranger is not yet a finished experience. This is the next build,
  and it needs a Vercel release.
- Live payment capture untested.
- Mobile shelf preview unwitnessed.
- No refund policy, no terms of service.
- Cover gate `THY-REVIEW-TWELVE-MILES-COVER-001` still OPEN.
