// RAE LINK · monetization math
// Workroom: WR-RAELINK-001
//
// This module is the client-side twin of rael_settle_revenue_event in
// db/rae-link/0009_functions.sql. Both compute the same distributable base and
// use the same remainder rule, so a statement shown in the app equals the
// statement stored in the backend.
//
// Money is integer minor units (cents). There is no floating point money here.
// Percentages are basis points: 10000 bp = 100%.

export const BP = 10000;

export const REVENUE_LANES = Object.freeze({
  ADVERTISING:           { pooled: true,  disclosure: true,  label: 'Advertising and sponsorship' },
  PLATFORM_SUBSCRIPTION: { pooled: true,  disclosure: false, label: 'RAE Link subscription' },
  CREATOR_SUBSCRIPTION:  { pooled: false, disclosure: false, label: 'Creator subscription' },
  TIP:                   { pooled: false, disclosure: false, label: 'Tips and support' },
  ONE_TIME_MEDIA:        { pooled: false, disclosure: false, label: 'Paid media purchase' },
  EDF_PRODUCT:           { pooled: false, disclosure: false, label: 'EDF and product sale' },
  LICENSING:             { pooled: false, disclosure: true,  label: 'Licensing' },
  COMMISSION:            { pooled: false, disclosure: true,  label: 'Commissioned production' },
  AFFILIATE:             { pooled: false, disclosure: true,  label: 'Affiliate and referral' },
  FAMILY_PARTNERSHIP:    { pooled: false, disclosure: true,  label: 'Family Story Partnership' }
});

export const TAX_STATES = Object.freeze(['NOT_APPLICABLE', 'PLATFORM_REMITTED', 'CREATOR_RESPONSIBLE', 'UNRESOLVED']);

// Remainder goes to the people before it goes to the house.
const REMAINDER_PRIORITY = ['BENEFICIARY', 'CREATOR', 'PARTNER', 'REFERRER', 'PLATFORM'];

function asInt(value, field) {
  const n = Number(value ?? 0);
  if (!Number.isInteger(n)) throw new TypeError(`${field} must be an integer number of minor units, received ${value}`);
  if (n < 0) throw new RangeError(`${field} cannot be negative`);
  return n;
}

/**
 * Validate a split policy. Shares must total exactly 100% and a beneficiary
 * share must name who receives it.
 */
export function validateSplitPolicy(policy) {
  const problems = [];
  const shares = {
    PLATFORM: Number(policy.platform_share_bp ?? 0),
    CREATOR: Number(policy.creator_share_bp ?? 0),
    BENEFICIARY: Number(policy.beneficiary_share_bp ?? 0),
    PARTNER: Number(policy.partner_share_bp ?? 0),
    REFERRER: Number(policy.referrer_share_bp ?? 0)
  };
  for (const [party, bp] of Object.entries(shares)) {
    if (!Number.isInteger(bp) || bp < 0 || bp > BP) problems.push(`${party} share must be 0–10000 basis points`);
  }
  const total = Object.values(shares).reduce((a, b) => a + b, 0);
  if (total !== BP) problems.push(`shares total ${total} bp; they must total exactly ${BP} bp`);
  if (shares.BENEFICIARY > 0 && !policy.beneficiary_ref) problems.push('a beneficiary share must name the beneficiary');
  if (policy.lane_code === 'FAMILY_PARTNERSHIP' && shares.BENEFICIARY < 1) {
    problems.push('the Family Story Partnership lane requires an explicit beneficiary share');
  }
  if (policy.lane_code === 'FAMILY_PARTNERSHIP' && policy.declared_before_publication !== true) {
    problems.push('the beneficiary share must be declared before publication');
  }
  return { valid: problems.length === 0, problems, shares };
}

/**
 * The money that is actually available to split:
 *   gross - refunds - chargebacks - processor fees - tax the platform remits.
 * Tax the creator is responsible for is not deducted here; it is their liability,
 * and it is reported rather than silently withheld.
 */
