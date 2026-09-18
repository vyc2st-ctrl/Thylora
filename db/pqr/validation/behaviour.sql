-- PQR behaviour validation. Asserts each rule rejects what it claims to reject.
-- Leaves no rows behind. Expects the first candidate board to be present.
do $$
declare ok text := '';
declare n int;
declare codes jsonb;
declare g uuid;
begin
  -- 1. Reach may never be a scoring input.
  begin
    insert into thylora_pqr_scores(cluster_code,r_recurrence,q_question_quality,
      e_evidence_availability,u_usefulness,p_product_potential,
      r_basis,q_basis,e_basis,u_basis,p_basis,virality_excluded)
    values ('PQR-C-0001',5,5,5,5,5,'probe','probe','probe','probe','probe',false);
    ok := ok || E'FAIL virality\n';
  exception when check_violation then ok := ok || E'PASS virality-rejected\n';
  end;

  -- 2. No evidence kills the score, however high every other factor.
  insert into thylora_pqr_scores(cluster_code,r_recurrence,q_question_quality,
    e_evidence_availability,u_usefulness,p_product_potential,
    r_basis,q_basis,e_basis,u_basis,p_basis,superseded)
  values ('PQR-C-0001',5,5,0,5,5,'probe','probe','probe','probe','probe',true);
  if (select score_band from thylora_pqr_scores where r_basis='probe') = 'DEAD'
     and (select opportunity_score from thylora_pqr_scores where r_basis='probe') = 0
    then ok := ok || E'PASS zero-evidence-is-DEAD\n';
    else ok := ok || E'FAIL zero-evidence\n';
  end if;
  delete from thylora_pqr_scores where r_basis='probe';

  -- 3. HIGH confidence without a primary source is refused.
  begin
    insert into thylora_pqr_evidence_checks(cluster_code,claim_examined,claim_class,
      evidence_state,what_is_known,what_is_unknown,primary_source_found,confidence)
    values ('PQR-C-0001','probe','STATISTIC','THIN','x','y',false,'HIGH');
    ok := ok || E'FAIL high-confidence\n';
  exception when check_violation then ok := ok || E'PASS high-confidence-needs-primary\n';
  end;

  -- 4. A lift without attribution is refused.
  begin
    insert into thylora_pqr_signals(source_code,question_as_observed,paraphrased,verbatim_quote)
    values ('PQR-S-NEWS-EDU','probe',false,'lifted words');
    ok := ok || E'FAIL uncredited-lift\n';
  exception when check_violation then ok := ok || E'PASS uncredited-lift-rejected\n';
  end;

  -- 5. There is no published state to move an opportunity into.
  begin
    update thylora_pqr_opportunities set state='PUBLISHED' where opportunity_code='PQR-O-0004';
    ok := ok || E'FAIL publish-state-exists\n';
  exception when check_violation then ok := ok || E'PASS no-publish-state\n';
  end;

  -- 6. The originality gate names every failing check in one call.
  insert into thylora_pqr_originality_gate(opportunity_code) values ('PQR-O-0004')
    returning gate_id, jsonb_array_length(blockers) into g, n;
  if n = 4 then ok := ok || E'PASS originality-gate-reports-all-four\n';
            else ok := ok || format(E'FAIL originality-gate reported %s\n', n);
  end if;
  delete from thylora_pqr_originality_gate where gate_id = g;

  -- 7. Even a fully cleared candidate is held: this workstream does not publish.
  select jsonb_agg(b->>'code') into codes
    from jsonb_array_elements(thylora_pqr_release_gate_v1('PQR-O-0004')->'blockers') b;
  if codes = '["NO_PUBLISH_IN_V1"]'::jsonb
    then ok := ok || E'PASS release-gate-holds-on-no-publish\n';
    else ok := ok || format(E'FAIL release-gate returned %s\n', codes);
  end if;

  raise notice E'\n%', ok;
  if ok like '%FAIL%' then raise exception 'PQR behaviour validation failed:%', ok; end if;
end $$;
