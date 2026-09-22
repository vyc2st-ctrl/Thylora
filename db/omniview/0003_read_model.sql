-- OMNIVIEW · 0003 · The read model
-- Work: THY-WORK-OMNIVIEW-ROUNDTRIP-587
--
-- CURRENT_STATE_MANIFEST_PLUS_TOPIC_EXPANSION.
--
-- One call returns authoritative current state plus the history that explains
-- it, in the required pre-response order:
--
--   NEWEST DELTAS -> TOPIC MANIFEST -> AUTHORITY LOCKS -> LINKED GRAPH ->
--   LINKED PEOPLE/PLACES/OBJECTS/PRODUCTS -> LINKED WORK -> LINKED GATES ->
--   CURRENT VS SUPERSEDED -> LAST RESTART -> ANSWER
--
-- The order is data, not a convention a client is trusted to remember: every
-- response carries read_path, and the surface renders in that order.
--
-- These functions read the seven OMNIVIEW tables. They do NOT sweep the raw
-- THYLORA registries every turn. Whatever was not read is named in the QYRIS
-- trace under not_read, so no answer can claim a table it never touched.

begin;

-- 1. QYRIS --------------------------------------------------------------------
-- The visible read trace. It is produced by the same call that produces the
-- answer, so it cannot drift from what actually happened.
create or replace function thy_omniview_qyris(
  p_scope text,
  p_topic text default null,
  p_reads jsonb default '[]'::jsonb
) returns jsonb language sql stable set search_path = public as $$
  select jsonb_build_object(
    'qyris_version', 'QYRIS-1',
    'scope',         p_scope,
    'topic',         p_topic,
    'read_at_utc',   to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
    'sequence_head', thy_sequence_head(),
    'tables_read',   p_reads,
    'not_read',      jsonb_build_array(
        'raw THYLORA registries were not swept this turn',
        'soft-referenced rows are resolved only when a link is opened',
        'anything absent from the OMNIVIEW tables is reported as UNSEEDED, never inferred'),
    'claim_rule',    'Only tables listed in tables_read were read. No other table may be claimed.'
  )
$$;

-- 2. NEWEST DELTAS ------------------------------------------------------------
create or replace function thy_omniview_deltas(p_limit int default 12, p_topic text default null)
returns jsonb language sql stable set search_path = public as $$
  select coalesce(jsonb_agg(d order by d.sequence_no desc), '[]'::jsonb)
  from (
    select jsonb_build_object(
             'sequence_no',          l.sequence_no,
             'previous_sequence_no', l.previous_sequence_no,
             'occurred_utc',         to_char(l.occurred_utc at time zone 'utc','YYYY-MM-DD"T"HH24:MI:SS"Z"'),
             'occurred_local',       to_char(l.occurred_local,'YYYY-MM-DD HH24:MI'),
             'local_timezone',       l.local_timezone,
             'what_changed',         l.what_changed,
             'why_change_occurred',  l.why_change_occurred,
             'why_it_changed',       l.why_it_changed,
             'what_remained',        l.what_remained,
             'authority',            l.authority,
             'truth_class',          l.truth_class,
             'next_better_question', l.next_better_question,
             'restart_point',        l.restart_point,
             'supersedes',           l.supersedes_sequence_no,
             'topics',               (select coalesce(jsonb_agg(jsonb_build_object('topic_key',t.topic_key,'effect',t.effect)
                                              order by t.topic_key),'[]'::jsonb)
                                        from thy_sequence_ledger_topics t where t.sequence_no = l.sequence_no)
           ) as d,
           l.sequence_no
      from thy_sequence_ledger l
     where p_topic is null
        or exists (select 1 from thy_sequence_ledger_topics t
                    where t.sequence_no = l.sequence_no and t.topic_key = upper(btrim(p_topic)))
     order by l.sequence_no desc
     limit greatest(p_limit, 1)
  ) d
$$;

