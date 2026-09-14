// THYLORA Dashboard R6 · readback position math
// Canonical backend record: THY-DASH-VOICE-SPINE-001
// Idea record: THY-IDEA-DASHBOARD-SCREEN-ARCHITECTURE-001
//
// The Web Speech API cannot seek. It speaks an utterance from the beginning and
// gives no scrub bar. Everything the Chairman asked for — pause, resume, jump
// back ten seconds, jump forward, change speed mid-sentence, and anchor a spoken
// note to the exact place in the response — therefore has to be built on top of
// a position model this module owns.
//
// The model is: the authoritative position is a CHARACTER OFFSET into the
// response text, never a wall-clock time and never a browser-internal cursor.
// A character offset is rate-independent, so changing speed does not move the
// Chairman's place in the response, and it survives the cancel/re-speak cycle
// that every control in this lane uses.
//
// Time is a derived view of that offset. Seconds are converted to characters at
// the current rate only at the moment a jump is requested.
//
// No floating-point drift is allowed to accumulate: positions are integers.

/** Characters spoken per second at rate 1.0, before calibration. */
export const BASE_CHARS_PER_SECOND = 17.5;

/** Bounds accepted for playback speed. Matches the control lane. */
export const MIN_RATE = 0.5;
export const MAX_RATE = 2.5;

/** The Chairman's jump-back step, in seconds. */
export const JUMP_BACK_SECONDS = 10;

/** The Chairman's jump-forward step, in seconds. */
export const JUMP_FORWARD_SECONDS = 10;

/** Volume the readback drops to while the Chairman is speaking a margin note. */
export const DUCK_VOLUME = 0.12;

export const READBACK_STATES = Object.freeze({
  IDLE: 'IDLE',
  SPEAKING: 'SPEAKING',
  PAUSED: 'PAUSED',
  DUCKED: 'DUCKED',
  ENDED: 'ENDED'
});

const clampInt = (n, lo, hi) => Math.max(lo, Math.min(hi, Math.round(n)));

/**
 * Clamp a requested rate into the supported band.
 */
export function clampRate(rate) {
  const r = Number(rate);
  if (!Number.isFinite(r)) return 1;
  return Math.max(MIN_RATE, Math.min(MAX_RATE, r));
}

/**
 * Split a response into speakable segments.
 *
 * Segments exist for three reasons:
 *   1. A short utterance can be cancelled and re-spoken quickly, which is how
 *      pause/resume/jump/duck are implemented without a seek API.
 *   2. Browsers that never fire `boundary` events (iOS Safari is inconsistent)
 *      still give us `end` events, so segment ends are real, measured positions
 *      that correct any estimate drift.
 *   3. A note anchored mid-response can name the sentence it belongs to.
 *
 * Every character of the original text lands in exactly one segment, and the
 * segments are contiguous, so `segments` can always be re-joined into the exact
 * original response. That invariant is tested.
 */
