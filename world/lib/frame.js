// THYLORA WORLD · master coordinate frame
// Workroom: WR-WORLD-CASTLE-001
//
// This module defines the RULE by which every castle coordinate resolves. It
// deliberately defines no measured VALUE. The Chairman castle reference has not
// been readable from any source available to the authoring session, so every
// dimension in this lane is UNKNOWN. A rule can be canon before a measurement
// exists; a measurement may not be invented to make the rule look finished.
//
// Storage discipline
// ------------------
// Linear quantities are integer millimetres. Angular quantities are integer
// millidegrees. There is no floating point anywhere in stored geometry, for the
// same reason RAE Link stores money in integer minor units: a float that is
// written, read and re-written drifts, and drift in a survey frame is silent
// loss of established geometry, which THY non-regression forbids.

export const LINEAR_UNIT = 'mm_int';      // integer millimetres
export const ANGULAR_UNIT = 'mdeg_int';   // integer millidegrees
export const MM_PER_M = 1000;
export const MDEG_PER_DEG = 1000;

export const UNKNOWN = Object.freeze({ __unknown: true });
export const isUnknown = (v) => v === null || v === undefined || (typeof v === 'object' && v !== null && v.__unknown === true);

export class FrameError extends Error {
  constructor(message, { code = 'FRAME_ERROR', frameId = null } = {}) {
    super(message);
    this.name = 'FrameError';
    this.code = code;
    this.frameId = frameId;
  }
}

// ---------------------------------------------------------------------------
// Parent hierarchy and the interworld barrier
// ---------------------------------------------------------------------------
// One planet, many periods. THY-INTERWORLD-BARRIER-GLOBAL-001 is named in the
// Chairman directive but its text is not present in any repository readable
// here. What IS readable is the separation the barrier protects: THYLORA already
// holds Earth and the world EdereAriah apart at the data layer, through the
// EARTH_REAL / WORLD_SIMULATED world_status split in rael_channel_class
// (db/rae-link/0001_identity_channels.sql) and rae-link/lib/rights.js.
//
// This hierarchy holds the same line in coordinates: a frame may only be
// expressed in one of its own ancestors. There is no coordinate path from the
// castle frame to Earth, or to a sibling scene in another period, so nothing can
// bleed into this scene by being placed relative to it.

export const FRAME_KINDS = Object.freeze([
  'PLANET', 'REGION', 'SITE', 'COMPLEX', 'STRUCTURE', 'STOREY', 'ELEMENT'
]);

/** A frame node. `transform` places this frame's origin inside its parent. */
export function defineFrame({
  frame_id, kind, parent_frame_id = null, transform = null,
  handedness = 'RIGHT_Z_UP', linear_unit = LINEAR_UNIT, angular_unit = ANGULAR_UNIT,
  datum_id = null, north_basis = null, evidence_state = 'UNKNOWN', provenance = null
}) {
  if (!frame_id) throw new FrameError('frame_id is required', { code: 'FRAME_ID_REQUIRED' });
  if (!FRAME_KINDS.includes(kind)) {
    throw new FrameError(`unknown frame kind: ${kind}`, { code: 'FRAME_KIND_UNKNOWN', frameId: frame_id });
  }
  if (kind !== 'PLANET' && !parent_frame_id) {
    throw new FrameError(`frame ${frame_id} of kind ${kind} must name a parent frame`,
      { code: 'FRAME_PARENT_REQUIRED', frameId: frame_id });
  }
  return Object.freeze({
    frame_id, kind, parent_frame_id, handedness, linear_unit, angular_unit,
    datum_id, north_basis, evidence_state, provenance,
    transform: transform === null ? UNKNOWN : Object.freeze({ ...transform })
  });
}

/** A rigid placement of a child frame inside its parent: translation then yaw. */
export function transform({ x_mm, y_mm, z_mm, yaw_mdeg = 0, pitch_mdeg = 0, roll_mdeg = 0 }) {
  for (const [name, v] of Object.entries({ x_mm, y_mm, z_mm, yaw_mdeg, pitch_mdeg, roll_mdeg })) {
    if (isUnknown(v)) return UNKNOWN;
    if (!Number.isInteger(v)) {
      throw new FrameError(`${name} must be an integer (${LINEAR_UNIT}/${ANGULAR_UNIT}), got ${v}`,
        { code: 'NON_INTEGER_COORDINATE' });
    }
  }
  return Object.freeze({ x_mm, y_mm, z_mm, yaw_mdeg, pitch_mdeg, roll_mdeg });
}