export function distributableBase(event) {
  const gross = asInt(event.gross_minor, 'gross_minor');
  const fees = asInt(event.processor_fee_minor, 'processor_fee_minor');
  const refunds = asInt(event.refund_minor, 'refund_minor');
  const chargebacks = asInt(event.chargeback_minor, 'chargeback_minor');
  const tax = asInt(event.tax_minor, 'tax_minor');
  const taxOut = (event.tax_remitted_by === 'PLATFORM' || event.tax_remitted_by === 'PROCESSOR') ? tax : 0;
  return Math.max(0, gross - refunds - chargebacks - fees - taxOut);
}

/**
 * Allocate a base across parties by basis points with no lost minor unit.
 * floor() each share, then hand the remainder out one unit at a time in
 * REMAINDER_PRIORITY order. The platform is last in that order by design.
 */
export function allocate(baseMinor, shares) {
  const base = asInt(baseMinor, 'baseMinor');
  const entries = Object.entries(shares)
    .filter(([, bp]) => Number(bp) > 0)
    .map(([party, bp]) => ({
      party_kind: party,
      share_bp: Number(bp),
      amount_minor: Math.floor((base * Number(bp)) / BP),
      rounding_minor: 0
    }));

  const allocated = entries.reduce((sum, e) => sum + e.amount_minor, 0);
  let remainder = base - allocated;

  const ordered = [...entries].sort(
    (a, b) => REMAINDER_PRIORITY.indexOf(a.party_kind) - REMAINDER_PRIORITY.indexOf(b.party_kind)
  );
  let i = 0;
  while (remainder > 0 && ordered.length > 0) {
    ordered[i % ordered.length].amount_minor += 1;
    ordered[i % ordered.length].rounding_minor += 1;
    remainder -= 1;
    i += 1;
  }

  const total = entries.reduce((sum, e) => sum + e.amount_minor, 0);
  if (total !== base) throw new Error(`allocation lost money: ${total} allocated from a base of ${base}`);
  return entries;
}

/**
 * Settle one revenue event into a full statement. Every field the directive
 * requires is present and named. Nothing is folded into "net proceeds".
 */
export function settleRevenueEvent(event, policy) {
  const check = validateSplitPolicy(policy);
  if (!check.valid) {
    return { settled: false, reason: 'INVALID_SPLIT_POLICY', problems: check.problems };
  }
  if (!TAX_STATES.includes(event.tax_state)) {
    return { settled: false, reason: 'INVALID_TAX_STATE', problems: [`unknown tax state ${event.tax_state}`] };
  }

  const gross = asInt(event.gross_minor, 'gross_minor');
  const fees = asInt(event.processor_fee_minor, 'processor_fee_minor');
  const refunds = asInt(event.refund_minor, 'refund_minor');
  const chargebacks = asInt(event.chargeback_minor, 'chargeback_minor');
  const tax = asInt(event.tax_minor, 'tax_minor');
  if (fees + refunds + chargebacks + tax > gross) {
    return { settled: false, reason: 'DEDUCTIONS_EXCEED_GROSS',
             problems: ['fees, refunds, chargebacks and tax exceed gross revenue'] };
  }

  const base = distributableBase(event);
  const entries = allocate(base, check.shares).map(entry => ({
    ...entry,
    party_ref: partyRef(entry.party_kind, event, policy),
    currency: event.currency || 'USD',
    base_minor: base,
    entry_state: event.tax_state === 'UNRESOLVED' ? 'HELD' : 'PAYABLE',
    hold_reason: event.tax_state === 'UNRESOLVED' ? 'TAX_STATE_UNRESOLVED' : null
  }));

  const byParty = kind => entries.find(e => e.party_kind === kind)?.amount_minor ?? 0;
  const creatorShare = byParty('CREATOR');
  const held = event.tax_state === 'UNRESOLVED';

  return {
    settled: true,
    lane_code: event.lane_code,
    currency: event.currency || 'USD',
    // The nine required disclosure fields, plus the working.
    gross_revenue_minor: gross,
    processor_fees_minor: fees,
    refunds_minor: refunds,
    chargebacks_minor: chargebacks,
    tax_state: event.tax_state,
    tax_minor: tax,
    tax_remitted_by: event.tax_remitted_by ?? 'NONE',
    distributable_base_minor: base,
    platform_share_minor: byParty('PLATFORM'),
    creator_share_minor: creatorShare,
    beneficiary_share_minor: byParty('BENEFICIARY'),
    partner_share_minor: byParty('PARTNER'),
    net_payable_minor: held ? 0 : creatorShare,
    payout_state: held ? 'HELD_TAX_UNRESOLVED' : 'PAYABLE',
    payment_date: null,
    payment_evidence: null,
    policy_code: policy.policy_code ?? null,
    entries
  };
}

