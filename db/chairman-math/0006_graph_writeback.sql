-- THY-WORK-MATH-FAMOUS-THOUGHT-559 · 0006 · Graph writeback
--
-- Rules held here, from the work order:
--   * the Postgres graph overlay is authoritative
--   * UNKNOWN remains UNKNOWN
--   * no duplicate nodes
--   * SUPERSEDES, never deletion
--   * preflight before write, every time
--
-- Nothing in this file writes a node or an edge unless
-- thy_math_graph_preflight_v1 returned write_allowed for the stable id in the
-- same transaction. While the overlay is unreachable the writeback is a no-op
-- that records refusals, which is the correct outcome, not a degraded one.

begin;

-- Declared intent. Reviewable before it is executed, and the source of the
-- section 10 report whether or not the write is permitted.
create table if not exists thy_math_graph_intent (
  intent_id     bigserial primary key,
  work_code     text not null default 'THY-WORK-MATH-FAMOUS-THOUGHT-559',
  kind          text not null,
  stable_id     text not null,
  related_id    text,
  relation      text,
  purpose       text not null,
  status        text not null default 'DECLARED',
  constraint thy_graph_intent_kind_known check (kind in ('NODE', 'EDGE')),
  constraint thy_graph_intent_status_known
    check (status in ('DECLARED', 'READ', 'CREATED', 'UPDATED', 'REFUSED', 'DUPLICATE_PREVENTED')),
  constraint thy_graph_intent_edge_shape
    check (kind = 'NODE' or (related_id is not null and relation is not null))
);

create unique index if not exists thy_math_graph_intent_unique
  on thy_math_graph_intent (work_code, kind, stable_id, coalesce(related_id, ''), coalesce(relation, ''));

insert into thy_math_graph_intent (kind, stable_id, related_id, relation, purpose)
values
  ('NODE', 'SYSTEM-MATH-ENGINE-001', null, null,
   'Read existing node. The math display layer attaches to it; it is not recreated.'),
  ('NODE', 'SYSTEM-FAMOUS-THOUGHT-001', null, null,
   'Read existing node. The famous-thought gate and drafts attach to it; it is not recreated.'),
  ('EDGE', 'SYSTEM-FAMOUS-THOUGHT-001', 'SYSTEM-MATH-ENGINE-001', 'EVALUATED_BY',
   'The famous-thought gate is an application of the math engine: F = S x A x C x T.')
on conflict do nothing;

-- Does a node already exist? Guarded; an unreachable overlay answers UNKNOWN.
create or replace function thy_math_graph_node_exists(p_stable_id text)
returns text language plpgsql stable security definer set search_path = public as $$
declare hit boolean;
begin
  if to_regclass('public.thylora_graph_nodes') is null then return 'UNKNOWN'; end if;
  begin
    execute 'select exists (select 1 from thylora_graph_nodes where stable_id = $1)'
      into hit using p_stable_id;
  exception when others then
    return 'UNKNOWN';
  end;
  return case when hit then 'PRESENT' else 'ABSENT' end;
end $$;

-- The writeback itself.
create or replace function thy_math_graph_writeback_v1()
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  rec            thy_math_graph_intent;
  pre            thy_math_graph_preflight;
  nodes_read     integer := 0;
  nodes_created  integer := 0;
  nodes_updated  integer := 0;
  edges_read     integer := 0;
  edges_created  integer := 0;
  dupes          integer := 0;
  refusals       integer := 0;
  unknowns       text[]  := '{}';
  conflicts      text[]  := '{}';
  versions       text[]  := '{}';
  presence       text;
  edge_present   boolean;
