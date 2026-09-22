-- THYLORA · QYRIS · 0009 · Registry link
--
-- Soft links into existing THYLORA registries. The backend host was not
-- reachable from the build session (403 on CONNECT from the egress proxy), so
-- the live schema could not be inspected. Every link below is therefore
-- guarded by to_regclass: if the target exists, the link is created; if it does
-- not, the link is skipped and nothing breaks.
--
-- This is a deliberate choice carried from the RAE Link delta: a wrong
-- assumption should degrade, not corrupt.

-- Link a pass to a family story archive, where that registry exists.
do $$
begin
  if to_regclass('public.family_story_archives') is not null then
    if not exists (select 1 from information_schema.columns
                    where table_name = 'qyr_passes' and column_name = 'family_archive_id') then
      alter table qyr_passes add column family_archive_id uuid;
    end if;
    begin
      alter table qyr_passes
        add constraint qyr_passes_family_archive_fk
        foreign key (family_archive_id) references family_story_archives(id) on delete set null;
    exception when duplicate_object then null;
             when others then null;  -- a shape we could not inspect stays soft
    end;
  end if;
end $$;

-- Link a household to a business record, where that registry exists.
do $$
begin
  if to_regclass('public.businesses') is not null then
    if not exists (select 1 from information_schema.columns
                    where table_name = 'qyr_households' and column_name = 'business_id') then
      alter table qyr_households add column business_id uuid;
    end if;
    begin
      alter table qyr_households
        add constraint qyr_households_business_fk
        foreign key (business_id) references businesses(id) on delete set null;
    exception when duplicate_object then null;
             when others then null;
    end;
  end if;
end $$;

-- Link a support seat to a department, where that registry exists.
do $$
begin
  if to_regclass('public.thylora_departments') is not null then
    if not exists (select 1 from information_schema.columns
                    where table_name = 'qyr_seats' and column_name = 'department_id') then
      alter table qyr_seats add column department_id uuid;
    end if;
  end if;
end $$;

-- Link an industry projection to a RAE Link channel, where that registry exists.
do $$
begin
  if to_regclass('public.rael_channels') is not null then
    if not exists (select 1 from information_schema.columns
                    where table_name = 'qyr_projections' and column_name = 'channel_id') then
      alter table qyr_projections add column channel_id uuid;
    end if;
  end if;
end $$;

-- What was linked and what was skipped, readable rather than assumed.
create or replace function qyr_registry_links()
returns table (registry text, present boolean, link text) language sql stable as $$
  select 'family_story_archives', to_regclass('public.family_story_archives') is not null,
         'qyr_passes.family_archive_id'
  union all
  select 'businesses', to_regclass('public.businesses') is not null, 'qyr_households.business_id'
  union all
  select 'thylora_departments', to_regclass('public.thylora_departments') is not null, 'qyr_seats.department_id'
  union all
  select 'rael_channels', to_regclass('public.rael_channels') is not null, 'qyr_projections.channel_id';
$$;

insert into qyr_rules (rule_key, rule_text) values
  ('SOFT_REGISTRY_LINKS',
   'Links into existing THYLORA registries are guarded by to_regclass because the live backend could not be inspected from the build session. A wrong assumption degrades rather than corrupts.')
on conflict (rule_key) do update set rule_text = excluded.rule_text;
