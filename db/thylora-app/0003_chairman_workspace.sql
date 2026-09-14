-- THYLORA APP · Chairman workspace
-- Workroom: WR-THYAPP-001
--
-- HELD FOR CHAIRMAN APPLICATION.
--
-- The Chairman command spine is NOT re-implemented here. Voice command,
-- approval, rejection and department routing all go through the existing
-- `submit_thylora_chairman_command_v1` RPC that the authoritative dashboard
-- already uses, against the existing `thylora_departments` registry. This file
-- adds only the workspace's own artefacts: what the Chairman marks, notes,
-- sketches, decides and is owed.

/* ------------------------------------------------------ chairman authority */
-- The single server-side test for Chairman authority. It reads the SAME claim
-- the shell reads (app_metadata.thylora_role / thylora_roles), so the UI gate
-- and the data gate cannot disagree. app_metadata is writable only by the
-- backend; user_metadata is writable by the user and is deliberately ignored.
create or replace function thy_is_chairman()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'thylora_role') = 'CHAIRMAN'
    or (auth.jwt() -> 'app_metadata' -> 'thylora_roles') ? 'CHAIRMAN',
    false
  );
$$;

/* --------------------------------------------------------------- approvals */
do $$ begin
  create type thy_approval_state as enum ('PENDING', 'APPROVED', 'REJECTED', 'WITHDRAWN');
exception when duplicate_object then null; end $$;

create table if not exists thy_approvals (
  id uuid primary key default gen_random_uuid(),
  approval_code text not null unique,
  subject_kind text not null,
  subject_code text not null,
  subject_title text,
  approval_state thy_approval_state not null default 'PENDING',
  requested_at timestamptz not null default now(),
  decided_at timestamptz,
  decided_by uuid,
  decision_note text,
  -- A decided approval must record who decided it and when. This is what makes
  -- the approval trail evidence rather than a status field.
  constraint thy_approvals_decision_witnessed check (
    approval_state in ('PENDING', 'WITHDRAWN')
    or (decided_at is not null and decided_by is not null)
  )
);

create index if not exists thy_approvals_pending_idx
  on thy_approvals (approval_state, requested_at desc);

/* --------------------------------------------------- prompt coverage ledger */
-- Coverage and delivery are separate states on purpose. Work that exists but
-- never reached the Chairman is the gap this ledger is built to expose, so it
-- cannot be hidden by marking a prompt "covered".
do $$ begin
  create type thy_coverage_state as enum ('UNCOVERED', 'PARTIAL', 'COVERED');
exception when duplicate_object then null; end $$;

do $$ begin
  create type thy_delivered_state as enum ('PENDING', 'DELIVERED');
exception when duplicate_object then null; end $$;

create table if not exists thy_prompt_ledger (
  id uuid primary key default gen_random_uuid(),
  prompt_code text not null unique,
  prompt_text text not null,
  coverage_state thy_coverage_state not null default 'UNCOVERED',
  delivered_state thy_delivered_state not null default 'PENDING',
  department_code text,
  received_at timestamptz not null default now(),
  covered_at timestamptz,
  delivered_at timestamptz,
  coverage_note text,
  constraint thy_prompt_ledger_covered_dated check (
    coverage_state <> 'COVERED' or covered_at is not null
  ),
  constraint thy_prompt_ledger_delivered_dated check (
    delivered_state <> 'DELIVERED' or delivered_at is not null
  )
);

create index if not exists thy_prompt_ledger_open_idx
  on thy_prompt_ledger (coverage_state, delivered_state, received_at desc);

/* ------------------------------------------------------------ margin notes */
create table if not exists thy_margin_notes (
  id uuid primary key default gen_random_uuid(),
  note_code text not null unique default 'THY-NOTE-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substr(encode(gen_random_bytes(4), 'hex'), 1, 8)),
  author_user_id uuid not null default auth.uid(),
  subject_kind text not null,
  subject_code text not null,
  note_text text not null check (length(btrim(note_text)) >= 1),
  note_state text not null default 'ACTIVE' check (note_state in ('ACTIVE', 'RESOLVED', 'ARCHIVED')),
  created_at timestamptz not null default now()
);

create index if not exists thy_margin_notes_subject_idx
  on thy_margin_notes (subject_kind, subject_code, created_at desc);

/* ------------------------------------------------------ sketch and markup */
-- Strokes are stored as vectors, not a flattened image, so a Chairman markup
-- stays inspectable and re-renderable at any zoom instead of becoming a
-- screenshot nobody can re-read.
create table if not exists thy_chairman_sketches (
  id uuid primary key default gen_random_uuid(),
  sketch_code text not null unique default 'THY-SKETCH-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substr(encode(gen_random_bytes(4), 'hex'), 1, 8)),
  author_user_id uuid not null default auth.uid(),
  subject_kind text not null,
  subject_code text not null,
  sketch_title text,
  stroke_count integer not null default 0 check (stroke_count >= 0),
  strokes jsonb not null default '[]'::jsonb,
  sketch_state text not null default 'ACTIVE' check (sketch_state in ('ACTIVE', 'ARCHIVED')),
  created_at timestamptz not null default now(),
  -- The recorded count must match the stored strokes, so a sketch cannot claim
  -- work it does not contain.
  constraint thy_sketches_count_matches check (stroke_count = jsonb_array_length(strokes))
);

create index if not exists thy_chairman_sketches_subject_idx
  on thy_chairman_sketches (subject_kind, subject_code, created_at desc);
