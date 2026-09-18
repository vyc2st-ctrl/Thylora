-- THYLORA PERSONS · 0005 · Scenes, the visibility gate, deterministic crowds
-- Workroom: WR-PERSONS-001
--
-- THE GATE
--   P_visible = IDENTITY x ROLE x LOCATION_REASON x BODY_LOCK x TIME_STATE x CONTINUITY
-- Any zero and the person may not appear. This is not a guideline in a document:
-- studio_scene_character_snapshots cannot hold a row with any factor missing, and
-- a trigger refuses a row whose body lock, age or location reason does not
-- actually resolve against the world. A person with no reason to be somewhere
-- cannot be written into a frame there.
--
-- CROWDS
-- A crowd is generated from registered households, occupations and neighbourhoods
-- with a recorded seed. Every crowd person receives a serial from the same
-- registry as a named person, and the same face for the same (cohort, index)
-- forever. random() is never called anywhere in this schema.
--
-- POPULATION MIX
-- A cohort declares its population mix and the database refuses a monolithic
-- crowd: at least two groups must be present and none may exceed 85 percent.
-- The mix is a property of the COHORT, never of an occupation: no occupation row
-- anywhere in this schema carries an appearance attribute, so the schema cannot
-- express "this kind of work is done by this kind of person".

begin;

do $$ begin
  create type thyp_scene_kind as enum
    ('PORTRAIT_SITTING','INTERIOR','EXTERIOR','COURT','WORK','MARKET','TRAVEL','CEREMONY','DOMESTIC');
exception when duplicate_object then null; end $$;

do $$ begin
  create type thyp_gate_verdict as enum ('BLOCKED','CLEARED');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- 1 · Scenes
-- ---------------------------------------------------------------------------
create table if not exists thyp_scenes (
  scene_code      text primary key,
  scene_serial    text,
  scene_title     text not null,
  scene_kind      thyp_scene_kind not null,
  world_date      date not null,
  world_time      time not null,
  place_code      text not null references thyp_places(place_code),
  continuity_ref  text not null,
  scene_state     thyp_record_state not null default 'DRAFT',
  created_at      timestamptz not null default now(),
  constraint thyp_scene_continuity_named check (length(btrim(continuity_ref)) >= 4)
);

create index if not exists thyp_scene_when_idx on thyp_scenes(world_date, place_code);

-- ---------------------------------------------------------------------------
-- 2 · Visit grants. The legitimate reason for a person who neither lives nor
--     works nor is schooled at a place to be there on a date.
-- ---------------------------------------------------------------------------
create table if not exists thyp_visit_grants (
  id              uuid primary key default gen_random_uuid(),
  person_serial   text not null,
  place_code      text not null references thyp_places(place_code),
  from_world_date date not null,
  to_world_date   date not null,
  reason          text not null,
  granted_by      text,
  created_at      timestamptz not null default now(),
  constraint thyp_visit_dates  check (to_world_date >= from_world_date),
  constraint thyp_visit_reason check (length(btrim(reason)) >= 4)
);

do $$ begin
  alter table thyp_visit_grants add constraint thyp_visit_person_fk
    foreign key (person_serial) references studio_world_characters(person_serial) on delete cascade;
exception when duplicate_object then null; when others then
  raise notice 'THYLORA PERSONS: visit grant FK held as soft reference (%).', sqlerrm; end $$;

create index if not exists thyp_visit_person_idx on thyp_visit_grants(person_serial, place_code);

-- ---------------------------------------------------------------------------
-- 3 · Location reason resolver. Returns the reason code that puts this person
--     at this place on this date, or null. Null means the person may not appear.
--     A place matches when it is the place itself or any ancestor of it, so a
--     person assigned to the castle resolves inside one of its rooms.
-- ---------------------------------------------------------------------------
create or replace function thyp_place_and_ancestors(p_place_code text)
returns table(place_code text) language sql stable as $$
  with recursive up as (
    select p.place_code, p.parent_place_code from thyp_places p where p.place_code = p_place_code
    union all
    select p.place_code, p.parent_place_code from thyp_places p join up on p.place_code = up.parent_place_code
  )
  select up.place_code from up;
