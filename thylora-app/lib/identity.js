// THYLORA APP · identity + Chairman authorization
// Workroom: WR-THYAPP-001
//
// WHAT THIS FILE IS, AND WHAT IT IS NOT
//
// This decides whether the shell *shows* the Chairman workspace. It is not the
// security boundary. The real gate is the canonical backend: row-level security
// and the `submit_thylora_chairman_command_v1` RPC decide what a token may
// actually read or route. A tampered browser can flip anything here and still
// get nothing but refusals from the backend.
//
// Two rules matter and both are load-bearing:
//
//  1. AUTHORIZATION IS A SERVER CLAIM. It is read from `app_metadata` in the
//     verified access token, which only the backend can write. `user_metadata`
//     is editable by the signed-in user, so a role found there is ignored —
//     honouring it would let any member promote themselves to Chairman in the
//     UI. There is no client-side allowlist of emails; an address is not proof.
//
//  2. AN EXPIRED TOKEN IS NOT AN IDENTITY. A stale session is treated as signed
//     out rather than quietly kept on screen.

export const CHAIRMAN_ROLE = 'CHAIRMAN';

/** Reasons a Chairman request can be refused. Surfaced verbatim to the reader. */
export const REFUSAL = Object.freeze({
  NO_SESSION: 'NO_SESSION',
  EXPIRED: 'EXPIRED',
  NOT_AUTHORIZED: 'NOT_AUTHORIZED',
  UNREADABLE_TOKEN: 'UNREADABLE_TOKEN'
});

export const REFUSAL_TEXT = Object.freeze({
  [REFUSAL.NO_SESSION]: 'The Chairman workspace needs a signed-in THYLORA session.',
  [REFUSAL.EXPIRED]: 'This THYLORA session has expired. Sign in again to reopen the Chairman workspace.',
  [REFUSAL.NOT_AUTHORIZED]: 'This identity is not authorized for the Chairman workspace.',
  [REFUSAL.UNREADABLE_TOKEN]: 'This session token could not be read, so Chairman authority cannot be confirmed.'
});

/* ------------------------------------------------------------ token reading */
function base64UrlDecode(segment) {
  const padded = segment.replace(/-/g, '+').replace(/_/g, '/')
    .padEnd(Math.ceil(segment.length / 4) * 4, '=');
  if (typeof globalThis.atob === 'function') {
    const binary = globalThis.atob(padded);
    // Rebuild UTF-8 from the byte string so non-ASCII names survive.
    const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }
  return Buffer.from(padded, 'base64').toString('utf8');
}

/**
 * Read the claims out of a JWT access token without verifying its signature.
 * Verification is the backend's job; this is only used to decide what to draw.
 * Returns null when the token is absent or unreadable.
 */
export function decodeClaims(accessToken) {
  if (typeof accessToken !== 'string') return null;
  const parts = accessToken.split('.');
  if (parts.length !== 3) return null;
  try {
    const claims = JSON.parse(base64UrlDecode(parts[1]));
    return claims && typeof claims === 'object' ? claims : null;
  } catch {
    return null;
  }
}

export function isExpired(claims, now = Date.now()) {
  const exp = Number(claims?.exp);
  if (!Number.isFinite(exp)) return false; // no exp claim: let the backend decide
  return exp * 1000 <= now;
}

/* ------------------------------------------------------- role determination */
/**
 * Pull THYLORA roles from server-controlled metadata only.
 * Accepts `thylora_role` (string) or `thylora_roles` (array).
 */
export function serverRoles(claims) {
  const appMetadata = claims?.app_metadata;
  if (!appMetadata || typeof appMetadata !== 'object') return [];
  const single = typeof appMetadata.thylora_role === 'string' ? [appMetadata.thylora_role] : [];
  const many = Array.isArray(appMetadata.thylora_roles) ? appMetadata.thylora_roles : [];
  return [...single, ...many]
    .filter(r => typeof r === 'string')
    .map(r => r.trim().toUpperCase())
    .filter(Boolean);
}

/**
 * Decide whether this session may open the Chairman workspace.
 * Returns { authorized, reason, message, identity, roles }.
 */
export function chairmanAuthorization(session, now = Date.now()) {
  const refuse = reason => ({
    authorized: false, reason, message: REFUSAL_TEXT[reason], identity: null, roles: []
  });

  if (!session?.access_token || !session?.user?.id) return refuse(REFUSAL.NO_SESSION);

  const claims = decodeClaims(session.access_token);
  if (!claims) return refuse(REFUSAL.UNREADABLE_TOKEN);
  if (isExpired(claims, now)) return refuse(REFUSAL.EXPIRED);

  const roles = serverRoles(claims);
  if (!roles.includes(CHAIRMAN_ROLE)) return refuse(REFUSAL.NOT_AUTHORIZED);

  return {
    authorized: true,
    reason: null,
    message: null,
    roles,
    identity: {
      userId: session.user.id,
      email: session.user.email ?? claims.email ?? null,
      label: session.user.email ?? claims.email ?? 'Chairman'
    }
  };
}

/** A plain signed-in member (enough for My Purchases, My Questions, follows). */
export function memberAuthorization(session, now = Date.now()) {
  if (!session?.access_token || !session?.user?.id) {
    return { signedIn: false, reason: REFUSAL.NO_SESSION, message: REFUSAL_TEXT[REFUSAL.NO_SESSION], identity: null };
  }
  const claims = decodeClaims(session.access_token);
  if (claims && isExpired(claims, now)) {
    return { signedIn: false, reason: REFUSAL.EXPIRED, message: REFUSAL_TEXT[REFUSAL.EXPIRED], identity: null };
  }
  return {
    signedIn: true, reason: null, message: null,
    identity: {
      userId: session.user.id,
      email: session.user.email ?? null,
      label: session.user.email ?? 'member'
    }
  };
}
