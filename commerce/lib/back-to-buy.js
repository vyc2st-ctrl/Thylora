// THYLORA · Back to Buy · campaign ledger math
// Workroom: WR-SPINE-624 · idea THY-IDEA-BACK-TO-BUY-001 · equation MATH-BACK-TO-BUY-624
//
// A family (or person, or campaign) is supported by people buying real products.
// Every sale produces one receipt that shows the whole rule, term by term:
//
//   N = G - T - F - P - R        net distributable
//   B = N x r                    support amount owed to the recipient
//
//   G  gross sale        what the buyer paid, tax included            (integer cents)
//   T  tax               sales tax collected and owed to a government (integer cents)
//   F  fees              payment processor + platform transaction fees (integer cents)
//   P  product cost      making + fulfilling the product (print, blank, shipping, file delivery)
//   R  refund reserve    held back until the refund window closes, then released
//   N  net distributable what is left after every real cost and the reserve
//   r  support rate      share of N owed to the recipient, basis points (10000 bp = 100%)
//   B  support amount    what the recipient is owed from this sale
//
// Money is integer minor units. There is no floating-point money in this file.
// Rounding favours the recipient: B rounds up, and B never exceeds N.

export const BP = 10000;

export const PRIVACY_STATES = Object.freeze(['PRIVATE_LINK_ONLY', 'PUBLIC_FIRST_NAME', 'PUBLIC_FAMILY_NAME', 'ANONYMOUS_PUBLIC']);
export const PAYOUT_STATES = Object.freeze([
  'ACCRUING',              // sales are landing; nothing is payable yet
  'HELD_REFUND_WINDOW',    // sale is inside its refund window
  'HELD_IDENTITY',         // recipient identity / payout account not verified
  'HELD_LEGAL',            // payout rail or campaign terms not cleared
  'HELD_FRAUD_REVIEW',     // a fraud rule fired
  'PAYABLE',
  'PAID'
]);

function asInt(value, field) {
  const n = Number(value ?? 0);
  if (!Number.isInteger(n)) throw new TypeError(`${field} must be an integer number of cents, received ${value}`);
  if (n < 0) throw new RangeError(`${field} cannot be negative`);
  return n;
}

function asRate(bp) {
  const n = Number(bp);
  if (!Number.isInteger(n) || n < 0 || n > BP) throw new RangeError(`support rate must be an integer 0..${BP} basis points, received ${bp}`);
  return n;
}

/**
 * Validate a campaign before any sale can attach to it. Returns every problem at once.
 */
export function validateCampaign(c) {
  const blockers = [];
  const need = (cond, code, detail) => { if (!cond) blockers.push({ code, detail }); };
  need(/^BTB-\d{4}-[A-Z2-7]{6}$/.test(c?.campaign_id ?? ''), 'CAMPAIGN_ID_FORMAT', 'campaign_id must look like BTB-2026-ABCDEF (base32 suffix)');
  need(typeof c?.need_statement === 'string' && c.need_statement.trim().length >= 20, 'NEED_MISSING', 'state the need in at least one plain sentence');
  need(c?.consent?.recipient_consented === true, 'CONSENT_MISSING', 'recipient (or legal representative) consent must be recorded');
  need(!c?.recipient_is_minor || c?.consent?.guardian_consented === true, 'GUARDIAN_REQUIRED', 'a minor recipient needs recorded guardian consent');
  need(PRIVACY_STATES.includes(c?.privacy_state), 'PRIVACY_STATE', `privacy_state must be one of ${PRIVACY_STATES.join(', ')}`);
  need(c?.medical_details_collected !== true, 'MEDICAL_DETAIL_REFUSED', 'no medical detail is collected or shown for a campaign');
  need(Array.isArray(c?.product_ids) && c.product_ids.length > 0, 'NO_PRODUCT', 'a campaign sells at least one real product');
  try { asRate(c?.support_rate_bp); } catch (e) { blockers.push({ code: 'RATE_INVALID', detail: e.message }); }
  need(Number.isInteger(c?.refund_window_days) && c.refund_window_days >= 0, 'REFUND_WINDOW', 'refund_window_days must be a whole number');
  return { valid: blockers.length === 0, blockers };
}

/**
 * Settle one sale. Returns the receipt: every term, the rule in words, and the payout state.
 * sale: { gross, tax, fees, product_cost, refund_reserve, support_rate_bp }
 */
export function settleSale(sale) {
  const G = asInt(sale.gross, 'gross (G)');
  const T = asInt(sale.tax, 'tax (T)');
  const F = asInt(sale.fees, 'fees (F)');
  const P = asInt(sale.product_cost, 'product cost (P)');
  const R = asInt(sale.refund_reserve, 'refund reserve (R)');
  const r = asRate(sale.support_rate_bp);
  const deductions = T + F + P + R;
  if (deductions > G) {
    return { ok: false, code: 'DEDUCTIONS_EXCEED_GROSS', G, T, F, P, R, N: 0, B: 0,
      detail: `T + F + P + R = ${deductions} is more than G = ${G}; the product is priced below its cost and cannot carry a campaign` };
  }
  const N = G - deductions;
  const B = Math.min(N, Math.ceil((N * r) / BP));
  const house = N - B;
  if (T + F + P + R + B + house !== G) throw new Error('reconciliation failed: terms do not sum to G');
  return {
    ok: true, G, T, F, P, R, N, r_bp: r, B, house,
    rule: `N = G - T - F - P - R = ${G} - ${T} - ${F} - ${P} - ${R} = ${N}; B = N x ${r / 100}% = ${B} (rounded up for the recipient); THYLORA keeps N - B = ${house}`
  };
}

