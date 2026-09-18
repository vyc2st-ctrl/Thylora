-- THYLORA WORLD · 0004 · Storeys, rooms, openings and the window/room rule
-- Workroom: WR-WORLD-CASTLE-001
--
--   VISIBLE WINDOW => REAL ROOM
--   VISIBLE DOOR   => REAL CONNECTED SPACE
--
-- This is enforced by the database, not by documentation. A window row whose
-- inner space does not exist cannot be committed. That is the difference between
-- a castle that has rooms and a facade that has painted windows.

begin;

do $$ begin
  create type thyw_opening_kind as enum ('WINDOW','DOOR','GATE','ARCH');
exception when duplicate_object then null; end $$;

do $$ begin
  create type thyw_zone_class as enum (
    'ROYAL_PRIVATE','ROYAL_RECEIVING','FAMILY','LEARNING_TUTORIAL','GUEST',
    'GUARD','STAFF_QUARTERS','SERVICE','KITCHEN','STORAGE','ARCHIVE_RECORD',
    'STABLE','CART_REPAIR','WORKSHOP','COURTYARD','CIRCULATION','UNASSIGNED'
  );
exception when duplicate_object then null; end $$;

create table if not exists thyw_storeys (
  storey_id        text primary key,
  frame_id         text not null references thyw_world_frames(frame_id),
  structure_element_id text references thyw_elements(element_id),
  level_index      integer,
  elevation_above_datum_mm bigint,
  label            text,
  evidence_state   thyw_evidence_state not null default 'UNKNOWN',
  source_id        text references thyw_evidence_sources(source_id),
  created_at       timestamptz not null default now()
);

create table if not exists thyw_rooms (
  room_id           text primary key,
  storey_id         text references thyw_storeys(storey_id),
  frame_id          text not null references thyw_world_frames(frame_id),
  length_mm         bigint,
  width_mm          bigint,
  ceiling_height_mm bigint,
  purpose           text,
  zone_class        thyw_zone_class not null default 'UNASSIGNED',
  period_state      text,
  furnishing_state  text,
  evidence_state    thyw_evidence_state not null default 'UNKNOWN',
  source_id         text references thyw_evidence_sources(source_id),
  note              text,
  created_at        timestamptz not null default now(),
  constraint thyw_room_dimensions_non_negative
    check (coalesce(length_mm,0) >= 0 and coalesce(width_mm,0) >= 0 and coalesce(ceiling_height_mm,0) >= 0),
  constraint thyw_room_verified_needs_source
    check (evidence_state <> 'VERIFIED' or source_id is not null)
);

create table if not exists thyw_room_occupants (
  occupancy_id  uuid primary key default gen_random_uuid(),
  room_id       text not null references thyw_rooms(room_id) on delete cascade,
  occupant_class text not null,
  occupant_ref  text,
  period_state  text,
  evidence_state thyw_evidence_state not null default 'UNKNOWN',
  source_id     text references thyw_evidence_sources(source_id),
  created_at    timestamptz not null default now()
);

create table if not exists thyw_room_lighting (
  lighting_id    uuid primary key default gen_random_uuid(),
  room_id        text not null references thyw_rooms(room_id) on delete cascade,
  lighting_kind  text not null,
  period_profile_id text,
  admitted       boolean,
  evidence_state thyw_evidence_state not null default 'UNKNOWN',
  source_id      text references thyw_evidence_sources(source_id),
  created_at     timestamptz not null default now()
);

-- An opening's inner and outer sides both name a space. A space is a room or a
-- registered exterior space element (courtyard, terrace, road).
create table if not exists thyw_openings (
  opening_id       text primary key,
  opening_kind     thyw_opening_kind not null,
  host_element_id  text references thyw_elements(element_id),
  frame_id         text not null references thyw_world_frames(frame_id),
  inner_room_id    text references thyw_rooms(room_id),
  inner_space_element_id text references thyw_elements(element_id),
  outer_room_id    text references thyw_rooms(room_id),
  outer_space_element_id text references thyw_elements(element_id),
  clear_width_mm   integer,
  clear_height_mm  integer,
  sill_height_mm   integer,
  threshold_rise_mm integer,
  evidence_state   thyw_evidence_state not null default 'UNKNOWN',
  source_id        text references thyw_evidence_sources(source_id),
  note             text,
  created_at       timestamptz not null default now(),

  -- VISIBLE WINDOW => REAL ROOM. VISIBLE DOOR => REAL CONNECTED SPACE.
  constraint thyw_opening_has_an_inner_space
    check (inner_room_id is not null or inner_space_element_id is not null),
  constraint thyw_door_or_gate_connects_two_spaces
    check (opening_kind = 'WINDOW'
        or outer_room_id is not null or outer_space_element_id is not null),
  constraint thyw_opening_sides_are_distinct
    check (inner_room_id is null or outer_room_id is null or inner_room_id <> outer_room_id),
  constraint thyw_opening_dimensions_non_negative
    check (coalesce(clear_width_mm,0) >= 0 and coalesce(clear_height_mm,0) >= 0)
);

create index if not exists thyw_openings_inner_room_idx on thyw_openings(inner_room_id);
create index if not exists thyw_openings_host_idx on thyw_openings(host_element_id);

comment on constraint thyw_opening_has_an_inner_space on thyw_openings is
  'VISIBLE WINDOW => REAL ROOM. An opening with nothing behind it is a painted window and cannot be committed.';
comment on constraint thyw_door_or_gate_connects_two_spaces on thyw_openings is
  'VISIBLE DOOR => REAL CONNECTED SPACE. A door must join two real spaces.';

-- Room adjacency, derived from openings but stored so route solving does not
-- have to re-derive it on every query.
create table if not exists thyw_room_links (
  link_id     uuid primary key default gen_random_uuid(),
  from_room_id text not null references thyw_rooms(room_id) on delete cascade,
  to_room_id   text not null references thyw_rooms(room_id) on delete cascade,
  via_opening_id text references thyw_openings(opening_id),
  evidence_state thyw_evidence_state not null default 'UNKNOWN',
  created_at  timestamptz not null default now(),
  constraint thyw_room_link_not_reflexive check (from_room_id <> to_room_id),
  unique (from_room_id, to_room_id, via_opening_id)
);

-- Room-use proposals. PROPOSED uses live here and NEVER in thyw_rooms.purpose,
-- so a proposal can never be mistaken for an assignment.
create table if not exists thyw_room_use_proposals (
  proposal_id   text primary key,
  room_id       text not null references thyw_rooms(room_id) on delete cascade,
  proposed_use  text not null,
  label         text not null,
  rationale     text not null,
  implications  text not null,
  zone_class    thyw_zone_class not null default 'UNASSIGNED',
  selected      boolean not null default false,
  selected_by   text,
  selected_at   timestamptz,
  created_at    timestamptz not null default now(),
  constraint thyw_room_use_selection_is_chairman
    check (not selected or (selected_by = 'CHAIRMAN' and selected_at is not null))
);

comment on constraint thyw_room_use_selection_is_chairman on thyw_room_use_proposals is
  'A proposed room use becomes a selection only by the Chairman, with a timestamp. Nothing else may promote it.';

commit;
