import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createAccessLedger, issueGrant, check, revoke, activeGrants, verifyAccessLog } from '../spine/lib/access.js';

const T0 = Date.parse('2026-09-24T12:00:00Z');
const DAY = 86400000;
const req = (o = {}) => ({ grant_id: 'G1', grantee_id: 'writer-1', role: 'WRITER', scopes: ['script:draft'], issued_by: 'chairman', reason: 'TX001 script', expires_at: new Date(T0 + 10 * DAY).toISOString(), ...o });

test('scoped, timed grant allows only its scope until expiry', () => {
  const L = createAccessLedger();
  assert.ok(issueGrant(L, req(), T0).ok);
  assert.equal(check(L, { grantee_id: 'writer-1', scope: 'script:draft' }, T0 + DAY).allow, true);
  assert.equal(check(L, { grantee_id: 'writer-1', scope: 'visual:draft' }, T0 + DAY).allow, false);
  assert.equal(check(L, { grantee_id: 'writer-1', scope: 'script:draft' }, T0 + 11 * DAY).reason, 'expired');
});

test('revocation takes effect immediately and is logged', () => {
  const L = createAccessLedger();
  issueGrant(L, req(), T0);
  assert.ok(revoke(L, 'G1', 'chairman', T0 + DAY, 'lane closed').ok);
  assert.equal(check(L, { grantee_id: 'writer-1', scope: 'script:draft' }, T0 + DAY + 1).reason, 'revoked');
  assert.equal(activeGrants(L, T0 + 2 * DAY).length, 0);
  const events = L.log.map(l => l.event);
  assert.deepEqual(events, ['GRANT_ISSUED', 'GRANT_REVOKED', 'ACCESS_DENIED']);
  assert.equal(verifyAccessLog(L).ok, true);
});

test('least privilege: out-of-template, reserved, too long, self-grant, no expiry', () => {
  const L = createAccessLedger();
  assert.match(issueGrant(L, req({ scopes: ['visual:draft'] }), T0).errors.join(), /not in WRITER/);
  assert.match(issueGrant(L, req({ grant_id: 'G2', scopes: ['post:publish'] }), T0).errors.join(), /reserved/);
  assert.match(issueGrant(L, req({ grant_id: 'G3', expires_at: new Date(T0 + 90 * DAY).toISOString() }), T0).errors.join(), /exceeds 60 days/);
  assert.match(issueGrant(L, req({ grant_id: 'G4', grantee_id: 'chairman' }), T0).errors.join(), /self-grant/);
  assert.match(issueGrant(L, req({ grant_id: 'G5', expires_at: undefined }), T0).errors.join(), /expires_at required/);
  assert.equal(L.log.filter(l => l.event === 'GRANT_REFUSED').length, 5);
});

test('no password sharing: credential-shaped fields refused', () => {
  const L = createAccessLedger();
  assert.match(issueGrant(L, req({ password: 'hunter2' }), T0).errors.join(), /credential/);
  assert.match(issueGrant(L, req({ grant_id: 'G9', meta: { api_key: 'x' } }), T0).errors.join(), /credential/);
});

test('resource pinning limits a grant to named resources', () => {
  const L = createAccessLedger();
  issueGrant(L, { grant_id: 'C1', grantee_id: 'c-1', role: 'CONTRACTOR', scopes: ['workroom:read-assigned'], resource_ids: ['WR-TEN-LANE-001'], issued_by: 'chairman', reason: 'x', expires_at: new Date(T0 + 5 * DAY).toISOString() }, T0);
  assert.equal(check(L, { grantee_id: 'c-1', scope: 'workroom:read-assigned', resource_id: 'WR-TEN-LANE-001' }, T0).allow, true);
  assert.equal(check(L, { grantee_id: 'c-1', scope: 'workroom:read-assigned', resource_id: 'WR-OTHER' }, T0).reason, 'resource out of scope');
});

test('tampered access log is detected', () => {
  const L = createAccessLedger();
  issueGrant(L, req(), T0);
  check(L, { grantee_id: 'writer-1', scope: 'script:draft' }, T0);
  L.log[1] = { ...L.log[1], allow: false };
  assert.equal(verifyAccessLog(L).ok, false);
});
