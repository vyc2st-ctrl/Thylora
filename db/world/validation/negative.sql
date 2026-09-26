-- Each statement marked REJECT must fail; the others are setup rows that must succeed.
-- Run only against a throwaway local database (see run.sh). Never against thylora-dash.
\set ON_ERROR_STOP 0
insert into thy_world_events(tick_seed,rule,event_type,person_or_group_id,earth_at,causes,probability,roll,occurred) values (1,'r','X','p',now(),'[]',0.5,0.1,true);
insert into thy_atlas_places(place_id,level) values ('D1','DISTRICT');
insert into thy_atlas_state(entity_kind,entity_ref,place_id,earth_from,state,mode) values ('PERSON','p','D1',now(),'{}','HAPPENED');
insert into thy_twiw_sessions values ('S1','nahla-mercer','u',now(),'America/New_York',null,true,null,null);
insert into thy_twiw_markers(marker_id,session_id,seq,t,object,action,raw_ref,source,uncertain,prev_hash,hash) values ('BT-1','S1',1,now(),'w','PLACE','R1','BACKGROUND',true,'GENESIS','h1');
insert into thy_twiw_markers(marker_id,session_id,seq,t,object,action,location,raw_ref,source,uncertain,prev_hash,hash) values ('BT-2','S1',1,now(),'w','PLACE','drawer','R1','OPERATOR_SPEECH',false,'GENESIS','h2');
update thy_twiw_markers set location='x' where marker_id='BT-2';
insert into thy_media_intake_batches values ('B1','Chairman','chat',10,null,now());
insert into thy_media_intake_items(batch_id,item_no,custody_state) values ('B1',1,'BYTES_HASHED');
insert into thy_person_resolution_state values ('p','PERSISTENT','FOCUS',5,null,'r',now());
update thy_person_resolution_state set history_len=3;
insert into thy_person_spine_questions(question_id,canonical_entity_id,seed_id,trait,dimension,question,answer) values ('q','p','S1','X','TIME','?','{"a":1}');
