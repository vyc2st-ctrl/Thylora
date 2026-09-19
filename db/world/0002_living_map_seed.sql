-- THYLORA · Living Map lane seed for THY-WORK-WINDSOR-MIRROR-CASTLE
-- STATUS: REVIEWABLE, NOT APPLIED.
-- Upsert only. Existing lane rows are updated in place; none are deleted.
-- Source of truth for these values: world/LIVING-MAP.json

insert into public.thylora_living_map
  (lane_key, lane_label, lane_state, detail, evidence_grade, blocker, next_action, sort_order, work_code)
values
  ('CASTLE','Castle','MIRROR CORRECTED · STRUCTURE CUT · IDENTITY OPEN',
   'Malbork superseded. Windsor Castle is the Earth mirror. Ten build phases, three wards, full room and building map, materials verified. Every EdereAriah-side value OPEN.',
   'S1','Castle has no name. C_w = 0 until Identity is authored.',
   'Chairman authors castle Identity: native name, city, territory, founder.',10,'THY-WORK-WINDSOR-MIRROR-CASTLE'),

  ('ROYAL_KITCHEN','Royal Kitchen','INÉS MORALES BOUND · RANKS OPEN',
   'Inés Morales bound to the Great Kitchen, the kitchen wing, the chain of command and the rosemary route. Wing, prep rooms, stores, receiving, waste, service path and royal dining route mapped.',
   'S1 mirror · backend unread','Sequence 528 household findings unread — ranks may already be settled.',
   'Backend read of sequence 528, then fill hierarchy without authoring over it.',20,'THY-WORK-WINDSOR-MIRROR-CASTLE'),

  ('ROSEMARY','Rosemary','ROUTE DRAWN END TO END · NAME OPEN',
   'Salvia rosmarinus, reclassified 2017 from Rosmarinus officinalis. Source, supplier, transport, receiving, storage, preparation, culinary use, historical claims and modern evidence separated.',
   'S1','Native EdereAriah name OPEN. Grow-or-buy fork unresolved.',
   'Chairman sets the native name and the grow-or-buy fork.',30,'THY-WORK-WINDSOR-MIRROR-CASTLE'),

  ('MATH','Math','MODEL ATTACHED · WORLD SCORED',
   'C_w = I x P x T x O x M x R x E attached to the castle dossier with child, adult and scholar readings and a real castle worked twice. Windsor 0.0564. EdereAriah 0.0000.',
   'derived','Identity at zero holds the whole product at zero.',
   'Author Identity, then re-score. Highest marginal return in the model.',40,'THY-WORK-WINDSOR-MIRROR-CASTLE'),

  ('PEOPLE_IN_TIME','People in Time','FOREGROUND · PILOT HELD · UNREAD',
   'Pilot not rewritten and not reconstructed. State, first seeded figure and gaps cannot be returned from the record because the backend was unreachable.',
   'unread','Backend blocked.',
   'Read the pilot record; return first seeded figure and quotation-sourcing standard verbatim.',50,'THY-WORK-WINDSOR-MIRROR-CASTLE'),

  ('HISTORY_EVIDENCE','History / Evidence','TWO CASES OPENED',
   'Case 1: the unnamed hands — Waterloo Chamber carpet, object catalogued to the item, makers catalogued as a category. Case 2: Queen Charlotte and the Madragana descent — claim and counter-claim carried at equal strength, position OPEN on statable grounds.',
   'S1, one primary source unretrieved','Origin document of the Charlotte claim not retrieved; every held source is a summariser.',
   'Retrieve the primary, then split the case into three independently gradable questions.',60,'THY-WORK-WINDSOR-MIRROR-CASTLE'),

  ('SPORTS_ENGINEERING','Sports / Engineering','CARRIED · UNTOUCHED THIS RUN',
   'GAME-BET-001 surfaces present. No change made under this work code.',
   'repository-confirmed',null,'Awaiting Chairman direction.',70,'THY-WORK-WINDSOR-MIRROR-CASTLE'),

  ('STORE','Store','CARRIED · UNTOUCHED THIS RUN',
   'Membership storefront present. Instruction held: no new store product was created.',
   'repository-confirmed',null,'None. Explicitly out of scope this run.',80,'THY-WORK-WINDSOR-MIRROR-CASTLE'),

  ('VLEGH','Vlegh','CARRIED · NO REPOSITORY TRACE',
   'Repository-wide search found no VLEGH artefact. Lane carried as instructed. State is backend-side and was unreadable. Declared unread, not empty.',
   'unread','Backend blocked; no repository-side artefact to report against.',
   'Backend read to establish lane state, or Chairman states it directly.',90,'THY-WORK-WINDSOR-MIRROR-CASTLE'),

  ('TIME','Time','CARRIED · UNTOUCHED THIS RUN',
   'Time Run surface present and wired into app navigation. No change made under this work code.',
   'repository-confirmed',null,'Awaiting Chairman direction.',100,'THY-WORK-WINDSOR-MIRROR-CASTLE')
on conflict (lane_key) do update set
  lane_label     = excluded.lane_label,
  lane_state     = excluded.lane_state,
  detail         = excluded.detail,
  evidence_grade = excluded.evidence_grade,
  blocker        = excluded.blocker,
  next_action    = excluded.next_action,
  sort_order     = excluded.sort_order,
  work_code      = excluded.work_code,
  updated_at     = now();

-- World completeness scores as computed in world/castle/WORLD-COMPLETENESS-MATH.md
insert into public.thylora_world_completeness
  (score_id, subject, identity_i, place_p, time_t, objects_o, makers_m, relationships_r, evidence_e, work_code)
values
  ('CW-WINDSOR-20260919','Windsor Castle (Earth mirror)',1.000,0.900,0.950,0.400,0.550,0.600,0.500,'THY-WORK-WINDSOR-MIRROR-CASTLE'),
  ('CW-EDEREARIAH-20260919','EdereAriah Castle',0.000,0.350,0.100,0.150,0.050,0.300,0.300,'THY-WORK-WINDSOR-MIRROR-CASTLE')
on conflict (score_id) do nothing;
