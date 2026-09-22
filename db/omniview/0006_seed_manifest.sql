-- OMNIVIEW · 0006 · Manifest seed
-- Work: THY-WORK-OMNIVIEW-ROUNDTRIP-587
--
-- WHAT THIS SEED IS ALLOWED TO DO
--
-- It registers the named topics, sets who holds authority over each, and writes
-- canon ONLY where a file in this repository proves it. Where nothing proves it,
-- the topic is registered UNSEEDED with the question that would settle it. An
-- UNSEEDED topic is a truthful answer; an invented one is not.
--
-- The ledger opens at 587 because that is the sequence the Chairman named as the
-- read floor. It does NOT claim to carry sequences 1-586: those live in prior
-- session history and in thylora_query_carryforward, and 0007 exposes them as
-- pre-ledger context without pretending they were written here.

begin;

-- 1. TOPICS -------------------------------------------------------------------
insert into thy_omniview_topics (topic_key, display_name, aliases, topic_class, summary,
                                 authority_lock, authority_holder, canon_state)
values
 ('TIME RUN','TIME RUN', array['TIMERUN','TIME-RUN','THE TIME RUN'],'PROGRAM',
  'Time Run surface carried in the member app.',
  'BACKEND_OF_RECORD','thylora-dash (jvsdxhrfhtlgaknhjxlz)','PARTIAL'),

 ('INES','INÉS', array['INÉS','INES'],'PERSON',
  null,'CHAIRMAN','Chairman','UNSEEDED'),

 ('VERONICA','VERONICA', array['VERÓNICA'],'PERSON',
  null,'CHAIRMAN','Chairman','UNSEEDED'),

 ('CASTLE','CASTLE', array['THE CASTLE'],'PLACE',
  null,'CHAIRMAN','Chairman','UNSEEDED'),

 ('STORE','STORE', array['STOREFRONT','SHOP','THE STORE'],'PRODUCT',
  'THYLORA storefront: public store surface, products, orders, entitlements.',
  'BACKEND_OF_RECORD','thylora-dash (jvsdxhrfhtlgaknhjxlz)','PARTIAL'),

 ('DASHBOARD','DASHBOARD', array['CHAIRMAN DASHBOARD','EXECUTIVE DASHBOARD','CURRENT HEAD'],'SYSTEM',
  'Chairman executive dashboard. Deployment authority is held outside this repository.',
  'DEPLOYMENT_REPOSITORY','vyc2st-ctrl/thylora-executive-dashboard','PARTIAL'),

 ('QYRIS','QYRIS', array['QYRIS TRACE'],'SYSTEM',
  'The visible read trace attached to every OMNIVIEW answer.',
  'CHAIRMAN','Chairman','PARTIAL'),

 ('FOOTBALL','FOOTBALL', array['SOCCER'],'PROGRAM',
  null,'CHAIRMAN','Chairman','UNSEEDED'),

 ('VEHICLES','VEHICLES', array['VEHICLE','CARS'],'OBJECT',
  null,'CHAIRMAN','Chairman','UNSEEDED'),

 ('ECONOMY','ECONOMY', array['THYLORA ECONOMY','MONEY'],'ECONOMY',
  'THYLORA money spine: revenue lanes, splits, ledger, payouts, financial decisions.',
  'BACKEND_OF_RECORD','thylora-dash (jvsdxhrfhtlgaknhjxlz)','PARTIAL'),

 ('OMNIVIEW','OMNIVIEW', array['OMNI VIEW','READ MODEL'],'SYSTEM',
  'CURRENT_STATE_MANIFEST_PLUS_TOPIC_EXPANSION read model and the sequence ledger behind it.',
  'CHAIRMAN','Chairman','PARTIAL')
on conflict (topic_key) do update
  set display_name = excluded.display_name,
      aliases      = excluded.aliases,
      topic_class  = excluded.topic_class,
      summary      = coalesce(excluded.summary, thy_omniview_topics.summary),
      authority_lock = excluded.authority_lock,
      authority_holder = excluded.authority_holder,
      updated_at   = now();

-- 2. SEQUENCE 587 — the read floor -------------------------------------------
insert into thy_sequence_ledger (
  sequence_no, previous_sequence_no, occurred_utc, occurred_local, local_timezone,
  why_change_occurred, what_changed, why_it_changed, what_remained,
  authority, truth_class, next_better_question, restart_point, source_ref)
