-- THY-WORK-SUNDAY-STORE-DRAW-553
-- Graph preflight + guarded writeback for the Sunday store-draw work package.
--
-- STATUS: NOT APPLIED. The session that authored this could not reach the
-- backend (network policy denied CONNECT to the database host), so no read and
-- no write was performed.
--
-- ORDER IS MANDATORY:
--   STABLE ID -> GRAPH CONTEXT -> LAYER -> PROPERTY -> SEPARATE_FROM
--   -> AUTHORITY -> VERSION -> EVIDENCE -> WRITE
--
-- Run SECTION A alone first. Read the output. Only run SECTION B if SECTION A
-- confirms the tables exist and reports zero pre-existing rows for these four
-- stable ids. UNKNOWN REMAINS UNKNOWN.

-- =====================================================================
-- SECTION A — READS ONLY. Safe. Run this first, on its own.
-- =====================================================================

-- A1. Do the overlay tables exist at all?
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'thylora_graph_nodes',
    'thylora_graph_edges',
    'thylora_graph_versions',
    'thylora_rdf_triples_v1'
  )
order by table_name;

-- A2. Does the context function exist?
select p.proname, pg_get_function_identity_arguments(p.oid) as args
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname = 'thylora_graph_context_v1';

-- A3. Row counts.
select 'nodes'    as t, count(*) from public.thylora_graph_nodes
union all select 'edges',    count(*) from public.thylora_graph_edges
union all select 'versions', count(*) from public.thylora_graph_versions
union all select 'rdf',      count(*) from public.thylora_rdf_triples_v1;

-- A4. DUPLICATE CHECK. Any row returned here means DO NOT WRITE that node.
select stable_id, layer, created_at
from public.thylora_graph_nodes
where stable_id in (
  'LAW-STORE-DRAW-VALUE-001',
  'METHOD-THYLORA-OBSERVE-TO-NEXT-STEP-001',
  'LANE-FAMOUS-THOUGHT-001',
  'WORK-SUNDAY-STORE-DRAW-553'
);

-- A5. GRAPH CONTEXT for the gate node, if it already exists.
select * from public.thylora_graph_context_v1('LAW-STORE-DRAW-VALUE-001');

-- A6. SEPARATE_FROM guard. Anything returned here must never be merged.
select * from public.thylora_graph_edges
where edge_type = 'SEPARATE_FROM'
  and (
    source_stable_id in (
      'LAW-STORE-DRAW-VALUE-001',
      'METHOD-THYLORA-OBSERVE-TO-NEXT-STEP-001',
      'LANE-FAMOUS-THOUGHT-001',
      'WORK-SUNDAY-STORE-DRAW-553'
    )
    or target_stable_id in (
      'LAW-STORE-DRAW-VALUE-001',
      'METHOD-THYLORA-OBSERVE-TO-NEXT-STEP-001',
      'LANE-FAMOUS-THOUGHT-001',
      'WORK-SUNDAY-STORE-DRAW-553'
    )
  );

-- A7. SEQUENCE 553 READBACK and all newer deltas.
select sequence_no, query_id, session_label, created_at
from public.thylora_query_carryforward
where sequence_no >= 553
order by sequence_no asc;

-- =====================================================================
-- SECTION B — WRITES. Run only after SECTION A is read and clean.
--
-- Every insert is guarded on stable_id with ON CONFLICT DO NOTHING, so a
-- re-run cannot create a duplicate node. No UPDATE is issued anywhere in
-- this file: an existing node is left exactly as it is, and any difference
-- is a CONFLICT for a human to resolve, not something to overwrite.
--
-- Column names below follow the convention used by the rest of this
-- backend. If SECTION A shows different column names, STOP and reconcile
-- rather than editing this file to make it run.
-- =====================================================================

begin;

insert into public.thylora_graph_nodes
  (stable_id, layer, node_type, label, properties, authority, evidence)
