-- THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533
-- RLS for every table added by this work code, following the existing convention:
-- RLS enabled, authenticated SELECT gated by thylora_is_chairman(); writes go through
-- migrations / service role only.

do $$
declare
  t text;
  tables text[] := array[
    'thylora_estate_tenancies','thylora_estate_resident_households','thylora_estate_land_units',
    'thylora_estate_animal_groups','thylora_estate_provision_orders','thylora_estate_receiving_records',
    'thylora_estate_inspections','thylora_estate_incidents','thylora_estate_work_orders',
    'thylora_estate_accounts','thylora_estate_ledger_entries',
    'thylora_security_zones','thylora_security_posts','thylora_security_rotations','thylora_security_signals',
    'thylora_kitchen_posts','thylora_kitchen_shift_segments','thylora_kitchen_stores',
    'thylora_kitchen_meal_plans','thylora_kitchen_waste_routes','thylora_kitchen_suppliers',
    'thylora_kitchen_equipment',
    'thylora_bank_account_types','thylora_bank_credit_facilities','thylora_bank_rate_schedules',
    'thylora_bank_statements','thylora_bank_security_events',
    'thylora_business_purchase_orders','thylora_business_invoices','thylora_business_settlements',
    'thylora_business_insurance','thylora_business_tax_ledger','thylora_business_assets',
    'thylora_business_equity','thylora_business_period_results',
    'thylora_world_market_venues','thylora_world_market_sessions','thylora_world_market_companies',
    'thylora_world_market_ownership','thylora_world_market_dividends','thylora_world_market_disclosures',
    'thylora_world_market_regulations'
  ];
begin
  foreach t in array tables loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists %I on public.%I', 'chairman_read_' || t, t);
    execute format(
      'create policy %I on public.%I for select to authenticated using (public.thylora_is_chairman())',
      'chairman_read_' || t, t);
  end loop;
end $$;

-- The staffing view must not leak past the underlying tables' RLS.
alter view public.thylora_security_staffing_requirement_v1 set (security_invoker = true);
