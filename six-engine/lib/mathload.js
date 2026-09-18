// SIX UNDERSTANDING ENGINE · LANGUAGE LOAD vs MATHEMATICAL LOAD
// Workroom: WR-SIXENGINE-001
//
//   P_solve = L × M × S
//
//   L = the sentence is understood
//   M = the mathematical relationship is understood
//   S = the solving procedure can be carried out
//
// A word problem failure is one number with three possible causes. Multiplying
// them makes the product zero when any one is zero — which is exactly why the
// product must never be read backwards. If L = 0, the attempt carries NO
// information about M or S: the learner never reached the mathematics. The
// engine records M and S as UNMEASURED (null), never 0, and refuses to state a
// mathematics deficit (FM-02).
//
// UNMEASURED is not a smaller number than zero. It is a different kind of
// thing, and the whole module exists to keep the two apart.

import { extractInvariants, languageFriction } from './parity.js';
import { comprehensionCoverage } from './language.js';

export const VERDICTS = Object.freeze([
  'SECURE', 'PROCEDURE_BLOCKED', 'RELATIONSHIP_BLOCKED', 'LANGUAGE_BLOCKED',
  'LANGUAGE_UNMEASURED', 'RELATIONSHIP_UNMEASURED', 'PROCEDURE_UNMEASURED'
]);

export const THRESHOLD = Object.freeze({ L: 0.5, M: 0.6, S: 0.6 });

/**
 * L — did the sentence land?
 *
 * Measured two ways, both required: the material words were cleared, and the
 * learner's own restatement carried the problem's logical invariants. A learner
 * who echoes the wording but loses "each" has not understood the sentence.
 */
export function measureLanguageLoad({ source, cards = [], learner_restatement = null }) {
  if (learner_restatement === null || String(learner_restatement).trim() === '') {
    return {
      L: null, state: 'UNMEASURED',
      reason: 'no learner restatement recorded — comprehension was never observed, only assumed',
      next_action: 'Ask the learner to say the problem back in their own words before any score is written down.'
    };
  }
  const wanted = extractInvariants(source);
  const got = new Set(extractInvariants(learner_restatement).map(i => i.kind));
  const recovered = wanted.filter(i => got.has(i.kind));
  const invariantRecovery = wanted.length === 0 ? 1 : recovered.length / wanted.length;
  const coverage = comprehensionCoverage(cards);
  const L = Number(Math.min(1, 0.5 * coverage + 0.5 * invariantRecovery).toFixed(2));

  return {
    L, state: 'MEASURED',
    word_coverage: coverage,
    invariant_recovery: Number(invariantRecovery.toFixed(2)),
    invariants_lost: wanted.filter(i => !got.has(i.kind)).map(i => i.kind),
    friction: languageFriction(source).score
  };
}

/**
 * Strip the language, keep the mathematics.
 *
 * This is the control condition. The same relationship, the same numbers, the
 * same number of steps — presented with the sentence load taken out. If the
 * learner can do it here and not in the story, the deficit was never
 * mathematical.
 */
export function languageControlledForm(structure) {
  const { quantities = {}, relation, question } = structure;
  const lines = Object.entries(quantities).map(([k, v]) => `${k} = ${v}`);
  return {
    presentation: [...lines, relation, `Find: ${question}`].join('\n'),
    steps: structure.steps ?? 1,
    relation,
    note: 'Same relationship, same numbers, same step count as the story version. Only the sentence load is removed.'
  };
}

/**
 * M — is the relationship understood?
 *
 * Only meaningful when measured under a controlled presentation. Asking for M
 * from a story the learner could not read measures L twice.
 */
