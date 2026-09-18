-- THYLORA PERSONS · 0008 · Functions
-- Workroom: WR-PERSONS-001
--
-- Five things live here:
--   thyp_visible_gate        · reports every unmet factor of P_visible at once
--   thyp_clear_for_scene     · writes a cleared snapshot, or refuses with reasons
--   thyp_build_education_schedule · exact weekly timetable from curriculum by age
--   thyp_crowd_generate      · deterministic crowd from a seed, never random()
--   thyp_advance_person      · STATE(t+1), with a ledger row for every change
-- plus thyp_person_dossier and thyp_scene_manifest for readback.
--
-- random() is not called in this file or anywhere in this schema. Every crowd
-- person is a pure function of (cohort seed, index): regenerate and the same
-- people come back with the same serials, households, posts and bodies.

begin;

-- ---------------------------------------------------------------------------
-- 0 · Population groups. Tone bands on a ten-step scale, NOT ethnic labels and
--     NOT tied to any occupation. No table in this schema links appearance to
--     work, so the schema cannot express "this kind of work is done by this kind
--     of person". A cohort declares which bands it contains and in what share,
--     and thyp_cohort_population_mix refuses a crowd that is all one band.
--     The Chairman may rename, re-weight or repalette these rows; the generator
--     only requires that every band a cohort names is registered here.
-- ---------------------------------------------------------------------------
create table if not exists thyp_population_groups (
  group_code      text primary key,
  label           text not null,
  skin_tone_codes text[] not null check (cardinality(skin_tone_codes) >= 1),
  hair_color_codes text[] not null check (cardinality(hair_color_codes) >= 1),
  hair_textures   text[] not null check (cardinality(hair_textures) >= 1),
  eye_color_codes text[] not null check (cardinality(eye_color_codes) >= 1),
  notes           text
);

insert into thyp_population_groups(group_code, label, skin_tone_codes, hair_color_codes, hair_textures, eye_color_codes, notes) values
  ('POP-BAND-1','Tone band 1 (deepest)',  array['SKIN-01','SKIN-02'],
     array['HAIR-BLACK','HAIR-DARK-BROWN','HAIR-BROWN','HAIR-AUBURN','HAIR-GREY','HAIR-WHITE'],
     array['COILED','CURLY','WAVY','STRAIGHT'], array['EYE-DARK-BROWN','EYE-BROWN','EYE-HAZEL','EYE-GREEN','EYE-GREY','EYE-BLUE'],
     'Full hair and eye palettes are offered to every band by default; narrow them only from canon, never from assumption.'),
  ('POP-BAND-2','Tone band 2',            array['SKIN-03','SKIN-04'],
     array['HAIR-BLACK','HAIR-DARK-BROWN','HAIR-BROWN','HAIR-AUBURN','HAIR-GREY','HAIR-WHITE'],
     array['COILED','CURLY','WAVY','STRAIGHT'], array['EYE-DARK-BROWN','EYE-BROWN','EYE-HAZEL','EYE-GREEN','EYE-GREY','EYE-BLUE'], null),
  ('POP-BAND-3','Tone band 3',            array['SKIN-05'],
     array['HAIR-BLACK','HAIR-DARK-BROWN','HAIR-BROWN','HAIR-AUBURN','HAIR-RED','HAIR-GREY','HAIR-WHITE'],
     array['COILED','CURLY','WAVY','STRAIGHT'], array['EYE-DARK-BROWN','EYE-BROWN','EYE-HAZEL','EYE-GREEN','EYE-GREY','EYE-BLUE'], null),
  ('POP-BAND-4','Tone band 4',            array['SKIN-06'],
     array['HAIR-BLACK','HAIR-DARK-BROWN','HAIR-BROWN','HAIR-AUBURN','HAIR-RED','HAIR-BLOND','HAIR-GREY','HAIR-WHITE'],
     array['COILED','CURLY','WAVY','STRAIGHT'], array['EYE-DARK-BROWN','EYE-BROWN','EYE-HAZEL','EYE-GREEN','EYE-GREY','EYE-BLUE'], null),
  ('POP-BAND-5','Tone band 5',            array['SKIN-07','SKIN-08'],
     array['HAIR-BLACK','HAIR-DARK-BROWN','HAIR-BROWN','HAIR-AUBURN','HAIR-RED','HAIR-BLOND','HAIR-GREY','HAIR-WHITE'],
     array['COILED','CURLY','WAVY','STRAIGHT'], array['EYE-DARK-BROWN','EYE-BROWN','EYE-HAZEL','EYE-GREEN','EYE-GREY','EYE-BLUE'], null),
  ('POP-BAND-6','Tone band 6 (lightest)', array['SKIN-09','SKIN-10'],
     array['HAIR-DARK-BROWN','HAIR-BROWN','HAIR-AUBURN','HAIR-RED','HAIR-BLOND','HAIR-GREY','HAIR-WHITE'],
     array['COILED','CURLY','WAVY','STRAIGHT'], array['EYE-DARK-BROWN','EYE-BROWN','EYE-HAZEL','EYE-GREEN','EYE-GREY','EYE-BLUE'], null)
on conflict (group_code) do nothing;

