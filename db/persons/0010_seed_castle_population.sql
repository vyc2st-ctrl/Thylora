-- THYLORA PERSONS · 0010 · Castle population seed
-- Workroom: WR-PERSONS-001
--
-- WHAT IS SEEDED AND WHAT IS DELIBERATELY NOT
--
-- Seeded: the world clock, the castle and its rooms, village neighbourhoods,
-- the occupation catalogue, households, the royal household's seven people at
-- the ages the Chairman gave, named recurring staff with persistent IDs,
-- education enrolments and exact weekly schedules by age, one deterministic
-- crowd cohort, one scene, and one worked portrait.
--
-- NOT seeded, on purpose:
--   * Body locks for the royal family. Complexion, hair and dimensions for
--     these people are the Chairman's to state. Inventing them would be the
--     exact failure this lane exists to end, and several of them are minors.
--     Consequence, held openly: the gate returns BODY_LOCK_ABSENT for each of
--     them, so they cannot be placed in imagery until the lock is supplied.
--     That is the correct blocked state, not an oversight.
--   * Royal portraits, for the same reason: a portrait requires a lock the
--     subject actually held.
--   * Names and birth dates the Chairman has not given. The unnamed grandson
--     and the head of the household hold real serials with name_state
--     PENDING_CHAIRMAN. No name is invented to fill a row.
--   * Religious and cultural state, which stays NOT_DEFINED because it is only
--     written where canonically defined.
--
-- PROVISIONAL: the world date and every birth month/day are placeholders, held
-- in thyp_world_clock with date_state = 'PROVISIONAL'. Ages at the current view
-- are exactly as instructed; the calendar under them awaits confirmation.

begin;

do $$ begin
  create type thyp_date_state as enum ('PROVISIONAL','CONFIRMED');
exception when duplicate_object then null; end $$;

create table if not exists thyp_world_clock (
  clock_code  text primary key,
  world_date  date not null,
  world_time  time not null,
  date_state  thyp_date_state not null default 'PROVISIONAL',
  source_note text not null,
  updated_at  timestamptz not null default now()
);

insert into thyp_world_clock(clock_code, world_date, world_time, date_state, source_note) values
  ('CASTLE_CURRENT','1487-06-21','10:00','PROVISIONAL',
   'Placeholder world date for the current castle view. The Chairman gave ages, not a calendar. Birth months and days are 1 January placeholders. Ages resolve exactly at this date; replace the date and the birth dates together.')
on conflict (clock_code) do nothing;

-- ---------------------------------------------------------------------------
-- 1 · Places, parents before children
-- ---------------------------------------------------------------------------
insert into thyp_places(place_code, place_kind, name, parent_place_code, standing_capacity) values
  ('PL-REALM','REALM','EdereAriah realm', null, null) on conflict do nothing;
insert into thyp_places(place_code, place_kind, name, parent_place_code, standing_capacity) values
  ('PL-SETTLEMENT','SETTLEMENT','Castle settlement','PL-REALM', 4000) on conflict do nothing;
insert into thyp_places(place_code, place_kind, name, parent_place_code, standing_capacity) values
  ('PL-CASTLE','CASTLE','The castle','PL-SETTLEMENT', 900),
  ('PL-NEIGH-EAST','NEIGHBORHOOD','East lanes','PL-SETTLEMENT', 600),
  ('PL-NEIGH-WEST','NEIGHBORHOOD','West lanes','PL-SETTLEMENT', 600),
  ('PL-NEIGH-MILL','NEIGHBORHOOD','Mill row','PL-SETTLEMENT', 400),
  ('PL-MARKET','MARKET','Settlement market','PL-SETTLEMENT', 800)
on conflict do nothing;
insert into thyp_places(place_code, place_kind, name, parent_place_code, width_cm, depth_cm, height_cm, floor_level, standing_capacity) values
  ('PL-COURTYARD','COURTYARD','Inner courtyard','PL-CASTLE', 3800, 3200, null, 0, 400),
  ('PL-GATEHOUSE','GATEHOUSE','Gatehouse','PL-CASTLE', 1200, 900, 800, 0, 40),
  ('PL-GREAT-HALL','HALL','Great hall','PL-CASTLE', 2600, 1400, 1100, 0, 300),
  ('PL-CHAPEL','CHAPEL','Castle chapel','PL-CASTLE', 1400, 800, 1000, 0, 90),
  ('PL-SCHOOLROOM','SCHOOLROOM','Household schoolroom','PL-CASTLE', 900, 700, 420, 1, 24),
  ('PL-RECORD-ROOM','ROOM','Record room','PL-CASTLE', 800, 600, 380, 1, 12),
  ('PL-KITCHEN','KITCHEN','Great kitchen','PL-CASTLE', 1600, 1000, 500, 0, 40),
  ('PL-LAUNDRY','LAUNDRY','Laundry','PL-CASTLE', 900, 700, 360, 0, 16),
  ('PL-STABLE','STABLE','Stables','PL-CASTLE', 2200, 1200, 600, 0, 30),
  ('PL-FORGE','FORGE','Forge','PL-CASTLE', 1000, 800, 500, 0, 12),
  ('PL-CARPENTRY','WORKSHOP','Carpentry shop','PL-CASTLE', 1200, 800, 450, 0, 14),
  ('PL-MASON-YARD','WORKSHOP','Mason yard','PL-CASTLE', 1800, 1400, null, 0, 24),
  ('PL-WHEEL-SHOP','WORKSHOP','Wheelwright shop','PL-CASTLE', 1100, 800, 450, 0, 10),
  ('PL-HERB-GARDEN','HERB_GARDEN','Herb garden','PL-CASTLE', 1600, 1200, null, 0, 20),
  ('PL-GARDEN','GARDEN','Castle garden','PL-CASTLE', 3000, 2400, null, 0, 60),
  ('PL-STORE','STORE','Stores and cellar','PL-CASTLE', 1400, 1000, 340, -1, 20),
  ('PL-EAST-WING','WING','East wing','PL-CASTLE', null, null, null, 1, 120)
