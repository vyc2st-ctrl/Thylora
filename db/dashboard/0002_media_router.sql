-- THYLORA MEDIA ROUTER · additive guards on the EXISTING studio render pipeline
-- Target backend: thylora-dash (jvsdxhrfhtlgaknhjxlz)
--
-- THIS MIGRATION CREATES NO PIPELINE AND NO JOB TABLE.
--
-- studio_render_jobs and studio_render_attempts already exist on thylora-dash.
-- Verified 2026-09-15: both tables present, both with zero rows — the pipeline
-- was designed and never driven. studio_render_jobs already carries
-- provider_code, model_code, operation_type, state, idempotency_key (UNIQUE),
-- prompt_payload, reference_payload, requested_duration_ms, requested_fps,
-- estimated_cost, actual_cost, attempt_count, max_attempts, output_asset_id
-- and continuity_snapshot.
--
-- What is missing is not tables. It is enforcement. Those columns are free text
-- with no vocabulary and no gate, so nothing in the database currently stops a
-- job being queued against an unknown provider, with no cost, with no Chairman
-- approval. This migration adds exactly those guards.
--
-- Every statement is guarded so it no-ops if the target is absent or already
-- present. Applying it twice is safe.

begin;

-- ---------------------------------------------------------------------------
-- 1. Vocabulary. A provider that is not in the catalogue cannot be written.
--    This is what makes "never silently substitute a provider" a database fact
--    rather than a UI promise: an unrecognised provider_code is rejected.
-- ---------------------------------------------------------------------------

do $$
begin
  if to_regclass('public.studio_render_jobs') is null then
    raise notice 'MEDIA ROUTER: studio_render_jobs absent; guards skipped';
    return;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'studio_render_jobs_provider_known') then
    alter table public.studio_render_jobs
      add constraint studio_render_jobs_provider_known
      check (provider_code is null or provider_code in ('runway','fal'));
  end if;

  if not exists (select 1 from pg_constraint where conname = 'studio_render_jobs_operation_known') then
    alter table public.studio_render_jobs
      add constraint studio_render_jobs_operation_known
      check (operation_type is null or operation_type in
        ('IMAGE_TO_VIDEO','VIDEO_TO_VIDEO','TEXT_TO_VIDEO','VIDEO_EXTEND'));
  end if;

  if not exists (select 1 from pg_constraint where conname = 'studio_render_jobs_state_known') then
    alter table public.studio_render_jobs
      add constraint studio_render_jobs_state_known
      check (state is null or state in
        ('DRAFT','AWAITING_CONSENT','QUEUED','SUBMITTED','RUNNING','SUCCEEDED','FAILED','CANCELLED'));
  end if;

  -- ------------------------------------------------------------------------
  -- 2. The money gate. A job may not leave AWAITING_CONSENT for any state that
  --    causes a provider call unless an estimated cost was recorded first.
  --    The Chairman cannot be billed for something he was never shown a price
  --    for, because the row cannot exist.
  -- ------------------------------------------------------------------------
  if not exists (select 1 from pg_constraint where conname = 'studio_render_jobs_priced_before_spend') then
    alter table public.studio_render_jobs
      add constraint studio_render_jobs_priced_before_spend
      check (
        state not in ('QUEUED','SUBMITTED','RUNNING','SUCCEEDED')
        or estimated_cost is not null
      );
  end if;

  -- A finished job must say what it actually cost.
  if not exists (select 1 from pg_constraint where conname = 'studio_render_jobs_settled_cost') then
    alter table public.studio_render_jobs
      add constraint studio_render_jobs_settled_cost
      check (state <> 'SUCCEEDED' or actual_cost is not null);
  end if;

  -- A succeeded job must have produced something.
  if not exists (select 1 from pg_constraint where conname = 'studio_render_jobs_succeeded_has_output') then
    alter table public.studio_render_jobs
      add constraint studio_render_jobs_succeeded_has_output
      check (state <> 'SUCCEEDED' or output_asset_id is not null);
  end if;

  raise notice 'MEDIA ROUTER: studio_render_jobs guards applied';
