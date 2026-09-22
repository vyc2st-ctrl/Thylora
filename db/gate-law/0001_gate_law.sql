-- GATE LAW · 0001 · Dynamic versioned gates
-- Work: THY-WORK-DYNAMIC-GATE-LAW-588
--
-- A gate in thy_omniview_gates is a single mutable row: it records THAT a gate
-- is open, not WHICH RULE is in force, and it can be changed in place with no
-- trace. That is enough to display a gate and not enough to govern one.
--
-- The gate law makes the rule itself the record. Four laws are enforced by the
-- database, not by convention:
--
--   HOLD CURRENT RULE STRONGLY   the current version is the highest version, and
--                                every read returns it by construction
--   NO SILENT MUTATION           UPDATE and DELETE are refused; a change is a
--                                new version that keeps the old one readable
--   NO OLD RULE OVERRIDING NEWER a new version must supersede the version that
--                                is current at that moment — never an earlier one
--   EXPLICIT SUPERSESSION ONLY   version 1 supersedes nothing and must say so;
--                                every later version must name what it supersedes
--
-- Eleven fields travel with every version. None of them is optional-by-accident:
-- a field that does not apply is stated as not applying.

begin;

create table if not exists thy_gate_law (
  gate_key            text    not null,
  version             int     not null check (version >= 1),

  -- 1 SCOPE — what the rule governs. A gate with no scope governs nothing.
  scope               text    not null check (length(btrim(scope)) > 0),

  -- 2 AUTHORITY — whose word puts this rule in force, and who holds it.
  authority           text    not null check (authority in
                        ('CHAIRMAN','BACKEND_OF_RECORD','DEPLOYMENT_REPOSITORY','WORKROOM','LAW')),
  authority_holder    text    not null check (length(btrim(authority_holder)) > 0),

  -- 3 EVIDENCE — what makes this rule checkable. 'NONE' is a legal value and a
  --   loud one: it says the rule is asserted and not yet evidenced.
  evidence            text    not null check (length(btrim(evidence)) > 0),

  -- 4 CONTEXT — the situation the rule was written for. A rule read outside its
  --   context is the most common way an old rule quietly outlives its reason.
  context             text    not null check (length(btrim(context)) > 0),

  -- 5 TRIGGER — when the gate is evaluated.
  trigger_condition   text    not null check (length(btrim(trigger_condition)) > 0),

  -- 6 STATE — where the gate stands under THIS version. A state change is a new
  --   version, never an edit, so state and rule can never drift apart.
  gate_state          text    not null check (gate_state in
                        ('OPEN','HELD','BLOCKED','PASSED','WAIVED','RETIRED')),
  state_reason        text    not null check (length(btrim(state_reason)) > 0),

  -- 7 EXCEPTION — what is allowed through. NULL is not permitted: a gate with no
  --   exception must say 'NO EXCEPTION', so silence is never read as permission.
  exception_clause    text    not null check (length(btrim(exception_clause)) > 0),

  -- 8 VERSION is the column above. 9 SUPERSEDES:
  supersedes_version  int     check (supersedes_version >= 1),

  -- 10 READBACK — the one sentence this gate says back when it is read. Written
  --    with the rule, so a gate cannot be quoted in words it never carried.
  readback            text    not null check (length(btrim(readback)) > 0),

  -- 11 NEXT REVIEW — when the rule must be looked at again. A rule that never
  --    expires must say why, so "forever" is a decision and not a default.
  next_review_utc     timestamptz,
  no_review_reason    text,

  -- Provenance: which sequence put this version in force.
  entered_sequence_no bigint  not null,
  topic_key           text,
  created_at          timestamptz not null default now(),

  primary key (gate_key, version),

  -- EXPLICIT SUPERSESSION ONLY, as a constraint rather than a habit.
  constraint thy_gate_law_supersession_explicit check (
    (version = 1 and supersedes_version is null) or
    (version > 1 and supersedes_version is not null)),

  -- NO OLD RULE OVERRIDING NEWER RULE: a version may only supersede an earlier one.
  constraint thy_gate_law_supersedes_backwards check (
    supersedes_version is null or supersedes_version < version),

  -- NEXT REVIEW is answered either with a date or with a reason there is none.
  constraint thy_gate_law_review_answered check (
    (next_review_utc is not null and no_review_reason is null) or
    (next_review_utc is null and no_review_reason is not null and length(btrim(no_review_reason)) > 0))
);

