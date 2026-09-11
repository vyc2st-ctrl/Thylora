-- RAE LINK · 0008 · Row level security
-- Workroom: WR-RAELINK-001
-- ACCESS != AUTHORITY. A signed-in viewer can read published, permitted media
-- and their own records. Creator staff read their own channel. Ledger and payout
-- rows are readable only by the party they belong to. Writes that need custody
-- (views, publication, settlement) go through security-definer functions in 0009
-- rather than direct table grants.

begin;

create or replace function rael_is_channel_member(p_channel_id uuid, p_roles rael_channel_role[])
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from rael_channels c
    where c.id = p_channel_id and c.owner_user_id = auth.uid()
  ) or exists (
    select 1 from rael_channel_members m
    where m.channel_id = p_channel_id
      and m.user_id = auth.uid()
      and m.member_state = 'ACTIVE'
      and m.member_role = any(p_roles)
  );
$$;

create or replace function rael_can_read_asset(p_asset_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from rael_media_assets a
    where a.id = p_asset_id
      and (
        (a.pipeline_state = 'PUBLISHED' and a.visibility_state in ('PUBLIC','UNLISTED'))
        or rael_is_channel_member(a.channel_id, array['OWNER','MANAGER','EDITOR','UPLOADER','ANALYST','VIEWER']::rael_channel_role[])
        or exists (
          select 1 from rael_entitlements e
          where e.user_id = auth.uid()
            and e.revoked_at is null
            and (e.expires_at is null or e.expires_at > now())
            and (e.asset_id = a.id or e.channel_id = a.channel_id)
        )
        or (a.visibility_state = 'FOLLOWERS' and a.pipeline_state = 'PUBLISHED' and exists (
          select 1 from rael_follows f
          where f.channel_id = a.channel_id and f.follower_user_id = auth.uid() and f.follow_state = 'ACTIVE'
        ))
        or (a.visibility_state = 'SUBSCRIBERS' and a.pipeline_state = 'PUBLISHED' and exists (
          select 1 from rael_subscriptions s
          join rael_subscription_plans p on p.id = s.plan_id
          where s.subscriber_user_id = auth.uid()
            and s.subscription_state in ('TRIAL','ACTIVE')
            and (p.plan_kind = 'PLATFORM' or p.channel_id = a.channel_id)
        ))
      )
  );
$$;

do $$
declare t text;
begin
  foreach t in array array[
    'rael_profiles','rael_channels','rael_channel_members','rael_follows',
    'rael_media_assets','rael_upload_sessions','rael_pipeline_events','rael_media_renditions',
    'rael_media_captions','rael_accessibility_waivers','rael_scan_results','rael_moderation_reviews',
    'rael_rights_records','rael_provenance_events','rael_consents','rael_asset_consents',
    'rael_takedown_requests','rael_appeals','rael_view_events','rael_view_rollup_daily',
    'rael_reactions','rael_comments','rael_reports','rael_notifications','rael_rate_counters',
    'rael_revenue_lanes','rael_split_policies','rael_revenue_events','rael_ledger_entries',
    'rael_payouts','rael_payout_lines','rael_adjustments','rael_subscription_plans',
    'rael_subscriptions','rael_purchases','rael_entitlements','rael_asset_products',
    'rael_family_partnerships','rael_partnership_assets','rael_partnership_prohibitions'
  ] loop
    execute format('alter table %I enable row level security', t);
  end loop;
end $$;

-- Public read surfaces --------------------------------------------------------
drop policy if exists rael_profiles_public_read on rael_profiles;
create policy rael_profiles_public_read on rael_profiles
  for select using (profile_state = 'ACTIVE' or user_id = auth.uid());

drop policy if exists rael_profiles_self_write on rael_profiles;
create policy rael_profiles_self_write on rael_profiles
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists rael_channels_public_read on rael_channels;
create policy rael_channels_public_read on rael_channels
  for select using (
    channel_state = 'ACTIVE'
    or rael_is_channel_member(id, array['OWNER','MANAGER','EDITOR','UPLOADER','ANALYST','VIEWER']::rael_channel_role[])
  );