-- Deterministic integer in [0, p_mod) from a seed string and a salt.
create or replace function thyp_det(p_seed text, p_salt text, p_mod integer)
returns integer language sql immutable as $$
  select (
    ('x' || substr(encode(digest(p_seed || '|' || p_salt, 'sha256'), 'hex'), 1, 8))::bit(32)::bigint
    & 2147483647
  )::bigint % greatest(p_mod, 1);
$$;

-- Deterministic pick from a text[] .
create or replace function thyp_det_pick(p_seed text, p_salt text, p_options text[])
returns text language sql immutable as $$
  select p_options[1 + thyp_det(p_seed, p_salt, cardinality(p_options))];
$$;

-- Deterministic pick of a share-weighted key from a mix array.
create or replace function thyp_det_share(p_seed text, p_salt text, p_mix jsonb, p_key text)
returns text language plpgsql immutable as $$
declare v_roll integer; v_acc integer := 0; e jsonb;
begin
  v_roll := thyp_det(p_seed, p_salt, 10000);
  for e in select value from jsonb_array_elements(p_mix) loop
    v_acc := v_acc + (e->>'share_bp')::integer;
    if v_roll < v_acc then return e->>p_key; end if;
  end loop;
  return (select value->>p_key from jsonb_array_elements(p_mix) limit 1);
end $$;

-- ---------------------------------------------------------------------------
-- 1 · The gate. Reports EVERY unmet factor in one call, each with its route,
--     so nobody learns their blockers one round trip at a time.
-- ---------------------------------------------------------------------------
create or replace function thyp_visible_gate(p_scene_code text, p_person_serial text)
returns jsonb language plpgsql stable as $$
declare
  v_scene    thyp_scenes;
  v_identity thylora_person_identity;
  v_char     studio_world_characters;
  v_lock     text;
  v_reason   text;
  v_role     integer;
  v_expected integer;
  v_blockers jsonb := '[]'::jsonb;
  v_factors  jsonb := '{}'::jsonb;
begin
  select * into v_scene from thyp_scenes where scene_code = p_scene_code;
  if v_scene.scene_code is null then
    return jsonb_build_object('verdict','BLOCKED','p_visible',0,
      'blockers', jsonb_build_array(jsonb_build_object(
        'code','SCENE_UNKNOWN','detail', p_scene_code || ' is not a registered scene',
        'route','thyp_scenes')));
  end if;

  select * into v_identity from thylora_person_identity where person_serial = p_person_serial;
  select * into v_char     from studio_world_characters  where person_serial = p_person_serial;

  -- IDENTITY
  if v_identity.person_serial is null or v_char.person_serial is null then
    v_blockers := v_blockers || jsonb_build_object('code','IDENTITY_ABSENT',
      'detail', coalesce(p_person_serial,'(null)') || ' is not a registered person',
      'route','thylora_person_identity + studio_world_characters');
    v_factors := v_factors || jsonb_build_object('identity', 0);
  elsif v_identity.identity_state <> 'ACTIVE' then
    v_blockers := v_blockers || jsonb_build_object('code','IDENTITY_NOT_ACTIVE',
      'detail', p_person_serial || ' is ' || v_identity.identity_state,
      'route','thylora_person_identity.identity_state');
    v_factors := v_factors || jsonb_build_object('identity', 0);
  else
    v_factors := v_factors || jsonb_build_object('identity', 1);
  end if;

  -- ROLE
  select count(*) into v_role from thyp_person_occupation o
   where o.person_serial = p_person_serial
     and o.appointed_world_date <= v_scene.world_date
     and (o.ended_world_date is null or o.ended_world_date >= v_scene.world_date);
  if v_role = 0 and not exists (
       select 1 from thyp_person_education e
        where e.person_serial = p_person_serial
          and e.enrolled_world_date <= v_scene.world_date
          and (e.ended_world_date is null or e.ended_world_date >= v_scene.world_date))
     and not exists (
       select 1 from thyp_household_members m
        where m.person_serial = p_person_serial and m.member_state = 'ACTIVE') then
    v_blockers := v_blockers || jsonb_build_object('code','ROLE_ABSENT',
      'detail','no post, no enrolment and no household membership on ' || v_scene.world_date,
      'route','thyp_person_occupation / thyp_person_education / thyp_household_members');
    v_factors := v_factors || jsonb_build_object('role', 0);
  else
    v_factors := v_factors || jsonb_build_object('role', 1);
  end if;

  -- LOCATION_REASON
  v_reason := thyp_location_reason(p_person_serial, v_scene.place_code, v_scene.world_date);
  if v_reason is null then
    v_blockers := v_blockers || jsonb_build_object('code','NO_LOCATION_REASON',
      'detail','nothing puts ' || coalesce(p_person_serial,'(null)') || ' at ' || v_scene.place_code || ' on ' || v_scene.world_date,
      'route','thyp_person_assignments / thyp_schedule_blocks / thyp_households / thyp_visit_grants');
    v_factors := v_factors || jsonb_build_object('location_reason', 0);
  else
    v_factors := v_factors || jsonb_build_object('location_reason', 1, 'location_reason_code', v_reason);
  end if;

  -- BODY_LOCK, as of the scene's own date rather than today's record.
  v_lock := thyp_body_lock_at(p_person_serial, v_scene.world_date);
  if v_lock is null then
    if exists (select 1 from thyp_body_lock where person_serial = p_person_serial) then
      v_blockers := v_blockers || jsonb_build_object('code','BODY_LOCK_ABSENT_FOR_DATE',
        'detail','locks exist but none is recorded at or before ' || v_scene.world_date
                 || '; seal the body this person held then',
        'route','thyp_body_lock_history');
    else
      v_blockers := v_blockers || jsonb_build_object('code','BODY_LOCK_ABSENT',
        'detail','no sealed body lock; imagery would have nothing to match',
        'route','thyp_body_lock');
    end if;
    v_factors := v_factors || jsonb_build_object('body_lock', 0);
  else
    v_factors := v_factors || jsonb_build_object('body_lock', 1, 'body_lock_hash', v_lock);
  end if;

  -- TIME_STATE
  if v_char.birth_world_date is null then
    v_blockers := v_blockers || jsonb_build_object('code','TIME_STATE_UNFIXED',
      'detail','no birth world date, so age at ' || v_scene.world_date || ' cannot be fixed',
      'route','studio_world_characters.birth_world_date');
    v_factors := v_factors || jsonb_build_object('time_state', 0);
  else
    v_expected := (extract(year from v_scene.world_date) - extract(year from v_char.birth_world_date))::integer
      - case when (extract(month from v_scene.world_date)::integer * 100 + extract(day from v_scene.world_date)::integer)
               < (extract(month from v_char.birth_world_date)::integer * 100 + extract(day from v_char.birth_world_date)::integer)
             then 1 else 0 end;
    if v_expected < 0 then
      v_blockers := v_blockers || jsonb_build_object('code','NOT_YET_BORN',
        'detail', p_person_serial || ' is born ' || v_char.birth_world_date || ', scene is ' || v_scene.world_date,
        'route','thyp_scenes.world_date');
      v_factors := v_factors || jsonb_build_object('time_state', 0);
    elsif v_identity.identity_state = 'DECEASED_IN_WORLD' then
      v_blockers := v_blockers || jsonb_build_object('code','DECEASED_IN_WORLD',
        'detail','recorded as deceased in world; appearance requires a dated flashback scene',
        'route','thylora_person_identity.identity_state');
      v_factors := v_factors || jsonb_build_object('time_state', 0);
    else
      v_factors := v_factors || jsonb_build_object('time_state', 1, 'age_years_at_scene', v_expected);
    end if;
  end if;

  -- CONTINUITY
  if v_char.continuity_ref is null or length(btrim(coalesce(v_char.continuity_ref,''))) < 4 then
    v_blockers := v_blockers || jsonb_build_object('code','CONTINUITY_REF_ABSENT',
      'detail','person carries no continuity reference',
      'route','studio_world_characters.continuity_ref');
    v_factors := v_factors || jsonb_build_object('continuity', 0);
  else
    v_factors := v_factors || jsonb_build_object('continuity', 1, 'continuity_ref', v_char.continuity_ref);
  end if;

  return jsonb_build_object(
    'scene_code',  p_scene_code,
    'person_serial', p_person_serial,
    'factors',     v_factors,
    'p_visible',   case when jsonb_array_length(v_blockers) = 0 then 1 else 0 end,
    'verdict',     case when jsonb_array_length(v_blockers) = 0 then 'CLEARED' else 'BLOCKED' end,
    'blockers',    v_blockers);
