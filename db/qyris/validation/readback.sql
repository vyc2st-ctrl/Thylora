-- THYLORA · QYRIS · READBACK VERIFICATION
--
-- WRITE BACKEND and VERIFY READBACK are two separate obligations. This file is
-- the second one. It writes a complete working sequence and then reads every
-- part of it back, asserting the read matches the write. Anything that does not
-- match raises, so run.sh exits non-zero.

\set ON_ERROR_STOP on

-- ── R1 · The pack reads back in the shape it was written ──────────────────
do $$
declare shape record;
begin
  select * into shape from qyr_pack_shape('QYRIS-PREMARRIAGE-001');
  if shape.clusters <> 16 then raise exception 'R1 FAIL clusters=%', shape.clusters; end if;
  if shape.nodes <> 112 then raise exception 'R1 FAIL nodes=%', shape.nodes; end if;
  if shape.max_depth <> 2 then raise exception 'R1 FAIL max_depth=%', shape.max_depth; end if;
  if shape.nodes_without_delta <> 0 then raise exception 'R1 FAIL nodes_without_delta=%', shape.nodes_without_delta; end if;
  if shape.nodes_missing_safeguard <> 0 then raise exception 'R1 FAIL missing_safeguard=%', shape.nodes_missing_safeguard; end if;
  raise notice 'R1 OK premarriage pack: % clusters, % nodes, depth %, % delta links',
    shape.clusters, shape.nodes, shape.max_depth, shape.delta_links;
end $$;

-- ── R2 · Every field reads back byte-identical to what was written ────────
-- Written here, read back through the function, compared character for character.
do $$
declare got record; expect_q text; expect_s text;
begin
  expect_q := 'What does each of us actually earn, own, owe and control today — in numbers, not in impressions?';
  expect_s := 'Disclosure is mutual and simultaneous. Neither person hands over documents to someone who has not handed over their own, and neither is asked for account credentials.';
  select * into got from qyr_read_node('MONEY');
  if got.question is distinct from expect_q then
    raise exception 'R2 FAIL question round-trip. got: %', got.question;
  end if;
  if got.safeguard is distinct from expect_s then
    raise exception 'R2 FAIL safeguard round-trip. got: %', got.safeguard;
  end if;
  if got.moves <> array['ACTION','AUTHORITY','EVIDENCE','RISK','TRANSFER'] then
    raise exception 'R2 FAIL moves round-trip. got: %', got.moves;
  end if;
  raise notice 'R2 OK field round-trip exact, including em dash and five declared deltas';
end $$;

-- ── R3 · The industry projection reads back, provenance intact ────────────
do $$
declare nodes bigint; authored bigint; mechanical bigint; sample record;
begin
  select count(*) into nodes from qyr_nodes where pack_id = 'QYRIS-INDUSTRY-001';
  if nodes <> 96 then raise exception 'R3 FAIL industry nodes=%', nodes; end if;
  select sum(r.authored), sum(r.mechanical) into authored, mechanical from qyr_projection_report() r;
  if authored + mechanical <> 480 then raise exception 'R3 FAIL provenance fields=%', authored + mechanical; end if;
  if authored <> 103 then raise exception 'R3 FAIL authored=%', authored; end if;
  select * into sample from qyr_read_node('RELIGION.CHILDREN');
  if sample.safeguard not like '%statutory authority%' then
    raise exception 'R3 FAIL authored safeguard lost on RELIGION.CHILDREN: %', sample.safeguard;
  end if;
  raise notice 'R3 OK industry projection: % nodes, % authored / % mechanical fields', nodes, authored, mechanical;
end $$;

-- ── R4 · The stopping rule reads back, and never reads back as finished ───
do $$
declare p uuid; st text; live bigint; rb record;
begin
  insert into qyr_passes (pack_id, owner_ref, scope)
  values ('QYRIS-PREMARRIAGE-001', 'readback-owner', array['MONEY'])
  returning pass_id into p;

  select count(*) into live from qyr_frontier(p);
  if live <> 1 then raise exception 'R4 FAIL initial frontier=% (expected the MONEY root alone)', live; end if;

  -- The MONEY root declares all five deltas, so answering it settles everything
  -- and the pass pauses: no remaining question would change any of the five.
  st := qyr_answer(p, 'MONEY', 'Both financial pictures written down.');
  if st <> 'OPEN_PAUSED' then raise exception 'R4 FAIL state after root answer=%', st; end if;

  select count(*) into live from qyr_frontier(p);
  if live <> 0 then raise exception 'R4 FAIL frontier after pause=%', live; end if;

  -- New facts arrive. The pass resumes. This is why the frontier is never closed.
  st := qyr_disturb(p, 'TRANSFER', 'A relative began receiving monthly support.');
  if st <> 'OPEN_ACTIVE' then raise exception 'R4 FAIL state after disturbance=%', st; end if;

  select * into rb from qyr_read_pass(p);
  if rb.stored_state <> rb.computed_state then
    raise exception 'R4 FAIL stored state % does not match computed state %', rb.stored_state, rb.computed_state;
  end if;
  if rb.frontier_open is not true then raise exception 'R4 FAIL frontier reported closed'; end if;
  if rb.globally_finished is not false then raise exception 'R4 FAIL inquiry reported globally finished'; end if;
  raise notice 'R4 OK stopping rule: paused with all five deltas settled, then TRANSFER disturbed — % now settled, % live questions, frontier OPEN, globally_finished=%',
    array_length(rb.settled, 1), rb.live, rb.globally_finished;
