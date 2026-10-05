// RAE LINK · payout plan RAE-PAY-1 tests
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RAE_PAY_1, compareToEarth, foundingPolicy, windowBonus, PAY_TERMS } from '../rae-link/lib/payouts.js';
import { validateSplitPolicy } from '../rae-link/lib/ledger.js';

test('every RAE-PAY-1 lane is a valid split totalling 100%', () => {
  for (const p of Object.values(RAE_PAY_1)) assert.equal(validateSplitPolicy(p).valid, true, p.policy_code);
});

test('creators get more than the best Earth reference on every lane (tips: equal share plus fee paid)', () => {
  for (const row of compareToEarth()) {
    if (row.lane === 'TIP') { assert.equal(row.better_by_bp, 0); assert.match(PAY_TERMS.tips, /pays the card fee/); continue; }
    assert.ok(row.better_by_bp > 0, `${row.lane}: ${row.ours_bp} vs Earth ${row.earth_bp}`);
  }
});

test('founding creators get half the platform share back, still valid', () => {
  const f = foundingPolicy(RAE_PAY_1.ADVERTISING, 3);
  assert.equal(f.platform_share_bp, 1250);
  assert.equal(f.creator_share_bp, 8750);
  assert.equal(validateSplitPolicy(f).valid, true);
  assert.equal(foundingPolicy(RAE_PAY_1.ADVERTISING, 12), RAE_PAY_1.ADVERTISING);
  assert.equal(validateSplitPolicy(foundingPolicy(RAE_PAY_1.AFFILIATE, 0)).valid, true);
});

test('THE WINDOW bonus pool pays the Top 10 exactly, highest rank most', () => {
  const ids = Array.from({ length: 12 }, (_, i) => `ch${i + 1}`);
  for (const pool of [0, 1, 54, 55, 99999, 1000003]) {
    const rows = windowBonus(pool, ids);
    assert.equal(rows.length, 10);
    assert.equal(rows.reduce((a, r) => a + r.amount_minor, 0), pool);
    for (let i = 1; i < rows.length; i++) assert.ok(rows[i - 1].amount_minor >= rows[i].amount_minor);
  }
});
