// SIX UNDERSTANDING ENGINE · adult-to-child concept parity tests
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  extractInvariants, languageFriction, parityCheck, gateSimplification,
  FORBIDDEN_REDUCTIONS, PERMITTED_REDUCTIONS
} from '../six-engine/lib/parity.js';

const ADULT = 'Because most of the parish records were destroyed, historians cannot confirm the birth year, although some scholars argue it was probably before 1760.';

test('an easier sentence that keeps every invariant passes', () => {
  const child = 'Most of the church papers were burned. So historians cannot be sure what year he was born. Some of them think it was probably before 1760.';
  const check = parityCheck(ADULT, child);
  assert.equal(check.pass, true);
  assert.equal(check.parity, 1);
  assert.ok(check.friction_relief > 0);
});

test('an easier sentence that loses the concept is refused, however readable', () => {
  const child = 'The records were burned so we know he was born in 1759.';
  const check = parityCheck(ADULT, child);
  assert.equal(check.pass, false);
  assert.ok(check.friction_after < check.friction_before, 'it is genuinely easier to read');
  assert.ok(check.lost.includes('UNCERTAINTY'));
  assert.ok(check.violations.some(v => v.code === 'PARITY_LOST_UNCERTAINTY'));
});

test('dropping a quantifier is a parity violation', () => {
  const check = parityCheck('Some of the records survived the fire.', 'The records survived the fire.');
  assert.ok(check.lost.includes('QUANTIFIER'));
  assert.equal(check.pass, false);
});

test('dropping a negation is a parity violation', () => {
  const check = parityCheck('The box is not empty.', 'The box is empty.');
  assert.ok(check.lost.includes('NEGATION'));
});

test('dropping a condition is a parity violation', () => {
  const check = parityCheck('If the bag is full, she buys another one.', 'She buys another bag.');
  assert.ok(check.lost.includes('CONDITIONAL'));
});

test('dropping units is a parity violation', () => {
  const check = parityCheck('The car travels 60 miles per hour.', 'The car travels 60.');
  assert.ok(check.lost.includes('UNIT'));
});

test('removing who holds a position is a parity violation', () => {
  const check = parityCheck('Most historians argue the date is 1760.', 'The date is 1760.');
  assert.ok(check.lost.includes('POSITION_HOLDER'));
});

test('a rewrite that keeps the concept but is no easier buys nothing and fails', () => {
  const same = 'Because most of the parish records were destroyed, historians cannot confirm the birth year, although some scholars argue it was probably before 1760, and the documentation remains incomplete.';
  const check = parityCheck(ADULT, same);
  assert.equal(check.pass, false);
  assert.ok(check.violations.some(v => v.code === 'PARITY_NO_FRICTION_RELIEF'));
});

test('the gate returns the source and an instruction rather than a shrunken concept', () => {
  const gated = gateSimplification(ADULT, 'He was born in 1759.');
  assert.equal(gated.accepted, false);
  assert.equal(gated.text, ADULT);
  assert.match(gated.instruction, /Keep every one of these/);
  assert.match(gated.instruction, new RegExp(PERMITTED_REDUCTIONS[0]));
});

test('the gate accepts a rewrite that only reduces language', () => {
  const gated = gateSimplification(
    'The volume of the container was measured by displacement.',
    'We found the space inside the box by seeing how much water it pushed out.');
  assert.equal(gated.accepted, true);
});

test('friction falls when sentences shorten and rare words go', () => {
  const hard = languageFriction('The approximate proportion of the cumulative measurements, which were recorded consecutively, was subsequently established.');
  const easy = languageFriction('We counted them one by one. Then we worked out roughly how many there were.');
  assert.ok(easy.score < hard.score);
});

test('invariants are read from the logic, not the wording', () => {
  const kinds = extractInvariants('If all the cups are not clean, because the tap broke, wash them before tea.').map(i => i.kind);
  for (const k of ['CONDITIONAL', 'QUANTIFIER', 'NEGATION', 'CAUSAL_DIRECTION', 'TEMPORAL_ORDER']) {
    assert.ok(kinds.includes(k), `missing ${k}`);
  }
});

test('the forbidden list names the reductions the gate refuses', () => {
  assert.ok(FORBIDDEN_REDUCTIONS.includes('presenting a contested position as settled'));
  assert.ok(FORBIDDEN_REDUCTIONS.includes('replacing a mechanism with a label'));
});
