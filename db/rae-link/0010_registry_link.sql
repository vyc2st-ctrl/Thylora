-- RAE LINK · 0010 · Registry link into the existing THYLORA backend · v2
-- Workroom: WR-RAELINK-001
--
-- v2 · 2026-09-24 · written against the LIVE shape of thylora-dash, read-only
-- inspected through the Supabase connector (PostgreSQL 17.6). Blocker B1 (backend
-- unreachable) is cleared for reads. v1 is preserved unchanged at
-- db/rae-link/history/0010_registry_link.v1.sql (sha256 d59611f5…0bd1).
--
-- What v1 got wrong, proven by validation/live_shape_stub.sql:
--   D1  v1 inserted the workroom into thylora_departments. Live, that table has
--       six further NOT NULL columns, a FK to thylora_agents and a status CHECK that
--       rejects 'IMPLEMENTATION_ACTIVE'. The insert raised, and because the file is
--       one transaction, BOTH functions below were never created.
--       v2 registers in thylora_workroom_registry, where every other workroom lives.
--   D2  v1 matched products.product_code. Live products has no such column; the
--       key is product_id. Every lookup returned SHAPE_MISMATCH.
--   D3  v1 read release_state / state. Live products carries approval_state and
--       release_evidence_state, and the store gate that actually decides whether a
--       Shopify product may sell is thylora_store_product_readiness.active_allowed.
--       v1 therefore answered "not purchasable" for everything, including the one
--       product that has really sold.
--
-- Every statement stays guarded: an absent or reshaped registry degrades to a
-- notice or an unresolved answer, never to a failed migration.

begin;

-- 1. Register the workroom where workrooms are registered. Insert-only: if a
--    record already exists it is left exactly as it is (history is not overwritten).
do $$
begin
  if to_regclass('public.thylora_workroom_registry') is null then
    raise notice 'RAE LINK: thylora_workroom_registry not present; registration skipped';
    return;
  end if;
  begin
    insert into thylora_workroom_registry
      (workroom_code, title, lane, purpose, state, source_of_truth,
       current_blockers, completion_tests, evidence, restart_point)
    values (
      'WR-RAELINK-001',
      'RAE Link',
      'Owned media network · creator economy · streaming · audience interaction · revenue distribution',
      'Owned audience and creator media network: channels, media pipeline, rights, audience interaction, creator earnings and payout evidence.',
      'SCHEMA_APPLIED_RUNTIME_OPEN',
      'rael_* tables in thylora-dash; db/rae-link/; workrooms/WR-RAELINK-001.md',
      jsonb_build_array(
        jsonb_build_object('code','B3','title','Provider decisions open','severity','HELD'),
        jsonb_build_object('code','B4','title','Creator payout provider','severity','HELD'),
        jsonb_build_object('code','B5','title','Legal and public launch','severity','HELD')),
      jsonb_build_array(
        jsonb_build_object('test','npm test','expect','all pass'),
        jsonb_build_object('test','db/rae-link/validation/run.sh','expect','exit 0')),
      jsonb_build_object('migrations', 10, 'tables', 40, 'registered_by', '0010 v2'),
      'Read workrooms/WR-RAELINK-001.md section 6.'
    )
    on conflict (workroom_code) do nothing;
    raise notice 'RAE LINK: workroom registration attempted in thylora_workroom_registry';
  exception when others then
    raise notice 'RAE LINK: workroom registration skipped (%): %', sqlstate, sqlerrm;
  end;
end $$;

-- 2. Resolve a product reference against the existing product registry.
--    Accepts the registry's business key (product_id) or its uuid.
create or replace function rael_resolve_product_ref(p_ref text)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare result jsonb;
begin
  if p_ref is null then
    return jsonb_build_object('ref', p_ref, 'resolved', false, 'reason', 'NULL_REF');
  end if;
  if to_regclass('public.products') is null then
    return jsonb_build_object('ref', p_ref, 'resolved', false, 'reason', 'REGISTRY_ABSENT');
  end if;
  begin
    execute 'select to_jsonb(p) from products p where p.product_id = $1 or p.id::text = $1 limit 1'
      into result using p_ref;
  exception when others then
    return jsonb_build_object('ref', p_ref, 'resolved', false, 'reason', 'SHAPE_MISMATCH');
  end;
  if result is null then
    return jsonb_build_object('ref', p_ref, 'resolved', false, 'reason', 'NOT_FOUND');
  end if;
  return jsonb_build_object('ref', p_ref, 'resolved', true, 'product', result);
end $$;

-- 3. May this reference carry an active purchase path? RAE Link asks the existing
--    registries and keeps no product truth of its own. Two independent routes,
--    each of which must be fully evidenced:
--      a. the store gate: a thylora_store_product_readiness row for this external
--         product id with active_allowed = true (every release gate passed);
--      b. the product registry: approval_state = 'published' AND
--         release_evidence_state = 'verified'.
--    'published' with only partial evidence is NOT purchasable.
create or replace function rael_product_is_purchasable(p_ref text)
returns boolean language plpgsql stable security definer set search_path = public as $$
declare ok boolean := false; resolved jsonb;
begin
  if p_ref is null then return false; end if;

  if to_regclass('public.thylora_store_product_readiness') is not null then
    begin
      execute 'select coalesce(bool_or(active_allowed), false)
                 from thylora_store_product_readiness where external_product_id = $1'
        into ok using p_ref;
    exception when others then ok := false;
    end;
    if ok then return true; end if;
  end if;

  resolved := rael_resolve_product_ref(p_ref);
  if not coalesce((resolved->>'resolved')::boolean, false) then return false; end if;
  return lower(coalesce(resolved->'product'->>'approval_state', '')) = 'published'
     and lower(coalesce(resolved->'product'->>'release_evidence_state', '')) = 'verified';
end $$;

grant execute on function rael_resolve_product_ref(text) to authenticated;
grant execute on function rael_product_is_purchasable(text) to anon, authenticated;

commit;
