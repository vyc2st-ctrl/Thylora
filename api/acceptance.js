// THYLORA Minimum Usable Chairman Cut — acceptance ledger.
//
// Percent complete is computed, never typed in:
//   P = |{ checks : state = PASS and evidence present }| / |checks| × 100
// A check without an evidence reference cannot count as PASS, whatever its label.
//
// States:
//   PASS          verified, with an evidence reference and a date
//   FAIL          tested and does not work
//   BLOCKED       cannot be tested until a named dependency clears
//   NOT_TESTED    testable, not yet witnessed
//   APPROVAL      work is done; a Chairman decision is the only thing left
//
// Evidence levels (a PASS says which layer it proved):
//   DB_RLS        SQL impersonation of the Chairman identity inside a read-only transaction
//   PRIOR_RECORD  a verified row already in the backend (dashboard_status / regression evidence)
//   STATIC        repo inspection
//   HTTP_BROWSER  an authenticated browser on the authoritative URL (the strongest)

export const STATES = Object.freeze(['PASS', 'FAIL', 'BLOCKED', 'NOT_TESTED', 'APPROVAL']);

export const CUT_ITEMS = Object.freeze([
  [1, 'authenticate'], [2, 'restore session'], [3, 'live read from authoritative backend'],
  [4, 'command/write'], [5, 'retrieve continuity boot'], [6, 'retrieve current task/state'],
  [7, 'Every-Word Coverage / Intent Ledger'], [8, 'all open lanes visible'], [9, 'blockers visible'],
  [10, 'next actions visible'], [11, 'store/sales status'], [12, 'department work status'],
  [13, 'evidence links'], [14, 'audit trail'], [15, 'no-regression check'],
]);

const READ = '2026-09-28 SQL impersonation (read-only txn, rolled back)';

