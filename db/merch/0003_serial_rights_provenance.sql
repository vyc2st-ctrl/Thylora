-- THYLORA merchandise lane · 0003 · serial logic, rights, provenance
-- ADDITIVE ONLY. Not applied by this repository.
--
-- Serial logic is subordinate to THY-SERIAL-COLLECTIBLE-001 (Chairman Vyctor
-- Peete) already in the backend. This lane adds the merchandise grammar; it does
-- not restate or weaken that policy.

begin;

-- ---------------------------------------------------------------------------
-- Serial grammar
--
--   ERM-<CLASS>-<FAMILY>-<ARTWORK>-R<run>-<COPY>[-P<8 hex>]
--
--   CLASS    product class code            MUG CUP STK PCH SHIRT SWEAT SOCK
--                                          TABDEC LOCDEC NECK ORAH
--   FAMILY   L | LP | LS
--   ARTWORK  artwork lock short code       ERGLASSHAT ERMASTHEAD ERREARTABLET ...
--   run      R001..R999
--   COPY     00001..99999, or ORIG for the source master
--   P<hex>   optional personalisation digest. The digest only. Never the
--            personal data, per THY-SERIAL-COLLECTIBLE-001 machine_readable_rule.
--
--   ERM-STK-L-ERGLASSHAT-R001-00001
--   ERM-MUG-LP-ERMASTHEAD-R001-00042
--   ERM-CUP-LS-SPORTS001-R001-ORIG
-- ---------------------------------------------------------------------------
create table if not exists merch_serial_rule (
  rule_code             text primary key,
  parent_policy         text not null,           -- THY-SERIAL-COLLECTIBLE-001
  authority             text not null,
  grammar               text not null,
  grammar_regex         text not null,
  segment_spec          jsonb not null,
  original_rule         text not null,
  edition_rule          text not null,
  copy_number_rule      text not null,
  personalization_rule  text not null,
  visible_marking_rule  text not null,
  machine_payload_rule  text not null,
  transfer_rule         text not null,
  state                 text not null default 'DESIGN_ACTIVE',
  created_at            timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Runs. edition_size stays null until separately approved: no count is invented.
-- ---------------------------------------------------------------------------
create table if not exists merch_run (
  run_code          text primary key,            -- ERM-STK-L-ERGLASSHAT-R001
  class_code        text not null references merch_product_class (class_code),
  family_code       text not null references merch_product_family (family_code),
  artwork_short     text not null,
  run_number        integer not null check (run_number between 1 and 999),
  edition_class     text not null,               -- OPEN_RUN | NUMBERED_LIMITED | FAMILY_FIRST_EDITION | SPECIAL_VARIANT
  edition_size      integer,                     -- null = not yet approved
  edition_size_state text not null default 'UNSET_AWAITING_APPROVAL',
  original_exists   boolean not null default false,
  copies_issued     integer not null default 0,
  state             text not null default 'DESIGN_ACTIVE',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (class_code, family_code, artwork_short, run_number),
  constraint merch_run_copies_within_edition
    check (edition_size is null or copies_issued <= edition_size)
);

comment on column merch_run.edition_size is
  'Null is the correct value until the Chairman sets it. A null edition size blocks issuing NUMBERED_LIMITED copies; it does not block an OPEN_RUN.';

-- ---------------------------------------------------------------------------
-- Rights and provenance, one row per SKU. Every column that is not yet known
-- is UNKNOWN rather than assumed.
-- ---------------------------------------------------------------------------
create table if not exists merch_rights_record (
  rights_id             uuid primary key default gen_random_uuid(),
  sku_code              text not null,
  artwork_lock_refs     jsonb not null,
  mark_rights_state     text not null default 'UNKNOWN',
  masthead_rights_state text not null default 'UNKNOWN',
  font_rights_state     text not null default 'UNKNOWN',
  phrase_rights_state   text not null default 'NOT_APPLICABLE',
  scene_rights_state    text not null default 'NOT_APPLICABLE',
  likeness_rights_state text not null default 'NOT_APPLICABLE',
  likeness_subject      text,
  qr_destination_state  text not null default 'NOT_APPLICABLE',
  trademark_clearance   text not null default 'UNKNOWN',
  material_claim_state  text not null default 'NOT_APPLICABLE',
  supplier_rights_state text not null default 'UNKNOWN',
  creator_credit_required boolean not null default true,
  creator_credit_names  jsonb,
  vlegh_required        boolean not null default true,
  vlegh_ref             text,
  ip_asset_ref          text,                    -- thylora_ip_assets.asset_code
  rights_pass           boolean not null default false,
  blocking_reasons      jsonb not null default '[]'::jsonb,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

comment on column merch_rights_record.likeness_rights_state is
  'A presenter identity lock is an editorial continuity instrument, not a merchandise likeness licence. Any SKU depicting a person stays NOT_CLEARED until a likeness decision is recorded.';
comment on column merch_rights_record.material_claim_state is
  'Vycara and Edereaireum are world materials with unverified Earth composition. No Earth material claim may be printed on a tag or listing while this is UNVERIFIED.';

-- ---------------------------------------------------------------------------
-- Provenance chain. Unknowns stay unknown, per THY-SERIAL-COLLECTIBLE-001.
-- ---------------------------------------------------------------------------
create table if not exists merch_provenance_event (
  event_id        uuid primary key default gen_random_uuid(),
  sku_code        text not null,
  serial_code     text,
  role            text not null,                 -- CONCEPT_ORIGINATOR | DESIGNER | ARTIST | DIGITISER | PRINTER | TAG_MAKER | PACKER | SHIPPER | CUSTODIAN | TRANSFEREE
  party_name      text,
  party_ref       text,
  party_state     text not null default 'UNKNOWN',
  occurred_at     timestamptz,
  evidence        jsonb not null default '{}'::jsonb,
  recorded_at     timestamptz not null default now()
);

create index if not exists merch_provenance_sku_idx on merch_provenance_event (sku_code, role);
create index if not exists merch_rights_sku_idx on merch_rights_record (sku_code);

commit;
