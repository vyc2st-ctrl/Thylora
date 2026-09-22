-- QYRIS TRANSFER · 0001 · Q -> Y -> R -> I -> S -> T -> Q'
-- Work: THY-WORK-TRANSFER-RECURSION-588
--
-- QYRIS already exists in two places: as the visible read trace attached to every
-- OMNIVIEW answer (db/omniview/0003_read_model.sql) and as the question grammar
-- on the QYRIS surface (db/qyris/). Neither one closes the loop. Both answer a
-- question and stop.
--
-- The recursion is the part that was missing. A cycle runs:
--
--   Q  QUESTION      what is actually being asked
--   Y  YIELD         what opening that question yields: the named unknowns
--   R  READ          the governed read actually performed, and what it did not touch
--   I  INTEGRATION   what the read changes in what is held as true
--   S  SETTLEMENT    what is now settled, and which gate moved
--   T  TRANSFER      the hand-off
--   Q' the next question, which is the Q of the next cycle
--
-- Two laws are enforced here rather than remembered:
--
--   TRANSFER CREATES THE NEXT CONTEXT  a cycle closes by creating its successor.
--                                      There is no "closed and nothing followed"
--                                      except an explicitly terminal cycle that
--                                      states why it is terminal.
--   PRESERVE OPEN FRONTIER             everything still open at T is carried into
--                                      the successor. An open item can be carried
--                                      or explicitly closed. It cannot be dropped.

begin;

create table if not exists thy_qyris_cycle (
  cycle_id          bigint generated always as identity primary key,
  topic_key         text   not null,
  cycle_no          int    not null check (cycle_no >= 1),

  -- Q. The question this cycle exists to answer.
  question          text   not null check (length(btrim(question)) > 0),

  -- Where this cycle came from. Cycle 1 of a chain has no parent; every later
  -- cycle was created BY a transfer and must say which one.
  parent_cycle_id   bigint references thy_qyris_cycle(cycle_id),

  state             text   not null default 'OPEN' check (state in ('OPEN','TRANSFERRED','TERMINAL')),
  terminal_reason   text,

  entered_sequence_no bigint not null,
  opened_at         timestamptz not null default now(),
  closed_at         timestamptz,

  constraint thy_qyris_cycle_first_has_no_parent check (
    (cycle_no = 1 and parent_cycle_id is null) or (cycle_no > 1 and parent_cycle_id is not null)),
  constraint thy_qyris_cycle_terminal_states_why check (
    (state = 'TERMINAL') = (terminal_reason is not null and length(btrim(terminal_reason)) > 0)),
  constraint thy_qyris_cycle_closed_when_not_open check (
    (state = 'OPEN') = (closed_at is null))
);

create index if not exists thy_qyris_cycle_topic_idx  on thy_qyris_cycle (topic_key, cycle_no);
create index if not exists thy_qyris_cycle_parent_idx on thy_qyris_cycle (parent_cycle_id);
create unique index if not exists thy_qyris_cycle_chain_idx on thy_qyris_cycle (topic_key, cycle_no);
-- A cycle transfers once. Two successors would be a fork, not a recursion.
create unique index if not exists thy_qyris_cycle_one_successor_idx
  on thy_qyris_cycle (parent_cycle_id) where parent_cycle_id is not null;

comment on table thy_qyris_cycle is
  'One QYRIS cycle. A cycle closes by creating its successor; the successor''s Q is this cycle''s Q-prime.';

-- STAGES ----------------------------------------------------------------------
create table if not exists thy_qyris_stage (
  cycle_id     bigint not null references thy_qyris_cycle(cycle_id) on delete restrict,
  stage        text   not null check (stage in ('Q','Y','R','I','S','T')),
  stage_index  int    not null check (stage_index between 1 and 6),
  body         text   not null check (length(btrim(body)) > 0),
  -- What this stage stands on. 'NONE' is legal and loud.
  evidence     text   not null check (length(btrim(evidence)) > 0),
  recorded_at  timestamptz not null default now(),
  primary key (cycle_id, stage)
);

create index if not exists thy_qyris_stage_order_idx on thy_qyris_stage (cycle_id, stage_index);

-- The stage order is data, so no caller can reorder the loop by accident.
create or replace function thy_qyris_stage_order()
returns jsonb language sql immutable set search_path = public as $$
  select jsonb_build_array(
    jsonb_build_object('stage','Q','index',1,'name','QUESTION',   'asks','What is actually being asked?'),
    jsonb_build_object('stage','Y','index',2,'name','YIELD',      'asks','What does opening that question yield? Name the unknowns.'),
    jsonb_build_object('stage','R','index',3,'name','READ',       'asks','What was actually read, and what was not touched?'),
    jsonb_build_object('stage','I','index',4,'name','INTEGRATION','asks','What does the read change in what is held as true?'),
    jsonb_build_object('stage','S','index',5,'name','SETTLEMENT', 'asks','What is settled now, and which gate moved?'),
    jsonb_build_object('stage','T','index',6,'name','TRANSFER',   'asks','What does the next context inherit?'))
