-- Behavioural checks for the Time Run locks.
-- Each block below SHOULD fail. An ERROR line is the passing result.
\set ON_ERROR_STOP 0

\echo '== capability gate: a later-era device cannot be recorded as functioning'
insert into thytr_capability_check (run_code, era_code, capability_code, functions_here)
values ('THY-TIME-RUN-001','1700S','DEVICE', true);

\echo '== capability gate: knowledge carrying backward is permitted (should succeed)'
insert into thytr_capability_check (run_code, era_code, capability_code, functions_here)
values ('THY-TIME-RUN-001','1700S','KNOWLEDGE', true);
select 'knowledge_rows = ' || count(*) from thytr_capability_check where capability_code='KNOWLEDGE';

\echo '== no first meeting between Vyctor and Ines'
insert into thytr_encounter (era_code, party_a_ref, party_b_ref, encounter_kind)
values ('1700S','PER-VYCTOR-EBENEEZER','PER-INES-MORALES','FIRST_MEETING');

\echo '== ... nor in the other direction'
insert into thytr_encounter (era_code, party_a_ref, party_b_ref, encounter_kind)
values ('1700S','PER-INES-MORALES','PER-VYCTOR-EBENEEZER','FIRST_MEETING');

\echo '== a continued acquaintance between them is permitted (should succeed)'
insert into thytr_encounter (era_code, party_a_ref, party_b_ref, encounter_kind)
values ('1700S','PER-VYCTOR-EBENEEZER','PER-INES-MORALES','CONTINUED_ACQUAINTANCE');

\echo '== Vyctor and Veronica is the one open first meeting (should succeed)'
insert into thytr_encounter (era_code, party_a_ref, party_b_ref, encounter_kind)
values ('1700S','PER-VYCTOR-EBENEEZER','PER-VERONICA-HALL','FIRST_MEETING');
select 'open_first_meetings = ' || count(*) from thytr_encounter where encounter_kind='FIRST_MEETING';

\echo '== an encounter cannot create a branch universe'
insert into thytr_encounter (era_code, party_a_ref, party_b_ref, encounter_kind, branch_universe_created)
values ('1700S','PER-CLARA-BENNETT','PER-VERONICA-HALL','HOUSEHOLD', true);

\echo '== a disclosure cannot be reversed'
insert into thytr_disclosure (subject, disclosure_kind, reversed)
values ('a fact about history','HISTORICAL_FACT', true);

\echo '== the locket has no state but CLOSED'
update thytr_sealed_object set state = 'OPEN' where object_code = 'OBJ-LOCKET-001';

\echo '== setting up a death for the recovery checks'
insert into thytr_death (death_id, run_code, person_ref, person_kind, origin_era_code, death_era_code, place_label,
                         witnessed_by_role, confirmed_by_role)
values ('11111111-1111-1111-1111-111111111111','THY-TIME-RUN-001','PER-VALIDATION-SUBJECT','TRAVELLER',
        'MOTOR','1700S','a road','WITNESS_KEEPER','SURGEON')
on conflict do nothing;
select 'died_outside_origin = ' || died_outside_origin from thytr_death
 where death_id = '11111111-1111-1111-1111-111111111111';

\echo '== death cannot be undone'
update thytr_death set is_dead = false where death_id = '11111111-1111-1111-1111-111111111111';

\echo '== death cannot be made reversible'
update thytr_death set reversible = true where death_id = '11111111-1111-1111-1111-111111111111';

\echo '== the era of death is fixed at record'
update thytr_death set death_era_code = 'MOTOR' where death_id = '11111111-1111-1111-1111-111111111111';

\echo '== a death record cannot be deleted'
delete from thytr_death where death_id = '11111111-1111-1111-1111-111111111111';

\echo '== two real escort slots for the recovery checks'
insert into thytr_crew_slot (slot_id, team_code, role_code, slot_index, slot_state) values
  ('33333333-3333-3333-3333-333333333333','THY-TIME-RUN-001-TEAM-A','ESCORT', 7, 'FILLED'),
  ('44444444-4444-4444-4444-444444444444','THY-TIME-RUN-001-TEAM-A','ESCORT', 8, 'FILLED')
on conflict do nothing;

insert into thytr_recovery (recovery_id, death_id)
values ('22222222-2222-2222-2222-222222222222','11111111-1111-1111-1111-111111111111')
on conflict do nothing;

