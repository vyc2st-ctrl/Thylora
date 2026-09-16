// THYLORA APP · Media Studio rules
// Workroom: WR-THYAPP-001 · routes through WR-AI-ROUTING-001
//
// Chairman-only. The rules that decide what the studio may CLAIM live here, so
// the claim on screen is the claim under test.
//
// The hard rule this file exists to enforce:
//
//   NO MEDIA GENERATION CLAIM UNLESS THE PROVIDER RETURNED A SUCCESSFUL ASSET.
//
// A submitted job is not a generated asset. A router call that returned 200
// with no asset is not a generated asset. A job still running is not a
// generated asset. `generationClaim()` is the only function permitted to say a
// generation happened, and it says so only when the provider handed back a
// locatable asset.
//
// What is REUSED rather than rebuilt (see docs/THYLORA-APP-SHELL.md):
//   * the registered asset + version chain   → rael_media_assets
//   * parent/derivative provenance           → rael_provenance_events
//   * the continuity locks                   → rae-link/lib/pipeline.js publishGate()
//   * serial number + QR destination         → digital_product_passports
//   * the Chairman gate                      → thylora_is_chairman()
//   * margin notes                           → thylora_margin_note_add_v1
//   * approve / revise / reject              → submit_thylora_review_gate_decision_v1
//   * the publishing queue                   → thylora_edf_publish_v1
//   * generation itself                      → the thylora-ai-router Edge Function

import { publishGate } from '../../rae-link/lib/pipeline.js';

/* ------------------------------------------------------------------ router */
// The THYLORA Media Router. The dashboard reaches the same deployed function
// (declared as THYLORA_AI_ROUTER_FUNCTION in the dashboard's supabase-config.js
// and exercised by its system-health panel). Provider credentials are held
// server-side by the function; nothing here holds or stores one.
export const MEDIA_ROUTER_FUNCTION = 'thylora-ai-router';

/* ------------------------------------------------------------------- modes */
// Mode is the Chairman's instruction to the router about how to spend. The
// router chooses the provider; the studio never names one, so a provider change
// on the backend does not become a UI change here.
export const ANIMATE_MODES = Object.freeze([
  {
    code: 'AUTOMATIC',
    label: 'Automatic',
    detail: 'The router picks the route by what is available and healthy right now.',
    routing_preference: 'BALANCED'
  },
  {
    code: 'BUDGET',
    label: 'Budget',
    detail: 'Lowest cost route. Lower fidelity is accepted in exchange.',
    routing_preference: 'LOWEST_COST'
  },
  {
    code: 'BEST_FIDELITY',
    label: 'Best fidelity',
    detail: 'Highest quality route available, cost not minimised.',
    routing_preference: 'HIGHEST_QUALITY'
  }
]);

export const MODE_CODES = Object.freeze(ANIMATE_MODES.map(m => m.code));
export const DEFAULT_MODE = 'AUTOMATIC';

export function mode(code) {
  return ANIMATE_MODES.find(m => m.code === code) ?? null;
}

/* --------------------------------------------------------- job state machine */
export const JOB_STATES = Object.freeze([
  'DRAFT',        // composed on the device, not sent
  'SUBMITTED',    // handed to the router
  'ROUTING',      // router accepted, choosing/calling a provider
  'RUNNING',      // provider is working
  'RETURNED',     // provider answered — NOT yet known to be usable
  'FAILED',       // provider or router refused
  'REVIEW',       // a provider asset exists and is awaiting Chairman decision
  'APPROVED',
  'REVISION_REQUESTED',
  'REJECTED',
  'QUEUED_FOR_PUBLISH'
]);

const TRANSITIONS = Object.freeze({
  DRAFT: ['SUBMITTED'],
  SUBMITTED: ['ROUTING', 'FAILED'],
  ROUTING: ['RUNNING', 'RETURNED', 'FAILED'],
  RUNNING: ['RETURNED', 'FAILED'],
  // RETURNED splits on whether a usable asset actually came back.
  RETURNED: ['REVIEW', 'FAILED'],
  REVIEW: ['APPROVED', 'REVISION_REQUESTED', 'REJECTED'],
  // A revision re-enters the router as a new attempt on the same job.
  REVISION_REQUESTED: ['SUBMITTED'],
  APPROVED: ['QUEUED_FOR_PUBLISH'],
  REJECTED: [],
  FAILED: ['SUBMITTED'],
  QUEUED_FOR_PUBLISH: []
});

