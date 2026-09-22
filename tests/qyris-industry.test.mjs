import { test } from 'node:test';
import assert from 'node:assert/strict';

import { validateNode, DELTAS } from '../qyris/lib/grammar.js';
import {
  AXES, AXIS_IDS, DOMAINS, DOMAIN_IDS, project, projectDomain, projectAll, projectionReport,
} from '../qyris/lib/industry.js';

test('sixteen axes and six domains', () => {
  assert.equal(AXIS_IDS.length, 16);
  assert.equal(DOMAIN_IDS.length, 6);
  assert.deepEqual(DOMAIN_IDS, ['MUSIC', 'COMEDY', 'BUSINESS', 'RELIGION', 'EDUCATION', 'FAMILY']);
});

test('every axis carries an invariant and a templated QYRIS body', () => {
  for (const axisId of AXIS_IDS) {
    const axis = AXES[axisId];
    assert.ok(axis.invariant.length > 20, `${axisId} has no invariant`);
    for (const field of ['question', 'yield', 'reason', 'inspect', 'safeguard']) {
      assert.ok(axis.template[field]?.length > 8, `${axisId} template missing ${field}`);
    }
    assert.ok(axis.moves.every((delta) => DELTAS.includes(delta)), `${axisId} declares an unknown delta`);
  }
});

test('every axis projects into every domain as a valid QYRIS node', () => {
  const all = projectAll();
  let count = 0;
  for (const domainId of DOMAIN_IDS) {
    for (const node of all[domainId]) {
      assert.doesNotThrow(() => validateNode(node), `${node.id} is not a valid QYRIS node`);
      count += 1;
    }
  }
  assert.equal(count, 96);
});

test('the same grammar produces different questions per domain', () => {
  const questions = DOMAIN_IDS.map((domainId) => project('MONEY', domainId).question);
  assert.equal(new Set(questions).size, DOMAIN_IDS.length, 'two domains produced the same MONEY question');
  assert.match(project('MONEY', 'MUSIC').question, /splits/i);
  assert.match(project('MONEY', 'RELIGION').question, /accounts/i);
  assert.match(project('MONEY', 'EDUCATION').question, /cost/i);
});

test('the axis invariant survives the projection into every domain', () => {
  for (const domainId of DOMAIN_IDS) {
    const node = project('CONFLICT', domainId);
    assert.equal(node.invariant, AXES.CONFLICT.invariant);
    assert.deepEqual(node.moves, AXES.CONFLICT.moves);
  }
});

test('domain lexicon substitution actually happens', () => {
  const music = project('HOUSEHOLD_LABOR', 'MUSIC');
  assert.match(music.yield, /task inventory/i);
  const business = project('MONEY', 'BUSINESS');
  assert.match(business.inspect, /cap table/i);
  const family = project('DEBT', 'FAMILY');
  assert.match(family.question, /household/i);
});

test('no projected field leaves an unfilled slot', () => {
  for (const domainId of DOMAIN_IDS) {
    for (const node of projectDomain(domainId)) {
      for (const field of ['question', 'yield', 'reason', 'inspect', 'safeguard']) {
        assert.doesNotMatch(node[field], /\{\w+\}/, `${node.id}.${field} has an unfilled slot`);
      }
    }
  }
});

test('a slot at the start of a sentence is capitalised', () => {
  for (const domainId of DOMAIN_IDS) {
    for (const node of projectDomain(domainId)) {
      for (const field of ['question', 'yield', 'reason', 'inspect', 'safeguard']) {
        assert.doesNotMatch(node[field], /\. [a-z]/, `${node.id}.${field} reads like a mail merge`);
      }
    }
  }
});

test('provenance is recorded per field, honestly', () => {
  const report = projectionReport();
  assert.equal(report.nodes, 96);
  assert.equal(report.fields, 480);
  assert.equal(report.authored + report.mechanical, 480);
  // Every QUESTION is authored — a vague question cannot be acted on.
  assert.ok(report.authored >= 96, 'fewer authored fields than there are questions');
  assert.ok(report.mechanicalShare > 0.5, 'the grammar is not carrying its weight');
});

test('every question is authored, not mechanically generated', () => {
  for (const domainId of DOMAIN_IDS) {
    for (const node of projectDomain(domainId)) {
      assert.equal(node.provenance.question, 'AUTHORED', `${node.id} question was left to the template`);
    }
  }
});

test('safeguards involving children and power are authored, not generic', () => {
  const cases = [
    ['RELIGION', 'CHILDREN', /statutory authority/i],
    ['EDUCATION', 'CHILDREN', /statutory authority/i],
    ['EDUCATION', 'SEX_INTIMACY', /no symmetry/i],
    ['FAMILY', 'SEX_INTIMACY', /Consent is not transferred/i],
    ['FAMILY', 'GEOGRAPHY', /abuse/i],
  ];
  for (const [domainId, axisId, pattern] of cases) {
    const node = project(axisId, domainId);
    assert.equal(node.provenance.safeguard, 'AUTHORED', `${domainId}.${axisId} used the generic safeguard`);
    assert.match(node.safeguard, pattern);
  }
});

test('no domain records a child detail', () => {
  for (const domainId of DOMAIN_IDS) {
    for (const node of projectDomain(domainId)) {
      if (node.axisId !== 'CHILDREN') continue;
      if (['RELIGION', 'EDUCATION'].includes(domainId)) {
        assert.match(node.safeguard, /records no detail about any child/i, `${node.id} does not refuse child detail`);
      }
    }
  }
});

test('an unknown axis or domain is refused rather than guessed', () => {
  assert.throws(() => project('VIBES', 'MUSIC'), /UNKNOWN_AXIS/);
  assert.throws(() => project('MONEY', 'SPORTS'), /UNKNOWN_DOMAIN/);
});

test('every domain lexicon fills every slot every axis uses', () => {
  for (const domainId of DOMAIN_IDS) {
    assert.doesNotThrow(() => projectDomain(domainId), `${domainId} lexicon is incomplete`);
    assert.ok(Object.keys(DOMAINS[domainId].questions).length === 16, `${domainId} does not author all sixteen questions`);
  }
});
