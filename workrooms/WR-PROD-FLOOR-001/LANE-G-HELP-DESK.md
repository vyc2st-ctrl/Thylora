# WR-PROD-FLOOR-001 · LANE G · THYLORA Library / Earth Help Desk

**Lane:** G, THYLORA LIBRARY / EARTH HELP DESK
**Date:** 2026-09-28
**Built by:** Lane G team, production floor session
**Backend:** not written. Nothing from this lane was written to `thylora-dash`. This file ends with a BACKEND CHANGE PACKET for someone to import.
**Code:** `helpdesk/lib/intake.js` (engine) and `tests/helpdesk.test.mjs` (17 tests). Full suite: **65 / 65 pass** (48 existing + 17 new) from `node --test tests/*.test.mjs`, run 2026-09-28.
**Truth classes used in this file:** `RECOVERED` means read from `00-RECOVERED-STATE.md` or the repo. `BUILT` means it exists in a file in this lane and tests check it. `PROPOSED` means new design that needs approval before it becomes canon. `SAMPLE` means illustrative numbers, not a real person. `VERIFY_LOCALLY` means a real office has to confirm it before anyone relies on it.

---

## 0 · Source atoms: Lane G, every word

The directive text for Lane G, split into atoms. Each atom has one state.

| # | Source atom (verbatim) | State | Where handled |
|---|---|---|---|
| G1 | "Build THYLORA as a place people COME TO for:" | EXECUTED | §1 service model, §3 categories, engine |
| G2 | "verified information" | EXECUTED | §3.1 |
| G3 | "legal/resource navigation" | EXECUTED | §3.2 |
| G4 | "billing disputes" | EXECUTED | §3.3 plus the full engine |
| G5 | "landlord/tenant resource navigation" | EXECUTED | §3.4 plus the full engine |
| G6 | "school help" | EXECUTED (design) | §3.5 |
| G7 | "family help" | EXECUTED (design) | §3.6 |
| G8 | "benefits/resources" | EXECUTED (design) | §3.7 |
| G9 | "business problem solving" | EXECUTED (design) | §3.8 |
| G10 | "historical research" | EXECUTED (design) | §3.9 |
| G11 | "product/service comparison" | EXECUTED (design) | §3.10 |
| G12 | "institutional gap reports" | EXECUTED (design) | §3.11 |
| G13 | "Do not replace licensed lawyers/doctors/accountants." | EXECUTED | §1, engine `DISCLAIMER`, `findLegalConclusions` guard, test "no legal conclusion…" |
| G14 | "Build navigation + evidence + questions + referrals + records." | EXECUTED | §1 (five functions mapped to engine functions) |
| G15 | "User example: high water bill / unresolved landlord-plumbing issue." | EXECUTED | §6 worked example |
| G16 | "Design intake:" | EXECUTED | §4 schema, `INTAKE_SCHEMA` |
| G17 | "timeline" | EXECUTED | `timeline[]`, sorted in the packet, tested |
| G18 | "bills" | EXECUTED | `bills[]`, anomaly math, tested |
| G19 | "photos" | EXECUTED | `photos[]` with `capture_date`, tested |
| G20 | "communications" | EXECUTED | `communications[]` date/party/channel/direction/summary |
| G21 | "lease/ownership responsibility" | EXECUTED | `tenancy.lease_clause`, `routeResponsibility` (questions only) |
| G22 | "local utility process" | EXECUTED (pluggable) / real entries DEFERRED_WITH_DEFINED_DEPENDENCY | `UTILITY_DISPUTE` resource class; §10 item N2 |
| G23 | "local housing law/resources" | EXECUTED (pluggable) / real entries DEFERRED_WITH_DEFINED_DEPENDENCY | `HOUSING_CODE`, `TENANT_RESOURCE`, `LEGAL_AID`; §10 item N2 |
| G24 | "repair evidence" | EXECUTED | `repair_evidence[]`; the sample case's one open gap |
| G25 | "escalation path" | EXECUTED | `buildEscalationPath`, 5 steps, tested |
| G26 | "cost exposure" | EXECUTED | `summarizeCostExposure`, tested |
| G27 | "next questions" | EXECUTED | `nextQuestions`, packet §10 |
| G28 | "Then generate a case packet and resource route." | EXECUTED | `buildCasePacket`, packet shown in §6.4 |

No atom is dropped. The atoms marked DEFERRED list their owner, dependency, release condition and next action in §10.

---

## 1 · Service model: what THYLORA Help Desk is, and what it is not

**It is** a library and a help desk. A person brings a problem. THYLORA helps them put it in order and shows them where to take it. It does five things. Each one maps to a function in the engine:

| Function | What the person gets | Engine |
|---|---|---|
| **Navigation** | Which office, in what order, and why | `buildEscalationPath`, `lookupResource` |
| **Evidence** | Their papers in order: timeline, bills, photos, messages, repairs | `validateIntake`, evidence index, communications log |
| **Questions** | The exact questions to ask, and the lease clause to read | `routeResponsibility`, `nextQuestions` |
| **Referrals** | Resource classes such as utility dispute desk, housing code, tenant center, legal aid, small claims (information only) | `RESOURCE_CLASSES`, pluggable resource map |
| **Records** | A dated case packet they own, with account numbers redacted and a retention period they chose | `buildCasePacket`, `redactAccount`, `scrubText` |

**It is not:**

- **A law firm.** It does not represent anyone. It does not give legal advice. It never says who is liable, who is at fault, or who owes money. The engine checks every packet it writes for conclusion phrases and refuses to produce a packet that contains one (`findLegalConclusions`). The router's decision is always `NOT_DECIDED_BY_SOFTWARE`.
- **A lawyer, doctor, accountant, housing inspector or utility.** When someone needs one of these, the route sends them there.
- **An intermediary.** By default THYLORA contacts no one on the person's behalf. `contact_third_parties: false` is the default, and the person sends every message themselves.
- **A promise of an outcome.** Money figures are labelled EMPIRICAL MODEL, and their assumptions are printed next to them.

**Legal information versus legal advice:** where this line falls differs by jurisdiction. The design stays on the information side. It explains processes, organizes the person's own evidence, asks questions, and names office classes. It does not apply law to the person's facts. Whether that boundary holds in a particular jurisdiction is itself `APPROVAL_REQUIRED`: DEPT-LEGAL-COMP-001 has to review it (§10, N4).

**Crisis rule:** if there is flooding, sewage, no water, or electrical danger, the route tells the person to call emergency services or the utility's emergency line first. Paperwork can wait. Nothing on a crisis path costs money (§8).

---

## 2 · EdereAirah origin (World-First Law)

### 2.1 What the backend already records (RECOVERED, not invented)

- `THY-DEPT-QUESTION-NAV-001` is a department row, state `active`. Its charter text was **not read** in this session, so its internal procedures are UNKNOWN.
- `THY-WORLD-DOUBT-REMOVER-607` is a department row, state `chairman_review_required`. Its person on file is **Naya Aven**, *Director of Access and Follow-Through*, residence MUNZYMUUR (proposed).
- `THY-TRANS-HELP-607` is a DESIGN_ONLY world-to-Earth transmission packet. It already pairs **Naya Aven** with **Elena Marrow** (DEPT-LEGAL-COMP-001, *Director, Privacy, Data & Consumer Protection*).
- `WR-DOUBT-REMOVER-606` is an existing workroom. Its state begins "INBOX_CONNECTE…" and was not read in full.
- `CUSTOMER_HELP_AND_RESOLUTION` is an active department.
- **Samira Vale** (DEPT-LEGAL-COMP-001, *Chief Law Librarian & Constitutional Source Custodian*, Civic Archive Quarter) is canon. She is the canon person whose title already contains "Librarian".
- `thylora_help_intake_index` exists with **0 rows**.

### 2.2 Which department developed the method (PROPOSED, APPROVAL_REQUIRED)

| Role in the method | Department / person | Status |
|---|---|---|
| Method author: "turn a problem into the right questions, in the right order, to the right office" | **THY-DEPT-QUESTION-NAV-001** | Department is canon. Authorship of *this* method is PROPOSED. |
| Follow-through carrier: makes sure the person gets to the next office and does not drop out between steps | **Naya Aven**, THY-WORLD-DOUBT-REMOVER-607 | Person and title are canon. Link to this method is PROPOSED. Her department is itself `chairman_review_required`. |
| Records privacy review: consent, redaction, retention | **Elena Marrow**, DEPT-LEGAL-COMP-001 | Person is canon. Already paired with Naya Aven in THY-TRANS-HELP-607. Review role PROPOSED. |
| Source custody for the resource map: every referral entry must name its source and verification state | **Samira Vale**, DEPT-LEGAL-COMP-001 | Person is canon. Role PROPOSED. |

Method working name: **"Follow-Through Casework"** (PROPOSED; it is not a canon term). It applies QYRIS (Question → Yield → Reason → Inspect → Safeguard) to one person's case:

- **Question:** what is the person actually trying to resolve?
- **Yield:** what evidence do they already hold? (validator, all gaps at once)
- **Reason:** what does the math say, and what does it *not* say? (anomaly and leak models with printed assumptions)
- **Inspect:** which clause, which office, which question? (router and escalation)
- **Safeguard:** no conclusions, redaction, consent, retention, crisis first.

### 2.3 EdereAirah experience → method → Earth adapter

