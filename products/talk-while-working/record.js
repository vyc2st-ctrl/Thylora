// TALK WHILE WORKING · Phase-1 work record (THY-REALIZE-TALK-WHILE-WORKING-001)
//
// One spoken work note becomes one structured record. The raw audio stays on
// the worker's phone by default; only the corrected, redacted record is shared.
// UNKNOWN remains UNKNOWN: a field the worker did not say is null, never guessed.

export const RECORD_FIELDS = Object.freeze([
  'record_id', 'recorded_at', 'worker_ref', 'action', 'object', 'location', 'reason',
  'delta', 'safety_note', 'completion_witness', 'worker_correction', 'privacy'
]);

export const REQUIRED = Object.freeze(['record_id', 'recorded_at', 'worker_ref', 'action', 'privacy']);

export const WITNESS_TYPES = Object.freeze(['NONE', 'PHOTO', 'SECOND_PERSON', 'SYSTEM_READING', 'SUPERVISOR_SIGNOFF']);

// Patterns removed from any text field before a record leaves the phone.
const REDACTIONS = [
  { code: 'EMAIL', re: /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g },
  { code: 'PHONE', re: /(?:\+?\d{1,2}[\s.-]?)?(?:\(\d{3}\)|\d{3})[\s.-]?\d{3}[\s.-]?\d{4}\b/g },
  { code: 'CARD',  re: /\b(?:\d[ -]?){13,16}\b/g },
  { code: 'SSN',   re: /\b\d{3}-\d{2}-\d{4}\b/g }
];

const TEXT_FIELDS = ['action', 'object', 'location', 'reason', 'delta', 'safety_note', 'worker_correction'];

/**
 * Apply pattern redaction plus any names the worker marked for removal.
 * Returns a new record; the input is not mutated.
 */
export function redact(record, extraTerms = []) {
  const out = structuredClone(record);
  const applied = new Set(out.privacy?.redactions_applied || []);
  for (const f of TEXT_FIELDS) {
    if (typeof out[f] !== 'string') continue;
    let t = out[f];
    for (const { code, re } of REDACTIONS) {
      if (t.match(re)) { t = t.replace(re, `[${code}]`); applied.add(code); }
    }
    for (const term of extraTerms) {
      if (!term) continue;
      const re = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      if (re.test(t)) { t = t.replace(re, '[NAME]'); applied.add('NAME'); }
    }
    out[f] = t;
  }
  out.privacy = { ...out.privacy, redactions_applied: [...applied].sort(), redacted: true };
  return out;
}

/** Every problem with a record. Empty array = shareable. */
export function validateRecord(r) {
  const problems = [];
  for (const f of REQUIRED) if (r[f] === undefined || r[f] === null || r[f] === '') problems.push(`MISSING_${f.toUpperCase()}`);
  for (const f of Object.keys(r)) if (!RECORD_FIELDS.includes(f)) problems.push(`UNKNOWN_FIELD_${f}`);
  if (r.recorded_at && Number.isNaN(Date.parse(r.recorded_at))) problems.push('BAD_TIMESTAMP');
  if (r.completion_witness && !WITNESS_TYPES.includes(r.completion_witness.type)) problems.push('BAD_WITNESS_TYPE');
  if (r.completion_witness?.type === 'NONE' && r.completion_witness?.claimed_complete) {
    problems.push('COMPLETION_CLAIMED_WITHOUT_WITNESS');
  }
  const p = r.privacy || {};
  if (p.recording_consent !== 'SELF_ONLY' && p.recording_consent !== 'ALL_PRESENT_CONSENTED') {
    problems.push('RECORDING_CONSENT_UNSET');
  }
  if (!p.redacted) problems.push('NOT_REDACTED');
  if (p.contains_minor === true || p.contains_health_info === true) problems.push('ESCALATE_SENSITIVE');
  if (r.worker_correction === undefined) problems.push('WORKER_REVIEW_MISSING');
  return problems;
}
