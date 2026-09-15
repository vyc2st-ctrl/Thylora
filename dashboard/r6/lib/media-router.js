// THYLORA MEDIA ROUTER · provider-agnostic core
// Canonical backend records: THY-DASH-VOICE-SPINE-001,
//   THY-IDEA-DASHBOARD-SCREEN-ARCHITECTURE-001
// Authoritative backend: thylora-dash (jvsdxhrfhtlgaknhjxlz)
//
// THIS MODULE DOES NOT CREATE A PIPELINE. The backend already has one.
//
// `studio_render_jobs` and `studio_render_attempts` exist on thylora-dash and
// already carry provider_code, model_code, operation_type, state,
// idempotency_key, prompt_payload, reference_payload, estimated_cost,
// actual_cost, continuity_snapshot and output_asset_id. Both tables have zero
// rows: the router was designed and never driven. This module is the missing
// driver, not a second pipeline. Every job it describes maps 1:1 onto those
// existing columns, and `toRenderJobRow` is the only place that mapping lives.
//
// The rule this module exists to enforce:
//
//   A provider is never silently substituted.
//
// `selectProvider` will return a substitution as a REFUSAL carrying the reason
// and the alternate, never as a quiet swap. The caller must obtain Chairman
// consent and re-ask naming the alternate explicitly. There is no code path
// that spends money on a provider the Chairman was not shown.

export const OPERATIONS = Object.freeze({
  IMAGE_TO_VIDEO: 'IMAGE_TO_VIDEO',
  VIDEO_TO_VIDEO: 'VIDEO_TO_VIDEO',
  TEXT_TO_VIDEO: 'TEXT_TO_VIDEO',
  VIDEO_EXTEND: 'VIDEO_EXTEND'
});

/** Job states. Mirrors what a driver writes into studio_render_jobs.state. */
export const JOB_STATES = Object.freeze({
  DRAFT: 'DRAFT',                   // composed, nothing sent, nothing owed
  AWAITING_CONSENT: 'AWAITING_CONSENT', // offer shown, Chairman has not approved the spend
  QUEUED: 'QUEUED',
  SUBMITTED: 'SUBMITTED',
  RUNNING: 'RUNNING',
  SUCCEEDED: 'SUCCEEDED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED'
});

export const TERMINAL_STATES = Object.freeze([
  JOB_STATES.SUCCEEDED, JOB_STATES.FAILED, JOB_STATES.CANCELLED
]);

/** Why a provider cannot serve a request. Each is shown, never swallowed. */
export const REFUSALS = Object.freeze({
  OPERATION_UNSUPPORTED: 'OPERATION_UNSUPPORTED',
  RESOLUTION_UNSUPPORTED: 'RESOLUTION_UNSUPPORTED',
  DURATION_UNSUPPORTED: 'DURATION_UNSUPPORTED',
  AUDIO_UNSUPPORTED: 'AUDIO_UNSUPPORTED',
  RATE_CARD_UNVERIFIED: 'RATE_CARD_UNVERIFIED',
  NO_CREDENTIAL: 'NO_CREDENTIAL',
  OVER_BUDGET: 'OVER_BUDGET',
  PROVIDER_DISABLED: 'PROVIDER_DISABLED',
  SUBSTITUTION_REQUIRES_CONSENT: 'SUBSTITUTION_REQUIRES_CONSENT',
  CONTINUITY_NOT_CLEARED: 'CONTINUITY_NOT_CLEARED'
});

/**
 * The provider catalogue.
 *
 * Every entry declares what it can do and what it costs. Two fields carry the
 * honesty of this whole surface:
 *
 *   `rate_card.verified_at` — null until a human has checked the published
 *     price against the provider's own page on that date. A null here BLOCKS
 *     paid generation (see `priceOffer`). This build has verified nothing, so
 *     every rate card ships null and the router refuses to spend until the
 *     Chairman confirms the numbers. An invented price that looks confident is
 *     worse than no price.
 *
 *   `credential_state` — 'ABSENT' until a key exists in backend secrets. This
 *     repository holds no provider credentials and must never hold one.
 *
 * Adding a provider is adding an entry here plus an adapter. Nothing else in
 * the router names a vendor.
 */
