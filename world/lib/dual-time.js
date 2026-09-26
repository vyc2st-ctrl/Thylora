// THYLORA · EdereAirah dual time
// Source of record: thylora_world_time_profiles.profile_code = THY-DUAL-TIME-EDEREAIRAH-003
//
// Recovered canon (Chairman direct, 2026-09-24):
//   3 native dayparts x 11 Earth hours = 33 Earth hours per native day
//   1 full-orbit cycle = 507 Earth-read days
// Recovered anchor (Chairman TIMESEAL, 2026-09-17):
//   2026-09-17 10:05 EDT  ==  "Day 83 Aethon 4 hours 5 minutes"
//
// Rules held here:
//   - Earth time is a translation/custody anchor, never the native calendar.
//   - Native daypart, month, season and full-orbit names are OPEN. This module
//     never prints an invented native name. It returns codes and numbers only.
//   - 507 Earth days is not a whole number of native days (368.727...). The
//     calendar reconciliation rule is OPEN, so orbit arithmetic is done in
//     Earth-read milliseconds and native days are counted inside the remainder.

export const EARTH_HOUR_MS = 3_600_000;
export const EARTH_DAY_MS = 24 * EARTH_HOUR_MS;
export const NATIVE_DAYPARTS_PER_DAY = 3;
export const EARTH_HOURS_PER_DAYPART = 11;
export const NATIVE_DAY_EARTH_HOURS = NATIVE_DAYPARTS_PER_DAY * EARTH_HOURS_PER_DAYPART; // 33
export const NATIVE_DAY_MS = NATIVE_DAY_EARTH_HOURS * EARTH_HOUR_MS;
export const FULL_ORBIT_EARTH_READ_DAYS = 507;
export const FULL_ORBIT_MS = FULL_ORBIT_EARTH_READ_DAYS * EARTH_DAY_MS;
export const MEAN_EARTH_YEAR_DAYS = 365.2425;

export const TIME_PROFILE = 'THY-DUAL-TIME-EDEREAIRAH-003';
export const TIMESEAL_ANCHOR = Object.freeze({
  earth_iso: '2026-09-17T10:05:00-04:00',
  native_label_verbatim: 'Day 83 Aethon 4 hours 5 minutes',
  status: 'DIRECT_CHAIRMAN_TIMESEAL'
});

export const OPEN_NATIVE_TERMS = Object.freeze([
  'native daypart names',
  'native full-orbit-cycle term',
  'native month/cycle names',
  'season names/boundaries',
  'weekday/rotation names',
  'formal native era/cycle numbering',
  'calendar reconciliation rule (507 Earth-day orbit vs 33 Earth-hour day)'
]);

// Canonical native age is an elapsed duration: completed full-orbit cycles plus
// native days inside the unfinished cycle. Earth years are secondary.
export function nativeAgeFromElapsedMs(elapsedMs) {
  if (!Number.isFinite(elapsedMs) || elapsedMs < 0) throw new RangeError('elapsed must be a non-negative number of ms');
  const completed_full_orbit_cycles = Math.floor(elapsedMs / FULL_ORBIT_MS);
  const remainderMs = elapsedMs - completed_full_orbit_cycles * FULL_ORBIT_MS;
  const native_days = Math.floor(remainderMs / NATIVE_DAY_MS);
  const leftoverMs = remainderMs - native_days * NATIVE_DAY_MS;
  return {
    completed_full_orbit_cycles,
    native_days,
    native_daypart_index: Math.floor(leftoverMs / (EARTH_HOURS_PER_DAYPART * EARTH_HOUR_MS)), // 0..2, name OPEN
    earth_translation_years: round2(elapsedMs / (MEAN_EARTH_YEAR_DAYS * EARTH_DAY_MS)),
    translation_role: 'SECONDARY_ONLY',
    time_profile: TIME_PROFILE
  };
}

export function elapsedMsFromNativeAge({ completed_full_orbit_cycles, native_days, extra_earth_hours = 0 }) {
  return completed_full_orbit_cycles * FULL_ORBIT_MS + native_days * NATIVE_DAY_MS + extra_earth_hours * EARTH_HOUR_MS;
}

export function earthYearsFromNativeAge(age) {
  return round2(elapsedMsFromNativeAge(age) / (MEAN_EARTH_YEAR_DAYS * EARTH_DAY_MS));
}

// Offset of an Earth instant from the TIMESEAL anchor, in native units.
// The result is ANCHOR_RELATIVE: it says "N native days and H Earth hours after
// the sealed anchor", never a named native date.
export function anchorRelative(earthIso) {
  const t = Date.parse(earthIso);
  if (Number.isNaN(t)) throw new RangeError(`not a timestamp: ${earthIso}`);
  const deltaMs = t - Date.parse(TIMESEAL_ANCHOR.earth_iso);
  const sign = deltaMs < 0 ? -1 : 1;
  const abs = Math.abs(deltaMs);
  const native_days = Math.floor(abs / NATIVE_DAY_MS);
  const earth_hours_into_native_day = round2((abs - native_days * NATIVE_DAY_MS) / EARTH_HOUR_MS);
  return {
    direction: sign < 0 ? 'BEFORE_ANCHOR' : 'AFTER_ANCHOR',
    native_days,
    earth_hours_into_native_day,
    anchor: TIMESEAL_ANCHOR.native_label_verbatim,
    label_state: 'ANCHOR_RELATIVE_ONLY; native calendar names OPEN'
  };
}

// Dual stamp for every record: Earth timestamp + timezone always, native
// value only in the anchor-relative form the evidence supports.
export function dualStamp(earthIso, earthTimezone = 'America/New_York') {
  return {
    earth_iso: new Date(earthIso).toISOString(),
    earth_timezone: earthTimezone,
    native: anchorRelative(earthIso),
    time_profile: TIME_PROFILE
  };
}

function round2(n) { return Math.round(n * 100) / 100; }
