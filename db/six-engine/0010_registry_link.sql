-- SIX UNDERSTANDING ENGINE · 0010 · Guarded links into existing THYLORA registries
-- Workroom: WR-SIXENGINE-001
--
-- NO SECOND SOURCE OF TRUTH. Identity, the family archive, passports, departments
-- and RAE Link channels stay where they already live. This engine holds a soft
-- reference and nothing more.
--
-- Every link is guarded by to_regclass: if the target table is not present in
-- this backend, the statement is skipped instead of failing the migration. That
-- is what makes this file safe to apply against a backend whose exact registry
-- set could not be verified from the authoring session.

begin;

-- 1. Learner ↔ existing profile ------------------------------------------------
do $$ begin
  if to_regclass('public.rael_profiles') is not null then
    begin
      alter table sixu_learners
        add constraint sixu_learners_profile_fk
        foreign key (user_id) references rael_profiles(user_id) on delete set null;
    exception when duplicate_object then null; end;
  end if;
end $$;

-- 2. Personal-record questions may only be answered from records the backend
--    actually holds (FM-14). This view names the legitimate origins; it does not
--    copy a single row out of them.
do $$ begin
  if to_regclass('public.rael_family_partnerships') is not null then
    execute $v$
      create or replace view sixu_personal_record_origins as
      select 'FAMILY_ARCHIVE'::text as origin_scope,
             'rael_family_partnerships'::text as source_table
      union all
      select 'BACKEND_RECORD', 'rael_profiles'
    $v$;
  else
    execute $v$
      create or replace view sixu_personal_record_origins as
      select 'BACKEND_RECORD'::text as origin_scope, null::text as source_table
      where false
    $v$;
  end if;
end $$;

-- 3. A department may own a slice of the concept graph. Soft code reference: no
--    hard foreign key, because department registries differ between backends.
do $$ begin
  alter table sixu_concepts add column if not exists owning_department_code text;
exception when duplicate_column then null; end $$;

do $$ begin
  alter table sixu_word_senses add column if not exists owning_department_code text;
exception when duplicate_column then null; end $$;

-- 4. A run may be attributed to a learning surface that already exists (app,
--    RAE Link, Time Run). Soft text code, checked against nothing, so a new
--    surface needs no migration.
do $$ begin
  alter table sixu_runs add column if not exists surface_code text not null default 'APP';
exception when duplicate_column then null; end $$;

-- 5. Where the RAE Link rights gate exists, a question that reaches a family
--    story must carry the same consent posture. The engine reads that gate; it
--    does not re-implement it.
do $$ begin
  if to_regclass('public.rael_rights_records') is not null then
    execute $v$
      create or replace function sixu_family_story_is_readable(p_asset_id uuid)
      returns boolean language sql stable security definer set search_path = public as $f$
        select exists (
          select 1 from rael_rights_records r
           where r.asset_id = p_asset_id and r.gate_state = 'PASSED');
      $f$
    $v$;
  else
    execute $v$
      create or replace function sixu_family_story_is_readable(p_asset_id uuid)
      returns boolean language sql immutable as $f$
        -- No rights gate in this backend: nothing is readable by default.
        select false;
      $f$
    $v$;
  end if;
end $$;

commit;
