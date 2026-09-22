// THY-WORK-SEQUENCE-CHANGE-LEDGER-587 — ledger and read-model contract, server side.
//
// The database is the thing that actually enforces these rules, and
// db/omniview/validation/run.sh proves it against a real PostgreSQL. This suite
// is the cheap guard that runs everywhere: it fails if the migrations ever stop
// declaring a required column, a required rule, or a required step of the path.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

const DIR = 'db/omniview';
const files = readdirSync(DIR).filter((f) => f.endsWith('.sql')).sort();
const sql = Object.fromEntries(files.map((f) => [f, readFileSync(`${DIR}/${f}`, 'utf8')]));
const all = Object.values(sql).join('\n');

test('the pack applies in a documented numeric order', () => {
  assert.deepEqual(files, [
    '0001_sequence_ledger.sql', '0002_topic_manifest.sql', '0003_read_model.sql',
    '0004_write_path.sql', '0005_rls_policies.sql', '0006_seed_manifest.sql',
    '0007_prior_context.sql', '0008_topics_alistair_sports.sql'
  ]);
  const readme = readFileSync(`${DIR}/README.md`, 'utf8');
  for (const f of files) assert.ok(readme.includes(f), `${f} is not documented in the apply order`);
});

test('every sequence carries all twelve required fields', () => {
  const ledger = sql['0001_sequence_ledger.sql'];
  for (const column of [
    'sequence_no', 'previous_sequence_no', 'occurred_utc', 'occurred_local', 'local_timezone',
    'why_change_occurred', 'what_changed', 'why_it_changed', 'what_remained',
    'authority', 'truth_class', 'next_better_question', 'restart_point'
  ]) {
    assert.match(ledger, new RegExp(`^\\s{2}${column}\\s`, 'm'), `the ledger has no ${column} column`);
  }
});

test('the required ledger fields cannot be left blank', () => {
  const ledger = sql['0001_sequence_ledger.sql'];
  for (const column of [
    'why_change_occurred', 'what_changed', 'why_it_changed', 'what_remained',
    'authority', 'next_better_question', 'restart_point'
  ]) {
    assert.ok(ledger.includes(`length(btrim(${column}))`),
      `${column} can be recorded blank — it needs a non-empty check`);
  }
});

test('source history cannot be rewritten', () => {
  const ledger = sql['0001_sequence_ledger.sql'];
  assert.match(ledger, /before update or delete on thy_sequence_ledger/);
  assert.ok(ledger.includes('SEQUENCE_LEDGER_IMMUTABLE'));
  assert.match(sql['0002_topic_manifest.sql'], /before update or delete on thy_omniview_statements/);
  assert.ok(sql['0002_topic_manifest.sql'].includes('STATEMENT_IMMUTABLE'));
});

test('the sequence chain cannot be broken or back-dated', () => {
  const ledger = sql['0001_sequence_ledger.sql'];
  assert.ok(ledger.includes('SEQUENCE_CHAIN_BREAK'));
  assert.ok(ledger.includes('SEQUENCE_REGRESSION'));
  assert.match(ledger, /before insert on thy_sequence_ledger/);
});

test('the read model returns the whole pre-response path', () => {
  const model = sql['0003_read_model.sql'];
  for (const step of [
    'NEWEST DELTAS', 'TOPIC MANIFEST', 'AUTHORITY LOCKS', 'LINKED GRAPH',
    'LINKED PEOPLE/PLACES/OBJECTS/PRODUCTS', 'LINKED WORK', 'LINKED GATES',
    'CURRENT VS SUPERSEDED', 'LAST CHAIRMAN CORRECTION', 'LAST RESTART', 'ANSWER'
  ]) {
    assert.ok(model.includes(`'${step}'`), `read_path is missing ${step}`);
  }
  for (const key of [
    'newest_deltas', 'topic_manifest', 'authority_locks', 'linked_graph', 'linked_entities',
    'linked_work', 'linked_gates', 'current_vs_superseded', 'last_chairman_correction', 'last_restart', 'last_sequence',
    'open_questions', 'next_better_question', 'answer_rule', 'qyris'
  ]) {
    assert.ok(model.includes(`'${key}'`), `the topic read does not return ${key}`);
  }
});

