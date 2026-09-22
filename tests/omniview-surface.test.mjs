// THY-WORK-OMNIVIEW-ROUNDTRIP-587 — read-model contract, client side.
//
// The surface renders whatever the read model returns, in the order the read
// model says. These tests pin that contract so a future edit cannot quietly
// drop a step of the pre-response path or a column of the ledger.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import './../app/omniview-surface.js';

const O = globalThis.THY_OMNIVIEW;

const REQUIRED_PATH = [
  'NEWEST DELTAS', 'TOPIC MANIFEST', 'AUTHORITY LOCKS', 'LINKED GRAPH',
  'LINKED PEOPLE/PLACES/OBJECTS/PRODUCTS', 'LINKED WORK', 'LINKED GATES',
  'CURRENT VS SUPERSEDED', 'LAST CHAIRMAN CORRECTION', 'LAST RESTART', 'ANSWER'
];

const REQUIRED_LEDGER_COLUMNS = [
  'SEQUENCE', 'LOCAL DATE/TIME', 'UTC DATE/TIME', 'PREVIOUS SEQUENCE',
  'WHY CHANGE OCCURRED', 'WHAT CHANGED', 'WHY IT CHANGED', 'WHAT REMAINED',
  'AUTHORITY', 'TRUTH CLASS', 'NEXT-BETTER QUESTION', 'RESTART POINT'
];

test('the surface knows every step of the pre-response path', () => {
  assert.deepEqual(Object.keys(O.PATH_SECTIONS), REQUIRED_PATH);
});

test('render order comes from the payload, not from the client', () => {
  const ordered = O.orderSections({ read_path: ['LAST RESTART', 'ANSWER', 'TOPIC MANIFEST'] });
  assert.deepEqual(ordered.map((s) => s.step), ['LAST RESTART', 'ANSWER', 'TOPIC MANIFEST']);
  // A payload with no read_path still renders the full path rather than nothing.
  assert.equal(O.orderSections({}).length, REQUIRED_PATH.length);
  // An unknown step is skipped instead of rendering an empty section.
  assert.deepEqual(O.orderSections({ read_path: ['NONSENSE', 'ANSWER'] }).map((s) => s.step), ['ANSWER']);
});

test('the ledger carries all twelve required columns', () => {
  assert.deepEqual(O.LEDGER_COLUMNS.map((c) => c[1]), REQUIRED_LEDGER_COLUMNS);
});

test('the database and the surface normalise a topic key the same way', () => {
  assert.equal(O.normalizeKey('  time-run '), 'TIME RUN');
  assert.equal(O.normalizeKey('INÉS'), 'INES');
  assert.equal(O.normalizeKey('the_castle'), 'THE CASTLE');
  assert.equal(O.normalizeKey(null), '');
});

test('current and superseded are never collapsed into one list', () => {
  const read = {
    current_vs_superseded: {
      current: [{ body: 'now' }],
      superseded: [{ body: 'before' }, { body: 'earlier' }]
    }
  };
  const parts = O.partitionStatements(read);
  assert.equal(parts.current.length, 1);
  assert.equal(parts.superseded.length, 2);
  assert.deepEqual(O.partitionStatements({}), { current: [], superseded: [] });
});

test('an unapplied backend is a deployment state, not an error', () => {
  assert.equal(O.readState({ code: 'PGRST202', message: 'Could not find the function' }), 'NOT_APPLIED');
  assert.equal(O.readState({ code: '404 ', message: 'not found' }), 'NOT_APPLIED');
  assert.equal(O.readState({ code: '401', message: 'JWT expired' }), 'SIGNED_OUT');
  assert.equal(O.readState({ code: '500', message: 'boom' }), 'ERROR');
  assert.equal(O.readState(null), 'OK');
  assert.match(O.stateMessage('NOT_APPLIED'), /db\/omniview\//);
});

test('a sequence click answers delta, reason, authority and next question', () => {
  const view = O.sequenceView({
    found: true, sequence_no: 588, previous_sequence_no: 587,
    local_datetime: '2026-09-22 00:00', local_timezone: 'UTC',
    utc_datetime: '2026-09-22T00:00:00Z',
    delta: { what_changed: 'a', what_remained: 'b' },
    reason: { why_change_occurred: 'c', why_it_changed: 'd' },
    authority: { authority: 'Chairman', truth_class: 'REPO_VERIFIED' },
    next_question: 'e', restart_point: 'f', topics: [{ topic_key: 'OMNIVIEW' }]
  });
  assert.equal(view.delta.what_changed, 'a');
  assert.equal(view.reason.why_it_changed, 'd');
  assert.equal(view.authority.authority, 'Chairman');
  assert.equal(view.next_question, 'e');
  assert.equal(view.restart_point, 'f');
  assert.equal(view.local, '2026-09-22 00:00 UTC');
  assert.equal(O.sequenceView({ found: false }), null);
});

test('QYRIS is rendered with what was read and what was not', () => {
  const lines = O.qyrisLines({
    qyris_version: 'QYRIS-1', scope: 'TOPIC_EXPANSION', topic: 'CASTLE',
    read_at_utc: '2026-09-22T00:00:00Z', sequence_head: 588,
    tables_read: [{ table: 'thy_omniview_topics', rows: 1 }],
    not_read: ['raw registries were not swept']
  });
  const flat = Object.fromEntries(lines);
  assert.match(flat.QYRIS, /QYRIS-1 · TOPIC_EXPANSION · CASTLE/);
  assert.equal(flat['SEQUENCE HEAD'], '588');
  assert.match(flat['TABLES READ'], /thy_omniview_topics \(1\)/);
  assert.match(flat['NOT READ'], /raw registries/);
  assert.deepEqual(O.qyrisLines(null), []);
});

test('a QYRIS trace with no reads says "none" rather than claiming a table', () => {
  const flat = Object.fromEntries(O.qyrisLines({ tables_read: [], not_read: [] }));
  assert.equal(flat['TABLES READ'], 'none');
});

test('every value rendered into the surface is escaped', () => {
  assert.equal(O.esc('<img src=x onerror=alert(1)>'), '&lt;img src=x onerror=alert(1)&gt;');
  assert.equal(O.esc(null), '');
  const js = readFileSync('app/omniview-surface.js', 'utf8');
  const body = js.slice(js.indexOf('api.mount = function mount'));
  const interpolations = body.match(/\+ (?!esc\()(?:read|v|r|t|d|s|g|q|w|p|l)[.\[][^+]*\+ '/g) || [];
  assert.deepEqual(interpolations, [], `unescaped values rendered into HTML: ${interpolations.join(' | ')}`);
});