export const PROVIDER_CATALOGUE = Object.freeze({
  runway: Object.freeze({
    provider_code: 'runway',
    label: 'Runway',
    operations: [OPERATIONS.IMAGE_TO_VIDEO, OPERATIONS.TEXT_TO_VIDEO, OPERATIONS.VIDEO_EXTEND],
    models: Object.freeze([
      { model_code: 'gen4_turbo', label: 'Gen-4 Turbo', max_duration_s: 10, resolutions: ['1280x720', '720x1280', '1104x832'], audio: false },
      { model_code: 'gen4_aleph', label: 'Gen-4 Aleph', max_duration_s: 10, resolutions: ['1280x720', '720x1280'], audio: false }
    ]),
    rate_card: Object.freeze({
      unit: 'SECOND_OF_OUTPUT',
      currency: 'USD',
      minor_per_unit: null,      // unknown until verified
      verified_at: null,
      source_note: 'Runway publishes credit pricing; credits must be converted to currency by the Chairman before any spend.'
    }),
    credential_state: 'ABSENT',
    enabled: true
  }),
  fal: Object.freeze({
    provider_code: 'fal',
    label: 'fal.ai',
    operations: [OPERATIONS.IMAGE_TO_VIDEO, OPERATIONS.TEXT_TO_VIDEO, OPERATIONS.VIDEO_TO_VIDEO],
    models: Object.freeze([
      { model_code: 'kling-video/v2/master/image-to-video', label: 'Kling v2 Master (i2v)', max_duration_s: 10, resolutions: ['1280x720'], audio: false },
      { model_code: 'minimax/hailuo-02/standard/image-to-video', label: 'Hailuo 02 Standard (i2v)', max_duration_s: 10, resolutions: ['1280x720'], audio: false },
      { model_code: 'veo3/image-to-video', label: 'Veo 3 (i2v, audio)', max_duration_s: 8, resolutions: ['1280x720'], audio: true }
    ]),
    rate_card: Object.freeze({
      unit: 'SECOND_OF_OUTPUT',
      currency: 'USD',
      minor_per_unit: null,
      verified_at: null,
      source_note: 'fal.ai prices per model and per second; each model needs its own verified rate before use.'
    }),
    credential_state: 'ABSENT',
    enabled: true
  })
});

/** Providers that can be named in a request. */
export const PROVIDER_CODES = Object.freeze(Object.keys(PROVIDER_CATALOGUE));

const asArray = v => (Array.isArray(v) ? v : []);

/**
 * Can this provider/model serve this request at all? Capability only — money is
 * a separate gate, because a capability failure and a money failure need
 * different answers from the Chairman.
 */
export function capabilityCheck(provider, model, request) {
  const refusals = [];
  if (!provider.enabled) refusals.push({ code: REFUSALS.PROVIDER_DISABLED, detail: `${provider.label} is disabled.` });
  if (!asArray(provider.operations).includes(request.operation)) {
    refusals.push({ code: REFUSALS.OPERATION_UNSUPPORTED, detail: `${provider.label} does not perform ${request.operation}.` });
  }
  if (request.resolution && !asArray(model.resolutions).includes(request.resolution)) {
    refusals.push({
      code: REFUSALS.RESOLUTION_UNSUPPORTED,
      detail: `${model.label} supports ${asArray(model.resolutions).join(', ') || 'no declared resolution'}, not ${request.resolution}.`
    });
  }
  if (request.duration_seconds != null && request.duration_seconds > model.max_duration_s) {
    refusals.push({
      code: REFUSALS.DURATION_UNSUPPORTED,
      detail: `${model.label} caps at ${model.max_duration_s}s; ${request.duration_seconds}s was asked for.`
    });
  }
  if (request.audio_required && !model.audio) {
    refusals.push({ code: REFUSALS.AUDIO_UNSUPPORTED, detail: `${model.label} returns no audio track.` });
  }
  return { ok: refusals.length === 0, refusals };
}

/**
 * Price an offer.
 *
 * Returns `estimated_minor: null` when the rate card is unverified, and marks
 * the offer unspendable. The router would rather say "I do not know what this
 * costs" than show the Chairman a number nobody checked.
 */
