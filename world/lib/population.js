// THYLORA · population resolution scaling
// Idea lane: THY-IDEA-PERSON-CAUSAL-SPINE-001 (population section)
//
// Four compute tiers. A person may move down in compute resolution but never
// loses history: demotion summarises the active state, it never truncates the
// event log. Promotion reloads the full history before the person acts again.
//
//   BACKGROUND  population-level statistical state (counts, rates, flows)
//   HOUSEHOLD   household/community aggregate (shared schedule, budget, vehicle)
//   PERSISTENT  individual with a life packet and event log, stepped coarsely
//   FOCUS       active agent: full causal spine, per-minute decisions

export const TIERS = Object.freeze(['BACKGROUND', 'HOUSEHOLD', 'PERSISTENT', 'FOCUS']);
const RANK = Object.fromEntries(TIERS.map((t, i) => [t, i]));

// Once a person exists as an individual they can never drop below PERSISTENT
// storage, even when their compute is folded into a household step.
export const FLOOR_ONCE_INDIVIDUAL = 'PERSISTENT';

export function makePerson(id, { tier = 'PERSISTENT', history = [], state = {} } = {}) {
  if (!TIERS.includes(tier)) throw new RangeError(`unknown tier ${tier}`);
  return { id, tier, compute_tier: tier, history: [...history], state: { ...state }, summaries: [] };
}

export function setResolution(person, target, { reason, at } = {}) {
  if (!TIERS.includes(target)) throw new RangeError(`unknown tier ${target}`);
  if (!reason) throw new Error('a resolution change needs a stated reason');
  const before = person.history.length;
  const next = { ...person, history: [...person.history], summaries: [...person.summaries] };

  if (RANK[target] < RANK[person.compute_tier]) {
    // Demotion: summarise, never delete. Storage tier stays >= PERSISTENT.
    next.summaries.push({ at, from: person.compute_tier, to: target, reason, state_snapshot: { ...person.state }, history_len: before });
    next.compute_tier = target;
    next.tier = RANK[target] < RANK[FLOOR_ONCE_INDIVIDUAL] ? FLOOR_ONCE_INDIVIDUAL : target;
  } else if (RANK[target] > RANK[person.compute_tier]) {
    // Promotion: the full history is what the agent reasons from.
    next.compute_tier = target;
    next.tier = target;
    next.reloaded_history_len = before;
  }
  next.history.push({ type: 'RESOLUTION_CHANGE', at, from: person.compute_tier, to: target, reason });
  if (next.history.length < before) throw new Error('invariant broken: history shrank'); // defensive
  return next;
}

// Background step: one population cell advances by rates, not by people.
// Individuals inside the cell who are PERSISTENT or FOCUS are excluded from the
// statistical draw so they are never double-counted or overwritten.
export function backgroundStep(cell, { excludedIndividuals = 0 } = {}) {
  const n = Math.max(0, cell.population - excludedIndividuals);
  return {
    ...cell,
    commuters: Math.round(n * (cell.rates.commute ?? 0)),
    at_home: Math.round(n * (cell.rates.home ?? 0)),
    statistical_population: n,
    individuals_excluded: excludedIndividuals
  };
}
