# WR-PROD-FLOOR-001 · 00 · Recovered State (read before any lane)

**Read by:** production executive session, 2026-09-28
**Backend of record:** `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`), Postgres 17.6, status ACTIVE_HEALTHY
**Access used:** Supabase connector, read-only SQL. **No backend writes were made while this file was written.**
**Connector behaviour:** it dropped and reconnected three times during the read. Reads that completed are recorded below. Reads that did not complete are listed at the end.

Everything in this file was **read from the backend or the repo**. Nothing here is invented. Where a lane in this workroom proposes new canon, the lane file marks it `PROPOSED` and it does not appear here.

---

## 1 · Authority (unchanged, re-confirmed)

- `DASHBOARD_AUTHORITY.md`: this repo is **not** the dashboard deployment authority. Authority is `vyc2st-ctrl/thylora-executive-dashboard` → `thylora-public-world`.
- `dashboard-baseline.json`: floor `THY-DASH-FLOOR-20260823-001`, 17 required capabilities.
- Continuity boot `THY-CONTINUITY-BOOT-002` v1 ACTIVE. Retrieval order:
  `dashboard_authority_lock → latest_backend_state → latest_query_custody_record → active_restart_point → current_locks → open_blockers → supersession_state → relevant_registry_records → source_verbatim_on_demand`.
- Backend size at read time: **908 public base tables**.

## 2 · Verified system status (from `dashboard_status`, 55 rows)

These match the Chairman's stated status. Nothing newer was found that contradicts it.

| canonical_id | state | gate | evidence | blocker (verbatim, trimmed) |
|---|---|---|---|---|
| THY-DS-FRONTEND | VERIFICATION_ACTIVE | AUTHENTICATED_LIVE_READ_AND_NO_REGRESSION_PREFLIGHT | PARTIAL | — (last verified 2026-08-29) |
| THY-DS-CURRENT-HEAD-20260910 | VERIFICATION_ACTIVE | LIVE_RUNTIME_PLUS_CURRENT_DATA_RECONCILIATION | PARTIAL | "Authoritative Vercel runtime and recorded Build 8 regression checks pass, but dashboard_status contains older modules th…" |
| THY-DS-THYLORA-API | DESIGN_ACTIVE | API_CONTRACT | PARTIAL | "Provider-independent API contract has not yet been frozen or deployed." |
| THY-DS-MOBILE | DESIGN_ACTIVE | APP_ARCHITECTURE | PARTIAL | "Mobile app has not yet been built or submitted." |
| THY-DS-PUBLIC-MEDIA | IMPLEMENTATION_ACTIVE | FIRST_PUBLIC_ASSET | PARTIAL | "Final rendered teaser is not yet produced." |
| THY-DS-SHOPIFY | IMPLEMENTATION_ACTIVE | FIRST_VERIFIED_PRODUCT | PARTIAL | "No Shopify connector is available in this ChatGPT workspace…" |
| **THY-DS-CURRENT-STORE-20260910** (newer) | VERIFICATION_ACTIVE | REAL_CHECKOUT_REACCESS_MOBILE_POLICY_PUBLICATION | PARTIAL | "Shopify product is ACTIVE/PUBLISHED, but THYLORA active_allowed=false. Real-money checkout witness=0; re-access user wit…" |
| THY-DS-P0-COMMERCE-PROOF | OPERATIONAL | P0_COMMERCE_PROOF_VERIFIED | VERIFIED | — |
| THY-DS-LEMON-P0 | OPERATIONAL | LEMON_TEST_CONNECTED_VERIFIED | VERIFIED | — |
| THY-DS-CHAIRMAN-AUTH | OPERATIONAL | BROWSER_SESSION | VERIFIED | — |
| THY-DS-ROUTER / AUDIT / CHAIRMAN-COMMAND | OPERATIONAL | VERIFIED_COMMAND_PATH | VERIFIED | — |
| THY-DS-DEPARTMENTS | OPERATIONAL | PERSISTED_DEPARTMENTS | VERIFIED | — |
| THY-DS-LEGAL | IMPLEMENTATION_ACTIVE | CODEX_AND_STAFF_BUILD | PARTIAL | "Full Earth-law corpus is not yet ingested…; 26 legal positions are defined but only Marcus H…" |
| THY-DS-MERCH-REWARDS | DESIGN_ACTIVE | SUPPLIER_AND_REDEMPTION_DESIGN | PARTIAL | "POD supplier not selected…" |
| THY-DS-REE-USD | OPERATIONAL | REFERENCE_PARITY_APPROVED | VERIFIED | "Earth cash redemption remains disabled by design; this is a reference parity, not legal tender or a redemption promise." |

