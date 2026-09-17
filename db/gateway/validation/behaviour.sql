-- Does the gateway refuse what it claims to refuse? Each block states what it
-- expects. An ERROR under an "expect reject" heading is the PASSING result.
\set ON_ERROR_STOP off
\pset tuples_only off

-- Seed just enough to read.
insert into thylora_autonomy_credentials(credential_code, secret_value, enabled) values
  ('GATEWAY_AGENT:CLAUDE',  encode(digest('claude-test-key','sha256'),'hex'),  true),
  ('GATEWAY_AGENT:CHATGPT', encode(digest('chatgpt-test-key','sha256'),'hex'), false)
on conflict do nothing;
insert into thylora_continuity_boot_registry(boot_code,version,authority,status,connection_boundary)
  values ('THY-CONTINUITY-BOOT-002',2,'Vyctor Peete','ACTIVE','verified, not assumed');
insert into thylora_workroom_registry(workroom_code,title,lane,state,source_of_truth)
  values ('WR-STORE-001','Store backend','STORE_BACKEND','ACTIVE','SUPABASE');
insert into thylora_store_product_readiness(external_product_id,product_title,sell_intent,product_state,active_allowed,
  source_complete,final_artifact_complete,product_specific_visual_complete,visual_preflight_passed,rights_passed,
  delivery_connected,reaccess_verified,checkout_path_verified,mobile_preview_passed)
  values ('gid://shopify/Product/1','Test Title',true,'DRAFT',false,true,true,true,true,true,true,false,false,false);
insert into thylora_delivery_assets(asset_id,external_product_id,filename,content_sha256,file_bytes,release_state)
  values ('THY-ASSET-1','gid://shopify/Product/1','x.pdf','abc', '\x0102030405'::bytea,'HELD');

\echo '== 1 expect reject: anonymous caller'
select set_config('request.jwt.claim.role','anon',false), set_config('request.jwt.claims','{}',false);
select thylora_gw_boot();

\echo '== 2 expect reject: gateway role, no agent_code claim'
select set_config('request.jwt.claim.role','thylora_gateway',false), set_config('request.jwt.claims','{"role":"thylora_gateway"}',false);
select thylora_gw_boot();

\echo '== 3 expect reject: agent exists but is disabled'
select set_config('request.jwt.claims','{"role":"thylora_gateway","agent_code":"CHATGPT"}',false);
select thylora_gw_boot();

\echo '== 4 expect PASS: enabled agent reads boot'
select set_config('request.jwt.claims','{"role":"thylora_gateway","agent_code":"CLAUDE"}',false);
select jsonb_build_object('agent', thylora_gw_boot()->>'agent',
                          'boot_code', thylora_gw_boot()->'boot'->>'boot_code') as boot_ok;

\echo '== 5 expect reject: CLAUDE files a turn as CHATGPT'
select thylora_gw_record_turn('Q-1','CHATGPT','thread-a','hello');

\echo '== 6 expect reject: unrecognised truth_class'
select thylora_gw_record_turn('Q-2','CLAUDE','thread-a','hello',null,'PROVEN');

\echo '== 7 expect PASS: valid turn, no authority asserted'
select thylora_gw_record_turn('Q-3','CLAUDE','thread-a','source words','returned work')->>'authority_state' as authority_state;

\echo '== 8 expect reject: agent declares its own work ACCEPTED'
select thylora_gw_record_external_agent_result('Q-4','CHATGPT','P-1','thread-b','result text','VERIFIED','ACCEPTED');

\echo '== 9 expect PASS: external result lands UNVERIFIED and opens a Chairman gate'
select thylora_gw_record_external_agent_result('Q-5','CHATGPT','P-1','thread-b','result text','UNVERIFIED','PENDING',true)->>'canon_promotion' as canon_promotion;
select truth_class, capture_method from thylora_query_carryforward where query_id='Q-5';
select subject_type, state from thylora_chairman_review_gates where subject_reference='Q-5';

\echo '== 10 expect reject: gateway may not create a workroom'
select thylora_gw_update_workstream('WR-DOES-NOT-EXIST','ACTIVE');

\echo '== 11 expect PASS: workstream update is scoped, source_of_truth unchanged'
select thylora_gw_update_workstream('WR-STORE-001','BLOCKED',null,'CLAUDE','["gate open"]'::jsonb,'publish six products')->>'source_of_truth' as source_of_truth;

\echo '== 12 expect PASS: read_product returns artifact evidence, never bytes'
select (thylora_gw_read_product('gid://shopify/Product/1')->'delivery_assets'->0) ? 'file_bytes' as leaks_bytes,
       (thylora_gw_read_product('gid://shopify/Product/1')->'delivery_assets'->0)->>'byte_length' as byte_length;

\echo '== 13 expect PASS: store board reports gates_open and active_allowed'
select (thylora_gw_store_release_board(true)->'products'->0)->>'gates_open' as gates_open,
       (thylora_gw_store_release_board(true)->'products'->0)->>'active_allowed' as active_allowed;

\echo '== 14 expect PASS: gateway role holds no table privileges'
select has_table_privilege('thylora_gateway','thylora_query_carryforward','SELECT') as can_select_carryforward,
       has_table_privilege('thylora_gateway','products','SELECT')                   as can_select_products,
       has_table_privilege('thylora_gateway','thylora_delivery_assets','UPDATE')     as can_update_assets;

\echo '== 15 expect PASS: gateway may execute the nine'
select has_function_privilege('thylora_gateway','thylora_gw_boot()','EXECUTE') as may_boot;

\echo '== 16 THE PUBLIC-EXECUTE FINDING: before 0004 the gateway inherits PUBLIC grants'
\echo '   expect may_call_custody_directly = t, which is the defect 0004 closes'
select has_function_privilege('thylora_gateway','thylora_capture_query_pair(text,text,text,text,text,text,text,jsonb,text,text,bigint,timestamptz,uuid,text,jsonb,jsonb)','EXECUTE') as may_call_custody_directly,
       count(*) filter (where has_function_privilege('public', p.oid, 'EXECUTE')) as public_executable_functions
  from pg_proc p join pg_namespace n on n.oid=p.pronamespace
 where n.nspname='public' and p.prorettype <> 'trigger'::regtype;

\echo '== 17 apply the OPTIONAL hardening, then re-check'
\i :hardening
select has_function_privilege('thylora_gateway','thylora_capture_query_pair(text,text,text,text,text,text,text,jsonb,text,text,bigint,timestamptz,uuid,text,jsonb,jsonb)','EXECUTE') as may_call_custody_directly_after_0004,
       has_function_privilege('anon','thylora_capture_query_pair(text,text,text,text,text,text,text,jsonb,text,text,bigint,timestamptz,uuid,text,jsonb,jsonb)','EXECUTE') as anon_access_preserved,
       has_function_privilege('thylora_gateway','thylora_gw_boot()','EXECUTE') as gateway_still_works;
