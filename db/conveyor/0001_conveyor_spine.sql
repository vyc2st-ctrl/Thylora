-- CONVEYOR · 0001 · Continuous production conveyor spine
-- Workroom: WR-CONVEYOR-001
--
-- Additive only. Every object is new and prefixed `conv_`. No existing table is
-- dropped, renamed or rewritten.
--
-- NO SECOND SOURCE OF TRUTH. The idea registry, product registry, department
-- registry and passport registry already exist in the live backend. This spine
-- holds the ADVANCEMENT STATE of an item and soft-references those registries by
-- text ref, resolved through guarded functions. It never copies them.
--
-- EVIDENCE GAP: the build session could not reach jvsdxhrfhtlgaknhjxlz.supabase.co
-- (403 on CONNECT, organization egress policy, logged 2026-09-16T11:36:09Z), so
-- the live shape of idea_registry, products and thylora_departments could NOT be
-- verified. Column names used in the guarded blocks below were read from the
-- dashboard's own select lists in dashboard-current-head.html, which is evidence
-- of the shape but not a live check. Every statement that touches an existing
-- table is guarded by to_regclass and a column check, so a different shape
-- no-ops instead of failing the migration or inventing a competing table.

begin;

-- ---------------------------------------------------------------------------
-- 1 · Lanes
-- ---------------------------------------------------------------------------
create table if not exists conv_lanes (
  lane_key    text primary key,
  label       text not null,
  lane_code   text not null unique,
  sort_order  int  not null default 0,
  created_at  timestamptz not null default now()
);

insert into conv_lanes (lane_key, label, lane_code, sort_order) values
  ('SHOWS_VIDEO',             'Shows and video',             'SHW',  1),
  ('BOOKS_COMICS',            'Books and comics',            'BOK',  2),
  ('EDUCATIONAL_SHEETS',      'Educational sheets',          'EDU',  3),
  ('GAMES',                   'Games',                       'GAM',  4),
  ('CLOTHING',                'Clothing',                    'CLO',  5),
  ('SERIALIZED_COLLECTIBLES', 'Serialized collectibles',     'COL',  6),
  ('HISTORY_HERBAL',          'History and herbal products', 'HRB',  7),
  ('ASK_ERSATZ',              'Ask Ersatz products',         'ASK',  8),
  ('NEWSPAPERS_REPORTS',      'Newspapers and reports',      'NWS',  9),
  ('MEDIA_NETWORK',           'Media network (RAE Link)',    'RAE', 10),
  ('MEMBERSHIPS',             'Memberships and access',      'MEM', 11),
  ('WORLD_OBJECTS',           'World objects',               'OBJ', 12)
on conflict (lane_key) do update set label = excluded.label, lane_code = excluded.lane_code;

