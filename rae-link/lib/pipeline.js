// RAE LINK · media pipeline state machine
// Workroom: WR-RAELINK-001
//
// Creator/Input -> Rights/Authority Gate -> Upload -> Virus/File Validation ->
// Transcode/Encode -> Metadata -> Thumbnail/Poster -> Moderation -> Publication
// -> Feed/Search -> Playback -> Analytics -> Monetization Ledger -> Creator Share
// -> Payout Evidence -> Archive/Versioning
//
// The stages after Publication are read paths and money paths rather than upload
// states, so the asset state machine ends at PUBLISHED/ARCHIVED and the later
// stages are modelled as their own records (views, ledger entries, payouts).

export const STAGES = Object.freeze([
  'INPUT', 'RIGHTS_GATE', 'UPLOAD', 'VALIDATION', 'TRANSCODE',
  'METADATA', 'POSTER', 'MODERATION', 'PUBLISHED', 'ARCHIVED'
]);

export const TERMINAL_STAGES = Object.freeze(['BLOCKED', 'WITHDRAWN']);

const ALLOWED = Object.freeze({
  INPUT:       ['RIGHTS_GATE', 'WITHDRAWN'],
  RIGHTS_GATE: ['UPLOAD', 'BLOCKED', 'WITHDRAWN'],
  UPLOAD:      ['VALIDATION', 'UPLOAD', 'BLOCKED', 'WITHDRAWN'],
  VALIDATION:  ['TRANSCODE', 'METADATA', 'BLOCKED', 'WITHDRAWN'],
  TRANSCODE:   ['METADATA', 'BLOCKED', 'WITHDRAWN'],
  METADATA:    ['POSTER', 'BLOCKED', 'WITHDRAWN'],
  POSTER:      ['MODERATION', 'BLOCKED', 'WITHDRAWN'],
  MODERATION:  ['PUBLISHED', 'BLOCKED', 'WITHDRAWN'],
  PUBLISHED:   ['ARCHIVED', 'WITHDRAWN', 'MODERATION'],
  ARCHIVED:    ['PUBLISHED'],
  BLOCKED:     ['RIGHTS_GATE', 'MODERATION', 'WITHDRAWN'],
  WITHDRAWN:   ['ARCHIVED']
});

export function canTransition(from, to) {
  return Boolean(ALLOWED[from]?.includes(to));
}

const TIMED = new Set(['VIDEO', 'AUDIO', 'LIVE']);

/**
 * Evaluate every publication prerequisite at once and return each unmet one with
 * the route that clears it. A creator is never told only "not ready".
 * Mirrors rael_publish_gate in db/rae-link/0009_functions.sql.
 */
export function publishGate(asset, context = {}) {
  const blockers = [];
  const add = (code, detail, route) => blockers.push({ code, detail, route });

  const rights = context.rights;
  if (!rights) add('RIGHTS_MISSING', 'No rights record is attached to this media.', 'rights');
  else if (rights.gate_state !== 'PASSED') add('RIGHTS_NOT_PASSED', `Rights gate is ${rights.gate_state}.`, 'rights');
  else if (rights.term_end && new Date(rights.term_end) < new Date()) {
    add('RIGHTS_EXPIRED', `Licence term ended ${rights.term_end}.`, 'rights');
  }

  const scan = context.scan;
  if (!scan) add('VALIDATION_MISSING', 'File has not been scanned or validated.', 'validation');
  else if (scan.verdict !== 'CLEAN') add('VALIDATION_FAILED', `Scanner verdict ${scan.verdict}.`, 'validation');

  const renditions = context.renditions ?? [];
  if (TIMED.has(asset.media_kind)) {
    if (!renditions.some(r => r.rendition_state === 'READY' && !['POSTER', 'THUMBNAIL'].includes(r.rendition_kind))) {
      add('RENDITION_MISSING', 'No playable rendition is ready.', 'transcode');
    }
    const hasCaption = (context.captions ?? []).some(c => c.caption_state === 'READY');
    if (!hasCaption && !context.accessibility_waiver) {
      add('CAPTIONS_MISSING',
        'Timed media needs a ready caption track or a recorded accessibility waiver.', 'accessibility');
    }
  }

  if (asset.media_kind !== 'DOCUMENT' &&
      !renditions.some(r => ['POSTER', 'THUMBNAIL'].includes(r.rendition_kind) && r.rendition_state === 'READY')) {
    add('POSTER_MISSING', 'No poster or thumbnail is ready.', 'poster');
  }

  if (!asset.title || String(asset.title).trim().length < 2) {
    add('METADATA_INCOMPLETE', 'Title is required.', 'metadata');
  }

  const review = context.moderation;
  if (!review) add('MODERATION_MISSING', 'No pre-publication review recorded.', 'moderation');
  else if (review.verdict === 'BLOCKED') {
    add('MODERATION_BLOCKED', `Blocked: ${(review.reasons ?? []).join('; ') || 'no reason recorded'}`, 'moderation');
  } else if (review.verdict === 'PENDING') {
    add('MODERATION_PENDING', 'Review has not returned a verdict.', 'moderation');
  }

  const partnership = context.partnership;
  if (partnership) {
    if (!(Number(partnership.beneficiary_share_bp) >= 1)) {
      add('BENEFICIARY_SHARE_UNDECLARED',
        'Beneficiary percentage must be declared before publication.', 'partnership');
    }
    if (partnership.consent?.revoked_at) {
      add('CONSENT_REVOKED', 'Family consent has been withdrawn.', 'partnership');
    }
  }

  // A world channel that does not disclose that it is simulated cannot publish.
  const channel = context.channel;
  if (channel && channel.world_status === 'WORLD_SIMULATED' &&
      !String(channel.simulated_disclosure ?? '').trim()) {
    add('WORLD_DISCLOSURE_MISSING',
      'A world channel must carry a visible simulated-media disclosure.', 'channel');
  }

  return {
    asset_id: asset.id ?? null,
    pipeline_state: asset.pipeline_state,
    ready: blockers.length === 0,
    blockers,
    checked_at: new Date().toISOString()
  };
}

/**
 * Resumable upload. Returns the byte range the client should send next so a
 * dropped connection costs the creator one chunk, not the whole upload.
 */
export function nextUploadChunk(session) {
  const total = Number(session.total_bytes);
  const size = Number(session.chunk_size_bytes || 8 * 1024 * 1024);
  const chunkCount = Math.ceil(total / size);
  const received = new Set((session.received_chunks ?? []).map(Number));
  for (let index = 0; index < chunkCount; index += 1) {
    if (!received.has(index)) {
      const start = index * size;
      return {
        complete: false,
        index,
        start,
        end: Math.min(start + size, total) - 1,
        chunk_count: chunkCount,
        remaining: chunkCount - received.size
      };
    }
  }
  return { complete: true, chunk_count: chunkCount, remaining: 0 };
}

export function progressPercent(session) {
  const total = Number(session.total_bytes) || 0;
  if (!total) return 0;
  return Math.min(100, Math.round((Number(session.received_bytes || 0) / total) * 100));
}
