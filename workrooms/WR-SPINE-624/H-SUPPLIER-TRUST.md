# H · Supplier Trust Program — WR-SPINE-624

Lane H of run sequence 624. Vetting program for small producers: **farmers, herbal producers, shirt makers, food makers, printers,
craft producers.** Built **on the existing tables** `thylora_farmer_candidates` (5 rows), `thylora_farmer_verification_records`
(80 rows, all awaiting evidence) and `thylora_kitchen_suppliers` (10 rows) — **no parallel registry**. Nothing here is written to the
backend; the migration in §14 is text only. Truth class: EdereAirah guild = `EDEREAIRAH_PROPOSED`; Earth program = `PRODUCTION_PLANNED`.

**Core rule — no paper-only approval.** A supplier can never reach VERIFIED on documents alone. Every approval needs at least one
**witnessed** evidence item (live video witness, on-site audit, a physical sample in our custody, or a third-party lab test on a sample
*we* collected or received under chain of custody) in addition to documents. A COA supplied by the producer is a document, not a witness.

**This file is not legal advice.** Regulatory references are pointers for counsel review (Caleb Ishikawa — Product & Regulatory Safety;
Elena Marrow — Privacy, Data & Consumer Protection; Anika Sørensen-Vale — Employment & Labor; Priya Nwosu — IP & Media Rights;
all existing `DEPT-LEGAL-COMP-001` roles; whether each role is held by a licensed Earth attorney is UNKNOWN).

---

## 0 · EdereAirah version first — World Producer-Trust Guild (PROPOSED)

| Field | Content |
|---|---|
| Name | "World Producer-Trust Guild" (descriptive working name). Any proper name must pass `THY-LAW-NAME-FREQUENCY-001` first — **not chosen this run**. |
| Truth class | `EDEREAIRAH_PROPOSED` — nothing here is canon. |
| What it is | A guild of witnesses who visit growers, cooks, weavers, printers and crafters, see the work with their own eyes, take a sample, and set a seal only when **three** independent witnesses agree. |
| First buyer | The castle kitchen at `ER-CASTLE-ROYAL-001` (Royal Head Cook `ER-ROYAL-COOK-001`, 1700s time region) buys only from sealed producers; the castle herb garden (`THY-PLANT-ROSEMARY-0001`) is the guild's reference plot. |
| Rest law (world) | A sealed producer's declared rest day cannot be bought. The guild refuses any order that would break it. |
| Cadence | Native calendar **UNKNOWN / recovery active**; cadences are expressed in Earth-read days. One full orbit = 507 Earth-read days (canon). Proposed world review cycles: low-risk once per orbit; higher tiers at fractions of an orbit (values below mirror the Earth tiers and are PROPOSED). |
| Guild personnel | **None exist in the backend; none invented here.** |
| Story value | STORY, EDUCATION (how trust is earned), PARTICIPATION (members see seals), EARTH APPLICATION (below). |

**Earth adapter:** the THYLORA Supplier Trust Program below. Same three ideas carried over: witness over paper, three-reviewer
tribunal for big decisions, and protected rest.

---

## 1 · Application (fields)

Stored as a candidate row plus one verification record per claim (§13). Fields collected:

| Group | Fields |
|---|---|
| Identity | legal name of owner(s); preferred name; role; contact email; phone; mailing address; **government ID — shown on live video, not uploaded** (§2) |
| Business | legal business name; DBA; entity type; state/country of registration; registration number; EIN or tax ID (collected on IRS Form W-9 for US payees, stored in secure storage only — §11); years operating |
| Category | producer_category: FARMER / HERBAL / SHIRT_MAKER / FOOD_MAKER / PRINTER / CRAFT (one or more) |
| Products offered | product list; ingredients/materials; intended end user (adult / child ≤12 / pet); any claims the producer currently makes (health, organic, etc.) |
| Facility | production address(es); owned/leased; licensed kitchen or cottage-food; FDA food facility registration number if applicable; organic certificate (USDA NOP) if "organic" is claimed |
| Process | growing/harvest/drying/production steps; lot/batch numbering method; storage conditions (temperature in °F and °C, humidity %) |
| Capacity | capacity unit (e.g. 8 oz / 227 g jar; shirt; print); declared units/week; units/hour; **declared maximum weekly work hours**; **rest days**; seasonal blackout dates |
| Labor | who works (family, employees, volunteers); ages of any minors working; wages basis; safety practices |
| Insurance | product liability insurance carrier + limits (or none) |
| Rights | whether designs/names are the maker's own; trademarks held |
| Consent | consent to verification, to video witness, to recording (per §4), to data handling (§11); consent to publish producer story (separate, optional) |
| Attestations | truthfulness; will notify of recalls, license lapses, facility changes within 7 days |

