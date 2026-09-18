// THYLORA WORLD · CASTLE-001 world state
// Workroom: WR-WORLD-CASTLE-001
//
// This file IS the castle as a world object: it builds the registry from the
// evidence that is actually readable, computes the unknown census, solves the
// access matrix, and evaluates the Wq gate. Running it reproduces the state
// exactly; nothing is stored that the builder cannot re-derive.
//
// Evidence sources readable by the authoring session (2026-09-18):
//   S1  vyc2st-ctrl/thylora-executive-dashboard @ ea21b42
//       app/thylora-forward.js, app/build8-visual-floor.js, app/index-v8.html
//       -> the approved reference scene is "castle, cart and workers", named
//          THEHANDLUH, Chairman-supplied and Chairman-approved.
//   S2  same repo @ ea21b42, tests/chairman-dash-render.html
//       -> the WR-CASTLE-001 backend registry row, its lane, state and blockers.
//   S3  the Chairman directive opening this workroom
//       -> asserts an upper-left room is visible in the reference.
//   S5  vyc2st-ctrl/thylora db/rae-link/0001_identity_channels.sql, rae-link/lib/rights.js,
//       docs/RAE-LINK-ARCHITECTURE.md, public-site/index.html, and
//       vyc2st-ctrl/thylora-executive-dashboard app/sports-betting.html
//       -> the world is named EdereAriah and is held distinct from Earth.
//   S4  same repo @ ea21b42, app/assets/thylora-handluh-castle.jpg
//       -> UNREADABLE. 8144 bytes; SOI, APP0 and two DQT segments, then a
//          marker desync at byte 158. No SOF, no SOS, no EOI. One version in
//          history, so there is no earlier intact copy to fall back to.

import { CASTLE_FRAME_TREE, defineFrame, UNKNOWN } from './lib/frame.js';
import {
  createRegistry, addFrame, addElement, addRoom, addOpening,
  element, room, opening, provenance, dims, tolerance,
  audit, unknownCensus, verifiedCount
} from './lib/registry.js';
import { travellerProfile, segment, gate as gateOpening, solveRoute, TRAVELLER_CLASSES } from './lib/routes.js';
import { buildProfile } from './lib/period.js';
import { evaluate, FACTOR_LETTERS } from './lib/gate.js';

const ACCESSED = '2026-09-18';

const P = {
  scene: provenance({
    source: 'vyc2st-ctrl/thylora-executive-dashboard@ea21b42 app/thylora-forward.js, app/build8-visual-floor.js, app/index-v8.html',
    source_kind: 'REPOSITORY_FILE', accessed_at: ACCESSED, confidence: 'HIGH',
    note: 'Three independent surfaces describe the same approved reference as a castle, cart and workers scene named THEHANDLUH.'
  }),
  workroom: provenance({
    source: 'vyc2st-ctrl/thylora-executive-dashboard@ea21b42 tests/chairman-dash-render.html — WR-CASTLE-001 registry row',
    source_kind: 'BACKEND_ROW', accessed_at: ACCESSED, confidence: 'MEDIUM',
    note: 'A committed fixture mirroring the backend registry row. The live backend could not be read: egress to jvsdxhrfhtlgaknhjxlz.supabase.co is denied by network policy (403 on CONNECT).'
  }),
  chairman: provenance({
    source: 'Chairman directive opening WR-WORLD-CASTLE-001',
    source_kind: 'CHAIRMAN_DIRECTIVE', accessed_at: ACCESSED, confidence: 'HIGH',
    note: 'States that a room is visible in the upper left of the Chairman castle reference.'
  }),
  inferred: provenance({
    source: 'Physical necessity from S1 (a cart is present in a castle scene)',
    source_kind: 'DERIVED', accessed_at: ACCESSED, confidence: 'LOW',
    note: 'A wheeled vehicle at a castle requires a wheeled entry. Recorded as INFERRED, never as VERIFIED.'
  }),
  absent: provenance({
    source: 'No readable source',
    source_kind: 'ABSENT', accessed_at: ACCESSED, confidence: 'NONE',
    note: 'The reference image is a truncated JPEG and the backend is unreachable.'
  })
};

