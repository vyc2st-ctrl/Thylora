-- RAE LINK · 0010 · Registry link into the existing THYLORA backend
-- Workroom: WR-RAELINK-001
--
-- EVIDENCE GAP: the build session could not reach jvsdxhrfhtlgaknhjxlz.supabase.co
-- (egress policy denied CONNECT with 403), so the live shape of thylora_departments,
-- products, family_story_archives and the passport registry could NOT be verified.
-- Every statement below is therefore guarded by to_regclass and column checks: if
-- the target table is absent or shaped differently, the statement no-ops instead of
-- failing the migration or inventing a competing table.

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
        values ('WR-RAELINK-001', 'RAE Link',
                'Owned audience and creator media network: channels, media pipeline, rights, audience interaction, creator earnings and payout evidence.',
                'IMPLEMENTATION_ACTIVE', 'P1')
        on conflict (department_code) do update
          set purpose = excluded.purpose,
              status = excluded.status
      $q$;
      raise notice 'RAE LINK: workroom registered in thylora_departments';
    end if;
  else
    raise notice 'RAE LINK: thylora_departments not present; workroom registration skipped';
  end if;
end $$;

-- 2. Harden soft links where the target table does exist. A soft reference stays
--    a soft reference until the target is verified, so nothing breaks either way.
create or replace function rael_resolve_product_ref(p_ref text)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare result jsonb := jsonb_build_object('ref', p_ref, 'resolved', false);
begin
  if p_ref is null then return result; end if;
  if to_regclass('public.products') is not null then
    begin
      execute 'select to_jsonb(p) from products p where p.id::text = $1 or p.product_code = $1 limit 1'
        into result using p_ref;
      if result is null then
        return jsonb_build_object('ref', p_ref, 'resolved', false, 'reason','NOT_FOUND');
      end if;
      return jsonb_build_object('ref', p_ref, 'resolved', true, 'product', result);
    exception when others then
      return jsonb_build_object('ref', p_ref, 'resolved', false, 'reason','SHAPE_MISMATCH');
    end;
  end if;
  return jsonb_build_object('ref', p_ref, 'resolved', false, 'reason','REGISTRY_ABSENT');
end $$;

-- 3. Only a RELEASED product may carry an active purchase path. RAE Link asks
--    the existing store registry rather than keeping a second product truth.
create or replace function rael_product_is_purchasable(p_ref text)
returns boolean language plpgsql stable security definer set search_path = public as $$
declare resolved jsonb; state text;
begin
  resolved := rael_resolve_product_ref(p_ref);
  if not (resolved->>'resolved')::boolean then return false; end if;
  state := coalesce(resolved->'product'->>'release_state', resolved->'product'->>'state', '');
  return upper(state) = 'RELEASED';
end $$;

grant execute on function rael_resolve_product_ref(text) to authenticated;
grant execute on function rael_product_is_purchasable(text) to anon, authenticated;

commit;
