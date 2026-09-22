-- QYRIS TRANSFER · 0003 · The loop readback
-- Work: THY-WORK-TRANSFER-RECURSION-588
--
-- VISIBLE QYRIS. The loop is not a log that has to be reconstructed: one read
-- returns the six stages in order, the frontier with where each item went, and
-- the chain this cycle sits in.

begin;

create or replace function thy_qyris_loop(p_cycle_id bigint)
returns jsonb language plpgsql stable set search_path = public as $$
declare
  v_cycle    thy_qyris_cycle;
  v_stages   jsonb;
  v_frontier jsonb;
  v_next     jsonb;
begin
  select * into v_cycle from thy_qyris_cycle where cycle_id = p_cycle_id;
  if v_cycle.cycle_id is null then
    return jsonb_build_object('found', false, 'cycle_id', p_cycle_id,
      'answer', 'No such QYRIS cycle. An unopened cycle is not an empty one.');
  end if;

  -- The six stages, always in loop order, with the ones not yet reached named
  -- rather than omitted — an absent stage is information.
  select jsonb_agg(
           jsonb_build_object(
             'stage',    o->>'stage',
             'index',    (o->>'index')::int,
             'name',     o->>'name',
             'asks',     o->>'asks',
             'recorded', s.stage is not null,
             'body',     s.body,
             'evidence', s.evidence)
           order by (o->>'index')::int)
    into v_stages
    from jsonb_array_elements(thy_qyris_stage_order()) o
    left join thy_qyris_stage s
      on s.cycle_id = p_cycle_id and s.stage = o->>'stage';

  select coalesce(jsonb_agg(jsonb_build_object(
           'id', f.id, 'item', f.item, 'kind', f.item_kind,
           'raised_at_stage', f.raised_stage, 'state', f.state,
           'carried_to_cycle_id', f.carried_to_cycle_id,
           'carried_from_id', f.carried_from_id,
           'closed_reason', f.closed_reason) order by f.id), '[]'::jsonb)
    into v_frontier
    from thy_qyris_frontier f where f.cycle_id = p_cycle_id;

  select jsonb_build_object('cycle_id', n.cycle_id, 'cycle_no', n.cycle_no, 'question', n.question)
    into v_next
    from thy_qyris_cycle n where n.parent_cycle_id = p_cycle_id;

  return jsonb_build_object(
    'found',       true,
    'cycle_id',    v_cycle.cycle_id,
    'cycle_no',    v_cycle.cycle_no,
    'topic_key',   v_cycle.topic_key,
    'question',    v_cycle.question,
    'state',       v_cycle.state,
    'terminal_reason', v_cycle.terminal_reason,
    'entered_sequence_no', v_cycle.entered_sequence_no,
    'parent_cycle_id', v_cycle.parent_cycle_id,
    'loop',        'Q -> Y -> R -> I -> S -> T -> Q''',
    'stages',      v_stages,
    'stages_recorded', (select count(*) from thy_qyris_stage where cycle_id = p_cycle_id),
    'frontier',    v_frontier,
    'frontier_counts', jsonb_build_object(
      'open',    (select count(*) from thy_qyris_frontier where cycle_id = p_cycle_id and state = 'OPEN'),
      'carried', (select count(*) from thy_qyris_frontier where cycle_id = p_cycle_id and state = 'CARRIED'),
      'closed',  (select count(*) from thy_qyris_frontier where cycle_id = p_cycle_id and state = 'CLOSED')),
    'next_context', coalesce(v_next, jsonb_build_object(
      'cycle_id', null,
      'note', case v_cycle.state
                when 'OPEN'     then 'This cycle has not transferred yet. Until it does, there is no next context.'
                when 'TERMINAL' then 'This chain ends here, on the record: ' || coalesce(v_cycle.terminal_reason,'')
                else 'Transferred, but no successor was found — this state should be impossible.' end)),
    'law', jsonb_build_array(
      'TRANSFER CREATES THE NEXT CONTEXT',
      'PRESERVE OPEN FRONTIER'));
end $$;

-- THE CHAIN -------------------------------------------------------------------
-- The recursion itself: every cycle on a topic, in order, with the frontier that
-- survived each transfer. This is the answer to "how did we get to this question".
create or replace function thy_qyris_chain(p_topic_key text, p_limit int default 50)
returns jsonb language plpgsql stable set search_path = public as $$
declare
  v_key   text := upper(btrim(p_topic_key));
  v_cycles jsonb;
  v_head  thy_qyris_cycle;
  v_orphans jsonb;
begin
  select coalesce(jsonb_agg(jsonb_build_object(
           'cycle_id', c.cycle_id,
           'cycle_no', c.cycle_no,
           'question', c.question,
           'state',    c.state,
           'entered_sequence_no', c.entered_sequence_no,
           'stages_recorded', (select count(*) from thy_qyris_stage s where s.cycle_id = c.cycle_id),
           'frontier_open',   (select count(*) from thy_qyris_frontier f where f.cycle_id = c.cycle_id and f.state = 'OPEN'),
           'frontier_carried_in', (select count(*) from thy_qyris_frontier f
                                    where f.cycle_id = c.cycle_id and f.carried_from_id is not null))
           order by c.cycle_no), '[]'::jsonb)
    into v_cycles
    from (select * from thy_qyris_cycle where topic_key = v_key order by cycle_no desc limit greatest(p_limit,1)) c;

  select * into v_head from thy_qyris_cycle
   where topic_key = v_key and state = 'OPEN' order by cycle_no desc limit 1;

  -- Anything still open anywhere on this topic. A frontier item left open on an
  -- older cycle is the shape of a dropped thread, so it is surfaced by name.
  select coalesce(jsonb_agg(jsonb_build_object(
           'cycle_id', f.cycle_id, 'item', f.item, 'kind', f.item_kind) order by f.id), '[]'::jsonb)
    into v_orphans
    from thy_qyris_frontier f
    join thy_qyris_cycle c on c.cycle_id = f.cycle_id
   where c.topic_key = v_key and f.state = 'OPEN' and c.state <> 'OPEN';

  return jsonb_build_object(
    'topic_key',  v_key,
    'cycle_count',(select count(*) from thy_qyris_cycle where topic_key = v_key),
    'cycles',     v_cycles,
    'head',       case when v_head.cycle_id is null then null else thy_qyris_loop(v_head.cycle_id) end,
    'open_frontier', (select coalesce(jsonb_agg(jsonb_build_object(
                        'item', f.item, 'kind', f.item_kind, 'cycle_id', f.cycle_id) order by f.id), '[]'::jsonb)
                       from thy_qyris_frontier f
                       join thy_qyris_cycle c on c.cycle_id = f.cycle_id
                      where c.topic_key = v_key and f.state = 'OPEN'),
    'stranded_frontier', v_orphans,
    'answer', case
      when v_head.cycle_id is not null
        then 'The live question on ' || v_key || ' is: ' || v_head.question
      when exists (select 1 from thy_qyris_cycle where topic_key = v_key)
        then 'No cycle is open on ' || v_key || '. The chain is closed on the record.'
      else 'No QYRIS cycle has ever been opened on ' || v_key || '.' end);
end $$;

commit;
