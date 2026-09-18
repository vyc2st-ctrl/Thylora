// THYLORA · store product candidates
// Workroom: WR-MATH-SURFACE-001
//
// CANDIDATES. Nothing here is listed, priced, published or offered.
//
// A candidate exists so the commercial question is asked at the same time as
// the build, rather than bolted on later by somebody who never saw the model.
// Each one names what it contains, what it is built from, and — the field that
// matters — what it refuses to claim. Every candidate carries the standing
// release blocker until the Chairman lifts it.

import { VOCABULARY } from './language.js';
import { WORKED_EXAMPLES } from './examples.js';
import { MODEL } from './understanding.js';

export const CANDIDATE_STATUS = 'CANDIDATE';

/** Blockers that apply to every candidate in this lane, without exception. */
export const STANDING_BLOCKERS = Object.freeze([
  Object.freeze({ code: 'CHAIRMAN_RELEASE_NOT_GIVEN', detail: 'This lane was built under "no publishing". Nothing leaves candidate state without an explicit release.' }),
  Object.freeze({ code: 'PRICING_NOT_SET', detail: 'No price, no margin, no cost of goods has been established for any item here.' })
]);

function candidate(fields) {
  const blockers = [...STANDING_BLOCKERS, ...(fields.blockers ?? [])];
  return Object.freeze({
    kind: 'STORE_PRODUCT_CANDIDATE',
    status: CANDIDATE_STATUS,
    publishable: false,
    listed: false,
    ...fields,
    contains: Object.freeze(fields.contains),
    built_from: Object.freeze(fields.built_from),
    does_not_claim: Object.freeze(fields.does_not_claim),
    blockers: Object.freeze(blockers.map(Object.freeze))
  });
}

const NO_DIAGNOSIS_CLAIM = 'This is not a diagnostic instrument, an assessment of ability, or a substitute for a professional evaluation. It reports what was observed in three separately measured layers and says plainly what was not observed.';
const NO_OUTCOME_CLAIM = 'No claim is made that using it raises a test score.';

