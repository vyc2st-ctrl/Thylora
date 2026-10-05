-- ============================================================================
-- 0663 · Movement boundary corrections (Claude verification of ChatGPT 658/660)
-- STATE: HELD CHAIRMAN ACTION. Validated against live thylora-dash inside a
--        rolled-back transaction (see db/enforcement/validation/0663_tests.sql).
--        NOT APPLIED. Do not apply without the Chairman's go.
--
-- Additive. Keeps ChatGPT's private.thylora_enforce_movement_660 and
-- private.thylora_enforce_reply_receipt_660 functions in place for history;
-- swaps only which function the two triggers call. Does NOT touch
-- thy_sequence_ledger (its chain + no_rewrite guards stay exactly as they are;
-- no new grants anywhere).
--
-- Closes, by live test on 2026-10-05:
--   T3  ACTIVE accepted with action_taken = '' and received_at NULL
--   T5  COMPLETE accepted self-verified (verifier = custodian), evidence [] readback []
--   T6  COMPLETE accepted with completed_at 30 days in the future
--   T7  to_state 'done' bypassed all checks (lowercase / synonym)
--   T8  to_state 'LIVE' bypassed all checks
--   T9  to_state 'UNVERIFIED' wrongly REJECTED (regex matched VERIFIED inside it)
--   T10 BLOCKED accepted with no blocker named
--   T11 handoff accepted with no evidence and no next_action
--   T12 reply receipt PASS accepted with default [] claims + 'UNASSESSED' risk
--   T13 reply receipt PASS accepted with stale heads 100/100
--   T15 DELETE of movement-ledger rows allowed (custody trail erasable)
--   +   execution registry: 98 rows in active-like states never checked
--       (constraint tests state = 'ACTIVE' only, and is NOT VALID)
-- ============================================================================

-- 1 · Helpers ---------------------------------------------------------------

-- A jsonb value counts as evidence only if it carries something.
create or replace function private.thy_jsonb_has_content(j jsonb)
returns boolean language sql immutable set search_path = '' as $$
  select j is not null
     and j not in ('{}'::jsonb, '[]'::jsonb, 'null'::jsonb, '""'::jsonb)
$$;

-- Classify a state word by its tokens, not by substring.
-- Returns NEGATED | BLOCKED | ACTIVE | COMPLETE | OTHER.
create or replace function private.thy_state_class(p_state text)
returns text language plpgsql immutable set search_path = '' as $$
declare
  s text := upper(coalesce(p_state, ''));
  toks text[] := regexp_split_to_array(s, '[^A-Z0-9]+');
begin
  if s = '' then return 'OTHER'; end if;
  -- A negation anywhere wins: UNVERIFIED, NOT_SENT, AWAITING_..., INACTIVE.
  if toks && array['NOT','NO','NON','INACTIVE','UNVERIFIED','UNPUBLISHED','UNPAID',
                   'UNSENT','UNDELIVERED','UNRELEASED','AWAITING','PENDING','PROPOSED',
                   'DRAFT','QUEUED','PREPARED','HELD','HOLD','SUPERSEDED','CANCELLED',
                   'CANCELED','REJECTED','OPEN']
    then return 'NEGATED'; end if;
  if toks && array['BLOCKED','WAITING','DEFERRED','UNKNOWN','STALLED','STUCK']
    then return 'BLOCKED'; end if;
  if toks && array['ACTIVE','EXECUTING','RUNNING','STARTED','WORKING','MOVING','DRAFTING']
     or s ~ '(^|[^A-Z])IN[^A-Z]*PROGRESS'
    then return 'ACTIVE'; end if;
  if toks && array['COMPLETE','COMPLETED','DONE','VERIFIED','PUBLISHED','SENT','DELIVERED',
                   'PAID','RELEASED','CANONICAL','EXECUTED','IMPLEMENTED','WITNESSED',
                   'FINISHED','SHIPPED','LIVE','APPROVED','ACCEPTED','CLOSED']
    then return 'COMPLETE'; end if;
  return 'OTHER';
end $$;

-- 2 · Movement ledger: one trigger, superset of 660 ------------------------

create or replace function private.thylora_enforce_movement_663()
returns trigger language plpgsql security invoker set search_path = '' as $$
declare
  c text;
