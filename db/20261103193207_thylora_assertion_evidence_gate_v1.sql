-- Assertion-level evidence packet completeness gate.
-- This function checks structure only; it never certifies the truth of evidence.
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
  v_id text;
  v_missing jsonb := '[]'::jsonb;
  v_idx integer := 0;
begin
  if jsonb_typeof(v_requested) is distinct from 'array'
     or jsonb_typeof(v_reviews) is distinct from 'array'
     or jsonb_array_length(coalesce(v_requested, '[]'::jsonb)) = 0 then
    return jsonb_build_object(
      'status','HOLD',
      'structure_pass',false,
      'evidence_truth_verified',false,
      'blockers',jsonb_build_array('requested_assertions and claim_reviews must be non-empty arrays')
    );
  end if;

  for v_req in select value from jsonb_array_elements(v_requested)
  loop
    v_idx := v_idx + 1;
    v_id := nullif(btrim(v_req ->> 'assertion_id'),'');
    if v_id is null then
      v_missing := v_missing || jsonb_build_array(jsonb_build_object('item',v_idx,'missing','assertion_id'));
      continue;
    end if;

    select value into v_review
      from jsonb_array_elements(v_reviews)
     where value ->> 'assertion_id' = v_id
     limit 1;

    if v_review is null then
      v_missing := v_missing || jsonb_build_array(jsonb_build_object('assertion_id',v_id,'missing','claim_review'));
      continue;
    end if;

    if nullif(btrim(v_req ->> 'assertion'),'') is null then
      v_missing := v_missing || jsonb_build_array(jsonb_build_object('assertion_id',v_id,'missing','requested assertion text'));
    end if;
    if jsonb_typeof(v_review -> 'evidence_for') is distinct from 'array'
       or jsonb_array_length(coalesce(v_review -> 'evidence_for','[]'::jsonb)) = 0 then
      v_missing := v_missing || jsonb_build_array(jsonb_build_object('assertion_id',v_id,'missing','evidence_for'));
    end if;
    if jsonb_typeof(v_review -> 'evidence_against') is distinct from 'array'
       or jsonb_array_length(coalesce(v_review -> 'evidence_against','[]'::jsonb)) = 0 then
      v_missing := v_missing || jsonb_build_array(jsonb_build_object('assertion_id',v_id,'missing','evidence_against or documented no-finding search'));
    end if;
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

  if jsonb_array_length(v_missing) > 0 then
    return jsonb_build_object(
      'status','HOLD',
      'structure_pass',false,
      'evidence_truth_verified',false,
      'assertion_count',jsonb_array_length(v_requested),
      'blockers',v_missing
    );
  end if;

  return jsonb_build_object(
    'status','STRUCTURE_PASS_ONLY',
    'structure_pass',true,
    'evidence_truth_verified',false,
    'assertion_count',jsonb_array_length(v_requested),
    'note','This gate checks assertion-to-evidence packet completeness only. It does not validate source truth, independently authenticate the source, or establish a factual conclusion.'
  );
end;
$function$;

revoke all on function public.thylora_assertion_evidence_gate_v1(jsonb) from public;
revoke execute on function public.thylora_assertion_evidence_gate_v1(jsonb) from anon, authenticated;
grant execute on function public.thylora_assertion_evidence_gate_v1(jsonb) to service_role;
