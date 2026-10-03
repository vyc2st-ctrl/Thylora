-- FAMILY LINEAGE behavioural checks. Each "expect reject" must print ERROR.
\set ON_ERROR_STOP 0
\echo == derived kinship
select fl_sibling_kind(
  (select id from fl_persons where person_key='father'),
  (select id from fl_persons where person_key='half-uncle')) as father_vs_half_uncle;
\echo == PDF line rendered with the teller correction
select fl_apply_corrections('He said, "Come on, you''re out here!"',
  (select id from fl_testimonies where testimony_code='FL-T-EXAMPLE-01'), 'PDF') as pdf_line;
select fl_apply_corrections('Come on your out here',
  (select id from fl_testimonies where testimony_code='FL-T-EXAMPLE-01'), 'TESTIMONY') as verbatim_untouched;
\echo == expect reject: rewriting verbatim testimony
update fl_testimonies set verbatim_text = 'rewritten' where testimony_code='FL-T-EXAMPLE-01';
\echo == expect reject: editing a correction
update fl_corrections set reason = 'changed';
\echo == expect reject: deleting a correction
delete from fl_corrections;
\echo == expect reject: second father for the half uncle
insert into fl_parentage (child_id, parent_id, parent_role)
  values ((select id from fl_persons where person_key='half-uncle'), (select id from fl_persons where person_key='father'), 'FATHER');
\echo == expect reject: correction with no target
insert into fl_corrections (testimony_id, correction_type, target_phrase, reason, corrected_by)
  values ((select id from fl_testimonies limit 1), 'REMOVE_PHRASE', '  ', 'x', (select id from auth.users limit 1));
\echo == RLS: a different signed-in user sees nothing
set role authenticated;
select set_config('request.jwt.claim.sub', gen_random_uuid()::text, false);
select count(*) as stranger_sees_persons from fl_persons;
select count(*) as stranger_sees_testimonies from fl_testimonies;
reset role;
\echo == RLS: the owner sees their tree
select set_config('request.jwt.claim.sub', (select id::text from auth.users limit 1), false);
set role authenticated;
select count(*) as owner_sees_persons from fl_persons;
reset role;
\echo == counts
select (select count(*) from fl_persons) persons, (select count(*) from fl_parentage) parentage,
       (select count(*) from fl_testimonies) testimonies, (select count(*) from fl_corrections) corrections,
       (select count(*) from fl_open_questions) questions, (select count(*) from fl_record_tasks) record_tasks;