on conflict do nothing;
insert into thyp_places(place_code, place_kind, name, parent_place_code, width_cm, depth_cm, height_cm, floor_level, standing_capacity) values
  ('PL-CH-A','ROOM','East wing chamber A','PL-EAST-WING', 520, 430, 340, 1, 6),
  ('PL-CH-B','ROOM','East wing chamber B','PL-EAST-WING', 520, 430, 340, 1, 6),
  ('PL-CH-C','ROOM','East wing chamber C','PL-EAST-WING', 480, 400, 340, 1, 5),
  ('PL-CH-D','ROOM','East wing chamber D','PL-EAST-WING', 480, 400, 340, 1, 5),
  ('PL-CH-E','ROOM','East wing chamber E','PL-EAST-WING', 440, 380, 340, 1, 4),
  ('PL-CH-F','ROOM','East wing chamber F','PL-EAST-WING', 440, 380, 340, 1, 4),
  ('PL-CH-G','ROOM','East wing chamber G','PL-EAST-WING', 440, 380, 340, 1, 4),
  ('PL-CH-H','ROOM','East wing chamber H','PL-EAST-WING', 560, 460, 340, 1, 6),
  ('PL-STAFF-QTR','ROOM','Staff quarters','PL-CASTLE', 1800, 900, 320, 2, 40)
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- 2 · Occupation catalogue. The castle workforce the Chairman named.
-- ---------------------------------------------------------------------------
insert into thyp_occupations(occupation_code, title, occupation_class, default_place_code, requires_literacy, min_age_years, rank_ladder) values
  ('OCC-GUARD',      'Guard',            'GUARD','PL-GATEHOUSE',   false,18, array['RECRUIT','GUARD','SERJEANT','CAPTAIN']),
  ('OCC-GROOM',      'Groom',            'GROOM','PL-STABLE',      false,14, array['BOY','GROOM','HEAD_GROOM']),
  ('OCC-CART',       'Cart handler',     'CART_HANDLER','PL-COURTYARD',false,16, array['HAND','CARTER','HEAD_CARTER']),
  ('OCC-WHEELWRIGHT','Wheelwright',      'WHEELWRIGHT','PL-WHEEL-SHOP',false,16, array['APPRENTICE','JOURNEYMAN','MASTER']),
  ('OCC-SMITH',      'Smith',            'SMITH','PL-FORGE',       false,16, array['APPRENTICE','JOURNEYMAN','MASTER']),
  ('OCC-MASON',      'Mason',            'MASON','PL-MASON-YARD',  false,16, array['APPRENTICE','JOURNEYMAN','MASTER']),
  ('OCC-CARPENTER',  'Carpenter',        'CARPENTER','PL-CARPENTRY',false,16, array['APPRENTICE','JOURNEYMAN','MASTER']),
  ('OCC-COOK',       'Cook',             'COOK','PL-KITCHEN',      false,15, array['SCULLION','COOK','HEAD_COOK']),
  ('OCC-LAUNDRY',    'Laundry worker',   'LAUNDRY','PL-LAUNDRY',   false,14, array['HAND','LAUNDRESS','HEAD_LAUNDRESS']),
  ('OCC-GARDENER',   'Gardener',         'GARDENER','PL-GARDEN',   false,14, array['HAND','GARDENER','HEAD_GARDENER']),
  ('OCC-HERB',       'Herb worker',      'HERB_WORKER','PL-HERB-GARDEN',false,15, array['HAND','HERBALIST']),
  ('OCC-CLERK',      'Clerk',            'CLERK','PL-RECORD-ROOM', true, 16, array['CLERK','SENIOR_CLERK','KEEPER_OF_RECORDS']),
  ('OCC-TUTOR',      'Household tutor',  'TUTOR','PL-SCHOOLROOM',  true, 20, array['TUTOR','GOVERNOR']),
  ('OCC-GOVERNESS',  'Governess',        'TUTOR','PL-SCHOOLROOM',  true, 20, array['GOVERNESS','HEAD_GOVERNESS']),
  ('OCC-GOVERNOR',   'Governor of studies','TUTOR','PL-SCHOOLROOM',true, 25, array['GOVERNOR']),
  ('OCC-NURSE',      'Nurse and caregiver','NURSE_CAREGIVER','PL-EAST-WING',false,18, array['NURSE','HEAD_NURSE']),
  ('OCC-STABLE',     'Stable staff',     'STABLE_STAFF','PL-STABLE',false,14, array['HAND','STABLE_KEEPER']),
  ('OCC-CLEANER',    'Cleaner',          'CLEANER','PL-CASTLE',    false,14, array['HAND','HEAD_OF_CLEANING']),
  ('OCC-REPAIR',     'Repair worker',    'REPAIR','PL-CASTLE',     false,16, array['HAND','REPAIRER']),
  ('OCC-MESSENGER',  'Messenger',        'MESSENGER','PL-GATEHOUSE',false,14, array['RUNNER','MESSENGER','CHIEF_MESSENGER']),
  ('OCC-MERCHANT',   'Merchant',         'MERCHANT','PL-MARKET',   true, 18, array['TRADER','MERCHANT']),
  ('OCC-VISITOR',    'Visitor',          'VISITOR','PL-GREAT-HALL',false, 0, array['VISITOR']),
  ('OCC-CRAFT',      'Craft worker',     'CRAFT_WORKER','PL-CARPENTRY',false,14, array['APPRENTICE','JOURNEYMAN','MASTER']),
  ('OCC-STEWARD',    'Steward',          'STEWARD','PL-RECORD-ROOM',true, 25, array['UNDER_STEWARD','STEWARD','HIGH_STEWARD']),
  ('OCC-PAGE',       'Page',             'PAGE','PL-GREAT-HALL',   false, 7, array['PAGE','SENIOR_PAGE']),
  ('OCC-ROYAL',      'Royal household',  'ROYAL','PL-CASTLE',      true,  0, array['MEMBER','HEIR','SOVEREIGN'])
