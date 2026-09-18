-- THYLORA WORLD · 0009 · Non-regression check, unknown census and the Wq gate
-- Workroom: WR-WORLD-CASTLE-001
--
-- These functions are the backend half of world/lib/. They exist so the floor is
-- enforceable inside the database, not only inside a Node process that someone
-- has to remember to run.

begin;

-- ---------------------------------------------------------------------------
-- Unknown census
-- ---------------------------------------------------------------------------
create or replace function thyw_unknown_census()
returns table (object_kind text, object_id text, unknown_field text)
language sql stable as $$
  select 'ELEMENT', e.element_id, f.field
    from thyw_elements e
    cross join lateral (values
      ('local_placement', e.local_x_mm is null or e.local_y_mm is null or e.local_z_mm is null),
      ('dimensions',      e.length_mm is null and e.width_mm is null and e.height_mm is null),
      ('orientation',     e.orientation_mdeg is null),
      ('material',        e.material_id is null),
      ('build_phase',     e.build_phase_id is null)
    ) as f(field, missing)
   where f.missing
  union all
  select 'ROOM', r.room_id, f.field
    from thyw_rooms r
    cross join lateral (values
      ('dimensions',       r.length_mm is null and r.width_mm is null),
      ('ceiling_height',   r.ceiling_height_mm is null),
      ('purpose',          r.purpose is null),
      ('period_state',     r.period_state is null),
      ('furnishing_state', r.furnishing_state is null)
    ) as f(field, missing)
   where f.missing
  union all
  select 'OPENING', o.opening_id, f.field
    from thyw_openings o
    cross join lateral (values
      ('clear_width',  o.clear_width_mm is null),
      ('clear_height', o.clear_height_mm is null),
      ('sill_height',  o.sill_height_mm is null)
    ) as f(field, missing)
   where f.missing;
$$;

-- ---------------------------------------------------------------------------
-- Window / room rule audit
-- ---------------------------------------------------------------------------
-- The table constraints already make a spaceless opening uncommittable. This
-- function catches the cases constraints cannot: a reference that resolved when
-- it was written and no longer does.
create or replace function thyw_audit_openings()
returns table (opening_id text, rule text, severity text, statement text)
language sql stable as $$
  select o.opening_id, 'VISIBLE_OPENING_REAL_SPACE', 'HIGH',
         format('%s %s names inner room %s, which is not registered.', o.opening_kind, o.opening_id, o.inner_room_id)
    from thyw_openings o
   where o.inner_room_id is not null
     and not exists (select 1 from thyw_rooms r where r.room_id = o.inner_room_id)
  union all
  select o.opening_id, 'HOST_ELEMENT_RESOLVES', 'HIGH',
         format('%s %s is cut in element %s, which is not registered.', o.opening_kind, o.opening_id, o.host_element_id)
    from thyw_openings o
   where o.host_element_id is not null
     and not exists (select 1 from thyw_elements e where e.element_id = o.host_element_id);
$$;

