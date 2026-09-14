// THYLORA Dashboard R6 · ink geometry tests
// Canonical backend record: THY-IDEA-DASHBOARD-SCREEN-ARCHITECTURE-001
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  TOOLS, norm, createStroke, addPoint, setShape, arrowHead, ellipseFrom,
  distanceToStroke, createPin, inkPayload, describeInk, inkPressure
} from '../dashboard/r6/lib/ink.js';

test('points are normalised, so a mark survives a resize and a second device', () => {
  assert.equal(norm(50, 100), 0.5);
  assert.equal(norm(-20, 100), 0, 'a mark past the edge stays on the edge');
  assert.equal(norm(200, 100), 1);
  assert.equal(norm(50, 0), 0, 'a zero-sized canvas does not produce NaN');
});

test('Apple Pencil pressure is kept; a finger and a mouse get a steady weight', () => {
  assert.equal(inkPressure('touch', 0), 0.5);
  assert.equal(inkPressure('mouse', 0), 0.5);
  assert.ok(inkPressure('pen', 1) > inkPressure('pen', 0.2), 'a harder press draws heavier');
  assert.equal(inkPressure('pen', 0), 0.5, 'a pen reporting no pressure still draws');
});

test('sub-pixel jitter is dropped so stroke payloads stay storable as atoms', () => {
  const stroke = createStroke({ tool: TOOLS.PEN, color: '#fff' });
  addPoint(stroke, { x: 0.5, y: 0.5, pressure: 0.5 });
  addPoint(stroke, { x: 0.50001, y: 0.50001, pressure: 0.5 });
  assert.equal(stroke.points.length, 1);
  addPoint(stroke, { x: 0.6, y: 0.6, pressure: 0.5 });
  assert.equal(stroke.points.length, 2);
});

test('a shape keeps only its two defining points however far it was dragged', () => {
  const stroke = createStroke({ tool: TOOLS.ARROW, color: '#fff' });
  for (let i = 0; i < 50; i++) addPoint(stroke, { x: i / 50, y: i / 50 });
  setShape(stroke, { x: 0.1, y: 0.1 }, { x: 0.9, y: 0.4 });
  assert.equal(stroke.points.length, 2);
  assert.deepEqual(stroke.points[1], { x: 0.9, y: 0.4, p: 0.5 });
});

test('an arrow head sits at the arrow tip and opens backward', () => {
  const head = arrowHead({ x: 0, y: 0.5 }, { x: 0.8, y: 0.5 }, 1);
  assert.equal(head.length, 3);
  assert.equal(head[1].x, 0.8, 'the middle point is the tip');
  assert.ok(head[0].x < 0.8 && head[2].x < 0.8, 'the barbs trail behind the tip');
});

test('a circle is derived from the gesture bounding box in either drag direction', () => {
  const downRight = ellipseFrom({ x: 0.2, y: 0.2 }, { x: 0.6, y: 0.8 });
  const upLeft = ellipseFrom({ x: 0.6, y: 0.8 }, { x: 0.2, y: 0.2 });
  assert.deepEqual(downRight, upLeft);
  assert.equal(downRight.cx, 0.4);
  assert.ok(Math.abs(downRight.rx - 0.2) < 1e-9);
});

test('the eraser measures distance to the nearest point of a stroke', () => {
  const stroke = createStroke({ tool: TOOLS.PEN, color: '#fff' });
  addPoint(stroke, { x: 0.5, y: 0.5 });
  assert.ok(distanceToStroke(stroke, { x: 0.5, y: 0.5 }) < 1e-9);
  assert.ok(distanceToStroke(stroke, { x: 0.9, y: 0.9 }) > 0.4);
});

test('a comment pin carries the thing it is tied to, not just a dot', () => {
  const onVideo = createPin({ x: 0.3, y: 0.7, target: { type: 'VIDEO', ref: 'cut-4.mp4', t: 12.5 } });
  assert.equal(onVideo.target.type, 'VIDEO');
  assert.equal(onVideo.target.t, 12.5);

  const onResponse = createPin({ x: 0.1, y: 0.2, target: { type: 'RESPONSE', ref: 'RESP-1', char: 480 } });
  assert.equal(onResponse.target.char, 480);
});

test('the ink payload carries strokes and pins together for storage as one atom', () => {
  const stroke = createStroke({ tool: TOOLS.HANDWRITING, color: '#d6a348' });
  addPoint(stroke, { x: 0.1, y: 0.1 });
  addPoint(stroke, { x: 0.4, y: 0.2 });
  const pin = createPin({ x: 0.5, y: 0.5, target: { type: 'IMAGE', ref: 'cover.png' }, body: 'crop tighter' });
  const payload = inkPayload([stroke], [pin], { width: 800, height: 400 });

  assert.equal(payload.format, 'THY-INK-1');
  assert.equal(payload.aspect, 2);
  assert.equal(payload.strokes.length, 1);
  assert.equal(payload.pins[0].body, 'crop tighter');
});

test('a drawing describes itself so an ink note reads in the note lane', () => {
  const pen = createStroke({ tool: TOOLS.PEN, color: '#fff' });
  const arrow = createStroke({ tool: TOOLS.ARROW, color: '#fff' });
  const payload = inkPayload([pen, arrow], [createPin({ x: 0, y: 0, target: { type: 'IMAGE' } })], { width: 100, height: 100 });
  const description = describeInk(payload);
  assert.match(description, /1 sketch stroke/);
  assert.match(description, /1 arrow/);
  assert.match(description, /1 comment pin/);
  assert.equal(describeInk({ strokes: [], pins: [] }), 'empty canvas');
});