on conflict (occupation_code) do nothing;

-- ---------------------------------------------------------------------------
-- 3 · Households
-- ---------------------------------------------------------------------------
insert into thylora_person_serial_registry(serial, serial_class, sequence_no, label, issued_for) values
  ('THY-H-0001','HOUSEHOLD',1,'Royal household','The royal household at the castle'),
  ('THY-H-0002','HOUSEHOLD',2,'Castle staff quarters','Resident castle staff')
on conflict (serial) do nothing;

insert into thyp_households(household_serial, household_code, household_kind, residence_place_code, settlement_place_code) values
  ('THY-H-0001','HH-ROYAL','ROYAL','PL-CASTLE','PL-SETTLEMENT'),
  ('THY-H-0002','HH-STAFF','STAFF_QUARTER','PL-STAFF-QTR','PL-SETTLEMENT')
on conflict (household_serial) do nothing;

-- Twelve village households, so a crowd person has a home before a face.
do $$
declare i integer; v_serial text; v_place text;
begin
  for i in 1 .. 12 loop
    v_serial := 'THY-H-' || lpad((i + 2)::text, 4, '0');
    v_place := (array['PL-NEIGH-EAST','PL-NEIGH-WEST','PL-NEIGH-MILL'])[1 + (i % 3)];
    insert into thylora_person_serial_registry(serial, serial_class, sequence_no, label, issued_for)
    values (v_serial, 'HOUSEHOLD', i + 2, 'Village household ' || i, 'Settlement household')
    on conflict (serial) do nothing;
    insert into thyp_households(household_serial, household_code, household_kind, residence_place_code, settlement_place_code)
    values (v_serial, 'HH-VILLAGE-' || lpad(i::text,2,'0'), 'VILLAGE', v_place, 'PL-SETTLEMENT')
    on conflict (household_serial) do nothing;
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- 4 · The royal household. Ages exactly as instructed at the current view.
--     THY-P-0001 is the head of the household: a real serial with a pending
--     name, standing as recorded guardian for the minors. No name invented.
-- ---------------------------------------------------------------------------
do $$
declare
  v_now date := (select world_date from thyp_world_clock where clock_code = 'CASTLE_CURRENT');
  r record;