export function segmentResponse(text) {
  const source = String(text ?? '');
  if (!source) return [];
  const segments = [];
  const boundary = /[.!?…]["')\]]*\s+|\n+/g;
  let start = 0;
  let match;
  while ((match = boundary.exec(source)) !== null) {
    const end = match.index + match[0].length;
    segments.push({ index: segments.length, start, end, text: source.slice(start, end) });
    start = end;
  }
  if (start < source.length) {
    segments.push({ index: segments.length, start, end: source.length, text: source.slice(start) });
  }
  return splitOverlongSegments(segments, source);
}

/**
 * A single sentence can still be long enough that cancelling it loses the
 * Chairman's place by many seconds. Long segments are cut at word boundaries so
 * no segment exceeds MAX_SEGMENT_CHARS. Contiguity is preserved.
 */
const MAX_SEGMENT_CHARS = 240;

function splitOverlongSegments(segments, source) {
  const out = [];
  for (const seg of segments) {
    if (seg.end - seg.start <= MAX_SEGMENT_CHARS) { out.push(seg); continue; }
    let cursor = seg.start;
    while (cursor < seg.end) {
      let cut = Math.min(cursor + MAX_SEGMENT_CHARS, seg.end);
      if (cut < seg.end) {
        const space = source.lastIndexOf(' ', cut);
        if (space > cursor) cut = space + 1;
      }
      out.push({ index: 0, start: cursor, end: cut, text: source.slice(cursor, cut) });
      cursor = cut;
    }
  }
  return out.map((seg, i) => ({ ...seg, index: i }));
}

/**
 * Characters spoken per second at a given rate, with an optional calibration
 * factor measured from real speech (see `calibrate`).
 */
export function charsPerSecond(rate = 1, calibration = 1) {
  return BASE_CHARS_PER_SECOND * clampRate(rate) * (calibration > 0 ? calibration : 1);
}

/** Seconds a span of characters takes to speak at this rate. */
export function charsToSeconds(chars, rate = 1, calibration = 1) {
  return Math.max(0, chars) / charsPerSecond(rate, calibration);
}

/** Characters spoken in a span of seconds at this rate. */
export function secondsToChars(seconds, rate = 1, calibration = 1) {
  return seconds * charsPerSecond(rate, calibration);
}

/**
 * The shortest utterance worth learning from. A three-character remainder is
 * dominated by the engine's own start-up latency, so its apparent rate says
 * nothing about how fast this voice speaks. Learning from those samples makes
 * the calibration wander, and a wandering calibration means "jump back ten
 * seconds" quietly stops being ten seconds.
 */
export const MIN_CALIBRATION_CHARS = 40;

/**
 * Measure real speech to correct the estimate. When a segment finishes, the
 * caller knows exactly how many characters were spoken and how long it actually
 * took. That ratio is folded into a running calibration so that "jump back ten
 * seconds" means ten real seconds on this Chairman's device and voice, not ten
 * seconds of a textbook average.
 *
 * The new observation is weighted lightly so one stuttering segment cannot
 * throw the model; the factor is clamped to a sane band; and samples too short
 * to be meaningful are ignored outright.
 */
export function calibrate(previous, { chars, elapsedSeconds, rate = 1, weight = 0.25 }) {
  const prior = previous > 0 ? previous : 1;
  if (!(chars > 0) || !(elapsedSeconds > 0)) return prior;
  if (chars < MIN_CALIBRATION_CHARS) return prior;
  const observed = (chars / elapsedSeconds) / (BASE_CHARS_PER_SECOND * clampRate(rate));
  if (!Number.isFinite(observed) || observed <= 0) return prior;
  const blended = prior * (1 - weight) + observed * weight;
  return Math.max(0.4, Math.min(2.5, blended));
}

/**
 * Locate a character offset inside the segment list.
 * Returns the segment that owns the offset and the offset within it.
 */
export function locate(segments, char) {
  if (!segments.length) return { segmentIndex: -1, offsetInSegment: 0, segment: null };
  const c = Math.max(0, char);
  for (const seg of segments) {
    if (c < seg.end) {
      return { segmentIndex: seg.index, offsetInSegment: Math.max(0, c - seg.start), segment: seg };
    }
  }
  const last = segments[segments.length - 1];
  return { segmentIndex: last.index, offsetInSegment: last.end - last.start, segment: last };
}

/**
 * The speaking plan from a character offset to the end of the response.
 *
 * The first entry is the remainder of the segment the offset falls inside, so
 * resuming after a pause or a jump starts mid-sentence at the exact word the
 * Chairman left off, not at the top of the paragraph.
 */
export function resumePlan(segments, char) {
  if (!segments.length) return [];
  const from = Math.max(0, Math.min(char, segments[segments.length - 1].end));
  const plan = [];
  for (const seg of segments) {
    if (seg.end <= from) continue;
    const startChar = Math.max(seg.start, from);
    plan.push({
      segmentIndex: seg.index,
      startChar,
      endChar: seg.end,
      text: seg.text.slice(startChar - seg.start)
    });
  }
  return plan;
}

/**
 * Move the position by a number of seconds, positive or negative.
 * Jumping past the end lands exactly on the end; jumping before the start lands
 * on zero. Neither is an error — the Chairman gets a defined position either way.
 */
export function seek({ char, totalChars, deltaSeconds, rate = 1, calibration = 1 }) {
  const delta = secondsToChars(deltaSeconds, rate, calibration);
  return clampInt(char + delta, 0, Math.max(0, totalChars));
}

/**
 * A complete, presentable view of where the Chairman is in the response.
 * This is what the transport bar and every note anchor read from.
 */
export function positionReport({ segments, char, totalChars, rate = 1, calibration = 1 }) {
  const total = totalChars ?? (segments.length ? segments[segments.length - 1].end : 0);
  const c = clampInt(char, 0, total);
  const found = locate(segments, c);
  return {
    char: c,
    totalChars: total,
    percent: total > 0 ? Math.round((c / total) * 1000) / 10 : 0,
    elapsedSeconds: Math.round(charsToSeconds(c, rate, calibration) * 10) / 10,
    totalSeconds: Math.round(charsToSeconds(total, rate, calibration) * 10) / 10,
    remainingSeconds: Math.round(charsToSeconds(total - c, rate, calibration) * 10) / 10,
    segmentIndex: found.segmentIndex,
    offsetInSegment: found.offsetInSegment
  };
}

/** mm:ss for the transport readout. */
export function clock(seconds) {
  const s = Math.max(0, Math.round(Number(seconds) || 0));
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')}`;
}
