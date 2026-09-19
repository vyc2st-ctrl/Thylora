# THYLORA CONTROL CENTER — ARCHITECTURE / OPERATING-MODEL REVIEW

**Record:** THY-CONTROL-CENTER-ARCH-001
**Authority:** CHAIRMAN_DIRECTIVE, carryforward sequence 515 (`THY-Q-20260919-CONTROL-CENTER-DISCUSSION-515`)
**Backend head read:** `thylora-dash` / `jvsdxhrfhtlgaknhjxlz`, 2026-09-19
**Newer deltas read:** sequence 516 (`FOREGROUND-EQUATION`) and 517 (`DASHBOARD-CORRECTION-ROSEMARY`), both of which arrived during this run and are applied in sections J, J-bis and M.9
**This run recorded as:** carryforward sequence 518, `THY-Q-20260919-CONTROL-CENTER-ARCH-516`
**Class:** EARTH_PROPOSED — DESIGN_ACTIVE
**Scope limit:** audit and plan only. No products created, no imagery generated, nothing published, nothing activated.

QYRIS on this run is stated explicitly in section B.2.

---

## A. CURRENT-STATE AUDIT

Every number below was read from `jvsdxhrfhtlgaknhjxlz` on 2026-09-19. Nothing here is estimated.

### A.1 Head state

| Fact | Value |
|---|---|
| Carryforward head | sequence **515** |
| Head query id | `THY-Q-20260919-CONTROL-CENTER-DISCUSSION-515` |
| Head captured | 2026-09-19 10:46:58 UTC |
| Head authority | `CHAIRMAN_DIRECTIVE` |
| Head assistant payload | **`PENDING_RESPONSE_PAYLOAD`** |
| Newer deltas | none — 515 is the newest row in `thylora_query_carryforward` |

The head directive has never been closed out. Sequence 515 is still open in the ledger. That is itself the first symptom: the ledger records that a Chairman directive was received and does not record that it was answered.

### A.2 Size of the estate

| Measure | Count |
|---|---|
| Tables in `public` | **778** |
| Tables holding at least one row | 559 |
| Tables holding zero rows | 219 |
| Database functions in `public` | ~180 |
| Edge functions deployed | 37 |
| Storage buckets | 3 |
| **Objects in Supabase Storage** | **0** |

The estate is not short of capability. It is short of routing. 219 empty tables and 180 functions mean the system has been extended faster than it has been operated.

### A.3 Finding 1 — there are five competing work queues, not one

| Queue table | Rows | Distinct states | Has QYRIS gate |
|---|---|---|---|
| `idea_registry` | 294 | 7 | no |
| `thylora_autonomy_tasks` | 276 | 4 | no |
| `thylora_router_jobs` | 97 | 4 | no |
| `thylora_workroom_task_registry` | 93 | **26** | no |
| `approval_queue` | 23 | 7 | no |
| `thylora_execution_work_registry` | 19 | — | **yes** |
| **Total work rows** | **802** | | |

A piece of work can be born in any of five places, and each place speaks a different language. `thylora_workroom_task_registry` alone carries **26 distinct state strings across 93 rows** — `IN_PROGRESS`, `ACTIVE`, `IN_PRODUCTION`, `READY`, `READY_NO_BLOCKER`, `NEXT`, `QUEUED`, `COMPLETE`, `COMPLETED`, `DONE`, and seventeen more. That is free text, not a state machine. Nothing can compute "what is actually in flight" across those five tables, which is why the answer has to be re-derived by conversation every time. **That re-derivation is the chat dependency.**

### A.4 Finding 2 — QYRIS is a lock on one table, not a route

`thylora_require_qyris_before_execution()` exists and is correct. It is attached as a trigger to exactly **one** table: `thylora_execution_work_registry` (19 rows).

- Work rows in the estate: **802**
- Work rows actually behind the QYRIS trigger: **19**
- **Coverage: 2.4%**
- QYRIS check records written to date: **9**, all `PASS`

The gate `THY-QYRIS-PREEXECUTION-001` is registered in `thylora_one_way_gate_registry` with state `ACTIVE` — not `LOCKED`, unlike 26 of the 34 registered gates. So QYRIS is exactly what the Chairman called it: a passive lock on a side table, not enforceable routing. Work enters through `router_jobs`, `autonomy_tasks` and `workroom_task_registry` without ever meeting it.

### A.5 Finding 3 — autonomy is stalled, not running

| `thylora_autonomy_tasks` state | Rows | Share |
|---|---|---|
| `WAITING_EXTERNAL` | 270 | **97.8%** |
| `COMPLETED` | 3 | 1.1% |
| `WAITING_CHAIRMAN` | 2 | 0.7% |
| `FAILED` | 1 | 0.4% |

270 tasks are parked on something outside the system, and nothing names what that something is per task or when it will be re-checked. The autonomy worker is deployed (`thylora-autonomy-worker`) but has nothing it is permitted to finish. A queue that is 98% blocked is not a queue; it is a list of regrets.

### A.6 Finding 4 — the preview failure has a single physical cause

Three Chairman preview packets exist. All three are `EXPOSED_AWAITING_CHAIRMAN`.

| Packet | Pages | `viewable_url` | Blocking condition |
|---|---|---|---|
| `PKT-BRAMBLE-001` | 3 | `storefront/preview/chairman-release-packet-004.html#PKT-BRAMBLE-001` | Records contradiction — ledger claims a 9-page v2 with sha `abbeafb3…` that exists in **no byte-storing table**; the one bound delivery asset is 3 pages, sha `6c7891cf…` |
| `PKT-CITYPOWER-001` | 6 | (same relative path) | Byte `0x7F` twice in the running header of all 6 pages, 12 occurrences; undefined in WinAnsiEncoding, renders as a blank or `.notdef` box on every page |
| `PKT-LASTMATCH-001` | 6 | (same relative path) | Identical `0x7F` defect, same generation batch |

Those are real defects and they must be fixed. But they are not why the Chairman cannot see a preview. **This is why:**

```
select count(*) from storage.objects;  ->  0
```

**There are zero bytes in Supabase Storage.** Three buckets exist — `thylora-legal-private`, `thylora-social-production`, `thylora-submit-private` — and all three are empty. None of them is a preview bucket.

Follow the 94 rows in `thylora_visual_assets` to where they actually point:

| `storage_bucket` value | Assets | What it really is |
|---|---|---|
| `(null)` | 80 | no location at all |
| `chatgpt_library` / `CHATGPT_LIBRARY` | 11 | a session-scoped sandbox that expires |
| `SHOPIFY_FILES` | 1 | Shopify's CDN — a third party's storage |
| `SESSION_BUILD_ARTIFACT` | 1 | a build temp directory |
| `repo:vyc2st-ctrl/Thylora@claude/herb-file-001-preview-5mt1nu` | 1 | **a GitHub branch — the exact thing the directive forbids** |

THYLORA does not own storage for a single one of its own visual artifacts. A `viewable_url` that is a relative repository path cannot render on an iPad because there is no origin serving it. Fixing the `0x7F` byte would still not produce a preview the Chairman can open. **Preview is blocked on the absence of owned storage, not on artifact quality.**

Supporting evidence: `thylora_visual_assets` approval states are 61 `proposed` / 20 `approved` / 5 `approval_required` / 7 `retired` / 1 `rejected`. 61 proposed assets are waiting on a Chairman who has no surface on which to look at them.

### A.7 Finding 5 — the permission surface is wide open, in both directions

This is the direct answer to "explain the repeated Claude SQL permission prompts", and it has two halves that point opposite ways.

**Half one — the agent has no narrow door, so it uses the widest one.** There is no allowlisted write API for routine agent work. To move a task forward, an agent must issue arbitrary SQL. Claude's Execute SQL dialog offers only *Allow once* / *Deny* — there is no blanket grant on that dialog. Therefore every routine write costs one approval, forever. The prompts are not a bug; they are the correct behaviour of a tool being asked to do something that should never have required arbitrary SQL.

**Half two — meanwhile the database itself is not narrow at all.**

| Role | SELECT | INSERT | UPDATE | DELETE | TRUNCATE |
|---|---|---|---|---|---|
| `anon` | 511 | **500** | **500** | **500** | **500** |
| `authenticated` | 684 | 558 | 557 | 557 | **533** |
| `service_role` | 796 | 796 | 796 | 796 | 796 |