begin
  if tg_op in ('UPDATE','DELETE') then
    raise exception 'THYLORA_LEDGER_APPEND_ONLY: movement rows are never edited or deleted; write a new row';
  end if;

  c := private.thy_state_class(new.to_state);

  if nullif(btrim(new.custodian),'') is null then
    raise exception 'THYLORA_MOVE_REJECTED: accountable custodian required';
  end if;
  if nullif(btrim(new.action_taken),'') is null then
    raise exception 'THYLORA_MOVE_REJECTED: action_taken must say what was actually done';
  end if;

  if c = 'ACTIVE' then
    if new.preverify_pass is not true then
      raise exception 'THYLORA_ACTIVE_REJECTED: E_k/preverify_pass must equal 1'; end if;
    if new.received_at is null then
      raise exception 'THYLORA_ACTIVE_REJECTED: received_at required'; end if;
    if new.received_at > new.started_at then
      raise exception 'THYLORA_ACTIVE_REJECTED: received_at cannot be after started_at'; end if;
    if nullif(btrim(new.next_action),'') is null then
      raise exception 'THYLORA_ACTIVE_REJECTED: next_action required'; end if;
    if new.next_check_at is null or new.next_check_at <= new.started_at then
      raise exception 'THYLORA_ACTIVE_REJECTED: next_check_at required and must be after started_at'; end if;
    if new.freshness_checked_at is null or not private.thy_jsonb_has_content(new.freshness_evidence) then
      raise exception 'THYLORA_ACTIVE_REJECTED: fresh-subject check and evidence required'; end if;
    if not (private.thy_jsonb_has_content(new.evidence) or private.thy_jsonb_has_content(new.preverify_contract)) then
      raise exception 'THYLORA_ACTIVE_REJECTED: evidence trail (evidence or preverify_contract) required'; end if;
  end if;

  if c = 'COMPLETE' then
    if new.preverify_pass is not true then
      raise exception 'THYLORA_ADVANCE_REJECTED: E_k/preverify_pass must equal 1'; end if;
    if new.verification_pass is not true then
      raise exception 'THYLORA_ADVANCE_REJECTED: V_(k+1) must equal 1'; end if;
    if nullif(btrim(coalesce(new.verifier,'')),'') is null then
      raise exception 'THYLORA_ADVANCE_REJECTED: named verifier required'; end if;
    if lower(btrim(new.verifier)) = lower(btrim(new.custodian)) then
      raise exception 'THYLORA_ADVANCE_REJECTED: verifier must be independent of custodian'; end if;
    if not private.thy_jsonb_has_content(new.evidence) then
      raise exception 'THYLORA_ADVANCE_REJECTED: evidence required'; end if;
    if not private.thy_jsonb_has_content(new.readback) then
      raise exception 'THYLORA_ADVANCE_REJECTED: independent readback required'; end if;
    if new.completed_at is null then
      raise exception 'THYLORA_ADVANCE_REJECTED: completed_at required'; end if;
    if new.completed_at > now() + interval '5 minutes' or new.completed_at < new.started_at then
      raise exception 'THYLORA_ADVANCE_REJECTED: completed_at must be between started_at and now'; end if;
  end if;

  if c = 'BLOCKED' then
    if nullif(btrim(coalesce(new.blocker,'')),'') is null then
      raise exception 'THYLORA_BLOCK_REJECTED: name the blocker (MISSING INPUT / AUTHORITY / SKILL GAP / TOOL / DEPENDENCY / PRIORITY / ABANDONMENT / UNKNOWN)'; end if;
    if nullif(btrim(coalesce(new.next_action,'')),'') is null and new.next_check_at is null then
      raise exception 'THYLORA_BLOCK_REJECTED: next_action or next_check_at required'; end if;
  end if;

  if nullif(btrim(coalesce(new.next_custodian,'')),'') is not null then
    if new.handed_off_at is null then
      raise exception 'THYLORA_HANDOFF_REJECTED: handed_off_at required'; end if;
    if lower(btrim(new.next_custodian)) = lower(btrim(new.custodian)) then
      raise exception 'THYLORA_HANDOFF_REJECTED: handoff must name a different custodian'; end if;
    if not private.thy_jsonb_has_content(new.evidence) then
      raise exception 'THYLORA_HANDOFF_REJECTED: handoff evidence required'; end if;
    if nullif(btrim(coalesce(new.next_action,'')),'') is null then
      raise exception 'THYLORA_HANDOFF_REJECTED: next_action required'; end if;
  end if;

  if nullif(btrim(coalesce(new.cross_agent_verifier,'')),'') is not null
     and not private.thy_jsonb_has_content(new.cross_agent_delta) then
    raise exception 'THYLORA_CROSS_AGENT_REJECTED: cross_agent_delta required when cross_agent_verifier is named';
  end if;

  return new;
end $$;

drop trigger if exists trg_thylora_enforce_movement_660 on public.thylora_work_movement_ledger;
drop trigger if exists trg_thylora_enforce_movement_663 on public.thylora_work_movement_ledger;
create trigger trg_thylora_enforce_movement_663
  before insert or update or delete on public.thylora_work_movement_ledger
  for each row execute function private.thylora_enforce_movement_663();

-- 3 · Reply receipts: PASS must be real and current ------------------------

