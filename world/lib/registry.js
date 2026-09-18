// THYLORA WORLD · architectural topology registry
// Workroom: WR-WORLD-CASTLE-001
//
// Every visible thing in the castle resolves to a row with the same eleven
// facets the Chairman directive names: ID, parent, world coordinates, local
// coordinates, dimensions, orientation, material, tolerance, build phase,
// version and provenance. A row may be created with UNKNOWN measurements; it
// may not be created without provenance, because a row without provenance is
// indistinguishable from an invention.

import { UNKNOWN, isUnknown, resolveTo, compose } from './frame.js';

export class RegistryError extends Error {
  constructor(message, { code = 'REGISTRY_ERROR', id = null } = {}) {
    super(message); this.name = 'RegistryError'; this.code = code; this.id = id;
  }
}

export const ELEMENT_CLASSES = Object.freeze([
  'WALL', 'MASONRY_UNIT', 'BEAM', 'ROOF', 'WINDOW', 'DOOR', 'STAIR', 'LEDGE',
  'GATE', 'LANTERN', 'ROOM', 'CORRIDOR', 'TOWER', 'ARCH', 'TERRACE',
  'COURTYARD', 'ROAD', 'SLOPE', 'STABLE', 'CART'
]);

// An element is VERIFIED only when a readable evidence source carries it.
export const EVIDENCE_STATES = Object.freeze([
  'VERIFIED',   // present in a readable, cited source
  'INFERRED',   // forced by another VERIFIED element plus physical necessity
  'PROPOSED',   // reconstruction offered for Chairman selection; NOT canon
  'UNKNOWN'     // recorded as absent knowledge, on purpose
]);

export const BUILD_PHASES = Object.freeze(['PHASE_UNKNOWN']);

/** Dimensions in integer millimetres, or UNKNOWN per axis. */
export function dims({ length_mm = UNKNOWN, width_mm = UNKNOWN, height_mm = UNKNOWN } = {}) {
  for (const [k, v] of Object.entries({ length_mm, width_mm, height_mm })) {
    if (!isUnknown(v) && (!Number.isInteger(v) || v < 0)) {
      throw new RegistryError(`${k} must be a non-negative integer in mm or UNKNOWN`, { code: 'BAD_DIMENSION' });
    }
  }
  return Object.freeze({ length_mm, width_mm, height_mm });
}

/** Tolerance band. UNKNOWN measurement with a stated tolerance is still UNKNOWN. */
export function tolerance({ linear_mm = UNKNOWN, angular_mdeg = UNKNOWN, basis = 'NOT_ESTABLISHED' } = {}) {
  return Object.freeze({ linear_mm, angular_mdeg, basis });
}

export function provenance({ source, source_kind, accessed_at, confidence, note = '' }) {
  if (!source) throw new RegistryError('provenance.source is required', { code: 'PROVENANCE_REQUIRED' });
  if (!['BACKEND_ROW', 'REPOSITORY_FILE', 'CHAIRMAN_DIRECTIVE', 'DERIVED', 'ABSENT'].includes(source_kind)) {
    throw new RegistryError(`unknown provenance source_kind: ${source_kind}`, { code: 'PROVENANCE_KIND_UNKNOWN' });
  }
  if (!['HIGH', 'MEDIUM', 'LOW', 'NONE'].includes(confidence)) {
    throw new RegistryError(`unknown confidence: ${confidence}`, { code: 'PROVENANCE_CONFIDENCE_UNKNOWN' });
  }
  return Object.freeze({ source, source_kind, accessed_at, confidence, note });
}

