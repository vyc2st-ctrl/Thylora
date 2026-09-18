// THYLORA WORLD · non-regression and Wq gate tests
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkNonRegression, supersession, PROTECTED_FACETS } from '../world/lib/nonregression.js';
import { evaluate, FACTOR_LETTERS, PROPOSED_FACTOR_BINDINGS, BINDING_STATE, GateError } from '../world/lib/gate.js';

const el = (over = {}) => ({
  element_id: 'E1', element_class: 'WALL', parent_id: 'P', frame_id: 'F',
  material_id: 'M', dimensions: { length_mm: 5000, width_mm: 900, height_mm: 4000 },
  local_transform: { x_mm: 0, y_mm: 0, z_mm: 0 }, provenance: { source: 'S1' },
  evidence_state: 'VERIFIED', ...over
});
const world = (elements = [], rooms = [], openings = [], routes = []) => ({ elements, rooms, openings, routes });

test('an identical next version passes', () => {
  const r = checkNonRegression(world([el()]), world([el()]));
  assert.equal(r.pass, true);
  assert.deepEqual(r.losses, []);
});

test('adding new objects is a gain, not a regression', () => {
  const r = checkNonRegression(world([el()]), world([el(), el({ element_id: 'E2' })]));
  assert.equal(r.pass, true);
  assert.deepEqual(r.gains.elements, ['E2']);
});

test('filling in an UNKNOWN is never a regression', () => {
  const before = world([el({ dimensions: { length_mm: null, width_mm: null, height_mm: null } })]);
  const after = world([el({ dimensions: { length_mm: 5000, width_mm: 900, height_mm: 4000 } })]);
  assert.equal(checkNonRegression(before, after).pass, true);
});

test('losing an established dimension is a regression', () => {
  const after = world([el({ dimensions: { length_mm: null, width_mm: 900, height_mm: 4000 } })]);
  const r = checkNonRegression(world([el()]), after);
  assert.equal(r.pass, false);
  assert.equal(r.losses[0].facet, 'DIMENSIONS');
});

test('silently changing an established dimension is a regression', () => {
  const after = world([el({ dimensions: { length_mm: 4000, width_mm: 900, height_mm: 4000 } })]);
  const r = checkNonRegression(world([el()]), after);
  assert.equal(r.pass, false);
  assert.match(r.losses[0].statement, /5000->4000/);
});

test('deleting an object is a regression', () => {
  const r = checkNonRegression(world([el()]), world([]));
  assert.equal(r.pass, false);
  assert.equal(r.losses[0].facet, 'IDENTITY');
});

test('losing a placement is a geometry regression', () => {
  const r = checkNonRegression(world([el()]), world([el({ local_transform: null })]));
  assert.equal(r.pass, false);
  assert.ok(r.losses.some(l => l.facet === 'GEOMETRY'));
});

test('losing provenance is a regression', () => {
  const r = checkNonRegression(world([el()]), world([el({ provenance: null })]));
  assert.ok(r.losses.some(l => l.facet === 'PROVENANCE'));
});

test('downgrading a VERIFIED object is a regression', () => {
  const r = checkNonRegression(world([el()]), world([el({ evidence_state: 'PROPOSED' })]));
  assert.ok(r.losses.some(l => l.facet === 'PROVENANCE' && /was VERIFIED/.test(l.statement)));
});

test('losing a room assignment is a ROOM_ASSIGNMENT regression', () => {
  const rm = (over = {}) => ({ room_id: 'R1', storey_id: 'S', purpose: 'TUTORIAL_CHAMBER', period_state: 'X', dimensions: {}, ...over });
  const r = checkNonRegression(world([], [rm()]), world([], [rm({ purpose: null })]));
  assert.equal(r.losses[0].facet, 'ROOM_ASSIGNMENT');
});

test('losing a route is a ROUTES regression', () => {
  const rt = { route_id: 'RT1', class_code: 'CART', from_node: 'a', to_node: 'b' };
  const r = checkNonRegression(world([], [], [], [rt]), world([], [], [], []));
  assert.equal(r.losses[0].facet, 'ROUTES');
});

