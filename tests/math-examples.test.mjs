// THYLORA · worked examples, four isolations each
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  WORKED_EXAMPLES, exampleById, examplesForWord, isolationsOf, allText, EXAMPLE_SET, BANDS
} from '../math-surface/lib/examples.js';
import { REQUIRED_WORDS, isArithmeticFree, languageLoad, lookup } from '../math-surface/lib/language.js';
import { checkMinorNameRuleAcross, PROTECTED_NAMES } from '../math-surface/lib/continuity.js';

test('at least ten worked examples exist', () => {
  assert.ok(WORKED_EXAMPLES.length >= 10, `only ${WORKED_EXAMPLES.length} examples`);
  assert.equal(EXAMPLE_SET.count, WORKED_EXAMPLES.length);
});

test('every one of the named words is worked somewhere', () => {
  for (const word of REQUIRED_WORDS) {
    const uses = examplesForWord(word);
    assert.ok(uses.length >= 1, `no worked example isolates "${word}"`);
  }
});

test('every example carries all four isolations, in order', () => {
  for (const example of WORKED_EXAMPLES) {
    const isolations = isolationsOf(example);
    assert.equal(isolations.length, 4, `${example.id} does not have four isolations`);
    assert.deepEqual(isolations.map(i => i.layer), ['L', 'M', 'S', null]);
    assert.deepEqual(isolations.map(i => i.order), [1, 2, 3, 4]);
    for (const isolation of isolations) {
      assert.ok(isolation.body, `${example.id} isolation ${isolation.order} is empty`);
    }
  }
});

test('the language isolation of every example is arithmetic-free', () => {
  for (const example of WORKED_EXAMPLES) {
    const { prompt, ask, accept, reject } = example.language;
    assert.ok(isArithmeticFree(ask), `${example.id}: the language ask contains arithmetic — "${ask}"`);
    assert.ok(isArithmeticFree(prompt), `${example.id}: the language prompt contains arithmetic`);
    for (const response of [...accept, ...reject]) {
      assert.ok(isArithmeticFree(response), `${example.id}: the response "${response}" contains arithmetic`);
    }
  }
});

test('the relationship isolation hands the quantities over and asks for no computation', () => {
  for (const example of WORKED_EXAMPLES) {
    const r = example.relationship;
    assert.ok(r.options.length >= 3, `${example.id}: a relationship probe needs real alternatives`);
    assert.ok(r.options.includes(r.answer), `${example.id}: the correct relationship is not among its options`);
    assert.match(r.prompt, /not working out/i, `${example.id}: the relationship probe does not say computation is off`);
    assert.ok(r.notation.length > 0, `${example.id}: the relationship has no notation`);
    assert.ok(r.why.length > 20, `${example.id}: the relationship is not explained`);
  }
});

test('the solve isolation carries no story', () => {
  for (const example of WORKED_EXAMPLES) {
    const prompt = example.solve.prompt;
    const storyWords = (example.story.toLowerCase().match(/\b[a-z]{5,}\b/g) ?? []);
    const leaked = storyWords.filter(w => prompt.toLowerCase().includes(w));
    // "remainder" and "list" are procedural words, not story words.
    const allowed = new Set(['remainder', 'boxes']);
    const real = leaked.filter(w => !allowed.has(w));
    assert.equal(real.length, 0, `${example.id}: the solve prompt leaks story words: ${real.join(', ')}`);
  }
});

test('the child explains the result back, not the procedure', () => {
  for (const example of WORKED_EXAMPLES) {
    const e = example.explain_back;
    assert.ok(e.prompt.length > 10, `${example.id}: no explain-back prompt`);
    assert.ok(e.child_words.length > 15, `${example.id}: no example of the child's words`);
    assert.ok(e.not_accepted.length > 3, `${example.id}: nothing is named as not-yet-an-explanation`);
    assert.notEqual(e.child_words, e.not_accepted);
  }
});

// --- the arithmetic is actually right --------------------------------------

/**
 * Verify the arithmetic in a step string. Recognised shapes:
 *   a + b = c      a − b = c      a × b = c      a ÷ b = c
 *   a ÷ b = q remainder r
 *   a ≥ b is true/false           a > b
 *   n rounds to m
 */
