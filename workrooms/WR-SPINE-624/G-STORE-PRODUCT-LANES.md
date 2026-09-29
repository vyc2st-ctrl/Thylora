# G · Store Product Lanes — WR-SPINE-624

Lane G of run sequence 624. Source: Chairman product-lane list (as relayed in the lane brief).
Built against `BRIEF.md` §3 "Store truth" and `public-site/store.html`. **Nothing here is created, priced or
activated on Shopify, Stripe or the backend.** Every price is a **CANDIDATE**. Every new item is
`PRODUCTION_PLANNED` (Earth) or `EDEREAIRAH_PROPOSED` (world) unless it cites canon.

---

## 0 · Ground truth this file builds on (read, not invented)

| Fact | Value | Source |
|---|---|---|
| Products rows | 28 | BRIEF §3 |
| Prices rows | 7 — membership $0 / $3.99 / $5.99 / $7.99 / $14.99 / custom, plus one $1.00 test | BRIEF §3 |
| Real external customer sale | **none**. $1.00 = Lemon Squeezy TEST; $1.99 = founding Chairman purchase via `shopify_payments` (mechanism witness only; external-customer witness CUSTOMER-DEFERRED) | BRIEF §3 |
| Downloads | 0 | BRIEF §3 |
| Provider authority (LOCKED) | **Stripe = Earth payment provider; Shopify = storefront lane** | BRIEF §3 |
| Physical commerce | "physical products remain separate until their physical-commerce path is verified" | store.html #products |
| Recurring billing | not live; gate = subscribe → payment → entitlement → access → cancellation → access-removal proof | store.html "Current gate" |
| Existing court product | "Court Programming — Digital Workflow Starter" exists in `products`; no price row for it among the 7 | BRIEF §3 |
| Shelves (13) | FRESHPATH_HOUSEHOLD, TASTEPRINT_FOOD, SHOWS_STORIES, ERSATZ_EVIDENCE, FAMILY_LEGACY, PRODUCTS_DESIGN, CREATOR_NETWORK, BAND_CONNECTED, LEARNING_EDU, HERB_PLANT_FILE, RELEASE_AVAILABLE_SOON, RELEASE_DEVELOPMENT, RELEASE_WORLD_EXPANSION | BRIEF §3 |

### 0.1 · Provider-routing flag (raised, not resolved)

The only real-money witness ($1.99) ran through **`shopify_payments`**, while the LOCKED authority says **Stripe** is the Earth
payment provider. On a Shopify storefront, taking payment through a non-Shopify-Payments gateway generally adds a
**Shopify third-party-gateway transaction fee** (rate depends on plan — **UNKNOWN, verify on the plan page**). Every margin below
therefore shows Stripe standard processing only, and lists "Shopify plan fee / third-party-gateway fee: UNKNOWN" as a separate line.
**Owner:** Chairman. **Classification:** APPROVAL_REQUIRED — choose (a) Shopify storefront → Stripe-hosted checkout link per product,
(b) Shopify Payments for Shopify orders with Stripe for direct/digital links, or (c) other. No lane below depends on the answer to be
*drafted*; all depend on it to be *sold*.

### 0.2 · Fee basis used everywhere

- **Stripe standard online card rate: 2.9% + $0.30 per successful charge — published standard rate, verify at signup.**
  (International cards, currency conversion, Stripe Billing, Stripe Tax and Invoicing can add fees — **UNKNOWN until verified**.)
- **Shopify plan fee: UNKNOWN.** Shopify digital-download app fee: UNKNOWN. Shopify third-party-gateway fee: UNKNOWN.
- Margin shown = (price − processing − unit cost) ÷ price. Fixed monthly platform fees are **not** allocated per unit because the
  plan fee is UNKNOWN; the break-even line in each lane says so.
- Sales tax / VAT is collected on top of price and passed through; not revenue. Tax registration status: UNKNOWN.

### 0.3 · QR route convention (QR-First law)

Pattern: **`/s/<shelf-slug>/<product-slug>`**, where `<shelf-slug>` = shelf code lower-cased with `_` → `-`
(e.g. `ERSATZ_EVIDENCE` → `ersatz-evidence`). **Convention is PRODUCTION_PLANNED.**
**Route hub host/domain: UNKNOWN until the Chairman confirms the store domain.** Under `THY-LAW-QR-FIRST-001` the route must exist
and resolve before any final product image or printed QR is produced. No QR image is generated in this run (Visual law).

---

## 1 · Lane cards

Format for every lane: offer · audience · buyer receives · price CANDIDATE (basis) · cost (itemized) · margin arithmetic · rights ·
delivery · shelf · QR route · marketing (channel + first message) · help/beneficiary · Earth/EdereAirah · guardrails · classification.

---

### G-01 · Recipes

