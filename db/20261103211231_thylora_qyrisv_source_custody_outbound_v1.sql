-- Require verbatim source custody before any outbound stage.
-- The function remains structural only and never sends or publishes.
create or replace function public.thylora_qyrisv_output_gate_v1(p_packet jsonb, p_stage text default 'PREVIEW')
returns jsonb language plpgsql stable security invoker set search_path=pg_catalog,public
as $function$
declare
  v_stage text := upper(coalesce(p_stage,'PREVIEW'));
  v_blockers jsonb := '[]'::jsonb;
  v_key text;
  v_keys text[];
  v_claim_result jsonb;
  v_content text;
begin
  if p_packet is null or jsonb_typeof(p_packet) <> 'object' then
    return jsonb_build_object('status','HOLD','evidence_truth_verified',false,'blockers',jsonb_build_array('packet_must_be_json_object'));
  end if;
  if v_stage not in ('PREVIEW','OUTBOUND') then
    v_blockers := v_blockers || jsonb_build_array('stage_must_be_PREVIEW_or_OUTBOUND');
  end if;
  v_content := nullif(btrim(p_packet->>'content'),'');
  if v_content is null then v_blockers := v_blockers || jsonb_build_array('final_content_required'); end if;
  if nullif(btrim(p_packet->>'audience'),'') is null then v_blockers := v_blockers || jsonb_build_array('intended_audience_required'); end if;
  if nullif(btrim(p_packet->>'source_ref'),'') is null then v_blockers := v_blockers || jsonb_build_array('source_custody_reference_required'); end if;

  v_keys := array['Q','Y','R','I','S','V'];
  foreach v_key in array v_keys loop
    if coalesce(p_packet#>>array['qyris_factors',v_key],'false') <> 'true' then v_blockers := v_blockers || jsonb_build_array('QYRIS_V_HOLD:' || v_key); end if;
  end loop;
  v_keys := array['S','L','V','C','E','R'];
  foreach v_key in array v_keys loop
    if coalesce(p_packet#>>array['g_vyc_factors',v_key],'false') <> 'true' then v_blockers := v_blockers || jsonb_build_array('G_VYC_HOLD:' || v_key); end if;
  end loop;
  v_keys := array['S','M','A','P','V'];
  foreach v_key in array v_keys loop
    if coalesce(p_packet#>>array['correspondence_factors',v_key],'false') <> 'true' then v_blockers := v_blockers || jsonb_build_array('C_CORR_HOLD:' || v_key); end if;
  end loop;

  if p_packet->'claim_packet' is null then
    v_blockers := v_blockers || jsonb_build_array('claim_packet_required');
  else
    v_claim_result := public.thylora_assertion_evidence_gate_v1(p_packet->'claim_packet');
    if coalesce(v_claim_result->>'status','HOLD') <> 'STRUCTURE_PASS_ONLY' then
      v_blockers := v_blockers || jsonb_build_array(jsonb_build_object('claim_evidence_gate',v_claim_result));
    end if;
  end if;

  if v_stage='OUTBOUND' then
    if coalesce(p_packet#>>'{source_custody,state}','') <> 'VERBATIM_LOCKED'
       or nullif(btrim(p_packet#>>'{source_custody,evidence_ref}'),'') is null then
      v_blockers := v_blockers || jsonb_build_array('OUTBOUND_HOLD:verbatim_source_custody_and_evidence_required');
    end if;
    if coalesce(p_packet#>>'{rights,status}','') <> 'CLEARED' or nullif(btrim(p_packet#>>'{rights,evidence_ref}'),'') is null then
      v_blockers := v_blockers || jsonb_build_array('OUTBOUND_HOLD:rights_clearance_and_evidence_required');
    end if;
    if coalesce(p_packet#>>'{privacy,status}','') <> 'CLEARED' or nullif(btrim(p_packet#>>'{privacy,evidence_ref}'),'') is null then
      v_blockers := v_blockers || jsonb_build_array('OUTBOUND_HOLD:privacy_review_and_evidence_required');
    end if;
    if coalesce(p_packet#>>'{separate_authorization,status}','') <> 'APPROVED' or nullif(btrim(p_packet#>>'{separate_authorization,evidence_ref}'),'') is null then
      v_blockers := v_blockers || jsonb_build_array('OUTBOUND_HOLD:separate_explicit_authorization_required');
    end if;
  end if;

  if jsonb_array_length(v_blockers)>0 then
    return jsonb_build_object('gate','THY-GATE-QYRIS-V-OUTPUT-001','stage',v_stage,'status','HOLD','blockers',v_blockers,
      'evidence_truth_verified',false,'meaning','A missing or zero required factor holds output. This structural gate does not authenticate sources or determine scientific/medical truth.');
  end if;
  return jsonb_build_object('gate','THY-GATE-QYRIS-V-OUTPUT-001','stage',v_stage,
    'status',case when v_stage='PREVIEW' then 'STRUCTURE_PASS_ONLY' else 'READY_FOR_SEPARATE_RUNTIME_AUTHORIZATION' end,
    'blockers','[]'::jsonb,'evidence_truth_verified',false,'send_or_publish_performed',false,
    'meaning','All submitted structure and status fields passed. This function does not authenticate field truth, identify the Chairman, send, publish, or authorize an external action. A trusted runtime must independently validate identity and bind approval to the exact reviewed payload.');
end;
$function$;

revoke all on function public.thylora_qyrisv_output_gate_v1(jsonb,text) from public;
revoke execute on function public.thylora_qyrisv_output_gate_v1(jsonb,text) from anon, authenticated;
grant execute on function public.thylora_qyrisv_output_gate_v1(jsonb,text) to service_role;

comment on function public.thylora_qyrisv_output_gate_v1(jsonb,text) is
'QYRIS-V / G_VYC / correspondence structural output gate. service_role only. Outbound additionally requires verbatim source custody, rights, privacy, and separate approval fields. Never authenticates evidence truth or caller identity and never sends or publishes.';
