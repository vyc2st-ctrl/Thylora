-- THYLORA PERSONS · 0006 · Life continuity
-- Workroom: WR-PERSONS-001
--
-- THE RULE
--   STATE(t+1) = STATE(t) + EVENTS + LEARNING + RELATIONSHIP_CHANGES
--                + PHYSICAL_AGING + WORK_HISTORY + MEMORY_WRITES
--
-- NO SILENT RESET. studio_character_state_ledger is append-only: update and
-- delete are refused by trigger, so a state change leaves a record even if
-- someone writes the person's row directly. Time does not run backward: the
-- advance function in 0008 refuses a target date earlier than the state it holds.

begin;

do $$ begin
  create type thyp_change_kind as enum (
    'EVENT','LEARNING','RELATIONSHIP_CHANGE','PHYSICAL_AGING','WORK_HISTORY',
    'MEMORY_WRITE','INJURY','EMOTION','ASSIGNMENT','WARDROBE','POSSESSION','STATUS');
exception when duplicate_object then null; end $$;

do $$ begin
  create type thyp_relation_kind as enum (
    'PARENT_OF','CHILD_OF','SIBLING_OF','SPOUSE_OF','GRANDPARENT_OF','GRANDCHILD_OF',
    'GUARDIAN_OF','WARD_OF','TUTOR_OF','PUPIL_OF','MASTER_OF','APPRENTICE_OF',
    'SUPERVISOR_OF','REPORTS_TO','SERVES','SERVED_BY','FRIEND_OF','RIVAL_OF',
    'NEIGHBOUR_OF','KIN_OF');
exception when duplicate_object then null; end $$;

do $$ begin
  create type thyp_memory_source as enum ('FIRSTHAND','TOLD','OVERHEARD','READ','INFERRED');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- 1 · Relationships
-- ---------------------------------------------------------------------------
create table if not exists thyp_relationships (
  id                uuid primary key default gen_random_uuid(),
  person_a_serial   text not null,
  person_b_serial   text not null,
  relation_kind     thyp_relation_kind not null,
  since_world_date  date,
  until_world_date  date,
  closeness         smallint check (closeness is null or closeness between -5 and 5),
  relation_state    thyp_record_state not null default 'ACTIVE',
  created_at        timestamptz not null default now(),
  unique (person_a_serial, person_b_serial, relation_kind),
  constraint thyp_relationship_distinct check (person_a_serial <> person_b_serial),
  constraint thyp_relationship_dates check (until_world_date is null or since_world_date is null or until_world_date >= since_world_date)
);

do $$ begin
  alter table thyp_relationships add constraint thyp_relationship_a_fk
    foreign key (person_a_serial) references thylora_person_identity(person_serial) on delete cascade;
  alter table thyp_relationships add constraint thyp_relationship_b_fk
    foreign key (person_b_serial) references thylora_person_identity(person_serial) on delete cascade;
exception when duplicate_object then null; when others then
  raise notice 'THYLORA PERSONS: relationship FKs held as soft references (%).', sqlerrm; end $$;

create index if not exists thyp_relationship_a_idx on thyp_relationships(person_a_serial) where relation_state = 'ACTIVE';
create index if not exists thyp_relationship_b_idx on thyp_relationships(person_b_serial) where relation_state = 'ACTIVE';

-- A parent is older than their child. Generational nonsense is refused rather
-- than discovered later in a portrait.
create or replace function thyp_relationship_generation_gate() returns trigger
language plpgsql as $$
declare v_a date; v_b date;
begin
  if new.relation_kind in ('PARENT_OF','GRANDPARENT_OF') then
    select birth_world_date into v_a from studio_world_characters where person_serial = new.person_a_serial;
    select birth_world_date into v_b from studio_world_characters where person_serial = new.person_b_serial;
    if v_a is not null and v_b is not null and v_a >= v_b then
      raise exception 'GENERATION_ORDER: % (born %) cannot be % of % (born %)',
        new.person_a_serial, v_a, new.relation_kind, new.person_b_serial, v_b;
    end if;
  end if;
  return new;
end $$;

drop trigger if exists thyp_relationship_generation_trg on thyp_relationships;
create trigger thyp_relationship_generation_trg before insert or update on thyp_relationships
  for each row execute function thyp_relationship_generation_gate();

-- ---------------------------------------------------------------------------
-- 2 · Skills and knowledge
-- ---------------------------------------------------------------------------
create table if not exists thyp_skills (
  skill_code   text primary key,
  title        text not null,
  skill_domain text not null,
  max_level    smallint not null default 10 check (max_level between 1 and 10)
);

