-- THY-TEN-LANE-RUN-001 · additive records in existing thylora-dash registries.
-- No DDL. No update or delete of any existing row. Re-runnable (ON CONFLICT DO NOTHING).

insert into thylora_workroom_registry (workroom_code, title, lane, purpose, state, source_of_truth, current_blockers, completion_tests, evidence, restart_point)
values ('WR-TEN-LANE-001', 'Ten-Lane Advancement — Spine Forward / Full Spine', 'MULTI_LANE',
  'Advance ten lanes by one evidence-bearing delta each under QYRIS-2ST, reusing shared primitives (qyris2st, lineage, access).',
  'ACTIVE_CONTRACTS_BUILT_RUNTIME_OPEN', 'REPO_AND_BACKEND',
  '["Chairman decisions listed in workrooms/WR-TEN-LANE-001.md section 5"]'::jsonb,
  '["npm test: 103/103 pass on branch claude/thylora-ten-lane-advancement-g9ru1x"]'::jsonb,
  '{"branch":"claude/thylora-ten-lane-advancement-g9ru1x","run":"spine/lanes/ten-lane-run-001.json","primitives":["spine/lib/qyris2st.js","spine/lib/lineage.js","spine/lib/access.js"]}'::jsonb,
  'Read workrooms/WR-TEN-LANE-001.md; answer Chairman decisions D1-D10; then execute each lane next_action.')
on conflict (workroom_code) do nothing;