drop policy if exists rael_channels_owner_write on rael_channels;
create policy rael_channels_owner_write on rael_channels
  for all using (owner_user_id = auth.uid()) with check (owner_user_id = auth.uid());

drop policy if exists rael_lanes_read on rael_revenue_lanes;
create policy rael_lanes_read on rael_revenue_lanes for select using (true);

drop policy if exists rael_prohibitions_read on rael_partnership_prohibitions;
create policy rael_prohibitions_read on rael_partnership_prohibitions for select using (true);

-- Media -----------------------------------------------------------------------
drop policy if exists rael_assets_read on rael_media_assets;
create policy rael_assets_read on rael_media_assets
  for select using (rael_can_read_asset(id));

drop policy if exists rael_assets_creator_write on rael_media_assets;
create policy rael_assets_creator_write on rael_media_assets
  for all using (
    rael_is_channel_member(channel_id, array['OWNER','MANAGER','EDITOR','UPLOADER']::rael_channel_role[])
  ) with check (
    rael_is_channel_member(channel_id, array['OWNER','MANAGER','EDITOR','UPLOADER']::rael_channel_role[])
  );

do $$
declare t text;
begin
  foreach t in array array[
    'rael_media_renditions','rael_media_captions','rael_pipeline_events',
    'rael_scan_results','rael_moderation_reviews','rael_rights_records',
    'rael_provenance_events','rael_upload_sessions','rael_accessibility_waivers'
  ] loop
    execute format('drop policy if exists %I on %I', t || '_asset_scope', t);
    execute format(
      'create policy %I on %I for select using (rael_can_read_asset(asset_id))',
      t || '_asset_scope', t);
  end loop;
end $$;

drop policy if exists rael_rights_creator_write on rael_rights_records;
create policy rael_rights_creator_write on rael_rights_records
  for all using (exists (
    select 1 from rael_media_assets a where a.id = asset_id
      and rael_is_channel_member(a.channel_id, array['OWNER','MANAGER','EDITOR']::rael_channel_role[])
  )) with check (exists (
    select 1 from rael_media_assets a where a.id = asset_id
      and rael_is_channel_member(a.channel_id, array['OWNER','MANAGER','EDITOR']::rael_channel_role[])
  ));

-- Audience --------------------------------------------------------------------
drop policy if exists rael_follows_self on rael_follows;
create policy rael_follows_self on rael_follows
  for all using (follower_user_id = auth.uid()) with check (follower_user_id = auth.uid());

drop policy if exists rael_comments_read on rael_comments;
create policy rael_comments_read on rael_comments
  for select using (moderation_state = 'VISIBLE' or author_user_id = auth.uid());

drop policy if exists rael_comments_author_write on rael_comments;
create policy rael_comments_author_write on rael_comments
  for insert with check (author_user_id = auth.uid() and rael_can_read_asset(asset_id));

drop policy if exists rael_comments_author_edit on rael_comments;
create policy rael_comments_author_edit on rael_comments
  for update using (author_user_id = auth.uid()) with check (author_user_id = auth.uid());

drop policy if exists rael_reactions_self on rael_reactions;
create policy rael_reactions_self on rael_reactions
  for all using (user_id = auth.uid()) with check (user_id = auth.uid() and rael_can_read_asset(asset_id));

drop policy if exists rael_reports_author on rael_reports;
create policy rael_reports_author on rael_reports
  for insert with check (reporter_user_id = auth.uid());

drop policy if exists rael_reports_read_own on rael_reports;
create policy rael_reports_read_own on rael_reports
  for select using (reporter_user_id = auth.uid());

