// THYLORA Dashboard R6 · readback transport
// Canonical backend record: THY-DASH-VOICE-SPINE-001
//
// Drives window.speechSynthesis from the character-offset model in
// lib/readback.js. Every control — Speak, Pause, Resume, Stop, Jump Back 10s,
// Jump Forward, speed, and the duck used by margin notes — is the same two
// steps: move the character offset, then re-speak from it.
//
// That single mechanism is deliberate. speechSynthesis.pause()/resume() are
// unreliable on iPadOS Safari, which is the Chairman's first surface. Rather
// than run one code path on iPad and another on desktop, this engine never
// relies on the browser's own pause. It cancels and re-speaks from an offset it
// owns. The behaviour is then identical on both surfaces, which is what lets
// the iPad proof mean something for desktop.

import {
  segmentResponse, resumePlan, positionReport, seek, clampRate, calibrate,
  charsToSeconds, READBACK_STATES, DUCK_VOLUME, JUMP_BACK_SECONDS, JUMP_FORWARD_SECONDS
} from './lib/readback.js';

const TICK_MS = 100;

export class ReadbackEngine {
  constructor(options = {}) {
    this.synth = options.synth || (typeof window !== 'undefined' ? window.speechSynthesis : null);
    this.makeUtterance = options.makeUtterance
      || (text => new window.SpeechSynthesisUtterance(text));
    this.text = '';
    this.segments = [];
    this.char = 0;
    this.rate = 1;
    this.volume = 1;
    this.calibration = 1;
    this.state = READBACK_STATES.IDLE;
    this.holdWhileSpeaking = false;   // Chairman preference; see duck()
    this.listeners = new Map();
    this.ticker = null;
    this.current = null;              // { utterance, startChar, endChar, startedAt }
    this.queue = [];
    this.responseId = null;
  }

  get available() { return !!this.synth; }

