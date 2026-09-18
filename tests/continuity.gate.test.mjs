// THY-CONTINUITY-WATCHDOG-001 · the gate a task actually runs inside.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { runGuarded, verdictLine } from '../spine/continuity/gate.mjs';

const NOW = '2026-09-18T12:00:00.000Z';
const facts = [
  { subject_kind: 'PERSON', subject_ref: 'P-001', field_key: 'names',
    value: 'Ada Vyc2st', sequence_no: 469, recorded_at: NOW },
  { subject_kind: 'PERSON', subject_ref: 'P-001', field_key: 'identity',
    value: 'THY-ID-0001', sequence_no: 469, recorded_at: NOW }
];
const task = { task_ref: 'T-GATE', sequence_no: 470, now: NOW };

test('a task that holds continuity passes the gate', async () => {
  const record = await runGuarded(task, { facts },
    async () => ({ 'P-001': { names: 'Ada Vyc2st', identity: 'THY-ID-0001' } }));
  assert.equal(record.state, 'PASSED');
  assert.equal(record.proceed_allowed, true);
  assert.equal(record.D, 0);
  assert.equal(record.alerts.length, 0);
  assert.match(verdictLine(record), /^PROCEED · T-GATE · D=0 · 2 field\(s\) checked\./);
});

test('a task that drifts is held at POST, with the field named', async () => {
  const record = await runGuarded(task, { facts },
    async () => ({ 'P-001': { names: 'Ada Vycst', identity: 'THY-ID-0001' } }));
  assert.equal(record.state, 'HELD_POST');
  assert.equal(record.proceed_allowed, false);
  assert.equal(record.alerts.length, 1);
  assert.equal(verdictLine(record), 'HOLD · T-GATE · D=1 · names DRIFTED');
});

test('a contradictory controlling set holds the task before any work runs', async () => {
  let ran = false;
  const record = await runGuarded(task, {
    facts: [
      { subject_ref: 'P-001', field_key: 'barrier', value: 'SEALED', sequence_no: 469, recorded_at: NOW },
      { subject_ref: 'P-001', field_key: 'barrier', value: 'OPEN', sequence_no: 470, recorded_at: NOW }
    ]
  }, async () => { ran = true; return {}; });

  assert.equal(record.state, 'HELD_PRE');
  assert.equal(ran, false, 'work must not run against a contradictory brief');
  assert.equal(record.post, null);
  assert.match(verdictLine(record), /barrier CONFLICTING/);
});

test('a vanished workstream holds the task even when every field matched', async () => {
  const record = await runGuarded(task, {
    facts,
    carryforward: {
      previous: ['WR-RAELINK-001', 'THY-CONTINUITY-WATCHDOG-001'],
      carried: ['WR-RAELINK-001']
    }
  }, async () => ({ 'P-001': { names: 'Ada Vyc2st', identity: 'THY-ID-0001' } }));

  assert.equal(record.post.proceed_allowed, true);
  assert.equal(record.state, 'HELD_CARRYFORWARD');
  assert.equal(record.proceed_allowed, false);
  assert.match(verdictLine(record), /active_workstreams:thy-continuity-watchdog-001 MISSING/);
});

test('a task that throws fails the gate rather than passing unchecked', async () => {
  const record = await runGuarded(task, { facts }, async () => { throw new Error('upstream down'); });
  assert.equal(record.state, 'FAILED');
  assert.equal(record.proceed_allowed, false);
  assert.match(verdictLine(record), /upstream down/);
});

test('the gate holds with no sink at all, and reports to one when given', async () => {
  const seen = [];
  const record = await runGuarded(task, { facts },
    async () => ({ 'P-001': { names: 'Ada Vycst' } }),
    { sink: async entry => { seen.push(entry.kind); } });
  assert.deepEqual(seen, ['PRE', 'POST']);
  assert.equal(record.state, 'HELD_POST');

  const noSink = await runGuarded(task, { facts }, async () => ({ 'P-001': { names: 'Ada Vycst' } }));
  assert.equal(noSink.state, 'HELD_POST');
});

test('the work step receives the sealed brief it must build against', async () => {
  let seenDigest = null;
  const record = await runGuarded(task, { facts }, async brief => {
    seenDigest = brief.brief_digest;
    return Object.fromEntries([['P-001', Object.fromEntries(
      brief.entries.map(entry => [entry.field_key, entry.value]))]]);
  });
  assert.equal(seenDigest, record.pre.brief_digest);
  assert.equal(record.state, 'PASSED');
});
