# Visual quality gate migrations

Work code: `THY-WORK-VISUAL-STANDARD-RECOVERY-545`
Gate code: `THY-VISUAL-QUALITY-GATE-001`
Backend of record: `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`)
Workroom: `workrooms/WR-VISUAL-STANDARD-545.md`

| File | Contents |
|---|---|
| `0001_visual_standard_registry.sql` | Recovered exemplars, the 17 recovered visual rules, the open name-guard conflict |
| `0002_visual_quality_gate.sql` | Page plan, authorship, product visual record, append-only gate checks, the gate function, fail-closed preview admission, Bramble binding |

## Status

**Written · validated on PostgreSQL 16 · idempotent · NOT applied to the live backend.**

Applying DDL to production is a held Chairman action. The egress proxy denied
`CONNECT jvsdxhrfhtlgaknhjxlz.supabase.co:443` from this session (same denial
recorded as blocker B1 in `WR-RAELINK-001`), so the live schema could not be read
and nothing was applied.

## What it does not create

No second product truth, no second approval system, no second preview surface and
no second visual framework. `visual_preflight_passed` already exists in
`get_thylora_release_review_candidates_v1()`; what did not exist was any definition
of what makes it true. That definition is what this adds.

## Validate

```sh
sudo service postgresql start
db/visual-gate/validation/run.sh          # apply twice, then behavioural checks
node db/visual-gate/validation/parity.mjs # SQL gate vs JS gate on the same fixtures
```

Expected: both migrations `OK` on both passes; checks 2, 4 and 5 ERROR (that is the
passing result — the constraint fired); `fail_closed = FAIL`; `good_gate_state = PASS`;
`PARITY OK` on both fixtures.

## Live-schema risk, named rather than papered over

The link into `thylora_chairman_preview_packets` is a `to_regclass`-guarded view,
following the `0010_registry_link.sql` precedent. If the table is absent or shaped
differently on the live backend, the view is simply not created and the rest still
applies. What remains unverified is narrow and named: compatibility with the live
backend's existing objects, and whether any name already collides.
