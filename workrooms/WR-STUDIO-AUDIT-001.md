# WR-STUDIO-AUDIT-001 · Studio Production System — Head-Spine Forward

**Lane:** Studio people · departments · roles · productions · scene manifests · render jobs · provider routes
**Backend of record:** `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`) · PostgreSQL 17.6 · `ACTIVE_HEALTHY` · ca-central-1
**Read at:** 2026-09-24, live, by read-only SQL through the Supabase connector
**Writes performed:** **none.** No row inserted, updated or deleted. No DDL. No provider called.

> Rule held: *populate nothing without source authority.* Everything below is a
> readback of what the backend already holds, or a named gap. No person, role,
> scene, script or route was invented to fill a gap.

This closes blocker **B1** in `WR-RAELINK-001` for reading only. The backend host
was reachable from this session through the connector. Applying DDL remains a
Chairman action (B2 unchanged).

---

## 1 · What the backend holds (live counts)

931 tables in `public`. The studio spine exists as **schema**. Most of the execution
tables are **empty**.

| Stage table | Rows | | Stage table | Rows |
|---|---:|---|---|---:|
| `productions` | 16 | | `studio_scene_manifests` | **0** |
| `production_tasks` | 39 | | `thylora_scene_execution_contract` | **0** |
| `production_assignments` | 188 | | `thylora_studio_execution_jobs` | **0** |
| `production_credits` | **0** | | `studio_render_jobs` | **0** |
| `studio_people` | 23 | | `studio_render_attempts` / `_segments` / `_dependencies` | **0 / 0 / 0** |
| `studio_departments` | 3 | | `studio_prompt_packages` | **0** |
| `thylora_studio_role_registry` | 26 | | `studio_audio_events` | **0** |
| `thylora_studio_units` | 11 | | `studio_assembly_manifests` | **0** |
| `studio_world_characters` | 14 | | `studio_continuity_qa_checks` | **0** |
| `studio_character_reference_assets` | 14 | | `studio_scene_character_snapshots` | **0** |
| `thylora_character_lock_sheets` | 3 | | `studio_character_state_ledger` | **0** |
| `voice_profile_registry` | 4 | | `studio_simulation_models` | **0** |
| `thylora_visual_assets` | 94 | | `studio_provider_rate_limits` | **0** |
| `thylora_visual_scene_manifest` | 3 | | `thylora_ai_route_attempts` | **0** |
| `thylora_news_scene_manifest` | 6 | | `thylora_production_approval_checks` | **0** |
| `thylora_story_seed_registry` | 40 | | `thylora_ip_rights_parties` | **0** |
| `earth_research_cases` | 4 | | `thylora_ip_license_grants` | **0** |
| `thylora_ip_assets` | 1 | | `thylora_ip_consent_tokens` | **0** |
| `media_assets` | 18 | | `thylora_hq_room_registry` | **0** |
| `episodes` | 3 | | `workers` / `worker_personas` / `worker_employment` | **0 / 0 / 0** |

**Productions:** 16. **0 published.** Release evidence: 3 `partial`, 13 `missing`.
Stages: 11 `writing`, 2 `research`, 2 `idea`, 1 `architecture`.
**Production tasks:** 39, all `planned`. **39 of 39 have no department and no assigned person.**
Every production has the same three template tasks: requirements contract, evidence, release path.

---

## 2 · People: world staff and Earth persons kept apart

### 2a · World staff (EdereAirah / fictional layer)

| Source | Count | Layer | Notes |
|---|---:|---|---|
| `studio_people` | 23 | all `world_layer_personnel` | Investment, legal, brand, art, news, PRYE, TheSmyl. **No production craft staff.** |
| Studio role holders (`ER-STF-*`) | 26 | `EDEREAIRAH_CANON`, `STUDIO_STAFF` | In `thylora_world_entities` only. Source: *Chairman directive 2026-09-18, "Persistent studio workforce"* |
| `thylora_department_personnel` | 123 + 1 open seat | EdereAirah (3 spellings of the layer) | 52 of these are automotive (`ER_PRODUCTS_AUTOMOTIVE`) |
| `thylora_person_identity` | 71 | `EDEREAIRAH_WORLD` | 67 active, 2 in training, 2 planned |
| `studio_world_characters` | 14 | `EDEREAIRAH_CANON` | On-screen characters, not staff |

