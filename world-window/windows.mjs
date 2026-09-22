// WORLD SERIES · THREE WINDOWS · PREPARED, NOT GENERATED
//
// Work code: THY-WORK-WORLD-SERIES-584
//
// Each packet below is a production brief and a gate record. Nothing here is a
// produced window. No image was generated, requested or described for generation
// in authoring this file, and the module imports no generation capability.
//
// Every criterion carries the evidence that settles it or the authority that
// holds it. A criterion is PASS only when this session could verify it from
// committed source. Where the settling evidence lives in the backend at
// sequence 584 — unreachable from this session, 403 on CONNECT — the criterion
// is HELD and names the read that would clear it. HELD scores zero.

import { STATES } from './ww.mjs';

const { PASS, HELD, FAIL } = STATES;

// Provenance anchor verified in this session.
// Repository vyc2st-ctrl/thylora-executive-dashboard @ a634249
//   app/assets/thylora-handluh-castle.jpg
//   sha256 6f0fd858e7649e8079e6572d53b94306a2c202fc12fbcf860d15c93d907d689c
//   8,144 bytes · committed 2026-09-19T17:51:41Z
// Described in committed source as the Chairman-approved living-art castle
// environment: app/build8-visual-floor.js:39 and app/thylora-forward.js:18.
export const CASTLE_ANCHOR = Object.freeze({
  repo: 'vyc2st-ctrl/thylora-executive-dashboard',
  commit: 'a634249aa9cd5e6cac29ebc0de45c913c7041bcb',
  path: 'app/assets/thylora-handluh-castle.jpg',
  sha256: '6f0fd858e7649e8079e6572d53b94306a2c202fc12fbcf860d15c93d907d689c',
  bytes: 8144,
  committed_at: '2026-09-19T17:51:41Z',
  attested_as: 'THEHANDLUH · Chairman-approved living-art castle environment',
  attested_by: 'app/build8-visual-floor.js:39 · app/thylora-forward.js:18',
});

// ---------------------------------------------------------------------------
// 1 · ROYAL KITCHEN WORLD WINDOW
// ---------------------------------------------------------------------------

