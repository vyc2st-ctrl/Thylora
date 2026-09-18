-- SIX UNDERSTANDING ENGINE · behavioural checks against an applied schema.
-- Each check asserts that a rule REJECTS what it should reject. Run after the
-- migrations; expect the ERROR lines — they are the passing result.
\set ON_ERROR_STOP 0
\pset tuples_only on
\pset format unaligned

insert into auth.users(id,email) values
  ('22222222-2222-2222-2222-222222222222','learner@thylora.test'),
  ('33333333-3333-3333-3333-333333333333','guardian@thylora.test') on conflict do nothing;

insert into sixu_learners(id,user_id,display_name,language_band,guardian_user_ids)
values ('44444444-4444-4444-4444-444444444444','22222222-2222-2222-2222-222222222222','Learner One',2,
        array['33333333-3333-3333-3333-333333333333']::uuid[])
on conflict do nothing;

insert into sixu_questions(id,learner_id,asked_text,domain)
values ('55555555-5555-5555-5555-555555555555','44444444-4444-4444-4444-444444444444',
        'Ada has 3 less than Sam. How many does each child get?','math')
on conflict do nothing;

insert into sixu_runs(id,question_id,learner_id,state)
values ('66666666-6666-6666-6666-666666666666','55555555-5555-5555-5555-555555555555',
        '44444444-4444-4444-4444-444444444444','OPEN')
on conflict do nothing;

insert into sixu_solve_attempts(id,run_id,question_id,learner_id,presentation,answer_correct)
values ('77777777-7777-7777-7777-777777777777','66666666-6666-6666-6666-666666666666',
        '55555555-5555-5555-5555-555555555555','44444444-4444-4444-4444-444444444444','STORY',false)
on conflict do nothing;

-- THE RULE ---------------------------------------------------------------------
\echo == EXPECT REJECT: mathematics deficit claimed while the sentence was not understood
insert into sixu_load_measurements(run_id,attempt_id,learner_id,language_load,mathematical_load,
  m_controlled,verdict,mathematics_deficit_claim,teaching_target,next_action)
values ('66666666-6666-6666-6666-666666666666','77777777-7777-7777-7777-777777777777',
  '44444444-4444-4444-4444-444444444444',0.10,0.20,true,'LANGUAGE_BLOCKED','SUPPORTED_RELATIONSHIP',
  'the relationship','reteach');

\echo == EXPECT REJECT: uncontrolled M recorded below the language threshold
insert into sixu_load_measurements(run_id,attempt_id,learner_id,language_load,mathematical_load,
  m_controlled,verdict,mathematics_deficit_claim,teaching_target,next_action)
values ('66666666-6666-6666-6666-666666666666','77777777-7777-7777-7777-777777777777',
  '44444444-4444-4444-4444-444444444444',0.10,0.20,false,'LANGUAGE_BLOCKED','NOT_SUPPORTED',
  'the sentence','clear the blockers');

\echo == EXPECT ACCEPT: language blocked, M and S left unmeasured, no deficit claimed
insert into sixu_load_measurements(run_id,attempt_id,learner_id,language_load,mathematical_load,procedure_load,
  verdict,mathematics_deficit_claim,teaching_target,next_action,discarded_measurements)
values ('66666666-6666-6666-6666-666666666666','77777777-7777-7777-7777-777777777777',
  '44444444-4444-4444-4444-444444444444',0.10,null,null,'LANGUAGE_BLOCKED','NOT_SUPPORTED',
  'the sentence','clear the blockers then re-present in controlled form',array['M','S']);

\echo == EXPECT REJECT: P_solve written with a factor missing
insert into sixu_load_measurements(run_id,attempt_id,learner_id,language_load,mathematical_load,procedure_load,
  p_solve,verdict,mathematics_deficit_claim,teaching_target,next_action)
values ('66666666-6666-6666-6666-666666666666','77777777-7777-7777-7777-777777777777',
  '44444444-4444-4444-4444-444444444444',0.90,null,0.80,0.720,'RELATIONSHIP_UNMEASURED','NOT_CLAIMED','x','y');

\echo == EXPECT REJECT: P_solve that is not the product of L, M and S
insert into sixu_load_measurements(run_id,attempt_id,learner_id,language_load,mathematical_load,procedure_load,
  m_controlled,s_controlled,p_solve,verdict,mathematics_deficit_claim,teaching_target,next_action)