**Defects found in world staff:**

1. **Five people exist twice in `studio_people`.** Aderon Vale, Mara Elowen, Kellan Rhys,
   Sahra N'Dele and Tomas Veyr each have a `THY-PER-INV-00n` row (`paused`) and a
   `THY-INV-PER-00n` row (`active`). Nothing records which one supersedes the other.
2. **The 26 studio crew are not in `studio_people`.** `production_tasks.assigned_person_id`
   and `production_credits.studio_person_id` reference `studio_people(id)`. So **no craft
   role holder can be assigned a task or given a credit** as the schema stands.
3. **The identity layer is spelled five ways:** `world_layer_personnel`, `EDEREAIRAH`,
   `EDEREAIRAH_CANON`, `EDEREAIRAH_IN_WORLD`, `EDEREAIRAH_WORLD`. A filter written
   against any one of these misses the others.

### 2b · Earth persons (real people)

| Source | Count | State |
|---|---:|---|
| `thylora_person_identity`, `EARTH_PERSON` | 13 | 11 `EARTH_PERSON_NOT_EMPLOYED`, 2 `PROPOSED_UNACCEPTED` |
| `thylora_department_personnel`, `EARTH_PERSON_INTERNAL_DESIGNATION` | 7 | all `INVITED_NOT_ACCEPTED` |
| `thylora_internal_role_appointments` | 6 | Chairman self-confirmed. The other 5 are not yet confirmed. **Earth legal authority `NOT_ESTABLISHED` for all 6. Compensation `NONE_PROMISED`.** |
| `studio_people` where `identity_layer = 'earth_contributor'` | **0** | The value is allowed by the check constraint and has never been used |

### 2c · Earth contractors and vendors

**Real Earth contractors under agreement: zero.** No table in the backend records a
contractor agreement, rate, tax form, rights assignment or payment for an individual.
`workers`, `worker_personas` and `worker_employment` exist and are empty.

Earth **companies** (vendors) are tracked in two places that do not reference each other:

| Vendor | Where | State |
|---|---|---|
| xAI (`grok-4.20-0309-non-reasoning`) | `thylora_provider_registry` | Authenticated, integration test passed. Last checked 2026-08-23. **Text only.** |
| Google Gemini (`gemini-3.5-flash-lite`) | `thylora_provider_registry` | Authenticated, integration test passed. Last checked 2026-08-23. **Text only.** |
| OpenAI | `thylora_provider_registry` | `OPENAI_API_KEY` not available to the router. Chairman action required. |
| Anthropic | `thylora_provider_registry` | `ANTHROPIC_API_KEY` not available to the router. Chairman action required. |
| HeyGen | `external_provider_onboarding` only | `CONNECTED_AUTHENTICATED`, on the **Free plan**. Not in the provider registry, adapters or route profiles. |
| Amazon IVS, OBS Studio | `external_provider_onboarding` only | Research and evaluation. No account or workstation is on record. |
| FamilySearch | `external_provider_onboarding` only | Application prepared, not submitted |
| Lemon Squeezy | `external_provider_onboarding` only | External UI required |
| Music rights: *Walk Wit Me*; the *Who Shot Ya*-derived concept | `external_provider_onboarding` only | Still finding the rights holders. Publishers, masters and fees are unverified. |

---

## 3 · Departments, roles, units

- **`studio_departments` (3):** Legal & Compliance, Digital Product Creation, Strategic
  Investment. **None is a production craft department.**
- **`thylora_studio_role_registry` (26 roles, all `ASSIGNED`):** Direction 4, Camera 7,
  Post 3, Sound 3, Casting 2, Continuity 2, Production Design 3, Motion/Physics 2.
  The `department` column is free text ("Camera", "Post"…) and matches **no** row in
  `studio_departments` or `thylora_departments`.
- **`thylora_studio_units` (11, all `ACTIVE`):** **all 11 have `lead_role_code = NULL`.**
  `UNIT-ACTORS-A` (Performance) has no role in the role registry.