  on(event, handler) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event).add(handler);
    return () => this.listeners.get(event)?.delete(handler);
  }

  emit(event, payload) {
    for (const handler of this.listeners.get(event) || []) {
      try { handler(payload); } catch (err) { console.error('[readback]', event, err); }
    }
  }

  /** Load a response for readback. Does not start speaking. */
  load(text, { responseId = null, autoStart = false } = {}) {
    this.stop();
    this.text = String(text ?? '');
    this.segments = segmentResponse(this.text);
    this.char = 0;
    this.responseId = responseId;
    this.setState(READBACK_STATES.IDLE);
    this.report();
    if (autoStart) this.speak();
    return this.segments.length;
  }

  setState(state) {
    if (this.state === state) return;
    this.state = state;
    this.emit('state', state);
  }

  position() {
    return positionReport({
      segments: this.segments, char: this.char,
      totalChars: this.text.length, rate: this.rate, calibration: this.calibration
    });
  }

  report() { this.emit('position', this.position()); }

  // ---- transport -----------------------------------------------------------

  /** Speak from the current offset. Restarts from zero when the response ended. */
  speak() {
    if (!this.available || !this.text) return false;
    if (this.state === READBACK_STATES.ENDED || this.char >= this.text.length) this.char = 0;
    this.play(1);
    return true;
  }

  /**
   * Pause holds the offset and silences the voice. Resume re-speaks from that
   * offset, mid-sentence, at whatever speed is set at the time.
   */
  pause() {
    if (this.state !== READBACK_STATES.SPEAKING && this.state !== READBACK_STATES.DUCKED) return false;
    this.freeze();
    this.setState(READBACK_STATES.PAUSED);
    this.report();
    return true;
  }

  resume() {
    if (this.state !== READBACK_STATES.PAUSED) return false;
    this.play(1);
    return true;
  }

  /** Stop silences the voice and returns to the top of the response. */
  stop() {
    this.freeze();
    this.char = 0;
    this.setState(READBACK_STATES.IDLE);
    this.report();
    return true;
  }

  jumpBack(seconds = JUMP_BACK_SECONDS) { return this.jump(-Math.abs(seconds)); }
  jumpForward(seconds = JUMP_FORWARD_SECONDS) { return this.jump(Math.abs(seconds)); }

  /**
   * Move by seconds and keep doing whatever was being done. Jumping while
   * paused moves the mark without breaking silence; jumping while speaking
   * re-speaks from the new mark immediately.
   */
  jump(deltaSeconds) {
    if (!this.text) return false;
    const target = seek({
      char: this.char, totalChars: this.text.length,
      deltaSeconds, rate: this.rate, calibration: this.calibration
    });
    const moved = this.moveTo(target);
    if (moved) this.emit('jump', { deltaSeconds, position: this.position() });
    return moved;
  }

  /**
   * Move to an absolute character offset — the scrub bar, and "jump to place" on
   * a note.
   *
   * This does not route through `jump`. Seconds are a lossy way to express a
   * destination: converting a backward move into a negative duration and back
   * again loses the sign the moment anything clamps it, and a note anchored
   * earlier in the response would then refuse to be revisited. The offset is
   * the destination, so the offset is what travels.
   */
  seekTo(char) {
    if (!this.text) return false;
    return this.moveTo(Math.max(0, Math.min(Math.round(char || 0), this.text.length)));
  }

  /**
   * The one place the position actually changes: silence the voice, move the
   * mark, and pick the readback up again in whatever mode it was in.
   */
  moveTo(nextChar) {
    if (!this.text) return false;
    const wasAudible = this.state === READBACK_STATES.SPEAKING || this.state === READBACK_STATES.DUCKED;
    const wasDucked = this.state === READBACK_STATES.DUCKED;
    this.freeze();
    // freeze() folds in whatever the cancelled utterance had spoken, so the
    // destination is assigned after it, never before.
    this.char = Math.max(0, Math.min(Math.round(nextChar), this.text.length));
    if (wasAudible) this.play(wasDucked ? DUCK_VOLUME : 1);
    else { this.setState(READBACK_STATES.PAUSED); this.report(); }
    return true;
  }

  /**
   * Speed changes take effect on the next spoken word, not at the next
   * paragraph, because the current segment is re-spoken from the exact offset.
   */
  setRate(rate) {
    const next = clampRate(rate);
    if (next === this.rate) return this.rate;
    const wasAudible = this.state === READBACK_STATES.SPEAKING || this.state === READBACK_STATES.DUCKED;
    const wasDucked = this.state === READBACK_STATES.DUCKED;
    this.freeze();
    this.rate = next;
    if (wasAudible) this.play(wasDucked ? DUCK_VOLUME : 1);
    this.emit('rate', next);
    this.report();
    return next;
  }

  // ---- ducking for margin notes -------------------------------------------

  /**
   * Called when the Chairman presses and holds the note microphone.
   *
   * Default behaviour is what was asked for: the readback ducks — it keeps
   * running, quietly, underneath the Chairman's voice. `holdWhileSpeaking` is a
   * Chairman preference that pauses instead, for when a note is long enough
   * that quiet running would lose him content he has not heard.
   *
   * Either way the offset at the moment of press is returned, because that is
   * the location the note gets timestamped to.
   */
  duck() {
    const anchor = this.position();
    if (this.state !== READBACK_STATES.SPEAKING) return anchor;
    if (this.holdWhileSpeaking) { this.pause(); return anchor; }
    this.freeze();
    this.play(DUCK_VOLUME);
    this.setState(READBACK_STATES.DUCKED);
    return anchor;
  }

  /** Called when the microphone is released: full volume, same place. */
  restore() {
    if (this.state === READBACK_STATES.DUCKED) {
      this.freeze();
      this.play(1);
      return true;
    }
    if (this.state === READBACK_STATES.PAUSED && this.holdWhileSpeaking) return this.resume();
    return false;
  }

  // ---- internals -----------------------------------------------------------

  /** Silence the voice without moving the offset. */
  freeze() {
    this.stopTicker();
    this.settlePosition();
    this.queue = [];
    this.current = null;
    try { this.synth?.cancel(); } catch { /* cancelled mid-flight is fine */ }
  }

  /**
   * Fold whatever the in-flight utterance actually spoke into the offset, so a
   * cancel never loses the Chairman's place.
   */
  settlePosition() {
    if (!this.current) return;
    const { startChar, endChar, startedAt, boundaryChar } = this.current;
    if (typeof boundaryChar === 'number') {
      this.char = Math.max(this.char, Math.min(endChar, startChar + boundaryChar));
      return;
    }
    const elapsed = (Date.now() - startedAt) / 1000;
    const estimated = startChar + Math.round(elapsed * (this.charsPerSecond()));
    this.char = Math.max(this.char, Math.min(endChar, estimated));
  }

  charsPerSecond() {
    return 17.5 * this.rate * this.calibration;
  }

  /** Build the queue from the current offset and start speaking at `volume`. */
  play(volume) {
    if (!this.available || !this.text) return;
    this.volume = volume;
    this.queue = resumePlan(this.segments, this.char);
    if (!this.queue.length) { this.finish(); return; }
    this.setState(volume < 1 ? READBACK_STATES.DUCKED : READBACK_STATES.SPEAKING);
    this.speakNext();
    this.startTicker();
  }

  speakNext() {
    const next = this.queue.shift();
    if (!next) { this.finish(); return; }
    const utterance = this.makeUtterance(next.text);
    utterance.rate = this.rate;
    utterance.volume = this.volume;
    utterance.lang = 'en-US';
    const frame = {
      utterance, startChar: next.startChar, endChar: next.endChar,
      startedAt: Date.now(), boundaryChar: undefined
    };
    this.current = frame;

    // Boundary events, where the browser provides them, are the truth. Where it
    // does not (common on iPadOS), the ticker estimate carries the position and
    // the segment end corrects it.
    utterance.onboundary = event => {
      if (this.current !== frame) return;
      if (typeof event.charIndex !== 'number') return;
      frame.boundaryChar = event.charIndex;
      this.char = Math.min(frame.endChar, frame.startChar + event.charIndex);
      this.report();
    };
    utterance.onend = () => {
      if (this.current !== frame) return;
      const spoken = frame.endChar - frame.startChar;
      const elapsed = (Date.now() - frame.startedAt) / 1000;
      this.calibration = calibrate(this.calibration, { chars: spoken, elapsedSeconds: elapsed, rate: this.rate });
      this.char = frame.endChar;                 // measured, not estimated
      this.current = null;
      this.emit('segment', { index: next.segmentIndex, char: this.char });
      this.report();
      if (this.state === READBACK_STATES.SPEAKING || this.state === READBACK_STATES.DUCKED) this.speakNext();
    };
    utterance.onerror = event => {
      if (this.current !== frame) return;
      // A cancel raises an error in some browsers; that is not a fault.
      if (event?.error === 'canceled' || event?.error === 'interrupted') return;
      this.emit('error', event?.error || 'speech-error');
      this.freeze();
      this.setState(READBACK_STATES.PAUSED);
    };
    try { this.synth.speak(utterance); }
    catch (err) { this.emit('error', String(err)); }
  }

  finish() {
    this.stopTicker();
    this.current = null;
    this.char = this.text.length;
    this.setState(READBACK_STATES.ENDED);
    this.report();
    this.emit('end', this.position());
  }

  startTicker() {
    this.stopTicker();
    if (typeof setInterval !== 'function') return;
    this.ticker = setInterval(() => {
      if (!this.current) return;
      if (typeof this.current.boundaryChar === 'number') { this.report(); return; }
      const elapsed = (Date.now() - this.current.startedAt) / 1000;
      const estimate = this.current.startChar + Math.round(elapsed * this.charsPerSecond());
      this.char = Math.max(this.char, Math.min(this.current.endChar, estimate));
      this.report();
    }, TICK_MS);
    // Under Node (the transport tests) an open interval holds the process alive
    // after the work is done. Browsers have no unref, so this is a no-op there.
    this.ticker?.unref?.();
  }

  stopTicker() {
    if (this.ticker) { clearInterval(this.ticker); this.ticker = null; }
  }
}