Row-level security is enabled on every table in `public` — that is the one thing holding the line, and it mostly holds: of the 109 `FOR ALL` policies reaching `anon`/`public`, 83 are `USING (false)` (a correct deny) and 20 are `USING (thylora_is_chairman())` (a correct restriction).

**Six are not.** These six carry `USING (true) WITH CHECK (true)` for role `public`, on top of full `anon` INSERT/UPDATE/DELETE/TRUNCATE grants:

- `reveng_tenants`
- `reveng_projects`
- `reveng_job_specs`
- `reveng_render_jobs`
- `reveng_render_events`
- `reveng_chat_messages`

Anyone holding the project's anon key — which by definition ships in the browser — can read, rewrite, delete or truncate all six. They are the render pipeline: the machinery that is supposed to produce the previews the Chairman is waiting on. That is the pipeline whose integrity has to be trusted, and it is currently the least protected thing in the estate.

So the standing situation is exactly inverted: **the trusted agent is throttled to one-approval-per-write, while the untrusted public role holds TRUNCATE on 500 tables.**

### A.8 Finding 6 — VLEGH is not a dossier system yet

`vlegh_registry` holds **4 rows**. All four are `EARTH_ACTUAL` source photographs:

| Canonical id | Title | Truth class | Evidence | Rights |
|---|---|---|---|---|
| `VLEGH-FAM-SRC-1970S-001` | Peete Family 1970s Source Photograph | EARTH_ACTUAL | PARTIAL | RESTRICTED |
| `VLEGH-FAM-SRC-MODERN-001` | Modern Family Gathering Source Photograph | EARTH_ACTUAL | PARTIAL | RESTRICTED |
| `VLEGH-FAM-SRC-KITCHEN-001` | Family Kitchen Activity Source Photograph | EARTH_ACTUAL | PARTIAL | RESTRICTED |
| `VLEGH-THOUGHT-WATER-SRC-001` | Thought Water Reference Commercial Source | EARTH_ACTUAL | PARTIAL | RESTRICTED |

Each `payload` carries 2 keys. There are no people, places, companies, products, buildings, sports or objects in it. VLEGH today is a small intake log of Earth reference photographs. The collectible world dossier described in the directive does not exist in any form. Section G designs it from zero rather than pretending to extend it.

### A.9 Finding 7 — operational time is genuinely half-built, and the halves are cleanly separable

`thylora_world_time_profiles` holds 2 rows, `THY-DUAL-TIME-EDEREARIAH-001` and `-002`. Both: `world_clock_state = PARTIAL_CANON_RESTORED`, `state = RECOVERY_ACTIVE`.

Settled and usable today:
- Earth anchor timezone: `America/New_York`
- Continuity day epoch: `2026-08-03`
- EdereAriah full orbit: `507 Earth-read days`

Null in the table, and therefore unusable today:
- `world_time_ratio` — NULL
- `world_day_length_minutes` — NULL

Recorded as unresolved on both profiles (6 items each):
native day length if different from the Earth SI day; native hour and sub-hour unit names and structure; native month/cycle names; season names and boundaries; weekday/rotation naming; formal epoch year numbering.

This is a good position, not a bad one. The unknowns are all *naming and subdivision*. The knowns are enough to stamp every scene today without inventing a single calendar mechanic. Section H builds Time v1 on the knowns only.

### A.10 Finding 8 — store and product pipelines are blocked on decisions, not on work

| Surface | State |
|---|---|
| `thylora_store_release_gate` | 5 `BLOCKED`, 1 `RELEASED_SELLING` |
| `thylora_product_realization_registry` | 102 rows across **11** distinct states; exactly 1 reaching `COMPLETE_FOR_TEST_PURPOSE_NONPUBLIC` |
| `approval_queue` | 15 `PENDING`, plus `DRAFT_REQUIRED`, `EVIDENCE_REQUIRED`, `RESEARCH_REQUIRED` |

Four product states name a rights or approval block directly: `RELEASE_CANDIDATE_RIGHTS_BLOCKED`, `ARTIFACT_COMPLETE_RIGHTS_AND_APPROVAL_GATED`, `FILE_VERIFIED_IDENTITY_RIGHTS_BLOCKED`, `REQUIREMENTS_OR_ARTIFACT_GAP`. The artifacts largely exist. What is missing is a surface on which one person can look at a thing and say yes or no.

### A.11 Finding 9 — the dashboard is real, and it is missing the operating surfaces

Deployment authority is **not this repository**. Per `DASHBOARD_AUTHORITY.md`: authoritative repo `vyc2st-ctrl/thylora-executive-dashboard`, authoritative runtime `thylora-public-world`, backend `thylora-dash`.

`dashboard-current-head.html` already ships: Home, Ideas, Departments, Production, Products, Orders, Entitlements, Payments, Finance, Family, Studio, HQ, Email, Assets, Access, Chairman Command, Department Talk, Spine-Forward voice panel.

Measured against the 17 surfaces the directive names, these are absent: **Today Board, QYRIS Inspector, Store Release Board, Real Preview Pane, People/World Browser, Building/Room Browser, Time/Calendar, Product Makers/Authors/Factories, Agent Jobs, Approval Inbox, Reports, Sports/Engineering, Living Map.**

The dashboard is a *viewer* over the backend. It is not yet a *control plane*, because nothing on it can start, gate, advance or finish a piece of work.

**Corrected by sequence 517:** this dashboard is not a new build and is not in Lovable. It exists and is near completion in the Vercel-backed `thylora-public-world` project family, with custody at sequence 258. Nothing in this document proposes rebuilding it. The seventeen surfaces are panels added to existing code, and `THY-WORK-DASHBOARD-NEXT` moves from `QUEUED` to `IMPLEMENTATION_ACTIVE`.

### A.12 Root cause, stated once

Free-form chat is the operating system because chat is the only place where the five queues are reconciled, the only place QYRIS is actually applied, the only place a preview can be looked at, and the only place a decision can be made. Every one of those four is a missing surface, not a missing capability. The backend already holds the data; there is simply nowhere to stand.

---

## B. CONTROL-CENTER ARCHITECTURE

### B.1 One operating route

Exactly one path from thought to done. There is no second entrance.

```
IDEA            thy_idea_capture_v1        -> idea_registry                (inbox; cannot execute)
  |
  |  Chairman promotes (only he can)
  v
QUEUE           thy_idea_promote_v1        -> thylora_control_work
  |
  v
WORK_CODE       THY-W-<YYYYMMDD>-<lane>-<nnn>   one code, one row, for life
  |
  v
QYRIS           thy_qyris_submit_v1        -> thylora_qyris_work_item_checks
  |                                            Question / Yield / Reason / Inspect / Safeguard
  |  PASS required. BLOCK stops here.
  v
AUTHORITY       gate evaluation            -> thylora_one_way_gate_registry (34 gates)
  |                                            returns: gates cleared, gates blocking
  v
EXECUTION ROUTER  thy_work_claim_v1        -> lane + lease + allowed action set
  |
  v
TOOL / AGENT    the worker acts, holding a lease, inside its allowlist only
  |
  v
EVIDENCE        thy_evidence_record_v1     -> thylora_control_evidence     (sha256 required)
  |
  v
PREVIEW         thy_preview_build_v1       -> thylora_control_preview      (renders real bytes)
  |
  v
CHAIRMAN DECISION  thy_chairman_decide_v1  -> thylora_control_decision     (APPROVE/REJECT/HOLD)
  |
  v
STATE ADVANCE   thy_work_advance_v1        -> next state, or blocked with a named reason
```

**No side-door execution** is enforced structurally, not by policy text:

1. `thylora_control_work` is the only table whose rows can reach an executing state.
2. Its state column is a Postgres **enum**, not text — the 26-string vocabulary in `workroom_task_registry` becomes impossible by construction.
3. A `BEFORE UPDATE` trigger rejects any transition into `EXECUTING` without a `PASS` row in `thylora_qyris_work_item_checks` for that `work_code`. This is the existing `thylora_require_qyris_before_execution()` logic, moved from a 19-row side table to the spine.
4. A transition into `DONE` requires at least one evidence row carrying a sha256.
5. Agents are granted **EXECUTE on the action API and nothing else** — no table grants at all (section D). An agent physically cannot write a work row by any other means.

