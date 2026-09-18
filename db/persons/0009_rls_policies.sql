-- THYLORA PERSONS · 0009 · Row level security
-- Workroom: WR-PERSONS-001
--
-- ACCESS != AUTHORITY. World character records are production world data, not
-- per-user data. A signed-in client may READ the world; it may not write a
-- person into it. Every write path that matters (clearing a person for a scene,
-- generating a crowd, advancing a life) is a security-definer function in 0008
-- and is revoked from anon and authenticated, so a browser session cannot
-- invent a person, move a body lock, or rewrite history.
--
-- Two tables are readable by NOBODY through the client roles: the Earth
-- portrayal links and the simulated biological profile. They carry the link
-- between a world character and a real person, and consent state for a real
-- minor. That stays service-role only.

begin;

-- 1 · Enable RLS on every table in this lane. A table with RLS enabled and no
--     policy is readable by no client role, which is the safe default.
do $$
declare t record;
begin
  for t in
    select c.relname
      from pg_class c join pg_namespace n on n.oid = c.relnamespace
     where n.nspname = 'public' and c.relkind = 'r'
       and (c.relname like 'thyp\_%'
            or c.relname like 'studio\_world\_%'
            or c.relname like 'studio\_scene\_%'
            or c.relname like 'studio\_character\_%'
            or c.relname like 'thylora\_person\_%')
  loop
    execute format('alter table public.%I enable row level security', t.relname);
  end loop;
end $$;

-- 2 · World-readable reference and world state. Reading the world is allowed.
do $$
declare t text;
  readable text[] := array[
    'thyp_places','thyp_households','thyp_household_members','thyp_occupations',
    'thyp_person_occupation','thyp_person_assignments','thyp_schedules','thyp_schedule_blocks',
    'thyp_education_tracks','thyp_education_subjects','thyp_education_curriculum',
    'thyp_day_templates','thyp_person_education','thyp_education_progress',
    'thyp_scenes','thyp_visit_grants','thyp_crowd_cohorts','thyp_crowd_persons',
    'thyp_population_groups','thyp_relationships','thyp_skills','thyp_person_skills',
    'thyp_knowledge_items','thyp_person_knowledge','thyp_memory_ledger','thyp_life_events',
    'thyp_work_history','thyp_body_lock','thyp_body_lock_history','thyp_voice_profile',
    'thyp_cognition_profile','thyp_person_status','thyp_person_condition','thyp_injuries',
    'thyp_wardrobe_items','thyp_possessions','thyp_portraits','thyp_portrait_subjects',
    'thyp_portrait_provenance','thylora_person_identity','thylora_person_serial_registry',
    'studio_world_characters','studio_scene_character_snapshots','studio_character_state_ledger'];
begin
  foreach t in array readable loop
    if to_regclass('public.' || t) is not null then
      execute format($q$
        drop policy if exists %1$I on public.%2$I;
        create policy %1$I on public.%2$I for select to authenticated using (true);
      $q$, t || '_read', t);
    end if;
  end loop;
end $$;

-- 3 · Public (anon) reading is limited to the world's own reference data. An
--     unauthenticated visitor can see that the world has rooms and trades; it
--     cannot enumerate people, bodies, memories or portrait provenance.
do $$
declare t text;
  public_readable text[] := array[
    'thyp_places','thyp_occupations','thyp_education_tracks','thyp_education_subjects',
    'thyp_population_groups','thyp_skills'];
begin
  foreach t in array public_readable loop
    if to_regclass('public.' || t) is not null then
      execute format($q$
        drop policy if exists %1$I on public.%2$I;
        create policy %1$I on public.%2$I for select to anon using (true);
      $q$, t || '_public_read', t);
    end if;
  end loop;
end $$;

-- 4 · No client role gets a write policy anywhere in this lane. Writes go
--     through the security-definer functions, or through the service role.
--     Belt and braces: revoke table-level write privileges too.
do $$
declare t record;
begin
  for t in
    select c.relname
      from pg_class c join pg_namespace n on n.oid = c.relnamespace
     where n.nspname = 'public' and c.relkind = 'r'
       and (c.relname like 'thyp\_%'
            or c.relname like 'studio\_world\_%'
            or c.relname like 'studio\_scene\_%'
            or c.relname like 'studio\_character\_%'
            or c.relname like 'thylora\_person\_%')
  loop
    execute format('revoke insert, update, delete, truncate on public.%I from anon, authenticated', t.relname);
  end loop;
end $$;

-- 5 · Function grants. Read-only inspection is open to a signed-in client.
--     Everything that mutates the world is service-role only.
grant execute on function thyp_visible_gate(text, text)        to authenticated;
grant execute on function thyp_person_dossier(text)            to authenticated;
grant execute on function thyp_scene_manifest(text)            to authenticated;
grant execute on function thyp_location_reason(text, text, date) to authenticated;
grant execute on function thyp_place_and_ancestors(text)       to anon, authenticated;
grant execute on function thyp_body_lock_at(text, date)        to authenticated;

revoke all on function thyp_clear_for_scene(text, text, text, text)  from anon, authenticated;
revoke all on function thyp_crowd_generate(text, integer)            from anon, authenticated;
revoke all on function thyp_advance_person(text, date)               from anon, authenticated;
revoke all on function thyp_build_education_schedule(text, date)     from anon, authenticated;
revoke all on function thyp_issue_serial(thyp_serial_class, text, text) from anon, authenticated;

commit;
