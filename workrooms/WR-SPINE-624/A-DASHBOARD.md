# A · Chairman Dashboard — usable-now assessment

Workroom `WR-DEPT-SYSTEMS-API-624` · read against the live backend 2026-09-28.
**Authority:** the dashboard's deployment source is `vyc2st-ctrl/thylora-executive-dashboard` → `thylora-public-world`
(`DASHBOARD_AUTHORITY.md`). That repo is **not** in this session's scope, so this run did not edit dashboard UI.
It advanced the backend the dashboard reads, and measured every component.

## Completion by component

Scale: a component is complete when a signed-in Chairman can use it on the live surface. Backend-only
readiness is counted, but a component never reads 100 % until it is witnessed live.

| # | Component | % | Evidence (verified this run) | State |
|---|---|---:|---|---|
| 1 | Authenticated live read | 70 | `thylora_chairman_dash_v1()` + `thylora_dashboard_completion_v1()` exist, SECURITY DEFINER, return `allowed:false` / `CHAIRMAN_ONLY` to anyone else; 1 `chairman` role row. Live surface serves stale build 308fb39 (WR-CHAIRMAN-DASH-001). | PARTIAL |
| 2 | Authenticated command/write | 75 | `submit_thylora_chairman_command_v1(text)` exists; 114 commands on record. Same stale-alias gap. | PARTIAL |
| 3 | Every-word coverage ledger | 85 | **Built this run:** `thylora_word_coverage_v1(query_id)`; this directive stored verbatim (hash-chained), 596 segments, 596 atoms, **Cq = 1.00**. Not yet on the board. | BACKEND DONE · UI OPEN |
| 4 | Full current-state board | 60 | `thylora_dashboard_completion_v1` returns head, store gate and contradictions. Head it reports = query custody (now seq 624). | PARTIAL |
| 5 | All open projects visible | 70 | 43 workrooms (30 prior + 13 this run) + 128 work items; **new** `thylora_department_workroom_v1` view groups them by department. | BACKEND DONE · UI OPEN |
| 6 | Sales/store movement | 55 | Readable: 28 products, 7 prices, 1 test order ($1.00 Lemon Squeezy test), 1 witness ($1.99 founding Chairman purchase, shopify_payments). **0 external-customer sales; downloads 0.** | PARTIAL (truth is visible; movement is zero) |
| 7 | Department movement | 65 | 67 departments; 12 now carry a workroom card via the view. Most host departments have 0 personnel rows. | PARTIAL |
| 8 | First-public-asset status | 60 | `social_content_queue`: 2 PUBLISHED, 2 SCHEDULED_PENDING_WITNESS, 2 PENDING_UNWITNESSED_SCHEDULE_ELAPSED, 10 HELD_PUBLISHING_FREEZE (39 rows total). Store: several readiness rows record Shopify ACTIVE (reconciliation 615). | PARTIAL |
| 9 | School/email/outreach status | 30 | `thylora_comm_events` = 1 row; farmer outreach: 1 email 2026-08-18, verification pending; no school outreach record exists. | MOSTLY OPEN |
| 10 | Backend write evidence | 90 | `thylora_master_ledger`, `continuity_log`, `audit_events` (331), `connection_evidence` (10); this run wrote continuity + ledger + restart rows. | DONE (read path) |
| 11 | Blockers | 80 | `current_blockers` on every workroom; QYRIS findings RPC `thylora_chairman_qyris_v1`. | PARTIAL (UI) |
| 12 | Next actions | 80 | Every SP624 work item has state, owner, blocker, release condition, next action. | BACKEND DONE |
| 13 | Daily check-in / check-out | 35 | Check-in RPC `thylora_record_chairman_visit_v1()` exists — **0 visits ever recorded**, so it was never wired. Check-out: **not implemented** (task SP624-A-CHECKOUT-SURFACE, NOW). | BLOCKED on UI + missing RPC |

**Weighted overall: ≈ 66 %** (equal weights). What stops it being usable *today* is one Chairman action (production alias) and one repository not in scope — not missing backend.

## Operational · partial · blocked

- **Operational (backend):** Chairman-gated reads, command write, coverage ledger, workroom view, check-in RPC, write evidence.
- **Partial:** every UI surface, because production serves an older build.
- **Blocked:** live witness of any of it — the `thylora-public-world` alias still serves 308fb39 and this session has no Vercel project read/promote scope (recorded 2026-09-11, unchanged).

## Exact next action

1. **Chairman:** promote `thylora-public-world` production to current master in the Vercel dashboard (task `SP624-A-DASH-ALIAS`).
2. Then, in `vyc2st-ctrl/thylora-executive-dashboard`: add a Coverage panel (`rpc('thylora_word_coverage_v1', {p_query_id})`), a Workrooms panel (`from('thylora_department_workroom_v1')`), and call `thylora_record_chairman_visit_v1()` on load (`SP624-A-COVERAGE-UI`).
3. Backend (NOW, no dependency): `thylora_record_chairman_checkout_v1` mirroring check-in (`SP624-A-CHECKOUT-SURFACE`).

## Restart point

Call `thylora_dashboard_completion_v1()` and `thylora_word_coverage_v1('THY-Q-20260928-SPINE-PRODUCTION-DIRECTOR-624')`
as the Chairman; if the alias has been promoted, re-probe `/js/chairman-dash.js` for 200 and start step 2.
