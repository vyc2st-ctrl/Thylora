// THYLORA WORLD · emit the persisted world state files
// Workroom: WR-WORLD-CASTLE-001
//
// Everything under world/data/ is emitted from world/lib/ and world/castle-001.js.
// Nothing there is hand-written, so the stored state cannot drift from the rules
// that produced it. Run:  node world/emit.mjs
import { writeFileSync } from 'node:fs';
import { CASTLE_FRAME_TREE, ORIGIN_RULE, LINEAR_UNIT, ANGULAR_UNIT } from './lib/frame.js';
import { unknownCensus, audit, verifiedCount } from './lib/registry.js';
import { buildProfile } from './lib/period.js';
import {
  buildCastleState, buildAccessMatrix, evaluateGate,
  NAME_RECOVERY, NAME_CANDIDATES, UPPER_LEFT_ROOM_PROPOSALS
} from './castle-001.js';

const WORLD_VERSION_ID = 'THYW-WORLD-V1';
const RECORDED_AT = '2026-09-18';
const here = new URL('./data/', import.meta.url);
const write = (name, value) => {
  writeFileSync(new URL(name, here), JSON.stringify(value, null, 2) + '\n');
  return name;
};

const reg = buildCastleState();
const access = buildAccessMatrix();
const gate = evaluateGate();

const serialiseUnknown = (v) => (v === null || v === undefined || (typeof v === 'object' && v && v.__unknown)) ? null : v;
const elementRows = [...reg.elements.values()].map(e => ({
  element_id: e.element_id, element_class: e.element_class, parent_id: e.parent_id,
  frame_id: e.frame_id, local_transform: serialiseUnknown(e.local_transform),
  dimensions: {
    length_mm: serialiseUnknown(e.dimensions.length_mm),
    width_mm: serialiseUnknown(e.dimensions.width_mm),
    height_mm: serialiseUnknown(e.dimensions.height_mm)
  },
  orientation_mdeg: serialiseUnknown(e.orientation_mdeg),
  material_id: serialiseUnknown(e.material_id),
  build_phase: e.build_phase, version: e.version,
  evidence_state: e.evidence_state, provenance: e.provenance
}));
const roomRows = [...reg.rooms.values()].map(r => ({
  room_id: r.room_id, storey_id: r.storey_id, frame_id: r.frame_id,
  dimensions: {
    length_mm: serialiseUnknown(r.dimensions.length_mm),
    width_mm: serialiseUnknown(r.dimensions.width_mm),
    height_mm: serialiseUnknown(r.dimensions.height_mm)
  },
  ceiling_height_mm: serialiseUnknown(r.ceiling_height_mm),
  purpose: serialiseUnknown(r.purpose), period_state: serialiseUnknown(r.period_state),
  occupants: serialiseUnknown(r.occupants), furnishing_state: serialiseUnknown(r.furnishing_state),
  lighting_sources: serialiseUnknown(r.lighting_sources),
  evidence_state: r.evidence_state, provenance: r.provenance
}));
const openingRows = [...reg.openings.values()].map(o => ({
  opening_id: o.opening_id, opening_kind: o.opening_kind, host_element_id: o.host_element_id,
  frame_id: o.frame_id, inner_space_id: o.inner_space_id, outer_space_id: o.outer_space_id,
  clear_width_mm: serialiseUnknown(o.clear_width_mm), clear_height_mm: serialiseUnknown(o.clear_height_mm),
  sill_height_mm: serialiseUnknown(o.sill_height_mm),
  evidence_state: o.evidence_state, provenance: o.provenance
}));
const routeRows = [...access.to_courtyard, ...access.to_upper_room].map(r => ({
  route_id: r.route_id, class_code: r.class_code, verdict: r.verdict,
  from_node: r.from_node, to_node: r.to_node,
  blocking_constraints: r.blocking_constraints,
  unknown_constraints: r.unknown_constraints,
  statement: r.statement
}));

const written = [];

