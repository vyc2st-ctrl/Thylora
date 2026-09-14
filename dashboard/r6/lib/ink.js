// THYLORA Dashboard R6 · ink geometry
// Canonical backend record: THY-IDEA-DASHBOARD-SCREEN-ARCHITECTURE-001
//
// Strokes are stored as vectors in normalised space (0..1 on both axes), not as
// pixels and not as a flattened bitmap. Three reasons, all of them the
// Chairman's requirements rather than preference:
//
//   - A mark made on the iPad has to still be in the right place on the desktop,
//     at a different size and pixel density. Normalised points survive that;
//     pixel coordinates do not.
//   - A comment pin is "tied to response/image/video coordinates". A tie that
//     breaks when the window resizes is not a tie.
//   - Ink has to be preservable as an atom alongside spoken notes, and an atom
//     that is a PNG cannot be read back, searched or carried into a next prompt.
//
// Pressure from Apple Pencil is kept per point, so a stroke re-renders with the
// same weight it was drawn with.

export const TOOLS = Object.freeze({
  PEN: 'PEN',             // freehand sketch, pressure-weighted
  HANDWRITING: 'HANDWRITING', // finer, steadier line for writing words
  ARROW: 'ARROW',
  CIRCLE: 'CIRCLE',
  PIN: 'PIN',
  ERASE: 'ERASE'
});

export const TOOL_WIDTHS = Object.freeze({
  [TOOLS.PEN]: 3.2,
  [TOOLS.HANDWRITING]: 1.8,
  [TOOLS.ARROW]: 2.6,
  [TOOLS.CIRCLE]: 2.6
});

/** Clamp a point into the canvas. Marks made past the edge stay on the edge. */
export const norm = (value, size) => {
  if (!(size > 0)) return 0;
  const v = value / size;
  return Math.max(0, Math.min(1, v));
};

export function createStroke({ tool, color, width, page = 0 }) {
  return {
    id: `INK-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`.toUpperCase(),
    tool, color, width: width ?? TOOL_WIDTHS[tool] ?? 2.4,
    page, points: []
  };
}

/**
 * Pressure handling. A finger and a mouse report 0 or a flat 0.5; a Pencil
 * reports a real curve. Anything without real pressure is given a steady 0.5 so
 * the line does not pulse, and a Pencil's pressure is eased so light strokes
 * still leave a visible mark.
 */
export function inkPressure(pointerType, rawPressure) {
  if (pointerType !== 'pen') return 0.5;
  const p = Number(rawPressure);
  if (!Number.isFinite(p) || p <= 0) return 0.5;
  return 0.25 + Math.min(1, p) * 0.75;
}

export function addPoint(stroke, { x, y, pressure = 0.5 }) {
  const last = stroke.points[stroke.points.length - 1];
  // Drop sub-pixel jitter; keeps stroke payloads small enough to store as atoms.
  if (last && Math.abs(last.x - x) < 0.0008 && Math.abs(last.y - y) < 0.0008) return stroke;
  stroke.points.push({
    x: Math.round(x * 10000) / 10000,
    y: Math.round(y * 10000) / 10000,
    p: Math.round(pressure * 100) / 100
  });
  return stroke;
}

/** Arrows and circles keep only their two defining points. */
export function setShape(stroke, from, to) {
  stroke.points = [
    { x: from.x, y: from.y, p: 0.5 },
    { x: to.x, y: to.y, p: 0.5 }
  ];
  return stroke;
}

/** Arrow head geometry, in normalised space, scaled for the canvas aspect. */
export function arrowHead(from, to, aspect = 1, size = 0.035) {
  const dx = (to.x - from.x) * aspect;
  const dy = to.y - from.y;
  const angle = Math.atan2(dy, dx);
  const spread = Math.PI / 7;
  const head = (a) => ({
    x: to.x - (Math.cos(a) * size) / aspect,
    y: to.y - Math.sin(a) * size
  });
  return [head(angle - spread), { x: to.x, y: to.y }, head(angle + spread)];
}

/** Ellipse from two corners of the gesture's bounding box. */
export function ellipseFrom(from, to) {
  return {
    cx: (from.x + to.x) / 2,
    cy: (from.y + to.y) / 2,
    rx: Math.abs(to.x - from.x) / 2,
    ry: Math.abs(to.y - from.y) / 2
  };
}

/** Distance from a point to a stroke, for the eraser and for pin hit-testing. */
export function distanceToStroke(stroke, point, aspect = 1) {
  let best = Infinity;
  for (const p of stroke.points) {
    const dx = (p.x - point.x) * aspect;
    const dy = p.y - point.y;
    best = Math.min(best, Math.hypot(dx, dy));
  }
  return best;
}

/** A comment pin, tied to whatever it was dropped on. */
export function createPin({ x, y, target, body = '', page = 0, at = Date.now() }) {
  return {
    id: `PIN-${at.toString(36)}-${Math.random().toString(36).slice(2, 6)}`.toUpperCase(),
    x: Math.round(x * 10000) / 10000,
    y: Math.round(y * 10000) / 10000,
    page,
    // target.type is RESPONSE | IMAGE | VIDEO | DOCUMENT.
    // For VIDEO, target.t carries the timecode the pin belongs to; for RESPONSE,
    // target.char carries the character offset. A pin without its target is just
    // a dot, so the target travels with it everywhere.
    target: { ...(target || { type: 'IMAGE', ref: null }) },
    body: String(body || ''),
    created_at: new Date(at).toISOString()
  };
}

/** Everything drawn on one surface, ready to store as a note atom payload. */
export function inkPayload(strokes, pins, { width, height, background = null }) {
  return {
    format: 'THY-INK-1',
    aspect: width && height ? Math.round((width / height) * 1000) / 1000 : null,
    background,
    strokes: strokes.map(s => ({ id: s.id, tool: s.tool, color: s.color, width: s.width, page: s.page, points: s.points })),
    pins: pins.map(p => ({ ...p }))
  };
}

/** A one-line description of a drawing, so an ink atom reads in the note lane. */
export function describeInk(payload) {
  const strokes = payload?.strokes || [];
  const pins = payload?.pins || [];
  const counts = strokes.reduce((acc, s) => { acc[s.tool] = (acc[s.tool] || 0) + 1; return acc; }, {});
  const parts = [];
  const label = { [TOOLS.PEN]: 'sketch stroke', [TOOLS.HANDWRITING]: 'handwritten stroke', [TOOLS.ARROW]: 'arrow', [TOOLS.CIRCLE]: 'circle' };
  for (const [tool, n] of Object.entries(counts)) {
    parts.push(`${n} ${label[tool] || tool.toLowerCase()}${n === 1 ? '' : 's'}`);
  }
  if (pins.length) parts.push(`${pins.length} comment pin${pins.length === 1 ? '' : 's'}`);
  return parts.length ? parts.join(', ') : 'empty canvas';
}
