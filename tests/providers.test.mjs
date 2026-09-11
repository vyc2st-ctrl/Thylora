// RAE LINK · provider abstraction tests
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CAPABILITIES, resolve, openDecisions, lockInRisk } from '../rae-link/lib/providers.js';

test('every capability offers at least two alternates so no vendor is permanent', () => {
  for (const [capability, spec] of Object.entries(CAPABILITIES)) {
    assert.ok((spec.alternates ?? []).length >= 2, `${capability} has fewer than two alternates`);
  }
});

test('an unchosen provider resolves to an open decision, never to a silent default', () => {
  const decision = resolve('video_transcode');
  assert.equal(decision.status, 'UNRESOLVED');
  assert.equal(decision.provider, null);
  assert.ok(decision.alternates.length >= 2);
});

test('a capability can be redirected by configuration alone', () => {
  const decision = resolve('object_storage', { object_storage: 'r2' });
  assert.equal(decision.provider, 'r2');
});

test('an unknown capability is reported rather than guessed', () => {
  assert.equal(resolve('teleportation').status, 'UNKNOWN_CAPABILITY');
});

test('open decisions and lock-in risk are countable, not vibes', () => {
  const risk = lockInRisk();
  assert.equal(risk.without_two_alternates, 0);
  assert.equal(risk.open_decisions, openDecisions().length);
  assert.ok(risk.capabilities >= 20);
});