create table if not exists thyp_person_skills (
  person_serial            text not null,
  skill_code               text not null references thyp_skills(skill_code),
  level_ordinal            smallint not null check (level_ordinal between 0 and 10),
  acquired_world_date      date,
  last_practiced_world_date date,
  primary key (person_serial, skill_code)
);

do $$ begin
  alter table thyp_person_skills add constraint thyp_person_skill_fk
    foreign key (person_serial) references studio_world_characters(person_serial) on delete cascade;
exception when duplicate_object then null; when others then
  raise notice 'THYLORA PERSONS: skill FK held as soft reference (%).', sqlerrm; end $$;

create table if not exists thyp_knowledge_items (
  knowledge_code text primary key,
  title          text not null,
  knowledge_kind text not null,
  known_from_world_date date
);

create table if not exists thyp_person_knowledge (
  person_serial        text not null,
  knowledge_code       text not null references thyp_knowledge_items(knowledge_code),
  learned_world_date   date not null,
  source               thyp_memory_source not null,
  source_person_serial text,
  confidence           smallint not null default 3 check (confidence between 1 and 5),
  primary key (person_serial, knowledge_code)
);

do $$ begin
  alter table thyp_person_knowledge add constraint thyp_person_knowledge_fk
    foreign key (person_serial) references studio_world_characters(person_serial) on delete cascade;
exception when duplicate_object then null; when others then
  raise notice 'THYLORA PERSONS: knowledge FK held as soft reference (%).', sqlerrm; end $$;

-- Nobody knows a thing before they were born, and nobody knows a thing before
-- it was knowable.
create or replace function thyp_knowledge_time_gate() returns trigger
language plpgsql as $$
declare v_birth date; v_from date;
begin
  select birth_world_date into v_birth from studio_world_characters where person_serial = new.person_serial;
  if v_birth is not null and new.learned_world_date < v_birth then
    raise exception 'KNOWLEDGE_BEFORE_BIRTH: % born %, learned % on %',
      new.person_serial, v_birth, new.knowledge_code, new.learned_world_date;
  end if;
  select known_from_world_date into v_from from thyp_knowledge_items where knowledge_code = new.knowledge_code;
  if v_from is not null and new.learned_world_date < v_from then
    raise exception 'KNOWLEDGE_BEFORE_EXISTENCE: % is knowable from %, learned on %',
      new.knowledge_code, v_from, new.learned_world_date;
  end if;
  return new;
end $$;

drop trigger if exists thyp_knowledge_time_trg on thyp_person_knowledge;
create trigger thyp_knowledge_time_trg before insert or update on thyp_person_knowledge
  for each row execute function thyp_knowledge_time_gate();

-- ---------------------------------------------------------------------------
-- 3 · Memory ledger. A firsthand memory requires that the person was actually
--     in the scene. A person cannot remember a room they were never gated into.
-- ---------------------------------------------------------------------------
create table if not exists thyp_memory_ledger (
  id                   uuid primary key default gen_random_uuid(),
  person_serial        text not null,
  memory_code          text not null,
  world_date           date not null,
  world_time           time,
  place_code           text references thyp_places(place_code),
  scene_code           text,
  summary              text not null,
  salience             smallint not null default 3 check (salience between 1 and 5),
  source               thyp_memory_source not null,
  source_person_serial text,
  created_at           timestamptz not null default now(),
  unique (person_serial, memory_code),
  constraint thyp_memory_summary check (length(btrim(summary)) >= 4)
);

do $$ begin
  alter table thyp_memory_ledger add constraint thyp_memory_person_fk
    foreign key (person_serial) references studio_world_characters(person_serial) on delete cascade;
exception when duplicate_object then null; when others then
  raise notice 'THYLORA PERSONS: memory FK held as soft reference (%).', sqlerrm; end $$;

create index if not exists thyp_memory_person_idx on thyp_memory_ledger(person_serial, world_date);