---

## 2 · Identity and business verification

| Check | Evidence | How checked (witness, not paper) | verification_area |
|---|---|---|---|
| Owner identity | Government photo ID | Shown to camera on live video; reviewer matches face and name; **no copy retained** — record "sighted, last-4 of ID no., expiry" only | `IDENTITY_OWNER` |
| Business exists | Registration number | Reviewer searches the state registry directly (Maryland: SDAT business entity search, for the Cecil County candidates) and records URL + date | `BUSINESS_REGISTRATION` |
| Tax identity | W-9 | Stored in secure storage; name/TIN match checked via payout provider KYC (e.g. Stripe Connect onboarding, if used — UNKNOWN whether it will be) | `TAX_IDENTITY` |
| Address is real and theirs | Utility bill / lease / deed | Plus geotagged photo or on-site visit; live video walk-up | `LOCATION_FACILITY` |
| Licenses | Cottage-food registration, food license, FDA registration, organic certificate | Reviewer looks up issuer's public database where one exists (USDA Organic Integrity Database for organic) | `LICENSE_PERMIT`, `ORGANIC_CLAIM` |
| Insurance | Certificate of insurance | Call/email to carrier to confirm (Tier 3) | `INSURANCE_LIABILITY` |
| References | 2 buyers/markets | Reviewer phones references | `REFERENCE_CHECK` |

---

## 3 · Facility and process evidence

- Walk-through of every step claimed in the application (field → harvest → dry → pack; or blank → print → cure → fold).
- Look for: cleanliness, pest control, separation of raw and finished goods, storage temperature/humidity, lot labels, water source (for food/herbs), allergen segregation (food).
- Evidence: live video witness (§4) or on-site audit (§5); geotagged photos; lot-record sample page.
- verification_areas: `PROCESS_METHOD`, `LOT_TRACEABILITY`, `ALLERGEN_CONTROL` (food), `STORAGE_CONDITIONS`.

---

## 4 · Remote video witness (where lawful)

