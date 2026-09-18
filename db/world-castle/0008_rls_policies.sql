-- THYLORA WORLD · 0008 · Row level security
-- Workroom: WR-WORLD-CASTLE-001
--
-- Reading the world is not authority over it. Every thyw_* table is readable by
-- signed-in members and writable only by the service role, with the sole
-- exception of nothing: there is no client write path into world geometry.
-- World state is written by Chairman-executed processes, not by browsers.
--
-- thylora_is_chairman() already exists on the live backend (it gates
-- thylora_continuity_floor_state()). It is referenced here through a guarded
-- lookup so these files still apply to a database that does not have it.

begin;

-- A local stand-in, created ONLY if the real function is absent. On the live
-- backend the existing definition wins and this block does nothing.
do $$ begin
  if to_regprocedure('public.thylora_is_chairman()') is null then
    execute $fn$
      create function public.thylora_is_chairman() returns boolean
      language sql stable as $body$ select false $body$;
    $fn$;
  end if;
end $$;

do $$
declare t text;
begin
  foreach t in array array[
    'thyw_evidence_sources','thyw_datums','thyw_world_frames','thyw_origin_rules',
    'thyw_materials','thyw_build_phases','thyw_elements','thyw_element_versions',
    'thyw_masonry_specs','thyw_masonry_instances',
    'thyw_storeys','thyw_rooms','thyw_room_occupants','thyw_room_lighting',
    'thyw_openings','thyw_room_links','thyw_room_use_proposals',
    'thyw_traveller_profiles','thyw_circulation_nodes','thyw_gates',
    'thyw_circulation_segments','thyw_routes','thyw_route_segments',
    'thyw_route_solutions','thyw_route_solution_constraints',
    'thyw_period_profiles','thyw_period_candidate_traditions',
    'thyw_period_allowed','thyw_period_prohibited',
    'thyw_unknown_register','thyw_world_versions','thyw_supersessions',
    'thyw_name_candidates'
  ] loop
    if to_regclass('public.' || t) is not null then
      execute format('alter table public.%I enable row level security', t);

      -- Read: any signed-in member. The world is meant to be seen.
      execute format('drop policy if exists %I on public.%I', t || '_read', t);
      execute format(
        'create policy %I on public.%I for select to authenticated using (true)',
        t || '_read', t);

      -- Write: no client role. Not authenticated, not anon. World geometry is
      -- written by Chairman-executed service processes only.
      execute format('revoke insert, update, delete on public.%I from authenticated', t);
      execute format('revoke insert, update, delete on public.%I from anon', t);
      execute format('revoke select on public.%I from anon', t);
      execute format('grant select on public.%I to authenticated', t);
    end if;
  end loop;
end $$;

-- Supersession is the one table where even reading is Chairman-only: it records
-- what the Chairman chose to overwrite, and that is a governance record.
do $$ begin
  if to_regclass('public.thyw_supersessions') is not null then
    drop policy if exists thyw_supersessions_read on public.thyw_supersessions;
    create policy thyw_supersessions_read on public.thyw_supersessions
      for select to authenticated using (public.thylora_is_chairman());
  end if;
end $$;

commit;
