// THYLORA Dashboard R6 · readback position math tests
// Canonical backend record: THY-DASH-VOICE-SPINE-001
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  segmentResponse, resumePlan, locate, seek, positionReport, calibrate,
  charsToSeconds, secondsToChars, clampRate, clock, MIN_RATE, MAX_RATE
} from '../dashboard/r6/lib/readback.js';

const RESPONSE = 'The store is live. Payment is not connected yet! Should we ship? We ship Friday.';

test('segments cover the response exactly and rejoin to the original', () => {
  const segments = segmentResponse(RESPONSE);
  assert.ok(segments.length >= 4);
  assert.equal(segments.map(s => s.text).join(''), RESPONSE);
  assert.equal(segments[0].start, 0);
  assert.equal(segments[segments.length - 1].end, RESPONSE.length);
  // contiguous, no gaps and no overlap
  for (let i = 1; i < segments.length; i++) {
    assert.equal(segments[i].start, segments[i - 1].end);
  }
});

test('a very long sentence is cut so a cancel cannot lose much ground', () => {
  const long = 'word '.repeat(300);
  const segments = segmentResponse(long);
  assert.ok(segments.length > 1);
  assert.ok(segments.every(s => s.end - s.start <= 240));
  assert.equal(segments.map(s => s.text).join(''), long);
});

test('an empty response produces no segments rather than throwing', () => {
  assert.deepEqual(segmentResponse(''), []);
  assert.deepEqual(segmentResponse(null), []);
});

test('resuming starts mid-sentence at the exact offset, not at the paragraph', () => {
  const segments = segmentResponse(RESPONSE);
  const plan = resumePlan(segments, 23);   // inside the second sentence
  assert.equal(plan[0].startChar, 23);
  assert.equal(RESPONSE.slice(23).startsWith(plan[0].text), true);
  // the whole remainder of the response is still planned
  assert.equal(plan.map(p => p.text).join(''), RESPONSE.slice(23));
});

test('jump back ten seconds moves back a real ten seconds of speech', () => {
  const rate = 1;
  const from = 400;
  const back = seek({ char: from, totalChars: 1000, deltaSeconds: -10, rate });
  assert.ok(back < from);
  const movedSeconds = charsToSeconds(from - back, rate);
  assert.ok(Math.abs(movedSeconds - 10) < 0.1, `moved ${movedSeconds}s`);
});

test('jumping past either end lands on a defined position, never out of range', () => {
  assert.equal(seek({ char: 5, totalChars: 100, deltaSeconds: -600, rate: 1 }), 0);
  assert.equal(seek({ char: 95, totalChars: 100, deltaSeconds: 600, rate: 1 }), 100);
});

test('the character offset does not move when only the speed changes', () => {
  const slow = positionReport({ segments: segmentResponse(RESPONSE), char: 40, rate: 0.75 });
  const fast = positionReport({ segments: segmentResponse(RESPONSE), char: 40, rate: 2 });
  assert.equal(slow.char, fast.char);
  assert.equal(slow.segmentIndex, fast.segmentIndex);
  // but the clock does move, because it takes less time to reach the same place
  assert.ok(fast.elapsedSeconds < slow.elapsedSeconds);
});

test('a jump of ten seconds covers fewer characters at a slower rate', () => {
  const slow = secondsToChars(10, 0.5);
  const fast = secondsToChars(10, 2);
  assert.ok(slow < fast);
});

test('rate is clamped into the supported band', () => {
  assert.equal(clampRate(0.1), MIN_RATE);
  assert.equal(clampRate(9), MAX_RATE);
  assert.equal(clampRate('not a number'), 1);
});

test('locate finds the segment that owns an offset, including the last character', () => {
  const segments = segmentResponse(RESPONSE);
  assert.equal(locate(segments, 0).segmentIndex, 0);
  assert.equal(locate(segments, RESPONSE.length).segmentIndex, segments.length - 1);
  const mid = locate(segments, 25);
  assert.ok(mid.segment.start <= 25 && 25 < mid.segment.end);
});

test('calibration moves toward measured speech and stays inside sane bounds', () => {
  // spoke 350 chars in 10s at rate 1 => 35 chars/sec, twice the 17.5 default
  const faster = calibrate(1, { chars: 350, elapsedSeconds: 10, rate: 1 });
  assert.ok(faster > 1, 'should adjust upward');
  assert.ok(faster <= 2.5);
  // nonsense observations leave the prior untouched
  assert.equal(calibrate(1.3, { chars: 0, elapsedSeconds: 10, rate: 1 }), 1.3);
  assert.equal(calibrate(1.3, { chars: 10, elapsedSeconds: 0, rate: 1 }), 1.3);
});

test('a calibrated jump back is still ten real seconds', () => {
  const calibration = calibrate(1, { chars: 350, elapsedSeconds: 10, rate: 1 });
  const from = 800;
  const back = seek({ char: from, totalChars: 2000, deltaSeconds: -10, rate: 1, calibration });
  assert.ok(Math.abs(charsToSeconds(from - back, 1, calibration) - 10) < 0.1);
});

test('the transport clock reads as minutes and seconds', () => {
  assert.equal(clock(0), '0:00');
  assert.equal(clock(9), '0:09');
  assert.equal(clock(75), '1:15');
  assert.equal(clock(-5), '0:00');
});

test('utterances too short to be meaningful do not skew the calibration', async () => {
  const { MIN_CALIBRATION_CHARS } = await import('../dashboard/r6/lib/readback.js');
  // A three-character remainder that took 200ms looks like a 15x speaker. If that
  // were learned, "jump back ten seconds" would stop being ten seconds.
  const skewed = calibrate(1, { chars: 3, elapsedSeconds: 0.2, rate: 1 });
  assert.equal(skewed, 1, 'a tiny sample is ignored');
  assert.ok(MIN_CALIBRATION_CHARS >= 40);

  // A sample long enough to mean something is still learned from.
  const learned = calibrate(1, { chars: 200, elapsedSeconds: 8, rate: 1 });
  assert.notEqual(learned, 1);
});

test('the jump step stays near ten seconds across a run of short segments', () => {
  let calibration = 1;
  for (let i = 0; i < 40; i++) {
    calibration = calibrate(calibration, { chars: 4, elapsedSeconds: 0.05, rate: 1 });
  }
  assert.equal(calibration, 1, 'forty noisy samples changed nothing');
  const from = 500;
  const back = seek({ char: from, totalChars: 2000, deltaSeconds: -10, rate: 1, calibration });
  assert.ok(Math.abs(charsToSeconds(from - back, 1, calibration) - 10) < 0.1);
});
