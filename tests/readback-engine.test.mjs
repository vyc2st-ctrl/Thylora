// THYLORA Dashboard R6 · readback transport tests
// Canonical backend record: THY-DASH-VOICE-SPINE-001
//
// The engine is exercised against a deterministic stand-in for the platform
// voice. That proves the transport, the position bookkeeping and the ducking.
// It does not prove audio — audio is what the iPad witness is for.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ReadbackEngine } from '../dashboard/r6/readback-engine.js';
import { READBACK_STATES, DUCK_VOLUME } from '../dashboard/r6/lib/readback.js';

const TEXT = [
  'The storefront is live in three territories and the passports are issued.',
  'Payment acceptance is not connected, so no order can complete yet.',
  'The media network is producing but nothing has been published outside the family.',
  'We ship on Friday regardless of the payment rail state.'
].join(' ');

/** A voice that speaks instantly and records exactly what it was asked to say. */
function harness() {
  const spoken = [];
  let cancels = 0;
  let current = null;
  const synth = {
    speak(u) { spoken.push({ text: u.text, rate: u.rate, volume: u.volume }); current = u; },
    cancel() { cancels++; current = null; }
  };
  const engine = new ReadbackEngine({
    synth,
    makeUtterance: text => ({ text, rate: 1, volume: 1, lang: 'en-US' })
  });
  return {
    engine, spoken, synth,
    get cancels() { return cancels; },
    get last() { return spoken[spoken.length - 1]; },
    /** Let the current utterance finish, as the platform voice would. */
    finish() { current?.onend?.({}); },
    boundary(charIndex) { current?.onboundary?.({ charIndex }); }
  };
}

test('loading segments the response without speaking it', () => {
  const h = harness();
  const segments = h.engine.load(TEXT);
  assert.ok(segments >= 4);
  assert.equal(h.spoken.length, 0);
  assert.equal(h.engine.state, READBACK_STATES.IDLE);
  assert.equal(h.engine.position().char, 0);
});

test('speak starts at the top and says the first segment', () => {
  const h = harness();
  h.engine.load(TEXT);
  h.engine.speak();
  assert.equal(h.engine.state, READBACK_STATES.SPEAKING);
  assert.ok(TEXT.startsWith(h.spoken[0].text));
});

test('pause holds the exact place and resume continues mid-sentence', () => {
  const h = harness();
  h.engine.load(TEXT);
  h.engine.speak();
  h.boundary(30);
  const held = h.engine.position().char;
  assert.equal(held, 30);

  h.engine.pause();
  assert.equal(h.engine.state, READBACK_STATES.PAUSED);
  assert.equal(h.engine.position().char, held, 'the mark does not move while paused');

  h.engine.resume();
  assert.equal(h.engine.state, READBACK_STATES.SPEAKING);
  assert.equal(h.last.text, TEXT.slice(30, h.engine.segments[0].end),
    'resumes from the exact character, not the start of the sentence');
});

test('stop silences the voice and returns to the top', () => {
  const h = harness();
  h.engine.load(TEXT);
  h.engine.speak();
  h.boundary(40);
  h.engine.stop();
  assert.equal(h.engine.state, READBACK_STATES.IDLE);
  assert.equal(h.engine.position().char, 0);
  assert.ok(h.cancels > 0);
});

test('jump back moves the mark back and keeps speaking', () => {
  const h = harness();
  h.engine.load(TEXT);
  h.engine.speak();
  const from = Math.round(TEXT.length * 0.8);
  h.engine.seekTo(from);
  h.engine.jumpBack();
  const after = h.engine.position().char;
  assert.ok(after < from && after > 0, `landed at ${after} from ${from}`);
  assert.equal(h.engine.state, READBACK_STATES.SPEAKING);
  assert.equal(h.last.text, TEXT.slice(after, h.engine.segments[h.engine.position().segmentIndex].end));
});

test('jumping back past the start lands on the start, not below it', () => {
  const h = harness();
  h.engine.load(TEXT);
  h.engine.speak();
  h.engine.seekTo(20);
  h.engine.jumpBack();
  assert.equal(h.engine.position().char, 0);
});

test('seekTo moves BACKWARD as well as forward — a note taken earlier can be revisited', () => {
  const h = harness();
  h.engine.load(TEXT);
  h.engine.speak();
  const late = Math.round(TEXT.length * 0.85);
  h.engine.seekTo(late);
  assert.equal(h.engine.position().char, late);

  // this is the "Jump to place" button on a note anchored earlier in the response
  h.engine.seekTo(45);
  assert.equal(h.engine.position().char, 45, 'seeking backward must actually go back');
  assert.ok(h.last.text.startsWith(TEXT.slice(45, 60)));
});

