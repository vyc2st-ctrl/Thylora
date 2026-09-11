-- RAE LINK · cross-user isolation checks
-- Workroom: WR-RAELINK-001
--
-- Two members, two channels, two drafts. Every line below asks: can member A
-- reach anything belonging to member B? Every answer must be no. This exercises
-- BOTH layers — row level security on the tables, and the scoping inside the
-- SECURITY DEFINER functions, which bypass RLS and therefore must scope
-- themselves.
--
-- Expected output: every check prints PASS.

\pset tuples_only on
\pset format unaligned
\set ON_ERROR_STOP 0

-- ---------------------------------------------------------------- fixtures --
reset role;
insert into auth.users(id,email) values
  ('aaaaaaaa-0000-0000-0000-00000000000a','member-a@thylora.test'),
  ('bbbbbbbb-0000-0000-0000-00000000000b','member-b@thylora.test')
on conflict do nothing;

insert into rael_profiles(user_id, handle, display_name) values
  ('aaaaaaaa-0000-0000-0000-00000000000a','member-a','Member A'),
  ('bbbbbbbb-0000-0000-0000-00000000000b','member-b','Member B')
on conflict do nothing;

insert into rael_channels(channel_code,slug,owner_user_id,name,channel_class,world_status,channel_state) values
  ('RLS-CH-A','rls-channel-a','aaaaaaaa-0000-0000-0000-00000000000a','Channel A','EARTH_PERSON','EARTH_REAL','ACTIVE'),
  ('RLS-CH-B','rls-channel-b','bbbbbbbb-0000-0000-0000-00000000000b','Channel B','EARTH_PERSON','EARTH_REAL','ACTIVE')
on conflict do nothing;

insert into rael_channel_members(channel_id,user_id,member_role)
select id, owner_user_id, 'OWNER' from rael_channels where channel_code in ('RLS-CH-A','RLS-CH-B')
on conflict do nothing;

-- B has a private draft and a published item.
insert into rael_media_assets(asset_code,channel_id,owner_user_id,media_kind,title,pipeline_state,visibility_state)
select 'RLS-B-DRAFT', id,'bbbbbbbb-0000-0000-0000-00000000000b','VIDEO','B private draft','METADATA','PRIVATE'
from rael_channels where channel_code='RLS-CH-B' on conflict do nothing;

insert into rael_media_assets(asset_code,channel_id,owner_user_id,media_kind,title,pipeline_state,visibility_state,published_at)
select 'RLS-B-PUB', id,'bbbbbbbb-0000-0000-0000-00000000000b','VIDEO','B published','PUBLISHED','PUBLIC', now()
from rael_channels where channel_code='RLS-CH-B' on conflict do nothing;

-- B has an upload session, an entitlement and money.
insert into rael_upload_sessions(asset_id, provider, total_bytes)
select id,'UNCONFIGURED', 1000 from rael_media_assets where asset_code='RLS-B-DRAFT' on conflict do nothing;

insert into rael_entitlements(user_id, asset_id, grant_basis, is_perpetual)
select 'bbbbbbbb-0000-0000-0000-00000000000b', id,'PURCHASE', true
from rael_media_assets where asset_code='RLS-B-PUB' on conflict do nothing;

insert into rael_split_policies(policy_code,scope_kind,scope_ref,lane_code,platform_share_bp,creator_share_bp,effective_from)
select 'RLS-P','CHANNEL', id::text,'TIP',1000,9000, now() - interval '1 hour'
from rael_channels where channel_code='RLS-CH-B' on conflict do nothing;

insert into rael_revenue_events(event_code,lane_code,channel_id,currency,gross_minor,tax_state)
select 'RLS-EV','TIP', id,'USD', 10000,'NOT_APPLICABLE'
from rael_channels where channel_code='RLS-CH-B' on conflict do nothing;
select 1 from (select rael_settle_revenue_event(id) from rael_revenue_events where event_code='RLS-EV') s limit 0;

-- B comments on B's published asset, and the comment is held.
insert into rael_comments(asset_id, author_user_id, body, moderation_state)
select id,'bbbbbbbb-0000-0000-0000-00000000000b','B held comment','HELD'
from rael_media_assets where asset_code='RLS-B-PUB'
  and not exists (select 1 from rael_comments where body = 'B held comment');

-- ------------------------------------------------------- act as member A ----
-- Capture B's identifiers BEFORE dropping privileges. Under RLS as member A
-- these rows are invisible, which is the point: the test must still be able to
-- ASK for them by id, or it proves nothing.
select id as b_draft_id from rael_media_assets where asset_code = 'RLS-B-DRAFT' limit 1 \gset
select id as b_pub_id   from rael_media_assets where asset_code = 'RLS-B-PUB' limit 1 \gset
select id as b_chan_id  from rael_channels     where channel_code = 'RLS-CH-B' limit 1 \gset
select id as b_comment_id from rael_comments   where body = 'B held comment' limit 1 \gset
select id as b_event_id from rael_revenue_events where event_code = 'RLS-EV' limit 1 \gset

set role authenticated;
select set_config('request.jwt.claim.sub','aaaaaaaa-0000-0000-0000-00000000000a', false);

