-- Validation scaffolding ONLY. Never applied to a real backend.
-- Minimal stand-ins for the live objects the gateway reads, shaped from the
-- thylora-dash catalogue read on 2026-09-17. Column names and types match the
-- live schema for every column the gateway touches; nothing else is modelled.
create extension if not exists pgcrypto;
create schema if not exists auth;

create or replace function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;
create or replace function auth.role() returns text language sql stable as $$
  select coalesce(nullif(current_setting('request.jwt.claim.role', true), ''), 'anon');
$$;
create or replace function auth.jwt() returns jsonb language sql stable as $$
  select coalesce(nullif(current_setting('request.jwt.claims', true), '')::jsonb, '{}'::jsonb);
$$;

do $$ begin create role anon;          exception when duplicate_object then null; end $$;
do $$ begin create role authenticated; exception when duplicate_object then null; end $$;
do $$ begin create role service_role;  exception when duplicate_object then null; end $$;
do $$ begin create role authenticator; exception when duplicate_object then null; end $$;

create table if not exists thylora_user_roles (
  user_id uuid, role text, display_name text,
  created_at timestamptz default now(), updated_at timestamptz default now());

create or replace function thylora_is_chairman() returns boolean
language sql stable set search_path to 'public','auth' as $$
  select exists (select 1 from public.thylora_user_roles
                  where user_id = auth.uid() and role = 'chairman');
$$;
create or replace function thylora_is_trusted_server() returns boolean
language sql stable set search_path to 'public','auth' as $$
  select coalesce(auth.role(), '') = 'service_role';
$$;

create table if not exists thylora_autonomy_credentials (
  credential_code text primary key, secret_value text, enabled boolean default true,
  created_at timestamptz default now(), rotated_at timestamptz);

create table if not exists thylora_continuity_boot_registry (
  id uuid default gen_random_uuid(), boot_code text, version integer, authority text,
  status text, retrieval_order jsonb, controlling_rules jsonb, required_response_gate jsonb,
  connection_boundary text, fallback_behavior text, restart_behavior text,
  created_at timestamptz default now(), updated_at timestamptz default now());

create table if not exists thylora_query_carryforward (
  id uuid default gen_random_uuid(), query_id text primary key, source_app text,
  session_label text, user_message text, assistant_message text, message_hash text,
  authority text, truth_class text, capture_state text, continuity_refs jsonb,
  orah_review_id uuid, restart_point text, created_at timestamptz default now(),
  sequence_no bigserial, previous_query_id text, next_query_id text,
  verbatim_locked boolean default true, user_message_hash text, assistant_message_hash text,
  compressed_summary jsonb, custody_context jsonb, created_by text, source_thread_id text,
  source_message_index bigint, source_timestamp timestamptz, import_batch_id uuid,
  capture_method text, supersession_state text);

create table if not exists restart_records (
  id uuid default gen_random_uuid(), canonical_id text, project_id text, title text,
  truth_class text, state text, exact_restart_point text, blocking_dependency text,
  next_action text, evidence_status text, predecessor_id uuid, version integer,
  metadata jsonb, created_by uuid, created_at timestamptz default now(),
  updated_at timestamptz default now());

create table if not exists thylora_continuity_anchor_authority (
  authority_ordinal bigserial, authority_id uuid default gen_random_uuid(), action text,
  anchor_query_id text, anchor_sequence_no bigint, authority_kind text, authority text,
  authorized_by text, evidence_query_id text, evidence_note text, policy_code text,
  revokes_authority_id uuid, validation_state text, effective_from timestamptz,
  recorded_at timestamptz default now(), recorded_by_db_user text);

create table if not exists thylora_dashboard_authority_lock (
  id boolean primary key default true, lock_state text, current_frontend_provider text,
  current_frontend_project_id text, current_frontend_name text, current_frontend_url text,
  backend_project_ref text, floor_code text, blocked_frontends jsonb, promotion_rule text,
  chairman_change_required boolean, created_at timestamptz default now(),
  updated_at timestamptz default now());

create table if not exists thylora_workroom_registry (
  id uuid default gen_random_uuid(), workroom_code text primary key, title text, lane text,
  purpose text, state text, source_of_truth text, current_blockers jsonb,
  completion_tests jsonb, evidence jsonb, restart_point text,
  created_at timestamptz default now(), updated_at timestamptz default now());

create table if not exists thylora_workroom_task_registry (
  id uuid default gen_random_uuid(), workroom_code text, task_code text, title text,
  state text, owner_lane text, depends_on jsonb, blocker text, evidence jsonb,
  next_action text, created_at timestamptz default now(), updated_at timestamptz default now());

