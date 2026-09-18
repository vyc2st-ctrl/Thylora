-- THYLORA WORLD · 0001 · Survey frames, datums and the origin rule
-- Workroom: WR-WORLD-CASTLE-001
-- Backend: thylora-dash (jvsdxhrfhtlgaknhjxlz)
--
-- AUTHORITY NOTE
-- This file is a reviewable migration. It is NOT applied by this repository, and
-- could not have been: network egress to jvsdxhrfhtlgaknhjxlz.supabase.co is
-- denied by policy in the authoring environment (403 on CONNECT). Applying DDL
-- to the live backend is a production mutation and is held for Chairman
-- execution. Every statement is idempotent and additive: it creates new thyw_*
-- objects and never drops, renames or rewrites an existing THYLORA table.
--
-- STORAGE RULE
-- Linear quantities are integer millimetres. Angular quantities are integer
-- millidegrees. There is no floating point in stored geometry, for the same
-- reason RAE Link stores money in integer minor units: a float that is written,
-- read and re-written drifts, and drift in a survey frame is silent loss of
-- established geometry, which the non-regression floor forbids.
--
-- UNKNOWN RULE
-- A NULL measurement means UNKNOWN and is legal everywhere. What is not legal is
-- a row marked VERIFIED whose evidence source is ABSENT. That constraint is the
-- difference between a survey and a story.

begin;

create extension if not exists "pgcrypto";

do $$ begin
  create type thyw_frame_kind as enum ('PLANET','REGION','SITE','COMPLEX','STRUCTURE','STOREY','ELEMENT');
exception when duplicate_object then null; end $$;

do $$ begin
  create type thyw_evidence_state as enum ('VERIFIED','INFERRED','PROPOSED','UNKNOWN');
exception when duplicate_object then null; end $$;

do $$ begin
  create type thyw_source_kind as enum ('BACKEND_ROW','REPOSITORY_FILE','CHAIRMAN_DIRECTIVE','DERIVED','ABSENT');
exception when duplicate_object then null; end $$;

do $$ begin
  create type thyw_confidence as enum ('HIGH','MEDIUM','LOW','NONE');
exception when duplicate_object then null; end $$;

-- Evidence sources are first-class rows. Nothing may cite a source that is not
-- registered here, so the provenance of any coordinate is always resolvable.
create table if not exists thyw_evidence_sources (
  source_id        text primary key,
  source_kind      thyw_source_kind not null,
  locator          text not null,
  accessed_at      date not null,
  confidence       thyw_confidence not null,
  readable         boolean not null default true,
  unreadable_note  text,
  note             text,
  created_at       timestamptz not null default now(),
  constraint thyw_source_unreadable_explained
    check (readable or unreadable_note is not null),
  constraint thyw_source_unreadable_has_no_confidence
    check (readable or confidence = 'NONE')
);

comment on table thyw_evidence_sources is
  'Registered evidence sources. An unreadable source must say why it is unreadable and may not carry confidence above NONE.';

-- Datums. A datum fixes Z=0. Its offset to any planetary reference may be NULL.
create table if not exists thyw_datums (
  datum_id                     text primary key,
  description                  text not null,
  offset_to_planetary_sea_level_mm bigint,
  evidence_state               thyw_evidence_state not null default 'UNKNOWN',
  source_id                    text references thyw_evidence_sources(source_id),
  created_at                   timestamptz not null default now()
);

create table if not exists thyw_world_frames (
  frame_id         text primary key,
  frame_kind       thyw_frame_kind not null,
  parent_frame_id  text references thyw_world_frames(frame_id),
  -- placement of this frame inside its parent; NULL in any column means UNKNOWN
  x_mm             bigint,
  y_mm             bigint,
  z_mm             bigint,
  yaw_mdeg         integer,
  pitch_mdeg       integer,
  roll_mdeg        integer,
  handedness       text not null default 'RIGHT_Z_UP',
  linear_unit      text not null default 'mm_int',
  angular_unit     text not null default 'mdeg_int',
  datum_id         text references thyw_datums(datum_id),
  north_basis      text,
  evidence_state   thyw_evidence_state not null default 'UNKNOWN',
  source_id        text references thyw_evidence_sources(source_id),
  note             text,
  created_at       timestamptz not null default now(),
  constraint thyw_frame_not_own_parent check (parent_frame_id is distinct from frame_id),
  constraint thyw_frame_root_is_planet
    check ((parent_frame_id is null) = (frame_kind = 'PLANET')),
  constraint thyw_frame_units_are_integral
    check (linear_unit = 'mm_int' and angular_unit = 'mdeg_int'),
  constraint thyw_frame_angles_in_one_turn
    check (coalesce(yaw_mdeg, 0) between 0 and 360000
       and coalesce(pitch_mdeg, 0) between 0 and 360000
       and coalesce(roll_mdeg, 0) between 0 and 360000)
);

create index if not exists thyw_world_frames_parent_idx on thyw_world_frames(parent_frame_id);

comment on constraint thyw_frame_root_is_planet on thyw_world_frames is
  'Exactly the PLANET frames are roots. This is the coordinate half of the interworld barrier: every other frame must hang off a named world.';

-- The origin RULE may be canon while its VALUE is UNKNOWN. That is the whole
-- point of separating the two columns: the rule is decided, the point is not found.
create table if not exists thyw_origin_rules (
  origin_id        text primary key,
  frame_id         text not null references thyw_world_frames(frame_id),
  horizontal_rule  text not null,
  vertical_rule    text not null,
  axis_x_rule      text not null,
  axis_y_rule      text not null,
  axis_z_rule      text not null,
  declination_to_true_north_mdeg integer,
  resolved         boolean not null default false,
  resolves_when    text not null,
  resolved_x_mm    bigint,
  resolved_y_mm    bigint,
  resolved_z_mm    bigint,
  source_id        text references thyw_evidence_sources(source_id),
  created_at       timestamptz not null default now(),
  constraint thyw_origin_resolved_has_a_point
    check (not resolved or (resolved_x_mm is not null and resolved_y_mm is not null and resolved_z_mm is not null))
);

comment on constraint thyw_origin_resolved_has_a_point on thyw_origin_rules is
  'An origin may not be declared resolved without the point it resolved to.';

commit;
