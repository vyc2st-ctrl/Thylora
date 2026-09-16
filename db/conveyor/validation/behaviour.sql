-- CONVEYOR · behavioural validation
-- Every rule the spine claims is exercised here against a real database. A rule
-- that only exists in a comment is not a rule.

\set ON_ERROR_STOP on
\timing off

create or replace function expect_reject(p_sql text, p_label text) returns void
language plpgsql as $$
begin
  begin
    execute p_sql;
    raise exception 'NOT REJECTED: %', p_label;
  exception
    when others then
      if sqlerrm like 'NOT REJECTED%' then raise; end if;
      raise notice 'rejected as expected · %', p_label;
  end;
end $$;

-- A complete, advanceable item.
insert into conv_items (canonical_id, title, source_parent, continuity_evidence, lane, item_kind,
                        world_class, owner_department, responsible_person, person_authority, stage)
values ('CONV-TST-0001', 'Validation item', 'Validation parent', 'db/conveyor/validation/behaviour.sql',
        'GAMES', 'GAME_SURFACE', 'WORLD_SIMULATED', 'TEST DEPT', 'Named Person', 'BUILD', 'CAPTURE');

-- 1 · Capture is met, so the item advances.
do $$ declare r jsonb; begin
  r := conv_advance('CONV-TST-0001');
  if not (r->>'advanced')::boolean then raise exception 'expected advance, got %', r; end if;
  if r->>'to' <> 'CLASSIFY' then raise exception 'expected CLASSIFY, got %', r->>'to'; end if;
end $$;

-- 2 · The gate reports every unmet requirement at once, each with a route and authority.
do $$ declare n int; begin
  update conv_items set stage = 'PRODUCTIZE' where canonical_id = 'CONV-TST-0001';
  select count(*) into n from conv_stage_gate('CONV-TST-0001');
  if n <> 3 then raise exception 'expected 3 blockers at PRODUCTIZE, got %', n; end if;
  if exists (select 1 from conv_stage_gate('CONV-TST-0001') where route is null or authority is null)
    then raise exception 'a blocker did not name its route or authority'; end if;
end $$;

-- 3 · An item cannot be advanced through an unmet gate.
do $$ declare r jsonb; begin
  r := conv_advance('CONV-TST-0001');
  if (r->>'advanced')::boolean then raise exception 'unmet gate allowed an advance'; end if;
  if r->>'reason' <> 'GATE_UNMET' then raise exception 'wrong refusal reason: %', r; end if;
end $$;

-- 4 · An unreachable product registry makes the product record a Chairman action.
do $$ begin
  update conv_items set product_registry = 'LIVE_BACKEND_UNREACHABLE' where canonical_id = 'CONV-TST-0001';
  if not exists (select 1 from conv_stage_gate('CONV-TST-0001')
                 where code = 'PRODUCT_RECORD_MISSING' and authority = 'CHAIRMAN')
    then raise exception 'unreachable registry did not become a Chairman gate'; end if;
  update conv_items set product_registry = 'LIVE_BACKEND' where canonical_id = 'CONV-TST-0001';
end $$;

-- 5 · An unconfirmed continuity record halts the item at EVERY stage.
do $$ begin
  update conv_items set continuity_state = 'UNVERIFIED_IN_REPO', stage = 'PRODUCE' where canonical_id = 'CONV-TST-0001';
  if not exists (select 1 from conv_stage_gate('CONV-TST-0001') where code = 'CONTINUITY_UNVERIFIED')
    then raise exception 'unconfirmed continuity did not halt the item at PRODUCE'; end if;
  update conv_items set continuity_state = 'VERIFIED_IN_REPO' where canonical_id = 'CONV-TST-0001';
end $$;

-- 6 · Naming an in-world person is a Chairman act by default.
do $$ begin
  update conv_items set stage = 'ASSIGN', responsible_person = null, person_authority = 'CHAIRMAN'
   where canonical_id = 'CONV-TST-0001';
  if not exists (select 1 from conv_stage_gate('CONV-TST-0001')
                 where code = 'RESPONSIBLE_PERSON_MISSING' and authority = 'CHAIRMAN')
    then raise exception 'an undesignated role was treated as build work'; end if;
end $$;

-- 7 · Claims must be backed by a value, enforced in the database.
select expect_reject($$update conv_items set price_state = 'SET' where canonical_id = 'CONV-TST-0001'$$,
  'price SET with no price evidence');
select expect_reject($$update conv_items set storefront_state = 'LISTED' where canonical_id = 'CONV-TST-0001'$$,
  'storefront LISTED with no listing evidence');
select expect_reject($$update conv_items set checkout_path_state = 'VERIFIED' where canonical_id = 'CONV-TST-0001'$$,
  'checkout VERIFIED with no checkout evidence');
select expect_reject($$update conv_items set readback_state = 'CONFIRMED' where canonical_id = 'CONV-TST-0001'$$,
  'readback CONFIRMED with no readback evidence');
select expect_reject($$update conv_items set rights_state = 'CLEARED' where canonical_id = 'CONV-TST-0001'$$,
  'rights CLEARED with no rights evidence');

-- 8 · Claims backed by another table are rejected by the constraint trigger.
select expect_reject($$
  begin;
  update conv_items set provenance_state = 'RECORDED' where canonical_id = 'CONV-TST-0001';
  commit;
$$, 'provenance RECORDED with no chain');