\echo '== recovery stages do not skip'
update thytr_recovery set current_stage_index = 4
 where recovery_id = '22222222-2222-2222-2222-222222222222';

\echo '== the host community is answered before any era is left (D5)'
update thytr_recovery set current_stage_index = 1 where recovery_id = '22222222-2222-2222-2222-222222222222';
update thytr_recovery set current_stage_index = 2 where recovery_id = '22222222-2222-2222-2222-222222222222';
update thytr_recovery set current_stage_index = 3 where recovery_id = '22222222-2222-2222-2222-222222222222';
update thytr_recovery set current_stage_index = 4 where recovery_id = '22222222-2222-2222-2222-222222222222';
update thytr_recovery set current_stage_index = 5 where recovery_id = '22222222-2222-2222-2222-222222222222';

\echo '== ... and passes once the community has been answered (should succeed)'
update thytr_recovery set current_stage_index = 5, community_asked = true
 where recovery_id = '22222222-2222-2222-2222-222222222222';
select 'recovery_stage = ' || current_stage_index from thytr_recovery
 where recovery_id = '22222222-2222-2222-2222-222222222222';

\echo '== disposition must be decided before an escort is assigned (D8)'
update thytr_recovery set current_stage_index = 6 where recovery_id = '22222222-2222-2222-2222-222222222222';
update thytr_recovery set current_stage_index = 7 where recovery_id = '22222222-2222-2222-2222-222222222222';
update thytr_recovery set current_stage_index = 8 where recovery_id = '22222222-2222-2222-2222-222222222222';

\echo '== a returning body needs two escorts, never one'
update thytr_recovery set disposition = 'RETURN_TO_ORIGIN_ERA'
 where recovery_id = '22222222-2222-2222-2222-222222222222';
update thytr_recovery set current_stage_index = 8 where recovery_id = '22222222-2222-2222-2222-222222222222';

\echo '== ... and two escorts must be two different people'
update thytr_recovery set current_stage_index = 8, escort_slot_a = '33333333-3333-3333-3333-333333333333',
       escort_slot_b = '33333333-3333-3333-3333-333333333333'
 where recovery_id = '22222222-2222-2222-2222-222222222222';

\echo '== ... and passes with two named escorts (should succeed)'
update thytr_recovery set current_stage_index = 8, escort_slot_a = '33333333-3333-3333-3333-333333333333',
       escort_slot_b = '44444444-4444-4444-4444-444444444444'
 where recovery_id = '22222222-2222-2222-2222-222222222222';
select 'recovery_stage_after_escort = ' || current_stage_index from thytr_recovery
 where recovery_id = '22222222-2222-2222-2222-222222222222';

\echo '== a broken custody chain blocks the origin-era receipt'
update thytr_recovery set current_stage_index = 9 where recovery_id = '22222222-2222-2222-2222-222222222222';
update thytr_recovery set current_stage_index = 10, custody_unbroken = false
 where recovery_id = '22222222-2222-2222-2222-222222222222';

\echo '== a recovery never restores life'
update thytr_recovery set restores_life = true where recovery_id = '22222222-2222-2222-2222-222222222222';

\echo '== a recovery cannot close early'
update thytr_recovery set closed_at = now() where recovery_id = '22222222-2222-2222-2222-222222222222';

\echo '== help: work cannot proceed without local consent'
insert into thytr_help_order (run_code, team_code, help_code, order_state, local_consent)
values ('THY-TIME-RUN-001','THY-TIME-RUN-001-TEAM-A','BRIDGE_REPAIR','IN_PROGRESS', false);

\echo '== help: is never invoiced to the people helped'
insert into thytr_help_order (run_code, team_code, help_code, order_state, local_consent, payment_taken_from_local)
values ('THY-TIME-RUN-001','THY-TIME-RUN-001-TEAM-A','BRIDGE_REPAIR','ACCEPTED', true, true);

\echo '== help: local labour is never unpaid'
insert into thytr_help_order (run_code, team_code, help_code, order_state, local_consent, local_labour_unpaid)
values ('THY-TIME-RUN-001','THY-TIME-RUN-001-TEAM-A','FARM_HELP','ACCEPTED', true, true);

\echo '== help: materials taken locally must be paid for'
insert into thytr_help_order (run_code, team_code, help_code, order_state, local_consent,
                              materials_taken_locally, materials_paid_minor)
values ('THY-TIME-RUN-001','THY-TIME-RUN-001-TEAM-A','ROOF_REPAIR','ACCEPTED', true, true, 0);

