-- THY-WORK-MATH-FAMOUS-THOUGHT-559 · 0001 · Graph preflight contract
-- Workroom: WR-MATH-THOUGHT-559
--
-- EVIDENCE GAP (unchanged from WR-RAELINK-001): the build session cannot reach
-- the backend host. Outbound CONNECT to jvsdxhrfhtlgaknhjxlz.supabase.co was
-- refused by the egress proxy with 403, so thylora_graph_nodes,
-- thylora_graph_edges, thylora_graph_versions, thylora_graph_context_v1 and the
-- three new registries could NOT be read, and their live shape is UNVERIFIED.
--
-- Therefore every statement in this directory is guarded by to_regclass and
-- column checks. If a target is absent or shaped differently the statement
-- no-ops and raises a notice instead of failing the migration or inventing a
-- competing table. Nothing here creates a second source of truth.
--
-- The preflight order is fixed and is enforced by thy_math_graph_preflight_v1:
--   STABLE ID -> GRAPH CONTEXT -> LAYER -> AUTHORITY -> VERSION -> EVIDENCE -> WRITE
-- A write whose preflight is incomplete is refused. UNKNOWN stays UNKNOWN.

begin;

-- 1. Preflight ledger. Every intended graph touch is recorded here first, in the
--    order above, so the writeback report in section 10 of the work order is a
--    query result rather than a claim.
create table if not exists thy_math_graph_preflight (
  preflight_id      bigserial primary key,
  work_code         text not null default 'THY-WORK-MATH-FAMOUS-THOUGHT-559',
  stable_id         text not null,
  graph_context     jsonb,
  layer             text,
  authority         text,
  graph_version     text,
  evidence          jsonb,
  context_read      boolean not null default false,
  layer_resolved    boolean not null default false,
  authority_resolved boolean not null default false,
  version_resolved  boolean not null default false,
  evidence_recorded boolean not null default false,
  write_allowed     boolean not null default false,
  outcome           text not null default 'PENDING',
  note              text,
  created_at        timestamptz not null default now(),
  constraint thy_math_preflight_layer_known
    check (layer is null or layer in ('Earth', 'EdereAirah', 'UNKNOWN')),
  constraint thy_math_preflight_outcome_known
    check (outcome in ('PENDING', 'READ_ONLY', 'WRITE_ALLOWED', 'REFUSED_INCOMPLETE_PREFLIGHT',
                       'REFUSED_GRAPH_UNREACHABLE', 'UNKNOWN'))
);

comment on table thy_math_graph_preflight is
  'THY-WORK-MATH-FAMOUS-THOUGHT-559: one row per intended graph touch, proving the
   STABLE ID -> CONTEXT -> LAYER -> AUTHORITY -> VERSION -> EVIDENCE -> WRITE order
   was followed before any node or edge was written.';

-- An audit ledger, not a set: the same stable id is legitimately preflighted
-- many times, including twice in one transaction. Indexed, never deduplicated.
create index if not exists thy_math_graph_preflight_stable_idx
  on thy_math_graph_preflight (work_code, stable_id, created_at desc);

