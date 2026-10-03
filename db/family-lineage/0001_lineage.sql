-- FAMILY LINEAGE · 0001 · Kinship graph, testimony, corrections, record search
-- Workroom: WR-LINEAGE-001
--
-- WHY THIS EXISTS: family_story_archives (live, member app) stores a story as one
-- block of text. It cannot say who is whose child, cannot tell a full uncle from
-- a half uncle, cannot hold "I believed X, I later learned Y", and gives the teller
-- no way to correct a quote without silently rewriting history. This module adds
-- those things BESIDE the archive. It does not replace or copy it.
--
-- RULES HELD:
--   1. Additive only. Every object is new and prefixed fl_.
--   2. No second archive. A testimony points at an archive by archive_code (soft ref).
--   3. The teller's words are never overwritten. Corrections are append-only rows;
--      the corrected text is computed, and the original stays readable to the owner.
--   4. Parentage is stored per parent with a role, so half relations are derived
--      from the data, not typed in by hand.
--   5. Memory is labelled as memory until a record confirms it.
--   6. Private by default. Owner-only row level security.

begin;

create extension if not exists pgcrypto;

do $$ begin
  create type fl_confidence as enum ('MEMORY_REPORTED','FAMILY_CONSENSUS','RECORD_SUPPORTED','RECORD_CONFIRMED','DISPUTED');
exception when duplicate_object then null; end $$;

create table if not exists fl_persons (
  id              uuid primary key default gen_random_uuid(),
  owner_user_id   uuid not null references auth.users(id) on delete cascade,
  person_key      text not null,                -- stable handle inside one family tree, e.g. 'uncle-teddy'
  display_name    text not null,                -- what the family calls them
  given_names     text,
  surname         text,
  alt_names       text[] not null default '{}', -- nicknames, spellings heard in dictation
  is_teller       boolean not null default false,
  birth_year_est  integer check (birth_year_est is null or birth_year_est between 1700 and 2100),
  residence_note  text,
  living_state    text not null default 'UNKNOWN' check (living_state in ('LIVING','DECEASED','UNKNOWN')),
  confidence      fl_confidence not null default 'MEMORY_REPORTED',
  created_at      timestamptz not null default now(),
  unique (owner_user_id, person_key)
);

-- One row per (child, parent). parent_role makes half relations computable.
create table if not exists fl_parentage (
  child_id     uuid not null references fl_persons(id) on delete cascade,
  parent_id    uuid not null references fl_persons(id) on delete cascade,
  parent_role  text not null check (parent_role in ('FATHER','MOTHER','PARENT')),
  confidence   fl_confidence not null default 'MEMORY_REPORTED',
  source_note  text,
  created_at   timestamptz not null default now(),
  primary key (child_id, parent_id),
  constraint fl_parentage_not_self check (child_id <> parent_id)
);
-- A person has at most one recorded father and one recorded mother.
create unique index if not exists fl_parentage_one_role
  on fl_parentage(child_id, parent_role) where parent_role in ('FATHER','MOTHER');

