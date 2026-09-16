-- THYLORA APP · Media Studio
-- Workroom: WR-THYAPP-001 · routes through WR-AI-ROUTING-001
--
-- HELD FOR CHAIRMAN APPLICATION.
--
-- Chairman-only. This file adds ONLY what has no canonical equivalent: the
-- animation job record, the Apple Pencil markup store, and the per-asset
-- release requirements (logo, QR destination, serial binding).
--
-- WHAT IT DELIBERATELY DOES NOT CREATE
-- ------------------------------------
--   the registered asset + version chain → rael_media_assets (RAE Link lane)
--   parent/derivative provenance         → rael_provenance_events (RAE Link lane)
--   the rights gate                      → rael_rights_records (RAE Link lane)
--   serial number + QR destination       → digital_product_passports (commerce)
--   the Chairman gate                    → thylora_is_chairman()
--   margin notes / revision requests     → thylora_margin_note_add_v1
--   approve / revise / reject            → submit_thylora_review_gate_decision_v1
--   the publishing queue                 → thylora_edf_publish_v1
--   media generation itself              → the thylora-ai-router Edge Function
--
-- NO CREDENTIAL IS STORED HERE. There is no password column, no API key column
-- and no provider secret column in this file, and there must never be one. The
-- router reads the provider secret server-side from backend secrets. What is
-- recorded is the ROUTER'S ANSWER, not the means of calling it.

do $$ begin
  if to_regprocedure('public.thylora_is_chairman()') is null then
    raise exception
      'THY-CONTINUITY: thylora_is_chairman() is absent. The Media Studio must not define a second Chairman gate.';
  end if;
end $$;

/* ------------------------------------------------------------------- modes */
-- The Chairman's cost/fidelity instruction to the router. No provider is named
-- at this layer, so changing a provider on the backend is not a schema change.
do $$ begin
  create type thy_animate_mode as enum ('AUTOMATIC', 'BUDGET', 'BEST_FIDELITY');
exception when duplicate_object then null; end $$;

-- The job lifecycle. RETURNED is deliberately distinct from REVIEW: a provider
-- answering is not the same as a usable asset existing. A job only reaches
-- REVIEW once a locatable asset has actually been read out of the response.
do $$ begin
  create type thy_media_job_state as enum (
    'DRAFT',
    'SUBMITTED',
    'ROUTING',
    'RUNNING',
    'RETURNED',
    'FAILED',
    'REVIEW',
    'APPROVED',
    'REVISION_REQUESTED',
    'REJECTED',
    'QUEUED_FOR_PUBLISH'
  );
exception when duplicate_object then null; end $$;

/* ----------------------------------------------------------- markup store */
-- Vector strokes drawn over one frame, stored as vectors rather than a
-- flattened screenshot so the marks stay re-renderable at any zoom and
-- readable by whoever performs the revision.
--
-- Coordinates are frame-relative 0..1, so a markup drawn on an iPad in
-- portrait still lands in the right place on any other display.
create table if not exists thy_media_markups (
  id uuid primary key default gen_random_uuid(),
  markup_ref text not null unique
    default 'THY-MARKUP-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substr(encode(gen_random_bytes(4), 'hex'), 1, 8)),
  author_user_id uuid not null default auth.uid(),
  job_code text,
  asset_code text not null,
  -- Which frame was marked: a timestamp in ms, a rendition key, or a page.
  frame_ref text,
  strokes jsonb not null default '[]'::jsonb,
  stroke_count integer not null default 0 check (stroke_count >= 0),
  point_count integer not null default 0 check (point_count >= 0),
  -- How many strokes came from a real Apple Pencil. A finger or mouse reports
  -- no graded pressure, so it is counted separately and never reported as
  -- Pencil input.
  pencil_stroke_count integer not null default 0 check (pencil_stroke_count >= 0),
  created_at timestamptz not null default now(),
  constraint thy_markup_count_matches check (stroke_count = jsonb_array_length(strokes)),
  constraint thy_markup_pencil_subset check (pencil_stroke_count <= stroke_count),
  -- An empty markup is not a markup.
  constraint thy_markup_not_empty check (stroke_count > 0)
);

create index if not exists thy_media_markups_asset_idx
  on thy_media_markups (asset_code, created_at desc);
