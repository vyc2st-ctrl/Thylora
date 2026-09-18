-- THYLORA PERSONS · 0004 · Royal household and local education
-- Workroom: WR-PERSONS-001
--
-- NO MODERN SCHOOL. The instruction-mode enum below has no modern-school value,
-- so a modern school cannot be selected by default, by accident, or at all. What
-- exists is household tutoring, a household schoolroom, apprenticeship, guild or
-- master learning, grammar-style instruction, noble household service and
-- practical observation — chosen per learner class, not per convenience.

begin;

do $$ begin
  create type thyp_learner_class as enum
    ('ROYAL_CHILD','OLDER_YOUTH','PAGE_WARD','STAFF_CHILD','LOCAL_CHILD');
exception when duplicate_object then null; end $$;

do $$ begin
  create type thyp_instruction_mode as enum (
    'HOUSEHOLD_TUTOR','GOVERNOR','GOVERNESS','HOUSEHOLD_SCHOOLROOM',
    'APPRENTICESHIP','GUILD_MASTER','GRAMMAR_STYLE','NOBLE_HOUSEHOLD_SERVICE',
    'PRACTICAL_OBSERVATION');
exception when duplicate_object then null; end $$;

do $$ begin
  create type thyp_subject_domain as enum (
    'LETTERS','MATHEMATICS','HISTORY','LANGUAGES','GEOGRAPHY','GOVERNANCE','MUSIC',
    'RIDING','PHYSICAL','PRACTICAL_OBSERVATION','ETIQUETTE_DIPLOMACY',
    'HOUSEHOLD_MANAGEMENT','ESTATE_WORK','RECORDS','TRADE','MILITARY_GUARD',
    'ENGINEERING','CRAFT','DEVOTION');
exception when duplicate_object then null; end $$;

do $$ begin
  create type thyp_slot_kind as enum
    ('LESSON','PRACTICAL','PHYSICAL','MEAL','REST','DEVOTION','SERVICE','FREE');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- 1 · Tracks
-- ---------------------------------------------------------------------------
create table if not exists thyp_education_tracks (
  track_code       text primary key,
  title            text not null,
  learner_class    thyp_learner_class not null,
  instruction_mode thyp_instruction_mode not null,
  age_low          smallint not null check (age_low between 0 and 90),
  age_high         smallint not null check (age_high between 0 and 90),
  notes            text,
  track_state      thyp_record_state not null default 'ACTIVE',
  constraint thyp_track_band check (age_high >= age_low)
);

create table if not exists thyp_education_subjects (
  subject_code   text primary key,
  title          text not null,
  subject_domain thyp_subject_domain not null,
  requires_tutor boolean not null default true,
  min_age_years  smallint not null default 0 check (min_age_years between 0 and 90)
);

create table if not exists thyp_education_curriculum (
  track_code       text not null references thyp_education_tracks(track_code) on delete cascade,
  subject_code     text not null references thyp_education_subjects(subject_code) on delete cascade,
  age_low          smallint not null,
  age_high         smallint not null,
  minutes_per_week integer not null check (minutes_per_week > 0 and minutes_per_week <= 3000),
  priority         smallint not null default 50 check (priority between 1 and 99),
  primary key (track_code, subject_code, age_low),
  constraint thyp_curriculum_band check (age_high >= age_low)
);

-- A curriculum line cannot sit outside the age band of its own track, and a
-- subject cannot be taught below its own minimum age.
create or replace function thyp_curriculum_band_gate() returns trigger
language plpgsql as $$
declare v_low smallint; v_high smallint; v_min smallint;
begin
  select age_low, age_high into v_low, v_high
    from thyp_education_tracks where track_code = new.track_code;
  if new.age_low < v_low or new.age_high > v_high then
    raise exception 'CURRICULUM_OUTSIDE_TRACK_BAND: % %-% is outside track % band %-%',
      new.subject_code, new.age_low, new.age_high, new.track_code, v_low, v_high;
  end if;
  select min_age_years into v_min
    from thyp_education_subjects where subject_code = new.subject_code;
  if new.age_low < v_min then
    raise exception 'SUBJECT_BELOW_MIN_AGE: % starts at age %, curriculum begins at %',
      new.subject_code, v_min, new.age_low;
  end if;
  return new;
end $$;

