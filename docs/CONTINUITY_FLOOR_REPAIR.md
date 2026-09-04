# THYLORA Continuity Floor Repair

Policy: `THY-SPINE-REANCHOR-SELECTION-001`
Backend: `thylora-dash` / `jvsdxhrfhtlgaknhjxlz`
Repair evidence row: `THY-Q-20260904-SPINE-REPAIR-271`

## Root cause

Two independent defects allowed sequences 264–269 to be treated as newer authority
than sequence 263, which carried `CURRENT_CONTROLLING_CARRYFORWARD`.

1. **No selector existed.** Before this repair the database contained **zero**
   functions or views implementing controlling-floor selection. Every consumer
   therefore fell back to ad-hoc recency. The dashboard did exactly this:
   `loadPrompts()` read `thylora_query_carryforward` with `order=sequence_no.desc`,
   which returns 271, not 263.
2. **The controlling label was not unique.** Two rows carry
   `CURRENT_CONTROLLING_CARRYFORWARD` — sequence **248** and sequence **263** —
   with no tie-breaker, no recertification lineage, and no rule that explicit
   authority outranks a status label.

A third, separate defect: the dashboard's `loadRestart()` presented
`restart_records` (a different table) as "Where we are", so the hero panel was not
reading the continuity spine at all.

## Repair shape

All corrections are **additive**. No historical custody row was mutated or deleted.
`public.thylora_query_carryforward` remains effectively immutable via
`trg_rootbound_audit_thylora_query_carryforward`.

| Object | Purpose |
|---|---|
| `thylora_continuity_anchor_authority` | Append-only ledger of DESIGNATE / REVOKE events naming the controlling anchor. |
| `thylora_continuity_row_disposition` | Append-only logical classification of existing rows (rows themselves untouched). |
| `thylora_current_controlling_floor()` | The selector. Explicit authority only; recency can never win. |
| `thylora_continuity_floor_state()` | Single backend-derived read for the dashboard. |
| `thylora_new_thread_recovery_v1()` | One call for a fresh thread to recover the floor and open work. |

### Selector precedence

The controlling floor is the highest-ordinal `DESIGNATE` row that is
`EVIDENCE_VALID` and not cancelled by a later matching `REVOKE`. Sequence number,
`created_at`, and the stored `supersession_state` label are **never** consulted for
selection. Moving the anchor requires a new Chairman-authorized recertification
whose `anchor_query_id` and `evidence_query_id` both resolve to real custody rows.

## Exact source custody

Previously **claimed but absent** from the backend (verified null before this repair):
`chairman_source_messages`, `trg_immutability_chairman_source`,
`query_chairman_exact_source`. All three now exist.

The original verbatim text is never replaced. Normalization, shorthand expansion,
summary, and AI interpretation are stored in **separate** tables
(`chairman_source_interpretation`, `chairman_source_shorthand_expansion`), each
carrying `is_source = false` enforced by a CHECK constraint and the source hash as
it stood at derivation time. Amendments are new rows in
`chairman_source_amendments`, never edits.

`trg_immutability_chairman_source` raises an exception on UPDATE/DELETE rather than
silently returning OLD, so tampering fails loudly.

## Thread clock

`thylora_thread_clock_duration_v1()` returns `evidenced_duration = NULL` and
`duration_state = 'UNVERIFIED_OPEN_SESSION'` for any session without a `CLOCK_OUT`.
`wall_clock_span` is reported separately and is explicitly **not** usage time.
Duration claims require a recorded `CLOCK_OUT` or evidence rows in
`thylora_thread_clock_events`.

## Read / unread

`READ`/`UNREAD` remains **UNKNOWN** on every surface. No receipt or acknowledgment
mechanism exists; `thylora_read_receipt_instrumentation` records this as `NONE` and
`thylora_read_state_for_surface()` cannot return anything but UNKNOWN until a
mechanism is implemented and verified.

## Known limitation — rejection logging

`thylora_reject_mutation()` originally inserted a rejection record into
`thylora_continuity_audit_shadow` before raising. **That insert always rolled back
with the exception, so no rejection was ever logged** (verified: 0 rows). The dead
insert was removed rather than left implying an audit trail that cannot exist.
Postgres has no autonomous transactions; durable rejection logging would need an
out-of-transaction mechanism and is **not implemented**.

## Deployment scope

Per `DASHBOARD_AUTHORITY.md`, the live Chairman dashboard deploys from
`vyc2st-ctrl/thylora-executive-dashboard`, which is **outside this session's
repository scope**. The dashboard changes here are source-only and are **not
deployed or witnessed** on `https://thylora-public-world.vercel.app`.

## Pre-existing baseline gap (not caused by this change)

`dashboard-baseline.json` requires 17 capabilities. Seven were already absent at
HEAD before this change and remain absent: Product & Storefront, Commerce Proof,
System Health, Required Chairman Action, Approvals, Digital Product Passports,
Connection Evidence. This repair introduced **zero** baseline regressions.

## Migrations applied

```
20260904222159  thylora_continuity_anchor_authority_ledger
20260904222232  thylora_continuity_row_disposition_and_selector
20260904222319  thylora_chairman_exact_source_custody
20260904222346  thylora_chairman_source_immutability_and_rpc
20260904222424  thylora_thread_continuity_and_clock_repair
20260904222506  thylora_continuity_floor_state_rpc
20260904222719  thylora_reject_mutation_remove_dead_audit_insert
20260904222823  thylora_new_thread_recovery_rpc
20260904223128  thylora_harden_security_definer_surface
```

Regression test: `tests/regression-continuity-floor.sql`