/**
 * Reserve release. When the refund window closes with no refund, R becomes distributable
 * under the same rate, so the recipient's total equals what it would have been with no reserve.
 */
export function releaseReserve(settled) {
  if (!settled?.ok) throw new Error('cannot release the reserve of an unsettled sale');
  const full = settleSale({ gross: settled.G, tax: settled.T, fees: settled.F, product_cost: settled.P, refund_reserve: 0, support_rate_bp: settled.r_bp });
  return { B_release: full.B - settled.B, house_release: full.house - settled.house, B_total: full.B, house_total: full.house };
}

/**
 * Refund effect. Rule, stated once and applied everywhere:
 *  - before payout: the sale's B is reversed (the recipient is simply never owed it);
 *  - after payout: the recipient keeps what was paid. The refund is covered first from the
 *    sale's reserve R, then from THYLORA's share. A family is never clawed back.
 * Fees already charged by the processor on a refunded sale are a THYLORA loss, shown as such.
 */
export function refundEffect(settled, { refund_amount, paid_out }) {
  const amt = asInt(refund_amount, 'refund_amount');
  if (!settled?.ok) throw new Error('cannot refund an unsettled sale');
  if (amt > settled.G) throw new RangeError('refund cannot exceed the gross sale');
  const fraction = amt / settled.G;
  if (!paid_out) {
    const B_reversed = Math.min(settled.B, Math.ceil(settled.B * fraction));
    return { recipient_clawback: 0, B_reversed, from_reserve: 0, from_house: 0, rule: 'refunded before payout: support not yet paid is reversed' };
  }
  const from_reserve = Math.min(settled.R, amt);
  const from_house = amt - from_reserve;
  return { recipient_clawback: 0, B_reversed: 0, from_reserve, from_house, rule: 'refunded after payout: recipient keeps what was paid; reserve first, then THYLORA share' };
}

/**
 * Payout state for a recipient's accrued balance. Returns every hold that applies.
 */
export function payoutState({ balance, now_ms, latest_sale_ms, refund_window_days, identity_verified, legal_cleared, fraud_flags = [] }) {
  const holds = [];
  if (!legal_cleared) holds.push('HELD_LEGAL');
  if (!identity_verified) holds.push('HELD_IDENTITY');
  if (fraud_flags.length) holds.push('HELD_FRAUD_REVIEW');
  const windowEnds = latest_sale_ms + refund_window_days * 86400000;
  if (now_ms < windowEnds) holds.push('HELD_REFUND_WINDOW');
  if (asInt(balance, 'balance') === 0) return { state: 'ACCRUING', holds };
  return { state: holds.length ? holds[0] : 'PAYABLE', holds, window_ends_ms: windowEnds };
}

/**
 * Fraud rules. Deterministic, explainable, each returns a code and the number that tripped it.
 */
export function fraudFlags({ sales = [], recipient_payment_fingerprints = [], chargebacks = 0, window_hours = 24, velocity_limit = 25, chargeback_limit_bp = 100 }) {
  const flags = [];
  const self = sales.filter(s => recipient_payment_fingerprints.includes(s.payment_fingerprint));
  if (self.length) flags.push({ code: 'SELF_PURCHASE', count: self.length, detail: 'recipient-linked payment method bought into their own campaign' });
  if (sales.length) {
    const latest = Math.max(...sales.map(s => s.at_ms));
    const recent = sales.filter(s => latest - s.at_ms <= window_hours * 3600000).length;
    if (recent > velocity_limit) flags.push({ code: 'VELOCITY', count: recent, detail: `${recent} sales in ${window_hours} h exceeds ${velocity_limit}` });
    const cb_bp = Math.round((chargebacks * BP) / sales.length);
    if (cb_bp > chargeback_limit_bp) flags.push({ code: 'CHARGEBACK_RATIO', count: chargebacks, detail: `chargebacks ${cb_bp / 100}% exceed ${chargeback_limit_bp / 100}%` });
  }
  return flags;
}

/**
 * The public line every campaign page and receipt must show. No "a portion goes to".
 */
export function campaignRuleText({ support_rate_bp, refund_window_days }) {
  const pct = asRate(support_rate_bp) / 100;
  return `For every sale: we subtract sales tax, payment fees, the cost of making and shipping the product, and a refund reserve. ` +
    `${pct}% of what remains is owed to the recipient. The reserve is released under the same rule after ${refund_window_days} days if there is no refund.`;
}
