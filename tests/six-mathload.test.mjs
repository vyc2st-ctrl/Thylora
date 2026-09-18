// SIX UNDERSTANDING ENGINE · language load vs mathematical load tests
// The rule under test throughout: if L = 0, the attempt says nothing about the
// mathematics. Not "zero mathematics" — nothing.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  measureLanguageLoad, measureMathematicalLoad, measureProcedure,
  pSolve, diagnose, separateLoads, languageControlledForm, THRESHOLD
} from '../six-engine/lib/mathload.js';
import { resolveBlockers, recordRestatement } from '../six-engine/lib/language.js';

const SOURCE = 'Ada has 3 less than Sam. Sam has 8 sweets. If Ada shares hers equally between 5 children, how many does each child get?';
const STRUCTURE = { quantities: { Sam: 8 }, relation: 'Ada = Sam - 3', question: 'Ada ÷ 5', steps: 2 };

function cardsFor(source) {
  return resolveBlockers(source, { learner: { language_band: 2 }, domain: 'math' }).cards;
}

test('L = 0 does NOT license a claim that the learner lacks the mathematics', () => {
  const result = separateLoads({
    source: SOURCE, cards: cardsFor(SOURCE),
    learner_restatement: 'ada has 3 sweets',      // the relation was never recovered
    structure: STRUCTURE,
    attempt: { answer_correct: false, relation_stated: '3 - 8', steps_attempted: 2, steps_correct: 0 }
  });
  assert.equal(result.diagnosis.verdict, 'LANGUAGE_BLOCKED');
  assert.equal(result.diagnosis.mathematics_deficit_claim, 'NOT_SUPPORTED');
  assert.equal(result.diagnosis.teaching_target, 'the sentence');
});

test('below the L threshold, uncontrolled M and S are discarded — not scored zero', () => {
  const d = diagnose({
    language: { L: 0.2 },
    mathematical: { M: 0.2, controlled_measurement: false },
    procedure: { S: 0.1, controlled_measurement: false },
    answer_correct: false
  });
  assert.equal(d.M, null);
  assert.equal(d.S, null);
  assert.deepEqual(d.discarded_measurements, ['M', 'S']);
  assert.equal(d.P_solve, null);
  assert.equal(d.computable, false);
});

test('an M measured under language control survives a low L', () => {
  const d = diagnose({
    language: { L: 0.2 },
    mathematical: { M: 0.9, controlled_measurement: true },
    procedure: { S: null, controlled_measurement: false }
  });
  assert.equal(d.M, 0.9);
  assert.equal(d.verdict, 'LANGUAGE_BLOCKED');
  assert.equal(d.mathematics_deficit_claim, 'NOT_SUPPORTED');
});

test('no restatement means L is UNMEASURED, never 0', () => {
  const l = measureLanguageLoad({ source: SOURCE, cards: [], learner_restatement: null });
  assert.equal(l.L, null);
  assert.equal(l.state, 'UNMEASURED');
  const d = diagnose({ language: l, mathematical: { M: 0.9 }, procedure: { S: 0.9 } });
  assert.equal(d.verdict, 'LANGUAGE_UNMEASURED');
  assert.equal(d.mathematics_deficit_claim, 'NOT_SUPPORTED');
});

test('P_solve is the product only when all three factors are measured', () => {
  assert.equal(pSolve({ L: 0.5, M: 0.5, S: 0.5 }).P_solve, 0.125);
  const missing = pSolve({ L: 0.9, M: null, S: 0.8 });
  assert.equal(missing.P_solve, null);
  assert.deepEqual(missing.unmeasured, ['M']);
});

test('a relationship probed only through the story is not a measurement of M', () => {
  const m = measureMathematicalLoad({ relation_stated: 'Ada = Sam - 3', relation_expected: 'Ada = Sam - 3', controlled: false });
  assert.equal(m.M, null);
  assert.equal(m.state, 'UNMEASURED');
  assert.match(m.reason, /language load is still in the way/);
});

test('a reversed relationship is recognised as direction, not as absence', () => {
  const m = measureMathematicalLoad({ relation_stated: '3 - 8', relation_expected: '8 - 3', controlled: true });
  assert.equal(m.direction_flipped, true);
  assert.ok(m.M > 0.2 && m.M < THRESHOLD.M);
});

test('language cleared, relationship wrong → RELATIONSHIP_BLOCKED and the sentence is left alone', () => {
  const cards = cardsFor(SOURCE).map(c => recordRestatement(c, c.meaning_here));
  const result = separateLoads({
    source: SOURCE, cards,
    learner_restatement: 'if ada has 3 less than sam and each of the 5 children gets an equal share, all of them, how many per child',
    structure: STRUCTURE,
    attempt: { controlled: true, relation_stated: 'Ada = Sam + 3', steps_attempted: 2, steps_correct: 2, bare_computation: true, answer_correct: false }
  });
  assert.ok(result.language.L >= THRESHOLD.L, `L was ${result.language.L}`);
  assert.equal(result.diagnosis.verdict, 'RELATIONSHIP_BLOCKED');
  assert.equal(result.diagnosis.mathematics_deficit_claim, 'SUPPORTED_RELATIONSHIP');
  assert.equal(result.diagnosis.teaching_target, 'the relationship');
});

test('language and relationship fine, arithmetic slips → PROCEDURE_BLOCKED', () => {
  const d = diagnose({
    language: { L: 0.9 },
    mathematical: { M: 1, controlled_measurement: true },
    procedure: { S: 0.4, controlled_measurement: true }
  });
  assert.equal(d.verdict, 'PROCEDURE_BLOCKED');
  assert.equal(d.mathematics_deficit_claim, 'SUPPORTED_PROCEDURE');
  assert.equal(d.P_solve, 0.36);
});

test('all three secure → transfer, not more of the same', () => {
  const d = diagnose({
    language: { L: 1 }, mathematical: { M: 1, controlled_measurement: true }, procedure: { S: 1, controlled_measurement: true }
  });
  assert.equal(d.verdict, 'SECURE');
  assert.equal(d.P_solve, 1);
  assert.match(d.next_action, /transfer/i);
});

test('the controlled form keeps the same relation and step count', () => {
  const form = languageControlledForm(STRUCTURE);
  assert.equal(form.steps, 2);
  assert.match(form.presentation, /Ada = Sam - 3/);
  assert.match(form.presentation, /Sam = 8/);
});

test('a bare computation with nothing attempted is UNMEASURED', () => {
  assert.equal(measureProcedure({ steps_attempted: null, steps_correct: null }).S, null);
  assert.equal(measureProcedure({ steps_attempted: 0, steps_correct: 0 }).state, 'UNMEASURED');
});
