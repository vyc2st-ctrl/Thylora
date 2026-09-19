// THYLORA · RECOVERED VISUAL STANDARD
// Work code: THY-WORK-VISUAL-STANDARD-RECOVERY-545
// Workroom:  WR-VISUAL-STANDARD-545
//
// NOTHING IN THIS FILE IS NEW. Every exemplar and every rule below was recovered
// from a record that already exists in one of the two authoritative repositories
// or in the shipped surfaces they deploy. Where a rule had no prior record, it is
// marked GAP and named as such rather than invented quietly.
//
// This is the single source the SQL seed and the JavaScript gate both read, so
// the backend registry and the client gate cannot drift apart.

/**
 * Previously approved / Chairman-liked exemplars, recovered with their record.
 * `state` is CURRENT or SUPERSEDED — a superseded exemplar stays listed so the
 * defect it represents cannot be reintroduced as if it were new.
 */
export const RECOVERED_EXEMPLARS = Object.freeze([
  Object.freeze({
    asset_id: 'THY-VIS-EXEMPLAR-001',
    record_date: '2026-09-19',
    source: 'vyc2st-ctrl/thylora-executive-dashboard @ a634249 · app/assets/thylora-handluh-castle.jpg, bound by app/build8-visual-floor.js (console marker THY-BUILD8-VISUAL-FLOOR-002)',
    title: 'THEHANDLUH living-art castle environment',
    why_it_passed: 'The only image the THEHANDLUH gallery is permitted to render. Its own alt text and caption in the shipped code call it "Chairman-approved living-art environment · castle, cart and workers" — an environment with architecture, a working object and people working in it, not a single posed subject.',
    rules_demonstrated: Object.freeze([
      'LIVED_IN_WORLD', 'PEOPLE_DOING_REAL_THINGS', 'BACKGROUND_ACTIVITY',
      'DEEP_SPATIAL_CONTEXT', 'WORLD_SPECIFIC_ARCHITECTURE', 'OBJECT_PROVENANCE'
    ]),
    state: 'CURRENT'
  }),
  Object.freeze({
    asset_id: 'THY-VIS-EXEMPLAR-002',
    record_date: '2026-09-19',
    source: 'vyc2st-ctrl/thylora-executive-dashboard @ a634249 · app/build8-visual-floor.js, gallery copy string',
    title: 'Build 8 approved-imagery-only rule',
    why_it_passed: 'Shipped as enforced page copy: "This room uses approved THYLORA imagery only. Unapproved scene slots stay absent instead of appearing as temporary color blocks." Absence is preferred to a placeholder.',
    rules_demonstrated: Object.freeze(['NO_GENERIC_STOCK_LOOK', 'NO_WHITE_WORKSHEET_LOOK']),
    state: 'CURRENT'
  }),
  Object.freeze({
    asset_id: 'THY-VIS-EXEMPLAR-003',
    record_date: '2026-08-25',
    source: 'vyc2st-ctrl/Thylora @ af780f5 "Style Bramble and Dividend Circle show cards" · app/index.html #shows',
    title: 'Bramble + Wick era lock card',
    why_it_passed: 'Names the era as a lock, not a mood: "1930s-1940s ERA LOCK", and enumerates what the lock covers — visible technology, clothing, classrooms, transportation, tools, signs and household objects — with deliberate approval required for any exception.',
    rules_demonstrated: Object.freeze(['PERIOD_MATERIAL_CULTURE', 'WORLD_SPECIFIC_CLOTHING', 'LIGHT_WEATHER_TIME']),
    state: 'CURRENT'
  }),
  Object.freeze({
    asset_id: 'THY-VIS-EXEMPLAR-004',
    record_date: '2026-08-29',
    source: 'vyc2st-ctrl/thylora-executive-dashboard @ a634249 · research/historical-interactive-derivative-brief.md',
    title: 'Four-layer evidence labelling',
    why_it_passed: 'Separates documented fact, interpretation, dramatization and UNKNOWN into parallel layers, requires evidence cards to carry source, institution, access date, jurisdiction and confidence, and requires fictionalized content to carry a persistent visual label distinct from fact cards.',
    rules_demonstrated: Object.freeze(['VIEWER_PLANE_FILM_BARRIER', 'MAKER_MARKS', 'OBJECT_PROVENANCE']),
    state: 'CURRENT'
  }),
  Object.freeze({
    asset_id: 'THY-VIS-EXEMPLAR-005',
    record_date: '2026-09-19',
    source: 'vyc2st-ctrl/thylora-executive-dashboard @ a634249 · js/delivery-intake-build8.js, rendering get_thylora_release_review_candidates_v1()',
    title: 'Existing release-review visual preflight hook',
    why_it_passed: 'PARTIAL. The release-review card already shows the product image beside four booleans — visual_preflight_passed, rights_passed, delivery_connected, mobile_preview_passed. The hook this gate must bind to already exists and must not be duplicated.',
    rules_demonstrated: Object.freeze(['PAGE_TO_PAGE_VISUAL_FLOW']),
    state: 'CURRENT_BUT_UNENFORCED'
  }),
  Object.freeze({
    asset_id: 'THY-VIS-SUPERSEDED-001',
    record_date: '2026-08-25',
    source: 'vyc2st-ctrl/Thylora @ 4952f4e / 647bb80 · app/styles.css .scene/.waterfront/.oldcity/.country/.downtown',
    title: 'Build 6 CSS gradient scene blocks',
    why_it_passed: 'It did not. Four CSS gradient rectangles stood in for a waterfront, an old city, countryside and downtown. No people, no objects, no makers, no depth — exactly the generic look Build 8 removed by name.',
    rules_demonstrated: Object.freeze(['NO_GENERIC_STOCK_LOOK']),
    state: 'SUPERSEDED'
  })
]);

