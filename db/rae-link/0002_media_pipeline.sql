-- RAE LINK · 0002 · Media assets, resumable upload, pipeline custody
-- Workroom: WR-RAELINK-001
-- Pipeline order (directive):
--   Creator/Input -> Rights/Authority Gate -> Upload -> Virus/File Validation ->
--   Transcode/Encode -> Metadata -> Thumbnail/Poster -> Moderation ->
--   Publication -> Feed/Search -> Playback -> Analytics -> Monetization Ledger ->
--   Creator Share -> Payout Evidence -> Archive/Versioning

begin;

do $$ begin
  create type rael_media_kind as enum ('VIDEO','AUDIO','IMAGE','EDF','DOCUMENT','LIVE');
exception when duplicate_object then null; end $$;

do $$ begin
  create type rael_pipeline_state as enum (
    'INPUT',
    'RIGHTS_GATE',
    'UPLOAD',
    'VALIDATION',
    'TRANSCODE',
    'METADATA',
    'POSTER',
    'MODERATION',
    'PUBLISHED',
    'ARCHIVED',
    'BLOCKED',
    'WITHDRAWN'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type rael_visibility as enum ('PRIVATE','UNLISTED','FOLLOWERS','SUBSCRIBERS','PAID','PUBLIC');
exception when duplicate_object then null; end $$;

create table if not exists rael_media_assets (
  id                   uuid primary key default gen_random_uuid(),
  asset_code           text not null unique,
  channel_id           uuid not null references rael_channels(id) on delete restrict,
  owner_user_id        uuid not null references auth.users(id) on delete restrict,
  media_kind           rael_media_kind not null,
  title                text not null,
  description          text,
  language             text default 'en',
  duration_seconds     integer check (duration_seconds is null or duration_seconds >= 0),
  byte_size            bigint check (byte_size is null or byte_size >= 0),
  checksum_sha256      text check (checksum_sha256 is null or checksum_sha256 ~ '^[a-f0-9]{64}$'),
  storage_provider     text,
  storage_key          text,
  pipeline_state       rael_pipeline_state not null default 'INPUT',
  visibility_state     rael_visibility not null default 'PRIVATE',
  -- Version chain. A new version never overwrites the published record it replaces.
  version_no           integer not null default 1 check (version_no >= 1),
  replaces_asset_id    uuid references rael_media_assets(id),
  -- Soft links into existing THYLORA registries (product, passport, order surfaces).
  product_ref          text,
  passport_ref         text,
  edf_ref              text,
  publish_at           timestamptz,
  published_at         timestamptz,
  archived_at          timestamptz,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  search_document      tsvector generated always as (
    setweight(to_tsvector('simple', coalesce(title,'')), 'A') ||
    setweight(to_tsvector('simple', coalesce(description,'')), 'B')
  ) stored,
  constraint rael_assets_published_needs_time
    check (pipeline_state <> 'PUBLISHED' or published_at is not null)
);

create index if not exists rael_assets_channel_idx on rael_media_assets(channel_id, pipeline_state);
create index if not exists rael_assets_feed_idx on rael_media_assets(published_at desc)
  where pipeline_state = 'PUBLISHED';
create index if not exists rael_assets_search_idx on rael_media_assets using gin(search_document);

-- Resumable upload custody. A dropped connection must not cost the creator the
-- upload: received chunks are recorded so the client resumes at the gap.
create table if not exists rael_upload_sessions (
  id                uuid primary key default gen_random_uuid(),
  asset_id          uuid not null references rael_media_assets(id) on delete cascade,
  provider          text not null,
  upload_ref        text,
  total_bytes       bigint not null check (total_bytes > 0),
  chunk_size_bytes  integer not null default 8388608 check (chunk_size_bytes > 0),
  received_bytes    bigint not null default 0 check (received_bytes >= 0),
  received_chunks   integer[] not null default '{}',
  session_state     text not null default 'OPEN'
                    check (session_state in ('OPEN','PAUSED','COMPLETE','EXPIRED','FAILED')),
  last_heartbeat_at timestamptz not null default now(),
  expires_at        timestamptz not null default now() + interval '7 days',
  created_at        timestamptz not null default now()
);

create index if not exists rael_upload_sessions_asset_idx on rael_upload_sessions(asset_id);

-- Append-only custody trail. Every pipeline movement carries actor and evidence.
create table if not exists rael_pipeline_events (
  id           bigserial primary key,
  asset_id     uuid not null references rael_media_assets(id) on delete cascade,
  from_state   rael_pipeline_state,
  to_state     rael_pipeline_state not null,
  actor_kind   text not null default 'SYSTEM'
               check (actor_kind in ('CREATOR','STAFF','SYSTEM','MODERATOR','CHAIRMAN')),
  actor_user_id uuid references auth.users(id),
  provider     text,
  evidence     jsonb not null default '{}'::jsonb,
  note         text,
  created_at   timestamptz not null default now()
);

create index if not exists rael_pipeline_events_asset_idx on rael_pipeline_events(asset_id, id desc);

create table if not exists rael_media_renditions (
  id             uuid primary key default gen_random_uuid(),
  asset_id       uuid not null references rael_media_assets(id) on delete cascade,
  rendition_kind text not null,
  container      text,
  codec          text,
  width          integer,
  height         integer,
  bitrate_kbps   integer,
  provider       text,
  storage_key    text,
  playback_url   text,
  rendition_state text not null default 'PENDING'
                 check (rendition_state in ('PENDING','RUNNING','READY','FAILED')),
  created_at     timestamptz not null default now(),
  unique (asset_id, rendition_kind)
);

-- Accessibility is a pipeline requirement, not an afterthought. Publication is
-- blocked for timed media unless a caption track exists or a waiver is recorded
-- with a reason (see rael_publish_gate in 0008).
create table if not exists rael_media_captions (
  id            uuid primary key default gen_random_uuid(),
  asset_id      uuid not null references rael_media_assets(id) on delete cascade,
  language      text not null default 'en',
  caption_kind  text not null default 'CAPTION'
                check (caption_kind in ('CAPTION','SUBTITLE','TRANSCRIPT','DESCRIPTION')),
  caption_source text not null default 'MACHINE'
                check (caption_source in ('HUMAN','MACHINE','IMPORTED')),
  provider      text,
  storage_key   text,
  is_default    boolean not null default false,
  caption_state text not null default 'DRAFT'
                check (caption_state in ('DRAFT','READY','REJECTED')),
  created_at    timestamptz not null default now(),
  unique (asset_id, language, caption_kind)
);

create table if not exists rael_accessibility_waivers (
  asset_id     uuid primary key references rael_media_assets(id) on delete cascade,
  reason       text not null check (length(btrim(reason)) >= 8),
  approved_by  uuid not null references auth.users(id),
  approved_at  timestamptz not null default now(),
  review_due   date
);

create table if not exists rael_scan_results (
  id          uuid primary key default gen_random_uuid(),
  asset_id    uuid not null references rael_media_assets(id) on delete cascade,
  scanner     text not null,
  verdict     text not null check (verdict in ('CLEAN','INFECTED','UNSUPPORTED','ERROR')),
  declared_mime text,
  detected_mime text,
  details     jsonb not null default '{}'::jsonb,
  scanned_at  timestamptz not null default now()
);

create index if not exists rael_scan_results_asset_idx on rael_scan_results(asset_id, scanned_at desc);

create table if not exists rael_moderation_reviews (
  id             uuid primary key default gen_random_uuid(),
  asset_id       uuid not null references rael_media_assets(id) on delete cascade,
  review_stage   text not null default 'PRE_PUBLICATION'
                 check (review_stage in ('PRE_PUBLICATION','POST_PUBLICATION','APPEAL','RIGHTS_TAKEDOWN')),
  verdict        text not null check (verdict in ('PENDING','PASSED','PASSED_WITH_LIMITS','BLOCKED')),
  policy_version text,
  reasons        text[] not null default '{}',
  reviewer_kind  text not null default 'AUTOMATED'
                 check (reviewer_kind in ('AUTOMATED','HUMAN','CHAIRMAN')),
  reviewer_user_id uuid references auth.users(id),
  created_at     timestamptz not null default now()
);

create index if not exists rael_moderation_asset_idx on rael_moderation_reviews(asset_id, created_at desc);

drop trigger if exists rael_assets_touch on rael_media_assets;
create trigger rael_assets_touch before update on rael_media_assets
  for each row execute function rael_touch_updated_at();

-- Pipeline movements are recorded automatically so no transition can happen
-- without a trail, even if an operator writes the column directly.
create or replace function rael_log_pipeline_move() returns trigger
language plpgsql as $$
begin
  if tg_op = 'UPDATE' and new.pipeline_state is distinct from old.pipeline_state then
    insert into rael_pipeline_events(asset_id, from_state, to_state, actor_kind, note)
    values (new.id, old.pipeline_state, new.pipeline_state, 'SYSTEM', 'state column change');
  elsif tg_op = 'INSERT' then
    insert into rael_pipeline_events(asset_id, from_state, to_state, actor_kind, note)
    values (new.id, null, new.pipeline_state, 'CREATOR', 'asset created');
  end if;
  return new;
end $$;

drop trigger if exists rael_assets_pipeline_log on rael_media_assets;
create trigger rael_assets_pipeline_log after insert or update on rael_media_assets
  for each row execute function rael_log_pipeline_move();

commit;
