// MAH' continuity head tests (WR-MAH-001)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { currentCode, expand, addLayer, LAYERS, ROOT } from '../mah/lib/mah.js';
import { clockHeader } from '../mah/lib/clock.js';
import { precheck, issueSerial, canCallActive } from '../mah/lib/precheck.js';
import { gap, staffing, weeksToClear, netPerSale } from '../mah/lib/store.js';

test("current code is MAH plus one letter per layer plus the prime", () => {
  assert.equal(currentCode(), "MAHI'");
  assert.equal(currentCode([]), "MAH'");
});

test("MAH' expands to the full spine and warns it is behind", () => {
  const r = expand("MAH'");
  assert.equal(r.instruction, ROOT.expands_to);
  assert.equal(r.stale_layers, 1);
  assert.match(r.warning, /MAHI'/);
});

test('typographic apostrophes and lowercase still expand', () => {
  assert.equal(expand('mahi’').stale_layers, 0);
});

test('a wrong or invented letter is refused, not guessed', () => {
  assert.throws(() => expand("MAHX'"), /MISMATCH/);
  assert.throws(() => expand("MAHIZ'"), /AHEAD_OF_LEDGER/);
  assert.throws(() => expand("XYZ'"), /INVALID/);
});

test('adding a layer never changes earlier layers', () => {
  const next = addLayer(LAYERS, { letter: 'A', meaning: 'test', rules: ['r'] });
  assert.equal(next.length, LAYERS.length + 1);
  assert.deepEqual(next[0], LAYERS[0]);
  assert.equal(currentCode(next), "MAHIA'");
  assert.throws(() => addLayer(LAYERS, { letter: 'B', rules: [] }), /EMPTY/);
});

test('every rule from every layer is carried when expanded', () => {
  const r = expand(currentCode());
  assert.equal(r.rules.length, ROOT.rules.length + LAYERS.reduce((a, l) => a + l.rules.length, 0));
});

test('Maryland is the anchor; New York reads the same zone; world time is held, not invented', () => {
  const h = clockHeader(new Date('2026-10-03T21:09:00Z'));
  assert.match(h.anchor, /Maryland/);
  assert.equal(h.lines[0].time, h.lines[1].time);
  assert.match(h.lines[0].time, /5:09 PM EDT/);
  assert.equal(h.world.state, 'HELD_EPOCH_NOT_SET');
  const set = clockHeader(new Date('2026-10-04T00:00:00Z'), { earth_start_iso: '2026-10-03T00:00:00Z', rate: 2, world_start_label: 'EA Day 0' });
  assert.equal(set.world.time, 'EA Day 0 + 2d 00:00');
});

test('an empty artifact reports every blocker at once', () => {
  const r = precheck({ kind: 'REPORT', format: 'PDF', sections: [{}], equations: [{ expr: 'G = E_r - E_p' }] });
  const codes = r.blockers.map(b => b.code);
  for (const c of ['SERIAL_MISSING', 'PREPARER_MISSING', 'SECTION_UNTITLED', 'EQUATION_WITHOUT_QUESTION',
    'NO_INVOKED_QUESTION', 'QR_MISSING', 'SECTIONS_NOT_PREVIEWED', 'LAYOUT_NOT_CENTERED']) assert.ok(codes.includes(c), c);
  assert.ok(r.blockers.every(b => b.route));
});

test('the page-12 failure: an unidentified judge blocks release', () => {
  const base = goodReport();
  assert.equal(precheck(base).ready, true);
  const bad = { ...base, officials: [{ name: 'Judge A', title: 'Judge' }] };
  assert.deepEqual(precheck(bad).blockers.map(b => b.code), ['OFFICIAL_UNIDENTIFIED']);
});

test('simulated pilot results cannot go to an Earth company unlabelled', () => {
  const r = precheck({ ...goodReport(), contains_simulated_results: true, simulation_disclosure: null });
  assert.deepEqual(r.blockers.map(b => b.code), ['SIMULATED_RESULT_UNLABELLED']);
});

test('ACTIVE is never true unless LIVE with evidence', () => {
  assert.equal(canCallActive({ status: 'BUILT' }), false);
  assert.equal(canCallActive({ status: 'LIVE' }), false);
  assert.equal(canCallActive({ status: 'LIVE', witness_evidence: 'order #1001' }), true);
  assert.deepEqual(precheck({ ...goodReport(), status: 'LIVE', witness_evidence: null }).blockers.map(b => b.code), ['STATUS_UNWITNESSED']);
});

test('serials are unique and well formed', () => {
  const a = issueSerial('TRN', new Date('2026-10-03T12:00:00Z'), 1);
  const b = issueSerial('TRN', new Date('2026-10-03T12:00:00Z'), 2);
  assert.equal(a, 'THY-TRN-20261003-0001');
  assert.notEqual(a, b);
  assert.throws(() => issueSerial('bad lane'));
});

test('gap equation names what is missing and the question it asks', () => {
  const g = gap(['serial', 'qr', 'preparer'], ['serial']);
  assert.equal(g.G, 2);
  assert.deepEqual(g.missing, ['qr', 'preparer']);
  assert.match(g.question, /missing/);
});

test('staffing model: 25 products/week and backlog clearance', () => {
  const s = staffing(25);
  assert.equal(s.minutes_per_product, 165);
  assert.ok(s.total_people >= 6);
  assert.equal(weeksToClear(223, 25).weeks, 9);
  assert.equal(netPerSale(1.99).N, 1.63);
});

function goodReport() {
  return {
    kind: 'REPORT', format: 'PDF', serial: 'THY-TRN-20261003-0001', qr_target: 'https://ersatzreality.com',
    preparer: { name: 'Office of Training', title: 'Training Registrar', qualification: 'THYLORA Judicial Training Lane', world_status: 'SIMULATED' },
    officials: [{ name: 'Judge A', title: 'Presiding Judge', kind: 'Restorative Court', qualification: 'Bench certification', world_status: 'SIMULATED' }],
    sections: [{ title: 'Purpose', preview_approved: true }],
    equations: [{ expr: 'G = E_r − E_p', question: 'What is still missing?' }],
    invoked_questions: ['What would you check first if no one told you the answer?'],
    layout: { centered: true }, simulation_disclosure: 'Simulated in EdereAriah'
  };
}