create index if not exists thy_gate_law_current_idx on thy_gate_law (gate_key, version desc);
create index if not exists thy_gate_law_scope_idx   on thy_gate_law (scope, gate_key);
create index if not exists thy_gate_law_review_idx  on thy_gate_law (next_review_utc) where next_review_utc is not null;
create index if not exists thy_gate_law_topic_idx   on thy_gate_law (topic_key) where topic_key is not null;

comment on table thy_gate_law is
  'Dynamic versioned gates. Append-only: the current rule is the highest version, every earlier rule stays readable, and a change is an explicit supersession.';

-- NO SILENT MUTATION ----------------------------------------------------------
-- The table refuses to be edited at all. This is deliberately stricter than a
-- column-level guard: there is no field of a gate rule that can change without
-- the rule having changed.
create or replace function thy_gate_law_append_only()
returns trigger language plpgsql set search_path = public as $$
begin
  if tg_op = 'UPDATE' then
    raise exception
      'GATE_LAW_IMMUTABLE: gate % version % may not be edited. Supersede it with a new version.',
      old.gate_key, old.version
      using errcode = 'raise_exception';
  end if;
  raise exception
    'GATE_LAW_IMMUTABLE: gate % version % may not be deleted. Supersede it with a RETIRED version.',
    old.gate_key, old.version
    using errcode = 'raise_exception';
end $$;

drop trigger if exists thy_gate_law_no_rewrite on thy_gate_law;
create trigger thy_gate_law_no_rewrite
  before update or delete on thy_gate_law
  for each row execute function thy_gate_law_append_only();

-- HOLD CURRENT RULE STRONGLY --------------------------------------------------
-- The chain guard runs on INSERT and is the single place the four laws meet.
create or replace function thy_gate_law_chain_guard()
returns trigger language plpgsql set search_path = public as $$
declare
  v_current int;
begin
  select max(version) into v_current from thy_gate_law where gate_key = new.gate_key;

  if v_current is null then
    if new.version <> 1 then
      raise exception
        'GATE_LAW_FIRST_VERSION: gate % does not exist yet; its first version must be 1, not %.',
        new.gate_key, new.version
        using errcode = 'raise_exception';
    end if;
    return new;
  end if;

  -- NO OLD RULE OVERRIDING NEWER RULE. Re-declaring an existing or lower version
  -- is the exact shape of an old rule arriving late and winning.
  if new.version <= v_current then
    raise exception
      'GATE_LAW_STALE_VERSION: gate % is already at version %; version % cannot be written. A newer rule is never overridden by an older one.',
      new.gate_key, v_current, new.version
      using errcode = 'raise_exception';
  end if;

  -- A version must supersede the rule that is CURRENT right now, not some older
  -- one it happened to be drafted against.
  if new.supersedes_version <> v_current then
    raise exception
      'GATE_LAW_SUPERSEDES_MISMATCH: gate % is currently at version %, but version % claims to supersede version %. Re-read the current rule and supersede that.',
      new.gate_key, v_current, new.version, new.supersedes_version
      using errcode = 'raise_exception';
  end if;

  -- A retired gate is closed. Re-opening it is a Chairman act with its own key,
  -- not a quiet eighth version of a rule everyone stopped reading.
  if exists (select 1 from thy_gate_law
              where gate_key = new.gate_key and version = v_current and gate_state = 'RETIRED') then
    raise exception
      'GATE_LAW_RETIRED: gate % was retired at version %. Declare a new gate key rather than reviving a retired rule.',
      new.gate_key, v_current
      using errcode = 'raise_exception';
  end if;

  return new;
end $$;

drop trigger if exists thy_gate_law_chain on thy_gate_law;
create trigger thy_gate_law_chain
  before insert on thy_gate_law
  for each row execute function thy_gate_law_chain_guard();

commit;
