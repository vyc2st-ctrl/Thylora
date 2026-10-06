-- MATH-ORDER-CUSTODY-675 behaviour checks. ERROR lines are the passing result for "expect reject" cases.
\set ON_ERROR_STOP 0
\echo == accept: offer created from a QR code
insert into thylora_offer_orders (offer_code, lane_code, source_channel, source_ref, terms_snapshot, terms_sha256, price_minor)
values ('OFR-675-TEST-1','L01','QR','qr-test','Concept Packet terms v1', repeat('a',64), 29500);
\echo == expect reject: ACCEPTED without acceptance evidence (G=0)
update thylora_offer_orders set state='ACCEPTED' where offer_code='OFR-675-TEST-1';
\echo == accept: ACCEPTED with acceptance evidence
update thylora_offer_orders set state='ACCEPTED', accepted_at=now(), accepted_method='checkbox', accepted_text_sha256=repeat('b',64) where offer_code='OFR-675-TEST-1';
\echo == expect reject: PAYMENT_WITNESSED claimed with no rail transaction (W_p=0)
update thylora_offer_orders set state='PAYMENT_WITNESSED', rail='CASH_APP_PAY' where offer_code='OFR-675-TEST-1';
\echo == expect reject: witnessed amount differs from price
update thylora_offer_orders set state='PAYMENT_WITNESSED', rail='CASH_APP_PAY', rail_transaction_id='tx-test', payment_witnessed_at=now(), payment_witness_source='rail api read', paid_amount_minor=100 where offer_code='OFR-675-TEST-1';
\echo == expect: CASH_APP_PAY still NOT_WITNESSED
select 'cashapp=' || status from thylora_rail_integration_v1 where rail='CASH_APP_PAY';
\echo == accept: witnessed payment read from rail
update thylora_offer_orders set state='PAYMENT_WITNESSED', rail='CASH_APP_PAY', rail_transaction_id='tx-test', payment_witnessed_at=now(), payment_witness_source='rail api read', paid_amount_minor=29500 where offer_code='OFR-675-TEST-1';
select 'cashapp=' || status from thylora_rail_integration_v1 where rail='CASH_APP_PAY';
\echo == expect reject: FULFILLED without delivery record (F=0)
update thylora_offer_orders set state='FULFILLED' where offer_code='OFR-675-TEST-1';
\echo == expect reject: REFUNDED without refund reference (Rf=0)
update thylora_offer_orders set state='REFUNDED' where offer_code='OFR-675-TEST-1';