| Rule | Detail |
|---|---|
| Consent first | At the start of every call: state who is present, the purpose, and ask for consent to record. Consent captured on the recording and logged as `recording_consent_ref`. |
| All-party consent everywhere | Some US states require **every** party's consent to record (commonly listed: California, Delaware, Florida, Illinois, Maryland, Massachusetts, Montana, New Hampshire, Pennsylvania, Washington; Michigan, Oregon and Connecticut have partial or disputed all-party rules). **Maryland is all-party — the current 5 candidates are in Cecil County MD.** Program rule: *always* obtain all-party consent regardless of state, so the program never depends on which state applies. **Counsel must confirm the list.** |
| If recording refused | Witness proceeds unrecorded with **two** reviewers present taking contemporaneous notes; evidence_type = `LIVE_VIDEO_WITNESS_UNRECORDED`. Tier 3 then requires on-site audit instead. |
| Outside the US | Local recording/data law (e.g. GDPR in the EU) — HOLD until counsel reviews. |
| What must be shown | Owner face + ID (§2); live pan of facility; a current-date object (today's newspaper or a code word the reviewer gives on the call) to prevent pre-recorded video; the product being made. |
| Minors | Do not film minors; ask that they be out of frame. |
| Storage | Recording in secure storage (§11); evidence_ref points to it; SHA-256 hash stored. |

---

## 5 · On-site audit — when required

| Trigger | On-site required? |
|---|---|
| Tier 1 | No (video witness + sample suffice) |
| Tier 2 | Only if video witness failed/refused, or a sample failed once |
| Tier 3 | **Yes, before first sale**, then at every annual renewal |
| Tier 4 | Not onboarded (§7) |
| Any tier | Complaint alleging safety, labor or fraud issue; failed lab test; capacity claim far above witnessed rate (declared > 1.5 × witnessed); change of facility |

Auditor ≠ the person who ran the video witness. Audit report → evidence_type `ONSITE_AUDIT_REPORT`.

---

## 6 · Sample tests by category

Samples are **collected or received by THYLORA under chain of custody** and sent to a third-party lab accredited to
**ISO/IEC 17025** for the method. Lab prices: **UNKNOWN**. Acceptance limits come from the named reference, recorded per result.

| Category | Tests | Reference for limits |
|---|---|---|
| Herbs (culinary, whole/cut dried) | **Identity** (macroscopic/microscopic and/or HPTLC or FTIR vs. reference); **heavy metals** — lead, cadmium, arsenic, mercury by ICP-MS; **microbial** — total aerobic count, yeast & mold, *E. coli*, *Salmonella*; moisture / water activity | USP general chapters for elemental impurities (e.g. <2232> for supplements) and microbial limits (<2021>/<2022>) as benchmarks; lab's stated limits. California Prop 65 warning thresholds if selling into CA — counsel check |
| Herbs (ground) | Above + **Salmonella emphasis** (ground spices carry higher risk) + pesticide residue screen | as above; EPA tolerances for residues |
| Herbal supplements / teas with any functional claim | Above + identity testing of every dietary ingredient per 21 CFR 111 + pesticide screen; DSHEA label check | 21 CFR 111; Tier 3 |
| Food — cottage food | Label check (name, ingredients, allergens, net qty in oz and g, maker address, cottage-food statement required by the state); pH / water activity where state requires to prove non-TCS; no shipping across state lines unless the state law allows it — **most state cottage laws restrict to in-state direct sales; verify per state** | State cottage-food law |
| Food — licensed kitchen | Above + microbial per product type; nutrition facts (unless exempt); allergen (FALCPA major allergens incl. sesame) | FDA labeling rules; state license |
| Shirts / apparel | Fiber content + care label + country of origin present and accurate; wash test (3 washes, colorfastness, shrink % measured in inches and cm); print adhesion. **Children's apparel:** CPSIA lead in surface coatings/inks, flammability (16 CFR 1610), drawstring rules — third-party CPSC-accepted lab | FTC Textile Act, Care Labeling Rule; CPSIA |
| Printers | Color proof vs. spec; paper weight (gsm and lb); trim tolerance (± in / mm); for children's printed products: CPSIA lead in ink/coating | CPSIA for children's items |
| Craft | Adult items: finish/durability check. **Children's items (≤12):** CPSIA testing + Children's Product Certificate + tracking label; ASTM F963 for toys; lead in jewelry | CPSIA |

---

## 7 · Risk-tier matrix

| Tier | Name | Typical products | Witness minimum | On-site | Lab | Tribunal (≥3) for approval? | Follow-up cadence |
|---|---|---|---|---|---|---|---|
| 1 | LOW | Adult craft, printed paper goods for adults, adult apparel from established printers | Live video + physical sample | On trigger only | Physical QC; no lab unless material concern | No (2 reviewers) | Every 12 months |
| 2 | MODERATE | Whole/cut dried culinary herbs, shelf-stable cottage foods (non-TCS), handmade adult apparel | Live video + our sample to accredited lab | On trigger | Yes, first lot + 1 lot per 6 months | **Yes** | Every 6 months + every new product |
| 3 | HIGH | Ground herbs/spices, herbal teas or supplements with any functional claim, licensed-kitchen foods, any product for children ≤12, pet treats *made for sale under state feed rules* | Video + **on-site audit** + our sample | **Yes, before first sale** and yearly | Yes, **every lot** (COA) + our own spot test | **Yes** | Every 3 months + per lot |
| 4 | RESTRICTED | Time/temperature-control foods (meat, dairy, cooked perishables), raw milk, infant food, botanicals of known safety concern (e.g. comfrey for internal use, kava, ephedra-type), pet food as complete diet, anything with a disease claim | — | — | — | — | **Not onboarded.** Program declines. Revisit only by Chairman APPROVAL_REQUIRED with licensed-facility + regulatory inspection record |

Tier is the **highest** tier of any product the producer supplies through THYLORA.

---

## 8 · Quality, labor/safety, and rights criteria

**Quality (all tiers):** product matches sample; lot numbers on every unit; labels accurate (net quantity in oz and g); no claim beyond
what is verified; defect rate on delivered units ≤ 2% (HEURISTIC threshold) measured per quarter; packaging protects product in transit.

**Labor / safety:**
- No forced labor; no child labor beyond what federal and state law permit (e.g. FLSA agricultural exemptions for a parent's own farm) — Anika Sørensen-Vale role reviews any minor working.
- Workers paid at least applicable minimum wage (employees); family members/owners exempt from wage terms but covered by the work-rest rule (§10).
- Basic safety: first-aid kit, safe chemical storage, pesticide applicator certification where restricted-use pesticides are applied, dust/heat protection for printers and dryers.
- verification_areas: `LABOR_PRACTICES`, `WORKPLACE_SAFETY`, `PESTICIDE_USE`.

**Rights (maker designs):**
- Maker keeps all IP in their designs, names and marks.
- THYLORA receives a **non-exclusive, revocable license** to show the maker's product photos, name and story only for listing and selling that product; ends on revocation/exit (listings removed within 7 days).
- Before listing: reviewer checks the design is the maker's own (maker attestation + reverse-image search) and runs a USPTO trademark search on product names.
- No THYLORA co-branding of a maker's mark without a separate written license (Priya Nwosu role).
- verification_areas: `RIGHTS_IP`, `TRADEMARK_CHECK`.

---

## 9 · Capacity limits — `MATH-SUPPLIER-UTILIZATION-624` (PROPOSED, not registered)

**Effective capacity:** C = min(C_dec, C_wit, H_dec × r_wit)  **Utilization:** U = L ÷ C  **Acceptance:** accept order q only if (L + q) ÷ C ≤ U_max

| Symbol | Name | Units | Domain |
|---|---|---|---|
| C_dec | Declared capacity | units/week (unit named per supplier, e.g. jars of 8 oz / 227 g) | ≥ 0 |
| C_wit | Witnessed capacity (from video/on-site timing, extrapolated to a week) | units/week | ≥ 0; **must be non-NULL** — if NULL, C is NULL and no orders route (no paper-only capacity) |
| H_dec | Declared maximum weekly work hours | hours/week | 0 – 168 |
| r_wit | Witnessed production rate | units/hour | > 0 |
| C | Effective verified capacity | units/week | ≥ 0 |
| L | Committed load (accepted, not yet delivered, for the week) | units/week | ≥ 0 |
| q | Proposed new order | units | > 0 |
| U | Utilization | unitless | 0 – ∞ (should stay ≤ U_max) |
| U_max | Utilization ceiling | unitless | default **0.80** |

- **Scale / threshold:** U ≤ 0.80 routes normally; 0.80 < U ≤ 1.0 → no new orders (overflow); U > 1.0 → supplier is overcommitted → alert + renegotiate dates.
- **Assumptions:** production rate roughly constant; one capacity unit per product line (multi-product suppliers get one row per line — future work).
- **Failure condition:** C_wit or r_wit missing → C = NULL → supplier cannot receive orders. Rate varies strongly by season → re-witness.
- **Plain English:** we only send a maker orders up to 80% of what we have actually seen them make in the hours they said they want to work.
- **Child-readable:** if a baker can really make 10 pies, we only ask for 8, so they have room to breathe.
- **Worked example:** C_dec = 110 jars/wk, C_wit = 100 jars/wk, H_dec = 30 h/wk, r_wit = 4 jars/h → H_dec × r_wit = 120 → C = min(110, 100, 120) = **100 jars/wk**. L = 70 → U = 0.70. New order q = 15 → (70 + 15) ÷ 100 = 0.85 > 0.80 → accept 80 − 70 = **10 jars**, route **5 jars** to overflow (§12). Hours check: 80 jars ÷ 4 jars/h = 20 h ≤ 30 h ✔.
- **Class: ENGINEERING_CONSTRAINT** (the min() and the ratio are arithmetic facts about capacity); the **0.80 ceiling is a HEURISTIC** choice.

---

## 10 · Family-life / work-rest protection

1. **Hours cap:** no order routes if committed hours (L + q) ÷ r_wit would exceed H_dec. Checked in §9 alongside U.
2. **Rest days:** the producer's declared rest days (stored as `rest_days`) are never scheduled production or pickup days. Delivery due dates are computed skipping rest days.
3. **No penalty for declining:** a producer may decline any order; declines do not lower the trust score (D in §15 counts only *accepted* orders).
4. **No rush override:** THYLORA staff cannot override the cap or rest days to meet a deadline; the order goes to overflow or waits. Override requires the producer's own written request, logged.
5. **Seasonal / family blackout dates** honored like rest days.
6. **Free planner:** every applicant receives the Producer Capacity & Rest Planner (Lane G, G-07) free.

---

## 11 · Security — handling supplier documents

| Rule | Detail |
|---|---|
| Where | Private, encrypted storage bucket with row-level access limited to the verification desk; **never** in this Git repo or any public path. |
| What the table holds | `evidence_ref` = storage pointer; `evidence_sha256` = file hash; `claimed_value` never holds a full TIN, ID number, bank number or DOB. |
| Minimize | ID is sighted, not stored. W-9 stored only if payouts require it; TIN shown masked (last 4). |
| Access log | Every open of a supplier document logged (who, when, why). |
| Retention | Keep while active + a retention period set by counsel (UNKNOWN; tax records often require multi-year retention); then delete and record deletion. |
| Breach | Notify affected producers per applicable state breach law (Elena Marrow role). |
| Recordings | Same bucket; retention shorter than tax docs unless under dispute. |

---

## 12 · Follow-up checks, revocation, overflow routing

**Follow-up cadence:** Tier 1: 12 months · Tier 2: 6 months · Tier 3: 3 months + every lot. Plus event-triggered checks: complaint,
failed test, license expiry, facility change, U > 1.0, ownership change. Each check = a new verification record (`FOLLOW_UP_CHECK`);
expired evidence (`valid_until` passed) drops the area back to EXPIRED and pauses routing if the area is required for the tier.

**Revocation:**

| Step | Rule |
|---|---|
| Grounds | Failed safety test; fraud/falsified evidence; disease claim after warning; labor violation; license lapse; repeated quality failure (defect rate > 2% two quarters running); refusal of a required follow-up; IP infringement. |
| Immediate suspension | Safety or fraud grounds → routing paused at once (single reviewer may suspend; suspension is *not* revocation). Affected lots pulled; buyers notified if a safety issue. |
| Notice | Written notice within 3 business days: grounds, evidence refs, what would cure it. |
| Decision | **Revocation requires a tribunal of ≥ 3 independent reviewers** (§13.3). |
| Appeal | Producer may appeal within 30 days; heard by a **fresh** tribunal of 3 with no overlap with the first. Producer may submit new evidence and be heard live. |
| After | Delivered conforming goods are paid. In-flight orders go to overflow. Maker's listings removed within 7 days. Reinstatement = new application at the same or higher tier. |

**Overflow routing:** when an order (or its remainder) cannot be accepted under §9/§10:
1. Candidates = suppliers VERIFIED for the same product type **at or above** the tier the product requires.
2. Exclude any with U after acceptance > 0.80, any hours breach, any rest-day conflict, any suspension.
3. Rank by: trust score T (§15) descending, then lowest current U, then shortest distance (miles and km).
4. Split only if lots are interchangeable for the buyer (same product spec); otherwise route whole.
5. If no supplier qualifies → buyer is told the true wait date or the order is declined. **Never** override a cap.
6. Every routing decision is logged with U before/after.

---

## 13 · Mapping onto existing tables (no parallel registry)

### 13.1 · Which table holds what

| Existing table | Role in the program |
|---|---|
| `thylora_farmer_candidates` | **The single producer registry** for all six categories (farmers, herbal, shirt, food, printers, craft) — the name is legacy; a `producer_category` column (§14) records the category. Capacity, rest, tier, trust score, status live here. |
| `thylora_farmer_verification_records` | One row per claim per check, using existing columns: `verification_area`, `claimed_value`, `evidence_type`, `evidence_ref`, `verification_state`, `reviewer_committee`. |
| `thylora_kitchen_suppliers` | Stays the kitchen's buying list. A kitchen supplier that goes through the trust program gets a pointer to its candidate row (§14) — its verification lives in the records table, not duplicated. |

### 13.2 · `verification_area` values to use

| Area | Applies to | Required at tier |
|---|---|---|
| `IDENTITY_OWNER` | all | 1+ |
| `BUSINESS_REGISTRATION` | all | 1+ |
| `TAX_IDENTITY` | paid suppliers | 1+ |
| `LOCATION_FACILITY` | all | 1+ |
| `PROCESS_METHOD` | all | 1+ |
| `LOT_TRACEABILITY` | food, herbs, children's items | 2+ |
| `LICENSE_PERMIT` | food, herbs, feed | 2+ |
| `ORGANIC_CLAIM` | only if "organic" claimed | 2+ |
| `INSURANCE_LIABILITY` | all | 3 (recommended 2) |
| `REFERENCE_CHECK` | all | 2+ |
| `REMOTE_WITNESS` | all | 1+ |
| `ONSITE_AUDIT` | tier 3 / triggers | 3 |
| `SAMPLE_PHYSICAL_QC` | all | 1+ |
| `SAMPLE_LAB_IDENTITY` | herbs | 2+ |
| `SAMPLE_LAB_HEAVY_METALS` | herbs, supplements | 2+ |
| `SAMPLE_LAB_MICROBIAL` | herbs, food | 2+ |
| `SAMPLE_LAB_PESTICIDE` | ground herbs, supplements | 3 |
| `LABEL_COMPLIANCE` | food, herbs, apparel | 2+ |
| `ALLERGEN_CONTROL` | food | 2+ |
| `STORAGE_CONDITIONS` | food, herbs | 2+ |
| `TEXTILE_LABELING` | apparel | 1+ |
| `CHILD_PRODUCT_SAFETY` | any item for ≤12 | 3 |
| `LABOR_PRACTICES` | all | 1+ |
| `WORKPLACE_SAFETY` | all | 2+ |
| `PESTICIDE_USE` | farmers/herbal | 2+ |
| `RIGHTS_IP` / `TRADEMARK_CHECK` | makers with designs | 1+ |
| `CAPACITY_DECLARED` / `CAPACITY_WITNESSED` | all | 1+ |
| `WORK_REST_DECLARATION` | all | 1+ |
| `DATA_RECORDING_CONSENT` | all | 1+ |
| `FOLLOW_UP_CHECK` / `REVOCATION_EVENT` / `APPEAL_EVENT` | lifecycle | — |

The 80 existing rows (80 ÷ 5 = 16 per candidate on average — arithmetic, not a read) use area values **not read in this lane**. Before any
insert, production director runs `select verification_area, verification_state, evidence_type, count(*) from thylora_farmer_verification_records group by 1,2,3;`
and maps each existing value to the list above (keep existing values that already match; do not rename existing rows without review).

**`evidence_type` values:** `DOCUMENT_SCAN` (paper), `REGISTRY_LOOKUP` (reviewer-performed), `LIVE_VIDEO_WITNESS`, `LIVE_VIDEO_WITNESS_UNRECORDED`,
`ONSITE_AUDIT_REPORT`, `PHYSICAL_SAMPLE`, `LAB_COA_THIRD_PARTY_OUR_SAMPLE`, `LAB_COA_SUPPLIER_PROVIDED` (paper), `PHOTO_GEOTAGGED`, `REFERENCE_CALL`.
Paper types alone never make an area VERIFIED.

**`verification_state` values:** `AWAITING_EVIDENCE` (current state of all 80) → `EVIDENCE_RECEIVED` → `UNDER_REVIEW` → `VERIFIED` /
`VERIFIED_CONDITIONAL` / `FAILED`; later `EXPIRED`, `SUSPENDED`, `REVOKED`. Existing exact spelling must be read back first.

### 13.3 · Tribunal rule (continuity redundancy rule)

High-impact decisions need a **tribunal of ≥ 3 independent reviewers**, recorded in `reviewer_committee` plus `reviewer_ids` (§14):
- **High-impact** = Tier 2 or 3 approval; any revocation; any appeal; any capacity override request; any Tier change downward; reinstatement.
- **Independent** = no financial interest in the supplier, no family/household relation, not the person who ran the witness/audit being judged, and **at least one reviewer outside the purchasing desk**.
- Decision = majority of ≥3 with written reasons; dissent recorded. Tier 1 approval = 2 reviewers.

---

## 14 · Proposed ADDITIVE migration (text only — NOT applied)

Precondition (read-only, run first): confirm column names/types so nothing duplicates:
`select table_name, column_name, data_type from information_schema.columns where table_name in ('thylora_farmer_candidates','thylora_farmer_verification_records','thylora_kitchen_suppliers') order by 1, ordinal_position;`
If any column below already exists under another name, **drop it from this migration and map to the existing one.**
The primary-key type of `thylora_farmer_candidates` is UNKNOWN to this lane — `<CANDIDATE_PK_TYPE>` must be replaced after readback.

```sql
-- WR-SPINE-624 · Lane H · PROPOSED additive migration · NOT APPLIED
-- Additive only: ADD COLUMN IF NOT EXISTS; no drops, no renames, no constraint on existing values.

-- 1. Producer registry (existing table, legacy name)
alter table public.thylora_farmer_candidates
  add column if not exists producer_category          text[],          -- FARMER|HERBAL|SHIRT_MAKER|FOOD_MAKER|PRINTER|CRAFT
  add column if not exists risk_tier                  smallint check (risk_tier between 1 and 4),
  add column if not exists trust_status               text,            -- APPLICANT|ACTIVE|SUSPENDED|REVOKED|DECLINED|EXITED
  add column if not exists capacity_unit              text,            -- e.g. 'jar 8 oz / 227 g'
  add column if not exists capacity_declared_per_week numeric check (capacity_declared_per_week >= 0),
  add column if not exists capacity_witnessed_per_week numeric check (capacity_witnessed_per_week >= 0),
  add column if not exists rate_witnessed_per_hour    numeric check (rate_witnessed_per_hour > 0),
  add column if not exists declared_weekly_hours      numeric(5,2) check (declared_weekly_hours between 0 and 168),
  add column if not exists rest_days                  text[],          -- ISO weekday names
  add column if not exists blackout_dates             daterange[],
  add column if not exists committed_load_per_week    numeric default 0 check (committed_load_per_week >= 0),
  add column if not exists utilization_max            numeric(3,2) default 0.80 check (utilization_max > 0 and utilization_max <= 1),
  add column if not exists effective_capacity_per_week numeric generated always as (
      case when capacity_witnessed_per_week is null or rate_witnessed_per_hour is null
                or declared_weekly_hours is null or capacity_declared_per_week is null
           then null   -- no paper-only capacity
           else least(capacity_declared_per_week, capacity_witnessed_per_week,
                      declared_weekly_hours * rate_witnessed_per_hour) end) stored,
  add column if not exists trust_score                numeric(5,2) check (trust_score between 0 and 100),
  add column if not exists trust_score_provisional    boolean default true,
  add column if not exists trust_score_computed_at    timestamptz,
  add column if not exists next_check_due             date,
  add column if not exists suspended_at               timestamptz,
  add column if not exists revoked_at                 timestamptz,
  add column if not exists appeal_deadline            date,
  add column if not exists story_publish_consent      boolean default false;

-- 2. Verification records (existing table)
alter table public.thylora_farmer_verification_records
  add column if not exists risk_tier                   smallint check (risk_tier between 1 and 4),
  add column if not exists reviewer_ids                text[],
  add column if not exists reviewer_independence_attested boolean default false,
  add column if not exists tribunal_quorum_met         boolean generated always as (coalesce(cardinality(reviewer_ids), 0) >= 3) stored,
  add column if not exists is_witnessed_evidence       boolean default false,   -- true only for non-paper evidence types
  add column if not exists evidence_sha256             text,
  add column if not exists evidence_captured_at        timestamptz,
  add column if not exists recording_consent_ref       text,
  add column if not exists consent_jurisdiction        text,                    -- e.g. 'US-MD'
  add column if not exists lab_name                    text,
  add column if not exists lab_accreditation           text,                    -- e.g. 'ISO/IEC 17025 cert #...'
  add column if not exists result_reference_limit      text,                    -- e.g. 'USP <2232> Pb'
  add column if not exists valid_until                 date,
  add column if not exists next_check_due              date,
  add column if not exists supersedes_record_ref       text;

-- 3. Kitchen suppliers (existing table) → point to the one producer registry
alter table public.thylora_kitchen_suppliers
  add column if not exists producer_candidate_id <CANDIDATE_PK_TYPE>
      references public.thylora_farmer_candidates(<CANDIDATE_PK_COLUMN>),
  add column if not exists trust_program_status text;   -- NOT_ENROLLED|ENROLLED|VERIFIED|SUSPENDED|REVOKED
```

**Added columns (summary):** candidates +21 (`producer_category`, `risk_tier`, `trust_status`, `capacity_unit`, `capacity_declared_per_week`,
`capacity_witnessed_per_week`, `rate_witnessed_per_hour`, `declared_weekly_hours`, `rest_days`, `blackout_dates`, `committed_load_per_week`,
`utilization_max`, `effective_capacity_per_week` (generated), `trust_score`, `trust_score_provisional`, `trust_score_computed_at`,
`next_check_due`, `suspended_at`, `revoked_at`, `appeal_deadline`, `story_publish_consent`); verification records +15 (`risk_tier`,
`reviewer_ids`, `reviewer_independence_attested`, `tribunal_quorum_met` (generated), `is_witnessed_evidence`, `evidence_sha256`,
`evidence_captured_at`, `recording_consent_ref`, `consent_jurisdiction`, `lab_name`, `lab_accreditation`, `result_reference_limit`,
`valid_until`, `next_check_due`, `supersedes_record_ref`); kitchen suppliers +2 (`producer_candidate_id`, `trust_program_status`).
RLS: supplier rows readable only by the verification desk role (policy text to be written after role names are read back).

---

## 15 · Trust score — `MATH-SUPPLIER-TRUST-SCORE-624` (PROPOSED, not registered)

**T = 100 × (w_V·V + w_Q·Q + w_D·D + w_R·R + w_F·F) × (1 − P)**

| Symbol | Name | Definition | Units | Domain |
|---|---|---|---|---|
| T | Trust score | — | points | 0 – 100 |
| V | Verification completeness | (# required areas for the tier in VERIFIED with witnessed evidence) ÷ (# required areas for the tier) | unitless | 0 – 1 |
| Q | Sample quality pass rate | passed lab/QC samples ÷ tested samples, last 12 months | unitless | 0 – 1 |
| D | Delivery reliability | accepted orders delivered complete and on time ÷ accepted orders due, last 12 months (declines excluded — §10) | unitless | 0 – 1 |
| R | Document currency | required documents unexpired ÷ required documents | unitless | 0 – 1 |
| F | Follow-up pass rate | follow-up checks passed ÷ follow-up checks held, last 24 months | unitless | 0 – 1 |
| P | Open-issue penalty | 0 none; 0.10 open minor complaint; 0.25 open quality failure; 0.50 open labor/rights issue (take the largest) | unitless | 0 – 0.5 |
| w_V, w_Q, w_D, w_R, w_F | Weights | 0.35, 0.25, 0.15, 0.10, 0.15 (sum = 1.00) | unitless | fixed |

- **No history:** if D or F has no events yet, use prior 0.5 and set `trust_score_provisional = true`.
- **Hard gates (override T):** any failed safety test or proven fraud → T = 0 and suspension, regardless of formula. V < 1.0 → **not eligible** at Tier 3 no matter what T is.
- **Bands (HEURISTIC):** T ≥ 85 good standing · 70 ≤ T < 85 standard · 50 ≤ T < 70 watch (follow-up moved earlier) · T < 50 tribunal review.
- **T never approves anyone by itself** — approval is the tribunal's (§13.3). T is used for overflow ranking and review scheduling.
- **Assumptions:** the weights are judgment; small sample counts make Q, D, F noisy.
- **Failure condition:** fewer than 3 events behind Q, D or F → treat as provisional; T is unreliable for ranking between two new suppliers.
- **Plain English:** a score that mostly rewards proven checks and good samples, a little for on-time delivery and up-to-date papers, and drops when there's an open problem.
- **Child-readable:** the more we've seen with our own eyes that you do good work, the higher your number.
- **Worked example (new Tier 2 herb grower):** V = 12 ÷ 16 = 0.75, Q = 1 ÷ 1 = 1.0, D = 0.5 (prior), R = 4 ÷ 5 = 0.8, F = 0.5 (prior), P = 0 →
  0.35×0.75 = 0.2625; 0.25×1.0 = 0.25; 0.15×0.5 = 0.075; 0.10×0.8 = 0.08; 0.15×0.5 = 0.075; sum = 0.7425 → **T = 74.25 (provisional, "standard")**.
  Still **not approved**: V < 1 means 4 required areas are missing.
- **Class: HEURISTIC.**

---

## 16 · Supplier tiers defined

4 risk tiers (§7): **1 LOW, 2 MODERATE, 3 HIGH, 4 RESTRICTED (declined)**. Status lifecycle: APPLICANT → ACTIVE (with tier) →
SUSPENDED / REVOKED / EXITED; DECLINED for Tier 4.

---

## Status table

| Item | State |
|---|---|
| World guild (EdereAirah first) | DONE as PROPOSED spec; no names, no personnel |
| Application fields, identity, facility, video witness, on-site, sample tests, quality, labor, rights, security | DONE (spec) |
| Risk-tier matrix (4 tiers) | DONE |
| Capacity math (U = L/C, 0.80) + work-rest protection | DONE (ENGINEERING_CONSTRAINT + HEURISTIC threshold) |
| Trust score | DONE (HEURISTIC) |
| Table mapping + area/evidence/state vocab | DONE; existing 80-row values NOT read |
| Additive migration | TEXT ONLY — not applied; PK type UNKNOWN |
| Legal lists (recording consent states, cottage food, lab limits) | PARTIAL — counsel confirmation required |
| Lab prices, retention period | UNKNOWN |

## Next executable work

| # | Work | Class | Owner | Blocker | Release condition | Next action |
|---|---|---|---|---|---|---|
| 1 | Read existing schema + 80-row vocab | NOW | Production director | none | query results in workroom | run the two read-only selects (§13.2, §14) |
| 2 | Apply migration | APPROVAL_REQUIRED | Chairman → production director | #1 readback; PK type | reviewed + approved SQL | substitute PK type, review, then apply centrally |
| 3 | Send application to 5 Cecil County candidates | QUEUED_WITH_DEPENDENCY | Mara Ellison (Food & Ingredient Investigator) | consent/recording script review | counsel OK on Maryland all-party consent script | draft consent script |
| 4 | Pick an ISO/IEC 17025 lab + price list | QUEUED_WITH_DEPENDENCY | Caleb Ishikawa role | no lab chosen | written quote for identity/metals/micro panel | request 2 quotes |
| 5 | Name 3+ independent reviewers | APPROVAL_REQUIRED | Chairman | no reviewer roster | ≥3 names recorded with independence attestations | propose roster from existing legal roles + one outside |
| 6 | Retention period + storage bucket | QUEUED_WITH_DEPENDENCY | Elena Marrow role | counsel decision | written retention rule | ask counsel |
| 7 | World guild proper name | HOLD_FOR_EVIDENCE | Name desk | NAME-FREQUENCY check | name passes the law | run the check |
| 8 | Register MATH-SUPPLIER-UTILIZATION-624 / MATH-SUPPLIER-TRUST-SCORE-624 | APPROVAL_REQUIRED | Production director | central registry write | approved | submit both equations |

## Restart point

Lane H designed a witness-over-paper supplier trust program for six small-producer categories, EdereAirah guild first (PROPOSED, no
names or personnel), then the Earth program. It reuses `thylora_farmer_candidates` as the single producer registry,
`thylora_farmer_verification_records` for every claim (area vocabulary in §13.2), and links `thylora_kitchen_suppliers` to it. Four risk
tiers; Tier 4 is declined. Capacity rule C = min(declared, witnessed, hours × rate), U = L/C ≤ 0.80, with hours and rest-day caps that
staff cannot override. Trust score T is HEURISTIC and never approves by itself; ≥3 independent reviewers decide high-impact actions. The
additive migration (§14) is text only. A cold reader resumes by running the two read-only schema/vocabulary selects, replacing
`<CANDIDATE_PK_TYPE>`, and getting counsel sign-off on the Maryland all-party recording-consent script before contacting the 5 candidates.
