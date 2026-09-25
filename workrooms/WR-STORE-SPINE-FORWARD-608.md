# WR-STORE-SPINE-FORWARD-608 — Store Evidence Report

Backend head: `THY-GLOBAL-HELP-PATH-608`
Programs: `THY-SPONSOR-ACCESS-CREDITS-609`, `THY-ERSATZ-CREATOR-NETWORK-001`
Readback date: 2026-09-25 (≈13:10–13:40 UTC)
Sources read (read-only, nothing written to either system):

- Supabase `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`): `products`, `thylora_store_product_readiness`,
  `thylora_store_release_gate`, `thylora_product_release_decisions`, `thylora_edf_packages`,
  `thylora_product_entitlements`, `thylora_payment_capture_witness`, `thylora_commerce_provider_authority`,
  `thylora_store_policy_registry`, `prices`, `orders`, `payments`, `digital_product_passports`,
  `program_registry`, `thylora_workroom_registry`, `thylora_workroom_task_registry`, `qq_price_estimates`.
- Shopify Admin API, store `ersatzreality.myshopify.com` (plan: Basic, USD): product status,
  publication and `publishedAt` read live.

Nothing in this document changes a product state. No product was activated, published, repriced or renamed.

---

## 0. Finding that outranks everything else — unrecorded storefront activation today

Shopify reports three products **ACTIVE and published to the Online Store at 2026-09-25 12:59:55–56 UTC**:

| Product | Shopify ID | SKU | Price | `publishedAt` |
|---|---|---|---|---|
| THYLORA Question Deck — 50 Better Questions | 7957199913037 | THY-Q-DECK-050 | $12.00 | 2026-09-25T12:59:56Z |
| THYLORA Gap Hunt — 21 Things You're Not Seeing | 7957199749197 | THY-GAP-HUNT-021 | $7.00 | 2026-09-25T12:59:55Z |
| Build a World From One Idea — THYLORA Starter Kit | 7957200109645 | THY-WORLD-KIT-001 | $19.00 | 2026-09-25T12:59:56Z |

The backend doesn't match. For all three, `thylora_store_product_readiness` still reads
`product_state = DRAFT`, `active_allowed = false`, `checkout_path_verified = false`,
`mobile_preview_passed = false`, `reaccess_verified = false`. No readback snapshot, movement-map
row or release-gate row was written on 2026-09-24 or 2026-09-25. The latest release decisions on record are
2026-09-19 (Question Deck) and 2026-09-08 (Gap Hunt, Build a World).

**The buyer consequence.** `thylora_edf_packages` holds exactly one PUBLISHED package:
`EDF-TWELVE-MILES-FOR-FLOUR-001`. None of the three live products has an EDF, so
`thylora_open_edf_v1` returns `NO_PUBLISHED_EDF`, which the readiness row records as a synthetic failure.
Their protected-download assets (`THY-DELIVERY-0CE19B19BC288F59`, `THY-DELIVERY-8658F16FFC521665`,
`THY-DELIVERY-589D0EC598F737C1`) are `STAGED`, and `thylora_product_download_audit` has 0 rows, so no
protected download has ever been served. A buyer can pay today and has no witnessed way to receive the file.

**Decision required (Chairman only).** Pick one:
1. Confirm the activation was intended, then Chairman-publish the three EDF packages and run one real
   checkout per SKU before any promotion, or
2. Return the three products to DRAFT on Shopify until items 1–3 in §2 pass.

I didn't reverse the change. Store status is Chairman authority, and the activation may have been
deliberate. It's recorded here so it's visible.

---

## 1. Numbered evidence report

Status key: **ACTIVE** means sellable, with every gate evidenced. **DRAFT** means a real artifact exists but gates are
still open. **BLOCKED** means a named hard dependency is missing. **UNKNOWN** means the records don't settle it.

