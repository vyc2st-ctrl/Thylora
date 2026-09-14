// THYLORA Dashboard R6 · arrival matrix and money-distance tests
// Canonical backend record: THY-IDEA-DASHBOARD-SCREEN-ARCHITECTURE-001
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  measureStore, portfolioDistance, readingsFromRows, MONEY_GATES, GATE_STATES
} from '../dashboard/r6/lib/money-distance.js';
import {
  buildMatrix, gradeCell, proofGap, summarise, ARRIVAL_STATES
} from '../dashboard/r6/lib/arrival-matrix.js';

// ---- money-distance --------------------------------------------------------

test('a store with nothing evidenced is the full distance from money', () => {
  const store = measureStore({ store_code: 'S1' });
  assert.equal(store.distance, MONEY_GATES.length);
  assert.equal(store.money_arriving, false);
  assert.equal(store.next_gate.code, 'PRODUCT_EXISTS');
});

test('a gate only closes on an evidence record, never on an assertion', () => {
  const claimed = measureStore({ readings: { PRODUCT_EXISTS: { state: GATE_STATES.SATISFIED } } });
  assert.equal(claimed.distance, MONEY_GATES.length, 'satisfied without evidence closes nothing');

  const evidenced = measureStore({ readings: { PRODUCT_EXISTS: { state: GATE_STATES.SATISFIED, evidence_id: 'PROD-1' } } });
  assert.equal(evidenced.distance, MONEY_GATES.length - 1);
});

test('a claimed but unproven gate is counted open and reported as an unproven claim', () => {
  const store = measureStore({ readings: { STOREFRONT_LIVE: { state: GATE_STATES.CLAIMED } } });
  assert.ok(store.open_gates.includes('STOREFRONT_LIVE'));
  assert.deepEqual(store.unproven_claims, ['STOREFRONT_LIVE']);
});

test('only a fully evidenced chain reads as money arriving', () => {
  const readings = {};
  for (const gate of MONEY_GATES) readings[gate.code] = { state: GATE_STATES.SATISFIED, evidence_id: `${gate.code}-1` };
  const store = measureStore({ readings });
  assert.equal(store.distance, 0);
  assert.equal(store.money_arriving, true);
  assert.match(store.statement, /Money-distance 0/);
});

test('backend rows close the gates they actually prove and no others', () => {
  const readings = readingsFromRows({
    products: [{ id: 'P1', price: 40 }],
    orders: [], payments: [], passports: []
  });
  const store = measureStore({ readings });
  assert.ok(!store.open_gates.includes('PRODUCT_EXISTS'));
  assert.ok(!store.open_gates.includes('PRICE_SET'));
  // a product existing must never imply a payment rail or a settlement
  assert.ok(store.open_gates.includes('PAYMENT_RAIL'));
  assert.ok(store.open_gates.includes('FUNDS_SETTLED'));
});

test('a test order proves a checkout but not a real order', () => {
  const readings = readingsFromRows({ products: [], orders: [{ id: 'O1', is_test: true, status: 'TEST' }] });
  const store = measureStore({ readings });
  assert.ok(!store.open_gates.includes('CHECKOUT_PROVEN'));
  assert.ok(store.open_gates.includes('ORDER_RECEIVED'));
});

test('an unsettled payment does not close the settlement gate', () => {
  const pending = measureStore({ readings: readingsFromRows({ payments: [{ id: 'PAY-1', status: 'PENDING' }] }) });
  assert.ok(pending.open_gates.includes('FUNDS_SETTLED'));
  const settled = measureStore({ readings: readingsFromRows({ payments: [{ id: 'PAY-2', status: 'SETTLED' }] }) });
  assert.ok(!settled.open_gates.includes('FUNDS_SETTLED'));
});

test('an empty portfolio says so rather than reporting a distance of zero', () => {
  const portfolio = portfolioDistance([]);
  assert.equal(portfolio.stores, 0);
  assert.equal(portfolio.nearest, null);
  assert.match(portfolio.statement, /cannot be measured from nothing/);
});

test('the portfolio names the nearest store to money', () => {
  const far = measureStore({ store_code: 'FAR', label: 'Far store' });
  const near = measureStore({
    store_code: 'NEAR', label: 'Near store',
    readings: { PRODUCT_EXISTS: { state: GATE_STATES.SATISFIED, evidence_id: 'P1' }, PRICE_SET: { state: GATE_STATES.SATISFIED, evidence_id: 'P1' } }
  });
  const portfolio = portfolioDistance([far, near]);
  assert.equal(portfolio.nearest.store_code, 'NEAR');
  assert.match(portfolio.statement, /Near store/);
});

// ---- arrival matrix --------------------------------------------------------

test('a cell claiming arrival with no evidence is downgraded to UNPROVEN', () => {
  const cell = gradeCell({ state: ARRIVAL_STATES.LIVE });
  assert.equal(cell.state, ARRIVAL_STATES.UNPROVEN);
  assert.equal(cell.proven, false);
  assert.match(cell.reason, /no evidence record/);
});

test('an evidenced cell keeps the state it claims', () => {
  const cell = gradeCell({ state: ARRIVAL_STATES.SERVING, evidence_id: 'ORDER-9' });
  assert.equal(cell.state, ARRIVAL_STATES.SERVING);
  assert.equal(cell.proven, true);
});

test('a blocked cell without a reason says a reason is required', () => {
  assert.match(gradeCell({ state: ARRIVAL_STATES.BLOCKED }).reason, /reason required/i);
  assert.equal(gradeCell({ state: ARRIVAL_STATES.BLOCKED, reason: 'No payment licence.' }).reason, 'No payment licence.');
});

test('territories the backend did not answer for are kept and marked UNKNOWN', () => {
  const matrix = buildMatrix([{ code: 'NG', name: 'Nigeria' }]);
  assert.equal(matrix.rows.length, 1);
  assert.ok(matrix.rows[0].cells.every(c => c.state === ARRIVAL_STATES.UNKNOWN));
  assert.equal(matrix.rows[0].arrived, false);
});

test('a territory counts as arrived only from LIVE upward', () => {
  const matrix = buildMatrix([
    { code: 'GB', name: 'United Kingdom', lanes: { STOREFRONT: { state: ARRIVAL_STATES.SERVING, evidence_id: 'ORD-1' } } },
    { code: 'GH', name: 'Ghana', lanes: { STOREFRONT: { state: ARRIVAL_STATES.REGISTERED, evidence_id: 'REG-1' } } }
  ]);
  const [gb, gh] = matrix.rows;
  assert.equal(gb.arrived, true);
  assert.equal(gb.serving, true);
  assert.equal(gh.arrived, false, 'registered is not arrived');
});

test('an empty matrix refuses to imply arrival', () => {
  const matrix = buildMatrix([]);
  assert.equal(matrix.summary.territories, 0);
  assert.match(matrix.summary.statement, /cannot be claimed from an empty matrix/);
  assert.match(summarise([]).statement, /empty matrix/);
});

test('the proof gap counts claims that no record supports', () => {
  const matrix = buildMatrix([
    { code: 'US', name: 'United States', lanes: { STOREFRONT: { state: ARRIVAL_STATES.LIVE }, PAYMENT: { state: ARRIVAL_STATES.LIVE, evidence_id: 'PAY-1' } } }
  ]);
  const gap = proofGap(matrix);
  assert.equal(gap.unproven, 1);
  assert.equal(gap.proven, 1);
  assert.match(gap.unproven_list[0], /United States · Storefront/);
  assert.match(gap.statement, /claim arrival with no evidence/);
});