test('only an explicit Chairman supersession permits a loss', () => {
  const s = supersession({
    object_id: 'E1', facet: 'DIMENSIONS', authority: 'CHAIRMAN',
    directive_ref: 'THY-TEST-001', reason: 'resurvey', recorded_at: '2026-09-18'
  });
  const after = world([el({ dimensions: { length_mm: 4200, width_mm: 900, height_mm: 4000 } })]);
  const r = checkNonRegression(world([el()]), after, [s]);
  assert.equal(r.pass, true);
  assert.equal(r.permitted.length, 1);
  assert.equal(r.permitted[0].object_id, 'E1');
});

test('a supersession may not be issued by anyone but the Chairman, and must cite a directive', () => {
  assert.throws(() => supersession({ object_id: 'E1', facet: 'DIMENSIONS', authority: 'CLAUDE', directive_ref: 'X', reason: '', recorded_at: '' }), /only CHAIRMAN/);
  assert.throws(() => supersession({ object_id: 'E1', facet: 'DIMENSIONS', authority: 'CHAIRMAN', reason: '', recorded_at: '' }), /names no directive/);
  assert.throws(() => supersession({ object_id: 'E1', facet: 'VIBES', authority: 'CHAIRMAN', directive_ref: 'X', reason: '', recorded_at: '' }), /unknown protected facet/);
  assert.equal(PROTECTED_FACETS.length, 7);
});

test('a supersession is scoped to one object and one facet', () => {
  const s = supersession({ object_id: 'E1', facet: 'DIMENSIONS', authority: 'CHAIRMAN', directive_ref: 'T', reason: '', recorded_at: '' });
  const after = world([el({ element_id: 'E1', material_id: null })]);
  const r = checkNonRegression(world([el()]), after, [s]);
  assert.equal(r.pass, false, 'a DIMENSIONS supersession must not excuse a TOPOLOGY loss');
});

// --- Wq gate ---------------------------------------------------------------

const allOnes = () => Object.fromEntries(FACTOR_LETTERS.map(l => [l, { value: 1, basis: 'test' }]));

test('the gate carries exactly the eleven declared letters', () => {
  assert.deepEqual(FACTOR_LETTERS, ['G', 'A', 'O', 'P', 'T', 'C', 'H', 'I', 'B', 'R', 'V']);
  assert.equal(PROPOSED_FACTOR_BINDINGS.length, 11);
});

test('all ones proceeds', () => {
  const r = evaluate(allOnes());
  assert.equal(r.wq, 1);
  assert.equal(r.decision, 'PROCEED');
});

test('any single zero holds, and names itself', () => {
  for (const letter of FACTOR_LETTERS) {
    const f = allOnes();
    f[letter] = { value: 0, basis: `${letter} is not established` };
    const r = evaluate(f);
    assert.equal(r.decision, 'HOLD', `${letter}=0 did not HOLD`);
    assert.equal(r.wq, 0);
    assert.deepEqual(r.zero_factors.map(z => z.letter), [letter]);
  }
});

test('the factor bindings are marked as not canon unless the caller accepts them', () => {
  assert.equal(evaluate(allOnes()).binding_state, BINDING_STATE);
  assert.equal(BINDING_STATE, 'PROPOSED_NOT_CANON');
  assert.match(evaluate(allOnes(), { accept_proposed_bindings: true }).binding_state, /PROPOSED_ACCEPTED_BY_CALLER/);
});

test('a missing factor, a bad value or a missing basis is refused', () => {
  const f = allOnes(); delete f.V;
  assert.throws(() => evaluate(f), /missing factor/);
  assert.throws(() => evaluate({ ...allOnes(), G: { value: 0.5, basis: 'x' } }), GateError);
  assert.throws(() => evaluate({ ...allOnes(), G: { value: 1 } }), /no basis/);
});
