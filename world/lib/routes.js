// THYLORA WORLD · movement and access solver
// Workroom: WR-WORLD-CASTLE-001
//
// "Do not visually hand-wave impossible access."
//
// A route is a path through the circulation graph. It is solved physically, per
// traveller class, against width, turning radius, grade, clearance, surface load
// and gate opening. Three outcomes only:
//
//   PASS          every constraint checked and satisfied
//   FAIL          at least one constraint is violated by a KNOWN value
//   INDETERMINATE at least one constraint has an UNKNOWN value and none FAIL
//
// INDETERMINATE is not a soft pass. A cart route that cannot be proved is not a
// cart route. The only thing the solver will assert without measurements is the
// one fact that needs none: a flight of stairs on a wheeled route FAILS.

import { UNKNOWN, isUnknown } from './frame.js';

export class RouteError extends Error {
  constructor(message, { code = 'ROUTE_ERROR' } = {}) { super(message); this.name = 'RouteError'; this.code = code; }
}

export const TRAVELLER_CLASSES = Object.freeze([
  'PEDESTRIAN', 'CHILD', 'HORSE', 'HORSE_AND_RIDER', 'CART', 'GUARD_PATROL',
  'STAFF_SERVICE', 'ROYAL_PROCESSION'
]);

export const WHEELED = Object.freeze(new Set(['CART']));
export const ANIMAL = Object.freeze(new Set(['HORSE', 'HORSE_AND_RIDER']));

/**
 * Traveller requirements. Every value is UNKNOWN until the period technology
 * profile is resolved, because cart track width, axle load and horse clearance
 * are properties of a period and a place, not universals.
 */
export function travellerProfile({
  class_code, min_clear_width_mm = UNKNOWN, min_clear_height_mm = UNKNOWN,
  min_turning_radius_mm = UNKNOWN, max_grade_permille = UNKNOWN,
  axle_load_n = UNKNOWN, wheeled = false, step_capable = true,
  max_step_rise_mm = UNKNOWN, requires_handrail = false, notes = ''
}) {
  if (!TRAVELLER_CLASSES.includes(class_code)) {
    throw new RouteError(`unknown traveller class: ${class_code}`, { code: 'CLASS_UNKNOWN' });
  }
  return Object.freeze({
    class_code, min_clear_width_mm, min_clear_height_mm, min_turning_radius_mm,
    max_grade_permille, axle_load_n, wheeled, step_capable, max_step_rise_mm,
    requires_handrail, notes
  });
}

export function segment({
  segment_id, from_node, to_node, kind = 'PATH',
  clear_width_mm = UNKNOWN, clear_height_mm = UNKNOWN,
  min_turning_radius_mm = UNKNOWN, grade_permille = UNKNOWN,
  surface_load_capacity_n = UNKNOWN, surface = UNKNOWN,
  step_count = 0, step_rise_mm = UNKNOWN, gate_id = null,
  evidence_state = 'UNKNOWN', provenance = null
}) {
  if (!segment_id) throw new RouteError('segment_id is required', { code: 'SEGMENT_ID_REQUIRED' });
  if (!['PATH', 'ROAD', 'RAMP', 'STAIR', 'GATE', 'DOORWAY', 'COURTYARD', 'BRIDGE', 'SLOPE'].includes(kind)) {
    throw new RouteError(`unknown segment kind: ${kind}`, { code: 'SEGMENT_KIND_UNKNOWN' });
  }
  return Object.freeze({
    segment_id, from_node, to_node, kind, clear_width_mm, clear_height_mm,
    min_turning_radius_mm, grade_permille, surface_load_capacity_n, surface,
    step_count, step_rise_mm, gate_id, evidence_state, provenance
  });
}

export function gate({
  gate_id, clear_width_mm = UNKNOWN, clear_height_mm = UNKNOWN,
  leaf_swing = UNKNOWN, threshold_rise_mm = UNKNOWN, evidence_state = 'UNKNOWN', provenance = null
}) {
  return Object.freeze({ gate_id, clear_width_mm, clear_height_mm, leaf_swing, threshold_rise_mm, evidence_state, provenance });
}

const cmp = (have, need, kind) => {
  // kind 'AT_LEAST': have must be >= need. kind 'AT_MOST': have must be <= need.
  if (isUnknown(have) || isUnknown(need)) return 'INDETERMINATE';
  return (kind === 'AT_LEAST' ? have >= need : have <= need) ? 'PASS' : 'FAIL';
};

/**
 * Check one segment against one traveller profile.
 * Returns { verdict, checks[] } where each check names the constraint, the
 * required value, the measured value and its own verdict.
 */
