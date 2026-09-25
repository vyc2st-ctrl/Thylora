// Role Access: least-privilege, scoped, timed, logged, revocable grants.
//
// Shared primitive. No credential is ever stored or shared: a grant is a
// permission row bound to the grantee's OWN identity. Every check is written to
// a hash-chained log (lineage.appendLink) so denials and uses are witnessable.
//
// Used by: role access (lane 6), family crisis liaison access (lane 7),
// VYC Stream reviewer access (lane 5), pilot participant access (lane 10).

import { appendLink, verifyChain } from './lineage.js';

const DAY = 86400000;

// Scope grammar: <area>:<action>. No wildcard scopes exist.
export const ROLE_TEMPLATES = Object.freeze({
  CONTRACTOR:      { max_days: 30, scopes: ['workroom:read-assigned', 'task:update-assigned', 'artifact:upload-assigned'] },
  SOCIAL:          { max_days: 30, scopes: ['post:draft', 'post:read-approved', 'asset:read-approved'] },
  WRITER:          { max_days: 60, scopes: ['script:draft', 'script:read-assigned', 'canon:read-locked'] },
  DESIGNER:        { max_days: 60, scopes: ['visual:draft', 'asset:read-approved', 'canon:read-locked', 'preflight:read'] },
  FAMILY_LIAISON:  { max_days: 7,  scopes: ['incident:read-own', 'incident:update-own-contact'] },
  STREAM_REVIEWER: { max_days: 14, scopes: ['stream:read-queue', 'stream:route-atom'] },
  PILOT_PARTICIPANT: { max_days: 45, scopes: ['pilot:read-own', 'pilot:submit-idea', 'pilot:review-own-build'] },
});

// Actions no template may carry. Publication, payment, deletion and access
// administration stay with the Chairman.
export const RESERVED_SCOPES = Object.freeze(['store:publish', 'post:publish', 'payment:capture', 'record:delete', 'access:grant', 'canon:write']);

const SECRET_KEY = /pass(word)?|secret|token|credential|api[_-]?key|private[_-]?key|otp|pin$/i;

function hasSecretField(obj, depth = 0) {
  if (!obj || typeof obj !== 'object' || depth > 4) return false;
  return Object.keys(obj).some(k => SECRET_KEY.test(k) || hasSecretField(obj[k], depth + 1));
}

export function createAccessLedger() {
  return { grants: new Map(), log: [] };
}

function log(ledger, event) {
  return appendLink(ledger.log, event);
}

/**
 * Issue a grant. Refused when: scopes exceed the role template, a reserved
 * scope is asked for, duration exceeds the template maximum, no expiry, the
 * grantee is the issuer, or the payload carries anything credential-shaped.
 */
export function issueGrant(ledger, req, now) {
  const errors = [];
  const t = ROLE_TEMPLATES[req.role];
  if (!t) errors.push(`unknown role ${req.role}`);
  if (!req.grant_id) errors.push('grant_id missing');
  if (ledger.grants.has(req.grant_id)) errors.push('grant_id already used');
  if (!req.grantee_id) errors.push('grantee_id missing');
  if (!req.issued_by) errors.push('issued_by missing');
  if (req.grantee_id && req.grantee_id === req.issued_by) errors.push('self-grant refused');
  if (!req.reason) errors.push('reason missing');
  if (hasSecretField(req)) errors.push('credential-shaped field refused: grants never carry passwords or keys');
  const scopes = req.scopes || [];
  if (scopes.length === 0) errors.push('at least one scope required');
  for (const s of scopes) {
    if (RESERVED_SCOPES.includes(s)) errors.push(`reserved scope ${s}`);
    else if (t && !t.scopes.includes(s)) errors.push(`scope ${s} not in ${req.role} template`);
  }
  const exp = req.expires_at ? Date.parse(req.expires_at) : NaN;
  if (Number.isNaN(exp)) errors.push('expires_at required');
  else if (exp <= now) errors.push('expires_at must be in the future');
  else if (t && exp - now > t.max_days * DAY) errors.push(`duration exceeds ${t.max_days} days for ${req.role}`);

  if (errors.length) {
    log(ledger, { event: 'GRANT_REFUSED', grant_id: req.grant_id || null, actor: req.issued_by || null, at: new Date(now).toISOString(), errors });
    return { ok: false, errors };
  }
  const g = Object.freeze({
    grant_id: req.grant_id, grantee_id: req.grantee_id, role: req.role,
    scopes: [...scopes], resource_ids: [...(req.resource_ids || [])],
    issued_by: req.issued_by, issued_at: new Date(now).toISOString(),
    expires_at: new Date(exp).toISOString(), reason: req.reason,
  });
  ledger.grants.set(g.grant_id, { ...g, revoked_at: null, revoked_by: null });
  log(ledger, { event: 'GRANT_ISSUED', grant_id: g.grant_id, actor: g.issued_by, at: g.issued_at, role: g.role, scopes: g.scopes });
  return { ok: true, grant: g };
}

/** Check one action. Every call is logged, allowed or not. */
export function check(ledger, { grantee_id, scope, resource_id }, now) {
  const at = new Date(now).toISOString();
  let decision = { allow: false, reason: 'no grant' };
  for (const g of ledger.grants.values()) {
    if (g.grantee_id !== grantee_id || !g.scopes.includes(scope)) continue;
    if (g.revoked_at) { decision = { allow: false, reason: 'revoked', grant_id: g.grant_id }; continue; }
    if (Date.parse(g.expires_at) <= now) { decision = { allow: false, reason: 'expired', grant_id: g.grant_id }; continue; }
    if (g.resource_ids.length && !g.resource_ids.includes(resource_id)) { decision = { allow: false, reason: 'resource out of scope', grant_id: g.grant_id }; continue; }
    decision = { allow: true, reason: 'granted', grant_id: g.grant_id };
    break;
  }
  log(ledger, { event: decision.allow ? 'ACCESS_ALLOWED' : 'ACCESS_DENIED', actor: grantee_id, scope, resource_id: resource_id || null, at, ...decision });
  return decision;
}

export function revoke(ledger, grant_id, by, now, reason) {
  const g = ledger.grants.get(grant_id);
  if (!g) return { ok: false, errors: ['unknown grant'] };
  if (g.revoked_at) return { ok: false, errors: ['already revoked'] };
  g.revoked_at = new Date(now).toISOString();
  g.revoked_by = by;
  log(ledger, { event: 'GRANT_REVOKED', grant_id, actor: by, at: g.revoked_at, reason: reason || null });
  return { ok: true };
}

/** Grants that are live right now, for the "who can see what" view. */
export function activeGrants(ledger, now) {
  return [...ledger.grants.values()].filter(g => !g.revoked_at && Date.parse(g.expires_at) > now);
}

export function verifyAccessLog(ledger) {
  return verifyChain(ledger.log);
}
