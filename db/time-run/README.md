# Time Run database migrations

Backend of record: `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`). These files are the
reviewable schema for Time Run live traversal. **They are not applied by this
repository.** Applying DDL to the live backend is a production mutation and is
held for Chairman execution.

## Apply order

| File | Contents |
|---|---|
| `0001_eras_places.sql` | Living eras with capability ceilings; stable places, derived-name candidates, era strata |
| `0002_traversal_encounter.sql` | Persons, traversals, carried objects under the capability envelope, capability transformations, people met, information shared |
| `0003_causality_provenance.sql` | Open mechanics, causality candidates, historical record with the fulfilment guard, provenance |

## What the schema refuses

The binding correction is enforced by constraints, not by comments.

| Constraint | Refuses |
|---|---|
| `trun_eras_living_only` | A non-living era. There is no archive mode. |
| `trun_strata_people_living` | A stratum whose occupants are scenery. |
| `trun_traversal_physical` | A viewer, observer or remote presence. |
| `trun_traversal_memory_kept` | A crossing that strips memory. |
| `trun_object_no_leak` | A carried object functioning above the destination ceiling. |
| `trun_object_native_is_within` | An over-ceiling object recorded as `NATIVE`. |
| `trun_object_inert_is_inert` | An `INERT` object that still works. |
| `trun_disclosure_no_knowledge_leak` | Knowledge marked buildable in an era that cannot supply the capability. |
| `trun_met_may_decline` | A person met without the right to decline. |
| `trun_places_name_not_prohibited` | Any place name containing *Peete*. |
| `trun_name_candidate_derived` | A name candidate with fewer than two glossed morphemes. |
| `trun_record_branch_matches_model` | A branch opened under a non-branching causality model. |
| `trun_causality_selection_named` | A causality model selected with nobody named. |
| `trun_mechanic_selection_named` | A mechanic marked `SELECTED` with no selection and no decider. |
| `trun_record_fulfilment_guard_trg` | A historical record marked `FULFILLED` before the departure exists. |

## Validation

```
PGHOST=… PGPORT=… PGUSER=… db/time-run/validation/run.sh
```

Creates a fresh database, applies all three migrations, re-applies them to prove
idempotence, then runs `validation/behaviour.sql`.

Last run: PostgreSQL 16, 2026-09-21 — **15 tables, 30 check constraints,
17 of 17 expect-reject cases rejected, 3 expect-accept cases accepted,
0 causality models selected, 6 mechanics open.**