/**
 * The recovered visual grammar. `origin` cites the record each rule came from;
 * `origin: 'GAP'` marks the rules that had no prior record and are new here.
 */
export const VISUAL_RULES = Object.freeze([
  { code: 'LIVED_IN_WORLD', rule: 'The frame shows a place that was in use before the frame opened and stays in use after it closes. Wear, weather and ordinary disorder are present.', origin: 'THY-VIS-EXEMPLAR-001' },
  { code: 'PEOPLE_DOING_REAL_THINGS', rule: 'People are engaged in a specific task with their hands and their attention. Posing for the viewer is not a task.', origin: 'THY-VIS-EXEMPLAR-001' },
  { code: 'BACKGROUND_ACTIVITY', rule: 'Life continues behind the main subject. At least one thing is happening that the main subject is not part of.', origin: 'THY-VIS-EXEMPLAR-001' },
  { code: 'PERIOD_MATERIAL_CULTURE', rule: 'Visible technology, clothing, classrooms, transportation, tools, signs and household objects stay inside the declared era unless a later exception is deliberately approved and recorded.', origin: 'THY-VIS-EXEMPLAR-003' },
  { code: 'MAKER_MARKS', rule: 'An object important to the page carries the evidence of having been made — joinery, stitching, casting seam, tool mark, repair, a maker stamp or a hand.', origin: 'THY-VIS-EXEMPLAR-004' },
  { code: 'WEAR_REPAIR_USE', rule: 'Objects in service show service: scuffing, patina, a mended handle, a replaced part. New-out-of-box is a claim that needs a reason.', origin: 'THY-VIS-EXEMPLAR-001' },
  { code: 'DEEP_SPATIAL_CONTEXT', rule: 'The frame resolves foreground, middle ground and distance. The world does not end at the subject.', origin: 'THY-VIS-EXEMPLAR-001' },
  { code: 'OBJECT_PROVENANCE', rule: 'Who made or supplied an important object is recoverable — from the image, the caption or the bound record. Provenance carries source, institution, access date, jurisdiction and confidence where the object is historical.', origin: 'THY-VIS-EXEMPLAR-004' },
  { code: 'WORLD_SPECIFIC_ARCHITECTURE', rule: 'Buildings and structures belong to this world and no other. Generic architecture is a failure, not a neutral choice.', origin: 'THY-VIS-EXEMPLAR-001' },
  { code: 'WORLD_SPECIFIC_CLOTHING', rule: 'Clothing belongs to the declared world, era and the wearer\'s work. Costume that could appear anywhere belongs nowhere.', origin: 'THY-VIS-EXEMPLAR-003' },
  { code: 'LIGHT_WEATHER_TIME', rule: 'Every page states its light, its weather and its time of day, and the image agrees with the statement.', origin: 'THY-VIS-EXEMPLAR-003' },
  { code: 'VIEWER_PLANE_FILM_BARRIER', rule: 'Simulated world media, dramatization and invented dialogue carry a persistent visual label distinct from fact. The viewer is never left to guess which side of the barrier they are on. An EdereAriah world channel can never be presented as an Earth person.', origin: 'THY-VIS-EXEMPLAR-004' },
  { code: 'TEXT_PLACEMENT', rule: 'Text lives in a declared region of the page and rides on the art. A page whose text region is the page is a worksheet.', origin: 'THY-VIS-EXEMPLAR-002' },
  { code: 'PAGE_TO_PAGE_VISUAL_FLOW', rule: 'Each page differs from the one before it in a stated way — camera distance, location, time, cast or light. Repetition must be a decision with a reason.', origin: 'THY-VIS-EXEMPLAR-005' },
  { code: 'ART_STORY_BALANCE', rule: 'The illustration carries information the text does not. If the text alone conveys the page, the illustration is decoration.', origin: 'THY-VIS-EXEMPLAR-002' },
  { code: 'NO_GENERIC_STOCK_LOOK', rule: 'Unapproved scene slots stay absent rather than appearing as temporary colour blocks, gradients or stock-look filler.', origin: 'THY-VIS-EXEMPLAR-002 / THY-VIS-SUPERSEDED-001' },
  { code: 'NO_WHITE_WORKSHEET_LOOK', rule: 'White page does not dominate a meaningful page. A blank white text page exists only as a documented, justified artistic exception.', origin: 'THY-VIS-EXEMPLAR-002' }
].map(Object.freeze));

