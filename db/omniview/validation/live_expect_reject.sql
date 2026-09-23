-- OMNIVIEW · live expect-reject suite (THY-WORK-OMNIVIEW-LIVE-APPLY-591)
--
-- Safe to run on thylora-dash. Every case is an attempt that must FAIL; each runs
-- in its own subtransaction and is rolled back by the failure itself. Nothing is
-- created outside pg_temp, and no auth.users or role rows are written: access is
-- checked by setting request.jwt.claim.sub for the length of the transaction to
-- (a) a random uuid that holds no role and (b) the existing Chairman user id.
-- Output: one line per case, PASS or FAIL, as the result set.

create or replace function pg_temp._reject(p_name text, p_sql text, p_expect text)
returns text language plpgsql as $$
begin
  begin
    execute p_sql;
  exception when others then
    if position(p_expect in sqlerrm) > 0 then
      return 'PASS | ' || p_name || ' | ' || left(sqlerrm, 90);
    end if;
    return 'FAIL | ' || p_name || ' | wrong error: ' || left(sqlerrm, 90);
  end;
  return 'FAIL | ' || p_name || ' | was ACCEPTED';
end $$;
grant execute on function pg_temp._reject(text,text,text) to anon, authenticated;

create temp table _results (n serial, line text);
grant insert, select on _results to anon, authenticated;
grant usage on sequence _results_n_seq to anon, authenticated;

