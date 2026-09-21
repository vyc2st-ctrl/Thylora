# Wave 1 store spine and castle traversal — reviewable SQL

Two migrations. **Neither has been applied.** They are written to be read first
and applied by whoever holds the backend, the same way `db/rae-link/` was handled.

| File | Contents |
|---|---|
| `0011_store_wave1.sql` | Shelves, products, append-only shelf placement, serial issue, delivery binding, price proposals, release gate |
| `0012_castle_time_traversal.sql` | Stable castle ID, append-only era layers across ten aspects, and the naming gate |

## What these files refuse to let you do

These are not documentation of good intentions. Each rule is a constraint, a
trigger or a function, so it fires in the database rather than in a review.

| Rule | Where it is enforced |
|---|---|
| Only one lead shelf can exist | `thy_store_one_lead_shelf` unique index |
| Moving a title off the lead shelf never erases where it was | `shelf_placement` is insert-only; `current_shelf()` reads the newest row |
| No new commerce infrastructure | `thy_store_no_new_commerce_infrastructure` check |
| A product is publishable only when **every** gate reads READY | `thy_store.is_publishable()`, with no override flag |
| Two buyers cannot receive the same serial | `issue_serial()` allocates under a row lock, `UNIQUE (sku, copy_no)` |
| A castle era layer can never be overwritten or deleted | `BEFORE UPDATE OR DELETE` trigger raising `ERA_LAYER_IS_APPEND_ONLY` |
| A castle name cannot be invented | `name_candidate.source_id` is `NOT NULL REFERENCES language_source` — with no language record on file, no candidate row can exist |
| Root, meaning, pronunciation, historical use and provenance cannot be left blank | `thy_castle_name_fields_real` check |
| The forbidden name is refused | `thy_castle_forbidden_name` check |
| Windsor, and anything like it, can never supply a name | `external_reference.classification = 'ERC'` plus `usable_for_naming = false` check |
| A name cannot be accepted without custodial permission | `guard_name_acceptance()` trigger |

## Readback

Each file ends with the readback queries to run after applying it. The two that
matter most:

```sql
SELECT sku, thy_store.is_publishable(sku) FROM thy_store.product WHERE kind = 'utility';
-- expect false for all three. final_release is OPEN by design.

SELECT thy_castle.naming_unblocked();
-- expect false. Eight naming dependencies are MISSING and none may be marked
-- PRESENT without a record behind it.
```

## What is verified today, without a database

`tests/store-wave1.test.mjs` reads both files and asserts the rules above are
present — that the append-only trigger exists, that the forbidden name is
checked, that no `DROP TABLE`, `TRUNCATE` or `DELETE FROM` appears in either
file, and that all eight naming dependencies are seeded `MISSING`.

That is a check of the *text*. It is not a check that the migrations apply
cleanly, that the constraints fire, or that the functions return what they
claim — those require a PostgreSQL instance, exactly as `db/rae-link/validation/`
did. Until that has been run, treat these two files as reviewed but unproven.
