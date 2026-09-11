-- RAE LINK · 0003 · Rights, provenance, consent, takedown and appeal
-- Workroom: WR-RAELINK-001
--
-- SAFEGUARD: this schema deliberately contains no field for a medical diagnosis,
-- condition, prognosis, treatment or medical record. Minimum necessary
-- information only. rael_consents.medical_details_collected is constrained to
-- false so a future migration cannot quietly start collecting it without an
-- explicit, reviewable constraint change.

begin;

do $$ begin
  create type rael_ownership_basis as enum (
    'OWNED_ORIGINAL',
    'AUTHORIZED_BY_RIGHTS_HOLDER',
    'LICENSED',
    'PUBLIC_DOMAIN',
    'FAMILY_CONSENT',
    'WORLD_PRODUCTION',
    'UNRESOLVED'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type rael_storytelling_mode as enum ('PRIVATE','PSEUDONYMOUS','LIMITED','PUBLIC');
exception when duplicate_object then null; end $$;

create table if not exists rael_rights_records (
  id                  uuid primary key default gen_random_uuid(),
  asset_id            uuid not null references rael_media_assets(id) on delete cascade,
  ownership_basis     rael_ownership_basis not null default 'UNRESOLVED',
  rights_holder_name  text,
  rights_holder_ref   text,
  license_ref         text,
  territory           text not null default 'WORLDWIDE',
  term_start          date,
  term_end            date,
  is_exclusive        boolean not null default false,
  authority_evidence  jsonb not null default '{}'::jsonb,
  gate_state          text not null default 'PENDING'
                      check (gate_state in ('PENDING','PASSED','FAILED','EXPIRED','REVOKED')),
  verified_by         uuid references auth.users(id),
  verified_at         timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  constraint rael_rights_term_order check (term_end is null or term_start is null or term_end >= term_start),
  -- A rights gate cannot pass while the basis is unresolved, and anything other
  -- than an owned original must name who authorized it.
  constraint rael_rights_pass_requires_basis check (
    gate_state <> 'PASSED' or (
      ownership_basis <> 'UNRESOLVED'
      and (ownership_basis in ('OWNED_ORIGINAL','PUBLIC_DOMAIN','WORLD_PRODUCTION')
           or rights_holder_name is not null)
    )
  )
);

create unique index if not exists rael_rights_one_active_per_asset
  on rael_rights_records(asset_id) where gate_state in ('PENDING','PASSED');

create table if not exists rael_provenance_events (
  id                 bigserial primary key,
  asset_id           uuid not null references rael_media_assets(id) on delete cascade,
  event_type         text not null check (event_type in
                       ('CAPTURED','CREATED','DERIVED','AI_ASSISTED','RESTORED','IMPORTED','TRANSFERRED')),
  source_description text not null,
  occurred_at        timestamptz,
  place_ref          text,
  derived_from_ref   text,
  tool_disclosure    text,
  recorded_by        uuid references auth.users(id),
  evidence           jsonb not null default '{}'::jsonb,
  created_at         timestamptz not null default now()
);

create index if not exists rael_provenance_asset_idx on rael_provenance_events(asset_id, id);

-- Consent is recorded per subject, not per upload, so a family can change how
-- their story is told without the platform losing the original record.
create table if not exists rael_consents (
  id                        uuid primary key default gen_random_uuid(),
  consent_code              text not null unique,
  subject_kind              text not null check (subject_kind in ('ADULT','MINOR','FAMILY','ESTATE','WORLD_CHARACTER')),
  subject_ref               text not null,
  subject_user_id           uuid references auth.users(id),
  guardian_user_id          uuid references auth.users(id),
  guardian_evidence         jsonb not null default '{}'::jsonb,
  storytelling_mode         rael_storytelling_mode not null default 'PRIVATE',
  scope                     text[] not null default '{}',
  medical_details_collected boolean not null default false,
  granted_at                timestamptz not null default now(),
  expires_at                timestamptz,
  revoked_at                timestamptz,
  revocation_reason         text,
  evidence                  jsonb not null default '{}'::jsonb,
  -- Children require guardian authority. No exception path is provided here.
  constraint rael_consent_minor_guardian
    check (subject_kind <> 'MINOR' or guardian_user_id is not null),
  -- Minimum necessary information. Medical detail is never a stored consent field.
  constraint rael_consent_no_medical_detail
    check (medical_details_collected = false)
);

create table if not exists rael_asset_consents (
  asset_id   uuid not null references rael_media_assets(id) on delete cascade,
  consent_id uuid not null references rael_consents(id) on delete restrict,
  attached_at timestamptz not null default now(),
  primary key (asset_id, consent_id)
);

create table if not exists rael_takedown_requests (
  id             uuid primary key default gen_random_uuid(),
  request_code   text not null unique,
  asset_id       uuid references rael_media_assets(id) on delete set null,
  channel_id     uuid references rael_channels(id) on delete set null,
  claim_kind     text not null check (claim_kind in
                   ('COPYRIGHT','TRADEMARK','PRIVACY','IMPERSONATION','CONSENT_WITHDRAWN','SAFETY','OTHER')),
  claimant_name  text not null,
  claimant_contact text not null,
  claim_statement text not null,
  evidence       jsonb not null default '{}'::jsonb,
  request_state  text not null default 'RECEIVED'
                 check (request_state in ('RECEIVED','UNDER_REVIEW','ACTIONED','REJECTED','WITHDRAWN')),
  actioned_at    timestamptz,
  created_at     timestamptz not null default now()
);

create table if not exists rael_appeals (
  id             uuid primary key default gen_random_uuid(),
  appeal_code    text not null unique,
  subject_kind   text not null check (subject_kind in ('MODERATION','TAKEDOWN','PAYOUT','ACCOUNT')),
  subject_ref    text not null,
  filed_by       uuid references auth.users(id),
  statement      text not null,
  evidence       jsonb not null default '{}'::jsonb,
  appeal_state   text not null default 'FILED'
                 check (appeal_state in ('FILED','UNDER_REVIEW','UPHELD','OVERTURNED','WITHDRAWN')),
  decided_at     timestamptz,
  decision_note  text,
  created_at     timestamptz not null default now()
);

drop trigger if exists rael_rights_touch on rael_rights_records;
create trigger rael_rights_touch before update on rael_rights_records
  for each row execute function rael_touch_updated_at();

commit;
