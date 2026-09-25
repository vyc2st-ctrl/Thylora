import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validateWorksheet, validateRow, toSafetyCaseRows, blankWorksheet, rpn, REQUIRED_HAZARDS } from '../spine/lib/fmea.js';

const ws = JSON.parse(readFileSync(new URL('../spine/lanes/fmea-template-vehicle-001.json', import.meta.url)));

test('reference worksheet covers all hazards and passes', () => {
  const r = validateWorksheet(ws);
  assert.deepEqual(r.errors, []);
  assert.equal(r.certification, 'NONE — design review only');
  assert.equal(r.ranked[0].severity, 10);
});

test('egress row without zero-energy fallback fails', () => {
  const row = { ...ws.rows[0], zero_energy_fallback: null };
  assert.match(validateRow(row).join(), /zero_energy_fallback/);
  const powered = { ...ws.rows[0], zero_energy_fallback: { ...ws.rows[0].zero_energy_fallback, requires_power: true } };
  assert.match(validateRow(powered).join(), /no power/);
});

test('redundant channels on one power source are a common-cause failure', () => {
  const row = { ...ws.rows[2], channels: [{ name: 'a', power_source: 'X' }, { name: 'b', power_source: 'X' }] };
  assert.match(validateRow(row).join(), /common-cause/);
});

test('severity ≥ 9 needs action + owner even with low RPN', () => {
  const row = { ...ws.rows[3], severity: 9, occurrence: 1, detection: 1, action: '', owner: '' };
  assert.equal(rpn(row), 9);
  assert.match(validateRow(row).join(), /action \+ owner/);
});

test('missing hazards are reported; blank worksheet starts incomplete', () => {
  const partial = { ...ws, rows: ws.rows.slice(0, 3) };
  assert.match(validateWorksheet(partial).errors.join(), /hazards not examined/);
  const b = blankWorksheet('V1', 'VEHICLE');
  assert.equal(b.rows.length, REQUIRED_HAZARDS.length);
  assert.equal(validateWorksheet(b).ok, false);
});

test('export rows are always NOT_VALIDATED', () => {
  const rows = toSafetyCaseRows(ws);
  assert.equal(rows.length, ws.rows.length);
  assert.ok(rows.every(r => r.validation_state === 'NOT_VALIDATED' && r.vehicle_id === ws.subject_id));
});
