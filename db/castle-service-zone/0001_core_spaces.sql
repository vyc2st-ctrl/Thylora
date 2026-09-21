-- CASTLE SERVICE ZONE · 0001 · Core: serials, states, space intake, adjacency intake
-- Workroom: WR-CASTLE-SERVICE-ZONE-576
-- Primary work: THY-WORK-KITCHEN-SUITE-RESIDENCE-576
-- Parallel lanes referenced, never overwritten: THY-WORK-INES-LIFE-ECONOMY-575,
--                                              THY-WORK-CASTLE-DIMENSIONAL-TWIN-572
--
-- EVIDENCE GAP (held in force across every file in this directory):
-- the build session could NOT reach jvsdxhrfhtlgaknhjxlz.supabase.co — the egress
-- policy denied CONNECT with 403 — so the live shape and contents of
--   thylora_castle_space_geometry
--   thylora_castle_space_connections
--   thylora_castle_object_state_registry
--   thylora_castle_object_events
--   thylora_person_world_sheet
--   thylora_mirror_name_registry
-- could NOT be read. Backend sequence 576 was therefore NOT read; it was not
-- reachable. Nothing here asserts what canon already holds.
--
-- THIS IS NOT A SECOND GEOMETRY SYSTEM.
-- These tables are an INTAKE LEDGER. They hold candidate rows, their measurement
-- state, their source and their serial. 0007_projection_readback.sql projects them
-- INTO thylora_castle_space_geometry / thylora_castle_space_connections when those
-- tables are present and shape-compatible, and refuses to invent them when they are
-- not. Geometry truth stays in the canon tables. Intake never becomes truth by
-- sitting here; it becomes truth only when projected and read back.

begin;

-- ---------------------------------------------------------------- state vocabulary

