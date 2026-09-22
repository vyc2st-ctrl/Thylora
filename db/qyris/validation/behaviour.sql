-- THYLORA · QYRIS · behavioural checks
--
-- Every block below is an EXPECT REJECT. The ERROR lines this produces are the
-- passing result: they prove a rule is enforced by the database rather than
-- described in a comment. Anything that does NOT error here is the finding.
--
-- Run through db/qyris/validation/run.sh, which greps for the markers.

\set ON_ERROR_STOP off

-- ── Grammar ───────────────────────────────────────────────────────────────

\echo '== EXPECT REJECT: a question with no safeguard'
insert into qyr_nodes (node_id, pack_id, cluster_id, depth, question, yield, reason, inspect, safeguard)
values ('TEST.NOSAFE', 'QYRIS-PREMARRIAGE-001', 'TEST', 0,
        'A question that looks fine', 'A yield line here', 'A reason line here', 'An inspect line here', '');

\echo '== EXPECT REJECT: a pass claiming a terminal frontier'
insert into qyr_passes (pack_id, state) values ('QYRIS-PREMARRIAGE-001', 'CLOSED');

\echo '== EXPECT REJECT: a pass claiming it is COMPLETE'
insert into qyr_passes (pack_id, state) values ('QYRIS-PREMARRIAGE-001', 'COMPLETE');

\echo '== EXPECT REJECT: a node that is its own parent'
insert into qyr_nodes (node_id, pack_id, parent_id, cluster_id, depth, question, yield, reason, inspect, safeguard)
values ('TEST.SELF', 'QYRIS-PREMARRIAGE-001', 'TEST.SELF', 'TEST', 1,
        'Question text here', 'Yield text here', 'Reason text here', 'Inspect text here', 'Safeguard text here');

\echo '== EXPECT REJECT: a root node at non-zero depth'
insert into qyr_nodes (node_id, pack_id, parent_id, cluster_id, depth, question, yield, reason, inspect, safeguard)
values ('TEST.DEPTH', 'QYRIS-PREMARRIAGE-001', null, 'TEST', 3,
        'Question text here', 'Yield text here', 'Reason text here', 'Inspect text here', 'Safeguard text here');

\echo '== EXPECT REJECT: answering a child before its parent'
do $$
declare p uuid;
begin
  insert into qyr_passes (pack_id, owner_ref) values ('QYRIS-PREMARRIAGE-001', 'owner-1') returning pass_id into p;
  perform qyr_answer(p, 'MONEY.ACCOUNTS.THRESHOLD', 'jumped the parent');
end $$;

-- ── Support fixtures ──────────────────────────────────────────────────────
insert into qyr_households (household_id, label, owner_ref) values ('HH-CHECK', 'Validation household', 'owner-1')
on conflict do nothing;

insert into qyr_seats (seat_id, household_id, family_id, person_ref, engaged_by) values
  ('S1','HH-CHECK','LEARNING_SUPPORT','person-1','owner-1'),
  ('S2','HH-CHECK','SAFETY','person-2','owner-1'),
  ('S3','HH-CHECK','SECURITY','person-3','owner-1'),
  ('S4','HH-CHECK','NUTRITION_LITERACY','person-4','owner-1'),
  ('S5','HH-CHECK','FINANCIAL_LITERACY','person-5','owner-1'),
  ('S6','HH-CHECK','LANGUAGE','person-6','owner-1')
on conflict do nothing;

\echo '== EXPECT REJECT: a seventh concurrent seat past the Trusted Six'
insert into qyr_seats (seat_id, household_id, family_id, person_ref, engaged_by)
values ('S7','HH-CHECK','LIFE_SKILLS','person-7','owner-1');

-- A second household with seats free, so the two checks below test their own
-- constraint rather than being masked by the seat limit firing first.
insert into qyr_households (household_id, label, owner_ref) values ('HH-ROOM', 'Household with room', 'owner-2')
on conflict do nothing;

\echo '== EXPECT REJECT: a seat granted decision rights'
insert into qyr_seats (seat_id, household_id, family_id, person_ref, engaged_by, decision_rights)
values ('S8','HH-ROOM','LIFE_SKILLS','person-8','owner-2','FULL');

