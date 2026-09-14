// THYLORA APP · section + backend contract
// Workroom: WR-THYAPP-001
//
// This file is the ONE place the shell names a backend object. Every section
// declares the reads and writes it needs; nothing else in the shell may invent
// a table, an RPC or a second service. That is what keeps this lane from
// becoming a competing backend: to see everything the mobile shell touches,
// read this file.
//
// Two rules encoded here:
//
//  1. ASK ERSATZ IS NOT DUPLICATED. Ask Ersatz questions, the Store, My
//     Purchases and serialized assets all resolve through the single
//     STOREFRONT service below. Ask Ersatz has no storefront of its own and no
//     second question pipeline.
//
//  2. THE MIRROR WORLD IS NOT DUPLICATED. The EdereAriah companion reads the
//     existing RAE Link channel registry (`rael_channels`, world-simulated
//     classes) rather than standing up a second world-identity store.
//
// Objects marked HELD do not exist on the live backend yet; their migrations
// are in db/thylora-app and are held for Chairman application. Until they are
// applied the shell reports "not provisioned yet" and never shows an empty
// panel that could be mistaken for "no content".

/* ---------------------------------------------------------------- services */
// A service is a backend capability that more than one section shares. Naming
// them once is how the shell proves it reuses rather than duplicates.
export const SERVICES = Object.freeze({
  // The approved THYLORA commerce path. Store, My Purchases, serialized assets
  // AND Ask Ersatz all route here.
  STOREFRONT: Object.freeze({
    code: 'STOREFRONT',
    label: 'THYLORA storefront + commerce',
    status: 'EXISTING',
    products: 'products',
    orders: 'orders',
    entitlements: 'entitlements',
    passports: 'digital_product_passports'
  }),
  // The canonical Chairman command spine. Already live and already used by the
  // authoritative dashboard; the shell calls the same RPC rather than a new one.
  CHAIRMAN_COMMAND: Object.freeze({
    code: 'CHAIRMAN_COMMAND',
    label: 'THYLORA Chairman command spine',
    status: 'EXISTING',
    submit: 'submit_thylora_chairman_command_v1',
    departments: 'thylora_departments'
  }),
  // The existing owned-media network. The mirror-world companion reads it.
  RAE_LINK: Object.freeze({
    code: 'RAE_LINK',
    label: 'RAE Link owned media network',
    status: 'HELD',
    channels: 'rael_channels',
    feed: 'rael_public_feed'
  }),
  // Public site metrics RPC that the member app already reads.
  SITE_METRICS: Object.freeze({
    code: 'SITE_METRICS',
    label: 'THYLORA public site metrics',
    status: 'EXISTING',
    totals: 'public_get_site_metrics'
  })
});

/* ------------------------------------------------------------------ access */
export const PUBLIC = 'PUBLIC';
export const CHAIRMAN = 'CHAIRMAN';

