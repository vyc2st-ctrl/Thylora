// THYLORA · the held migrations
//
// No PostgreSQL server was reachable from the build session, so these tests do
// not claim the migrations apply. They check the properties that would be
// expensive to discover later: that the file set is additive, that the hard rule
// is carried as a constraint rather than as a comment, and that no column exists
// for the things this schema refuses to hold.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const schema = join(here, '..', 'db', 'math-surface');
const files = readdirSync(schema).filter(f => f.endsWith('.sql')).sort();
const all = files.map(f => readFileSync(join(schema, f), 'utf8')).join('\n');

// The same SQL with comment lines removed, for checks about what the schema
// actually declares rather than what it explains about itself.
const declarations = all
  .split('\n')
  .filter(line => !/^\s*--/.test(line))
  .join('\n');

test('the migration set is numbered and complete', () => {
  assert.deepEqual(files, [
    '0001_model_registry.sql',
    '0002_learners_observations.sql',
    '0003_understanding_cards.sql',
    '0004_protocols.sql',
    '0005_rls_policies.sql',
    '0006_functions.sql'
  ]);
});

test('every migration is a single transaction', () => {
  for (const file of files) {
    const sql = readFileSync(join(schema, file), 'utf8');
    assert.match(sql, /^\s*(--[^\n]*\n|\s)*begin;/m, `${file} does not open a transaction`);
    assert.match(sql.trimEnd(), /commit;$/, `${file} does not commit`);
    assert.equal((sql.match(/^begin;$/gm) ?? []).length, 1, `${file} opens more than one transaction`);
  }
});

test('nothing existing is dropped, renamed or rewritten', () => {
  assert.ok(!/drop table/i.test(all), 'a migration drops a table');
  assert.ok(!/alter table\s+(?!thy_)/i.test(all), 'a migration alters a table outside this lane');
  assert.ok(!/rename to/i.test(all), 'a migration renames an object');
  assert.ok(!/truncate/i.test(all), 'a migration truncates');
  // The only drops permitted are the idempotent trigger re-creations in this lane.
  for (const match of all.matchAll(/drop (\w+) if exists ([\w.]+)/gi)) {
    assert.equal(match[1].toLowerCase(), 'trigger', `unexpected drop of a ${match[1]}`);
    assert.match(match[2], /^thy_/, `dropped trigger ${match[2]} is outside this lane`);
  }
});

test('every new object is namespaced to this lane', () => {
  for (const match of all.matchAll(/create table if not exists (\w+)/gi)) {
    assert.match(match[1], /^thy_/, `${match[1]} is not namespaced`);
  }
  for (const match of all.matchAll(/create or replace function (\w+)/gi)) {
    assert.match(match[1], /^thy_/, `${match[1]} is not namespaced`);
  }
});

test('the hard rule is carried as a check constraint, not a comment', () => {
  assert.match(all, /constraint thy_math_card_math_claim_requires_isolated_m check \(/);
  assert.match(all, /not \('MATH_DEFICIT' = any\(claims_made\)\) or layer_m_isolated/);
});

test('an undetermined product may not carry a value', () => {
  assert.match(all, /constraint thy_math_card_undetermined_has_no_value/);
  assert.match(all, /p_solve_determined or p_solve_value is null/);
});

test('p_solve returns null for an unmeasured factor and zero only for a measured one', () => {
  const sql = readFileSync(join(schema, '0006_functions.sql'), 'utf8');
  assert.match(sql, /when p_l = 0 or p_m = 0 or p_s = 0 then 0/);
  assert.match(sql, /when p_l is null or p_m is null or p_s is null then null/);
  // the null branch must come after the zero branch, or a measured zero would be lost
  assert.ok(
    sql.indexOf('when p_l = 0 or p_m = 0 or p_s = 0 then 0') < sql.indexOf('when p_l is null or p_m is null or p_s is null then null'),
    'the zero branch must be evaluated before the null branch'
  );
});

test('cards are append-only at the database, not only in the client', () => {
  assert.match(all, /create trigger thy_math_cards_no_update/);
  assert.match(all, /before update or delete on thy_math_understanding_cards/);
  assert.match(all, /append-only/i);
});

test('every unmeasured layer must be listed on the card', () => {
  assert.match(all, /constraint thy_math_card_unmeasured_listed/);
  assert.match(all, /layer_m_isolated or 'M' = any\(not_measured\)/);
});

test('row level security is enabled on every table this lane creates', () => {
  const created = [...all.matchAll(/create table if not exists (\w+)/gi)].map(m => m[1]);
  const secured = [...all.matchAll(/alter table (\w+)\s+enable row level security/gi)].map(m => m[1]);
  for (const table of created) {
    assert.ok(secured.includes(table), `${table} has no row level security`);
  }
  assert.ok(created.length >= 10, `only ${created.length} tables created`);
});

test('a child record is owner-scoped and there is no school-wide read', () => {
  const rls = readFileSync(join(schema, '0005_rls_policies.sql'), 'utf8');
  assert.match(rls, /thy_math_cards_owner_read/);
  assert.match(rls, /owner_user_id = auth\.uid\(\)/);
  assert.ok(!/for select using \(true\)/.test(rls.split('--- a child')[1] ?? ''), 'a child record is readable by everyone');
});

test('there is no column for identity, diagnosis or medical detail', () => {
  const forbidden = [
    /\bdate_of_birth\b/i, /\bdob\b/i, /\bssn\b/i, /\bsocial_security\b/i,
    /\bdiagnosis\b/i, /\bmedical_/i, /\biep\b/i, /\blegal_name\b/i,
    /\bgrade_level\b/i, /\bpercentile\b/i, /\biq\b/i
  ];
  for (const pattern of forbidden) {
    assert.ok(!pattern.test(declarations), `the schema declares something matching ${pattern}`);
  }
  // The refusal is also stated in prose, so a reader knows it was a decision.
  assert.match(all, /no medical detail|medical note or a diagnosis/i);
});

test('the protected-name rule reaches the columns that hold child-facing text', () => {
  assert.match(all, /constraint thy_math_example_no_protected_name/);
  assert.match(all, /constraint thy_math_learner_ref_no_protected_name/);
  assert.match(all, /constraint thy_math_card_no_protected_name/);
  assert.match(all, /create or replace function thy_math_name_rule_ok/);
});

test('a voice line cannot be changed without a declared mutation', () => {
  assert.match(all, /THY-VOICE-PROMPT-NO-SILENT-MUTATION-001: changing voice line/);
  assert.match(all, /create trigger thy_voice_lines_declared/);
});

test('a workstream cannot be closed silently', () => {
  assert.match(all, /constraint thy_workstream_closure_is_stated/);
  const rows = [...all.matchAll(/\('(WS-[A-Z0-9-]+)'/g)].map(m => m[1]);
  for (const required of ['WS-DASHBOARD-AUTHORITY', 'WS-RAELINK', 'WS-APP-BUILD7', 'WS-SPINE-VOICE']) {
    assert.ok(rows.includes(required), `${required} is not seeded into the workstream manifest`);
  }
});

test('the README states the application status honestly', () => {
  const readme = readFileSync(join(schema, 'README.md'), 'utf8');
  assert.match(readme, /not applied by this repository/i);
  assert.match(readme, /have \*\*not\*\* been applied|not been applied/i);
  assert.match(readme, /no claim is made/i);
});