test('seeking past the end of the response lands on the end', () => {
  const h = harness();
  h.engine.load(TEXT);
  h.engine.speak();
  h.engine.seekTo(TEXT.length + 5000);
  assert.equal(h.engine.position().char, TEXT.length);
});

test('seekTo while paused moves the mark without breaking the silence', () => {
  const h = harness();
  h.engine.load(TEXT);
  h.engine.speak();
  h.engine.pause();
  const before = h.spoken.length;
  h.engine.seekTo(100);
  assert.equal(h.engine.position().char, 100);
  assert.equal(h.engine.state, READBACK_STATES.PAUSED);
  assert.equal(h.spoken.length, before, 'nothing was spoken');
});

test('a speed change re-speaks from the same place at the new rate', () => {
  const h = harness();
  h.engine.load(TEXT);
  h.engine.speak();
  h.boundary(25);
  h.engine.setRate(1.8);
  assert.equal(h.engine.position().char, 25, 'the place did not move');
  assert.equal(h.last.rate, 1.8);
  assert.equal(h.last.text, TEXT.slice(25, h.engine.segments[0].end));
});

test('speed is clamped rather than accepted blindly', () => {
  const h = harness();
  h.engine.load(TEXT);
  assert.equal(h.engine.setRate(99), 2.5);
  assert.equal(h.engine.setRate(0.01), 0.5);
});

test('ducking keeps the readback running quietly and returns the anchor', () => {
  const h = harness();
  h.engine.load(TEXT);
  h.engine.speak();
  h.boundary(60);

  const anchor = h.engine.duck();
  assert.equal(anchor.char, 60, 'the anchor is the place at the moment of the press');
  assert.equal(h.engine.state, READBACK_STATES.DUCKED);
  assert.equal(h.last.volume, DUCK_VOLUME);

  h.engine.restore();
  assert.equal(h.engine.state, READBACK_STATES.SPEAKING);
  assert.equal(h.last.volume, 1);
});

test('with hold-while-speaking set, the readback pauses instead of ducking', () => {
  const h = harness();
  h.engine.load(TEXT);
  h.engine.holdWhileSpeaking = true;
  h.engine.speak();
  h.boundary(60);

  const anchor = h.engine.duck();
  assert.equal(anchor.char, 60);
  assert.equal(h.engine.state, READBACK_STATES.PAUSED, 'held, not running quietly');

  h.engine.restore();
  assert.equal(h.engine.state, READBACK_STATES.SPEAKING);
  assert.equal(h.engine.position().char, 60, 'nothing was missed while the Chairman spoke');
});

test('a cancelled utterance never loses the place it had reached', () => {
  const h = harness();
  h.engine.load(TEXT);
  h.engine.speak();
  h.boundary(52);
  h.engine.pause();               // cancels mid-utterance
  assert.ok(h.engine.position().char >= 52);
});

test('finishing a segment advances the mark by the measured amount', () => {
  const h = harness();
  h.engine.load(TEXT);
  h.engine.speak();
  const firstEnd = h.engine.segments[0].end;
  h.finish();
  assert.equal(h.engine.position().char, firstEnd, 'the segment end is measured, not estimated');
  assert.ok(h.last.text.startsWith(TEXT.slice(firstEnd, firstEnd + 10)), 'moved on to the next segment');
});

test('the response ends cleanly and speak starts it over', () => {
  const h = harness();
  h.engine.load(TEXT);
  h.engine.speak();
  for (let i = 0; i < h.engine.segments.length; i++) h.finish();
  assert.equal(h.engine.state, READBACK_STATES.ENDED);
  assert.equal(h.engine.position().char, TEXT.length);

  h.engine.speak();
  assert.equal(h.engine.position().char, 0, 'speaking again starts from the top');
});

test('a cancel reported as an error is not treated as a fault', () => {
  const h = harness();
  h.engine.load(TEXT);
  const errors = [];
  h.engine.on('error', e => errors.push(e));
  h.engine.speak();
  h.engine.current.utterance.onerror?.({ error: 'canceled' });
  assert.deepEqual(errors, []);
  assert.equal(h.engine.state, READBACK_STATES.SPEAKING);
});

test('transport calls on an empty engine do nothing rather than throw', () => {
  const h = harness();
  assert.equal(h.engine.speak(), false);
  assert.equal(h.engine.jump(-10), false);
  assert.equal(h.engine.seekTo(50), false);
  assert.equal(h.engine.pause(), false);
  assert.equal(h.engine.resume(), false);
});