/* ---------------------------------------------------------------- sections */
// `order` is the nav order. `access` is enforced by lib/router.js, not here.
export const SECTIONS = Object.freeze([
  {
    id: 'home', label: 'Home', access: PUBLIC, icon: '◈',
    summary: 'One doorway into the THYLORA world: what is transmitting now, what Earth is showing, and what is open to you.',
    capabilities: ['arrival', 'continuity-posture'],
    reads: [
      { kind: 'rpc', name: SERVICES.SITE_METRICS.totals, service: 'SITE_METRICS', status: 'EXISTING',
        provisionedBy: 'PUBLIC_SITE' }
    ]
  },
  {
    id: 'transmissions', label: 'Transmissions', access: PUBLIC, icon: '◉',
    summary: 'Watch a THYLORA transmission, choose your language, and turn English subtitles on or off.',
    capabilities: ['watch-transmission', 'select-language', 'english-subtitle-toggle'],
    reads: [
      { kind: 'table', name: 'thy_transmissions', status: 'HELD',
        select: 'transmission_code,title,synopsis,bureau_code,runtime_seconds,poster_state,publish_state,published_at',
        order: 'published_at.desc' },
      { kind: 'table', name: 'thy_transmission_tracks', status: 'HELD',
        select: 'transmission_code,language_code,language_label,track_kind,subtitle_language,track_state' }
    ]
  },
  {
    id: 'earth-watch', label: 'Earth Watch', access: PUBLIC, icon: '⊕',
    summary: 'What THYLORA is watching on Earth, with the evidence attached to each signal.',
    capabilities: ['watch-transmission', 'open-casefile'],
    reads: [
      { kind: 'table', name: 'thy_earth_watch_signals', status: 'HELD',
        select: 'signal_code,headline,earth_place,signal_class,confidence_state,casefile_code,observed_at',
        order: 'observed_at.desc' }
    ]
  },
  {
    id: 'edereariah', label: 'EdereAriah', access: PUBLIC, icon: '◐',
    summary: 'The mirror-world companion. Every inhabitant here is world-simulated and says so.',
    capabilities: ['mirror-world-companion'],
    // Reuses the RAE Link channel registry; no second world-identity store.
    reads: [
      { kind: 'table', name: SERVICES.RAE_LINK.channels, service: 'RAE_LINK', status: 'HELD',
        provisionedBy: 'RAE_LINK',
        select: 'id,channel_code,display_name,channel_class,world_status,simulated_disclosure',
        filter: 'channel_class=in.(EDEREARIAH_INHABITANT,WORLD_CHANNEL)' }
    ]
  },
  {
    id: 'ask-ersatz', label: 'Ask Ersatz', access: PUBLIC, icon: '?',
    summary: 'Submit a question to Ersatz. Answers are interpretations, labelled as interpretations.',
    capabilities: ['submit-question'],
    // Routed through the SAME storefront/backend service as the Store. Ask
    // Ersatz does not own a second pipeline.
    service: 'STOREFRONT',
    reads: [
      { kind: 'table', name: 'thy_ersatz_questions', status: 'HELD',
        select: 'question_code,question_text,answer_text,answer_label,question_state,asked_at',
        order: 'asked_at.desc' }
    ],
    writes: [
      { kind: 'rpc', name: 'submit_ersatz_question_v1', status: 'HELD', service: 'STOREFRONT' }
    ]
  },
  {
    id: 'casefiles', label: 'Casefiles', access: PUBLIC, icon: '▤',
    summary: 'Open the evidence behind a story: documents, provenance and confidence, stated plainly.',
    capabilities: ['open-casefile', 'open-evidence'],
    reads: [
      { kind: 'table', name: 'thy_casefiles', status: 'HELD',
        select: 'casefile_code,title,subject_summary,confidence_state,casefile_state,opened_at',
        order: 'opened_at.desc' },
      { kind: 'table', name: 'thy_casefile_evidence', status: 'HELD',
        select: 'casefile_code,evidence_code,evidence_kind,source_label,provenance_state,confidence_state' }
    ]
  },
  {
    id: 'world-map', label: 'World Map', access: PUBLIC, icon: '⊞',
    summary: 'Where THYLORA reaches, and where the world arrives from.',
    capabilities: ['global-arrival-view'],
    reads: [
      { kind: 'table', name: 'thy_global_arrivals', status: 'HELD',
        select: 'arrival_code,region_label,country_code,latitude,longitude,arrivals,sessions,observed_on',
        order: 'arrivals.desc' }
    ]
  },
  {
    id: 'store', label: 'Store', access: PUBLIC, icon: '◇',
    summary: 'Cleared reports, stories and products. Only a cleared product receives a purchase button.',
    capabilities: ['purchase-report', 'purchase-story', 'purchase-product'],
    service: 'STOREFRONT',
    reads: [
      { kind: 'table', name: SERVICES.STOREFRONT.products, service: 'STOREFRONT', status: 'EXISTING',
        provisionedBy: 'COMMERCE',
        select: 'id,product_code,product_name,product_kind,price_minor,currency,release_state,purchasable',
        order: 'product_name.asc' }
    ],
    writes: [
      // The ONE checkout path. Ask Ersatz paid answers, reports, stories and
      // products all begin here; the shell implements no second checkout.
      { kind: 'rpc', name: 'begin_storefront_checkout_v1', service: 'STOREFRONT', status: 'HELD',
        provisionedBy: 'COMMERCE' }
    ]
  },
  {
    id: 'my-purchases', label: 'My Purchases', access: PUBLIC, icon: '▣',
    summary: 'What you own, and the serialized asset behind each one.',
    capabilities: ['view-serialized-asset'],
    service: 'STOREFRONT',
    requiresSession: true,
    reads: [
      { kind: 'table', name: SERVICES.STOREFRONT.orders, service: 'STOREFRONT', status: 'EXISTING',
        provisionedBy: 'COMMERCE',
        select: 'id,order_code,product_code,amount_minor,currency,order_state,created_at',
        order: 'created_at.desc' },
      { kind: 'table', name: SERVICES.STOREFRONT.entitlements, service: 'STOREFRONT', status: 'EXISTING',
        provisionedBy: 'COMMERCE',
        select: 'id,entitlement_code,product_code,entitlement_state,granted_at' },
      { kind: 'table', name: SERVICES.STOREFRONT.passports, service: 'STOREFRONT', status: 'EXISTING',
        provisionedBy: 'COMMERCE',
        select: 'passport_code,product_code,serial_number,issued_at,passport_state' }
    ]
  },
  {
    id: 'my-questions', label: 'My Questions', access: PUBLIC, icon: '◎',
    summary: 'The questions you asked Ersatz, and what came back.',
    capabilities: ['submit-question'],
    service: 'STOREFRONT',
    requiresSession: true,
    reads: [
      { kind: 'table', name: 'thy_ersatz_questions', status: 'HELD',
        select: 'question_code,question_text,answer_text,answer_label,question_state,asked_at',
        order: 'asked_at.desc' }
    ]
  },
  {
    id: 'people', label: 'People', access: PUBLIC, icon: '◍',
    summary: 'Reporters, correspondents and bureaus. Follow the ones you want to hear from.',
    capabilities: ['follow-reporter', 'follow-bureau'],
    reads: [
      { kind: 'table', name: 'thy_correspondents', status: 'HELD',
        select: 'correspondent_code,display_name,role_label,bureau_code,bureau_label,world_status,active_state',
        order: 'display_name.asc' },
      { kind: 'table', name: 'thy_follows', status: 'HELD',
        select: 'id,follow_code,subject_kind,subject_code,follow_state' }
    ]
  },
  {
    id: 'live-link', label: 'Live Link', access: PUBLIC, icon: '◈',
    summary: 'When THYLORA is live, this is the door.',
    capabilities: ['watch-transmission'],
    reads: [
      { kind: 'table', name: 'thy_live_sessions', status: 'HELD',
        select: 'session_code,title,live_state,language_code,started_at,scheduled_for',
        order: 'scheduled_for.desc' }
    ]
  },
  {
    id: 'chairman', label: 'Chairman', access: CHAIRMAN, icon: '★',
    summary: 'Chairman workspace. Voice command, readback, margin notes, sketch, markup, approvals, routing, money-distance, arrivals and the prompt coverage ledger.',
    capabilities: [
      'voice-command', 'readback', 'margin-notes', 'sketch-surface', 'markup',
      'approve-reject', 'route-to-department', 'money-distance-view',
      'global-arrival-analytics', 'prompt-coverage-ledger'
    ],
    service: 'CHAIRMAN_COMMAND',
    requiresSession: true,
    reads: [
      { kind: 'table', name: SERVICES.CHAIRMAN_COMMAND.departments, service: 'CHAIRMAN_COMMAND',
        status: 'EXISTING', provisionedBy: 'CHAIRMAN_SPINE',
        select: 'department_code,name,purpose,status,current_assignment,priority',
        order: 'priority.asc,name.asc' },
      { kind: 'table', name: 'thy_approvals', status: 'HELD',
        select: 'approval_code,subject_kind,subject_code,subject_title,approval_state,requested_at',
        order: 'requested_at.desc' },
      { kind: 'table', name: 'thy_prompt_ledger', status: 'HELD',
        select: 'prompt_code,prompt_text,coverage_state,delivered_state,department_code,received_at',
        order: 'received_at.desc' },
      { kind: 'table', name: 'thy_margin_notes', status: 'HELD',
        select: 'note_code,subject_kind,subject_code,note_text,note_state,created_at',
        order: 'created_at.desc' },
      { kind: 'table', name: 'thy_chairman_sketches', status: 'HELD',
        select: 'sketch_code,subject_kind,subject_code,sketch_title,stroke_count,sketch_state,created_at',
        order: 'created_at.desc' },
      // Revenue by arrival region, for the money-distance view. A view rather
      // than a table: it joins the existing storefront orders to arrival
      // points instead of copying order rows into this lane.
      { kind: 'view', name: 'thy_order_arrivals', status: 'HELD', service: 'STOREFRONT',
        select: 'order_code,amount_minor,currency,order_state,region_label,created_at',
        order: 'created_at.desc' },
      { kind: 'table', name: 'thy_global_arrivals', status: 'HELD',
        select: 'arrival_code,region_label,country_code,latitude,longitude,arrivals,sessions,observed_on',
        order: 'arrivals.desc' },
      // The declared THYLORA origin money-distance measures from. Absent means
      // ORIGIN_NOT_DECLARED; no origin is ever assumed.
      { kind: 'table', name: 'thy_origin', status: 'HELD',
        select: 'origin_code,label,latitude,longitude,origin_state', limit: 1 }
    ],
    writes: [
      // The SAME command RPC the authoritative dashboard uses.
      { kind: 'rpc', name: SERVICES.CHAIRMAN_COMMAND.submit, service: 'CHAIRMAN_COMMAND', status: 'EXISTING',
        provisionedBy: 'CHAIRMAN_SPINE' },
      { kind: 'table', name: 'thy_margin_notes', status: 'HELD' },
      { kind: 'table', name: 'thy_chairman_sketches', status: 'HELD' }
    ]
  }
]);

