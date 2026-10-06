-- EXP676-ACCOUNTS behaviour checks. ERROR lines are the passing result for "expect reject" cases.
\set ON_ERROR_STOP 0
\echo == accept: custodial account for child A, owned by the custodian, pending review
insert into thy_loochy_accounts (account_id, owner_user_id, family_profile_id, account_kind, account_state)
values ('ACCT-CHILD-A','00000000-0000-0000-0000-0000000000c0','00000000-0000-0000-0000-0000000000a1','CUSTODIAL_CHILD','pending_review');
\echo == accept: second custodial account for child B under the same custodian
insert into thy_loochy_accounts (account_id, owner_user_id, family_profile_id, account_kind, account_state)
values ('ACCT-CHILD-B','00000000-0000-0000-0000-0000000000c0','00000000-0000-0000-0000-0000000000a2','CUSTODIAL_CHILD','pending_review');
\echo == expect reject: second custodial account for the same child
insert into thy_loochy_accounts (account_id, owner_user_id, family_profile_id, account_kind, account_state)
values ('ACCT-CHILD-A-DUP','00000000-0000-0000-0000-0000000000c0','00000000-0000-0000-0000-0000000000a1','CUSTODIAL_CHILD','pending_review');
\echo == expect reject: second PERSONAL account for the same owner
insert into thy_loochy_accounts (account_id, owner_user_id, account_state) values ('ACCT-CUSTODIAN-2','00000000-0000-0000-0000-0000000000c0','pending_review');
\echo == expect reject: custodial account with no child
insert into thy_loochy_accounts (account_id, owner_user_id, account_kind, account_state) values ('ACCT-NOCHILD','00000000-0000-0000-0000-0000000000c0','CUSTODIAL_CHILD','pending_review');
\echo == expect reject: activate child account without parental consent + counsel clearance
update thy_loochy_accounts set account_state='active' where account_id='ACCT-CHILD-A';
\echo == expect reject: activate with consent but no counsel clearance
update thy_loochy_accounts set account_state='active', parental_consent_ref='CONSENT-TEST' where account_id='ACCT-CHILD-A';
\echo == accept: activate with both references
update thy_loochy_accounts set account_state='active', parental_consent_ref='CONSENT-TEST', counsel_clearance_ref='COUNSEL-TEST' where account_id='ACCT-CHILD-A';
select 'child_a=' || account_state from thy_loochy_accounts where account_id='ACCT-CHILD-A';
\echo == expect: existing personal account untouched
select 'personal=' || account_kind || '/' || account_state from thy_loochy_accounts where account_id='ACCT-CUSTODIAN-PERSONAL';
