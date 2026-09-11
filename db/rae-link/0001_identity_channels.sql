-- RAE LINK · 0001 · Identity, profiles and channel classes
-- Workroom: WR-RAELINK-001
-- Backend: thylora-dash (jvsdxhrfhtlgaknhjxlz)
--
-- AUTHORITY NOTE
-- This file is a reviewable migration. It is NOT applied by this repository.
-- Applying DDL to the live backend is a production mutation and is held for
-- Chairman execution. Every statement is written to be idempotent and additive:
-- it creates new rael_* objects and never drops, renames or rewrites an existing
-- THYLORA table. Soft references (text codes / uuid columns without hard foreign
-- keys) are used wherever a target table could not be verified from this session.

begin;

create extension if not exists "pgcrypto";

-- Channel classes keep Earth people and EdereAriah world inhabitants separable
-- at the data layer. A world channel can never be presented as an Earth person.
do $$ begin
  create type rael_channel_class as enum (
    'EARTH_PERSON',
    'EARTH_BUSINESS',
    'EARTH_ORGANIZATION',
    'EDEREARIAH_INHABITANT',
    'WORLD_CHANNEL',
    'FAMILY_STORY',
    'THYLORA_HOUSE'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type rael_world_status as enum ('EARTH_REAL','WORLD_SIMULATED');
exception when duplicate_object then null; end $$;

do $$ begin
  create type rael_record_state as enum ('DRAFT','ACTIVE','SUSPENDED','ARCHIVED');
exception when duplicate_object then null; end $$;

create table if not exists rael_profiles (
  user_id            uuid primary key references auth.users(id) on delete cascade,
  handle             text not null unique
                     check (handle ~ '^[a-z0-9](?:[a-z0-9_.-]{1,28}[a-z0-9])$'),
  display_name       text not null,
  bio                text,
  avatar_asset_id    uuid,
  country_code       text check (country_code is null or country_code ~ '^[A-Z]{2}$'),
  locale             text default 'en',
  is_minor           boolean not null default false,
  guardian_user_id   uuid references auth.users(id),
  profile_state      rael_record_state not null default 'ACTIVE',
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  -- A minor profile is never active without a recorded guardian.
  constraint rael_profiles_guardian_required
    check (is_minor = false or guardian_user_id is not null)
);

create table if not exists rael_channels (
  id                     uuid primary key default gen_random_uuid(),
  channel_code           text not null unique,
  slug                   text not null unique
                         check (slug ~ '^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])$'),
  owner_user_id          uuid not null references auth.users(id) on delete restrict,
  name                   text not null,
  channel_class          rael_channel_class not null,
  world_status           rael_world_status not null,
  simulated_disclosure   text,
  description            text,
  avatar_asset_id        uuid,
  banner_asset_id        uuid,
  -- Soft links. The target registries live in the existing THYLORA backend and
  -- could not be verified from the build session, so no hard FK is declared.
  business_ref           text,
  family_archive_ref     text,
  world_place_ref        text,
  channel_state          rael_record_state not null default 'DRAFT',
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),
  -- World/simulated channels must carry a visible disclosure and must never be
  -- marked EARTH_REAL. Earth channels must never carry a simulated disclosure.
  constraint rael_channels_world_truth check (
    (channel_class in ('EDEREARIAH_INHABITANT','WORLD_CHANNEL')
       and world_status = 'WORLD_SIMULATED'
       and simulated_disclosure is not null
       and length(btrim(simulated_disclosure)) >= 12)
    or
    (channel_class in ('EARTH_PERSON','EARTH_BUSINESS','EARTH_ORGANIZATION','FAMILY_STORY','THYLORA_HOUSE')
       and world_status = 'EARTH_REAL')
  )
);

create index if not exists rael_channels_owner_idx on rael_channels(owner_user_id);
create index if not exists rael_channels_class_idx on rael_channels(channel_class, channel_state);

-- Channel staff. Access is not authority: a role grants the named capability
-- only, and ownership transfer is a separate logged action.
do $$ begin
  create type rael_channel_role as enum ('OWNER','MANAGER','EDITOR','UPLOADER','ANALYST','VIEWER');
exception when duplicate_object then null; end $$;

create table if not exists rael_channel_members (
  channel_id   uuid not null references rael_channels(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  member_role  rael_channel_role not null default 'VIEWER',
  member_state rael_record_state not null default 'ACTIVE',
  granted_by   uuid references auth.users(id),
  granted_at   timestamptz not null default now(),
  primary key (channel_id, user_id)
);

create table if not exists rael_follows (
  follower_user_id uuid not null references auth.users(id) on delete cascade,
  channel_id       uuid not null references rael_channels(id) on delete cascade,
  created_at       timestamptz not null default now(),
  follow_state     rael_record_state not null default 'ACTIVE',
  primary key (follower_user_id, channel_id)
);

create index if not exists rael_follows_channel_idx on rael_follows(channel_id) where follow_state = 'ACTIVE';

create or replace function rael_touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists rael_profiles_touch on rael_profiles;
create trigger rael_profiles_touch before update on rael_profiles
  for each row execute function rael_touch_updated_at();

drop trigger if exists rael_channels_touch on rael_channels;
create trigger rael_channels_touch before update on rael_channels
  for each row execute function rael_touch_updated_at();

commit;
