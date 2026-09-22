import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  CANON, CANON_NOTE, CRITICAL_FACTORS, DEFAULT_FLOORS, FACTORS, SrError,
  runBattery, srBinding, srCandidate, srGate, srGeometric, srReport,
  t1ZeroPropagation, t2RangeCollapse, t3Compensability, t4NoiseAmplification,
  t5GamingGradient, t6ThresholdUndefined, t7DimensionSensitivity, t8UnknownHasNoTerm,
} from '../qyris/lib/sr.js';

const PERFECT = { N: 1, E: 1, S: 1, A: 1, C: 1, R: 1 };

// ── The candidate is implemented exactly as proposed ──────────────────

test('SR = N × E × S × A × C × R is the product of its six factors', () => {
  assert.deepEqual(FACTORS, ['N', 'E', 'S', 'A', 'C', 'R']);
  assert.equal(srCandidate(PERFECT).sr, 1);
  const vector = { N: 0.5, E: 0.5, S: 1, A: 1, C: 1, R: 1 };
  assert.equal(srCandidate(vector).sr, 0.25);
});

test('a factor outside 0..1 is refused rather than clamped', () => {
  assert.throws(() => srCandidate({ ...PERFECT, N: 1.2 }), /FACTOR_OUT_OF_RANGE/);
  assert.throws(() => srCandidate({ ...PERFECT, N: -0.1 }), /FACTOR_OUT_OF_RANGE/);
  assert.throws(() => srCandidate({ ...PERFECT, N: 'high' }), SrError);
});

// ── It is not canon, and nothing here makes it canon ──────────────────

test('the candidate is not canon', () => {
  assert.equal(CANON, false);
  assert.match(CANON_NOTE, /CANDIDATE/);
  assert.equal(srCandidate(PERFECT).canon, false);
});

test('no exported function returns a canonical scalar for a decision', () => {
  assert.equal(srReport(PERFECT).score, null);
  assert.equal(srReport(PERFECT).canon, false);
});

// ── The battery, asserted by result rather than by hope ───────────────

test('T1 zero propagation passes — this is what the candidate gets right', () => {
  const result = t1ZeroPropagation();
  assert.equal(result.pass, true);
  for (const factor of FACTORS) {
    assert.equal(srCandidate({ ...PERFECT, [factor]: 0 }).sr, 0, `${factor} at zero did not disqualify`);
  }
});

test('T2 range collapse: a healthy vector reads as a failing score', () => {
  const result = t2RangeCollapse();
  assert.equal(result.pass, false);
  assert.ok(result.samples > 1000000, 'the sweep is too small to claim a share');
  assert.ok(result.shareBelowHalf > 0.9, `only ${result.shareBelowHalf} fell below 0.5`);
  assert.ok(result.max === 1, 'the sweep did not reach the top of the band');
});

test('T3 compensability: a near-total safety failure outranks uniform adequacy', () => {
  const result = t3Compensability();
  assert.equal(result.pass, false);
  assert.ok(result.criticalNearFailure > result.uniformlyAcceptable, 'the ordering defect did not reproduce');
  // Both alternatives catch exactly what the product misses.
  assert.equal(result.alternativeHandles, true);
  assert.deepEqual(CRITICAL_FACTORS, ['S', 'C']);
});

test('T4 noise amplification: relative error compounds across six terms', () => {
  const result = t4NoiseAmplification(0.1);
  assert.equal(result.pass, false);
  assert.ok(result.span > 1, `span was only ${result.span}`);
});

test('T5 gaming: the steepest incentive points at paperwork, not at safety', () => {
  const result = t5GamingGradient();
  assert.equal(result.pass, false);
  assert.equal(result.gradients[0].factor, 'E');
});

test('T6 threshold: any cut admits vectors nobody would admit by hand', () => {
  const result = t6ThresholdUndefined();
  assert.equal(result.pass, false);
  assert.ok(result.admitted.some((entry) => entry.vector.C < 0.5));
});

test('T7 dimension sensitivity: scores are not comparable across model versions', () => {
  const result = t7DimensionSensitivity();
  assert.equal(result.pass, false);
  assert.ok(result.drop > 0.09);
});

