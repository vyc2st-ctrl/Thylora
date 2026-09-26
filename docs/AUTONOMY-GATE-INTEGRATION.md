# Autonomy × Gate Network: integration proposal

**Workroom:** WR-GATE-NETWORK-620
**Target:** `thylora-autonomy-worker` on `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`)
**Status:** PROPOSED. **Nothing was deployed, applied, or changed on the backend.**

---

## 1 · What was inspected (read-only, 2026-09-26)

| Item | Observed |
|---|---|
| Project | `thylora-dash`, ca-central-1, `ACTIVE_HEALTHY`, Postgres 17 |
| Worker | `thylora-autonomy-worker` **v2**, ACTIVE, `verify_jwt: false`, guarded by the `x-thylora-worker-secret` header checked against `thylora_autonomy_credentials` (`CRON_WORKER`) |
| Cron 1 | `thylora_recovery_heartbeat_every_15_minutes`, `*/15 * * * *`, active |
| Cron 2 | `thylora-autonomy-minute`, `* * * * *`, active. Runs `thylora_seed_autonomy_from_ideas(12)` then POSTs to the worker |
| Cron 3 | `thylora-standing-invariants-minute`, `* * * * *`, active. Runs `thylora_enforce_standing_invariants_v1()` |
| Not inspected | Row counts, task-state distribution, column types, the claim and seed function bodies. That read was **denied** this session and was not retried. Those facts are **UNKNOWN**. |

### Worker v2 behaviour, taken from its source

1. Accepts POST only. Rejects the call unless the secret matches an enabled credential.
2. Reads the `thylora_autonomy_runtime` singleton. If it is disabled or the kill switch is set, it returns `HELD` and does nothing.
3. Releases expired leases, then claims up to `max_tasks_per_tick` tasks through `thylora_claim_autonomy_tasks`.
4. For each task, one at a time: inserts a `thylora_autonomy_runs` row, marks the task `WORKING`, and calls Gemini (a flash-lite model if one is listed). The prompt already carries **ACCESS ≠ AUTHORITY** and **UNKNOWN remains UNKNOWN**.
5. Parses the JSON reply. If it lists any blockers or evidence still needed, the task becomes `WAITING_EXTERNAL`; otherwise `COMPLETED`. A task whose class is not `SAFE_INTERNAL` can never reach `COMPLETED`.
6. Tags evidence as `GENERATED_NOT_EXTERNAL_PROOF`.
7. Creates up to 4 follow-up tasks. Their class is allowlisted to `SAFE_INTERNAL` or `EXTERNAL_READ`; anything else becomes `CHAIRMAN_RESERVED` in state `WAITING_CHAIRMAN`.
8. On error, the task goes to `RETRY` with backoff (2–30 minutes) until `max_attempts`, then `FAILED`.

### What v2 already provides toward the four goals

| Goal | v2 today | Gap |
|---|---|---|
| Independent-lane continuation | **Partly.** Each task has its own try/catch, so one failure does not stop the rest of the tick. | There is no lane concept. Follow-ups carry no lane or route, so continuity is lost. If one lane floods the queue, the claim order may starve others (claim function body **UNKNOWN**). |
| Multi-route work | No | Tasks carry no route or gate path. |
| Gate receipts | No | Evidence is a single untyped array. No per-gate decision is recorded. |
| Cross-gate warnings | No | Nothing links one gate's result to the gates connected to it. |

---

## 2 · The smallest additive change

### 2a · Schema: `db/autonomy/proposed/0001_gate_receipts.sql` (not applied)

- Three **nullable** columns on `thylora_autonomy_tasks`: `lane_code`, `route_code`, `gate_path text[]`. `NULL` means a legacy task, which behaves exactly as today.
- One new table, `thylora_gate_receipts`: one row per gate evaluation per route instance, holding the decision, the gap action, G (`NULL` when a factor is UNKNOWN), the factors, and the gates it warned.
- One view, `thylora_open_gate_warnings`: open warnings **scoped to their own route**. A later PASS on the same route and gate closes them.
- Has a rollback block. Changes no function, cron job, or policy.

### 2b · Worker v3 changes (about 40 lines; not deployed)