export function checkSegment(seg, profile, gates = new Map()) {
  const checks = [];
  const add = (constraint, verdict, required, measured, note = '') =>
    checks.push({ constraint, verdict, required, measured, note });

  // --- the one constraint that needs no measurement -----------------------
  if (profile.wheeled && seg.kind === 'STAIR') {
    add('STAIR_ON_WHEELED_ROUTE', 'FAIL', 'no steps', `${seg.step_count || 'unspecified'} step segment`,
      'A wheeled traveller cannot climb a flight of stairs. This holds without any dimension being known.');
  } else if (profile.wheeled && seg.step_count > 0) {
    add('STAIR_ON_WHEELED_ROUTE', 'FAIL', 'no steps', `${seg.step_count} steps`,
      'Steps on the path of a wheeled traveller. The route fails regardless of width or grade.');
  } else if (!profile.step_capable && (seg.kind === 'STAIR' || seg.step_count > 0)) {
    add('STEPS_ON_STEP_INCAPABLE_ROUTE', 'FAIL', 'no steps', `${seg.step_count || 'stair'}`,
      'This traveller class cannot negotiate steps.');
  } else if (seg.step_count > 0) {
    add('STEP_RISE', cmp(seg.step_rise_mm, profile.max_step_rise_mm, 'AT_MOST'),
      profile.max_step_rise_mm, seg.step_rise_mm);
  }

  // --- dimensional constraints -------------------------------------------
  add('CLEAR_WIDTH', cmp(seg.clear_width_mm, profile.min_clear_width_mm, 'AT_LEAST'),
    profile.min_clear_width_mm, seg.clear_width_mm);
  add('CLEAR_HEIGHT', cmp(seg.clear_height_mm, profile.min_clear_height_mm, 'AT_LEAST'),
    profile.min_clear_height_mm, seg.clear_height_mm);
  add('TURNING_RADIUS', cmp(seg.min_turning_radius_mm, profile.min_turning_radius_mm, 'AT_LEAST'),
    profile.min_turning_radius_mm, seg.min_turning_radius_mm);
  add('GRADE', cmp(seg.grade_permille, profile.max_grade_permille, 'AT_MOST'),
    profile.max_grade_permille, seg.grade_permille);
  add('SURFACE_LOAD', cmp(seg.surface_load_capacity_n, profile.axle_load_n, 'AT_LEAST'),
    profile.axle_load_n, seg.surface_load_capacity_n);

  // --- gate opening -------------------------------------------------------
  if (seg.gate_id) {
    const g = gates.get(seg.gate_id);
    if (!g) {
      add('GATE_OPENING', 'FAIL', 'a registered gate', seg.gate_id,
        'The segment passes a gate that is not registered. An unregistered gate cannot be shown to open.');
    } else {
      add('GATE_CLEAR_WIDTH', cmp(g.clear_width_mm, profile.min_clear_width_mm, 'AT_LEAST'),
        profile.min_clear_width_mm, g.clear_width_mm);
      add('GATE_CLEAR_HEIGHT', cmp(g.clear_height_mm, profile.min_clear_height_mm, 'AT_LEAST'),
        profile.min_clear_height_mm, g.clear_height_mm);
      if (profile.wheeled) {
        add('GATE_THRESHOLD_RISE', cmp(g.threshold_rise_mm, profile.max_step_rise_mm, 'AT_MOST'),
          profile.max_step_rise_mm, g.threshold_rise_mm);
      }
    }
  }

  const verdict = checks.some(c => c.verdict === 'FAIL') ? 'FAIL'
    : checks.some(c => c.verdict === 'INDETERMINATE') ? 'INDETERMINATE' : 'PASS';
  return { segment_id: seg.segment_id, verdict, checks };
}

/** Solve a whole route. One FAIL fails the route. */
export function solveRoute({ route_id, class_code, segments, profile, gates = new Map() }) {
  if (!segments.length) throw new RouteError(`route ${route_id} has no segments`, { code: 'EMPTY_ROUTE' });
  if (profile.class_code !== class_code) {
    throw new RouteError(`profile ${profile.class_code} does not match route class ${class_code}`, { code: 'CLASS_MISMATCH' });
  }
  // Continuity: the segments must actually join up.
  for (let i = 1; i < segments.length; i++) {
    if (segments[i - 1].to_node !== segments[i].from_node) {
      throw new RouteError(
        `route ${route_id} is discontinuous between ${segments[i - 1].segment_id} and ${segments[i].segment_id}`,
        { code: 'DISCONTINUOUS_ROUTE' });
    }
  }
  const results = segments.map(s => checkSegment(s, profile, gates));
  const failures = results.filter(r => r.verdict === 'FAIL');
  const indeterminate = results.filter(r => r.verdict === 'INDETERMINATE');
  const verdict = failures.length ? 'FAIL' : indeterminate.length ? 'INDETERMINATE' : 'PASS';

  return Object.freeze({
    route_id, class_code, verdict,
    from_node: segments[0].from_node,
    to_node: segments[segments.length - 1].to_node,
    segment_results: results,
    failing_segments: failures.map(f => f.segment_id),
    blocking_constraints: failures.flatMap(f =>
      f.checks.filter(c => c.verdict === 'FAIL').map(c => ({ segment_id: f.segment_id, ...c }))),
    unknown_constraints: indeterminate.flatMap(f =>
      f.checks.filter(c => c.verdict === 'INDETERMINATE').map(c => ({ segment_id: f.segment_id, constraint: c.constraint }))),
    statement: verdict === 'PASS'
      ? 'Every constraint was checked against a known value and satisfied.'
      : verdict === 'FAIL'
        ? 'At least one constraint is violated by a known value. This route does not exist physically.'
        : 'No constraint is violated, but at least one required value is UNKNOWN. This route is NOT established.'
  });
}

/** Solve every class over the same segment chain — the access matrix. */
export function accessMatrix({ route_id, segments, profiles, gates = new Map() }) {
  return profiles.map(p => solveRoute({ route_id: `${route_id}:${p.class_code}`, class_code: p.class_code, segments, profile: p, gates }));
}