values ('66666666-6666-6666-6666-666666666666','77777777-7777-7777-7777-777777777777',
  '44444444-4444-4444-4444-444444444444',0.90,0.90,0.90,true,true,0.990,'SECURE','NOT_CLAIMED','transfer','y');

\echo == EXPECT REJECT: verdict SECURE with a factor below threshold
insert into sixu_load_measurements(run_id,attempt_id,learner_id,language_load,mathematical_load,procedure_load,
  m_controlled,s_controlled,p_solve,verdict,mathematics_deficit_claim,teaching_target,next_action)
values ('66666666-6666-6666-6666-666666666666','77777777-7777-7777-7777-777777777777',
  '44444444-4444-4444-4444-444444444444',0.90,0.30,0.90,true,true,0.243,'SECURE','NOT_CLAIMED','transfer','y');

-- EVIDENCE AND CONFIDENCE --------------------------------------------------------
insert into sixu_claims(id,statement) values
  ('88888888-8888-8888-8888-888888888888','Where was the ancestor born?') on conflict do nothing;
insert into sixu_claim_positions(id,claim_id,position_key,statement,standing) values
  ('99999999-9999-9999-9999-999999999999','88888888-8888-8888-8888-888888888888','mainstream','In the parish','CONSENSUS')
on conflict do nothing;
insert into sixu_sources(id,origin_key,title,origin_scope) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','book-1','A county history','GENERAL_KNOWLEDGE') on conflict do nothing;
insert into sixu_evidence_items(position_id,source_id,tier) values
  ('99999999-9999-9999-9999-999999999999','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','TERTIARY_SUMMARY'),
  ('99999999-9999-9999-9999-999999999999','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','TERTIARY_SUMMARY'),
  ('99999999-9999-9999-9999-999999999999','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','SECONDARY_ACCOUNT');

\echo == EXPECT REJECT: confidence above the evidence cap
insert into sixu_claim_resolutions(claim_id,run_id,state,confidence,confidence_cap,cap_reason)
values ('88888888-8888-8888-8888-888888888888','66666666-6666-6666-6666-666666666666','RESOLVED',0.95,0.45,'tertiary only');

\echo == EXPECT REJECT: a record gap that does not say what is missing
insert into sixu_claim_unknowns(claim_id,kind,detail)
values ('88888888-8888-8888-8888-888888888888','RECORD_GAP','the records are gone');

\echo == EXPECT REJECT: "more research is needed" offered as what would answer it
insert into sixu_discriminators(claim_id,requirement,feasibility)
values ('88888888-8888-8888-8888-888888888888','More research is needed on this period','OBTAINABLE');

\echo == EXPECT ACCEPT: a named observation with an honest feasibility
insert into sixu_discriminators(claim_id,requirement,detail,feasibility)
values ('88888888-8888-8888-8888-888888888888','A baptism entry naming the parish',
        'A contemporaneous register entry would separate the two positions.','EXISTS_UNEXAMINED');

\echo == three evidence items, one origin: that is ONE independent line
select 'independent_lines=' || (sixu_grade_evidence('99999999-9999-9999-9999-999999999999')->>'independent_lines');
\echo == strength capped by the best tier in that line, a secondary account
select 'strength=' || (sixu_grade_evidence('99999999-9999-9999-9999-999999999999')->>'strength');
\echo == repetition, single line and absence of a primary source all flagged
select 'flags=' || (sixu_grade_evidence('99999999-9999-9999-9999-999999999999')->>'flags');

-- A genuinely independent second line, on a contemporaneous record.
insert into sixu_sources(id,origin_key,title,origin_scope) values
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','parish-register-1759','The register itself','GENERAL_KNOWLEDGE')
on conflict do nothing;
insert into sixu_evidence_items(position_id,source_id,tier) values
  ('99999999-9999-9999-9999-999999999999','bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','CONTEMPORANEOUS_RECORD');

\echo == a second origin adds a line, and the cap rises to the stronger tier
select 'independent_lines_after=' || (sixu_grade_evidence('99999999-9999-9999-9999-999999999999')->>'independent_lines');
select 'strength_after=' || (sixu_grade_evidence('99999999-9999-9999-9999-999999999999')->>'strength');
\echo == standing is not strength: this position is CONSENSUS either way
select 'resolution=' || (sixu_resolve_claim('88888888-8888-8888-8888-888888888888')->>'state');

-- THE TRAIL ----------------------------------------------------------------------
insert into sixu_run_stages(run_id,seq,stage,stage_state,summary) values
  ('66666666-6666-6666-6666-666666666666',1,'QUESTION','OK','routed'),
  ('66666666-6666-6666-6666-666666666666',2,'MEANING','OK','5 material words');

