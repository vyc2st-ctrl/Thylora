// THYLORA Dashboard R6 · Apple Pencil / stylus canvas
// Canonical backend record: THY-IDEA-DASHBOARD-SCREEN-ARCHITECTURE-001
//
// One canvas serves every marking surface in this lane: a blank sketch pad, a
// marked-up image, an annotated screenshot, and a frame grabbed out of a video
// in the preview room. They differ only by what is behind the ink.
//
// Pointer Events give Apple Pencil, finger and mouse through one code path, with
// `pointerType` and `pressure` telling them apart. Two behaviours matter on
// iPad specifically:
//
//   Palm rejection. Once a Pencil has touched this canvas, finger input stops
//   drawing on it and goes back to scrolling. Without this, a hand resting on
//   the glass draws a stripe across the Chairman's markup.
//
//   Coalesced events. iPadOS delivers Pencil samples faster than it fires
//   pointermove. getCoalescedEvents() recovers the samples in between, which is
//   the difference between handwriting that looks written and handwriting that
//   looks like a polygon.

import {
  TOOLS, TOOL_WIDTHS, norm, createStroke, addPoint, setShape,
  arrowHead, ellipseFrom, distanceToStroke, createPin, inkPayload
} from './lib/ink.js';

export const INK_COLORS = ['#d6a348', '#f4efe6', '#78d49b', '#ff9090', '#7db7ff'];

export class AnnotationCanvas {
  constructor({ canvas, onChange, onPinRequest, onStatus }) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.onChange = onChange || (() => {});
    this.onPinRequest = onPinRequest || (() => {});
    this.onStatus = onStatus || (() => {});

    this.tool = TOOLS.PEN;
    this.color = INK_COLORS[0];
    this.strokes = [];
    this.pins = [];
    this.redoStack = [];
    this.active = null;
    this.background = null;      // { image, src, kind, ref }
    this.penSeen = false;
    this.target = { type: 'RESPONSE', ref: null };

