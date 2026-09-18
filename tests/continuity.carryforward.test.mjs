// THY-CONTINUITY-WATCHDOG-001 · an active workstream that silently disappears.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { carryforwardGap, postTask, preTask } from '../spine/continuity/watchdog.mjs';

const NOW = '2026-09-18T12:00:00.000Z';
const ACTIVE = ['WR-RAELINK-001', 'THY-CONTINUITY-WATCHDOG-001', 'WR-TIMERUN-001'];

test('a workstream carried forward unchanged raises nothing', () => {
  const gap = carryforwardGap(ACTIVE, ACTIVE, { now: NOW, sequence_no: 470 });
  assert.equal(gap.D, 0);
  assert.equal(gap.proceed_allowed, true);
  assert.deepEqual(gap.vanished, []);
});

test('a workstream that vanishes with no closure record holds, and is named', () => {
  const gap = carryforwardGap(ACTIVE, ['WR-RAELINK-001', 'WR-TIMERUN-001'],
    { now: NOW, sequence_no: 470 });
  assert.equal(gap.D, 1);
  assert.equal(gap.proceed_allowed, false);
  assert.deepEqual(gap.vanished, ['thy-continuity-watchdog-001']);
  assert.match(gap.detail, /disappeared from carryforward with no closure record/);
});

test('a workstream closed on the record is accounted for, not lost', () => {
  const gap = carryforwardGap(ACTIVE, ['WR-RAELINK-001', 'THY-CONTINUITY-WATCHDOG-001'],
    { closed: ['WR-TIMERUN-001'], now: NOW });
  assert.equal(gap.proceed_allowed, true);
  assert.deepEqual(gap.vanished, []);
  assert.deepEqual(gap.closed_with_record, ['wr-timerun-001']);
});

test('several vanishing at once are all named, not just the first', () => {
  const gap = carryforwardGap(ACTIVE, ['WR-RAELINK-001'], { now: NOW });
  assert.equal(gap.vanished.length, 2);
  assert.equal(gap.previous_count, 3);
  assert.equal(gap.carried_count, 1);
});

test('a new workstream appearing is an addition, not a breach', () => {
  const gap = carryforwardGap(ACTIVE, [...ACTIVE, 'WR-NEW-004'], { now: NOW });
  assert.deepEqual(gap.added, ['wr-new-004']);
  assert.equal(gap.proceed_allowed, true);
});

test('an empty carryforward is the loudest case, not the quietest', () => {
  const gap = carryforwardGap(ACTIVE, [], { now: NOW });
  assert.equal(gap.vanished.length, 3);
  assert.equal(gap.proceed_allowed, false);
});

test('carryforward loss also surfaces through the ordinary field check', () => {
  const facts = [{
    subject_kind: 'SPINE', subject_ref: 'SEQ', field_key: 'active_workstreams',
    value: ACTIVE, sequence_no: 469, recorded_at: NOW
  }];
  const brief = preTask({ task_ref: 'T-CARRY', sequence_no: 470, now: NOW }, { facts });
  const check = postTask(brief, {
    SEQ: { active_workstreams: ['WR-RAELINK-001', 'WR-TIMERUN-001'] }
  }, { now: NOW });

  assert.equal(check.findings[0].classification, 'MISSING');
  assert.equal(check.proceed_allowed, false);
  assert.equal(check.alert.severity, 'HOLD');
  assert.match(check.findings[0].detail, /thy-continuity-watchdog-001/);
});

test('a carryforward that only grows advances the field rather than holding it', () => {
  const facts = [{
    subject_kind: 'SPINE', subject_ref: 'SEQ', field_key: 'active_workstreams',
    value: ACTIVE, sequence_no: 469, recorded_at: NOW
  }];
  const brief = preTask({ task_ref: 'T-CARRY-2', sequence_no: 470, now: NOW }, { facts });
  const check = postTask(brief, { SEQ: { active_workstreams: [...ACTIVE, 'WR-NEW-004'] } }, { now: NOW });
  assert.equal(check.findings[0].classification, 'ADVANCED');
  assert.equal(check.proceed_allowed, true);
});
