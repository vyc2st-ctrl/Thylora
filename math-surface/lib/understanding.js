// THYLORA · Understanding mathematics — the three-layer model
// Workroom: WR-MATH-SURFACE-001
//
//   L = Do I understand the sentence?
//   M = Do I understand the mathematical relationship?
//   S = Can I solve it?
//
//   P_solve = L × M × S
//
// The hard rule this file exists to enforce:
//
//   If L = 0, do NOT infer that the learner lacks the mathematics.
//
// A product with a zero factor is zero. That is arithmetic, and it is allowed.
// What is NOT allowed is reading that zero backwards into the other factors.
// A learner who cannot read the sentence produces P_solve = 0 whether their
// mathematics is perfect or absent, so a wrong answer on a word problem carries
// no information about M or S at all.
//
// The model therefore separates two different things that schools routinely
// collapse into one number:
//
//   the VALUE of a factor      — what was measured
//   the ADMISSIBILITY of it    — whether it was measured in a way that can be
//                                attributed to that layer alone
//
// An observation taken from a mixed word problem is NOT admissible evidence for
// M or S, because the language layer sits in front of it. Only an isolated
// probe — one that removes the other two layers — produces admissible evidence.
// Everything downstream (cards, teacher interface, family explanation, store
// candidates) reads admissibility, not just score.

export const LAYERS = Object.freeze(['L', 'M', 'S']);

export const LAYER_NAMES = Object.freeze({
  L: 'Language',
  M: 'Mathematical relationship',
  S: 'Solve procedure'
});

export const LAYER_QUESTIONS = Object.freeze({
  L: 'Do I understand the sentence?',
  M: 'Do I understand the mathematical relationship?',
  S: 'Can I solve it?'
});

// How a layer was looked at.
export const EVIDENCE = Object.freeze({
  OBSERVED: 'OBSERVED',           // isolated probe; admissible for this layer
  NOT_ISOLATED: 'NOT_ISOLATED',   // seen only inside a mixed task; NOT admissible
  UNMEASURED: 'UNMEASURED'        // never looked at
});

export const CLAIMS = Object.freeze({
  LANGUAGE_DEFICIT: 'LANGUAGE_DEFICIT',
  MATH_DEFICIT: 'MATH_DEFICIT',
  PROCEDURE_DEFICIT: 'PROCEDURE_DEFICIT',
  CANNOT_SOLVE_AS_PRESENTED: 'CANNOT_SOLVE_AS_PRESENTED'
});

// Below this a layer is treated as "not yet holding". It is a reporting
// threshold, not a judgement about a person.
export const HOLDING_THRESHOLD = 0.6;

function isLayer(layer) {
  if (!LAYERS.includes(layer)) throw new RangeError(`unknown layer ${layer}; expected one of ${LAYERS.join(', ')}`);
  return layer;
}

function unitInterval(value, field) {
  const n = Number(value);
  if (!Number.isFinite(n)) throw new TypeError(`${field} must be a finite number, received ${value}`);
  if (n < 0 || n > 1) throw new RangeError(`${field} must be between 0 and 1, received ${n}`);
  return n;
}

/**
 * Record one look at one layer.
 *
 * `isolated` is the whole point. A probe is isolated when the other two layers
 * cannot cause its failure:
 *   L isolated — the learner is asked what the sentence means; no arithmetic.
 *   M isolated — the quantities are handed over already extracted; the learner
 *                names the relationship; no computation, no reading load.
 *   S isolated — bare computation; no words at all.
 *
 * An observation from a mixed word problem must be recorded with
 * isolated: false. It then scores, but it is not admissible for its layer.
 */
