// THYLORA MEDIA ROUTER · provider routing and disclosure tests
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  PROVIDER_CATALOGUE, OPERATIONS, JOB_STATES, REFUSALS, MEDIA_ROUTER_GATES,
  capabilityCheck, priceOffer, buildOffer, allOffers, selectProvider,
  idempotencyKey, hashPrompt, toRenderJobRow, isTerminal
} from '../dashboard/r6/lib/media-router.js';
import { measureStore, GATE_STATES } from '../dashboard/r6/lib/money-distance.js';

/** A catalogue with money and credentials in place, for testing the paid path. */
function readyCatalogue(overrides = {}) {
  const ready = JSON.parse(JSON.stringify({
    runway: PROVIDER_CATALOGUE.runway,
    fal: PROVIDER_CATALOGUE.fal
  }));
  for (const p of Object.values(ready)) {
    p.rate_card.minor_per_unit = 50;          // 0.50 USD per second, for arithmetic only
    p.rate_card.verified_at = '2026-09-15';
    p.credential_state = 'PRESENT';
  }
  return { ...ready, ...overrides };
}

const i2v = {
  operation: OPERATIONS.IMAGE_TO_VIDEO,
  duration_seconds: 6,
  resolution: '1280x720',
  source_asset_id: 'ASSET-NIGHTSTEP-REFERENCE-20260824-001',
  prompt: 'slow push in, water settles'
};

test('the shipped catalogue carries no verified price and no credential', () => {
  // This is the honest default: nothing here was verified by the build.
  for (const p of Object.values(PROVIDER_CATALOGUE)) {
    assert.equal(p.rate_card.verified_at, null, `${p.provider_code} must ship unverified`);
    assert.equal(p.rate_card.minor_per_unit, null);
    assert.equal(p.credential_state, 'ABSENT');
  }
});

test('an unverified rate card blocks the spend and says so', () => {
  const offer = buildOffer({ providerCode: 'runway', modelCode: 'gen4_turbo', request: i2v });
  assert.equal(offer.spendable, false);
  assert.equal(offer.estimated_cost_minor, null, 'no invented number');
  assert.ok(offer.blocking.some(b => b.code === REFUSALS.RATE_CARD_UNVERIFIED));
  assert.ok(offer.blocking.some(b => b.code === REFUSALS.NO_CREDENTIAL));
});

test('an offer always discloses provider, cost, duration, resolution and audio', () => {
  const offer = buildOffer({ providerCode: 'fal', modelCode: 'veo3/image-to-video', request: { ...i2v, duration_seconds: 8 }, catalogue: readyCatalogue() });
  for (const field of ['provider_label', 'estimated_cost_minor', 'expected_duration_seconds', 'resolution', 'audio_included']) {
    assert.ok(offer[field] !== undefined && offer[field] !== null, `${field} must be disclosed`);
  }
  assert.equal(offer.audio_included, true, 'Veo 3 declares audio');
  assert.equal(offer.estimated_cost_minor, 400, '8s at 50 minor/s');
});

test('a model without audio is not offered as satisfying an audio requirement', () => {
  const check = capabilityCheck(
    PROVIDER_CATALOGUE.runway,
    PROVIDER_CATALOGUE.runway.models[0],
    { ...i2v, audio_required: true }
  );
  assert.equal(check.ok, false);
  assert.ok(check.refusals.some(r => r.code === REFUSALS.AUDIO_UNSUPPORTED));
});

test('a duration past the model cap is refused, not quietly trimmed', () => {
  const check = capabilityCheck(PROVIDER_CATALOGUE.runway, PROVIDER_CATALOGUE.runway.models[0], { ...i2v, duration_seconds: 30 });
  assert.ok(check.refusals.some(r => r.code === REFUSALS.DURATION_UNSUPPORTED));
});

test('an unsupported resolution is refused and the supported set is shown', () => {
  const offer = buildOffer({ providerCode: 'runway', modelCode: 'gen4_turbo', request: { ...i2v, resolution: '3840x2160' }, catalogue: readyCatalogue() });
  assert.ok(offer.blocking.some(b => b.code === REFUSALS.RESOLUTION_UNSUPPORTED));
  assert.ok(offer.supported_resolutions.includes('1280x720'));
});

