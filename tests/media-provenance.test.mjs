// THYLORA MEDIA ROUTER · continuity, immutable master, derivative lineage
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  clearCharacter, buildContinuity, mintDerivativeId, deriveClip,
  verifyMasterPreserved, GENERATION_METHODS
} from '../dashboard/r6/lib/media-provenance.js';

// Shapes taken from the live thylora-dash rows.
const BRAMBLE = {
  character_id: 'd0924d1d-f700-4cbd-af15-df75b2a21bf1',
  canonical_entity_id: 'CHAR-BRAMBLE-001',
  first_name: 'Bramble', last_name: null,
  truth_class: 'CANON', identity_state: 'CANON_PARTIAL_PROFILE'
};
const WICK = {
  character_id: '398e31cf-ad31-4c3a-962b-4bd2dbf41511',
  canonical_entity_id: 'CHAR-WICK-001',
  first_name: 'Wick', last_name: null,
  truth_class: 'CANON', identity_state: 'CANON_PARTIAL_PROFILE'
};
const SEEZIN = {
  character_id: '281b60e1-b654-4393-a1a3-2389a1bf9290',
  canonical_entity_id: 'ER-CHAR-UNCLE-SEEZIN-001',
  first_name: 'Seezin', last_name: null,
  truth_class: 'CHAIRMAN_SEED', identity_state: 'VISUAL_IDENTITY_LOCKED_PROFILE_PARTIAL'
};
const SEEZIN_REFS = [
  { reference_id: 'R1', character_id: SEEZIN.character_id, reference_type: 'FACE', angle_or_pose: 'front', approved_for_generation: true, rights_state: 'OWNED', visual_asset_id: 'VA-1', identity_lock_state: 'LOCKED' },
  { reference_id: 'R2', character_id: SEEZIN.character_id, reference_type: 'FACE', angle_or_pose: 'three-quarter', approved_for_generation: true, rights_state: 'OWNED', visual_asset_id: 'VA-2', identity_lock_state: 'LOCKED' }
];

const MASTER = Object.freeze({
  asset_id: 'ASSET-NIGHTSTEP-REFERENCE-20260824-001',
  canonical_id: 'ASSET-NIGHTSTEP-REFERENCE-20260824-001',
  canonical_name: 'The NightStep concept sheet',
  title: 'The NightStep concept sheet',
  truth_class: 'EARTH_PROPOSED',
  world_layer: 'EARTH',
  subject: 'NightStep',
  rights_state: 'USER_PROVIDED_REFERENCE',
  version: 1
});

// ---- continuity -------------------------------------------------------------

test('Bramble is a CANON character with no reference assets and is NOT cleared', () => {
  const cleared = clearCharacter(BRAMBLE, []);
  assert.equal(cleared.cleared, false);
  assert.equal(cleared.reference_count, 0);
  assert.match(cleared.reasons.join(' '), /No reference assets registered/);
});

test('Wick is blocked for the same reason — the pair cannot be the test case yet', () => {
  const continuity = buildContinuity({ characters: [BRAMBLE, WICK], references: [] });
  assert.equal(continuity.ok, false);
  assert.equal(continuity.blocked.length, 2);
  assert.match(continuity.statement, /Bramble/);
  assert.match(continuity.statement, /Wick/);
});

test('a character with approved references and a locked identity is cleared', () => {
  const cleared = clearCharacter(SEEZIN, SEEZIN_REFS);
  assert.equal(cleared.cleared, true);
  assert.equal(cleared.approved_count, 2);
  assert.deepEqual(cleared.reasons, []);
});

test('references that exist but are not approved do not clear a character', () => {
  const unapproved = SEEZIN_REFS.map(r => ({ ...r, approved_for_generation: false }));
  const cleared = clearCharacter(SEEZIN, unapproved);
  assert.equal(cleared.cleared, false);
  assert.match(cleared.reasons.join(' '), /none is approved_for_generation/);
});

test('a restricted rights state on an approved reference blocks generation', () => {
  const restricted = SEEZIN_REFS.map(r => ({ ...r, rights_state: 'RESTRICTED' }));
  assert.equal(clearCharacter(SEEZIN, restricted).cleared, false);
});

test('continuity refuses as a whole when one character of several is blocked', () => {
  const continuity = buildContinuity({ characters: [SEEZIN, BRAMBLE], references: SEEZIN_REFS });
  assert.equal(continuity.ok, false, 'partial continuity is how a character drifts');
  assert.equal(continuity.blocked.length, 1);
  assert.equal(continuity.blocked[0].name, 'Bramble');
});

test('a cleared continuity snapshot records what the look was bound to', () => {
  const continuity = buildContinuity({ characters: [SEEZIN], references: SEEZIN_REFS });
  assert.equal(continuity.ok, true);
  assert.equal(continuity.snapshot.format, 'THY-CONTINUITY-1');
  assert.equal(continuity.snapshot.characters[0].canonical_entity_id, 'ER-CHAR-UNCLE-SEEZIN-001');
  assert.deepEqual(continuity.snapshot.characters[0].reference_ids, ['R1', 'R2']);
  assert.equal(continuity.references.length, 2);
});

// ---- immutable master and lineage -------------------------------------------