begin
  for rec in select * from thy_math_graph_intent where work_code = 'THY-WORK-MATH-FAMOUS-THOUGHT-559'
  loop
    pre := thy_math_graph_preflight_v1(
             rec.stable_id,
             jsonb_build_object('intent_id', rec.intent_id, 'purpose', rec.purpose));

    if pre.graph_version is not null and pre.graph_version <> 'UNKNOWN'
       and not (pre.graph_version = any (versions)) then
      versions := versions || pre.graph_version;
    end if;

    presence := thy_math_graph_node_exists(rec.stable_id);

    if presence = 'UNKNOWN' then
      unknowns := unknowns || (rec.stable_id || ': graph overlay unreadable from this session');
      refusals := refusals + 1;
      update thy_math_graph_intent set status = 'REFUSED' where intent_id = rec.intent_id;
      continue;
    end if;

    if rec.kind = 'NODE' then
      if presence = 'PRESENT' then
        nodes_read := nodes_read + 1;
        dupes := dupes + 1;   -- the node exists, so no second node is created
        update thy_math_graph_intent set status = 'DUPLICATE_PREVENTED' where intent_id = rec.intent_id;
      else
        -- The work order states both nodes are already present. If one is not,
        -- that is a conflict to report, not a node to invent.
        conflicts := conflicts || (rec.stable_id || ': declared present by the work order but ABSENT in the overlay');
        refusals := refusals + 1;
        update thy_math_graph_intent set status = 'REFUSED' where intent_id = rec.intent_id;
      end if;
      continue;
    end if;

    -- EDGE
    if thy_math_graph_node_exists(rec.related_id) <> 'PRESENT' then
      conflicts := conflicts || (rec.related_id || ': edge endpoint not present');
      refusals := refusals + 1;
      update thy_math_graph_intent set status = 'REFUSED' where intent_id = rec.intent_id;
      continue;
    end if;

    if to_regclass('public.thylora_graph_edges') is null then
      unknowns := unknowns || 'thylora_graph_edges absent';
      refusals := refusals + 1;
      update thy_math_graph_intent set status = 'REFUSED' where intent_id = rec.intent_id;
      continue;
    end if;

    begin
      execute 'select exists (select 1 from thylora_graph_edges
                where from_stable_id = $1 and to_stable_id = $2 and relation = $3)'
        into edge_present using rec.stable_id, rec.related_id, rec.relation;
    exception when others then
      unknowns := unknowns || 'thylora_graph_edges shape unverified';
      refusals := refusals + 1;
      update thy_math_graph_intent set status = 'REFUSED' where intent_id = rec.intent_id;
      continue;
    end;

    if edge_present then
      edges_read := edges_read + 1;
      dupes := dupes + 1;
      update thy_math_graph_intent set status = 'DUPLICATE_PREVENTED' where intent_id = rec.intent_id;
      continue;
    end if;

    if not pre.write_allowed then
      refusals := refusals + 1;
      unknowns := unknowns || (rec.stable_id || ': preflight incomplete (' || pre.outcome || ')');
      update thy_math_graph_intent set status = 'REFUSED' where intent_id = rec.intent_id;
      continue;
    end if;

    execute 'insert into thylora_graph_edges (from_stable_id, to_stable_id, relation)
             values ($1, $2, $3)'
      using rec.stable_id, rec.related_id, rec.relation;
    edges_created := edges_created + 1;
    update thy_math_graph_intent set status = 'CREATED' where intent_id = rec.intent_id;
  end loop;

  return jsonb_build_object(
    'work_code',           'THY-WORK-MATH-FAMOUS-THOUGHT-559',
    'nodes_read',          nodes_read,
    'nodes_created',       nodes_created,
    'nodes_updated',       nodes_updated,
    'edges_read',          edges_read,
    'edges_created',       edges_created,
    'versions',            to_jsonb(versions),
    'unknown',             to_jsonb(unknowns),
    'conflicts',           to_jsonb(conflicts),
    'duplicates_prevented', dupes,
    'refusals',            refusals
  );
end $$;

comment on function thy_math_graph_writeback_v1 is
  'Executes the declared graph intent under preflight. Creates nothing it cannot
   authorise, creates no node that already exists, and reports the section 10
   counters as its return value.';

commit;