export const ROYAL_KITCHEN = Object.freeze({
  window_code: 'WW-584-001-ROYAL-KITCHEN',
  title: 'Royal Kitchen world window',
  series: 'WORLD SERIES 584',
  world: 'EdereAriah',
  classification: 'WORLD_SIMULATED',
  disclosure_required: true,
  disclosure_text: 'Simulated world media from EdereAriah. Not an Earth place, not an Earth person.',

  brief: {
    subject: 'Interior working kitchen of a royal house in EdereAriah.',
    vantage: 'Interior, working height, from the service side rather than the dining side.',
    time_of_day: 'UNKNOWN — not set by any reachable record.',
    people_in_frame: 'UNKNOWN — see criterion P2. No person may be placed until the person registry is read.',
    continuity_with: 'CASTLE EXTERIOR / ERC MIRROR WINDOW — the two must agree on house, period and materials.',
  },

  qyris: {
    question: 'Can a royal kitchen interior be produced for EdereAriah from what THYLORA already holds?',
    yield: 'A produced kitchen interior would become reference for every later interior in the same house. If it is invented rather than sourced, every later window inherits the invention.',
    reason: 'This is the first interior in the series. An interior sets materials, light and scale for the house; the exterior cannot correct it afterwards.',
    inspect: {
      known: 'The world is EdereAriah and is classified WORLD_SIMULATED with a mandatory disclosure of at least 12 characters (db/rae-link/0001_identity_channels.sql:82, docs/RAE-LINK-ARCHITECTURE.md:81). No approved kitchen reference asset exists in either reachable repository.',
      unknown: 'Whether an approved royal-kitchen reference, a house style record, or a named royal household exists in the backend at sequence 584.',
      next_step: 'Read thylora_world_entities and thylora_world_infrastructure_blueprints on thylora-dash for an approved royal-house record and any bound kitchen reference. That is one read, and it settles P1, P2 and X1 together.',
      state: 'HELD_PENDING_BACKEND_READ',
    },
    safeguard: 'No person may be depicted until the world person registry is read; an unsourced figure in a royal kitchen reads as a servant and would author a social claim about EdereAriah that no record supports. Disclosure text is fixed on the packet so the window cannot ship unlabelled.',
  },

  factors: {
    C: [
      { code: 'C1_NO_FLOOR_MOVED', state: PASS,
        detail: 'Producing this window changes no floor. It touches no dashboard file, no baseline capability and no authority lock.',
        evidence: 'DASHBOARD_AUTHORITY.md · dashboard-baseline.json unchanged by this delta.',
        route: null },
      { code: 'C2_LANE_REGISTERED', state: PASS,
        detail: 'The lane exists: WORLD_BUILDINGS, lane_order 8, source of truth thylora_world_entities + thylora_world_infrastructure_blueprints.',
        evidence: 'thylora-executive-dashboard db/0001_control_surface.sql, lane WORLD_BUILDINGS.',
        route: null },
    ],
    P: [
      { code: 'P1_NO_APPROVED_REFERENCE', state: HELD,
        detail: 'No approved royal-kitchen reference asset exists in either reachable repository. The only approved world imagery found is the castle exterior anchor.',
        evidence: 'Full file sweep of vyc2st-ctrl/Thylora @ HEAD and vyc2st-ctrl/thylora-executive-dashboard @ a634249: one image asset, the castle.',
        route: 'Read thylora_world_infrastructure_blueprints for a bound kitchen reference, or the Chairman supplies one.' },
      { code: 'P2_NO_PERSON_SOURCE', state: HELD,
        detail: 'No person may be placed in frame. The world person registry was not readable, so any figure would be invented.',
        evidence: 'Lane PEOPLE names thylora_person_life_registry as its source; the host is unreachable (403 on CONNECT, 2026-09-22T04:07:20Z).',
        route: 'Read thylora_person_life_registry, or produce the window unpeopled and record that as a deliberate choice.' },
    ],
    I: [
      { code: 'I1_WORLD_CLASS_DECLARED', state: PASS,
        detail: 'Packet declares classification WORLD_SIMULATED and carries disclosure text of 78 characters, above the 12-character minimum.',
        evidence: 'db/rae-link/0001_identity_channels.sql:82 · docs/RAE-LINK-ARCHITECTURE.md:81.',
        route: null },
      { code: 'I2_NO_EARTH_PERSON_IMPLIED', state: PASS,
        detail: 'No Earth person, likeness or identifiable Earth place appears in the brief.',
        evidence: 'Brief names EdereAriah only; people_in_frame is UNKNOWN and blocked by P2.',
        route: null },
    ],
    T: [
      { code: 'T1_UNKNOWNS_NAMED', state: PASS,
        detail: 'Time of day and people in frame are carried as UNKNOWN rather than filled in.',
        evidence: 'brief.time_of_day and brief.people_in_frame both read UNKNOWN.',
        route: null },
      { code: 'T2_NO_PRODUCTION_CLAIM', state: PASS,
        detail: 'Packet claims preparation only. No window is asserted to exist.',
        evidence: 'This module contains no generation call and produces no asset.',
        route: null },
    ],
    B: [
      { code: 'B1_NO_EARTH_RIGHTS_EXPOSURE', state: PASS,
        detail: 'A wholly simulated EdereAriah interior engages no Earth likeness, property or trademark right.',
        evidence: 'rae-link/lib/rights.js channel-class model: WORLD_SIMULATED carries no Earth-person consent requirement.',
        route: null },
      { code: 'B2_NO_PRIVACY_SURFACE', state: PASS,
        detail: 'No location precision, no medical detail, no Earth personal data is carried by this packet.',
        evidence: 'docs/RAE-LINK-RIGHTS-PRIVACY.md — no such field exists to populate.',
        route: null },
    ],
    X: [
      { code: 'X1_BACKEND_READ_MISSING', state: HELD,
        detail: 'The one prerequisite this session could not supply is the backend read that would settle P1 and P2.',
        evidence: 'jvsdxhrfhtlgaknhjxlz.supabase.co:443 — 403 on CONNECT from the egress proxy, 2026-09-22T04:07:20Z.',
        route: 'A session with egress to the backend host, or a Chairman-run read.' },
      { code: 'X2_RELEASE_AUTHORITY', state: HELD,
        detail: 'Production of world imagery is a release action. This session holds no release authority and did not take one.',
        evidence: 'Chairman release requirement carried on this run.',
        route: 'Chairman release.' },
    ],
  },
});

// ---------------------------------------------------------------------------
// 2 · CASTLE EXTERIOR / ERC MIRROR WINDOW
// ---------------------------------------------------------------------------

