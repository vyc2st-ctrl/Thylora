-- ROOT HOUSE · 0001 · people, claims, sources, researchers, credits, tasks, leads, stories
-- Workroom: WR-LINEAGE-001 · Backend of record: thylora-dash (NOT applied — Chairman action)
--
-- RULES ENFORCED IN SCHEMA:
--   1. Seats are Ahnentafel numbers; the line is derived, never typed by hand.
--   2. A claim's grade can only rise above FAMILY_TOLD with reviewed evidence rows.
--   3. Credits are append-only. Corrections are new rows.
--   4. Worker leads are LEAD until a person on a desk reviews them.
--   5. Every family tree is owner-scoped; living people are never public.

begin;

create extension if not exists pgcrypto;

do $$ begin
  create type lin_grade as enum ('UNKNOWN','FAMILY_TOLD','LEAD','POSSIBLE','PROBABLE','PROVEN','CONTESTED');
exception when duplicate_object then null; end $$;

create table if not exists lin_trees (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null references auth.users(id) on delete cascade,
  label      text not null,
  created_at timestamptz not null default now()
);

create or replace function lin_line_of(seat integer) returns text
language sql immutable as $$
  select case when seat < 4 then null
    else (array['FF','FM','MF','MM'])[((seat >> (floor(log(2, seat::numeric))::int - 2)) & 3) + 1] end;
$$;

create table if not exists lin_people (
  id           uuid primary key default gen_random_uuid(),
  tree_id      uuid not null references lin_trees(id) on delete cascade,
  seat         integer not null check (seat >= 1),
  line         text generated always as (lin_line_of(seat)) stored,
  given        text,
  surname      text,
  maiden_name  text,
  birth_year   integer check (birth_year between 1500 and 2100),
  birth_place  text,
  death_year   integer check (death_year between 1500 and 2100),
  death_place  text,
  is_living    boolean not null default true,
  created_at   timestamptz not null default now(),
  unique (tree_id, seat),
  constraint lin_people_death_after_birth check (death_year is null or birth_year is null or death_year >= birth_year),
  constraint lin_people_dead_not_living check (death_year is null or is_living = false)
);

create table if not exists lin_sources (
  id      text primary key,
  name    text not null,
  holder  text not null,
  region  text not null,
  era     text not null,
  access  text not null check (access in ('FREE','FREE_ACCOUNT','PAID','ONSITE','REQUEST')),
  desk    text not null,
  url     text not null check (url ~ '^https?://'),
  why     text not null
);

create table if not exists lin_researchers (
  id     text primary key,
  name   text not null,
  desk   text not null,
  role   text not null,
  world_character boolean not null default true,
  constraint lin_researchers_disclosed check (world_character = true)
);

create table if not exists lin_claims (
  id          uuid primary key default gen_random_uuid(),
  person_id   uuid not null references lin_people(id) on delete cascade,
  field       text not null,
  value       text not null,
  grade       lin_grade not null default 'FAMILY_TOLD',
  teller      text,
  created_at  timestamptz not null default now(),
  constraint lin_claims_told_has_teller check (grade <> 'FAMILY_TOLD' or teller is not null)
);

create table if not exists lin_evidence (
  id          uuid primary key default gen_random_uuid(),
  claim_id    uuid not null references lin_claims(id) on delete cascade,
  source_id   text not null references lin_sources(id),
  citation    text not null,
  informant   text,
  value       text not null,
  reviewed_by text references lin_researchers(id),
  reviewed_at timestamptz,
  created_at  timestamptz not null default now(),
  constraint lin_evidence_review_pair check ((reviewed_by is null) = (reviewed_at is null))
);

create table if not exists lin_credits (
  id          bigserial primary key,
  person_id   uuid not null references lin_people(id) on delete cascade,
  researcher  text not null references lin_researchers(id),
  source_id   text not null references lin_sources(id),
  claim_field text not null,
  note        text not null default '',
  credited_at timestamptz not null default now()
);

create table if not exists lin_tasks (
  id         uuid primary key default gen_random_uuid(),
  tree_id    uuid not null references lin_trees(id) on delete cascade,
  seat       integer not null,
  need       text not null,
  ask        text not null,
  desk       text not null,
  assigned   text references lin_researchers(id),
  state      text not null default 'OPEN' check (state in ('OPEN','WORKING','ANSWERED','BLOCKED')),
  created_at timestamptz not null default now()
);

create table if not exists lin_leads (
  id         uuid primary key default gen_random_uuid(),
  tree_id    uuid not null references lin_trees(id) on delete cascade,
  seat       integer not null,
  provider   text not null,
  source_id  text not null references lin_sources(id),
  query      text not null,
  title      text,
  url        text not null,
  found_at   timestamptz not null default now(),
  reviewed   boolean not null default false,
  disposition text check (disposition in ('ACCEPTED','REJECTED','NEEDS_MORE')),
  unique (tree_id, seat, url),
  constraint lin_leads_reviewed_has_disposition check (reviewed = (disposition is not null))
);

