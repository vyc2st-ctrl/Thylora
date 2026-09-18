// THYLORA · the three-layer model
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  observe, unmeasured, factorsFrom, solveProbability, ceiling, bindingConstraint,
  liftGain, liftRanking, diagnose, claimSupported, assertClaim, nextActions,
  CLAIMS, EVIDENCE, MODEL, HOLDING_THRESHOLD
} from '../math-surface/lib/understanding.js';

const full = (l, m, s) => factorsFrom([
  observe({ layer: 'L', correct: Math.round(l * 4), attempted: 4 }),
  observe({ layer: 'M', correct: Math.round(m * 4), attempted: 4 }),
  observe({ layer: 'S', correct: Math.round(s * 4), attempted: 4 })
]);

test('P_solve is the product of the three layers', () => {
  const p = solveProbability(full(1, 1, 1));
  assert.equal(p.value, 1);
  assert.equal(p.determined, true);

  const half = solveProbability(full(0.5, 0.5, 1));
  assert.equal(half.value, 0.25);
});

test('a measured zero in any layer determines P_solve at zero', () => {
  const p = solveProbability(full(0, 1, 1));
  assert.equal(p.value, 0);
  assert.equal(p.determined, true);
  assert.equal(p.reason, 'ZERO_FACTOR');
  assert.deepEqual([...p.zero_factors], ['L']);
});

test('an unmeasured layer leaves P_solve undetermined, with bounds instead of a guess', () => {
  const factors = factorsFrom([
    observe({ layer: 'L', correct: 2, attempted: 4 }),
    observe({ layer: 'S', correct: 4, attempted: 4 })
  ]);
  const p = solveProbability(factors);
  assert.equal(p.value, null);
  assert.equal(p.determined, false);
  assert.equal(p.reason, 'INCOMPLETE_EVIDENCE');
  assert.deepEqual([...p.unmeasured], ['M']);
  assert.equal(p.bounds.low, 0);
  assert.equal(p.bounds.high, 0.5); // 0.5 × 1 × (unknown ≤ 1)
});

test('a zero language factor still determines the product even with the rest unmeasured', () => {
  const factors = factorsFrom([observe({ layer: 'L', correct: 0, attempted: 3 })]);
  const p = solveProbability(factors);
  assert.equal(p.value, 0);
  assert.equal(p.determined, true);
  assert.deepEqual([...p.unmeasured], ['M', 'S']);
});

// --- the hard rule ---------------------------------------------------------

test('L = 0 does NOT permit a claim that the learner lacks the mathematics', () => {
  const factors = factorsFrom([observe({ layer: 'L', correct: 0, attempted: 3 })]);
  const support = claimSupported(factors, CLAIMS.MATH_DEFICIT);
  assert.equal(support.permitted, false);
  assert.match(support.because, /never measured/i);
  assert.throws(() => assertClaim(factors, CLAIMS.MATH_DEFICIT), /UnsupportedClaimError|Refused claim/);
});

test('L = 0 does permit the claim that the problem cannot be solved as presented', () => {
  const factors = factorsFrom([observe({ layer: 'L', correct: 0, attempted: 3 })]);
  const support = claimSupported(factors, CLAIMS.CANNOT_SOLVE_AS_PRESENTED);
  assert.equal(support.permitted, true);
  assert.match(support.because, /says nothing about the other layers/i);
});

test('an observation taken inside the mixed problem is not admissible evidence for its layer', () => {
  const factors = factorsFrom([
    observe({ layer: 'M', correct: 0, attempted: 5, isolated: false, source: 'word problem' })
  ]);
  assert.equal(factors.M.admissible, false);
  assert.equal(factors.M.value, null);
  assert.equal(factors.M.evidence, EVIDENCE.NOT_ISOLATED);

  const support = claimSupported(factors, CLAIMS.MATH_DEFICIT);
  assert.equal(support.permitted, false);
  assert.match(support.because, /other layers could have caused the failure/i);
});

test('an isolated zero on the relationship layer does permit the mathematics claim', () => {
  const factors = factorsFrom([
    observe({ layer: 'L', correct: 0, attempted: 3 }),
    observe({ layer: 'M', correct: 0, attempted: 3, isolated: true, source: 'quantities supplied' })
  ]);
  assert.equal(claimSupported(factors, CLAIMS.MATH_DEFICIT).permitted, true);
});

test('a layer at or above the holding threshold is not a deficit', () => {
  const factors = factorsFrom([observe({ layer: 'M', correct: 3, attempted: 5 })]);
  assert.equal(factors.M.value, 0.6);
  assert.equal(HOLDING_THRESHOLD, 0.6);
  assert.equal(claimSupported(factors, CLAIMS.MATH_DEFICIT).permitted, false);
});