- **EdereAirah experience (PROPOSED framing; no in-world incident is canon yet).** The recovered state contains no EdereAirah housing, utility or water-billing canon. The EdereAirah case that gave rise to the method is therefore **UNKNOWN**. What *is* canon is that a department exists whose job is question navigation, and a director whose job is access and follow-through. This lane does not invent a specific in-world household, bill or incident. The method can be written down, but the case it grew from has to come from the Chairman or from a Lane B transmission (§10, N5).
- **Method.** Follow-Through Casework, as above. It is jurisdiction-neutral by construction: every place-specific fact sits in a pluggable map.
- **Earth context adapter.** EdereAirah settles ordinary payments in **REE**. Earth bills are in USD. They are never mixed (REE↔USD is a reference parity only, per THY-DS-REE-USD). Earth offices (water utility, housing code office, legal aid, small claims) go in the Earth resource map. EdereAirah institution names are OPEN / "DO NOT GUESS", and nothing here fills them.
- **Earth application.** The engine in `helpdesk/lib/intake.js`.
- **Earth evidence.** De-identified, consented outcome counts: how many cases reached step N, and how many gaps closed. These are counts only, never case contents (§7).
- **Improved method → EdereAirah.** Those counts return to THY-DEPT-QUESTION-NAV-001 as method refinements, for example "leak-adjustment programs ask for repair proof, so ask for it at intake".

**Earth does not rescue EdereAirah.** EdereAirah asks Earth for nothing: no money, no rescue, no action for its people. The flow is outward: EdereAirah offers a method, and Earth people use it for their own problems. What comes back is anonymous evidence about whether the method worked. That evidence is not aid.

---

## 3 · Help categories: all eleven

For every category the engine keeps the same core: consent, jurisdiction, timeline, evidence index, communications log, the no-conclusion guard, and a resource route. The table below lists what changes by category. Only **billing disputes / landlord-tenant** is BUILT in code. The other nine are designed to run on the same core (§10, N6).

### 3.1 Verified information
- **Intake fields:** the question in the person's words · where they saw the claim · date seen · what decision depends on it.
- **Evidence types:** the source link or document · a screenshot with capture date · a primary source when one exists.
- **Referral classes:** primary publisher or agency · library reference desk · subject-matter professional.
- **Out of scope:** declaring a contested political or scientific question settled · medical or legal verdicts · anything based on a single unverified source.

### 3.2 Legal / resource navigation
- **Intake fields:** issue type · jurisdiction · deadlines already known · parties (by role) · documents received (notices, summons) · language needs.
- **Evidence types:** notices with dates · court or agency papers · correspondence · IDs of the proceeding (redacted to last 4 in packets).
- **Referral classes:** legal aid · lawyer referral service · court self-help center · public defender (criminal) · agency ombudsman.
- **Out of scope:** telling someone what their rights are in their facts · drafting pleadings · predicting outcomes · representing anyone.

### 3.3 Billing disputes (BUILT)
- **Intake fields:** account holder · provider · account number (stored redacted) · bills with period, usage, unit, amount · rate (marginal and fixed) · disputed flag.
- **Evidence types:** bills (≥3 prior plus the disputed ones) · usage history · meter photos · rate schedule · call and portal logs.
- **Referral classes:** provider billing-dispute desk · leak or adjustment program · utility regulator or consumer protection office · small claims information.
- **Out of scope:** deciding the bill is wrong · promising an adjustment · paying or withholding on anyone's behalf.

### 3.4 Landlord / tenant resource navigation (BUILT with 3.3)
- **Intake fields:** role (tenant / owner) · lease on file · exact lease clause text · notice address · repair request history.
- **Evidence types:** lease pages · written notices · photos with capture dates · repair invoices and work orders · inspection reports.
- **Referral classes:** housing code enforcement · tenant resource center / tenant union · legal aid housing unit · small claims information · mediation service.
- **Out of scope:** deciding who is responsible for a repair · advising on withholding rent · eviction defense strategy (that goes straight to legal aid).

### 3.5 School help
- **Intake fields:** student grade and school (role only in records) · the issue (enrollment, services, discipline, grades, transport) · meetings held · deadlines.
- **Evidence types:** school letters · plans and evaluations · emails with dates · attendance and grade printouts.
- **Referral classes:** school counselor / principal / district office · special-education parent center · education ombudsman · education-law legal aid.
- **Out of scope:** clinical or diagnostic judgments · advocating in meetings · naming or accusing staff publicly.

### 3.6 Family help
- **Intake fields:** household (roles, not names, by default) · need (childcare, elder care, bereavement, custody information, safety) · urgency.
- **Evidence types:** appointment letters · program notices · court orders (redacted) · receipts.
- **Referral classes:** family resource center · 211-type information line (VERIFY_LOCALLY) · domestic-violence hotline for safety · family court self-help · bereavement / funeral assistance programs (ties to Lane D funeral support).
- **Out of scope:** custody advice · therapy · deciding between family members · anything that exposes a person at risk (safety cases collect the minimum and the crisis route comes first).

### 3.7 Benefits / resources
- **Intake fields:** household size · income band (bands only, never exact pay stubs unless the person uploads them) · program of interest · denial or notice letters · deadlines.
- **Evidence types:** application confirmations · notices of decision · proof documents the program lists.
- **Referral classes:** benefits agency office · benefits navigator / screening service · legal aid (appeals) · community action agency.
- **Out of scope:** eligibility determinations · filling applications under the person's identity · appeal representation.

### 3.8 Business problem solving
- **Intake fields:** business type · problem (supplier, customer, permit, cash flow, pricing) · amounts · counterparties by role · documents.
- **Evidence types:** contracts · invoices · permits · correspondence · bank or processor statements (redacted).
- **Referral classes:** small-business development center · SCORE-type mentor network (VERIFY_LOCALLY) · licensing office · accountant · business attorney.
- **Out of scope:** tax advice · audited numbers · legal opinions on contracts · investment advice.

### 3.9 Historical research
- **Intake fields:** subject (person, place, building, family) · period · what is already known · what the answer is for.
- **Evidence types:** archival records · census or land records · newspapers · photos with provenance · oral history (labelled as such).
- **Referral classes:** local historical society · state archives · genealogical library · university special collections.
- **Out of scope:** presenting an inference as a record · publishing living persons' private data · inventing lineage.

### 3.10 Product / service comparison
- **Intake fields:** need · budget · must-haves · deal-breakers · location for service providers.
- **Evidence types:** spec sheets · published prices with date seen · warranty terms · independent test results · recall notices.
- **Referral classes:** consumer protection office · recall database · licensing board lookup for contractors.
- **Out of scope:** paid placement presented as a comparison. Any THYLORA store product in a comparison is flagged `THYLORA_PRODUCT` and never ranked by THYLORA itself.

### 3.11 Institutional gap reports
- **Intake fields:** institution · process step where people get stuck · counts, if the person has them · the person's own case (optional; it is only counted with consent).
- **Evidence types:** de-identified aggregates from consented cases · published institutional rules · timestamps from the process.
- **Referral classes:** institution ombudsman · oversight body · Lane E (Court / Institutional Help) when the gap is a court process.
- **Out of scope:** naming individual staff · publishing any single person's case · accusing wrongdoing. A gap report describes friction in a process, not guilt.

---

## 4 · Intake engine (BUILT)

File: `helpdesk/lib/intake.js`. It is a plain ES module with no dependencies, in the same style as `rae-link/lib/*.js`. Money is integer cents. Volume is integer gallons with litres alongside.

### 4.1 Schema (`INTAKE_SCHEMA`)

| Field | Shape |
|---|---|
| `consent` | `{ recorded, scope[], retention_days, contact_third_parties }` |
| `jurisdiction` | `{ key?, city?, county?, state_or_region?, country? }` |
| `utility_account` | `{ holder: TENANT/LANDLORD/OTHER, account_number, utility_name }` |
| `tenancy` | `{ role, lease_on_file, lease_clause: { section, text } }` |
| `timeline[]` | `{ date YYYY-MM-DD, event, source }` |
| `bills[]` | `{ id, period_start, period_end, usage, unit GAL/CCF/L, amount_cents, disputed }` |
| `rate` | `{ marginal_cents_per_kgal, fixed_cents_per_period, source }` |
| `photos[]` | `{ id, capture_date, subject, file_ref }` |
| `communications[]` | `{ date, party, channel LETTER/EMAIL/TEXT/PORTAL/PHONE/IN_PERSON, direction, summary }` |
| `repair_evidence[]` | `{ date, kind INVOICE/WORK_ORDER/PHOTO/STATEMENT, summary }` |
| `leak` | `{ fixture, gallons_per_minute or gallons_per_day, basis }` |

### 4.2 Validator: every gap at once

`validateIntake(intake)` returns `{ complete, can_build_packet, gaps[], counts }`. Each gap has a `code`, `severity` (BLOCKING / IMPORTANT / HELPFUL), `field`, a plain-language `reason`, and a `route` that says where to get the missing item. Gaps are sorted so BLOCKING comes first. The validator never stops at the first problem.