create table if not exists lin_stories (
  id        uuid primary key default gen_random_uuid(),
  tree_id   uuid not null references lin_trees(id) on delete cascade,
  seat      integer,
  teller    text not null,
  asked_by  text,
  question  text,
  text      text not null,
  source    text not null default 'Parlor',
  recorded  date not null default current_date
);

-- Grade can rise above FAMILY_TOLD/LEAD only with reviewed evidence behind it.
create or replace function lin_claim_grade_guard() returns trigger language plpgsql as $$
declare independent int;
begin
  select count(distinct (e.source_id, coalesce(e.informant,'unknown'))) into independent
    from lin_evidence e where e.claim_id = new.id and e.reviewed_at is not null;
  if new.grade = 'POSSIBLE' and independent < 1
     or new.grade = 'PROBABLE' and independent < 2
     or new.grade = 'PROVEN' and independent < 3 then
    raise exception 'LIN_GRADE_WITHOUT_EVIDENCE: % needs more reviewed independent records (has %)', new.grade, independent;
  end if;
  return new;
end $$;
drop trigger if exists lin_claim_grade_guard on lin_claims;
create trigger lin_claim_grade_guard before insert or update of grade on lin_claims
  for each row execute function lin_claim_grade_guard();

-- Credits are append-only.
create or replace function lin_credits_append_only() returns trigger language plpgsql as $$
begin raise exception 'LIN_CREDITS_APPEND_ONLY: add a correcting credit instead'; end $$;
drop trigger if exists lin_credits_append_only on lin_credits;
create trigger lin_credits_append_only before update or delete on lin_credits
  for each row execute function lin_credits_append_only();

-- Row-level security: a tree and everything in it belongs to its owner.
alter table lin_trees   enable row level security;
alter table lin_people  enable row level security;
alter table lin_claims  enable row level security;
alter table lin_evidence enable row level security;
alter table lin_credits enable row level security;
alter table lin_tasks   enable row level security;
alter table lin_leads   enable row level security;
alter table lin_stories enable row level security;
alter table lin_sources enable row level security;
alter table lin_researchers enable row level security;

create or replace function lin_owns_tree(t uuid) returns boolean language sql stable as $$
  select exists (select 1 from lin_trees where id = t and owner_id = auth.uid());
$$;

drop policy if exists lin_trees_owner on lin_trees;
create policy lin_trees_owner on lin_trees for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
drop policy if exists lin_people_owner on lin_people;
create policy lin_people_owner on lin_people for all using (lin_owns_tree(tree_id)) with check (lin_owns_tree(tree_id));
drop policy if exists lin_tasks_owner on lin_tasks;
create policy lin_tasks_owner on lin_tasks for all using (lin_owns_tree(tree_id)) with check (lin_owns_tree(tree_id));
drop policy if exists lin_leads_owner on lin_leads;
create policy lin_leads_owner on lin_leads for all using (lin_owns_tree(tree_id)) with check (lin_owns_tree(tree_id));
drop policy if exists lin_stories_owner on lin_stories;
create policy lin_stories_owner on lin_stories for all using (lin_owns_tree(tree_id)) with check (lin_owns_tree(tree_id));
drop policy if exists lin_claims_owner on lin_claims;
create policy lin_claims_owner on lin_claims for all
  using (exists (select 1 from lin_people p where p.id = person_id and lin_owns_tree(p.tree_id)))
  with check (exists (select 1 from lin_people p where p.id = person_id and lin_owns_tree(p.tree_id)));
drop policy if exists lin_evidence_owner on lin_evidence;
create policy lin_evidence_owner on lin_evidence for all
  using (exists (select 1 from lin_claims c join lin_people p on p.id = c.person_id where c.id = claim_id and lin_owns_tree(p.tree_id)))
  with check (exists (select 1 from lin_claims c join lin_people p on p.id = c.person_id where c.id = claim_id and lin_owns_tree(p.tree_id)));
drop policy if exists lin_credits_owner on lin_credits;
create policy lin_credits_owner on lin_credits for select
  using (exists (select 1 from lin_people p where p.id = person_id and lin_owns_tree(p.tree_id)));
drop policy if exists lin_credits_insert on lin_credits;
create policy lin_credits_insert on lin_credits for insert
  with check (exists (select 1 from lin_people p where p.id = person_id and lin_owns_tree(p.tree_id)));
drop policy if exists lin_sources_read on lin_sources;
create policy lin_sources_read on lin_sources for select using (true);
drop policy if exists lin_researchers_read on lin_researchers;
create policy lin_researchers_read on lin_researchers for select using (true);

grant select on lin_sources, lin_researchers to anon, authenticated;
grant select, insert, update, delete on lin_trees, lin_people, lin_claims, lin_evidence, lin_tasks, lin_leads, lin_stories to authenticated;
grant select, insert on lin_credits to authenticated;
grant usage on sequence lin_credits_id_seq to authenticated;

commit;
