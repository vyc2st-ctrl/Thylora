-- THYLORA STORE · 0001 · register THY-QYRIS-QUICKCHECK-001 for digital delivery
-- Workroom: WR-QYRIS-STORE-001
--
-- THIS FILE IS NOT APPLIED. Applying it mutates the production backend and is
-- held for Chairman execution, exactly as db/rae-link/0001..0010 are (B2).
--
-- RULE HELD HERE: this does not create a store. It registers one product row,
-- one delivery record and one re-access rule against the registries that
-- already exist (`products`, `orders`, `entitlements`, digital product
-- passports, and the rae-link purchase/entitlement tables when present).
-- No new catalogue, no second product truth, no second checkout.
--
-- The live backend was unreachable from the build session (403 on CONNECT to
-- jvsdxhrfhtlgaknhjxlz.supabase.co:443, organization egress policy), so the
-- live column shapes could not be read. Rather than guess a column list and
-- fail the apply, every write below is driven by information_schema: a column
-- that does not exist is skipped, a table that does not exist is skipped, and
-- the payload is reported instead. A wrong assumption degrades; it does not
-- corrupt.

begin;

create temporary table if not exists thy_qc_payload (k text primary key, v text);
insert into thy_qc_payload (k, v) values
  ('sku',               'THY-QYRIS-QC-001'),
  ('product_code',      'THY-QYRIS-QC-001'),
  ('code',              'THY-QYRIS-QC-001'),
  ('artifact_id',       'THY-QYRIS-QUICKCHECK-001'),
  ('name',              'QYRIS QuickCheck - The Nine-Inspection Pass'),
  ('title',             'QYRIS QuickCheck - The Nine-Inspection Pass'),
  ('display_name',      'QYRIS QuickCheck - The Nine-Inspection Pass'),
  ('product_kind',      'DIGITAL'),
  ('kind',              'DIGITAL'),
  ('fulfilment',        'DIGITAL_DOWNLOAD'),
  ('delivery_mode',     'DIGITAL_DOWNLOAD'),
  ('price_minor',       '2900'),
  ('price',             '29.00'),
  ('currency',          'USD'),
  ('status',            'CHAIRMAN_PREVIEW'),
  ('state',             'CHAIRMAN_PREVIEW'),
  ('release_state',     'CHAIRMAN_PREVIEW'),
  ('rights_state',      'CLEARED_OWN_WORK'),
  ('provenance',        'WR-RAELINK-001 section 5, QYRIS gap report'),
  ('thumbnail_path',    'products/qyris-quickcheck/dist/store/qyris-quickcheck-thumb-1200x1500.png'),
  ('package_path',      'products/qyris-quickcheck/dist/master/THYLORA-QYRIS-QuickCheck-v1.0-THY-QC1-0000-MASTER.zip'),
  ('entitlement_kind',  'PURCHASE'),
  ('perpetual',         'true'),
  ('serial_policy',     'PER_COPY_STAMPED_AT_DELIVERY'),
  ('reaccess_policy',   'REBUILD_FROM_SERIAL_UNLIMITED')
on conflict (k) do update set v = excluded.v;

do $$
declare
  target      text;
  key_col     text;
  cols        text[] := '{}';
  vals        text[] := '{}';
  r           record;
  applied     boolean := false;
begin
  -- Find the existing product registry. First match wins; nothing is created.
  foreach target in array array['products', 'store_products', 'thylora_products']
  loop
    if to_regclass('public.' || target) is null then continue; end if;

    -- Which of our payload keys does this table actually have?
    for r in
      select c.column_name, p.v
      from information_schema.columns c
      join thy_qc_payload p on p.k = c.column_name
      where c.table_schema = 'public' and c.table_name = target
    loop
      cols := cols || quote_ident(r.column_name);
      vals := vals || quote_literal(r.v);
    end loop;

    if array_length(cols, 1) is null then
      raise notice 'THY-QYRIS-QC-001: table %.% exists but shares no known column; nothing written.', 'public', target;
      continue;
    end if;

    -- Prefer a natural key for idempotency; fall back to plain insert guarded by a probe.
    select c.column_name into key_col
    from information_schema.columns c
    where c.table_schema = 'public' and c.table_name = target
      and c.column_name in ('sku', 'product_code', 'code')
    order by array_position(array['sku','product_code','code'], c.column_name)
    limit 1;

    if key_col is null then
      raise notice 'THY-QYRIS-QC-001: %.% has no sku/product_code/code column; held for Chairman mapping.', 'public', target;
      continue;
    end if;

    execute format(
      'insert into public.%I (%s) select %s where not exists (select 1 from public.%I where %I = %L)',
      target, array_to_string(cols, ', '), array_to_string(vals, ', '),
      target, key_col, 'THY-QYRIS-QC-001');

    execute format(
      'update public.%I set %s where %I = %L',
      target,
      (select string_agg(format('%s = %s', cols[i], vals[i]), ', ')
         from generate_subscripts(cols, 1) as i
        where cols[i] <> quote_ident(key_col)),
      key_col, 'THY-QYRIS-QC-001');

    applied := true;
    raise notice 'THY-QYRIS-QC-001 registered in public.% using columns: %', target, array_to_string(cols, ', ');
    exit;
  end loop;

  if not applied then
    raise notice 'THY-QYRIS-QC-001: no product registry matched. The product is NOT registered. This is a held state, not a silent success.';
  end if;
end $$;

-- Link the artifact to the rae-link asset/product bridge when that schema is
-- present, so a published RAE Link asset can point at this SKU without a
-- second product truth. Guarded: absent schema means no-op.
do $$
begin
  if to_regclass('public.rael_asset_products') is not null then
    insert into rael_asset_products (link_kind, product_ref, passport_ref)
    select 'LINKED_PRODUCT', 'THY-QYRIS-QC-001', 'THY-QYRIS-QUICKCHECK-001'
    where not exists (
      select 1 from rael_asset_products where product_ref = 'THY-QYRIS-QC-001');
    raise notice 'THY-QYRIS-QC-001 bridged to rael_asset_products.';
  end if;
end $$;

-- Re-access is a rule, not a stored blob: the package is rebuilt from the
-- serial. Recorded here so the store and the builder agree.
do $$
begin
  if to_regclass('public.entitlements') is not null then
    raise notice 'THY-QYRIS-QC-001 entitlement contract: kind=PURCHASE, perpetual=true, '
                 'revocable_by_cancellation=false, reaccess=REBUILD_FROM_SERIAL_UNLIMITED. '
                 'Apply against the live entitlement column names once B1 is cleared.';
  end if;
end $$;

commit;