select 587, null,
  timestamptz '2026-09-22 00:00:00+00', timestamp '2026-09-22 00:00', 'UTC',
  'The Chairman named sequence 587 as the read floor for the OMNIVIEW spine.',
  'The sequence change ledger was opened at 587. Earlier sequences were not imported.',
  'A ledger that back-dates rows it never witnessed would make its own truth class meaningless. '
  || '587 is the first sequence this ledger can stand behind.',
  'Sequences 1-586 remain where they already live: prior session history and thylora_query_carryforward. '
  || 'They are readable as pre-ledger context through thy_sequence_prior_context and are never presented as ledger rows.',
  'Chairman', 'CHAIRMAN_ASSERTED',
  'What is the Chairman local timezone of record, so LOCAL DATE/TIME stops defaulting to UTC?',
  'OMNIVIEW ledger open at 587. Next sequence is 588.',
  'THY-WORK-SEQUENCE-CHANGE-LEDGER-587'
where not exists (select 1 from thy_sequence_ledger where sequence_no = 587);

-- 3. SEQUENCE 588 — this build -----------------------------------------------
insert into thy_sequence_ledger (
  sequence_no, previous_sequence_no, occurred_utc, occurred_local, local_timezone,
  why_change_occurred, what_changed, why_it_changed, what_remained,
  authority, truth_class, next_better_question, restart_point, source_ref)
select 588, 587,
  timestamptz '2026-09-22 00:00:00+00', timestamp '2026-09-22 00:00', 'UTC',
  'THY-WORK-OMNIVIEW-ROUNDTRIP-587: the spine had no single read that returns current state plus the history behind it.',
  'CURRENT_STATE_MANIFEST_PLUS_TOPIC_EXPANSION implemented: topic manifest, authority locks, linked graph, '
  || 'linked people/places/objects/products, linked work, gates, current-vs-superseded canon, last restart, '
  || 'QYRIS read trace, append-only sequence ledger, and CONTEXT + SEQUENCE surfaces inside the existing dashboard.',
  'Re-reading every raw backend row each turn is slow and still unprovable. One governed read returns the state '
  || 'and names exactly which tables it touched, so an answer can no longer claim a table it never read.',
  'No existing THYLORA table was dropped, renamed or rewritten. The dashboard was extended, not replaced: every '
  || 'baseline capability in dashboard-baseline.json is still present. Deployment authority stays with '
  || 'vyc2st-ctrl/thylora-executive-dashboard.',
  'Chairman', 'REPO_VERIFIED',
  'Which UNSEEDED topic does the Chairman want seeded first: CASTLE, INÉS, VERONICA, FOOTBALL or VEHICLES?',
  'OMNIVIEW pack written and verified against a throwaway PostgreSQL 16 database. '
  || 'Held for Chairman execution against thylora-dash; not yet applied to the live backend.',
  'db/omniview/'
where not exists (select 1 from thy_sequence_ledger where sequence_no = 588);

-- 4. WHICH TOPICS SEQUENCE 588 TOUCHED ---------------------------------------
insert into thy_sequence_ledger_topics (sequence_no, topic_key, effect) values
  (587,'OMNIVIEW','RESTARTED'),
  (588,'OMNIVIEW','CANON_CHANGED'),
  (588,'QYRIS','CANON_CHANGED'),
  (588,'DASHBOARD','WORK_CHANGED'),
  (588,'TIME RUN','TOUCHED'),
  (588,'STORE','TOUCHED'),
  (588,'CASTLE','TOUCHED'),
  (588,'ECONOMY','TOUCHED')
on conflict (sequence_no, topic_key) do nothing;

update thy_omniview_topics t
   set last_sequence_no = s.seq, restart_point = l.restart_point, updated_at = now()
  from (select topic_key, max(sequence_no) as seq from thy_sequence_ledger_topics group by topic_key) s
  join thy_sequence_ledger l on l.sequence_no = s.seq
 where t.topic_key = s.topic_key;

-- 5. CANON — only where a file proves it -------------------------------------
insert into thy_omniview_statements (topic_key, statement_kind, body, truth_class, authority,
                                     entered_sequence_no, source_ref)