create or replace function thyp_memory_presence_gate() returns trigger
language plpgsql as $$
declare v_birth date;
begin
  select birth_world_date into v_birth from studio_world_characters where person_serial = new.person_serial;
  if v_birth is not null and new.world_date < v_birth then
    raise exception 'MEMORY_BEFORE_BIRTH: % born %, memory dated %',
      new.person_serial, v_birth, new.world_date;
  end if;
  if new.source = 'FIRSTHAND' and new.scene_code is not null then
    if not exists (select 1 from studio_scene_character_snapshots s
                    where s.scene_code = new.scene_code
                      and s.person_serial = new.person_serial
                      and s.gate_verdict = 'CLEARED') then
      raise exception 'FIRSTHAND_WITHOUT_PRESENCE: % has no cleared snapshot in scene %',
        new.person_serial, new.scene_code;
    end if;
  end if;
  if new.source in ('TOLD','OVERHEARD') and new.source_person_serial is null then
    raise exception 'MEMORY_SOURCE_REQUIRED: a % memory must name who it came from', new.source;
  end if;
  return new;
end $$;

drop trigger if exists thyp_memory_presence_trg on thyp_memory_ledger;
create trigger thyp_memory_presence_trg before insert or update on thyp_memory_ledger
  for each row execute function thyp_memory_presence_gate();

-- ---------------------------------------------------------------------------
-- 4 · Life events and work history
-- ---------------------------------------------------------------------------
create table if not exists thyp_life_events (
  id              uuid primary key default gen_random_uuid(),
  person_serial   text not null,
  event_code      text not null,
  event_kind      text not null,
  world_date      date not null,
  world_time      time,
  place_code      text references thyp_places(place_code),
  description     text not null,
  witnesses       text[] not null default '{}',
  recorded_at     timestamptz not null default now(),
  unique (person_serial, event_code)
);

do $$ begin
  alter table thyp_life_events add constraint thyp_life_event_person_fk
    foreign key (person_serial) references studio_world_characters(person_serial) on delete cascade;
exception when duplicate_object then null; when others then
  raise notice 'THYLORA PERSONS: life event FK held as soft reference (%).', sqlerrm; end $$;

create index if not exists thyp_life_event_when_idx on thyp_life_events(person_serial, world_date);

create table if not exists thyp_work_history (
  id                   uuid primary key default gen_random_uuid(),
  person_serial        text not null,
  occupation_code      text references thyp_occupations(occupation_code),
  rank_code            text,
  place_code           text references thyp_places(place_code),
  from_world_date      date not null,
  to_world_date        date,
  departure_reason     text,
  created_at           timestamptz not null default now(),
  constraint thyp_work_history_dates check (to_world_date is null or to_world_date >= from_world_date),
  constraint thyp_work_history_departure check (to_world_date is null or departure_reason is not null)
);

do $$ begin
  alter table thyp_work_history add constraint thyp_work_history_person_fk
    foreign key (person_serial) references studio_world_characters(person_serial) on delete cascade;
exception when duplicate_object then null; when others then
  raise notice 'THYLORA PERSONS: work history FK held as soft reference (%).', sqlerrm; end $$;

create index if not exists thyp_work_history_person_idx on thyp_work_history(person_serial, from_world_date);

-- ---------------------------------------------------------------------------
-- 5 · studio_character_state_ledger — Chairman-named table, append-only.
-- ---------------------------------------------------------------------------
create table if not exists studio_character_state_ledger (
  id                uuid primary key default gen_random_uuid(),
  person_serial     text not null,
  change_kind       thyp_change_kind not null,
  world_time_from   date not null,
  world_time_to     date not null,
  state_before      jsonb not null default '{}'::jsonb,
  state_after       jsonb not null default '{}'::jsonb,
  cause_ref         text,
  scene_code        text,
  written_by        text not null default 'SYSTEM',
  created_at        timestamptz not null default now()
);

alter table studio_character_state_ledger add column if not exists person_serial   text;
alter table studio_character_state_ledger add column if not exists change_kind     thyp_change_kind;
alter table studio_character_state_ledger add column if not exists world_time_from date;
alter table studio_character_state_ledger add column if not exists world_time_to   date;
alter table studio_character_state_ledger add column if not exists state_before    jsonb default '{}'::jsonb;
alter table studio_character_state_ledger add column if not exists state_after     jsonb default '{}'::jsonb;
alter table studio_character_state_ledger add column if not exists cause_ref       text;
alter table studio_character_state_ledger add column if not exists scene_code      text;
alter table studio_character_state_ledger add column if not exists written_by      text default 'SYSTEM';
alter table studio_character_state_ledger add column if not exists created_at      timestamptz default now();

do $$ begin
  alter table studio_character_state_ledger
    add constraint thyp_ledger_time_order check (world_time_to >= world_time_from);
exception when duplicate_object then null; when others then
  raise notice 'THYLORA PERSONS: ledger time order not added (%).', sqlerrm; end $$;

