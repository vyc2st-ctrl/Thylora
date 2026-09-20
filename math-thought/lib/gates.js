// THY-WORK-MATH-FAMOUS-THOUGHT-559 · Chairman math gates
//
// Two gates live here and nowhere else, so the dashboard, the tests and the
// reviewable SQL all agree on one arithmetic:
//
//   F = S x A x C x T   the Famous Thought gate (section 3 of the work order)
//   D = A x H x W x T x M x P   the store / social value gate (section 8)
//
// Both gates FAIL CLOSED. A gate that cannot see its evidence returns FAIL,
// never PASS and never a silent default score.

export const UNKNOWN_DEFINITION = 'UNKNOWN_DEFINITION';

// ---------------------------------------------------------------- F gate ---

// The only variable meanings stated by the work order. Nothing here is inferred.
export const F_VARIABLES = Object.freeze([
  Object.freeze({ key: 'S', name: 'Source verification', authority: 'WORK_ORDER_559' }),
  Object.freeze({ key: 'A', name: 'Attribution', authority: 'WORK_ORDER_559' }),
  Object.freeze({ key: 'C', name: 'Context', authority: 'WORK_ORDER_559' }),
  Object.freeze({ key: 'T', name: 'Transfer value', authority: 'WORK_ORDER_559' })
]);

export const F_MIN_VARIABLE = 4;
export const F_MIN_PRODUCT = 256;
export const SCORE_MIN = 0;
export const SCORE_MAX = 5;

// The five fail-closed conditions, verbatim in intent from section 3.
const FAIL_CLOSED_CHECKS = Object.freeze([
  Object.freeze({ field: 'source_record_present', reason: 'SOURCE_UNCERTAIN' }),
  Object.freeze({ field: 'speaker_certain', reason: 'SPEAKER_UNCERTAIN' }),
  Object.freeze({ field: 'wording_from_source_record', reason: 'WORDING_UNCERTAIN' }),
  Object.freeze({ field: 'context_present', reason: 'CONTEXT_MISSING' }),
  Object.freeze({ field: 'tied_to_meaningful_question', reason: 'NO_MEANINGFUL_QUESTION' })
]);

function scoreProblem(key, value) {
  if (value === null || value === undefined || value === UNKNOWN_DEFINITION) {
    return `${key} is not scored (${UNKNOWN_DEFINITION})`;
  }
  if (!Number.isInteger(value)) return `${key} must be a whole number 0-5`;
  if (value < SCORE_MIN || value > SCORE_MAX) return `${key} must be within ${SCORE_MIN}-${SCORE_MAX}`;
  return null;
}

/**
 * Evaluate the Famous Thought gate for one candidate record.
 *
 * input.scores  { S, A, C, T } integers 0-5, or null/UNKNOWN_DEFINITION when unscored
 * input.evidence { source_record_present, speaker_certain, wording_from_source_record,
 *                  context_present, tied_to_meaningful_question } booleans
 *
 * Returns { verdict, f_value, scores, blocking, fail_closed, below_threshold }.
 * f_value is null whenever any score is missing: an unknown never multiplies to a number.
 */
export function evaluateFamousThoughtGate(input = {}) {
  const scores = input.scores || {};
  const evidence = input.evidence || {};
  const blocking = [];
  const failClosed = [];
  const belowThreshold = [];

  for (const check of FAIL_CLOSED_CHECKS) {
    if (evidence[check.field] !== true) failClosed.push(check.reason);
  }

  let product = 1;
  let computable = true;
  for (const variable of F_VARIABLES) {
    const problem = scoreProblem(variable.key, scores[variable.key]);
    if (problem) {
      blocking.push(problem);
      computable = false;
      continue;
    }
    const value = scores[variable.key];
    if (value < F_MIN_VARIABLE) {
      belowThreshold.push(`${variable.key} (${variable.name}) scored ${value}, minimum is ${F_MIN_VARIABLE}`);
    }
    product *= value;
  }

  const fValue = computable ? product : null;
  if (computable && fValue < F_MIN_PRODUCT) {
    belowThreshold.push(`F = ${fValue}, minimum is ${F_MIN_PRODUCT}`);
  }

  const pass = failClosed.length === 0 && blocking.length === 0 && belowThreshold.length === 0;
  return {
    gate: 'F',
    equation: 'F = S x A x C x T',
    verdict: pass ? 'PASS' : 'FAIL',
    f_value: fValue,
    scores: { S: scores.S ?? null, A: scores.A ?? null, C: scores.C ?? null, T: scores.T ?? null },
    fail_closed: failClosed,
    blocking,
    below_threshold: belowThreshold
  };
}

// ---------------------------------------------------------------- D gate ---

// D = A x H x W x T x M x P. The work order names the equation but NOT what the
// six letters stand for, and section 11 forbids inventing math definitions. The
// gate therefore refuses to score until the registry supplies each meaning.
export const D_VARIABLE_KEYS = Object.freeze(['A', 'H', 'W', 'T', 'M', 'P']);

/**
 * Evaluate the store / social value gate for one draft.
 *
 * input.definitions { A: 'meaning' | UNKNOWN_DEFINITION, ... } from the equation registry
 * input.scores      { A..P } integers 0-5
 * input.qualitative { provides_help, has_destination } booleans
 *
 * Section 8: a draft that gets attention but provides no help or no destination
 * must FAIL, regardless of arithmetic. That check is applied before the product.
 */
export function evaluateStoreValueGate(input = {}) {
  const definitions = input.definitions || {};
  const scores = input.scores || {};
  const qualitative = input.qualitative || {};
  const blocking = [];
  const unknownDefinitions = [];

  for (const key of D_VARIABLE_KEYS) {
    const meaning = definitions[key];
    if (!meaning || meaning === UNKNOWN_DEFINITION) unknownDefinitions.push(key);
  }

  if (qualitative.provides_help !== true) blocking.push('NO_HELP_PROVIDED');
  if (qualitative.has_destination !== true) blocking.push('NO_DESTINATION');

  let product = 1;
  let computable = unknownDefinitions.length === 0;
  for (const key of D_VARIABLE_KEYS) {
    const problem = scoreProblem(key, scores[key]);
    if (problem) {
      blocking.push(problem);
      computable = false;
      continue;
    }
    product *= scores[key];
  }

  if (unknownDefinitions.length > 0) {
    blocking.push(`${UNKNOWN_DEFINITION} for D variables: ${unknownDefinitions.join(', ')}`);
  }

  const dValue = computable ? product : null;
  const pass = blocking.length === 0;
  return {
    gate: 'D',
    equation: 'D = A x H x W x T x M x P',
    verdict: pass ? 'PASS' : 'FAIL',
    d_value: dValue,
    unknown_definitions: unknownDefinitions,
    blocking
  };
}