$$;

create or replace function thyp_location_reason(
  p_person_serial text, p_place_code text, p_world_date date
) returns text language plpgsql stable as $$
declare v_places text[];
begin
  select array_agg(place_code) into v_places from thyp_place_and_ancestors(p_place_code);
  if v_places is null then return null; end if;

  if exists (select 1 from thyp_person_assignments a
              where a.person_serial = p_person_serial
                and a.place_code = any(v_places)
                and a.from_world_date <= p_world_date
                and (a.to_world_date is null or a.to_world_date >= p_world_date)
                and a.assignment_kind in ('HOME','ROOM','BOARDING'))
  then return 'RESIDENCE'; end if;

  if exists (select 1 from thyp_person_assignments a
              where a.person_serial = p_person_serial
                and a.place_code = any(v_places)
                and a.from_world_date <= p_world_date
                and (a.to_world_date is null or a.to_world_date >= p_world_date)
                and a.assignment_kind = 'WORK')
  then return 'WORK_POST'; end if;

  if exists (select 1 from thyp_person_assignments a
              where a.person_serial = p_person_serial
                and a.place_code = any(v_places)
                and a.from_world_date <= p_world_date
                and (a.to_world_date is null or a.to_world_date >= p_world_date)
                and a.assignment_kind = 'SCHOOLING')
  then return 'SCHOOLING'; end if;

  if exists (select 1 from thyp_schedule_blocks b
              join thyp_schedules s on s.schedule_code = b.schedule_code
             where s.person_serial = p_person_serial
               and s.effective_from <= p_world_date
               and (s.effective_to is null or s.effective_to >= p_world_date)
               and b.place_code = any(v_places))
  then return 'SCHEDULED_BLOCK'; end if;

  if exists (select 1 from thyp_household_members m
              join thyp_households h on h.household_serial = m.household_serial
             where m.person_serial = p_person_serial
               and m.member_state = 'ACTIVE'
               and (h.residence_place_code = any(v_places) or h.settlement_place_code = any(v_places)))
  then return 'HOUSEHOLD'; end if;

  if exists (select 1 from thyp_visit_grants g
              where g.person_serial = p_person_serial
                and g.place_code = any(v_places)
                and g.from_world_date <= p_world_date
                and g.to_world_date >= p_world_date)
  then return 'VISIT_GRANT'; end if;

  return null;
end $$;

-- ---------------------------------------------------------------------------
-- 4 · studio_scene_character_snapshots — Chairman-named table. One row per
--     visible person per scene, and the row cannot exist unless all six factors
--     of P_visible are present AND resolve.
-- ---------------------------------------------------------------------------
create table if not exists studio_scene_character_snapshots (
  id                  uuid primary key default gen_random_uuid(),
  scene_code          text not null,
  person_serial       text not null,
  role_in_scene       text not null,
  location_reason     text not null,
  body_lock_hash      text not null,
  time_state_world_date date not null,
  time_state_world_time time not null,
  age_years_at_scene  integer not null,
  continuity_ref      text not null,
  gate_verdict        thyp_gate_verdict not null default 'BLOCKED',
  gate_blockers       jsonb not null default '[]'::jsonb,
  wardrobe_ref        text,
  visible_injury_ids  uuid[] not null default '{}',
  created_at          timestamptz not null default now()
);

alter table studio_scene_character_snapshots add column if not exists scene_code            text;
alter table studio_scene_character_snapshots add column if not exists person_serial         text;
alter table studio_scene_character_snapshots add column if not exists role_in_scene         text;
alter table studio_scene_character_snapshots add column if not exists location_reason       text;
alter table studio_scene_character_snapshots add column if not exists body_lock_hash        text;
alter table studio_scene_character_snapshots add column if not exists time_state_world_date date;
alter table studio_scene_character_snapshots add column if not exists time_state_world_time time;
alter table studio_scene_character_snapshots add column if not exists age_years_at_scene    integer;
alter table studio_scene_character_snapshots add column if not exists continuity_ref        text;
alter table studio_scene_character_snapshots add column if not exists gate_verdict          thyp_gate_verdict default 'BLOCKED';
alter table studio_scene_character_snapshots add column if not exists gate_blockers         jsonb default '[]'::jsonb;
alter table studio_scene_character_snapshots add column if not exists wardrobe_ref          text;
alter table studio_scene_character_snapshots add column if not exists visible_injury_ids    uuid[] default '{}';

