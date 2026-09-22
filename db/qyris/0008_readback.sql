-- THYLORA · QYRIS · 0008 · Readback
--
-- VERIFY READBACK is a separate obligation from WRITE BACKEND. A write that
-- cannot be read back in the shape it went in is not a write, it is a hope.
-- These functions return what was actually stored, in the same shape the
-- surface holds it, so a comparison is a comparison and not a paraphrase.

-- One node, exactly as the grammar defines it.
create or replace function qyr_read_node(p_node_id text)
returns table (
  node_id text, cluster_id text, parent_id text, depth integer,
  question text, yield text, reason text, inspect text, safeguard text, moves text[]
) language sql stable as $$
  select n.node_id, n.cluster_id, n.parent_id, n.depth,
         n.question, n.yield, n.reason, n.inspect, n.safeguard,
         array(select d.delta_code from qyr_node_deltas d where d.node_id = n.node_id order by d.delta_code)
  from qyr_nodes n where n.node_id = p_node_id;
$$;

-- A whole pack in stable depth-first order, ready to compare byte for byte
-- against the JS source of truth.
create or replace function qyr_read_pack(p_pack_id text)
returns table (
  node_id text, parent_id text, cluster_id text, depth integer, ordinal integer,
  question text, yield text, reason text, inspect text, safeguard text, moves text[]
) language sql stable as $$
  select n.node_id, n.parent_id, n.cluster_id, n.depth, n.ordinal,
         n.question, n.yield, n.reason, n.inspect, n.safeguard,
         array(select d.delta_code from qyr_node_deltas d where d.node_id = n.node_id order by d.delta_code)
  from qyr_nodes n
  where n.pack_id = p_pack_id
  order by n.depth, n.cluster_id, n.ordinal, n.node_id;
$$;

-- Structural counts, for a readback that does not depend on reading every row.
create or replace function qyr_pack_shape(p_pack_id text)
returns table (
  clusters bigint, nodes bigint, max_depth integer, delta_links bigint,
  nodes_without_delta bigint, nodes_missing_safeguard bigint
) language sql stable as $$
  select
    (select count(distinct cluster_id) from qyr_nodes where pack_id = p_pack_id),
    (select count(*) from qyr_nodes where pack_id = p_pack_id),
    (select coalesce(max(depth), 0) from qyr_nodes where pack_id = p_pack_id),
    (select count(*) from qyr_node_deltas d join qyr_nodes n on n.node_id = d.node_id where n.pack_id = p_pack_id),
    (select count(*) from qyr_nodes n where n.pack_id = p_pack_id
       and not exists (select 1 from qyr_node_deltas d where d.node_id = n.node_id)),
    (select count(*) from qyr_nodes n where n.pack_id = p_pack_id and length(btrim(n.safeguard)) < 8);
$$;

-- Delta coverage per cluster — what a pack is actually capable of moving.
create or replace function qyr_delta_coverage(p_pack_id text)
returns table (cluster_id text, deltas text[]) language sql stable as $$
  select n.cluster_id, array_agg(distinct d.delta_code order by d.delta_code)
  from qyr_nodes n join qyr_node_deltas d on d.node_id = n.node_id
  where n.pack_id = p_pack_id
  group by n.cluster_id
  order by n.cluster_id;
$$;

-- The projection provenance, read back: where the grammar carried the weight
-- and where a human had to write the question.
create or replace function qyr_projection_report()
returns table (domain_id text, authored bigint, mechanical bigint) language sql stable as $$
  with expanded as (
    select p.domain_id, value::text as state
    from qyr_projections p, jsonb_each_text(p.provenance) as kv(key, value)
  )
  select domain_id,
         count(*) filter (where state = 'AUTHORED'),
         count(*) filter (where state = 'MECHANICAL')
  from expanded group by domain_id order by domain_id;
$$;

