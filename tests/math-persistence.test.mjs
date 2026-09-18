// THYLORA · persistence
//
// "Persistence verified" here means a record survived losing the object that
// wrote it. A write that returns without throwing proves nothing; these tests
// reopen the store through a fresh repository and read the record back, once in
// memory and once against a real directory on disk.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  createRepository, memoryAdapter, browserStorageAdapter, verifyPersistence,
  PersistenceError, COLLECTIONS
} from '../math-surface/lib/persistence.js';
import { fileAdapter } from '../math-surface/lib/persistence-fs.js';
import { buildUnderstandingCard, superseding } from '../math-surface/lib/cards.js';
import { observe } from '../math-surface/lib/understanding.js';
import { exampleById } from '../math-surface/lib/examples.js';
import { toRow } from '../math-surface/lib/backend.js';

const example = exampleById('WE-01');

function sampleCard(id = 'UC-TEST-0001') {
  return buildUnderstandingCard({
    id,
    learner_ref: 'LR-TEST-001',
    example,
    observations: [
      observe({ layer: 'L', correct: 0, attempted: 2 }),
      observe({ layer: 'M', correct: 2, attempted: 2 })
    ],
    explain_back: 'The beads that are still in the tin.',
    recorded_by: 'test suite',
    at: '2026-09-18T09:00:00.000Z'
  });
}

test('a record survives losing the repository that wrote it — in memory', async () => {
  const adapter = memoryAdapter();
  const result = await verifyPersistence(() => adapter, sampleCard('UC-MEM-0001'));
  assert.equal(result.survived_reopen, true);
  assert.equal(result.append_only_enforced, true);
  assert.equal(result.ok, true);
  assert.equal(result.read_back.learner_ref, 'LR-TEST-001');
});

test('a record survives on a real filesystem, read back by a fresh repository', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'thy-math-'));
  try {
    const result = await verifyPersistence(() => fileAdapter(directory), sampleCard('UC-FS-0001'));
    assert.equal(result.ok, true, 'the card did not survive a reopen from disk');
    assert.equal(result.read_back.example_id, 'WE-01');

    const path = join(directory, 'understanding_cards.json');
    assert.ok(existsSync(path), 'nothing was written to disk');
    const onDisk = JSON.parse(readFileSync(path, 'utf8'));
    assert.equal(onDisk.length, 1);
    assert.equal(onDisk[0].id, 'UC-FS-0001');
    assert.equal(onDisk[0].explain_back.child_words, 'The beads that are still in the tin.');
    assert.ok(onDisk[0]._written_at, 'the write time was not stamped');
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('the child\'s own words survive the round trip byte for byte', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'thy-math-'));
  try {
    const words = 'Odell has six, because the nine was his — not Ruth\'s. “Respectively” said so.';
    const repository = createRepository(fileAdapter(directory));
    await repository.put('understanding_cards', buildUnderstandingCard({
      id: 'UC-WORDS-0001', learner_ref: 'LR-2', example, observations: [], explain_back: words
    }));
    const reopened = createRepository(fileAdapter(directory));
    const back = await reopened.get('understanding_cards', 'UC-WORDS-0001');
    assert.equal(back.explain_back.child_words, words);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('records are append-only; an overwrite is refused by code, not by convention', async () => {
  const repository = createRepository(memoryAdapter());
  await repository.put('understanding_cards', sampleCard('UC-A'));
  await assert.rejects(
    () => repository.put('understanding_cards', sampleCard('UC-A')),
    error => {
      assert.ok(error instanceof PersistenceError);
      assert.equal(error.code, 'IMMUTABLE_RECORD');
      assert.match(error.message, /append-only/);
      return true;
    }
  );
});

test('a correction writes a new version and the original stays readable', async () => {
  const repository = createRepository(memoryAdapter());
  const first = sampleCard('UC-B');
  await repository.put('understanding_cards', first);
  const second = superseding(first, { recorded_by: 'a later reading' });
  await repository.put('understanding_cards', second);

  const original = await repository.get('understanding_cards', 'UC-B');
  assert.equal(original.recorded_by, 'test suite', 'the original was changed');

  const current = await repository.current('understanding_cards', 'UC-B');
  assert.equal(current.id, second.id);
  assert.equal(current.recorded_by, 'a later reading');

  const history = await repository.history('understanding_cards', second.id);
  assert.deepEqual(history.map(h => h.version), [1, 2]);
});

test('a record without an id is refused', async () => {
  const repository = createRepository(memoryAdapter());
  await assert.rejects(() => repository.put('understanding_cards', { learner_ref: 'x' }), /needs an id/);
});

test('an unknown collection is refused rather than silently created', async () => {
  const repository = createRepository(memoryAdapter());
  await assert.rejects(() => repository.put('whatever', { id: '1' }), /unknown collection/);
  assert.ok(COLLECTIONS.includes('understanding_cards'));
  assert.ok(COLLECTIONS.includes('layer_observations'));
});

test('a repository needs a real adapter', () => {
  assert.throws(() => createRepository(null), /adapter with read and write/);
  assert.throws(() => createRepository({ read() {} }), /adapter with read and write/);
});

test('the browser storage adapter round-trips through a storage-shaped object', async () => {
  const backing = new Map();
  const storage = {
    getItem: key => (backing.has(key) ? backing.get(key) : null),
    setItem: (key, value) => backing.set(key, String(value))
  };
  const result = await verifyPersistence(() => browserStorageAdapter(storage), sampleCard('UC-BROWSER-0001'));
  assert.equal(result.ok, true);
  assert.ok([...backing.keys()].some(k => k.startsWith('thy_math_')));
});

test('a storage refusal is reported as a persistence error, not swallowed', async () => {
  const storage = { getItem: () => '[]', setItem: () => { throw new Error('quota'); } };
  const repository = createRepository(browserStorageAdapter(storage));
  await assert.rejects(() => repository.put('understanding_cards', sampleCard('UC-FULL')), /browser storage refused/);
});

test('listing and counting work against a filter', async () => {
  const repository = createRepository(memoryAdapter());
  await repository.put('understanding_cards', sampleCard('UC-C1'));
  await repository.put('understanding_cards', { ...sampleCard('UC-C2'), learner_ref: 'LR-OTHER' });
  assert.equal(await repository.count('understanding_cards'), 2);
  const mine = await repository.list('understanding_cards', c => c.learner_ref === 'LR-TEST-001');
  assert.equal(mine.length, 1);
});

test('the backend row shape carries the refusal fields, not just the score', () => {
  const row = toRow(sampleCard('UC-ROW'));
  assert.equal(row.id, 'UC-ROW');
  assert.equal(row.layer_l, 0);
  assert.equal(row.layer_m, 1);
  assert.equal(row.layer_s, null);
  assert.equal(row.layer_s_isolated, false);
  assert.deepEqual(row.not_measured, ['S']);
  assert.ok(row.not_measured_statement.length > 0);
  assert.ok(row.refused_claims.includes('PROCEDURE_DEFICIT'));
  assert.equal(row.explain_back_child_words, 'The beads that are still in the tin.');
  assert.equal(typeof row.language_load, 'number');
});