| # | Product (preserved name) | ID / continuity | Status | Evidence basis |
|---|---|---|---|---|
| 1 | Twelve Miles for Flour — An Unkle Seezin Trail Story | Shopify 7957652275277 · EDF-TWELVE-MILES-FOR-FLOUR-001 · SKU ER-UNKLE-SEEZIN-FLOUR-001 | **ACTIVE** | Release gate `RELEASED_SELLING`. Live capture order #1004, $1.99, `test=false`. Webhook v5 grants the entitlement. EDF PUBLISHED. First access and re-access witnessed 2026-09-16. Rights WORLDWIDE. External customer #1 still reserved/unmet. |
| 2 | THYLORA Question Deck — 50 Better Questions | 7957199913037 · THY-DELIVERY-0CE19B19BC288F59 | **UNKNOWN** (Shopify ACTIVE / backend DRAFT) | See §0. Artifact cleared 2026-09-19. Rights and cover approved. No EDF. Checkout never exercised for this SKU. |
| 3 | THYLORA Gap Hunt — 21 Things You're Not Seeing | 7957199749197 · THY-DELIVERY-8658F16FFC521665 | **UNKNOWN** (Shopify ACTIVE / backend DRAFT) | Same as #2. 9-page artifact, sha256 8658f16f…. |
| 4 | Build a World From One Idea — THYLORA Starter Kit | 7957200109645 · THY-DELIVERY-589D0EC598F737C1 | **UNKNOWN** (Shopify ACTIVE / backend DRAFT) | Same as #2. |
| 5 | Bramble Wick — The Lantern That Wouldn't Go Out | 7956697448525 · THY-DELIVERY-6C7891CF5FCFF948 | **BLOCKED** | Chairman HOLD 2026-09-19. No interior of record after sequence 549. WYCK name-lock, planet-spelling and unregistered-person (Mara Vale) rulings are open. |
| 6 | The Last Match — A THYLORA Family Story About Legacy | 7957206630477 | **DRAFT** | Quality rebuild required. Rights passed, delivery connected. |
| 7 | The Handoff — A THYLORA Story About Leadership and Change | 7957206958157 | **DRAFT** | Quality rebuild required. |
| 8 | The City That Needed More Power — A THYLORA Science Story | 7957206892621 | **DRAFT** | Quality rebuild required. |
| 9 | Trail Table No. 001 — Unkle Seezin's Rain-Side Beans | 7956697481293 · EDF-TRAIL-TABLE-001 (DRAFT) | **BLOCKED** | Origin of preserved source `libfile_2d930ec5…` unrecorded (sequence 536). One Chairman sentence unblocks it. |
| 10 | C&W Vehicle Civilization — Engineering Notebook Vol. 1 | 7985315577933 | **BLOCKED** | No cover. AUTO-VISUAL-GATE-001 needs a Chairman cover brief. Price $29 not confirmed. |
| 11 | Eight Things Cars Still Get Wrong — A C&W Design Notebook | 7985698275405 | **BLOCKED** | Duplicates Vol. 1. Chairman must choose withdraw or reposition. |
| 12 | THYLORA Bounded Problem-to-Value Diagnostic — Founding Pilot / THYLORA Value Current — Founding Reading | 7956692598861 · THY-DIAG-PILOT-001 | **BLOCKED** | $295 configured. Refund terms UNKNOWN. Delivery process not witnessed end to end. Rights unverified. |
| 13 | Question Quest — Family Pilot | QQ-FAMILY-PILOT-001 | **BLOCKED** | Only one concept is built. Child-data privacy review is not cleared. Price NOT_SET. |
| 14 | THYLORA Anywhere Portrait | 7965307142221 | **BLOCKED** | No artifact. Likeness policy undefined. Demand test first. |
| 15 | Postcard From Anywhere | 7965990355021 | **BLOCKED** | Price authorized ($12.99). No submit, consent or delivery mechanism. |
| 16 | Turn My Story Into Content | 7964844032077 | **BLOCKED** | Price not authorized. Scope undefined. |
| 17 | HERB FILE 001 — ROSEMARY / EDEREAIRAH NAME PENDING | HERB-FILE-001-NO-PROVIDER-OBJECT | **BLOCKED** | Botanical claims gate is DRAFT_INTERNAL. No artifact. |
| 18 | 7 Days Off-Screen - Family Adventure Pack | THY-DIGITAL-FAMILY-OFFSCREEN-001 · THY-DPP-OFFSCREEN-001 | **DRAFT** | Rights cleared. Price pending Chairman. No Shopify object in the readiness table. |
| 19 | The People Who Build the World — ErsatzReality Headquarters Coloring & Story Book | ER-PRODUCT-HQ-PEOPLE-COLORING-001 | **DRAFT** | $3.99 configured, approved. Rights unverified. |
| 20 | The Peete Crown Child Coloring Story | THY-COLOR-PEETE-CROWN-CHILD-001 · DPP-THY-PEETE-CROWN-CHILD-001 | **BLOCKED** | Serial and creator-ID conflict in the DPP. Rights unverified. |
| 21 | NSSM 200 line (PDF, EDF, The Population Memorandum, Documentary, Policy Room) | THY-PRODUCT-NSSM200-* | **DRAFT** | Planned. Price pending. Rights unverified. |
| 22 | ErsatzReality planned catalogue (Continuum Record, Living Warehouse, Bramble Wick Nighttime Story, Family Story Starter, Understanding Cooking, Era Worlds, ERFL ×2, Farm-Fed Spicy Steak, Family Keepsake Layout, Court Programming, Understanding News, Music by Candlelight, Field Notebook, Evidence Kit, Archive Art Print, Tee, Hat) | ER-PRODUCT-* / ER-DIGITAL-* / ER-MERCH-* / KIT-STEAK-001 | **DRAFT** (planned) | No artifacts or prices. Rights unverified. |
| 23 | Green Milk — A VYC Original | 7978983293005 | **DRAFT** | $0.00. No media. No readiness row. |
| 24 | Deep-View concept set and Kylie/KYLEE Jane minis (≈30 Shopify objects tagged NOT-FOR-SALE / PRICE-NOT-SET) | 79673xxxxx | **DRAFT** (concept) | Descriptions state "NOT OPEN FOR ORDERS". |
| 25 | Memberships (Free, $3.99, $5.99, $7.99, $14.99, Enterprise) | `prices` membership rows | **BLOCKED** | Recurring checkout not proven (public-site/store.html states this). |
| 26 | THYLORA P0 Stripe Integration TEST | THY-P0-STRIPE-INTEGRATION-TEST | not a product | Private test fixture. |

