-- OMNIVIEW · 0008 · Live apply record and live topic authority (sequence 591)
-- Work: THY-WORK-OMNIVIEW-LIVE-APPLY-591
--
-- Runs ONLY on thylora-dash, after 0001-0007 are applied and read back. It is
-- kept out of db/omniview/0*.sql so the local proof suite (which appends its own
-- fixture sequences 589+) still runs against a clean 587 floor.
--
-- Every fact below was read from the backend of record on 2026-09-23 between
-- 16:30Z and 17:30Z and is cited by table and key. Counts are what the registry
-- held at that read; the topic proofs re-read the registries and compare.
--
-- WHY 591: carryforward 591 (THY-Q-20260923-KITCHEN-CAUSE-LIVE-OMNIVIEW-591)
-- directs "Claude branch migration must be reviewed, applied live, and UI
-- witnessed". This row records the execution of that directive. Carryforward
-- 588, 589, 590 and 592 are not ledger rows and stay readable as context
-- through thy_sequence_prior_context. 592 was written while this work ran; it
-- adds no instruction for this work beyond "do not claim deployed", which this
-- record honours: it claims LIVE APPLIED, not LIVE UI WITNESSED.

begin;

-- 1. THE SEQUENCE --------------------------------------------------------------
select thy_sequence_append(
  591,
  (now() at time zone 'America/New_York')::timestamp, 'America/New_York',
  'Carryforward 591 directed that the reviewed OMNIVIEW branch be applied to the live backend and witnessed (THY-WORK-OMNIVIEW-LIVE-APPLY-591).',
  'The OMNIVIEW pack (thy_sequence_* and thy_omniview_*: 8 tables, read model, write path, Chairman-only RLS) is applied to thylora-dash. '
  || 'Live topic authority was read from the backend of record and linked for TIME RUN, CASTLE (ROYAL CASTLE), ALISTAIR CROWE, STORE, SPORTS and QYRIS.',
  'Before apply, three conflicts between the reviewed pack and the live backend were corrected: reads were open to any signed-in account '
  || '(now thylora_is_chairman(), the rule carryforward already uses); the carryforward context reader was SECURITY DEFINER and would have bypassed '
  || 'carryforward RLS (now SECURITY INVOKER); and the seed wrote ledger 588 for a change that carryforward 588 assigns to different work (now 587).',
  'No existing THYLORA table, policy, function or row was altered or removed. The only writes outside thy_* objects are one QYRIS work-item check '
  || '(pre-execution) and additive graph nodes, edges and versions. Deployment authority for the dashboard stays with '
  || 'vyc2st-ctrl/thylora-executive-dashboard; CONTEXT and SEQUENCE are LIVE APPLIED on the backend, NOT LIVE UI WITNESSED.',
  'Chairman', 'BACKEND_VERIFIED',
  'Will the Chairman sign in on the phone and open CONTEXT and SEQUENCE on the current head, so LIVE APPLIED can become LIVE UI WITNESSED?',
  'OMNIVIEW is live on thylora-dash at ledger 591. Next: Chairman mobile witness of CONTEXT and SEQUENCE; merge the surface into '
  || 'vyc2st-ctrl/thylora-executive-dashboard; answer the open next-better questions (Royal Castle name, Alistair household, Time Run final name).',
  '[{"topic_key":"OMNIVIEW","effect":"WORK_CHANGED"},{"topic_key":"DASHBOARD","effect":"GATE_CHANGED"},
    {"topic_key":"TIME RUN","effect":"CANON_CHANGED"},{"topic_key":"CASTLE","effect":"CANON_CHANGED"},
    {"topic_key":"STORE","effect":"CANON_CHANGED"},{"topic_key":"QYRIS","effect":"CANON_CHANGED"}]'::jsonb,
  null,
  'THY-Q-20260923-KITCHEN-CAUSE-LIVE-OMNIVIEW-591');

-- 2. TOPICS THE CHAIRMAN NAMED THAT THE SEED DID NOT CARRY ---------------------
select thy_omniview_register_topic('ALISTAIR CROWE','ALISTAIR CROWE','PERSON','CHAIRMAN','Chairman',
  'Named by the Chairman. No person registry row exists; see the constraint before naming anyone or anything around this name.','UNSEEDED');