The five existing queues are not deleted. They become **views** onto the spine plus their own lane-specific columns, so no history is lost and the one-way-spine gate `THY-ONEWAY-SPINE-001` is honoured: prior states remain historical evidence, not active operating defaults.

### B.2 QYRIS, explicit

Required in every reply and on every work item. The five letters, and what each one must produce as a value — not as a gesture:

| Letter | Meaning | Required output |
|---|---|---|
| **Q** — Question | What is actually being asked, restated in plain words | `question` text |
| **Y** — Yield | What this displaces or costs — time, money, authority, reversibility | `yield` text |
| **R** — Reason | Why this is the right next move over the alternatives considered | `reason` text |
| **I** — Inspect | Known / Unknown, split explicitly | `known` + `unknown` text |
| **S** — Safeguard | What could go wrong, what stops it, what is not reversible | `safeguard_findings` jsonb |

Verdict is `PASS`, `PASS_WITH_CONDITION`, or `BLOCK`. `BLOCK` names the gate. **GATE THAT means the row cannot change state** — the trigger raises an exception, the transaction fails, the work stops. It is not a flag anybody can choose to read.

**QYRIS for this run:**

- **Q** — Design the minimum control centre that removes free-form chat as the operating system, and write only the audit and plan to backend.
- **Y** — This run spends its whole budget on reading and designing. It produces no product, no image, no publication and no activation. That is the instruction, and it is the right trade: nine months of output has been produced without a surface to receive it.
- **R** — Every failure named in sequence 515 — invisible previews, repeated SQL approvals, neglected lanes, circular work — resolves to one of four missing surfaces, not to four unrelated problems. Fixing the surfaces fixes the class.
- **I** — *Known:* 778 tables, 802 work rows, 0 storage objects, QYRIS at 2.4% coverage, anon holding TRUNCATE on 500 tables, 6 world-writable render tables, time knowns and unknowns cleanly separated, 3 preview packets with named defects. All read directly from the backend today. *Unknown:* which of the two Bramble artifacts is canon (3-page vs claimed 9-page); the native EdereAriah calendar subdivisions; whether the executive-dashboard repo can be reached from this session.
- **S** — The audit names six tables that are publicly writable. Publishing that list into the repository is itself a small disclosure; it is recorded here because the Chairman cannot authorise a fix he cannot see, and the remedy in section D.1 is a one-line revoke he can run today. No credential, key or secret appears anywhere in this document. Nothing in this run was executed, activated, generated or published.
- **Verdict: PASS.** This document is the deliverable.

### B.3 The five new spine tables

Five tables. Not fifty. Everything else in the estate stays where it is and is referenced by key.

| Table | Purpose | Key columns |
|---|---|---|
| `thylora_control_work` | the single work spine | `work_code` PK, `lane`, `title`, `intent`, `state` (enum), `qyris_check_id`, `parent_work_code`, `source_query_id`, `lease_owner`, `lease_expires_at`, `blocker`, `acceptance_test`, `created_at`, `updated_at` |
| `thylora_control_evidence` | proof, append-only | `evidence_id`, `work_code`, `evidence_type`, `ref`, `sha256`, `payload`, `recorded_at` |
| `thylora_control_artifact` | bytes THYLORA owns | `artifact_id`, `work_code`, `bucket`, `path`, `sha256`, `mime`, `bytes`, `page_count`, `c2pa_manifest_present`, `created_at` |
| `thylora_control_preview` | renders for the iPad | `preview_code`, `artifact_id`, `page_images` jsonb, `pdf_path`, `signed_url_expires_at`, `preview_state` (enum), `render_error`, `verified_at` |
| `thylora_control_decision` | Chairman's word, append-only | `decision_id`, `subject_kind`, `subject_ref`, `decision`, `note`, `decided_by`, `decided_at` |

`thylora_control_work.state` enum, in order:

```
CAPTURED -> QUEUED -> QYRIS_PENDING -> QYRIS_PASSED -> AUTHORITY_CLEARED
         -> ROUTED -> EXECUTING -> EVIDENCE_RECORDED -> PREVIEW_READY
         -> CHAIRMAN_DECIDING -> DONE
terminal off-ramps: BLOCKED | HELD | SUPERSEDED | RETIRED
```

Forward-only, consistent with `THY-ONEWAY-SPINE-001`. A backward move is not an update; it is a new work row with `parent_work_code` set, leaving the old row as evidence.

---

## C. SAFE ACTION API — THE SMALLEST SET

Fourteen functions. This is the complete surface an agent is permitted to touch. **No unrestricted database authority is granted anywhere in this design.** Every function is `SECURITY DEFINER`, validates its own authority, and writes an audit row.

### C.1 Agent write actions (9)

| # | Function | Arguments | Returns | Replaces which recurring raw SQL |
|---|---|---|---|---|
| 1 | `thy_idea_capture_v1` | `p_title, p_body, p_lane, p_source_query_id` | `idea_id` | INSERT into `idea_registry` |
| 2 | `thy_work_open_v1` | `p_idea_id, p_lane, p_title, p_intent, p_acceptance_test, p_parent_work_code` | `work_code` | INSERT into `router_jobs` / `autonomy_tasks` / `workroom_task_registry` |
| 3 | `thy_qyris_submit_v1` | `p_work_code, p_question, p_yield, p_reason, p_known, p_unknown, p_safeguard, p_approval_required` | `verdict` | INSERT into `thylora_qyris_work_item_checks` |
| 4 | `thy_work_claim_v1` | `p_lane, p_worker, p_lease_seconds` | work row + allowed actions | the ad-hoc `SELECT … FOR UPDATE` claim pattern |
| 5 | `thy_work_advance_v1` | `p_work_code, p_to_state, p_evidence_ref, p_blocker` | new state | every `UPDATE … SET state=…` across five tables |
| 6 | `thy_work_release_v1` | `p_work_code, p_outcome, p_blocker` | ok | lease cleanup |
| 7 | `thy_evidence_record_v1` | `p_work_code, p_evidence_type, p_ref, p_sha256, p_payload` | `evidence_id` | INSERT into `connection_evidence`, `thylora_build_evidence`, `audit_events` |
| 8 | `thy_artifact_register_v1` | `p_work_code, p_bucket, p_path, p_sha256, p_mime, p_bytes, p_page_count` | `artifact_id` | INSERT into `thylora_visual_assets` / `thylora_delivery_assets` |
| 9 | `thy_world_record_upsert_v1` | `p_record_id, p_record_type, p_title, p_truth_class, p_world_layer, p_content, p_provenance` | `record_id` | UPSERT into `world_design_records`, `world_entities`, `person_identity`, `world_schedule`, `hq_floor_registry`, `sports_*` |

Function 9 is the single write door for all world content — people, places, buildings, time, sports, products. One function, discriminated by `p_record_type`, validating `truth_class` against the `thy_truth_class` enum and refusing any `EDEREARIAH_CANON` write without a Chairman decision row. This is what stops the estate growing another 219 empty tables.

### C.2 Chairman-only action (1)

| # | Function | Arguments | Guard |
|---|---|---|---|
| 10 | `thy_chairman_decide_v1` | `p_subject_kind, p_subject_ref, p_decision, p_note` | `thylora_is_chairman()` — raises otherwise |

`p_subject_kind` ∈ `IDEA_PROMOTION | PREVIEW | VISUAL_ASSET | STORE_RELEASE | CANON_WRITE | GATE_OVERRIDE | WORK_HOLD`.

This is the **only** function in the system that can move anything past a gate. One door, one log, one person.

### C.3 Preview and render (2)

| # | Function | Arguments | Returns |
|---|---|---|---|
| 11 | `thy_preview_build_v1` | `p_artifact_id` | `preview_code` — enqueues the render job |
| 12 | `thy_preview_signed_url_v1` | `p_preview_code, p_ttl_seconds` | short-lived signed URL, `ttl <= 3600` |

### C.4 Read (2)

| # | Function | Arguments | Returns |
|---|---|---|---|
| 13 | `thy_surface_read_v1` | `p_surface, p_filter` | one jsonb payload per dashboard surface |
| 14 | `thy_control_health_v1` | — | queue depths, lease expiries, blocked counts, preview failures |

One read function serves all 17 surfaces. The dashboard makes one call per panel and never touches a table.

### C.5 What this deliberately does NOT include

