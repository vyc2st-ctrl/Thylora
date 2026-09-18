-- THYLORA PERSONS · 0007 · Portrait continuity
-- Workroom: WR-PERSONS-001
--
-- NO GENERIC ROYAL PORTRAIT. A portrait row cannot exist without a specific
-- person, the age and world date it depicts, the room it hangs in, its
-- dimensions, its frame and medium, a version number and provenance. Every one
-- of those is NOT NULL or check-constrained. A group portrait lists its further
-- subjects in thyp_portrait_subjects; it still names a primary subject.
--
-- BODY LOCK AT AGE. A portrait depicts a person as they were, so it carries the
-- body lock hash of that time. thyp_body_lock_history keeps every sealed lock a
-- person has held, and a portrait's hash must be one of them: a portrait cannot
-- depict a body the person never had.

begin;

do $$ begin
  create type thyp_portrait_medium as enum
    ('OIL','TEMPERA','CHARCOAL','INK','MINIATURE','TAPESTRY','RELIEF','CARVING','FRESCO');
exception when duplicate_object then null; end $$;

do $$ begin
  create type thyp_provenance_event as enum
    ('COMMISSIONED','SAT_FOR','COMPLETED','FRAMED','HUNG','MOVED','RESTORED','REFRAMED','RETIRED','LOST','DESTROYED');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- 1 · Body lock history. Every lock a person has ever held, kept so that age
--     state in a portrait or a past scene can be verified instead of assumed.
-- ---------------------------------------------------------------------------
create table if not exists thyp_body_lock_history (
  id               uuid primary key default gen_random_uuid(),
  person_serial    text not null,
  as_of_world_date date not null,
  body_lock_hash   text not null,
  height_cm        numeric(5,1),
  weight_kg        numeric(5,1),
  hair_color_code  text,
  hair_length_cm   numeric(4,1),
  skin_tone_code   text,
  recorded_at      timestamptz not null default now(),
  unique (person_serial, body_lock_hash),
  constraint thyp_lock_history_hash check (length(body_lock_hash) = 64)
);

create index if not exists thyp_lock_history_person_idx
  on thyp_body_lock_history(person_serial, as_of_world_date desc);

create or replace function thyp_body_lock_archive() returns trigger
language plpgsql as $$
begin
  insert into thyp_body_lock_history(
    person_serial, as_of_world_date, body_lock_hash,
    height_cm, weight_kg, hair_color_code, hair_length_cm, skin_tone_code)
  values (new.person_serial, new.as_of_world_date, new.body_lock_hash,
          new.height_cm, new.weight_kg, new.hair_color_code, new.hair_length_cm, new.skin_tone_code)
  on conflict (person_serial, body_lock_hash) do nothing;
  return null;
end $$;

drop trigger if exists thyp_body_lock_archive_trg on thyp_body_lock;
create trigger thyp_body_lock_archive_trg after insert or update on thyp_body_lock
  for each row execute function thyp_body_lock_archive();

-- Backfill any lock sealed before this migration.
insert into thyp_body_lock_history(
  person_serial, as_of_world_date, body_lock_hash,
  height_cm, weight_kg, hair_color_code, hair_length_cm, skin_tone_code)
select person_serial, as_of_world_date, body_lock_hash,
       height_cm, weight_kg, hair_color_code, hair_length_cm, skin_tone_code
  from thyp_body_lock where body_lock_hash is not null
on conflict (person_serial, body_lock_hash) do nothing;

-- Redefinition: now that the history exists, resolve the lock a person held at
-- a date from the history, newest lock at or before that date.
create or replace function thyp_body_lock_at(p_person_serial text, p_world_date date)
returns text language sql stable as $$
  select h.body_lock_hash
    from thyp_body_lock_history h
   where h.person_serial = p_person_serial
     and h.as_of_world_date <= p_world_date
   order by h.as_of_world_date desc, h.recorded_at desc
   limit 1;
$$;

