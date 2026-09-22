-- THYLORA · TOMORROW'S STARTING PACKET · BACKEND WRITE
-- Work codes: THY-WORK-TOMORROW-FLOOR-584
--             THY-WORK-STORE-UTILITY-ARTIFACT-583
--             THY-WORK-WORLD-SERIES-584
--             THY-WORK-DAILY-LANGUAGE-584
-- Backend of record: thylora-dash (jvsdxhrfhtlgaknhjxlz)
--
-- STATE: WRITTEN · NOT APPLIED.
--
-- EVIDENCE GAP, stated before anything else:
-- This session could NOT read the backend. jvsdxhrfhtlgaknhjxlz.supabase.co:443
-- answered 403 to CONNECT at the egress proxy on 2026-09-22T04:07:20Z. The
-- instruction to read through sequence 584 could therefore NOT be carried out.
-- The highest sequence attested in any reachable source is 522
-- (thylora-executive-dashboard@a634249 docs/CONTROL_SURFACE.md, "At head 522").
-- Sequences 523-584 and all newer deltas were NOT read.
--
-- CONSEQUENCE, held honestly rather than papered over: this file does not
-- pretend to know the live shape. Every statement is guarded by to_regclass and
-- by column checks, following the house pattern in db/rae-link/0010_registry_link.sql.
-- If a target table is absent or shaped differently, the statement NO-OPS with a
-- notice. It never fails the run and never invents a competing table.
--
-- WHAT THIS FILE DOES NOT CREATE: no second work registry, no second QYRIS store,
-- no second product truth, no second approval system, no second lane registry.
-- Every write below goes into a system of record that already exists.
--
-- ORDER OF WORK IF sequences 523-584 CONTRADICT ANYTHING HERE: the backend wins.
-- Per the standing rule, CURRENT BACKEND OUTRANKS HISTORICAL PROMPTS — and this
-- file is, from the backend's point of view, a historical prompt. Run
-- 0002_readback.sql first; it reads the head and reports the contradiction
-- before this file writes anything.

begin;

-- ---------------------------------------------------------------------------
-- 0 · REFUSE TO WRITE BLIND
-- ---------------------------------------------------------------------------
-- The one thing worse than not writing is writing over a head this session
-- never saw. This block records the sequence the applying session is actually
-- at, so the gap between 522 (last read) and the live head is on the record.

do $$
declare live_head bigint;
begin
  if to_regclass('public.thylora_query_carryforward') is not null then
    execute 'select max(sequence_no) from thylora_query_carryforward' into live_head;
    raise notice 'TOMORROW-584: live head sequence = %. Last sequence readable from the authoring session = 522. Unread gap = % sequences.',
      live_head, greatest(coalesce(live_head, 0) - 522, 0);
    if coalesce(live_head, 0) > 584 then
      raise notice 'TOMORROW-584: live head is BEYOND 584. Newer deltas exist that this packet did not read. Reconcile before trusting any row written below.';
    end if;
  else
    raise notice 'TOMORROW-584: thylora_query_carryforward not present; head not readable.';
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 1 · WORK REGISTRY — four work items
-- ---------------------------------------------------------------------------

