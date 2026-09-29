# WR-SPINE-624 · Shared production brief

Every lane in this run works from this file. It records what the backend actually
holds as of the read at **2026-09-28 19:20–19:40 UTC**, so no lane invents a state.

## 1 · Authority and head

| | |
|---|---|
| Backend of record | `thylora-dash` · project `jvsdxhrfhtlgaknhjxlz` · Postgres 17.6 · region ca-central-1 · ACTIVE_HEALTHY |
| How it was reached | Supabase connector (read + SQL). Direct REST from the container is still **403 at the egress proxy**. |
| Continuity head | `continuity_log` #358 — "SPINE 620" (Deante Kyle game-show offer) |
| Query custody head | `thylora_query_carryforward` sequence 620 |
| Math registry head | equations through sequence 623 (e.g. `MATH-SHARED-VISION-622`, `MATH-HELP-COMMERCE-CURRENT-622`) |
| **This run** | **sequence 624** · workroom `WR-SPINE-624` |
| Dashboard authority | NOT this repo. `vyc2st-ctrl/thylora-executive-dashboard` → `thylora-public-world`. Do not edit `dashboard-current-head.html`. |

## 2 · What an earlier pass today already registered (do not re-register — build against it)

`idea_registry`, created 2026-09-28 (09:01–17:06 UTC), all with a next action and no built artifact:

- Laws: `THY-LAW-NO-NAKED-LATER-001`, `THY-LAW-WORD-COVERAGE-001`, `THY-LAW-WORLD-FIRST-EARTH-PARALLEL-001`,
  `THY-LAW-HELP-COMMERCE-CURRENT-001`, `THY-LAW-SHARED-VISION-CONVERGENCE-001`, `THY-LAW-QR-FIRST-001`,
  `THY-LAW-NAME-FREQUENCY-001`, `THY-LAW-SIX-READABILITY-001`, `THY-LAW-EQUATION-DISPLAY-CONTRACT-001`,
  `THY-LAW-MATH-NOTATION-READBACK-001`, `THY-LAW-REPORT-GAP-MAP-001`, `THY-LAW-LIFE-SNAPSHOT-001`,
  `THY-LAW-HELP-PRIVILEGE-SAFETY-001`, `THY-LAW-TRANSCRIPT-INTENT-REPAIR-001`, `THY-LAW-CONTEXTUAL-MOVING-GAP-001`
- Ideas: `THY-IDEA-BACK-TO-BUY-001`, `THY-IDEA-WORLD-ANIMAL-LIFE-001`, `THY-IDEA-KAELORPS-001`,
  `THY-IDEA-PLANETARY-NETWORK-FABRIC-001`, `THY-IDEA-INTERNAL-PROTOCOL-LANGUAGE-001`,
  `THY-IDEA-SUCCESSION-RECOVERY-PROTOCOL-001`, `THY-IDEA-WORLD-RESIDENCY-PARTICIPATION-001`,
  `THY-IDEA-INSTITUTIONAL-PILOT-NETWORK-001`, `THY-IDEA-INSTITUTIONAL-HELP-OUTREACH-001`,
  `THY-IDEA-STORE-OPERATING-SURFACE-001`, `THY-IDEA-UNIVERSAL-DASHBOARD-HUB-001`, `THY-IDEA-CONTEXT-LANE-MATRIX-001`,
  `THY-IDEA-FOOD-RESOURCE-MULTIPLIER-001`
- Equation `MATH-SHARED-VISION-622` (Vc = S × I × G × C) already exists — reference it, do not redefine it.

## 3 · Facts each lane must use

**World physics / time (canon):** EdereAirah orbit = **507 Earth-read days** (`THY-IDEA-TIME-CANON-RESTORE-003`,
EDEREAIRAH_CANON; Hester System, Kaeleenrah V, Orbit 5). Native day length, seasons, calendar names: **UNKNOWN / recovery active**.
Planetary gravity, atmosphere, water chemistry: **not locked anywhere in the backend** (blocker on `THY-IDEA-WORLD-ANIMAL-LIFE-001`).
Any value chosen for them in this run is **EDEREAIRAH_PROPOSED**, never canon, and must say so.

