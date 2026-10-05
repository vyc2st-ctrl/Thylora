-- Run AFTER 0663 in the same transaction. Ends with RAISE so everything rolls back.
do $$
declare o text := ''; procedure_name text;
  base_ok text := $q$insert into thylora_work_movement_ledger(work_item,source_thread,custodian,from_state,to_state,action_taken,preverify_pass,next_action,next_check_at,freshness_checked_at,freshness_evidence,received_at,evidence)
    values('TEST-663','t','claude','QUEUED','ACTIVE','read heads; ran tests',true,'write migration',now()+interval '1h',now(),'{"heads":"664/661"}',now()-interval '5 min','{"tests":15}')$q$;
  r record;
begin
  for r in select * from (values
   ('T1 ACTIVE no preverify','REJECT', $q$insert into thylora_work_movement_ledger(work_item,source_thread,custodian,from_state,to_state,action_taken) values('TEST-663','t','c','QUEUED','ACTIVE','x')$q$),
   ('T3 ACTIVE empty action + null received','REJECT', $q$insert into thylora_work_movement_ledger(work_item,source_thread,custodian,from_state,to_state,action_taken,preverify_pass,next_action,next_check_at,freshness_checked_at,freshness_evidence) values('TEST-663','t','c','QUEUED','ACTIVE','',true,'n',now()+interval '1h',now(),'{"a":1}')$q$),
   ('T4 COMPLETE no V','REJECT', $q$insert into thylora_work_movement_ledger(work_item,source_thread,custodian,from_state,to_state,action_taken,preverify_pass) values('TEST-663','t','c','ACTIVE','COMPLETE','x',true)$q$),
   ('T5 COMPLETE self-verified + [] evidence','REJECT', $q$insert into thylora_work_movement_ledger(work_item,source_thread,custodian,from_state,to_state,action_taken,preverify_pass,verification_pass,verifier,evidence,readback,completed_at) values('TEST-663','t','c','ACTIVE','COMPLETE','x',true,true,'c','[]','[]',now())$q$),
   ('T6 COMPLETE future completed_at','REJECT', $q$insert into thylora_work_movement_ledger(work_item,source_thread,custodian,from_state,to_state,action_taken,preverify_pass,verification_pass,verifier,evidence,readback,completed_at) values('TEST-663','t','c','ACTIVE','COMPLETE','x',true,true,'v','{"e":1}','{"r":1}',now()+interval '30 days')$q$),
   ('T7 to_state=done','REJECT', $q$insert into thylora_work_movement_ledger(work_item,source_thread,custodian,from_state,to_state,action_taken) values('TEST-663','t','c','QUEUED','done','x')$q$),
   ('T8 to_state=LIVE','REJECT', $q$insert into thylora_work_movement_ledger(work_item,source_thread,custodian,from_state,to_state,action_taken) values('TEST-663','t','c','QUEUED','LIVE','x')$q$),
   ('T9 to_state=UNVERIFIED downgrade','ACCEPT', $q$insert into thylora_work_movement_ledger(work_item,source_thread,custodian,from_state,to_state,action_taken) values('TEST-663','t','c','ACTIVE','UNVERIFIED','claim withdrawn')$q$),
   ('T10 BLOCKED no blocker','REJECT', $q$insert into thylora_work_movement_ledger(work_item,source_thread,custodian,from_state,to_state,action_taken) values('TEST-663','t','c','ACTIVE','BLOCKED','x')$q$),
   ('T10b BLOCKED with blocker+next','ACCEPT', $q$insert into thylora_work_movement_ledger(work_item,source_thread,custodian,from_state,to_state,action_taken,blocker,next_action) values('TEST-663','t','c','ACTIVE','BLOCKED','x','MISSING INPUT: reference photos','Chairman supplies photos')$q$),
   ('T11 handoff no evidence','REJECT', $q$insert into thylora_work_movement_ledger(work_item,source_thread,custodian,from_state,to_state,action_taken,next_custodian,handed_off_at) values('TEST-663','t','c','ACTIVE','HANDED_OFF','x','d',now())$q$),
   ('T11b handoff complete','ACCEPT', $q$insert into thylora_work_movement_ledger(work_item,source_thread,custodian,from_state,to_state,action_taken,next_custodian,handed_off_at,evidence,next_action) values('TEST-663','t','claude','ACTIVE','HANDED_OFF','x','chatgpt',now(),'{"file":"0663"}','verify 0663')$q$),
   ('T12 reply PASS defaults','REJECT', $q$insert into thylora_reply_verification_receipts(source_app,custody_head,ledger_head,verification_pass) values('TEST-663',664,664,true)$q$),
   ('T13 reply PASS stale 100/100','REJECT', $q$insert into thylora_reply_verification_receipts(source_app,custody_head,ledger_head,verification_pass,claims_checked,evidence_refs,hallucination_risk) values('TEST-663',100,100,true,'["c"]','["e"]','LOW')$q$),
   ('T14 reply PASS mismatch','REJECT', $q$insert into thylora_reply_verification_receipts(source_app,custody_head,ledger_head,verification_pass,claims_checked,evidence_refs,hallucination_risk) values('TEST-663',664,661,true,'["c"]','["e"]','LOW')$q$),
   ('T16 valid ACTIVE','ACCEPT', base_ok),
   ('T17 valid COMPLETE independent','ACCEPT', $q$insert into thylora_work_movement_ledger(work_item,source_thread,custodian,from_state,to_state,action_taken,preverify_pass,verification_pass,verifier,evidence,readback,completed_at,started_at) values('TEST-663','t','claude','ACTIVE','COMPLETE','x',true,true,'chatgpt','{"e":1}','{"r":1}',now(),now()-interval '1 min')$q$),
   ('T15 DELETE movement rows','REJECT', $q$delete from thylora_work_movement_ledger where true$q$),
   ('T15b UPDATE movement row','REJECT', $q$update thylora_work_movement_ledger set action_taken='rewritten' where true$q$),
   ('B1 registry -> ACTIVE without ledger row','REJECT', $q$update thylora_execution_work_registry set state='ACTIVE' where work_code=(select work_code from thylora_execution_work_registry where state='QUEUED' limit 1)$q$),
   ('B2 registry -> VERIFICATION_ACTIVE without ledger','REJECT', $q$update thylora_execution_work_registry set state='VERIFICATION_ACTIVE' where work_code=(select work_code from thylora_execution_work_registry where state='QUEUED' limit 1)$q$),
   ('B3 registry unrelated edit on IMPLEMENTATION_ACTIVE row','ACCEPT', $q$update thylora_execution_work_registry set next_action=coalesce(next_action,'') where work_code=(select work_code from thylora_execution_work_registry where state='IMPLEMENTATION_ACTIVE' limit 1)$q$),
   ('B4 registry -> BLOCKED_EXTERNAL (not gated)','ACCEPT', $q$update thylora_execution_work_registry set state='BLOCKED_EXTERNAL' where work_code=(select work_code from thylora_execution_work_registry where state='QUEUED' limit 1)$q$),
   ('B5 attention queue -> DONE without ledger','REJECT', $q$update thylora_chairman_attention_queue set state='DONE' where code=(select code from thylora_chairman_attention_queue where state is distinct from 'DONE' limit 1)$q$)
  ) v(name, expect, sql) loop
    begin
      execute r.sql;
      o := o || E'\n' || case when r.expect='ACCEPT' then 'PASS ' else 'FAIL ' end || r.name || ' => ACCEPTED';
      raise exception 'SUB_ROLLBACK';
    exception when others then
      if sqlerrm <> 'SUB_ROLLBACK' then
        o := o || E'\n' || case when r.expect='REJECT' then 'PASS ' else 'FAIL ' end || r.name || ' => ' || left(sqlerrm,110);
      end if;
    end;
  end loop;
  -- ledger guard untouched
  o := o || E'\nL1 thy_sequence_ledger insert grant to authenticated = ' || has_table_privilege('authenticated','public.thy_sequence_ledger','INSERT')::text;
  raise exception 'RESULTS_ROLLED_BACK:%', o;
end $$;
