// SUPPLIER BRIDGE — qualification that cannot be passed on paperwork alone.
//
// A supplier holds "THYLORA-approved" only while every required gate for its class is PASS
// and in date. The designation is computed on read from the evidence; it is never a stored flag
// that could outlive the evidence.

export const GATES = Object.freeze([
  'DESK_REVIEW', 'IDENTITY', 'FACILITY', 'PROCESS', 'PROVENANCE', 'QUALITY_TEST', 'LABOR_SAFETY', 'INSPECTION',
]);

// Evidence kinds. "PAPER" is a document the supplier sends; the others are observed or third-party.
export const EVIDENCE_KIND = Object.freeze({
  PAPER: 'PAPER',                 // self-supplied document, certificate copy, questionnaire
  REGISTRY_CHECK: 'REGISTRY_CHECK', // THYLORA looked it up in an official register
  OBSERVED_REMOTE: 'OBSERVED_REMOTE', // live video walk-through run by THYLORA, not pre-recorded
  OBSERVED_ONSITE: 'OBSERVED_ONSITE',
  LAB_REPORT: 'LAB_REPORT',       // accredited lab, sample chosen by THYLORA
  TEST_ORDER: 'TEST_ORDER',       // THYLORA bought and checked real units
});

// Per class: which gates apply, which evidence kinds may satisfy each, and re-check interval (days).
// quality testing "where applicable": apparel uses TEST_ORDER; food/herbs require LAB_REPORT.
export const CLASSES = Object.freeze({
  HERBS: {
    recheck_days: 180,
    gates: {
      DESK_REVIEW: ['PAPER', 'REGISTRY_CHECK'], IDENTITY: ['REGISTRY_CHECK'], FACILITY: ['OBSERVED_REMOTE', 'OBSERVED_ONSITE'],
      PROCESS: ['OBSERVED_REMOTE', 'OBSERVED_ONSITE'], PROVENANCE: ['REGISTRY_CHECK', 'OBSERVED_ONSITE', 'LAB_REPORT'],
      QUALITY_TEST: ['LAB_REPORT'], LABOR_SAFETY: ['OBSERVED_REMOTE', 'OBSERVED_ONSITE'], INSPECTION: ['OBSERVED_ONSITE', 'OBSERVED_REMOTE'],
    },
  },
  FOOD_SNACKS: {
    recheck_days: 180,
    gates: {
      DESK_REVIEW: ['PAPER', 'REGISTRY_CHECK'], IDENTITY: ['REGISTRY_CHECK'], FACILITY: ['OBSERVED_ONSITE', 'OBSERVED_REMOTE'],
      PROCESS: ['OBSERVED_ONSITE', 'OBSERVED_REMOTE'], PROVENANCE: ['REGISTRY_CHECK', 'OBSERVED_ONSITE', 'LAB_REPORT'],
      QUALITY_TEST: ['LAB_REPORT'], LABOR_SAFETY: ['OBSERVED_ONSITE', 'OBSERVED_REMOTE'], INSPECTION: ['OBSERVED_ONSITE'],
    },
  },
  LOCAL_FARM: {
    recheck_days: 365,
    gates: {
      DESK_REVIEW: ['PAPER', 'REGISTRY_CHECK'], IDENTITY: ['REGISTRY_CHECK'], FACILITY: ['OBSERVED_ONSITE', 'OBSERVED_REMOTE'],
      PROCESS: ['OBSERVED_ONSITE', 'OBSERVED_REMOTE'], PROVENANCE: ['OBSERVED_ONSITE', 'REGISTRY_CHECK'],
      QUALITY_TEST: ['LAB_REPORT', 'TEST_ORDER'], LABOR_SAFETY: ['OBSERVED_ONSITE', 'OBSERVED_REMOTE'], INSPECTION: ['OBSERVED_ONSITE'],
    },
  },
  APPAREL: {
    recheck_days: 365,
    gates: {
      DESK_REVIEW: ['PAPER', 'REGISTRY_CHECK'], IDENTITY: ['REGISTRY_CHECK'], FACILITY: ['OBSERVED_REMOTE', 'OBSERVED_ONSITE'],
      PROCESS: ['OBSERVED_REMOTE', 'OBSERVED_ONSITE'], PROVENANCE: ['REGISTRY_CHECK', 'OBSERVED_REMOTE', 'LAB_REPORT'],
      QUALITY_TEST: ['TEST_ORDER', 'LAB_REPORT'], LABOR_SAFETY: ['OBSERVED_REMOTE', 'OBSERVED_ONSITE'], INSPECTION: ['OBSERVED_REMOTE', 'OBSERVED_ONSITE'],
    },
  },
  MAKER: {
    recheck_days: 365,
    gates: {
      DESK_REVIEW: ['PAPER', 'REGISTRY_CHECK'], IDENTITY: ['REGISTRY_CHECK'], FACILITY: ['OBSERVED_REMOTE', 'OBSERVED_ONSITE'],
      PROCESS: ['OBSERVED_REMOTE', 'OBSERVED_ONSITE'], PROVENANCE: ['OBSERVED_REMOTE', 'REGISTRY_CHECK'],
      QUALITY_TEST: ['TEST_ORDER'], LABOR_SAFETY: ['OBSERVED_REMOTE', 'OBSERVED_ONSITE'], INSPECTION: ['OBSERVED_REMOTE', 'OBSERVED_ONSITE'],
    },
  },
  SMALL_MANUFACTURER: {
    recheck_days: 270,
    gates: {
      DESK_REVIEW: ['PAPER', 'REGISTRY_CHECK'], IDENTITY: ['REGISTRY_CHECK'], FACILITY: ['OBSERVED_ONSITE', 'OBSERVED_REMOTE'],
      PROCESS: ['OBSERVED_ONSITE', 'OBSERVED_REMOTE'], PROVENANCE: ['REGISTRY_CHECK', 'OBSERVED_ONSITE'],
      QUALITY_TEST: ['TEST_ORDER', 'LAB_REPORT'], LABOR_SAFETY: ['OBSERVED_ONSITE', 'OBSERVED_REMOTE'], INSPECTION: ['OBSERVED_ONSITE'],
    },
  },
});

