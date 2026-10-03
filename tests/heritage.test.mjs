import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const load = (p) => JSON.parse(readFileSync(new URL(`../${p}`, import.meta.url), 'utf8'));
const lexicon = load('heritage/lexicon.json');
const sources = load('heritage/sources.json');
const PREFIX = { blackfoot: 'BLK', egyptian: 'EGY', edo: 'EDO', hebrew: 'HEB' };

test('lexicon: entry ids are unique and match the backend pattern', () => {
  const ids = lexicon.entries.map((e) => e.id);
  assert.equal(new Set(ids).size, ids.length, 'duplicate lexicon id');
  for (const id of ids) assert.match(id, /^(BLK|EGY|EDO|HEB)-[0-9]{3}$/);
});

test('lexicon: no duplicate word within a language', () => {
  const seen = new Set();
  for (const e of lexicon.entries) {
    const key = `${e.lang}:${e.native.normalize('NFC')}`;
    assert.ok(!seen.has(key), `duplicate word ${key}`);
    seen.add(key);
  }
});

test('lexicon: every entry belongs to a declared language with the right prefix', () => {
  for (const e of lexicon.entries) {
    assert.ok(lexicon.languages[e.lang], `${e.id} uses undeclared language ${e.lang}`);
    assert.equal(e.id.slice(0, 3), PREFIX[e.lang], `${e.id} prefix does not match ${e.lang}`);
  }
});

test('lexicon: nothing is marked CONFIRMED without a recorded human source', () => {
  for (const e of lexicon.entries) {
    assert.ok(lexicon.statuses.includes(e.status), `${e.id} has unknown status ${e.status}`);
    assert.notEqual(e.status, 'CONFIRMED', `${e.id} claims CONFIRMED; record the speaker in the backend first`);
    assert.ok(['HIGH', 'MEDIUM', 'LOW'].includes(e.confidence), `${e.id} confidence`);
    assert.ok(e.gloss && e.domain, `${e.id} missing gloss or domain`);
  }
});

test('lexicon: every language names where to confirm it', () => {
  for (const [lang, meta] of Object.entries(lexicon.languages)) {
    assert.ok(meta.self_name, `${lang} missing self_name`);
    assert.ok(meta.confirm_with.length >= 2, `${lang} needs at least two confirmation sources`);
  }
});

test('lexicon: count matches the workroom record (73)', () => {
  assert.equal(lexicon.entries.length, 73);
});

test('sources: ids are unique, sequential and match the backend pattern', () => {
  sources.sources.forEach((s, i) => {
    assert.equal(s.id, `SRC-${String(i + 1).padStart(3, '0')}`);
    assert.ok(s.where.length >= 1 && s.why, `${s.id} needs where and why`);
  });
});

test('sources: work order never goes backwards', () => {
  const steps = sources.sources.map((s) => s.step);
  assert.deepEqual(steps, [...steps].sort((a, b) => a - b));
});
