# LANE C · Dashboard / API Completion Strike Team

**Workroom:** WR-PROD-FLOOR-001 · **Owner:** production executive session · **Date:** 2026-09-28
**Backend:** `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`), read live this session.
**Authority:** the dashboard deploys from `vyc2st-ctrl/thylora-executive-dashboard` → `thylora-public-world`, not from this repo. Nothing here changes the deployed dashboard.

**Headline:** 17 of 30 acceptance checks verified = **56.7%**. 7 of 15 cut items fully pass.
Five of the six FAILs have **one cause**: five tables have row-level security switched on with **no policy**, so the Chairman reads zero rows from them. The fix is written, validated locally, and held for approval. With it applied, the figure moves to **73.3%**.

---

## 1 · How this was measured

No impression-based numbers. Each check is a row in `api/acceptance.js`, and the percentage is computed by code:

```
P = |{ c ∈ CHECKS : c.state = PASS ∧ c.evidence ≠ ∅ }| ÷ |CHECKS| × 100
```

| Symbol | Meaning | Unit |
|---|---|---|
| `P` | percent complete | percent, 0–100 |
| `CHECKS` | the fixed list of 30 acceptance checks for the 15-item cut | set |
| `c.state` | one of PASS, FAIL, BLOCKED, NOT_TESTED, APPROVAL | enum |
| `c.evidence` | the observation that proves a PASS | text |
| `|·|` | number of elements | count |
| `∧` | "and" | — |

- **Class:** FORMAL SYSTEM LAW (a counting rule over a defined set). It is not a physical law.
- **Domain:** 0 ≤ P ≤ 100.
- **Threshold:** "usable cut" = every one of the 15 cut items has all its checks PASS.
- **Assumption:** checks are equally weighted. This is stated, not hidden. Item-level completion is reported separately so a heavy item cannot hide behind light ones.
- **Failure condition:** a PASS without evidence is not counted. The test suite enforces this.
- **Worked example:** 17 PASS with evidence ÷ 30 checks × 100 = **56.7%**.

**Evidence levels used:**
- **DB_RLS:** I impersonated the real Chairman identity (`thylora_user_roles.role = 'chairman'`) inside a `begin read only … rollback` transaction and counted rows through the actual RLS policies. This proves the database layer. It does **not** prove the browser layer.
- **PRIOR_RECORD:** a VERIFIED row already in the backend.
- **STATIC:** repo inspection.
- **HTTP_BROWSER:** a signed-in browser on the authoritative URL. This is the strongest level, and none was possible from this session.

## 2 · The Minimum Usable Chairman Cut — check by check

| Item | Check | State | Evidence / dependency |
|---|---|---|---|
| 1 authenticate | C01 password sign-in | **PASS** | THY-DS-CHAIRMAN-AUTH VERIFIED 2026-08-07 |
| 1 | C02 Chairman identity resolves | **PASS** | `thylora_is_chairman()` = true for the Chairman uid; exactly 1 Chairman role row |
| 1 | C03 non-Chairman sees nothing | **PASS** | random uid read 0 rows from restart_records, departments, carryforward, dashboard_status, source_segments, orders, products |
| 1 | C04 anon has no policy | **PASS** | every Chairman-table policy is `TO authenticated USING thylora_is_chairman()` |
| 2 restore session | C05 refresh on expiry | **FAIL** | the R5 dashboard stores `thy_refresh_token` and never calls `grant_type=refresh_token`. Fixed in `api/client.js` (6 tests). The edge-hosted `thylora-current-head` surface already uses supabase-js `autoRefreshToken: true`. |
| 2 | C06 reload restores on iPad | NOT_TESTED | Chairman device witness |
| 3 live read | C07 Chairman reads live rows | **PASS** | restart_records 149, departments 67, dashboard_status 55, ui_modules 76 |
| 3 | C08 browser live read on authoritative URL | NOT_TESTED | THY-DS-FRONTEND gate |
| 4 command/write | C09 `chairman-command` deployed with JWT verification | **PASS** | ACTIVE v17, verify_jwt=true |
| 4 | C10 commands produce stored responses | **PASS** | 114 commands; 83 COMPLETED, 31 ROUTED; last 10 all carry `dashul_response` |
| 4 | C11 fresh command → response → readback this cycle | NOT_TESTED | last command 2026-09-05, 23 days ago |
| 4 | C12 the 31 ROUTED commands reach a terminal state or show why | NOT_TESTED | router backlog review |
| 5 continuity boot | C13 | **PASS** | THY-CONTINUITY-BOOT-002 v1 readable |
| 6 current task/state | C14 | **PASS** | latest restart record readable |
| 7 Every-Word ledger | C15 source atoms readable | **PASS** | chairman_source_segments 597, query_carryforward 615 |
| 7 | C16 coverage ledger readable | **FAIL** | `thylora_response_point_coverage`: 0 of ~728 rows visible; RLS on, 0 policies |
| 8 open lanes | C17 workroom registry | **FAIL** | 0 of 30 visible; RLS on, 0 policies |
| 8 | C18 lane tasks | **FAIL** | 0 of ~49 visible; RLS on, 0 policies |
| 9 blockers | C19 | **PASS** | dashboard_status.blocker readable |
| 10 next actions | C20 | **PASS** | dashboard_status.next_action + restart_records.next_action |
| 11 store/sales | C21 products/orders/payments/entitlements | **PASS** | 28 / 1 / 1 / 1 |
| 11 | C22 store readiness | **FAIL** | 0 of 14 visible; RLS on, 0 policies |
| 11 | C23 real-money checkout witnessed | BLOCKED | THY-DS-CURRENT-STORE-20260910: `active_allowed=false`, checkout witness 0 |
| 12 department status | C24 | **PASS** | departments 67 + conversations 33 |
| 13 evidence links | C25 connection evidence | **PASS** | 10 rows |
| 13 | C26 regression evidence | **FAIL** | 0 of 42 visible; RLS on, 0 policies |
| 14 audit trail | C27 | **PASS** | audit_events 331 (latest 2026-09-24), audit_log 25 |
| 15 no-regression | C28 Build 8 static regression | **PASS** | OPERATING-SURFACE-001 PASS 2026-09-17 |
| 15 | C29 witnessed on authoritative production URL | BLOCKED | merge to thylora-executive-dashboard + Vercel promotion; alias stale |
| 15 | C30 API v1 contract frozen | APPROVAL | Chairman approves `api/thylora-api-v1.openapi.yaml` |