| Field | Content |
|---|---|
| Offer | **"Castle Kitchen Card Pack — 12 Earth-tested recipes"** (printable PDF recipe cards + shopping list). |
| Audience | Home cooks; families cooking together; members browsing TASTEPRINT_FOOD. |
| Buyer receives | 1 PDF (12 cards, US customary + metric side by side per Units law), allergen line per card, printable shopping list. |
| Price CANDIDATE | **$4.99** — basis: single low-cost digital pack, priced near the $3.99 member tier so a member can buy without friction. |
| Cost (itemized) | Unit: $0 marginal file cost. Processing: 2.9% × $4.99 = $0.1447 + $0.30 = **$0.4447**. Recipe testing (ingredients per recipe) — one-time, **UNKNOWN**. Shopify plan/app fees UNKNOWN. |
| Margin | $4.99 − $0.4447 = **$4.5453 net → 4.5453 ÷ 4.99 = 91.1%** (before UNKNOWN platform fees). |
| Rights | Recipe ingredient lists are not copyrightable; the written method, headnotes and layout are. All text original to THYLORA. No reproduction of third-party cookbooks. |
| Delivery | Digital download after payment (download count must move from 0 — first real witness). |
| Shelf | **TASTEPRINT_FOOD** (existing). |
| QR route | `/s/tasteprint-food/castle-kitchen-card-pack` (host UNKNOWN). |
| Marketing | Channel: store page + member newsletter. First message: *"Twelve dinners, tested in a real kitchen, written so a nine-year-old can read the steps. $4.99."* |
| Help link | Candidate: each pack sold funds one free pack released to a partner food pantry (proposed; ties `THY-IDEA-FOOD-RESOURCE-MULTIPLIER-001`). Amount per sale APPROVAL_REQUIRED. |
| Earth / EdereAirah | **World first:** the Royal Head Cook (`ER-ROYAL-COOK-001`, role `HH-1700-COOK`, 1700s time region) and the castle herb garden rosemary (`THY-PLANT-ROSEMARY-0001`) frame the pack as `EDEREAIRAH_PROPOSED` story. **Earth adapter:** every recipe is a modern Earth recipe, tested; it is **never** presented as a documented 1700s Earth recipe (Earth-parallel law). |
| Guardrails | Allergen statement per card; no health or disease claims on any dish. |
| Classification | **QUEUED_WITH_DEPENDENCY** — Owner: Keon Mercer (Culinary Training Director, world-only role) for world framing; Earth recipe tester UNKNOWN. Blocker: no tested recipe set exists. Release: 12 recipes tested + written + readback. Next action: draft the 12-recipe list in `workrooms/WR-SPINE-624/` for Chairman selection. |

---

### G-02 · Pet / senior-pet care

| Field | Content |
|---|---|
| Offer | **"Senior Pet Comfort Log"** — printable daily log (food/water/mobility/sleep observations), home-comfort checklist, and a "questions to bring to your vet" page. |
| Audience | Owners of older dogs/cats; caregivers splitting pet duties across a family. |
| Buyer receives | PDF (log pages + checklist). **No dosing, no diagnosis, no treatment advice.** |
| Price CANDIDATE | **$6.99** — basis: printable planner pricing, above the recipe pack because it is a reused tool, not one-read content. |
| Cost | Unit $0. Processing 2.9% × $6.99 = $0.2027 + $0.30 = **$0.5027**. Veterinary review fee: **UNKNOWN** (one-time). Platform fees UNKNOWN. |
| Margin | $6.99 − $0.5027 = **$6.4873 → 92.8%** (before vet-review amortization and platform fees). |
| Rights | Original text/layout. Any pet photo must be owned or licensed; none generated this run. |
| Delivery | Digital download. |
| Shelf | **FRESHPATH_HOUSEHOLD** (existing, interim). Proposed new shelf **ANIMAL_LIFE** (pet care + animal media) — **APPROVAL_REQUIRED**. |
| QR route | `/s/freshpath-household/senior-pet-comfort-log` (moves to `/s/animal-life/...` only if the shelf is approved; old route must redirect). |
| Marketing | Channel: store page; later, local vet-clinic counter card (QR). First message: *"Your old friend can't tell you what changed. This log can help you tell your vet."* |
| Help link | Candidate: free copy to animal-shelter senior-adoption programs. APPROVAL_REQUIRED. |
| Earth / EdereAirah | World: estate `WORKING_DOG` group at `ER-CASTLE-ROYAL-001` has retirement rule and vet **OPEN** — this product's structure can inform (not fill) that rule; any world rule stays `EDEREAIRAH_PROPOSED`. Earth adapter: product is Earth-only practical. |
| Guardrails | **Vet review mandatory:** a licensed veterinarian (DVM) reviews the text before release; reviewer name + license state recorded. "Not a substitute for veterinary care" on every page. |
| Classification | **HOLD_FOR_EVIDENCE** — Owner: Caleb Ishikawa (Product & Regulatory Safety) routes review. Blocker: no DVM reviewer identified. Release: signed DVM review on file. Next action: write the draft log text so a reviewer has something to review. |

---

### G-03 · Family support campaigns — Back to Buy (connect only)