test('a derivative gets a new id, the next version, and points at its master', () => {
  const minted = mintDerivativeId(MASTER, { sequence: 1 });
  assert.equal(minted.version, 2);
  assert.match(minted.canonical_id, /^THY-CLIP-/);
  assert.match(minted.serial_number, /^VLEGH-CLIP-/);
  assert.notEqual(minted.canonical_id, MASTER.canonical_id);
});

test('deriving a clip leaves the master still byte-identical', () => {
  const before = JSON.parse(JSON.stringify(MASTER));
  const result = deriveClip({
    master: MASTER,
    job: { render_job_id: 'RJ-1' },
    offer: { provider_code: 'fal', provider_label: 'fal.ai', model_code: 'kling', operation: 'IMAGE_TO_VIDEO', resolution: '1280x720', audio_included: false, estimated_cost_minor: 300 },
    continuity: buildContinuity({ characters: [SEEZIN], references: SEEZIN_REFS }),
    output: { storage_path: 'clips/x.mp4', checksum_sha256: 'a'.repeat(64), duration_seconds: 6, provider_request_id: 'req_1' },
    sequence: 1
  });

  const check = verifyMasterPreserved(before, result.master);
  assert.equal(check.preserved, true, check.statement);
  assert.equal(result.master_preserved, true);
  assert.deepEqual(result.master, before);
});

test('the derivative carries parent linkage in every registry it touches', () => {
  const result = deriveClip({
    master: MASTER, job: { render_job_id: 'RJ-2' },
    offer: { provider_code: 'runway', model_code: 'gen4_turbo', operation: 'IMAGE_TO_VIDEO' },
    continuity: buildContinuity({ characters: [SEEZIN], references: SEEZIN_REFS }),
    output: {}, sequence: 2
  });
  assert.equal(result.derivative.predecessor_id, MASTER.asset_id);
  assert.equal(result.serial.predecessor_id, MASTER.asset_id);
  assert.equal(result.provenance.source_reference, MASTER.asset_id);
  assert.equal(result.derivative.version, 2);
});

test('a generated clip is never born approved', () => {
  const result = deriveClip({
    master: MASTER, job: {}, offer: { operation: 'IMAGE_TO_VIDEO' },
    continuity: {}, output: {}, sequence: 3
  });
  assert.equal(result.derivative.approval_state, 'NOT_REVIEWED');
  assert.equal(result.derivative.asset_type, 'GENERATED_CLIP');
});

test('the derivative record cannot be mutated after it is produced', () => {
  const result = deriveClip({ master: MASTER, job: {}, offer: { operation: 'IMAGE_TO_VIDEO' }, continuity: {}, output: {}, sequence: 4 });
  assert.throws(() => { result.derivative.approval_state = 'APPROVED'; }, TypeError);
  assert.throws(() => { result.master.version = 99; }, TypeError);
});

test('provenance records the provider, the job and the continuity it was bound to', () => {
  const continuity = buildContinuity({ characters: [SEEZIN], references: SEEZIN_REFS });
  const result = deriveClip({
    master: MASTER, job: { render_job_id: 'RJ-9' },
    offer: { provider_code: 'fal', model_code: 'veo3', operation: 'IMAGE_TO_VIDEO', estimated_cost_minor: 400 },
    continuity, output: { provider_request_id: 'req_9', actual_cost_minor: 380, checksum_sha256: 'b'.repeat(64) },
    sequence: 5
  });
  assert.equal(result.provenance.generation_method, GENERATION_METHODS.PROVIDER_IMAGE_TO_VIDEO);
  assert.equal(result.provenance.creator_record.render_job_id, 'RJ-9');
  assert.equal(result.provenance.creator_record.provider_request_id, 'req_9');
  assert.equal(result.provenance.creator_record.actual_cost_minor, 380);
  assert.equal(result.provenance.provenance_state, 'HASHED');
  assert.ok(result.provenance.creator_record.continuity_snapshot);
});

test('an unhashed output is marked pending rather than claimed as verified', () => {
  const result = deriveClip({ master: MASTER, job: {}, offer: { operation: 'IMAGE_TO_VIDEO' }, continuity: {}, output: {}, sequence: 6 });
  assert.equal(result.provenance.provenance_state, 'PENDING_HASH');
  assert.equal(result.provenance.integrity_hash, null);
});

test('a derivation without a registered master is refused', () => {
  assert.throws(() => deriveClip({ master: null, job: {}, offer: {}, continuity: {}, output: {} }), /registered master/);
  assert.throws(() => deriveClip({ master: {}, job: {}, offer: {}, continuity: {}, output: {} }), /registered master/);
});

test('a second derivative of the same master is a distinct atom', () => {
  const a = deriveClip({ master: MASTER, job: {}, offer: { operation: 'IMAGE_TO_VIDEO' }, continuity: {}, output: {}, sequence: 7 });
  const b = deriveClip({ master: MASTER, job: {}, offer: { operation: 'IMAGE_TO_VIDEO' }, continuity: {}, output: {}, sequence: 8 });
  assert.notEqual(a.derivative.asset_id, b.derivative.asset_id);
  assert.equal(a.derivative.predecessor_id, b.derivative.predecessor_id, 'both still point at the same master');
});
