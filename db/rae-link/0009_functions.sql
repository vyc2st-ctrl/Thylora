-- RAE LINK · 0009 · Governed functions (publish gate, settlement, statements)
-- Workroom: WR-RAELINK-001
--
-- These are the custody points. Publication, view capture and money settlement
-- happen here so the rule lives with the data instead of in a client that can be
-- replaced. rael_settle_revenue_event is the SQL twin of rae-link/lib/ledger.js;
-- both use the same distributable base and the same remainder rule, so a
-- statement rendered in the app equals the statement stored in the backend.

begin;

-- 1. PUBLISH GATE -------------------------------------------------------------
-- Returns every unmet prerequisite rather than a single pass/fail, so a creator
-- is never told only "not ready".
create or replace function rael_publish_gate(p_asset_id uuid)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare
  a           rael_media_assets%rowtype;
  blockers    jsonb := '[]'::jsonb;
  rights      rael_rights_records%rowtype;
  scan        rael_scan_results%rowtype;
  review      rael_moderation_reviews%rowtype;
  has_caption boolean;
  has_waiver  boolean;
  has_poster  boolean;
  has_ready_rendition boolean;
  partnership rael_family_partnerships%rowtype;
begin
  select * into a from rael_media_assets where id = p_asset_id;
  if not found then
    return jsonb_build_object('ready', false, 'blockers',
      jsonb_build_array(jsonb_build_object('code','ASSET_NOT_FOUND','detail','No such asset.')));
  end if;

  select * into rights from rael_rights_records
   where asset_id = p_asset_id and gate_state in ('PENDING','PASSED')
   order by created_at desc limit 1;
  if not found then
    blockers := blockers || jsonb_build_object('code','RIGHTS_MISSING',
      'detail','No rights record is attached to this media.','route','rights');
  elsif rights.gate_state <> 'PASSED' then
    blockers := blockers || jsonb_build_object('code','RIGHTS_NOT_PASSED',
      'detail','Rights gate is ' || rights.gate_state || '.','route','rights');
  elsif rights.term_end is not null and rights.term_end < current_date then
    blockers := blockers || jsonb_build_object('code','RIGHTS_EXPIRED',
      'detail','Licence term ended ' || rights.term_end || '.','route','rights');
  end if;

  select * into scan from rael_scan_results
   where asset_id = p_asset_id order by scanned_at desc limit 1;
  if not found then
    blockers := blockers || jsonb_build_object('code','VALIDATION_MISSING',
      'detail','File has not been scanned or validated.','route','validation');
  elsif scan.verdict <> 'CLEAN' then
    blockers := blockers || jsonb_build_object('code','VALIDATION_FAILED',
      'detail','Scanner verdict ' || scan.verdict || '.','route','validation');
  end if;

  if a.media_kind in ('VIDEO','AUDIO','LIVE') then
    select exists(select 1 from rael_media_renditions
      where asset_id = p_asset_id and rendition_state = 'READY') into has_ready_rendition;
    if not has_ready_rendition then
      blockers := blockers || jsonb_build_object('code','RENDITION_MISSING',
        'detail','No playable rendition is ready.','route','transcode');
    end if;

    select exists(select 1 from rael_media_captions
      where asset_id = p_asset_id and caption_state = 'READY') into has_caption;
    select exists(select 1 from rael_accessibility_waivers
      where asset_id = p_asset_id) into has_waiver;
    if not has_caption and not has_waiver then
      blockers := blockers || jsonb_build_object('code','CAPTIONS_MISSING',
        'detail','Timed media needs a ready caption track or a recorded accessibility waiver.',
        'route','accessibility');
    end if;
  end if;

  select exists(select 1 from rael_media_renditions
    where asset_id = p_asset_id and rendition_kind in ('POSTER','THUMBNAIL')
      and rendition_state = 'READY') into has_poster;
  if not has_poster and a.media_kind <> 'DOCUMENT' then
    blockers := blockers || jsonb_build_object('code','POSTER_MISSING',
      'detail','No poster or thumbnail is ready.','route','poster');
  end if;

  if a.title is null or length(btrim(a.title)) < 2 then
    blockers := blockers || jsonb_build_object('code','METADATA_INCOMPLETE',
      'detail','Title is required.','route','metadata');
  end if;

  select * into review from rael_moderation_reviews
   where asset_id = p_asset_id and review_stage = 'PRE_PUBLICATION'
   order by created_at desc limit 1;
  if not found then
    blockers := blockers || jsonb_build_object('code','MODERATION_MISSING',
      'detail','No pre-publication review recorded.','route','moderation');
  elsif review.verdict = 'BLOCKED' then
    blockers := blockers || jsonb_build_object('code','MODERATION_BLOCKED',
      'detail','Blocked: ' || coalesce(array_to_string(review.reasons, '; '),'no reason recorded'),
      'route','moderation');
  elsif review.verdict = 'PENDING' then
    blockers := blockers || jsonb_build_object('code','MODERATION_PENDING',
      'detail','Review has not returned a verdict.','route','moderation');
  end if;

  -- Family partnership: the beneficiary share must exist before publication.
  select p.* into partnership from rael_family_partnerships p
    join rael_partnership_assets pa on pa.partnership_id = p.id
   where pa.asset_id = p_asset_id limit 1;
  if found then
    if partnership.beneficiary_share_bp is null or partnership.beneficiary_share_bp < 1 then
      blockers := blockers || jsonb_build_object('code','BENEFICIARY_SHARE_UNDECLARED',
        'detail','Beneficiary percentage must be declared before publication.','route','partnership');
    end if;
    if exists (select 1 from rael_consents k
                where k.id = partnership.consent_id and k.revoked_at is not null) then
      blockers := blockers || jsonb_build_object('code','CONSENT_REVOKED',
        'detail','Family consent has been withdrawn.','route','partnership');
    end if;
  end if;

  return jsonb_build_object(
    'asset_id', p_asset_id,
    'pipeline_state', a.pipeline_state,
    'ready', jsonb_array_length(blockers) = 0,
    'blockers', blockers,
    'checked_at', now()
  );
