-- 0004 · Host homes, host communities, lodging, host-home rules.
-- Invitation is a privilege. It creates no ownership, no entitlement, and no
-- permission to exploit a household or a community.

begin;

create table if not exists thytr_host_community (
  community_code      text primary key,           -- e.g. THY-TIME-RUN-001-HC-02
  run_code            text not null references thytr_run(run_code),
  era_code            text not null references thytr_era_profile(era_code),
  place_label         text not null,
  households_offering integer not null default 0 check (households_offering >= 0),
  beds_offered        integer not null default 0 check (beds_offered >= 0),
  stable_places       integer not null default 0 check (stable_places >= 0),
  invited_the_run     boolean not null default true,
  may_withdraw_anytime boolean not null default true
                      check (may_withdraw_anytime),
  local_law_ref       text,
  standing_state      text not null default 'WELCOMING'
                      check (standing_state in (
                        'WELCOMING','STRAINED','WITHDRAWN','MOURNING','CLOSED')),
  note                text
);

comment on column thytr_host_community.may_withdraw_anytime is
  'Locked true. A host community can end hosting at any point, for any reason, without penalty to itself and without appeal by the Run.';

create table if not exists thytr_host_home (
  home_code           text primary key,           -- e.g. THY-TIME-RUN-001-HH-11
  community_code      text not null references thytr_host_community(community_code) on delete cascade,
  household_label     text not null,              -- descriptive, not a personal name
  beds                integer not null default 0 check (beds >= 0),
  can_feed            boolean not null default false,
  can_stable          boolean not null default false,
  has_sick_room       boolean not null default false,
  household_size      integer check (household_size is null or household_size >= 0),
  standing_state      text not null default 'OPEN'
                      check (standing_state in ('OPEN','FULL','CLOSED','WITHDRAWN'))
);

-- ---------------------------------------------------------------------------
-- Host home rules. These bind the GUEST, not the household.
-- Released rules also surface publicly through thylora_time_run_host_rules.
-- ---------------------------------------------------------------------------
create table if not exists thytr_host_home_rule (
  rule_code           text primary key,
  title               text not null,
  rule_text           text not null,
  binds               text not null default 'GUEST'
                      check (binds in ('GUEST','RUN','CROWN')),
  breach_severity     text not null default 'STANDARD'
                      check (breach_severity in ('STANDARD','SERIOUS','DISQUALIFYING')),
  host_rules_ref      text,                       -- soft ref into thylora_time_run_host_rules
  enforcement_state   text not null default 'ACTIVE'
                      check (enforcement_state in ('DRAFT','ACTIVE','SUSPENDED','RETIRED')),
  public_release      boolean not null default false
);

insert into thytr_host_home_rule (rule_code, title, rule_text, binds, breach_severity, enforcement_state, public_release) values
  ('HHR-001','The household sets the hours',
   'The household decides when the house sleeps, when it eats and when it is quiet. The Run adjusts to the house. The house does not adjust to the Run.',
   'GUEST','SERIOUS','ACTIVE',true),
  ('HHR-002','Pay before you are asked',
   'Lodging, feed, fodder, water, fuel and food are paid in era money at local rate or better, before departure, without being asked twice.',
   'GUEST','DISQUALIFYING','ACTIVE',true),
  ('HHR-003','Leave the house better',
   'Something is repaired, restocked or built before the team leaves. A team that takes lodging and leaves nothing useful behind has not completed the stop.',
   'GUEST','SERIOUS','ACTIVE',true),
  ('HHR-004','No household labour without pay',
   'Cooking, washing, carrying, stable work and child care done for the team by the household is work, and is paid as work.',
   'GUEST','DISQUALIFYING','ACTIVE',true),
  ('HHR-005','A closed door stays closed',
   'Rooms, stores, records and persons of the household are not entered, inspected, recorded or reported on without invitation.',
   'GUEST','DISQUALIFYING','ACTIVE',true),
  ('HHR-006','Local law is the law',
   'Era-specific law of the place governs the team while it is there. The Run does not carry its own jurisdiction with it.',
   'GUEST','SERIOUS','ACTIVE',true),
  ('HHR-007','A person in danger outranks the run',
   'Fire, flood, illness, injury, childbirth, a missing child: the team stops and helps. Standing in the run is never lost for stopping.',
   'RUN','DISQUALIFYING','ACTIVE',true),
  ('HHR-008','Withdrawal is not a dispute',
   'If a household or community withdraws hosting, the team leaves the same day, pays in full, and files no complaint.',
   'GUEST','DISQUALIFYING','ACTIVE',true),
  ('HHR-009','The Crown is a caretaker here too',
   'Crown presence in a host community carries no authority over that community''s own governance, property or people.',
   'CROWN','SERIOUS','ACTIVE',true),
  ('HHR-010','Corruption is reported, not used',
   'Where a local officer, factor or agent demands more than the law allows, the team records it, pays no bribe it can avoid, and does not take advantage of it either.',
   'GUEST','SERIOUS','ACTIVE',true)
on conflict (rule_code) do nothing;

-- ---------------------------------------------------------------------------
-- Lodging assignment. Who slept where, what was paid, what was left behind.
-- ---------------------------------------------------------------------------
create table if not exists thytr_lodging (
  lodging_id          uuid primary key default gen_random_uuid(),
  stop_id             uuid references thytr_stop(stop_id),
  team_code           text not null references thytr_team(team_code),
  home_code           text references thytr_host_home(home_code),
  community_code      text references thytr_host_community(community_code),
  nights              integer not null default 1 check (nights >= 1),
  persons_lodged      integer not null default 0 check (persons_lodged >= 0),
  animals_stabled     integer not null default 0 check (animals_stabled >= 0),
  paid_minor          bigint not null default 0 check (paid_minor >= 0),
  paid_before_departure boolean not null default false,
  useful_work_left_ref text,                      -- soft ref into thytr_help_order
  household_consented boolean not null default false,
  closed_at           timestamptz
);

alter table thytr_lodging drop constraint if exists thytr_lodging_consent_and_pay;
alter table thytr_lodging add constraint thytr_lodging_consent_and_pay
  check (closed_at is null or (household_consented and paid_before_departure and paid_minor >= 0));

commit;