export function priceOffer(provider, model, request) {
  const card = provider.rate_card || {};
  const seconds = Number(request.duration_seconds) || 0;
  if (!card.verified_at || card.minor_per_unit == null) {
    return {
      estimated_minor: null,
      currency: card.currency || 'USD',
      spendable: false,
      basis: card.unit || 'UNKNOWN',
      reason: REFUSALS.RATE_CARD_UNVERIFIED,
      note: card.source_note || 'No verified rate card for this provider.'
    };
  }
  return {
    estimated_minor: Math.ceil(card.minor_per_unit * seconds),
    currency: card.currency,
    spendable: true,
    basis: card.unit,
    reason: null,
    note: `Rate card verified ${card.verified_at}.`
  };
}

/**
 * The disclosure the Chairman sees BEFORE any paid generation.
 *
 * Every field he asked to see is mandatory here: provider, estimated cost,
 * expected duration, supported resolution, and whether audio is included.
 * `blocking` is what stands between this offer and a spend.
 */
export function buildOffer({ providerCode, modelCode, request, catalogue = PROVIDER_CATALOGUE }) {
  const provider = catalogue[providerCode];
  if (!provider) return null;
  const model = asArray(provider.models).find(m => m.model_code === modelCode) || provider.models[0];
  if (!model) return null;

  const capability = capabilityCheck(provider, model, request);
  const price = priceOffer(provider, model, request);
  const blocking = [...capability.refusals];
  if (!price.spendable) blocking.push({ code: price.reason, detail: price.note });
  if (provider.credential_state !== 'PRESENT') {
    blocking.push({ code: REFUSALS.NO_CREDENTIAL, detail: `No ${provider.label} credential is held by the backend.` });
  }

  return {
    provider_code: provider.provider_code,
    provider_label: provider.label,
    model_code: model.model_code,
    model_label: model.label,
    operation: request.operation,
    // The five disclosures, always present, never inferred at render time.
    estimated_cost_minor: price.estimated_minor,
    estimated_cost_currency: price.currency,
    estimated_cost_basis: price.basis,
    expected_duration_seconds: Math.min(Number(request.duration_seconds) || 0, model.max_duration_s),
    requested_duration_seconds: Number(request.duration_seconds) || 0,
    resolution: request.resolution || model.resolutions[0] || null,
    supported_resolutions: [...asArray(model.resolutions)],
    audio_included: !!model.audio,
    audio_requested: !!request.audio_required,
    rate_card_verified: !!provider.rate_card?.verified_at,
    credential_present: provider.credential_state === 'PRESENT',
    blocking,
    spendable: blocking.length === 0,
    statement: blocking.length === 0
      ? `${provider.label} · ${model.label} · ${request.operation} · ${price.estimated_minor != null ? (price.estimated_minor / 100).toFixed(2) + ' ' + price.currency : 'cost unknown'} · audio ${model.audio ? 'included' : 'not included'}`
      : `${provider.label} · ${model.label} cannot run yet: ${blocking.map(b => b.code).join(', ')}.`
  };
}

/** Every offer the catalogue can make for a request, best-capability first. */
export function allOffers(request, catalogue = PROVIDER_CATALOGUE) {
  const offers = [];
  for (const provider of Object.values(catalogue)) {
    for (const model of asArray(provider.models)) {
      const offer = buildOffer({ providerCode: provider.provider_code, modelCode: model.model_code, request, catalogue });
      if (offer) offers.push(offer);
    }
  }
  return offers.sort((a, b) => Number(b.spendable) - Number(a.spendable) || a.blocking.length - b.blocking.length);
}

/**
 * Choose a provider.
 *
 * The contract the Chairman set, enforced here:
 *
 *   - He names a provider  → that provider is used, or the request is REFUSED
 *     with the reason. An alternate is offered as a proposal he must accept; it
 *     is never applied on his behalf.
 *   - He names none        → automatic selection is allowed, and the chosen
 *     provider is still disclosed in the offer before any spend.
 *
 * `substituted` is never true without `consented_substitution` naming exactly
 * the provider the Chairman agreed to.
 */
