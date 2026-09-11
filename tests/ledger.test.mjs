// RAE LINK · monetization math tests
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  settleRevenueEvent, allocate, allocatePool, validateSplitPolicy,
  distributableBase, markPaid, BP
} from '../rae-link/lib/ledger.js';

const basePolicy = {
  policy_code: 'TEST', lane_code: 'ONE_TIME_MEDIA',
  platform_share_bp: 2000, creator_share_bp: 8000,
  beneficiary_share_bp: 0, partner_share_bp: 0
};
const baseEvent = {
  lane_code: 'ONE_TIME_MEDIA', channel_id: 'ch-1', currency: 'USD',
  gross_minor: 10000, processor_fee_minor: 320, refund_minor: 0,
  chargeback_minor: 0, tax_minor: 0, tax_state: 'NOT_APPLICABLE', tax_remitted_by: 'NONE'
};

test('split policy must total exactly 100%', () => {
  assert.equal(validateSplitPolicy(basePolicy).valid, true);
  assert.equal(validateSplitPolicy({ ...basePolicy, creator_share_bp: 7999 }).valid, false);
  assert.equal(validateSplitPolicy({ ...basePolicy, creator_share_bp: 8001 }).valid, false);
});

test('a beneficiary share must name the beneficiary', () => {
  const result = validateSplitPolicy({
    ...basePolicy, creator_share_bp: 5000, beneficiary_share_bp: 3000
  });
  assert.equal(result.valid, false);
  assert.ok(result.problems.some(p => /name the beneficiary/i.test(p)));
});

test('the family partnership lane requires an explicit share declared before publication', () => {
  const missingShare = validateSplitPolicy({
    ...basePolicy, lane_code: 'FAMILY_PARTNERSHIP', declared_before_publication: true
  });
  assert.ok(missingShare.problems.some(p => /explicit beneficiary share/i.test(p)));

  const lateDeclaration = validateSplitPolicy({
    policy_code: 'X', lane_code: 'FAMILY_PARTNERSHIP',
    platform_share_bp: 1000, creator_share_bp: 4000, beneficiary_share_bp: 5000,
    partner_share_bp: 0, beneficiary_ref: 'Family fund', declared_before_publication: false
  });
  assert.ok(lateDeclaration.problems.some(p => /declared before publication/i.test(p)));
});

test('distributable base deducts fees, refunds, chargebacks and platform-remitted tax only', () => {
  assert.equal(distributableBase(baseEvent), 9680);
  assert.equal(distributableBase({
    ...baseEvent, tax_minor: 800, tax_state: 'PLATFORM_REMITTED', tax_remitted_by: 'PLATFORM'
  }), 8880);
  // Creator-responsible tax is reported, not withheld from the base.
  assert.equal(distributableBase({
    ...baseEvent, tax_minor: 800, tax_state: 'CREATOR_RESPONSIBLE', tax_remitted_by: 'CREATOR'
  }), 9680);
  assert.equal(distributableBase({ ...baseEvent, refund_minor: 20000 }), 0, 'base never goes negative');
});

test('allocation never loses or invents a minor unit, across many awkward bases', () => {
  const shares = { PLATFORM: 3333, CREATOR: 3333, BENEFICIARY: 3334 };
  for (let base = 0; base <= 5000; base += 7) {
    const entries = allocate(base, shares);
    const total = entries.reduce((sum, e) => sum + e.amount_minor, 0);
    assert.equal(total, base, `base ${base} did not reconcile`);
  }
});

test('rounding remainder favours the beneficiary and the creator before the platform', () => {
  // base 1 with three equal-ish parties: the single cent must go to the beneficiary.
  const entries = allocate(1, { PLATFORM: 3333, CREATOR: 3333, BENEFICIARY: 3334 });
  const beneficiary = entries.find(e => e.party_kind === 'BENEFICIARY');
  const platform = entries.find(e => e.party_kind === 'PLATFORM');
  assert.equal(beneficiary.amount_minor, 1);
  assert.equal(platform.amount_minor, 0);
});