/* ----------------------------------------------------------------- helpers */
export const SECTION_IDS = Object.freeze(SECTIONS.map(s => s.id));
export const DEFAULT_SECTION = 'home';

export function section(id) {
  return SECTIONS.find(s => s.id === id) ?? null;
}

export function publicSections() {
  return SECTIONS.filter(s => s.access === PUBLIC);
}

export function chairmanSections() {
  return SECTIONS.filter(s => s.access === CHAIRMAN);
}

// Which lane is responsible for creating each object. "HELD" means "not on the
// live backend yet"; it does NOT mean "this lane will create it". An object
// held by another lane must not appear in db/thylora-app, or two lanes would be
// racing to define the same thing.
export const THIS_LANE = 'THYLORA_APP';
export const PROVISIONERS = Object.freeze([
  THIS_LANE,      // db/thylora-app
  'RAE_LINK',     // db/rae-link
  'COMMERCE',     // the existing approved storefront / checkout path
  'CHAIRMAN_SPINE', // the existing Chairman command RPC + department registry
  'PUBLIC_SITE'   // the existing public metrics RPC
]);

/** Every backend object the shell touches, deduplicated. */
export function backendContract() {
  const seen = new Map();
  for (const s of SECTIONS) {
    for (const ref of [...(s.reads ?? []), ...(s.writes ?? [])]) {
      const key = `${ref.kind}:${ref.name}`;
      if (!seen.has(key)) {
        seen.set(key, {
          kind: ref.kind,
          name: ref.name,
          status: ref.status,
          provisionedBy: ref.provisionedBy ?? THIS_LANE,
          sections: []
        });
      }
      seen.get(key).sections.push(s.id);
    }
  }
  return [...seen.values()];
}

/** Objects that must exist on the live backend before a section can serve. */
export function heldObjects() {
  return backendContract().filter(o => o.status === 'HELD');
}

/** Held objects this lane's own migrations are responsible for creating. */
export function heldByThisLane() {
  return heldObjects().filter(o => o.provisionedBy === THIS_LANE);
}

/** Held objects another lane must provision before this shell can serve them. */
export function heldByOtherLanes() {
  return heldObjects().filter(o => o.provisionedBy !== THIS_LANE);
}

export function existingObjects() {
  return backendContract().filter(o => o.status === 'EXISTING');
}