select thy_omniview_register_topic('SPORTS','SPORTS','PROGRAM','BACKEND_OF_RECORD',
  'sports_authority_registry ER-SA-001 (governing authority: Chairman / MAH-001)',
  'ER Sports Authority and its team, competition, network and readiness registries on thylora-dash.','PARTIAL');

update thy_omniview_topics set aliases = array['ALISTAIR','CROWE','ALISTAIR HOUSEHOLD','ALISTAIR FAMILY'], updated_at = now()
 where topic_key = 'ALISTAIR CROWE';
update thy_omniview_topics set aliases = array['SPORT','ER SPORTS AUTHORITY','ER-SA-001','SPORTS AUTHORITY'], updated_at = now()
 where topic_key = 'SPORTS';
update thy_omniview_topics set aliases = array['THE CASTLE','ROYAL CASTLE','THE ROYAL CASTLE','ER-CASTLE-ROYAL-001'],
       summary = 'The Royal Castle in EdereAirah (graph node ER-CASTLE-ROYAL-001). Canonical name OPEN: do not guess.',
       authority_holder = 'Chairman (thylora_graph_nodes ER-CASTLE-ROYAL-001)', updated_at = now()
 where topic_key = 'CASTLE';
update thy_omniview_topics set summary = 'QYRIS = Question → Yield → Reason → Inspect → Safeguard. Governed by LAW-QYRIS-ALL-WORK-001 and the plain-speech layer THY-QYRIS-PLAIN-SPEECH-001.',
       authority_holder = 'Chairman (thylora_graph_nodes LAW-QYRIS-ALL-WORK-001)', updated_at = now()
 where topic_key = 'QYRIS';
update thy_omniview_topics set authority_holder = 'Chairman directive held in thylora_time_run_registry THY-TIME-RUN-001', updated_at = now()
 where topic_key = 'TIME RUN';
update thy_omniview_topics set authority_holder = 'thylora_store_product_readiness + LAW-STORE-DRAW-VALUE-001 on thylora-dash', updated_at = now()
 where topic_key = 'STORE';

-- 3. TIME RUN ------------------------------------------------------------------
select thy_omniview_state_canon('TIME RUN',
  'THY-TIME-RUN-001 "THYLORA Time Run / era travel competition" is the Time Run of record: truth_class CHAIRMAN_DIRECTIVE, state IMPLEMENTATION_ACTIVE, version 4 (updated 2026-09-21T21:07Z). '
  || 'It is a whole programme with award catalog, events and host-rule registries; the member-app surface is one visible part of it.',
  'BACKEND_VERIFIED','Chairman',591,null,'CANON','thylora_time_run_registry:THY-TIME-RUN-001');
select thy_omniview_state_canon('TIME RUN',
  'Fourteen items are unresolved on THY-TIME-RUN-001, first among them the canonical final name, the exact era/year sequence, and trust legal identity and payout mechanics. '
  || 'Until they are settled none of them may be stated as canon.',
  'BACKEND_VERIFIED','Chairman',591,null,'CONSTRAINT','thylora_time_run_registry:THY-TIME-RUN-001.unresolved');
select thy_omniview_link('TIME RUN','SYSTEM','THY-TIME-RUN-001','THY-TIME-RUN-001 Time Run registry','Authority record',
  'ACTIVE','thylora_time_run_registry','THY-TIME-RUN-001',591);
select thy_omniview_link('TIME RUN','SYSTEM','thylora_time_run_award_catalog','Time Run award catalog','Programme registry',
  'ACTIVE','thylora_time_run_award_catalog',null,591);
select thy_omniview_link('TIME RUN','SYSTEM','thylora_time_run_events','Time Run events','Programme registry',
  'ACTIVE','thylora_time_run_events',null,591);
select thy_omniview_link('TIME RUN','SYSTEM','thylora_time_run_host_rules','Time Run host rules','Programme registry',
  'ACTIVE','thylora_time_run_host_rules',null,591);
select thy_omniview_answer(id, 591) from thy_omniview_questions
 where topic_key = 'TIME RUN' and state = 'OPEN' and question like 'Is the app Time Run surface the whole of TIME RUN%';
