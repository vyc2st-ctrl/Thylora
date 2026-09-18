-- SIX UNDERSTANDING ENGINE · 0003 · Concepts, prerequisites and mastery
-- Workroom: WR-SIXENGINE-001
--
-- An explanation lands on what the learner already holds. This schema stores the
-- chain so the engine can find the FLOOR — the deepest thing not yet held — and
-- start there instead of at the question.
--
-- The graph is data. A department extends it by inserting rows, not by shipping
-- code. What the engine will not do is invent a chain for a concept the graph
-- does not contain (FM-06): a missing concept is recorded as a gap.

begin;

do $$ begin
  create type sixu_mastery as enum ('UNKNOWN','NOT_HELD','SHAKY','HELD','TRANSFERRED');
exception when duplicate_object then null; end $$;

create table if not exists sixu_concepts (
  id              text primary key check (id ~ '^[a-z0-9_]+$'),
  label           text not null,
  domain          text,
  band            smallint not null default 2 check (band between 1 and 5),
  statement       text,
  record_state    sixu_record_state not null default 'ACTIVE',
  created_at      timestamptz not null default now()
);

create table if not exists sixu_concept_prerequisites (
  concept_id      text not null references sixu_concepts(id) on delete cascade,
  prerequisite_id text not null references sixu_concepts(id) on delete cascade,
  note            text,
  primary key (concept_id, prerequisite_id),
  check (concept_id <> prerequisite_id)
);

create index if not exists sixu_concept_prereq_rev_idx on sixu_concept_prerequisites(prerequisite_id);

create table if not exists sixu_learner_mastery (
  learner_id      uuid not null references sixu_learners(id) on delete cascade,
  concept_id      text not null references sixu_concepts(id) on delete cascade,
  level           sixu_mastery not null default 'UNKNOWN',
  -- Mastery is only raised by evidence: a passed transfer task, or an adult's
  -- judgement recorded as such. It is never raised by "the explanation was shown".
  evidence_kind   text not null default 'NONE'
                  check (evidence_kind in ('NONE','TRANSFER_PASSED','ADULT_JUDGEMENT','CONTROLLED_TASK')),
  evidence_run_id uuid,
  updated_at      timestamptz not null default now(),
  primary key (learner_id, concept_id)
);

do $$ begin
  alter table sixu_learner_mastery add constraint sixu_mastery_held_needs_evidence
    check (level not in ('HELD','TRANSFERRED') or evidence_kind <> 'NONE');
exception when duplicate_object then null; end $$;

-- A concept the graph does not hold. Recorded rather than fabricated.
create table if not exists sixu_concept_gaps (
  id              uuid primary key default gen_random_uuid(),
  requested_id    text not null,
  question_id     uuid references sixu_questions(id) on delete set null,
  detail          text not null,
  filled_at       timestamptz,
  created_at      timestamptz not null default now()
);

-- The walk itself is stored: which chain was examined, where it stopped, and
-- whether it stopped because everything was held or because the cap was hit.
create table if not exists sixu_prerequisite_walks (
  id                uuid primary key default gen_random_uuid(),
  run_id            uuid not null,
  learner_id        uuid not null references sixu_learners(id) on delete cascade,
  concept_id        text,
  chain             jsonb not null default '[]'::jsonb,
  unmet             jsonb not null default '[]'::jsonb,
  floor_concept_id  text,
  teach_order       text[] not null default '{}',
  truncated         boolean not null default false,
  truncation_note   text,
  cycles            jsonb not null default '[]'::jsonb,
  created_at        timestamptz not null default now()
);

do $$ begin
  alter table sixu_prerequisite_walks add constraint sixu_walk_truncation_is_explained
    check (truncated = false or truncation_note is not null);
exception when duplicate_object then null; end $$;

commit;
