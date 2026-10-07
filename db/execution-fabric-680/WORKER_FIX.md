# Autonomy worker fix — spec (HELD, not deployed)

Edge function `thylora-autonomy-worker` was read, not changed. Deploying a function is a
held Chairman action. This is the change list that turns its dead loop into a real executor
(class `SOFTWARE_AGENT_AUTONOMOUS`) under the Execution Fabric.

| # | Fault seen on 2026-10-07 (gap) | Change |
|---|---|---|
| 1 | Ticks every minute but last success was 2026-10-02 (GAP-680-01) | `last_success_at` advances only when a run writes an artifact (ref + SHA-256). Writing `WAITING_EXTERNAL` stops counting as a success. |
| 2 | Model text stored as evidence (`GENERATED_NOT_EXTERNAL_PROOF`) (GAP-680-06) | Store model output as `DRAFT_TEXT`. It can move an item to EVIDENCED only after a second step writes it somewhere openable (row or file) and hashes it. |
| 3 | Any blocker the model lists becomes `WAITING_EXTERNAL` | Map each blocker to a taxonomy layer (`MISSING_INPUT`, `MISSING_AUTHORITY`, `MODEL_PROVIDER`, …) and set BLOCKED with that layer and reason. |
| 4 | The only QUEUED task is `EXTERNAL_WRITE`, which the claim filter never picks | Route `EXTERNAL_WRITE` straight to BLOCKED / `MISSING_AUTHORITY`, cleared by the Chairman. Never leave it QUEUED. |
| 5 | 3 runs RUNNING since 08-29, 09-24 and 09-28 (GAP-680-02) | Lease-expire *runs* as well as tasks: a run older than its lease becomes `ABANDONED` with the reason recorded. |
| 6 | Gemini 503s and malformed JSON | Retry policy: 3 attempts, backoff 2→6→18 min, then BLOCKED / `MODEL_PROVIDER`. A JSON parse failure counts as one attempt. |
| 7 | Recovery heartbeat made 5,963 rows; 9 created jobs (GAP-680-07) | Log only when the heartbeat changes something. Wire `thylora_fabric_block_stale_heartbeats()` into the existing job 3 instead of adding a new job. |

**Acceptance:**
- One seeded SAFE_INTERNAL task goes CAPTURED → EXECUTING → EVIDENCED with an artifact hash.
- A different verifier reads it back.
- `last_success_at` moves only then.
- Orphan runs drop to 0.
