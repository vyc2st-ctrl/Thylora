-- THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533
-- Castle estate / tenant operating structures for ER-CASTLE-ROYAL-001.
-- Extends, and does not replace, thylora_estate_function_registry (sequence 531/532),
-- household_role_registry, household_shift_schedule and household_access_register.
--
-- Identity discipline: where no tenant/resident name exists in canon, the row carries a
-- real structural slot with identity_state = 'OPEN_IDENTITY'. No person is invented.
-- Amount discipline: every money field carries amount_state; 'OPEN_AMOUNT' is the default
-- and an amount may only be present when amount_state = 'RECORDED'.


-- ---------------------------------------------------------------------------
-- 1. TENANT HOLDINGS + LEASE / RENT RECORDS
-- ---------------------------------------------------------------------------
create table if not exists public.thylora_estate_tenancies (
  holding_code            text primary key,
  estate_code             text not null default 'ER-CASTLE-ROYAL-001',
  time_region             text not null default '1700s',
  holding_type            text not null,          -- FARM | COTTAGE | GARDEN_PLOT | WORKSHOP | PASTURE | MILL | OTHER
  holding_name            text,
  tenant_identity_code    text,                   -- null while OPEN_IDENTITY
  tenant_identity_state   text not null default 'OPEN_IDENTITY',
  tenure_form             text not null default 'OPEN',   -- e.g. LEASE_FOR_YEARS | AT_WILL | COPYHOLD_EQUIVALENT
  rent_form               text not null default 'OPEN',   -- COIN | SHARE_OF_PRODUCE | LABOUR | MIXED
  rent_instrument_code    text,                   -- references financial_instrument_registry.instrument_code when coin
  rent_amount             numeric,
  rent_amount_state       text not null default 'OPEN_AMOUNT',
  rent_period             text not null default 'OPEN',   -- e.g. QUARTERLY | ANNUAL | HARVEST
  term_length             text not null default 'OPEN',
  succession_rule         text not null default 'OPEN',
  dispute_path            text not null default 'OPEN',
  responsible_role_code   text,                   -- household_role_registry.role_code
  function_code           text not null default 'EST-TENANCY-001',
  open_fields             text[] not null default '{}',
  state                   text not null default 'STRUCTURE_OPEN_IDENTITY',
  source_query_id         text,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  constraint thylora_estate_tenancies_identity_state_chk
    check (tenant_identity_state in ('OPEN_IDENTITY','NAMED','SUPERSEDED')),
  constraint thylora_estate_tenancies_identity_pairing_chk
    check ((tenant_identity_state = 'NAMED') = (tenant_identity_code is not null)),
  constraint thylora_estate_tenancies_rent_amount_chk
    check (rent_amount_state in ('OPEN_AMOUNT','RECORDED','NOT_APPLICABLE')
           and (rent_amount is null or rent_amount_state = 'RECORDED'))
);

-- ---------------------------------------------------------------------------
-- 2. RESIDENT HOUSEHOLDS + HOUSING CONDITION ANCHOR
-- ---------------------------------------------------------------------------
create table if not exists public.thylora_estate_resident_households (
  resident_household_code text primary key,
  estate_code             text not null default 'ER-CASTLE-ROYAL-001',
  time_region             text not null default '1700s',
  holding_code            text references public.thylora_estate_tenancies(holding_code),
  housing_unit_reference  text,
  household_class         text not null,          -- TENANT_FAMILY | ESTATE_STAFF | GUARD_FAMILY | CRAFT_FAMILY
  head_identity_code      text,
  head_identity_state     text not null default 'OPEN_IDENTITY',
  household_size_state    text not null default 'OPEN',
  housing_condition_state text not null default 'NOT_YET_INSPECTED',
  welfare_state           text not null default 'NOT_YET_CHECKED',
  responsible_role_code   text not null default 'HH-1700-STEWARD',
  open_fields             text[] not null default '{}',
  state                   text not null default 'STRUCTURE_OPEN_IDENTITY',
  source_query_id         text,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  constraint thylora_estate_resident_households_identity_chk
    check (head_identity_state in ('OPEN_IDENTITY','NAMED','SUPERSEDED')
           and ((head_identity_state = 'NAMED') = (head_identity_code is not null)))
);