do $$ begin
  alter table studio_scene_character_snapshots
    add constraint thyp_snapshot_unique unique (scene_code, person_serial);
exception when duplicate_object then null; when others then
  raise notice 'THYLORA PERSONS: snapshot uniqueness not added (%).', sqlerrm; end $$;

do $$ begin
  alter table studio_scene_character_snapshots
    add constraint thyp_snapshot_scene_fk foreign key (scene_code)
    references thyp_scenes(scene_code) on delete cascade;
exception when duplicate_object then null; when others then
  raise notice 'THYLORA PERSONS: snapshot->scene FK held as soft reference (%).', sqlerrm; end $$;

do $$ begin
  alter table studio_scene_character_snapshots
    add constraint thyp_snapshot_person_fk foreign key (person_serial)
    references studio_world_characters(person_serial) on delete restrict;
exception when duplicate_object then null; when others then
  raise notice 'THYLORA PERSONS: snapshot->person FK held as soft reference (%).', sqlerrm; end $$;

-- The six factors, spelled out as the constraint that makes a filler person
-- unwritable. Each one is a multiplicand of P_visible.
do $$ begin
  alter table studio_scene_character_snapshots add constraint thyp_snapshot_p_visible check (
    person_serial          is not null and length(btrim(person_serial))   >= 6   -- IDENTITY
    and role_in_scene      is not null and length(btrim(role_in_scene))   >= 2   -- ROLE
    and location_reason    is not null and length(btrim(location_reason)) >= 4   -- LOCATION_REASON
    and body_lock_hash     is not null and length(body_lock_hash)          = 64  -- BODY_LOCK
    and time_state_world_date is not null                                       -- TIME_STATE
    and continuity_ref     is not null and length(btrim(continuity_ref))  >= 4   -- CONTINUITY
  );
exception when duplicate_object then null; when others then
  raise notice 'THYLORA PERSONS: P_visible check not added (%).', sqlerrm; end $$;

do $$ begin
  alter table studio_scene_character_snapshots add constraint thyp_snapshot_cleared_has_no_blockers
    check (gate_verdict = 'BLOCKED' or gate_blockers = '[]'::jsonb);
exception when duplicate_object then null; when others then
  raise notice 'THYLORA PERSONS: verdict/blocker agreement not added (%).', sqlerrm; end $$;

create index if not exists thyp_snapshot_person_idx on studio_scene_character_snapshots(person_serial);
create index if not exists thyp_snapshot_scene_idx  on studio_scene_character_snapshots(scene_code, gate_verdict);

-- Resolution, not declaration. A snapshot may claim a body lock, an age and a
-- reason; this trigger checks each claim against the world and refuses the row
-- if any of them is untrue.
create or replace function thyp_snapshot_gate() returns trigger
language plpgsql as $$
declare
  v_scene       thyp_scenes;
  v_lock_hash   text;
  v_birth       date;
  v_expected    integer;
  v_reason      text;
