import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  DELTAS, FIELDS, FRONTIER_STATES, Pass, QyrisError, assertNeverFinished,
  countNodes, deltaCoverage, flatten, openPass, renderNode, validateNode, validatePack, walk,
} from '../qyris/lib/grammar.js';
import { PREMARRIAGE_PACK } from '../qyris/data/premarriage-pack.js';

const node = (overrides = {}) => ({
  id: 'TEST',
  question: 'A question long enough to pass',
  yield: 'A yield long enough to pass',
  reason: 'A reason long enough to pass',
  inspect: 'An inspect long enough to pass',
  safeguard: 'A safeguard long enough to pass',
  moves: ['RISK'],
  ...overrides,
});

test('the five QYRIS fields are the grammar', () => {
  assert.deepEqual(FIELDS, ['question', 'yield', 'reason', 'inspect', 'safeguard']);
});

test('the five deltas are the stopping rule', () => {
  assert.deepEqual(DELTAS, ['ACTION', 'EVIDENCE', 'RISK', 'AUTHORITY', 'TRANSFER']);
});

test('a question missing any field is refused', () => {
  for (const field of FIELDS) {
    assert.throws(() => validateNode(node({ [field]: '' })), /FIELD_MISSING_OR_THIN/);
  }
});

test('a question with no safeguard is not a question in this grammar', () => {
  assert.throws(() => validateNode(node({ safeguard: 'short' })), /SAFEGUARD/);
});

test('a question that moves nothing is not asked', () => {
  assert.throws(() => validateNode(node({ moves: [] })), /NO_DELTA_DECLARED/);
});

test('an unknown delta is refused', () => {
  assert.throws(() => validateNode(node({ moves: ['VIBES'] })), /UNKNOWN_DELTA/);
});

test('there is no frontier state that means finished', () => {
  assert.deepEqual(FRONTIER_STATES, ['OPEN_ACTIVE', 'OPEN_PAUSED']);
  for (const claim of ['CLOSED', 'COMPLETE', 'FINISHED', 'DONE', 'EXHAUSTED', 'FINAL']) {
    assert.throws(() => assertNeverFinished(claim), /INQUIRY_NOT_GLOBALLY_FINISHED/);
  }
});

test('duplicate node ids are refused across the whole pack', () => {
  const duplicate = [node({ id: 'A' }), node({ id: 'A' })];
  assert.throws(() => validatePack(duplicate), /DUPLICATE_NODE_ID/);
});

// ── The stopping rule ─────────────────────────────────────────────────

const smallPack = [
  node({
    id: 'ROOT',
    moves: ['ACTION', 'EVIDENCE'],
    children: [
      node({ id: 'ROOT.A', moves: ['RISK'] }),
      node({ id: 'ROOT.B', moves: ['ACTION'] }),
    ],
  }),
];

test('a pass pauses when no remaining question would change any of the five', () => {
  const pass = openPass(smallPack);
  assert.equal(pass.state(), 'OPEN_ACTIVE');
  pass.answer('ROOT');          // settles ACTION and EVIDENCE
  assert.equal(pass.state(), 'OPEN_ACTIVE'); // ROOT.A still moves RISK
  pass.answer('ROOT.A');        // settles RISK
  // ROOT.B moves only ACTION, which is already settled — nothing left to change.
  assert.equal(pass.state(), 'OPEN_PAUSED');
  assert.equal(pass.frontier().length, 0);
});

test('a paused pass still reports the frontier open and inquiry unfinished', () => {
  const pass = openPass(smallPack);
  pass.answer('ROOT');
  pass.answer('ROOT.A');
  const report = pass.report();
  assert.equal(report.state, 'OPEN_PAUSED');
  assert.equal(report.frontierOpen, true);
  assert.equal(report.globallyFinished, false);
  assert.match(report.pauseReason, /frontier stays OPEN/);
});

test('a disturbance reopens a paused pass — this is why it is never finished', () => {
  const pass = openPass(smallPack);
  pass.answer('ROOT');
  pass.answer('ROOT.A');
  assert.equal(pass.state(), 'OPEN_PAUSED');
  pass.disturb('ACTION', 'A new fact arrived');
  assert.equal(pass.state(), 'OPEN_ACTIVE');
  assert.ok(pass.frontier().some((entry) => entry.node.id === 'ROOT.B'));
});

test('a child cannot be answered before its parent', () => {
  const pass = openPass(smallPack);
  assert.throws(() => pass.answer('ROOT.A'), /PARENT_UNANSWERED/);
});

test('a child is not on the frontier until its parent is answered', () => {
  const pass = openPass(smallPack);
  assert.deepEqual(pass.frontier().map((entry) => entry.node.id), ['ROOT']);
});

test('scope limits a pass to named clusters', () => {
  const pass = new Pass(PREMARRIAGE_PACK, { scope: ['MONEY'] });
  assert.ok(pass.nodesInScope().every((entry) => entry.clusterId === 'MONEY'));
  assert.equal(pass.nodesInScope().length, 7);
});

