# WR-ENTERPRISE-SPINE-001 · Enterprise Operating Spine & Department Activation

**Department of record:** `THY-DEPT-ENTERPRISE-SPINE-001` (P0, added 2026-10-03 to `thylora_departments`)
**Backend of record:** `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`)
**Authority:** unchanged. `DASHBOARD_AUTHORITY.md` and floor `THY-DASH-FLOOR-20260823-001` hold.
This delta is additive: no file, table, row or department was removed or renamed.

## Why this department exists

There are already 67 departments. Most of them exist as records but aren't doing any work yet.
This department coordinates. It doesn't replace Front-End Engineering (which owns the dashboard build),
QA + Deployment, or any other lane.

## Baseline audit — 2026-10-03 (read from live backend)

| Measure | Value |
|---|---|
| Departments registered | 67 (68 with this one) |
| Departments with **no personnel** | 55 |
| Departments **never spoken to** (no `thylora_department_conversations`) | 62 |
| Departments **not updated in 14+ days** | 49 |
| `approval_queue` items | 23 |
| `chairman_action_cards` | 6 |
| `thylora_gap_intelligence_registry` entries | 65 |
| `thylora_autonomy_tasks` | 399 |
| `family_relationships` rows | **0** (family structure lives only in free text) |
| `family_correction_events` rows | 0 |

## Gaps, in order

1. **Unstaffed departments.** 55 of 67 departments have no lead in `thylora_department_personnel`.
   Fix: one named lead per department, with a `reports_to` line up to `CHAIRMAN_OFFICE`.
2. **No cadence.** 62 departments have never been spoken to. Fix: a weekly check-in per department
   (status, blocker, next action) written to `thylora_department_conversations`.
3. **Stale assignments.** 49 departments haven't moved in two weeks. Fix: each `current_assignment` gets
   a next action and a date, or gets marked as waiting on something specific.
4. **Approval backlog.** 23 queued approvals plus 6 Chairman action cards. Fix: one Chairman session
   to clear them. Everything else should flow without the Chairman.
5. **Family graph is text-only.** People are named inside narratives, but `family_relationships` is empty.
   Fix: convert the maternal Wright line and the paternal Peete line into relationship rows. Keep every
   conflicting account (see doctrine below).
6. **Dashboard completion.** Owned by `FRONTEND_ENGINEERING`. The live surface is
   `vyc2st-ctrl/thylora-executive-dashboard` → `thylora-public-world`, not this repo. It counts as done when every
   baseline capability is witnessed live and each department card shows lead, status, last activity
   and next action.

## Standing doctrine registered (continuity_log, 2026-10-03)

**Multi-vantage testimony.** When the official record and a family member disagree, preserve both.
A first-printed record keeps first-print weight. A later or different account is kept as that witness's
vantage point. Nothing is overwritten. The evidence decides over time.
