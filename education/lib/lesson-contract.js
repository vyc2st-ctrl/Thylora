// THYLORA EDUCATION FACTORY · lesson-output contract
// Workroom: WR-EDU-FACTORY-001
//
// One contract for every child-facing piece: card, game round, episode
// companion, teacher ladder rung, worksheet. A piece that cannot fill all six
// sections does not ship. The contract adds no new canon: every section maps
// onto a field that already exists in the Understanding Engine backend
// (ue_concepts, ue_progression_bands, ue_safety_gates, ue_transfer_tests).
//
//   1. learns            what is learned              ue_concepts.what_it_is
//   2. visible_evidence  how we know, shown           ue_concepts.how_we_know / truth_state / what_remains_unknown
//   3. question          the question asked           ue_concepts.test_question
//   4. explain_back      learner teaches it back      ue_concepts.teach_back_challenge
//   5. transfer_test     use it somewhere new         ue_transfer_tests (criteria) + ue_concepts.real_world_application
//   6. gate              age / safety gate            band_min + safety_class + ue_safety_gates
//
// Validation fails closed: a missing or empty section is a failure, never a
// default.

export const CONTRACT_VERSION = 'THY-EDU-LESSON-CONTRACT-001/v1';

export const TRUTH_STATES = Object.freeze(['SUPPORTED', 'CONTESTED', 'UNCERTAIN', 'UNKNOWN']);

// UE-SPEC-G audiences.
export const EXPLAIN_AUDIENCES = Object.freeze([
  'YOUNGER_CHILD', 'PEER', 'ADULT_NON_EXPERT', 'EXPERT', 'SYSTEM_TUTOR'
]);

// UE-SPEC-F distances.
export const TRANSFER_DISTANCES = Object.freeze([
  'NEAR', 'MID', 'FAR', 'CROSS_DOMAIN', 'REAL_WORLD_LIVE'
]);

// Safety classes present on ue_concepts, with the gates each one must carry.
export const SAFETY_CLASSES = Object.freeze({
  GENERAL:                   { guardian_required: false, extra_gates: [] },
  GUARDIAN_CONTEXT:          { guardian_required: true,  extra_gates: [] },
  SAFETY_CRITICAL:           { guardian_required: true,  extra_gates: [] },
  REGULATED_ADVICE_BOUNDARY: { guardian_required: false, extra_gates: ['UE-GATE-ADVICE-BOUNDARY-001'] },
  SENSITIVE_HISTORY:         { guardian_required: false, extra_gates: ['UE-GATE-TRUTH-001'] }
});

// Every child-facing piece carries these LOCKED gates (ue_safety_gates).
export const CHILD_FACING_GATES = Object.freeze([
  'UE-GATE-TRUTH-001',
  'UE-GATE-CHILD-001',
  'UE-GATE-PRIVACY-001',
  'UE-GATE-QUESTION-DIGNITY-001'
]);

const BAND_PATTERN = /^UE-BAND-0[1-8]$/;

function blank(value) {
  return typeof value !== 'string' || value.trim() === '';
}

/**
 * Validate a lesson piece against the contract. Returns every problem, not
 * just the first, so an author sees the whole gap at once.
 */
export function validateLessonPiece(piece) {
  const problems = [];
  const add = (code, message) => problems.push({ code, message });
  const p = piece ?? {};

  if (p.contract_version !== CONTRACT_VERSION) add('CONTRACT_VERSION', `contract_version must be ${CONTRACT_VERSION}`);
  if (!Array.isArray(p.source_refs) || p.source_refs.length === 0) {
    add('SOURCE_REFS_MISSING', 'A piece must name the backend records it was built from. No source, no piece.');
  }

  // 1. learns
  if (blank(p.learns?.statement)) add('LEARNS_MISSING', 'State what is learned in one plain sentence.');

  // 2. visible_evidence
  const ev = p.visible_evidence ?? {};
  if (blank(ev.how_we_know)) add('EVIDENCE_MISSING', 'Show how we know it, and how close the evidence is to the thing itself.');
  if (!TRUTH_STATES.includes(ev.truth_state)) add('TRUTH_STATE_INVALID', `truth_state must be one of ${TRUTH_STATES.join(', ')}.`);
  if (blank(ev.what_remains_unknown)) {
    add('UNKNOWN_MISSING', 'what_remains_unknown may never be empty. If nothing is unknown it is not a concept yet.');
  }
  if (ev.truth_state === 'CONTESTED' && (!Array.isArray(ev.contested_positions) || ev.contested_positions.length < 2)) {
    add('CONTESTED_POSITIONS_MISSING', 'A contested claim must print at least two positions and the evidence for each.');
  }

  // 3. question
  if (blank(p.question?.text)) add('QUESTION_MISSING', 'Ask one question the learner must answer.');
  if (p.question && p.question.answer_supplied === true) {
    add('ANSWER_SUPPLIED', 'The piece supplies the answer to its own question. Give the next question, never the answer.');
  }

  // 4. explain_back
  if (blank(p.explain_back?.prompt)) add('EXPLAIN_BACK_MISSING', 'The learner must explain it back.');
  if (!EXPLAIN_AUDIENCES.includes(p.explain_back?.audience)) {
    add('EXPLAIN_AUDIENCE_INVALID', 'Name the audience: explaining to a younger child and to an expert are different tests.');
  }

  // 5. transfer_test
  const tr = p.transfer_test ?? {};
  if (blank(tr.situation)) add('TRANSFER_SITUATION_MISSING', 'Give a situation the concept was not taught in.');
  if (!TRANSFER_DISTANCES.includes(tr.distance)) add('TRANSFER_DISTANCE_INVALID', `distance must be one of ${TRANSFER_DISTANCES.join(', ')}.`);
  if (!Array.isArray(tr.success_criteria) || tr.success_criteria.filter(c => !blank(c)).length === 0) {
    add('TRANSFER_CRITERIA_MISSING', 'Success criteria are listed before the learner responds, checkable by a non-expert adult.');
  }
  if (!blank(tr.situation) && !blank(p.learns?.concept_title)
      && tr.situation.toLowerCase().includes(p.learns.concept_title.toLowerCase())) {
    add('TRANSFER_NAMES_CONCEPT', 'A transfer test must be solvable without the concept being named.');
  }

  // 6. gate
  const g = p.gate ?? {};
  if (!BAND_PATTERN.test(g.band_min ?? '')) add('BAND_INVALID', 'band_min must be a UE progression band (UE-BAND-01..08). Bands, not ages, decide what is offered.');
  const rule = SAFETY_CLASSES[g.safety_class];
  if (!rule) {
    add('SAFETY_CLASS_INVALID', `safety_class must be one of ${Object.keys(SAFETY_CLASSES).join(', ')}.`);
  } else {
    if (rule.guardian_required && g.guardian_required !== true) {
      add('GUARDIAN_REQUIRED', `${g.safety_class} content requires guardian_required = true.`);
    }
    const gates = Array.isArray(g.safety_gates) ? g.safety_gates : [];
    for (const code of [...CHILD_FACING_GATES, ...rule.extra_gates]) {
      if (!gates.includes(code)) add('GATE_MISSING', `Missing gate ${code}.`);
    }
  }
  // Age in years is a store-facing reference only (UE-SPEC-H). It must be
  // stated or explicitly withheld, never silently absent.
  if (g.age_reference === undefined) {
    add('AGE_REFERENCE_UNSTATED', 'State age_reference as {min,max} or null with age_reference_state CAPABILITY_BAND_ONLY.');
  } else if (g.age_reference === null && g.age_reference_state !== 'CAPABILITY_BAND_ONLY') {
    add('AGE_REFERENCE_UNSTATED', 'A null age_reference must say CAPABILITY_BAND_ONLY.');
  }

  return { valid: problems.length === 0, problems };
}

