-- SIX UNDERSTANDING ENGINE · 0001 · Learners, questions and routing
-- Workroom: WR-SIXENGINE-001 · Engine: THY-SIX-UNDERSTANDING-ENGINE-001
-- Backend: thylora-dash (jvsdxhrfhtlgaknhjxlz)
--
-- AUTHORITY NOTE
-- This file is a reviewable migration. It is NOT applied by this repository.
-- Applying DDL to the live backend is a production mutation and is held for
-- Chairman execution. Every statement is idempotent and additive: it creates new
-- sixu_* objects and never drops, renames or rewrites an existing THYLORA table.
--
-- The engine is no longer limited to curriculum concepts. Anything a learner
-- asks is admitted here and routed by KIND, because the kind decides what an
-- honest answer is allowed to look like.

begin;

create extension if not exists "pgcrypto";

do $$ begin
  create type sixu_question_class as enum (
    'DEFINITIONAL',
    'FACTUAL_SETTLED',
    'CONCEPTUAL_MECHANISM',
    'PROCEDURAL',
    'MATH_WORD_PROBLEM',
    'CONTESTED_RECORD',
    'OPEN_RESEARCH',
    'VALUE_JUDGEMENT',
    'PERSONAL_RECORD',
    'MALFORMED',
    'SAFETY_GATED'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type sixu_gate as enum ('NONE','GUARDIAN','DEPARTMENT');
exception when duplicate_object then null; end $$;

do $$ begin
  create type sixu_record_state as enum ('DRAFT','ACTIVE','ARCHIVED');
exception when duplicate_object then null; end $$;

-- Learner profile. Soft reference to the existing identity: this engine does not
-- open a second identity system, and it does not duplicate the family archive.
create table if not exists sixu_learners (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid unique,                -- soft ref to auth.users / rael_profiles
  display_name        text not null,
  language_band       smallint not null default 2 check (language_band between 1 and 5),
  guardian_user_ids   uuid[] not null default '{}',
  protection_note     text,
  record_state        sixu_record_state not null default 'ACTIVE',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- Words this learner has already cleared. Kept so the engine stops re-explaining
-- what was banked last week: re-explanation is itself a language load.
create table if not exists sixu_learner_known_lemmas (
  learner_id          uuid not null references sixu_learners(id) on delete cascade,
  lemma               text not null,
  -- '' means "cleared in every sense", a specific id means "cleared in this
  -- sense only". A word cleared as a direction is not cleared as a remainder.
  sense_id            text not null default '',
  cleared_at          timestamptz not null default now(),
  cleared_by_run_id   uuid,
  primary key (learner_id, lemma, sense_id)
);

create table if not exists sixu_question_sessions (
  id                  uuid primary key default gen_random_uuid(),
  learner_id          uuid not null references sixu_learners(id) on delete cascade,
  opened_at           timestamptz not null default now(),
  closed_at           timestamptz,
  surface             text not null default 'APP',
  note                text
);

create table if not exists sixu_questions (
  id                  uuid primary key default gen_random_uuid(),
  session_id          uuid references sixu_question_sessions(id) on delete set null,
  learner_id          uuid not null references sixu_learners(id) on delete cascade,
  asked_text          text not null check (length(btrim(asked_text)) > 0),
  domain              text,
  asked_at            timestamptz not null default now(),
  parent_question_id  uuid references sixu_questions(id) on delete set null,
  origin              text not null default 'LEARNER'
                      check (origin in ('LEARNER','NEXT_QUESTION','ADULT','TRANSFER'))
);

create index if not exists sixu_questions_learner_idx on sixu_questions(learner_id, asked_at desc);
create index if not exists sixu_questions_parent_idx  on sixu_questions(parent_question_id);

-- The route is stored, not just used. An answer can be audited later against the
-- contract it was supposed to honour.
create table if not exists sixu_question_routes (
  id                     uuid primary key default gen_random_uuid(),
  question_id            uuid not null references sixu_questions(id) on delete cascade,
  question_class         sixu_question_class not null,
  original_class         sixu_question_class not null,
  alternates             jsonb not null default '[]'::jsonb,
  answer_contract        text not null,
  required_stages        text[] not null,
  min_independent_lines  smallint not null default 0 check (min_independent_lines >= 0),
  gate                   sixu_gate not null default 'NONE',
  backend_only           boolean not null default false,
  requires_contest_report boolean not null default false,
  presupposition         jsonb,
  routed_at              timestamptz not null default now(),
  unique (question_id)
);

-- A malformed question must carry its assumption and its repair. Answering as
-- asked would smuggle the assumption through as fact (FM-08).
do $$ begin
  alter table sixu_question_routes add constraint sixu_route_malformed_needs_presupposition
    check (question_class <> 'MALFORMED' or presupposition is not null);
exception when duplicate_object then null; end $$;

-- A gated question must name where it is going before it can be answered (FM-12).
create table if not exists sixu_gate_routings (
  id                  uuid primary key default gen_random_uuid(),
  question_id         uuid not null references sixu_questions(id) on delete cascade,
  gate                sixu_gate not null,
  routed_to_user_id   uuid not null,
  routed_at           timestamptz not null default now(),
  acknowledged_at     timestamptz,
  disposition         text check (disposition in ('ANSWERED_BY_ADULT','RELEASED_TO_LEARNER','WITHHELD'))
);

create index if not exists sixu_gate_routings_question_idx on sixu_gate_routings(question_id);

commit;