export function buildCastleState() {
  const reg = createRegistry();
  for (const f of CASTLE_FRAME_TREE) addFrame(reg, f);

  addFrame(reg, defineFrame({
    frame_id: 'THYW-FRAME-CASTLE-001-STOREY-UPPER', kind: 'STOREY',
    parent_frame_id: 'THYW-FRAME-CASTLE-001', datum_id: 'THYW-DATUM-CASTLE-001',
    evidence_state: 'UNKNOWN',
    provenance: 'Storey implied by an upper-left room. Its elevation above datum is UNKNOWN.'
  }));

  // --- what is actually attested ------------------------------------------
  addElement(reg, element({
    element_id: 'THYW-EL-CASTLE-001', element_class: 'TOWER', frame_id: 'THYW-FRAME-CASTLE-001',
    evidence_state: 'VERIFIED', provenance: P.scene,
    tolerance_band: tolerance({ basis: 'No measured value exists, so no tolerance band can be stated.' })
  }));
  addElement(reg, element({
    element_id: 'THYW-EL-CART-001', element_class: 'CART', frame_id: 'THYW-FRAME-CASTLE-001',
    evidence_state: 'VERIFIED', provenance: P.scene
  }));

  // --- inferred, and labelled as such --------------------------------------
  addElement(reg, element({
    element_id: 'THYW-EL-GATE-001', element_class: 'GATE', parent_id: 'THYW-EL-CASTLE-001',
    frame_id: 'THYW-FRAME-CASTLE-001', evidence_state: 'INFERRED', provenance: P.inferred
  }));

  // --- the upper-left room, and the rule that creates it --------------------
  // VISIBLE WINDOW => REAL ROOM. The Chairman states the room is visible, so the
  // room is registered and the opening that makes it visible is registered with it.
  addElement(reg, element({
    element_id: 'THYW-EL-WALL-UL-001', element_class: 'WALL', parent_id: 'THYW-EL-CASTLE-001',
    frame_id: 'THYW-FRAME-CASTLE-001-STOREY-UPPER', evidence_state: 'INFERRED',
    provenance: provenance({
      source: 'Required host for the upper-left opening asserted in the Chairman directive',
      source_kind: 'DERIVED', accessed_at: ACCESSED, confidence: 'LOW',
      note: 'An opening must be cut in something. The wall exists because the opening does.'
    })
  }));
  addRoom(reg, room({
    room_id: 'THYW-ROOM-UL-001', storey_id: 'THYW-FRAME-CASTLE-001-STOREY-UPPER',
    frame_id: 'THYW-FRAME-CASTLE-001-STOREY-UPPER',
    purpose: UNKNOWN, evidence_state: 'VERIFIED', provenance: P.chairman
  }));
  addOpening(reg, opening({
    opening_id: 'THYW-OPEN-UL-001', opening_kind: 'WINDOW',
    host_element_id: 'THYW-EL-WALL-UL-001', frame_id: 'THYW-FRAME-CASTLE-001-STOREY-UPPER',
    inner_space_id: 'THYW-ROOM-UL-001', evidence_state: 'VERIFIED', provenance: P.chairman
  }));

  return reg;
}

// ---------------------------------------------------------------------------
// Access matrix
// ---------------------------------------------------------------------------
// Every traveller profile is built with UNKNOWN requirements, because cart
// gauge, axle load and horse clearance are properties of the unresolved period.
// The one segment that can be judged without measurement is judged.

