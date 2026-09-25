// Five Ideas / Five Builds: bounded free pilot offer.
//
// Up to five participants; each brings up to five ideas; THYLORA delivers one
// bounded build per participant. Participants keep their ideas. THYLORA shows
// the work only with separate, revocable consent. Paid conversion is offered
// after delivery, never automatic. Outreach stays locked until the Chairman
// approves it with a witnessed decision.

import { claimGuard } from './qyris2st.js';

export const OFFER_STATES = Object.freeze(['DRAFT', 'CHAIRMAN_REVIEW', 'APPROVED_NO_OUTREACH', 'OUTREACH', 'CLOSED']);

export function validateOffer(o) {
  const e = [];
  if (!Number.isInteger(o.participant_cap) || o.participant_cap < 1 || o.participant_cap > 5) e.push('participant_cap must be 1–5');
  if (!Number.isInteger(o.ideas_per_participant_max) || o.ideas_per_participant_max < 1 || o.ideas_per_participant_max > 5) e.push('ideas_per_participant_max must be 1–5');
  if (o.builds_per_participant !== 1) e.push('builds_per_participant must be exactly 1');
  const s = o.delivery_scope || {};
  if (!Number.isFinite(s.hours_cap) || s.hours_cap <= 0) e.push('delivery_scope.hours_cap required');
  if (!Number.isFinite(s.calendar_days_cap) || s.calendar_days_cap <= 0) e.push('delivery_scope.calendar_days_cap required');
  if (!Array.isArray(s.deliverable_types) || s.deliverable_types.length === 0) e.push('delivery_scope.deliverable_types required');
  if (!Array.isArray(s.exclusions) || s.exclusions.length === 0) e.push('delivery_scope.exclusions required');
  if (!Number.isFinite(s.revision_rounds) || s.revision_rounds < 0) e.push('delivery_scope.revision_rounds required');
  const r = o.rights || {};
  if (r.participant_keeps_idea_ownership !== true) e.push('participant must keep ownership of their ideas');
  if (r.thylora_keeps_preexisting_tools !== true) e.push('THYLORA pre-existing tools must be carved out');
  if (r.showcase_requires_separate_consent !== true) e.push('showcase/portfolio use requires separate consent');
  if (r.consent_revocable !== true) e.push('consent must be revocable');
  if (r.minors_allowed !== false && !r.guardian_consent_required) e.push('minors require guardian consent or are excluded');
  const p = o.proof_of_work || {};
  if (p.lineage_run !== true || p.contribution_wake !== true) e.push('proof_of_work must use lineage run + contribution wake');
  const c = o.conversion || {};
  if (c.automatic_billing !== false) e.push('conversion must never bill automatically');
  if (c.offered_after !== 'DELIVERY_ACCEPTED') e.push('paid conversion offered only after delivery accepted');
  if (c.price_state !== 'CHAIRMAN_TO_SET' && !Number.isFinite(c.price_minor_units)) e.push('price must be set by the Chairman or recorded in minor units');
  if (!OFFER_STATES.includes(o.state)) e.push(`state must be ${OFFER_STATES.join('|')}`);
  if (o.state === 'OUTREACH' && !(o.chairman_outreach_approval && o.chairman_outreach_approval.witness_ref)) e.push('OUTREACH requires witnessed Chairman approval');
  for (const h of claimGuard(JSON.stringify(o.public_copy || ''))) e.push(`public_copy makes unwitnessed ${h.claim} claim: "${h.phrase}"`);
  return e;
}

/** Checks one participant's submission and selection against the offer. */
export function validateParticipant(offer, p) {
  const e = [];
  if (!p.participant_id) e.push('participant_id missing');
  if (!p.consent || p.consent.pilot_terms !== 'GRANTED') e.push('pilot terms consent not granted');
  if ((p.ideas || []).length === 0) e.push('no ideas submitted');
  if ((p.ideas || []).length > offer.ideas_per_participant_max) e.push(`more than ${offer.ideas_per_participant_max} ideas`);
  if (p.selected_idea && !(p.ideas || []).some(i => i.idea_id === p.selected_idea)) e.push('selected idea not among submitted ideas');
  if (p.showcase_allowed && (!p.consent || p.consent.showcase !== 'GRANTED')) e.push('showcase without showcase consent');
  return e;
}
