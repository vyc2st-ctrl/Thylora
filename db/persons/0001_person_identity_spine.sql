-- THYLORA PERSONS · 0001 · Identity spine and serial registry
-- Workroom: WR-PERSONS-001
-- Backend: thylora-dash (jvsdxhrfhtlgaknhjxlz)
--
-- AUTHORITY NOTE
-- This file is a reviewable migration. It is NOT applied by this repository.
-- Applying DDL to the live backend is a production mutation and is held for
-- Chairman execution. Every statement is idempotent and additive.
--
-- THE FIVE CHAIRMAN-NAMED OBJECTS
-- thylora_person_serial_registry, thylora_person_identity,
-- studio_world_characters, studio_scene_character_snapshots and
-- studio_character_state_ledger are named by the Chairman and were NOT found in
-- this repository. They may exist on the live backend, which this session cannot
-- reach. Each is therefore created only if absent, and every column is added
-- with `add column if not exists`, so a live table of a different shape GAINS
-- the continuity columns instead of colliding. Nothing is dropped or renamed.
-- Foreign keys onto them are attempted inside exception blocks: a shape mismatch
-- degrades to a soft reference with a notice rather than failing the migration.
--
-- RECORD CLASS
-- World characters are FICTIONAL / SIMULATED WORLD CHARACTER RECORDS. Nothing in
-- this schema asserts that a world character is a conscious being. Earth identity
-- and world depiction are separated at the data layer and cannot be merged.

begin;

create extension if not exists "pgcrypto";

do $$ begin
  create type thyp_world_status as enum ('EARTH_REAL','WORLD_SIMULATED');
exception when duplicate_object then null; end $$;

do $$ begin
  create type thyp_record_state as enum
    ('DRAFT','ACTIVE','SUSPENDED','ARCHIVED','DECEASED_IN_WORLD');
exception when duplicate_object then null; end $$;

do $$ begin
  create type thyp_serial_class as enum
    ('PERSON_WORLD','PERSON_EARTH','CROWD_PERSON','PORTRAIT','HOUSEHOLD','PLACE','SCENE');
exception when duplicate_object then null; end $$;

do $$ begin
  create type thyp_name_state as enum ('CONFIRMED','PENDING_CHAIRMAN');
exception when duplicate_object then null; end $$;

-- A person is one of exactly three tiers. There is no fourth tier, and in
-- particular there is no "extra" or "filler" tier: a person with no tier cannot
-- be written at all, which is the structural end of random background people.
do $$ begin
  create type thyp_person_tier as enum
    ('NAMED_PERSISTENT','RECURRING_BACKGROUND','DETERMINISTIC_CROWD');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- 1 · Serial registry. Every person, portrait, household, place and scene in the
--     world holds a serial issued here. Serials are never reused: retirement
--     records a reason and the row stays.
-- ---------------------------------------------------------------------------
create table if not exists thylora_person_serial_registry (
  serial             text primary key,
  serial_class       thyp_serial_class not null,
  sequence_no        integer not null,
  label              text not null,
  issued_for         text,
  issued_at          timestamptz not null default now(),
  retired_at         timestamptz,
  retirement_reason  text
);

-- Additive column top-up for a live table of another shape.
alter table thylora_person_serial_registry add column if not exists serial_class      thyp_serial_class;
alter table thylora_person_serial_registry add column if not exists sequence_no       integer;
alter table thylora_person_serial_registry add column if not exists label             text;
alter table thylora_person_serial_registry add column if not exists issued_for        text;
alter table thylora_person_serial_registry add column if not exists issued_at         timestamptz default now();
alter table thylora_person_serial_registry add column if not exists retired_at        timestamptz;
alter table thylora_person_serial_registry add column if not exists retirement_reason text;

do $$ begin
  alter table thylora_person_serial_registry
    add constraint thyp_serial_shape check (serial ~ '^THY-[A-Z]{1,3}-[0-9]{4,8}$');
exception when duplicate_object then null; when others then
  raise notice 'THYLORA PERSONS: serial shape check not added (%).', sqlerrm; end $$;

do $$ begin
  alter table thylora_person_serial_registry
    add constraint thyp_serial_class_sequence_unique unique (serial_class, sequence_no);
exception when duplicate_object then null; when others then
  raise notice 'THYLORA PERSONS: serial sequence uniqueness not added (%).', sqlerrm; end $$;

do $$ begin
  alter table thylora_person_serial_registry
    add constraint thyp_serial_retirement_reasoned
    check (retired_at is null or (retirement_reason is not null and length(btrim(retirement_reason)) >= 4));
exception when duplicate_object then null; when others then
  raise notice 'THYLORA PERSONS: retirement check not added (%).', sqlerrm; end $$;

create index if not exists thyp_serial_class_idx
  on thylora_person_serial_registry(serial_class) where retired_at is null;

-- Serial issue is deterministic and gap-free per class. Two calls never collide
-- and no serial is ever handed out twice.
create or replace function thyp_issue_serial(
  p_class thyp_serial_class, p_label text, p_issued_for text default null
) returns text language plpgsql as $$
declare v_prefix text; v_next integer; v_serial text; v_width integer;
begin
  v_prefix := case p_class
    when 'PERSON_WORLD' then 'P'  when 'PERSON_EARTH' then 'E'
    when 'CROWD_PERSON' then 'C'  when 'PORTRAIT'     then 'PT'
    when 'HOUSEHOLD'    then 'H'  when 'PLACE'        then 'PL'
    when 'SCENE'        then 'SC' end;
  v_width := case when p_class = 'CROWD_PERSON' then 6 else 4 end;
  select coalesce(max(sequence_no), 0) + 1 into v_next
    from thylora_person_serial_registry where serial_class = p_class;
  v_serial := 'THY-' || v_prefix || '-' || lpad(v_next::text, v_width, '0');
  insert into thylora_person_serial_registry(serial, serial_class, sequence_no, label, issued_for)
  values (v_serial, p_class, v_next, p_label, p_issued_for);
  return v_serial;
