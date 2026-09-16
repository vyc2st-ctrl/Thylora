// THYLORA · canonical backend client
//
// ONE backend, ONE session, ONE definition of both.
//
// Every THYLORA surface (member app, RAE Link, the mobile Chairman + public
// shell) speaks to the same `thylora-dash` project and reads the same browser
// session key, so signing in once works everywhere. The constants below are the
// only place those values are defined. A surface that hard-codes its own copy is
// a competing backend, which this file exists to prevent; tests/continuity.test.mjs
// fails the build if a second project reference appears anywhere in the repo.
//
// Deployment authority for the Chairman dashboard is NOT this repository
// (see DASHBOARD_AUTHORITY.md). This client reads and writes the canonical
// backend; it does not define a second source of truth.

export const SUPABASE_URL = 'https://jvsdxhrfhtlgaknhjxlz.supabase.co';
export const SUPABASE_KEY = 'sb_publishable_ta33XJ9rtS8VljoUYw-GuA_Pi4OycpQ';
export const SESSION_KEY = 'thylora_app_auth_session';
export const BACKEND_PROJECT = 'jvsdxhrfhtlgaknhjxlz';

export class BackendError extends Error {
  constructor(message, { status = 0, code = null, provisionRequired = false } = {}) {
    super(message);
    this.name = 'BackendError';
    this.status = status;
    this.code = code;
    this.provisionRequired = provisionRequired;
  }
}

/* ------------------------------------------------------------------ session */
// sessionStorage is the established THYLORA store for the auth session; it is
// read through try/catch because Safari private mode throws on access rather
// than returning null.

function store() {
  try { return globalThis.sessionStorage ?? null; } catch { return null; }
}

export function getSession() {
  try { return JSON.parse(store()?.getItem(SESSION_KEY) || 'null'); } catch { return null; }
}

export function setSession(value) {
  const s = store();
  if (!s) return;
  try {
    if (value) s.setItem(SESSION_KEY, JSON.stringify(value));
    else s.removeItem(SESSION_KEY);
  } catch { /* storage unavailable; the session stays in memory only */ }
}

export function currentUser() { return getSession()?.user ?? null; }

/** True only when a real access token AND a real user id are both present. */
export function isSignedIn() {
  const session = getSession();
  return Boolean(session?.access_token && session?.user?.id);
}

function authToken() { return getSession()?.access_token || SUPABASE_KEY; }

/* ---------------------------------------------------------------- transport */
// PostgREST reports an absent table or function with these codes. They mean
// "the migration has not been applied", not "the request was malformed", and
// they must never be shown to a reader as an empty result.
const PROVISION_CODES = new Set(['PGRST202', 'PGRST205', '42P01', '42883']);

export async function api(path, { method = 'GET', body = null, auth = true, headers = {} } = {}) {
  const requestHeaders = { apikey: SUPABASE_KEY, ...headers };
  if (auth) requestHeaders.Authorization = `Bearer ${authToken()}`;
  if (body !== null) requestHeaders['Content-Type'] = 'application/json';

  let response;
  try {
    response = await fetch(`${SUPABASE_URL}${path}`, {
      method, headers: requestHeaders, body: body === null ? undefined : JSON.stringify(body)
    });
  } catch (networkError) {
    throw new BackendError(`Backend unreachable: ${networkError.message}`, { status: 0 });
  }

  const text = await response.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }

  if (!response.ok) {
    const code = data && typeof data === 'object' ? data.code : null;
    const message = (data && typeof data === 'object' &&
      (data.message || data.error_description || data.error || data.hint)) || text || `HTTP ${response.status}`;
    throw new BackendError(message, {
      status: response.status,
      code,
      provisionRequired: PROVISION_CODES.has(code) || /does not exist|schema cache/i.test(String(message))
    });
  }
  return data;
}

export function rpc(name, payload = {}) {
  return api(`/rest/v1/rpc/${name}`, { method: 'POST', body: payload });
}

/**
 * Invoke a THYLORA Edge Function.
 *
 * This is how the Chairman surfaces reach server-side capability that holds
 * provider credentials — the THYLORA Media Router (`thylora-ai-router`), the
 * chairman-command spine and the build compiler. The credential never reaches
 * the browser: the function is called with the Chairman's own access token and
 * the provider secret is read server-side.
 *
 * A function is NOT a table. An Edge Function that is not deployed answers 404
 * with a non-PostgREST body, so `provisionRequired` is set here too — a surface
 * must be able to say "this router is not deployed yet" rather than reporting a
 * generic failure or, worse, implying the call succeeded.
 */
export async function invokeFunction(name, body = {}, { method = 'POST' } = {}) {
  const session = getSession();
  if (!session?.access_token) {
    throw new BackendError(
      'An authenticated THYLORA session is required to call a protected function.',
      { status: 401, code: 'NO_SESSION' }
    );
  }

  let response;
  try {
    response = await fetch(`${SUPABASE_URL}/functions/v1/${name}`, {
      method,
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      },
      body: method === 'GET' ? undefined : JSON.stringify(body)
    });
  } catch (networkError) {
    throw new BackendError(`Backend unreachable: ${networkError.message}`, { status: 0 });
  }

  const text = await response.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }

  if (!response.ok) {
    const message = (data && typeof data === 'object' &&
      (data.message || data.error || data.msg)) || text || `HTTP ${response.status}`;
    throw new BackendError(message, {
      status: response.status,
      code: data && typeof data === 'object' ? data.code ?? null : null,
      // 404 on a function path means the function is not deployed.
      provisionRequired: response.status === 404 || /not found|does not exist/i.test(String(message))
    });
  }
  return data;
}

/* -------------------------------------------------------------------- auth */
export async function signIn(email, password) {
  const data = await api('/auth/v1/token?grant_type=password', {
    method: 'POST', body: { email, password }, auth: false
  });
  setSession(data);
  return data;
}

export async function signUp(email, password) {
  const data = await api('/auth/v1/signup', { method: 'POST', body: { email, password }, auth: false });
  if (data?.access_token) setSession(data);
  return data;
}

export function signOut() { setSession(null); }

/* --------------------------------------------------------------- degradation */
/**
 * Run a read and return a result envelope instead of throwing, so one absent
 * table degrades that panel only and never takes down the page.
 */
export async function safeRead(label, run) {
  try {
    return { ok: true, label, data: await run() };
  } catch (error) {
    return {
      ok: false,
      label,
      data: null,
      provisionRequired: Boolean(error.provisionRequired),
      unreachable: error.status === 0,
      message: error.message
    };
  }
}

/**
 * Probe a set of named reads and classify the backend's posture.
 * `checks` is an array of [label, run] pairs.
 */
export async function probe(checks) {
  const results = await Promise.all(checks.map(([name, run]) => safeRead(name, run)));
  const provisioned = results.filter(r => r.ok).map(r => r.label);
  const missing = results.filter(r => !r.ok && r.provisionRequired).map(r => r.label);
  const errored = results.filter(r => !r.ok && !r.provisionRequired)
    .map(r => ({ surface: r.label, message: r.message, unreachable: r.unreachable }));
  const unreachable = errored.length > 0 && errored.every(e => e.unreachable);
  return {
    results,
    provisioned,
    missing,
    errored,
    unreachable,
    state: unreachable ? 'UNREACHABLE'
         : missing.length === 0 && errored.length === 0 ? 'READY'
         : provisioned.length === 0 ? 'NOT_PROVISIONED'
         : 'PARTIAL'
  };
}
