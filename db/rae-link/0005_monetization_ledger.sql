-- RAE LINK · 0005 · Revenue lanes, split policy, ledger, payouts
-- Workroom: WR-RAELINK-001
--
-- RULE: no opaque "net proceeds". Every revenue event carries, and every
-- statement exposes: gross revenue, processor fees, refunds, chargebacks, tax
-- state, platform share, creator/beneficiary share, net payable, payment date
-- and payment evidence. Money is stored as integer minor units (cents) with an
-- explicit currency. No floating point money anywhere in this schema.

begin;

do $$ begin
  create type rael_tax_state as enum (
    'NOT_APPLICABLE',
    'PLATFORM_REMITTED',
    'CREATOR_RESPONSIBLE',
    'UNRESOLVED'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type rael_party_kind as enum ('PLATFORM','CREATOR','BENEFICIARY','PARTNER','REFERRER');
exception when duplicate_object then null; end $$;

-- Lane catalogue. Adding a lane is data, not a schema change.
create table if not exists rael_revenue_lanes (
  lane_code                text primary key,
  display_name             text not null,
  description              text,
  default_platform_share_bp integer not null check (default_platform_share_bp between 0 and 10000),
  is_pooled                boolean not null default false,
  requires_beneficiary     boolean not null default false,
  requires_disclosure      boolean not null default false,
  lane_state               text not null default 'ACTIVE'
                           check (lane_state in ('DRAFT','ACTIVE','SUSPENDED','RETIRED'))
);

insert into rael_revenue_lanes
  (lane_code, display_name, default_platform_share_bp, is_pooled, requires_beneficiary, requires_disclosure, description)
values
  ('ADVERTISING',          'Advertising and sponsorship', 4500, true,  false, true,
   'Pooled advertising and sponsorship revenue allocated by eligible watch time.'),
  ('PLATFORM_SUBSCRIPTION','RAE Link subscription',       4500, true,  false, false,
   'Pooled subscription revenue allocated by eligible watch time across subscribed viewers.'),
  ('CREATOR_SUBSCRIPTION', 'Creator subscription',        1500, false, false, false,
   'Direct viewer subscription to one channel.'),
  ('TIP',                  'Tips and support',            1000, false, false, false,
   'One-time viewer support with no promised deliverable.'),
  ('ONE_TIME_MEDIA',       'Paid media purchase',         2000, false, false, false,
   'Single purchase of one media item with continuing re-access.'),
  ('EDF_PRODUCT',          'EDF and product sale',        2000, false, false, false,
   'Sale of an EDF or linked store product with a digital product passport.'),
  ('LICENSING',            'Licensing',                   2500, false, false, true,
   'Third-party licensed use of creator media under recorded terms.'),
  ('COMMISSION',           'Commissioned production',     3000, false, false, true,
   'Commissioned work produced for a named client.'),
  ('AFFILIATE',            'Affiliate and referral',      5000, false, false, true,
   'Referral revenue. Disclosure to the viewer is mandatory before the link is shown.'),
  ('FAMILY_PARTNERSHIP',   'Family Story Partnership',    1000, false, true,  true,
   'GiveForward Studio lane. Beneficiary share is explicit and declared before publication.')
on conflict (lane_code) do nothing;

-- A split policy must total exactly 100%. It is versioned by effective window so
-- a historical payout can always be re-derived from the policy that applied then.
create table if not exists rael_split_policies (
  id                        uuid primary key default gen_random_uuid(),
  policy_code               text not null unique,
  scope_kind                text not null check (scope_kind in ('LANE','CHANNEL','ASSET','PARTNERSHIP')),
  scope_ref                 text not null,
  lane_code                 text references rael_revenue_lanes(lane_code),
  platform_share_bp         integer not null check (platform_share_bp between 0 and 10000),
  creator_share_bp          integer not null check (creator_share_bp between 0 and 10000),
  beneficiary_share_bp      integer not null default 0 check (beneficiary_share_bp between 0 and 10000),
  partner_share_bp          integer not null default 0 check (partner_share_bp between 0 and 10000),
  beneficiary_ref           text,
  declared_at               timestamptz not null default now(),
  declared_before_publication boolean not null default false,
  effective_from            timestamptz not null default now(),
  effective_to              timestamptz,
  evidence                  jsonb not null default '{}'::jsonb,
  policy_state              text not null default 'ACTIVE'
                            check (policy_state in ('DRAFT','ACTIVE','SUPERSEDED','VOID')),
  constraint rael_split_totals_100
    check (platform_share_bp + creator_share_bp + beneficiary_share_bp + partner_share_bp = 10000),
  constraint rael_split_beneficiary_named
    check (beneficiary_share_bp = 0 or beneficiary_ref is not null)
);

create index if not exists rael_split_scope_idx on rael_split_policies(scope_kind, scope_ref, effective_from desc);

create table if not exists rael_revenue_events (
  id                   uuid primary key default gen_random_uuid(),
  event_code           text not null unique,
  lane_code            text not null references rael_revenue_lanes(lane_code),
  channel_id           uuid references rael_channels(id) on delete set null,
  asset_id             uuid references rael_media_assets(id) on delete set null,
  currency             text not null default 'USD' check (currency ~ '^[A-Z]{3}$'),
  gross_minor          bigint not null check (gross_minor >= 0),
  processor_fee_minor  bigint not null default 0 check (processor_fee_minor >= 0),
  refund_minor         bigint not null default 0 check (refund_minor >= 0),
  chargeback_minor     bigint not null default 0 check (chargeback_minor >= 0),
  tax_state            rael_tax_state not null default 'UNRESOLVED',
  tax_minor            bigint not null default 0 check (tax_minor >= 0),
  tax_remitted_by      text check (tax_remitted_by in ('PLATFORM','CREATOR','PROCESSOR','NONE')),
  processor            text,
  processor_reference  text,
  external_order_ref   text,
  occurred_at          timestamptz not null default now(),
  settled_at           timestamptz,
  event_state          text not null default 'RECORDED'
                       check (event_state in ('RECORDED','SETTLED','REVERSED','HELD','VOID')),
  source_evidence      jsonb not null default '{}'::jsonb,
  created_at           timestamptz not null default now(),
  -- Deductions can never exceed what came in.
  constraint rael_revenue_deductions_bounded
    check (processor_fee_minor + refund_minor + chargeback_minor + tax_minor <= gross_minor)
);

create index if not exists rael_revenue_channel_idx on rael_revenue_events(channel_id, occurred_at desc);
create index if not exists rael_revenue_lane_idx on rael_revenue_events(lane_code, occurred_at desc);

-- One row per party per revenue event. Sum of amount_minor for an event equals
-- the distributable base exactly; rounding remainder is assigned, never dropped.
create table if not exists rael_ledger_entries (
  id                uuid primary key default gen_random_uuid(),
  revenue_event_id  uuid not null references rael_revenue_events(id) on delete cascade,
  split_policy_id   uuid references rael_split_policies(id),
  party_kind        rael_party_kind not null,
  party_ref         text not null,
  currency          text not null default 'USD' check (currency ~ '^[A-Z]{3}$'),
  base_minor        bigint not null check (base_minor >= 0),
  share_bp          integer not null check (share_bp between 0 and 10000),
  amount_minor      bigint not null check (amount_minor >= 0),
  rounding_minor    bigint not null default 0,
  entry_state       text not null default 'PENDING'
                    check (entry_state in ('PENDING','PAYABLE','HELD','PAID','REVERSED')),
  hold_reason       text,
  created_at        timestamptz not null default now(),
  unique (revenue_event_id, party_kind, party_ref)
);

create index if not exists rael_ledger_party_idx on rael_ledger_entries(party_kind, party_ref, entry_state);

create table if not exists rael_payouts (
  id                  uuid primary key default gen_random_uuid(),
  payout_code         text not null unique,
  party_kind          rael_party_kind not null,
  party_ref           text not null,
  currency            text not null default 'USD' check (currency ~ '^[A-Z]{3}$'),
  period_start        date not null,
  period_end          date not null,
  gross_minor         bigint not null default 0,
  processor_fee_minor bigint not null default 0,
  refund_minor        bigint not null default 0,
  chargeback_minor    bigint not null default 0,
  tax_minor           bigint not null default 0,
  platform_share_minor bigint not null default 0,
  party_share_minor   bigint not null default 0,
  adjustment_minor    bigint not null default 0,
  net_payable_minor   bigint not null default 0,
  payout_state        text not null default 'PENDING_EVIDENCE'
                      check (payout_state in
                        ('PENDING_EVIDENCE','HELD_TAX_UNRESOLVED','HELD_IDENTITY','HELD_RIGHTS',
                         'HELD_BELOW_MINIMUM','PAYABLE','SENT','PAID','FAILED','REVERSED')),
  hold_reason         text,
  payment_date        date,
  payment_processor   text,
  payment_reference   text,
  payment_evidence    jsonb not null default '{}'::jsonb,
  created_at          timestamptz not null default now(),
  constraint rael_payout_period_order check (period_end >= period_start),
  -- A payout is never marked PAID without a date, a reference and evidence.
  constraint rael_payout_paid_needs_evidence check (
    payout_state <> 'PAID' or (
      payment_date is not null
      and payment_reference is not null
      and payment_evidence <> '{}'::jsonb
    )
  )
);

create index if not exists rael_payouts_party_idx on rael_payouts(party_kind, party_ref, period_end desc);

create table if not exists rael_payout_lines (
  payout_id       uuid not null references rael_payouts(id) on delete cascade,
  ledger_entry_id uuid not null references rael_ledger_entries(id) on delete restrict,
  amount_minor    bigint not null,
  primary key (payout_id, ledger_entry_id)
);

-- Adjustments are visible, reasoned and attributable. They are never folded
-- silently into a net figure.
create table if not exists rael_adjustments (
  id            uuid primary key default gen_random_uuid(),
  payout_id     uuid references rael_payouts(id) on delete set null,
  party_kind    rael_party_kind not null,
  party_ref     text not null,
  amount_minor  bigint not null,
  reason_code   text not null,
  reason_note   text not null,
  applied_by    uuid references auth.users(id),
  evidence      jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now()
);

commit;
