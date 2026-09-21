-- 0006 · Helping-community system.
-- Every stop can create useful work. Participants are guests who work.
-- They are not conquerors, patrons, missionaries or inspectors.

begin;

create table if not exists thytr_help_kind (
  help_code           text primary key,
  help_label          text not null,
  help_group          text not null
                      check (help_group in ('INFRASTRUCTURE','AGRICULTURE','TRANSPORT','EMERGENCY','CRAFT','CARE')),
  typical_crew        integer not null default 2 check (typical_crew >= 1),
  needs_local_lead    boolean not null default true,
  note                text
);

insert into thytr_help_kind (help_code, help_label, help_group, typical_crew, needs_local_lead, note) values
  ('BRIDGE_REPAIR',   'Repair a bridge',                 'INFRASTRUCTURE', 6, true,  'Timber, stone or rope. Local lead decides the method; the team supplies hands and iron.'),
  ('ROOF_REPAIR',     'Repair a roof',                   'INFRASTRUCTURE', 4, true,  null),
  ('WELL_OR_WATER',   'Repair a well or water course',   'INFRASTRUCTURE', 4, true,  null),
  ('FARM_HELP',       'Help a farm',                     'AGRICULTURE',    6, true,  'Harvest, fencing, ditching, stock moving. Season decides the work.'),
  ('ISOLATED_FAMILY', 'Help an isolated family',         'CARE',           3, true,  'Fuel, water, food store, repair. Quietly, and only if welcome.'),
  ('CART_REPAIR',     'Repair a cart',                   'TRANSPORT',      2, false, 'The repair caravan already carries the tools.'),
  ('SUPPLY_HAUL',     'Transport supplies',              'TRANSPORT',      4, true,  'The Run''s greatest ordinary usefulness: it already has vehicles and animals on the road.'),
  ('MEDICINE_RUN',    'Deliver medicine',                'EMERGENCY',      2, true,  'Era-available medicine only.'),
  ('FLOOD_RESPONSE',  'Help during flood',               'EMERGENCY',     10, true,  'Preserve life first. Competition standing is suspended, not lost.'),
  ('FIRE_RESPONSE',   'Help during fire',                'EMERGENCY',     10, true,  'Preserve life first. Competition standing is suspended, not lost.'),
  ('WORKSHOP_ASSIST', 'Assist a local workshop',         'CRAFT',          2, true,  'Hands and materials, under the local craftsman''s direction.')
on conflict (help_code) do nothing;

-- ---------------------------------------------------------------------------
-- Help order. Requested or accepted by the community; never imposed.
-- ---------------------------------------------------------------------------
create table if not exists thytr_help_order (
  order_id            uuid primary key default gen_random_uuid(),
  run_code            text not null references thytr_run(run_code),
  team_code           text not null references thytr_team(team_code),
  stop_id             uuid references thytr_stop(stop_id),
  community_code      text references thytr_host_community(community_code),
  help_code           text not null references thytr_help_kind(help_code),

  -- origin of the work
  requested_by        text not null default 'LOCAL'
                      check (requested_by in ('LOCAL','HOST_HOME','LOCAL_AUTHORITY','TEAM_OFFERED')),
  local_consent       boolean not null default false,
  local_lead_role     text,                        -- descriptive local role, not a personal name

  -- what was actually done
  crew_assigned       integer not null default 0 check (crew_assigned >= 0),
  hours_worked        numeric(7,2) not null default 0 check (hours_worked >= 0),
  materials_paid_minor bigint not null default 0 check (materials_paid_minor >= 0),
  materials_taken_locally boolean not null default false,
  left_behind_note    text,

  -- guards against extraction
  payment_taken_from_local boolean not null default false
                      check (payment_taken_from_local = false),
  local_labour_unpaid boolean not null default false
                      check (local_labour_unpaid = false),
  filmed_without_consent boolean not null default false
                      check (filmed_without_consent = false),

  -- verification
  verified_by_community boolean not null default false,
  verified_by_witness_keeper boolean not null default false,
  verification_note   text,

  order_state         text not null default 'PROPOSED'
                      check (order_state in (
                        'PROPOSED','ACCEPTED','DECLINED','IN_PROGRESS','COMPLETE','VERIFIED','WITHDRAWN')),
  opened_at           timestamptz not null default now(),
  closed_at           timestamptz
);

comment on column thytr_help_order.payment_taken_from_local is
  'Locked false. Help is given. It is never invoiced to the people helped, and it never becomes a claim on their land, labour, goods or standing.';

comment on column thytr_help_order.requested_by is
  'TEAM_OFFERED is permitted but still requires local_consent before the order may leave PROPOSED. An offer is not a mandate.';

-- Consent gate: nothing proceeds without it.
alter table thytr_help_order drop constraint if exists thytr_help_order_consent_gate;
alter table thytr_help_order add constraint thytr_help_order_consent_gate
  check (order_state in ('PROPOSED','DECLINED','WITHDRAWN') or local_consent);

-- Materials taken locally must be paid for.
alter table thytr_help_order drop constraint if exists thytr_help_order_materials_paid;
alter table thytr_help_order add constraint thytr_help_order_materials_paid
  check (not materials_taken_locally or materials_paid_minor > 0);

-- VERIFIED requires both the community and the witness keeper.
alter table thytr_help_order drop constraint if exists thytr_help_order_double_verify;
alter table thytr_help_order add constraint thytr_help_order_double_verify
  check (order_state <> 'VERIFIED' or (verified_by_community and verified_by_witness_keeper));

create index if not exists thytr_help_order_run_idx on thytr_help_order (run_code, order_state);

-- ---------------------------------------------------------------------------
-- Emergency lane. Preserve life before competition.
-- ---------------------------------------------------------------------------
create table if not exists thytr_emergency_response (
  emergency_id        uuid primary key default gen_random_uuid(),
  run_code            text not null references thytr_run(run_code),
  team_code           text references thytr_team(team_code),
  leg_id              uuid references thytr_leg(leg_id),
  emergency_kind      text not null
                      check (emergency_kind in ('FLOOD','FIRE','STORM','COLLAPSE','ILLNESS','INJURY','MISSING_PERSON','FAMINE')),
  lives_at_risk       boolean not null default true,
  run_standing_suspended boolean not null default true,
  run_standing_lost   boolean not null default false
                      check (run_standing_lost = false),
  responded_at        timestamptz not null default now(),
  stood_down_at       timestamptz
);

comment on column thytr_emergency_response.run_standing_lost is
  'Locked false. A team never loses standing for stopping to preserve life. Standing is suspended for the duration and restored on stand-down.';

commit;
