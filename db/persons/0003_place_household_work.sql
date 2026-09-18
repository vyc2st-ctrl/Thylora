-- THYLORA PERSONS · 0003 · Places, households, occupations, assignments, schedules
-- Workroom: WR-PERSONS-001
--
-- LOCATION_REASON comes from here. A person is in a frame because they live
-- there, work there, serve there, are schooled there or are recorded as visiting
-- there on that date. Nothing else puts a person in a frame.

begin;

do $$ begin
  create type thyp_place_kind as enum (
    'REALM','SETTLEMENT','NEIGHBORHOOD','CASTLE','WING','FLOOR','HALL','ROOM',
    'COURTYARD','GATEHOUSE','CHAPEL','KITCHEN','LAUNDRY','STABLE','WORKSHOP',
    'FORGE','GARDEN','HERB_GARDEN','STORE','MARKET','ROAD','FIELD','SCHOOLROOM');
exception when duplicate_object then null; end $$;

do $$ begin
  create type thyp_household_kind as enum
    ('ROYAL','NOBLE','STAFF_QUARTER','VILLAGE','GUILD','VISITING');
exception when duplicate_object then null; end $$;

do $$ begin
  create type thyp_occupation_class as enum (
    'ROYAL','STEWARD','GUARD','GROOM','CART_HANDLER','WHEELWRIGHT','SMITH','MASON',
    'CARPENTER','COOK','LAUNDRY','GARDENER','HERB_WORKER','CLERK','TUTOR',
    'NURSE_CAREGIVER','STABLE_STAFF','CLEANER','REPAIR','MESSENGER','MERCHANT',
    'VISITOR','CRAFT_WORKER','PAGE','WARD','APPRENTICE');
exception when duplicate_object then null; end $$;

do $$ begin
  create type thyp_assignment_kind as enum ('HOME','ROOM','WORK','BOARDING','SCHOOLING');
exception when duplicate_object then null; end $$;

do $$ begin
  create type thyp_schedule_kind as enum
    ('ROYAL_CHILD_LESSONS','APPRENTICESHIP','WORK_SHIFT','HOUSEHOLD_SERVICE','LOCAL_INSTRUCTION');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- 1 · Places
-- ---------------------------------------------------------------------------
create table if not exists thyp_places (
  place_code        text primary key,
  place_serial      text,
  place_kind        thyp_place_kind not null,
  name              text not null,
  parent_place_code text references thyp_places(place_code),
  width_cm          integer check (width_cm is null or width_cm > 0),
  depth_cm          integer check (depth_cm is null or depth_cm > 0),
  height_cm         integer check (height_cm is null or height_cm > 0),
  floor_level       smallint,
  standing_capacity integer check (standing_capacity is null or standing_capacity >= 0),
  place_state       thyp_record_state not null default 'ACTIVE',
  created_at        timestamptz not null default now()
);

create index if not exists thyp_places_parent_idx on thyp_places(parent_place_code);
create index if not exists thyp_places_kind_idx   on thyp_places(place_kind, place_state);

-- ---------------------------------------------------------------------------
-- 2 · Households. Deterministic crowd generation draws from registered
--     households, so every crowd person has a home before they have a face.
-- ---------------------------------------------------------------------------
create table if not exists thyp_households (
  household_serial      text primary key,
  household_code        text not null unique,
  household_kind        thyp_household_kind not null,
  head_person_serial    text,
  residence_place_code  text references thyp_places(place_code),
  settlement_place_code text references thyp_places(place_code),
  member_count          integer not null default 0 check (member_count >= 0),
  household_state       thyp_record_state not null default 'ACTIVE',
  created_at            timestamptz not null default now()
);

do $$ begin
  alter table thyp_households add constraint thyp_household_head_fk
    foreign key (head_person_serial) references thylora_person_identity(person_serial);
exception when duplicate_object then null; when others then
  raise notice 'THYLORA PERSONS: household head FK held as soft reference (%).', sqlerrm; end $$;

