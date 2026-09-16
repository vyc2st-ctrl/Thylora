// THYLORA APP · Media Studio rule tests
// Workroom: WR-THYAPP-001
//
// The rule this file exists to hold down:
//   NO MEDIA GENERATION CLAIM UNLESS THE PROVIDER RETURNED A SUCCESSFUL ASSET.
// Every way a job can look successful without being successful is tested here.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  MEDIA_ROUTER_FUNCTION, ANIMATE_MODES, MODE_CODES, DEFAULT_MODE, mode,
  JOB_STATES, canTransition, isInFlight, jobProgress,
  generationClaim, providerAsset, settleReturnedJob,
  continuityLocks, qrDestination, LOCK_SEVERITY,
  animateRequest, readRouterResponse,
  markupPoint, markupSummary, isPencil, revisionRequest,
  decisionPayload, DECISIONS, publishHandoff
} from '../thylora-app/lib/media-studio.js';

/* ------------------------------------------------------------------ fixtures */
const ASSET = Object.freeze({
  id: 'a-1', asset_code: 'RAEL-ASSET-0001', title: 'Ouidah plate 12',
  media_kind: 'IMAGE', pipeline_state: 'PUBLISHED', version_no: 3,
  replaces_asset_id: 'a-0',
  checksum_sha256: 'a'.repeat(64),
  passport_ref: 'DPP-0001', edf_ref: 'EDF-OUIDAH-001', product_ref: 'REP-0001'
});

const PASSPORT = Object.freeze({
  passport_code: 'DPP-0001', product_code: 'REP-0001',
  serial_number: 'THY-REP-0001-000137',
  qr_destination: 'https://thylora.example/p/THY-REP-0001-000137',
  passport_state: 'ISSUED'
});

const REQUIREMENTS = Object.freeze({
  asset_code: 'RAEL-ASSET-0001', logo_required: true, logo_asset_ref: 'LOGO-THY-001',
  qr_destination_required: true, serial_binding_required: true, requirements_state: 'DECLARED'
});

// A context that satisfies publishGate, so lock tests isolate one cause at a time.
const CLEAR_CONTEXT = Object.freeze({
  rights: { gate_state: 'PASSED', term_end: null },
  scan: { verdict: 'CLEAN' },
  renditions: [{ rendition_kind: 'POSTER', rendition_state: 'READY' }],
  captions: [],
  moderation: { verdict: 'APPROVED' },
  passport: PASSPORT,
  requirements: REQUIREMENTS,
  provenance: [{ event_type: 'AI_ASSISTED', derived_from_ref: 'RAEL-ASSET-0000', tool_disclosure: 'router' }]
});

const succeeded = extra => ({ status: 'SUCCEEDED', model: 'anim-1', ...extra });

/* ------------------------------------------------------------------- router */
test('the Media Router is the same deployed Edge Function the dashboard uses', () => {
  assert.equal(MEDIA_ROUTER_FUNCTION, 'thylora-ai-router');
});

test('the three required animate modes exist and none names a provider', () => {
  assert.deepEqual(MODE_CODES, ['AUTOMATIC', 'BUDGET', 'BEST_FIDELITY']);
  assert.equal(DEFAULT_MODE, 'AUTOMATIC');
  for (const m of ANIMATE_MODES) {
    assert.ok(m.label && m.detail && m.routing_preference);
    // Naming a provider here would make a backend provider change a UI change.
    assert.ok(!/gemini|grok|openai|runway|pika|sora|veo/i.test(JSON.stringify(m)),
      `${m.code} names a provider`);
  }
});

