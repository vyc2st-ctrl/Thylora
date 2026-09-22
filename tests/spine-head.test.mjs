// THY-WORK-DASHBOARD-INTERACTION-CLOSEOUT-562 — the head read behind the four
// dashboard surfaces: TOPIC CONTEXT, SEQUENCE LEDGER, CURRENT GATES, NEXT QUESTION.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import './../app/omniview-surface.js';

const head = readFileSync('db/spine-588/0001_head_read.sql', 'utf8');
const O = globalThis.THY_OMNIVIEW;

const SURFACES = ['TOPIC CONTEXT', 'SEQUENCE LEDGER', 'CURRENT GATES', 'NEXT QUESTION'];

test('the head read names the four surfaces it exists to serve', () => {
  for (const s of SURFACES) assert.ok(head.includes(`'${s}'`), `the head read does not carry ${s}`);
});

test('a blocking gate outranks a frontier item, which outranks a topic question', () => {
  assert.match(head, /'rank', 1, 'source', 'GATE'/);
  assert.match(head, /'rank', 2, 'source', 'FRONTIER'/);
  assert.match(head, /'rank', 3, 'source', 'TOPIC'/);
  assert.match(head, /order by \(x->>'rank'\)::int/);
  assert.match(head, /The surface does not choose/);
});

test('only BLOCKED gates are promoted to the next question', () => {
  const gateBlock = head.match(/'rank', 1, 'source', 'GATE'[\s\S]*?gate_state = 'BLOCKED'\)/);
  assert.ok(gateBlock, 'the next question promotes gates that are not blocking');
});

test('a pack that is not applied is named, never read as nothing to report', () => {
  for (const table of ['thy_gate_law', 'thy_qyris_frontier', 'thy_omniview_questions']) {
    assert.match(head, new RegExp(`to_regclass\\('public\\.${table}'\\) is null`),
      `${table} is read without checking it exists`);
  }
  assert.match(head, /v_not_read := v_not_read \|\|/);
  assert.match(head, /check not_read below before believing it/);
});

test('an empty queue is not reported as a finished spine', () => {
  assert.match(head, /either a finished spine or an unread one/);
});

test('the head read degrades rather than fails when a pack is missing', () => {
  assert.match(head, /'not_applied',\s*v_missing/);
  assert.match(head, /db\/omniview\/ is not applied/);
  assert.match(head, /db\/gate-law\/ is not applied/);
  assert.match(head, /db\/milestone-874\/ is not applied/);
});

test('the surface takes the gate field order from the payload, not from itself', () => {
  assert.deepEqual(O.gateFieldOrder({ field_order: ['STATE', 'SCOPE'] }), ['STATE', 'SCOPE']);
  assert.deepEqual(O.gateFieldOrder({}), O.GATE_FIELDS);
  assert.equal(O.GATE_FIELDS.length, 11);
  assert.deepEqual(O.GATE_FIELDS, [
    'SCOPE', 'AUTHORITY', 'EVIDENCE', 'CONTEXT', 'TRIGGER',
    'STATE', 'EXCEPTION', 'VERSION', 'SUPERSEDES', 'READBACK', 'NEXT_REVIEW'
  ]);
});

test('a gate field the backend did not send is shown as not stated, never dropped', () => {
  const rows = O.gateView({ SCOPE: 'DASHBOARD' }, ['SCOPE', 'EXCEPTION', 'NEXT_REVIEW']);
  assert.equal(rows.length, 3);
  assert.deepEqual(rows[1], ['EXCEPTION', 'not stated']);
  assert.deepEqual(rows[2], ['NEXT REVIEW', 'not stated']);
});

test('a retired gate never reads as a pass', () => {
  assert.equal(O.gateSeverity('PASSED'), 'good');
  assert.equal(O.gateSeverity('WAIVED'), 'good');
  assert.equal(O.gateSeverity('BLOCKED'), 'open');
  assert.equal(O.gateSeverity('HELD'), 'open');
  assert.equal(O.gateSeverity('RETIRED'), '');
});

test('the next-question queue keeps the backend order and marks what blocks', () => {
  const rows = O.nextQuestionRows({
    queue: [
      { source: 'GATE', ref: 'GATE-X', question: 'clear the gate' },
      { source: 'FRONTIER', ref: 'cycle 1', question: 'carried item', topic_key: 'STORE' },
      { source: 'TOPIC', ref: 'CASTLE', question: 'who settles it', topic_key: 'CASTLE' }
    ]
  });
  assert.deepEqual(rows.map((r) => r.source), ['GATE', 'FRONTIER', 'TOPIC']);
  assert.deepEqual(rows.map((r) => r.blocking), [true, false, false]);
  assert.equal(rows[1].topic_key, 'STORE');
});

test('a malformed payload renders empty rather than throwing', () => {
  assert.deepEqual(O.nextQuestionRows({}), []);
  assert.deepEqual(O.nextQuestionRows(null), []);
  assert.deepEqual(O.gateView(null, ['SCOPE']), [['SCOPE', 'not stated']]);
});

test('the head read claims nothing about the live deployment', () => {
  assert.doesNotMatch(head, /is live|now live|deployed to/i);
});
