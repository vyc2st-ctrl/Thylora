-- THYLORA · Edition v2 Chairman Preview · MIGRATION
-- =================================================
-- Policy served: THY-APPROVAL-MUST-BE-VIEWABLE-001
--
-- The defect this closes
-- ----------------------
-- Today the Chairman's only view of an EDF package is thylora_edf_release_board_v1,
-- which returns FACTS ABOUT the package -- block count, character count,
-- "cover present", "source hash present" -- and never the package itself. The
-- only function that returns actual content is thylora_open_edf_v1, and that
-- serves a PUBLISHED package to an entitled customer. Publish freezes release
-- metadata permanently.
--
-- So the Chairman is asked to press an irreversible button on an artifact he has
-- never seen. This migration gives him the artifact.
--
-- What this migration does NOT do
-- -------------------------------
--   * It does not publish, activate, schedule, or release anything.
--   * It does not write to thylora_edf_packages. Not one column.
--   * It does not alter, replace or wrap thylora_edf_publish_v1,
--     thylora_edf_set_release_metadata_v1, thylora_edf_validate_v1 or
--     thylora_edf_release_board_v1.
--   * It does not overwrite history. The one table it creates is append-only
--     and UPDATE/DELETE are revoked and trigger-blocked.
--   * Recording APPROVE here does not publish. Publish remains the separate,
--     existing Chairman act on the existing panel.
--
-- BEFORE APPLYING
-- ---------------
-- Run sql/0000_preflight_schema.sql and confirm the column names used by
-- thylora_edf_preview_source below. That view is the ONLY place this migration
-- touches the EDF content tables; if the real names differ, change the view and
-- nothing else. Applying this file without that check is not supported.

begin;

-- 0. Requirement ----------------------------------------------------------
-- The content binding is a SHA-256 taken server-side over the exact bytes the
-- Chairman was shown. That needs pgcrypto.
do $$
begin
  if not exists (select 1 from pg_extension where extname = 'pgcrypto') then
    raise exception
      'THY-PREVIEW-PREREQ: pgcrypto is not installed. The content binding cannot be computed without it.';
  end if;
end $$;


-- 1. Adapter view: the single point of contact with the EDF content tables --
--    CONFIRM THESE NAMES AGAINST PREFLIGHT SECTION 2 BEFORE APPLYING.
--    Shape required downstream:
--      edf_code, title, state, cover_asset_ref, source_hash,
--      package_version, block_ordinal, block_text
create or replace view public.thylora_edf_preview_source as
select
  p.edf_code                       as edf_code,
  p.title                          as title,
  p.state                          as state,
  p.cover_asset_ref                as cover_asset_ref,
  p.source_hash                    as source_hash,
  p.updated_at                     as package_version,
  b.ordinal                        as block_ordinal,
  b.text                           as block_text
from public.thylora_edf_packages p
left join public.thylora_edf_text_blocks b on b.edf_code = p.edf_code;

comment on view public.thylora_edf_preview_source is
  'Adapter for the Chairman preview functions. Read-only. If the EDF content '
  'tables are renamed or reshaped, change THIS view and nothing else.';


-- 2. Deterministic content digest -----------------------------------------
-- Definition, so it can be reproduced by hand and audited:
--   edf_code
--   U+001F  cover_asset_ref (empty string when absent)
--   then, for each text block in ascending ordinal:
--     U+001E  ordinal  U+001D  block text
-- SHA-256 of that UTF-8 byte string, lowercase hex.
--
-- Two packages with identical visible content produce an identical digest.
-- Any change to the cover reference, to any block's text, to block order, or to
-- the number of blocks produces a different digest. That is the whole point:
-- the digest names what was SEEN, not what the row is called.
create or replace function public.thylora_edf_content_digest_v1(p_edf_code text)
returns text
language sql
stable
security definer
set search_path = public, extensions, pg_temp
as $$
  with src as (
    select edf_code, cover_asset_ref, block_ordinal, block_text
    from public.thylora_edf_preview_source
    where edf_code = p_edf_code
  ),
  head as (
    select p_edf_code
           || chr(31)
           || coalesce(max(cover_asset_ref), '') as h
    from src
  ),
  body as (
    select coalesce(string_agg(
             chr(30) || block_ordinal::text || chr(29) || coalesce(block_text, ''),
             '' order by block_ordinal
           ), '') as b
    from src
    where block_ordinal is not null
  )
  select case
           when not exists (select 1 from src) then null
           else encode(extensions.digest((select h from head) || (select b from body), 'sha256'), 'hex')
         end;
$$;

comment on function public.thylora_edf_content_digest_v1(text) is
  'SHA-256 over the exact content the preview renders. Read-only. Returns NULL '
  'for an unknown edf_code.';


-- 3. Append-only record of what the Chairman decided, against what he saw ---
create table if not exists public.thylora_edf_preview_decisions (
  id              bigint generated always as identity primary key,
  edf_code        text        not null,
  decision        text        not null check (decision in ('APPROVE','REVISE','HOLD')),
  content_digest  text        not null,
  source_hash     text,
  package_state   text        not null,
  package_version text,
  note            text,
  decided_by      uuid        not null,
  decided_at      timestamptz not null default now()
);

