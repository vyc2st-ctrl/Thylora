# WR-PQR-001 · Public Question Radar

**Lane:** Current-interest listening · public question detection · evidence checking · original output routing
**Backend of record:** `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`) — **reached and written this session**
**Source repository:** `vyc2st-ctrl/Thylora`, branch `claude/listening-system-spec-12c7nt`
**Opened:** 2026-09-18

---

## 1 · Authority position

- `DASHBOARD_AUTHORITY.md` — this repository is **not** the deployment authority
  for the Chairman dashboard. Nothing in this delta touches
  `dashboard-current-head.html`, `dashboard-baseline.json` or
  `DASHBOARD_AUTHORITY.md`.
- PQR is a **backend intelligence system**, not a dashboard, not a surface, not
  a second product catalogue and not a second identity system.
- No existing table was dropped, renamed, altered or rewritten. No baseline
  capability was removed, renamed or disconnected. Every object is new and
  prefixed `thylora_pqr_`.
- **Note against WR-RAELINK-001 blocker B1:** that workroom recorded the backend
  host as unreachable (403 on CONNECT) from the build session of 2026-09-11. In
  **this** session the backend was reachable through the Supabase MCP server,
  the live schema was read (738 public tables), and all three migrations were
  applied and verified. B1 was a session-scoped egress condition, not a standing
  one. RAE Link's own migrations remain unapplied and still held for Chairman
  execution — that is B2 there, and this delta does not touch it.

---

## 2 · Execution delta

### Added — backend, **applied and verified**

`db/pqr/` — 11 tables, 4 functions, 1 trigger, 11 RLS policies, 3 migrations.

| File | Applied as |
|---|---|
| `0001_pqr_core.sql` | `pqr_public_question_radar_core_v1` |
| `0002_pqr_rls_functions.sql` | `pqr_public_question_radar_rls_functions_v1` |
| `0003_first_candidate_board.sql` | `pqr_first_candidate_board_20260918_v1` |

Pipeline, one table per stage: signal → cluster → evidence check → gap → score
→ opportunity → originality gate → board.

### Added — documentation

`docs/PQR-ARCHITECTURE.md`, `db/pqr/README.md`, this workroom.

### Added — validation

`db/pqr/validation/behaviour.sql` — 7 assertions, run against the live backend.

### Not touched

`dashboard-current-head.html`, `dashboard-baseline.json`, `DASHBOARD_AUTHORITY.md`,
`.github/`, `app/`, `public-site/`, `rae-link/`, `db/rae-link/`, `tests/`,
`vercel.json`, `package.json`.

---

## 3 · Evidence

| Claim | Evidence |
|---|---|
| Backend reached | 738 public tables read from `thylora-dash`; live Postgres 17.6 |
| Migrations applied | 3 of 3 returned success; visible in the migration list |
| Structure | 11 tables, 4 functions, 1 trigger created |
| RLS coverage | 11 of 11 with RLS on, 11 policies, `rls_off = 0` |
| `anon` cannot read | `has_table_privilege('anon','thylora_pqr_board_rows','SELECT')` → `false` |
| Security advisors | **0** PQR-related findings |
| Virality cannot score | Insert with `virality_excluded = false` rejected by check constraint |
| No evidence means no score | R,Q,U,P all 5 with E = 0 → `opportunity_score = 0`, band `DEAD` |
| High confidence needs a primary source | Insert with `confidence = HIGH`, `primary_source_found = false` rejected |
| Uncredited lift refused | Non-paraphrased signal with no attribution rejected |
| No publish state exists | `update ... set state = 'PUBLISHED'` rejected by check constraint |
| Gate reports everything at once | An empty originality evaluation returns **4** blockers, each with a route |
| Publishing held even when clear | `thylora_pqr_release_gate_v1('PQR-O-0004')` returns exactly one blocker: `NO_PUBLISH_IN_V1` |
| Derived numbers are not typed | `opportunity_score` and `score_band` are generated columns |
| Recurrence is computed | `thylora_pqr_recount_cluster_v1` recounted 5 / 5 / 4 signals from linked rows |
| Behaviour suite | `db/pqr/validation/behaviour.sql` → **7 PASS, 0 FAIL** on the live backend |
| First board | `PQR-BOARD-20260918`, 3 rows, 14 signals, 17 sources, 5 evidence checks, 4 gaps, 9 opportunities, 9 originality gates all PASS |