**Animals already in the backend (complete list):**
- `thylora_estate_animal_groups` — 7 rows, all at `ER-CASTLE-ROYAL-001`, 1700s time region: HORSE (draught), HORSE (riding),
  CATTLE, SHEEP, PIG, POULTRY, WORKING_DOG. **Every headcount NULL; every care cycle, retirement rule, farrier/vet OPEN.**
  Cattle/sheep/pig/poultry/dog rows even hold "whether kept" as OPEN. These are generic Earth-class species, no names.
- `thylora_living_world_records` — empty registry shells created 2026-08-07, all EDEREAIRAH_PROPOSED, habitat NULL:
  THY-HABITAT-0001 ("Define one habitat before dependent species"), THY-WATER-0001, THY-PLANT-0001, THY-BUG-0001,
  THY-BIRD-0001, THY-ANIMAL-0001, THY-MARINE-0001, THY-WHALE-0001, THY-TREE-0001, THY-LAND-0001;
  one filled plant: THY-PLANT-ROSEMARY-0001 (castle herb garden).
- Named creatures: **Skatylorh** (primary shield creature / team-bird, Peete arms; "No Earth animals" rule on the arms);
  **Child Guardian Companion Species** (`THY-IDEA-GUARDIAN-COMPANION-001`, design active, orange furry visual reference, separate from The Jibbit).
- Ideas touching animals: Canine Detection Lab, Urban Bird + Butterfly Return, Miniworld Civilization + Ecology Reciprocity.
- **No** species with counts, migration, diet, reproduction, lifespan, predators, disease, care staff or population trend exists.

**People already in the backend (use before proposing new ones; run THY-LAW-NAME-FREQUENCY-001 before any new name — "Marcus" is retired from current lanes):**
- `DEPT-LEGAL-COMP-001`: Samira Vale (Chief Law Librarian & Constitutional Source Custodian, Civic Archive Quarter),
  Rafael Okafor-Mendes (Deputy General Counsel), Nadia Baptiste (Director, Global Legal Operations, Civic Archive Quarter),
  Omar Kline (Contracts, River Court District), Elena Marrow (Privacy, Data & Consumer Protection), Caleb Ishikawa (Product & Regulatory Safety),
  Priya Nwosu (IP & Media Rights), Darius Cole (Legal Production & PDF), Anika Sørensen-Vale (Employment & Labor).
- `EDEREARIAH_LAW_HOUSE` department exists (P0) with **zero personnel rows**.
- `THY-WORLD-DOUBT-REMOVER-607`: Naya Aven, Director of Access and Follow-Through (proposed residence MUNZYMUUR).
- Food: Keon Mercer (Culinary Training Director, world-only); Mara Ellison (Food & Ingredient Investigator);
  Royal Head Cook = entity `ER-ROYAL-COOK-001` (lock sheet LOCKED: age 55, 163 cm, sturdy working build, dark hair threaded gray, pinned up),
  role `HH-1700-COOK` BOUND, 1700s time region.
- Earth-real judge record: task `EXP-010` "Judge Denise Winston — Ersatz or Real? Legacy Ingest" — **legacy claims unverified; do not use her as a world person.**