No `thy_execute_sql`. No `thy_table_write`. No schema-change function. No function taking a table name as a parameter. No function able to grant a permission. Migrations and forensic reads stay on the human path, in a named session, as an explicit exception — not as the daily route.

---

## D. PERMISSION-REDUCTION PLAN

Four phases. Phase 0 costs nothing and can run today.

### D.1 Phase 0 — close what is open (immediate, no build required)

1. **Revoke write from `anon` estate-wide.**
   `REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON ALL TABLES IN SCHEMA public FROM anon;`
   Removes 500-table write authority from a role whose key ships in the browser. Nothing legitimate depends on it: every public path already runs through a `SECURITY DEFINER` function (`public_capture_site_visit`, `public_submit_business_application`, `public_get_thylora_wares_v1`).
2. **Fix the six world-writable render tables.** Replace `USING (true) WITH CHECK (true)` on `reveng_tenants`, `reveng_projects`, `reveng_job_specs`, `reveng_render_jobs`, `reveng_render_events`, `reveng_chat_messages` with tenant-scoped predicates. Until this lands, the render pipeline cannot be treated as trustworthy evidence.
3. **Revoke `TRUNCATE` from `authenticated`** on all 533 tables. No application feature truncates a table.
4. **Set `ALTER DEFAULT PRIVILEGES`** so tables created from here on do not inherit these grants. Without this, finding A.7 regrows on its own.

### D.2 Phase 1 — build the fourteen functions

Create the five spine tables and the fourteen functions. Grant `EXECUTE` to `authenticated`. Change no existing grants yet. Nothing breaks; the new path simply becomes available alongside the old one.

### D.3 Phase 2 — move the agents onto the narrow door

Create a `thylora_agent` role, reached by a JWT claim, holding:

- `EXECUTE` on functions 1–9 and 11–14
- **no** `EXECUTE` on function 10 (Chairman only)
- **no table grants whatsoever** — not even SELECT

Claude and ChatGPT operate as `thylora_agent`. The measurable outcome: **routine agent work requires zero Execute SQL approvals**, because there is no SQL to execute — only RPC calls the MCP connector makes without a per-call dialog.

### D.4 Phase 3 — narrow `authenticated`, retire the wide path

Revoke direct DML from `authenticated` on the control-plane tables once the dashboard reads exclusively through `thy_surface_read_v1`. Retain Execute SQL for migrations and forensics only.

### D.5 Expected effect

| Measure | Today | After Phase 2 |
|---|---|---|
| Tables `anon` can write | 500 | 0 |
| Tables `anon` can truncate | 500 | 0 |
| World-writable tables | 6 | 0 |
| SQL approvals per routine agent write | 1 each, every time | 0 |
| Work rows behind QYRIS | 19 of 802 (2.4%) | all of them (100%) |
| Distinct work-state vocabularies | 26 free-text strings | 1 enum, 15 values |

---

## E. DASHBOARD PAGE MAP — 17 SURFACES

For each: source tables, what the Chairman sees, what he approves, what the agent may update, and a hard acceptance test that either passes or fails with no interpretation.

### E.1 TODAY BOARD
- **Source:** `thylora_control_work`, `thylora_control_decision`, `thylora_control_preview`, `thy_control_health_v1`
- **Sees:** every work item in flight grouped by state; what is waiting on him, in a numbered list, at the top; what is blocked and by which named gate; what moved since he last looked.
- **Approves:** nothing directly — it routes to the surface that owns each decision.
- **Agent updates:** `state`, `blocker`, `next_action` via `thy_work_advance_v1`.
- **Acceptance test:** with zero work rows in `CHAIRMAN_DECIDING`, the board renders "Nothing is waiting on you" and no decision control appears. With one such row, exactly one numbered item appears and its link opens the owning surface with that item already selected.

### E.2 IDEA INBOX
- **Source:** `idea_registry` (294 rows), `thylora_idea_links`, `thylora_idea_extensions`
- **Sees:** captured ideas, newest first, each with lane, origin record and the carryforward sequence that produced it.
- **Approves:** promotion of an idea into work — `IDEA_PROMOTION`. This is the only way an idea becomes work.
- **Agent updates:** may capture and enrich. **May not promote.**
- **Acceptance test:** an agent call to `thy_idea_promote_v1` without a matching `thy_chairman_decide_v1` row raises `insufficient_privilege` and writes no work row.

### E.3 QYRIS INSPECTOR
- **Source:** `thylora_qyris_work_item_checks`, `thylora_one_way_gate_registry` (34 gates)
- **Sees:** for any work code, the five QYRIS values in full, the verdict, and every gate evaluated with cleared/blocking marked.
- **Approves:** `GATE_OVERRIDE` — recorded permanently with a mandatory reason, never silent.
- **Agent updates:** submits QYRIS packets. Cannot mark its own verdict `PASS` where a `LOCKED` gate is blocking.
- **Acceptance test:** QYRIS coverage displayed as `rows_gated / rows_total`. It reads 2.4% today; it must read 100% before this surface is called complete.

### E.4 STORE RELEASE BOARD
- **Source:** `thylora_store_release_gate` (6 rows), `thylora_store_product_readiness`, `thylora_store_shelf_assignments`, `thylora_store_movement_map` (225 rows)
- **Sees:** each product with all 12 readiness flags — rights, privacy, security, billing, tax, entitlement, delivery, support, observability, rollback, mobile, witness counts — plus the exact blocker and the one next executable action.
- **Approves:** `STORE_RELEASE`, per product.
- **Agent updates:** readiness flags, blocker text, witness counts.
- **Acceptance test:** a product with any readiness flag false renders its release control **disabled with the failing flag named**. The currently `RELEASED_SELLING` product renders enabled; the 5 `BLOCKED` render disabled.

### E.5 REAL PREVIEW PANE — *the surface that unblocks everything else*
- **Source:** `thylora_control_preview`, `thylora_control_artifact`, `thylora_chairman_preview_packets`
- **Sees:** actual page images rendered at readable size on an iPad, swipeable, with page count, sha256 and generation batch visible. PDF is a download fallback, never the preview itself.
- **Approves:** `PREVIEW` — approve, reject with reason, or hold.
- **Agent updates:** registers artifacts, enqueues renders, records render errors.
- **Acceptance test:** three conditions, all required. (1) `GET` on the signed URL returns HTTP 200 with `content-length > 0`. (2) `count(page_images) = artifact.page_count`. (3) The URL host is the Supabase storage origin — **any GitHub host fails the test outright**. If any condition fails, `preview_state` stays `RENDER_FAILED` and the packet cannot be called delivered.

### E.6 PEOPLE / WORLD BROWSER
- **Source:** `thylora_world_entities` (92), `thylora_person_identity` (83), `thylora_person_life_registry` (42), `thylora_person_life_events` (34), `thylora_world_relationships` (21), `thylora_world_households`
- **Sees:** a person or entity with identity, activation state, residence, work, relationships, life events on a timeline, privacy class and every source reference.
- **Approves:** `CANON_WRITE` — any promotion of `EDEREARIAH_PROPOSED` to `EDEREARIAH_CANON`.
- **Agent updates:** proposed records and source refs only.
- **Acceptance test:** every displayed person resolves to a residence entity and a work entity, or the missing one is shown as an explicit `UNKNOWN` field — never silently blank.

### E.7 BUILDING / ROOM BROWSER
- **Source:** `thylora_hq_floor_registry` (29), `thylora_world_infrastructure_blueprints`, `thylora_miniworld_registry`, `thylora_world_households`
- **Sees:** a building, its floors in vertical order, rooms, bathrooms, furniture and wardrobe programs, visual slots, engineering dependencies, measurement state.
- **Approves:** `CANON_WRITE` on floor and room canon.
- **Agent updates:** room inventories, visual slot assignments, measurement state.
- **Acceptance test:** **every interior visual slot resolves upward to a floor, and that floor to a named building with a world address.** An interior that cannot name its building fails and is not displayable. This is the directive's interior-image rule made mechanical.

### E.8 TIME / CALENDAR
- **Source:** `thylora_world_time_profiles` (2), `thylora_world_schedule`, `thylora_thread_clock_registry`, `time_zone_transition_policy`
- **Sees:** dual clock — EdereAriah authored time and Earth mirror timestamp side by side; scheduled events; the KNOWN/RECOVERED/UNKNOWN table from section H.
- **Approves:** `CANON_WRITE` on any resolution of a currently unknown calendar mechanic.
- **Agent updates:** schedule rows and source refs. **May not invent a calendar mechanic** — see H.4.
- **Acceptance test:** every scene record carries all six Time v1 fields or names the specific one as `UNKNOWN`. No scene displays a fabricated native month or weekday name.