create table if not exists thylora_store_product_readiness (
  readiness_id uuid default gen_random_uuid(), external_product_id text, product_title text,
  sell_intent boolean, product_state text, source_complete boolean,
  final_artifact_complete boolean, product_specific_visual_complete boolean,
  visual_preflight_passed boolean, rights_passed boolean, delivery_connected boolean,
  reaccess_verified boolean, checkout_path_verified boolean, mobile_preview_passed boolean,
  active_allowed boolean, blockers jsonb, next_executable_work text, evidence jsonb,
  created_at timestamptz default now(), updated_at timestamptz default now());

create table if not exists thylora_chairman_action_routes (
  id uuid default gen_random_uuid(), route_code text, subject_reference text, problem text,
  chairman_required boolean, exact_system text, exact_object_reference text,
  direct_location text, direct_url text, steps jsonb, completion_evidence text, state text,
  no_wormhole boolean, created_at timestamptz default now(), updated_at timestamptz default now());

create table if not exists products (
  id uuid primary key default gen_random_uuid(), product_id text, title text, description text,
  product_type text, creator text, contributors jsonb, image_state text, video_state text,
  price_state text, price numeric, availability text, inventory_state text,
  delivery_method text, rights_state text, refund_terms text, age_guidance text,
  privacy_state text, passport_id text, related_programs jsonb, related_world_locations jsonb,
  approval_state text, release_evidence_state text,
  created_at timestamptz default now(), updated_at timestamptz default now());

create table if not exists digital_product_passports (
  id uuid default gen_random_uuid(), passport_id text, product_id uuid, program_id uuid,
  provenance jsonb, rights jsonb, contributors jsonb, approval_state text,
  created_at timestamptz default now(), updated_at timestamptz default now());

create table if not exists thylora_product_release_decisions (
  decision_id uuid default gen_random_uuid(), external_product_id text, product_title text,
  approved_visual_url text, visual_approved boolean, rights_release_confirmed boolean,
  decided_by uuid, decided_at timestamptz, decision_note text, evidence jsonb);

create table if not exists thylora_delivery_assets (
  asset_id text primary key, external_product_id text, product_title text, filename text,
  mime_type text, content_sha256 text, file_bytes bytea, release_state text,
  created_at timestamptz default now(), updated_at timestamptz default now());

create table if not exists thylora_product_entitlements (
  entitlement_id uuid default gen_random_uuid(), user_id uuid, external_product_id text,
  source_provider text, source_reference text, state text, granted_at timestamptz,
  revoked_at timestamptz, metadata jsonb);

create table if not exists thylora_gate_definitions (
  id uuid default gen_random_uuid(), canonical_id text, gate_code text, title text,
  purpose text, configuration jsonb, state text,
  created_at timestamptz default now(), updated_at timestamptz default now());

create table if not exists thylora_chairman_review_gates (
  id uuid default gen_random_uuid(), canonical_id text unique, subject_type text,
  subject_reference text, reserved_decision text, risk_level text, reason text, state text,
  source_records jsonb, resolved_by uuid, resolved_at timestamptz,
  created_at timestamptz default now(), updated_at timestamptz default now());

create table if not exists thylora_question_marks (
  mark_id uuid default gen_random_uuid(), subject_kind text, subject_ref text,
  mark_state text, participates boolean default true, created_at timestamptz default now());

-- Stand-in for the live custody function. Same parameter names and order.
create or replace function thylora_capture_query_pair(
  p_query_id text, p_source_app text, p_session_label text, p_user_message text,
  p_assistant_message text, p_message_hash text, p_truth_class text, p_continuity_refs jsonb,
  p_restart_point text, p_source_thread_id text, p_source_message_index bigint,
  p_source_timestamp timestamptz, p_import_batch_id uuid, p_capture_method text,
  p_compressed_summary jsonb, p_custody_context jsonb)
returns void language plpgsql security definer set search_path to 'public' as $$
begin
  insert into thylora_query_carryforward(
    query_id, source_app, session_label, user_message, assistant_message, message_hash,
    truth_class, capture_state, continuity_refs, restart_point, source_thread_id,
    source_message_index, source_timestamp, import_batch_id, capture_method,
    compressed_summary, custody_context, user_message_hash, assistant_message_hash)
  values (p_query_id, p_source_app, p_session_label, p_user_message, p_assistant_message,
    p_message_hash, p_truth_class, 'CAPTURED', p_continuity_refs, p_restart_point,
    p_source_thread_id, p_source_message_index, p_source_timestamp, p_import_batch_id,
    p_capture_method, p_compressed_summary, p_custody_context,
    encode(digest(coalesce(p_user_message,''),'sha256'),'hex'),
    case when p_assistant_message is null then null
         else encode(digest(p_assistant_message,'sha256'),'hex') end);
end $$;