// ---------------------------------------------------------------------------
// The castle frame tree
// ---------------------------------------------------------------------------
// Every transform below is UNKNOWN. That is the honest state: the reference
// image `app/assets/thylora-handluh-castle.jpg` in vyc2st-ctrl/thylora-executive-dashboard
// is a structurally truncated JPEG (8144 bytes, no SOF/SOS/EOI marker) and could
// not be decoded, and network egress to the live backend is denied by policy.

// The world's name IS recovered. EdereAriah is attested across both repositories
// — rael_channel_class 'EDEREARIAH_INHABITANT', rae-link/lib/rights.js, the RAE
// Link architecture and rights docs, public-site/index.html, app/sports-betting.html
// — as the name of the THYLORA world, held distinct from Earth.
export const PLANET_FRAME = defineFrame({
  frame_id: 'THYW-FRAME-PLANET-EDEREARIAH', kind: 'PLANET',
  north_basis: 'PLANETARY_ROTATIONAL_NORTH',
  evidence_state: 'VERIFIED',
  provenance: 'World name VERIFIED from multiple independent files in vyc2st-ctrl/thylora and vyc2st-ctrl/thylora-executive-dashboard. The planet\'s geodetic figure, radius and sea-level datum remain UNKNOWN; only the name is established.'
});

export const REGION_FRAME = defineFrame({
  frame_id: 'THYW-FRAME-REGION-UNKNOWN', kind: 'REGION',
  parent_frame_id: 'THYW-FRAME-PLANET-EDEREARIAH',
  evidence_state: 'UNKNOWN',
  provenance: 'Backend blocker on WR-CASTLE-001 reads "exact world sites/names unresolved". Region is therefore UNKNOWN, not assumed. The castle\'s placement on EdereAriah is INFERRED from the scene being a THYLORA world scene, not stated by any source.'
});

export const SITE_FRAME = defineFrame({
  frame_id: 'THYW-FRAME-SITE-001', kind: 'SITE',
  parent_frame_id: 'THYW-FRAME-REGION-UNKNOWN',
  datum_id: 'THYW-DATUM-CASTLE-001',
  evidence_state: 'UNKNOWN',
  provenance: 'Site of the THEHANDLUH castle/cart/workers scene. Placement within the region UNKNOWN.'
});

export const CASTLE_FRAME = defineFrame({
  frame_id: 'THYW-FRAME-CASTLE-001', kind: 'COMPLEX',
  parent_frame_id: 'THYW-FRAME-SITE-001',
  datum_id: 'THYW-DATUM-CASTLE-001',
  north_basis: 'GRID_NORTH_PLUS_Y',
  evidence_state: 'RULE_DEFINED_VALUE_UNKNOWN',
  provenance: 'Master survey frame for the castle complex. Axis and origin RULES are canon here; all measured values UNKNOWN.'
});

/**
 * THYW-ORIGIN-CASTLE-001 — the origin rule.
 *
 * Horizontal origin: the midpoint of the OUTER face of the main gate threshold.
 * Vertical origin:   THYW-DATUM-CASTLE-001, the finished ground level of the
 *                    principal courtyard directly inside that gate.
 * Grid north (+Y):   the inward horizontal normal of that same gate opening.
 *
 * The rule is fully determined: the moment the gate is located in any survey
 * source, the origin and the axes resolve with no further choice and no drift.
 * That is why the rule may be canon while the values are UNKNOWN.
 */
export const ORIGIN_RULE = Object.freeze({
  origin_id: 'THYW-ORIGIN-CASTLE-001',
  frame_id: 'THYW-FRAME-CASTLE-001',
  horizontal_rule: 'Midpoint of the outer face of the main gate threshold.',
  vertical_rule: 'THYW-DATUM-CASTLE-001 — finished ground level of the principal courtyard immediately inside the main gate.',
  axis_x: '+X = grid east, 90 mdeg-degrees clockwise from +Y in plan.',
  axis_y: '+Y = grid north = inward horizontal normal of the main gate opening.',
  axis_z: '+Z = up, opposite local gravity.',
  handedness: 'RIGHT_Z_UP',
  declination_to_true_north_mdeg: UNKNOWN,
  datum_offset_to_planetary_sea_level_mm: UNKNOWN,
  resolved: false,
  resolves_when: 'A readable survey source locates the main gate threshold.'
});

