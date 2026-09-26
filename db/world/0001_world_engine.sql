-- THYLORA · World engine · 0001
-- Person Causal Spine, population resolution, World Event Engine,
-- WorldState Atlas coordinates/state, Talk While Working + BACKTRACE,
-- Media Core intake, KynWrks recipe capture, Test Rebuild construct audit.
--
-- DRAFT FOR REVIEW. NOT APPLIED to thylora-dash (jvsdxhrfhtlgaknhjxlz).
-- Applying DDL to the live backend is held for Chairman execution.
-- Additive only: every object is new and prefixed thy_. No existing table is
-- altered. Links to existing registries are soft text references.

begin;

-- ---------------------------------------------------------------- A. spine
create table if not exists thy_person_spine_questions (
  question_id      text primary key,               -- <entity>:<seed>:<dimension>
  canonical_entity_id text not null,               -- soft ref thylora_person_life_registry
  seed_id          text not null,
  seed_question    text,
  trait            text not null,
  dimension        text not null check (dimension in
    ('CONTEXT','RELATIONSHIP','TIME','CAUSE','PRIOR_EVENTS','CONTRADICTIONS','CURRENT_STATE','CHANGE_OVER_TIME','INTERACTION')),
  question         text not null,
  status           text not null default 'OPEN' check (status in ('OPEN','EVIDENCE_IN_PACKET','ANSWERED_REVIEWED','CHAIRMAN_LOCKED')),
  evidence_paths   jsonb not null default '[]',
  answer           jsonb,                          -- null until a reviewer writes it
  answered_by      text,
  source_refs      jsonb not null default '[]',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  constraint answer_needs_review check (answer is null or status in ('ANSWERED_REVIEWED','CHAIRMAN_LOCKED'))
);
create index if not exists thy_psq_entity on thy_person_spine_questions (canonical_entity_id, status);

create table if not exists thy_person_resolution_state (
  canonical_entity_id text primary key,
  storage_tier     text not null check (storage_tier in ('PERSISTENT','FOCUS')),
  compute_tier     text not null check (compute_tier in ('BACKGROUND','HOUSEHOLD','PERSISTENT','FOCUS')),
  history_len      bigint not null default 0,
  last_summary     jsonb,
  reason           text not null,
  updated_at       timestamptz not null default now()
);

-- history may never shrink across a resolution change
create or replace function thy_guard_history_len() returns trigger language plpgsql as $$
begin
  if new.history_len < old.history_len then
    raise exception 'resolution change may not reduce history (% -> %)', old.history_len, new.history_len;
  end if;
  return new;
end $$;
drop trigger if exists thy_prs_history on thy_person_resolution_state;
create trigger thy_prs_history before update on thy_person_resolution_state
  for each row execute function thy_guard_history_len();

-- ---------------------------------------------------------------- B. events
create table if not exists thy_world_events (
  event_id         uuid primary key default gen_random_uuid(),
  tick_seed        bigint not null,
  rule             text not null,
  event_type       text not null,
  person_or_group_id text not null,
  earth_at         timestamptz not null,
  earth_timezone   text not null default 'America/New_York',
  native_stamp     jsonb,                          -- anchor-relative only
  causes           jsonb not null,
  probability      numeric not null check (probability between 0.02 and 0.98),
  roll             numeric not null check (roll >= 0 and roll < 1),
  occurred         boolean not null,
  state_delta      jsonb not null default '{}',
  visibility_class text not null default 'PRIVATE' check (visibility_class in ('PUBLIC','PRIVATE','AUTHORITY','RESTRICTED')),
  predecessor_event_id uuid references thy_world_events(event_id),
  created_at       timestamptz not null default now(),
  constraint causes_not_empty check (jsonb_typeof(causes) = 'array' and jsonb_array_length(causes) > 0)
);
create index if not exists thy_we_person_time on thy_world_events (person_or_group_id, earth_at);

