// SIX UNDERSTANDING ENGINE · question routing and prerequisite tests
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { routeQuestion, QUESTION_CLASSES } from '../six-engine/lib/routing.js';
import {
  makeGraph, prerequisiteClosure, explanationReady, SEED_GRAPH, DEFAULT_MAX_DEPTH
} from '../six-engine/lib/prerequisites.js';

const cls = (q, opts) => routeQuestion(q, opts ?? {}).class;

test('a question about a mechanism routes to the mechanism contract', () => {
  assert.equal(cls('Why does ice float?'), 'CONCEPTUAL_MECHANISM');
  assert.match(QUESTION_CLASSES.CONCEPTUAL_MECHANISM.answer_contract, /not the label/);
});

test('a word problem is separated from a plain lookup', () => {
  assert.equal(cls('12 sweets shared between 4 children, how many each?'), 'MATH_WORD_PROBLEM');
  assert.equal(cls('How many moons does Jupiter have?'), 'FACTUAL_SETTLED');
});

test('a disputed history question routes to the contest contract, not to a fact', () => {
  const route = routeQuestion('Was she really of African descent?', {});
  assert.equal(route.class, 'CONTESTED_RECORD');
  assert.equal(route.requires_contest_report, true);
  assert.match(route.answer_contract, /gaps in the record named/);
});

test('a near tie between settled and contested takes the contested reading', () => {
  const route = routeQuestion('What was the real cause of the fire?', {});
  assert.ok(['CONTESTED_RECORD', 'CONCEPTUAL_MECHANISM'].includes(route.class));
});

test("a question about the learner's own family is answered only from the backend record", () => {
  const route = routeQuestion('Where was my grandmother born?', {});
  assert.equal(route.class, 'PERSONAL_RECORD');
  assert.equal(route.backend_only, true);
  assert.match(route.answer_contract, /never filled in from general knowledge/);
});

test('a value question separates facts from values and leaves the choice with the person', () => {
  const route = routeQuestion('Should I tell my teacher?', {});
  assert.equal(route.class, 'VALUE_JUDGEMENT');
  assert.match(route.answer_contract, /choice left with the person/);
});

test('a safety question is gated whatever else it looks like', () => {
  const route = routeQuestion('How many of these pills is it safe to take?', {});
  assert.equal(route.class, 'SAFETY_GATED');
  assert.equal(route.gate, 'GUARDIAN');
});

test('a question carrying an unestablished assumption is routed MALFORMED', () => {
  const route = routeQuestion('When did people stop believing it?', {});
  assert.equal(route.class, 'MALFORMED');
  assert.match(route.presupposition.assumption, /it was happening/);
  assert.match(route.presupposition.repair, /then ask the question again/);
});

test('every class declares stages, a contract and an evidence floor', () => {
  for (const [name, profile] of Object.entries(QUESTION_CLASSES)) {
    assert.ok(profile.stages.length > 0, `${name} has no stages`);
    assert.ok(profile.answer_contract, `${name} has no contract`);
    assert.equal(typeof profile.min_independent_lines, 'number', `${name} has no evidence floor`);
  }
});

test('the prerequisite walk finds the floor, not the top of the chain', () => {
  const closure = prerequisiteClosure(SEED_GRAPH, 'floating', { counting: 'HELD', addition: 'HELD', subtraction: 'HELD', equal_groups: 'HELD' });
  assert.equal(closure.floor.id, 'division_sharing');
  assert.deepEqual(closure.teach_order.map(t => t.id), ['division_sharing', 'density', 'floating']);
  assert.equal(explanationReady(closure).ready, false);
});

test('a held concept ends the dig', () => {
  const closure = prerequisiteClosure(SEED_GRAPH, 'floating', { density: 'HELD' });
  assert.deepEqual(closure.unmet.map(u => u.id), ['floating']);
  assert.equal(explanationReady(closure).start_at, 'floating');
});

test('everything held means the explanation can start at the question', () => {
  const mastery = Object.fromEntries(['counting', 'addition', 'subtraction', 'equal_groups', 'division_sharing', 'density', 'floating'].map(k => [k, 'HELD']));
  const ready = explanationReady(prerequisiteClosure(SEED_GRAPH, 'floating', mastery));
  assert.equal(ready.ready, true);
  assert.equal(ready.start_at, 'floating');
});

test('a concept the graph does not hold is reported as a gap, never invented', () => {
  const closure = prerequisiteClosure(SEED_GRAPH, 'quantum_tunnelling', {});
  assert.equal(closure.found, false);
  assert.equal(closure.gap.code, 'CONCEPT_NOT_IN_GRAPH');
  assert.match(closure.gap.detail, /will not invent a prerequisite chain/);
});

test('a prerequisite cycle is cut and reported, not followed', () => {
  const graph = makeGraph([
    { id: 'a', label: 'A', prerequisites: ['b'] },
    { id: 'b', label: 'B', prerequisites: ['a'] }
  ]);
  const closure = prerequisiteClosure(graph, 'a', {});
  assert.ok(closure.cycles.length > 0);
  assert.match(closure.cycle_note, /cut, not followed/);
});

test('the walk stops at the depth cap and says the chain below is unexamined', () => {
  const deep = makeGraph(Array.from({ length: 12 }, (_, i) => ({
    id: `c${i}`, label: `concept ${i}`, prerequisites: i < 11 ? [`c${i + 1}`] : []
  })));
  const closure = prerequisiteClosure(deep, 'c0', {});
  assert.equal(closure.truncated, true);
  assert.match(closure.truncation_note, new RegExp(`depth cap of ${DEFAULT_MAX_DEPTH}`));
  assert.match(closure.truncation_note, /unexamined, not assumed held/);
});

test('a graph naming a prerequisite it does not contain is rejected at build time', () => {
  assert.throws(() => makeGraph([{ id: 'a', label: 'A', prerequisites: ['missing'] }]), /not in the graph/);
});
