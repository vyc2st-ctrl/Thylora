-- TIME RUN · behaviour validation for the 667 reconciliation
-- Workroom: WR-RECONCILE-667
--
-- Additive. behaviour.sql (581) is unchanged and still runs. Every block here is
-- an EXPECT REJECT case that the database, not a comment, must refuse.

\set ON_ERROR_STOP 0
\set QUIET 1

create or replace function expect_reject667(label text, stmt text) returns void as $$
begin
  execute stmt;
  raise exception 'NOT REJECTED: %', label;
exception
  when raise_exception then
    if sqlerrm like 'NOT REJECTED%' then raise; end if;
    raise notice 'REJECTED  %  (%)', label, left(sqlerrm, 76);
  when others then
    raise notice 'REJECTED  %  (%)', label, left(sqlerrm, 76);
end;
$$ language plpgsql;

insert into trun_persons (person_id, name, native_era) values
  ('ER-ROYAL-COOK-001','Inés Morales','ERA_1700S'),
  ('THY-PER-VYCTOR-EBENEZER','Vyctor Ebenezer','ERA_CURRENT')
on conflict do nothing;

insert into trun_traversals (traversal_id, serial, traveler_id, origin_era, destination_era, era_band)
values ('22222222-2222-2222-2222-222222222222','THY-ENC-0001-R667','THY-PER-VYCTOR-EBENEZER','ERA_CURRENT','ERA_1700S','UNSEALED_1700S')
on conflict do nothing;

-- ------------------------------------------------- EDEREAIRAH CLOCK (MATH-EA-TIME-660)
select expect_reject667('an EdereAirah hour of 26 is an Earth clock leaking in',
  $q$update trun_traversals set ea_hour = 26 where serial = 'THY-ENC-0001-R667'$q$);

select expect_reject667('an EdereAirah day of 29 exceeds the 28-day month',
  $q$update trun_traversals set ea_day = 29 where serial = 'THY-ENC-0001-R667'$q$);

select expect_reject667('an EdereAirah month of 13 exceeds the 12-month year',
  $q$update trun_traversals set ea_month = 13 where serial = 'THY-ENC-0001-R667'$q$);

select expect_reject667('Renewal Day cannot also sit inside a month',
  $q$update trun_traversals set ea_renewal_day = true, ea_month = 12, ea_day = 28 where serial = 'THY-ENC-0001-R667'$q$);

-- ------------------------------------------------------------ WORKING ≠ CANON
select expect_reject667('a working mechanic selection cannot be sealed as canon here',
  $q$update trun_open_mechanics set canon = true where mechanic_id = 'CAUSALITY'$q$);

select expect_reject667('an option disposition outside the no-loss vocabulary is refused',
  $q$insert into trun_option_dispositions (option_code, mechanic_id, disposition)
     values ('XX_DELETED','CAUSALITY','DELETED')$q$);

-- ----------------------------------------------------- ID-A AUTHORIZATION GATE
select expect_reject667('a traversal cannot be authorized without acknowledging the death rule',
  $q$insert into trun_traversal_authorizations (traversal_id, state, death_rule_acknowledged)
     values ('22222222-2222-2222-2222-222222222222','AUTHORIZED',false)$q$);

select expect_reject667('remaining in another era requires an origin-era continuity arrangement',
  $q$insert into trun_traversal_authorizations (traversal_id, state, death_rule_acknowledged, residence_intent)
     values ('22222222-2222-2222-2222-222222222222','AUTHORIZED',true,'REMAIN')$q$);

select expect_reject667('a threshold that does not admit cannot yield an authorization',
  $q$insert into trun_traversal_authorizations (traversal_id, state, death_rule_acknowledged, threshold_admits)
     values ('22222222-2222-2222-2222-222222222222','AUTHORIZED',true,false)$q$);

select expect_reject667('an unmet medical floor cannot yield an authorization',
  $q$insert into trun_traversal_authorizations (traversal_id, state, death_rule_acknowledged, medical_floor_met)
     values ('22222222-2222-2222-2222-222222222222','AUTHORIZED',true,false)$q$);

select expect_reject667('a residence intent outside VISIT or REMAIN is refused',
  $q$insert into trun_traversal_authorizations (traversal_id, state, death_rule_acknowledged, residence_intent)
     values ('22222222-2222-2222-2222-222222222222','AUTHORIZED',true,'MAYBE')$q$);

select expect_reject667('a departure cannot be recorded without a cleared authorization',
  $q$update trun_traversals set departure_at = '2026-10-05' where serial = 'THY-ENC-0001-R667'$q$);

-- ----------------------------------------------------------- IT-C DISCLOSURE
select expect_reject667('an IT-C disclosure that is not ledgered is refused',
  $q$insert into trun_information_shared
       (disclosure_id, traversal_id, subject, form, domain, required_tier, era_ceiling,
        instantiable_in_era, era_impact, model, ledgered)
     values ('DISC-667-A','22222222-2222-2222-2222-222222222222','who he is','SPOKEN','RECORDING',0,26,
             true,'ACTIONABLE_IN_ERA','IT_C_LEDGERED_DISCLOSURE',false)$q$);

-- ------------------------------------------------------------- NAME RECOVERY
select expect_reject667('a name under recovery cannot have guessing enabled',
  $q$update trun_name_recovery set do_not_guess = false where subject_code = 'ROYAL_CASTLE'$q$);

select expect_reject667('an unknown canon relation is refused',
  $q$insert into trun_canon_links (link_code, local_subject, canon_table, canon_key, canon_state, relation, read_live_at)
     values ('LNK-BAD','X','t','k','s','INVENTS','2026-10-05')$q$);

-- ------------------------------------------------------------- EXPECT ACCEPT
do $$ begin
  update trun_traversals set ea_year = 2026, ea_month = 10, ea_day = 4, ea_hour = 17, ea_minute = 36, ea_zone_hours = -6
  where serial = 'THY-ENC-0001-R667';
  raise notice 'ACCEPTED  an EdereAirah stamp inside the 26-hour, 28-day, 12-month calendar';
end $$;

do $$ begin
  insert into trun_traversal_authorizations
    (traversal_id, state, death_rule_acknowledged, threshold_place, threshold_admits,
     residence_intent, medical_floor_met, purpose)
  values ('22222222-2222-2222-2222-222222222222','AUTHORIZED',true,'ER-CASTLE-ROYAL-001',true,'VISIT',true,'Recorded encounter');
  raise notice 'ACCEPTED  an authorization that cleared every ID-A precondition';
end $$;

do $$ begin
  update trun_traversals set departure_at = '2026-10-05' where serial = 'THY-ENC-0001-R667';
  raise notice 'ACCEPTED  a departure recorded after the authorization cleared';
end $$;

do $$ begin
  insert into trun_information_shared
    (disclosure_id, traversal_id, subject, form, domain, required_tier, era_ceiling,
     instantiable_in_era, era_impact, model, ledgered)
  values ('DISC-667-B','22222222-2222-2222-2222-222222222222','who he is','SPOKEN','RECORDING',0,26,
          true,'ACTIONABLE_IN_ERA','IT_C_LEDGERED_DISCLOSURE',true);
  raise notice 'ACCEPTED  a ledgered IT-C disclosure';
end $$;

\set QUIET 0
select count(*) as canon_links from trun_canon_links;
select count(*) as option_dispositions from trun_option_dispositions;
select count(*) as mechanics_sealed_as_canon from trun_open_mechanics where canon;
select recovery_state, do_not_guess, language_state from trun_name_recovery;
