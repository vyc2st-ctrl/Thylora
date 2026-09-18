// THYLORA WORLD · movement and access tests
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  travellerProfile, segment, gate, solveRoute, checkSegment, accessMatrix,
  TRAVELLER_CLASSES, RouteError
} from '../world/lib/routes.js';

const cart = travellerProfile({
  class_code: 'CART', wheeled: true, step_capable: false,
  min_clear_width_mm: 2200, min_clear_height_mm: 3000,
  min_turning_radius_mm: 6000, max_grade_permille: 80,
  axle_load_n: 12000, max_step_rise_mm: 40
});
const walker = travellerProfile({
  class_code: 'PEDESTRIAN', min_clear_width_mm: 800, min_clear_height_mm: 2000,
  min_turning_radius_mm: 0, max_grade_permille: 200, axle_load_n: 1000, max_step_rise_mm: 220
});

const goodRoad = (id, from, to) => segment({
  segment_id: id, from_node: from, to_node: to, kind: 'ROAD',
  clear_width_mm: 4000, clear_height_mm: 99000, min_turning_radius_mm: 9000,
  grade_permille: 40, surface_load_capacity_n: 30000
});

test('stairs fail a cart route with no dimension known at all', () => {
  const stair = segment({ segment_id: 'S', from_node: 'a', to_node: 'b', kind: 'STAIR', step_count: 14 });
  const r = checkSegment(stair, cart);
  assert.equal(r.verdict, 'FAIL');
  const hit = r.checks.find(c => c.constraint === 'STAIR_ON_WHEELED_ROUTE');
  assert.equal(hit.verdict, 'FAIL');
  assert.match(hit.note, /without any dimension being known/);
});

test('a single step on a wheeled path fails the route', () => {
  const stepped = segment({
    segment_id: 'S', from_node: 'a', to_node: 'b', kind: 'PATH', step_count: 1,
    clear_width_mm: 9000, clear_height_mm: 9000, min_turning_radius_mm: 99000,
    grade_permille: 0, surface_load_capacity_n: 99000
  });
  assert.equal(solveRoute({ route_id: 'R', class_code: 'CART', segments: [stepped], profile: cart }).verdict, 'FAIL');
});

test('a fully measured, adequate route passes', () => {
  const r = solveRoute({ route_id: 'R', class_code: 'CART', segments: [goodRoad('A', 'n1', 'n2')], profile: cart });
  assert.equal(r.verdict, 'PASS');
  assert.equal(r.blocking_constraints.length, 0);
  assert.equal(r.unknown_constraints.length, 0);
});

test('an unknown value yields INDETERMINATE, never a soft pass', () => {
  const partial = segment({
    segment_id: 'A', from_node: 'n1', to_node: 'n2', kind: 'ROAD',
    clear_width_mm: 4000, clear_height_mm: 99000
  });
  const r = solveRoute({ route_id: 'R', class_code: 'CART', segments: [partial], profile: cart });
  assert.equal(r.verdict, 'INDETERMINATE');
  assert.match(r.statement, /NOT established/);
  assert.ok(r.unknown_constraints.length >= 3);
});

test('one FAIL anywhere fails the whole route', () => {
  const narrow = segment({
    segment_id: 'B', from_node: 'n2', to_node: 'n3', kind: 'DOORWAY',
    clear_width_mm: 900, clear_height_mm: 99000, min_turning_radius_mm: 99000,
    grade_permille: 0, surface_load_capacity_n: 99000
  });
  const r = solveRoute({ route_id: 'R', class_code: 'CART', segments: [goodRoad('A', 'n1', 'n2'), narrow], profile: cart });
  assert.equal(r.verdict, 'FAIL');
  assert.deepEqual(r.failing_segments, ['B']);
  assert.equal(r.blocking_constraints[0].constraint, 'CLEAR_WIDTH');
});

test('each blocking constraint reports what was required and what was measured', () => {
  const steep = segment({
    segment_id: 'C', from_node: 'n1', to_node: 'n2', kind: 'SLOPE',
    clear_width_mm: 9000, clear_height_mm: 9000, min_turning_radius_mm: 99000,
    grade_permille: 300, surface_load_capacity_n: 99000
  });
  const b = solveRoute({ route_id: 'R', class_code: 'CART', segments: [steep], profile: cart }).blocking_constraints[0];
  assert.equal(b.constraint, 'GRADE');
  assert.equal(b.required, 80);
  assert.equal(b.measured, 300);
});

