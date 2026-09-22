-- PROOF TEST · GATE THAT
-- Work: THY-WORK-DYNAMIC-GATE-LAW-588
--
-- Question the proof answers: when a gate's rule changes three times, does the
-- read hold the CURRENT rule, keep every superseded rule readable, and refuse a
-- stale rule arriving late?
--
-- Rolled back at the end. The proof proves the mechanism; it does not seed law.
begin;

do $$
declare
  v1 jsonb; v2 jsonb; v3 jsonb;
  v_read jsonb; v_all jsonb;
  ok boolean := true;
  v_stale_refused boolean := false;
begin
  -- Version 1: the rule as first written.
  v1 := thy_gate_declare(
    'GATE-PROOF-WITNESS','DASHBOARD','CHAIRMAN','Chairman',
    'No evidence yet','A change was called live before anyone had opened the live surface.',
    'Evaluated whenever a change is described as live.',
    'OPEN','Nothing has been witnessed.','NO EXCEPTION',
    'A change is not live until someone opens the live surface and says what they saw.',
    588, null, 'Holds until witnessed.','DASHBOARD');

  -- Version 2: the state changes. Under this law that is a NEW RULE, not an edit.
  v2 := thy_gate_supersede(
    'GATE-PROOF-WITNESS',1,'DASHBOARD','CHAIRMAN','Chairman',
    'Witness note recorded on thylora-public-world','The surface was opened and the header was read back.',
    'Evaluated whenever a change is described as live.',
    'HELD','The header was witnessed; the commerce panel was not.','NO EXCEPTION',
    'Part of the head is witnessed. The rest is not, and is not claimed.',
    589, null, 'Holds until the whole head is witnessed.','DASHBOARD');

  -- Version 3: the rule itself widens.
  v3 := thy_gate_supersede(
    'GATE-PROOF-WITNESS',2,'DASHBOARD','CHAIRMAN','Chairman',
    'Witness note plus screenshot','Witnessing one panel was being read as witnessing the head.',
    'Evaluated whenever any part of the head is described as live.',
    'PASSED','Every baseline panel was opened and read back.','NO EXCEPTION',
    'The whole head is witnessed, panel by panel. A partial witness is recorded as partial.',
    590, null, 'Reviewed on the next head change.','DASHBOARD');

  -- HOLD CURRENT RULE STRONGLY -----------------------------------------------
  v_read := thy_gate_current('GATE-PROOF-WITNESS');

  if (v_read->'current'->>'VERSION')::int <> 3 then
    raise notice 'PROOF FAIL: current version is %, expected 3', v_read->'current'->>'VERSION'; ok := false;
  end if;
  if v_read->'current'->>'STATE' <> 'PASSED' then
    raise notice 'PROOF FAIL: current state is %, expected PASSED', v_read->'current'->>'STATE'; ok := false;
  end if;
  if v_read->'current'->>'SUPERSEDES' <> 'version 2' then
    raise notice 'PROOF FAIL: current rule does not name what it supersedes'; ok := false;
  end if;

  -- Every superseded rule is still readable, newest first.
  if jsonb_array_length(v_read->'superseded') <> 2 then
    raise notice 'PROOF FAIL: % superseded rules readable, expected 2',
      jsonb_array_length(v_read->'superseded'); ok := false;
  end if;
  if v_read->'superseded'->0->>'READBACK' <> (v2->>'READBACK') then
    raise notice 'PROOF FAIL: superseded rules are not newest-first'; ok := false;
  end if;
  if v_read->'superseded'->1->>'STATE' <> 'OPEN' then
    raise notice 'PROOF FAIL: the original rule did not survive supersession'; ok := false;
  end if;

  -- The eleven fields are present, in the order the law names them.
  if jsonb_array_length(v_read->'field_order') <> 11 then
    raise notice 'PROOF FAIL: field order has % entries, expected 11',
      jsonb_array_length(v_read->'field_order'); ok := false;
  end if;
  if v_read->'field_order'->>0 <> 'SCOPE' or v_read->'field_order'->>10 <> 'NEXT_REVIEW' then
    raise notice 'PROOF FAIL: field order does not run SCOPE .. NEXT REVIEW'; ok := false;
  end if;

  -- NO OLD RULE OVERRIDING NEWER RULE ----------------------------------------
  begin
    perform thy_gate_supersede(
      'GATE-PROOF-WITNESS',1,'DASHBOARD','CHAIRMAN','Chairman','stale','stale','stale',
      'OPEN','a rule drafted against version 1 arriving after version 3','NO EXCEPTION',
      'nothing is witnessed', 591, null, 'stale','DASHBOARD');
  exception when others then
    v_stale_refused := true;
  end;
  if not v_stale_refused then
    raise notice 'PROOF FAIL: a rule superseding version 1 was accepted while version 3 was in force'; ok := false;
  end if;

  -- The current rule is unchanged by the refused attempt.
  v_read := thy_gate_current('GATE-PROOF-WITNESS');
  if (v_read->'current'->>'VERSION')::int <> 3 or v_read->'current'->>'STATE' <> 'PASSED' then
    raise notice 'PROOF FAIL: the refused stale rule disturbed the current rule'; ok := false;
  end if;

  -- CURRENT GATES read: the dashboard surface's actual source ----------------
  v_all := thy_gate_law_readback('DASHBOARD');
  if not exists (
    select 1 from jsonb_array_elements(v_all->'gates') g
     where g->>'GATE' = 'GATE-PROOF-WITNESS' and (g->>'VERSION')::int = 3) then
    raise notice 'PROOF FAIL: the scope readback does not carry the current version'; ok := false;
  end if;
  if exists (
    select 1 from jsonb_array_elements(v_all->'gates') g
     where g->>'GATE' = 'GATE-PROOF-WITNESS' and (g->>'VERSION')::int < 3) then
    raise notice 'PROOF FAIL: the scope readback carried a superseded version as current'; ok := false;
  end if;
  -- Blocked gates sort ahead of settled ones, so the first gate read is the one that stops work.
  if v_all->'gates'->0->>'STATE' not in ('BLOCKED','OPEN','HELD') then
    raise notice 'PROOF FAIL: settled gates sorted ahead of blocking ones'; ok := false;
  end if;
  if jsonb_array_length(v_all->'law') <> 4 then
    raise notice 'PROOF FAIL: the four laws are not returned with the read'; ok := false;
  end if;

  if ok then
    raise notice 'PROOF PASS: GATE THAT — version 3 held as current across 3 rules, both superseded rules readable, a stale rule refused without disturbing the current one, and the scope read returned only current versions';
  end if;
end $$;

rollback;
