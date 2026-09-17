-- THYLORA merchandise lane · 0004 · SKU registry and issued serials
-- ADDITIVE ONLY. Not applied by this repository.

begin;

create table if not exists merch_sku (
  sku_code            text primary key,          -- ERM-STK-L-ERGLASSHAT-R001
  sku_title           text not null,
  class_code          text not null references merch_product_class (class_code),
  family_code         text not null references merch_product_family (family_code),
  run_code            text references merch_run (run_code),
  artwork_lock_codes  jsonb not null,            -- ordered; first is the primary mark
  side_a_lock         text,                      -- vessel classes only
  side_b_kind         text,                      -- MASTHEAD | PHRASE | SCENE
  side_b_ref          text,                      -- phrase_code or scene_code or artwork lock
  phrase_code         text references merch_phrase_registry (phrase_code),
  scene_code          text references merch_scene_registry (scene_code),
  colourway           text,
  size_range          jsonb,
  decoration_spec     jsonb not null default '{}'::jsonb,
  proof_state         text not null default 'NOT_PROOFED',
  physical_proof_ref  text,
  sell_intent         boolean not null default false,
  shelf_code          text,                      -- thylora_store_shelves.shelf_code once assigned
  external_product_id text,                      -- set only after a real provider record exists
  price_state         text not null default 'AUTHORITY_REQUIRED',
  price_amount        numeric(12,2),
  currency            text,
  unit_cost_state     text not null default 'UNKNOWN',
  make_state          text not null default 'DESIGN',
                      -- DESIGN | ARTWORK_LOCKED | PROOF_REQUESTED | PROOF_APPROVED | SUPPLIER_PENDING | READY_FOR_CHAIRMAN_PRICE | RELEASE_HELD
  commerce_state      text not null default 'NOT_LIVE',
  manufacturing_state text not null default 'NOT_MANUFACTURED',
  witness_state       text not null default 'NOT_WITNESSED',
  blockers            jsonb not null default '[]'::jsonb,
  next_executable_work text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  constraint merch_sku_vessel_needs_side_a
    check (class_code not in ('MUG','CUP') or side_a_lock is not null),
  constraint merch_sku_vessel_needs_side_b
    check (class_code not in ('MUG','CUP') or side_b_kind is not null),
  constraint merch_sku_phrase_family
    check ((family_code = 'LOGO_PHRASE') = (phrase_code is not null)),
  constraint merch_sku_scene_family
    check ((family_code = 'LOGO_SCENE') = (scene_code is not null)),
  constraint merch_sku_no_live_without_witness
    check (commerce_state <> 'LIVE' or witness_state = 'WITNESSED'),
  constraint merch_sku_no_manufactured_without_witness
    check (manufacturing_state <> 'MANUFACTURED' or witness_state = 'WITNESSED')
);

comment on table merch_sku is
  'Candidate merchandise SKUs. A row here is a design record, not a product for sale. commerce_state and manufacturing_state cannot leave their NOT_ values without a recorded witness.';
comment on column merch_sku.external_product_id is
  'Populated only from a provider readback, never written ahead of one. An empty value means no storefront record exists.';

-- ---------------------------------------------------------------------------
-- Issued serials. One row per physical or digital copy actually issued.
-- ---------------------------------------------------------------------------
create table if not exists merch_serial (
  serial_code        text primary key,           -- ERM-STK-L-ERGLASSHAT-R001-00001
  sku_code           text not null references merch_sku (sku_code),
  run_code           text not null references merch_run (run_code),
  copy_kind          text not null,              -- ORIGINAL | REPRODUCTION
  copy_number        integer,                    -- null for ORIGINAL
  personalization_digest text,                   -- 8 hex chars, digest only
  visible_marking    text not null,
  machine_payload    jsonb not null default '{}'::jsonb,
  artefact_sha256    text,
  owner_reference    text,
  ownership_state    text not null default 'UNISSUED',
  transfer_state     text not null default 'NONE',
  vlegh_transfer_ref text,
  state              text not null default 'REGISTERED',
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  constraint merch_serial_copy_number_shape
    check ((copy_kind = 'ORIGINAL' and copy_number is null)
        or (copy_kind = 'REPRODUCTION' and copy_number between 1 and 99999)),
  constraint merch_serial_digest_shape
    check (personalization_digest is null or personalization_digest ~ '^[0-9a-f]{8}$')
);

comment on column merch_serial.copy_kind is
  'The original is permanently distinguished from reproductions. No reproduction may be labelled or implied to be the original.';

-- At most one ORIGINAL per run.
create unique index if not exists merch_serial_one_original_per_run
  on merch_serial (run_code) where copy_kind = 'ORIGINAL';

create unique index if not exists merch_serial_copy_unique_per_run
  on merch_serial (run_code, copy_number) where copy_kind = 'REPRODUCTION';

create index if not exists merch_sku_class_family_idx on merch_sku (class_code, family_code);
create index if not exists merch_sku_make_state_idx on merch_sku (make_state);

commit;