begin
  select * into v_scene from thyp_scenes where scene_code = new.scene_code;
  if v_scene.scene_code is null then
    raise exception 'SCENE_UNKNOWN: % is not a registered scene', new.scene_code;
  end if;

  -- TIME_STATE: the snapshot is dated to the scene, not to whenever it was written.
  if new.time_state_world_date <> v_scene.world_date
     or new.time_state_world_time <> v_scene.world_time then
    raise exception 'TIME_STATE_MISMATCH: scene % is % %, snapshot claims % %',
      new.scene_code, v_scene.world_date, v_scene.world_time,
      new.time_state_world_date, new.time_state_world_time;
  end if;

  -- BODY_LOCK: the snapshot must carry the lock this person held ON THE SCENE'S
  -- DATE, not whichever lock they hold now. A person cannot be dropped into an
  -- earlier scene wearing a later body.
  v_lock_hash := thyp_body_lock_at(new.person_serial, v_scene.world_date);
  if v_lock_hash is null then
    if exists (select 1 from thyp_body_lock where person_serial = new.person_serial) then
      raise exception 'BODY_LOCK_ABSENT_FOR_DATE: % holds no recorded body lock at or before %',
        new.person_serial, v_scene.world_date;
    end if;
    raise exception 'BODY_LOCK_ABSENT: % has no sealed body lock; may not appear', new.person_serial;
  end if;
  if new.body_lock_hash <> v_lock_hash then
    raise exception 'BODY_LOCK_MISMATCH: % carries lock %, snapshot claims %',
      new.person_serial, left(v_lock_hash,12), left(new.body_lock_hash,12);
  end if;

  -- IDENTITY + TIME_STATE: age is the arithmetic of the birth date at the scene date.
  select birth_world_date into v_birth from studio_world_characters where person_serial = new.person_serial;
  if v_birth is not null then
    v_expected := (extract(year from v_scene.world_date) - extract(year from v_birth))::integer
      - case when (extract(month from v_scene.world_date)::integer * 100 + extract(day from v_scene.world_date)::integer)
               < (extract(month from v_birth)::integer * 100 + extract(day from v_birth)::integer)
             then 1 else 0 end;
    if new.age_years_at_scene <> v_expected then
      raise exception 'AGE_STATE_MISMATCH: % is % on %, snapshot claims %',
        new.person_serial, v_expected, v_scene.world_date, new.age_years_at_scene;
    end if;
  end if;

  -- LOCATION_REASON: must resolve against residence, work, schooling, schedule,
  -- household or a recorded visit. This is the end of the random extra.
  v_reason := thyp_location_reason(new.person_serial, v_scene.place_code, v_scene.world_date);
  if v_reason is null then
    raise exception 'NO_LOCATION_REASON: % has no residence, post, schooling, scheduled block, household or visit grant at % on %',
      new.person_serial, v_scene.place_code, v_scene.world_date;
  end if;
  new.location_reason := v_reason;

  -- CONTINUITY: a cleared snapshot must inherit the scene's continuity reference.
  if new.gate_verdict = 'CLEARED' and new.continuity_ref <> v_scene.continuity_ref then
    raise exception 'CONTINUITY_REF_MISMATCH: scene % is under %, snapshot claims %',
      new.scene_code, v_scene.continuity_ref, new.continuity_ref;
  end if;

  return new;
end $$;

drop trigger if exists thyp_snapshot_gate_trg on studio_scene_character_snapshots;
create trigger thyp_snapshot_gate_trg before insert or update on studio_scene_character_snapshots
  for each row execute function thyp_snapshot_gate();

-- ---------------------------------------------------------------------------
-- 5 · Crowd cohorts
-- ---------------------------------------------------------------------------
create or replace function thyp_share_total(p_mix jsonb)
returns integer language sql immutable as $$
  select coalesce(sum((e->>'share_bp')::integer), 0)
    from jsonb_array_elements(coalesce(p_mix, '[]'::jsonb)) e;
$$;

create or replace function thyp_mix_valid(p_mix jsonb)
returns boolean language sql immutable as $$
  select coalesce(sum((e->>'share_bp')::integer), 0) = 10000
     and count(*) filter (where (e->>'share_bp')::integer > 0) >= 2
     and coalesce(max((e->>'share_bp')::integer), 0) <= 8500
     and count(*) filter (where coalesce(btrim(e->>'group_code'),'') = '') = 0
    from jsonb_array_elements(coalesce(p_mix, '[]'::jsonb)) e;
$$;