test('a Pass has no method that claims inquiry is over', () => {
  const names = Object.getOwnPropertyNames(Pass.prototype);
  for (const name of names) {
    assert.ok(!/^(close|complete|finish|end)/i.test(name), `Pass.${name} claims a terminal state`);
  }
});

// ── The pack itself ───────────────────────────────────────────────────

test('the pre-marriage pack validates as a whole', () => {
  assert.doesNotThrow(() => validatePack(PREMARRIAGE_PACK));
});

test('the pack has the sixteen named clusters, in order', () => {
  assert.deepEqual(PREMARRIAGE_PACK.map((cluster) => cluster.id), [
    'MONEY', 'DEBT', 'CHILDREN', 'FAMILY_BOUNDARIES', 'FAITH_WORLDVIEW', 'SEX_INTIMACY',
    'HOUSEHOLD_LABOR', 'CONFLICT', 'HEALTH_CARE', 'CAREERS', 'GEOGRAPHY', 'PRIVACY',
    'TRUST', 'FUTURE_CHANGE', 'DEAL_BREAKERS', 'REPAIR',
  ]);
});

test('every cluster recurses — no cluster is a single question', () => {
  for (const cluster of PREMARRIAGE_PACK) {
    assert.ok((cluster.children ?? []).length >= 4, `${cluster.id} has too few child questions`);
  }
});

test('the pack recurses to at least a third level somewhere in every cluster', () => {
  for (const cluster of PREMARRIAGE_PACK) {
    const depths = [...walk([cluster])].map((entry) => entry.depth);
    assert.ok(Math.max(...depths) >= 2, `${cluster.id} never reaches a grandchild question`);
  }
});

test('every cluster can move at least three of the five deltas', () => {
  for (const [clusterId, deltas] of Object.entries(deltaCoverage(PREMARRIAGE_PACK))) {
    assert.ok(deltas.length >= 3, `${clusterId} covers only ${deltas.join(',')}`);
  }
});

test('the pack collectively covers all five deltas', () => {
  const all = new Set(flatten(PREMARRIAGE_PACK).flatMap((entry) => entry.node.moves));
  assert.deepEqual([...all].sort(), [...DELTAS].sort());
});

test('the pack is 112 questions across 16 clusters', () => {
  assert.equal(countNodes(PREMARRIAGE_PACK), 112);
  assert.equal(PREMARRIAGE_PACK.length, 16);
  const byDepth = flatten(PREMARRIAGE_PACK).reduce((acc, entry) => {
    acc[entry.depth] = (acc[entry.depth] ?? 0) + 1;
    return acc;
  }, {});
  assert.deepEqual(byDepth, { 0: 16, 1: 64, 2: 32 });
});

test('a node renders as the five lines plus its deltas', () => {
  const rendered = renderNode(PREMARRIAGE_PACK[0]);
  for (const label of ['QUESTION', 'YIELD', 'REASON', 'INSPECT', 'SAFEGUARD', 'MOVES']) {
    assert.match(rendered, new RegExp(`^${label}`, 'm'));
  }
});

test('the safety clusters name a route out rather than continuing to question', () => {
  const byId = Object.fromEntries(flatten(PREMARRIAGE_PACK).map((entry) => [entry.node.id, entry.node]));
  assert.match(byId['SEX_INTIMACY.REFUSAL.SAFETY'].safeguard, /support service/i);
  assert.match(byId['CONFLICT'].safeguard, /support route/i);
  assert.match(byId['GEOGRAPHY.STATUS'].safeguard, /abuse/i);
});

test('no cluster stores medical detail', () => {
  const byId = Object.fromEntries(flatten(PREMARRIAGE_PACK).map((entry) => [entry.node.id, entry.node]));
  for (const id of ['CHILDREN.FERTILITY', 'SEX_INTIMACY.REFUSAL.HEALTH', 'HEALTH_CARE']) {
    assert.match(byId[id].safeguard, /No medical detail is stored/i, `${id} does not refuse medical storage`);
  }
});

test('the deal-breaker floor is not removable by agreement', () => {
  const byId = Object.fromEntries(flatten(PREMARRIAGE_PACK).map((entry) => [entry.node.id, entry.node]));
  assert.match(byId['DEAL_BREAKERS.SAFETY_FLOOR'].safeguard, /not removable by agreement/i);
  assert.match(byId['DEAL_BREAKERS.REVIEW'].safeguard, /Floor items cannot be removed/i);
});

test('answering a node outside scope is refused', () => {
  const pass = new Pass(PREMARRIAGE_PACK, { scope: ['MONEY'] });
  assert.throws(() => pass.answer('DEBT'), /NODE_NOT_IN_SCOPE/);
});

test('an unknown delta cannot be disturbed', () => {
  const pass = openPass(smallPack);
  assert.throws(() => pass.disturb('MOOD'), QyrisError);
});
