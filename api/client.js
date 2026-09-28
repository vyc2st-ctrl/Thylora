// THYLORA API v1 client core — provider-independent session handling.
//
// Fixes acceptance check C05: the current dashboard stores refresh_token but never uses it,
// so a restored session dies silently when the access token expires.
//
// Rules this client enforces:
//   1. Restore: a stored session is reused; if its access token is expired (or within the
//      skew window) it is refreshed BEFORE the first request, not after a failure.
//   2. A 401 triggers at most ONE refresh and ONE retry. No loops.
//   3. Concurrent requests share a single in-flight refresh.
//   4. A failed refresh clears the session and reports SIGNED_OUT with the reason.
//   5. No provider name leaks into callers: the transport is injected.

export const SKEW_SECONDS = 60;

export function isExpired(session, nowSeconds, skew = SKEW_SECONDS) {
  if (!session || !session.access_token) return true;
  if (typeof session.expires_at !== 'number') return false; // unknown expiry: let the server decide
  return nowSeconds >= session.expires_at - skew;
}

export function createClient({ transport, storage, now = () => Math.floor(Date.now() / 1000) }) {
  if (typeof transport?.refresh !== 'function' || typeof transport?.request !== 'function') {
    throw new Error('TRANSPORT_INCOMPLETE');
  }
  let session = storage.load();
  let inflight = null;
  const events = [];

  function setSession(next, reason) {
    session = next;
    if (next) storage.save(next); else storage.clear();
    events.push({ at: now(), state: next ? 'SIGNED_IN' : 'SIGNED_OUT', reason });
  }

  async function refresh(reason) {
    if (!session?.refresh_token) {
      setSession(null, `NO_REFRESH_TOKEN:${reason}`);
      throw Object.assign(new Error('SIGNED_OUT'), { code: 'SIGNED_OUT', reason: 'NO_REFRESH_TOKEN' });
    }
    if (!inflight) {
      const token = session.refresh_token;
      inflight = transport.refresh(token)
        .then((next) => { setSession(next, `REFRESHED:${reason}`); return next; })
        .catch((err) => {
          setSession(null, `REFRESH_FAILED:${reason}`);
          throw Object.assign(new Error('SIGNED_OUT'), { code: 'SIGNED_OUT', reason: 'REFRESH_FAILED', cause: err });
        })
        .finally(() => { inflight = null; });
    }
    return inflight;
  }

  async function restore() {
    if (!session) return { state: 'SIGNED_OUT', reason: 'NO_STORED_SESSION' };
    if (isExpired(session, now())) {
      try { await refresh('RESTORE_EXPIRED'); } catch (e) { return { state: 'SIGNED_OUT', reason: e.reason }; }
      return { state: 'SIGNED_IN', reason: 'RESTORED_AFTER_REFRESH' };
    }
    return { state: 'SIGNED_IN', reason: 'RESTORED' };
  }

  async function request(path, init = {}) {
    if (!session) throw Object.assign(new Error('SIGNED_OUT'), { code: 'SIGNED_OUT', reason: 'NO_SESSION' });
    if (isExpired(session, now())) await refresh('PRE_REQUEST_EXPIRED');
    let res = await transport.request(path, init, session.access_token);
    if (res.status === 401) {
      await refresh('HTTP_401');
      res = await transport.request(path, init, session.access_token);
    }
    return res;
  }

  return {
    restore,
    request,
    signIn: (next) => setSession(next, 'SIGN_IN'),
    signOut: () => setSession(null, 'SIGN_OUT'),
    get session() { return session; },
    events,
  };
}

// Supabase adapter for the transport. Kept separate so the client core stays provider-free.
export function supabaseTransport({ baseUrl, apiKey, fetchImpl = globalThis.fetch }) {
  return {
    async refresh(refreshToken) {
      const r = await fetchImpl(`${baseUrl}/auth/v1/token?grant_type=refresh_token`, {
        method: 'POST',
        headers: { apikey: apiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      if (!r.ok) throw new Error(`REFRESH_HTTP_${r.status}`);
      return r.json();
    },
    async request(path, init, accessToken) {
      return fetchImpl(`${baseUrl}${path}`, {
        ...init,
        headers: { apikey: apiKey, Authorization: `Bearer ${accessToken}`, ...(init.headers || {}) },
      });
    },
  };
}
