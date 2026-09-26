-- THYLORA · autonomy gate receipts — PROPOSED, NOT APPLIED
-- Workroom: WR-GATE-NETWORK-620
-- Target: thylora-dash (jvsdxhrfhtlgaknhjxlz)
--
-- STATUS: REVIEW ONLY. Do not apply without Chairman instruction.
-- Strictly additive: one new table, three NULLABLE columns, one view.
-- Existing rows, the claim function, the cron job and the running worker
-- (thylora-autonomy-worker v2) are untouched. A task with gate_path IS NULL
-- behaves exactly as today.
--
-- PRE-APPLY VERIFICATION (not yet run — the read was not authorised this session):
--   1. confirm thylora_autonomy_tasks.id and thylora_autonomy_runs.id are uuid
--   2. confirm no existing columns named route_code / lane_code / gate_path
--   3. confirm RLS posture on thylora_autonomy_* so the new table matches it

begin;

alter table public.thylora_autonomy_tasks
  add column if not exists lane_code  text,     -- e.g. SECOND-GEAR-DETECTIVE
  add column if not exists route_code text,     -- route instance id inside the lane
  add column if not exists gate_path  text[];   -- ordered gate codes; NULL = legacy task

create table if not exists public.thylora_gate_receipts (
  id           uuid primary key default gen_random_uuid(),
  task_id      uuid not null references public.thylora_autonomy_tasks(id) on delete cascade,
  run_id       uuid references public.thylora_autonomy_runs(id) on delete set null,
  lane_code    text,
  route_code   text,
  gate_code    text not null check (gate_code in (
                 'PERSON','PRIVACY','SCENE','OBJECT','VISUAL','RIGHTS',
                 'PRODUCT','STORE','PUBLICATION','MONEY','LEGAL','AUTONOMY')),
  decision     text not null check (decision in ('PASS','PARTIAL','HOLD','ESCALATE')),
  gap_action   text check (gap_action in (
                 'REMOVE','REPAIR','REPURPOSE','ROUTE_AROUND','ESCALATE','PRESERVE_UNKNOWN')),
  g_value      numeric check (g_value is null or (g_value >= 0 and g_value <= 1)), -- NULL = UNKNOWN
  factors      jsonb not null default '{}'::jsonb,  -- {E,C,A,R,X}; A computed by worker code
  reasons      jsonb not null default '[]'::jsonb,
  warns_gates  text[] not null default '{}',        -- connected gates warned by this receipt
  authority_source text not null default 'AUTONOMY_CLASS', -- how A was computed
  verification_state text not null default 'GENERATED_NOT_EXTERNAL_PROOF',
  created_at   timestamptz not null default now()
);

create index if not exists thylora_gate_receipts_task_idx  on public.thylora_gate_receipts(task_id);
create index if not exists thylora_gate_receipts_route_idx on public.thylora_gate_receipts(lane_code, route_code, gate_code);

alter table public.thylora_gate_receipts enable row level security;
-- No policies: service role only, same as the worker's other writes.

-- Open cross-gate warnings, scoped to the route that raised them.
create or replace view public.thylora_open_gate_warnings as
select r.lane_code, r.route_code, r.gate_code as from_gate, w.to_gate, r.decision, r.created_at, r.task_id
from public.thylora_gate_receipts r
cross join lateral unnest(r.warns_gates) as w(to_gate)
where r.decision <> 'PASS'
  and not exists (
    select 1 from public.thylora_gate_receipts later
    where later.route_code is not distinct from r.route_code
      and later.gate_code = r.gate_code
      and later.decision = 'PASS'
      and later.created_at > r.created_at);

commit;

-- ROLLBACK (additive, so rollback is a clean drop):
-- drop view if exists public.thylora_open_gate_warnings;
-- drop table if exists public.thylora_gate_receipts;
-- alter table public.thylora_autonomy_tasks drop column if exists gate_path,
--   drop column if exists route_code, drop column if exists lane_code;