-- ---------------------------------------------------------------------------
-- Non-regression: F_(n+1) >= F_n
-- ---------------------------------------------------------------------------
create or replace function thyw_check_non_regression(p_previous text, p_next text)
returns table (object_id text, facet thyw_protected_facet, statement text, permitted boolean)
language plpgsql stable as $$
declare prev jsonb; nxt jsonb;
begin
  select snapshot into prev from thyw_world_versions where world_version_id = p_previous;
  select snapshot into nxt  from thyw_world_versions where world_version_id = p_next;
  if prev is null or nxt is null then
    raise exception 'THYW: both world versions must exist and carry a snapshot (% , %)', p_previous, p_next
      using errcode = '22023';
  end if;

  return query
  with prev_el as (
    select value->>'element_id' as id, value as row
      from jsonb_array_elements(coalesce(prev->'elements', '[]'::jsonb))
  ), next_el as (
    select value->>'element_id' as id, value as row
      from jsonb_array_elements(coalesce(nxt->'elements', '[]'::jsonb))
  ), losses as (
    -- an object that existed and is gone
    select p.id as object_id, 'IDENTITY'::thyw_protected_facet as facet,
           format('Element %s existed at version %s and is absent at version %s.', p.id, p_previous, p_next) as statement
      from prev_el p left join next_el n on n.id = p.id
     where n.id is null
    union all
    -- a dimension that was established and is now NULL or different
    select p.id, 'DIMENSIONS'::thyw_protected_facet,
           format('Element %s lost or altered an established dimension.', p.id)
      from prev_el p join next_el n on n.id = p.id
     where (p.row->>'length_mm' is not null and p.row->>'length_mm' is distinct from n.row->>'length_mm')
        or (p.row->>'width_mm'  is not null and p.row->>'width_mm'  is distinct from n.row->>'width_mm')
        or (p.row->>'height_mm' is not null and p.row->>'height_mm' is distinct from n.row->>'height_mm')
    union all
    -- a placement that was established and is gone
    select p.id, 'GEOMETRY'::thyw_protected_facet,
           format('Element %s had an established placement and is unplaced at version %s.', p.id, p_next)
      from prev_el p join next_el n on n.id = p.id
     where p.row->>'local_x_mm' is not null and n.row->>'local_x_mm' is null
    union all
    -- provenance or verification that was established and is gone
    select p.id, 'PROVENANCE'::thyw_protected_facet,
           format('Element %s was VERIFIED at version %s and is %s at version %s.',
                  p.id, p_previous, coalesce(n.row->>'evidence_state', 'absent'), p_next)
      from prev_el p join next_el n on n.id = p.id
     where p.row->>'evidence_state' = 'VERIFIED' and n.row->>'evidence_state' is distinct from 'VERIFIED'
  )
  select l.object_id, l.facet, l.statement,
         exists (select 1 from thyw_supersessions s
                  where s.object_id = l.object_id and s.facet = l.facet) as permitted
    from losses l;
end $$;

comment on function thyw_check_non_regression(text, text) is
  'Returns every loss between two world versions. A loss with permitted = false is a non-regression violation and blocks the later version.';

-- ---------------------------------------------------------------------------
-- The Wq gate
-- ---------------------------------------------------------------------------
-- Wq = G x A x O x P x T x C x H x I x B x R x V. Any factor = 0 => HOLD.
--
-- The eleven letters' BINDINGS are not established in backend canon. This
-- function evaluates whatever bindings it is handed and reports that fact; it
-- does not define them.
create or replace function thyw_evaluate_wq(p_factors jsonb)
returns jsonb
language plpgsql stable as $$
declare letters text[] := array['G','A','O','P','T','C','H','I','B','R','V'];
        l text; v jsonb; product integer := 1; zeros jsonb := '[]'::jsonb;
begin
  foreach l in array letters loop
    v := p_factors -> l;
    if v is null then
      raise exception 'THYW: Wq is missing factor %', l using errcode = '22023';
    end if;
    if (v->>'value') not in ('0','1') then
      raise exception 'THYW: factor % must carry a value of 0 or 1, got %', l, v->>'value' using errcode = '22023';
    end if;
    if coalesce(v->>'basis', '') = '' then
      raise exception 'THYW: factor % carries no basis', l using errcode = '22023';
    end if;
    product := product * (v->>'value')::integer;
    if (v->>'value')::integer = 0 then
      zeros := zeros || jsonb_build_array(jsonb_build_object('letter', l, 'basis', v->>'basis'));
    end if;
  end loop;

  return jsonb_build_object(
    'wq', product,
    'decision', case when product = 0 then 'HOLD' else 'PROCEED' end,
    'zero_factors', zeros,
    'binding_state', 'PROPOSED_NOT_CANON',
    'binding_caution', 'The factor letters are evaluated as supplied. Their meanings are NOT established in backend canon.'
  );
end $$;

commit;
