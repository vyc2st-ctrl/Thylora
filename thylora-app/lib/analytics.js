// THYLORA APP · Chairman analytics
// Workroom: WR-THYAPP-001
//
// The three Chairman readouts that are arithmetic rather than presentation:
// store money-distance, global arrivals, and the prompt coverage ledger.
// They live here so the numbers on screen are the numbers under test.
//
// Money conventions follow the THYLORA ledger: integer minor units only, and
// shares expressed in basis points. No floating-point money.

export const BP = 10000;

/* ------------------------------------------------------------ money-distance */
// "Money-distance" is how far revenue travelled to reach THYLORA: each order is
// matched to the arrival point it came from and banded by great-circle distance
// from a declared origin.
//
// The origin is NOT invented. If the backend has not declared one, the view
// reports ORIGIN_NOT_DECLARED and still totals the money per region — money
// without distance, labelled as such — rather than silently assuming a
// headquarters and drawing distances that mean nothing.

export const DISTANCE_BANDS = Object.freeze([
  { code: 'LOCAL', label: 'Local', maxKm: 500 },
  { code: 'REGIONAL', label: 'Regional', maxKm: 2000 },
  { code: 'CONTINENTAL', label: 'Continental', maxKm: 8000 },
  { code: 'GLOBAL', label: 'Global', maxKm: Infinity }
]);

const EARTH_RADIUS_KM = 6371;
const toRadians = degrees => (degrees * Math.PI) / 180;

/**
 * Read one coordinate component, or null if it is unusable.
 *
 * Number(null), Number('') and Number(false) are all 0, which is a REAL
 * coordinate on the equator. Coercing first would therefore turn a row with a
 * missing latitude into a point in the Gulf of Guinea and plot it on the map as
 * though it were measured. Reject the empty cases before coercing, and reject
 * anything outside the valid range.
 */
function coordinate(value, limit) {
  if (value === null || value === undefined || value === '' || typeof value === 'boolean') return null;
  const n = Number(value);
  return Number.isFinite(n) && Math.abs(n) <= limit ? n : null;
}

/** True when a row carries a usable latitude AND longitude. */
export function isCoordinate(point) {
  return coordinate(point?.latitude, 90) !== null && coordinate(point?.longitude, 180) !== null;
}

/** Great-circle distance in whole kilometres, or null if either point is unusable. */
export function haversineKm(from, to) {
  if (!isCoordinate(from) || !isCoordinate(to)) return null;
  const lat1 = toRadians(coordinate(from.latitude, 90));
  const lat2 = toRadians(coordinate(to.latitude, 90));
  const deltaLat = lat2 - lat1;
  const deltaLon = toRadians(coordinate(to.longitude, 180) - coordinate(from.longitude, 180));
  const a = Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) ** 2;
  return Math.round(2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(a))));
}

export function bandFor(distanceKm) {
  if (!Number.isFinite(distanceKm)) return null;
  return DISTANCE_BANDS.find(band => distanceKm < band.maxKm) ?? DISTANCE_BANDS.at(-1);
}

function minor(value) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.round(n) : 0;
}

/**
 * Build the Chairman money-distance view.
 *
 * @param orders   rows with { order_code, amount_minor, currency, order_state, region_label }
 * @param arrivals rows with { region_label, latitude, longitude, arrivals }
 * @param origin   declared origin { latitude, longitude, label } or null
 */
export function moneyDistanceView(orders = [], arrivals = [], origin = null) {
  const settled = orders.filter(o => String(o?.order_state ?? '').toUpperCase() !== 'REFUNDED');
  const byRegion = new Map();
  // Only points with usable coordinates are eligible to supply a distance.
  const points = new Map(
    arrivals.filter(a => a?.region_label && isCoordinate(a)).map(a => [String(a.region_label), a])
  );

  let unmatchedRegions = 0;
  let currency = null;
  let mixedCurrency = false;

  for (const order of settled) {
    const region = order?.region_label ? String(order.region_label) : null;
    const key = region ?? 'REGION_NOT_RECORDED';
    if (order?.currency) {
      if (currency && currency !== order.currency) mixedCurrency = true;
      currency ??= order.currency;
    }
    if (!byRegion.has(key)) {
      const point = region ? points.get(region) ?? null : null;
      if (region && !point) unmatchedRegions += 1;
      byRegion.set(key, {
        region_label: key,
        orders: 0,
        revenue_minor: 0,
        distance_km: origin && point ? haversineKm(origin, point) : null,
        band: null
      });
    }
    const bucket = byRegion.get(key);
    bucket.orders += 1;
    bucket.revenue_minor += minor(order?.amount_minor);
  }

  const regions = [...byRegion.values()].map(r => ({
    ...r,
    band: r.distance_km === null ? null : bandFor(r.distance_km).code
  })).sort((a, b) => b.revenue_minor - a.revenue_minor);

  const totalRevenueMinor = regions.reduce((sum, r) => sum + r.revenue_minor, 0);

  // Band totals only exist when distances could be computed.
  const bands = DISTANCE_BANDS.map(band => {
    const inBand = regions.filter(r => r.band === band.code);
    return {
      code: band.code,
      label: band.label,
      regions: inBand.length,
      orders: inBand.reduce((s, r) => s + r.orders, 0),
      revenue_minor: inBand.reduce((s, r) => s + r.revenue_minor, 0),
      revenue_share_bp: totalRevenueMinor > 0
        ? Math.round((inBand.reduce((s, r) => s + r.revenue_minor, 0) * BP) / totalRevenueMinor)
        : 0
    };
  });

  const measured = regions.filter(r => r.distance_km !== null);
  const measuredRevenueMinor = measured.reduce((sum, r) => sum + r.revenue_minor, 0);
  // Revenue-weighted, so one large order from far away is not averaged away by
  // many small nearby ones. Null when the measured regions carry no money at
  // all — dividing by zero revenue would otherwise report Infinity km.
  const weightedDistanceKm = measuredRevenueMinor > 0
    ? Math.round(
        measured.reduce((sum, r) => sum + r.distance_km * r.revenue_minor, 0) / measuredRevenueMinor
      )
    : null;

  return {
    state: !origin ? 'ORIGIN_NOT_DECLARED'
         : measured.length === 0 ? 'NO_MEASURABLE_DISTANCE'
         : 'MEASURED',
    origin_label: origin?.label ?? null,
    currency: mixedCurrency ? 'MIXED' : currency,
    orders: settled.length,
    total_revenue_minor: totalRevenueMinor,
    revenue_weighted_distance_km: weightedDistanceKm,
    regions,
    bands,
    unmatched_regions: unmatchedRegions,
    notes: [
      !origin ? 'No THYLORA origin is declared on the backend, so distance is not computed. Revenue by region is still exact.' : null,
      unmatchedRegions > 0 ? `${unmatchedRegions} order region${unmatchedRegions === 1 ? '' : 's'} had no matching arrival point, so ${unmatchedRegions === 1 ? 'it is' : 'they are'} counted in revenue but not in distance.` : null,
      mixedCurrency ? 'Orders span more than one currency; totals are not converted.' : null
    ].filter(Boolean)
  };
}