create table if not exists thyp_household_members (
  household_serial   text not null references thyp_households(household_serial) on delete cascade,
  person_serial      text not null,
  relation_to_head   text not null,
  joined_world_date  date,
  left_world_date    date,
  member_state       thyp_record_state not null default 'ACTIVE',
  primary key (household_serial, person_serial),
  constraint thyp_household_member_dates check (left_world_date is null or joined_world_date is null or left_world_date >= joined_world_date)
);

do $$ begin
  alter table thyp_household_members add constraint thyp_household_member_person_fk
    foreign key (person_serial) references thylora_person_identity(person_serial) on delete cascade;
exception when duplicate_object then null; when others then
  raise notice 'THYLORA PERSONS: household member FK held as soft reference (%).', sqlerrm; end $$;

create index if not exists thyp_household_member_person_idx
  on thyp_household_members(person_serial) where member_state = 'ACTIVE';

-- ---------------------------------------------------------------------------
-- 3 · Occupations. The castle workforce catalogue. Composition is NOT encoded
--     here: this table says what work exists, never who is allowed to do it by
--     appearance. Population mix is a cohort property (0006), and the cohort
--     builder refuses a single-appearance workforce.
-- ---------------------------------------------------------------------------
create table if not exists thyp_occupations (
  occupation_code    text primary key,
  title              text not null,
  occupation_class   thyp_occupation_class not null,
  default_place_code text references thyp_places(place_code),
  requires_literacy  boolean not null default false,
  min_age_years      smallint not null default 0 check (min_age_years between 0 and 90),
  rank_ladder        text[] not null default '{}',
  is_household_staff boolean not null default true,
  created_at         timestamptz not null default now()
);

create table if not exists thyp_person_occupation (
  id                    uuid primary key default gen_random_uuid(),
  person_serial         text not null,
  occupation_code       text not null references thyp_occupations(occupation_code),
  rank_code             text,
  is_primary            boolean not null default true,
  appointed_world_date  date not null,
  ended_world_date      date,
  supervisor_person_serial text,
  created_at            timestamptz not null default now(),
  constraint thyp_occupation_dates check (ended_world_date is null or ended_world_date >= appointed_world_date)
);

do $$ begin
  alter table thyp_person_occupation add constraint thyp_person_occupation_person_fk
    foreign key (person_serial) references studio_world_characters(person_serial) on delete cascade;
exception when duplicate_object then null; when others then
  raise notice 'THYLORA PERSONS: occupation FK held as soft reference (%).', sqlerrm; end $$;

-- One primary occupation at a time. A person cannot hold two primary posts.
create unique index if not exists thyp_person_primary_occupation_idx
  on thyp_person_occupation(person_serial)
  where is_primary and ended_world_date is null;

create index if not exists thyp_person_occupation_code_idx
  on thyp_person_occupation(occupation_code) where ended_world_date is null;

-- A post has a minimum age and it is enforced, so a six-year-old is never
-- quietly staffed to a forge to fill a frame.
create or replace function thyp_occupation_age_gate() returns trigger
language plpgsql as $$
declare v_min smallint; v_age integer; v_title text;
begin
  select min_age_years, title into v_min, v_title
    from thyp_occupations where occupation_code = new.occupation_code;
  select age_years into v_age
    from studio_world_characters where person_serial = new.person_serial;
  if v_age is not null and v_min is not null and v_age < v_min then
    raise exception 'OCCUPATION_MIN_AGE: % is % years old; % requires %',
      new.person_serial, v_age, v_title, v_min;
  end if;
  return new;
end $$;

drop trigger if exists thyp_occupation_age_trg on thyp_person_occupation;
create trigger thyp_occupation_age_trg before insert or update on thyp_person_occupation
  for each row execute function thyp_occupation_age_gate();