export function selectProvider(request, {
  catalogue = PROVIDER_CATALOGUE,
  consentedSubstitution = null,
  budgetMinor = null
} = {}) {
  const offers = allOffers(request, catalogue);
  const usable = offers.filter(o => o.spendable);

  // A provider that CAN perform the operation but is blocked on money or a
  // credential is still worth naming. Telling the Chairman only "no" hides the
  // fact that the work is possible and the obstacle is a rate card, not a
  // capability — which is the difference between "impossible" and "unfunded".
  const capabilityOnly = offers.filter(o =>
    !o.spendable &&
    !o.blocking.some(b => [
      REFUSALS.OPERATION_UNSUPPORTED, REFUSALS.RESOLUTION_UNSUPPORTED,
      REFUSALS.DURATION_UNSUPPORTED, REFUSALS.AUDIO_UNSUPPORTED,
      REFUSALS.PROVIDER_DISABLED
    ].includes(b.code)));

  const withinBudget = offer => budgetMinor == null
    || offer.estimated_cost_minor == null
    || offer.estimated_cost_minor <= budgetMinor;

  // Chairman named a provider.
  if (request.preferred_provider) {
    const preferred = offers.filter(o => o.provider_code === request.preferred_provider);
    const ready = preferred.find(o => o.spendable && withinBudget(o));
    if (ready) {
      return { ok: true, offer: ready, substituted: false, alternates: usable.filter(o => o !== ready), capability_alternates: capabilityOnly, refusals: [] };
    }
    const overBudget = preferred.find(o => o.spendable && !withinBudget(o));
    const blocked = overBudget
      ? [{ code: REFUSALS.OVER_BUDGET, detail: `${overBudget.provider_label} estimates ${overBudget.estimated_cost_minor} minor units, over the ${budgetMinor} budget.` }]
      : (preferred[0]?.blocking || [{ code: REFUSALS.PROVIDER_DISABLED, detail: `${request.preferred_provider} is not in the catalogue.` }]);

    // An alternate is only used when the Chairman has already named it.
    if (consentedSubstitution) {
      const agreed = usable.find(o => o.provider_code === consentedSubstitution && withinBudget(o));
      if (agreed) {
        return {
          ok: true, offer: agreed, substituted: true,
          consented_substitution: consentedSubstitution,
          alternates: usable.filter(o => o !== agreed), capability_alternates: capabilityOnly, refusals: blocked
        };
      }
    }
    return {
      ok: false,
      offer: null,
      substituted: false,
      refusals: [
        ...blocked,
        {
          code: REFUSALS.SUBSTITUTION_REQUIRES_CONSENT,
          detail: usable.length
            ? `${request.preferred_provider} cannot run this. ${usable[0].provider_label} can. The Chairman must name the substitute — it will not be chosen for him.`
            : capabilityOnly.length
              ? `${request.preferred_provider} cannot run this. ${capabilityOnly.filter(o => o.provider_code !== request.preferred_provider).map(o => o.provider_label).join(', ') || 'another provider'} is capable of it but is itself blocked on ${[...new Set(capabilityOnly.flatMap(o => o.blocking.map(b => b.code)))].join(', ')}. No substitute can be offered until that clears.`
              : `${request.preferred_provider} cannot run this and no other provider in the catalogue can either.`
        }
      ],
      alternates: usable,
      capability_alternates: capabilityOnly.filter(o => o.provider_code !== request.preferred_provider)
    };
  }

  // No provider named: automatic selection is permitted, and still disclosed.
  const automatic = usable.find(withinBudget);
  if (automatic) {
    return { ok: true, offer: automatic, substituted: false, automatic: true, alternates: usable.filter(o => o !== automatic), capability_alternates: capabilityOnly, refusals: [] };
  }
  return {
    ok: false, offer: null, substituted: false,
    refusals: offers.length
      ? [{ code: offers[0].blocking[0]?.code || REFUSALS.PROVIDER_DISABLED, detail: 'No provider in the catalogue can run this request yet.', blocking: offers[0].blocking }]
      : [{ code: REFUSALS.PROVIDER_DISABLED, detail: 'The provider catalogue is empty.' }],
    alternates: [],
    capability_alternates: capabilityOnly
  };
}

/**
 * A stable idempotency key.
 *
 * `studio_render_jobs.idempotency_key` is UNIQUE in the live schema, so a
 * double-tap on Generate cannot bill the Chairman twice: the second insert
 * collides and is rejected by the database rather than by a UI guard that a
 * reload would forget.
 */