end $$;

-- Write a cleared snapshot, or refuse and hand back every reason.
create or replace function thyp_clear_for_scene(
  p_scene_code text, p_person_serial text, p_role_in_scene text, p_wardrobe_ref text default null
) returns jsonb language plpgsql security definer set search_path = public as $$
declare v_gate jsonb; v_scene thyp_scenes;
begin
  v_gate := thyp_visible_gate(p_scene_code, p_person_serial);
  if (v_gate->>'verdict') <> 'CLEARED' then
    return v_gate;
  end if;
  select * into v_scene from thyp_scenes where scene_code = p_scene_code;

  insert into studio_scene_character_snapshots(
    scene_code, person_serial, role_in_scene, location_reason, body_lock_hash,
    time_state_world_date, time_state_world_time, age_years_at_scene,
    continuity_ref, gate_verdict, gate_blockers, wardrobe_ref, visible_injury_ids)
  values (
    p_scene_code, p_person_serial, p_role_in_scene,
    v_gate->'factors'->>'location_reason_code',
    v_gate->'factors'->>'body_lock_hash',
    v_scene.world_date, v_scene.world_time,
    (v_gate->'factors'->>'age_years_at_scene')::integer,
    v_scene.continuity_ref, 'CLEARED', '[]'::jsonb, p_wardrobe_ref,
    coalesce((select array_agg(i.id) from thyp_injuries i
               where i.person_serial = p_person_serial
                 and i.visible_in_imagery
                 and i.sustained_world_date <= v_scene.world_date
                 and (i.healed_world_date is null or i.healed_world_date >= v_scene.world_date)), '{}'))
  on conflict (scene_code, person_serial) do update
    set role_in_scene = excluded.role_in_scene,
        location_reason = excluded.location_reason,
        body_lock_hash = excluded.body_lock_hash,
        age_years_at_scene = excluded.age_years_at_scene,
        gate_verdict = 'CLEARED',
        gate_blockers = '[]'::jsonb,
        wardrobe_ref = excluded.wardrobe_ref,
        visible_injury_ids = excluded.visible_injury_ids;

  return v_gate;
