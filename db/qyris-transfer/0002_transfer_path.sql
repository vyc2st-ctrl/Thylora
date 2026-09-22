-- QYRIS TRANSFER · 0002 · The write path and the loop readback
-- Work: THY-WORK-TRANSFER-RECURSION-588
--
-- Every write returns the loop as it now stands, so a caller can never report a
-- transfer it did not actually make.

begin;

create or replace function thy_qyris_open(
  p_topic_key text,
  p_question  text,
  p_sequence_no bigint,
  p_parent_cycle_id bigint default null
) returns bigint language plpgsql set search_path = public as $$
declare
  v_key text := upper(btrim(p_topic_key));
  v_no  int;
  v_id  bigint;
begin
  select coalesce(max(cycle_no), 0) + 1 into v_no from thy_qyris_cycle where topic_key = v_key;

  if v_no > 1 and p_parent_cycle_id is null then
    raise exception
      'QYRIS_ORPHAN_CYCLE: topic % already has % cycles. A later cycle is created by transfer and must name its parent.',
      v_key, v_no - 1 using errcode = 'raise_exception';
  end if;

  insert into thy_qyris_cycle (topic_key, cycle_no, question, parent_cycle_id, entered_sequence_no)
  values (v_key, v_no, p_question, p_parent_cycle_id, p_sequence_no)
  returning cycle_id into v_id;

  -- Q is the question the cycle was opened with. It is recorded as a stage
  -- immediately, so a cycle can never exist without its own Q.
  insert into thy_qyris_stage (cycle_id, stage, stage_index, body, evidence)
  values (v_id, 'Q', 1, p_question, 'Opened at sequence ' || p_sequence_no);

  return v_id;
end $$;

create or replace function thy_qyris_record(
  p_cycle_id bigint,
  p_stage    text,
  p_body     text,
  p_evidence text
) returns jsonb language plpgsql set search_path = public as $$
declare v_stage text := upper(btrim(p_stage));
begin
  insert into thy_qyris_stage (cycle_id, stage, stage_index, body, evidence)
  values (p_cycle_id, v_stage, thy_qyris_stage_index(v_stage), p_body, p_evidence);
  return thy_qyris_loop(p_cycle_id);
end $$;

create or replace function thy_qyris_frontier_add(
  p_cycle_id bigint,
  p_item     text,
  p_item_kind text,
  p_raised_stage text
) returns bigint language plpgsql set search_path = public as $$
declare v_id bigint;
begin
  if exists (select 1 from thy_qyris_cycle where cycle_id = p_cycle_id and state <> 'OPEN') then
    raise exception
      'QYRIS_CYCLE_CLOSED: cycle % has already transferred. Raise this on the successor cycle.',
      p_cycle_id using errcode = 'raise_exception';
  end if;
  insert into thy_qyris_frontier (cycle_id, item, item_kind, raised_stage)
  values (p_cycle_id, p_item, upper(btrim(p_item_kind)), upper(btrim(p_raised_stage)))
  returning id into v_id;
  return v_id;
end $$;

-- Closing a frontier item is always explicit and always states why.
create or replace function thy_qyris_frontier_close(p_id bigint, p_reason text)
returns jsonb language plpgsql set search_path = public as $$
declare v_cycle bigint;
begin
  if p_reason is null or length(btrim(p_reason)) = 0 then
    raise exception
      'QYRIS_FRONTIER_SILENT_CLOSE: frontier item % cannot be closed without a reason.', p_id
      using errcode = 'raise_exception';
  end if;
  update thy_qyris_frontier
     set state = 'CLOSED', closed_reason = p_reason
   where id = p_id and state = 'OPEN'
   returning cycle_id into v_cycle;
  if v_cycle is null then
    raise exception
      'QYRIS_FRONTIER_NOT_OPEN: frontier item % is not open; it was already carried or closed.', p_id
      using errcode = 'raise_exception';
  end if;
  return thy_qyris_loop(v_cycle);
end $$;

-- TRANSFER --------------------------------------------------------------------
-- The whole point. A cycle closes by creating the next context, and the next
-- context inherits every item the cycle left open.
create or replace function thy_qyris_transfer(
  p_cycle_id     bigint,
  p_next_question text,
  p_sequence_no  bigint,
  p_transfer_note text default null
) returns jsonb language plpgsql set search_path = public as $$
declare
  v_cycle   thy_qyris_cycle;
  v_next_id bigint;
  v_carried int := 0;
  v_missing int;
  r record;
