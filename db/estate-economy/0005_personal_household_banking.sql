-- THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533
-- Personal and household banking operating structure.
-- REUSES the existing canon institution and account spine:
--   public.ersatzreality_financial_accounts  (24 live REE accounts, institution 'ErsatzReality Financial')
--   public.ersatzreality_financial_ledger    (entry spine, extended here rather than replaced)
-- No new institution name is invented. No balance is moved. Every new money field
-- carries amount_state and defaults to OPEN_AMOUNT.


-- ---------------------------------------------------------------------------
-- 1. ACCOUNT TYPE REGISTRY — the product shelf, including the types the live
--    accounts already use, mapped to their banking meaning.
-- ---------------------------------------------------------------------------
create table if not exists public.thylora_bank_account_types (
  type_code               text primary key,
  display_name            text not null,
  banking_class           text not null,       -- CURRENT | SAVINGS | FAMILY_HOUSEHOLD | YOUTH | PAYROLL | RESERVE | INVESTMENT
  purpose                 text not null,
  default_instrument_code text,
  guardian_required       boolean not null default false,
  interest_bearing_state  text not null default 'OPEN',
  overdraft_rule          text not null default 'NOT_PERMITTED',
  statement_cycle         text not null default 'OPEN',
  legacy_account_type     text,                -- value already present in ersatzreality_financial_accounts.account_type
  state                   text not null default 'ACTIVE',
  source_query_id         text,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  constraint thylora_bank_account_types_class_chk
    check (banking_class in ('CURRENT','SAVINGS','FAMILY_HOUSEHOLD','YOUTH','PAYROLL','RESERVE','INVESTMENT'))
);

insert into public.thylora_bank_account_types
  (type_code, display_name, banking_class, purpose, default_instrument_code, guardian_required,
   interest_bearing_state, statement_cycle, legacy_account_type, source_query_id)
values
  ('BANK-TYPE-CURRENT','Current / Checking','CURRENT',
   'Day-to-day account for receiving pay and settling ordinary obligations.','REE',false,
   'OPEN','OPEN','EVERYDAY','THY-Q-20260919-EDEREAIRAH-HISTORY-ECONOMY-532'),
  ('BANK-TYPE-SAVINGS','Savings','SAVINGS',
   'Held value kept aside from daily settlement.','REE',false,
   'OPEN','OPEN','RESERVE','THY-Q-20260919-EDEREAIRAH-HISTORY-ECONOMY-532'),
  ('BANK-TYPE-FAMILY','Family / Household','FAMILY_HOUSEHOLD',
   'Shared household account with more than one authorised operator.','REE',false,
   'OPEN','OPEN',null,'THY-Q-20260919-EDEREAIRAH-HISTORY-ECONOMY-532'),
  ('BANK-TYPE-YOUTH','Youth','YOUTH',
   'Account for a young holder operated under guardian support.','REE',true,
   'OPEN','OPEN',null,'THY-Q-20260919-EDEREAIRAH-HISTORY-ECONOMY-532'),
  ('BANK-TYPE-PAYROLL','Payroll deposit','PAYROLL',
   'Destination account nominated to receive wages.','REE',false,
   'NOT_APPLICABLE','OPEN',null,'THY-Q-20260919-EDEREAIRAH-HISTORY-ECONOMY-532'),
  ('BANK-TYPE-BUILDER','Builder / business pocket','INVESTMENT',
   'Personal pocket used to build a business; not a registered business account.','REE',false,
   'OPEN','OPEN','BUILDER_BUSINESS','THY-Q-20260919-EDEREAIRAH-HISTORY-ECONOMY-532'),
  ('BANK-TYPE-INVEST-LEARN','Investment learning','INVESTMENT',
   'Learning pocket. Account creation implies no holdings.','REE',false,
   'OPEN','OPEN','INVESTMENT_LEARNING','THY-Q-20260919-EDEREAIRAH-HISTORY-ECONOMY-532')
on conflict (type_code) do nothing;