Codes: `CONSENT_MISSING`, `JURISDICTION_MISSING`, `ACCOUNT_HOLDER_MISSING`, `UTILITY_NAME_MISSING`, `TIMELINE_EMPTY`, `TIMELINE_EVENT_DATE_MISSING`, `BILLS_NONE`, `BILLS_NO_BASELINE`, `BASELINE_THIN`, `BILLS_NO_DISPUTED`, `BILL_PERIOD_MISSING`, `BILL_USAGE_MISSING`, `BILL_AMOUNT_MISSING`, `RATE_MISSING`, `PHOTOS_NONE`, `PHOTO_CAPTURE_DATE_MISSING`, `COMMS_NONE`, `COMM_FIELD_MISSING`, `COMMS_NO_WRITTEN_NOTICE`, `LEASE_CLAUSE_MISSING`, `REPAIR_EVIDENCE_MISSING`, `LEAK_SOURCE_UNKNOWN`. That is **22 codes**.

### 4.3 Other functions

| Function | Output | Never does |
|---|---|---|
| `computeUsageAnomaly(bills, rate)` | baseline, expected, excess (gal, L), excess cost, bill-math check, reconciliation | invent a baseline when none exists (`NO_BASELINE`); report negative excess |
| `estimateContinuousLeak(opts)` | gal/day, gal and L per period, cents per day and per period | treat a guessed rate as measured (a guessed rate is labelled HEURISTIC) |
| `compareLeakToAnomaly(a, k)` | per bill: modelled vs observed, residual, % explained (basis points) | hide the residual |
| `routeResponsibility(intake)` | `decision: NOT_DECIDED_BY_SOFTWARE`, the clause to read (or which sections to look for), questions, who can answer | state who is responsible |
| `buildEscalationPath(intake, map)` | 5 steps with status, attachments, and a resource or a "look up your local X" query | recommend filing suit (small claims is INFORMATION_ONLY) |
| `summarizeCostExposure(a, k)` | billed, baseline-equivalent, excess, ongoing per day and per 30 days, unknowns | say who owes the money |
| `nextQuestions(...)` | gap routes plus meter-read, repair and lease questions | ask more than the case needs |
| `buildCasePacket(intake, opts)` | structured object plus Markdown with 12 sections; throws if an authored legal conclusion appears | print a full account number |

### 4.4 Resource map (pluggable)

`EXAMPLE_RESOURCE_MAP` holds **one** entry, `EXAMPLE-US-CITY`. It is labelled "EXAMPLE ENTRY — not a real jurisdiction", and every contact is `VERIFY_LOCALLY`. It contains no real phone numbers, addresses or legal rules. A real jurisdiction is added by passing `options.resourceMap`. When the key is absent, every class comes back as `Look up your local <class>` with a search string built from the place the person gave (tested).

---

## 5 · Math (MATH RULE)

All seven equations below are **EMPIRICAL MODEL** unless stated otherwise. None is a physical law. The unit of money is the US cent (¢, integer). The unit of volume is the US liquid gallon (gal). **1 gal = 3.785411784 L exactly**, by definition, so that conversion is a FORMAL SYSTEM LAW (a unit definition). **1 CCF = 100 ft³ ≈ 748.052 gal** is a unit conversion, rounded to 3 decimals in code. `round()` means round half away from zero to an integer.

### E1 · Baseline daily usage
**r_base = Σ_p U_p ÷ Σ_p D_p**
- **r_base:** baseline usage rate, gal/day, real ≥ 0.
- **p:** subscript that indexes the *undisputed* (prior) bills. **Σ_p** is the sum over them.
- **U_p:** metered usage on bill p, gal (integer, ≥ 0).
- **D_p:** days in bill p's service period, **inclusive** of both end dates (integer, ≥ 1).
- **÷:** division. The sums are taken first, so longer periods weigh more. This is a usage-weighted average, not an average of averages.
- **Domain:** needs at least 1 prior bill. Three or more is recommended (`BASELINE_THIN` otherwise).
- **Threshold:** none. It is a reference level.
- **Assumptions:** household size, appliances and season in the baseline match the disputed period. Meter reads are actual, not estimated.
- **Fails when:** there are no prior bills (`NO_BASELINE`) · occupancy changed · the baseline spans a different season (irrigation, pools) · an estimated read is present.
- **Class:** EMPIRICAL MODEL.
- **Worked (SAMPLE):** (3,000 + 3,200 + 2,800) ÷ (30 + 31 + 29) = 9,000 ÷ 90 = **100 gal/day** (≈ 378.5 L/day).

### E2 · Expected usage in a disputed period
**E_d = round(r_base × D_d)**
- **E_d:** expected gallons for disputed period d (integer gal).
- **d:** subscript that indexes the disputed bills.
- **D_d:** inclusive days in period d.
- **×:** multiplication.
- **Domain / threshold / assumptions / failure:** same as E1.
- **Class:** EMPIRICAL MODEL.
- **Worked:** B4: round(100 × 30) = **3,000 gal**. B5: round(100 × 31) = **3,100 gal**.

### E3 · Excess volume
**X_d = max(0, U_d − E_d)**
- **X_d:** excess gallons in period d, integer ≥ 0.
- **U_d:** metered gallons on disputed bill d.
- **−:** subtraction. **max(0, ·)** clamps the result at zero, because usage below baseline is not "negative excess".
- **Threshold:** X_d > 0 means an anomaly is present. How large it must be to matter is the person's and the utility's judgment, not the engine's.
- **Fails when:** E1 fails, or the meter itself is faulty (a meter test is the counter-check).
- **Class:** EMPIRICAL MODEL.
- **Worked:** B4: 9,480 − 3,000 = **6,480 gal** (24,529 L). B5: 10,300 − 3,100 = **7,200 gal** (27,255 L). Total **13,680 gal** (51,784 L).

### E4 · Excess cost
**C_d = round(X_d × m ÷ 1000)**
- **C_d:** excess cost in period d, integer cents.
- **m:** marginal price, integer ¢ per 1,000 gal. That is the price of the *next* unit, water plus sewer if sewer is billed by usage.
- **÷ 1000:** converts gallons into thousands of gallons.
- **Domain:** m > 0.
- **Assumptions:** one flat marginal rate over the whole excess.
- **Fails when:** rates are tiered, since excess may fall into higher tiers and then the cost is understated · rates changed mid-period · taxes or surcharges scale with usage.
- **Class:** EMPIRICAL MODEL.
- **Worked (m = 1,250 ¢/kgal = $12.50 per 1,000 gal, SAMPLE):** B4: 6,480 × 1,250 ÷ 1,000 = **8,100 ¢ = $81.00**. B5: 7,200 × 1,250 ÷ 1,000 = **9,000 ¢ = $90.00**. Total **$171.00**.

### E5 · Bill reconciliation (a check, not a model)
**G = A − Σ_d (F + round(E_d × m ÷ 1000)) − Σ_d C_d**
- **G:** unexplained gap, cents. It can be negative.
- **A:** total amount billed across the disputed periods, cents.
- **F:** fixed charge per period, cents.
- **Threshold:** G = 0 means the bills rebuild exactly from the rate. G ≠ 0 means ask the utility (tiers, taxes, estimated reads, fees). Per bill, the engine reports `MATCH` / `MISMATCH_ASK_UTILITY`.
- **Class:** FORMAL SYSTEM LAW (accounting identity) applied to EMPIRICAL inputs.
- **Worked:** A = 13,850 + 14,875 = 28,725 ¢. Baseline-equivalent = (2,000 + 3,750) + (2,000 + 3,875) = 11,625 ¢. G = 28,725 − 11,625 − 17,100 = **0 ¢**, so it reconciles exactly. A test checks this, and a second test shows a 137 ¢ surcharge surfacing as G = 137.

### E6 · Continuous-leak estimate
**q_day = q_min × 1440 ; V(D) = round(q_day × D) ; C(D) = round(V(D) × m ÷ 1000)**
- **q_min:** leak flow, gal/min, real > 0, **measured**. For example, a meter test with all fixtures off: gallons moved ÷ minutes watched.
- **1440:** minutes per day. This is a FORMAL SYSTEM LAW (a time-unit definition).
- **q_day:** gal/day (rounded to 0.01 in code).
- **D:** days (integer).
- **V(D):** leak volume over D days, gal.
- **C(D):** cost over D days, cents.
- **Domain:** a steady, continuous seep.
- **Threshold:** none.
- **Assumptions:** the flow is continuous and constant · there is only one leak · the rate is measured, not guessed (a guessed rate turns the class into HEURISTIC).
- **Fails when:** the leak is intermittent (a "phantom refill" runs only minutes per hour, so the estimate is too high) · the leak worsens over time (early periods over-estimated, later ones under-estimated) · there is a second leak.
- **Physical anchor:** this is volumetric flow × time. A flapper that does not seal lets tank water drain continuously into the bowl, and the fill valve replaces it. Flow depends on the seal gap area and the head of water in the tank. The model does not derive flow from geometry. It uses the measured flow.
- **Class:** EMPIRICAL MODEL.
- **Worked (SAMPLE meter test: 2.25 gal in 15 min):** q_min = 2.25 ÷ 15 = 0.15 gal/min. q_day = 0.15 × 1,440 = **216 gal/day** (817.6 L/day). V(30) = **6,480 gal** (24,529 L). C(30) = 6,480 × 1,250 ÷ 1,000 = **8,100 ¢ = $81.00**. Per day: 216 × 1,250 ÷ 1,000 = **270 ¢ = $2.70/day**.

