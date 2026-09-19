-- THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533
-- Market operating structure.
-- REUSES the existing (empty) public.thylora_world_market_instruments and
-- public.thylora_world_market_quotes as the instrument and price spine.
-- NO fake live quotes are created. A quote row must declare its source_type and
-- evidence_state, and anything synthetic must say TEST or SIMULATION in both.


-- ---------------------------------------------------------------------------
-- 1. MARKET VENUE / EXCHANGE
-- ---------------------------------------------------------------------------
create table if not exists public.thylora_world_market_venues (
  venue_id                text primary key,
  canonical_name          text not null,
  venue_class             text not null,      -- EXCHANGE | OVER_THE_COUNTER | COMMODITY_MARKET | PRIVATE_PLACEMENT | ESTATE_MARKET
  reality_layer           text not null default 'EDEREAIRAH',
  settlement_instrument   text,               -- financial_instrument_registry.instrument_code
  world_time_profile_ref  text,               -- thylora_world_time_profiles
  operating_authority     text not null default 'OPEN',
  admission_rule          text not null default 'OPEN',
  regulation_code         text,
  status                  text not null default 'STRUCTURE_OPEN',
  provenance              jsonb not null default '{}'::jsonb,
  source_query_id         text,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  constraint thylora_world_market_venues_class_chk
    check (venue_class in ('EXCHANGE','OVER_THE_COUNTER','COMMODITY_MARKET','PRIVATE_PLACEMENT','ESTATE_MARKET'))
);

