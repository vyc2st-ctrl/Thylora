// SIX UNDERSTANDING ENGINE · QUESTION ROUTING
// Workroom: WR-SIXENGINE-001
//
// The engine is no longer limited to curriculum concepts. Anything a learner
// asks enters here. Routing decides what KIND of question it is, because the
// kind decides what an honest answer is allowed to look like.
//
// A settled fact and a contested history are not answered the same way, and
// neither is answered the way a value question is. Routing the question wrongly
// is how an engine ends up stating a dispute as a fact, or treating a child's
// question about their own family as a general knowledge lookup.

export const QUESTION_CLASSES = Object.freeze({
  DEFINITIONAL: {
    label: 'what a word or term means',
    stages: ['MEANING', 'KNOWLEDGE', 'EXPLAIN', 'TRANSFER', 'NEXT_QUESTION'],
    answer_contract: 'the job the term does, in context, with an example and a non-example',
    min_independent_lines: 1
  },
  FACTUAL_SETTLED: {
    label: 'a fact with a settled answer',
    stages: ['MEANING', 'KNOWLEDGE', 'EVIDENCE', 'EXPLAIN', 'TRANSFER', 'NEXT_QUESTION'],
    answer_contract: 'the answer, plus what it rests on',
    min_independent_lines: 2
  },
  CONCEPTUAL_MECHANISM: {
    label: 'why or how something works',
    stages: ['MEANING', 'PREREQUISITES', 'KNOWLEDGE', 'EVIDENCE', 'CONNECTIONS', 'EXPLAIN', 'TRANSFER', 'NEXT_QUESTION'],
    answer_contract: 'the mechanism, not the label — the learner must be able to run it forward on a new case',
    min_independent_lines: 1
  },
  PROCEDURAL: {
    label: 'how to do something',
    stages: ['MEANING', 'PREREQUISITES', 'KNOWLEDGE', 'EXPLAIN', 'TRANSFER', 'NEXT_QUESTION'],
    answer_contract: 'the steps, the reason for each, and the check that tells you it worked',
    min_independent_lines: 1
  },
  MATH_WORD_PROBLEM: {
    label: 'a mathematics problem wrapped in a sentence',
    // No KNOWLEDGE or EVIDENCE stage: the answer to a word problem is the load
    // diagnosis, not a weighing of sources.
    stages: ['MEANING', 'LOAD_SEPARATION', 'PREREQUISITES', 'EXPLAIN', 'TRANSFER', 'NEXT_QUESTION'],
    answer_contract: 'language load and mathematical load reported separately, never as one score',
    min_independent_lines: 0
  },
  CONTESTED_RECORD: {
    label: 'a question the field is split on, or where the record is incomplete',
    stages: ['MEANING', 'PREREQUISITES', 'KNOWLEDGE', 'EVIDENCE', 'CONNECTIONS', 'EXPLAIN', 'TRANSFER', 'NEXT_QUESTION'],
    answer_contract: 'every position with its evidence and its standing, the gaps in the record named, and what would settle it',
    min_independent_lines: 1,
    requires_contest_report: true
  },
  OPEN_RESEARCH: {
    label: 'nobody currently knows',
    stages: ['MEANING', 'KNOWLEDGE', 'EVIDENCE', 'EXPLAIN', 'NEXT_QUESTION'],
    answer_contract: 'what is known around the edge of it, why it is open, and what would close it',
    min_independent_lines: 0
  },
  VALUE_JUDGEMENT: {
    label: 'what someone should do, or what is right',
    stages: ['MEANING', 'KNOWLEDGE', 'EVIDENCE', 'EXPLAIN', 'NEXT_QUESTION'],
    answer_contract: 'the facts separated from the values, the values named as values, and the choice left with the person',
    min_independent_lines: 0
  },
  PERSONAL_RECORD: {
    label: "about this learner's own life, family or records",
    stages: ['MEANING', 'KNOWLEDGE', 'EVIDENCE', 'EXPLAIN', 'NEXT_QUESTION'],
    answer_contract: 'only what the backend actually holds, with its provenance — never filled in from general knowledge',
    min_independent_lines: 1,
    backend_only: true
  },
  MALFORMED: {
    label: 'the question assumes something not established',
    stages: ['MEANING', 'EXPLAIN', 'NEXT_QUESTION'],
    answer_contract: 'name the assumption, say what would have to be settled first, offer the repaired question',
    min_independent_lines: 0
  },
  SAFETY_GATED: {
    label: 'medical, legal, financial or safety consequence for a child',
    stages: ['MEANING', 'EXPLAIN'],
    answer_contract: 'general understanding only, routed to a named adult before anything actionable',
    min_independent_lines: 0,
    gate: 'GUARDIAN'
  }
});