begin
  select * into v_cycle from thy_qyris_cycle where cycle_id = p_cycle_id;
  if v_cycle.cycle_id is null then
    raise exception 'QYRIS_UNKNOWN_CYCLE: cycle % does not exist.', p_cycle_id
      using errcode = 'raise_exception';
  end if;
  if v_cycle.state <> 'OPEN' then
    raise exception
      'QYRIS_ALREADY_TRANSFERRED: cycle % is %. A cycle transfers once.', p_cycle_id, v_cycle.state
      using errcode = 'raise_exception';
  end if;

  -- The loop must actually have run. Transferring out of a cycle that never
  -- reached S would hand the next context a question with no ground under it.
  select count(*) into v_missing
    from (values ('Q'),('Y'),('R'),('I'),('S')) s(stage)
   where not exists (select 1 from thy_qyris_stage x where x.cycle_id = p_cycle_id and x.stage = s.stage);
  if v_missing > 0 then
    raise exception
      'QYRIS_INCOMPLETE_LOOP: cycle % has % of Q,Y,R,I,S unrecorded. Transfer is the sixth stage, not the second.',
      p_cycle_id, v_missing using errcode = 'raise_exception';
  end if;

  if p_next_question is null or length(btrim(p_next_question)) = 0 then
    raise exception
      'QYRIS_NO_NEXT_CONTEXT: cycle % cannot transfer without a next question. Transfer creates the next context; if there is none, terminate the cycle with a reason instead.',
      p_cycle_id using errcode = 'raise_exception';
  end if;

  -- T is recorded before the cycle closes, while stages are still writable.
  insert into thy_qyris_stage (cycle_id, stage, stage_index, body, evidence)
  values (p_cycle_id, 'T', 6,
          coalesce(p_transfer_note, 'Transferred to the next context at sequence ' || p_sequence_no),
          'Successor cycle created by thy_qyris_transfer at sequence ' || p_sequence_no)
  on conflict (cycle_id, stage) do nothing;

  -- Q' becomes the Q of the successor.
  v_next_id := thy_qyris_open(v_cycle.topic_key, p_next_question, p_sequence_no, p_cycle_id);

  -- PRESERVE OPEN FRONTIER: every open item is copied into the successor and the
  -- original is marked CARRIED with the cycle that inherited it.
  for r in select * from thy_qyris_frontier where cycle_id = p_cycle_id and state = 'OPEN' order by id loop
    insert into thy_qyris_frontier (cycle_id, item, item_kind, raised_stage, carried_from_id)
    values (v_next_id, r.item, r.item_kind, r.raised_stage, r.id);

    update thy_qyris_frontier
       set state = 'CARRIED', carried_to_cycle_id = v_next_id
     where id = r.id;

    v_carried := v_carried + 1;
  end loop;

  update thy_qyris_cycle
     set state = 'TRANSFERRED', closed_at = now()
   where cycle_id = p_cycle_id;

  -- The guard, after the fact: nothing may be left OPEN on a transferred cycle.
  if exists (select 1 from thy_qyris_frontier where cycle_id = p_cycle_id and state = 'OPEN') then
    raise exception
      'QYRIS_FRONTIER_DROPPED: cycle % transferred with open frontier items still unaccounted for.',
      p_cycle_id using errcode = 'raise_exception';
  end if;

  return jsonb_build_object(
    'transferred_from', p_cycle_id,
    'next_cycle_id',    v_next_id,
    'next_question',    p_next_question,
    'frontier_carried', v_carried,
    'law', jsonb_build_array(
      'TRANSFER CREATES THE NEXT CONTEXT: cycle ' || p_cycle_id || ' closed by opening cycle ' || v_next_id || '.',
      'PRESERVE OPEN FRONTIER: ' || v_carried || ' open item(s) were carried forward; none were dropped.'),
    'loop',        thy_qyris_loop(p_cycle_id),
    'next_context',thy_qyris_loop(v_next_id));
end $$;

-- TERMINATE -------------------------------------------------------------------
-- The only way a chain ends without a successor, and it must say why, and it
-- cannot leave anything open.
create or replace function thy_qyris_terminate(
  p_cycle_id bigint, p_reason text
) returns jsonb language plpgsql set search_path = public as $$
declare v_open int;
begin
  if p_reason is null or length(btrim(p_reason)) = 0 then
    raise exception 'QYRIS_SILENT_TERMINATION: cycle % cannot end without a stated reason.', p_cycle_id
      using errcode = 'raise_exception';
  end if;

  select count(*) into v_open from thy_qyris_frontier where cycle_id = p_cycle_id and state = 'OPEN';
  if v_open > 0 then
    raise exception
      'QYRIS_FRONTIER_OPEN: cycle % has % open frontier item(s). Carry them into a successor or close each one with a reason; a chain does not end on an open frontier.',
      p_cycle_id, v_open using errcode = 'raise_exception';
  end if;

  update thy_qyris_cycle
     set state = 'TERMINAL', terminal_reason = p_reason, closed_at = now()
   where cycle_id = p_cycle_id and state = 'OPEN';

  if not found then
    raise exception 'QYRIS_NOT_OPEN: cycle % is not open.', p_cycle_id using errcode = 'raise_exception';
  end if;
  return thy_qyris_loop(p_cycle_id);
end $$;

commit;