export const STORE_CANDIDATES = Object.freeze([
  candidate({
    id: 'SPC-MATH-001',
    title: 'The Ten Words — concept card set',
    form: 'PRINT_OR_EDF_CARD_SET',
    audience: 'LEARNER_AND_TEACHER',
    summary: 'One card per word that decides whether a word problem can be read: remain, difference, per, between, at least, at most, respectively, estimate, compare, rate.',
    contains: [
      `${VOCABULARY.length} concept cards, each carrying the three layers explicitly`,
      'the common misread and why it is a reasonable mistake',
      'the relationship the word signals, in notation',
      `the equation ${MODEL.equation} printed on every card`
    ],
    built_from: ['math-surface/lib/language.js', 'math-surface/lib/cards.js'],
    does_not_claim: [NO_DIAGNOSIS_CLAIM, NO_OUTCOME_CLAIM],
    blockers: [{ code: 'IMAGERY_NOT_COMMISSIONED', detail: 'A print set needs approved THYLORA imagery. No imagery was produced in this delta.' }]
  }),

  candidate({
    id: 'SPC-MATH-002',
    title: 'Four Isolations — worked example deck',
    form: 'PRINT_OR_EDF_CARD_SET',
    audience: 'TEACHER',
    summary: 'Twelve word problems, each printed four times: language alone, relationship alone, procedure alone, and the child explaining the result back.',
    contains: [
      `${WORKED_EXAMPLES.length} worked examples`,
      'the expected failure mode for each, named in advance',
      'the language load of each sentence, shown as a number',
      'accept and reject responses for every probe'
    ],
    built_from: ['math-surface/lib/examples.js'],
    does_not_claim: [NO_DIAGNOSIS_CLAIM, 'No claim is made that twelve examples cover a curriculum.'],
    blockers: [{ code: 'CURRICULUM_MAPPING_ABSENT', detail: 'The set is not yet mapped to any national or state sequence.' }]
  }),

  candidate({
    id: 'SPC-MATH-003',
    title: 'Understanding Cards — record book',
    form: 'PHYSICAL_RECORD_BOOK_OR_DIGITAL',
    audience: 'FAMILY_AND_TEACHER',
    summary: 'The record of what was actually watched in one sitting, including the child\'s own words and a printed statement of what was not measured.',
    contains: [
      'one card per sitting, append-only',
      'the written equation with the measured factors filled in',
      'the required "not measured" statement',
      'the refused claims, printed rather than omitted',
      'the child\'s explain-back preserved verbatim'
    ],
    built_from: ['math-surface/lib/cards.js', 'math-surface/lib/persistence.js'],
    does_not_claim: [NO_DIAGNOSIS_CLAIM, 'A card is not a grade and does not convert into one.'],
    blockers: [{ code: 'CHILD_DATA_POLICY_UNRESOLVED', detail: 'A record book carrying a child\'s words needs the family data position resolved first: who holds it, who can read it, and what leaving does.' }]
  }),

  candidate({
    id: 'SPC-MATH-004',
    title: 'Three Layers — family kit',
    form: 'FAMILY_KIT',
    audience: 'FAMILY',
    summary: 'For the parent who has been told their child is behind in mathematics and has never been told which of three completely different things went wrong.',
    contains: [
      'the one-page explanation of L × M × S',
      'the twelve examples in a version a family can run at a kitchen table',
      'what to ask the school, written out',
      'the sentence a family is entitled to refuse: "they lack the mathematics", when nobody measured it'
    ],
    built_from: ['math-surface/family.html', 'math-surface/lib/understanding.js'],
    does_not_claim: [NO_DIAGNOSIS_CLAIM, 'It does not position a family against a teacher.'],
    blockers: []
  }),

  candidate({
    id: 'SPC-MATH-005',
    title: 'Isolation probe sheets — teacher pack',
    form: 'TEACHER_PACK',
    audience: 'TEACHER',
    summary: 'Printable probes that measure one layer at a time, with the admissibility rule on every sheet.',
    contains: [
      'language probes containing no numbers and no operators',
      'relationship probes with the quantities already extracted',
      'bare computation sheets with no words',
      'the lift-gain table: what raising each layer actually returns'
    ],
    built_from: ['math-surface/lib/language.js', 'math-surface/lib/understanding.js', 'math-surface/teacher.html'],
    does_not_claim: [NO_DIAGNOSIS_CLAIM, 'The pack does not rank learners against each other.'],
    blockers: [{ code: 'SCHOOL_TERMS_UNRESOLVED', detail: 'Institutional licensing terms are not drafted.' }]
  }),

  candidate({
    id: 'SPC-MATH-006',
    title: 'A wrong answer has at least three causes',
    form: 'EDF_EDITION',
    audience: 'GENERAL',
    summary: 'The argument in full: why P_solve = L × M × S, why a zero language factor tells you nothing about the mathematics, and what a school system loses by collapsing the three into one mark.',
    contains: [
      'READ — the written edition',
      'HEAR — a narrated edition',
      'EXPLORE — the model as a working surface, with the numbers live',
      'the worked examples as evidence'
    ],
    built_from: ['docs/THY-MATH-UNDERSTANDING.md', 'math-surface/'],
    does_not_claim: ['It does not present the model as established educational research. It presents it as THYLORA\'s position, with its reasoning exposed.'],
    blockers: [{ code: 'NARRATION_NOT_PRODUCED', detail: 'The HEAR edition needs production; none was made in this delta.' }]
  }),

  candidate({
    id: 'SPC-MATH-007',
    title: 'Language Load Ruler',
    form: 'SINGLE_CARD_TOOL',
    audience: 'TEACHER',
    summary: 'One card that scores how heavy a sentence is before a learner meets it: registry words, edge-sensitive words, sentence length.',
    contains: [
      'the load formula, printed',
      'the four bands: none, light, carried, heavy',
      'the ten registry words on the reverse'
    ],
    built_from: ['math-surface/lib/language.js'],
    does_not_claim: ['A load score is a property of a sentence, not of a learner.'],
    blockers: []
  }),

  candidate({
    id: 'SPC-MATH-008',
    title: 'Explain-Back Journal',
    form: 'PHYSICAL_JOURNAL',
    audience: 'LEARNER_AND_FAMILY',
    summary: 'A child\'s own words about what each answer meant, kept over time, unedited.',
    contains: [
      'one page per explain-back',
      'the source-preservation rule printed inside the cover',
      'space for a later layer that adds to the original without replacing it'
    ],
    built_from: ['math-surface/lib/cards.js', 'the Family Story archive layering rule'],
    does_not_claim: ['It is not marked, scored or corrected.'],
    blockers: [{ code: 'IMAGERY_NOT_COMMISSIONED', detail: 'No imagery was produced in this delta.' }]
  })
]);

export function candidateById(id) {
  return STORE_CANDIDATES.find(c => c.id === id) ?? null;
}

/**
 * The gate a candidate must clear to stop being a candidate.
 * It never returns an empty blocker list while the standing release blocker
 * stands, which is the point.
 */
export function publishGate(item) {
  const blockers = [...item.blockers];
  const problems = [];
  if (!item.does_not_claim || item.does_not_claim.length === 0) {
    problems.push('a candidate must state what it refuses to claim');
  }
  if (item.contains.length === 0) problems.push('a candidate must say what is inside it');
  return Object.freeze({
    id: item.id,
    releasable: false,
    blockers: Object.freeze(blockers),
    problems: Object.freeze(problems),
    statement: `${item.id} holds at CANDIDATE with ${blockers.length} blocker(s). Nothing in this lane is published.`
  });
}

export function candidateSummary() {
  return Object.freeze({
    id: 'THY-MATH-STORE-001',
    count: STORE_CANDIDATES.length,
    published: 0,
    listed: 0,
    all_blocked_by: STANDING_BLOCKERS[0].code,
    statement: `${STORE_CANDIDATES.length} store product candidates recorded. None published, none listed, none priced.`
  });
}