Open cross-record discrepancy, recorded and not reconciled: `THY-COMMERCE-PROVIDER-AUTHORITY-001`
says `payment_provider = STRIPE`, but the live capture gateway is `shopify_payments`. That row is
Chairman-owned.

---

## 2. Next three products that can become ACTIVE from existing evidence

These three are the only products with a finished artifact, passed rights, an approved cover, an approved
title/price/direction (`chairman_decision_2026_09_17.commercial_approval = APPROVED_TITLE_PRICE_PRODUCT_DIRECTION`),
a staged delivery asset and a Shopify object. The same three went live today without backend
evidence (§0). Evidence gets them to a real ACTIVE. Nothing new needs to be built.

The seven-point gate from the brief, applied:

| Gate | Question Deck | Gap Hunt | Build a World |
|---|---|---|---|
| Digital file exists | ✅ THY-DELIVERY-0CE19B19BC288F59 | ✅ THY-DELIVERY-8658F16FFC521665 (9 pp, 31,963 B) | ✅ THY-DELIVERY-589D0EC598F737C1 |
| Preview matches product | ⚠️ Preview surface exists. `preview_delivery_state = PENDING_CHAIRMAN_DEVICE_WITNESS`. Mobile preview not passed. | ⚠️ same | ⚠️ same |
| Ownership/licence recorded | ✅ `rights_passed`, `chairman_rights_confirmed_at` 2026-09-08 | ✅ | ✅ |
| Price authorized | ✅ $12 | ✅ $7 | ✅ $19 |
| Checkout connected | ⚠️ Store checkout is live, but never exercised for this SKU | ⚠️ | ⚠️ |
| Delivery defined | ❌ No published EDF, so the reader returns NO_PUBLISHED_EDF. Protected download never served. | ❌ | ❌ |
| Truthful description | ✅ copy live on Shopify | ✅ | ✅ |

### 2.1 THYLORA Question Deck — 50 Better Questions
- **Price:** $12.00 (SKU THY-Q-DECK-050)
- **Customer:** adults who want better answers at work, at home or in study, and families who ask questions together
- **Deliverable:** a digital question-card deck (PDF), read in the THYLORA library
- **Rights status:** passed. Chairman confirmed 2026-09-08. Release decisions 2026-09-08 and 2026-09-19 carry `rights_release_confirmed = true`.
- **Delivery path:** Shopify checkout → `orders/paid` webhook v5 → `thylora_product_entitlements` → THYLORA library (`https://thylora-library.vercel.app`) → `thylora_open_edf_v1`. **The last hop fails today.**
- **Store URL:** https://ersatzreality.myshopify.com/products/thylora-question-deck-50-better-questions
- **Exact blocker:** (1) The EDF package isn't created or published. `thylora_is_chairman()` gates this, so it needs a Chairman session. (2) One real checkout for SKU THY-Q-DECK-050 isn't witnessed. (3) The mobile preview witness is missing. (4) The backend readiness row isn't reconciled with today's Shopify ACTIVE state.
- **Equation:** `$12.00 − $0.65 fees − T tax − ~$0.00 delivery = $11.35 − T`

### 2.2 THYLORA Gap Hunt — 21 Things You're Not Seeing
- **Price:** $7.00 (SKU THY-GAP-HUNT-021)
- **Customer:** people who run a project, job or household and want to find the unowned or unwritten gaps
- **Deliverable:** a 9-page digital activity guide (PDF)
- **Rights status:** passed (same record basis as 2.1)
- **Delivery path:** same chain as 2.1. The EDF hop fails today.
- **Store URL:** https://ersatzreality.myshopify.com/products/thylora-gap-hunt-21-things-you-re-not-seeing
- **Exact blocker:** the same four items as 2.1, for SKU THY-GAP-HUNT-021
- **Equation:** `$7.00 − $0.50 fees − T tax − ~$0.00 delivery = $6.50 − T`