**Totals:** PASS 17 · FAIL 6 · BLOCKED 2 · NOT_TESTED 4 · APPROVAL 1 = 30.
**Items fully passing:** 1, 5, 6, 9, 10, 12, 14 → **7 / 15**.

## 3 · Exact API contract

File: **`api/thylora-api-v1.openapi.yaml`** — OpenAPI 3.1. It has 20 paths and 21 operations; it parses and every `$ref` resolves (checked). Every operation carries `x-thylora-cut-item` (all 15 items are covered) and `x-thylora-source`, which names the backend object it maps to today, so the backend can be swapped without breaking callers.

| Method | Path | Cut item | Maps to today |
|---|---|---|---|
| GET | /v1/health | — | service-role `select 1` |
| POST / DELETE | /v1/auth/session | 1 | `/auth/v1/token?grant_type=password`, `/auth/v1/logout` |
| POST | /v1/auth/refresh | 2 | `/auth/v1/token?grant_type=refresh_token` |
| GET | /v1/auth/me | 1 | `auth.uid()` + `thylora_user_roles` |
| GET | /v1/continuity/boot | 5 | `thylora_continuity_boot_registry` |
| GET | /v1/continuity/current | 6 | `restart_records` latest |
| GET | /v1/source-atoms | 7 | `chairman_source_segments` ⟕ `thylora_response_point_coverage` |
| GET | /v1/coverage | 7 | coverage totals, `complete` iff `unaccounted = 0` |
| GET | /v1/lanes | 8 | `thylora_workroom_registry` |
| GET | /v1/tasks | 8 | `thylora_workroom_task_registry` |
| GET | /v1/dashboard/status | 3, 9, 10 | `dashboard_status` newest first |
| POST | /v1/commands | 4 | edge fn `chairman-command` (requires Idempotency-Key) |
| GET | /v1/commands/{id} | 4 | `thylora_chairman_commands` readback |
| GET | /v1/departments | 12 | `thylora_departments` |
| GET | /v1/departments/{code}/conversations | 12 | `thylora_department_conversations` |
| POST | /v1/departments/{code}/messages | 12 | edge fn `thylora-department-talk` |
| GET | /v1/store/status | 11 | products, prices, orders, payments, entitlements, readiness, store status row |
| GET | /v1/evidence | 13 | `connection_evidence` ∪ regression evidence |
| GET | /v1/regression | 15 | `dashboard-baseline.json` vs regression evidence; fails closed |
| GET | /v1/audit | 14 | `audit_events` ∪ `audit_log` |

