-- ROOT HOUSE behaviour checks. ERROR lines are the passing result for "expect reject" cases.
\set ON_ERROR_STOP 0
insert into auth.users (id) values ('00000000-0000-0000-0000-000000000001') on conflict do nothing;
insert into lin_trees (id, owner_id, label) values ('10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001','Chairman') on conflict do nothing;
insert into lin_people (id, tree_id, seat, given, is_living) values ('20000000-0000-0000-0000-000000000014','10000000-0000-0000-0000-000000000001',14,'Test',false) on conflict do nothing;
\echo == derived line for seat 14 (expect MM)
select 'line_14=' || line from lin_people where seat = 14;
\echo == expect reject: FAMILY_TOLD without a teller
insert into lin_claims (person_id, field, value, grade) values ('20000000-0000-0000-0000-000000000014','birth_place','Ontario','FAMILY_TOLD');
\echo == expect reject: PROVEN with no evidence
insert into lin_claims (person_id, field, value, grade, teller) values ('20000000-0000-0000-0000-000000000014','birth_place','Ontario','PROVEN','Mom');
\echo == accept: family told
insert into lin_claims (id, person_id, field, value, teller) values ('30000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000014','birth_place','Ontario','Mom');
insert into lin_evidence (claim_id, source_id, citation, informant, value, reviewed_by, reviewed_at) values
 ('30000000-0000-0000-0000-000000000001','census-1880','1880 census, Shelby Co.','head','Canada','dez',now());
\echo == accept: POSSIBLE with one reviewed record
update lin_claims set grade = 'POSSIBLE' where id = '30000000-0000-0000-0000-000000000001';
select 'grade=' || grade from lin_claims where id = '30000000-0000-0000-0000-000000000001';
\echo == expect reject: PROBABLE with one record
update lin_claims set grade = 'PROBABLE' where id = '30000000-0000-0000-0000-000000000001';
insert into lin_credits (person_id, researcher, source_id, claim_field) values ('20000000-0000-0000-0000-000000000014','dez','census-1880','birth_place');
\echo == expect reject: deleting a credit
delete from lin_credits;
\echo == expect reject: a researcher not disclosed as a world character
insert into lin_researchers (id, name, desk, role, world_character) values ('x','X','CENSUS','x',false);
\echo == expect reject: dead person marked living
insert into lin_people (tree_id, seat, death_year, is_living) values ('10000000-0000-0000-0000-000000000001',15,1950,true);
\echo == RLS: another user sees no trees
set role authenticated;
set request.jwt.claim.sub = '00000000-0000-0000-0000-000000000002';
select 'visible_trees_other_user=' || count(*) from lin_trees;
set request.jwt.claim.sub = '00000000-0000-0000-0000-000000000001';
select 'visible_trees_owner=' || count(*) from lin_trees;
reset role;
select 'sources=' || count(*) from lin_sources;
select 'rls_disabled_tables=' || count(*) from pg_tables where tablename like 'lin\_%' and not rowsecurity;
