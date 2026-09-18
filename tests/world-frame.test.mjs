// THYLORA WORLD · coordinate frame tests
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  defineFrame, transform, compose, resolveTo, normaliseAngle, isUnknown,
  UNKNOWN, CASTLE_FRAME_TREE, ORIGIN_RULE, assertSameWorldLineage, FrameError,
  LINEAR_UNIT, ANGULAR_UNIT
} from '../world/lib/frame.js';

test('the castle frame tree is rooted in the named world EdereAriah', () => {
  const ids = CASTLE_FRAME_TREE.map(f => f.frame_id);
  assert.deepEqual(ids, [
    'THYW-FRAME-PLANET-EDEREARIAH', 'THYW-FRAME-REGION-UNKNOWN',
    'THYW-FRAME-SITE-001', 'THYW-FRAME-CASTLE-001'
  ]);
  assert.equal(CASTLE_FRAME_TREE[0].parent_frame_id, null);
  for (const f of CASTLE_FRAME_TREE.slice(1)) assert.ok(f.parent_frame_id);
});

test('units are integer millimetres and millidegrees', () => {
  assert.equal(LINEAR_UNIT, 'mm_int');
  assert.equal(ANGULAR_UNIT, 'mdeg_int');
  assert.throws(() => transform({ x_mm: 1.5, y_mm: 0, z_mm: 0 }), /integer/);
});

test('a non-planet frame must name a parent', () => {
  assert.throws(() => defineFrame({ frame_id: 'X', kind: 'SITE' }), FrameError);
});

test('the origin rule is defined but not resolved, and its values are UNKNOWN', () => {
  assert.equal(ORIGIN_RULE.resolved, false);
  assert.ok(ORIGIN_RULE.horizontal_rule.length > 0);
  assert.ok(isUnknown(ORIGIN_RULE.declination_to_true_north_mdeg));
  assert.ok(isUnknown(ORIGIN_RULE.datum_offset_to_planetary_sea_level_mm));
});

test('every transform in the shipped castle tree is UNKNOWN', () => {
  for (const f of CASTLE_FRAME_TREE) assert.ok(isUnknown(f.transform), `${f.frame_id} carries a transform`);
});

test('compose translates and rotates', () => {
  const outer = transform({ x_mm: 1000, y_mm: 0, z_mm: 0, yaw_mdeg: 90 * 1000 });
  const inner = transform({ x_mm: 500, y_mm: 0, z_mm: 250 });
  const r = compose(outer, inner);
  assert.equal(r.x_mm, 1000);
  assert.equal(r.y_mm, 500);
  assert.equal(r.z_mm, 250);
  assert.equal(r.yaw_mdeg, 90 * 1000);
});

test('UNKNOWN is absorbing: it never becomes a number', () => {
  assert.ok(isUnknown(compose(UNKNOWN, transform({ x_mm: 1, y_mm: 1, z_mm: 1 }))));
  assert.ok(isUnknown(compose(transform({ x_mm: 1, y_mm: 1, z_mm: 1 }), UNKNOWN)));
});

test('angles normalise into one turn', () => {
  assert.equal(normaliseAngle(-1000), 359 * 1000);
  assert.equal(normaliseAngle(360 * 1000), 0);
  assert.equal(normaliseAngle(720 * 1000 + 5), 5);
});

test('resolveTo returns UNKNOWN when any link is unknown, and never invents a number', () => {
  assert.ok(isUnknown(resolveTo(CASTLE_FRAME_TREE, 'THYW-FRAME-CASTLE-001', 'THYW-FRAME-PLANET-EDEREARIAH')));
});

test('resolveTo composes a fully known chain', () => {
  const frames = [
    defineFrame({ frame_id: 'W', kind: 'PLANET' }),
    defineFrame({ frame_id: 'A', kind: 'SITE', parent_frame_id: 'W', transform: transform({ x_mm: 100, y_mm: 0, z_mm: 0 }) }),
    defineFrame({ frame_id: 'B', kind: 'STRUCTURE', parent_frame_id: 'A', transform: transform({ x_mm: 50, y_mm: 25, z_mm: 10 }) })
  ];
  const r = resolveTo(frames, 'B', 'W');
  assert.equal(r.x_mm, 150);
  assert.equal(r.y_mm, 25);
  assert.equal(r.z_mm, 10);
});

test('a cycle in the hierarchy is refused, not walked forever', () => {
  const frames = [
    defineFrame({ frame_id: 'A', kind: 'SITE', parent_frame_id: 'B', transform: transform({ x_mm: 0, y_mm: 0, z_mm: 0 }) }),
    defineFrame({ frame_id: 'B', kind: 'SITE', parent_frame_id: 'A', transform: transform({ x_mm: 0, y_mm: 0, z_mm: 0 }) })
  ];
  assert.throws(() => resolveTo(frames, 'A', 'ZZZ'), /cycle/);
});

test('the interworld barrier refuses frames from another world root', () => {
  const frames = [
    defineFrame({ frame_id: 'W1', kind: 'PLANET' }),
    defineFrame({ frame_id: 'W2', kind: 'PLANET' }),
    defineFrame({ frame_id: 'A', kind: 'SITE', parent_frame_id: 'W1' }),
    defineFrame({ frame_id: 'B', kind: 'SITE', parent_frame_id: 'W2' })
  ];
  assert.equal(assertSameWorldLineage(frames, 'A', 'A'), true);
  assert.throws(() => assertSameWorldLineage(frames, 'A', 'B'), /interworld barrier/);
});

test('the world name is VERIFIED while the planet\'s geometry stays UNKNOWN', () => {
  const planet = CASTLE_FRAME_TREE[0];
  assert.equal(planet.frame_id, 'THYW-FRAME-PLANET-EDEREARIAH');
  assert.equal(planet.evidence_state, 'VERIFIED');
  assert.match(planet.provenance, /radius and sea-level datum remain UNKNOWN/);
});
