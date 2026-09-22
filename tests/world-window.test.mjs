import test from 'node:test';
import assert from 'node:assert/strict';

import {
  FACTORS,
  FACTOR_GLOSS,
  STATES,
  scoreFactor,
  evaluateWindow,
  evaluateSeries,
  qyrisComplete,
} from '../world-window/ww.mjs';

import SERIES, {
  ROYAL_KITCHEN,
  CASTLE_ERC_MIRROR,
  NEW_YORK_OFFICE,
  CASTLE_ANCHOR,
} from '../world-window/windows.mjs';

// --- the gate cannot be talked up -----------------------------------------

test('every factor letter in WW=C×P×I×T×B×X carries a gloss', () => {
  assert.deepEqual(FACTORS, ['C', 'P', 'I', 'T', 'B', 'X']);
  for (const letter of FACTORS) {
    assert.ok(FACTOR_GLOSS[letter], `missing gloss for ${letter}`);
    assert.ok(FACTOR_GLOSS[letter].attests, `gloss for ${letter} names no attesting source`);
  }
});

test('an unexamined factor scores zero, not one', () => {
  assert.equal(scoreFactor([]), 0);
  assert.equal(scoreFactor(undefined), 0);
});

test('HELD scores exactly the same as FAIL', () => {
  const held = scoreFactor([{ state: STATES.HELD }]);
  const failed = scoreFactor([{ state: STATES.FAIL }]);
  assert.equal(held, 0);
  assert.equal(failed, 0);
  assert.equal(held, failed);
});

test('one failing criterion zeroes its whole factor', () => {
  const criteria = [
    { state: STATES.PASS }, { state: STATES.PASS }, { state: STATES.PASS },
    { state: STATES.HELD },
  ];
  assert.equal(scoreFactor(criteria), 0);
});

test('one zeroed factor zeroes the window', () => {
  const packet = {
    window_code: 'TEST',
    factors: Object.fromEntries(FACTORS.map((l) => [l, [{ state: STATES.PASS, code: `${l}1` }]])),
    qyris: {
      question: 'q', yield: 'y', reason: 'r', safeguard: 's',
      inspect: { known: 'k', unknown: 'u', next_step: 'n', state: 'PASS' },
    },
  };
  assert.equal(evaluateWindow(packet).ww, 1, 'all-pass packet should score 1');
  assert.equal(evaluateWindow(packet).cleared, true);

  packet.factors.B = [{ state: STATES.HELD, code: 'B1', detail: 'd', route: 'r' }];
  const held = evaluateWindow(packet);
  assert.equal(held.ww, 0);
  assert.equal(held.cleared, false);
  assert.equal(held.qyris_state, 'QYRIS HOLD');
});

test('a full WW score still does not clear without a complete QYRIS check', () => {
  const packet = {
    window_code: 'TEST',
    factors: Object.fromEntries(FACTORS.map((l) => [l, [{ state: STATES.PASS, code: `${l}1` }]])),
    qyris: { question: 'q', yield: 'y', reason: 'r', safeguard: '', inspect: { known: 'k', unknown: 'u', next_step: 'n', state: 'PASS' } },
  };
  const result = evaluateWindow(packet);
  assert.equal(result.ww, 1);
  assert.equal(result.cleared, false, 'WW=1 with an incomplete QYRIS must not clear');
  assert.ok(result.blockers.some((b) => b.code === 'QYRIS_INCOMPLETE'));
});

test('QYRIS completeness names every missing field', () => {
  const { complete, missing } = qyrisComplete({ question: 'q' });
  assert.equal(complete, false);
  assert.ok(missing.includes('yield'));
  assert.ok(missing.includes('reason'));
  assert.ok(missing.includes('safeguard'));
  assert.ok(missing.includes('inspect.known'));
  assert.ok(missing.includes('inspect.next_step'));
});

// --- the three windows -----------------------------------------------------

test('the series carries exactly the three named windows', () => {
  assert.equal(SERIES.length, 3);
  assert.deepEqual(SERIES.map((w) => w.window_code), [
    'WW-584-001-ROYAL-KITCHEN',
    'WW-584-002-CASTLE-ERC-MIRROR',
    'WW-584-003-NEW-YORK-OFFICE-DISTANCE',
  ]);
});

test('every window carries a complete five-field QYRIS check', () => {
  for (const w of SERIES) {
    const { complete, missing } = qyrisComplete(w.qyris);
    assert.equal(complete, true, `${w.window_code} QYRIS incomplete: ${missing.join(', ')}`);
  }
});

