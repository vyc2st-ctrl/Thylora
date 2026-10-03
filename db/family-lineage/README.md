# Family Lineage database migration

Backend of record: `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`). This migration is
reviewable source. **This repository does not apply it.** Applying DDL to the live
backend is a production change and waits for the Chairman to run it, as with `db/rae-link/`.

| File | Contents |
|---|---|
| `0001_lineage.sql` | Persons, parentage by role, other relations, belief→learned revisions, relative-age anchors, verbatim testimony, append-only teller corrections, open questions, record-search tasks, `fl_apply_corrections`, `fl_render_testimony`, `fl_sibling_kind`, owner-only RLS |

## Loading a family account

Each account the teller dictates is stored once as JSON in `family-lineage/accounts/`.
That folder is git-ignored because this repository is public.
The seed SQL is generated from that file, so the account is never kept in two places.

```
node family-lineage/seed.mjs family-lineage/accounts/<account>.json > /tmp/seed.sql
psql -v owner=<auth.users id of the teller> -f /tmp/seed.sql
```

The seed is idempotent. Running it twice adds nothing new.

## Validation

```
sudo service postgresql start
sudo -u postgres db/family-lineage/validation/run.sh
```

Result on PostgreSQL 16, 2026-10-03: **exit 0.** The migration and seed each applied cleanly twice.

- The invented example family loaded (`fixtures/example-account.json`). A real account was also loaded through `LINEAGE_ACCOUNT=` and passed.
- `fl_sibling_kind(father, half-uncle)` returns `HALF_SIBLING`.
- The PDF line `He said, "Come on, you're out here!"` renders as `He said, "Come on!"`.
- The verbatim testimony is left untouched.
- Five "expect reject" cases were rejected by the database:
  - rewriting verbatim testimony
  - editing a correction
  - deleting a correction
  - giving a person a second father
  - a correction with a blank target
- A different signed-in user sees 0 rows. The owner sees their whole tree.

## Before applying live

Confirm that `auth.users` is the identity table, that `pgcrypto` is available, and
that no existing object uses the `fl_` prefix.
