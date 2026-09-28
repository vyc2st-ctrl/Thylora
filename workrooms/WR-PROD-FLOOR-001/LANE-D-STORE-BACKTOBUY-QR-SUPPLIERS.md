# LANE D · Store / Back-to-Buy / Family Seal QR / Supplier Bridge

**Workroom:** WR-PROD-FLOOR-001 · **Date:** 2026-09-28
**Owner department (existing canon):** `THY-DEPT-STORE-OPS-001` Store Operations & Release. Its record reads: "Own store truth, shelf readiness, QR destinations, checkout, delivery, re-access, pricing…"
**Supporting departments (existing canon):**
- `THY-DEPT-LICENSING-DISTRIBUTION-001` (supplier and licensee structures)
- `WORLD_ADMISSION_COMMITTEE` (reviews Earth businesses before they join the EdereAirah business network)
- `FOOD_INGREDIENT_INVESTIGATION` (Mara Ellison, tribunal member — food and herb evidence)
- `DEPT-LEGAL-COMP-001` (Elena Marrow for privacy and consumer protection; Omar Kline for contracts)

**Store truth at read time (backend, 2026-09-28):**
- `products` 28 rows; `orders` 1; `payments` 1; `entitlements` 1; `thylora_store_shelves` 13; `thylora_store_product_readiness` 14 (these rows are hidden from the Chairman; see Lane C / DASHCUT-0001).
- **THY-DS-CURRENT-STORE-20260910:** "Shopify product is ACTIVE/PUBLISHED, but THYLORA active_allowed=false. Real-money checkout witness=0."
- THY-DS-P0-COMMERCE-PROOF and THY-DS-LEMON-P0 are VERIFIED (test path).
- A non-Chairman reads **0** products. The public policy only exposes products that are published, have verified release evidence, and are cleared for rights and privacy, and no row currently meets all of those.

That is the honest starting point. **Nothing is purchasable by the public today.** This lane builds the surface and the rules so that when products clear, they arrive inside a working structure rather than on a shelf of unrelated items.

**Code shipped in this lane (dependency-free ES modules, same style as `rae-link/lib`):**

| File | What it is | Tests |
|---|---|---|
| `store/lib/backtobuy.js` | N = G − T − F − P − R, B = N × s in integer cents; campaign gate; refunds; reserve release; buyer receipt | 10 |
| `store/lib/qrseal.js` | Family Seal QR validator, short codes with check symbol, seal issuance, scan witness | 6 |
| `store/lib/supplier.js` | Supplier qualification engine; designation computed from evidence, expires, suspends, revokes | 4 |
| `tests/store.test.mjs` | 20 tests, **20 pass** | — |

---

## 1 · Navigation by person / context

The store opens on **doors**, not departments or product categories. Each door answers "what do you need right now" and leads first to **free help** where it exists, then to useful products, and only then to support or participation.

**Status labels:**
- **LIVE** — the surface exists in the repo or backend today.
- **BUILT_NOT_LIVE** — code exists but it is not deployed or not released.
- **QUEUED** — waiting on a named dependency.