/** The eleven questions each meaningful page or spread must resolve. */
export const PAGE_QUESTIONS = Object.freeze([
  { key: 'who_is_here',          question: 'WHO IS HERE' },
  { key: 'where_are_they',       question: 'WHERE ARE THEY' },
  { key: 'when_is_it',           question: 'WHEN IS IT' },
  { key: 'what_are_they_doing',  question: 'WHAT ARE THEY DOING' },
  { key: 'objects_present',      question: 'WHAT OBJECTS ARE PRESENT' },
  { key: 'object_makers',        question: 'WHO MADE / SUPPLIED IMPORTANT OBJECTS' },
  { key: 'background_action',    question: 'WHAT IS HAPPENING IN THE BACKGROUND' },
  { key: 'light_weather',        question: 'WHAT LIGHT / WEATHER' },
  { key: 'world_signature',      question: 'WHAT MAKES THIS EDEREARIAH' },
  { key: 'text_region',          question: 'WHERE TEXT LIVES' },
  { key: 'differs_from_previous',question: 'WHY THIS PAGE LOOKS DIFFERENT FROM THE PREVIOUS ONE' }
].map(Object.freeze));

/** Authored-product roles. Each must be RESOLVED or explicitly OPEN. */
export const AUTHORSHIP_ROLES = Object.freeze([
  'AUTHOR', 'EDITOR', 'ILLUSTRATOR', 'DESIGNER', 'PUBLISHER_IMPRINT', 'PRODUCTION_HOUSE'
]);

/**
 * Bylines that are system-generated rather than authored. A role carrying one of
 * these is not resolved — it is unfilled wearing a name.
 */
export const GENERIC_BYLINES = Object.freeze([
  'thylora', 'thylora system', 'system', 'system-generated', 'ai', 'ai generated',
  'ai-generated', 'generated', 'auto', 'automated', 'admin', 'staff', 'team',
  'n/a', 'na', 'tbd', 'unknown', 'anonymous', 'assistant', 'claude', 'chatgpt',
  'openai', 'midjourney', 'stable diffusion', 'dall-e', 'dalle'
]);

/**
 * Canonical world-name spelling as it appears in every shipped surface.
 * NAMEGUARD CONFLICT — OPEN. The shipped surfaces of vyc2st-ctrl/Thylora carry
 * 'EdereAriah' 14 times and 'EdereAirah' zero times. The backend name guard is
 * recorded as THY-NAMEGUARD-EDEREAIRAH-001 and the sequence-545 directive spells
 * it EdereAirah. Both spellings are real records. This gate uses the shipped
 * spelling and refuses to normalise the other away; the Chairman settles it.
 */
export const WORLD_NAME = 'EdereAriah';
export const WORLD_NAME_VARIANTS = Object.freeze(['EdereAriah', 'EdereAirah']);
export const NAMEGUARD_CONFLICT = Object.freeze({
  code: 'THY-NAMEGUARD-EDEREAIRAH-001',
  state: 'OPEN',
  detail: 'Shipped surfaces spell the world EdereAriah (14 occurrences, 0 of EdereAirah). The name guard code and the sequence-545 directive spell it EdereAirah. Unresolved.'
});
