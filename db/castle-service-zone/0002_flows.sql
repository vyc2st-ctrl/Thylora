-- CASTLE SERVICE ZONE · 0002 · Flow paths: delivery/food, herb, scullery/wash, waste
-- Workroom: WR-CASTLE-SERVICE-ZONE-576
--
-- A flow is only real if every step fits the rooms physically. Each step therefore
-- carries the link it traverses, the load it moves and a fit verdict. A step whose
-- link cannot carry the load is recorded as FAILS_FIT, not quietly dropped.

begin;

do $$ begin
  create type thy_csz_flow_class as enum ('FOOD_IN','HERB','WASH_RETURN','WASTE','PERSON');
exception when duplicate_object then null; end $$;

do $$ begin
  create type thy_csz_fit_verdict as enum ('FITS','FITS_WITH_CONDITION','FAILS_FIT','UNVERIFIED');
exception when duplicate_object then null; end $$;

create table if not exists thy_csz_flow (
  flow_id        text primary key check (flow_id ~ '^CSZ-FLOW-[A-Z0-9-]+$'),
  serial         text not null references thy_csz_serial(serial),
  flow_class     thy_csz_flow_class not null,
  title          text not null,
  purpose        text not null,
  access_class   thy_csz_access_class not null,
  public_safe    boolean not null,
  source_text    text not null,
  constraint thy_csz_flow_secure_not_public
    check (not (public_safe and access_class in ('RESTRICTED_SERVICE','SECURE')))
);

create table if not exists thy_csz_flow_step (
  flow_id        text not null references thy_csz_flow(flow_id) on delete cascade,
  step_no        integer not null check (step_no > 0),
  action         text not null,
  from_space     text references thy_csz_space_intake(stable_id),
  to_space       text references thy_csz_space_intake(stable_id),
  external_from  text,
  external_to    text,
  via_link       text references thy_csz_adjacency_intake(connection_id),
  load_text      text not null,
  fit_verdict    thy_csz_fit_verdict not null,
  fit_reason     text not null,
  custodian_role text not null,
  duration_state thy_csz_measurement_state not null default 'UNKNOWN',
  notes          text,
  primary key (flow_id, step_no),
  -- A step must start somewhere and end somewhere.
  constraint thy_csz_step_has_origin      check (num_nonnulls(from_space, external_from) = 1),
  constraint thy_csz_step_has_destination check (num_nonnulls(to_space,   external_to)   = 1),
  -- A movement between two rooms inside the slice must name the link it uses.
  constraint thy_csz_step_internal_needs_link
    check (from_space is null or to_space is null or from_space = to_space or via_link is not null),
  -- "FITS" is a claim about physical clearance. It may not be asserted without a reason.
  constraint thy_csz_step_fit_reason_present check (length(btrim(fit_reason)) > 0)
);

-- ---------------------------------------------------------------- herb residence

-- Where the herb physically IS at each state of its path. One row per state, so the
-- question "where is the rosemary right now" always has a located answer.
create table if not exists thy_csz_herb_state (
  herb_state_id   text primary key check (herb_state_id ~ '^CSZ-HERB-[0-9]{2}$'),
  serial          text not null references thy_csz_serial(serial),
  state_name      text not null,
  state_order     integer not null check (state_order > 0),
  resides_space   text references thy_csz_space_intake(stable_id),
  resides_external text,
  resides_detail  text not null,       -- the exact fixture: bench, rack, crock, basket
  herb_form       text not null,       -- growing / cut fresh / cleaned / drying / dried / spent
  custodian_role  text not null,
  location_state  thy_csz_measurement_state not null,
  notes           text,
  unique (state_order),
  constraint thy_csz_herb_located check (num_nonnulls(resides_space, resides_external) = 1)
);

comment on table thy_csz_herb_state is
  'The named herb of this slice is recorded as NATIVE_HERB_UNRESOLVED. Rosemary is carried only as an ERC mirror for function (woody evergreen, dries well, hangs in bunches). Naming an EdereAirah plant is not this work''s to do.';

commit;
