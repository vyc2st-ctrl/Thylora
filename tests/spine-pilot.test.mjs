import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validateOffer, validateParticipant } from '../spine/lib/pilot.js';

const offer = JSON.parse(readFileSync(new URL('../spine/lanes/five-builds-offer.json', import.meta.url)));

test('offer as drafted is valid and held before outreach', () => {
  assert.deepEqual(validateOffer(offer), []);
  assert.equal(offer.state, 'CHAIRMAN_REVIEW');
  assert.equal(offer.chairman_outreach_approval, null);
});

test('outreach refused without witnessed Chairman approval', () => {
  assert.match(validateOffer({ ...offer, state: 'OUTREACH' }).join(), /witnessed Chairman approval/);
  assert.deepEqual(validateOffer({ ...offer, state: 'OUTREACH', chairman_outreach_approval: { witness_ref: 'chairman-direct-001' } }), []);
});

test('bounds: caps, one build, no auto billing, idea ownership, consent', () => {
  assert.match(validateOffer({ ...offer, participant_cap: 6 }).join(), /participant_cap/);
  assert.match(validateOffer({ ...offer, builds_per_participant: 2 }).join(), /exactly 1/);
  assert.match(validateOffer({ ...offer, conversion: { ...offer.conversion, automatic_billing: true } }).join(), /automatically/);
  assert.match(validateOffer({ ...offer, rights: { ...offer.rights, participant_keeps_idea_ownership: false } }).join(), /ownership/);
  assert.match(validateOffer({ ...offer, rights: { ...offer.rights, consent_revocable: false } }).join(), /revocable/);
  assert.match(validateOffer({ ...offer, delivery_scope: { ...offer.delivery_scope, hours_cap: 0 } }).join(), /hours_cap/);
});

test('public copy cannot claim customers or payment', () => {
  assert.match(validateOffer({ ...offer, public_copy: 'Our first customer signed last week.' }).join(), /customer_acquisition/);
});

test('participant: consent, idea cap, selection, showcase consent', () => {
  const p = { participant_id: 'P1', consent: { pilot_terms: 'GRANTED' }, ideas: [{ idea_id: 'i1' }, { idea_id: 'i2' }], selected_idea: 'i2' };
  assert.deepEqual(validateParticipant(offer, p), []);
  assert.match(validateParticipant(offer, { ...p, ideas: Array.from({ length: 6 }, (_, i) => ({ idea_id: `i${i}` })) }).join(), /more than 5/);
  assert.match(validateParticipant(offer, { ...p, selected_idea: 'zz' }).join(), /not among/);
  assert.match(validateParticipant(offer, { ...p, showcase_allowed: true }).join(), /showcase consent/);
  assert.match(validateParticipant(offer, { ...p, consent: {} }).join(), /pilot terms/);
});
