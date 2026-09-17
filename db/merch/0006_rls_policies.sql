-- THYLORA merchandise lane · 0006 · row level security
-- ADDITIVE ONLY. Not applied by this repository.
--
-- Follows the pattern already in use on merchandise_program and
-- thylora_brand_asset_slots: thylora_is_chairman() governs the lane.
-- Reading merchandise design state is not public.

begin;

do $$
declare t text;
begin
  foreach t in array array[
    'merch_artwork_lock','merch_product_family','merch_product_class',
    'merch_cup_side_map','merch_phrase_registry','merch_scene_registry',
    'merch_serial_rule','merch_run','merch_rights_record','merch_provenance_event',
    'merch_sku','merch_serial','merch_approval_gate','merch_gate_check',
    'merch_make_order'
  ]
  loop
    if to_regclass('public.'||t) is not null then
      execute format('alter table public.%I enable row level security', t);
      execute format('alter table public.%I force row level security', t);
      execute format('drop policy if exists %I on public.%I', t||'_chairman_all', t);
      execute format(
        'create policy %I on public.%I for all using (thylora_is_chairman()) with check (thylora_is_chairman())',
        t||'_chairman_all', t);
      execute format('revoke all on public.%I from anon', t);
    end if;
  end loop;
end $$;

commit;