test('a surface that cannot carry the axle load fails the route', () => {
  const weak = segment({
    segment_id: 'D', from_node: 'n1', to_node: 'n2', kind: 'BRIDGE',
    clear_width_mm: 9000, clear_height_mm: 9000, min_turning_radius_mm: 99000,
    grade_permille: 0, surface_load_capacity_n: 500
  });
  const r = solveRoute({ route_id: 'R', class_code: 'CART', segments: [weak], profile: cart });
  assert.equal(r.verdict, 'FAIL');
  assert.equal(r.blocking_constraints[0].constraint, 'SURFACE_LOAD');
});

test('a gate that is not registered cannot be shown to open', () => {
  const seg = segment({
    segment_id: 'G', from_node: 'n1', to_node: 'n2', kind: 'GATE', gate_id: 'MISSING',
    clear_width_mm: 9000, clear_height_mm: 9000, min_turning_radius_mm: 99000,
    grade_permille: 0, surface_load_capacity_n: 99000
  });
  const r = solveRoute({ route_id: 'R', class_code: 'CART', segments: [seg], profile: cart });
  assert.equal(r.verdict, 'FAIL');
  assert.equal(r.blocking_constraints[0].constraint, 'GATE_OPENING');
});

test('a narrow gate opening fails a cart but passes a walker', () => {
  const gates = new Map([['G1', gate({
    gate_id: 'G1', clear_width_mm: 1100, clear_height_mm: 2400, threshold_rise_mm: 20
  })]]);
  const seg = segment({
    segment_id: 'G', from_node: 'n1', to_node: 'n2', kind: 'GATE', gate_id: 'G1',
    clear_width_mm: 9000, clear_height_mm: 9000, min_turning_radius_mm: 99000,
    grade_permille: 0, surface_load_capacity_n: 99000
  });
  assert.equal(solveRoute({ route_id: 'R', class_code: 'CART', segments: [seg], profile: cart, gates }).verdict, 'FAIL');
  assert.equal(solveRoute({ route_id: 'R', class_code: 'PEDESTRIAN', segments: [seg], profile: walker, gates }).verdict, 'PASS');
});

test('a discontinuous route is refused rather than silently joined', () => {
  assert.throws(() => solveRoute({
    route_id: 'R', class_code: 'CART',
    segments: [goodRoad('A', 'n1', 'n2'), goodRoad('B', 'n9', 'n3')], profile: cart
  }), /discontinuous/);
});

test('a profile may not be applied to another class', () => {
  assert.throws(() => solveRoute({
    route_id: 'R', class_code: 'PEDESTRIAN', segments: [goodRoad('A', 'n1', 'n2')], profile: cart
  }), RouteError);
});

test('an empty route is refused', () => {
  assert.throws(() => solveRoute({ route_id: 'R', class_code: 'CART', segments: [], profile: cart }), /no segments/);
});

test('the access matrix judges every traveller class over one chain', () => {
  const stair = segment({ segment_id: 'S', from_node: 'n2', to_node: 'n3', kind: 'STAIR', step_count: 12, step_rise_mm: 180,
    clear_width_mm: 1200, clear_height_mm: 2200, min_turning_radius_mm: 0, grade_permille: 0, surface_load_capacity_n: 9000 });
  const profiles = [cart, walker];
  const rows = accessMatrix({ route_id: 'R', segments: [goodRoad('A', 'n1', 'n2'), stair], profiles });
  assert.equal(rows.length, 2);
  assert.equal(rows.find(r => r.class_code === 'CART').verdict, 'FAIL');
  assert.equal(rows.find(r => r.class_code === 'PEDESTRIAN').verdict, 'PASS');
});

test('every declared traveller class is constructible', () => {
  for (const c of TRAVELLER_CLASSES) {
    assert.equal(travellerProfile({ class_code: c }).class_code, c);
  }
  assert.throws(() => travellerProfile({ class_code: 'HOVERCRAFT' }), /unknown traveller class/);
});
