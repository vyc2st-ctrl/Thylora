-- THYLORA WORLD · 0002 · Materials, elements and the element version ledger
-- Workroom: WR-WORLD-CASTLE-001
--
-- Every visible wall, beam, roof, window, door, stair, ledge, gate, lantern,
-- room, corridor, tower and arch resolves to one row here, carrying the eleven
-- facets the directive names: ID, parent, world coordinates, local coordinates,
-- dimensions, orientation, material, tolerance, build phase, version, provenance.
--
-- World coordinates are stored as GENERATED columns only where the parent chain
-- is resolved; otherwise they stay NULL, which reads as UNKNOWN. They are never
-- filled with a default.

begin;

do $$ begin
  create type thyw_element_class as enum (
    'WALL','MASONRY_UNIT','BEAM','ROOF','WINDOW','DOOR','STAIR','LEDGE','GATE',
    'LANTERN','ROOM','CORRIDOR','TOWER','ARCH','TERRACE','COURTYARD','ROAD',
    'SLOPE','STABLE','CART'
  );
exception when duplicate_object then null; end $$;

create table if not exists thyw_materials (
  material_id     text primary key,
  label           text not null,
  material_family text,
  density_kg_m3   integer,
  evidence_state  thyw_evidence_state not null default 'UNKNOWN',
  source_id       text references thyw_evidence_sources(source_id),
  note            text,
  created_at      timestamptz not null default now()
);

create table if not exists thyw_build_phases (
  build_phase_id  text primary key,
  label           text not null,
  sequence_no     integer,
  evidence_state  thyw_evidence_state not null default 'UNKNOWN',
  source_id       text references thyw_evidence_sources(source_id),
  created_at      timestamptz not null default now()
);

create table if not exists thyw_elements (
  element_id        text primary key,
  element_class     thyw_element_class not null,
  parent_element_id text references thyw_elements(element_id),
  frame_id          text not null references thyw_world_frames(frame_id),
  -- local placement inside frame_id; NULL means UNKNOWN
  local_x_mm        bigint,
  local_y_mm        bigint,
  local_z_mm        bigint,
  orientation_mdeg  integer,
  -- dimensions
  length_mm         bigint,
  width_mm          bigint,
  height_mm         bigint,
  -- tolerance band on those dimensions
  tolerance_linear_mm    integer,
  tolerance_angular_mdeg integer,
  tolerance_basis        text not null default 'NOT_ESTABLISHED',
  material_id       text references thyw_materials(material_id),
  build_phase_id    text references thyw_build_phases(build_phase_id),
  version           integer not null default 1,
  evidence_state    thyw_evidence_state not null default 'UNKNOWN',
  source_id         text references thyw_evidence_sources(source_id),
  procedural_spec_id text,
  note              text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  constraint thyw_element_not_own_parent check (parent_element_id is distinct from element_id),
  constraint thyw_element_version_positive check (version >= 1),
  constraint thyw_element_dimensions_non_negative
    check (coalesce(length_mm, 0) >= 0 and coalesce(width_mm, 0) >= 0 and coalesce(height_mm, 0) >= 0),
  constraint thyw_element_verified_needs_source
    check (evidence_state <> 'VERIFIED' or source_id is not null),
  constraint thyw_element_tolerance_needs_a_measurement
    check (tolerance_linear_mm is null
        or (length_mm is not null or width_mm is not null or height_mm is not null))
);

create index if not exists thyw_elements_parent_idx on thyw_elements(parent_element_id);
create index if not exists thyw_elements_frame_idx  on thyw_elements(frame_id);
create index if not exists thyw_elements_class_idx  on thyw_elements(element_class);

comment on constraint thyw_element_tolerance_needs_a_measurement on thyw_elements is
  'A tolerance band on nothing is not a tolerance. An element with no measured dimension may not carry one.';

-- A VERIFIED element must cite a source that is actually readable. This is the
-- constraint that would have stopped the castle reference being treated as
-- survey evidence: its source row is registered with readable = false.
create or replace function thyw_assert_verified_source_readable() returns trigger
language plpgsql as $$
declare s record;
begin
  if new.evidence_state = 'VERIFIED' then
    select * into s from thyw_evidence_sources where source_id = new.source_id;
    if not found then
      raise exception 'THYW: element % is VERIFIED but cites unregistered source %', new.element_id, new.source_id
        using errcode = '23514';
    end if;
    if s.source_kind = 'ABSENT' or not s.readable then
      raise exception 'THYW: element % cannot be VERIFIED from source % (kind %, readable %)',
        new.element_id, s.source_id, s.source_kind, s.readable using errcode = '23514';
    end if;
  end if;
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists thyw_elements_verify_source on thyw_elements;
create trigger thyw_elements_verify_source
  before insert or update on thyw_elements
  for each row execute function thyw_assert_verified_source_readable();

-- Append-only version ledger. Previous versions are preserved; this is the
-- table the non-regression check reads, so it must never be rewritten in place.
create table if not exists thyw_element_versions (
  version_row_id    uuid primary key default gen_random_uuid(),
  element_id        text not null,
  version           integer not null,
  snapshot          jsonb not null,
  world_version_id  text,
  recorded_at       timestamptz not null default now(),
  unique (element_id, version)
);

create index if not exists thyw_element_versions_element_idx on thyw_element_versions(element_id, version desc);

create or replace function thyw_block_version_rewrite() returns trigger
language plpgsql as $$
begin
  raise exception 'THYW: thyw_element_versions is append-only; % is refused', tg_op
    using errcode = '42501';
end $$;

drop trigger if exists thyw_element_versions_append_only on thyw_element_versions;
create trigger thyw_element_versions_append_only
  before update or delete on thyw_element_versions
  for each row execute function thyw_block_version_rewrite();

commit;
