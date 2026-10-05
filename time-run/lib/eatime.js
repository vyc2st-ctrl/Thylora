// TIME RUN · EdereAirah clock — implementation of MATH-EA-TIME-660
// Workroom: WR-RECONCILE-667 · Reconciles WR-TIMERUN-581 forward to live head 667
//
// BACKEND-FIRST. This module implements an equation that is ACTIVE in the live
// backend (thylora_math_equation_registry.MATH-EA-TIME-660, layer EdereAirah),
// read 2026-10-05 from thylora-dash. It is not a proposal.
//
//   d = ⌊(s + 3600·z) ÷ 93,600⌋
//   year length = 336 (or 337 when year ÷ 4 leaves 0)
//   month = ⌊doy ÷ 28⌋ + 1
//   day   = doy mod 28 + 1
//   hour  = remainder ÷ 3600
//
// Mirror Epoch: EA 2026 Month 1 Day 1 00:00 = Earth 2026-01-01 00:00 UTC.
// A day is 26 hours = 93,600 SI seconds. A month is 28 days. A year is 12 months.
//
// WHY TIME RUN NEEDS THIS: an arrival time in a living EdereAirah era is an
// EdereAirah time. Recording a traversal only in Earth clock terms silently
// imports Earth's 24-hour day into a 26-hour world.

export const SECONDS_PER_EA_DAY = 93600;   // 26 h × 3600
export const DAYS_PER_EA_MONTH = 28;
export const MONTHS_PER_EA_YEAR = 12;
export const EPOCH_EA_YEAR = 2026;
export const EPOCH_EARTH_UTC = '2026-01-01T00:00:00Z';

/** Zones are whole EA hours from Prime Meridian Time. Bell Crossing is PMT−6. */
export const ZONES = Object.freeze({ PMT: 0, BELL_CROSSING: -6 });

/** 336 days, or 337 on a Renewal year (year ÷ 4 leaves 0). */
export function eaYearLength(eaYear) {
  return eaYear % 4 === 0 ? 337 : 336;
}

/** Seconds from the Mirror Epoch to an Earth instant. May be negative. */
export function secondsSinceEpoch(earthInstant) {
  const t = earthInstant instanceof Date ? earthInstant : new Date(earthInstant);
  if (Number.isNaN(t.getTime())) throw new TypeError(`unreadable Earth instant: ${earthInstant}`);
  return Math.floor((t.getTime() - Date.parse(EPOCH_EARTH_UTC)) / 1000);
}

function floorDiv(a, b) { return Math.floor(a / b); }
function mod(a, b) { return ((a % b) + b) % b; }

/**
 * Earth instant → EdereAirah date and time in a given zone.
 * Pure arithmetic, no stored clock. The clock is computed, never remembered.
 */
export function earthToEdereAirah(earthInstant, zoneHours = ZONES.PMT) {
  if (!Number.isInteger(zoneHours)) throw new TypeError('zoneHours must be a whole EA hour offset');
  const s = secondsSinceEpoch(earthInstant);
  const shifted = s + 3600 * zoneHours;

  const d = floorDiv(shifted, SECONDS_PER_EA_DAY);
  const remainder = mod(shifted, SECONDS_PER_EA_DAY);

  // Walk years from the epoch in whichever direction d points.
  let year = EPOCH_EA_YEAR;
  let doy = d;
  while (doy < 0) { year -= 1; doy += eaYearLength(year); }
  while (doy >= eaYearLength(year)) { doy -= eaYearLength(year); year += 1; }

  // Renewal Day sits after Month 12, outside the week and outside the months.
  const renewal = doy >= MONTHS_PER_EA_YEAR * DAYS_PER_EA_MONTH;

  return Object.freeze({
    ea_year: year,
    ea_month: renewal ? null : floorDiv(doy, DAYS_PER_EA_MONTH) + 1,
    ea_day: renewal ? null : mod(doy, DAYS_PER_EA_MONTH) + 1,
    renewal_day: renewal,
    ea_hour: floorDiv(remainder, 3600),
    ea_minute: floorDiv(mod(remainder, 3600), 60),
    ea_second: mod(remainder, 60),
    day_of_year: doy,
    zone_hours: zoneHours,
    equation: 'MATH-EA-TIME-660'
  });
}

/** A short stable rendering for an encounter record. */
export function formatEdereAirah(stamp) {
  const hh = String(stamp.ea_hour).padStart(2, '0');
  const mm = String(stamp.ea_minute).padStart(2, '0');
  const zone = stamp.zone_hours === 0 ? 'PMT' : `PMT${stamp.zone_hours > 0 ? '+' : ''}${stamp.zone_hours}`;
  if (stamp.renewal_day) return `EA ${stamp.ea_year} · Renewal Day · ${hh}:${mm} ${zone}`;
  return `EA ${stamp.ea_year} · Month ${stamp.ea_month} Day ${stamp.ea_day} · ${hh}:${mm} ${zone}`;
}

/**
 * Surface gravity ratio — MATH-EA-GRAVITY-660, ACTIVE in the live backend.
 *   g / g⊕ = (ρ / ρ⊕) × (R / R⊕) = 0.80 × 1.25 = 1.00
 * Time Run depends on this: under ID-A (fully embodied) a traveler's body
 * behaves the same in either world, so injury does not need a special rule.
 */
export const EA_GRAVITY = Object.freeze({
  equation: 'MATH-EA-GRAVITY-660',
  density_ratio: 0.80,
  radius_ratio: 1.25,
  g_ratio: 1.00,
  consequence_for_time_run: 'A body weighs and moves the same in both worlds. ID-A needs no gravity exception.'
});

export function eaGravityRatio(densityRatio = 0.80, radiusRatio = 1.25) {
  return Number((densityRatio * radiusRatio).toFixed(10));
}