| Field | Content |
|---|---|
| Offer | Store-side slot for `THY-IDEA-BACK-TO-BUY-001` campaigns. **Another desk builds the math; this lane only connects the shelf, route and guardrails.** |
| Audience | Families being supported; members/customers who opt to contribute or buy-to-give. |
| Buyer receives | Defined by the Back to Buy desk (UNKNOWN here). |
| Price CANDIDATE | **None set here** — depends on Back to Buy math. |
| Cost / margin | Processing is still 2.9% + $0.30 per charge; small contributions lose proportionally more (a $1.00 gift loses $0.329 = 32.9%). Recommend Back to Buy desk set a minimum contribution or bundle; margin **UNKNOWN**. |
| Rights | Campaign stories: consent from the family required; no child identity, no medical detail (Private law, `THY-LAW-HELP-PRIVILEGE-SAFETY-001`). |
| Delivery | Per campaign design. |
| Shelf | **FAMILY_LEGACY** (existing). |
| QR route | `/s/family-legacy/back-to-buy-<campaign-slug>` (host UNKNOWN). |
| Marketing | Channel: campaign page linked from store. First message: held until Back to Buy math is registered. |
| Help link | This lane *is* the help link. |
| Earth / EdereAirah | World version belongs to the Back to Buy desk. |
| Guardrails | Donations vs. purchases must be distinct; **no "tax-deductible" wording** (charitable status UNKNOWN). State charitable-solicitation registration may apply if framed as donations — legal check. Stripe restricted-business review may apply to crowdfunding-style flows — verify. |
| Classification | **QUEUED_WITH_DEPENDENCY** — Owner: Back to Buy desk. Blocker: campaign math not registered. Release: Back to Buy equation registered + legal framing (donation vs. purchase) decided. Next action: Back to Buy desk hands its equation id to this lane; this lane then writes the campaign card. |

---

### G-04 · Educational tools

| Field | Content |
|---|---|
| Offer | **"Read-It-Six Math Cards"** — printable cards that show a formula the way the Math Display Law requires (symbols, units, plain + child-readable meaning, worked example), 20 everyday formulas (area, speed, unit price, recipe scaling, etc.). |
| Audience | Parents, tutors, home-school families, older students. |
| Buyer receives | PDF, 20 cards, US customary + metric. |
| Price CANDIDATE | **$3.99** — basis: equal to the member tier price; impulse-level. |
| Cost | Unit $0. Processing 2.9% × $3.99 = $0.1157 + $0.30 = **$0.4157**. Platform fees UNKNOWN. |
| Margin | $3.99 − $0.4157 = **$3.5743 → 89.6%**. |
| Rights | Formulas are facts; card text and layout original. |
| Delivery | Digital download. |
| Shelf | **LEARNING_EDU**. |
| QR route | `/s/learning-edu/read-it-six-math-cards`. |
| Marketing | Channel: store + learning channel. First message: *"Every formula, with every unit, and a sentence a child can read. 20 cards, $3.99."* |
| Help link | Free edition for libraries (proposed). |
| Earth / EdereAirah | Implements `THY-LAW-SIX-READABILITY-001` and `THY-LAW-EQUATION-DISPLAY-CONTRACT-001` as a product. World version: the same card format used for world teaching (world units UNKNOWN — do not invent). |
| Guardrails | Each formula classified (PHYSICAL_LAW etc.) correctly; readback before release. |
| Classification | **NOW** (drafting) — Owner: Lane G. Blocker for *sale*: provider routing (§0.1). Next action: draft the 20 cards in the workroom. |

---

### G-05 · History / evidence products

| Field | Content |
|---|---|
| Offer | **"Ersatz or Real? Claim-Check Workbook"** — a worksheet method for checking a claim: who said it, primary source, date, corroboration, confidence grade. 10 worked Earth examples with citations. |
| Audience | Teens, adults, families, teachers, anyone tired of "is this real?" |
| Buyer receives | PDF workbook + blank reusable worksheet. |
| Price CANDIDATE | **$5.99** — basis: mid-point between single-card products and tools; equals the Family tier figure. |
| Cost | Unit $0. Processing 2.9% × $5.99 = $0.1737 + $0.30 = **$0.4737**. Platform fees UNKNOWN. |
| Margin | $5.99 − $0.4737 = **$5.5163 → 92.1%**. |
| Rights | Original method text. Quoted sources: short quotations with citation only; public-domain images only if any (none generated). |
| Delivery | Digital download. |
| Shelf | **ERSATZ_EVIDENCE**. |
| QR route | `/s/ersatz-evidence/claim-check-workbook`. |
| Marketing | Channel: store + short-form video (script only this run). First message: *"Before you share it, check it. Five questions, one page."* |
| Help link | Free classroom copy (see G-06 license). |
| Earth / EdereAirah | World first: method attributed in-world to the Civic Archive Quarter (Samira Vale, Chief Law Librarian & Constitutional Source Custodian — existing backend person) as `EDEREAIRAH_PROPOSED` framing. Earth adapter: every example is a real, cited Earth claim. **Do not use the `EXP-010` "Judge Denise Winston" legacy material** (unverified). |
| Guardrails | Every Earth example sourced; no invented Earth event presented as history. |
| Classification | **NOW** — Owner: Lane G drafts; Samira Vale role for world framing. Next action: select 10 sourced example claims. |

---

### G-06 · Teacher / school tools