select thy_omniview_ask('TIME RUN','What is the canonical final name of THY-TIME-RUN-001?',
  'It is the first unresolved item on the registry of record; every public use of the name waits on it.', true, 591);

-- 4. CASTLE / ROYAL CASTLE -------------------------------------------------------
select thy_omniview_state_canon('CASTLE',
  'The Royal Castle is an EdereAirah place held as graph node ER-CASTLE-ROYAL-001, authority Chairman, truth_class OPEN_PENDING_CHAIRMAN_NAME_RECOVERY. '
  || 'Its canonical name, city and territory are OPEN. Time region: 1700s. Earth mirror: Windsor Castle, England, for layout and function only; names, people, dates and events do not transfer.',
  'BACKEND_VERIFIED','Chairman',591,null,'CANON','thylora_graph_nodes:ER-CASTLE-ROYAL-001');
select thy_omniview_state_canon('CASTLE',
  'Do not guess the Royal Castle name. No public interior images or maps by default (THY-FAMILY-VESSEL-CASTLE-PRIVACY-001).',
  'BACKEND_VERIFIED','Chairman',591,null,'CONSTRAINT','thylora_graph_nodes:ER-CASTLE-ROYAL-001.properties');
select thy_omniview_state_canon('CASTLE',
  'The Royal Kitchen (THY-CASTLE-ROYAL-KITCHEN-001) is STRUCTURE_DEFINED. At 591 the backend held 8 kitchen posts, 8 royal collection accessions, '
  || '13 castle economy accounts, 2 castle space geometry rows and 0 castle object state rows; every Royal Kitchen maker is OPEN (FIND-KITCHEN-OBJECT-MAKERS-ALL-OPEN-571).',
  'BACKEND_VERIFIED','Chairman',591,null,'EVIDENCE','thylora_graph_nodes:THY-CASTLE-ROYAL-KITCHEN-001');
select thy_omniview_link('CASTLE','PLACE','ER-CASTLE-ROYAL-001','Royal Castle (name OPEN)','The place itself',
  'ACTIVE','thylora_graph_nodes','ER-CASTLE-ROYAL-001',591);
select thy_omniview_link('CASTLE','PLACE','THY-CASTLE-ROYAL-KITCHEN-001','Royal Kitchen','Part of the Royal Castle',
  'ACTIVE','thylora_graph_nodes','THY-CASTLE-ROYAL-KITCHEN-001',591);
select thy_omniview_link('CASTLE','OBJECT','thylora_royal_collection_registry','Royal collection','Accessioned objects',
  'ACTIVE','thylora_royal_collection_registry',null,591);
select thy_omniview_link('CASTLE','MONEY','thylora_castle_economy_accounts','Castle economy accounts','Castle economy',
  'ACTIVE','thylora_castle_economy_accounts',null,591);
select thy_omniview_link('CASTLE','PERSON','HH-1700-COOK','Inés Morales, Royal Cook','Bound to HH-1700-COOK (LOCK-ER-ROYAL-COOK-001)',
  'ACTIVE','thylora_query_carryforward','534',591);
select thy_omniview_link('CASTLE','WORK','SCENE-WW-001-ROYAL-KITCHEN-20260922','World Window 001, Royal Kitchen',
  'Preview-ready; not generated or published. Chairman field-by-field review pending (carryforward 589, 592)',
  'BLOCKED','thylora_query_carryforward','589',591);
select thy_omniview_set_gate('GATE-CANON-SOURCE','CASTLE',
  'CASTLE canon is stated by the Chairman before any answer treats it as settled.',
  'PASSED','Chairman',null,'thylora_graph_nodes:ER-CASTLE-ROYAL-001',591);
select thy_omniview_set_gate('GATE-CASTLE-NAME','CASTLE',
  'The Royal Castle canonical name is recovered or chosen by the Chairman before it is used anywhere.',
  'BLOCKED','Chairman','name_state OPEN on ER-CASTLE-ROYAL-001 (OPEN_PENDING_CHAIRMAN_NAME_RECOVERY)',
  'thylora_graph_nodes:ER-CASTLE-ROYAL-001',591);
select thy_omniview_answer(id, 591) from thy_omniview_questions
 where topic_key = 'CASTLE' and state = 'OPEN' and question like 'What is CASTLE%';
