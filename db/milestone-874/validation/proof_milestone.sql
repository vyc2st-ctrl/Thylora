-- PROOF TEST · MILESTONE 874 AGAINST 588
-- Work: THY-WORK-MILESTONE-874-588
--
-- Question the proof answers: does the comparison refuse while 874 is in the
-- future, and when 874 genuinely arrives, does it report a delta ONLY where both
-- ends were measured?
--
-- Sequence 874 is appended inside this transaction and ROLLED BACK. Nothing here
-- reaches the ledger. That is the only honest way to test a future milestone.
begin;

do $$
declare
  v jsonb; m jsonb;
  ok boolean := true;
  refused boolean;
begin
  -- Before 874 exists ---------------------------------------------------------
  v := thy_milestone_compare(874, 588);
  if (v->>'comparable')::boolean then
    raise notice 'PROOF FAIL: the comparison ran while 874 was still in the future'; ok := false;
  end if;
  if (v->>'sequences_remaining')::int <> 286 then
    raise notice 'PROOF FAIL: % sequences remaining, expected 286', v->>'sequences_remaining'; ok := false;
  end if;
  if v->'floor'->>'recorded' <> '10' then
    raise notice 'PROOF FAIL: the 588 floor holds % readings, expected 10', v->'floor'->>'recorded'; ok := false;
  end if;

  -- The floor never reports a money number it did not read.
  for m in select value from jsonb_array_elements(v->'floor'->'readings') loop
    if m->>'metric' in ('REVENUE','ORDERS','LIVE_PRODUCTS')
       and m->>'state' not in ('UNREACHABLE','UNMEASURED') then
      raise notice 'PROOF FAIL: % is reported as % at 588, but no backend row was read',
        m->>'metric', m->>'state'; ok := false;
    end if;
  end loop;

  -- 874 arrives, honestly: it follows the head, it is not inserted around it ---
  refused := false;
  begin
    insert into thy_sequence_ledger (sequence_no, previous_sequence_no, occurred_local, local_timezone,
      occurred_utc, why_change_occurred, what_changed, why_it_changed, what_remained,
      authority, truth_class, next_better_question, restart_point)
    values (874, 700, now(), 'UTC', now(), 'w','w','w','w','Chairman','CHAIRMAN_ASSERTED','q','r');
  exception when others then refused := true; end;
  if not refused then
    raise notice 'PROOF FAIL: 874 was chained to a sequence that never existed'; ok := false;
  end if;

  perform thy_sequence_append(
    874, now()::timestamp, 'UTC',
    'The Chairman reached milestone 874.',
    'Milestone 874 readings were taken against the 588 floor.',
    'A milestone is measured when it arrives, from readings taken at that milestone.',
    'The 588 floor is unchanged and still readable.',
    'Chairman','CHAIRMAN_ASSERTED',
    'Which measure moved least, and why?',
    'Milestone 874 recorded.');

  -- Readings at 874. Two measured at both ends, one measured only at 874.
  perform thy_milestone_record(874,'WORLD_WINDOWS','MEASURED','world-window/windows.mjs at 874',874, 11);
  perform thy_milestone_record(874,'CANON_CHANGES','MEASURED','thy_omniview_statements at 874',874, 47);
  perform thy_milestone_record(874,'REVENUE','MEASURED','thylora-dash revenue ledger, read at 874',874, 125000);
  perform thy_milestone_record(874,'ORDERS','UNREACHABLE','thylora-dash orders — not reached at 874',874,
    null, null, 'The orders read failed again at 874.');

  v := thy_milestone_compare(874, 588);
  if not (v->>'comparable')::boolean then
    raise notice 'PROOF FAIL: the comparison still refuses after 874 was recorded'; ok := false;
  end if;
  if (v->>'sequences_between')::int <> 286 then
    raise notice 'PROOF FAIL: sequences between is %, expected 286', v->>'sequences_between'; ok := false;
  end if;

  -- All ten measures are present, whether or not they were measured.
  if jsonb_array_length(v->'metrics') <> 10 then
    raise notice 'PROOF FAIL: % measures compared, expected 10', jsonb_array_length(v->'metrics'); ok := false;
  end if;

  -- A delta exists only where BOTH ends were measured numbers, and it must equal
  -- the arithmetic on the two readings. The expected value is derived from the
  -- floor that was actually recorded, not hardcoded: the floor's counted measures
  -- move whenever a migration adds canon, and a hardcoded expectation would turn
  -- that ordinary growth into a false failure.
  select value into m from jsonb_array_elements(v->'metrics') where value->>'metric' = 'WORLD_WINDOWS';
  if (m->>'delta')::numeric <> 11 - (m->'from'->>'value')::numeric then
    raise notice 'PROOF FAIL: WORLD_WINDOWS delta is %, expected 11 - % ', m->>'delta', m->'from'->>'value'; ok := false;
  end if;
  select value into m from jsonb_array_elements(v->'metrics') where value->>'metric' = 'CANON_CHANGES';
  if (m->>'delta')::numeric <> 47 - split_part(m->'from'->>'value', ' ', 1)::numeric then
    raise notice 'PROOF FAIL: CANON_CHANGES delta is %, expected 47 - %',
      m->>'delta', split_part(m->'from'->>'value', ' ', 1); ok := false;
  end if;

  -- REVENUE was UNREACHABLE at 588 and measured at 874. 125000 minus "we could
  -- not look" is not 125000, and the comparison must say so rather than subtract.
  select value into m from jsonb_array_elements(v->'metrics') where value->>'metric' = 'REVENUE';
  if (m->>'delta') not like 'NO DELTA:%' then
    raise notice 'PROOF FAIL: REVENUE produced a delta (%) against an unmeasured floor', m->>'delta'; ok := false;
  end if;
  if m->'to'->>'value' <> '125000' then
    raise notice 'PROOF FAIL: the 874 revenue reading is not carried through'; ok := false;
  end if;

  -- ORDERS was unmeasured at both ends: still no delta, and still not zero.
  select value into m from jsonb_array_elements(v->'metrics') where value->>'metric' = 'ORDERS';
  if (m->>'delta') not like 'NO DELTA:%' then
    raise notice 'PROOF FAIL: ORDERS produced a delta from two non-measurements'; ok := false;
  end if;

  -- SOCIAL was never recorded at 874 at all: reported as NOT_RECORDED, not zero.
  select value into m from jsonb_array_elements(v->'metrics') where value->>'metric' = 'SOCIAL';
  if m->'to'->>'state' <> 'NOT_RECORDED' then
    raise notice 'PROOF FAIL: an unrecorded measure at 874 reads as %, expected NOT_RECORDED',
      m->'to'->>'state'; ok := false;
  end if;

  if (v->>'measured_both_ends')::int <> 2 then
    raise notice 'PROOF FAIL: % measures were measured at both ends, expected 2',
      v->>'measured_both_ends'; ok := false;
  end if;

  if ok then
    raise notice 'PROOF PASS: MILESTONE 874 — the comparison refused while 874 was 286 sequences away, refused a sequence chained to a gap, and once 874 genuinely arrived returned all ten measures with deltas only where both ends were measured (2 of 10); revenue against an unmeasured floor returned NO DELTA rather than a number';
  end if;
end $$;

rollback;
