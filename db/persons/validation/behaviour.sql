-- THYLORA PERSONS · behavioural checks against an applied schema.
-- Each check asserts that a rule REJECTS what it claims to reject. Run after the
-- migrations; expect the ERROR lines — they are the passing result.
\set ON_ERROR_STOP 0
\pset tuples_only on
\pset format unaligned

\echo == EXPECT REJECT: minor with no recorded guardian
insert into thylora_person_serial_registry(serial,serial_class,sequence_no,label) values ('THY-P-9001','PERSON_WORLD',9001,'test');
insert into thylora_person_identity(person_serial,world_status,person_tier,display_name,is_minor)
values ('THY-P-9001','WORLD_SIMULATED','NAMED_PERSISTENT','Test Minor',true);

\echo == EXPECT REJECT: name_state CONFIRMED with no name
insert into thylora_person_identity(person_serial,world_status,person_tier,name_state)
values ('THY-P-9001','WORLD_SIMULATED','NAMED_PERSISTENT','CONFIRMED');

\echo == EXPECT ACCEPT: unnamed person with a placeholder label
insert into thylora_person_identity(person_serial,world_status,person_tier,placeholder_label,name_state)
values ('THY-P-9001','WORLD_SIMULATED','NAMED_PERSISTENT','Unnamed test person','PENDING_CHAIRMAN');

\echo == EXPECT REJECT: world character labelled EARTH_REAL
insert into studio_world_characters(person_serial,character_code,world_status,simulated_disclosure,continuity_ref)
values ('THY-P-9001','TST-1','EARTH_REAL','Simulated world character.','THY-WORLD-CONTINUITY-FLOOR-001');

\echo == EXPECT REJECT: world character with no simulated disclosure
insert into studio_world_characters(person_serial,character_code,world_status,continuity_ref)
values ('THY-P-9001','TST-1','WORLD_SIMULATED','THY-WORLD-CONTINUITY-FLOOR-001');

\echo == EXPECT REJECT: age that does not match the birth date at the view date
insert into studio_world_characters(person_serial,character_code,world_status,simulated_disclosure,
  birth_world_date,as_of_world_date,age_years,continuity_ref)
values ('THY-P-9001','TST-1','WORLD_SIMULATED','Simulated world character.',
  '1467-01-01','1487-06-21',44,'THY-WORLD-CONTINUITY-FLOOR-001');

\echo == EXPECT ACCEPT: the same person with the correct age arithmetic
insert into studio_world_characters(person_serial,character_code,world_status,simulated_disclosure,
  birth_world_date,as_of_world_date,as_of_world_time,age_years,role_code,continuity_ref)
values ('THY-P-9001','TST-1','WORLD_SIMULATED','Simulated world character record.',
  '1467-01-01','1487-06-21','10:00',20,'OCC-CLERK','THY-WORLD-CONTINUITY-FLOOR-001');

\echo == EXPECT REJECT: religion code with no canonical source
insert into thyp_person_status(person_serial,religion_state,religion_code)
values ('THY-P-9001','CANONICALLY_DEFINED','REL-X');

\echo == EXPECT REJECT: appointment below the occupation minimum age
insert into thyp_person_occupation(person_serial,occupation_code,is_primary,appointed_world_date)
values ('THY-P-0008','OCC-SMITH',true,'1487-06-21');

\echo == EXPECT REJECT: curriculum line outside its own track age band
insert into thyp_education_curriculum(track_code,subject_code,age_low,age_high,minutes_per_week)
values ('TRK-ROYAL-EARLY','SUB-READING',3,20,120);

\echo == EXPECT REJECT: enrolment on a track whose age band excludes the learner
insert into thyp_person_education(person_serial,track_code,tutor_person_serial,enrolled_world_date)
values ('THY-P-0008','TRK-ROYAL-UPPER','THY-P-0010','1487-06-21');

\echo == EXPECT REJECT: tutor-delivered track enrolled with no tutor named
insert into thyp_person_education(person_serial,track_code,enrolled_world_date)
values ('THY-P-9001','TRK-YOUTH-GOVERN','1487-06-21');

