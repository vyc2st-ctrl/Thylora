-- WR-OPP-COLLAB-675 · L02 · Rail-independent order custody.
-- HELD: production DDL is a Chairman action. Validated locally only (validation/run.sh).
-- Implements PROPOSED MATH-ORDER-CUSTODY-675:
--   O_paid = U × G × W_p ;  O_done = O_paid × F × Rf
--   A rail is INTEGRATED only after one witnessed payment on that rail.
-- Any channel (QR, link, DM, email, post, correspondent) creates the same order.

create table if not exists thylora_offer_orders (
  offer_code            text primary key check (offer_code ~ '^OFR-[0-9]{3}-[A-Z0-9-]+$'),
  lane_code             text not null,                       -- e.g. L01
  source_channel        text not null check (source_channel in ('QR','LINK','DM','EMAIL','POST','CORRESPONDENT','STOREFRONT')),
  source_ref            text,                                -- QR id, message id, post URL
  terms_snapshot        text not null,
  terms_sha256          text not null check (terms_sha256 ~ '^[0-9a-f]{64}$'),
  price_minor           integer not null check (price_minor >= 0),
  currency              text not null default 'USD',
  state                 text not null default 'OFFERED' check (state in
                        ('OFFERED','ACCEPTED','PAYMENT_CLAIMED','PAYMENT_WITNESSED','FULFILLED',
                         'CLOSED','REFUND_REQUESTED','REFUNDED','CORRECTED','EXPIRED')),
  buyer_contact         text,                                -- minimum needed for delivery only
  accepted_at           timestamptz,
  accepted_method       text,
  accepted_text_sha256  text,
  rail                  text check (rail in ('SHOPIFY_PAYMENTS','STRIPE','CASH_APP_PAY','INVOICE','OTHER')),
  rail_transaction_id   text,                                -- read from the rail, never typed
  paid_amount_minor     integer,
  payment_witnessed_at  timestamptz,
  payment_witness_source text,                               -- e.g. 'stripe api read', 'shopify order.transactions'
  fulfillment_ref       text,
  fulfilled_at          timestamptz,
  refund_ref            text,
  refunded_at           timestamptz,
  correction_version    integer not null default 0,
  tax_jurisdiction      text,                                -- OPEN until accountant review
  tax_collected_minor   integer,
  retention_until       date,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  -- U × G: an accepted order carries its acceptance evidence
  constraint g_acceptance check (state = 'OFFERED' or state = 'EXPIRED'
         or (accepted_at is not null and accepted_method is not null and accepted_text_sha256 ~ '^[0-9a-f]{64}$')),
  -- W_p: paid states need a rail-read witness that matches the price
  constraint w_payment check (state not in ('PAYMENT_WITNESSED','FULFILLED','CLOSED','REFUND_REQUESTED','REFUNDED','CORRECTED')
         or (rail is not null and rail_transaction_id is not null and payment_witnessed_at is not null
             and payment_witness_source is not null and paid_amount_minor = price_minor)),
  -- F: fulfilled/closed need a delivery record
  constraint f_fulfillment check (state not in ('FULFILLED','CLOSED') or (fulfillment_ref is not null and fulfilled_at is not null)),
  -- Rf: refunded needs a rail-read refund reference
  constraint rf_refund check (state <> 'REFUNDED' or (refund_ref is not null and refunded_at is not null))
);

-- A rail counts as integrated only after it has witnessed at least one payment.
create or replace view thylora_rail_integration_v1 as
select r.rail,
       count(o.offer_code) filter (where o.payment_witnessed_at is not null) as witnessed_payments,
       case when count(o.offer_code) filter (where o.payment_witnessed_at is not null) > 0
            then 'INTEGRATED_WITNESSED' else 'NOT_WITNESSED' end as status
from (values ('SHOPIFY_PAYMENTS'),('STRIPE'),('CASH_APP_PAY'),('INVOICE'),('OTHER')) r(rail)
left join thylora_offer_orders o on o.rail = r.rail
group by r.rail;

alter table thylora_offer_orders enable row level security;