export function idempotencyKey({ sourceAssetId, operation, providerCode, modelCode, durationSeconds, resolution, promptHash }) {
  return [
    'THY-RJ', sourceAssetId || 'NOSRC', operation, providerCode, modelCode,
    `${durationSeconds || 0}s`, resolution || 'native', promptHash || 'noprompt'
  ].join('|');
}

/** Cheap stable hash for prompt payloads, so the key changes when the ask does. */
export function hashPrompt(text) {
  const s = String(text ?? '');
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 0x01000193) >>> 0;
  return h.toString(16).padStart(8, '0');
}

/**
 * Map an accepted offer onto the EXISTING studio_render_jobs row shape.
 *
 * This is the only place the router touches that table's column names. If the
 * backend shape changes, one function changes.
 */
export function toRenderJobRow({ offer, request, continuity, productionId = null, sceneId = null }) {
  const promptHash = hashPrompt(request.prompt || '');
  return {
    production_id: productionId,
    scene_id: sceneId,
    provider_code: offer.provider_code,
    model_code: offer.model_code,
    operation_type: offer.operation,
    state: JOB_STATES.AWAITING_CONSENT,   // never QUEUED without an explicit approval step
    priority: request.priority || 'NORMAL',
    idempotency_key: idempotencyKey({
      sourceAssetId: request.source_asset_id,
      operation: offer.operation,
      providerCode: offer.provider_code,
      modelCode: offer.model_code,
      durationSeconds: offer.expected_duration_seconds,
      resolution: offer.resolution,
      promptHash
    }),
    prompt_payload: {
      prompt: request.prompt || '',
      prompt_hash: promptHash,
      negative_prompt: request.negative_prompt || null,
      seed: request.seed ?? null
    },
    reference_payload: {
      source_asset_id: request.source_asset_id || null,
      source_kind: request.source_kind || null,
      // The master still is referenced, never uploaded away from its record.
      master_visual_asset_id: request.master_visual_asset_id || null,
      character_references: continuity?.references || []
    },
    requested_duration_ms: Math.round((offer.expected_duration_seconds || 0) * 1000),
    requested_fps: request.fps || null,
    estimated_cost: offer.estimated_cost_minor,
    attempt_count: 0,
    max_attempts: request.max_attempts || 3,
    continuity_snapshot: continuity?.snapshot || null
  };
}

/** Is this state final? Used by the poller to stop asking. */
export function isTerminal(state) { return TERMINAL_STATES.includes(state); }

/**
 * Money-distance gates for the media router, in the order money and work pass
 * through them. Consumed by lib/money-distance.js `measureStore`, which already
 * enforces that a gate closes on an evidence record and never on an assertion.
 */
export const MEDIA_ROUTER_GATES = Object.freeze([
  { code: 'ASSET_REGISTERED',    label: 'Source asset registered in THYLORA',      evidence: 'assets / thylora_visual_assets' },
  { code: 'CONTINUITY_CLEARED',  label: 'Character references approved for generation', evidence: 'studio_character_reference_assets' },
  { code: 'PROVIDER_CATALOGUED', label: 'Provider adapter present',                evidence: 'media-router catalogue' },
  { code: 'RATE_CARD_VERIFIED',  label: 'Provider rate card verified',             evidence: 'rate_card.verified_at' },
  { code: 'CREDENTIAL_HELD',     label: 'Provider credential in backend secrets',  evidence: 'backend secret' },
  { code: 'BUDGET_AUTHORISED',   label: 'Chairman authorised the spend',           evidence: 'approval_queue' },
  { code: 'JOB_ACCEPTED',        label: 'Provider accepted the job',               evidence: 'studio_render_attempts.provider_request_id' },
  { code: 'RESULT_INGESTED',     label: 'Clip ingested as a derivative',           evidence: 'thylora_visual_assets' },
  { code: 'PROVENANCE_REGISTERED', label: 'Provenance and serial registered',      evidence: 'thylora_visual_provenance / vlegh_registry' },
  { code: 'CHAIRMAN_APPROVED',   label: 'Chairman approved the clip',              evidence: 'thylora_visual_approvals' }
]);