end $$;

-- ---------------------------------------------------------------------------
-- 2 · Exact weekly schedule from the curriculum, by age. Largest-remainder
--     allocation of weekly minutes across lesson slots, deterministic order,
--     meals, rest, devotion, service and physical training never overwritten.
-- ---------------------------------------------------------------------------
create or replace function thyp_build_education_schedule(
  p_person_serial text, p_effective_from date
) returns text language plpgsql security definer set search_path = public as $$
declare
  v_age integer; v_track text; v_class thyp_learner_class; v_template text;
  v_kind thyp_schedule_kind; v_schedule_code text;
  v_total_minutes integer; v_curric_minutes integer;
  v_place text; v_tutor text;
  r record; b record;
  v_alloc jsonb := '{}'::jsonb; v_rem jsonb := '{}'::jsonb;
  v_pick text; v_best integer; v_len integer; k text;
begin
  select age_years into v_age from studio_world_characters where person_serial = p_person_serial;
  if v_age is null then
    raise exception 'SCHEDULE_NEEDS_AGE: % has no age state', p_person_serial;
  end if;

  select e.track_code, e.place_code, e.tutor_person_serial into v_track, v_place, v_tutor
    from thyp_person_education e
   where e.person_serial = p_person_serial and e.ended_world_date is null
   order by e.enrolled_world_date desc limit 1;
  if v_track is null then
    raise exception 'SCHEDULE_NEEDS_ENROLMENT: % is not enrolled on a track', p_person_serial;
  end if;

  select learner_class into v_class from thyp_education_tracks where track_code = v_track;
  select template_code into v_template
    from thyp_day_templates where learner_class = v_class limit 1;
  if v_template is null then
    raise exception 'SCHEDULE_NEEDS_TEMPLATE: no day template for learner class %', v_class;
  end if;

  v_kind := case v_class
    when 'ROYAL_CHILD' then 'ROYAL_CHILD_LESSONS'
    when 'OLDER_YOUTH' then 'APPRENTICESHIP'
    when 'PAGE_WARD'   then 'HOUSEHOLD_SERVICE'
    else 'LOCAL_INSTRUCTION' end;

  v_schedule_code := 'SCH-' || p_person_serial || '-' || to_char(p_effective_from, 'YYYYMMDD');

  -- Close any schedule this one supersedes; never delete it.
  update thyp_schedules set effective_to = p_effective_from - 1, schedule_state = 'ARCHIVED'
   where person_serial = p_person_serial and effective_to is null
     and schedule_code <> v_schedule_code and effective_from < p_effective_from;

  insert into thyp_schedules(schedule_code, person_serial, schedule_kind, effective_from, age_band_low, age_band_high)
  values (v_schedule_code, p_person_serial, v_kind, p_effective_from, v_age, v_age)
  on conflict (schedule_code) do update set schedule_state = 'ACTIVE', effective_to = null;

  delete from thyp_schedule_blocks where schedule_code = v_schedule_code;

  -- Available teaching minutes in the week.
  select coalesce(sum(extract(epoch from (end_time - start_time)) / 60), 0)::integer into v_total_minutes
    from thyp_day_templates
   where template_code = v_template and slot_kind in ('LESSON','PRACTICAL');

  select coalesce(sum(c.minutes_per_week), 0)::integer into v_curric_minutes
    from thyp_education_curriculum c
   where c.track_code = v_track and v_age between c.age_low and c.age_high;

  if v_curric_minutes = 0 then
    raise exception 'SCHEDULE_NO_CURRICULUM: track % has no lines covering age %', v_track, v_age;
  end if;

  -- Scale the curriculum to the minutes the day actually has.
  for r in select c.subject_code, c.minutes_per_week, c.priority
             from thyp_education_curriculum c
            where c.track_code = v_track and v_age between c.age_low and c.age_high
            order by c.priority, c.subject_code loop
    v_alloc := v_alloc || jsonb_build_object(r.subject_code,
      round(r.minutes_per_week::numeric * v_total_minutes / v_curric_minutes));
  end loop;
  v_rem := v_alloc;

  -- Lay the week out block by block, deterministic order, greediest need first.
  for b in select day_of_week, block_index, start_time, end_time, slot_kind
             from thyp_day_templates
            where template_code = v_template
            order by day_of_week, start_time, block_index loop

    if b.slot_kind in ('LESSON','PRACTICAL') then
      v_len := (extract(epoch from (b.end_time - b.start_time)) / 60)::integer;
      v_pick := null; v_best := -1;
      for k in select key from jsonb_each(v_rem) order by (value::text)::numeric desc, key loop
        if (v_rem->>k)::numeric > v_best then v_pick := k; v_best := (v_rem->>k)::numeric; end if;
        exit;
      end loop;
      if v_pick is null then v_pick := (select key from jsonb_each(v_alloc) order by key limit 1); end if;
      v_rem := jsonb_set(v_rem, array[v_pick],
                 to_jsonb(greatest((v_rem->>v_pick)::numeric - v_len, 0)));

      insert into thyp_schedule_blocks(
        schedule_code, day_of_week, start_time, end_time, activity_code, subject_code,
        place_code, supervisor_person_serial)
      values (v_schedule_code, b.day_of_week, b.start_time, b.end_time,
              b.slot_kind::text, v_pick, v_place, v_tutor);
    else
      insert into thyp_schedule_blocks(
        schedule_code, day_of_week, start_time, end_time, activity_code, subject_code, place_code)
      values (v_schedule_code, b.day_of_week, b.start_time, b.end_time,
              b.slot_kind::text, null, v_place);
    end if;
  end loop;

  insert into thyp_person_assignments(person_serial, assignment_kind, place_code, from_world_date, reason)
  select p_person_serial, 'SCHOOLING', v_place, p_effective_from,
         'Enrolled on ' || v_track || ' under schedule ' || v_schedule_code
   where v_place is not null
     and not exists (select 1 from thyp_person_assignments a
                      where a.person_serial = p_person_serial
                        and a.assignment_kind = 'SCHOOLING' and a.to_world_date is null);

  return v_schedule_code;
