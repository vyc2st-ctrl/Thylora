begin read only;
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}',true) \g /dev/null
select 'chairman',(select count(*) from thylora_response_point_coverage),(select count(*) from thylora_workroom_registry),(select count(*) from thylora_workroom_task_registry),(select count(*) from thylora_store_product_readiness),(select count(*) from thylora_dashboard_regression_evidence);
select set_config('request.jwt.claims','{"sub":"00000000-0000-4000-8000-000000000001","role":"authenticated"}',true) \g /dev/null
select 'other',(select count(*) from thylora_response_point_coverage),(select count(*) from thylora_workroom_registry),(select count(*) from thylora_workroom_task_registry),(select count(*) from thylora_store_product_readiness),(select count(*) from thylora_dashboard_regression_evidence);
rollback;