drop trigger if exists thyp_curriculum_band_trg on thyp_education_curriculum;
create trigger thyp_curriculum_band_trg before insert or update on thyp_education_curriculum
  for each row execute function thyp_curriculum_band_gate();

-- ---------------------------------------------------------------------------
-- 2 · Day templates. The period-appropriate shape of a day, by learner class.
--     Lessons are laid into LESSON/PRACTICAL slots only; meals, rest, devotion
--     and service are never overwritten by a lesson.
-- ---------------------------------------------------------------------------
create table if not exists thyp_day_templates (
  template_code text not null,
  learner_class thyp_learner_class not null,
  day_of_week   smallint not null check (day_of_week between 0 and 6),
  block_index   smallint not null check (block_index >= 0),
  start_time    time not null,
  end_time      time not null,
  slot_kind     thyp_slot_kind not null,
  place_code    text,
  primary key (template_code, day_of_week, block_index),
  constraint thyp_template_time_order check (end_time > start_time)
);

create index if not exists thyp_day_template_class_idx
  on thyp_day_templates(learner_class, day_of_week, start_time);

-- ---------------------------------------------------------------------------
-- 3 · Enrolment and progress
-- ---------------------------------------------------------------------------
create table if not exists thyp_person_education (
  id                  uuid primary key default gen_random_uuid(),
  person_serial       text not null,
  track_code          text not null references thyp_education_tracks(track_code),
  tutor_person_serial text,
  place_code          text references thyp_places(place_code),
  enrolled_world_date date not null,
  ended_world_date    date,
  created_at          timestamptz not null default now(),
  constraint thyp_person_education_dates check (ended_world_date is null or ended_world_date >= enrolled_world_date)
);

do $$ begin
  alter table thyp_person_education add constraint thyp_person_education_person_fk
    foreign key (person_serial) references studio_world_characters(person_serial) on delete cascade;
exception when duplicate_object then null; when others then
  raise notice 'THYLORA PERSONS: education FK held as soft reference (%).', sqlerrm; end $$;

create unique index if not exists thyp_person_education_current_idx
  on thyp_person_education(person_serial) where ended_world_date is null;

-- A learner is only ever enrolled on a track whose age band contains them, and
-- a track requiring a tutor is never enrolled without one named.
create or replace function thyp_enrolment_gate() returns trigger
language plpgsql as $$
declare v_age integer; v_low smallint; v_high smallint; v_mode thyp_instruction_mode;
begin
  select age_years into v_age from studio_world_characters where person_serial = new.person_serial;
  select age_low, age_high, instruction_mode into v_low, v_high, v_mode
    from thyp_education_tracks where track_code = new.track_code;
  if v_age is not null and (v_age < v_low or v_age > v_high) then
    raise exception 'ENROLMENT_AGE_OUTSIDE_TRACK: % is % years old; track % covers %-%',
      new.person_serial, v_age, new.track_code, v_low, v_high;
  end if;
  if v_mode in ('HOUSEHOLD_TUTOR','GOVERNOR','GOVERNESS','GUILD_MASTER','APPRENTICESHIP')
     and new.tutor_person_serial is null then
    raise exception 'TUTOR_REQUIRED: track % is delivered by % and names no tutor',
      new.track_code, v_mode;
  end if;
  return new;
end $$;

drop trigger if exists thyp_enrolment_gate_trg on thyp_person_education;
create trigger thyp_enrolment_gate_trg before insert or update on thyp_person_education
  for each row execute function thyp_enrolment_gate();

create table if not exists thyp_education_progress (
  person_serial            text not null,
  subject_code             text not null references thyp_education_subjects(subject_code),
  level_code               text not null,
  level_ordinal            smallint not null check (level_ordinal between 0 and 10),
  last_advanced_world_date date,
  assessed_by_person_serial text,
  primary key (person_serial, subject_code)
);

do $$ begin
  alter table thyp_education_progress add constraint thyp_progress_person_fk
    foreign key (person_serial) references studio_world_characters(person_serial) on delete cascade;
exception when duplicate_object then null; when others then
  raise notice 'THYLORA PERSONS: progress FK held as soft reference (%).', sqlerrm; end $$;