\echo -- identity
select case when auth.uid() = 'aaaaaaaa-0000-0000-0000-00000000000a'
            then 'PASS acting as member A' else 'FAIL wrong identity' end;

\echo -- table reads
select case when (select count(*) from rael_media_assets where asset_code = 'RLS-B-DRAFT') = 0
            then 'PASS A sees no B draft asset' else 'FAIL B draft leaked' end;
select case when (select count(*) from rael_media_assets where asset_code = 'RLS-B-PUB') = 1
            then 'PASS A sees B published asset' else 'FAIL published asset unreachable' end;
select case when (select count(*) from rael_upload_sessions) = 0
            then 'PASS A sees no upload session of B' else 'FAIL upload session leaked' end;
select case when (select count(*) from rael_entitlements) = 0
            then 'PASS A sees no entitlement of B' else 'FAIL entitlement leaked' end;
select case when (select count(*) from rael_ledger_entries) = 0
            then 'PASS A sees no ledger entry of B' else 'FAIL ledger leaked' end;
select case when (select count(*) from rael_revenue_events) = 0
            then 'PASS A sees no revenue event of B' else 'FAIL revenue event leaked' end;
select case when (select count(*) from rael_payouts) = 0
            then 'PASS A sees no payout of B' else 'FAIL payout leaked' end;
-- Scoped to B's comment: A's OWN held comment is visible to A by design, so a
-- bare count over HELD would fail for the right reason and hide the real check.
select case when (select count(*) from rael_comments
                   where moderation_state = 'HELD' and body = 'B held comment') = 0
            then 'PASS A sees no held comment of B (table)' else 'FAIL held comment leaked (table)' end;
select case when (select count(*) from rael_comments
                   where moderation_state = 'HELD'
                     and author_user_id <> 'aaaaaaaa-0000-0000-0000-00000000000a') = 0
            then 'PASS A sees no other member held comment' else 'FAIL foreign held comment leaked' end;
select case when (select count(*) from rael_consents) = 0
            then 'PASS A sees no consent record of B' else 'FAIL consent leaked' end;

\echo -- function reads
select case when (rael_list_comments(:'b_pub_id')::text not like '%B held comment%')
            then 'PASS A sees no held comment of B (function)' else 'FAIL function leaked held comment' end;
select case when (rael_channel_page('rls-channel-b')->'media')::text not like '%B private draft%'
            then 'PASS A sees no B draft on B channel page' else 'FAIL channel page leaked draft' end;
select case when (rael_channel_page('rls-channel-b')->'channel'->>'is_staff') = 'false'
            then 'PASS A is not staff on B channel' else 'FAIL A marked staff on B channel' end;
select case when (rael_watch_page(:'b_draft_id')->>'found') = 'false'
            then 'PASS A cannot open B draft watch page' else 'FAIL watch page leaked draft' end;
select case when (rael_watch_page(:'b_pub_id')->>'found') = 'true'
            then 'PASS A can open B published watch page' else 'FAIL published watch page unreachable' end;

\echo -- write attempts
select case when (rael_start_upload(jsonb_build_object('asset_id', :'b_draft_id'::uuid,'total_bytes',100))->>'code') = 'NOT_AUTHORIZED'
            then 'PASS A cannot start an upload on B asset' else 'FAIL upload authorized' end;
select case when (rael_record_chunk((select id from rael_upload_sessions limit 1), 0)->>'code') in ('NOT_AUTHORIZED','SESSION_NOT_FOUND')
            then 'PASS A cannot record a chunk on B upload' else 'FAIL chunk recorded' end;
select case when (rael_moderate_comment(:'b_comment_id'::uuid,'VISIBLE')->>'code') = 'NOT_AUTHORIZED'
            then 'PASS A cannot moderate a comment on B channel' else 'FAIL moderation authorized' end;
select case when (rael_complete_upload(jsonb_build_object('session_id', gen_random_uuid()))->>'code') = 'SESSION_NOT_FOUND'
            then 'PASS A cannot complete an unknown upload' else 'FAIL completion authorized' end;

\echo -- attempts that must raise rather than return
\echo (each of the next three lines must be followed by an ERROR to pass)
\echo EXPECT-ERROR publish-b-asset
select rael_publish_asset(:'b_draft_id'::uuid);
\echo EXPECT-ERROR statement-b-channel
select rael_creator_statement(:'b_chan_id'::uuid, current_date - 30, current_date);
\echo EXPECT-ERROR settle-b-revenue
select rael_settle_revenue_event(:'b_event_id'::uuid);

\echo -- member A still reaches its own records
select case when (rael_channel_page('rls-channel-a')->'channel'->>'is_staff') = 'true'
            then 'PASS A is staff on its own channel' else 'FAIL A not staff on own channel' end;
select case when (rael_post_comment(jsonb_build_object('asset_id', :'b_pub_id'::uuid,'body','A comment on a published work'))->>'posted') = 'true'
            then 'PASS A can comment on published media' else 'FAIL A cannot comment' end;
select case when (rael_toggle_follow(:'b_chan_id'::uuid)->>'following') = 'true'
            then 'PASS A can follow B channel' else 'FAIL follow refused' end;

reset role;
select set_config('request.jwt.claim.sub','', false);
