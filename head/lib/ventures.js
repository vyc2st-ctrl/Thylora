// HEAD · money math for the story economy, make-to-order, and restaurant partners.
// Integer minor units (cents) only. Reuses RAE Link allocation — no second ledger.
import { allocate, BP } from '../../rae-link/lib/ledger.js';

/**
 * One story, many products. Each line: units × price, minus per-unit cost and fees,
 * then split by the declared policy. The family's share is computed on every line.
 * Inputs are ASSUMPTIONS until real sales replace them; the result says so.
 */
export function storyEconomy(lines, shares) {
  const total = Object.values(shares).reduce((a, b) => a + b, 0);
  if (total !== BP) throw new Error(`shares must total ${BP} bp, got ${total}`);
  const rows = lines.map(l => {
    const gross = l.units * l.price_minor;
    const cost = l.units * (l.unit_cost_minor ?? 0);
    const fees = Math.round((gross * (l.fee_bp ?? 0)) / BP);
    const base = Math.max(0, gross - cost - fees);
    const split = Object.fromEntries(allocate(base, shares).map(e => [e.party_kind, e.amount_minor]));
    return { product: l.product, gross, cost, fees, base, split };
  });
  const totals = rows.reduce((acc, r) => {
    for (const k of ['gross', 'cost', 'fees', 'base']) acc[k] = (acc[k] ?? 0) + r[k];
    for (const [p, v] of Object.entries(r.split)) acc.split[p] = (acc.split[p] ?? 0) + v;
    return acc;
  }, { split: {} });
  return { basis: 'ASSUMPTION', rows, totals };
}

/** Units needed before a run pays for its fixed cost: ceil(F ÷ (p − c − fee)). */
export function breakEvenUnits({ fixed_minor, price_minor, unit_cost_minor, fee_bp = 0 }) {
  const margin = price_minor - unit_cost_minor - Math.round((price_minor * fee_bp) / BP);
  if (margin <= 0) return { possible: false, margin_minor: margin };
  return { possible: true, margin_minor: margin, units: Math.ceil(fixed_minor / margin) };
}

/** Nothing is made until it is paid for and the maker's minimum is met. */
export function productionRelease({ paid_preorders, maker_minimum, cash_minor, run_cost_minor }) {
  const blockers = [];
  if (paid_preorders < maker_minimum) blockers.push(`NEED_${maker_minimum - paid_preorders}_MORE_PAID_PREORDERS`);
  if (cash_minor < run_cost_minor) blockers.push('CASH_BELOW_RUN_COST');
  return { release: blockers.length === 0, blockers };
}

/**
 * Restaurant turnaround partner. THYLORA earns only on improvement:
 * fee = rate × max(0, revenue_after − baseline). A restaurant that does not improve pays nothing.
 */
export function turnaroundFee({ baseline_minor, after_minor, rate_bp }) {
  const lift = Math.max(0, after_minor - baseline_minor);
  return { lift_minor: lift, fee_minor: Math.round((lift * rate_bp) / BP), restaurant_keeps_minor: after_minor - Math.round((lift * rate_bp) / BP) };
}

/** Tip on arrival + tip on service. Arrival tip is paid at the door; service tip follows the meal. */
export function tipPlan({ bill_minor, arrival_bp, service_bp }) {
  const arrival = Math.round((bill_minor * arrival_bp) / BP);
  const service = Math.round((bill_minor * service_bp) / BP);
  return { arrival_minor: arrival, service_minor: service, total_minor: arrival + service, total_bp: arrival_bp + service_bp };
}
