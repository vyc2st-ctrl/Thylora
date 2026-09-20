// THY-WORK-MATH-FAMOUS-THOUGHT-559 · Chairman math and famous-thought gates
//
// These tests are the JavaScript half of one arithmetic. The SQL half lives in
// db/chairman-math/0003_gates.sql and is asserted by
// db/chairman-math/validation/behaviour.sql. If the two ever disagree, the
// dashboard is showing something the backend would not accept.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateFamousThoughtGate, evaluateStoreValueGate,
  F_MIN_PRODUCT, F_MIN_VARIABLE, UNKNOWN_DEFINITION
} from '../math-thought/lib/gates.js';
import {
  splitEquation, variableSlots, shapeEquationForDisplay, equationOfTheDay, READING_LEVELS
} from '../math-thought/lib/equations.js';
import { ACTIVE_EQUATIONS, UNRECOVERED_EQUATIONS } from '../math-thought/lib/registry-seed.js';

const fullEvidence = {
  source_record_present: true,
  speaker_certain: true,
  wording_from_source_record: true,
  context_present: true,
  tied_to_meaningful_question: true
};

// ------------------------------------------------------------------ F gate --

test('all fours is exactly the floor: 4^4 = 256 passes', () => {
  const r = evaluateFamousThoughtGate({ scores: { S: 4, A: 4, C: 4, T: 4 }, evidence: fullEvidence });
  assert.equal(r.verdict, 'PASS');
  assert.equal(r.f_value, F_MIN_PRODUCT);
  assert.equal(F_MIN_VARIABLE ** 4, F_MIN_PRODUCT);
});

test('one variable below 4 fails even when the product clears 256', () => {
  const r = evaluateFamousThoughtGate({ scores: { S: 3, A: 5, C: 5, T: 5 }, evidence: fullEvidence });
  assert.equal(r.f_value, 375);
  assert.ok(r.f_value > F_MIN_PRODUCT, 'the product alone would have passed');
  assert.equal(r.verdict, 'FAIL');
  assert.ok(r.below_threshold.some(p => /^S /.test(p)));
});

test('each fail-closed condition alone defeats perfect scores', () => {
  const conditions = [
    ['source_record_present', 'SOURCE_UNCERTAIN'],
    ['speaker_certain', 'SPEAKER_UNCERTAIN'],
    ['wording_from_source_record', 'WORDING_UNCERTAIN'],
    ['context_present', 'CONTEXT_MISSING'],
    ['tied_to_meaningful_question', 'NO_MEANINGFUL_QUESTION']
  ];
  for (const [field, reason] of conditions) {
    const r = evaluateFamousThoughtGate({
      scores: { S: 5, A: 5, C: 5, T: 5 },
      evidence: { ...fullEvidence, [field]: false }
    });
    assert.equal(r.verdict, 'FAIL', `${field} should fail the gate`);
    assert.ok(r.fail_closed.includes(reason));
    assert.equal(r.f_value, 625, 'the product is still reported honestly');
  }
});

test('an unscored variable yields no product at all', () => {
  const r = evaluateFamousThoughtGate({
    scores: { S: null, A: 5, C: 5, T: 5 }, evidence: fullEvidence
  });
  assert.equal(r.f_value, null);
  assert.equal(r.verdict, 'FAIL');
  assert.ok(r.blocking.some(p => p.includes(UNKNOWN_DEFINITION)));
});

test('a score outside 0..5 is refused rather than clamped', () => {
  for (const bad of [-1, 6, 4.5]) {
    const r = evaluateFamousThoughtGate({
      scores: { S: bad, A: 5, C: 5, T: 5 }, evidence: fullEvidence
    });
    assert.equal(r.verdict, 'FAIL');
    assert.equal(r.f_value, null);
  }
});

test('the empty call fails closed on every condition', () => {
  const r = evaluateFamousThoughtGate();
  assert.equal(r.verdict, 'FAIL');
  assert.equal(r.fail_closed.length, 5);
  assert.equal(r.f_value, null);
});

// ------------------------------------------------------------------ D gate --

const knownD = { A: 'a', H: 'h', W: 'w', T: 't', M: 'm', P: 'p' };

test('D cannot pass while its variable meanings are unrecovered', () => {
  const r = evaluateStoreValueGate({
    definitions: {}, scores: { A: 5, H: 5, W: 5, T: 5, M: 5, P: 5 },
    qualitative: { provides_help: true, has_destination: true }
  });
  assert.equal(r.verdict, 'FAIL');
  assert.deepEqual(r.unknown_definitions, ['A', 'H', 'W', 'T', 'M', 'P']);
  assert.equal(r.d_value, null);
});

test('attention with no help fails however high the scores', () => {
  const r = evaluateStoreValueGate({
    definitions: knownD, scores: { A: 5, H: 5, W: 5, T: 5, M: 5, P: 5 },
    qualitative: { provides_help: false, has_destination: true }
  });
  assert.equal(r.verdict, 'FAIL');
  assert.ok(r.blocking.includes('NO_HELP_PROVIDED'));
});