create index if not exists thy_media_markups_job_idx
  on thy_media_markups (job_code, created_at desc);

/* ---------------------------------------------------------- animation jobs */
create table if not exists thy_media_animation_jobs (
  id uuid primary key default gen_random_uuid(),
  job_code text not null unique
    default 'THY-ANIM-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substr(encode(gen_random_bytes(4), 'hex'), 1, 8)),
  requested_by uuid not null default auth.uid(),

  -- The registered parent asset. Text ref rather than a foreign key because
  -- rael_media_assets belongs to the RAE Link lane and may be applied after
  -- this file; the reference is validated by the reconciliation view below.
  asset_code text not null,
  parent_version_no integer check (parent_version_no is null or parent_version_no >= 1),
  -- The parent's checksum at submission time. If the parent changes underneath
  -- a job, this is the evidence that it did.
  parent_checksum_sha256 text
    check (parent_checksum_sha256 is null or parent_checksum_sha256 ~ '^[a-f0-9]{64}$'),

  mode thy_animate_mode not null default 'AUTOMATIC',
  instruction text,
  markup_ref text references thy_media_markups (markup_ref),

  job_state thy_media_job_state not null default 'DRAFT',

  -- The router's answer, recorded verbatim. This is evidence, not a claim.
  provider_result jsonb,
  failure_reason text,
  -- The router's own audit id, so a job here can be traced to the router's log.
  audit_canonical_id text,
  -- The canonical review gate this result is decided against. Decisions are
  -- recorded by submit_thylora_review_gate_decision_v1 into
  -- thylora_chairman_review_decisions, not here.
  review_gate_canonical_id text,

  -- The NEW asset version the approved result became, once it exists. Null
  -- until then; a job never claims to have produced a version it has not.
  output_asset_code text,
  output_version_no integer check (output_version_no is null or output_version_no >= 2),

  submitted_at timestamptz,
  settled_at timestamptz,
  created_at timestamptz not null default now(),

  -- A submitted job must record when it was submitted.
  constraint thy_job_submitted_dated check (
    job_state = 'DRAFT' or submitted_at is not null
  ),
  -- A failure must say why. "It failed" with no reason is not a record.
  constraint thy_job_failure_explained check (
    job_state <> 'FAILED' or (failure_reason is not null and length(btrim(failure_reason)) > 0)
  ),
  -- THE CORE RULE, ENFORCED IN THE DATABASE:
  -- a job may not sit in a state that implies a usable result unless the
  -- provider result is present AND reports success. The UI rule in
  -- thylora-app/lib/media-studio.js is the same rule; this is the floor under
  -- it, so no other writer can mark a job reviewable without provider evidence.
  constraint thy_job_no_claim_without_provider_asset check (
    job_state not in ('REVIEW', 'APPROVED', 'QUEUED_FOR_PUBLISH')
    or (
      provider_result is not null
      and upper(coalesce(provider_result ->> 'status', '')) = 'SUCCEEDED'
      and coalesce(
            nullif(btrim(coalesce(provider_result ->> 'asset_url', '')), ''),
            nullif(btrim(coalesce(provider_result ->> 'output_url', '')), ''),
            nullif(btrim(coalesce(provider_result ->> 'url', '')), ''),
            nullif(btrim(coalesce(provider_result ->> 'storage_key', '')), '')
          ) is not null
    )
  ),
  -- A revision must carry something actionable: a note or a markup.
  constraint thy_job_revision_actionable check (
    job_state <> 'REVISION_REQUESTED'
    or markup_ref is not null
    or (instruction is not null and length(btrim(instruction)) > 0)
  ),
  -- An approved result that reached the queue must name the version it became.
  constraint thy_job_queued_names_output check (
    job_state <> 'QUEUED_FOR_PUBLISH' or output_asset_code is not null
  )
);

create index if not exists thy_media_jobs_asset_idx
  on thy_media_animation_jobs (asset_code, submitted_at desc);
create index if not exists thy_media_jobs_open_idx
  on thy_media_animation_jobs (job_state, submitted_at desc);

alter table thy_media_markups
  add constraint thy_markup_job_fk
  foreign key (job_code) references thy_media_animation_jobs (job_code) on delete set null
  not valid;

