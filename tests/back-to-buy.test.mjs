// THYLORA · Back to Buy · ledger tests (WR-SPINE-624)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  settleSale, releaseReserve, refundEffect, payoutState, fraudFlags,
  validateCampaign, campaignRuleText, BP
} from '../commerce/lib/back-to-buy.js';

// Worked example used in the workroom doc: a $25.00 teaching tee, Maryland 6% sales tax,
// published standard card rate 2.9% + 30c, $11.50 blank + print + ship, 5% refund reserve, r = 50%.
const tee = { gross: 2650, tax: 150, fees: 107, product_cost: 1150, refund_reserve: 133, support_rate_bp: 5000 };

test('worked example: N = G - T - F - P - R and B = N x r', () => {
  const s = settleSale(tee);
  assert.equal(s.ok, true);
  assert.equal(s.N, 2650 - 150 - 107 - 1150 - 133);
  assert.equal(s.N, 1110);
  assert.equal(s.B, 555);
  assert.equal(s.house, 555);
  assert.match(s.rule, /N = G - T - F - P - R = 2650 - 150 - 107 - 1150 - 133 = 1110/);
});

test('every cent is accounted for across all terms', () => {
  for (let G = 0; G <= 3000; G += 7) {
    for (const r of [0, 1, 3333, 5000, 9999, BP]) {
      const s = settleSale({ gross: G, tax: 0, fees: Math.floor(G / 30), product_cost: 0, refund_reserve: Math.floor(G / 20), support_rate_bp: r });
      assert.equal(s.T + s.F + s.P + s.R + s.B + s.house, G);
      assert.ok(s.B <= s.N && s.B >= 0);
    }
  }
});

test('rounding favours the recipient and never exceeds N', () => {
  const s = settleSale({ gross: 3, tax: 0, fees: 0, product_cost: 0, refund_reserve: 0, support_rate_bp: 3333 });
  assert.equal(s.B, 1);
  const all = settleSale({ gross: 999, tax: 0, fees: 0, product_cost: 0, refund_reserve: 0, support_rate_bp: BP });
  assert.equal(all.B, 999);
  assert.equal(all.house, 0);
});

test('a product priced below its cost cannot carry a campaign', () => {
  const s = settleSale({ gross: 1000, tax: 60, fees: 59, product_cost: 900, refund_reserve: 0, support_rate_bp: 5000 });
  assert.equal(s.ok, false);
  assert.equal(s.code, 'DEDUCTIONS_EXCEED_GROSS');
  assert.equal(s.B, 0);
});

test('money must be integer cents and non-negative; rate must be 0..10000 bp', () => {
  assert.throws(() => settleSale({ ...tee, gross: 26.5 }), TypeError);
  assert.throws(() => settleSale({ ...tee, fees: -1 }), RangeError);
  assert.throws(() => settleSale({ ...tee, support_rate_bp: 10001 }), RangeError);
  assert.throws(() => settleSale({ ...tee, support_rate_bp: 50.5 }), RangeError);
});

test('reserve release pays the recipient what they would have had with no reserve', () => {
  const s = settleSale(tee);
  const rel = releaseReserve(s);
  const noReserve = settleSale({ ...tee, refund_reserve: 0 });
  assert.equal(s.B + rel.B_release, noReserve.B);
  assert.equal(s.house + rel.house_release, noReserve.house);
  assert.equal(rel.B_total, 622); // (2650-150-107-1150) = 1243, 50% rounded up = 622
});

test('refund before payout reverses support; after payout the family is never clawed back', () => {
  const s = settleSale(tee);
  const before = refundEffect(s, { refund_amount: 2650, paid_out: false });
  assert.equal(before.B_reversed, s.B);
  assert.equal(before.recipient_clawback, 0);
  const after = refundEffect(s, { refund_amount: 2650, paid_out: true });
  assert.equal(after.recipient_clawback, 0);
  assert.equal(after.from_reserve, 133);
  assert.equal(after.from_house, 2650 - 133);
  assert.throws(() => refundEffect(s, { refund_amount: 2651, paid_out: false }), RangeError);
});

test('payout holds are all reported, and legal/identity come before the window', () => {
  const day = 86400000;
  const p = payoutState({ balance: 555, now_ms: 10 * day, latest_sale_ms: 5 * day, refund_window_days: 30, identity_verified: false, legal_cleared: false });
  assert.deepEqual(p.holds, ['HELD_LEGAL', 'HELD_IDENTITY', 'HELD_REFUND_WINDOW']);
  assert.equal(p.state, 'HELD_LEGAL');
  const ok = payoutState({ balance: 555, now_ms: 40 * day, latest_sale_ms: 5 * day, refund_window_days: 30, identity_verified: true, legal_cleared: true });
  assert.equal(ok.state, 'PAYABLE');
  assert.equal(payoutState({ balance: 0, now_ms: 0, latest_sale_ms: 0, refund_window_days: 0, identity_verified: true, legal_cleared: true }).state, 'ACCRUING');
});

test('fraud rules name the rule and the number that tripped it', () => {
  const h = 3600000;
  const sales = Array.from({ length: 30 }, (_, i) => ({ at_ms: i * h / 2, payment_fingerprint: i === 3 ? 'fp-recipient' : `fp-${i}` }));
  const flags = fraudFlags({ sales, recipient_payment_fingerprints: ['fp-recipient'], chargebacks: 1 });
  const codes = flags.map(f => f.code).sort();
  assert.deepEqual(codes, ['CHARGEBACK_RATIO', 'SELF_PURCHASE', 'VELOCITY']);
  assert.deepEqual(fraudFlags({ sales: sales.slice(0, 5), chargebacks: 0 }), []);
});

test('a campaign reports every missing prerequisite at once', () => {
  const bad = validateCampaign({ campaign_id: 'x', recipient_is_minor: true, medical_details_collected: true, support_rate_bp: 20000 });
  const codes = bad.blockers.map(b => b.code);
  for (const c of ['CAMPAIGN_ID_FORMAT', 'NEED_MISSING', 'CONSENT_MISSING', 'GUARDIAN_REQUIRED', 'PRIVACY_STATE', 'MEDICAL_DETAIL_REFUSED', 'NO_PRODUCT', 'RATE_INVALID', 'REFUND_WINDOW']) {
    assert.ok(codes.includes(c), `missing blocker ${c}`);
  }
  const good = validateCampaign({
    campaign_id: 'BTB-2026-K7QX2M', need_statement: 'Help the family cover rent for two months after a job loss.',
    consent: { recipient_consented: true }, privacy_state: 'PRIVATE_LINK_ONLY', product_ids: ['p1'],
    support_rate_bp: 5000, refund_window_days: 30
  });
  assert.equal(good.valid, true);
});

test('the public rule text states the actual percentage and window', () => {
  const t = campaignRuleText({ support_rate_bp: 5000, refund_window_days: 30 });
  assert.match(t, /50% of what remains is owed to the recipient/);
  assert.match(t, /after 30 days/);
  assert.doesNotMatch(t, /a portion/i);
});