### E.9 PRODUCT MAKERS / AUTHORS / FACTORIES
- **Source:** `thylora_product_realization_registry` (102), `production_assignments` (188), `productions`, `studio_people` (23), `thylora_studio_role_registry` (26), `thylora_report_author_assignments`
- **Sees:** for any product, the full in-world chain of section I — who told it, who wrote it, who edited, who illustrated, which press, which distributor, how it reached Earth.
- **Approves:** maker-credit block, before release.
- **Agent updates:** chain links and assignments.
- **Acceptance test:** a product with any empty required chain role cannot reach `PREVIEW_READY`. Gate `THY-WORLD-VOICE-PRODUCT-001` is already `LOCKED` and states this; this surface makes it visible and enforceable rather than aspirational.

### E.10 AGENT JOBS
- **Source:** `thylora_control_work`, `thylora_autonomy_tasks` (276), `thylora_router_jobs` (97), `thylora_autonomy_runs`
- **Sees:** every agent, what it holds a lease on, lease expiry, attempt counts, failures with reasons, and — critically — **for each `WAITING_EXTERNAL` task, the named external thing and the re-check time.**
- **Approves:** `WORK_HOLD` — kill or hold a runaway job.
- **Agent updates:** its own lease and result.
- **Acceptance test:** no task may sit in `WAITING_EXTERNAL` without a populated `blocker` naming the external dependency and a `not_before` re-check timestamp. Applied to today's data, **270 rows fail this test immediately** and become a visible, workable list instead of silent backlog.

### E.11 APPROVAL INBOX
- **Source:** `approval_queue` (23), `thylora_control_decision`, `thylora_chairman_review_gates`, `thylora_product_release_decisions`
- **Sees:** one merged queue of everything awaiting the Chairman, ordered by what unblocks the most downstream work.
- **Approves:** all decision kinds, from one place.
- **Agent updates:** may enqueue. May never resolve.
- **Acceptance test:** approving an item here writes exactly one `thylora_control_decision` row and advances exactly one work row. No approval writes to two subjects.

### E.12 REPORTS
- **Source:** `thylora_report_workroom_spine`, `nightly_report_templates`, `thylora_report_author_assignments`, `thylora_executive_briefs`
- **Sees:** report roster, author assignments, independence and challenge requirements, dispatch state.
- **Approves:** report release.
- **Agent updates:** drafts and evidence.
- **Acceptance test:** a report whose `independence_required` or `challenge_required` is true and unmet cannot dispatch. Enforces the already-`LOCKED` gate `THY-CHALLENGE-EXPIRY-ONEWAY-001`.

### E.13 EMAIL
- **Source:** `thylora_comm_contact_profiles`, `thylora_comm_events`, `thylora_comm_agent_policies`, `thylora_comm_runtime_status`
- **Sees:** inbound and outbound by contact, escalation state, unknowns raised, knowledge scope per contact.
- **Approves:** outbound send, and any escalation crossing a knowledge-scope boundary.
- **Agent updates:** drafts, summaries, unknowns.
- **Acceptance test:** no outbound message leaves without a decision row. Agent-composed mail is always a draft.

### E.14 SPORTS / ENGINEERING
- **Source:** `sports_team_registry` (33), `sports_competition_registry`, `sports_readiness_gate`, `thylora_world_infrastructure_blueprints`, `er_automotive_*`
- **Sees:** EdereAriah competition and team first, Earth counterpart second — per section 7 of the directive and the column order already present in `sports_team_registry` (`thylora_name` precedes `earth_english_name`).
- **Approves:** `CANON_WRITE` on team, competition and ruleset canon.
- **Agent updates:** rosters, seasons, unresolved lists.
- **Acceptance test:** **no sports surface renders an Earth name above or before its EdereAriah name.** A team lacking an EdereAriah name is not displayable.

### E.15 MONEY
- **Source:** `thylora_revenue_paths` (305), `ersatzreality_financial_accounts` (24), `orders`, `payments`, `prices`, `thylora_first_sale_chain_v1`
- **Sees:** revenue paths by state, accounts by layer, real orders and payments, first-sale chain.
- **Approves:** pricing and any live payment activation.
- **Agent updates:** path steps, dependencies, next actions.
- **Acceptance test:** Earth-layer money and EdereAriah-layer money are never summed into one figure. `world_layer` is displayed on every balance. Gate `THY-SHOPIFY-LIVE-PAYMENT-PROOF-001` (`LOCKED`) applies: a connected Admin API is not proof of live payment acceptance.

### E.16 LIVING MAP
- **Source:** `thylora_movement_scoreboard`, `thylora_store_movement_map` (225), `thylora_control_work` aggregated by lane
- **Sees:** every lane at once — one row per lane showing in-flight count, blocked count, last movement, and whether the lane has moved this week. This is the surface that answers "what is being neglected while I look at this one thing".
- **Approves:** lane priority.
- **Agent updates:** movement counters on each advance.
- **Acceptance test:** a lane with no state change in 7 days renders in a visibly distinct "stalled" treatment. **No lane can be absent from the map** — a lane with zero work rows still renders, showing zero. That is how a neglected lane becomes impossible to lose.

### E.17 CHAIRMAN COMMAND (existing, retained)
- **Source:** `thylora_chairman_commands` (114), `chairman_source_messages` (30), `thylora_query_carryforward` (515)
- **Sees:** command history, carryforward head, interpretation and shorthand expansion.
- **Approves:** command interpretation before it becomes work.
- **Agent updates:** capture and interpretation.
- **Acceptance test:** every command resolves to either a work code or an explicit "not actioned" with a reason. **Sequence 515 fails this test today** — its `assistant_message` is still `PENDING_RESPONSE_PAYLOAD`.

---

## F. PREVIEW PIPELINE

### F.1 The rule

A preview is valid only when the Chairman can visibly render it on his iPad. Nothing else counts as delivery. **GitHub blob pages are prohibited as a preview surface** — and note that one asset in `thylora_visual_assets` currently points at exactly that (`repo:vyc2st-ctrl/Thylora@claude/herb-file-001-preview-5mt1nu`).

### F.2 The chain

```
1. ARTIFACT    thy_artifact_register_v1
               bytes land in bucket thylora-preview (private, to be created)
               sha256 + byte count + mime recorded at write time
                 |
2. RENDER      thy_preview_build_v1 -> render job
               PDF -> one PNG per page at 1536px wide (iPad Pro readable)
               written to thylora-preview/<artifact_id>/p001.png …
                 |
3. PAGE SET    page_images jsonb: [{page, path, width, height, bytes}]
               CHECK: count(page_images) = artifact.page_count  -- else RENDER_FAILED
                 |
4. SIGNED URL  thy_preview_signed_url_v1, TTL <= 3600s
               issued per view, never stored in a public table
                 |
5. PREVIEW PANE  dashboard renders <img> sequence, swipeable, pinch-zoom
                 PDF offered as download only, never as the preview
                 |
6. VERIFY      HEAD on the signed URL: 200 + content-length > 0
               -> preview_state = VIEWABLE, verified_at set
                 |
7. APPROVAL    thy_chairman_decide_v1(PREVIEW, …)
```

### F.3 Storage that THYLORA owns

Create one bucket: **`thylora-preview`**, private, 100 MB file limit, mime allowlist `image/png, image/jpeg, application/pdf`. Access only through signed URLs issued by function 12. This is a zero-cost change and it is the single highest-leverage action in this entire document — **with `storage.objects` at 0, no preview can exist until it lands.**

### F.4 Preview state enum

`REGISTERED → RENDERING → RENDER_FAILED → VIEWABLE → APPROVED | REJECTED | SUPERSEDED`

`VIEWABLE` is reachable only through the verification in step 6. **No agent, and no human, may set it by hand.** That removes the entire class of "preview delivered" claims made without a render — which is how three packets reached `EXPOSED_AWAITING_CHAIRMAN` pointing at a relative path.

### F.5 The three existing packets under this pipeline

