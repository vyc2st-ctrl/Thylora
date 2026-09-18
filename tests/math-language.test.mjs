// THYLORA · the language layer
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  VOCABULARY, REQUIRED_WORDS, WORD_FAMILIES, lookup, wordsIn, languageLoad,
  probesFor, isArithmeticFree, LANGUAGE_LAYER
} from '../math-surface/lib/language.js';

test('every word the Chairman named is carried in the registry', () => {
  for (const word of REQUIRED_WORDS) {
    assert.ok(lookup(word), `${word} is missing from the vocabulary registry`);
  }
  assert.equal(VOCABULARY.length, REQUIRED_WORDS.length);
});

test('each entry separates the ordinary meaning from the relationship it signals', () => {
  for (const entry of VOCABULARY) {
    assert.ok(entry.plain.length > 10, `${entry.word} has no plain meaning`);
    assert.ok(entry.relationship.length > 10, `${entry.word} names no relationship`);
    assert.ok(entry.notation.length > 0, `${entry.word} has no notation`);
    assert.ok(entry.common_misread.length > 10, `${entry.word} names no common misread`);
    assert.ok(entry.why_it_misleads.length > 20, `${entry.word} does not say why the misread is reasonable`);
    assert.ok(WORD_FAMILIES[entry.family], `${entry.word} has an unknown family ${entry.family}`);
  }
});

test('every language probe is arithmetic-free, so it cannot be failed for arithmetic reasons', () => {
  for (const probe of probesFor()) {
    assert.ok(isArithmeticFree(probe.ask), `${probe.word}: the probe contains arithmetic — "${probe.ask}"`);
    for (const option of [...probe.accept, ...probe.reject]) {
      assert.ok(isArithmeticFree(option), `${probe.word}: the response "${option}" contains arithmetic`);
    }
  }
});

test('a probe accepts and rejects disjoint sets of readings', () => {
  for (const probe of probesFor()) {
    assert.ok(probe.accept.length > 0, `${probe.word} accepts nothing`);
    assert.ok(probe.reject.length > 0, `${probe.word} rejects nothing`);
    for (const a of probe.accept) {
      assert.ok(!probe.reject.includes(a), `${probe.word}: "${a}" is both accepted and rejected`);
    }
  }
});

test('isArithmeticFree catches numbers, operators and instructions to compute', () => {
  assert.equal(isArithmeticFree('What is this sentence asking for?'), true);
  assert.equal(isArithmeticFree('Is 12 allowed?'), false);
  assert.equal(isArithmeticFree('Take the larger − the smaller'), false);
  assert.equal(isArithmeticFree('Now subtract the two amounts'), false);
});

test('multi-word forms are matched whole, not as fragments', () => {
  assert.deepEqual(wordsIn('The team needs at least twelve players.'), ['at least']);
  assert.deepEqual(wordsIn('No more than nine jars fit.'), ['at most']);
  assert.ok(wordsIn('How many apples per crate?').includes('per'));
});

test('language load is a property of the sentence and shows its own working', () => {
  const light = languageLoad('She had some beads and used a few.');
  assert.equal(light.load, 0);
  assert.equal(light.band, 'NONE');

  const heavy = languageLoad(
    'Thea and Odell need at least 50 tickets between them for the trip. ' +
    'So far they have sold 23 and 19 respectively. ' +
    'What is the difference between what they have sold and what they need?'
  );
  assert.ok(heavy.words.includes('at least'));
  assert.ok(heavy.words.includes('respectively'));
  assert.ok(heavy.words.includes('difference'));
  assert.ok(heavy.words.includes('between'));
  assert.equal(heavy.band, 'HEAVY');
  assert.match(heavy.formula, /registry word\(s\)/);
  assert.equal(
    heavy.load,
    heavy.words.length + heavy.edge_sensitive.length + (heavy.long_sentence ? 1 : 0)
  );
});

test('edge-sensitive words are the bound and pairing families', () => {
  const load = languageLoad('Take at most nine, and label them respectively.');
  assert.deepEqual([...load.edge_sensitive].sort(), ['at most', 'respectively']);
});

test('lookup resolves surface forms as well as headwords', () => {
  assert.equal(lookup('remaining').word, 'remain');
  assert.equal(lookup('no fewer than').word, 'at least');
  assert.equal(lookup('apiece').word, 'per');
  assert.equal(lookup('roughly').word, 'estimate');
  assert.equal(lookup('nothing here'), null);
});

test('the layer states its own admissibility rule', () => {
  assert.match(LANGUAGE_LAYER.rule, /no numbers and no operators/i);
  assert.equal(LANGUAGE_LAYER.count, VOCABULARY.length);
});