\echo == EXPECT REJECT: overlapping schedule blocks on the same day
insert into thyp_schedules(schedule_code,person_serial,schedule_kind,effective_from)
values ('SCH-TEST-1','THY-P-9001','WORK_SHIFT','1487-06-21');
insert into thyp_schedule_blocks(schedule_code,day_of_week,start_time,end_time,activity_code)
values ('SCH-TEST-1',1,'08:00','10:00','WORK');
insert into thyp_schedule_blocks(schedule_code,day_of_week,start_time,end_time,activity_code)
values ('SCH-TEST-1',1,'09:30','11:00','WORK');

\echo == EXPECT REJECT: crowd cohort that is all one population group
insert into thyp_crowd_cohorts(cohort_code,place_code,from_world_date,seed,target_count,population_mix,occupation_mix)
values ('COH-BAD-1','PL-COURTYARD','1487-06-21','SEED-BAD-0001',10,
  '[{"group_code":"POP-BAND-1","share_bp":10000}]'::jsonb,
  '[{"occupation_code":"OCC-CLEANER","share_bp":10000}]'::jsonb);

\echo == EXPECT REJECT: crowd cohort with one group above 85 percent
insert into thyp_crowd_cohorts(cohort_code,place_code,from_world_date,seed,target_count,population_mix,occupation_mix)
values ('COH-BAD-2','PL-COURTYARD','1487-06-21','SEED-BAD-0002',10,
  '[{"group_code":"POP-BAND-6","share_bp":9000},{"group_code":"POP-BAND-1","share_bp":1000}]'::jsonb,
  '[{"occupation_code":"OCC-CLEANER","share_bp":10000}]'::jsonb);

\echo == EXPECT ACCEPT: crowd cohort with a real mix
insert into thyp_crowd_cohorts(cohort_code,place_code,settlement_place_code,from_world_date,seed,target_count,population_mix,occupation_mix,age_low,age_high)
values ('COH-TEST-OK','PL-MARKET','PL-SETTLEMENT','1487-06-21','SEED-TEST-OK-001',6,
  '[{"group_code":"POP-BAND-2","share_bp":5000},{"group_code":"POP-BAND-5","share_bp":5000}]'::jsonb,
  '[{"occupation_code":"OCC-MERCHANT","share_bp":10000}]'::jsonb,20,50);

\echo == EXPECT REJECT: crowd cohort naming an unregistered population group
insert into thyp_crowd_cohorts(cohort_code,place_code,from_world_date,seed,target_count,population_mix,occupation_mix)
values ('COH-BAD-3','PL-COURTYARD','1487-06-21','SEED-BAD-0003',4,
  '[{"group_code":"POP-NOT-REGISTERED","share_bp":5000},{"group_code":"POP-BAND-1","share_bp":5000}]'::jsonb,
  '[{"occupation_code":"OCC-CLEANER","share_bp":10000}]'::jsonb);
select thyp_crowd_generate('COH-BAD-3');

\echo == EXPECT REJECT: snapshot claiming a body lock the person does not carry
insert into studio_scene_character_snapshots(scene_code,person_serial,role_in_scene,location_reason,
  body_lock_hash,time_state_world_date,time_state_world_time,age_years_at_scene,continuity_ref)
values ('SC-COURTYARD-0001','THY-P-0009','Steward','WORK_POST',
  repeat('a',64),'1487-06-21','10:00',47,'THY-WORLD-CONTINUITY-FLOOR-001');

\echo == EXPECT REJECT: snapshot with a short body lock hash (P_visible BODY_LOCK factor)
insert into studio_scene_character_snapshots(scene_code,person_serial,role_in_scene,location_reason,
  body_lock_hash,time_state_world_date,time_state_world_time,age_years_at_scene,continuity_ref)
values ('SC-COURTYARD-0001','THY-P-0009','Steward','WORK_POST',
  'tooshort','1487-06-21','10:00',47,'THY-WORLD-CONTINUITY-FLOOR-001');

\echo == EXPECT REJECT: snapshot with no continuity reference (P_visible CONTINUITY factor)
insert into studio_scene_character_snapshots(scene_code,person_serial,role_in_scene,location_reason,
  body_lock_hash,time_state_world_date,time_state_world_time,age_years_at_scene,continuity_ref)
