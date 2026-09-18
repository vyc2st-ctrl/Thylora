# World castle survey migrations

Backend of record: `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`). These files are the
reviewable schema for the castle as a coordinate-true world object. **They are
not applied by this repository**, and could not have been: network egress to
`jvsdxhrfhtlgaknhjxlz.supabase.co` is denied by policy in the authoring
environment (403 on CONNECT, confirmed against the agent proxy's own status
endpoint). Applying DDL to the live backend is a production mutation and is held
for Chairman execution.

## Apply order

| File | Contents |
|---|---|
| `0001_frames_datums.sql` | Evidence sources, datums, the frame hierarchy, the origin rule |
| `0002_elements_materials.sql` | Materials, build phases, elements, the append-only element version ledger |
| `0003_masonry.sql` | Procedural masonry specs and explicit masonry instances |
| `0004_rooms_openings.sql` | Storeys, rooms, occupants, lighting, openings, room links, room-use proposals |
| `0005_circulation.sql` | Traveller profiles, nodes, gates, segments, routes, solved routes and their constraints |
| `0006_period_technology.sql` | `PERIOD_TECH_PROFILE_CASTLE_001`, candidate traditions, allow and prohibit lists |
| `0007_provenance_nonregression.sql` | Unknown register, append-only world versions, supersessions, name candidates |
| `0008_rls_policies.sql` | Row level security across every `thyw_*` table |
| `0009_functions.sql` | Unknown census, opening audit, non-regression check, Wq gate |
| `0010_registry_link.sql` | `to_regclass`-guarded links into existing THYLORA registries |

Run in numeric order, one transaction per file.

## Design rules held throughout

1. **Additive only.** Every object is new and prefixed `thyw_`. No existing
   THYLORA table is dropped, renamed or rewritten.
2. **UNKNOWN is legal; invented canon is not.** A NULL measurement means
   UNKNOWN and is accepted everywhere. What the database refuses is a row marked
   `VERIFIED` whose evidence source is `ABSENT` or unreadable. That single
   constraint is the difference between a survey and a story.
3. **Geometry is integral.** Linear quantities are `bigint` millimetres, angular
   quantities are `integer` millidegrees. No floating point, for the same reason
   RAE Link stores money in integer minor units: a float that is written, read
   and re-written drifts, and drift in a survey frame is silent loss of
   established geometry.
4. **The rule may be canon before the value exists.** `thyw_origin_rules`
   separates the origin *rule* from the *point it resolved to*, and refuses to
   be marked resolved without that point.
5. **VISIBLE WINDOW => REAL ROOM.** Enforced by check constraint, not by
   documentation. An opening with nothing behind it cannot be committed.
6. **A wheeled traveller cannot climb steps.** Enforced by check constraint on
   `thyw_traveller_profiles`, so it cannot be configured away.
7. **Nothing is admitted to the period allow-list while the period is
   unresolved.** Enforced by trigger. Admission without a period is a guess
   wearing a table row.
8. **Only the Chairman supersedes, selects or canonizes.** Check constraints on
   `thyw_supersessions`, `thyw_room_use_proposals`,
   `thyw_period_candidate_traditions` and `thyw_name_candidates`.
9. **Version ledgers are append-only.** `thyw_element_versions` and
   `thyw_world_versions` refuse UPDATE and DELETE by trigger, so
   `F_(n+1) >= F_n` can actually be checked against what was there before.
10. **Soft references, not blind foreign keys.** The live schema could not be
    inspected from the authoring session, so `0010` links only through
    `to_regclass` guards and `thyw_external_refs`, whose `verified` column
    records that the target shape was never inspected.

## Validation

`validation/run.sh` applies all ten files to a throwaway local database — twice,
to prove idempotency — then runs `validation/behaviour.sql`, which asserts that
each rule rejects what it claims to reject.

```
sudo service postgresql start
db/world-castle/validation/run.sh
```

Result on PostgreSQL 16, 2026-09-18: **exit 0**. 34 tables, 34 with row level
security, 44 check constraints. Twenty of twenty migration applications clean
across both passes. Twenty-one of twenty-one "expect reject" cases rejected by
the database, including an attempt to mark an element `VERIFIED` from the
unreadable castle reference.

One case is recorded as a narrowing rather than a rejection: a fractional
coordinate offered to a `bigint` column is rounded to whole millimetres by
PostgreSQL rather than refused. Storage stays integral — a fraction cannot be
held — and `validation/behaviour.sql` asserts that explicitly instead of
claiming a rejection that does not happen.

`validation/supabase_stub.sql` creates a minimal `auth.users`, `auth.uid()` and
the `anon` / `authenticated` roles so the migrations can run outside Supabase.
`0008` also creates a local `thylora_is_chairman()` **only if** the real function
is absent, so the live definition always wins.
