// QYRIS-2ST lane record: the twelve-field evidence contract every lane delta
// must satisfy, plus the claim guard that refuses unwitnessed claims.
//
// Shared primitive. Used by every lane in spine/lanes/ and by the lane
// modules that emit public-facing text (crisis, pilot, civic).

export const QYRIS_2ST_FIELDS = Object.freeze([
  'baseline', 'delta', 'team', 'contributors', 'reasoning', 'rejected_options',
  'open_questions', 'rights', 'security', 'store_revenue_transfer', 'witness',
  'next_action',
]);

const ARRAY_FIELDS = new Set(['team', 'contributors', 'rejected_options', 'open_questions']);

// Claims that may never be made without a direct witness reference.
export const WITNESS_REQUIRED_CLAIMS = Object.freeze({
  deployment:           /\b(deployed|is live|went live|now live)\b/i,
  publication:          /\b(published|released publicly|posted publicly)\b/i,
  employment:           /\b(hired|employed|on payroll|onboarded (?:staff|employee))\b/i,
  earth_certification:  /\b(certified|certification granted|approved by (?:the )?(?:dot|nhtsa|fda|faa))\b/i,
  customer_acquisition: /\b(signed (?:a |the )?customer|acquired (?:a |the )?customer|first customer (?:signed|paid))\b/i,
  contract:             /\b(contract (?:signed|executed)|signed (?:a |the )?contract)\b/i,
  payment:              /\b(payment (?:received|captured)|was paid|got paid)\b/i,
  licensing:            /\b(licensed to|license (?:granted|executed))\b/i,
  medical_service:      /\b(we (?:diagnose|treat|prescribe)|provides? medical (?:care|treatment|service))\b/i,
  legal_representation: /\b(we represent|provides? legal representation|acts? as (?:your )?(?:lawyer|attorney|counsel))\b/i,
  completion:           /\b(fully complete|is complete|completed|done and shipped)\b/i,
});

// A claim phrase preceded closely by a negation is a disclaimer, not a claim.
const NEGATION = /\b(not|no|never|nothing|none|neither|without|nor|cannot|isn't|aren't|wasn't|doesn't|does not|do not|is not|are not|has not|have not)\b[\w\s,'-]{0,40}$/i;

export const WITNESS_CLASSES = Object.freeze([
  'REPO_TEST_PASS',        // node --test in this repository
  'BACKEND_READBACK',      // row read back from thylora-dash after write
  'FILE_IN_BRANCH',        // artifact exists in the pushed branch
  'CHAIRMAN_DIRECT',       // Chairman witnessed on device
  'NONE',                  // nothing witnessed — allowed, but must be declared
]);

/** Returns every unwitnessed claim phrase found in `text`. */
export function claimGuard(text, witnessedClaims = []) {
  const hits = [];
  if (typeof text !== 'string' || !text) return hits;
  for (const [claim, re] of Object.entries(WITNESS_REQUIRED_CLAIMS)) {
    if (witnessedClaims.includes(claim)) continue;
    const g = new RegExp(re.source, 'gi');
    let m;
    while ((m = g.exec(text)) !== null) {
      const before = text.slice(Math.max(0, m.index - 60), m.index);
      if (!NEGATION.test(before)) hits.push({ claim, phrase: m[0], at: m.index });
    }
  }
  return hits;
}

function empty(v) {
  if (v == null) return true;
  if (typeof v === 'string') return v.trim() === '';
  if (Array.isArray(v)) return v.length === 0;
  if (typeof v === 'object') return Object.keys(v).length === 0;
  return false;
}

function flatten(v) {
  if (v == null) return '';
  if (typeof v === 'string') return v;
  return JSON.stringify(v);
}

/**
 * Validate one lane record. Returns { ok, errors[] }.
 * - all twelve fields present and non-empty
 * - list fields are arrays
 * - witness declares a known class; any non-NONE class carries refs
 * - claims[] with witness refs are the only way to state a guarded claim
 */
export function validateLaneRecord(rec) {
  const errors = [];
  if (!rec || typeof rec !== 'object') return { ok: false, errors: ['record missing'] };
  if (!rec.lane_code) errors.push('lane_code missing');
  for (const f of QYRIS_2ST_FIELDS) {
    if (empty(rec[f])) errors.push(`${f} empty`);
    else if (ARRAY_FIELDS.has(f) && !Array.isArray(rec[f])) errors.push(`${f} must be a list`);
  }
  for (const r of rec.rejected_options || []) {
    if (!r || empty(r.option) || empty(r.reason)) errors.push('rejected option without option+reason');
  }
  const w = rec.witness || {};
  if (!WITNESS_CLASSES.includes(w.class)) errors.push(`witness.class must be one of ${WITNESS_CLASSES.join(',')}`);
  if (w.class && w.class !== 'NONE' && empty(w.refs)) errors.push('witness refs required when class is not NONE');

  const witnessed = (rec.claims || []).filter(c => c && c.type && !empty(c.witness_ref)).map(c => c.type);
  for (const c of rec.claims || []) {
    if (!c || !WITNESS_REQUIRED_CLAIMS[c.type]) errors.push(`unknown claim type ${c && c.type}`);
    else if (empty(c.witness_ref)) errors.push(`claim ${c.type} has no witness_ref`);
  }
  for (const f of QYRIS_2ST_FIELDS) {
    for (const h of claimGuard(flatten(rec[f]), witnessed)) {
      errors.push(`unwitnessed ${h.claim} claim in ${f}: "${h.phrase}"`);
    }
  }
  return { ok: errors.length === 0, errors };
}

/** Validate a whole run; returns per-lane results and an overall flag. */
export function validateRun(run) {
  const lanes = (run && run.lanes) || [];
  const results = lanes.map(l => ({ lane_code: l.lane_code, ...validateLaneRecord(l) }));
  const codes = lanes.map(l => l.lane_code);
  const dup = codes.filter((c, i) => codes.indexOf(c) !== i);
  return { ok: results.every(r => r.ok) && dup.length === 0, duplicates: dup, results };
}
