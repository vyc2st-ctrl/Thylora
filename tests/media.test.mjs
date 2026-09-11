// RAE LINK · file validation, metadata and captions
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  sniff, validateFile, sha256Hex, normalizeMetadata, metadataProblems,
  validateVtt, formatBytes, formatDuration, MAX_BYTES
} from '../rae-link/lib/media.js';

const header = (...bytes) => {
  const out = new Uint8Array(32);
  out.set(bytes, 0);
  return out;
};
const JPEG = header(0xff, 0xd8, 0xff, 0xe0);
const PNG = header(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a);
const MP4 = (() => { const b = new Uint8Array(32); b.set([0x00, 0x00, 0x00, 0x20], 0); b.set([0x66, 0x74, 0x79, 0x70], 4); return b; })();

test('files are identified from their bytes, not their name', () => {
  assert.equal(sniff(JPEG).mime, 'image/jpeg');
  assert.equal(sniff(PNG).mime, 'image/png');
  assert.equal(sniff(MP4).kind, 'VIDEO');
  assert.equal(sniff(new Uint8Array(4)).confident, false, 'too short to judge');
});

test('a clean file passes structural validation', () => {
  const result = validateFile({ declaredMime: 'image/jpeg', size: 2048, headerBytes: JPEG });
  assert.equal(result.verdict, 'CLEAN');
  assert.equal(result.detected_mime, 'image/jpeg');
  assert.equal(result.problems.length, 0);
});

test('a file that lies about its type is caught', () => {
  const result = validateFile({ declaredMime: 'video/mp4', size: 2048, headerBytes: JPEG });
  assert.equal(result.verdict, 'ERROR');
  assert.ok(result.problems.some(p => p.code === 'MIME_MISMATCH'));
});

test('an unrecognized file is UNSUPPORTED rather than quietly accepted', () => {
  const result = validateFile({ declaredMime: 'application/zip', size: 500, headerBytes: header(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12) });
  assert.equal(result.verdict, 'UNSUPPORTED');
});

test('an empty file is rejected', () => {
  const result = validateFile({ declaredMime: 'image/jpeg', size: 0, headerBytes: JPEG });
  assert.ok(result.problems.some(p => p.code === 'EMPTY_FILE'));
});

test('an oversized file is rejected against its own kind limit', () => {
  const result = validateFile({ declaredKind: 'IMAGE', declaredMime: 'image/jpeg',
    size: MAX_BYTES.IMAGE + 1, headerBytes: JPEG });
  assert.ok(result.problems.some(p => p.code === 'TOO_LARGE'));
});

test('validation never claims to be a malware scan', () => {
  const result = validateFile({ declaredMime: 'image/jpeg', size: 2048, headerBytes: JPEG });
  assert.equal(result.malware_scanned, false);
  assert.equal(result.scanner, 'rae-link-structural-validation');
});

test('a content hash is a real sha-256', async () => {
  // Known digest of the three bytes "abc".
  const digest = await sha256Hex(new Uint8Array([0x61, 0x62, 0x63]));
  assert.equal(digest, 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
});

test('metadata is normalized and bad values are dropped rather than stored', () => {
  const metadata = normalizeMetadata({
    title: '  A witnessed build  ', duration_seconds: 12.7, width: 1920, height: 1080,
    checksum_sha256: 'not-a-hash', language: '  '
  });
  assert.equal(metadata.title, 'A witnessed build');
  assert.equal(metadata.duration_seconds, 13);
  assert.equal(metadata.checksum_sha256, null, 'a malformed hash is not stored as if it were one');
  assert.equal(metadata.language, 'en');
});

test('a missing title blocks at the metadata stage with a route', () => {
  const problems = metadataProblems(normalizeMetadata({ title: '' }));
  assert.equal(problems[0].code, 'TITLE_REQUIRED');
  assert.equal(problems[0].route, 'metadata');
  assert.equal(metadataProblems(normalizeMetadata({ title: 'Fine title' })).length, 0);
});

test('a caption file must actually be WebVTT with cues', () => {
  assert.equal(validateVtt('not a caption file').valid, false);
  assert.equal(validateVtt('WEBVTT\n\nno cues here').valid, false);
  const good = validateVtt('WEBVTT\n\n00:00:01.000 --> 00:00:04.000\nFirst line.\n\n00:00:05.000 --> 00:00:07.000\nSecond.');
  assert.equal(good.valid, true);
  assert.equal(good.cues, 2);
});

test('sizes and durations render for people', () => {
  assert.equal(formatBytes(0), '0 B');
  assert.equal(formatBytes(2048), '2.0 KB');
  assert.equal(formatBytes(5 * 1024 * 1024), '5.0 MB');
  assert.equal(formatDuration(65), '1:05');
  assert.equal(formatDuration(3725), '1:02:05');
});