select thy_omniview_ask('CASTLE','What is the canonical name of the Royal Castle (ER-CASTLE-ROYAL-001)?',
  'The backend holds the place, its kitchen and its economy, but its name is OPEN and marked do-not-guess.', true, 591);

-- 5. ALISTAIR CROWE --------------------------------------------------------------
select thy_omniview_state_canon('ALISTAIR CROWE',
  'At 591 no person registry, name canon, graph node or graph edge on thylora-dash names Alistair or Crowe. '
  || 'The name appears only in carryforward 531 (castle living detail), 588 and 589.',
  'BACKEND_VERIFIED','Chairman',591,null,'EVIDENCE','thylora_person_name_canon, thylora_graph_nodes, thylora_graph_edges, thylora_query_carryforward');
select thy_omniview_state_canon('ALISTAIR CROWE',
  'Alistair household canon is not fabricated. Carryforward 531 proves a family/home reference existed; exact surname, role, family and address are not in any person registry. '
  || 'Crowe is a Chairman recovery clue only until sourced. Until the Chairman says whether the Alistair family is a household in canon or only an archive lead, '
  || 'no town, street, spouse, child or animal may be named in any public report.',
  'CHAIRMAN_ASSERTED','Chairman',591,null,'CONSTRAINT','thylora_query_carryforward:588,589');
select thy_omniview_set_gate('GATE-ALISTAIR-SOURCE','ALISTAIR CROWE',
  'The Chairman states whether the Alistair family is a household in canon or an archive lead, and the source of the Crowe name, before any detail is written.',
  'OPEN','Chairman','Chairman decision (b) at carryforward 589 is unanswered.','thylora_query_carryforward:589',591);
select thy_omniview_ask('ALISTAIR CROWE',
  'Is the Alistair family a household in canon or only an archive lead, and where does the name Crowe come from?',
  'It is Chairman decision (b) at 589. Until it is answered, every Alistair answer is either the open question or invention.', true, 591);
-- The two statements above are evidence and constraint, not canon: keep the topic UNSEEDED.
select thy_omniview_register_topic('ALISTAIR CROWE','ALISTAIR CROWE','PERSON','CHAIRMAN','Chairman',null,'UNSEEDED');

-- 6. STORE ------------------------------------------------------------------------
select thy_omniview_state_canon('STORE',
  'Exactly one product is ACTIVE with an active purchase path: "Twelve Miles for Flour — An Unkle Seezin Trail Story". Checkout path, delivery, re-access, rights and mobile preview '
  || 'are all verified on its readiness row, with no blockers. At 591 thylora_store_product_readiness held 17 products: 1 ACTIVE, 10 DRAFT, 1 BUILT_NOT_RELEASED, '
  || '1 DESIGN_PROPOSED, 1 DRAFT_PRODUCTION_ACTIVE, 2 CONCEPT_PRICED_NOT_BUILT, 1 CONCEPT_PRICE_NOT_AUTHORIZED_NOT_BUILT.',
  'BACKEND_VERIFIED','Chairman',591,null,'CANON','thylora_store_product_readiness');
select thy_omniview_state_canon('STORE',
  'Store Draw + Worth Gate (LAW-STORE-DRAW-VALUE-001, v1.1.0, IMPLEMENTED) governs shelving. Finding FIND-STORE-DRAW-GATE-CEILING-558: the Draw gate is mathematically unreachable '
  || 'for every current candidate. Finding FIND-STORE-DEMAND-BASELINE-556B: measured zero external demand at 2026-09-20. Do not treat an external customer as already acquired.',
  'BACKEND_VERIFIED','Chairman',591,null,'CONSTRAINT','thylora_graph_nodes:LAW-STORE-DRAW-VALUE-001');
select thy_omniview_link('STORE','PRODUCT','Twelve Miles for Flour','Twelve Miles for Flour — An Unkle Seezin Trail Story','The one ACTIVE product',
  'ACTIVE','thylora_store_product_readiness','active_allowed = true',591);
select thy_omniview_link('STORE','GATE','LAW-STORE-DRAW-VALUE-001','Store Draw + Worth Gate','Governs shelving',
  'ACTIVE','thylora_graph_nodes','LAW-STORE-DRAW-VALUE-001',591);
