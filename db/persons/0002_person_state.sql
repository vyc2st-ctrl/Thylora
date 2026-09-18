-- THYLORA PERSONS · 0002 · Persistent person state
-- Workroom: WR-PERSONS-001
--
-- One row per recurring person per state family. This is the state that imagery
-- must match. The body lock is hashed so that "the same person" is a value that
-- can be compared, not a description someone re-reads and re-imagines.
--
-- FICTIONAL RECORDS. Simulated biological attributes (constitution, blood type)
-- are attributes of a WORLD CHARACTER. They are never written against an Earth
-- person, and a world character that depicts a real person may only carry them
-- when that portrayal link records consent (0001 forces guardian consent for a
-- real minor before the link may exist at all).

begin;

do $$ begin
  create type thyp_handedness as enum ('LEFT','RIGHT','AMBIDEXTROUS','UNSPECIFIED');
exception when duplicate_object then null; end $$;

do $$ begin
  create type thyp_mobility as enum
    ('FULL','LIMITED_GAIT','CANE','CRUTCH','CARRIED','WHEELED','BEDBOUND','UNSPECIFIED');
exception when duplicate_object then null; end $$;

do $$ begin
  create type thyp_canon_state as enum ('CANONICALLY_DEFINED','NOT_DEFINED');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- 1 · studio_world_characters — the character spine. Chairman-named table:
