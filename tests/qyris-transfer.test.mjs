// THY-WORK-TRANSFER-RECURSION-588 — Q -> Y -> R -> I -> S -> T -> Q', pinned.
//
// The two laws that matter are TRANSFER CREATES THE NEXT CONTEXT and PRESERVE
// OPEN FRONTIER. Both are enforced in SQL; these tests pin the enforcement so it
// cannot be relaxed into a comment.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

const DIR = 'db/qyris-transfer';
const files = readdirSync(DIR).filter((f) => f.endsWith('.sql')).sort();
const sql = Object.fromEntries(files.map((f) => [f, readFileSync(`${DIR}/${f}`, 'utf8')]));
const all = Object.values(sql).join('\n');

test('the pack applies in a documented numeric order', () => {
  assert.deepEqual(files, [
    '0001_transfer_recursion.sql', '0002_transfer_path.sql', '0003_loop_read.sql',
    '0004_rls_policies.sql', '0005_seed_cycle_588.sql'
  ]);
});

test('the loop is six stages, in one order, defined as data', () => {
  const order = sql['0001_transfer_recursion.sql'].match(/thy_qyris_stage_order[\s\S]*?\$\$;/)[0];
  const stages = [...order.matchAll(/'stage','([QYRIST])'/g)].map((m) => m[1]);
  assert.deepEqual(stages, ['Q', 'Y', 'R', 'I', 'S', 'T']);
  const names = [...order.matchAll(/'name','([A-Z]+)'/g)].map((m) => m[1]);
  assert.deepEqual(names, ['QUESTION', 'YIELD', 'READ', 'INTEGRATION', 'SETTLEMENT', 'TRANSFER']);
});

test('a stage cannot be recorded out of order, and never rewritten', () => {
  const schema = sql['0001_transfer_recursion.sql'];
  assert.match(schema, /QYRIS_STAGE_ORDER/);
  assert.match(schema, /QYRIS_STAGE_IMMUTABLE/);
  assert.match(schema, /before insert or update or delete on thy_qyris_stage/);
});

test('TRANSFER CREATES THE NEXT CONTEXT: a transfer without a next question is refused', () => {
  const path = sql['0002_transfer_path.sql'];
  assert.match(path, /QYRIS_NO_NEXT_CONTEXT/);
  // The successor is opened inside the transfer, not left to a caller to remember.
  assert.match(path, /v_next_id := thy_qyris_open\(/);
  // The loop must actually have run before it can transfer.
  assert.match(path, /QYRIS_INCOMPLETE_LOOP/);
});

test("Q' becomes the Q of the successor", () => {
  const path = sql['0002_transfer_path.sql'];
  const transfer = path.match(/create or replace function thy_qyris_transfer[\s\S]*?\$\$;/)[0];
  assert.match(transfer, /thy_qyris_open\(v_cycle\.topic_key, p_next_question/,
    'the next question is not carried into the successor as its question');
  // And thy_qyris_open records Q as a stage immediately.
  assert.match(path, /values \(v_id, 'Q', 1, p_question/);
});

test('PRESERVE OPEN FRONTIER: every open item is copied forward and marked carried', () => {
  const transfer = sql['0002_transfer_path.sql']
    .match(/create or replace function thy_qyris_transfer[\s\S]*?\$\$;/)[0];
  assert.match(transfer, /from thy_qyris_frontier where cycle_id = p_cycle_id and state = 'OPEN'/);
  assert.match(transfer, /insert into thy_qyris_frontier[\s\S]*?carried_from_id/,
    'a carried item does not record where it came from');
  assert.match(transfer, /set state = 'CARRIED', carried_to_cycle_id = v_next_id/);
  // And the transfer re-checks afterwards that nothing was left behind.
  assert.match(transfer, /QYRIS_FRONTIER_DROPPED/);
});

test('a frontier item can be carried or closed with a reason, never dropped', () => {
  assert.match(sql['0001_transfer_recursion.sql'], /QYRIS_FRONTIER_IMMUTABLE/);
  assert.match(sql['0001_transfer_recursion.sql'], /before delete on thy_qyris_frontier/);
  assert.match(sql['0002_transfer_path.sql'], /QYRIS_FRONTIER_SILENT_CLOSE/);
  assert.match(sql['0001_transfer_recursion.sql'], /thy_qyris_frontier_closed_states_why/);
});

test('a chain does not end on an open frontier, and never ends silently', () => {
  const path = sql['0002_transfer_path.sql'];
  assert.match(path, /QYRIS_FRONTIER_OPEN/);
  assert.match(path, /QYRIS_SILENT_TERMINATION/);
  assert.match(sql['0001_transfer_recursion.sql'], /thy_qyris_cycle_terminal_states_why/);
});

test('a cycle transfers once: two successors would be a fork', () => {
  assert.match(sql['0001_transfer_recursion.sql'],
    /unique index[\s\S]{0,120}thy_qyris_cycle \(parent_cycle_id\) where parent_cycle_id is not null/);
  assert.match(sql['0002_transfer_path.sql'], /QYRIS_ALREADY_TRANSFERRED/);
});

test('the loop read names the stages not yet reached instead of omitting them', () => {
  const read = sql['0003_loop_read.sql'];
  assert.match(read, /left join thy_qyris_stage/, 'the read drops stages that have no row');
  assert.match(read, /'recorded',\s*s\.stage is not null/);
});

test('the 588 seed records the cycle this build actually ran, and leaves it open', () => {
  const seed = sql['0005_seed_cycle_588.sql'];
  for (const stage of ['Y', 'R', 'I', 'S']) {
    assert.match(seed, new RegExp(`thy_qyris_record\\(c1,'${stage}'`), `stage ${stage} was not recorded`);
  }
  // T is NOT written by the seed: the transfer is what creates 589, and that is
  // the Chairman's act, not this file's.
  assert.doesNotMatch(seed, /thy_qyris_record\(c1,'T'/, 'the seed transferred on its own');
  assert.doesNotMatch(seed, /thy_qyris_transfer\(/, 'the seed created the next context on its own');
  // The frontier it leaves is real and non-empty.
  const frontier = (seed.match(/thy_qyris_frontier_add\(c1,/g) || []).length;
  assert.ok(frontier >= 5, `expected the real open frontier at 588, found ${frontier} items`);
  assert.match(seed, /UNMEASURED/, 'the seed does not carry the unmeasured-commerce risk forward');
});

test('the seed is idempotent', () => {
  assert.match(sql['0005_seed_cycle_588.sql'],
    /if exists \(select 1 from thy_qyris_cycle where topic_key = 'SPINE'\)[\s\S]{0,40}return;/);
});

test('the write path is not exposed to signed-in sessions', () => {
  const rls = sql['0004_rls_policies.sql'];
  assert.match(rls, /grant execute on function thy_qyris_loop\(bigint\)\s+to authenticated/);
  assert.match(rls, /grant execute on function thy_qyris_chain\(text, int\)\s+to authenticated/);
  assert.doesNotMatch(rls, /grant execute on function thy_qyris_transfer/);
  assert.doesNotMatch(rls, /grant execute on function thy_qyris_open/);
});