-- 3. CURRENT STATE MANIFEST ---------------------------------------------------
-- The whole board in one read: every topic, its authority lock, its canon state,
-- its open gate count, its last sequence. This is what replaces re-reading the
-- backend row by row at the start of a turn.
create or replace function thy_omniview_manifest(p_delta_limit int default 12)
returns jsonb language plpgsql stable set search_path = public as $$
declare
  v_topics    jsonb;
  v_deltas    jsonb;
  v_restart   jsonb;
  v_locks     jsonb;
  v_counts    jsonb;
begin
  select coalesce(jsonb_agg(jsonb_build_object(
           'topic_key',       t.topic_key,
           'display_name',    t.display_name,
           'topic_class',     t.topic_class,
           'summary',         t.summary,
           'authority_lock',  t.authority_lock,
           'authority_holder',t.authority_holder,
           'canon_state',     t.canon_state,
           'superseded_by',   t.superseded_by_topic,
           'last_sequence_no',t.last_sequence_no,
           'restart_point',   t.restart_point,
           'current_statements',  (select count(*) from thy_omniview_statements s
                                    where s.topic_key = t.topic_key and s.status = 'CURRENT'),
           'superseded_statements',(select count(*) from thy_omniview_statements s
                                    where s.topic_key = t.topic_key and s.status = 'SUPERSEDED'),
           'open_gates',      (select count(*) from thy_omniview_gates g
                                where g.topic_key = t.topic_key and g.gate_state in ('OPEN','BLOCKED')),
           'open_questions',  (select count(*) from thy_omniview_questions q
                                where q.topic_key = t.topic_key and q.state = 'OPEN'),
           'active_work',     (select count(*) from thy_omniview_links k
                                where k.topic_key = t.topic_key and k.link_class = 'WORK' and k.status = 'ACTIVE')
         ) order by t.topic_key), '[]'::jsonb)
    into v_topics
    from thy_omniview_topics t;

  v_deltas := thy_omniview_deltas(p_delta_limit, null);

  select coalesce(jsonb_agg(jsonb_build_object(
           'authority_lock', x.authority_lock,
           'topics',         x.topics) order by x.authority_lock), '[]'::jsonb)
    into v_locks
    from (select authority_lock, jsonb_agg(topic_key order by topic_key) as topics
            from thy_omniview_topics group by authority_lock) x;

  select to_jsonb(r) into v_restart
    from (select restart_point, reason, authority, sequence_no, scope, topic_key,
                 to_char(created_at at time zone 'utc','YYYY-MM-DD"T"HH24:MI:SS"Z"') as created_utc
            from thy_omniview_restarts
           order by sequence_no desc, id desc limit 1) r;

  select jsonb_build_object(
           'topics',      (select count(*) from thy_omniview_topics),
           'sequences',   (select count(*) from thy_sequence_ledger),
           'statements',  (select count(*) from thy_omniview_statements),
           'links',       (select count(*) from thy_omniview_links),
           'gates',       (select count(*) from thy_omniview_gates),
           'questions',   (select count(*) from thy_omniview_questions),
           'restarts',    (select count(*) from thy_omniview_restarts))
    into v_counts;

  return jsonb_build_object(
    'read_model',    'CURRENT_STATE_MANIFEST',
    'read_path',     jsonb_build_array('NEWEST DELTAS','TOPIC MANIFEST','AUTHORITY LOCKS','LAST RESTART','ANSWER'),
    'newest_deltas', v_deltas,
    'topic_manifest',v_topics,
    'authority_locks', v_locks,
    'last_restart',  coalesce(v_restart, 'null'::jsonb),
    'sequence_head', thy_sequence_head(),
    'counts',        v_counts,
    'qyris', thy_omniview_qyris('MANIFEST', null, jsonb_build_array(
      jsonb_build_object('table','thy_sequence_ledger',        'rows', v_counts->'sequences'),
      jsonb_build_object('table','thy_omniview_topics',        'rows', v_counts->'topics'),
      jsonb_build_object('table','thy_omniview_statements',    'rows', v_counts->'statements'),
      jsonb_build_object('table','thy_omniview_gates',         'rows', v_counts->'gates'),
      jsonb_build_object('table','thy_omniview_questions',     'rows', v_counts->'questions'),
      jsonb_build_object('table','thy_omniview_links',         'rows', v_counts->'links'),
      jsonb_build_object('table','thy_omniview_restarts',      'rows', v_counts->'restarts'),
      jsonb_build_object('table','thy_sequence_ledger_topics', 'rows',
        (select count(*) from thy_sequence_ledger_topics))))
  );