/* --------------------------------------------------- release requirements */
-- Logo requirement, QR destination and serial binding, per registered asset.
-- These were not previously recorded anywhere; before this table the logo
-- requirement was an unwritten expectation, which is why the studio reports
-- "requirement not declared" rather than assuming it is satisfied.
create table if not exists thy_media_release_requirements (
  id uuid primary key default gen_random_uuid(),
  asset_code text not null unique,
  -- Deliberately nullable: NULL means "not yet decided" and the studio says so.
  -- It must never default to false, which would read as "no logo needed".
  logo_required boolean,
  logo_asset_ref text,
  qr_destination_required boolean not null default true,
  serial_binding_required boolean not null default true,
  requirements_state text not null default 'DRAFT'
    check (requirements_state in ('DRAFT', 'DECLARED', 'LOCKED')),
  declared_by uuid,
  declared_at timestamptz,
  created_at timestamptz not null default now(),
  -- A declared requirement set must say who declared it and when.
  constraint thy_requirements_declared_witnessed check (
    requirements_state = 'DRAFT' or (declared_by is not null and declared_at is not null)
  ),
  -- If the logo is required, the logo asset must be named.
  constraint thy_requirements_logo_named check (
    logo_required is not true or (logo_asset_ref is not null and length(btrim(logo_asset_ref)) > 0)
  ),
  -- A LOCKED requirement set must have decided the logo question.
  constraint thy_requirements_locked_decided check (
    requirements_state <> 'LOCKED' or logo_required is not null
  )
);

/* ---------------------------------------------------------- continuity view */
-- Joins a job to the parent asset it came from, so a reader can see in one row
-- whether the parent still matches the checksum recorded at submission. Created
-- only when the RAE Link asset registry is present; a job is otherwise still
-- readable on its own.
do $$ begin
  if to_regclass('public.rael_media_assets') is null then
    raise notice 'THY-MEDIA: rael_media_assets is absent, so thy_media_job_continuity is not created. Apply db/rae-link/0002 to enable the parent-drift check.';
  else
    execute $view$
      create or replace view thy_media_job_continuity as
      select
        j.job_code,
        j.asset_code,
        j.mode,
        j.job_state,
        j.parent_version_no,
        j.parent_checksum_sha256,
        a.version_no        as parent_version_now,
        a.checksum_sha256   as parent_checksum_now,
        a.pipeline_state    as parent_pipeline_state,
        a.passport_ref,
        a.edf_ref,
        -- True when the parent has changed since the job was submitted.
        (j.parent_checksum_sha256 is not null
          and a.checksum_sha256 is not null
          and j.parent_checksum_sha256 <> a.checksum_sha256) as parent_drifted,
        j.output_asset_code,
        j.audit_canonical_id,
        j.submitted_at,
        j.settled_at
      from thy_media_animation_jobs j
      left join rael_media_assets a on a.asset_code = j.asset_code
    $view$;
    execute 'alter view thy_media_job_continuity set (security_invoker = true)';
  end if;
end $$;

/* ---------------------------------------------------------------- security */
alter table thy_media_animation_jobs        enable row level security;
alter table thy_media_markups               enable row level security;
alter table thy_media_release_requirements  enable row level security;

-- Chairman-only, using the CANONICAL gate. A job, a markup and a requirement
-- set are all Chairman artefacts; no public or member read exists.
drop policy if exists thy_media_jobs_chairman on thy_media_animation_jobs;
create policy thy_media_jobs_chairman on thy_media_animation_jobs
  for all using (thylora_is_chairman()) with check (thylora_is_chairman());

drop policy if exists thy_media_markups_chairman on thy_media_markups;
create policy thy_media_markups_chairman on thy_media_markups
  for all using (thylora_is_chairman() and author_user_id = auth.uid())
  with check (thylora_is_chairman() and author_user_id = auth.uid());

drop policy if exists thy_media_requirements_chairman on thy_media_release_requirements;
create policy thy_media_requirements_chairman on thy_media_release_requirements
  for all using (thylora_is_chairman()) with check (thylora_is_chairman());

revoke all on thy_media_animation_jobs from anon;
revoke all on thy_media_markups from anon;
revoke all on thy_media_release_requirements from anon;