test('the animate request carries the parent for provenance and no credential', () => {
  const request = animateRequest({ asset: ASSET, modeCode: 'BEST_FIDELITY', instruction: '  pan slowly  ' });
  assert.equal(request.task, 'ANIMATE_MEDIA');
  assert.equal(request.mode, 'BEST_FIDELITY');
  assert.equal(request.routing_preference, 'HIGHEST_QUALITY');
  assert.equal(request.asset_code, 'RAEL-ASSET-0001');
  assert.equal(request.parent_version_no, 3);
  assert.equal(request.parent_checksum_sha256, 'a'.repeat(64));
  assert.equal(request.instruction, 'pan slowly');
  // Provider credentials remain server-side: nothing key-shaped is sent.
  const serialised = JSON.stringify(request).toLowerCase();
  for (const forbidden of ['api_key', 'apikey', 'secret', 'password', 'bearer', 'token']) {
    assert.ok(!serialised.includes(forbidden), `the request carries ${forbidden}`);
  }
});

test('an unknown mode or a codeless asset is refused', () => {
  assert.throws(() => animateRequest({ asset: ASSET, modeCode: 'CHEAPEST' }), /Unknown animate mode/);
  assert.throws(() => animateRequest({ asset: {}, modeCode: 'AUTOMATIC' }), /asset_code is required/);
});

/* ------------------------------------------- reading the router's answer */
test('router statuses map to job states without inventing success', () => {
  assert.equal(readRouterResponse({ status: 'QUEUED' }).job_state, 'ROUTING');
  assert.equal(readRouterResponse({ status: 'RUNNING' }).job_state, 'RUNNING');
  // SUCCEEDED becomes RETURNED, never REVIEW — the asset has not been checked yet.
  assert.equal(readRouterResponse(succeeded({ asset_url: 'https://x/y.mp4' })).job_state, 'RETURNED');
  assert.equal(readRouterResponse({ status: 'FAILED', failure_reason: 'quota' }).job_state, 'FAILED');
  assert.equal(readRouterResponse({ status: 'SOMETHING_NEW' }).job_state, 'FAILED');
  assert.match(readRouterResponse({ status: 'SOMETHING_NEW' }).failure_reason, /unrecognised status/);
  assert.equal(readRouterResponse(null).job_state, 'FAILED');
});

test('the router audit id is carried through so a job traces to the router log', () => {
  const update = readRouterResponse(succeeded({ asset_url: 'https://x/y.mp4', audit_canonical_id: 'THY-AI-9' }));
  assert.equal(update.audit_canonical_id, 'THY-AI-9');
});

test('a response carrying a failure_reason is a failure whatever its status says', () => {
  const update = readRouterResponse({ status: 'SUCCEEDED', failure_reason: 'content refused' });
  assert.equal(update.job_state, 'FAILED');
  assert.match(update.failure_reason, /content refused/);
});

/* ============================= THE NO-CLAIM RULE ============================= */
test('a submitted or running job claims nothing', () => {
  for (const state of ['SUBMITTED', 'ROUTING', 'RUNNING']) {
    const claim = generationClaim({ job_state: state });
    assert.equal(claim.generated, false, state);
    assert.equal(claim.previewable, false, state);
    assert.equal(claim.reason, 'IN_FLIGHT');
    assert.match(claim.claim, /Nothing has been generated yet/);
  }
});

test('a 200 with SUCCEEDED but no asset is NOT a generation', () => {
  // The exact shape that would fool a naive implementation.
  const claim = generationClaim({ job_state: 'RETURNED', provider_result: succeeded() });
  assert.equal(claim.generated, false);
  assert.equal(claim.previewable, false);
  assert.equal(claim.reason, 'NO_ASSET_RETURNED');
  assert.match(claim.claim, /returned no locatable asset/);
});

test('a job marked REVIEW with no provider result is still not a generation', () => {
  const claim = generationClaim({ job_state: 'REVIEW', provider_result: null });
  assert.equal(claim.generated, false);
  assert.equal(claim.reason, 'NO_PROVIDER_RESULT');
});

