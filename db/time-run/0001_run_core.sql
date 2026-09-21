-- THY-WORK-TIME-RUN-OPS-VERONICA-582
-- 0001 · Time Run core: eras, runs, legs, rest days, era conditions.
--
-- ADDITIVE ONLY. Every object here is new and prefixed thytr_.
-- The four canonical registries are NOT redefined here:
--   thylora_time_run_registry
--   thylora_time_run_host_rules
--   thylora_time_run_events
--   thylora_time_run_award_catalog
-- They are linked by guarded soft reference in 0010_registry_link.sql.

begin;

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Era profile. One row per living era the Run can enter.
-- Eras are ALIVE. An era profile is not a costume set; it is the operating
-- condition of a real place with real people in it.
-- ---------------------------------------------------------------------------
create table if not exists thytr_era_profile (
  era_code            text primary key,
  era_label           text not null,
  era_span_note       text,                       -- exact years stay open until sealed for a run
  years_sealed        boolean not null default false,
  region_note         text,
  -- era-specific law
  law_regime          text not null,
  law_summary         text not null,
  law_enforcement_note text,
  -- era-specific money
  money_unit          text not null,              -- name of the period unit
  money_minor_per_unit integer not null check (money_minor_per_unit > 0),
  money_note          text,
  -- era-specific travel
  travel_modes        text[] not null default '{}',
  road_condition_note text,
  -- destination-era capability ceiling (see 0007_living_time.sql)
  tech_ceiling_code   text not null,
  tech_ceiling_note   text not null,
  -- safety
  safe_speed_note     text not null default
    'Safe speed only. Speed never outranks a person in danger.',
  created_at          timestamptz not null default now()
);

comment on column thytr_era_profile.tech_ceiling_code is
  'Destination-era capability governs functioning technology. Visitors keep identity, memory, knowledge and experience; they cannot export functioning later-era capability backward.';

-- ---------------------------------------------------------------------------
-- Run instance. THY-TIME-RUN-001 is the authoritative run.
-- ---------------------------------------------------------------------------
create table if not exists thytr_run (
  run_code            text primary key,           -- e.g. THY-TIME-RUN-001
  run_title           text not null,
  era_code            text not null references thytr_era_profile(era_code),
  registry_ref        text,                       -- soft ref into thylora_time_run_registry
  invite_state        text not null default 'CROWN_INVITE_ONLY'
                      check (invite_state in ('CROWN_INVITE_ONLY')),
  crown_role          text not null default 'CARETAKER'
                      check (crown_role in ('CARETAKER')),
  run_state           text not null default 'PREPARING'
                      check (run_state in (
                        'PREPARING','TRAVELLING','HELPING','RETURNING',
                        'VERIFYING','AWARDED','HELD','CLOSED')),
  preserve_life_before_competition boolean not null default true
                      check (preserve_life_before_competition),
  corruption_acknowledged boolean not null default true,
  opened_at           timestamptz not null default now(),
  sealed_at           timestamptz
);

comment on table thytr_run is
  'Crown = caretaker, not ruler. Invitation is a privilege and creates no ownership, entitlement or permission to exploit. Corruption still exists inside the world; the schema does not pretend otherwise, it records it.';

-- ---------------------------------------------------------------------------
-- Route. Legs and stops. Every stop can create useful work.
-- ---------------------------------------------------------------------------
create table if not exists thytr_leg (
  leg_id              uuid primary key default gen_random_uuid(),
  run_code            text not null references thytr_run(run_code),
  leg_index           integer not null check (leg_index >= 0),
  origin_place        text not null,
  destination_place   text not null,
  planned_distance_period_units text,
  road_condition      text not null default 'UNSURVEYED'
                      check (road_condition in (
                        'GOOD','ROUGH','WASHED_OUT','FLOODED','SNOW','MUD',
                        'IMPASSABLE','UNSURVEYED')),
  weather_state       text not null default 'UNKNOWN'
                      check (weather_state in (
                        'CLEAR','RAIN','STORM','SNOW','HEAT','FOG','UNKNOWN')),
  leg_state           text not null default 'PLANNED'
                      check (leg_state in (
                        'PLANNED','MOVING','HALTED_FOR_SAFETY','HALTED_FOR_HELP',
                        'REROUTED','COMPLETE','ABANDONED')),
  halt_reason         text,
  unique (run_code, leg_index)
);

create table if not exists thytr_stop (
  stop_id             uuid primary key default gen_random_uuid(),
  leg_id              uuid not null references thytr_leg(leg_id) on delete cascade,
  stop_index          integer not null check (stop_index >= 0),
  place_label         text not null,
  stop_kind           text not null
                      check (stop_kind in (
                        'LODGING','WATER','FEED','REPAIR','MARKET','MEDICAL',
                        'REST_DAY','HELP_CALL','TOLL_OR_LAW','CROSSING')),
  arrived_at          timestamptz,
  departed_at         timestamptz,
  unique (leg_id, stop_index)
);

-- Rest days are scheduled, not earned. Animals and people both rest.
create table if not exists thytr_rest_day (
  rest_id             uuid primary key default gen_random_uuid(),
  run_code            text not null references thytr_run(run_code),
  day_index           integer not null check (day_index >= 0),
  reason              text not null default 'SCHEDULED'
                      check (reason in (
                        'SCHEDULED','ANIMAL_RECOVERY','CREW_RECOVERY','WEATHER',
                        'LAW_OBSERVANCE','HOST_REQUEST','MOURNING')),
  animals_rested      boolean not null default true,
  crew_rested         boolean not null default true,
  note                text,
  unique (run_code, day_index)
);

commit;
