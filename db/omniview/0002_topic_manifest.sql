-- OMNIVIEW · 0002 · Topic manifest, authority locks, linked graph
-- Work: THY-WORK-OMNIVIEW-ROUNDTRIP-587
--
-- This is the CURRENT_STATE_MANIFEST half of
-- CURRENT_STATE_MANIFEST_PLUS_TOPIC_EXPANSION. A topic is the unit the Chairman
-- actually asks about ("CASTLE", "STORE", "TIME RUN"). Everything a topic needs
-- to answer in one read hangs off thy_omniview_topics.
--
-- No second source of truth: people, products, work and gates keep living in
-- their existing registries. A link row holds a soft reference (source_table +
-- source_ref) and is resolved on read, so nothing here competes with the
-- registry that already owns the record.

begin;

-- 1. TOPICS -------------------------------------------------------------------
create table if not exists thy_omniview_topics (
  topic_key       text primary key check (topic_key = upper(btrim(topic_key)) and length(topic_key) > 0),
  display_name    text not null,
  -- Alternate spellings the Chairman actually says: "TIME-RUN", "INES", "THE CASTLE".
  -- A topic is found by any of them, so a read never misses on punctuation.
  aliases         text[] not null default '{}',
  topic_class     text not null check (topic_class in
                    ('PERSON','PLACE','OBJECT','PRODUCT','SYSTEM','WORK','ECONOMY','PROGRAM')),
  summary         text,

  -- The authority lock answers "whose word settles this topic" before any
  -- content is read. A topic with no lock cannot be answered as canon.
  authority_lock  text not null check (authority_lock in
                    ('CHAIRMAN','BACKEND_OF_RECORD','DEPLOYMENT_REPOSITORY','WORKROOM','UNLOCKED')),
  authority_holder text,

  canon_state     text not null default 'UNSEEDED' check (canon_state in
                    ('CANON',      -- current canon is written and current
                     'PARTIAL',    -- some canon written, known gaps
                     'UNSEEDED',   -- topic is registered, canon not yet written
                     'SUPERSEDED', -- whole topic replaced by another topic
                     'SEALED')),   -- canon closed, changes need Chairman re-open
  superseded_by_topic text references thy_omniview_topics(topic_key),

  last_sequence_no bigint references thy_sequence_ledger(sequence_no),
  restart_point    text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

alter table thy_omniview_topics add column if not exists aliases text[] not null default '{}';

-- Key normalisation: case, padding, separators and the accents a keyboard may or
-- may not produce. CASTLE, castle, "the castle" and INES/INÉS resolve to one topic.
create or replace function thy_omniview_normalize_key(p_key text)
returns text language sql immutable set search_path = public as $$
  select nullif(
    regexp_replace(
      btrim(
        translate(
          upper(coalesce(p_key,'')),
          'ÁÀÂÄÃÅÉÈÊËÍÌÎÏÓÒÔÖÕÚÙÛÜÑÇ',
          'AAAAAAEEEEIIIIOOOOOUUUUNC')),
      '[^A-Z0-9]+', ' ', 'g'),
    '')
$$;

create or replace function thy_omniview_resolve_topic(p_key text)
returns text language sql stable set search_path = public as $$
  select t.topic_key
    from thy_omniview_topics t
   where thy_omniview_normalize_key(t.topic_key) = thy_omniview_normalize_key(p_key)
      or exists (select 1 from unnest(t.aliases) a
                  where thy_omniview_normalize_key(a) = thy_omniview_normalize_key(p_key))
   order by (thy_omniview_normalize_key(t.topic_key) = thy_omniview_normalize_key(p_key)) desc
   limit 1
$$;

comment on table thy_omniview_topics is
  'Topic manifest. One row per named topic the Chairman asks about; the entry point for the OMNIVIEW read model.';

-- 2. STATEMENTS (current vs superseded) --------------------------------------
-- Canon is never edited in place. A new statement supersedes the old one and
-- the old one stays readable as history.
create table if not exists thy_omniview_statements (
  id                   bigint generated always as identity primary key,
  topic_key            text not null references thy_omniview_topics(topic_key) on delete restrict,
  statement_kind       text not null check (statement_kind in ('CANON','CONSTRAINT','EVIDENCE','DECISION')),
  body                 text not null check (length(btrim(body)) > 0),
  truth_class          text not null check (truth_class in
                         ('WITNESSED','BACKEND_VERIFIED','REPO_VERIFIED','CHAIRMAN_ASSERTED','DERIVED','UNVERIFIED')),
  authority            text not null,
  status               text not null default 'CURRENT' check (status in ('CURRENT','SUPERSEDED')),
  entered_sequence_no  bigint not null references thy_sequence_ledger(sequence_no),
  superseded_by_id     bigint references thy_omniview_statements(id),
  superseded_sequence_no bigint references thy_sequence_ledger(sequence_no),
  source_ref           text,
  created_at           timestamptz not null default now(),

  check ((status = 'SUPERSEDED') = (superseded_sequence_no is not null))
);

create index if not exists thy_omniview_statements_topic_idx
  on thy_omniview_statements (topic_key, status, entered_sequence_no desc);

-- A superseded statement stays byte-identical. Only the supersession columns may
-- ever move, and only in the CURRENT -> SUPERSEDED direction.
create or replace function thy_omniview_statement_no_rewrite()
returns trigger language plpgsql set search_path = public as $$
begin
  if tg_op = 'DELETE' then
    raise exception 'STATEMENT_IMMUTABLE: delete is refused. Supersede statement % instead.', old.id;
  end if;
  if old.status = 'SUPERSEDED' then
    raise exception 'STATEMENT_IMMUTABLE: statement % is already superseded and cannot be changed.', old.id;
  end if;
  if new.body <> old.body
     or new.topic_key <> old.topic_key
     or new.statement_kind <> old.statement_kind
     or new.truth_class <> old.truth_class
     or new.authority <> old.authority
     or new.entered_sequence_no <> old.entered_sequence_no then
    raise exception 'STATEMENT_IMMUTABLE: statement % may only be superseded, not edited.', old.id;
  end if;
  return new;
end $$;

drop trigger if exists thy_omniview_statements_guard on thy_omniview_statements;
create trigger thy_omniview_statements_guard
  before update or delete on thy_omniview_statements
  for each row execute function thy_omniview_statement_no_rewrite();

-- 3. LINKED GRAPH -------------------------------------------------------------
create table if not exists thy_omniview_links (
  id            bigint generated always as identity primary key,
  topic_key     text not null references thy_omniview_topics(topic_key) on delete restrict,
  link_class    text not null check (link_class in
                  ('PERSON','PLACE','OBJECT','PRODUCT','WORK','GATE','TOPIC','SYSTEM','MONEY')),
  link_key      text not null,
  display_name  text not null,
  relation      text not null,
  status        text not null default 'ACTIVE' check (status in ('ACTIVE','CLOSED','SUPERSEDED','BLOCKED')),
  -- Soft reference into the registry that already owns this record.
  source_table  text,
  source_ref    text,
  entered_sequence_no bigint references thy_sequence_ledger(sequence_no),
  created_at    timestamptz not null default now(),
  unique (topic_key, link_class, link_key)
);

create index if not exists thy_omniview_links_topic_idx on thy_omniview_links (topic_key, link_class, status);
create index if not exists thy_omniview_links_key_idx   on thy_omniview_links (link_class, link_key);

-- 4. GATES --------------------------------------------------------------------
-- A gate is a condition that must be satisfied before a topic can move. Gates
-- are read every turn so nothing is reported "done" through a closed gate.
create table if not exists thy_omniview_gates (
  gate_key      text primary key,
  topic_key     text not null references thy_omniview_topics(topic_key) on delete restrict,
  requirement   text not null,
  gate_state    text not null default 'OPEN' check (gate_state in ('OPEN','PASSED','BLOCKED','WAIVED')),
  blocker       text,
  authority     text not null,
  evidence_ref  text,
  entered_sequence_no bigint references thy_sequence_ledger(sequence_no),
  settled_sequence_no bigint references thy_sequence_ledger(sequence_no),
  updated_at    timestamptz not null default now(),
  check ((gate_state in ('PASSED','WAIVED')) = (settled_sequence_no is not null))
);

create index if not exists thy_omniview_gates_topic_idx on thy_omniview_gates (topic_key, gate_state);

-- 5. OPEN QUESTIONS / NEXT-BETTER QUESTION ------------------------------------
create table if not exists thy_omniview_questions (
  id            bigint generated always as identity primary key,
  topic_key     text not null references thy_omniview_topics(topic_key) on delete restrict,
  question      text not null check (length(btrim(question)) > 0),
  why_it_matters text,
  state         text not null default 'OPEN' check (state in ('OPEN','ANSWERED','DROPPED')),
  is_next_better boolean not null default false,
  answered_sequence_no bigint references thy_sequence_ledger(sequence_no),
  entered_sequence_no  bigint references thy_sequence_ledger(sequence_no),
  created_at    timestamptz not null default now()
);

create index if not exists thy_omniview_questions_topic_idx on thy_omniview_questions (topic_key, state);

-- Exactly one next-better question may be open per topic.
create unique index if not exists thy_omniview_questions_next_better_idx
  on thy_omniview_questions (topic_key) where (is_next_better and state = 'OPEN');

-- 6. SEQUENCE <-> TOPIC -------------------------------------------------------
create table if not exists thy_sequence_ledger_topics (
  sequence_no bigint not null references thy_sequence_ledger(sequence_no),
  topic_key   text   not null references thy_omniview_topics(topic_key),
  effect      text   not null default 'TOUCHED' check (effect in
                ('TOUCHED','CANON_CHANGED','GATE_CHANGED','WORK_CHANGED','RESTARTED')),
  primary key (sequence_no, topic_key)
);

create index if not exists thy_sequence_ledger_topics_topic_idx
  on thy_sequence_ledger_topics (topic_key, sequence_no desc);

-- 7. RESTART POINTS -----------------------------------------------------------
-- LAST RESTART is its own read, not a guess from the newest row.
create table if not exists thy_omniview_restarts (
  id            bigint generated always as identity primary key,
  scope         text not null default 'SPINE',
  topic_key     text references thy_omniview_topics(topic_key),
  restart_point text not null check (length(btrim(restart_point)) > 0),
  reason        text not null,
  authority     text not null,
  sequence_no   bigint not null references thy_sequence_ledger(sequence_no),
  created_at    timestamptz not null default now()
);

create index if not exists thy_omniview_restarts_idx on thy_omniview_restarts (scope, sequence_no desc);

commit;
