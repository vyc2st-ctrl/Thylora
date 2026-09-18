// SIX UNDERSTANDING ENGINE · ADULT-TO-CHILD CONCEPT PARITY
// Workroom: WR-SIXENGINE-001
//
// Simplifying language is permitted. Simplifying the concept is not.
//
// The engine extracts the concept invariants from the adult statement —
// quantifiers, conditionals, negation, causal direction, comparison direction,
// units, scope, uncertainty, who holds a position — and requires every one of
// them to survive into the child-facing statement. Language friction must fall;
// invariant count must not.
//
// A simplification that drops "some", flips "because", loses a unit, or turns
// "most historians hold" into "it is a fact" is a parity violation and is
// refused. That refusal is the point: the Six get the real concept in reachable
// words, never a smaller concept in easy words.

export const INVARIANT_KINDS = Object.freeze([
  'QUANTIFIER', 'NEGATION', 'CONDITIONAL', 'CAUSAL_DIRECTION', 'COMPARISON_DIRECTION',
  'UNIT', 'SCOPE', 'UNCERTAINTY', 'POSITION_HOLDER', 'MULTI_STEP', 'TEMPORAL_ORDER'
]);

const DETECTORS = Object.freeze([
  { kind: 'QUANTIFIER', patterns: [/\ball\b/i, /\bevery\b/i, /\beach\b/i, /\bsome\b/i, /\bmost\b/i, /\bnone\b/i, /\bno\b(?!\w)/i, /\bat least\b/i, /\bat most\b/i, /\bper\b/i] },
  { kind: 'NEGATION', patterns: [/\bnot\b/i, /n't\b/i, /\bnever\b/i, /\bwithout\b/i, /\bneither\b/i, /\bno longer\b/i] },
  { kind: 'CONDITIONAL', patterns: [/\bif\b/i, /\bunless\b/i, /\bprovided\b/i, /\bwhen(ever)?\b/i, /\bonly when\b/i, /\bas long as\b/i] },
  { kind: 'CAUSAL_DIRECTION', patterns: [/\bbecause\b/i, /\btherefore\b/i, /\bcaused?\b/i, /\bas a result\b/i, /\bleads? to\b/i, /\bso that\b/i, /\bdue to\b/i, /(^|[.;,]\s*|\s)so\s/i, /\bthat is why\b/i, /\bmeant that\b/i] },
  { kind: 'COMPARISON_DIRECTION', patterns: [/\bmore than\b/i, /\bless than\b/i, /\bfewer than\b/i, /\bgreater than\b/i, /\btwice\b/i, /\bhalf as\b/i, /\bolder than\b/i, /\bbefore\b/i] },
  { kind: 'UNIT', patterns: [/\b\d+\s*(cm|m|km|kg|g|ml|l|%|degrees?|hours?|minutes?|days?|weeks?|years?|miles?|pounds?|dollars?|cents?)\b/i, /\bcubic\b/i, /\bper (hour|day|week|year|item|child|person)\b/i] },
  { kind: 'SCOPE', patterns: [/\bonly\b/i, /\bexcept\b/i, /\bapart from\b/i, /\bin (this|that) case\b/i, /\bunder\b.*\bconditions?\b/i] },
  { kind: 'UNCERTAINTY', patterns: [/\bmay\b/i, /\bmight\b/i, /\bprobably\b/i, /\blikely\b/i, /\bappears?\b/i, /\bsuggests?\b/i, /\bthought to\b/i, /\bdisputed\b/i, /\bcontested\b/i, /\bnot certain\b/i, /\bunclear\b/i] },
  { kind: 'POSITION_HOLDER', patterns: [/\bconsensus\b/i, /\baccording to\b/i, /\b(argues?|argued|claims?|holds?|reports?|thinks?|believes?|says?|said)\b/i, /\b(historians?|scientists?|scholars?|researchers?|witnesses?)\b/i] },
  { kind: 'MULTI_STEP', patterns: [/\bthen\b/i, /\bafter that\b/i, /\bfirst\b.*\bthen\b/i, /\bnext\b/i, /\bfinally\b/i] },
  { kind: 'TEMPORAL_ORDER', patterns: [/\bbefore\b/i, /\bafter\b/i, /\bduring\b/i, /\buntil\b/i, /\bby the time\b/i, /\bearlier\b/i, /\blater\b/i] }
]);

/** The load-bearing logic of a statement, independent of its wording. */
export function extractInvariants(text) {
  const found = [];
  for (const d of DETECTORS) {
    for (const p of d.patterns) {
      const m = String(text).match(p);
      if (m) { found.push({ kind: d.kind, token: m[0].toLowerCase().trim() }); break; }
    }
  }
  return found;
}

/**
 * Language friction: what the sentence costs to read, with no reference to
 * what it means. Falling friction is the only thing simplification may buy.
 */
export function languageFriction(text) {
  const raw = String(text).trim();
  const sentences = raw.split(/(?<=[.?!])\s+/).filter(Boolean);
  const words = raw.match(/[A-Za-z][A-Za-z'-]*/g) ?? [];
  const perSentence = words.length / Math.max(1, sentences.length);
  const longWords = words.filter(w => w.length >= 10).length;
  const clauseMarks = (raw.match(/,|;|\bwhich\b|\bthat\b|\bwhose\b|\bwhereby\b/gi) ?? []).length;
  const passive = (raw.match(/\b(was|were|is|are|been|being)\s+\w+(ed|en)\b/gi) ?? []).length;
  const nominalisation = words.filter(w => /(tion|ment|ance|ence|ity|ism)$/i.test(w)).length;
  const pronouns = (raw.match(/\b(it|they|them|this|that|those|these)\b/gi) ?? []).length;

  const score =
    perSentence * 0.40 +
    (longWords / Math.max(1, words.length)) * 26 +
    (clauseMarks / Math.max(1, sentences.length)) * 2.4 +
    passive * 2.2 +
    nominalisation * 1.5 +
    (pronouns / Math.max(1, sentences.length)) * 1.1;

  return {
    score: Number(score.toFixed(2)),
    words: words.length,
    sentences: sentences.length,
    words_per_sentence: Number(perSentence.toFixed(1)),
    long_words: longWords, clause_marks: clauseMarks, passive, nominalisation, pronouns
  };
}

export const PERMITTED_REDUCTIONS = Object.freeze([
  'shorter sentences', 'one idea per sentence', 'common word for rare word',
  'active voice for passive voice', 'name for pronoun', 'verb for nominalisation',
  'concrete example added', 'clause split out'
]);

export const FORBIDDEN_REDUCTIONS = Object.freeze([
  'dropping a quantifier', 'dropping a negation', 'dropping a condition',
  'reversing or removing a cause', 'reversing a comparison', 'dropping units',
  'collapsing a multi-step relation into one step', 'replacing a mechanism with a label',
  'presenting a contested position as settled', 'removing who holds the position',
  'removing stated uncertainty'
]);

/**
 * Parity check.
 *
 * pass requires BOTH:
 *   parity === 1      every concept invariant survived
 *   friction fell     the child-facing text is genuinely easier to read
 */
export function parityCheck(source, simplified) {
  const before = extractInvariants(source);
  const after = extractInvariants(simplified);
  const afterKinds = new Set(after.map(i => i.kind));

  const lost = before.filter(i => !afterKinds.has(i.kind));
  const preserved = before.filter(i => afterKinds.has(i.kind));
  const frictionBefore = languageFriction(source);
  const frictionAfter = languageFriction(simplified);

  const violations = lost.map(i => ({
    code: `PARITY_LOST_${i.kind}`,
    kind: i.kind,
    detail: `"${i.token}" carried ${i.kind.replace(/_/g, ' ').toLowerCase()} in the source and has no counterpart in the simplified text`,
    forbidden_reduction: forbiddenFor(i.kind)
  }));

  if (frictionAfter.score >= frictionBefore.score) {
    violations.push({
      code: 'PARITY_NO_FRICTION_RELIEF',
      kind: 'FRICTION',
      detail: `friction did not fall (${frictionBefore.score} → ${frictionAfter.score}); the rewrite costs the learner the same or more without buying anything`
    });
  }

  const parity = before.length === 0 ? 1 : Number((preserved.length / before.length).toFixed(2));
  return {
    parity,
    pass: parity === 1 && frictionAfter.score < frictionBefore.score,
    preserved: preserved.map(i => i.kind),
    lost: lost.map(i => i.kind),
    friction_before: frictionBefore.score,
    friction_after: frictionAfter.score,
    friction_relief: Number((frictionBefore.score - frictionAfter.score).toFixed(2)),
    violations
  };
}

function forbiddenFor(kind) {
  const map = {
    QUANTIFIER: 'dropping a quantifier',
    NEGATION: 'dropping a negation',
    CONDITIONAL: 'dropping a condition',
    CAUSAL_DIRECTION: 'reversing or removing a cause',
    COMPARISON_DIRECTION: 'reversing a comparison',
    UNIT: 'dropping units',
    MULTI_STEP: 'collapsing a multi-step relation into one step',
    UNCERTAINTY: 'removing stated uncertainty',
    POSITION_HOLDER: 'removing who holds the position',
    SCOPE: 'widening the scope of the claim'
  };
  return map[kind] ?? 'unnamed reduction';
}

/**
 * Build the child-facing statement and refuse to return one that fails parity.
 * `candidate` is supplied by the caller (model, author or template); this
 * function is the gate, not the writer.
 */
export function gateSimplification(source, candidate) {
  const check = parityCheck(source, candidate);
  if (check.pass) return { accepted: true, text: candidate, check };
  return {
    accepted: false,
    text: source,
    check,
    instruction: [
      'Rewrite again. Keep every one of these in the child-facing sentence:',
      ...check.lost.map(k => `  · ${k.replace(/_/g, ' ').toLowerCase()} (${forbiddenFor(k)})`),
      'Reduce only: ' + PERMITTED_REDUCTIONS.join(', ') + '.'
    ].join('\n')
  };
}