export const CASTLE_ERC_MIRROR = Object.freeze({
  window_code: 'WW-584-002-CASTLE-ERC-MIRROR',
  title: 'Castle exterior / ERC mirror window',
  series: 'WORLD SERIES 584',
  world: 'EdereAriah',
  classification: 'WORLD_SIMULATED',
  disclosure_required: true,
  disclosure_text: 'Simulated world media from EdereAriah. Not an Earth place, not an Earth person.',

  brief: {
    subject: 'Castle exterior, held in continuity with the approved THEHANDLUH living-art environment.',
    vantage: 'Exterior, approach side, matching the approved anchor rather than reinterpreting it.',
    anchor: CASTLE_ANCHOR,
    mirror_semantics: 'UNKNOWN — see criterion T3. "ERC" is not expanded by any reachable record.',
    continuity_with: 'ROYAL KITCHEN WORLD WINDOW — same house, same period, same materials.',
  },

  qyris: {
    question: 'Can the castle exterior be produced as an ERC mirror when ERC is not expanded anywhere this session can read?',
    yield: 'The castle half is the strongest-sourced element in the whole series — there is an approved, hashed anchor for it. The mirror half is unsourced. Producing the pair as one window would let the sourced half carry the unsourced half.',
    reason: 'A mirror window asserts a relationship between two things. Asserting a relationship whose second term is undefined is the exact failure the truth rule exists to stop.',
    inspect: {
      known: 'The castle anchor is verified: sha256 6f0fd858e7649e8079e6572d53b94306a2c202fc12fbcf860d15c93d907d689c, 8,144 bytes, committed 2026-09-19T17:51:41Z, attested in committed source as the Chairman-approved living-art castle environment. In reachable source "ERC" resolves only to the ERSATZREALITY room family (app/index-v8.html:17, "ERSATZREALITY BUSINESS FACTORY"); no record expands ERC itself.',
      unknown: 'What ERC names at sequence 584, and what a mirror window is required to mirror.',
      next_step: 'Read the backend for the ERC record and for any mirror-window specification. If ERC is confirmed as the ERSATZREALITY surface, the mirror term becomes definable and T3 clears; the castle half can then be produced against a defined pair.',
      state: 'HELD_PENDING_DEFINITION',
    },
    safeguard: 'The castle half and the mirror half are kept separable in this packet so that a later session cannot inherit a definition for ERC that this session guessed. The anchor hash is recorded so drift in the approved asset is detectable rather than silent.',
  },

  factors: {
    C: [
      { code: 'C1_NO_FLOOR_MOVED', state: PASS,
        detail: 'No floor, lock or baseline capability is touched by producing this window.',
        evidence: 'DASHBOARD_AUTHORITY.md · dashboard-baseline.json unchanged by this delta.',
        route: null },
      { code: 'C2_ANCHOR_UNCHANGED', state: PASS,
        detail: 'The approved anchor is recorded by hash, so a later change to it is detectable and cannot pass as the same approval.',
        evidence: 'CASTLE_ANCHOR.sha256 recorded and asserted in tests/world-window.test.mjs.',
        route: null },
    ],
    P: [
      { code: 'P1_CASTLE_ANCHOR_VERIFIED', state: PASS,
        detail: 'The castle element traces to an approved asset verified by hash in this session.',
        evidence: `${CASTLE_ANCHOR.repo}@${CASTLE_ANCHOR.commit.slice(0, 7)} ${CASTLE_ANCHOR.path} · sha256 ${CASTLE_ANCHOR.sha256}`,
        route: null },
      { code: 'P2_MIRROR_TERM_UNSOURCED', state: HELD,
        detail: 'The ERC mirror element traces to nothing. No reachable record defines it.',
        evidence: 'Full-text sweep of both repositories and all 51 commits of vyc2st-ctrl/Thylora: ERC appears only inside the word ERSATZREALITY.',
        route: 'Read the ERC record in the backend, or the Chairman states what ERC expands to.' },
    ],
    I: [
      { code: 'I1_WORLD_CLASS_DECLARED', state: PASS,
        detail: 'Packet declares WORLD_SIMULATED with disclosure above the minimum length.',
        evidence: 'db/rae-link/0001_identity_channels.sql:82.',
        route: null },
      { code: 'I2_ANCHOR_IS_WORLD_ART', state: PASS,
        detail: 'The anchor is attested as living-art world environment, not an Earth photograph, so no Earth place is implied.',
        evidence: 'app/build8-visual-floor.js:39 — "Chairman-approved living-art castle environment".',
        route: null },
    ],
    T: [
      { code: 'T1_ANCHOR_CLAIM_EVIDENCED', state: PASS,
        detail: 'Every claim made about the anchor is carried by a hash, a byte count and a commit timestamp.',
        evidence: 'Verified in session 2026-09-22.',
        route: null },
      { code: 'T2_NO_DIMENSION_CLAIM', state: PASS,
        detail: 'No claim is made about the anchor\'s pixel dimensions; the JPEG frame header did not parse in this session and the figure is left unstated rather than estimated.',
        evidence: 'Parse attempted 2026-09-22; no SOF segment read. Byte count only is claimed.',
        route: null },
      { code: 'T3_ERC_UNDEFINED', state: HELD,
        detail: 'ERC is undefined in all reachable source. The window cannot assert a mirror relationship whose second term is unknown.',
        evidence: 'Sweep result above.',
        route: 'Backend read, or a Chairman definition. Until then this window may be produced as castle-exterior-only, with the mirror half deferred.' },
    ],
    B: [
      { code: 'B1_NO_EARTH_RIGHTS_EXPOSURE', state: PASS,
        detail: 'Simulated world architecture engages no Earth property or likeness right.',
        evidence: 'rae-link/lib/rights.js channel-class model.',
        route: null },
      { code: 'B2_ANCHOR_REUSE_IS_INTERNAL', state: PASS,
        detail: 'The anchor is THYLORA-owned and already carried in a THYLORA surface, so reuse opens no third-party licence question.',
        evidence: 'app/sw.js caches it as a first-party app asset.',
        route: null },
    ],
    X: [
      { code: 'X1_DEFINITION_MISSING', state: HELD,
        detail: 'The missing prerequisite is a definition, not a file. This session could not supply it without inventing it.',
        evidence: 'ERC unresolved.',
        route: 'Backend read or Chairman definition.' },
      { code: 'X2_RELEASE_AUTHORITY', state: HELD,
        detail: 'Production is a release action and this session holds no release authority.',
        evidence: 'Chairman release requirement carried on this run.',
        route: 'Chairman release.' },
    ],
  },
});