| Field | Content |
|---|---|
| Offer | **Classroom License** of G-04 + G-05 (one teacher, one classroom, unlimited photocopies for that class) + teacher answer key. |
| Audience | K-12 teachers (grades ~6-12 for G-05), tutors, after-school programs. |
| Buyer receives | Both PDFs + answer key + license certificate PDF. |
| Price CANDIDATE | **$19.99 per classroom** — basis: bundles two products ($9.98 retail) plus classroom reproduction rights and key. School/site license: custom (invoice) — APPROVAL_REQUIRED. |
| Cost | Unit $0. Processing 2.9% × $19.99 = $0.5797 + $0.30 = **$0.8797**. Stripe Invoicing (for school POs) fee UNKNOWN. Platform fees UNKNOWN. |
| Margin | $19.99 − $0.8797 = **$19.1103 → 95.6%**. |
| Rights | License text (single classroom, non-transferable, no resale, no upload to public sites) — needs Omar Kline (Contracts) review. |
| Delivery | Digital download + license PDF. |
| Shelf | **LEARNING_EDU**. |
| QR route | `/s/learning-edu/classroom-license-evidence-math`. |
| Marketing | Channel: direct email to teachers who opt in; teacher-marketplace listing later (fees UNKNOWN). First message: *"A claim-check routine and a math-reading routine your class can use tomorrow. One license, the whole class."* |
| Help link | Candidate: one free license per 5 sold, given to a high-need school on request (ratio APPROVAL_REQUIRED). |
| Earth / EdereAirah | Links `THY-IDEA-INSTITUTIONAL-PILOT-NETWORK-001` (school pilots). |
| Guardrails | **No student data collected** by the product (no accounts, no forms). If any online component is ever added: COPPA (under-13) and FERPA review first. |
| Classification | **QUEUED_WITH_DEPENDENCY** — Owner: Lane G. Blocker: G-04 and G-05 content + license text. Release: both PDFs final + license reviewed. Next action: draft license text for Omar Kline review. |

---

### G-07 · Business tools

| Field | Content |
|---|---|
| Offer | **"Small Producer Capacity & Rest Planner"** — spreadsheet template (Excel/Google Sheets-compatible) that computes utilization U = L/C, flags U > 0.8, and blocks planned hours past a declared weekly limit and on rest days. Same math as Lane H §9. |
| Audience | Farmers, makers, cottage-food cooks, print shops, craft sellers. |
| Buyer receives | .xlsx template + 2-page PDF guide. |
| Price CANDIDATE | **$9.99** — basis: common price band for single business templates; one-time. |
| Cost | Unit $0. Processing 2.9% × $9.99 = $0.2897 + $0.30 = **$0.5897**. Platform fees UNKNOWN. |
| Margin | $9.99 − $0.5897 = **$9.4003 → 94.1%**. |
| Rights | Original template. |
| Delivery | Digital download. |
| Shelf | **CREATOR_NETWORK** (interim — serves makers). Proposed shelf **BUSINESS_TOOLS** — **APPROVAL_REQUIRED**. |
| QR route | `/s/creator-network/producer-capacity-rest-planner`. |
| Marketing | Channel: supplier onboarding (every applicant in Lane H gets it free), then store. First message: *"Say yes to orders you can actually make — and keep your day off."* |
| Help link | Free to every THYLORA-verified supplier (protects their rest; Lane H §10). |
| Earth / EdereAirah | World version: producer-guild ledger (Lane H §0). |
| Guardrails | Labelled HEURISTIC planning tool; not financial or legal advice. |
| Classification | **NOW** (drafting) — Owner: Lane G + Lane H. Next action: build the template from Lane H §9 formulas. |

---

### G-08 · Court / workflow tools (existing product)

| Field | Content |
|---|---|
| Offer | **"Court Programming — Digital Workflow Starter"** — existing `products` row. Positioned as a **general workflow and deadline-tracking template set** for self-organizing case paperwork (checklists, document index, calendar). |
| Audience | Self-represented people organizing paperwork; small-firm staff; advocates. |
| Buyer receives | **UNKNOWN** — the product's file of record is not evidenced (downloads = 0; no file audit in BRIEF). |
| Price CANDIDATE | **$12.99** — basis: no price row exists for this product among the 7 prices; placed above single templates because it is a multi-document set. |
| Cost | Unit $0. Processing 2.9% × $12.99 = $0.3767 + $0.30 = **$0.6767**. Attorney review fee UNKNOWN. Platform fees UNKNOWN. |
| Margin | $12.99 − $0.6767 = **$12.3133 → 94.8%**. |
| Rights | Original templates only; **no court forms copied** unless public-domain official forms with source cited. |
| Delivery | Digital download. |
| Shelf | **PRODUCTS_DESIGN** (existing; workflow tool). Alternative BUSINESS_TOOLS if approved. |
| QR route | `/s/products-design/court-programming-workflow-starter`. |
| Marketing | Channel: store + legal-aid-adjacent community posts (after review). First message: *"Every paper in one place, every date on one calendar. A starter kit for staying organized — not legal advice."* |
| Help link | Free copy to legal-aid clinics on request (proposed). |
| Earth / EdereAirah | **World-first gap:** no court department, judge or clerk exists in the world; `EDEREARIAH_LAW_HOUSE` has zero personnel; the "revised court-clerk report" named by `THY-LAW-REPORT-GAP-MAP-001` is **not in the backend**. This is an Earth product that predates its world parallel — flagged, not filled. |
| Guardrails | **"Not legal advice; no attorney-client relationship"** on every page. No jurisdiction-specific legal instructions (unauthorized-practice-of-law risk). Review by Rafael Okafor-Mendes (Deputy General Counsel, backend role); **whether that role is held by a licensed Earth attorney is UNKNOWN** — a licensed attorney's review is required before sale. |
| Classification | **HOLD_FOR_EVIDENCE** — Owner: Rafael Okafor-Mendes role. Blocker: file of record unverified + no licensed-attorney review. Release: file exists and matches description + review signed + price approved. Next action: production director reads the `products` row and its file reference (SQL below). |

