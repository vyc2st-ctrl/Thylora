// UNDERSTANDING TRANSFER GATE · tests
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  computeU, bandFor, scoreAsset, understandingGate, weakestFactor,
  assertLabelsLegal, FACTORS, FACTOR_FLOOR, RELEASE_THRESHOLD,
  FORBIDDEN_BAND_LABELS, BANDS, SCORE_MAX
} from '../understanding/understanding.js';
import { EXAMPLES, AUDIENCES, HEALTH_EDUCATION_EXAMPLE } from '../understanding/examples.js';

const full = { K: 100, E: 100, C: 100, X: 100, T: 100 };

test('U is the product of all five factors, not an average', () => {
  assert.equal(computeU(full).u, 100);
  for (const key of FACTORS) {
    assert.equal(computeU({ ...full, [key]: 0 }).u, 0, `${key} at zero must zero U`);
  }
});

test('at the same average, the product favours the balanced asset', () => {
  // Both sets average 60. An average cannot tell them apart; U can.
  const balanced = computeU({ K: 60, E: 60, C: 60, X: 60, T: 60 }).u;
  const lopsided = computeU({ K: 100, E: 80, C: 60, X: 40, T: 20 }).u;
  assert.equal(balanced, 8);
  assert.equal(lopsided, 4);
  assert.ok(balanced > lopsided, 'the product must punish the weakest factor harder than an average does');
});

test('U arithmetic is exact integer arithmetic', () => {
  const { raw } = computeU(full);
  assert.equal(raw, SCORE_MAX ** 5);
  assert.ok(Number.isSafeInteger(raw));
});

test('scores are clamped, and junk input does not produce junk scores', () => {
  assert.equal(computeU({ K: 500, E: 100, C: 100, X: 100, T: 100 }).factors.K, 100);
  assert.equal(computeU({ K: -20, E: 100, C: 100, X: 100, T: 100 }).factors.K, 0);
  assert.equal(computeU({ K: NaN, E: 100, C: 100, X: 100, T: 100 }).u, 0);
});

test('CHILD, ADULT and SCHOLAR are refused as math display labels', () => {
  assert.deepEqual(FORBIDDEN_BAND_LABELS, ['CHILD', 'ADULT', 'SCHOLAR']);
  for (const band of BANDS) assert.ok(!FORBIDDEN_BAND_LABELS.includes(band.code));
  assert.equal(assertLabelsLegal(), true);
});

test('band labels describe transfer state, never a person', () => {
  assert.equal(bandFor(100).code, 'TRANSFERRED');
  assert.equal(bandFor(0).code, 'NO_TRANSFER');
  assert.equal(bandFor(RELEASE_THRESHOLD).code, 'FRAGILE');
});

test('the gate reports every blocker at once, each with a route', () => {
  const result = understandingGate({});
  assert.equal(result.ready, false);
  assert.ok(result.blockers.length >= 7, `expected the whole list, got ${result.blockers.length}`);
  for (const b of result.blockers) {
    assert.ok(b.code && b.detail && b.route, `blocker ${b.code} is missing a route`);
  }
  const codes = result.blockers.map((b) => b.code);
  for (const expected of ['AUDIENCE_MISSING', 'LEARNING_STATEMENT_MISSING', 'KNOWLEDGE_NOT_STATED',
    'CONNECTIONS_MISSING', 'EXPLANATION_MISSING', 'TRANSFER_TEST_MISSING']) {
    assert.ok(codes.includes(expected), `missing blocker ${expected}`);
  }
});

test('an outward asset must say what the audience learns', () => {
  const asset = { ...EXAMPLES[0], learning_statement: undefined };
  const codes = understandingGate(asset).blockers.map((b) => b.code);
  assert.ok(codes.includes('LEARNING_STATEMENT_MISSING'));
});

test('one uncited claim drags the whole asset, it is not averaged away', () => {
  const asset = {
    ...EXAMPLES[0],
    claims: [...EXAMPLES[0].claims, { id: 'cX', text: 'unsupported', evidence_ids: [] }]
  };
  const result = understandingGate(asset);
  assert.equal(result.factors.E, 0);
  assert.equal(result.u, 0);
  assert.ok(result.blockers.map((b) => b.code).includes('CLAIM_UNCITED'));
});

test('a broken evidence reference is caught, not silently ignored', () => {
  const asset = { ...EXAMPLES[0], claims: [{ id: 'c1', text: 'x', evidence_ids: ['nope'] }] };
  assert.ok(understandingGate(asset).blockers.map((b) => b.code).includes('EVIDENCE_REFERENCE_BROKEN'));
});

