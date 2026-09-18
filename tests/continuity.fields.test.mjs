// THY-CONTINUITY-WATCHDOG-001 · the watch registry, and its parity with SQL.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { FIELDS, extendField, fieldSpec, hardWatchKeys } from '../spine/continuity/fields.mjs';

const MIGRATION = fileURLToPath(new URL('../db/continuity/0001_continuity_watchdog.sql', import.meta.url));

/** The nineteen fields the watchdog order named, in the order it named them. */
const ORDERED = [
  'names', 'ages', 'family_relationships', 'identity', 'geometry', 'dimensions',
  'world_coordinates', 'period_technology', 'visual_rules', 'barrier', 'vyc2st_mark',
  'rights', 'approval', 'publication_state', 'store_state', 'price', 'delivery',
  'person_state', 'active_workstreams'
];

test('every field in the watchdog order is registered, in order', () => {
  assert.deepEqual(FIELDS.map(f => f.key), ORDERED);
});

test('every registered field is hard-watch', () => {
  assert.equal(hardWatchKeys().length, ORDERED.length);
  for (const field of FIELDS) assert.equal(field.hard_watch, true, field.key);
});

test('every ladder field declares a ladder with at least two rungs', () => {
  for (const field of FIELDS.filter(f => f.rule === 'LADDER')) {
    assert.ok(Array.isArray(field.ladder), `${field.key} has no ladder`);
    assert.ok(field.ladder.length > 1, `${field.key} ladder is too short`);
  }
});

test('every field requiring authority is one a change should not self-authorize', () => {
  const requiring = FIELDS.filter(f => f.requires_authority).map(f => f.key);
  assert.deepEqual(requiring.sort(), [
    'approval', 'person_state', 'price', 'publication_state', 'rights', 'store_state'
  ]);
});

test('the SQL seed and this registry are the same registry', () => {
  const sql = readFileSync(MIGRATION, 'utf8');
  const block = sql.slice(
    sql.indexOf('insert into thy_continuity_fields'),
    sql.indexOf('on conflict (field_key)')
  ).replace(/\s+/g, ' ');

  const rows = [...block.matchAll(
    /\('([a-z0-9_]+)',\s*'([^']*)',\s*'(\w+)',\s*'(\w+)',\s*(true|false),\s*(null|array\[[^\]]*\]),\s*(\d+)\)/g
  )].map(m => ({
    key: m[1],
    label: m[2],
    kind: m[3],
    rule: m[4],
    requires_authority: m[5] === 'true',
    ladder: m[6] === 'null' ? null : m[6].slice(6, -1).split(',').map(s => s.trim().slice(1, -1)),
    watch_order: Number(m[7])
  }));

  assert.equal(rows.length, FIELDS.length, 'SQL seed row count differs from the JS registry');
  rows.forEach((row, index) => {
    const spec = FIELDS[index];
    assert.equal(row.key, spec.key);
    assert.equal(row.label, spec.label);
    assert.equal(row.kind, spec.kind);
    assert.equal(row.rule, spec.rule);
    assert.equal(row.requires_authority, spec.requires_authority, `${row.key} authority flag`);
    assert.deepEqual(row.ladder, spec.ladder ? [...spec.ladder] : null, `${row.key} ladder`);
    assert.equal(row.watch_order, index + 1, `${row.key} watch order`);
  });
});

test('an unregistered field has no spec rather than a guessed one', () => {
  assert.equal(fieldSpec('something_nobody_declared'), null);
});

test('an extension is soft-watch unless it says otherwise, and is validated', () => {
  const soft = extendField({ key: 'render_seed', kind: 'SCALAR', rule: 'IMMUTABLE' });
  assert.equal(soft.hard_watch, false);
  assert.throws(() => extendField({ kind: 'SCALAR', rule: 'IMMUTABLE' }), /KEY_REQUIRED/);
  assert.throws(() => extendField({ key: 'x', kind: 'COLOUR', rule: 'IMMUTABLE' }), /KIND_UNKNOWN/);
  assert.throws(() => extendField({ key: 'x', kind: 'SCALAR', rule: 'VIBES' }), /RULE_UNKNOWN/);
  assert.throws(() => extendField({ key: 'x', kind: 'LADDER', rule: 'LADDER' }), /LADDER_REQUIRED/);
});
