# Product Drafts A–F — NOT PUBLISHED

State of every draft below: **DRAFT — not created on Shopify, not priced, not published.**
Every price is a **PROPOSAL for Chairman authorization**, not an authorized price.
Draft codes use the prefix `THY-DRAFT-609-` and are **proposed, not registered** in `products` or
`thylora_store_product_readiness`. They should be registered only when the Chairman accepts a draft.

Fee basis for every equation: the published Shopify Payments Basic-plan US online rate (2.9% + $0.30),
**not yet witnessed from a payout**. `T` = sales tax, UNKNOWN per buyer location (`tax_ready = false`).
Delivery cost is ~$0.00 per EDF open but unmetered, so it is UNKNOWN.

Shared gate (from the SPINE FORWARD brief). None of these may move DRAFT → ACTIVE until:
file exists · preview matches · ownership/licence recorded · price authorized · checkout connected ·
delivery defined · truthful description.

---

## A. Birthday / Family Digital Message Card
- **Proposed code:** THY-DRAFT-609-A-FAMILY-CARD
- **Working title:** THYLORA Family Message Card — Birthday Edition
- **Proposed price:** $3.00 (NOT AUTHORIZED)
- **Customer:** a family member who wants to send a designed digital birthday message
- **Deliverable:** one designed digital card (PDF plus a shareable reader link) carrying the buyer's own message text
- **Truthful description (draft copy):**
  "A designed THYLORA birthday card that you finish with your own words. You type the message; we
  place it on the card and deliver it to your library, where you can open it again or share it. No
  photos of real people are used unless you upload them and confirm you have the right to use them."
- **Rights status:** the card art must be an original THYLORA/ErsatzReality asset with a rights record. None is assigned yet. Buyer-supplied text and photos stay the buyer's.
- **Delivery path:** Shopify checkout → webhook v5 → entitlement → personalised EDF → library. **Missing:** a personalisation step. The webhook passes no buyer text into an artifact today.
- **Store URL:** none (not created)
- **Exact blocker:** no card artwork asset, no personalisation input on checkout, no likeness/consent rule for uploaded photos (the same gap as THYLORA Anywhere Portrait), price not authorized
- **Equation:** `$3.00 − $0.39 fees − T − ~$0.00 delivery = $2.61 − T`
- **Family-story guard:** a card is not a family archive. Nothing written on a card enters `family_story_archives` unless the family chooses to save it there.

## B. Creator "Help Me Sell This" Listing
- **Proposed code:** THY-DRAFT-609-B-HELP-ME-SELL
- **Program link:** THY-ERSATZ-CREATOR-NETWORK-001 (`sequence_608_creator_lane`) and THY-GLOBAL-HELP-PATH-608 (category "post and sales improvement")
- **What it is:** a listing template for one creator-owned digital product, sold through the ErsatzReality Shopify store under a written creator agreement. It is not a THYLORA-authored product.
- **Proposed price:** set per product by the creator, with Chairman approval. Worked example at $10.00.
- **Customer:** buyers of the creator's product. The creator is the partner, not the customer.
- **Deliverable:** the creator's own digital file, delivered through the same entitlement and library chain
- **Truthful description template:**
  "Made by [creator name or chosen credit]. Sold through the ErsatzReality store under a written agreement.
  [Creator] receives [x]% of the amount left after fees, taxes and delivery cost, paid [schedule]."
- **Rights status:** requires proof of ownership from the creator, a signed creator agreement and a benefits-impact check for the creator (`creator_sale` rule). None exists yet.
- **Delivery path:** creator file → delivery asset → EDF → entitlement → library
- **Store URL:** none
- **Exact blocker:** no named creator, no signed agreement (CRN-002 needs counsel), no split rate chosen (CRN-003), no payout processor (`payout processor` is UNKNOWN in the 608 record)
- **Equation (at $10):** `$10.00 − $0.59 fees − T − ~$0.00 delivery = $9.41 − T` distributable, split only under the signed agreement
- **Store gate:** "no listing until product is real, permitted and deliverable; no philanthropy claim without verified allocation."

## C. Finance Understanding Course
- **Proposed code:** THY-DRAFT-609-C-FINANCE-UNDERSTANDING
- **Working title:** Understanding Money — How Pay, Bills, Credit and Fees Actually Move
- **Proposed price:** $15.00 (NOT AUTHORIZED)
- **Customer:** adults and older teens who want to read their own pay stubs, bills, loan terms and fees
- **Deliverable:** a digital course (EDF reader edition plus PDF workbook). Worked examples use the store's own equation, `payment − fees − taxes − delivery cost = available amount`.
- **Truthful description (draft):**
  "An education course that explains how money moves through pay, bills, credit and fees, with worked
  examples you can check yourself. It is not financial, tax, legal or investment advice, and it does not
  recommend any product, account or investment."
- **Rights status:** must be original THYLORA text. Any cited figure needs a source and date. Nothing is written yet.
- **Delivery path:** the standard chain (EDF → entitlement → library)
- **Store URL:** none
- **Exact blocker:** no content written, no factual review, jurisdiction statement needed (US-first), price not authorized
- **Equation:** `$15.00 − $0.74 fees − T − ~$0.00 delivery = $14.26 − T`

