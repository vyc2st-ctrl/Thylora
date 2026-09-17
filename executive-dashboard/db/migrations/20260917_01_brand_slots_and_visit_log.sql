-- THYLORA Operating Surface — backing tables
-- Applied to thylora-dash (jvsdxhrfhtlgaknhjxlz) on 2026-09-17.
-- Brand asset slots: backend-driven. UNKNOWN is a first-class value, never guessed.
create table if not exists public.thylora_brand_asset_slots (
  slot_code        text primary key,
  slot_group       text not null,
  label            text not null,
  truth_class      text not null default 'UNKNOWN'
                     check (truth_class in ('DOCUMENTED','ANALYSIS','UNKNOWN')),
  value_text       text,
  reference_ref    text,
  approval_state   text not null default 'NOT_APPROVED',
  source_record    text,
  notes            text,
  sort_order       int  not null default 100,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
alter table public.thylora_brand_asset_slots enable row level security;
drop policy if exists thy_brand_slots_chairman_read on public.thylora_brand_asset_slots;
create policy thy_brand_slots_chairman_read
  on public.thylora_brand_asset_slots for select using (public.thylora_is_chairman());

-- Chairman visit log: powers "what changed since last visit" from real timestamps.
create table if not exists public.thylora_chairman_visit_log (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid(),
  visited_at  timestamptz not null default now(),
  surface     text not null default 'OPERATING_SURFACE'
);
create index if not exists thy_visit_log_user_time
  on public.thylora_chairman_visit_log (user_id, surface, visited_at desc);
alter table public.thylora_chairman_visit_log enable row level security;
drop policy if exists thy_visit_log_own on public.thylora_chairman_visit_log;
create policy thy_visit_log_own
  on public.thylora_chairman_visit_log for select using (user_id = auth.uid());