end $$;

-- ── R5 · A full support sequence writes and reads back ────────────────────
do $$
declare seat_state text; grants bigint; draw_state text; returned integer; snap jsonb;
begin
  insert into qyr_households (household_id, label, owner_ref)
  values ('HH-READBACK', 'Readback household', 'rb-owner') on conflict do nothing;

  insert into qyr_seats (seat_id, household_id, family_id, person_ref, engaged_by, paid_rate_minor)
  values ('RB1','HH-READBACK','LEARNING_SUPPORT','rb-person-1','rb-owner', 2200) on conflict do nothing;

  insert into qyr_access_grants (seat_id, scope_code, purpose, granted_by, expires_at)
  values ('RB1','LEARNING_RECORD','Read the school correspondence for MATTER-RB','rb-owner', now() + interval '30 days');

  insert into qyr_resource_draws (draw_id, seat_id, resource, purpose, mission_basis, amount_minor, cap_minor, approved_by, matter_ref)
  values ('44444444-4444-4444-4444-444444444444','RB1','Reading books',
          'Books for the learner to keep at home',
          'Learning support for a household inside the programme',
          5000, 10000, 'rb-owner', 'MATTER-RB');

  update qyr_resource_draws
     set state = 'CLOSED', receipt_ref = 'RCPT-RB-1', spent_minor = 4200,
         returned_minor = 5000 - 4200, closed_by = 'rb-owner', closed_at = now()
   where draw_id = '44444444-4444-4444-4444-444444444444';

  select state, returned_minor into draw_state, returned
    from qyr_resource_draws where draw_id = '44444444-4444-4444-4444-444444444444';
  if draw_state <> 'CLOSED' then raise exception 'R5 FAIL draw state=%', draw_state; end if;
  if returned <> 800 then raise exception 'R5 FAIL returned=% (expected 800)', returned; end if;

  -- A breach effect applies on record, before any review.
  insert into qyr_breaches (seat_id, category, detail, raised_by)
  values ('RB1','SCOPE_EXCEEDED','Attended a parents evening that was outside the granted scope','rb-owner');

  select state into seat_state from qyr_seats where seat_id = 'RB1';
  select count(*) into grants from qyr_access_grants where seat_id = 'RB1' and state = 'ACTIVE';
  if grants <> 0 then raise exception 'R5 FAIL grants still active after breach=%', grants; end if;

  snap := qyr_read_household('HH-READBACK');
  if (snap->>'active_grants')::int <> 0 then raise exception 'R5 FAIL readback active_grants=%', snap->>'active_grants'; end if;
  if (snap->>'breaches')::int <> 1 then raise exception 'R5 FAIL readback breaches=%', snap->>'breaches'; end if;
  if (snap->>'audit_entries')::int < 1 then raise exception 'R5 FAIL readback audit_entries=%', snap->>'audit_entries'; end if;
  if (snap->'seats'->0->>'decision_rights') <> 'NONE' then
    raise exception 'R5 FAIL a seat read back with decision rights: %', snap->'seats'->0->>'decision_rights';
  end if;
  raise notice 'R5 OK support sequence: draw closed with receipt, % returned, breach revoked all grants, seat state %, readback %',
    returned, seat_state, snap;
end $$;

-- ── R6 · Self-disqualification reads back with standing unchanged ─────────
do $$
declare dq record;
begin
  insert into qyr_seats (seat_id, household_id, family_id, person_ref, engaged_by)
  values ('RB2','HH-READBACK','SAFETY','rb-person-2','rb-owner') on conflict do nothing;

  insert into qyr_self_disqualifications (seat_id, matter_ref, reason, mandatory, grounds)
  values ('RB2','MATTER-RB2','The contractor quoting is my brother', true, array['RELATED_TO_PARTY']);

  select * into dq from qyr_self_disqualifications where seat_id = 'RB2' order by at desc limit 1;
  if dq.penalty <> 'NONE' then raise exception 'R6 FAIL penalty=%', dq.penalty; end if;
  if dq.standing <> 'UNCHANGED' then raise exception 'R6 FAIL standing=%', dq.standing; end if;
  if not ('RELATED_TO_PARTY' = any(dq.grounds)) then raise exception 'R6 FAIL grounds=%', dq.grounds; end if;
  raise notice 'R6 OK stand-down read back: mandatory=%, grounds=%, penalty=%, standing=%',
    dq.mandatory, dq.grounds, dq.penalty, dq.standing;
