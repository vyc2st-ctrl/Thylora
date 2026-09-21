-- 0009 · Era person lane.
--
-- LOCKS HELD HERE:
--   LOCK-ER-VERONICA-HALL-001
--   LOCK-ER-CLARA-BENNETT-001
--   Vyctor Ebeneezer <-> Ines Morales: PREEXISTING_ACQUAINTANCE_FROM_PRIOR_VISITS.
--     No first meeting exists, may be written, or may be inserted.
--   Ines Morales <-> Veronica Hall: KINSHIP_EXISTS, degree UNKNOWN and sealed.
--   The locket is CLOSED. Contents are not stored anywhere in this schema.
--
-- No new people are created here. People Veronica lived among are NOT named.

begin;

create table if not exists thytr_person (
  person_code         text primary key,
  display_name        text not null,
  lock_ref            text,                        -- e.g. LOCK-ER-VERONICA-HALL-001
  era_code            text references thytr_era_profile(era_code),
  standing            text not null default 'LIVING'
                      check (standing in ('LIVING','DECEASED','UNRECORDED')),
  sealed              boolean not null default true,
  note                text
);

insert into thytr_person (person_code, display_name, lock_ref, standing, sealed, note) values
  ('PER-VERONICA-HALL',   'Veronica Hall',     'LOCK-ER-VERONICA-HALL-001', 'LIVING', true,
   'Age 23. 166 cm. 55-60 kg. Deep-brown complexion. Dark textured hair. Slender working build. Systems thinker: sees how things work.'),
  ('PER-CLARA-BENNETT',   'Clara Bennett',     'LOCK-ER-CLARA-BENNETT-001', 'LIVING', true,
   'Maintains standards. Protective. Does not turn sentimental or aristocratic.'),
  ('PER-INES-MORALES',    'Ines Morales',      null,                        'LIVING', true,
   'Takes to Veronica instantly, without yet understanding why.'),
  ('PER-VYCTOR-EBENEEZER','Vyctor Ebeneezer',  null,                        'LIVING', true,
   'Traveller. Has visited before.')
on conflict (person_code) do nothing;

-- ---------------------------------------------------------------------------
-- Relations. The relation vocabulary is closed and enforced.
-- ---------------------------------------------------------------------------
create table if not exists thytr_relation (
  relation_id         uuid primary key default gen_random_uuid(),
  person_a            text not null references thytr_person(person_code),
  person_b            text not null references thytr_person(person_code),
  relation_code       text not null
                      check (relation_code in (
                        'PREEXISTING_ACQUAINTANCE_FROM_PRIOR_VISITS',
                        'NEW_ENCOUNTER',
                        'KINSHIP_EXISTS_DEGREE_UNKNOWN',
                        'EMPLOYER_OF_RECORD',
                        'BROUGHT_BACK_BY',
                        'PROTECTIVE_OF')),
  first_meeting_permitted boolean not null default true,
  degree_known        boolean not null default true,
  established_before_run boolean not null default false,
  note                text,
  unique (person_a, person_b, relation_code)
);

insert into thytr_relation
  (person_a, person_b, relation_code, first_meeting_permitted, degree_known, established_before_run, note) values
  ('PER-VYCTOR-EBENEEZER','PER-INES-MORALES','PREEXISTING_ACQUAINTANCE_FROM_PRIOR_VISITS',
   false, true, true,
   'Vyctor already knows Ines. No first meeting between them exists or may be written. Any scene between them resumes an existing acquaintance.'),
  ('PER-VYCTOR-EBENEEZER','PER-VERONICA-HALL','NEW_ENCOUNTER',
   true, true, false,
   'This is the new encounter of sequence 582. It is the only first meeting open in this packet.'),
  ('PER-INES-MORALES','PER-VERONICA-HALL','KINSHIP_EXISTS_DEGREE_UNKNOWN',
   true, false, true,
   'Kinship exists. The exact degree is intentionally unknown and is not stored. Ines does not yet understand why she takes to Veronica.'),
  ('PER-CLARA-BENNETT','PER-VERONICA-HALL','BROUGHT_BACK_BY',
   true, true, true,
   'Clara encountered Veronica, brought her back into safer circumstances, and helped her obtain household work.'),
  ('PER-CLARA-BENNETT','PER-VERONICA-HALL','PROTECTIVE_OF',
   true, true, true,
   'Protective, and maintains standards. Not sentimental.'),
  ('PER-INES-MORALES','PER-VERONICA-HALL','PROTECTIVE_OF',
   true, true, true,
   'Feeding, watching, teaching, quiet concern, defending her when warranted.')