\echo == EXPECT REJECT: rewriting the stage trail
update sixu_run_stages set summary = 'tidied' where run_id = '66666666-6666-6666-6666-666666666666' and seq = 2;

\echo == EXPECT REJECT: deleting from the stage trail
delete from sixu_run_stages where run_id = '66666666-6666-6666-6666-666666666666' and seq = 2;

\echo == EXPECT REJECT: a stage running backwards
insert into sixu_run_stages(run_id,seq,stage,stage_state,summary)
values ('66666666-6666-6666-6666-666666666666',3,'QUESTION','OK','re-routing after the fact');

\echo == EXPECT ACCEPT: the pipeline moving forward
insert into sixu_run_stages(run_id,seq,stage,stage_state,summary)
values ('66666666-6666-6666-6666-666666666666',3,'KNOWLEDGE','OK','1 position');

-- RUNS AND MASTERY ---------------------------------------------------------------
\echo == EXPECT REJECT: a completed run carrying no answer
update sixu_runs set state='COMPLETE' where id='66666666-6666-6666-6666-666666666666';

\echo == EXPECT REJECT: a halted run that does not say why
insert into sixu_runs(question_id,learner_id,state)
values ('55555555-5555-5555-5555-555555555555','44444444-4444-4444-4444-444444444444','HALTED');

insert into sixu_concepts(id,label,band) values ('test_concept','a test concept',2) on conflict do nothing;

\echo == EXPECT REJECT: mastery recorded as HELD with no evidence behind it
insert into sixu_learner_mastery(learner_id,concept_id,level,evidence_kind)
values ('44444444-4444-4444-4444-444444444444','test_concept','HELD','NONE');

\echo == EXPECT ACCEPT: mastery raised by a passed transfer task
insert into sixu_learner_mastery(learner_id,concept_id,level,evidence_kind)
values ('44444444-4444-4444-4444-444444444444','test_concept','HELD','TRANSFER_PASSED')
on conflict (learner_id,concept_id) do update set level = excluded.level, evidence_kind = excluded.evidence_kind;

-- THE LEXICON --------------------------------------------------------------------
\echo == EXPECT REJECT: a dictionary dump offered as a contextual meaning
insert into sixu_word_senses(id,lemma,job,meaning_here,substitute,example,non_example)
values ('left#dump','left','DIRECTION',
  'a word meaning the side opposite the right; also what remains after subtraction; also the past tense of leave; also a political position; also to abandon something or someone in a place',
  'x','y','z');

\echo == EXPECT REJECT: a sense with no non-example
insert into sixu_word_senses(id,lemma,job,meaning_here,substitute,example)
values ('left#nonex','left','DIRECTION','the side opposite your right hand','that side','Turn left.');

-- THE FUNCTIONS ------------------------------------------------------------------
\echo == low L must discard uncontrolled M and refuse a deficit claim
select 'diagnosis=' || sixu_diagnose_load(0.2, 0.2, 0.1, false, false)::text;
\echo == controlled M survives a low L
select 'controlled=' || sixu_diagnose_load(0.2, 0.9, null, true, false)::text;
\echo == all three secure
select 'secure=' || sixu_diagnose_load(1.0, 1.0, 1.0, true, true)::text;

insert into sixu_concepts(id,label,band) values ('deep_a','A',2),('deep_b','B',2),('deep_c','C',2) on conflict do nothing;
insert into sixu_concept_prerequisites(concept_id,prerequisite_id) values ('deep_a','deep_b'),('deep_b','deep_c') on conflict do nothing;
\echo == the prerequisite floor is the deepest unheld concept
select 'floor=' || (sixu_prerequisite_floor('44444444-4444-4444-4444-444444444444','deep_a')->>'floor_concept_id');
\echo == a concept outside the graph is a gap, not an invented chain
select 'gap=' || (sixu_prerequisite_floor('44444444-4444-4444-4444-444444444444','not_a_concept')->'gap'->>'code');

insert into sixu_run_failures(run_id,code,failure_name,severity,detail,response)
values ('66666666-6666-6666-6666-666666666666','FM-01','Silent word-sense guess','BLOCKING','table','ask the learner');
\echo == a run carrying a blocking failure cannot be closed complete
select 'close=' || sixu_close_run('66666666-6666-6666-6666-666666666666','COMPLETE')::text;
