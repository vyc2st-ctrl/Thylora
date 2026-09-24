// Head 594 — COVERAGE LEDGER, CURRENT GATES, MATH DISPLAY LAW, topic summary.
// Pins the client half of THY-WORK-COVERAGE-HARD-GATE-593 and the MATH DISPLAY
// LAW so a later edit cannot quietly drop a clause state, a math part or the
// meaning of f.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import './../app/omniview-surface.js';

const O = globalThis.THY_OMNIVIEW;

test('exactly six settled coverage states, as registered at 592', () => {
  assert.deepEqual(O.COVERAGE_STATES, ['ANSWERED', 'EXECUTED', 'ASSIGNED', 'DEFERRED', 'BLOCKED', 'UNKNOWN']);
});

test('C_q is recomputed from the rows and OPEN clauses block COMPLETE', () => {
  const v = O.coverageView({ access: 'OK', query_id: 'Q', c_q: 1, rows: [
    { point_no: 1, response_state: 'ANSWERED' },
    { point_no: 2, response_state: 'EXECUTED' },
    { point_no: 3, response_state: 'OPEN' },
    { point_no: 4, response_state: 'BLOCKED' }
  ] });
  assert.equal(v.n, 4);
  assert.equal(v.settled, 3);
  assert.equal(v.c_q, 0.75, 'the stale server ratio (1) must not be trusted');
  assert.equal(v.complete, false);
  assert.deepEqual(v.open.map((r) => r.point_no), [3]);
});

test('an empty ledger is never COMPLETE', () => {
  const v = O.coverageView({ access: 'OK', rows: [] });
  assert.equal(v.complete, false);
  assert.equal(v.c_q, null);
});

test('a non-Chairman coverage read is DENIED, not an empty ledger', () => {
  assert.deepEqual(O.coverageView({ access: 'DENIED', rows: [] }), { access: 'DENIED' });
  assert.equal(O.deniedRead({ access: 'DENIED' }), true);
});

test('the math display always has the eleven parts in order', () => {
  assert.deepEqual(O.MATH_PARTS.map((p) => p[1]), [
    '1 · WHOLE EQUATION', '2 · LEFT SIDE', '3 · EQUAL SIGN', '4 · RIGHT SIDE',
    '5 · EVERY SYMBOL', '6 · EVERY UNIT', '7 · PLAIN SPEECH', '8 · REAL EXAMPLE',
    '9 · WHERE SOMEONE WOULD USE IT', '10 · WHAT THE ANSWER MEANS', '11 · NEXT QUESTION'
  ]);
});

test('a missing part is shown as MISSING, never dropped', () => {
  const m = O.mathParts({ registered_text: 'U=K×E×C×X×T', display: { '1_whole_equation': 'U = K × E × C × X × T' } });
  assert.equal(m.parts.length, 11);
  assert.equal(m.complete, false);
  assert.equal(m.parts.filter((p) => p.missing).length, 10);
});

test('whenever f appears it is explained as FUNCTION OF', () => {
  assert.equal(O.usesF('Q=f(K,E,C)'), true);
  assert.equal(O.usesF('G_t = f(S, A, E, C, R, V)'), true);
  assert.equal(O.usesF('WW=L×I×H×B×M×T'), false);
  assert.equal(O.usesF('F=S×A×C×T'), false, 'a capital F is a variable, not "function of"');
  const m = O.mathParts({ registered_text: 'Q=f(K,E,C)', display: null });
  assert.match(m.f_meaning, /FUNCTION OF/);
  assert.match(m.f_meaning, /rule describing how these pieces work together/);
  assert.equal(O.mathParts({ registered_text: 'U=K×E', display: null }).f_meaning, null);
});

test('symbols and units render as readable lines', () => {
  const m = O.mathParts({ display: {
    '5_every_symbol': [{ symbol: 'K', name: 'knowledge', meaning: 'what you know' }],
    '6_every_unit': [{ symbol: 'K', unit: 'score', range: '0 to 5' }]
  } });
  assert.equal(m.parts[4].text, 'K — knowledge: what you know');
  assert.equal(m.parts[5].text, 'K — score (0 to 5)');
});

test('every topic shows the ten things the Chairman asked for', () => {
  const s = O.topicSummary({
    authority_locks: { authority_lock: 'CHAIRMAN', authority_holder: 'Chairman' },
    current_vs_superseded: { current: [{ body: 'a' }], superseded: [
      { body: 'old', superseded_sequence_no: 591 }, { body: 'older', superseded_sequence_no: 588 }] },
    linked_entities: { people: [{ display_name: 'Inés Morales' }], places: [], objects: [], products: [{ display_name: 'First shirt' }] },
    linked_work: [{ link_key: 'THY-WORK-X' }],
    linked_gates: [{ gate_key: 'G1', gate_state: 'BLOCKED' }, { gate_key: 'G2', gate_state: 'PASSED' }],
    open_questions: [{ question: 'Which?', is_next_better: true }],
    last_restart: { restart_point: 'restart' }
  });
  assert.deepEqual(s.map((l) => l[0]), ['CURRENT AUTHORITY', 'SUPERSEDED MATERIAL', 'PEOPLE', 'PLACES', 'OBJECTS',
    'WORK', 'GATES', 'LATEST CORRECTION', 'UNRESOLVED QUESTIONS', 'NEXT ACTION']);
  const f = Object.fromEntries(s);
  assert.equal(f.PLACES, 'None linked');
  assert.equal(f.OBJECTS, 'First shirt');
  assert.match(f.GATES, /1 open\/blocked of 2: G1 BLOCKED/);
  assert.equal(f['LATEST CORRECTION'], '#591: old');
  assert.equal(f['NEXT ACTION'], 'Which?');
  assert.equal(O.topicSummary({ found: false }), null);
});

test('the surface offers all five Chairman surfaces', () => {
  const js = readFileSync('app/omniview-surface.js', 'utf8');
  for (const label of ['>CONTEXT<', '>SEQUENCE<', '>COVERAGE LEDGER<', '>CURRENT GATES<', '>MATH<', 'TOPIC LOOKUP']) {
    assert.ok(js.includes(label), 'missing ' + label);
  }
  for (const fn of ['thy_omniview_coverage', 'thy_omniview_current_gates', 'thy_math_display_get', 'thy_omniview_resolve_topic']) {
    assert.ok(js.includes("'" + fn + "'"), 'surface never calls ' + fn);
  }
});