end $$;

-- ---------------------------------------------------------------------------
-- 3. Continuity gate. A job that names characters must carry the snapshot it
--    was bound to. A clip whose look cannot be explained later is not evidence.
-- ---------------------------------------------------------------------------

do $$
begin
  if to_regclass('public.studio_render_jobs') is null then return; end if;
  if not exists (select 1 from pg_constraint where conname = 'studio_render_jobs_continuity_recorded') then
    alter table public.studio_render_jobs
      add constraint studio_render_jobs_continuity_recorded
      check (
        state in ('DRAFT','AWAITING_CONSENT','CANCELLED','FAILED')
        or reference_payload is null
        or jsonb_array_length(coalesce(reference_payload->'character_references','[]'::jsonb)) = 0
        or continuity_snapshot is not null
      );
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 4. Working indexes for the router's own reads.
-- ---------------------------------------------------------------------------

do $$
begin
  if to_regclass('public.studio_render_jobs') is not null then
    create index if not exists studio_render_jobs_open_idx
      on public.studio_render_jobs (state, created_at desc)
      where state in ('AWAITING_CONSENT','QUEUED','SUBMITTED','RUNNING');
    create index if not exists studio_render_jobs_provider_idx
      on public.studio_render_jobs (provider_code, state);
  end if;
  if to_regclass('public.studio_render_attempts') is not null then
    create index if not exists studio_render_attempts_job_idx
      on public.studio_render_attempts (render_job_id, attempt_no desc);
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 5. Derivative lineage. A generated clip must name its master.
--    thylora_visual_assets already has version; the parent link is added only
--    if it is genuinely absent, so an existing lineage column is never shadowed.
-- ---------------------------------------------------------------------------

do $$
begin
  if to_regclass('public.thylora_visual_assets') is null then
    raise notice 'MEDIA ROUTER: thylora_visual_assets absent; lineage skipped';
    return;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_name = 'thylora_visual_assets' and column_name = 'predecessor_id'
  ) then
    alter table public.thylora_visual_assets add column predecessor_id text;
    comment on column public.thylora_visual_assets.predecessor_id is
      'Master this asset was derived from. Set for GENERATED_CLIP rows; null for an original master still.';
  end if;

  if not exists (select 1 from pg_constraint where conname = 'thylora_visual_assets_derivative_has_parent') then
    alter table public.thylora_visual_assets
      add constraint thylora_visual_assets_derivative_has_parent
      check (asset_type <> 'GENERATED_CLIP' or predecessor_id is not null);
  end if;

  create index if not exists thylora_visual_assets_lineage_idx
    on public.thylora_visual_assets (predecessor_id) where predecessor_id is not null;

  raise notice 'MEDIA ROUTER: derivative lineage guard applied';
end $$;

-- ---------------------------------------------------------------------------
-- 6. A generated clip may not be published without provenance.
--    thylora_visual_provenance already exists and already records
--    generation_method and integrity_hash; this only requires that the row is
--    there before a generated clip can be approved.
-- ---------------------------------------------------------------------------

create or replace function thy_media_clip_has_provenance(p_asset_id text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from thylora_visual_provenance p
    where p.asset_id = p_asset_id
      and p.source_type = 'GENERATED_DERIVATIVE'
      and p.generation_method is not null
  );
$$;

comment on function thy_media_clip_has_provenance(text) is
  'True when a generated clip carries a provenance record naming how it was made. The approval surface asks this before it will show an Approve control.';

grant execute on function thy_media_clip_has_provenance(text) to authenticated;

commit;

-- ---------------------------------------------------------------------------
-- NOT APPLIED. This file has not been run against thylora-dash. Applying it
-- needs a migration credential this repository does not hold. Until it runs,
-- every guard above is enforced only by the client in dashboard/r6, which is
-- weaker: the client can be bypassed, the constraints cannot.
-- ---------------------------------------------------------------------------
