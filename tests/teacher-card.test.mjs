// TEACHER CARD · tests
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  TEACHER_STEPS, validateLoop, decompose, decompositionLines,
  representationsFor, transferProblemFor, CARD_84_7
} from '../understanding/teacher-card.js';

test('the loop is ASK, HEAR, FIND GAP, CHANGE REPRESENTATION, TRANSFER TEST', () => {
  assert.deepEqual(TEACHER_STEPS, ['ASK', 'HEAR', 'FIND_GAP', 'CHANGE_REPRESENTATION', 'TRANSFER_TEST']);
});

test('a loop missing HEAR is invalid - the gap would be a guess', () => {
  const r = validateLoop(['ASK', 'FIND_GAP', 'CHANGE_REPRESENTATION', 'TRANSFER_TEST']);
  assert.equal(r.valid, false);
  assert.deepEqual(r.missing, ['HEAR']);
});

test('a loop run out of order is invalid', () => {
  const r = validateLoop(['ASK', 'HEAR', 'CHANGE_REPRESENTATION', 'FIND_GAP', 'TRANSFER_TEST']);
  assert.equal(r.valid, false);
  assert.deepEqual(r.outOfOrder, ['FIND_GAP']);
});

test('84 / 7 decomposes exactly as the Chairman states it', () => {
  assert.deepEqual(decompositionLines(84, 7), [
    '84 = 70 + 14',
    '70 / 7 = 10',
    '14 / 7 = 2',
    'therefore 84 / 7 = 12'
  ]);
});

test('the chunks sum to the dividend and the quotients sum to the answer', () => {
  const d = decompose(84, 7);
  assert.equal(d.chunks.reduce((s, c) => s + c.amount, 0), 84);
  assert.equal(d.quotient, 12);
  assert.equal(d.exact, true);
});

test('the move generalises - it is a method, not a memorised case', () => {
  for (const [dividend, divisor, quotient] of [[96, 8, 12], [72, 6, 12], [136, 8, 17], [91, 7, 13]]) {
    const d = decompose(dividend, divisor);
    assert.equal(d.quotient, quotient, `${dividend} / ${divisor}`);
    assert.equal(d.chunks.reduce((s, c) => s + c.amount, 0), dividend);
  }
});

test('an inexact division reports its remainder rather than hiding it', () => {
  const d = decompose(85, 7);
  assert.equal(d.quotient, 12);
  assert.equal(d.remainder, 1);
  assert.equal(d.exact, false);
  assert.ok(decompositionLines(85, 7).includes('remainder 1'));
});

test('decompose refuses input it cannot answer honestly', () => {
  assert.throws(() => decompose(84, 0));
  assert.throws(() => decompose(-84, 7));
  assert.throws(() => decompose(8.4, 7));
});

test('the card carries five distinct representations of the same division', () => {
  const modes = representationsFor(84, 7).map((r) => r.mode);
  assert.equal(new Set(modes).size, 5);
  assert.deepEqual(modes, ['PARTIAL_QUOTIENTS', 'AREA', 'EQUAL_GROUPS', 'NUMBER_LINE', 'MONEY']);
});

test('the transfer test uses different numbers and the same move', () => {
  const t = transferProblemFor(84, 7);
  assert.equal(t.task, '96 / 8');
  assert.equal(t.answer, 12);
  assert.equal(t.different_numbers, true);
  assert.notEqual(t.task, '84 / 7', 'same numbers would test memory, not transfer');
  assert.ok(t.pass_condition.length > 0, 'a test that cannot be failed is not evidence');
});

test('the shipped card is the 84 / 7 card', () => {
  assert.equal(CARD_84_7.question, '84 / 7');
  assert.equal(CARD_84_7.worked_example[0], '84 = 70 + 14');
  assert.equal(CARD_84_7.loop.length, 5);
  assert.equal(CARD_84_7.transfer.task, '96 / 8');
});
