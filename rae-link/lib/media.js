// RAE LINK · media metadata, file validation, poster handling
// Workroom: WR-RAELINK-001
//
// IMPORTANT: nothing here is a virus scan. This module checks that a file is
// what it claims to be — magic bytes against declared type, size bounds, and a
// content hash. Malware scanning is a separate pipeline stage backed by a
// provider that has not been chosen (capability `virus_scan`, still OPEN), and
// the publish gate blocks on a missing scan regardless of what this returns.

export const MAX_BYTES = Object.freeze({
  VIDEO: 8 * 1024 * 1024 * 1024,
  AUDIO: 2 * 1024 * 1024 * 1024,
  IMAGE: 64 * 1024 * 1024,
  EDF: 512 * 1024 * 1024,
  DOCUMENT: 256 * 1024 * 1024
});

const SIGNATURES = [
  { mime: 'image/jpeg', kind: 'IMAGE', test: b => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { mime: 'image/png',  kind: 'IMAGE', test: b => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 },
  { mime: 'image/gif',  kind: 'IMAGE', test: b => b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 },
  { mime: 'image/webp', kind: 'IMAGE', test: b => ascii(b, 0, 4) === 'RIFF' && ascii(b, 8, 4) === 'WEBP' },
  { mime: 'video/mp4',  kind: 'VIDEO', test: b => ascii(b, 4, 4) === 'ftyp' },
  { mime: 'video/webm', kind: 'VIDEO', test: b => b[0] === 0x1a && b[1] === 0x45 && b[2] === 0xdf && b[3] === 0xa3 },
  { mime: 'audio/mpeg', kind: 'AUDIO', test: b => (b[0] === 0x49 && b[1] === 0x44 && b[2] === 0x33) || (b[0] === 0xff && (b[1] & 0xe0) === 0xe0) },
  { mime: 'audio/wav',  kind: 'AUDIO', test: b => ascii(b, 0, 4) === 'RIFF' && ascii(b, 8, 4) === 'WAVE' },
  { mime: 'audio/ogg',  kind: 'AUDIO', test: b => ascii(b, 0, 4) === 'OggS' },
  { mime: 'application/pdf', kind: 'DOCUMENT', test: b => ascii(b, 0, 4) === '%PDF' }
];

function ascii(bytes, start, length) {
  let out = '';
  for (let i = start; i < start + length; i += 1) out += String.fromCharCode(bytes[i] ?? 0);
  return out;
}

/** Identify a file from its leading bytes rather than trusting its name or its header. */
export function sniff(headerBytes) {
  const bytes = headerBytes instanceof Uint8Array ? headerBytes : new Uint8Array(headerBytes ?? []);
  if (bytes.length < 12) return { mime: null, kind: null, confident: false };
  for (const signature of SIGNATURES) {
    if (signature.test(bytes)) return { mime: signature.mime, kind: signature.kind, confident: true };
  }
  return { mime: null, kind: null, confident: false };
}

/**
 * Structural file validation. Returns a verdict in the same vocabulary as
 * rael_scan_results so the result slots straight into the pipeline record.
 */
export function validateFile({ declaredMime = null, declaredKind = null, size = 0, headerBytes = null } = {}) {
  const problems = [];
  const detected = sniff(headerBytes);

  if (!Number.isFinite(size) || size <= 0) {
    problems.push({ code: 'EMPTY_FILE', detail: 'The file is empty.' });
  }
  const kind = declaredKind ?? detected.kind;
  const cap = MAX_BYTES[kind] ?? MAX_BYTES.DOCUMENT;
  if (size > cap) {
    problems.push({ code: 'TOO_LARGE', detail: `File is larger than the ${kind ?? 'file'} limit of ${cap} bytes.` });
  }
  if (!detected.confident) {
    problems.push({ code: 'UNRECOGNIZED_FORMAT', detail: 'The file type could not be identified from its contents.' });
  } else if (declaredMime && declaredMime !== detected.mime) {
    problems.push({
      code: 'MIME_MISMATCH',
      detail: `The file says it is ${declaredMime} but its contents are ${detected.mime}.`
    });
  } else if (declaredKind && detected.kind && declaredKind !== detected.kind) {
    problems.push({
      code: 'KIND_MISMATCH',
      detail: `Declared as ${declaredKind} but the file contains ${detected.kind}.`
    });
  }

  return {
    verdict: problems.length === 0 ? 'CLEAN' : problems.some(p => p.code === 'UNRECOGNIZED_FORMAT') ? 'UNSUPPORTED' : 'ERROR',
    declared_mime: declaredMime,
    detected_mime: detected.mime,
    detected_kind: detected.kind,
    size,
    problems,
    // Said plainly so this is never mistaken for malware clearance.
    scanner: 'rae-link-structural-validation',
    malware_scanned: false
  };
}

/** Content hash, using the platform WebCrypto available in both browser and Node. */
export async function sha256Hex(bytes) {
  const source = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  const digest = await globalThis.crypto.subtle.digest('SHA-256', source);
  return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('');
}

export function normalizeMetadata(input = {}) {
  const title = String(input.title ?? '').trim();
  const duration = Number(input.duration_seconds ?? 0);
  return {
    title,
    description: String(input.description ?? '').trim() || null,
    language: (String(input.language ?? 'en').trim() || 'en').slice(0, 12),
    duration_seconds: Number.isFinite(duration) && duration > 0 ? Math.round(duration) : null,
    width: Number.isInteger(input.width) ? input.width : null,
    height: Number.isInteger(input.height) ? input.height : null,
    byte_size: Number.isInteger(input.byte_size) ? input.byte_size : null,
    checksum_sha256: /^[a-f0-9]{64}$/.test(input.checksum_sha256 ?? '') ? input.checksum_sha256 : null
  };
}

export function metadataProblems(metadata) {
  const problems = [];
  if (!metadata.title || metadata.title.length < 2) {
    problems.push({ code: 'TITLE_REQUIRED', detail: 'A title of at least two characters is required.', route: 'metadata' });
  }
  if (metadata.title && metadata.title.length > 180) {
    problems.push({ code: 'TITLE_TOO_LONG', detail: 'Titles are limited to 180 characters.', route: 'metadata' });
  }
  return problems;
}

/** A WebVTT caption track must actually be WebVTT before it is stored as one. */
export function validateVtt(text) {
  const body = String(text ?? '');
  if (!body.startsWith('WEBVTT')) {
    return { valid: false, problems: [{ code: 'NOT_WEBVTT', detail: 'A caption file must begin with WEBVTT.' }] };
  }
  const cues = body.split(/\r?\n\r?\n/).filter(block => block.includes('-->')).length;
  if (cues === 0) {
    return { valid: false, problems: [{ code: 'NO_CUES', detail: 'The caption file contains no timed cues.' }] };
  }
  return { valid: true, cues, problems: [] };
}

/* ---------------------------------------------------------- browser helpers */
/* These need a DOM. They are pure functions of the element passed in, so the
   rest of the module stays testable under Node. */

/** Read duration and pixel size from a loaded media element. */
export function readMediaElementMetadata(element) {
  if (!element) return {};
  return {
    duration_seconds: Number.isFinite(element.duration) ? Math.round(element.duration) : null,
    width: element.videoWidth || element.naturalWidth || null,
    height: element.videoHeight || element.naturalHeight || null
  };
}

/**
 * Capture a poster frame from a video element onto a canvas. Runs entirely in
 * the browser: no transcoding provider is needed to get a thumbnail, which is
 * why POSTER is not blocked behind the still-open `video_transcode` decision.
 */
export function capturePoster(videoElement, { maxWidth = 1280, mimeType = 'image/jpeg', quality = 0.82 } = {}) {
  const canvas = document.createElement('canvas');
  const sourceWidth = videoElement.videoWidth || maxWidth;
  const sourceHeight = videoElement.videoHeight || Math.round(maxWidth * 9 / 16);
  const scale = Math.min(1, maxWidth / sourceWidth);
  canvas.width = Math.max(1, Math.round(sourceWidth * scale));
  canvas.height = Math.max(1, Math.round(sourceHeight * scale));
  const context = canvas.getContext('2d');
  context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
  return { dataUrl: canvas.toDataURL(mimeType, quality), width: canvas.width, height: canvas.height };
}

/** Same idea for a still image: downscale to a poster without a provider. */
export function resizeImage(imageElement, { maxWidth = 1280, mimeType = 'image/jpeg', quality = 0.85 } = {}) {
  const canvas = document.createElement('canvas');
  const scale = Math.min(1, maxWidth / (imageElement.naturalWidth || maxWidth));
  canvas.width = Math.max(1, Math.round((imageElement.naturalWidth || maxWidth) * scale));
  canvas.height = Math.max(1, Math.round((imageElement.naturalHeight || maxWidth) * scale));
  canvas.getContext('2d').drawImage(imageElement, 0, 0, canvas.width, canvas.height);
  return { dataUrl: canvas.toDataURL(mimeType, quality), width: canvas.width, height: canvas.height };
}

export function formatBytes(bytes) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let value = Number(bytes || 0);
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) { value /= 1024; unit += 1; }
  return `${value < 10 && unit > 0 ? value.toFixed(1) : Math.round(value)} ${units[unit]}`;
}

export function formatDuration(seconds) {
  const total = Math.max(0, Math.round(Number(seconds) || 0));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    : `${m}:${String(s).padStart(2, '0')}`;
}