function partyRef(kind, event, policy) {
  if (kind === 'CREATOR') return event.channel_id ?? 'UNASSIGNED_CHANNEL';
  if (kind === 'BENEFICIARY' || kind === 'PARTNER') return policy.beneficiary_ref ?? 'UNNAMED_BENEFICIARY';
  if (kind === 'REFERRER') return policy.referrer_ref ?? 'UNNAMED_REFERRER';
  return 'THYLORA_PLATFORM';
}

/**
 * Pooled lanes (advertising, platform subscription) split one pot across many
 * assets by eligible watch time. Same remainder discipline: the pot is fully
 * distributed or the call fails loudly.
 */
export function allocatePool(poolMinor, participants) {
  const pool = asInt(poolMinor, 'poolMinor');
  const eligible = participants.filter(p => p.is_monetizable !== false && Number(p.watched_seconds) > 0);
  const totalSeconds = eligible.reduce((sum, p) => sum + Number(p.watched_seconds), 0);
  if (totalSeconds === 0) {
    return { allocated: [], undistributed_minor: pool, reason: 'NO_ELIGIBLE_WATCH_TIME' };
  }
  const rows = eligible.map(p => ({
    ref: p.ref,
    watched_seconds: Number(p.watched_seconds),
    share_bp: Math.floor((Number(p.watched_seconds) * BP) / totalSeconds),
    amount_minor: Math.floor((pool * Number(p.watched_seconds)) / totalSeconds)
  }));
  let remainder = pool - rows.reduce((sum, r) => sum + r.amount_minor, 0);
  // Largest watch time first takes the remainder, deterministically.
  const ordered = [...rows].sort((a, b) => b.watched_seconds - a.watched_seconds || String(a.ref).localeCompare(String(b.ref)));
  let i = 0;
  while (remainder > 0) {
    ordered[i % ordered.length].amount_minor += 1;
    remainder -= 1;
    i += 1;
  }
  return { allocated: rows, undistributed_minor: 0, total_seconds: totalSeconds };
}

/**
 * A payout is only PAID when there is a date, a reference and evidence.
 * This is the last gate before "the creator was paid" may be claimed.
 */
export function markPaid(payout, evidence) {
  const problems = [];
  if (!evidence || typeof evidence !== 'object') problems.push('payment evidence is required');
  if (!evidence?.payment_date) problems.push('payment date is required');
  if (!evidence?.processor_reference) problems.push('processor reference is required');
  if (!evidence?.processor) problems.push('processor name is required');
  if (Number(evidence?.amount_minor) !== Number(payout.net_payable_minor)) {
    problems.push('evidence amount does not equal net payable');
  }
  if (problems.length) return { ...payout, payout_state: 'PENDING_EVIDENCE', problems };
  return {
    ...payout,
    payout_state: 'PAID',
    payment_date: evidence.payment_date,
    payment_processor: evidence.processor,
    payment_reference: evidence.processor_reference,
    payment_evidence: evidence,
    problems: []
  };
}

export function formatMinor(amountMinor, currency = 'USD', locale = 'en-US') {
  return new Intl.NumberFormat(locale, { style: 'currency', currency })
    .format(Number(amountMinor || 0) / 100);
}

export function formatBp(bp) {
  return `${(Number(bp || 0) / 100).toFixed(2)}%`;
}
