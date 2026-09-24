# THYLORA System Promotion Audit — thylora-dash

- **Audit ID:** THY-AUDIT-SYSTEM-PROMOTION-20260924-001
- **Backend:** `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`)
- **Backend sequence head when read:** 595
- **Read window:** 2026-09-24, about 13:00–13:20 UTC
- **Mode:** READ-ONLY. No rows were inserted, updated or deleted, and no DDL was run. Nothing was populated. No predecessor record, table, file or branch was changed or removed.

Everything in this folder is new, so every predecessor stays in place:

| File | What it is |
|---|---|
| `REPORT.md` | This report: method, findings and the top repair queue. |
| `classification.csv` | All 907 tables with class, D/P/E/W/T flags, M, the evidence behind each flag, and repair priority. |
| `classification.json` | The same data with full evidence lists. |
| `classify.py` | The deterministic classifier. Re-run it with `python3 classify.py` against `snapshot/`. |
| `snapshot/` | The raw signals as read from the backend: row counts, foreign keys, triggers, function readers and writers, witness-ledger hits, edge-function map, and row-level evidence fields. |
| `proposed/` | Draft SQL for repair R1 and the sequence-ledger entry. **Not applied.** Needs Chairman approval. |

---

## 1. QYRIS-2ST pass on this audit

The backend defines **QYRIS-1** (`thy_omniview_qyris`) as Question → Yield → Reason → Inspect → Safeguard. It does **not** define "QYRIS-2ST" or "M=D×P×E×W×T" anywhere. I searched functions, policies, continuity payloads, the sequence ledger and continuity_log.

**My interpretation:** QYRIS-2ST is the two-stage rule in continuity_log #274. Stage 1 is a QYRIS pass. Stage 2 is a final-point review that asks what is missing, tests a different path, marks and files the alternate path, and only then reports. That reading is an inference, not a backend fact. The same applies to the M formula below.

### Stage 1 — QYRIS

| Step | Result |
|---|---|
| **Question** | Which operational tables in thylora-dash have zero rows? Which have rows but no evidence that anything downstream runs on them, witnesses them, or carries them to a surface? |
| **Yield** | A class for each of the 907 tables and a ranked repair queue. No data changes. |
| **Reason** | M is multiplicative, so one zero factor makes M = 0. A registry with rows but no consumer is not operating. It is stored text. |
| **Inspect** | Evidence came from 9 independent sources: exact `count(*)`, foreign keys, triggers, SQL function bodies (as readers and as writers), views, all 40 edge functions (each read in full), repo code, witness ledgers, and row-level evidence columns. |
| **Safeguard** | Nothing was written. Regulated lanes (adult_*, game_bet_*) and genealogy are marked HOLD, not "populate". The draft SQL is in `proposed/` and has not been run. |

### Stage 2 — final-point review (what is missing, the alternate path)

- **Missing, part 1:** The `private` schema has one table, `adult_identity_vault`. It was listed but its rows were not counted. It is classed UNKNOWN.
- **Missing, part 2:** "Witness" can only be measured where THYLORA records it. Those places are `audit_events`, `thylora_master_ledger`, `thylora_continuity_audit_shadow`, `thylora_evidence_factory_jobs`, custody triggers, and filled-in evidence columns on the rows themselves. A table witnessed only in chat or screenshots shows as W=0 here. That is correct by the Chairman's own rule that a claim is not witnessed until the backend holds it.
- **Alternate path tested:** Classing by name alone gives very different counts. For example, 832 tables have a planner row estimate ≤ 0, but only 224 are actually empty. Exact counts were used everywhere.
- **Alternate path tested:** At first I matched witness ledgers by table name only, and just 6 tables reached M=1. `audit_events.entity_type` uses logical names such as `order`, `execution_work` and `THYLORA_AI_ROUTER`. After adding an explicit alias map (in `classify.py`), custody triggers, and row-level evidence fields, 69 tables reach M=1. The strict first result is kept in this section as a record.

---

## 2. The promotion equation M = D × P × E × W × T

Each factor is 0 or 1. The one-sentence versions:

