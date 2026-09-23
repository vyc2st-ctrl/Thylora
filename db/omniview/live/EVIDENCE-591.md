# OMNIVIEW live apply — sequence 591

Work: `THY-WORK-OMNIVIEW-LIVE-APPLY-591` · Backend: `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`) · Carryforward head at apply: 591 (592 arrived mid-work; read; no instruction for this work beyond "do not claim deployed").

| State | Status |
|---|---|
| LOCAL TESTED | yes: 7/7 migrations idempotent on PostgreSQL 16, 25/25 expect-reject, 4/4 proofs, 111/111 repository tests |
| LIVE APPLIED | **yes**: 12 migrations on thylora-dash, 27/27 expect-reject live, 6/6 topic proofs live |
| LIVE UI WITNESSED | **no**: needs merge into `vyc2st-ctrl/thylora-executive-dashboard`, deploy on `thylora-public-world`, and a Chairman sign-in on the phone |

## Conflicts corrected before apply

1. **Read policy.** The reviewed pack let any signed-in account read the ledger (`auth.uid() is not null`). Carryforward on the live backend is Chairman-only (`thylora_is_chairman()`). OMNIVIEW now uses the same rule.
2. **Carryforward bridge.** `thy_sequence_prior_context` was `SECURITY DEFINER` and granted to all signed-in accounts, so it would have bypassed carryforward RLS and returned raw messages to any account. It is now `SECURITY INVOKER`. Proven live: a non-Chairman session gets 0 rows.
3. **Sequence collision.** The seed wrote ledger 588 as "the OMNIVIEW build", but carryforward 588 is `TRANSFER-GATES-ALISTAIR-LIFEFIRST`. The build happened inside the 587 window (commit 14:05Z; carryforward 587 at 13:35Z, 588 at 17:39Z), so it is recorded as 587.
4. **QYRIS definition.** The seed stated "QYRIS-1 is the visible read trace" as QYRIS canon. Live QYRIS is `Question → Yield → Reason → Inspect → Safeguard` (`THY-QYRIS-PLAIN-SPEECH-001`, `LAW-QYRIS-ALL-WORK-001`). The trace is now recorded as OMNIVIEW evidence, not a definition of QYRIS.
5. **ECONOMY link.** The seed linked `rael_revenue_ledger` as ACTIVE, but that table does not exist on thylora-dash (the RAE Link migrations are unapplied). It is now marked BLOCKED as a repository definition.
6. **Timezone.** LOCAL DATE/TIME uses `America/New_York`, the `earth_anchor_timezone` on `thylora_timestamp_punch_gate`.

## Correction found after apply (by readback)

The 0008 QYRIS evidence said "159 checks". Readback found 158, and two PASS rows for this work: one written with carryforward 591 at 14:58:41Z, one pre-execution at 17:27:49Z. 0009 superseded the statement; the original stays readable as history (statement 24 → 26).

## Before / after (live)

| | Before 17:27:58Z | After 17:41:31Z | Δ |
|---|---|---|---|
| public tables | 897 | 905 | +8 (thy_*) |
| RLS policies | 704 | 712 | +8 (thy_* read) |
| migrations | 461 | 471 | +10 (omniview_0001–0010), later +2 (0011, 0012) |
| graph nodes / edges / versions | 79 / 189 / 253 | 82 / 193 / 260 | +3 / +4 / +7 |
| QYRIS work-item checks | 157 (+1 at 17:27:49 = 158) | 158 | +1 |
| carryforward | 591 rows, head 592 | 591 rows, head 592 | 0 (read only) |
| OMNIVIEW | absent | head 591, 13 topics, 2 sequences | new |

Security advisors after apply: 0 findings reference any thy_omniview / thy_sequence object.

## Mobile witness (replayed live data)

`witness/mobile-witness.mjs` loads the real `dashboard-current-head.html` and `app/index.html` at iPhone 13 size in Chromium. It answers the OMNIVIEW RPCs from `witness/live-readback-591.json`, which was read from thylora-dash by the same functions. **54/54 pass** (`witness/mobile-witness-results.json`, screenshots in `witness/shots/`). The same checks against the reviewed surface fail 16/54: it was covered by floating launchers, its content overflowed up to 2,392 px, and it showed an empty board to a non-Chairman. This is **not** an authenticated live session: the container cannot reach the Supabase REST host (proxy 403).

## Rollback

The pack is additive. Nothing existing was altered.

**OMNIVIEW objects.** Export the ledger first (`select * from thy_sequence_ledger order by sequence_no;`), then run the drop list in `db/omniview/APPLY.md`. That removes only thy_* objects.

**Rows written outside thy_*.** Removing these deletes from protected registries, so it is a Chairman decision:

```sql
delete from thylora_graph_versions where entity_id in ('THY-OMNIVIEW-READ-MODEL-001','THY-SEQUENCE-LEDGER-001','EVID-OMNIVIEW-LIVE-APPLY-591',
  'E-591-OMNIVIEW-EVIDENCED','E-591-LEDGER-EVIDENCED','E-591-LEDGER-PART-OF-OMNIVIEW','E-591-OMNIVIEW-PART-OF-CONTROL-SURFACE');
delete from thylora_graph_edges where edge_id like 'E-591-%';
delete from thylora_graph_nodes where node_id in ('THY-OMNIVIEW-READ-MODEL-001','THY-SEQUENCE-LEDGER-001','EVID-OMNIVIEW-LIVE-APPLY-591');
delete from thylora_qyris_work_item_checks where id = 'de1f1064-5e2c-4bc9-b2ce-b2482721b3cb';
```

**Platform recovery point.** Supabase's own backups of thylora-dash. PITR availability was not verified from this session.
