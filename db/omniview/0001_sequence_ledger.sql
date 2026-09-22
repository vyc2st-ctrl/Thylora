-- OMNIVIEW · 0001 · Sequence change ledger
-- Work: THY-WORK-SEQUENCE-CHANGE-LEDGER-587
--
-- One row per sequence. Append only. The ledger never rewrites source history:
-- a correction is a NEW sequence that supersedes an old one, and the old row
-- stays exactly as it was written.
--
-- Additive only. Every object here is new and prefixed thy_omniview_ / thy_sequence_.
-- No existing THYLORA table is dropped, renamed or rewritten.

begin;

create table if not exists thy_sequence_ledger (
  sequence_no           bigint      primary key check (sequence_no > 0),
  previous_sequence_no  bigint      references thy_sequence_ledger(sequence_no),

  -- Both clocks are stored. Local is what the Chairman lived; UTC is what the
  -- machines agree on. Neither is derived from the other at read time.
  occurred_utc          timestamptz not null,
  occurred_local        timestamp   not null,
  local_timezone        text        not null check (length(btrim(local_timezone)) > 0),

  why_change_occurred   text not null check (length(btrim(why_change_occurred)) > 0),
  what_changed          text not null check (length(btrim(what_changed))        > 0),
  why_it_changed        text not null check (length(btrim(why_it_changed))      > 0),
  what_remained         text not null check (length(btrim(what_remained))       > 0),
  authority             text not null check (length(btrim(authority))           > 0),

  truth_class           text not null check (truth_class in (
                          'WITNESSED',          -- seen working, first hand
                          'BACKEND_VERIFIED',   -- read back from the backend of record
                          'REPO_VERIFIED',      -- proven by a file in a repository
                          'CHAIRMAN_ASSERTED',  -- stated by the Chairman, not yet verified
                          'DERIVED',            -- computed from other verified rows
                          'UNVERIFIED')),       -- carried forward, evidence still owed

  next_better_question  text not null check (length(btrim(next_better_question)) > 0),
  restart_point         text not null check (length(btrim(restart_point))        > 0),

  supersedes_sequence_no bigint references thy_sequence_ledger(sequence_no),
  source_ref            text,
  recorded_by           text        not null default current_user,
  recorded_at           timestamptz not null default now(),

  check (previous_sequence_no is null or previous_sequence_no < sequence_no),
  check (supersedes_sequence_no is null or supersedes_sequence_no < sequence_no)
);

comment on table thy_sequence_ledger is
  'Append-only THYLORA sequence ledger. Corrections are new sequences; source history is never rewritten.';

create index if not exists thy_sequence_ledger_occurred_idx on thy_sequence_ledger (occurred_utc desc);
create index if not exists thy_sequence_ledger_prev_idx     on thy_sequence_ledger (previous_sequence_no);
create index if not exists thy_sequence_ledger_super_idx    on thy_sequence_ledger (supersedes_sequence_no);

-- 1. CHAIN INTEGRITY ----------------------------------------------------------
-- A sequence must continue the chain: it points at the current head, and it is
-- higher than the head. Backfilling into the middle of history is refused.
create or replace function thy_sequence_ledger_chain_guard()
returns trigger language plpgsql as $$
declare head bigint;
begin
  select max(sequence_no) into head from thy_sequence_ledger;

  if head is null then
    if new.previous_sequence_no is not null then
      raise exception 'SEQUENCE_CHAIN_BREAK: first sequence must have no previous sequence';
    end if;
    return new;
  end if;

  if new.sequence_no <= head then
    raise exception 'SEQUENCE_REGRESSION: sequence % is not ahead of head %', new.sequence_no, head;
  end if;

  if new.previous_sequence_no is distinct from head then
    raise exception 'SEQUENCE_CHAIN_BREAK: previous_sequence_no must be % (current head), got %',
      head, coalesce(new.previous_sequence_no::text, 'null');
  end if;

  return new;
end $$;

drop trigger if exists thy_sequence_ledger_chain on thy_sequence_ledger;
create trigger thy_sequence_ledger_chain
  before insert on thy_sequence_ledger
  for each row execute function thy_sequence_ledger_chain_guard();

-- 2. APPEND ONLY --------------------------------------------------------------
-- "Do not rewrite source history" is enforced by the database, not by habit.
create or replace function thy_sequence_ledger_append_only()
returns trigger language plpgsql as $$
begin
  raise exception 'SEQUENCE_LEDGER_IMMUTABLE: % on thy_sequence_ledger is refused. Write a new sequence that supersedes sequence %.',
    tg_op, coalesce(old.sequence_no, 0);
end $$;

drop trigger if exists thy_sequence_ledger_no_rewrite on thy_sequence_ledger;
create trigger thy_sequence_ledger_no_rewrite
  before update or delete on thy_sequence_ledger
  for each row execute function thy_sequence_ledger_append_only();

-- 3. HEAD ---------------------------------------------------------------------
create or replace function thy_sequence_head()
returns bigint language sql stable set search_path = public as $$
  select max(sequence_no) from thy_sequence_ledger
$$;

commit;
