// THYLORA · concept cards and Understanding Cards
// Workroom: WR-MATH-SURFACE-001
//
// Two different objects, often confused:
//
//   CONCEPT CARD        teaching material. One per word. It exists before any
//                       learner arrives and says the same thing to everybody.
//
//   UNDERSTANDING CARD  a record. One per learner per sitting. It says what was
//                       watched, what was not watched, and what may therefore
//                       not be claimed. It carries the child's own words about
//                       the answer, preserved verbatim.
//
// An Understanding Card that reports a P_solve without reporting which layers
// went unmeasured is a card that lies by omission, so the unmeasured list is a
// required field and the integrity check refuses a card without it.

import { VOCABULARY, WORD_FAMILIES, lookup, languageLoad } from './language.js';
import { WORKED_EXAMPLES, examplesForWord, isolationsOf } from './examples.js';
import {
  LAYERS, LAYER_NAMES, LAYER_QUESTIONS, EVIDENCE, MODEL,
  factorsFrom, solveProbability, diagnose, expressionFor, claimSupported, CLAIMS
} from './understanding.js';

// ---------------------------------------------------------------------------
// Concept cards
// ---------------------------------------------------------------------------

/**
 * A concept card carries the three layers of one word explicitly. The
 * mathematics is on the front of the card, not behind it: the equation, the
 * relationship the word signals, and the load the word adds to a sentence.
 */
export function conceptCard(word) {
  const entry = lookup(word);
  if (!entry) return null;
  const examples = examplesForWord(entry.word);
  return Object.freeze({
    kind: 'CONCEPT_CARD',
    id: `CC-${entry.word.replace(/\s+/g, '-').toUpperCase()}`,
    word: entry.word,
    family: entry.family,
    family_label: WORD_FAMILIES[entry.family],
    equation: MODEL.equation,
    layers: Object.freeze({
      L: Object.freeze({
        question: LAYER_QUESTIONS.L,
        content: entry.plain,
        probe: entry.probe.ask,
        misread: entry.common_misread,
        why_it_misleads: entry.why_it_misleads
      }),
      M: Object.freeze({
        question: LAYER_QUESTIONS.M,
        content: entry.relationship,
        notation: entry.notation
      }),
      S: Object.freeze({
        question: LAYER_QUESTIONS.S,
        content: `Once the relationship is named, the procedure is ${entry.notation}. It is the smallest part of this card on purpose.`
      })
    }),
    surface_forms: entry.surface_forms,
    worked_examples: Object.freeze(examples.map(e => e.id)),
    hard_rule: MODEL.hard_rule,
    footer: 'A learner who misses this word has a language result, not a mathematics result.'
  });
}

export function conceptCards() {
  return Object.freeze(VOCABULARY.map(e => conceptCard(e.word)));
}

/** A concept card for a whole worked example, showing all four isolations. */
export function exampleCard(example) {
  const load = languageLoad(example.story);
  return Object.freeze({
    kind: 'EXAMPLE_CARD',
    id: `EC-${example.id}`,
    example_id: example.id,
    title: example.title,
    band: example.band,
    story: example.story,
    word_focus: example.word_focus,
    language_load: load,
    equation: MODEL.equation,
    isolations: isolationsOf(example),
    answer_in_story: example.answer_in_story,
    expected_failure_mode: example.expected_failure_mode
  });
}

export function exampleCards() {
  return Object.freeze(WORKED_EXAMPLES.map(exampleCard));
}

// ---------------------------------------------------------------------------
// Understanding Cards
// ---------------------------------------------------------------------------

let sequence = 0;

/**
 * Build the record of one sitting.
 *
 * @param {object} input
 * @param {string} input.learner_ref      an opaque reference, never a legal identity
 * @param {object} input.example          the worked example that was run
 * @param {object[]} input.observations   from understanding.observe()
 * @param {string} input.explain_back     the child's own words, preserved verbatim
 * @param {string} [input.recorded_by]
 * @param {string} [input.at]             ISO timestamp
 */