export function observe({ layer, correct, attempted, isolated = true, source = null, note = null, at = null }) {
  isLayer(layer);
  const c = Number(correct);
  const a = Number(attempted);
  if (!Number.isInteger(c) || c < 0) throw new RangeError('correct must be a non-negative integer');
  if (!Number.isInteger(a) || a <= 0) throw new RangeError('attempted must be a positive integer');
  if (c > a) throw new RangeError('correct cannot exceed attempted');

  return Object.freeze({
    layer,
    correct: c,
    attempted: a,
    score: c / a,
    isolated: Boolean(isolated),
    evidence: isolated ? EVIDENCE.OBSERVED : EVIDENCE.NOT_ISOLATED,
    admissible: Boolean(isolated),
    source,
    note,
    at: at ?? null
  });
}

/** A layer that was never looked at. Explicit, so it cannot be mistaken for zero. */
export function unmeasured(layer) {
  isLayer(layer);
  return Object.freeze({
    layer,
    correct: null,
    attempted: 0,
    score: null,
    isolated: false,
    evidence: EVIDENCE.UNMEASURED,
    admissible: false,
    source: null,
    note: null,
    at: null
  });
}

/**
 * Collapse a list of observations into one factor per layer.
 * Only admissible (isolated) observations contribute to a factor's value.
 * Inadmissible observations are carried alongside so the surface can show that
 * something was seen without pretending it measured the layer.
 */
export function factorsFrom(observations = []) {
  const factors = {};
  for (const layer of LAYERS) {
    const all = observations.filter(o => o.layer === layer);
    const admissible = all.filter(o => o.admissible);
    if (admissible.length === 0) {
      factors[layer] = {
        layer,
        value: null,
        evidence: all.length ? EVIDENCE.NOT_ISOLATED : EVIDENCE.UNMEASURED,
        admissible: false,
        attempted: all.reduce((n, o) => n + o.attempted, 0),
        observations: all
      };
      continue;
    }
    const correct = admissible.reduce((n, o) => n + o.correct, 0);
    const attempted = admissible.reduce((n, o) => n + o.attempted, 0);
    factors[layer] = {
      layer,
      value: correct / attempted,
      evidence: EVIDENCE.OBSERVED,
      admissible: true,
      attempted,
      observations: all
    };
  }
  return factors;
}

/**
 * P_solve = L × M × S, computed honestly.
 *
 * Three outcomes, and the difference between them is the product:
 *
 *   determined, value 0   — some admissible factor is exactly 0. Arithmetic
 *                           settles the product regardless of the unknown
 *                           factors, so the value is reported. What caused it
 *                           is a separate question, answered by diagnose().
 *   determined, value > 0 — all three factors admissible.
 *   undetermined          — a factor is unknown and no admissible factor is 0.
 *                           No value is invented. Bounds are given instead:
 *                           an unknown factor lies in [0, 1], so the product
 *                           lies in [0, product of the known factors].
 */
export function solveProbability(factors) {
  const known = [];
  const unknown = [];
  for (const layer of LAYERS) {
    const f = factors[layer];
    if (f && f.admissible && typeof f.value === 'number') known.push(f);
    else unknown.push(layer);
  }

  const knownProduct = known.reduce((p, f) => p * f.value, 1);
  const zeroFactors = known.filter(f => f.value === 0).map(f => f.layer);

  if (zeroFactors.length > 0) {
    return Object.freeze({
      value: 0,
      determined: true,
      reason: 'ZERO_FACTOR',
      zero_factors: Object.freeze(zeroFactors),
      unmeasured: Object.freeze([...unknown]),
      bounds: Object.freeze({ low: 0, high: 0 }),
      expression: expressionFor(factors)
    });
  }

  if (unknown.length > 0) {
    return Object.freeze({
      value: null,
      determined: false,
      reason: 'INCOMPLETE_EVIDENCE',
      zero_factors: Object.freeze([]),
      unmeasured: Object.freeze([...unknown]),
      bounds: Object.freeze({ low: 0, high: knownProduct }),
      expression: expressionFor(factors)
    });
  }

  return Object.freeze({
    value: knownProduct,
    determined: true,
    reason: 'ALL_FACTORS_OBSERVED',
    zero_factors: Object.freeze([]),
    unmeasured: Object.freeze([]),
    bounds: Object.freeze({ low: knownProduct, high: knownProduct }),
    expression: expressionFor(factors)
  });
}

