-- THE ROOT HOUSE · 0001 · lineage people, findings and credits
-- Workroom: WR-ROOTHOUSE-001
-- HELD FOR CHAIRMAN APPLY to thylora-dash (jvsdxhrfhtlgaknhjxlz). Not applied.
--
-- Rules carried into the schema:
--   1. A person is an Ahnentafel slot inside one family tree (1 = the root person).
--   2. DOCUMENTED and PROVEN require at least one finding that cites a record.
--   3. Every finding credits at least one contributor. No anonymous discoveries.
--   4. Living people are private to the tree owner by default.

begin;

create table if not exists lin_trees (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null default auth.uid(),
  title       text not null,
  -- Soft link to family_story_archives.archive_code when a story exists.
  story_archive_ref text,
  created_at  timestamptz not null default now()
);

create table if not exists lin_people (
  id          uuid primary key default gen_random_uuid(),
  tree_id     uuid not null references lin_trees(id) on delete cascade,
  slot        integer not null check (slot >= 1),
  name        text,
  clue        text,
  place       text,
  born_year   integer check (born_year between 1400 and 2100),
  died_year   integer check (died_year between 1400 and 2100),
  living      boolean not null default false,
  confidence  text not null default 'ORAL'
              check (confidence in ('ORAL','INDICATED','DOCUMENTED','PROVEN')),
  updated_at  timestamptz not null default now(),
  unique (tree_id, slot),
  constraint lin_people_has_something check (name is not null or clue is not null),
  constraint lin_people_years check (died_year is null or born_year is null or died_year >= born_year)
);

create table if not exists lin_findings (
  id          uuid primary key default gen_random_uuid(),
  tree_id     uuid not null references lin_trees(id) on delete cascade,
  slot        integer not null,
  fact        text not null,
  source_code text not null,
  record_ref  text,
  found_at    timestamptz not null default now()
);

create table if not exists lin_credits (
  finding_id  uuid not null references lin_findings(id) on delete cascade,
  who         text not null,
  role        text not null check (role in ('FOUND','CONFIRMED','REMEMBERED','TRANSCRIBED','TESTED_DNA','HOLDS_RECORD')),
  is_world_staff boolean not null default false,
  primary key (finding_id, who, role)
);

-- A person cannot be graded DOCUMENTED or PROVEN without a cited finding.
create or replace function lin_guard_confidence() returns trigger
language plpgsql as $$
begin
  if new.confidence in ('DOCUMENTED','PROVEN') and not exists (
    select 1 from lin_findings f where f.tree_id = new.tree_id and f.slot = new.slot
  ) then
    raise exception 'ROOT HOUSE: slot % cannot be % without a cited finding', new.slot, new.confidence;
  end if;
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists lin_people_confidence on lin_people;
create trigger lin_people_confidence before insert or update on lin_people
  for each row execute function lin_guard_confidence();

-- A finding without a credit is rejected at commit time.
create or replace function lin_guard_credit() returns trigger
language plpgsql as $$
begin
  if not exists (select 1 from lin_credits c where c.finding_id = new.id) then
    raise exception 'ROOT HOUSE: finding % has no credit', new.id;
  end if;
  return null;
end $$;

drop trigger if exists lin_findings_need_credit on lin_findings;
create constraint trigger lin_findings_need_credit after insert on lin_findings
  deferrable initially deferred for each row execute function lin_guard_credit();

alter table lin_trees    enable row level security;
alter table lin_people   enable row level security;
alter table lin_findings enable row level security;
alter table lin_credits  enable row level security;

drop policy if exists lin_trees_owner on lin_trees;
create policy lin_trees_owner on lin_trees for all
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());

drop policy if exists lin_people_owner on lin_people;
create policy lin_people_owner on lin_people for all
  using (exists (select 1 from lin_trees t where t.id = tree_id and t.owner_id = auth.uid()))
  with check (exists (select 1 from lin_trees t where t.id = tree_id and t.owner_id = auth.uid()));

drop policy if exists lin_findings_owner on lin_findings;
create policy lin_findings_owner on lin_findings for all
  using (exists (select 1 from lin_trees t where t.id = tree_id and t.owner_id = auth.uid()))
  with check (exists (select 1 from lin_trees t where t.id = tree_id and t.owner_id = auth.uid()));

drop policy if exists lin_credits_owner on lin_credits;
create policy lin_credits_owner on lin_credits for all
  using (exists (select 1 from lin_findings f join lin_trees t on t.id = f.tree_id
                 where f.id = finding_id and t.owner_id = auth.uid()))
  with check (exists (select 1 from lin_findings f join lin_trees t on t.id = f.tree_id
                      where f.id = finding_id and t.owner_id = auth.uid()));

commit;
