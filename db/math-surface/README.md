# THYLORA mathematics surface — database migrations

Backend of record: `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`).

These files are the reviewable schema for the L × M × S understanding model.
**They are not applied by this repository.** Applying DDL to the live backend is
a production mutation and is held for Chairman execution.

## Apply order

| File | Contents |
|---|---|
| `0001_model_registry.sql` | The model, the ten-word vocabulary registry, the worked examples and their four isolations |
| `0002_learners_observations.sql` | Opaque learner references, sittings, layer observations, the admissible-factor view |
| `0003_understanding_cards.sql` | Append-only Understanding Cards, supersede chain, the hard rule as a check constraint |
| `0004_protocols.sql` | The three standing protocols, the workstream manifest, the voice-line registry, protected names |
| `0005_rls_policies.sql` | Row level security: teaching material public, a child's record owner-only |
| `0006_functions.sql` | `thy_math_p_solve`, `thy_math_claim_supported`, `thy_math_read_sitting`, `thy_math_card_gate` |

Run in numeric order, one transaction per file.

## Design rules held throughout

1. **Additive only.** Every object is new and prefixed `thy_math_` or `thy_`.
   Nothing existing is dropped, renamed or rewritten.
2. **Null is not zero.** An unmeasured layer stores `NULL` and no read path
   coalesces it to `0`. `thy_math_p_solve` returns `NULL` rather than inventing
   a number, and returns `0` only when a factor was actually measured at zero.
3. **The hard rule is a constraint, not a comment.**
   `thy_math_card_math_claim_requires_isolated_m` refuses any card claiming a
   mathematics deficit without an isolated measurement of the relationship
   layer. A client that forgets the rule cannot write past it.
4. **Cards are append-only.** `thy_math_cards_are_append_only` raises on UPDATE
   and DELETE. A correction inserts a new version with `supersedes` set; the
   original stays readable. This is the family story archive rule applied to
   assessment.
5. **No identity, no diagnosis, no medical detail.** There is no column for a
   legal name, a date of birth, a school identifier, a diagnosis or a medical
   note — not a nullable one, not a JSON blob that could hold one. A learner is
   an opaque reference chosen by the family.
6. **No school-wide read of children.** RLS grants a child's observations and
   cards to the owning account only. There is no staff role and no analytics
   view over children here. Adding one is a separate, argued migration.
7. **Refusals are stored, not omitted.** `refused_claims` and
   `not_measured_statement` are required columns. A card that reports a number
   without reporting what was not measured cannot be written.
8. **Protected names are refused at the column.**
   THY-MINOR-NAME-ADULT-USE-001 is a check constraint on examples, learner
   references and cards, plus `thy_math_name_rule_ok` for text being considered
   for any surface.

## What is NOT in this schema, deliberately

- No score, grade, level or percentile.
- No comparison between learners, no cohort table, no ranking view.
- No free-text field for an adult's opinion about a child. What a card carries
  about a child is what was measured, what was not measured, and the child's own
  words.

## Verification state

The migrations have **not** been applied. No PostgreSQL server was reachable
from the build session (`psql` client present, no server), so no claim is made
here that they apply cleanly — that check belongs to the session that applies
them.

What **was** verified in this delta is the persistence behaviour the schema is
built to mirror: append-only writes, supersede chains and record survival across
a reopen, proven against a real filesystem in `tests/math-persistence.test.mjs`.
The client twin of `thy_math_p_solve` and `thy_math_claim_supported` is proven
in `tests/math-understanding.test.mjs`.