test('an operation the provider does not perform is refused', () => {
  const offer = buildOffer({ providerCode: 'runway', modelCode: 'gen4_turbo', request: { ...i2v, operation: OPERATIONS.VIDEO_TO_VIDEO }, catalogue: readyCatalogue() });
  assert.ok(offer.blocking.some(b => b.code === REFUSALS.OPERATION_UNSUPPORTED));
});

// ---- the central rule -------------------------------------------------------

test('a named provider that cannot serve is REFUSED — never silently swapped', () => {
  const catalogue = readyCatalogue();
  // Runway cannot do video-to-video; fal can.
  const result = selectProvider({ ...i2v, operation: OPERATIONS.VIDEO_TO_VIDEO, preferred_provider: 'runway' }, { catalogue });

  assert.equal(result.ok, false, 'the request must not proceed');
  assert.equal(result.offer, null, 'no job is composed');
  assert.equal(result.substituted, false);
  assert.ok(result.refusals.some(r => r.code === REFUSALS.SUBSTITUTION_REQUIRES_CONSENT));
  // the alternate is offered as a proposal, and it is fal
  assert.ok(result.alternates.some(a => a.provider_code === 'fal'));
});

test('a substitution proceeds only when the Chairman named the substitute', () => {
  const catalogue = readyCatalogue();
  const request = { ...i2v, operation: OPERATIONS.VIDEO_TO_VIDEO, preferred_provider: 'runway' };

  const refused = selectProvider(request, { catalogue });
  assert.equal(refused.ok, false);

  const consented = selectProvider(request, { catalogue, consentedSubstitution: 'fal' });
  assert.equal(consented.ok, true);
  assert.equal(consented.substituted, true);
  assert.equal(consented.consented_substitution, 'fal');
  assert.equal(consented.offer.provider_code, 'fal');
  // the original refusal reason is still carried, not erased
  assert.ok(consented.refusals.length > 0);
});

test('consent to one provider does not authorise a different one', () => {
  const catalogue = readyCatalogue();
  // Consent names a provider that also cannot serve -> still refused.
  const result = selectProvider(
    { ...i2v, operation: OPERATIONS.VIDEO_EXTEND, preferred_provider: 'fal' },
    { catalogue, consentedSubstitution: 'nonexistent-provider' }
  );
  assert.equal(result.ok, false);
  assert.equal(result.substituted, false);
});

test('with no provider named, automatic selection is allowed and disclosed', () => {
  const result = selectProvider(i2v, { catalogue: readyCatalogue() });
  assert.equal(result.ok, true);
  assert.equal(result.automatic, true);
  assert.equal(result.substituted, false);
  assert.ok(result.offer.provider_label, 'the chosen provider is still disclosed');
});

test('a request over budget is refused rather than downgraded', () => {
  const result = selectProvider({ ...i2v, preferred_provider: 'runway' }, { catalogue: readyCatalogue(), budgetMinor: 100 });
  assert.equal(result.ok, false);
  assert.ok(result.refusals.some(r => r.code === REFUSALS.OVER_BUDGET || r.code === REFUSALS.SUBSTITUTION_REQUIRES_CONSENT));
});

test('nothing is spendable while the catalogue ships unverified', () => {
  const result = selectProvider(i2v, {});          // real catalogue
  assert.equal(result.ok, false);
  assert.deepEqual(result.alternates, []);
});

// ---- job composition --------------------------------------------------------

test('a composed job is AWAITING_CONSENT, never queued straight to spend', () => {
  const offer = buildOffer({ providerCode: 'fal', modelCode: 'kling-video/v2/master/image-to-video', request: i2v, catalogue: readyCatalogue() });
  const row = toRenderJobRow({ offer, request: i2v, continuity: { snapshot: { format: 'THY-CONTINUITY-1' }, references: [] } });
  assert.equal(row.state, JOB_STATES.AWAITING_CONSENT);
  assert.equal(row.attempt_count, 0);
});

test('the job row maps onto the live studio_render_jobs columns', () => {
  const offer = buildOffer({ providerCode: 'fal', modelCode: 'kling-video/v2/master/image-to-video', request: i2v, catalogue: readyCatalogue() });
  const row = toRenderJobRow({ offer, request: i2v, continuity: { snapshot: {}, references: [] } });
  // these are the actual column names verified on thylora-dash
  for (const col of ['provider_code', 'model_code', 'operation_type', 'state', 'idempotency_key',
                     'prompt_payload', 'reference_payload', 'requested_duration_ms',
                     'estimated_cost', 'max_attempts', 'continuity_snapshot']) {
    assert.ok(col in row, `missing column ${col}`);
  }
  assert.equal(row.requested_duration_ms, 6000);
});

