-- RAE LINK · 0011 · MVP slice: channel creation, upload custody, channel page,
--                    watch page, follows, governed comments and reactions
-- Workroom: WR-RAELINK-001
--
-- Additive. Creates no table that 0001–0010 already created; adds three small
-- tables the slice needs and the governed functions the surface calls. As with
-- every file here, this is reviewable and is NOT applied to the live backend.
--
-- The rule is enforced here, not only in the browser: screening, rate limiting
-- and visibility are decided server-side so a different client cannot bypass them.

begin;

-- Comment moderation history. A state change without a reason is not a decision.
create table if not exists rael_comment_moderation (
  id             bigserial primary key,
  comment_id     uuid not null references rael_comments(id) on delete cascade,
  from_state     text,
  to_state       text not null,
  reason_codes   text[] not null default '{}',
  reason_note    text,
  actor_kind     text not null default 'SYSTEM'
                 check (actor_kind in ('SYSTEM','AUTHOR','CHANNEL_STAFF','MODERATOR','CHAIRMAN')),
  actor_user_id  uuid references auth.users(id),
  created_at     timestamptz not null default now()
);

create index if not exists rael_comment_moderation_idx on rael_comment_moderation(comment_id, id desc);

alter table rael_comments add column if not exists screen_reasons text[] not null default '{}';
alter table rael_media_assets add column if not exists poster_data_url text;
alter table rael_media_assets add column if not exists width integer;
alter table rael_media_assets add column if not exists height integer;

alter table rael_comment_moderation enable row level security;

drop policy if exists rael_comment_moderation_read on rael_comment_moderation;
create policy rael_comment_moderation_read on rael_comment_moderation
  for select using (exists (
    select 1 from rael_comments c where c.id = comment_id and c.author_user_id = auth.uid()
  ));