/* -------------------------------------------------------- global arrivals */
/**
 * Summarise where the world arrived from.
 * @param rows { region_label, country_code, arrivals, sessions }
 */
export function arrivalAnalytics(rows = []) {
  const clean = rows.filter(r => r && typeof r === 'object');
  const arrivals = clean.reduce((s, r) => s + minor(r.arrivals), 0);
  const sessions = clean.reduce((s, r) => s + minor(r.sessions), 0);
  const countries = new Set(clean.map(r => r.country_code).filter(Boolean));

  const regions = [...clean.reduce((map, r) => {
    const key = r.region_label ? String(r.region_label) : 'REGION_NOT_RECORDED';
    const bucket = map.get(key) ?? { region_label: key, arrivals: 0, sessions: 0 };
    bucket.arrivals += minor(r.arrivals);
    bucket.sessions += minor(r.sessions);
    map.set(key, bucket);
    return map;
  }, new Map()).values()]
    .map(r => ({ ...r, share_bp: arrivals > 0 ? Math.round((r.arrivals * BP) / arrivals) : 0 }))
    .sort((a, b) => b.arrivals - a.arrivals);

  return {
    state: clean.length === 0 ? 'NO_ARRIVALS_RECORDED' : 'MEASURED',
    arrivals,
    sessions,
    countries: countries.size,
    regions,
    top_region: regions[0] ?? null
  };
}

/* --------------------------------------------------- prompt coverage ledger */
// A prompt is "covered" when the work it asked for exists, and "delivered" when
// that work reached the Chairman. They are separate states on purpose: covered
// but undelivered is the gap this ledger is built to expose, so it is reported
// as its own number rather than folded into a single percentage.

export const COVERAGE_STATES = Object.freeze(['COVERED', 'PARTIAL', 'UNCOVERED']);

export function promptCoverageLedger(rows = []) {
  const clean = rows.filter(r => r && typeof r === 'object');
  const state = row => String(row.coverage_state ?? '').toUpperCase();
  const delivered = row => String(row.delivered_state ?? '').toUpperCase() === 'DELIVERED';

  const counts = {
    total: clean.length,
    covered: clean.filter(r => state(r) === 'COVERED').length,
    partial: clean.filter(r => state(r) === 'PARTIAL').length,
    uncovered: clean.filter(r => state(r) === 'UNCOVERED').length,
    unclassified: clean.filter(r => !COVERAGE_STATES.includes(state(r))).length
  };

  const deliveredCount = clean.filter(delivered).length;
  // Covered work that never reached the Chairman.
  const coveredNotDelivered = clean.filter(r => state(r) === 'COVERED' && !delivered(r)).length;

  // A partial counts as half when measuring coverage, so partial work is
  // neither dismissed nor reported as finished.
  const weighted = counts.covered * 2 + counts.partial;
  const coverageBp = counts.total > 0 ? Math.round((weighted * BP) / (counts.total * 2)) : 0;
  const deliveryBp = counts.total > 0 ? Math.round((deliveredCount * BP) / counts.total) : 0;

  const outstanding = clean
    .filter(r => state(r) !== 'COVERED' || !delivered(r))
    .map(r => ({
      prompt_code: r.prompt_code ?? null,
      prompt_text: r.prompt_text ?? '',
      coverage_state: state(r) || 'UNCLASSIFIED',
      delivered: delivered(r),
      department_code: r.department_code ?? null
    }));

  return {
    state: counts.total === 0 ? 'NO_PROMPTS_RECORDED' : 'MEASURED',
    ...counts,
    delivered: deliveredCount,
    covered_not_delivered: coveredNotDelivered,
    coverage_bp: coverageBp,
    delivery_bp: deliveryBp,
    complete: counts.total > 0 && counts.covered === counts.total && deliveredCount === counts.total,
    outstanding
  };
}

/* -------------------------------------------------------------- formatting */
export function formatMinor(amountMinor, currency = 'USD') {
  const amount = minor(amountMinor) / 100;
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD' }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency || ''}`.trim();
  }
}

export function formatBp(bp) {
  return `${(minor(bp) / 100).toFixed(bp % 100 === 0 ? 0 : 1)}%`;
}

export function formatKm(km) {
  return Number.isFinite(km) ? `${Number(km).toLocaleString('en-US')} km` : 'distance not measured';
}