### Not measured, and not claimed

Signal volume, true recurrence rates, audience size, conversion, revenue and
build cost. None were measurable this session. Recurrence is recorded as
`OBSERVED_SAMPLE` and every score as `basis_class = OBSERVED`, never `MEASURED`.

---

## 4 · What the first board actually found

Two evidence findings came out of the sweep. Both are more valuable than the
three subjects that produced them, and both are the system working as designed.

**1 · A decade-old number is circulating as current.**
The "more than 60 per cent of parents struggle with homework" figure is the
National Center for Families Learning reading of **60.1 per cent, from the 2014
survey** (against 49.1 per cent in 2013). It is still being presented in 2026 as
a present-day measurement, most often by businesses that sell tutoring. No
post-2020 replication was located. Recorded as `STALE_RECIRCULATED`.

**2 · A widely quoted statistic is roughly double its own source.**
The claim that "85 per cent of parents rate their school communication poorly"
does not match the primary survey it is drawn from. That survey — Cornerstone
Communications with Edsby, April 2025 — reports **42 per cent** of parents
rating app satisfaction at 5 out of 10 or lower. No source supporting 85 per
cent was located. The inflated figure is published by companies selling
communication-consolidation software. The primary survey is itself
vendor-sponsored with roughly 275 respondents, so neither number is a
population estimate. Recorded as `MISREPORTED`.

The second finding is `PQR-O-0004`, *Who Profits From the Noise*, the
highest-evidence item on the board. It clears originality, evidence and
scoring, and is held by exactly one blocker: this workstream does not publish.

### Board summary

| # | Cluster | O = R×Q×E×U×P | Band |
|---|---|---|---|
| 1 | Confusing mathematics homework / word problems | 5×4×3×5×4 = **1200** | BUILD |
| 3 | Parents explaining concepts to children | 5×5×2×5×4 = **1000** | BUILD |
| 2 | School communication / app overload | 4×4×3×5×3 = **720** | BUILD |

The ordering is itself a result. Cluster 3 carries the **best question on the
board** (Q = 5) and still ranks second, because `E = 2`: abundant advice, almost
no evidence. A sum would have floated it to the top. The product does not, and
the board says exactly why.

---

## 5 · Unresolved blockers

### B1 · Collection is manual — **OPEN**
Eight source lanes collected by hand on 2026-09-18. Nine lanes named in the
directive — search trends, public social, creator comment patterns, direct
parent and teacher questions, consumer complaints, science/history curiosity,
sports and business — are registered with `collection_state = 'DECLARED'` and
have produced no signals. Recurrence is real but not counted.

### B2 · No automated collector — **OPEN**
Signals arrive only when someone runs a sweep. A scheduled collector is the
single highest-value next build, and it is what converts `OBSERVED_SAMPLE` into
`MEASURED_FEED`.

### B3 · Publishing held — **BY RULE**
No published state exists and the release gate always returns
`NO_PUBLISH_IN_V1`. Opening a publish path needs a Chairman decision **and** a
later migration. It cannot be done by editing a row.

### B4 · Scores are recorded judgement — **OPEN**
Every factor carries a written basis, but no factor is measured. Disagreement
should land on the basis text, not the number.

---

## 6 · QYRIS gap report