end $$;

-- ---------------------------------------------------------------------------
-- 3 · Deterministic crowd generation. Same seed, same people, forever.
-- ---------------------------------------------------------------------------
create or replace function thyp_crowd_generate(p_cohort_code text, p_count integer default null)
returns integer language plpgsql security definer set search_path = public as $$
declare
  v_cohort thyp_crowd_cohorts;
  v_target integer; v_made integer := 0; i integer;
  v_seed text; v_hash text; v_group text; v_occ text; v_age integer;
  v_house text; v_serial text; v_next integer; v_pop thyp_population_groups;
  v_min smallint; v_unregistered text;
  v_bm integer; v_bd integer; v_birth date;
begin
  select * into v_cohort from thyp_crowd_cohorts where cohort_code = p_cohort_code;
  if v_cohort.cohort_code is null then
    raise exception 'COHORT_UNKNOWN: %', p_cohort_code;
  end if;

  -- Every band the cohort names must be registered, or the crowd is not
  -- reproducible and the mix is not real.
  select string_agg(e->>'group_code', ', ') into v_unregistered
    from jsonb_array_elements(v_cohort.population_mix) e
   where not exists (select 1 from thyp_population_groups g where g.group_code = e->>'group_code');
  if v_unregistered is not null then
    raise exception 'POPULATION_GROUP_UNREGISTERED: %', v_unregistered;
  end if;

  v_target := least(coalesce(p_count, v_cohort.target_count), v_cohort.target_count);

  for i in 0 .. v_target - 1 loop
    continue when exists (select 1 from thyp_crowd_persons
                           where cohort_code = p_cohort_code and cohort_index = i);

    v_seed := v_cohort.seed || '|' || p_cohort_code;
    v_hash := encode(digest(v_seed || '|' || i::text, 'sha256'), 'hex');

    v_group := thyp_det_share(v_seed, 'group:' || i, v_cohort.population_mix, 'group_code');
    v_occ   := thyp_det_share(v_seed, 'occ:' || i,   v_cohort.occupation_mix, 'occupation_code');
    select * into v_pop from thyp_population_groups where group_code = v_group;

    v_age := v_cohort.age_low
           + thyp_det(v_seed, 'age:' || i, (v_cohort.age_high - v_cohort.age_low + 1));

    -- Birth date first, then the age it implies, so studio_world_characters'
    -- age arithmetic holds exactly rather than being corrected afterwards.
    v_bm := 1 + thyp_det(v_seed, 'bmonth:' || i, 12);
    v_bd := 1 + thyp_det(v_seed, 'bday:' || i, 28);
    v_birth := make_date(
      extract(year from v_cohort.from_world_date)::integer - v_age
        - case when (v_bm * 100 + v_bd)
                  > (extract(month from v_cohort.from_world_date)::integer * 100
                     + extract(day from v_cohort.from_world_date)::integer)
               then 1 else 0 end,
      v_bm, v_bd);

    -- A post has a minimum age; a crowd person who is too young for the drawn
    -- post is a household member at that place instead of being mis-staffed.
    select min_age_years into v_min from thyp_occupations where occupation_code = v_occ;
    if v_min is not null and v_age < v_min then v_occ := null; end if;

    -- Drawn from registered households at the cohort's settlement, so a crowd
    -- person has a home before they have a face.
    select h.household_serial into v_house
      from thyp_households h
     where h.household_state = 'ACTIVE'
       and h.household_kind = any(v_cohort.household_kinds)
       and (h.settlement_place_code = v_cohort.settlement_place_code
            or h.residence_place_code = v_cohort.place_code)
     order by thyp_det(v_seed, 'house:' || i || ':' || h.household_serial, 1000000), h.household_serial
     limit 1;

    select coalesce(max(sequence_no), 0) + 1 into v_next
      from thylora_person_serial_registry where serial_class = 'CROWD_PERSON';
    v_serial := 'THY-C-' || lpad(v_next::text, 6, '0');

    insert into thylora_person_serial_registry(serial, serial_class, sequence_no, label, issued_for)
    values (v_serial, 'CROWD_PERSON', v_next,
            p_cohort_code || ' #' || i, 'Deterministic crowd person, cohort ' || p_cohort_code);

    insert into thylora_person_identity(
      person_serial, world_status, person_tier, placeholder_label, name_state, is_minor, guardian_person_serial)
    values (v_serial, 'WORLD_SIMULATED', 'DETERMINISTIC_CROWD',
            'Crowd person ' || p_cohort_code || ' #' || i, 'PENDING_CHAIRMAN', false, null);

    insert into studio_world_characters(
      person_serial, character_code, world_status, simulated_disclosure,
      birth_world_date, as_of_world_date, as_of_world_time, age_years,
      role_code, home_place_code, work_place_code, household_serial, continuity_ref, character_state)
    values (v_serial, 'CROWD-' || p_cohort_code || '-' || lpad(i::text,5,'0'), 'WORLD_SIMULATED',
            'Simulated world character. Not an Earth person.',
            v_birth, v_cohort.from_world_date, '09:00', v_age,
            v_occ, v_cohort.place_code, case when v_occ is not null then v_cohort.place_code end,
            v_house, 'THY-WORLD-CONTINUITY-FLOOR-001', 'ACTIVE');

    insert into thyp_body_lock(
      person_serial, as_of_world_date, height_cm, weight_kg,
      skin_tone_code, hair_color_code, hair_texture, hair_length_cm,
      eye_color_code, handedness, mobility, face_geometry)
    values (v_serial, v_cohort.from_world_date,
      case when v_age < 18 then 74 + v_age * 5.5 + thyp_det(v_seed,'h:'||i,9)
           else 150 + thyp_det(v_seed,'h:'||i,36) end,
      case when v_age < 18 then 9 + v_age * 2.6 + thyp_det(v_seed,'w:'||i,7)
           else 48 + thyp_det(v_seed,'w:'||i,42) end,
      thyp_det_pick(v_seed, 'skin:'||i, v_pop.skin_tone_codes),
      thyp_det_pick(v_seed, 'haircol:'||i, v_pop.hair_color_codes),
      thyp_det_pick(v_seed, 'hairtex:'||i, v_pop.hair_textures),
      2 + thyp_det(v_seed,'hairlen:'||i, 60),
      thyp_det_pick(v_seed, 'eye:'||i, v_pop.eye_color_codes),
      case when thyp_det(v_seed,'hand:'||i,10) = 0 then 'LEFT'::thyp_handedness else 'RIGHT'::thyp_handedness end,
      'FULL',
      jsonb_build_object(
        'face_width_ratio',  0.72 + thyp_det(v_seed,'fw:'||i,24)::numeric/100,
        'jaw_ratio',         0.60 + thyp_det(v_seed,'jw:'||i,30)::numeric/100,
        'eye_spacing_ratio', 0.42 + thyp_det(v_seed,'es:'||i,18)::numeric/100,
        'nose_ratio',        0.30 + thyp_det(v_seed,'nr:'||i,22)::numeric/100,
        'brow_ratio',        0.35 + thyp_det(v_seed,'br:'||i,20)::numeric/100));

    insert into thyp_crowd_persons(
      person_serial, cohort_code, cohort_index, derivation_hash, group_code,
      occupation_code, household_serial, age_years, body_lock_hash)
    select v_serial, p_cohort_code, i, v_hash, v_group, v_occ, v_house,
           (select age_years from studio_world_characters where person_serial = v_serial),
           (select body_lock_hash from thyp_body_lock where person_serial = v_serial);

    -- A post, so ROLE is satisfied and the person is not an extra.
    if v_occ is not null then
      insert into thyp_person_occupation(person_serial, occupation_code, is_primary, appointed_world_date)
      values (v_serial, v_occ, true, v_cohort.from_world_date);
      insert into thyp_person_assignments(person_serial, assignment_kind, place_code, from_world_date, reason)
      values (v_serial, 'WORK', v_cohort.place_code, v_cohort.from_world_date,
              'Cohort ' || p_cohort_code || ' post ' || v_occ);
    end if;

    if v_house is not null then
      insert into thyp_household_members(household_serial, person_serial, relation_to_head, joined_world_date)
      values (v_house, v_serial, 'HOUSEHOLD_MEMBER', v_cohort.from_world_date)
      on conflict do nothing;
    end if;

    v_made := v_made + 1;
  end loop;

  return v_made;
