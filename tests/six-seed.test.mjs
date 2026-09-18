// SIX UNDERSTANDING ENGINE · seed parity tests
// The backend rows and the runtime lexicon must teach the same meanings. This
// fails the moment the committed SQL stops matching the module it came from.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { generate } from '../six-engine/tools/generate-seed-sql.mjs';
import { LEXICON } from '../six-engine/lib/lexicon.js';
import { SEED_CONCEPTS } from '../six-engine/lib/prerequisites.js';

const SEED_PATH = new URL('../db/six-engine/0009_seed_lexicon_and_concepts.sql', import.meta.url);
const committed = readFileSync(SEED_PATH, 'utf8');

test('the committed seed migration matches the runtime lexicon exactly', () => {
  assert.equal(committed, generate(),
    'db/six-engine/0009_seed_lexicon_and_concepts.sql is stale — regenerate it with\n' +
    '  node six-engine/tools/generate-seed-sql.mjs > db/six-engine/0009_seed_lexicon_and_concepts.sql');
});

test('every runtime word sense reaches the backend', () => {
  for (const sense of Object.values(LEXICON).flat()) {
    assert.ok(committed.includes(`'${sense.id}'`), `sense ${sense.id} is missing from the seed migration`);
  }
});

test('every runtime concept and prerequisite edge reaches the backend', () => {
  for (const concept of SEED_CONCEPTS) {
    assert.ok(committed.includes(`('${concept.id}', '${concept.label.replace(/'/g, "''")}'`), `concept ${concept.id} missing`);
    for (const p of concept.prerequisites) {
      assert.ok(committed.includes(`('${concept.id}', '${p}')`), `edge ${concept.id} → ${p} missing`);
    }
  }
});

test('the seed is re-runnable and never overwrites a department edit', () => {
  assert.ok(committed.includes('on conflict (lemma) do nothing'));
  assert.ok(committed.includes('on conflict (id) do nothing'));
  assert.ok(committed.includes('on conflict (sense_id, cue_pattern) do nothing'));
  assert.ok(!/\bon conflict[^\n]*do update\b/.test(committed), 'a seed must not overwrite backend rows');
});

test('cue patterns are converted to PostgreSQL word boundaries', () => {
  assert.ok(!committed.includes('\\b'), 'JavaScript \\b does not mean a word boundary to PostgreSQL');
  assert.ok(committed.includes('\\y'), 'expected POSIX \\y word boundaries in the seeded cues');
});

test('no sense reaches the backend without a non-example', () => {
  for (const sense of Object.values(LEXICON).flat()) {
    assert.ok(sense.non_example && sense.non_example.length > 0, `sense ${sense.id} has no non-example`);
  }
});

test('meanings stay inside the length the schema allows', () => {
  for (const sense of Object.values(LEXICON).flat()) {
    assert.ok(sense.meaning.length <= 180,
      `sense ${sense.id} has a meaning of ${sense.meaning.length} chars; the schema caps it at 180 to keep it a contextual job, not a dictionary entry`);
  }
});
