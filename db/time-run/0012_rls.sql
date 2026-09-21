-- 0012 · Row level security across every thytr_* table.
-- Default deny. Public read is narrow and explicit. Writes are service-role.

begin;

do $$
declare t text;
begin
  foreach t in array array[
    'thytr_era_profile','thytr_run','thytr_leg','thytr_stop','thytr_rest_day',
    'thytr_team','thytr_crew_role','thytr_crew_slot',
    'thytr_vehicle_class','thytr_vehicle','thytr_repair_caravan','thytr_repair_event',
    'thytr_animal','thytr_animal_care',
    'thytr_host_community','thytr_host_home','thytr_host_home_rule','thytr_lodging',
    'thytr_money_conversion','thytr_money_ledger','thytr_clothing_issue','thytr_provision',
    'thytr_comm_channel','thytr_message','thytr_condition_report','thytr_medical_event',
    'thytr_security_posture',
    'thytr_help_kind','thytr_help_order','thytr_emergency_response',
    'thytr_capability_class','thytr_capability_check','thytr_encounter','thytr_disclosure',
    'thytr_death','thytr_recovery_stage','thytr_recovery','thytr_recovery_log',
    'thytr_person','thytr_relation','thytr_sealed_object','thytr_origin_beat',
    'thytr_household_position','thytr_household_stance',
    'thytr_award_class','thytr_vote_round','thytr_vote','thytr_award_result'
  ] loop
    if to_regclass(t) is not null then
      execute format('alter table %I enable row level security', t);
    end if;
  end loop;
end $$;

-- --- public read: released reference material only --------------------------
drop policy if exists thytr_era_public_read on thytr_era_profile;
create policy thytr_era_public_read on thytr_era_profile
  for select using (true);

drop policy if exists thytr_host_rule_public_read on thytr_host_home_rule;
create policy thytr_host_rule_public_read on thytr_host_home_rule
  for select using (public_release and enforcement_state = 'ACTIVE');

drop policy if exists thytr_award_public_read on thytr_award_class;
create policy thytr_award_public_read on thytr_award_class
  for select using (public_release);

drop policy if exists thytr_help_kind_public_read on thytr_help_kind;
create policy thytr_help_kind_public_read on thytr_help_kind
  for select using (true);

drop policy if exists thytr_crew_role_public_read on thytr_crew_role;
create policy thytr_crew_role_public_read on thytr_crew_role
  for select using (true);

drop policy if exists thytr_capability_public_read on thytr_capability_class;
create policy thytr_capability_public_read on thytr_capability_class
  for select using (true);

drop policy if exists thytr_recovery_stage_public_read on thytr_recovery_stage;
create policy thytr_recovery_stage_public_read on thytr_recovery_stage
  for select using (true);

drop policy if exists thytr_vehicle_class_public_read on thytr_vehicle_class;
create policy thytr_vehicle_class_public_read on thytr_vehicle_class
  for select using (true);

-- --- authenticated read: operational surface --------------------------------
do $$
declare t text;
begin
  foreach t in array array[
    'thytr_run','thytr_leg','thytr_stop','thytr_rest_day','thytr_team','thytr_crew_slot',
    'thytr_vehicle','thytr_repair_caravan','thytr_repair_event','thytr_animal','thytr_animal_care',
    'thytr_host_community','thytr_host_home','thytr_lodging','thytr_money_ledger',
    'thytr_clothing_issue','thytr_provision','thytr_comm_channel','thytr_message',
    'thytr_condition_report','thytr_security_posture','thytr_help_order','thytr_emergency_response',
    'thytr_capability_check','thytr_encounter','thytr_disclosure','thytr_vote_round','thytr_award_result'
  ] loop
    if to_regclass(t) is not null then
      execute format('drop policy if exists %I on %I', t || '_auth_read', t);
      execute format(
        'create policy %I on %I for select to authenticated using (true)',
        t || '_auth_read', t);
    end if;
  end loop;
end $$;

-- --- sealed: no client read at all ------------------------------------------
-- thytr_person, thytr_relation, thytr_sealed_object, thytr_origin_beat,
-- thytr_household_position, thytr_household_stance, thytr_death,
-- thytr_recovery, thytr_recovery_log, thytr_medical_event,
-- thytr_money_conversion, thytr_vote
-- receive NO select policy. RLS default-deny applies. Service role only.

-- --- writes -----------------------------------------------------------------
-- No insert/update/delete policy is created for any client role anywhere in
-- this schema. Every write is service-role. In particular:
--   * a help order cannot be self-verified from a client,
--   * a vote cannot be recounted from a client,
--   * a death record cannot be touched from a client at all.

revoke all on thytr_death from anon, authenticated;
revoke all on thytr_recovery from anon, authenticated;
revoke all on thytr_recovery_log from anon, authenticated;
revoke all on thytr_sealed_object from anon, authenticated;
revoke all on thytr_origin_beat from anon, authenticated;
revoke all on thytr_relation from anon, authenticated;
revoke all on thytr_person from anon, authenticated;
revoke all on thytr_household_stance from anon, authenticated;
revoke all on thytr_household_position from anon, authenticated;
revoke all on thytr_money_conversion from anon, authenticated;

commit;
