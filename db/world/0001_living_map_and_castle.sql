-- THYLORA · World spine for THY-WORK-WINDSOR-MIRROR-CASTLE
-- Backend of record: thylora-dash (jvsdxhrfhtlgaknhjxlz)
-- STATUS: REVIEWABLE, NOT APPLIED. No migration was run from this session.
-- This session could not reach the backend (network policy, HTTP 403 on CONNECT).
--
-- Every table below is additive. Nothing here drops, renames, or alters an
-- existing THYLORA table, policy, function or dashboard capability.

-- ---------------------------------------------------------------------------
-- 1 · Living map lane states (drives the dashboard Living Map panel)
-- ---------------------------------------------------------------------------
create table if not exists public.thylora_living_map (
  lane_key          text primary key,
  lane_label        text not null,
  lane_state        text not null,
  detail            text,
  evidence_grade    text,
  blocker           text,
  next_action       text,
  sort_order        int  not null default 100,
  status            text not null default 'ACTIVE',
  work_code         text,
  updated_at        timestamptz not null default now()
);

comment on table public.thylora_living_map is
  'Permanent lane state register for the Chairman dashboard Living Map. One row per lane. Never truncated; lanes are carried, not deleted.';

-- ---------------------------------------------------------------------------
-- 2 · Castle record (EdereAriah). OPEN is a first-class, countable state.
-- ---------------------------------------------------------------------------
create table if not exists public.thylora_castle_record (
  castle_id         text primary key,
  native_name       text,                 -- OPEN until Chairman authors
  city              text,
  territory         text,
  founding_date     text,
  founder           text,
  ruling_line       text,
  earth_mirror      text not null,        -- 'Windsor Castle, England'
  mirror_superseded text,                 -- 'Malbork'
  current_royal_use text,
  work_code         text,
  updated_at        timestamptz not null default now()
);

create table if not exists public.thylora_castle_phase (
  phase_id          text primary key,
  castle_id         text not null references public.thylora_castle_record(castle_id) on delete cascade,
  phase_no          int  not null,
  phase_label       text not null,
  date_range        text,
  monarch           text,
  directing_hand    text,
  work_done         text,
  state             text not null default 'OPEN',
  mirror_note       text,
  updated_at        timestamptz not null default now()
);