export function buildUnderstandingCard({
  learner_ref, example, observations = [], explain_back = '', recorded_by = null, at = null, id = null
}) {
  if (!learner_ref) throw new TypeError('an Understanding Card needs a learner reference');
  if (!example || !example.id) throw new TypeError('an Understanding Card needs the example it was taken on');

  const read = diagnose(observations);
  const factors = read.factors;
  const timestamp = at ?? new Date().toISOString();
  sequence += 1;

  const layerRows = LAYERS.map(layer => {
    const f = factors[layer];
    return Object.freeze({
      layer,
      name: LAYER_NAMES[layer],
      question: LAYER_QUESTIONS[layer],
      evidence: f.evidence,
      isolated: f.admissible,
      value: f.value,
      attempted: f.attempted,
      reported_as: f.evidence === EVIDENCE.OBSERVED
        ? `${LAYER_NAMES[layer]} = ${format(f.value)} on ${f.attempted} isolated item(s)`
        : f.evidence === EVIDENCE.NOT_ISOLATED
          ? `${LAYER_NAMES[layer]} was seen only inside the mixed problem. Not measured.`
          : `${LAYER_NAMES[layer]} was not measured.`
    });
  });

  const unmeasured = layerRows.filter(r => !r.isolated).map(r => r.layer);

  return Object.freeze({
    kind: 'UNDERSTANDING_CARD',
    id: id ?? `UC-${timestamp.slice(0, 10).replace(/-/g, '')}-${String(sequence).padStart(4, '0')}`,
    version: 1,
    supersedes: null,
    learner_ref,
    example_id: example.id,
    example_title: example.title,
    word_focus: example.word_focus,
    recorded_by,
    at: timestamp,

    equation: MODEL.equation,
    expression: expressionFor(factors),
    layers: Object.freeze(layerRows),

    p_solve: Object.freeze({
      value: read.p_solve.value,
      determined: read.p_solve.determined,
      reason: read.p_solve.reason,
      bounds: read.p_solve.bounds,
      shown_as: read.p_solve.determined
        ? `P_solve = ${format(read.p_solve.value)}`
        : `P_solve is between ${format(read.p_solve.bounds.low)} and ${format(read.p_solve.bounds.high)} — not enough isolated evidence to state it.`
    }),

    // Required field. A card without it is refused by cardIntegrity().
    not_measured: Object.freeze(unmeasured),
    not_measured_statement: unmeasured.length === 0
      ? 'All three layers were measured in isolation.'
      : `Not measured in isolation: ${unmeasured.map(l => LAYER_NAMES[l]).join(', ')}. Nothing on this card may be read as a statement about ${unmeasured.length === 1 ? 'that layer' : 'those layers'}.`,

    refused_claims: read.refused_claims,
    permitted_claims: read.permitted_claims,
    binding_constraint: read.binding_constraint,
    headline: read.headline,
    next_actions: read.next_actions,

    // The child's own words, preserved. Not summarised, not corrected.
    explain_back: Object.freeze({
      child_words: String(explain_back ?? ''),
      present: String(explain_back ?? '').trim().length > 0,
      rule: 'Preserved as said. Interpretation is added elsewhere; it does not overwrite this.'
    }),

    language_load: languageLoad(example.story)
  });
}

/**
 * A correction never edits a card. It writes the next version and points back.
 * The original stays readable, which is the same rule the family story archive
 * runs on.
 */
export function superseding(card, changes = {}) {
  return Object.freeze({
    ...card,
    ...changes,
    id: `${card.id}-v${card.version + 1}`,
    version: card.version + 1,
    supersedes: card.id,
    at: changes.at ?? new Date().toISOString()
  });
}

/**
 * Refuse a card that reports a number without reporting what was not measured,
 * or that carries a claim the evidence does not support.
 */
export function cardIntegrity(card) {
  const problems = [];
  if (card.kind !== 'UNDERSTANDING_CARD') problems.push('not an Understanding Card');
  if (!Array.isArray(card.not_measured)) problems.push('missing the not_measured field');
  if (!card.expression) problems.push('missing the written equation');
  if (!card.not_measured_statement) problems.push('missing the plain statement of what was not measured');

  const observed = new Set(card.layers.filter(l => l.isolated).map(l => l.layer));
  for (const claim of card.permitted_claims ?? []) {
    if (claim.claim === CLAIMS.MATH_DEFICIT && !observed.has('M')) {
      problems.push('claims a mathematics deficit without an isolated measurement of the relationship layer');
    }
    if (claim.claim === CLAIMS.PROCEDURE_DEFICIT && !observed.has('S')) {
      problems.push('claims a procedure deficit without an isolated measurement of the solve layer');
    }
  }
  if (card.p_solve?.determined === false && typeof card.p_solve?.value === 'number') {
    problems.push('reports a value for an undetermined P_solve');
  }
  return Object.freeze({ ok: problems.length === 0, problems: Object.freeze(problems) });
}

/** What the family page says about a card, in ordinary language. */
export function familyReading(card) {
  const lang = card.layers.find(l => l.layer === 'L');
  const math = card.layers.find(l => l.layer === 'M');
  const lines = [];

  if (lang.isolated && lang.value === 0) {
    lines.push('The sentence was the thing in the way.');
    if (math.isolated) {
      lines.push(math.value >= 0.6
        ? 'When we took the words off, the mathematics was there.'
        : 'With the words off, the relationship needs work too — and now we know that separately.');
    } else {
      lines.push('We have not yet looked at the mathematics with the words off, so we are not going to tell you anything about it. That check is the next thing we do.');
    }
  } else if (!lang.isolated) {
    lines.push('We have not checked the reading layer on its own yet, so a wrong answer here does not yet tell us why.');
  } else {
    lines.push(`The sentence came through at ${format(lang.value)}.`);
  }

  lines.push(card.not_measured_statement);
  if (card.explain_back.present) lines.push(`In their own words: “${card.explain_back.child_words}”`);
  return Object.freeze(lines);
}

function format(value) {
  if (value === null || value === undefined) return '?';
  if (typeof value === 'boolean') return value ? 'yes' : 'no';
  return Number.isInteger(value) ? String(value) : String(Number(Number(value).toFixed(3)));
}

export const CARD_RULES = Object.freeze({
  id: 'THY-MATH-CARDS-001',
  required_fields: Object.freeze(['expression', 'not_measured', 'not_measured_statement', 'refused_claims', 'explain_back']),
  rule: 'A card reports what was measured, what was not, and what therefore may not be said. Corrections supersede; they do not overwrite.'
});