begin
  for r in select * from (values
      ('THY-P-0001', 1, null::text,            'Head of royal household (name awaiting Chairman)', null::integer, false, null::text,        'PL-CH-H'),
      ('THY-P-0002', 2, 'Vyctor Ebenezer',     null,                                                24,           false, null,              'PL-CH-A'),
      ('THY-P-0003', 3, 'Jordyn',              null,                                                18,           false, null,              'PL-CH-B'),
      ('THY-P-0004', 4, 'Cali',                null,                                                16,           true,  'THY-P-0001',      'PL-CH-C'),
      ('THY-P-0005', 5, 'Kennedy',             null,                                                12,           true,  'THY-P-0001',      'PL-CH-D'),
      ('THY-P-0006', 6, 'Kylee',               null,                                                10,           true,  'THY-P-0001',      'PL-CH-E'),
      ('THY-P-0007', 7, null,                  'Grandson, age 7 (name awaiting Chairman)',          7,            true,  'THY-P-0001',      'PL-CH-F'),
      ('THY-P-0008', 8, 'Mateo',               null,                                                6,            true,  'THY-P-0001',      'PL-CH-G')
    ) as t(serial, seq, name, placeholder, age, minor, guardian, chamber)
  loop
    insert into thylora_person_serial_registry(serial, serial_class, sequence_no, label, issued_for)
    values (r.serial, 'PERSON_WORLD', r.seq, coalesce(r.name, r.placeholder), 'Royal household member')
    on conflict (serial) do nothing;

    insert into thylora_person_identity(
      person_serial, world_status, person_tier, display_name, placeholder_label,
      name_state, sort_name, is_minor, guardian_person_serial)
    values (r.serial, 'WORLD_SIMULATED', 'NAMED_PERSISTENT', r.name, r.placeholder,
            (case when r.name is null then 'PENDING_CHAIRMAN' else 'CONFIRMED' end)::thyp_name_state,
            coalesce(r.name, r.placeholder), r.minor, r.guardian)
    on conflict (person_serial) do nothing;

    insert into studio_world_characters(
      person_serial, character_code, world_status, simulated_disclosure,
      birth_world_date, as_of_world_date, as_of_world_time, age_years,
      role_code, household_serial, home_place_code, room_place_code, continuity_ref, character_state)
    values (r.serial, 'RYL-' || r.serial, 'WORLD_SIMULATED',
      'Simulated world character record. Not an Earth person and not a conscious being.',
      case when r.age is null then null else make_date(extract(year from v_now)::integer - r.age, 1, 1) end,
      v_now, '10:00', r.age,
      'OCC-ROYAL', 'THY-H-0001', 'PL-CASTLE', r.chamber,
      'THY-WORLD-CONTINUITY-FLOOR-001', 'ACTIVE')
    on conflict (person_serial) do nothing;

    insert into thyp_household_members(household_serial, person_serial, relation_to_head, joined_world_date)
    values ('THY-H-0001', r.serial,
            case when r.serial = 'THY-P-0001' then 'HEAD' else 'ROYAL_HOUSEHOLD_MEMBER' end, v_now)
    on conflict do nothing;

    insert into thyp_person_assignments(person_serial, assignment_kind, place_code, from_world_date, reason)
    values (r.serial, 'HOME', 'PL-CASTLE', v_now, 'Resident of the royal household')
    on conflict do nothing;
    insert into thyp_person_assignments(person_serial, assignment_kind, place_code, from_world_date, reason)
    values (r.serial, 'ROOM', r.chamber, v_now, 'Own chamber in the east wing')
    on conflict do nothing;

    -- Religious and cultural state stays NOT_DEFINED: it is written only where
    -- canonically defined, and nothing here defines it.
    insert into thyp_person_status(person_serial, status_rank, religion_state, culture_state)
    values (r.serial, 'ROYAL_HOUSEHOLD', 'NOT_DEFINED', 'NOT_DEFINED')
    on conflict (person_serial) do nothing;
  end loop;
end $$;

-- Family relationships that the instruction states: grandchildren of the head.
-- Sibling and parent links are NOT asserted, because the Chairman gave ages and
-- two grandsons, not a family tree. Unstated links stay unwritten.
do $$
declare v_now date := (select world_date from thyp_world_clock where clock_code = 'CASTLE_CURRENT');
begin
  insert into thyp_relationships(person_a_serial, person_b_serial, relation_kind, since_world_date)
  select 'THY-P-0001', s, 'GUARDIAN_OF', v_now
    from unnest(array['THY-P-0004','THY-P-0005','THY-P-0006','THY-P-0007','THY-P-0008']) as s
  on conflict do nothing;
  insert into thyp_relationships(person_a_serial, person_b_serial, relation_kind, since_world_date)
  select s, 'THY-P-0001', 'WARD_OF', v_now
    from unnest(array['THY-P-0004','THY-P-0005','THY-P-0006','THY-P-0007','THY-P-0008']) as s
  on conflict do nothing;
end $$;

