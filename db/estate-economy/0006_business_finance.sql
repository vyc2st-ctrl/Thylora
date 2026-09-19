-- THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533
-- Business finance operating structure.
-- REUSES public.businesses (7 rows), public.business_accounts (17 rows) and
-- public.business_transactions as the business money spine. Nothing is replaced.


-- Business account spine: mark payroll accounts and link the type shelf.
alter table public.business_accounts
  add column if not exists is_payroll_account boolean not null default false,
  add column if not exists finance_class      text not null default 'OPERATING',
  add column if not exists security_state     text not null default 'NORMAL';

alter table public.business_accounts
  drop constraint if exists business_accounts_finance_class_chk;
alter table public.business_accounts
  add constraint business_accounts_finance_class_chk
  check (finance_class in ('OPERATING','PAYROLL','TAX','RESERVE','MERCHANT_SETTLEMENT','CAPITAL'));

-- Business ledger spine: give every posting a from / to / reason / authority / evidence.
alter table public.business_transactions
  add column if not exists direction           text,
  add column if not exists counterparty_code   text,
  add column if not exists counterparty_class  text,   -- SUPPLIER | CUSTOMER | STAFF | TAX_AUTHORITY | BANK | ESTATE | INTERNAL
  add column if not exists reason              text,
  add column if not exists authority_reference text,
  add column if not exists amount_state        text not null default 'OPEN_AMOUNT',
  add column if not exists value_date          timestamptz,
  add column if not exists value_date_state    text not null default 'OPEN',
  add column if not exists invoice_code        text,
  add column if not exists purchase_order_code text,
  add column if not exists settlement_code     text,
  add column if not exists tax_entry_code      text;

alter table public.business_transactions
  drop constraint if exists business_transactions_direction_chk;
alter table public.business_transactions
  add constraint business_transactions_direction_chk
  check (direction is null or direction in ('DEBIT','CREDIT'));

alter table public.business_transactions
  drop constraint if exists business_transactions_amount_state_chk;
alter table public.business_transactions
  add constraint business_transactions_amount_state_chk
  check (amount_state in ('OPEN_AMOUNT','RECORDED') and (amount is null or amount_state = 'RECORDED'));

-- ---------------------------------------------------------------------------
-- PURCHASE ORDERS
-- ---------------------------------------------------------------------------
create table if not exists public.thylora_business_purchase_orders (
  purchase_order_code     text primary key,
  business_id             uuid references public.businesses(id),
  estate_code             text,
  supplier_code           text,
  supplier_identity_state text not null default 'OPEN_IDENTITY',
  lines                   jsonb not null default '[]'::jsonb,
  order_total             numeric,
  order_total_state       text not null default 'OPEN_AMOUNT',
  instrument_code         text,
  raised_by               text,
  authority_reference     text,
  expected_delivery_state text not null default 'OPEN',
  status                  text not null default 'STRUCTURE_OPEN',
  evidence                jsonb not null default '{}'::jsonb,
  source_query_id         text,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  constraint thylora_business_purchase_orders_total_chk
    check (order_total_state in ('OPEN_AMOUNT','RECORDED') and (order_total is null or order_total_state = 'RECORDED')),
  constraint thylora_business_purchase_orders_owner_chk
    check (business_id is not null or estate_code is not null)
);

-- ---------------------------------------------------------------------------
-- INVOICES — carries both RECEIVABLE and PAYABLE. One spine, one direction flag.
-- ---------------------------------------------------------------------------
create table if not exists public.thylora_business_invoices (
  invoice_code            text primary key,
  business_id             uuid references public.businesses(id),
  estate_code             text,
  ledger_side             text not null,      -- RECEIVABLE | PAYABLE
  counterparty_code       text,
  counterparty_identity_state text not null default 'OPEN_IDENTITY',
  purchase_order_code     text references public.thylora_business_purchase_orders(purchase_order_code),
  lines                   jsonb not null default '[]'::jsonb,
  net_amount              numeric,
  net_amount_state        text not null default 'OPEN_AMOUNT',
  tax_amount              numeric,
  tax_amount_state        text not null default 'OPEN_AMOUNT',
  gross_amount            numeric,
  gross_amount_state      text not null default 'OPEN_AMOUNT',
  instrument_code         text,
  issue_date_state        text not null default 'OPEN',
  due_date_state          text not null default 'OPEN',
  settlement_state        text not null default 'UNSETTLED',
  authority_reference     text,
  evidence                jsonb not null default '{}'::jsonb,
  status                  text not null default 'STRUCTURE_OPEN',
  source_query_id         text,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  constraint thylora_business_invoices_side_chk check (ledger_side in ('RECEIVABLE','PAYABLE')),
  constraint thylora_business_invoices_net_chk
    check (net_amount_state in ('OPEN_AMOUNT','RECORDED') and (net_amount is null or net_amount_state = 'RECORDED')),
  constraint thylora_business_invoices_tax_chk
    check (tax_amount_state in ('OPEN_AMOUNT','RECORDED','NOT_APPLICABLE') and (tax_amount is null or tax_amount_state = 'RECORDED')),
  constraint thylora_business_invoices_gross_chk
    check (gross_amount_state in ('OPEN_AMOUNT','RECORDED') and (gross_amount is null or gross_amount_state = 'RECORDED')),
  constraint thylora_business_invoices_owner_chk
    check (business_id is not null or estate_code is not null)
);