test('T8 UNKNOWN has no term, and every substitution lies', () => {
  const result = t8UnknownHasNoTerm();
  assert.equal(result.pass, false);
  assert.equal(result.asOne, 1);
  assert.equal(result.asZero, 0);
  assert.equal(result.asHalf, 0.5);
  assert.equal(result.candidateThrowsByDefault, true);
  assert.equal(result.alternativeHandles, true);
});

test('the battery result is DEFECTS_FOUND_DO_NOT_CANONIZE, 1 of 8 passing', () => {
  const battery = runBattery();
  assert.equal(battery.tested, 8);
  assert.equal(battery.passed, 1);
  assert.equal(battery.failed, 7);
  assert.deepEqual(battery.failedIds, ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8']);
  assert.equal(battery.verdict, 'DEFECTS_FOUND_DO_NOT_CANONIZE');
  assert.equal(battery.canon, false);
  assert.match(battery.recommendation, /Canonization is a Chairman act/);
});

test('the battery is deterministic — the same result every run', () => {
  const a = runBattery();
  const b = runBattery();
  assert.deepEqual(a.failedIds, b.failedIds);
  assert.equal(a.tests[1].shareBelowHalf, b.tests[1].shareBelowHalf);
});

// ── The alternatives the tests recommend ──────────────────────────────

test('the gate reports every blocker at once, each naming its factor', () => {
  const result = srGate({ N: 0.5, E: 1, S: 0.5, A: 1, C: 1, R: 1 });
  assert.equal(result.eligible, false);
  assert.deepEqual(result.blockers.map((blocker) => blocker.factor), ['N', 'S']);
  assert.ok(result.blockers.every((blocker) => blocker.route.length > 10));
});

test('the gate holds SAFETY and CONFLICT to a higher floor than the rest', () => {
  assert.ok(DEFAULT_FLOORS.S > DEFAULT_FLOORS.N);
  assert.ok(DEFAULT_FLOORS.C > DEFAULT_FLOORS.R);
  assert.equal(DEFAULT_FLOORS.A, 1, 'authority fit is not a matter of degree');
  // The vector that defeats the product is caught by the gate.
  assert.equal(srGate({ N: 1, E: 1, S: 0.12, A: 1, C: 1, R: 1 }).eligible, false);
});

test('the binding constraint is named, and is not compensable', () => {
  assert.equal(srBinding({ N: 1, E: 1, S: 0.12, A: 1, C: 1, R: 1 }).binding, 'S');
  assert.equal(srBinding({ N: 0.7, E: 0.7, S: 0.7, A: 0.7, C: 0.7, R: 0.7 }).value, 0.7);
});

test('UNKNOWN binds before any known factor and is never substituted', () => {
  const partial = { N: 0.1, E: 1, S: 1, A: 1, C: 'UNKNOWN', R: 1 };
  const binding = srBinding(partial);
  assert.equal(binding.binding, 'C');
  assert.equal(binding.value, null);
  assert.ok(srGate(partial).blockers.some((blocker) => blocker.code === 'FACTOR_UNKNOWN'));
  assert.throws(() => srCandidate(partial), /FACTOR_UNKNOWN/);
});

test('the geometric repair is on a readable scale but still fails T3', () => {
  const uniform = srGeometric({ N: 0.7, E: 0.7, S: 0.7, A: 0.7, C: 0.7, R: 0.7 }).sr;
  const critical = srGeometric({ N: 1, E: 1, S: 0.12, A: 1, C: 1, R: 1 }).sr;
  assert.ok(Math.abs(uniform - 0.7) < 1e-9, 'the geometric mean is not on the factor scale');
  assert.ok(critical > uniform, 'the ordering defect was expected to survive the obvious repair');
});

test('srReport publishes a vector and a binding constraint, never a score', () => {
  const report = srReport({ N: 0.9, E: 0.4, S: 0.95, A: 1, C: 'UNKNOWN', R: 0.9 });
  assert.equal(report.score, null);
  assert.equal(report.eligible, false);
  assert.equal(report.binding, 'C');
  assert.deepEqual(Object.keys(report.vector), FACTORS);
  assert.equal(report.vector.C, null);
  assert.match(report.note, /No scalar score is published/);
});
