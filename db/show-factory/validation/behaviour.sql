-- HISTORY → SHOW FACTORY · behavioural checks
-- Every block below is an "expect reject". An ERROR line is the PASSING result.
-- The last block is the gate parity fixture, which must PASS.

\set ON_ERROR_STOP off

-- Fixture: one moment, one seed, fully built, used by the rejection tests below.
insert into hsf_moments (id, slug, title, subject, lane, date_context, what_happened, popular_retelling_error)
values ('11111111-1111-1111-1111-111111111111', 'golden-door', 'THE GOLDEN DOOR', 'George Washington Carver',
        'AGRICULTURE', '12 April 1896, Iowa State to Tuskegee Institute, Alabama.',
        'Carver wrote to Booker T. Washington accepting the agricultural department at Tuskegee, and in the same sentence stated the theory of change he was acting on. He then spent forty-seven years on soil restoration and agricultural extension in Macon County, Alabama.',
        'The popular version cuts "this line of" and "to our people" out of the sentence.')
on conflict do nothing;

insert into hsf_sources (id, moment_id, source_class, citation)
values ('22222222-2222-2222-2222-222222222221', '11111111-1111-1111-1111-111111111111', 'PRIMARY',
        'Carver to Booker T. Washington, 12 April 1896; Booker T. Washington Papers.'),
       ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'POPULAR',
        'A quotation website.')
on conflict do nothing;

\echo '== EXPECT REJECT: a CONTESTED claim with no dispute note'
insert into hsf_claims (moment_id, ref, statement, tier)
values ('11111111-1111-1111-1111-111111111111', 'X1', 'Something people argue about.', 'CONTESTED');

\echo '== EXPECT REJECT: an altered quotation with no record of the original wording'
insert into hsf_quotes (moment_id, ref, text, state)
values ('11111111-1111-1111-1111-111111111111', 'XQ1', 'Education is the key to unlock the golden door of freedom.', 'ALTERED_IN_CIRCULATION');

\echo '== EXPECT REJECT: a misattributed quotation with no actual author'
insert into hsf_quotes (moment_id, ref, text, state)
values ('11111111-1111-1111-1111-111111111111', 'XQ2', 'Now is the time to understand more.', 'MISATTRIBUTED');

\echo '== EXPECT REJECT: an unsourced quotation used as the factual spine'
insert into hsf_quotes (moment_id, ref, text, state, used_as_title)
values ('11111111-1111-1111-1111-111111111111', 'XQ3', 'A line everybody knows.', 'ATTRIBUTED_UNSOURCED', true);

\echo '== EXPECT REJECT: an opening question that is not a question'
insert into hsf_seeds (moment_id, seed_title, episode_premise, opening_question)
values ('11111111-1111-1111-1111-111111111111', 'BAD SEED', 'A premise.', 'This is a statement.');

-- The good seed.
insert into hsf_seeds (id, moment_id, seed_title, episode_premise, opening_question, state)
values ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'THE GOLDEN DOOR',
        'Put the letter beside the poster and show which two phrases were cut.',
        'What got cut, and who benefits from the cut?', 'SEEDED')
on conflict do nothing;

\echo '== EXPECT REJECT: a question for today written as a statement'
insert into hsf_seed_factors (seed_id, factor, body)
values ('33333333-3333-3333-3333-333333333333', 'QUESTION_FOR_TODAY', 'People should think about who owns knowledge.');

\echo '== EXPECT REJECT: a children''s draft that does not name what nobody knows'
insert into hsf_format_drafts (seed_id, format, states_the_gap)
values ('33333333-3333-3333-3333-333333333333', 'CHILDREN', false);

\echo '== EXPECT REJECT: a store product with rights not cleared'
insert into hsf_format_drafts (seed_id, format, rights_cleared)
values ('33333333-3333-3333-3333-333333333333', 'STORE_PRODUCT', false);

