// THYLORA Kaelorps · Measuring — pure tape-measure math (WR-SPINE-624, Lane M)
// Truth class: PRODUCTION_PLANNED (Earth teaching tool; Kaelorps = THY-IDEA-KAELORPS-001).
//
// Every length is held as an INTEGER count of sixteenths of an inch.
// No floating point is used for any length, conversion or comparison.
//
// Unit facts (exact by definition, international yard and pound agreement, 1959):
//   1 in = 25.4 mm exactly  ->  1/16 in = 1.5875 mm exactly = 15875 units of 0.0001 mm.
//
// Millimetre rounding rule (stated once, used everywhere):
//   mm values are shown to the nearest 0.1 mm, halves rounded AWAY FROM ZERO.
//   The exact value is also returned (as an integer count of 0.0001 mm and as a
//   decimal string), so nothing is hidden by the rounding.

export const SIXTEENTHS_PER_INCH = 16;
/** 0.0001 mm units in one sixteenth of an inch (1.5875 mm). */
export const TEN_THOUSANDTHS_MM_PER_SIXTEENTH = 15875;
export const ALLOWED_DENOMINATORS = Object.freeze([1, 2, 4, 8, 16]);

export const TICK = Object.freeze({
  WHOLE: 'WHOLE',
  HALF: 'HALF',
  QUARTER: 'QUARTER',
  EIGHTH: 'EIGHTH',
  SIXTEENTH: 'SIXTEENTH'
});

/** Relative tick height by class (whole tallest, sixteenth shortest). */
export const TICK_HEIGHT = Object.freeze({
  WHOLE: 1.0, HALF: 0.75, QUARTER: 0.56, EIGHTH: 0.4, SIXTEENTH: 0.26
});

function assertSixteenths(s, name = 'sixteenths') {
  if (!Number.isSafeInteger(s)) throw new TypeError(`${name} must be a safe integer, got ${s}`);
}

function gcd(a, b) {
  a = Math.abs(a); b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a;
}

/**
 * Parse a tape reading into sixteenths of an inch.
 * Accepts: "8", "8 3/4", "3/16", "8-3/4", with optional trailing `"` or "in".
 * Rejects: negative values, decimals, denominators other than 1/2/4/8/16,
 *          numerator 0 or numerator >= denominator (write "9", not "8 4/4").
 */
