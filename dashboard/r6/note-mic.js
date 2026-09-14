// THYLORA Dashboard R6 · hold-to-speak margin microphone
// Canonical backend record: THY-IDEA-READBACK-MARGIN-NOTES-001
//
// Press and hold to speak a note into the response while it is being read back.
//
// The order of operations matters and is fixed:
//   press   -> capture the anchor FIRST, then duck, then listen
//   hold    -> readback continues quietly underneath; transcript builds live
//   release -> stop listening, restore readback, then commit the note atom
//
// The anchor is taken before ducking because ducking takes a few milliseconds
// during which the readback keeps moving. Taking it first means the note lands
// on the words the Chairman was actually reacting to.
//
// Where the browser exposes no speech recognition, the press still captures the
// anchor and the release opens a typed note already fixed to that exact place.
// A note is never lost because a device lacked a microphone API.

import { createNote, NOTE_KINDS } from './lib/margin-notes.js';

export class NoteMicrophone {
  constructor({ button, engine, getResponse, onNote, onStatus, onInterim }) {
    this.button = button;
    this.engine = engine;
    this.getResponse = getResponse;          // () => { id, text }
    this.onNote = onNote || (() => {});
    this.onStatus = onStatus || (() => {});
    this.onInterim = onInterim || (() => {});
    this.recognition = null;
    this.holding = false;
    this.anchor = null;
    this.finalText = '';
    this.interimText = '';
    this.bind();
  }

  static get supported() {
    return typeof window !== 'undefined'
      && !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  bind() {
    const b = this.button;
    if (!b) return;
    // Pointer events cover Apple Pencil, finger and mouse with one path.
    b.addEventListener('pointerdown', e => {
      e.preventDefault();
      // Capture keeps the hold alive if the finger slides off the button. If the
      // browser refuses it, the note still gets taken.
      try { b.setPointerCapture?.(e.pointerId); } catch { /* hold anyway */ }
      this.press();
    });
    b.addEventListener('pointerup', e => { e.preventDefault(); this.release(); });
    b.addEventListener('pointercancel', () => this.release());
    // Holding the button must not also scroll or select on iPad.
    b.addEventListener('contextmenu', e => e.preventDefault());
    b.addEventListener('touchstart', e => e.preventDefault(), { passive: false });
    // Keyboard equivalent: hold Space or Enter while the button has focus.
    b.addEventListener('keydown', e => {
      if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); this.press(); }
    });
    b.addEventListener('keyup', e => {
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); this.release(); }
    });
  }

  press() {
    if (this.holding) return;
    const response = this.getResponse?.() || {};
    if (!response.text) { this.onStatus('Nothing loaded to annotate yet.', 'bad'); return; }
    this.holding = true;
    this.finalText = '';
    this.interimText = '';

    // 1. Anchor first — the exact response location at the moment of press.
    this.anchor = this.engine.duck();

    this.button?.classList.add('holding');
    this.button?.setAttribute('aria-pressed', 'true');

    // 2. Listen.
    const SR = typeof window !== 'undefined'
      && (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!SR) {
      this.onStatus('Hold captured the place in the response. Release to type the note — this browser exposes no microphone API.', 'warn');
      return;
    }
    try {
      const r = new SR();
      r.lang = 'en-US';
      r.continuous = true;
      r.interimResults = true;
      r.onresult = event => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const chunk = event.results[i][0].transcript;
          if (event.results[i].isFinal) this.finalText += chunk + ' ';
          else interim += chunk;
        }
        this.interimText = interim;
        this.onInterim((this.finalText + interim).trim());
      };
      r.onerror = event => {
        if (event?.error === 'aborted' || event?.error === 'no-speech') return;
        this.onStatus(`Microphone: ${event?.error || 'unavailable'}. Release to type the note at this place.`, 'bad');
      };
      r.onend = () => { this.recognition = null; };
      this.recognition = r;
      r.start();
      this.onStatus('Listening — readback is ducked, not stopped.', 'good');
    } catch (err) {
      this.onStatus('Microphone refused to start. Release to type the note at this place.', 'bad');
    }
  }

  release() {
    if (!this.holding) return;
    this.holding = false;
    this.button?.classList.remove('holding');
    this.button?.setAttribute('aria-pressed', 'false');

    try { this.recognition?.stop(); } catch { /* already stopped */ }
    this.recognition = null;

    // 3. Restore the readback to full volume at the place it reached.
    this.engine.restore();

    const spoken = (this.finalText + ' ' + this.interimText).trim();
    const response = this.getResponse?.() || {};
    const anchor = this.anchor || this.engine.position();

    const note = createNote({
      responseId: response.id,
      responseText: response.text || '',
      char: anchor.char,
      segmentIndex: anchor.segmentIndex,
      percent: anchor.percent,
      elapsedSeconds: anchor.elapsedSeconds,
      body: spoken,
      kind: NOTE_KINDS.SPOKEN,
      target: { type: 'RESPONSE', ref: response.id ?? null }
    });

    this.onInterim('');
    this.anchor = null;

    if (!spoken) {
      // The place is still real even when no words were captured. Hand the
      // caller an empty atom so it can offer a typed note fixed to that place
      // rather than throwing the location away.
      this.onNote(note, { empty: true });
      this.onStatus('No words captured. The place in the response is held — type the note.', 'warn');
      return;
    }
    this.onNote(note, { empty: false });
    this.onStatus(`Note held at ${note.anchor.percent}% of the response.`, 'good');
  }
}