create index if not exists thylora_edf_preview_decisions_code_idx
  on public.thylora_edf_preview_decisions (edf_code, decided_at desc);

comment on table public.thylora_edf_preview_decisions is
  'Append-only. One row per Chairman preview decision, bound to the SHA-256 of '
  'the content shown at the moment of decision. Never updated, never deleted.';

-- Append-only is enforced, not merely intended.
create or replace function public.thylora_edf_preview_decisions_immutable()
returns trigger
language plpgsql
as $$
begin
  raise exception 'THY-IMMUTABLE: thylora_edf_preview_decisions is append-only. % is refused.', tg_op
    using errcode = '42501';
end;
$$;

drop trigger if exists thylora_edf_preview_decisions_no_update on public.thylora_edf_preview_decisions;
create trigger thylora_edf_preview_decisions_no_update
  before update or delete on public.thylora_edf_preview_decisions
  for each row execute function public.thylora_edf_preview_decisions_immutable();

alter table public.thylora_edf_preview_decisions enable row level security;

drop policy if exists thylora_edf_preview_decisions_read on public.thylora_edf_preview_decisions;
create policy thylora_edf_preview_decisions_read
  on public.thylora_edf_preview_decisions
  for select using (public.thylora_is_chairman());

-- No INSERT policy on purpose: the only way in is the function below, which
-- verifies the digest first. A direct client insert cannot record a decision.


-- 4. Preview board: what is awaiting a look, and can it actually be shown ---
create or replace function public.thylora_edf_preview_board_v1()
returns jsonb
language plpgsql
stable
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  result jsonb;
begin
  if not public.thylora_is_chairman() then
    raise exception 'THY-DENY: the Edition preview board is Chairman-only.'
      using errcode = '42501';
  end if;

  select jsonb_build_object(
    'generated_at', now(),
    'policy', 'THY-APPROVAL-MUST-BE-VIEWABLE-001',
    'packages', coalesce(jsonb_agg(row_to_json(x)::jsonb order by x.edf_code), '[]'::jsonb)
  )
  into result
  from (
    select
      s.edf_code,
      max(s.title)                                    as title,
      max(s.state)                                    as state,
      max(s.package_version)::text                    as package_version,
      max(s.source_hash)                              as source_hash,
      (max(s.source_hash) is not null)                as source_hash_present,
      (max(s.cover_asset_ref) is not null)            as cover_present,
      count(s.block_ordinal)                          as text_blocks,
      coalesce(sum(length(s.block_text)), 0)          as text_characters,
      public.thylora_edf_content_digest_v1(s.edf_code) as content_digest,
      -- Viewable means: there is something to look at. A package with no text
      -- blocks is NOT viewable and must not be presented as ready to approve.
      (count(s.block_ordinal) > 0)                    as viewable,
      (
        select jsonb_build_object(
                 'decision', d.decision,
                 'decided_at', d.decided_at,
                 'content_digest', d.content_digest,
                 'still_current', d.content_digest = public.thylora_edf_content_digest_v1(s.edf_code),
                 'note', d.note)
        from public.thylora_edf_preview_decisions d
        where d.edf_code = s.edf_code
        order by d.decided_at desc, d.id desc
        limit 1
      )                                               as last_decision
    from public.thylora_edf_preview_source s
    group by s.edf_code
  ) x;

  return result;
end;
$$;

comment on function public.thylora_edf_preview_board_v1() is
  'Chairman-only. Lists every EDF package with its binding and whether it can '
  'actually be viewed. Read-only: publishes nothing, changes no package state.';


