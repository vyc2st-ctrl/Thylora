-- RaeLynk · 0010 · Registry link into the existing THYLORA backend
-- Workroom: WR-RAELINK-001
--
-- EVIDENCE GAP CLOSED 2026-09-17. The live backend was inspected directly this
-- session, and the shapes assumed by the original draft were WRONG:
--
--   * public.products has NO product_code column. It has product_id. The original
--     resolver queried p.product_code, which raises undefined_column, which the
--     exception handler swallowed as SHAPE_MISMATCH. Net effect: no product ref
--     would EVER have resolved, silently, forever.
--   * public.products has NO release_state and NO state column. It has
--     approval_state and release_evidence_state. The original purchasability check
--     read release_state/state, so it would have returned false for every product
--     even if resolution had worked.
--
-- Both are corrected below against the verified live shape. Verified live values:
--   approval_state in (planned, approved, published)
--   release_evidence_state in (missing, partial, verified)
-- A product is purchasable only when it is BOTH published AND evidence-verified.
--
-- thylora_departments was verified and the original guard was correct: the table
-- exists, carries department_code, and department_code has a UNIQUE constraint,
-- so the ON CONFLICT target is valid.
--
-- The to_regclass and column guards are RETAINED. The shape is verified as of
-- today, not guaranteed forever, and a migration that hard-fails on drift is worse
-- than one that no-ops and says so.

begin;

-- 1. Register the workroom in the existing department registry, if it exists.
do $$
begin
  if to_regclass('public.thylora_departments') is not null then
    if exists (
      select 1 from information_schema.columns
      where table_name = 'thylora_departments' and column_name = 'department_code'
    ) then
      execute $q$
        insert into thylora_departments (department_code, name, purpose, status, priority)
        values ('WR-RAELINK-001', 'RaeLynk',
                'Owned audience and creator media network: channels, media pipeline, rights, audience interaction, creator earnings and payout evidence.',
                'IMPLEMENTATION_ACTIVE', 'P1')
        on conflict (department_code) do update
          set purpose = excluded.purpose,
              status = excluded.status
      $q$;
      raise notice 'RaeLynk: workroom registered in thylora_departments';
    end if;
  else
    raise notice 'RaeLynk: thylora_departments not present; workroom registration skipped';
  end if;
end $$;

-- 2. Harden soft links where the target table does exist. A soft reference stays
--    a soft reference until the target is verified, so nothing breaks either way.
create or replace function rael_resolve_product_ref(p_ref text)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare
  result jsonb;
  v_has_product_id boolean;
begin
  if p_ref is null then
    return jsonb_build_object('ref', null, 'resolved', false, 'reason','NULL_REF');
  end if;

  if to_regclass('public.products') is null then
    return jsonb_build_object('ref', p_ref, 'resolved', false, 'reason','REGISTRY_ABSENT');
  end if;

  -- Verified live shape: products(id uuid, product_id text, ...). Probe for the
  -- business key rather than assuming it, so a future rename degrades to a
  -- reported MISSING_BUSINESS_KEY instead of a swallowed SHAPE_MISMATCH.
  select exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='products' and column_name='product_id'
  ) into v_has_product_id;

  begin
    if v_has_product_id then
      execute 'select to_jsonb(p) from products p where p.id::text = $1 or p.product_id = $1 limit 1'
        into result using p_ref;
    else
      execute 'select to_jsonb(p) from products p where p.id::text = $1 limit 1'
        into result using p_ref;
    end if;
  exception when others then
    return jsonb_build_object('ref', p_ref, 'resolved', false,
      'reason','SHAPE_MISMATCH', 'detail', sqlerrm);
  end;

  if result is null then
    return jsonb_build_object('ref', p_ref, 'resolved', false, 'reason','NOT_FOUND',
      'business_key_present', v_has_product_id);
  end if;
  return jsonb_build_object('ref', p_ref, 'resolved', true, 'product', result);
end $$;

-- 3. Only a RELEASED product may carry an active purchase path. RaeLynk asks
--    the existing store registry rather than keeping a second product truth.
create or replace function rael_product_is_purchasable(p_ref text)
returns boolean language plpgsql stable security definer set search_path = public as $$
declare resolved jsonb; state text;
begin
  resolved := rael_resolve_product_ref(p_ref);
  if not (resolved->>'resolved')::boolean then return false; end if;

  -- Verified live shape: approval_state and release_evidence_state. release_state
  -- and state do not exist on public.products and must not be read here.
  -- Fail closed: anything other than published + verified is not purchasable.
  state := lower(coalesce(resolved->'product'->>'approval_state', ''));
  if state <> 'published' then return false; end if;

  state := lower(coalesce(resolved->'product'->>'release_evidence_state', ''));
  return state = 'verified';
end $$;

grant execute on function rael_resolve_product_ref(text) to authenticated;
grant execute on function rael_product_is_purchasable(text) to anon, authenticated;

commit;