---

### G-09 · Shirts that teach

| Field | Content |
|---|---|
| Offer | **"Check It" tee** — front: the 5 claim-check questions from G-05 in large type. Print-on-demand. |
| Audience | Teachers, students, families; merch buyers who like the evidence brand. |
| Buyer receives | One unisex tee (adult sizes only at launch). |
| Price CANDIDATE | **$26.00** + shipping — basis: common POD graphic-tee retail band. |
| Cost | Base tee + DTG front print (e.g. Bella+Canvas 3001 class via a POD provider): **planning figure $12.00 — UNVERIFIED industry estimate; re-quote on provider catalog before approval.** Shipping (if absorbed): planning figure $4.75 US first item — UNVERIFIED. Processing on $26.00: 2.9% × 26 = $0.754 + $0.30 = **$1.054**. POD app fee: UNKNOWN. Platform fees UNKNOWN. Returns/misprint reserve: UNKNOWN. |
| Margin | Customer pays shipping: $26.00 − $1.054 − $12.00 = **$12.946 → 49.8%**. Free shipping: $12.946 − $4.75 = **$8.196 → 31.5%**. (If shipping is charged, processing also applies to the shipping amount.) |
| Rights | Text design original; font license must allow merchandise (check). No third-party logos. |
| Delivery | POD provider ships direct; tracking to buyer. |
| Shelf | **PRODUCTS_DESIGN**. |
| QR route | `/s/products-design/check-it-tee`. A QR printed *on* the shirt pointing to G-05 is optional; route must exist first (QR-First). |
| Marketing | Channel: store + teacher email list. First message: *"Wear the five questions."* |
| Help link | Candidate: $1 per shirt to the classroom-license giveaway (G-06). APPROVAL_REQUIRED. |
| Earth / EdereAirah | World: Civic Archive Quarter motto (PROPOSED). |
| Guardrails | FTC textile fiber + care labeling and country-of-origin come from the POD blank; confirm. **Children's sizes excluded** until CPSIA (children's product certificate, lead in ink, tracking label) is handled. |
| Classification | **QUEUED_WITH_DEPENDENCY** — Owner: Lane G. Blocker: physical-commerce path unverified (store.html) + provider routing (§0.1) + POD quote. Release: physical path verified end-to-end with one test order. Next action: obtain written POD quote for one blank + print. |

---

### G-10 · Herbs / nutrition products from vetted suppliers

| Field | Content |
|---|---|
| Offer | **Culinary dried herb (e.g. rosemary) from a Lane-H-verified grower**, sold as **food (culinary seasoning), not as a dietary supplement**. |
| Audience | Home cooks; buyers who want traceable, small-farm herbs. |
| Buyer receives | One labelled container, lot number, grower story (with grower consent). Net weight in oz and g. |
| Price CANDIDATE | **UNKNOWN** — cannot be set until the supplier quotes wholesale price. Placeholder band not given (would be invented). |
| Cost | Herb wholesale UNKNOWN · container + label UNKNOWN · third-party lab test per lot (identity, heavy metals, microbial) UNKNOWN, amortized over lot size · shipping UNKNOWN · processing 2.9% + $0.30 of final price. |
| Margin | **UNKNOWN** (every cost term UNKNOWN). |
| Rights | Grower's name/farm name used only under written permission (Lane H §8). |
| Delivery | Physical — depends on physical-commerce path. |
| Shelf | **HERB_PLANT_FILE**. |
| QR route | `/s/herb-plant-file/<grower-slug>-rosemary-lot-<n>` (QR on label resolves to lot COA summary). |
| Marketing | Channel: store + grower story. First message: held until supplier verified. |
| Help link | Direct income to a verified small farm (Lane H). |
| Earth / EdereAirah | World: castle herb garden `THY-PLANT-ROSEMARY-0001`. Earth: Cecil County MD candidate growers (`thylora_farmer_candidates`, verification pending). |
| Guardrails | **No disease claims, ever** (no "cures", "treats", "prevents", "heals"). If any product is ever sold *as a dietary supplement* with a structure/function claim, the label must carry the DSHEA disclaimer: *"These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure, or prevent any disease."*, FDA must be notified within 30 days of first marketing the claim, and manufacturing must meet dietary-supplement cGMP (21 CFR part 111) — **this lane does not enter supplements**. **Supplier COA per lot** (third-party lab) required. Facility food registration / state licensing per Lane H. |
| Classification | **HOLD_FOR_EVIDENCE** — Owner: Lane H verification desk; Mara Ellison (Food & Ingredient Investigator). Blocker: 80 verification records all awaiting evidence. Release: one grower reaches VERIFIED at Tier 2 (Lane H) + passing lot COA. Next action: send the Lane H application to the 5 candidates. |

---

### G-11 · World residency / business presence (`THY-IDEA-WORLD-RESIDENCY-PARTICIPATION-001`)

Four presence tiers from the idea, mapped onto **already-approved membership prices** (no new price invented):

