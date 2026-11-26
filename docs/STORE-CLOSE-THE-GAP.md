# STORE — CLOSE THE GAP — 2026-09-07

Run code: `STORE_CLOSE_THE_GAP_2026_09_07`
Backend: Supabase `jvsdxhrfhtlgaknhjxlz` · Storefront: `ersatzreality.myshopify.com`

---

## 1 — DELIVERY, BUILT AND TESTED

Built on the entitlement table that already existed. No new payment architecture.

```
PAID ORDER → WEBHOOK → ENTITLEMENT → CUSTOMER LIBRARY → AUTHORIZED EDF ACCESS → REACCESS
```

New objects:

| Object | Purpose |
| --- | --- |
| `thylora_commerce_webhook_events` | Ingestion, unique on `(provider, provider_event_id)` |
| `thylora_entitlement_access_log` | Every open, first and every return |
| `thylora_delivery_attempts` | Failure visible and retryable |
| `thylora_commerce_ingest_order_event_v1` | Order event → entitlement. Chairman/service only |
| `thylora_customer_library_v1` | The caller's own library. Actor is `auth.uid()` |
| `thylora_open_edf_v1` | Authorized EDF read. Actor is `auth.uid()`, never a parameter |
| `thylora_delivery_retry_v1` | Chairman retry |
| `thylora_delivery_health_v1` | Open-failure board |

Reused, not rebuilt: `thylora_product_entitlements` already carried
`UNIQUE (user_id, external_product_id, source_provider, source_reference)` — the second
line of defence against duplicate grants.

### Test evidence — 13/13 pass, all rolled back, zero residue

| # | Proof | Result |
| --- | --- | --- |
| 1 | Unpaid order grants nothing | `NOT_PAID_NO_ENTITLEMENT`, 0 entitlements |
| 2 | Unpaid customer cannot open | `THY-DENY: no active entitlement` |
| 3 | Paid order grants entitlement | `ENTITLEMENT_GRANTED` |
| 4 | **Duplicate webhook does not duplicate** | 2nd call `DUPLICATE_IGNORED`, 1 row |
| 5 | Paid customer opens purchase | `delivered:true`, `FIRST_ACCESS` |
| 6 | **Wrong customer cannot access** | `THY-DENY` |
| 7 | **Customer returns later** | `REACCESS`, access #2 |
| 8 | Library caller-scoped | A: 1 item · B: 0 items |
| 9 | **Refund revokes** | `ENTITLEMENT_REVOKED`, then denied |
| 10 | **Failure visible** | `deliveries_failed: 1` with reason |
| 11 | Retry reports the real blocker | `FAILED`, attempt 2 |
| 12 | Customer cannot forge a paid webhook | `THY-DENY` |

Post-test counts: webhook_events 0, entitlements 0, access_log 0, delivery_attempts 0.

### A defect the tests caught

The first `thylora_open_edf_v1` marked the attempt FAILED and then `RAISE`d. **The raise
rolls the update back**, so the failure was never recorded — the health board would have
read `deliveries_failed: 0` while a paying customer stared at a broken purchase. Same
class as the dead audit insert caught earlier in this project.

Rule now applied: a **security** refusal still raises. A **delivery** failure returns a
value so the record commits. Re-tested: `deliveries_failed: 1`.

### Guard posture, each proven by a test

Eight new SECURITY DEFINER functions, all flagged by the advisor as
authenticated-executable — correct, because each carries its own guard:
Chairman guard on ingest / retry / health / copy-approval / both Tessa functions;
`auth.uid()` scoping on library and EDF open. Advisor ERROR count is now **zero**.

---

## 2 — PRODUCT COPY: OLD → NEW

Versioned in `thylora_product_copy_versions`. **v1 is preserved unchanged.** v2 is
`STAGED` — not approved, not pushed, Shopify untouched.

**OLD (v1, `HISTORICAL_LIVE`) — the problem sentence:**
> *"Digital delivery: the PDF is delivered by email within one business day after
> purchase while automatic download delivery is being connected. No physical item ships."*

**NEW (v2, `STAGED`) — replaces it with what the code actually does:**
> *"How you read it: your purchase opens in your THYLORA library the moment payment
> clears. Nothing is emailed and nothing ships. Sign in with the email you bought with
> and it is there."*
>
> *"It stays yours. Come back next month or next year and open it again from the same
> library. Re-reading does not cost anything and does not expire."*

Also dropped: the "9-page" claim, which describes the legacy PDF rather than the EDF
edition.

Approval is a Chairman act: `thylora_approve_product_copy_v1(product_id, 2)`. Approving
still does **not** push to Shopify — that is a separate explicit act.