- **Roles that do not exist for pipeline stages:** writer/story editor, researcher,
  rights clearance, script supervisor, world/room builder, QA lead, release manager.
- **`production_assignments` (188)** is a second, parallel assignment system. Its
  `department_code` is free text with no foreign key, and its `status` values are
  free-form sentences. At least 16 rows are unassigned or blocked:
  `OPEN — UNASSIGNED` 11, `OPEN_UNASSIGNED` 4, `BLOCKED_PERSON_UNASSIGNED` 8.
  Of those, 7 unassigned rows sit in `STUDIO_AND_MEDIA`.

---

## 4 · The exact production path, stage by stage

For each stage: the tables that hold it, what they contain, and whether it connects to
the next stage. **✔** = a working, populated link. **◐** = schema only, or populated
but not linked. **✖** = nothing exists.

```
STORY ─✖─ RESEARCH ─✖─ RIGHTS ─✖─ SCRIPT ─✖─ WORLD/ROOM ─◐─ CAST ─◐─ ART ─◐─ MOTION ─✖─ SOUND ─◐─ EDIT ─◐─ QA ─✖─ RELEASE
```

| # | Stage | Holding tables (rows) | Crew role present | Link into the next stage |
|---|---|---|---|---|
| 1 | **STORY** | `thylora_story_seed_registry` (40), `productions` (16) | ✖ none | ✖ `productions` has no seed column. 0 seeds reference any `production_id`. `program_id` is NULL on all 16 productions |
| 2 | **RESEARCH** | `earth_research_cases` (4), `earth_record_sources` (7) | ✖ none | ✖ no link between production and research case. Cases: Benin 1897, Capone, U.S. Moorish attribution, ancient orientation / Israelite identity |
| 3 | **RIGHTS** | `thylora_ip_*` (1 asset, 2 gate runs, both `BLOCKED`), `external_provider_onboarding` (music) | ✖ none | ✖ IP is keyed by `product_code`, not by production or scene. `rights_state` on scenes and renders is free text. 0 rights parties, 0 licence grants, 0 consent tokens |
| 4 | **SCRIPT** | **no table exists** | ✖ none | ✖ 11 productions are at stage `writing` with nowhere to store a script. `thylora_news_scene_manifest.dialogue_ref` points to nothing |
| 5 | **WORLD/ROOM** | `studio_scene_manifests` (0), `thylora_scene_execution_contract` (0), `thylora_visual_scene_manifest` (3), `thylora_world_design_records` (83), `thylora_hq_room_registry` (0) | ◐ Production Design ×3 | ◐ **There are two separate scene systems.** `thylora_scene_execution_contract.scene_manifest_id` is `text` with no FK to `studio_scene_manifests.scene_id` (`uuid`). The 3 visual scene manifests await Chairman review |
| 6 | **CAST** | `studio_world_characters` (14), `studio_character_reference_assets` (14), `thylora_character_lock_sheets` (3), `studio_scene_character_snapshots` (0) | ✔ Casting ×2 | ◐ 6 of 14 characters have no `canonical_entity_id`. **All 3 locked characters** (Inés Morales, Clara Bennett, Veronica Hall) are in `thylora_world_entities` but **not** in `studio_world_characters`. 3 identity references have rights `pending` but are flagged `approved_for_generation = true` |
| 7 | **ART** | `thylora_visual_assets` (94), `thylora_visual_approvals` (2 approved: *Twelve Miles* V2 and V3) | ✔ Production Design ×3 | ◐ Assets reach renders only through `output_asset_id`. No asset is linked to a production or scene as an input |
| 8 | **MOTION** | `studio_render_jobs` (0), `studio_simulation_models` (0), `reveng_render_jobs` (4) | ✔ Motion/Physics ×2, Camera ×7 | ✖ **Nothing ever takes a render job.** `studio_claim_next_render_job()` exists, but no edge function or cron job calls it. The route `THY-AI-ROUTE-4K-001` requires `RENDER_4K`, and **no provider profile offers that capability**. All 4 `reveng_render_jobs` **failed**: 2 with `model not allowed: gpt_image_2`, 2 on the 300 s sandbox limit |
| 9 | **SOUND** | `studio_audio_events` (0), `voice_profile_registry` (4) | ✔ Sound ×3 | ✖ No voice, TTS or music provider is registered. Voices: 1 active (Lottie James), 2 rejected as non-canon, 1 needs its source recovered (Uncle Seezin). Music rights are unresolved |
| 10 | **EDIT** | `studio_render_segments` (0), `studio_assembly_manifests` (0) | ✔ Post ×3 | ◐ The schema is complete and nothing assembles. The assembly output goes to `thylora_visual_assets`, **not** to `media_assets`, which is the table release reads |
| 11 | **QA** | `studio_continuity_qa_checks` (0), `thylora_production_approval_templates` (10, all `DESIGN_ONLY`), `thylora_production_approval_checks` (0) | ◐ Continuity ×2. There is no QA lead | ✖ Templates are never turned into checks. Nothing requires a QA pass before release |
| 12 | **RELEASE** | `productions.publishing_state`, `episodes` (3), `media_assets` (18), `thylora_product_release_decisions` (25), `thylora_store_release_gate` (6), `production_credits` (0) | ✖ none | ✖ Release decisions and the store gate are keyed by **product**, not by production. All 18 media assets have rights `unverified`. All 3 episodes have captions `pending` |