create table if not exists public.thylora_castle_space (
  space_ref         text primary key,     -- 'L01','M02','U10','S01','G09'
  castle_id         text not null references public.thylora_castle_record(castle_id) on delete cascade,
  ward              text not null,        -- LOWER | MIDDLE | UPPER | SERVICE | GROUNDS
  space_label       text not null,        -- EdereAriah name, OPEN until authored
  function_text     text not null,
  mirror_reference  text,
  state             text not null default 'OPEN',
  updated_at        timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 3 · Every object has a maker — the twelve slots, enforced by schema
-- ---------------------------------------------------------------------------
create table if not exists public.thylora_object_provenance (
  provenance_id     text primary key,
  castle_id         text references public.thylora_castle_record(castle_id) on delete cascade,
  space_ref         text references public.thylora_castle_space(space_ref),
  object_name       text,                 -- slot 1
  object_class      text not null,        -- slot 2
  maker_person      text,                 -- slot 3
  maker_body        text,                 -- slot 4  workshop / company / guild
  place_made        text,                 -- slot 5
  date_made         text,                 -- slot 6
  material_source   text,                 -- slot 7
  commissioner      text,                 -- slot 8
  price_value       text,                 -- slot 9
  maker_mark        text,                 -- slot 10
  repair_history    text,                 -- slot 11
  current_holder    text,                 -- slot 12
  slot_state        text not null default 'OPEN',   -- OPEN | CANON | MIRROR_EXEMPLAR
  canon_source      text,                 -- 'CHAIRMAN' | 'BACKEND_CANON' | 'EARTH_MIRROR'
  updated_at        timestamptz not null default now(),
  -- A mirror exemplar must say so. A canon row must say where it came from.
  constraint object_provenance_source_declared
    check (slot_state = 'OPEN' or canon_source is not null)
);

comment on constraint object_provenance_source_declared on public.thylora_object_provenance is
  'No maker may be recorded without declaring its source. Blocks invented makers at the schema level.';

-- ---------------------------------------------------------------------------
-- 4 · Royal kitchen establishment
-- ---------------------------------------------------------------------------
create table if not exists public.thylora_kitchen_post (
  post_id           text primary key,
  castle_id         text references public.thylora_castle_record(castle_id) on delete cascade,
  post_label        text not null,        -- Head Cook, Deputy Cook, Provisioner...
  person_name       text,                 -- 'Inés Morales' where known
  reports_to        text references public.thylora_kitchen_post(post_id),
  space_ref         text references public.thylora_castle_space(space_ref),
  shift_pattern     text,
  state             text not null default 'OPEN',
  blocked_on        text,                 -- 'SEQ_528' where the answer may already exist
  updated_at        timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 5 · Supply routes (rosemary is the first, not the only)
-- ---------------------------------------------------------------------------
create table if not exists public.thylora_supply_route (
  route_id          text primary key,
  castle_id         text references public.thylora_castle_record(castle_id) on delete cascade,
  commodity         text not null,        -- 'rosemary'
  native_name       text,                 -- OPEN until Chairman authors
  earth_mirror_name text,                 -- 'Salvia rosmarinus (syn. Rosmarinus officinalis)'
  source_ground     text,
  grower            text,
  supplier          text,
  transport         text,
  receiving_ref     text references public.thylora_castle_space(space_ref),
  storage_ref       text references public.thylora_castle_space(space_ref),
  prepared_by       text,                 -- 'Inés Morales'
  preparation       text,
  culinary_use      text,
  historical_claim  text,
  modern_evidence   text,
  evidence_caveat   text,
  state             text not null default 'OPEN',
  updated_at        timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 6 · World completeness scoring  C_w = I × P × T × O × M × R × E
-- ---------------------------------------------------------------------------
create table if not exists public.thylora_world_completeness (
  score_id          text primary key,
  subject           text not null,        -- 'EdereAriah Castle' | 'Windsor Castle'
  identity_i        numeric(4,3) not null default 0,
  place_p           numeric(4,3) not null default 0,
  time_t            numeric(4,3) not null default 0,
  objects_o         numeric(4,3) not null default 0,
  makers_m          numeric(4,3) not null default 0,
  relationships_r   numeric(4,3) not null default 0,
  evidence_e        numeric(4,3) not null default 0,
  c_w               numeric(10,7)
    generated always as (identity_i * place_p * time_t * objects_o * makers_m * relationships_r * evidence_e) stored,
  scored_at         timestamptz not null default now(),
  work_code         text
);

comment on column public.thylora_world_completeness.c_w is
  'Multiplicative, not additive. Any factor at zero holds the whole world at zero. That is the point.';

-- ---------------------------------------------------------------------------
-- 7 · RLS — same posture as the rest of THYLORA: authenticated read
-- ---------------------------------------------------------------------------
alter table public.thylora_living_map          enable row level security;
alter table public.thylora_castle_record       enable row level security;
alter table public.thylora_castle_phase        enable row level security;
alter table public.thylora_castle_space        enable row level security;
alter table public.thylora_object_provenance   enable row level security;
alter table public.thylora_kitchen_post        enable row level security;
alter table public.thylora_supply_route        enable row level security;
alter table public.thylora_world_completeness  enable row level security;

do $$
declare t text;
begin
  foreach t in array array[
    'thylora_living_map','thylora_castle_record','thylora_castle_phase',
    'thylora_castle_space','thylora_object_provenance','thylora_kitchen_post',
    'thylora_supply_route','thylora_world_completeness'
  ] loop
    execute format(
      'create policy %I on public.%I for select to authenticated using (true)',
      t || '_read', t);
  end loop;
end $$;