-- Learning does not run backward. A level can only be revised downward with an
-- injury or illness recorded against the same person; otherwise it advances.
create or replace function thyp_progress_monotonic() returns trigger
language plpgsql as $$
begin
  if old.level_ordinal is not null and new.level_ordinal < old.level_ordinal then
    if not exists (select 1 from thyp_injuries i
                    where i.person_serial = new.person_serial and i.healed_world_date is null) then
      raise exception 'LEARNING_REGRESSION: % % would drop from % to % with no recorded cause',
        new.person_serial, new.subject_code, old.level_ordinal, new.level_ordinal;
    end if;
  end if;
  return new;
end $$;

drop trigger if exists thyp_progress_monotonic_trg on thyp_education_progress;
create trigger thyp_progress_monotonic_trg before update on thyp_education_progress
  for each row execute function thyp_progress_monotonic();

-- ---------------------------------------------------------------------------
-- 4 · Seed: subjects
-- ---------------------------------------------------------------------------
insert into thyp_education_subjects(subject_code, title, subject_domain, requires_tutor, min_age_years) values
  ('SUB-READING',    'Reading and writing',        'LETTERS',              true,  4),
  ('SUB-MATH',       'Mathematics and reckoning',  'MATHEMATICS',          true,  5),
  ('SUB-HISTORY',    'History and lineage',        'HISTORY',              true,  7),
  ('SUB-LANG',       'Languages',                  'LANGUAGES',            true,  6),
  ('SUB-GEOG',       'Geography and maps',         'GEOGRAPHY',            true,  7),
  ('SUB-GOVERN',     'Household and governance',   'GOVERNANCE',           true,  9),
  ('SUB-MUSIC',      'Music',                      'MUSIC',                true,  5),
  ('SUB-RIDING',     'Riding',                     'RIDING',               true,  6),
  ('SUB-PHYSICAL',   'Physical training',          'PHYSICAL',             true,  5),
  ('SUB-OBSERVE',    'Practical observation',      'PRACTICAL_OBSERVATION',false, 4),
  ('SUB-ETIQUETTE',  'Etiquette and diplomacy',    'ETIQUETTE_DIPLOMACY',  true,  7),
  ('SUB-HOUSEHOLD',  'Household management',       'HOUSEHOLD_MANAGEMENT', true, 12),
  ('SUB-ESTATE',     'Estate work',                'ESTATE_WORK',          true, 12),
  ('SUB-RECORDS',    'Records and accounts',       'RECORDS',              true, 12),
  ('SUB-TRADE',      'Trade and exchange',         'TRADE',                true, 12),
  ('SUB-MILITARY',   'Military and guard knowledge','MILITARY_GUARD',      true, 14),
  ('SUB-ENGINEER',   'Engineering and works',      'ENGINEERING',          true, 14),
  ('SUB-CRAFT',      'Craft and making',           'CRAFT',                true,  8),
  ('SUB-DEVOTION',   'Devotion',                   'DEVOTION',             false, 4)
on conflict (subject_code) do nothing;

-- ---------------------------------------------------------------------------
-- 5 · Seed: tracks
-- ---------------------------------------------------------------------------
insert into thyp_education_tracks(track_code, title, learner_class, instruction_mode, age_low, age_high, notes) values
  ('TRK-ROYAL-EARLY',  'Royal children · early letters',   'ROYAL_CHILD','GOVERNESS',              4, 7,
     'Household governess. Letters, number, music, devotion, observation, seat on a pony.'),
  ('TRK-ROYAL-MIDDLE', 'Royal children · middle',          'ROYAL_CHILD','HOUSEHOLD_TUTOR',        8, 11,
     'Household tutor. Letters, mathematics, history, a second tongue, maps, riding, etiquette.'),
  ('TRK-ROYAL-UPPER',  'Royal children · upper',           'ROYAL_CHILD','GOVERNOR',              12, 15,
     'Household governor. Adds governance, household management, records, diplomacy.'),
  ('TRK-ROYAL-SENIOR', 'Royal youth · senior',             'ROYAL_CHILD','GOVERNOR',              16, 17,
     'Governor with practical attendance at estate and record work before apprenticeship.'),
  ('TRK-YOUTH-GOVERN', 'Older youth · governance',         'OLDER_YOUTH','APPRENTICESHIP',        18, 25,
     'Apprenticeship in governance, records, estate work and diplomacy.'),
  ('TRK-YOUTH-MIL',    'Older youth · guard and works',    'OLDER_YOUTH','APPRENTICESHIP',        18, 25,
     'Apprenticeship in military and guard knowledge, engineering and works.'),
  ('TRK-PAGE-SERVICE', 'Pages and wards · household service','PAGE_WARD','NOBLE_HOUSEHOLD_SERVICE', 7, 17,
     'Learning by service in a noble household: attendance, message, etiquette, arms at age.'),
  ('TRK-STAFF-ROOM',   'Staff children · household schoolroom','STAFF_CHILD','HOUSEHOLD_SCHOOLROOM', 5, 13,
     'Household schoolroom for staff children: letters, reckoning, devotion, craft.'),
  ('TRK-LOCAL-GRAMMAR','Local children · grammar-style',   'LOCAL_CHILD','GRAMMAR_STYLE',          7, 14,
     'Grammar-style local instruction where the settlement provides it.'),
  ('TRK-LOCAL-GUILD',  'Local youth · guild or master',    'LOCAL_CHILD','GUILD_MASTER',          12, 19,
     'Bound to a master or guild: craft, trade, making.')
