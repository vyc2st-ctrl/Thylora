-- THYLORA · RECOVERED VISUAL STANDARD REGISTRY
-- Work code: THY-WORK-VISUAL-STANDARD-RECOVERY-545
-- Backend:   thylora-dash (jvsdxhrfhtlgaknhjxlz)
-- Workroom:  WR-VISUAL-STANDARD-545
--
-- This creates NO second visual framework. It records, in the backend, the
-- exemplars and rules that were already approved and already shipped, so the
-- standard stops living only in prose and can be enforced by a query.
--
-- Every row below cites the repository, commit and file it was recovered from.
-- Nothing here is authored from imagination.

begin;

-- 1 · Approved / previously-liked exemplars, with their disposition.
--     A SUPERSEDED exemplar is kept on purpose: the defect it names must not be
--     reintroduced later as if it were a new idea.
create table if not exists thylora_visual_exemplar_registry (
  asset_id            text primary key,
  record_date         date not null,
  source_record       text not null,
  title               text not null,
  why_it_passed       text not null,
  rules_demonstrated  text[] not null default '{}',
  exemplar_state      text not null
    check (exemplar_state in ('CURRENT','SUPERSEDED','CURRENT_BUT_UNENFORCED')),
  superseded_by       text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

insert into thylora_visual_exemplar_registry
  (asset_id, record_date, source_record, title, why_it_passed, rules_demonstrated, exemplar_state, superseded_by)
values
  ('THY-VIS-EXEMPLAR-001', date '2026-09-19',
   'vyc2st-ctrl/thylora-executive-dashboard @ a634249 · app/assets/thylora-handluh-castle.jpg, bound by app/build8-visual-floor.js (console marker THY-BUILD8-VISUAL-FLOOR-002)',
   'THEHANDLUH living-art castle environment',
   'The only image the THEHANDLUH gallery is permitted to render. Its own shipped alt text and caption read "Chairman-approved living-art environment · castle, cart and workers" — architecture, a working object and people working in it, not a single posed subject.',
   array['LIVED_IN_WORLD','PEOPLE_DOING_REAL_THINGS','BACKGROUND_ACTIVITY','DEEP_SPATIAL_CONTEXT','WORLD_SPECIFIC_ARCHITECTURE','OBJECT_PROVENANCE'],
   'CURRENT', null),

  ('THY-VIS-EXEMPLAR-002', date '2026-09-19',
   'vyc2st-ctrl/thylora-executive-dashboard @ a634249 · app/build8-visual-floor.js, gallery copy string',
   'Build 8 approved-imagery-only rule',
   'Shipped as enforced page copy: "This room uses approved THYLORA imagery only. Unapproved scene slots stay absent instead of appearing as temporary color blocks." Absence is preferred to a placeholder.',
   array['NO_GENERIC_STOCK_LOOK','NO_WHITE_WORKSHEET_LOOK'], 'CURRENT', null),

  ('THY-VIS-EXEMPLAR-003', date '2026-08-25',
   'vyc2st-ctrl/Thylora @ af780f5 "Style Bramble and Dividend Circle show cards" · app/index.html #shows',
   'Bramble + Wick era lock card',
   'Names the era as a lock rather than a mood — "1930s-1940s ERA LOCK" — and enumerates what the lock covers: visible technology, clothing, classrooms, transportation, tools, signs and household objects, with deliberate approval required for any exception.',
   array['PERIOD_MATERIAL_CULTURE','WORLD_SPECIFIC_CLOTHING','LIGHT_WEATHER_TIME'], 'CURRENT', null),

  ('THY-VIS-EXEMPLAR-004', date '2026-08-29',
   'vyc2st-ctrl/thylora-executive-dashboard @ a634249 · research/historical-interactive-derivative-brief.md',
   'Four-layer evidence labelling',
   'Separates documented fact, interpretation, dramatization and UNKNOWN into parallel layers; requires evidence cards to carry source, institution, access date, jurisdiction and confidence; requires fictionalized content to carry a persistent visual label distinct from fact cards.',
   array['VIEWER_PLANE_FILM_BARRIER','MAKER_MARKS','OBJECT_PROVENANCE'], 'CURRENT', null),

  ('THY-VIS-EXEMPLAR-005', date '2026-09-19',
   'vyc2st-ctrl/thylora-executive-dashboard @ a634249 · js/delivery-intake-build8.js rendering get_thylora_release_review_candidates_v1()',
   'Existing release-review visual preflight hook',
   'PARTIAL. The release-review card already shows the product image beside visual_preflight_passed, rights_passed, delivery_connected and mobile_preview_passed. The hook this gate binds to already exists and must not be duplicated — what was missing is any definition of what makes visual_preflight_passed true.',
   array['PAGE_TO_PAGE_VISUAL_FLOW'], 'CURRENT_BUT_UNENFORCED', null),

  ('THY-VIS-SUPERSEDED-001', date '2026-08-25',
   'vyc2st-ctrl/Thylora @ 4952f4e / 647bb80 · app/styles.css .scene/.waterfront/.oldcity/.country/.downtown',
   'Build 6 CSS gradient scene blocks',
   'It did not pass. Four CSS gradient rectangles stood in for a waterfront, an old city, countryside and downtown. No people, no objects, no makers, no depth — the generic look Build 8 removed by name.',
   array['NO_GENERIC_STOCK_LOOK'], 'SUPERSEDED', 'THY-VIS-EXEMPLAR-002')
on conflict (asset_id) do update set
  record_date = excluded.record_date, source_record = excluded.source_record,
  title = excluded.title, why_it_passed = excluded.why_it_passed,
  rules_demonstrated = excluded.rules_demonstrated,
  exemplar_state = excluded.exemplar_state, superseded_by = excluded.superseded_by,
  updated_at = now();

-- 2 · The recovered visual grammar. `recovered_from` cites the exemplar record.
--     A rule with recovered_from = 'GAP' would be new; this recovery has none.
create table if not exists thylora_visual_rule_registry (
  rule_code       text primary key,
  rule_text       text not null,
  recovered_from  text not null,
  rule_order      integer not null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

insert into thylora_visual_rule_registry (rule_code, rule_text, recovered_from, rule_order) values
 ('LIVED_IN_WORLD','The frame shows a place that was in use before the frame opened and stays in use after it closes. Wear, weather and ordinary disorder are present.','THY-VIS-EXEMPLAR-001',1),
 ('PEOPLE_DOING_REAL_THINGS','People are engaged in a specific task with their hands and their attention. Posing for the viewer is not a task.','THY-VIS-EXEMPLAR-001',2),
 ('BACKGROUND_ACTIVITY','Life continues behind the main subject. At least one thing is happening that the main subject is not part of.','THY-VIS-EXEMPLAR-001',3),
 ('PERIOD_MATERIAL_CULTURE','Visible technology, clothing, classrooms, transportation, tools, signs and household objects stay inside the declared era unless a later exception is deliberately approved and recorded.','THY-VIS-EXEMPLAR-003',4),
 ('MAKER_MARKS','An object important to the page carries the evidence of having been made — joinery, stitching, casting seam, tool mark, repair, a maker stamp or a hand.','THY-VIS-EXEMPLAR-004',5),
 ('WEAR_REPAIR_USE','Objects in service show service: scuffing, patina, a mended handle, a replaced part. New-out-of-box is a claim that needs a reason.','THY-VIS-EXEMPLAR-001',6),
 ('DEEP_SPATIAL_CONTEXT','The frame resolves foreground, middle ground and distance. The world does not end at the subject.','THY-VIS-EXEMPLAR-001',7),
 ('OBJECT_PROVENANCE','Who made or supplied an important object is recoverable — from the image, the caption or the bound record. Provenance carries source, institution, access date, jurisdiction and confidence where the object is historical.','THY-VIS-EXEMPLAR-004',8),
 ('WORLD_SPECIFIC_ARCHITECTURE','Buildings and structures belong to this world and no other. Generic architecture is a failure, not a neutral choice.','THY-VIS-EXEMPLAR-001',9),
 ('WORLD_SPECIFIC_CLOTHING','Clothing belongs to the declared world, era and the wearer''s work. Costume that could appear anywhere belongs nowhere.','THY-VIS-EXEMPLAR-003',10),
 ('LIGHT_WEATHER_TIME','Every page states its light, its weather and its time of day, and the image agrees with the statement.','THY-VIS-EXEMPLAR-003',11),
 ('VIEWER_PLANE_FILM_BARRIER','Simulated world media, dramatization and invented dialogue carry a persistent visual label distinct from fact. The viewer is never left to guess which side of the barrier they are on. An EdereAriah world channel can never be presented as an Earth person.','THY-VIS-EXEMPLAR-004',12),
 ('TEXT_PLACEMENT','Text lives in a declared region of the page and rides on the art. A page whose text region is the page is a worksheet.','THY-VIS-EXEMPLAR-002',13),
 ('PAGE_TO_PAGE_VISUAL_FLOW','Each page differs from the one before it in a stated way — camera distance, location, time, cast or light. Repetition must be a decision with a reason.','THY-VIS-EXEMPLAR-005',14),
 ('ART_STORY_BALANCE','The illustration carries information the text does not. If the text alone conveys the page, the illustration is decoration.','THY-VIS-EXEMPLAR-002',15),
 ('NO_GENERIC_STOCK_LOOK','Unapproved scene slots stay absent rather than appearing as temporary colour blocks, gradients or stock-look filler.','THY-VIS-EXEMPLAR-002 / THY-VIS-SUPERSEDED-001',16),
 ('NO_WHITE_WORKSHEET_LOOK','White page does not dominate a meaningful page. A blank white text page exists only as a documented, justified artistic exception.','THY-VIS-EXEMPLAR-002',17)
on conflict (rule_code) do update set
  rule_text = excluded.rule_text, recovered_from = excluded.recovered_from,
  rule_order = excluded.rule_order, updated_at = now();

-- 3 · Open naming conflict, recorded rather than silently resolved.
create table if not exists thylora_visual_open_questions (
  question_code text primary key,
  detail        text not null,
  state         text not null check (state in ('OPEN','RESOLVED')),
  resolved_value text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

insert into thylora_visual_open_questions (question_code, detail, state, resolved_value) values
 ('THY-NAMEGUARD-EDEREAIRAH-001',
  'Shipped surfaces of vyc2st-ctrl/Thylora spell the world "EdereAriah" (14 occurrences, 0 of "EdereAirah"). The backend name guard code and the sequence-545 directive spell it "EdereAirah". Both are real records. The gate uses the shipped spelling and refuses to normalise the other away. Chairman decision.',
  'OPEN', null)
on conflict (question_code) do nothing;

alter table thylora_visual_exemplar_registry enable row level security;
alter table thylora_visual_rule_registry     enable row level security;
alter table thylora_visual_open_questions    enable row level security;

drop policy if exists thylora_visual_exemplar_read on thylora_visual_exemplar_registry;
create policy thylora_visual_exemplar_read on thylora_visual_exemplar_registry
  for select using (auth.uid() is not null);
drop policy if exists thylora_visual_rule_read on thylora_visual_rule_registry;
create policy thylora_visual_rule_read on thylora_visual_rule_registry
  for select using (auth.uid() is not null);
drop policy if exists thylora_visual_open_read on thylora_visual_open_questions;
create policy thylora_visual_open_read on thylora_visual_open_questions
  for select using (auth.uid() is not null);

commit;