test('a provider status short of SUCCEEDED is not a generation', () => {
  for (const status of ['PARTIAL', 'PENDING', 'UNKNOWN', '', 'succeeded_ish']) {
    const claim = generationClaim({
      job_state: 'REVIEW',
      provider_result: { status, asset_url: 'https://x/y.mp4' }
    });
    assert.equal(claim.generated, false, `status ${status}`);
    assert.equal(claim.reason, 'PROVIDER_NOT_SUCCEEDED');
  }
});

test('a non-http asset reference is not a locatable asset', () => {
  for (const url of ['not-a-url', 'ftp://x/y', 'javascript:alert(1)', '', null]) {
    assert.equal(providerAsset({ status: 'SUCCEEDED', asset_url: url }), null, String(url));
  }
});

test('a real returned asset IS a generation, by url or by storage key', () => {
  const byUrl = generationClaim({
    job_state: 'REVIEW', provider_result: succeeded({ asset_url: 'https://cdn/x.mp4', mime_type: 'video/mp4' })
  });
  assert.equal(byUrl.generated, true);
  assert.equal(byUrl.previewable, true);
  assert.equal(byUrl.asset.kind, 'URL');
  assert.match(byUrl.claim, /anim-1/);

  const byKey = generationClaim({
    job_state: 'REVIEW', provider_result: succeeded({ storage_key: 'media/out/x.mp4' })
  });
  assert.equal(byKey.generated, true);
  assert.equal(byKey.asset.kind, 'STORAGE');
});

test('a failed or rejected job states that plainly and names the reason', () => {
  const failed = generationClaim({ job_state: 'FAILED', failure_reason: 'provider quota exhausted' });
  assert.equal(failed.generated, false);
  assert.match(failed.claim, /provider quota exhausted/);

  const noReason = generationClaim({ job_state: 'FAILED' });
  assert.match(noReason.claim, /gave no reason/);

  const rejected = generationClaim({ job_state: 'REJECTED' });
  assert.match(rejected.claim, /Nothing was published/);
});

test('settling a RETURNED job routes an empty success to FAILED, not REVIEW', () => {
  assert.deepEqual(settleReturnedJob({ provider_result: succeeded() }).job_state, 'FAILED');
  assert.match(settleReturnedJob({ provider_result: succeeded() }).failure_reason, /no locatable asset/);
  assert.equal(settleReturnedJob({ provider_result: succeeded({ asset_url: 'https://x/y.mp4' }) }).job_state, 'REVIEW');
});

/* --------------------------------------------------------- job state machine */
test('the job state machine forbids skipping review', () => {
  assert.equal(canTransition('DRAFT', 'SUBMITTED'), true);
  assert.equal(canTransition('RETURNED', 'REVIEW'), true);
  // A running job cannot jump straight to approved or to the publish queue.
  assert.equal(canTransition('RUNNING', 'APPROVED'), false);
  assert.equal(canTransition('SUBMITTED', 'QUEUED_FOR_PUBLISH'), false);
  assert.equal(canTransition('REVIEW', 'QUEUED_FOR_PUBLISH'), false);
  assert.equal(canTransition('APPROVED', 'QUEUED_FOR_PUBLISH'), true);
  // A rejection is terminal.
  assert.equal(canTransition('REJECTED', 'SUBMITTED'), false);
  // A revision re-enters as a new attempt.
  assert.equal(canTransition('REVISION_REQUESTED', 'SUBMITTED'), true);
  assert.equal(JOB_STATES.length, 11);
});

test('progress never labels an in-flight job as having produced anything', () => {
  for (const state of ['SUBMITTED', 'ROUTING', 'RUNNING']) {
    const progress = jobProgress({ job_state: state });
    assert.equal(progress.in_flight, true);
    assert.ok(progress.percent > 0 && progress.percent < 90);
    assert.ok(!/generated|ready|complete/i.test(progress.label), `${state}: ${progress.label}`);
  }
  assert.equal(isInFlight('REVIEW'), false);
});