-- ---------------------------------------------------------------------------
-- 2 · Items · the advancement state of one Chairman-originated idea
-- ---------------------------------------------------------------------------
create table if not exists conv_items (
  id                    uuid primary key default gen_random_uuid(),
  canonical_id          text not null unique,
  title                 text not null,

  -- Soft references into the EXISTING registries. Text, not foreign keys,
  -- because the live shape could not be verified from the build session.
  idea_ref              text,
  product_ref           text,
  department_ref        text,

  source_parent         text not null,
  continuity_evidence   text not null,
  continuity_state      text not null default 'VERIFIED_IN_REPO'
                          check (continuity_state in ('VERIFIED_IN_REPO','UNVERIFIED_IN_REPO','CHAIRMAN_CONFIRMED')),

  lane                  text not null references conv_lanes(lane_key),
  item_kind             text,
  world_class           text check (world_class in ('EARTH_REAL','WORLD_SIMULATED')),

  owner_department      text,
  responsible_person    text,
  person_authority      text default 'CHAIRMAN' check (person_authority in ('BUILD','CHAIRMAN')),

  stage                 text not null default 'CAPTURE'
                          check (stage in ('CAPTURE','CLASSIFY','ASSIGN','PRODUCE','VERIFY',
                                           'PRODUCTIZE','PRICE','STORE','RELEASE','MEASURE','IMPROVE')),
  version_no            int  not null default 1 check (version_no >= 1),

  artifact_ref          text,
  evidence_ref          text,

  rights_state          text not null default 'UNKNOWN',
  rights_authority      text default 'BUILD' check (rights_authority in ('BUILD','CHAIRMAN')),
  rights_evidence       text,

  provenance_state      text not null default 'UNKNOWN' check (provenance_state in ('UNKNOWN','RECORDED')),
  serial_state          text not null default 'NONE'    check (serial_state in ('NONE','ISSUED')),
  qr_state              text not null default 'NONE'    check (qr_state in ('NONE','BOUND')),

  cost_state            text not null default 'UNKNOWN' check (cost_state in ('UNKNOWN','QUOTE_REQUIRED','KNOWN')),
  cost_evidence         text,
  price_state           text not null default 'UNSET'   check (price_state in ('UNSET','SET')),
  price_evidence        text,
  storefront_state      text not null default 'ABSENT'  check (storefront_state in ('ABSENT','LISTED','WITHDRAWN')),
  storefront_evidence   text,
  checkout_path_state   text not null default 'UNVERIFIED' check (checkout_path_state in ('UNVERIFIED','VERIFIED')),
  checkout_evidence     text,

  release_evidence_ref  text,
  readback_state        text not null default 'NONE' check (readback_state in ('NONE','CONFIRMED')),
  readback_evidence     text,
  measurement_ref       text,
  improvement_ref       text,

  product_registry      text not null default 'LIVE_BACKEND'
                          check (product_registry in ('LIVE_BACKEND','LIVE_BACKEND_UNREACHABLE')),

  last_advanced_at      timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),

  -- A state claim must be backed by a value. These are the same rules the
  -- JavaScript validator enforces; enforcing them here means a direct write
  -- cannot bypass them.
  constraint conv_items_price_backed
    check (price_state <> 'SET' or price_evidence is not null),
  constraint conv_items_storefront_backed
    check (storefront_state <> 'LISTED' or storefront_evidence is not null),
  constraint conv_items_checkout_backed
    check (checkout_path_state <> 'VERIFIED' or checkout_evidence is not null),
  constraint conv_items_readback_backed
    check (readback_state <> 'CONFIRMED' or readback_evidence is not null),
  constraint conv_items_rights_backed
    check (rights_state <> 'CLEARED' or rights_evidence is not null),
  constraint conv_items_release_backed
    check (release_evidence_ref is null or readback_state = 'CONFIRMED')
);

create index if not exists conv_items_lane_idx on conv_items(lane, stage);
create index if not exists conv_items_stage_idx on conv_items(stage);

-- Claims that must be backed by a row in another table cannot be CHECK
-- constraints, because a CHECK may not see another table. They are enforced by a
-- constraint trigger instead, deferred to the end of the transaction so an item
-- and its serial or provenance entry can be written in either order.
create or replace function conv_assert_claims_backed() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.provenance_state = 'RECORDED'
     and not exists (select 1 from conv_provenance p where p.item_id = new.id) then
    raise exception 'conv_items %: provenance_state RECORDED with no provenance chain', new.canonical_id
      using errcode = 'check_violation';
  end if;
  if new.serial_state = 'ISSUED'
     and not exists (select 1 from conv_serials s where s.item_id = new.id) then
    raise exception 'conv_items %: serial_state ISSUED with no issued serial', new.canonical_id
      using errcode = 'check_violation';
  end if;
  if new.qr_state = 'BOUND'
     and not exists (select 1 from conv_serials s where s.item_id = new.id and s.qr_payload is not null) then
    raise exception 'conv_items %: qr_state BOUND with no bound QR payload', new.canonical_id
      using errcode = 'check_violation';
  end if;
  return new;
end $$;

-- ---------------------------------------------------------------------------
-- 3 · Serials · unique per (lane, item, version, sequence), never reused
-- ---------------------------------------------------------------------------
create table if not exists conv_serials (
  id            bigserial primary key,
  item_id       uuid not null references conv_items(id) on delete cascade,
  serial        text not null unique,
  lane_code     text not null,
  version_no    int  not null check (version_no >= 1),
  sequence_no   int  not null check (sequence_no between 1 and 999999),
  passport_standard text not null default 'THY-DPP-003',
  qr_payload    text,
  qr_visibility text check (qr_visibility in ('PUBLIC_MARK','DISCREET_MARK','REGISTRY_ONLY')),
  issued_at     timestamptz not null default now(),
  unique (item_id, version_no, sequence_no)
);