| Door | Who it is for | First thing shown (free) | Then | Then (support / participate) | Status of each target |
|---|---|---|---|---|---|
| **I NEED HELP** | someone with a live problem: a bill, landlord, school, benefits | Help Desk intake (Lane G `helpdesk/lib/intake.js`), which returns all missing items at once and a resource route | Case Organizer Kit (printable packet template) | Back-to-Buy campaign for them, if they choose it and pass the gate | Intake: BUILT_NOT_LIVE · Kit: QUEUED (Lane G product) · Back-to-Buy: BUILT_NOT_LIVE |
| **I'M A PARENT** | guardian | Family Membership explanation ($5.99/mo, "Guardian-oriented controls are required" — from `public-site/store.html`) and free school-help questions | Kid-learning derivatives (Lane A animal cards, Question Quest) | Education support campaigns | Membership price: approved in backend, recurring checkout not proven · Question Quest: `THY-QUESTION-QUEST-PRODUCT-001` IMPLEMENTATION_ACTIVE |
| **I'M A STUDENT** | learner | Free explainers (Lane F evidence method, Lane A biome physics) | Study packs | Education support | QUEUED on first released PDF |
| **I'M A TEACHER** | educator | Teacher Understanding Spotlight (`THY-TEACHER-SPOTLIGHT-PRODUCT-001`) | Classroom kits and licensing | Classroom sponsorship | IMPLEMENTATION_ACTIVE (backend design record) |
| **I RUN A BUSINESS** | owner or operator | Business Residency explanation ($14.99/mo) and the Supplier Bridge application (§4) | Supplier orders and designs | THYLORA-Approved designation (earned, not bought) | Membership: approved price · Supplier Bridge: BUILT_NOT_LIVE |
| **I'M A CREATOR** | maker, artist, writer | RAE Link Creator Studio: the rights gate runs locally before upload (`rae-link/`) | Creator Membership ($7.99/mo) | Creator support campaigns | RAE Link surface: BUILT, migrations not applied (WR-RAELINK-001 B1/B2) |
| **I WANT TO SUPPORT SOMEONE** | buyer who wants the purchase to help | Campaign page: who it is for (by seal, not name unless consented), the cause, the **support %**, and the payout math | Useful products that carry the campaign | Receipt showing every term (§2.5) | BUILT_NOT_LIVE |
| **I WANT A PLACE IN OUR WORLD** | person or business seeking EdereAirah presence | Plain explanation of what a place is and is not (simulation; no Earth property, no Earth money conversion; Lane H) | World Admission Committee review (existing department) | Business Residency | Committee exists in canon; the process is QUEUED |
| **I WANT TO BUILD WITH THYLORA** | partner, licensee, investor | Licensing and territory structures (`THY-DEPT-LICENSING-DISTRIBUTION-001`) | Creator Network and franchise packs (`WR-ERSATZ-CREATOR-NETWORK-001`) | Executive Opportunity Desk (`WR-EXECUTIVE-OPPORTUNITY-001`) | Existing workrooms |

**Navigation rules:**
1. Free help is never behind a purchase.
2. No person in crisis is charged for the basic route.
3. Every door shows its status honestly: a membership whose recurring checkout is unproven says so, exactly as `store.html` already does.
4. A product appears under a door only when the product row passes the existing public-read policy (published + verified + cleared).

## 2 · Back to Buy

### 2.1 The math (meets the MATH RULE)

```
N = G − T − F − P − R          (1)
B = ⌊ N × s_bp / 10 000 ⌋      (2)
H = N − B                      (3)
```

| Symbol | Meaning | Unit | Domain |
|---|---|---|---|
| `G` | gross sale, what the buyer paid | integer cents (USD minor units) | G ≥ 0 |
| `T` | tax collected and remitted | cents | T ≥ 0 |
| `F` | payment and platform fees (processor + marketplace) | cents | F ≥ 0 |
| `P` | production and fulfillment cost (making, packing, shipping) | cents | P ≥ 0 |
| `R` | refund reserve held back | cents; either explicit or `⌊G × reserve_bp / 10 000⌋` | 0 ≤ reserve_bp ≤ 2 000 (0–20%) |
| `N` | net distributable | cents | floored at 0; a negative raw value is reported as `shortfall`, never as negative benefit |
| `s_bp` | disclosed recipient support share | basis points (1 bp = 0.01%) | 1 ≤ s_bp ≤ 10 000 |
| `B` | recipient / family / fund benefit | cents | 0 ≤ B ≤ N |
| `H` | THYLORA's remaining share (covers operations and reinvestment) | cents | H = N − B |
| `⌊·⌋` | floor (round down to a whole cent) | — | — |
| `−`, `×`, `/` | ordinary subtraction, multiplication, division | — | — |

- **Class:** FORMAL SYSTEM LAW. (1) and (3) are accounting identities. (2) is a disclosed contract term. None of it is physics.
- **Threshold:** a campaign may not take a sale until `campaignGate()` returns `open: true`.
- **Assumptions:**
  - Tax is computed by the checkout provider for the buyer's jurisdiction.
  - Fees are the processor's actual charge on that transaction, not an estimate.
  - Costs P are the actual cost of the unit sold.
- **Failure conditions:**
  - Any float or negative input is refused.
  - `B + H ≠ N` throws.
  - An undisclosed share blocks the campaign.
- **Rounding:** only the floor in (2) rounds. The sub-cent remainder is returned as `sub_cent_remainder` so it is visible.
  - Across a campaign, B is computed once on the summed N (`settleCampaign`). Rounding per sale can only under-pay the recipient; summing first removes that bias, and the test asserts `recipient_gain_vs_per_sale ≥ 0`.