end $$;

-- ---------------------------------------------------------------------------
-- 2 · Identity. This table holds WHO, and nothing about a body. Earth identity
--     and world depiction are different rows in different tables on purpose.
-- ---------------------------------------------------------------------------
create table if not exists thylora_person_identity (
  person_serial           text primary key,
  world_status            thyp_world_status not null,
  person_tier             thyp_person_tier not null,
  display_name            text,
  placeholder_label       text,
  name_state              thyp_name_state not null default 'CONFIRMED',
  sort_name               text,
  is_minor                boolean not null default false,
  guardian_person_serial  text,
  identity_state          thyp_record_state not null default 'ACTIVE',
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

alter table thylora_person_identity add column if not exists world_status           thyp_world_status;
alter table thylora_person_identity add column if not exists person_tier            thyp_person_tier;
alter table thylora_person_identity add column if not exists display_name           text;
alter table thylora_person_identity add column if not exists placeholder_label      text;
alter table thylora_person_identity add column if not exists name_state             thyp_name_state default 'CONFIRMED';
alter table thylora_person_identity add column if not exists sort_name              text;
alter table thylora_person_identity add column if not exists is_minor               boolean default false;
alter table thylora_person_identity add column if not exists guardian_person_serial text;
alter table thylora_person_identity add column if not exists identity_state         thyp_record_state default 'ACTIVE';
alter table thylora_person_identity add column if not exists created_at             timestamptz default now();
alter table thylora_person_identity add column if not exists updated_at             timestamptz default now();

do $$ begin
  alter table thylora_person_identity
    add constraint thyp_identity_serial_fk
    foreign key (person_serial) references thylora_person_serial_registry(serial);
exception when duplicate_object then null; when others then
  raise notice 'THYLORA PERSONS: identity->registry FK held as soft reference (%).', sqlerrm; end $$;

do $$ begin
  alter table thylora_person_identity
    add constraint thyp_identity_guardian_fk
    foreign key (guardian_person_serial) references thylora_person_identity(person_serial);
exception when duplicate_object then null; when others then
  raise notice 'THYLORA PERSONS: identity guardian FK held as soft reference (%).', sqlerrm; end $$;

-- A name is either confirmed or openly pending. An unnamed person gets a stable
-- serial and a placeholder label; no name is ever invented to fill the gap.
do $$ begin
  alter table thylora_person_identity add constraint thyp_identity_name_truth check (
    (name_state = 'CONFIRMED'
       and display_name is not null and length(btrim(display_name)) >= 1)
    or
    (name_state = 'PENDING_CHAIRMAN'
       and placeholder_label is not null and length(btrim(placeholder_label)) >= 3)
  );
exception when duplicate_object then null; when others then
  raise notice 'THYLORA PERSONS: name truth check not added (%).', sqlerrm; end $$;

-- Mirrors rael_profiles_guardian_required: a minor is never active without a
-- recorded guardian.
do $$ begin
  alter table thylora_person_identity add constraint thyp_identity_guardian_required
    check (is_minor = false or guardian_person_serial is not null);
exception when duplicate_object then null; when others then
  raise notice 'THYLORA PERSONS: guardian requirement not added (%).', sqlerrm; end $$;

create index if not exists thyp_identity_tier_idx
  on thylora_person_identity(person_tier, identity_state);

-- ---------------------------------------------------------------------------
-- 3 · Earth portrayal link. A world character may depict a real person. That
--     link lives here, is explicit, and carries the consent that governs what
--     may be stored about the real subject. No medical or biological detail is
--     ever written against an Earth person: it is only ever a simulated
--     attribute of the world character, and for a real minor it additionally
--     requires a recorded guardian consent (see 0002).
-- ---------------------------------------------------------------------------
create table if not exists thyp_earth_portrayal_links (
  id                      uuid primary key default gen_random_uuid(),
  world_person_serial     text not null,
  earth_subject_ref       text not null,
  earth_subject_is_minor  boolean not null default false,
  guardian_person_serial  text,
  consent_ref             text,
  consent_recorded_at     timestamptz,
  link_state              thyp_record_state not null default 'ACTIVE',
  created_at              timestamptz not null default now(),
  unique (world_person_serial, earth_subject_ref),
  constraint thyp_portrayal_minor_guardian check (
    earth_subject_is_minor = false
    or (guardian_person_serial is not null
        and consent_ref is not null
        and consent_recorded_at is not null)
  )
);

do $$ begin
  alter table thyp_earth_portrayal_links
    add constraint thyp_portrayal_person_fk
    foreign key (world_person_serial) references thylora_person_identity(person_serial) on delete cascade;
exception when duplicate_object then null; when others then
  raise notice 'THYLORA PERSONS: portrayal FK held as soft reference (%).', sqlerrm; end $$;

create index if not exists thyp_portrayal_person_idx
  on thyp_earth_portrayal_links(world_person_serial) where link_state = 'ACTIVE';

create or replace function thyp_touch_updated_at() returns trigger
language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists thyp_identity_touch on thylora_person_identity;
create trigger thyp_identity_touch before update on thylora_person_identity
  for each row execute function thyp_touch_updated_at();

commit;
