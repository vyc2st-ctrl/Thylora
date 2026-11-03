CREATE OR REPLACE FUNCTION public.thylora_zenyx_product_take_gate_v1(p_packet jsonb, p_stage text DEFAULT 'DRAFT'::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE
 SET search_path TO 'pg_catalog', 'public'
AS $function$
declare
  v_stage text := upper(coalesce(p_stage, 'DRAFT'));
  v_blockers jsonb := '[]'::jsonb;
  v_claim jsonb;
  v_lang jsonb;
  v_questions jsonb := coalesce(p_packet->'questions', '[]'::jsonb);
  v_claims jsonb := coalesce(p_packet->'claim_map', '[]'::jsonb);
  v_localizations jsonb := coalesce(p_packet->'localizations', '[]'::jsonb);
  v_required_languages jsonb := coalesce(p_packet->'target_languages', '[]'::jsonb);
  v_source_state text := coalesce(p_packet#>>'{source_custody,state}','UNKNOWN');
  v_eq_ids text[] := array[
    'MATH-CLAIM-PROVENANCE-662',
    'MATH-CLAIM-CONFIDENCE-674',
    'MATH-VYC-LOGIC-VOICE-GATE-751'
  ];
  v_eq_id text;
begin
  if p_packet is null or jsonb_typeof(p_packet) <> 'object' then
    v_blockers := v_blockers || jsonb_build_array('packet_must_be_json_object');
  end if;

  if v_stage not in ('DRAFT','RELEASE') then
    v_blockers := v_blockers || jsonb_build_array('stage_must_be_DRAFT_or_RELEASE');
  end if;

  if nullif(btrim(p_packet->>'product_title'),'') is null
     or nullif(btrim(p_packet->>'product_purpose'),'') is null then
    v_blockers := v_blockers || jsonb_build_array('product_title_and_purpose_required');
  end if;

  if coalesce(p_packet#>>'{method,name}','') <> 'QYRIS'
     or jsonb_typeof(p_packet#>'{method,steps}') <> 'array'
     or jsonb_array_length(coalesce(p_packet#>'{method,steps}','[]'::jsonb)) <> 5 then
    v_blockers := v_blockers || jsonb_build_array('QYRIS_question_yield_reason_inspect_safeguard_required');
  end if;

  if jsonb_typeof(v_questions) <> 'array' or jsonb_array_length(v_questions) < 10 then
    v_blockers := v_blockers || jsonb_build_array('at_least_10_product_questions_required');
  end if;

  if jsonb_typeof(v_claims) <> 'array' or jsonb_array_length(v_claims) = 0 then
    v_blockers := v_blockers || jsonb_build_array('claim_map_required');
  else
    for v_claim in select value from jsonb_array_elements(v_claims) loop
      if nullif(btrim(v_claim->>'claim'),'') is null
         or coalesce(v_claim->>'type','') not in ('CHAIRMAN_VIEW','FACT','INFERENCE','UNKNOWN')
         or nullif(btrim(v_claim->>'grade'),'') is null then
        v_blockers := v_blockers || jsonb_build_array('each_claim_needs_text_type_and_grade');
      elsif v_claim->>'type' = 'CHAIRMAN_VIEW'
         and nullif(btrim(v_claim->>'source_quote'),'') is null then
        v_blockers := v_blockers || jsonb_build_array('chairman_view_requires_attributed_source_quote');
      elsif v_claim->>'type' = 'FACT'
         and (
           jsonb_typeof(v_claim->'evidence_for') <> 'array'
           or jsonb_array_length(coalesce(v_claim->'evidence_for','[]'::jsonb)) = 0
           or jsonb_typeof(v_claim->'evidence_against') <> 'array'
           or jsonb_array_length(coalesce(v_claim->'evidence_against','[]'::jsonb)) = 0
           or nullif(btrim(v_claim->>'independent_check_ref'),'') is null
           or nullif(btrim(v_claim->>'disconfirming_test'),'') is null
         ) then
        v_blockers := v_blockers || jsonb_build_array('factual_claim_needs_support_counterevidence_independent_check_and_disproof_test');
      end if;
    end loop;
  end if;

  if jsonb_typeof(v_localizations) <> 'array' or jsonb_array_length(v_localizations) = 0 then
    v_blockers := v_blockers || jsonb_build_array('language_localizations_required');
  else
    for v_lang in select value from jsonb_array_elements(v_localizations) loop
      if nullif(btrim(v_lang->>'language_code'),'') is null
         or nullif(btrim(v_lang->>'canonical_question'),'') is null
         or nullif(btrim(v_lang->>'rendered_question'),'') is null
         or nullif(btrim(v_lang->>'back_translation'),'') is null
         or coalesce(v_lang->>'meaning_preserved','false') <> 'true' then
        v_blockers := v_blockers || jsonb_build_array('each_localization_needs_canonical_rendered_back_translation_and_meaning_check');
      end if;
    end loop;
  end if;

  if jsonb_typeof(v_required_languages) <> 'array'
     or jsonb_array_length(v_required_languages) = 0 then
    v_blockers := v_blockers || jsonb_build_array('declare_supported_target_languages_before_language_coverage_pass');
  else
    for v_lang in select value from jsonb_array_elements(v_required_languages) loop
      if not exists (
        select 1 from jsonb_array_elements(v_localizations) x
        where x->>'language_code' = v_lang #>> '{}'
      ) then
        v_blockers := v_blockers || jsonb_build_array('missing_localization:' || (v_lang #>> '{}'));
      end if;
    end loop;
  end if;

  if jsonb_typeof(p_packet#>'{math,equation_ids}') <> 'array'
     or (select count(distinct x) from jsonb_array_elements_text(coalesce(p_packet#>'{math,equation_ids}','[]'::jsonb)) x) < 3
     or nullif(btrim(p_packet#>>'{math,application}'),'') is null
     or nullif(btrim(p_packet#>>'{math,what_evidence_tests_it}'),'') is null then
    v_blockers := v_blockers || jsonb_build_array('three_registered_equations_with_variables_application_and_test_evidence_required');
  else
    foreach v_eq_id in array v_eq_ids loop
      if not exists (
        select 1 from public.thylora_math_equation_registry e
        where e.equation_id = v_eq_id and e.state = 'ACTIVE'
      ) or not exists (
        select 1 from jsonb_array_elements_text(p_packet#>'{math,equation_ids}') x
        where x = v_eq_id
      ) then
        v_blockers := v_blockers || jsonb_build_array('required_active_math_equation_missing:' || v_eq_id);
      end if;
    end loop;
  end if;

  if nullif(btrim(p_packet#>>'{source_custody,reference}'),'') is null
     or v_source_state not in ('VERBATIM_LOCKED','STRUCTURED_RECOVERY') then
    v_blockers := v_blockers || jsonb_build_array('source_reference_and_known_capture_state_required');
  end if;

  if v_stage = 'RELEASE' then
    if v_source_state <> 'VERBATIM_LOCKED' then
      v_blockers := v_blockers || jsonb_build_array('release_requires_verbatim_locked_source');
    end if;
    if coalesce(p_packet#>>'{rights,state}','') <> 'CLEARED'
       or nullif(btrim(p_packet#>>'{rights,evidence_ref}'),'') is null then
      v_blockers := v_blockers || jsonb_build_array('rights_clearance_and_evidence_required_for_release');
    end if;
    if coalesce(p_packet#>>'{release_approval,state}','') <> 'APPROVED'
       or nullif(btrim(p_packet#>>'{release_approval,evidence_ref}'),'') is null then
      v_blockers := v_blockers || jsonb_build_array('separate_release_approval_and_readback_required');
    end if;
  end if;

  return jsonb_build_object(
    'gate','THY-ZENYX-TAKE-REVIEW-001',
    'stage',v_stage,
    'status',case when jsonb_array_length(v_blockers)=0 then 'STRUCTURE_PASS_ONLY' else 'HOLD' end,
    'blockers',v_blockers,
    'source_state',v_source_state,
    'source_exactness','not independently verified by this function',
    'evidence_verification','NOT_PERFORMED_BY_THIS_STRUCTURAL_GATE',
    'external_app_connection','NOT_VERIFIED',
    'meaning','This gate checks required fields and registered equation presence only. It does not authenticate cited sources, prove a scientific claim, connect Zenyx, authorize publication, or substitute for product rights/release gates.'
  );
end;
$function$

REVOKE ALL ON FUNCTION public.thylora_zenyx_product_take_gate_v1(jsonb,text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.thylora_zenyx_product_take_gate_v1(jsonb,text) TO service_role;