-- ---------------------------------------------------------------------------
-- 5 · Named recurring staff. Fictional people, so their appearance is derived
--     deterministically from the registered tone bands rather than hand-picked
--     — the mix is a property of the staff body, never of the job.
-- ---------------------------------------------------------------------------
do $$
declare
  v_now  date := (select world_date from thyp_world_clock where clock_code = 'CASTLE_CURRENT');
  v_seed text := 'THY-SEED-CASTLE-STAFF-0001';
  v_mix  jsonb := '[{"group_code":"POP-BAND-1","share_bp":1800},
                    {"group_code":"POP-BAND-2","share_bp":1800},
                    {"group_code":"POP-BAND-3","share_bp":1700},
                    {"group_code":"POP-BAND-4","share_bp":1700},
                    {"group_code":"POP-BAND-5","share_bp":1600},
                    {"group_code":"POP-BAND-6","share_bp":1400}]'::jsonb;
  r record; v_serial text; v_seq integer; v_group text; v_pop thyp_population_groups;
begin
  v_seq := 8;
  for r in select * from (values
      ( 1,'Staff: high steward',      'OCC-STEWARD',   'HIGH_STEWARD',   47,'PL-RECORD-ROOM','THY-H-0002'),
      ( 2,'Staff: governor of studies','OCC-GOVERNOR',  'GOVERNOR',       41,'PL-SCHOOLROOM','THY-H-0002'),
      ( 3,'Staff: household tutor',   'OCC-TUTOR',     'TUTOR',          33,'PL-SCHOOLROOM','THY-H-0002'),
      ( 4,'Staff: governess',         'OCC-GOVERNESS', 'HEAD_GOVERNESS', 38,'PL-SCHOOLROOM','THY-H-0002'),
      ( 5,'Staff: guard captain',     'OCC-GUARD',     'CAPTAIN',         44,'PL-GATEHOUSE','THY-H-0002'),
      ( 6,'Staff: guard',             'OCC-GUARD',     'GUARD',           27,'PL-GATEHOUSE','THY-H-0002'),
      ( 7,'Staff: guard',             'OCC-GUARD',     'GUARD',           31,'PL-GATEHOUSE','THY-H-0002'),
      ( 8,'Staff: head groom',        'OCC-GROOM',     'HEAD_GROOM',      36,'PL-STABLE',   'THY-H-0002'),
      ( 9,'Staff: stable keeper',     'OCC-STABLE',    'STABLE_KEEPER',   29,'PL-STABLE',   'THY-H-0002'),
      (10,'Staff: head carter',       'OCC-CART',      'HEAD_CARTER',     40,'PL-COURTYARD','THY-H-0002'),
      (11,'Staff: master wheelwright','OCC-WHEELWRIGHT','MASTER',         45,'PL-WHEEL-SHOP','THY-H-0002'),
      (12,'Staff: master smith',      'OCC-SMITH',     'MASTER',          42,'PL-FORGE',    'THY-H-0002'),
      (13,'Staff: master mason',      'OCC-MASON',     'MASTER',          50,'PL-MASON-YARD','THY-H-0002'),
      (14,'Staff: master carpenter',  'OCC-CARPENTER', 'MASTER',          39,'PL-CARPENTRY','THY-H-0002'),
      (15,'Staff: head cook',         'OCC-COOK',      'HEAD_COOK',       43,'PL-KITCHEN',  'THY-H-0002'),
      (16,'Staff: head laundress',    'OCC-LAUNDRY',   'HEAD_LAUNDRESS',  37,'PL-LAUNDRY',  'THY-H-0002'),
      (17,'Staff: head gardener',     'OCC-GARDENER',  'HEAD_GARDENER',   48,'PL-GARDEN',   'THY-H-0002'),
      (18,'Staff: herbalist',         'OCC-HERB',      'HERBALIST',       34,'PL-HERB-GARDEN','THY-H-0002'),
      (19,'Staff: keeper of records', 'OCC-CLERK',     'KEEPER_OF_RECORDS',35,'PL-RECORD-ROOM','THY-H-0002'),
      (20,'Staff: head nurse',        'OCC-NURSE',     'HEAD_NURSE',      46,'PL-EAST-WING','THY-H-0002'),
      (21,'Staff: head of cleaning',  'OCC-CLEANER',   'HEAD_OF_CLEANING',32,'PL-CASTLE',   'THY-H-0002'),
      (22,'Staff: repairer',          'OCC-REPAIR',    'REPAIRER',        30,'PL-CASTLE',   'THY-H-0002'),
      (23,'Staff: chief messenger',   'OCC-MESSENGER', 'CHIEF_MESSENGER', 24,'PL-GATEHOUSE','THY-H-0002'),
      (24,'Staff: settlement merchant','OCC-MERCHANT', 'MERCHANT',        41,'PL-MARKET',   'THY-H-0003')
    ) as t(n, label, occ, rank, age, place, household)
  loop
    v_seq := v_seq + 1;
    v_serial := 'THY-P-' || lpad(v_seq::text, 4, '0');

    insert into thylora_person_serial_registry(serial, serial_class, sequence_no, label, issued_for)
    values (v_serial, 'PERSON_WORLD', v_seq, r.label, 'Recurring castle staff, persistent identity')
    on conflict (serial) do nothing;

    insert into thylora_person_identity(
      person_serial, world_status, person_tier, placeholder_label, name_state, sort_name, is_minor)
    values (v_serial, 'WORLD_SIMULATED', 'NAMED_PERSISTENT', r.label, 'PENDING_CHAIRMAN', r.label, false)
    on conflict (person_serial) do nothing;

    insert into studio_world_characters(
      person_serial, character_code, world_status, simulated_disclosure,
      birth_world_date, as_of_world_date, as_of_world_time, age_years,
      role_code, rank_code, household_serial, home_place_code, work_place_code, continuity_ref)
    values (v_serial, 'STF-' || v_serial, 'WORLD_SIMULATED',
      'Simulated world character record. Not an Earth person and not a conscious being.',
      make_date(extract(year from v_now)::integer - r.age, 1, 1), v_now, '10:00', r.age,
      r.occ, r.rank, r.household,
      case when r.household = 'THY-H-0002' then 'PL-STAFF-QTR' else 'PL-NEIGH-EAST' end,
      r.place, 'THY-WORLD-CONTINUITY-FLOOR-001')
    on conflict (person_serial) do nothing;

    v_group := thyp_det_share(v_seed, 'group:' || r.n, v_mix, 'group_code');
    select * into v_pop from thyp_population_groups where group_code = v_group;

    insert into thyp_body_lock(
      person_serial, as_of_world_date, height_cm, weight_kg, shoulder_cm, waist_cm,
      head_circumference_cm, foot_length_cm, skin_tone_code, hair_color_code, hair_texture,
      hair_length_cm, eye_color_code, handedness, mobility, face_geometry)
    values (v_serial, v_now,
      156 + thyp_det(v_seed,'h:'||r.n,32),
      52 + thyp_det(v_seed,'w:'||r.n,38),
      36 + thyp_det(v_seed,'s:'||r.n,12),
      66 + thyp_det(v_seed,'wa:'||r.n,28),
      53 + thyp_det(v_seed,'hc:'||r.n,6),
      23 + thyp_det(v_seed,'ft:'||r.n,6),
      thyp_det_pick(v_seed,'skin:'||r.n, v_pop.skin_tone_codes),
      thyp_det_pick(v_seed,'haircol:'||r.n, v_pop.hair_color_codes),
      thyp_det_pick(v_seed,'hairtex:'||r.n, v_pop.hair_textures),
      3 + thyp_det(v_seed,'hairlen:'||r.n,55),
      thyp_det_pick(v_seed,'eye:'||r.n, v_pop.eye_color_codes),
      case when thyp_det(v_seed,'hand:'||r.n,10) = 0 then 'LEFT'::thyp_handedness else 'RIGHT'::thyp_handedness end,
      'FULL',
      jsonb_build_object(
        'face_width_ratio',  0.72 + thyp_det(v_seed,'fw:'||r.n,24)::numeric/100,
        'jaw_ratio',         0.60 + thyp_det(v_seed,'jw:'||r.n,30)::numeric/100,
        'eye_spacing_ratio', 0.42 + thyp_det(v_seed,'es:'||r.n,18)::numeric/100,
        'nose_ratio',        0.30 + thyp_det(v_seed,'nr:'||r.n,22)::numeric/100,
        'brow_ratio',        0.35 + thyp_det(v_seed,'br:'||r.n,20)::numeric/100))
    on conflict (person_serial) do nothing;

    insert into thyp_voice_profile(person_serial, register, fundamental_hz_low, fundamental_hz_high, languages_spoken)
    values (v_serial,
      thyp_det_pick(v_seed,'reg:'||r.n, array['LOW','MID_LOW','MID','MID_HIGH','HIGH']),
      85 + thyp_det(v_seed,'f0:'||r.n,90), 180 + thyp_det(v_seed,'f1:'||r.n,150),
      array['REALM_COMMON'])
    on conflict (person_serial) do nothing;

    insert into thyp_cognition_profile(person_serial, literacy_level, numeracy_level, languages_read)
    values (v_serial,
      case when (select requires_literacy from thyp_occupations where occupation_code = r.occ)
           then 'FLUENT' else 'BASIC' end,
      case when (select requires_literacy from thyp_occupations where occupation_code = r.occ)
           then 'PRACTISED' else 'BASIC' end,
      case when (select requires_literacy from thyp_occupations where occupation_code = r.occ)
           then array['REALM_COMMON'] else '{}'::text[] end)
    on conflict (person_serial) do nothing;

    insert into thyp_person_status(person_serial, status_rank, income_band, religion_state, culture_state)
    values (v_serial, r.rank,
      case when r.rank like 'HEAD%' or r.rank in ('HIGH_STEWARD','GOVERNOR','CAPTAIN','MASTER','KEEPER_OF_RECORDS')
           then 'UPPER_HOUSEHOLD' else 'HOUSEHOLD' end,
      'NOT_DEFINED','NOT_DEFINED')
    on conflict (person_serial) do nothing;

    insert into thyp_person_condition(person_serial, as_of_world_date, as_of_world_time, emotional_state, mood_valence, arousal)
    values (v_serial, v_now, '10:00', 'STEADY_AT_WORK', 1, 2)
    on conflict (person_serial) do nothing;

    insert into thyp_person_occupation(person_serial, occupation_code, rank_code, is_primary, appointed_world_date)
    select v_serial, r.occ, r.rank, true, make_date(extract(year from v_now)::integer - greatest(r.age - 20, 1), 4, 1)
    where not exists (select 1 from thyp_person_occupation o
                       where o.person_serial = v_serial and o.is_primary and o.ended_world_date is null);

    insert into thyp_person_assignments(person_serial, assignment_kind, place_code, from_world_date, reason)
    values (v_serial, 'WORK', r.place, v_now, r.label || ' posted here')
    on conflict do nothing;
    insert into thyp_person_assignments(person_serial, assignment_kind, place_code, from_world_date, reason)
    values (v_serial, 'HOME',
      case when r.household = 'THY-H-0002' then 'PL-STAFF-QTR' else 'PL-NEIGH-EAST' end,
      v_now, 'Residence of record')
    on conflict do nothing;

    insert into thyp_household_members(household_serial, person_serial, relation_to_head, joined_world_date)
    values (r.household, v_serial, 'HOUSEHOLD_MEMBER', v_now)
    on conflict do nothing;
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- 6 · Royal education: enrolment by age, then exact weekly schedules.
-- ---------------------------------------------------------------------------
do $$
declare
  v_now date := (select world_date from thyp_world_clock where clock_code = 'CASTLE_CURRENT');
  v_governess text := 'THY-P-0012';  -- Staff: governess
  v_tutor     text := 'THY-P-0011';  -- Staff: household tutor
  v_governor  text := 'THY-P-0010';  -- Staff: governor of studies
  v_steward   text := 'THY-P-0009';  -- Staff: high steward
  r record;