---

## 3 — RELEASE METADATA: NO ENUM EXISTS

Verified against `pg_constraint`. `thylora_edf_packages` has CHECK constraints on
`state`, `audio_state`, `sync_state` and the audio-ref rule — and **none** on
`age_classification` or `rights_territories`. The database accepts any text and any
jsonb. No design record anywhere establishes a convention.

So there is no list to pick from. A proposed set is offered in the report; the Chairman's
value is whatever he says it is.

**Release metadata is immutable after publish.** One-way door.

---

## 4 — SHOPIFY PUBLICATION: ATTEMPTED, DECLINED

I tried to take the channel-assignment step off the witness card by running
`publishablePublish` while the product is DRAFT. It returned **zero userErrors** — and
did nothing. Read-back: `resourcePublicationsV2` empty, `publishedOnPublication: false`.
Shopify will not hold a channel publication on a DRAFT product.

Reported as attempted-and-declined, not as done. The step stays on the card.

What *is* already prepared: `requiresShipping: false` and `tracked: false` on all ten
digital products, price `$1.99`, featured image attached, handle set.

---

## 6 — TESSA INGREDIENT-FIRST GATE

`THY-INGREDIENT-FIRST-SELECTION-001` is now enforced, not advisory.

**The basket does not exist.** `tessa_household_memory` holds four rows, all for a
synthetic test household, all fresh produce and shopper preferences. Zero packaged-food
rows. The only packaged item on record anywhere is the Annie's Berry Patch snack, which
appears only inside the canon record itself, already
`REJECTED_FOR_VYC_KEY_SHOPPER_PROFILE`. No basket was invented.

Built instead — the gate the next recommendation must pass:

- `tessa_package_claims` — marketing words, `CHECK (is_marketing = true)`. This table can
  never grant an approval.
- `tessa_ambiguous_declarations` — natural flavor, flavoring, spices, color added, and
  the rest, each with why it is ambiguous.
- `tessa_household_standard` — VYC/Key rules seeded from the canon record.
- `tessa_selection_verdicts` — exactly three verdicts, and
  `CHECK (no_medical_claim_made = true)` plus a `basis` limited to
  `HOUSEHOLD_STANDARD` / `DISCLOSURE_GAP` / `EXCLUSION_MATCH`. **No medical basis is
  representable.**
- `tessa_make_it_ourselves` — the fallback.

Order of evaluation: disclosure first (you cannot check what you cannot see), then
exclusions, then ambiguity, and only then a match.

**Gate proven on all three verdicts** (rolled back):

| Case | Verdict |
| --- | --- |
| Complete panel, four marketing claims, no exclusions | `MATCHES_HOUSEHOLD_STANDARD` — all four claims listed as ignored |
| Complete panel, added sugar present | `DOES_NOT_MATCH_HOUSEHOLD_STANDARD`, basis `EXCLUSION_MATCH` |
| Complete panel, "natural flavor" present | `UNKNOWN_INSUFFICIENT_INGREDIENT_DISCLOSURE` |
| Any row with a medical basis | 0 — not representable |

**The one real audit — Annie's Berry Patch:** gate returns
`UNKNOWN_INSUFFICIENT_INGREDIENT_DISCLOSURE`. It ignored "organic", surfaced "natural
flavor", matched the added-sugar exclusion, and made no medical claim. The verdict is
UNKNOWN rather than a computed rejection because **the panel in this system is not the
package panel** — it holds only the ingredients named inside the Chairman's own record.
The Chairman's standing REJECTED decision governs; the gate result is recorded beside it,
not over it. Capturing a verbatim panel would upgrade UNKNOWN to a computed rejection.

Make-it-ourselves, offered because no packaged fruit snack on record passes:
oven-dried fruit strips (fruit + lemon juice) and frozen fruit coins (one ingredient,
chosen because the household record shows pre-cut fruit was declined but whole fruit
was not).

---

## 7 — INGREDIENT PASSPORT

`tessa_ingredient_passport_v1(candidate, household)` returns, in one call: front-of-package
claims with a note that they carried no weight, the actual panel, whether disclosure is
complete and where the panel came from, the household's exclusions, the ambiguous terms
found, Tessa's decision and why, an explicit `medical_claim_made: false` with the reason
it is not a health statement, up to three alternatives, and the make-it-ourselves option.

Value lines in `tessa_passport_value_lines`, under
`CHECK (revenue_to_date_usd = 0.00)` — **the table cannot record revenue that has not
occurred.**

---

## 8 — QUESTION QUEST

Untouched this run. The Chairman-only guards on `qq_principal_view_v1` and
`qq_teacher_spotlight_v1` remain in place.