const SIGNALS = Object.freeze([
  { cls: 'SAFETY_GATED', weight: 10, patterns: [/\b(should i take|dose|dosage|overdose|self[- ]harm|hurt myself|suicid)/i,
      /\b(is it safe to (eat|drink|take|mix))\b/i, /\b(sue|lawsuit|arrested|deportation)\b/i,
      /\b(my (mum|mom|dad|parent).*(hit|hurt|drink))\b/i, /\b(invest|loan|my savings|my account number)\b/i] },
  { cls: 'MATH_WORD_PROBLEM', weight: 6, patterns: [/\bhow many\b.*\?/i, /\bhow much\b.*\?/i, /\baltogether\b/i,
      /\beach\b.*\bhow\b/i, /\d+\b.*\b(more|less|fewer|times|share|split|per)\b/i, /\bwhat is the (total|difference|product|mean)\b/i] },
  { cls: 'DEFINITIONAL', weight: 5, patterns: [/^what (is|are|does) .{0,40}\bmean\b/i, /\bwhat does .* mean\b/i,
      /^what is an? [a-z ]+\??$/i, /\bdefine\b/i] },
  { cls: 'PROCEDURAL', weight: 5, patterns: [/^how do (i|you|we)\b/i, /^how to\b/i, /\bsteps? to\b/i, /\bhow is .* made\b/i] },
  { cls: 'CONCEPTUAL_MECHANISM', weight: 4, patterns: [/^why\b/i, /\bhow does .* work\b/i, /\bwhat causes\b/i,
      /\bwhat makes .* happen\b/i, /\bhow come\b/i] },
  { cls: 'CONTESTED_RECORD', weight: 6, patterns: [/\b(disputed|contested|controvers)/i, /\breally\b.*\?/i,
      /\bis it true that\b/i, /\bwhy do (some|people) say\b/i, /\bhidden\b/i, /\bsuppressed\b/i, /\bcovered up\b/i,
      /\b(who|what) (was|were) .* (really|actually)\b/i, /\bwhat do historians (say|think|disagree)/i,
      /\bthe (real|true) (cause|reason|story|history|origin|account)\b/i, /\bwhat (really|actually) happened\b/i,
      /\bleft out of\b/i, /\bwhose (account|version|side)\b/i,
      /\bevidence (for|against)\b/i, /\bancestry|lineage|descend/i] },
  { cls: 'OPEN_RESEARCH', weight: 6, patterns: [/\b(do we know|does anyone know|has anyone (proved|proven|found))\b/i,
      /\bunsolved\b/i, /\bwill we ever\b/i, /\bwhat happens (after|before) (death|the universe)/i] },
  { cls: 'VALUE_JUDGEMENT', weight: 6, patterns: [/\bshould (i|we|they|people)\b/i, /\bis it (right|wrong|fair|ok|okay)\b/i,
      /\bbetter (to|than)\b.*\?/i, /\bwho deserves\b/i] },
  { cls: 'PERSONAL_RECORD', weight: 7, patterns: [/\bmy (family|grandmother|grandfather|mum|mom|dad|surname|last name|birthday|passport)\b/i,
      /\bour family\b/i, /\bwhere (am|was) i (from|born)\b/i, /\bwho (am|was) my\b/i] },
  { cls: 'FACTUAL_SETTLED', weight: 3, patterns: [/^(who|what|when|where|which)\b/i, /\bhow (many|far|old|long|tall|hot)\b/i] }
]);

