-- CASTLE SERVICE ZONE · 0007 · Projection into canon, and readback verification
-- Workroom: WR-CASTLE-SERVICE-ZONE-576
--
-- This file is what keeps the slice from becoming a second geometry system.
--
-- thy_csz_* is intake. thylora_castle_space_geometry and
-- thylora_castle_space_connections are truth. Projection walks intake into truth
-- when truth is present and shape-compatible. When the canon tables are absent or
-- differently shaped, projection REFUSES and says so — it never creates them, never
-- renames them, and never keeps a competing copy that pretends to be them.
--
-- Every function is to_regclass-guarded because the live schema could not be read
-- from the build session (egress 403 to the backend host).

begin;

-- ---------------------------------------------------------------- capability probe

create or replace function thy_csz_canon_probe()
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare result jsonb := '{}'::jsonb; t text; cols text[];
begin
  foreach t in array array[
    'thylora_castle_space_geometry','thylora_castle_space_connections',
    'thylora_castle_object_state_registry','thylora_castle_object_events',
    'thylora_person_world_sheet','thylora_mirror_name_registry'
  ] loop
    if to_regclass('public.' || t) is null then
      result := result || jsonb_build_object(t, jsonb_build_object('present', false));
    else
      select array_agg(column_name::text order by column_name)
        into cols
        from information_schema.columns
       where table_schema = 'public' and table_name = t;
      result := result || jsonb_build_object(t,
        jsonb_build_object('present', true, 'columns', to_jsonb(cols)));
    end if;
  end loop;
  return jsonb_build_object(
    'probed_at', now(),
    'work_code', 'THY-WORK-KITCHEN-SUITE-RESIDENCE-576',
    'tables', result);
end $$;

comment on function thy_csz_canon_probe() is
  'Answers the one question the build session could not: which canon tables exist and with what columns. Run this before projecting anything.';

-- ---------------------------------------------------------------- name resolution
-- EDEREAIRAH FIRST. Native names are resolved FROM the mirror registry, never
-- authored into it by this work.

create or replace function thy_csz_resolve_native_name(p_stable_id text)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare found text;
begin
  if to_regclass('public.thylora_mirror_name_registry') is null then
    return jsonb_build_object('stable_id', p_stable_id, 'resolved', false,
                              'reason', 'MIRROR_REGISTRY_ABSENT_OR_UNREADABLE');
  end if;
  begin
    execute
      'select native_name from thylora_mirror_name_registry
        where stable_id = $1 or subject_id = $1 limit 1'
      into found using p_stable_id;
  exception when others then
    return jsonb_build_object('stable_id', p_stable_id, 'resolved', false,
                              'reason', 'SHAPE_MISMATCH');
  end;
  if found is null then
    return jsonb_build_object('stable_id', p_stable_id, 'resolved', false,
                              'reason', 'NOT_REGISTERED');
  end if;
  return jsonb_build_object('stable_id', p_stable_id, 'resolved', true,
                            'native_name', found, 'authority', 'EDEREAIRAH_NATIVE');
end $$;

-- ---------------------------------------------------------------- projection

create or replace function thy_csz_project_spaces(p_commit boolean default false)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  canon regclass := to_regclass('public.thylora_castle_space_geometry');
  needed text[] := array['stable_id'];
  missing text[];
  candidate record;
  applied int := 0;
  refused jsonb := '[]'::jsonb;
begin
  if canon is null then
    return jsonb_build_object('projected', false,
      'reason', 'CANON_ABSENT',
      'detail', 'thylora_castle_space_geometry is not present in this database. '
             || 'This function does not create it. A geometry table is authored '
             || 'by the dimensional-twin lane (THY-WORK-CASTLE-DIMENSIONAL-TWIN-572), not here.');
  end if;

  select array_agg(c) into missing
    from unnest(needed) c
   where not exists (
     select 1 from information_schema.columns
      where table_schema='public' and table_name='thylora_castle_space_geometry'
        and column_name = c);
  if missing is not null then
    return jsonb_build_object('projected', false, 'reason','SHAPE_MISMATCH',
                              'missing_columns', to_jsonb(missing));
  end if;

  for candidate in
    select * from thy_csz_space_intake order by stable_id
  loop
    -- A PROPOSED dimension is never written into canon geometry silently. It is
    -- offered, and only a CHAIRMAN_AUTHORED or DOCUMENTED row may land.
    if candidate.dimension_state in ('PROPOSED','UNKNOWN','DERIVED_FROM_ERC') then
      refused := refused || jsonb_build_object(
        'stable_id', candidate.stable_id,
        'reason', 'STATE_' || candidate.dimension_state::text,
        'detail', 'not fact; held in intake for review');
      continue;
    end if;
    if p_commit then
      execute format(
        'insert into %s (stable_id) values ($1) on conflict do nothing', canon)
        using candidate.stable_id;
      applied := applied + 1;
    end if;
  end loop;

  return jsonb_build_object(
    'projected', p_commit,
    'canon_table', canon::text,
    'applied', applied,
    'refused', refused,
    'note', 'Projection writes only the identity column by default. Column-by-column '
         || 'mapping is authored once thy_csz_canon_probe() has reported the real '
         || 'geometry column names. Guessing them would fabricate canon.');
