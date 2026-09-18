-- HISTORY → SHOW FACTORY · 0001 · moments, sources, claims, quotations
-- Workroom: WR-SHOWFACTORY-001 · Backend of record: thylora-dash (jvsdxhrfhtlgaknhjxlz)
--
-- REVIEWABLE, NOT APPLIED. Applying DDL to the production backend is a held
-- action (see the workroom, blocker B2). These files are validated against a
-- local PostgreSQL 16 instance and are idempotent.
--
-- The evidence ladder is enforced here as well as in show-factory/lib/evidence.js,
-- on purpose: a different client must not be able to assert an inference as a fact.

create extension if not exists pgcrypto;

do $$ begin
  create type hsf_tier as enum ('DOCUMENTED', 'CONTESTED', 'INFERENCE', 'UNKNOWN');
exception when duplicate_object then null; end $$;

do $$ begin
  create type hsf_source_class as enum
    ('PRIMARY', 'ARCHIVAL', 'SCHOLARLY', 'INSTITUTIONAL', 'JOURNALISTIC', 'POPULAR', 'UNSOURCED');
exception when duplicate_object then null; end $$;

do $$ begin
  create type hsf_quote_state as enum
    ('DOCUMENTED_WORDING', 'REPORTED_WORDING', 'ALTERED_IN_CIRCULATION', 'ATTRIBUTED_UNSOURCED', 'MISATTRIBUTED');
exception when duplicate_object then null; end $$;

do $$ begin
  create type hsf_lane as enum
    ('QUESTIONS', 'MISTAKES_TO_DISCOVERY', 'CHALLENGED_ASSUMPTIONS', 'ENGINEERING_FAILURE', 'MAPS',
     'MEDICINE', 'AGRICULTURE', 'SCIENCE', 'TRADE', 'EDUCATION', 'ART', 'LANGUAGE', 'ORDINARY_LIFE');
exception when duplicate_object then null; end $$;

-- A documented historical moment. Not a person, not a life: a dated thing that happened.
create table if not exists hsf_moments (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null unique,
  title             text not null,
  subject           text,
  lane              hsf_lane not null,
  date_context      text not null,
  what_happened     text not null,
  -- The one field that stops this becoming a biography factory.
  popular_retelling_error text,
  what_is_contested text,
  created_at        timestamptz not null default now(),
  constraint hsf_moments_date_context_substantive check (length(btrim(date_context)) >= 10),
  constraint hsf_moments_what_happened_substantive check (length(btrim(what_happened)) >= 80)
);

create table if not exists hsf_sources (
  id            uuid primary key default gen_random_uuid(),
  moment_id     uuid not null references hsf_moments(id) on delete cascade,
  source_class  hsf_source_class not null,
  citation      text not null,
  locator       text,
  reachable     boolean,
  reached_at    timestamptz,
  note          text,
  constraint hsf_sources_citation_present check (length(btrim(citation)) > 0)
);
create index if not exists hsf_sources_moment_idx on hsf_sources(moment_id);

create table if not exists hsf_claims (
  id              uuid primary key default gen_random_uuid(),
  moment_id       uuid not null references hsf_moments(id) on delete cascade,
  ref             text not null,
  statement       text not null,
  tier            hsf_tier not null,
  dispute         text,
  corrects_retelling boolean not null default false,
  note            text,
  created_at      timestamptz not null default now(),
  unique (moment_id, ref),
  -- A CONTESTED claim must say who disputes it and why. Mirrors validateClaim().
  constraint hsf_claims_contested_has_dispute
    check (tier <> 'CONTESTED' or (dispute is not null and length(btrim(dispute)) >= 20)),
  -- An UNKNOWN must be stated. A silent gap is not a stated gap.
  constraint hsf_claims_unknown_is_stated
    check (tier <> 'UNKNOWN' or length(btrim(statement)) > 0)
);
create index if not exists hsf_claims_moment_idx on hsf_claims(moment_id);

create table if not exists hsf_claim_sources (
  claim_id   uuid not null references hsf_claims(id) on delete cascade,
  source_id  uuid not null references hsf_sources(id) on delete cascade,
  primary key (claim_id, source_id)
);

-- Quotations are held apart from claims because a quotation fails differently:
-- it can be real, altered, unsourced or somebody else's entirely.
create table if not exists hsf_quotes (
  id             uuid primary key default gen_random_uuid(),
  moment_id      uuid not null references hsf_moments(id) on delete cascade,
  ref            text not null,
  text           text not null,
  state          hsf_quote_state not null,
  as_documented  text,
  actual_author  text,
  used_as_title  boolean not null default false,
  note           text,
  unique (moment_id, ref),
  -- An altered quotation must carry what the source actually says.
  constraint hsf_quotes_altered_has_original
    check (state <> 'ALTERED_IN_CIRCULATION' or (as_documented is not null and length(btrim(as_documented)) > 0)),
  -- A misattributed quotation must name who actually wrote it.
  constraint hsf_quotes_misattributed_has_author
    check (state <> 'MISATTRIBUTED' or (actual_author is not null and length(btrim(actual_author)) > 0)),
  -- An unsourced or misattributed line may be an episode's subject, never its spine.
  constraint hsf_quotes_unsourced_not_title
    check (used_as_title = false or state not in ('ATTRIBUTED_UNSOURCED', 'MISATTRIBUTED'))
);

create table if not exists hsf_quote_sources (
  quote_id   uuid not null references hsf_quotes(id) on delete cascade,
  source_id  uuid not null references hsf_sources(id) on delete cascade,
  primary key (quote_id, source_id)
);
