-- THYLORA · TOMORROW'S STARTING PACKET · READBACK VERIFICATION
-- Work code: THY-WORK-TOMORROW-FLOOR-584
--
-- RUN THIS TWICE:
--   BEFORE 0001 — to read the live head and see what this packet could not see.
--   AFTER  0001 — to verify every row actually landed.
--
-- This script writes NOTHING. It only reads and reports. It is safe to run at
-- any time, including on a head far beyond 584.
--
-- Each check reports PASS, FAIL or NOT_PRESENT. NOT_PRESENT means the table does
-- not exist on this backend and the check could not be run — it is never
-- reported as a pass.

\echo '=============================================================='
\echo 'THYLORA READBACK · THY-WORK-TOMORROW-FLOOR-584'
\echo '=============================================================='

-- ---------------------------------------------------------------------------
-- A · THE HEAD. Read this before anything else.
-- ---------------------------------------------------------------------------
-- The authoring session could read no further than sequence 522. Anything this
-- reports above that is unread by the packet and outranks it.

select
  'A · HEAD' as check,
  case when to_regclass('public.thylora_query_carryforward') is null
       then 'NOT_PRESENT' else 'READ' end as state,
  (select max(sequence_no) from thylora_query_carryforward) as live_head_sequence,
  522 as last_sequence_readable_by_packet,
  greatest(coalesce((select max(sequence_no) from thylora_query_carryforward), 0) - 522, 0) as unread_sequences,
  case
    when coalesce((select max(sequence_no) from thylora_query_carryforward), 0) > 584
      then 'LIVE HEAD IS BEYOND 584 — newer deltas exist that the packet did not read. Reconcile before trusting it.'
    when coalesce((select max(sequence_no) from thylora_query_carryforward), 0) > 522
      then 'Sequences between 523 and the live head were NOT read by the packet.'
    else 'Live head is at or below the sequence the packet could see.'
  end as verdict
where to_regclass('public.thylora_query_carryforward') is not null;

-- ---------------------------------------------------------------------------
-- B · THE CONTINUITY FLOOR MUST NOT HAVE MOVED
-- ---------------------------------------------------------------------------
-- The packet writes an ordinary CURRENT carryforward row and NO authority
-- designation. If the controlling floor changed, something other than this
-- packet moved it — or the packet was applied wrongly. Either way, stop.

select
  'B · FLOOR UNMOVED' as check,
  case when to_regclass('public.thylora_continuity_anchor_authority') is null
       then 'NOT_PRESENT'
       when exists (
         select 1 from thylora_continuity_anchor_authority
         where evidence_ref ilike '%TOMORROW-PACKET-584%'
            or evidence_ref ilike '%THY-WORK-TOMORROW-FLOOR-584%')
       then 'FAIL — this packet appears in the authority ledger. It must never designate a floor.'
       else 'PASS — no authority designation was written by this packet.'
  end as state;

-- ---------------------------------------------------------------------------
-- C · WORK REGISTRY · four rows
-- ---------------------------------------------------------------------------

select
  'C · WORK ROWS' as check,
  w.work_code,
  w.state,
  w.phase,
  case when coalesce(w.acceptance_test,'') = '' then 'FAIL — no acceptance test' else 'PASS' end as acceptance,
  case when coalesce(w.dependency,'') = '' then 'note: no dependency recorded' else 'blocker recorded' end as dependency_state
from thylora_execution_work_registry w
where w.work_code in (
  'THY-WORK-TOMORROW-FLOOR-584',
  'THY-WORK-STORE-UTILITY-ARTIFACT-583',
  'THY-WORK-WORLD-SERIES-584',
  'THY-WORK-DAILY-LANGUAGE-584')
order by w.work_code;

select
  'C · WORK ROW COUNT' as check,
  count(*) as found,
  4 as expected,
  case when count(*) = 4 then 'PASS' else 'FAIL — ' || (4 - count(*))::text || ' row(s) did not land' end as verdict
from thylora_execution_work_registry
where work_code in (
  'THY-WORK-TOMORROW-FLOOR-584',
  'THY-WORK-STORE-UTILITY-ARTIFACT-583',
  'THY-WORK-WORLD-SERIES-584',
  'THY-WORK-DAILY-LANGUAGE-584');

-- ---------------------------------------------------------------------------
-- D · QYRIS · all five fields present on every check
-- ---------------------------------------------------------------------------
-- A check with a blank field is not a check. This names which field is blank
-- rather than reporting a count.

select
  'D · QYRIS FIELDS' as check,
  q.work_code,
  q.inspection_state,
  case when coalesce(q.source_text,'')        = '' then 'MISSING' else 'ok' end as question,
  case when coalesce(q.plain_meaning,'')      = '' then 'MISSING' else 'ok' end as yield,
  case when coalesce(q.why_it_matters,'')     = '' then 'MISSING' else 'ok' end as reason,
  case when coalesce(q.known,'')              = '' then 'MISSING' else 'ok' end as inspect_known,
  case when coalesce(q.unknown,'')            = '' then 'MISSING' else 'ok' end as inspect_unknown,
  case when coalesce(q.next_step,'')          = '' then 'MISSING' else 'ok' end as inspect_next,
  case when coalesce(q.safeguard_findings,'') = '' then 'MISSING' else 'ok' end as safeguard