\echo '== help: VERIFIED needs both the community and the witness keeper'
insert into thytr_help_order (run_code, team_code, help_code, order_state, local_consent,
                              verified_by_community, verified_by_witness_keeper)
values ('THY-TIME-RUN-001','THY-TIME-RUN-001-TEAM-A','CART_REPAIR','VERIFIED', true, true, false);

\echo '== help: a clean double-verified order is accepted (should succeed)'
insert into thytr_help_order (run_code, team_code, help_code, order_state, local_consent,
                              materials_taken_locally, materials_paid_minor,
                              verified_by_community, verified_by_witness_keeper)
values ('THY-TIME-RUN-001','THY-TIME-RUN-001-TEAM-A','SUPPLY_HAUL','VERIFIED', true, true, 480, true, true);
select 'verified_help = ' || count(*) from thytr_help_order where order_state = 'VERIFIED';

\echo '== emergency: standing can never be recorded as lost'
insert into thytr_emergency_response (run_code, emergency_kind, run_standing_lost)
values ('THY-TIME-RUN-001','FLOOD', true);

\echo '== a local hire without consent and era pay is refused'
insert into thytr_crew_slot (team_code, role_code, slot_index, engagement_kind, consent_recorded, pay_rate_minor)
values ('THY-TIME-RUN-001-TEAM-A','LOCAL_GUIDE', 9, 'LOCAL_HIRE', false, 100);

\echo '== money conversion needs two distinct roles'
insert into thytr_money_conversion (run_code, era_code, source_unit, source_minor, target_unit, target_minor,
                                    rate_numerator, rate_denominator, converted_by_role, witnessed_by_role)
values ('THY-TIME-RUN-001','1700S','MODERN',1000,'ERA_COIN',240,3,7,'QUARTERMASTER','QUARTERMASTER');

\echo '== death confirmation needs two distinct roles'
insert into thytr_death (run_code, person_ref, person_kind, death_era_code, witnessed_by_role, confirmed_by_role)
values ('THY-TIME-RUN-001','PER-VALIDATION-TWO','CREW','1700S','SURGEON','SURGEON');

\echo '== escort never polices local people'
insert into thytr_security_posture (escorts_posted, policing_local_people) values (2, true);

\echo '== a host community may always withdraw'
insert into thytr_host_community (community_code, run_code, era_code, place_label, may_withdraw_anytime)
values ('HC-TEST','THY-TIME-RUN-001','1700S','a village', false);

\echo '== an origin beat cannot smuggle in an invented name'
insert into thytr_origin_beat (beat_code, person_code, beat_index, beat_label, beat_text, names_invented)
values ('VH-99','PER-VERONICA-HALL', 99, 'x', 'y', true);

\echo '== a household stance cannot name a new person'
insert into thytr_household_stance (about_person, holder_label, stance, ground, named_person)
values ('PER-VERONICA-HALL','someone','SUPPORTS','x', true);

\echo '== a vote round cannot open before eligibility and safety review'
insert into thytr_vote_round (run_code, award_code, population, round_state, eligibility_reviewed, safety_reviewed)
values ('THY-TIME-RUN-001','AWD-VEHICLE-VIEWER','VIEWER','OPEN', true, false);

\echo '== a reviewed vote round opens (should succeed)'
insert into thytr_vote_round (run_code, award_code, population, round_state, eligibility_reviewed, safety_reviewed)
values ('THY-TIME-RUN-001','AWD-VEHICLE-VIEWER','VIEWER','OPEN', true, true);
select 'open_vote_rounds = ' || count(*) from thytr_vote_round where round_state = 'OPEN';

\echo '== registry guard reports absent registries rather than failing'
select 'registry_present = ' || thytr_registry_present('thylora_time_run_registry');
select 'soft_resolve = ' || (thytr_resolve_registry_ref('THY-TIME-RUN-001') ->> 'resolved');

\echo '== released host rules read'
select 'released_host_rules = ' || count(*) from thytr_released_host_rules();
select 'released_awards = ' || count(*) from thytr_released_awards();
select 'recovery_stages = ' || count(*) from thytr_recovery_stage;
select 'crew_roles = ' || count(*) from thytr_crew_role;
select 'award_classes = ' || count(*) from thytr_award_class;
select 'speed_weighted_classes = ' || count(*) from thytr_award_class where speed_weighted;