## D. School Question Course
- **Proposed code:** THY-DRAFT-609-D-SCHOOL-QUESTIONS
- **Existing continuity it must use:** Question Quest — Family Pilot (`QQ-FAMILY-PILOT-001`, `WRP-QE-QE-PROD-CHILD-GAME-001`), THY-QUESTION-ENGINEERING-001, and the THYLORA Question Deck (ACTIVE on Shopify, see the workroom §0)
- **Working title:** Asking Better School Questions — A Family Course
- **Proposed price:** $9.00 (NOT AUTHORIZED). `qq_price_estimates` rows stay estimates, and no customer has been asked.
- **Customer:** a parent or guardian buying for a student. The student is the user; the adult is the buyer.
- **Deliverable:** a digital course on turning "I don't get it" into a question a teacher can answer, starting from the one demonstrated concept (Mathematics / fractions, VISUAL_EXPLANATION, 2026-09-07)
- **Truthful description (draft):**
  "A short course for families that practises asking the question that unlocks the lesson. It starts with
  fractions and adds subjects as each one is finished. It collects no information about your child."
- **Rights status:** THYLORA-original. Child-data privacy review is **not cleared** (QQ blocker).
- **Delivery path:** the standard chain, with the account held by the adult buyer
- **Store URL:** none
- **Exact blocker:** only one concept exists (a released concept set is required), child-data privacy review isn't cleared, the guardian-consent path hasn't been tested with a synthetic family, price not authorized
- **Equation:** `$9.00 − $0.56 fees − T − ~$0.00 delivery = $8.44 − T`

## E. Homelessness Navigation Guide
- **Proposed code:** THY-DRAFT-609-E-HELP-NAVIGATION
- **Program link:** THY-GLOBAL-HELP-PATH-608, THY-PAID-PATHWAY-BALTIMORE-608 (Baltimore first, not a global template)
- **Working title:** Finding the Next Door — A Housing and Shelter Navigation Guide (Baltimore Edition)
- **Price to the person using it:** **$0.** The guide is never sold to a person seeking shelter. It may be funded by sponsors through THY-SPONSOR-ACCESS-CREDITS-609.
- **Customer:** (1) the person seeking help, free. (2) A sponsor who funds copies, printing or partner time.
- **Deliverable:** a guide explaining how to reach the verified local entry points (Baltimore City Continuum of Care / coordinated entry, 211), what to ask, what to bring and what to do when a door does not open. Every listing carries its source and a verified-on date.
- **Truthful description (draft):**
  "A free guide to finding shelter and housing help in Baltimore. It lists official services with the date
  we last checked each one. It is not an emergency service, and we cannot promise any service will have
  space. If you are in danger, contact local emergency services."
- **Rights status:** THYLORA-original text. Service names are cited, not reproduced. A lived-experience review is required first (608 `city/CoC consult with lived-experience advisory`).
- **Delivery path:** a free library entitlement or public page. No checkout, and no account required to read.
- **Store URL:** none
- **Exact blocker:** no verified directory (`countries_with_verified_directories: 0`), no lived-experience or partner review, no partner agreement
- **Equation (sponsored copy, illustrative $5):** `$5.00 − $0.45 fees − T − ~$0.00 delivery = $4.55 − T` goes to printing or partner allocation under 609 terms. At $0 to the reader: `$0 − $0 − $0 − ~$0.00 = $0`, with hosting carried by THYLORA.
- **Prohibited claims:** no "proceeds go to the homeless", no eligibility promise, no 24/7 claim, and no story about any person without permission (608 protections).

## F. Sponsor Access Bundle
- **Proposed code:** THY-DRAFT-609-F-SPONSOR-BUNDLE
- **Program:** THY-SPONSOR-ACCESS-CREDITS-609 (`DESIGN_READY_NO_FUNDS_COLLECTED`)
- **What it is:** a company buys access credits. An approved help partner allocates them. Beneficiaries choose eligible digital items.
- **Eligible items today:** only products with every gate evidenced, which currently means Twelve Miles for Flour ($1.99). Question Deck, Gap Hunt and Build a World become eligible once their EDFs are published and a checkout is witnessed.
- **Proposed price:** sponsor-defined, starting at $100 (NOT AUTHORIZED)
- **Deliverable to the sponsor:** a credit statement and a monthly report (see the 609 terms). **To the beneficiary:** the chosen digital item(s).
- **Rights status:** a sponsor agreement, beneficiary consent and a partner agreement are required. None exists yet.
- **Delivery path:** sponsor payment → credit ledger → partner allocation → single-use 100% discount code → Shopify checkout at $0 → webhook v5 → entitlement → library
- **Store URL:** none
- **Exact blocker:** no sponsor, no rates, no credit ledger or code mechanism, no partner (see the workroom §3)
- **Equation (at $100 via Shopify card):**
  `$100.00 − $3.20 fees − T − ~$0.00 delivery = $96.80 − T` available.
  Credit issued: `C = P × a`, published before sale. Per the 609 record, a credit is never presented as worth more than the dollars behind it.
