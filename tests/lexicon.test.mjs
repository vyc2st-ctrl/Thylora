import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  LEXICON,
  CERTAINTY,
  NOT_RECOVERED,
  SPELLING_NOTE,
  ATTESTED_SPELLING,
  INSTRUCTION_VARIANT,
  admitEntry,
  lookup,
  corpusReport,
} from '../language/lexicon.mjs';

// --- the no-fabrication rule, enforced rather than stated ------------------

test('every lexicon entry names at least one attestation', () => {
  for (const entry of LEXICON) {
    assert.ok(Array.isArray(entry.attestations) && entry.attestations.length > 0,
      `"${entry.token}" has no attestation — it would be a fabricated word`);
  }
});

test('an entry with no attestation cannot be admitted', () => {
  const result = admitEntry({ token: 'anything', gloss: 'a plausible word', certainty: CERTAINTY.ATTESTED_MEANING });
  assert.equal(result.admitted, false);
  assert.equal(result.reason, 'NO_ATTESTATION');
  assert.ok(result.detail.includes('fabricated'));
});

test('an entry with an attestation and a certainty level is admitted', () => {
  const result = admitEntry({
    token: 'EdereAriah',
    attestations: ['rae-link/index.html:45'],
    certainty: CERTAINTY.ATTESTED_MEANING,
  });
  assert.equal(result.admitted, true);
});

test('every attestation points at a file with a location or a named commit', () => {
  for (const entry of LEXICON) {
    for (const a of entry.attestations) {
      const hasLine = /:\d+$/.test(a);
      const hasCommit = /@[0-9a-f]{7,}/.test(a);
      const hasFile = /\.(mjs|js|sql|html|md)/.test(a);
      assert.ok(hasLine || hasCommit || hasFile,
        `"${entry.token}" attestation "${a}" points nowhere checkable`);
    }
  }
});

test('every entry carries a certainty level and none is invented', () => {
  const allowed = new Set(Object.values(CERTAINTY));
  for (const entry of LEXICON) {
    assert.ok(allowed.has(entry.certainty), `"${entry.token}" has certainty "${entry.certainty}"`);
  }
});

test('tokens whose meaning is unattested are marked ATTESTED_TOKEN, not glossed as known', () => {
  for (const token of ['VLEGH', 'DASHUL', 'ERSATZREALITY', 'THEHANDLUH']) {
    const entry = lookup(token);
    assert.ok(entry, `${token} missing from corpus`);
    assert.equal(entry.certainty, CERTAINTY.ATTESTED_TOKEN,
      `${token} claims a settled meaning that no source settles`);
  }
});

test('VLEGH and DASHUL carry UNKNOWN part of speech rather than a guess', () => {
  assert.equal(lookup('VLEGH').part_of_speech, 'UNKNOWN');
  assert.equal(lookup('DASHUL').part_of_speech, 'UNKNOWN');
});

test('lookup returns null rather than a guess', () => {
  assert.equal(lookup('water'), null);
  assert.equal(lookup('hello'), null);
  assert.equal(lookup(''), null);
  assert.equal(lookup(undefined), null);
});

// --- the corpus says plainly what it is not --------------------------------

test('the corpus reports zero common vocabulary and zero grammar', () => {
  const report = corpusReport();
  assert.equal(report.fabricated, 0);
  assert.equal(report.common_vocabulary, 0);
  assert.equal(report.grammar_rules, 0);
});

test('the corpus records that the approved lexicon was not recovered, with the blocker', () => {
  const report = corpusReport();
  assert.equal(report.approved_lexicon_recovered, false);
  assert.ok(report.approved_lexicon_blocker.includes('403'));
});

test('the categories that were not recovered are each named', () => {
  const categories = NOT_RECOVERED.map((n) => n.category);
  for (const expected of ['common nouns', 'verbs', 'pronouns', 'numerals', 'greetings', 'grammar', 'phonology']) {
    assert.ok(categories.includes(expected), `"${expected}" is not declared as unrecovered`);
  }
});

// --- the spelling discrepancy is carried, not smoothed over ----------------

test('the attested spelling is used and the instruction variant is recorded, not adopted', () => {
  assert.equal(ATTESTED_SPELLING, 'EdereAriah');
  assert.equal(INSTRUCTION_VARIANT, 'EdereAirah');
  assert.notEqual(ATTESTED_SPELLING, INSTRUCTION_VARIANT);
  assert.equal(SPELLING_NOTE.variant_occurrences_in_source, 0);
  assert.ok(SPELLING_NOTE.disposition.includes('D4'));
});

test('no lexicon entry uses the unattested spelling', () => {
  const text = JSON.stringify(LEXICON);
  assert.equal(text.includes(INSTRUCTION_VARIANT), false,
    'a lexicon entry uses the unattested spelling');
});

// --- Lesson 001 is built on the corpus and nothing else --------------------

test('Lesson 001 states that no word was invented and carries zero fabricated words', () => {
  const lesson = readFileSync(new URL('../language/LESSON-001.md', import.meta.url), 'utf8');
  assert.ok(lesson.includes('Fabricated words in this lesson: **0**'));
  assert.ok(lesson.includes('No word in this lesson was invented'));
});

test('every token Lesson 001 teaches in bold is in the corpus', () => {
  const lesson = readFileSync(new URL('../language/LESSON-001.md', import.meta.url), 'utf8');
  const taught = ['EdereAriah', 'EDEREARIAH_INHABITANT', 'WORLD_CHANNEL',
    'WORLD_SIMULATED', 'EARTH_REAL', 'THEHANDLUH', 'ERSATZREALITY', 'VLEGH', 'DASHUL'];
  for (const token of taught) {
    assert.ok(lesson.includes(token), `Lesson 001 does not mention ${token}`);
    assert.ok(lookup(token), `Lesson 001 teaches ${token}, which is not in the corpus`);
  }
});

test('Lesson 001 admits that it cannot teach pronunciation', () => {
  const lesson = readFileSync(new URL('../language/LESSON-001.md', import.meta.url), 'utf8');
  assert.ok(/pronunciation/i.test(lesson));
  assert.ok(lesson.includes('UNKNOWN'));
});

test('Lesson 001 records the spelling discrepancy rather than silently choosing', () => {
  const lesson = readFileSync(new URL('../language/LESSON-001.md', import.meta.url), 'utf8');
  assert.ok(lesson.includes(INSTRUCTION_VARIANT));
  assert.ok(lesson.includes(ATTESTED_SPELLING));
});
