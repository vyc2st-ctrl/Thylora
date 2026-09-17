-- Behaviour checks. These answer one question: do the merchandise rules
-- actually reject what they claim to reject? Each block must raise.
\set ON_ERROR_STOP on

create or replace function merch_must_fail(stmt text, label text) returns void
language plpgsql as $$
begin
  begin
    execute stmt;
    raise exception 'EXPECTED FAILURE DID NOT OCCUR: %', label;
  exception
    when check_violation or unique_violation or foreign_key_violation or not_null_violation then
      raise notice 'OK rejected: %', label;
  end;
end $$;

-- A vessel needs both a side A lock and a side B kind.
select merch_must_fail($$
  insert into merch_sku (sku_code, sku_title, class_code, family_code, artwork_lock_codes)
  values ('T-CUP-NO-SIDE-A','no side a','MUG','LOGO_ONLY','["LOCK-ER-MARK-GLASS-HAT"]')
$$, 'a mug with no side A lock');

select merch_must_fail($$
  insert into merch_sku (sku_code, sku_title, class_code, family_code, artwork_lock_codes, side_a_lock)
  values ('T-CUP-NO-SIDE-B','no side b','CUP','LOGO_ONLY','["LOCK-ER-MARK-GLASS-HAT"]','LOCK-ER-MARK-GLASS-HAT')
$$, 'a carry cup with no side B kind');

-- A logo-only SKU may not carry a phrase; a phrase SKU must carry one.
select merch_must_fail($$
  insert into merch_sku (sku_code, sku_title, class_code, family_code, artwork_lock_codes, phrase_code)
  values ('T-LOGO-WITH-PHRASE','smuggled phrase','STK','LOGO_ONLY','["LOCK-ER-MARK-GLASS-HAT"]','PHR-001')
$$, 'a LOGO_ONLY SKU carrying a phrase');

select merch_must_fail($$
  insert into merch_sku (sku_code, sku_title, class_code, family_code, artwork_lock_codes, side_a_lock, side_b_kind)
  values ('T-PHRASE-NO-PHRASE','phrase family without a phrase','MUG','LOGO_PHRASE','["LOCK-ER-MARK-GLASS-HAT"]','LOCK-ER-MARK-GLASS-HAT','PHRASE')
$$, 'a LOGO_PHRASE SKU with no phrase');

select merch_must_fail($$
  insert into merch_sku (sku_code, sku_title, class_code, family_code, artwork_lock_codes, scene_code)
  values ('T-LOGO-WITH-SCENE','smuggled scene','STK','LOGO_ONLY','["LOCK-ER-MARK-GLASS-HAT"]','SCN-SPORTS001')
$$, 'a LOGO_ONLY SKU carrying a scene');

-- Live commerce and manufacturing cannot be claimed without a witness.
select merch_must_fail($$
  update merch_sku set commerce_state = 'LIVE' where sku_code = 'ERM-STK-L-ERGLASSHAT-R001'
$$, 'commerce_state LIVE with no witness');

select merch_must_fail($$
  update merch_sku set manufacturing_state = 'MANUFACTURED' where sku_code = 'ERM-STK-L-ERGLASSHAT-R001'
$$, 'manufacturing_state MANUFACTURED with no witness');

-- Serial shape rules.
select merch_must_fail($$
  insert into merch_serial (serial_code, sku_code, run_code, copy_kind, copy_number, visible_marking)
  values ('ERM-STK-L-ERGLASSHAT-R001-ORIG','ERM-STK-L-ERGLASSHAT-R001','ERM-STK-L-ERGLASSHAT-R001','ORIGINAL',1,'x')
$$, 'an ORIGINAL carrying a copy number');

select merch_must_fail($$
  insert into merch_serial (serial_code, sku_code, run_code, copy_kind, copy_number, visible_marking)
  values ('ERM-STK-L-ERGLASSHAT-R001-00000','ERM-STK-L-ERGLASSHAT-R001','ERM-STK-L-ERGLASSHAT-R001','REPRODUCTION',0,'x')
$$, 'a reproduction numbered zero');

select merch_must_fail($$
  insert into merch_serial (serial_code, sku_code, run_code, copy_kind, copy_number, visible_marking, personalization_digest)
  values ('ERM-STK-L-ERGLASSHAT-R001-00002','ERM-STK-L-ERGLASSHAT-R001','ERM-STK-L-ERGLASSHAT-R001','REPRODUCTION',2,'x','Kennedy!')
$$, 'a personalisation field carrying a name instead of a digest');

-- Only one ORIGINAL per run.
insert into merch_serial (serial_code, sku_code, run_code, copy_kind, visible_marking)
values ('ERM-STK-L-ERGLASSHAT-R001-ORIG','ERM-STK-L-ERGLASSHAT-R001','ERM-STK-L-ERGLASSHAT-R001','ORIGINAL','ORIGINAL — NOT A REPRODUCTION');

select merch_must_fail($$
  insert into merch_serial (serial_code, sku_code, run_code, copy_kind, visible_marking)
  values ('ERM-STK-L-ERGLASSHAT-R001-ORIG-2','ERM-STK-L-ERGLASSHAT-R001','ERM-STK-L-ERGLASSHAT-R001','ORIGINAL','x')
$$, 'a second ORIGINAL in the same run');

-- A copy number is not reusable within a run.
insert into merch_serial (serial_code, sku_code, run_code, copy_kind, copy_number, visible_marking)
values ('ERM-STK-L-ERGLASSHAT-R001-00001','ERM-STK-L-ERGLASSHAT-R001','ERM-STK-L-ERGLASSHAT-R001','REPRODUCTION',1,'x');

select merch_must_fail($$
  insert into merch_serial (serial_code, sku_code, run_code, copy_kind, copy_number, visible_marking)
  values ('ERM-STK-L-ERGLASSHAT-R001-00001-dup','ERM-STK-L-ERGLASSHAT-R001','ERM-STK-L-ERGLASSHAT-R001','REPRODUCTION',1,'x')
$$, 'a reused copy number in the same run');

-- A run cannot issue past its edition size.
update merch_run set edition_size = 2, copies_issued = 2 where run_code = 'ERM-PCH-L-ERGLASSHAT-R001';
select merch_must_fail($$
  update merch_run set copies_issued = 3 where run_code = 'ERM-PCH-L-ERGLASSHAT-R001'
$$, 'issuing past a declared edition size');

drop function merch_must_fail(text, text);
