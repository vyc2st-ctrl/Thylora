-- THYLORA WORLD · 0003 · Procedural masonry
-- Workroom: WR-WORLD-CASTLE-001
--
-- The directive allows individual masonry to be stored explicitly OR generated
-- as deterministic procedural instances, and requires that the same seed and
-- spec reproduce the same wall exactly. Both paths exist here:
--   thyw_masonry_specs     the generative record (seed + every parameter)
--   thyw_masonry_instances the explicit record, for units that are surveyed
--                          individually or deliberately placed by hand
--
-- The reference implementation of the generator is world/lib/masonry.js. Its
-- fingerprint is stored on the spec so a later regeneration can be checked
-- against the wall that was approved, rather than trusted.

begin;

do $$ begin
  create type thyw_bond_pattern as enum (
    'STRETCHER','ENGLISH_GARDEN_WALL','HEADER','FLEMISH','RUNNING_THIRD','STACK','RANDOM_RUBBLE'
  );
exception when duplicate_object then null; end $$;

create table if not exists thyw_masonry_specs (
  spec_id              text primary key,
  host_element_id      text references thyw_elements(element_id),
  seed                 numeric(20,0) not null,
  unit_length_mm       integer,
  unit_height_mm       integer,
  unit_depth_mm        integer,
  mortar_bed_mm        integer,
  mortar_perpend_mm    integer,
  bond                 thyw_bond_pattern not null default 'STRETCHER',
  material_id          text references thyw_materials(material_id),
  bounds_length_mm     bigint,
  bounds_height_mm     bigint,
  length_jitter_mm     integer not null default 0,
  height_jitter_mm     integer not null default 0,
  depth_jitter_mm      integer not null default 0,
  yaw_jitter_mdeg      integer not null default 0,
  spall_probability_bp integer not null default 0,
  weathering_rule      text not null default 'NONE',
  build_phase_id       text references thyw_build_phases(build_phase_id),
  crew_class           text not null default 'UNKNOWN',
  generator_ref        text not null default 'world/lib/masonry.js',
  wall_fingerprint     text,
  evidence_state       thyw_evidence_state not null default 'PROPOSED',
  source_id            text references thyw_evidence_sources(source_id),
  created_at           timestamptz not null default now(),
  constraint thyw_masonry_seed_non_negative check (seed >= 0),
  constraint thyw_masonry_units_positive
    check (coalesce(unit_length_mm, 1) > 0 and coalesce(unit_height_mm, 1) > 0),
  constraint thyw_masonry_mortar_non_negative
    check (coalesce(mortar_bed_mm, 0) >= 0 and coalesce(mortar_perpend_mm, 0) >= 0),
  constraint thyw_masonry_jitter_non_negative
    check (length_jitter_mm >= 0 and height_jitter_mm >= 0 and depth_jitter_mm >= 0 and yaw_jitter_mdeg >= 0),
  constraint thyw_masonry_spall_is_basis_points
    check (spall_probability_bp between 0 and 10000),
  -- A fingerprint is a claim that a specific wall was generated. It cannot be
  -- made while the spec is missing a number the generator needs.
  constraint thyw_masonry_fingerprint_needs_a_resolvable_spec
    check (wall_fingerprint is null or (
      unit_length_mm is not null and unit_height_mm is not null and unit_depth_mm is not null
      and mortar_bed_mm is not null and mortar_perpend_mm is not null
      and bounds_length_mm is not null and bounds_height_mm is not null))
);

comment on constraint thyw_masonry_fingerprint_needs_a_resolvable_spec on thyw_masonry_specs is
  'A wall fingerprint may not be recorded for a spec that cannot generate. An unresolvable spec generates HELD_UNKNOWN, not a default wall.';

create table if not exists thyw_masonry_instances (
  unit_id         text primary key,
  spec_id         text references thyw_masonry_specs(spec_id),
  host_element_id text references thyw_elements(element_id),
  course_index    integer not null,
  unit_index      integer not null,
  x_mm            bigint not null,
  z_mm            bigint not null,
  length_mm       integer not null,
  height_mm       integer not null,
  depth_mm        integer,
  yaw_mdeg        integer not null default 0,
  clipped         boolean not null default false,
  spalled         boolean not null default false,
  material_id     text references thyw_materials(material_id),
  build_phase_id  text references thyw_build_phases(build_phase_id),
  crew_class      text not null default 'UNKNOWN',
  storage_mode    text not null default 'EXPLICIT',
  evidence_state  thyw_evidence_state not null default 'PROPOSED',
  source_id       text references thyw_evidence_sources(source_id),
  created_at      timestamptz not null default now(),
  constraint thyw_masonry_instance_indices_non_negative check (course_index >= 0 and unit_index >= 0),
  constraint thyw_masonry_instance_storage_mode check (storage_mode in ('EXPLICIT','GENERATED')),
  constraint thyw_masonry_generated_needs_spec check (storage_mode <> 'GENERATED' or spec_id is not null),
  unique (spec_id, course_index, unit_index)
);

create index if not exists thyw_masonry_instances_host_idx on thyw_masonry_instances(host_element_id);

commit;