from thylora_qyris_work_item_checks q
where q.work_code in (
  'THY-WORK-TOMORROW-FLOOR-584',
  'THY-WORK-STORE-UTILITY-ARTIFACT-583',
  'THY-WORK-WORLD-SERIES-584',
  'THY-WORK-DAILY-LANGUAGE-584')
order by q.work_code;

-- E · No packet work item may be ACTIVE without a check. This is the same rule
--     the control surface enforces, applied to this packet's own rows first.

select
  'E · NO ACTIVE WITHOUT CHECK' as check,
  w.work_code,
  w.state,
  case when exists (
    select 1 from thylora_qyris_work_item_checks q where q.work_code = w.work_code)
    then 'PASS — check on record'
    else 'FAIL — active state with no QYRIS check. This is the exact condition the gate exists to catch.'
  end as verdict
from thylora_execution_work_registry w
where w.work_code in (
  'THY-WORK-TOMORROW-FLOOR-584',
  'THY-WORK-STORE-UTILITY-ARTIFACT-583',
  'THY-WORK-WORLD-SERIES-584',
  'THY-WORK-DAILY-LANGUAGE-584')
order by w.work_code;

-- ---------------------------------------------------------------------------
-- F · NO LANE LOST. The count must not have fallen.
-- ---------------------------------------------------------------------------
-- 17 lanes were attested at head 522: sixteen from the Chairman's list plus
-- CONTINUITY_WATCHDOG. A lower number means a lane disappeared.

select
  'F · LANE COUNT' as check,
  count(*) as lanes_now,
  17 as lanes_at_head_522,
  case
    when count(*) >= 17 then 'PASS — no lane lost'
    else 'FAIL — ' || (17 - count(*))::text || ' lane(s) missing since head 522'
  end as verdict
from thylora_control_lane_registry;

select
  'F · LANE BINDINGS' as check,
  r.lane_code,
  case when 'THY-WORK-WORLD-SERIES-584' = any(r.work_code_match)
         or 'THY-WORK-STORE-UTILITY-ARTIFACT-583' = any(r.work_code_match)
         or 'THY-WORK-TOMORROW-FLOOR-584' = any(r.work_code_match)
       then 'BOUND' else 'not bound' end as packet_binding,
  array_length(r.work_code_match, 1) as work_codes_on_lane
from thylora_control_lane_registry r
where r.lane_code in ('WORLD_BUILDINGS','STORE','DASHBOARD')
order by r.lane_order;

-- G · The language work item is expected to be UNBOUND. This is a designed,
--     visible gap, not a defect. It is reported so it stays visible.

select
  'G · LANGUAGE LANE' as check,
  case when exists (
    select 1 from thylora_control_lane_registry
    where 'THY-WORK-DAILY-LANGUAGE-584' = any(work_code_match))
    then 'A lane now covers language — record which, and by whose decision.'
    else 'EXPECTED — no lane covers language. The packet deliberately did not create one. Chairman decision D5.'
  end as verdict;

-- ---------------------------------------------------------------------------
-- H · RESTART POINT
-- ---------------------------------------------------------------------------

select
  'H · RESTART POINT' as check,
  c.query_id,
  c.sequence_no,
  c.supersession_state,
  c.authority,
  case when c.authority = 'EXECUTION_SESSION_NOT_AUTHORITY'
       then 'PASS — written as an execution record, not an authority'
       else 'REVIEW — authority field is not what the packet wrote' end as verdict,
  left(c.restart_point, 120) || '…' as restart_point_head
from thylora_query_carryforward c
where c.query_id = 'THY-Q-20260922-TOMORROW-PACKET-584';

-- ---------------------------------------------------------------------------
-- I · WHAT IS STILL HELD. Read this last and act on it first.
-- ---------------------------------------------------------------------------

select 'I · HELD' as check, blocker, route from (values
  ('Sequences 523-584 and any newer deltas were never read by the packet.',
   'Compare check A above against the packet and correct the packet, not the backend.'),
  ('QYRIS QUICKCHECK release.',
   'Chairman decision D2. Until then the product is complete and unbuyable.'),
  ('QYRIS QUICKCHECK delivery round trip.',
   'Exercise mint → redeem → stream once from a device with egress.'),
  ('World window 3: Earth or EdereAriah.',
   'Chairman decision D3. No default was taken in either direction.'),
  ('ERC is undefined in all reachable source.',
   'Read the ERC record, or Chairman defines it. Window 2 can be produced castle-only meanwhile.'),
  ('The approved EdereAriah lexicon was not recovered.',
   'Read it from the backend. Lesson 002 cannot be written without it.'),
  ('World spelling: EdereAriah (14 source occurrences) vs EdereAirah (instruction).',
   'Chairman decision D4.'),
  ('No lane covers language.',
   'Chairman decision D5.')
) as t(blocker, route);

\echo '=============================================================='
\echo 'READBACK COMPLETE. A check reported NOT_PRESENT is not a pass.'
\echo '=============================================================='
