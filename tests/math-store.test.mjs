// THYLORA · store product candidates
//
// This lane was built under "no publishing". These tests exist so that rule
// cannot be lost by a later edit that quietly flips a flag.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  STORE_CANDIDATES, STANDING_BLOCKERS, candidateById, publishGate, candidateSummary, CANDIDATE_STATUS
} from '../math-surface/lib/store.js';
import { scanForProtectedNames } from '../math-surface/lib/continuity.js';

test('at least eight store product candidates are recorded', () => {
  assert.ok(STORE_CANDIDATES.length >= 8, `only ${STORE_CANDIDATES.length} candidates`);
});

test('nothing is published, listed or publishable', () => {
  for (const item of STORE_CANDIDATES) {
    assert.equal(item.status, CANDIDATE_STATUS, `${item.id} is not a candidate`);
    assert.equal(item.publishable, false, `${item.id} is marked publishable`);
    assert.equal(item.listed, false, `${item.id} is marked listed`);
  }
  const summary = candidateSummary();
  assert.equal(summary.published, 0);
  assert.equal(summary.listed, 0);
  assert.equal(summary.count, STORE_CANDIDATES.length);
});

test('every candidate carries the standing release blocker', () => {
  for (const item of STORE_CANDIDATES) {
    const codes = item.blockers.map(b => b.code);
    assert.ok(codes.includes('CHAIRMAN_RELEASE_NOT_GIVEN'), `${item.id} has no release blocker`);
    assert.ok(codes.includes('PRICING_NOT_SET'), `${item.id} has no pricing blocker`);
  }
  assert.equal(STANDING_BLOCKERS.length, 2);
});

test('the publish gate never releases anything in this lane', () => {
  for (const item of STORE_CANDIDATES) {
    const gate = publishGate(item);
    assert.equal(gate.releasable, false);
    assert.ok(gate.blockers.length >= 2, `${item.id} passed the gate too easily`);
    assert.equal(gate.problems.length, 0, `${item.id}: ${gate.problems.join('; ')}`);
    assert.match(gate.statement, /Nothing in this lane is published/);
  }
});

test('every candidate says what it refuses to claim', () => {
  for (const item of STORE_CANDIDATES) {
    assert.ok(item.does_not_claim.length >= 1, `${item.id} claims no limits on itself`);
    assert.ok(item.contains.length >= 2, `${item.id} does not say what is inside it`);
    assert.ok(item.built_from.length >= 1, `${item.id} does not say what it is built from`);
    assert.ok(item.summary.length > 30, `${item.id} has no real summary`);
  }
});

test('no candidate claims to be a diagnostic instrument', () => {
  const diagnosticish = STORE_CANDIDATES.filter(c =>
    /diagnos/i.test(c.summary) && !c.does_not_claim.some(d => /not a diagnostic instrument/i.test(d))
  );
  assert.equal(diagnosticish.length, 0, `these candidates imply diagnosis without refusing it: ${diagnosticish.map(c => c.id).join(', ')}`);
});

test('any candidate that needs imagery says so, because none was produced', () => {
  const printSets = STORE_CANDIDATES.filter(c => /PRINT|PHYSICAL/.test(c.form));
  assert.ok(printSets.length >= 1);
  for (const item of printSets) {
    const codes = item.blockers.map(b => b.code);
    const acceptable = codes.includes('IMAGERY_NOT_COMMISSIONED') || codes.includes('CURRICULUM_MAPPING_ABSENT') || codes.includes('CHILD_DATA_POLICY_UNRESOLVED');
    assert.ok(acceptable, `${item.id} is a physical product with no production blocker named`);
  }
});

test('the record-keeping candidate names the child data question before anything else', () => {
  const item = candidateById('SPC-MATH-003');
  assert.ok(item.blockers.some(b => b.code === 'CHILD_DATA_POLICY_UNRESOLVED'));
});

test('no candidate carries a protected name', () => {
  for (const item of STORE_CANDIDATES) {
    const text = [item.title, item.summary, ...item.contains, ...item.does_not_claim].join(' ');
    assert.equal(scanForProtectedNames(text).length, 0, `${item.id} carries a protected name`);
  }
});

test('an unknown candidate id returns null rather than a guess', () => {
  assert.equal(candidateById('SPC-DOES-NOT-EXIST'), null);
});
