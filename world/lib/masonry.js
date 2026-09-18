// THYLORA WORLD · deterministic procedural masonry
// Workroom: WR-WORLD-CASTLE-001
//
// The Chairman directive allows individual masonry to be stored explicitly OR
// generated as deterministic procedural instances, and requires that the same
// seed and spec reproduce the same wall exactly. This module is that guarantee.
//
// Determinism contract
// --------------------
// 1. The PRNG is splitmix64 over BigInt. No Math.random, no Date, no ambient
//    state, no iteration-order dependence.
// 2. Every unit's variation is drawn from a stream keyed by
//    (seed, course_index, unit_index, channel). A unit's jitter therefore does
//    not depend on how many units were generated before it, so a wall generated
//    in one pass equals the same wall generated course-by-course.
// 3. All arithmetic on stored geometry is integer millimetres.
//
// A spec with an UNKNOWN placement bound generates nothing and says so. It does
// not fall back to a default wall, because a default wall is invented canon.

import { UNKNOWN, isUnknown } from './frame.js';

export class MasonryError extends Error {
  constructor(message, { code = 'MASONRY_ERROR', specId = null } = {}) {
    super(message); this.name = 'MasonryError'; this.code = code; this.specId = specId;
  }
}

export const BOND_PATTERNS = Object.freeze({
  STRETCHER: { offset_fraction_num: 1, offset_fraction_den: 2 },
  ENGLISH_GARDEN_WALL: { offset_fraction_num: 1, offset_fraction_den: 2 },
  HEADER: { offset_fraction_num: 1, offset_fraction_den: 2 },
  FLEMISH: { offset_fraction_num: 1, offset_fraction_den: 4 },
  RUNNING_THIRD: { offset_fraction_num: 1, offset_fraction_den: 3 },
  STACK: { offset_fraction_num: 0, offset_fraction_den: 1 },
  RANDOM_RUBBLE: { offset_fraction_num: 0, offset_fraction_den: 1, coursed: false }
});

const MASK64 = (1n << 64n) - 1n;
const GOLDEN = 0x9E3779B97F4A7C15n;

function splitmix64(state) {
  let z = (state + GOLDEN) & MASK64;
  z = ((z ^ (z >> 30n)) * 0xBF58476D1CE4E5B9n) & MASK64;
  z = ((z ^ (z >> 27n)) * 0x94D049BB133111EBn) & MASK64;
  return (z ^ (z >> 31n)) & MASK64;
}

/** Positional hash: same inputs, same output, forever, in any order. */
export function streamValue(seed, course, unit, channel) {
  let s = BigInt.asUintN(64, BigInt(seed));
  s = splitmix64(s ^ (BigInt(course) * 0x100000001B3n));
  s = splitmix64(s ^ (BigInt(unit) * 0xC2B2AE3D27D4EB4Fn));
  s = splitmix64(s ^ BigInt(channel));
  return s;
}

/** Deterministic integer in [-range, +range], inclusive, uniform. */
export function jitter(seed, course, unit, channel, range) {
  if (range <= 0) return 0;
  const span = BigInt(2 * range + 1);
  return Number(streamValue(seed, course, unit, channel) % span) - range;
}

export function masonrySpec({
  spec_id, seed, unit_length_mm, unit_height_mm, unit_depth_mm,
  mortar_bed_mm, mortar_perpend_mm, bond = 'STRETCHER', material_id,
  placement_bounds, deformation = null, build_phase = 'PHASE_UNKNOWN',
  crew_class = 'UNKNOWN', evidence_state = 'PROPOSED', provenance = null
}) {
  if (!spec_id) throw new MasonryError('spec_id is required', { code: 'SPEC_ID_REQUIRED' });
  if (!Object.prototype.hasOwnProperty.call(BOND_PATTERNS, bond)) {
    throw new MasonryError(`unknown bond pattern: ${bond}`, { code: 'BOND_UNKNOWN', specId: spec_id });
  }
  if (seed === undefined || seed === null) {
    throw new MasonryError(`spec ${spec_id} has no seed; a seedless spec is not reproducible`,
      { code: 'SEED_REQUIRED', specId: spec_id });
  }
  const def = deformation === null
    ? { length_jitter_mm: 0, height_jitter_mm: 0, depth_jitter_mm: 0, yaw_jitter_mdeg: 0, spall_probability_bp: 0, weathering_rule: 'NONE' }
    : { length_jitter_mm: 0, height_jitter_mm: 0, depth_jitter_mm: 0, yaw_jitter_mdeg: 0, spall_probability_bp: 0, weathering_rule: 'NONE', ...deformation };
  for (const [k, v] of Object.entries(def)) {
    if (k === 'weathering_rule') continue;
    if (!Number.isInteger(v) || v < 0) {
      throw new MasonryError(`deformation.${k} must be a non-negative integer, got ${v}`,
        { code: 'BAD_DEFORMATION', specId: spec_id });
    }
  }
  return Object.freeze({
    spec_id, seed: BigInt.asUintN(64, BigInt(seed)).toString(),
    unit_length_mm, unit_height_mm, unit_depth_mm,
    mortar_bed_mm, mortar_perpend_mm, bond, material_id,
    placement_bounds: Object.freeze({ ...placement_bounds }),
    deformation: Object.freeze(def), build_phase, crew_class,
    evidence_state, provenance
  });
}