/**
 * Build a contract piece from one ue_concepts row, plus an optional
 * ue_transfer_tests-shaped record. Nothing is invented: a field the backend
 * does not hold stays empty and validation reports it.
 */
export function pieceFromUeConcept(concept, { transfer = null, explainAudience = 'YOUNGER_CHILD' } = {}) {
  const safety = SAFETY_CLASSES[concept.safety_class];
  return {
    contract_version: CONTRACT_VERSION,
    piece_code: `LESSON-${concept.concept_code}`,
    source_refs: [`ue_concepts:${concept.concept_code}`, ...(transfer?.ref ? [transfer.ref] : [])],
    learns: { concept_code: concept.concept_code, concept_title: concept.title, statement: concept.what_it_is },
    visible_evidence: {
      how_we_know: concept.how_we_know,
      truth_state: concept.truth_state,
      contested_positions: concept.contested_positions ?? [],
      what_remains_unknown: concept.what_remains_unknown,
      common_misunderstanding: concept.common_misunderstanding
    },
    question: { text: concept.test_question, answer_supplied: false },
    explain_back: { audience: explainAudience, prompt: concept.teach_back_challenge },
    transfer_test: {
      situation: transfer?.situation ?? concept.real_world_application ?? '',
      distance: transfer?.distance ?? 'REAL_WORLD_LIVE',
      success_criteria: transfer?.success_criteria ?? []
    },
    gate: {
      band_min: concept.band_min,
      safety_class: concept.safety_class,
      guardian_required: safety ? safety.guardian_required : true,
      safety_gates: [...CHILD_FACING_GATES, ...(safety ? safety.extra_gates : [])],
      age_reference: null,
      age_reference_state: 'CAPABILITY_BAND_ONLY'
    }
  };
}

// ---------------------------------------------------------------------------
// P = A × U × E × T × J
//
// FACTOR DEFINITIONS ARE PROPOSED, NOT CANON. No backend table or repo file
// defines this equation (searched 2026-09-24). The reading below is the working
// definition used in docs/EDUCATION-FACTORY.md until the Chairman confirms or
// replaces it. Multiplication, as in the mastery equation: a zero anywhere is
// a zero product.
// ---------------------------------------------------------------------------

export const P_FACTORS = Object.freeze({
  A: 'Age and safety gate clears (fail-closed gates satisfied for the audience)',
  U: 'Understanding is measurable (the piece carries learns, question, explain-back)',
  E: 'Evidence is visible (truth state, how we know, the honest unknown)',
  T: 'Transfer is testable (a new situation with criteria listed in advance)',
  J: 'Joy / pull (a child would choose to do it again; untested counts low)'
});
export const P_DEFINITION_STATE = 'PROPOSED_NOT_CANON';

export function scoreP(scores) {
  const keys = Object.keys(P_FACTORS);
  for (const k of keys) {
    const v = scores?.[k];
    if (!Number.isInteger(v) || v < 0 || v > 5) throw new RangeError(`${k} must be an integer 0-5`);
  }
  const raw = keys.reduce((acc, k) => acc * scores[k], 1);
  return {
    raw,
    normalized: Number((raw / 5 ** keys.length).toFixed(4)),
    zero_factors: keys.filter(k => scores[k] === 0),
    definition_state: P_DEFINITION_STATE
  };
}