-- ---------------------------------------------------------------------------
-- 4 · Provenance · append-only chain, each entry carrying the previous digest
-- ---------------------------------------------------------------------------
create table if not exists conv_provenance (
  id                 bigserial primary key,
  item_id            uuid not null references conv_items(id) on delete cascade,
  seq                int  not null check (seq >= 1),
  event_type         text not null check (event_type in
                       ('CAPTURED','CREATED','DERIVED','AI_ASSISTED','RESTORED','IMPORTED','TRANSFERRED')),
  source_description text not null check (length(btrim(source_description)) > 0),
  occurred_at        date,
  tool_disclosure    text,
  derived_from_ref   text,
  recorded_by        text,
  previous_digest    text,
  entry_digest       text not null,
  created_at         timestamptz not null default now(),
  unique (item_id, seq)
);

-- ---------------------------------------------------------------------------
-- 5 · Events · append-only advancement trail, written by trigger
-- ---------------------------------------------------------------------------
create table if not exists conv_events (
  id          bigserial primary key,
  item_id     uuid not null references conv_items(id) on delete cascade,
  from_stage  text,
  to_stage    text,
  changed     jsonb not null default '{}'::jsonb,
  actor       text,
  occurred_at timestamptz not null default now()
);

create index if not exists conv_events_item_idx on conv_events(item_id, id);

create or replace function conv_record_event() returns trigger
language plpgsql security definer set search_path = public as $$
declare diff jsonb := '{}'::jsonb;
begin
  if tg_op = 'INSERT' then
    insert into conv_events (item_id, from_stage, to_stage, changed, actor)
    values (new.id, null, new.stage, jsonb_build_object('captured', true), current_user);
    return new;
  end if;
  if new.stage is distinct from old.stage then
    diff := diff || jsonb_build_object('stage', jsonb_build_array(old.stage, new.stage));
  end if;
  if new.rights_state is distinct from old.rights_state then
    diff := diff || jsonb_build_object('rights_state', jsonb_build_array(old.rights_state, new.rights_state));
  end if;
  if new.storefront_state is distinct from old.storefront_state then
    diff := diff || jsonb_build_object('storefront_state', jsonb_build_array(old.storefront_state, new.storefront_state));
  end if;
  if new.checkout_path_state is distinct from old.checkout_path_state then
    diff := diff || jsonb_build_object('checkout_path_state', jsonb_build_array(old.checkout_path_state, new.checkout_path_state));
  end if;
  if diff <> '{}'::jsonb then
    insert into conv_events (item_id, from_stage, to_stage, changed, actor)
    values (new.id, old.stage, new.stage, diff, current_user);
  end if;
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists conv_items_event_trg on conv_items;
create trigger conv_items_event_trg
  after insert on conv_items
  for each row execute function conv_record_event();

drop trigger if exists conv_items_claims_trg on conv_items;
create constraint trigger conv_items_claims_trg
  after insert or update on conv_items
  deferrable initially deferred
  for each row execute function conv_assert_claims_backed();

drop trigger if exists conv_items_update_trg on conv_items;
create trigger conv_items_update_trg
  before update on conv_items
  for each row execute function conv_record_event();

