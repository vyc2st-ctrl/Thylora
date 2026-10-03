-- MAH' · 0001 · Continuity head, intent ledger, serials, prechecks
-- Workroom: WR-MAH-001 · Reviewable · NOT APPLIED (backend egress denied from build session; production DDL is a held Chairman action)
-- Idempotent: safe to re-run.

begin;

-- 1. The one-word code. Layers are append-only: a trigger refuses update/delete.
create table if not exists mah_layers (
  version     int primary key check (version >= 1),
  letter      char(1) not null check (letter ~ '^[A-Z]$'),
  meaning     text not null,
  rules       jsonb not null check (jsonb_typeof(rules) = 'array' and jsonb_array_length(rules) > 0),
  status      text not null default 'PROPOSED' check (status in ('PROPOSED','APPROVED')),
  opened_on   date not null default current_date,
  approved_at timestamptz,
  check (status <> 'APPROVED' or approved_at is not null)
);

create or replace function mah_layers_append_only() returns trigger language plpgsql as $$
begin
  if tg_op = 'DELETE' then raise exception 'MAH_LAYER_APPEND_ONLY: layers are never removed'; end if;
  if new.letter <> old.letter or new.rules <> old.rules or new.version <> old.version then
    raise exception 'MAH_LAYER_APPEND_ONLY: only status/approval may change';
  end if;
  return new;
end $$;
drop trigger if exists mah_layers_guard on mah_layers;
create trigger mah_layers_guard before update or delete on mah_layers
  for each row execute function mah_layers_append_only();

create or replace function mah_current_code() returns text language sql stable as $$
  select 'MAH' || coalesce(string_agg(letter, '' order by version), '') || '''' from mah_layers
$$;

-- 2. Every-word intent ledger: each thing the Chairman asked for gets a row and a state.
create table if not exists mah_intents (
  intent_code  text primary key,
  said_on      date not null,
  intent       text not null,
  department   text not null,
  state        text not null check (state in ('ROUTED','DONE','HELD','NEEDS_CHAIRMAN','PROPOSED')),
  evidence     text,
  blocker      text,
  money_path   text,
  check (state <> 'DONE' or evidence is not null),
  check (state not in ('HELD','NEEDS_CHAIRMAN') or blocker is not null)
);

-- 3. Artifact serials + preparer credentials (rules I4, I5).
create table if not exists mah_artifacts (
  serial            text primary key check (serial ~ '^THY-[A-Z0-9]{2,12}-[0-9]{8}-[0-9]{4}$'),
  title             text not null,
  kind              text not null,
  preparer_name     text not null,
  preparer_title    text not null,
  preparer_qualification text not null,
  preparer_world_status  text not null check (preparer_world_status in ('EARTH','SIMULATED')),
  status            text not null default 'DECLARED' check (status in ('DECLARED','BUILT','WITNESSED','LIVE')),
  witness_evidence  text,
  simulated_results boolean not null default false,
  simulation_disclosure text,
  created_at        timestamptz not null default now(),
  check (status not in ('WITNESSED','LIVE') or witness_evidence is not null),
  check (not simulated_results or simulation_disclosure is not null)
);

-- 4. Permanent prechecks: one row per repeated failure, never deleted.
create table if not exists mah_prechecks (
  code        text primary key,
  born_from   text not null,
  route       text not null,
  created_on  date not null default current_date
);

-- RLS on (service role and Chairman policies to be added against the live auth model).
alter table mah_layers    enable row level security;
alter table mah_intents   enable row level security;
alter table mah_artifacts enable row level security;
alter table mah_prechecks enable row level security;

insert into mah_layers (version, letter, meaning, rules, status, opened_on) values
  (1, 'I', 'Invoke', '["I1 questions under every equation","I2 invoke an unasked question","I3 section-by-section preview before PDF","I4 serial + credentialed preparer","I5 officials identified","I6 ACTIVE only when witnessed","I7 ideas ledger in front","I8 Maryland anchor clock","I9 store first","I10 measure gaps before the jump","I11 decolonized first-read layout","I12 every-word intent ledger"]'::jsonb, 'PROPOSED', '2026-10-03')
on conflict (version) do nothing;

insert into mah_prechecks (code, born_from, route) values
  ('QR_MISSING',               'QR found missing at the ninth hour', 'Generate and test QR before layout'),
  ('OFFICIAL_UNIDENTIFIED',    'Page 12: judges shown without titles', 'Title, court type, qualification, EARTH/SIMULATED'),
  ('PREPARER_MISSING',         'Reports without who prepared them', 'Named, credentialed preparer on every artifact'),
  ('SERIAL_MISSING',           'Artifacts released without serials', 'Issue serial before drafting'),
  ('EQUATION_WITHOUT_QUESTION','Equations readers could not read', 'Print the question under each equation'),
  ('SECTIONS_NOT_PREVIEWED',   'PDFs rendered before review', 'Approve each section/box first'),
  ('STATUS_UNWITNESSED',       '"Active" claimed when not active', 'DECLARED → BUILT → WITNESSED → LIVE'),
  ('SIMULATED_RESULT_UNLABELLED','World pilot results sent to Earth companies', 'Label simulated results')
on conflict (code) do nothing;

-- 5. Register the workroom in the existing department registry, if present (soft link, as in RAE Link 0010).
do $$
begin
  if to_regclass('public.thylora_departments') is not null and exists (
    select 1 from information_schema.columns where table_name='thylora_departments' and column_name='department_code') then
    execute $q$
      insert into thylora_departments (department_code, name, purpose, status, priority)
      values ('WR-MAH-001', 'MAH'' Continuity Head',
              'One-word continuity code, every-word intent ledger, artifact serials and permanent prechecks.',
              'IMPLEMENTATION_ACTIVE', 'P1')
      on conflict (department_code) do update set purpose = excluded.purpose
    $q$;
  end if;
end $$;

commit;