### 2.2 Worked example (a test in `tests/store.test.mjs`)

One $35.00 shirt, 25% support, 5% refund reserve. The tax and fee rates below are illustrative only; real values come from the checkout provider.

| Term | Value | Basis |
|---|---|---|
| G | 3 500¢ | $35.00 |
| T | 210¢ | 6% sales tax, illustrative |
| F | 132¢ | 2.9% + $0.30 processor pattern: ⌈101.5⌉ + 30, illustrative |
| P | 1 450¢ | blank shirt + print + pack + ship, illustrative |
| R | 175¢ | 500 bp × 3 500 |
| **N** | **1 533¢ = $15.33** | 3 500 − 210 − 132 − 1 450 − 175 |
| **B** | **383¢ = $3.83** | ⌊1 533 × 2 500 / 10 000⌋ = ⌊383.25⌋ |
| H | 1 150¢ = $11.50 | 1 533 − 383 |
| sub-cent remainder | 0.25¢ | shown, not hidden |

The buyer's receipt reads (generated by `receipt()`):

```
BACK TO BUY · Rent support · for Family Seal K7Q
Gross $35.00 − tax $2.10 − fees $1.32 − making & shipping $14.50 − refund reserve $1.75 = net $15.33
Support share 25% of net → $3.83 to Family Seal K7Q. THYLORA keeps $11.50.
```

**What this example teaches:** a 25% support share on a $35 shirt is $3.83, not $8.75. The buyer sees exactly why before paying. That honesty is the product.

### 2.3 Conservation proof

`tests/store.test.mjs` runs 5 000 random sales (seeded) and asserts `B + H = N`, `B ≥ 0` and `N ≥ 0` for every one. It also asserts that when costs exceed gross, the sale reports `NO_DISTRIBUTABLE_NET` with the exact shortfall.

### 2.4 Refunds and reserve

- A refund draws on the reserve first. Only the excess becomes a deduction carried against future N.
- **Benefit already paid is never clawed back from the recipient** (`recipient_clawback: 0`, asserted).
- When the refund window closes, the unused reserve is released through the same split (`releaseReserve`), so the recipient receives s of it too.

### 2.5 Campaign gate — every condition checked at once

`campaignGate()` returns **all** blockers in one call. Each carries a code and a plain-language detail:

| Code | Rule |
|---|---|
| UNKNOWN_CAUSE | cause must be one of the seven programs below |
| SUPPORT_SHARE_INVALID | 1–10 000 bp |
| SUPPORT_SHARE_NOT_DISCLOSED | the public text must state the % |
| PAYOUT_MATH_NOT_PUBLISHED | (1) and (2) must be shown to buyers |
| RECIPIENT_NOT_VERIFIED | identity and payout destination verified before any sale |
| NAMED_FAMILY_CONSENT_MISSING | **a named family (including the Peete family) cannot be publicly commercialized without documented consent** |
| CONSENT_DOES_NOT_COVER_PUBLIC_NAME | consent must explicitly cover public use of the name |
| CONSENT_WITHDRAWN | closes the campaign to new sales; benefit already accrued still pays |
| GUARDIAN_CONSENT_MISSING | no minor identified without guardian consent |
| LEGAL_REVIEW_REQUIRED | medical/dental support needs a recorded legal review for the jurisdiction |
| MEDICAL_DETAIL_PROHIBITED | no diagnosis or medical detail is collected or displayed (same rule as RAE Link `medical_details_collected = false`) |
| RESERVE_OUT_OF_POLICY | reserve 0–20% |

This matches existing canon: `THY-FAMILY-ARMS-GATE-001` (Peete Family Arms Design Gate, REGISTERED) and the RAE Link family-partnership safeguards (`db/rae-link/0007_family_partnership.sql`).

### 2.6 The seven support programs

