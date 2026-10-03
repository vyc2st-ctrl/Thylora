-- Each block must FAIL. run.sh counts rejections.
\set ON_ERROR_STOP 0
insert into head_stories (show_code, story_code, working_title, place) values ('MIRROR_LINE','ML-001','Horn Island','Jackson County, MS');
-- R1 number without context
insert into head_story_numbers (story_id, claim, value, source, base, period, comparison) select id,'x',1,'src','', 'p','c' from head_stories where story_code='ML-001';
-- R2 outreach sent before Chairman approval
insert into head_outreach (story_id, recipient_label, team_intro, sent_at) select id,'Family','[{"role":"producer"}]', now() from head_stories where story_code='ML-001';
-- R3 outreach with no team introduction
insert into head_outreach (story_id, recipient_label, team_intro) select id,'Family','[]' from head_stories where story_code='ML-001';
-- R4 one reading only
insert into head_fit_profiles (owner_id, wearer, head_readings_mm, head_photo_ref) values (gen_random_uuid(),'MAN','{575}','p');
-- R5 impossible head size
insert into head_fit_profiles (owner_id, wearer, head_readings_mm, head_photo_ref) values (gen_random_uuid(),'MAN','{575,900}','p');
-- R6 production released before paid
insert into head_production_runs (branch_code, maker_ref, maker_licence_ref, maker_minimum, paid_preorders, run_cost_minor, cash_on_hand_minor, released_at) values ('HEADWEAR','m','L',100,40,300000,500000,now());
-- R7 restaurant that keeps part of the neighborhood out
insert into head_restaurant_partners (business_label, baseline_monthly_minor, fee_on_lift_bp, open_to_whole_neighborhood) values ('X',100,1000,false);
-- R8 fee rate above 50%
insert into head_restaurant_partners (business_label, baseline_monthly_minor, fee_on_lift_bp) values ('X',100,6000);
-- Must SUCCEED
\set ON_ERROR_STOP 1
insert into head_story_numbers (story_id, claim, value, source, base, period, comparison) select id,'drownings',1,'MS DOH','per 100k','2025','national rate' from head_stories where story_code='ML-001';
insert into head_production_runs (branch_code, maker_ref, maker_licence_ref, maker_minimum, paid_preorders, run_cost_minor, cash_on_hand_minor, released_at) values ('HEADWEAR','m','L',100,120,300000,500000,now());
select 'FEE_CHECK', head_turnaround_fee(2000000, 2600000, 2000) = 120000, head_turnaround_fee(2000000, 1800000, 2000) = 0;
