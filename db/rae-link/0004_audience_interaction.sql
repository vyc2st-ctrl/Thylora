-- RAE LINK · 0004 · Views, reactions, comments, reports, notifications
-- Workroom: WR-RAELINK-001
--
-- PRIVACY: view events store coarse geography (country) and a rotating session
-- key only. No IP address, no precise location, no cross-site identifier.

begin;

create table if not exists rael_view_events (
  id               bigserial primary key,
  asset_id         uuid not null references rael_media_assets(id) on delete cascade,
  channel_id       uuid not null references rael_channels(id) on delete cascade,
  viewer_user_id   uuid references auth.users(id) on delete set null,
  session_key      text not null,
  watched_seconds  integer not null default 0 check (watched_seconds >= 0),
  completion_bp    integer not null default 0 check (completion_bp between 0 and 10000),
  device_class     text check (device_class in ('mobile','tablet','desktop','tv','unknown')),
  country_code     text check (country_code is null or country_code ~ '^[A-Z]{2}$'),
  is_monetizable   boolean not null default true,
  occurred_at      timestamptz not null default now()
);

create index if not exists rael_view_events_asset_idx on rael_view_events(asset_id, occurred_at desc);
create index if not exists rael_view_events_channel_idx on rael_view_events(channel_id, occurred_at desc);

-- Aggregate rollup so analytics never needs to read raw viewer rows.
create table if not exists rael_view_rollup_daily (
  asset_id        uuid not null references rael_media_assets(id) on delete cascade,
  day             date not null,
  country_code    text not null default 'ZZ',
  views           bigint not null default 0,
  watched_seconds bigint not null default 0,
  unique_sessions bigint not null default 0,
  primary key (asset_id, day, country_code)
);

create table if not exists rael_reactions (
  asset_id      uuid not null references rael_media_assets(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  reaction_kind text not null default 'LIKE'
                check (reaction_kind in ('LIKE','APPRECIATE','LEARNED','MOVED','QUESTION')),
  created_at    timestamptz not null default now(),
  primary key (asset_id, user_id, reaction_kind)
);

create table if not exists rael_comments (
  id               uuid primary key default gen_random_uuid(),
  asset_id         uuid not null references rael_media_assets(id) on delete cascade,
  author_user_id   uuid not null references auth.users(id) on delete cascade,
  parent_id        uuid references rael_comments(id) on delete cascade,
  body             text not null check (length(btrim(body)) between 1 and 4000),
  moderation_state text not null default 'VISIBLE'
                   check (moderation_state in ('VISIBLE','HELD','HIDDEN','REMOVED')),
  edited_at        timestamptz,
  created_at       timestamptz not null default now()
);

create index if not exists rael_comments_asset_idx on rael_comments(asset_id, created_at desc)
  where moderation_state = 'VISIBLE';

create table if not exists rael_reports (
  id             uuid primary key default gen_random_uuid(),
  report_code    text not null unique,
  target_kind    text not null check (target_kind in ('ASSET','COMMENT','CHANNEL','PROFILE')),
  target_ref     uuid not null,
  reporter_user_id uuid references auth.users(id) on delete set null,
  reason_code    text not null,
  statement      text,
  report_state   text not null default 'RECEIVED'
                 check (report_state in ('RECEIVED','UNDER_REVIEW','ACTIONED','REJECTED')),
  created_at     timestamptz not null default now()
);

create table if not exists rael_notifications (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  topic         text not null,
  title         text not null,
  body          text,
  link_ref      text,
  read_at       timestamptz,
  created_at    timestamptz not null default now()
);

create index if not exists rael_notifications_user_idx on rael_notifications(user_id, created_at desc)
  where read_at is null;

-- Abuse and rate limiting. Counters are per actor and per action window.
create table if not exists rael_rate_counters (
  actor_key   text not null,
  action_key  text not null,
  window_start timestamptz not null,
  hits        integer not null default 0,
  primary key (actor_key, action_key, window_start)
);

commit;
