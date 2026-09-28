// BACK TO BUY — support a person or family through purchases of useful products.
//
//   N = G − T − F − P − R          net distributable
//   B = N × s                      recipient benefit
//
// All money is integer minor units (cents). s is integer basis points (1 bp = 0.01%),
// so B = floor(N × s_bp / 10000) and the sub-cent remainder is reported, never hidden.
// Class: FORMAL SYSTEM LAW (an accounting identity plus a disclosed contract term).

export const CAUSES = Object.freeze({
  RENT: { label: 'Rent support', review: 'STANDARD' },
  FUNERAL: { label: 'Funeral support', review: 'STANDARD' },
  EMERGENCY: { label: 'Emergency support', review: 'STANDARD' },
  EDUCATION: { label: 'Education support', review: 'STANDARD' },
  HOUSEHOLD_REPAIR: { label: 'Household repair', review: 'STANDARD' },
  CREATOR: { label: 'Creator support', review: 'STANDARD' },
  // Medical/dental: allowed only where legally appropriate. Payment goes to the provider or
  // the person, never a health claim; no diagnosis or medical detail is collected or shown.
  MEDICAL_DENTAL: { label: 'Medical / dental support', review: 'LEGAL_REVIEW_REQUIRED' },
});

export const RESERVE_POLICY = Object.freeze({ min_bp: 0, max_bp: 2000 }); // refund reserve 0–20% of G

function int(name, v) {
  if (!Number.isInteger(v)) throw new Error(`NOT_INTEGER_MINOR_UNITS:${name}`);
  if (v < 0) throw new Error(`NEGATIVE:${name}`);
  return v;
}

// Validates a campaign before any sale may carry it. Returns every problem at once.
export function campaignGate(c) {
  const blockers = [];
  const add = (code, detail) => blockers.push({ code, detail });
  if (!c || typeof c !== 'object') return { open: false, blockers: [{ code: 'NO_CAMPAIGN', detail: 'No campaign supplied.' }] };
  if (!CAUSES[c.cause]) add('UNKNOWN_CAUSE', `Cause must be one of ${Object.keys(CAUSES).join(', ')}.`);
  if (!Number.isInteger(c.support_bp) || c.support_bp < 1 || c.support_bp > 10000) add('SUPPORT_SHARE_INVALID', 'Support share must be 1–10000 basis points.');
  if (!c.disclosure_text || !String(c.disclosure_text).includes('%')) add('SUPPORT_SHARE_NOT_DISCLOSED', 'The public page must state the support percentage.');
  if (!c.payout_math_published) add('PAYOUT_MATH_NOT_PUBLISHED', 'N = G − T − F − P − R and B = N × s must be shown to buyers.');
  if (!c.recipient_verified) add('RECIPIENT_NOT_VERIFIED', 'Recipient identity and payout destination must be verified before sales.');
  if (c.recipient_is_named_family) {
    if (!c.consent?.documented) add('NAMED_FAMILY_CONSENT_MISSING', 'A named family cannot be publicly commercialized without documented consent.');
    if (c.consent?.documented && !c.consent?.covers_public_name) add('CONSENT_DOES_NOT_COVER_PUBLIC_NAME', 'Consent must explicitly cover public use of the family name.');
    if (c.consent?.withdrawn) add('CONSENT_WITHDRAWN', 'Consent withdrawn: campaign closes to new sales; accrued benefit still pays.');
  }
  if (c.includes_minor_identity && !c.guardian_consent) add('GUARDIAN_CONSENT_MISSING', 'A minor may not be identified without guardian consent.');
  if (CAUSES[c.cause]?.review === 'LEGAL_REVIEW_REQUIRED' && !c.legal_review_ref) add('LEGAL_REVIEW_REQUIRED', 'Medical/dental support needs a recorded legal review for the jurisdiction.');
  if (c.collects_medical_detail) add('MEDICAL_DETAIL_PROHIBITED', 'No diagnosis or medical detail may be collected or displayed.');
  const r = c.reserve_bp ?? 0;
  if (!Number.isInteger(r) || r < RESERVE_POLICY.min_bp || r > RESERVE_POLICY.max_bp) add('RESERVE_OUT_OF_POLICY', 'Refund reserve must be 0–2000 bp of gross.');
  return { open: blockers.length === 0, blockers };
}

