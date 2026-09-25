import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { claimGuard, validateLaneRecord, validateRun, QYRIS_2ST_FIELDS } from '../spine/lib/qyris2st.js';

const run = JSON.parse(readFileSync(new URL('../spine/lanes/ten-lane-run-001.json', import.meta.url)));

test('ten-lane run: all ten lanes satisfy QYRIS-2ST', () => {
  const r = validateRun(run);
  for (const l of r.results) assert.deepEqual(l.errors, [], l.lane_code);
  assert.equal(r.results.length, 10);
  assert.equal(r.ok, true);
});

test('every lane carries all twelve fields', () => {
  assert.equal(QYRIS_2ST_FIELDS.length, 12);
  for (const l of run.lanes) for (const f of QYRIS_2ST_FIELDS) assert.ok(l[f], `${l.lane_code}.${f}`);
});

test('claim guard flags unwitnessed claims', () => {
  assert.equal(claimGuard('The site is deployed and the contract signed.').length >= 1, true);
  assert.equal(claimGuard('Payment received from first customer.')[0].claim, 'payment');
  assert.equal(claimGuard('We represent families in court.')[0].claim, 'legal_representation');
});

test('claim guard respects negation', () => {
  assert.deepEqual(claimGuard('Nothing is deployed. The packet is not published.'), []);
  assert.deepEqual(claimGuard('THYLORA does not provide legal representation.'), []);
});

test('a lane cannot claim completion without a witness ref', () => {
  const lane = structuredClone(run.lanes[0]);
  lane.delta += ' Transmission is completed.';
  assert.equal(validateLaneRecord(lane).ok, false);
  lane.claims = [{ type: 'completion', witness_ref: 'CHAIRMAN_DIRECT phone witness 2026-09-24' }];
  assert.equal(validateLaneRecord(lane).ok, true);
});

test('missing field, bad witness and reasonless rejection are refused', () => {
  const lane = structuredClone(run.lanes[1]);
  lane.security = '';
  lane.witness = { class: 'BACKEND_READBACK', refs: [] };
  lane.rejected_options.push({ option: 'x' });
  const errs = validateLaneRecord(lane).errors.join('|');
  assert.match(errs, /security empty/);
  assert.match(errs, /witness refs required/);
  assert.match(errs, /without option\+reason/);
});

test('duplicate lane codes fail the run', () => {
  const r = validateRun({ lanes: [run.lanes[0], run.lanes[0]] });
  assert.equal(r.ok, false);
});
