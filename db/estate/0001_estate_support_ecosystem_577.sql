-- THY-WORK-ESTATE-SUPPLY-STAFF-LIFE-577
-- Estate support ecosystem around the Royal Castle.
-- Backend of record: thylora-dash (jvsdxhrfhtlgaknhjxlz).
--
-- Rules held in this migration:
--   * additive only; no existing row is deleted, renamed or overwritten
--   * no invented person names, business names, prices or balances
--   * every new row carries a state, a custodian role, an account link where one
--     exists, and an explicit open-fields list where it does not
--   * food supply classes keep their single source of truth in
--     thylora_kitchen_suppliers; the estate slot table points at them
--   * no predicate is added to the live graph vocabulary; needed relations are
--     written as contract PROPOSALS in a separate table

begin;

-- ---------------------------------------------------------------------------
-- 1. External supplier slots (estate-wide spine, food classes by pointer)
-- ---------------------------------------------------------------------------
create table if not exists thylora_estate_supplier_slots (
  supplier_slot_code     text primary key,
  estate_code            text not null default 'ER-CASTLE-ROYAL-001',
  time_region            text not null default '1700s',
  supply_class           text not null,
  goods                  text not null,
  sourcing_class         text not null,          -- ESTATE_GROWN | EXTERNAL_PURCHASE | MIXED_OPEN
  kitchen_supplier_code  text,                   -- pointer into thylora_kitchen_suppliers
  source_land_unit_code  text,
  arrival_method         text not null,
  route_code             text,
  receiving_rule         text not null,
  quality_check          text not null,
  rejection_rule         text not null,
  pays_from_account      text,
  settles_through        text,
  contact_role_code      text,
  identity_state         text not null default 'OPEN_IDENTITY',
  no_invented_suppliers  boolean not null default true,
  open_fields            jsonb not null default '[]'::jsonb,
  state                  text not null,
  source_query_id        text,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 2. Road / cart / carry routes (no floating road: every route names anchors)
-- ---------------------------------------------------------------------------
create table if not exists thylora_estate_supply_routes (
  route_code               text primary key,
  estate_code              text not null default 'ER-CASTLE-ROYAL-001',
  time_region              text not null default '1700s',
  route_kind               text not null,
  leg_order                integer not null,
  from_anchor              text not null,
  to_anchor                text not null,
  conveyance               text not null,
  zone_path                jsonb not null default '[]'::jsonb,
  custodian_role_code      text,
  security_role_code       text,
  escort_rule              text,
  halt_rule                text,
  return_leg_code          text,
  measurement_state        text not null default 'UNKNOWN',
  geometry_dependency      text,
  function_code            text,
  account_connection       text,
  provenance_rule          text,
  public_disclosure_state  text not null default 'PRIVATE_EXACT_PUBLIC_ABSTRACT',
  open_fields              jsonb not null default '[]'::jsonb,
  state                    text not null,
  source_query_id          text,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 3. Fuel
-- ---------------------------------------------------------------------------
create table if not exists thylora_estate_fuel_cycle (
  fuel_code            text primary key,
  estate_code          text not null default 'ER-CASTLE-ROYAL-001',
  time_region          text not null default '1700s',
  fuel_class           text not null,
  source_kind          text not null,            -- ESTATE_WOODLAND | PURCHASED | RESIDUE | NOT_ESTABLISHED
  source_reference     text,
  supplier_slot_code   text,
  delivery_route_code  text,
  store_reference      text,
  issue_rule           text not null,
  use_points           jsonb not null default '[]'::jsonb,
  residue_class        text,
  residue_route_code   text,
  custodian_role_code  text,
  authority_role_code  text,
  pays_from_account    text,
  fire_safety_link     text,
  open_fields          jsonb not null default '[]'::jsonb,
  state                text not null,
  source_query_id      text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 4. Water
-- ---------------------------------------------------------------------------
create table if not exists thylora_estate_water_system (
  water_code            text primary key,
  estate_code           text not null default 'ER-CASTLE-ROYAL-001',
  time_region           text not null default '1700s',
  water_stage           text not null,           -- SOURCE | CARRY | USE | FOUL | RESERVE
  stage_order           integer not null,
  water_class           text not null,           -- CLEAN | WORKING | FOUL | FIRE_RESERVE
  source_state          text not null,
  infrastructure_state  text not null,           -- never asserted where canon is silent
  serves_reference      text,
  carry_route_code      text,
  custodian_role_code   text,
  inspection_link       text,
  waste_route_code      text,
  fitness_test_state    text not null default 'OPEN',
  winter_supply_state   text not null default 'OPEN',
  open_fields           jsonb not null default '[]'::jsonb,
  state                 text not null,
  source_query_id       text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 5. Laundry
-- ---------------------------------------------------------------------------
create table if not exists thylora_estate_laundry_cycle (
  laundry_stage_code   text primary key,
  estate_code          text not null default 'ER-CASTLE-ROYAL-001',
  time_region          text not null default '1700s',
  stage                text not null,
  stage_order          integer not null,
  applies_to           jsonb not null default '[]'::jsonb,
  place_state          text not null,
  responsible_slot     text,
  responsible_role_code text,
  water_code           text,
  fuel_code            text,
  soap_supply_slot     text,
  drying_state         text not null default 'OPEN',
  repair_slot          text,
  turnaround_state     text not null default 'OPEN',
  custody_rule         text not null,
  pays_from_account    text,
  waste_route_code     text,
  open_fields          jsonb not null default '[]'::jsonb,
  state                text not null,
  source_query_id      text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 6. Staff lodging
-- ---------------------------------------------------------------------------
create table if not exists thylora_estate_staff_lodging (
  lodging_code             text primary key,
  estate_code              text not null default 'ER-CASTLE-ROYAL-001',
  time_region              text not null default '1700s',
  role_code                text not null,
  person_code              text,
  person_state             text not null default 'OPEN_IDENTITY',
  lodging_class            text not null,        -- IN_CASTLE | ON_ESTATE | OFF_ESTATE | OPEN
  location_state           text not null,
  resident_household_ref   text,
  residence_option_ref     text,
  meal_entitlement_state   text not null,
  personal_storage_state   text not null,
  laundry_access           text,
  access_zone_path         jsonb not null default '[]'::jsonb,
  recall_rule_state        text not null,
  day_off_effect           text not null,
  wage_interaction         text not null,
  pays_from_account        text,
  decision_state           text not null,
  open_fields              jsonb not null default '[]'::jsonb,
  state                    text not null,
  source_query_id          text,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 7. Market access (household purchase and personal purchase kept apart)
-- ---------------------------------------------------------------------------
create table if not exists thylora_estate_market_access (
  market_access_code    text primary key,
  estate_code           text not null default 'ER-CASTLE-ROYAL-001',
  time_region           text not null default '1700s',
  purchase_class        text not null,           -- HOUSEHOLD_PURCHASE | PERSONAL_PURCHASE | ESTATE_SALE
  who_travels_role_code text,
  who_travels_state     text not null,
  market_identity_state text not null,
  travel_route_code     text,
  goods_classes         jsonb not null default '[]'::jsonb,
  payment_logic         text not null,
  pays_from_account     text,
  enters_household_book boolean not null,
  receiving_rule        text not null,
  evidence_state        text not null,
  open_fields           jsonb not null default '[]'::jsonb,
  state                 text not null,
  source_query_id       text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 8. Waste / compost returns (closes the loop back onto named ground)
-- ---------------------------------------------------------------------------
create table if not exists thylora_estate_waste_returns (
  return_code          text primary key,
  estate_code          text not null default 'ER-CASTLE-ROYAL-001',
  time_region          text not null default '1700s',
  waste_class          text not null,
  origin_reference     text not null,
  kitchen_route_code   text,                     -- link to thylora_kitchen_waste_routes
  destination_kind     text not null,
  destination_reference text,
  return_value         text not null,            -- what the estate gets back, if anything
  decided_by_role_code text,
  sanitation_link      text,
  never_returns_to_table boolean not null default false,
  account_effect       text,
  open_fields          jsonb not null default '[]'::jsonb,
  state                text not null,
  source_query_id      text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 9. Graph predicate-contract PROPOSALS
--    Deliberately separate from thylora_graph_predicates /
--    thylora_graph_predicate_contracts so a proposal can never become live
--    vocabulary without a Chairman decision.
-- ---------------------------------------------------------------------------
create table if not exists thylora_graph_predicate_contract_proposals (
  proposal_code       text primary key,
  proposed_predicate  text not null,
  description         text not null,
  subject_types       jsonb not null default '[]'::jsonb,
  object_types        jsonb not null default '[]'::jsonb,
  temporal            boolean not null default false,
  requires_evidence   boolean not null default true,
  literal_allowed     boolean not null default false,
  why_needed          text not null,
  fallback_today      text not null,
  decision_state      text not null default 'CHAIRMAN_DECISION_REQUIRED',
  source_ref          text not null,
  state               text not null default 'PROPOSED',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

commit;

-- ---------------------------------------------------------------------------
-- Row data
-- ---------------------------------------------------------------------------
-- The schema above and the row data were applied to the backend of record
-- (thylora-dash / jvsdxhrfhtlgaknhjxlz) as named migrations in this order:
--
--   estate_support_ecosystem_577_schema      9 tables
--   estate_577_functions                     7 estate functions
--   estate_577_supplier_slots               16 supplier slots
--   estate_577_routes                       19 supply routes
--   estate_577_fuel_and_water                5 fuel classes, 8 water stages
--   estate_577_laundry_and_lodging           6 laundry stages, 10 lodging rows
--   estate_577_market_waste_predicates       3 market lanes, 11 waste returns,
--                                            5 predicate-contract proposals
--   estate_577_economy_flows                 4 castle economy flows
--   estate_577_graph_writeback               6 Finding nodes, 12 edges,
--                                            6 graph version rows
--   estate_577_qyris_gaps_and_continuity     QYRIS check, 3 gap records,
--                                            restart record, delta record,
--                                            work-registry state update
--
-- The backend is the source of truth for row content. docs/ESTATE-SUPPORT-
-- ECOSYSTEM-577.md carries the readable map of every code written.
