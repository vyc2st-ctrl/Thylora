# Understanding Engine · Language Blocker / Meaning Resolver

**Backend of record:** `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`)
**Lane:** `LANGUAGE_BLOCKER_RESOLVER`, named in carryforward sequence 468
**Parent:** `THY-SIX-UNDERSTANDING-ENGINE-001` (sequence 467)
**Captured as:** `THY-Q-20260918-CLAUDE-LANGUAGE-BLOCKER-LAB-471`
**Engine spec section:** `UE-SPEC-P — LANGUAGE BLOCKER / MEANING RESOLVER LAYER`

---

## What this directory holds, and what it does not

This directory holds the **reviewable schema only** — the two files below are the
schema as applied to the backend: the same DDL, in the same order, with the
transaction wrapper left to the migration runner.

| File | Contents |
|---|---|
| `0001_language_blocker_core.sql` | Seven `ue_lb_` tables, check constraints, indexes |
| `0002_language_blocker_rls.sql` | RLS, `anon` closed, `authenticated` read-only, Chairman write |

**The seed content is not mirrored here, deliberately.** Copying 40 term records,
127 senses and 42 sentence cases into this repository would create a second source
of truth that drifts from the backend within one thread — the exact failure the
RAE Link schema rules already forbid. The backend is the record. To pull the seed
migrations locally, use `supabase db pull` against `jvsdxhrfhtlgaknhjxlz`.

## Applied migrations, in order

| Migration | What it seeded |
|---|---|
| `ue_lb_language_blocker_core` | 7 tables, 20 check constraints, 8 indexes |
| `ue_lb_language_blocker_rls` | RLS on all 7, 14 policies, `anon` revoked |
| `ue_lb_seed_documented_research_sources` | 10 verbatim standards statements |
| `ue_lb_seed_terms_required_twenty` | The 20 terms named in the directive |
| `ue_lb_seed_terms_harvested_from_material` | 20 terms found by reading the sources |
| `ue_lb_seed_senses_flagship_ten` | 50 senses — five jobs each for ten words |
| `ue_lb_seed_senses_remaining_terms` | 77 senses for the other thirty terms |
| `ue_lb_seed_sentence_cases_sourced` | 10 cases built on published sentences |
| `ue_lb_seed_sentence_cases_required_terms` | 20 cases, incl. directions and adult speech |
| `ue_lb_seed_misreading_patterns` | The 11 misreading shapes |
| `ue_lb_seed_product_designs_and_surface` | 4 products, 4 designs, 1 surface |
| `ue_lb_seed_analysis_and_engine_spec_section` | 9 analysis sections, `UE-SPEC-P` |
| `ue_lb_seed_sentence_cases_completing_coverage` | 12 cases closing term coverage |
| `ue_lb_correct_seeded_counts_in_spec` | Corrected a miscount in `UE-SPEC-P` |
| `thy_correct_language_blocker_carryforward_query_id_suffix` | Label fix after a sequence race |

## The seven tables

| Table | Layer | Holds |
|---|---|---|
| `ue_lb_sources` | DOCUMENTED RESEARCH | Verbatim retrieved material, unedited, with CASE identifiers |
| `ue_lb_terms` | THYLORA ANALYSIS | One row per high-friction term, with its blocker type |
| `ue_lb_senses` | THYLORA ANALYSIS | The jobs one word does, with the tell-tale for each |
| `ue_lb_sentence_cases` | THYLORA ANALYSIS | The full ten-field model against one sentence |
| `ue_lb_misreading_patterns` | THYLORA ANALYSIS | The eleven general shapes of failure |
| `ue_lb_analysis` | all three, by `layer` column | Prose sections, layer-tagged |
| `ue_lb_product_designs` | PROPOSED PRODUCT DESIGN | Mechanics of the four candidates |

The three layers the directive asked to be kept apart are held apart **by table and
by column**, not by heading. `ue_lb_analysis.layer` is `not null` and constrained to
the three values, so no section can sit between what was retrieved, what THYLORA
concluded, and what is merely proposed.

## Rules the schema enforces, rather than documents

- `ue_lb_sources.what_remains_unknown` and `ue_lb_terms.what_remains_unknown` may
  not be empty. Inherited from the concept-field rules in `UE-SPEC-B`.
- A sentence case claiming to be sourced **must** name a source row
  (`ue_lb_cases_ref_ck`). A constructed sentence cannot be dressed as evidence.
- A sentence case must carry at least one misreading risk
  (`ue_lb_cases_risk_ck`). A case with no risk is a dictionary entry.
- A product design may not claim a price or a release
  (`ue_lb_pd_price_ck`, `ue_lb_pd_store_ck`), and must name at least one refusal.

## Position in the engine

Layer **zero**, beneath the truth floor in execution order. It runs before the
core loop on any text-bearing task.

Because `U = K × E × C × X × T` multiplies, a misread relation zeroes K, and zero
times anything is zero. A language blocker therefore does not reduce understanding
— it cancels it. This is the only failure mode in the engine where a learner can be
strong on every factor and still score zero through no fault of their reasoning.
Before any low U score is treated as a knowledge gap, the blocker check runs, and a
zero caused by a misreading is recorded as a misreading, never as a misconception
about the subject.

## State

Nothing here has been run past a child. No worksheet, test paper or child error
data was retrieved. Every claim about what children actually do is analysis, not
evidence, and is stored in the analysis tables rather than the source table for
that reason. All four products are `DESIGN_ONLY_NOT_BUILT` and `NOT_RELEASED`, with
pricing `UNKNOWN_UNTIL_COMMERCE_EVIDENCE`. The one surface is `NOT_BUILT`.
No publication.