on conflict (track_code) do nothing;

-- ---------------------------------------------------------------------------
-- 6 · Seed: curriculum, minutes per week, by age band
-- ---------------------------------------------------------------------------
insert into thyp_education_curriculum(track_code, subject_code, age_low, age_high, minutes_per_week, priority) values
  -- Royal early (4-7)
  ('TRK-ROYAL-EARLY','SUB-READING',   4, 7, 450, 10),
  ('TRK-ROYAL-EARLY','SUB-MATH',      5, 7, 300, 20),
  ('TRK-ROYAL-EARLY','SUB-MUSIC',     5, 7, 180, 40),
  ('TRK-ROYAL-EARLY','SUB-PHYSICAL',  5, 7, 240, 30),
  ('TRK-ROYAL-EARLY','SUB-OBSERVE',   4, 7, 180, 50),
  ('TRK-ROYAL-EARLY','SUB-DEVOTION',  4, 7, 120, 60),
  ('TRK-ROYAL-EARLY','SUB-RIDING',    6, 7, 150, 45),
  ('TRK-ROYAL-EARLY','SUB-HISTORY',   7, 7, 120, 55),
  ('TRK-ROYAL-EARLY','SUB-LANG',      6, 7, 150, 35),
  -- Royal middle (8-11)
  ('TRK-ROYAL-MIDDLE','SUB-READING',  8, 11, 360, 10),
  ('TRK-ROYAL-MIDDLE','SUB-MATH',     8, 11, 360, 15),
  ('TRK-ROYAL-MIDDLE','SUB-HISTORY',  8, 11, 240, 25),
  ('TRK-ROYAL-MIDDLE','SUB-LANG',     8, 11, 300, 20),
  ('TRK-ROYAL-MIDDLE','SUB-GEOG',     8, 11, 180, 35),
  ('TRK-ROYAL-MIDDLE','SUB-MUSIC',    8, 11, 180, 45),
  ('TRK-ROYAL-MIDDLE','SUB-RIDING',   8, 11, 210, 40),
  ('TRK-ROYAL-MIDDLE','SUB-PHYSICAL', 8, 11, 240, 30),
  ('TRK-ROYAL-MIDDLE','SUB-ETIQUETTE',8, 11, 150, 50),
  ('TRK-ROYAL-MIDDLE','SUB-OBSERVE',  8, 11, 150, 55),
  ('TRK-ROYAL-MIDDLE','SUB-GOVERN',   9, 11, 120, 60),
  ('TRK-ROYAL-MIDDLE','SUB-CRAFT',    8, 11, 120, 65),
  ('TRK-ROYAL-MIDDLE','SUB-DEVOTION', 8, 11, 120, 70),
  -- Royal upper (12-15)
  ('TRK-ROYAL-UPPER','SUB-READING',  12, 15, 240, 20),
  ('TRK-ROYAL-UPPER','SUB-MATH',     12, 15, 300, 15),
  ('TRK-ROYAL-UPPER','SUB-HISTORY',  12, 15, 240, 25),
  ('TRK-ROYAL-UPPER','SUB-LANG',     12, 15, 300, 20),
  ('TRK-ROYAL-UPPER','SUB-GEOG',     12, 15, 180, 35),
  ('TRK-ROYAL-UPPER','SUB-GOVERN',   12, 15, 300, 10),
  ('TRK-ROYAL-UPPER','SUB-HOUSEHOLD',12, 15, 180, 30),
  ('TRK-ROYAL-UPPER','SUB-RECORDS',  12, 15, 180, 32),
  ('TRK-ROYAL-UPPER','SUB-ETIQUETTE',12, 15, 180, 40),
  ('TRK-ROYAL-UPPER','SUB-RIDING',   12, 15, 210, 45),
  ('TRK-ROYAL-UPPER','SUB-PHYSICAL', 12, 15, 240, 42),
  ('TRK-ROYAL-UPPER','SUB-MUSIC',    12, 15, 120, 60),
  ('TRK-ROYAL-UPPER','SUB-OBSERVE',  12, 15, 180, 55),
  ('TRK-ROYAL-UPPER','SUB-MILITARY', 14, 15, 180, 48),
  ('TRK-ROYAL-UPPER','SUB-DEVOTION', 12, 15, 120, 70),
  -- Royal senior (16-17)
  ('TRK-ROYAL-SENIOR','SUB-GOVERN',   16, 17, 360, 10),
  ('TRK-ROYAL-SENIOR','SUB-RECORDS',  16, 17, 300, 15),
  ('TRK-ROYAL-SENIOR','SUB-ESTATE',   16, 17, 300, 18),
  ('TRK-ROYAL-SENIOR','SUB-TRADE',    16, 17, 180, 30),
  ('TRK-ROYAL-SENIOR','SUB-ETIQUETTE',16, 17, 240, 25),
  ('TRK-ROYAL-SENIOR','SUB-LANG',     16, 17, 240, 28),
  ('TRK-ROYAL-SENIOR','SUB-HISTORY',  16, 17, 180, 35),
  ('TRK-ROYAL-SENIOR','SUB-MILITARY', 16, 17, 180, 40),
  ('TRK-ROYAL-SENIOR','SUB-RIDING',   16, 17, 180, 45),
  ('TRK-ROYAL-SENIOR','SUB-PHYSICAL', 16, 17, 180, 42),
  ('TRK-ROYAL-SENIOR','SUB-OBSERVE',  16, 17, 240, 50),
  -- Older youth · governance (18-25)
  ('TRK-YOUTH-GOVERN','SUB-GOVERN',   18, 25, 600, 10),
  ('TRK-YOUTH-GOVERN','SUB-RECORDS',  18, 25, 480, 15),
  ('TRK-YOUTH-GOVERN','SUB-ESTATE',   18, 25, 480, 18),
  ('TRK-YOUTH-GOVERN','SUB-TRADE',    18, 25, 300, 25),
  ('TRK-YOUTH-GOVERN','SUB-ETIQUETTE',18, 25, 240, 30),
  ('TRK-YOUTH-GOVERN','SUB-HOUSEHOLD',18, 25, 240, 32),
  ('TRK-YOUTH-GOVERN','SUB-LANG',     18, 25, 180, 40),
  ('TRK-YOUTH-GOVERN','SUB-OBSERVE',  18, 25, 300, 45),
  -- Older youth · guard and works (18-25)
  ('TRK-YOUTH-MIL','SUB-MILITARY',    18, 25, 600, 10),
  ('TRK-YOUTH-MIL','SUB-ENGINEER',    18, 25, 480, 15),
  ('TRK-YOUTH-MIL','SUB-PHYSICAL',    18, 25, 420, 20),
  ('TRK-YOUTH-MIL','SUB-RIDING',      18, 25, 300, 25),
  ('TRK-YOUTH-MIL','SUB-RECORDS',     18, 25, 180, 40),
  ('TRK-YOUTH-MIL','SUB-OBSERVE',     18, 25, 240, 45),
  -- Pages and wards (7-17)
  ('TRK-PAGE-SERVICE','SUB-ETIQUETTE', 7, 17, 300, 10),
  ('TRK-PAGE-SERVICE','SUB-READING',   7, 17, 240, 15),
  ('TRK-PAGE-SERVICE','SUB-MATH',      7, 17, 180, 25),
  ('TRK-PAGE-SERVICE','SUB-RIDING',    7, 17, 180, 30),
  ('TRK-PAGE-SERVICE','SUB-OBSERVE',   7, 17, 300, 20),
  ('TRK-PAGE-SERVICE','SUB-PHYSICAL',  7, 17, 240, 35),
  ('TRK-PAGE-SERVICE','SUB-MILITARY', 14, 17, 240, 40),
  -- Staff children · household schoolroom (5-13)
  ('TRK-STAFF-ROOM','SUB-READING',     5, 13, 300, 10),
  ('TRK-STAFF-ROOM','SUB-MATH',        5, 13, 240, 15),
  ('TRK-STAFF-ROOM','SUB-DEVOTION',    5, 13, 120, 40),
  ('TRK-STAFF-ROOM','SUB-CRAFT',       8, 13, 300, 20),
  ('TRK-STAFF-ROOM','SUB-OBSERVE',     5, 13, 180, 30),
  -- Local children · grammar-style (7-14)
  ('TRK-LOCAL-GRAMMAR','SUB-READING',  7, 14, 360, 10),
  ('TRK-LOCAL-GRAMMAR','SUB-MATH',     7, 14, 240, 15),
  ('TRK-LOCAL-GRAMMAR','SUB-LANG',     7, 14, 180, 25),
  ('TRK-LOCAL-GRAMMAR','SUB-HISTORY',  7, 14, 120, 35),
  ('TRK-LOCAL-GRAMMAR','SUB-DEVOTION', 7, 14, 120, 40),
  -- Local youth · guild or master (12-19)
  ('TRK-LOCAL-GUILD','SUB-CRAFT',     12, 19, 900, 10),
  ('TRK-LOCAL-GUILD','SUB-TRADE',     12, 19, 300, 20),
  ('TRK-LOCAL-GUILD','SUB-MATH',      12, 19, 180, 30),
  ('TRK-LOCAL-GUILD','SUB-RECORDS',   12, 19, 120, 40)
