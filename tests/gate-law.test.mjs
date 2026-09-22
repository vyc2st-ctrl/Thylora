// THY-WORK-DYNAMIC-GATE-LAW-588 — the four laws, pinned.
//
// The gate law is enforced in the database. These tests pin the SQL that does
// the enforcing, so a later edit cannot soften a law by deleting a constraint
// and leaving the comment that describes it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

const DIR = 'db/gate-law';
const files = readdirSync(DIR).filter((f) => f.endsWith('.sql')).sort();
const sql = Object.fromEntries(files.map((f) => [f, readFileSync(`${DIR}/${f}`, 'utf8')]));
const all = Object.values(sql).join('\n');

test('the pack applies in a documented numeric order', () => {
  assert.deepEqual(files, [
    '0001_gate_law.sql', '0002_gate_read.sql', '0003_rls_policies.sql', '0004_seed_gate_law.sql'
  ]);
});

test('every gate carries all eleven fields', () => {
  const schema = sql['0001_gate_law.sql'];
  for (const column of [
    'scope', 'authority', 'evidence', 'context', 'trigger_condition',
    'gate_state', 'exception_clause', 'version', 'supersedes_version',
    'readback', 'next_review_utc'
  ]) {
    assert.match(schema, new RegExp(`^\\s{2}${column}\\s`, 'm'), `the gate law has no ${column} column`);
  }
});

test('the eleven fields are returned in the order the law names them', () => {
  const order = sql['0002_gate_read.sql'].match(/thy_gate_law_field_order[\s\S]*?jsonb_build_array\(([\s\S]*?)\)/);
  assert.ok(order, 'the field order is not returned as data');
  const names = [...order[1].matchAll(/'([A-Z_]+)'/g)].map((m) => m[1]);
  assert.deepEqual(names, [
    'SCOPE', 'AUTHORITY', 'EVIDENCE', 'CONTEXT', 'TRIGGER',
    'STATE', 'EXCEPTION', 'VERSION', 'SUPERSEDES', 'READBACK', 'NEXT_REVIEW'
  ]);
});

test('NO SILENT MUTATION: update and delete are refused at the table', () => {
  const schema = sql['0001_gate_law.sql'];
  assert.match(schema, /before update or delete on thy_gate_law/,
    'nothing stops a gate rule being edited in place');
  assert.match(schema, /GATE_LAW_IMMUTABLE/);
  // And no policy anywhere grants update or delete, to any role.
  assert.doesNotMatch(all, /create policy[\s\S]{0,120}on thy_gate_law\s+for (update|delete)/,
    'a policy grants update or delete on the gate law');
});

test('EXPLICIT SUPERSESSION ONLY: version 1 supersedes nothing, later versions must name it', () => {
  const schema = sql['0001_gate_law.sql'];
  assert.match(schema, /thy_gate_law_supersession_explicit/);
  assert.match(schema, /version = 1 and supersedes_version is null/);
  assert.match(schema, /version > 1 and supersedes_version is not null/);
});

test('NO OLD RULE OVERRIDING NEWER RULE: backwards-only, and against the current version', () => {
  const schema = sql['0001_gate_law.sql'];
  assert.match(schema, /supersedes_version is null or supersedes_version < version/,
    'a version can supersede one above it');
  assert.match(schema, /GATE_LAW_STALE_VERSION/, 'a version at or below the current one is accepted');
  assert.match(schema, /GATE_LAW_SUPERSEDES_MISMATCH/,
    'a rule drafted against an older version is accepted while a newer one is in force');
});

test('HOLD CURRENT RULE STRONGLY: the current rule is the highest version, never a filtered one', () => {
  const read = sql['0002_gate_read.sql'];
  assert.match(read, /create or replace view thy_gate_law_current[\s\S]*?order by gate_key, version desc/);
  // The current view must not filter by state: a PASSED or RETIRED rule is still
  // the rule in force, and hiding it would make a gate look undeclared.
  const view = read.match(/create or replace view thy_gate_law_current as([\s\S]*?);/)[1];
  assert.doesNotMatch(view, /where/i, 'the current-rule view filters rows');
});

test('silence is never read as permission', () => {
  const schema = sql['0001_gate_law.sql'];
  // EXCEPTION is not nullable: a gate with no exception must say NO EXCEPTION.
  assert.match(schema, /exception_clause\s+text\s+not null/);
  // NEXT REVIEW is answered with a date or a stated reason there is none.
  assert.match(schema, /thy_gate_law_review_answered/);
  assert.match(schema, /no_review_reason is not null/);
});

test('a state change is a new version, not an edit', () => {
  // There is no setter that changes gate_state in place anywhere in the pack.
  assert.doesNotMatch(all, /update thy_gate_law\s+set/i, 'something updates the gate law in place');
});

test('every seeded gate answers all eleven fields with something real', () => {
  const seed = sql['0004_seed_gate_law.sql'];
  const calls = [...seed.matchAll(/perform thy_gate_declare\(([\s\S]*?)\);/g)];
  assert.ok(calls.length >= 6, `expected the gates in force at 588, found ${calls.length}`);
  for (const [, body] of calls) {
    const key = (body.match(/'(GATE-[A-Z-]+)'/) || [])[1];
    assert.ok(key, 'a seeded gate has no key');
    assert.match(body, /NO EXCEPTION/, `${key} does not state its exception`);
    assert.match(body, /v_seq|588/, `${key} does not name the sequence that put it in force`);
    // Evidence must be a real reference or an explicit statement that there is none.
    assert.ok(/\.md|\.json|\.sql|\.mjs|run\.sh|No evidence|not reached|recorded/.test(body),
      `${key} cites no evidence and does not say it has none`);
  }
});

test('the seed is idempotent: it never writes a second version 1', () => {
  const seed = sql['0004_seed_gate_law.sql'];
  const declares = (seed.match(/perform thy_gate_declare\(/g) || []).length;
  const guards = (seed.match(/if not exists \(select 1 from thy_gate_law where gate_key =/g) || []).length;
  assert.equal(guards, declares, 'a declare is not guarded against re-application');
});

test('the write path is not exposed to signed-in sessions', () => {
  const rls = sql['0003_rls_policies.sql'];
  assert.match(rls, /revoke execute on function thy_gate_declare/);
  assert.match(rls, /revoke execute on function thy_gate_supersede/);
  assert.match(rls, /grant execute on function thy_gate_current\(text\)\s+to authenticated/);
});

test('the gate law claims no deployment authority', () => {
  const seed = sql['0004_seed_gate_law.sql'];
  // The authority gate itself must be BLOCKED and must name where authority lives.
  const gate = seed.match(/'GATE-DEPLOYMENT-AUTHORITY'[\s\S]*?\);/)[0];
  assert.match(gate, /'BLOCKED'/, 'the deployment-authority gate is not blocking');
  assert.match(gate, /thylora-executive-dashboard/);
  assert.match(gate, /thylora-public-world/);

  // Every mention of "live" anywhere in the pack must be a denial of liveness,
  // not a claim of it. This is checked sentence by sentence rather than by a
  // window around the word, so a claim cannot hide behind nearby prose.
  const sentences = all.split(/(?<=[.!?])\s+/).filter((x) => /\blive\b/i.test(x));
  assert.ok(sentences.length > 0, 'expected the pack to talk about liveness at all');
  for (const sentence of sentences) {
    assert.match(sentence, /\b(not|never|until|whether|nothing|held)\b/i,
      `a sentence claims liveness rather than denying it: ${sentence.trim().slice(0, 120)}`);
  }
});
