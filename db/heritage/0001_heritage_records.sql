-- THYLORA HERITAGE · 0001 · Records-first ancestry and ancestral language lexicon
-- Workroom: WR-HERITAGE-001
--
-- Reviewable, NOT applied. Applying DDL to thylora-dash (jvsdxhrfhtlgaknhjxlz) is a
-- production mutation held for Chairman execution.
--
-- Rules held:
--   * Additive only. Every object is new and prefixed thy_heritage_. Nothing existing is
--     dropped, renamed or rewritten.
--   * No second story archive. Family stories stay in the existing Family Story Archive;
--     a person here may carry a soft reference (story_ref) to that archive.
--   * A person is never "proven" by a story. evidence_state moves to DOCUMENTED only when
--     at least one record row names them.
--   * No SSNs, tax documents or private identity numbers anywhere in this schema.
--   * Private by default. Each family tree is readable and writable only by its owner and
--     the collaborators the owner adds.

begin;

create table if not exists thy_heritage_trees (
  id             uuid primary key default gen_random_uuid(),
  owner_user_id  uuid not null references auth.users(id) on delete cascade,
  title          text not null check (length(title) between 1 and 200),
  created_at     timestamptz not null default now()
);

create table if not exists thy_heritage_tree_members (
  tree_id     uuid not null references thy_heritage_trees(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  member_role text not null check (member_role in ('EDITOR','VIEWER')),
  added_at    timestamptz not null default now(),
  primary key (tree_id, user_id)
);

create table if not exists thy_heritage_persons (
  id               uuid primary key default gen_random_uuid(),
  tree_id          uuid not null references thy_heritage_trees(id) on delete cascade,
  display_name     text not null check (length(display_name) between 1 and 200),
  name_variants    text[] not null default '{}',        -- spellings seen in records
  birth_year_est   int check (birth_year_est between 1500 and 2100),
  birth_place      text,
  death_year_est   int check (death_year_est between 1500 and 2100),
  father_id        uuid references thy_heritage_persons(id) on delete set null,
  mother_id        uuid references thy_heritage_persons(id) on delete set null,
  evidence_state   text not null default 'STORY_ONLY'
                   check (evidence_state in ('STORY_ONLY','RECORD_CANDIDATE','DOCUMENTED','DISPUTED')),
  story_ref        text,                                -- soft link into the Family Story Archive
  created_at       timestamptz not null default now(),
  check (father_id is null or father_id <> id),
  check (mother_id is null or mother_id <> id)
);

-- One row per document actually looked at. source_code matches heritage/sources.json (SRC-###).
create table if not exists thy_heritage_records (
  id            uuid primary key default gen_random_uuid(),
  tree_id       uuid not null references thy_heritage_trees(id) on delete cascade,
  source_code   text not null check (source_code ~ '^SRC-[0-9]{3}$'),
  record_title  text not null,
  record_year   int check (record_year between 1500 and 2100),
  citation      text not null check (length(citation) >= 10),  -- must be re-findable by a stranger
  image_url     text,
  transcription text,
  found_by      uuid references auth.users(id),
  found_at      timestamptz not null default now()
);

-- Which person a record names, and how strong the match is.
create table if not exists thy_heritage_evidence_links (
  record_id   uuid not null references thy_heritage_records(id) on delete cascade,
  person_id   uuid not null references thy_heritage_persons(id) on delete cascade,
  match_state text not null check (match_state in ('NAMED_EXACT','NAMED_VARIANT','INFERRED','REJECTED')),
  reasoning   text not null check (length(reasoning) >= 10),
  linked_at   timestamptz not null default now(),
  primary key (record_id, person_id)
);

-- Lexicon mirrors heritage/lexicon.json. Shared reference data: readable by any signed-in member.
create table if not exists thy_heritage_lexicon (
  entry_code    text primary key check (entry_code ~ '^(BLK|EGY|EDO|HEB)-[0-9]{3}$'),
  lang          text not null check (lang in ('blackfoot','egyptian','edo','hebrew')),
  native        text not null,
  romanization  text,
  gloss         text not null,
  domain        text not null,
  confidence    text not null check (confidence in ('HIGH','MEDIUM','LOW')),
  entry_status  text not null default 'SEED_PENDING_CONFIRMATION'
                check (entry_status in ('SEED_PENDING_CONFIRMATION','CONFIRMED','DISPUTED','RETIRED')),
  note          text,
  updated_at    timestamptz not null default now()
);

-- A pronunciation is only ever recorded from a named human source, never generated.
create table if not exists thy_heritage_pronunciations (
  id            uuid primary key default gen_random_uuid(),
  entry_code    text not null references thy_heritage_lexicon(entry_code) on delete cascade,
  confirmed_by  text not null check (length(confirmed_by) >= 3),   -- speaker, teacher or dictionary page
  source_kind   text not null check (source_kind in ('NATIVE_SPEAKER','TEACHER','PUBLISHED_DICTIONARY','SCHOLARLY_CONVENTION')),
  audio_url     text,
  ipa           text,
  confirmed_at  timestamptz not null default now()
);

create index if not exists thy_heritage_persons_tree_idx on thy_heritage_persons(tree_id);
create index if not exists thy_heritage_records_tree_idx on thy_heritage_records(tree_id);
create index if not exists thy_heritage_lexicon_lang_idx on thy_heritage_lexicon(lang, domain);

-- DOCUMENTED requires a record that names the person. Stories alone cannot promote.
create or replace function thy_heritage_guard_evidence_state()
returns trigger language plpgsql as $$
begin
  if new.evidence_state = 'DOCUMENTED' and not exists (
    select 1 from thy_heritage_evidence_links l
    where l.person_id = new.id and l.match_state in ('NAMED_EXACT','NAMED_VARIANT')
  ) then
    raise exception 'HERITAGE: % cannot be DOCUMENTED without a record that names them', new.display_name;
  end if;
  return new;
end $$;

drop trigger if exists thy_heritage_evidence_state_guard on thy_heritage_persons;
create trigger thy_heritage_evidence_state_guard
  before insert or update of evidence_state on thy_heritage_persons
  for each row execute function thy_heritage_guard_evidence_state();

-- A lexicon entry cannot be CONFIRMED without at least one human pronunciation source.
create or replace function thy_heritage_guard_lexicon_status()
returns trigger language plpgsql as $$
begin
  if new.entry_status = 'CONFIRMED' and not exists (
    select 1 from thy_heritage_pronunciations p where p.entry_code = new.entry_code
  ) then
    raise exception 'HERITAGE: % cannot be CONFIRMED without a named pronunciation source', new.entry_code;
  end if;
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists thy_heritage_lexicon_status_guard on thy_heritage_lexicon;
create trigger thy_heritage_lexicon_status_guard
  before insert or update of entry_status on thy_heritage_lexicon
  for each row execute function thy_heritage_guard_lexicon_status();

-- Row level security ------------------------------------------------------------

create or replace function thy_heritage_can_access(p_tree_id uuid, p_write boolean)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from thy_heritage_trees t where t.id = p_tree_id and t.owner_user_id = auth.uid())
      or exists (select 1 from thy_heritage_tree_members m
                 where m.tree_id = p_tree_id and m.user_id = auth.uid()
                   and (not p_write or m.member_role = 'EDITOR'));
$$;

alter table thy_heritage_trees           enable row level security;
alter table thy_heritage_tree_members    enable row level security;
alter table thy_heritage_persons         enable row level security;
alter table thy_heritage_records         enable row level security;
alter table thy_heritage_evidence_links  enable row level security;
alter table thy_heritage_lexicon         enable row level security;
alter table thy_heritage_pronunciations  enable row level security;

drop policy if exists thy_heritage_trees_rw on thy_heritage_trees;
create policy thy_heritage_trees_rw on thy_heritage_trees
  for all to authenticated
  using (owner_user_id = auth.uid() or thy_heritage_can_access(id, false))
  with check (owner_user_id = auth.uid());

drop policy if exists thy_heritage_members_owner on thy_heritage_tree_members;
create policy thy_heritage_members_owner on thy_heritage_tree_members
  for all to authenticated
  using (user_id = auth.uid() or exists (select 1 from thy_heritage_trees t where t.id = tree_id and t.owner_user_id = auth.uid()))
  with check (exists (select 1 from thy_heritage_trees t where t.id = tree_id and t.owner_user_id = auth.uid()));

drop policy if exists thy_heritage_persons_rw on thy_heritage_persons;
create policy thy_heritage_persons_rw on thy_heritage_persons
  for all to authenticated
  using (thy_heritage_can_access(tree_id, false))
  with check (thy_heritage_can_access(tree_id, true));

drop policy if exists thy_heritage_records_rw on thy_heritage_records;
create policy thy_heritage_records_rw on thy_heritage_records
  for all to authenticated
  using (thy_heritage_can_access(tree_id, false))
  with check (thy_heritage_can_access(tree_id, true));

drop policy if exists thy_heritage_links_rw on thy_heritage_evidence_links;
create policy thy_heritage_links_rw on thy_heritage_evidence_links
  for all to authenticated
  using (exists (select 1 from thy_heritage_records r where r.id = record_id and thy_heritage_can_access(r.tree_id, false)))
  with check (exists (select 1 from thy_heritage_records r where r.id = record_id and thy_heritage_can_access(r.tree_id, true)));

-- Lexicon and pronunciations: members read; only the service role writes (curated data).
drop policy if exists thy_heritage_lexicon_read on thy_heritage_lexicon;
create policy thy_heritage_lexicon_read on thy_heritage_lexicon
  for select to authenticated using (true);

drop policy if exists thy_heritage_pron_read on thy_heritage_pronunciations;
create policy thy_heritage_pron_read on thy_heritage_pronunciations
  for select to authenticated using (true);

grant select, insert, update, delete on thy_heritage_trees, thy_heritage_tree_members,
  thy_heritage_persons, thy_heritage_records, thy_heritage_evidence_links to authenticated;
grant select on thy_heritage_lexicon, thy_heritage_pronunciations to authenticated;
grant execute on function thy_heritage_can_access(uuid, boolean) to authenticated;

-- Register the workroom in the existing department registry, if present (same guard as RAE Link 0010).
do $$
begin
  if to_regclass('public.thylora_departments') is not null and exists (
    select 1 from information_schema.columns
    where table_name = 'thylora_departments' and column_name = 'department_code'
  ) then
    execute $q$
      insert into thylora_departments (department_code, name, purpose, status, priority)
      values ('WR-HERITAGE-001', 'Heritage Records & Ancestral Language',
              'Records-first ancestry research, ancestral language lexicons (Blackfoot, Egyptian, Edo, Hebrew) and heritage creator partnership.',
              'IMPLEMENTATION_ACTIVE', 'P1')
      on conflict (department_code) do update set purpose = excluded.purpose, status = excluded.status
    $q$;
  end if;
end $$;

commit;