on conflict (track_code, subject_code, age_low) do nothing;

-- ---------------------------------------------------------------------------
-- 7 · Seed: day templates. Six working days, one day of rest and devotion.
-- ---------------------------------------------------------------------------
insert into thyp_day_templates(template_code, learner_class, day_of_week, block_index, start_time, end_time, slot_kind) values
  ('TPL-ROYAL-CHILD','ROYAL_CHILD',1,0,'06:30','07:00','DEVOTION'),
  ('TPL-ROYAL-CHILD','ROYAL_CHILD',1,1,'07:00','07:45','MEAL'),
  ('TPL-ROYAL-CHILD','ROYAL_CHILD',1,2,'08:00','09:30','LESSON'),
  ('TPL-ROYAL-CHILD','ROYAL_CHILD',1,3,'09:45','11:15','LESSON'),
  ('TPL-ROYAL-CHILD','ROYAL_CHILD',1,4,'11:30','12:30','MEAL'),
  ('TPL-ROYAL-CHILD','ROYAL_CHILD',1,5,'12:45','14:15','LESSON'),
  ('TPL-ROYAL-CHILD','ROYAL_CHILD',1,6,'14:30','15:30','PHYSICAL'),
  ('TPL-ROYAL-CHILD','ROYAL_CHILD',1,7,'15:45','16:45','PRACTICAL'),
  ('TPL-ROYAL-CHILD','ROYAL_CHILD',1,8,'17:00','18:00','FREE'),
  ('TPL-ROYAL-CHILD','ROYAL_CHILD',1,9,'18:00','19:00','MEAL'),
  ('TPL-OLDER-YOUTH','OLDER_YOUTH',1,0,'05:45','06:15','DEVOTION'),
  ('TPL-OLDER-YOUTH','OLDER_YOUTH',1,1,'06:15','07:00','MEAL'),
  ('TPL-OLDER-YOUTH','OLDER_YOUTH',1,2,'07:00','09:00','LESSON'),
  ('TPL-OLDER-YOUTH','OLDER_YOUTH',1,3,'09:15','11:15','PRACTICAL'),
  ('TPL-OLDER-YOUTH','OLDER_YOUTH',1,4,'11:30','12:15','MEAL'),
  ('TPL-OLDER-YOUTH','OLDER_YOUTH',1,5,'12:30','15:00','LESSON'),
  ('TPL-OLDER-YOUTH','OLDER_YOUTH',1,6,'15:15','16:45','PRACTICAL'),
  ('TPL-OLDER-YOUTH','OLDER_YOUTH',1,7,'17:00','18:00','PHYSICAL'),
  ('TPL-OLDER-YOUTH','OLDER_YOUTH',1,8,'18:15','19:15','MEAL'),
  ('TPL-PAGE-WARD','PAGE_WARD',1,0,'05:30','06:00','DEVOTION'),
  ('TPL-PAGE-WARD','PAGE_WARD',1,1,'06:00','06:45','MEAL'),
  ('TPL-PAGE-WARD','PAGE_WARD',1,2,'07:00','09:00','SERVICE'),
  ('TPL-PAGE-WARD','PAGE_WARD',1,3,'09:15','10:45','LESSON'),
  ('TPL-PAGE-WARD','PAGE_WARD',1,4,'11:00','12:00','MEAL'),
  ('TPL-PAGE-WARD','PAGE_WARD',1,5,'12:15','14:15','SERVICE'),
  ('TPL-PAGE-WARD','PAGE_WARD',1,6,'14:30','15:30','LESSON'),
  ('TPL-PAGE-WARD','PAGE_WARD',1,7,'15:45','17:00','PHYSICAL'),
  ('TPL-PAGE-WARD','PAGE_WARD',1,8,'18:00','19:00','MEAL'),
  ('TPL-STAFF-CHILD','STAFF_CHILD',1,0,'06:30','07:00','MEAL'),
  ('TPL-STAFF-CHILD','STAFF_CHILD',1,1,'07:15','09:15','LESSON'),
  ('TPL-STAFF-CHILD','STAFF_CHILD',1,2,'09:30','11:00','PRACTICAL'),
  ('TPL-STAFF-CHILD','STAFF_CHILD',1,3,'11:15','12:00','MEAL'),
  ('TPL-STAFF-CHILD','STAFF_CHILD',1,4,'12:15','14:15','LESSON'),
  ('TPL-STAFF-CHILD','STAFF_CHILD',1,5,'14:30','16:00','PRACTICAL'),
  ('TPL-STAFF-CHILD','STAFF_CHILD',1,6,'18:00','19:00','MEAL'),
  ('TPL-LOCAL-CHILD','LOCAL_CHILD',1,0,'07:00','07:45','MEAL'),
  ('TPL-LOCAL-CHILD','LOCAL_CHILD',1,1,'08:00','10:00','LESSON'),
  ('TPL-LOCAL-CHILD','LOCAL_CHILD',1,2,'10:15','11:45','LESSON'),
  ('TPL-LOCAL-CHILD','LOCAL_CHILD',1,3,'12:00','13:00','MEAL'),
  ('TPL-LOCAL-CHILD','LOCAL_CHILD',1,4,'13:15','15:15','PRACTICAL'),
  ('TPL-LOCAL-CHILD','LOCAL_CHILD',1,5,'18:00','19:00','MEAL')