/* -------------------------------------------------------- continuity locks */
test('a clear asset has no locks and may animate and queue', () => {
  const locks = continuityLocks(ASSET, { ...CLEAR_CONTEXT, renditions: [
    { rendition_kind: 'POSTER', rendition_state: 'READY' }
  ] });
  // PUBLISHED adds the immutability note, which blocks publishing, not animating.
  assert.equal(locks.can_animate, true);
  assert.ok(locks.locks.some(l => l.code === 'PUBLISHED_VERSION_IMMUTABLE'));
});

test('a published version is never presented as editable', () => {
  const locks = continuityLocks(ASSET, CLEAR_CONTEXT);
  const lock = locks.locks.find(l => l.code === 'PUBLISHED_VERSION_IMMUTABLE');
  assert.ok(lock);
  assert.match(lock.detail, /cannot be altered/);
  assert.match(lock.detail, /new version that records this one as its parent/);
});

test('a missing passport blocks animation: no serial number and no QR destination', () => {
  const locks = continuityLocks({ ...ASSET, passport_ref: null }, { ...CLEAR_CONTEXT, passport: null });
  const lock = locks.blocking.find(l => l.code === 'PASSPORT_MISSING');
  assert.ok(lock, 'a passportless asset must be blocked');
  assert.match(lock.detail, /no serial number and no QR destination/);
  assert.equal(locks.can_animate, false);
});

test('a passport without a serial or a QR destination is caught', () => {
  const noSerial = continuityLocks(ASSET, {
    ...CLEAR_CONTEXT, passport: { ...PASSPORT, serial_number: null }
  });
  assert.ok(noSerial.blocking.some(l => l.code === 'SERIAL_MISSING'));

  const noQr = continuityLocks(ASSET, {
    ...CLEAR_CONTEXT, passport: { ...PASSPORT, qr_destination: null }
  });
  assert.ok(noQr.blocking.some(l => l.code === 'QR_DESTINATION_MISSING'));
});

test('a QR destination is read, never invented', () => {
  assert.equal(qrDestination(PASSPORT), PASSPORT.qr_destination);
  assert.equal(qrDestination({ qr_destination: 'not-a-url' }), null);
  assert.equal(qrDestination({}), null);
  assert.equal(qrDestination(null), null);
});

test('the logo requirement is never assumed satisfied', () => {
  // Not declared at all.
  const undeclared = continuityLocks(ASSET, { ...CLEAR_CONTEXT, requirements: null });
  const lock = undeclared.blocking.find(l => l.code === 'REQUIREMENTS_NOT_DECLARED');
  assert.ok(lock);
  assert.match(lock.detail, /logo requirement is unknown/);

  // Required but absent.
  const missing = continuityLocks(ASSET, {
    ...CLEAR_CONTEXT, requirements: { ...REQUIREMENTS, logo_asset_ref: null }
  });
  assert.ok(missing.blocking.some(l => l.code === 'LOGO_MISSING'));

  // Undecided is distinct from "not required".
  const undecided = continuityLocks(ASSET, {
    ...CLEAR_CONTEXT, requirements: { ...REQUIREMENTS, logo_required: null, logo_asset_ref: null }
  });
  assert.ok(undecided.blocking.some(l => l.code === 'LOGO_REQUIREMENT_UNSET'));

  // Explicitly not required is clear.
  const notRequired = continuityLocks(ASSET, {
    ...CLEAR_CONTEXT, requirements: { ...REQUIREMENTS, logo_required: false, logo_asset_ref: null }
  });
  assert.ok(!notRequired.locks.some(l => l.code.startsWith('LOGO')));
});

test('a derivative with no named parent is blocked', () => {
  const locks = continuityLocks(ASSET, { ...CLEAR_CONTEXT, provenance: [] });
  const lock = locks.blocking.find(l => l.code === 'PROVENANCE_PARENT_MISSING');
  assert.ok(lock, 'a version-3 derivative must name its parent');
  assert.equal(locks.can_animate, false);
});

