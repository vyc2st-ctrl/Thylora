#!/usr/bin/env bash
# Validate helper access against a throwaway local PostgreSQL. Never touches the backend.
# Each "expect ..." line prints the result; a refusal line is the passing result.
set -uo pipefail
DB="${HELPER_VALIDATION_DB:-helper_check}"
HERE="$(cd "$(dirname "$0")" && pwd)"
STUB="$HERE/../../rae-link/validation/supabase_stub.sql"
psql -q -c "drop database if exists $DB" >/dev/null 2>&1
psql -q -c "create database $DB" >/dev/null
export PGOPTIONS='-c client_min_messages=warning'
P="psql -q -X -tA -d $DB"
$P -v ON_ERROR_STOP=1 -f "$STUB" >/dev/null || { echo "stub failed"; exit 1; }
for pass in 1 2; do $P -v ON_ERROR_STOP=1 -f "$HERE/../0001_helper_access.sql" >/dev/null && echo "OK   migration pass $pass" || { echo "FAIL migration pass $pass"; exit 1; }; done
$P <<'SQL' 2>&1 | grep -E '^(expect|ERROR|result)'
insert into auth.users(id) values
 ('00000000-0000-0000-0000-00000000000a'),('00000000-0000-0000-0000-00000000000b'),('00000000-0000-0000-0000-0000000000c0');
insert into thy_helper_profiles(user_id,display_name,relationship) values
 ('00000000-0000-0000-0000-00000000000a','Helper A','PARENT'),('00000000-0000-0000-0000-00000000000b','Helper B','PARTNER');
\echo expect REFUSED: minor without guardian
insert into thy_helper_profiles(user_id,display_name,relationship,is_minor) values ('00000000-0000-0000-0000-0000000000c0','Child','GRANDCHILD',true);
insert into thy_helper_scope_items(id,helper_id,item_kind,title,body,why_visible) values
 ('10000000-0000-0000-0000-00000000000a','00000000-0000-0000-0000-00000000000a','TASK','A task','for A','A runs this errand'),
 ('10000000-0000-0000-0000-00000000000b','00000000-0000-0000-0000-00000000000b','INFO','B secret','for B only','B handles this');
insert into thy_helper_inputs(helper_id,input_kind,body) values ('00000000-0000-0000-0000-00000000000b','NOTE','B private note');
set role authenticated;
set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000a';
\echo expect 1 scope item visible to A
select 'result scope_visible=' || count(*) from thy_helper_scope_items;
\echo expect 0 of B inputs visible to A
select 'result inputs_visible=' || count(*) from thy_helper_inputs;
\echo expect ACCEPTED: A submits an answer to own task
insert into thy_helper_inputs(helper_id,scope_item_id,input_kind,body) values ('00000000-0000-0000-0000-00000000000a','10000000-0000-0000-0000-00000000000a','ANSWER','done');
select 'result own_inputs=' || count(*) from thy_helper_inputs;
\echo expect REFUSED: A answers against B item
insert into thy_helper_inputs(helper_id,scope_item_id,input_kind,body) values ('00000000-0000-0000-0000-00000000000a','10000000-0000-0000-0000-00000000000b','ANSWER','peek');
\echo expect REFUSED: A posts as B
insert into thy_helper_inputs(helper_id,input_kind,body) values ('00000000-0000-0000-0000-00000000000b','NOTE','spoof');
\echo expect REFUSED: A self-approves
insert into thy_helper_inputs(helper_id,input_kind,body,review_state) values ('00000000-0000-0000-0000-00000000000a','NOTE','x','ACCEPTED');
\echo expect REFUSED: A edits own input
update thy_helper_inputs set body='changed';
\echo expect REFUSED: A deletes own input
delete from thy_helper_inputs;
\echo expect REFUSED: A adds to own scope
insert into thy_helper_scope_items(helper_id,item_kind,title,body,why_visible) values ('00000000-0000-0000-0000-00000000000a','INFO','x','x','x');
reset role;
update thy_helper_profiles set helper_state='PAUSED' where user_id='00000000-0000-0000-0000-00000000000a';
set role authenticated;
set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000a';
\echo expect 0 scope items once paused
select 'result paused_scope_visible=' || count(*) from thy_helper_scope_items;
\echo expect REFUSED: paused helper submits
insert into thy_helper_inputs(helper_id,input_kind,body) values ('00000000-0000-0000-0000-00000000000a','NOTE','late');
SQL