| Tier | Maps to existing price | Processing | Net | Margin |
|---|---|---|---|---|
| Private / family presence | Family $5.99/mo | 2.9% × 5.99 = 0.1737 + 0.30 = $0.4737 | $5.5163 | 92.1% |
| Public personal presence | Member $3.99/mo | 0.1157 + 0.30 = $0.4157 | $3.5743 | 89.6% |
| Business presence | Business Residency $14.99/mo | 0.4347 + 0.30 = $0.7347 | $14.2553 | 95.1% |
| Institutional presence | Enterprise Custom | per invoice | UNKNOWN | UNKNOWN |

(Per-charge, per month. Stripe Billing add-on fee for subscriptions: **UNKNOWN — verify**.)

| Field | Content |
|---|---|
| Offer | A residency record/profile inside the THYLORA world surface attached to the membership. |
| Audience | Families (private), individuals (public), businesses (listing), institutions (pilot network). |
| Buyer receives | Membership entitlements already approved + a residency record (scope defined by the idea's owner). |
| Rights / privacy | Private/family tier: no public exposure of family members; no child identity. Public tier: opt-in display only. |
| Delivery | Account entitlement — **recurring billing not live**. |
| Shelf | **RELEASE_WORLD_EXPANSION**. |
| QR route | `/s/release-world-expansion/residency-<tier>` (4 routes). |
| Marketing | Channel: store memberships section. First message: *"Come in free. Take up residence when you want to."* (echoes store hero). |
| Help link | Institutional tier → `THY-IDEA-INSTITUTIONAL-HELP-OUTREACH-001`. |
| Earth / EdereAirah | World first: residence in EdereAirah (orbit 507 Earth-read days; native calendar UNKNOWN — renewal stays monthly Earth billing). Earth adapter: business presence = Earth business directory listing. |
| Guardrails | **"Residency" must never imply legal residency, citizenship, visa, tax residence, or any Earth government status.** World market companies are `REGISTERED_PRIVATE_NO_LISTING` — a business presence is not a share, security, or investment. |
| Classification | **QUEUED_WITH_DEPENDENCY** — Owner: Chairman / membership desk. Blocker: recurring-billing proof (store.html gate). Release: full subscribe→…→access-removal proof passes. Next action: run the controlled subscription test (production director). |

---

### G-12 · Children's games

| Field | Content |
|---|---|
| Offer | **Printable family card game** (matching/memory, reading-level simple), sold to **adults** as a PDF. |
| Audience | Parents/guardians of children ~4-9; teachers. |
| Buyer receives | PDF to print at home (card sheets + rules). |
| Price CANDIDATE | **$4.99** — basis: same band as G-01. |
| Cost | Unit $0. Processing $0.4447. Art: **UNKNOWN** (no images this run; Guardian Companion visual is design-active only). |
| Margin | $4.99 − $0.4447 = **$4.5453 → 91.1%**. |
| Rights | Character art must be owned; `THY-IDEA-GUARDIAN-COMPANION-001` is separate from The Jibbit — keep separate. |
| Delivery | Digital download to adult purchaser. |
| Shelf | **LEARNING_EDU** (interim). |
| QR route | `/s/learning-edu/guardian-match-card-game`. |
| Marketing | Channel: store + parent email. First message: *"Ten minutes, one table, no screen."* |
| Help link | Free edition to children's hospital play programs (proposed). |
| Earth / EdereAirah | World: Child Guardian Companion Species (design active). |
| Guardrails | **Physical version:** CPSIA — third-party testing by a CPSC-accepted lab, Children's Product Certificate, tracking labels, lead/phthalate limits, ASTM F963 toy standard, age grading and small-parts warnings (under 3). **Any digital/online version:** COPPA — no collection of data from children under 13 without verifiable parental consent; default = collect nothing. |
| Classification | **QUEUED_WITH_DEPENDENCY** — Owner: Lane G. Blocker: character art (visual spec only this run). Release: art approved + print test. Next action: write the rules + card list (text only). |

---

### G-13 · Animal media / products

| Field | Content |
|---|---|
| Offer | **Earth:** "Backyard Bird & Butterfly Return Journal" — observation journal with sourced regional species list. **World:** animal story media — **held**. |
| Audience | Families, nature learners, teachers. |
| Buyer receives | PDF journal (tally pages, season log, sourced species checklist). |
| Price CANDIDATE | **$5.99**. |
| Cost | Unit $0. Processing $0.4737. Species-list sourcing time UNKNOWN. |
| Margin | $5.99 − $0.4737 = **$5.5163 → 92.1%**. |
| Rights | Species facts cited; any photo licensed (none generated). |
| Delivery | Digital download. |
| Shelf | Proposed **ANIMAL_LIFE** — APPROVAL_REQUIRED; interim **LEARNING_EDU**. |
| QR route | `/s/learning-edu/bird-butterfly-return-journal`. |
| Marketing | Channel: store + community garden groups. First message: *"Count who comes back."* |
| Help link | Links "Urban Bird + Butterfly Return" idea; free copy to school gardens. |
| Earth / EdereAirah | World animal life is blocked: gravity/atmosphere/water chemistry not locked; all estate animal headcounts NULL; living-world shells empty. **No world species product until `THY-IDEA-WORLD-ANIMAL-LIFE-001` clears.** Skatylorh stays heraldic ("No Earth animals" rule on the arms). |
| Guardrails | No live-animal sales. No wildlife handling instructions. |
| Classification | Earth journal **QUEUED_WITH_DEPENDENCY** (sourced species list); world media **HOLD_FOR_EVIDENCE**. Owner: Lane G. Next action: pick region (Cecil County MD, to align with suppliers) and cite a public species source. |

---

## 2 · Ranking

### 2.1 · Ranking formula — `MATH-STORE-LANE-RANK-624` (PROPOSED, not registered)

**R = S × H × M**

| Term | Name | Units | Domain | Meaning |
|---|---|---|---|---|
| R | Lane rank score | unitless | 0 – 25 | higher = ship sooner |
| S | Speed-to-first-sale score | unitless | integer 1–5 | 5 = sellable within days with no external review; 1 = months, external evidence needed |
| H | Help value score | unitless | integer 1–5 | 5 = direct help to people/animals in need or teachers at scale |
| M | Unit margin fraction | unitless | 0 – 1 | (price − processing − unit cost) ÷ price, from the lane card |

- **Scale / threshold:** R ≥ 14 → ship-first candidate; 8 ≤ R < 14 → queue; R < 8 → hold. Threshold is a judgment choice.
- **Assumptions:** S and H are Lane G judgments (not measured); M excludes UNKNOWN Shopify fees equally for all lanes, so comparisons stay fair.
- **Failure condition:** if any term is UNKNOWN, R = UNKNOWN (never 0, never guessed). If a regulated guardrail is unmet, the lane cannot ship regardless of R.
- **Plain English:** favor products that can sell soon, help people, and keep most of each dollar.
- **Child-readable:** we pick the things that are quick to make, kind, and don't cost much to sell.
- **Worked example:** Court starter: S=4, H=4, M=0.9479 → R = 4 × 4 × 0.9479 = **15.17**.
- **Class: HEURISTIC.**

### 2.2 · Scores

| Rank | Lane | S | H | M | R |
|---|---|---|---|---|---|
| 1 | G-08 Court workflow starter ($12.99) | 4 | 4 | 0.9479 | **15.17** |
| 2 | G-05 Claim-Check Workbook ($5.99) | 4 | 4 | 0.9209 | **14.73** |
| 3 | G-06 Classroom License ($19.99) | 3 | 5 | 0.9560 | **14.34** |
| 4 | G-04 Math Cards ($3.99) | 4 | 4 | 0.8958 | 14.33 |
| 5 | G-07 Producer Planner ($9.99) | 4 | 3 | 0.9410 | 11.29 |
| 6= | G-01 Recipe pack ($4.99) | 4 | 3 | 0.9109 | 10.93 |
| 6= | G-12 Printable card game ($4.99) | 3 | 4 | 0.9109 | 10.93 |
| 8 | G-13 Bird & Butterfly journal ($5.99) | 3 | 3 | 0.9209 | 8.29 |
| 9 | G-02 Senior Pet Log ($6.99) | 2 | 4 | 0.9281 | 7.42 |
| 10 | G-11 Residency (Member $3.99 basis) | 2 | 4 | 0.8958 | 7.17 |
| 11 | G-09 Check-It tee ($26, buyer-paid shipping) | 2 | 3 | 0.4979 | 2.99 |
| — | G-03 Back to Buy | 2 | 5 | UNKNOWN | UNKNOWN |
| — | G-10 Herbs | 1 | 4 | UNKNOWN | UNKNOWN |

Note: G-06 (14.34) and G-04 (14.33) are effectively tied; G-06 is chosen because it contains G-04 and G-05 and one purchase
reaches a whole classroom. Shipping G-06 also ships G-04 as a standalone.

### 2.3 · Top 3 to ship first — exact next executable action

| # | Lane | Price CANDIDATE | Classification | Exact next executable action |
|---|---|---|---|---|
| 1 | **G-08 Court Programming — Digital Workflow Starter** | **$12.99** | HOLD_FOR_EVIDENCE | Production director runs (read-only): `select * from products where name ilike '%Court Programming%';` and records the file reference, then opens the file and compares it to the product description. Result → this workroom. Then licensed-attorney disclaimer review. |
| 2 | **G-05 Ersatz or Real? Claim-Check Workbook** | **$5.99** | NOW | Lane G writes `workrooms/WR-SPINE-624/G-05-CLAIM-CHECK-WORKBOOK-DRAFT.md`: the 5-question method + 10 Earth example claims, each with a primary-source citation. |
| 3 | **G-06 Classroom License (G-04 + G-05 + key)** | **$19.99** | QUEUED_WITH_DEPENDENCY | Lane G drafts the single-classroom license text (≤1 page) for Omar Kline (Contracts) review, in the same workroom. |

All three still need, before any sale: provider-routing decision (§0.1), store domain for QR routes (§0.3), Chairman price approval,
and — for the first real sale — a customer purchase that moves `downloads` off 0.

---

## 3 · Regulated-category guardrails (summary)

| Category | Guardrail | Gate |
|---|---|---|
| Herbs / nutrition | No disease claims. Culinary food only in this run. Any supplement + structure/function claim → DSHEA disclaimer text (verbatim above), FDA notification within 30 days, 21 CFR 111 cGMP. Third-party **COA per lot** (identity, heavy metals, microbial). | Lane H Tier 3 for supplements; Tier 2 for whole culinary herb |
| Pet care | Licensed **veterinarian review** before release; no dosing/diagnosis; "not a substitute for veterinary care". Pet food/treats: **not in scope** (Lane H Tier 4). | DVM signature on file |
| Children's games | Physical: **CPSIA** (CPSC-accepted lab testing, Children's Product Certificate, tracking label, lead/phthalates), ASTM F963, age grading, small-parts warning. Digital: **COPPA** — collect no child data; any collection needs verifiable parental consent. | Printable (adult buyer) only until testing budget exists |
| Court / workflow | Not legal advice; no jurisdiction-specific instructions; licensed-attorney review. | Signed review |
| Teacher tools | No student data; FERPA/COPPA review before any online feature. | — |
| Residency | No implication of legal residency, citizenship, visa, tax status, or investment. | Copy review (Elena Marrow — consumer protection) |
| Family campaigns | Donation ≠ purchase; no tax-deductible claim; charitable-solicitation check; family consent; no child identity/medical detail. | Legal framing decision |
| Apparel | Textile fiber/care/origin labels; adult sizes only until CPSIA handled. | POD blank label check |