test('an AI-assisted event without a tool disclosure is blocked', () => {
  const locks = continuityLocks(ASSET, {
    ...CLEAR_CONTEXT,
    provenance: [{ event_type: 'AI_ASSISTED', derived_from_ref: 'X', tool_disclosure: null }]
  });
  assert.ok(locks.blocking.some(l => l.code === 'TOOL_DISCLOSURE_MISSING'));
});

test('pipeline blockers are carried through from the shared publish gate', () => {
  const locks = continuityLocks(ASSET, { ...CLEAR_CONTEXT, rights: null });
  // The gate's own code, unmodified, so the studio shows what the pipeline enforces.
  assert.ok(locks.locks.some(l => l.code === 'RIGHTS_MISSING'));
  assert.equal(locks.locks.find(l => l.code === 'RIGHTS_MISSING').severity,
    LOCK_SEVERITY.REQUIRED_BEFORE_PUBLISH);
  // Publish-time blockers do not stop animating a draft.
  assert.equal(locks.can_animate, true);
  assert.equal(locks.can_queue_for_publish, false);
});

test('no open asset is itself a blocking lock', () => {
  const locks = continuityLocks(null, {});
  assert.equal(locks.can_animate, false);
  assert.ok(locks.blocking.some(l => l.code === 'ASSET_MISSING'));
});

/* -------------------------------------------------------------- pen markup */
function penEvent(x, y, { pressure = 0.62, tiltX = 12, tiltY = -4 } = {}) {
  return { pointerType: 'pen', clientX: x, clientY: y, pressure, tiltX, tiltY };
}
const FRAME = { left: 100, top: 200, width: 400, height: 300 };

test('Apple Pencil pressure and tilt are recorded; a finger is not called Pencil', () => {
  const pen = markupPoint(penEvent(300, 350), FRAME);
  assert.equal(pen.x, 0.5);
  assert.equal(pen.y, 0.5);
  assert.equal(pen.pressure, 0.62);
  assert.deepEqual(pen.tilt, { x: 12, y: -4 });
  assert.equal(isPencil(penEvent(0, 0)), true);

  // A mouse reports exactly 0.5, which is not a measurement.
  const mouse = markupPoint({ pointerType: 'mouse', clientX: 300, clientY: 350, pressure: 0.5 }, FRAME);
  assert.equal(mouse.pressure, null);
  assert.equal(mouse.tilt, null);
  assert.equal(isPencil({ pointerType: 'touch' }), false);
});

test('markup coordinates are frame-relative and clamped, so an iPad markup replays anywhere', () => {
  assert.deepEqual(
    [markupPoint(penEvent(100, 200), FRAME).x, markupPoint(penEvent(100, 200), FRAME).y], [0, 0]);
  assert.deepEqual(
    [markupPoint(penEvent(500, 500), FRAME).x, markupPoint(penEvent(500, 500), FRAME).y], [1, 1]);
  // Off-frame input cannot produce an out-of-range coordinate.
  const off = markupPoint(penEvent(-50, 900), FRAME);
  assert.ok(off.x >= 0 && off.x <= 1 && off.y >= 0 && off.y <= 1);
});

test('a markup summary separates Pencil strokes from touch strokes', () => {
  const summary = markupSummary([
    { pointer_type: 'pen', points: [{ x: 0, y: 0 }, { x: 1, y: 1 }] },
    { pointer_type: 'pen', points: [{ x: 0.2, y: 0.2 }] },
    { pointer_type: 'touch', points: [{ x: 0.3, y: 0.3 }] },
    { pointer_type: 'pen', points: [] }   // empty strokes are not strokes
  ]);
  assert.equal(summary.strokes, 3);
  assert.equal(summary.points, 4);
  assert.equal(summary.pencil_strokes, 2);
  assert.deepEqual(summary.input_kinds.sort(), ['pen', 'touch']);
  assert.equal(markupSummary([]).empty, true);
});