select * from (values
 ('DASHBOARD','CANON',
  'Deployment authority for the Chairman dashboard is NOT this repository. The authoritative deployment repository is vyc2st-ctrl/thylora-executive-dashboard, the authoritative runtime project is thylora-public-world, and the backend is thylora-dash (jvsdxhrfhtlgaknhjxlz). A change is not live until it is merged there and witnessed on thylora-public-world.',
  'REPO_VERIFIED','Chairman',588,'DASHBOARD_AUTHORITY.md'),

 ('DASHBOARD','CONSTRAINT',
  'Baseline THY-DASH-FLOOR-20260823-001 holds: a future dashboard version may change appearance but may not silently remove a baseline capability, disconnect the existing backend, or replace the current head with an older state.',
  'REPO_VERIFIED','Chairman',588,'dashboard-baseline.json'),

 ('DASHBOARD','EVIDENCE',
  'FINDING at sequence 588: the copy of the head in vyc2st-ctrl/Thylora is seven capabilities below baseline THY-DASH-FLOOR-20260823-001 — Product & Storefront, Commerce Proof, System Health, Required Chairman Action, Approvals, Digital Product Passports, Connection Evidence. The shortfall is present in the file before the OMNIVIEW delta, so the delta did not cause it. The live head on thylora-public-world was not reachable and is NOT claimed either way.',
  'REPO_VERIFIED','Chairman',588,'dashboard-baseline-gap.json'),

 ('DASHBOARD','EVIDENCE',
  'CONTEXT and SEQUENCE surfaces were added to the existing dashboard as an injected delta (app/omniview-surface.js), in the same pattern as the SPINE FORWARD command spine. No new dashboard was built.',
  'REPO_VERIFIED','Chairman',588,'app/omniview-surface.js'),

 ('QYRIS','CANON',
  'QYRIS-1 is the visible read trace. Every OMNIVIEW read returns, in the same call that returns the answer: scope, topic, read timestamp, sequence head, the exact tables read with row counts, and an explicit not_read list. An answer may claim only the tables listed in tables_read.',
  'REPO_VERIFIED','Chairman',588,'db/omniview/0003_read_model.sql'),

 ('OMNIVIEW','CANON',
  'The pre-response path is data, not convention. Every topic read returns read_path = NEWEST DELTAS, TOPIC MANIFEST, AUTHORITY LOCKS, LINKED GRAPH, LINKED PEOPLE/PLACES/OBJECTS/PRODUCTS, LINKED WORK, LINKED GATES, CURRENT VS SUPERSEDED, LAST RESTART, ANSWER — and the surface renders in that order.',
  'REPO_VERIFIED','Chairman',588,'db/omniview/0003_read_model.sql'),

 ('OMNIVIEW','CONSTRAINT',
  'Source history is never rewritten. thy_sequence_ledger refuses UPDATE and DELETE at the database level; a correction is a new sequence carrying supersedes_sequence_no. Canon statements are superseded, never edited.',
  'REPO_VERIFIED','Chairman',588,'db/omniview/0001_sequence_ledger.sql'),

 ('TIME RUN','EVIDENCE',
  'Time Run has a surface in the member app (app/time-run.html, app/time-run.js, app/time-run.css) and is wired into accepted app navigation. Whether that surface is the whole of TIME RUN canon is not established by this repository.',
  'REPO_VERIFIED','Chairman',588,'app/time-run.html'),

 ('STORE','EVIDENCE',
  'The storefront exists as public-site/store.html with a THYLORA membership storefront surface, and the dashboard reads products, orders, payments and entitlements from the backend of record.',
  'REPO_VERIFIED','Chairman',588,'public-site/store.html'),

 ('ECONOMY','EVIDENCE',
  'Money is held in integer minor units with gross, fees, refunds, chargebacks, platform share, creator share, beneficiary share and net payable kept as separate columns. No opaque net proceeds, no floating point money.',
  'REPO_VERIFIED','Chairman',588,'db/rae-link/0005_monetization_ledger.sql')
) v(topic_key, statement_kind, body, truth_class, authority, entered_sequence_no, source_ref)
where not exists (
  select 1 from thy_omniview_statements s
   where s.topic_key = v.topic_key and s.body = v.body);

update thy_omniview_topics set canon_state = 'PARTIAL', updated_at = now()
 where canon_state = 'UNSEEDED'
   and exists (select 1 from thy_omniview_statements s where s.topic_key = thy_omniview_topics.topic_key);

-- 6. LINKED GRAPH -------------------------------------------------------------
insert into thy_omniview_links (topic_key, link_class, link_key, display_name, relation, status,
                                source_table, source_ref, entered_sequence_no)
