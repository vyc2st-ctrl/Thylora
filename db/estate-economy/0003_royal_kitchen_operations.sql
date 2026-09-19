-- THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533
-- Royal Kitchen operating structures for ER-CASTLE-ROYAL-001 / THY-CASTLE-ROYAL-KITCHEN-001.
-- Binds to the EXISTING role structure in household_role_registry:
--   HH-1700-COOK      Head Cook          BOUND to ER-ROYAL-COOK-001
--   HH-1700-DEPUTY-COOK, HH-1700-PROVISIONER, HH-1700-SCULLERY, HH-1700-BAKER
--   HH-1700-STEWARD   Chief Steward (household coordination, stores oversight)
-- and to SCHED-HH-1700-KITCHEN in household_shift_schedule. Neither is replaced.
-- Veronica Hall is NOT given a kitchen role here: her role is unresolved in canon.


-- ---------------------------------------------------------------------------
-- 1. KITCHEN POSTS — sections of the kitchen and who holds them
-- ---------------------------------------------------------------------------
create table if not exists public.thylora_kitchen_posts (
  kitchen_post_code       text primary key,
  estate_code             text not null default 'ER-CASTLE-ROYAL-001',
  kitchen_code            text not null default 'THY-CASTLE-ROYAL-KITCHEN-001',
  time_region             text not null default '1700s',
  post_name               text not null,
  section                 text not null,          -- FIRE | OVEN | DRESSING | STORES | SCULLERY | HERB | SERVICE
  held_by_role_code       text not null,          -- household_role_registry.role_code
  reports_to_role_code    text,
  hands_required_state    text not null default 'OPEN',
  hands_required          integer,
  never_unattended        boolean not null default false,
  open_fields             text[] not null default '{}',
  state                   text not null default 'STRUCTURE_DEFINED',
  source_query_id         text,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  constraint thylora_kitchen_posts_hands_chk
    check (hands_required_state in ('OPEN','RECORDED')
           and (hands_required is null or hands_required_state = 'RECORDED'))
);

