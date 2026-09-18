-- THYLORA PERSONS · readback
-- Run this AFTER applying 0001..0010 to confirm the handoff landed. It reads
-- only; it writes nothing. Every line is a claim the Chairman can check.
\pset tuples_only off
\pset format aligned

\echo
\echo == 1 · Objects present
select
  (select count(*) from pg_class c join pg_namespace n on n.oid=c.relnamespace
    where n.nspname='public' and c.relkind='r'
      and (c.relname like 'thyp\_%' or c.relname like 'studio\_%' or c.relname like 'thylora\_person\_%')) as tables,
  (select count(*) from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.proname like 'thyp\_%') as functions,
  (select count(*) from pg_policies where schemaname='public') as rls_policies,
  (select count(*) from pg_class c join pg_namespace n on n.oid=c.relnamespace
    where n.nspname='public' and c.relkind='r' and not c.relrowsecurity) as rls_disabled_tables;

\echo
\echo == 2 · The five Chairman-named objects
select t.name,
       case when to_regclass('public.' || t.name) is null then 'ABSENT' else 'PRESENT' end as state
  from (values ('thylora_person_serial_registry'),('thylora_person_identity'),
               ('studio_world_characters'),('studio_scene_character_snapshots'),
               ('studio_character_state_ledger')) as t(name)
 order by t.name;

\echo
\echo == 3 · Royal household current state (ages as instructed)
select i.person_serial,
       coalesce(i.display_name, i.placeholder_label) as person,
       i.name_state, c.age_years, c.birth_world_date, c.as_of_world_date,
       c.room_place_code as chamber,
       e.track_code as education_track,
       (select count(*) from thyp_schedule_blocks b
          join thyp_schedules s on s.schedule_code = b.schedule_code
         where s.person_serial = i.person_serial and s.schedule_state='ACTIVE') as schedule_blocks,
       case when bl.body_lock_hash is null then 'AWAITING CHAIRMAN' else left(bl.body_lock_hash,12) end as body_lock
  from thylora_person_identity i
  join studio_world_characters c on c.person_serial = i.person_serial
  left join thyp_person_education e on e.person_serial = i.person_serial and e.ended_world_date is null
  left join thyp_body_lock bl on bl.person_serial = i.person_serial
 where c.household_serial = 'THY-H-0001'
 order by c.age_years desc nulls first;

\echo
\echo == 4 · Castle workforce: every recurring worker has a persistent ID
select o.occupation_code, oc.title, count(*) as people,
       count(*) filter (where i.person_tier = 'NAMED_PERSISTENT') as named_persistent,
       count(*) filter (where i.person_tier = 'DETERMINISTIC_CROWD') as deterministic_crowd
  from thyp_person_occupation o
  join thyp_occupations oc on oc.occupation_code = o.occupation_code
  join thylora_person_identity i on i.person_serial = o.person_serial
 where o.ended_world_date is null
 group by o.occupation_code, oc.title
 order by oc.title;

\echo
\echo == 5 · Population mix actually produced, and the largest single share
select group_code, count(*) as people,
       round(100.0*count(*)/sum(count(*)) over (), 1) as pct
  from thyp_crowd_persons group by group_code order by group_code;

\echo
\echo == 6 · No appearance attribute is reachable from any work table
select count(*) as appearance_columns_on_work_tables
  from information_schema.columns
 where table_schema='public'
   and table_name in ('thyp_occupations','thyp_person_occupation','thyp_work_history')
   and (column_name ilike '%skin%' or column_name ilike '%tone%' or column_name ilike '%group%'
        or column_name ilike '%race%' or column_name ilike '%ethnic%' or column_name ilike '%complexion%');

\echo
\echo == 7 · No random() in this lane: crowds are reproducible from the seed
select count(*) as functions_calling_random
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
 where n.nspname='public' and p.proname like 'thyp\_%'
   and pg_get_functiondef(p.oid) ~* '\mrandom\s*\(';

\echo
\echo == 8 · Education: no modern school is expressible
select unnest(enum_range(null::thyp_instruction_mode))::text as instruction_mode;

\echo
\echo == 9 · Exact schedule, one royal child, one day
select b.day_of_week, b.start_time, b.end_time, b.activity_code, b.subject_code, b.place_code
  from thyp_schedule_blocks b
  join thyp_schedules s on s.schedule_code = b.schedule_code
 where s.person_serial = 'THY-P-0006' and s.schedule_state='ACTIVE' and b.day_of_week = 1
 order by b.start_time;

\echo
\echo == 10 · Scene gate: who may appear, and who may not
select gate_verdict, count(*) from studio_scene_character_snapshots
 where scene_code = 'SC-COURTYARD-0001' group by gate_verdict;
select person_serial, coalesce(display_name, placeholder_label) as person,
       thyp_visible_gate('SC-COURTYARD-0001', person_serial)->>'verdict' as verdict,
       thyp_visible_gate('SC-COURTYARD-0001', person_serial)->'blockers'->0->>'code' as first_blocker
  from thylora_person_identity
 where person_serial like 'THY-P-000%' and person_serial <= 'THY-P-0008'
 order by person_serial;

\echo
\echo == 11 · Portrait continuity: every field the Chairman required
select portrait_serial, title, subject_person_serial, subject_age_years, subject_world_date,
       hung_place_code, hung_wall, width_cm || 'x' || height_cm || 'x' || depth_cm as dimensions_cm,
       medium, frame_material, version_no, left(subject_body_lock_hash,12) as body_lock,
       (select count(*) from thyp_portrait_provenance pv where pv.portrait_serial = p.portrait_serial) as provenance_events
  from thyp_portraits p order by portrait_serial;

\echo
\echo == 12 · Life continuity: the ledger is append-only and non-empty where state moved
select change_kind, count(*) from studio_character_state_ledger group by change_kind order by 1;
select count(*) as append_only_triggers
  from pg_trigger where tgrelid = 'studio_character_state_ledger'::regclass and not tgisinternal;

\echo
\echo == 13 · Serial registry: nothing reused, nothing unexplained
select serial_class, count(*) as issued, min(sequence_no) as lowest, max(sequence_no) as highest,
       count(*) filter (where retired_at is not null) as retired
  from thylora_person_serial_registry group by serial_class order by serial_class;

\echo
\echo == 14 · Provisional state still awaiting the Chairman
select 'world date' as item, world_date::text as value, date_state::text as state from thyp_world_clock
union all
select 'royal household with a pending name', count(*)::text, 'PENDING_CHAIRMAN'
  from thylora_person_identity i join studio_world_characters c on c.person_serial = i.person_serial
 where c.household_serial = 'THY-H-0001' and i.name_state = 'PENDING_CHAIRMAN'
union all
select 'staff identified by role, not yet named', count(*)::text, 'PENDING_CHAIRMAN'
  from thylora_person_identity i join studio_world_characters c on c.person_serial = i.person_serial
 where c.household_serial <> 'THY-H-0001' and i.person_tier = 'NAMED_PERSISTENT'
   and i.name_state = 'PENDING_CHAIRMAN'
union all
select 'crowd people, unnamed by design', count(*)::text, 'PENDING_CHAIRMAN'
  from thylora_person_identity where person_tier = 'DETERMINISTIC_CROWD'
union all
select 'royal household without a body lock', count(*)::text, 'BLOCKED FROM IMAGERY'
  from studio_world_characters c
 where c.household_serial='THY-H-0001'
   and not exists (select 1 from thyp_body_lock b where b.person_serial=c.person_serial)
union all
select 'body locks flagged for review after aging', count(*)::text, 'REVIEW_DUE'
  from thyp_body_lock where review_due;