| Symbol | Meaning in this scenario | Scored 1 when |
|---|---|---|
| **D** — Defined | The table exists in the live backend with a schema. | It exists. All 906 public tables score 1. |
| **P** — Populated | The table holds at least one real row. | Exact `count(*)` > 0. |
| **E** — Executed | Something downstream acts on or consumes the rows. | A writer function, trigger, reading function, view, foreign-key child table with rows, or edge function touches it. |
| **W** — Witnessed | The backend holds evidence that the action happened. | An `audit_events` entry (by name or alias), master-ledger entry, shadow audit, evidence-factory job, custody trigger (append-only, immutable or shadow-capture), filled-in evidence field on the rows, or an edge writer that also writes `audit_events`. |
| **T** — Transferred | The result reaches a surface or another mechanism. | A dashboard or chairman surface function, view, edge function, app code, or foreign-key child with rows. |

**A worked example.** Take `approval_queue`, which has 23 rows.
- D = 1 because the table exists.
- P = 1 because it has 23 rows.
- E = 1 because `thy_record_approval_v1` writes to it.
- W = 0 because no ledger records any approval action on it.
- T = 1 because `thylora_control_surface_v1` shows it.

So M = 1 × 1 × 1 × 0 × 1 = **0**. The queue is visible on the dashboard but not witnessed. The missing factor tells you the class: **WITNESS MISSING**.

**Class rule, in order:** Is P = 0? If yes, the table is INTENTIONALLY EMPTY (an event table with a live path), POPULATION MISSING (a path exists), or SCAFFOLD ONLY (no path at all). If P = 1, the first factor that is 0 among E, W, T gives EXECUTION MISSING, WITNESS MISSING or TRANSFER MISSING. If all five are 1, the table is PROMOTED.

---

## 3. Findings

**906 public tables plus 1 private:** 682 have rows and 224 are empty. Only **69 (7.6%) reach M = 1**.

| Class | Count | Commerce | Safety/Legal | Dashboard floor | Operations | General |
|---|---:|---:|---:|---:|---:|---:|
| WITNESS MISSING | 304 | 16 | 18 | 28 | 21 | 221 |
| EXECUTION MISSING | 285 | 11 | 21 | 21 | 19 | 213 |
| POPULATION MISSING | 163 | 13 | 22 | 12 | 24 | 92 |
| SCAFFOLD ONLY | 58 | 2 | 24 | 5 | 3 | 24 |
| TRANSFER MISSING | 24 | 1 | 2 | 7 | 1 | 13 |
| INTENTIONALLY EMPTY | 3 | 1 | 2 | 0 | 0 | 0 |
| UNKNOWN | 1 | 0 | 1 | 0 | 0 | 0 |
| **PROMOTED (M=1)** | **69** | 13 | 0 | 16 | 0 | 40 |

### What is working (M=1, confirmed)

- `orders`, `order_items`, `payments` and `entitlements` are each written by `thylora_process_stripe_checkout_completed`. They are witnessed in the master ledger and by audit alias, and they are surfaced.
- `connection_evidence` is witnessed by row-level `verified_at` and by thylora-system-check.
- `thylora_execution_work_registry` is gated by QYRIS and surfaced to TODAY and the control surface.
- `production_tasks`, `thylora_payment_capture_witness`, `thy_sequence_ledger`, `idea_registry` and `audit_events` are also promoted.
- The three cron jobs ran with no failures in the last 24 hours: autonomy (1,440 runs), standing invariants (1,440 runs) and recovery heartbeat (96 runs).

### Systemic causes (why the numbers look like this)

1. **The witness layer covers only a few tables.**
   - `thylora_continuity_audit_shadow` is fed by a trigger on just **8 tables**.
   - `audit_events` is written by only 8 edge functions, and they use logical names rather than table names.
   - 304 tables that are populated and executed have **no backend witness**.
2. **Most registries were loaded by hand and nothing reads them.**
   - Only 91 tables have a SQL writer function.
   - 285 populated tables have no consumer of any kind: no function, trigger, view, edge function, app code or foreign-key child. That includes safety policies.
3. **Several built mechanisms have never run once.** The writer, trigger or edge function exists, but the table is empty (163 tables).

---

## 4. Top repair queue

The queue is ordered by impact, how close the item is to promotion, and how much other work depends on it. Every repair must record its result as a new append-only sequence entry that supersedes the old state rather than rewriting it. None of these repairs may add rows that are not backed by real events or real evidence.