| Packet | Disposition |
|---|---|
| `PKT-CITYPOWER-001` | Regenerate with a valid separator (`0xB7` middle dot or en dash), re-register, re-render. Do **not** byte-patch: the C2PA manifest hash covers the document and editing bytes silently invalidates signed provenance. That is a rights boundary. |
| `PKT-LASTMATCH-001` | Identical treatment, same batch. |
| `PKT-BRAMBLE-001` | **Chairman decision required before any render.** Two page counts are in the record and only one has bytes. See section M, decision 3. |

---

## G. VLEGH SPECIFICATION

A collectible printable world dossier. Not a worksheet. Built from zero — section A.8 establishes that the current 4 rows are Earth source photographs, not dossiers.

### G.1 Subject types

`PERSON | PLACE | COMPANY | PRODUCT | BUILDING | SPORT | OBJECT`

One schema, seven subject types, discriminated by `subject_kind`. A dossier is not a different thing for a person than for a building — it is the same card with different sections filled.

### G.2 Required fields — every dossier, every type

| Field | Rule |
|---|---|
| **Serial** | `VLEGH-<TYPE>-<WORLD>-<nnnnn>`, permanent, never reissued, printed on the face |
| **Native date/time** | EdereAriah authored date and time of the recorded moment |
| **Earth mirror date/time** | the mirror timestamp, `America/New_York` anchor — always shown second |
| **QR** | resolves to the dossier's canonical dashboard route; carries serial + sha256 of the printed face |
| **Provenance** | which source, which query sequence, which evidence rows, what is inferred vs. witnessed |
| **Identity** | canonical name, identity layer, activation state, supersession if any |
| **Relationships** | named relations to other serials, with the relation type |
| **Work** | occupation, employer entity, credential continuum per `THY-CREDENTIAL-CONTINUUM-001` |
| **Residence** | home entity → building serial → floor → room where known |
| **Maker credits** | who authored, illustrated, recorded, printed this dossier — in-world people, per section I |
| **Public/private boundary** | which fields print publicly, which print only on the Chairman edition, which never print |
| **Product/story appearances** | every product, story, episode, match or report this subject appears in, by serial |

### G.3 Type-specific sections

| Type | Adds |
|---|---|
| PERSON | body/mind/knowledge/memory profile, life events timeline, household, voice profile |
| PLACE | region, coordinates in world terms, climate/season state, governing authority |
| COMPANY | founding, charter, premises serial, staff roster, products made, revenue layer |
| PRODUCT | maker chain, materials, press/factory serial, passport, edition size, price |
| BUILDING | floors in vertical order, rooms, access class, measurement state, engineering deps |
| SPORT | EdereAriah competition **first**, Earth counterpart **second**, ruleset, teams, venue serials |
| OBJECT | material, maker, current holder, condition, standing, chain of custody |

### G.4 Printable form

- **Face:** A5, 300 dpi, 3 mm bleed. Serial and QR bottom-right. Native date above Earth mirror date, always in that order.
- **Reverse:** relationships, appearances, maker credits, provenance summary.
- **Collectible property:** serials are sequential within type and world, so absences are visible — a collector can see that `-00042` exists and they hold `-00041` and `-00043`. Gaps are the collectible mechanic.
- **Editions:** `PUBLIC | HOUSEHOLD | CHAIRMAN`. The privacy boundary in G.2 decides what each edition renders. A private field is omitted from the public plate entirely, not redacted — a black bar advertises that something was removed.
- **Diegetic marks:** logos, press marks and serials are placed as objects that belong in the world — a printer's mark, a stamped serial, a registry seal — never as modern branding overlay. Per sequence 513 on physical orientation and slogan clutter.

### G.5 Storage

`vlegh_registry` already carries `serial_number`, `canonical_id`, `truth_class`, `state`, `version`, `predecessor_id`, `evidence_status`, `rights_state`, `provenance`, `payload`. The schema is adequate. The work is population and the `payload` contract — `subject_kind` plus the G.2/G.3 blocks — not new tables. Dossiers are registered through `thy_world_record_upsert_v1` and printed through the section F preview pipeline, so a dossier that has never rendered cannot be called delivered.

---

## H. OPERATIONAL TIME v1

### H.1 The three-way split, from the actual data

**KNOWN — settled, usable today, no further work required**

| Fact | Value | Source |
|---|---|---|
| Earth anchor timezone | `America/New_York` | `thylora_world_time_profiles.earth_timezone`, both rows |
| Continuity day epoch | `2026-08-03` | `calendar_reference`, both rows |
| EdereAriah full orbit | `507 Earth-read days` | `calendar_reference`, both rows |
| Timestamp is required evidence | gate `THY-TIME-PUNCH-002`, state `LOCKED` | gate registry |

**RECOVERED — restored from source, still carrying a recovery flag**

| Item | State |
|---|---|
| Dual-time profile structure | `PARTIAL_CANON_RESTORED` |
| Profile lifecycle | `RECOVERY_ACTIVE` (both rows) |
| Earth-mirror discipline | restored at sequence 513; Earth is mirror, never primary |

**UNKNOWN — not invented under any circumstance**

| Item | Status |
|---|---|
| Native day length vs. Earth SI day | `world_day_length_minutes` is **NULL** |
| World-to-Earth time ratio | `world_time_ratio` is **NULL** |
| Native hour / sub-hour unit names and structure | unresolved, both profiles |
| Native month and cycle names | unresolved, both profiles |
| Season names and boundaries | unresolved, both profiles |
| Weekday / rotation naming | unresolved, both profiles |
| Formal epoch year numbering | unresolved, both profiles |

### H.2 The scene stamp — six fields, every scene

Time v1 is a stamp, not a calendar. Every scene, image, story beat, match, report and dossier carries:

| # | Field | Source | If unavailable |
|---|---|---|---|
| 1 | EdereAriah authored date/time | authored, orbit-day arithmetic from the epoch | `UNKNOWN`, never guessed |
| 2 | Earth mirror timestamp | `America/New_York`, full offset | required — always derivable |
| 3 | Period / era | era registry | `UNKNOWN` |
| 4 | Local location | world place entity id | required — resolves to a place serial |
| 5 | Shift | morning / midday / evening / night — *descriptive*, not a named native unit | `UNKNOWN` |
| 6 | Weather / season state | if recorded | `UNKNOWN` |

Field 5 is deliberately descriptive. "Evening" describes an observable condition of light and does not commit to a native hour name. That is how every scene gets stamped today without inventing a single unresolved mechanic.

### H.3 Day arithmetic that is safe today

Orbit position is computable from the knowns alone:

```
orbit_day = ((earth_date - 2026-08-03) mod 507) + 1        -- 1..507
orbit_fraction = orbit_day / 507
```

This yields a position in the EdereAriah year — enough to order events, compute elapsed world time, and place a scene seasonally in relative terms — **without naming a month, a season or a weekday.** Names are section H.4's business, not v1's.

### H.4 The prohibition, stated plainly

**No agent may invent a native calendar mechanic.** Not a month name, not an hour name, not a season boundary, not a weekday, not a year number. Those seven items are recorded as unresolved in the backend and are resolved only by Chairman canon through `thy_chairman_decide_v1(CANON_WRITE, …)`. An agent that needs one and does not have it writes `UNKNOWN` and raises a gap. This is enforced by `thy_world_record_upsert_v1` rejecting any `time_*` field not drawn from the KNOWN set or an existing canon row.

---

## I. PRODUCT-ORIGIN SYSTEM

Every product must feel made by people and institutions from the world. The chain is eight links, each resolving to a world person or world institution with a serial.

```
1. STORY SOURCE      where it came from — an event, a family memory, a record, a witness
                     -> thylora_story_seed_registry (40 rows)
2. AUTHOR / TELLER   the world person whose voice it is
                     -> studio_people / thylora_person_identity
3. RECORDER / WRITER who set it down; may differ from the teller
4. EDITOR            who shaped it; independence required where the report gate applies
5. ILLUSTRATOR /     who made the images or the design
   DESIGNER
6. PRESS / FACTORY   the world institution that manufactured it, with premises serial
7. DISTRIBUTOR       how it moved inside the world
8. TRANSMISSION      how it reached Earth
   TO EARTH          -> thylora_transmission_registry
```

### I.1 Rules

