// THYLORA Dashboard R6 · Store Money-Distance
// Canonical backend record: THY-IDEA-DASHBOARD-SCREEN-ARCHITECTURE-001
//
// Money-distance is the number of steps still standing between a THYLORA store
// and money actually arriving. It is not a forecast and it is not a percentage
// of effort. It counts gates that are closed.
//
// The panel exists because "the store is nearly ready" is a sentence that can be
// true for a year. A distance of 3 names which three gates, and each gate is
// either evidenced by a backend record or it is not satisfied. A gate is never
// satisfied because it feels done.
//
// Distance 0 means the last gate is FUNDS_SETTLED — money has landed and there
// is a record of it landing. Nothing else is allowed to read as zero.

export const GATE_STATES = Object.freeze({
  SATISFIED: 'SATISFIED',     // evidenced by a backend record
  CLAIMED: 'CLAIMED',         // asserted, no record produced — does NOT close the gate
  OPEN: 'OPEN',               // not done
  BLOCKED: 'BLOCKED'          // cannot be done until something external clears
});

/**
 * The gates, in the order money has to pass through them. Each names the
 * evidence that closes it, so a closed gate can always be audited back to a row.
 */
export const MONEY_GATES = Object.freeze([
  { code: 'PRODUCT_EXISTS',  label: 'Product record exists',        evidence: 'products' },
  { code: 'PRICE_SET',       label: 'Price is set',                 evidence: 'products.price' },
  { code: 'PASSPORT_ISSUED', label: 'Digital product passport',     evidence: 'digital_product_passports' },
  { code: 'STOREFRONT_LIVE', label: 'Storefront publicly reachable', evidence: 'storefront' },
  { code: 'PAYMENT_RAIL',    label: 'Payment rail connected',       evidence: 'payment_providers' },
  { code: 'CHECKOUT_PROVEN', label: 'A checkout has completed',     evidence: 'orders' },
  { code: 'ORDER_RECEIVED',  label: 'A real order received',        evidence: 'orders' },
  { code: 'FUNDS_SETTLED',   label: 'Funds settled to THYLORA',     evidence: 'payments' }
]);

/**
 * Score one store.
 *
 * `readings` maps a gate code to what the backend actually returned:
 *   { state, evidence_id, note }
 * A gate with no reading is OPEN — absence of evidence is never treated as
 * quiet success. A gate marked CLAIMED counts as open for distance, and is
 * reported separately so the gap between what is said and what is evidenced
 * stays visible.
 */
export function measureStore({ store_code, label, readings = {}, currency = 'USD' } = {}) {
  const gates = MONEY_GATES.map(gate => {
    const reading = readings[gate.code] || {};
    const state = reading.state || GATE_STATES.OPEN;
    return {
      ...gate,
      state,
      evidence_id: reading.evidence_id ?? null,
      note: reading.note ?? null,
      closed: state === GATE_STATES.SATISFIED && !!reading.evidence_id
    };
  });

  const open = gates.filter(g => !g.closed);
  const claimedNotProven = gates.filter(g => g.state === GATE_STATES.CLAIMED && !g.closed);
  const blocked = gates.filter(g => g.state === GATE_STATES.BLOCKED);
  const nextGate = open[0] || null;

  return {
    store_code: store_code || 'STORE',
    label: label || store_code || 'Store',
    currency,
    distance: open.length,
    money_arriving: open.length === 0,
    gates,
    next_gate: nextGate,
    open_gates: open.map(g => g.code),
    blocked_gates: blocked.map(g => g.code),
    unproven_claims: claimedNotProven.map(g => g.code),
    statement: open.length === 0
      ? 'Money-distance 0 — funds have settled and the settlement is evidenced.'
      : `Money-distance ${open.length} — next gate: ${nextGate.label}.`
  };
}

/** Roll several stores into the panel header. */
export function portfolioDistance(stores) {
  const list = stores || [];
  if (!list.length) {
    return {
      stores: 0, nearest: null, arriving: 0, total_open_gates: 0,
      statement: 'No store records returned by the backend. Money-distance cannot be measured from nothing.'
    };
  }
  const sorted = [...list].sort((a, b) => a.distance - b.distance);
  const arriving = list.filter(s => s.money_arriving).length;
  return {
    stores: list.length,
    nearest: sorted[0],
    arriving,
    total_open_gates: list.reduce((n, s) => n + s.distance, 0),
    unproven_claims: list.reduce((n, s) => n + s.unproven_claims.length, 0),
    statement: arriving > 0
      ? `${arriving} of ${list.length} store(s) have money arriving.`
      : `Nearest store is ${sorted[0].distance} gate(s) from money: ${sorted[0].label}.`
  };
}

/**
 * Turn backend rows into gate readings, honestly.
 *
 * Anything this function cannot see, it leaves OPEN. It never infers that a
 * payment rail exists because a product does.
 */
export function readingsFromRows({ products = [], orders = [], payments = [], passports = [], storefront = null, providers = [] } = {}) {
  const readings = {};
  const satisfy = (code, evidence_id, note = null) => {
    readings[code] = { state: GATE_STATES.SATISFIED, evidence_id, note };
  };

  const product = products[0];
  if (product) satisfy('PRODUCT_EXISTS', product.id || product.product_code || 'product');

  const priced = products.find(p => Number(p.price ?? p.price_minor ?? p.amount) > 0);
  if (priced) satisfy('PRICE_SET', priced.id || priced.product_code || 'product');

  const passport = passports[0];
  if (passport) satisfy('PASSPORT_ISSUED', passport.id || passport.passport_code || 'passport');

  if (storefront?.reachable && storefront?.url) satisfy('STOREFRONT_LIVE', storefront.url);
  else if (storefront?.url) readings.STOREFRONT_LIVE = { state: GATE_STATES.CLAIMED, evidence_id: null, note: 'Storefront URL present but reachability not proven.' };

  const provider = providers.find(p => p.connected || p.status === 'CONNECTED' || p.state === 'CONNECTED');
  if (provider) satisfy('PAYMENT_RAIL', provider.id || provider.provider_code || 'provider');

  const anyOrder = orders[0];
  if (anyOrder) {
    satisfy('CHECKOUT_PROVEN', anyOrder.id || anyOrder.order_code || 'order');
    const real = orders.find(o => !o.is_test && o.status !== 'TEST');
    if (real) satisfy('ORDER_RECEIVED', real.id || real.order_code || 'order');
  }

  const settled = payments.find(p => ['SETTLED', 'PAID', 'SUCCEEDED', 'CAPTURED'].includes(String(p.status || p.state || '').toUpperCase()));
  if (settled) satisfy('FUNDS_SETTLED', settled.id || settled.payment_code || 'payment');

  return readings;
}
