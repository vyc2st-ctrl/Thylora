-- THYLORA merchandise lane · 0001 · artwork locks
-- Backend of record: thylora-dash (jvsdxhrfhtlgaknhjxlz)
-- ADDITIVE ONLY. Every object is new and prefixed merch_.
-- Not applied by this repository. Held for Chairman execution.
--
-- Purpose: carry the ALREADY-APPROVED ErsatzReality / THYLORA mark treatments
-- forward into merchandise without restyling them. This table is a lock, not a
-- design surface: value_text and treatment_rule are copied from the existing
-- backend record named in source_record and may not be edited to "improve" a
-- mark. A changed mark is a new lock row with its own Chairman approval.

begin;

create table if not exists merch_artwork_lock (
  lock_code            text primary key,
  lock_group           text not null,            -- MARK | MASTHEAD | PROP | FONT | QR | PRESENTER | JEWELRY
  label                text not null,
  truth_class          text not null,            -- DOCUMENTED | ANALYSIS | UNKNOWN
  value_text           text,                     -- verbatim approved value, null when UNKNOWN
  treatment_rule       text not null,            -- what may and may not be done to it
  approval_state       text not null,            -- verbatim state from source_record
  merch_use_state      text not null default 'NOT_CLEARED',
                                                 -- NOT_CLEARED | CLEARED_LOGO_ONLY | CLEARED_ALL_FAMILIES
  source_record        text not null,            -- backend row this lock was read from
  source_master_file   text,                     -- approved master the treatment appears in
  source_master_sha256 text,
  master_state         text,                     -- state of that master at lock time
  no_silent_change     boolean not null default true,
  open_question        text,                     -- contradiction or gap a human must resolve
  notes                text,
  sort_order           integer not null default 0,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

comment on table merch_artwork_lock is
  'Approved mark treatments carried into merchandise verbatim. Preservation table: no restyling, no re-spacing, no font substitution, no colour reinterpretation.';
comment on column merch_artwork_lock.merch_use_state is
  'Editorial approval of a mark is not merchandise approval. A mark approved for a newspaper page is NOT_CLEARED for goods until separately cleared.';
comment on column merch_artwork_lock.open_question is
  'Recorded contradictions stay visible. An unresolved open_question blocks gate G1 for every SKU referencing this lock.';

create index if not exists merch_artwork_lock_group_idx on merch_artwork_lock (lock_group, sort_order);

commit;