\echo '== EXPECT REJECT: a person engaging themselves'
insert into qyr_seats (seat_id, household_id, family_id, person_ref, engaged_by)
values ('S9','HH-ROOM','LIFE_SKILLS','person-9','person-9');

-- ── ACCESS ────────────────────────────────────────────────────────────────

\echo '== EXPECT REJECT: granting a never-grantable scope'
insert into qyr_access_grants (seat_id, scope_code, purpose, granted_by, expires_at)
values ('S1','MONEY_MOVEMENT','Help with the household budget please','owner-1', now() + interval '7 days');

\echo '== EXPECT REJECT: granting surveillance to any seat'
insert into qyr_access_grants (seat_id, scope_code, purpose, granted_by, expires_at)
values ('S3','HOUSEHOLD_SURVEILLANCE','Keep an eye on the household','owner-1', now() + interval '7 days');

\echo '== EXPECT REJECT: granting a scope outside the role family'
insert into qyr_access_grants (seat_id, scope_code, purpose, granted_by, expires_at)
values ('S1','BUDGET_WORKSHEET','Learning support doing the budget','owner-1', now() + interval '7 days');

\echo '== EXPECT REJECT: a seat granting itself access'
insert into qyr_access_grants (seat_id, scope_code, purpose, granted_by, expires_at)
values ('S1','LEARNING_RECORD','Reading the school correspondence','person-1', now() + interval '7 days');

\echo '== EXPECT REJECT: an access grant with no end'
insert into qyr_access_grants (seat_id, scope_code, purpose, granted_by, expires_at)
values ('S1','LEARNING_RECORD','Reading the school correspondence','owner-1', now() - interval '1 day');

-- ── STEWARDSHIP ───────────────────────────────────────────────────────────

\echo '== EXPECT REJECT: a resource draw approved by the requester'
insert into qyr_resource_draws (seat_id, resource, purpose, mission_basis, amount_minor, cap_minor, approved_by)
values ('S1','Reading books','Books for the learner at home','Learning support for a household in the programme',
        5000, 10000, 'person-1');

\echo '== EXPECT REJECT: a resource draw with no cap headroom'
insert into qyr_resource_draws (seat_id, resource, purpose, mission_basis, amount_minor, cap_minor, approved_by)
values ('S1','Reading books','Books for the learner at home','Learning support for a household in the programme',
        20000, 10000, 'owner-1');

\echo '== EXPECT REJECT: a draw with no mission basis'
insert into qyr_resource_draws (seat_id, resource, purpose, mission_basis, amount_minor, cap_minor, approved_by)
values ('S1','Reading books','Books for the learner at home','',
        5000, 10000, 'owner-1');

-- A valid draw, then an attempt to close it as CLOSED with no receipt.
insert into qyr_resource_draws (draw_id, seat_id, resource, purpose, mission_basis, amount_minor, cap_minor, approved_by)
values ('11111111-1111-1111-1111-111111111111','S1','Reading books','Books for the learner at home',
        'Learning support for a household in the programme', 5000, 10000, 'owner-1')
on conflict do nothing;

\echo '== EXPECT REJECT: closing a draw with no receipt'
update qyr_resource_draws set state = 'CLOSED' where draw_id = '11111111-1111-1111-1111-111111111111';

-- ── AUDIT ─────────────────────────────────────────────────────────────────
insert into qyr_audit (household_id, seat_id, event, detail)
values ('HH-CHECK','S1','VALIDATION_ENTRY','{"note":"written once"}'::jsonb);

\echo '== EXPECT REJECT: updating an audit entry'
update qyr_audit set event = 'REWRITTEN' where household_id = 'HH-CHECK';

\echo '== EXPECT REJECT: deleting an audit entry'
delete from qyr_audit where household_id = 'HH-CHECK';

