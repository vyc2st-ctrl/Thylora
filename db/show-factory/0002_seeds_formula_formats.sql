-- HISTORY → SHOW FACTORY · 0002 · seeds, the five factors, the output ladder
-- Workroom: WR-SHOWFACTORY-001 · REVIEWABLE, NOT APPLIED.

do $$ begin
  create type hsf_factor as enum
    ('DOCUMENTED_MOMENT', 'HIDDEN_MECHANISM', 'HUMAN_DECISION', 'EVIDENCE_GAP', 'QUESTION_FOR_TODAY');
exception when duplicate_object then null; end $$;

do $$ begin
  create type hsf_seed_state as enum
    ('RESEARCH', 'SEEDED', 'GATED', 'PRODUCTION_READY', 'CORRECTED', 'WITHDRAWN');
exception when duplicate_object then null; end $$;

do $$ begin
  create type hsf_format as enum
    ('SHORT_60', 'VERSION_3', 'EPISODE_20', 'CHILDREN', 'QUESTION_CARDS', 'DISCUSSION_PAGE', 'STORE_PRODUCT');
exception when duplicate_object then null; end $$;

create table if not exists hsf_seeds (
  id               uuid primary key default gen_random_uuid(),
  moment_id        uuid not null references hsf_moments(id) on delete cascade,
  seed_title       text not null,
  episode_premise  text not null,
  opening_question text not null,
  state            hsf_seed_state not null default 'RESEARCH',
  created_at       timestamptz not null default now(),
  unique (moment_id, seed_title),
  -- The opening question must be a question. The factory is built on them.
  constraint hsf_seeds_opening_is_a_question check (opening_question like '%?%')
);

-- One row per factor. A UNIQUE on (seed_id, factor) plus the gate's count of five
-- is how "a missing factor is a zero, not a deduction" is enforced in the data.
create table if not exists hsf_seed_factors (
  seed_id  uuid not null references hsf_seeds(id) on delete cascade,
  factor   hsf_factor not null,
  body     text not null,
  primary key (seed_id, factor),
  constraint hsf_seed_factors_substantive check (length(btrim(body)) >= 15),
  constraint hsf_seed_factors_question_is_a_question
    check (factor <> 'QUESTION_FOR_TODAY' or body like '%?%')
);

create table if not exists hsf_acts (
  seed_id   uuid not null references hsf_seeds(id) on delete cascade,
  act_no    smallint not null check (act_no between 1 and 3),
  body      text not null,
  primary key (seed_id, act_no),
  constraint hsf_acts_substantive check (length(btrim(body)) >= 40)
);

create table if not exists hsf_format_drafts (
  id                 uuid primary key default gen_random_uuid(),
  seed_id            uuid not null references hsf_seeds(id) on delete cascade,
  format             hsf_format not null,
  body               jsonb not null default '{}'::jsonb,
  states_the_gap     boolean not null default false,
  sources_on_screen  boolean not null default false,
  rights_cleared     boolean not null default false,
  unique (seed_id, format),
  -- The children's rung must still name what nobody knows.
  constraint hsf_format_children_states_gap
    check (format <> 'CHILDREN' or states_the_gap = true),
  -- A store product cannot ship on unresolved rights.
  constraint hsf_format_store_rights_cleared
    check (format <> 'STORE_PRODUCT' or rights_cleared = true)
);

-- Which claims each rung leans on. The tier rules are checked by the gate function,
-- because they are a join, not a column.
create table if not exists hsf_format_claims (
  format_draft_id uuid not null references hsf_format_drafts(id) on delete cascade,
  claim_id        uuid not null references hsf_claims(id) on delete cascade,
  primary key (format_draft_id, claim_id)
);

create table if not exists hsf_question_cards (
  id        uuid primary key default gen_random_uuid(),
  seed_id   uuid not null references hsf_seeds(id) on delete cascade,
  ordinal   smallint not null,
  question  text not null,
  unique (seed_id, ordinal),
  -- No answer key. A question card with an answer on it is a fact card.
  constraint hsf_question_cards_is_a_question check (question like '%?%')
);