// One sale. G, T, F, P in cents; reserve is either explicit R (cents) or reserve_bp of G.
export function settleSale({ G, T, F, P, R, reserve_bp }, support_bp) {
  int('G', G); int('T', T); int('F', F); int('P', P);
  const Rv = R !== undefined ? int('R', R) : Math.floor((G * int('reserve_bp', reserve_bp ?? 0)) / 10000);
  if (!Number.isInteger(support_bp) || support_bp < 0 || support_bp > 10000) throw new Error('SUPPORT_BP_INVALID');
  const raw = G - T - F - Rv - P;
  const N = Math.max(0, raw);
  const numerator = N * support_bp;
  const B = Math.floor(numerator / 10000);
  const remainder_bp_cents = numerator % 10000; // fraction of a cent, in 1/10000 cent units
  const house = N - B;
  if (B + house !== N) throw new Error('RECONCILIATION_FAILED');
  return {
    G, T, F, P, R: Rv, N, B, house, support_bp,
    shortfall: raw < 0 ? -raw : 0,
    state: raw < 0 ? 'NO_DISTRIBUTABLE_NET' : 'DISTRIBUTABLE',
    sub_cent_remainder: remainder_bp_cents,
  };
}

// Many sales: the benefit is computed on the summed N, so rounding is taken once, not per sale.
// Per-sale floors can only ever under-pay the recipient; summing first removes that bias.
export function settleCampaign(sales, support_bp) {
  const rows = sales.map((s) => settleSale(s, support_bp));
  const sum = (k) => rows.reduce((a, r) => a + r[k], 0);
  const N = sum('N');
  const B = Math.floor((N * support_bp) / 10000);
  const perSaleB = sum('B');
  return {
    count: rows.length, G: sum('G'), T: sum('T'), F: sum('F'), P: sum('P'), R: sum('R'), N, B,
    house: N - B, per_sale_floor_total: perSaleB, recipient_gain_vs_per_sale: B - perSaleB, rows,
  };
}

// Refunds draw from the reserve first; only the excess reduces future N. Benefit already
// paid is never clawed back from the recipient.
export function applyRefund(state, refundCents) {
  int('refund', refundCents);
  const fromReserve = Math.min(state.reserve_balance, refundCents);
  const excess = refundCents - fromReserve;
  return {
    reserve_balance: state.reserve_balance - fromReserve,
    carried_deduction: state.carried_deduction + excess,
    recipient_clawback: 0,
  };
}

// Released reserve after the refund window closes goes back through the same split.
export function releaseReserve(reserveCents, support_bp) {
  int('reserve', reserveCents);
  const B = Math.floor((reserveCents * support_bp) / 10000);
  return { released: reserveCents, B, house: reserveCents - B };
}

const usd = (c) => `$${(c / 100).toFixed(2)}`;

// The receipt line a buyer sees. Every term is printed; nothing is summarised away.
export function receipt(result, { cause, recipient_display }) {
  const pct = (result.support_bp / 100).toFixed(2).replace(/\.00$/, '');
  return [
    `BACK TO BUY · ${CAUSES[cause]?.label ?? cause} · for ${recipient_display}`,
    `Gross ${usd(result.G)} − tax ${usd(result.T)} − fees ${usd(result.F)} − making & shipping ${usd(result.P)} − refund reserve ${usd(result.R)} = net ${usd(result.N)}`,
    `Support share ${pct}% of net → ${usd(result.B)} to ${recipient_display}. THYLORA keeps ${usd(result.house)}.`,
    result.state === 'NO_DISTRIBUTABLE_NET' ? `This sale had no distributable net (short by ${usd(result.shortfall)}); ${recipient_display} receives $0.00 from it.` : null,
  ].filter(Boolean).join('\n');
}
