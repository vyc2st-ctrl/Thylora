-- Validation scaffolding ONLY. Never applied to a real backend, where these
-- objects already exist. It stands in for the parts of thylora-dash the
-- merchandise migrations touch: the chairman predicate, the roles, and the
-- registry tables 0010 links to.
create extension if not exists pgcrypto;
create schema if not exists auth;
create or replace function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;
do $$ begin create role anon; exception when duplicate_object then null; end $$;
do $$ begin create role authenticated; exception when duplicate_object then null; end $$;

create table if not exists thylora_user_roles (user_id uuid, role text);
create or replace function thylora_is_chairman() returns boolean language sql stable as $$
  select exists (select 1 from thylora_user_roles r where r.user_id = auth.uid() and r.role = 'chairman');
$$;

-- Registry tables 0010_registry_link.sql joins against, with the columns and
-- the values read out of thylora-dash on 2026-09-17.
create table if not exists thylora_brand_asset_slots (
  slot_code text primary key, slot_group text, label text, truth_class text,
  value_text text, reference_ref text, approval_state text, source_record text,
  notes text, sort_order integer
);
insert into thylora_brand_asset_slots (slot_code, approval_state, value_text) values
  ('BRAND-ERNEWS-MASTHEAD','CHAIRMAN_APPROVED','ErsatzReality News'),
  ('BRAND-ER-MARK-GLASS-HAT','CHAIRMAN_APPROVED','Approved ErsatzReality magnifying-glass-and-hat mark, used as a recurring discoverable brand element when composition permits.'),
  ('BRAND-THYLORA-MARK','NOT_APPROVED',null),
  ('BRAND-QR-DESTINATIONS','NOT_APPROVED',null),
  ('BRAND-PRESENTER-NEYRA-SOL','CHAIRMAN_APPROVED_NAME','Neyra Sol'),
  ('BRAND-FONT-FAMILY','CHAIRMAN_VISUAL_REFERENCE_LOCKED',null),
  ('BRAND-EDITORIAL-TONE','CHAIRMAN_APPROVED','Technical, evidence-led, question-driven. Generic inspirational or cliche copy is prohibited.')
on conflict (slot_code) do nothing;

create table if not exists merchandise_program (
  merch_code text primary key, product_class text, earth_supplier_state text,
  chairman_price_state text, serial_required boolean, vlegh_required boolean,
  creator_credit_required boolean, state text
);
insert into merchandise_program values
  ('MERCH-MUG-001','MUG','UNSELECTED','AUTHORITY_REQUIRED',true,true,true,'DESIGN_ACTIVE'),
  ('MERCH-CUP-001','CARRY_CUP','UNSELECTED','AUTHORITY_REQUIRED',true,true,true,'DESIGN_ACTIVE'),
  ('MERCH-SHIRT-001','SHIRT','UNSELECTED','AUTHORITY_REQUIRED',true,true,true,'DESIGN_ACTIVE'),
  ('MERCH-HAT-001','HAT','UNSELECTED','AUTHORITY_REQUIRED',true,true,true,'DESIGN_ACTIVE')
on conflict (merch_code) do nothing;

create table if not exists thylora_jewelry_watch_registry (
  design_code text primary key, category text, earth_reference_rule text,
  realization_state text, commerce_state text
);
insert into thylora_jewelry_watch_registry values
  ('JEWEL-WATCH-HOUSE-001','WATCH / JEWELRY HOUSE','Earth watches are inspiration and research references only.','DESIGN','NOT_LIVE'),
  ('ORAH-BRACELET-001','SYSTEM BRACELET / EMPLOYEE RECOGNITION','Earth jewelry may be used only as proportion/finishing reference.','DESIGN_ACTIVE','NOT_LIVE')
on conflict (design_code) do nothing;

create table if not exists thylora_store_product_readiness (
  readiness_id uuid primary key default gen_random_uuid(),
  external_product_id text, product_title text, product_state text, active_allowed boolean
);
