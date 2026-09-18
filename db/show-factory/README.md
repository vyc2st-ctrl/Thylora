# `db/show-factory` — History → Show Factory schema

Workroom: **WR-SHOWFACTORY-001** · Backend of record: `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`)

**Reviewable. Not applied.** Applying DDL to the production backend is a held
action. These files were validated against a local PostgreSQL 16 instance, twice
over for idempotency, with the behavioural checks in `validation/`.

| File | Contents |
|---|---|
| `0001_moments_sources_claims.sql` | Moments, sources, claims on the evidence ladder, quotations |
| `0002_seeds_formula_formats.sql` | Seeds, the five SHOW_SEED factors, three acts, the output ladder, question cards |
| `0003_rights_gate_corrections.sql` | Copyright, provenance, people flags, append-only corrections, gate trail |
| `0004_functions.sql` | `hsf_production_gate` and `hsf_run_gate` — the same rules as `show-factory/lib/seed.js` |
| `0005_rls_policies.sql` | Row-level security on all 16 tables |

## Why the rules are written twice

`show-factory/lib/` holds the rules in JavaScript so a researcher sees every
unmet prerequisite immediately, in one pass, without a round trip. `0004` holds
the same rules in SQL so a different client cannot bypass them. The two are kept
deliberately identical and the parity is asserted by a test
(`tests/show-factory.test.mjs`, "every rule the SQL gate enforces is also
enforced by the JS gate"), which trips if either side gains a rule the other
lacks.

## Validation

```
sudo service postgresql start
db/show-factory/validation/run.sh
```

Expected: exit 0, ten `OK` lines (two passes over five migrations), twelve
`ERROR` lines in the behavioural section — each of which is a *passing* result,
because each is the database refusing something it is supposed to refuse — and:

```
blockers_when_half_built=18
blockers_when_complete=0
gate_state=PASSED
rls_disabled_tables=0
tables=16
check_constraints=20
policies=33
```

## What is enforced in the database, not only in a comment

- A `CONTESTED` claim must say who disputes it and why.
- An `UNKNOWN` must be stated. A silent gap is not a stated gap.
- A quotation altered in circulation must carry what the source actually says.
- A misattributed quotation must name who actually wrote it.
- An unsourced or misattributed line may be an episode's subject, never its spine.
- An opening question, and the question for today, must contain a question mark.
- A question card may not carry an answer.
- The children's cut must name what nobody knows, and may rest only on `DOCUMENTED` claims.
- A store product cannot ship on unresolved rights.
- Contested or looted provenance must carry a disclosure note.
- Human remains and violated consent require a named clearance.
- Corrections are append-only: `update` and `delete` raise.
