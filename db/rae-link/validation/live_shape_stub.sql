-- RAE LINK · validation scaffolding · live-shape stub
-- Reproduces, in a throwaway local database, the exact shape of the four live
-- THYLORA registries that 0010_registry_link.sql touches. Every column, NOT NULL
-- and CHECK below was read from thylora-dash (jvsdxhrfhtlgaknhjxlz, PostgreSQL 17.6)
-- on 2026-09-24 through information_schema / pg_constraint. Read-only inspection;
-- nothing was written to the backend.
--
-- Purpose: 0010 v1 was written blind (backend unreachable, blocker B1). This stub
-- lets the harness prove whether 0010 survives contact with the real shapes.
-- It is scaffolding only and is never applied to a real backend.

create table if not exists thylora_agents (agent_code text primary key);
insert into thylora_agents values ('AGENT-STUB') on conflict do nothing;

-- Live: 14 columns, all NOT NULL, status/operating_mode/source_state/measurement_state CHECKed,
-- coordinator_code FK to thylora_agents.
create table if not exists thylora_departments (
  id uuid primary key default gen_random_uuid(),
  department_code text not null unique,
  name text not null,
  purpose text not null,
  status text not null check (status = any (array['active','paused','chairman_review_required','circuit_breaker'])),
  operating_mode text not null check (operating_mode = any (array['autonomous_startup','active','configuration_pending','chairman_review_required','circuit_breaker'])),
  coordinator_code text not null references thylora_agents(agent_code),
  current_assignment text not null,
  priority text not null,
  source_state text not null check (source_state = any (array['connected','connection_pending','verification_active'])),
  measurement_state text not null check (measurement_state = any (array['startup_measurement_running','measured','command_routed','blocked'])),
  last_activity_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Live: the registry where every other workroom (WR-PQR-001 etc.) is recorded.
create table if not exists thylora_workroom_registry (
  id uuid primary key default gen_random_uuid(),
  workroom_code text not null unique,
  title text not null,
  lane text not null,
  purpose text not null,
  state text not null default 'ACTIVE',
  source_of_truth text not null default 'BACKEND',
  current_blockers jsonb not null default '[]'::jsonb,
  completion_tests jsonb not null default '[]'::jsonb,
  evidence jsonb not null default '{}'::jsonb,
  restart_point text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Live: no product_code column, no release_state / state column.
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  product_id text,
  title text,
  approval_state text,
  release_evidence_state text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Live: the store gate that actually decides whether a Shopify product may sell.
create table if not exists thylora_store_product_readiness (
  readiness_id uuid primary key default gen_random_uuid(),
  external_product_id text,
  product_title text,
  product_state text,
  active_allowed boolean not null default false
);

-- Fixture rows mirror the live value combinations read on 2026-09-24 (identifiers neutralised;
-- this repository is public).
insert into products (product_id, title, approval_state, release_evidence_state) values
  ('FIXTURE-PUBLISHED-VERIFIED', 'Fixture: published, evidence verified', 'published', 'verified'),
  ('FIXTURE-PUBLISHED-PARTIAL', 'Fixture: published, evidence partial', 'published', 'partial'),
  ('FIXTURE-APPROVED-PARTIAL', 'Fixture: approved, evidence partial', 'approved', 'partial'),
  ('FIXTURE-PLANNED', 'Fixture: planned', 'planned', 'missing')
on conflict do nothing;

insert into thylora_store_product_readiness (external_product_id, product_title, product_state, active_allowed) values
  ('gid://fixture/Product/ACTIVE', 'Fixture: store gate passed', 'ACTIVE', true),
  ('gid://fixture/Product/DRAFT', 'Fixture: draft', 'DRAFT', false)
on conflict do nothing;