test('every window examines all six factors', () => {
  for (const w of SERIES) {
    for (const letter of FACTORS) {
      assert.ok(Array.isArray(w.factors[letter]) && w.factors[letter].length > 0,
        `${w.window_code} leaves factor ${letter} unexamined`);
    }
  }
});

test('every non-PASS criterion names a route out', () => {
  for (const w of SERIES) {
    for (const letter of FACTORS) {
      for (const c of w.factors[letter]) {
        if (c.state !== STATES.PASS) {
          assert.ok(c.route && c.route.trim() !== '',
            `${w.window_code} ${c.code} is ${c.state} with no route`);
        }
      }
    }
  }
});

test('every criterion names its evidence', () => {
  for (const w of SERIES) {
    for (const letter of FACTORS) {
      for (const c of w.factors[letter]) {
        assert.ok(c.evidence && c.evidence.trim() !== '',
          `${w.window_code} ${c.code} carries no evidence`);
      }
    }
  }
});

test('no window is cleared, and the series holds', () => {
  const series = evaluateSeries(SERIES);
  assert.equal(series.total, 3);
  assert.equal(series.cleared, 0, 'no window may report cleared while release authority is held');
  assert.equal(series.held, 3);
  assert.equal(series.series_state, 'QYRIS HOLD');
});

test('release authority is held on every window, so none can be produced', () => {
  for (const w of SERIES) {
    const releaseCriterion = w.factors.X.find((c) => c.code === 'X2_RELEASE_AUTHORITY');
    assert.ok(releaseCriterion, `${w.window_code} has no release-authority criterion`);
    assert.equal(releaseCriterion.state, STATES.HELD);
  }
});

test('the New York window refuses to default its Earth/world classification', () => {
  assert.equal(NEW_YORK_OFFICE.classification, 'UNRESOLVED');
  assert.equal(NEW_YORK_OFFICE.disclosure_text, null);
  const controlling = NEW_YORK_OFFICE.factors.I.find((c) => c.code === 'I3_EARTH_WORLD_UNRESOLVED');
  assert.equal(controlling.state, STATES.HELD);
});

test('the two EdereAriah windows declare world class with disclosure above the 12-character floor', () => {
  for (const w of [ROYAL_KITCHEN, CASTLE_ERC_MIRROR]) {
    assert.equal(w.classification, 'WORLD_SIMULATED');
    assert.ok(w.disclosure_text.length >= 12,
      `${w.window_code} disclosure is below the attested 12-character minimum`);
  }
});

test('the castle anchor is recorded by hash so drift is detectable', () => {
  assert.match(CASTLE_ANCHOR.sha256, /^[0-9a-f]{64}$/);
  assert.equal(CASTLE_ANCHOR.bytes, 8144);
  assert.ok(CASTLE_ANCHOR.attested_by.includes('build8-visual-floor.js'));
  const p1 = CASTLE_ERC_MIRROR.factors.P.find((c) => c.code === 'P1_CASTLE_ANCHOR_VERIFIED');
  assert.equal(p1.state, STATES.PASS);
  assert.ok(p1.evidence.includes(CASTLE_ANCHOR.sha256));
});

test('the ERC mirror term is held, not guessed', () => {
  const t3 = CASTLE_ERC_MIRROR.factors.T.find((c) => c.code === 'T3_ERC_UNDEFINED');
  assert.equal(t3.state, STATES.HELD);
  assert.equal(CASTLE_ERC_MIRROR.brief.mirror_semantics.startsWith('UNKNOWN'), true);
});

test('no window packet contains a generation instruction or asset output', () => {
  for (const w of SERIES) {
    const text = JSON.stringify(w).toLowerCase();
    for (const forbidden of ['generate an image', 'image generation', 'render the image', 'produce the asset now']) {
      assert.equal(text.includes(forbidden), false, `${w.window_code} contains "${forbidden}"`);
    }
  }
});

test('the series reports every blocker with its window, so none is lost in a summary', () => {
  const series = evaluateSeries(SERIES);
  assert.ok(series.all_blockers.length > 0);
  for (const b of series.all_blockers) {
    assert.ok(b.window_code, 'a blocker escaped without naming its window');
    assert.ok(b.code, 'a blocker escaped without a code');
  }
  const codes = new Set(series.all_blockers.map((b) => b.code));
  assert.ok(codes.has('I3_EARTH_WORLD_UNRESOLVED'));
  assert.ok(codes.has('T3_ERC_UNDEFINED'));
  assert.ok(codes.has('P1_NO_APPROVED_REFERENCE'));
});