select 'SC-COURTYARD-0001','THY-P-0014','Guard','WORK_POST',b.body_lock_hash,'1487-06-21','10:00',
  (select age_years from studio_world_characters where person_serial='THY-P-0014'),''
from thyp_body_lock b where b.person_serial='THY-P-0014';

\echo == EXPECT REJECT: snapshot dated to a different day than its scene
insert into studio_scene_character_snapshots(scene_code,person_serial,role_in_scene,location_reason,
  body_lock_hash,time_state_world_date,time_state_world_time,age_years_at_scene,continuity_ref)
select 'SC-COURTYARD-0001','THY-P-0015','Guard','WORK_POST',b.body_lock_hash,'1490-01-01','10:00',
  (select age_years from studio_world_characters where person_serial='THY-P-0015'),'THY-WORLD-CONTINUITY-FLOOR-001'
from thyp_body_lock b where b.person_serial='THY-P-0015';

-- Give the append-only checks something to attempt to tamper with.
insert into studio_character_state_ledger(person_serial,change_kind,world_time_from,world_time_to,state_before,state_after,written_by)
values ('THY-P-0009','EVENT','1487-06-21','1487-06-21','{"a":1}'::jsonb,'{"a":2}'::jsonb,'BEHAVIOUR_FIXTURE');

\echo == EXPECT REJECT: ledger row updated
update studio_character_state_ledger set written_by = 'TAMPER' where true;

\echo == EXPECT REJECT: ledger row deleted
delete from studio_character_state_ledger where true;

\echo == EXPECT REJECT: portrait provenance updated
update thyp_portrait_provenance set note = 'TAMPER' where true;

\echo == EXPECT REJECT: generic portrait with no subject
insert into thyp_portraits(portrait_serial,portrait_code,title,subject_age_years,subject_world_date,
  subject_body_lock_hash,hung_place_code,width_cm,height_cm,depth_cm,medium,support_material,frame_material,
  commissioned_by_person_serial,commissioned_world_date,artist_name_ref)
values ('THY-PT-9001','PT-BAD-1','A royal portrait',30,'1487-06-21',repeat('b',64),
  'PL-GREAT-HALL',60,80,5,'OIL','Oak panel','Oak','THY-P-0001','1487-01-01','Anon');

\echo == EXPECT REJECT: portrait claiming a body the subject never held
insert into thyp_portraits(portrait_serial,portrait_code,title,subject_person_serial,subject_age_years,
  subject_world_date,subject_body_lock_hash,hung_place_code,width_cm,height_cm,depth_cm,medium,
  support_material,frame_material,commissioned_by_person_serial,commissioned_world_date,artist_name_ref)
values ('THY-PT-9002','PT-BAD-2','Steward',
  'THY-P-0009',(select age_years from studio_world_characters where person_serial='THY-P-0009'),
  '1487-06-21',repeat('c',64),'PL-GREAT-HALL',60,80,5,'OIL','Oak panel','Oak',
  'THY-P-0001','1487-01-01','Anon');

\echo == EXPECT REJECT: portrait whose claimed age is not the subject age at that date
insert into thyp_portraits(portrait_serial,portrait_code,title,subject_person_serial,subject_age_years,
  subject_world_date,subject_body_lock_hash,hung_place_code,width_cm,height_cm,depth_cm,medium,
  support_material,frame_material,commissioned_by_person_serial,commissioned_world_date,artist_name_ref)
select 'THY-PT-9003','PT-BAD-3','Steward','THY-P-0009',99,'1487-06-21',b.body_lock_hash,
  'PL-GREAT-HALL',60,80,5,'OIL','Oak panel','Oak','THY-P-0001','1487-01-01','Anon'
from thyp_body_lock b where b.person_serial='THY-P-0009';

\echo == EXPECT REJECT: portrait version 2 that replaces nothing
insert into thyp_portraits(portrait_serial,portrait_code,title,subject_person_serial,subject_age_years,
  subject_world_date,subject_body_lock_hash,hung_place_code,width_cm,height_cm,depth_cm,medium,
  support_material,frame_material,version_no,commissioned_by_person_serial,commissioned_world_date,artist_name_ref)
select 'THY-PT-9004','PT-BAD-4','Steward again','THY-P-0009',
  (select age_years from studio_world_characters where person_serial='THY-P-0009'),
  '1487-06-21',b.body_lock_hash,'PL-GREAT-HALL',60,80,5,'OIL','Oak panel','Oak',2,
  'THY-P-0001','1487-01-01','Anon'
