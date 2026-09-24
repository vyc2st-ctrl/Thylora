// EDUCATION FACTORY · lesson-output contract tests
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  CONTRACT_VERSION, CHILD_FACING_GATES, validateLessonPiece, pieceFromUeConcept, scoreP
} from '../education/lib/lesson-contract.js';

const { concepts } = JSON.parse(
  readFileSync(new URL('../education/fixtures/ue-concepts-general.json', import.meta.url), 'utf8')
);
const [pressure, lever] = concepts;
const codes = result => result.problems.map(p => p.code);

test('a seeded concept fills five of six sections from the backend alone', () => {
  const result = validateLessonPiece(pieceFromUeConcept(pressure));
  // The only gap is the one the backend really has: ue_transfer_tests is empty.
  assert.deepEqual(codes(result), ['TRANSFER_CRITERIA_MISSING']);
});

test('adding authored transfer criteria makes the piece pass', () => {
  const piece = pieceFromUeConcept(lever, {
    transfer: {
      ref: 'ue_transfer_tests:PENDING',
      situation: 'A door handle is hard to turn. Where on the handle should a small child push, and why?',
      distance: 'CROSS_DOMAIN',
      success_criteria: ['names the far end of the handle', 'says the hand moves further to turn it']
    }
  });
  assert.equal(validateLessonPiece(piece).valid, true);
});

test('an empty piece reports every missing section, not just the first', () => {
  const c = codes(validateLessonPiece({}));
  for (const code of ['CONTRACT_VERSION', 'SOURCE_REFS_MISSING', 'LEARNS_MISSING', 'EVIDENCE_MISSING',
    'UNKNOWN_MISSING', 'QUESTION_MISSING', 'EXPLAIN_BACK_MISSING', 'TRANSFER_SITUATION_MISSING',
    'TRANSFER_CRITERIA_MISSING', 'BAND_INVALID', 'SAFETY_CLASS_INVALID', 'AGE_REFERENCE_UNSTATED']) {
    assert.ok(c.includes(code), `expected ${code}`);
  }
});

test('the honest unknown may never be blank', () => {
  const piece = pieceFromUeConcept({ ...pressure, what_remains_unknown: '  ' });
  assert.ok(codes(validateLessonPiece(piece)).includes('UNKNOWN_MISSING'));
});

test('a contested claim must print at least two positions', () => {
  const piece = pieceFromUeConcept({ ...pressure, truth_state: 'CONTESTED', contested_positions: ['one side'] });
  assert.ok(codes(validateLessonPiece(piece)).includes('CONTESTED_POSITIONS_MISSING'));
});

test('a piece that hands over its own answer fails', () => {
  const piece = pieceFromUeConcept(pressure);
  piece.question.answer_supplied = true;
  assert.ok(codes(validateLessonPiece(piece)).includes('ANSWER_SUPPLIED'));
});

test('a transfer test that names the concept fails', () => {
  const piece = pieceFromUeConcept(lever, {
    transfer: { situation: 'Use the idea that a lever trades distance for force on a seesaw.', distance: 'NEAR', success_criteria: ['x'] }
  });
  assert.ok(codes(validateLessonPiece(piece)).includes('TRANSFER_NAMES_CONCEPT'));
});

test('child-facing gates cannot be dropped', () => {
  const piece = pieceFromUeConcept(pressure);
  piece.gate.safety_gates = CHILD_FACING_GATES.filter(g => g !== 'UE-GATE-CHILD-001');
  assert.ok(validateLessonPiece(piece).problems.some(p => p.message.includes('UE-GATE-CHILD-001')));
});

test('guardian-context and regulated concepts carry their extra gates', () => {
  const heat = pieceFromUeConcept({ ...pressure, safety_class: 'GUARDIAN_CONTEXT' });
  assert.equal(heat.gate.guardian_required, true);
  heat.gate.guardian_required = false;
  assert.ok(codes(validateLessonPiece(heat)).includes('GUARDIAN_REQUIRED'));

  const money = pieceFromUeConcept({ ...pressure, safety_class: 'REGULATED_ADVICE_BOUNDARY' });
  assert.ok(money.gate.safety_gates.includes('UE-GATE-ADVICE-BOUNDARY-001'));
});

test('an age in years is never assumed from a band', () => {
  const piece = pieceFromUeConcept(pressure);
  assert.equal(piece.gate.age_reference, null);
  assert.equal(piece.gate.age_reference_state, 'CAPABILITY_BAND_ONLY');
  delete piece.gate.age_reference_state;
  assert.ok(codes(validateLessonPiece(piece)).includes('AGE_REFERENCE_UNSTATED'));
});

test('P is a product: one zero factor zeroes it and is named', () => {
  const r = scoreP({ A: 4, U: 5, E: 5, T: 0, J: 3 });
  assert.equal(r.raw, 0);
  assert.deepEqual(r.zero_factors, ['T']);
  assert.equal(r.definition_state, 'PROPOSED_NOT_CANON');
  assert.equal(scoreP({ A: 5, U: 5, E: 5, T: 5, J: 5 }).normalized, 1);
  assert.throws(() => scoreP({ A: 6, U: 1, E: 1, T: 1, J: 1 }), RangeError);
});

test('the contract version is stamped on every generated piece', () => {
  assert.equal(pieceFromUeConcept(lever).contract_version, CONTRACT_VERSION);
});