export function parseReading(input) {
  if (typeof input !== 'string') throw new TypeError('reading must be a string');
  let t = input.trim().replace(/\s*(?:"|in\.?|inch(?:es)?)$/i, '').trim();
  if (t === '') throw new RangeError('empty reading');
  const m = /^(?:(\d+)(?:[\s-]+(\d+)\/(\d+))?|(\d+)\/(\d+))$/.exec(t);
  if (!m) throw new RangeError(`not a tape reading: "${input}"`);
  let whole = 0, num = 0, den = 1;
  if (m[4] !== undefined) {
    num = Number(m[4]); den = Number(m[5]);
  } else {
    whole = Number(m[1]);
    if (m[2] !== undefined) { num = Number(m[2]); den = Number(m[3]); }
  }
  const hasFraction = m[4] !== undefined || m[2] !== undefined;
  if (hasFraction) {
    if (!ALLOWED_DENOMINATORS.includes(den)) {
      throw new RangeError(`denominator ${den} is not on a 1/16 tape (use 2, 4, 8 or 16)`);
    }
    if (den === 1) throw new RangeError('denominator 1 is not a fraction; write the whole number');
    if (num === 0) throw new RangeError('numerator 0: write the whole number alone');
    if (num >= den) throw new RangeError(`numerator ${num} must be smaller than denominator ${den}`);
  }
  const s = whole * SIXTEENTHS_PER_INCH + num * (SIXTEENTHS_PER_INCH / den);
  assertSixteenths(s, 'reading');
  return s;
}

/** Split sixteenths into { whole, num, den } with the fraction fully reduced. */
export function toMixed(s) {
  assertSixteenths(s);
  if (s < 0) throw new RangeError('negative lengths are not tape readings');
  const whole = Math.floor(s / 16);
  const rem = s % 16;
  if (rem === 0) return { whole, num: 0, den: 1 };
  const g = gcd(rem, 16);
  return { whole, num: rem / g, den: 16 / g };
}

/** Format sixteenths as the simplest reduced mixed fraction, e.g. 140 -> "8 3/4". */
export function formatReading(s) {
  const { whole, num, den } = toMixed(s);
  if (num === 0) return String(whole);
  if (whole === 0) return `${num}/${den}`;
  return `${whole} ${num}/${den}`;
}

/** Which tick class a sixteenth position falls on. */
export function tickClass(s) {
  assertSixteenths(s);
  if (s < 0) throw new RangeError('tick position must be >= 0');
  if (s % 16 === 0) return TICK.WHOLE;
  if (s % 8 === 0) return TICK.HALF;
  if (s % 4 === 0) return TICK.QUARTER;
  if (s % 2 === 0) return TICK.EIGHTH;
  return TICK.SIXTEENTH;
}

/** Sixteenths in one step of each tick class: each is half the one before. */
export const SIXTEENTHS_PER_CLASS = Object.freeze({
  WHOLE: 16, HALF: 8, QUARTER: 4, EIGHTH: 2, SIXTEENTH: 1
});

// ---------- inches <-> millimetres (exact integer) ----------

/** Exact length in units of 0.0001 mm. 1/16 in = 15875 units. */
export function sixteenthsToTenThousandthsMm(s) {
  assertSixteenths(s);
  return s * TEN_THOUSANDTHS_MM_PER_SIXTEENTH;
}

/** Integer division rounding halves away from zero. */
function divRoundHalfAway(n, d) {
  const sign = (n < 0) !== (d < 0) ? -1 : 1;
  const an = Math.abs(n), ad = Math.abs(d);
  return sign * Math.floor((2 * an + ad) / (2 * ad));
}

/** Rounded length in tenths of a millimetre (nearest 0.1 mm, halves away from zero). */
export function sixteenthsToMmTenths(s) {
  return divRoundHalfAway(sixteenthsToTenThousandthsMm(s), 1000);
}

/** Format an integer count of 0.1 mm as a decimal string, e.g. 2223 -> "222.3". */
export function formatMmTenths(t) {
  assertSixteenths(t, 'mm tenths');
  const sign = t < 0 ? '-' : '';
  const a = Math.abs(t);
  return `${sign}${Math.floor(a / 10)}.${a % 10}`;
}

/** Exact mm as a decimal string with trailing zeros trimmed, e.g. 140 -> "222.25". */
export function sixteenthsToMmExact(s) {
  const u = sixteenthsToTenThousandthsMm(s);
  const sign = u < 0 ? '-' : '';
  const a = Math.abs(u);
  const frac = String(a % 10000).padStart(4, '0').replace(/0+$/, '');
  return `${sign}${Math.floor(a / 10000)}${frac ? '.' + frac : ''}`;
}

/** Convenience: { exact: "222.25", rounded: "222.3" } for a length in sixteenths. */
export function toMm(s) {
  return { exact: sixteenthsToMmExact(s), rounded: formatMmTenths(sixteenthsToMmTenths(s)) };
}

/**
 * Parse a millimetre string ("70", "222.25", up to 4 decimals) to integer 0.0001 mm units.
 */
export function parseMm(input) {
  const t = String(input).trim().replace(/\s*mm$/i, '');
  const m = /^(\d+)(?:\.(\d{1,4}))?$/.exec(t);
  if (!m) throw new RangeError(`not a millimetre value: "${input}" (non-negative, up to 4 decimals)`);
  const u = Number(m[1]) * 10000 + Number((m[2] || '').padEnd(4, '0') || 0);
  assertSixteenths(u, 'mm');
  return u;
}

/** Millimetres -> nearest sixteenth of an inch (halves away from zero). */
export function mmToSixteenths(input) {
  return divRoundHalfAway(parseMm(input), TEN_THOUSANDTHS_MM_PER_SIXTEENTH);
}

// ---------- clearance: C = W_g − W_v ----------

/**
 * Engineering constraint (class ENGINEERING_CONSTRAINT):
 *   C = W_g − W_v, per side = C / 2 (vehicle centred).
 *   Fit when (C / 2) >= m  <=>  C >= 2m   (compared in integers, no division).
 * @param {string|number} garageWidth  W_g, a reading string or integer sixteenths
 * @param {string|number} vehicleWidth W_v, a reading string or integer sixteenths
 * @param {string|number} minPerSide   m, minimum clearance per side (reading or sixteenths)
 */
export function clearance(garageWidth, vehicleWidth, minPerSide) {
  const toS = (v, name) => {
    if (typeof v === 'string') return parseReading(v);
    assertSixteenths(v, name);
    if (v < 0) throw new RangeError(`${name} must be >= 0`);
    return v;
  };
  const Wg = toS(garageWidth, 'W_g');
  const Wv = toS(vehicleWidth, 'W_v');
  if (minPerSide === undefined) throw new TypeError('minimum per-side clearance must be stated');
  const m = toS(minPerSide, 'minPerSide');
  const C = Wg - Wv;
  // Per side in thirty-seconds is exact: C sixteenths / 2 = C thirty-seconds.
  const perSideThirtySeconds = C;
  let verdict, reason;
  if (C < 0) { verdict = 'NO_FIT'; reason = 'VEHICLE_WIDER_THAN_OPENING'; }
  else if (C < 2 * m) { verdict = 'NO_FIT'; reason = 'BELOW_MINIMUM_PER_SIDE'; }
  else { verdict = 'FIT'; reason = 'MEETS_MINIMUM_PER_SIDE'; }
  const fmtSigned = (s) => (s < 0 ? '−' + formatReading(-s) : formatReading(s));
  const fmt32 = (t) => {
    const a = Math.abs(t);
    const whole = Math.floor(a / 32), rem = a % 32;
    let body;
    if (rem === 0) body = String(whole);
    else {
      const g = gcd(rem, 32);
      const fr = `${rem / g}/${32 / g}`;
      body = whole ? `${whole} ${fr}` : fr;
    }
    return (t < 0 ? '−' : '') + body;
  };
  return {
    W_g: { sixteenths: Wg, reading: formatReading(Wg), mm: toMm(Wg) },
    W_v: { sixteenths: Wv, reading: formatReading(Wv), mm: toMm(Wv) },
    minPerSide: { sixteenths: m, reading: formatReading(m), mm: toMm(m) },
    C: {
      sixteenths: C,
      reading: fmtSigned(C),
      mmTenths: sixteenthsToMmTenths(C),
      mm: formatMmTenths(sixteenthsToMmTenths(C))
    },
    perSide: {
      thirtySeconds: perSideThirtySeconds,
      // Conservative whole-sixteenth value (rounded toward −∞, never overstates room).
      sixteenthsFloor: Math.floor(C / 2),
      reading: fmt32(perSideThirtySeconds),
      mmTenths: divRoundHalfAway(C * TEN_THOUSANDTHS_MM_PER_SIXTEENTH, 2000),
      mm: formatMmTenths(divRoundHalfAway(C * TEN_THOUSANDTHS_MM_PER_SIXTEENTH, 2000))
    },
    verdict,
    reason
  };
}
