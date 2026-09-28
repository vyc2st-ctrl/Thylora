// THYLORA LIBRARY · EARTH HELP DESK · case-intake engine
// Workroom: WR-PROD-FLOOR-001 · Lane G
// World origin: THY-DEPT-QUESTION-NAV-001 method, carried by Naya Aven
// (Director of Access and Follow-Through, THY-WORLD-DOUBT-REMOVER-607).
//
// What this module is:
//   navigation + evidence + questions + referrals + records.
// What this module is NOT:
//   a lawyer, a court, a housing inspector, a utility, an accountant.
//   It never decides who owes what. It produces the questions to ask, the
//   clause to read, the evidence to gather and the offices to contact.
//
// Money is integer minor units (cents). Water volume is integer gallons
// internally; litres are shown beside it. There is no floating-point money.
// Jurisdiction-specific law is NOT hard-coded. Resources come from a pluggable
// map; when a jurisdiction is absent the router returns "look up your local X".

export const GAL_TO_L = 3.785411784;          // exact by definition (US liquid gallon)
export const CCF_TO_GAL = 748.052;            // 100 ft³ × 7.48052 gal/ft³ (rounded constant)
export const MINUTES_PER_DAY = 1440;
const DAY_MS = 86400000;

export const DISCLAIMER = [
  'THYLORA is not a law firm and does not give legal, medical, tax or accounting advice.',
  'Nothing in this packet decides responsibility, fault or who owes money; only the people involved, an agreement, an agency, or a court can do that.',
  'Every resource entry marked VERIFY_LOCALLY must be confirmed with the office itself before you rely on it.',
  'Numbers marked EMPIRICAL MODEL are estimates built on the assumptions listed beside them.',
  'For advice about your rights, contact a licensed attorney or a legal-aid organization in your area.'
].join(' ');

// ─────────────────────────────────────────────────────────────────────────────
// Help categories (the directive's full list). Each carries intake fields,
// evidence types, referral classes and what is out of scope.
// ─────────────────────────────────────────────────────────────────────────────
export const HELP_CATEGORIES = Object.freeze({
  VERIFIED_INFORMATION: { label: 'Verified information' },
  LEGAL_RESOURCE_NAVIGATION: { label: 'Legal / resource navigation' },
  BILLING_DISPUTE: { label: 'Billing disputes' },
  LANDLORD_TENANT: { label: 'Landlord / tenant resource navigation' },
  SCHOOL_HELP: { label: 'School help' },
  FAMILY_HELP: { label: 'Family help' },
  BENEFITS_RESOURCES: { label: 'Benefits / resources' },
  BUSINESS_PROBLEM_SOLVING: { label: 'Business problem solving' },
  HISTORICAL_RESEARCH: { label: 'Historical research' },
  PRODUCT_SERVICE_COMPARISON: { label: 'Product / service comparison' },
  INSTITUTIONAL_GAP_REPORT: { label: 'Institutional gap reports' }
});

// ─────────────────────────────────────────────────────────────────────────────
// Resource map. PLUGGABLE. The one entry shipped here is an EXAMPLE and is not
// a real place. Every entry is VERIFY_LOCALLY until a person confirms it.
// ─────────────────────────────────────────────────────────────────────────────
export const RESOURCE_CLASSES = Object.freeze({
  LANDLORD_NOTICE: 'the address your lease names for notices to the landlord or property manager',
  UTILITY_DISPUTE: 'water utility billing-dispute or leak-adjustment desk',
  HOUSING_CODE: 'housing code enforcement / rental inspection office',
  TENANT_RESOURCE: 'tenant resource center or tenant union',
  LEGAL_AID: 'legal aid organization or lawyer referral service',
  SMALL_CLAIMS: 'small claims court self-help center'
});

export const EXAMPLE_RESOURCE_MAP = Object.freeze({
  'EXAMPLE-US-CITY': Object.freeze({
    label: 'EXAMPLE ENTRY — not a real jurisdiction; shows the shape of a record',
    verification: 'VERIFY_LOCALLY',
    resources: Object.freeze({
      UTILITY_DISPUTE: { name: 'Example City Water Utility — Customer Billing Disputes', contact: 'VERIFY_LOCALLY', verification: 'VERIFY_LOCALLY',
        note: 'Ask whether a leak adjustment exists, what proof of repair it requires, and the filing deadline.' },
      HOUSING_CODE: { name: 'Example City Housing Code Enforcement', contact: 'VERIFY_LOCALLY', verification: 'VERIFY_LOCALLY',
        note: 'Ask how to request an inspection for a plumbing defect and whether the tenant may be present.' },
      TENANT_RESOURCE: { name: 'Example County Tenant Resource Center', contact: 'VERIFY_LOCALLY', verification: 'VERIFY_LOCALLY',
        note: 'Ask which notice and repair procedures apply to your tenancy type.' },
      LEGAL_AID: { name: 'Example Legal Aid Society — Housing Unit', contact: 'VERIFY_LOCALLY', verification: 'VERIFY_LOCALLY',
        note: 'Ask about income eligibility and whether they review utility-cost disputes.' },
      SMALL_CLAIMS: { name: 'Example County Small Claims Self-Help Center', contact: 'VERIFY_LOCALLY', verification: 'VERIFY_LOCALLY',
        note: 'Information only: filing limits, fees, deadlines and what evidence the court accepts.' }
    })
  })
});

// ─────────────────────────────────────────────────────────────────────────────
// Guard: no legal conclusion is ever authored by THYLORA.
// User-supplied text is rendered inside “curly quotes” or as a "> " blockquote
// and is excluded from the scan, because quoting a lease is not concluding.
// ─────────────────────────────────────────────────────────────────────────────
const CONCLUSION_PATTERNS = [
  /\b(landlord|tenant|owner|utility|you|they|he|she|management)\s+(is|are|was|were)\s+(legally\s+)?(liable|responsible|at fault|negligent|in breach)\b/i,
  /\b(is|are)\s+liable\b/i,
  /\bowes?\s+you\b/i,
  /\byou\s+(will|would)\s+win\b/i,
  /\byou\s+have\s+a\s+(strong\s+|winning\s+)?case\b/i,
  /\byou\s+are\s+(legally\s+)?entitled\s+to\b/i,
  /\b(broke|violated|violates|breached)\s+the\s+(law|lease|code)\b/i,
  /\bthis\s+is\s+(illegal|unlawful)\b/i,
  /\bguaranteed?\s+(refund|outcome|win)\b/i
];

export function stripQuotedUserText(text) {
  return String(text)
    .split('\n')
    .filter(line => !line.trimStart().startsWith('>'))
    .join('\n')
    .replace(/“[^”]*”/g, '“…”');
}

export function findLegalConclusions(text) {
  const authored = stripQuotedUserText(text);
  const hits = [];
  for (const re of CONCLUSION_PATTERNS) {
    const m = authored.match(re);
    if (m) hits.push(m[0]);
  }
  return hits;
}

// ─────────────────────────────────────────────────────────────────────────────
// Small helpers
// ─────────────────────────────────────────────────────────────────────────────
function isDate(s) {
  return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s + 'T00:00:00Z'));
}
function dayNumber(s) { return Math.round(Date.parse(s + 'T00:00:00Z') / DAY_MS); }