do $$
begin
  if to_regclass('public.thylora_execution_work_registry') is null then
    raise notice 'TOMORROW-584: thylora_execution_work_registry not present; work rows skipped';
    return;
  end if;

  execute $q$
    insert into thylora_execution_work_registry
      (work_code, work_item, state, phase, who, owner_role, where_system, acceptance_test, dependency)
    values
      ('THY-WORK-TOMORROW-FLOOR-584',
       'Tomorrow''s starting packet: hold every active lane at or above tonight''s floor and hand the next session a packet it can start from cold.',
       'IMPLEMENTATION_ACTIVE', 'DASHBOARD_COMPLETION', '', 'EXECUTION',
       'vyc2st-ctrl/Thylora branch claude/tomorrows-starting-packet-krgmpj',
       'npm test passes at 111 or higher, and no lane reports a state lower than it held on 2026-09-21.',
       'Backend read blocked: 403 on CONNECT, 2026-09-22T04:07:20Z. Sequences 523-584 unread.'),

      ('THY-WORK-STORE-UTILITY-ARTIFACT-583',
       'QYRIS QUICKCHECK: complete artifact, bounded preview, delivery binding, mobile, perpetual re-access, price packet — everything short of release.',
       'IMPLEMENTATION_ACTIVE', 'STORE', '', 'COMMERCE',
       'vyc2st-ctrl/Thylora store-quickcheck/',
       'Artifact hash matches the file on disk; preview is bound by that hash and leaks no other field; no purchase control and no live-commerce claim exists on either surface.',
       'Chairman release not given. Delivery round trip untestable while egress is denied.'),

      ('THY-WORK-WORLD-SERIES-584',
       'World series: three world windows prepared and gated on WW = C x P x I x T x B x X. Prepared, not generated.',
       'IMPLEMENTATION_ACTIVE', 'CONTENT_PREPRODUCTION', '', 'MEDIA',
       'vyc2st-ctrl/Thylora world-window/',
       'All three windows carry a complete five-field QYRIS check and examine all six factors; every non-PASS criterion names a route; zero windows report cleared while release authority is held.',
       'Two windows held on a backend read, one held on a Chairman classification. No image generated.'),

      ('THY-WORK-DAILY-LANGUAGE-584',
       'EdereAriah language: recover the approved lexicon and prepare Lesson 001. No fabricated words.',
       'IMPLEMENTATION_ACTIVE', 'CONTENT_SYSTEM', '', 'EDUCATION_AND_UNDERSTANDING',
       'vyc2st-ctrl/Thylora language/',
       'Every lexicon entry names a file and line; zero entries lack an attestation; Lesson 001 teaches only tokens present in the corpus.',
       'APPROVED LEXICON NOT RECOVERED. Not in either reachable repository nor in any of 51 commits. Backend unreadable.')
    on conflict (work_code) do update set
      work_item = excluded.work_item,
      state = excluded.state,
      phase = excluded.phase,
      where_system = excluded.where_system,
      acceptance_test = excluded.acceptance_test,
      dependency = excluded.dependency
  $q$;
  raise notice 'TOMORROW-584: four work items written';
exception when others then
  raise notice 'TOMORROW-584: work registry shape differs from expectation (%); rows skipped rather than forced', sqlerrm;
end $$;

-- ---------------------------------------------------------------------------
-- 2 · QYRIS — one complete five-field check per work item
-- ---------------------------------------------------------------------------
-- These four work items are THIS session's own work, so authoring their QYRIS
-- checks is the work owner doing it, not a surface passing its own gate.
-- Every inspection_state below is HOLD or PASS according to what was actually
-- evidenced. None is marked PASS to make a board look green.

