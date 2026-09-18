-- SIX UNDERSTANDING ENGINE · 0006 · Runs, the stage trail, transfer and next questions
-- Workroom: WR-SIXENGINE-001
--
-- Every resolution leaves a trail. The trail is append-only and enforced by a
-- trigger, not by convention: a run that was halted at MEANING cannot later be
-- tidied into a run that answered cleanly.
--
-- A run ends in one of four states, and three of them are honest outcomes:
--   COMPLETE  the contract was met
--   GATED     stopped at a gate, with a named next action
--   HALTED    stopped because continuing would have required a guess
--   PARTIAL   some stages ran, the contract was not met, and it says which

begin;

do $$ begin
  create type sixu_run_state as enum ('OPEN','COMPLETE','GATED','HALTED','PARTIAL');
exception when duplicate_object then null; end $$;

do $$ begin
  create type sixu_stage as enum (
    'QUESTION','MEANING','LOAD_SEPARATION','PREREQUISITES','KNOWLEDGE',
    'EVIDENCE','CONNECTIONS','EXPLAIN','TRANSFER','NEXT_QUESTION'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type sixu_stage_state as enum ('OK','HALT','SKIPPED');
exception when duplicate_object then null; end $$;

do $$ begin
  create type sixu_failure_severity as enum ('BLOCKING','CORRECTING','NOTING');
exception when duplicate_object then null; end $$;

create table if not exists sixu_runs (
  id                uuid primary key default gen_random_uuid(),
  question_id       uuid not null references sixu_questions(id) on delete cascade,
  learner_id        uuid not null references sixu_learners(id) on delete cascade,
  engine_version    text not null default 'THY-SIX-UNDERSTANDING-ENGINE-001',
  state             sixu_run_state not null default 'OPEN',
  halt_reason       text,
  started_at_floor  boolean not null default false,
  gate_routed       boolean not null default false,
  answer            jsonb,
  child_facing      text,
  parity            jsonb,
  started_at        timestamptz not null default now(),
  finished_at       timestamptz
);

create index if not exists sixu_runs_learner_idx  on sixu_runs(learner_id, started_at desc);
create index if not exists sixu_runs_question_idx on sixu_runs(question_id);

-- A run that stopped must say why. Silence is not a permitted outcome.
do $$ begin
  alter table sixu_runs add constraint sixu_halted_run_names_its_reason
    check (state not in ('HALTED','GATED','PARTIAL') or halt_reason is not null);
exception when duplicate_object then null; end $$;

-- A completed run must carry an answer. A run with no answer is not complete.
do $$ begin
  alter table sixu_runs add constraint sixu_complete_run_carries_an_answer
    check (state <> 'COMPLETE' or answer is not null);
exception when duplicate_object then null; end $$;

create table if not exists sixu_run_stages (
  id            uuid primary key default gen_random_uuid(),
  run_id        uuid not null references sixu_runs(id) on delete cascade,
  seq           smallint not null check (seq > 0),
  stage         sixu_stage not null,
  stage_state   sixu_stage_state not null,
  summary       text not null,
  data          jsonb,
  recorded_at   timestamptz not null default now(),
  unique (run_id, seq)
);

create index if not exists sixu_run_stages_run_idx on sixu_run_stages(run_id, seq);

-- APPEND ONLY. The trail is the custody record; a rewritten trail is not a
-- record of anything.
create or replace function sixu_stage_trail_is_append_only()
returns trigger language plpgsql as $$
begin
  raise exception 'sixu_run_stages is append-only: the stage trail may not be % (run %, seq %)',
    lower(tg_op), coalesce(old.run_id::text, '?'), coalesce(old.seq::text, '?');
end;
$$;

drop trigger if exists sixu_run_stages_no_update on sixu_run_stages;
create trigger sixu_run_stages_no_update
  before update or delete on sixu_run_stages
  for each row execute function sixu_stage_trail_is_append_only();

-- Stages may not run out of order. The order is the method.
create or replace function sixu_stage_order_is_forward()
returns trigger language plpgsql as $$
declare
  previous_stage sixu_stage;
  stage_rank     constant text[] := array[
    'QUESTION','MEANING','LOAD_SEPARATION','PREREQUISITES','KNOWLEDGE',
    'EVIDENCE','CONNECTIONS','EXPLAIN','TRANSFER','NEXT_QUESTION'];
begin
  select stage into previous_stage
    from sixu_run_stages
   where run_id = new.run_id and seq < new.seq
   order by seq desc limit 1;

  if previous_stage is not null
     and array_position(stage_rank, new.stage::text) < array_position(stage_rank, previous_stage::text) then
    raise exception 'stage % cannot follow % in run % — the pipeline runs forward only',
      new.stage, previous_stage, new.run_id;
  end if;
  return new;
end;
$$;

drop trigger if exists sixu_run_stages_forward_only on sixu_run_stages;
create trigger sixu_run_stages_forward_only
  before insert on sixu_run_stages
  for each row execute function sixu_stage_order_is_forward();

create table if not exists sixu_run_failures (
  id            uuid primary key default gen_random_uuid(),
  run_id        uuid not null references sixu_runs(id) on delete cascade,
  code          text not null check (code ~ '^FM-[0-9]{2}$'),
  failure_name  text not null,
  severity      sixu_failure_severity not null,
  detail        text,
  response      text not null,
  cleared_at    timestamptz,
  cleared_note  text,
  detected_at   timestamptz not null default now()
);

create index if not exists sixu_run_failures_run_idx  on sixu_run_failures(run_id);
create index if not exists sixu_run_failures_open_idx on sixu_run_failures(code) where cleared_at is null;

create table if not exists sixu_transfer_tasks (
  id            uuid primary key default gen_random_uuid(),
  run_id        uuid not null references sixu_runs(id) on delete cascade,
  learner_id    uuid not null references sixu_learners(id) on delete cascade,
  kind          text not null check (kind in ('SAME_RELATION_NEW_SURFACE','APPLY_THE_TEST','RUN_THE_MECHANISM_FORWARD','AUTHORED')),
  prompt        text not null,
  checks        text[] not null default '{}',
  verifies      text not null,
  outcome       text check (outcome in ('PASSED','PARTIAL','FAILED','NOT_ATTEMPTED')),
  outcome_note  text,
  concept_id    text references sixu_concepts(id) on delete set null,
  created_at    timestamptz not null default now(),
  completed_at  timestamptz
);

create index if not exists sixu_transfer_tasks_learner_idx on sixu_transfer_tasks(learner_id, created_at desc);

-- The run ends by opening the next question, never by closing down.
create table if not exists sixu_next_questions (
  id              uuid primary key default gen_random_uuid(),
  run_id          uuid not null references sixu_runs(id) on delete cascade,
  question_text   text not null,
  derived_from    text not null
                  check (derived_from in ('WHAT_WOULD_ANSWER_IT','RECORD_GAP','LOAD_DIAGNOSIS','PREREQUISITE_FLOOR','DEFAULT_TRANSFER')),
  feasibility     sixu_feasibility,
  asked_question_id uuid references sixu_questions(id) on delete set null,
  created_at      timestamptz not null default now()
);

create index if not exists sixu_next_questions_run_idx on sixu_next_questions(run_id);

-- Connections are only recorded where the other end is actually held.
create table if not exists sixu_run_connections (
  id            uuid primary key default gen_random_uuid(),
  run_id        uuid not null references sixu_runs(id) on delete cascade,
  to_concept_id text references sixu_concepts(id) on delete set null,
  link          text not null,
  verified      boolean not null default false,
  created_at    timestamptz not null default now()
);

commit;