test('attention with no destination fails however high the scores', () => {
  const r = evaluateStoreValueGate({
    definitions: knownD, scores: { A: 5, H: 5, W: 5, T: 5, M: 5, P: 5 },
    qualitative: { provides_help: true, has_destination: false }
  });
  assert.equal(r.verdict, 'FAIL');
  assert.ok(r.blocking.includes('NO_DESTINATION'));
});

test('D passes only with recovered meanings, scores, help and a destination', () => {
  const r = evaluateStoreValueGate({
    definitions: knownD, scores: { A: 4, H: 4, W: 4, T: 4, M: 4, P: 4 },
    qualitative: { provides_help: true, has_destination: true }
  });
  assert.equal(r.verdict, 'PASS');
  assert.equal(r.d_value, 4096);
});

// ------------------------------------------------------- equation display --

test('an equation splits into whole, left, equal sign and right', () => {
  const parts = splitEquation('U=K×E×C×X×T');
  assert.deepEqual(parts, { whole: 'U=K×E×C×X×T', left: 'U', equals: '=', right: 'K×E×C×X×T' });
});

test('variable slots are read off the right side, in order, without meaning', () => {
  assert.deepEqual(variableSlots('f(K,E,C)'), ['K', 'E', 'C']);
  assert.deepEqual(variableSlots('A×H×W×T×M×P'), ['A', 'H', 'W', 'T', 'M', 'P']);
  assert.deepEqual(variableSlots('S×A×C×T'), ['S', 'A', 'C', 'T']);
});

test('only F carries definitions; Q, U and D report UNKNOWN_DEFINITION', () => {
  const byCode = Object.fromEntries(ACTIVE_EQUATIONS.map(e => [e.equation_code, shapeEquationForDisplay(e)]));

  const f = byCode['EQ-F-001'];
  assert.deepEqual(f.variable_breakdown.map(v => v.key), ['S', 'A', 'C', 'T']);
  assert.equal(f.variable_breakdown.every(v => v.definition !== UNKNOWN_DEFINITION), true);
  assert.equal(f.unresolved.length, 0);

  for (const code of ['EQ-Q-001', 'EQ-U-001', 'EQ-D-001']) {
    const e = byCode[code];
    assert.ok(e.variable_breakdown.length > 0, `${code} still shows its variable slots`);
    assert.equal(e.variable_breakdown.every(v => v.definition === UNKNOWN_DEFINITION), true);
    for (const level of READING_LEVELS) assert.equal(e[level.toLowerCase()], UNKNOWN_DEFINITION);
    assert.equal(e.real_life_example, UNKNOWN_DEFINITION);
  }
});

test('the prohibited reading levels appear nowhere in the display text', () => {
  const text = JSON.stringify(ACTIVE_EQUATIONS.map(shapeEquationForDisplay));
  assert.equal(/\b(child|adult|scholar)\b/i.test(text), false);
  assert.deepEqual(READING_LEVELS, ['PLAIN', 'EVERYDAY', 'TECHNICAL']);
});

test("today's equation is deterministic and covers the whole active set", () => {
  const first = equationOfTheDay(ACTIVE_EQUATIONS, '2026-09-20');
  assert.equal(equationOfTheDay(ACTIVE_EQUATIONS, '2026-09-20').equation_code, first.equation_code);
  const seen = new Set();
  for (let d = 20; d < 28; d++) seen.add(equationOfTheDay(ACTIVE_EQUATIONS, `2026-09-${d}`).equation_code);
  assert.equal(seen.size, ACTIVE_EQUATIONS.length, 'every active equation comes round');
  assert.equal(equationOfTheDay([], '2026-09-20'), null);
});

test('P_solve and C_w stay UNKNOWN_DEFINITION and carry no invented variables', () => {
  assert.equal(UNRECOVERED_EQUATIONS.length, 2);
  for (const e of UNRECOVERED_EQUATIONS) {
    assert.equal(e.status, UNKNOWN_DEFINITION);
    assert.equal(e.authority, UNKNOWN_DEFINITION);
    assert.equal(e.variables, undefined);
    assert.match(e.result, /NOT PRESENT IN CONTINUITY/);
  }
});

// ------------------------------------------------------------ the four drafts --

test('the four named thoughts fail the gate in this session, by design', () => {
  // Section 4 forbids rewriting the quotations from memory, and the source
  // records were not readable here. That is a FAIL on S, not a reason to guess.
  for (const code of ['THOUGHT-DOUGLASS-001', 'THOUGHT-CARVER-001',
                      'THOUGHT-WASHINGTON-001', 'THOUGHT-FORD-001']) {
    const f = evaluateFamousThoughtGate({
      scores: { S: null, A: null, C: null, T: null },
      evidence: {
        source_record_present: false, speaker_certain: false,
        wording_from_source_record: false, context_present: false,
        tied_to_meaningful_question: false
      }
    });
    assert.equal(f.verdict, 'FAIL', `${code} must not pass without its source record`);

    const d = evaluateStoreValueGate({ definitions: {}, scores: {}, qualitative: {} });
    assert.equal(d.verdict, 'FAIL', `${code} must not pass D while its variables are unknown`);
  }
});