end $$;

-- 4. TOPIC EXPANSION ----------------------------------------------------------
-- ONE read. Authoritative current state plus the history that explains it.
create or replace function thy_omniview_topic(
  p_topic_key text,
  p_history_limit int default 25
) returns jsonb language plpgsql stable set search_path = public as $$
declare
  k            text := coalesce(thy_omniview_resolve_topic(p_topic_key),
                                upper(btrim(coalesce(p_topic_key,''))));
  t            thy_omniview_topics%rowtype;
  v_current    jsonb;
  v_superseded jsonb;
  v_links      jsonb;
  v_entities   jsonb;
  v_work       jsonb;
  v_gates      jsonb;
  v_questions  jsonb;
  v_next_q     jsonb;
  v_deltas     jsonb;
  v_last_seq   jsonb;
  v_restart    jsonb;
begin
  select * into t from thy_omniview_topics where topic_key = k;

  if not found then
    return jsonb_build_object(
      'read_model','TOPIC_EXPANSION',
      'topic_key', k,
      'found', false,
      'canon_state','UNREGISTERED',
      'answer_rule','This topic is not in the manifest. Register it before answering as canon.',
      'next_better_question',
        format('What is the authoritative source for %s, and who holds the authority lock?', k),
      'qyris', thy_omniview_qyris('TOPIC_EXPANSION', k, jsonb_build_array(
        jsonb_build_object('table','thy_omniview_topics','rows',0,'note','no row for this topic'))));
  end if;

  -- CURRENT VS SUPERSEDED: both are returned, never one without the other.
  select coalesce(jsonb_agg(jsonb_build_object(
           'id', s.id, 'kind', s.statement_kind, 'body', s.body,
           'truth_class', s.truth_class, 'authority', s.authority,
           'entered_sequence_no', s.entered_sequence_no, 'source_ref', s.source_ref)
         order by s.entered_sequence_no desc, s.id desc), '[]'::jsonb)
    into v_current
    from thy_omniview_statements s where s.topic_key = k and s.status = 'CURRENT';

  select coalesce(jsonb_agg(jsonb_build_object(
           'id', s.id, 'kind', s.statement_kind, 'body', s.body,
           'truth_class', s.truth_class, 'authority', s.authority,
           'entered_sequence_no', s.entered_sequence_no,
           'superseded_sequence_no', s.superseded_sequence_no,
           'superseded_by_id', s.superseded_by_id)
         order by s.superseded_sequence_no desc, s.id desc), '[]'::jsonb)
    into v_superseded
    from (select * from thy_omniview_statements s2
           where s2.topic_key = k and s2.status = 'SUPERSEDED'
           order by s2.superseded_sequence_no desc, s2.id desc
           limit greatest(p_history_limit,1)) s;

  select coalesce(jsonb_agg(jsonb_build_object(
           'link_class', l.link_class, 'link_key', l.link_key,
           'display_name', l.display_name, 'relation', l.relation,
           'status', l.status, 'source_table', l.source_table, 'source_ref', l.source_ref,
           'entered_sequence_no', l.entered_sequence_no)
         order by l.link_class, l.display_name), '[]'::jsonb)
    into v_links
    from thy_omniview_links l where l.topic_key = k;

  -- LINKED PEOPLE / PLACES / OBJECTS / PRODUCTS, split out as the path requires.
  select jsonb_build_object(
           'people',   coalesce(jsonb_path_query_array(v_links, '$[*] ? (@.link_class == "PERSON")'),  '[]'::jsonb),
           'places',   coalesce(jsonb_path_query_array(v_links, '$[*] ? (@.link_class == "PLACE")'),   '[]'::jsonb),
           'objects',  coalesce(jsonb_path_query_array(v_links, '$[*] ? (@.link_class == "OBJECT")'),  '[]'::jsonb),
           'products', coalesce(jsonb_path_query_array(v_links, '$[*] ? (@.link_class == "PRODUCT")'), '[]'::jsonb),
           'money',    coalesce(jsonb_path_query_array(v_links, '$[*] ? (@.link_class == "MONEY")'),   '[]'::jsonb),
           'systems',  coalesce(jsonb_path_query_array(v_links, '$[*] ? (@.link_class == "SYSTEM")'),  '[]'::jsonb),
           'topics',   coalesce(jsonb_path_query_array(v_links, '$[*] ? (@.link_class == "TOPIC")'),   '[]'::jsonb))
    into v_entities;

  v_work  := coalesce(jsonb_path_query_array(v_links, '$[*] ? (@.link_class == "WORK")'), '[]'::jsonb);

  select coalesce(jsonb_agg(jsonb_build_object(
           'gate_key', g.gate_key, 'requirement', g.requirement, 'gate_state', g.gate_state,
           'blocker', g.blocker, 'authority', g.authority, 'evidence_ref', g.evidence_ref,
           'entered_sequence_no', g.entered_sequence_no, 'settled_sequence_no', g.settled_sequence_no)
         order by (g.gate_state in ('OPEN','BLOCKED')) desc, g.gate_key), '[]'::jsonb)
    into v_gates
    from thy_omniview_gates g where g.topic_key = k;

  select coalesce(jsonb_agg(jsonb_build_object(
           'id', q.id, 'question', q.question, 'why_it_matters', q.why_it_matters,
           'state', q.state, 'is_next_better', q.is_next_better,
           'entered_sequence_no', q.entered_sequence_no)
         order by q.is_next_better desc, q.id), '[]'::jsonb)
    into v_questions
    from thy_omniview_questions q where q.topic_key = k and q.state = 'OPEN';

  select to_jsonb(x) into v_next_q from (
    select question, why_it_matters from thy_omniview_questions
     where topic_key = k and state = 'OPEN' and is_next_better limit 1) x;

  v_deltas := thy_omniview_deltas(p_history_limit, k);

  select to_jsonb(x) into v_last_seq from (
    select l.sequence_no, l.what_changed, l.why_it_changed, l.what_remained,
           l.authority, l.truth_class, l.restart_point, l.next_better_question,
           to_char(l.occurred_utc at time zone 'utc','YYYY-MM-DD"T"HH24:MI:SS"Z"') as occurred_utc,
           to_char(l.occurred_local,'YYYY-MM-DD HH24:MI') as occurred_local,
           l.local_timezone
      from thy_sequence_ledger l
      join thy_sequence_ledger_topics lt on lt.sequence_no = l.sequence_no
     where lt.topic_key = k
     order by l.sequence_no desc limit 1) x;

  select to_jsonb(x) into v_restart from (
    select restart_point, reason, authority, sequence_no
      from thy_omniview_restarts
     where topic_key = k or scope = 'SPINE'
     order by (topic_key = k) desc, sequence_no desc, id desc limit 1) x;

  return jsonb_build_object(
    'read_model', 'CURRENT_STATE_MANIFEST_PLUS_TOPIC_EXPANSION',
    'read_path', jsonb_build_array(
      'NEWEST DELTAS','TOPIC MANIFEST','AUTHORITY LOCKS','LINKED GRAPH',
      'LINKED PEOPLE/PLACES/OBJECTS/PRODUCTS','LINKED WORK','LINKED GATES',
      'CURRENT VS SUPERSEDED','LAST RESTART','ANSWER'),
    'found', true,
    'topic_key', t.topic_key,
    'newest_deltas', v_deltas,
    'topic_manifest', jsonb_build_object(
      'topic_key', t.topic_key, 'display_name', t.display_name,
      'topic_class', t.topic_class, 'summary', t.summary,
      'canon_state', t.canon_state, 'superseded_by_topic', t.superseded_by_topic,
      'last_sequence_no', t.last_sequence_no),
    'authority_locks', jsonb_build_object(
      'authority_lock', t.authority_lock, 'authority_holder', t.authority_holder,
      'answerable_as_canon', (t.authority_lock <> 'UNLOCKED' and t.canon_state in ('CANON','PARTIAL','SEALED'))),
    'linked_graph', v_links,
    'linked_entities', v_entities,
    'linked_work', v_work,
    'linked_gates', v_gates,
    'current_vs_superseded', jsonb_build_object(
      'current', v_current, 'superseded', v_superseded,
      'current_count', jsonb_array_length(v_current),
      'superseded_count', jsonb_array_length(v_superseded)),
    'open_questions', v_questions,
    'next_better_question', coalesce(v_next_q, 'null'::jsonb),
    'last_sequence', coalesce(v_last_seq, 'null'::jsonb),
    'last_restart', coalesce(v_restart, 'null'::jsonb),
    'answer_rule', case
      when t.canon_state = 'UNSEEDED' then
        'Canon for this topic is not written. Answer with the open question, not with an assumption.'
      when t.authority_lock = 'UNLOCKED' then
        'No authority lock. State current content as unverified until the lock is set.'
      else 'Answer from current statements. Superseded statements are history, not canon.' end,
    'qyris', thy_omniview_qyris('TOPIC_EXPANSION', k, jsonb_build_array(
      jsonb_build_object('table','thy_omniview_topics',       'rows', 1),
      jsonb_build_object('table','thy_omniview_statements',   'rows',
        jsonb_array_length(v_current) + jsonb_array_length(v_superseded)),
      jsonb_build_object('table','thy_omniview_links',        'rows', jsonb_array_length(v_links)),
      jsonb_build_object('table','thy_omniview_gates',        'rows', jsonb_array_length(v_gates)),
      jsonb_build_object('table','thy_omniview_questions',    'rows', jsonb_array_length(v_questions)),
      jsonb_build_object('table','thy_sequence_ledger',       'rows', jsonb_array_length(v_deltas)),
      jsonb_build_object('table','thy_sequence_ledger_topics','rows', jsonb_array_length(v_deltas)),
      jsonb_build_object('table','thy_omniview_restarts',     'rows', case when v_restart is null then 0 else 1 end)))
  );