-- ---------------------------------------------------------------------------
-- SUPPLIER PAYMENTS AND MERCHANT SETTLEMENT
-- ---------------------------------------------------------------------------
create table if not exists public.thylora_business_settlements (
  settlement_code         text primary key,
  business_id             uuid references public.businesses(id),
  estate_code             text,
  settlement_class        text not null,      -- SUPPLIER_PAYMENT | MERCHANT_SETTLEMENT | STAFF_WAGE | REFUND | INTERNAL_TRANSFER
  from_account_reference  text not null,
  to_account_reference    text not null,
  invoice_code            text references public.thylora_business_invoices(invoice_code),
  amount                  numeric,
  amount_state            text not null default 'OPEN_AMOUNT',
  instrument_code         text,
  provider_reference      text,
  authority_reference     text,
  evidence                jsonb not null default '{}'::jsonb,
  evidence_state          text not null default 'STRUCTURE_ONLY',
  status                  text not null default 'STRUCTURE_OPEN',
  source_query_id         text,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  constraint thylora_business_settlements_class_chk
    check (settlement_class in ('SUPPLIER_PAYMENT','MERCHANT_SETTLEMENT','STAFF_WAGE','REFUND','INTERNAL_TRANSFER')),
  constraint thylora_business_settlements_amount_chk
    check (amount_state in ('OPEN_AMOUNT','RECORDED') and (amount is null or amount_state = 'RECORDED'))
);

-- ---------------------------------------------------------------------------
-- INSURANCE
-- ---------------------------------------------------------------------------
create table if not exists public.thylora_business_insurance (
  policy_code             text primary key,
  business_id             uuid references public.businesses(id),
  estate_code             text,
  cover_class             text not null,      -- PROPERTY | FIRE | LIABILITY | GOODS_IN_TRANSIT | LIVESTOCK | PERSONNEL
  insurer_identity_code   text,
  insurer_identity_state  text not null default 'OPEN_IDENTITY',
  covered_reference       text not null,
  sum_insured             numeric,
  sum_insured_state       text not null default 'OPEN_AMOUNT',
  premium                 numeric,
  premium_state           text not null default 'OPEN_AMOUNT',
  instrument_code         text,
  period_state            text not null default 'OPEN',
  earth_policy_claim      boolean not null default false,
  status                  text not null default 'STRUCTURE_OPEN',
  source_query_id         text,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  constraint thylora_business_insurance_sum_chk
    check (sum_insured_state in ('OPEN_AMOUNT','RECORDED') and (sum_insured is null or sum_insured_state = 'RECORDED')),
  constraint thylora_business_insurance_premium_chk
    check (premium_state in ('OPEN_AMOUNT','RECORDED') and (premium is null or premium_state = 'RECORDED')),
  constraint thylora_business_insurance_earth_chk check (earth_policy_claim = false)
);

-- ---------------------------------------------------------------------------
-- TAX LEDGER
-- ---------------------------------------------------------------------------
create table if not exists public.thylora_business_tax_ledger (
  tax_entry_code          text primary key,
  business_id             uuid references public.businesses(id),
  estate_code             text,
  tax_class               text not null,      -- SALES | INCOME | PROPERTY | DUTY | TENANT_RENT_DUE | OTHER
  jurisdiction_state      text not null default 'OPEN',
  world_layer             text not null default 'EDEREAIRAH',
  period_label            text,
  period_state            text not null default 'OPEN',
  assessed_amount         numeric,
  assessed_amount_state   text not null default 'OPEN_AMOUNT',
  paid_amount             numeric,
  paid_amount_state       text not null default 'OPEN_AMOUNT',
  instrument_code         text,
  authority_reference     text,
  earth_tax_claim         boolean not null default false,
  status                  text not null default 'STRUCTURE_OPEN',
  source_query_id         text,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  constraint thylora_business_tax_ledger_assessed_chk
    check (assessed_amount_state in ('OPEN_AMOUNT','RECORDED') and (assessed_amount is null or assessed_amount_state = 'RECORDED')),
  constraint thylora_business_tax_ledger_paid_chk
    check (paid_amount_state in ('OPEN_AMOUNT','RECORDED') and (paid_amount is null or paid_amount_state = 'RECORDED')),
  constraint thylora_business_tax_ledger_earth_chk check (earth_tax_claim = false)
);