### E7 · Share of excess explained by the leak model
**S_d = min(V(D_d), X_d) × 10000 ÷ X_d** (basis points; 10,000 bp = 100%)
- **S_d:** explained share for period d, integer bp, from 0 to 10,000. It is undefined when X_d = 0.
- **min:** caps the result at 100%. The residual **R_d = X_d − V(D_d)** is always reported, including negative residuals.
- **Threshold:** none is imposed. A large residual is a question to ask (another leak? an estimated read?), not a verdict.
- **Class:** EMPIRICAL MODEL.
- **Worked:** B4: V = 216 × 30 = 6,480, X = 6,480, S = **10,000 bp (100.00%)**, R = 0. B5: V = 216 × 31 = 6,696, X = 7,200, S = 6,696 × 10,000 ÷ 7,200 = **9,300 bp (93.00%)**, R = **504 gal** unexplained. Open question: did the leak worsen, or is there a second source?

### E8 · Lane percent complete
**P = n_pass ÷ n_total × 100%**
- **n_pass:** acceptance checks with evidence.
- **n_total:** all acceptance checks in §9 item 20. The denominator is fixed before counting.
- **Class:** FORMAL SYSTEM LAW (a counting definition). It is not a measure of quality.
- **Fails when:** checks are added after the fact to raise the percentage.
- **Worked:** see §9.20.

---

## 6 · Worked example, end to end (SAMPLE)

Every name, date, number and place below is **SAMPLE**. The case lives in code as `SAMPLE_WATER_BILL_CASE`, so the numbers below are the engine's output, not hand arithmetic.

### 6.1 The situation

A tenant in "Example City" hears the hall-bathroom toilet running on 2026-03-02. They text the landlord on 3/3, photograph a warped flapper on 3/10, and receive a $138.50 bill on 4/6 (usually about $55–$60). They send a written email notice on 4/8. The landlord replies on 4/15 that a plumber will come, and no one does. A $148.75 bill follows on 5/6. The tenant calls the utility on 5/12 and is told that a leak adjustment needs proof of repair. The water account is in the tenant's name.

### 6.2 First contact: the validator on what a person typically brings first (one bill, one sentence)

Input: `tenancy.role = TENANT`, one timeline line, one disputed bill (B5). The validator returns every gap at once:

| # | Code | Severity | Field | Reason | Route |
|---|---|---|---|---|---|
| 1 | CONSENT_MISSING | BLOCKING | consent | We have not recorded your permission to hold these records, so nothing can be stored yet. | Read the consent screen, choose what may be stored and for how long, then confirm. |
| 2 | BILLS_NO_BASELINE | BLOCKING | bills | We need at least one normal (undisputed) earlier bill to know what usage looked like before the problem. | Download earlier bills from the utility portal or request a usage history printout. |
| 3 | JURISDICTION_MISSING | IMPORTANT | jurisdiction | Utility rules, housing codes and tenant resources depend on where the home is. Without a place we can only give lookup questions. | Add the city or county and state/region of the property (not your mailing address if different). |
| 4 | ACCOUNT_HOLDER_MISSING | IMPORTANT | utility_account.holder | Whose name the water account is in decides who the utility will talk to about a dispute. | Look at the name printed on the water bill, or ask the utility who the account holder is. |
| 5 | RATE_MISSING | IMPORTANT | rate.marginal_cents_per_kgal | To turn extra gallons into extra dollars we need the price of one more unit of water (and sewer, if billed by usage). | Find the usage rate on the bill or the utility rate schedule; if tiered, use the top tier you reached. |
| 6 | PHOTOS_NONE | IMPORTANT | photos | Photos or video of the fixture and the meter show the condition at a point in time. | Photograph the fixture (e.g. inside the toilet tank), any water damage, and the meter dial; a 15-second video of a running fixture helps. |
| 7 | COMMS_NONE | IMPORTANT | communications | No communications recorded. Most processes ask whether and when the problem was reported. | List every call, text, email, letter or portal request, with date, who, how, and what was said. |
| 8 | COMMS_NO_WRITTEN_NOTICE | IMPORTANT | communications | No written notice to the landlord is recorded. Many repair and inspection processes ask for a dated written request. | Send a short dated written notice (letter, email, or portal request) describing the defect and keep a copy. |
| 9 | LEASE_CLAUSE_MISSING | IMPORTANT | tenancy.lease_clause | The lease section on repairs, plumbing, and utilities is what the parties agreed; we need its exact words, not a summary. | Find the sections titled repairs, maintenance, utilities, or plumbing in your lease and copy them word for word. |
| 10 | REPAIR_EVIDENCE_MISSING | IMPORTANT | repair_evidence | Leak-adjustment programs commonly ask for proof the leak was fixed (invoice, work order, dated photo). | Ask whoever repairs it for a dated invoice or work order naming the fixture; photograph the repaired part with the date. |
| 11 | UTILITY_NAME_MISSING | HELPFUL | utility_account.utility_name | We need the utility name to find its dispute and leak-adjustment process. | Copy the utility name from the top of any water bill. |
| 12 | LEAK_SOURCE_UNKNOWN | HELPFUL | leak.fixture | We do not yet know which fixture is suspected. | Do a meter test: with all water off, watch the meter for 15 minutes; add food colouring to the toilet tank and see if it reaches the bowl without flushing. |

Counts: {"BLOCKING":2,"IMPORTANT":8,"HELPFUL":2} · complete=false · can_build_packet=false

The person gets this whole list in one visit, not twelve visits.

### 6.3 Full intake (SAMPLE)

| Item | Value |
|---|---|
| Bills | B1 2025-12-05→2026-01-03 · 3,000 gal · $57.50 · B2 2026-01-04→02-03 · 3,200 gal · $60.00 · B3 2026-02-04→03-04 · 2,800 gal · $55.00 · **B4** 2026-03-05→04-03 · 9,480 gal · $138.50 (disputed) · **B5** 2026-04-04→05-04 · 10,300 gal · $148.75 (disputed) |
| Rate | $12.50 per 1,000 gal (water + sewer usage) + $20.00 fixed per period |
| Photos | P1 2026-03-10 tank interior · P2 2026-05-12 meter low-flow indicator turning |
| Communications | 5 (2 texts, 2 emails, 1 phone) |
| Lease clause | "SAMPLE Lease §9 Repairs" (quoted verbatim in the packet) |
| Leak | Meter test 2.25 gal / 15 min = 0.15 gal/min |
| Repair evidence | **none**. This is the case's one remaining gap. |
| Account | 000048213377 at intake, **\*\*\*\*3377** in every output |

Validator result on the full SAMPLE case: **0 blocking · 1 important (REPAIR_EVIDENCE_MISSING) · 0 helpful**. The packet can be built.

### 6.4 Generated case packet (reproduced exactly as `buildCasePacket` emits it)

Call: `buildCasePacket(SAMPLE_WATER_BILL_CASE, { caseId: 'HELP-CASE-SAMPLE-0001', generatedAt: '2026-09-28T00:00:00Z' })`

````markdown
# THYLORA Help Desk · Case Packet HELP-CASE-SAMPLE-0001 · SAMPLE

Generated 2026-09-28T00:00:00Z · Case type BILLING_DISPUTE · Method origin THY-DEPT-QUESTION-NAV-001

**SAMPLE — every name, date, number and place in this packet is illustrative.**

## 1 · Case summary

- Place: Example City, Example State, US (resource key EXAMPLE-US-CITY)
- Utility: Example City Water Utility (SAMPLE) · account ****3377 · account holder TENANT
- Intake: 0 blocking, 1 important, 0 helpful gaps · packet buildable: YES
- Estimated excess across 2 disputed period(s): 13,680 gal (51,784 L) ≈ $171.00 (EMPIRICAL MODEL)

## 2 · Timeline

| Date | Event | Source |
|---|---|---|
| 2026-03-02 | “Tenant hears hall-bathroom toilet running constantly” | tenant statement |
| 2026-03-03 | “Text to landlord reporting the running toilet” | C1 |
| 2026-03-10 | “Photo of tank interior: flapper warped, water trickling into bowl” | P1 |
| 2026-04-06 | “Bill for 2026-03-05 → 2026-04-03 arrives: 9,480 gal, $138.50” | B4 |
| 2026-04-08 | “Email to landlord: written notice, bill attached, account ****3377 referenced” | C3 |
| 2026-04-15 | “Landlord replies a plumber will come; no visit follows” | C4 |
| 2026-05-06 | “Bill for 2026-04-04 → 2026-05-04 arrives: 10,300 gal, $148.75” | B5 |
| 2026-05-12 | “Tenant calls utility; told a leak adjustment needs proof of repair” | C5 |

## 3 · Bills and anomaly math

Model class: **EMPIRICAL MODEL**.

Baseline: 3 undisputed bill(s), 9,000 gal over 90 days → r_base = 9,000 ÷ 90 = 100 gal/day.
Marginal rate m = $12.50 per 1,000 gal · fixed charge $20.00 per period.

| Bill | Period | Days | Used (gal) | Expected (gal) | Excess (gal) | Excess (L) | Excess cost | Billed | Bill math |
|---|---|---|---|---|---|---|---|---|---|
| SAMPLE-B1 | 2025-12-05 → 2026-01-03 | 30 | 3,000 | 3,000 | — | — | — | $57.50 | MATCH |
| SAMPLE-B2 | 2026-01-04 → 2026-02-03 | 31 | 3,200 | 3,100 | — | — | — | $60.00 | MATCH |
| SAMPLE-B3 | 2026-02-04 → 2026-03-04 | 29 | 2,800 | 2,900 | — | — | — | $55.00 | MATCH |
| SAMPLE-B4 (disputed) | 2026-03-05 → 2026-04-03 | 30 | 9,480 | 3,000 | 6,480 | 24,529 | $81.00 | $138.50 | MATCH |
| SAMPLE-B5 (disputed) | 2026-04-04 → 2026-05-04 | 31 | 10,300 | 3,100 | 7,200 | 27,255 | $90.00 | $148.75 | MATCH |