end $$;

-- 2. PUBLISH ------------------------------------------------------------------
create or replace function rael_publish_asset(p_asset_id uuid, p_visibility rael_visibility default 'PUBLIC')
returns jsonb language plpgsql security definer set search_path = public as $$
declare gate jsonb; a rael_media_assets%rowtype;
begin
  select * into a from rael_media_assets where id = p_asset_id;
  if not found then raise exception 'RAE LINK: asset not found'; end if;
  if not rael_is_channel_member(a.channel_id, array['OWNER','MANAGER','EDITOR']::rael_channel_role[]) then
    raise exception 'RAE LINK: caller is not authorized to publish on this channel';
  end if;

  gate := rael_publish_gate(p_asset_id);
  if not (gate->>'ready')::boolean then
    return jsonb_build_object('published', false, 'gate', gate);
  end if;

  update rael_media_assets
     set pipeline_state = 'PUBLISHED',
         visibility_state = p_visibility,
         published_at = coalesce(published_at, now())
   where id = p_asset_id;

  insert into rael_pipeline_events(asset_id, from_state, to_state, actor_kind, actor_user_id, evidence, note)
  values (p_asset_id, a.pipeline_state, 'PUBLISHED', 'CREATOR', auth.uid(), gate, 'publish gate passed');

  -- The creator keeps perpetual re-access to their own work.
  insert into rael_entitlements(user_id, asset_id, grant_basis, is_perpetual)
  values (a.owner_user_id, p_asset_id, 'CREATOR_OWNERSHIP', true)
  on conflict do nothing;

  return jsonb_build_object('published', true, 'gate', gate);
end $$;