do $$
begin
  if to_regclass('public.thylora_qyris_work_item_checks') is null then
    raise notice 'TOMORROW-584: thylora_qyris_work_item_checks not present; QYRIS rows skipped';
    return;
  end if;

  execute $q$
    insert into thylora_qyris_work_item_checks
      (work_code, layer_code, source_text, plain_meaning, why_it_matters,
       known, unknown, next_step, inspection_state, safeguard_findings,
       chairman_approval_required)
    values
      ('THY-WORK-TOMORROW-FLOOR-584', 'EXECUTION',
       'Build tomorrow''s starting packet, and do not let any active lane fall below tonight''s floor.',
       'Hand the next session a packet complete enough to start from cold, without anything already standing being quietly given up to do it.',
       'A packet that raises one lane by dropping another is a loss disguised as progress. The floor rule exists because that trade is easy to make and hard to see afterwards.',
       'Test floor rose from 48 to 111 passing, all green. No file outside the additive set was touched: dashboard-current-head.html, dashboard-baseline.json, DASHBOARD_AUTHORITY.md, .github/**, app/**, public-site/**, rae-link/**, time-run.html and vercel.json are all unchanged. The 48 pre-existing tests still pass unmodified.',
       'The live state of every lane between sequences 523 and 584. Whether a lane moved in those 62 sequences is unknown, so "no lane fell" is proven for what this session can see and asserted for nothing else.',
       'Run 0002_readback.sql against the live backend, compare every lane state to this packet, and correct the packet where the backend disagrees.',
       'HOLD',
       'The packet refuses to report a lane state it could not read. Every unread lane is named as unread rather than carried forward from a stale record, so a later session inherits a gap it can see instead of a claim it would trust.',
       true),

      ('THY-WORK-STORE-UTILITY-ARTIFACT-583', 'COMMERCE',
       'Get QYRIS QUICKCHECK as close to live as legally and technically possible without bypassing Chairman release.',
       'Finish every step that does not need release authority, then stop at the one that does and say so.',
       'This is exactly where a build talks itself into shipping. "As close to live as possible" can be read as "live", and the distance between them is a real purchase by a real person for a product nobody approved.',
       'The artifact is complete and self-contained: 13,291 bytes, sha256 0b86158e6ad1bd2562a13af9960a93f19a4204e9bf569fba82eae70831d7c925, no script, no external resource, no network call. The preview is bound to that hash and reproduces one field of five. Delivery reuses the existing token mint and redeem rather than inventing a second path. Purchase entitlement is perpetual by constraint. 10 of 12 readiness rungs are DONE and evidenced by test.',
       'Whether the mint to redeem to stream round trip actually returns these bytes on a device. It could not be exercised: egress denied.',
       'Chairman decision D2 — approve the price, approve the release, or return the artifact for change. Then exercise the delivery round trip once against a real device.',
       'HOLD',
       'No purchase control and no final price exists on any surface, so the product cannot be bought by accident. The preview states plainly that release has not been given. The artifact hash is asserted against the file on disk by test, so a silent swap of the product fails the suite instead of reaching a buyer.',
       true),

      ('THY-WORK-WORLD-SERIES-584', 'MEDIA',
       'Prepare three world windows. Each must pass QYRIS and WW = C x P x I x T x B x X.',
       'Take each window as far as preparation goes, score it honestly against the formula, and produce nothing.',
       'A window, once produced, becomes reference for every later window of the same place. An invented element that survives one window is inherited by all of them, and the correction cost rises with every reuse.',
       'All three windows carry a complete five-field check and examine all six factors. The castle anchor is verified by hash: 6f0fd858e7649e8079e6572d53b94306a2c202fc12fbcf860d15c93d907d689c, 8,144 bytes, attested in committed source as the Chairman-approved living-art castle environment. Zero images were generated.',
       'The canonical expansion of C, P, I, T, B and X at sequence 584. The glosses used here are session-bound, derived only from rules already attested in committed source, and each names the file that attests it. Also unknown: what ERC expands to, and whether the New York office is an Earth place or an EdereAriah one.',
       'Reconcile the six factor glosses against backend canon; answer Chairman decision D3 (Earth or EdereAriah for New York); read or define ERC.',
       'HOLD',
       'The gate is multiplicative, so no factor can be averaged up by the others and HELD scores exactly what FAIL scores. The New York window refuses to default its classification in either direction, because defaulting to world would invent a building and defaulting to Earth would assert a corporate holding THYLORA may not have.',
       true),

      ('THY-WORK-DAILY-LANGUAGE-584', 'EDUCATION_AND_UNDERSTANDING',
       'Recover the approved EdereAirah lexicon. Prepare Lesson 001. No fabricated words.',
       'Find the real word list. Teach from it. Invent nothing to fill a gap.',
       'A language is recoverable as long as its gaps are still visible. Fill the gaps with plausible words and it stops being recoverable, because nobody can afterwards tell which parts were lost.',
       'The approved lexicon was NOT found: not in vyc2st-ctrl/Thylora at HEAD, not in any of its 51 commits, not in vyc2st-ctrl/thylora-executive-dashboard at a634249. What was recovered is a 12-entry attested name corpus, every entry carried by file and line, zero fabricated. Also recovered: the world is spelled EdereAriah in all 14 source occurrences, not EdereAirah; the variant appears zero times.',
       'The approved lexicon itself — all common vocabulary, all grammar, all phonology. Zero entries of each exist in reachable source.',
       'Read the lexicon from the backend. Answer Chairman decision D4 on the spelling. Then Lesson 002 becomes writable.',
       'HOLD',
       'The corpus cannot admit a word without an attestation: admitEntry refuses it, and a test asserts the refusal. Lesson 001 teaches only tokens present in the corpus, marks every unsettled meaning UNKNOWN, and states in its own text that no word in it was invented.',
       true)
  $q$;
  raise notice 'TOMORROW-584: four QYRIS checks written, all HOLD';