/** The equation written out with what is actually known, for display. */
export function expressionFor(factors) {
  const part = layer => {
    const f = factors[layer];
    if (!f || !f.admissible || typeof f.value !== 'number') return '?';
    return trim(f.value);
  };
  return `P_solve = L × M × S = ${part('L')} × ${part('M')} × ${part('S')}`;
}

function trim(value) {
  return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(3)));
}

/** P_solve can never exceed its smallest factor. Null while a factor is unknown. */
export function ceiling(factors) {
  const values = LAYERS
    .map(l => factors[l])
    .filter(f => f && f.admissible && typeof f.value === 'number')
    .map(f => f.value);
  if (values.length < LAYERS.length) return null;
  return Math.min(...values);
}

/**
 * Which layer is holding the product down, and what lifting it would actually buy.
 *
 * This is the number that changes what an adult does on Monday morning. Lifting
 * the solve procedure when language is the binding constraint moves P_solve by
 * almost nothing, and the arithmetic says so before the term is wasted.
 */
export function liftGain(factors, layer, target = 1) {
  isLayer(layer);
  const t = unitInterval(target, 'target');
  const before = solveProbability(factors);
  if (!before.determined || before.value === null) {
    const blocking = before.unmeasured.filter(l => l !== layer);
    if (blocking.length > 0) {
      return Object.freeze({
        layer, target: t, gain: null, before: before.value, after: null,
        determined: false, reason: 'UNMEASURED_FACTOR', unmeasured: Object.freeze(blocking)
      });
    }
  }
  const lifted = { ...factors, [layer]: { ...factors[layer], value: t, admissible: true, evidence: EVIDENCE.OBSERVED } };
  const after = solveProbability(lifted);
  if (!after.determined || after.value === null || before.value === null) {
    return Object.freeze({
      layer, target: t, gain: null, before: before.value, after: after.value,
      determined: false, reason: 'UNMEASURED_FACTOR', unmeasured: after.unmeasured
    });
  }
  return Object.freeze({
    layer, target: t, gain: after.value - before.value, before: before.value, after: after.value,
    determined: true, reason: 'COMPUTED', unmeasured: Object.freeze([])
  });
}

/** Rank the three layers by what lifting each one to 1 would return. */
export function liftRanking(factors, target = 1) {
  return LAYERS
    .map(layer => liftGain(factors, layer, target))
    .sort((a, b) => (b.gain ?? -1) - (a.gain ?? -1));
}

export function bindingConstraint(factors) {
  const admissible = LAYERS
    .map(l => factors[l])
    .filter(f => f && f.admissible && typeof f.value === 'number');
  if (admissible.length === 0) return Object.freeze({ layer: null, value: null, certain: false, reason: 'NOTHING_MEASURED' });

  const lowest = admissible.reduce((a, b) => (b.value < a.value ? b : a));
  const unknownLayers = LAYERS.filter(l => !factors[l]?.admissible || typeof factors[l]?.value !== 'number');

  // A measured zero is binding no matter what the unknown factors turn out to be.
  if (lowest.value === 0) {
    return Object.freeze({ layer: lowest.layer, value: 0, certain: true, reason: 'MEASURED_ZERO' });
  }
  if (unknownLayers.length > 0) {
    return Object.freeze({
      layer: lowest.layer, value: lowest.value, certain: false,
      reason: 'UNMEASURED_LAYER_COULD_BE_LOWER', unmeasured: Object.freeze(unknownLayers)
    });
  }
  return Object.freeze({ layer: lowest.layer, value: lowest.value, certain: true, reason: 'LOWEST_MEASURED' });
}

/**
 * Whether a claim about a learner is supported by the evidence on hand.
 *
 * This is the guard. `MATH_DEFICIT` requires an isolated observation of M.
 * Nothing else grants it — not a failed word problem, not a zero on L, not a
 * low P_solve, not a teacher's impression recorded as a mixed-task score.
 */
