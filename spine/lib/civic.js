// Civic Contact Institute: a reasoning curriculum that keeps five things apart
// — what was seen, what was concluded, which legal standard is being invoked,
// under whose jurisdiction and as of what date, and what the lawful next step is.
//
// This module teaches reasoning. It is not legal advice and makes no legal
// claim on its own: any statement that invokes a legal standard is refused
// unless it carries a sourced Earth law record that is jurisdiction- and
// date-specific. Source records mirror legal_source_registry in thylora-dash.

export const LADDER = Object.freeze([
  { level: 0, code: 'OBSERVATION', legal: false, meaning: 'What a person directly saw, heard or recorded. No interpretation.' },
  { level: 1, code: 'INFERENCE', legal: false, meaning: 'A conclusion drawn from one or more observations. Must name the observations it rests on.' },
  { level: 2, code: 'REASONABLE_SUSPICION', legal: true, meaning: 'A legal standard in some jurisdictions. Its meaning is defined by that jurisdiction\'s law and courts, not by this curriculum.' },
  { level: 3, code: 'PROBABLE_CAUSE', legal: true, meaning: 'A legal standard in some jurisdictions. Its meaning is defined by that jurisdiction\'s law and courts, not by this curriculum.' },
  { level: 4, code: 'LEGAL_AUTHORITY', legal: true, meaning: 'The specific power a specific official holds under a specific law in a specific place at a specific time.' },
]);

export const ESCALATION = Object.freeze([
  { step: 1, code: 'STAY_SAFE_AND_CALM', text: 'Keep yourself and others safe. Do not physically resist.' },
  { step: 2, code: 'DOCUMENT', text: 'Write down time, place, names, badge or unit numbers, and what you observed — separately from what you concluded.' },
  { step: 3, code: 'ASK_PLAIN_QUESTIONS', text: 'Ask plainly whether you are free to leave and what the stated reason for the contact is.' },
  { step: 4, code: 'LATER_LAWFUL_REVIEW', text: 'Afterwards, use lawful channels: supervisor request, formal complaint, records request.' },
  { step: 5, code: 'LICENSED_COUNSEL', text: 'For what the law requires or permits in your situation, consult a lawyer licensed in that jurisdiction.' },
]);

export const EDUCATIONAL_LABEL = 'EDUCATIONAL — reasoning practice, not legal advice. Law varies by jurisdiction and changes over time.';

function inWindow(src, asOf) {
  const d = Date.parse(asOf);
  if (Number.isNaN(d)) return false;
  if (src.effective_from && Date.parse(src.effective_from) > d) return false;
  if (src.effective_to && Date.parse(src.effective_to) < d) return false;
  return true;
}

/** Validate a legal source record (legal_source_registry shape). */
export function validateSource(src) {
  const e = [];
  for (const k of ['canonical_id', 'jurisdiction', 'title', 'issuing_authority', 'official_source_uri', 'effective_from', 'evidence_status']) {
    if (!src || !src[k]) e.push(`source.${k} missing`);
  }
  if (src && src.world_layer && src.world_layer !== 'EARTH') e.push('only EARTH-layer law may support an Earth legal claim');
  return e;
}

/**
 * Check one student reasoning record.
 * record = {
 *   observations: [string], inferences: [{ claim, rests_on: [obs index] }],
 *   standard_invoked: LADDER code, jurisdiction, as_of_date, legal_sources: [src],
 *   escalation_plan: [ESCALATION code]
 * }
 */
export function checkReasoning(rec) {
  const errors = [];
  const warnings = [];
  const obs = rec.observations || [];
  if (obs.length === 0) errors.push('at least one observation required');
  for (const o of obs) {
    if (/\b(because|so|must have|obviously|clearly|probably|guilty|suspicious)\b/i.test(o)) {
      errors.push(`observation contains interpretation: "${o}"`);
    }
  }
  for (const inf of rec.inferences || []) {
    if (!inf.rests_on || inf.rests_on.length === 0) errors.push(`inference "${inf.claim}" names no observations`);
    else if (inf.rests_on.some(i => !Number.isInteger(i) || i < 0 || i >= obs.length)) errors.push(`inference "${inf.claim}" cites a missing observation`);
  }
  const rung = LADDER.find(l => l.code === rec.standard_invoked);
  if (!rung) errors.push('standard_invoked must be a LADDER code');
  let verified = false;
  if (rung && rung.legal) {
    if (!rec.jurisdiction) errors.push('legal standard invoked without jurisdiction');
    if (!rec.as_of_date) errors.push('legal standard invoked without as_of_date');
    const srcs = rec.legal_sources || [];
    if (srcs.length === 0) errors.push('legal standard invoked without a sourced Earth law record');
    for (const s of srcs) {
      errors.push(...validateSource(s));
      if (rec.jurisdiction && s.jurisdiction && s.jurisdiction !== rec.jurisdiction) errors.push(`source ${s.canonical_id} is ${s.jurisdiction}, record is ${rec.jurisdiction}`);
      if (rec.as_of_date && s.effective_from && !inWindow(s, rec.as_of_date)) errors.push(`source ${s.canonical_id} not in effect on ${rec.as_of_date}`);
    }
    verified = srcs.length > 0 && srcs.every(s => s.evidence_status === 'VERIFIED_OFFICIAL_TEXT');
    if (srcs.length && !verified) warnings.push('sources not verified against official text — output stays educational-unverified');
  }
  const plan = rec.escalation_plan || [];
  if (plan.length === 0) errors.push('escalation plan required');
  for (const p of plan) if (!ESCALATION.some(e => e.code === p)) errors.push(`unknown escalation step ${p}`);
  if (plan.length && plan[0] !== 'STAY_SAFE_AND_CALM') errors.push('escalation must start with STAY_SAFE_AND_CALM');
  return {
    ok: errors.length === 0, errors, warnings,
    label: verified ? 'EDUCATIONAL — sourced, still not legal advice' : EDUCATIONAL_LABEL,
  };
}