-- 3. VIEW CAPTURE -------------------------------------------------------------
create or replace function rael_capture_view(p_payload jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_asset uuid := (p_payload->>'asset_id')::uuid;
  v_channel uuid;
  v_seconds integer := greatest(0, coalesce((p_payload->>'watched_seconds')::integer, 0));
  v_completion integer := least(10000, greatest(0, coalesce((p_payload->>'completion_bp')::integer, 0)));
  v_country text := upper(nullif(p_payload->>'country_code',''));
  v_session text := coalesce(nullif(p_payload->>'session_key',''), 'anonymous');
begin
  select channel_id into v_channel from rael_media_assets
   where id = v_asset and pipeline_state = 'PUBLISHED';
  if v_channel is null then
    return jsonb_build_object('captured', false, 'reason', 'ASSET_NOT_PUBLISHED');
  end if;

  insert into rael_view_events(asset_id, channel_id, viewer_user_id, session_key,
                               watched_seconds, completion_bp, device_class, country_code)
  values (v_asset, v_channel, auth.uid(), left(v_session, 128), v_seconds, v_completion,
          nullif(p_payload->>'device_class',''),
          case when v_country ~ '^[A-Z]{2}$' then v_country else null end);

  insert into rael_view_rollup_daily(asset_id, day, country_code, views, watched_seconds, unique_sessions)
  values (v_asset, current_date, coalesce(nullif(v_country,''),'ZZ'), 1, v_seconds, 1)
  on conflict (asset_id, day, country_code) do update
    set views = rael_view_rollup_daily.views + 1,
        watched_seconds = rael_view_rollup_daily.watched_seconds + excluded.watched_seconds;

  return jsonb_build_object('captured', true);
end $$;

-- 4. SETTLEMENT ---------------------------------------------------------------
-- distributable base = gross - refunds - chargebacks - processor fees
--                      - tax when the platform or processor remits it.
-- Shares are floor(base * bp / 10000); the remainder is handed out one minor
-- unit at a time in beneficiary -> creator -> partner -> referrer -> platform
-- order so rounding never disappears and never favours the platform.
create or replace function rael_settle_revenue_event(p_event_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  ev        rael_revenue_events%rowtype;
  pol       rael_split_policies%rowtype;
  base      bigint;
  tax_out   bigint;
  parties   text[] := array['BENEFICIARY','CREATOR','PARTNER','PLATFORM'];
  party     text;
  bp        integer;
  amt       bigint;
  allocated bigint := 0;
  remainder bigint;
  state     text;
  hold      text;
  result    jsonb := '[]'::jsonb;
  idx       integer;
  ref       text;
begin
  select * into ev from rael_revenue_events where id = p_event_id;
  if not found then raise exception 'RAE LINK: revenue event not found'; end if;

  select * into pol from rael_split_policies
   where policy_state = 'ACTIVE'
     and effective_from <= ev.occurred_at
     and (effective_to is null or effective_to > ev.occurred_at)
     and (
       (scope_kind = 'ASSET'   and scope_ref = ev.asset_id::text)
       or (scope_kind = 'CHANNEL' and scope_ref = ev.channel_id::text)
       or (scope_kind = 'LANE'    and scope_ref = ev.lane_code)
     )
   order by case scope_kind when 'ASSET' then 1 when 'CHANNEL' then 2 else 3 end,
            effective_from desc
   limit 1;

  if not found then
    return jsonb_build_object('settled', false, 'reason', 'NO_ACTIVE_SPLIT_POLICY',
      'detail','Declare a split policy before settling this lane.');
  end if;

  tax_out := case when ev.tax_remitted_by in ('PLATFORM','PROCESSOR') then ev.tax_minor else 0 end;
  base := greatest(0, ev.gross_minor - ev.refund_minor - ev.chargeback_minor
                      - ev.processor_fee_minor - tax_out);

  if ev.tax_state = 'UNRESOLVED' then
    state := 'HELD'; hold := 'TAX_STATE_UNRESOLVED';
  else
    state := 'PAYABLE'; hold := null;
  end if;

  -- Floor pass.
  foreach party in array parties loop
    bp := case party
            when 'BENEFICIARY' then pol.beneficiary_share_bp
            when 'CREATOR'     then pol.creator_share_bp
            when 'PARTNER'     then pol.partner_share_bp
            else pol.platform_share_bp end;
    if bp = 0 then continue; end if;
    amt := (base * bp) / 10000;
    allocated := allocated + amt;
    ref := case party
             when 'BENEFICIARY' then coalesce(pol.beneficiary_ref,'UNNAMED_BENEFICIARY')
             when 'CREATOR'     then coalesce(ev.channel_id::text,'UNASSIGNED_CHANNEL')
             when 'PARTNER'     then coalesce(pol.beneficiary_ref,'PARTNER')
             else 'THYLORA_PLATFORM' end;
    result := result || jsonb_build_object('party_kind', party, 'party_ref', ref,
                                           'share_bp', bp, 'amount_minor', amt);
  end loop;

  -- Remainder pass, in declared priority order.
  remainder := base - allocated;
  idx := 0;
  while remainder > 0 and jsonb_array_length(result) > 0 loop
    result := jsonb_set(result,
      array[idx::text, 'amount_minor'],
      to_jsonb(((result->idx->>'amount_minor')::bigint) + 1));
    result := jsonb_set(result, array[idx::text, 'rounding_minor'],
      to_jsonb(coalesce((result->idx->>'rounding_minor')::bigint, 0) + 1));
    remainder := remainder - 1;
    idx := (idx + 1) % jsonb_array_length(result);
  end loop;

  delete from rael_ledger_entries where revenue_event_id = p_event_id and entry_state <> 'PAID';

  insert into rael_ledger_entries(revenue_event_id, split_policy_id, party_kind, party_ref,
                                  currency, base_minor, share_bp, amount_minor, rounding_minor,
                                  entry_state, hold_reason)
  select p_event_id, pol.id, (e->>'party_kind')::rael_party_kind, e->>'party_ref',
         ev.currency, base, (e->>'share_bp')::integer, (e->>'amount_minor')::bigint,
         coalesce((e->>'rounding_minor')::bigint, 0), state, hold
    from jsonb_array_elements(result) e
  on conflict (revenue_event_id, party_kind, party_ref) do update
    set amount_minor = excluded.amount_minor,
        base_minor = excluded.base_minor,
        share_bp = excluded.share_bp,
        entry_state = excluded.entry_state,
        hold_reason = excluded.hold_reason;

  update rael_revenue_events
     set event_state = 'SETTLED', settled_at = now()
   where id = p_event_id;

  return jsonb_build_object(
    'settled', true,
    'event_code', ev.event_code,
    'currency', ev.currency,
    'gross_minor', ev.gross_minor,
    'processor_fee_minor', ev.processor_fee_minor,
    'refund_minor', ev.refund_minor,
    'chargeback_minor', ev.chargeback_minor,
    'tax_state', ev.tax_state,
    'tax_minor', ev.tax_minor,
    'tax_remitted_by', ev.tax_remitted_by,
    'distributable_base_minor', base,
    'entries', result,
    'entry_state', state,
    'hold_reason', hold,
    'policy_code', pol.policy_code
  );
end $$;

-- 5. CREATOR STATEMENT --------------------------------------------------------
-- Every field the directive requires, for one channel and one period.
create or replace function rael_creator_statement(
  p_channel_id uuid, p_from date, p_to date)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare out jsonb;
begin
  if not rael_is_channel_member(p_channel_id, array['OWNER','MANAGER','ANALYST']::rael_channel_role[]) then
    raise exception 'RAE LINK: caller is not authorized to read this channel statement';
  end if;

  select jsonb_build_object(
    'channel_id', p_channel_id,
    'period_start', p_from,
    'period_end', p_to,
    'lanes', coalesce(jsonb_agg(lane_row order by lane_row->>'lane_code'), '[]'::jsonb)
  ) into out
  from (
    select jsonb_build_object(
      'lane_code', e.lane_code,
      'currency', e.currency,
      'gross_minor', sum(e.gross_minor),
      'processor_fee_minor', sum(e.processor_fee_minor),
      'refund_minor', sum(e.refund_minor),
      'chargeback_minor', sum(e.chargeback_minor),
      'tax_minor', sum(e.tax_minor),
      'tax_states', jsonb_agg(distinct e.tax_state),
      'platform_share_minor', coalesce(sum(l.amount_minor) filter (where l.party_kind = 'PLATFORM'), 0),
      'creator_share_minor',  coalesce(sum(l.amount_minor) filter (where l.party_kind = 'CREATOR'), 0),
      'beneficiary_share_minor', coalesce(sum(l.amount_minor) filter (where l.party_kind = 'BENEFICIARY'), 0),
      'held_minor', coalesce(sum(l.amount_minor) filter (where l.entry_state = 'HELD'), 0),
      'net_payable_minor', coalesce(sum(l.amount_minor)
        filter (where l.party_kind = 'CREATOR' and l.entry_state in ('PAYABLE','PAID')), 0)
    ) as lane_row
    from rael_revenue_events e
    left join rael_ledger_entries l on l.revenue_event_id = e.id
    where e.channel_id = p_channel_id
      and e.occurred_at >= p_from
      and e.occurred_at < (p_to + 1)
    group by e.lane_code, e.currency
  ) lanes;

  return coalesce(out, jsonb_build_object('channel_id', p_channel_id, 'lanes', '[]'::jsonb));
end $$;

-- 6. PUBLIC FEED AND SEARCH ---------------------------------------------------
create or replace function rael_public_feed(p_limit integer default 24, p_before timestamptz default null)
returns jsonb language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(row), '[]'::jsonb) from (
    select jsonb_build_object(
      'asset_id', a.id,
      'asset_code', a.asset_code,
      'title', a.title,
      'description', left(coalesce(a.description,''), 400),
      'media_kind', a.media_kind,
      'duration_seconds', a.duration_seconds,
      'published_at', a.published_at,
      'channel', jsonb_build_object(
        'id', c.id, 'name', c.name, 'slug', c.slug,
        'channel_class', c.channel_class,
        'world_status', c.world_status,
        'simulated_disclosure', c.simulated_disclosure)
    ) as row
    from rael_media_assets a
    join rael_channels c on c.id = a.channel_id
    where a.pipeline_state = 'PUBLISHED'
      and a.visibility_state = 'PUBLIC'
      and c.channel_state = 'ACTIVE'
      and (p_before is null or a.published_at < p_before)
    order by a.published_at desc
    limit least(greatest(p_limit, 1), 100)
  ) t;
$$;

create or replace function rael_search(p_query text, p_limit integer default 24)
returns jsonb language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(row), '[]'::jsonb) from (
    select jsonb_build_object(
      'asset_id', a.id, 'title', a.title, 'media_kind', a.media_kind,
      'published_at', a.published_at,
      'channel_name', c.name, 'channel_slug', c.slug,
      'world_status', c.world_status,
      'rank', ts_rank(a.search_document, websearch_to_tsquery('simple', p_query))
    ) as row
    from rael_media_assets a
    join rael_channels c on c.id = a.channel_id
    where a.pipeline_state = 'PUBLISHED'
      and a.visibility_state = 'PUBLIC'
      and a.search_document @@ websearch_to_tsquery('simple', p_query)
    order by ts_rank(a.search_document, websearch_to_tsquery('simple', p_query)) desc
    limit least(greatest(p_limit, 1), 100)
  ) t;
$$;

grant execute on function rael_public_feed(integer, timestamptz) to anon, authenticated;
grant execute on function rael_search(text, integer) to anon, authenticated;
grant execute on function rael_capture_view(jsonb) to anon, authenticated;
grant execute on function rael_publish_gate(uuid) to authenticated;
grant execute on function rael_publish_asset(uuid, rael_visibility) to authenticated;
grant execute on function rael_creator_statement(uuid, date, date) to authenticated;
-- Settlement is deliberately NOT granted to authenticated. Money is moved by the
-- service role through a scheduled job, never by a client session.
revoke execute on function rael_settle_revenue_event(uuid) from public, anon, authenticated;

commit;