export function measureMathematicalLoad({ relation_stated = null, relation_expected = null, controlled = false }) {
  if (!controlled) {
    return { M: null, state: 'UNMEASURED', reason: 'the relationship was only probed through the story text, so language load is still in the way' };
  }
  if (relation_stated === null) {
    return { M: null, state: 'UNMEASURED', reason: 'the learner was never asked to name the relationship' };
  }
  const norm = (x) => String(x).toLowerCase().replace(/−/g, '-').replace(/\s+/g, ' ').replace(/[^a-z0-9+\-*/×÷=. ]/g, '').trim();
  const exact = norm(relation_stated) === norm(relation_expected);

  // A reversed subtraction or division is the relationship recognised and run
  // backwards — a different error from not having the relationship at all.
  const parse = (x) => {
    const m = norm(x).match(/^(?:(.+?)\s*=\s*)?(.+?)\s*([-+*/×÷])\s*(.+)$/);
    return m ? { target: (m[1] ?? '').trim(), left: m[2].trim(), op: m[3], right: m[4].trim() } : null;
  };
  const a = parse(relation_stated);
  const b = parse(relation_expected);
  const INVERSE = { '-': '+', '+': '-', '/': '*', '*': '/', '÷': '×', '×': '÷' };
  const operandsSwapped = Boolean(a && b) && a.op === b.op && a.left === b.right && a.right === b.left;
  // "Ada = Sam + 3" for "Ada = Sam - 3" is the inverse-comparison error: the
  // relationship is there, pointing the wrong way.
  const operatorInverted = Boolean(a && b) && INVERSE[b.op] === a.op &&
    a.left === b.left && a.right === b.right && a.target === b.target;
  const directionFlipped = !exact && (operandsSwapped || operatorInverted);
  const M = exact ? 1 : directionFlipped ? 0.4 : 0.2;
  return {
    M: Number(M.toFixed(2)), state: 'MEASURED',
    relation_stated, relation_expected,
    direction_flipped: directionFlipped,
    note: directionFlipped ? 'relationship recognised, direction reversed' : exact ? 'relationship named correctly' : 'relationship not recovered'
  };
}

/**
 * S — can the procedure be carried out, given the relationship?
 * Measured on bare computation, with no story and no relationship to find.
 */
export function measureProcedure({ steps_attempted = null, steps_correct = null }) {
  if (steps_attempted === null || steps_attempted === 0) {
    return { S: null, state: 'UNMEASURED', reason: 'no bare-computation attempt was recorded' };
  }
  const S = Number(Math.max(0, Math.min(1, steps_correct / steps_attempted)).toFixed(2));
  return { S, state: 'MEASURED', steps_attempted, steps_correct };
}

/** P_solve = L × M × S, or null when any factor is unmeasured. */
export function pSolve({ L, M, S }) {
  if (L === null || M === null || S === null) {
    return { P_solve: null, computable: false, unmeasured: ['L', 'M', 'S'].filter(k => ({ L, M, S })[k] === null) };
  }
  return { P_solve: Number((L * M * S).toFixed(3)), computable: true, unmeasured: [] };
}

/**
 * The diagnosis.
 *
 * The one rule this function exists to hold: a low L caps what the attempt can
 * tell you. Below the L threshold, any M or S that was not measured under a
 * language-controlled presentation is discarded — not scored low, discarded —
 * and `mathematics_deficit_claim` returns NOT_SUPPORTED.
 */