**Contract rules:**
- Every 2xx response is `{ data, meta }` and every error is `{ error: { code, message, route } }`.
- Money is integer minor units, never floats.
- Cursors are opaque, never offsets.
- There are exactly two writes, and both go through existing JWT-verified functions.
- The `AtomState` enum is the eight Every-Word states plus `UNACCOUNTED`. A query only counts as complete when `UNACCOUNTED = 0`.

## 4 · What freezes v1 · what waits

**v1 freezes when all three are true:**
1. The Chairman approves the contract file (C30).
2. Policy migration 0001 is applied and read back, so that `/coverage`, `/lanes`, `/tasks`, `/store/status` readiness and `/evidence` stop returning empty sets.
3. One command round trip is witnessed through `/commands` → `/commands/{id}` (C11).

**v1.1 and later** (recorded as `x-thylora-deferred` in the contract):
- v1.1:
  - product and price writes
  - checkout (wraps `p0-checkout` / `thylora-product-checkout`)
  - downloads (`thylora-protected-download`)
  - entitlement grants
  - payment detail and refunds
  - lane and task mutation
  - manual atom-state setting
  - preview tokens
  - voice
- v1.2 and later:
  - mobile push
  - public anon endpoints
  - webhook fan-out
  - offline sync

## 5 · Authenticated-read test matrix

The DB_RLS column was **run today**. The HTTP_BROWSER column is the witness the Chairman or a session with authoritative-URL access must run.

| Resource | Chairman (DB_RLS, today) | Non-Chairman (DB_RLS, today) | Anon | HTTP_BROWSER |
|---|---|---|---|---|
| restart_records | 149 ✔ | 0 ✔ | no policy ✔ | pending |
| thylora_departments | 67 ✔ | 0 ✔ | no grant ✔ | pending |
| thylora_query_carryforward | 615 ✔ | 0 ✔ | no policy ✔ | pending |
| dashboard_status | 55 ✔ | 0 ✔ | no policy ✔ | pending |
| chairman_source_segments | 597 ✔ | 0 ✔ | no policy ✔ | pending |
| thylora_continuity_boot_registry | 1 ✔ | — | no policy ✔ | pending |
| audit_events / audit_log | 331 / 25 ✔ | — | no policy ✔ | pending |
| products / orders / payments / entitlements | 28 / 1 / 1 / 1 ✔ | products 0, orders 0 ✔ | products: published+cleared only | pending |
| thylora_response_point_coverage | **0 ✘** | 0 | — | blocked by 0001 |
| thylora_workroom_registry | **0 ✘** | — | — | blocked by 0001 |
| thylora_workroom_task_registry | **0 ✘** | — | — | blocked by 0001 |
| thylora_store_product_readiness | **0 ✘** | — | — | blocked by 0001 |
| thylora_dashboard_regression_evidence | **0 ✘** | — | — | blocked by 0001 |

**How to re-run:** the witness SQL is at the bottom of `db/dashboard-cut/0001_chairman_read_policies.sql`.

## 6 · Command/write test

1. `POST /v1/commands` with header `Idempotency-Key: WR-PROD-FLOOR-001-C11-<date>` and body `{"command":"STATUS PING · WR-PROD-FLOOR-001 · no action requested"}`. Expect 202 and an `id`.
2. `GET /v1/commands/{id}` until `status ∈ {COMPLETED, ROUTED}`. Expect `response` to be non-null within the router's normal window.
3. Resend the same key and body. Expect the same `id` and no second row.
4. Resend the same key with a different body. Expect 409.
5. `GET /v1/audit?since=<t0>`. Expect an audit row for the command.

**Pass condition:** steps 1–5 all hold. Until the API exists, the same test runs today against the `chairman-command` function directly (steps 1, 2, 5).

**Separate backlog item (C12):** 31 commands sit in ROUTED. Each needs either a terminal state or a visible reason.

## 7 · Regression test

- **Static:** every string in `dashboard-baseline.json.required_capabilities` (17) must be present in the release under test. `/v1/regression` returns PRESENT / MISSING / UNVERIFIED per capability, and `overall = PASS` only if all 17 are PRESENT.
- **Observation, not counted as evidence:** the repo copy `dashboard-current-head.html` (release `THY-UI-20260823-0925-R5`) contains 10 of the 17 labels. It is **not** the authoritative release. Build 8 on the authoritative repo passed the static regression on 2026-09-17 (C28). The repo copy is stale and should not be used to judge regression either way.
- **Live:** C29 — the operating surface must render on the authoritative production URL. It is BLOCKED on merge and promotion.

## 8 · Dashboard acceptance checklist (usable = all boxes)