/** Inclusive day count of a billing period. 2026-03-05 → 2026-04-03 = 30 days. */
export function periodDays(start, end) {
  if (!isDate(start) || !isDate(end)) return null;
  const d = dayNumber(end) - dayNumber(start) + 1;
  return d > 0 ? d : null;
}

/** Round half away from zero to an integer. */
function roundHalfUp(x) { return Math.sign(x) * Math.round(Math.abs(x)); }

export function toGallons(usage, unit = 'GAL') {
  const u = String(unit).toUpperCase();
  if (u === 'GAL') return roundHalfUp(Number(usage));
  if (u === 'CCF' || u === 'HCF') return roundHalfUp(Number(usage) * CCF_TO_GAL);
  if (u === 'L') return roundHalfUp(Number(usage) / GAL_TO_L);
  throw new RangeError(`unknown usage unit ${unit}`);
}
export function gallonsToLitres(gal) { return roundHalfUp(gal * GAL_TO_L); }

export function formatCents(cents) {
  const sign = cents < 0 ? '-' : '';
  const abs = Math.abs(cents);
  const dollars = Math.floor(abs / 100).toLocaleString('en-US');
  return `${sign}$${dollars}.${String(abs % 100).padStart(2, '0')}`;
}
function fmtInt(n) { return Number(n).toLocaleString('en-US'); }

/** Redact an account number to its last 4 characters: "****3377". */
export function redactAccount(acct) {
  if (acct == null) return null;
  const s = String(acct).replace(/\s+/g, '');
  if (s.length <= 4) return '****';
  return '****' + s.slice(-4);
}

/** Remove a known account number and any run of 8+ digits from free text. */
export function scrubText(text, accountNumber) {
  let out = String(text ?? '');
  if (accountNumber) {
    const raw = String(accountNumber);
    out = out.split(raw).join(redactAccount(raw));
    const digits = raw.replace(/\D/g, '');
    if (digits.length >= 5) out = out.split(digits).join(redactAccount(digits));
  }
  return out.replace(/\d{8,}/g, m => '****' + m.slice(-4));
}

function quoteUser(text) { return `“${String(text ?? '').replace(/[“”]/g, '"')}”`; }
function cell(text) { return String(text ?? '').replace(/\|/g, '\\|').replace(/\n+/g, ' '); }

// ─────────────────────────────────────────────────────────────────────────────
// 1 · Intake schema
// ─────────────────────────────────────────────────────────────────────────────
export const INTAKE_SCHEMA = Object.freeze({
  case_type: 'string · BILLING_DISPUTE | LANDLORD_TENANT | …',
  consent: '{ recorded: boolean, scope: string[], retention_days: integer, contact_third_parties: boolean }',
  jurisdiction: '{ key?: string, city?: string, county?: string, state_or_region?: string, country?: string }',
  utility_account: '{ holder: TENANT | LANDLORD | OTHER, account_number: string, utility_name: string }',
  tenancy: '{ role: TENANT | OWNER | OTHER, lease_on_file: boolean, lease_clause: { section, text } }',
  timeline: '[{ date: YYYY-MM-DD, event: string, source?: string }]',
  bills: '[{ id, period_start, period_end, usage, unit: GAL|CCF|L, amount_cents, disputed: boolean }]',
  rate: '{ marginal_cents_per_kgal: integer, fixed_cents_per_period?: integer, source: string }',
  photos: '[{ id, capture_date: YYYY-MM-DD, subject: string, file_ref?: string }]',
  communications: '[{ date, party: LANDLORD | UTILITY | AGENCY | OTHER, channel: LETTER | EMAIL | TEXT | PORTAL | PHONE | IN_PERSON, direction: SENT | RECEIVED, summary }]',
  repair_evidence: '[{ date, kind: INVOICE | WORK_ORDER | PHOTO | STATEMENT, summary }]',
  leak: '{ fixture: string, gallons_per_minute?: number, gallons_per_day?: number, basis: string }'
});

const WRITTEN_CHANNELS = new Set(['LETTER', 'EMAIL', 'PORTAL']);

