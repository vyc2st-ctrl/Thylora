-- OMNIVIEW · 0008 · ALISTAIR and SPORTS join the manifest
-- Work: THY-WORK-OMNIVIEW-ROUNDTRIP-587 (named-topic test at 588)
--
-- The 588 read test names five topics: TIME RUN, ALISTAIR, CASTLE, STORE, SPORTS.
-- Three were already registered at 587. Two were not, and a topic that is not in
-- the manifest is not "unknown" — it is unregistered, which is a different and
-- fixable thing.
--
-- Both are registered with their authority lock on the Chairman and their canon
-- left UNSEEDED. Asking about either returns the question that would settle it
-- and an explicit refusal to answer, which is the designed behaviour and not a
-- gap. Nothing here invents a person or a programme.

begin;

insert into thy_omniview_topics (topic_key, display_name, aliases, topic_class, summary,
                                 authority_lock, authority_holder, canon_state)
values
 ('ALISTAIR','ALISTAIR', array['ALASTAIR','ALLISTAIR','ALISTER','ALISTAIR '],'PERSON',
  null,'CHAIRMAN','Chairman','UNSEEDED'),

 ('SPORTS','SPORTS', array['SPORT','SPORTS BETTING','ERN SPORTS','THE SPORTS LANE'],'PROGRAM',
  'THYLORA sports lane. A sports-betting surface exists in the member app; whether it is the whole of the topic is not established.',
  'CHAIRMAN','Chairman','UNSEEDED')
on conflict (topic_key) do update
  set aliases     = excluded.aliases,
      topic_class = excluded.topic_class,
      updated_at  = now();

-- The question that would settle each one. These are real open questions, so
-- they are recorded as the next-better question for their topic rather than
-- answered from the repository.
insert into thy_omniview_questions (topic_key, question, why_it_matters, is_next_better, entered_sequence_no)
select 'ALISTAIR',
  'Who is ALISTAIR in THYLORA — a person of the house, a character, or a lineage claim — and what source settles it?',
  'ALISTAIR is named in the 588 read test but has no source anywhere in this repository. Answering from the name alone would invent a person.',
  true, 588
where not exists (select 1 from thy_omniview_questions where topic_key = 'ALISTAIR' and is_next_better and state = 'OPEN');

insert into thy_omniview_questions (topic_key, question, why_it_matters, is_next_better, entered_sequence_no)
select 'SPORTS',
  'Is SPORTS the betting surface in the member app, the ERN sports edition lane, the FOOTBALL programme, or the parent of all three?',
  'Four separate bodies of work in this repository use the word. Reading them as one topic would merge things the Chairman has kept apart.',
  true, 588
where not exists (select 1 from thy_omniview_questions where topic_key = 'SPORTS' and is_next_better and state = 'OPEN');

-- What IS established about SPORTS is a surface, not the topic. It is recorded
-- as EVIDENCE, which does not make the topic canon.
insert into thy_omniview_statements (topic_key, statement_kind, body, truth_class, authority, entered_sequence_no, source_ref)
select 'SPORTS','EVIDENCE',
  'A sports-betting surface exists in the member app: app/sports-betting.html, app/sports-betting.js, app/sports-betting.css, reachable from app navigation. '
  'Separate lanes exist on other branches: claude/thylora-chairman-preview-ern-sports, claude/ern-sports-lock-render-packet, claude/sports-edition-lock-spec. '
  'Whether these are one topic is the open question above.',
  'REPO_VERIFIED','Chairman',588,'app/sports-betting.html'
where not exists (select 1 from thy_omniview_statements where topic_key = 'SPORTS' and status = 'CURRENT');

-- SPORTS has a surface and no settled canon, which is exactly PARTIAL.
update thy_omniview_topics set canon_state = 'PARTIAL', updated_at = now()
 where topic_key = 'SPORTS'
   and exists (select 1 from thy_omniview_statements where topic_key = 'SPORTS' and status = 'CURRENT');

insert into thy_sequence_ledger_topics (sequence_no, topic_key, effect)
select 588, k, 'TOUCHED' from unnest(array['ALISTAIR','SPORTS']) k
where exists (select 1 from thy_sequence_ledger where sequence_no = 588)
on conflict do nothing;

commit;
