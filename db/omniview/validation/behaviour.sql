-- OMNIVIEW behavioural checks.
-- Each block asks the database to do something the rules forbid. A rule that
-- does not reject is a rule that does not exist, so a caught exception is the
-- PASS and a successful statement is the FAIL.

-- Everything here runs inside one transaction that is rolled back, so the
-- behavioural checks never leave state behind for the proof tests.
begin;

create or replace function _expect_reject(p_name text, p_sql text, p_expect text default null)
returns void language plpgsql as $$
begin
  begin
    execute p_sql;
  exception when others then
    if p_expect is null or position(p_expect in sqlerrm) > 0 then
      raise notice 'EXPECT-REJECT PASS: % (%)', p_name, left(sqlerrm, 90);
    else
      raise notice 'EXPECT-REJECT FAIL: % rejected for the wrong reason: %', p_name, sqlerrm;
    end if;
    return;
  end;
  raise notice 'EXPECT-REJECT FAIL: % was ACCEPTED and should not have been', p_name;
end $$;

do $$
begin
  perform _expect_reject('ledger row cannot be edited',
    $q$ update thy_sequence_ledger set what_changed = 'rewritten' where sequence_no = 587 $q$,
    'SEQUENCE_LEDGER_IMMUTABLE');

  perform _expect_reject('ledger row cannot be deleted',
    $q$ delete from thy_sequence_ledger where sequence_no = 587 $q$,
    'SEQUENCE_LEDGER_IMMUTABLE');

  perform _expect_reject('sequence cannot skip the chain head',
    $q$ insert into thy_sequence_ledger (sequence_no, previous_sequence_no, occurred_utc, occurred_local,
        local_timezone, why_change_occurred, what_changed, why_it_changed, what_remained, authority,
        truth_class, next_better_question, restart_point)
        values (900, 587, now(), now()::timestamp, 'UTC','x','x','x','x','Chairman','WITNESSED','x','x') $q$,
    'SEQUENCE_CHAIN_BREAK');

  perform _expect_reject('sequence cannot go backwards',
    $q$ insert into thy_sequence_ledger (sequence_no, previous_sequence_no, occurred_utc, occurred_local,
        local_timezone, why_change_occurred, what_changed, why_it_changed, what_remained, authority,
        truth_class, next_better_question, restart_point)
        values (500, 588, now(), now()::timestamp, 'UTC','x','x','x','x','Chairman','WITNESSED','x','x') $q$,
    'SEQUENCE_REGRESSION');

  perform _expect_reject('a sequence cannot be recorded with a blank reason',
    $q$ insert into thy_sequence_ledger (sequence_no, previous_sequence_no, occurred_utc, occurred_local,
        local_timezone, why_change_occurred, what_changed, why_it_changed, what_remained, authority,
        truth_class, next_better_question, restart_point)
        values (589, 588, now(), now()::timestamp, 'UTC','   ','x','x','x','Chairman','WITNESSED','x','x') $q$,
    'check constraint');

  perform _expect_reject('an invented truth class is refused',
    $q$ insert into thy_sequence_ledger (sequence_no, previous_sequence_no, occurred_utc, occurred_local,
        local_timezone, why_change_occurred, what_changed, why_it_changed, what_remained, authority,
        truth_class, next_better_question, restart_point)
        values (589, 588, now(), now()::timestamp, 'UTC','x','x','x','x','Chairman','PROBABLY_TRUE','x','x') $q$,
    'check constraint');

  perform _expect_reject('canon cannot be edited in place',
    $q$ update thy_omniview_statements set body = 'rewritten'
         where topic_key = 'DASHBOARD' and status = 'CURRENT' $q$,
    'STATEMENT_IMMUTABLE');

  perform _expect_reject('canon cannot be deleted',
    $q$ delete from thy_omniview_statements where topic_key = 'DASHBOARD' $q$,
    'STATEMENT_IMMUTABLE');

  perform _expect_reject('canon cannot enter on a sequence that does not exist',
    $q$ select thy_omniview_state_canon('CASTLE','invented','WITNESSED','Chairman', 999) $q$,
    'UNKNOWN_SEQUENCE');

  perform _expect_reject('canon cannot be written for an unregistered topic',
    $q$ select thy_omniview_state_canon('ATLANTIS','invented','WITNESSED','Chairman', 588) $q$,
    'UNKNOWN_TOPIC');

  perform _expect_reject('a sequence cannot be linked to an unregistered topic',
    $q$ select thy_sequence_append(589, now()::timestamp,'UTC','x','x','x','x','Chairman','WITNESSED','x','x',
        '["ATLANTIS"]'::jsonb) $q$,
    'UNKNOWN_TOPIC');

  perform _expect_reject('a topic cannot hold two open next-better questions',
    $q$ insert into thy_omniview_questions (topic_key, question, is_next_better, entered_sequence_no)
        values ('CASTLE','second next-better question', true, 588) $q$,
    'unique');

  perform _expect_reject('a gate cannot be PASSED without the sequence that settled it',
    $q$ insert into thy_omniview_gates (gate_key, topic_key, requirement, gate_state, authority)
        values ('GATE-TEST-UNSETTLED','CASTLE','x','PASSED','Chairman') $q$,
    'check constraint');

  perform _expect_reject('a topic key must be upper case',
    $q$ insert into thy_omniview_topics (topic_key, display_name, topic_class, authority_lock)
        values ('castle lower','x','PLACE','CHAIRMAN') $q$,
    'check constraint');

  perform _expect_reject('an unknown link class is refused',
    $q$ insert into thy_omniview_links (topic_key, link_class, link_key, display_name, relation)
        values ('CASTLE','RUMOUR','x','x','x') $q$,
    'check constraint');
end $$;

-- Cross-topic supersession needs a live statement id, so it is checked separately.
do $$
declare v_id bigint;
begin
  select id into v_id from thy_omniview_statements where topic_key = 'STORE' and status = 'CURRENT' limit 1;
  perform _expect_reject('canon from one topic cannot be superseded by another topic',
    format($q$ select thy_omniview_state_canon('CASTLE','x','WITNESSED','Chairman',588,%s) $q$, v_id),
    'CROSS_TOPIC_SUPERSESSION');
end $$;

-- A superseded statement is frozen: even the supersession columns cannot move again.
do $$
declare v_new bigint; v_old bigint;
begin
  select id into v_old from thy_omniview_statements
   where topic_key = 'TIME RUN' and status = 'CURRENT' order by id limit 1;
  insert into thy_omniview_statements (topic_key, statement_kind, body, truth_class, authority, entered_sequence_no)
  values ('TIME RUN','CANON','replacement for the freeze check','WITNESSED','Chairman',588) returning id into v_new;
  update thy_omniview_statements
     set status='SUPERSEDED', superseded_by_id=v_new, superseded_sequence_no=588 where id=v_old;
  perform _expect_reject('a superseded statement is frozen',
    format($q$ update thy_omniview_statements set superseded_sequence_no = 587 where id = %s $q$, v_old),
    'STATEMENT_IMMUTABLE');
  raise notice 'EXPECT-REJECT PASS: supersession itself was accepted (old body preserved: %)',
    (select left(body, 40) from thy_omniview_statements where id = v_old);
end $$;

rollback;