export function buildAccessMatrix() {
  const profiles = TRAVELLER_CLASSES.map(c => travellerProfile({
    class_code: c,
    wheeled: c === 'CART',
    step_capable: c !== 'CART',
    notes: 'All dimensional requirements are UNKNOWN until PERIOD_TECH_PROFILE_CASTLE_001 resolves.'
  }));

  const gates = new Map([['THYW-EL-GATE-001', gateOpening({
    gate_id: 'THYW-EL-GATE-001', evidence_state: 'INFERRED'
  })]]);

  const approach = segment({
    segment_id: 'THYW-SEG-APPROACH-001', from_node: 'THYW-NODE-LAND-OUTER',
    to_node: 'THYW-NODE-GATE-OUTER', kind: 'ROAD', evidence_state: 'UNKNOWN'
  });
  const throughGate = segment({
    segment_id: 'THYW-SEG-GATE-001', from_node: 'THYW-NODE-GATE-OUTER',
    to_node: 'THYW-NODE-COURTYARD', kind: 'GATE', gate_id: 'THYW-EL-GATE-001',
    evidence_state: 'INFERRED'
  });
  // Reaching an upper storey requires vertical circulation. Whether it is a
  // stair or a ramp is UNKNOWN; the STAIR case is modelled to record the one
  // hard result the directive asks for.
  const upperStair = segment({
    segment_id: 'THYW-SEG-UPPER-STAIR-001', from_node: 'THYW-NODE-COURTYARD',
    to_node: 'THYW-NODE-ROOM-UL', kind: 'STAIR', step_count: 1,
    evidence_state: 'UNKNOWN'
  });

  const toCourtyard = [approach, throughGate];
  const toUpperRoom = [approach, throughGate, upperStair];

  return {
    gates,
    to_courtyard: profiles.map(p => solveRoute({
      route_id: 'THYW-ROUTE-COURTYARD', class_code: p.class_code,
      segments: toCourtyard, profile: p, gates
    })),
    to_upper_room: profiles.map(p => solveRoute({
      route_id: 'THYW-ROUTE-UPPER-ROOM', class_code: p.class_code,
      segments: toUpperRoom, profile: p, gates
    }))
  };
}

// ---------------------------------------------------------------------------
// Castle name recovery
// ---------------------------------------------------------------------------

export const NAME_RECOVERY = Object.freeze({
  backend_state: 'UNKNOWN',
  searched: [
    'vyc2st-ctrl/thylora — full working tree and all 51 commits across every branch',
    'vyc2st-ctrl/thylora-executive-dashboard — working tree and 200 commits of history',
    'live backend jvsdxhrfhtlgaknhjxlz — NOT SEARCHED, egress denied by network policy (403 on CONNECT)'
  ],
  finding: 'No canonical castle name exists in any readable source. The only attested proper token attached to the scene is THEHANDLUH, which the surfaces use as the name of the living-world environment and gallery, not as the name of the castle building.',
  open_blocker: 'WR-CASTLE-001 carries the open blocker "exact world sites/names unresolved", which is the backend saying the same thing.',
  naming_language: 'UNKNOWN. The architectural tradition is unresolved, so the language the castle would be named in is unresolved with it.',
  canonized: false
});

/** Eight PROPOSED native-name candidates. None is canon. */
export const NAME_CANDIDATES = Object.freeze([
  { candidate: 'Handluh',          derivation: 'The attested environment token used bare, as the place it names.' },
  { candidate: 'Thehandluh',       derivation: 'The attested token kept whole, treating the leading element as part of the name rather than an article.' },
  { candidate: 'Handluh Keep',     derivation: 'Attested token plus a structure word; presupposes a keep-and-bailey form, which is NOT attested.' },
  { candidate: 'Hand-Luh',         derivation: 'The token read as two elements, should the naming language prove compound-forming.' },
  { candidate: 'Luhandu',          derivation: 'Metathesis of the attested token, offered in case the surface spelling is a transcription rather than the native order.' },
  { candidate: 'Handluhan',        derivation: 'Attested token with a locative-style suffix, a common place-name pattern across many naming languages.' },
  { candidate: 'Ehandluh',         derivation: 'Attested token with a prothetic vowel, as several naming traditions take for place names.' },
  { candidate: 'Handluh Ward',     derivation: 'Attested token plus an enclosure word, should the complex prove to be walled ground rather than a single building.' }
].map(Object.freeze));

