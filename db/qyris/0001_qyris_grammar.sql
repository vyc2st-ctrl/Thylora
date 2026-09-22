-- THYLORA · QYRIS · 0001 · Grammar
--
-- The five-part question object, recursively nested, plus the five deltas and
-- the recursive stopping rule.
--
-- The stopping rule is enforced by the schema, not by convention:
-- qyr_frontier_state has exactly two values, OPEN_ACTIVE and OPEN_PAUSED.
-- There is no CLOSED. A pass pauses; inquiry is never globally finished.
--
-- Idempotent. Applies cleanly to a fresh database and to itself.

create extension if not exists pgcrypto;

-- ── Deltas ────────────────────────────────────────────────────────────────
create table if not exists qyr_deltas (
  delta_code text primary key,
  meaning    text not null,
  check (delta_code in ('ACTION','EVIDENCE','RISK','AUTHORITY','TRANSFER'))
);

insert into qyr_deltas (delta_code, meaning) values
  ('ACTION',    'Something someone would actually do differently.'),
  ('EVIDENCE',  'Something that becomes checkable that was previously assertion.'),
  ('RISK',      'A named exposure that changes size, owner or reversibility.'),
  ('AUTHORITY', 'Who may decide, and whose consent is required.'),
  ('TRANSFER',  'Something of value, obligation or access moving between parties.')
on conflict (delta_code) do update set meaning = excluded.meaning;

-- ── Packs ─────────────────────────────────────────────────────────────────
create table if not exists qyr_packs (
  pack_id     text primary key,
  title       text not null,
  kind        text not null,
  notice      text,
  created_at  timestamptz not null default now(),
  constraint qyr_packs_kind check (kind in ('PREMARRIAGE','INDUSTRY','SUPPORT','OTHER'))
);

-- ── Nodes ─────────────────────────────────────────────────────────────────
-- One row per QYRIS question. All five fields are NOT NULL and length-checked:
-- a question without a SAFEGUARD is not a question in this grammar, it is a trap.
create table if not exists qyr_nodes (
  node_id     text primary key,
  pack_id     text not null references qyr_packs(pack_id) on delete cascade,
  parent_id   text references qyr_nodes(node_id) on delete cascade,
  cluster_id  text not null,
  label       text,
  depth       integer not null default 0,
  ordinal     integer not null default 0,
  question    text not null,
  yield       text not null,
  reason      text not null,
  inspect     text not null,
  safeguard   text not null,
  created_at  timestamptz not null default now(),
  constraint qyr_nodes_question_present  check (length(btrim(question))  >= 8),
  constraint qyr_nodes_yield_present     check (length(btrim(yield))     >= 8),
  constraint qyr_nodes_reason_present    check (length(btrim(reason))    >= 8),
  constraint qyr_nodes_inspect_present   check (length(btrim(inspect))   >= 8),
  constraint qyr_nodes_safeguard_present check (length(btrim(safeguard)) >= 8),
  constraint qyr_nodes_no_self_parent    check (parent_id is distinct from node_id),
  constraint qyr_nodes_depth_sane        check (depth >= 0 and depth <= 8),
  constraint qyr_nodes_root_depth        check ((parent_id is null) = (depth = 0))
);

create index if not exists qyr_nodes_parent_idx  on qyr_nodes (parent_id);
create index if not exists qyr_nodes_cluster_idx on qyr_nodes (cluster_id);
create index if not exists qyr_nodes_pack_idx    on qyr_nodes (pack_id, depth, ordinal);

-- ── Declared deltas per node ──────────────────────────────────────────────
-- A question that moves nothing is not asked. Enforced below by trigger.
create table if not exists qyr_node_deltas (
  node_id    text not null references qyr_nodes(node_id) on delete cascade,
  delta_code text not null references qyr_deltas(delta_code),
  primary key (node_id, delta_code)
);

create or replace function qyr_assert_node_moves_something() returns trigger
language plpgsql as $$
declare n integer;
begin
  select count(*) into n from qyr_node_deltas where node_id = coalesce(new.node_id, old.node_id);
  if n = 0 then
    raise exception 'NO_DELTA_DECLARED: node % moves nothing and cannot be asked', coalesce(new.node_id, old.node_id);
  end if;
  return null;
end $$;

drop trigger if exists qyr_node_deltas_guard on qyr_node_deltas;
create constraint trigger qyr_node_deltas_guard
  after delete on qyr_node_deltas
  deferrable initially deferred
  for each row execute function qyr_assert_node_moves_something();

-- ── Passes and the stopping rule ──────────────────────────────────────────
-- Note the state check. There is deliberately no terminal value.
create table if not exists qyr_passes (
  pass_id       uuid primary key default gen_random_uuid(),
  pack_id       text not null references qyr_packs(pack_id) on delete cascade,
  owner_ref     text,
  scope         text[] not null default '{}',
  state         text not null default 'OPEN_ACTIVE',
  opened_at     timestamptz not null default now(),
  paused_at     timestamptz,
  constraint qyr_passes_state_open check (state in ('OPEN_ACTIVE','OPEN_PAUSED')),
  -- Belt and braces: the words themselves are refused, whatever a future
  -- migration tries to add to the enum.
  constraint qyr_passes_never_finished check (
    upper(state) not in ('CLOSED','COMPLETE','COMPLETED','FINISHED','DONE','EXHAUSTED','FINAL')
  )
);