-- ---------------------------------------------------------------------------
-- 3. LAND UNITS — farms, vegetable growers, herb gardens, pasture, orchard
-- ---------------------------------------------------------------------------
create table if not exists public.thylora_estate_land_units (
  land_unit_code          text primary key,
  estate_code             text not null default 'ER-CASTLE-ROYAL-001',
  time_region             text not null default '1700s',
  unit_type               text not null,          -- FARM | VEGETABLE_GROUND | HERB_GARDEN | ORCHARD | PASTURE | WOODLAND | FISHPOND
  unit_name               text,
  worked_by_holding_code  text references public.thylora_estate_tenancies(holding_code),
  worked_by_role_code     text,
  produce_classes         text[] not null default '{}',
  supplies_function_code  text,                   -- thylora_estate_function_registry.function_code
  distance_from_castle    text not null default 'OPEN',
  yield_measure_state     text not null default 'OPEN',
  season_calendar_state   text not null default 'OPEN_BLOCKED_ON_NATIVE_CALENDAR',
  open_fields             text[] not null default '{}',
  state                   text not null default 'STRUCTURE_OPEN_DETAIL',
  source_query_id         text,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 4. ANIMAL CARE
-- ---------------------------------------------------------------------------
create table if not exists public.thylora_estate_animal_groups (
  animal_group_code       text primary key,
  estate_code             text not null default 'ER-CASTLE-ROYAL-001',
  time_region             text not null default '1700s',
  species_class           text not null,          -- HORSE | CATTLE | SHEEP | PIG | POULTRY | WORKING_DOG | OTHER
  purpose                 text not null,          -- RIDING | DRAUGHT | MEAT | DAIRY | WOOL | EGGS | GUARD
  housed_at               text,                   -- stable / byre / yard reference
  count_state             text not null default 'OPEN',
  headcount               integer,
  responsible_role_code   text not null default 'HH-1700-STABLE',
  feed_source_unit_code   text references public.thylora_estate_land_units(land_unit_code),
  care_cycle              text not null default 'OPEN',
  farrier_or_vet_provision text not null default 'OPEN',
  retirement_rule         text not null default 'OPEN',
  function_code           text not null default 'EST-ANIMAL-CARE-001',
  open_fields             text[] not null default '{}',
  state                   text not null default 'STRUCTURE_OPEN_DETAIL',
  source_query_id         text,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  constraint thylora_estate_animal_groups_count_chk
    check (count_state in ('OPEN','RECORDED') and (headcount is null or count_state = 'RECORDED'))
);

-- ---------------------------------------------------------------------------
-- 5. PROVISIONING + GARDEN/FARM REQUISITIONS
-- ---------------------------------------------------------------------------
create table if not exists public.thylora_estate_provision_orders (
  order_code              text primary key,
  estate_code             text not null default 'ER-CASTLE-ROYAL-001',
  time_region             text not null default '1700s',
  order_type              text not null,          -- PURCHASE | ESTATE_REQUISITION
  raised_by_role_code     text not null default 'HH-1700-PROVISIONER',
  for_function_code       text,
  supplier_code           text,                   -- thylora_kitchen_suppliers.supplier_code when external
  source_land_unit_code   text references public.thylora_estate_land_units(land_unit_code),
  items                   jsonb not null default '[]'::jsonb,
  amount                  numeric,
  amount_state            text not null default 'OPEN_AMOUNT',
  instrument_code         text,
  ordered_on_state        text not null default 'OPEN_BLOCKED_ON_NATIVE_CALENDAR',
  authority_role_code     text not null default 'HH-1700-STEWARD',
  evidence                jsonb not null default '{}'::jsonb,
  status                  text not null default 'STRUCTURE_OPEN',
  source_query_id         text,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  constraint thylora_estate_provision_orders_type_chk
    check (order_type in ('PURCHASE','ESTATE_REQUISITION')),
  constraint thylora_estate_provision_orders_amount_chk
    check (amount_state in ('OPEN_AMOUNT','RECORDED','NOT_APPLICABLE')
           and (amount is null or amount_state = 'RECORDED'))
);

-- ---------------------------------------------------------------------------
-- 6. FOOD RECEIVING — the gate crossing where goods become stores
-- ---------------------------------------------------------------------------
create table if not exists public.thylora_estate_receiving_records (
  receipt_code            text primary key,
  estate_code             text not null default 'ER-CASTLE-ROYAL-001',
  order_code              text references public.thylora_estate_provision_orders(order_code),
  received_at_post_code   text,                   -- thylora_security_posts.post_code (gate is a guard post)
  received_by_role_code   text not null default 'HH-1700-PROVISIONER',
  security_check_role_code text not null default 'HH-1700-CAPTAIN',
  count_method            text not null default 'OPEN',
  tally_record_form       text not null default 'OPEN',
  rejection_rule          text not null default 'OPEN',
  rejected_items          jsonb not null default '[]'::jsonb,
  routed_to_store_code    text,                   -- thylora_kitchen_stores.store_code
  function_code           text not null default 'EST-FOOD-RECEIVING-001',
  status                  text not null default 'STRUCTURE_OPEN',
  source_query_id         text,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 7. INSPECTIONS — housing condition, well/water, sanitation, road, general, welfare
-- ---------------------------------------------------------------------------
create table if not exists public.thylora_estate_inspections (
  inspection_code         text primary key,
  estate_code             text not null default 'ER-CASTLE-ROYAL-001',
  time_region             text not null default '1700s',
  inspection_type         text not null,
  subject_reference       text not null,          -- holding / household / well / road / building code
  inspector_role_code     text,
  inspection_cycle        text not null default 'OPEN',
  record_form             text not null default 'OPEN',
  escalation_path         text not null default 'OPEN',
  finding_state           text not null default 'NOT_YET_RUN',
  findings                jsonb not null default '[]'::jsonb,
  raises_work_order_code  text,
  function_code           text,
  state                   text not null default 'STRUCTURE_OPEN',
  source_query_id         text,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  constraint thylora_estate_inspections_type_chk
    check (inspection_type in ('HOUSING_CONDITION','WELL_WATER','SANITATION','ROAD_MAINTENANCE',
                               'ESTATE_GENERAL','RESIDENT_WELFARE','STORES_INVENTORY','FIRE_SAFETY'))
);

-- ---------------------------------------------------------------------------
-- 8. INCIDENTS — theft/robbery, fire, medical, other emergency. Shared by estate + security.
-- ---------------------------------------------------------------------------
create table if not exists public.thylora_estate_incidents (
  incident_code           text primary key,
  estate_code             text not null default 'ER-CASTLE-ROYAL-001',
  time_region             text not null default '1700s',
  domain                  text not null,          -- ESTATE | SECURITY
  incident_type           text not null,
  post_code               text,
  location_reference      text,
  alarm_method            text not null default 'OPEN',
  first_responder_role    text,
  muster_rule             text not null default 'OPEN',
  response_sequence       jsonb not null default '[]'::jsonb,
  loss_procedure          text not null default 'OPEN',
  outcome_state           text not null default 'STRUCTURE_OPEN',
  function_code           text,
  evidence                jsonb not null default '{}'::jsonb,
  state                   text not null default 'STRUCTURE_OPEN',
  source_query_id         text,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  constraint thylora_estate_incidents_domain_chk check (domain in ('ESTATE','SECURITY')),
  constraint thylora_estate_incidents_type_chk
    check (incident_type in ('THEFT','ROBBERY','FIRE','MEDICAL','ANIMAL_LOSS','STRUCTURAL_FAILURE',
                             'INTRUSION','ROAD_ATTACK','OTHER_EMERGENCY'))
);

-- ---------------------------------------------------------------------------
-- 9. MAINTENANCE WORK ORDERS
-- ---------------------------------------------------------------------------
create table if not exists public.thylora_estate_work_orders (
  work_order_code         text primary key,
  estate_code             text not null default 'ER-CASTLE-ROYAL-001',
  time_region             text not null default '1700s',
  raised_from             text not null default 'INSPECTION',  -- INSPECTION | INCIDENT | ROUTINE_CYCLE | REQUEST
  raised_from_reference   text,
  trade_class             text not null,          -- MASONRY | CARPENTRY | ROOFING | SMITH | GLAZING | WATER | ROAD | OTHER
  trade_source            text not null default 'OPEN',  -- RESIDENT_TRADE | CALLED_IN
  subject_reference       text not null,
  authorising_role_code   text not null default 'HH-1700-STEWARD',
  cost_amount             numeric,
  cost_amount_state       text not null default 'OPEN_AMOUNT',
  instrument_code         text,
  provenance_event_required boolean not null default true,
  function_code           text not null default 'EST-MAINTENANCE-001',
  status                  text not null default 'STRUCTURE_OPEN',
  source_query_id         text,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  constraint thylora_estate_work_orders_cost_chk
    check (cost_amount_state in ('OPEN_AMOUNT','RECORDED','NOT_APPLICABLE')
           and (cost_amount is null or cost_amount_state = 'RECORDED'))
);

-- ---------------------------------------------------------------------------
-- 10. ESTATE ACCOUNTING — accounts + double-sided ledger with OPEN_AMOUNT support
-- ---------------------------------------------------------------------------
create table if not exists public.thylora_estate_accounts (
  estate_account_code     text primary key,
  estate_code             text not null default 'ER-CASTLE-ROYAL-001',
  account_name            text not null,
  account_class           text not null,          -- INCOME | EXPENSE | HOLDING | OBLIGATION | EXTERNAL_COUNTERPARTY
  instrument_code         text,
  ledger_form             text not null default 'OPEN',
  accounting_period       text not null default 'OPEN',
  audit_role_code         text not null default 'OPEN',
  custodian_role_code     text not null default 'HH-1700-SCRIBE',
  balance                 numeric,
  balance_state           text not null default 'OPEN_AMOUNT',
  function_code           text not null default 'EST-ACCOUNTING-001',
  state                   text not null default 'STRUCTURE_OPEN',
  source_query_id         text,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  constraint thylora_estate_accounts_balance_chk
    check (balance_state in ('OPEN_AMOUNT','RECORDED') and (balance is null or balance_state = 'RECORDED'))
);

create table if not exists public.thylora_estate_ledger_entries (
  entry_code              text primary key,
  estate_code             text not null default 'ER-CASTLE-ROYAL-001',
  flow_class              text not null,
  from_account_code       text,
  from_account_external   text,
  to_account_code         text,
  to_account_external     text,
  reason                  text not null,
  amount                  numeric,
  amount_state            text not null default 'OPEN_AMOUNT',
  instrument_code         text,
  currency_state          text not null default 'OPEN',
  entry_date_state        text not null default 'OPEN_BLOCKED_ON_NATIVE_CALENDAR',
  entry_date              timestamptz,
  authority_role_code     text,
  authority_state         text not null default 'OPEN',
  evidence                jsonb not null default '{}'::jsonb,
  evidence_state          text not null default 'STRUCTURE_ONLY',
  linked_reference        text,
  status                  text not null default 'STRUCTURE_OPEN',
  source_query_id         text,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  constraint thylora_estate_ledger_entries_amount_chk
    check (amount_state in ('OPEN_AMOUNT','RECORDED') and (amount is null or amount_state = 'RECORDED')),
  constraint thylora_estate_ledger_entries_from_chk
    check (from_account_code is not null or from_account_external is not null),
  constraint thylora_estate_ledger_entries_to_chk
    check (to_account_code is not null or to_account_external is not null)
);