### What does work today

- **Hard gate on studio execution.** `trg_thylora_studio_execution_gate` refuses any
  `thylora_studio_execution_jobs` row unless its scene contract is compiled `PASS`,
  approved by the Chairman, and carries a pass token. With 0 contracts, **every
  execution job insert is refused.** That is correct and should stay.
- **Render queue mechanics.** Lease, retry, hard dependencies and attempt logging are
  written correctly in `studio_claim_next_render_job`. The queue just has no worker.
- **The production stage vocabulary is complete.** The `productions.stage` check already
  allows 23 stages from `idea` through `product_connection`, which covers every stage
  of the path above.
- **Text AI route.** XAI and Gemini are live for `TEXT` and `CLASSIFICATION`, and 61
  router jobs have completed.

---

## 5 · Every missing execution bridge

Each bridge is one missing connection. **Authority** says who can close it: a schema
change on the backend (Chairman applies the DDL), a Chairman decision or account, or
Earth evidence.

| ID | Between | What is missing | Authority to close |
|---|---|---|---|
| **XB-01** | STORY → production | A `seed_code` on `productions` (or a link table) so each production names the story seed it came from | Schema change |
| **XB-02** | Production → program | `productions.program_id` is NULL on all 16 | Chairman names the program for each production |
| **XB-03** | STORY/RESEARCH → production | A link table from production to `earth_research_cases` for any production that makes Earth claims (the NSSM-200 set, Benin, Capone) | Schema change |
| **XB-04** | RESEARCH → claims | A claim ledger linking each factual claim in a script to an `earth_record_sources` row. Seeds are labelled `MIXED_EVIDENCE_REQUIRES_CLAIM_LEVEL_LABELING`, but there is nowhere to label them | Schema change |
| **XB-05** | RIGHTS → production/scene | IP rights are keyed by `product_code`. A production-, scene- and asset-level rights link is needed, and `rights_state` needs a fixed set of values | Schema change |
| **XB-06** | RIGHTS → parties | 0 rights parties, 0 licence grants, 0 consent tokens. The only IP asset (*Twelve Miles for Flour*) is `BLOCKED` on chain of title, bilateral provenance, jurisdiction and manifest completeness | Earth evidence and a Chairman signature |
| **XB-07** | RIGHTS → music | Rights holders for *Walk Wit Me* and the *Who Shot Ya*-derived concept are not identified | Earth evidence (publisher and master contacts) |
| **XB-08** | SCRIPT | **No script store.** A versioned script table (production, scene, lines, speaker → character, claim references, lock state) is needed | Schema change |
| **XB-09** | SCRIPT → scene | `thylora_news_scene_manifest.dialogue_ref` needs to point at a real script line | Depends on XB-08 |
| **XB-10** | WORLD/ROOM → scene | The two scene systems need to become one. `thylora_scene_execution_contract.scene_manifest_id` (`text`) must reference `studio_scene_manifests.scene_id` (`uuid`), or one system must be retired | Schema change and Chairman choice |
| **XB-11** | WORLD/ROOM → rooms | `thylora_hq_room_registry` is empty, and `studio_scene_manifests.location_name` is free text. Scenes need a link to a world location or room record | Schema change. Room entries need Chairman canon |
| **XB-12** | Scene → execution | 0 scene contracts, so the execution gate refuses everything. Each scene needs its contract compiled to `PASS` and approved by the Chairman | Chairman approval, per scene |
| **XB-13** | CAST → characters | The 3 locked characters are not in `studio_world_characters`, and 6 characters have no `canonical_entity_id` | Chairman confirms which entity each one is |
| **XB-14** | CAST → scene | `studio_scene_character_snapshots` is empty. No scene has a cast | Depends on XB-10 and XB-13 |
| **XB-15** | CAST → rights | 3 identity references are `approved_for_generation = true` while their rights are still `pending`. Generation approval should require cleared rights | Schema change (check constraint) |
| **XB-16** | People → tasks | The 26 `ER-STF-*` crew live only in `thylora_world_entities`. Tasks and credits reference `studio_people`, so the crew cannot be assigned | Schema change (link) or `studio_people` rows sourced from the 2026-09-18 directive |
| **XB-17** | People → people | 5 duplicate `studio_people` records have no record of which one supersedes the other | Chairman names the surviving record |
| **XB-18** | Roles → departments | The role registry's `department` is free text. It needs to reference a real department table, and `studio_departments` has no craft departments | Schema change. New department rows need Chairman authority |
| **XB-19** | Units → roles | All 11 units have `lead_role_code = NULL`. `UNIT-ACTORS-A` has no roles at all | Chairman names the leads |
| **XB-20** | Pipeline → roles | No roles for writer, researcher, rights clearance, script supervisor, world builder, QA lead or release manager | Chairman creates the roles and names who holds them |
| **XB-21** | Tasks → departments/people | All 39 production tasks have a NULL department and a NULL person | Depends on XB-16 and XB-18 |
| **XB-22** | Assignments → tasks | The 188 `production_assignments` rows are a separate free-text system with no link to `production_tasks` or `productions` | Schema change, or retire one of the two |
| **XB-23** | MOTION → provider | No registered provider has any capability for video, motion, image rendering or `RENDER_4K`. HeyGen is in onboarding only, with no registry, adapter or route profile | Chairman account and credential (HeyGen is on the Free plan) |
| **XB-24** | Route → provider | `studio_render_jobs.provider_code` is free text with no FK to `thylora_provider_registry`. Route policies have `max_cost_usd = NULL`, and provider profiles have `price_source = NULL` | Schema change, plus a Chairman cost ceiling |
| **XB-25** | Render queue → worker | **Nothing calls `studio_claim_next_render_job`.** None of the 40 edge functions is a render worker, and none of the 3 cron jobs touches the studio | Build a worker. Deploying it is a Chairman action |
| **XB-26** | Render → rate limits | `studio_provider_rate_limits` is empty, so the queue cannot pace itself against a provider | Evidence from the provider's published limits |
| **XB-27** | Render → prompt | `studio_prompt_packages` is empty, and nothing compiles a scene, cast and reference set into a locked prompt package | Build. Depends on XB-10 and XB-14 |
| **XB-28** | SOUND → provider | No voice, TTS or music provider is registered. `studio_audio_events` is empty | Chairman account and credential |
| **XB-29** | SOUND → voice | Uncle Seezin's voice is `SOURCE_RECOVERY_REQUIRED` | The Chairman supplies the source |
| **XB-30** | EDIT → assembly | Nothing turns render segments into an assembly manifest | Build. Depends on XB-25 |
| **XB-31** | EDIT → release | The assembly output goes to `thylora_visual_assets`. Release reads `media_assets`. There is no link between them | Schema change |
| **XB-32** | QA → checks | 10 approval templates are `DESIGN_ONLY`. Nothing creates `thylora_production_approval_checks` or `studio_continuity_qa_checks` from them | Build, then Chairman activation |
| **XB-33** | QA → release | Nothing blocks `publishing_state = 'published'` while any required QA check is open | Schema change (trigger) |
| **XB-34** | RELEASE → production | Release decisions and the store gate are keyed by product. There is no production- or episode-level release decision | Schema change |
| **XB-35** | RELEASE → credits | `production_credits` is empty, and nothing produces credits from task completion | Depends on XB-16 and XB-21 |
| **XB-36** | RELEASE → media rights | All 18 `media_assets` have rights `unverified` | Earth evidence per asset |
| **XB-37** | RELEASE → accessibility | All 3 episodes have `captions_state = pending`, and there is no captions provider | Chairman provider decision |
| **XB-38** | Earth contractors | There is no registry for real contractors: agreement, rate, tax form, rights assignment, payment evidence | Schema change. Each contractor requires a signed agreement |
| **XB-39** | Earth persons → studio | 13 Earth identities and 6 internal appointments, with Earth legal authority `NOT_ESTABLISHED`. None may be credited or paid until acceptance and authority are recorded | Acceptance by each person, then Chairman |
| **XB-40** | Providers → one registry | Vendors are split between `thylora_provider_registry` (4) and `external_provider_onboarding` (7), and neither references the other | Schema change |
| **XB-41** | Text providers → freshness | XAI and Gemini were last verified on 2026-08-23. Their profile health reads `STALE_VERIFICATION` | A health probe run (reversible, no spend) |
| **XB-42** | Layer vocabulary | The world layer is spelled five ways across four tables | Schema change: one enum, applied everywhere |