-- ---------------------------------------------------------------------------
-- 2. SHIFT SEGMENTS — the named cycle already recorded on SCHED-HH-1700-KITCHEN,
--    made addressable segment by segment. The schedule row remains authoritative.
-- ---------------------------------------------------------------------------
create table if not exists public.thylora_kitchen_shift_segments (
  segment_code            text primary key,
  schedule_code           text not null default 'SCHED-HH-1700-KITCHEN',
  kitchen_code            text not null default 'THY-CASTLE-ROYAL-KITCHEN-001',
  segment_order           integer not null,
  segment_name            text not null,
  what_happens            text not null,
  holding_role_code       text not null,
  relief_role_codes       text[] not null default '{}',
  fire_state              text not null,          -- BANKED | RAISED | SERVICE | CLOSING
  handoff_requirement     text not null,
  clock_state             text not null default 'OPEN_BLOCKED_ON_NATIVE_CALENDAR',
  state                   text not null default 'STRUCTURE_DEFINED',
  source_query_id         text,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 3. STORES — pantry, dry store, cold store, herb store, cellar
-- ---------------------------------------------------------------------------
create table if not exists public.thylora_kitchen_stores (
  store_code              text primary key,
  kitchen_code            text not null default 'THY-CASTLE-ROYAL-KITCHEN-001',
  estate_code             text not null default 'ER-CASTLE-ROYAL-001',
  store_type              text not null,          -- PANTRY | DRY_STORE | COLD_STORE | HERB_STORE | CELLAR | MEAT_LARDER
  store_name              text not null,
  custodian_role_code     text not null,
  oversight_role_code     text not null default 'HH-1700-STEWARD',
  access_rule             text not null default 'OPEN',
  key_holding_rule        text not null default 'OPEN',
  keeping_condition       text not null default 'OPEN',
  inventory_cycle         text not null default 'OPEN',
  supplied_by_land_unit   text,
  security_zone_code      text,
  open_fields             text[] not null default '{}',
  state                   text not null default 'STRUCTURE_DEFINED',
  source_query_id         text,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  constraint thylora_kitchen_stores_type_chk
    check (store_type in ('PANTRY','DRY_STORE','COLD_STORE','HERB_STORE','CELLAR','MEAT_LARDER'))
);

-- ---------------------------------------------------------------------------
-- 4. MEAL PLANNING — the day list and the menu that follows it
-- ---------------------------------------------------------------------------
create table if not exists public.thylora_kitchen_meal_plans (
  meal_plan_code          text primary key,
  kitchen_code            text not null default 'THY-CASTLE-ROYAL-KITCHEN-001',
  service_class           text not null,          -- HOUSEHOLD | FAMILY_RANGE | GUEST | STAFF | FEAST
  planned_by_role_code    text not null default 'HH-1700-COOK',
  approved_by_role_code   text not null default 'HH-1700-STEWARD',
  day_list_source         text not null default 'HH-1700-PROVISIONER',
  dishes                  jsonb not null default '[]'::jsonb,
  herb_requisition_code   text,
  farm_requisition_code   text,
  plan_date_state         text not null default 'OPEN_BLOCKED_ON_NATIVE_CALENDAR',
  state                   text not null default 'STRUCTURE_OPEN',
  source_query_id         text,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 5. WASTE / LEFTOVER ROUTING — nothing in a working estate simply disappears
-- ---------------------------------------------------------------------------
create table if not exists public.thylora_kitchen_waste_routes (
  route_code              text primary key,
  kitchen_code            text not null default 'THY-CASTLE-ROYAL-KITCHEN-001',
  waste_class             text not null,          -- SERVABLE_LEFTOVER | STAFF_TABLE | ANIMAL_FEED | COMPOST | ASH | BONE | SPOILED
  routed_to               text not null,
  routed_to_reference     text,
  decided_by_role_code    text not null default 'HH-1700-COOK',
  sanitation_link         text,
  state                   text not null default 'STRUCTURE_DEFINED',
  source_query_id         text,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 6. SUPPLIERS — structural slots, names OPEN
-- ---------------------------------------------------------------------------
create table if not exists public.thylora_kitchen_suppliers (
  supplier_code           text primary key,
  estate_code             text not null default 'ER-CASTLE-ROYAL-001',
  supply_class            text not null,          -- GRAIN | MEAT | FISH | DAIRY | SALT_SPICE | WINE_ALE | FUEL | VESSELS
  supplier_identity_code  text,
  supplier_identity_state text not null default 'OPEN_IDENTITY',
  is_estate_grown         boolean not null default false,
  source_land_unit_code   text,
  market_calendar_state   text not null default 'OPEN',
  payment_form            text not null default 'OPEN',
  credit_terms            text not null default 'OPEN',
  delivery_route_state    text not null default 'APPROACH_ROAD_BY_CART',
  contact_role_code       text not null default 'HH-1700-PROVISIONER',
  state                   text not null default 'STRUCTURE_OPEN_IDENTITY',
  source_query_id         text,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  constraint thylora_kitchen_suppliers_identity_chk
    check (supplier_identity_state in ('OPEN_IDENTITY','NAMED','SUPERSEDED')
           and ((supplier_identity_state = 'NAMED') = (supplier_identity_code is not null)))
);

-- ---------------------------------------------------------------------------
-- 7. COOKWARE ISSUE / REPAIR — every repair is a provenance event
-- ---------------------------------------------------------------------------
create table if not exists public.thylora_kitchen_equipment (
  equipment_code          text primary key,
  kitchen_code            text not null default 'THY-CASTLE-ROYAL-KITCHEN-001',
  equipment_class         text not null,          -- POT | PAN | SPIT | CAULDRON | KNIFE | MOULD | VESSEL | SCALE | CUTLERY
  item_description        text not null,
  maker_person            text,
  maker_state             text not null default 'OPEN',
  issued_to_role_code     text,
  issued_state            text not null default 'STRUCTURE_OPEN',
  repair_events           jsonb not null default '[]'::jsonb,
  provenance_link         text,                   -- thylora_object_maker_provenance / royal collection where applicable
  replacement_order_code  text,
  state                   text not null default 'STRUCTURE_OPEN',
  source_query_id         text,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);