// ─────────────────────────────────────────────────────────────────────────────
// 2 · Validator — reports EVERY gap at once.
// ─────────────────────────────────────────────────────────────────────────────
export function validateIntake(intake = {}) {
  const gaps = [];
  const add = (code, severity, field, reason, route) => gaps.push({ code, severity, field, reason, route });

  if (!intake.consent || intake.consent.recorded !== true) {
    add('CONSENT_MISSING', 'BLOCKING', 'consent',
      'We have not recorded your permission to hold these records, so nothing can be stored yet.',
      'Read the consent screen, choose what may be stored and for how long, then confirm.');
  }

  const j = intake.jurisdiction || {};
  if (!j.key && !j.city && !j.county && !j.state_or_region) {
    add('JURISDICTION_MISSING', 'IMPORTANT', 'jurisdiction',
      'Utility rules, housing codes and tenant resources depend on where the home is. Without a place we can only give lookup questions.',
      'Add the city or county and state/region of the property (not your mailing address if different).');
  }

  const acct = intake.utility_account || {};
  if (!acct.holder) {
    add('ACCOUNT_HOLDER_MISSING', 'IMPORTANT', 'utility_account.holder',
      'Whose name the water account is in decides who the utility will talk to about a dispute.',
      'Look at the name printed on the water bill, or ask the utility who the account holder is.');
  }
  if (!acct.utility_name) {
    add('UTILITY_NAME_MISSING', 'HELPFUL', 'utility_account.utility_name',
      'We need the utility name to find its dispute and leak-adjustment process.',
      'Copy the utility name from the top of any water bill.');
  }

  const timeline = Array.isArray(intake.timeline) ? intake.timeline : [];
  if (timeline.length === 0) {
    add('TIMELINE_EMPTY', 'BLOCKING', 'timeline',
      'A dated sequence of what happened is the spine of every packet.',
      'List each thing that happened with its date: first noticed, first reported, visits, bills received.');
  }
  timeline.forEach((e, i) => {
    if (!isDate(e.date)) add('TIMELINE_EVENT_DATE_MISSING', 'IMPORTANT', `timeline[${i}].date`,
      `The event ${quoteUser(e.event || '(unnamed)')} has no usable date (YYYY-MM-DD).`,
      'Check your texts, emails, call log or calendar for the date; an approximate date marked "about" is better than none.');
  });

  const bills = Array.isArray(intake.bills) ? intake.bills : [];
  const prior = bills.filter(b => !b.disputed);
  const disputed = bills.filter(b => b.disputed);
  if (bills.length === 0) {
    add('BILLS_NONE', 'BLOCKING', 'bills',
      'Without bills there is no usage or cost to compare.',
      'Gather the disputed bill(s) and at least three earlier bills (paper, PDF or the utility account portal).');
  } else {
    if (prior.length === 0) add('BILLS_NO_BASELINE', 'BLOCKING', 'bills',
      'We need at least one normal (undisputed) earlier bill to know what usage looked like before the problem.',
      'Download earlier bills from the utility portal or request a usage history printout.');
    else if (prior.length < 3) add('BASELINE_THIN', 'HELPFUL', 'bills',
      `Only ${prior.length} earlier bill(s) supplied; three or more make the normal-usage baseline more reliable.`,
      'Request a 12-month usage history from the utility.');
    if (disputed.length === 0) add('BILLS_NO_DISPUTED', 'BLOCKING', 'bills',
      'No bill is marked as the one being questioned.',
      'Mark the bill(s) you believe are too high.');
  }
  bills.forEach((b, i) => {
    const label = b.id || `bill ${i + 1}`;
    if (!periodDays(b.period_start, b.period_end)) add('BILL_PERIOD_MISSING', 'IMPORTANT', `bills[${i}].period`,
      `${label}: the service period (start and end date) is missing or unreadable, so usage per day cannot be computed.`,
      'The service period is printed on the bill, usually near the meter readings.');
    if (b.usage == null || !(Number(b.usage) >= 0)) add('BILL_USAGE_MISSING', 'IMPORTANT', `bills[${i}].usage`,
      `${label}: metered usage is missing.`,
      'Copy the usage and its unit (gallons, CCF/HCF, or litres) from the bill.');
    if (!Number.isInteger(b.amount_cents)) add('BILL_AMOUNT_MISSING', 'HELPFUL', `bills[${i}].amount_cents`,
      `${label}: the amount billed is missing.`,
      'Copy the water/sewer charge total from the bill.');
  });

  const rate = intake.rate || {};
  if (!Number.isInteger(rate.marginal_cents_per_kgal) || rate.marginal_cents_per_kgal <= 0) {
    add('RATE_MISSING', 'IMPORTANT', 'rate.marginal_cents_per_kgal',
      'To turn extra gallons into extra dollars we need the price of one more unit of water (and sewer, if billed by usage).',
      'Find the usage rate on the bill or the utility rate schedule; if tiered, use the top tier you reached.');
  }

  const photos = Array.isArray(intake.photos) ? intake.photos : [];
  if (photos.length === 0) add('PHOTOS_NONE', 'IMPORTANT', 'photos',
    'Photos or video of the fixture and the meter show the condition at a point in time.',
    'Photograph the fixture (e.g. inside the toilet tank), any water damage, and the meter dial; a 15-second video of a running fixture helps.');
  photos.forEach((p, i) => {
    if (!isDate(p.capture_date)) add('PHOTO_CAPTURE_DATE_MISSING', 'IMPORTANT', `photos[${i}].capture_date`,
      `Photo ${p.id || i + 1} has no capture date, so it cannot be placed on the timeline.`,
      'The capture date is in the photo details on your phone; write it down, do not edit the photo.');
  });

  const comms = Array.isArray(intake.communications) ? intake.communications : [];
  if (comms.length === 0) add('COMMS_NONE', 'IMPORTANT', 'communications',
    'No communications recorded. Most processes ask whether and when the problem was reported.',
    'List every call, text, email, letter or portal request, with date, who, how, and what was said.');
  comms.forEach((c, i) => {
    const missing = ['date', 'party', 'channel', 'summary'].filter(k => k === 'date' ? !isDate(c.date) : !c[k]);
    if (missing.length) add('COMM_FIELD_MISSING', 'HELPFUL', `communications[${i}]`,
      `Communication ${i + 1} is missing: ${missing.join(', ')}.`,
      'Fill in date, party, channel and a one-line summary.');
  });
  const writtenToLandlord = comms.some(c => c.party === 'LANDLORD' && c.direction !== 'RECEIVED' && WRITTEN_CHANNELS.has(c.channel));
  if (intake.tenancy?.role === 'TENANT' && !writtenToLandlord) {
    add('COMMS_NO_WRITTEN_NOTICE', 'IMPORTANT', 'communications',
      'No written notice to the landlord is recorded. Many repair and inspection processes ask for a dated written request.',
      'Send a short dated written notice (letter, email, or portal request) describing the defect and keep a copy.');
  }

  const t = intake.tenancy || {};
  if (t.role === 'TENANT' && !(t.lease_clause && t.lease_clause.text)) {
    add('LEASE_CLAUSE_MISSING', 'IMPORTANT', 'tenancy.lease_clause',
      'The lease section on repairs, plumbing, and utilities is what the parties agreed; we need its exact words, not a summary.',
      'Find the sections titled repairs, maintenance, utilities, or plumbing in your lease and copy them word for word.');
  }

  const repair = Array.isArray(intake.repair_evidence) ? intake.repair_evidence : [];
  if (repair.length === 0) add('REPAIR_EVIDENCE_MISSING', 'IMPORTANT', 'repair_evidence',
    'Leak-adjustment programs commonly ask for proof the leak was fixed (invoice, work order, dated photo).',
    'Ask whoever repairs it for a dated invoice or work order naming the fixture; photograph the repaired part with the date.');

  const leak = intake.leak || {};
  if (!leak.fixture) add('LEAK_SOURCE_UNKNOWN', 'HELPFUL', 'leak.fixture',
    'We do not yet know which fixture is suspected.',
    'Do a meter test: with all water off, watch the meter for 15 minutes; add food colouring to the toilet tank and see if it reaches the bowl without flushing.');

  const order = { BLOCKING: 0, IMPORTANT: 1, HELPFUL: 2 };
  gaps.sort((a, b) => order[a.severity] - order[b.severity]);
  const counts = { BLOCKING: 0, IMPORTANT: 0, HELPFUL: 0 };
  for (const g of gaps) counts[g.severity] += 1;
  return { complete: counts.BLOCKING === 0 && counts.IMPORTANT === 0, can_build_packet: counts.BLOCKING === 0, gaps, counts };
}