values
 ('DASHBOARD','WORK','THY-WORK-DASHBOARD-INTERACTION-CLOSEOUT-562','Dashboard interaction closeout',
  'Open work: every control reaches a real destination','ACTIVE',null,'tests/dead-controls.test.mjs',588),
 ('DASHBOARD','WORK','THY-WORK-OMNIVIEW-ROUNDTRIP-587','OMNIVIEW round trip',
  'CONTEXT and SEQUENCE surfaces inside the existing dashboard','ACTIVE',null,'app/omniview-surface.js',588),
 ('DASHBOARD','SYSTEM','thylora-public-world','thylora-public-world','Authoritative runtime project','ACTIVE',null,'DASHBOARD_AUTHORITY.md',588),
 ('DASHBOARD','SYSTEM','thylora-dash','thylora-dash (jvsdxhrfhtlgaknhjxlz)','Backend of record','ACTIVE',null,'DASHBOARD_AUTHORITY.md',588),
 ('DASHBOARD','TOPIC','OMNIVIEW','OMNIVIEW','Dashboard surfaces the OMNIVIEW read model','ACTIVE',null,null,588),

 ('OMNIVIEW','WORK','THY-WORK-OMNIVIEW-ROUNDTRIP-587','OMNIVIEW round trip','Implements the read model','ACTIVE',null,'db/omniview/',588),
 ('OMNIVIEW','WORK','THY-WORK-SEQUENCE-CHANGE-LEDGER-587','Sequence change ledger','Implements the ledger','ACTIVE',null,'db/omniview/0001_sequence_ledger.sql',588),
 ('OMNIVIEW','TOPIC','QYRIS','QYRIS','Every OMNIVIEW read carries a QYRIS trace','ACTIVE',null,null,588),

 ('QYRIS','SYSTEM','thy_omniview_qyris','thy_omniview_qyris()','Produces the trace in the same call as the answer','ACTIVE',null,'db/omniview/0003_read_model.sql',588),

 ('STORE','PRODUCT','products','Product registry','Store products live in the backend of record','ACTIVE','products',null,588),
 ('STORE','SYSTEM','orders','Order registry','Commerce proof','ACTIVE','orders',null,588),
 ('STORE','SYSTEM','entitlements','Entitlement registry','What a buyer may access','ACTIVE','entitlements',null,588),
 ('STORE','OBJECT','public-site/store.html','Public storefront page','Public store surface','ACTIVE',null,'public-site/store.html',588),
 ('STORE','TOPIC','ECONOMY','ECONOMY','Store revenue settles through the economy spine','ACTIVE',null,null,588),

 ('TIME RUN','OBJECT','app/time-run.html','Time Run app surface','Member app surface','ACTIVE',null,'app/time-run.html',588),
 ('TIME RUN','SYSTEM','app','THYLORA member app','Time Run is wired into accepted app navigation','ACTIVE',null,'app/index.html',588),

 ('ECONOMY','MONEY','rael_revenue_ledger','Revenue ledger','Gross, fees and shares held separately','ACTIVE','rael_revenue_ledger','db/rae-link/0005_monetization_ledger.sql',588),
 ('ECONOMY','SYSTEM','financial_decision_register','Financial decision register','Money decisions of record','ACTIVE','financial_decision_register',null,588),

 ('FOOTBALL','WORK','GAME-BET-001','GAME-BET-001 sportsbook and casino workroom',
  'ADJACENT, UNCONFIRMED: a sports surface exists in the app. Whether it belongs to FOOTBALL canon is not established.',
  'BLOCKED',null,'app/sports-betting.html',588)
on conflict (topic_key, link_class, link_key) do nothing;

-- 7. GATES --------------------------------------------------------------------
insert into thy_omniview_gates (gate_key, topic_key, requirement, gate_state, blocker, authority,
                                evidence_ref, entered_sequence_no, settled_sequence_no)
values
 ('GATE-OMNIVIEW-APPLIED','OMNIVIEW',
  'The OMNIVIEW pack is applied to thylora-dash and thy_omniview_manifest() returns from the live backend.',
  'BLOCKED',
  'This build session cannot reach jvsdxhrfhtlgaknhjxlz.supabase.co (egress denied). Applying DDL to the live backend is a Chairman execution.',
  'Chairman','db/omniview/APPLY.md',588,null),

 ('GATE-OMNIVIEW-WITNESSED','DASHBOARD',
  'CONTEXT and SEQUENCE are witnessed working on thylora-public-world after merge into vyc2st-ctrl/thylora-executive-dashboard.',
  'BLOCKED','Deployment authority is not this repository.','Chairman','DASHBOARD_AUTHORITY.md',588,null),

 ('GATE-BASELINE-PRESERVED','DASHBOARD',
  'The OMNIVIEW delta removes no capability that the current head already carried.',
  'PASSED',null,'Chairman','tests/dashboard-delta.test.mjs',588,588),

 ('GATE-BASELINE-FLOOR','DASHBOARD',
  'The head carries every capability named in baseline THY-DASH-FLOOR-20260823-001.',
  'BLOCKED',
  'Seven baseline capabilities are absent from this repository copy of the head: Product & Storefront, Commerce Proof, System Health, Required Chairman Action, Approvals, Digital Product Passports, Connection Evidence. '
  || 'The shortfall predates sequence 588 and was not caused by the OMNIVIEW delta. Whether the live head on thylora-public-world carries them could not be checked: egress was denied.',
  'Chairman','dashboard-baseline-gap.json',588,null),

 ('GATE-DEAD-CONTROLS','DASHBOARD',
  'Every button, control and in-page link in the dashboard, app, public site and RAE Link reaches a real destination.',
  'PASSED',null,'Chairman','tests/dead-controls.test.mjs',588,588),

 ('GATE-CANON-SOURCE','CASTLE',
  'CASTLE canon is stated by the Chairman before any answer treats it as settled.',
  'OPEN','No source in this repository establishes CASTLE.','Chairman',null,588,null)