-- 5. The preview itself: the artifact, not a description of it -------------
create or replace function public.thylora_edf_preview_v1(p_edf_code text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  result jsonb;
  found  boolean;
begin
  if not public.thylora_is_chairman() then
    raise exception 'THY-DENY: Edition preview is Chairman-only.'
      using errcode = '42501';
  end if;

  select exists (select 1 from public.thylora_edf_preview_source where edf_code = p_edf_code)
  into found;

  if not found then
    return jsonb_build_object(
      'viewable', false,
      'edf_code', p_edf_code,
      'reason', 'No EDF package with this code exists.');
  end if;

  select jsonb_build_object(
    'viewable',        count(s.block_ordinal) > 0,
    'reason',          case when count(s.block_ordinal) > 0 then null
                            else 'This package has no text blocks. There is nothing to show, '
                                 'so there is nothing to approve.' end,
    'edf_code',        p_edf_code,
    'title',           max(s.title),
    'state',           max(s.state),
    'package_version', max(s.package_version)::text,
    'source_hash',     max(s.source_hash),
    'content_digest',  public.thylora_edf_content_digest_v1(p_edf_code),
    'digest_algorithm','sha256',
    'previewed_at',    now(),
    'text_blocks',     count(s.block_ordinal),
    'text_characters', coalesce(sum(length(s.block_text)), 0),
    'cover_asset_ref', max(s.cover_asset_ref),
    'blocks', coalesce(
      (select jsonb_agg(jsonb_build_object('ordinal', b.block_ordinal, 'text', b.block_text)
                        order by b.block_ordinal)
       from public.thylora_edf_preview_source b
       where b.edf_code = p_edf_code and b.block_ordinal is not null),
      '[]'::jsonb)
  )
  into result
  from public.thylora_edf_preview_source s
  where s.edf_code = p_edf_code;

  return result;
end;
$$;

comment on function public.thylora_edf_preview_v1(text) is
  'Chairman-only. Returns the full renderable content of one EDF package -- '
  'cover reference and every text block in order -- together with the source '
  'hash, package version and the content digest of exactly these bytes. '
  'Read-only. Does not publish and does not change package state.';


-- 6. Recording a decision -- and refusing a stale one ----------------------
-- If the content changed between the Chairman looking and the Chairman
-- deciding, the digest he sends back no longer matches. The write is REFUSED.
-- That is what makes "the preview is the exact artifact under approval" a
-- guarantee rather than a claim.
create or replace function public.thylora_edf_record_preview_decision_v1(
  p_edf_code       text,
  p_decision       text,
  p_content_digest text,
  p_note           text default null
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  current_digest text;
  pkg            record;
  new_id         bigint;
begin
  if not public.thylora_is_chairman() then
    raise exception 'THY-DENY: recording a preview decision is Chairman-only.'
      using errcode = '42501';
  end if;

  if p_decision is null or p_decision not in ('APPROVE','REVISE','HOLD') then
    raise exception 'THY-PREVIEW-DECISION: decision must be APPROVE, REVISE or HOLD. Got %.', p_decision
      using errcode = '22023';
  end if;

  select max(state) as state, max(source_hash) as source_hash, max(package_version)::text as package_version
  into pkg
  from public.thylora_edf_preview_source
  where edf_code = p_edf_code;

  if pkg.state is null then
    raise exception 'THY-PREVIEW-DECISION: no EDF package with code %.', p_edf_code
      using errcode = 'P0002';
  end if;

  current_digest := public.thylora_edf_content_digest_v1(p_edf_code);

  if current_digest is null then
    raise exception 'THY-PREVIEW-EMPTY: % has no viewable content. A decision cannot be recorded against nothing.', p_edf_code
      using errcode = '22023';
  end if;

  if p_content_digest is distinct from current_digest then
    raise exception
      'THY-PREVIEW-STALE: the content changed since it was shown. Decision refused. Shown %, now %.',
      p_content_digest, current_digest
      using errcode = '40001';
  end if;

  insert into public.thylora_edf_preview_decisions
    (edf_code, decision, content_digest, source_hash, package_state, package_version, note, decided_by)
  values
    (p_edf_code, p_decision, current_digest, pkg.source_hash, pkg.state, pkg.package_version,
     nullif(btrim(coalesce(p_note, '')), ''), auth.uid())
  returning id into new_id;

  return jsonb_build_object(
    'recorded', true,
    'id', new_id,
    'edf_code', p_edf_code,
    'decision', p_decision,
    'content_digest', current_digest,
    'package_state', pkg.state,
    'published', false,
    'authorizes',
      case p_decision
        when 'APPROVE' then 'Records that the Chairman viewed this exact content and finds it fit to release. '
                            'It does NOT publish. Publishing remains the separate act on the Store Release panel.'
        when 'REVISE'  then 'Records that this exact content must change before it is asked about again.'
        when 'HOLD'    then 'Records that this exact content is stopped. No further release step should be taken.'
      end
  );
end;
$$;

comment on function public.thylora_edf_record_preview_decision_v1(text, text, text, text) is
  'Chairman-only. Appends a preview decision bound to the digest of the content '
  'shown. Refuses a stale digest. Never publishes and never alters the package.';


-- 7. Grants ---------------------------------------------------------------
revoke all on function public.thylora_edf_content_digest_v1(text) from public, anon;
revoke all on function public.thylora_edf_preview_board_v1() from public, anon;
revoke all on function public.thylora_edf_preview_v1(text) from public, anon;
revoke all on function public.thylora_edf_record_preview_decision_v1(text, text, text, text) from public, anon;

grant execute on function public.thylora_edf_preview_board_v1() to authenticated;
grant execute on function public.thylora_edf_preview_v1(text) to authenticated;
grant execute on function public.thylora_edf_record_preview_decision_v1(text, text, text, text) to authenticated;

-- The adapter view is not client-readable. Everything goes through the gated
-- functions, so anon never reaches unpublished content.
revoke all on public.thylora_edf_preview_source from public, anon, authenticated;

revoke insert, update, delete on public.thylora_edf_preview_decisions from public, anon, authenticated;
grant select on public.thylora_edf_preview_decisions to authenticated;

commit;