drop policy if exists rael_notifications_own on rael_notifications;
create policy rael_notifications_own on rael_notifications
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Money: a party sees its own money and nobody else's -------------------------
drop policy if exists rael_ledger_party_read on rael_ledger_entries;
create policy rael_ledger_party_read on rael_ledger_entries
  for select using (
    (party_kind = 'CREATOR' and exists (
      select 1 from rael_channels c
      where c.id::text = party_ref
        and rael_is_channel_member(c.id, array['OWNER','MANAGER','ANALYST']::rael_channel_role[])
    ))
    or (party_kind = 'BENEFICIARY' and exists (
      select 1 from rael_family_partnerships p
      join rael_consents k on k.id = p.consent_id
      where p.beneficiary_ref = party_ref
        and (k.subject_user_id = auth.uid() or k.guardian_user_id = auth.uid())
    ))
  );

drop policy if exists rael_revenue_events_read on rael_revenue_events;
create policy rael_revenue_events_read on rael_revenue_events
  for select using (
    channel_id is not null and
    rael_is_channel_member(channel_id, array['OWNER','MANAGER','ANALYST']::rael_channel_role[])
  );

drop policy if exists rael_payouts_party_read on rael_payouts;
create policy rael_payouts_party_read on rael_payouts
  for select using (
    (party_kind = 'CREATOR' and exists (
      select 1 from rael_channels c
      where c.id::text = party_ref
        and rael_is_channel_member(c.id, array['OWNER','MANAGER','ANALYST']::rael_channel_role[])
    ))
    or (party_kind = 'BENEFICIARY' and exists (
      select 1 from rael_family_partnerships p
      join rael_consents k on k.id = p.consent_id
      where p.beneficiary_ref = party_ref
        and (k.subject_user_id = auth.uid() or k.guardian_user_id = auth.uid())
    ))
  );

drop policy if exists rael_split_policies_read on rael_split_policies;
create policy rael_split_policies_read on rael_split_policies
  for select using (true);  -- split terms are never hidden from the people they bind

drop policy if exists rael_adjustments_party_read on rael_adjustments;
create policy rael_adjustments_party_read on rael_adjustments
  for select using (
    party_kind = 'CREATOR' and exists (
      select 1 from rael_channels c
      where c.id::text = party_ref
        and rael_is_channel_member(c.id, array['OWNER','MANAGER','ANALYST']::rael_channel_role[])
    )
  );

-- Access records --------------------------------------------------------------
drop policy if exists rael_entitlements_own on rael_entitlements;
create policy rael_entitlements_own on rael_entitlements
  for select using (user_id = auth.uid());

drop policy if exists rael_purchases_own on rael_purchases;
create policy rael_purchases_own on rael_purchases
  for select using (buyer_user_id = auth.uid());

drop policy if exists rael_subscriptions_own on rael_subscriptions;
create policy rael_subscriptions_own on rael_subscriptions
  for select using (subscriber_user_id = auth.uid());

drop policy if exists rael_plans_read on rael_subscription_plans;
create policy rael_plans_read on rael_subscription_plans
  for select using (plan_state = 'ACTIVE' or (channel_id is not null and
    rael_is_channel_member(channel_id, array['OWNER','MANAGER']::rael_channel_role[])));

drop policy if exists rael_asset_products_read on rael_asset_products;
create policy rael_asset_products_read on rael_asset_products
  for select using (rael_can_read_asset(asset_id));

-- Consent and partnership: the family, its guardian and nobody else -----------
drop policy if exists rael_consents_subject_read on rael_consents;
create policy rael_consents_subject_read on rael_consents
  for select using (subject_user_id = auth.uid() or guardian_user_id = auth.uid());

drop policy if exists rael_partnership_read on rael_family_partnerships;
create policy rael_partnership_read on rael_family_partnerships
  for select using (
    partnership_state in ('ACTIVE','COMPLETED') and published_at is not null
    or exists (
      select 1 from rael_consents k where k.id = consent_id
        and (k.subject_user_id = auth.uid() or k.guardian_user_id = auth.uid())
    )
  );

commit;