on conflict (template_code, day_of_week, block_index) do nothing;

-- Days 2-6 repeat the working-day shape; day 0 is rest and devotion.
insert into thyp_day_templates(template_code, learner_class, day_of_week, block_index, start_time, end_time, slot_kind)
select t.template_code, t.learner_class, d.dow, t.block_index, t.start_time, t.end_time, t.slot_kind
  from thyp_day_templates t cross join (values (2),(3),(4),(5),(6)) as d(dow)
 where t.day_of_week = 1
on conflict (template_code, day_of_week, block_index) do nothing;

insert into thyp_day_templates(template_code, learner_class, day_of_week, block_index, start_time, end_time, slot_kind)
select distinct t.template_code, t.learner_class, 0, v.idx, v.st, v.en, v.sk
  from thyp_day_templates t
  cross join (values
    (0,'07:00'::time,'08:00'::time,'DEVOTION'::thyp_slot_kind),
    (1,'08:00'::time,'09:00'::time,'MEAL'::thyp_slot_kind),
    (2,'09:00'::time,'12:00'::time,'REST'::thyp_slot_kind),
    (3,'12:00'::time,'13:00'::time,'MEAL'::thyp_slot_kind),
    (4,'13:00'::time,'18:00'::time,'FREE'::thyp_slot_kind),
    (5,'18:00'::time,'19:00'::time,'MEAL'::thyp_slot_kind)) as v(idx, st, en, sk)
on conflict (template_code, day_of_week, block_index) do nothing;

commit;