do $$
declare v_id bigint; v_chair uuid; n bigint; m jsonb; pc jsonb;
begin
  insert into _results(line) select pg_temp._reject('ledger row cannot be edited',
    $q$ update thy_sequence_ledger set what_changed = 'rewritten' where sequence_no = 587 $q$, 'SEQUENCE_LEDGER_IMMUTABLE');
  insert into _results(line) select pg_temp._reject('ledger row cannot be deleted',
    $q$ delete from thy_sequence_ledger where sequence_no = 587 $q$, 'SEQUENCE_LEDGER_IMMUTABLE');
  insert into _results(line) select pg_temp._reject('sequence must point at the chain head',
    $q$ insert into thy_sequence_ledger (sequence_no, previous_sequence_no, occurred_utc, occurred_local,
        local_timezone, why_change_occurred, what_changed, why_it_changed, what_remained, authority,
        truth_class, next_better_question, restart_point)
        values (9000, null, now(), now()::timestamp, 'UTC','x','x','x','x','Chairman','WITNESSED','x','x') $q$, 'SEQUENCE_CHAIN_BREAK');
  insert into _results(line) select pg_temp._reject('sequence cannot go backwards',
    $q$ insert into thy_sequence_ledger (sequence_no, previous_sequence_no, occurred_utc, occurred_local,
        local_timezone, why_change_occurred, what_changed, why_it_changed, what_remained, authority,
        truth_class, next_better_question, restart_point)
        values (500, (select max(sequence_no) from thy_sequence_ledger), now(), now()::timestamp, 'UTC','x','x','x','x','Chairman','WITNESSED','x','x') $q$, 'SEQUENCE_REGRESSION');
  insert into _results(line) select pg_temp._reject('a sequence cannot be recorded with a blank reason',
    $q$ insert into thy_sequence_ledger (sequence_no, previous_sequence_no, occurred_utc, occurred_local,
        local_timezone, why_change_occurred, what_changed, why_it_changed, what_remained, authority,
        truth_class, next_better_question, restart_point)
        values (9000, (select max(sequence_no) from thy_sequence_ledger), now(), now()::timestamp, 'UTC','   ','x','x','x','Chairman','WITNESSED','x','x') $q$, 'check constraint');
  insert into _results(line) select pg_temp._reject('an invented truth class is refused',
    $q$ insert into thy_sequence_ledger (sequence_no, previous_sequence_no, occurred_utc, occurred_local,
        local_timezone, why_change_occurred, what_changed, why_it_changed, what_remained, authority,
        truth_class, next_better_question, restart_point)
        values (9000, (select max(sequence_no) from thy_sequence_ledger), now(), now()::timestamp, 'UTC','x','x','x','x','Chairman','PROBABLY_TRUE','x','x') $q$, 'check constraint');
  insert into _results(line) select pg_temp._reject('canon cannot be edited in place',
    $q$ update thy_omniview_statements set body = 'rewritten' where topic_key = 'DASHBOARD' and status = 'CURRENT' $q$, 'STATEMENT_IMMUTABLE');
  insert into _results(line) select pg_temp._reject('canon cannot be deleted',
    $q$ delete from thy_omniview_statements where topic_key = 'DASHBOARD' $q$, 'STATEMENT_IMMUTABLE');
  insert into _results(line) select pg_temp._reject('canon cannot enter on a sequence that does not exist',
    $q$ select thy_omniview_state_canon('STORE','x','WITNESSED','Chairman', 9999) $q$, 'UNKNOWN_SEQUENCE');
  insert into _results(line) select pg_temp._reject('canon cannot be written for an unregistered topic',
    $q$ select thy_omniview_state_canon('ATLANTIS','invented','WITNESSED','Chairman', 587) $q$, 'UNKNOWN_TOPIC');
  insert into _results(line) select pg_temp._reject('a sequence cannot be linked to an unregistered topic',
    $q$ select thy_sequence_append(9000, now()::timestamp,'UTC','x','x','x','x','Chairman','WITNESSED','x','x','["ATLANTIS"]'::jsonb) $q$, 'UNKNOWN_TOPIC');
  insert into _results(line) select pg_temp._reject('a topic cannot hold two open next-better questions',
    $q$ insert into thy_omniview_questions (topic_key, question, is_next_better, entered_sequence_no)
        values ('CASTLE','second next-better question', true, 587) $q$, 'duplicate key');
  insert into _results(line) select pg_temp._reject('a gate cannot be PASSED without the sequence that settled it',
    $q$ insert into thy_omniview_gates (gate_key, topic_key, requirement, gate_state, authority)
        values ('GATE-X','CASTLE','x','PASSED','Chairman') $q$, 'check constraint');
  insert into _results(line) select pg_temp._reject('a topic key must be upper case',
    $q$ insert into thy_omniview_topics (topic_key, display_name, topic_class, authority_lock)
        values ('castle lower','x','PLACE','CHAIRMAN') $q$, 'check constraint');
  insert into _results(line) select pg_temp._reject('an unknown link class is refused',
    $q$ insert into thy_omniview_links (topic_key, link_class, link_key, display_name, relation)
        values ('CASTLE','RUMOUR','x','x','x') $q$, 'check constraint');
  select id into v_id from thy_omniview_statements where topic_key = 'STORE' and status = 'CURRENT' limit 1;
  insert into _results(line) select pg_temp._reject('canon from one topic cannot be superseded by another topic',
    format($q$ select thy_omniview_state_canon('CASTLE','x','WITNESSED','Chairman',587,%s) $q$, v_id), 'CROSS_TOPIC_SUPERSESSION');

  -- ACCESS -------------------------------------------------------------------
  -- (a) signed in, holds no THYLORA role
  perform set_config('request.jwt.claim.sub', gen_random_uuid()::text, true);
  set local role authenticated;
  select count(*) into n from thy_sequence_ledger;
  insert into _results(line) values (case when n = 0 then 'PASS' else 'FAIL' end
    || ' | a non-Chairman session reads 0 ledger rows | read ' || n);
  m := thy_omniview_manifest(3);
  insert into _results(line) values (case when jsonb_array_length(m->'topic_manifest') = 0 then 'PASS' else 'FAIL' end
    || ' | a non-Chairman manifest read returns no topics | topics ' || jsonb_array_length(m->'topic_manifest'));
  pc := thy_sequence_prior_context(5);
  insert into _results(line) values (case when jsonb_array_length(pc->'rows') = 0 then 'PASS' else 'FAIL' end
    || ' | a non-Chairman session reads no carryforward messages through OMNIVIEW | rows ' || jsonb_array_length(pc->'rows'));
  insert into _results(line) select pg_temp._reject('a signed-in client cannot call the write path',
    $q$ select thy_sequence_append(9000, now()::timestamp,'UTC','x','x','x','x','Chairman','WITNESSED','x','x') $q$, 'permission denied');
  insert into _results(line) select pg_temp._reject('a signed-in client cannot insert into the ledger directly',
    $q$ insert into thy_sequence_ledger (sequence_no, previous_sequence_no, occurred_utc, occurred_local,
        local_timezone, why_change_occurred, what_changed, why_it_changed, what_remained, authority,
        truth_class, next_better_question, restart_point)
        values (9000, 591, now(), now()::timestamp, 'UTC','x','x','x','x','Chairman','WITNESSED','x','x') $q$, 'permission denied');
  reset role;

  -- (b) the Chairman of record (read only)
  select user_id into v_chair from thylora_user_roles where role = 'chairman' limit 1;
  perform set_config('request.jwt.claim.sub', v_chair::text, true);
  set local role authenticated;
  select count(*) into n from thy_sequence_ledger;
  insert into _results(line) values (case when n > 0 then 'PASS' else 'FAIL' end
    || ' | the Chairman reads the ledger | rows ' || n);
  m := thy_omniview_manifest(3);
  insert into _results(line) values (case when jsonb_array_length(m->'topic_manifest') > 0 then 'PASS' else 'FAIL' end
    || ' | the Chairman manifest read returns topics | topics ' || jsonb_array_length(m->'topic_manifest'));
  insert into _results(line) select pg_temp._reject('even the Chairman session cannot call the write path from a client',
    $q$ select thy_omniview_state_canon('STORE','x','WITNESSED','Chairman',587) $q$, 'permission denied');
  reset role;

  -- (c) signed out
  set local role anon;
  insert into _results(line) select pg_temp._reject('a signed-out caller cannot run the read model',
    $q$ select thy_omniview_manifest(3) $q$, 'permission denied');
  insert into _results(line) select pg_temp._reject('a signed-out caller cannot read the ledger table',
    $q$ select count(*) from thy_sequence_ledger $q$, 'permission denied');
  insert into _results(line) select pg_temp._reject('a signed-out caller cannot read carryforward through OMNIVIEW',
    $q$ select thy_sequence_prior_context(5) $q$, 'permission denied');
  reset role;
end $$;

select line from _results order by n;
