// THYLORA · SR CANDIDATE EQUATION — UNDER TEST, NOT CANON
//
//        SR = N × E × S × A × C × R
//
// This file implements the candidate exactly as proposed, implements three
// alternatives, and runs the failure-mode battery against all of them. It does
// NOT adopt the candidate. `CANON` is false and there is no code path that sets
// it true — canonization is a Chairman act, taken after reading the results,
// not something a build decides for itself.
//
// Factors, each in [0,1], each defined against the Trusted Six support model:
//   N  NEED                 the declared need is real, current, and matches the role family
//   E  EVIDENCE             the supporter's basis to act is checkable, not asserted
//   S  SAFETY               safety clearance stands, with no open safety finding
//   A  AUTHORITY FIT        the requested scope sits inside what this family may ever hold
//   C  CONFLICT CLEARANCE   declared and cleared by someone other than the supporter
//   R  RESTORATION STANDING breach record resolved, remedies completed, watch period served

export const CANON = false;
export const CANON_NOTE =
  'SR = N × E × S × A × C × R is a CANDIDATE. It has been implemented and tested. '
  + 'It is not canon, is not used to gate anything, and is not displayed as a score anywhere '
  + 'a decision is made. See SR-EQUATION-TEST.md for the result and the recommendation.';

export const FACTORS = Object.freeze(['N', 'E', 'S', 'A', 'C', 'R']);

export const FACTOR_MEANING = Object.freeze({
  N: 'NEED — the declared need is real, current, and matches this role family.',
  E: 'EVIDENCE — the basis to act is checkable rather than asserted.',
  S: 'SAFETY — safety clearance stands, with no open safety finding.',
  A: 'AUTHORITY FIT — the requested scope is inside what this family may ever hold.',
  C: 'CONFLICT CLEARANCE — declared, and cleared by someone other than the supporter.',
  R: 'RESTORATION STANDING — breach record resolved, remedies completed, watch served.',
});

/** Factors that are safety-critical: a near-failure here must not be compensable. */
export const CRITICAL_FACTORS = Object.freeze(['S', 'C']);

export class SrError extends Error {}

function readFactors(input) {
  const out = {};
  for (const key of FACTORS) {
    const value = input?.[key];
    if (value === null || value === undefined || value === 'UNKNOWN') {
      out[key] = null; // deliberately preserved — see T8
      continue;
    }
    if (typeof value !== 'number' || Number.isNaN(value) || value < 0 || value > 1) {
      throw new SrError(`FACTOR_OUT_OF_RANGE: ${key}=${value} (expected 0..1 or UNKNOWN)`);
    }
    out[key] = value;
  }
  return out;
}

// ---------------------------------------------------------------------------
// The candidate, exactly as proposed
// ---------------------------------------------------------------------------

/**
 * SR = N × E × S × A × C × R.
 * @param {object} input factors in [0,1]
 * @param {object} [options]
 * @param {'ONE'|'ZERO'|'HALF'|'THROW'} [options.unknownAs] how to treat UNKNOWN — the
 *   fact that this parameter has to exist at all is finding T8.
 */
export function srCandidate(input, options = {}) {
  const factors = readFactors(input);
  const unknownAs = options.unknownAs ?? 'THROW';
  let product = 1;
  const unknowns = [];
  for (const key of FACTORS) {
    let value = factors[key];
    if (value === null) {
      unknowns.push(key);
      if (unknownAs === 'THROW') {
        throw new SrError(`FACTOR_UNKNOWN: ${key} has no value and the equation has no term for one.`);
      }
      value = { ONE: 1, ZERO: 0, HALF: 0.5 }[unknownAs];
    }
    product *= value;
  }
  return { sr: product, factors, unknowns, canon: CANON };
}

// ---------------------------------------------------------------------------
// Alternatives, implemented so the comparison is real rather than rhetorical
// ---------------------------------------------------------------------------

export const DEFAULT_FLOORS = Object.freeze({ N: 0.6, E: 0.6, S: 0.9, A: 1.0, C: 0.9, R: 0.6 });

/**
 * ALTERNATIVE 1 — the gate. What zero-propagation actually means, made explicit,
 * with a per-factor floor instead of one implicit floor at exactly zero.
 * Returns every blocker at once, matching the rest of THYLORA's gate pattern.
 */
export function srGate(input, floors = DEFAULT_FLOORS) {
  const factors = readFactors(input);
  const blockers = [];
  for (const key of FACTORS) {
    const value = factors[key];
    if (value === null) {
      blockers.push({ code: 'FACTOR_UNKNOWN', factor: key, route: `Establish ${key} before this is decidable.` });
      continue;
    }
    if (value < floors[key]) {
      blockers.push({
        code: 'BELOW_FLOOR',
        factor: key,
        value,
        floor: floors[key],
        route: `${FACTOR_MEANING[key]} Currently ${value}, floor ${floors[key]}.`,
      });
    }
  }
  return { eligible: blockers.length === 0, blockers, factors };
}