/* ------------------------------------------------------- revision requests */
const JOB = Object.freeze({
  job_code: 'THY-ANIM-20260915-AB12CD34', mode: 'BEST_FIDELITY',
  job_state: 'REVIEW', audit_canonical_id: 'THY-AI-9',
  review_gate_canonical_id: 'GATE-MEDIA-001',
  provider_result: succeeded({ asset_url: 'https://cdn/out.mp4' })
});

test('a revision request routes into the CANONICAL margin queue', () => {
  const request = revisionRequest({
    job: JOB, asset: ASSET, note: 'Slow the pan.',
    markupRef: 'THY-MARKUP-1',
    strokes: [{ pointer_type: 'pen', points: [{ x: 0.1, y: 0.1 }, { x: 0.2, y: 0.2 }] }],
    playbackMs: 4200.7
  });
  assert.equal(request.ok, true);
  // The exact parameter names thylora_margin_note_add_v1 takes.
  assert.deepEqual(Object.keys(request.payload).sort(), [
    'p_anchor_context', 'p_anchor_kind', 'p_anchor_ref', 'p_body',
    'p_playback_position_ms', 'p_source_mode'
  ]);
  assert.equal(request.payload.p_anchor_kind, 'MEDIA_FRAME');
  assert.equal(request.payload.p_source_mode, 'MARKUP');
  assert.equal(request.payload.p_playback_position_ms, 4201);
  // The markup rides in the function's existing jsonb extension point.
  assert.equal(request.payload.p_anchor_context.markup_ref, 'THY-MARKUP-1');
  assert.equal(request.payload.p_anchor_context.job_code, JOB.job_code);
  assert.equal(request.payload.p_anchor_context.asset_code, ASSET.asset_code);
  // The body states the markup is attached, so the queue is never ambiguous.
  assert.match(request.payload.p_body, /Slow the pan\./);
  assert.match(request.payload.p_body, /Markup attached · 1 stroke, 2 points, 1 drawn with Apple Pencil/);
});

test('a revision may be carried by markup alone, with no typed note', () => {
  const request = revisionRequest({
    job: JOB, asset: ASSET, note: '',
    strokes: [{ pointer_type: 'pen', points: [{ x: 0.5, y: 0.5 }] }]
  });
  assert.equal(request.ok, true);
  assert.match(request.payload.p_body, /Revision requested by markup/);
  assert.equal(request.payload.p_source_mode, 'MARKUP');
});

test('an empty revision is refused', () => {
  const empty = revisionRequest({ job: JOB, asset: ASSET, note: '   ', strokes: [] });
  assert.equal(empty.ok, false);
  assert.match(empty.reason, /written note or a markup/);

  const noJob = revisionRequest({ job: null, asset: ASSET, note: 'x' });
  assert.equal(noJob.ok, false);
  assert.match(noJob.reason, /name the animation job/);
});

/* ------------------------------------------------------ Chairman decisions */
test('decisions map onto the canonical review-gate decision values', () => {
  assert.deepEqual(DECISIONS, ['APPROVE', 'REVISE', 'REJECT']);

  const approve = decisionPayload({ decision: 'approve', gateCanonicalId: 'GATE-1' });
  assert.equal(approve.ok, true);
  assert.equal(approve.payload.p_decision, 'APPROVED');
  assert.equal(approve.next_state, 'APPROVED');

  // A revision is CHANGES_REQUESTED — the canonical decision that reopens a gate.
  const revise = decisionPayload({ decision: 'REVISE', gateCanonicalId: 'GATE-1', note: 'slower' });
  assert.equal(revise.payload.p_decision, 'CHANGES_REQUESTED');
  assert.equal(revise.next_state, 'REVISION_REQUESTED');

  assert.equal(decisionPayload({ decision: 'REJECT', gateCanonicalId: 'GATE-1' }).payload.p_decision, 'REJECTED');
});