-- 2. Read the authoritative graph context. This never creates anything. If the
--    overlay or the function is absent, the answer is UNKNOWN, not a guess.
create or replace function thy_math_graph_context(p_stable_id text)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare ctx jsonb;
begin
  if p_stable_id is null or btrim(p_stable_id) = '' then
    return jsonb_build_object('stable_id', p_stable_id, 'status', 'UNKNOWN',
                              'reason', 'NO_STABLE_ID');
  end if;

  if to_regprocedure('public.thylora_graph_context_v1(text)') is not null then
    begin
      execute 'select to_jsonb(thylora_graph_context_v1($1))' into ctx using p_stable_id;
      if ctx is null then
        return jsonb_build_object('stable_id', p_stable_id, 'status', 'UNKNOWN',
                                  'reason', 'NODE_NOT_FOUND');
      end if;
      return jsonb_build_object('stable_id', p_stable_id, 'status', 'READ', 'context', ctx);
    exception when others then
      return jsonb_build_object('stable_id', p_stable_id, 'status', 'UNKNOWN',
                                'reason', 'CONTEXT_FUNCTION_SHAPE_MISMATCH');
    end;
  end if;

  if to_regclass('public.thylora_graph_nodes') is not null then
    begin
      execute 'select to_jsonb(n) from thylora_graph_nodes n where n.stable_id = $1 limit 1'
        into ctx using p_stable_id;
      if ctx is null then
        return jsonb_build_object('stable_id', p_stable_id, 'status', 'UNKNOWN',
                                  'reason', 'NODE_NOT_FOUND');
      end if;
      return jsonb_build_object('stable_id', p_stable_id, 'status', 'READ_DEGRADED',
                                'reason', 'CONTEXT_FUNCTION_ABSENT', 'context', ctx);
    exception when others then
      return jsonb_build_object('stable_id', p_stable_id, 'status', 'UNKNOWN',
                                'reason', 'NODE_TABLE_SHAPE_MISMATCH');
    end;
  end if;

  return jsonb_build_object('stable_id', p_stable_id, 'status', 'UNKNOWN',
                            'reason', 'GRAPH_OVERLAY_ABSENT');
end $$;

comment on function thy_math_graph_context(text) is
  'Read-only graph context lookup. Returns status READ, READ_DEGRADED or UNKNOWN.
   Never creates a node and never substitutes a default for a missing one.';

-- 3. The preflight gate itself. Returns the ledger row id and whether a write is
--    permitted. A caller that ignores this and writes anyway is writing without
--    authority; the writeback migration (0006) refuses to do so.
create or replace function thy_math_graph_preflight_v1(
  p_stable_id text,
  p_evidence  jsonb default null
) returns thy_math_graph_preflight language plpgsql security definer set search_path = public as $$
declare
  ctx        jsonb;
  row_out    thy_math_graph_preflight;
  v_layer    text;
  v_auth     text;
  v_version  text;
  v_status   text;
begin
  ctx := thy_math_graph_context(p_stable_id);
  v_status := ctx ->> 'status';

  v_layer   := coalesce(ctx #>> '{context,layer}', 'UNKNOWN');
  v_auth    := coalesce(ctx #>> '{context,authority}', 'UNKNOWN');
  v_version := coalesce(ctx #>> '{context,version}', ctx #>> '{context,graph_version}', 'UNKNOWN');

  if v_layer not in ('Earth', 'EdereAirah') then v_layer := 'UNKNOWN'; end if;

  insert into thy_math_graph_preflight (
    stable_id, graph_context, layer, authority, graph_version, evidence,
    context_read, layer_resolved, authority_resolved, version_resolved,
    evidence_recorded, write_allowed, outcome, note
  ) values (
    p_stable_id,
    ctx,
    v_layer,
    v_auth,
    v_version,
    p_evidence,
    v_status in ('READ', 'READ_DEGRADED'),
    v_layer <> 'UNKNOWN',
    v_auth <> 'UNKNOWN',
    v_version <> 'UNKNOWN',
    p_evidence is not null,
    v_status in ('READ', 'READ_DEGRADED')
      and v_layer <> 'UNKNOWN' and v_auth <> 'UNKNOWN'
      and v_version <> 'UNKNOWN' and p_evidence is not null,
    case
      when v_status = 'UNKNOWN' and ctx ->> 'reason' = 'GRAPH_OVERLAY_ABSENT'
        then 'REFUSED_GRAPH_UNREACHABLE'
      when v_status in ('READ', 'READ_DEGRADED')
        and v_layer <> 'UNKNOWN' and v_auth <> 'UNKNOWN'
        and v_version <> 'UNKNOWN' and p_evidence is not null
        then 'WRITE_ALLOWED'
      when v_status in ('READ', 'READ_DEGRADED') then 'REFUSED_INCOMPLETE_PREFLIGHT'
      else 'UNKNOWN'
    end,
    ctx ->> 'reason'
  ) returning * into row_out;

  return row_out;
end $$;

comment on function thy_math_graph_preflight_v1(text, jsonb) is
  'Runs the required preflight for one stable id and records it. write_allowed is
   true only when context, layer, authority, version and evidence are all present.';

commit;
