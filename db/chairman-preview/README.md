# Chairman preview approval — THY-WORK-PREVIEW-WITNESS-NOW-537

Applied to `jvsdxhrfhtlgaknhjxlz` (thylora-dash) on 2026-09-19. These files are
the record of what was applied; the live backend is the authority.

## Why this exists

For several prompts the four ready products were reported as "awaiting Chairman
preview". They were not awaiting a decision. `thylora_preview_token_mint_v1()`
is `SECURITY DEFINER` with `search_path` pinned to `public`, and
`gen_random_bytes()` belongs to pgcrypto in the `extensions` schema, so every
Chairman mint raised `42883: function gen_random_bytes(integer) does not exist`
before a token row could be written. The zero rows in
`thylora_chairman_preview_tokens` were the symptom of a broken mint, not proof
that the Chairman had never looked.

## Files

| File | What it does |
| --- | --- |
| `0001_preview_decisions_table.sql` | `thylora_chairman_preview_decisions`: append-only RELEASE / REVISE / HOLD record, RLS on, Chairman read only, written solely by the SECURITY DEFINER RPC. A separate table because the existing review-decision domain is APPROVE / REQUEST_CHANGES / REJECT and HOLD is none of those. |
| `0002_approval_screen_rpc.sql` | `thylora_chairman_approval_screen_v1()`: the one authenticated read behind the approval screen. Recomputes each page count from the stored PDF bytes on every call. |
| `0003_preview_decision_rpc.sql` | `thylora_chairman_preview_decision_v1()`: records the decision. RELEASE queues Shopify activation; REVISE and HOLD withhold it. Never calls Shopify itself. |
| `0004_mint_gen_random_bytes_fix.sql` | The root-cause repair: schema-qualify `extensions.gen_random_bytes`. |

## Verification performed

Rehearsed as the Chairman inside a transaction that was rolled back:

- all four packets mint a 64-hex token matching the edge function's `^[0-9a-f]{64}$`
- the service-role redeem returns real bytes for all four
- the recomputed sha256 equals the stored `content_sha256` for all four
- every file carries a `%PDF-1.4` header

| Packet | Bytes | Pages counted in the file |
| --- | --- | --- |
| PKT-BRAMBLE-001 | 26,310 | 3 |
| PKT-CITYPOWER-001 | 6,081 | 6 |
| PKT-LASTMATCH-001 | 5,954 | 6 |
| PKT-HANDOFF-001 | 6,147 | 6 |

The `chairman-preview` endpoint answers an unauthenticated request with its own
HTTP 400, not a 401, so the tokenised URL carries no Authorization requirement.

Nothing was committed by the rehearsals: zero decisions, zero tokens, zero
activation tasks, and all four packets remain `EXPOSED_AWAITING_CHAIRMAN`.

## Open defect, reported rather than repaired

`thylora_name_guard_block()` validates every text and jsonb column of the NEW
row on any write, not only the columns that changed. A row whose preserved
historical evidence carries the legacy planet spelling is therefore frozen
against all updates, including a Chairman release decision. One such block was
observed live during this run and had cleared when re-tested. Comparing OLD
against NEW per column would keep the lock against new drift without freezing
preserved history, but that changes a Chairman-locked guard and is his call.