on conflict (person_a, person_b, relation_code) do nothing;

-- Guard: a relation marked first_meeting_permitted = false can never carry a
-- FIRST_MEETING encounter, in either direction.
create or replace function thytr_no_first_meeting_regression() returns trigger
language plpgsql as $$
declare
  blocked boolean;
begin
  if new.encounter_kind <> 'FIRST_MEETING' then
    return new;
  end if;
  select exists (
    select 1 from thytr_relation r
     where r.first_meeting_permitted = false
       and ((r.person_a = new.party_a_ref and r.person_b = new.party_b_ref)
         or (r.person_a = new.party_b_ref and r.person_b = new.party_a_ref))
  ) into blocked;
  if blocked then
    raise exception
      'THYTR-REL-001 no first meeting may be written between % and %: relation is PREEXISTING',
      new.party_a_ref, new.party_b_ref;
  end if;
  return new;
end;
$$;

drop trigger if exists thytr_no_first_meeting_trg on thytr_encounter;
create trigger thytr_no_first_meeting_trg
  before insert or update on thytr_encounter
  for each row execute function thytr_no_first_meeting_regression();

-- ---------------------------------------------------------------------------
-- The locket. CLOSED. There is no contents column, by design.
-- ---------------------------------------------------------------------------
create table if not exists thytr_sealed_object (
  object_code         text primary key,
  object_label        text not null,
  held_by             text references thytr_person(person_code),
  state               text not null default 'CLOSED'
                      check (state in ('CLOSED')),
  tied_to_reveal      text,
  reveal_sealed       boolean not null default true check (reveal_sealed),
  note                text
);

insert into thytr_sealed_object (object_code, object_label, held_by, state, tied_to_reveal, note) values
  ('OBJ-LOCKET-001','The closed locket', null, 'CLOSED', 'INES_VERONICA_KINSHIP_DEGREE',
   'The locket is closed. It is not opened, described from the inside, or inferred from. No contents column exists in this schema and none is to be added.')
on conflict (object_code) do nothing;

-- ---------------------------------------------------------------------------
-- Veronica origin sequence. Ordered beats. People she lived among are
-- recorded as an unnamed group, deliberately.
-- ---------------------------------------------------------------------------
create table if not exists thytr_origin_beat (
  beat_code           text primary key,
  person_code         text not null references thytr_person(person_code),
  beat_index          integer not null check (beat_index >= 0),
  beat_label          text not null,
  beat_text           text not null,
  names_invented      boolean not null default false check (names_invented = false),
  unique (person_code, beat_index)
);

comment on column thytr_origin_beat.names_invented is
  'Locked false. The people Veronica lived among are not named yet. They are real and they are unnamed, and the schema refuses to let a name be slipped in as a beat.';

create table if not exists thytr_household_position (
  position_id         uuid primary key default gen_random_uuid(),
  person_code         text not null references thytr_person(person_code),
  household_label     text not null,
  engaged_by          text references thytr_person(person_code),
  position_title      text not null,
  wage_unit           text,
  wage_minor          bigint check (wage_minor is null or wage_minor >= 0),
  wage_period         text check (wage_period in ('DAY','WEEK','QUARTER','YEAR')),
  room_provided       boolean not null default false,
  board_provided      boolean not null default false,
  clothing_issued     boolean not null default false,
  started_on          text,                        -- era-local date expression
  standing            text not null default 'IN_PLACE'
                      check (standing in ('OFFERED','IN_PLACE','CONFIRMED','ENDED')),
  note                text
);

create table if not exists thytr_household_stance (
  stance_id           uuid primary key default gen_random_uuid(),
  about_person        text not null references thytr_person(person_code),
  holder_label        text not null,               -- role in the household, not a personal name
  stance              text not null check (stance in ('OBJECTS','SUPPORTS','WATCHES','WITHHOLDS')),
  ground              text not null,
  named_person        boolean not null default false check (named_person = false),
  note                text
);

comment on column thytr_household_stance.named_person is
  'Locked false. Who objects and who supports is recorded by household ROLE. No new personal names are created to fill these slots.';

commit;