-- ---------------------------------------------------------------- C. atlas
create table if not exists thy_atlas_places (
  place_id         text primary key,
  parent_place_id  text references thy_atlas_places(place_id),
  level            text not null check (level in ('PLANET','REGION','DISTRICT','BLOCK','BUILDING','FLOOR','ROOM','ZONE')),
  canonical_name   text,                           -- null = name OPEN
  name_state       text not null default 'OPEN',
  world_entity_ref text,                           -- soft ref thylora_world_entities.entity_id
  -- local frame: metres from parent origin, +x east, +y north, +z up
  origin_x_m       numeric, origin_y_m numeric, origin_z_m numeric,
  rotation_deg     numeric default 0,
  footprint        jsonb,                          -- polygon in parent-local metres
  measurement_state text not null default 'PROPOSED' check (measurement_state in ('UNKNOWN','PROPOSED','MEASURED','CHAIRMAN_LOCKED')),
  visibility_class text not null default 'PUBLIC' check (visibility_class in ('PUBLIC','PRIVATE','AUTHORITY','RESTRICTED')),
  created_at       timestamptz not null default now()
);

create table if not exists thy_atlas_state (
  state_id         uuid primary key default gen_random_uuid(),
  entity_kind      text not null check (entity_kind in ('PERSON','VEHICLE','BUILDING','ROOM','EVENT','OBJECT')),
  entity_ref       text not null,
  place_id         text references thy_atlas_places(place_id),
  earth_from       timestamptz not null,
  earth_to         timestamptz,
  state            jsonb not null,
  mode             text not null check (mode in ('HAPPENED','SCHEDULED','INFERRED')),
  source_event_id  uuid references thy_world_events(event_id),
  source_schedule_ref text,
  visibility_class text not null default 'PRIVATE' check (visibility_class in ('PUBLIC','PRIVATE','AUTHORITY','RESTRICTED')),
  created_at       timestamptz not null default now(),
  constraint happened_needs_source check (mode <> 'HAPPENED' or source_event_id is not null),
  constraint scheduled_needs_schedule check (mode <> 'SCHEDULED' or source_schedule_ref is not null)
);
create index if not exists thy_as_time on thy_atlas_state (entity_kind, entity_ref, earth_from);

create table if not exists thy_atlas_app_launch_points (
  place_id         text not null references thy_atlas_places(place_id),
  app_code         text not null,                  -- soft ref living_business_app_registry.app_code
  label            text not null,
  min_visibility   text not null default 'PUBLIC',
  primary key (place_id, app_code)
);

-- ---------------------------------------------------------------- D. TWIW
create table if not exists thy_twiw_sessions (
  session_id       text primary key,
  operator_entity_id text not null,                -- accountable operator, e.g. nahla-mercer
  user_ref         text not null,
  started_at       timestamptz not null,
  earth_timezone   text not null default 'America/New_York',
  native_stamp     jsonb,
  recording_known_to_user boolean not null check (recording_known_to_user),
  closed_at        timestamptz,
  receipt          jsonb
);

create table if not exists thy_twiw_raw_segments (
  session_id       text not null references thy_twiw_sessions(session_id),
  seg_id           text not null,
  t                timestamptz not null,
  speaker          text,
  source           text not null check (source in ('OPERATOR_SPEECH','OTHER_SPEAKER','BACKGROUND')),
  text             text not null,
  confidence       numeric,
  primary key (session_id, seg_id)
);

create table if not exists thy_twiw_markers (
  marker_id        text primary key,               -- BT-<session>-NNNN
  session_id       text not null references thy_twiw_sessions(session_id),
  seq              int not null,
  t                timestamptz not null,
  object           text not null,
  action           text not null check (action in ('PLACE','TAKE','MOVE','USE','MENTION','INSPECT','HANDOFF')),
  location         text,
  reason           text,
  raw_ref          text not null,
  source           text not null,
  uncertain        boolean not null,
  supersedes       text references thy_twiw_markers(marker_id),
  prev_hash        text not null,
  hash             text not null unique,
  unique (session_id, seq),
  constraint bg_cannot_place check (not (source = 'BACKGROUND' and action in ('PLACE','MOVE','TAKE')))
);

