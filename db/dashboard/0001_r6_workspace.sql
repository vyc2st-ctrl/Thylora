-- THYLORA Dashboard R6 · workspace custody tables
-- Canonical backend records:
--   THY-DASH-VOICE-SPINE-001
--   THY-IDEA-READBACK-MARGIN-NOTES-001
--   THY-IDEA-PROMPT-COVERAGE-LEDGER-001
--
-- Target backend: thylora-dash (jvsdxhrfhtlgaknhjxlz)
--
-- Additive only. This migration creates new tables and touches nothing the
-- current head already reads. Until it is applied, the R6 workspace holds notes
-- and ledgers on the Chairman's device and says so on screen — it does not
-- report backend custody it does not have.

-- ---------------------------------------------------------------------------
-- Margin notes: what the Chairman said into a response during readback.
-- ---------------------------------------------------------------------------

create table if not exists public.thylora_margin_notes (
  note_id                   text primary key,
  owner_user_id             uuid not null default auth.uid(),
  response_id               text,
  kind                      text not null default 'SPOKEN'
                              check (kind in ('SPOKEN','TYPED','INK','PIN')),
  body                      text not null default '',

  -- The exact place in the response. Character offset is authoritative;
  -- percent and segment are derived views kept for readability.
  anchor_char               integer not null default 0 check (anchor_char >= 0),
  anchor_percent            numeric(5,1) not null default 0,
  anchor_segment            integer,
  anchor_preview            text,
  readback_elapsed_seconds  numeric(10,2),

  -- What the note is tied to: the response, an image, a video frame, a document.
  target                    jsonb,
  ink                       jsonb,

  -- Notes are never edited and never deleted. A correction is a new atom that
  -- names the one it replaces.
  supersedes                text references public.thylora_margin_notes(note_id),

  captured_at               timestamptz not null default now(),
  created_at                timestamptz not null default now()
);

create index if not exists thylora_margin_notes_response_idx
  on public.thylora_margin_notes (response_id, anchor_char);
create index if not exists thylora_margin_notes_owner_idx
  on public.thylora_margin_notes (owner_user_id, captured_at desc);

-- ---------------------------------------------------------------------------
-- Prompt coverage: every substantive item of a Chairman prompt, and where it
-- ended up. An atom row is never deleted — that is the whole point of it.
-- ---------------------------------------------------------------------------

create table if not exists public.thylora_prompt_atoms (
  atom_id           text primary key,
  owner_user_id     uuid not null default auth.uid(),
  prompt_id         text not null,
  ordinal           integer not null,
  atom_text         text not null,
  section           text,

  state             text not null default 'UNKNOWN'
                      check (state in ('ANSWERED','EXECUTED','REGISTERED','DEFERRED_WITH_REASON','UNKNOWN')),

  -- A deferral has to say why. The database refuses a silent one.
  reason            text,
  evidence          jsonb,
  source_checksum   text,

  created_at        timestamptz not null default now(),
  resolved_at       timestamptz,

  constraint thylora_prompt_atoms_deferral_needs_reason
    check (state <> 'DEFERRED_WITH_REASON' or coalesce(btrim(reason), '') <> '')
);

create index if not exists thylora_prompt_atoms_prompt_idx
  on public.thylora_prompt_atoms (prompt_id, ordinal);
create index if not exists thylora_prompt_atoms_open_idx
  on public.thylora_prompt_atoms (owner_user_id, state) where state = 'UNKNOWN';

-- ---------------------------------------------------------------------------
-- Preview decisions: what was approved, held or rejected, and on what markup.
-- ---------------------------------------------------------------------------

create table if not exists public.thylora_preview_decisions (
  decision_id     text primary key,
  owner_user_id   uuid not null default auth.uid(),
  asset_ref       text not null,
  asset_kind      text not null check (asset_kind in ('IMAGE','VIDEO','DOCUMENT')),
  decision        text not null check (decision in ('APPROVED','HELD','REJECTED')),
  comment_count   integer not null default 0,
  markup          jsonb,
  decided_at      timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Global Arrival Matrix: where THYLORA has actually arrived.
--
-- Arrival above ABSENT requires an evidence reference. The constraint enforces
-- what the client already refuses to display: a claim with nothing behind it is
-- not arrival.
-- ---------------------------------------------------------------------------

create table if not exists public.thylora_arrival_matrix (
  territory_code  text not null,
  lane_code       text not null
                    check (lane_code in ('STOREFRONT','PRODUCT','MEDIA','PAYMENT','SUPPORT')),
  territory       text,
  region          text,
  state           text not null default 'ABSENT'
                    check (state in ('ABSENT','REGISTERED','LIVE','SERVING','BLOCKED','UNKNOWN')),
  evidence_id     text,
  reason          text,
  updated_at      timestamptz not null default now(),

  primary key (territory_code, lane_code),

  constraint thylora_arrival_needs_evidence
    check (state not in ('REGISTERED','LIVE','SERVING') or coalesce(btrim(evidence_id), '') <> ''),
  constraint thylora_arrival_blocked_needs_reason
    check (state <> 'BLOCKED' or coalesce(btrim(reason), '') <> '')
);

-- ---------------------------------------------------------------------------
-- Row level security: the Chairman's workspace is the Chairman's.
-- ---------------------------------------------------------------------------

alter table public.thylora_margin_notes       enable row level security;
alter table public.thylora_prompt_atoms       enable row level security;
alter table public.thylora_preview_decisions  enable row level security;
alter table public.thylora_arrival_matrix     enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'thylora_margin_notes' and policyname = 'margin_notes_owner_read') then
    create policy margin_notes_owner_read on public.thylora_margin_notes
      for select using (owner_user_id = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where tablename = 'thylora_margin_notes' and policyname = 'margin_notes_owner_insert') then
    create policy margin_notes_owner_insert on public.thylora_margin_notes
      for insert with check (owner_user_id = auth.uid());
  end if;

  if not exists (select 1 from pg_policies where tablename = 'thylora_prompt_atoms' and policyname = 'prompt_atoms_owner_read') then
    create policy prompt_atoms_owner_read on public.thylora_prompt_atoms
      for select using (owner_user_id = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where tablename = 'thylora_prompt_atoms' and policyname = 'prompt_atoms_owner_write') then
    create policy prompt_atoms_owner_write on public.thylora_prompt_atoms
      for insert with check (owner_user_id = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where tablename = 'thylora_prompt_atoms' and policyname = 'prompt_atoms_owner_resolve') then
    create policy prompt_atoms_owner_resolve on public.thylora_prompt_atoms
      for update using (owner_user_id = auth.uid()) with check (owner_user_id = auth.uid());
  end if;

  if not exists (select 1 from pg_policies where tablename = 'thylora_preview_decisions' and policyname = 'preview_decisions_owner') then
    create policy preview_decisions_owner on public.thylora_preview_decisions
      for all using (owner_user_id = auth.uid()) with check (owner_user_id = auth.uid());
  end if;

  if not exists (select 1 from pg_policies where tablename = 'thylora_arrival_matrix' and policyname = 'arrival_matrix_read') then
    create policy arrival_matrix_read on public.thylora_arrival_matrix
      for select using (auth.uid() is not null);
  end if;
end $$;

-- Notes and atoms are append-only by policy: no delete policy is created, so
-- with row level security on, nothing can quietly remove a note or an atom.
