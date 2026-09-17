-- THYLORA CONNECTION GATEWAY · 0003 · Write operations
--
-- Three writes. That is the whole write surface of the gateway.
--
--   record_turn                   -> custody of a conversation turn
--   update_workstream             -> workstream status, blockers, next action
--   record_external_agent_result  -> custody of another agent's returned work
--
-- Everything else an AI client might want to change - product state, release
-- state, prices, rights, entitlements, money, Shopify, deployment authority,
-- continuity anchors, Chairman decisions - is ABSENT BY DESIGN. There is no
-- parameter for it and no function to call. Refusal is structural, not a check
-- that could be argued around.
--
-- No write here promotes anything to canon. Acceptance of external work is a
-- Chairman act and is routed to thylora_chairman_review_gates, which already
-- exists for exactly that purpose.

begin;

-- 1. record_turn --------------------------------------------------------------
-- Wraps the existing thylora_capture_query_pair, which is already the custody
-- point for a conversation turn. The gateway adds identity and refuses to let a
-- caller assert its own authority.
create or replace function thylora_gw_record_turn(
  p_query_id          text,
  p_source_agent      text,                    -- CHATGPT | CLAUDE | GEMINI | DASHBOARD | APP
  p_destination_thread text,
  p_user_message      text,
  p_assistant_message text     default null,
  p_truth_class       text     default 'UNVERIFIED',
  p_restart_point     text     default null,
  p_continuity_refs   jsonb    default '[]'::jsonb,
  p_session_label     text     default null,
  p_custody_context   jsonb    default '{}'::jsonb)
returns jsonb language plpgsql security definer set search_path to 'public' as $$
declare
  v_agent   text := thylora_gateway_guard();
  v_src     text := upper(btrim(coalesce(p_source_agent,'')));
  v_class   text := upper(btrim(coalesce(p_truth_class,'UNVERIFIED')));
  v_uhash   text;
  v_ahash   text;
  v_custody jsonb;
  v_row     thylora_query_carryforward%rowtype;
begin
  if btrim(coalesce(p_query_id,'')) = '' then
    raise exception 'THY-DENY: record_turn requires a query_id' using errcode='22023';
  end if;
  if btrim(coalesce(p_user_message,'')) = '' then
    raise exception 'THY-DENY: record_turn requires the source text verbatim' using errcode='22023';
  end if;
  if v_src not in ('CHATGPT','CLAUDE','GEMINI','DASHBOARD','APP','OTHER') then
    raise exception 'THY-DENY: unknown source agent %', v_src using errcode='22023';
  end if;
  -- An agent may not file a turn under another agent's name.
  if thylora_is_gateway() and v_agent <> v_src and v_src <> 'OTHER' then
    raise exception 'THY-DENY: agent % may not record a turn as %', v_agent, v_src
      using errcode='insufficient_privilege';
  end if;
  -- A client never declares a turn already proven.
  if v_class not in ('UNVERIFIED','EARTH_ACTUAL','WORLD_SIMULATED','INFERENCE','SOURCE_CLAIM') then
    raise exception 'THY-DENY: truth_class % is not a recognised classification', v_class
      using errcode='22023';
  end if;

  v_uhash := encode(digest(coalesce(p_user_message,''), 'sha256'), 'hex');
  v_ahash := case when p_assistant_message is null then null
                  else encode(digest(p_assistant_message, 'sha256'), 'hex') end;

  v_custody := coalesce(p_custody_context,'{}'::jsonb) || jsonb_build_object(
      'gateway', jsonb_build_object(
        'recorded_by_agent', v_agent,
        'declared_source_agent', v_src,
        'destination_thread', p_destination_thread,
        'authority_state', 'NO_AUTHORITY_ASSERTED',
        'canon_promotion', 'NOT_PROMOTED',
        'recorded_at', now()));

  perform thylora_capture_query_pair(
    p_query_id            => p_query_id,
    p_source_app          => v_src,
    p_session_label       => coalesce(p_session_label, p_destination_thread),
    p_user_message        => p_user_message,
    p_assistant_message   => p_assistant_message,
    p_message_hash        => coalesce(v_ahash, v_uhash),
    p_truth_class         => v_class,
    p_continuity_refs     => coalesce(p_continuity_refs,'[]'::jsonb),
    p_restart_point       => p_restart_point,
    p_source_thread_id    => p_destination_thread,
    p_source_message_index=> null,
    p_source_timestamp    => now(),
    p_import_batch_id     => null,
    p_capture_method      => 'THYLORA_CONNECTION_GATEWAY',
    p_compressed_summary  => null,
    p_custody_context     => v_custody);

  select * into v_row from thylora_query_carryforward where query_id = p_query_id;

  return jsonb_build_object(
    'operation','record_turn','accepted',true,
    'query_id', v_row.query_id, 'sequence_no', v_row.sequence_no,
    'capture_state', v_row.capture_state, 'truth_class', v_row.truth_class,
    'authority_state','NO_AUTHORITY_ASSERTED',
    'user_message_hash', v_uhash, 'assistant_message_hash', v_ahash,
    'restart_point', v_row.restart_point, 'recorded_at', v_row.created_at);
