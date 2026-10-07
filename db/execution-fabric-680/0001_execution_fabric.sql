-- WR-EXEC-FABRIC-680 · Execution Fabric.
-- HELD: production DDL is a Chairman action. Validated locally only (validation/run.sh).
-- Implements PROPOSED MATH-EXECUTION-FABRIC-680:
--   X_state = f(executor_class, started_at, heartbeat_age, artifact, verifier)
--   EXECUTING iff class in (SOFTWARE_AGENT_SESSION, SOFTWARE_AGENT_AUTONOMOUS, HUMAN_EARTH)
--             and started and heartbeat_age <= TTL
--   EVIDENCED iff artifact_ref and (artifact_sha256 or system id)
--   VERIFIED  iff EVIDENCED and verifier <> executor and readback recorded
-- Additive only: new nullable columns on thylora_execution_work_registry. The existing
-- `state` label is untouched, so nothing already written changes meaning.
-- SIMULATED_WORLD (EdereAirah personnel) can never hold EXECUTING, EVIDENCED or VERIFIED.

alter table thylora_execution_work_registry
  add column if not exists fabric_state          text,
  add column if not exists executor_class        text,
  add column if not exists executor_id           text,
  add column if not exists captured_at           timestamptz,
  add column if not exists assigned_at           timestamptz,
  add column if not exists started_at            timestamptz,
  add column if not exists heartbeat_at          timestamptz,
  add column if not exists heartbeat_ttl_seconds integer,
  add column if not exists finished_at           timestamptz,
  add column if not exists artifact_ref          text,
  add column if not exists artifact_sha256       text,
  add column if not exists verifier_id           text,
  add column if not exists verified_at           timestamptz,
  add column if not exists readback_ref          text,
  add column if not exists blocker_layer         text,
  add column if not exists blocker_reason        text,
  add column if not exists retry_policy          jsonb,
  add column if not exists attempts              integer not null default 0;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'fabric_state_values') then
    alter table thylora_execution_work_registry add constraint fabric_state_values check (
      fabric_state is null or fabric_state in ('CAPTURED','ASSIGNED','EXECUTING','EVIDENCED','VERIFIED','BLOCKED'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'fabric_executor_values') then
    alter table thylora_execution_work_registry add constraint fabric_executor_values check (
      executor_class is null or executor_class in
      ('SOFTWARE_AGENT_SESSION','SOFTWARE_AGENT_AUTONOMOUS','HUMAN_EARTH','SIMULATED_WORLD','NONE'));
  end if;
  -- ASSIGNED and beyond need a named executor of a real class
  if not exists (select 1 from pg_constraint where conname = 'fabric_assigned_rule') then
    alter table thylora_execution_work_registry add constraint fabric_assigned_rule check (
      fabric_state is null or fabric_state in ('CAPTURED','BLOCKED')
      or (executor_id is not null and assigned_at is not null
          and executor_class in ('SOFTWARE_AGENT_SESSION','SOFTWARE_AGENT_AUTONOMOUS','HUMAN_EARTH')));
  end if;
  -- EXECUTING: a run started and a heartbeat exists
  if not exists (select 1 from pg_constraint where conname = 'fabric_executing_rule') then
    alter table thylora_execution_work_registry add constraint fabric_executing_rule check (
      fabric_state is distinct from 'EXECUTING'
      or (started_at is not null and heartbeat_at is not null and heartbeat_ttl_seconds > 0));
  end if;
  -- EVIDENCED / VERIFIED: an artifact someone else can open
  if not exists (select 1 from pg_constraint where conname = 'fabric_evidenced_rule') then
    alter table thylora_execution_work_registry add constraint fabric_evidenced_rule check (
      fabric_state is null or fabric_state not in ('EVIDENCED','VERIFIED')
      or (artifact_ref is not null and finished_at is not null
          and (artifact_sha256 is null or artifact_sha256 ~ '^[0-9a-f]{64}$')));
  end if;
  -- VERIFIED: a different verifier read it back
  if not exists (select 1 from pg_constraint where conname = 'fabric_verified_rule') then
    alter table thylora_execution_work_registry add constraint fabric_verified_rule check (
      fabric_state is distinct from 'VERIFIED'
      or (verifier_id is not null and verifier_id <> executor_id
          and verified_at is not null and readback_ref is not null));
  end if;
  -- BLOCKED: typed layer + reason (THY-POLICY-BLOCKAGE-TAXONOMY-680)
  if not exists (select 1 from pg_constraint where conname = 'fabric_blocked_rule') then
    alter table thylora_execution_work_registry add constraint fabric_blocked_rule check (
      fabric_state is distinct from 'BLOCKED'
      or (blocker_reason is not null and blocker_layer in
          ('BACKEND_AVAILABILITY','CLIENT_TRANSPORT','REPOSITORY_SECRETS','QUERY_PERMISSION_SAFETY',
           'RLS','AUTHENTICATION','WORKER_RUNTIME','MODEL_PROVIDER','WORKER_LOGIC',
           'MISSING_INPUT','MISSING_AUTHORITY','LEGAL','RIGHTS','IDENTITY','ENGINEERING')));
  end if;
end $$;

-- A stale heartbeat turns EXECUTING into BLOCKED/WORKER_RUNTIME. Returns rows changed.
-- Intended for the existing standing-invariants cron (job 3), not a new job.
create or replace function thylora_fabric_block_stale_heartbeats() returns integer
language plpgsql as $$
declare n integer;
begin
  update thylora_execution_work_registry
     set fabric_state  = 'BLOCKED',
         blocker_layer = 'WORKER_RUNTIME',
         blocker_reason = 'STALE_HEARTBEAT: last heartbeat ' || heartbeat_at || ', ttl ' || heartbeat_ttl_seconds || 's',
         updated_at = now()
   where fabric_state = 'EXECUTING'
     and heartbeat_at < now() - make_interval(secs => heartbeat_ttl_seconds);
  get diagnostics n = row_count;
  return n;
end $$;

-- System-wide truth: what the label says vs what the fabric can prove.
create or replace view thylora_execution_truth_v1 as
select work_code,
       state                                   as label_state,
       fabric_state,
       executor_class,
       case
         when fabric_state is null                         then 'UNCLASSIFIED'
         when fabric_state = 'EXECUTING'
              and heartbeat_at < now() - make_interval(secs => heartbeat_ttl_seconds)
                                                           then 'STALE_EXECUTING'
         else fabric_state
       end                                     as proven_state,
       (state ilike '%ACTIVE%' and coalesce(fabric_state,'') not in ('EXECUTING','EVIDENCED','VERIFIED'))
                                               as label_overstates,
       extract(epoch from now() - heartbeat_at)::bigint as heartbeat_age_s,
       blocker_layer, blocker_reason, artifact_ref, verifier_id
from thylora_execution_work_registry;