written.push(write('master-coordinate-system.json', {
  frame_tree: CASTLE_FRAME_TREE.map(f => ({
    frame_id: f.frame_id, kind: f.kind, parent_frame_id: f.parent_frame_id,
    handedness: f.handedness, linear_unit: f.linear_unit, angular_unit: f.angular_unit,
    datum_id: f.datum_id, north_basis: f.north_basis,
    transform: serialiseUnknown(f.transform),
    evidence_state: f.evidence_state, provenance: f.provenance
  })),
  origin_rule: { ...ORIGIN_RULE, declination_to_true_north_mdeg: null, datum_offset_to_planetary_sea_level_mm: null },
  units: { linear: LINEAR_UNIT, angular: ANGULAR_UNIT,
    basis: 'Integer storage only. A float that is written, read and re-written drifts, and drift in a survey frame is silent loss of established geometry.' }
}));

written.push(write('castle-001.state.json', {
  world_version_id: WORLD_VERSION_ID, recorded_at: RECORDED_AT,
  elements: elementRows, rooms: roomRows, openings: openingRows, routes: routeRows,
  counts: {
    elements: elementRows.length, rooms: roomRows.length,
    openings: openingRows.length, routes: routeRows.length,
    verified: verifiedCount(reg)
  },
  audit_findings: audit(reg)
}));

written.push(write('unknown-register.json', {
  world_version_id: WORLD_VERSION_ID,
  rule: 'An unknown is closed by evidence, never by a decision to stop asking.',
  entries: unknownCensus(reg).flatMap(c => c.unknown_fields.map(f => ({
    unknown_id: `THYW-UNK-${c.kind}-${c.id}-${f}`.toUpperCase(),
    object_kind: c.kind, object_id: c.id, unknown_field: f,
    why_unknown: 'No readable survey source carries a value. The Chairman castle reference is a truncated JPEG and the live backend is unreachable from the authoring environment.',
    closes_when: 'A readable reference or a Chairman statement supplies the value.',
    closed: false
  })))
}));

written.push(write('name-recovery.json', {
  recovery: NAME_RECOVERY, candidates: NAME_CANDIDATES,
  rule: 'Candidates are stored. Canonization is a separate act and belongs to the Chairman alone.'
}));

written.push(write('upper-left-room.json', {
  room_id: 'THYW-ROOM-UL-001',
  backend_state: 'NO CANONICAL USE EXISTS',
  basis: 'No readable source assigns a use to this room. WR-CASTLE-001 carries the open blocker "castle floor plans not complete".',
  assigned_purpose: null,
  proposals: UPPER_LEFT_ROOM_PROPOSALS,
  rule: 'Proposals are stored separately from the room\'s purpose, so a proposal can never be mistaken for an assignment.'
}));

written.push(write('access-matrix.json', {
  world_version_id: WORLD_VERSION_ID,
  solver_ref: 'world/lib/routes.js',
  legend: {
    PASS: 'Every constraint checked against a known value and satisfied.',
    FAIL: 'At least one constraint violated by a known value. The route does not exist physically.',
    INDETERMINATE: 'No constraint violated, but at least one required value is UNKNOWN. The route is NOT established.'
  },
  routes: routeRows
}));

written.push(write('period-tech-profile-castle-001.json', buildProfile()));

written.push(write('wq-gate.json', {
  world_version_id: WORLD_VERSION_ID, recorded_at: RECORDED_AT,
  equation: 'Wq = G x A x O x P x T x C x H x I x B x R x V',
  rule: 'Any factor = 0 => HOLD.',
  ...gate.gate
}));

written.push(write('world-versions.json', {
  rule: 'Append-only. F_(n+1) >= F_n. A loss is permitted only by a Chairman supersession naming the object and the facet.',
  versions: [{
    world_version_id: WORLD_VERSION_ID, sequence_no: 1, parent_version_id: null,
    recorded_at: RECORDED_AT, recorded_by: 'WR-WORLD-CASTLE-001',
    element_count: elementRows.length, room_count: roomRows.length,
    opening_count: openingRows.length, route_count: routeRows.length,
    verified_element_count: verifiedCount(reg).elements,
    verified_room_count: verifiedCount(reg).rooms,
    verified_opening_count: verifiedCount(reg).openings,
    wq_decision: gate.gate.decision,
    wq_zero_factors: gate.gate.zero_factors.map(z => z.letter),
    note: 'First recorded world version for the castle. This is the floor F_1 that no later version may fall below.'
  }],
  supersessions: []
}));

console.log(written.map(w => `world/data/${w}`).join('\n'));