| Program | Who it helps | Paid to | Recommended default s | Special rule | State |
|---|---|---|---|---|---|
| Rent support | household behind on rent | the person, or the landlord directly by their choice | 25% | no public address; landlord name never shown | QUEUED_WITH_DEPENDENCY — needs a payout provider (RAE Link B4) |
| Funeral support | family arranging a funeral | the family or the funeral home by invoice | 50% | time-bounded campaign (30 days default); the deceased's name only with next-of-kin consent | QUEUED — same |
| Emergency support | sudden loss (fire, flood, job) | the person | 25% | 60-day cap, then review | QUEUED — same |
| Education support | tuition, fees, supplies | the school by invoice, or the person with receipts | 25% | the student's identity follows the guardian rule | QUEUED — same |
| Household repair | the Lane G water-leak case is the model | the contractor by invoice, or the person with receipts | 25% | the repair evidence packet (Lane G) doubles as proof of need | QUEUED — same |
| Creator support | a creator's next work | the creator | 30% | routes through the RAE Link ledger lanes | QUEUED — RAE Link migrations (B1/B2) |
| Medical / dental support | care costs, **where legally appropriate** | the provider by invoice, or the person | 25% | LEGAL_REVIEW_REQUIRED; no medical detail; not a health claim | APPROVAL_REQUIRED — Earth counsel per jurisdiction |

The default s is **PROPOSED** (decision D-D2). Charitable-solicitation and commercial-coventurer registration rules differ by US state. Whether a Back-to-Buy campaign triggers them is a **question for counsel**, not a conclusion here (blocker B-D3).

### 2.7 Derivatives (COMMERCE LAW scan)

| Derivative | Form |
|---|---|
| free help | the calculator itself, public: "how much of my purchase actually reaches them?" |
| short video / still | the $35-shirt receipt, explained |
| PDF | "Honest Cause Commerce" guide for small businesses |
| business derivative | Back-to-Buy as a service for other stores (licensing the gate + math + receipt) |
| software | `backtobuy.js` as an embeddable widget |
| teacher / kid | a percentage lesson using a real receipt |
| data | aggregate, anonymized campaign totals (never per-family without consent) |

## 3 · Family Seal QR

### 3.1 Concept

A family seal is a **crest or frame that surrounds** a normal, standards-compliant QR code. The code sits on a plain light field with its full quiet zone. The crest starts **outside** the quiet zone. No artwork passes through finder patterns, timing patterns, alignment patterns or data modules.

The code stays beautiful because of what surrounds it, and scannable because nothing touches it.

```
┌──────────────── crest / heraldic frame ────────────────┐
│   ┌──────────── quiet zone ≥ 4 modules ─────────────┐  │
│   │   ▣▣▣  QR modules, dark on light, untouched  ▣▣▣  │  │
│   └─────────────────────────────────────────────────┘  │
│        thylora.example/s/0004PH1   ← printed fallback   │
│        FAMILY SEAL · FAM7Q · RENT26                      │
└─────────────────────────────────────────────────────────┘
```

The crest design itself is **not** drawn here. It belongs with the Peete Family Coat of Arms design record (`THY-PEETE-ARMS-DESIGN-001`, DESIGN_ACTIVE) and its gate. For any other family, the design comes from that family with their consent.

### 3.2 Requirements, as enforced by `validateSeal()`

| Requirement | Rule | Basis |
|---|---|---|
| Standards-compliant | encoder must be ISO/IEC 18004; modules per side `n = 17 + 4v` | ENGINEERING CONSTRAINT (standard) |
| Quiet zone preserved | ≥ 4 modules on every side; frame outside it | ISO/IEC 18004 |
| Contrast preserved | dark modules on light ground; luminance ratio ≥ 7:1; inverted codes refused | HEURISTIC internal floor. ISO specifies reflectance, not this ratio, so it is stated as a heuristic. |
| Error correction | **M** (~15% recovery) by default because nothing covers modules; **Q** for fabric, curved or rough print | ENGINEERING CONSTRAINT |
| Capacity | smallest version whose byte capacity ≥ payload; table for v1–10 × L/M/Q/H built in | ISO/IEC 18004 capacity table |
| Print size | module ≥ 0.5 mm; scan distance ÷ code width ≤ 10 | HEURISTIC print floors, to be confirmed by the mobile test (§3.5) |
| Family identifier | `family_code` (3–8 chars, opaque, e.g. FAM7Q), **not** the family name | privacy |
| Campaign identifier | `campaign_code` (2–8 chars, e.g. RENT26) | — |
| Fallback short code | 6 Crockford base32 symbols + 1 check symbol (mod 37); readable aloud; no I/L/O/U confusion | Crockford base32 |
| Direct URL fallback | printed under the seal: `thylora.example/s/<code>` | accessibility |
| Destination identity | landing page states whose seal it is (by consented display name or seal ID) and which campaign | trust |
| Scan witness | `scanWitness()` record: device, OS, app, print width, distance, lighting, resolved URL = expected URL | evidence |
| Error recovery | a mistyped short code fails its check symbol and never lands on a wrong family; unknown code → a "seal not found — type the code again" page, never a guess | safety |