begin
  for r in select * from (values
      ('THY-P-0008','TRK-ROYAL-EARLY',  v_governess),  -- Mateo, 6
      ('THY-P-0007','TRK-ROYAL-EARLY',  v_governess),  -- grandson, 7
      ('THY-P-0006','TRK-ROYAL-MIDDLE', v_tutor),      -- Kylee, 10
      ('THY-P-0005','TRK-ROYAL-UPPER',  v_governor),   -- Kennedy, 12
      ('THY-P-0004','TRK-ROYAL-SENIOR', v_governor),   -- Cali, 16
      ('THY-P-0003','TRK-YOUTH-GOVERN', v_steward),    -- Jordyn, 18
      ('THY-P-0002','TRK-YOUTH-GOVERN', v_steward)     -- Vyctor Ebenezer, 24
    ) as t(person, track, tutor)
  loop
    insert into thyp_person_education(person_serial, track_code, tutor_person_serial, place_code, enrolled_world_date)
    select r.person, r.track, r.tutor, 'PL-SCHOOLROOM', v_now
    where not exists (select 1 from thyp_person_education e
                       where e.person_serial = r.person and e.ended_world_date is null);
    perform thyp_build_education_schedule(r.person, v_now);

    insert into thyp_relationships(person_a_serial, person_b_serial, relation_kind, since_world_date)
    values (r.tutor, r.person, 'TUTOR_OF', v_now) on conflict do nothing;
    insert into thyp_relationships(person_a_serial, person_b_serial, relation_kind, since_world_date)
    values (r.person, r.tutor, 'PUPIL_OF', v_now) on conflict do nothing;
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- 7 · One deterministic crowd cohort for the castle works.
-- ---------------------------------------------------------------------------
insert into thyp_crowd_cohorts(
  cohort_code, place_code, settlement_place_code, from_world_date, seed, target_count,
  population_mix, occupation_mix, age_low, age_high) values
  ('COH-CASTLE-WORKS','PL-COURTYARD','PL-SETTLEMENT',
   (select world_date from thyp_world_clock where clock_code = 'CASTLE_CURRENT'),
   'THY-SEED-CASTLE-WORKS-0001', 60,
   '[{"group_code":"POP-BAND-1","share_bp":1800},
     {"group_code":"POP-BAND-2","share_bp":1800},
     {"group_code":"POP-BAND-3","share_bp":1700},
     {"group_code":"POP-BAND-4","share_bp":1700},
     {"group_code":"POP-BAND-5","share_bp":1600},
     {"group_code":"POP-BAND-6","share_bp":1400}]'::jsonb,
   '[{"occupation_code":"OCC-GUARD","share_bp":1000},
     {"occupation_code":"OCC-GROOM","share_bp":700},
     {"occupation_code":"OCC-CART","share_bp":700},
     {"occupation_code":"OCC-WHEELWRIGHT","share_bp":400},
     {"occupation_code":"OCC-SMITH","share_bp":500},
     {"occupation_code":"OCC-MASON","share_bp":700},
     {"occupation_code":"OCC-CARPENTER","share_bp":700},
     {"occupation_code":"OCC-COOK","share_bp":800},
     {"occupation_code":"OCC-LAUNDRY","share_bp":700},
     {"occupation_code":"OCC-GARDENER","share_bp":600},
     {"occupation_code":"OCC-HERB","share_bp":300},
     {"occupation_code":"OCC-CLERK","share_bp":400},
     {"occupation_code":"OCC-STABLE","share_bp":600},
     {"occupation_code":"OCC-CLEANER","share_bp":700},
     {"occupation_code":"OCC-REPAIR","share_bp":400},
     {"occupation_code":"OCC-MESSENGER","share_bp":400},
     {"occupation_code":"OCC-CRAFT","share_bp":400}]'::jsonb,
   14, 62)
