-- THYLORA WORLD · 0005 · Circulation, traveller classes and solved routes
-- Workroom: WR-WORLD-CASTLE-001
--
-- "If stairs block a cart route: route FAILS. Do not visually hand-wave
--  impossible access."
--
-- Route solutions are STORED, with the constraint that failed them, so a later
-- version cannot quietly claim a route that was proved impossible. The reference
-- solver is world/lib/routes.js.

begin;

do $$ begin
  create type thyw_traveller_class as enum (
    'PEDESTRIAN','CHILD','HORSE','HORSE_AND_RIDER','CART','GUARD_PATROL',
    'STAFF_SERVICE','ROYAL_PROCESSION'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type thyw_segment_kind as enum ('PATH','ROAD','RAMP','STAIR','GATE','DOORWAY','COURTYARD','BRIDGE','SLOPE');
exception when duplicate_object then null; end $$;

do $$ begin
  create type thyw_route_verdict as enum ('PASS','FAIL','INDETERMINATE');
exception when duplicate_object then null; end $$;

create table if not exists thyw_traveller_profiles (
  class_code             thyw_traveller_class primary key,
  wheeled                boolean not null default false,
  step_capable           boolean not null default true,
  min_clear_width_mm     integer,
  min_clear_height_mm    integer,
  min_turning_radius_mm  integer,
  max_grade_permille     integer,
  axle_load_n            integer,
  max_step_rise_mm       integer,
  requires_handrail      boolean not null default false,
  period_profile_id      text,
  evidence_state         thyw_evidence_state not null default 'UNKNOWN',
  source_id              text references thyw_evidence_sources(source_id),
  note                   text,
  created_at             timestamptz not null default now(),
  constraint thyw_wheeled_is_not_step_capable check (not (wheeled and step_capable))
);

comment on constraint thyw_wheeled_is_not_step_capable on thyw_traveller_profiles is
  'A wheeled traveller cannot climb steps. This holds without any dimension being known and may not be configured away.';

create table if not exists thyw_circulation_nodes (
  node_id       text primary key,
  frame_id      text references thyw_world_frames(frame_id),
  room_id       text references thyw_rooms(room_id),
  x_mm          bigint,
  y_mm          bigint,
  z_mm          bigint,
  label         text,
  evidence_state thyw_evidence_state not null default 'UNKNOWN',
  source_id     text references thyw_evidence_sources(source_id),
  created_at    timestamptz not null default now()
);

create table if not exists thyw_gates (
  gate_id            text primary key,
  element_id         text references thyw_elements(element_id),
  clear_width_mm     integer,
  clear_height_mm    integer,
  threshold_rise_mm  integer,
  leaf_swing         text,
  evidence_state     thyw_evidence_state not null default 'UNKNOWN',
  source_id          text references thyw_evidence_sources(source_id),
  created_at         timestamptz not null default now()
);

create table if not exists thyw_circulation_segments (
  segment_id              text primary key,
  from_node_id            text not null references thyw_circulation_nodes(node_id),
  to_node_id              text not null references thyw_circulation_nodes(node_id),
  segment_kind            thyw_segment_kind not null default 'PATH',
  clear_width_mm          integer,
  clear_height_mm         integer,
  min_turning_radius_mm   integer,
  grade_permille          integer,
  surface_load_capacity_n integer,
  surface                 text,
  step_count              integer not null default 0,
  step_rise_mm            integer,
  gate_id                 text references thyw_gates(gate_id),
  evidence_state          thyw_evidence_state not null default 'UNKNOWN',
  source_id               text references thyw_evidence_sources(source_id),
  created_at              timestamptz not null default now(),
  constraint thyw_segment_not_reflexive check (from_node_id <> to_node_id),
  constraint thyw_segment_step_count_non_negative check (step_count >= 0),
  constraint thyw_stair_has_steps check (segment_kind <> 'STAIR' or step_count > 0),
  constraint thyw_gate_segment_names_a_gate check (segment_kind <> 'GATE' or gate_id is not null)
);

create table if not exists thyw_routes (
  route_id     text primary key,
  class_code   thyw_traveller_class not null,
  purpose      text,
  from_node_id text references thyw_circulation_nodes(node_id),
  to_node_id   text references thyw_circulation_nodes(node_id),
  created_at   timestamptz not null default now()
);

create table if not exists thyw_route_segments (
  route_id    text not null references thyw_routes(route_id) on delete cascade,
  ordinal     integer not null,
  segment_id  text not null references thyw_circulation_segments(segment_id),
  primary key (route_id, ordinal),
  constraint thyw_route_ordinal_positive check (ordinal >= 1)
);

create table if not exists thyw_route_solutions (
  solution_id   uuid primary key default gen_random_uuid(),
  route_id      text not null references thyw_routes(route_id) on delete cascade,
  verdict       thyw_route_verdict not null,
  solved_at     timestamptz not null default now(),
  solver_ref    text not null default 'world/lib/routes.js',
  world_version_id text,
  statement     text not null
);

create table if not exists thyw_route_solution_constraints (
  constraint_row_id uuid primary key default gen_random_uuid(),
  solution_id  uuid not null references thyw_route_solutions(solution_id) on delete cascade,
  segment_id   text not null,
  constraint_code text not null,
  verdict      thyw_route_verdict not null,
  required_value text,
  measured_value text,
  note         text
);

-- A PASS may not be recorded while any of its constraints is INDETERMINATE.
-- An unproved route is not a route.
create or replace function thyw_assert_pass_is_fully_measured() returns trigger
language plpgsql as $$
declare bad integer;
begin
  select count(*) into bad
    from thyw_route_solution_constraints c
    join thyw_route_solutions s on s.solution_id = c.solution_id
   where c.solution_id = new.solution_id
     and s.verdict = 'PASS'
     and c.verdict <> 'PASS';
  if bad > 0 then
    raise exception 'THYW: route solution % is recorded PASS but carries % non-PASS constraint(s)',
      new.solution_id, bad using errcode = '23514';
  end if;
  return new;
end $$;

drop trigger if exists thyw_route_constraints_guard on thyw_route_solution_constraints;
create trigger thyw_route_constraints_guard
  after insert or update on thyw_route_solution_constraints
  for each row execute function thyw_assert_pass_is_fully_measured();

commit;
