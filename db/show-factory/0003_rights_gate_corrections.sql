-- HISTORY → SHOW FACTORY · 0003 · rights, provenance, people, corrections
-- Workroom: WR-SHOWFACTORY-001 · REVIEWABLE, NOT APPLIED.

do $$ begin
  create type hsf_copyright_state as enum
    ('PUBLIC_DOMAIN', 'LICENSED', 'FAIR_USE_ASSERTED', 'RIGHTS_HOLDER_PERMISSION', 'ORIGINAL_TO_THYLORA', 'UNRESOLVED');
exception when duplicate_object then null; end $$;

do $$ begin
  create type hsf_provenance_state as enum
    ('CLEAR', 'INSTITUTIONAL_HELD', 'RESTITUTION_CONTESTED', 'LOOTED_DOCUMENTED', 'UNDOCUMENTED');
exception when duplicate_object then null; end $$;

do $$ begin
  create type hsf_people_flag as enum
    ('LIVING_DESCENDANTS_IDENTIFIED', 'CONSENT_HISTORY_VIOLATED', 'HUMAN_REMAINS',
     'NAMED_PRIVATE_INDIVIDUAL', 'COMMUNITY_CUSTODIAN');
exception when duplicate_object then null; end $$;

create table if not exists hsf_evidence_items (
  id                       uuid primary key default gen_random_uuid(),
  seed_id                  uuid not null references hsf_seeds(id) on delete cascade,
  ref                      text not null,
  description              text not null,
  copyright_state          hsf_copyright_state not null,
  provenance_state         hsf_provenance_state not null,
  licence_ref              text,
  fair_use_basis           text,
  contest_note             text,
  descendant_contact_state text,
  custodian_name           text,
  authority_clearance      text,
  note                     text,
  unique (seed_id, ref),
  constraint hsf_evidence_licence_ref
    check (copyright_state <> 'LICENSED' or (licence_ref is not null and length(btrim(licence_ref)) > 0)),
  constraint hsf_evidence_fair_use_basis
    check (copyright_state <> 'FAIR_USE_ASSERTED' or (fair_use_basis is not null and length(btrim(fair_use_basis)) >= 20)),
  -- Contested provenance is disclosed on screen, not quietly used.
  constraint hsf_evidence_restitution_disclosed
    check (provenance_state not in ('RESTITUTION_CONTESTED', 'LOOTED_DOCUMENTED')
           or (contest_note is not null and length(btrim(contest_note)) > 0))
);

create table if not exists hsf_evidence_people_flags (
  evidence_item_id uuid not null references hsf_evidence_items(id) on delete cascade,
  flag             hsf_people_flag not null,
  primary key (evidence_item_id, flag)
);

-- Corrections are append-only and public. A history product that quietly edits
-- itself is a history product nobody can trust twice.
create table if not exists hsf_corrections (
  id              uuid primary key default gen_random_uuid(),
  seed_id         uuid not null references hsf_seeds(id) on delete cascade,
  what_was_wrong  text not null,
  what_is_now_said text not null,
  source          text not null,
  dated           date not null,
  published       boolean not null default false,
  recorded_at     timestamptz not null default now(),
  constraint hsf_corrections_substantive
    check (length(btrim(what_was_wrong)) > 0 and length(btrim(what_is_now_said)) > 0 and length(btrim(source)) > 0)
);

create or replace function hsf_corrections_no_rewrite() returns trigger
language plpgsql as $$
begin
  raise exception 'hsf_corrections is append-only: corrections are published, never edited away';
end $$;

drop trigger if exists hsf_corrections_immutable on hsf_corrections;
create trigger hsf_corrections_immutable
  before update or delete on hsf_corrections
  for each row execute function hsf_corrections_no_rewrite();

-- Append-only trail of gate runs, so a production decision can always be traced
-- back to the evidence state at the moment it was taken.
create table if not exists hsf_gate_events (
  id          uuid primary key default gen_random_uuid(),
  seed_id     uuid not null references hsf_seeds(id) on delete cascade,
  gate_state  text not null,
  blockers    jsonb not null default '[]'::jsonb,
  run_at      timestamptz not null default now(),
  run_by      text
);
create index if not exists hsf_gate_events_seed_idx on hsf_gate_events(seed_id, run_at desc);