on conflict (cohort_code) do nothing;

select thyp_crowd_generate('COH-CASTLE-WORKS');

-- ---------------------------------------------------------------------------
-- 8 · One scene, gated. Staff and crowd clear; the royal family is BLOCKED on
--     BODY_LOCK_ABSENT, which is the honest state until the Chairman supplies
--     complexion, hair and dimensions.
-- ---------------------------------------------------------------------------
insert into thyp_scenes(scene_code, scene_title, scene_kind, world_date, world_time, place_code, continuity_ref, scene_state)
values ('SC-COURTYARD-0001','Inner courtyard, mid-morning','WORK',
        (select world_date from thyp_world_clock where clock_code = 'CASTLE_CURRENT'),
        '10:00','PL-COURTYARD','THY-WORLD-CONTINUITY-FLOOR-001','ACTIVE')
on conflict (scene_code) do nothing;

do $$
declare r record; v jsonb;
begin
  for r in select c.person_serial, coalesce(o.occupation_code,'OCC-VISITOR') as occ
             from studio_world_characters c
             left join thyp_person_occupation o
               on o.person_serial = c.person_serial and o.is_primary and o.ended_world_date is null
            order by c.person_serial
  loop
    v := thyp_clear_for_scene('SC-COURTYARD-0001', r.person_serial, r.occ);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- 9 · One worked portrait: the high steward, in the record room. Every field
