// THYLORA · Gate Network tests (WR-GATE-NETWORK-620)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  GATES, GATE_CODES, AUTHORITY, AUTONOMY_CLASS_AUTHORITY, validateGraph, evaluateGate,
  evaluateRoute, routeValue, laneContinuation, crossGateClearance
} from '../gates/gate-network.js';
import { ROUTES } from '../gates/routes.js';
import { renderGateDoc, DOC_URL } from '../gates/render-doc.mjs';
import { readFileSync } from 'node:fs';

const SAFE = { authority_level: AUTHORITY.AUTONOMY_SAFE_INTERNAL };
const FULL = { E: 1, C: 1, R: 1, X: 1 };

test('the graph has exactly the twelve gates, in order', () => {
  assert.deepEqual(GATE_CODES, ['PERSON', 'PRIVACY', 'SCENE', 'OBJECT', 'VISUAL', 'RIGHTS',
    'PRODUCT', 'STORE', 'PUBLICATION', 'MONEY', 'LEGAL', 'AUTONOMY']);
});

test('the graph is consistent: every edge reciprocated, every rule and gap action defined', () => {
  assert.deepEqual(validateGraph(), []);
});

test('every gate is connected to at least one other gate', () => {
  for (const code of GATE_CODES) assert.ok(GATES[code].connected.length > 0, code);
});

test('authority is computed, never supplied: autonomy cannot pass STORE, PUBLICATION, MONEY or LEGAL', () => {
  for (const code of ['STORE', 'PUBLICATION', 'MONEY', 'LEGAL']) {
    const r = evaluateGate(code, { ...FULL, A: 1 }, SAFE);
    assert.equal(r.factors.A, 0, code);
    assert.equal(r.decision, 'ESCALATE', code);
  }
});

test('CHAIRMAN_RESERVED and unknown classes hold no authority', () => {
  assert.equal(AUTONOMY_CLASS_AUTHORITY.CHAIRMAN_RESERVED, AUTHORITY.NONE);
  assert.equal(evaluateGate('OBJECT', FULL, {}).decision, 'ESCALATE');
});

test('UNKNOWN stays UNKNOWN: a missing factor holds the gate and G is null', () => {
  const r = evaluateGate('OBJECT', { E: 1, C: 1, R: null, X: 1 }, SAFE);
  assert.equal(r.decision, 'HOLD');
  assert.equal(r.gap_action, 'PRESERVE_UNKNOWN');
  assert.equal(r.G, null);
});

test('evidence below floor holds with REPAIR even when the product would be high', () => {
  const r = evaluateGate('OBJECT', { E: 0.85, C: 1, R: 1, X: 1 }, SAFE);
  assert.equal(r.decision, 'HOLD');
  assert.equal(r.gap_action, 'REPAIR');
});

test('full factors with sufficient authority pass', () => {
  const r = evaluateGate('PRODUCT', FULL, SAFE);
  assert.equal(r.decision, 'PASS');
  assert.equal(r.G, 1);
  assert.deepEqual(r.warnings, []);
});

test('a non-passing gate warns each connected gate', () => {
  const r = evaluateGate('SCENE', { E: 0, C: 1, R: 1, X: 1 }, SAFE);
  assert.deepEqual(r.warnings.map(w => w.to).sort(), [...GATES.SCENE.connected].sort());
});

test('factors outside [0,1] are rejected', () => {
  assert.throws(() => evaluateGate('OBJECT', { E: 2, C: 1, R: 1, X: 1 }, SAFE));
});

test('cross-gate warnings reduce X inside a route and push later gates to PARTIAL', () => {
  const res = evaluateRoute('R1', ['OBJECT', 'PRODUCT'], {
    OBJECT: { E: 0.95, C: 0.5, R: 1 }, PRODUCT: { E: 1, C: 1, R: 1 }
  }, SAFE);
  assert.equal(res.receipts[0].decision, 'PARTIAL');
  assert.equal(res.receipts[1].factors.X, 0.5);
  assert.equal(res.receipts[1].decision, 'PARTIAL');
});

test('warnings from another route never reduce X (lane independence)', () => {
  const warnings = [{ to: 'VISUAL', route: 'DOCTOR-TRANSMISSION' }];
  assert.equal(crossGateClearance('VISUAL', warnings, 'SECOND-GEAR-DETECTIVE'), 1);
  assert.equal(crossGateClearance('VISUAL', warnings, 'DOCTOR-TRANSMISSION'), 0.5);
});

test('a held Doctor Transmission scene does not block the product lanes', () => {
  const doctor = evaluateRoute('DOCTOR-TRANSMISSION', ['SCENE'], { SCENE: { E: 0, C: 0, R: 0 } }, SAFE);
  const sgd = evaluateRoute('SECOND-GEAR-DETECTIVE', ['OBJECT', 'RIGHTS', 'PRODUCT'], {
    OBJECT: FULL, RIGHTS: FULL, PRODUCT: FULL
  }, { authority_level: AUTHORITY.OPERATOR });
  const lanes = laneContinuation([doctor, sgd]);
  assert.equal(lanes['DOCTOR-TRANSMISSION'].continue, false);
  assert.deepEqual(lanes['DOCTOR-TRANSMISSION'].parked, ['SCENE']);
  assert.equal(lanes['SECOND-GEAR-DETECTIVE'].continue, true);
});

test('route value Ω: known terms compute, unknown terms refuse to rank', () => {
  assert.equal(routeValue({ V: 1, E: 1, C: 1, Rev: 1, Cap: 1, Fit: 1, Risk: 0, Cost: 0, Dep: 0 }), 1);
  assert.equal(routeValue({ V: 0.8, E: 1, C: 1, Rev: 0.5, Cap: 1, Fit: 1, Risk: 0.5, Cost: 0.25, Dep: 0.25 }), 0.2);
  assert.equal(routeValue({ V: 1, E: 1, C: 1, Rev: null, Cap: 1, Fit: 1, Risk: 0, Cost: 0, Dep: 0 }), null);
  assert.throws(() => routeValue({ V: 2, E: 1, C: 1, Rev: 1, Cap: 1, Fit: 1, Risk: 0, Cost: 0, Dep: 0 }));
});

test('every lane route uses only known gates and its current gate is on its own path', () => {
  for (const [id, r] of Object.entries(ROUTES)) {
    for (const code of r.path) assert.ok(GATES[code], `${id}: ${code}`);
    assert.ok(r.path.includes(r.current_gate), `${id}: current_gate ${r.current_gate}`);
  }
});

test('every sellable route passes through MONEY, STORE and LEGAL before PUBLICATION', () => {
  for (const [id, r] of Object.entries(ROUTES)) {
    if (id === 'DOCTOR-TRANSMISSION') continue;
    const at = c => r.path.indexOf(c);
    for (const c of ['MONEY', 'STORE', 'LEGAL']) assert.ok(at(c) >= 0 && at(c) < at('PUBLICATION'), `${id}: ${c}`);
  }
});

test('docs/GATE-NETWORK-620.md is in sync with the code (run node gates/render-doc.mjs)', () => {
  assert.equal(readFileSync(DOC_URL, 'utf8'), renderGateDoc());
});