const PRESUPPOSITION_PATTERNS = Object.freeze([
  { pattern: /\bwhy (did|do|does|is|are) .*\b(always|never|all)\b/i, assumption: 'that it always or never happens' },
  { pattern: /\bwhen did .* stop\b/i, assumption: 'that it was happening, and that it stopped' },
  { pattern: /\bwhy (is|are) .* (better|worse) than\b/i, assumption: 'that the comparison already holds' },
  { pattern: /\bwho really (invented|discovered|built)\b/i, assumption: 'that a single person did it' }
]);

/**
 * Route a question.
 *
 * Returns the class, the alternates it was close to, and the resolution profile
 * the pipeline must then honour. Close calls are reported, not hidden: a
 * question sitting between CONTESTED_RECORD and FACTUAL_SETTLED is routed to
 * the more careful of the two (FM-04).
 */
export function routeQuestion(text, { learner = {}, domain = null, force_class = null } = {}) {
  const q = String(text ?? '').trim();
  if (!q) throw new Error('routeQuestion requires a question');

  if (force_class) {
    if (!QUESTION_CLASSES[force_class]) throw new Error(`Unknown question class: ${force_class}`);
    return buildRoute(q, force_class, [], { forced: true, learner, domain });
  }

  const scores = new Map();
  for (const sig of SIGNALS) {
    for (const p of sig.patterns) {
      if (p.test(q)) scores.set(sig.cls, (scores.get(sig.cls) ?? 0) + sig.weight);
    }
  }
  if (domain === 'math' && /\d/.test(q)) scores.set('MATH_WORD_PROBLEM', (scores.get('MATH_WORD_PROBLEM') ?? 0) + 3);

  // "How many moons does Jupiter have?" is a lookup, not a word problem. A word
  // problem needs quantities to operate on: a number in the text, or a word
  // that names a quantity relation.
  if (scores.has('MATH_WORD_PROBLEM')) {
    const hasQuantity = /\d/.test(q) || /\b(each|altogether|share[ds]?|split|left over|per|apiece|more than|less than|fewer than|twice|half of|total of)\b/i.test(q);
    if (!hasQuantity) scores.delete('MATH_WORD_PROBLEM');
  }

  const presupposition = PRESUPPOSITION_PATTERNS.find(p => p.pattern.test(q)) ?? null;

  const ranked = [...scores.entries()].sort((a, b) => b[1] - a[1]);
  let chosen = ranked[0]?.[0] ?? 'FACTUAL_SETTLED';
  const alternates = ranked.slice(1, 3).map(([cls, score]) => ({ cls, score }));

  // Safety always wins, whatever else matched.
  if (scores.has('SAFETY_GATED')) chosen = 'SAFETY_GATED';
  // A near tie between a settled reading and a contested one takes the
  // contested one. Over-caution costs a paragraph; under-caution teaches a
  // dispute as a fact.
  else if (chosen === 'FACTUAL_SETTLED' && (scores.get('CONTESTED_RECORD') ?? 0) >= (scores.get('FACTUAL_SETTLED') ?? 0) - 1 && scores.has('CONTESTED_RECORD')) {
    chosen = 'CONTESTED_RECORD';
  }

  return buildRoute(q, chosen, alternates, { presupposition, learner, domain, scores: Object.fromEntries(scores) });
}

function buildRoute(question, cls, alternates, ctx) {
  const profile = QUESTION_CLASSES[cls];
  const presupposition = ctx.presupposition ?? null;
  const effective = presupposition && cls !== 'SAFETY_GATED' ? 'MALFORMED' : cls;
  const effectiveProfile = QUESTION_CLASSES[effective];

  return {
    question,
    class: effective,
    original_class: cls,
    label: effectiveProfile.label,
    alternates,
    forced: Boolean(ctx.forced),
    presupposition: presupposition
      ? { assumption: presupposition.assumption, repair: `Establish first whether ${presupposition.assumption} holds, then ask the question again.` }
      : null,
    stages: effectiveProfile.stages,
    answer_contract: effectiveProfile.answer_contract,
    min_independent_lines: effectiveProfile.min_independent_lines,
    gate: effectiveProfile.gate ?? null,
    backend_only: Boolean(effectiveProfile.backend_only),
    requires_contest_report: Boolean(effectiveProfile.requires_contest_report),
    scores: ctx.scores ?? {}
  };
}
