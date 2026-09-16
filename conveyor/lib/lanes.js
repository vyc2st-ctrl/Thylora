// CONVEYOR · parallel production lanes and the non-blocking scheduler
// Workroom: WR-CONVEYOR-001
//
// BLOCK(X) != BLOCK(Y).
//
// The scheduler exists because the expensive failure is not a blocked item --
// it is a blocked item taking the whole belt down with it. Every lane is
// evaluated independently, and within a lane a Chairman-gated item is stepped
// over rather than waited on. The only time this returns nothing to do is when
// EVERY item in EVERY lane is sitting on a Chairman gate, which is the one
// honest stopping point.

import { stageGate, nextExecutableAction, actionsRemaining, moneyDistance, pullForwardWork, AUTHORITY, MONEY_STAGE, stageIndex } from './stages.js';

export const LANES = Object.freeze({
  SHOWS_VIDEO:            { label: 'Shows and video',            code: 'SHW' },
  BOOKS_COMICS:           { label: 'Books and comics',           code: 'BOK' },
  EDUCATIONAL_SHEETS:     { label: 'Educational sheets',         code: 'EDU' },
  GAMES:                  { label: 'Games',                      code: 'GAM' },
  CLOTHING:               { label: 'Clothing',                   code: 'CLO' },
  SERIALIZED_COLLECTIBLES:{ label: 'Serialized collectibles',    code: 'COL' },
  HISTORY_HERBAL:         { label: 'History and herbal products', code: 'HRB' },
  ASK_ERSATZ:             { label: 'Ask Ersatz products',        code: 'ASK' },
  NEWSPAPERS_REPORTS:     { label: 'Newspapers and reports',      code: 'NWS' },
  MEDIA_NETWORK:          { label: 'Media network (RAE Link)',    code: 'RAE' },
  MEMBERSHIPS:            { label: 'Memberships and access',      code: 'MEM' },
  WORLD_OBJECTS:          { label: 'World objects',              code: 'OBJ' }
});

export const LANE_KEYS = Object.freeze(Object.keys(LANES));

/** Full projection of one item: every field the directive requires it to expose. */
export function project(item) {
  const gate = stageGate(item);
  const next = nextExecutableAction(item);
  const money = moneyDistance(item);
  // Idle only when the current stage AND every pull-forward task wait on the
  // Chairman. A stage-level Chairman gate alone does not idle an item.
  const chairmanOnly = gate.halted || (!gate.ready && gate.build_blockers.length === 0 && pullForwardWork(item).length === 0);
  return {
    canonical_id: item.canonical_id,
    title: item.title,
    source_parent: item.source_parent,
    lane: item.lane,
    owner_department: item.owner_department,
    responsible_person: item.responsible_person,
    stage: item.stage,
    blocker: gate.ready ? null : gate.blockers[0].code,
    blocker_authority: gate.ready ? null : gate.blockers[0].authority,
    next_action: next.action,
    next_action_authority: next.authority,
    next_action_pulled_forward: Boolean(next.pulled_forward),
    actions_remaining: actionsRemaining(item),
    rights_state: item.rights_state ?? 'UNKNOWN',
    provenance_state: item.provenance_state ?? 'UNKNOWN',
    serial_state: item.serial_state ?? 'NONE',
    qr_state: item.qr_state ?? 'NONE',
    cost_state: item.cost_state ?? 'UNKNOWN',
    price_state: item.price_state ?? 'UNSET',
    storefront_state: item.storefront_state ?? 'ABSENT',
    money_distance: money.distance,
    money_chairman_gates: money.chairman_gates,
    last_advanced_at: item.last_advanced_at ?? null,
    executable_now: !chairmanOnly,
    all_blockers: gate.blockers
  };
}

/**
 * The next executable item in one lane, or null when every item in it waits on
 * the Chairman. Ordering: shortest money distance first, then fewest actions
 * remaining, then oldest advancement. Work nearest to money moves first, and an
 * item that has sat longest is not left to sit longer.
 */
export function nextInLane(items, lane) {
  const candidates = items
    .filter(i => i.lane === lane)
    .map(project)
    .filter(p => p.executable_now);
  if (!candidates.length) return null;
  candidates.sort((a, b) =>
    a.money_distance - b.money_distance ||
    a.actions_remaining - b.actions_remaining ||
    String(a.last_advanced_at ?? '').localeCompare(String(b.last_advanced_at ?? '')) ||
    a.canonical_id.localeCompare(b.canonical_id));
  return candidates[0];
}

/**
 * One executable item per lane, every lane evaluated independently. This is the
 * whole point: a lane whose lead item is Chairman-gated still returns its next
 * eligible item, and a lane with nothing executable does not silence the others.
 */
export function scheduleAllLanes(items) {
  const work = [];
  const idle = [];
  for (const lane of LANE_KEYS) {
    const inLane = items.filter(i => i.lane === lane);
    if (!inLane.length) { idle.push({ lane, reason: 'NO_ITEMS' }); continue; }
    const next = nextInLane(items, lane);
    if (next) work.push(next);
    else idle.push({ lane, reason: 'ALL_ITEMS_CHAIRMAN_GATED', items: inLane.map(i => i.canonical_id) });
  }
  return { work, idle, has_executable_work: work.length > 0 };
}

/**
 * Prove the non-blocking property for a specific item rather than asserting it:
 * given a blocked item X, return the work that remains executable anyway.
 */
export function unaffectedBy(items, blockedId) {
  const blocked = items.find(i => i.canonical_id === blockedId);
  if (!blocked) throw new RangeError(`No such conveyor item: ${blockedId}`);
  return scheduleAllLanes(items).work.filter(w => w.canonical_id !== blockedId);
}

/** Items closest to money that are ours to move, across all lanes. */
export function moneyNext(items, limit = 5) {
  return items
    .map(project)
    .filter(p => p.executable_now && stageIndex(p.stage) <= stageIndex(MONEY_STAGE))
    .sort((a, b) => a.money_distance - b.money_distance || a.actions_remaining - b.actions_remaining)
    .slice(0, limit);
}

/** Every item whose only remaining blocker belongs to the Chairman. */
export function chairmanGates(items) {
  const gates = [];
  for (const item of items) {
    const gate = stageGate(item);
    if (gate.ready || gate.build_blockers.length) continue;
    for (const b of gate.chairman_blockers) {
      gates.push({ canonical_id: item.canonical_id, title: item.title, lane: item.lane, stage: item.stage, code: b.code, detail: b.detail, route: b.route });
    }
  }
  return gates;
}

/** Lane-level rollup for the board and for readback. */
export function laneSummary(items) {
  return LANE_KEYS.map(lane => {
    const inLane = items.filter(i => i.lane === lane).map(project);
    const executable = inLane.filter(p => p.executable_now);
    return {
      lane,
      label: LANES[lane].label,
      code: LANES[lane].code,
      items: inLane.length,
      executable: executable.length,
      chairman_gated: inLane.length - executable.length,
      nearest_money: inLane.length ? Math.min(...inLane.map(p => p.money_distance)) : null
    };
  });
}