// Every check maps to exactly one cut item. Evidence strings quote what was observed.
export const CHECKS = Object.freeze([
  { id: 'C01', item: 1, name: 'Password sign-in returns a session', state: 'PASS', level: 'PRIOR_RECORD',
    evidence: 'dashboard_status THY-DS-CHAIRMAN-AUTH OPERATIONAL/VERIFIED 2026-08-07' },
  { id: 'C02', item: 1, name: 'Chairman identity resolves (thylora_is_chairman() = true)', state: 'PASS', level: 'DB_RLS',
    evidence: `${READ}: is_chair=true; 1 chairman role row` },
  { id: 'C03', item: 1, name: 'Non-Chairman identity reads 0 rows from Chairman tables', state: 'PASS', level: 'DB_RLS',
    evidence: `${READ}: random uid → restart_records 0, departments 0, carryforward 0, dashboard_status 0, source_segments 0, orders 0` },
  { id: 'C04', item: 1, name: 'Anon role has no policy on Chairman tables', state: 'PASS', level: 'DB_RLS',
    evidence: 'pg_policies 2026-09-28: every Chairman-table policy is TO authenticated with thylora_is_chairman()' },
  { id: 'C05', item: 2, name: 'Expired access token is refreshed with refresh_token', state: 'FAIL', level: 'STATIC',
    evidence: 'dashboard-current-head.html R5 stores thy_refresh_token but never calls grant_type=refresh_token' },
  { id: 'C06', item: 2, name: 'Reload after sign-in restores the signed-in view on iPad', state: 'NOT_TESTED', level: 'HTTP_BROWSER',
    evidence: null, dependency: 'Chairman device witness on authoritative URL' },
  { id: 'C07', item: 3, name: 'Chairman reads live rows (restart_records 149, departments 67, dashboard_status 55)', state: 'PASS', level: 'DB_RLS',
    evidence: `${READ}: restart_records=149, departments=67, dashboard_status=55, ui_modules=76` },
  { id: 'C08', item: 3, name: 'Authenticated browser live read on the authoritative URL', state: 'NOT_TESTED', level: 'HTTP_BROWSER',
    evidence: null, dependency: 'THY-DS-FRONTEND gate AUTHENTICATED_LIVE_READ_AND_NO_REGRESSION_PREFLIGHT' },
  { id: 'C09', item: 4, name: 'chairman-command function deployed with JWT verification', state: 'PASS', level: 'PRIOR_RECORD',
    evidence: 'edge function chairman-command ACTIVE v17 verify_jwt=true (list_edge_functions 2026-09-28)' },
  { id: 'C10', item: 4, name: 'Commands produce a stored response', state: 'PASS', level: 'DB_RLS',
    evidence: 'thylora_chairman_commands: 114 rows, 83 COMPLETED, 31 ROUTED, last 10 all carry dashul_response' },
  { id: 'C11', item: 4, name: 'Fresh command → response → readback witnessed this cycle', state: 'NOT_TESTED', level: 'HTTP_BROWSER',
    evidence: null, dependency: 'Chairman JWT; last command 2026-09-05' },
  { id: 'C12', item: 4, name: '31 ROUTED commands reach a terminal state or show why not', state: 'NOT_TESTED', level: 'DB_RLS',
    evidence: null, dependency: 'router backlog review' },
  { id: 'C13', item: 5, name: 'Continuity boot readable by Chairman', state: 'PASS', level: 'DB_RLS',
    evidence: `${READ}: thylora_continuity_boot_registry=1 (THY-CONTINUITY-BOOT-002 v1 ACTIVE)` },
  { id: 'C14', item: 6, name: 'Current task/state (latest restart record) readable', state: 'PASS', level: 'DB_RLS',
    evidence: `${READ}: restart_records=149` },
  { id: 'C15', item: 7, name: 'Source atoms readable', state: 'PASS', level: 'DB_RLS',
    evidence: `${READ}: chairman_source_segments=597, thylora_query_carryforward=615` },
  { id: 'C16', item: 7, name: 'Every-Word coverage ledger readable', state: 'FAIL', level: 'DB_RLS',
    evidence: `${READ}: thylora_response_point_coverage returns 0 of ~728 rows — RLS on, 0 policies` },
  { id: 'C17', item: 8, name: 'Open lanes (workroom registry) readable', state: 'FAIL', level: 'DB_RLS',
    evidence: `${READ}: thylora_workroom_registry returns 0 of 30 rows — RLS on, 0 policies` },
  { id: 'C18', item: 8, name: 'Lane tasks readable', state: 'FAIL', level: 'DB_RLS',
    evidence: `${READ}: thylora_workroom_task_registry returns 0 of ~49 rows — RLS on, 0 policies` },
  { id: 'C19', item: 9, name: 'Blockers readable (dashboard_status.blocker)', state: 'PASS', level: 'DB_RLS',
    evidence: `${READ}: dashboard_status=55 rows incl. blocker column` },
  { id: 'C20', item: 10, name: 'Next actions readable (dashboard_status.next_action, restart_records.next_action)', state: 'PASS', level: 'DB_RLS',
    evidence: `${READ}: both tables readable` },
  { id: 'C21', item: 11, name: 'Products / orders / payments / entitlements readable', state: 'PASS', level: 'DB_RLS',
    evidence: `${READ}: products=28, orders=1, payments=1, entitlements=1` },
  { id: 'C22', item: 11, name: 'Store readiness readable', state: 'FAIL', level: 'DB_RLS',
    evidence: `${READ}: thylora_store_product_readiness returns 0 of 14 rows — RLS on, 0 policies` },
  { id: 'C23', item: 11, name: 'Real-money checkout witnessed', state: 'BLOCKED', level: 'PRIOR_RECORD',
    evidence: null, dependency: 'THY-DS-CURRENT-STORE-20260910: active_allowed=false, checkout witness=0' },
  { id: 'C24', item: 12, name: 'Departments + department conversations readable', state: 'PASS', level: 'DB_RLS',
    evidence: `${READ}: departments=67, thylora_department_conversations=33` },
  { id: 'C25', item: 13, name: 'Connection evidence readable', state: 'PASS', level: 'DB_RLS',
    evidence: `${READ}: connection_evidence=10` },
  { id: 'C26', item: 13, name: 'Regression evidence readable by Chairman', state: 'FAIL', level: 'DB_RLS',
    evidence: `${READ}: thylora_dashboard_regression_evidence returns 0 of 42 rows — RLS on, 0 policies` },
  { id: 'C27', item: 14, name: 'Audit trail readable', state: 'PASS', level: 'DB_RLS',
    evidence: `${READ}: audit_events=331 (latest 2026-09-24), audit_log=25` },
  { id: 'C28', item: 15, name: 'Build 8 static regression: no baseline capability removed', state: 'PASS', level: 'PRIOR_RECORD',
    evidence: 'thylora_dashboard_regression_evidence OPERATING-SURFACE-001 PASS 2026-09-17' },
  { id: 'C29', item: 15, name: 'Operating surface witnessed on authoritative production URL', state: 'BLOCKED', level: 'PRIOR_RECORD',
    evidence: null, dependency: 'merge to thylora-executive-dashboard + Vercel production promotion (alias stale)' },
  { id: 'C30', item: 15, name: 'API v1 contract frozen', state: 'APPROVAL', level: 'STATIC',
    evidence: null, dependency: 'Chairman approves api/thylora-api-v1.openapi.yaml' },
]);

export function isCounted(check) {
  return check.state === 'PASS' && typeof check.evidence === 'string' && check.evidence.length > 0;
}

export function summarize(checks = CHECKS) {
  const byState = Object.fromEntries(STATES.map((s) => [s, 0]));
  for (const c of checks) {
    if (!STATES.includes(c.state)) throw new Error(`UNKNOWN_STATE ${c.id} ${c.state}`);
    byState[c.state] += 1;
  }
  const passed = checks.filter(isCounted).length;
  const total = checks.length;
  const itemsFullyPassed = CUT_ITEMS.filter(([n]) => {
    const own = checks.filter((c) => c.item === n);
    return own.length > 0 && own.every(isCounted);
  }).map(([n]) => n);
  return {
    passed,
    total,
    percent: total === 0 ? 0 : Math.round((passed / total) * 1000) / 10,
    byState,
    itemsFullyPassed,
    itemsTotal: CUT_ITEMS.length,
    open: checks.filter((c) => !isCounted(c)).map((c) => ({ id: c.id, item: c.item, state: c.state, dependency: c.dependency || c.evidence })),
  };
}

// What the percentage becomes if a named set of checks turns PASS — used to rank the fastest path.
export function projectWith(ids, checks = CHECKS) {
  const set = new Set(ids);
  return summarize(checks.map((c) => (set.has(c.id) ? { ...c, state: 'PASS', evidence: c.evidence || `PROJECTED:${c.id}` } : c)));
}
