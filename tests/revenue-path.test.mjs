// STORE · revenue-path priority tests — MATH-REVENUE-PATH-PRIORITY-662
// Workroom: WR-RECONCILE-667
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { rankRevenuePaths, STORE_CANDIDATES, PRICE_PROPOSAL, factor,
         DEMAND_FACTORS, SUPPLY_FACTORS } from '../store/lib/revenue-path.js';

test('willingness to pay is UNKNOWN for every product, because no test has been run', () => {
  for (const candidate of STORE_CANDIDATES) {
    assert.equal(candidate.factors.W.evidence, 'UNKNOWN', candidate.product_code);
  }
});

test('a ranking with any unevidenced demand factor is never market-evidenced', () => {
  const result = rankRevenuePaths(STORE_CANDIDATES);
  assert.equal(result.basis, 'COMPLETION_RANKED');
  assert.equal(result.market_validated, false);
  assert.match(result.basis_meaning, /NOT evidence of what anyone will pay/);
});

test('R_p is refused rather than guessed when a factor is unknown', () => {
  for (const row of rankRevenuePaths(STORE_CANDIDATES).ranked) {
    assert.equal(row.R_p, null, `${row.title} produced a revenue score from unknown inputs`);
  }
});

test('the completion ranking reproduces the release order independently', () => {
  const order = rankRevenuePaths(STORE_CANDIDATES).ranked.map(r => r.product_code);
  assert.deepEqual(order, [
    'THY-QYRIS-QUICKCHECK-001',
    'THY-BEFORE-YOU-BUY-001',
    'THY-STUCK-LOOP-RESET-001'
  ]);
});

test('completion cost and time are the only things actually evidenced', () => {
  for (const candidate of STORE_CANDIDATES) {
    for (const k of SUPPLY_FACTORS) assert.equal(candidate.factors[k].evidence, 'OBSERVED', k);
    for (const k of DEMAND_FACTORS) assert.equal(candidate.factors[k].evidence, 'UNKNOWN', k);
  }
});

test('a fully evidenced set would compute R_p and be market-evidenced', () => {
  const evidenced = [{
    product_code: 'TEST', title: 'Test',
    factors: {
      N: factor(100, 'OBSERVED'), F: factor(2, 'OBSERVED'),
      W: factor(10, 'OBSERVED'), E: factor(1, 'OBSERVED'),
      C: factor(2, 'OBSERVED'), T: factor(5, 'OBSERVED')
    }
  }];
  const result = rankRevenuePaths(evidenced);
  assert.equal(result.basis, 'MARKET_EVIDENCED');
  assert.equal(result.ranked[0].R_p, (100 * 2 * 10 * 1) / (2 * 5));
});

test('an evidenced factor cannot carry a missing value', () => {
  assert.throws(() => factor(null, 'OBSERVED'), /positive value/);
  assert.throws(() => factor(0, 'REPORTED'), /positive value/);
  assert.throws(() => factor(1, 'GUESSED'), /unknown evidence class/);
});

test('the price is carried as a proposal and never as a validated price', () => {
  assert.equal(PRICE_PROPOSAL.state, 'PROPOSAL');
  assert.equal(PRICE_PROPOSAL.market_validated, false);
  assert.equal(PRICE_PROPOSAL.willingness_to_pay_evidence, 'UNKNOWN');
  assert.deepEqual([...PRICE_PROPOSAL.evidence_held], []);
  assert.ok(PRICE_PROPOSAL.what_would_validate_it.length >= 3);
});

test('the packet states the free preview as pages 1-3', () => {
  const packet = readFileSync(new URL('../store/qyris-quickcheck/PACKET.md', import.meta.url), 'utf8');
  assert.ok(/pages 1[–-]3/i.test(packet), 'free preview must read pages 1-3');
  assert.ok(!/Free[\s\S]{0,40}Pages 1[–-]4/i.test(packet), 'the pages 1-4 preview must be corrected');
});

test('the packet never calls the price validated', () => {
  const packet = readFileSync(new URL('../store/qyris-quickcheck/PACKET.md', import.meta.url), 'utf8');
  assert.ok(!/market[- ]validated|validated price|proven price/i.test(
    packet.replace(/not market.validated/gi, '')), 'the packet claims price validation');
});
