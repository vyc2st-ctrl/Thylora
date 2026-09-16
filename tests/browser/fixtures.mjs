// THYLORA APP · browser proof fixtures
// Workroom: WR-THYAPP-001
//
// Stand-in responses shaped exactly like the canonical backend's, so the shell
// can be driven end to end without network access to thylora-dash. These are
// FIXTURES FOR A PROOF, not seed data: nothing here is written to any backend.

export const CHAIRMAN_COMMAND_RPC = 'submit_thylora_chairman_command_v1';

export const FIXTURES = {
  // RPCs ---------------------------------------------------------------
  'rpc/public_get_site_metrics': {
    totals: { page_opens: 48213, sessions: 12044, verified_units_sold: 37 }
  },
  [`rpc/${CHAIRMAN_COMMAND_RPC}`]: {
    command_code: 'THY-CMD-20260914-0001',
    routed_to: 'DEPT-SYSTEMS',
    continuity_checked: true,
    response: 'Command recorded and routed.'
  },
  'rpc/submit_ersatz_question_v1': [
    { question_code: 'ERS-Q-20260914-AB12CD34', question_state: 'SUBMITTED', asked_at: '2026-09-14T10:00:00Z' }
  ],

  // Public surfaces ----------------------------------------------------
  thy_transmissions: [
    { transmission_code: 'TX-0001', title: 'The Register at Ouidah', synopsis: 'What the 1871 port register recorded, and what it left out.', bureau_code: 'BUR-WEST-AFRICA', runtime_seconds: 2640, poster_state: 'READY', publish_state: 'PUBLISHED', published_at: '2026-09-10T08:00:00Z' },
    { transmission_code: 'TX-0002', title: 'Mirrors of EdereAriah', synopsis: 'A world-simulated companion piece.', bureau_code: 'BUR-WORLD', runtime_seconds: 1500, poster_state: 'READY', publish_state: 'PUBLISHED', published_at: '2026-09-12T08:00:00Z' }
  ],
  thy_transmission_tracks: [
    { transmission_code: 'TX-0001', language_code: 'en', language_label: 'English', track_kind: 'AUDIO', subtitle_language: 'en', track_state: 'PUBLISHED' },
    { transmission_code: 'TX-0001', language_code: 'yo', language_label: 'Yorùbá', track_kind: 'DUB', subtitle_language: 'en', track_state: 'PUBLISHED' },
    { transmission_code: 'TX-0001', language_code: 'fr', language_label: 'Français', track_kind: 'DUB', subtitle_language: 'en', track_state: 'PUBLISHED' },
    { transmission_code: 'TX-0002', language_code: 'en', language_label: 'English', track_kind: 'AUDIO', subtitle_language: 'en', track_state: 'PUBLISHED' }
  ],
  thy_earth_watch_signals: [
    { signal_code: 'EW-0001', headline: 'Port ledger digitised without provenance notes', earth_place: 'Ouidah, Benin', signal_class: 'ARCHIVE', confidence_state: 'DOCUMENTED', casefile_code: 'CF-0001', observed_at: '2026-09-13T09:00:00Z' },
    { signal_code: 'EW-0002', headline: 'Unverified lineage claim circulating', earth_place: 'London, United Kingdom', signal_class: 'CLAIM', confidence_state: 'CONTESTED', casefile_code: null, observed_at: '2026-09-11T09:00:00Z' }
  ],
  thy_casefiles: [
    { casefile_code: 'CF-0001', title: 'The Ouidah register', subject_summary: 'Primary port register, 1871.', confidence_state: 'DOCUMENTED', casefile_state: 'OPEN', opened_at: '2026-09-01T09:00:00Z' }
  ],
  thy_casefile_evidence: [
    { casefile_code: 'CF-0001', evidence_code: 'EV-0001', evidence_kind: 'DOCUMENT', source_label: 'National archive, folio 22', provenance_state: 'HELD_COPY', confidence_state: 'DOCUMENTED' },
    { casefile_code: 'CF-0001', evidence_code: 'EV-0002', evidence_kind: 'TESTIMONY', source_label: 'Oral account, recorded 1998', provenance_state: 'CITED', confidence_state: 'MEMORY_REPORTED' }
  ],
  rael_channels: [
    { id: 'ch-1', channel_code: 'EDR-001', display_name: 'Ariah of the Low Quarter', channel_class: 'EDEREARIAH_INHABITANT', world_status: 'WORLD_SIMULATED', simulated_disclosure: 'World-simulated inhabitant of EdereAriah. Not an Earth person.' }
  ],
  thy_correspondents: [
    { correspondent_code: 'CORR-ADEYEMI', display_name: 'A. Adeyemi', role_label: 'Chief correspondent', bureau_code: 'BUR-WEST-AFRICA', bureau_label: 'West Africa bureau', world_status: 'EARTH_REAL', active_state: 'ACTIVE' },
    { correspondent_code: 'CORR-VOSS', display_name: 'M. Voss', role_label: 'Archive correspondent', bureau_code: 'BUR-EUROPE', bureau_label: 'Europe bureau', world_status: 'EARTH_REAL', active_state: 'ACTIVE' }
  ],
  thy_live_sessions: [
    { session_code: 'LIVE-0001', title: 'Register findings, open desk', live_state: 'SCHEDULED', language_code: 'en', scheduled_for: '2026-09-20T18:00:00Z', started_at: null }
  ],
  thy_ersatz_questions: [
    { question_code: 'ERS-Q-20260901-11111111', question_text: 'Who signed the 1871 register?', answer_text: 'The signature matches the resident agent, on the balance of the held folios.', answer_label: 'ERSATZ_INTERPRETATION', question_state: 'ANSWERED', asked_at: '2026-09-01T10:00:00Z' }
  ],

  // Storefront (existing commerce path) --------------------------------
  products: [
    { id: 'p1', product_code: 'REP-0001', product_name: 'The Ouidah register: full report', product_kind: 'REPORT', price_minor: 1200, currency: 'USD', release_state: 'RELEASED', purchasable: true },
    { id: 'p2', product_code: 'STO-0001', product_name: 'Mirrors of EdereAriah: story', product_kind: 'STORY', price_minor: 500, currency: 'USD', release_state: 'IN_REVIEW', purchasable: false }
  ],
  orders: [
    { id: 'o1', order_code: 'ORD-0001', product_code: 'REP-0001', amount_minor: 1200, currency: 'USD', order_state: 'PAID', created_at: '2026-09-05T10:00:00Z' }
  ],
  entitlements: [
    { id: 'e1', entitlement_code: 'ENT-0001', product_code: 'REP-0001', entitlement_state: 'ACTIVE', granted_at: '2026-09-05T10:01:00Z' }
  ],
  digital_product_passports: [
    { passport_code: 'DPP-0001', product_code: 'REP-0001', serial_number: 'THY-REP-0001-000137', issued_at: '2026-09-05T10:01:00Z', passport_state: 'ISSUED' }
  ],

  // Chairman -----------------------------------------------------------
  thylora_departments: [
    { department_code: 'DEPT-SYSTEMS', name: 'Systems', purpose: 'Backend continuity and deployment authority.', status: 'ACTIVE', current_assignment: 'Shell continuity', priority: 'P0' },
    { department_code: 'DEPT-LEGAL', name: 'Legal', purpose: 'Rights, consent and provenance.', status: 'ACTIVE', current_assignment: 'Casefile review', priority: 'P1' }
  ],
  thy_approvals: [
    { approval_code: 'APR-0001', subject_kind: 'TRANSMISSION', subject_code: 'TX-0002', subject_title: 'Mirrors of EdereAriah', approval_state: 'PENDING', requested_at: '2026-09-13T12:00:00Z' }
  ],
  thy_prompt_ledger: [
    { prompt_code: 'PR-0001', prompt_text: 'Build the mobile app shell.', coverage_state: 'COVERED', delivered_state: 'DELIVERED', department_code: 'DEPT-SYSTEMS', received_at: '2026-09-14T08:00:00Z' },
    { prompt_code: 'PR-0002', prompt_text: 'Prove authenticated routing.', coverage_state: 'COVERED', delivered_state: 'PENDING', department_code: 'DEPT-SYSTEMS', received_at: '2026-09-14T08:05:00Z' },
    { prompt_code: 'PR-0003', prompt_text: 'Connect provider-side billing.', coverage_state: 'UNCOVERED', delivered_state: 'PENDING', department_code: 'DEPT-LEGAL', received_at: '2026-09-14T08:10:00Z' },
    { prompt_code: 'PR-0004', prompt_text: 'Language tracks for every transmission.', coverage_state: 'PARTIAL', delivered_state: 'PENDING', department_code: 'DEPT-SYSTEMS', received_at: '2026-09-14T08:15:00Z' }
  ],
  thy_margin_notes: [
    { note_code: 'THY-NOTE-20260913-AAAA1111', subject_kind: 'TRANSMISSION', subject_code: 'TX-0001', note_text: 'Check the folio numbering against the second copy.', note_state: 'ACTIVE', created_at: '2026-09-13T13:00:00Z' }
  ],
  thy_chairman_sketches: [],
  thy_global_arrivals: [
    { arrival_code: 'AR-1', region_label: 'Lagos', country_code: 'NG', latitude: 6.52, longitude: 3.38, arrivals: 4210, sessions: 5200, observed_on: '2026-09-13' },
    { arrival_code: 'AR-2', region_label: 'London', country_code: 'GB', latitude: 51.5, longitude: -0.12, arrivals: 3110, sessions: 3900, observed_on: '2026-09-13' },
    { arrival_code: 'AR-3', region_label: 'Atlanta', country_code: 'US', latitude: 33.75, longitude: -84.39, arrivals: 2480, sessions: 3010, observed_on: '2026-09-13' },
    // A row with no usable coordinate: it must count in arrivals but never be
    // plotted on the map as if it had been measured.
    { arrival_code: 'AR-4', region_label: 'Unrecorded', country_code: null, latitude: null, longitude: null, arrivals: 190, sessions: 240, observed_on: '2026-09-13' }
  ],
  thy_order_arrivals: [
    { order_code: 'ORD-0001', amount_minor: 1200, currency: 'USD', order_state: 'PAID', region_label: 'Lagos', created_at: '2026-09-05T10:00:00Z' },
    { order_code: 'ORD-0002', amount_minor: 4800, currency: 'USD', order_state: 'PAID', region_label: 'London', created_at: '2026-09-06T10:00:00Z' },
    { order_code: 'ORD-0003', amount_minor: 900, currency: 'USD', order_state: 'REFUNDED', region_label: 'London', created_at: '2026-09-07T10:00:00Z' }
  ],
  thy_origin: [
    { origin_code: 'ORIGIN-ATL', label: 'Atlanta', latitude: 33.75, longitude: -84.39, origin_state: 'ACTIVE' }
  ]
};

