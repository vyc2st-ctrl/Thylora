-- THYLORA merchandise lane · 0005 · approval gates and make order
-- ADDITIVE ONLY. Not applied by this repository.

begin;

create table if not exists merch_approval_gate (
  gate_code        text primary key,             -- G1..G10
  gate_order       integer not null unique,
  gate_name        text not null,
  applies_to       jsonb not null,               -- ["*"] or specific class codes
  requirement      text not null,
  parent_gate_refs jsonb not null default '[]'::jsonb,  -- existing backend gates this inherits
  authority        text not null,                -- CHAIRMAN | SYSTEM
  verification_steps jsonb not null,
  fail_stop        text not null,
  state            text not null default 'LOCKED',
  created_at       timestamptz not null default now()
);

comment on table merch_approval_gate is
  'Ordered merchandise gates. A SKU may not skip a gate. Gates G1-G7 are system-verifiable; G8-G10 require Chairman authority and external evidence.';

create table if not exists merch_gate_check (
  check_id     uuid primary key default gen_random_uuid(),
  sku_code     text not null references merch_sku (sku_code),
  gate_code    text not null references merch_approval_gate (gate_code),
  result       text not null,                    -- PASS | FAIL | NOT_RUN | BLOCKED
  reasons      jsonb not null default '[]'::jsonb,
  evidence     jsonb not null default '{}'::jsonb,
  checked_by   text,
  checked_at   timestamptz not null default now(),
  unique (sku_code, gate_code, checked_at)
);

create index if not exists merch_gate_check_sku_idx on merch_gate_check (sku_code, gate_code);

-- ---------------------------------------------------------------------------
-- Make order. Which SKU is genuinely fastest to produce, and why.
-- Ranked on evidence already in the backend, not on preference.
-- ---------------------------------------------------------------------------
create table if not exists merch_make_order (
  order_id            uuid primary key default gen_random_uuid(),
  rank                integer not null,
  sku_code            text not null references merch_sku (sku_code),
  speed_class         text not null,             -- FIRST_WAVE | SECOND_WAVE | HELD
  artwork_already_approved boolean not null,
  new_artwork_approvals_needed integer not null,
  tooling_required    boolean not null,
  likeness_involved   boolean not null,
  surfaces_count      integer not null,
  remaining_chairman_decisions jsonb not null,
  remaining_system_work jsonb not null,
  rationale           text not null,
  recorded_at         timestamptz not null default now(),
  unique (rank)
);

comment on table merch_make_order is
  'Fastest-first ordering. Speed here means fewest open approvals and least new artwork work. It is not a delivery estimate: no supplier is selected and no lead time is known.';

commit;