end $$;

-- 5. SEQUENCE EXPANSION -------------------------------------------------------
-- Sequence click: delta, reason, authority, next question.
create or replace function thy_omniview_sequence(p_sequence_no bigint)
returns jsonb language plpgsql stable set search_path = public as $$
declare l thy_sequence_ledger%rowtype; v_topics jsonb; v_next bigint; v_superseded_by bigint;
begin
  select * into l from thy_sequence_ledger where sequence_no = p_sequence_no;
  if not found then
    return jsonb_build_object('found', false, 'sequence_no', p_sequence_no,
      'qyris', thy_omniview_qyris('SEQUENCE', null, jsonb_build_array(
        jsonb_build_object('table','thy_sequence_ledger','rows',0))));
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
           'topic_key', lt.topic_key, 'effect', lt.effect,
           'display_name', t.display_name, 'canon_state', t.canon_state)
         order by lt.topic_key), '[]'::jsonb)
    into v_topics
    from thy_sequence_ledger_topics lt
    join thy_omniview_topics t on t.topic_key = lt.topic_key
   where lt.sequence_no = l.sequence_no;

  select min(sequence_no) into v_next from thy_sequence_ledger where sequence_no > l.sequence_no;
  select min(sequence_no) into v_superseded_by from thy_sequence_ledger where supersedes_sequence_no = l.sequence_no;

  return jsonb_build_object(
    'read_model','SEQUENCE_EXPANSION',
    'read_path', jsonb_build_array('DELTA','REASON','AUTHORITY','NEXT QUESTION','RESTART POINT'),
    'found', true,
    'sequence_no', l.sequence_no,
    'previous_sequence_no', l.previous_sequence_no,
    'next_sequence_no', v_next,
    'superseded_by_sequence_no', v_superseded_by,
    'supersedes_sequence_no', l.supersedes_sequence_no,
    'local_datetime', to_char(l.occurred_local,'YYYY-MM-DD HH24:MI'),
    'local_timezone', l.local_timezone,
    'utc_datetime',  to_char(l.occurred_utc at time zone 'utc','YYYY-MM-DD"T"HH24:MI:SS"Z"'),
    'delta', jsonb_build_object('what_changed', l.what_changed, 'what_remained', l.what_remained),
    'reason', jsonb_build_object('why_change_occurred', l.why_change_occurred, 'why_it_changed', l.why_it_changed),
    'authority', jsonb_build_object('authority', l.authority, 'truth_class', l.truth_class,
                                    'recorded_by', l.recorded_by,
                                    'recorded_at', to_char(l.recorded_at at time zone 'utc','YYYY-MM-DD"T"HH24:MI:SS"Z"')),
    'next_question', l.next_better_question,
    'restart_point', l.restart_point,
    'source_ref', l.source_ref,
    'topics', v_topics,
    'qyris', thy_omniview_qyris('SEQUENCE', null, jsonb_build_array(
      jsonb_build_object('table','thy_sequence_ledger','rows',1),
      jsonb_build_object('table','thy_sequence_ledger_topics','rows', jsonb_array_length(v_topics)),
      jsonb_build_object('table','thy_omniview_topics','rows', jsonb_array_length(v_topics)))));