create table if not exists qyr_pass_answers (
  pass_id     uuid not null references qyr_passes(pass_id) on delete cascade,
  node_id     text not null references qyr_nodes(node_id) on delete cascade,
  answered_at timestamptz not null default now(),
  note        text,
  primary key (pass_id, node_id)
);

-- Deltas settled *for one pass only*. A disturbance deletes a row here and the
-- pass resumes, which is why the frontier can never be closed.
create table if not exists qyr_pass_settled (
  pass_id    uuid not null references qyr_passes(pass_id) on delete cascade,
  delta_code text not null references qyr_deltas(delta_code),
  settled_at timestamptz not null default now(),
  primary key (pass_id, delta_code)
);

create table if not exists qyr_pass_disturbances (
  disturbance_id uuid primary key default gen_random_uuid(),
  pass_id        uuid not null references qyr_passes(pass_id) on delete cascade,
  delta_code     text not null references qyr_deltas(delta_code),
  cause          text,
  at             timestamptz not null default now()
);

-- ── The stopping rule, as a function ──────────────────────────────────────
-- A node is LIVE when it is unanswered, its parent is answered (or it is a
-- root), and it still moves at least one delta this pass has not settled.
create or replace function qyr_frontier(p_pass_id uuid)
returns table (node_id text, cluster_id text, question text, moves text[])
language sql stable as $$
  select n.node_id, n.cluster_id, n.question,
         array(select d.delta_code from qyr_node_deltas d where d.node_id = n.node_id order by d.delta_code)
  from qyr_nodes n
  join qyr_passes p on p.pass_id = p_pass_id and p.pack_id = n.pack_id
  where (cardinality(p.scope) = 0 or n.cluster_id = any(p.scope))
    and not exists (select 1 from qyr_pass_answers a where a.pass_id = p_pass_id and a.node_id = n.node_id)
    and (n.parent_id is null
         or exists (select 1 from qyr_pass_answers a2 where a2.pass_id = p_pass_id and a2.node_id = n.parent_id))
    and exists (
      select 1 from qyr_node_deltas nd
      where nd.node_id = n.node_id
        and not exists (select 1 from qyr_pass_settled s where s.pass_id = p_pass_id and s.delta_code = nd.delta_code)
    )
  order by n.depth, n.ordinal, n.node_id;
$$;

-- Recompute a pass's state. Returns OPEN_PAUSED or OPEN_ACTIVE, never anything else.
create or replace function qyr_pass_state(p_pass_id uuid) returns text
language plpgsql stable as $$
declare live integer;
begin
  select count(*) into live from qyr_frontier(p_pass_id);
  if live = 0 then return 'OPEN_PAUSED'; end if;
  return 'OPEN_ACTIVE';
end $$;

-- Answer a question: record it and settle the deltas it declared.
create or replace function qyr_answer(p_pass_id uuid, p_node_id text, p_note text default null)
returns text language plpgsql as $$
declare parent text;
begin
  select parent_id into parent from qyr_nodes where node_id = p_node_id;
  if not found then raise exception 'NODE_NOT_FOUND: %', p_node_id; end if;
  if parent is not null and not exists (
       select 1 from qyr_pass_answers where pass_id = p_pass_id and node_id = parent) then
    raise exception 'PARENT_UNANSWERED: % sits under %', p_node_id, parent;
  end if;
  insert into qyr_pass_answers (pass_id, node_id, note) values (p_pass_id, p_node_id, p_note)
    on conflict (pass_id, node_id) do update set note = excluded.note;
  insert into qyr_pass_settled (pass_id, delta_code)
    select p_pass_id, delta_code from qyr_node_deltas where node_id = p_node_id
    on conflict do nothing;
  update qyr_passes
     set state = qyr_pass_state(p_pass_id),
         paused_at = case when qyr_pass_state(p_pass_id) = 'OPEN_PAUSED' then now() else null end
   where pass_id = p_pass_id;
  return qyr_pass_state(p_pass_id);
end $$;

-- New facts arrive. Unsettle a delta and the pass resumes.
create or replace function qyr_disturb(p_pass_id uuid, p_delta text, p_cause text default null)
returns text language plpgsql as $$
begin
  delete from qyr_pass_settled where pass_id = p_pass_id and delta_code = p_delta;
  insert into qyr_pass_disturbances (pass_id, delta_code, cause) values (p_pass_id, p_delta, p_cause);
  update qyr_passes set state = qyr_pass_state(p_pass_id), paused_at = null where pass_id = p_pass_id;
  return qyr_pass_state(p_pass_id);
end $$;

-- The rule itself, readable from the database so no surface has to restate it.
create table if not exists qyr_rules (
  rule_key text primary key,
  rule_text text not null
);

insert into qyr_rules (rule_key, rule_text) values
  ('STOPPING_RULE',
   'The frontier remains OPEN. A current pass pauses when another question would not change ACTION / EVIDENCE / RISK / AUTHORITY / TRANSFER.'),
  ('NEVER_FINISHED',
   'Inquiry is never globally finished. There is no CLOSED state in this schema.'),
  ('ACCESS_NOT_AUTHORITY',
   'ACCESS is not AUTHORITY. Being let in is not being allowed to decide.')
on conflict (rule_key) do update set rule_text = excluded.rule_text;