-- Link live accounts to the type registry without altering balances or state.
alter table public.ersatzreality_financial_accounts
  add column if not exists bank_type_code text references public.thylora_bank_account_types(type_code),
  add column if not exists payroll_destination boolean not null default false,
  add column if not exists security_state text not null default 'NORMAL',
  add column if not exists statement_cycle text not null default 'OPEN';

update public.ersatzreality_financial_accounts a
set bank_type_code = t.type_code
from public.thylora_bank_account_types t
where t.legacy_account_type = a.account_type
  and a.bank_type_code is distinct from t.type_code;

-- ---------------------------------------------------------------------------
-- 2. LEDGER EXTENSION — from / to / reason / authority / evidence / amount state
--    DEBIT, CREDIT, TRANSFER, PAYROLL DEPOSIT, INTEREST and FEES are entry types
--    on this one spine rather than seven parallel tables.
-- ---------------------------------------------------------------------------
alter table public.ersatzreality_financial_ledger
  add column if not exists counterparty_account_id uuid references public.ersatzreality_financial_accounts(id),
  add column if not exists counterparty_external   text,
  add column if not exists direction               text,
  add column if not exists reason                  text,
  add column if not exists authority_reference     text,
  add column if not exists evidence                jsonb not null default '{}'::jsonb,
  add column if not exists evidence_state          text not null default 'STRUCTURE_ONLY',
  add column if not exists amount_state            text not null default 'OPEN_AMOUNT',
  add column if not exists value_date              timestamptz,
  add column if not exists value_date_state        text not null default 'OPEN',
  add column if not exists facility_code           text,
  add column if not exists statement_code          text;

alter table public.ersatzreality_financial_ledger
  drop constraint if exists ersatzreality_financial_ledger_direction_chk;
alter table public.ersatzreality_financial_ledger
  add constraint ersatzreality_financial_ledger_direction_chk
  check (direction is null or direction in ('DEBIT','CREDIT'));

alter table public.ersatzreality_financial_ledger
  drop constraint if exists ersatzreality_financial_ledger_amount_state_chk;
alter table public.ersatzreality_financial_ledger
  add constraint ersatzreality_financial_ledger_amount_state_chk
  check (amount_state in ('OPEN_AMOUNT','RECORDED')
         and (amount is null or amount_state = 'RECORDED'));

-- ---------------------------------------------------------------------------
-- 3. CREDIT FACILITIES — loan, mortgage, credit line, overdraft
-- ---------------------------------------------------------------------------
create table if not exists public.thylora_bank_credit_facilities (
  facility_code           text primary key,
  account_id              uuid references public.ersatzreality_financial_accounts(id),
  business_account_id     uuid references public.business_accounts(id),
  facility_class          text not null,      -- LOAN | MORTGAGE | CREDIT_LINE | OVERDRAFT
  instrument_code         text,
  principal               numeric,
  principal_state         text not null default 'OPEN_AMOUNT',
  outstanding             numeric,
  outstanding_state       text not null default 'OPEN_AMOUNT',
  rate_schedule_code      text,
  term_state              text not null default 'OPEN',
  security_or_collateral  text not null default 'OPEN',
  guarantor_identity_state text not null default 'OPEN_IDENTITY',
  authority_reference     text,
  approval_state          text not null default 'STRUCTURE_OPEN',
  earth_credit_claim      boolean not null default false,
  state                   text not null default 'STRUCTURE_OPEN',
  source_query_id         text,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  constraint thylora_bank_credit_facilities_class_chk
    check (facility_class in ('LOAN','MORTGAGE','CREDIT_LINE','OVERDRAFT')),
  constraint thylora_bank_credit_facilities_principal_chk
    check (principal_state in ('OPEN_AMOUNT','RECORDED') and (principal is null or principal_state = 'RECORDED')),
  constraint thylora_bank_credit_facilities_outstanding_chk
    check (outstanding_state in ('OPEN_AMOUNT','RECORDED') and (outstanding is null or outstanding_state = 'RECORDED')),
  constraint thylora_bank_credit_facilities_earth_chk
    check (earth_credit_claim = false),
  constraint thylora_bank_credit_facilities_holder_chk
    check (account_id is not null or business_account_id is not null)
);

