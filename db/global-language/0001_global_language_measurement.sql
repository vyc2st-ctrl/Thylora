-- GLOBAL_LANGUAGE_DISTRIBUTION_001 · measurement spine
-- Backend of record: thylora-dash (jvsdxhrfhtlgaknhjxlz)
-- Opened at sequence 501, 2026-09-18.
--
-- STATUS: REVIEWABLE, NOT APPLIED.
-- Production DDL is a held action. Nothing in this file was run against the live
-- backend. It exists so the measurement shape is reviewable before it is real.
--
-- WHY THIS FILE EXISTS
-- The backend can already name a channel (social_channel_registry), queue a post
-- (social_content_queue) and record a platform's arrival state
-- (thylora_global_arrival_matrix). It cannot record what a published post DID,
-- per language, per platform, per territory. There is no such table. Until there
-- is, every performance claim about a language lane is unevidenced.

begin;

create table if not exists thylora_global_language_metrics (
  metric_id          uuid primary key default gen_random_uuid(),

  -- what was posted
  content_code       text not null,                 -- social_content_queue.content_code
  question_canon_code text not null,                -- THY-GQ-001 … one canon, many languages
  language_code      text not null,                 -- BCP-47: en, es, zh-Hans, hi
  platform_code      text not null,                 -- INSTAGRAM | FACEBOOK | SHARECHAT | …
  channel_code       text,                          -- social_channel_registry.channel_code

  -- when
  measured_at        timestamptz not null default now(),
  window_start       timestamptz not null,
  window_end         timestamptz not null,

  -- counts. NULL means NOT REPORTED BY THE PLATFORM. It never means zero.
  views              bigint,
  reach              bigint,
  comments           bigint,
  shares             bigint,
  saves              bigint,
  profile_visits     bigint,
  store_visits       bigint,

  -- where, only as coarsely as the platform actually reports
  country_code       text,
  territory_note     text,

  -- how we know
  source             text not null,                 -- METRICOOL_API | PLATFORM_NATIVE_UI | MANUAL_SCREENSHOT
  capture_method     text not null,                 -- API_READ | WITNESSED_SCREEN | OPERATOR_ENTRY
  evidence           jsonb not null default '{}'::jsonb,

  -- the honesty gate: a sample this small proves nothing, and says so in the row
  sample_confidence  text not null default 'INSUFFICIENT_SAMPLE',

  created_at         timestamptz not null default now(),

  constraint glm_window_ordered check (window_end >= window_start),
  constraint glm_counts_nonneg check (
    coalesce(views,0) >= 0 and coalesce(reach,0) >= 0 and coalesce(comments,0) >= 0 and
    coalesce(shares,0) >= 0 and coalesce(saves,0) >= 0 and
    coalesce(profile_visits,0) >= 0 and coalesce(store_visits,0) >= 0),
  constraint glm_source check (source in ('METRICOOL_API','PLATFORM_NATIVE_UI','MANUAL_SCREENSHOT')),
  constraint glm_capture check (capture_method in ('API_READ','WITNESSED_SCREEN','OPERATOR_ENTRY')),
  -- A reading may not be called indicative or comparable until it clears a floor.
  -- The floor is deliberately crude: it stops a 3-comment lane being read as a result.
  constraint glm_confidence check (sample_confidence in
    ('INSUFFICIENT_SAMPLE','INDICATIVE_NOT_PROOF','COMPARABLE_ACROSS_LANGUAGES')),
  constraint glm_confidence_earned check (
    sample_confidence = 'INSUFFICIENT_SAMPLE'
    or (coalesce(reach,0) >= 1000 and coalesce(comments,0) >= 30))
);

comment on table thylora_global_language_metrics is
  'Per language, per platform, per window outcome of one Global Question post. NULL counts mean the platform did not report the figure; they are never read as zero. sample_confidence may not leave INSUFFICIENT_SAMPLE until reach >= 1000 and comments >= 30 — small samples are not proof and the constraint enforces it rather than trusting the reader.';

create index if not exists glm_by_canon    on thylora_global_language_metrics (question_canon_code, language_code, window_start);
create index if not exists glm_by_content  on thylora_global_language_metrics (content_code);
create index if not exists glm_by_platform on thylora_global_language_metrics (platform_code, language_code);

alter table thylora_global_language_metrics enable row level security;

commit;