/** True when every number the generator needs is known. */
export function specIsResolvable(spec) {
  const needed = [
    spec.unit_length_mm, spec.unit_height_mm, spec.unit_depth_mm,
    spec.mortar_bed_mm, spec.mortar_perpend_mm,
    spec.placement_bounds.length_mm, spec.placement_bounds.height_mm
  ];
  return needed.every(v => !isUnknown(v) && Number.isInteger(v) && v >= 0)
    && spec.unit_length_mm > 0 && spec.unit_height_mm > 0;
}

/**
 * Generate the masonry units of a wall.
 * Returns { state: 'HELD_UNKNOWN', ... } when the spec cannot be resolved —
 * never a placeholder wall.
 */
export function generateWall(spec) {
  if (!specIsResolvable(spec)) {
    return Object.freeze({
      spec_id: spec.spec_id, state: 'HELD_UNKNOWN', units: [], course_count: 0,
      reason: 'One or more of unit size, mortar dimensions or placement bounds is UNKNOWN. No masonry is generated; a default wall would be invented canon.'
    });
  }
  const b = spec.placement_bounds;
  const courseHeight = spec.unit_height_mm + spec.mortar_bed_mm;
  const pitch = spec.unit_length_mm + spec.mortar_perpend_mm;
  const courseCount = Math.floor(b.height_mm / courseHeight);
  const bondDef = BOND_PATTERNS[spec.bond];
  const units = [];

  for (let course = 0; course < courseCount; course++) {
    const offsetNum = (course % 2 === 0) ? 0 : bondDef.offset_fraction_num;
    const startX = -Math.round((offsetNum * pitch) / bondDef.offset_fraction_den);
    let unitIndex = 0;
    for (let x = startX; x < b.length_mm; x += pitch, unitIndex++) {
      const dL = jitter(spec.seed, course, unitIndex, 1, spec.deformation.length_jitter_mm);
      const dH = jitter(spec.seed, course, unitIndex, 2, spec.deformation.height_jitter_mm);
      const dD = jitter(spec.seed, course, unitIndex, 3, spec.deformation.depth_jitter_mm);
      const dYaw = jitter(spec.seed, course, unitIndex, 4, spec.deformation.yaw_jitter_mdeg);
      const spallRoll = Number(streamValue(spec.seed, course, unitIndex, 5) % 10000n);
      const spalled = spallRoll < spec.deformation.spall_probability_bp;

      const length = spec.unit_length_mm + dL;
      const clippedStart = Math.max(x, 0);
      const clippedEnd = Math.min(x + length, b.length_mm);
      if (clippedEnd <= clippedStart) continue;

      units.push(Object.freeze({
        unit_id: `${spec.spec_id}:C${course}:U${unitIndex}`,
        spec_id: spec.spec_id,
        course_index: course,
        unit_index: unitIndex,
        x_mm: clippedStart,
        z_mm: course * courseHeight,
        length_mm: clippedEnd - clippedStart,
        height_mm: spec.unit_height_mm + dH,
        depth_mm: spec.unit_depth_mm + dD,
        yaw_mdeg: dYaw,
        clipped: clippedStart !== x || clippedEnd !== x + length,
        spalled,
        material_id: spec.material_id,
        build_phase: spec.build_phase,
        crew_class: spec.crew_class
      }));
    }
  }
  return Object.freeze({
    spec_id: spec.spec_id, state: 'GENERATED', units: Object.freeze(units),
    course_count: courseCount, course_height_mm: courseHeight, pitch_mm: pitch
  });
}

/** Stable fingerprint of a generated wall — the reproducibility witness. */
export function wallFingerprint(wall) {
  let h = 0xCBF29CE484222325n;
  const push = (n) => {
    h = BigInt.asUintN(64, (h ^ BigInt.asUintN(64, BigInt(n))) * 0x100000001B3n);
  };
  push(wall.course_count);
  for (const u of wall.units) {
    push(u.course_index); push(u.unit_index); push(u.x_mm); push(u.z_mm);
    push(u.length_mm); push(u.height_mm); push(u.depth_mm); push(u.yaw_mdeg);
    push(u.spalled ? 1 : 0); push(u.clipped ? 1 : 0);
  }
  return h.toString(16).padStart(16, '0');
}

/** Generate one course only. Must agree with the full wall, unit for unit. */
export function generateCourse(spec, course) {
  const full = generateWall(spec);
  if (full.state !== 'GENERATED') return full;
  return Object.freeze({ ...full, units: full.units.filter(u => u.course_index === course) });
}
