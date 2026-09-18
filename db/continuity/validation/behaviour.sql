-- CONTINUITY WATCHDOG · behavioural checks against an applied schema.
-- Each check asserts that a rule holds what it claims to hold. Run after the
-- migrations; the ERROR lines are the passing result for the REJECT cases.
\set ON_ERROR_STOP 0
\pset tuples_only on
\pset format unaligned

insert into thy_continuity_authorities(authority_ref, authority_kind, note)
values ('CHAIR-2026-09-18', 'CHAIRMAN', 'validation fixture'),
       ('REVOKED-AUTH', 'APPROVAL', 'validation fixture, revoked below')
on conflict do nothing;
update thy_continuity_authorities set revoked_at = now() where authority_ref = 'REVOKED-AUTH';

-- Controlling facts for one person and one product -------------------------
insert into thy_controlling_facts(subject_kind, subject_ref, field_key, value, sequence_no, recorded_at) values
  ('PERSON','P-001','names',               '"Ada Vyc2st"'::jsonb,               469, now() - interval '400 days'),
  ('PERSON','P-001','ages',                '34'::jsonb,                         469, now() - interval '400 days'),
  ('PERSON','P-001','identity',            '"THY-ID-0001"'::jsonb,              469, now() - interval '400 days'),
  ('PERSON','P-001','family_relationships','["mother: Rae","sister: Nia"]'::jsonb, 469, now() - interval '400 days'),
  ('PERSON','P-001','person_state',        '"ACTIVE"'::jsonb,                   469, now() - interval '400 days'),
  ('PERSON','P-001','vyc2st_mark',         '"VYC2ST//469"'::jsonb,              469, now() - interval '400 days'),
  ('PERSON','P-001','barrier',             '"SEALED"'::jsonb,                   469, now() - interval '400 days'),
  ('PRODUCT','PR-001','price',             '4900'::jsonb,                       469, now() - interval '10 days'),
  ('PRODUCT','PR-001','publication_state', '"REVIEW"'::jsonb,                   469, now() - interval '10 days'),
  ('PRODUCT','PR-001','store_state',       '"DRAFT"'::jsonb,                    469, now() - interval '10 days'),
  ('PRODUCT','PR-001','dimensions',        '1080'::jsonb,                       469, now() - interval '10 days'),
  ('SPINE','SEQ','active_workstreams',
     '["WR-RAELINK-001","THY-CONTINUITY-WATCHDOG-001","WR-TIMERUN-001"]'::jsonb, 469, now() - interval '1 day');

\echo == EXPECT REJECT: rewriting a controlling fact
update thy_controlling_facts set value = '"Ada Vycst"'::jsonb
 where subject_ref = 'P-001' and field_key = 'names';

\echo == EXPECT REJECT: deleting a controlling fact
delete from thy_controlling_facts where subject_ref = 'P-001' and field_key = 'names';

\echo == EXPECT ACCEPT: everything matches the controlling facts
select 'unchanged_proceed = ' || (thy_continuity_check('T-UNCHANGED','POST',470, jsonb_build_object(
  'P-001', jsonb_build_object(
    'names','Ada  VYC2ST', 'ages', 34, 'identity','THY-ID-0001',
    'family_relationships', jsonb_build_array('sister: Nia','mother: Rae'),
    'person_state','ACTIVE', 'vyc2st_mark','VYC2ST//469', 'barrier','SEALED')
) , array['P-001'])->>'proceed_allowed');

\echo == EXPECT HOLD: a name drifts by one letter
select 'drift_proceed = ' || (thy_continuity_check('T-DRIFT','POST',470, jsonb_build_object(
  'P-001', jsonb_build_object('names','Ada Vycst')), array['P-001'], array['names'])->>'proceed_allowed');
select 'drift_class = ' || classification from thy_continuity_findings f
  join thy_continuity_checks c on c.id = f.check_id where c.task_ref = 'T-DRIFT';

\echo == EXPECT HOLD: the produced state drops a hard-watch field
select 'missing_proceed = ' || (thy_continuity_check('T-MISSING','POST',470, jsonb_build_object(
  'P-001', jsonb_build_object('names','Ada Vyc2st')), array['P-001'],
  array['names','identity'])->>'proceed_allowed');
select 'missing_class = ' || classification from thy_continuity_findings f
  join thy_continuity_checks c on c.id = f.check_id
  where c.task_ref = 'T-MISSING' and f.field_key = 'identity';

\echo == EXPECT ADVANCED: age moves forward inside the elapsed window
select 'age_class = ' || (thy_continuity_classify('ages','P-001','34'::jsonb,'35'::jsonb,
  now() - interval '400 days')->>'classification');

\echo == EXPECT DRIFTED: age moves backward
select 'age_back_class = ' || (thy_continuity_classify('ages','P-001','34'::jsonb,'33'::jsonb,
  now() - interval '400 days')->>'classification');

\echo == EXPECT DRIFTED: age advances further than elapsed time allows
select 'age_far_class = ' || (thy_continuity_classify('ages','P-001','34'::jsonb,'41'::jsonb,
  now() - interval '400 days')->>'classification');

\echo == EXPECT DRIFTED: ladder advance with no authority
select 'ladder_noauth = ' || (thy_continuity_classify('publication_state','PR-001',
  '"REVIEW"'::jsonb,'"PUBLISHED"'::jsonb, null, null)->>'classification');

\echo == EXPECT DRIFTED: ladder advance on a revoked authority
select 'ladder_revoked = ' || (thy_continuity_classify('publication_state','PR-001',
  '"REVIEW"'::jsonb,'"PUBLISHED"'::jsonb, null, 'REVOKED-AUTH')->>'classification');

