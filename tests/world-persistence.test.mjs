// THYLORA WORLD · persisted state readback tests
// The files under world/data/ are emitted from world/lib/ and world/castle-001.js.
// These tests read them back from disk and check they still say what the code
// says. That is the readback half of "write to backend, read back to verify".
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { evaluateGate, NAME_CANDIDATES, UPPER_LEFT_ROOM_PROPOSALS } from '../world/castle-001.js';
import { checkNonRegression } from '../world/lib/nonregression.js';

const dataPath = (name) => fileURLToPath(new URL(`../world/data/${name}`, import.meta.url));
const load = (name) => JSON.parse(readFileSync(dataPath(name), 'utf8'));

test('re-emitting produces byte-identical files: the state cannot drift from its rules', () => {
  const names = [
    'master-coordinate-system.json', 'castle-001.state.json', 'unknown-register.json',
    'name-recovery.json', 'upper-left-room.json', 'access-matrix.json',
    'period-tech-profile-castle-001.json', 'wq-gate.json', 'world-versions.json'
  ];
  const before = Object.fromEntries(names.map(n => [n, readFileSync(dataPath(n), 'utf8')]));
  execFileSync(process.execPath, [fileURLToPath(new URL('../world/emit.mjs', import.meta.url))]);
  for (const n of names) {
    assert.equal(readFileSync(dataPath(n), 'utf8'), before[n], `${n} changed on re-emit`);
  }
});

test('the persisted gate decision matches a fresh evaluation', () => {
  const stored = load('wq-gate.json');
  const fresh = evaluateGate().gate;
  assert.equal(stored.decision, fresh.decision);
  assert.equal(stored.wq, fresh.wq);
  assert.deepEqual(stored.zero_factors.map(z => z.letter), fresh.zero_factors.map(z => z.letter));
  assert.equal(stored.decision, 'HOLD');
});

test('no persisted element or room carries an invented measurement', () => {
  const state = load('castle-001.state.json');
  for (const e of state.elements) {
    assert.equal(e.local_transform, null, `${e.element_id} carries a placement`);
    for (const axis of ['length_mm', 'width_mm', 'height_mm']) {
      assert.equal(e.dimensions[axis], null, `${e.element_id}.${axis} carries a value`);
    }
  }
  for (const r of state.rooms) {
    assert.equal(r.purpose, null, `${r.room_id} carries an assigned purpose`);
    assert.equal(r.ceiling_height_mm, null);
  }
});

test('every persisted object carries provenance', () => {
  const state = load('castle-001.state.json');
  for (const row of [...state.elements, ...state.rooms, ...state.openings]) {
    const p = row.provenance;
    assert.ok(p && p.source && p.source_kind && p.confidence, `a row is missing provenance`);
  }
});

test('nothing is VERIFIED from an ABSENT source', () => {
  const state = load('castle-001.state.json');
  for (const row of [...state.elements, ...state.rooms, ...state.openings]) {
    if (row.evidence_state === 'VERIFIED') assert.notEqual(row.provenance.source_kind, 'ABSENT');
  }
});

test('the persisted state passes its own audit', () => {
  assert.deepEqual(load('castle-001.state.json').audit_findings, []);
});

test('no persisted route claims PASS', () => {
  for (const r of load('access-matrix.json').routes) {
    assert.notEqual(r.verdict, 'PASS', `${r.route_id} claims PASS without measurements`);
  }
});

test('the castle name is not canonized in the persisted state', () => {
  const n = load('name-recovery.json');
  assert.equal(n.recovery.backend_state, 'UNKNOWN');
  assert.equal(n.recovery.canonized, false);
  assert.equal(n.candidates.length, 8);
  assert.deepEqual(n.candidates.map(c => c.candidate), NAME_CANDIDATES.map(c => c.candidate));
});

test('the upper-left room has proposals but no assignment', () => {
  const r = load('upper-left-room.json');
  assert.equal(r.assigned_purpose, null);
  assert.equal(r.proposals.length, 3);
  assert.deepEqual(r.proposals.map(p => p.key), UPPER_LEFT_ROOM_PROPOSALS.map(p => p.key));
});

test('every unknown in the register is open and says how it closes', () => {
  const u = load('unknown-register.json');
  assert.ok(u.entries.length > 0);
  for (const e of u.entries) {
    assert.equal(e.closed, false);
    assert.ok(e.closes_when && e.why_unknown);
  }
});

test('the period profile is unresolved with an empty allow-list', () => {
  const p = load('period-tech-profile-castle-001.json');
  assert.equal(p.period.resolved, false);
  for (const c of p.categories) assert.equal(p.allowed[c].items.length, 0);
});

test('the master coordinate system stores no transform and no resolved origin', () => {
  const m = load('master-coordinate-system.json');
  assert.equal(m.units.linear, 'mm_int');
  assert.equal(m.origin_rule.resolved, false);
  for (const f of m.frame_tree) assert.equal(f.transform, null, `${f.frame_id} carries a transform`);
  assert.equal(m.frame_tree[0].frame_id, 'THYW-FRAME-PLANET-EDEREARIAH');
});

test('version 1 is the floor and matches the state it was cut from', () => {
  const v = load('world-versions.json').versions[0];
  const s = load('castle-001.state.json');
  assert.equal(v.sequence_no, 1);
  assert.equal(v.parent_version_id, null);
  assert.equal(v.element_count, s.counts.elements);
  assert.equal(v.room_count, s.counts.rooms);
  assert.equal(v.opening_count, s.counts.openings);
  assert.equal(v.verified_element_count, s.counts.verified.elements);
  assert.equal(v.wq_decision, 'HOLD');
});

test('the persisted state does not regress against itself', () => {
  const s = load('castle-001.state.json');
  const r = checkNonRegression(s, s);
  assert.equal(r.pass, true);
  assert.deepEqual(r.losses, []);
});

test('a proposed future version that drops an element is caught by the floor', () => {
  const s = load('castle-001.state.json');
  const stripped = { ...s, elements: s.elements.slice(1) };
  const r = checkNonRegression(s, stripped);
  assert.equal(r.pass, false);
  assert.equal(r.losses[0].facet, 'IDENTITY');
});