/**
 * ALTERNATIVE 2 — the binding constraint. Report the weakest factor by name.
 * Non-compensable by construction: a strong factor cannot mask a weak one.
 */
export function srBinding(input) {
  const factors = readFactors(input);
  const known = FACTORS.filter((key) => factors[key] !== null);
  const unknown = FACTORS.filter((key) => factors[key] === null);
  if (unknown.length) {
    return { binding: unknown[0], value: null, unknown, note: 'An unknown factor binds before any known one.' };
  }
  const binding = known.reduce((worst, key) => (factors[key] < factors[worst] ? key : worst), known[0]);
  return { binding, value: factors[binding], unknown: [], note: FACTOR_MEANING[binding] };
}

/**
 * ALTERNATIVE 3 — the normalised geometric mean. Same zero-propagation as the
 * candidate, but on the same scale as its own factors, so the number is at least
 * readable. Included because it is the obvious repair — and it still fails T3.
 */
export function srGeometric(input) {
  const { sr, factors, unknowns } = srCandidate(input, { unknownAs: 'THROW' });
  return { sr: sr ** (1 / FACTORS.length), raw: sr, factors, unknowns };
}

/**
 * The vector report: what the tests below recommend reporting instead of a score.
 */
export function srReport(input, floors = DEFAULT_FLOORS) {
  const gate = srGate(input, floors);
  const binding = srBinding(input);
  return {
    canon: CANON,
    eligible: gate.eligible,
    binding: binding.binding,
    bindingValue: binding.value,
    blockers: gate.blockers,
    vector: gate.factors,
    score: null,
    note: 'No scalar score is published. The vector and the binding constraint are the output.',
  };
}

// ---------------------------------------------------------------------------
// The failure-mode battery
// ---------------------------------------------------------------------------

const ALL_ONE = Object.freeze({ N: 1, E: 1, S: 1, A: 1, C: 1, R: 1 });

function withFactor(base, key, value) {
  return { ...base, [key]: value };
}

/** T1 — zero propagation. The candidate's intended strength. */
export function t1ZeroPropagation() {
  const results = FACTORS.map((key) => ({
    factor: key,
    sr: srCandidate(withFactor(ALL_ONE, key, 0)).sr,
  }));
  const pass = results.every((result) => result.sr === 0);
  return {
    id: 'T1', name: 'ZERO_PROPAGATION', pass,
    finding: pass
      ? 'Any single factor at zero drives SR to zero. This is the candidate working as intended, and it is worth keeping.'
      : 'A zero factor did not drive SR to zero.',
    results,
  };
}

/**
 * T2 — range collapse. A genuine six-dimensional deterministic sweep over the
 * whole healthy band, so the share below 0.5 is the real share and not an
 * artefact of pinning some factors.
 */
export function t2RangeCollapse(steps = 11, low = 0.6, high = 1.0) {
  const grid = Array.from({ length: steps }, (unused, index) => low + ((high - low) * index) / (steps - 1));
  let below = 0;
  let count = 0;
  let sum = 0;
  let min = Infinity;
  let max = 0;
  for (const n of grid) {
    for (const e of grid) {
      for (const s of grid) {
        for (const a of grid) {
          const partial = n * e * s * a;
          for (const c of grid) {
            const partial2 = partial * c;
            for (const r of grid) {
              const sr = partial2 * r;
              count += 1;
              sum += sr;
              if (sr < 0.5) below += 1;
              if (sr < min) min = sr;
              if (sr > max) max = sr;
            }
          }
        }
      }
    }
  }
  const shareBelowHalf = below / count;
  const pass = shareBelowHalf < 0.5;
  return {
    id: 'T2', name: 'RANGE_COLLAPSE', pass,
    finding: pass
      ? 'Realistic factor ranges produce interpretable values.'
      : `Sweeping all six factors across a healthy ${low}–${high} band, ${(shareBelowHalf * 100).toFixed(1)}% of `
        + `results fall below 0.5 and the mean is ${(sum / count).toFixed(3)}. A supporter with nothing wrong anywhere `
        + 'reads as a failing score. The number cannot be shown to a person without misleading them.',
    samples: count,
    shareBelowHalf: Number(shareBelowHalf.toFixed(4)),
    mean: Number((sum / count).toFixed(4)),
    min: Number(min.toFixed(4)),
    max: Number(max.toFixed(4)),
  };
}