\echo == EXPECT ADVANCED: ladder advance on a live authority
select 'ladder_ok = ' || (thy_continuity_classify('publication_state','PR-001',
  '"REVIEW"'::jsonb,'"PUBLISHED"'::jsonb, null, 'CHAIR-2026-09-18')->>'classification');

\echo == EXPECT DRIFTED: ladder reversed even with authority
select 'ladder_back = ' || (thy_continuity_classify('publication_state','PR-001',
  '"PUBLISHED"'::jsonb,'"REVIEW"'::jsonb, null, 'CHAIR-2026-09-18')->>'classification');

\echo == EXPECT DRIFTED: price changes with no authority
select 'price_noauth = ' || (thy_continuity_classify('price','PR-001','4900'::jsonb,'3900'::jsonb)
  ->>'classification');
select 'price_magnitude = ' || (thy_continuity_classify('price','PR-001','4900'::jsonb,'3900'::jsonb)
  ->>'magnitude');

\echo == EXPECT EXPLICITLY_SUPERSEDED: price changed by a recorded supersession
insert into thy_continuity_supersessions
  (subject_kind, subject_ref, field_key, from_value, to_value, authority_ref, reason)
values ('PRODUCT','PR-001','price','4900'::jsonb,'3900'::jsonb,'CHAIR-2026-09-18','Chairman price decision');
select 'price_superseded = ' || (thy_continuity_classify('price','PR-001','4900'::jsonb,'3900'::jsonb)
  ->>'classification');

\echo == EXPECT CONFLICTING: supersession authorizes a different value than produced
select 'price_conflict = ' || (thy_continuity_classify('price','PR-001','4900'::jsonb,'2900'::jsonb)
  ->>'classification');

\echo == EXPECT MISSING: an active workstream disappears from the produced set
select 'workstream_class = ' || (thy_continuity_classify('active_workstreams','SEQ',
  '["WR-RAELINK-001","THY-CONTINUITY-WATCHDOG-001","WR-TIMERUN-001"]'::jsonb,
  '["WR-RAELINK-001","THY-CONTINUITY-WATCHDOG-001"]'::jsonb)->>'classification');

\echo == EXPECT ADVANCED: a workstream is added and none dropped
select 'workstream_add = ' || (thy_continuity_classify('active_workstreams','SEQ',
  '["WR-RAELINK-001"]'::jsonb, '["WR-RAELINK-001","WR-NEW-002"]'::jsonb)->>'classification');

\echo == EXPECT CONFLICTING: a second current controlling fact disagrees
insert into thy_controlling_facts(subject_kind, subject_ref, field_key, value, sequence_no)
values ('PERSON','P-001','barrier','"OPEN"'::jsonb, 470);
select 'conflict_alert = ' || severity from thy_continuity_alerts
 where task_ref = 'CONTROLLING_FACT_WRITE' order by id desc limit 1;

\echo == EXPECT REJECT: a finding whose distance disagrees with its classification
insert into thy_continuity_findings(check_id, field_key, classification, d, detail)
select id, 'names', 'DRIFTED', 0, 'distance must be 1 for a breach'
  from thy_continuity_checks order by id desc limit 1;

\echo == EXPECT REJECT: a check claiming proceed while carrying a hard breach
insert into thy_continuity_checks(task_ref, phase, hard_breach_count, d_max, proceed_allowed)
values ('T-BAD','POST',1,1,true);

\echo == EXPECT REJECT: clearing an alert with no reason
select thy_continuity_clear_alert(alert_code, '   ') from thy_continuity_alerts
 where alert_state = 'OPEN' order by id desc limit 1;

\echo == EXPECT ACCEPT: clearing an alert with a reason
with cleared as (
  select thy_continuity_clear_alert(
    (select alert_code from thy_continuity_alerts where alert_state = 'OPEN' order by id desc limit 1),
    'Adjudicated in validation run.') as rec
)
select 'cleared_state = ' || (rec).alert_state || ' note_len = ' || length((rec).clearance_note)
  from cleared;

-- Carryforward -------------------------------------------------------------
insert into thy_workstream_carryforward(sequence_no, workstream_ref) values
  (469,'WR-RAELINK-001'), (469,'THY-CONTINUITY-WATCHDOG-001'), (469,'WR-TIMERUN-001');
insert into thy_workstream_carryforward(sequence_no, workstream_ref, workstream_state, closure_ref) values
  (470,'WR-RAELINK-001','ACTIVE',null),
  (470,'WR-TIMERUN-001','CLOSED','CLOSE-2026-09-18');

\echo == EXPECT HOLD: an active workstream vanished from carryforward
select 'carryforward_proceed = ' || (thy_continuity_carryforward_gap(469,470)->>'proceed_allowed');
select 'carryforward_vanished = ' || (thy_continuity_carryforward_gap(469,470)->>'vanished');
select 'carryforward_closed = ' || (thy_continuity_carryforward_gap(469,470)->>'closed_with_record');

\echo == EXPECT REJECT: leaving the active set with no closure record
insert into thy_workstream_carryforward(sequence_no, workstream_ref, workstream_state)
values (470,'WR-GHOST-003','CLOSED');

\echo == EXPECT ACCEPT: the surface reports the hold
select 'holding = ' || holding || ' open_holds = ' || open_holds from thy_continuity_hold_state;
select 'registry_rows = ' || count(*) from thy_continuity_fields;
select 'hard_watch_rows = ' || count(*) from thy_continuity_fields where hard_watch;
select 'feed_keys = ' || (select count(*) from jsonb_object_keys(thy_continuity_dashboard_feed(5)) k);
