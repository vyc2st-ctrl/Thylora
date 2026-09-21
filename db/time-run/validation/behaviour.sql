-- TIME RUN · behaviour validation
-- Workroom: WR-TIMERUN-581
--
-- Every block below is an EXPECT REJECT case. The database, not a comment, must
-- refuse it. A clean run prints one REJECTED line per case and ACCEPTED for the
-- three cases that are supposed to succeed.

\set ON_ERROR_STOP 0
\set QUIET 1

create or replace function expect_reject(label text, stmt text) returns void as $$
begin
  execute stmt;
  raise exception 'NOT REJECTED: %', label;
exception
  when raise_exception then
    if sqlerrm like 'NOT REJECTED%' then raise; end if;
    raise notice 'REJECTED  %  (%)', label, left(sqlerrm, 80);
  when others then
    raise notice 'REJECTED  %  (%)', label, left(sqlerrm, 80);
end;
$$ language plpgsql;

-- Seed the minimum real records the reject cases need.
insert into trun_places (place_id, kind, site_ground, orientation, approach, water_relation, footprint_origin)
values ('THY-PLACE-CASTLE-001','CASTLE','Raised stone shelf above the approach','Principal face toward the water approach',
        'Single ascending road from the low ground','Overlooks the water approach; does not stand in it','Original keep footprint, never relocated')
on conflict do nothing;

insert into trun_place_strata (stratum_id, place_id, era_id, capability_ceiling)
values ('THY-PLACE-CASTLE-001/ERA_1700S','THY-PLACE-CASTLE-001','ERA_1700S',30)
on conflict do nothing;

insert into trun_persons (person_id, name, native_era) values
  ('THY-PER-VYCTOR-EBENEZER','Vyctor Ebenezer','ERA_CURRENT'),
  ('THY-PER-INES-MORALES','Inés Morales','ERA_1700S')
on conflict do nothing;

insert into trun_traversals (traversal_id, serial, traveler_id, origin_era, destination_era,
                             arrival_place, arrival_stratum, era_band, exact_year)
values ('11111111-1111-1111-1111-111111111111','THY-ENC-0001','THY-PER-VYCTOR-EBENEZER','ERA_CURRENT','ERA_1700S',
        'THY-PLACE-CASTLE-001','THY-PLACE-CASTLE-001/ERA_1700S','UNSEALED_1700S','UNSEALED')
on conflict do nothing;

-- ---------------------------------------------------------------- LIVING ERA
select expect_reject('TR-L1 era cannot be non-living',
  $q$insert into trun_eras (era_id,label,band,living,capability_ceiling,domain_ceiling)
     values ('ERA_TEST','t','t',false,10,'{"POWER":1,"TRANSPORT":1,"COMMUNICATION":1,"COMPUTATION":1,"MEDICINE":1,"MATERIALS":1,"RECORDING":1}'::jsonb)$q$);

select expect_reject('TR-L6 stratum occupants cannot be non-living',
  $q$insert into trun_place_strata (stratum_id,place_id,era_id,capability_ceiling,people_state)
     values ('X/ERA_1922','THY-PLACE-CASTLE-001','ERA_1922',55,'SCENERY')$q$);

-- ------------------------------------------------------------------- NAMING
select expect_reject('prohibited castle name refused',
  $q$insert into trun_places (place_id,kind,native_name,native_name_state,site_ground,orientation,approach,water_relation,footprint_origin)
     values ('P-BAD','CASTLE','Peete Castle','SEALED','a','b','c','d','e')$q$);

select expect_reject('name candidate without derivation refused',
  $q$insert into trun_place_name_candidates (candidate_id,place_id,name,native_land,language,history,morphemes,reading)
     values ('NAME-X','THY-PLACE-CASTLE-001','Somename','EdereAriah','native tongue','because','[{"form":"x","gloss":"y"}]'::jsonb,'r')$q$);

select expect_reject('sealed place without a name refused',
  $q$insert into trun_places (place_id,kind,native_name_state,site_ground,orientation,approach,water_relation,footprint_origin)
     values ('P-EMPTY','CASTLE','SEALED','a','b','c','d','e')$q$);

-- ------------------------------------------------------------ PHYSICAL ENTRY
select expect_reject('TR-L2 no viewer presence',
  $q$insert into trun_traversals (serial,traveler_id,origin_era,destination_era,era_band,presence)
     values ('T-VIEW','THY-PER-VYCTOR-EBENEZER','ERA_CURRENT','ERA_1700S','UNSEALED_1700S','VIEWER')$q$);

select expect_reject('TR-L4 memory cannot be stripped',
  $q$insert into trun_traversals (serial,traveler_id,origin_era,destination_era,era_band,memory_retained)
     values ('T-NOMEM','THY-PER-VYCTOR-EBENEZER','ERA_CURRENT','ERA_1700S','UNSEALED_1700S',false)$q$);