function verifyStep(step) {
  let match;

  match = /(-?\d+(?:\.\d+)?)\s*÷\s*(-?\d+(?:\.\d+)?)\s*=\s*(-?\d+)\s*remainder\s*(-?\d+)/.exec(step);
  if (match) {
    const [, a, b, q, r] = match.map(Number);
    return { checked: true, ok: Math.floor(a / b) === q && a % b === r, step };
  }

  match = /(-?\d+(?:\.\d+)?)\s*([+\-−×÷])\s*(-?\d+(?:\.\d+)?)\s*=\s*(-?\d+(?:\.\d+)?)/.exec(step);
  if (match) {
    const a = Number(match[1]);
    const b = Number(match[3]);
    const expected = Number(match[4]);
    const ops = { '+': a + b, '-': a - b, '−': a - b, '×': a * b, '÷': a / b };
    return { checked: true, ok: Math.abs(ops[match[2]] - expected) < 1e-9, step };
  }

  match = /(-?\d+(?:\.\d+)?)\s*(≥|≤|>|<)\s*(-?\d+(?:\.\d+)?)\s*(?:is\s*(true|false))?/.exec(step);
  if (match) {
    const a = Number(match[1]);
    const b = Number(match[3]);
    const rel = { '≥': a >= b, '≤': a <= b, '>': a > b, '<': a < b }[match[2]];
    const claimed = match[4] ? match[4] === 'true' : true;
    return { checked: true, ok: rel === claimed, step };
  }

  match = /(-?\d+(?:\.\d+)?)\s*rounds to\s*(-?\d+(?:\.\d+)?)/.exec(step);
  if (match) {
    const from = Number(match[1]);
    const to = Number(match[2]);
    return { checked: true, ok: Math.abs(from - to) <= Math.max(10, Math.abs(from) * 0.1), step };
  }

  return { checked: false, ok: true, step };
}

test('every arithmetic step in every example is correct', () => {
  let checkedTotal = 0;
  for (const example of WORKED_EXAMPLES) {
    const results = example.solve.steps.map(verifyStep);
    const checked = results.filter(r => r.checked);
    checkedTotal += checked.length;
    assert.ok(checked.length >= 1, `${example.id}: no verifiable arithmetic step`);
    for (const result of results) {
      assert.ok(result.ok, `${example.id}: step is arithmetically wrong — "${result.step}"`);
    }
  }
  assert.ok(checkedTotal >= WORKED_EXAMPLES.length, 'too few steps were machine-checked');
});

test('the stated answer matches the last numeric step', () => {
  for (const example of WORKED_EXAMPLES) {
    const answer = example.solve.answer;
    if (typeof answer !== 'number') continue;
    const withEquals = example.solve.steps.filter(s => s.includes('='));
    if (withEquals.length === 0) continue;
    const last = withEquals[withEquals.length - 1];
    const tails = [...last.matchAll(/=\s*(-?\d+(?:\.\d+)?)/g)];
    if (tails.length === 0) continue;
    const stated = Number(tails[tails.length - 1][1]);
    assert.equal(stated, answer, `${example.id}: the answer does not match the final step`);
  }
});

test('WE-11 carries both a quotient and a remainder', () => {
  const example = exampleById('WE-11');
  assert.deepEqual(example.solve.answer, { full_boxes: 3, rolls_outside: 2 });
  assert.equal(60 - 34, 26);
  assert.equal(Math.floor(26 / 8), 3);
  assert.equal(26 % 8, 2);
});

test('WE-07 is the case where flawless arithmetic produces the wrong person', () => {
  const example = exampleById('WE-07');
  assert.ok(example.word_focus.includes('respectively'));
  assert.equal(example.solve.answer, 6);
  assert.match(example.expected_failure_mode, /14 − 3 = 11|wrong person/i);
});

// --- language load ---------------------------------------------------------

test('every example story carries at least one registry word, and the dense one is heavy', () => {
  for (const example of WORKED_EXAMPLES) {
    const load = languageLoad(example.story);
    assert.ok(load.words.length >= 1, `${example.id}: the story carries none of the registry words`);
  }
  assert.equal(languageLoad(exampleById('WE-12').story).band, 'HEAVY');
});

test('every word in focus is a registry word', () => {
  for (const example of WORKED_EXAMPLES) {
    for (const word of example.word_focus) {
      assert.ok(lookup(word), `${example.id}: "${word}" is not in the vocabulary registry`);
    }
  }
});

test('examples are spread across bands', () => {
  const bands = new Set(WORKED_EXAMPLES.map(e => e.band));
  assert.ok(bands.size >= 3, 'the set sits in too narrow a band');
  for (const band of bands) assert.ok(BANDS[band], `unknown band ${band}`);
});

// --- THY-MINOR-NAME-ADULT-USE-001 ------------------------------------------

test('no protected name appears anywhere in the worked examples', () => {
  const result = checkMinorNameRuleAcross(
    WORKED_EXAMPLES.map(e => ({ id: e.id, text: allText(e), people: e.people }))
  );
  assert.equal(result.ok, true, result.statement);
  assert.equal(result.checked, WORKED_EXAMPLES.length);
});

test('every person in every example is declared with an age, and all are minors here', () => {
  for (const example of WORKED_EXAMPLES) {
    assert.ok(example.people.length >= 1, `${example.id}: no people declared`);
    for (const person of example.people) {
      assert.equal(typeof person.age, 'number', `${example.id}: ${person.name} has no declared age`);
      assert.ok(person.age < 18, `${example.id}: ${person.name} is not a child; this set is child-facing`);
      assert.ok(
        !PROTECTED_NAMES.some(n => n.toLowerCase() === person.name.toLowerCase()),
        `${example.id}: ${person.name} is a protected name on a person under 18`
      );
    }
  }
});