test('a decision with no gate is refused rather than recorded locally', () => {
  const orphan = decisionPayload({ decision: 'APPROVE', gateCanonicalId: null });
  assert.equal(orphan.ok, false);
  assert.match(orphan.reason, /no review gate/);
});

test('a revision decision needs a reason', () => {
  const bare = decisionPayload({ decision: 'REVISE', gateCanonicalId: 'GATE-1', note: '  ' });
  assert.equal(bare.ok, false);
  assert.match(bare.reason, /needs a note or a markup/);
});

test('an unknown decision is refused', () => {
  assert.equal(decisionPayload({ decision: 'MAYBE', gateCanonicalId: 'G' }).ok, false);
});

/* -------------------------------------------------------- publishing queue */
const CLEAR_LOCKS = Object.freeze({ can_queue_for_publish: true, locks: [] });

test('an approved result hands over with full provenance', () => {
  const handoff = publishHandoff({
    job: { ...JOB, job_state: 'APPROVED' },
    asset: ASSET, locks: CLEAR_LOCKS, passport: PASSPORT, requirements: REQUIREMENTS
  });
  assert.equal(handoff.ok, true);
  // Hands to the existing EDF publish path by its code.
  assert.deepEqual(handoff.payload, { p_edf_code: 'EDF-OUIDAH-001' });

  // The derivative names its parent and discloses the tool.
  const p = handoff.provenance;
  assert.equal(p.event_type, 'AI_ASSISTED');
  assert.equal(p.derived_from_ref, 'RAEL-ASSET-0001');
  assert.match(p.tool_disclosure, /thylora-ai-router/);
  assert.match(p.tool_disclosure, /anim-1/);
  assert.match(p.tool_disclosure, /THY-AI-9/);
  // Serial number, QR destination and logo requirement are carried as evidence.
  assert.equal(p.evidence.serial_number, 'THY-REP-0001-000137');
  assert.equal(p.evidence.qr_destination, PASSPORT.qr_destination);
  assert.equal(p.evidence.logo_required, true);
  assert.equal(p.evidence.logo_asset_ref, 'LOGO-THY-001');
  assert.equal(p.evidence.parent_version_no, 3);
  assert.equal(p.evidence.parent_checksum_sha256, 'a'.repeat(64));
});

test('nothing reaches the publishing queue without a generated asset', () => {
  const handoff = publishHandoff({
    job: { ...JOB, job_state: 'APPROVED', provider_result: succeeded() }, // success, no asset
    asset: ASSET, locks: CLEAR_LOCKS, passport: PASSPORT, requirements: REQUIREMENTS
  });
  assert.equal(handoff.ok, false);
  assert.ok(handoff.problems.some(p => /no locatable asset/.test(p)));
  assert.equal(handoff.provenance, null);
  assert.equal(handoff.payload, null);
});

test('an unapproved, locked or unbound result cannot be queued', () => {
  const unapproved = publishHandoff({
    job: JOB, asset: ASSET, locks: CLEAR_LOCKS, passport: PASSPORT, requirements: REQUIREMENTS
  });
  assert.equal(unapproved.ok, false);
  assert.ok(unapproved.problems.some(p => /not approved/.test(p)));

  const locked = publishHandoff({
    job: { ...JOB, job_state: 'APPROVED' }, asset: ASSET,
    locks: { can_queue_for_publish: false, locks: [{ code: 'RIGHTS_MISSING' }] },
    passport: PASSPORT, requirements: REQUIREMENTS
  });
  assert.ok(locked.problems.some(p => /continuity lock/.test(p)));

  const unbound = publishHandoff({
    job: { ...JOB, job_state: 'APPROVED' }, asset: { ...ASSET, edf_ref: null },
    locks: CLEAR_LOCKS, passport: PASSPORT, requirements: REQUIREMENTS
  });
  assert.ok(unbound.problems.some(p => /not bound to an EDF package/.test(p)));
});