-- ---------------------------------------------------------------------------
-- 2 · Portraits
-- ---------------------------------------------------------------------------
create table if not exists thyp_portraits (
  portrait_serial           text primary key,
  portrait_code             text not null unique,
  title                     text not null,
  subject_person_serial     text not null,
  subject_age_years         integer not null check (subject_age_years >= 0),
  subject_world_date        date not null,
  subject_body_lock_hash    text not null,
  hung_place_code           text not null references thyp_places(place_code),
  hung_wall                 text,
  hung_height_from_floor_cm integer check (hung_height_from_floor_cm is null or hung_height_from_floor_cm >= 0),
  width_cm                  numeric(6,1) not null check (width_cm > 0),
  height_cm                 numeric(6,1) not null check (height_cm > 0),
  depth_cm                  numeric(5,1) not null check (depth_cm > 0),
  medium                    thyp_portrait_medium not null,
  support_material          text not null,
  frame_material            text not null,
  frame_finish              text,
  version_no                integer not null default 1 check (version_no >= 1),
  replaces_portrait_serial  text references thyp_portraits(portrait_serial),
  artist_person_serial      text,
  artist_name_ref           text,
  commissioned_by_person_serial text,
  commissioned_world_date   date,
  completed_world_date      date,
  hung_world_date           date,
  portrait_state            thyp_record_state not null default 'ACTIVE',
  created_at                timestamptz not null default now(),
  -- Provenance is not optional. Who made it and who commissioned it are both
  -- recorded, even when the maker is only a named reference.
  constraint thyp_portrait_provenance check (
    (artist_person_serial is not null or (artist_name_ref is not null and length(btrim(artist_name_ref)) >= 2))
    and commissioned_by_person_serial is not null
    and commissioned_world_date is not null
  ),
  constraint thyp_portrait_frame check (length(btrim(frame_material)) >= 2 and length(btrim(support_material)) >= 2),
  constraint thyp_portrait_date_order check (
    (completed_world_date is null or commissioned_world_date is null or completed_world_date >= commissioned_world_date)
    and (hung_world_date is null or completed_world_date is null or hung_world_date >= completed_world_date)
  ),
  constraint thyp_portrait_lock_hash check (length(subject_body_lock_hash) = 64),
  -- A version above 1 replaces something; version 1 replaces nothing.
  constraint thyp_portrait_version_chain check (
    (version_no = 1 and replaces_portrait_serial is null)
    or (version_no > 1 and replaces_portrait_serial is not null)
  )
);

do $$ begin
  alter table thyp_portraits add constraint thyp_portrait_subject_fk
    foreign key (subject_person_serial) references studio_world_characters(person_serial) on delete restrict;
exception when duplicate_object then null; when others then
  raise notice 'THYLORA PERSONS: portrait subject FK held as soft reference (%).', sqlerrm; end $$;

create index if not exists thyp_portrait_subject_idx on thyp_portraits(subject_person_serial, subject_world_date);
create index if not exists thyp_portrait_room_idx    on thyp_portraits(hung_place_code) where portrait_state = 'ACTIVE';

-- Further subjects of a group portrait. Each is still a specific person at a
-- specific age carrying a lock the person actually held.
create table if not exists thyp_portrait_subjects (
  portrait_serial   text not null references thyp_portraits(portrait_serial) on delete cascade,
  person_serial     text not null,
  subject_age_years integer not null check (subject_age_years >= 0),
  body_lock_hash    text not null,
  position_index    smallint not null default 0,
  primary key (portrait_serial, person_serial),
  constraint thyp_portrait_subject_lock check (length(body_lock_hash) = 64)
);

do $$ begin
  alter table thyp_portrait_subjects add constraint thyp_portrait_subjects_person_fk
    foreign key (person_serial) references studio_world_characters(person_serial) on delete restrict;
exception when duplicate_object then null; when others then
  raise notice 'THYLORA PERSONS: portrait subjects FK held as soft reference (%).', sqlerrm; end $$;

-- The portrait's claims are checked against the person, not trusted.
create or replace function thyp_portrait_gate() returns trigger
language plpgsql as $$
declare
  v_birth date; v_expected integer; v_room thyp_place_kind;
  v_prev thyp_portraits;