end $$;

-- 2. update_workstream --------------------------------------------------------
-- Status, current task, owner, blockers, exact next action, last verified.
-- workroom_code, purpose and source_of_truth are NOT writable: a workstream may
-- report on itself, it may not redefine what it is or where its truth lives.
create or replace function thylora_gw_update_workstream(
  p_workroom_code text,
  p_state         text  default null,
  p_current_task  text  default null,
  p_owner         text  default null,
  p_blockers      jsonb default null,
  p_next_action   text  default null,
  p_restart_point text  default null)
returns jsonb language plpgsql security definer set search_path to 'public' as $$
declare
  v_agent text := thylora_gateway_guard();
  v_code  text := btrim(coalesce(p_workroom_code,''));
  v_w     thylora_workroom_registry%rowtype;
  v_note  jsonb;
begin
  if v_code = '' then
    raise exception 'THY-DENY: update_workstream requires a workroom_code' using errcode='22023';
  end if;
  select * into v_w from thylora_workroom_registry where workroom_code = v_code;
  if not found then
    -- Creating a workroom is an authority act, not a status update.
    raise exception 'THY-DENY: workroom % does not exist; the gateway does not create workrooms', v_code
      using errcode='insufficient_privilege';
  end if;

  v_note := jsonb_build_object(
    'gateway_update', jsonb_build_object(
      'by_agent', v_agent, 'at', now(),
      'current_task', p_current_task, 'owner', p_owner,
      'next_action', p_next_action, 'prior_state', v_w.state));

  update thylora_workroom_registry
     set state           = coalesce(nullif(btrim(coalesce(p_state,'')),''), state),
         current_blockers= coalesce(p_blockers, current_blockers),
         restart_point   = coalesce(nullif(btrim(coalesce(p_restart_point,'')),''), restart_point),
         evidence        = coalesce(evidence,'[]'::jsonb) || jsonb_build_array(v_note),
         updated_at      = now()
   where workroom_code = v_code
   returning * into v_w;

  -- The exact next action lives on the task registry when one is named.
  if nullif(btrim(coalesce(p_current_task,'')),'') is not null then
    update thylora_workroom_task_registry
       set state       = coalesce(nullif(btrim(coalesce(p_state,'')),''), state),
           owner_lane  = coalesce(nullif(btrim(coalesce(p_owner,'')),''), owner_lane),
           next_action = coalesce(nullif(btrim(coalesce(p_next_action,'')),''), next_action),
           blocker     = coalesce(p_blockers ->> 0, blocker),
           evidence    = coalesce(evidence,'[]'::jsonb) || jsonb_build_array(v_note),
           updated_at  = now()
     where workroom_code = v_code and task_code = p_current_task;
  end if;

  return jsonb_build_object(
    'operation','update_workstream','accepted',true,
    'workroom_code', v_w.workroom_code,
    'workstream', thylora_gw_workstream_of(v_w.lane, v_w.workroom_code),
    'state', v_w.state, 'current_blockers', v_w.current_blockers,
    'restart_point', v_w.restart_point,
    'source_of_truth', v_w.source_of_truth,
    'last_verified_at', v_w.updated_at, 'updated_by_agent', v_agent);
end $$;

-- 3. record_external_agent_result ---------------------------------------------
-- Custody of work returned by another agent. This is the only place a foreign
-- model's output enters the backend, and it enters UNVERIFIED.
--
-- No second table. The record is a carryforward row like any other turn, marked
-- with its origin and its verification state. When acceptance is sought, a
-- Chairman review gate is opened - the gateway never accepts on its own.
create or replace function thylora_gw_record_external_agent_result(
  p_query_id            text,
  p_agent               text,                 -- CHATGPT | CLAUDE | GEMINI | OTHER
  p_originating_prompt_id text,
  p_source_thread       text,
  p_returned_text       text,
  p_verification_state  text  default 'UNVERIFIED',  -- UNVERIFIED | VERIFIED | CONTRADICTED
  p_disposition         text  default 'PENDING',     -- PENDING | ACCEPTED | REJECTED | PARTIAL
  p_request_chairman_review boolean default false,
  p_note                text  default null)
returns jsonb language plpgsql security definer set search_path to 'public' as $$
declare
  v_agent text := thylora_gateway_guard();
  v_a     text := upper(btrim(coalesce(p_agent,'')));
  v_ver   text := upper(btrim(coalesce(p_verification_state,'UNVERIFIED')));
  v_disp  text := upper(btrim(coalesce(p_disposition,'PENDING')));
  v_hash  text;
  v_gate  text := null;