--     the Chairman required is present, including provenance and version.
-- ---------------------------------------------------------------------------
do $$
declare
  v_now date := (select world_date from thyp_world_clock where clock_code = 'CASTLE_CURRENT');
  v_subject text := 'THY-P-0009';
  v_lock text; v_age integer; v_serial text := 'THY-PT-0001';
begin
  select body_lock_hash into v_lock from thyp_body_lock where person_serial = v_subject;
  select age_years     into v_age  from studio_world_characters where person_serial = v_subject;
  if v_lock is null then return; end if;

  insert into thylora_person_serial_registry(serial, serial_class, sequence_no, label, issued_for)
  values (v_serial, 'PORTRAIT', 1, 'Portrait of the high steward', 'Record room, castle')
  on conflict (serial) do nothing;

  insert into thyp_portraits(
    portrait_serial, portrait_code, title, subject_person_serial, subject_age_years,
    subject_world_date, subject_body_lock_hash, hung_place_code, hung_wall,
    hung_height_from_floor_cm, width_cm, height_cm, depth_cm, medium, support_material,
    frame_material, frame_finish, version_no,
    artist_person_serial, artist_name_ref, commissioned_by_person_serial,
    commissioned_world_date, completed_world_date, hung_world_date)
  values (v_serial, 'PT-STEWARD-001', 'The high steward at his books',
    v_subject, v_age, v_now, v_lock, 'PL-RECORD-ROOM', 'NORTH', 145,
    82.0, 104.0, 6.5, 'OIL', 'Oak panel', 'Carved oak', 'Dark wax', 1,
    null, 'Workshop of the settlement limner', 'THY-P-0001',
    v_now - 180, v_now - 40, v_now - 12)
  on conflict (portrait_serial) do nothing;

  insert into thyp_portrait_provenance(portrait_serial, event_kind, world_date, place_code, actor_person_serial, note) values
    (v_serial,'COMMISSIONED', v_now - 180,'PL-RECORD-ROOM','THY-P-0001','Commissioned by the head of the household'),
    (v_serial,'SAT_FOR',      v_now - 120,'PL-RECORD-ROOM', v_subject,  'Three sittings at the record room window'),
    (v_serial,'COMPLETED',    v_now -  40,'PL-MARKET',      null,       'Completed in the limner workshop'),
    (v_serial,'FRAMED',       v_now -  20,'PL-CARPENTRY',   null,       'Carved oak frame, dark wax finish'),
    (v_serial,'HUNG',         v_now -  12,'PL-RECORD-ROOM', null,       'Hung on the north wall, 145 cm from floor')
  on conflict (portrait_serial, event_kind, world_date) do nothing;
end $$;

commit;
