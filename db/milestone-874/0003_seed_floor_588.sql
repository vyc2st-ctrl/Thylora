-- MILESTONE 874 · 0003 · The 588 floor
-- Work: THY-WORK-MILESTONE-874-588
--
-- The ten readings taken at sequence 588. Four of them are real counts taken
-- from tables in this database. Five of them are UNREACHABLE or UNMEASURED with
-- the reason stated, because no build session has reached the backend of record
-- or any social platform. None of them is zero standing in for "we did not look".
--
-- The counted readings are COUNTED AT APPLY TIME, not typed in, so the floor
-- cannot drift away from the thing it claims to measure.
--
-- Idempotent, and a no-op unless sequence 588 is actually in the ledger.

begin;

do $$
declare
  v_seq bigint := 588;
  v_blocked int; v_open int; v_settled int; v_canon int;
  v_gate_text text; v_canon_text text;
begin
  if to_regclass('public.thy_sequence_ledger') is null
     or not exists (select 1 from thy_sequence_ledger where sequence_no = v_seq) then
    raise notice 'MILESTONE FLOOR: sequence 588 is not in the ledger here; floor not seeded.';
    return;
  end if;

  if exists (select 1 from thy_milestone_reading where milestone_no = v_seq) then
    return;
  end if;

  -- 1 ELAPSED TIME -----------------------------------------------------------
  perform thy_milestone_record(v_seq,'ELAPSED_TIME','MEASURED',
    'The floor measures zero elapsed time against itself; 874 measures from here.',
    v_seq, 0, null, null);

  -- 2 REVENUE ----------------------------------------------------------------
  perform thy_milestone_record(v_seq,'REVENUE','UNREACHABLE',
    'thylora-dash (jvsdxhrfhtlgaknhjxlz) revenue ledger — not reached', v_seq, null, null,
    'Egress to the backend of record was denied in this session and in WR-RAELINK-001. No revenue row was read. This is not a reading of zero.');

  -- 3 LIVE PRODUCTS ----------------------------------------------------------
  perform thy_milestone_record(v_seq,'LIVE_PRODUCTS','UNREACHABLE',
    'thylora-dash products table — not reached', v_seq, null, null,
    'Product rows live in the backend of record, which was not reachable. The repository holds product source and specification, which is not the same as a published, buyable product.');

  -- 4 ORDERS -----------------------------------------------------------------
  perform thy_milestone_record(v_seq,'ORDERS','UNREACHABLE',
    'thylora-dash orders table — not reached', v_seq, null, null,
    'No order row was read. Whether any order has ever completed is on the open QYRIS frontier at 588.');

  -- 5 CONVERSION -------------------------------------------------------------
  perform thy_milestone_record(v_seq,'CONVERSION','UNMEASURED',
    'Derived from ORDERS and sessions, both unmeasured', v_seq, null, null,
    'Conversion is a ratio of two numbers that were not measured. Deriving it would manufacture both.');

  -- 6 SOCIAL -----------------------------------------------------------------
  perform thy_milestone_record(v_seq,'SOCIAL','UNMEASURED',
    'No social platform was queried from this session', v_seq, null, null,
    'No post, reach or follower count was read from any platform. The repository holds publication specifications, not published results.');

  -- 7 DASHBOARD AND APP ------------------------------------------------------
  perform thy_milestone_record(v_seq,'DASHBOARD_APP','MEASURED',
    'Counted in vyc2st-ctrl/Thylora at 588; live state on thylora-public-world NOT checked', v_seq, null,
    'IN SOURCE: dashboard head, member app, sports surface, Time Run, public site, store, RAE Link, QYRIS — 8 surfaces. '
    'LIVE: not claimed. Deployment authority is vyc2st-ctrl/thylora-executive-dashboard and was not reachable from this session.',
    null);

  -- 8 WORLD WINDOWS ----------------------------------------------------------
  perform thy_milestone_record(v_seq,'WORLD_WINDOWS','MEASURED',
    'world-window/windows.mjs — 3 windows in the series (WW-584-001, -002, -003)', v_seq, 3, null, null);

  -- 9 GATE HEALTH ------------------------------------------------------------
  if to_regclass('public.thy_gate_law') is null then
    perform thy_milestone_record(v_seq,'GATE_HEALTH','UNMEASURED',
      'db/gate-law/ is not applied in this database', v_seq, null, null,
      'The gate law table is absent here, so gate health cannot be counted.');
  else
    select count(*) filter (where c.gate_state = 'BLOCKED'),
           count(*) filter (where c.gate_state in ('OPEN','HELD')),
           count(*) filter (where c.gate_state in ('PASSED','WAIVED','RETIRED'))
      into v_blocked, v_open, v_settled
      from thy_gate_law c
     where c.version = (select max(v.version) from thy_gate_law v where v.gate_key = c.gate_key);

    v_gate_text := format('%s blocked, %s open, %s settled, across %s gates in force',
                          v_blocked, v_open, v_settled, v_blocked + v_open + v_settled);
    perform thy_milestone_record(v_seq,'GATE_HEALTH','MEASURED',
      'Counted from thy_gate_law current versions at apply time', v_seq, v_blocked + v_open, v_gate_text, null);
  end if;

  -- 10 CANON CHANGES ---------------------------------------------------------
  if to_regclass('public.thy_omniview_statements') is null then
    perform thy_milestone_record(v_seq,'CANON_CHANGES','UNMEASURED',
      'db/omniview/ statements table is not applied in this database', v_seq, null, null,
      'The canon table is absent here, so canon changes cannot be counted.');
  else
    select count(*) into v_canon from thy_omniview_statements where entered_sequence_no <= v_seq;
    v_canon_text := format('%s canon statements entered at or before 588; %s currently CURRENT',
      v_canon, (select count(*) from thy_omniview_statements where status = 'CURRENT'));
    perform thy_milestone_record(v_seq,'CANON_CHANGES','MEASURED',
      'Counted from thy_omniview_statements at apply time', v_seq, v_canon, v_canon_text, null);
  end if;

  raise notice 'MILESTONE FLOOR: 588 recorded, 10 readings.';
end $$;

commit;
