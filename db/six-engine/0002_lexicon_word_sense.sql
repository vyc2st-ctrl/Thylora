-- SIX UNDERSTANDING ENGINE · 0002 · Lexicon, word senses and the blocker resolver
-- Workroom: WR-SIXENGINE-001
--
-- This is not a dictionary. A dictionary stores every sense a word has ever
-- carried. This stores the JOB a word is doing in one sentence, for one learner,
-- and refuses to close the blocker until that learner has said it back.
--
-- One lemma, many senses, each with its own cues. The non-example is stored as a
-- required column because it is the field that does the teaching: it names the
-- sense the learner was about to reach for instead.

begin;

do $$ begin
  create type sixu_sense_job as enum (
    'QUANTITY_REMAINDER','QUANTITY_TOTAL','COMPARISON','DISTRIBUTIVE','OPERATION_CUE',
    'RELATION_INVERSE','DIRECTION','OBJECT_EVERYDAY','STRUCTURE_TECHNICAL','TEMPORAL',
    'CONDITIONAL','NEGATION','SCOPE','DISCOURSE','EPISTEMIC','SOURCE_STANDING'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type sixu_blocker_state as enum ('OPEN','AMBIGUOUS','RESTATED','CLEARED','UNKNOWN_WORD');
exception when duplicate_object then null; end $$;

create table if not exists sixu_lexemes (
  lemma           text primary key check (length(btrim(lemma)) > 0),
  is_multiword    boolean not null default false,
  band            smallint not null default 2 check (band between 1 and 5),
  note            text,
  created_at      timestamptz not null default now()
);

create table if not exists sixu_word_senses (
  id              text primary key,                       -- e.g. 'left#remainder'
  lemma           text not null references sixu_lexemes(lemma) on delete cascade,
  job             sixu_sense_job not null,
  domains         text[] not null default array['general'],
  band            smallint not null default 2 check (band between 1 and 5),
  -- The job this sense does, written for the learner. Not a definition.
  meaning_here    text not null check (length(meaning_here) between 3 and 180),
  substitute      text not null,
  example         text not null,
  -- Required. A sense with no non-example teaches nothing about the trap.
  non_example     text not null,
  -- Marks senses that carry logical weight: a simplification may not drop them.
  invariant       boolean not null default false,
  record_state    sixu_record_state not null default 'ACTIVE',
  created_at      timestamptz not null default now()
);

create index if not exists sixu_word_senses_lemma_idx on sixu_word_senses(lemma);

-- Cues are stored as data so a department can teach the engine a new context
-- without a code change.
create table if not exists sixu_sense_cues (
  id              uuid primary key default gen_random_uuid(),
  sense_id        text not null references sixu_word_senses(id) on delete cascade,
  cue_pattern     text not null,
  cue_kind        text not null default 'REGEX' check (cue_kind in ('REGEX','PHRASE','DOMAIN')),
  weight          smallint not null default 3 check (weight between 1 and 10),
  -- One cue per pattern per sense, so re-running the seed cannot double it.
  unique (sense_id, cue_pattern)
);

create index if not exists sixu_sense_cues_sense_idx on sixu_sense_cues(sense_id);

-- A resolution card. Seven fields, all required, all contextual.
create table if not exists sixu_blocker_resolutions (
  id                        uuid primary key default gen_random_uuid(),
  run_id                    uuid not null,
  question_id               uuid not null references sixu_questions(id) on delete cascade,
  learner_id                uuid not null references sixu_learners(id) on delete cascade,
  word                      text not null,
  context_sentence          text not null check (length(btrim(context_sentence)) > 0),
  meaning_here              text not null check (length(meaning_here) between 3 and 180),
  simpler_substitute        text not null,
  example                   text not null,
  non_example               text not null,
  learner_restatement_prompt text not null,
  sense_id                  text references sixu_word_senses(id) on delete set null,
  job                       sixu_sense_job,
  why_material              text not null,
  invariant                 boolean not null default false,
  state                     sixu_blocker_state not null default 'OPEN',
  created_at                timestamptz not null default now()
);

create index if not exists sixu_blocker_resolutions_run_idx     on sixu_blocker_resolutions(run_id);
create index if not exists sixu_blocker_resolutions_learner_idx on sixu_blocker_resolutions(learner_id, created_at desc);

-- A resolved card must name the sense it chose. An OPEN card without a sense is
-- an unresolved ambiguity, which is a different record (below).
do $$ begin
  alter table sixu_blocker_resolutions add constraint sixu_blocker_resolved_names_sense
    check (state in ('OPEN','AMBIGUOUS','UNKNOWN_WORD') or sense_id is not null);
exception when duplicate_object then null; end $$;

-- What the learner actually said back. Until a row exists here with a passing
-- fidelity, the engine holds that comprehension was assumed, not observed.
create table if not exists sixu_learner_restatements (
  id                   uuid primary key default gen_random_uuid(),
  resolution_id        uuid not null references sixu_blocker_resolutions(id) on delete cascade,
  said_text            text not null,
  fidelity             numeric(3,2) not null check (fidelity between 0 and 1),
  reached_for_wrong_sense boolean not null default false,
  accepted_by          text not null default 'ENGINE' check (accepted_by in ('ENGINE','ADULT')),
  accepted_by_user_id  uuid,
  created_at           timestamptz not null default now()
);

create index if not exists sixu_learner_restatements_resolution_idx on sixu_learner_restatements(resolution_id);

-- An ambiguity the context did not separate. This is a question to the learner,
-- never a silent choice of sense (FM-01).
create table if not exists sixu_sense_ambiguities (
  id                uuid primary key default gen_random_uuid(),
  run_id            uuid not null,
  question_id       uuid not null references sixu_questions(id) on delete cascade,
  word              text not null,
  context_sentence  text not null,
  candidate_sense_ids text[] not null,
  question_to_learner text not null,
  answered_sense_id text references sixu_word_senses(id) on delete set null,
  answered_at       timestamptz,
  created_at        timestamptz not null default now()
);

-- A word above band that the lexicon does not carry. Recorded as a gap so the
-- lexicon can be extended by a person. The engine never invents a meaning.
create table if not exists sixu_lexicon_gaps (
  id                uuid primary key default gen_random_uuid(),
  word              text not null,
  context_sentence  text not null,
  learner_id        uuid references sixu_learners(id) on delete set null,
  estimated_band    smallint check (estimated_band between 1 and 5),
  filled_sense_id   text references sixu_word_senses(id) on delete set null,
  filled_at         timestamptz,
  created_at        timestamptz not null default now()
);

create index if not exists sixu_lexicon_gaps_open_idx on sixu_lexicon_gaps(word) where filled_at is null;

commit;
