-- Tighten assertion evidence packet validation: one-to-one mapping and populated references.
create or replace function public.thylora_assertion_evidence_gate_v1(p_packet jsonb)
returns jsonb
language plpgsql
immutable
set search_path = public
as $function$
declare
  v_requested jsonb := p_packet -> 'requested_assertions';
  v_reviews jsonb := p_packet -> 'claim_reviews';
  v_req jsonb;
  v_review jsonb;
  v_evidence jsonb;
  v_side text;
  v_id text;
  v_count integer;
  v_missing jsonb := '[]'::jsonb;
  v_idx integer := 0;
begin
  if jsonb_typeof(v_requested) is distinct from 'array'
     or jsonb_typeof(v_reviews) is distinct from 'array'
     or jsonb_array_length(coalesce(v_requested,'[]'::jsonb)) = 0 then
    return jsonb_build_object('status','HOLD','structure_pass',false,'evidence_truth_verified',false,
      'blockers',jsonb_build_array('requested_assertions and claim_reviews must be non-empty arrays'));
  end if;

  if jsonb_array_length(v_requested) <> jsonb_array_length(v_reviews) then
    v_missing := v_missing || jsonb_build_array('claim_reviews must map one-to-one to requested_assertions; no extras or omissions');
  end if;

  for v_req in select value from jsonb_array_elements(v_requested)
  loop
    v_idx := v_idx + 1;
    v_id := nullif(btrim(v_req ->> 'assertion_id'),'');
    if v_id is null then
      v_missing := v_missing || jsonb_build_array(jsonb_build_object('item',v_idx,'missing','assertion_id'));
      continue;
    end if;
    if nullif(btrim(v_req ->> 'assertion'),'') is null then
      v_missing := v_missing || jsonb_build_array(jsonb_build_object('assertion_id',v_id,'missing','requested assertion text'));
    end if;

    select count(*) into v_count from jsonb_array_elements(v_reviews) where value ->> 'assertion_id'=v_id;
    if v_count <> 1 then
      v_missing := v_missing || jsonb_build_array(jsonb_build_object('assertion_id',v_id,'review_count',v_count,'required_count',1));
      continue;
    end if;
    select value into v_review from jsonb_array_elements(v_reviews) where value ->> 'assertion_id'=v_id;

    foreach v_side in array array['evidence_for','evidence_against']
    loop
      if jsonb_typeof(v_review -> v_side) is distinct from 'array'
         or jsonb_array_length(coalesce(v_review -> v_side,'[]'::jsonb)) = 0 then
        v_missing := v_missing || jsonb_build_array(jsonb_build_object('assertion_id',v_id,'missing',v_side));
        continue;
      end if;
      for v_evidence in select value from jsonb_array_elements(v_review -> v_side)
      loop
        if nullif(btrim(v_evidence ->> 'source_ref'),'') is null
           or nullif(btrim(coalesce(v_evidence ->> 'date',v_evidence ->> 'accessed_at')),'') is null
           or nullif(btrim(v_evidence ->> 'scope'),'') is null
           or nullif(btrim(v_evidence ->> 'finding'),'') is null then
          v_missing := v_missing || jsonb_build_array(jsonb_build_object(
            'assertion_id',v_id,'missing',v_side || ' source_ref/date/scope/finding'));
        end if;
      end loop;
    end loop;

    if nullif(btrim(v_review ->> 'primary_check_ref'),'') is null then
      v_missing := v_missing || jsonb_build_array(jsonb_build_object('assertion_id',v_id,'missing','primary_check_ref'));
    end if;
    if nullif(btrim(v_review ->> 'independent_check_ref'),'') is null then
      v_missing := v_missing || jsonb_build_array(jsonb_build_object('assertion_id',v_id,'missing','independent_check_ref'));
    end if;
    if nullif(btrim(v_review ->> 'contradiction_status'),'') is null then
      v_missing := v_missing || jsonb_build_array(jsonb_build_object('assertion_id',v_id,'missing','contradiction_status'));
    end if;
    if nullif(btrim(v_review ->> 'disconfirming_test'),'') is null then
      v_missing := v_missing || jsonb_build_array(jsonb_build_object('assertion_id',v_id,'missing','disconfirming_test'));
    end if;
    if nullif(btrim(v_review ->> 'grade'),'') is null then
      v_missing := v_missing || jsonb_build_array(jsonb_build_object('assertion_id',v_id,'missing','grade'));
    end if;
  end loop;

  if jsonb_array_length(v_missing)>0 then
    return jsonb_build_object('status','HOLD','structure_pass',false,'evidence_truth_verified',false,
      'assertion_count',jsonb_array_length(v_requested),'blockers',v_missing);
  end if;

  return jsonb_build_object('status','STRUCTURE_PASS_ONLY','structure_pass',true,
    'evidence_truth_verified',false,'assertion_count',jsonb_array_length(v_requested),
    'note','One-to-one assertion/evidence packet completeness only. No source, finding, scientific claim, or conclusion is independently authenticated by this function.');
end;
$function$;
revoke all on function public.thylora_assertion_evidence_gate_v1(jsonb) from public;
revoke execute on function public.thylora_assertion_evidence_gate_v1(jsonb) from anon, authenticated;
grant execute on function public.thylora_assertion_evidence_gate_v1(jsonb) to service_role;
