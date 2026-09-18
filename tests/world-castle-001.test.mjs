// THYLORA WORLD · CASTLE-001 state and period profile tests
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildCastleState, buildAccessMatrix, evaluateGate,
  NAME_RECOVERY, NAME_CANDIDATES, UPPER_LEFT_ROOM_PROPOSALS
} from '../world/castle-001.js';
import { audit, unknownCensus, verifiedCount } from '../world/lib/registry.js';
import { buildProfile, admits, CATEGORIES, CANDIDATE_TRADITIONS, PERIOD_STATE, PROFILE_ID } from '../world/lib/period.js';
import { isUnknown } from '../world/lib/frame.js';

test('the castle state is internally honest: the audit is clean', () => {
  assert.deepEqual(audit(buildCastleState()), []);
});

test('the attested scene elements are VERIFIED and nothing else is', () => {
  const reg = buildCastleState();
  const v = verifiedCount(reg);
  assert.equal(v.elements, 2, 'only the castle and the cart are attested');
  assert.ok(reg.elements.get('THYW-EL-CASTLE-001').evidence_state === 'VERIFIED');
  assert.ok(reg.elements.get('THYW-EL-CART-001').evidence_state === 'VERIFIED');
  assert.equal(reg.elements.get('THYW-EL-GATE-001').evidence_state, 'INFERRED');
});

test('the upper-left room exists because the window rule makes it exist', () => {
  const reg = buildCastleState();
  const w = reg.openings.get('THYW-OPEN-UL-001');
  assert.equal(w.opening_kind, 'WINDOW');
  assert.equal(w.inner_space_id, 'THYW-ROOM-UL-001');
  assert.ok(reg.rooms.has('THYW-ROOM-UL-001'));
});

test('the upper-left room has no assigned purpose, and does not pretend to', () => {
  assert.ok(isUnknown(buildCastleState().rooms.get('THYW-ROOM-UL-001').purpose));
});

test('exactly three PROPOSED uses are offered for the upper-left room', () => {
  assert.equal(UPPER_LEFT_ROOM_PROPOSALS.length, 3);
  const keys = UPPER_LEFT_ROOM_PROPOSALS.map(p => p.key);
  assert.equal(new Set(keys).size, 3);
  for (const p of UPPER_LEFT_ROOM_PROPOSALS) {
    assert.ok(p.label && p.why && p.implies, `proposal ${p.key} is incomplete`);
  }
});

test('no element or room carries a measured dimension', () => {
  const reg = buildCastleState();
  for (const e of reg.elements.values()) {
    assert.ok(isUnknown(e.dimensions.length_mm) && isUnknown(e.dimensions.width_mm) && isUnknown(e.dimensions.height_mm),
      `${e.element_id} carries an invented dimension`);
    assert.ok(isUnknown(e.local_transform), `${e.element_id} carries an invented placement`);
  }
});

test('every registered object appears in the unknown census', () => {
  const reg = buildCastleState();
  const ids = new Set(unknownCensus(reg).map(c => c.id));
  for (const id of [...reg.elements.keys(), ...reg.rooms.keys(), ...reg.openings.keys()]) {
    assert.ok(ids.has(id), `${id} is missing from the unknown census`);
  }
});

test('the castle name is UNKNOWN in the backend and is not canonized here', () => {
  assert.equal(NAME_RECOVERY.backend_state, 'UNKNOWN');
  assert.equal(NAME_RECOVERY.canonized, false);
  assert.equal(NAME_CANDIDATES.length, 8);
  for (const c of NAME_CANDIDATES) assert.ok(c.candidate && c.derivation);
});

test('a cart cannot reach the upper room, and the solver says why', () => {
  const m = buildAccessMatrix();
  const cart = m.to_upper_room.find(r => r.class_code === 'CART');
  assert.equal(cart.verdict, 'FAIL');
  assert.ok(cart.blocking_constraints.some(c => c.constraint === 'STAIR_ON_WHEELED_ROUTE'));
});

test('no route is claimed to PASS while its dimensions are unknown', () => {
  const m = buildAccessMatrix();
  for (const r of [...m.to_courtyard, ...m.to_upper_room]) {
    assert.notEqual(r.verdict, 'PASS', `${r.route_id} claims PASS without measurements`);
  }
});

test('the period profile holds thirteen categories with an empty allow-list', () => {
  const p = buildProfile();
  assert.equal(p.profile_id, PROFILE_ID);
  assert.equal(p.categories.length, 13);
  assert.equal(CATEGORIES.length, 13);
  assert.equal(PERIOD_STATE.resolved, false);
  for (const c of p.categories) {
    assert.equal(p.allowed[c].state, 'UNRESOLVED');
    assert.equal(p.allowed[c].items.length, 0);
  }
});

test('the anachronism floor prohibits regardless of the unresolved period', () => {
  const p = buildProfile();
  for (const [cat, item] of [
    ['LIGHTING', 'ELECTRIC_LIGHTING'], ['TRANSPORT', 'RAILWAY'],
    ['MASONRY', 'PORTLAND_CEMENT'], ['RECORDKEEPING', 'DIGITAL_RECORD'],
    ['EDUCATION_MATERIALS', 'MASS_SCHOOL_DESK_FURNITURE']
  ]) {
    assert.equal(admits(p, cat, item).verdict, 'PROHIBITED', `${item} was not prohibited`);
  }
});

test('nothing is ever admitted by default while the period is unresolved', () => {
  const p = buildProfile();
  for (const [cat, item] of [['LIGHTING', 'OIL_LAMP'], ['TRANSPORT', 'OX_CART'], ['MASONRY', 'LIME_MORTAR']]) {
    assert.equal(admits(p, cat, item).verdict, 'HELD_PERIOD_UNRESOLVED');
  }
  assert.equal(admits(p, 'NOT_A_CATEGORY', 'X').verdict, 'REFUSED');
});

test('the candidate traditions are plural and not headed by a European default', () => {
  assert.ok(CANDIDATE_TRADITIONS.length >= 8);
  assert.notEqual(CANDIDATE_TRADITIONS[0].key, 'WEST_EUROPEAN_STONE_CASTLE');
  assert.ok(CANDIDATE_TRADITIONS.some(t => t.key === 'WEST_EUROPEAN_STONE_CASTLE'),
    'the European tradition must still be present as one candidate');
  assert.ok(CANDIDATE_TRADITIONS.some(t => t.key === 'BENIN_CITY_WALLS_AND_PALACE'));
});

test('the gate HOLDs, and every zero factor states its basis', () => {
  const r = evaluateGate();
  assert.equal(r.gate.decision, 'HOLD');
  assert.equal(r.gate.wq, 0);
  assert.ok(r.gate.zero_factors.length > 0);
  for (const z of r.gate.zero_factors) assert.ok(z.basis && z.basis.length > 10, `${z.letter} has no basis`);
});

test('the barrier and window-room factors hold even while the survey does not', () => {
  const f = Object.fromEntries(evaluateGate().gate.factors.map(x => [x.letter, x.value]));
  assert.equal(f.B, 1, 'the interworld barrier must hold');
  assert.equal(f.R, 1, 'the window/room rule must hold');
  assert.equal(f.G, 0, 'geometry must not be claimed');
  assert.equal(f.I, 0, 'identity must not be claimed');
});
