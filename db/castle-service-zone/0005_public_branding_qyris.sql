-- CASTLE SERVICE ZONE · 0005 · Public-safe sheet, branding relationships, QYRIS ledger
-- Workroom: WR-CASTLE-SERVICE-ZONE-576

begin;

-- ---------------------------------------------------------------- public-safe sheet
-- The public sheet is a PROJECTION, not a second copy. It selects only rows already
-- marked public_safe, and it withholds exact topology: no clear widths, no door
-- counts, no route sequences through the staff link, no recall times.

create or replace view thy_csz_public_world_sheet as
  select 'SPACE'::text        as entry_kind,
         s.stable_id          as entry_id,
         coalesce(s.native_name, '(EdereAirah name pending mirror registry)') as name_shown,
         s.erc_mirror         as mirror_shown,
         s.function_text      as description,
         s.dimension_state::text as state_shown,
         null::text           as sequence_shown
    from thy_csz_space_intake s
   where s.public_safe
  union all
  select 'PATH',
         f.flow_id,
         f.title,
         null,
         f.purpose,
         'CONCEPTUAL_ONLY',
         (select string_agg(x.action, ' → ' order by x.step_no)
            from thy_csz_flow_step x where x.flow_id = f.flow_id)
    from thy_csz_flow f
   where f.public_safe
  union all
  select 'OBJECT',
         o.object_id,
         o.object_name,
         null,
         o.notes,
         o.location_state::text,
         null
    from thy_csz_object_home o
   where o.public_safe;

comment on view thy_csz_public_world_sheet is
  'PUBLIC-SAFE ONLY. Exact security-sensitive topology (clear widths, door counts, link-by-link routes, staff-link position, recall times, lock classes) is withheld by construction: this view exposes no dimension columns and no adjacency rows at all.';

-- ---------------------------------------------------------------- branding
-- If ERSATZREALITY / THYLORA / VYC2ST appear anywhere, the real relationship must be
-- named. A decorative mark is not a permitted state.

do $$ begin
  create type thy_csz_brand_relationship as enum (
    'MADE_BY','OWNED_BY','SUPPLIED_BY','PUBLISHED_BY','COMMISSIONED_BY','EMPLOYED_BY','NONE_PRESENT'
  );
exception when duplicate_object then null; end $$;

create table if not exists thy_csz_brand_mark (
  mark_id        text primary key check (mark_id ~ '^CSZ-MARK-[0-9]{2}$'),
  serial         text not null references thy_csz_serial(serial),
  subject_kind   text not null check (subject_kind in ('OBJECT','SPACE','RECORD','SHEET')),
  subject_id     text not null,
  brand_name     text not null check (brand_name in ('ERSATZREALITY','THYLORA','VYC2ST')),
  relationship   thy_csz_brand_relationship not null,
  relationship_note text not null,
  in_world       boolean not null,   -- true = the mark is on a thing inside EdereAirah
  source_text    text not null,
  constraint thy_csz_brand_no_decorative
    check (relationship <> 'NONE_PRESENT' or in_world = false)
);

comment on table thy_csz_brand_mark is
  'No decorative marks. Every brand appearance carries its exact real relationship. In-world kitchen objects carry no marks in this slice; the records and sheets are PUBLISHED_BY THYLORA.';

-- An object may not be flagged as carrying a mark without a matching relationship row.
create or replace function thy_csz_guard_object_mark()
returns trigger language plpgsql as $$
begin
  if new.mark_present and not exists (
    select 1 from thy_csz_brand_mark m
     where m.subject_kind = 'OBJECT' and m.subject_id = new.object_id
       and m.relationship <> 'NONE_PRESENT'
  ) then
    raise exception
      'object % is flagged as carrying a brand mark with no declared relationship; decorative marks are not permitted',
      new.object_id;
  end if;
  return new;
end $$;

drop trigger if exists thy_csz_object_mark_guard on thy_csz_object_home;
create constraint trigger thy_csz_object_mark_guard
  after insert or update on thy_csz_object_home
  deferrable initially deferred
  for each row execute function thy_csz_guard_object_mark();

-- ---------------------------------------------------------------- QYRIS ledger
-- QUESTION · YIELD · REASON · INSPECT · SAFEGUARD, held as data so it stays visible
-- in readback and is not merely prose in a document.

do $$ begin
  create type thy_csz_qyris_field as enum ('QUESTION','YIELD','REASON','INSPECT','SAFEGUARD');
exception when duplicate_object then null; end $$;

create table if not exists thy_csz_qyris (
  entry_id     text primary key check (entry_id ~ '^CSZ-QYRIS-[0-9]{3}$'),
  field        thy_csz_qyris_field not null,
  subject      text not null,
  body         text not null,
  work_code    text not null default 'THY-WORK-KITCHEN-SUITE-RESIDENCE-576',
  created_at   timestamptz not null default now()
);

create table if not exists thy_csz_conflict (
  conflict_id   text primary key check (conflict_id ~ '^CSZ-CONF-[0-9]{3}$'),
  subject_kind  text not null,
  subject_id    text not null,
  statement_a   text not null,
  statement_b   text not null,
  resolution    text not null default 'OPEN',
  blocks_canon  boolean not null default true,
  created_at    timestamptz not null default now()
);

create table if not exists thy_csz_unknown (
  unknown_id    text primary key check (unknown_id ~ '^CSZ-UNK-[0-9]{3}$'),
  subject_kind  text not null,
  subject_id    text not null,
  question      text not null,
  why_it_matters text not null,
  who_can_close text not null,
  created_at    timestamptz not null default now()
);

create table if not exists thy_csz_chairman_decision (
  decision_id   text primary key check (decision_id ~ '^CSZ-DEC-[0-9]{3}$'),
  subject_kind  text not null,
  subject_id    text not null,
  exact_question text not null,
  options_text  text not null,
  default_if_silent text not null,
  decided       boolean not null default false,
  decision_text text,
  decided_at    timestamptz,
  constraint thy_csz_decision_recorded
    check (not decided or (decision_text is not null and decided_at is not null))
);

create table if not exists thy_csz_restart_point (
  restart_id    text primary key check (restart_id ~ '^CSZ-RESTART-[0-9]{3}$'),
  work_code     text not null,
  state_text    text not null,
  next_action   text not null,
  blocked_by    text,
  created_at    timestamptz not null default now()
);

commit;
