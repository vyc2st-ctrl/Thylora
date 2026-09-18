# Understanding Engine — backend migrations

The Understanding Engine schema was applied directly to the authoritative backend
`thylora-dash` (`jvsdxhrfhtlgaknhjxlz`) and is recorded in that project's
`supabase_migrations.schema_migrations`.

Unlike `db/rae-link/`, the SQL is **not** duplicated here. Copying ~40 KB of applied DDL into
the repository by hand would create a second artifact that can silently drift from what is
actually live, and drift in a schema that enforces child-safety and truth gates is the exact
failure this system is built to prevent. The backend is the source of truth; this file records
which migrations produced the live state so it can be located and audited.

## Applied migrations

| Version | Name | What it did |
|---|---|---|
| `20260918060559` | `ue_understanding_engine_core` | 16 tables: spec, bands, subject adapters, concepts, concept links, mastery, learner memory, loop events, question templates, questions, transfer tests, explain-back, adaptation profiles, safety gates, products, surfaces. Plus indexes. |
| `20260918060620` | `ue_understanding_engine_rls_and_rules` | `ue_apply_zero_rule` trigger on `ue_mastery_records`; RLS enabled on all 16 tables; Chairman-manage policies; authenticated read on the 5 curriculum tables; owner-or-Chairman on the 7 learner-state tables; `anon` grants revoked on all learner-state tables. |
| `20260918060811` | `ue_seed_bands_subjects_gates` | 8 progression bands, 17 subject adapters, 6 safety gates. |
| `20260918060908` | `ue_seed_question_templates` | 27 question templates covering all 10 loop stages. |
| `20260918061114` | `ue_seed_concept_graph` | 10 concepts across 8 subjects (all nine fields each), 14 typed edges. |
| `20260918061204` | `ue_seed_products_and_surfaces` | 8 products, 6 app/dashboard surfaces. |
| `20260918061450` | `ue_seed_engine_spec_a_to_o` | 15 spec sections A–O into `ue_engine_spec`. |
| `20260918061828` | `ue_calibrate_u_thresholds` | Recalibrated the `TRANSFERABLE` threshold to 0.55 after an in-run test showed 0.9-on-every-factor was falling short of the top band; `search_path` pinned on the trigger function. |

All migrations are additive. No pre-existing table, policy, function or record was altered,
with two intentional exceptions, both ordinary continuity linkage:

- `thylora_query_carryforward` row `THY-Q-20260918-CLAUDE-FRESH-STORE-SLATE-466` had its
  `next_query_id` set to point at this run's capture (`…-ENGINE-467`), per the
  `link_previous_and_next` rule in `THY-CONTINUITY-BOOT-002`.
- `ue_engine_spec` section `UE-SPEC-C` was updated by the calibration migration to match the
  new thresholds, with `version` incremented.

## Verification

Run after any change:

```sql
-- No concept may lose its unknown field or its edges.
select count(*) from ue_concepts where coalesce(trim(what_remains_unknown),'') = '';   -- must be 0
select count(*) from ue_concepts c
  where not exists (select 1 from ue_concept_links l
                    where l.from_concept = c.concept_code or l.to_concept = c.concept_code);  -- must be 0

-- No ue_ table may lose RLS, and no learner-state table may be reachable by anon.
select count(*) from pg_class c join pg_namespace n on n.oid = c.relnamespace
 where n.nspname = 'public' and c.relkind = 'r'
   and c.relname like 'ue!_%' escape '!' and not c.relrowsecurity;                      -- must be 0
select count(*) from information_schema.role_table_grants
 where table_schema = 'public' and grantee = 'anon'
   and table_name in ('ue_mastery_records','ue_learner_memory','ue_loop_events','ue_questions',
                      'ue_transfer_tests','ue_explain_back','ue_adaptation_profiles');  -- must be 0

-- The zero rule must hold: four perfect factors and one zero is still INCOMPLETE.
-- (Verified in-run on 2026-09-18; test rows were removed afterwards.)
```

Design and rationale: [`docs/UNDERSTANDING-ENGINE.md`](../../docs/UNDERSTANDING-ENGINE.md).
