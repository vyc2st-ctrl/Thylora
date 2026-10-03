// MAH' · World clock — Maryland is the anchor (WR-MAH-001, rule I8)
//
// Fact the Chairman asked us to surface: Baltimore and New York are in the SAME
// time zone (America/New_York, Eastern). They will always read the same time.
// The New York line is kept because it was asked for, and labelled so nobody
// thinks it is a separate clock. World (EdereAriah) time is a separate clock and
// is HELD until the Chairman sets its epoch and rate; we never invent one.

export const ANCHOR = Object.freeze({ place: 'Baltimore, Maryland (Inner Harbor)', zone: 'America/New_York', role: 'ANCHOR' });
export const SHOWN = Object.freeze([{ place: 'New York, New York', zone: 'America/New_York', role: 'SAME_ZONE_AS_ANCHOR' }]);

function fmt(date, zone) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: zone, weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit', timeZoneName: 'short'
  }).format(date);
}

/**
 * worldEpoch: { earth_start_iso, world_start_label, rate } — rate = world seconds per Earth second.
 * Until supplied, world time is reported as HELD, not guessed.
 */
export function clockHeader(now = new Date(), worldEpoch = null) {
  const lines = [{ ...ANCHOR, time: fmt(now, ANCHOR.zone) }, ...SHOWN.map(s => ({ ...s, time: fmt(now, s.zone) }))];
  let world = { role: 'WORLD', place: 'EdereAriah', time: null, state: 'HELD_EPOCH_NOT_SET' };
  if (worldEpoch?.earth_start_iso && Number(worldEpoch.rate) > 0) {
    const elapsed = (now - new Date(worldEpoch.earth_start_iso)) / 1000 * Number(worldEpoch.rate);
    const days = Math.floor(elapsed / 86400), rem = elapsed - days * 86400;
    const h = Math.floor(rem / 3600), m = Math.floor((rem % 3600) / 60);
    world = { role: 'WORLD', place: 'EdereAriah', state: 'SET',
      time: `${worldEpoch.world_start_label || 'World Day 0'} + ${days}d ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}` };
  }
  return { anchor: ANCHOR.place, lines, world };
}