### 3.3 Worked example (a test)

- **Seal:** `issueSeal({ family_code:'FAM7Q', campaign_code:'RENT26', serial:4821, base_url:'https://thylora.example' })` gives a 7-character short code and a URL of about 34 bytes.
- **Capacity:** 34 bytes at level M → smallest version **v3** (capacity 42 bytes) → **n = 17 + 4 × 3 = 29 modules** per side.
- **Printed at 25 mm (0.98 in) wide:**
  - module = 25 / 29 = **0.862 mm** ≥ 0.5 mm ✔
  - with a 4-module quiet zone each side, the white field is 25 × (29 + 8) / 29 = **31.9 mm (1.26 in)** square
  - scan distance ÷ width = 250 mm ÷ 25 mm = 10 ≤ 10 ✔ (≈ 10 in scanning distance)
- **Colors:** `#1A1410` (ink) on `#F7F1E3` (cream) passes 7:1. Gold `#C9A13A` on cream fails, so gold belongs in the crest, not the modules.

### 3.4 Where the domain is still open

`thylora.example` is a placeholder. **No public domain for seal destinations is recorded in the backend** (Lane B lists the same gap as D-16). Short-code redirects must be served from a domain THYLORA controls, so that a printed seal outlives any platform change.

### 3.5 Mobile test protocol (scan witness)

Before any seal is printed for sale, it must pass:
- 3 phones: iOS native camera, Android native camera, one older Android at least 4 years old
- 2 lighting conditions (indoor warm, daylight)
- 2 distances (the designed distance and 1.5×)
- 2 substrates (paper; the product substrate, e.g. shirt fabric)

That is 24 scans. **Pass = 24 / 24 resolve to the expected URL.** One failure sends the layout back through `validateSeal()`.

## 4 · Supplier Bridge

### 4.1 The rule

**No supplier is approved from paperwork alone.** In `supplier.js`, `PAPER` evidence can satisfy only the desk review. Every other gate needs one of:
- a registry check THYLORA performed itself
- a live remote walk-through run by THYLORA
- an on-site visit
- an accredited lab report on a sample THYLORA chose
- a test order THYLORA bought and checked

The designation is **computed from evidence on every read**, so it cannot outlive the evidence.

### 4.2 The eight gates

| Gate | What is checked | Evidence that counts (varies by class) |
|---|---|---|
| DESK_REVIEW | application, product list, capacity claim, insurance, prior recalls | PAPER, REGISTRY_CHECK |
| IDENTITY | legal entity exists and the owner is who they say | REGISTRY_CHECK (state business registry, EIN letter match, FDA food facility registration where required) |
| FACILITY | the place exists and matches the claim | OBSERVED_REMOTE / OBSERVED_ONSITE (food: on-site preferred) |
| PROCESS | how the product is actually made | OBSERVED_REMOTE / OBSERVED_ONSITE |
| PROVENANCE | where ingredients and materials come from, traced one step back at least | REGISTRY_CHECK, OBSERVED_ONSITE, LAB_REPORT (e.g. herb identity testing) |
| QUALITY_TEST | the product meets its claim | herbs and food: **LAB_REPORT** (identity, contaminants, micro); apparel: TEST_ORDER (wash, shrink, print durability); makers: TEST_ORDER |
| LABOR_SAFETY | safe conditions, no child or forced labor, fair pay practices | OBSERVED_REMOTE / OBSERVED_ONSITE (a questionnaire alone does not count) |
| INSPECTION | a THYLORA-run inspection | food, farms and small manufacturers: OBSERVED_ONSITE; others remote allowed |

### 4.3 Classes and re-check schedule