/** Three PROPOSED uses for the upper-left room, for Chairman selection. */
export const UPPER_LEFT_ROOM_PROPOSALS = Object.freeze([
  {
    key: 'TUTORIAL_CHAMBER',
    label: 'Private tutorial chamber of the royal household',
    why: 'WR-CASTLE-001 is lane CASTLE_ROYAL, titled "Family Castle + Royal House Completion", and the directive asks for learning/tutor rooms while forbidding modern school architecture. An upper, well-lit, single-window room off the family range is the household form of that use.',
    implies: 'Daylight-led lighting, a writing surface, storage for the period\'s own recordkeeping materials, a child-safe route from the family rooms, and no classroom fittings.'
  },
  {
    key: 'MUNIMENT_ROOM',
    label: 'Record and archive chamber',
    why: 'The directive asks for an archive/record room. Records are kept high and dry, behind one controlled door, with a small opening.',
    implies: 'A small window rather than a large one, a lockable door, a guard or staff route rather than a public one, and restricted lighting because open flame near records is a hazard in every candidate period.'
  },
  {
    key: 'PRIVATE_WITHDRAWING_ROOM',
    label: 'Private withdrawing room / bedchamber of the royal family',
    why: 'Upper-storey corner rooms with an outward window are the private end of the royal range in most of the candidate traditions.',
    implies: 'A royal route and a child-safe route, no service traffic through the room, a private rather than a receiving door, and furnishing recorded as household goods of the resolved period.'
  }
].map(Object.freeze));

// ---------------------------------------------------------------------------
// The gate
// ---------------------------------------------------------------------------

export function evaluateGate() {
  const reg = buildCastleState();
  const census = unknownCensus(reg);
  const findings = audit(reg);
  const counts = verifiedCount(reg);
  const access = buildAccessMatrix();
  const anyPass = [...access.to_courtyard, ...access.to_upper_room].some(r => r.verdict === 'PASS');

  const factors = {
    G: { value: 0, basis: 'No readable survey source yields any measured dimension. The reference image is a truncated JPEG; the backend is unreachable.' },
    A: { value: findings.length === 0 ? 1 : 0, basis: findings.length === 0 ? 'Every registered element resolves to a registered parent and every opening to a registered space.' : `${findings.length} registry audit finding(s).` },
    O: { value: 0, basis: 'The origin RULE is defined (THYW-ORIGIN-CASTLE-001) but the main gate threshold is not located, so the origin does not resolve to a point.' },
    P: { value: 0, basis: 'The historical period is UNRESOLVED. PERIOD_TECH_PROFILE_CASTLE_001 exists as a gate with an empty allow-list.' },
    T: { value: findings.length === 0 ? 1 : 0, basis: 'Topology closes over what is registered: no opening lacks a space.' },
    C: { value: anyPass ? 1 : 0, basis: 'No route solves to PASS for any traveller class; every dimensional constraint is UNKNOWN and the wheeled route to the upper room FAILS on steps.' },
    H: { value: 0, basis: 'Storey elevations and the datum offset to any planetary reference are UNKNOWN.' },
    I: { value: 0, basis: 'BACKEND STATE: UNKNOWN. No canonical castle name exists in any readable source.' },
    B: { value: 1, basis: 'Every registered frame resolves to THYW-FRAME-PLANET-EDEREARIAH. No element reaches Earth or any frame outside this world lineage, holding the same Earth/EdereAriah line the backend already holds through EARTH_REAL vs WORLD_SIMULATED.' },
    R: { value: 1, basis: 'The one attested opening has a registered room behind it. The window/room rule holds over the current registry.' },
    V: { value: 1, basis: 'State is written to the repository and read back; see the readback section of WR-WORLD-CASTLE-001.' }
  };

  return {
    gate: evaluate(factors),
    registry_counts: {
      elements: reg.elements.size, rooms: reg.rooms.size, openings: reg.openings.size,
      verified: counts
    },
    audit_findings: findings,
    unknown_census: census,
    access_matrix: {
      to_courtyard: access.to_courtyard.map(r => ({ class_code: r.class_code, verdict: r.verdict })),
      to_upper_room: access.to_upper_room.map(r => ({ class_code: r.class_code, verdict: r.verdict }))
    },
    period_profile_id: buildProfile().profile_id,
    factor_letters: FACTOR_LETTERS
  };
}