test('settlement exposes every required disclosure field', () => {
  const settled = settleRevenueEvent(baseEvent, basePolicy);
  for (const field of [
    'gross_revenue_minor', 'processor_fees_minor', 'refunds_minor', 'chargebacks_minor',
    'tax_state', 'platform_share_minor', 'creator_share_minor', 'net_payable_minor',
    'payment_date', 'payment_evidence'
  ]) {
    assert.ok(field in settled, `missing disclosure field ${field}`);
  }
  assert.equal(settled.distributable_base_minor, 9680);
  assert.equal(settled.platform_share_minor + settled.creator_share_minor, 9680);
  assert.equal(settled.creator_share_minor, 7744);
});

test('an unresolved tax state holds the payout instead of paying it', () => {
  const settled = settleRevenueEvent({ ...baseEvent, tax_state: 'UNRESOLVED' }, basePolicy);
  assert.equal(settled.payout_state, 'HELD_TAX_UNRESOLVED');
  assert.equal(settled.net_payable_minor, 0);
  assert.ok(settled.entries.every(e => e.entry_state === 'HELD'));
  // The creator's share is still computed and visible; it is held, not erased.
  assert.equal(settled.creator_share_minor, 7744);
});

test('deductions can never exceed gross', () => {
  const settled = settleRevenueEvent({ ...baseEvent, refund_minor: 9800 }, basePolicy);
  assert.equal(settled.settled, false);
  assert.equal(settled.reason, 'DEDUCTIONS_EXCEED_GROSS');
});

test('a three-way family partnership split reconciles exactly', () => {
  const settled = settleRevenueEvent(
    { ...baseEvent, lane_code: 'FAMILY_PARTNERSHIP', gross_minor: 9999, processor_fee_minor: 313 },
    { policy_code: 'FAM', lane_code: 'FAMILY_PARTNERSHIP', platform_share_bp: 1000,
      creator_share_bp: 4000, beneficiary_share_bp: 5000, partner_share_bp: 0,
      beneficiary_ref: 'Named family fund', declared_before_publication: true }
  );
  assert.equal(settled.settled, true);
  const sum = settled.platform_share_minor + settled.creator_share_minor + settled.beneficiary_share_minor;
  assert.equal(sum, settled.distributable_base_minor);
});

test('non-integer or negative money is refused rather than silently coerced', () => {
  assert.throws(() => settleRevenueEvent({ ...baseEvent, gross_minor: 10.5 }, basePolicy), TypeError);
  assert.throws(() => settleRevenueEvent({ ...baseEvent, gross_minor: -1 }, basePolicy), RangeError);
});

test('a pooled lane distributes the whole pot by eligible watch time', () => {
  const result = allocatePool(100000, [
    { ref: 'a', watched_seconds: 3600 },
    { ref: 'b', watched_seconds: 1234 },
    { ref: 'c', watched_seconds: 77 },
    { ref: 'd', watched_seconds: 500, is_monetizable: false }
  ]);
  const total = result.allocated.reduce((sum, r) => sum + r.amount_minor, 0);
  assert.equal(total, 100000);
  assert.equal(result.undistributed_minor, 0);
  assert.ok(!result.allocated.some(r => r.ref === 'd'), 'non-monetizable views are excluded');
});

test('a pool with no eligible watch time is reported, not quietly absorbed', () => {
  const result = allocatePool(5000, [{ ref: 'a', watched_seconds: 0 }]);
  assert.equal(result.undistributed_minor, 5000);
  assert.equal(result.reason, 'NO_ELIGIBLE_WATCH_TIME');
});

test('a payout reads PAID only with date, processor, reference and matching amount', () => {
  const payout = { net_payable_minor: 7744, payout_state: 'PAYABLE' };
  assert.equal(markPaid(payout, null).payout_state, 'PENDING_EVIDENCE');
  assert.equal(markPaid(payout, { payment_date: '2026-09-30', processor: 'x' }).payout_state, 'PENDING_EVIDENCE');
  assert.equal(markPaid(payout, {
    payment_date: '2026-09-30', processor: 'stripe-connect',
    processor_reference: 'po_123', amount_minor: 7743
  }).payout_state, 'PENDING_EVIDENCE', 'amount must equal net payable');

  const paid = markPaid(payout, {
    payment_date: '2026-09-30', processor: 'stripe-connect',
    processor_reference: 'po_123', amount_minor: 7744
  });
  assert.equal(paid.payout_state, 'PAID');
  assert.equal(paid.payment_reference, 'po_123');
});

test('basis points are the only percentage unit', () => {
  assert.equal(BP, 10000);
});