export function diagnose({ language, mathematical, procedure, answer_correct = null }) {
  const L = language?.L ?? null;
  let M = mathematical?.M ?? null;
  let S = procedure?.S ?? null;
  const discarded = [];
  const evidence_notes = [];

  const languageBlocked = L !== null && L < THRESHOLD.L;

  if (languageBlocked) {
    if (M !== null && !mathematical?.controlled_measurement) { discarded.push('M'); M = null; }
    if (S !== null && !procedure?.controlled_measurement) { discarded.push('S'); S = null; }
    evidence_notes.push(
      'L is below threshold. A wrong answer here is evidence about the sentence, not about the mathematics.',
      'Any M or S taken from the story presentation has been discarded rather than scored: the learner never reached the mathematics, so the attempt carries no information about it.'
    );
  }

  const product = pSolve({ L, M, S });

  let verdict;
  if (L === null) verdict = 'LANGUAGE_UNMEASURED';
  else if (languageBlocked) verdict = 'LANGUAGE_BLOCKED';
  else if (M === null) verdict = 'RELATIONSHIP_UNMEASURED';
  else if (M < THRESHOLD.M) verdict = 'RELATIONSHIP_BLOCKED';
  else if (S === null) verdict = 'PROCEDURE_UNMEASURED';
  else if (S < THRESHOLD.S) verdict = 'PROCEDURE_BLOCKED';
  else verdict = 'SECURE';

  const mathematics_deficit_claim =
    verdict === 'LANGUAGE_BLOCKED' || verdict === 'LANGUAGE_UNMEASURED' ? 'NOT_SUPPORTED'
    : verdict === 'RELATIONSHIP_BLOCKED' ? 'SUPPORTED_RELATIONSHIP'
    : verdict === 'PROCEDURE_BLOCKED' ? 'SUPPORTED_PROCEDURE'
    : 'NOT_CLAIMED';

  return {
    verdict,
    L, M, S,
    P_solve: product.P_solve,
    computable: product.computable,
    unmeasured: product.unmeasured,
    discarded_measurements: discarded,
    answer_correct,
    mathematics_deficit_claim,
    evidence_notes,
    next_action: NEXT_ACTION[verdict],
    teaching_target: TEACHING_TARGET[verdict]
  };
}

const NEXT_ACTION = Object.freeze({
  LANGUAGE_UNMEASURED: 'Collect a restatement in the learner\'s own words. Write no score until it exists.',
  LANGUAGE_BLOCKED: 'Clear the open word blockers, then re-present the SAME problem in language-controlled form. Do not reteach the mathematics yet — it has not been shown to be the problem.',
  RELATIONSHIP_UNMEASURED: 'Present the language-controlled form and ask the learner to name the relationship before calculating.',
  RELATIONSHIP_BLOCKED: 'Teach the relationship with two contrasting cases, one of each direction. The sentence is already understood.',
  PROCEDURE_UNMEASURED: 'Give the bare computation alone, with the relationship supplied.',
  PROCEDURE_BLOCKED: 'Practise the computation only. The learner already reads the problem and knows what it is asking.',
  SECURE: 'Move to transfer: the same relationship in an unfamiliar surface.'
});

const TEACHING_TARGET = Object.freeze({
  LANGUAGE_UNMEASURED: 'unknown — measure first',
  LANGUAGE_BLOCKED: 'the sentence',
  RELATIONSHIP_UNMEASURED: 'unknown — measure under control',
  RELATIONSHIP_BLOCKED: 'the relationship',
  PROCEDURE_UNMEASURED: 'unknown — measure bare',
  PROCEDURE_BLOCKED: 'the procedure',
  SECURE: 'transfer'
});

/** Convenience: run the whole separation for one attempt. */
export function separateLoads({ source, cards, learner_restatement, structure, attempt = {} }) {
  const language = measureLanguageLoad({ source, cards, learner_restatement });
  const controlled = Boolean(attempt.controlled);
  const mathematical = {
    ...measureMathematicalLoad({
      relation_stated: attempt.relation_stated ?? null,
      relation_expected: structure?.relation ?? null,
      controlled
    }),
    controlled_measurement: controlled
  };
  const procedure = {
    ...measureProcedure({
      steps_attempted: attempt.steps_attempted ?? null,
      steps_correct: attempt.steps_correct ?? null
    }),
    controlled_measurement: Boolean(attempt.bare_computation)
  };
  return {
    language, mathematical, procedure,
    controlled_form: structure ? languageControlledForm(structure) : null,
    diagnosis: diagnose({ language, mathematical, procedure, answer_correct: attempt.answer_correct ?? null })
  };
}