| # | Inspection | Gap found | Disposition |
|---|---|---|---|
| 1 | Missing prerequisite | An opportunity routed with no evidence check behind it | **Routed** — release gate blocks on `NO_EVIDENCE_CHECK` |
| 1b | Missing prerequisite | Blockers learned one per round trip | **Routed** — both gates return every blocker in one call |
| 2 | Hidden handoff | Recurrence counts typed by hand and drifting from the signals | **Routed** — `thylora_pqr_recount_cluster_v1` derives them from linked rows |
| 2b | Hidden handoff | A score edited without its reasoning | **Routed** — five `*_basis` columns, all `not null` |
| 3 | Authority mismatch | Internal intelligence readable by the public | **Routed** — RLS on all 11, `anon` revoked, chairman-only policies |
| 3b | Authority mismatch | A writer asserting their own originality verdict | **Routed** — verdict computed by trigger, writer input ignored |
| 4 | Evidence gap | A claim repeated without its date | **Routed** — `source_date`, `evidence_state = STALE_RECIRCULATED`, and the first board demonstrates the catch |
| 4b | Evidence gap | Confidence asserted with no primary source | **Routed** — `check (confidence <> 'HIGH' or primary_source_found)` |
| 4c | Evidence gap | A board read as measured when it was observed | **Routed** — `evidence_posture` is `not null` on every board |
| 5 | Unnecessary waiting | Nothing usable until a collector exists | **Routed** — the manual path is complete and produced a real board today |
| 6 | Creator/customer friction | A creator's work restated as ours | **Routed** — paraphrase by default, attribution constraints, `originality_basis` `not null`, four-check gate |
| 7 | Rights/privacy risk | Personal data captured from public discussion | **Routed** — no person, account, handle or identifier column exists on a signal |
| 7b | Rights/privacy risk | A vendor's marketing treated as evidence | **Routed** — `VENDOR_CONTENT` source class and `commercial_interest` on every source and every check; the first board shows it working |
| 8 | Monetization opportunity | Detection with no route to a product | **Routed** — six output classes, soft-referenced to existing registries |
| 9 | Failure/recovery | A loud, unverifiable question outranking a quiet, evidenced one | **Routed** — multiplicative scoring; `E = 0` forces `O = 0`; `check (virality_excluded)` |
| 9b | Failure/recovery | Publishing by accident | **Routed** — no published state in the domain, plus a standing gate blocker |

**16 inspected · 16 routed · 0 unrouted.** The four items in §5 are blockers
against missing authority or unbuilt collection, not unrouted gaps.

---

## 7 · Restart vector

1. **Read first:** `DASHBOARD_AUTHORITY.md`, `docs/PQR-ARCHITECTURE.md`, this file.
2. **Verify the floor:** run `db/pqr/validation/behaviour.sql` → expect 7 PASS,
   0 FAIL. Then `thylora_pqr_board_v1('PQR-BOARD-20260918')` → expect 3 rows.
3. **Next executable action**, needing no authority this build lacked:
   build a collector for one declared source lane — search trends first — and
   convert `PQR-C-0001` from `OBSERVED_SAMPLE` to `MEASURED_FEED`.
4. **Then:** widen beyond the three seed subjects into the declared lanes
   (science/history curiosity, sports, business, consumer complaints).
5. **Then:** wire `thylora_pqr_board_v1` into a Chairman dashboard panel.
6. **Do not:** publish anything, open a published state without a Chairman
   decision, score a factor without writing its basis, or record a creator's
   wording as a signal.

---

## 8 · State

| | |
|---|---|
| Workroom | **OPEN** (registered as `WR-PQR-001` in `thylora_workroom_registry`) |
| Schema | Written · **applied to the live backend** · verified |
| Behaviour validation | **7 / 7 PASS** on the live backend |
| RLS | 11 / 11 tables, 11 policies, `anon` revoked, 0 advisor findings |
| First board | `PQR-BOARD-20260918` · 3 clusters · 14 signals · 9 opportunities |
| Collection | Manual. 8 lanes active, 9 declared and not yet collected (B1, B2) |
| Publishing | **Held by rule and by schema** (B3) |
| Baseline regression | **None.** No existing object altered. |

NO LOSS. DO NOT GO BACKWARD. ONE SOURCE OF TRUTH. ACCESS ≠ AUTHORITY.
NEVER TREAT VIRALITY AS TRUTH. WE DO NOT COPY CREATORS.
