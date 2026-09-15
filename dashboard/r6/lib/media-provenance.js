// THYLORA MEDIA ROUTER · continuity binding, derivative lineage, serialization
// Authoritative backend: thylora-dash (jvsdxhrfhtlgaknhjxlz)
//
// Two absolutes from the Chairman, enforced here rather than trusted to a UI:
//
//   1. The immutable master still is preserved. Nothing in this module returns
//      a mutation of a master record. `deriveClip` takes a master and returns a
//      NEW record that points back at it. There is no update path to a master.
//
//   2. Character and visual continuity is PULLED from the existing registries.
//      This module never invents a character, a seed or a look. It reads
//      studio_world_characters and studio_character_reference_assets, and when
//      a character has no reference approved for generation it REFUSES rather
//      than letting a provider improvise the face.
//
// The live registries this module binds to (verified present on thylora-dash):
//   studio_world_characters            13 rows
//   studio_character_reference_assets  14 rows (approved_for_generation flag)
//   thylora_visual_assets              36 rows (asset_id, version, approval_state)
//   thylora_visual_provenance          10 rows (generation_method, integrity_hash)
//   vlegh_registry                      4 rows (serial_number, predecessor_id)

export const IDENTITY_CLEARED_STATES = Object.freeze([
  'VISUAL_IDENTITY_LOCKED_PROFILE_PARTIAL',
  'VISUAL_IDENTITY_LOCKED',
  'VISUAL_LOCKED_NAME_UNKNOWN'
]);

export const GENERATION_METHODS = Object.freeze({
  PROVIDER_IMAGE_TO_VIDEO: 'PROVIDER_IMAGE_TO_VIDEO',
  PROVIDER_TEXT_TO_VIDEO: 'PROVIDER_TEXT_TO_VIDEO',
  PROVIDER_VIDEO_TO_VIDEO: 'PROVIDER_VIDEO_TO_VIDEO'
});

/**
 * Decide whether a character may be generated at all.
 *
 * A character with no reference approved for generation is NOT cleared, however
 * canon they are. Bramble and Wick are exactly this case today: both are
 * truth_class CANON with identity_state CANON_PARTIAL_PROFILE, and both have
 * zero rows in studio_character_reference_assets. Generating them now would
 * mean a provider inventing the face of a canon character, and the face would
 * then differ in every clip. That is the failure this gate exists to stop.
 */
export function clearCharacter(character, references = []) {
  const own = references.filter(r => r.character_id === character.character_id);
  const approved = own.filter(r => r.approved_for_generation);
  const reasons = [];

  if (own.length === 0) {
    reasons.push('No reference assets registered for this character.');
  } else if (approved.length === 0) {
    reasons.push(`${own.length} reference asset(s) exist but none is approved_for_generation.`);
  }
  if (!IDENTITY_CLEARED_STATES.includes(character.identity_state)) {
    reasons.push(`identity_state is ${character.identity_state}; a locked visual identity is required before generation.`);
  }
  const restricted = approved.filter(r => r.rights_state && !['CLEARED', 'OWNED', 'USER_PROVIDED_REFERENCE'].includes(r.rights_state));
  if (restricted.length) {
    reasons.push(`${restricted.length} approved reference(s) carry a restricted rights_state.`);
  }

  return {
    character_id: character.character_id,
    canonical_entity_id: character.canonical_entity_id || null,
    name: [character.first_name, character.last_name].filter(Boolean).join(' ') || 'UNNAMED',
    truth_class: character.truth_class,
    identity_state: character.identity_state,
    reference_count: own.length,
    approved_count: approved.length,
    cleared: reasons.length === 0,
    reasons,
    references: approved.map(r => ({
      reference_id: r.reference_id,
      reference_type: r.reference_type,
      angle_or_pose: r.angle_or_pose,
      visual_asset_id: r.visual_asset_id,
      identity_lock_state: r.identity_lock_state
    }))
  };
}

/**
 * Build the continuity snapshot that travels with the job and is stored in
 * studio_render_jobs.continuity_snapshot.
 *
 * The snapshot is a record of what the look was bound to at generation time, so
 * a clip produced six months from now can be explained. It refuses as a whole
 * if any requested character is not cleared — partial continuity is how a
 * character drifts.
 */
export function buildContinuity({ characters = [], references = [], sceneSnapshot = null, capturedAt = Date.now() }) {
  const cleared = characters.map(c => clearCharacter(c, references));
  const blocked = cleared.filter(c => !c.cleared);

  return {
    ok: blocked.length === 0,
    blocked,
    characters: cleared,
    references: cleared.flatMap(c => c.references.map(r => ({ ...r, character_id: c.character_id, canonical_entity_id: c.canonical_entity_id }))),
    snapshot: {
      format: 'THY-CONTINUITY-1',
      captured_at: new Date(capturedAt).toISOString(),
      characters: cleared.map(c => ({
        character_id: c.character_id,
        canonical_entity_id: c.canonical_entity_id,
        name: c.name,
        truth_class: c.truth_class,
        identity_state: c.identity_state,
        reference_ids: c.references.map(r => r.reference_id)
      })),
      scene: sceneSnapshot
        ? {
            scene_id: sceneSnapshot.scene_id,
            wardrobe_state: sceneSnapshot.wardrobe_state ?? null,
            prop_state: sceneSnapshot.prop_state ?? null,
            locked: !!sceneSnapshot.locked
          }
        : null
    },
    statement: blocked.length === 0
      ? `${cleared.length} character(s) cleared for generation.`
      : `${blocked.length} of ${cleared.length} character(s) not cleared: ${blocked.map(b => b.name).join(', ')}.`
  };
}