test('one representation is a telling, not an explaining', () => {
  const asset = { ...EXAMPLES[0], representations: [EXAMPLES[0].representations[0]] };
  const codes = understandingGate(asset).blockers.map((b) => b.code);
  assert.ok(codes.includes('SINGLE_REPRESENTATION'));
});

test('a transfer test with no pass condition cannot be failed, so it is refused', () => {
  const asset = { ...EXAMPLES[0], transfer: { task: 'do the thing' } };
  assert.ok(understandingGate(asset).blockers.map((b) => b.code).includes('TRANSFER_PASS_CONDITION_MISSING'));
});

test('a factor below the floor is named by factor, not left vague', () => {
  const asset = { ...EXAMPLES[0], connections: [] };
  const codes = understandingGate(asset).blockers.map((b) => b.code);
  assert.ok(codes.includes('FACTOR_BELOW_FLOOR_C'));
  assert.ok(codes.includes('CONNECTIONS_MISSING'));
});

test('weakestFactor points at where one unit of work buys the most', () => {
  assert.equal(weakestFactor({ K: 90, E: 90, C: 30, X: 90, T: 90 }), 'C');
});

test('all eight audiences are built, and none is a math display label', () => {
  assert.equal(EXAMPLES.length, 8);
  assert.deepEqual(AUDIENCES, ['CHILD', 'PARENT', 'TEACHER', 'BUSINESS', 'NEWS', 'STORY', 'VEHICLE', 'HEALTH EDUCATION']);
});

test('every example states what its audience learns and ends in a transfer test', () => {
  for (const asset of EXAMPLES) {
    assert.ok(asset.learning_statement, `${asset.audience} has no learning statement`);
    assert.ok(asset.transfer?.task, `${asset.audience} has no transfer task`);
    assert.ok(asset.transfer?.pass_condition, `${asset.audience} transfer test cannot be failed`);
    assert.ok(new Set(asset.representations.map((r) => r.mode)).size >= 2,
      `${asset.audience} has fewer than two representations`);
  }
});

test('every claim in every example carries a resolvable citation', () => {
  for (const asset of EXAMPLES) {
    for (const claim of asset.claims) {
      assert.ok(claim.evidence_ids.length > 0, `${asset.audience} claim ${claim.id} is uncited`);
      for (const id of claim.evidence_ids) {
        const src = asset.evidence.find((e) => e.id === id);
        assert.ok(src, `${asset.audience} claim ${claim.id} cites missing evidence ${id}`);
        assert.ok(src.evidence_class && src.locator, `${asset.audience} evidence ${id} has no class or locator`);
      }
    }
  }
});

test('seven examples clear the gate; the eighth is blocked on purpose', () => {
  const results = EXAMPLES.map((a) => ({ audience: a.audience, ...understandingGate(a) }));
  const ready = results.filter((r) => r.ready);
  const blocked = results.filter((r) => !r.ready);
  assert.equal(ready.length, 7);
  assert.equal(blocked.length, 1);
  assert.equal(blocked[0].audience, 'HEALTH EDUCATION');
  // Blocked because its evidence is planning-grade, not a label in hand.
  assert.ok(blocked[0].blockers.map((b) => b.code).includes('UNDERSTANDING_BELOW_THRESHOLD'));
  assert.ok(blocked[0].u < RELEASE_THRESHOLD);
});

test('the health education asset passes the moment real evidence replaces the estimate', () => {
  const upgraded = {
    ...HEALTH_EDUCATION_EXAMPLE,
    evidence: HEALTH_EDUCATION_EXAMPLE.evidence.map((e) =>
      e.id === 'e1' ? { ...e, evidence_class: 'PRIMARY_RECORD', locator: 'photograph of the label in hand' } : e)
  };
  const result = understandingGate(upgraded);
  assert.equal(result.ready, true, 'the only thing holding it was the evidence class');
});

test('the health education asset collects no medical detail and claims no medical advice', () => {
  assert.equal(HEALTH_EDUCATION_EXAMPLE.collects_medical_detail, false);
  assert.equal(HEALTH_EDUCATION_EXAMPLE.not_medical_advice, true);
});

test('scoreAsset and understandingGate agree', () => {
  for (const asset of EXAMPLES) {
    assert.deepEqual(understandingGate(asset).factors, scoreAsset(asset).factors);
  }
});

test('the factor floor and release threshold are the published ones', () => {
  assert.equal(FACTOR_FLOOR, 20);
  assert.equal(RELEASE_THRESHOLD, 25);
});
