import { test } from 'node:test';
import assert from 'node:assert/strict';
import { route, grantLiaison, DISCLAIMER } from '../spine/lib/crisis.js';
import { createAccessLedger, check } from '../spine/lib/access.js';
import { claimGuard } from '../spine/lib/qyris2st.js';

test('medical emergency routes emergency services first', () => {
  const r = route({ incident_id: 'INC-1', type: 'MEDICAL', country: 'US', immediate_danger: true });
  assert.ok(r.ok);
  assert.equal(r.steps[0].lane, 'EMERGENCY_SERVICES');
  assert.match(r.steps[0].text, /911/);
});

test('mental health crisis includes 988 in the US', () => {
  const r = route({ incident_id: 'INC-2', type: 'MENTAL_HEALTH', country: 'US' });
  assert.match(r.steps[0].text, /988/);
});

test('unknown country falls back to local emergency number', () => {
  const r = route({ incident_id: 'INC-3', type: 'SAFETY_VIOLENCE', country: 'ZZ' });
  assert.match(r.steps[0].text, /local emergency number/);
});

test('legal incident names only verified counsel in the matching jurisdiction', () => {
  const counsel = [
    { id: 'c1', verification_state: 'VERIFIED', jurisdiction: 'US-MD' },
    { id: 'c2', verification_state: 'UNVERIFIED', jurisdiction: 'US-MD' },
    { id: 'c3', verification_state: 'VERIFIED', jurisdiction: 'US-VA' },
  ];
  const r = route({ incident_id: 'INC-4', type: 'LEGAL_DETENTION', jurisdiction: 'US-MD', country: 'US' }, { counsel });
  const step = r.steps.find(s => s.lane === 'COUNSEL_REFERRAL');
  assert.deepEqual(step.counsel_ids, ['c1']);
  const none = route({ incident_id: 'INC-5', type: 'LEGAL_OTHER', jurisdiction: 'US-MD', country: 'US' }, { counsel: [] });
  assert.equal(none.steps.find(s => s.lane === 'COUNSEL_REFERRAL').state, 'VERIFICATION_PENDING');
});

test('route output makes no representation or medical-service claim', () => {
  for (const type of ['MEDICAL', 'LEGAL_DETENTION', 'DEATH_IN_FAMILY']) {
    const r = route({ incident_id: 'I', type, country: 'US', jurisdiction: 'US-MD' });
    assert.deepEqual(claimGuard([r.disclaimer, ...r.steps.map(s => s.text)].join(' ')), []);
  }
  assert.match(DISCLAIMER, /not your lawyer/);
});

test('liaison access is scoped to one incident and expires in 3 days', () => {
  const L = createAccessLedger();
  const T0 = Date.parse('2026-09-24T12:00:00Z');
  assert.ok(grantLiaison(L, { incident_id: 'INC-1', liaison_id: 'aunt-1', issued_by: 'people-desk' }, T0).ok);
  assert.equal(check(L, { grantee_id: 'aunt-1', scope: 'incident:read-own', resource_id: 'INC-1' }, T0).allow, true);
  assert.equal(check(L, { grantee_id: 'aunt-1', scope: 'incident:read-own', resource_id: 'INC-2' }, T0).allow, false);
  assert.equal(check(L, { grantee_id: 'aunt-1', scope: 'incident:read-own', resource_id: 'INC-1' }, T0 + 4 * 86400000).reason, 'expired');
});

test('invalid incident type refused', () => {
  assert.equal(route({ incident_id: 'I', type: 'OTHER' }).ok, false);
});