-- ---------------------------------------------------------------------------
-- ASSET REGISTER + DEPRECIATION / MAINTENANCE
-- ---------------------------------------------------------------------------
create table if not exists public.thylora_business_assets (
  asset_code              text primary key,
  business_id             uuid references public.businesses(id),
  estate_code             text,
  asset_class             text not null,      -- LAND | BUILDING | VEHICLE | LIVESTOCK | EQUIPMENT | FURNITURE | COLLECTION_ITEM | INTANGIBLE
  description             text not null,
  linked_reference        text,               -- royal collection accession, land unit, vehicle registry row
  maker_person            text,
  maker_state             text not null default 'OPEN',
  acquisition_mode        text not null default 'OPEN',
  acquisition_cost        numeric,
  acquisition_cost_state  text not null default 'OPEN_AMOUNT',
  carrying_value          numeric,
  carrying_value_state    text not null default 'OPEN_AMOUNT',
  depreciation_basis      text not null default 'OPEN',
  maintenance_cycle       text not null default 'OPEN',
  maintenance_events      jsonb not null default '[]'::jsonb,
  custodian_role_code     text,
  instrument_code         text,
  status                  text not null default 'STRUCTURE_OPEN',
  source_query_id         text,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  constraint thylora_business_assets_cost_chk
    check (acquisition_cost_state in ('OPEN_AMOUNT','RECORDED') and (acquisition_cost is null or acquisition_cost_state = 'RECORDED')),
  constraint thylora_business_assets_carrying_chk
    check (carrying_value_state in ('OPEN_AMOUNT','RECORDED') and (carrying_value is null or carrying_value_state = 'RECORDED'))
);

-- ---------------------------------------------------------------------------
-- OWNER EQUITY
-- ---------------------------------------------------------------------------
create table if not exists public.thylora_business_equity (
  equity_code             text primary key,
  business_id             uuid not null references public.businesses(id),
  holder_identity_code    text,
  holder_identity_state   text not null default 'OPEN_IDENTITY',
  equity_class            text not null,      -- FOUNDER | ORDINARY_SHARE | PREFERRED_SHARE | PARTNERSHIP_INTEREST | RETAINED_EARNINGS
  units_held              numeric,
  units_held_state        text not null default 'OPEN_AMOUNT',
  percent_held            numeric,
  percent_held_state      text not null default 'OPEN_AMOUNT',
  consideration_paid      numeric,
  consideration_state     text not null default 'OPEN_AMOUNT',
  instrument_code         text,
  authority_reference     text,
  status                  text not null default 'STRUCTURE_OPEN',
  source_query_id         text,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  constraint thylora_business_equity_units_chk
    check (units_held_state in ('OPEN_AMOUNT','RECORDED') and (units_held is null or units_held_state = 'RECORDED')),
  constraint thylora_business_equity_percent_chk
    check (percent_held_state in ('OPEN_AMOUNT','RECORDED') and (percent_held is null or percent_held_state = 'RECORDED')),
  constraint thylora_business_equity_consideration_chk
    check (consideration_state in ('OPEN_AMOUNT','RECORDED') and (consideration_paid is null or consideration_state = 'RECORDED'))
);

-- ---------------------------------------------------------------------------
-- PROFIT / LOSS PER PERIOD
-- ---------------------------------------------------------------------------
create table if not exists public.thylora_business_period_results (
  result_code             text primary key,
  business_id             uuid references public.businesses(id),
  estate_code             text,
  period_label            text not null,
  period_state            text not null default 'OPEN',
  revenue                 numeric,
  revenue_state           text not null default 'OPEN_AMOUNT',
  cost_of_sales           numeric,
  cost_of_sales_state     text not null default 'OPEN_AMOUNT',
  operating_expense       numeric,
  operating_expense_state text not null default 'OPEN_AMOUNT',
  result_amount           numeric,
  result_amount_state     text not null default 'OPEN_AMOUNT',
  instrument_code         text,
  basis_note              text not null default 'Computed only from RECORDED postings. An OPEN_AMOUNT posting keeps the period result OPEN.',
  status                  text not null default 'STRUCTURE_OPEN',
  source_query_id         text,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  constraint thylora_business_period_results_revenue_chk
    check (revenue_state in ('OPEN_AMOUNT','RECORDED') and (revenue is null or revenue_state = 'RECORDED')),
  constraint thylora_business_period_results_result_chk
    check (result_amount_state in ('OPEN_AMOUNT','RECORDED') and (result_amount is null or result_amount_state = 'RECORDED')),
  constraint thylora_business_period_results_owner_chk
    check (business_id is not null or estate_code is not null)
);