-- ---------------------------------------------------------------------------
-- 2. MARKET HOURS — dependent on world time, not on Earth clocks
-- ---------------------------------------------------------------------------
create table if not exists public.thylora_world_market_sessions (
  session_code            text primary key,
  venue_id                text not null references public.thylora_world_market_venues(venue_id),
  session_name            text not null,      -- OPEN_AUCTION | CONTINUOUS | CLOSE | SETTLEMENT
  session_order           integer not null,
  world_time_dependency   text not null
    default 'Session boundaries are expressed in EdereAirah world time. Native calendar units, month names and year numbering are unresolved, so no absolute clock time may be written.',
  world_time_profile_ref  text,
  opens_at_state          text not null default 'OPEN_BLOCKED_ON_NATIVE_CALENDAR',
  closes_at_state         text not null default 'OPEN_BLOCKED_ON_NATIVE_CALENDAR',
  earth_clock_mapping     text not null default 'PROHIBITED_UNTIL_NATIVE_CALENDAR_RESOLVED',
  state                   text not null default 'STRUCTURE_OPEN',
  source_query_id         text,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 3. COMPANIES — private and public
-- ---------------------------------------------------------------------------
create table if not exists public.thylora_world_market_companies (
  company_id              text primary key,
  business_id             uuid references public.businesses(id),
  canonical_name          text not null,
  listing_class           text not null,      -- PRIVATE | PUBLIC
  reality_layer           text not null default 'EDEREAIRAH',
  primary_venue_id        text references public.thylora_world_market_venues(venue_id),
  incorporation_state     text not null default 'OPEN',
  share_capital_state     text not null default 'OPEN_AMOUNT',
  shares_in_issue         numeric,
  shares_in_issue_state   text not null default 'OPEN_AMOUNT',
  disclosure_obligation   text not null default 'OPEN',
  regulation_code         text,
  status                  text not null default 'STRUCTURE_OPEN',
  provenance              jsonb not null default '{}'::jsonb,
  source_query_id         text,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  constraint thylora_world_market_companies_listing_chk
    check (listing_class in ('PRIVATE','PUBLIC')),
  constraint thylora_world_market_companies_shares_chk
    check (shares_in_issue_state in ('OPEN_AMOUNT','RECORDED')
           and (shares_in_issue is null or shares_in_issue_state = 'RECORDED')),
  constraint thylora_world_market_companies_public_venue_chk
    check (listing_class = 'PRIVATE' or primary_venue_id is not null)
);

-- ---------------------------------------------------------------------------
-- 4. INSTRUMENT SPINE — tighten the EXISTING table rather than replace it
--    SHARE / EQUITY, BOND / DEBT, COMMODITY, INDEX all live here.
-- ---------------------------------------------------------------------------
alter table public.thylora_world_market_instruments
  add column if not exists venue_id        text references public.thylora_world_market_venues(venue_id),
  add column if not exists company_id      text references public.thylora_world_market_companies(company_id),
  add column if not exists issue_size      numeric,
  add column if not exists issue_size_state text not null default 'OPEN_AMOUNT',
  add column if not exists coupon_rule     text,
  add column if not exists maturity_state  text not null default 'NOT_APPLICABLE',
  add column if not exists index_basis     jsonb not null default '{}'::jsonb,
  add column if not exists disclosure_code text,
  add column if not exists regulation_code text;

alter table public.thylora_world_market_instruments
  drop constraint if exists thylora_world_market_instruments_type_chk;
alter table public.thylora_world_market_instruments
  add constraint thylora_world_market_instruments_type_chk
  check (instrument_type in ('SHARE','BOND','COMMODITY','INDEX','FUND_UNIT','ESTATE_PRODUCE_CONTRACT'));

alter table public.thylora_world_market_instruments
  drop constraint if exists thylora_world_market_instruments_issue_size_chk;
alter table public.thylora_world_market_instruments
  add constraint thylora_world_market_instruments_issue_size_chk
  check (issue_size_state in ('OPEN_AMOUNT','RECORDED','NOT_APPLICABLE')
         and (issue_size is null or issue_size_state = 'RECORDED'));

-- ---------------------------------------------------------------------------
-- 5. QUOTE DISCIPLINE — no invented live prices
-- ---------------------------------------------------------------------------
alter table public.thylora_world_market_quotes
  add column if not exists venue_id     text references public.thylora_world_market_venues(venue_id),
  add column if not exists session_code text references public.thylora_world_market_sessions(session_code),
  add column if not exists price_state  text not null default 'OPEN_AMOUNT',
  add column if not exists volume       numeric,
  add column if not exists volume_state text not null default 'OPEN_AMOUNT';

alter table public.thylora_world_market_quotes
  drop constraint if exists thylora_world_market_quotes_source_chk;
alter table public.thylora_world_market_quotes
  add constraint thylora_world_market_quotes_source_chk
  check (source_type in ('TEST','SIMULATION','IN_WORLD_TRADE','CHAIRMAN_SUPPLIED','EARTH_REFERENCE'));

alter table public.thylora_world_market_quotes
  drop constraint if exists thylora_world_market_quotes_evidence_chk;
alter table public.thylora_world_market_quotes
  add constraint thylora_world_market_quotes_evidence_chk
  check (evidence_state in ('TEST','SIMULATION','EVIDENCED','UNEVIDENCED'));

-- A TEST or SIMULATION price may never be presented as evidenced, and an
-- evidenced price may never come from a TEST or SIMULATION source.
alter table public.thylora_world_market_quotes
  drop constraint if exists thylora_world_market_quotes_synthetic_chk;
alter table public.thylora_world_market_quotes
  add constraint thylora_world_market_quotes_synthetic_chk
  check (
    (source_type in ('TEST','SIMULATION')) = (evidence_state in ('TEST','SIMULATION'))
  );

alter table public.thylora_world_market_quotes
  drop constraint if exists thylora_world_market_quotes_price_state_chk;
alter table public.thylora_world_market_quotes
  add constraint thylora_world_market_quotes_price_state_chk
  check (price_state in ('OPEN_AMOUNT','RECORDED') and (price is null or price_state = 'RECORDED'));

-- ---------------------------------------------------------------------------
-- 6. OWNERSHIP
-- ---------------------------------------------------------------------------
create table if not exists public.thylora_world_market_ownership (
  ownership_code          text primary key,
  instrument_id           text references public.thylora_world_market_instruments(instrument_id),
  company_id              text references public.thylora_world_market_companies(company_id),
  holder_identity_code    text,
  holder_identity_state   text not null default 'OPEN_IDENTITY',
  holder_class            text not null,      -- PERSON | HOUSEHOLD | BUSINESS | ESTATE | TREASURY
  units_held              numeric,
  units_held_state        text not null default 'OPEN_AMOUNT',
  acquired_state          text not null default 'OPEN',
  custody_account_ref     text,
  status                  text not null default 'STRUCTURE_OPEN',
  source_query_id         text,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  constraint thylora_world_market_ownership_units_chk
    check (units_held_state in ('OPEN_AMOUNT','RECORDED') and (units_held is null or units_held_state = 'RECORDED')),
  constraint thylora_world_market_ownership_subject_chk
    check (instrument_id is not null or company_id is not null)
);

-- ---------------------------------------------------------------------------
-- 7. DIVIDENDS
-- ---------------------------------------------------------------------------
create table if not exists public.thylora_world_market_dividends (
  dividend_code           text primary key,
  instrument_id           text references public.thylora_world_market_instruments(instrument_id),
  company_id              text references public.thylora_world_market_companies(company_id),
  declaration_state       text not null default 'OPEN',
  amount_per_unit         numeric,
  amount_per_unit_state   text not null default 'OPEN_AMOUNT',
  instrument_code         text,
  record_date_state       text not null default 'OPEN_BLOCKED_ON_NATIVE_CALENDAR',
  payment_date_state      text not null default 'OPEN_BLOCKED_ON_NATIVE_CALENDAR',
  authority_reference     text,
  status                  text not null default 'STRUCTURE_OPEN',
  source_query_id         text,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  constraint thylora_world_market_dividends_amount_chk
    check (amount_per_unit_state in ('OPEN_AMOUNT','RECORDED')
           and (amount_per_unit is null or amount_per_unit_state = 'RECORDED'))
);

-- ---------------------------------------------------------------------------
-- 8. DISCLOSURE
-- ---------------------------------------------------------------------------
create table if not exists public.thylora_world_market_disclosures (
  disclosure_code         text primary key,
  company_id              text references public.thylora_world_market_companies(company_id),
  instrument_id           text references public.thylora_world_market_instruments(instrument_id),
  disclosure_class        text not null,      -- PERIODIC_RESULT | OWNERSHIP_CHANGE | MATERIAL_EVENT | PROSPECTUS | AUDIT
  required_by_regulation  text,
  content_state           text not null default 'NOT_YET_FILED',
  published_state         text not null default 'NOT_PUBLISHED',
  evidence                jsonb not null default '{}'::jsonb,
  status                  text not null default 'STRUCTURE_OPEN',
  source_query_id         text,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 9. REGULATION
-- ---------------------------------------------------------------------------
create table if not exists public.thylora_world_market_regulations (
  regulation_code         text primary key,
  canonical_name          text not null,
  reality_layer           text not null default 'EDEREAIRAH',
  regulator_identity_state text not null default 'OPEN_IDENTITY',
  scope                   text not null,
  rule_text               text not null,
  enforcement_state       text not null default 'OPEN',
  earth_regulator_claim   boolean not null default false,
  status                  text not null default 'STRUCTURE_OPEN',
  source_query_id         text,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  constraint thylora_world_market_regulations_earth_chk check (earth_regulator_claim = false)
);