exception when others then
  raise notice 'TOMORROW-584: QYRIS check shape differs from expectation (%); rows skipped rather than forced', sqlerrm;
end $$;

-- ---------------------------------------------------------------------------
-- 3 · LANE REGISTRY — no lane added, two lanes bound
-- ---------------------------------------------------------------------------
-- The sixteen lanes plus CONTINUITY_WATCHDOG already exist. This binds the new
-- work codes to the lanes that already cover them. It creates no lane.

do $$
begin
  if to_regclass('public.thylora_control_lane_registry') is null then
    raise notice 'TOMORROW-584: lane registry not present; lane binding skipped';
    return;
  end if;

  execute $q$
    update thylora_control_lane_registry
       set work_code_match = array(select distinct unnest(work_code_match || array['THY-WORK-WORLD-SERIES-584'])),
           updated_at = now()
     where lane_code = 'WORLD_BUILDINGS'
  $q$;

  execute $q$
    update thylora_control_lane_registry
       set work_code_match = array(select distinct unnest(work_code_match || array['THY-WORK-STORE-UTILITY-ARTIFACT-583'])),
           updated_at = now()
     where lane_code = 'STORE'
  $q$;

  execute $q$
    update thylora_control_lane_registry
       set work_code_match = array(select distinct unnest(work_code_match || array['THY-WORK-TOMORROW-FLOOR-584'])),
           updated_at = now()
     where lane_code = 'DASHBOARD'
  $q$;

  raise notice 'TOMORROW-584: three lanes bound, zero lanes created';
exception when others then
  raise notice 'TOMORROW-584: lane binding skipped (%)', sqlerrm;
end $$;

-- NOTE on THY-WORK-DAILY-LANGUAGE-584: no lane in the registry covers language.
-- A lane is NOT created here. Creating one would be this packet inventing a
-- structural decision that belongs to the Chairman. The work item is registered
-- and will render under TODAY; it will show as unbound in LIVING MAP until a
-- lane is designated. That is a visible gap, which is the point.

-- ---------------------------------------------------------------------------
-- 4 · RESTART POINT
-- ---------------------------------------------------------------------------
-- Written as an ordinary carryforward row, NOT as an authority designation.
-- Per docs/CONTINUITY-FLOOR.md the controlling floor moves only on a DESIGNATE
-- event in thylora_continuity_anchor_authority with valid evidence. This packet
-- does not write one and must not: a newer CURRENT row does not move the floor,
-- and treating recency as authority is the original defect that rule exists to
-- prevent.

do $$
begin
  if to_regclass('public.thylora_query_carryforward') is null then
    raise notice 'TOMORROW-584: carryforward table not present; restart point skipped';
    return;
  end if;

  execute $q$
    insert into thylora_query_carryforward
      (query_id, source_app, authority, supersession_state, restart_point)
    values
      ('THY-Q-20260922-TOMORROW-PACKET-584',
       'claude-code-remote',
       'EXECUTION_SESSION_NOT_AUTHORITY',
       'CURRENT',
       'Read the backend head first. Compare it to 522, the last sequence this packet could see. Then: (1) run db/tomorrow-584/0002_readback.sql and correct the packet where the backend disagrees; (2) settle Chairman decisions D1-D5 in workrooms/WR-TOMORROW-584.md; (3) with the lexicon in hand, write Lesson 002; (4) with the New York classification in hand, clear or withdraw window 3; (5) on release, exercise the QYRIS QUICKCHECK delivery round trip once end to end.')
  $q$;
  raise notice 'TOMORROW-584: restart point written as an ORDINARY carryforward row. The continuity floor was NOT moved.';
exception when others then
  raise notice 'TOMORROW-584: carryforward shape differs from expectation (%); restart point skipped', sqlerrm;
end $$;

commit;

-- ---------------------------------------------------------------------------
-- AFTER APPLYING: run 0002_readback.sql. An apply that is not read back is not
-- a write, it is a hope.
-- ---------------------------------------------------------------------------