export const CASTLE_FRAME_TREE = Object.freeze([
  PLANET_FRAME, REGION_FRAME, SITE_FRAME, CASTLE_FRAME
]);

// ---------------------------------------------------------------------------
// Transform composition
// ---------------------------------------------------------------------------

/** Compose child-in-parent placements. UNKNOWN is absorbing: it never becomes a number. */
export function compose(outer, inner) {
  if (isUnknown(outer) || isUnknown(inner)) return UNKNOWN;
  const yaw = outer.yaw_mdeg;
  const rad = (yaw / MDEG_PER_DEG) * Math.PI / 180;
  const cos = Math.cos(rad), sin = Math.sin(rad);
  return transform({
    x_mm: outer.x_mm + Math.round(inner.x_mm * cos - inner.y_mm * sin),
    y_mm: outer.y_mm + Math.round(inner.x_mm * sin + inner.y_mm * cos),
    z_mm: outer.z_mm + inner.z_mm,
    yaw_mdeg: normaliseAngle(outer.yaw_mdeg + inner.yaw_mdeg),
    pitch_mdeg: normaliseAngle(outer.pitch_mdeg + inner.pitch_mdeg),
    roll_mdeg: normaliseAngle(outer.roll_mdeg + inner.roll_mdeg)
  });
}

export function normaliseAngle(mdeg) {
  const full = 360 * MDEG_PER_DEG;
  return ((mdeg % full) + full) % full;
}

/**
 * Resolve a frame's placement in a named ancestor.
 * Returns UNKNOWN if any link in the chain is UNKNOWN — the honest answer.
 */
export function resolveTo(frames, frameId, ancestorId) {
  const byId = frames instanceof Map ? frames : new Map(frames.map(f => [f.frame_id, f]));
  let current = byId.get(frameId);
  if (!current) throw new FrameError(`frame not registered: ${frameId}`, { code: 'FRAME_NOT_FOUND', frameId });
  let acc = transform({ x_mm: 0, y_mm: 0, z_mm: 0 });
  const seen = new Set();
  while (current && current.frame_id !== ancestorId) {
    if (seen.has(current.frame_id)) {
      throw new FrameError(`cycle in frame hierarchy at ${current.frame_id}`, { code: 'FRAME_CYCLE', frameId: current.frame_id });
    }
    seen.add(current.frame_id);
    acc = compose(current.transform, acc);
    if (isUnknown(acc)) return UNKNOWN;
    if (!current.parent_frame_id) {
      throw new FrameError(`${ancestorId} is not an ancestor of ${frameId}`, { code: 'FRAME_NOT_ANCESTOR', frameId });
    }
    current = byId.get(current.parent_frame_id);
    if (!current) throw new FrameError(`frame not registered: ${frameId}`, { code: 'FRAME_NOT_FOUND', frameId });
  }
  if (!current) throw new FrameError(`${ancestorId} is not an ancestor of ${frameId}`, { code: 'FRAME_NOT_ANCESTOR', frameId });
  return acc;
}

/** Interworld barrier: a frame may only be expressed in one of its own ancestors. */
export function assertSameWorldLineage(frames, aId, bId) {
  const byId = frames instanceof Map ? frames : new Map(frames.map(f => [f.frame_id, f]));
  const root = (id) => {
    let f = byId.get(id), last = null, guard = 0;
    while (f && guard++ < 1000) { last = f; f = f.parent_frame_id ? byId.get(f.parent_frame_id) : null; }
    return last ? last.frame_id : null;
  };
  const ra = root(aId), rb = root(bId);
  if (ra === null || rb === null || ra !== rb) {
    throw new FrameError(`interworld barrier: ${aId} and ${bId} do not share a world root`,
      { code: 'INTERWORLD_BARRIER' });
  }
  return true;
}
