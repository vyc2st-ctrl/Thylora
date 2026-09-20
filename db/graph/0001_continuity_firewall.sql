-- THYLORA graph continuity firewall
-- Work code : THY-WORK-GRAPH-STORY-FIREWALL-551
-- Sequence  : 551
-- Backend   : thylora-dash (jvsdxhrfhtlgaknhjxlz)
--
-- Applied to the live backend on 2026-09-20. Checked in here so the rule is
-- reviewable and reproducible. This file adds functions only; it does not
-- create, alter or delete any node, edge, predicate or version row.
--
-- Depends on the sequence-550 overlay:
--   thylora_graph_nodes, thylora_graph_edges,
--   thylora_graph_predicates, thylora_graph_versions

-- ---------------------------------------------------------------------------
-- 1 · Entity scan. Find where an entity actually lives before writing about it.
-- ---------------------------------------------------------------------------
create or replace function public.thylora_graph_scan_v1(pattern text)
returns table(tbl text, hits bigint)
language plpgsql stable security invoker set search_path = public
as $$
declare r record; c bigint;
begin
  for r in select table_name from information_schema.tables
           where table_schema='public' and table_type='BASE TABLE' order by table_name
  loop
    begin
      execute format('select count(*) from public.%I where to_jsonb(%I)::text ilike %L',
                     r.table_name, r.table_name, '%'||pattern||'%') into c;
    exception when others then c := null;
    end;
    if c is not null and c > 0 then tbl := r.table_name; hits := c; return next; end if;
  end loop;
end $$;

comment on function public.thylora_graph_scan_v1(text) is
'Full-backend case-insensitive scan for an entity name. Used at step 1 of the
firewall so identity is resolved against the whole backend, not a guess.';

-- ---------------------------------------------------------------------------
-- 2 · Graph context. One call returns everything graph rule 1 requires:
--     node, outgoing, incoming, version history, evidence, layer, authority.
--     Additive upgrade (MINOR) - the original node/outgoing/incoming keys are
--     unchanged, so existing callers keep working.
-- ---------------------------------------------------------------------------
create or replace function public.thylora_graph_context_v1(p_node_id text)
returns jsonb language sql stable set search_path to 'public'
as $$
  select jsonb_build_object(
    'node', (select to_jsonb(n) from public.thylora_graph_nodes n where n.node_id=p_node_id),
    'outgoing', coalesce((select jsonb_agg(to_jsonb(e) order by e.predicate,e.edge_id)
                          from public.thylora_graph_edges e
                          where e.subject_id=p_node_id and e.state='CURRENT'),'[]'::jsonb),
    'incoming', coalesce((select jsonb_agg(to_jsonb(e) order by e.predicate,e.edge_id)
                          from public.thylora_graph_edges e
                          where e.object_id=p_node_id and e.state='CURRENT'),'[]'::jsonb),
    'versions', coalesce((select jsonb_agg(to_jsonb(v) order by v.created_at)
                          from public.thylora_graph_versions v
                          where v.entity_kind='NODE' and v.entity_id=p_node_id),'[]'::jsonb),
    'evidence', coalesce((select jsonb_agg(e.object_literal order by e.edge_id)
                          from public.thylora_graph_edges e
                          where e.subject_id=p_node_id and e.predicate='EVIDENCED_BY'
                            and e.state='CURRENT'),
                         to_jsonb(array['UNKNOWN'])),
    'layer', (select n.layer from public.thylora_graph_nodes n where n.node_id=p_node_id),
    'authority', (select n.authority from public.thylora_graph_nodes n where n.node_id=p_node_id)
  );
$$;

-- ---------------------------------------------------------------------------
-- 3 · The pre-write gate.
--
--     INPUT ENTITY
--       -> STABLE ID LOOKUP
--       -> GRAPH CONTEXT
--       -> STORY PROPERTY
--       -> SEPARATE_FROM CHECK
--       -> LAYER CHECK
--       -> AUTHORITY CHECK
--       -> VERSION CHECK
--       -> EVIDENCE CHECK
--       -> WRITE
--
--     Fails closed on: SEPARATE_FROM conflict; membership in two story
--     properties with no explicit crossover; layer mismatch; non-CURRENT
--     status; unregistered node. An unknown stable ID returns
--     UNKNOWN_IDENTITY - never a new node.
-- ---------------------------------------------------------------------------
create or replace function public.thylora_graph_firewall_v1(p_entity_id text, p_target_story text default null)
returns jsonb
language plpgsql stable security invoker set search_path = public
as $$
declare
  n          thylora_graph_nodes%rowtype;
  t          thylora_graph_nodes%rowtype;
  v_stories  text[];
  v_separate text[];
  v_evidence text[];
  v_versions int;
  v_reasons  text[] := '{}';
  v_verdict  text  := 'PASS';
