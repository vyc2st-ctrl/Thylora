-- TIME RUN · 0003 · Causality candidates, historical record and provenance
-- Workroom: WR-TIMERUN-581 · Directive: THY-WORK-TIME-RUN-LIVE-TRAVERSAL-581
--
-- AUTHORITY NOTE
-- Reviewable migration. NOT applied by this repository.
--
-- NOTHING IN THIS FILE IS CANON. Three causality models are stored side by side
-- and none is selected. trun_causality_models.selected is false on every row and
-- a partial unique index makes a second selection impossible once one is made.

begin;

create table if not exists trun_open_mechanics (
  mechanic_id  text primary key,
  label        text not null,
  state        text not null default 'OPEN',
  selected     text,
  decided_by   text,
  decided_at   timestamptz,
  constraint trun_mechanic_state check (state in ('OPEN','SELECTED')),
  constraint trun_mechanic_selection_named check (
    state <> 'SELECTED' or (selected is not null and decided_by is not null)
  )
);

create table if not exists trun_mechanic_options (
  option_code  text primary key,
  mechanic_id  text not null references trun_open_mechanics(mechanic_id) on delete cascade,
  label        text not null,
  rule         text not null,
  consequence  text not null,
  cost         text not null
);

insert into trun_open_mechanics (mechanic_id, label) values
  ('ENTRY_EXIT','Entry and exit'),
  ('CLOTHING','Clothing adaptation'),
  ('VISIT_DURATION','Visit duration'),
  ('INJURY_DEATH','Injury and death'),
  ('CAUSALITY','Causality'),
  ('INFORMATION_TRANSFER','Information transfer')
on conflict (mechanic_id) do nothing;

create table if not exists trun_causality_models (
  model_code   text primary key,
  label        text not null,
  statement    text not null,
  branches     boolean not null,
  requires     text[] not null,
  selected     boolean not null default false,
  decided_by   text,
  constraint trun_causality_selection_named check (not selected or decided_by is not null)
);

create unique index if not exists trun_causality_one_selection
  on trun_causality_models ((selected)) where selected;

insert into trun_causality_models (model_code, label, statement, branches, requires) values
  ('CA_A_VISITS_BECOME_HISTORY','Visits become history',
   'Once a cross-era meeting occurs, that meeting is part of the historical record. It does not automatically open a branch timeline.',
   false, array['FORESIGHT_SEAL','PENDING_FULFILLMENT_STATE','NO_RETCON_RULE','HARM_IS_PERMANENT']),
  ('CA_B_BRANCH_ON_CHANGE','Branch on change',
   'The record holds until a traversal changes a recorded outcome above a declared threshold, at which point a branch record opens and both lines are kept.',
   true, array['CHANGE_THRESHOLD','BRANCH_REGISTRY','BRANCH_RECONCILIATION']),
  ('CA_C_LEDGERED_CAUSALITY','Ledgered causality',
   'One historical ledger, no metaphysics. Every traversal writes an entry. Conflicting entries are marked CONTESTED and resolved by declared precedence, never silently.',
   false, array['PRECEDENCE_RULE','CONTESTED_STATE','RESOLUTION_WITNESS'])
on conflict (model_code) do nothing;

-- The historical record entry for one traversal.
create table if not exists trun_historical_record (
  record_id       uuid primary key default gen_random_uuid(),
  traversal_id    uuid not null references trun_traversals(traversal_id) on delete cascade,
  model_code      text not null references trun_causality_models(model_code),
  record_state    trun_record_state not null default 'PENDING_FULFILLMENT',
  foresight_seal  boolean not null default true,
  retcon_allowed  boolean not null default false,
  harm_permanent  boolean not null default true,
  branch_opened   boolean not null default false,
  contested       boolean not null default false,
  created_at      timestamptz not null default now(),
  unique (traversal_id, model_code),
  -- FULFILLED means the departure exists. A record cannot claim fulfilment
  -- while the traversal it describes has no departure recorded.
  constraint trun_record_fulfilment_honest check (
    record_state <> 'FULFILLED' or retcon_allowed is false
  ),
  -- Under a non-branching model a branch cannot quietly appear.
  constraint trun_record_branch_matches_model check (
    not branch_opened or model_code = 'CA_B_BRANCH_ON_CHANGE'
  )
);

comment on constraint trun_record_fulfilment_honest on trun_historical_record is
  'NO_RETCON. A fulfilled encounter may be annotated. It may not be removed.';

create or replace function trun_record_fulfilment_guard() returns trigger as $$
declare has_departure boolean;
begin
  select (t.departure_at is not null and btrim(t.departure_at) <> '' and t.departure_at <> 'UNSEALED')
    into has_departure
  from trun_traversals t where t.traversal_id = new.traversal_id;

  if new.record_state = 'FULFILLED' and coalesce(has_departure, false) is false then
    raise exception 'PENDING_FULFILLMENT: a record cannot be FULFILLED before the departure exists (traversal %)', new.traversal_id;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trun_record_fulfilment_guard_trg on trun_historical_record;
create trigger trun_record_fulfilment_guard_trg
  before insert or update on trun_historical_record
  for each row execute function trun_record_fulfilment_guard();

-- Provenance for every Time Run record that leaves this workroom.
create table if not exists trun_provenance (
  serial        text primary key,
  subject_kind  text not null,
  subject_id    text not null,
  recorded_by   text not null,
  workroom      text not null,
  directive     text not null,
  record_state  trun_record_state not null default 'PENDING_FULFILLMENT',
  canon         boolean not null default false,
  authored      date not null default current_date,
  constraint trun_provenance_kind check (
    subject_kind in ('ENCOUNTER','TRAVERSAL','PLACE','PERSON','ERA','MECHANIC')
  )
);

commit;