const DAY = 86400000;
const toMs = (d) => (d instanceof Date ? d.getTime() : Date.parse(d));

// supplier = { class, evidence: [{ gate, kind, result:'PASS'|'FAIL', at, ref }], incidents: [...], revoked }
export function evaluate(supplier, asOf) {
  const cls = CLASSES[supplier.class];
  if (!cls) throw new Error(`UNKNOWN_CLASS:${supplier.class}`);
  const now = toMs(asOf);
  const gates = {};
  for (const g of GATES) {
    const allowed = cls.gates[g];
    const rows = (supplier.evidence || []).filter((e) => e.gate === g).sort((a, b) => toMs(b.at) - toMs(a.at));
    const latest = rows[0];
    let state; let reason = null;
    if (!latest) { state = 'MISSING'; reason = 'no evidence'; }
    else if (latest.result !== 'PASS') { state = 'FAIL'; reason = `latest result ${latest.result}`; }
    else if (!allowed.includes(latest.kind)) { state = 'INSUFFICIENT'; reason = `${latest.kind} cannot satisfy ${g}; needs one of ${allowed.join('/')}`; }
    else if (now - toMs(latest.at) > cls.recheck_days * DAY) { state = 'EXPIRED'; reason = `older than ${cls.recheck_days} days`; }
    else state = 'PASS';
    gates[g] = { state, reason, ref: latest?.ref ?? null, at: latest?.at ?? null };
  }
  const openIncidents = (supplier.incidents || []).filter((i) => !i.closed_at);
  const severe = openIncidents.filter((i) => i.severity === 'SEVERE');
  const allPass = GATES.every((g) => gates[g].state === 'PASS');
  const paperOnly = (supplier.evidence || []).length > 0 && (supplier.evidence || []).every((e) => e.kind === 'PAPER');

  let designation;
  if (supplier.revoked) designation = 'REVOKED';
  else if (severe.length) designation = 'SUSPENDED';
  else if (allPass && openIncidents.length === 0) designation = 'THYLORA_APPROVED';
  else if (allPass) designation = 'APPROVED_UNDER_WATCH';
  else designation = 'NOT_APPROVED';

  const expiries = GATES.map((g) => gates[g].at && toMs(gates[g].at) + cls.recheck_days * DAY).filter(Boolean);
  const next_recheck = expiries.length ? new Date(Math.min(...expiries)).toISOString().slice(0, 10) : null;

  return {
    designation,
    may_display_badge: designation === 'THYLORA_APPROVED' || designation === 'APPROVED_UNDER_WATCH',
    may_receive_orders: designation === 'THYLORA_APPROVED' || designation === 'APPROVED_UNDER_WATCH',
    paper_only: paperOnly,
    gates,
    open_gates: GATES.filter((g) => gates[g].state !== 'PASS'),
    open_incidents: openIncidents.length,
    next_recheck,
  };
}

// Incident reporting. SEVERE (e.g. contamination, unsafe labor, falsified evidence) suspends at once.
export function reportIncident(supplier, { id, at, severity, summary, reported_by }) {
  if (!['MINOR', 'MAJOR', 'SEVERE'].includes(severity)) throw new Error('BAD_SEVERITY');
  return { ...supplier, incidents: [...(supplier.incidents || []), { id, at, severity, summary, reported_by, closed_at: null }] };
}

// Revocation is terminal for the designation; history is kept, nothing is deleted.
export function revoke(supplier, { at, reason, decided_by }) {
  if (!reason || !decided_by) throw new Error('REVOCATION_NEEDS_REASON_AND_DECIDER');
  return { ...supplier, revoked: { at, reason, decided_by } };
}
