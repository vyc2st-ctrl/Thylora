// TALK WHILE WORKING · Phase-1 record tests
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { redact, validateRecord } from '../products/talk-while-working/record.js';

const base = () => ({
  record_id: 'TWW-0001',
  recorded_at: '2026-09-26T14:03:11Z',
  worker_ref: 'W-017',
  action: 'Replaced filter',
  object: 'HVAC unit 3 intake filter',
  location: 'Roof, north side',
  reason: 'Scheduled quarterly change',
  delta: 'Old filter grey and clogged; new filter installed, airflow restored',
  safety_note: 'Harness clipped to anchor B before approaching edge',
  completion_witness: { type: 'PHOTO', ref: 'local://photo/123', claimed_complete: true },
  worker_correction: null,
  privacy: { recording_consent: 'SELF_ONLY', contains_minor: false, contains_health_info: false, redacted: false }
});

test('an unredacted record is not shareable', () => {
  assert.ok(validateRecord(base()).includes('NOT_REDACTED'));
});

test('a complete, reviewed, redacted record is shareable', () => {
  assert.deepEqual(validateRecord(redact(base())), []);
});

test('redaction removes emails, phones and named people and records what it did', () => {
  const r = base();
  r.reason = 'Tenant Maria Lopez called from 206-555-0143, email maria@example.com';
  const out = redact(r, ['Maria Lopez']);
  assert.equal(out.reason, 'Tenant [NAME] called from [PHONE], email [EMAIL]');
  assert.deepEqual(out.privacy.redactions_applied, ['EMAIL', 'NAME', 'PHONE']);
  assert.equal(r.reason.includes('Maria'), true, 'input not mutated');
});

test('claiming completion with no witness is refused', () => {
  const r = redact(base());
  r.completion_witness = { type: 'NONE', claimed_complete: true };
  assert.ok(validateRecord(r).includes('COMPLETION_CLAIMED_WITHOUT_WITNESS'));
});

test('recording others without consent is refused', () => {
  const r = redact(base());
  r.privacy.recording_consent = 'UNKNOWN';
  assert.ok(validateRecord(r).includes('RECORDING_CONSENT_UNSET'));
});

test('minors or health information escalate', () => {
  const r = redact(base());
  r.privacy.contains_health_info = true;
  assert.ok(validateRecord(r).includes('ESCALATE_SENSITIVE'));
});

test('an unsaid field stays null and is allowed; unknown fields are not', () => {
  const r = redact(base());
  r.location = null;
  assert.deepEqual(validateRecord(r), []);
  r.gps = '47.4,-122.4';
  assert.ok(validateRecord(r).includes('UNKNOWN_FIELD_gps'));
});

test('the worker review step cannot be skipped', () => {
  const r = redact(base());
  delete r.worker_correction;
  assert.ok(validateRecord(r).includes('WORKER_REVIEW_MISSING'));
});
