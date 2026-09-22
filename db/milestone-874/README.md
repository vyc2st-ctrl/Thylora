# MILESTONE 874 — the comparison that refuses to be faked

**Work:** `THY-WORK-MILESTONE-874-588`
**Status:** the 588 floor is written and verified against PostgreSQL 16. **Not applied.**
**Sequence 874 has not happened.** At the time of writing the ledger head is 588,
so 286 sequences remain — and not one of them may be written to reach a milestone.

## Two ways this goes wrong, and what stops each

**Manufacturing sequences.** The easy wrong build writes 874 into the ledger now
so the comparison has something to point at. `thy_milestone_record` refuses any
reading whose milestone is not already in `thy_sequence_ledger`
(`MILESTONE_UNRECORDED_SEQUENCE`), and `thy_milestone_compare` returns
`comparable: false` with the distance remaining rather than a comparison.

**Reading "we did not look" as zero.** At 588 no build session can reach the
backend of record, so revenue, orders and live products are not zero — they are
`UNREACHABLE`, with the reason stored beside them. The table enforces it:

- an `UNMEASURED` or `UNREACHABLE` reading **cannot** carry a number
- an unmeasured reading **must** state why
- a `MEASURED` reading **must** carry what was measured

and `thy_milestone_compare` reports a delta **only** where both ends were
measured numbers. Anything else returns `NO DELTA:` with the reason.

## The ten measures

`ELAPSED_TIME` · `REVENUE` · `LIVE_PRODUCTS` · `ORDERS` · `CONVERSION` ·
`SOCIAL` · `DASHBOARD_APP` · `WORLD_WINDOWS` · `GATE_HEALTH` · `CANON_CHANGES`

## The 588 floor as recorded

| Measure | State at 588 |
|---|---|
| Elapsed time | MEASURED — zero against itself |
| Revenue | UNREACHABLE — backend egress denied |
| Live products | UNREACHABLE — backend egress denied |
| Orders | UNREACHABLE — backend egress denied |
| Conversion | UNMEASURED — both inputs unmeasured |
| Social | UNMEASURED — no platform queried |
| Dashboard and app | MEASURED — 8 surfaces in source; live state **not claimed** |
| World Windows | MEASURED — 3 |
| Gate health | MEASURED — counted from `thy_gate_law` at apply time |
| Canon changes | MEASURED — counted from `thy_omniview_statements` at apply time |

The four counted measures are **counted when the seed applies**, not typed in, so
the floor cannot drift away from the thing it claims to measure.

## Apply order

| File | Contents |
|---|---|
| `0001_milestone_floor.sql` | The ten measures, the readings table, the sequence guard |
| `0002_compare.sql` | `thy_milestone_readback`, `thy_milestone_compare` |
| `0003_seed_floor_588.sql` | The 588 floor; a no-op unless 588 is in the ledger |
| `0004_rls_policies.sql` | Signed-in sessions read; only the service role writes; nothing updates or deletes |

Depends on `db/omniview/` (the ledger) and reads `db/gate-law/` when present.
Both dependencies are guarded with `to_regclass` and reported when absent.

## Verify

```
sudo service postgresql start
db/milestone-874/validation/run.sh    # exit 0
```

`proof_milestone.sql` appends sequence 874 **inside a transaction that is rolled
back** — the only honest way to test a future milestone — and proves the
comparison refuses beforehand, refuses a sequence chained to a gap, and afterwards
reports deltas for exactly the measures that were measured at both ends.
