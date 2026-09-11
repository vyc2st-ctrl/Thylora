// RAE LINK · backend client
// Workroom: WR-RAELINK-001
//
// One backend, one session. RAE Link speaks to the same thylora-dash project and
// reuses the same browser session key as the THYLORA member app, so signing in
// once works across both surfaces. This file creates no second source of truth
// and no second identity system.
//
// The RAE Link tables are held for Chairman application (see db/rae-link). Until
// they exist the client must degrade honestly: a missing table is reported as
// "not provisioned yet", never as an empty feed that looks like no content.

export const SUPABASE_URL = 'https://jvsdxhrfhtlgaknhjxlz.supabase.co';
export const SUPABASE_KEY = 'sb_publishable_ta33XJ9rtS8VljoUYw-GuA_Pi4OycpQ';
export const SESSION_KEY = 'thylora_app_auth_session';

export class BackendError extends Error {
  constructor(message, { status = 0, code = null, provisionRequired = false } = {}) {
    super(message);
    this.name = 'BackendError';
    this.status = status;
    this.code = code;
    this.provisionRequired = provisionRequired;
  }
}

export function getSession() {
  try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null'); } catch { return null; }
}
export function setSession(value) {
  if (value) sessionStorage.setItem(SESSION_KEY, JSON.stringify(value));
  else sessionStorage.removeItem(SESSION_KEY);
}
export function currentUser() { return getSession()?.user ?? null; }
function authToken() { return getSession()?.access_token || SUPABASE_KEY; }

// PostgREST reports an absent table or function with these codes. They mean
// "the migration has not been applied", not "the request was wrong".
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
      message: error.message
    };
  }
}

/** Probe which RAE Link surfaces the live backend can currently serve. */
export async function readiness() {
  const checks = [
    ['feed', () => rpc('rael_public_feed', { p_limit: 1 })],
    ['channels', () => api('/rest/v1/rael_channels?select=id&limit=1')],
    ['assets', () => api('/rest/v1/rael_media_assets?select=id&limit=1')],
    ['lanes', () => api('/rest/v1/rael_revenue_lanes?select=lane_code&limit=1')],
    ['ledger', () => api('/rest/v1/rael_ledger_entries?select=id&limit=1')]
  ];
  const results = await Promise.all(checks.map(([name, run]) => safeRead(name, run)));
  const provisioned = results.filter(r => r.ok).map(r => r.label);
  const missing = results.filter(r => !r.ok && r.provisionRequired).map(r => r.label);
  const errored = results.filter(r => !r.ok && !r.provisionRequired)
    .map(r => ({ surface: r.label, message: r.message }));
  return {
    provisioned,
    missing,
    errored,
    state: missing.length === 0 && errored.length === 0 ? 'READY'
         : provisioned.length === 0 ? 'NOT_PROVISIONED' : 'PARTIAL'
  };
}