### 2.3 Build a World From One Idea — THYLORA Starter Kit
- **Price:** $19.00 (SKU THY-WORLD-KIT-001)
- **Customer:** writers, game-makers, teachers and families who build stories or worlds
- **Deliverable:** a digital world-building starter kit (PDF)
- **Rights status:** passed (same record basis as 2.1)
- **Delivery path:** same chain as 2.1. The EDF hop fails today.
- **Store URL:** https://ersatzreality.myshopify.com/products/build-a-world-from-one-idea-thylora-starter-kit
- **Exact blocker:** the same four items as 2.1, for SKU THY-WORLD-KIT-001
- **Equation:** `$19.00 − $0.85 fees − T tax − ~$0.00 delivery = $18.15 − T`

### 2.4 How each equation term was filled
- **payment:** the Shopify variant price. Sales tax is collected on top at checkout, so it passes through: `T` is removed here only so the equation stays honest if a jurisdiction treats the price as tax-inclusive. `tax_ready = false` on every release gate, so **T is UNKNOWN per buyer location.**
- **fees:** the published Shopify Payments rate for the Basic plan, US online card, **2.9% + $0.30**. This is not yet witnessed from a payout. The Admin API denied `shopifyPaymentsAccount` (missing scope `read_shopify_payments`), so order #1004's actual fee couldn't be read. Refunds and chargebacks are $0 on record, with the refund window at 14 days (`THYLORA Digital Product Refund Policy`).
- **delivery cost:** EDF reads come from Supabase and the library from Vercel. No per-delivery metering exists, so this is recorded as **~$0.00, UNKNOWN**, not zero.

For reference, the live product: **Twelve Miles for Flour** `$1.99 − $0.36 − T − ~$0.00 = $1.63 − T`.
At $1.99, the $0.30 fixed fee takes 18% of the payment.

---

## 3. The $1 pilot item — NOT BUILT

`THY-SPONSOR-ACCESS-CREDITS-609.next_action` asks for a "$1 test reconciliation before public
offering". I didn't build it, because no real digital fulfilment path exists at $1. The exact missing dependencies:

1. **No $1 product with a published delivery artifact.** Only one EDF is PUBLISHED, and it belongs to a $1.99
   product. Selling it at $1, or creating a new $1 SKU, is a price change that needs Chairman authorization. None exists.
2. **No credit-redemption mechanism.** Nothing converts a sponsor payment into a spendable credit.
   No Shopify gift-card or discount object and no `sponsor_credit` ledger table exist. `commerce_credit_policy`
   and `qq_credit_ledger` belong to other lanes.
3. **No sponsor agreement, no approved rates (a, b, v, o, r), and no partner has accepted terms**
   (`unresolved` in the 609 record).
4. **Fee reality at $1:** `$1.00 − $0.33 fees − T − ~$0 = $0.67 − T`. The $0.30 fixed fee takes a third of the
   pilot, and that belongs in the sponsor report.

The smallest honest pilot once 1–3 exist: one sponsor pays $1 → one credit is issued → one beneficiary
redeems Twelve Miles for Flour through a 100%-discount code tied to the credit (the mechanism that zero-cost
order #1002 already proved) → a two-person reconciliation of payment, allocation and redemption.

---

## 4. Drafts prepared (not published)

- `store/drafts/PRODUCT-DRAFTS-A-F.md`: the six product drafts A–F
- `store/programs/THY-SPONSOR-ACCESS-CREDITS-609-TERMS.md`: sponsor terms, consent, splits, allocation, refunds, reporting
- `store/flows/THANK-YOU-FLOW.md`: buyer thank-you, consent and privacy flow
- `store/store-evidence-20260925.json`: machine-readable version of §1–§3

---

## 5. Next action (no new idea required)

**Resolve §0 now, while it's a one-hour-old state change.**
The Chairman signs in to the THYLORA library/dashboard, creates and publishes the three EDF packages
for Question Deck, Gap Hunt and Build a World from their existing delivery assets (this is the step that
`thylora_is_chairman()` gates), then makes one real $7 Gap Hunt purchase on a phone and witnesses
checkout → entitlement → library open → re-open.
That single purchase closes the checkout, delivery and mobile-preview gates for the cheapest of the three,
and the same steps repeat for the other two. If that can't happen today, return the three
products to DRAFT on Shopify until it can. Twelve Miles for Flour stays ACTIVE either way, as the traffic product.