- [x] 1 authenticate (C01–C04)
- [ ] 2 restore session: C05 fix written (`api/client.js`), must be adopted in the authoritative dashboard; C06 device witness
- [ ] 3 live read: C07 ✔ DB; C08 browser witness
- [ ] 4 command/write: C09 ✔ C10 ✔; C11 fresh witness; C12 backlog
- [x] 5 continuity boot
- [x] 6 current task/state
- [ ] 7 Every-Word ledger: C15 ✔; C16 needs 0001
- [ ] 8 open lanes: C17, C18 need 0001
- [x] 9 blockers visible
- [x] 10 next actions visible
- [ ] 11 store/sales: C21 ✔; C22 needs 0001; C23 checkout witness BLOCKED
- [x] 12 department work status
- [ ] 13 evidence links: C25 ✔; C26 needs 0001
- [x] 14 audit trail
- [ ] 15 no-regression: C28 ✔; C29 BLOCKED; C30 APPROVAL

## 9 · Exact blockers

| ID | Blocker | Owner | Dependency | Release condition | Next action |
|---|---|---|---|---|---|
| B-C1 | Five RLS-enabled tables have no policy → Chairman reads 0 rows | Database & Infrastructure | Chairman approval to apply a production access-control change | `0001` applied + read-back shows 5 policies + witness shows Chairman > 0, non-Chairman = 0 | Approve; then apply `db/dashboard-cut/0001_chairman_read_policies.sql` (validated: `db/dashboard-cut/validation/run.sh` → VALIDATION PASS) |
| B-C2 | R5 dashboard never refreshes tokens | Front-End Engineering | authoritative repo `thylora-executive-dashboard` is not in this session | refresh on restore and on 401, witnessed on iPad | Port `api/client.js` logic (or supabase-js `autoRefreshToken`, as `thylora-current-head` already does) into the authoritative repo |
| B-C3 | Production alias stale / not promoted | QA + Deployment | Vercel project access and Chairman promotion | C29 PASS on authoritative URL | Merge to `thylora-executive-dashboard` master, promote, re-probe |
| B-C4 | API v1 not deployed; host not chosen | Back-End Engineering | C30 approval | `/v1/health` returns 200 on the chosen host | After approval, implement `/v1` as one edge function `thylora-api-v1` over the mapped sources |
| B-C5 | No real-money checkout witness | Store Operations | `active_allowed=false` is a deliberate hold (THY-DS-CURRENT-STORE-20260910) | one real purchase → payment → entitlement → access witnessed | Stays with Lane D / store lane; not a dashboard blocker |
| B-C6 | Edge functions with `verify_jwt=false` not all inspected | Security & Access | read access to each function's source | each one confirmed to serve only a static shell or public data | `thylora-current-head` inspected today: static shell, data via user JWT, safe. Next: `thylora-dashboard`, `dash`, `dash-view`, `thylora-library`, `thylora-autonomy-worker`, `thylora-submit-sweep`, `chairman-preview`, `thylora-preview`, `thylora-asset-witness`, `public-visual-registry` |

## 10 · Fastest path from here to usable

Ordered by verified-percent gain per unit of Chairman time. The figures come from `projectWith()` in `api/acceptance.js`.

| Step | Who | Chairman time | Moves to |
|---|---|---|---|
| 0 · today | — | — | **56.7%** |
| 1 · approve + apply `0001` (5 read policies) | Chairman approves; any session with backend write applies it, then reads back | ~2 min | **73.3%** |
| 2 · adopt refresh logic in the authoritative dashboard | Front-end session with repo access | 0 | **76.7%** |
| 3 · on iPad: sign in, reload, send one STATUS PING command, open one lane | Chairman | ~5 min | **90.0%** (C06, C08, C11) + C12 backlog review |
| 4 · approve API contract; merge + promote the dashboard | Chairman + deploy session | ~5 min | **96.7%** |
| 5 · first real-money checkout (store lane) | Store lane | — | **100%** |

After step 3, every cut item except 11 (checkout) and 15 (promotion) is fully usable.

---

## Department Return Format

**1 · CURRENT TRUTH:** 56.7% verified (17/30). The database already serves the Chairman 17 of the cut's data sources. Five sources are walled off by missing policies. Session refresh is missing in the R5 dashboard copy. Nothing is deployed from this lane.

**2 · WHAT WAS RECOVERED:**
- 55 `dashboard_status` rows, 42 regression rows
- 40 edge functions (slug, version, `verify_jwt`)
- policies on 17 tables
- the definition of `thylora_is_chairman()`
- the dashboard's data-access functions
- the command history

