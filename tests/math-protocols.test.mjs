// THYLORA · standing protocols, run as checks rather than remembered as prose
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  digest,
  CONTINUITY_WATCHDOG, ACTIVE_WORKSTREAMS, RESTART_POINT, checkContinuity, assertContinuity,
  VOICE_PROTOCOL, VOICE_LINES, voiceLine, diffVoiceLines, checkVoiceMutations,
  assertNoSilentMutation, surfaceCarriesLine,
  MINOR_NAME_PROTOCOL, PROTECTED_NAMES, ADULT_AGE, scanForProtectedNames,
  checkMinorNameRule, checkMinorNameRuleAcross, assertMinorNameRule,
  PROTOCOLS
} from '../math-surface/lib/continuity.js';

test('all three named protocols are present and executable', () => {
  const ids = PROTOCOLS.map(p => p.id);
  assert.ok(ids.includes('THY-CONTINUITY-WATCHDOG-001'));
  assert.ok(ids.includes('THY-VOICE-PROMPT-NO-SILENT-MUTATION-001'));
  assert.ok(ids.includes('THY-MINOR-NAME-ADULT-USE-001'));
});

test('the digest is deterministic and distinguishes near-identical text', () => {
  assert.equal(digest('at least twelve'), digest('at least twelve'));
  assert.notEqual(digest('at least twelve'), digest('at most twelve'));
});

// --- THY-CONTINUITY-WATCHDOG-001 -------------------------------------------

test('every workstream active at the restart point is still carried', () => {
  const current = ACTIVE_WORKSTREAMS.map(w => w.id);
  const result = assertContinuity(RESTART_POINT.workstreams, current);
  assert.equal(result.ok, true);
  assert.equal(result.dropped.length, 0);
  assert.deepEqual([...result.added], ['WS-MATH-SURFACE']);
});

test('the parallel workstreams this lane must not disturb are all named', () => {
  const ids = ACTIVE_WORKSTREAMS.map(w => w.id);
  for (const required of [
    'WS-DASHBOARD-AUTHORITY', 'WS-APP-BUILD7', 'WS-PUBLIC-SITE', 'WS-RAELINK',
    'WS-TIME-RUN', 'WS-GAME-BET', 'WS-SPINE-VOICE', 'WS-FAMILY-STORY'
  ]) {
    assert.ok(ids.includes(required), `${required} is missing from the workstream manifest`);
  }
});

test('dropping a workstream is caught and named', () => {
  const result = checkContinuity(['A', 'B', 'C'], ['A', 'C']);
  assert.equal(result.ok, false);
  assert.deepEqual([...result.dropped], ['B']);
  assert.match(result.statement, /may not disappear/i);
  assert.throws(() => assertContinuity(['A', 'B'], ['A']), /ContinuityWatchdogError|DROPPED/);
});

test('opening a new workstream is allowed', () => {
  const result = checkContinuity(['A'], ['A', 'B']);
  assert.equal(result.ok, true);
  assert.deepEqual([...result.added], ['B']);
});

// --- THY-VOICE-PROMPT-NO-SILENT-MUTATION-001 -------------------------------

test('every registered voice line carries its own digest', () => {
  for (const line of VOICE_LINES) {
    assert.equal(line.digest, digest(line.text), `${line.id} digest does not match its text`);
    assert.ok(line.text.length > 20, `${line.id} is too short to be a spoken line`);
    assert.ok(['learner', 'family', 'teacher'].includes(line.role), `${line.id} has an unknown role`);
  }
});

test('a changed line with no declaration is a violation', () => {
  const before = VOICE_LINES;
  const after = VOICE_LINES.map(l =>
    l.id === 'VX-L-ASK' ? { ...l, text: 'Read it and answer.' } : l
  );
  const result = checkVoiceMutations(before, after, []);
  assert.equal(result.ok, false);
  assert.equal(result.undeclared.length, 1);
  assert.equal(result.undeclared[0].id, 'VX-L-ASK');
  assert.equal(result.undeclared[0].kind, 'CHANGED');
  assert.throws(() => assertNoSilentMutation(before, after, []), /SilentMutationError|undeclared/);
});

test('a changed line with a declaration passes', () => {
  const after = VOICE_LINES.map(l =>
    l.id === 'VX-L-ASK' ? { ...l, text: 'Read it and answer.' } : l
  );
  const declared = [{ id: 'VX-L-ASK', kind: 'CHANGED', reason: 'test', declared_by: 'test suite' }];
  assert.equal(checkVoiceMutations(VOICE_LINES, after, declared).ok, true);
});