select thy_omniview_link('STORE','SYSTEM','thylora_store_product_readiness','Store product readiness','Product state of record',
  'ACTIVE','thylora_store_product_readiness',null,591);
select thy_omniview_answer(id, 591) from thy_omniview_questions
 where topic_key = 'STORE' and state = 'OPEN' and question like 'Which products are RELEASED%';
select thy_omniview_ask('STORE','What is the first shirt sample artwork, now that Printful is reported CONNECTED (carryforward 591)?',
  'Carryforward 591 moves the physical-goods lane to the first shirt sample; 589 decision (d), which mark goes on the shirt, is still open.', true, 591);

-- 7. SPORTS -----------------------------------------------------------------------
select thy_omniview_state_canon('SPORTS',
  'ER Sports Authority (ER-SA-001) is the sports authority of record: status IMPLEMENTATION_ACTIVE, governing authority Chairman / MAH-001. '
  || 'At 591 the backend held 33 teams, 2 competitions, 1 network and 6 readiness gates under it.',
  'BACKEND_VERIFIED','Chairman',591,null,'CANON','sports_authority_registry:ER-SA-001');
select thy_omniview_state_canon('SPORTS',
  'Unresolved on ER-SA-001: the exact four commissioner identities, the final commissioner portfolio boundaries, and the Earth legal structure if any Earth entity is formed. '
  || 'Team naming is not restarted and the thirty empty ERFL slots are not filled without the Chairman (carryforward 589).',
  'BACKEND_VERIFIED','Chairman',591,null,'CONSTRAINT','sports_authority_registry:ER-SA-001.unresolved');
select thy_omniview_link('SPORTS','SYSTEM','ER-SA-001','ER Sports Authority','Authority record',
  'ACTIVE','sports_authority_registry','ER-SA-001',591);
select thy_omniview_link('SPORTS','SYSTEM','sports_team_registry','Sports team registry','33 teams at 591','ACTIVE','sports_team_registry',null,591);
select thy_omniview_link('SPORTS','SYSTEM','sports_competition_registry','Sports competition registry','2 competitions at 591','ACTIVE','sports_competition_registry',null,591);
select thy_omniview_link('SPORTS','GATE','sports_readiness_gate','Sports readiness gates','6 gates at 591','ACTIVE','sports_readiness_gate',null,591);
select thy_omniview_link('SPORTS','WORK','ELEVEN-LAYER-SPORTS-MAP','Eleven-layer sports map against ER-SA-001','Agent-side work named at 589',
  'ACTIVE','thylora_query_carryforward','589',591);
select thy_omniview_link('SPORTS','TOPIC','FOOTBALL','FOOTBALL','Whether FOOTBALL is a sport under ER-SA-001 is not established',
  'BLOCKED',null,null,591);
select thy_omniview_ask('SPORTS','Is ERFL-001 or GGL-001 canonical, and how does the other relate if both survive?',
  'It is Chairman decision (c) at 589 and the first sports canon question still open.', true, 591);

-- 8. QYRIS ------------------------------------------------------------------------
select thy_omniview_state_canon('QYRIS',
  'QYRIS = Question → Yield → Reason → Inspect → Safeguard (THY-QYRIS-PLAIN-SPEECH-001, ACTIVE). Governed by the QYRIS All-Work Gate LAW-QYRIS-ALL-WORK-001 (IMPLEMENTED, Chairman): '
  || 'a PASS is required before execution, the execution registry is required, it is visible in every major reply, and UNKNOWN is preserved.',
  'BACKEND_VERIFIED','Chairman',591,null,'CANON','thylora_graph_nodes:LAW-QYRIS-ALL-WORK-001; thylora_qyris_translation_layer:THY-QYRIS-PLAIN-SPEECH-001');
select thy_omniview_state_canon('QYRIS',
  'At 591 the execution registry thylora_qyris_work_item_checks held 159 checks, including the PASS recorded for THY-WORK-OMNIVIEW-LIVE-APPLY-591 before this apply. '
  || 'The recursive QYRIS tables from 584 (thylora_qyris_node, thylora_qyris_cluster) hold 0 rows.',
  'BACKEND_VERIFIED','Chairman',591,null,'EVIDENCE','thylora_qyris_work_item_checks');
