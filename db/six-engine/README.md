# Six Understanding Engine · database migrations

Backend of record: `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`). These files are the
reviewable schema for `THY-SIX-UNDERSTANDING-ENGINE-001`. **They are not applied
by this repository.** Applying DDL to the live backend is a production mutation
and is held for Chairman execution.

## Apply order

| File | Contents |
|---|---|
| `0001_learner_and_questions.sql` | Learners, known lemmas, sessions, questions, routes, guardian gate routings |
| `0002_lexicon_word_sense.sql` | Lexemes, word senses, cues, blocker resolution cards, learner restatements, ambiguities, lexicon gaps |
| `0003_concepts_prerequisites.sql` | Concept graph, prerequisite edges, mastery, concept gaps, prerequisite walks |
| `0004_knowledge_and_evidence.sql` | Claims, positions, sources, evidence items, unknowns, discriminators, resolutions |
| `0005_load_separation.sql` | Problem structures, solve attempts, load measurements and the L × M × S constraints |
| `0006_resolution_runs.sql` | Runs, the append-only stage trail, failure hits, transfer tasks, next questions |
| `0007_functions.sql` | Evidence grading, claim resolution, load diagnosis, prerequisite floor, run closure |
| `0008_rls_policies.sql` | Row level security across every `sixu_*` table |
| `0009_seed_lexicon_and_concepts.sql` | **Generated.** Seed lexicon and concept graph |
| `0010_registry_link.sql` | `to_regclass`-guarded links into existing THYLORA registries |

Run in numeric order, one transaction per file.

`0009` is generated from the runtime lexicon and must not be hand-edited:

```
node six-engine/tools/generate-seed-sql.mjs > db/six-engine/0009_seed_lexicon_and_concepts.sql
```

`tests/six-seed.test.mjs` fails if the committed file stops matching its source.

## Design rules held throughout

1. **Additive only.** Every object is new and prefixed `sixu_`. No existing table
   is dropped, renamed or rewritten.
2. **No second source of truth.** Identity, the family archive, department
   registries and RAE Link channels stay where they already live. `0010` holds
   soft references behind `to_regclass` guards, so the file applies cleanly to a
   backend whose registry set differs.
3. **The rule lives with the data.** The constraints below are not documentation
   of an intention — they reject the write.
4. **`NULL` means "we did not find out".** It is never a low score. `0005` exists
   largely to keep those two apart.
5. **Idempotent.** Every file applies twice with no error and no duplicate row.

## The rules the schema refuses to let a client talk past

| Constraint / trigger | Refuses |
|---|---|
| `sixu_low_language_forbids_deficit_claim` | a mathematics deficit claimed while the sentence was not understood |
| `sixu_low_language_discards_uncontrolled_m` / `_s` | an uncontrolled M or S recorded below the language threshold |
| `sixu_p_solve_requires_all_three` | `P_solve` written with a factor missing |
| `sixu_p_solve_is_the_product` | a `P_solve` that is not L × M × S |
| `sixu_verdict_matches_measurement` | a verdict naming a blocker that was never measured |
| `sixu_confidence_within_evidence_cap` | confidence above the evidence under it |
| `sixu_record_gap_names_what_is_missing` | a record gap that does not say what is missing |
| `sixu_discriminator_is_an_observation` | "more research is needed" offered as what would answer it |
| `sixu_mastery_held_needs_evidence` | mastery recorded as HELD with no evidence behind it |
| `sixu_route_malformed_needs_presupposition` | a malformed question with no assumption named |
| `sixu_complete_run_carries_an_answer` | a completed run carrying no answer |
| `sixu_halted_run_names_its_reason` | a halted run that does not say why |
| `sixu_word_senses.meaning_here` length + `non_example not null` | a dictionary dump offered as a contextual meaning |
| `sixu_run_stages` append-only trigger | rewriting or deleting the stage trail |
| `sixu_run_stages` forward-only trigger | a stage running backwards |

## Validation

Never run against the THYLORA backend. The harness builds a throwaway local
database and answers one question: do these migrations apply cleanly,
idempotently, and do the rules actually reject what they claim to reject?

```
sudo service postgresql start
db/six-engine/validation/run.sh
```

It runs three things:

1. **Two application passes** over `0001`–`0010` (the second proves idempotency).
2. **`validation/behaviour.sql`** — each check asserts that a rule REJECTS what it
   should reject. The `ERROR` lines in its output are the passing result.
3. **`validation/twin-check.mjs`** — walks 700 combinations of L, M, S and the two
   control flags through both `sixu_diagnose_load` and the runtime
   `diagnose()` in `six-engine/lib/mathload.js`, and fails on the first
   disagreement. The rule exists twice; this is what stops it drifting.

If `psql` runs as a different OS user on your machine, the twin check takes a
wrapper:

```
SIXU_PSQL="su postgres -c" node db/six-engine/validation/twin-check.mjs
```

Last run of the full harness in authoring: all ten migrations OK on both passes,
every behavioural check rejected as intended, twin check **700 combinations,
0 mismatches**.