-- ---------------------------------------------------------------------------
-- 4 · Assignments: home, room, work location, boarding, schooling
-- ---------------------------------------------------------------------------
create table if not exists thyp_person_assignments (
  id               uuid primary key default gen_random_uuid(),
  person_serial    text not null,
  assignment_kind  thyp_assignment_kind not null,
  place_code       text not null references thyp_places(place_code),
  from_world_date  date not null,
  to_world_date    date,
  reason           text not null,
  created_at       timestamptz not null default now(),
  constraint thyp_assignment_dates check (to_world_date is null or to_world_date >= from_world_date)
);

do $$ begin
  alter table thyp_person_assignments add constraint thyp_assignment_person_fk
    foreign key (person_serial) references studio_world_characters(person_serial) on delete cascade;
exception when duplicate_object then null; when others then
  raise notice 'THYLORA PERSONS: assignment FK held as soft reference (%).', sqlerrm; end $$;

create unique index if not exists thyp_assignment_current_idx
  on thyp_person_assignments(person_serial, assignment_kind)
  where to_world_date is null;

-- ---------------------------------------------------------------------------
-- 5 · Schedules. Exact blocks by day and clock time, per person.
-- ---------------------------------------------------------------------------
create table if not exists thyp_schedules (
  schedule_code       text primary key,
  person_serial       text not null,
  schedule_kind       thyp_schedule_kind not null,
  effective_from      date not null,
  effective_to        date,
  age_band_low        smallint check (age_band_low is null or age_band_low >= 0),
  age_band_high       smallint check (age_band_high is null or age_band_high >= 0),
  schedule_state      thyp_record_state not null default 'ACTIVE',
  created_at          timestamptz not null default now(),
  constraint thyp_schedule_dates check (effective_to is null or effective_to >= effective_from),
  constraint thyp_schedule_band  check (age_band_high is null or age_band_low is null or age_band_high >= age_band_low)
);

do $$ begin
  alter table thyp_schedules add constraint thyp_schedule_person_fk
    foreign key (person_serial) references studio_world_characters(person_serial) on delete cascade;
exception when duplicate_object then null; when others then
  raise notice 'THYLORA PERSONS: schedule FK held as soft reference (%).', sqlerrm; end $$;

create table if not exists thyp_schedule_blocks (
  id                       uuid primary key default gen_random_uuid(),
  schedule_code            text not null references thyp_schedules(schedule_code) on delete cascade,
  day_of_week              smallint not null check (day_of_week between 0 and 6),
  start_time               time not null,
  end_time                 time not null,
  activity_code            text not null,
  subject_code             text,
  place_code               text references thyp_places(place_code),
  supervisor_person_serial text,
  created_at               timestamptz not null default now(),
  constraint thyp_block_time_order check (end_time > start_time)
);

create index if not exists thyp_schedule_block_idx
  on thyp_schedule_blocks(schedule_code, day_of_week, start_time);

-- A person cannot be in two places in the same hour. Overlap is refused rather
-- than resolved silently, because a silent resolution is how continuity breaks.
create or replace function thyp_schedule_no_overlap() returns trigger
language plpgsql as $$
declare v_clash integer;
begin
  select count(*) into v_clash
    from thyp_schedule_blocks b
   where b.schedule_code = new.schedule_code
     and b.day_of_week   = new.day_of_week
     and b.id           <> coalesce(new.id, '00000000-0000-0000-0000-000000000000'::uuid)
     and b.start_time    < new.end_time
     and new.start_time  < b.end_time;
  if v_clash > 0 then
    raise exception 'SCHEDULE_OVERLAP: % already has % overlapping block(s) on day %',
      new.schedule_code, v_clash, new.day_of_week;
  end if;
  return new;
end $$;

drop trigger if exists thyp_schedule_overlap_trg on thyp_schedule_blocks;
create trigger thyp_schedule_overlap_trg before insert or update on thyp_schedule_blocks
  for each row execute function thyp_schedule_no_overlap();

commit;