select thy_omniview_link('QYRIS','GATE','LAW-QYRIS-ALL-WORK-001','QYRIS All-Work Gate','Governing law',
  'ACTIVE','thylora_graph_nodes','LAW-QYRIS-ALL-WORK-001',591);
select thy_omniview_link('QYRIS','SYSTEM','THY-QYRIS-PLAIN-SPEECH-001','QYRIS plain-speech layer','Equation and output contract',
  'ACTIVE','thylora_qyris_translation_layer','THY-QYRIS-PLAIN-SPEECH-001',591);
select thy_omniview_link('QYRIS','SYSTEM','thylora_qyris_work_item_checks','QYRIS execution registry','Pre-execution checks',
  'ACTIVE','thylora_qyris_work_item_checks',null,591);
select thy_omniview_link('QYRIS','WORK','THY-WORK-OMNIVIEW-LIVE-APPLY-591','OMNIVIEW live apply','QYRIS PASS recorded before execution',
  'ACTIVE','thylora_qyris_work_item_checks','THY-WORK-OMNIVIEW-LIVE-APPLY-591',591);
select thy_omniview_ask('QYRIS','Should the empty recursive QYRIS tables from 584 (thylora_qyris_node, thylora_qyris_cluster) be populated, or are the work-item checks the whole registry?',
  'The law requires an execution registry. Two of its tables are empty, and nothing on the backend says whether that is by design.', true, 591);

-- 9. OMNIVIEW / DASHBOARD -----------------------------------------------------------
select thy_omniview_state_canon('OMNIVIEW',
  'LOCAL DATE/TIME on ledger rows uses America/New_York, the earth_anchor_timezone held by thylora_timestamp_punch_gate on the backend of record.',
  'BACKEND_VERIFIED','Chairman',591,null,'DECISION','thylora_timestamp_punch_gate.earth_anchor_timezone');
select thy_omniview_answer(id, 591) from thy_omniview_questions
 where topic_key = 'OMNIVIEW' and state = 'OPEN' and question like 'What is the Chairman local timezone%';
select thy_omniview_ask('OMNIVIEW','Which UNSEEDED topic does the Chairman want seeded first: INÉS, VERONICA, FOOTBALL, VEHICLES or ALISTAIR CROWE?',
  'CASTLE moved from UNSEEDED to PARTIAL at 591 because the backend already holds it. The remaining UNSEEDED topics need a Chairman source.', true, 591);
select thy_omniview_set_gate('GATE-OMNIVIEW-APPLIED','OMNIVIEW',
  'The OMNIVIEW pack is applied to thylora-dash and thy_omniview_manifest() returns from the live backend.',
  'PASSED','Chairman',null,'db/omniview/live/EVIDENCE-591.md',591);
select thy_omniview_set_gate('GATE-OMNIVIEW-WITNESSED','DASHBOARD',
  'CONTEXT and SEQUENCE are witnessed working on thylora-public-world after merge into vyc2st-ctrl/thylora-executive-dashboard.',
  'BLOCKED','Chairman',
  'LIVE APPLIED is not LIVE UI WITNESSED. Needs: merge into vyc2st-ctrl/thylora-executive-dashboard, deploy on thylora-public-world, and a Chairman sign-in on the phone.',
  'DASHBOARD_AUTHORITY.md',591);
select thy_omniview_link('OMNIVIEW','WORK','THY-WORK-OMNIVIEW-LIVE-APPLY-591','OMNIVIEW live apply','Applied the pack to thylora-dash',
  'ACTIVE',null,'db/omniview/live/',591);

-- 10. RESTART POINT ----------------------------------------------------------------
select thy_omniview_restart(
  'OMNIVIEW is LIVE APPLIED on thylora-dash at ledger 591 and NOT LIVE UI WITNESSED. Chairman-only reads. '
  || 'Next: Chairman phone sign-in to CONTEXT and SEQUENCE; merge the surface into vyc2st-ctrl/thylora-executive-dashboard and restore the seven baseline capabilities there before promotion; '
  || 'answer the Royal Castle name, the Alistair household, the Time Run final name and ERFL-001 vs GGL-001.',
  'Sequence 591 applied the OMNIVIEW pack live and linked live topic authority.',
  'Chairman', 591);

commit;
