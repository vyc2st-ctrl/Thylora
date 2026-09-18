// HISTORY → SHOW FACTORY · the SHOW_SEED formula
// Workroom: WR-SHOWFACTORY-001
//
//   SHOW_SEED =
//     DOCUMENTED MOMENT
//   × HIDDEN MECHANISM
//   × HUMAN DECISION
//   × EVIDENCE GAP
//   × QUESTION FOR TODAY
//
// It is written as a product, not a sum, on purpose. A missing factor is a zero,
// not a deduction. A biography summary is what you get when four of the five are
// blank and the first one is padded out to fill the hour — which is the exact
// thing this factory exists not to make.

export const FACTORS = Object.freeze([
  'DOCUMENTED_MOMENT',  // a dated thing that happened, with a source
  'HIDDEN_MECHANISM',   // the part the audience cannot see: how it actually worked
  'HUMAN_DECISION',     // a person choosing, under constraint, where they could have chosen otherwise
  'EVIDENCE_GAP',       // what the record does not contain, named
  'QUESTION_FOR_TODAY'  // the live question the moment hands the viewer
]);

// A factor is present only if it is specific. These are the smells of a factor
// that has been filled in with a shrug.
const VAGUE = [
  'inspiring', 'legacy', 'ahead of his time', 'ahead of her time', 'ahead of their time',
  'changed the world', 'overcame adversity', 'never gave up', 'a true pioneer', 'trailblazer'
];

const MIN_LENGTH = { DOCUMENTED_MOMENT: 40, HIDDEN_MECHANISM: 40, HUMAN_DECISION: 40, EVIDENCE_GAP: 20, QUESTION_FOR_TODAY: 15 };

/**
 * Score one factor. Returns 1 when the factor genuinely carries weight, 0 when
 * it is absent, and reports why.
 */
export function scoreFactor(name, value) {
  const problems = [];
  if (!FACTORS.includes(name)) {
    return { name, score: 0, problems: [{ code: 'FACTOR_UNKNOWN', detail: `${name} is not a factor of SHOW_SEED.` }] };
  }
  const text = typeof value === 'string' ? value.trim() : '';
  if (!text) {
    problems.push({ code: `${name}_MISSING`, detail: `SHOW_SEED has no ${name.replace(/_/g, ' ').toLowerCase()}.` });
    return { name, score: 0, problems };
  }
  if (text.length < MIN_LENGTH[name]) {
    problems.push({ code: `${name}_THIN`, detail: `Too short to be a real ${name.replace(/_/g, ' ').toLowerCase()}. Say the specific thing.` });
  }
  const lowered = text.toLowerCase();
  const vague = VAGUE.find(v => lowered.includes(v));
  if (vague) {
    problems.push({ code: `${name}_VAGUE`, detail: `"${vague}" is a mood, not a mechanism. Replace it with what happened.` });
  }
  if (name === 'QUESTION_FOR_TODAY' && !text.includes('?')) {
    problems.push({ code: 'QUESTION_NOT_A_QUESTION', detail: 'The question for today must be written as a question.' });
  }
  return { name, score: problems.length === 0 ? 1 : 0, problems };
}

/**
 * Evaluate the whole formula. The product is 1 only when every factor holds.
 */
export function evaluateFormula(seed) {
  const factors = seed?.formula || {};
  const results = FACTORS.map(name => scoreFactor(name, factors[name]));
  const problems = results.flatMap(r => r.problems);
  const product = results.reduce((acc, r) => acc * r.score, 1);

  return {
    product,
    complete: product === 1,
    present: results.filter(r => r.score === 1).map(r => r.name),
    missing: results.filter(r => r.score === 0).map(r => r.name),
    problems
  };
}

/**
 * The biography test. A seed whose only working factor is the moment, and whose
 * text is a life story, is not a show seed. Kept separate from the formula so
 * the refusal is legible in the report rather than buried in a score.
 */
export function isBiographySummary(seed) {
  const result = evaluateFormula(seed);
  const onlyMoment = result.present.length <= 1 && result.present[0] === 'DOCUMENTED_MOMENT';
  return { biography_summary: onlyMoment, reason: onlyMoment ? 'Only the moment survives scoring. That is a biography, not a seed.' : null };
}
