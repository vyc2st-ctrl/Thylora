// THY-CONTINUITY-WATCHDOG-001 · the alert record, and what it has to carry.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { alertRecord, postTask, preTask } from '../spine/continuity/watchdog.mjs';
import { extendField } from '../spine/continuity/fields.mjs';

const NOW = '2026-09-18T12:00:00.000Z';

const facts = [
  { subject_kind: 'PERSON', subject_ref: 'P-001', field_key: 'names',
    value: 'Ada Vyc2st', sequence_no: 469, recorded_at: NOW },
  { subject_kind: 'PERSON', subject_ref: 'P-001', field_key: 'identity',
    value: 'THY-ID-0001', sequence_no: 469, recorded_at: NOW }
];

const held = () => {
  const brief = preTask({ task_ref: 'T-ALERT', sequence_no: 470, now: NOW }, { facts });
  return postTask(brief, { 'P-001': { names: 'Ada Vycst', identity: 'THY-ID-0001' } }, { now: NOW });
};

test('a clean check raises no alert at all', () => {
  const brief = preTask({ task_ref: 'T-CLEAN', sequence_no: 470, now: NOW }, { facts });
  const check = postTask(brief, { 'P-001': { names: 'Ada Vyc2st', identity: 'THY-ID-0001' } }, { now: NOW });
  assert.equal(check.alert, null);
  assert.equal(check.D, 0);
});

test('a hard-watch breach raises HOLD and refuses to proceed', () => {
  const alert = held().alert;
  assert.equal(alert.severity, 'HOLD');
  assert.equal(alert.state, 'OPEN');
  assert.equal(alert.proceed_allowed, false);
  assert.equal(alert.D, 1);
  assert.match(alert.headline, /^HOLD · 1 hard-watch field\(s\)/);
});

test('the alert names the field, both values and the reason, not just a count', () => {
  const [breach] = held().alert.breaches;
  assert.equal(breach.field_key, 'names');
  assert.equal(breach.subject_ref, 'P-001');
  assert.equal(breach.controlling, 'Ada Vyc2st');
  assert.equal(breach.current, 'Ada Vycst');
  assert.equal(breach.classification, 'DRIFTED');
  assert.ok(breach.detail.length > 0);
});

test('the alert carries the evidence needed to re-run the comparison', () => {
  const check = held();
  assert.equal(check.alert.evidence.brief_digest, check.brief_digest);
  assert.equal(check.alert.evidence.produced_digest, check.produced_digest);
  assert.equal(check.alert.evidence.field_count, 2);
  assert.equal(check.alert.evidence.breach_count, 1);
  assert.equal(check.alert.evidence.hard_breach_count, 1);
});

test('a soft-watch breach warns rather than holds', () => {
  const spec = extendField({ key: 'render_seed', kind: 'SCALAR', rule: 'IMMUTABLE' });
  const brief = preTask({ task_ref: 'T-WARN', sequence_no: 470, now: NOW }, {
    facts: [{ subject_ref: 'W-1', field_key: 'render_seed', value: 'a', sequence_no: 1, recorded_at: NOW }],
    extraFields: { render_seed: spec }
  });
  const check = postTask(brief, { 'W-1': { render_seed: 'b' } }, { now: NOW });
  assert.equal(check.alert.severity, 'WARN');
  assert.equal(check.alert.proceed_allowed, true);
});

test('the alert code is stable for the same breach and different for another', () => {
  assert.equal(held().alert.alert_code, held().alert.alert_code);
  const other = preTask({ task_ref: 'T-OTHER', sequence_no: 470, now: NOW }, { facts });
  const otherCheck = postTask(other, { 'P-001': { names: 'Ada Vyc2st', identity: 'THY-ID-0002' } }, { now: NOW });
  assert.notEqual(held().alert.alert_code, otherCheck.alert.alert_code);
  assert.match(held().alert.alert_code, /^THY-CONT-470-[0-9A-F]{8}$/);
});

test('every breach classification is counted by name', () => {
  const alert = alertRecord({
    task_ref: 'T-COUNT', phase: 'POST', sequence_no: 470, checked_at: NOW, D: 1,
    findings: [
      { field_key: 'names', classification: 'DRIFTED', hard_watch: true },
      { field_key: 'identity', classification: 'MISSING', hard_watch: true },
      { field_key: 'barrier', classification: 'CONFLICTING', hard_watch: true },
      { field_key: 'ages', classification: 'ADVANCED', hard_watch: true },
      { field_key: 'price', classification: 'UNCHANGED', hard_watch: true }
    ]
  });
  assert.deepEqual(alert.counts, { DRIFTED: 1, MISSING: 1, CONFLICTING: 1 });
  assert.equal(alert.breaches.length, 3);
  assert.equal(alert.severity, 'HOLD');
});

test('a PRE conflict raises its own alert before any work is done', () => {
  const brief = preTask({ task_ref: 'T-PRE', sequence_no: 470, now: NOW }, {
    facts: [
      { subject_ref: 'P-001', field_key: 'barrier', value: 'SEALED', sequence_no: 469, recorded_at: NOW },
      { subject_ref: 'P-001', field_key: 'barrier', value: 'OPEN', sequence_no: 470, recorded_at: NOW }
    ]
  });
  assert.equal(brief.alert.phase, 'PRE');
  assert.equal(brief.alert.severity, 'HOLD');
  assert.equal(brief.alert.breaches[0].classification, 'CONFLICTING');
  assert.equal(brief.proceed_allowed, false);
});