Equations (every symbol defined):

- r_base = Σ U_p ÷ Σ D_p — U_p gallons used on undisputed bill p; D_p days in its service period (inclusive); r_base in gal/day.
- E_d = round(r_base × D_d) — expected gallons for disputed period d of D_d days.
- X_d = max(0, U_d − E_d) — excess gallons; never negative.
- C_d = round(X_d × m ÷ 1000) — excess cost in cents; m = marginal cents per 1,000 gal; round = half up to whole cents.
- Worked: SAMPLE-B4 — E = round(100 × 30) = 3,000; X = 9,480 − 3,000 = 6,480 gal; C = 6,480 × 1250 ÷ 1000 = 8100 ¢ = $81.00.
- Worked: SAMPLE-B5 — E = round(100 × 31) = 3,100; X = 10,300 − 3,100 = 7,200 gal; C = 7,200 × 1250 ÷ 1000 = 9000 ¢ = $90.00.
- Reconciliation: billed $287.25 − baseline-equivalent $116.25 − excess $171.00 = $0.00 unexplained.

Assumptions: Normal household use during the disputed period equals the average daily use of the undisputed bills. Every extra gallon is priced at the single marginal rate given (tiered or seasonal rates may differ). Meter readings are actual, not estimated; an estimated read must be flagged and asked about. No occupancy change (guests, new household member, new appliance) happened in the disputed period.

Fails when: Fewer than one undisputed bill → no baseline (NO_BASELINE). Occupancy or season changed → baseline no longer comparable. Tiered pricing → excess cost understated or overstated; use the utility rate schedule. bill_math_check = MISMATCH_ASK_UTILITY → taxes, surcharges, tiers or an estimated read are present; ask the utility.

## 4 · Continuous-leak estimate

Model class: **EMPIRICAL MODEL**.

- Fixture: “hall toilet flapper (continuous seep)”
- q_day = q_min × 1440 = 216 gal/day (817.6 L/day)
- V(30) = 216 × 30 = 6,480 gal (24,529 L)
- C(30) = 6,480 × 1250 ÷ 1000 = 8100 ¢ = $81.00 per 30 days (270 ¢/day)

| Bill | Days | Observed excess (gal) | Leak model (gal) | Residual (gal) | Explained |
|---|---|---|---|---|---|
| SAMPLE-B4 | 30 | 6,480 | 6,480 | 0 | 100.00% |
| SAMPLE-B5 | 31 | 7,200 | 6,696 | 504 | 93.00% |

Assumptions: Flow is continuous and constant (a flapper that seeps all day, not an intermittent refill). The flow rate comes from a meter test or a measured fill, not a guess; a guessed rate is labelled HEURISTIC. No other leak is present.

Fails when: Intermittent leaks (phantom refills every few minutes) run less than 1,440 min/day → estimate too high. Worsening leak (flapper degrading) → early periods over-estimated, later periods under-estimated.

## 5 · Evidence index

| Ref | Kind | Date | Description |
|---|---|---|---|
| B1 | BILL | 2026-01-03 | SAMPLE-B1 · 2025-12-05 → 2026-01-03 |
| B2 | BILL | 2026-02-03 | SAMPLE-B2 · 2026-01-04 → 2026-02-03 |
| B3 | BILL | 2026-03-04 | SAMPLE-B3 · 2026-02-04 → 2026-03-04 |
| B4 | BILL | 2026-04-03 | SAMPLE-B4 · 2026-03-05 → 2026-04-03 · DISPUTED |
| B5 | BILL | 2026-05-04 | SAMPLE-B5 · 2026-04-04 → 2026-05-04 · DISPUTED |
| P1 | PHOTO | 2026-03-10 | “Toilet tank interior, warped flapper” |
| P2 | PHOTO | 2026-05-12 | “Water meter dial, low-flow indicator turning with all taps off” |
| C1 | COMMUNICATION | 2026-03-03 | LANDLORD · TEXT · SENT |
| C2 | COMMUNICATION | 2026-03-04 | LANDLORD · TEXT · RECEIVED |
| C3 | COMMUNICATION | 2026-04-08 | LANDLORD · EMAIL · SENT |
| C4 | COMMUNICATION | 2026-04-15 | LANDLORD · EMAIL · RECEIVED |
| C5 | COMMUNICATION | 2026-05-12 | UTILITY · PHONE · SENT |
| L1 | LEASE_CLAUSE | — | “SAMPLE Lease §9 Repairs” |

## 6 · Communications log

| Date | Party | Channel | Direction | Summary |
|---|---|---|---|---|
| 2026-03-03 | LANDLORD | TEXT | SENT | “Hall toilet keeps running, can someone look at it?” |
| 2026-03-04 | LANDLORD | TEXT | RECEIVED | “Will check this week.” |
| 2026-04-08 | LANDLORD | EMAIL | SENT | “Written notice of running toilet since 3/2; water bill for account ****3377 attached; requesting repair date.” |
| 2026-04-15 | LANDLORD | EMAIL | RECEIVED | “Plumber will come next week.” |
| 2026-05-12 | UTILITY | PHONE | SENT | “Asked about high bill; rep said leak adjustment requires proof of repair within the program window.” |

## 7 · Responsibility questions

Decision: **NOT_DECIDED_BY_SOFTWARE**. THYLORA does not decide responsibility. The lease, the parties, the utility, an inspector, or a court may. These are the questions to take to them.

Clause to read (SAMPLE Lease §9 Repairs) — user-supplied text, quoted, not a THYLORA conclusion:

> SAMPLE: Tenant shall promptly notify Landlord in writing of any plumbing defect. Landlord shall make repairs to fixtures within a reasonable time after notice, except damage caused by Tenant.

1. Which party does the lease say arranges repairs to plumbing fixtures, and within what time after notice?
2. Does the lease say who pays the water and sewer bill, and does it say anything about charges caused by a fixture defect?
3. On what date was the landlord or manager first told, and in what form (spoken, text, written)?
4. Did anyone cause the defect by misuse, or did the part wear out? Is there evidence either way (repair invoice wording, plumber statement)?
5. Does the local housing code set a repair standard or deadline for plumbing in rental housing? (Ask the housing code office.)
6. Does the utility offer a leak adjustment, who may apply (account holder only?), and what proof of repair does it require?
7. If the account holder and the person who controls repairs are different people, how does the lease allocate the cost of water lost to a defect?

Who can answer: the lease itself · the landlord or property manager (in writing) · the water utility · the housing code office · a tenant resource center or legal aid.

## 8 · Cost exposure

Model class: **EMPIRICAL MODEL**. Exposure is money at stake in the dispute. It is not a statement of who owes it.

| Item | Amount |
|---|---|
| Billed in disputed periods | $287.25 |
| Same periods at baseline usage | $116.25 |
| Estimated excess (anomaly math) | $171.00 |
| Ongoing while unrepaired (leak model) | 270 ¢/day · $81.00 per 30 days |

Not included / unknown: late fees or penalties · sewer charges if billed separately and not in the marginal rate · taxes and surcharges · any water damage to belongings.

## 9 · Resource route

> If there is flooding, sewage, no water, or electrical danger, contact emergency services or the utility emergency line first. Paperwork waits.

| Step | Action | Status | Where | Verification |
|---|---|---|---|---|
| 1 | Written notice to the landlord / property manager | DONE (2026-04-08 EMAIL) | Use the notice address named in your lease | READ_YOUR_LEASE |
| 2 | Utility billing dispute / leak-adjustment request | WAITING_ON_REPAIR_EVIDENCE (2026-05-12 PHONE) | Example City Water Utility — Customer Billing Disputes | VERIFY_LOCALLY |
| 3 | Local housing code inspection request | AVAILABLE | Example City Housing Code Enforcement | VERIFY_LOCALLY |
| 4 | Tenant resource center / legal aid | AVAILABLE_ANY_TIME | Example County Tenant Resource Center / Example Legal Aid Society — Housing Unit | VERIFY_LOCALLY / VERIFY_LOCALLY |
| 5 | Small claims court — information only | INFORMATION_ONLY | Example County Small Claims Self-Help Center | VERIFY_LOCALLY |

- Step 1 · LANDLORD_WRITTEN_NOTICE: Creates a dated record that the defect was reported and asks for a repair date. Attach: photos of the fixture with capture dates, the disputed bill(s), the anomaly table from this packet.
- Step 2 · UTILITY_DISPUTE_LEAK_ADJUSTMENT: Asks the utility whether the disputed bill can be reviewed or adjusted, and what proof it needs. Attach: bill copies, baseline and excess math, repair evidence (if the program requires it).
- Step 3 · HOUSING_CODE_INSPECTION: If the defect is not repaired after notice, an inspector can record the condition independently. Attach: written notice copy, photos, timeline.
- Step 4 · TENANT_RESOURCE_LEGAL_AID: A person who knows local law can read your lease clause and tell you your options. THYLORA cannot. Attach: this whole packet, the full lease.
- Step 5 · SMALL_CLAIMS_INFO: Learn the dollar limit, filing fee, deadlines and evidence rules. This is information, not a recommendation to file. Attach: cost-exposure summary, evidence index.

## 10 · Open questions