export function element({
  element_id, element_class, parent_id = null, frame_id,
  local_transform = UNKNOWN, dimensions = dims(), orientation_mdeg = UNKNOWN,
  material_id = UNKNOWN, tolerance_band = tolerance(), build_phase = 'PHASE_UNKNOWN',
  version = 1, evidence_state = 'UNKNOWN', provenance: prov, procedural_spec_id = null
}) {
  if (!element_id) throw new RegistryError('element_id is required', { code: 'ELEMENT_ID_REQUIRED' });
  if (!ELEMENT_CLASSES.includes(element_class)) {
    throw new RegistryError(`unknown element_class: ${element_class}`, { code: 'ELEMENT_CLASS_UNKNOWN', id: element_id });
  }
  if (!EVIDENCE_STATES.includes(evidence_state)) {
    throw new RegistryError(`unknown evidence_state: ${evidence_state}`, { code: 'EVIDENCE_STATE_UNKNOWN', id: element_id });
  }
  if (!prov) throw new RegistryError(`element ${element_id} has no provenance`, { code: 'PROVENANCE_REQUIRED', id: element_id });
  if (evidence_state === 'VERIFIED' && prov.source_kind === 'ABSENT') {
    throw new RegistryError(`element ${element_id} cannot be VERIFIED from an ABSENT source`,
      { code: 'VERIFIED_WITHOUT_SOURCE', id: element_id });
  }
  if (!frame_id) throw new RegistryError(`element ${element_id} must name a frame`, { code: 'FRAME_REQUIRED', id: element_id });
  return Object.freeze({
    element_id, element_class, parent_id, frame_id, local_transform,
    dimensions, orientation_mdeg, material_id, tolerance_band, build_phase,
    version, evidence_state, provenance: prov, procedural_spec_id
  });
}

// ---------------------------------------------------------------------------
// Window / room rule
// ---------------------------------------------------------------------------
// VISIBLE WINDOW => REAL ROOM.  VISIBLE DOOR => REAL CONNECTED SPACE.
// Enforced, not documented: a registry holding an opening with no space behind
// it fails its own audit.

export function room({
  room_id, storey_id, frame_id, dimensions = dims(), ceiling_height_mm = UNKNOWN,
  purpose = UNKNOWN, period_state = UNKNOWN, occupants = UNKNOWN,
  furnishing_state = UNKNOWN, lighting_sources = UNKNOWN,
  evidence_state = 'UNKNOWN', provenance: prov
}) {
  if (!room_id) throw new RegistryError('room_id is required', { code: 'ROOM_ID_REQUIRED' });
  if (!prov) throw new RegistryError(`room ${room_id} has no provenance`, { code: 'PROVENANCE_REQUIRED', id: room_id });
  return Object.freeze({
    room_id, storey_id, frame_id, dimensions, ceiling_height_mm, purpose,
    period_state, occupants, furnishing_state, lighting_sources,
    evidence_state, provenance: prov
  });
}

export function opening({
  opening_id, opening_kind, host_element_id, frame_id,
  inner_space_id = null, outer_space_id = null,
  dimensions = dims(), sill_height_mm = UNKNOWN, clear_width_mm = UNKNOWN,
  clear_height_mm = UNKNOWN, evidence_state = 'UNKNOWN', provenance: prov
}) {
  if (!['WINDOW', 'DOOR', 'GATE', 'ARCH'].includes(opening_kind)) {
    throw new RegistryError(`unknown opening_kind: ${opening_kind}`, { code: 'OPENING_KIND_UNKNOWN', id: opening_id });
  }
  if (!prov) throw new RegistryError(`opening ${opening_id} has no provenance`, { code: 'PROVENANCE_REQUIRED', id: opening_id });
  return Object.freeze({
    opening_id, opening_kind, host_element_id, frame_id, inner_space_id,
    outer_space_id, dimensions, sill_height_mm, clear_width_mm, clear_height_mm,
    evidence_state, provenance: prov
  });
}

export function createRegistry() {
  return { frames: new Map(), elements: new Map(), rooms: new Map(), openings: new Map(), materials: new Map() };
}

export function addFrame(reg, f) { reg.frames.set(f.frame_id, f); return f; }
export function addElement(reg, e) {
  if (reg.elements.has(e.element_id)) {
    throw new RegistryError(`duplicate element_id: ${e.element_id}`, { code: 'DUPLICATE_ID', id: e.element_id });
  }
  reg.elements.set(e.element_id, e); return e;
}
export function addRoom(reg, r) {
  if (reg.rooms.has(r.room_id)) throw new RegistryError(`duplicate room_id: ${r.room_id}`, { code: 'DUPLICATE_ID', id: r.room_id });
  reg.rooms.set(r.room_id, r); return r;
}
export function addOpening(reg, o) {
  if (reg.openings.has(o.opening_id)) throw new RegistryError(`duplicate opening_id: ${o.opening_id}`, { code: 'DUPLICATE_ID', id: o.opening_id });
  reg.openings.set(o.opening_id, o); return o;
}

