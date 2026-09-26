// THYLORA · World Event Engine
// Events come from state: people + schedules + needs + weather + resources +
// institutions + conflicts + prior events + bounded chance.
//
// Hard rules:
//   1. Every event carries a non-empty cause list that points at state ids.
//   2. Chance only chooses among candidates the state already supports. It can
//      never create an event with no cause ("author convenience" is rejected).
//   3. Chance is bounded to [P_MIN, P_MAX] and seeded, so every tick replays.
//   4. Events write persistent state deltas. Nobody resets after a scene.

export const P_MIN = 0.02;
export const P_MAX = 0.98;

// mulberry32: small, deterministic, replayable.
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const clampP = p => Math.min(P_MAX, Math.max(P_MIN, p));

const overlaps = (a, b) => Date.parse(a.starts_at) < Date.parse(b.ends_at) && Date.parse(b.starts_at) < Date.parse(a.ends_at);

// Each rule reads world state and returns candidate events with causes and a
// base probability. Rules do not decide outcomes; the engine does.
export const RULES = Object.freeze({
  // Two commitments for one person overlap, or someone assumed availability.
  scheduleConflict(world) {
    const out = [];
    for (const p of world.people) {
      const items = world.schedule.filter(s => s.person_id === p.id);
      for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
        if (!overlaps(items[i], items[j])) continue;
        const assumed = [items[i], items[j]].find(s => s.assumed_by && !s.confirmed_by_person);
        out.push({
          type: 'SCHEDULE_CONFLICT', person_id: p.id, at: items[j].starts_at,
          causes: [`schedule:${items[i].id}`, `schedule:${items[j].id}`, ...(assumed ? [`assumption:${assumed.assumed_by}`] : [])],
          p: assumed ? 0.95 : 0.8,
          delta: { [p.id]: { open_conflicts: +1 } }
        });
      }
    }
    return out;
  },

  // A person's irritation map is matched by something that actually happened.
  irritationTrigger(world) {
    const out = [];
    for (const p of world.people) {
      const map = p.irritation_map || {};
      for (const prior of world.prior_events.filter(e => e.affects === p.id)) {
        const ctx = map[prior.context] || [];
        const hit = ctx.find(x => prior.tags?.includes(x));
        if (!hit) continue;
        out.push({
          type: 'IRRITATION', person_id: p.id, at: prior.at, context: prior.context,
          causes: [`event:${prior.id}`, `irritation_map:${prior.context}`],
          p: 0.7 + (p.state.fatigue ?? 0) * 0.2,
          delta: { [p.id]: { irritation: +1, patience: -1 } }
        });
      }
    }
    return out;
  },

  // Weather x transport x schedule: a commute through bad weather risks delay.
  weatherDelay(world) {
    const out = [];
    const w = world.weather;
    if (!w || w.precip_mm_h <= 0) return out;
    for (const s of world.schedule.filter(s => s.requires_travel)) {
      const v = world.vehicles.find(v => v.owner_id === s.person_id);
      out.push({
        type: 'TRAVEL_DELAY', person_id: s.person_id, at: s.starts_at,
        causes: [`weather:${w.id}`, `schedule:${s.id}`, ...(v ? [`vehicle:${v.id}`] : ['transport:none_registered'])],
        p: Math.min(0.9, 0.15 + w.precip_mm_h * 0.05 + (v?.condition === 'service_due' ? 0.1 : 0)),
        delta: { [s.person_id]: { minutes_late_risk: +10 } }
      });
    }
    return out;
  },

  // Need thresholds (hunger, rest) produce a need event bound to the person's own plan.
  needThreshold(world) {
    const out = [];
    for (const p of world.people) {
      if ((p.state.hunger ?? 0) >= 0.7) {
        out.push({
          type: 'MEAL', person_id: p.id, at: world.now,
          causes: [`need:hunger:${p.id}`, ...(p.meal_plan ? [`meal_plan:${p.id}`] : [])],
          p: 0.9, plan: p.meal_plan?.main_break ?? 'OPEN',
          delta: { [p.id]: { hunger: -0.6 } }
        });
      }
    }
    return out;
  },

  // Institution deadlines and resource shortfalls.
  institutionDeadline(world) {
    return (world.institutions || []).flatMap(inst => (inst.deadlines || [])
      .filter(d => Date.parse(d.due) <= Date.parse(world.now) + 86_400_000)
      .map(d => ({
        type: 'DEADLINE_PRESSURE', person_id: d.person_id, at: d.due,
        causes: [`institution:${inst.id}`, `deadline:${d.id}`],
        p: 0.85, delta: { [d.person_id]: { stress: +1 } }
      })));
  },

  resourceShortfall(world) {
    return (world.resources || []).filter(r => r.level < r.needed).map(r => ({
      type: 'RESOURCE_SHORTFALL', person_id: r.holder_id, at: world.now,
      causes: [`resource:${r.id}`],
      p: clampP((r.needed - r.level) / r.needed + 0.3),
      delta: { [r.holder_id]: { unresolved_needs: +1 } }
    }));
  }
});

export function validateEvent(e) {
  const problems = [];
  if (!Array.isArray(e.causes) || e.causes.length === 0) problems.push('event has no cause');
  if (e.causes?.some(c => typeof c !== 'string' || !c.includes(':'))) problems.push('cause must reference a state id (kind:id)');
  if (e.forced_by_author) problems.push('author-forced events are rejected; add the state that would cause it');
  if (!e.person_id) problems.push('event must bind to a person or group');
  return { valid: problems.length === 0, problems };
}

// One tick: gather candidates, reject causeless ones, roll bounded chance,
// apply deltas to persistent state. Returns events, rejections and new state.
export function tick(world, { seed, rules = RULES } = {}) {
  if (seed == null) throw new Error('seed required so the tick can be replayed');
  const r = rng(seed);
  const candidates = Object.entries(rules).flatMap(([name, fn]) => fn(world).map(c => ({ ...c, rule: name })));
  const events = [], rejected = [], not_occurred = [];
  for (const c of candidates) {
    const v = validateEvent(c);
    if (!v.valid) { rejected.push({ ...c, problems: v.problems }); continue; }
    const p = clampP(c.p);
    const roll = r();
    const rec = { ...c, p, roll: Math.round(roll * 1e6) / 1e6 };
    (roll < p ? events : not_occurred).push(rec);
  }
  const state = structuredClone(Object.fromEntries(world.people.map(p => [p.id, p.state])));
  for (const e of events) for (const [pid, d] of Object.entries(e.delta || {})) {
    state[pid] ??= {};
    for (const [k, inc] of Object.entries(d)) state[pid][k] = Math.round(((state[pid][k] ?? 0) + inc) * 1000) / 1000;
  }
  return { seed, events, not_occurred, rejected, state };
}

// A world event with no state behind it is refused even when handed in directly.
export function injectAuthorEvent(event) {
  const v = validateEvent(event);
  if (!v.valid) return { accepted: false, problems: v.problems };
  return { accepted: true, event };
}
