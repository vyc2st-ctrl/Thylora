// SIX UNDERSTANDING ENGINE · language blocker resolver tests
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  resolveBlockers, resolveSense, recordRestatement, isMaterial,
  assertNotDictionaryDump, comprehensionCoverage, lemmasPresent
} from '../six-engine/lib/language.js';

const learner = { language_band: 2, known_lemmas: [] };

test('one word carries different jobs in different sentences', () => {
  const remainder = resolveSense('left', 'How many sweets are left?', { domain: 'math' });
  const direction = resolveSense('left', 'Turn left at the corner.', {});
  assert.equal(remainder.chosen.job, 'QUANTITY_REMAINDER');
  assert.equal(direction.chosen.job, 'DIRECTION');
});

test('"of" is a multiplication in one context and a belonging in another', () => {
  assert.equal(resolveSense('of', 'What is half of 12?', { domain: 'math' }).chosen.job, 'OPERATION_CUE');
  assert.equal(resolveSense('of', 'The lid of the jar is red.', {}).chosen.job, 'STRUCTURE_TECHNICAL');
});

test('an unseparated sense becomes a question to the learner, never a guess', () => {
  const r = resolveSense('table', 'Look at the table.', {});
  assert.equal(r.ambiguous, true);
  assert.equal(r.chosen, null);
  assert.match(r.disambiguation_question, /is "table" doing the job of/i);
});

test('every resolution card carries all seven fields', () => {
  const { cards } = resolveBlockers('Ada has 3 less than Sam.', { learner, domain: 'math' });
  const card = cards.find(c => c.word === 'less than');
  for (const field of ['word', 'context', 'meaning_here', 'simpler_substitute', 'example', 'non_example', 'learner_restatement_prompt']) {
    assert.ok(card[field], `missing ${field}`);
  }
  assert.equal(assertNotDictionaryDump(card).valid, true);
});

test('a dictionary gloss is refused as a resolution card', () => {
  const dump = {
    word: 'left', context: 'x', simpler_substitute: 'y', example: 'e', non_example: 'n',
    learner_restatement_prompt: 'p',
    meaning_here: 'a word meaning the side opposite the right, or remaining, or departed, or a political position'
  };
  const check = assertNotDictionaryDump(dump);
  assert.equal(check.valid, false);
  assert.ok(check.problems.some(p => /dictionary gloss/i.test(p)));
});

test('a card with no non-example is refused — the learner is not shown the trap', () => {
  const card = { word: 'w', context: 'c', meaning_here: 'm', simpler_substitute: 's', example: 'e', learner_restatement_prompt: 'p' };
  assert.equal(assertNotDictionaryDump(card).valid, false);
  assert.ok(assertNotDictionaryDump(card).problems.some(p => /NON-EXAMPLE/.test(p)));
});

test('words already established for this learner are not re-explained', () => {
  const before = resolveBlockers('She shares the sweets between each child.', { learner, domain: 'math' });
  const after = resolveBlockers('She shares the sweets between each child.', { learner: { ...learner, known_lemmas: ['each', 'share'] }, domain: 'math' });
  assert.ok(after.cards.length < before.cards.length);
  assert.equal(isMaterial('each', 'x', { known_lemmas: ['each'] }).material, false);
});

test('words that carry logical weight are always material', () => {
  assert.equal(isMaterial('if', 'If the bag is full she buys another.', learner).material, true);
  assert.equal(isMaterial('each', '3 sweets each', learner).reason, 'CARRIES_LOGICAL_WEIGHT');
  // and a word whose sense switch changes the answer is material for that reason
  assert.equal(isMaterial('share', 'her share of the money', learner).reason, 'SENSE_SWITCH_CHANGES_ANSWER');
});

test('a word above band with no lexicon entry is reported as a gap, not invented', () => {
  const r = resolveBlockers('The consecutive measurements showed proportionality.', { learner: { language_band: 1 } });
  assert.ok(r.unknown_words.length > 0);
  assert.equal(r.blocked, true);
  assert.ok(r.unknown_words.every(u => u.state === 'UNKNOWN_WORD'));
});

test('a blocker stays OPEN until the learner restates it', () => {
  const { cards } = resolveBlockers('How many are left?', { learner, domain: 'math' });
  const card = cards[0];
  assert.equal(card.state, 'OPEN');
  assert.equal(comprehensionCoverage([card]), 0);

  const cleared = recordRestatement(card, 'it means how many are still there after some went');
  assert.equal(cleared.state, 'CLEARED');
  assert.equal(comprehensionCoverage([cleared]), 1);
});

test('a restatement that reaches for the wrong sense does not clear the blocker', () => {
  const { cards } = resolveBlockers('How many are left?', { learner, domain: 'math' });
  const wrong = recordRestatement(cards[0], 'it means the direction, turn that way at the corner');
  assert.notEqual(wrong.state, 'CLEARED');
  assert.equal(wrong.reached_for_wrong_sense, true);
});

test('multi-word relations are detected as single lemmas', () => {
  assert.ok(lemmasPresent('Sam has 3 more than Ada').includes('more than'));
});