-- A pass, read back with its state recomputed rather than trusted from the row.
create or replace function qyr_read_pass(p_pass_id uuid)
returns table (
  pass_id uuid, stored_state text, computed_state text, answered bigint,
  settled text[], unsettled text[], live bigint, frontier_open boolean, globally_finished boolean
) language sql stable as $$
  select p.pass_id,
         p.state,
         qyr_pass_state(p.pass_id),
         (select count(*) from qyr_pass_answers a where a.pass_id = p.pass_id),
         array(select s.delta_code from qyr_pass_settled s where s.pass_id = p.pass_id order by s.delta_code),
         array(select d.delta_code from qyr_deltas d
                where not exists (select 1 from qyr_pass_settled s
                                   where s.pass_id = p.pass_id and s.delta_code = d.delta_code)
                order by d.delta_code),
         (select count(*) from qyr_frontier(p.pass_id)),
         true,   -- the frontier is open by construction
         false   -- inquiry is never globally finished
  from qyr_passes p where p.pass_id = p_pass_id;
$$;

-- The support register, read back whole.
create or replace function qyr_read_household(p_household_id text)
returns jsonb language sql stable as $$
  select jsonb_build_object(
    'household_id', h.household_id,
    'seat_limit', h.seat_limit,
    'active_seats', (select count(*) from qyr_seats s where s.household_id = h.household_id and s.state = 'ACTIVE'),
    'seats', coalesce((select jsonb_agg(jsonb_build_object(
        'seat_id', s.seat_id, 'family_id', s.family_id, 'state', s.state,
        'decision_rights', s.decision_rights) order by s.seat_id)
      from qyr_seats s where s.household_id = h.household_id), '[]'::jsonb),
    'active_grants', (select count(*) from qyr_access_grants g
       join qyr_seats s on s.seat_id = g.seat_id
      where s.household_id = h.household_id and g.state = 'ACTIVE' and g.expires_at > now()),
    'open_draws', (select count(*) from qyr_resource_draws d
       join qyr_seats s on s.seat_id = d.seat_id
      where s.household_id = h.household_id and d.state = 'OPEN'),
    'breaches', (select count(*) from qyr_breaches b
       join qyr_seats s on s.seat_id = b.seat_id where s.household_id = h.household_id),
    'audit_entries', (select count(*) from qyr_audit a where a.household_id = h.household_id)
  ) from qyr_households h where h.household_id = p_household_id;
$$;

-- One call that answers "is what I wrote what is there", for the harness and
-- for the surface's readback panel.
create or replace function qyr_readback_summary()
returns table (check_name text, observed bigint, note text) language sql stable as $$
  select 'premarriage_nodes', (select count(*) from qyr_nodes where pack_id = 'QYRIS-PREMARRIAGE-001'),
         'Nodes stored for the pre-marriage pack.'
  union all
  select 'premarriage_clusters', (select count(distinct cluster_id) from qyr_nodes where pack_id = 'QYRIS-PREMARRIAGE-001'),
         'Clusters stored for the pre-marriage pack.'
  union all
  select 'industry_nodes', (select count(*) from qyr_nodes where pack_id = 'QYRIS-INDUSTRY-001'),
         'Projected questions stored: axes x domains.'
  union all
  select 'nodes_without_safeguard', (select count(*) from qyr_nodes where length(btrim(safeguard)) < 8),
         'Must be zero. A question without a safeguard is not a question in this grammar.'
  union all
  select 'nodes_without_delta', (select count(*) from qyr_nodes n
           where not exists (select 1 from qyr_node_deltas d where d.node_id = n.node_id)),
         'Must be zero. A question that moves nothing is not asked.'
  union all
  select 'role_families', (select count(*) from qyr_role_families), 'Trusted Six support role families.'
  union all
  select 'never_grantable_scopes', (select count(*) from qyr_scopes where grantable is false),
         'Scopes no support seat may ever hold.'
  union all
  select 'sr_tests_failed', (select count(*) from qyr_sr_test_results where passed is false),
         'Failure-mode tests the SR candidate did not pass.'
  union all
  select 'sr_canon', (select count(*) from qyr_sr_candidate where canon is true),
         'Must be zero. SR is not canon.'
  union all
  select 'rls_disabled_tables', (select count(*) from pg_tables t
           where t.schemaname = 'public' and t.tablename like 'qyr\_%' and t.rowsecurity is false),
         'Must be zero once 0007 has applied.';
$$;