**Regression evidence** (`thylora_dashboard_regression_evidence`, 42 rows):

| build | PASS | BLOCKED | NOT_TESTED |
|---|---|---|---|
| CHAIRMAN-DASH-001 | 9 | 3 | 3 |
| OPERATING-SURFACE-001 | 10 | 1 | 1 |
| CONTROL-SURFACE-522 | 7 | 0 | 1 |
| BUILD8 | 7 | 0 | 0 |

Open items named in evidence:
- OPERATING-SURFACE-001 · "Production alias re-probed live and is still stale" · **BLOCKED** · Vercel production promotion; session had no Vercel alias scope.
- OPERATING-SURFACE-001 · "Operating surface rendered and witnessed on the authoritative production URL" · **NOT_TESTED** · requires merge into `thylora-executive-dashboard` master + Chairman promotion.
- CONTROL-SURFACE-522 · "chairman_preview_http_render_on_device" · **NOT_TESTED** · Chairman must open one preview on the iPad.

## 3 · Animal records (Lane A input)

`thylora_estate_animal_groups` — **7 rows**, all `estate_code = ER-CASTLE-ROYAL-001`, `time_region = 1700s`, `function_code = EST-ANIMAL-CARE-001`, `source_query_id = THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533`, created 2026-09-19.

| animal_group_code | species_class | purpose | housed_at | responsible_role | state | open_fields |
|---|---|---|---|---|---|---|
| ANIMAL-HORSE-001 | HORSE | DRAUGHT | SEC-Z-STABLES | HH-1700-STABLE | CANON_ANCHORED_DETAIL_OPEN | stable_count, headcount, farrier_provision, feed_chain, animal_retirement_rule |
| ANIMAL-HORSE-RIDING-001 | HORSE | RIDING | SEC-Z-STABLES | HH-1700-STABLE | CANON_ANCHORED_DETAIL_OPEN | headcount, remount_standard, escort_mount_allocation |
| ANIMAL-CLASS-CATTLE | CATTLE | DAIRY | OPEN | HH-1700-STABLE | STRUCTURE_OPEN_DETAIL | whether_cattle_are_kept, headcount, dairy_route |
| ANIMAL-CLASS-SHEEP | SHEEP | WOOL | OPEN | HH-1700-STABLE | STRUCTURE_OPEN_DETAIL | whether_sheep_are_kept, headcount, wool_route |
| ANIMAL-CLASS-PIG | PIG | MEAT | OPEN | HH-1700-STABLE | STRUCTURE_OPEN_DETAIL | whether_pigs_are_kept, headcount |
| ANIMAL-CLASS-POULTRY | POULTRY | EGGS | OPEN | HH-1700-PROVISIONER | STRUCTURE_OPEN_DETAIL | whether_poultry_are_kept, headcount |
| ANIMAL-CLASS-WORKING-DOG | WORKING_DOG | GUARD | OPEN | HH-1700-CAPTAIN | STRUCTURE_OPEN_DETAIL | whether_dogs_are_kept, post_assignment |

Every `headcount` is null. Every `care_cycle`, `farrier_or_vet_provision`, `retirement_rule` is `OPEN`.

Related existing design packet: `thylora_world_earth_transmission_packets` · **THY-TRANS-WILDLIFE-607** · DESIGN_ONLY · world department "Wildlife Refuge & Return (working name; EdereAirah name OPEN)" · keeper / habitat ecologist / release lead all OPEN · equation `Release readiness = health pass × behavior pass × habitat pass × legal pass` · species OPEN.

Related naming precedent: `THY-PLANT-NAME-CANDIDATES-596` — 12 native-name candidates for the rosemary-mirror plant, **all PROPOSED, none canon**; shortlist survivors Greyneedle, Stonewarm, Veslusk. Guards: no medical-claim names, no invented Indigenous-sounding names, "EdereAirah name leads; Earth plant is comparison only". Recovery note on that record: **"NO canonical EdereAirah plant name exists; no plant root lane in THY-WORLD-NAMING-LEXICON-001."**

**No planetary physics canon was found**: no gravity, atmosphere, day length, star, or biome record in `thylora_world_term_registry` (8 rows), `thylora_world_design_records` (88 rows), or `thylora_world_entities` (93 rows). Any lane that needs physics must mark its values PROPOSED.