**42 bridges.** Each one names its own authority in the right-hand column. None of
them can be closed by inventing data. The ones marked *Depends on* close once the
bridge they name is closed.

---

## 6 · Shortest path to the first finished scene

This is the order that turns one production into one released scene with the fewest
authorities. Each step lists the bridges it closes. Nothing here is done yet.

1. **Pick one production.** Suggested: `THY-PROD-SEEZIN-EP001`, *Twelve Miles for Flour*.
   It already has 2 approved visuals, 4 cleared scene continuity references, locked
   character visuals and an IP asset. Chairman decision.
2. **Schema pass (one reviewable migration, held for Chairman apply):** XB-01, 05, 08,
   10, 15, 16, 18, 24, 31, 33, 34, 42.
3. **Rights:** clear chain of title for `EDF-TWELVE-MILES-FOR-FLOUR-001` (XB-06).
   Recover the Uncle Seezin voice source (XB-29).
4. **Script and scene:** enter the script (XB-08). Create the scene manifest and cast
   snapshot (XB-14). Compile the contract and get Chairman approval (XB-12).
5. **Provider:** choose a video provider and a voice provider and supply credentials
   (XB-23, 28). Enter the rate limits (XB-26). Set a cost ceiling (XB-24).
6. **Worker:** build and deploy the render worker that calls
   `studio_claim_next_render_job` (XB-25), then the assembly worker (XB-30).
7. **QA, then release:** turn the templates into checks (XB-32). Open the release
   gate (XB-33, 34). Record credits (XB-35).

---

## 7 · State

| | |
|---|---|
| Workroom | **OPEN** (audit complete; no execution) |
| Backend read | Live, 2026-09-24. Read-only |
| Backend written | **Nothing** |
| Studio schema | Present and well-formed for render, continuity, audio, assembly and QA |
| Studio data | Crew and characters partly registered. **The execution tables are empty** |
| Productions released | **0 of 16** |
| Real Earth contractors under agreement | **0** |
| Render providers able to render | **0** |
| Missing execution bridges | **42** |
| Baseline regression | None. `dashboard-current-head.html`, `dashboard-baseline.json` and `DASHBOARD_AUTHORITY.md` were not touched |

NO LOSS. DO NOT GO BACKWARD. ONE SOURCE OF TRUTH. ACCESS ≠ AUTHORITY.
CURRENT BACKEND OUTRANKS HISTORICAL PROMPTS.