/** PostgREST's shape for "this table has not been migrated yet". */
export const NOT_PROVISIONED = {
  status: 404,
  body: {
    code: 'PGRST205',
    message: 'Could not find the table in the schema cache',
    hint: null, details: null
  }
};

/** Tables deliberately withheld, to prove honest degradation on screen. */
export const WITHHELD = new Set(['thy_follows']);

/* ---------------------------------------------------- Media Studio (Chairman) */
// The registered asset, its master rendition, provenance, rights and passport —
// all read from the objects that already exist, plus this lane's job/markup rows.
FIXTURES.rael_media_assets = [
  {
    id: 'asset-1', asset_code: 'RAEL-ASSET-0001', title: 'Ouidah plate 12',
    description: 'Master plate, 1871 port register.', media_kind: 'IMAGE',
    pipeline_state: 'METADATA', visibility_state: 'PRIVATE',
    version_no: 2, replaces_asset_id: 'asset-0',
    checksum_sha256: 'b'.repeat(64),
    storage_provider: 'supabase-storage', storage_key: 'media/ouidah-12.jpg',
    product_ref: 'REP-0001', passport_ref: 'DPP-0001', edf_ref: 'EDF-OUIDAH-001',
    published_at: null, created_at: '2026-09-10T08:00:00Z'
  },
  {
    // Deliberately unbound: no passport, so the studio must block animation.
    id: 'asset-2', asset_code: 'RAEL-ASSET-0002', title: 'Unbound sketch',
    description: null, media_kind: 'IMAGE', pipeline_state: 'INPUT',
    visibility_state: 'PRIVATE', version_no: 1, replaces_asset_id: null,
    checksum_sha256: null, storage_provider: null, storage_key: null,
    product_ref: null, passport_ref: null, edf_ref: null,
    published_at: null, created_at: '2026-09-11T08:00:00Z'
  }
];

