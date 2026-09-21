-- TIME RUN · 0001 · Living eras and stable places
-- Workroom: WR-TIMERUN-581 · Directive: THY-WORK-TIME-RUN-LIVE-TRAVERSAL-581
-- Backend: thylora-dash (jvsdxhrfhtlgaknhjxlz)
--
-- AUTHORITY NOTE
-- Reviewable migration. NOT applied by this repository. Every statement is
-- idempotent and additive: it creates new trun_* objects and never drops,
-- renames or rewrites an existing THYLORA table.
--
-- BINDING CORRECTION
-- Time Run is not a historical viewer. Eras are living. A traveler physically
-- enters another era and the people there are living their own lives. The
-- schema enforces this: trun_eras.living is constrained true, and there is no
-- column, state or table anywhere in these migrations for a passive viewer.

begin;

create extension if not exists "pgcrypto";

-- Capability tiers are ordinal governance numbers, not physical claims. They
-- exist only to decide what functions and what does not across a boundary.
create table if not exists trun_eras (
  era_id              text primary key,
  label               text not null,
  band                text not null,
  living              boolean not null default true,
  capability_ceiling  integer not null,
  domain_ceiling      jsonb not null,
  exact_years_sealed  boolean not null default false,
  created_at          timestamptz not null default now(),
  constraint trun_eras_living_only check (living is true),
  constraint trun_eras_ceiling_range check (capability_ceiling between 0 and 100),
  constraint trun_eras_domains_complete check (
    domain_ceiling ?& array['POWER','TRANSPORT','COMMUNICATION','COMPUTATION','MEDICINE','MATERIALS','RECORDING']
  )
);

comment on constraint trun_eras_living_only on trun_eras is
  'TR-L1. An era row cannot exist in a non-living state. There is no archive mode.';

insert into trun_eras (era_id, label, band, capability_ceiling, domain_ceiling, exact_years_sealed) values
  ('ERA_ANCIENT_EGYPT','Historic Egypt','UNSEALED_ANCIENT',12,
   '{"POWER":8,"TRANSPORT":12,"COMMUNICATION":10,"COMPUTATION":6,"MEDICINE":10,"MATERIALS":14,"RECORDING":12}'::jsonb,false),
  ('ERA_1700S','1700s','UNSEALED_1700S',30,
   '{"POWER":24,"TRANSPORT":28,"COMMUNICATION":22,"COMPUTATION":12,"MEDICINE":20,"MATERIALS":30,"RECORDING":26}'::jsonb,false),
  ('ERA_1922','1922','SEALED_YEAR_1922',55,
   '{"POWER":52,"TRANSPORT":55,"COMMUNICATION":50,"COMPUTATION":20,"MEDICINE":45,"MATERIALS":52,"RECORDING":48}'::jsonb,true),
  ('ERA_MOTOR_MID','Later motor eras','UNSEALED_MOTOR',66,
   '{"POWER":64,"TRANSPORT":68,"COMMUNICATION":62,"COMPUTATION":35,"MEDICINE":60,"MATERIALS":64,"RECORDING":60}'::jsonb,false),
  ('ERA_CURRENT','Current era','CURRENT',80,
   '{"POWER":80,"TRANSPORT":78,"COMMUNICATION":80,"COMPUTATION":80,"MEDICINE":78,"MATERIALS":80,"RECORDING":80}'::jsonb,false)
on conflict (era_id) do nothing;

-- A place is ONE identity across living eras. Invariants live here.
create table if not exists trun_places (
  place_id          text primary key,
  kind              text not null,
  world             text not null default 'EdereAriah',
  native_name       text,
  native_name_state text not null default 'CANDIDATE_SET_OPEN',
  site_ground       text not null,
  orientation       text not null,
  approach          text not null,
  water_relation    text not null,
  footprint_origin  text not null,
  created_at        timestamptz not null default now(),
  constraint trun_places_name_state check (
    native_name_state in ('CANDIDATE_SET_OPEN','SEALED')
  ),
  constraint trun_places_sealed_has_name check (
    native_name_state <> 'SEALED' or (native_name is not null and length(btrim(native_name)) > 0)
  ),
  constraint trun_places_name_not_prohibited check (
    native_name is null or upper(native_name) not like '%PEETE%'
  )
);

comment on constraint trun_places_name_not_prohibited on trun_places is
  'Chairman directive. The castle is named from NATIVE LAND + LANGUAGE + HISTORY, not from a family.';

-- A name is only valid with its derivation attached. No derivation, no name.
create table if not exists trun_place_name_candidates (
  candidate_id  text primary key,
  place_id      text not null references trun_places(place_id) on delete cascade,
  name          text not null,
  native_land   text not null,
  language      text not null,
  history       text not null,
  morphemes     jsonb not null,
  reading       text not null,
  strength      text,
  weakness      text,
  selected      boolean not null default false,
  created_at    timestamptz not null default now(),
  constraint trun_name_candidate_not_prohibited check (upper(name) not like '%PEETE%'),
  constraint trun_name_candidate_derived check (jsonb_array_length(morphemes) >= 2)
);

create unique index if not exists trun_place_one_selected_name
  on trun_place_name_candidates (place_id) where selected;

-- Era strata: everything that changes by era, for one unchanged place.
create table if not exists trun_place_strata (
  stratum_id           text primary key,
  place_id             text not null references trun_places(place_id) on delete cascade,
  era_id               text not null references trun_eras(era_id),
  name_rendering       text,
  rooms                text,
  walls                text,
  repairs              text,
  objects              text,
  occupants            text,
  staff                text,
  businesses           text,
  furniture            text,
  art                  text,
  family_relationships text,
  capability_ceiling   integer not null,
  people_state         text not null default 'LIVING',
  created_at           timestamptz not null default now(),
  constraint trun_strata_people_living check (people_state = 'LIVING'),
  unique (place_id, era_id)
);

comment on constraint trun_strata_people_living on trun_place_strata is
  'TR-L6. Occupants of a stratum are people living their own lives, never scenery.';

commit;
