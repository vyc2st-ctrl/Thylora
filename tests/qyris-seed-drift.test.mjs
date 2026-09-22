import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { PREMARRIAGE_PACK } from '../qyris/data/premarriage-pack.js';
import { flatten } from '../qyris/lib/grammar.js';
import { projectAll, DOMAIN_IDS } from '../qyris/lib/industry.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (relative) => readFileSync(join(ROOT, relative), 'utf8');

// ONE SOURCE OF TRUTH. The SQL seeds are generated from the JS modules. If
// someone edits the SQL by hand, this test fails rather than the database and
// the surface quietly disagreeing about what a question says.
test('the committed SQL seeds match the JS source of truth', () => {
  assert.doesNotThrow(() => {
    execFileSync('node', ['db/qyris/generate-seed.mjs', '--check'], { cwd: ROOT, stdio: 'pipe' });
  }, 'run: node db/qyris/generate-seed.mjs');
});

test('the generated seeds are marked as generated', () => {
  for (const file of ['db/qyris/0002_premarriage_pack.sql', 'db/qyris/0003_industry_template.sql']) {
    assert.match(read(file), /GENERATED FILE — DO NOT EDIT BY HAND/);
  }
});

test('every pack question reaches the SQL seed', () => {
  const sql = read('db/qyris/0002_premarriage_pack.sql');
  for (const { node } of flatten(PREMARRIAGE_PACK)) {
    assert.ok(sql.includes(`('${node.id}', 'QYRIS-PREMARRIAGE-001'`), `${node.id} is missing from the seed`);
    // The question text itself, with SQL quoting applied.
    assert.ok(sql.includes(node.question.replace(/'/g, "''")), `${node.id} question text is missing`);
    assert.ok(sql.includes(node.safeguard.replace(/'/g, "''")), `${node.id} safeguard text is missing`);
  }
});

test('every projected question reaches the SQL seed with its provenance', () => {
  const sql = read('db/qyris/0003_industry_template.sql');
  const all = projectAll();
  for (const domainId of DOMAIN_IDS) {
    for (const node of all[domainId]) {
      assert.ok(sql.includes(`('${node.id}', 'QYRIS-INDUSTRY-001'`), `${node.id} is missing from the seed`);
      assert.ok(sql.includes(node.question.replace(/'/g, "''")), `${node.id} question text is missing`);
    }
  }
  assert.match(sql, /insert into qyr_projections/);
});

test('the seed inserts are upserts, so a second application is a no-op', () => {
  for (const file of ['db/qyris/0002_premarriage_pack.sql', 'db/qyris/0003_industry_template.sql']) {
    const sql = read(file);
    const inserts = (sql.match(/^insert into /gm) ?? []).length;
    const conflicts = (sql.match(/^on conflict /gm) ?? []).length;
    assert.equal(inserts, conflicts, `${file} has an insert with no conflict clause`);
  }
});

// The migrations are held for Chairman application. These checks read the SQL
// rather than a database, so they run everywhere npm test runs.
test('the schema has no state that means inquiry is finished', () => {
  const sql = read('db/qyris/0001_qyris_grammar.sql');
  assert.match(sql, /state in \('OPEN_ACTIVE','OPEN_PAUSED'\)/);
  assert.match(sql, /qyr_passes_never_finished/);
  for (const terminal of ['CLOSED', 'COMPLETE', 'FINISHED', 'DONE', 'EXHAUSTED', 'FINAL']) {
    assert.ok(sql.includes(`'${terminal}'`), `${terminal} is not explicitly refused`);
  }
});

test('the schema refuses a question with no safeguard', () => {
  const sql = read('db/qyris/0001_qyris_grammar.sql');
  assert.match(sql, /qyr_nodes_safeguard_present check \(length\(btrim\(safeguard\)\) >= 8\)/);
});

test('the schema enforces ACCESS is not AUTHORITY', () => {
  const sql = read('db/qyris/0004_trusted_six_support.sql');
  assert.match(sql, /qyr_seats_no_authority check \(decision_rights = 'NONE'\)/);
});

test('the schema enforces the Trusted Six limit', () => {
  const sql = read('db/qyris/0004_trusted_six_support.sql');
  assert.match(sql, /seat_limit check \(seat_limit between 1 and 6\)/);
  assert.match(sql, /TRUSTED_SIX_LIMIT/);
});

test('the schema makes the audit trail append-only', () => {
  const sql = read('db/qyris/0005_support_integrity.sql');
  assert.match(sql, /qyr_audit_no_update before update on qyr_audit/);
  assert.match(sql, /qyr_audit_no_delete before delete on qyr_audit/);
});

test('the schema refuses to canonize SR', () => {
  const sql = read('db/qyris/0006_sr_candidate.sql');
  assert.match(sql, /qyr_sr_not_canon check \(canon is false\)/);
  assert.match(sql, /SR_NOT_CANON/);
  assert.match(sql, /qyr_sr_obs_unknown_has_no_value/);
});

test('standing down carries no penalty in the schema either', () => {
  const sql = read('db/qyris/0005_support_integrity.sql');
  assert.match(sql, /qyr_dq_no_penalty  check \(penalty = 'NONE'\)/);
  assert.match(sql, /qyr_dq_no_demotion check \(standing = 'UNCHANGED'\)/);
});

test('registry links are guarded, because the live backend could not be inspected', () => {
  const sql = read('db/qyris/0009_registry_link.sql');
  const guards = (sql.match(/to_regclass/g) ?? []).length;
  assert.ok(guards >= 8, `only ${guards} to_regclass guards`);
});