-- Relationships that are not parent/child (spouse, raised-by, the family's word for someone).
create table if not exists fl_relations (
  id            uuid primary key default gen_random_uuid(),
  person_a      uuid not null references fl_persons(id) on delete cascade,
  person_b      uuid not null references fl_persons(id) on delete cascade,
  relation      text not null check (relation in ('SPOUSE','PARTNER','RAISED_BY','CALLED_KIN','GODPARENT')),
  label         text,
  confidence    fl_confidence not null default 'MEMORY_REPORTED',
  created_at    timestamptz not null default now(),
  constraint fl_relations_not_self check (person_a <> person_b)
);

-- "I always thought he was a fake uncle." A belief and its revision, kept together.
create table if not exists fl_relation_beliefs (
  id               uuid primary key default gen_random_uuid(),
  owner_user_id    uuid not null references auth.users(id) on delete cascade,
  subject_id       uuid not null references fl_persons(id) on delete cascade,
  believed         text not null,
  learned          text,
  learned_when     text,      -- the teller's own marker, e.g. 'after my father died'
  learned_from     text,
  created_at       timestamptz not null default now()
);

-- Relative ages as the family tells them: "Frank was about Tyrone's age".
create table if not exists fl_age_anchors (
  id           uuid primary key default gen_random_uuid(),
  person_id    uuid not null references fl_persons(id) on delete cascade,
  anchor_id    uuid not null references fl_persons(id) on delete cascade,
  comparison   text not null check (comparison in ('ABOUT_SAME','OLDER','YOUNGER','A_LITTLE_OLDER','A_LITTLE_YOUNGER')),
  constraint fl_age_anchor_not_self check (person_id <> anchor_id)
);

-- The teller's words, verbatim. Never updated after capture (trigger below).
create table if not exists fl_testimonies (
  id               uuid primary key default gen_random_uuid(),
  owner_user_id    uuid not null references auth.users(id) on delete cascade,
  testimony_code   text not null unique,
  archive_code     text,      -- soft ref to family_story_archives.archive_code
  teller_id        uuid references fl_persons(id) on delete set null,
  told_on          date not null default current_date,
  scene_label      text,
  verbatim_text    text not null,
  capture_mode     text not null default 'DICTATION' check (capture_mode in ('DICTATION','TYPED','AUDIO_TRANSCRIPT','INTERVIEW')),
  confidence       fl_confidence not null default 'MEMORY_REPORTED',
  created_at       timestamptz not null default now()
);

create or replace function fl_testimony_immutable() returns trigger language plpgsql as $$
begin
  if new.verbatim_text is distinct from old.verbatim_text then
    raise exception 'FAMILY LINEAGE: verbatim testimony is never rewritten; add a correction instead';
  end if;
  return new;
end $$;
drop trigger if exists fl_testimony_immutable on fl_testimonies;
create trigger fl_testimony_immutable before update on fl_testimonies
  for each row execute function fl_testimony_immutable();

-- Teller corrections. Append-only. Applies to the testimony and to every
-- document rendered from it (PDF, page, audio script).
create table if not exists fl_corrections (
  id              uuid primary key default gen_random_uuid(),
  testimony_id    uuid not null references fl_testimonies(id) on delete cascade,
  correction_type text not null check (correction_type in ('REMOVE_PHRASE','REPLACE_PHRASE','ATTRIBUTION','CONTEXT_NOTE')),
  target_phrase   text,
  replacement     text,
  reason          text not null,
  corrected_by    uuid not null references auth.users(id),
  applies_to      text[] not null default array['TESTIMONY','PDF','PAGE','AUDIO'],
  created_at      timestamptz not null default now(),
  constraint fl_correction_needs_target check (
    correction_type = 'CONTEXT_NOTE' or (target_phrase is not null and length(trim(target_phrase)) > 0)),
  constraint fl_correction_replace_needs_text check (
    correction_type <> 'REPLACE_PHRASE' or replacement is not null)
);

create or replace function fl_corrections_append_only() returns trigger language plpgsql as $$
begin
  raise exception 'FAMILY LINEAGE: corrections are append-only; add a new correction';
end $$;
drop trigger if exists fl_corrections_append_only on fl_corrections;
create trigger fl_corrections_append_only before update or delete on fl_corrections
  for each row when (pg_trigger_depth() = 0) execute function fl_corrections_append_only();

-- What the account leaves unsettled. Nothing is guessed into a fact.
create table if not exists fl_open_questions (
  id             uuid primary key default gen_random_uuid(),
  owner_user_id  uuid not null references auth.users(id) on delete cascade,
  question       text not null,
  why_it_matters text,
  about_ids      uuid[] not null default '{}',
  state          text not null default 'OPEN' check (state in ('OPEN','ANSWERED','PARKED')),
  answer         text,
  created_at     timestamptz not null default now()
);

-- Record searches that would move memory toward confirmation.
create table if not exists fl_record_tasks (
  id             uuid primary key default gen_random_uuid(),
  owner_user_id  uuid not null references auth.users(id) on delete cascade,
  person_id      uuid references fl_persons(id) on delete cascade,
  record_source  text not null,
  search_hint    text not null,
  proves         text not null,
  state          text not null default 'TO_SEARCH' check (state in ('TO_SEARCH','SEARCHING','FOUND','NOT_FOUND')),
  evidence       jsonb not null default '{}'::jsonb,
  created_at     timestamptz not null default now()
);

-- Apply a testimony's REMOVE/REPLACE corrections to any text rendered from it
-- (the testimony itself, a PDF body, a page, an audio script). Case-insensitive,
-- in the order the teller made them. Mirrors applyCorrections() in
-- family-lineage/lib/lineage.js.
create or replace function fl_apply_corrections(p_text text, p_testimony uuid, p_target text default 'TESTIMONY')
returns text language plpgsql stable as $$
declare t text := p_text; c record;
begin
  if t is null then return null; end if;
  for c in select * from fl_corrections
           where testimony_id = p_testimony and p_target = any(applies_to)
             and correction_type in ('REMOVE_PHRASE','REPLACE_PHRASE')
           order by created_at, id loop
    t := regexp_replace(t, regexp_replace(c.target_phrase, '([.^$*+?()\[\]{}|\\])', '\\\1', 'g'),
                        coalesce(c.replacement, ''), 'gi');
  end loop;
  t := regexp_replace(t, '[ \t]{2,}', ' ', 'g');
  t := regexp_replace(t, ',\s*([.!?])', '\1', 'g');
  t := regexp_replace(t, '\s+([,.!?])', '\1', 'g');
  return btrim(t);
end $$;

create or replace function fl_render_testimony(p_testimony uuid, p_target text default 'TESTIMONY')
returns text language sql stable as $$
  select fl_apply_corrections(verbatim_text, p_testimony, p_target) from fl_testimonies where id = p_testimony;
$$;

-- Derived kinship between two people from parentage. 'HALF_SIBLING' when exactly
-- one parent is shared; 'FULL_SIBLING' when both recorded parents are shared.
create or replace function fl_sibling_kind(p_a uuid, p_b uuid)
returns text language sql stable as $$
  with pa as (select parent_id from fl_parentage where child_id = p_a),
       pb as (select parent_id from fl_parentage where child_id = p_b),
       shared as (select count(*) n from pa join pb using (parent_id)),
       known  as (select (select count(*) from pa) na, (select count(*) from pb) nb)
  select case
    when p_a = p_b then 'SELF'
    when (select n from shared) = 0 then 'NONE_RECORDED'
    when (select n from shared) >= 2 then 'FULL_SIBLING'
    when (select na from known) >= 2 and (select nb from known) >= 2 then 'HALF_SIBLING'
    else 'SIBLING_OTHER_PARENT_UNRECORDED'
  end;
$$;

-- Row level security: owner only. Child tables follow their person/testimony owner.
alter table fl_persons          enable row level security;
alter table fl_parentage        enable row level security;
alter table fl_relations        enable row level security;
alter table fl_relation_beliefs enable row level security;
alter table fl_age_anchors      enable row level security;
alter table fl_testimonies      enable row level security;
alter table fl_corrections      enable row level security;
alter table fl_open_questions   enable row level security;
alter table fl_record_tasks     enable row level security;

drop policy if exists fl_persons_owner on fl_persons;
create policy fl_persons_owner on fl_persons for all to authenticated
  using (owner_user_id = auth.uid()) with check (owner_user_id = auth.uid());

drop policy if exists fl_parentage_owner on fl_parentage;
create policy fl_parentage_owner on fl_parentage for all to authenticated
  using (exists (select 1 from fl_persons p where p.id = child_id and p.owner_user_id = auth.uid()))
  with check (exists (select 1 from fl_persons p where p.id = child_id and p.owner_user_id = auth.uid())
          and exists (select 1 from fl_persons p where p.id = parent_id and p.owner_user_id = auth.uid()));

drop policy if exists fl_relations_owner on fl_relations;
create policy fl_relations_owner on fl_relations for all to authenticated
  using (exists (select 1 from fl_persons p where p.id = person_a and p.owner_user_id = auth.uid()))
  with check (exists (select 1 from fl_persons p where p.id = person_a and p.owner_user_id = auth.uid())
          and exists (select 1 from fl_persons p where p.id = person_b and p.owner_user_id = auth.uid()));

drop policy if exists fl_age_anchors_owner on fl_age_anchors;
create policy fl_age_anchors_owner on fl_age_anchors for all to authenticated
  using (exists (select 1 from fl_persons p where p.id = person_id and p.owner_user_id = auth.uid()))
  with check (exists (select 1 from fl_persons p where p.id = person_id and p.owner_user_id = auth.uid()));

drop policy if exists fl_beliefs_owner on fl_relation_beliefs;
create policy fl_beliefs_owner on fl_relation_beliefs for all to authenticated
  using (owner_user_id = auth.uid()) with check (owner_user_id = auth.uid());

drop policy if exists fl_testimonies_owner on fl_testimonies;
create policy fl_testimonies_owner on fl_testimonies for all to authenticated
  using (owner_user_id = auth.uid()) with check (owner_user_id = auth.uid());

-- Corrections: owner may read and add; no update/delete policy exists.
drop policy if exists fl_corrections_read on fl_corrections;
create policy fl_corrections_read on fl_corrections for select to authenticated
  using (exists (select 1 from fl_testimonies t where t.id = testimony_id and t.owner_user_id = auth.uid()));
drop policy if exists fl_corrections_add on fl_corrections;
create policy fl_corrections_add on fl_corrections for insert to authenticated
  with check (corrected_by = auth.uid()
          and exists (select 1 from fl_testimonies t where t.id = testimony_id and t.owner_user_id = auth.uid()));

drop policy if exists fl_questions_owner on fl_open_questions;
create policy fl_questions_owner on fl_open_questions for all to authenticated
  using (owner_user_id = auth.uid()) with check (owner_user_id = auth.uid());

drop policy if exists fl_tasks_owner on fl_record_tasks;
create policy fl_tasks_owner on fl_record_tasks for all to authenticated
  using (owner_user_id = auth.uid()) with check (owner_user_id = auth.uid());

grant select, insert, update, delete on fl_persons, fl_parentage, fl_relations, fl_relation_beliefs,
  fl_age_anchors, fl_testimonies, fl_open_questions, fl_record_tasks to authenticated;
grant select, insert on fl_corrections to authenticated;
revoke all on fl_persons, fl_parentage, fl_relations, fl_relation_beliefs, fl_age_anchors,
  fl_testimonies, fl_corrections, fl_open_questions, fl_record_tasks from anon;

commit;