end $$;

-- 6. LEDGER PAGE --------------------------------------------------------------
create or replace function thy_sequence_ledger_page(p_limit int default 40, p_before bigint default null)
returns jsonb language sql stable set search_path = public as $$
  select jsonb_build_object(
    'read_model','SEQUENCE_LEDGER',
    'columns', jsonb_build_array('SEQUENCE','LOCAL DATE/TIME','UTC DATE/TIME','PREVIOUS SEQUENCE',
      'WHY CHANGE OCCURRED','WHAT CHANGED','WHY IT CHANGED','WHAT REMAINED','AUTHORITY','TRUTH CLASS',
      'NEXT-BETTER QUESTION','RESTART POINT'),
    'head', thy_sequence_head(),
    'rows', coalesce((
      select jsonb_agg(r order by (r->>'sequence_no')::bigint desc) from (
        select jsonb_build_object(
          'sequence_no', l.sequence_no,
          'local_datetime', to_char(l.occurred_local,'YYYY-MM-DD HH24:MI'),
          'local_timezone', l.local_timezone,
          'utc_datetime', to_char(l.occurred_utc at time zone 'utc','YYYY-MM-DD"T"HH24:MI:SS"Z"'),
          'previous_sequence_no', l.previous_sequence_no,
          'why_change_occurred', l.why_change_occurred,
          'what_changed', l.what_changed,
          'why_it_changed', l.why_it_changed,
          'what_remained', l.what_remained,
          'authority', l.authority,
          'truth_class', l.truth_class,
          'next_better_question', l.next_better_question,
          'restart_point', l.restart_point,
          'supersedes_sequence_no', l.supersedes_sequence_no,
          'topics', (select coalesce(jsonb_agg(t.topic_key order by t.topic_key),'[]'::jsonb)
                       from thy_sequence_ledger_topics t where t.sequence_no = l.sequence_no)) as r
          from thy_sequence_ledger l
         where p_before is null or l.sequence_no < p_before
         order by l.sequence_no desc
         limit greatest(p_limit,1)) q), '[]'::jsonb),
    'qyris', thy_omniview_qyris('SEQUENCE_LEDGER', null, jsonb_build_array(
      jsonb_build_object('table','thy_sequence_ledger','rows',(select count(*) from thy_sequence_ledger)),
      jsonb_build_object('table','thy_sequence_ledger_topics','rows',(select count(*) from thy_sequence_ledger_topics)))))
$$;

commit;