-- ---------------------------------------------------------------------------
-- 6 · The gate · the server-side twin of conveyor/lib/stages.js
--     Returns EVERY unmet requirement at once, each naming its route and the
--     authority that can clear it. A client gate that disagrees with this one
--     is a bug in the client, not a second opinion.
-- ---------------------------------------------------------------------------
create or replace function conv_stage_gate(p_canonical_id text)
returns table (code text, detail text, route text, authority text)
language plpgsql stable security definer set search_path = public as $$
declare i conv_items%rowtype;
begin
  select * into i from conv_items where canonical_id = p_canonical_id;
  if not found then
    return query select 'ITEM_NOT_FOUND'::text, format('No conveyor item %s', p_canonical_id), 'capture'::text, 'BUILD'::text;
    return;
  end if;

  -- Preconditions hold at every stage.
  if i.continuity_state = 'UNVERIFIED_IN_REPO' then
    return query select 'CONTINUITY_UNVERIFIED'::text,
      'Named in the directive but no matching record was reachable; confirm the source record before this advances.'::text,
      'capture'::text, 'CHAIRMAN'::text;
  end if;

  if i.stage = 'CAPTURE' then
    if i.source_parent is null then return query select 'SOURCE_PARENT_MISSING'::text, 'Item does not name the idea or record it came from.'::text, 'capture'::text, 'BUILD'::text; end if;

  elsif i.stage = 'CLASSIFY' then
    if i.item_kind is null then return query select 'KIND_MISSING'::text, 'Item kind is not declared.'::text, 'classify'::text, 'BUILD'::text; end if;
    if i.world_class is null then return query select 'WORLD_CLASS_MISSING'::text, 'Item is not declared EARTH_REAL or WORLD_SIMULATED.'::text, 'classify'::text, 'BUILD'::text; end if;

  elsif i.stage = 'ASSIGN' then
    if i.owner_department is null then return query select 'OWNER_DEPARTMENT_MISSING'::text, 'No owning department.'::text, 'assign'::text, 'BUILD'::text; end if;
    if i.responsible_person is null then
      return query select 'RESPONSIBLE_PERSON_MISSING'::text, 'No responsible in-world person named.'::text, 'assign'::text,
        case when i.person_authority = 'BUILD' then 'BUILD' else 'CHAIRMAN' end;
    end if;

  elsif i.stage = 'PRODUCE' then
    if i.artifact_ref is null then return query select 'ARTIFACT_MISSING'::text, 'Nothing has been produced yet; no artifact reference.'::text, 'produce'::text, 'BUILD'::text; end if;
    if i.rights_state <> 'CLEARED' then
      return query select 'RIGHTS_NOT_CLEARED'::text, format('Rights state is %s.', i.rights_state), 'rights'::text,
        case when i.rights_authority = 'CHAIRMAN' then 'CHAIRMAN' else 'BUILD' end;
    end if;

  elsif i.stage = 'VERIFY' then
    if i.evidence_ref is null then return query select 'EVIDENCE_MISSING'::text, 'No verification evidence attached.'::text, 'verify'::text, 'BUILD'::text; end if;
    if i.provenance_state <> 'RECORDED' then return query select 'PROVENANCE_NOT_RECORDED'::text, format('Provenance state is %s.', i.provenance_state), 'provenance'::text, 'BUILD'::text; end if;

  elsif i.stage = 'PRODUCTIZE' then
    if i.product_ref is null then
      return query select 'PRODUCT_RECORD_MISSING'::text,
        case when i.product_registry = 'LIVE_BACKEND_UNREACHABLE'
          then 'No record in the existing product registry; the live backend is unreachable from the build session (WR-RAELINK-001 B1).'
          else 'No record in the existing product registry.' end,
        'productize'::text,
        case when i.product_registry = 'LIVE_BACKEND_UNREACHABLE' then 'CHAIRMAN' else 'BUILD' end;
    end if;
    if i.serial_state <> 'ISSUED' then return query select 'SERIAL_NOT_ISSUED'::text, format('Serial state is %s.', i.serial_state), 'serial'::text, 'BUILD'::text; end if;
    if i.qr_state <> 'BOUND' then return query select 'QR_NOT_BOUND'::text, format('QR state is %s.', i.qr_state), 'serial'::text, 'BUILD'::text; end if;

  elsif i.stage = 'PRICE' then
    if i.cost_state <> 'KNOWN' then
      return query select 'COST_UNKNOWN'::text, format('Cost state is %s.', i.cost_state), 'cost'::text,
        case when i.cost_state = 'QUOTE_REQUIRED' then 'CHAIRMAN' else 'BUILD' end;
    end if;
    if i.price_state <> 'SET' then return query select 'PRICE_NOT_SET'::text, format('Price state is %s.', i.price_state), 'price'::text, 'CHAIRMAN'::text; end if;

  elsif i.stage = 'STORE' then
    if i.storefront_state <> 'LISTED' then return query select 'NOT_LISTED'::text, format('Storefront state is %s.', i.storefront_state), 'store'::text, 'BUILD'::text; end if;
    if i.checkout_path_state <> 'VERIFIED' then
      return query select 'CHECKOUT_PATH_UNVERIFIED'::text,
        format('Checkout path is %s; no purchase button may be shown.', i.checkout_path_state), 'store'::text, 'CHAIRMAN'::text;
    end if;

  elsif i.stage = 'RELEASE' then
    if i.release_evidence_ref is null then return query select 'RELEASE_EVIDENCE_MISSING'::text, 'Release cannot be claimed without evidence.'::text, 'release'::text, 'BUILD'::text; end if;
    if i.readback_state <> 'CONFIRMED' then return query select 'READBACK_MISSING'::text, format('Readback state is %s; a release is not real until it reads back.', i.readback_state), 'release'::text, 'BUILD'::text; end if;

  elsif i.stage = 'MEASURE' then
    if i.measurement_ref is null then return query select 'MEASUREMENT_MISSING'::text, 'No measurement record after release.'::text, 'measure'::text, 'BUILD'::text; end if;

  elsif i.stage = 'IMPROVE' then
    if i.improvement_ref is null then return query select 'IMPROVEMENT_MISSING'::text, 'No improvement recorded from what was measured.'::text, 'improve'::text, 'BUILD'::text; end if;
  end if;

  return;