insert into thylora_workroom_task_registry (workroom_code, task_code, title, state, owner_lane, evidence, next_action) values
  ('WR-TEN-LANE-001', 'TEN-LANE-001-L01-TX001-DOCTOR', 'Transmission 001 — Before You Call the Doctor', 'CONTRACT_BUILT_REPO_TESTED', 'L01-TX001-DOCTOR', '{"files": ["tests/spine-contracts.test.mjs", "branch claude/thylora-ten-lane-advancement-g9ru1x"], "witness_class": "REPO_TEST_PASS", "run": "THY-TEN-LANE-RUN-001"}'::jsonb, 'Chairman answers the numbering question and names a clinician reviewer; then fill location/time/weather and run preflight gates.'),
  ('WR-TEN-LANE-001', 'TEN-LANE-001-L02-LINEAGE-RUN', 'VYC2ST 0→∞ Lineage Run', 'CONTRACT_BUILT_REPO_TESTED', 'L02-LINEAGE-RUN', '{"files": ["tests/spine-lineage.test.mjs", "branch claude/thylora-ten-lane-advancement-g9ru1x"], "witness_class": "REPO_TEST_PASS", "run": "THY-TEN-LANE-RUN-001"}'::jsonb, 'Chairman picks the mirror target; then write the migration and back-fill this run''s ten units.'),
  ('WR-TEN-LANE-001', 'TEN-LANE-001-L03-CONTRIBUTION-WAKE', 'Contribution Wake', 'CONTRACT_BUILT_REPO_TESTED', 'L03-CONTRIBUTION-WAKE', '{"files": ["tests/spine-lineage.test.mjs", "branch claude/thylora-ten-lane-advancement-g9ru1x"], "witness_class": "REPO_TEST_PASS", "run": "THY-TEN-LANE-RUN-001"}'::jsonb, 'Link THY-IDEA-CONTRIBUTION-REVIEW-001 and IDEA-FWD-016 to this primitive and draft the public credit rule for Chairman approval.'),
  ('WR-TEN-LANE-001', 'TEN-LANE-001-L04-CIVIC-CONTACT', 'Civic Contact Institute', 'CONTRACT_BUILT_REPO_TESTED', 'L04-CIVIC-CONTACT', '{"files": ["tests/spine-civic.test.mjs", "branch claude/thylora-ten-lane-advancement-g9ru1x"], "witness_class": "REPO_TEST_PASS", "run": "THY-TEN-LANE-RUN-001"}'::jsonb, 'Insert the three candidate sources into legal_source_registry as RESEARCH_REQUIRED and verify against official text.'),
  ('WR-TEN-LANE-001', 'TEN-LANE-001-L05-VYC-STREAM', 'VYC Stream', 'CONTRACT_BUILT_REPO_TESTED', 'L05-VYC-STREAM', '{"files": ["tests/spine-stream.test.mjs", "branch claude/thylora-ten-lane-advancement-g9ru1x"], "witness_class": "REPO_TEST_PASS", "run": "THY-TEN-LANE-RUN-001"}'::jsonb, 'Run the ten-lane prompt itself through the stream as the first real capture and route each atom to its lane code.'),
  ('WR-TEN-LANE-001', 'TEN-LANE-001-L06-ROLE-ACCESS', 'Role Access', 'CONTRACT_BUILT_REPO_TESTED', 'L06-ROLE-ACCESS', '{"files": ["tests/spine-access.test.mjs", "branch claude/thylora-ten-lane-advancement-g9ru1x"], "witness_class": "REPO_TEST_PASS", "run": "THY-TEN-LANE-RUN-001"}'::jsonb, 'Draft RLS policy SQL that mirrors the templates for Chairman review (not applied).'),
  ('WR-TEN-LANE-001', 'TEN-LANE-001-L07-FAMILY-CRISIS', 'Family Crisis Response', 'CONTRACT_BUILT_REPO_TESTED', 'L07-FAMILY-CRISIS', '{"files": ["tests/spine-crisis.test.mjs", "branch claude/thylora-ten-lane-advancement-g9ru1x"], "witness_class": "REPO_TEST_PASS", "run": "THY-TEN-LANE-RUN-001"}'::jsonb, 'Chairman names the first covered population; then add one verified counsel row per jurisdiction.'),
  ('WR-TEN-LANE-001', 'TEN-LANE-001-L08-SAFE-FAILURE', 'Safe Failure Engineering', 'CONTRACT_BUILT_REPO_TESTED', 'L08-SAFE-FAILURE', '{"files": ["tests/spine-fmea.test.mjs", "branch claude/thylora-ten-lane-advancement-g9ru1x"], "witness_class": "REPO_TEST_PASS", "run": "THY-TEN-LANE-RUN-001"}'::jsonb, 'Fill a worksheet for the registry vehicle and insert its rows as NOT_VALIDATED after Chairman picks the subject.'),
  ('WR-TEN-LANE-001', 'TEN-LANE-001-L09-THE-SIX-LESSON', 'THE SIX — first Earth-math → EdereAirah-understanding lesson', 'CONTRACT_BUILT_REPO_TESTED', 'L09-THE-SIX-LESSON', '{"files": ["tests/spine-contracts.test.mjs", "branch claude/thylora-ten-lane-advancement-g9ru1x"], "witness_class": "REPO_TEST_PASS", "run": "THY-TEN-LANE-RUN-001"}'::jsonb, 'Insert UE-C-YEAR-RATIO-001 into ue_concepts after Chairman review; then render its Understanding Card (UE-T-008).'),
  ('WR-TEN-LANE-001', 'TEN-LANE-001-L10-FIVE-BUILDS', 'Five Ideas / Five Builds', 'CONTRACT_BUILT_REPO_TESTED', 'L10-FIVE-BUILDS', '{"files": ["tests/spine-pilot.test.mjs", "branch claude/thylora-ten-lane-advancement-g9ru1x"], "witness_class": "REPO_TEST_PASS", "run": "THY-TEN-LANE-RUN-001"}'::jsonb, 'Chairman approves scope and sets price; state moves to APPROVED_NO_OUTREACH. Outreach remains a separate decision.')
on conflict (task_code) do nothing;