---

## 4 · Proposed shelves (APPROVAL_REQUIRED)

| Proposed shelf | Why | Interim mapping |
|---|---|---|
| `ANIMAL_LIFE` | Pet care + animal media have no fitting shelf | FRESHPATH_HOUSEHOLD (pet), LEARNING_EDU (media) |
| `BUSINESS_TOOLS` | Producer planner, court/workflow, business presence | CREATOR_NETWORK / PRODUCTS_DESIGN |

Owner: Chairman. Release: approval recorded. Until then interim shelves are used and routes must redirect on move.

---

## Status table

| Item | State |
|---|---|
| 13 source lanes assessed (16 offers incl. 4 residency tiers) | DONE |
| Price candidates with fee arithmetic | DONE for 11 lanes; UNKNOWN for G-03, G-10 (dependencies) |
| Physical costs | PARTIAL — tee cost is an UNVERIFIED planning figure; herb costs UNKNOWN |
| Ranking + top 3 | DONE (HEURISTIC) |
| Shelf mapping | DONE; 2 new shelves APPROVAL_REQUIRED |
| QR routes | PATTERN DONE; host UNKNOWN |
| Anything created on Shopify/Stripe/backend | NONE (by rule) |
| Provider-routing conflict (§0.1) | RAISED — APPROVAL_REQUIRED |