export function claimSupported(factors, claim) {
  const f = factors;
  switch (claim) {
    case CLAIMS.LANGUAGE_DEFICIT:
      return supportFor(f.L, 'L', 'an isolated language probe');
    case CLAIMS.MATH_DEFICIT:
      return supportFor(f.M, 'M', 'an isolated relationship probe, with the quantities already extracted');
    case CLAIMS.PROCEDURE_DEFICIT:
      return supportFor(f.S, 'S', 'a bare computation with no words');
    case CLAIMS.CANNOT_SOLVE_AS_PRESENTED: {
      const p = solveProbability(f);
      if (p.determined && p.value === 0) {
        return Object.freeze({
          claim, permitted: true,
          because: `P_solve is 0 because ${p.zero_factors.map(l => LAYER_NAMES[l]).join(' and ')} measured 0. This says the problem cannot be solved as it is written. It says nothing about the other layers.`
        });
      }
      return Object.freeze({ claim, permitted: false, because: 'P_solve is not a determined zero', requires: 'a measured zero in some layer' });
    }
    default:
      throw new RangeError(`unknown claim ${claim}`);
  }
}

function supportFor(factor, layer, requirement) {
  const name = LAYER_NAMES[layer];
  if (!factor || factor.evidence === EVIDENCE.UNMEASURED) {
    return Object.freeze({
      claim: null, permitted: false, requires: requirement,
      because: `${name} was never measured. An unmeasured layer is not a low layer.`
    });
  }
  if (!factor.admissible) {
    return Object.freeze({
      claim: null, permitted: false, requires: requirement,
      because: `${name} was only seen inside a mixed task, so the other layers could have caused the failure. That is not evidence about ${name}.`
    });
  }
  if (factor.value >= HOLDING_THRESHOLD) {
    return Object.freeze({
      claim: null, permitted: false, requires: requirement,
      because: `${name} measured ${trim(factor.value)}, at or above the reporting threshold ${HOLDING_THRESHOLD}.`
    });
  }
  return Object.freeze({
    claim: null, permitted: true,
    because: `${name} measured ${trim(factor.value)} on ${factor.attempted} isolated item(s).`
  });
}

/**
 * Full read of a learner on one problem or one sitting.
 * Returns what is known, what is refused, and what to do next.
 */
export function diagnose(observations = []) {
  const factors = factorsFrom(observations);
  const p = solveProbability(factors);
  const binding = bindingConstraint(factors);

  const permitted = [];
  const refused = [];
  for (const claim of Object.values(CLAIMS)) {
    const support = claimSupported(factors, claim);
    const entry = { claim, because: support.because, requires: support.requires ?? null };
    if (support.permitted) permitted.push(entry); else refused.push(entry);
  }

  const languageZero = factors.L.admissible && factors.L.value === 0;
  const mathUnknown = !factors.M.admissible;
  const solveUnknown = !factors.S.admissible;

  let headline;
  if (languageZero && (mathUnknown || solveUnknown)) {
    headline =
      'The sentence did not come through. P_solve is 0 because the language factor is 0. ' +
      'The mathematics has not been measured and must not be guessed from this.';
  } else if (!p.determined) {
    headline = `Not enough isolated evidence to state P_solve. It lies between ${trim(p.bounds.low)} and ${trim(p.bounds.high)}.`;
  } else if (p.value === 0) {
    headline = `P_solve is 0. The binding layer is ${LAYER_NAMES[binding.layer]}.`;
  } else {
    headline = `P_solve = ${trim(p.value)}. The lowest layer is ${LAYER_NAMES[binding.layer]} at ${trim(binding.value)}.`;
  }

  return Object.freeze({
    factors,
    p_solve: p,
    ceiling: ceiling(factors),
    binding_constraint: binding,
    permitted_claims: Object.freeze(permitted),
    refused_claims: Object.freeze(refused),
    language_blocked: languageZero,
    math_claim_available: factors.M.admissible,
    headline,
    next_actions: nextActions(factors, p)
  });
}