\echo '== EXPECT REJECT: looted provenance with no disclosure note'
insert into hsf_evidence_items (seed_id, ref, description, copyright_state, provenance_state)
values ('33333333-3333-3333-3333-333333333333', 'XV1', 'An object taken in a punitive expedition.', 'PUBLIC_DOMAIN', 'LOOTED_DOCUMENTED');

\echo '== EXPECT REJECT: a question card with no question in it'
insert into hsf_question_cards (seed_id, ordinal, question)
values ('33333333-3333-3333-3333-333333333333', 99, 'Discuss the importance of education.');

-- Corrections are append-only.
insert into hsf_corrections (id, seed_id, what_was_wrong, what_is_now_said, source, dated)
values ('44444444-4444-4444-4444-444444444444', '33333333-3333-3333-3333-333333333333',
        'We gave one wording for the 1896 letter.', 'Renderings differ; the manuscript is the tiebreaker.',
        'Booker T. Washington Papers', '2026-09-18')
on conflict do nothing;

\echo '== EXPECT REJECT: editing a published correction'
update hsf_corrections set what_was_wrong = 'nothing, actually' where id = '44444444-4444-4444-4444-444444444444';

\echo '== EXPECT REJECT: deleting a correction'
delete from hsf_corrections where id = '44444444-4444-4444-4444-444444444444';

\set ON_ERROR_STOP on

-- ── gate parity fixture: the same seed, built out, must reach PASSED ──────────
\echo '== gate on a half-built seed (expect BLOCKED with many blockers)'
select 'blockers_when_half_built=' || count(*)::text from hsf_production_gate('33333333-3333-3333-3333-333333333333');

-- Complete the seed.
insert into hsf_seed_factors (seed_id, factor, body) values
  ('33333333-3333-3333-3333-333333333333', 'DOCUMENTED_MOMENT', 'On 12 April 1896 Carver wrote to Booker T. Washington accepting Tuskegee, stating his theory of change in the same sentence.'),
  ('33333333-3333-3333-3333-333333333333', 'HIDDEN_MECHANISM', 'Legumes fix nitrogen through rhizobial nodules; every famous thing about Carver is downstream of that one fact.'),
  ('33333333-3333-3333-3333-333333333333', 'HUMAN_DECISION', 'He gave up a serious practice as a painter because he judged it would do his people less good than agricultural science.'),
  ('33333333-3333-3333-3333-333333333333', 'EVIDENCE_GAP', 'No audited list of his products exists, and nobody counted the farmers.'),
  ('33333333-3333-3333-3333-333333333333', 'QUESTION_FOR_TODAY', 'When somebody gives knowledge away instead of patenting it, who ends up owning it?')
on conflict do nothing;

insert into hsf_acts (seed_id, act_no, body) values
  ('33333333-3333-3333-3333-333333333333', 1, 'THE CUT. The poster version, then the letter, then the two phrases highlighted and removed live on screen.'),
  ('33333333-3333-3333-3333-333333333333', 2, 'THE LOOP. Macon County soil, the crop lien, the nitrogen mechanism shown physically, and the Jesup Wagon rolling in 1906.'),
  ('33333333-3333-3333-3333-333333333333', 3, 'THE OWNERSHIP. Three patents in a lifetime of published work, and what happened to his name after 1943.')
on conflict do nothing;

insert into hsf_claims (id, moment_id, ref, statement, tier, corrects_retelling) values
  ('55555555-5555-5555-5555-555555555551', '11111111-1111-1111-1111-111111111111', 'C1',
   'The line comes from the letter of 12 April 1896 and reads "this line of education ... to our people".', 'DOCUMENTED', true),
  ('55555555-5555-5555-5555-555555555552', '11111111-1111-1111-1111-111111111111', 'C2',
   'Legumes restore soil nitrogen through rhizobial nodules.', 'DOCUMENTED', false)
on conflict do nothing;

