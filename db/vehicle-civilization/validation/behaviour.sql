-- Behaviour assertions. Each "expect reject" block proves a rule rejects what
-- it claims to reject. Each count block proves the seed landed.
\set ON_ERROR_STOP on

do $$
declare n int; ok boolean;
begin

  -- ---- expect reject 1: a name cannot be locked from the proposal table ----
  ok := false;
  begin
    insert into er_civ_name_proposal (proposal_code, proposed_name, name_class, approval_state)
    values ('TEST-LOCK','Test','MODEL','LOCKED');
  exception when check_violation then ok := true;
  end;
  if not ok then raise exception 'FAIL: a name proposal could be set to LOCKED'; end if;
  raise notice 'PASS 1: name proposals cannot be locked';

  -- ---- expect reject 2: unknown ownership class --------------------------
  ok := false;
  begin
    insert into er_civ_company_registry (company_code, company_name, genre, ownership_class)
    values ('TEST-OWN','Test','TEST','SOMEBODY_ELSE');
  exception when check_violation then ok := true;
  end;
  if not ok then raise exception 'FAIL: an unknown ownership_class was accepted'; end if;
  raise notice 'PASS 2: ownership_class is constrained';

  -- ---- expect reject 3: a company cannot drop the Earth claim boundary ----
  ok := false;
  begin
    insert into er_civ_company_registry (company_code, company_name, genre, ownership_class, earth_claim_boundary)
    values ('TEST-EARTH','Test','TEST','INDEPENDENT', null);
  exception when not_null_violation then ok := true;
  end;
  if not ok then raise exception 'FAIL: a company was created without an Earth claim boundary'; end if;
  raise notice 'PASS 3: Earth claim boundary cannot be dropped';

  -- ---- expect reject 4: unknown confidence state -------------------------
  ok := false;
  begin
    insert into er_civ_engineering_study (study_code, topic, question, finding, confidence_state)
    values ('TEST-CONF','t','q','f','PROVEN_BECAUSE_I_SAID_SO');
  exception when check_violation then ok := true;
  end;
  if not ok then raise exception 'FAIL: an unknown confidence_state was accepted'; end if;
  raise notice 'PASS 4: confidence_state is constrained';

  -- ---- expect reject 5: a mobility class cannot drop the weapons boundary -
  ok := false;
  begin
    insert into er_civ_mobility_class_registry (class_code, domain, class_family, description, weapons_boundary)
    values ('TEST-WEAP','GROUND','t','d', null);
  exception when not_null_violation then ok := true;
  end;
  if not ok then raise exception 'FAIL: a mobility class was created without a weapons boundary'; end if;
  raise notice 'PASS 5: weapons boundary cannot be dropped';

  -- ---- expect reject 6: unknown reconciliation finding type --------------
  ok := false;
  begin
    insert into er_civ_reconciliation_log (finding_code, finding_type, description)
    values ('TEST-REC','VIBES','d');
  exception when check_violation then ok := true;
  end;
  if not ok then raise exception 'FAIL: an unknown finding_type was accepted'; end if;
  raise notice 'PASS 6: finding_type is constrained';

  -- ---- content: the locked brands survive unchanged ----------------------
  select count(*) into n from er_civ_company_registry
   where company_code in ('ERCIV-CO-PEETE-CROWN','ERCIV-CO-DGM','ERCIV-CO-MAH','ERCIV-CO-CW-AUTO')
     and name_state = 'EXISTING_CANON' and ownership_class = 'EXISTING_CANON';
  if n <> 4 then raise exception 'FAIL: expected 4 preserved canon brands, found %', n; end if;
  raise notice 'PASS 7: Peete Crown, DGM, MAH and C&W preserved as EXISTING_CANON';

  -- ---- content: THYLORA does not own the whole economy -------------------
  select count(*) into n from er_civ_market_structure
   where (concentration_rule->>'minimum_independent_competitors')::int > 0
     and jsonb_array_length(independent_companies) <
         (concentration_rule->>'minimum_independent_competitors')::int;
  if n <> 0 then raise exception 'FAIL: % genre(s) demand independents they do not have', n; end if;
  raise notice 'PASS 8: every genre meets its own minimum independent competitor rule';

  -- ---- content: a genre with no rival must say so out loud ---------------
  select count(*) into n from er_civ_market_structure
   where jsonb_array_length(independent_companies) = 0
     and (concentration_rule->>'thylora_share_ceiling_pct')::int < 100
     and coalesce((concentration_rule->>'independent_required_before_first_release')::boolean, false) = false;
  if n <> 0 then raise exception 'FAIL: % genre(s) have no rival and no stated obligation to find one', n; end if;
  raise notice 'PASS 8b: every uncontested genre either is deliberately closed or owes a rival before release';

  -- ---- content: every named lead company actually exists -----------------
  select count(*) into n from er_civ_market_structure m
   where m.thylora_lead_company is not null
     and not exists (select 1 from er_civ_company_registry c where c.company_name = m.thylora_lead_company);
  if n <> 0 then raise exception 'FAIL: % market genre(s) name a lead company that does not exist', n; end if;
  raise notice 'PASS 9: every genre lead resolves to a real company record';

  -- ---- content: independents genuinely exist and are not THYLORA-owned ---
  select count(*) into n from er_civ_company_registry where ownership_class = 'INDEPENDENT';
  if n < 10 then raise exception 'FAIL: only % independent companies, economy is too concentrated', n; end if;
  raise notice 'PASS 10: % independent companies exist', n;

  select count(*) into n from er_civ_supplier_registry where ownership_class = 'INDEPENDENT';
  if n < 8 then raise exception 'FAIL: only % independent suppliers', n; end if;
  raise notice 'PASS 11: % independent suppliers exist', n;

  -- ---- content: every manifest carries blockers and open gaps ------------
  select count(*) into n from er_civ_manifest
   where jsonb_array_length(blockers) = 0 or design_gate_state = 'APPROVED';
  if n <> 0 then raise exception 'FAIL: % manifest(s) claim to be clean or approved', n; end if;
  raise notice 'PASS 12: no manifest claims approval or a clean sheet';

  -- ---- content: every render brief is still awaiting approval ------------
  select count(*) into n from er_civ_render_brief where approval_state <> 'AWAITING_CHAIRMAN_VISUAL_APPROVAL';
  if n <> 0 then raise exception 'FAIL: % render brief(s) bypassed Chairman visual approval', n; end if;
  raise notice 'PASS 13: all render briefs await Chairman visual approval';

  -- ---- content: seeded row counts ----------------------------------------
  select count(*) into n from er_civ_company_registry;        raise notice 'companies:        %', n;
  select count(*) into n from er_civ_supplier_registry;       raise notice 'suppliers:        %', n;
  select count(*) into n from er_civ_market_structure;        raise notice 'market genres:    %', n;
  select count(*) into n from er_civ_mobility_class_registry; raise notice 'mobility classes: %', n;
  select count(*) into n from er_civ_engineering_study;       raise notice 'studies:          %', n;
  select count(*) into n from er_civ_manifest;                raise notice 'manifests:        %', n;
  select count(*) into n from er_civ_name_proposal;           raise notice 'name proposals:   %', n;
  select count(*) into n from er_civ_render_brief;            raise notice 'render briefs:    %', n;
  select count(*) into n from er_civ_reconciliation_log;      raise notice 'reconciliations:  %', n;
  select count(*) into n from er_civ_road_finding;            raise notice 'road findings:    %', n;
  select count(*) into n from er_civ_safety_risk;             raise notice 'safety risks:     %', n;

  raise notice 'ALL BEHAVIOUR ASSERTIONS PASSED';
end $$;
