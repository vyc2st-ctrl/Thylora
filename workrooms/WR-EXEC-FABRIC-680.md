# WR-EXEC-FABRIC-680 — Execution Fabric (custody 680, rebased on 684)

Mirror of backend `thylora_workroom_registry` (`WR-EXEC-FABRIC-680`). **The backend is the source of truth.**
Policies: THY-POLICY-EXECUTION-FABRIC-680 and THY-POLICY-BLOCKAGE-TAXONOMY-680, both LOCKED. Math: MATH-EXECUTION-FABRIC-680, PROPOSED, with its display row.

## States
**CAPTURED → ASSIGNED → EXECUTING → EVIDENCED → VERIFIED**, or **BLOCKED**.

- A state comes from what actually happened: the executor class, the run start, the heartbeat, the artifact and the verifier. A label alone does not set it.
- Labels such as `EXECUTION_ACTIVE` do not mean EXECUTING.
- Executor classes:
  - `SOFTWARE_AGENT_SESSION`: Claude or ChatGPT threads, only while the Chairman runs them.
  - `SOFTWARE_AGENT_AUTONOMOUS`: the scheduled worker.
  - `HUMAN_EARTH`: the Chairman.
  - `SIMULATED_WORLD`: EdereAirah personnel. Story activity only; this class never executes Earth work.
  - `NONE`.

## Blockage layers (never report one of these as "backend unavailable")
| Layer | 2026-10-07 status |
|---|---|
| BACKEND_AVAILABILITY | **UP**: every read and write succeeded; cron and net.http 200s |
| CLIENT_TRANSPORT (MCP) | **INTERMITTENT**: some request bodies hang; base64 transfer works |
| REPOSITORY_SECRETS | **MISSING**: THYLORA_SUPABASE_URL/KEY not set in GitHub Actions |
| QUERY_PERMISSION_SAFETY | Not observed for Claude this turn |
| RLS | **Silent-empty risk**: 283 of 919 tables have RLS on but no policy |
| AUTHENTICATION | **PARTIAL** |
| WORKER_RUNTIME | **DEAD LOOP**: last success 2026-10-02; 3 orphan runs |
| MODEL_PROVIDER | Degraded in the past (24 × 503) |
| WORKER_LOGIC | **Misclassifies**: generated text counted as progress |

## System truth snapshot (2026-10-07 14:46Z)
- Autonomy tasks: 393 BLOCKED, 5 evidenced by text only (not verified), 1 captured but unclaimable.
- Workroom tasks: 173 total, 48 labelled ACTIVE, 32 moved in the last 7 days.
- Movement rows in the last 7 days: 44, of which 1 passed verification.
- Execution registry: 147 rows, 0 verified.
- Personnel: 132 total. 125 in-world, 7 Earth invitations, 0 software executors.

## Lanes (backend `thylora_execution_work_registry` FAB680-*, each with a QYRIS row)
| Code | Lane | Fabric | Blocker | Next |
|---|---|---|---|---|
| 01 | **MunzyMuur** canonical name + transcript-name lock (custody 681) | ASSIGNED | Override list not built | Lock row + override list; earlier spellings marked SUPERSEDED |
| 02 | Contributor quality / rights / reuse / royalty lifecycle | ASSIGNED | LEGAL (royalty terms) | Lifecycle record as held DDL |
| 03 | VYC BURST shorthand intake | ASSIGNED | ENGINEERING | RAW_BURST record, tested on custody 637 |
| 04 | Understanding before memorization (reuses the Understanding Engine) | ASSIGNED | MISSING_INPUT | Map one UE concept |
| 05 | Glass hydration vessel | ASSIGNED | MISSING_INPUT (standards) | Food-contact standards list |
| 06 | Food provenance / safety (new lane, not a duplicate) | CAPTURED | No executor | Assign; trace one recipe |
| 07 | Biology / medical evidence | ASSIGNED | MISSING_INPUT | First question + citations |
| 08 | Contributor relationship continuation: **the relationship belongs to the Chairman's son, not the Chairman** (custody 681) | ASSIGNED | AUTHORITY; IDENTITY | Timeline record; nothing sent |
| 09 | Store sprint (`EXP679-STORE10` labelled active; fabric says ASSIGNED) | ASSIGNED | MISSING_INPUT (files) | Hash one delivery file |
| 10 | Cross-thread handoff THY-HANDOFF-680-CLAUDE-TO-CHATGPT-FABRIC | **EVIDENCED** | VERIFIED waits on the receiving thread | ChatGPT marks it RECEIVED |

## Rebase record
- Heads moved 680 → 684 while this turn was writing.
- Read 681: a Chairman correction. Applied it to FAB680-01 and FAB680-08.
- Read 682–684: thread closeouts, no conflict.
- **GAP-680-08:** the ledger has no rows for 681 or 682. Preserved, not backfilled.
- **GAP-680-09:** custody 681 requires in-world workers to show continuous movement evidence. Fabric 680 rules that world personnel never execute Earth work.
  - Compatible reading: world movement is recorded as WORLD activity, with the real Earth executor named separately.
  - This reading is flagged for the Chairman to lock.

## Held in repo
- `db/execution-fabric-680/0001_execution_fabric.sql`: additive columns, transition rules, a stale-heartbeat sweep and the truth view.
  - Validated locally: it reapplies cleanly.
  - It rejects: world personnel as executor, EXECUTING without a heartbeat, EVIDENCED without an artifact, self-verification, and an untyped blocker.
  - It sweeps stale heartbeats and flags overstated labels.
- `db/execution-fabric-680/WORKER_FIX.md`: 7 worker changes, not deployed.
