// HEAD · MIRROR LINE editorial standard
// The investigative show formerly referred to as "my dateline show".
// Rules are data so the product can show them, and tests can hold them.

export const SHOW = Object.freeze({
  code: 'MIRROR_LINE',
  name: 'MIRROR LINE',
  tagline: 'Our place first. Then the mirror. Context on every number.',
  alternates: ['EVEN GROUND', 'CONTEXT FIRST', 'THE WHOLE STORY'],
  order_of_coverage: ['OUR_PLACE_FIRST', 'MIRROR_COMPARISON', 'WHAT_WE_DO_DIFFERENT']
});

export const EDITORIAL_RULES = Object.freeze([
  ['NO_OPINION', 'The reporter does not give an opinion on air.'],
  ['NO_SIDES', 'The show does not take a side. Every party is asked the same kind of question.'],
  ['NO_PRESUMED_GUILT', 'No question assumes guilt that evidence has not established.'],
  ['NO_SLIDE_WORDS', 'No adjective tells the viewer what to feel (chilling, sinister, cold, callous).'],
  ['NO_INFERENCE_AS_FACT', 'Inference is labelled as inference. Observation ≠ measurement ≠ inference ≠ proof.'],
  ['CONTEXT_ON_NUMBERS', 'No number airs without source, base, period and comparison.'],
  ['OUR_PLACE_FIRST', 'Mississippi is reported first, good and bad, before any comparison.'],
  ['FAMILY_IS_A_PARTNER', 'A family is a collaborator, never a prop. Their share is declared before publication.'],
  ['NAME_THE_PROPAGANDA', 'When a claim is propaganda, the show names the technique and shows the missing context.']
].map(([code, statement]) => Object.freeze({ code, statement })));

// Patterns that turn a question into an accusation or tell the audience what to think.
const QUESTION_FLAGS = [
  ['PRESUMED_GUILT', /\b(why did you (kill|hurt|do it|lie)|when did you decide|admit (it|that)|come clean|you expect (us|anyone) to believe)\b/i],
  ['LEADING_TAG', /,\s*(didn't|don't|isn't|wasn't|aren't|weren't|won't|right)\b[^?]*\?\s*$/i],
  ['ISNT_IT_TRUE', /\b(isn'?t it true|wouldn'?t you agree|don'?t you think)\b/i],
  ['SLIDE_WORD', /\b(chilling|sinister|cold-blooded|callous|shocking|monster|evil|clearly guilty|obviously)\b/i],
  ['VERDICT_LABEL', /\b(killer|murderer|the suspect who)\b/i],
  ['MIND_READING', /\b(you must have (felt|known|wanted)|you clearly)\b/i]
];

/** Returns every reason a question breaks the standard. Empty array = neutral. */
export function checkQuestion(text) {
  const t = String(text ?? '').trim();
  if (!t) return [{ code: 'EMPTY', detail: 'No question given.' }];
  return QUESTION_FLAGS.filter(([, re]) => re.test(t)).map(([code]) => ({ code, detail: t }));
}

/** A number may air only when all four pieces of context are present. */
export function checkNumberContext(claim) {
  const missing = ['source', 'base', 'period', 'comparison'].filter(k => !claim?.[k]);
  return { airable: missing.length === 0, missing };
}

/** Same kind of question to every side: the count of questions per party may differ by at most one. */
export function checkBalance(questionsByParty) {
  const counts = Object.values(questionsByParty).map(q => q.length);
  if (counts.length < 2) return { balanced: false, reason: 'ONLY_ONE_PARTY_ASKED' };
  const spread = Math.max(...counts) - Math.min(...counts);
  return { balanced: spread <= 1, spread };
}
