-- PROOF TEST · THE FIVE NAMED TOPICS
-- Work: THY-WORK-OMNIVIEW-ROUNDTRIP-587 (588 read test)
--
-- Question the proof answers: does ONE read of each named topic return the
-- eleven required sections — CURRENT AUTHORITY, SUPERSEDED STATE, PEOPLE,
-- PLACES, OBJECTS, PRODUCTS, WORK, GATES, LAST CHAIRMAN CORRECTION, LAST
-- RESTART, SOURCE REFERENCES — and does an UNSEEDED topic refuse to answer
-- rather than produce something plausible?
--
-- Rolled back at the end.
begin;

do $$
declare
  t text;
  v jsonb;
  ok boolean := true;
  v_unseeded int := 0;
  v_answered int := 0;
begin
  foreach t in array array['TIME RUN','ALISTAIR','CASTLE','STORE','SPORTS'] loop

    -- The topic resolves at all. An unregistered topic is a different failure
    -- from an unanswerable one, and the test must tell them apart.
    if thy_omniview_resolve_topic(t) is null then
      raise notice 'PROOF FAIL: % does not resolve in the topic manifest', t; ok := false;
      continue;
    end if;

    v := thy_omniview_topic(t, 25);

    if not (v->>'found')::boolean then
      raise notice 'PROOF FAIL: % resolved but the read returned found=false', t; ok := false;
      continue;
    end if;

    -- CURRENT AUTHORITY -------------------------------------------------------
    if v->'authority_locks'->>'authority_lock' is null then
      raise notice 'PROOF FAIL: % returned no CURRENT AUTHORITY', t; ok := false;
    end if;

    -- SUPERSEDED STATE --------------------------------------------------------
    if v->'current_vs_superseded'->'superseded' is null then
      raise notice 'PROOF FAIL: % returned no SUPERSEDED STATE section', t; ok := false;
    end if;

    -- PEOPLE / PLACES / OBJECTS / PRODUCTS ------------------------------------
    if v->'linked_entities'->'people'   is null or v->'linked_entities'->'places'   is null
    or v->'linked_entities'->'objects'  is null or v->'linked_entities'->'products' is null then
      raise notice 'PROOF FAIL: % is missing one of PEOPLE/PLACES/OBJECTS/PRODUCTS', t; ok := false;
    end if;

    -- WORK / GATES ------------------------------------------------------------
    if v->'linked_work' is null then
      raise notice 'PROOF FAIL: % returned no WORK section', t; ok := false;
    end if;
    if v->'linked_gates' is null then
      raise notice 'PROOF FAIL: % returned no GATES section', t; ok := false;
    end if;

    -- LAST CHAIRMAN CORRECTION ------------------------------------------------
    -- Always present. Absent a recorded correction it says so; it never guesses.
    if not (v ? 'last_chairman_correction') or v->'last_chairman_correction'->>'found' is null then
      raise notice 'PROOF FAIL: % returned no LAST CHAIRMAN CORRECTION section', t; ok := false;
    elsif v->'last_chairman_correction'->>'found' = 'false'
      and coalesce(v->'last_chairman_correction'->>'note','') = '' then
      raise notice 'PROOF FAIL: % has no Chairman correction and did not say so', t; ok := false;
    end if;

    -- LAST RESTART ------------------------------------------------------------
    if not (v ? 'last_restart') then
      raise notice 'PROOF FAIL: % returned no LAST RESTART section', t; ok := false;
    end if;

    -- SOURCE REFERENCES: the QYRIS trace names what was read, and what was not.
    if v->'qyris'->'tables_read' is null or jsonb_array_length(v->'qyris'->'tables_read') = 0 then
      raise notice 'PROOF FAIL: % returned no SOURCE REFERENCES / tables read', t; ok := false;
    end if;
    if v->'qyris'->'not_read' is null then
      raise notice 'PROOF FAIL: % did not declare what it left unread', t; ok := false;
    end if;

    -- The read path is returned as data, in the required order.
    if v->'read_path'->>0 <> 'NEWEST DELTAS' then
      raise notice 'PROOF FAIL: % did not return the read path starting at NEWEST DELTAS', t; ok := false;
    end if;

    -- An UNSEEDED topic refuses, and returns the question instead of a guess.
    if v->'topic_manifest'->>'canon_state' = 'UNSEEDED' then
      v_unseeded := v_unseeded + 1;
      if (v->'current_vs_superseded'->'current') is not null
         and jsonb_array_length(v->'current_vs_superseded'->'current') > 0 then
        raise notice 'PROOF FAIL: % is UNSEEDED but returned canon', t; ok := false;
      end if;
      -- The refusal travels in answer_rule, which the read returns for every topic.
      if v->>'answer_rule' is null or v->>'answer_rule' = '' then
        raise notice 'PROOF FAIL: % is UNSEEDED and returned no refusal at all', t; ok := false;
      end if;
      -- The rule must send the reader to the open question, not to canon. An
      -- UNSEEDED topic that returns the same rule as an answerable one is the
      -- exact failure this check exists for.
      if v->>'answer_rule' not like '%open question%' then
        raise notice 'PROOF FAIL: % is UNSEEDED but its answer rule does not send the reader to the open question: %',
          t, v->>'answer_rule'; ok := false;
      end if;
      if v->>'answer_rule' like 'Answer from current statements%' then
        raise notice 'PROOF FAIL: % is UNSEEDED but was given the answerable-topic rule', t; ok := false;
      end if;
      if not exists (select 1 from thy_omniview_questions q
                      where q.topic_key = thy_omniview_resolve_topic(t)
                        and q.state = 'OPEN' and q.is_next_better) then
        raise notice 'PROOF FAIL: % is UNSEEDED with no next-better question to settle it', t; ok := false;
      end if;
    else
      v_answered := v_answered + 1;
    end if;

  end loop;

  -- ALISTAIR specifically must NOT have been invented from its name.
  v := thy_omniview_topic('ALISTAIR', 5);
  if jsonb_array_length(coalesce(v->'current_vs_superseded'->'current','[]'::jsonb)) <> 0 then
    raise notice 'PROOF FAIL: ALISTAIR returned canon that no source in this repository supports'; ok := false;
  end if;

  -- SPORTS has evidence and still is not canon.
  v := thy_omniview_topic('SPORTS', 5);
  if not exists (select 1 from jsonb_array_elements(coalesce(v->'current_vs_superseded'->'current','[]'::jsonb)) s
                  where s->>'kind' = 'EVIDENCE') then
    raise notice 'PROOF FAIL: SPORTS did not return the surface evidence that does exist'; ok := false;
  end if;
  if exists (select 1 from jsonb_array_elements(coalesce(v->'current_vs_superseded'->'current','[]'::jsonb)) s
              where s->>'kind' = 'CANON') then
    raise notice 'PROOF FAIL: SPORTS returned CANON while its defining question is still open'; ok := false;
  end if;

  -- LAST CHAIRMAN CORRECTION is read from recorded supersession, not wording.
  -- A non-Chairman supersession must not register; a Chairman one must, and
  -- carry both the old and the new text.
  if thy_sequence_head() < 588 then
    raise notice 'PROOF FAIL: sequence head is below 588; the correction check has no sequence to enter on'; ok := false;
  else
    declare s_old bigint; s_mid bigint; begin
      perform thy_omniview_state_canon('STORE', 'Proof-only statement A.', 'REPO_VERIFIED', 'Build session', 588);
      select max(id) into s_old from thy_omniview_statements where topic_key = 'STORE';
      perform thy_omniview_state_canon('STORE', 'Proof-only statement B.', 'REPO_VERIFIED', 'Build session', 588, s_old);
      select max(id) into s_mid from thy_omniview_statements where topic_key = 'STORE';
      v := thy_omniview_topic('STORE', 5);
      if coalesce(v->'last_chairman_correction'->>'current_statement_id','') = s_mid::text then
        raise notice 'PROOF FAIL: a non-Chairman supersession was reported as a Chairman correction'; ok := false;
      end if;
      perform thy_omniview_state_canon('STORE', 'Proof-only statement C.', 'CHAIRMAN_ASSERTED', 'Chairman', 588, s_mid);
      v := thy_omniview_topic('STORE', 5);
      if v->'last_chairman_correction'->>'corrected_from' is distinct from 'Proof-only statement B.'
         or v->'last_chairman_correction'->>'corrected_to' is distinct from 'Proof-only statement C.' then
        raise notice 'PROOF FAIL: the Chairman correction was not returned as LAST CHAIRMAN CORRECTION: %',
          v->'last_chairman_correction'; ok := false;
      end if;
    end;
  end if;

  -- Aliases resolve to the same topic, so a read never misses on spelling.
  if thy_omniview_resolve_topic('time-run')   <> 'TIME RUN' then raise notice 'PROOF FAIL: time-run did not resolve'; ok := false; end if;
  if thy_omniview_resolve_topic('the castle') <> 'CASTLE'   then raise notice 'PROOF FAIL: the castle did not resolve'; ok := false; end if;
  if thy_omniview_resolve_topic('Alastair')   <> 'ALISTAIR' then raise notice 'PROOF FAIL: Alastair did not resolve'; ok := false; end if;
  if thy_omniview_resolve_topic('sport')      <> 'SPORTS'   then raise notice 'PROOF FAIL: sport did not resolve'; ok := false; end if;
  if thy_omniview_resolve_topic('shop')       <> 'STORE'    then raise notice 'PROOF FAIL: shop did not resolve'; ok := false; end if;

  if ok then
    raise notice 'PROOF PASS: FIVE NAMED TOPICS — TIME RUN, ALISTAIR, CASTLE, STORE and SPORTS each returned one read carrying authority, superseded state, people/places/objects/products, work, gates, last Chairman correction, last restart and source references; % answered from source and % refused with the question that would settle them', v_answered, v_unseeded;
  end if;
end $$;

rollback;