-- raw and markers are append-only
create or replace function thy_append_only() returns trigger language plpgsql as $$
begin raise exception '% is append-only; write a correction marker instead', tg_table_name; end $$;
drop trigger if exists thy_twiw_raw_ao on thy_twiw_raw_segments;
create trigger thy_twiw_raw_ao before update or delete on thy_twiw_raw_segments for each row execute function thy_append_only();
drop trigger if exists thy_twiw_mk_ao on thy_twiw_markers;
create trigger thy_twiw_mk_ao before update or delete on thy_twiw_markers for each row execute function thy_append_only();

-- ---------------------------------------------------------------- E/F. media intake
create table if not exists thy_media_intake_batches (
  batch_id         text primary key,
  supplied_by      text not null,
  supplied_via     text not null,
  item_count_declared int not null,
  note             text,
  created_at       timestamptz not null default now()
);

create table if not exists thy_media_intake_items (
  batch_id         text not null references thy_media_intake_batches(batch_id),
  item_no          int not null,
  original_filename text,
  sha256           text,                           -- null until bytes are in custody
  byte_size        bigint,
  container        text,
  duration_s       numeric,
  visual_lanes     jsonb not null default '[]',    -- from visual inspection only
  transcription_state text not null default 'NOT_TRANSCRIBED' check (transcription_state in ('NOT_TRANSCRIBED','MACHINE_DRAFT','HUMAN_REVIEWED')),
  release_state    text not null default 'UNKNOWN' check (release_state in ('UNKNOWN','UNRELEASED','RELEASED_EVIDENCED')),
  release_evidence jsonb,
  duplicate_family text,
  custody_state    text not null default 'CHAT_ONLY' check (custody_state in ('CHAT_ONLY','BYTES_HASHED','STORED','TRANSCODED')),
  primary key (batch_id, item_no),
  constraint hashed_needs_hash check (custody_state = 'CHAT_ONLY' or sha256 is not null),
  constraint released_needs_evidence check (release_state <> 'RELEASED_EVIDENCED' or release_evidence is not null)
);

-- ---------------------------------------------------------------- G. KynWrks
create table if not exists thy_kynwrks_recipe_attempts (
  recipe_id        text not null,
  version          text not null,
  lane             text not null check (lane in ('KENNEDY_CHECKS_IT','JORDYN_SECOND_GEAR','CALI_TASTE_LAB')),
  made_at          timestamptz not null,
  made_by          text not null,
  lines            jsonb not null,                 -- ingredient, form, brand, intended, actual, unit, spill_or_deviation
  method_notes     text,
  tastings         jsonb not null default '[]',    -- taster, response, score_1_5
  next_change      text,
  formula_state    text not null default 'NO_CANONICAL_MEASURED_FORMULA',
  primary key (recipe_id, version)
);

-- ---------------------------------------------------------------- I. test rebuild
create table if not exists thy_test_construct_audits (
  test_ref         text not null,
  item_id          text not null,
  intended_skill   text not null,
  prerequisite_knowledge jsonb not null default '[]',
  language_burden  smallint not null check (language_burden between 0 and 3),
  ambiguity        smallint not null check (ambiguity between 0 and 3),
  trick_burden     smallint not null check (trick_burden between 0 and 3),
  time_pressure    smallint not null check (time_pressure between 0 and 3),
  transfer_value   smallint not null check (transfer_value between 0 and 3),
  verdict          text not null check (verdict in ('CLEAN','CONTAMINATED','REBUILD')),
  can_prove        jsonb not null,
  cannot_prove     jsonb not null,
  primary key (test_ref, item_id)
);

-- RLS on; no client policies yet. Service role only until the Chairman sets access.
alter table thy_person_spine_questions  enable row level security;
alter table thy_person_resolution_state enable row level security;
alter table thy_world_events            enable row level security;
alter table thy_atlas_places            enable row level security;
alter table thy_atlas_state             enable row level security;
alter table thy_atlas_app_launch_points enable row level security;
alter table thy_twiw_sessions           enable row level security;
alter table thy_twiw_raw_segments       enable row level security;
alter table thy_twiw_markers            enable row level security;
alter table thy_media_intake_batches    enable row level security;
alter table thy_media_intake_items      enable row level security;
alter table thy_kynwrks_recipe_attempts enable row level security;
alter table thy_test_construct_audits   enable row level security;

commit;