let serialCounter = 0;

/**
 * Mint the identifiers for a derivative clip.
 *
 * The derivative is a NEW record. The master's id travels as `predecessor_id`
 * and the version increments — the same lineage columns the live `assets`,
 * `thylora_visual_assets` and `vlegh_registry` tables already use, so this adds
 * no parallel notion of lineage.
 */
export function mintDerivativeId(master, { at = Date.now(), sequence = null } = {}) {
  serialCounter += 1;
  const n = sequence ?? serialCounter;
  const stem = String(master.canonical_id || master.canonical_name || master.asset_id || 'ASSET')
    .replace(/^THY-/, '')
    .replace(/[^A-Za-z0-9-]/g, '')
    .toUpperCase();
  const version = Number(master.version || 1) + 1;
  return {
    canonical_id: `THY-CLIP-${stem}-V${version}-${String(n).padStart(3, '0')}`,
    serial_number: `VLEGH-CLIP-${stem}-V${version}-${String(n).padStart(3, '0')}`,
    version,
    minted_at: new Date(at).toISOString()
  };
}

/**
 * Produce the derivative record for an ingested clip.
 *
 * Returns BOTH the new derivative and the untouched master, so a caller cannot
 * accidentally write back over the master: the master object returned here is
 * frozen and carries no changed field.
 */
export function deriveClip({
  master,
  job,
  offer,
  continuity,
  output = {},
  at = Date.now(),
  sequence = null
}) {
  if (!master || !(master.asset_id || master.canonical_id)) {
    throw new Error('A derivative requires a registered master asset.');
  }
  const minted = mintDerivativeId(master, { at, sequence });

  const method = offer?.operation === 'IMAGE_TO_VIDEO' ? GENERATION_METHODS.PROVIDER_IMAGE_TO_VIDEO
    : offer?.operation === 'VIDEO_TO_VIDEO' ? GENERATION_METHODS.PROVIDER_VIDEO_TO_VIDEO
    : GENERATION_METHODS.PROVIDER_TEXT_TO_VIDEO;

  const derivative = Object.freeze({
    // thylora_visual_assets shape
    asset_id: minted.canonical_id,
    canonical_name: `${master.canonical_name || master.title || 'Clip'} — generated clip v${minted.version}`,
    world_layer: master.world_layer || null,
    truth_class: master.truth_class || null,
    subject: master.subject || null,
    asset_type: 'GENERATED_CLIP',
    storage_bucket: output.storage_bucket || null,
    storage_path: output.storage_path || null,
    approval_state: 'NOT_REVIEWED',      // a generated clip is never born approved
    rights_state: master.rights_state || 'UNKNOWN',
    provenance_state: 'RECORDED',
    version: minted.version,
    // lineage
    predecessor_id: master.asset_id || master.canonical_id,
    notes: `Generated from ${master.asset_id || master.canonical_id} by ${offer?.provider_label || offer?.provider_code || 'provider'} (${offer?.model_code || 'model'}).`
  });

  const provenance = Object.freeze({
    // thylora_visual_provenance shape
    provenance_id: `PROV-${minted.canonical_id}`,
    asset_id: derivative.asset_id,
    source_type: 'GENERATED_DERIVATIVE',
    source_reference: master.asset_id || master.canonical_id,
    generation_method: method,
    creator_record: {
      provider_code: offer?.provider_code || null,
      model_code: offer?.model_code || null,
      operation: offer?.operation || null,
      render_job_id: job?.render_job_id || null,
      provider_request_id: output.provider_request_id || null,
      estimated_cost_minor: offer?.estimated_cost_minor ?? null,
      actual_cost_minor: output.actual_cost_minor ?? null,
      continuity_snapshot: continuity?.snapshot || null
    },
    rights_evidence: master.rights_state || 'UNKNOWN',
    integrity_hash: output.checksum_sha256 || null,
    provenance_state: output.checksum_sha256 ? 'HASHED' : 'PENDING_HASH'
  });

  const serial = Object.freeze({
    // vlegh_registry shape
    canonical_id: minted.canonical_id,
    serial_number: minted.serial_number,
    title: derivative.canonical_name,
    truth_class: master.truth_class || null,
    state: 'REGISTERED',
    asset_id: master.asset_id || null,
    version: minted.version,
    predecessor_id: master.asset_id || master.canonical_id,
    rights_state: derivative.rights_state,
    provenance: { provenance_id: provenance.provenance_id, render_job_id: job?.render_job_id || null },
    payload: { duration_seconds: output.duration_seconds ?? null, resolution: offer?.resolution ?? null, audio_included: !!offer?.audio_included }
  });

  return {
    master: Object.freeze({ ...master }),   // returned unchanged, and frozen
    derivative,
    provenance,
    serial,
    master_preserved: true
  };
}

/**
 * Proof that a derivation preserved its master. Used by the tests and by the
 * ingestion path before anything is written.
 */
export function verifyMasterPreserved(before, after) {
  const changed = Object.keys(before).filter(k => JSON.stringify(before[k]) !== JSON.stringify(after?.[k]));
  return {
    preserved: changed.length === 0,
    changed_fields: changed,
    statement: changed.length === 0
      ? 'Master still is byte-identical after derivation.'
      : `Master was modified in ${changed.length} field(s): ${changed.join(', ')}.`
  };
}