FIXTURES.rael_media_renditions = [
  // A resolvable URL so a real frame appears and can be marked up.
  { asset_id: 'asset-1', rendition_kind: 'POSTER', rendition_state: 'READY',
    storage_key: 'https://cdn.example.test/ouidah-12-poster.jpg', width: 1600, height: 900 }
];

FIXTURES.rael_provenance_events = [
  { asset_id: 'asset-1', event_type: 'DERIVED', source_description: 'Scanned from the held folio.',
    derived_from_ref: 'RAEL-ASSET-0000', tool_disclosure: 'flatbed scan',
    occurred_at: '2026-09-09T08:00:00Z', evidence: {} }
];

FIXTURES.rael_rights_records = [
  { asset_id: 'asset-1', gate_state: 'PASSED', ownership_basis: 'OWNED_OUTRIGHT', term_end: null }
];

FIXTURES.thy_media_release_requirements = [
  { asset_code: 'RAEL-ASSET-0001', logo_required: true, logo_asset_ref: 'LOGO-THY-001',
    qr_destination_required: true, serial_binding_required: true, requirements_state: 'DECLARED' }
];

FIXTURES.thy_media_animation_jobs = [];
FIXTURES.thy_media_markups = [];

// The passport carries the serial number AND the QR destination.
FIXTURES.digital_product_passports = [
  { passport_code: 'DPP-0001', product_code: 'REP-0001',
    serial_number: 'THY-REP-0001-000137',
    qr_destination: 'https://thylora.example.test/p/THY-REP-0001-000137',
    issued_at: '2026-09-05T10:01:00Z', passport_state: 'ISSUED' }
];

