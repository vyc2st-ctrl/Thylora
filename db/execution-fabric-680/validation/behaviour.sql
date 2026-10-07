\set ON_ERROR_STOP 0
\echo == must PASS: captured item
insert into thylora_execution_work_registry(work_code,work_item,fabric_state,executor_class,captured_at) values ('T1','t','CAPTURED','NONE',now());
\echo == must FAIL: world personnel assigned as executor
insert into thylora_execution_work_registry(work_code,work_item,fabric_state,executor_class,executor_id,assigned_at) values ('T2','t','ASSIGNED','SIMULATED_WORLD','world-worker',now());
\echo == must FAIL: EXECUTING without heartbeat
insert into thylora_execution_work_registry(work_code,work_item,fabric_state,executor_class,executor_id,assigned_at,started_at) values ('T3','t','EXECUTING','SOFTWARE_AGENT_SESSION','claude-680',now(),now());
\echo == must PASS: EXECUTING with fresh heartbeat
insert into thylora_execution_work_registry(work_code,work_item,fabric_state,executor_class,executor_id,assigned_at,started_at,heartbeat_at,heartbeat_ttl_seconds) values ('T4','t','EXECUTING','SOFTWARE_AGENT_SESSION','claude-680',now(),now(),now()-interval '2 hours',3600);
\echo == must FAIL: EVIDENCED without artifact
update thylora_execution_work_registry set fabric_state='EVIDENCED',finished_at=now() where work_code='T4';
\echo == must FAIL: self-verification
insert into thylora_execution_work_registry(work_code,work_item,fabric_state,executor_class,executor_id,assigned_at,finished_at,artifact_ref,verifier_id,verified_at,readback_ref) values ('T5','t','VERIFIED','SOFTWARE_AGENT_SESSION','claude-680',now(),now(),'repo:x','claude-680',now(),'rb');
\echo == must PASS: independent verification
insert into thylora_execution_work_registry(work_code,work_item,fabric_state,executor_class,executor_id,assigned_at,finished_at,artifact_ref,artifact_sha256,verifier_id,verified_at,readback_ref) values ('T6','t','VERIFIED','SOFTWARE_AGENT_SESSION','claude-680',now(),now(),'repo:x',repeat('a',64),'chatgpt-thread',now(),'rb');
\echo == must FAIL: BLOCKED reported as untyped layer
insert into thylora_execution_work_registry(work_code,work_item,fabric_state,blocker_layer,blocker_reason) values ('T7','t','BLOCKED','BACKEND_DOWN','?');
\echo == stale heartbeat sweep (expect 1)
select thylora_fabric_block_stale_heartbeats() as swept;
select work_code, fabric_state, blocker_layer from thylora_execution_work_registry where work_code='T4';
\echo == truth view: legacy ACTIVE label overstated
select work_code, label_state, proven_state, label_overstates from thylora_execution_truth_v1 order by work_code;
