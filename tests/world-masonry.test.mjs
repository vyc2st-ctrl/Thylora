// THYLORA WORLD · deterministic masonry tests
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  masonrySpec, generateWall, generateCourse, wallFingerprint, jitter,
  streamValue, specIsResolvable, BOND_PATTERNS, MasonryError
} from '../world/lib/masonry.js';

const base = {
  spec_id: 'THYW-MSPEC-TEST', seed: 20260918,
  unit_length_mm: 400, unit_height_mm: 200, unit_depth_mm: 300,
  mortar_bed_mm: 12, mortar_perpend_mm: 12, bond: 'STRETCHER',
  material_id: 'THYW-MAT-UNKNOWN',
  placement_bounds: { length_mm: 6000, height_mm: 3000 },
  deformation: { length_jitter_mm: 6, height_jitter_mm: 4, depth_jitter_mm: 3, yaw_jitter_mdeg: 500, spall_probability_bp: 400 }
};

test('a spec without a seed is refused', () => {
  const { seed, ...noSeed } = base;
  assert.throws(() => masonrySpec(noSeed), MasonryError);
});

test('an unknown bond pattern is refused', () => {
  assert.throws(() => masonrySpec({ ...base, bond: 'HERRINGBONE_NOT_REGISTERED' }), /unknown bond/);
});

test('the same seed and spec reproduce the same wall exactly', () => {
  const spec = masonrySpec(base);
  const a = generateWall(spec);
  const b = generateWall(spec);
  assert.equal(a.state, 'GENERATED');
  assert.equal(a.units.length, b.units.length);
  assert.equal(wallFingerprint(a), wallFingerprint(b));
  assert.deepEqual(a.units, b.units);
});

test('a rebuilt spec object with the same values reproduces the same wall', () => {
  const a = generateWall(masonrySpec(base));
  const b = generateWall(masonrySpec(JSON.parse(JSON.stringify(base))));
  assert.equal(wallFingerprint(a), wallFingerprint(b));
});

test('a different seed produces a different wall', () => {
  const a = generateWall(masonrySpec(base));
  const b = generateWall(masonrySpec({ ...base, seed: base.seed + 1 }));
  assert.notEqual(wallFingerprint(a), wallFingerprint(b));
  assert.equal(a.units.length > 0, true);
});

test('generating one course agrees with the full wall, unit for unit', () => {
  const spec = masonrySpec(base);
  const full = generateWall(spec);
  for (let c = 0; c < full.course_count; c++) {
    assert.deepEqual(generateCourse(spec, c).units, full.units.filter(u => u.course_index === c));
  }
});

test('a unit does not depend on how many units preceded it', () => {
  const spec = masonrySpec(base);
  const wide = generateWall(masonrySpec({ ...base, placement_bounds: { length_mm: 24000, height_mm: 3000 } }));
  const narrow = generateWall(spec);
  const pick = (w, c, u) => w.units.find(x => x.course_index === c && x.unit_index === u);
  const a = pick(narrow, 3, 2), b = pick(wide, 3, 2);
  assert.ok(a && b);
  assert.equal(a.height_mm, b.height_mm);
  assert.equal(a.yaw_mdeg, b.yaw_mdeg);
  assert.equal(a.spalled, b.spalled);
});

test('an UNKNOWN dimension holds generation instead of inventing a default wall', () => {
  const spec = masonrySpec({ ...base, unit_length_mm: null, placement_bounds: { length_mm: null, height_mm: null } });
  const w = generateWall(spec);
  assert.equal(w.state, 'HELD_UNKNOWN');
  assert.equal(w.units.length, 0);
  assert.match(w.reason, /invented canon/);
  assert.equal(specIsResolvable(spec), false);
});

test('courses alternate by the bond offset', () => {
  const stack = generateWall(masonrySpec({ ...base, bond: 'STACK', deformation: null }));
  const c0 = stack.units.filter(u => u.course_index === 0);
  const c1 = stack.units.filter(u => u.course_index === 1);
  assert.deepEqual(c0.map(u => u.x_mm), c1.map(u => u.x_mm));

  const running = generateWall(masonrySpec({ ...base, bond: 'STRETCHER', deformation: null }));
  const r0 = running.units.filter(u => u.course_index === 0);
  const r1 = running.units.filter(u => u.course_index === 1);
  assert.notDeepEqual(r0.map(u => u.x_mm), r1.map(u => u.x_mm));
});

test('units are clipped to the placement bounds, never generated outside them', () => {
  const w = generateWall(masonrySpec({ ...base, deformation: null }));
  for (const u of w.units) {
    assert.ok(u.x_mm >= 0, 'unit starts before the bound');
    assert.ok(u.x_mm + u.length_mm <= base.placement_bounds.length_mm, 'unit runs past the bound');
    assert.ok(u.z_mm + u.height_mm <= base.placement_bounds.height_mm + base.mortar_bed_mm);
  }
});

test('jitter is bounded, integral and reproducible', () => {
  for (let i = 0; i < 200; i++) {
    const v = jitter(99, i % 7, i, 1, 5);
    assert.ok(Number.isInteger(v) && v >= -5 && v <= 5);
    assert.equal(v, jitter(99, i % 7, i, 1, 5));
  }
  assert.equal(jitter(99, 0, 0, 1, 0), 0);
});

test('the stream is a pure function of its coordinates', () => {
  assert.equal(streamValue(1, 2, 3, 4), streamValue(1, 2, 3, 4));
  assert.notEqual(streamValue(1, 2, 3, 4), streamValue(1, 2, 3, 5));
});

test('every registered bond pattern generates', () => {
  for (const bond of Object.keys(BOND_PATTERNS)) {
    const w = generateWall(masonrySpec({ ...base, bond }));
    assert.equal(w.state, 'GENERATED', `${bond} did not generate`);
    assert.ok(w.units.length > 0, `${bond} produced no units`);
  }
});
