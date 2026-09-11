-- RAE LINK · 0006 · Subscriptions, purchases, entitlements, store linking
-- Workroom: WR-RAELINK-001
--
-- RULE: a viewer keeps re-access to what they paid for, and a creator keeps
-- re-access to their own content and records. Ending a subscription ends future
-- access to subscription-only material; it never deletes a purchased
-- entitlement and never erases a creator's own archive.

begin;

create table if not exists rael_subscription_plans (
  id                 uuid primary key default gen_random_uuid(),
  plan_code          text not null unique,
  plan_kind          text not null check (plan_kind in ('PLATFORM','CHANNEL')),
  channel_id         uuid references rael_channels(id) on delete cascade,
  display_name       text not null,
  price_minor        bigint not null check (price_minor >= 0),
  currency           text not null default 'USD' check (currency ~ '^[A-Z]{3}$'),
  billing_interval   text not null default 'MONTH' check (billing_interval in ('MONTH','YEAR')),
  benefits           text[] not null default '{}',
  processor          text,
  processor_plan_ref text,
  plan_state         text not null default 'DRAFT'
                     check (plan_state in ('DRAFT','ACTIVE','CLOSED')),
  created_at         timestamptz not null default now(),
  constraint rael_plan_channel_scope
    check ((plan_kind = 'CHANNEL' and channel_id is not null)
        or (plan_kind = 'PLATFORM' and channel_id is null))
);

create table if not exists rael_subscriptions (
  id                 uuid primary key default gen_random_uuid(),
  plan_id            uuid not null references rael_subscription_plans(id) on delete restrict,
  subscriber_user_id uuid not null references auth.users(id) on delete cascade,
  started_at         timestamptz not null default now(),
  current_period_end timestamptz,
  cancelled_at       timestamptz,
  ended_at           timestamptz,
  subscription_state text not null default 'ACTIVE'
                     check (subscription_state in ('TRIAL','ACTIVE','PAST_DUE','CANCELLED','ENDED')),
  processor          text,
  processor_reference text,
  created_at         timestamptz not null default now()
);

create index if not exists rael_subscriptions_user_idx
  on rael_subscriptions(subscriber_user_id, subscription_state);

create table if not exists rael_purchases (
  id                 uuid primary key default gen_random_uuid(),
  purchase_code      text not null unique,
  buyer_user_id      uuid not null references auth.users(id) on delete restrict,
  asset_id           uuid references rael_media_assets(id) on delete set null,
  -- Soft links to the existing THYLORA store, EDF and passport registries.
  product_ref        text,
  passport_ref       text,
  external_order_ref text,
  price_minor        bigint not null check (price_minor >= 0),
  currency           text not null default 'USD' check (currency ~ '^[A-Z]{3}$'),
  processor          text,
  processor_reference text,
  revenue_event_id   uuid references rael_revenue_events(id) on delete set null,
  purchase_state     text not null default 'PENDING'
                     check (purchase_state in ('PENDING','CONFIRMED','REFUNDED','CHARGEBACK','VOID')),
  purchased_at       timestamptz not null default now()
);

-- The durable re-access record. Entitlements survive subscription cancellation
-- when their grant basis was a purchase.
create table if not exists rael_entitlements (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  asset_id         uuid references rael_media_assets(id) on delete cascade,
  channel_id       uuid references rael_channels(id) on delete cascade,
  product_ref      text,
  grant_basis      text not null check (grant_basis in
                     ('PURCHASE','SUBSCRIPTION','CREATOR_OWNERSHIP','GIFT','PARTNERSHIP','CHAIRMAN_GRANT')),
  purchase_id      uuid references rael_purchases(id) on delete set null,
  subscription_id  uuid references rael_subscriptions(id) on delete set null,
  is_perpetual     boolean not null default false,
  granted_at       timestamptz not null default now(),
  expires_at       timestamptz,
  revoked_at       timestamptz,
  revocation_reason text,
  constraint rael_entitlement_target
    check (asset_id is not null or channel_id is not null or product_ref is not null),
  -- A purchase-based or ownership-based entitlement is perpetual and cannot be
  -- given an expiry at grant time.
  constraint rael_entitlement_purchase_perpetual
    check (grant_basis not in ('PURCHASE','CREATOR_OWNERSHIP') or (is_perpetual = true and expires_at is null))
);

create index if not exists rael_entitlements_user_idx on rael_entitlements(user_id)
  where revoked_at is null;

create table if not exists rael_asset_products (
  asset_id    uuid not null references rael_media_assets(id) on delete cascade,
  product_ref text not null,
  link_kind   text not null default 'LINKED_PRODUCT'
              check (link_kind in ('LINKED_PRODUCT','PAID_UNLOCK','BUNDLE','MERCH','EDF_EDITION')),
  passport_ref text,
  disclosure   text,
  created_at  timestamptz not null default now(),
  primary key (asset_id, product_ref)
);

commit;
