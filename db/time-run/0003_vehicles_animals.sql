-- 0003 · Vehicles, repair caravan, animal care.
-- Multiple era-specific vehicles per run. A vehicle is era-bound: it may not
-- carry capability its destination era cannot sustain.

begin;

create table if not exists thytr_vehicle_class (
  class_code          text primary key,
  class_label         text not null,
  era_code            text not null references thytr_era_profile(era_code),
  motive_power        text not null
                      check (motive_power in ('ANIMAL','HUMAN','WIND','STEAM','MOTOR')),
  crew_required       integer not null default 1 check (crew_required >= 1),
  animals_required    integer not null default 0 check (animals_required >= 0),
  load_note           text,
  award_eligible      boolean not null default true
);

create table if not exists thytr_vehicle (
  vehicle_code        text primary key,           -- e.g. THY-TIME-RUN-001-VEH-03
  run_code            text not null references thytr_run(run_code),
  team_code           text references thytr_team(team_code),
  class_code          text not null references thytr_vehicle_class(class_code),
  vehicle_role        text not null
                      check (vehicle_role in (
                        'LEAD','PASSENGER','FREIGHT','REPAIR_CARAVAN','FEED_AND_WATER',
                        'MEDICAL','KITCHEN','SPARE','ESCORT')),
  built_in_era        boolean not null default true,
  period_correct      boolean not null default true,
  condition_state     text not null default 'SERVICEABLE'
                      check (condition_state in (
                        'SERVICEABLE','NEEDS_REPAIR','UNDER_REPAIR','DISABLED','LOST')),
  safe_speed_period_units text,
  note                text
);

comment on column thytr_vehicle.period_correct is
  'False is allowed and must be visible. A non-period vehicle is recorded, reviewed and may be barred from vehicle award classes rather than quietly corrected.';

-- Every run carries a repair caravan. It is a vehicle AND a workshop.
create table if not exists thytr_repair_caravan (
  caravan_id          uuid primary key default gen_random_uuid(),
  vehicle_code        text not null references thytr_vehicle(vehicle_code),
  carries_spare_wheels integer not null default 0 check (carries_spare_wheels >= 0),
  carries_spare_axles  integer not null default 0 check (carries_spare_axles >= 0),
  carries_forge        boolean not null default false,
  carries_timber       boolean not null default false,
  carries_leather      boolean not null default false,
  serves_host_community boolean not null default true,
  note                text
);

comment on column thytr_repair_caravan.serves_host_community is
  'The caravan repairs local carts, gates, tools and roofs as well as the team''s own vehicles. This is the ordinary expectation, not a favour.';

create table if not exists thytr_repair_event (
  repair_id           uuid primary key default gen_random_uuid(),
  vehicle_code        text references thytr_vehicle(vehicle_code),
  stop_id             uuid references thytr_stop(stop_id),
  failure_kind        text not null
                      check (failure_kind in (
                        'WHEEL','AXLE','SPRING','HARNESS','SHOE','BRAKE','BODY',
                        'ENGINE','TYRE','OTHER')),
  repaired_by_role    text references thytr_crew_role(role_code),
  local_help_used     boolean not null default false,
  local_help_paid     boolean not null default false,
  parts_sourced_locally boolean not null default false,
  parts_paid_minor    bigint check (parts_paid_minor is null or parts_paid_minor >= 0),
  hours_lost          numeric(6,2) check (hours_lost is null or hours_lost >= 0),
  occurred_at         timestamptz not null default now()
);

alter table thytr_repair_event drop constraint if exists thytr_repair_event_pay_local;
alter table thytr_repair_event add constraint thytr_repair_event_pay_local
  check (not local_help_used or local_help_paid);

alter table thytr_repair_event drop constraint if exists thytr_repair_event_pay_parts;
alter table thytr_repair_event add constraint thytr_repair_event_pay_parts
  check (not parts_sourced_locally or parts_paid_minor is not null);

-- ---------------------------------------------------------------------------
-- Animals. Named as working animals with care records, not as equipment.
-- ---------------------------------------------------------------------------
create table if not exists thytr_animal (
  animal_code         text primary key,           -- e.g. THY-TIME-RUN-001-ANM-07
  run_code            text not null references thytr_run(run_code),
  team_code           text references thytr_team(team_code),
  animal_kind         text not null
                      check (animal_kind in ('HORSE','MULE','OX','DONKEY','DOG','OTHER')),
  work_role           text not null
                      check (work_role in ('DRAUGHT','RIDING','PACK','RELIEF','SHOW','GUARD')),
  owned_by            text not null default 'RUN'
                      check (owned_by in ('RUN','HOST_COMMUNITY','LOCAL_OWNER')),
  hire_paid_minor     bigint check (hire_paid_minor is null or hire_paid_minor >= 0),
  condition_state     text not null default 'FIT'
                      check (condition_state in ('FIT','TIRED','LAME','SICK','RESTING','RETIRED','DIED')),
  must_rest_after_days integer not null default 3 check (must_rest_after_days >= 1)
);

alter table thytr_animal drop constraint if exists thytr_animal_hire_paid;
alter table thytr_animal add constraint thytr_animal_hire_paid
  check (owned_by = 'RUN' or hire_paid_minor is not null);

create table if not exists thytr_animal_care (
  care_id             uuid primary key default gen_random_uuid(),
  animal_code         text not null references thytr_animal(animal_code) on delete cascade,
  stop_id             uuid references thytr_stop(stop_id),
  fed                 boolean not null default false,
  watered             boolean not null default false,
  hooves_checked      boolean not null default false,
  rested_hours        numeric(5,2) not null default 0 check (rested_hours >= 0),
  injury_noted        text,
  recorded_at         timestamptz not null default now()
);

comment on table thytr_animal_care is
  'A team that cannot show care records for a working day has not completed that day, whatever distance it covered.';

commit;