test('unmeasured() is explicit so it can never be read as zero', () => {
  const u = unmeasured('M');
  assert.equal(u.score, null);
  assert.equal(u.evidence, EVIDENCE.UNMEASURED);
  assert.equal(u.admissible, false);
});

// --- what the numbers are for ----------------------------------------------

test('P_solve can never exceed its smallest factor', () => {
  const factors = full(0.5, 0.75, 1);
  const p = solveProbability(factors);
  assert.equal(ceiling(factors), 0.5);
  assert.ok(p.value <= ceiling(factors));
});

test('the binding constraint is certain when a measured zero exists and uncertain otherwise', () => {
  const zero = bindingConstraint(factorsFrom([observe({ layer: 'L', correct: 0, attempted: 2 })]));
  assert.equal(zero.certain, true);
  assert.equal(zero.reason, 'MEASURED_ZERO');

  const partial = bindingConstraint(factorsFrom([observe({ layer: 'L', correct: 1, attempted: 2 })]));
  assert.equal(partial.certain, false);
  assert.equal(partial.reason, 'UNMEASURED_LAYER_COULD_BE_LOWER');
});

test('lift gain says where effort actually returns something', () => {
  const factors = full(0.25, 1, 1); // language is the binding constraint
  const language = liftGain(factors, 'L');
  const solve = liftGain(factors, 'S');
  assert.equal(language.gain, 0.75);
  assert.equal(solve.gain, 0);

  const ranked = liftRanking(factors);
  assert.equal(ranked[0].layer, 'L');
});

test('lift gain refuses to compute while another factor is unmeasured', () => {
  const factors = factorsFrom([observe({ layer: 'L', correct: 1, attempted: 4 })]);
  const result = liftGain(factors, 'L');
  assert.equal(result.determined, false);
  assert.equal(result.gain, null);
  assert.equal(result.reason, 'UNMEASURED_FACTOR');
});

// --- what to do next -------------------------------------------------------

test('when language is zero the next action measures the mathematics with the words removed, before teaching', () => {
  const factors = factorsFrom([observe({ layer: 'L', correct: 0, attempted: 3 })]);
  const actions = nextActions(factors);
  const codes = actions.map(a => a.code);
  assert.ok(codes.includes('PROBE_MATH_LANGUAGE_REMOVED'));
  assert.ok(codes.includes('PROBE_SOLVE_LANGUAGE_REMOVED'));
  assert.ok(
    codes.indexOf('PROBE_MATH_LANGUAGE_REMOVED') < codes.indexOf('TEACH_LANGUAGE'),
    'measurement must precede teaching, or a reading problem gets re-taught as a number problem'
  );
});

test('every sitting ends by asking the child to explain the result back', () => {
  const actions = nextActions(full(1, 1, 1));
  assert.equal(actions[actions.length - 1].code, 'EXPLAIN_BACK');
});

test('diagnose reports the refusal in the headline when language blocks', () => {
  const read = diagnose([observe({ layer: 'L', correct: 0, attempted: 3 })]);
  assert.equal(read.language_blocked, true);
  assert.equal(read.math_claim_available, false);
  assert.match(read.headline, /must not be guessed/i);
  assert.ok(read.refused_claims.some(c => c.claim === CLAIMS.MATH_DEFICIT));
});

test('diagnose on a fully measured learner names the lowest layer', () => {
  const read = diagnose([
    observe({ layer: 'L', correct: 4, attempted: 4 }),
    observe({ layer: 'M', correct: 2, attempted: 4 }),
    observe({ layer: 'S', correct: 4, attempted: 4 })
  ]);
  assert.equal(read.p_solve.value, 0.5);
  assert.equal(read.binding_constraint.layer, 'M');
  assert.equal(read.math_claim_available, true);
});

test('the model states its own hard rule', () => {
  assert.equal(MODEL.equation, 'P_solve = L × M × S');
  assert.match(MODEL.hard_rule, /do not infer that the learner lacks the mathematics/i);
});

test('observation inputs are validated rather than coerced', () => {
  assert.throws(() => observe({ layer: 'X', correct: 1, attempted: 1 }), /unknown layer/);
  assert.throws(() => observe({ layer: 'L', correct: 3, attempted: 2 }), /cannot exceed/);
  assert.throws(() => observe({ layer: 'L', correct: 1, attempted: 0 }), /positive integer/);
});