do $$ begin
  alter table studio_character_state_ledger
    add constraint thyp_ledger_changes_something check (state_before <> state_after);
exception when duplicate_object then null; when others then
  raise notice 'THYLORA PERSONS: ledger change check not added (%).', sqlerrm; end $$;

create index if not exists thyp_ledger_person_idx
  on studio_character_state_ledger(person_serial, world_time_to desc);

-- Append-only. Editing history is how continuity is lost, so the database
-- refuses it rather than trusting that nobody will.
create or replace function thyp_ledger_append_only() returns trigger
language plpgsql as $$
begin
  raise exception 'LEDGER_APPEND_ONLY: studio_character_state_ledger accepts inserts only (attempted %)', tg_op;
end $$;

drop trigger if exists thyp_ledger_no_update on studio_character_state_ledger;
create trigger thyp_ledger_no_update before update on studio_character_state_ledger
  for each row execute function thyp_ledger_append_only();

drop trigger if exists thyp_ledger_no_delete on studio_character_state_ledger;
create trigger thyp_ledger_no_delete before delete on studio_character_state_ledger
  for each row execute function thyp_ledger_append_only();

-- Every advance of a person's state is written here by trigger, so a direct
-- column write on studio_world_characters still leaves a trail.
create or replace function thyp_character_state_trail() returns trigger
language plpgsql as $$
declare v_kind thyp_change_kind;
begin
  if new.as_of_world_date is not distinct from old.as_of_world_date
     and new.age_years is not distinct from old.age_years
     and new.role_code is not distinct from old.role_code
     and new.rank_code is not distinct from old.rank_code
     and new.room_place_code is not distinct from old.room_place_code
     and new.home_place_code is not distinct from old.home_place_code
     and new.work_place_code is not distinct from old.work_place_code
     and new.current_emotional_state is not distinct from old.current_emotional_state then
    return new;
  end if;

  v_kind := case
    when new.age_years is distinct from old.age_years then 'PHYSICAL_AGING'
    when new.role_code is distinct from old.role_code
      or new.rank_code is distinct from old.rank_code
      or new.work_place_code is distinct from old.work_place_code then 'WORK_HISTORY'
    when new.room_place_code is distinct from old.room_place_code
      or new.home_place_code is distinct from old.home_place_code then 'ASSIGNMENT'
    when new.current_emotional_state is distinct from old.current_emotional_state then 'EMOTION'
    else 'EVENT' end;

  insert into studio_character_state_ledger(
    person_serial, change_kind, world_time_from, world_time_to,
    state_before, state_after, cause_ref, written_by)
  values (
    new.person_serial, v_kind,
    coalesce(old.as_of_world_date, new.as_of_world_date),
    coalesce(new.as_of_world_date, old.as_of_world_date),
    jsonb_strip_nulls(jsonb_build_object(
      'as_of_world_date', old.as_of_world_date, 'age_years', old.age_years,
      'role_code', old.role_code, 'rank_code', old.rank_code,
      'home_place_code', old.home_place_code, 'room_place_code', old.room_place_code,
      'work_place_code', old.work_place_code, 'emotional_state', old.current_emotional_state)),
    jsonb_strip_nulls(jsonb_build_object(
      'as_of_world_date', new.as_of_world_date, 'age_years', new.age_years,
      'role_code', new.role_code, 'rank_code', new.rank_code,
      'home_place_code', new.home_place_code, 'room_place_code', new.room_place_code,
      'work_place_code', new.work_place_code, 'emotional_state', new.current_emotional_state)),
    new.continuity_ref, 'TRIGGER:thyp_character_state_trail');
  return new;
end $$;

drop trigger if exists thyp_character_state_trail_trg on studio_world_characters;
create trigger thyp_character_state_trail_trg after update on studio_world_characters
  for each row execute function thyp_character_state_trail();

-- Time does not run backward on a person's state pointer.
create or replace function thyp_character_no_rewind() returns trigger
language plpgsql as $$
begin
  if old.as_of_world_date is not null and new.as_of_world_date is not null
     and new.as_of_world_date < old.as_of_world_date then
    raise exception 'STATE_REWIND_REFUSED: % is at %, cannot be moved back to %',
      new.person_serial, old.as_of_world_date, new.as_of_world_date;
  end if;
  return new;
end $$;

drop trigger if exists thyp_character_no_rewind_trg on studio_world_characters;
create trigger thyp_character_no_rewind_trg before update on studio_world_characters
  for each row execute function thyp_character_no_rewind();

commit;