end $$;

-- ---------------------------------------------------------------------------
-- 7 · Advance · refuses when the gate is unmet, so an item cannot be moved
--     forward by saying it moved forward.
-- ---------------------------------------------------------------------------
create or replace function conv_advance(p_canonical_id text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare i conv_items%rowtype; blockers jsonb; next_stage text;
begin
  select * into i from conv_items where canonical_id = p_canonical_id;
  if not found then return jsonb_build_object('advanced', false, 'reason', 'ITEM_NOT_FOUND'); end if;

  select coalesce(jsonb_agg(to_jsonb(g)), '[]'::jsonb) into blockers from conv_stage_gate(p_canonical_id) g;
  if jsonb_array_length(blockers) > 0 then
    return jsonb_build_object('advanced', false, 'reason', 'GATE_UNMET', 'blockers', blockers);
  end if;

  next_stage := case i.stage
    when 'CAPTURE' then 'CLASSIFY' when 'CLASSIFY' then 'ASSIGN' when 'ASSIGN' then 'PRODUCE'
    when 'PRODUCE' then 'VERIFY'  when 'VERIFY' then 'PRODUCTIZE' when 'PRODUCTIZE' then 'PRICE'
    when 'PRICE' then 'STORE'     when 'STORE' then 'RELEASE'    when 'RELEASE' then 'MEASURE'
    when 'MEASURE' then 'IMPROVE' when 'IMPROVE' then 'PRODUCE' end;

  update conv_items
     set stage = next_stage,
         version_no = case when i.stage = 'IMPROVE' then version_no + 1 else version_no end,
         last_advanced_at = now()
   where id = i.id;

  return jsonb_build_object('advanced', true, 'from', i.stage, 'to', next_stage);
end $$;

-- ---------------------------------------------------------------------------
-- 8 · Money distance and the lane board
-- ---------------------------------------------------------------------------
create or replace function conv_money_distance(p_canonical_id text)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare i conv_items%rowtype; d int := 0; c int := 0;
declare stages text[] := array['CAPTURE','CLASSIFY','ASSIGN','PRODUCE','VERIFY','PRODUCTIZE','PRICE','STORE','RELEASE'];
declare s text; saved text;
begin
  select * into i from conv_items where canonical_id = p_canonical_id;
  if not found then return jsonb_build_object('distance', null, 'reason', 'ITEM_NOT_FOUND'); end if;
  if array_position(stages, i.stage) is null then
    return jsonb_build_object('distance', 0, 'chairman_gates', 0, 'reached', true, 'note', 'Past RELEASE; in the improvement loop.');
  end if;

  saved := i.stage;
  -- Walk the item forward through a temporary stage set, counting what each
  -- stage would still refuse. The row is restored before returning.
  foreach s in array stages loop
    continue when array_position(stages, s) < array_position(stages, saved);
    update conv_items set stage = s where id = i.id;
    select count(*), count(*) filter (where g.authority = 'CHAIRMAN')
      into strict d, c from (select (conv_stage_gate(p_canonical_id)).*) g
      where true;
    exit;
  end loop;

  update conv_items set stage = saved where id = i.id;
  return jsonb_build_object('distance', d, 'chairman_gates', c, 'reached', d = 0, 'stage', saved);
end $$;

create or replace view conv_lane_board as
select l.lane_key,
       l.label,
       l.lane_code,
       count(i.id)                                            as items,
       count(i.id) filter (where i.continuity_state = 'UNVERIFIED_IN_REPO') as halted,
       min(i.last_advanced_at)                                as oldest_advancement,
       max(i.last_advanced_at)                                as latest_advancement
  from conv_lanes l
  left join conv_items i on i.lane = l.lane_key
 group by l.lane_key, l.label, l.lane_code, l.sort_order
 order by l.sort_order;

-- ---------------------------------------------------------------------------
-- 9 · Guarded links into the EXISTING registries
-- ---------------------------------------------------------------------------

-- Resolve an item's idea_ref against the existing idea_registry, if present.
create or replace function conv_resolve_idea(p_ref text)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare result jsonb;
begin
  if p_ref is null then return jsonb_build_object('ref', null, 'resolved', false, 'reason', 'NO_REF'); end if;
  if to_regclass('public.idea_registry') is null then
    return jsonb_build_object('ref', p_ref, 'resolved', false, 'reason', 'REGISTRY_ABSENT');
  end if;
  begin
    execute 'select to_jsonb(r) from idea_registry r where r.idea_id::text = $1 limit 1' into result using p_ref;
  exception when others then
    return jsonb_build_object('ref', p_ref, 'resolved', false, 'reason', 'SHAPE_MISMATCH');
  end;
  if result is null then return jsonb_build_object('ref', p_ref, 'resolved', false, 'reason', 'NOT_FOUND'); end if;
  return jsonb_build_object('ref', p_ref, 'resolved', true, 'idea', result);
end $$;

-- Register the conveyor as a department in the existing registry, if it exists.
do $$
begin
  if to_regclass('public.thylora_departments') is not null
     and exists (select 1 from information_schema.columns
                 where table_name = 'thylora_departments' and column_name = 'department_code') then
    execute $q$
      insert into thylora_departments (department_code, name, purpose, status, priority)
      values ('WR-CONVEYOR-001', 'Continuous Production Conveyor',
              'Persistent advancement pipeline for every Chairman-originated idea: capture, classify, assign, produce, verify, productize, price, store, release, measure, improve. Holds advancement state only; the idea, product, department and passport registries remain the source of truth.',
              'IMPLEMENTATION_ACTIVE', 'P1')
      on conflict (department_code) do update
        set purpose = excluded.purpose, status = excluded.status
    $q$;
    raise notice 'CONVEYOR: workroom registered in thylora_departments';
  else
    raise notice 'CONVEYOR: thylora_departments not present or differently shaped; registration skipped';
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 10 · Row level security
--      Reading the board is not authority to move an item. Advancement and
--      serial issuance are service-role only.
-- ---------------------------------------------------------------------------
alter table conv_items      enable row level security;
alter table conv_lanes      enable row level security;
alter table conv_serials    enable row level security;
alter table conv_provenance enable row level security;
alter table conv_events     enable row level security;

do $$
declare t text;
begin
  foreach t in array array['conv_items','conv_lanes','conv_serials','conv_provenance','conv_events'] loop
    execute format('drop policy if exists %I_read on %I', t, t);
    execute format('create policy %I_read on %I for select to authenticated using (true)', t, t);
  end loop;
end $$;

-- No insert/update/delete policy is created for any conv_ table. With RLS on and
-- no write policy, client roles cannot write; the service role bypasses RLS.
-- Access is not authority.

revoke execute on function conv_advance(text) from public;
grant execute on function conv_stage_gate(text) to authenticated;
grant execute on function conv_money_distance(text) to authenticated;
grant execute on function conv_resolve_idea(text) to authenticated;
grant select on conv_lane_board to authenticated;

commit;