from thyp_body_lock b where b.person_serial='THY-P-0009';

\echo == EXPECT REJECT: knowledge learned before the person was born
insert into thyp_knowledge_items(knowledge_code,title,knowledge_kind) values ('KN-TEST','Test fact','FACT');
insert into thyp_person_knowledge(person_serial,knowledge_code,learned_world_date,source)
values ('THY-P-0008','KN-TEST','1400-01-01','TOLD');

\echo == EXPECT REJECT: told memory that names no source
insert into thyp_memory_ledger(person_serial,memory_code,world_date,summary,source)
values ('THY-P-0009','MEM-BAD-1','1487-06-20','Heard something in the hall','TOLD');

\echo == EXPECT REJECT: firsthand memory of a scene the person was never in
insert into thyp_memory_ledger(person_serial,memory_code,world_date,scene_code,summary,source)
values ('THY-P-0004','MEM-BAD-2','1487-06-21','SC-COURTYARD-0001','Stood in the courtyard','FIRSTHAND');

\echo == EXPECT ACCEPT: firsthand memory of a scene the person was cleared into
insert into thyp_memory_ledger(person_serial,memory_code,world_date,scene_code,summary,source)
values ('THY-P-0009','MEM-OK-1','1487-06-21','SC-COURTYARD-0001','Crossed the courtyard at ten','FIRSTHAND');

\echo == EXPECT REJECT: parent born after their child
insert into thyp_relationships(person_a_serial,person_b_serial,relation_kind)
values ('THY-P-0008','THY-P-0002','PARENT_OF');

\echo == EXPECT REJECT: person state moved backward in world time
update studio_world_characters set as_of_world_date = '1480-01-01' where person_serial = 'THY-P-0009';

\echo == EXPECT REJECT: crowd row for a person who is not tier DETERMINISTIC_CROWD
insert into thyp_crowd_persons(person_serial,cohort_code,cohort_index,derivation_hash,group_code,age_years)
values ('THY-P-0009','COH-CASTLE-WORKS',9999,repeat('d',64),'POP-BAND-1',47);

\echo == EXPECT REJECT: learning level dropped with no recorded cause
update thyp_education_progress set level_ordinal = 0
 where person_serial = (select person_serial from thyp_education_progress limit 1);
insert into thyp_education_progress(person_serial,subject_code,level_code,level_ordinal,last_advanced_world_date)
values ('THY-P-0006','SUB-READING','STEADY',4,'1487-06-01');
update thyp_education_progress set level_ordinal = 1
 where person_serial='THY-P-0006' and subject_code='SUB-READING';

\echo == EXPECT REJECT: simulated biology on a character portraying a real person with no consent
insert into thyp_earth_portrayal_links(world_person_serial,earth_subject_ref,earth_subject_is_minor)
values ('THY-P-9001','earth-adult-ref',false);
insert into thyp_bio_profile(person_serial,blood_type) values ('THY-P-9001','O+');

\echo == EXPECT REJECT: portrayal link to a real minor with no guardian consent
insert into thyp_earth_portrayal_links(world_person_serial,earth_subject_ref,earth_subject_is_minor)
values ('THY-P-9001','earth-minor-ref',true);

\echo == EXPECT REJECT: serial retired with no reason
insert into thylora_person_serial_registry(serial,serial_class,sequence_no,label,retired_at)
values ('THY-P-9002','PERSON_WORLD',9002,'test',now());

\echo == EXPECT BLOCKER NOT_YET_BORN: appearing in a scene before being born
insert into thyp_scenes(scene_code,scene_title,scene_kind,world_date,world_time,place_code,continuity_ref,scene_state)
values ('SC-TEST-PAST','Courtyard long before','WORK','1380-06-21','10:00','PL-COURTYARD','THY-WORLD-CONTINUITY-FLOOR-001','ACTIVE');
select thyp_clear_for_scene('SC-TEST-PAST','THY-P-0009','Steward')->'blockers' as blockers;