- Each link resolves to a serial. `UNKNOWN` is permitted; **blank is not.** A blank link blocks release.
- A link may name a collective rather than an individual, where a collective is truthful.
- The press or factory resolves to a **building serial** — which resolves to a floor and a room, per E.7. An in-world press has an address.
- Maker credits print on the product and on its VLEGH dossier, in-world, diegetically. A printer's mark, not a logo badge.
- `thylora_transmission_registry` already carries `transmission_type`, `media_mode`, `stability_state`, `content_integrity_state`, `public_explanation` and `production_truth`. Public explanation and production truth are held separately by design — the world's account of how a thing arrived and the actual production record are both kept, and never conflated.

### I.2 Enforcement

Gate `THY-WORLD-VOICE-PRODUCT-001` is already `LOCKED` and already says this: release requires an identifiable world author or collective, a voice profile, and why this person is the one telling it. Today that gate has no surface. Section E.9 gives it one, and section B.1's state machine makes it blocking rather than advisory — a product with an incomplete chain cannot reach `PREVIEW_READY`.

---

## J. EQUATION DISPLAY STANDARD

**Amended by sequence 516.** Nine parts, not seven. The same concept at three language depths — child, adult, scholar. This is not dumbing down; it is the same truth said three ways so no reader is locked out and no reader is short-changed. Always together. The equation is never separated from its explanation.

| # | Part |
|---|---|
| 1 | **WHOLE EQUATION** |
| 2 | **LEFT SIDE** — what it is, in words |
| 3 | **EQUAL SIGN** — what the equality asserts |
| 4 | **RIGHT SIDE** — what it is, in words |
| 5 | **VARIABLE BREAKDOWN** — every symbol, its meaning, its unit |
| 6 | **CHILD PLAIN MEANING** — a five-year-old understands it |
| 7 | **ADULT PLAIN MEANING** — a working adult understands what it implies |
| 8 | **SCHOLAR MEANING** — the formal statement, with its assumptions named |
| 9 | **REAL-LIFE EXAMPLE** — worked, with actual numbers |

### J.1 Worked example, in this document's own terms

**1. WHOLE EQUATION**

```
C = G / W
```

**2. LEFT SIDE** — `C`, QYRIS coverage: the share of work the gate actually inspects.

**3. EQUAL SIGN** — asserts that coverage *is* the ratio, by definition. Not approximately, not usually. If the ratio changes, coverage has changed.

**4. RIGHT SIDE** — `G / W`, gated work rows divided by total work rows.

**5. VARIABLE BREAKDOWN**

| Symbol | Meaning | Unit |
|---|---|---|
| `C` | QYRIS coverage | proportion, 0 to 1 |
| `G` | work rows behind the QYRIS trigger | rows |
| `W` | total work rows in the estate | rows |

**6. CHILD PLAIN MEANING** — If you have 802 toys and someone only checks 19 of them before you play with them, almost none of your toys got checked. This number tells you how many got checked.

**7. ADULT PLAIN MEANING** — Out of all the work THYLORA is doing, this is the fraction that gets inspected before it runs. Everything outside that fraction executes unreviewed, which is why mistakes are found after the fact instead of before.

**8. SCHOLAR MEANING** — `C` is the coverage ratio of the pre-execution inspection predicate over the work population. It assumes `W` is the complete population — which holds only once all work is on one spine. While work lives in five disjoint tables, `W` is itself an estimate, so `C` understates risk rather than measuring it. Unifying the spine is a precondition for `C` being a true measurement at all.

**9. REAL-LIFE EXAMPLE** — Today `G = 19` (rows in `thylora_execution_work_registry`) and `W = 802` (all five queues summed).

```
C = 19 / 802 = 0.0237  ->  2.4%
```

97.6 out of every 100 things THYLORA does are never inspected before they happen. After the section B.1 spine, `G = W`, so `C = 1.0` — 100%. That is the whole argument for the control centre in one line of arithmetic.

### J.2 Rendering rule

On every surface the nine parts render as one block in one order. A surface that shows part 1 without parts 2–9 is non-compliant and fails its acceptance test. This satisfies gate `THY-MATH-MOVEMENT-LADDER-001`, which already requires the visual / school / college / engineering ladder — parts 6, 7 and 8 are that ladder made mandatory rather than optional.

---

## J-bis. FOREGROUND LANE MAP

**Required by sequence 516.** Until the Control Center is verified live, every substantive THYLORA reply carries a compact foreground map of **all** active lanes — not only the lane being worked. One line per lane: lane, state, last movement, blocker. A lane with no movement still appears, marked stalled.

This is the same requirement as the Living Map surface (E.16), applied to replies in the interim. It exists so that one issue can never consume weeks while the other lanes go dark. When the Living Map is live and verified, the reply-level map is retired into it — the surface replaces the ritual.

---

## K. MIGRATION — FROM CHAT-DRIVEN TO DASHBOARD-DRIVEN

Five stages. Chat is never switched off; it is **demoted from operating system to input device.**

### Stage 1 — Close the open doors (days, no build)
Phase 0 of section D. Revoke anon write, fix the six render tables, revoke authenticated truncate, set default privileges. Nothing depends on these grants; nothing breaks.

### Stage 2 — Make preview physically possible (days)
Create the `thylora-preview` bucket. Build functions 11 and 12. Re-register one existing artifact and render it end to end. **The moment the Chairman opens one real page image on his iPad, the oldest standing complaint closes.** Do this before anything else in stage 3.

### Stage 3 — Lay the spine (weeks)
Create the five tables, the fourteen functions, the state enum and the QYRIS trigger. Backfill: map all 802 rows from the five queues into `thylora_control_work`, preserving original keys. The 26 free-text states map to the 15-value enum with an explicit, recorded mapping — no row is dropped, no state is guessed.

### Stage 4 — Move the agents (weeks)
Create `thylora_agent`, grant EXECUTE on 1–9 and 11–14, grant no tables. Point Claude and ChatGPT at it. **From this day, routine agent work produces zero SQL approval prompts.** Keep Execute SQL available for migration and forensics under a separate named session.

### Stage 5 — Turn on the surfaces, one per week (months)
In dependency order: Today Board → Approval Inbox → Preview Pane → QYRIS Inspector → Store Release Board → Agent Jobs → Living Map → People → Buildings → Time → Makers → Reports → Email → Sports → Money.

Each ships only when its acceptance test in section E passes. No surface is called live on a claim; gate `THY-TRUTH-INTEGRITY-002` is `LOCKED` and explicitly forbids calling a row written without readback.

### K.1 What changes about chat

| Today | After |
|---|---|
| Chat reconciles five queues by conversation | The spine reconciles them by schema |
| Chat is where QYRIS is applied | The trigger applies it, on every row |
| Chat is where previews are described | The pane is where previews are seen |
| Chat is where decisions are made | The Approval Inbox is where decisions are recorded |
| Chat is where neglected lanes are remembered | The Living Map cannot omit a lane |

Chat keeps what it is good at: capturing intent in the Chairman's own words, through `thylora_capture_query_pair` into the carryforward ledger. It stops being the place the company is run from.

### K.2 The measurable end condition

Free-form chat has been removed as the operating system when all five hold:

1. QYRIS coverage `C = 1.0`
2. Agent SQL approval prompts per routine write = 0
3. Every work row reachable from the Today Board
4. Every preview `VIEWABLE` by verified render, never by assertion
5. Every lane present on the Living Map, stalled lanes visibly marked

---

## L. WHAT CAN BE BUILT FIRST — ZERO AND LOW COST

### L.1 Zero cost — no new service, no new spend, hours not weeks

| # | Action | Why it is free | Effect |
|---|---|---|---|
| 1 | Revoke anon INSERT/UPDATE/DELETE/TRUNCATE on 500 tables | one SQL statement | closes the widest hole in the estate |
| 2 | Fix 6 `USING(true)` policies on `reveng_*` | six policy replacements | makes the render pipeline trustworthy |
| 3 | Create `thylora-preview` bucket | buckets are free; storage is usage-billed and currently **0 bytes** | **unblocks preview entirely** |
| 4 | Create the 5 spine tables | Postgres DDL on the existing instance | gives work one home |
| 5 | Write functions 1–9, 13, 14 | SQL functions on the existing instance | removes the SQL approval loop |
| 6 | Move the QYRIS trigger onto the spine | reattach an existing function | 2.4% → 100% coverage |
| 7 | Set `ALTER DEFAULT PRIVILEGES` | one statement | stops the hole regrowing |
| 8 | Add `blocker` + `not_before` to 270 `WAITING_EXTERNAL` rows | data hygiene | turns silent backlog into a workable list |
| 9 | Write the KNOWN/RECOVERED/UNKNOWN time table into the profiles | data write | Time v1 usable immediately |
| 10 | Today Board + Approval Inbox as two panels on the existing dashboard | the dashboard already authenticates against this backend | **the Chairman gets one place to stand** |

