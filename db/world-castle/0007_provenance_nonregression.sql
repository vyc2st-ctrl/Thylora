-- THYLORA WORLD · 0007 · Unknown register, world versions and the non-regression floor
-- Workroom: WR-WORLD-CASTLE-001
--
--   F_(n+1) >= F_n
--
-- No later version may lose previously established geometry, identity, topology,
-- dimensions, room assignments, routes or provenance unless the Chairman
-- explicitly supersedes it. Enforced by comparison in thyw_check_non_regression
-- (0009), permitted only by a row in thyw_supersessions.

begin;

do $$ begin
  create type thyw_protected_facet as enum (
    'GEOMETRY','IDENTITY','TOPOLOGY','DIMENSIONS','ROOM_ASSIGNMENT','ROUTES','PROVENANCE'
  );
exception when duplicate_object then null; end $$;

-- The unknown register is a first-class table, not a note in a document. An
-- unknown that is written down can be closed; an unknown that is only implied
-- gets quietly filled in by the next version.
create table if not exists thyw_unknown_register (
  unknown_id      text primary key,
  object_kind     text not null,
  object_id       text not null,
  unknown_field   text not null,
  why_unknown     text not null,
  closes_when     text not null,
  blocks_factor   text,
  opened_at       timestamptz not null default now(),
  closed_at       timestamptz,
  closed_by_source_id text references thyw_evidence_sources(source_id),
  constraint thyw_unknown_closed_needs_a_source
    check (closed_at is null or closed_by_source_id is not null),
  unique (object_kind, object_id, unknown_field)
);

comment on constraint thyw_unknown_closed_needs_a_source on thyw_unknown_register is
  'An unknown is closed by evidence, never by a decision to stop asking.';

-- Append-only world version ledger. A version is a full snapshot reference plus
-- the counts the floor protects.
create table if not exists thyw_world_versions (
  world_version_id  text primary key,
  sequence_no       integer not null unique,
  parent_version_id text references thyw_world_versions(world_version_id),
  recorded_at       timestamptz not null default now(),
  recorded_by       text not null,
  directive_ref     text,
  element_count     integer not null default 0,
  room_count        integer not null default 0,
  opening_count     integer not null default 0,
  route_count       integer not null default 0,
  verified_element_count integer not null default 0,
  verified_room_count    integer not null default 0,
  verified_opening_count integer not null default 0,
  wq_decision       text,
  wq_zero_factors   text[],
  snapshot          jsonb,
  note              text,
  constraint thyw_world_version_sequence_positive check (sequence_no >= 1),
  constraint thyw_world_version_counts_non_negative
    check (element_count >= 0 and room_count >= 0 and opening_count >= 0 and route_count >= 0),
  constraint thyw_world_version_verified_within_total
    check (verified_element_count <= element_count
       and verified_room_count <= room_count
       and verified_opening_count <= opening_count),
  constraint thyw_world_version_wq_decision
    check (wq_decision is null or wq_decision in ('HOLD','PROCEED'))
);

create or replace function thyw_block_world_version_rewrite() returns trigger
language plpgsql as $$
begin
  raise exception 'THYW: thyw_world_versions is append-only; % is refused', tg_op using errcode = '42501';
end $$;

drop trigger if exists thyw_world_versions_append_only on thyw_world_versions;
create trigger thyw_world_versions_append_only
  before update or delete on thyw_world_versions
  for each row execute function thyw_block_world_version_rewrite();

-- The only thing that permits a loss.
create table if not exists thyw_supersessions (
  supersession_id uuid primary key default gen_random_uuid(),
  object_id     text not null,
  facet         thyw_protected_facet not null,
  authority     text not null,
  directive_ref text not null,
  reason        text not null,
  recorded_at   timestamptz not null default now(),
  constraint thyw_supersession_authority_is_chairman check (authority = 'CHAIRMAN'),
  unique (object_id, facet, directive_ref)
);

comment on constraint thyw_supersession_authority_is_chairman on thyw_supersessions is
  'Only the Chairman may supersede established world state. No agent, job or later session can widen this.';

-- Castle name recovery. Candidates are stored; canonization is a separate act.
create table if not exists thyw_name_candidates (
  candidate_id  text primary key,
  subject_id    text not null,
  candidate_name text not null,
  derivation    text not null,
  naming_language text,
  canonized     boolean not null default false,
  canonized_by  text,
  canonized_at  timestamptz,
  created_at    timestamptz not null default now(),
  constraint thyw_name_canonization_is_chairman
    check (not canonized or (canonized_by = 'CHAIRMAN' and canonized_at is not null))
);

-- At most one canonical name per subject.
create unique index if not exists thyw_one_canonical_name_per_subject
  on thyw_name_candidates(subject_id) where canonized;

comment on index thyw_one_canonical_name_per_subject is
  'A subject may hold many candidates and at most one canonical name.';

commit;