| Class | Re-check (days) | Note |
|---|---|---|
| Herbs | 180 | links to `WR-HERBFILE-001` (Herb + Plant File shelf) and `FOOD_INGREDIENT_INVESTIGATION` |
| Nutritious foods / snacks | 180 | FDA facility registration and allergen control observed |
| Local farms | 365 | links to the existing `thylora_farmer_candidates` (5 rows) and `thylora_farmer_verification_records`, and `thylora_food_provenance_chain` |
| Apparel / shirts | 365 | print-on-demand supplier not yet selected (THY-DS-MERCH-REWARDS blocker) |
| Makers | 365 | — |
| Small manufacturers | 270 | — |

A gate older than its class interval becomes `EXPIRED`, and the designation drops to `NOT_APPROVED` automatically. Tested: approved on 2026-09-28, lapsed by 2027-03-15 with no human action.

### 4.4 Incidents and revocation

- **Report:** `reportIncident()` with a severity:
  - MINOR / MAJOR: the designation becomes `APPROVED_UNDER_WATCH`. Orders continue, the incident is visible, and it must be closed.
  - SEVERE (contamination, unsafe labor, falsified evidence): **SUSPENDED immediately.** No badge, no orders.
- **Revoke:** `revoke()` requires a reason and a decider. It is terminal. History is kept and nothing is deleted.

### 4.5 What each side gets

| Supplier gets (only while compliant) | THYLORA gets |
|---|---|
| orders routed from the store | quality, from evidence rather than promises |
| designs where applicable (licensed, not sold outright) | provenance, one step back at least |
| traffic from the doors in §1 | known capacity (desk review + inspection) |
| story exposure (a supplier story, with consent, reviewed by Legal) | customer trust (badge = live evidence) |
| the **THYLORA-Approved** designation, computed live | revenue and margin on routed orders |

### 4.6 World-first origin

The supplier method belongs to EdereAirah's existing `WORLD_ADMISSION_COMMITTEE` ("Review Earth businesses before consideration for inclusion in the EdereAirah business network") and `FOOD_INGREDIENT_INVESTIGATION`.

- The method is the world's own admission discipline.
- The Earth adapter is `supplier.js` plus Earth registries and labs.
- Earth evidence (scan witnesses, lab reports, incident rates) feeds back as the world committee's improved method.

EdereAirah is not asking Earth suppliers to save anything. It offers a working admission method and an order channel.

---

## Department Return Format

**1 · CURRENT TRUTH:**
- The store has 28 product rows, 1 order, 1 payment and 1 entitlement. Nothing is public.
- A real-money checkout has not been witnessed.
- The Back-to-Buy, QR seal and supplier engines are built and tested but not deployed.

**2 · WHAT WAS RECOVERED:**
- store rows and counts; the THY-DS-CURRENT-STORE-20260910 status
- the public product policy
- the store-ops, licensing, admission-committee and food-investigation departments
- the farmer-candidate tables
- the membership prices in `store.html`
- the Peete arms gate and design records

**3 · WHAT WAS CREATED:**
- `store/lib/backtobuy.js`, `store/lib/qrseal.js`, `store/lib/supplier.js`, `tests/store.test.mjs`
- this packet: 9-door navigation, 7 support programs, QR seal specification, supplier program

**4 · NUMBERS:**
- 20/20 tests
- 5 000-sale conservation check
- worked example N = $15.33, B = $3.83
- seal v3-M, 29 modules, 0.862 mm module at 25 mm
- 8 gates × 6 classes

**5 · FILES / IDs:** as above. Proposed IDs are in the change packet.

**6 · STILL UNKNOWN:**
- the payout provider
- the public seal domain
- whether charitable-solicitation or co-venturer rules apply per state
- actual tax and fee rates (from the provider)
- the POD supplier
- which families have consented

**7 · BLOCKERS:**

| ID | Blocker | Owner | Release condition | Next action |
|---|---|---|---|---|
| B-D1 | No payout provider (same as RAE Link B4) | Chairman / Finance | provider chosen, identity-verification flow live | choose provider; B is held as accrued until then |
| B-D2 | Real-money checkout witness = 0; `active_allowed=false` | Store Operations | one purchase → payment → entitlement → access witnessed | Chairman lifts the hold on one product after the Lane C DASHCUT-0001 read-back |
| B-D3 | Charitable-solicitation / co-venturer law unknown per state | Legal (Omar Kline, contracts; Earth counsel needed) | counsel memo per launch state | queue questions to counsel |
| B-D4 | No public domain for seal short codes | Chairman | domain registered and redirect live | decide domain (shared with Lane B D-16) |
| B-D5 | No named family has consented | family + Legal | documented consent covering public name | the family decides; nothing proceeds without it |

