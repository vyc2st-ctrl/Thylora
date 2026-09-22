// THYLORA · QYRIS backend client
// Workroom: WR-QYRIS-585
//
// One backend, one session. QYRIS speaks to the same thylora-dash project and
// reuses the same browser session key as the member app and RAE Link, so
// signing in once works across every surface. No second identity system.
//
// The QYRIS tables are held for Chairman application (see db/qyris). Until they
// exist the client degrades honestly: a missing table reports "not provisioned
// yet", never an empty pack that looks like nobody wrote any questions.

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
export function currentUser() { return getSession()?.user ?? null; }
function authToken() { return getSession()?.access_token || SUPABASE_KEY; }

// PostgREST reports an absent table or function with these codes. They mean
// "the migration has not been applied", not "the request was wrong".
const PROVISION_CODES = new Set(['PGRST202', 'PGRST205', '42P01', '42883']);

export async function api(path, { method = 'GET', body = null, headers = {} } = {}) {
  const requestHeaders = { apikey: SUPABASE_KEY, Authorization: `Bearer ${authToken()}`, ...headers };
  if (body !== null) requestHeaders['Content-Type'] = 'application/json';
  let response;
  try {
    response = await fetch(`${SUPABASE_URL}${path}`, {
      method, headers: requestHeaders, body: body === null ? undefined : JSON.stringify(body),
    });
  } catch (cause) {
    throw new BackendError(`Backend unreachable: ${cause.message}`, { status: 0 });
  }
  const text = await response.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!response.ok) {
    const code = data && typeof data === 'object' ? data.code : null;
    throw new BackendError(
      (data && typeof data === 'object' && (data.message || data.hint)) || text || `HTTP ${response.status}`,
      { status: response.status, code, provisionRequired: PROVISION_CODES.has(code) },
    );
  }
  return data;
}

export const rpc = (name, payload = {}) => api(`/rest/v1/rpc/${name}`, { method: 'POST', body: payload });

/**
 * A read that degrades instead of blanking the page. One absent table takes
 * down one panel and says why, rather than making the whole surface look empty.
 */
export async function safeRead(label, run) {
  try {
    return { label, ok: true, data: await run(), note: null };
  } catch (error) {
    const provision = error instanceof BackendError && error.provisionRequired;
    return {
      label,
      ok: false,
      data: null,
      provisionRequired: provision,
      note: provision
        ? 'Not provisioned yet — db/qyris migrations are held for Chairman application.'
        : `Unavailable: ${error.message}`,
    };
  }
}

/**
 * The readback probes the surface shows. Each one is a claim the backend can
 * confirm or deny; none of them is assumed.
 */
export const PROBES = Object.freeze([
  { key: 'rules', label: 'Stopping rule readable from the backend', run: () => api('/rest/v1/qyr_rules?select=rule_key,rule_text') },
  { key: 'pack', label: 'Pre-marriage pack readable', run: () => rpc('qyr_pack_shape', { p_pack_id: 'QYRIS-PREMARRIAGE-001' }) },
  { key: 'industry', label: 'Industry projection readable', run: () => rpc('qyr_projection_report') },
  { key: 'families', label: 'Trusted Six role families readable', run: () => api('/rest/v1/qyr_role_families?select=family_id,label,routes_out_to') },
  { key: 'summary', label: 'Readback summary', run: () => rpc('qyr_readback_summary') },
  { key: 'sr', label: 'SR candidate reads back as not canon', run: () => api('/rest/v1/qyr_sr_candidate?select=candidate_id,canon,status') },
]);

export async function runProbes() {
  const results = await Promise.all(PROBES.map((probe) => safeRead(probe.label, probe.run)));
  const passed = results.filter((result) => result.ok).length;
  return {
    results,
    passed,
    total: results.length,
    state: passed === results.length ? 'READY' : passed === 0 ? 'NOT_PROVISIONED' : 'PARTIAL',
  };
}