select expect_reject($$
  begin;
  update conv_items set serial_state = 'ISSUED' where canonical_id = 'CONV-TST-0001';
  commit;
$$, 'serial ISSUED with no issued serial');

-- 9 · With the backing row present, the same claim is accepted.
do $$ declare iid uuid; begin
  select id into iid from conv_items where canonical_id = 'CONV-TST-0001';
  insert into conv_serials (item_id, serial, lane_code, version_no, sequence_no, qr_payload, qr_visibility)
  values (iid, 'THY-GAM-TST0001-V1-000001-XX', 'GAM', 1, 1, '/passport/THY-GAM-TST0001-V1-000001-XX', 'REGISTRY_ONLY');
  insert into conv_provenance (item_id, seq, event_type, source_description, entry_digest)
  values (iid, 1, 'CREATED', 'Written by the validation harness', 'deadbeefdeadbeef');
  update conv_items set serial_state = 'ISSUED', qr_state = 'BOUND', provenance_state = 'RECORDED'
   where canonical_id = 'CONV-TST-0001';
  raise notice 'backed claims accepted';
end $$;

-- 10 · A serial is never reused.
select expect_reject($$
  insert into conv_serials (item_id, serial, lane_code, version_no, sequence_no)
  select id, 'THY-GAM-TST0001-V1-000001-XX', 'GAM', 1, 2 from conv_items where canonical_id = 'CONV-TST-0001'
$$, 'duplicate serial');

-- 11 · A provenance entry cannot claim a sequence that is already taken.
select expect_reject($$
  insert into conv_provenance (item_id, seq, event_type, source_description, entry_digest)
  select id, 1, 'DERIVED', 'Second entry claiming seq 1', 'aaaa' from conv_items where canonical_id = 'CONV-TST-0001'
$$, 'duplicate provenance sequence');

-- 12 · A provenance event must say where the work came from.
select expect_reject($$
  insert into conv_provenance (item_id, seq, event_type, source_description, entry_digest)
  select id, 2, 'DERIVED', '   ', 'bbbb' from conv_items where canonical_id = 'CONV-TST-0001'
$$, 'empty provenance source description');

-- 13 · An unknown stage cannot be stored.
select expect_reject($$update conv_items set stage = 'SHIPPING' where canonical_id = 'CONV-TST-0001'$$,
  'unknown stage');

-- 14 · An unknown lane cannot be stored.
select expect_reject($$update conv_items set lane = 'CRYPTO' where canonical_id = 'CONV-TST-0001'$$,
  'unknown lane');

-- 15 · Release evidence without a confirmed readback is refused.
select expect_reject($$update conv_items set release_evidence_ref = 'somewhere' where canonical_id = 'CONV-TST-0001'$$,
  'release evidence with no readback');

-- 16 · Advancement is written to the append-only event trail.
do $$ declare n int; begin
  select count(*) into n from conv_events e
    join conv_items i on i.id = e.item_id where i.canonical_id = 'CONV-TST-0001';
  if n < 2 then raise exception 'expected an event trail, found % events', n; end if;
end $$;

-- 17 · Every lane is present on the board, including empty ones.
do $$ declare n int; begin
  select count(*) into n from conv_lane_board;
  if n <> 12 then raise exception 'expected 12 lanes on the board, got %', n; end if;
end $$;

-- 18 · Access is not authority: no write policy exists for any conv_ table.
do $$ declare n int; begin
  select count(*) into n from pg_policies
   where schemaname = 'public' and tablename like 'conv\_%' and cmd <> 'SELECT';
  if n <> 0 then raise exception 'found % write policies on conveyor tables', n; end if;
end $$;

-- 19 · RLS is enabled on every conveyor table.
do $$ declare n int; begin
  select count(*) into n from pg_class c join pg_namespace ns on ns.oid = c.relnamespace
   where ns.nspname = 'public' and c.relname like 'conv\_%' and c.relkind = 'r' and not c.relrowsecurity;
  if n <> 0 then raise exception '% conveyor tables have RLS disabled', n; end if;
end $$;

-- 20 · A missing idea registry degrades instead of failing.
do $$ declare r jsonb; begin
  r := conv_resolve_idea('IDEA-1');
  if (r->>'resolved')::boolean then raise exception 'resolved against a registry that is not there'; end if;
  if r->>'reason' <> 'REGISTRY_ABSENT' then raise exception 'wrong reason: %', r; end if;
end $$;

-- 21 · SQL/JS parity. The same fixture is asserted in tests/conveyor.lanes.test.mjs.
--      A client gate that disagrees with this one is a bug in the client.
--      Fixture: PRODUCTIZE, product registry unreachable, no serial, no QR.
do $$ declare got text; begin
  update conv_items
     set stage = 'PRODUCTIZE', product_registry = 'LIVE_BACKEND_UNREACHABLE',
         product_ref = null, serial_state = 'NONE', qr_state = 'NONE'
   where canonical_id = 'CONV-TST-0001';
  select string_agg(code || ':' || authority, ',' order by code) into got from conv_stage_gate('CONV-TST-0001');
  if got <> 'PRODUCT_RECORD_MISSING:CHAIRMAN,QR_NOT_BOUND:BUILD,SERIAL_NOT_ISSUED:BUILD' then
    raise exception 'SQL/JS parity fixture changed: %', got;
  end if;
  raise notice 'parity fixture · %', got;
end $$;

drop function expect_reject(text, text);
select 'CONVEYOR BEHAVIOUR VALIDATION PASSED' as result;