/**
 * T3 — compensability and ordering. The defect that matters most: a candidate
 * with a near-failing SAFETY or CONFLICT factor can outrank a uniformly
 * acceptable one, because the product does not know which factor is critical.
 */
export function t3Compensability() {
  const uniformlyAcceptable = { N: 0.7, E: 0.7, S: 0.7, A: 0.7, C: 0.7, R: 0.7 };
  const criticalNearFailure = { N: 1, E: 1, S: 0.12, A: 1, C: 1, R: 1 };
  const a = srCandidate(uniformlyAcceptable).sr;
  const b = srCandidate(criticalNearFailure).sr;
  const inverted = b > a;
  return {
    id: 'T3', name: 'COMPENSABILITY_ORDERING', pass: !inverted,
    finding: inverted
      ? `A supporter whose SAFETY factor is 0.12 scores ${b.toFixed(4)}, above a supporter who is 0.7 on everything `
        + `at ${a.toFixed(4)}. The product ranks a near-total safety failure above uniform adequacy, because it has no `
        + 'concept of a critical factor. This is the finding that blocks canonization.'
      : 'Critical near-failure is correctly ranked below uniform adequacy.',
    uniformlyAcceptable: Number(a.toFixed(4)),
    criticalNearFailure: Number(b.toFixed(4)),
    criticalFactors: CRITICAL_FACTORS,
    alternativeHandles: srBinding(criticalNearFailure).binding === 'S'
      && srGate(criticalNearFailure).blockers.some((blocker) => blocker.factor === 'S'),
  };
}

/** T4 — noise amplification. Relative errors add across six multiplied terms. */
export function t4NoiseAmplification(noise = 0.1) {
  // Worst case is analytic: (1+e)^6 and (1-e)^6.
  const high = (1 + noise) ** 6 - 1;
  const low = 1 - (1 - noise) ** 6;
  const span = high + low;
  const pass = span <= noise * 2;
  return {
    id: 'T4', name: 'NOISE_AMPLIFICATION', pass,
    finding: pass
      ? 'Measurement error does not compound materially.'
      : `±${(noise * 100).toFixed(0)}% error on each of six factors produces a span of `
        + `−${(low * 100).toFixed(1)}% to +${(high * 100).toFixed(1)}% on SR — a ${(span * 100).toFixed(1)}% swing `
        + 'from inputs that are each individually acceptable. Several of these factors are judgements, not measurements.',
    perFactorNoise: noise,
    highBound: Number(high.toFixed(4)),
    lowBound: Number(low.toFixed(4)),
    span: Number(span.toFixed(4)),
  };
}

/**
 * T5 — gaming gradient. ∂SR/∂f = SR/f, so the largest return comes from lifting
 * the lowest factor. That is fine if the lowest factor is the real problem, and
 * perverse if the lowest factor is simply the cheapest to document.
 */
export function t5GamingGradient() {
  const state = { N: 0.9, E: 0.4, S: 0.95, A: 1, C: 0.95, R: 0.9 };
  const base = srCandidate(state).sr;
  const gradients = FACTORS.map((key) => {
    const lifted = srCandidate(withFactor(state, key, Math.min(1, state[key] + 0.1))).sr;
    return { factor: key, from: state[key], gain: Number((lifted - base).toFixed(5)) };
  }).sort((x, y) => y.gain - x.gain);
  const best = gradients[0];
  const pass = CRITICAL_FACTORS.includes(best.factor);
  return {
    id: 'T5', name: 'GAMING_GRADIENT', pass,
    finding: pass
      ? 'The strongest incentive points at a safety-critical factor.'
      : `The largest single gain available is on ${best.factor} (${FACTOR_MEANING[best.factor].split(' — ')[0]}), `
        + `at +${best.gain}. EVIDENCE is the cheapest factor to raise by producing paperwork, so the equation's `
        + 'steepest incentive points at documentation rather than at safety or conflict clearance.',
    base: Number(base.toFixed(5)), gradients,
  };
}