test('one read model call serves a topic', () => {
  const model = sql['0003_read_model.sql'];
  assert.match(model, /create or replace function thy_omniview_topic\(/);
  assert.match(model, /create or replace function thy_omniview_manifest\(/);
  assert.match(model, /create or replace function thy_omniview_sequence\(/);
  assert.match(model, /create or replace function thy_sequence_ledger_page\(/);
});

test('QYRIS names what was read and what was not', () => {
  const model = sql['0003_read_model.sql'];
  assert.ok(model.includes("'tables_read'"));
  assert.ok(model.includes("'not_read'"));
  assert.ok(model.includes('Only tables listed in tables_read were read'));
  // Every read path attaches a trace.
  for (const fn of ['thy_omniview_manifest', 'thy_omniview_topic', 'thy_omniview_sequence', 'thy_sequence_ledger_page']) {
    const body = model.slice(model.indexOf(`function ${fn}(`));
    const end = body.indexOf('create or replace function', 10);
    assert.ok((end === -1 ? body : body.slice(0, end)).includes('thy_omniview_qyris'),
      `${fn} returns no QYRIS trace`);
  }
});

test('the read model does not sweep the raw registries', () => {
  const model = sql['0003_read_model.sql'];
  const rawTables = ['thylora_departments', 'thylora_living_world_records', 'products', 'orders', 'family_media'];
  for (const t of rawTables) {
    assert.ok(!new RegExp(`from\\s+${t}\\b`).test(model), `the read model reads ${t} directly`);
  }
});

test('the write path returns a readback, not an acknowledgement', () => {
  const write = sql['0004_write_path.sql'];
  for (const fn of ['thy_sequence_append', 'thy_omniview_state_canon', 'thy_omniview_link',
    'thy_omniview_set_gate', 'thy_omniview_register_topic']) {
    const from = write.indexOf(`function ${fn}(`);
    assert.ok(from > -1, `${fn} is missing`);
    const body = write.slice(from, write.indexOf('$$;', from));
    assert.match(body, /return thy_omniview_(topic|sequence|manifest)\(/,
      `${fn} does not return a readback of what it wrote`);
  }
});

test('clients read but never write directly', () => {
  const rls = sql['0005_rls_policies.sql'];
  assert.ok(rls.includes('enable row level security'));
  assert.ok(rls.includes('revoke insert, update, delete'));
  assert.match(rls, /revoke execute on function thy_sequence_append/);
  assert.ok(!/create policy .* for (insert|update|delete)/.test(rls),
    'a direct client write policy was added, which steps around the custody functions');
});

test('the ledger does not claim history it never wrote', () => {
  const seed = sql['0006_seed_manifest.sql'];
  assert.ok(seed.includes('587'), 'the ledger floor is not seeded');
  assert.ok(/does NOT claim to carry sequences 1-586/.test(seed),
    'the seed does not state that earlier sequences are not in this ledger');
  assert.match(sql['0007_prior_context.sql'], /PRE_LEDGER/);
  assert.match(sql['0007_prior_context.sql'], /to_regclass\('public\.thylora_query_carryforward'\)/);
});

test('every guarded read of an unverified registry has an escape hatch', () => {
  const prior = sql['0007_prior_context.sql'];
  for (const reason of ['REGISTRY_ABSENT', 'SHAPE_MISMATCH', 'READ_REFUSED']) {
    assert.ok(prior.includes(reason), `the bridge cannot report ${reason}`);
  }
});

test('the pack is additive: it drops and renames nothing that already exists', () => {
  const forbidden = all.match(/^\s*(drop table|drop column|alter table \w+ rename|truncate)\b.*$/gim) || [];
  const allowed = forbidden.filter((line) => !/thy_omniview_|thy_sequence_/.test(line));
  assert.deepEqual(allowed, [], `the pack mutates objects outside its own prefix: ${allowed.join(' | ')}`);
});