/** World placement of an element, or UNKNOWN. Never guesses. */
export function worldTransform(reg, elementId, ancestorId = 'THYW-FRAME-CASTLE-001') {
  const e = reg.elements.get(elementId);
  if (!e) throw new RegistryError(`element not registered: ${elementId}`, { code: 'ELEMENT_NOT_FOUND', id: elementId });
  if (isUnknown(e.local_transform)) return UNKNOWN;
  const frameWorld = resolveTo(reg.frames, e.frame_id, ancestorId);
  if (isUnknown(frameWorld)) return UNKNOWN;
  return compose(frameWorld, e.local_transform);
}

/**
 * Audit the window/room rule and the provenance rule.
 * Returns findings; an empty array means the registry is internally honest.
 */
export function audit(reg) {
  const findings = [];
  for (const o of reg.openings.values()) {
    const kindNeedsSpace = o.opening_kind === 'WINDOW' ? 'inner_space_id' : 'both';
    if (!o.inner_space_id) {
      findings.push({
        rule: 'VISIBLE_OPENING_REAL_SPACE', severity: 'HIGH', id: o.opening_id,
        statement: `${o.opening_kind} ${o.opening_id} has no space behind it.`,
        remedy: 'Register the space it opens into, or withdraw the opening.'
      });
    } else if (!reg.rooms.has(o.inner_space_id) && !reg.elements.has(o.inner_space_id)) {
      findings.push({
        rule: 'VISIBLE_OPENING_REAL_SPACE', severity: 'HIGH', id: o.opening_id,
        statement: `${o.opening_kind} ${o.opening_id} names inner space ${o.inner_space_id}, which is not registered.`,
        remedy: 'Register the space or correct the reference.'
      });
    }
    if (kindNeedsSpace === 'both' && !o.outer_space_id) {
      findings.push({
        rule: 'VISIBLE_OPENING_REAL_SPACE', severity: 'MEDIUM', id: o.opening_id,
        statement: `${o.opening_kind} ${o.opening_id} connects to nothing on its outer side.`,
        remedy: 'A door or gate must connect two real spaces.'
      });
    }
  }
  for (const e of reg.elements.values()) {
    if (e.parent_id && !reg.elements.has(e.parent_id) && !reg.rooms.has(e.parent_id)) {
      findings.push({
        rule: 'PARENT_RESOLVES', severity: 'HIGH', id: e.element_id,
        statement: `Element ${e.element_id} names parent ${e.parent_id}, which is not registered.`,
        remedy: 'Register the parent or correct the reference.'
      });
    }
    if (e.evidence_state === 'VERIFIED' && e.provenance.confidence === 'NONE') {
      findings.push({
        rule: 'VERIFIED_NEEDS_CONFIDENCE', severity: 'HIGH', id: e.element_id,
        statement: `Element ${e.element_id} is VERIFIED but carries confidence NONE.`,
        remedy: 'Downgrade to PROPOSED or cite a real source.'
      });
    }
  }
  return findings;
}

/** Census of what is not known, so the unknown list is computed and cannot rot. */
export function unknownCensus(reg) {
  const out = [];
  const scan = (kind, id, obj, fields) => {
    const missing = fields.filter(f => isUnknown(obj[f]) ||
      (obj[f] && typeof obj[f] === 'object' && 'length_mm' in obj[f] &&
       isUnknown(obj[f].length_mm) && isUnknown(obj[f].width_mm) && isUnknown(obj[f].height_mm)));
    if (missing.length) out.push({ kind, id, unknown_fields: missing });
  };
  for (const e of reg.elements.values()) {
    scan('ELEMENT', e.element_id, e, ['local_transform', 'dimensions', 'orientation_mdeg', 'material_id']);
  }
  for (const r of reg.rooms.values()) {
    scan('ROOM', r.room_id, r, ['dimensions', 'ceiling_height_mm', 'purpose', 'period_state', 'occupants', 'furnishing_state', 'lighting_sources']);
  }
  for (const o of reg.openings.values()) {
    scan('OPENING', o.opening_id, o, ['dimensions', 'clear_width_mm', 'clear_height_mm', 'sill_height_mm']);
  }
  return out;
}

/** VERIFIED count — the number that non-regression protects. */
export function verifiedCount(reg) {
  const n = (m) => [...m.values()].filter(x => x.evidence_state === 'VERIFIED').length;
  return { elements: n(reg.elements), rooms: n(reg.rooms), openings: n(reg.openings) };
}