/**
 * What to do next, in order.
 *
 * The ordering rule: never teach into an unmeasured layer, and when language is
 * zero, measure the mathematics with the language removed BEFORE teaching any
 * mathematics. Otherwise a reading problem is re-taught as a number problem for
 * a year.
 */
export function nextActions(factors, p = solveProbability(factors)) {
  const actions = [];
  const languageZero = factors.L.admissible && factors.L.value === 0;

  if (!factors.L.admissible) {
    actions.push({
      code: 'PROBE_LANGUAGE',
      layer: 'L',
      why: 'Language has not been measured in isolation. Everything else is unreadable until it is.',
      how: 'Ask what the sentence is telling us and what it is asking for. No numbers are used, and no answer is computed.'
    });
  }

  if (languageZero) {
    actions.push({
      code: 'PROBE_MATH_LANGUAGE_REMOVED',
      layer: 'M',
      why: 'Language measured 0, so the word problem carries no information about the mathematics. The relationship must be measured with the words taken off.',
      how: 'Hand the learner the quantities already extracted and ask which relationship is being described. They point, draw or say it. They do not compute.'
    });
    actions.push({
      code: 'PROBE_SOLVE_LANGUAGE_REMOVED',
      layer: 'S',
      why: 'The same applies to the procedure.',
      how: 'Give the bare computation with no words at all.'
    });
    actions.push({
      code: 'TEACH_LANGUAGE',
      layer: 'L',
      why: 'The binding constraint is the sentence.',
      how: 'Teach the specific word that failed, in its own right: what it means, what relationship it signals, and where it misleads.'
    });
  } else {
    if (!factors.M.admissible) {
      actions.push({
        code: 'PROBE_MATH_ISOLATED', layer: 'M',
        why: 'The relationship has not been measured on its own.',
        how: 'Quantities supplied; learner names the relationship; nothing is computed.'
      });
    }
    if (!factors.S.admissible) {
      actions.push({
        code: 'PROBE_SOLVE_ISOLATED', layer: 'S',
        why: 'The procedure has not been measured on its own.',
        how: 'Bare computation, no words.'
      });
    }
  }

  if (p.determined && p.value !== null) {
    const ranked = liftRanking(factors).filter(r => r.determined && r.gain > 0);
    if (ranked.length > 0) {
      const top = ranked[0];
      actions.push({
        code: 'TEACH_HIGHEST_RETURN_LAYER',
        layer: top.layer,
        why: `Lifting ${LAYER_NAMES[top.layer]} to 1 moves P_solve by ${trim(top.gain)}. It is the largest available move.`,
        how: `Work the ${LAYER_NAMES[top.layer].toLowerCase()} layer in isolation, then return to the mixed problem.`
      });
    }
  }

  actions.push({
    code: 'EXPLAIN_BACK',
    layer: null,
    why: 'A result the child cannot say back in their own words has not been understood, whatever P_solve reads.',
    how: 'The child explains what the answer means in the story — not how they got it.'
  });

  return Object.freeze(actions.map(Object.freeze));
}

/**
 * Throws when a caller tries to state a claim the evidence refuses.
 * Surfaces call this before printing anything about a learner.
 */
export function assertClaim(factors, claim) {
  const support = claimSupported(factors, claim);
  if (!support.permitted) {
    const error = new Error(`Refused claim ${claim}: ${support.because}`);
    error.name = 'UnsupportedClaimError';
    error.claim = claim;
    error.requires = support.requires ?? null;
    throw error;
  }
  return support;
}

export const MODEL = Object.freeze({
  id: 'THY-MATH-LMS-001',
  equation: 'P_solve = L × M × S',
  layers: LAYER_QUESTIONS,
  hard_rule: 'If L = 0, do not infer that the learner lacks the mathematics.',
  admissibility_rule: 'Only an isolated probe is evidence about its own layer.',
  holding_threshold: HOLDING_THRESHOLD
});
