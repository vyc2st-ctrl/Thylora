-- 0002 · Teams, crew slots, helpers/workers, local helpers, security, medical.
-- Crew are recorded as ROLE SLOTS. Personal names are not invented here.
-- A slot is filled by a person record only when a real person exists for it.

begin;

create table if not exists thytr_team (
  team_code           text primary key,           -- e.g. THY-TIME-RUN-001-TEAM-A
  run_code            text not null references thytr_run(run_code),
  team_label          text not null,
  team_size_planned   integer not null check (team_size_planned between 8 and 26),
  team_size_current   integer not null default 0 check (team_size_current >= 0),
  invited_by_crown    boolean not null default true,
  host_community_ref  text,                       -- soft ref, see 0004
  team_state          text not null default 'FORMING'
                      check (team_state in (
                        'FORMING','READY','TRAVELLING','HELD','WITHDRAWN','CLOSED')),
  constraint thytr_team_size_bounds
    check (team_size_current <= team_size_planned + 4)
);

comment on column thytr_team.team_size_planned is
  'Operational band for a 1700s road team: 8 minimum to move and repair a caravan safely, 26 maximum before lodging and feeding stop being absorbable by a host community. Chairman may seal a different band per run.';

-- ---------------------------------------------------------------------------
-- Crew roles. Fixed vocabulary. Every role is a job that must be covered
-- before a team is READY.
-- ---------------------------------------------------------------------------
create table if not exists thytr_crew_role (
  role_code           text primary key,
  role_label          text not null,
  role_group          text not null
                      check (role_group in (
                        'COMMAND','DRIVE','MECHANICAL','ANIMAL','SUPPLY',
                        'MEDICAL','COMMUNICATION','LOCAL','SECURITY','RECORD')),
  minimum_per_team    integer not null default 1 check (minimum_per_team >= 0),
  required_for_ready  boolean not null default true,
  era_scope           text not null default 'ALL',   -- 'ALL' or an era_code
  role_note           text
);

insert into thytr_crew_role (role_code, role_label, role_group, minimum_per_team, required_for_ready, era_scope, role_note) values
  ('ROAD_CAPTAIN',      'Road captain',            'COMMAND',       1, true,  'ALL', 'Holds the route, calls halts, answers for the team to hosts and to local law.'),
  ('SECOND',            'Second',                  'COMMAND',       1, true,  'ALL', 'Takes command when the road captain is asleep, injured or absent. No single point of failure.'),
  ('DRIVER',            'Driver',                  'DRIVE',         2, true,  'ALL', 'One per moving vehicle plus one relief. Safe speed only.'),
  ('WHEELWRIGHT',       'Wheelwright',             'MECHANICAL',    1, true,  '1700S', 'Wheels, axles, hubs, tyres. The single most common road failure in buggy era.'),
  ('SMITH',             'Smith',                   'MECHANICAL',    1, true,  '1700S', 'Iron work, shoeing, bracket and spring repair. Travels with the repair caravan.'),
  ('HARNESS_MAKER',     'Harness and leather',     'MECHANICAL',    1, false, '1700S', 'Harness, traces, straps, boots, repairs for host communities too.'),
  ('MECHANIC',          'Mechanic',                'MECHANICAL',    1, true,  'MOTOR', 'Motor-era equivalent of wheelwright and smith combined.'),
  ('HOSTLER',           'Hostler / animal lead',   'ANIMAL',        1, true,  '1700S', 'Answerable for every animal on the run. Can stop the run for an animal.'),
  ('GROOM',             'Groom',                   'ANIMAL',        2, true,  '1700S', 'Feed, water, hooves, rest, injury watch.'),
  ('FARRIER',           'Farrier',                 'ANIMAL',        1, false, '1700S', 'May be shared with a host community or hired locally.'),
  ('QUARTERMASTER',     'Quartermaster',           'SUPPLY',        1, true,  'ALL', 'Food, water, fodder, fuel, period money, clothing issue, ledger.'),
  ('COOK',              'Cook',                    'SUPPLY',        1, true,  'ALL', 'Feeds crew and, where welcome, shares with the host table.'),
  ('SURGEON',           'Surgeon / medical lead',  'MEDICAL',       1, true,  'ALL', 'Era-appropriate practice. Holds the preserve-life rule above the race.'),
  ('MEDICAL_ASSISTANT', 'Medical assistant',       'MEDICAL',       1, false, 'ALL', null),
  ('RUNNER',            'Runner / courier',        'COMMUNICATION', 2, true,  '1700S', 'Communications are era-bound: rider, written note, signal, town post.'),
  ('SIGNALLER',         'Signaller',               'COMMUNICATION', 1, false, 'ALL', 'Era-permitted signalling only. No later-era capability.'),
  ('LOCAL_GUIDE',       'Local guide',             'LOCAL',         1, true,  'ALL', 'Engaged and paid locally. Knows the road, the water, the law and the people.'),
  ('INTERPRETER',       'Interpreter',             'LOCAL',         0, false, 'ALL', null),
  ('ESCORT',            'Escort / security',       'SECURITY',      2, true,  'ALL', 'Protects people and cargo. Does not police host communities.'),
  ('WITNESS_KEEPER',    'Witness keeper',          'RECORD',        1, true,  'ALL', 'Keeps the help ledger, the money ledger and the event record. Cannot also hold command.')
on conflict (role_code) do nothing;

-- ---------------------------------------------------------------------------
-- Crew slot. The assignment surface. person_ref is a SOFT reference and may
-- stay null: an unfilled slot is a real, reportable operational fact.
-- ---------------------------------------------------------------------------
create table if not exists thytr_crew_slot (
  slot_id             uuid primary key default gen_random_uuid(),
  team_code           text not null references thytr_team(team_code) on delete cascade,
  role_code           text not null references thytr_crew_role(role_code),
  slot_index          integer not null check (slot_index >= 0),
  person_ref          text,                       -- soft ref; null = unfilled
  engagement_kind     text not null default 'TRAVELLING_CREW'
                      check (engagement_kind in (
                        'TRAVELLING_CREW','HELPER','WORKER','LOCAL_HIRE','HOST_LOANED')),
  paid_in_era_money   boolean not null default true,
  pay_rate_minor      bigint check (pay_rate_minor is null or pay_rate_minor >= 0),
  consent_recorded    boolean not null default false,
  slot_state          text not null default 'OPEN'
                      check (slot_state in (
                        'OPEN','FILLED','STOOD_DOWN','INJURED','DECEASED','RELEASED')),
  unique (team_code, role_code, slot_index)
);

comment on column thytr_crew_slot.engagement_kind is
  'HELPER and WORKER are people who travel with or join the team. LOCAL_HIRE is a person engaged at a stop, paid in era money, released at the next stop unless they choose otherwise. No unpaid local labour.';

-- A local hire without recorded consent and era pay is not a valid engagement.
alter table thytr_crew_slot drop constraint if exists thytr_crew_slot_local_fair;
alter table thytr_crew_slot add constraint thytr_crew_slot_local_fair
  check (
    engagement_kind <> 'LOCAL_HIRE'
    or (consent_recorded and paid_in_era_money and pay_rate_minor is not null)
  );

commit;