export const IN_FLIGHT_STATES = Object.freeze(['SUBMITTED', 'ROUTING', 'RUNNING']);

export function canTransition(from, to) {
  return Boolean(TRANSITIONS[from]?.includes(to));
}

export function isInFlight(state) {
  return IN_FLIGHT_STATES.includes(state);
}

/** Progress for the reader. Percentages are stage markers, not provider truth. */
export function jobProgress(job) {
  const state = job?.job_state ?? 'DRAFT';
  const percent = {
    DRAFT: 0, SUBMITTED: 10, ROUTING: 25, RUNNING: 60,
    RETURNED: 85, REVIEW: 90, APPROVED: 95, REVISION_REQUESTED: 90,
    REJECTED: 100, FAILED: 100, QUEUED_FOR_PUBLISH: 100
  }[state] ?? 0;
  return {
    state,
    percent,
    in_flight: isInFlight(state),
    // The stage label never implies an asset exists.
    label: {
      DRAFT: 'Not submitted',
      SUBMITTED: 'Handed to the THYLORA Media Router',
      ROUTING: 'Router is selecting a provider route',
      RUNNING: 'Provider is working',
      RETURNED: 'Provider answered — checking what came back',
      REVIEW: 'Waiting for your decision',
      APPROVED: 'Approved',
      REVISION_REQUESTED: 'Revision requested',
      REJECTED: 'Rejected',
      FAILED: 'Did not complete',
      QUEUED_FOR_PUBLISH: 'In the publishing queue'
    }[state] ?? state
  };
}

/* ------------------------------------------------- the generation claim rule */
/**
 * Decide what may be SAID about a job, and whether a result may be previewed.
 *
 * `generated` is true only when the provider returned an asset we can actually
 * locate. Everything else — submitted, routing, running, a 200 with an empty
 * body, a router error — is reported as not generated. This is the difference
 * between a media platform and a demo.
 *
 * @param job row from thy_media_animation_jobs
 * @returns { generated, previewable, claim, reason, asset }
 */
export function generationClaim(job) {
  const state = job?.job_state ?? 'DRAFT';
  const result = job?.provider_result ?? null;

  const refuse = (claim, reason) => ({
    generated: false, previewable: false, claim, reason, asset: null
  });

  if (!job) return refuse('No animation job.', 'NO_JOB');
  if (state === 'DRAFT') return refuse('Not submitted yet.', 'NOT_SUBMITTED');
  if (isInFlight(state)) {
    return refuse('Working. Nothing has been generated yet.', 'IN_FLIGHT');
  }
  if (state === 'FAILED') {
    return refuse(
      `Did not generate: ${job.failure_reason || 'the provider or router refused and gave no reason.'}`,
      'FAILED'
    );
  }
  if (state === 'REJECTED') {
    return refuse('Rejected by the Chairman. Nothing was published.', 'REJECTED');
  }

  // From here the job claims a provider answered. Verify the answer.
  if (!result || typeof result !== 'object') {
    return refuse(
      'The router answered but returned no provider result, so no media was generated.',
      'NO_PROVIDER_RESULT'
    );
  }
  if (String(result.status ?? '').toUpperCase() !== 'SUCCEEDED') {
    return refuse(
      `The provider did not report success (${result.status ?? 'no status'}), so no media was generated.`,
      'PROVIDER_NOT_SUCCEEDED'
    );
  }

  // A success with nothing to show is still not a generated asset.
  const asset = providerAsset(result);
  if (!asset) {
    return refuse(
      'The provider reported success but returned no locatable asset, so nothing can be previewed.',
      'NO_ASSET_RETURNED'
    );
  }

  return {
    generated: true,
    previewable: true,
    claim: `Provider returned an asset via ${result.model || 'an unnamed model'}.`,
    reason: null,
    asset
  };
}

/** Pull a locatable asset out of a provider result, or null. */
export function providerAsset(result) {
  if (!result || typeof result !== 'object') return null;
  const url = result.asset_url ?? result.output_url ?? result.url ?? null;
  const storageKey = result.storage_key ?? null;
  if (typeof url === 'string' && /^https?:\/\//i.test(url)) {
    return { kind: 'URL', url, mime: result.mime_type ?? null, bytes: result.byte_size ?? null };
  }
  if (typeof storageKey === 'string' && storageKey.trim()) {
    return { kind: 'STORAGE', storage_key: storageKey.trim(), mime: result.mime_type ?? null, bytes: result.byte_size ?? null };
  }
  return null;
}