insert into thylora_idea_links (source_idea_id, target_type, target_id, relationship_type, notes) values
  ('THY-IDEA-FIVE-DOCTOR-HOME-NETWORK-001', 'WORKROOM_TASK', 'TEN-LANE-001-L01-TX001-DOCTOR', 'ADVANCED_BY', 'Pre-call packet becomes Transmission 001 contract + product'),
  ('THY-IDEA-REPORTER-POV-GRAMMAR-001', 'WORKROOM_TASK', 'TEN-LANE-001-L01-TX001-DOCTOR', 'REUSED_BY', 'Reporter slot'),
  ('THY-IDEA-CONTRIBUTION-REVIEW-001', 'WORKROOM_TASK', 'TEN-LANE-001-L03-CONTRIBUTION-WAKE', 'ADVANCED_BY', 'Wake record format enforced on every lineage unit'),
  ('IDEA-FWD-016', 'WORKROOM_TASK', 'TEN-LANE-001-L03-CONTRIBUTION-WAKE', 'ADVANCED_BY', 'Contribution ledger format'),
  ('THY-IDEA-CRISIS-WHOLE-RESPONSE-001', 'WORKROOM_TASK', 'TEN-LANE-001-L07-FAMILY-CRISIS', 'ADVANCED_BY', 'Whole-package routing architecture'),
  ('THY-IDEA-TIME-CANON-RESTORE-003', 'WORKROOM_TASK', 'TEN-LANE-001-L09-THE-SIX-LESSON', 'REUSED_BY', '507 Earth-read-day orbit used as disclosed candidate')
on conflict (source_idea_id, target_type, target_id, relationship_type) do nothing;

-- Carryforward: captured through the existing custody function.
select thylora_capture_query_pair(
  p_query_id => 'THY-Q-20260924-TEN-LANE-ADVANCEMENT-597',
  p_source_app => 'CLAUDE_CODE',
  p_session_label => 'spine-597 ten-lane advancement',
  p_user_message => 'THYLORA HEAD — SPINE FORWARD / FULL SPINE — TEN-LANE ADVANCEMENT. Advance ten lanes (Transmission 001 Before You Call the Doctor; VYC2ST 0→∞ Lineage Run; Contribution Wake; Civic Contact Institute; VYC Stream; Role Access; Family Crisis Response; Safe Failure Engineering; THE SIX first lesson; Five Ideas/Five Builds) by one evidence-bearing delta each under QYRIS-2ST; shared primitives first; no unwitnessed claims; no outreach.',
  p_assistant_message => 'Built shared primitives (qyris2st claim guard, lineage+contribution wake hash chain, scoped access) and ten lane deltas with 55 new tests (103/103 pass). Contracts only: no render, no outreach, no store listing, no DDL. Workroom WR-TEN-LANE-001 with ten tasks. See workrooms/WR-TEN-LANE-001.md.',
  p_message_hash => md5('THY-Q-20260924-TEN-LANE-ADVANCEMENT-597'),
  p_truth_class => 'CURRENT_AUTHORITY_AND_EXECUTION',
  p_continuity_refs => '["WR-TEN-LANE-001","THY-TEN-LANE-RUN-001","THY-TX-001-CONTRACT-BEFORE-YOU-CALL-THE-DOCTOR","UE-C-YEAR-RATIO-001","THY-PILOT-FIVE-IDEAS-FIVE-BUILDS-001","THY-CCI-CURRICULUM-001"]'::jsonb,
  p_restart_point => 'RESTART 597 — TEN LANES. Read workrooms/WR-TEN-LANE-001.md on branch claude/thylora-ten-lane-advancement-g9ru1x. Put Chairman decisions D1-D10 in order; money-nearest is D10 (pilot scope + price).',
  p_source_thread_id => null, p_source_message_index => null, p_source_timestamp => now(), p_import_batch_id => null,
  p_capture_method => 'CLAUDE_CODE_DIRECT_CAPTURE',
  p_compressed_summary => '{"lanes":10,"tests":"103/103","render":false,"outreach":false,"ddl":false}'::jsonb,
  p_custody_context => '{"head_read":{"carryforward":596},"predecessors_modified":0}'::jsonb
) where not exists (select 1 from thylora_query_carryforward where query_id = 'THY-Q-20260924-TEN-LANE-ADVANCEMENT-597');
