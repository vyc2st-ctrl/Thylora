// RAE LINK · pipeline and publication gate tests
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { publishGate, canTransition, nextUploadChunk, progressPercent, STAGES }
  from '../rae-link/lib/pipeline.js';

const video = { id: 'a1', media_kind: 'VIDEO', title: 'A witnessed build', pipeline_state: 'MODERATION' };

const fullContext = {
  rights: { gate_state: 'PASSED', term_end: null },
  scan: { verdict: 'CLEAN' },
  renditions: [
    { rendition_kind: 'HLS_1080', rendition_state: 'READY' },
    { rendition_kind: 'POSTER', rendition_state: 'READY' }
  ],
  captions: [{ caption_state: 'READY', language: 'en' }],
  moderation: { verdict: 'PASSED' },
  channel: { world_status: 'EARTH_REAL' }
};

test('a complete asset passes the gate', () => {
  const report = publishGate(video, fullContext);
  assert.equal(report.ready, true, JSON.stringify(report.blockers));
  assert.equal(report.blockers.length, 0);
});

test('the gate reports every unmet prerequisite at once, not just the first', () => {
  const report = publishGate({ ...video, title: '' }, {});
  assert.equal(report.ready, false);
  const codes = report.blockers.map(b => b.code);
  assert.ok(codes.includes('RIGHTS_MISSING'));
  assert.ok(codes.includes('VALIDATION_MISSING'));
  assert.ok(codes.includes('RENDITION_MISSING'));
  assert.ok(codes.includes('CAPTIONS_MISSING'));
  assert.ok(codes.includes('POSTER_MISSING'));
  assert.ok(codes.includes('METADATA_INCOMPLETE'));
  assert.ok(codes.includes('MODERATION_MISSING'));
  assert.ok(report.blockers.every(b => b.route), 'every blocker names the route that clears it');
});

test('unresolved rights block publication', () => {
  const report = publishGate(video, { ...fullContext, rights: { gate_state: 'PENDING' } });
  assert.ok(report.blockers.some(b => b.code === 'RIGHTS_NOT_PASSED'));
});

test('an expired licence term blocks publication', () => {
  const report = publishGate(video, { ...fullContext, rights: { gate_state: 'PASSED', term_end: '2020-01-01' } });
  assert.ok(report.blockers.some(b => b.code === 'RIGHTS_EXPIRED'));
});

test('an infected file blocks publication', () => {
  const report = publishGate(video, { ...fullContext, scan: { verdict: 'INFECTED' } });
  assert.ok(report.blockers.some(b => b.code === 'VALIDATION_FAILED'));
});

test('timed media needs captions or a recorded waiver', () => {
  const withoutCaptions = publishGate(video, { ...fullContext, captions: [] });
  assert.ok(withoutCaptions.blockers.some(b => b.code === 'CAPTIONS_MISSING'));

  const waived = publishGate(video, {
    ...fullContext, captions: [],
    accessibility_waiver: { reason: 'silent archival footage', approved_by: 'u1' }
  });
  assert.equal(waived.ready, true);
});

test('an image needs a poster but not captions', () => {
  const report = publishGate({ id: 'i1', media_kind: 'IMAGE', title: 'A photograph' }, {
    rights: { gate_state: 'PASSED' }, scan: { verdict: 'CLEAN' },
    renditions: [{ rendition_kind: 'THUMBNAIL', rendition_state: 'READY' }],
    moderation: { verdict: 'PASSED' }
  });
  assert.equal(report.ready, true, JSON.stringify(report.blockers));
});

test('a world channel without a disclosure cannot publish', () => {
  const report = publishGate(video, {
    ...fullContext,
    channel: { world_status: 'WORLD_SIMULATED', simulated_disclosure: '' }
  });
  assert.ok(report.blockers.some(b => b.code === 'WORLD_DISCLOSURE_MISSING'));
});

test('a partnership without a declared beneficiary share cannot publish', () => {
  const report = publishGate(video, {
    ...fullContext, partnership: { beneficiary_share_bp: 0 }
  });
  assert.ok(report.blockers.some(b => b.code === 'BENEFICIARY_SHARE_UNDECLARED'));
});

test('withdrawn family consent blocks publication', () => {
  const report = publishGate(video, {
    ...fullContext,
    partnership: { beneficiary_share_bp: 5000, consent: { revoked_at: '2026-08-01T00:00:00Z' } }
  });
  assert.ok(report.blockers.some(b => b.code === 'CONSENT_REVOKED'));
});

test('the state machine refuses a jump past the gate', () => {
  assert.equal(canTransition('INPUT', 'PUBLISHED'), false);
  assert.equal(canTransition('UPLOAD', 'PUBLISHED'), false);
  assert.equal(canTransition('MODERATION', 'PUBLISHED'), true);
  assert.equal(canTransition('INPUT', 'RIGHTS_GATE'), true);
  assert.equal(canTransition('PUBLISHED', 'ARCHIVED'), true);
  // Archive is reversible; a withdrawn asset is not silently republished.
  assert.equal(canTransition('ARCHIVED', 'PUBLISHED'), true);
  assert.equal(canTransition('WITHDRAWN', 'PUBLISHED'), false);
});

test('rights come before upload in the declared stage order', () => {
  assert.ok(STAGES.indexOf('RIGHTS_GATE') < STAGES.indexOf('UPLOAD'));
  assert.ok(STAGES.indexOf('MODERATION') < STAGES.indexOf('PUBLISHED'));
});

test('a resumed upload continues at the first missing chunk', () => {
  const session = { total_bytes: 25_000_000, chunk_size_bytes: 8_388_608, received_chunks: [0, 1] };
  const next = nextUploadChunk(session);
  assert.equal(next.complete, false);
  assert.equal(next.index, 2);
  assert.equal(next.start, 16_777_216);
  assert.equal(next.chunk_count, 3);
  assert.equal(next.remaining, 1);
});

test('a gap in the middle is refilled rather than skipped', () => {
  const session = { total_bytes: 25_000_000, chunk_size_bytes: 8_388_608, received_chunks: [0, 2] };
  assert.equal(nextUploadChunk(session).index, 1);
});

test('a finished upload reports complete', () => {
  const session = { total_bytes: 25_000_000, chunk_size_bytes: 8_388_608, received_chunks: [0, 1, 2] };
  assert.equal(nextUploadChunk(session).complete, true);
  assert.equal(progressPercent({ total_bytes: 100, received_bytes: 50 }), 50);
});