## Next executable work

| # | Work | Class | Owner | Blocker | Release condition | Next action |
|---|---|---|---|---|---|---|
| 1 | Court starter file audit | HOLD_FOR_EVIDENCE | Production director → Rafael Okafor-Mendes role | file of record unverified | file matches description + licensed-attorney review | run the `products` select above |
| 2 | Claim-check workbook draft | NOW | Lane G | none | 10 sourced examples + readback | write draft file in workroom |
| 3 | Classroom license text | QUEUED_WITH_DEPENDENCY | Lane G → Omar Kline | G-04/G-05 drafts | license reviewed | draft license text |
| 4 | Math cards draft | NOW | Lane G | none | 20 cards read back | draft cards |
| 5 | Producer planner template | NOW | Lane G + H | Lane H §9 formulas | template test with worked example | build .xlsx spec |
| 6 | Provider routing decision | APPROVAL_REQUIRED | Chairman | — | written choice (a/b/c) | present §0.1 |
| 7 | Store domain for QR host | APPROVAL_REQUIRED | Chairman | — | domain confirmed | ask Chairman |
| 8 | New shelves ANIMAL_LIFE / BUSINESS_TOOLS | APPROVAL_REQUIRED | Chairman | — | approval recorded | present §4 |
| 9 | Tee POD quote | QUEUED_WITH_DEPENDENCY | Lane G | physical path unverified | written quote + test order | request quote |
| 10 | Herb product | HOLD_FOR_EVIDENCE | Lane H / Mara Ellison | supplier evidence | Tier-2 VERIFIED grower + COA | send Lane H application |
| 11 | Residency tiers | QUEUED_WITH_DEPENDENCY | Chairman / membership desk | recurring billing proof | full subscription proof | run controlled subscription test |
| 12 | Senior pet log | HOLD_FOR_EVIDENCE | Caleb Ishikawa | no DVM reviewer | DVM review signed | draft text for review |
| 13 | Back to Buy slot | QUEUED_WITH_DEPENDENCY | Back to Buy desk | equation not registered | equation id handed over | await hand-off |

## Restart point

Lane G assessed all 13 Chairman product lanes against BRIEF §3 store truth; nothing was created on any provider. Fees use Stripe's
published standard 2.9% + $0.30 (verify at signup); Shopify fees are UNKNOWN and there is an unresolved conflict between the LOCKED
Stripe authority and the `shopify_payments` witness (§0.1). Ranking R = S × H × M (HEURISTIC) puts G-08 Court starter ($12.99),
G-05 Claim-Check Workbook ($5.99) and G-06 Classroom License ($19.99) first. A cold reader resumes by (1) running the Court product
`select` to audit its file, (2) drafting the claim-check workbook in this workroom, and (3) getting the Chairman's answers on
provider routing, store domain, and the two proposed shelves.