end $$;

-- ── R7 · Restoration is staged, and a never-restorable finding stays so ───
do $$
declare bid uuid; r record; seat_state text;
begin
  insert into qyr_seats (seat_id, household_id, family_id, person_ref, engaged_by)
  values ('RB3','HH-READBACK','SECURITY','rb-person-3','rb-owner') on conflict do nothing;

  insert into qyr_breaches (seat_id, category, detail, raised_by)
  values ('RB3','SURVEILLANCE','Installed a camera covering a bedroom door','rb-owner')
  returning breach_id into bid;

  select state into seat_state from qyr_seats where seat_id = 'RB3';
  if seat_state <> 'ENDED_NOT_RESTORABLE' then raise exception 'R7 FAIL seat state=%', seat_state; end if;

  select * into r from qyr_restoration_eligibility(bid, 100000, true, true, true, true);
  if r.eligible then raise exception 'R7 FAIL a surveillance finding was found restorable'; end if;
  if not ('NOT_RESTORABLE' = any(r.blockers)) then raise exception 'R7 FAIL blockers=%', r.blockers; end if;

  -- Appeal is still available, because it challenges whether the finding is true.
  insert into qyr_appeals (breach_id, raised_by, grounds, reviewer)
  values (bid, 'rb-person-3', 'The camera was installed by the previous tenant and I can show the invoice', 'reviewer-x');
  raise notice 'R7 OK never-restorable held (blockers=%), appeal against the finding still opened', r.blockers;
end $$;

-- ── R8 · An overturned finding reinstates, and the trail shows both ───────
do $$
declare bid uuid; aid uuid; seat_state text; entries bigint;
begin
  select breach_id into bid from qyr_breaches where seat_id = 'RB3' order by recorded_at desc limit 1;
  select appeal_id into aid from qyr_appeals where breach_id = bid order by opened_at desc limit 1;
  update qyr_appeals
     set state = 'DECIDED', outcome = 'OVERTURNED', decided_by = 'reviewer-x',
         reasoning = 'Invoice and tenancy record confirm the camera predates this engagement', decided_at = now()
   where appeal_id = aid;

  select state into seat_state from qyr_seats where seat_id = 'RB3';
  if seat_state <> 'ACTIVE' then raise exception 'R8 FAIL seat not reinstated, state=%', seat_state; end if;

  select count(*) into entries from qyr_audit where seat_id = 'RB3';
  if entries < 2 then raise exception 'R8 FAIL trail does not carry both the finding and the reinstatement: %', entries; end if;
  raise notice 'R8 OK overturned on appeal: seat %, trail carries % entries including the original finding', seat_state, entries;
end $$;

-- ── R9 · The SR candidate reads back as tested, not canon ─────────────────
do $$
declare canon_rows bigint; failed bigint; gate record; scalar_refused boolean := false;
begin
  select count(*) into canon_rows from qyr_sr_candidate where canon is true;
  if canon_rows <> 0 then raise exception 'R9 FAIL SR read back as canon'; end if;

  select count(*) into failed from qyr_sr_test_results where passed is false;
  if failed <> 7 then raise exception 'R9 FAIL failed tests=% (expected 7 of 8)', failed; end if;

  -- Factors unestablished: the gate must say UNKNOWN rather than invent a number.
  select * into gate from qyr_sr_gate('RB1');
  if gate.eligible then raise exception 'R9 FAIL gate admitted a seat with no observations'; end if;
  if not (gate.blockers::text like '%FACTOR_UNKNOWN%') then
    raise exception 'R9 FAIL gate did not report UNKNOWN: %', gate.blockers;
  end if;

  begin
    perform qyr_sr_score('RB1');
  exception when others then scalar_refused := true;
  end;
  if not scalar_refused then raise exception 'R9 FAIL the scalar was produced'; end if;
  raise notice 'R9 OK SR: canon=false, 7 of 8 tests failed, gate binds on % with UNKNOWN reported, scalar refused', gate.binding;
end $$;

-- ── R10 · Summary reads back with every must-be-zero at zero ──────────────
do $$
declare r record; bad integer := 0;
begin
  for r in select * from qyr_readback_summary() loop
    raise notice 'R10   % = %  (%)', rpad(r.check_name, 26), r.observed, r.note;
    if r.note like 'Must be zero%' and r.observed <> 0 then
      bad := bad + 1;
      raise warning 'R10 FAIL % = %', r.check_name, r.observed;
    end if;
  end loop;
  if bad > 0 then raise exception 'R10 FAIL % must-be-zero checks are non-zero', bad; end if;
  raise notice 'R10 OK every must-be-zero check reads back at zero';
end $$;

\echo '== READBACK VERIFIED'
