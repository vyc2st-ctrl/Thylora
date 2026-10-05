// CROSS-AGENT PATROL tests — MATH-CROSS-AGENT-PATROL-653
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scoreWrite, driftIndex, LANE_WRITES, FACTORS } from '../patrol/cross-agent.js';

test('P is the product of the four factors and any zero triggers the alert', () => {
  assert.equal(scoreWrite({ write_id: 'w', author: 'a', checked_by: 'b', H: 1, N: 1, L: 1, X: 1 }).P, 1);
  for (const zero of FACTORS) {
    const w = { write_id: 'w', author: 'a', checked_by: 'b', H: 1, N: 1, L: 1, X: 1, [zero]: 0 };
    const scored = scoreWrite(w);
    assert.equal(scored.P, 0);
    assert.equal(scored.alert, true);
    assert.equal(scored.alert_text, 'ALERT CHAIRMAN');
    assert.deepEqual([...scored.zero_factors], [zero]);
  }
});

test('an author cannot self-certify its own cross-check', () => {
  assert.throws(() => scoreWrite({ write_id: 'w', author: 'Claude', checked_by: 'Claude', H: 1, N: 1, L: 1, X: 1 }),
    /other than the author/);
  assert.throws(() => scoreWrite({ write_id: 'w', author: 'Claude', H: 1, N: 1, L: 1, X: 1 }),
    /other than the author/);
});

test('factors are strictly 0 or 1 — no partial credit', () => {
  assert.throws(() => scoreWrite({ write_id: 'w', author: 'a', checked_by: 'b', H: 0.5, N: 1, L: 1, X: 1 }), /exactly 0 or 1/);
  assert.throws(() => scoreWrite({ write_id: 'w', author: 'a', checked_by: 'b', H: true, N: 1, L: 1, X: 1 }), /exactly 0 or 1/);
});

test('both of this lane\'s writes currently fail the patrol', () => {
  for (const write of LANE_WRITES) {
    const scored = scoreWrite(write);
    assert.equal(scored.P, 0, `${write.write_id} must not claim a pass`);
    assert.equal(scored.alert_text, 'ALERT CHAIRMAN');
  }
});

test('97b534c fails on head, lineage and cross-check; it does not fail on no-loss', () => {
  const scored = scoreWrite(LANE_WRITES[0]);
  assert.deepEqual([...scored.zero_factors], ['H', 'L', 'X']);
  assert.equal(scored.factors.N, 1);
});

test('the reconciliation sits on the true head but is still unregistered and unchecked', () => {
  const scored = scoreWrite(LANE_WRITES[1]);
  assert.equal(scored.factors.H, 1);
  assert.equal(scored.factors.N, 1);
  assert.deepEqual([...scored.zero_factors], ['L', 'X']);
});

test('every zero factor names what would raise it', () => {
  for (const write of LANE_WRITES) {
    for (const raise of scoreWrite(write).raises) {
      assert.ok(raise.raised_by && raise.raised_by.length > 0, `${write.write_id}/${raise.factor} is a dead end`);
    }
  }
});

test('the drift index finds cross-check and lineage as the worst gaps', () => {
  const drift = driftIndex(LANE_WRITES);
  assert.equal(drift.writes, 2);
  assert.equal(drift.alerts, 2);
  assert.equal(drift.drift.N, 0);
  assert.equal(drift.drift.H, 0.5);
  assert.equal(drift.drift.L, 1);
  assert.equal(drift.drift.X, 1);
});
