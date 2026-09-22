-- PROOF TEST · CASTLE
--
-- Question the proof answers: when nothing establishes a topic, does the read
-- model say so and hand back the question — instead of producing an answer?
-- And once the Chairman supplies the source, does the SAME single read turn
-- into canon without any other change?
--
-- Rolled back at the end.
begin;

do $$
declare v jsonb; ok boolean := true;
begin
  -- ---------- BEFORE: nothing establishes CASTLE ----------
  v := thy_omniview_topic('THE CASTLE');   -- alias, and mixed case

  if v->'topic_manifest'->>'topic_key' <> 'CASTLE' then
    raise notice 'PROOF FAIL: alias "THE CASTLE" did not resolve'; ok := false;
  end if;

  if v->'topic_manifest'->>'canon_state' <> 'UNSEEDED' then
    raise notice 'PROOF FAIL: CASTLE is not reported UNSEEDED'; ok := false;
  end if;

  if jsonb_array_length(v#>'{current_vs_superseded,current}') <> 0 then
    raise notice 'PROOF FAIL: CASTLE returned canon it does not have'; ok := false;
  end if;

  if (v->'authority_locks'->>'answerable_as_canon')::boolean then
    raise notice 'PROOF FAIL: CASTLE is marked answerable as canon while UNSEEDED'; ok := false;
  end if;

  if v->>'answer_rule' not like 'Canon for this topic is not written%' then
    raise notice 'PROOF FAIL: the read did not refuse to be answered from'; ok := false;
  end if;

  if v#>>'{next_better_question,question}' is null then
    raise notice 'PROOF FAIL: no next-better question was returned for an unseeded topic'; ok := false;
  end if;

  -- The authority lock is set even though the content is not: the Chairman is
  -- known to be the only one who can settle it.
  if v->'authority_locks'->>'authority_lock' <> 'CHAIRMAN' then
    raise notice 'PROOF FAIL: CASTLE has no authority lock'; ok := false;
  end if;

  -- The open gate says what is missing rather than leaving it silent.
  if not exists (select 1 from jsonb_array_elements(v->'linked_gates') g
                  where g->>'gate_key' = 'GATE-CANON-SOURCE' and g->>'gate_state' = 'OPEN') then
    raise notice 'PROOF FAIL: the CASTLE source gate is not open'; ok := false;
  end if;

  -- QYRIS must report that it read ZERO statements. It cannot claim canon it never read.
  if (select (t->>'rows')::int from jsonb_array_elements(v#>'{qyris,tables_read}') t
       where t->>'table' = 'thy_omniview_statements') <> 0 then
    raise notice 'PROOF FAIL: QYRIS reported statements that do not exist'; ok := false;
  end if;
  if jsonb_array_length(v#>'{qyris,not_read}') < 1 then
    raise notice 'PROOF FAIL: QYRIS did not declare what it did not read'; ok := false;
  end if;

  -- ---------- THE CHAIRMAN SUPPLIES THE SOURCE ----------
  perform thy_sequence_append(
    589, timestamp '2026-09-22 10:40', 'UTC',
    'The Chairman stated what CASTLE is and where it is held.',
    'CASTLE moved from UNSEEDED to canon, with a place record and a linked person.',
    'An unseeded topic cannot be answered; the gate asked for the source and the Chairman gave it.',
    'Nothing previously written changed. CASTLE had no prior canon to supersede.',
    'Chairman','CHAIRMAN_ASSERTED',
    'Which works and gates should hang off CASTLE next?',
    'CASTLE canon opened at 589.',
    '[{"topic_key":"CASTLE","effect":"CANON_CHANGED"}]'::jsonb);

  perform thy_omniview_state_canon('CASTLE',
    'PROOF FIXTURE: CASTLE is a place of record held by the Chairman.',
    'CHAIRMAN_ASSERTED','Chairman', 589);

  perform thy_omniview_link('CASTLE','PLACE','castle-site','Castle site',
    'The place itself','ACTIVE',null,null,589);
  perform thy_omniview_link('CASTLE','PERSON','INES','INÉS',
    'PROOF FIXTURE link','ACTIVE',null,null,589);

  perform thy_omniview_set_gate('GATE-CANON-SOURCE','CASTLE',
    'CASTLE canon is stated by the Chairman before any answer treats it as settled.',
    'PASSED','Chairman', null, 'sequence 589', 589);

  -- ---------- AFTER: the same single read ----------
  v := thy_omniview_topic('castle');

  if v->'topic_manifest'->>'canon_state' <> 'PARTIAL' then
    raise notice 'PROOF FAIL: CASTLE did not move off UNSEEDED'; ok := false;
  end if;
  if not (v->'authority_locks'->>'answerable_as_canon')::boolean then
    raise notice 'PROOF FAIL: CASTLE is still not answerable as canon'; ok := false;
  end if;
  if v->>'answer_rule' not like 'Answer from current statements%' then
    raise notice 'PROOF FAIL: the answer rule did not change with the canon state'; ok := false;
  end if;
  if jsonb_array_length(v#>'{linked_entities,people}') <> 1
     or jsonb_array_length(v#>'{linked_entities,places}') <> 1 then
    raise notice 'PROOF FAIL: linked people/places did not come back in the same read'; ok := false;
  end if;
  if exists (select 1 from jsonb_array_elements(v->'linked_gates') g
              where g->>'gate_key' = 'GATE-CANON-SOURCE' and g->>'gate_state' <> 'PASSED') then
    raise notice 'PROOF FAIL: the source gate did not close'; ok := false;
  end if;
  if (v#>>'{last_sequence,sequence_no}')::bigint <> 589 then
    raise notice 'PROOF FAIL: last sequence for CASTLE is not 589'; ok := false;
  end if;
  if v#>>'{last_restart,restart_point}' is null then
    raise notice 'PROOF FAIL: last restart did not come back with the topic'; ok := false;
  end if;

  if ok then
    raise notice 'PROOF PASS: CASTLE — unseeded read refused to answer and returned the question; after the Chairman supplied the source the same read returned canon, linked person and place, a closed gate and sequence 589';
  end if;
end $$;

rollback;