    this.resize = this.resize.bind(this);
    this.bind();
    this.resize();
  }

  get aspect() {
    const r = this.canvas.getBoundingClientRect();
    return r.height > 0 ? r.width / r.height : 1;
  }

  bind() {
    const c = this.canvas;
    c.style.touchAction = 'none';
    c.addEventListener('pointerdown', e => this.down(e));
    c.addEventListener('pointermove', e => this.move(e));
    c.addEventListener('pointerup', e => this.up(e));
    c.addEventListener('pointercancel', e => this.up(e));
    c.addEventListener('pointerleave', e => this.up(e));
    if (typeof ResizeObserver === 'function') {
      this.observer = new ResizeObserver(this.resize);
      this.observer.observe(c);
    } else if (typeof window !== 'undefined') {
      window.addEventListener('resize', this.resize);
    }
  }

  /** Back the canvas at device pixel ratio so Pencil lines are not soft on iPad. */
  resize() {
    const rect = this.canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    this.canvas.width = Math.round(rect.width * dpr);
    this.canvas.height = Math.round(rect.height * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.render();
  }

  setTool(tool) { this.tool = tool; this.onStatus(`Tool: ${tool.toLowerCase()}`); }
  setColor(color) { this.color = color; }
  setTarget(target) { this.target = { ...target }; }

  point(event) {
    const r = this.canvas.getBoundingClientRect();
    return {
      x: norm(event.clientX - r.left, r.width),
      y: norm(event.clientY - r.top, r.height)
    };
  }

  /** True when this pointer should be ignored for drawing (palm rejection). */
  rejected(event) {
    if (event.pointerType === 'pen') { this.penSeen = true; return false; }
    return this.penSeen && event.pointerType === 'touch';
  }

  down(event) {
    if (this.rejected(event)) return;
    event.preventDefault();
    // Capture is an optimisation, not a requirement. It throws when the pointer
    // is no longer active by the time the handler runs; losing the capture must
    // never cost the Chairman the stroke.
    try { this.canvas.setPointerCapture?.(event.pointerId); } catch { /* draw anyway */ }
    const p = this.point(event);

    if (this.tool === TOOLS.PIN) {
      const pin = createPin({ x: p.x, y: p.y, target: this.targetFor(p) });
      this.onPinRequest(pin, placed => {
        if (!placed) return;
        this.pins.push(placed);
        this.redoStack = [];
        this.render();
        this.onChange(this.payload());
      });
      return;
    }

    if (this.tool === TOOLS.ERASE) { this.eraseAt(p); return; }

    const stroke = createStroke({ tool: this.tool, color: this.color, width: TOOL_WIDTHS[this.tool] });
    addPoint(stroke, { ...p, pressure: this.pressure(event) });
    this.active = { stroke, from: p };
    this.redoStack = [];
  }

  move(event) {
    if (!this.active || this.rejected(event)) return;
    event.preventDefault();
    const { stroke, from } = this.active;

    if (stroke.tool === TOOLS.ARROW || stroke.tool === TOOLS.CIRCLE) {
      setShape(stroke, from, this.point(event));
      this.render(stroke);
      return;
    }

    // Recover the samples iPadOS batched into this one move event.
    const samples = event.getCoalescedEvents ? event.getCoalescedEvents() : [event];
    for (const sample of (samples.length ? samples : [event])) {
      addPoint(stroke, { ...this.point(sample), pressure: this.pressure(sample) });
    }
    this.render(stroke);
  }

  up(event) {
    if (!this.active) return;
    if (event && this.rejected(event)) return;
    const { stroke } = this.active;
    this.active = null;
    // A tap that left no line is not a mark; discard it silently.
    if (stroke.points.length < 2) { this.render(); return; }
    this.strokes.push(stroke);
    this.render();
    this.onChange(this.payload());
  }

  pressure(event) {
    if (event.pointerType !== 'pen') return 0.5;
    const p = Number(event.pressure);
    if (!Number.isFinite(p) || p <= 0) return 0.5;
    return 0.25 + Math.min(1, p) * 0.75;
  }

  /**
   * What a pin dropped at this spot is tied to. On an image or a document it is
   * the normalised coordinate; on a video it also carries the timecode showing
   * at the moment of the tap; on the response it carries the character offset
   * the readback had reached.
   */
  targetFor(point) {
    const t = { ...this.target, x: point.x, y: point.y };
    if (this.background?.kind === 'VIDEO' && this.background.element) {
      t.type = 'VIDEO';
      t.t = Math.round((this.background.element.currentTime || 0) * 100) / 100;
    }
    return t;
  }

  eraseAt(point) {
    const before = this.strokes.length + this.pins.length;
    this.strokes = this.strokes.filter(s => distanceToStroke(s, point, this.aspect) > 0.02);
    this.pins = this.pins.filter(p => Math.hypot((p.x - point.x) * this.aspect, p.y - point.y) > 0.03);
    if (this.strokes.length + this.pins.length !== before) {
      this.render();
      this.onChange(this.payload());
    }
  }

  undo() {
    const last = this.strokes.pop() || this.pins.pop();
    if (!last) return false;
    this.redoStack.push(last);
    this.render();
    this.onChange(this.payload());
    return true;
  }

  redo() {
    const item = this.redoStack.pop();
    if (!item) return false;
    if (item.tool) this.strokes.push(item); else this.pins.push(item);
    this.render();
    this.onChange(this.payload());
    return true;
  }

  clear() {
    this.strokes = [];
    this.pins = [];
    this.redoStack = [];
    this.render();
    this.onChange(this.payload());
  }

  /**
   * Put an image, screenshot or video frame behind the ink. Existing marks are
   * kept: normalised coordinates mean they land in the same place relative to
   * whatever is now underneath.
   */
  async setBackground({ src, kind = 'IMAGE', ref = null, element = null }) {
    if (!src) { this.background = null; this.render(); return; }
    const image = new Image();
    image.crossOrigin = 'anonymous';
    const loaded = new Promise((resolve, reject) => {
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('Preview could not be loaded.'));
    });
    image.src = src;
    try {
      await loaded;
      this.background = { image, src, kind, ref, element };
      this.setTarget({ type: kind, ref });
      this.render();
      this.onStatus(`${kind.toLowerCase()} loaded for markup.`);
    } catch (err) {
      this.onStatus(err.message, 'bad');
    }
  }

  /** Grab the frame showing in a video element and mark it up as a still. */
  captureVideoFrame(video, ref = null) {
    if (!video || !video.videoWidth) { this.onStatus('No video frame to capture yet.', 'bad'); return null; }
    const off = document.createElement('canvas');
    off.width = video.videoWidth;
    off.height = video.videoHeight;
    off.getContext('2d').drawImage(video, 0, 0);
    const src = off.toDataURL('image/png');
    this.setBackground({ src, kind: 'VIDEO', ref, element: video });
    return src;
  }

  // ---- drawing -------------------------------------------------------------

  render(pending = null) {
    const ctx = this.ctx;
    const r = this.canvas.getBoundingClientRect();
    const w = r.width;
    const h = r.height;
    if (!w || !h) return;
    ctx.clearRect(0, 0, w, h);

    if (this.background?.image) {
      const img = this.background.image;
      const scale = Math.min(w / img.width, h / img.height);
      const dw = img.width * scale;
      const dh = img.height * scale;
      ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
    }

    for (const stroke of this.strokes) this.drawStroke(stroke, w, h);
    if (pending) this.drawStroke(pending, w, h);
    for (const pin of this.pins) this.drawPin(pin, w, h);
  }

  drawStroke(stroke, w, h) {
    const ctx = this.ctx;
    const pts = stroke.points;
    if (!pts.length) return;
    ctx.strokeStyle = stroke.color;
    ctx.fillStyle = stroke.color;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (stroke.tool === TOOLS.CIRCLE) {
      const e = ellipseFrom(pts[0], pts[pts.length - 1]);
      ctx.lineWidth = stroke.width;
      ctx.beginPath();
      ctx.ellipse(e.cx * w, e.cy * h, Math.max(1, e.rx * w), Math.max(1, e.ry * h), 0, 0, Math.PI * 2);
      ctx.stroke();
      return;
    }

    if (stroke.tool === TOOLS.ARROW) {
      const from = pts[0];
      const to = pts[pts.length - 1];
      ctx.lineWidth = stroke.width;
      ctx.beginPath();
      ctx.moveTo(from.x * w, from.y * h);
      ctx.lineTo(to.x * w, to.y * h);
      ctx.stroke();
      const head = arrowHead(from, to, this.aspect);
      ctx.beginPath();
      ctx.moveTo(head[0].x * w, head[0].y * h);
      ctx.lineTo(head[1].x * w, head[1].y * h);
      ctx.lineTo(head[2].x * w, head[2].y * h);
      ctx.stroke();
      return;
    }

    // Freehand and handwriting: each span carries the pressure it was drawn at.
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1];
      const b = pts[i];
      ctx.lineWidth = stroke.width * ((a.p + b.p) / 2) * 2;
      ctx.beginPath();
      ctx.moveTo(a.x * w, a.y * h);
      ctx.lineTo(b.x * w, b.y * h);
      ctx.stroke();
    }
  }

  drawPin(pin, w, h) {
    const ctx = this.ctx;
    const x = pin.x * w;
    const y = pin.y * h;
    ctx.beginPath();
    ctx.arc(x, y, 11, 0, Math.PI * 2);
    ctx.fillStyle = '#d6a348';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#080b10';
    ctx.stroke();
    const index = this.pins.indexOf(pin) + 1;
    ctx.fillStyle = '#080b10';
    ctx.font = 'bold 12px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(index), x, y);
  }

  payload() {
    const r = this.canvas.getBoundingClientRect();
    return inkPayload(this.strokes, this.pins, {
      width: r.width, height: r.height,
      background: this.background ? { kind: this.background.kind, ref: this.background.ref } : null
    });
  }

  get isEmpty() { return !this.strokes.length && !this.pins.length; }

  /** A flattened copy, for attaching to a preview approval. Ink stays vector. */
  toDataURL() { return this.canvas.toDataURL('image/png'); }
}
