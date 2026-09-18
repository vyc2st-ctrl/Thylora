-- SIX UNDERSTANDING ENGINE · 0005 · Language load vs mathematical load
-- Workroom: WR-SIXENGINE-001
--
--   P_solve = L × M × S
--
-- The product is stored, but the three factors are stored separately and the
-- schema refuses to let the product be read backwards. The rule that matters:
--
--   If L is below threshold, a wrong answer is evidence about the SENTENCE.
--   It is not evidence about the mathematics. M and S taken from the story
--   presentation are therefore NULL — unmeasured — and the row may not carry a
--   mathematics-deficit claim (FM-02).
--
-- NULL here means "we did not find out". It is not a low score. The check
-- constraints below exist so that no client, present or future, can quietly
-- turn one into the other.

begin;

do $$ begin
  create type sixu_load_verdict as enum (
    'SECURE','PROCEDURE_BLOCKED','RELATIONSHIP_BLOCKED','LANGUAGE_BLOCKED',
    'LANGUAGE_UNMEASURED','RELATIONSHIP_UNMEASURED','PROCEDURE_UNMEASURED'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type sixu_deficit_claim as enum (
    'NOT_SUPPORTED','SUPPORTED_RELATIONSHIP','SUPPORTED_PROCEDURE','NOT_CLAIMED'
  );
exception when duplicate_object then null; end $$;

-- The mathematical skeleton of a word problem, kept apart from its wording.
-- The controlled form is generated from this: same relation, same numbers, same
-- step count, sentence load removed.
create table if not exists sixu_problem_structures (
  id              uuid primary key default gen_random_uuid(),
  question_id     uuid not null references sixu_questions(id) on delete cascade,
  quantities      jsonb not null default '{}'::jsonb,
  relation        text not null,
  target          text not null,
  steps           smallint not null default 1 check (steps between 1 and 12),
  created_at      timestamptz not null default now()
);

create table if not exists sixu_solve_attempts (
  id                  uuid primary key default gen_random_uuid(),
  run_id              uuid not null,
  question_id         uuid not null references sixu_questions(id) on delete cascade,
  learner_id          uuid not null references sixu_learners(id) on delete cascade,
  structure_id        uuid references sixu_problem_structures(id) on delete set null,
  presentation        text not null default 'STORY'
                      check (presentation in ('STORY','LANGUAGE_CONTROLLED','BARE_COMPUTATION')),
  learner_restatement text,
  relation_stated     text,
  steps_attempted     smallint check (steps_attempted >= 0),
  steps_correct       smallint check (steps_correct >= 0),
  answer_correct      boolean,
  attempted_at        timestamptz not null default now(),
  check (steps_correct is null or steps_attempted is null or steps_correct <= steps_attempted)
);

create index if not exists sixu_solve_attempts_learner_idx on sixu_solve_attempts(learner_id, attempted_at desc);

create table if not exists sixu_load_measurements (
  id                      uuid primary key default gen_random_uuid(),
  run_id                  uuid not null,
  attempt_id              uuid not null references sixu_solve_attempts(id) on delete cascade,
  learner_id              uuid not null references sixu_learners(id) on delete cascade,

  -- NULL = UNMEASURED. Never write 0 to mean "we did not find out".
  language_load           numeric(3,2) check (language_load between 0 and 1),
  mathematical_load       numeric(3,2) check (mathematical_load between 0 and 1),
  procedure_load          numeric(3,2) check (procedure_load between 0 and 1),

  -- Whether M and S were measured with the language load taken out.
  m_controlled            boolean not null default false,
  s_controlled            boolean not null default false,

  word_coverage           numeric(3,2) check (word_coverage between 0 and 1),
  invariant_recovery      numeric(3,2) check (invariant_recovery between 0 and 1),
  invariants_lost         text[] not null default '{}',

  p_solve                 numeric(4,3) check (p_solve between 0 and 1),
  verdict                 sixu_load_verdict not null,
  mathematics_deficit_claim sixu_deficit_claim not null,
  discarded_measurements  text[] not null default '{}',
  evidence_notes          text[] not null default '{}',
  teaching_target         text not null,
  next_action             text not null,
  measured_at             timestamptz not null default now()
);

create index if not exists sixu_load_measurements_learner_idx on sixu_load_measurements(learner_id, measured_at desc);

-- 1. The product exists only when all three factors do.
do $$ begin
  alter table sixu_load_measurements add constraint sixu_p_solve_requires_all_three
    check (
      (p_solve is null)
      or (language_load is not null and mathematical_load is not null and procedure_load is not null)
    );
exception when duplicate_object then null; end $$;

-- 2. The product must equal L × M × S when it is present.
do $$ begin
  alter table sixu_load_measurements add constraint sixu_p_solve_is_the_product
    check (
      p_solve is null
      or abs(p_solve - (language_load * mathematical_load * procedure_load)) <= 0.002
    );
exception when duplicate_object then null; end $$;

-- 3. THE RULE. Below the L threshold — or with L unmeasured — no mathematics
--    deficit may be claimed.
do $$ begin
  alter table sixu_load_measurements add constraint sixu_low_language_forbids_deficit_claim
    check (
      (language_load is not null and language_load >= 0.5)
      or mathematics_deficit_claim = 'NOT_SUPPORTED'
    );
exception when duplicate_object then null; end $$;

-- 4. Below the L threshold, an M or S that was NOT measured under language
--    control may not be recorded at all. It is discarded, not scored.
do $$ begin
  alter table sixu_load_measurements add constraint sixu_low_language_discards_uncontrolled_m
    check (
      language_load is null or language_load >= 0.5
      or mathematical_load is null or m_controlled
    );
exception when duplicate_object then null; end $$;

do $$ begin
  alter table sixu_load_measurements add constraint sixu_low_language_discards_uncontrolled_s
    check (
      language_load is null or language_load >= 0.5
      or procedure_load is null or s_controlled
    );
exception when duplicate_object then null; end $$;

-- 5. A verdict naming a factor as the blocker requires that factor to have been
--    measured. "Blocked" is a finding; "unmeasured" is an admission.
do $$ begin
  alter table sixu_load_measurements add constraint sixu_verdict_matches_measurement
    check (
      (verdict = 'LANGUAGE_UNMEASURED'     and language_load is null)
      or (verdict = 'LANGUAGE_BLOCKED'     and language_load is not null and language_load < 0.5)
      or (verdict = 'RELATIONSHIP_UNMEASURED' and mathematical_load is null)
      or (verdict = 'RELATIONSHIP_BLOCKED' and mathematical_load is not null and mathematical_load < 0.6)
      or (verdict = 'PROCEDURE_UNMEASURED' and procedure_load is null)
      or (verdict = 'PROCEDURE_BLOCKED'    and procedure_load is not null and procedure_load < 0.6)
      or (verdict = 'SECURE' and language_load >= 0.5 and mathematical_load >= 0.6 and procedure_load >= 0.6)
    );
exception when duplicate_object then null; end $$;

commit;