1. [REPAIR_EVIDENCE_MISSING] Ask whoever repairs it for a dated invoice or work order naming the fixture; photograph the repaired part with the date.
2. Was either disputed meter reading an ESTIMATED read? (Look for "E" or "est." beside the reading.)
3. Has the fixture been repaired? If yes, on what date, by whom, and is there a dated invoice or work order?
4. After repair, does the meter stay still for 15 minutes with all water off? (Record the reading before and after.)
5. Which party does the lease say arranges repairs to plumbing fixtures, and within what time after notice?
6. Does the lease say who pays the water and sewer bill, and does it say anything about charges caused by a fixture defect?
7. On what date was the landlord or manager first told, and in what form (spoken, text, written)?

## 11 · Privacy and consent

- Consent recorded: YES · scope: store_case_records, generate_packet
- Retention: 365 days, then deleted unless you renew
- Third-party contact by THYLORA: NOT PERMITTED — you send every message yourself
- Redactions applied: utility account number → last 4; digit runs of 8+ → last 4.

## 12 · Disclaimer

THYLORA is not a law firm and does not give legal, medical, tax or accounting advice. Nothing in this packet decides responsibility, fault or who owes money; only the people involved, an agreement, an agency, or a court can do that. Every resource entry marked VERIFY_LOCALLY must be confirmed with the office itself before you rely on it. Numbers marked EMPIRICAL MODEL are estimates built on the assumptions listed beside them. For advice about your rights, contact a licensed attorney or a legal-aid organization in your area.
````

### 6.5 Resource route, read in plain words

1. **Landlord written notice: DONE** (2026-04-08 email). Next: a short follow-up in writing that cites the 4/15 promise, attaches P1 and P2 and the anomaly table, and asks for a repair date.
2. **Utility leak adjustment: WAITING_ON_REPAIR_EVIDENCE.** The utility said proof of repair is required. Ask the utility, in writing, for the program's deadline and the exact proof it accepts, so the window is not missed while waiting on the repair.
3. **Housing code inspection: AVAILABLE**, because written notice exists and no repair is recorded. Look up the local housing code office.
4. **Tenant resource center / legal aid: AVAILABLE ANY TIME.** Bring the whole packet and the full lease. They, not THYLORA, can say what the lease clause means for this tenant.
5. **Small claims: INFORMATION ONLY.** Learn the limit, fee and deadline. The packet's $171.00 excess and $287.25 billed are the figures at stake. They are not a claim amount chosen by THYLORA.

Ongoing exposure while unrepaired: **$2.70/day ≈ $81.00 per 30 days** (E6). That is the reason step 1's follow-up and step 2's deadline question come first.

---

## 7 · Privacy, consent, retention

| Rule | Implementation | State |
|---|---|---|
| No storage without consent | `CONSENT_MISSING` is BLOCKING. No packet can be built without consent. | BUILT, tested |
| Consent has a scope | `consent.scope[]`, e.g. `store_case_records`, `generate_packet`. Aggregation for gap reports is a separate opt-in scope (`count_in_gap_reports`). | BUILT (field) / aggregation PROPOSED |
| Account numbers | Last 4 only in every output (`redactAccount`). The full number is scrubbed from all free text (`scrubText`). | BUILT, tested |
| Other identifiers | Any run of 8+ digits in free text is masked to the last 4 | BUILT, tested |
| Retention | Person chooses 30 / 90 / 365 days. Records are deleted at expiry unless renewed. Deletion on request at any time. Packets the person downloaded are theirs. | Field BUILT, deletion job PROPOSED (backend) |
| No third-party contact | `contact_third_parties: false` by default. The person sends every message. | BUILT (field + packet text) |
| No sale of case data | Case contents are never sold or licensed. Only de-identified counts, with cell suppression below **k = 11** (HEURISTIC, a small-cell threshold commonly used in public-health data release; VERIFY against the policy adopted by DEPT-LEGAL-COMP-001), feed institutional gap reports. | PROPOSED, APPROVAL_REQUIRED |
| Safety cases | Family-safety intakes collect the minimum and show the crisis route first. Addresses are never stored for safety cases. | PROPOSED |
| Reviewer | Elena Marrow (DEPT-LEGAL-COMP-001) as privacy reviewer | PROPOSED, APPROVAL_REQUIRED |

---

## 8 · COMMERCE LAW scan

**Rule:** the basic route is free, always. Intake, validator, all-gaps list, anomaly and leak math, case packet, resource route, and printing or downloading one's own packet cost nothing. That holds for everyone and permanently. Nothing on a crisis path (utility shut-off notice, no water, flooding, eviction notice, safety) shows a price, an upsell, or a sponsor. What gets monetized is the **method, output format, service, and product**, never the person's need.