// ---------------------------------------------------------------------------
// 3 · NEW YORK OFFICE FROM A DISTANCE
// ---------------------------------------------------------------------------

export const NEW_YORK_OFFICE = Object.freeze({
  window_code: 'WW-584-003-NEW-YORK-OFFICE-DISTANCE',
  title: 'New York office from a distance',
  series: 'WORLD SERIES 584',
  world: 'UNRESOLVED — Earth or EdereAriah, see criterion I3',
  classification: 'UNRESOLVED',
  disclosure_required: 'CONDITIONAL — required if and only if the window resolves to WORLD_SIMULATED',
  disclosure_text: null,

  brief: {
    subject: 'A THYLORA office in New York, seen from a distance.',
    vantage: 'Distant. Distance is the whole point of the brief: the building reads as a place in a skyline, not as an address.',
    earth_or_world: 'UNRESOLVED — this is the window\'s controlling question, not a detail.',
    tenancy: 'UNKNOWN — no record of a THYLORA New York office, leased, owned or planned, exists in reachable source.',
    continuity_with: 'None. This window sits outside the EdereAriah house series.',
  },

  qyris: {
    question: 'Is the New York office an Earth place or an EdereAriah place, and does THYLORA hold one at all?',
    yield: 'A distant skyline view is the most deniable kind of image and therefore the most dangerous one. At distance, a real New York building and an invented one look alike — which means an invented office can be mistaken for a real corporate holding, and a real building can be depicted as THYLORA property without any right to it.',
    reason: 'Every other window in this series is explicitly EdereAriah. This one names an Earth city. That single difference changes which rule set applies: Earth places carry property, trademark and location-truth exposure that WORLD_SIMULATED places do not.',
    inspect: {
      known: 'No record of a THYLORA New York office exists in either reachable repository. The identity model requires every channel and asset to declare EARTH_REAL or WORLD_SIMULATED, and forbids world material being presented as Earth material (db/rae-link/0001_identity_channels.sql:82). The distinction is enforced by a database constraint, not a convention.',
      unknown: 'Whether a THYLORA New York office exists as an Earth fact; whether an EdereAriah analogue exists; which of the two the Chairman means.',
      next_step: 'A single Chairman answer — Earth or EdereAriah — resolves I3, B3 and X1 at once. No backend read can substitute for it, because if the office is an Earth fact the record may be outside the backend entirely.',
      state: 'HELD_PENDING_CHAIRMAN_CLASSIFICATION',
    },
    safeguard: 'The packet refuses to default. Defaulting to EdereAriah would quietly invent a world building; defaulting to Earth would quietly assert a corporate holding THYLORA may not have. Both defaults are refused and the question is raised instead. If the answer is Earth, a further gate applies before any real building may be depicted as a THYLORA office.',
  },

  factors: {
    C: [
      { code: 'C1_NO_FLOOR_MOVED', state: PASS,
        detail: 'No floor, lock or baseline capability is touched.',
        evidence: 'DASHBOARD_AUTHORITY.md · dashboard-baseline.json unchanged by this delta.',
        route: null },
      { code: 'C2_LANE_AMBIGUOUS', state: HELD,
        detail: 'The window cannot be bound to a lane until it is classified. WORLD_BUILDINGS takes world places; an Earth office belongs elsewhere.',
        evidence: 'Lane registry in thylora-executive-dashboard db/0001_control_surface.sql.',
        route: 'Classify the window, then bind the lane.' },
    ],
    P: [
      { code: 'P1_NO_OFFICE_RECORD', state: HELD,
        detail: 'No record of a THYLORA New York office exists in reachable source, in either repository or in any of the 51 commits swept.',
        evidence: 'Full-text sweep, 2026-09-22.',
        route: 'Chairman states whether the office exists and in which world.' },
      { code: 'P2_NO_BUILDING_REFERENCE', state: HELD,
        detail: 'No approved building reference exists for this subject.',
        evidence: 'Only one image asset exists across both repositories, and it is the castle.',
        route: 'Supply or read an approved reference after classification.' },
    ],
    I: [
      { code: 'I1_NO_DISCLOSURE_POSSIBLE_YET', state: HELD,
        detail: 'Disclosure text cannot be written before classification: the wrong disclosure is worse than none, because it asserts a world status that may be false.',
        evidence: 'Disclosure is mandatory for WORLD_SIMULATED and wrong for EARTH_REAL.',
        route: 'Classify first.' },
      { code: 'I3_EARTH_WORLD_UNRESOLVED', state: HELD,
        detail: 'The controlling question. Earth or EdereAriah is undetermined, and the constraint that separates them is enforced in the database.',
        evidence: 'db/rae-link/0001_identity_channels.sql:82 world-truth constraint.',
        route: 'One Chairman answer.' },
    ],
    T: [
      { code: 'T1_UNKNOWNS_NAMED', state: PASS,
        detail: 'Tenancy and classification are carried as UNRESOLVED rather than filled in, and the packet says so in the brief itself.',
        evidence: 'brief.earth_or_world and brief.tenancy.',
        route: null },
      { code: 'T2_NO_HOLDING_CLAIM', state: PASS,
        detail: 'The packet makes no claim that THYLORA holds a New York office.',
        evidence: 'tenancy reads UNKNOWN.',
        route: null },
    ],
    B: [
      { code: 'B3_EARTH_PROPERTY_EXPOSURE', state: HELD,
        detail: 'If the window resolves to Earth, depicting an identifiable real building as a THYLORA office engages property and trademark exposure that no gate in this repository currently covers.',
        evidence: 'No Earth-building rights gate exists in db/rae-link/0003_rights_provenance_consent.sql; the rights model covers persons and media, not third-party real property.',
        route: 'If Earth: author the Earth-building rights gate before production. If EdereAriah: this criterion does not apply and is withdrawn rather than passed.' },
      { code: 'B4_NO_PRIVACY_SURFACE', state: PASS,
        detail: 'A distant view carries no precise location, no person and no personal data.',
        evidence: 'docs/RAE-LINK-RIGHTS-PRIVACY.md — no such field is populated.',
        route: null },
    ],
    X: [
      { code: 'X1_CLASSIFICATION_MISSING', state: HELD,
        detail: 'The missing prerequisite is a Chairman answer this session had no standing to give.',
        evidence: 'Classification unresolved.',
        route: 'Chairman decision D3 in the morning packet.' },
      { code: 'X2_RELEASE_AUTHORITY', state: HELD,
        detail: 'Production is a release action and this session holds no release authority.',
        evidence: 'Chairman release requirement carried on this run.',
        route: 'Chairman release.' },
    ],
  },
});

export const SERIES = Object.freeze([ROYAL_KITCHEN, CASTLE_ERC_MIRROR, NEW_YORK_OFFICE]);

export default SERIES;