insert into hsf_claim_sources (claim_id, source_id) values
  ('55555555-5555-5555-5555-555555555551', '22222222-2222-2222-2222-222222222221'),
  ('55555555-5555-5555-5555-555555555552', '22222222-2222-2222-2222-222222222221')
on conflict do nothing;

insert into hsf_quotes (moment_id, ref, text, state, as_documented, used_as_title) values
  ('11111111-1111-1111-1111-111111111111', 'Q1', 'Education is the key to unlock the golden door of freedom.',
   'ALTERED_IN_CIRCULATION', '...this line of education is the key to unlock the golden door of freedom to our people.', true)
on conflict do nothing;

insert into hsf_format_drafts (id, seed_id, format, states_the_gap, sources_on_screen, rights_cleared) values
  ('66666666-6666-6666-6666-666666666661', '33333333-3333-3333-3333-333333333333', 'SHORT_60', false, true, false),
  ('66666666-6666-6666-6666-666666666662', '33333333-3333-3333-3333-333333333333', 'VERSION_3', true, true, false),
  ('66666666-6666-6666-6666-666666666663', '33333333-3333-3333-3333-333333333333', 'EPISODE_20', true, true, false),
  ('66666666-6666-6666-6666-666666666664', '33333333-3333-3333-3333-333333333333', 'CHILDREN', true, false, false),
  ('66666666-6666-6666-6666-666666666665', '33333333-3333-3333-3333-333333333333', 'QUESTION_CARDS', false, false, false),
  ('66666666-6666-6666-6666-666666666666', '33333333-3333-3333-3333-333333333333', 'DISCUSSION_PAGE', true, true, false),
  ('66666666-6666-6666-6666-666666666667', '33333333-3333-3333-3333-333333333333', 'STORE_PRODUCT', false, false, true)
on conflict do nothing;

insert into hsf_format_claims (format_draft_id, claim_id) values
  ('66666666-6666-6666-6666-666666666661', '55555555-5555-5555-5555-555555555551'),
  ('66666666-6666-6666-6666-666666666664', '55555555-5555-5555-5555-555555555552')
on conflict do nothing;

insert into hsf_question_cards (seed_id, ordinal, question) values
  ('33333333-3333-3333-3333-333333333333', 1, 'Two phrases were cut. Read it both ways. What changes?'),
  ('33333333-3333-3333-3333-333333333333', 2, 'He gave his work away instead of patenting it. What did that cost him?'),
  ('33333333-3333-3333-3333-333333333333', 3, 'Why would a farmer keep planting a crop that ruins his own soil?'),
  ('33333333-3333-3333-3333-333333333333', 4, 'He built a school that moved. What would your wagon carry?'),
  ('33333333-3333-3333-3333-333333333333', 5, 'He did not invent peanut butter. Why did that story stick anyway?')
on conflict do nothing;

insert into hsf_evidence_items (seed_id, ref, description, copyright_state, provenance_state) values
  ('33333333-3333-3333-3333-333333333333', 'V1', 'The 1896 manuscript letter.', 'PUBLIC_DOMAIN', 'INSTITUTIONAL_HELD')
on conflict do nothing;

\echo '== gate on the completed seed (expect PASSED and zero blockers)'
select 'blockers_when_complete=' || count(*)::text from hsf_production_gate('33333333-3333-3333-3333-333333333333');
select 'gate_state=' || hsf_run_gate('33333333-3333-3333-3333-333333333333', 'validation');

\echo '== rls coverage'
select 'rls_disabled_tables=' || count(*)::text
from pg_tables where schemaname = 'public' and tablename like 'hsf\_%' and rowsecurity = false;

\echo '== object counts'
select 'tables=' || count(*)::text from pg_tables where schemaname='public' and tablename like 'hsf\_%';
select 'check_constraints=' || count(*)::text from pg_constraint c
  join pg_class t on t.oid = c.conrelid where c.contype='c' and t.relname like 'hsf\_%';
select 'policies=' || count(*)::text from pg_policies where schemaname='public' and tablename like 'hsf\_%';
