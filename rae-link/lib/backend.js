// RAE LINK · backend client
// Workroom: WR-RAELINK-001
//
// One backend, one session. The transport, the session key and the Supabase
// project now live in ONE place for every THYLORA surface:
//   lib/thylora-backend.js
// This file re-exports that canonical client and adds only the RAE Link
// readiness probe. It deliberately does not redefine the URL, the key or the
// session key: signing in once must keep working across the member app, RAE
// Link and the mobile Chairman + public shell.
//
// The RAE Link tables are held for Chairman application (see db/rae-link). Until
// they exist the client must degrade honestly: a missing table is reported as
// "not provisioned yet", never as an empty feed that looks like no content.

export {
  SUPABASE_URL, SUPABASE_KEY, SESSION_KEY, BACKEND_PROJECT,
  BackendError, api, rpc, safeRead, probe,
  getSession, setSession, currentUser, isSignedIn,
  signIn, signUp, signOut
} from '../../lib/thylora-backend.js';

import { api, rpc, probe } from '../../lib/thylora-backend.js';

/** Probe which RAE Link surfaces the live backend can currently serve. */
export async function readiness() {
  const report = await probe([
    ['feed', () => rpc('rael_public_feed', { p_limit: 1 })],
    ['channels', () => api('/rest/v1/rael_channels?select=id&limit=1')],
    ['assets', () => api('/rest/v1/rael_media_assets?select=id&limit=1')],
    ['lanes', () => api('/rest/v1/rael_revenue_lanes?select=lane_code&limit=1')],
    ['ledger', () => api('/rest/v1/rael_ledger_entries?select=id&limit=1')]
  ]);
  // RAE Link's own surface contract predates the shared probe and expects
  // NOT_PROVISIONED / PARTIAL / READY only, so an unreachable backend is
  // reported through `errored` exactly as before.
  return {
    provisioned: report.provisioned,
    missing: report.missing,
    errored: report.errored.map(({ surface, message }) => ({ surface, message })),
    state: report.state === 'UNREACHABLE'
      ? (report.provisioned.length === 0 ? 'NOT_PROVISIONED' : 'PARTIAL')
      : report.state
  };
}