/* ------------------------------------------------- canonical Chairman spine */
FIXTURES['rpc/thylora_approval_queue_safe_v1'] = {
  allowed: true,
  gates: [
    { canonical_id: 'GATE-MEDIA-001', subject_kind: 'MEDIA', subject_title: 'Ouidah plate 12 animation',
      gate_state: 'OPEN' }
  ]
};

FIXTURES['rpc/thylora_margin_queue_v1'] = {
  allowed: true,
  notes: [
    { anchor_kind: 'SCREEN_COMPONENT', anchor_ref: 'thylora-app#chairman',
      body: 'Check the folio numbering against the second copy.',
      created_at: '2026-09-13T13:00:00Z', disposition: null }
  ]
};

FIXTURES['rpc/thylora_margin_note_add_v1'] = { added: true, queue_depth: 4 };

FIXTURES['rpc/submit_thylora_review_gate_decision_v1'] = {
  decision: 'APPROVED', resulting_state: 'CLOSED', gate_reopened: false
};

FIXTURES['rpc/thylora_edf_release_board_v1'] = { allowed: true, packages: [] };
FIXTURES['rpc/thylora_edf_publish_v1'] = { state: 'PUBLISHED', frozen: true };

/* --------------------------------------------------- the Media Router itself */
// Keyed by Edge Function name. The proof swaps this per test to prove the
// no-claim rule: a success with no asset must NOT read as a generation.
export const ROUTER_RESPONSES = {
  // A real, usable result.
  SUCCESS_WITH_ASSET: {
    status: 'SUCCEEDED',
    model: 'thylora-anim-v2',
    asset_url: 'https://cdn.example.test/out/ouidah-12-animated.mp4',
    mime_type: 'video/mp4',
    http_status: 200,
    latency_ms: 8420,
    audit_canonical_id: 'THY-AI-ROUTE-20260915-0001',
    review_gate_canonical_id: 'GATE-MEDIA-001'
  },
  // The dangerous case: 200 OK, SUCCEEDED, and nothing to show.
  SUCCESS_NO_ASSET: {
    status: 'SUCCEEDED',
    model: 'thylora-anim-v2',
    http_status: 200,
    latency_ms: 300,
    audit_canonical_id: 'THY-AI-ROUTE-20260915-0002'
  },
  // An explicit provider refusal.
  FAILED: {
    status: 'FAILED',
    failure_reason: 'Provider refused the request: animation quota exhausted.',
    http_status: 429,
    audit_canonical_id: 'THY-AI-ROUTE-20260915-0003'
  },
  // Accepted and still working.
  RUNNING: {
    status: 'RUNNING',
    model: 'thylora-anim-v2',
    audit_canonical_id: 'THY-AI-ROUTE-20260915-0004'
  }
};