begin
  -- Age must be the arithmetic of the subject's birth date at the depicted date.
  select birth_world_date into v_birth
    from studio_world_characters where person_serial = new.subject_person_serial;
  if v_birth is null then
    raise exception 'PORTRAIT_SUBJECT_UNDATED: % has no birth world date; age state cannot be fixed',
      new.subject_person_serial;
  end if;
  v_expected := (extract(year from new.subject_world_date) - extract(year from v_birth))::integer
    - case when (extract(month from new.subject_world_date)::integer * 100 + extract(day from new.subject_world_date)::integer)
             < (extract(month from v_birth)::integer * 100 + extract(day from v_birth)::integer)
           then 1 else 0 end;
  if new.subject_age_years <> v_expected then
    raise exception 'PORTRAIT_AGE_MISMATCH: % is % on %, portrait claims %',
      new.subject_person_serial, v_expected, new.subject_world_date, new.subject_age_years;
  end if;

  -- The depicted body must be one the subject actually held, and held by the
  -- date depicted. A portrait cannot show a body its subject did not yet have.
  if not exists (select 1 from thyp_body_lock_history h
                  where h.person_serial = new.subject_person_serial
                    and h.body_lock_hash = new.subject_body_lock_hash) then
    raise exception 'PORTRAIT_BODY_LOCK_UNKNOWN: % never held lock %',
      new.subject_person_serial, left(new.subject_body_lock_hash, 12);
  end if;
  if not exists (select 1 from thyp_body_lock_history h
                  where h.person_serial = new.subject_person_serial
                    and h.body_lock_hash = new.subject_body_lock_hash
                    and h.as_of_world_date <= new.subject_world_date) then
    raise exception 'PORTRAIT_BODY_LOCK_NOT_YET_HELD: % did not hold lock % by %',
      new.subject_person_serial, left(new.subject_body_lock_hash, 12), new.subject_world_date;
  end if;

  -- A portrait hangs in a room, hall, chapel or gallery-like place, not in a road.
  select place_kind into v_room from thyp_places where place_code = new.hung_place_code;
  if v_room not in ('ROOM','HALL','WING','CHAPEL','SCHOOLROOM','CASTLE','FLOOR','GATEHOUSE') then
    raise exception 'PORTRAIT_PLACE_INVALID: % is a %, which does not hang portraits',
      new.hung_place_code, v_room;
  end if;

  -- A new version replaces an earlier portrait of the SAME subject, and never
  -- overwrites it: the previous row stays and is marked superseded in 0008.
  if new.replaces_portrait_serial is not null then
    select * into v_prev from thyp_portraits where portrait_serial = new.replaces_portrait_serial;
    if v_prev.portrait_serial is null then
      raise exception 'PORTRAIT_PREDECESSOR_UNKNOWN: %', new.replaces_portrait_serial;
    end if;
    if v_prev.subject_person_serial <> new.subject_person_serial then
      raise exception 'PORTRAIT_VERSION_SUBJECT_CHANGED: % depicts %, replacement depicts %',
        v_prev.portrait_serial, v_prev.subject_person_serial, new.subject_person_serial;
    end if;
    if new.version_no <= v_prev.version_no then
      raise exception 'PORTRAIT_VERSION_NOT_FORWARD: replacement version % does not follow %',
        new.version_no, v_prev.version_no;
    end if;
  end if;

  return new;
end $$;

drop trigger if exists thyp_portrait_gate_trg on thyp_portraits;
create trigger thyp_portrait_gate_trg before insert or update on thyp_portraits
  for each row execute function thyp_portrait_gate();

create or replace function thyp_portrait_subject_gate() returns trigger
language plpgsql as $$
begin
  if not exists (select 1 from thyp_body_lock_history h
                  where h.person_serial = new.person_serial
                    and h.body_lock_hash = new.body_lock_hash) then
    raise exception 'PORTRAIT_BODY_LOCK_UNKNOWN: % never held lock %',
      new.person_serial, left(new.body_lock_hash, 12);
  end if;
  return new;
end $$;

drop trigger if exists thyp_portrait_subject_gate_trg on thyp_portrait_subjects;
create trigger thyp_portrait_subject_gate_trg before insert or update on thyp_portrait_subjects
  for each row execute function thyp_portrait_subject_gate();

-- ---------------------------------------------------------------------------
-- 3 · Provenance trail, append-only
-- ---------------------------------------------------------------------------
create table if not exists thyp_portrait_provenance (
  id                 uuid primary key default gen_random_uuid(),
  portrait_serial    text not null references thyp_portraits(portrait_serial) on delete cascade,
  event_kind         thyp_provenance_event not null,
  world_date         date not null,
  place_code         text references thyp_places(place_code),
  actor_person_serial text,
  actor_name_ref     text,
  note               text,
  recorded_at        timestamptz not null default now()
);

create index if not exists thyp_portrait_provenance_idx
  on thyp_portrait_provenance(portrait_serial, world_date);

-- One record per event per portrait per world date, so re-applying a seed does
-- not duplicate a provenance trail that is append-only and cannot be cleaned up.
create unique index if not exists thyp_portrait_provenance_unique
  on thyp_portrait_provenance(portrait_serial, event_kind, world_date);

create or replace function thyp_provenance_append_only() returns trigger
language plpgsql as $$
begin
  raise exception 'PROVENANCE_APPEND_ONLY: thyp_portrait_provenance accepts inserts only (attempted %)', tg_op;
end $$;

drop trigger if exists thyp_provenance_no_update on thyp_portrait_provenance;
create trigger thyp_provenance_no_update before update on thyp_portrait_provenance
  for each row execute function thyp_provenance_append_only();

drop trigger if exists thyp_provenance_no_delete on thyp_portrait_provenance;
create trigger thyp_provenance_no_delete before delete on thyp_portrait_provenance
  for each row execute function thyp_provenance_append_only();

commit;