## 4 · World canon that lanes must build on, not replace

**Terms (LOCKED unless noted):** `EdereAirah` (exact spelling, LOCKED) · `vlegh` = the THYLORA sheet · `Edereaireum` = metal, all properties UNKNOWN, never equate with an Earth element · `Keal-lum`/`Kelum` = demonstrated understanding (PROVISIONAL) · `INTERFRAME` = authored visual/camera layer · `RUDABAKAH` = the sudden whispered-word face · `Value Current` (positions SIGNAL / BLOCK / BUFFER / BRIDGE / BRANCH).

**Visual law:** `THY-INTERWORLD-VISUAL-BARRIER-001` — a localized, variable, moving translucent "glaze / clear film" marks EdereAirah imagery as another world. Never full-frame blur, never obscures people, evidence or product text, never generic glow or sci-fi HUD. Formal name UNKNOWN.

**Visual standards on file:** `VISUAL-001 B&W Cinematic Realism`, `VISUAL-002 Amber Glaze`.

**Places:** `ER-PLACE-BELL-CROSSING-001` Bell Crossing (SETTLEMENT). District names attested on personnel rows: **Civic Archive Quarter, River Court District, North Arts Quarter, Engineering Crescent, Market Archive District**. `MUNZYMUUR` = proposed working desk / residence. "EdereAirah Maryland/Baltimore mirror" = setting of Transmission 001 Scene 001, native place name OPEN. Royal castle: canonical name OPEN (DO NOT GUESS).

**People on file (EDEREAIRAH_CANON personnel):**

| Dept | Name | Title | Residence |
|---|---|---|---|
| DEPT-LEGAL-COMP-001 | Marcus Hale | Head of Legal & Business Affairs / Senior Legal Reviewer | — |
| DEPT-LEGAL-COMP-001 | Samira Vale | Chief Law Librarian & Constitutional Source Custodian | Civic Archive Quarter |
| DEPT-LEGAL-COMP-001 | Rafael Okafor-Mendes | Deputy General Counsel / Legal Reviewer | Civic Archive Quarter |
| DEPT-LEGAL-COMP-001 | Elena Marrow | Director, Privacy, Data & Consumer Protection | Civic Archive Quarter |
| DEPT-LEGAL-COMP-001 | Nadia Baptiste | Director, Global Legal Operations | Civic Archive Quarter |
| DEPT-LEGAL-COMP-001 | Darius Cole | Legal Production & PDF Manager | Market Archive District |
| DEPT-LEGAL-COMP-001 | Omar Kline | Director, Contracts & Commercial Rights | River Court District |
| DEPT-LEGAL-COMP-001 | Anika Sørensen-Vale | Employment & Labor Legal Reviewer | River Court District |
| DEPT-LEGAL-COMP-001 | Priya Nwosu | Director, IP & Media Rights | North Arts Quarter |
| DEPT-LEGAL-COMP-001 | Caleb Ishikawa | Director, Product & Regulatory Safety | Engineering Crescent |
| FOOD_INGREDIENT_INVESTIGATION | Mara Ellison | Food & Ingredient Investigator — Tribunal Member | EdereAirah |
| THY-WORLD-DOUBT-REMOVER-607 | Naya Aven | Director of Access and Follow-Through | MUNZYMUUR (proposed) |

Also on file as PERSON entities: Talia Rowan (learner), Maren Rowan (guardian), Denise Carter (reporter, 41, replaced Mara Quill), Nora Bell, Clara Bennett, Veronica Hall, Inés Morales, Bramble, Wick, Old Gerald, Uncle Seezin.

**Social-graph policy:** `THY-NAMING-SOCIAL-GRAPH-001` — "no new person enters a public scene as an isolated node."

**Transmissions already in the backend:**

| ID | State | What it is |
|---|---|---|
| ER-TX-EDU-LMS-001 | BUILT_AWAITING_PLATE_AND_APPROVAL | Bell Crossing news transmission; STILL_PLUS_VOICE; `Q_tx = C × A × P × S` (content, audio, provenance, stability); NOT ACTIVATED |
| THY-SCENE-001-DOCTOR-LEDGER-619 | DESIGN_ACTIVE | **"Transmission 001 Scene 001"** — Dr. J Lynn Edmund, network family physician, arrives ~21:30 in hard rain at the Edmonds house in the EdereAirah Maryland/Baltimore mirror, riding clinical-response vehicle UNIT 07. Darryl Edmonds (PROPOSED) holds the door. Patient PROPOSED (Malik Edmonds); diagnosis never invented. Driver = UNNAMED SLOT. Rule: "World state before camera state." |
| THY-EDMUND-ARRIVAL-616-F01-MANIFEST | APPROVAL_PENDING | Frame 01 object manifest for the same scene |
| THY-TRANS-HELP-607 / -RIGHTS-607 / -WILDLIFE-607 / -MODULAR-VEH-607 | DESIGN_ONLY | Four department transmission packets. HELP uses Naya Aven + Elena Marrow; RIGHTS uses Samira Vale + Marcus Hale with Maryland public-defender links |

