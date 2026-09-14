-- THYLORA APP · public surfaces
-- Workroom: WR-THYAPP-001
-- Backend: thylora-dash (jvsdxhrfhtlgaknhjxlz)
--
-- HELD FOR CHAIRMAN APPLICATION. Nothing in this file has been applied to the
-- live backend. Until it is, the shell reports each surface as "not provisioned
-- yet" and never shows an empty list that could be mistaken for "no content".
--
-- These tables add the public reading surfaces the mobile shell needs. They do
-- not replace, copy or shadow an existing THYLORA table: the storefront, the
-- department registry, the Chairman command spine and the RAE Link channel
-- registry are all reused where they already exist.

create extension if not exists "pgcrypto";

-- Publication state is explicit so an unfinished transmission can never be
-- read by the public surface merely because a row exists.
do $$ begin
  create type thy_publish_state as enum ('DRAFT', 'IN_REVIEW', 'PUBLISHED', 'WITHDRAWN');
exception when duplicate_object then null; end $$;

do $$ begin
  create type thy_confidence_state as enum (
    'DOCUMENTED',        -- primary document held
    'CORROBORATED',      -- two or more independent sources
    'SINGLE_SOURCE',
    'MEMORY_REPORTED',   -- oral account, matching the family-story vocabulary
    'CONTESTED',
    'NOT_STATED'
  );
exception when duplicate_object then null; end $$;

/* ---------------------------------------------------------- transmissions */
create table if not exists thy_transmissions (
  id uuid primary key default gen_random_uuid(),
  transmission_code text not null unique,
  title text not null,
  synopsis text,
  bureau_code text,
  runtime_seconds integer check (runtime_seconds is null or runtime_seconds >= 0),
  poster_state text,
  publish_state thy_publish_state not null default 'DRAFT',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  -- A published transmission must say when it was published.
  constraint thy_transmissions_published_dated check (
    publish_state <> 'PUBLISHED' or published_at is not null
  )
);

-- One row per language per transmission. The shell offers ONLY the languages
-- that actually have a track here, so a reader is never shown a language
-- option that cannot play.
create table if not exists thy_transmission_tracks (
  id uuid primary key default gen_random_uuid(),
  transmission_code text not null references thy_transmissions (transmission_code) on delete cascade,
  language_code text not null,
  language_label text not null,
  track_kind text not null default 'AUDIO' check (track_kind in ('AUDIO', 'SUBTITLE', 'DUB', 'SIGN')),
  subtitle_language text,
  media_url text,
  track_state thy_publish_state not null default 'DRAFT',
  unique (transmission_code, language_code, track_kind)
);

create index if not exists thy_transmissions_published_idx
  on thy_transmissions (publish_state, published_at desc);
create index if not exists thy_transmission_tracks_code_idx
  on thy_transmission_tracks (transmission_code);

/* ------------------------------------------------------------- earth watch */
create table if not exists thy_earth_watch_signals (
  id uuid primary key default gen_random_uuid(),
  signal_code text not null unique,
  headline text not null,
  earth_place text,
  signal_class text,
  confidence_state thy_confidence_state not null default 'NOT_STATED',
  casefile_code text,
  observed_at timestamptz not null default now(),
  publish_state thy_publish_state not null default 'DRAFT'
);

/* --------------------------------------------------------------- casefiles */
create table if not exists thy_casefiles (
  id uuid primary key default gen_random_uuid(),
  casefile_code text not null unique,
  title text not null,
  subject_summary text,
  confidence_state thy_confidence_state not null default 'NOT_STATED',
  casefile_state text not null default 'OPEN' check (casefile_state in ('OPEN', 'SEALED', 'CLOSED')),
  opened_at timestamptz not null default now(),
  publish_state thy_publish_state not null default 'DRAFT'
);

-- Evidence carries its own provenance and confidence rather than inheriting the
-- casefile's, so a strong casefile cannot silently lend authority to a weak
-- document inside it.
create table if not exists thy_casefile_evidence (
  id uuid primary key default gen_random_uuid(),
  casefile_code text not null references thy_casefiles (casefile_code) on delete cascade,
  evidence_code text not null unique,
  evidence_kind text not null default 'DOCUMENT',
  source_label text,
  source_url text,
  provenance_state text not null default 'NOT_STATED'
    check (provenance_state in ('HELD_ORIGINAL', 'HELD_COPY', 'CITED', 'THIRD_PARTY', 'NOT_STATED')),
  confidence_state thy_confidence_state not null default 'NOT_STATED',
  created_at timestamptz not null default now()
);

create index if not exists thy_casefile_evidence_code_idx
  on thy_casefile_evidence (casefile_code);
create index if not exists thy_earth_watch_casefile_idx
  on thy_earth_watch_signals (casefile_code);

/* ------------------------------------------------- people / correspondents */
-- world_status mirrors the RAE Link rule: an EdereAriah correspondent can never
-- be presented as an Earth person.
create table if not exists thy_correspondents (
  id uuid primary key default gen_random_uuid(),
  correspondent_code text not null unique,
  display_name text not null,
  role_label text,
  bureau_code text,
  bureau_label text,
  world_status text not null default 'EARTH_REAL'
    check (world_status in ('EARTH_REAL', 'WORLD_SIMULATED')),
  simulated_disclosure text,
  active_state text not null default 'ACTIVE' check (active_state in ('ACTIVE', 'ON_LEAVE', 'RETIRED')),
  constraint thy_correspondents_world_truth check (
    world_status = 'EARTH_REAL'
    or (simulated_disclosure is not null and length(btrim(simulated_disclosure)) >= 12)
  )
);

create table if not exists thy_follows (
  id uuid primary key default gen_random_uuid(),
  follow_code text not null,
  owner_user_id uuid not null default auth.uid(),
  subject_kind text not null check (subject_kind in ('CORRESPONDENT', 'BUREAU')),
  subject_code text not null,
  follow_state text not null default 'FOLLOWING' check (follow_state in ('FOLLOWING', 'MUTED', 'STOPPED')),
  created_at timestamptz not null default now(),
  unique (owner_user_id, subject_kind, subject_code)
);

/* --------------------------------------------------------------- live link */
create table if not exists thy_live_sessions (
  id uuid primary key default gen_random_uuid(),
  session_code text not null unique,
  title text not null,
  live_state text not null default 'SCHEDULED'
    check (live_state in ('SCHEDULED', 'LIVE', 'ENDED', 'CANCELLED')),
  language_code text,
  join_url text,
  scheduled_for timestamptz,
  started_at timestamptz,
  ended_at timestamptz,
  -- A session cannot be LIVE without a start time.
  constraint thy_live_sessions_live_started check (live_state <> 'LIVE' or started_at is not null)
);
