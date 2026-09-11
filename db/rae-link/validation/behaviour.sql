-- RAE LINK · behavioural checks against an applied schema.
-- Each check asserts that a rule REJECTS what it should reject. Run after the
-- migrations; expect the ERROR lines — they are the passing result.
\set ON_ERROR_STOP 0
\pset tuples_only on
\pset format unaligned

insert into auth.users(id,email) values
  ('11111111-1111-1111-1111-111111111111','creator@thylora.test') on conflict do nothing;
insert into rael_channels(channel_code,slug,owner_user_id,name,channel_class,world_status,channel_state)
values ('CH-EARTH-1','earth-one','11111111-1111-1111-1111-111111111111','Earth One','EARTH_PERSON','EARTH_REAL','ACTIVE')
on conflict do nothing;

\echo == EXPECT REJECT: world channel labelled EARTH_REAL
insert into rael_channels(channel_code,slug,owner_user_id,name,channel_class,world_status)
values ('CH-BAD','bad-world','11111111-1111-1111-1111-111111111111','Bad World','WORLD_CHANNEL','EARTH_REAL');

\echo == EXPECT REJECT: world channel with no simulated disclosure
insert into rael_channels(channel_code,slug,owner_user_id,name,channel_class,world_status)
values ('CH-BAD2','bad-world2','11111111-1111-1111-1111-111111111111','Bad World 2','WORLD_CHANNEL','WORLD_SIMULATED');

\echo == EXPECT ACCEPT: world channel with disclosure
insert into rael_channels(channel_code,slug,owner_user_id,name,channel_class,world_status,simulated_disclosure,channel_state)
values ('CH-WORLD','world-one','11111111-1111-1111-1111-111111111111','World One','WORLD_CHANNEL','WORLD_SIMULATED','Simulated world media. Not an Earth person.','ACTIVE');

\echo == EXPECT REJECT: minor consent with no guardian
insert into rael_consents(consent_code,subject_kind,subject_ref) values ('C-MINOR','MINOR','child-a');

\echo == EXPECT REJECT: consent collecting medical detail
insert into rael_consents(consent_code,subject_kind,subject_ref,medical_details_collected)
values ('C-MED','ADULT','adult-a',true);

\echo == EXPECT REJECT: split policy not totalling 100 percent
insert into rael_split_policies(policy_code,scope_kind,scope_ref,platform_share_bp,creator_share_bp)
values ('P-BAD','LANE','TIP',2000,7999);

\echo == EXPECT REJECT: beneficiary share with no named beneficiary
insert into rael_split_policies(policy_code,scope_kind,scope_ref,platform_share_bp,creator_share_bp,beneficiary_share_bp)
values ('P-BAD2','LANE','TIP',2000,3000,5000);

\echo == EXPECT REJECT: payout marked PAID with no evidence
insert into rael_payouts(payout_code,party_kind,party_ref,period_start,period_end,payout_state)
values ('PO-BAD','CREATOR','x','2026-09-01','2026-09-30','PAID');

\echo == EXPECT REJECT: deductions exceeding gross
insert into rael_revenue_events(event_code,lane_code,currency,gross_minor,refund_minor)
values ('EV-BAD','TIP','USD',100,500);

\echo == EXPECT REJECT: purchase entitlement given an expiry
insert into rael_media_assets(asset_code,channel_id,owner_user_id,media_kind,title)
select 'RAEL-TEST-1',id,'11111111-1111-1111-1111-111111111111','VIDEO','Test work'
from rael_channels where channel_code='CH-EARTH-1';
insert into rael_entitlements(user_id,asset_id,grant_basis,is_perpetual,expires_at)
select '11111111-1111-1111-1111-111111111111',id,'PURCHASE',true,now()+interval '1 day'
from rael_media_assets where asset_code='RAEL-TEST-1';

\echo == EXPECT REJECT: partnership published under a revoked consent
insert into rael_consents(consent_code,subject_kind,subject_ref,revoked_at) values ('C-REV','FAMILY','fam-a',now());
insert into rael_family_partnerships(partnership_code,family_label,consent_id,beneficiary_ref,beneficiary_share_bp,purpose_statement,published_at)
select 'PA-REV','Family A',id,'Named family fund',5000,'Stated purpose.',now()
from rael_consents where consent_code='C-REV';

\echo == REPORT: pipeline trail written automatically
select 'pipeline_events='||count(*) from rael_pipeline_events e
  join rael_media_assets a on a.id=e.asset_id where a.asset_code='RAEL-TEST-1';

\echo == REPORT: publish gate blockers for an incomplete asset
select 'blockers='||string_agg(b->>'code', ',' order by b->>'code')
from rael_media_assets a, jsonb_array_elements(rael_publish_gate(a.id)->'blockers') b
where a.asset_code='RAEL-TEST-1';

\echo == REPORT: settlement parity fixture (compare with tests/ledger.test.mjs)
insert into rael_split_policies(policy_code,scope_kind,scope_ref,lane_code,platform_share_bp,creator_share_bp,beneficiary_share_bp,beneficiary_ref,declared_before_publication,effective_from)
values ('P-FAM','LANE','FAMILY_PARTNERSHIP','FAMILY_PARTNERSHIP',1000,4000,5000,'Named family fund',true, now() - interval '1 hour');
insert into rael_revenue_events(event_code,lane_code,channel_id,currency,gross_minor,processor_fee_minor,tax_state,tax_remitted_by)
select 'EV-FAM','FAMILY_PARTNERSHIP',id,'USD',9999,313,'NOT_APPLICABLE','NONE'
from rael_channels where channel_code='CH-EARTH-1';
select 'base='||(rael_settle_revenue_event(id)->>'distributable_base_minor') from rael_revenue_events where event_code='EV-FAM';
select lower(party_kind::text)||'='||amount_minor||' rounding='||rounding_minor
from rael_ledger_entries l join rael_revenue_events e on e.id=l.revenue_event_id
where e.event_code='EV-FAM' order by party_kind::text;
select 'entries_sum='||sum(amount_minor) from rael_ledger_entries l
  join rael_revenue_events e on e.id=l.revenue_event_id where e.event_code='EV-FAM';

\echo == REPORT: revenue that predates every policy is reported, not settled
insert into rael_revenue_events(event_code,lane_code,channel_id,currency,gross_minor,occurred_at,tax_state)
select 'EV-OLD','TIP',id,'USD',5000, now() - interval '30 days','NOT_APPLICABLE'
from rael_channels where channel_code='CH-EARTH-1';
select 'predating_revenue='||coalesce(rael_settle_revenue_event(id)->>'reason','SETTLED')
from rael_revenue_events where event_code='EV-OLD';

\echo == REPORT: row level security coverage
select 'rls_disabled_tables='||count(*) from pg_class c join pg_namespace n on n.oid=c.relnamespace
 where n.nspname='public' and c.relname like 'rael\_%' and c.relkind='r' and c.relrowsecurity=false;
select 'tables='||count(*) from pg_class c join pg_namespace n on n.oid=c.relnamespace
 where n.nspname='public' and c.relname like 'rael\_%' and c.relkind='r';
select 'policies='||count(*) from pg_policies where schemaname='public' and tablename like 'rael\_%';
select 'check_constraints='||count(*) from pg_constraint c join pg_class t on t.oid=c.conrelid
 where t.relname like 'rael\_%' and c.contype='c';
