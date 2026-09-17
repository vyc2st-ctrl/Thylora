-- THYLORA / ErsatzReality vehicle civilization: industry core
-- Additive only. Every object is new and prefixed er_civ_.
-- No existing table is dropped, renamed, altered or rewritten.
-- RLS is enabled with no client policies, matching the existing er_* convention
-- (service role only; reading a registry is not authority to write one).

begin;

-- 1. Companies -------------------------------------------------------------
create table if not exists er_civ_company_registry (
  company_code        text primary key,
  company_name        text not null,
  name_state          text not null default 'PROPOSED_PENDING_CHAIRMAN'
                      check (name_state in ('PROPOSED_PENDING_CHAIRMAN','LOCKED','EXISTING_CANON','UNRESOLVED')),
  pronunciation       text,
  proposed_meaning    text,
  genre               text not null,
  ownership_class     text not null
                      check (ownership_class in ('THYLORA_OWNED','INDEPENDENT','JOINT','EXISTING_CANON')),
  parent_entity       text,
  world_layer         text not null default 'EDEREARIAH',
  earth_claim_boundary text not null default
    'EdereAriah simulated entity only. No Earth company, Earth employment, Earth licensure or physical manufacture is asserted.',
  role_scope          jsonb not null default '[]'::jsonb,
  competes_with       jsonb not null default '[]'::jsonb,
  depends_on_suppliers jsonb not null default '[]'::jsonb,
  canon_links         jsonb not null default '[]'::jsonb,
  state               text not null default 'DESIGN',
  provenance          jsonb not null default '{}'::jsonb,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- 2. Suppliers -------------------------------------------------------------
create table if not exists er_civ_supplier_registry (
  supplier_code       text primary key,
  supplier_name       text not null,
  name_state          text not null default 'PROPOSED_PENDING_CHAIRMAN'
                      check (name_state in ('PROPOSED_PENDING_CHAIRMAN','LOCKED','EXISTING_CANON','UNRESOLVED')),
  pronunciation       text,
  proposed_meaning    text,
  supply_domain       text not null,
  ownership_class     text not null
                      check (ownership_class in ('THYLORA_OWNED','INDEPENDENT','JOINT','EXISTING_CANON')),
  supplies_to         jsonb not null default '[]'::jsonb,
  critical_failure_modes jsonb not null default '[]'::jsonb,
  second_source_state text not null default 'REQUIRED_NOT_YET_NAMED',
  canon_links         jsonb not null default '[]'::jsonb,
  state               text not null default 'DESIGN',
  provenance          jsonb not null default '{}'::jsonb,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- 3. Market structure / anti-monopoly -------------------------------------
create table if not exists er_civ_market_structure (
  genre                 text primary key,
  thylora_lead_company  text,
  independent_companies jsonb not null default '[]'::jsonb,
  concentration_rule    jsonb not null default '{}'::jsonb,
  rationale             text,
  state                 text not null default 'DESIGN',
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- 4. Full mobility class taxonomy (civilian .. military transport) --------
create table if not exists er_civ_mobility_class_registry (
  class_code        text primary key,
  domain            text not null,
  class_family      text not null,
  description       text not null,
  maps_to_existing  jsonb not null default '[]'::jsonb,
  weapons_boundary  text not null default
    'Taxonomy and capability level only. No weapon, munition, targeting or destructive-hardware design is carried in this canon.',
  state             text not null default 'DESIGN',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- 5. Engineering decision studies -----------------------------------------
create table if not exists er_civ_engineering_study (
  study_code          text primary key,
  topic               text not null,
  question            text not null,
  method              text,
  formula             text,
  formula_plain_language text,
  options             jsonb not null default '[]'::jsonb,
  decision_matrix     jsonb not null default '[]'::jsonb,
  worked_numbers      jsonb not null default '{}'::jsonb,
  finding             text not null,
  confidence_state    text not null default 'ENGINEERING_REASONING_EVIDENCE_OPEN'
                      check (confidence_state in (
                        'ENGINEERING_REASONING_EVIDENCE_OPEN',
                        'PARTIALLY_BENCHMARKED',
                        'RESEARCH_ONLY',
                        'VALIDATED')),
  evidence_required   jsonb not null default '[]'::jsonb,
  applies_to          jsonb not null default '[]'::jsonb,
  state               text not null default 'ACTIVE_BUILD',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- 6. Build manifests -------------------------------------------------------
create table if not exists er_civ_manifest (
  manifest_code         text primary key,
  manifest_letter       text,
  working_title         text not null,
  name_state            text not null default 'PROPOSED_PENDING_CHAIRMAN',
  extends_canonical_id  text,
  brand_placement_state text not null default 'PENDING_CHAIRMAN',
  mission               text not null,
  hard_package          jsonb not null default '{}'::jsonb,
  structure             jsonb not null default '{}'::jsonb,
  energy                jsonb not null default '{}'::jsonb,
  safety                jsonb not null default '{}'::jsonb,
  repairability         jsonb not null default '{}'::jsonb,
  modules               jsonb not null default '[]'::jsonb,
  open_gaps             jsonb not null default '[]'::jsonb,
  blockers              jsonb not null default '[]'::jsonb,
  design_gate_state     text not null default 'WRITTEN_BRIEF_COMPLETE_GEOMETRY_OPEN',
  state                 text not null default 'ACTIVE_BUILD',
  provenance            jsonb not null default '{}'::jsonb,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- 7. Name proposals (never locked here) -----------------------------------
create table if not exists er_civ_name_proposal (
  proposal_code    text primary key,
  proposed_name    text not null,
  pronunciation    text,
  proposed_meaning text,
  name_class       text not null
                   check (name_class in ('COMPANY','SUBBRAND','MODEL','PLATFORM','TOWN','COLOR','TERM')),
  for_object       text,
  source_class     text not null default 'ASSISTANT_PROPOSED_DERIVATION',
  option_group     text,
  approval_state   text not null default 'PROPOSED_PENDING_CHAIRMAN'
                   check (approval_state = 'PROPOSED_PENDING_CHAIRMAN'),
  notes            text,
  created_at       timestamptz not null default now()
);
comment on table er_civ_name_proposal is
  'Proposals only. THY-NAME-PROVENANCE-001 forbids silently replacing canon names with assistant-invented names. approval_state is constrained so nothing can be locked from this table.';

-- 8. Render-ready briefs (written design gate) ----------------------------
create table if not exists er_civ_render_brief (
  brief_code          text primary key,
  subject_manifest    text not null,
  written_gate_state  text not null,
  geometry_state      text not null,
  permitted_content   jsonb not null default '[]'::jsonb,
  prohibited_content  jsonb not null default '[]'::jsonb,
  required_callouts   jsonb not null default '[]'::jsonb,
  approval_state      text not null default 'AWAITING_CHAIRMAN_VISUAL_APPROVAL',
  gate_reference      text not null default 'AUTO-VISUAL-GATE-001',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- 9. Reconciliation findings against existing canon ------------------------
create table if not exists er_civ_reconciliation_log (
  finding_code          text primary key,
  finding_type          text not null
                        check (finding_type in ('CONTRADICTION','GAP','DANGLING_REFERENCE','DUPLICATE_TAXONOMY','EMPTY_REQUIRED_REGISTRY')),
  object_a              text,
  object_b              text,
  description           text not null,
  recommended_resolution text,
  authority_required    text not null default 'CHAIRMAN',
  state                 text not null default 'OPEN',
  created_at            timestamptz not null default now()
);

-- 10. Road and bridge engineering findings --------------------------------
create table if not exists er_civ_road_finding (
  finding_code      text primary key,
  topic             text not null,
  question          text not null,
  physics_basis     text,
  plain_language    text,
  finding           text not null,
  numeric_targets   jsonb not null default '{}'::jsonb,
  evidence_required jsonb not null default '[]'::jsonb,
  connected_program text,
  state             text not null default 'ACTIVE_BUILD',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- 11. Safety risks ---------------------------------------------------------
create table if not exists er_civ_safety_risk (
  risk_code       text primary key,
  domain          text not null,
  risk            text not null,
  why_it_matters  text not null,
  current_control text,
  residual_state  text not null default 'OPEN',
  gating_evidence jsonb not null default '[]'::jsonb,
  applies_to      jsonb not null default '[]'::jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table er_civ_company_registry        enable row level security;
alter table er_civ_supplier_registry       enable row level security;
alter table er_civ_market_structure        enable row level security;
alter table er_civ_mobility_class_registry enable row level security;
alter table er_civ_engineering_study       enable row level security;
alter table er_civ_manifest                enable row level security;
alter table er_civ_name_proposal           enable row level security;
alter table er_civ_render_brief            enable row level security;
alter table er_civ_reconciliation_log      enable row level security;
alter table er_civ_road_finding            enable row level security;
alter table er_civ_safety_risk             enable row level security;

commit;