begin
  if btrim(coalesce(p_returned_text,'')) = '' then
    raise exception 'THY-DENY: record_external_agent_result requires the returned text' using errcode='22023';
  end if;
  if v_a not in ('CHATGPT','CLAUDE','GEMINI','OTHER') then
    raise exception 'THY-DENY: unknown external agent %', v_a using errcode='22023';
  end if;
  if v_ver not in ('UNVERIFIED','VERIFIED','CONTRADICTED') then
    raise exception 'THY-DENY: verification_state % not recognised', v_ver using errcode='22023';
  end if;
  if v_disp not in ('PENDING','ACCEPTED','REJECTED','PARTIAL') then
    raise exception 'THY-DENY: disposition % not recognised', v_disp using errcode='22023';
  end if;
  -- ACCEPTED is a Chairman word. No agent may write it, whatever it passes.
  if v_disp = 'ACCEPTED' and not thylora_is_chairman() then
    raise exception 'THY-DENY: acceptance is reserved to the Chairman; record this as PENDING and request review'
      using errcode='insufficient_privilege';
  end if;

  v_hash := encode(digest(p_returned_text,'sha256'),'hex');

  perform thylora_capture_query_pair(
    p_query_id            => p_query_id,
    p_source_app          => v_a,
    p_session_label       => coalesce(p_source_thread, 'EXTERNAL_AGENT'),
    p_user_message        => coalesce(p_originating_prompt_id, '(originating prompt id not supplied)'),
    p_assistant_message   => p_returned_text,
    p_message_hash        => v_hash,
    p_truth_class         => 'UNVERIFIED',
    p_continuity_refs     => jsonb_build_array(p_originating_prompt_id),
    p_restart_point       => null,
    p_source_thread_id    => p_source_thread,
    p_source_message_index=> null,
    p_source_timestamp    => now(),
    p_import_batch_id     => null,
    p_capture_method      => 'EXTERNAL_AGENT_RESULT',
    p_compressed_summary  => null,
    p_custody_context     => jsonb_build_object(
      'external_agent_result', jsonb_build_object(
        'agent', v_a,
        'recorded_by_agent', v_agent,
        'originating_prompt_id', p_originating_prompt_id,
        'source_thread', p_source_thread,
        'returned_text_sha256', v_hash,
        'verification_state', v_ver,
        'disposition', v_disp,
        'canon_promotion', 'NOT_PROMOTED',
        'note', p_note,
        'recorded_at', now())));

  if p_request_chairman_review and v_disp <> 'ACCEPTED' then
    v_gate := 'THY-GATE-EXT-' || upper(replace(p_query_id,' ','-'));
    insert into thylora_chairman_review_gates
      (canonical_id, subject_type, subject_reference, reserved_decision,
       risk_level, reason, state, source_records)
    values
      (v_gate, 'EXTERNAL_AGENT_RESULT', p_query_id,
       'Accept, reject or partially accept work returned by ' || v_a,
       case when v_ver = 'CONTRADICTED' then 'HIGH' else 'MEDIUM' end,
       coalesce(p_note, 'External agent result awaiting Chairman disposition.'),
       'OPEN',
       jsonb_build_object('query_id', p_query_id, 'agent', v_a,
                          'returned_text_sha256', v_hash,
                          'originating_prompt_id', p_originating_prompt_id))
    on conflict do nothing;
  end if;

  return jsonb_build_object(
    'operation','record_external_agent_result','accepted',true,
    'query_id', p_query_id, 'agent', v_a,
    'returned_text_sha256', v_hash,
    'verification_state', v_ver, 'disposition', v_disp,
    'canon_promotion','NOT_PROMOTED',
    'chairman_review_gate', v_gate,
    'recorded_at', now());
end $$;

-- GRANTS ----------------------------------------------------------------------
grant execute on function thylora_gw_record_turn(text,text,text,text,text,text,text,jsonb,text,jsonb) to thylora_gateway;
grant execute on function thylora_gw_update_workstream(text,text,text,text,jsonb,text,text)            to thylora_gateway;
grant execute on function thylora_gw_record_external_agent_result(text,text,text,text,text,text,text,boolean,text) to thylora_gateway;

revoke execute on function thylora_gw_record_turn(text,text,text,text,text,text,text,jsonb,text,jsonb) from public, anon;
revoke execute on function thylora_gw_update_workstream(text,text,text,text,jsonb,text,text)            from public, anon;
revoke execute on function thylora_gw_record_external_agent_result(text,text,text,text,text,text,text,boolean,text) from public, anon;

commit;