/* -------------------------------------------------------- continuity locks */
// What must hold true before a derivative of this asset may be animated, and
// before the result may reach the publishing queue. The pipeline blockers come
// from the SAME publishGate() the RAE Link surface uses, so the locks the
// studio shows are the locks the pipeline enforces.

export const LOCK_SEVERITY = Object.freeze({ BLOCKING: 'BLOCKING', REQUIRED_BEFORE_PUBLISH: 'REQUIRED_BEFORE_PUBLISH' });

/**
 * @param asset   rael_media_assets row
 * @param context { rights, scan, renditions, captions, moderation, partnership,
 *                  accessibility_waiver, passport, requirements, provenance }
 */
export function continuityLocks(asset, context = {}) {
  const locks = [];
  const add = (code, detail, severity = LOCK_SEVERITY.BLOCKING) =>
    locks.push({ code, detail, severity });

  if (!asset) {
    add('ASSET_MISSING', 'No registered asset is open.');
    return summarise(locks, null);
  }

  // 1 · The pipeline's own gate, unmodified. publishGate() returns an envelope
  // { ready, blockers, ... }; the blockers are what the pipeline will refuse
  // publication for, so they are carried through verbatim rather than restated.
  const gate = publishGate(asset, context);
  for (const blocker of gate.blockers ?? []) {
    add(blocker.code, blocker.detail, LOCK_SEVERITY.REQUIRED_BEFORE_PUBLISH);
  }

  // 2 · Immutability of what is already published. A published version is never
  // overwritten; an animation produces a NEW version that records what it
  // replaces.
  if (String(asset.pipeline_state) === 'PUBLISHED') {
    add('PUBLISHED_VERSION_IMMUTABLE',
      `Version ${asset.version_no ?? 1} is published and cannot be altered. Animating creates a new version that records this one as its parent.`,
      LOCK_SEVERITY.REQUIRED_BEFORE_PUBLISH);
  }

  // 3 · Serial number and QR destination, carried by the passport.
  const passport = context.passport ?? null;
  if (!asset.passport_ref && !passport) {
    add('PASSPORT_MISSING',
      'No digital product passport is bound, so this asset has no serial number and no QR destination.');
  } else if (passport) {
    if (!passport.serial_number) add('SERIAL_MISSING', 'The bound passport carries no serial number.');
    if (!qrDestination(passport)) {
      add('QR_DESTINATION_MISSING', 'The bound passport declares no QR destination.');
    }
  }

  // 4 · Logo requirement. Declared per asset; absence is stated, never assumed
  // satisfied.
  const requirements = context.requirements ?? null;
  if (!requirements) {
    add('REQUIREMENTS_NOT_DECLARED',
      'No release requirements record exists for this asset, so the logo requirement is unknown.');
  } else if (requirements.logo_required === true && !requirements.logo_asset_ref) {
    add('LOGO_MISSING',
      'This asset requires the THYLORA logo and no logo asset is attached.');
  } else if (requirements.logo_required === null || requirements.logo_required === undefined) {
    add('LOGO_REQUIREMENT_UNSET', 'Whether this asset requires the logo has not been decided.');
  }

  // 5 · Provenance. A derivative must name its parent.
  const provenance = context.provenance ?? [];
  if ((asset.version_no ?? 1) > 1 || asset.replaces_asset_id) {
    const derived = provenance.some(e =>
      ['DERIVED', 'AI_ASSISTED'].includes(String(e.event_type)) && e.derived_from_ref);
    if (!derived) {
      add('PROVENANCE_PARENT_MISSING',
        'This is a derivative version but no provenance event names the parent it was derived from.');
    }
  }
  if (provenance.some(e => String(e.event_type) === 'AI_ASSISTED' && !e.tool_disclosure)) {
    add('TOOL_DISCLOSURE_MISSING',
      'An AI-assisted provenance event carries no tool disclosure.');
  }

  return summarise(locks, gate);
}