// ─────────────────────────────────────────────────────────────────────────────
// 3 · Usage anomaly calculator — EMPIRICAL MODEL
//
//   r_base  = Σ U_p / Σ D_p                 (gal/day; p over undisputed bills)
//   E_d     = round(r_base × D_d)           (gal; expected usage in disputed period d)
//   X_d     = max(0, U_d − E_d)             (gal; excess volume)
//   C_d     = round(X_d × m / 1000)         (cents; m = marginal cents per 1,000 gal)
// ─────────────────────────────────────────────────────────────────────────────
export function computeUsageAnomaly(bills = [], rate = {}) {
  const norm = bills.map(b => ({
    id: b.id,
    period_start: b.period_start,
    period_end: b.period_end,
    days: periodDays(b.period_start, b.period_end),
    gallons: b.usage == null ? null : toGallons(b.usage, b.unit || 'GAL'),
    amount_cents: Number.isInteger(b.amount_cents) ? b.amount_cents : null,
    disputed: !!b.disputed
  }));
  const prior = norm.filter(b => !b.disputed && b.days && b.gallons != null);
  const sumU = prior.reduce((s, b) => s + b.gallons, 0);
  const sumD = prior.reduce((s, b) => s + b.days, 0);
  const m = Number.isInteger(rate.marginal_cents_per_kgal) ? rate.marginal_cents_per_kgal : null;
  const fixed = Number.isInteger(rate.fixed_cents_per_period) ? rate.fixed_cents_per_period : null;

  if (sumD === 0) {
    return { model: 'EMPIRICAL MODEL', ok: false, reason: 'NO_BASELINE', rows: [], totals: null };
  }
  const baselineGpd = sumU / sumD;

  const rows = norm.map(b => {
    const row = { ...b, expected_gallons: null, excess_gallons: null, excess_cost_cents: null,
                  excess_litres: null, reconstructed_amount_cents: null, bill_math_check: 'NOT_CHECKED' };
    if (b.days && b.gallons != null) {
      row.expected_gallons = roundHalfUp(baselineGpd * b.days);
      row.excess_gallons = b.disputed ? Math.max(0, b.gallons - row.expected_gallons) : 0;
      row.excess_litres = gallonsToLitres(row.excess_gallons);
      if (m != null) row.excess_cost_cents = roundHalfUp(row.excess_gallons * m / 1000);
      if (m != null && fixed != null && b.amount_cents != null) {
        row.reconstructed_amount_cents = fixed + roundHalfUp(b.gallons * m / 1000);
        row.bill_math_check = row.reconstructed_amount_cents === b.amount_cents ? 'MATCH' : 'MISMATCH_ASK_UTILITY';
      }
    }
    return row;
  });

  const d = rows.filter(r => r.disputed && r.excess_gallons != null);
  const totals = {
    disputed_periods: d.length,
    disputed_billed_cents: d.every(r => r.amount_cents != null) ? d.reduce((s, r) => s + r.amount_cents, 0) : null,
    excess_gallons: d.reduce((s, r) => s + r.excess_gallons, 0),
    excess_litres: gallonsToLitres(d.reduce((s, r) => s + r.excess_gallons, 0)),
    excess_cost_cents: m == null ? null : d.reduce((s, r) => s + r.excess_cost_cents, 0)
  };
  if (fixed != null && m != null && totals.disputed_billed_cents != null) {
    totals.baseline_equivalent_cents = d.reduce((s, r) => s + fixed + roundHalfUp(r.expected_gallons * m / 1000), 0);
    totals.reconciliation_gap_cents = totals.disputed_billed_cents - totals.baseline_equivalent_cents - totals.excess_cost_cents;
  }
  return {
    model: 'EMPIRICAL MODEL',
    ok: true,
    baseline: { bills_used: prior.length, gallons: sumU, days: sumD, gallons_per_day: baselineGpd },
    marginal_cents_per_kgal: m,
    fixed_cents_per_period: fixed,
    rows,
    totals,
    assumptions: [
      'Normal household use during the disputed period equals the average daily use of the undisputed bills.',
      'Every extra gallon is priced at the single marginal rate given (tiered or seasonal rates may differ).',
      'Meter readings are actual, not estimated; an estimated read must be flagged and asked about.',
      'No occupancy change (guests, new household member, new appliance) happened in the disputed period.'
    ],
    failure_conditions: [
      'Fewer than one undisputed bill → no baseline (NO_BASELINE).',
      'Occupancy or season changed → baseline no longer comparable.',
      'Tiered pricing → excess cost understated or overstated; use the utility rate schedule.',
      'bill_math_check = MISMATCH_ASK_UTILITY → taxes, surcharges, tiers or an estimated read are present; ask the utility.'
    ]
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 4 · Continuous-leak estimate — EMPIRICAL MODEL
//
//   q_day  = q_min × 1440                    (gal/day from gal/min)
//   V(D)   = q_day × D                       (gal over D days)
//   C(D)   = round(V(D) × m / 1000)          (cents)
// ─────────────────────────────────────────────────────────────────────────────
export function estimateContinuousLeak({ gallons_per_minute, gallons_per_day, days = 30, marginal_cents_per_kgal, fixture = 'fixture' } = {}) {
  let qDay;
  if (Number.isFinite(gallons_per_day)) qDay = gallons_per_day;
  else if (Number.isFinite(gallons_per_minute)) qDay = Math.round(gallons_per_minute * MINUTES_PER_DAY * 100) / 100;
  else return { model: 'EMPIRICAL MODEL', ok: false, reason: 'NO_FLOW_RATE' };
  const volume = roundHalfUp(qDay * days);
  const m = Number.isInteger(marginal_cents_per_kgal) ? marginal_cents_per_kgal : null;
  return {
    model: 'EMPIRICAL MODEL',
    ok: true,
    fixture,
    gallons_per_day: qDay,
    litres_per_day: Math.round(qDay * GAL_TO_L * 10) / 10,
    days,
    gallons: volume,
    litres: gallonsToLitres(volume),
    cost_cents_per_day: m == null ? null : Math.round(qDay * m / 1000 * 100) / 100,
    cost_cents: m == null ? null : roundHalfUp(volume * m / 1000),
    assumptions: [
      'Flow is continuous and constant (a flapper that seeps all day, not an intermittent refill).',
      'The flow rate comes from a meter test or a measured fill, not a guess; a guessed rate is labelled HEURISTIC.',
      'No other leak is present.'
    ],
    failure_conditions: [
      'Intermittent leaks (phantom refills every few minutes) run less than 1,440 min/day → estimate too high.',
      'Worsening leak (flapper degrading) → early periods over-estimated, later periods under-estimated.'
    ]
  };
}

/** Compare a leak model to the anomaly rows: how much of each excess the model explains. */
export function compareLeakToAnomaly(anomaly, leak) {
  if (!anomaly?.ok || !leak?.ok) return [];
  return anomaly.rows.filter(r => r.disputed && r.days).map(r => {
    const modelled = roundHalfUp(leak.gallons_per_day * r.days);
    return {
      id: r.id,
      days: r.days,
      observed_excess_gallons: r.excess_gallons,
      modelled_leak_gallons: modelled,
      residual_gallons: r.excess_gallons - modelled,
      explained_bp: r.excess_gallons > 0 ? Math.round(Math.min(modelled, r.excess_gallons) * 10000 / r.excess_gallons) : null
    };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 5 · Responsibility router — produces questions and the clause to read.
//     It NEVER decides. decision is always NOT_DECIDED_BY_SOFTWARE.
// ─────────────────────────────────────────────────────────────────────────────
export function routeResponsibility(intake = {}) {
  const t = intake.tenancy || {};
  const acct = intake.utility_account || {};
  const clause = t.lease_clause && t.lease_clause.text
    ? { status: 'SUPPLIED', section: t.lease_clause.section || 'section not given', text: t.lease_clause.text }
    : { status: 'NOT_SUPPLIED', section: null, text: null,
        look_for: ['Repairs / Maintenance', 'Plumbing / Fixtures', 'Utilities / Water and Sewer', 'Notice to Landlord', 'Tenant Damage'] };

  const questions = [
    'Which party does the lease say arranges repairs to plumbing fixtures, and within what time after notice?',
    'Does the lease say who pays the water and sewer bill, and does it say anything about charges caused by a fixture defect?',
    'On what date was the landlord or manager first told, and in what form (spoken, text, written)?',
    'Did anyone cause the defect by misuse, or did the part wear out? Is there evidence either way (repair invoice wording, plumber statement)?',
    'Does the local housing code set a repair standard or deadline for plumbing in rental housing? (Ask the housing code office.)',
    'Does the utility offer a leak adjustment, who may apply (account holder only?), and what proof of repair does it require?',
    'If the account holder and the person who controls repairs are different people, how does the lease allocate the cost of water lost to a defect?'
  ];
  if (acct.holder === 'LANDLORD') questions.push('Is water billed back to you through rent or a separate charge? Ask for the utility bill copy behind that charge.');
  if (!intake.jurisdiction || (!intake.jurisdiction.key && !intake.jurisdiction.city && !intake.jurisdiction.state_or_region)) {
    questions.push('Where is the property? Every answer above depends on local rules.');
  }

  return {
    decision: 'NOT_DECIDED_BY_SOFTWARE',
    explanation: 'THYLORA does not decide responsibility. The lease, the parties, the utility, an inspector, or a court may. These are the questions to take to them.',
    clause_to_read: clause,
    questions,
    who_can_answer: ['the lease itself', 'the landlord or property manager (in writing)', 'the water utility', 'the housing code office', 'a tenant resource center or legal aid']
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 6 · Resource lookup + escalation path
// ─────────────────────────────────────────────────────────────────────────────
function placeLabel(j = {}) {
  return [j.city, j.county, j.state_or_region, j.country].filter(Boolean).join(', ') || 'your area';
}

export function lookupResource(jurisdiction, resourceClass, resourceMap = {}) {
  const key = jurisdiction?.key;
  const entry = key && resourceMap[key];
  const r = entry && entry.resources && entry.resources[resourceClass];
  if (r) return { found: true, class: resourceClass, ...r, verification: r.verification || 'VERIFY_LOCALLY', map_entry: entry.label };
  const place = placeLabel(jurisdiction);
  return {
    found: false,
    class: resourceClass,
    name: `Look up your local ${RESOURCE_CLASSES[resourceClass]}`,
    lookup_query: `${place} ${RESOURCE_CLASSES[resourceClass]}`,
    verification: 'LOOKUP_REQUIRED'
  };
}

export function buildEscalationPath(intake = {}, resourceMap = EXAMPLE_RESOURCE_MAP) {
  const comms = Array.isArray(intake.communications) ? intake.communications : [];
  const repair = Array.isArray(intake.repair_evidence) ? intake.repair_evidence : [];
  const j = intake.jurisdiction || {};
  const writtenNotice = comms.filter(c => c.party === 'LANDLORD' && c.direction !== 'RECEIVED' && WRITTEN_CHANNELS.has(c.channel))
                             .sort((a, b) => String(a.date).localeCompare(String(b.date)))[0];
  const utilityContact = comms.find(c => c.party === 'UTILITY');

  const steps = [
    {
      step: 1, code: 'LANDLORD_WRITTEN_NOTICE',
      title: 'Written notice to the landlord / property manager',
      purpose: 'Creates a dated record that the defect was reported and asks for a repair date.',
      attach: ['photos of the fixture with capture dates', 'the disputed bill(s)', 'the anomaly table from this packet'],
      status: writtenNotice ? 'DONE' : 'READY',
      evidence_ref: writtenNotice ? `${writtenNotice.date} ${writtenNotice.channel}` : null,
      resource: { found: true, class: 'LANDLORD_NOTICE', name: 'Use the notice address named in your lease', verification: 'READ_YOUR_LEASE' }
    },
    {
      step: 2, code: 'UTILITY_DISPUTE_LEAK_ADJUSTMENT',
      title: 'Utility billing dispute / leak-adjustment request',
      purpose: 'Asks the utility whether the disputed bill can be reviewed or adjusted, and what proof it needs.',
      attach: ['bill copies', 'baseline and excess math', 'repair evidence (if the program requires it)'],
      status: repair.length ? (utilityContact ? 'IN_PROGRESS' : 'READY') : (utilityContact ? 'WAITING_ON_REPAIR_EVIDENCE' : 'READY_TO_ASK'),
      evidence_ref: utilityContact ? `${utilityContact.date} ${utilityContact.channel}` : null,
      resource: lookupResource(j, 'UTILITY_DISPUTE', resourceMap)
    },
    {
      step: 3, code: 'HOUSING_CODE_INSPECTION',
      title: 'Local housing code inspection request',
      purpose: 'If the defect is not repaired after notice, an inspector can record the condition independently.',
      attach: ['written notice copy', 'photos', 'timeline'],
      status: writtenNotice ? (repair.length ? 'NOT_NEEDED_IF_REPAIRED' : 'AVAILABLE') : 'AFTER_STEP_1',
      evidence_ref: null,
      resource: lookupResource(j, 'HOUSING_CODE', resourceMap)
    },
    {
      step: 4, code: 'TENANT_RESOURCE_LEGAL_AID',
      title: 'Tenant resource center / legal aid',
      purpose: 'A person who knows local law can read your lease clause and tell you your options. THYLORA cannot.',
      attach: ['this whole packet', 'the full lease'],
      status: 'AVAILABLE_ANY_TIME',
      evidence_ref: null,
      resource: [lookupResource(j, 'TENANT_RESOURCE', resourceMap), lookupResource(j, 'LEGAL_AID', resourceMap)]
    },
    {
      step: 5, code: 'SMALL_CLAIMS_INFO',
      title: 'Small claims court — information only',
      purpose: 'Learn the dollar limit, filing fee, deadlines and evidence rules. This is information, not a recommendation to file.',
      attach: ['cost-exposure summary', 'evidence index'],
      status: 'INFORMATION_ONLY',
      evidence_ref: null,
      resource: lookupResource(j, 'SMALL_CLAIMS', resourceMap)
    }
  ];
  return { steps, crisis_note: 'If there is flooding, sewage, no water, or electrical danger, contact emergency services or the utility emergency line first. Paperwork waits.' };
}

// ─────────────────────────────────────────────────────────────────────────────
// 7 · Cost exposure + next questions
// ─────────────────────────────────────────────────────────────────────────────
export function summarizeCostExposure(anomaly, leak) {
  const out = {
    model: 'EMPIRICAL MODEL',
    disputed_billed_cents: anomaly?.totals?.disputed_billed_cents ?? null,
    baseline_equivalent_cents: anomaly?.totals?.baseline_equivalent_cents ?? null,
    estimated_excess_cents: anomaly?.totals?.excess_cost_cents ?? null,
    ongoing_cents_per_day: leak?.ok ? leak.cost_cents_per_day : null,
    ongoing_cents_per_30_days: leak?.ok && leak.cost_cents_per_day != null ? roundHalfUp(leak.cost_cents_per_day * 30) : null,
    unknown: ['late fees or penalties', 'sewer charges if billed separately and not in the marginal rate', 'taxes and surcharges', 'any water damage to belongings'],
    note: 'Exposure is money at stake in the dispute. It is not a statement of who owes it.'
  };
  return out;
}

export function nextQuestions(intake, validation, responsibility) {
  const qs = [];
  for (const g of validation.gaps.filter(g => g.severity !== 'HELPFUL')) qs.push(`[${g.code}] ${g.route}`);
  qs.push('Was either disputed meter reading an ESTIMATED read? (Look for "E" or "est." beside the reading.)');
  qs.push('Has the fixture been repaired? If yes, on what date, by whom, and is there a dated invoice or work order?');
  qs.push('After repair, does the meter stay still for 15 minutes with all water off? (Record the reading before and after.)');
  for (const q of responsibility.questions.slice(0, 3)) qs.push(q);
  return qs;
}

// ─────────────────────────────────────────────────────────────────────────────
// 8 · Case packet — structured object + Markdown rendering
// ─────────────────────────────────────────────────────────────────────────────
export const PACKET_SECTIONS = Object.freeze([
  'Case summary', 'Timeline', 'Bills and anomaly math', 'Continuous-leak estimate',
  'Evidence index', 'Communications log', 'Responsibility questions', 'Cost exposure',
  'Resource route', 'Open questions', 'Privacy and consent', 'Disclaimer'
]);

export function buildCasePacket(intake = {}, options = {}) {
  const resourceMap = options.resourceMap ?? EXAMPLE_RESOURCE_MAP;
  const generatedAt = options.generatedAt ?? new Date().toISOString();
  const caseId = options.caseId ?? 'HELP-CASE-UNASSIGNED';
  const acctRaw = intake.utility_account?.account_number ?? null;
  const scrub = s => scrubText(s, acctRaw);

  const validation = validateIntake(intake);
  const timeline = [...(intake.timeline || [])]
    .map((e, i) => ({ ...e, event: scrub(e.event), _i: i }))
    .sort((a, b) => (isDate(a.date) ? a.date : '9999-99-99').localeCompare(isDate(b.date) ? b.date : '9999-99-99') || a._i - b._i)
    .map(({ _i, ...e }) => e);
  const anomaly = computeUsageAnomaly(intake.bills || [], intake.rate || {});
  const leak = intake.leak && (intake.leak.gallons_per_minute != null || intake.leak.gallons_per_day != null)
    ? estimateContinuousLeak({ ...intake.leak, days: 30, marginal_cents_per_kgal: intake.rate?.marginal_cents_per_kgal })
    : null;
  const leakComparison = compareLeakToAnomaly(anomaly, leak);
  const responsibility = routeResponsibility(intake);
  const escalation = buildEscalationPath(intake, resourceMap);
  const exposure = summarizeCostExposure(anomaly, leak);
  const questions = nextQuestions(intake, validation, responsibility);

  const evidence = [
    ...(intake.bills || []).map((b, i) => ({ ref: `B${i + 1}`, kind: 'BILL', date: b.period_end || null, description: `${b.id || 'bill'} · ${b.period_start || '?'} → ${b.period_end || '?'}${b.disputed ? ' · DISPUTED' : ''}` })),
    ...(intake.photos || []).map((p, i) => ({ ref: `P${i + 1}`, kind: 'PHOTO', date: p.capture_date || null, description: scrub(p.subject) })),
    ...(intake.communications || []).map((c, i) => ({ ref: `C${i + 1}`, kind: 'COMMUNICATION', date: c.date || null, description: `${c.party} · ${c.channel} · ${c.direction || ''}`.trim() })),
    ...(intake.repair_evidence || []).map((r, i) => ({ ref: `R${i + 1}`, kind: 'REPAIR', date: r.date || null, description: scrub(r.summary) })),
    ...(intake.tenancy?.lease_clause?.text ? [{ ref: 'L1', kind: 'LEASE_CLAUSE', date: null, description: intake.tenancy.lease_clause.section || 'lease clause' }] : [])
  ];
  const comms = [...(intake.communications || [])]
    .map(c => ({ ...c, summary: scrub(c.summary) }))
    .sort((a, b) => String(a.date).localeCompare(String(b.date)));

  const packet = {
    case_id: caseId,
    generated_at: generatedAt,
    case_type: intake.case_type || 'BILLING_DISPUTE',
    sample: intake.sample === true,
    jurisdiction: intake.jurisdiction || null,
    account: {
      holder: intake.utility_account?.holder ?? null,
      utility_name: intake.utility_account?.utility_name ?? null,
      account_number_redacted: redactAccount(acctRaw)
    },
    validation, timeline, anomaly, leak, leak_comparison: leakComparison,
    evidence_index: evidence, communications: comms,
    responsibility, escalation, cost_exposure: exposure, open_questions: questions,
    privacy: {
      consent: intake.consent || null,
      redactions: ['utility account number → last 4', 'digit runs of 8+ → last 4'],
      retention_days: intake.consent?.retention_days ?? null
    },
    disclaimer: DISCLAIMER
  };
  packet.markdown = renderCasePacketMarkdown(packet);
  const hits = findLegalConclusions(packet.markdown);
  if (hits.length) throw new Error(`packet contains an authored legal conclusion: ${hits.join('; ')}`);
  return packet;
}

export function renderCasePacketMarkdown(p) {
  const L = [];
  const a = p.anomaly;
  L.push(`# THYLORA Help Desk · Case Packet ${p.case_id}${p.sample ? ' · SAMPLE' : ''}`);
  L.push('');
  L.push(`Generated ${p.generated_at} · Case type ${p.case_type} · Method origin THY-DEPT-QUESTION-NAV-001`);
  if (p.sample) L.push('', '**SAMPLE — every name, date, number and place in this packet is illustrative.**');
  L.push('');

  L.push('## 1 · Case summary', '');
  L.push(`- Place: ${p.jurisdiction ? placeLabel(p.jurisdiction) + (p.jurisdiction.key ? ` (resource key ${p.jurisdiction.key})` : '') : 'NOT GIVEN'}`);
  L.push(`- Utility: ${p.account.utility_name || 'NOT GIVEN'} · account ${p.account.account_number_redacted || 'NOT GIVEN'} · account holder ${p.account.holder || 'NOT GIVEN'}`);
  L.push(`- Intake: ${p.validation.counts.BLOCKING} blocking, ${p.validation.counts.IMPORTANT} important, ${p.validation.counts.HELPFUL} helpful gaps · packet buildable: ${p.validation.can_build_packet ? 'YES' : 'NO'}`);
  if (a.ok && a.totals.excess_cost_cents != null) {
    L.push(`- Estimated excess across ${a.totals.disputed_periods} disputed period(s): ${fmtInt(a.totals.excess_gallons)} gal (${fmtInt(a.totals.excess_litres)} L) ≈ ${formatCents(a.totals.excess_cost_cents)} (EMPIRICAL MODEL)`);
  }
  L.push('');

  L.push('## 2 · Timeline', '', '| Date | Event | Source |', '|---|---|---|');
  for (const e of p.timeline) L.push(`| ${e.date || 'DATE MISSING'} | ${cell(quoteUser(e.event))} | ${cell(e.source || '')} |`);
  L.push('');

  L.push('## 3 · Bills and anomaly math', '');
  if (!a.ok) {
    L.push(`Anomaly math not computed: ${a.reason}.`, '');
  } else {
    L.push('Model class: **EMPIRICAL MODEL**.', '');
    L.push(`Baseline: ${a.baseline.bills_used} undisputed bill(s), ${fmtInt(a.baseline.gallons)} gal over ${a.baseline.days} days → r_base = ${fmtInt(a.baseline.gallons)} ÷ ${a.baseline.days} = ${Number(a.baseline.gallons_per_day.toFixed(4))} gal/day.`);
    L.push(`Marginal rate m = ${a.marginal_cents_per_kgal == null ? 'NOT GIVEN' : formatCents(a.marginal_cents_per_kgal) + ' per 1,000 gal'}${a.fixed_cents_per_period != null ? ` · fixed charge ${formatCents(a.fixed_cents_per_period)} per period` : ''}.`, '');
    L.push('| Bill | Period | Days | Used (gal) | Expected (gal) | Excess (gal) | Excess (L) | Excess cost | Billed | Bill math |', '|---|---|---|---|---|---|---|---|---|---|');
    for (const r of a.rows) {
      L.push(`| ${cell(r.id)}${r.disputed ? ' (disputed)' : ''} | ${r.period_start || '?'} → ${r.period_end || '?'} | ${r.days ?? '?'} | ${r.gallons == null ? '?' : fmtInt(r.gallons)} | ${r.expected_gallons == null ? '?' : fmtInt(r.expected_gallons)} | ${r.disputed ? fmtInt(r.excess_gallons ?? 0) : '—'} | ${r.disputed ? fmtInt(r.excess_litres ?? 0) : '—'} | ${r.disputed && r.excess_cost_cents != null ? formatCents(r.excess_cost_cents) : '—'} | ${r.amount_cents == null ? '?' : formatCents(r.amount_cents)} | ${r.bill_math_check} |`);
    }
    L.push('');
    L.push('Equations (every symbol defined):', '');
    L.push('- r_base = Σ U_p ÷ Σ D_p — U_p gallons used on undisputed bill p; D_p days in its service period (inclusive); r_base in gal/day.');
    L.push('- E_d = round(r_base × D_d) — expected gallons for disputed period d of D_d days.');
    L.push('- X_d = max(0, U_d − E_d) — excess gallons; never negative.');
    L.push('- C_d = round(X_d × m ÷ 1000) — excess cost in cents; m = marginal cents per 1,000 gal; round = half up to whole cents.');
    for (const r of a.rows.filter(r => r.disputed && r.expected_gallons != null)) {
      L.push(`- Worked: ${cell(r.id)} — E = round(${Number(a.baseline.gallons_per_day.toFixed(4))} × ${r.days}) = ${fmtInt(r.expected_gallons)}; X = ${fmtInt(r.gallons)} − ${fmtInt(r.expected_gallons)} = ${fmtInt(r.excess_gallons)} gal; C = ${fmtInt(r.excess_gallons)} × ${a.marginal_cents_per_kgal ?? '?'} ÷ 1000 = ${r.excess_cost_cents ?? '?'} ¢ = ${r.excess_cost_cents == null ? '?' : formatCents(r.excess_cost_cents)}.`);
    }
    if (a.totals.baseline_equivalent_cents != null) {
      L.push(`- Reconciliation: billed ${formatCents(a.totals.disputed_billed_cents)} − baseline-equivalent ${formatCents(a.totals.baseline_equivalent_cents)} − excess ${formatCents(a.totals.excess_cost_cents)} = ${formatCents(a.totals.reconciliation_gap_cents)} unexplained.`);
    }
    L.push('', 'Assumptions: ' + a.assumptions.join(' '), '', 'Fails when: ' + a.failure_conditions.join(' '), '');
  }

  L.push('## 4 · Continuous-leak estimate', '');
  if (!p.leak) {
    L.push('No flow rate supplied. Do a meter test (all water off, read the meter, wait 15 minutes, read again) to measure one.', '');
  } else {
    const k = p.leak;
    L.push('Model class: **EMPIRICAL MODEL**.', '');
    L.push(`- Fixture: ${cell(quoteUser(k.fixture))}`);
    L.push(`- q_day = q_min × 1440 = ${k.gallons_per_day} gal/day (${k.litres_per_day} L/day)`);
    L.push(`- V(30) = ${k.gallons_per_day} × 30 = ${fmtInt(k.gallons)} gal (${fmtInt(k.litres)} L)`);
    if (k.cost_cents != null) L.push(`- C(30) = ${fmtInt(k.gallons)} × ${a.marginal_cents_per_kgal} ÷ 1000 = ${k.cost_cents} ¢ = ${formatCents(k.cost_cents)} per 30 days (${k.cost_cents_per_day} ¢/day)`);
    L.push('');
    if (p.leak_comparison.length) {
      L.push('| Bill | Days | Observed excess (gal) | Leak model (gal) | Residual (gal) | Explained |', '|---|---|---|---|---|---|');
      for (const c of p.leak_comparison) {
        L.push(`| ${cell(c.id)} | ${c.days} | ${fmtInt(c.observed_excess_gallons)} | ${fmtInt(c.modelled_leak_gallons)} | ${fmtInt(c.residual_gallons)} | ${c.explained_bp == null ? '—' : (c.explained_bp / 100).toFixed(2) + '%'} |`);
      }
      L.push('');
    }
    L.push('Assumptions: ' + k.assumptions.join(' '), '', 'Fails when: ' + k.failure_conditions.join(' '), '');
  }

  L.push('## 5 · Evidence index', '', '| Ref | Kind | Date | Description |', '|---|---|---|---|');
  for (const e of p.evidence_index) L.push(`| ${e.ref} | ${e.kind} | ${e.date || '—'} | ${cell(['PHOTO', 'REPAIR', 'LEASE_CLAUSE'].includes(e.kind) ? quoteUser(e.description) : e.description)} |`);
  L.push('');

  L.push('## 6 · Communications log', '', '| Date | Party | Channel | Direction | Summary |', '|---|---|---|---|---|');
  for (const c of p.communications) L.push(`| ${c.date || 'DATE MISSING'} | ${c.party || '?'} | ${c.channel || '?'} | ${c.direction || '?'} | ${cell(quoteUser(c.summary))} |`);
  L.push('');

  L.push('## 7 · Responsibility questions', '');
  L.push(`Decision: **${p.responsibility.decision}**. ${p.responsibility.explanation}`, '');
  const cl = p.responsibility.clause_to_read;
  if (cl.status === 'SUPPLIED') {
    L.push(`Clause to read (${cl.section}) — user-supplied text, quoted, not a THYLORA conclusion:`, '');
    for (const line of String(cl.text).split('\n')) L.push(`> ${line}`);
    L.push('');
  } else {
    L.push(`Clause to read: NOT SUPPLIED. Look for lease sections titled: ${cl.look_for.join(' · ')}.`, '');
  }
  p.responsibility.questions.forEach((q, i) => L.push(`${i + 1}. ${q}`));
  L.push('', `Who can answer: ${p.responsibility.who_can_answer.join(' · ')}.`, '');

  L.push('## 8 · Cost exposure', '');
  const x = p.cost_exposure;
  L.push(`Model class: **${x.model}**. ${x.note}`, '');
  L.push('| Item | Amount |', '|---|---|');
  L.push(`| Billed in disputed periods | ${x.disputed_billed_cents == null ? '?' : formatCents(x.disputed_billed_cents)} |`);
  L.push(`| Same periods at baseline usage | ${x.baseline_equivalent_cents == null ? '?' : formatCents(x.baseline_equivalent_cents)} |`);
  L.push(`| Estimated excess (anomaly math) | ${x.estimated_excess_cents == null ? '?' : formatCents(x.estimated_excess_cents)} |`);
  L.push(`| Ongoing while unrepaired (leak model) | ${x.ongoing_cents_per_day == null ? '?' : `${x.ongoing_cents_per_day} ¢/day · ${formatCents(x.ongoing_cents_per_30_days)} per 30 days`} |`);
  L.push('', `Not included / unknown: ${x.unknown.join(' · ')}.`, '');

  L.push('## 9 · Resource route', '');
  L.push(`> ${p.escalation.crisis_note}`, '');
  L.push('| Step | Action | Status | Where | Verification |', '|---|---|---|---|---|');
  for (const s of p.escalation.steps) {
    const rs = Array.isArray(s.resource) ? s.resource : [s.resource];
    L.push(`| ${s.step} | ${cell(s.title)} | ${s.status}${s.evidence_ref ? ` (${cell(s.evidence_ref)})` : ''} | ${cell(rs.map(r => r.name).join(' / '))} | ${rs.map(r => r.verification).join(' / ')} |`);
  }
  L.push('');
  for (const s of p.escalation.steps) {
    L.push(`- Step ${s.step} · ${s.code}: ${s.purpose} Attach: ${s.attach.join(', ')}.`);
    const rs = Array.isArray(s.resource) ? s.resource : [s.resource];
    for (const r of rs) if (r.lookup_query) L.push(`  - Lookup: search for "${r.lookup_query}".`);
  }
  L.push('');

  L.push('## 10 · Open questions', '');
  p.open_questions.forEach((q, i) => L.push(`${i + 1}. ${q}`));
  L.push('');

  L.push('## 11 · Privacy and consent', '');
  L.push(`- Consent recorded: ${p.privacy.consent?.recorded ? 'YES' : 'NO'}${p.privacy.consent?.scope ? ` · scope: ${p.privacy.consent.scope.join(', ')}` : ''}`);
  L.push(`- Retention: ${p.privacy.retention_days == null ? 'NOT SET' : p.privacy.retention_days + ' days, then deleted unless you renew'}`);
  L.push(`- Third-party contact by THYLORA: ${p.privacy.consent?.contact_third_parties ? 'PERMITTED' : 'NOT PERMITTED — you send every message yourself'}`);
  L.push(`- Redactions applied: ${p.privacy.redactions.join('; ')}.`, '');

  L.push('## 12 · Disclaimer', '', p.disclaimer, '');
  return L.join('\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// SAMPLE case — high water bill / running toilet / landlord repair.
// Every value is illustrative. Used by the Lane G packet and the tests.
// ─────────────────────────────────────────────────────────────────────────────
export const SAMPLE_WATER_BILL_CASE = Object.freeze({
  sample: true,
  case_type: 'BILLING_DISPUTE',
  consent: { recorded: true, scope: ['store_case_records', 'generate_packet'], retention_days: 365, contact_third_parties: false },
  jurisdiction: { key: 'EXAMPLE-US-CITY', city: 'Example City', state_or_region: 'Example State', country: 'US' },
  utility_account: { holder: 'TENANT', account_number: '000048213377', utility_name: 'Example City Water Utility (SAMPLE)' },
  tenancy: {
    role: 'TENANT', lease_on_file: true,
    lease_clause: { section: 'SAMPLE Lease §9 Repairs', text: 'SAMPLE: Tenant shall promptly notify Landlord in writing of any plumbing defect. Landlord shall make repairs to fixtures within a reasonable time after notice, except damage caused by Tenant.' }
  },
  rate: { marginal_cents_per_kgal: 1250, fixed_cents_per_period: 2000, source: 'SAMPLE bill back page: water + sewer usage $12.50 per 1,000 gal; service charge $20.00' },
  timeline: [
    { date: '2026-04-06', event: 'Bill for 2026-03-05 → 2026-04-03 arrives: 9,480 gal, $138.50', source: 'B4' },
    { date: '2026-03-02', event: 'Tenant hears hall-bathroom toilet running constantly', source: 'tenant statement' },
    { date: '2026-03-03', event: 'Text to landlord reporting the running toilet', source: 'C1' },
    { date: '2026-03-10', event: 'Photo of tank interior: flapper warped, water trickling into bowl', source: 'P1' },
    { date: '2026-04-08', event: 'Email to landlord: written notice, bill attached, account 000048213377 referenced', source: 'C3' },
    { date: '2026-04-15', event: 'Landlord replies a plumber will come; no visit follows', source: 'C4' },
    { date: '2026-05-06', event: 'Bill for 2026-04-04 → 2026-05-04 arrives: 10,300 gal, $148.75', source: 'B5' },
    { date: '2026-05-12', event: 'Tenant calls utility; told a leak adjustment needs proof of repair', source: 'C5' }
  ],
  bills: [
    { id: 'SAMPLE-B1', period_start: '2025-12-05', period_end: '2026-01-03', usage: 3000, unit: 'GAL', amount_cents: 5750, disputed: false },
    { id: 'SAMPLE-B2', period_start: '2026-01-04', period_end: '2026-02-03', usage: 3200, unit: 'GAL', amount_cents: 6000, disputed: false },
    { id: 'SAMPLE-B3', period_start: '2026-02-04', period_end: '2026-03-04', usage: 2800, unit: 'GAL', amount_cents: 5500, disputed: false },
    { id: 'SAMPLE-B4', period_start: '2026-03-05', period_end: '2026-04-03', usage: 9480, unit: 'GAL', amount_cents: 13850, disputed: true },
    { id: 'SAMPLE-B5', period_start: '2026-04-04', period_end: '2026-05-04', usage: 10300, unit: 'GAL', amount_cents: 14875, disputed: true }
  ],
  photos: [
    { id: 'SAMPLE-P1', capture_date: '2026-03-10', subject: 'Toilet tank interior, warped flapper' },
    { id: 'SAMPLE-P2', capture_date: '2026-05-12', subject: 'Water meter dial, low-flow indicator turning with all taps off' }
  ],
  communications: [
    { date: '2026-03-03', party: 'LANDLORD', channel: 'TEXT', direction: 'SENT', summary: 'Hall toilet keeps running, can someone look at it?' },
    { date: '2026-03-04', party: 'LANDLORD', channel: 'TEXT', direction: 'RECEIVED', summary: 'Will check this week.' },
    { date: '2026-04-08', party: 'LANDLORD', channel: 'EMAIL', direction: 'SENT', summary: 'Written notice of running toilet since 3/2; water bill for account 000048213377 attached; requesting repair date.' },
    { date: '2026-04-15', party: 'LANDLORD', channel: 'EMAIL', direction: 'RECEIVED', summary: 'Plumber will come next week.' },
    { date: '2026-05-12', party: 'UTILITY', channel: 'PHONE', direction: 'SENT', summary: 'Asked about high bill; rep said leak adjustment requires proof of repair within the program window.' }
  ],
  repair_evidence: [],
  leak: { fixture: 'hall toilet flapper (continuous seep)', gallons_per_minute: 0.15, basis: 'SAMPLE meter test: 2.25 gal in 15 min with all fixtures off' }
});