-- 1. CHANNEL CREATION ---------------------------------------------------------
-- Channel truth is checked before insert so the creator gets a sentence, not a
-- raw constraint violation. The constraint still stands behind it.
create or replace function rael_create_channel(p_payload jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_user uuid := auth.uid();
  v_class rael_channel_class;
  v_world rael_world_status;
  v_slug text := lower(btrim(coalesce(p_payload->>'slug','')));
  v_name text := btrim(coalesce(p_payload->>'name',''));
  v_disclosure text := nullif(btrim(coalesce(p_payload->>'simulated_disclosure','')),'');
  v_code text;
  v_id uuid;
  problems jsonb := '[]'::jsonb;
begin
  if v_user is null then
    return jsonb_build_object('created', false, 'code','NOT_SIGNED_IN',
      'problems', jsonb_build_array(jsonb_build_object('code','NOT_SIGNED_IN',
        'detail','Sign in before creating a channel.')));
  end if;

  begin
    v_class := (p_payload->>'channel_class')::rael_channel_class;
  exception when others then
    problems := problems || jsonb_build_object('code','CLASS_UNKNOWN','detail','Choose a channel class.');
  end;

  if v_name = '' then
    problems := problems || jsonb_build_object('code','NAME_REQUIRED','detail','A channel needs a name.');
  end if;
  if v_slug !~ '^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])$' then
    problems := problems || jsonb_build_object('code','SLUG_INVALID',
      'detail','Use 3–40 characters: lowercase letters, numbers and hyphens.');
  elsif exists (select 1 from rael_channels where slug = v_slug) then
    problems := problems || jsonb_build_object('code','SLUG_TAKEN','detail','That channel address is already used.');
  end if;

  v_world := case
    when v_class in ('EDEREARIAH_INHABITANT','WORLD_CHANNEL') then 'WORLD_SIMULATED'::rael_world_status
    else 'EARTH_REAL'::rael_world_status end;

  if v_world = 'WORLD_SIMULATED' and (v_disclosure is null or length(v_disclosure) < 12) then
    problems := problems || jsonb_build_object('code','DISCLOSURE_MISSING',
      'detail','A world channel needs a visible disclosure that its media is simulated world media.');
  end if;
  if v_world = 'EARTH_REAL' and v_disclosure is not null then
    problems := problems || jsonb_build_object('code','DISCLOSURE_ON_EARTH_CHANNEL',
      'detail','An Earth channel must not carry a simulated-media disclosure.');
  end if;

  if jsonb_array_length(problems) > 0 then
    return jsonb_build_object('created', false, 'problems', problems);
  end if;

  v_code := 'RAEL-CH-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,8));
  insert into rael_channels(channel_code, slug, owner_user_id, name, channel_class, world_status,
                            simulated_disclosure, description, channel_state)
  values (v_code, v_slug, v_user, v_name, v_class, v_world, v_disclosure,
          nullif(btrim(coalesce(p_payload->>'description','')),''), 'ACTIVE')
  returning id into v_id;

  insert into rael_channel_members(channel_id, user_id, member_role, granted_by)
  values (v_id, v_user, 'OWNER', v_user)
  on conflict do nothing;

  return jsonb_build_object('created', true, 'channel_id', v_id, 'channel_code', v_code,
                            'slug', v_slug, 'world_status', v_world);
end $$;

-- 2. UPLOAD CUSTODY -----------------------------------------------------------
-- Starting an upload twice returns the SAME open session. That is what makes a
-- reload resume instead of restart.
create or replace function rael_start_upload(p_payload jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_asset uuid := (p_payload->>'asset_id')::uuid;
  v_total bigint := (p_payload->>'total_bytes')::bigint;
  v_chunk integer := coalesce((p_payload->>'chunk_size_bytes')::integer, 8388608);
  v_provider text := coalesce(nullif(p_payload->>'provider',''),'UNCONFIGURED');
  v_channel uuid;
  v_session rael_upload_sessions%rowtype;
begin
  select channel_id into v_channel from rael_media_assets where id = v_asset;
  if v_channel is null then
    return jsonb_build_object('started', false, 'code','ASSET_NOT_FOUND');
  end if;
  if not rael_is_channel_member(v_channel, array['OWNER','MANAGER','EDITOR','UPLOADER']::rael_channel_role[]) then
    return jsonb_build_object('started', false, 'code','NOT_AUTHORIZED');
  end if;
  if v_total is null or v_total <= 0 then
    return jsonb_build_object('started', false, 'code','SIZE_REQUIRED');
  end if;

  select * into v_session from rael_upload_sessions
   where asset_id = v_asset and session_state in ('OPEN','PAUSED')
   order by created_at desc limit 1;

  if found then
    update rael_upload_sessions
       set last_heartbeat_at = now(), session_state = 'OPEN'
     where id = v_session.id
    returning * into v_session;
    return jsonb_build_object('started', true, 'resumed', true,
      'session_id', v_session.id, 'received_chunks', to_jsonb(v_session.received_chunks),
      'received_bytes', v_session.received_bytes, 'chunk_size_bytes', v_session.chunk_size_bytes,
      'total_bytes', v_session.total_bytes, 'provider', v_session.provider);
  end if;

  insert into rael_upload_sessions(asset_id, provider, total_bytes, chunk_size_bytes,
                                   upload_ref, session_state)
  values (v_asset, v_provider, v_total, v_chunk, nullif(p_payload->>'upload_ref',''), 'OPEN')
  returning * into v_session;

  update rael_media_assets set pipeline_state = 'UPLOAD', byte_size = v_total
   where id = v_asset and pipeline_state in ('INPUT','RIGHTS_GATE');

  return jsonb_build_object('started', true, 'resumed', false,
    'session_id', v_session.id, 'received_chunks', '[]'::jsonb, 'received_bytes', 0,
    'chunk_size_bytes', v_session.chunk_size_bytes, 'total_bytes', v_session.total_bytes,
    'provider', v_session.provider);
end $$;

create or replace function rael_record_chunk(p_session_id uuid, p_chunk_index integer)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_session rael_upload_sessions%rowtype; v_channel uuid; v_size integer; v_count integer;
begin
  select * into v_session from rael_upload_sessions where id = p_session_id;
  if not found then return jsonb_build_object('recorded', false, 'code','SESSION_NOT_FOUND'); end if;
  select channel_id into v_channel from rael_media_assets where id = v_session.asset_id;
  if not rael_is_channel_member(v_channel, array['OWNER','MANAGER','EDITOR','UPLOADER']::rael_channel_role[]) then
    return jsonb_build_object('recorded', false, 'code','NOT_AUTHORIZED');
  end if;

  if p_chunk_index = any(v_session.received_chunks) then
    return jsonb_build_object('recorded', true, 'duplicate', true,
      'received_chunks', to_jsonb(v_session.received_chunks), 'received_bytes', v_session.received_bytes);
  end if;

  v_count := ceil(v_session.total_bytes::numeric / v_session.chunk_size_bytes);
  if p_chunk_index < 0 or p_chunk_index >= v_count then
    return jsonb_build_object('recorded', false, 'code','CHUNK_OUT_OF_RANGE');
  end if;
  v_size := least(v_session.chunk_size_bytes,
                  v_session.total_bytes - (p_chunk_index::bigint * v_session.chunk_size_bytes));

  update rael_upload_sessions
     set received_chunks = array_append(received_chunks, p_chunk_index),
         received_bytes = received_bytes + v_size,
         last_heartbeat_at = now()
   where id = p_session_id
  returning * into v_session;

  return jsonb_build_object('recorded', true, 'duplicate', false,
    'received_chunks', to_jsonb(v_session.received_chunks),
    'received_bytes', v_session.received_bytes,
    'percent', floor((v_session.received_bytes::numeric / v_session.total_bytes) * 100));
end $$;

create or replace function rael_complete_upload(p_payload jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_session rael_upload_sessions%rowtype; v_channel uuid; v_asset uuid; v_expected integer;
begin
  select * into v_session from rael_upload_sessions where id = (p_payload->>'session_id')::uuid;
  if not found then return jsonb_build_object('completed', false, 'code','SESSION_NOT_FOUND'); end if;
  v_asset := v_session.asset_id;
  select channel_id into v_channel from rael_media_assets where id = v_asset;
  if not rael_is_channel_member(v_channel, array['OWNER','MANAGER','EDITOR','UPLOADER']::rael_channel_role[]) then
    return jsonb_build_object('completed', false, 'code','NOT_AUTHORIZED');
  end if;

  v_expected := ceil(v_session.total_bytes::numeric / v_session.chunk_size_bytes);
  if array_length(v_session.received_chunks, 1) is distinct from v_expected then
    return jsonb_build_object('completed', false, 'code','INCOMPLETE',
      'received', coalesce(array_length(v_session.received_chunks,1),0), 'expected', v_expected,
      'detail','Some chunks are still missing. Resume rather than restart.');
  end if;

  update rael_upload_sessions set session_state = 'COMPLETE' where id = v_session.id;
  update rael_media_assets
     set storage_provider = v_session.provider,
         storage_key = nullif(p_payload->>'storage_key',''),
         checksum_sha256 = nullif(p_payload->>'checksum_sha256',''),
         pipeline_state = 'VALIDATION'
   where id = v_asset;

  return jsonb_build_object('completed', true, 'asset_id', v_asset, 'next_state','VALIDATION');
end $$;

-- Structural validation result. Explicitly NOT a malware verdict: the scanner
-- name is recorded so nobody later reads this as a clean bill of health.
create or replace function rael_record_validation(p_payload jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_asset uuid := (p_payload->>'asset_id')::uuid; v_channel uuid; v_verdict text;
begin
  select channel_id into v_channel from rael_media_assets where id = v_asset;
  if v_channel is null then return jsonb_build_object('recorded', false, 'code','ASSET_NOT_FOUND'); end if;
  if not rael_is_channel_member(v_channel, array['OWNER','MANAGER','EDITOR','UPLOADER']::rael_channel_role[]) then
    return jsonb_build_object('recorded', false, 'code','NOT_AUTHORIZED');
  end if;
  v_verdict := coalesce(p_payload->>'verdict','ERROR');

  insert into rael_scan_results(asset_id, scanner, verdict, declared_mime, detected_mime, details)
  values (v_asset, coalesce(p_payload->>'scanner','rae-link-structural-validation'),
          case when v_verdict in ('CLEAN','INFECTED','UNSUPPORTED','ERROR') then v_verdict else 'ERROR' end,
          nullif(p_payload->>'declared_mime',''), nullif(p_payload->>'detected_mime',''),
          coalesce(p_payload->'details','{}'::jsonb) ||
            jsonb_build_object('malware_scanned', false,
                               'note','Structural validation only. Malware scanning is a separate provider stage.'));

  if v_verdict = 'CLEAN' then
    update rael_media_assets set pipeline_state = 'METADATA'
     where id = v_asset and pipeline_state = 'VALIDATION';
  else
    update rael_media_assets set pipeline_state = 'BLOCKED' where id = v_asset;
  end if;

  return jsonb_build_object('recorded', true, 'verdict', v_verdict);
end $$;

-- 3. CHANNEL PAGE -------------------------------------------------------------
create or replace function rael_channel_page(p_slug text)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare c rael_channels%rowtype; v_user uuid := auth.uid(); v_staff boolean;
begin
  select * into c from rael_channels where slug = lower(btrim(p_slug));
  if not found then return jsonb_build_object('found', false); end if;
  v_staff := rael_is_channel_member(c.id, array['OWNER','MANAGER','EDITOR','UPLOADER','ANALYST','VIEWER']::rael_channel_role[]);
  if c.channel_state <> 'ACTIVE' and not v_staff then
    return jsonb_build_object('found', false);
  end if;

  return jsonb_build_object(
    'found', true,
    'channel', jsonb_build_object(
      'id', c.id, 'slug', c.slug, 'name', c.name, 'description', c.description,
      'channel_class', c.channel_class, 'world_status', c.world_status,
      'simulated_disclosure', c.simulated_disclosure, 'created_at', c.created_at,
      'is_staff', v_staff),
    'followers', (select count(*) from rael_follows f where f.channel_id = c.id and f.follow_state = 'ACTIVE'),
    'is_following', (v_user is not null and exists (
      select 1 from rael_follows f where f.channel_id = c.id and f.follower_user_id = v_user and f.follow_state = 'ACTIVE')),
    'media', coalesce((
      select jsonb_agg(jsonb_build_object(
        'asset_id', a.id, 'title', a.title, 'media_kind', a.media_kind,
        'duration_seconds', a.duration_seconds, 'published_at', a.published_at,
        'visibility_state', a.visibility_state, 'pipeline_state', a.pipeline_state,
        'poster_data_url', a.poster_data_url) order by coalesce(a.published_at, a.created_at) desc)
      from rael_media_assets a
      where a.channel_id = c.id
        and (
          (a.pipeline_state = 'PUBLISHED' and a.visibility_state in ('PUBLIC','UNLISTED'))
          or v_staff
        )), '[]'::jsonb)
  );
end $$;

-- 4. WATCH PAGE ---------------------------------------------------------------
create or replace function rael_watch_page(p_asset_id uuid)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare a rael_media_assets%rowtype; c rael_channels%rowtype; v_user uuid := auth.uid();
begin
  select * into a from rael_media_assets where id = p_asset_id;
  if not found then return jsonb_build_object('found', false); end if;
  if not rael_can_read_asset(p_asset_id) then
    return jsonb_build_object('found', false, 'code','NOT_AUTHORIZED',
      'detail','This media is not published, or your access does not reach it.');
  end if;
  select * into c from rael_channels where id = a.channel_id;

  return jsonb_build_object(
    'found', true,
    'asset', jsonb_build_object(
      'asset_id', a.id, 'asset_code', a.asset_code, 'title', a.title,
      'description', a.description, 'media_kind', a.media_kind, 'language', a.language,
      'duration_seconds', a.duration_seconds, 'width', a.width, 'height', a.height,
      'published_at', a.published_at, 'visibility_state', a.visibility_state,
      'pipeline_state', a.pipeline_state, 'poster_data_url', a.poster_data_url,
      'version_no', a.version_no),
    'channel', jsonb_build_object(
      'id', c.id, 'slug', c.slug, 'name', c.name,
      'channel_class', c.channel_class, 'world_status', c.world_status,
      'simulated_disclosure', c.simulated_disclosure,
      'is_following', (v_user is not null and exists (
        select 1 from rael_follows f where f.channel_id = c.id
          and f.follower_user_id = v_user and f.follow_state = 'ACTIVE'))),
    'renditions', coalesce((select jsonb_agg(jsonb_build_object(
        'kind', r.rendition_kind, 'state', r.rendition_state, 'playback_url', r.playback_url,
        'width', r.width, 'height', r.height))
      from rael_media_renditions r where r.asset_id = a.id and r.rendition_state = 'READY'), '[]'::jsonb),
    'captions', coalesce((select jsonb_agg(jsonb_build_object(
        'language', k.language, 'kind', k.caption_kind, 'source', k.caption_source,
        'is_default', k.is_default))
      from rael_media_captions k where k.asset_id = a.id and k.caption_state = 'READY'), '[]'::jsonb),
    'reactions', coalesce((select jsonb_object_agg(reaction_kind, n) from (
        select reaction_kind, count(*) as n from rael_reactions
         where asset_id = a.id group by reaction_kind) t), '{}'::jsonb),
    'my_reactions', coalesce((select jsonb_agg(reaction_kind) from rael_reactions
        where asset_id = a.id and user_id = v_user), '[]'::jsonb),
    'rights', (select jsonb_build_object('ownership_basis', r.ownership_basis, 'gate_state', r.gate_state)
        from rael_rights_records r where r.asset_id = a.id
         and r.gate_state in ('PASSED','PENDING') order by r.created_at desc limit 1)
  );
end $$;

-- 5. FOLLOW / REACT -----------------------------------------------------------
create or replace function rael_toggle_follow(p_channel_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_user uuid := auth.uid(); v_state rael_record_state;
begin
  if v_user is null then return jsonb_build_object('ok', false, 'code','NOT_SIGNED_IN'); end if;
  if not exists (select 1 from rael_channels where id = p_channel_id and channel_state = 'ACTIVE') then
    return jsonb_build_object('ok', false, 'code','CHANNEL_NOT_FOUND');
  end if;

  select follow_state into v_state from rael_follows
   where channel_id = p_channel_id and follower_user_id = v_user;

  if not found then
    insert into rael_follows(follower_user_id, channel_id, follow_state)
    values (v_user, p_channel_id, 'ACTIVE');
    v_state := 'ACTIVE';
  else
    v_state := case when v_state = 'ACTIVE' then 'ARCHIVED'::rael_record_state else 'ACTIVE'::rael_record_state end;
    update rael_follows set follow_state = v_state
     where channel_id = p_channel_id and follower_user_id = v_user;
  end if;

  return jsonb_build_object('ok', true, 'following', v_state = 'ACTIVE',
    'followers', (select count(*) from rael_follows where channel_id = p_channel_id and follow_state = 'ACTIVE'));
end $$;

create or replace function rael_set_reaction(p_asset_id uuid, p_kind text, p_on boolean default true)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_user uuid := auth.uid();
begin
  if v_user is null then return jsonb_build_object('ok', false, 'code','NOT_SIGNED_IN'); end if;
  if p_kind not in ('LIKE','APPRECIATE','LEARNED','MOVED','QUESTION') then
    return jsonb_build_object('ok', false, 'code','UNKNOWN_REACTION');
  end if;
  if not rael_can_read_asset(p_asset_id) then
    return jsonb_build_object('ok', false, 'code','NOT_AUTHORIZED');
  end if;

  if p_on then
    insert into rael_reactions(asset_id, user_id, reaction_kind)
    values (p_asset_id, v_user, p_kind) on conflict do nothing;
  else
    delete from rael_reactions where asset_id = p_asset_id and user_id = v_user and reaction_kind = p_kind;
  end if;

  return jsonb_build_object('ok', true, 'kind', p_kind, 'on', p_on,
    'count', (select count(*) from rael_reactions where asset_id = p_asset_id and reaction_kind = p_kind));
end $$;

-- 6. GOVERNED COMMENTS --------------------------------------------------------
-- Screening mirrors rae-link/lib/moderation.js. Structural signals only.
create or replace function rael_screen_comment(p_body text, p_recent jsonb)
returns jsonb language plpgsql immutable as $$
declare
  v_text text := btrim(coalesce(p_body,''));
  reasons jsonb := '[]'::jsonb;
  v_links integer;
  v_letters integer;
  v_upper integer;
begin
  if length(v_text) = 0 then
    return jsonb_build_object('state','REJECTED','accepted', false,
      'reasons', jsonb_build_array(jsonb_build_object('code','EMPTY','detail','A comment cannot be empty.')));
  end if;
  if length(v_text) > 4000 then
    return jsonb_build_object('state','REJECTED','accepted', false,
      'reasons', jsonb_build_array(jsonb_build_object('code','TOO_LONG','detail','Comments are limited to 4000 characters.')));
  end if;

  select count(*) into v_links from regexp_matches(v_text, 'https?://[^\s]+', 'g');
  if v_links > 2 then
    reasons := reasons || jsonb_build_object('code','LINK_FLOOD','detail','More than two links. Held for review.');
  end if;

  if exists (select 1 from jsonb_array_elements_text(coalesce(p_recent,'[]'::jsonb)) r where btrim(r) = v_text) then
    reasons := reasons || jsonb_build_object('code','DUPLICATE','detail','This repeats a comment you just posted. Held for review.');
  end if;

  v_letters := length(regexp_replace(v_text, '[^a-zA-Z]', '', 'g'));
  v_upper   := length(regexp_replace(v_text, '[^A-Z]', '', 'g'));
  if v_letters >= 20 and (v_upper::numeric / v_letters) > 0.8 then
    reasons := reasons || jsonb_build_object('code','SHOUTING','detail','Almost all capitals. Held for review.');
  end if;

  return jsonb_build_object(
    'state', case when jsonb_array_length(reasons) > 0 then 'HELD' else 'VISIBLE' end,
    'accepted', true, 'reasons', reasons);
end $$;

create or replace function rael_post_comment(p_payload jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_user uuid := auth.uid();
  v_asset uuid := (p_payload->>'asset_id')::uuid;
  v_body text := coalesce(p_payload->>'body','');
  v_parent uuid := nullif(p_payload->>'parent_id','')::uuid;
  v_recent jsonb;
  v_screen jsonb;
  v_window timestamptz := date_trunc('minute', now());
  v_hits integer;
  v_id uuid;
  v_codes text[];
begin
  if v_user is null then return jsonb_build_object('posted', false, 'code','NOT_SIGNED_IN'); end if;
  if not rael_can_read_asset(v_asset) then
    return jsonb_build_object('posted', false, 'code','NOT_AUTHORIZED');
  end if;

  -- Rate limit before anything is written.
  insert into rael_rate_counters(actor_key, action_key, window_start, hits)
  values (v_user::text, 'comment', v_window, 1)
  on conflict (actor_key, action_key, window_start) do update set hits = rael_rate_counters.hits + 1
  returning hits into v_hits;

  if v_hits > 20 then
    return jsonb_build_object('posted', false, 'code','RATE_LIMITED',
      'detail','Too many comments in one minute. Nothing was lost — try again shortly.');
  end if;

  select coalesce(jsonb_agg(body), '[]'::jsonb) into v_recent from (
    select body from rael_comments
     where author_user_id = v_user and created_at > now() - interval '10 minutes'
     order by created_at desc limit 10) r;

  v_screen := rael_screen_comment(v_body, v_recent);
  if not (v_screen->>'accepted')::boolean then
    return jsonb_build_object('posted', false, 'code','REJECTED', 'reasons', v_screen->'reasons');
  end if;

  if v_hits > 6 then
    v_screen := jsonb_set(v_screen, '{state}', '"HELD"') ;
    v_screen := jsonb_set(v_screen, '{reasons}',
      (v_screen->'reasons') || jsonb_build_object('code','RATE','detail','Many comments in one minute. Held for review.'));
  end if;

  select array_agg(r->>'code') into v_codes from jsonb_array_elements(v_screen->'reasons') r;

  insert into rael_comments(asset_id, author_user_id, parent_id, body, moderation_state, screen_reasons)
  values (v_asset, v_user, v_parent, btrim(v_body), v_screen->>'state', coalesce(v_codes,'{}'))
  returning id into v_id;

  insert into rael_comment_moderation(comment_id, from_state, to_state, reason_codes, actor_kind)
  values (v_id, null, v_screen->>'state', coalesce(v_codes,'{}'), 'SYSTEM');

  return jsonb_build_object('posted', true, 'comment_id', v_id,
    'moderation_state', v_screen->>'state', 'reasons', v_screen->'reasons');
end $$;

-- Visibility decided server-side: an author always sees their own held comment,
-- channel staff see held comments, nobody else does. No silent shadow ban.
create or replace function rael_list_comments(p_asset_id uuid, p_limit integer default 50)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare v_user uuid := auth.uid(); v_staff boolean; v_channel uuid;
begin
  if not rael_can_read_asset(p_asset_id) then
    return jsonb_build_object('ok', false, 'code','NOT_AUTHORIZED');
  end if;
  select channel_id into v_channel from rael_media_assets where id = p_asset_id;
  v_staff := rael_is_channel_member(v_channel, array['OWNER','MANAGER','EDITOR']::rael_channel_role[]);

  return jsonb_build_object('ok', true, 'is_staff', v_staff, 'comments', coalesce((
    select jsonb_agg(jsonb_build_object(
      'comment_id', c.id, 'body', c.body, 'created_at', c.created_at,
      'parent_id', c.parent_id,
      'author', coalesce(p.display_name, 'Member'),
      'author_handle', p.handle,
      'is_mine', c.author_user_id = v_user,
      'moderation_state', c.moderation_state,
      'notice', case
        when c.moderation_state = 'HELD' and c.author_user_id = v_user
          then 'Only you can see this while it is under review.'
        when c.moderation_state = 'HELD' and v_staff then 'Held for review.'
        else null end
    ) order by c.created_at desc)
    from rael_comments c
    left join rael_profiles p on p.user_id = c.author_user_id
    where c.asset_id = p_asset_id
      and (c.moderation_state = 'VISIBLE'
           or (c.moderation_state = 'HELD' and (c.author_user_id = v_user or v_staff)))
    limit least(greatest(p_limit,1), 200)
  ), '[]'::jsonb));
end $$;

create or replace function rael_moderate_comment(p_comment_id uuid, p_state text, p_note text default null)
returns jsonb language plpgsql security definer set search_path = public as $$
declare c rael_comments%rowtype; v_channel uuid; v_allowed text[];
begin
  select * into c from rael_comments where id = p_comment_id;
  if not found then return jsonb_build_object('ok', false, 'code','COMMENT_NOT_FOUND'); end if;
  select channel_id into v_channel from rael_media_assets where id = c.asset_id;
  if not rael_is_channel_member(v_channel, array['OWNER','MANAGER','EDITOR']::rael_channel_role[]) then
    return jsonb_build_object('ok', false, 'code','NOT_AUTHORIZED');
  end if;

  v_allowed := case c.moderation_state
    when 'VISIBLE' then array['HELD','HIDDEN','REMOVED']
    when 'HELD'    then array['VISIBLE','HIDDEN','REMOVED']
    when 'HIDDEN'  then array['VISIBLE','REMOVED']
    else array[]::text[] end;

  if not (p_state = any(v_allowed)) then
    return jsonb_build_object('ok', false, 'code','TRANSITION_REFUSED',
      'detail', format('%s cannot move to %s.', c.moderation_state, p_state));
  end if;

  update rael_comments set moderation_state = p_state where id = p_comment_id;
  insert into rael_comment_moderation(comment_id, from_state, to_state, reason_note, actor_kind, actor_user_id)
  values (p_comment_id, c.moderation_state, p_state, p_note, 'CHANNEL_STAFF', auth.uid());

  return jsonb_build_object('ok', true, 'from', c.moderation_state, 'to', p_state);
end $$;

create or replace function rael_submit_report(p_payload jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_code text; v_reason text := coalesce(p_payload->>'reason_code','OTHER');
begin
  if v_reason not in ('RIGHTS_CLAIM','PRIVACY','IMPERSONATION','HARASSMENT','SAFETY',
                      'MISLEADING_WORLD_CLAIM','SPAM','OTHER') then
    return jsonb_build_object('ok', false, 'code','REASON_INVALID');
  end if;
  if coalesce(p_payload->>'target_kind','') not in ('ASSET','COMMENT','CHANNEL','PROFILE') then
    return jsonb_build_object('ok', false, 'code','TARGET_KIND_INVALID');
  end if;

  v_code := 'RPT-' || to_char(now(),'YYYYMMDD') || '-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,6));
  insert into rael_reports(report_code, target_kind, target_ref, reporter_user_id, reason_code, statement)
  values (v_code, p_payload->>'target_kind', (p_payload->>'target_ref')::uuid, auth.uid(),
          v_reason, nullif(btrim(coalesce(p_payload->>'statement','')),''));

  return jsonb_build_object('ok', true, 'report_code', v_code,
    'queue', case
      when v_reason = 'RIGHTS_CLAIM' then 'RIGHTS_TAKEDOWN'
      when v_reason in ('SAFETY','HARASSMENT','PRIVACY','IMPERSONATION') then 'SAFETY_REVIEW'
      else 'GENERAL_MODERATION' end);
end $$;

grant execute on function rael_channel_page(text) to anon, authenticated;
grant execute on function rael_watch_page(uuid) to anon, authenticated;
grant execute on function rael_screen_comment(text, jsonb) to anon, authenticated;
grant execute on function rael_create_channel(jsonb) to authenticated;
grant execute on function rael_start_upload(jsonb) to authenticated;
grant execute on function rael_record_chunk(uuid, integer) to authenticated;
grant execute on function rael_complete_upload(jsonb) to authenticated;
grant execute on function rael_record_validation(jsonb) to authenticated;
grant execute on function rael_toggle_follow(uuid) to authenticated;
grant execute on function rael_set_reaction(uuid, text, boolean) to authenticated;
grant execute on function rael_post_comment(jsonb) to authenticated;
grant execute on function rael_list_comments(uuid, integer) to anon, authenticated;
grant execute on function rael_moderate_comment(uuid, text, text) to authenticated;
grant execute on function rael_submit_report(jsonb) to authenticated;

commit;