function summarise(locks, gate = null) {
  const blocking = locks.filter(l => l.severity === LOCK_SEVERITY.BLOCKING);
  return {
    gate_ready: gate ? Boolean(gate.ready) : null,
    gate_checked_at: gate?.checked_at ?? null,
    locks,
    blocking,
    before_publish: locks.filter(l => l.severity === LOCK_SEVERITY.REQUIRED_BEFORE_PUBLISH),
    // Animating is allowed with publish-time blockers outstanding — you may
    // animate a draft. It is refused when a lock would break provenance or
    // serialisation, because those cannot be repaired after the fact.
    can_animate: blocking.length === 0,
    can_queue_for_publish: locks.length === 0,
    state: locks.length === 0 ? 'CLEAR' : blocking.length ? 'BLOCKED' : 'PUBLISH_BLOCKED'
  };
}

/** The QR destination a passport declares, or null. Never invented. */
export function qrDestination(passport) {
  if (!passport || typeof passport !== 'object') return null;
  const value = passport.qr_destination ?? passport.qr_url ?? null;
  return typeof value === 'string' && /^https?:\/\//i.test(value) ? value : null;
}

/* ------------------------------------------------------------- router calls */
/**
 * Build the request envelope handed to the THYLORA Media Router.
 *
 * No provider is named: `mode` expresses the Chairman's cost/fidelity
 * instruction and the router selects the route. No credential is included —
 * the function reads the provider secret server-side.
 */
export function animateRequest({ asset, modeCode = DEFAULT_MODE, instruction = '', markupRef = null }) {
  if (!asset?.asset_code) throw new Error('An asset with an asset_code is required.');
  const chosen = mode(modeCode);
  if (!chosen) throw new Error(`Unknown animate mode: ${modeCode}`);

  return {
    task: 'ANIMATE_MEDIA',
    mode: chosen.code,
    routing_preference: chosen.routing_preference,
    asset_code: asset.asset_code,
    // The parent this derivative comes from, so provenance survives the round
    // trip through the router.
    parent_asset_code: asset.asset_code,
    parent_version_no: asset.version_no ?? 1,
    parent_checksum_sha256: asset.checksum_sha256 ?? null,
    instruction: String(instruction ?? '').trim() || null,
    markup_ref: markupRef,
    // Asks the router to report rather than raise, matching the THYLORA
    // convention that a refusal must be legible in the UI.
    prefer_reason_over_error: true
  };
}

/**
 * Read a router response into a job update.
 *
 * The router's confirmed contract (from the dashboard's system-health panel) is
 * { status, response_text, failure_reason, model, http_status, latency_ms,
 *   audit_canonical_id }. A media task may extend it; anything absent is
 * treated as absent, never as success.
 */
export function readRouterResponse(response) {
  if (!response || typeof response !== 'object') {
    return {
      job_state: 'FAILED',
      failure_reason: 'The router returned no readable response.',
      provider_result: null,
      audit_canonical_id: null
    };
  }

  const status = String(response.status ?? '').toUpperCase();
  const audit = response.audit_canonical_id ?? null;

  if (status === 'FAILED' || response.failure_reason) {
    return {
      job_state: 'FAILED',
      failure_reason: response.failure_reason || `Router reported ${status || 'no status'}.`,
      provider_result: response,
      audit_canonical_id: audit
    };
  }

  // Accepted but still working.
  if (['QUEUED', 'ROUTING', 'ACCEPTED'].includes(status)) {
    return { job_state: 'ROUTING', failure_reason: null, provider_result: response, audit_canonical_id: audit };
  }
  if (['RUNNING', 'IN_PROGRESS'].includes(status)) {
    return { job_state: 'RUNNING', failure_reason: null, provider_result: response, audit_canonical_id: audit };
  }

  if (status === 'SUCCEEDED') {
    // Success is recorded as RETURNED, not REVIEW. Only generationClaim()
    // deciding an asset is real moves it to REVIEW.
    return { job_state: 'RETURNED', failure_reason: null, provider_result: response, audit_canonical_id: audit };
  }

  return {
    job_state: 'FAILED',
    failure_reason: `The router returned an unrecognised status (${response.status ?? 'none'}), so nothing is claimed.`,
    provider_result: response,
    audit_canonical_id: audit
  };
}