-- ------------------------------------------------------------ CAPABILITY LEAK
select expect_reject('TR-L5 later-era device cannot function in an earlier era',
  $q$insert into trun_carried_objects (traversal_id,object_id,label,domain,declared_tier,destination_ceiling,arrival_state,functioning_tier,reason)
     values ('11111111-1111-1111-1111-111111111111','OBJ-LEAK','handset','COMPUTATION',80,12,'DEGRADED_TO_ERA',80,'leak')$q$);

select expect_reject('TR-L5 an over-ceiling object cannot be NATIVE',
  $q$insert into trun_carried_objects (traversal_id,object_id,label,domain,declared_tier,destination_ceiling,arrival_state,functioning_tier,reason)
     values ('11111111-1111-1111-1111-111111111111','OBJ-NAT','handset','COMPUTATION',80,12,'NATIVE',12,'wrong')$q$);

select expect_reject('INERT must actually be inert',
  $q$insert into trun_carried_objects (traversal_id,object_id,label,domain,declared_tier,destination_ceiling,arrival_state,functioning_tier,reason)
     values ('11111111-1111-1111-1111-111111111111','OBJ-HALF','handset','COMPUTATION',80,12,'INERT',5,'wrong')$q$);

select expect_reject('a transformation record cannot claim NATIVE',
  $q$insert into trun_capability_transformations (traversal_id,object_id,from_tier,to_state,to_functioning,reason)
     values ('11111111-1111-1111-1111-111111111111','OBJ-001',80,'NATIVE',80,'wrong')$q$);

-- ------------------------------------------------------------- KNOWLEDGE LEAK
select expect_reject('knowledge cannot be marked buildable above the era ceiling',
  $q$insert into trun_information_shared (disclosure_id,traversal_id,subject,form,domain,required_tier,era_ceiling,instantiable_in_era,era_impact,model)
     values ('DISC-LEAK','11111111-1111-1111-1111-111111111111','how to build it','SPOKEN','COMPUTATION',80,12,true,'ACTIONABLE_IN_ERA','IT_A_SPEECH_ONLY')$q$);

-- -------------------------------------------------------------- PERSON AGENCY
select expect_reject('TR-L6 a person met always keeps the right to decline',
  $q$insert into trun_people_met (traversal_id,person_id,may_decline)
     values ('11111111-1111-1111-1111-111111111111','THY-PER-INES-MORALES',false)$q$);

-- ----------------------------------------------------------------- CAUSALITY
select expect_reject('a record cannot be FULFILLED before the departure exists',
  $q$insert into trun_historical_record (traversal_id,model_code,record_state)
     values ('11111111-1111-1111-1111-111111111111','CA_A_VISITS_BECOME_HISTORY','FULFILLED')$q$);

select expect_reject('a branch cannot open under a non-branching model',
  $q$insert into trun_historical_record (traversal_id,model_code,branch_opened)
     values ('11111111-1111-1111-1111-111111111111','CA_C_LEDGERED_CAUSALITY',true)$q$);

select expect_reject('a causality model cannot be selected without naming who decided',
  $q$update trun_causality_models set selected = true where model_code = 'CA_A_VISITS_BECOME_HISTORY'$q$);

select expect_reject('a mechanic cannot be SELECTED without a selection and a decider',
  $q$update trun_open_mechanics set state = 'SELECTED' where mechanic_id = 'CAUSALITY'$q$);

-- ------------------------------------------------------------- EXPECT ACCEPT
do $$ begin
  insert into trun_carried_objects (traversal_id,object_id,label,domain,declared_tier,destination_ceiling,arrival_state,functioning_tier,reason)
  values ('11111111-1111-1111-1111-111111111111','OBJ-001','Personal handset','COMPUTATION',80,12,'INERT',0,'Above the 1700s COMPUTATION ceiling.');
  raise notice 'ACCEPTED  an over-ceiling object recorded INERT';
end $$;

do $$ begin
  insert into trun_carried_objects (traversal_id,object_id,label,domain,declared_tier,destination_ceiling,arrival_state,functioning_tier,reason)
  values ('11111111-1111-1111-1111-111111111111','OBJ-003','Written note, ink on paper','RECORDING',18,26,'NATIVE',18,'Within the envelope.');
  raise notice 'ACCEPTED  an era-available object arriving NATIVE';
end $$;

do $$ begin
  insert into trun_historical_record (traversal_id,model_code,record_state)
  values ('11111111-1111-1111-1111-111111111111','CA_A_VISITS_BECOME_HISTORY','PENDING_FULFILLMENT');
  raise notice 'ACCEPTED  the encounter held PENDING_FULFILLMENT';
end $$;

-- ------------------------------------------------------------------- SUMMARY
\set QUIET 0
select count(*) as trun_tables from pg_tables where tablename like 'trun_%';
select count(*) as check_constraints from pg_constraint c join pg_class t on t.oid = c.conrelid
  where t.relname like 'trun_%' and c.contype = 'c';
select count(*) filter (where selected) as selected_causality_models from trun_causality_models;
select count(*) as open_mechanics from trun_open_mechanics where state = 'OPEN';