do $$ begin
  create type thy_csz_measurement_state as enum (
    'DOCUMENTED',          -- read from an existing authoritative record
    'DERIVED_FROM_ERC',    -- derived from an Earth-reference mirror, declared as derived
    'PROPOSED',            -- authored by this work for review; NOT fact
    'CHAIRMAN_AUTHORED',   -- fixed by Chairman decision
    'UNKNOWN'              -- open; no value may be presented
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type thy_csz_access_class as enum (
    'PUBLIC',              -- may appear on a public world sheet
    'HOUSEHOLD',           -- household-facing, not public
    'SERVICE',             -- service staff
    'RESTRICTED_SERVICE',  -- keyed / issued access only
    'SECURE'               -- security-sensitive; never published
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type thy_csz_name_authority as enum (
    'EDEREAIRAH_NATIVE',   -- first authority
    'ERC_MIRROR',          -- second authority, always labelled as mirror
    'WORKING_LABEL'        -- this work's handle; never a world name
  );
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------- serial registry

create table if not exists thy_csz_serial (
  serial          text primary key
                  check (serial ~ '^THY-CSZ-576-[0-9]{3}$'),
  subject_kind    text not null,
  subject_id      text not null,
  issued_at       timestamptz not null default now(),
  work_code       text not null default 'THY-WORK-KITCHEN-SUITE-RESIDENCE-576',
  unique (subject_kind, subject_id)
);

comment on table thy_csz_serial is
  'One serial per addressable subject in the 576 service-zone slice. The serial is the citation handle; it is not a claim of truth.';

-- ---------------------------------------------------------------- space intake

create table if not exists thy_csz_space_intake (
  stable_id            text primary key
                       check (stable_id ~ '^CSZ-[A-Z0-9]+-[0-9]{2}$'),
  serial               text not null references thy_csz_serial(serial),

  -- EDEREAIRAH FIRST. The native name slot is held open, not filled with invention.
  native_name          text,
  native_name_state    thy_csz_measurement_state not null default 'UNKNOWN',
  native_name_source   text not null default 'PENDING_thylora_mirror_name_registry',

  -- ERC SECOND. Always labelled as a mirror, never as the world name.
  erc_mirror           text not null,
  erc_mirror_note      text,

  working_label        text not null,
  function_text        text not null,

  width_m              numeric(6,2) check (width_m  is null or width_m  > 0),
  depth_m              numeric(6,2) check (depth_m  is null or depth_m  > 0),
  height_m             numeric(6,2) check (height_m is null or height_m > 0),
  wall_thickness_m     numeric(4,2) check (wall_thickness_m is null or wall_thickness_m > 0),
  dimension_state      thy_csz_measurement_state not null,
  dimension_basis      text not null,

  floor_text           text not null,
  floor_state          thy_csz_measurement_state not null,
  ceiling_text         text not null,
  ceiling_state        thy_csz_measurement_state not null,

  door_count           integer check (door_count   is null or door_count   >= 0),
  window_count         integer check (window_count is null or window_count >= 0),
  openings_text        text not null,
  openings_state       thy_csz_measurement_state not null,

  hearth_oven_water    text not null,
  services_state       thy_csz_measurement_state not null,

  access_class         thy_csz_access_class not null,
  public_safe          boolean not null,

  source_text          text not null,
  canon_conflict       boolean not null default false,
  notes                text,
  created_at           timestamptz not null default now(),

  -- A PROPOSED dimension may never be recorded as a documented fact, and a
  -- DOCUMENTED dimension may never cite this work as its source.
  constraint thy_csz_space_documented_needs_external_source
    check (dimension_state <> 'DOCUMENTED' or source_text !~* 'THY-WORK-KITCHEN-SUITE-RESIDENCE-576'),
  -- UNKNOWN means no number is carried at all. No silent zeros, no placeholders.
  constraint thy_csz_space_unknown_carries_no_numbers
    check (dimension_state <> 'UNKNOWN'
           or (width_m is null and depth_m is null and height_m is null and wall_thickness_m is null)),
  -- Security-sensitive topology is never public-safe.
  constraint thy_csz_space_secure_not_public
    check (not (public_safe and access_class in ('RESTRICTED_SERVICE','SECURE')))
);

comment on column thy_csz_space_intake.native_name is
  'EdereAirah native name. NULL with state UNKNOWN means the mirror-name registry was unreadable from the build session. An invented native name is a canon forgery and is not permitted here.';
comment on column thy_csz_space_intake.erc_mirror is
  'Earth-reference-continuum mirror label. Used to validate function and plausibility only. It is NOT the EdereAirah name and must not be published as one.';

-- ---------------------------------------------------------------- adjacency intake

do $$ begin
  create type thy_csz_connection_kind as enum (
    'DOOR','DOUBLE_DOOR','CART_DOOR','HATCH','ARCH','STAIR','PASSAGE','DRAIN','EXTERNAL_EDGE'
  );
exception when duplicate_object then null; end $$;

create table if not exists thy_csz_adjacency_intake (
  connection_id    text primary key
                   check (connection_id ~ '^CSZ-LINK-[0-9]{3}$'),
  serial           text not null references thy_csz_serial(serial),
  space_a          text not null references thy_csz_space_intake(stable_id),
  -- space_b may be an edge out of this slice (dining, yard, quarters above). Those
  -- are recorded as soft edges, never as invented rooms.
  space_b          text references thy_csz_space_intake(stable_id),
  external_edge    text,
  kind             thy_csz_connection_kind not null,
  clear_width_m    numeric(4,2) check (clear_width_m  is null or clear_width_m  > 0),
  clear_height_m   numeric(4,2) check (clear_height_m is null or clear_height_m > 0),
  dimension_state  thy_csz_measurement_state not null,
  direction_rule   text not null,
  access_class     thy_csz_access_class not null,
  public_safe      boolean not null,
  source_text      text not null,
  notes            text,
  constraint thy_csz_adjacency_has_other_end
    check ((space_b is null) <> (external_edge is null)),
  constraint thy_csz_adjacency_not_self
    check (space_b is null or space_b <> space_a),
  constraint thy_csz_adjacency_secure_not_public
    check (not (public_safe and access_class in ('RESTRICTED_SERVICE','SECURE'))),
  constraint thy_csz_adjacency_unknown_carries_no_numbers
    check (dimension_state <> 'UNKNOWN' or (clear_width_m is null and clear_height_m is null))
);

commit;