/** The state a RETURNED job settles into once its result is inspected. */
export function settleReturnedJob(job) {
  const claim = generationClaim({ ...job, job_state: 'RETURNED' });
  return claim.generated
    ? { job_state: 'REVIEW', failure_reason: null }
    : { job_state: 'FAILED', failure_reason: claim.claim };
}

/* ----------------------------------------------------------- Pencil markup */
// A markup is a set of vector strokes drawn over one frame of the result. It is
// stored as vectors, not a flattened screenshot, so the Chairman's marks stay
// re-renderable at any zoom and machine-readable by whoever does the revision.

export const PEN_POINTER = 'pen';

/** Normalise a stroke point. Coordinates are frame-relative 0..1. */
export function markupPoint(event, frame) {
  const width = frame?.width || 1;
  const height = frame?.height || 1;
  const clamp = v => Math.min(1, Math.max(0, v));
  return {
    x: Number(clamp(((event.clientX ?? 0) - (frame?.left ?? 0)) / width).toFixed(4)),
    y: Number(clamp(((event.clientY ?? 0) - (frame?.top ?? 0)) / height).toFixed(4)),
    // A real Apple Pencil reports graded pressure. A finger or mouse reports
    // 0 or exactly 0.5, which is not a measurement and is recorded as null so
    // nothing later mistakes it for one.
    pressure: event.pointerType === PEN_POINTER && event.pressure > 0 && event.pressure !== 0.5
      ? Number(Number(event.pressure).toFixed(3))
      : null,
    tilt: event.pointerType === PEN_POINTER && Number.isFinite(event.tiltX)
      ? { x: event.tiltX, y: event.tiltY }
      : null
  };
}

export function isPencil(event) {
  return event?.pointerType === PEN_POINTER;
}

/** Summarise a markup for storage and for the revision request. */
export function markupSummary(strokes = []) {
  const clean = strokes.filter(s => Array.isArray(s?.points) && s.points.length > 0);
  const points = clean.reduce((sum, s) => sum + s.points.length, 0);
  const pencilStrokes = clean.filter(s => s.pointer_type === PEN_POINTER).length;
  return {
    strokes: clean.length,
    points,
    pencil_strokes: pencilStrokes,
    // Stated honestly: a markup drawn with a finger is still a markup, but it
    // is not recorded as Pencil input.
    input_kinds: [...new Set(clean.map(s => s.pointer_type).filter(Boolean))],
    empty: clean.length === 0
  };
}

/**
 * Assemble a revision request.
 *
 * The note goes to the canonical Live Margin function
 * `thylora_margin_note_add_v1`, so a Chairman revision lands in the SAME margin
 * queue the dashboard reconciles — not a second notes system. The markup rides
 * in `p_anchor_context`, which is the function's existing jsonb extension
 * point, with the strokes themselves stored under `markup_ref`.
 */
export function revisionRequest({ job, asset, note, markupRef = null, strokes = [], frameRef = null, playbackMs = null }) {
  const text = String(note ?? '').trim();
  const summary = markupSummary(strokes);

  if (!text && summary.empty) {
    return { ok: false, reason: 'A revision needs either a written note or a markup over the frame.' };
  }
  if (!job?.job_code) return { ok: false, reason: 'A revision must name the animation job it revises.' };

  // The body always states whether a markup is attached, so a reader of the
  // margin queue is never left guessing what "see markup" refers to.
  const body = [
    text || 'Revision requested by markup.',
    summary.empty
      ? null
      : `[Markup attached · ${summary.strokes} stroke${summary.strokes === 1 ? '' : 's'}, ${summary.points} points, ${summary.pencil_strokes} drawn with Apple Pencil · ${markupRef ?? 'stored with this revision'}]`
  ].filter(Boolean).join('\n\n');

  return {
    ok: true,
    reason: null,
    summary,
    payload: {
      p_anchor_kind: 'MEDIA_FRAME',
      p_anchor_ref: frameRef ?? job.job_code,
      p_body: body,
      p_source_mode: summary.pencil_strokes > 0 ? 'MARKUP' : (text ? 'TEXT' : 'MARKUP'),
      p_playback_position_ms: Number.isFinite(playbackMs) ? Math.round(playbackMs) : null,
      p_anchor_context: {
        detected_by: 'MEDIA_STUDIO',
        job_code: job.job_code,
        asset_code: asset?.asset_code ?? null,
        parent_version_no: asset?.version_no ?? null,
        markup_ref: markupRef,
        markup: summary,
        screen: '/thylora-app#media-studio',
        at: new Date().toISOString()
      }
    }
  };
}

