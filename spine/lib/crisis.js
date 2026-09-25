// Family Crisis Response: routing architecture for an employee's or family
// member's legal or medical emergency.
//
// THYLORA coordinates and routes. It does not give legal representation,
// legal advice, diagnosis or treatment. Emergency services always come first.
// Counsel is only offered from legal_family_counsel_registry rows whose
// verification_state is VERIFIED; otherwise the route says verification pending.

import { claimGuard } from './qyris2st.js';
import { issueGrant } from './access.js';

export const DISCLAIMER = 'THYLORA coordinates support and routes you to qualified people. THYLORA is not your lawyer and is not a medical provider; it does not give legal advice, legal representation, diagnosis or treatment.';

export const INCIDENT_TYPES = Object.freeze(['MEDICAL', 'MENTAL_HEALTH', 'LEGAL_DETENTION', 'LEGAL_OTHER', 'SAFETY_VIOLENCE', 'DEATH_IN_FAMILY', 'MISSING_PERSON']);

// Emergency numbers by country code. Only entries confirmed in public official
// sources are listed; anything else falls back to "local emergency number".
export const EMERGENCY = Object.freeze({
  US: { general: '911', mental_health: '988', source_note: '911 (FCC); 988 Suicide & Crisis Lifeline (SAMHSA, live since July 2022)' },
});

function emergencyStep(country, type) {
  const e = EMERGENCY[country];
  if (type === 'MENTAL_HEALTH' && e && e.mental_health) {
    return `If anyone is in immediate danger call ${e.general}. For a mental health crisis call or text ${e.mental_health}.`;
  }
  return e ? `If anyone is in immediate danger or needs urgent medical help, call ${e.general} now.` : 'If anyone is in immediate danger, call your local emergency number now.';
}

/**
 * Build the routing package for one incident.
 * incident = { incident_id, type, immediate_danger, country, jurisdiction,
 *              subject: { relation: 'EMPLOYEE'|'FAMILY' }, liaison_id? }
 * counsel = rows from legal_family_counsel_registry
 */
export function route(incident, { counsel = [] } = {}) {
  const errors = [];
  if (!INCIDENT_TYPES.includes(incident.type)) errors.push(`type must be ${INCIDENT_TYPES.join('|')}`);
  if (!incident.incident_id) errors.push('incident_id missing');
  if (errors.length) return { ok: false, errors };

  const steps = [];
  const life = ['MEDICAL', 'MENTAL_HEALTH', 'SAFETY_VIOLENCE', 'MISSING_PERSON'].includes(incident.type);
  if (incident.immediate_danger || life) steps.push({ lane: 'EMERGENCY_SERVICES', text: emergencyStep(incident.country, incident.type), priority: 0 });

  steps.push({ lane: 'PEOPLE_DESK', text: 'Assign one named person as the family\'s single point of contact for this incident.', priority: 1 });

  if (['MEDICAL', 'MENTAL_HEALTH'].includes(incident.type)) {
    steps.push({ lane: 'MEDICAL_ROUTING', text: 'Connect the family to the patient\'s own doctors, the treating facility and the insurer\'s nurse or care line. THYLORA does not give medical advice.', priority: 2 });
  }
  if (['LEGAL_DETENTION', 'LEGAL_OTHER'].includes(incident.type)) {
    const verified = counsel.filter(c => c.verification_state === 'VERIFIED' && c.jurisdiction === incident.jurisdiction);
    steps.push(verified.length
      ? { lane: 'COUNSEL_REFERRAL', text: `Offer the family the verified independent counsel on file for ${incident.jurisdiction}. The lawyer works for the client, not for THYLORA.`, counsel_ids: verified.map(c => c.id), priority: 2 }
      : { lane: 'COUNSEL_REFERRAL', text: `No verified counsel on file for ${incident.jurisdiction || 'this jurisdiction'}. Refer to the state or local bar association's lawyer referral service; do not name an unverified lawyer.`, counsel_ids: [], priority: 2, state: 'VERIFICATION_PENDING' });
  }
  steps.push({ lane: 'WORK_CONTINUITY', text: 'Pause deadlines and cover the employee\'s duties; confirm leave and pay status in writing under the workforce care policy.', priority: 3 });
  steps.push({ lane: 'FAMILY_SUPPORT', text: 'Offer practical support: transport, childcare, meals, a quiet place to make calls.', priority: 3 });
  steps.push({ lane: 'PRIVACY', text: 'Share incident details only with people who hold an incident grant; log every access.', priority: 3 });

  const text = [DISCLAIMER, ...steps.map(s => s.text)].join(' ');
  const hits = claimGuard(text);
  if (hits.length) return { ok: false, errors: hits.map(h => `route text makes a ${h.claim} claim: "${h.phrase}"`) };
  return { ok: true, incident_id: incident.incident_id, disclaimer: DISCLAIMER, steps: steps.sort((a, b) => a.priority - b.priority) };
}

/** Time-limited, scoped access for the family's liaison. Never a shared login. */
export function grantLiaison(ledger, { incident_id, liaison_id, issued_by }, now) {
  return issueGrant(ledger, {
    grant_id: `GRANT-${incident_id}-${liaison_id}`,
    grantee_id: liaison_id, role: 'FAMILY_LIAISON', scopes: ['incident:read-own'],
    resource_ids: [incident_id], issued_by, reason: `Family liaison for ${incident_id}`,
    expires_at: new Date(now + 3 * 86400000).toISOString(),
  }, now);
}
