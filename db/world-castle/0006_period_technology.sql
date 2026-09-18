-- THYLORA WORLD · 0006 · PERIOD_TECH_PROFILE_CASTLE_001
-- Workroom: WR-WORLD-CASTLE-001
--
-- "This castle represents ONE historical period on the planet. Other time
--  periods may exist elsewhere on the planet but do not bleed into this scene."
--
-- The profile ships with an EMPTY allow-list because the period is unresolved.
-- That is deliberate. A filled allow-list would encode an assumed tradition, and
-- every downstream decision — bond pattern, cart gauge, roof timbering, lighting,
-- recordkeeping — would inherit it silently and then be defended as canon.

begin;

do $$ begin
  create type thyw_tech_category as enum (
    'TRANSPORT','LIGHTING','TOOLS','MASONRY','WOODWORKING','METALWORK',
    'COMMUNICATIONS','HOUSEHOLD_SYSTEMS','EDUCATION_MATERIALS',
    'WEAPONS_SECURITY','AGRICULTURE','MEDICINE','RECORDKEEPING'
  );
exception when duplicate_object then null; end $$;

create table if not exists thyw_period_profiles (
  profile_id        text primary key,
  scene_frame_id    text references thyw_world_frames(frame_id),
  period_resolved   boolean not null default false,
  era_label         text,
  calendar_basis    text,
  earliest_bound    text,
  latest_bound      text,
  region_tradition  text,
  basis             text not null,
  generator_ref     text not null default 'world/lib/period.js',
  created_at        timestamptz not null default now(),
  constraint thyw_period_resolved_needs_an_era
    check (not period_resolved or (era_label is not null and region_tradition is not null))
);

comment on constraint thyw_period_resolved_needs_an_era on thyw_period_profiles is
  'A period may not be declared resolved without naming the era and the tradition it resolved to.';

-- Candidate traditions, for Chairman selection. Order carries no preference and
-- selection is explicit.
create table if not exists thyw_period_candidate_traditions (
  candidate_id   text primary key,
  profile_id     text not null references thyw_period_profiles(profile_id) on delete cascade,
  tradition_key  text not null,
  note           text not null,
  selected       boolean not null default false,
  selected_by    text,
  selected_at    timestamptz,
  created_at     timestamptz not null default now(),
  constraint thyw_tradition_selection_is_chairman
    check (not selected or (selected_by = 'CHAIRMAN' and selected_at is not null)),
  unique (profile_id, tradition_key)
);

create table if not exists thyw_period_allowed (
  allowed_id  uuid primary key default gen_random_uuid(),
  profile_id  text not null references thyw_period_profiles(profile_id) on delete cascade,
  category    thyw_tech_category not null,
  item        text not null,
  basis       text not null,
  source_id   text references thyw_evidence_sources(source_id),
  created_at  timestamptz not null default now(),
  unique (profile_id, category, item)
);

create table if not exists thyw_period_prohibited (
  prohibited_id  uuid primary key default gen_random_uuid(),
  profile_id     text not null references thyw_period_profiles(profile_id) on delete cascade,
  category       thyw_tech_category not null,
  item           text not null,
  basis          text not null,
  evidence_state thyw_evidence_state not null default 'INFERRED',
  anachronism_floor boolean not null default true,
  created_at     timestamptz not null default now(),
  unique (profile_id, category, item)
);

comment on table thyw_period_prohibited is
  'The anachronism floor: items prohibited for EVERY candidate tradition, so they can be asserted before the period is chosen. Marked INFERRED, not VERIFIED, because the period itself is not verified.';

-- Nothing may be admitted to the allow-list while the period is unresolved.
-- With no period, admission is a guess wearing a table row.
create or replace function thyw_assert_period_resolved_before_admitting() returns trigger
language plpgsql as $$
declare resolved boolean;
begin
  select period_resolved into resolved from thyw_period_profiles where profile_id = new.profile_id;
  if resolved is distinct from true then
    raise exception 'THYW: cannot admit % to profile % while its period is unresolved', new.item, new.profile_id
      using errcode = '23514';
  end if;
  return new;
end $$;

drop trigger if exists thyw_period_allowed_guard on thyw_period_allowed;
create trigger thyw_period_allowed_guard
  before insert or update on thyw_period_allowed
  for each row execute function thyw_assert_period_resolved_before_admitting();

-- An item may not sit on both lists at once.
create or replace function thyw_assert_not_both_lists() returns trigger
language plpgsql as $$
begin
  if exists (select 1 from thyw_period_prohibited p
              where p.profile_id = new.profile_id and p.category = new.category and p.item = new.item) then
    raise exception 'THYW: % is already prohibited in profile %', new.item, new.profile_id using errcode = '23514';
  end if;
  return new;
end $$;

drop trigger if exists thyw_period_allowed_not_prohibited on thyw_period_allowed;
create trigger thyw_period_allowed_not_prohibited
  before insert or update on thyw_period_allowed
  for each row execute function thyw_assert_not_both_lists();

commit;