| Derivative | What it is | Price / model | State |
|---|---|---|---|
| Free help | Full intake → packet → route, online and printable | $0 | NOW (engine built) |
| Public story | "The $171 toilet": anonymized SAMPLE story of a paper trail | free | QUEUED_WITH_DEPENDENCY (Lane B story slot) |
| Short video | "The 15-minute meter test" (60 s) | free, public | QUEUED_WITH_DEPENDENCY (Public Media pipeline) |
| Long video | "Reading your water bill: baseline, excess, and what to ask" (8–12 min) | free | QUEUED_WITH_DEPENDENCY |
| Still image | One-page infographic: the 5-step route | free | QUEUED_WITH_DEPENDENCY |
| PDF / book | *The Paper Trail Handbook*: all 11 categories, intake checklists | free PDF, paid print copy | HOLD_FOR_EVIDENCE (needs the 9 unbuilt categories tested) |
| Children's derivative | "Meter Detective": find the leak with food colouring and a meter dial; teaches reading a dial and minutes-to-days math | free worksheet | NOW-ready as design |
| Teacher derivative | Lesson: rates, units (gal ↔ L), inclusive day counts, and why a baseline is an average weighted by days (E1–E4) | free; paid classroom kit | QUEUED_WITH_DEPENDENCY |
| Family derivative | Household Bill Binder: monthly slots, baseline tracker | free printable | NOW-ready as design |
| Business derivative | **Repair Response Log** for small landlords and property managers: dated notice → response → repair evidence. It is neutral: it serves both sides of a repair record. | subscription | APPROVAL_REQUIRED |
| Institutional derivative | White-label intake for tenant centers, libraries, legal-aid intake desks (they own their data) | license | APPROVAL_REQUIRED |
| Software / app function | Engine as a module of the THYLORA app / API v1.1 (not in the v1 freeze, per Lane C) | — | QUEUED_WITH_DEPENDENCY (Lane C API freeze) |
| Subscription | Deadline reminders, document vault, multi-case tracking. **Never gates the basic route.** | low monthly | APPROVAL_REQUIRED |
| Licensing | Method + validator code set licensed to civic-tech / legal-aid software | license | APPROVAL_REQUIRED |
| Sponsorship | Water-conservation or library foundations may sponsor free printing. A sponsor can never appear in a referral list or comparison, and sponsorship is disclosed on the packet footer. | sponsor | APPROVAL_REQUIRED |
| Merchandise | — (no tasteful fit found; not forced) | — | NONACTIONABLE_CONTEXT |
| Training | Volunteer navigator training: "Follow-Through Casework" | paid for organizations, free for individuals | QUEUED_WITH_DEPENDENCY |
| Consulting / service | Utility and housing-office process reviews (friction mapping), using Lane E grammar | fee | APPROVAL_REQUIRED |
| Recurring support | Case follow-through check-ins (Naya Aven's function on Earth): "did step 2 happen?" | free basic reminder; staffed tier paid by institutions, not individuals | PROPOSED |
| Data / evidence product | De-identified, consented, k ≥ 11 aggregate **institutional gap reports** (e.g. "median days from written notice to repair"). Never case contents. | sold to institutions / free to public summary | HOLD_FOR_EVIDENCE (needs real consented cases + privacy review) |
| Store product | **Case Organizer Kit**: accordion folder, 12 labelled tabs matching the packet sections, evidence-index sheets, timeline pad, redaction stickers. **Leak Check Kit**: dye tablets + meter-reading card + instructions. | Kit price PROPOSED $19 (SAMPLE price; cost unknown) · Leak Check Kit PROPOSED $7 | APPROVAL_REQUIRED + supplier via Lane D qualification |
| Earth partnership | Public libraries as physical help-desk points; legal-aid organizations as referral partners | partnership | APPROVAL_REQUIRED |
| EdereAirah derivative | THY-TRANS-HELP-607 episode: Naya Aven's follow-through method, told in-world (the case must be canon-approved first) | media | QUEUED_WITH_DEPENDENCY (Chairman canon decision, §10 N5) |
| Back-to-Buy tie | Case Organizer Kit may carry a disclosed support share for household-repair or rent support funds (Lane D math B = N × s) | per Lane D | QUEUED_WITH_DEPENDENCY (Lane D) |

**Not exploiting the beneficiary:** no pay-per-packet · no "priority" help for payment · no referral fees from lawyers, plumbers or landlords. The last point is also a conflict-of-interest rule: a referral list that paid to be there is not navigation.

---

## 9 · DEPARTMENT RETURN FORMAT (20 parts)

**1 · CURRENT TRUTH**
The Lane G engine exists and passes its tests. The full suite is 65 / 65 (48 existing + 17 new). The help desk is **DESIGN_ACTIVE / PARTIAL**. One category pair (billing dispute + landlord/tenant) is built in code. Nine categories are designed but not built. No backend rows were written. `thylora_help_intake_index` still has 0 rows. No real person's case has been processed.

**2 · WHAT WAS RECOVERED**
`thylora_help_intake_index` (0 rows, columns unverified) · THY-DEPT-QUESTION-NAV-001 (active) · THY-WORLD-DOUBT-REMOVER-607 / Naya Aven (chairman_review_required) · THY-TRANS-HELP-607 (DESIGN_ONLY, Naya Aven + Elena Marrow) · WR-DOUBT-REMOVER-606 · CUSTOMER_HELP_AND_RESOLUTION · Samira Vale and Elena Marrow (DEPT-LEGAL-COMP-001) · THY-DS-LEGAL blocker "Full Earth-law corpus is not yet ingested" (this is why no law is hardcoded) · REE/USD separation (THY-DS-REE-USD) · repo code style (`rae-link/lib`, `node:test`).

**3 · WHAT WAS CREATED**
- `helpdesk/lib/intake.js`: schema, validator (22 codes), anomaly calculator, leak estimate, leak-vs-anomaly comparison, responsibility router (no-decision), escalation path (5 steps), resource lookup with pluggable map, cost exposure, next questions, case packet (object + 12-section Markdown), no-conclusion guard, redaction, SAMPLE case.
- `tests/helpdesk.test.mjs`: 17 tests.
- This packet: 11 categories × 4 fields, 8 equations under the MATH RULE, commerce scan, backend change packet.

**4 · NUMBERS / QUANTIFIED MOVEMENT**
Tests 48 → 65 (+17, 0 failures). Help categories specified: 11 / 11. Categories built in code: 2 / 11 (3.3 and 3.4, one engine). Validator codes: 22. Escalation steps: 5. Packet sections: 12. SAMPLE results: baseline 100 gal/day · excess 13,680 gal (51,784 L) · excess cost $171.00 · billed $287.25 = baseline-equivalent $116.25 + excess $171.00 (gap $0.00) · leak 216 gal/day → $2.70/day, $81.00 per 30 days · leak explains 100.00% of B4 and 93.00% of B5 (504 gal residual). `thylora_help_intake_index`: 0 rows before, 0 after, 12 proposed.

**5 · FILES / ASSETS / RECORD IDs**
`/home/user/Thylora/helpdesk/lib/intake.js` · `/home/user/Thylora/tests/helpdesk.test.mjs` · `/home/user/Thylora/workrooms/WR-PROD-FLOOR-001/LANE-G-HELP-DESK.md`. Proposed IDs: `THY-HELP-INTAKE-<CATEGORY>-001` (11), `THY-HELP-METHOD-FTC-001`, `THY-MATH-HELP-E1…E7` (§11). Case ID format: `HELP-CASE-<YYYY>-<seq>`. The SAMPLE case uses `HELP-CASE-SAMPLE-0001` and must never be imported as a real case.

**6 · WHAT IS STILL UNKNOWN**
Column schema of `thylora_help_intake_index` · THY-DEPT-QUESTION-NAV-001 charter text · the in-world EdereAirah case the method grew from · any real jurisdiction's utility leak-adjustment rules, housing-code procedures, small-claims limits · whether the information/advice boundary as designed is acceptable in each target jurisdiction · real cost and supplier for the Case Organizer Kit.

**7 · BLOCKERS**
- B1: backend columns unverified. Owner: next session with Supabase read. Release: `information_schema` read of the target. Next action: run the pre-apply query in §11.
- B2: no verified real jurisdiction entry. Owner: Samira Vale role (PROPOSED) / Lane G. Release: a human confirms each office by its own published page or by phone. Next action: pick the first launch jurisdiction (Chairman decision D1).
- B3: THY-WORLD-DOUBT-REMOVER-607 is `chairman_review_required`, so Naya Aven's link is unapproved. Release: Chairman decision D2.

**8 · SAFE WORK ALREADY CONTINUING**
The engine is complete for its scope and deterministic. The remaining nine categories can reuse the core validator pattern without Chairman input. Free-help derivatives (worksheet, binder, route infographic) are pure design and need no approval to draft.

**9 · CHAIRMAN DECISIONS NEEDED**
- D1: first real jurisdiction for the resource map. The EdereAirah Maryland/Baltimore mirror in canon suggests Baltimore City, MD, but that is a suggestion, not a lock.
- D2: approve the method owner (THY-DEPT-QUESTION-NAV-001) and follow-through carrier (Naya Aven), and resolve the DOUBT-REMOVER-607 review.
- D3: approve the Case Organizer Kit and Leak Check Kit as store products (price and supplier via Lane D).
- D4: approve that institutional gap reports may be sold as a de-identified data product (with privacy review).

**10 · NEXT 3 ACTIONS**
1. Read `thylora_help_intake_index` columns, then apply §11 rows and read back.
2. Build `school help` and `benefits/resources` intake validators on the same core (the highest-volume categories after housing).
3. Draft one real jurisdiction entry with every office confirmed from its own source, marked VERIFIED_LOCALLY with the date and the verifier.

**11 · HELP VALUE**
A person with one confusing bill leaves the first visit with the complete list of what to gather (12 items, sorted by importance), not a single next step. Once gathered, they have a packet that states the excess in gallons, litres and dollars with the math shown, the clause to read, the questions to ask, and five offices in order, without anyone telling them a legal conclusion that nobody at THYLORA is licensed to give.

**12 · EARTH VALUE**
Utility and housing disputes are lost on paperwork, missed windows and scattered evidence more often than on the merits. The help desk turns that paperwork into a standard packet that offices can read quickly. Aggregated, consented counts become institutional gap reports (Lane E grammar) without exposing anyone.

**13 · COMMERCE / MONEY PATH**
Free basic route → paid physical kits (store) → subscriptions for convenience features → institutional licenses (tenant centers, libraries, legal-aid intake) → training → de-identified gap reports for institutions. Revenue is reinvested in verifying more jurisdictions (the costly part is verification, not software). No money from the person in crisis, and no referral fees.

**14 · MEDIA / STORY PATH**
THY-TRANS-HELP-607 (Naya Aven + Elena Marrow) is the in-world carrier. On Earth the story is the SAMPLE "$171 toilet" paper trail and the "15-minute meter test" short. Both are educational and neither is an advertisement.

**15 · EDUCATION PATH**
Meter Detective (children) · rates-and-units lesson (teachers, E1–E6) · Paper Trail Handbook (adults) · volunteer navigator training (organizations).

**16 · SOFTWARE PATH**
`helpdesk/lib/intake.js` → app intake form (Lane C, v1.1, not in v1 freeze) → per-jurisdiction resource map service with verification dates → packet PDF export → deletion job honoring `retention_days`.

**17 · STORE PATH**
"I NEED HELP" shelf (Lane D navigation): free packet first, then Case Organizer Kit and Leak Check Kit. It may carry a Back-to-Buy support share, disclosed.

**18 · RISKS**
- R1 unauthorized practice of law: mitigated by the no-conclusion guard, `NOT_DECIDED_BY_SOFTWARE`, and legal review (N4).
- R2 stale or wrong resource entries: every entry is VERIFY_LOCALLY with a verification date, and nothing ships as verified without a named verifier.
- R3 privacy breach: consent is blocking, redaction, retention, no case-data sale.
- R4 model misread as fact: EMPIRICAL MODEL labels with assumptions printed.
- R5 SAMPLE data imported as real: `sample: true` flag and the SAMPLE case ID is excluded in §11.
- R6 a conflicted referral (sponsor or referral fee): prohibited in §8.
- R7 the guard misses a novel conclusion phrasing: pattern list is extendable, and human review is required before any real-case packet template changes.

**19 · EVIDENCE**
`node --test tests/*.test.mjs` on 2026-09-28: `# tests 65 · # pass 65 · # fail 0`. The packet in §6.4 is generated output, reproduced verbatim. Canon references are from `00-RECOVERED-STATE.md` §4.

**20 · PERCENT COMPLETE (explicit denominator)**
Denominator: **25 acceptance checks** for Lane G, fixed before counting.

| # | Check | Pass |
|---|---|---|
| 1 | Service model (is / is not) written | ✅ |
| 2 | All 11 categories × intake / evidence / referral / out-of-scope | ✅ |
| 3 | Intake schema in code | ✅ |
| 4 | Validator returns all gaps with code + reason + route (tested) | ✅ |
| 5 | Anomaly calculator reconciles exactly (tested) | ✅ |
| 6 | Leak estimate (tested) | ✅ |
| 7 | Responsibility router never concludes (tested) | ✅ |
| 8 | Escalation path, 5 steps (tested) | ✅ |
| 9 | Cost exposure (tested) | ✅ |
| 10 | Next questions | ✅ |
| 11 | Case packet object + Markdown, all sections (tested) | ✅ |
| 12 | Pluggable resource map, example VERIFY_LOCALLY, "look up your local X" (tested) | ✅ |
| 13 | Account redaction to last 4 (tested) | ✅ |
| 14 | Full suite passes, existing 48 intact | ✅ |
| 15 | Worked example end to end with packet reproduced | ✅ |
| 16 | Every equation meets the MATH RULE | ✅ |
| 17 | Commerce scan with free-first + no-crisis-charge rule | ✅ |
| 18 | 20-part return | ✅ |
| 19 | Backend change packet | ✅ |
| 20 | Rows written to `thylora_help_intake_index` and read back | ❌ (no write in this lane) |
| 21 | One real jurisdiction entry verified by a named person | ❌ |
| 22 | App intake UI | ❌ |
| 23 | Chairman approval of the origin assignment (D2) | ❌ |
| 24 | DEPT-LEGAL-COMP-001 review of the information/advice boundary and privacy policy | ❌ |
| 25 | Remaining 9 categories built as code with tests | ❌ |

**P = 19 ÷ 25 = 76%** (E8). Of the 19 passing checks, 12 are verified by automated tests and 7 by the existence of this document's content.

---

## 10 · NO NAKED LATER

| ID | Item | State | Owner | Dependency | Release condition | Next action |
|---|---|---|---|---|---|---|
| N1 | Apply §11 rows | QUEUED_WITH_DEPENDENCY | next backend-connected session | column schema read | columns mapped, rows inserted, read back | run pre-apply query |
| N2 | Real resource entries (utility, housing code, tenant, legal aid, small claims) | QUEUED_WITH_DEPENDENCY | Lane G + Samira Vale role (PROPOSED) | D1 jurisdiction choice | each office confirmed from its own source, dated, named verifier | Chairman picks D1 |
| N3 | App intake UI | QUEUED_WITH_DEPENDENCY | Lane C / WR-PLATFORM-APP-001 | API v1 freeze, then v1.1 | v1 usable cut passes | list help-desk endpoints for v1.1 |
| N4 | Legal review of the information/advice line + privacy policy | APPROVAL_REQUIRED | DEPT-LEGAL-COMP-001 (Marcus Hale, Elena Marrow) | first launch jurisdiction | written sign-off | send §1, §7 and the disclaimer for review |
| N5 | EdereAirah origin case (the in-world incident) | APPROVAL_REQUIRED | Chairman | D2 | Chairman approves or supplies the case | present §2.2 table |
| N6 | 9 remaining categories in code | QUEUED_WITH_DEPENDENCY | Lane G | none blocking; order by demand | each has validator + tests | build school help, then benefits |
| N7 | Case Organizer Kit / Leak Check Kit | APPROVAL_REQUIRED | Chairman + Lane D | supplier qualification (Lane D) | approved supplier, landed cost known | Lane D desk review |
| N8 | Gap-report data product | HOLD_FOR_EVIDENCE | Lane G + Elena Marrow role | consented real cases, privacy review | ≥ k cases per cell, policy signed | define `count_in_gap_reports` consent text |
| N9 | Retention deletion job | QUEUED_WITH_DEPENDENCY | backend | N1 | job deletes on expiry, verified with a test row | spec in §11 |

---

## 11 · BACKEND CHANGE PACKET

**Not connected for writes in this lane. Nothing was written.** Import only after the pre-apply read.

- **Target:** `public.thylora_help_intake_index`, currently **0 rows**. Column schema unread, so **every column below is VERIFY_BEFORE_APPLY**.
- **Pre-apply read:**
  `select column_name, data_type, is_nullable from information_schema.columns where table_schema='public' and table_name='thylora_help_intake_index' order by ordinal_position;`
- **Rule:** map the proposed keys to real columns. If a key has no column, keep it in a JSON column if one exists, otherwise drop it and record the drop. Never alter the table from this packet.
- **Truth class for all rows:** `PROPOSED` / `DESIGN_ACTIVE`.
- **Evidence:** this file · `helpdesk/lib/intake.js` · `tests/helpdesk.test.mjs` (65/65 suite pass, 2026-09-28).
- **Excluded:** the SAMPLE case `HELP-CASE-SAMPLE-0001` must **not** be imported. This table indexes intake categories, not personal cases. Personal case storage needs N4 first.

### 11.1 Proposed rows: `thylora_help_intake_index` (12)

| canonical_id (proposed) | category_code | label | build_state | required_fields (keys) | referral_classes | out_of_scope (short) | engine_ref | truth_class | blocker | next_action |
|---|---|---|---|---|---|---|---|---|---|---|
| THY-HELP-METHOD-FTC-001 | METHOD | Follow-Through Casework (method record) | DESIGN_ACTIVE | consent, jurisdiction, timeline, evidence_index, communications | — | legal conclusions | helpdesk/lib/intake.js | PROPOSED | D2 origin approval | Chairman D2 |
| THY-HELP-INTAKE-VERIFIED-INFO-001 | VERIFIED_INFORMATION | Verified information | DESIGNED | question, source, date_seen, decision_at_stake | publisher, library, professional | verdicts on contested questions | — | PROPOSED | N6 | build validator |
| THY-HELP-INTAKE-LEGAL-NAV-001 | LEGAL_RESOURCE_NAVIGATION | Legal / resource navigation | DESIGNED | issue_type, jurisdiction, deadlines, parties_by_role, documents | legal aid, lawyer referral, court self-help, public defender, ombudsman | advice on facts, drafting, representation | — | PROPOSED | N4, N6 | legal review |
| THY-HELP-INTAKE-BILLING-001 | BILLING_DISPUTE | Billing disputes | BUILT_TESTED | utility_account, bills, rate, photos, communications, repair_evidence | UTILITY_DISPUTE, SMALL_CLAIMS | deciding the bill is wrong | intake.js#computeUsageAnomaly | PROPOSED | N2 real entries | D1 |
| THY-HELP-INTAKE-LANDLORD-TENANT-001 | LANDLORD_TENANT | Landlord / tenant resource navigation | BUILT_TESTED | tenancy.lease_clause, communications, photos, repair_evidence | HOUSING_CODE, TENANT_RESOURCE, LEGAL_AID, SMALL_CLAIMS | deciding responsibility, rent-withholding advice | intake.js#routeResponsibility | PROPOSED | N2, N4 | D1 |
| THY-HELP-INTAKE-SCHOOL-001 | SCHOOL_HELP | School help | DESIGNED | issue, school_role, meetings, deadlines | school/district, parent center, ombudsman, education legal aid | clinical judgments, advocacy in meetings | — | PROPOSED | N6 | build validator (next) |
| THY-HELP-INTAKE-FAMILY-001 | FAMILY_HELP | Family help | DESIGNED | household_roles, need, urgency | family resource center, info line, DV hotline, family court self-help, funeral assistance | custody advice, therapy | — | PROPOSED | N6, safety review | build with safety-minimum rule |
| THY-HELP-INTAKE-BENEFITS-001 | BENEFITS_RESOURCES | Benefits / resources | DESIGNED | household_size, income_band, program, notices, deadlines | agency office, navigator, legal aid, community action | eligibility determinations | — | PROPOSED | N6 | build validator |
| THY-HELP-INTAKE-BUSINESS-001 | BUSINESS_PROBLEM_SOLVING | Business problem solving | DESIGNED | business_type, problem, amounts, counterparties_by_role, documents | SBDC, mentor network, licensing office, accountant, attorney | tax/legal/investment advice | — | PROPOSED | N6 | build validator |
| THY-HELP-INTAKE-HISTORY-001 | HISTORICAL_RESEARCH | Historical research | DESIGNED | subject, period, known_facts, purpose | historical society, archives, genealogical library, special collections | inference presented as record | — | PROPOSED | N6 | build validator |
| THY-HELP-INTAKE-COMPARISON-001 | PRODUCT_SERVICE_COMPARISON | Product / service comparison | DESIGNED | need, budget, must_haves, deal_breakers, location | consumer protection, recall database, licensing lookup | paid placement; THYLORA products unranked by THYLORA | — | PROPOSED | N6 | build validator |
| THY-HELP-INTAKE-GAP-REPORT-001 | INSTITUTIONAL_GAP_REPORT | Institutional gap reports | DESIGNED | institution, stuck_step, counts, consent_scope | ombudsman, oversight body, Lane E | naming staff, single-case publication, accusations | — | PROPOSED | N8 | consent text |

### 11.2 Secondary target (optional, same rules): `thylora_math_equation_registry` (32 rows at read time; columns unverified)

| canonical_id (proposed) | equation | class | unit | worked result (SAMPLE) |
|---|---|---|---|---|
| THY-MATH-HELP-E1 | r_base = Σ U_p ÷ Σ D_p | EMPIRICAL MODEL | gal/day | 100 |
| THY-MATH-HELP-E2 | E_d = round(r_base × D_d) | EMPIRICAL MODEL | gal | 3,000 / 3,100 |
| THY-MATH-HELP-E3 | X_d = max(0, U_d − E_d) | EMPIRICAL MODEL | gal | 6,480 / 7,200 |
| THY-MATH-HELP-E4 | C_d = round(X_d × m ÷ 1000) | EMPIRICAL MODEL | ¢ | 8,100 / 9,000 |
| THY-MATH-HELP-E5 | G = A − Σ(F + round(E_d·m/1000)) − Σ C_d | FORMAL SYSTEM LAW (identity) | ¢ | 0 |
| THY-MATH-HELP-E6 | q_day = q_min × 1440; V = round(q_day × D); C = round(V × m ÷ 1000) | EMPIRICAL MODEL | gal, ¢ | 216 gal/day; 6,480 gal; 8,100 ¢ |
| THY-MATH-HELP-E7 | S_d = min(V, X_d) × 10000 ÷ X_d | EMPIRICAL MODEL | bp | 10,000 / 9,300 |

**Read-back requirement:** after insert, `select * from thylora_help_intake_index where canonical_id like 'THY-HELP-%' order by canonical_id;` must return 12 rows matching §11.1. Return the exact IDs. If the table uses a different ID column, record the mapping here before closing N1.