| # | Repair | Class, M-factor | Evidence | Repair (no blind population) | Needs Chairman? |
|---|---|---|---|---|---|
| **R1** | **Build out the witness layer** | WITNESS MISSING ×304 (W) | The shadow trigger covers 8 tables. `audit_events.entity_type` does not match table names. | Add one generic after-change witness trigger that writes to `audit_events` with `entity_type = table name`. Start with the dashboard-floor and commerce tables in rows R2–R4: `approval_queue`, `products`, `business_products`, `digital_product_passports`, `productions`, `thylora_qyris_work_item_checks`, `membership_plans`, `prices` and `thylora_product_entitlements`. Draft: `proposed/R1_witness_trigger.sql`. | Yes (DDL) |
| **R2** | **Commerce delivery chain has never run end to end** | POPULATION MISSING (P): `thylora_product_checkout_events` 0, `downloads` 0, `thylora_product_download_audit` 0, `stripe_webhook_events` 0 | There is 1 order, 1 payment and 1 entitlement. `thylora_process_stripe_checkout_completed` **does** write `stripe_webhook_events`, but that table is empty. That is a **contradiction**: either the one order did not come through the webhook path, or its webhook record is missing. | First, find out where the existing order came from (read only). Then witness one real purchase → entitlement → protected download through the live path. Do not insert synthetic rows. | Yes (a live purchase) |
| **R3** | **Approval decisions are not being recorded** | POPULATION MISSING (P,W): `approval_records` 0 while `approval_queue` has 23 | Decisions are going to `thylora_chairman_preview_decisions` (5) and `thylora_chairman_review_decisions` (2) instead. | Chairman ruling needed. If `approval_records` is superseded, record that as a supersession and keep the table. If it is not, make `thy_record_approval_v1` write the decision row. | Yes (ruling) |
| **R4** | **Safety policies that nothing enforces** | EXECUTION MISSING (E,W,T) | `child_safeguarding_policy`, `protection_protocol_registry`, `thylora_six_protection_redundancy`, `qq_guardian_controls`, `dashboard_trust_protocol`, `thylora_voice_identity_resolution_gate`, `thylora_voice_transcription_identity_gate` and `thylora_world_identity_gate` all have rows, but no function, trigger or edge function reads them. Enforcement, such as `family_block_unapproved_child_provisioning_trigger`, is hard-coded elsewhere. | Tie each enforcing trigger to its policy row (read `policy_code` or `state`), or mark the policy as documentary-only. Child safety goes first. | Yes (policy binding) |
| **R5** | **Executive patrol has never run** | POPULATION MISSING (P): `thylora_patrol_runs` 0, `thylora_patrol_findings` 0, `thylora_identity_gate_records` 0, `thylora_production_approval_checks` 0 | The edge function `thylora-executive-patrol` exists and writes all four tables. **No cron job schedules it.** Only the autonomy, invariants and heartbeat jobs exist. This is the function behind the "detect stopped or disappeared work" directive (continuity_log #275 and #278). | Schedule the patrol, or run it once and witness it. The first run fills these tables with real findings. | Yes (schedule) |
| **R6** | **Transfer mechanism and QYRIS graph are empty shells** | SCAFFOLD ONLY: `thylora_gap_transfer_registry`, `thylora_qyris_node`, `thylora_qyris_cluster`, `thylora_qyris_contradiction`, `thylora_qyris_stop_test` | The T factor has no mechanism behind it. `thylora_gap_intelligence_registry` holds 56 gaps and none have been transferred. The QYRIS graph tables have no writer at all. | Build a writer (`thy_record_gap_transfer_v1`) before loading any data. Fill it only from real gap → target mappings. | No (build), yes (release) |
| **R7** | **Lineage and heritage research never becomes identity links** ⚑ core interest | POPULATION MISSING: `earth_identity_links` 0, `earth_lineage_relationships` 0. SCAFFOLD: `earth_identity_entities` 0. EXECUTION MISSING: `earth_record_evidence` 8, `thylora_windsor_evidence_matrix` 10 | There are 4 open cases: **Benin 1897 Expedition / Benin Kingdom provenance**, **U.S. Moorish-attribution / Moorish Revival architecture**, **ancient orientation / Israel identity**, and Al Capone. There are also 7 Peete-family genealogy intakes. The 8 evidence rows are not linked to any identity entity, and no lineage relationship exists. All 10 Windsor rows are `SCHOLARSHIP_REFERENCE_UNVERIFIED_IN_SESSION`. The workforce question WIN-100 (which lodges and which training lineage built Windsor) is `UNKNOWN`, and the `unnamed_workforce` column is unresolved. | **HOLD. Do not populate.** Several genealogy intakes say "hold from authoritative Earth genealogy until evidence". Promote only from `earth_record_evidence` rows whose `evidence_status` is verified. Source-verify the Windsor matrix row by row before any claim is surfaced. | Yes (evidence) |
| **R8** | **Family access has never been used** | POPULATION MISSING (P,W): `thylora_dashboard_identity_invites` 0, `family_memberships` 0, `family_relationships` 0, `family_timelines` 0 | The writers `issue_…invite_v1` and `claim_…invite_v1` exist, and there are 8 family profiles. | The Chairman issues one real invite, and the claim is witnessed. Do not seed members. | Yes |
| **R9** | **Rights and IP custody chain is empty while a gate reads it** | POPULATION MISSING: `thylora_ip_consent_tokens`, `…consent_state_events`, `…chain_of_title_events`, `…provenance_attestations`, `…license_grants`, `…jurisdiction_reviews` are all 0 | `thylora_evaluate_rights_gate` and `thylora_export_b2b_rights_package` read these empty tables. Rights clearance is recorded elsewhere, for example HERB FILE 001 "rights cleared" in continuity_log #339. | Check what the gate returns when it has no evidence (read only). Record attestations only for assets already cleared, citing their existing evidence. | Yes (attestation) |
| **R10** | **Continuity custody is not surfaced** | TRANSFER MISSING (T) | `thylora_continuity_audit_shadow` (573), `thylora_continuity_row_disposition` (12), `thylora_continuity_anchor_authority` (2), `thylora_thread_continuity_evidence` (2) and `thylora_bank_security_events` (24 fraud holds) are witnessed but do not appear on any surface. "Continuity" is a required dashboard baseline capability. | Add reads to the dashboard completion function. Surface work belongs in `vyc2st-ctrl/thylora-executive-dashboard` under DASHBOARD_AUTHORITY.md. | No (additive) |
| **R11** | **Regulated lanes are scaffold only** | SCAFFOLD or POPULATION MISSING: 11 of the 17 adult_* tables and 7 of the 19 game_bet_* tables | Gates such as `adult_asset_live_gate` and `trg_game_bet_ticket_gate` exist, but nothing is licensed or populated. | **HOLD.** Keep empty until the legal, licensing and consent gates pass. Record a formal hold per lane so these tables are counted as intentionally empty rather than broken. | Yes (legal) |
| **R12** | **Bulk triage of registries nobody reads** | EXECUTION MISSING, 213 general tables | Hand-loaded reference tables with no consumer. | Tag each as REFERENCE (read by people, M not applicable), MECHANISM (needs a consumer), or SUPERSEDED (record the supersession and keep it). **Delete nothing.** | Yes (batch ruling) |

⚑ = the item touches the Chairman's standing core interests: African lineage and heritage, suppressed or unverified historical narratives, and mainstream-source bias. It is ranked as a primary item, not a side note.

### R7 in detail (core-interest breakdown)

- **What is known.**
  - The backend already treats Benin 1897 provenance, U.S. Moorish attribution, and ancient Israel identity as open historical research cases.
  - The Windsor matrix separates a standing correction (William did not build the present castle) from a real open question: who the masons and the workforce were (WIN-100, `unnamed_workforce`).
- **What is unknown.**
  - None of the 8 evidence rows is linked to an identity entity, so no lineage claim can be read from the backend yet.
  - None of the Windsor claims has been source-verified in a session.
- **Why it matters.** THYLORA already has the structure for heritage research that can be defended: cases → sources → evidence → entities → lineage. It stops at the evidence step. The empty identity and lineage tables are the reason no heritage finding reaches a surface.
- **Counterweight.** Promoting unverified links would break the Chairman's own genealogy holds. The gap is in evidence, not in data entry.

---

## 5. What this audit did not do

- It did not count rows in `private.adult_identity_vault` (UNKNOWN).
- It did not open the browser-side JavaScript served by `thylora-dashboard`, `thylora-current-head` or `dash` beyond what the edge-function reader recorded.
- It did not read `vyc2st-ctrl/thylora-executive-dashboard`. Transfer evidence from that repo is counted only through backend surface functions.
- It did not apply any SQL or write the sequence entry. The drafts in `proposed/` are waiting for approval.