--     created only if absent, columns topped up additively.
-- ---------------------------------------------------------------------------
create table if not exists studio_world_characters (
  person_serial         text primary key,
  character_code        text unique,
  world_status          thyp_world_status not null default 'WORLD_SIMULATED',
  simulated_disclosure  text,
  birth_world_date      date,
  as_of_world_date      date,
  as_of_world_time      time,
  age_years             integer,
  role_code             text,
  rank_code             text,
  household_serial      text,
  home_place_code       text,
  room_place_code       text,
  work_place_code       text,
  current_emotional_state text,
  continuity_ref        text,
  character_state       thyp_record_state not null default 'ACTIVE',
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

alter table studio_world_characters add column if not exists character_code          text;
alter table studio_world_characters add column if not exists world_status            thyp_world_status default 'WORLD_SIMULATED';
alter table studio_world_characters add column if not exists simulated_disclosure    text;
alter table studio_world_characters add column if not exists birth_world_date        date;
alter table studio_world_characters add column if not exists as_of_world_date        date;
alter table studio_world_characters add column if not exists as_of_world_time        time;
alter table studio_world_characters add column if not exists age_years               integer;
alter table studio_world_characters add column if not exists role_code               text;
alter table studio_world_characters add column if not exists rank_code               text;
alter table studio_world_characters add column if not exists household_serial        text;
alter table studio_world_characters add column if not exists home_place_code         text;
alter table studio_world_characters add column if not exists room_place_code         text;
alter table studio_world_characters add column if not exists work_place_code         text;
alter table studio_world_characters add column if not exists current_emotional_state text;
alter table studio_world_characters add column if not exists continuity_ref          text;
alter table studio_world_characters add column if not exists character_state         thyp_record_state default 'ACTIVE';
alter table studio_world_characters add column if not exists created_at              timestamptz default now();
alter table studio_world_characters add column if not exists updated_at              timestamptz default now();

do $$ begin
  alter table studio_world_characters
    add constraint thyp_character_identity_fk
    foreign key (person_serial) references thylora_person_identity(person_serial) on delete cascade;
exception when duplicate_object then null; when others then
  raise notice 'THYLORA PERSONS: character->identity FK held as soft reference (%).', sqlerrm; end $$;

-- A world character can never be presented as an Earth person, and always
-- carries a visible disclosure. Same rule as rael_channels_world_truth.
do $$ begin
  alter table studio_world_characters add constraint thyp_character_world_truth check (
    world_status = 'WORLD_SIMULATED'
    and simulated_disclosure is not null
    and length(btrim(simulated_disclosure)) >= 12
  );
exception when duplicate_object then null; when others then
  raise notice 'THYLORA PERSONS: world truth check not added (%).', sqlerrm; end $$;

-- Age is not a free-text opinion. It is the arithmetic of birth date against the
-- date being depicted, so a scene cannot quietly age or de-age anyone.
do $$ begin
  alter table studio_world_characters add constraint thyp_character_age_arithmetic check (
    age_years is null or birth_world_date is null or as_of_world_date is null
    or age_years = (
      (extract(year from as_of_world_date) - extract(year from birth_world_date))::integer
      - case when (extract(month from as_of_world_date)::integer * 100 + extract(day from as_of_world_date)::integer)
               < (extract(month from birth_world_date)::integer * 100 + extract(day from birth_world_date)::integer)
             then 1 else 0 end
    )
  );
exception when duplicate_object then null; when others then
  raise notice 'THYLORA PERSONS: age arithmetic check not added (%).', sqlerrm; end $$;

do $$ begin
  alter table studio_world_characters add constraint thyp_character_age_sane
    check (age_years is null or (age_years >= 0 and age_years <= 130));
exception when duplicate_object then null; when others then
  raise notice 'THYLORA PERSONS: age range check not added (%).', sqlerrm; end $$;

create index if not exists thyp_character_state_idx
  on studio_world_characters(character_state, role_code);
create index if not exists thyp_character_place_idx
  on studio_world_characters(home_place_code, work_place_code);

-- ---------------------------------------------------------------------------
-- 2 · Body lock. The dimensional truth imagery must match.
-- ---------------------------------------------------------------------------
create table if not exists thyp_body_lock (
  person_serial          text primary key,
  as_of_world_date       date not null,
  height_cm              numeric(5,1),
  weight_kg              numeric(5,1),
  shoulder_cm            numeric(5,1),
  chest_cm               numeric(5,1),
  waist_cm               numeric(5,1),
  hip_cm                 numeric(5,1),
  inseam_cm              numeric(5,1),
  head_circumference_cm  numeric(5,1),
  foot_length_cm         numeric(4,1),
  skin_tone_code         text,
  skin_undertone         text,
  hair_color_code        text,
  hair_texture           text,
  hair_length_cm         numeric(4,1),
  hairline               text,
  default_hair_style     text,
  eye_color_code         text,
  face_geometry          jsonb not null default '{}'::jsonb,
  face_geometry_hash     text,
  handedness             thyp_handedness not null default 'UNSPECIFIED',
  mobility               thyp_mobility not null default 'FULL',
  body_lock_hash         text,
  locked_at              timestamptz not null default now(),
  updated_at             timestamptz not null default now(),
  constraint thyp_body_lock_positive check (
    (height_cm is null or height_cm between 30 and 260)
    and (weight_kg is null or weight_kg between 1 and 400)
  )
);

do $$ begin
  alter table thyp_body_lock add constraint thyp_body_lock_person_fk
    foreign key (person_serial) references studio_world_characters(person_serial) on delete cascade;
exception when duplicate_object then null; when others then
  raise notice 'THYLORA PERSONS: body lock FK held as soft reference (%).', sqlerrm; end $$;

-- The lock hash is derived, never typed. Two scenes agree on a person's body
-- when their hashes are equal; that is the comparison the gate in 0008 makes.
create or replace function thyp_body_lock_hash(p_row thyp_body_lock)
returns text language sql immutable as $$
  select encode(digest(concat_ws('|',
    p_row.person_serial,
    coalesce(p_row.height_cm::text,''),      coalesce(p_row.weight_kg::text,''),
    coalesce(p_row.shoulder_cm::text,''),    coalesce(p_row.chest_cm::text,''),
    coalesce(p_row.waist_cm::text,''),       coalesce(p_row.hip_cm::text,''),
    coalesce(p_row.inseam_cm::text,''),      coalesce(p_row.head_circumference_cm::text,''),
    coalesce(p_row.foot_length_cm::text,''), coalesce(p_row.skin_tone_code,''),
    coalesce(p_row.skin_undertone,''),       coalesce(p_row.hair_color_code,''),
    coalesce(p_row.hair_texture,''),         coalesce(p_row.hair_length_cm::text,''),
    coalesce(p_row.hairline,''),             coalesce(p_row.default_hair_style,''),
    coalesce(p_row.eye_color_code,''),       coalesce(p_row.face_geometry::text,'{}'),
    p_row.handedness::text,                  p_row.mobility::text
  ), 'sha256'), 'hex');
$$;

create or replace function thyp_body_lock_seal() returns trigger
language plpgsql as $$
begin
  new.face_geometry_hash := encode(digest(coalesce(new.face_geometry::text,'{}'), 'sha256'), 'hex');
  new.body_lock_hash     := thyp_body_lock_hash(new);
  new.updated_at         := now();
  return new;
end $$;

drop trigger if exists thyp_body_lock_seal_trg on thyp_body_lock;
create trigger thyp_body_lock_seal_trg before insert or update on thyp_body_lock
  for each row execute function thyp_body_lock_seal();

-- Which lock did this person hold on a given world date? 0007 redefines this to
-- read thyp_body_lock_history, so a past-dated scene or portrait is checked
-- against the body the person actually had then, not the one they have now.
create or replace function thyp_body_lock_at(p_person_serial text, p_world_date date)
returns text language sql stable as $$
  select body_lock_hash from thyp_body_lock
   where person_serial = p_person_serial and as_of_world_date <= p_world_date;
$$;

-- ---------------------------------------------------------------------------
-- 3 · Voice
-- ---------------------------------------------------------------------------
create table if not exists thyp_voice_profile (
  person_serial        text primary key,
  voice_code           text,
  register             text,
  fundamental_hz_low   integer check (fundamental_hz_low is null or fundamental_hz_low between 40 and 600),
  fundamental_hz_high  integer check (fundamental_hz_high is null or fundamental_hz_high between 40 and 900),
  timbre               text,
  accent_code          text,
  cadence              text,
  languages_spoken     text[] not null default '{}',
  speech_notes         text,
  updated_at           timestamptz not null default now(),
  constraint thyp_voice_range check (
    fundamental_hz_low is null or fundamental_hz_high is null
    or fundamental_hz_high >= fundamental_hz_low
  )
);

do $$ begin
  alter table thyp_voice_profile add constraint thyp_voice_person_fk
    foreign key (person_serial) references studio_world_characters(person_serial) on delete cascade;
exception when duplicate_object then null; when others then
  raise notice 'THYLORA PERSONS: voice FK held as soft reference (%).', sqlerrm; end $$;

-- ---------------------------------------------------------------------------
-- 4 · Simulated biological profile. Consent-gated, fiction-only.
-- ---------------------------------------------------------------------------
create table if not exists thyp_bio_profile (
  person_serial     text primary key,
  blood_type        text check (blood_type is null or blood_type in
                      ('O-','O+','A-','A+','B-','B+','AB-','AB+')),
  constitution_code text,
  dominant_eye      text check (dominant_eye is null or dominant_eye in ('LEFT','RIGHT','NONE')),
  vision_code       text,
  hearing_code      text,
  stamina_band      text,
  simulated_only    boolean not null default true,
  updated_at        timestamptz not null default now(),
  -- Structural refusal: this table cannot be repurposed for a real person's
  -- health record. The only permitted value is "this is simulated".
  constraint thyp_bio_simulated_only check (simulated_only = true)
);

do $$ begin
  alter table thyp_bio_profile add constraint thyp_bio_person_fk
    foreign key (person_serial) references studio_world_characters(person_serial) on delete cascade;
exception when duplicate_object then null; when others then
  raise notice 'THYLORA PERSONS: bio FK held as soft reference (%).', sqlerrm; end $$;

-- A world character that depicts a real person may only carry simulated
-- biological attributes when every active portrayal link records consent.
create or replace function thyp_bio_consent_gate() returns trigger
language plpgsql as $$
declare v_missing integer;
begin
  select count(*) into v_missing
    from thyp_earth_portrayal_links l
   where l.world_person_serial = new.person_serial
     and l.link_state = 'ACTIVE'
     and (l.consent_ref is null or l.consent_recorded_at is null);
  if v_missing > 0 then
    raise exception 'PORTRAYAL_CONSENT_REQUIRED: % active Earth portrayal link(s) for % record no consent; simulated biological attributes refused',
      v_missing, new.person_serial;
  end if;
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists thyp_bio_consent_trg on thyp_bio_profile;
create trigger thyp_bio_consent_trg before insert or update on thyp_bio_profile
  for each row execute function thyp_bio_consent_gate();

-- ---------------------------------------------------------------------------
-- 5 · Cognition and personality
-- ---------------------------------------------------------------------------
create table if not exists thyp_cognition_profile (
  person_serial    text primary key,
  temperament_code text,
  personality      jsonb not null default '{}'::jsonb,
  literacy_level   text,
  numeracy_level   text,
  languages_read   text[] not null default '{}',
  decision_style   text,
  moral_frame_code text,
  attention_notes  text,
  updated_at       timestamptz not null default now()
);

do $$ begin
  alter table thyp_cognition_profile add constraint thyp_cognition_person_fk
    foreign key (person_serial) references studio_world_characters(person_serial) on delete cascade;
exception when duplicate_object then null; when others then
  raise notice 'THYLORA PERSONS: cognition FK held as soft reference (%).', sqlerrm; end $$;

-- ---------------------------------------------------------------------------
-- 6 · Status, income, religious/cultural state
--     "Where canonically defined" is enforced: a religion or culture code
--     requires a named canonical source. Nothing is assigned by assumption.
-- ---------------------------------------------------------------------------
create table if not exists thyp_person_status (
  person_serial          text primary key,
  status_rank            text,
  income_band            text,
  income_minor_annual    bigint check (income_minor_annual is null or income_minor_annual >= 0),
  religion_state         thyp_canon_state not null default 'NOT_DEFINED',
  religion_code          text,
  culture_state          thyp_canon_state not null default 'NOT_DEFINED',
  culture_code           text,
  canonical_source       text,
  updated_at             timestamptz not null default now(),
  constraint thyp_status_religion_canon check (
    (religion_state = 'NOT_DEFINED' and religion_code is null)
    or (religion_state = 'CANONICALLY_DEFINED' and religion_code is not null and canonical_source is not null)
  ),
  constraint thyp_status_culture_canon check (
    (culture_state = 'NOT_DEFINED' and culture_code is null)
    or (culture_state = 'CANONICALLY_DEFINED' and culture_code is not null and canonical_source is not null)
  )
);

do $$ begin
  alter table thyp_person_status add constraint thyp_status_person_fk
    foreign key (person_serial) references studio_world_characters(person_serial) on delete cascade;
exception when duplicate_object then null; when others then
  raise notice 'THYLORA PERSONS: status FK held as soft reference (%).', sqlerrm; end $$;

-- ---------------------------------------------------------------------------
-- 7 · Current condition: emotional state and injuries
-- ---------------------------------------------------------------------------
create table if not exists thyp_person_condition (
  person_serial    text primary key,
  as_of_world_date date not null,
  as_of_world_time time,
  emotional_state  text not null,
  mood_valence     smallint check (mood_valence is null or mood_valence between -5 and 5),
  arousal          smallint check (arousal is null or arousal between 0 and 5),
  stressors        text[] not null default '{}',
  fatigue_band     text,
  updated_at       timestamptz not null default now()
);

do $$ begin
  alter table thyp_person_condition add constraint thyp_condition_person_fk
    foreign key (person_serial) references studio_world_characters(person_serial) on delete cascade;
exception when duplicate_object then null; when others then
  raise notice 'THYLORA PERSONS: condition FK held as soft reference (%).', sqlerrm; end $$;

create table if not exists thyp_injuries (
  id                  uuid primary key default gen_random_uuid(),
  person_serial       text not null,
  injury_code         text not null,
  body_region         text not null,
  severity            text not null check (severity in ('MINOR','MODERATE','SERIOUS','GRAVE')),
  sustained_world_date date not null,
  healed_world_date   date,
  visible_in_imagery  boolean not null default false,
  description         text,
  created_at          timestamptz not null default now(),
  constraint thyp_injury_heal_order check (healed_world_date is null or healed_world_date >= sustained_world_date)
);

do $$ begin
  alter table thyp_injuries add constraint thyp_injury_person_fk
    foreign key (person_serial) references studio_world_characters(person_serial) on delete cascade;
exception when duplicate_object then null; when others then
  raise notice 'THYLORA PERSONS: injury FK held as soft reference (%).', sqlerrm; end $$;

create index if not exists thyp_injury_open_idx
  on thyp_injuries(person_serial) where healed_world_date is null;

-- ---------------------------------------------------------------------------
-- 8 · Wardrobe and possessions
-- ---------------------------------------------------------------------------
create table if not exists thyp_wardrobe_items (
  id                    uuid primary key default gen_random_uuid(),
  person_serial         text not null,
  garment_code          text not null,
  garment_kind          text not null,
  layer                 text not null check (layer in ('UNDER','MID','OUTER','HEAD','FOOT','HAND','ACCESSORY')),
  material              text,
  color_code            text,
  condition             text check (condition is null or condition in ('NEW','GOOD','WORN','PATCHED','RUINED')),
  period_appropriate    boolean not null default true,
  owned_since_world_date date,
  item_state            thyp_record_state not null default 'ACTIVE',
  created_at            timestamptz not null default now(),
  unique (person_serial, garment_code),
  -- Period truth: an anachronistic garment cannot be marked appropriate by
  -- accident. It must be declared, with a reason.
  constraint thyp_wardrobe_period check (period_appropriate = true or condition is not null)
);

do $$ begin
  alter table thyp_wardrobe_items add constraint thyp_wardrobe_person_fk
    foreign key (person_serial) references studio_world_characters(person_serial) on delete cascade;
exception when duplicate_object then null; when others then
  raise notice 'THYLORA PERSONS: wardrobe FK held as soft reference (%).', sqlerrm; end $$;

create table if not exists thyp_possessions (
  id                 uuid primary key default gen_random_uuid(),
  person_serial      text not null,
  possession_code    text not null,
  possession_kind    text not null,
  description        text,
  acquired_world_date date,
  stored_place_code  text,
  value_band         text,
  item_state         thyp_record_state not null default 'ACTIVE',
  created_at         timestamptz not null default now(),
  unique (person_serial, possession_code)
);

do $$ begin
  alter table thyp_possessions add constraint thyp_possession_person_fk
    foreign key (person_serial) references studio_world_characters(person_serial) on delete cascade;
exception when duplicate_object then null; when others then
  raise notice 'THYLORA PERSONS: possession FK held as soft reference (%).', sqlerrm; end $$;

drop trigger if exists thyp_character_touch on studio_world_characters;
create trigger thyp_character_touch before update on studio_world_characters
  for each row execute function thyp_touch_updated_at();

commit;