**8 · SAFE WORK CONTINUING:**
- engines and tests are complete
- the campaign page and receipt UI can be built against `receipt()`
- supplier applications can be designed as intake forms

**9 · CHAIRMAN DECISIONS:**
- **D-D1** Approve the nine-door navigation as the store's front.
- **D-D2** Approve the default support shares (25% / 50% funeral / 30% creator), or set others.
- **D-D3** Approve the refund reserve policy (0–20%, default 5%).
- **D-D4** Choose the seal domain.
- **D-D5** Choose the payout provider (joint with RAE Link B4).
- **D-D6** Approve the supplier re-check intervals.

**10 · NEXT 3 ACTIONS:**
1. Apply DASHCUT-0001 so the Chairman can see store readiness (Lane C).
2. Pick one cleared product and run the first real-money witness.
3. Open the first supplier application: a herb supplier, through `WR-HERBFILE-001`.

**11 · HELP VALUE:** people can support someone through things they would buy anyway, and see exactly how much arrives.

**12 · EARTH VALUE:** an honest cause-commerce standard that small Earth businesses can adopt.

**13 · MONEY PATH:**
- H (THYLORA's share) on every Back-to-Buy sale
- supplier-routed margin
- licensing the Back-to-Buy gate and receipt
- seal printing as a product

**14 · MEDIA / STORY PATH:** "Where your $35 goes" short, built from the real receipt. Supplier stories, with consent.

**15 · EDUCATION PATH:** percentages and rounding taught from a real receipt; a unit on the supply chain.

**16 · SOFTWARE PATH:** the three modules become the store API (Lane C v1.1: checkout, entitlements).

**17 · STORE PATH:** the doors in §1.

**18 · RISKS:**
- a family commercialized without consent (blocked by the gate)
- a cause misrepresented (disclosure is mandatory)
- regulatory registration missed (B-D3)
- a badge outliving the evidence (computed live, so this cannot happen)

**19 · EVIDENCE:**
- `node --test tests/store.test.mjs` → 20/20
- backend counts quoted above

**20 · PERCENT COMPLETE:**
- Lane deliverables: navigation, Back-to-Buy math, 7 programs, QR seal (13 required properties), supplier program (11 required elements), supplier-gets, THYLORA-gets = **7 / 7 designed and specified**.
- Live-operation checks: first Back-to-Buy sale witnessed 0/1, first seal scan witness 0/24, first supplier approved 0/1, real checkout witnessed 0/1 → **0 / 4 live**.

## Backend change packet

Columns for every table below except `thylora_workroom_registry` were **not read** → `VERIFY_BEFORE_APPLY`.

| Target | Canonical ID | Proposed row / patch | Truth class | Evidence | Blocker | Next action |
|---|---|---|---|---|---|---|
| thylora_store_policy_registry | STORE-POL-BACKTOBUY-001 | formula (1)–(3), bp integer rule, disclosure mandatory, no clawback, reserve 0–2000 bp | FORMAL_SYSTEM_LAW / PROPOSED policy | `store/lib/backtobuy.js` + tests | D-D2, D-D3 | read columns → insert → read back |
| thylora_store_policy_registry | STORE-POL-QRSEAL-001 | seal requirements table §3.2, mobile test 24/24 | ENGINEERING_CONSTRAINT + HEURISTIC | `store/lib/qrseal.js` + tests | D-D4 | same |
| thylora_store_policy_registry | STORE-POL-SUPPLIER-001 | 8 gates × 6 classes, paper-only rule, re-check days, incident and revocation rules | PROPOSED policy | `store/lib/supplier.js` + tests | D-D6 | same |
| thylora_store_lane_routes | STORE-DOOR-01…09 | the nine doors, first-free-thing, targets, status | PROPOSED | §1 | D-D1 | same |
| thylora_math_equation_registry | EQ-BACKTOBUY-N / -B | (1), (2) with symbol table | FORMAL_SYSTEM_LAW | §2.1 | none | same |
| thylora_workroom_registry | WR-STORE-BACKTOBUY-001 | lane STORE, purpose "Back-to-Buy + Family Seal + Supplier Bridge", state ACTIVE, restart_point this file | VERIFIED | this workroom | none | insert + read back |