create or replace function private.thylora_enforce_reply_receipt_663()
returns trigger language plpgsql security invoker set search_path = '' as $$
declare live_custody bigint;
begin
  if new.verification_pass is true then
    if new.custody_head is null or new.ledger_head is null then
      raise exception 'THYLORA_REPLY_REJECTED: custody_head and ledger_head required for PASS'; end if;
    if new.custody_head <> new.ledger_head then
      raise exception 'THYLORA_REPLY_REJECTED: custody/ledger head mismatch'; end if;
    select max(sequence_no) into live_custody from public.thylora_query_carryforward;
    if live_custody is not null and new.custody_head < live_custody then
      raise exception 'THYLORA_REPLY_REJECTED: stale head % (live custody %)', new.custody_head, live_custody; end if;
    if not private.thy_jsonb_has_content(new.claims_checked) then
      raise exception 'THYLORA_REPLY_REJECTED: claims_checked required for PASS'; end if;
    if not private.thy_jsonb_has_content(new.evidence_refs) then
      raise exception 'THYLORA_REPLY_REJECTED: evidence_refs required for PASS'; end if;
    if upper(coalesce(new.hallucination_risk,'')) not in ('LOW','MEDIUM','HIGH') then
      raise exception 'THYLORA_REPLY_REJECTED: hallucination_risk must be LOW, MEDIUM or HIGH'; end if;
  end if;
  return new;
end $$;

drop trigger if exists trg_thylora_enforce_reply_receipt_660 on public.thylora_reply_verification_receipts;
drop trigger if exists trg_thylora_enforce_reply_receipt_663 on public.thylora_reply_verification_receipts;
create trigger trg_thylora_enforce_reply_receipt_663
  before insert or update on public.thylora_reply_verification_receipts
  for each row execute function private.thylora_enforce_reply_receipt_663();

-- 4 · Canonical state tables: a state change into ACTIVE or COMPLETE class
--     must be backed by a valid movement-ledger row for the same key and state,
--     written in the same transaction or the last 15 minutes.
--     Fires only on INSERT or on a real state change, so the 98 existing
--     active-like rows and other threads' unrelated edits are not broken.

create or replace function private.thylora_require_movement_663()
returns trigger language plpgsql security invoker set search_path = '' as $$
declare
  key_col   text := tg_argv[0];
  state_col text := tg_argv[1];
  k text; s text; old_s text; c text;
begin
  k := to_jsonb(new) ->> key_col;
  s := to_jsonb(new) ->> state_col;
  if tg_op = 'UPDATE' then
    old_s := to_jsonb(old) ->> state_col;
    if old_s is not distinct from s then return new; end if;
  end if;
  c := private.thy_state_class(s);
  if c not in ('ACTIVE','COMPLETE') then return new; end if;
  if not exists (
    select 1 from public.thylora_work_movement_ledger m
    where m.work_item = k
      and upper(m.to_state) = upper(s)
      and m.created_at >= now() - interval '15 minutes'
  ) then
    raise exception 'THYLORA_BOUNDARY_REJECTED: %.% -> % needs a movement-ledger row (work_item=%, to_state=%) first',
      tg_table_name, k, s, k, s;
  end if;
  return new;
end $$;

-- Phase 1: the six canonical operational tables people and threads write by hand.
drop trigger if exists trg_thy_boundary_663 on public.thylora_execution_work_registry;
create trigger trg_thy_boundary_663 before insert or update on public.thylora_execution_work_registry
  for each row execute function private.thylora_require_movement_663('work_code','state');

drop trigger if exists trg_thy_boundary_663 on public.thylora_workroom_task_registry;
create trigger trg_thy_boundary_663 before insert or update on public.thylora_workroom_task_registry
  for each row execute function private.thylora_require_movement_663('task_code','state');

drop trigger if exists trg_thy_boundary_663 on public.thylora_chairman_attention_queue;
create trigger trg_thy_boundary_663 before insert or update on public.thylora_chairman_attention_queue
  for each row execute function private.thylora_require_movement_663('code','state');

drop trigger if exists trg_thy_boundary_663 on public.thylora_thread_handoff_bus;
create trigger trg_thy_boundary_663 before insert or update on public.thylora_thread_handoff_bus
  for each row execute function private.thylora_require_movement_663('handoff_id','state');

drop trigger if exists trg_thy_boundary_663 on public.thylora_external_action_completion_gate;
create trigger trg_thy_boundary_663 before insert or update on public.thylora_external_action_completion_gate
  for each row execute function private.thylora_require_movement_663('gate_code','state');

drop trigger if exists trg_thy_boundary_663 on public.thylora_store_shelf_release_gate;
create trigger trg_thy_boundary_663 before insert or update on public.thylora_store_shelf_release_gate
  for each row execute function private.thylora_require_movement_663('gate_code','state');

-- Phase 2 (NOT in this file): machine job tables (thylora_router_jobs,
-- thylora_autonomy_tasks, production_assignments, studio/render jobs,
-- social_content_queue). Their runners flip status automatically; gating them
-- before the runners write their own ledger rows would halt the pipelines.

-- 5 · Chairman visibility for the planet model (RLS on, zero policies today).
drop policy if exists chairman_read_thylora_planet_model on public.thylora_planet_model;
create policy chairman_read_thylora_planet_model on public.thylora_planet_model
  for select to authenticated using (public.thylora_is_chairman());