**3 · WHAT WAS CREATED:**
- `api/thylora-api-v1.openapi.yaml`
- `api/acceptance.js`
- `api/client.js`
- `tests/api.test.mjs` (12 tests)
- `db/dashboard-cut/0001_chairman_read_policies.sql`
- `db/dashboard-cut/validation/{run.sh, stub.sql, witness.sql}`
- this file

**4 · NUMBERS:**
- 30 checks (17 / 6 / 2 / 4 / 1 by state)
- 15 cut items, 7 fully passing
- 20 paths, 21 operations
- migration validated: defect reproduced, fix applied twice idempotently, Chairman 3|2|2|2|2, non-Chairman 0|0|0|0|0

**5 · FILES / IDs:**
- the files above
- backend IDs cited: THY-DS-FRONTEND, THY-DS-THYLORA-API, THY-DS-CHAIRMAN-AUTH, THY-DS-CURRENT-STORE-20260910, OPERATING-SURFACE-001, THY-CONTINUITY-BOOT-002

**6 · STILL UNKNOWN:**
- browser-layer behaviour on the authoritative URL
- why 31 commands remain ROUTED
- the source of 10 no-JWT functions
- whether the authoritative dashboard (Build 8+) already refreshes tokens

**7 · BLOCKERS:** B-C1 … B-C6 above.

**8 · SAFE WORK CONTINUING:**
- the API handler can be written against the contract now
- adapter tests are pure and need no backend

**9 · CHAIRMAN DECISIONS:**
- approve 0001 (production access-control change)
- approve the v1 contract
- the ~5-minute iPad witness session

**10 · NEXT 3 ACTIONS:**
1. Apply 0001 and read it back.
2. Port the refresh logic to the authoritative dashboard.
3. Run the iPad witness: sign in → reload → STATUS PING → open a lane.

**11 · HELP VALUE:** the Chairman can see every lane, blocker and next action in one place. This is what makes departments able to hold work without the conversation.

**12 · EARTH VALUE:** the contract is provider-independent. The same `/v1` can later serve the mobile app and partner integrations.

**13 · MONEY PATH:** `/store/status` puts sales truth in front of the Chairman. The v1.1 checkout, downloads and entitlements are the revenue endpoints.

**14 · MEDIA / STORY PATH:** the "verified %" computation itself is a teachable THYLORA method: evidence-counted progress, not impressions.

**15 · EDUCATION PATH:** the acceptance ledger pattern (state + evidence + dependency) becomes a template for every workroom.

**16 · SOFTWARE PATH:** v1 → v1.1 → mobile app on the same contract.

**17 · STORE PATH:** readiness becomes visible once 0001 lands.

**18 · RISKS:**
- DB-layer PASS is not browser-layer PASS; this is stated per check
- applying policies on production without read-back
- stale repo copies mistaken for the authoritative dashboard

**19 · EVIDENCE:**
- SQL results quoted in §2 and §5
- `node --test tests/api.test.mjs` → 12/12
- `db/dashboard-cut/validation/run.sh` → VALIDATION PASS

**20 · PERCENT COMPLETE:** 17 / 30 acceptance checks = **56.7%**. Lane deliverables (contract, test matrix, write test, regression test, checklist, percent, blockers, fastest path): 8 / 8 written.

## Backend change packet

| Target | Canonical ID | Proposed row / patch | Truth class | Evidence | Blocker | Next action |
|---|---|---|---|---|---|---|
| pg_policies (5 tables) | DASHCUT-0001 | `db/dashboard-cut/0001_chairman_read_policies.sql` | VERIFIED_DEFECT / PROPOSED_FIX | §2 C16–C18, C22, C26 | Chairman approval | apply → read back → witness |
| dashboard_status | THY-DS-THYLORA-API (patch, do not overwrite history) | `next_action` = "Approve api/thylora-api-v1.openapi.yaml (candidate, 21 ops); apply DASHCUT-0001" · `blocker` unchanged until deployment | VERIFIED | this file | none to record | write via Chairman-approved path; read back |
| thylora_dashboard_regression_evidence | CUT-ACCEPT-20260928 (30 rows) | one row per check C01–C30 with `check_state`, `evidence`, `blocker` | VERIFIED (per row level) | `api/acceptance.js` | table not readable by Chairman until 0001 | insert via service role after 0001 |
| thylora_workroom_registry | WR-PROD-FLOOR-001 | title "Production Floor — eight lanes", lane MULTI_LANE, state ACTIVE, `restart_point` = "workrooms/WR-PROD-FLOOR-001/README.md" | VERIFIED | this workroom | columns known (see 00-RECOVERED-STATE) | insert + read back |
