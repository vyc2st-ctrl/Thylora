-- THYLORA APP · Chairman workspace
-- Workroom: WR-THYAPP-001
--
-- HELD FOR CHAIRMAN APPLICATION.
--
-- CONTINUITY CORRECTION (2026-09-15)
-- ----------------------------------
-- An earlier pass of this lane defined its own `thy_is_chairman()`, its own
-- `thy_approvals` table and its own `thy_margin_notes` table. All three already
-- exist canonically on `thylora-dash` and are used by the authoritative
-- dashboard (see docs/CHAIRMAN_DASHBOARD_SURFACE.md in
-- vyc2st-ctrl/thylora-executive-dashboard):
--
--   gate       → thylora_is_chairman()
--   approvals  → thylora_approval_queue_safe_v1()
--                submit_thylora_review_gate_decision_v1(canonical_id, decision, note)
--                thylora_chairman_review_gates / thylora_chairman_review_decisions
--   margin     → thylora_margin_note_add_v1(kind, ref, body, mode, playback_ms, context)
--                thylora_margin_queue_v1(include_resolved)
--                thylora_margin_reconcile_v1(note_id, finding, disposition)
--                thylora_chairman_margin_notes
--
-- Those three duplicates have been REMOVED from this file. A second Chairman
-- gate is the most dangerous kind of drift — two gates can disagree, and the
-- weaker one wins. A second approval ledger or margin queue would split the
-- Chairman's own record of what he decided and what he asked for.
--
-- What remains here is only what has no canonical equivalent.

/* ------------------------------------------------------ required canonical gate */
-- Fail loudly rather than quietly creating a parallel gate. If this raises, the
-- canonical function is missing and that must be resolved before anything in
-- this lane is applied.
do $$ begin
  if to_regprocedure('public.thylora_is_chairman()') is null then
    raise exception
      'THY-CONTINUITY: thylora_is_chairman() is absent. This lane requires the canonical Chairman gate and must not define a second one.';
  end if;
end $$;

/* --------------------------------------------------- prompt coverage ledger */
-- Coverage and delivery are separate states on purpose. Work that exists but
-- never reached the Chairman is the gap this ledger is built to expose, so it
-- cannot be hidden by marking a prompt "covered".
--
-- KNOWN RECONCILIATION (recorded, not resolved): the canonical
-- `thylora_query_carryforward` already stores captured prompts with
-- `capture_state` and `supersession_state`. This ledger measures something
-- narrower — whether the work a prompt asked for exists and reached the
-- Chairman — and the two should be reconciled into one read before this lane
-- is applied. It is listed as an outstanding action in WR-THYAPP-001.
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
  -- Link back to the canonical capture, so the reconciliation above has a join.
  carryforward_query_id text,
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

/* ------------------------------------------------------ sketch and markup */
-- Strokes are stored as vectors, not a flattened image, so a Chairman markup
-- stays inspectable and re-renderable at any zoom instead of becoming a
-- screenshot nobody can re-read. No canonical sketch store exists.
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
