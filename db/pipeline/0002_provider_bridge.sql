-- Provider readback bridge for the product conveyor.
--
-- Why this exists: the first conveyor pass reported `price_configured` as the
-- blocker on eight near-money products. Readback against the live store showed
-- every one already carried a real price and SKU. The gate was hardcoded false
-- because nothing joined the conveyor to the store provider, so absence of
-- evidence was being reported as absence of the fact. These tables close that
-- gap. Rows are written only from a live provider read.

create table if not exists thylora_conveyor_provider_readback (
  external_product_id text primary key,
  provider            text not null,
  product_title       text,
  listing_status      text,
  sku                 text,
  price               numeric,
  currency            text,
  has_featured_media  boolean not null default false,
  inventory_quantity  integer,
  readback_at         timestamptz not null default now(),
  readback_method     text not null,
  evidence            jsonb not null default '{}'::jsonb
);
alter table thylora_conveyor_provider_readback enable row level security;

-- Money evidence, kept separate from listing evidence so that a paid order is
-- never confused with a genuine external customer purchase.
create table if not exists thylora_conveyor_order_evidence (
  provider_order_id      text primary key,
  provider               text not null,
  order_name             text,
  ordered_at             timestamptz,
  customer_name          text,
  total_amount           numeric,
  currency               text,
  financial_status       text,
  fulfillment_status     text,
  is_external_customer   boolean not null default false,
  external_customer_note text,
  readback_at            timestamptz not null default now()
);
alter table thylora_conveyor_order_evidence enable row level security;

-- Unit economics. rate_confirmed stays false until the processor rate is read
-- back from the store account's own payment settings; the arithmetic is exact
-- either way, but the rate input is an assumption until then.
create table if not exists thylora_conveyor_unit_cost (
  external_product_id  text primary key,
  price                numeric not null,
  currency             text not null default 'USD',
  processor_rate_pct   numeric not null,
  processor_fixed_fee  numeric not null,
  processor_fee_total  numeric generated always as
                         (round(price * processor_rate_pct / 100.0 + processor_fixed_fee, 4)) stored,
  delivery_unit_cost   numeric not null default 0,
  net_per_unit         numeric generated always as
                         (round(price - (price * processor_rate_pct / 100.0 + processor_fixed_fee), 4)) stored,
  gross_margin_pct     numeric generated always as
                         (round(100.0 * (price - (price * processor_rate_pct / 100.0 + processor_fixed_fee)) / nullif(price,0), 2)) stored,
  rate_provenance      text not null,
  rate_confirmed       boolean not null default false,
  fixed_monthly_cost   numeric,
  notes                text,
  recorded_at          timestamptz not null default now()
);
alter table thylora_conveyor_unit_cost enable row level security;

-- thylora_conveyor_candidates is then redefined so its store-tracked branch
-- reads store_listing_exists / listing_active / price_configured from
-- thylora_conveyor_provider_readback, cost_recorded from
-- thylora_conveyor_unit_cost, and external_purchase_witnessed only from an
-- order that is PAID, non-zero, and flagged is_external_customer.