values
  ('LAW-STORE-DRAW-VALUE-001', 'Earth', 'LAW',
   'Store Draw Value Gate',
   jsonb_build_object(
     'gate_code', 'THY-GATE-STORE-DRAW-VALUE-001',
     'equation',  'D = A x H x W x T x M x P',
     'scale',     '0-5 each',
     'pass_rule', 'minimum factor >= 3 AND D >= 4096',
     'note',      '4096 = 4^6; threshold is four-of-five on every factor'
   ),
   'CHAIRMAN',
   'workrooms/WR-STORE-DRAW-553.md'),

  ('METHOD-THYLORA-OBSERVE-TO-NEXT-STEP-001', 'Earth', 'METHOD',
   'THYLORA Method',
   jsonb_build_object(
     'steps', jsonb_build_array(
       'OBSERVE','GAP','QUESTION','EVIDENCE','CONNECTION','TEST','NEXT STEP'),
     'readiness', 'DEMONSTRABLE',
     'service_status', 'NOT A SERVICE - no delivery workflow exists'
   ),
   'CHAIRMAN',
   'workrooms/WR-STORE-DRAW-553.md#6'),

  ('LANE-FAMOUS-THOUGHT-001', 'Earth', 'FORMAT',
   'Famous Thought Lane',
   jsonb_build_object(
     'format', 'FAMOUS THOUGHT -> NEXT QUESTION -> EVIDENCE -> TRANSFER',
     'quote_rule', 'speaker + exact wording + source + date where recoverable + rights note',
     'invention_rule', 'no invented quotes'
   ),
   'CHAIRMAN',
   'workrooms/WR-STORE-DRAW-553.md#4'),

  ('WORK-SUNDAY-STORE-DRAW-553', 'Earth', 'WORK',
   'Sunday Store Draw 553',
   jsonb_build_object(
     'work_code', 'THY-WORK-SUNDAY-STORE-DRAW-553',
     'posts_scored', 3,
     'posts_passing_binding', 0,
     'post_a_binding_d', 3000,
     'post_b_binding_d', 2400,
     'post_c_binding_d', 720,
     'blocking_factor_a_b', 'P - no route witnessed',
     'blocking_factor_c', 'W - nothing obtainable at destination',
     'published', false,
     'scheduled', false
   ),
   'CHAIRMAN',
   'workrooms/WR-STORE-DRAW-553.md')
on conflict (stable_id) do nothing;

insert into public.thylora_graph_edges
  (source_stable_id, target_stable_id, edge_type, properties)
values
  ('WORK-SUNDAY-STORE-DRAW-553', 'LAW-STORE-DRAW-VALUE-001',
   'GOVERNED_BY', jsonb_build_object('enforced', true, 'bypassed', false)),
  ('WORK-SUNDAY-STORE-DRAW-553', 'METHOD-THYLORA-OBSERVE-TO-NEXT-STEP-001',
   'APPLIES', jsonb_build_object('surface', 'public concept only')),
  ('WORK-SUNDAY-STORE-DRAW-553', 'LANE-FAMOUS-THOUGHT-001',
   'APPLIES', jsonb_build_object('instance', 'Douglass 1857 West India Emancipation'))
on conflict do nothing;

insert into public.thylora_graph_versions
  (stable_id, version_note, authority, evidence)
values
  ('WORK-SUNDAY-STORE-DRAW-553',
   'Created from WR-STORE-DRAW-553. Preflight was blocked at authoring time; '
   'this row records the first successful reconciled write.',
   'CHAIRMAN',
   'workrooms/WR-STORE-DRAW-553.md');

-- VERIFY READBACK before committing.
select stable_id, layer, node_type, authority
from public.thylora_graph_nodes
where stable_id in (
  'LAW-STORE-DRAW-VALUE-001',
  'METHOD-THYLORA-OBSERVE-TO-NEXT-STEP-001',
  'LANE-FAMOUS-THOUGHT-001',
  'WORK-SUNDAY-STORE-DRAW-553'
)
order by stable_id;

-- Expect exactly 4 rows, all layer = 'Earth'.
-- If the count differs, ROLLBACK and reconcile by hand.

commit;