$$;

create or replace function thy_qyris_stage_index(p_stage text)
returns int language sql immutable set search_path = public as $$
  select case upper(btrim(p_stage))
           when 'Q' then 1 when 'Y' then 2 when 'R' then 3
           when 'I' then 4 when 'S' then 5 when 'T' then 6 end
$$;

-- NO SKIPPING -----------------------------------------------------------------
-- A stage may only be written when every earlier stage of that cycle exists, and
-- a stage is never rewritten: the loop is a record of what happened, not a form.
create or replace function thy_qyris_stage_guard()
returns trigger language plpgsql set search_path = public as $$
declare v_missing text;
begin
  if tg_op <> 'INSERT' then
    raise exception
      'QYRIS_STAGE_IMMUTABLE: stage % of cycle % is recorded and cannot be changed. Open the next cycle instead.',
      old.stage, old.cycle_id using errcode = 'raise_exception';
  end if;

  if new.stage_index <> thy_qyris_stage_index(new.stage) then
    raise exception 'QYRIS_STAGE_INDEX: stage % is index %, not %.',
      new.stage, thy_qyris_stage_index(new.stage), new.stage_index using errcode = 'raise_exception';
  end if;

  select string_agg(s.stage, ' -> ' order by s.idx) into v_missing
    from (values ('Q',1),('Y',2),('R',3),('I',4),('S',5),('T',6)) s(stage, idx)
   where s.idx < new.stage_index
     and not exists (select 1 from thy_qyris_stage x where x.cycle_id = new.cycle_id and x.stage = s.stage);

  if v_missing is not null then
    raise exception
      'QYRIS_STAGE_ORDER: cycle % cannot record % before %. The loop runs Q -> Y -> R -> I -> S -> T.',
      new.cycle_id, new.stage, v_missing using errcode = 'raise_exception';
  end if;

  if exists (select 1 from thy_qyris_cycle c where c.cycle_id = new.cycle_id and c.state <> 'OPEN') then
    raise exception
      'QYRIS_CYCLE_CLOSED: cycle % has already transferred. Record this in the successor cycle.',
      new.cycle_id using errcode = 'raise_exception';
  end if;

  return new;
end $$;

drop trigger if exists thy_qyris_stage_rules on thy_qyris_stage;
create trigger thy_qyris_stage_rules
  before insert or update or delete on thy_qyris_stage
  for each row execute function thy_qyris_stage_guard();

-- FRONTIER --------------------------------------------------------------------
-- The open frontier is everything a cycle raised and did not settle. It is the
-- thing that normally gets lost between contexts, so it is a table, not a habit.
create table if not exists thy_qyris_frontier (
  id             bigint generated always as identity primary key,
  cycle_id       bigint not null references thy_qyris_cycle(cycle_id) on delete restrict,
  item           text   not null check (length(btrim(item)) > 0),
  item_kind      text   not null check (item_kind in ('QUESTION','GATE','UNKNOWN','WORK','RISK')),
  raised_stage   text   not null check (raised_stage in ('Q','Y','R','I','S','T')),

  state          text   not null default 'OPEN' check (state in ('OPEN','CARRIED','CLOSED')),
  -- CARRIED: the successor cycle inherited it. CLOSED: it was settled here, and said why.
  carried_to_cycle_id bigint references thy_qyris_cycle(cycle_id),
  carried_from_id     bigint references thy_qyris_frontier(id),
  closed_reason  text,
  created_at     timestamptz not null default now(),

  constraint thy_qyris_frontier_carried_names_target check (
    (state = 'CARRIED') = (carried_to_cycle_id is not null)),
  constraint thy_qyris_frontier_closed_states_why check (
    (state = 'CLOSED') = (closed_reason is not null and length(btrim(closed_reason)) > 0))
);

create index if not exists thy_qyris_frontier_cycle_idx on thy_qyris_frontier (cycle_id, state);
create index if not exists thy_qyris_frontier_chain_idx on thy_qyris_frontier (carried_from_id);

comment on table thy_qyris_frontier is
  'PRESERVE OPEN FRONTIER: every item a cycle raised and did not settle. At transfer it is carried or explicitly closed; it is never dropped.';

-- A frontier item is never deleted. Losing the frontier quietly is the exact
-- failure this table exists to prevent.
create or replace function thy_qyris_frontier_no_delete()
returns trigger language plpgsql set search_path = public as $$
begin
  raise exception
    'QYRIS_FRONTIER_IMMUTABLE: frontier item % cannot be deleted. Close it with a reason, or carry it forward.',
    old.id using errcode = 'raise_exception';
end $$;

drop trigger if exists thy_qyris_frontier_keep on thy_qyris_frontier;
create trigger thy_qyris_frontier_keep
  before delete on thy_qyris_frontier
  for each row execute function thy_qyris_frontier_no_delete();

commit;