The change applies **only when `task.gate_path` is not null**. Every existing task keeps the v2 path unchanged.

1. **Bundle the evaluator.** Copy `gates/gate-network.js` into the function as `gate-network.ts`. It is dependency-free and uses the same `evaluateRoute` and `evaluateGate` covered by `tests/gate-network.test.mjs`.
2. **Extend the prompt** for gated tasks. Ask for `gate_measurements: { <GATE>: { E, C, R } }`, where `null` is allowed and means UNKNOWN. **Do not ask the model for A.**
3. **Compute A deterministically** as `AUTONOMY_CLASS_AUTHORITY[task.autonomy_class]`. The model's self-assessment never grants authority. As a result, STORE, PUBLICATION, MONEY and LEGAL always ESCALATE from autonomy.
4. **Read X** from `thylora_open_gate_warnings`, filtered by `route_code = task.route_code` only.
5. **Write one receipt per gate** in the path, with the `run_id` attached.
6. **Map the route decision to task state**, reusing only states v2 already uses:
   - any `ESCALATE` → `WAITING_CHAIRMAN`
   - any `HOLD` → `WAITING_EXTERNAL`, with the blocker set to the held gate and its gap action
   - `PARTIAL` or `PASS` → the existing v2 rule (blockers or evidence → `WAITING_EXTERNAL`, else `COMPLETED`; not `SAFE_INTERNAL` → never `COMPLETED`)
7. **Follow-ups inherit** `lane_code`, `route_code` and `gate_path` from the parent. This is the one line that makes lanes continue independently across generations.
8. **Shadow mode first.** Add `GATE_MODE=shadow|enforce` as a function environment variable (default `shadow`). In shadow mode the worker writes receipts but step 6 does not change task state. Switch to `enforce` only after receipts have been reviewed.

### 2c · Why this is minimal

- No change to the cron, the claim function, the seed function, the credential check, the kill switch, or the retry logic.
- No new provider, secret, or outbound call.
- There is no queue per lane: lane independence comes from **route-scoped receipts and warnings**, not from separate workers. A held Doctor Transmission SCENE receipt has `route_code = DOCTOR-TRANSMISSION-…` and cannot lower X on any other route. The test `a held Doctor Transmission scene does not block the product lanes` proves this.
- **Deferred until evidence shows a need:** a fairness change to `thylora_claim_autonomy_tasks` (round-robin by `lane_code`). The function body has not been read, so this is not proposed blind.

---

## 3 · Rollout: every step requires Chairman instruction

| Step | Action | Witness |
|---|---|---|
| 0 | Read the claim and seed function bodies, column types and RLS (the pre-apply checks in the SQL header) | Query output attached to this workroom |
| 1 | Apply `0001_gate_receipts.sql` | `list_migrations` shows it; the columns exist; a legacy task still ticks through v2 unchanged |
| 2 | Deploy worker v3 with `GATE_MODE=shadow` | One tick with 0 gated tasks returns the same `TICK_COMPLETE` shape as v2 |
| 3 | Insert **one** gated `SAFE_INTERNAL` task, for example `SECOND-GEAR-DETECTIVE` at `OBJECT` | Receipts rows exist for each gate on its path, STORE/PUBLICATION/MONEY/LEGAL read `ESCALATE`, and task state is unchanged (shadow) |
| 4 | Switch to `GATE_MODE=enforce` | The same task moves to `WAITING_CHAIRMAN`, with receipts explaining why |
| Kill | `thylora_autonomy_runtime.kill_switch = true` (existing mechanism) | The worker returns `HELD` |

---

## 4 · Observations for Chairman review (not changed)

- **The worker secret is stored in a table and read inside the cron SQL.** Anyone with SQL read on `thylora_autonomy_credentials` can invoke the worker. Consider Vault, or `verify_jwt: true` with a service-role call. This is an observation only.
- **Every minute, around the clock**, the worker makes one Gemini model-list call plus one generation per claimed task. The model-list call could be cached. Its cost is **UNKNOWN** because billing was not read.
- **Most tasks will end in `WAITING_EXTERNAL`**, because any non-empty `evidence_needed` triggers it, and the prompt invites that. Gate receipts make that state explainable per gate rather than opaque.