test('a removed line is a mutation too', () => {
  const after = VOICE_LINES.filter(l => l.id !== 'VX-UNMEASURED');
  const mutations = diffVoiceLines(VOICE_LINES, after);
  assert.equal(mutations.length, 1);
  assert.equal(mutations[0].kind, 'REMOVED');
});

test('the learner surface carries its registered lines verbatim', () => {
  const surface = readFileSync(new URL('../math-surface/index.html', import.meta.url), 'utf8');
  for (const id of ['VX-L-ASK', 'VX-M-ASK', 'VX-S-ASK', 'VX-EXPLAIN-ASK', 'VX-L-ZERO', 'VX-UNMEASURED']) {
    const result = surfaceCarriesLine(surface, id);
    assert.equal(result.ok, true, `${id}: ${result.reason}\nexpected: ${result.expected}`);
  }
});

test('the family and teacher surfaces carry their registered lines verbatim', () => {
  const family = readFileSync(new URL('../math-surface/family.html', import.meta.url), 'utf8');
  assert.equal(surfaceCarriesLine(family, 'VX-FAMILY-OPEN').ok, true);

  const teacher = readFileSync(new URL('../math-surface/teacher.html', import.meta.url), 'utf8');
  assert.equal(surfaceCarriesLine(teacher, 'VX-TEACHER-REFUSAL').ok, true);
});

test('an unregistered line is reported rather than quietly accepted', () => {
  assert.equal(surfaceCarriesLine('anything', 'VX-DOES-NOT-EXIST').reason, 'UNREGISTERED_LINE');
  assert.equal(voiceLine('VX-DOES-NOT-EXIST'), null);
});

// --- THY-MINOR-NAME-ADULT-USE-001 ------------------------------------------

test('the protected name is found wherever it appears, in any case', () => {
  assert.equal(scanForProtectedNames('Daniel counted the beads.').length, 1);
  assert.equal(scanForProtectedNames("daniel's tin").length, 1);
  assert.equal(scanForProtectedNames('DANIEL and Nia').length, 1);
  assert.equal(scanForProtectedNames('Danielle counted the beads.').length, 0, 'a longer name is not the protected name');
  assert.equal(scanForProtectedNames('Nia counted the beads.').length, 0);
});

test('a protected name on a person under 18 is refused', () => {
  const result = checkMinorNameRule({
    id: 'X', text: 'Daniel has 12 beads.', people: [{ name: 'Daniel', age: 9 }]
  });
  assert.equal(result.ok, false);
  assert.ok(result.violations.some(v => v.kind === 'PROTECTED_NAME_ON_MINOR'));
  assert.throws(() => assertMinorNameRule(result.id ? [{ id: 'X', text: 'Daniel has 12 beads.', people: [{ name: 'Daniel', age: 9 }] }] : []), /ProtectedNameError|protected name/i);
});

test('a protected name with no declared adult use is refused even with no person listed', () => {
  const result = checkMinorNameRule({ id: 'Y', text: 'Ask Daniel about it.', people: [] });
  assert.equal(result.ok, false);
  assert.ok(result.violations.some(v => v.kind === 'PROTECTED_NAME_WITHOUT_DECLARED_ADULT_USE'));
});

test('declared adult use at eighteen or over is permitted', () => {
  const result = checkMinorNameRule({
    id: 'Z',
    text: 'Daniel signed the release.',
    people: [{ name: 'Daniel', age: 41 }],
    adult_use: { declared: true, name: 'Daniel', age: 41 }
  });
  assert.equal(result.ok, true);
  assert.equal(ADULT_AGE, 18);
});

test('adult use declared below eighteen is still refused', () => {
  const result = checkMinorNameRule({
    id: 'Z2',
    text: 'Daniel signed the release.',
    people: [{ name: 'Daniel', age: 17 }],
    adult_use: { declared: true, name: 'Daniel', age: 17 }
  });
  assert.equal(result.ok, false);
});

test('content free of the protected name passes', () => {
  const result = checkMinorNameRuleAcross([
    { id: 'A', text: 'Nia had 24 beads.', people: [{ name: 'Nia', age: 8 }] },
    { id: 'B', text: 'Kofi counted books.', people: [{ name: 'Kofi', age: 9 }] }
  ]);
  assert.equal(result.ok, true);
  assert.equal(result.checked, 2);
});

test('no learner-facing surface file carries the protected name', () => {
  for (const file of ['index.html', 'teacher.html', 'family.html', 'app.js']) {
    const text = readFileSync(new URL(`../math-surface/${file}`, import.meta.url), 'utf8');
    assert.equal(
      scanForProtectedNames(text).length, 0,
      `${file} carries a protected name; ${MINOR_NAME_PROTOCOL} permits it only as declared adult use`
    );
  }
  assert.deepEqual([...PROTECTED_NAMES], ['Daniel']);
});