end $$;

comment on function thy_csz_project_spaces(boolean) is
  'Dry run by default. Refuses every PROPOSED / DERIVED_FROM_ERC / UNKNOWN row by design: intake does not become geometry truth without a Chairman state change.';

-- ---------------------------------------------------------------- readback

create or replace function thy_csz_readback()
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare r jsonb;
begin
  select jsonb_build_object(
    'work_code',        'THY-WORK-KITCHEN-SUITE-RESIDENCE-576',
    'read_at',          now(),
    'spaces',           (select count(*) from thy_csz_space_intake),
    'spaces_public',    (select count(*) from thy_csz_space_intake where public_safe),
    'links',            (select count(*) from thy_csz_adjacency_intake),
    'flows',            (select count(*) from thy_csz_flow),
    'flow_steps',       (select count(*) from thy_csz_flow_step),
    'steps_failing_fit',(select count(*) from thy_csz_flow_step where fit_verdict = 'FAILS_FIT'),
    'steps_unverified', (select count(*) from thy_csz_flow_step where fit_verdict = 'UNVERIFIED'),
    'herb_states',      (select count(*) from thy_csz_herb_state),
    'objects',          (select count(*) from thy_csz_object_home),
    'objects_homeless', (select count(*) from thy_csz_object_home where home_space is null),
    'wardrobe_rows',    (select count(*) from thy_csz_wardrobe),
    'residence_models', (select count(*) from thy_csz_residence_option),
    'residence_selected',(select count(*) from thy_csz_residence_option where chairman_selected),
    'relief_rows',      (select count(*) from thy_csz_relief_matrix),
    'dimension_states', (select jsonb_object_agg(dimension_state, n)
                           from (select dimension_state, count(*) n
                                   from thy_csz_space_intake group by 1) z),
    'native_names_open',(select count(*) from thy_csz_space_intake
                          where native_name is null),
    'marks_in_world',   (select count(*) from thy_csz_brand_mark where in_world),
    'conflicts_open',   (select count(*) from thy_csz_conflict where resolution like 'OPEN%'),
    'unknowns_open',    (select count(*) from thy_csz_unknown),
    'decisions_pending',(select count(*) from thy_csz_chairman_decision where not decided),
    'canon',            thy_csz_canon_probe()
  ) into r;
  return r;
end $$;

comment on function thy_csz_readback() is
  'WRITE BACKEND. VERIFY READBACK. This is the verify half: one call returns what actually landed, including how many rows are still PROPOSED and how many canon tables were reachable.';

-- ---------------------------------------------------------------- no-teleport check
-- An object whose wash / dry / repair location is not reachable from its in-use
-- location by a recorded link is a physical impossibility. Report, do not hide.

create or replace function thy_csz_teleport_report()
returns table (object_id text, from_space text, to_space text, purpose text)
language sql stable as $$
  with pairs as (
    select o.object_id, o.in_use_space as a, o.wash_space   as b, 'WASH'::text   as purpose from thy_csz_object_home o
    union all
    select o.object_id, o.wash_space,        o.dry_space,         'DRY'          from thy_csz_object_home o
    union all
    select o.object_id, o.home_space,        o.in_use_space,      'ISSUE'        from thy_csz_object_home o
  )
  select p.object_id, p.a, p.b, p.purpose
    from pairs p
   where p.a is not null and p.b is not null and p.a <> p.b
     and not exists (
       select 1 from thy_csz_adjacency_intake l
        where (l.space_a = p.a and l.space_b = p.b)
           or (l.space_a = p.b and l.space_b = p.a))
     -- two hops through the service corridor also count as reachable
     and not exists (
       select 1
         from thy_csz_adjacency_intake l1
         join thy_csz_adjacency_intake l2
           on l2.space_a = 'CSZ-SERVCORR-01' or l2.space_b = 'CSZ-SERVCORR-01'
        where (l1.space_a = p.a and l1.space_b = 'CSZ-SERVCORR-01'
               or l1.space_b = p.a and l1.space_a = 'CSZ-SERVCORR-01')
          and (l2.space_a = p.b or l2.space_b = p.b));
$$;

comment on function thy_csz_teleport_report() is
  'NO TELEPORTING. Returns every declared object move that no recorded link can carry. An empty result is the passing state.';

commit;
