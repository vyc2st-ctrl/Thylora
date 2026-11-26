-- THYLORA CONTINUITY FLOOR — REGRESSION TEST
-- Policy: THY-SPINE-REANCHOR-SELECTION-001
--
-- Asserts:
--   1. A LATER ordinary CURRENT record must NOT seize controlling authority.
--   2. An authorized recertification WITH valid evidence SHOULD move the anchor.
--   3. A revocation restores the prior controlling floor.
--
-- All work happens inside a subtransaction that is rolled back, so immutable
-- custody is never polluted. Run as a role that can write the custody tables.
--
-- NOTE: this defines the function, runs it, and DROPS it. It is deliberately not
-- left resident in the database: it is SECURITY-sensitive (it inserts into
-- append-only custody) and was removed in migration
-- 20260904223128_thylora_harden_security_definer_surface.

create or replace function public.thylora_regression_test_floor_authority()
returns jsonb
language plpgsql
volatile
set search_path to 'public'
as $fn$
declare
  r jsonb := '{}'::jsonb;
  v_anchor text;
  v_seq bigint;
  v_recert_id uuid;
begin
  begin
    select anchor_query_id, anchor_sequence_no into v_anchor, v_seq
      from public.thylora_current_controlling_floor();
    r := jsonb_set(r,'{step1_baseline_anchor}', to_jsonb(v_anchor||' (seq '||v_seq||')'));

    -- 1: later ordinary CURRENT record
    insert into public.thylora_query_carryforward
      (query_id, source_app, session_label, user_message, message_hash, truth_class,
       restart_point, sequence_no, supersession_state, capture_state)
    values
      ('THY-Q-REGRESSION-ORDINARY-272','REGRESSION_TEST','REGRESSION ORDINARY CURRENT',
       'Ordinary later record that must NOT seize controlling authority.',
       encode(sha256(convert_to('regression-272','UTF8')),'hex'),
       'USER_MATERIAL','Regression probe.',272,'CURRENT','VERIFIED');

    select anchor_query_id, anchor_sequence_no into v_anchor, v_seq
      from public.thylora_current_controlling_floor();
    r := jsonb_set(r,'{step2_after_ordinary_insert_anchor}', to_jsonb(v_anchor||' (seq '||v_seq||')'));
    r := jsonb_set(r,'{step2_max_sequence_in_table}',
         to_jsonb((select max(sequence_no) from public.thylora_query_carryforward)));
    r := jsonb_set(r,'{step2_PASS_ordinary_did_not_supersede}',
         to_jsonb(v_anchor = 'THY-Q-20260903-1412-SPINE-002'));

    -- 2: authorized recertification with valid evidence
    insert into public.thylora_continuity_anchor_authority
      (action, anchor_query_id, authority_kind, authorized_by, evidence_query_id, evidence_note)
    values
      ('DESIGNATE','THY-Q-REGRESSION-ORDINARY-272','CHAIRMAN_RECERTIFICATION',
       'Chairman Vyctor Peete','THY-Q-20260904-SPINE-REPAIR-271',
       'Regression: authorized recertification with valid evidence.')
    returning authority_id into v_recert_id;

    select anchor_query_id, anchor_sequence_no into v_anchor, v_seq
      from public.thylora_current_controlling_floor();
    r := jsonb_set(r,'{step3_after_authorized_recert_anchor}', to_jsonb(v_anchor||' (seq '||v_seq||')'));
    r := jsonb_set(r,'{step3_PASS_recert_moved_anchor}',
         to_jsonb(v_anchor = 'THY-Q-REGRESSION-ORDINARY-272'));

    -- 3: revocation restores the prior floor
    insert into public.thylora_continuity_anchor_authority
      (action, anchor_query_id, authority_kind, authorized_by, evidence_query_id,
       evidence_note, revokes_authority_id)
    values
      ('REVOKE','THY-Q-REGRESSION-ORDINARY-272','REVOCATION','Chairman Vyctor Peete',
       'THY-Q-20260904-SPINE-REPAIR-271','Regression: revoke the test recertification.', v_recert_id);

    select anchor_query_id, anchor_sequence_no into v_anchor, v_seq
      from public.thylora_current_controlling_floor();
    r := jsonb_set(r,'{step4_after_revocation_anchor}', to_jsonb(v_anchor||' (seq '||v_seq||')'));
    r := jsonb_set(r,'{step4_PASS_revocation_restored_floor}',
         to_jsonb(v_anchor = 'THY-Q-20260903-1412-SPINE-002'));

    raise exception 'THY-TEST-ROLLBACK';
  exception when others then
    if sqlerrm <> 'THY-TEST-ROLLBACK' then
      r := jsonb_set(r,'{unexpected_error}', to_jsonb(sqlerrm));
    else
      r := jsonb_set(r,'{rolled_back}', to_jsonb(true));
    end if;
  end;
  return r;
end;
$fn$;

select jsonb_pretty(public.thylora_regression_test_floor_authority()) as regression_result;

drop function if exists public.thylora_regression_test_floor_authority();
