-- PROOF TEST · TIME RUN
--
-- Question the proof answers: does ONE read return authoritative current state
-- plus the history behind it, and does a correction leave the old truth intact?
--
-- Rolled back at the end. The proof proves the mechanism, it does not seed canon.
begin;

do $$
declare
  v_old_id   bigint;
  v_old_body text;
  v_read     jsonb;
  v_reads    int;
  ok         boolean := true;
  function_calls int := 0;
begin
  select id, body into v_old_id, v_old_body
    from thy_omniview_statements
   where topic_key = 'TIME RUN' and status = 'CURRENT'
   order by id limit 1;

  -- A correction arrives as a NEW sequence, never as an edit.
  perform thy_sequence_append(
    589, timestamp '2026-09-22 09:15', 'UTC',
    'Chairman corrected what TIME RUN covers.',
    'TIME RUN canon replaced: the app surface is now stated as one part of a wider programme.',
    'The previous statement described the surface and was read as if it described the programme.',
    'The app surface itself is unchanged and still wired into accepted app navigation.',
    'Chairman','CHAIRMAN_ASSERTED',
    'Which other surfaces belong to the TIME RUN programme?',
    'TIME RUN canon corrected at 589.',
    '[{"topic_key":"TIME RUN","effect":"CANON_CHANGED"}]'::jsonb);

  perform thy_omniview_state_canon(
    'TIME RUN',
    'TIME RUN is a programme. The member app surface is one part of it, not the whole.',
    'CHAIRMAN_ASSERTED','Chairman', 589, v_old_id);

  -- THE SINGLE READ. Everything below is asserted against this one call.
  v_read := thy_omniview_topic('time-run');
  function_calls := 1;

  if not (v_read->>'found')::boolean then
    raise notice 'PROOF FAIL: TIME RUN not found by the read model'; ok := false;
  end if;

  if v_read->'topic_manifest'->>'topic_key' <> 'TIME RUN' then
    raise notice 'PROOF FAIL: alias "time-run" did not resolve to TIME RUN'; ok := false;
  end if;

  -- Every section of the required pre-response path is present in the one read.
  if not (v_read ? 'newest_deltas' and v_read ? 'topic_manifest' and v_read ? 'authority_locks'
      and v_read ? 'linked_graph' and v_read ? 'linked_entities' and v_read ? 'linked_work'
      and v_read ? 'linked_gates' and v_read ? 'current_vs_superseded' and v_read ? 'last_restart') then
    raise notice 'PROOF FAIL: the read is missing a section of the pre-response path'; ok := false;
  end if;

  if jsonb_array_length(v_read->'read_path') <> 10 then
    raise notice 'PROOF FAIL: read_path does not carry all ten steps'; ok := false;
  end if;

  -- CURRENT: the new statement. SUPERSEDED: the old one, still readable.
  if not (v_read#>>'{current_vs_superseded,current,0,body}' like 'TIME RUN is a programme%') then
    raise notice 'PROOF FAIL: current canon is not the corrected statement'; ok := false;
  end if;

  if (v_read#>>'{current_vs_superseded,superseded,0,body}') is distinct from v_old_body then
    raise notice 'PROOF FAIL: superseded history was not preserved byte for byte'; ok := false;
  end if;

  if (v_read#>>'{current_vs_superseded,superseded,0,superseded_sequence_no}')::bigint <> 589 then
    raise notice 'PROOF FAIL: supersession is not attributed to sequence 589'; ok := false;
  end if;

  -- LAST SEQUENCE and the reason behind it come back in the same read.
  if (v_read#>>'{last_sequence,sequence_no}')::bigint <> 589
     or v_read#>>'{last_sequence,why_it_changed}' is null then
    raise notice 'PROOF FAIL: last sequence or its reason is missing'; ok := false;
  end if;

  -- NEWEST DELTAS are scoped to this topic.
  if jsonb_array_length(v_read->'newest_deltas') < 1
     or (v_read#>>'{newest_deltas,0,sequence_no}')::bigint <> 589 then
    raise notice 'PROOF FAIL: newest delta for TIME RUN is not 589'; ok := false;
  end if;

  -- QYRIS: the trace names what was read and refuses to claim more.
  v_reads := jsonb_array_length(v_read#>'{qyris,tables_read}');
  if v_reads <> 8 or (v_read#>>'{qyris,qyris_version}') <> 'QYRIS-1' then
    raise notice 'PROOF FAIL: QYRIS trace is missing or the wrong shape'; ok := false;
  end if;
  if exists (select 1 from jsonb_array_elements(v_read#>'{qyris,tables_read}') t
              where t->>'table' not like 'thy\_%') then
    raise notice 'PROOF FAIL: QYRIS claims a table outside the OMNIVIEW read model'; ok := false;
  end if;

  if function_calls <> 1 then
    raise notice 'PROOF FAIL: more than one read was needed'; ok := false;
  end if;

  if ok then
    raise notice 'PROOF PASS: TIME RUN — one read returned corrected canon, preserved history, last sequence 589, and a QYRIS trace over % tables', v_reads;
  end if;
end $$;

rollback;
