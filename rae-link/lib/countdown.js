// RAE LINK · THE WINDOW — daily request countdown
// Workroom: WR-RAELINK-001 (show format: docs/RAE-LINK-THE-WINDOW.md)
//
// A live countdown show from a street-level glass studio downtown. Members
// request and vote; the Ten is counted down live. Rules:
//   - Only published works that passed the rights gate can be voted on.
//   - World channels always carry their simulated-world label on air.
//   - One vote per member per work per day; at most MAX_VOTES votes per member per day.
//   - Ties go to the work that reached its total first (earliest last vote).
//   - A work retires after RETIRE_AFTER_DAYS days on the countdown and goes to the Hall.

export const MAX_VOTES = 5;
export const COUNTDOWN_SIZE = 10;
export const RETIRE_AFTER_DAYS = 45;

export const SEGMENTS = Object.freeze([
  { code: 'THE_TEN', label: 'The Ten', detail: 'Today’s countdown, 10 → 1, voted by members.' },
  { code: 'EARTH_CAM', label: 'Earth Cam', detail: 'Our people’s Earth videos — real creators, real places.' },
  { code: 'ROOTS_REEL', label: 'Roots Reel', detail: 'Family history finds from the Root House, with the records on screen.' },
  { code: 'WORLD_PREMIERE', label: 'World Premiere', detail: 'EdereAriah world channels — labelled as simulated world media.' },
  { code: 'TEA_TALK', label: 'Tea Talk', detail: 'Guests at the glass, one question each from the Request Line.' },
  { code: 'REQUEST_LINE', label: 'Request Line', detail: 'Members’ shout-outs read on air.' }
]);

export function eligible(work = {}) {
  const problems = [];
  if (work.state !== 'PUBLISHED') problems.push('NOT_PUBLISHED');
  if (work.rights_gate !== 'PASSED') problems.push('RIGHTS_GATE_NOT_PASSED');
  if (work.world_status === 'WORLD_SIMULATED' && !work.simulated_disclosure) problems.push('WORLD_LABEL_MISSING');
  if (work.retired) problems.push('RETIRED');
  return { ok: problems.length === 0, problems };
}

export function castVote(ledger, { member, workId, day, at = Date.now() }) {
  if (!member || !workId || !day) return { ok: false, code: 'INCOMPLETE_VOTE', ledger };
  const todays = ledger.filter(v => v.member === member && v.day === day);
  if (todays.some(v => v.workId === workId)) return { ok: false, code: 'ALREADY_VOTED_FOR_WORK', ledger };
  if (todays.length >= MAX_VOTES) return { ok: false, code: 'DAILY_VOTES_USED', ledger };
  return { ok: true, ledger: [...ledger, { member, workId, day, at }] };
}

export function countdown(ledger, works, day, size = COUNTDOWN_SIZE) {
  const byId = new Map(works.map(w => [w.id, w]));
  const tally = new Map();
  for (const v of ledger) {
    if (v.day !== day) continue;
    const work = byId.get(v.workId);
    if (!work || !eligible(work).ok) continue;
    const t = tally.get(v.workId) ?? { workId: v.workId, votes: 0, last: 0 };
    t.votes += 1; t.last = Math.max(t.last, v.at);
    tally.set(v.workId, t);
  }
  return [...tally.values()]
    .sort((a, b) => b.votes - a.votes || a.last - b.last || String(a.workId).localeCompare(String(b.workId)))
    .slice(0, size)
    .map((t, i) => ({ rank: i + 1, ...t, title: byId.get(t.workId)?.title ?? t.workId,
      label: byId.get(t.workId)?.world_status === 'WORLD_SIMULATED' ? byId.get(t.workId).simulated_disclosure : null }));
}

export function retireCheck(daysOnCountdown) {
  return daysOnCountdown >= RETIRE_AFTER_DAYS ? 'RETIRE_TO_HALL' : 'STAYS';
}