-- ── CONFLICT OF INTEREST ──────────────────────────────────────────────────
insert into qyr_conflicts (coi_id, seat_id, matter_ref, nature, kind, state, declared_at)
values ('22222222-2222-2222-2222-222222222222','S2','MATTER-1',
        'Related to the contractor quoting for the repair', 'PER_MATTER','DECLARED', now())
on conflict do nothing;

\echo '== EXPECT REJECT: a seat clearing its own conflict'
update qyr_conflicts set state = 'CLEARED', cleared_by = 'person-2', condition = 'Promised to be careful about it'
 where coi_id = '22222222-2222-2222-2222-222222222222';

\echo '== EXPECT REJECT: clearing a conflict with no condition'
update qyr_conflicts set state = 'CLEARED', cleared_by = 'owner-1', condition = null
 where coi_id = '22222222-2222-2222-2222-222222222222';

-- ── SELF-DISQUALIFICATION ─────────────────────────────────────────────────

\echo '== EXPECT REJECT: attaching a penalty to standing down'
insert into qyr_self_disqualifications (seat_id, matter_ref, reason, penalty)
values ('S2','MATTER-2','Standing down from this one','RATE_REDUCED');

\echo '== EXPECT REJECT: demoting standing for standing down'
insert into qyr_self_disqualifications (seat_id, matter_ref, reason, standing)
values ('S2','MATTER-2','Standing down from this one','PROBATION');

\echo '== EXPECT REJECT: a mandatory stand-down with no named ground'
insert into qyr_self_disqualifications (seat_id, matter_ref, reason, mandatory, grounds)
values ('S2','MATTER-3','Told to step back', true, '{}');

-- ── SR CANDIDATE ──────────────────────────────────────────────────────────

\echo '== EXPECT REJECT: canonizing SR by update'
update qyr_sr_candidate set canon = true where candidate_id = 'SR-001';

\echo '== EXPECT REJECT: an UNKNOWN basis carrying a number'
insert into qyr_sr_observations (seat_id, factor_code, value, basis)
values ('S1','C', 0.5, 'UNKNOWN');

\echo '== EXPECT REJECT: a measured factor claiming to be unknown'
insert into qyr_sr_observations (seat_id, factor_code, value, basis)
values ('S1','C', null, 'MEASUREMENT');

\echo '== EXPECT REJECT: asking for the SR scalar'
select qyr_sr_score('S1');

-- ── APPEALS ───────────────────────────────────────────────────────────────
insert into qyr_breaches (breach_id, seat_id, category, detail, raised_by)
values ('33333333-3333-3333-3333-333333333333','S4','SCOPE_EXCEEDED',
        'Did the shopping as well as the planning', 'owner-1')
on conflict do nothing;

\echo '== EXPECT REJECT: the subject reviewing their own appeal'
insert into qyr_appeals (breach_id, raised_by, grounds, reviewer)
values ('33333333-3333-3333-3333-333333333333','person-4','The shopping was asked for by the household','person-4');

\echo '== EXPECT REJECT: the finder reviewing their own finding'
insert into qyr_appeals (breach_id, raised_by, grounds, reviewer)
values ('33333333-3333-3333-3333-333333333333','person-4','The shopping was asked for by the household','owner-1');

\echo '== EXPECT REJECT: deciding an appeal with no reasoning'
insert into qyr_appeals (breach_id, raised_by, grounds, reviewer, state, outcome)
values ('33333333-3333-3333-3333-333333333333','person-4','The shopping was asked for by the household',
        'reviewer-9','DECIDED','UPHELD');

\set ON_ERROR_STOP on

-- ── Observations the harness reads ────────────────────────────────────────
\echo '== OBSERVED'
select 'breach_effect_revoked_grants=' || count(*)::text
  from qyr_access_grants where state = 'REVOKED' and revoke_reason = 'SCOPE_EXCEEDED';
select 'audit_entries=' || count(*)::text from qyr_audit where household_id = 'HH-CHECK';
select 'never_grantable=' || count(*)::text from qyr_scopes where grantable is false;
select 'sr_failed_tests=' || count(*)::text from qyr_sr_test_results where passed is false;
select 'sr_canon_rows=' || count(*)::text from qyr_sr_candidate where canon is true;