\echo == EXPECT BLOCKER BODY_LOCK_ABSENT_FOR_DATE: earlier scene, no lock sealed for that age
insert into thyp_scenes(scene_code,scene_title,scene_kind,world_date,world_time,place_code,continuity_ref,scene_state)
values ('SC-TEST-EARLY','Courtyard, steward as a boy','WORK','1450-06-21','10:00','PL-COURTYARD','THY-WORLD-CONTINUITY-FLOOR-001','ACTIVE');
select thyp_clear_for_scene('SC-TEST-EARLY','THY-P-0009','Steward')->'blockers'->0->>'code' as blocker;

\echo == EXPECT REJECT: snapshot placing a later body into an earlier scene
insert into studio_scene_character_snapshots(scene_code,person_serial,role_in_scene,location_reason,
  body_lock_hash,time_state_world_date,time_state_world_time,age_years_at_scene,continuity_ref)
select 'SC-TEST-EARLY','THY-P-0009','Steward','WORK_POST',b.body_lock_hash,'1450-06-21','10:00',10,
  'THY-WORLD-CONTINUITY-FLOOR-001'
from thyp_body_lock b where b.person_serial='THY-P-0009';

\echo == EXPECT REJECT: portrait showing a body the subject did not yet hold
insert into thyp_portraits(portrait_serial,portrait_code,title,subject_person_serial,subject_age_years,
  subject_world_date,subject_body_lock_hash,hung_place_code,width_cm,height_cm,depth_cm,medium,
  support_material,frame_material,commissioned_by_person_serial,commissioned_world_date,artist_name_ref)
select 'THY-PT-9005','PT-BAD-5','The steward as a boy','THY-P-0009',10,'1450-06-21',b.body_lock_hash,
  'PL-RECORD-ROOM',40,50,4,'CHARCOAL','Paper','Pine','THY-P-0001','1450-01-01','Anon'
from thyp_body_lock b where b.person_serial='THY-P-0009';

\echo == readback: gate factors for a cleared staff member
select jsonb_pretty(thyp_visible_gate('SC-COURTYARD-0001','THY-P-0009'));

\echo == readback: gate blockers for a royal family member (body lock not yet supplied)
select jsonb_pretty(thyp_visible_gate('SC-COURTYARD-0001','THY-P-0004'));

\echo == determinism: regenerating the cohort creates nobody new
select thyp_crowd_generate('COH-CASTLE-WORKS') as regenerated_count;

\echo == determinism: derivation hash for cohort index 0 is a pure function of the seed
select (derivation_hash = encode(digest('THY-SEED-CASTLE-WORKS-0001|COH-CASTLE-WORKS|0','sha256'),'hex'))
  as hash_reproducible from thyp_crowd_persons where cohort_code='COH-CASTLE-WORKS' and cohort_index=0;

\echo == population mix: bands present and largest share
select count(distinct group_code) as bands_present,
       max(pct) as largest_share_pct
from (select group_code, round(100.0*count(*)/sum(count(*)) over (),1) as pct
        from thyp_crowd_persons group by group_code) q;

\echo == no appearance column is reachable from any occupation table
select count(*) as appearance_columns_on_occupation_tables
  from information_schema.columns
 where table_schema='public'
   and table_name in ('thyp_occupations','thyp_person_occupation','thyp_work_history')
   and (column_name ilike '%skin%' or column_name ilike '%tone%' or column_name ilike '%group%'
        or column_name ilike '%race%' or column_name ilike '%ethnic%' or column_name ilike '%complexion%');

\echo == no random() anywhere in this lane
select count(*) as functions_calling_random
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
 where n.nspname='public' and p.proname like 'thyp\_%'
   and pg_get_functiondef(p.oid) ~* '\mrandom\s*\(';

\echo == state advance writes a ledger row and flags the body lock for review
select thyp_advance_person('THY-P-0009','1488-06-21')->>'age_to' as age_to,
       thyp_advance_person('THY-P-0009','1489-06-21')->>'body_lock_review_due' as review_due;
select count(*) as ledger_rows_for_steward
  from studio_character_state_ledger where person_serial='THY-P-0009';

\echo == RLS coverage
select count(*) as rls_disabled_tables
  from pg_class c join pg_namespace n on n.oid=c.relnamespace
 where n.nspname='public' and c.relkind='r' and not c.relrowsecurity;
