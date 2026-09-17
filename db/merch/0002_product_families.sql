-- THYLORA merchandise lane · 0002 · product families, classes, cup side map
-- ADDITIVE ONLY. Not applied by this repository.

begin;

-- ---------------------------------------------------------------------------
-- Three families. A SKU belongs to exactly one.
-- ---------------------------------------------------------------------------
create table if not exists merch_product_family (
  family_code        text primary key,           -- LOGO_ONLY | LOGO_PHRASE | LOGO_SCENE
  family_short       text not null unique,       -- L | LP | LS  (used in the serial grammar)
  family_name        text not null,
  composition_rule   text not null,
  requires_phrase    boolean not null,
  requires_scene     boolean not null,
  opens_when         text not null,              -- what must exist before the family may carry SKUs
  state              text not null default 'DESIGN_ACTIVE',
  created_at         timestamptz not null default now()
);

comment on table merch_product_family is
  'LOGO_ONLY carries an approved mark alone. LOGO_PHRASE adds one approved phrase. LOGO_SCENE adds one approved scene crop from a registered visual master. No family mixes a phrase and a scene on one SKU.';

-- ---------------------------------------------------------------------------
-- Product classes. Each maps to an existing merchandise_program row where one
-- exists, so this lane does not become a second source of truth for merch.
-- ---------------------------------------------------------------------------
create table if not exists merch_product_class (
  class_code            text primary key,        -- MUG | CUP | STK | PCH | SHIRT | SWEAT | SOCK | TABDEC | LOCDEC | NECK | ORAH
  class_name            text not null,
  goods_kind            text not null,           -- VESSEL | ADHESIVE | APPLIQUE | APPAREL | KNIT | JEWELRY
  merchandise_program_ref text,                  -- merchandise_program.merch_code, null when no row exists yet
  jewelry_registry_ref  text,                    -- thylora_jewelry_watch_registry.design_code
  artwork_surfaces      jsonb not null,          -- named printable surfaces and what each may carry
  decoration_method     text not null,
  tooling_required      boolean not null,        -- embroidery digitising, knit programming, mould, die
  artwork_redraw_required boolean not null,      -- mark must be simplified/redrawn for the method
  likeness_involved     boolean not null default false,
  serial_carrier        text not null,           -- where the visible serial is applied
  personalization_allowed boolean not null default false,
  supplier_state        text not null default 'UNSELECTED',
  price_state           text not null default 'AUTHORITY_REQUIRED',
  state                 text not null default 'DESIGN_ACTIVE',
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

comment on column merch_product_class.artwork_redraw_required is
  'True means the approved mark cannot be reproduced as drawn by this method. A redraw is a mark change and needs its own Chairman approval; no_silent_change applies.';

-- ---------------------------------------------------------------------------
-- The cup system lock. Side A and Side B are fixed and never swapped.
-- Applies to every vessel class (MUG, CUP) identically.
-- ---------------------------------------------------------------------------
create table if not exists merch_cup_side_map (
  map_code           text primary key,
  applies_to_classes jsonb not null,             -- ["MUG","CUP"]
  side_a_rule        text not null,
  side_a_allowed     jsonb not null,             -- artwork lock groups permitted on side A
  side_b_rule        text not null,
  side_b_allowed     jsonb not null,
  handle_zone_rule   text not null,
  base_zone_rule     text not null,
  interior_rule      text not null,
  swap_prohibited    boolean not null default true,
  verification_steps jsonb not null,
  state              text not null default 'LOCKED',
  authority          text not null,
  created_at         timestamptz not null default now()
);

comment on table merch_cup_side_map is
  'Cup system lock. Side A is the logo mark. Side B is a phrase or a scene, never both, never a second logo lockup. A mug and a carry cup share one side map so the system reads identically across vessels.';

-- ---------------------------------------------------------------------------
-- Approved phrases. Empty until the Chairman approves a phrase list; the
-- editorial tone lock prohibits generic or inspirational copy, so no phrase is
-- invented here.
-- ---------------------------------------------------------------------------
create table if not exists merch_phrase_registry (
  phrase_code      text primary key,
  phrase_text      text not null,
  phrase_origin    text not null,                -- backend record the wording came from
  truth_class      text not null,
  tone_gate_state  text not null default 'PENDING',  -- editorial tone lock check
  approval_state   text not null default 'CANDIDATE_CHAIRMAN_APPROVAL_REQUIRED',
  approved_for_classes jsonb,
  notes            text,
  created_at       timestamptz not null default now()
);

comment on table merch_phrase_registry is
  'Phrase candidates only, each traceable to an existing backend record. No phrase is composed for merchandise in this lane. LOGO_PHRASE SKUs cannot pass gate G3 while every row is CANDIDATE.';

-- ---------------------------------------------------------------------------
-- Approved scenes. A scene is a crop of a registered, approved visual master,
-- never a fresh generation.
-- ---------------------------------------------------------------------------
create table if not exists merch_scene_registry (
  scene_code        text primary key,
  scene_name        text not null,
  master_file       text not null,
  master_sha256     text,
  master_state      text not null,
  master_record     text not null,
  crop_rule         text not null,
  crop_approved     boolean not null default false,
  rights_state      text not null default 'UNKNOWN',
  likeness_present  boolean not null default false,
  approval_state    text not null default 'CANDIDATE_CHAIRMAN_APPROVAL_REQUIRED',
  open_question     text,
  created_at        timestamptz not null default now()
);

comment on table merch_scene_registry is
  'Scene crops for the LOGO_SCENE family. Generation is not a path here: the crop must come from an already-approved master with a recorded SHA-256.';

commit;
