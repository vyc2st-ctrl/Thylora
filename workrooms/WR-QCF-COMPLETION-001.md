# WR-QCF-COMPLETION-001 — PENDING_RESPONSE_PAYLOAD completion defect

Backend: `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`)
Reported by: carryforward #460 (`THY-Q-20260918-HERB-FILE-001-460`)
Date: 2026-09-18
Status: repaired, tested in rollback, applied, read back

## BEFORE

`public.thylora_query_carryforward` held 463 rows:

- 268 completed (real response payload)
- 188 with `assistant_message IS NULL`
- 7 holding the literal placeholder `PENDING_RESPONSE_PAYLOAD`
  (#453, #455, #456, #458, #459, #462, #463)

#460 reported six placeholder rows; #460 itself was completed by direct update
in that run, and #462/#463 were captured afterwards, which is why the count is
now seven.

## DEFECT

Confirmed, exactly as #460 reported, and worse in one respect.

`thylora_complete_query_pair` guarded every written column with
`case when t.assistant_message is null then <new> else <old> end`, while
`thylora_capture_query_pair` stores the literal placeholder
`PENDING_RESPONSE_PAYLOAD`, which is not null.

For a placeholder row:

1. every `case` branch selected the existing value, so nothing was written;
2. the `UPDATE` still matched the row, so `if not found then raise` never fired;
3. the function returned its normal success row.

So completion was not merely a no-op — it was a **silent** no-op that reported
success. That is why seven runs' response payloads were lost without any run
seeing an error.

Scope checked and ruled out: the only other function touching this column is
`thylora_capture_query_pair` (insert path, correct). The three triggers on the
table are audit/backlink only — `thylora_capture_before_destructive_change`
writes a snapshot to `thylora_continuity_audit_shadow` and blocks nothing.
`query_id` is `UNIQUE`, so completion targets exactly one row.

## FIX

`db/thylora-dash/0001_fix_complete_query_pair_pending_payload.sql`

- A row is incomplete when `assistant_message IS NULL`
  **OR** `assistant_message = 'PENDING_RESPONSE_PAYLOAD'`. Both now complete.
- `assistant_message_hash` is recomputed as `sha256` of the written payload.
- `message_hash` falls back to the stored value when the caller omits it,
  instead of violating the `NOT NULL`.
- A completed historical message is never overwritten. That case now raises
  `ASSISTANT_MESSAGE_ALREADY_COMPLETE` rather than silently succeeding — the
  silent success is the mechanism that hid this defect for seven runs.
- Replaying the identical payload stays idempotent and merges metadata only.
- `NULL`, blank, or the placeholder offered *as* a completion payload now raise
  `ASSISTANT_MESSAGE_PAYLOAD_REQUIRED`, so the placeholder cannot re-enter
  through the completion path.
- Unchanged: name, argument list, return type, `SECURITY DEFINER`,
  `search_path`, and grants (`postgres`, `service_role`).

## TEST (rollback first)

One transaction, all twelve checks green, then `ROLLBACK`:

| # | Check | Result |
| --- | --- | --- |
| T0 | control: **old** fn on stranded #463 | defect reproduced — no error, nothing written |
| T1 | complete a `PENDING_RESPONSE_PAYLOAD` row | payload written |
| T2 | complete an `assistant_message IS NULL` row | payload written |
| T3 | complete real stranded row #463 | payload written |
| T4 | `assistant_message_hash` recomputed | matches `sha256(payload)` |
| T5 | idempotent replay, same payload | no error, message unchanged |
| T6 | overwrite attempt on completed #461 | raises `ASSISTANT_MESSAGE_ALREADY_COMPLETE` |
| T7 | #461 verbatim message + hash | byte-identical |
| T8 | placeholder offered as payload | raises `ASSISTANT_MESSAGE_PAYLOAD_REQUIRED` |
| T9 | null payload | raises `ASSISTANT_MESSAGE_PAYLOAD_REQUIRED` |
| T10 | unknown `query_id` | raises `QUERY_ID_NOT_FOUND` |
| T11 | all 462 untargeted rows | fingerprint identical |

Post-rollback verification before applying anything: 463 rows, 188 null, 7
placeholder, 0 test fixtures leaked, #463 still holding the placeholder, fix not
installed. The rollback was clean.

## AFTER / READBACK

Applied as Supabase migration
`fix_complete_query_pair_pending_response_payload`.

Read back from the live backend:

- signature `thylora_complete_query_pair(text,text,text,jsonb,jsonb)` — unchanged
- return type unchanged, `SECURITY DEFINER` true, ACL `{postgres=X, service_role=X}` — unchanged
- placeholder-aware body confirmed present
- data unchanged by the repair: 463 rows / 188 null / 7 placeholder / 268 completed
- #460 and #461 payloads intact; #463 still holds its placeholder

Live proof against the installed function, inside `begin; ... rollback;`:
#463 completes; #461 refuses overwrite with `ASSISTANT_MESSAGE_ALREADY_COMPLETE`.

## NOT DONE — deliberately

The seven stranded rows were **not** filled in. The repair makes them
completable; it does not invent their payloads. Those belong to the runs that
produced them, and #460 recorded that the other rows were left untouched. No
historical message was altered. No unrelated carryforward row was rewritten.

## ROLLBACK PATH

`db/thylora-dash/0001_fix_complete_query_pair_pending_payload.rollback.sql`
restores the pre-repair definition byte-for-byte. Pure function replacement — no
table, row, grant, policy or trigger is touched. Reinstating it restores the
defect, and it cannot undo rows completed while the repair was live.
