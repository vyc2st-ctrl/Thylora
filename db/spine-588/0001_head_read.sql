-- SPINE 588 · 0001 · The head read
-- Work: THY-WORK-DASHBOARD-INTERACTION-CLOSEOUT-562 / THY-WORK-DYNAMIC-GATE-LAW-588
--
-- The dashboard has to surface four things: TOPIC CONTEXT, SEQUENCE LEDGER,
-- CURRENT GATES and NEXT QUESTION. Three of them already have a read; the fourth
-- did not exist, because "the next question" lived in three different places —
-- the next-better question on a topic, the open QYRIS frontier, and whatever gate
-- is currently blocking.
--
-- This read joins them and, crucially, ORDERS them. A blocking gate outranks a
-- curiosity. The surface does not get to choose which one to show.
--
-- Every join is guarded with to_regclass, so this pack applies whether or not the
-- other packs are present and says plainly which ones it could not read. A
-- missing pack is reported, never silently treated as "nothing to report".

begin;

create or replace function thy_spine_next_question(p_limit int default 8)
returns jsonb language plpgsql stable set search_path = public as $$
declare
  v_rows     jsonb := '[]'::jsonb;
  v_not_read jsonb := '[]'::jsonb;
  v_top      jsonb;
begin
  -- 1. BLOCKING GATES outrank everything. A question you cannot act on because a
  --    gate is shut is not the next question; the gate is.
  if to_regclass('public.thy_gate_law') is null then
    v_not_read := v_not_read || to_jsonb('thy_gate_law (db/gate-law/ not applied): blocking gates were not read'::text);
  else
    v_rows := v_rows || (
      select coalesce(jsonb_agg(jsonb_build_object(
               'rank', 1, 'source', 'GATE', 'ref', c.gate_key, 'topic_key', c.topic_key,
               'question', 'What clears ' || c.gate_key || '? ' || c.readback,
               'why_it_matters', c.state_reason) order by c.gate_key), '[]'::jsonb)
        from thy_gate_law c
       where c.version = (select max(v.version) from thy_gate_law v where v.gate_key = c.gate_key)
         and c.gate_state = 'BLOCKED');
  end if;

  -- 2. THE OPEN QYRIS FRONTIER. These are things a previous cycle raised and did
  --    not settle, which is exactly what a next question is made of.
  if to_regclass('public.thy_qyris_frontier') is null then
    v_not_read := v_not_read || to_jsonb('thy_qyris_frontier (db/qyris-transfer/ not applied): the open frontier was not read'::text);
  else
    v_rows := v_rows || (
      select coalesce(jsonb_agg(jsonb_build_object(
               'rank', 2, 'source', 'FRONTIER', 'ref', 'cycle ' || f.cycle_id,
               'topic_key', c.topic_key,
               'question', f.item,
               'why_it_matters', 'Raised at stage ' || f.raised_stage || ' of a QYRIS cycle and carried forward unresolved.')
               order by f.id), '[]'::jsonb)
        from thy_qyris_frontier f
        join thy_qyris_cycle c on c.cycle_id = f.cycle_id
       where f.state = 'OPEN' and f.item_kind in ('QUESTION','UNKNOWN','RISK'));
  end if;

  -- 3. THE NEXT-BETTER QUESTION PER TOPIC.
  if to_regclass('public.thy_omniview_questions') is null then
    v_not_read := v_not_read || to_jsonb('thy_omniview_questions (db/omniview/ not applied): topic questions were not read'::text);
  else
    v_rows := v_rows || (
      select coalesce(jsonb_agg(jsonb_build_object(
               'rank', 3, 'source', 'TOPIC', 'ref', q.topic_key, 'topic_key', q.topic_key,
               'question', q.question, 'why_it_matters', q.why_it_matters)
               order by q.topic_key), '[]'::jsonb)
        from thy_omniview_questions q
       where q.state = 'OPEN' and q.is_next_better);
  end if;

  select jsonb_agg(x order by (x->>'rank')::int, x->>'ref')
    into v_rows from jsonb_array_elements(v_rows) x;
  v_rows := coalesce(v_rows, '[]'::jsonb);

  v_top := case when jsonb_array_length(v_rows) > 0 then v_rows->0 else null end;

  return jsonb_build_object(
    'next_question', case when v_top is null
      then jsonb_build_object('question',
             'No blocking gate, no open frontier item and no next-better question is recorded. '
             'That is either a finished spine or an unread one — check not_read below before believing it.',
           'source','NONE')
      else v_top end,
    'queue',      (select coalesce(jsonb_agg(x), '[]'::jsonb)
                     from (select x from jsonb_array_elements(v_rows) x limit greatest(p_limit,1)) s),
    'total',      jsonb_array_length(v_rows),
    'not_read',   v_not_read,
    'ordering',   'A blocking gate outranks an open frontier item, which outranks a topic question. The surface does not choose.');
end $$;

-- THE HEAD --------------------------------------------------------------------
-- One read for the four surfaces the dashboard must carry.
create or replace function thy_spine_head(p_topic_limit int default 40, p_ledger_limit int default 12)
returns jsonb language plpgsql stable set search_path = public as $$
declare
  v_context jsonb := null;
  v_ledger  jsonb := null;
  v_gates   jsonb := null;
  v_next    jsonb;
  v_missing jsonb := '[]'::jsonb;
  v_head    bigint := null;
begin
  if to_regclass('public.thy_omniview_topics') is null then
    v_missing := v_missing || to_jsonb('db/omniview/ is not applied: TOPIC CONTEXT and SEQUENCE LEDGER are unavailable'::text);
  else
    v_context := thy_omniview_manifest(p_ledger_limit);
    v_ledger  := thy_sequence_ledger_page(p_ledger_limit);
    execute 'select max(sequence_no) from thy_sequence_ledger' into v_head;
  end if;

  if to_regclass('public.thy_gate_law') is null then
    v_missing := v_missing || to_jsonb('db/gate-law/ is not applied: CURRENT GATES is unavailable'::text);
  else
    v_gates := thy_gate_law_readback();
  end if;

  v_next := thy_spine_next_question(8);

  return jsonb_build_object(
    'surfaces',       jsonb_build_array('TOPIC CONTEXT','SEQUENCE LEDGER','CURRENT GATES','NEXT QUESTION'),
    'sequence_head',  v_head,
    'topic_context',  v_context,
    'sequence_ledger',v_ledger,
    'current_gates',  v_gates,
    'next_question',  v_next,
    'milestone',      case when to_regclass('public.thy_milestone_reading') is null
                           then jsonb_build_object('comparable', false,
                                  'reason','db/milestone-874/ is not applied.')
                           else thy_milestone_compare(874, 588) end,
    'not_applied',    v_missing,
    'read_at_utc',    to_char(now() at time zone 'utc','YYYY-MM-DD"T"HH24:MI:SS"Z"'));
end $$;

do $$ begin
  if to_regclass('public.thy_spine_head') is null then null; end if;
exception when others then null; end $$;

grant execute on function thy_spine_next_question(int)  to authenticated;
grant execute on function thy_spine_head(int, int)      to authenticated;

commit;