**Departments (67 rows, all `active` except THY-WORLD-DOUBT-REMOVER-607 = `chairman_review_required`)** relevant here: EDEREARIAH_LAW_HOUSE, DEPT-LEGAL-COMP-001, EDEREARIAH_NEWSROOM, LIVING_WORLD_ATLAS, FOOD_INGREDIENT_INVESTIGATION, THY-DEPT-QUESTION-NAV-001, THY-DEPT-STORE-OPS-001, THY-DEPT-LICENSING-DISTRIBUTION-001, WORLD_ADMISSION_COMMITTEE, CUSTOMER_HELP_AND_RESOLUTION, ER-ACCOUNTABILITY-EVIDENCE, THY-DEPT-LANGUAGE-ACCESS-001, WELLNESS_AND_DAILY_LIFE, OCEAN_SYSTEMS_AND_INFRASTRUCTURE.

**Institutions (5 rows, all names OPEN — "DO NOT GUESS"):** INST-PERSONAL-BANK-001, INST-BUSINESS-BANK-001, INST-ROYAL-TREASURY-001, INST-FINANCIAL-REGULATOR-001, INST-MARKET-VENUE-001. Ordinary payments settle in **REE**. REE↔USD is a reference parity only; Earth cash redemption disabled by design.

**Infrastructure blueprints (3 rows, PLAIN_EARTH_BRIDGE_ACTIVE):** THY-INFRA-POWER-MESH-001 (distributed microgrids, "no single central failure should darken an entire community"), THY-INFRA-COMM-MESH-001 ("fiber backbone plus neighborhood wireless mesh plus broadcast and satellite fallback… cache essential information locally and degrade gracefully"), THY-INFRA-SPACE-COMMERCIAL-001.

**Existing registries lanes should target (not re-create):** `thylora_world_market_*` (companies 6 rows), `thylora_bank_account_types` (7), `thylora_farmer_candidates` (5) + `thylora_farmer_verification_records`, `thylora_food_provenance_chain`, `thylora_store_shelves` (13), `thylora_store_release_gate`, `thylora_help_intake_index` (**0 rows**), `legal_office_registry` (1), `thylora_math_equation_registry` (32), `thylora_workroom_registry` (30), `thylora_transmission_registry` (1), `thylora_world_earth_transmission_packets` (4), `products` (28), `orders` (1).

Relevant existing workrooms: WR-STORE-001, WR-STORE-PRODUCTS-001, WR-CHAIRMAN-DASH-001, WR-PLATFORM-APP-001, WR-DOUBT-REMOVER-606 (state begins "INBOX_CONNECTE…"), WR-NEWS-001, WR-HERBFILE-001, WR-LOST-STRUCTURES-001.

## 5 · Repo state

- Branch `claude/thylora-production-executive-zqxga5`, clean at `3a01e82`.
- `npm test` → **48 / 48 pass** before this workroom.
- `app/app.js` already reads `thylora_departments`, `businesses`, `family_story_archives`, `sports_*`, and calls `public_get_site_metrics`.

## 6 · Reads that did not complete (carried, not guessed)

- `list_tables` timed out at 60 s; replaced by an `information_schema` query, which succeeded.
- Column-level schemas were read only for `thylora_departments`, `thylora_world_entities`, `thylora_world_design_records`, `thylora_department_personnel`, `dashboard_status`, `thylora_continuity_boot_registry`, `thylora_dashboard_regression_evidence`, `thylora_workroom_registry`. **Every other table's columns are unverified**, so the backend change packets in this workroom name the target table and mark column mapping `VERIFY_BEFORE_APPLY`.
- `thylora_living_world_records` (11 rows) and `LIVING_WORLD_ATLAS` personnel were not read in full.
- Chairman source-message tables (`chairman_source_messages`, `thylora_query_carryforward`) were not read, so the earlier prompt the Chairman mentions was **not retrieved from the backend**. Deduplication against it is by lane topic only.
