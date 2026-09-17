-- THYLORA merchandise lane · 0010 · guarded links into existing registries
-- ADDITIVE ONLY. Not applied by this repository.
--
-- This lane is not a second source of truth. Merchandise programmes, jewellery
-- designs, brand slots, serial policy, shelves and store readiness stay where
-- they already live. Links are soft text references resolved through views that
-- exist only when the target table exists.

begin;

-- Artwork locks beside the brand slots they were read from.
do $$
begin
  if to_regclass('public.thylora_brand_asset_slots') is not null then
    execute $v$
      create or replace view merch_artwork_lock_source_v as
      select l.lock_code, l.label, l.approval_state as merch_lock_state,
             l.merch_use_state, l.open_question,
             b.slot_code, b.approval_state as brand_slot_state,
             b.value_text as brand_slot_value,
             (l.value_text is distinct from b.value_text) as value_drifted
      from merch_artwork_lock l
      left join thylora_brand_asset_slots b
        on l.source_record like 'thylora_brand_asset_slots.'||b.slot_code||'%'
    $v$;
  end if;
end $$;

comment on view merch_artwork_lock_source_v is
  'Drift detector. value_drifted true means a merchandise lock no longer matches the brand slot it was taken from; treat it as a G1 failure until reconciled.';

-- Product classes beside their merchandise_program rows.
do $$
begin
  if to_regclass('public.merchandise_program') is not null then
    execute $v$
      create or replace view merch_class_program_v as
      select c.class_code, c.class_name, c.supplier_state as lane_supplier_state,
             c.price_state as lane_price_state,
             m.merch_code, m.product_class, m.earth_supplier_state,
             m.chairman_price_state, m.serial_required, m.vlegh_required,
             m.creator_credit_required, m.state as program_state
      from merch_product_class c
      left join merchandise_program m on m.merch_code = c.merchandise_program_ref
    $v$;
  end if;
end $$;

-- Jewellery classes beside the jewellery registry.
do $$
begin
  if to_regclass('public.thylora_jewelry_watch_registry') is not null then
    execute $v$
      create or replace view merch_jewelry_link_v as
      select c.class_code, c.class_name,
             j.design_code, j.category, j.realization_state, j.commerce_state,
             j.earth_reference_rule
      from merch_product_class c
      join thylora_jewelry_watch_registry j on j.design_code = c.jewelry_registry_ref
    $v$;
  end if;
end $$;

-- Candidate SKUs beside the store readiness contract, so a merchandise SKU is
-- judged by the same columns as a digital product.
do $$
begin
  if to_regclass('public.thylora_store_product_readiness') is not null then
    execute $v$
      create or replace view merch_sku_readiness_v as
      select s.sku_code, s.sku_title, s.class_code, s.family_code,
             s.make_state, s.commerce_state, s.manufacturing_state, s.witness_state,
             s.external_product_id,
             r.readiness_id, r.product_state, r.active_allowed
      from merch_sku s
      left join thylora_store_product_readiness r
        on r.external_product_id = s.external_product_id
       and s.external_product_id is not null
    $v$;
  end if;
end $$;

comment on view merch_sku_readiness_v is
  'A null readiness_id is the expected state: no merchandise SKU has a provider record. It is not a gap to be filled by writing one.';

commit;
