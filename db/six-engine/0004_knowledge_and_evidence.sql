-- SIX UNDERSTANDING ENGINE · 0004 · Knowledge, evidence, contest and the honest unknown
-- Workroom: WR-SIXENGINE-001
--
-- Where a definitive answer exists, the engine gives it. Where one does not, it
-- returns KNOWN · EVIDENCE · CONTESTED · UNKNOWN · WHAT WOULD ANSWER IT.
--
-- Three rules live in the schema rather than in a client that can be replaced:
--   · strength comes from INDEPENDENT lines, so repetition is collapsed by origin
--   · standing (who holds the position) is stored separately from strength and
--     is never summed into it
--   · a gap in the record carries who kept the records and who was outside them,
--     because silence can only be read once you know who was writing

begin;

do $$ begin
  create type sixu_evidence_tier as enum (
    'CONTEMPORANEOUS_RECORD','PHYSICAL_EVIDENCE','REPLICATED_EXPERIMENT','SYSTEMATIC_REVIEW',
    'SINGLE_STUDY','DIRECT_TESTIMONY','SECONDARY_ACCOUNT','ORAL_TRANSMISSION',
    'TERTIARY_SUMMARY','INFERENCE','ANECDOTE','UNSOURCED_ASSERTION'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type sixu_standing as enum ('CONSENSUS','MAJORITY','MINORITY','CONTESTED','EMERGING','FRINGE','UNSTATED');
exception when duplicate_object then null; end $$;

do $$ begin
  create type sixu_claim_state as enum ('RESOLVED','RESOLVED_WITH_CONDITIONS','CONTESTED','UNKNOWN','UNDECIDABLE','MALFORMED');
exception when duplicate_object then null; end $$;

do $$ begin
  create type sixu_unknown_kind as enum (
    'RECORD_GAP','NOT_YET_MEASURED','NOT_YET_OBSERVABLE','UNDEFINED_TERMS',
    'FUTURE_CONTINGENT','PRIVATE_FACT','UNDECIDABLE_IN_PRINCIPLE'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type sixu_feasibility as enum ('EXISTS_UNEXAMINED','OBTAINABLE','NOT_CURRENTLY_OBTAINABLE','IMPOSSIBLE','UNKNOWN');
exception when duplicate_object then null; end $$;

-- The weight of each tier is data, so it can be reviewed and argued with
-- instead of buried in code.
create table if not exists sixu_evidence_tier_weights (
  tier        sixu_evidence_tier primary key,
  weight      numeric(3,2) not null check (weight between 0 and 1),
  label       text not null
);

insert into sixu_evidence_tier_weights (tier, weight, label) values
  ('REPLICATED_EXPERIMENT',  0.94, 'result reproduced by independent teams'),
  ('CONTEMPORANEOUS_RECORD', 0.92, 'written or made at the time by someone present'),
  ('PHYSICAL_EVIDENCE',      0.90, 'the object, site, remains or measurement itself'),
  ('SYSTEMATIC_REVIEW',      0.88, 'all qualifying studies gathered and weighed'),
  ('SINGLE_STUDY',           0.62, 'one study, not yet reproduced'),
  ('DIRECT_TESTIMONY',       0.60, 'first-hand account given later'),
  ('SECONDARY_ACCOUNT',      0.45, 'written later, using sources'),
  ('ORAL_TRANSMISSION',      0.42, 'passed down by people, not written at the time'),
  ('INFERENCE',              0.35, 'reasoned from other facts, not observed'),
  ('TERTIARY_SUMMARY',       0.28, 'a summary of summaries — textbook, encyclopaedia'),
  ('ANECDOTE',               0.15, 'one story, no way to check it'),
  ('UNSOURCED_ASSERTION',    0.05, 'stated with nothing behind it')
on conflict (tier) do nothing;

create table if not exists sixu_claims (
  id              uuid primary key default gen_random_uuid(),
  question_id     uuid references sixu_questions(id) on delete set null,
  statement       text not null,
  domain          text,
  created_at      timestamptz not null default now()
);

create table if not exists sixu_claim_positions (
  id              uuid primary key default gen_random_uuid(),
  claim_id        uuid not null references sixu_claims(id) on delete cascade,
  position_key    text not null,
  statement       text not null,
  -- Standing is who holds it. It is reported to the learner and it never enters
  -- the strength arithmetic (see sixu_grade_evidence in 0007).
  standing        sixu_standing not null default 'UNSTATED',
  conditions      text[] not null default '{}',
  -- The observation that would separate this position from its rival.
  discriminator   text,
  created_at      timestamptz not null default now(),
  unique (claim_id, position_key)
);

-- A source is an origin. Twenty articles tracing to one dataset share one origin
-- and therefore count once.
create table if not exists sixu_sources (
  id              uuid primary key default gen_random_uuid(),
  origin_key      text not null unique,
  title           text,
  author          text,
  origin_scope    text not null default 'GENERAL_KNOWLEDGE'
                  check (origin_scope in ('GENERAL_KNOWLEDGE','BACKEND_RECORD','FAMILY_ARCHIVE','DEPARTMENT')),
  who_kept_it     text,
  as_of           date,
  created_at      timestamptz not null default now()
);

create table if not exists sixu_evidence_items (
  id              uuid primary key default gen_random_uuid(),
  position_id     uuid not null references sixu_claim_positions(id) on delete cascade,
  source_id       uuid not null references sixu_sources(id) on delete cascade,
  tier            sixu_evidence_tier not null references sixu_evidence_tier_weights(tier),
  detail          text,
  as_of           date,
  created_at      timestamptz not null default now()
);

create index if not exists sixu_evidence_items_position_idx on sixu_evidence_items(position_id);

create table if not exists sixu_claim_unknowns (
  id                  uuid primary key default gen_random_uuid(),
  claim_id            uuid not null references sixu_claims(id) on delete cascade,
  kind                sixu_unknown_kind not null,
  detail              text,
  -- Record-gap columns. A gap is evidence about the record-keeping, not about
  -- the people the record-keepers never wrote about.
  what_is_missing     text,
  why_missing         text,
  who_kept_records    text,
  who_was_outside_the_records text,
  created_at          timestamptz not null default now()
);

do $$ begin
  alter table sixu_claim_unknowns add constraint sixu_record_gap_names_what_is_missing
    check (kind <> 'RECORD_GAP' or what_is_missing is not null);
exception when duplicate_object then null; end $$;

-- WHAT WOULD ANSWER IT. A named observation with an honest feasibility, never
-- the phrase "more research is needed".
create table if not exists sixu_discriminators (
  id              uuid primary key default gen_random_uuid(),
  claim_id        uuid not null references sixu_claims(id) on delete cascade,
  requirement     text not null,
  detail          text,
  feasibility     sixu_feasibility not null default 'UNKNOWN',
  from_unknown_id uuid references sixu_claim_unknowns(id) on delete set null,
  created_at      timestamptz not null default now()
);

do $$ begin
  alter table sixu_discriminators add constraint sixu_discriminator_is_an_observation
    check (requirement !~* 'more research|further study|needs investigation');
exception when duplicate_object then null; end $$;

-- The resolution as it was reported to the learner, kept so it can be audited
-- against the evidence that existed at the time.
create table if not exists sixu_claim_resolutions (
  id                    uuid primary key default gen_random_uuid(),
  claim_id              uuid not null references sixu_claims(id) on delete cascade,
  run_id                uuid not null,
  state                 sixu_claim_state not null,
  confidence            numeric(3,2) not null check (confidence between 0 and 1),
  confidence_cap        numeric(3,2) not null check (confidence_cap between 0 and 1),
  cap_reason            text not null,
  lead_position_id      uuid references sixu_claim_positions(id) on delete set null,
  separation            numeric(3,2),
  resolved_at           timestamptz not null default now()
);

-- Confidence may never exceed the evidence under it (FM-03). The constraint is
-- here, not only in the client, so no future writer can talk past it.
do $$ begin
  alter table sixu_claim_resolutions add constraint sixu_confidence_within_evidence_cap
    check (confidence <= confidence_cap);
exception when duplicate_object then null; end $$;

-- A contested claim must carry more than one position on the record (FM-04).
create table if not exists sixu_resolution_positions (
  resolution_id   uuid not null references sixu_claim_resolutions(id) on delete cascade,
  position_id     uuid not null references sixu_claim_positions(id) on delete cascade,
  strength        numeric(3,2) not null check (strength between 0 and 1),
  independent_lines smallint not null check (independent_lines >= 0),
  supplied_items  smallint not null default 0,
  flags           text[] not null default '{}',
  standing_note   text,
  primary key (resolution_id, position_id)
);

commit;