test('the idempotency key changes when the ask changes, so a re-ask is a new job', () => {
  const base = { sourceAssetId: 'A1', operation: 'IMAGE_TO_VIDEO', providerCode: 'fal', modelCode: 'm', durationSeconds: 6, resolution: '1280x720', promptHash: hashPrompt('a') };
  assert.equal(idempotencyKey(base), idempotencyKey({ ...base }));
  assert.notEqual(idempotencyKey(base), idempotencyKey({ ...base, promptHash: hashPrompt('b') }));
  assert.notEqual(idempotencyKey(base), idempotencyKey({ ...base, durationSeconds: 7 }));
});

test('the same ask twice yields one key, so a double tap cannot bill twice', () => {
  const offer = buildOffer({ providerCode: 'fal', modelCode: 'kling-video/v2/master/image-to-video', request: i2v, catalogue: readyCatalogue() });
  const a = toRenderJobRow({ offer, request: i2v, continuity: {} });
  const b = toRenderJobRow({ offer, request: i2v, continuity: {} });
  assert.equal(a.idempotency_key, b.idempotency_key);
});

test('terminal states stop the poller', () => {
  assert.equal(isTerminal(JOB_STATES.SUCCEEDED), true);
  assert.equal(isTerminal(JOB_STATES.FAILED), true);
  assert.equal(isTerminal(JOB_STATES.RUNNING), false);
});

// ---- money-distance ---------------------------------------------------------

test('money-distance from command to clip is measured on the same gate discipline', () => {
  const nothing = measureStore({ store_code: 'MEDIA', gates: MEDIA_ROUTER_GATES });
  assert.equal(nothing.distance, MEDIA_ROUTER_GATES.length);
  assert.equal(nothing.next_gate.code, 'ASSET_REGISTERED');

  // a gate only closes on evidence, never on an assertion
  const claimed = measureStore({
    store_code: 'MEDIA', gates: MEDIA_ROUTER_GATES,
    readings: { ASSET_REGISTERED: { state: GATE_STATES.SATISFIED } }   // no evidence_id
  });
  assert.equal(claimed.distance, MEDIA_ROUTER_GATES.length, 'an unevidenced claim closes nothing');

  const evidenced = measureStore({
    store_code: 'MEDIA', gates: MEDIA_ROUTER_GATES,
    readings: { ASSET_REGISTERED: { state: GATE_STATES.SATISFIED, evidence_id: 'ASSET-NIGHTSTEP-REFERENCE-20260824-001' } }
  });
  assert.equal(evidenced.distance, MEDIA_ROUTER_GATES.length - 1);
  assert.equal(evidenced.next_gate.code, 'CONTINUITY_CLEARED');
});

test('a capable but unfunded provider is named — "impossible" and "unfunded" differ', () => {
  // Real catalogue: nothing funded. Runway cannot do video-to-video; fal can,
  // but fal is blocked on money and credential, not on capability.
  const result = selectProvider({ ...i2v, operation: OPERATIONS.VIDEO_TO_VIDEO, preferred_provider: 'runway' }, {});
  assert.equal(result.ok, false);
  assert.deepEqual(result.alternates, [], 'nothing is runnable, so nothing is offered as a swap');
  assert.ok(result.capability_alternates.some(o => o.provider_code === 'fal'),
    'fal is capable and must still be named');

  const refusal = result.refusals.find(r => r.code === REFUSALS.SUBSTITUTION_REQUIRES_CONSENT);
  assert.match(refusal.detail, /fal\.ai is capable of it/);
  assert.match(refusal.detail, /RATE_CARD_UNVERIFIED/);
});

test('a provider blocked on capability is not listed as a capability alternate', () => {
  const result = selectProvider({ ...i2v, operation: OPERATIONS.VIDEO_EXTEND, preferred_provider: 'fal' }, {});
  // Only runway declares VIDEO_EXTEND, so fal must not appear as capable of it.
  assert.equal(result.capability_alternates.some(o => o.provider_code === 'fal'), false);
});