Items 1–10 need no new vendor, no new subscription and no new repository. They are all inside `jvsdxhrfhtlgaknhjxlz` and the existing dashboard.

### L.2 Low cost — small, usage-billed

| # | Action | Cost shape |
|---|---|---|
| 11 | PDF→PNG render worker on the existing `thylora-autonomy-worker` edge function | edge invocations, already provisioned |
| 12 | Preview storage | Supabase storage per GB; page images are ~200–400 KB each |
| 13 | Remaining 13 dashboard surfaces | build time only — same host, same auth, same backend |
| 14 | VLEGH print rendering | reuses the section F pipeline at 300 dpi |

### L.3 Deliberately deferred

New repositories, new hosting, a mobile app, a separate render service, any AI provider change. None of them is on the critical path. **The critical path is one bucket, five tables, fourteen functions and two dashboard panels.**

---

## M. CHAIRMAN DECISIONS REQUIRED

Nine decisions. Nothing in sections K or L proceeds past stage 2 without 1, 2 and 3.

**1. Approve the single control plane.**
One route: IDEA → QUEUE → WORK_CODE → QYRIS → AUTHORITY → ROUTER → TOOL → EVIDENCE → PREVIEW → DECISION → ADVANCE. Five queues become views onto one spine. No side-door execution. *Yes / No.*

**2. Approve the permission reduction.**
Revoke anon write on 500 tables, fix the 6 world-writable `reveng_*` tables, revoke authenticated TRUNCATE, set default privileges. Agents move to fourteen allowlisted functions and hold **no table grants at all**. No unrestricted database authority is granted to anything. *Yes / No.*

**3. Rule on `PKT-BRAMBLE-001` — blocking, and only you can settle it.**
The record contains two irreconcilable claims:
- Sequence 502, the readiness row, `restart_records` and the audit shadow all state **9 pages**, sha prefix `abbeafb32570abc3`. **That hash exists in no table that stores bytes.** It appears only in prose.
- The one delivery asset actually bound to this product is `Bramble_Wick_Nighttime_Story_Digital_Edition_v1.pdf`, sha `6c7891cf…`, **3 pages**, state `ACTIVE`. A buyer today receives 3 pages.

Which is canon? *(a)* The 3-page file is canon; the 9-page claim is a records error to be corrected. *(b)* The 9-page version is canon and must be located or regenerated before release. *(c)* Neither; rebuild from source.

**4. Authorise creating the `thylora-preview` bucket and re-rendering the two defective packets.**
`PKT-CITYPOWER-001` and `PKT-LASTMATCH-001` carry byte `0x7F` twelve times each. Regenerate with a valid separator and re-ingest — **not** a byte patch, because the C2PA manifest hash covers the document and editing bytes silently invalidates signed provenance. *Yes / No.*

**5. Confirm VLEGH's scope.**
Seven subject types — person, place, company, product, building, sport, object — one schema, three print editions (PUBLIC / HOUSEHOLD / CHAIRMAN), serial gaps as the collectible mechanic. Confirm or amend the type list.

**6. Confirm Time v1 operates on knowns only.**
Stamp every scene with the six fields using the Earth anchor, the `2026-08-03` epoch and the 507-day orbit. The seven unresolved items — native day length, sub-day units, month names, seasons, weekday names, year numbering, time ratio — stay `UNKNOWN` until you name them. No agent may invent one. *Confirm.*

**7. Confirm mirror canon as enforced display order.**
OUR WORLD FIRST, EARTH MIRROR SECOND — enforced at the surface, not by convention. Mirrored plants and animals are the same underlying species and properties with a different EdereAriah name and modest local phenotype variation. Sports: EdereAriah team and sport first, Earth counterpart second. A record lacking an EdereAriah name is not displayable. *Confirm.*

**8. Approve the surface build order.**
Today Board → Approval Inbox → Preview Pane → QYRIS Inspector → Store Release Board → Agent Jobs → Living Map → People → Buildings → Time → Makers → Reports → Email → Sports → Money. Amend the order if a lane needs to come forward.

**9. Name the deployment target for the control centre.**
`DASHBOARD_AUTHORITY.md` states deployment authority is `vyc2st-ctrl/thylora-executive-dashboard`, runtime `thylora-public-world`, and that this repository is **not** the source of truth for the Chairman dashboard. This document is written to `vyc2st-ctrl/Thylora` as design material only.

**Sequence 517 settles the substance of this decision:** the dashboard is *not* a new build and is *not* in Lovable. It already exists, near completion, in the Vercel-backed `thylora-public-world` project family, with custody recorded at sequence 258 (a READY forward package including the THYLORA app and Chairman dashboard previews). `THY-WORK-DASHBOARD-NEXT` is corrected from `QUEUED` future build to `IMPLEMENTATION_ACTIVE` continuation. **Architecture is not restarted.** The seventeen surfaces in section E are added to the existing dashboard as panels, against existing code.

What remains for the Chairman to confirm is narrower: the current exact production alias must be re-read before anything is called live. Confirm the alias, or name the correct one.

---

## APPENDIX — AUDIT EVIDENCE INDEX

Every claim above traces to a direct read of `jvsdxhrfhtlgaknhjxlz` on 2026-09-19.

| Claim | Evidence |
|---|---|
| Deltas 516 and 517 arrived mid-run | `thylora_query_carryforward` where `sequence_no in (516,517)` |
| Head = 515, payload pending | `thylora_query_carryforward` where `sequence_no = 515` |
| 778 tables, 559 populated | `list_tables`, public schema |
| 802 work rows across 5 queues | row counts: `idea_registry`, `autonomy_tasks`, `router_jobs`, `workroom_task_registry`, `approval_queue`, `execution_work_registry` |
| 26 free-text states | `select distinct state from thylora_workroom_task_registry` |
| QYRIS coverage 2.4% | `pg_trigger` join `pg_proc` on `thylora_require_qyris_before_execution` → 1 table, 19 rows |
| 34 gates; QYRIS gate `ACTIVE` not `LOCKED` | `thylora_one_way_gate_registry` |
| 270/276 autonomy tasks `WAITING_EXTERNAL` | `group by state` on `thylora_autonomy_tasks` |
| **0 storage objects** | `select count(*) from storage.objects` |
| 3 buckets, none for preview | `storage.buckets` |
| Assets point at null / ChatGPT / Shopify / GitHub | `group by storage_bucket` on `thylora_visual_assets` |
| anon holds write on 500 tables | `information_schema.role_table_grants` |
| 6 world-writable tables | `pg_policies` where `cmd='ALL' and qual='true'` |
| RLS enabled estate-wide | `pg_class.relrowsecurity` → zero exceptions |
| Time knowns and 7 unknowns | `thylora_world_time_profiles`, both rows |
| VLEGH = 4 Earth source photos | `vlegh_registry`, full table |
| 3 preview packets, defects named | `thylora_chairman_preview_packets`, full table |
| 5 store gates `BLOCKED`, 1 selling | `thylora_store_release_gate` |
| Deployment authority elsewhere | `DASHBOARD_AUTHORITY.md` |

## APPENDIX B — FORWARD CORRECTION

The closing payload written onto carryforward sequence 515 states that this run was recorded as *sequence 516*. It was recorded as **sequence 518**, query id `THY-Q-20260919-CONTROL-CENTER-ARCH-516`.

Cause: sequences 516 and 517 were captured from ChatGPT in the interval between reading head 515 and writing this run, so the capture function assigned 518.

Disposition: **not rewritten.** `thylora_complete_query_pair` raised `ASSISTANT_MESSAGE_ALREADY_COMPLETE` and refused the overwrite — which is the append-only custody discipline working exactly as it should. Per gate `THY-ONEWAY-SPINE-001`, the prior text remains historical evidence and the correction travels forward, here and in the design record's provenance. This is the behaviour the control plane is meant to produce everywhere: no silent edit of a closed record.

---

**END OF RECORD — THY-CONTROL-CENTER-ARCH-001**
