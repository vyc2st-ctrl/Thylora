-- Applied to jvsdxhrfhtlgaknhjxlz as migration 20260919173734
-- thy_chairman_preview_decisions_537
--
-- The Chairman's RELEASE / REVISE / HOLD decision on a preview packet.
-- A separate table from thylora_chairman_review_decisions on purpose: that
-- table's decision domain is APPROVE / REQUEST_CHANGES / REJECT, and HOLD is
-- none of those. Forcing HOLD into REJECT would record a refusal the Chairman
-- did not make.
--
-- RLS is on with a Chairman read policy and no write policy. Rows are written
-- only by thylora_chairman_preview_decision_v1(), which is SECURITY DEFINER and
-- checks thylora_is_chairman() itself.

create table if not exists public.thylora_chairman_preview_decisions (
  decision_ordinal    bigint generated always as identity primary key,
  decision_id         uuid not null default gen_random_uuid(),
  packet_code         text not null references public.thylora_chairman_preview_packets(packet_code),
  product_gid         text,
  decision            text not null check (decision in ('RELEASE','REVISE','HOLD')),
  packet_state_before text,
  packet_state_after  text,
  note                text,
  decided_by          uuid,
  decided_by_email    text,
  decided_at          timestamptz not null default now(),
  evidence            jsonb not null default '{}'::jsonb
);

create index if not exists thylora_chairman_preview_decisions_packet_idx
  on public.thylora_chairman_preview_decisions (packet_code, decided_at desc);

alter table public.thylora_chairman_preview_decisions enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policy p
    join pg_class c on c.oid = p.polrelid
    where c.relname = 'thylora_chairman_preview_decisions'
      and p.polname = 'chairman_read_preview_decisions'
  ) then
    create policy chairman_read_preview_decisions
      on public.thylora_chairman_preview_decisions
      for select using (public.thylora_is_chairman());
  end if;
end $$;

comment on table public.thylora_chairman_preview_decisions is
  'Chairman RELEASE / REVISE / HOLD decisions on preview packets. Append-only through thylora_chairman_preview_decision_v1(). A later decision never erases an earlier one.';