end $$;

-- ---------------------------------------------------------------------------
-- 4 · STATE(t+1). Advances time and writes a ledger row for every change.
--     Dimensional growth is NOT invented: an age change marks the body lock for
--     review and says so, rather than silently resizing anyone.
-- ---------------------------------------------------------------------------
alter table thyp_body_lock add column if not exists review_due boolean not null default false;
alter table thyp_body_lock add column if not exists review_reason text;

create or replace function thyp_advance_person(p_person_serial text, p_to_world_date date)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_char studio_world_characters; v_old_age integer; v_new_age integer;
  v_track text; v_new_track text; v_class thyp_learner_class; v_sched text;
  v_events integer; v_memories integer; v_rel integer; v_learning integer;
  v_applied jsonb := '[]'::jsonb;
begin
  select * into v_char from studio_world_characters where person_serial = p_person_serial;
  if v_char.person_serial is null then
    raise exception 'PERSON_UNKNOWN: %', p_person_serial;
  end if;
  if v_char.as_of_world_date is not null and p_to_world_date < v_char.as_of_world_date then
    raise exception 'STATE_REWIND_REFUSED: % is at %, cannot advance to %',
      p_person_serial, v_char.as_of_world_date, p_to_world_date;
  end if;

  v_old_age := v_char.age_years;
  v_new_age := (extract(year from p_to_world_date) - extract(year from v_char.birth_world_date))::integer
    - case when (extract(month from p_to_world_date)::integer * 100 + extract(day from p_to_world_date)::integer)
             < (extract(month from v_char.birth_world_date)::integer * 100 + extract(day from v_char.birth_world_date)::integer)
           then 1 else 0 end;

  -- EVENTS, MEMORY_WRITES, RELATIONSHIP_CHANGES, LEARNING in the interval.
  select count(*) into v_events from thyp_life_events
   where person_serial = p_person_serial
     and world_date > coalesce(v_char.as_of_world_date, p_to_world_date) and world_date <= p_to_world_date;
  select count(*) into v_memories from thyp_memory_ledger
   where person_serial = p_person_serial
     and world_date > coalesce(v_char.as_of_world_date, p_to_world_date) and world_date <= p_to_world_date;
  select count(*) into v_rel from thyp_relationships
   where (person_a_serial = p_person_serial or person_b_serial = p_person_serial)
     and coalesce(since_world_date, p_to_world_date) > coalesce(v_char.as_of_world_date, p_to_world_date)
     and coalesce(since_world_date, p_to_world_date) <= p_to_world_date;
  select count(*) into v_learning from thyp_education_progress
   where person_serial = p_person_serial
     and last_advanced_world_date > coalesce(v_char.as_of_world_date, p_to_world_date)
     and last_advanced_world_date <= p_to_world_date;

  -- WORK_HISTORY: close posts that ended in the interval.
  update thyp_person_occupation set is_primary = false
   where person_serial = p_person_serial and ended_world_date is not null and ended_world_date <= p_to_world_date;

  insert into thyp_work_history(person_serial, occupation_code, rank_code, place_code, from_world_date, to_world_date, departure_reason)
  select o.person_serial, o.occupation_code, o.rank_code, v_char.work_place_code,
         o.appointed_world_date, o.ended_world_date, 'Post ended in world'
    from thyp_person_occupation o
   where o.person_serial = p_person_serial
     and o.ended_world_date is not null and o.ended_world_date <= p_to_world_date
     and not exists (select 1 from thyp_work_history w
                      where w.person_serial = o.person_serial
                        and w.occupation_code = o.occupation_code
                        and w.from_world_date = o.appointed_world_date);

  -- PHYSICAL_AGING: the pointer moves, and the lock is flagged for review. The
  -- new dimensions are a Chairman decision, not something this function invents.
  update studio_world_characters
     set as_of_world_date = p_to_world_date, age_years = v_new_age
   where person_serial = p_person_serial;

  if v_new_age is distinct from v_old_age then
    update thyp_body_lock
       set review_due = true,
           review_reason = 'Age moved from ' || coalesce(v_old_age::text,'?') || ' to ' || v_new_age
                        || ' on ' || p_to_world_date || '; dimensions await Chairman confirmation'
     where person_serial = p_person_serial;
    v_applied := v_applied || to_jsonb('PHYSICAL_AGING'::text);
  end if;

  -- Re-derive the education schedule if the age band moved the learner on.
  select e.track_code into v_track from thyp_person_education e
   where e.person_serial = p_person_serial and e.ended_world_date is null limit 1;
  if v_track is not null then
    select learner_class into v_class from thyp_education_tracks where track_code = v_track;
    select track_code into v_new_track from thyp_education_tracks
     where learner_class = v_class and v_new_age between age_low and age_high
       and track_state = 'ACTIVE' order by track_code limit 1;
    if v_new_track is not null and v_new_track <> v_track then
      update thyp_person_education set ended_world_date = p_to_world_date
       where person_serial = p_person_serial and ended_world_date is null;
      insert into thyp_person_education(person_serial, track_code, tutor_person_serial, place_code, enrolled_world_date)
      select p_person_serial, v_new_track, e.tutor_person_serial, e.place_code, p_to_world_date
        from thyp_person_education e
       where e.person_serial = p_person_serial order by e.enrolled_world_date desc limit 1;
      v_applied := v_applied || to_jsonb('TRACK_ADVANCE'::text);
    end if;
    begin
      v_sched := thyp_build_education_schedule(p_person_serial, p_to_world_date);
      v_applied := v_applied || to_jsonb('SCHEDULE_REBUILT'::text);
    exception when others then
      v_applied := v_applied || to_jsonb(('SCHEDULE_HELD:' || sqlerrm)::text);
    end;
  end if;

  if v_events   > 0 then v_applied := v_applied || to_jsonb('EVENTS'::text); end if;
  if v_learning > 0 then v_applied := v_applied || to_jsonb('LEARNING'::text); end if;
  if v_rel      > 0 then v_applied := v_applied || to_jsonb('RELATIONSHIP_CHANGES'::text); end if;
  if v_memories > 0 then v_applied := v_applied || to_jsonb('MEMORY_WRITES'::text); end if;

  return jsonb_build_object(
    'person_serial', p_person_serial,
    'from_world_date', v_char.as_of_world_date,
    'to_world_date', p_to_world_date,
    'age_from', v_old_age, 'age_to', v_new_age,
    'events', v_events, 'learning', v_learning,
    'relationship_changes', v_rel, 'memory_writes', v_memories,
    'applied', v_applied,
    'schedule_code', v_sched,
    'body_lock_review_due', (v_new_age is distinct from v_old_age));