-- ---------------------------------------------------------------------------
-- 4. INTEREST AND FEE SCHEDULES — rules, never invented numbers
-- ---------------------------------------------------------------------------
create table if not exists public.thylora_bank_rate_schedules (
  rate_schedule_code      text primary key,
  schedule_class          text not null,      -- INTEREST_CREDIT | INTEREST_DEBIT | FEE
  applies_to_type_code    text references public.thylora_bank_account_types(type_code),
  applies_to_facility     text,
  basis                   text not null default 'OPEN',   -- e.g. PER_PERIOD_ON_BALANCE | FLAT_PER_EVENT
  rate_value              numeric,
  rate_state              text not null default 'OPEN_AMOUNT',
  fee_event               text,
  charging_cycle          text not null default 'OPEN',
  authority_reference     text,
  state                   text not null default 'STRUCTURE_OPEN',
  source_query_id         text,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  constraint thylora_bank_rate_schedules_class_chk
    check (schedule_class in ('INTEREST_CREDIT','INTEREST_DEBIT','FEE')),
  constraint thylora_bank_rate_schedules_rate_chk
    check (rate_state in ('OPEN_AMOUNT','RECORDED') and (rate_value is null or rate_state = 'RECORDED'))
);

-- ---------------------------------------------------------------------------
-- 5. ACCOUNT STATEMENTS
-- ---------------------------------------------------------------------------
create table if not exists public.thylora_bank_statements (
  statement_code          text primary key,
  account_id              uuid not null references public.ersatzreality_financial_accounts(id),
  period_label            text not null,
  period_state            text not null default 'OPEN',
  opening_balance         numeric,
  opening_balance_state   text not null default 'OPEN_AMOUNT',
  closing_balance         numeric,
  closing_balance_state   text not null default 'OPEN_AMOUNT',
  entry_count             integer not null default 0,
  issued_state            text not null default 'NOT_ISSUED',
  delivery_state          text not null default 'OPEN',
  state                   text not null default 'STRUCTURE_OPEN',
  source_query_id         text,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  constraint thylora_bank_statements_open_chk
    check (opening_balance_state in ('OPEN_AMOUNT','RECORDED') and (opening_balance is null or opening_balance_state = 'RECORDED')),
  constraint thylora_bank_statements_close_chk
    check (closing_balance_state in ('OPEN_AMOUNT','RECORDED') and (closing_balance is null or closing_balance_state = 'RECORDED'))
);

-- ---------------------------------------------------------------------------
-- 6. ACCOUNT SECURITY AND FRAUD HOLDS
-- ---------------------------------------------------------------------------
create table if not exists public.thylora_bank_security_events (
  security_event_code     text primary key,
  account_id              uuid references public.ersatzreality_financial_accounts(id),
  business_account_id     uuid references public.business_accounts(id),
  event_class             text not null,      -- FRAUD_HOLD | HOLD_RELEASE | ACCOUNT_LOCK | ACCOUNT_UNLOCK | DISPUTE | ACCESS_CHANGE | GUARDIAN_CHANGE
  raised_by               text not null default 'SYSTEM',
  reason                  text not null,
  held_amount             numeric,
  held_amount_state       text not null default 'OPEN_AMOUNT',
  resolution_state        text not null default 'OPEN',
  evidence                jsonb not null default '{}'::jsonb,
  privacy_state           text not null default 'PRIVATE',
  state                   text not null default 'STRUCTURE_OPEN',
  source_query_id         text,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  constraint thylora_bank_security_events_class_chk
    check (event_class in ('FRAUD_HOLD','HOLD_RELEASE','ACCOUNT_LOCK','ACCOUNT_UNLOCK','DISPUTE','ACCESS_CHANGE','GUARDIAN_CHANGE')),
  constraint thylora_bank_security_events_held_chk
    check (held_amount_state in ('OPEN_AMOUNT','RECORDED') and (held_amount is null or held_amount_state = 'RECORDED')),
  constraint thylora_bank_security_events_holder_chk
    check (account_id is not null or business_account_id is not null)
);
