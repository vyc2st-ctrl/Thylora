// THYLORA HEAD · SPINE FORWARD report tests
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildReport, toMarkdown, parseLanes, HEADER } from '../spine/lib.js';
import { RESEARCHERS } from '../lineage/lib/researchers.js';

const thread = '| # | Lane |\n|---|---|\n| 1 | **Family** | `x` | BUILT | moved | next | Names |\n| 2 | Dash | y | ok | — | — | — |';

test('lanes are read from the board, including what the Chairman owes', () => {
  const lanes = parseLanes(thread);
  assert.equal(lanes.length, 2);
  assert.equal(lanes[0].lane, 'Family');
  assert.equal(lanes[0].needs, 'Names');
});

test('every researcher is reported by name, working or standing by', () => {
  const r = buildReport({ thread, researchers: RESEARCHERS, now: new Date('2026-10-03T12:00:00Z') });
  assert.equal(r.working.length, RESEARCHERS.length);
  assert.equal(r.working.find(w => w.desk === 'ORAL_HISTORY').status, 'WORKING');
  assert.equal(r.mathematics.family_seats_named, '0 / 30');
  assert.equal(r.mathematics.lanes_waiting_on_chairman, 1);
  assert.equal(r.checked_in_at, '2026-10-03T12:00:00.000Z');
});

test('naming people moves work to the census desk and raises the count', () => {
  const r = buildReport({ thread, researchers: RESEARCHERS, family: { people: { 2: { given: 'A', surname: 'B' } } } });
  assert.equal(r.mathematics.family_seats_named, '1 / 30');
  assert.equal(r.working.find(w => w.desk === 'CENSUS').status, 'WORKING');
});

test('nothing is estimated: no backend, no revenue, said plainly', () => {
  const r = buildReport({ thread });
  assert.equal(r.live_backend.state, 'NOT_CHECKED');
  assert.equal(r.mathematics.revenue_recorded, 0);
  assert.ok(r.questions.some(q => /first recorded dollar/.test(q)));
  const md = toMarkdown(r);
  assert.ok(md.startsWith(`# ${HEADER}`));
  for (const h of ['Where we left off', 'Who is working', 'Mathematics', 'All lanes', 'The world', 'Questions']) assert.ok(md.includes(h), h);
});