/* ------------------------------------------------------ Chairman decisions */
export const DECISIONS = Object.freeze(['APPROVE', 'REVISE', 'REJECT']);

/**
 * Map a studio decision onto the canonical review-gate decision.
 *
 * `submit_thylora_review_gate_decision_v1` already records the actor, the
 * timestamp, the gate and the evidence in the append-only ledger
 * `thylora_chairman_review_decisions`. The studio adds no second decision
 * ledger — it writes to that one.
 */
export function decisionPayload({ decision, gateCanonicalId, note = null, job = null }) {
  const upper = String(decision ?? '').toUpperCase();
  if (!DECISIONS.includes(upper)) {
    return { ok: false, reason: `Unknown decision: ${decision}` };
  }
  if (!gateCanonicalId) {
    return { ok: false, reason: 'This result has no review gate, so a decision cannot be recorded against it.' };
  }
  // A revision must say what to change, or it is not actionable.
  if (upper === 'REVISE' && !String(note ?? '').trim()) {
    return { ok: false, reason: 'A revision request needs a note or a markup.' };
  }

  return {
    ok: true,
    reason: null,
    next_state: { APPROVE: 'APPROVED', REVISE: 'REVISION_REQUESTED', REJECT: 'REJECTED' }[upper],
    payload: {
      p_canonical_id: gateCanonicalId,
      // CHANGES_REQUESTED is the canonical decision that reopens a gate.
      p_decision: { APPROVE: 'APPROVED', REVISE: 'CHANGES_REQUESTED', REJECT: 'REJECTED' }[upper],
      p_note: [
        String(note ?? '').trim() || null,
        job?.job_code ? `Media Studio job ${job.job_code}` : null
      ].filter(Boolean).join(' · ') || null
    }
  };
}

/* --------------------------------------------------------- publishing queue */
/**
 * Whether an approved result may be sent to the publishing queue, and the
 * provenance that must be written with it.
 *
 * The queue itself is the existing EDF release path (`thylora_edf_publish_v1`,
 * which freezes release metadata). Nothing here publishes; it hands over.
 */
export function publishHandoff({ job, asset, locks, passport, requirements }) {
  const claim = generationClaim(job);
  const problems = [];

  if (!claim.generated) problems.push(claim.claim);
  if (job?.job_state !== 'APPROVED') {
    problems.push(`The result is ${jobProgress(job).label.toLowerCase()}, not approved.`);
  }
  if (locks && !locks.can_queue_for_publish) {
    problems.push(`${locks.locks.length} continuity lock${locks.locks.length === 1 ? '' : 's'} still outstanding.`);
  }
  if (!asset?.edf_ref) {
    problems.push('This asset is not bound to an EDF package, so there is no publishing queue entry to hand it to.');
  }

  if (problems.length) {
    return { ok: false, problems, provenance: null, payload: null };
  }

  return {
    ok: true,
    problems: [],
    // Written to rael_provenance_events so the derivative names its parent and
    // discloses the tool. The prior version is never overwritten.
    provenance: {
      event_type: 'AI_ASSISTED',
      source_description:
        `Animated from ${asset.asset_code} version ${asset.version_no ?? 1} through the THYLORA Media Router in ${job.mode} mode.`,
      derived_from_ref: asset.asset_code,
      tool_disclosure:
        `THYLORA Media Router (${MEDIA_ROUTER_FUNCTION}) · ${job.provider_result?.model || 'model not reported'} · router audit ${job.audit_canonical_id || 'not recorded'}`,
      occurred_at: new Date().toISOString(),
      evidence: {
        job_code: job.job_code,
        mode: job.mode,
        router_audit_canonical_id: job.audit_canonical_id ?? null,
        parent_checksum_sha256: asset.checksum_sha256 ?? null,
        parent_version_no: asset.version_no ?? 1,
        serial_number: passport?.serial_number ?? null,
        qr_destination: qrDestination(passport),
        logo_required: requirements?.logo_required ?? null,
        logo_asset_ref: requirements?.logo_asset_ref ?? null
      }
    },
    payload: { p_edf_code: asset.edf_ref }
  };
}