/** T6 — no natural threshold, and the same threshold admits very different vectors. */
export function t6ThresholdUndefined(threshold = 0.3) {
  const admitted = [
    { N: 0.8, E: 0.8, S: 0.8, A: 0.8, C: 0.8, R: 0.95 },
    { N: 1, E: 1, S: 1, A: 1, C: 0.35, R: 1 },
    { N: 1, E: 0.55, S: 1, A: 1, C: 0.6, R: 1 },
  ].map((vector) => ({ vector, sr: Number(srCandidate(vector).sr.toFixed(4)) }))
    .filter((entry) => entry.sr >= threshold);
  const conflictFailureAdmitted = admitted.some((entry) => entry.vector.C < 0.5);
  return {
    id: 'T6', name: 'THRESHOLD_UNDEFINED', pass: !conflictFailureAdmitted,
    finding: conflictFailureAdmitted
      ? `At a threshold of ${threshold}, a vector with CONFLICT at 0.35 is admitted alongside one that is 0.8 across the board. `
        + 'The threshold cannot distinguish them, because the scalar has already discarded which factor was weak. '
        + 'Any threshold chosen is arbitrary and admits vectors nobody would admit by hand.'
      : 'The threshold separates acceptable from unacceptable vectors.',
    threshold, admitted,
  };
}

/** T7 — dimension sensitivity. Adding a seventh factor lowers every score. */
export function t7DimensionSensitivity() {
  const vector = { N: 0.9, E: 0.9, S: 0.9, A: 0.9, C: 0.9, R: 0.9 };
  const six = srCandidate(vector).sr;
  const seven = six * 0.9;
  const drop = (six - seven) / six;
  return {
    id: 'T7', name: 'DIMENSION_SENSITIVITY', pass: drop < 0.01,
    finding: drop < 0.01
      ? 'Adding a factor does not materially shift the scale.'
      : `Adding a seventh factor at the same 0.9 quality drops SR from ${six.toFixed(4)} to ${seven.toFixed(4)}, `
        + `a ${(drop * 100).toFixed(1)}% fall with nothing about the supporter changed. Scores are therefore not `
        + 'comparable across model versions, and any historical SR becomes meaningless the moment the model grows.',
    six: Number(six.toFixed(4)), seven: Number(seven.toFixed(4)), drop: Number(drop.toFixed(4)),
  };
}

/**
 * T8 — UNKNOWN has no term. THYLORA's own evidence rule is
 * observation ≠ measurement ≠ inference ≠ proof. A product of six numbers has
 * nowhere to put "not established", and every available substitution lies.
 */
export function t8UnknownHasNoTerm() {
  const partial = { N: 1, E: 1, S: 1, A: 1, C: 'UNKNOWN', R: 1 };
  const asOne = srCandidate(partial, { unknownAs: 'ONE' }).sr;
  const asZero = srCandidate(partial, { unknownAs: 'ZERO' }).sr;
  const asHalf = srCandidate(partial, { unknownAs: 'HALF' }).sr;
  let threw = false;
  try { srCandidate(partial); } catch { threw = true; }
  return {
    id: 'T8', name: 'UNKNOWN_HAS_NO_TERM', pass: false,
    finding:
      'With CONFLICT unestablished, treating UNKNOWN as 1 scores a perfect '
      + `${asOne.toFixed(2)} and hides that nothing was checked; as 0 it scores ${asZero.toFixed(2)} and refuses `
      + `everyone whose paperwork is merely incomplete; as 0.5 it scores ${asHalf.toFixed(2)}, a number nobody measured. `
      + 'The equation has no term for "not established", which is the exact distinction THYLORA\'s evidence rule exists to hold.',
    asOne: Number(asOne.toFixed(4)),
    asZero: Number(asZero.toFixed(4)),
    asHalf: Number(asHalf.toFixed(4)),
    candidateThrowsByDefault: threw,
    alternativeHandles: srGate(partial).blockers.some((blocker) => blocker.code === 'FACTOR_UNKNOWN'),
  };
}

/** Run the whole battery. */
export function runBattery() {
  const tests = [
    t1ZeroPropagation(),
    t2RangeCollapse(),
    t3Compensability(),
    t4NoiseAmplification(),
    t5GamingGradient(),
    t6ThresholdUndefined(),
    t7DimensionSensitivity(),
    t8UnknownHasNoTerm(),
  ];
  const failed = tests.filter((test) => !test.pass);
  return {
    equation: 'SR = N × E × S × A × C × R',
    canon: CANON,
    tested: tests.length,
    passed: tests.length - failed.length,
    failed: failed.length,
    failedIds: failed.map((test) => test.id),
    tests,
    verdict: failed.length === 0 ? 'NO_DEFECT_FOUND' : 'DEFECTS_FOUND_DO_NOT_CANONIZE',
    recommendation:
      'Keep what the candidate gets right — a disqualifying factor disqualifies — and discard the scalar. '
      + 'Publish the factor vector and the binding constraint (srReport), gate on per-factor floors (srGate), '
      + 'and carry UNKNOWN as UNKNOWN rather than substituting a number for it. '
      + 'Canonization is a Chairman act and is not taken by this build.',
  };
}

export default { srCandidate, srGate, srBinding, srGeometric, srReport, runBattery, CANON };
