-- THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533
-- Layered, period-appropriate security structure for ER-CASTLE-ROYAL-001.
-- Builds on canon: HH-1700-CAPTAIN, SCHED-HH-1700-GUARD, main gate + gatehouse,
-- outer curtain wall and wall towers, approach road, horse-drawn cargo cart.
-- Names stay OPEN. Staffing is expressed as a REQUIREMENT per post, never as
-- "two guards protect everything".
-- Incident records reuse public.thylora_estate_incidents with domain = 'SECURITY'.


-- ---------------------------------------------------------------------------
-- 1. SECURITY ZONES — the layers
-- ---------------------------------------------------------------------------
create table if not exists public.thylora_security_zones (
  zone_code               text primary key,
  estate_code             text not null default 'ER-CASTLE-ROYAL-001',
  time_region             text not null default '1700s',
  zone_name               text not null,
  layer_order             integer not null,       -- 1 = outermost
  what_it_protects        text not null,
  access_rule             text not null default 'OPEN',
  responsible_role_code   text not null default 'HH-1700-CAPTAIN',
  escalates_to_zone_code  text,
  open_fields             text[] not null default '{}',
  state                   text not null default 'STRUCTURE_DEFINED',
  source_query_id         text,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 2. POSTS — standing, night, patrol and reserve, with staffing requirement
-- ---------------------------------------------------------------------------
create table if not exists public.thylora_security_posts (
  post_code                 text primary key,
  estate_code               text not null default 'ER-CASTLE-ROYAL-001',
  time_region               text not null default '1700s',
  zone_code                 text not null references public.thylora_security_zones(zone_code),
  post_name                 text not null,
  post_class                text not null,        -- STANDING | NIGHT | PATROL | RESERVE | ESCORT
  day_strength_required     integer,
  night_strength_required   integer,
  strength_state            text not null default 'REQUIREMENT_SET',
  watches_per_day_state     text not null default 'OPEN',
  watch_length_state        text not null default 'OPEN',
  relief_interval_state     text not null default 'OPEN',
  patrol_range              text,
  patrol_mode               text,                 -- FOOT | MOUNTED | MIXED
  stop_authority_state      text not null default 'OPEN',
  communication_method_code text,
  responsible_role_code     text not null default 'HH-1700-CAPTAIN',
  open_fields               text[] not null default '{}',
  state                     text not null default 'STRUCTURE_DEFINED_IDENTITY_OPEN',
  source_query_id           text,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now(),
  constraint thylora_security_posts_class_chk
    check (post_class in ('STANDING','NIGHT','PATROL','RESERVE','ESCORT')),
  constraint thylora_security_posts_strength_chk
    check (strength_state in ('REQUIREMENT_SET','OPEN')
           and (strength_state = 'OPEN' or day_strength_required is not null or night_strength_required is not null))
);

-- ---------------------------------------------------------------------------
-- 3. RELIEF ROTATIONS — who relieves whom, with no unattended handoff
-- ---------------------------------------------------------------------------
create table if not exists public.thylora_security_rotations (
  rotation_code           text primary key,
  post_code               text not null references public.thylora_security_posts(post_code),
  watch_label             text not null,          -- FIRST_WATCH | MIDDLE_WATCH | MORNING_WATCH | DAY | OPEN
  relieved_by_post_code   text references public.thylora_security_posts(post_code),
  assigned_identity_code  text,
  assigned_identity_state text not null default 'OPEN_IDENTITY',
  handoff_requirement     text not null
    default 'Post, gate and movement state must be known by relief before control passes.',
  continuity_reference    text not null default 'SCHED-HH-1700-GUARD',
  state                   text not null default 'STRUCTURE_DEFINED_IDENTITY_OPEN',
  source_query_id         text,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  constraint thylora_security_rotations_identity_chk
    check (assigned_identity_state in ('OPEN_IDENTITY','NAMED','SUPERSEDED')
           and ((assigned_identity_state = 'NAMED') = (assigned_identity_code is not null)))
);

-- ---------------------------------------------------------------------------
-- 4. COMMUNICATION / SIGNAL METHOD — period-appropriate only
-- ---------------------------------------------------------------------------
create table if not exists public.thylora_security_signals (
  signal_code             text primary key,
  estate_code             text not null default 'ER-CASTLE-ROYAL-001',
  time_region             text not null default '1700s',
  signal_name             text not null,
  signal_class            text not null,          -- BELL | HORN | RUNNER | BEACON | VOICE_CHALLENGE | WRITTEN_PASS
  carries_meaning         text not null,
  range_state             text not null default 'OPEN',
  period_appropriate      boolean not null default true,
  escalates_to_signal     text,
  state                   text not null default 'STRUCTURE_DEFINED',
  source_query_id         text,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 5. STAFFING REQUIREMENT ROLLUP — what the estate must field, not who is named
-- ---------------------------------------------------------------------------
create or replace view public.thylora_security_staffing_requirement_v1 as
select
  z.zone_code,
  z.zone_name,
  z.layer_order,
  count(p.post_code)                                      as post_count,
  sum(coalesce(p.day_strength_required, 0))               as day_strength_required,
  sum(coalesce(p.night_strength_required, 0))             as night_strength_required,
  count(*) filter (where p.post_class = 'RESERVE')        as reserve_posts,
  count(*) filter (where p.post_class = 'PATROL')         as patrol_posts,
  count(r.rotation_code) filter (where r.assigned_identity_state = 'OPEN_IDENTITY')
                                                          as open_identity_slots
from public.thylora_security_zones z
left join public.thylora_security_posts p on p.zone_code = z.zone_code
left join public.thylora_security_rotations r on r.post_code = p.post_code
group by z.zone_code, z.zone_name, z.layer_order;