end $$;

-- ---------------------------------------------------------------------------
-- 5 · Readback
-- ---------------------------------------------------------------------------
create or replace function thyp_person_dossier(p_person_serial text)
returns jsonb language sql stable as $$
  select jsonb_strip_nulls(jsonb_build_object(
    'identity',   (select to_jsonb(i) from thylora_person_identity i where i.person_serial = p_person_serial),
    'character',  (select to_jsonb(c) from studio_world_characters c where c.person_serial = p_person_serial),
    'body_lock',  (select to_jsonb(b) from thyp_body_lock b where b.person_serial = p_person_serial),
    'voice',      (select to_jsonb(v) from thyp_voice_profile v where v.person_serial = p_person_serial),
    'bio',        (select to_jsonb(x) from thyp_bio_profile x where x.person_serial = p_person_serial),
    'cognition',  (select to_jsonb(g) from thyp_cognition_profile g where g.person_serial = p_person_serial),
    'status',     (select to_jsonb(s) from thyp_person_status s where s.person_serial = p_person_serial),
    'condition',  (select to_jsonb(d) from thyp_person_condition d where d.person_serial = p_person_serial),
    'occupations',(select jsonb_agg(to_jsonb(o) order by o.appointed_world_date)
                     from thyp_person_occupation o where o.person_serial = p_person_serial),
    'assignments',(select jsonb_agg(to_jsonb(a) order by a.from_world_date)
                     from thyp_person_assignments a where a.person_serial = p_person_serial),
    'education',  (select jsonb_agg(to_jsonb(e) order by e.enrolled_world_date)
                     from thyp_person_education e where e.person_serial = p_person_serial),
    'progress',   (select jsonb_agg(to_jsonb(p) order by p.subject_code)
                     from thyp_education_progress p where p.person_serial = p_person_serial),
    'schedule',   (select jsonb_agg(jsonb_build_object('day', b.day_of_week, 'from', b.start_time,
                                     'to', b.end_time, 'activity', b.activity_code, 'subject', b.subject_code)
                                    order by b.day_of_week, b.start_time)
                     from thyp_schedule_blocks b join thyp_schedules s on s.schedule_code = b.schedule_code
                    where s.person_serial = p_person_serial and s.schedule_state = 'ACTIVE'),
    'relationships',(select jsonb_agg(to_jsonb(r) order by r.relation_kind)
                     from thyp_relationships r
                    where r.person_a_serial = p_person_serial or r.person_b_serial = p_person_serial),
    'skills',     (select jsonb_agg(to_jsonb(k) order by k.skill_code)
                     from thyp_person_skills k where k.person_serial = p_person_serial),
    'knowledge',  (select jsonb_agg(to_jsonb(n) order by n.knowledge_code)
                     from thyp_person_knowledge n where n.person_serial = p_person_serial),
    'memory',     (select jsonb_agg(to_jsonb(m) order by m.world_date)
                     from thyp_memory_ledger m where m.person_serial = p_person_serial),
    'life_events',(select jsonb_agg(to_jsonb(l) order by l.world_date)
                     from thyp_life_events l where l.person_serial = p_person_serial),
    'work_history',(select jsonb_agg(to_jsonb(w) order by w.from_world_date)
                     from thyp_work_history w where w.person_serial = p_person_serial),
    'wardrobe',   (select jsonb_agg(to_jsonb(g) order by g.garment_code)
                     from thyp_wardrobe_items g where g.person_serial = p_person_serial),
    'possessions',(select jsonb_agg(to_jsonb(q) order by q.possession_code)
                     from thyp_possessions q where q.person_serial = p_person_serial),
    'injuries',   (select jsonb_agg(to_jsonb(j) order by j.sustained_world_date)
                     from thyp_injuries j where j.person_serial = p_person_serial),
    'portraits',  (select jsonb_agg(to_jsonb(t) order by t.subject_world_date)
                     from thyp_portraits t where t.subject_person_serial = p_person_serial),
    'ledger',     (select jsonb_agg(to_jsonb(z) order by z.world_time_to)
                     from studio_character_state_ledger z where z.person_serial = p_person_serial)
  ));
$$;

create or replace function thyp_scene_manifest(p_scene_code text)
returns jsonb language sql stable as $$
  select jsonb_build_object(
    'scene', (select to_jsonb(s) from thyp_scenes s where s.scene_code = p_scene_code),
    'visible_people', (select jsonb_agg(jsonb_build_object(
        'person_serial', n.person_serial,
        'name', coalesce(i.display_name, i.placeholder_label),
        'tier', i.person_tier,
        'role_in_scene', n.role_in_scene,
        'location_reason', n.location_reason,
        'age_years_at_scene', n.age_years_at_scene,
        'body_lock_hash', n.body_lock_hash,
        'verdict', n.gate_verdict) order by n.person_serial)
      from studio_scene_character_snapshots n
      join thylora_person_identity i on i.person_serial = n.person_serial
     where n.scene_code = p_scene_code),
    'cleared_count', (select count(*) from studio_scene_character_snapshots
                       where scene_code = p_scene_code and gate_verdict = 'CLEARED'),
    'blocked_count',  (select count(*) from studio_scene_character_snapshots
                       where scene_code = p_scene_code and gate_verdict = 'BLOCKED'));
$$;

commit;
