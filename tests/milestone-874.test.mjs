// THY-WORK-MILESTONE-874-588 — do not manufacture sequences, and never read
// "we did not look" as zero.
//
// Two failures are easy here and both are permanent once they happen: writing
// 874 into the ledger early so the comparison has something to point at, and
// storing an unread number as 0 so a chart has a bar. These tests pin the SQL
// that refuses both.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

const DIR = 'db/milestone-874';
const files = readdirSync(DIR).filter((f) => f.endsWith('.sql')).sort();
const sql = Object.fromEntries(files.map((f) => [f, readFileSync(`${DIR}/${f}`, 'utf8')]));

const REQUIRED_MEASURES = [
  'ELAPSED_TIME', 'REVENUE', 'LIVE_PRODUCTS', 'ORDERS', 'CONVERSION',
  'SOCIAL', 'DASHBOARD_APP', 'WORLD_WINDOWS', 'GATE_HEALTH', 'CANON_CHANGES'
];

test('the pack applies in a documented numeric order', () => {
  assert.deepEqual(files, [
    '0001_milestone_floor.sql', '0002_compare.sql',
    '0003_seed_floor_588.sql', '0004_rls_policies.sql'
  ]);
});

test('all ten named measures are defined, in the order they were named', () => {
  const schema = sql['0001_milestone_floor.sql'];
  const defined = [...schema.matchAll(/\('([A-Z_]+)',\s*\d+,'/g)].map((m) => m[1]);
  assert.deepEqual(defined, REQUIRED_MEASURES);
});

test('DO NOT MANUFACTURE SEQUENCES: a reading needs a sequence that already exists', () => {
  const schema = sql['0001_milestone_floor.sql'];
  assert.match(schema, /MILESTONE_UNRECORDED_SEQUENCE/);
  assert.match(schema, /if not thy_milestone_sequence_exists\(p_milestone_no\)/);
  // And the ledger is consulted, not assumed.
  assert.match(schema, /select exists \(select 1 from thy_sequence_ledger where sequence_no = \$1\)/);
});

test('a missing ledger is reported, never treated as an empty one', () => {
  assert.match(sql['0001_milestone_floor.sql'], /MILESTONE_NO_LEDGER/);
  assert.match(sql['0002_compare.sql'], /The sequence ledger is not present in this database/);
});

test('the comparison refuses while 874 is in the future, and says how far', () => {
  const compare = sql['0002_compare.sql'];
  assert.match(compare, /'comparable', false/);
  assert.match(compare, /sequences_remaining/);
  assert.match(compare, /not one of them may be written to reach this milestone/);
});

test('UNMEASURED is not zero: an unmeasured reading cannot carry a number', () => {
  const schema = sql['0001_milestone_floor.sql'];
  assert.match(schema, /thy_milestone_reading_unmeasured_has_no_number/);
  assert.match(schema, /measurement_state = 'MEASURED' or value_numeric is null/);
  assert.match(schema, /thy_milestone_reading_unmeasured_says_why/);
  assert.match(schema, /thy_milestone_reading_measured_has_value/);
});

test('a delta is only reported where both ends were measured', () => {
  const compare = sql['0002_compare.sql'];
  assert.match(compare, /when f\.measurement_state = 'MEASURED' and t\.measurement_state = 'MEASURED'/);
  assert.match(compare, /NO DELTA/);
  assert.match(compare,
    /A difference between a measurement and a non-measurement is not a number/);
});

test('a recorded reading is never revised', () => {
  const schema = sql['0001_milestone_floor.sql'];
  assert.match(schema, /MILESTONE_READING_IMMUTABLE/);
  assert.match(schema, /before update or delete on thy_milestone_reading/);
  assert.match(schema, /unique \(milestone_no, metric_key\)/);
});

test('the 588 floor records all ten measures, and no commerce number it did not read', () => {
  const seed = sql['0003_seed_floor_588.sql'];
  for (const measure of REQUIRED_MEASURES) {
    assert.match(seed, new RegExp(`'${measure}'`), `${measure} has no reading at the 588 floor`);
  }
  // Revenue, orders and live products were not reachable and must say so.
  for (const measure of ['REVENUE', 'LIVE_PRODUCTS', 'ORDERS']) {
    const row = seed.match(new RegExp(`'${measure}','([A-Z_]+)'`));
    assert.ok(row, `${measure} has no measurement state`);
    assert.ok(['UNREACHABLE', 'UNMEASURED'].includes(row[1]),
      `${measure} is recorded as ${row[1]} at 588, but no backend row was read`);
  }
});

test('the counted measures are counted at apply time, not typed in', () => {
  const seed = sql['0003_seed_floor_588.sql'];
  assert.match(seed, /select count\(\*\)[\s\S]*?from thy_gate_law/,
    'gate health is a typed-in number rather than a count');
  assert.match(seed, /select count\(\*\) into v_canon from thy_omniview_statements/,
    'canon changes is a typed-in number rather than a count');
});

test('a measure whose source pack is absent is reported, not skipped', () => {
  const seed = sql['0003_seed_floor_588.sql'];
  assert.match(seed, /if to_regclass\('public\.thy_gate_law'\) is null then[\s\S]*?'UNMEASURED'/);
  assert.match(seed, /if to_regclass\('public\.thy_omniview_statements'\) is null then[\s\S]*?'UNMEASURED'/);
});

test('the floor is idempotent and never seeds against a sequence that has not happened', () => {
  const seed = sql['0003_seed_floor_588.sql'];
  assert.match(seed, /not exists \(select 1 from thy_sequence_ledger where sequence_no = v_seq\)/);
  assert.match(seed, /if exists \(select 1 from thy_milestone_reading where milestone_no = v_seq\)[\s\S]{0,40}return;/);
});

test('readings are not writable by signed-in sessions', () => {
  const rls = sql['0004_rls_policies.sql'];
  assert.match(rls, /for insert to service_role/);
  assert.doesNotMatch(rls, /for (update|delete)/);
  assert.match(rls, /grant execute on function thy_milestone_compare\(bigint, bigint\)\s+to authenticated/);
});
