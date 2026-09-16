# Conveyor database spine

Backend of record: `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`). This file is the
reviewable schema for the production conveyor. **It is not applied by this
repository.** Applying DDL to the live backend is a production mutation and is
held for Chairman execution.

| File | Contents |
|---|---|
| `0001_conveyor_spine.sql` | Lanes, items, serials, provenance, append-only events, the stage gate, advance, money distance, the lane board, guarded registry links, RLS |

## Design rules held throughout

1. **Additive only.** Every object is new and prefixed `conv_`. No existing table
   is dropped, renamed or rewritten.
2. **No second source of truth.** The idea registry, product registry, department
   registry and THY-DPP-003 passports stay where they already live. The conveyor
   holds advancement state and a soft `*_ref` text column, resolved through
   `conv_resolve_idea`.
3. **Soft references, not blind foreign keys.** The live schema could not be
   inspected (403 on CONNECT, 2026-09-16), so nothing hard-links to a table whose
   shape is unverified. Column names came from the dashboard's own select lists.
4. **A claim must be backed by a value.** Evidence columns are enforced by CHECK
   where the value is on the row, and by a deferred constraint trigger where the
   backing lives in another table (`conv_assert_claims_backed`).
5. **Access is not authority.** RLS is on for every table and **no write policy
   exists** for any of them. `conv_advance` is revoked from `public`.
6. **The gate is the same on both sides.** `conv_stage_gate` and
   `conveyor/lib/stages.js` are checked against a shared parity fixture. A client
   gate that disagrees is a bug in the client, not a second opinion.

## Validation

`validation/run.sh` applies the spine to a throwaway local database — twice, to
prove idempotency — then runs `validation/behaviour.sql`, which asserts that each
rule rejects what it claims to reject.

```
sudo service postgresql start
npm run conveyor:validate
```

Result on PostgreSQL 16.13, 2026-09-16: **CONVEYOR VALIDATION OK**. 5 tables,
6 functions, 5 read policies, 0 write policies, 0 tables with RLS disabled,
12 lanes seeded, 27 check constraints. **13 of 13 expect-reject cases rejected.**

`validation/behaviour.sql` reuses `db/rae-link/validation/supabase_stub.sql` for
the `anon`/`authenticated` roles rather than defining a second stub.

## Verification still owed

Validation ran on local PostgreSQL 16, not on the live backend. Before applying:
confirm the live Postgres version, that `pgcrypto` is available, that no existing
object already uses the `conv_` prefix, and that `idea_registry.idea_id` and
`thylora_departments.department_code` are shaped as the dashboard's select lists
imply.