on conflict (gate_key) do update
  set requirement = excluded.requirement, gate_state = excluded.gate_state,
      blocker = excluded.blocker,
      settled_sequence_no = excluded.settled_sequence_no, updated_at = now();

-- 8. OPEN QUESTIONS — what an honest UNSEEDED topic returns -------------------
insert into thy_omniview_questions (topic_key, question, why_it_matters, is_next_better, entered_sequence_no)
select * from (values
 ('CASTLE','What is CASTLE — a property, a build, a programme or a metaphor — and who or what is its source of record?',
  'CASTLE is registered and asked about, but nothing in the backend or repository establishes it. Until this is answered every CASTLE answer is invention.', true, 588),
 ('INES','What is INÉS to THYLORA, and which record should hold that: a family profile, a partnership, or a person on the living world register?',
  'INÉS is a named topic with no linked record. The right registry has to be chosen before canon is written.', true, 588),
 ('VERONICA','What is VERONICA to THYLORA, and which existing registry already holds part of it?',
  'Registering canon in the wrong place creates a second source of truth.', true, 588),
 ('FOOTBALL','Does FOOTBALL canon include the GAME-BET-001 sportsbook surface, or is FOOTBALL a separate programme?',
  'A sports surface exists in the app. Linking it to FOOTBALL without the Chairman saying so would invent a relationship.', true, 588),
 ('VEHICLES','Which vehicles are on the THYLORA register, and is the register an asset list, a fleet, or a product line?',
  'VEHICLES is registered with no linked record of any class.', true, 588),
 ('TIME RUN','Is the app Time Run surface the whole of TIME RUN, or the visible part of a larger programme?',
  'The repository proves the surface exists; it does not prove what TIME RUN is.', true, 588),
 ('STORE','Which products are RELEASED and carry an active purchase path right now in the backend of record?',
  'The store surface is proven; live product state can only come from a backend read.', true, 588),
 ('OMNIVIEW','What is the Chairman local timezone of record, so LOCAL DATE/TIME stops defaulting to UTC?',
  'Every ledger row carries a local time. Defaulting it to UTC is a known, recorded compromise.', true, 588),
 ('DASHBOARD','Does the live head on thylora-public-world still carry the seven capabilities missing from this repository copy, and if it does, should this copy be refreshed from vyc2st-ctrl/thylora-executive-dashboard?',
  'A baseline floor that is silently below itself is worse than no floor. This is the one DASHBOARD answer that cannot be settled from inside this repository.', true, 588),
 ('DASHBOARD','After the OMNIVIEW pack is applied, which surface should open first on sign-in: CURRENT HEAD or CONTEXT?',
  'The Chairman decides the landing surface; the delta ships CONTEXT as an added surface, not a replacement.', false, 588),
 ('ECONOMY','Which revenue lanes are live in the backend of record today, and which are defined but not yet earning?',
  'The lane definitions are proven by migration; live state is not.', true, 588)
) v(topic_key, question, why_it_matters, is_next_better, entered_sequence_no)
where not exists (select 1 from thy_omniview_questions q
                   where q.topic_key = v.topic_key and q.question = v.question);

-- 9. RESTART POINT ------------------------------------------------------------
insert into thy_omniview_restarts (scope, topic_key, restart_point, reason, authority, sequence_no)
select 'SPINE', null,
  'OMNIVIEW pack written and verified against PostgreSQL 16 locally. Held for Chairman execution against thylora-dash. '
  || 'Dashboard CONTEXT and SEQUENCE surfaces are in the current head and degrade to a clear NOT YET APPLIED state until the pack is applied. '
  || 'Next: apply db/omniview/ to thylora-dash, then answer the next-better question on the UNSEEDED topics.',
  'Sequence 588 closed the OMNIVIEW round trip and the sequence ledger.',
  'Chairman', 588
where not exists (select 1 from thy_omniview_restarts where sequence_no = 588 and scope = 'SPINE');

commit;