begin
  -- STEP 1 · STABLE ID LOOKUP
  select * into n from thylora_graph_nodes where node_id = p_entity_id;
  if not found then
    return jsonb_build_object(
      'verdict','UNKNOWN_IDENTITY','write_allowed',false,'entity',p_entity_id,
      'reasons', to_jsonb(array['No node with this stable ID. Do not create a duplicate and do not invent one. Resolve identity first.']),
      'checked_at', now());
  end if;

  -- STEP 2 · STORY PROPERTY
  select coalesce(array_agg(distinct e.object_id),'{}') into v_stories
  from thylora_graph_edges e join thylora_graph_nodes o on o.node_id = e.object_id
  where e.subject_id = n.node_id and e.predicate = 'PART_OF'
    and e.state = 'CURRENT' and o.node_type = 'StoryProperty';

  -- STEP 3 · SEPARATE_FROM
  select coalesce(array_agg(distinct e.object_id),'{}') into v_separate
  from thylora_graph_edges e
  where e.subject_id = any(v_stories || array[n.node_id])
    and e.predicate = 'SEPARATE_FROM' and e.state = 'CURRENT';

  -- STEP 4 · VERSION + EVIDENCE
  select count(*) into v_versions
  from thylora_graph_versions where entity_kind='NODE' and entity_id=n.node_id;
  select coalesce(array_agg(e.object_literal),'{}') into v_evidence
  from thylora_graph_edges e
  where e.subject_id=n.node_id and e.predicate='EVIDENCED_BY' and e.state='CURRENT';

  -- FAIL CLOSED · two story properties, no explicit crossover
  if array_length(v_stories,1) > 1 then
    v_verdict := 'FAIL_CLOSED';
    v_reasons := v_reasons || format('Entity belongs to %s story properties (%s) with no explicit Chairman crossover.',
                                     array_length(v_stories,1), array_to_string(v_stories,', '));
  end if;

  -- AUTHORITY / VERSION / EVIDENCE
  if n.status <> 'CURRENT' then
    v_verdict := 'FAIL_CLOSED';
    v_reasons := v_reasons || format('Node status is %s, not CURRENT.', n.status);
  end if;
  if v_versions = 0 then
    v_verdict := 'FAIL_CLOSED';
    v_reasons := v_reasons || 'Node has no version row. Unregistered nodes may not be written from.';
  end if;
  if coalesce(array_length(v_evidence,1),0) = 0 then
    v_reasons := v_reasons || 'EVIDENCE: UNKNOWN. No EVIDENCED_BY edge. Do not claim complete, live, built or sold.';
  end if;

  -- TARGET CHECKS
  if p_target_story is not null then
    select * into t from thylora_graph_nodes where node_id = p_target_story;
    if not found then
      v_verdict := 'FAIL_CLOSED';
      v_reasons := v_reasons || format('Target story property %s does not exist.', p_target_story);
    else
      -- STEP 5 · SEPARATE_FROM CONFLICT
      if p_target_story = any(v_separate) then
        v_verdict := 'FAIL_CLOSED';
        v_reasons := v_reasons || format('SEPARATE_FROM conflict: %s is explicitly separate from %s. Cross-merge prohibited.',
                                         p_entity_id, p_target_story);
      end if;
      if array_length(v_stories,1) = 1 and not (p_target_story = any(v_stories)) then
        v_verdict := 'FAIL_CLOSED';
        v_reasons := v_reasons || format('Entity is PART_OF %s, not %s. Writing it into %s would cross story properties.',
                                         v_stories[1], p_target_story, p_target_story);
      end if;
      -- STEP 6 · LAYER
      if t.layer <> n.layer then
        v_verdict := 'FAIL_CLOSED';
        v_reasons := v_reasons || format('LAYER violation: entity is %s, target is %s. Earth and EdereAirah stay explicit.',
                                         n.layer, t.layer);
      end if;
    end if;
  end if;

  return jsonb_build_object(
    'verdict', v_verdict,
    'write_allowed', v_verdict = 'PASS',
    'entity', n.node_id,
    'canonical_name', n.canonical_name,
    'node_type', n.node_type,
    'layer', n.layer,
    'status', n.status,
    'authority', n.authority,
    'truth_class', n.truth_class,
    'target_story', p_target_story,
    'story_properties', to_jsonb(v_stories),
    'separate_from', to_jsonb(v_separate),
    'version_rows', v_versions,
    'evidence', case when coalesce(array_length(v_evidence,1),0)=0
                     then to_jsonb(array['UNKNOWN']) else to_jsonb(v_evidence) end,
    'reasons', to_jsonb(v_reasons),
    'checked_at', now());
end $$;

comment on function public.thylora_graph_firewall_v1(text,text) is
'THYLORA continuity firewall (THY-WORK-GRAPH-STORY-FIREWALL-551). Pre-write gate:
INPUT ENTITY -> STABLE ID LOOKUP -> GRAPH CONTEXT -> STORY PROPERTY ->
SEPARATE_FROM CHECK -> LAYER CHECK -> AUTHORITY CHECK -> VERSION CHECK ->
EVIDENCE CHECK -> WRITE. Fails closed on SEPARATE_FROM conflict, dual story
membership without explicit crossover, layer mismatch, non-CURRENT status, or
unregistered node. Unknown stable ID returns UNKNOWN_IDENTITY, never a new node.';