**Court/justice:** no court department, no court systems analyst, no judge, no clerk exists in the world. Product
"Court Programming — Digital Workflow Starter" exists in `products`. `THY-LAW-REPORT-GAP-MAP-001` references a
"revised court-clerk report" that is **not in the backend** (only the law's next action mentions it).

**Store truth:** 28 `products` rows; 7 `prices` (membership $0 / $3.99 / $5.99 / $7.99 / $14.99 / custom + one $1.00 test);
1 order + 1 payment = $1.00 **Lemon Squeezy TEST**; 1 payment-capture witness = **$1.99 founding Chairman purchase via
shopify_payments** (witnesses the mechanism only; external-customer witness is CUSTOMER-DEFERRED); downloads = 0.
Provider authority (LOCKED): **Stripe = Earth payment provider, Shopify = storefront lane.**
13 shelves: FRESHPATH_HOUSEHOLD, TASTEPRINT_FOOD, SHOWS_STORIES, ERSATZ_EVIDENCE, FAMILY_LEGACY, PRODUCTS_DESIGN,
CREATOR_NETWORK, BAND_CONNECTED, LEARNING_EDU, HERB_PLANT_FILE, RELEASE_AVAILABLE_SOON, RELEASE_DEVELOPMENT, RELEASE_WORLD_EXPANSION.
Nothing may be created, priced or activated on Shopify in this run.

**Suppliers:** `thylora_farmer_candidates` 5 rows (Cecil County MD area; public listings only; one outreach email 2026-08-18,
verification pending); `thylora_farmer_verification_records` 80 rows, all awaiting evidence
(columns: verification_area, claimed_value, evidence_type, evidence_ref, verification_state, reviewer_committee).
`thylora_kitchen_suppliers` 10 rows. Reuse these; do not build a parallel supplier registry.

**World market:** `thylora_world_market_companies` 6 rows, all `REGISTERED_PRIVATE_NO_LISTING`, no share capital, no shares.
World institutions (banking, regulation, exchange) exist as OPEN shells with no names. No revenue, asset or liability figures exist.

## 4 · Laws every lane applies

1. **UNKNOWN stays UNKNOWN.** Never fill a structural fact to make a page look complete.
2. **Truth classes** (enum `thy_truth_class`): EARTH_ACTUAL, EARTH_PROPOSED, PRODUCTION_PLANNED, EDEREAIRAH_CANON,
   EDEREAIRAH_PROPOSED, QUARANTINED. Everything new this run is *_PROPOSED or PRODUCTION_PLANNED unless it cites canon.
3. **No naked later.** Any work not done now is one of NOW / QUEUED_WITH_DEPENDENCY / HOLD_FOR_EVIDENCE / APPROVAL_REQUIRED,
   with owner, blocker, release condition, next executable action.
4. **Math display law.** Every formula shows: symbol names, subscripts, operators, units (or "unitless"), domain, scale,
   threshold, assumptions, failure condition, plain-English meaning, child-readable meaning, worked example, and a class:
   PHYSICAL_LAW / ENGINEERING_CONSTRAINT / FORMAL_SYSTEM_LAW / EMPIRICAL_MODEL / HEURISTIC. Never call an organizational model a physical law.
5. **Units:** US customary and metric side by side for every physical quantity.
6. **Visual law:** no images are generated this run. Visual work is specification only; every unknown visual field is UNKNOWN.
7. **Earth parallel:** develop the EdereAirah version first, then the Earth adapter. Earth history claims need sources;
   never present an invented recipe, person or event as documented Earth history.
8. **Private/sensitive:** no medical detail, no child identity, no real private person's data.
9. **Every source is also scanned for:** HELP, STORY, PRODUCT, SERVICE, EDUCATION, PARTICIPATION, SOFTWARE, MEDIA,
   LICENSING, DISTRIBUTION, REVENUE, REINVESTMENT, ARCHIVE, EARTH APPLICATION, EDEREAIRAH APPLICATION.

## 5 · Output rules for lane files

- Write to `workrooms/WR-SPINE-624/<LANE>-*.md` (and code paths named in your lane brief). Do not touch any other path.
- Do not commit, push, or write to the backend. The production director applies backend writes centrally.
- End every lane file with: **Status table** (what is done / partial / blocked), **Next executable work** (with the four
  classifications above), and **Restart point** (one paragraph a cold reader can resume from).