create table if not exists thyp_crowd_cohorts (
  cohort_code        text primary key,
  place_code         text not null references thyp_places(place_code),
  settlement_place_code text references thyp_places(place_code),
  from_world_date    date not null,
  to_world_date      date,
  seed               text not null,
  target_count       integer not null check (target_count between 1 and 5000),
  -- [{"group_code":"...","share_bp":4000}, ...]; must sum to 10000, name at
  -- least two groups, and let none exceed 8500 bp.
  population_mix     jsonb not null,
  -- [{"occupation_code":"...","share_bp":2000}, ...]; independent of the above.
  occupation_mix     jsonb not null,
  age_low            smallint not null default 0 check (age_low >= 0),
  age_high           smallint not null default 80 check (age_high <= 110),
  -- Which households a crowd person may be drawn from. The royal household is
  -- not a crowd pool: a person does not become family by being generated near
  -- the family, so ROYAL is excluded by default and must be named to be used.
  household_kinds    thyp_household_kind[] not null default array['VILLAGE','STAFF_QUARTER']::thyp_household_kind[],
  cohort_state       thyp_record_state not null default 'ACTIVE',
  created_at         timestamptz not null default now(),
  constraint thyp_cohort_seed   check (length(btrim(seed)) >= 8),
  constraint thyp_cohort_dates  check (to_world_date is null or to_world_date >= from_world_date),
  constraint thyp_cohort_ages   check (age_high >= age_low),
  constraint thyp_cohort_household_pool check (cardinality(household_kinds) >= 1),
  -- Refuses a monolithic crowd outright.
  constraint thyp_cohort_population_mix check (thyp_mix_valid(population_mix)),
  constraint thyp_cohort_occupation_mix check (thyp_share_total(occupation_mix) = 10000)
);

alter table thyp_crowd_cohorts add column if not exists household_kinds
  thyp_household_kind[] not null default array['VILLAGE','STAFF_QUARTER']::thyp_household_kind[];

-- ---------------------------------------------------------------------------
-- 6 · Crowd persons. Materialised, serialled, and reproducible from the seed.
-- ---------------------------------------------------------------------------
create table if not exists thyp_crowd_persons (
  person_serial    text primary key,
  cohort_code      text not null references thyp_crowd_cohorts(cohort_code) on delete restrict,
  cohort_index     integer not null check (cohort_index >= 0),
  derivation_hash  text not null,
  group_code       text not null,
  occupation_code  text references thyp_occupations(occupation_code),
  household_serial text references thyp_households(household_serial),
  age_years        integer not null check (age_years >= 0),
  body_lock_hash   text,
  created_at       timestamptz not null default now(),
  unique (cohort_code, cohort_index),
  constraint thyp_crowd_derivation check (length(derivation_hash) = 64)
);

do $$ begin
  alter table thyp_crowd_persons add constraint thyp_crowd_identity_fk
    foreign key (person_serial) references thylora_person_identity(person_serial) on delete cascade;
exception when duplicate_object then null; when others then
  raise notice 'THYLORA PERSONS: crowd person FK held as soft reference (%).', sqlerrm; end $$;

-- A crowd person is a crowd person. It cannot be promoted by editing a tier:
-- a named recurring person is a separate, deliberate record.
create or replace function thyp_crowd_tier_gate() returns trigger
language plpgsql as $$
declare v_tier thyp_person_tier;
begin
  select person_tier into v_tier from thylora_person_identity where person_serial = new.person_serial;
  if v_tier is distinct from 'DETERMINISTIC_CROWD' then
    raise exception 'CROWD_TIER_REQUIRED: % is tier %, not DETERMINISTIC_CROWD',
      new.person_serial, coalesce(v_tier::text,'UNREGISTERED');
  end if;
  return new;
end $$;

drop trigger if exists thyp_crowd_tier_trg on thyp_crowd_persons;
create trigger thyp_crowd_tier_trg before insert or update on thyp_crowd_persons
  for each row execute function thyp_crowd_tier_gate();

create index if not exists thyp_crowd_cohort_idx on thyp_crowd_persons(cohort_code, cohort_index);

commit;
