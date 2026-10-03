// HEAD · Spine Forward tests
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SHOW, EDITORIAL_RULES, checkQuestion, checkNumberContext, checkBalance } from '../head/lib/editorial.js';
import { verifyHeadMeasurement, usHatSize, nightcapSpec, shirtSpec } from '../head/lib/fit.js';
import { storyEconomy, breakEvenUnits, productionRelease, turnaroundFee, tipPlan } from '../head/lib/ventures.js';
import { coverage, splitPoints } from '../head/lib/coverage.js';
import { LOGIC_MODES } from '../head/lib/logic.js';

test('show is renamed and our place comes first', () => {
  assert.equal(SHOW.name, 'MIRROR LINE');
  assert.equal(SHOW.order_of_coverage[0], 'OUR_PLACE_FIRST');
  assert.equal(EDITORIAL_RULES.length, 9);
});

test('accusing questions are caught; neutral questions pass', () => {
  assert.ok(checkQuestion('Why did you lie to the deputies?').some(f => f.code === 'PRESUMED_GUILT'));
  assert.ok(checkQuestion("Isn't it true you left him on the island?").some(f => f.code === 'ISNT_IT_TRUE'));
  assert.ok(checkQuestion('You saw him go in the water, didn\'t you?').some(f => f.code === 'LEADING_TAG'));
  assert.ok(checkQuestion('Tell us about that chilling afternoon.').some(f => f.code === 'SLIDE_WORD'));
  assert.deepEqual(checkQuestion('Walk me through that afternoon, starting when the boat landed.'), []);
  assert.deepEqual(checkQuestion('Where was everyone standing at three o\'clock?'), []);
});

test('a number without its context cannot air', () => {
  assert.deepEqual(checkNumberContext({ source: 'MS DOH', base: 'per 100k' }).missing, ['period', 'comparison']);
  assert.equal(checkNumberContext({ source: 's', base: 'b', period: 'p', comparison: 'c' }).airable, true);
});

test('every side is asked; one-sided interviews fail', () => {
  assert.equal(checkBalance({ family: ['a', 'b'] }).balanced, false);
  assert.equal(checkBalance({ family: ['a', 'b'], sheriff: ['a'] }).balanced, true);
  assert.equal(checkBalance({ family: ['a', 'b', 'c'], sheriff: ['a'] }).balanced, false);
});

test('string-and-ruler head measurement must be repeated, in range, with a photo', () => {
  assert.deepEqual(verifyHeadMeasurement({ readings_mm: [575] }).problems, ['TWO_READINGS_REQUIRED', 'PHOTO_OF_RULER_REQUIRED']);
  assert.ok(verifyHeadMeasurement({ readings_mm: [570, 590], photo_ref: 'p' }).problems.includes('READINGS_DISAGREE'));
  const ok = verifyHeadMeasurement({ readings_mm: [22.6, 22.66], unit: 'in', photo_ref: 'p' });
  assert.equal(ok.verified, true);
  assert.equal(ok.head_mm, 575);
});

test('hat size is circumference over pi, to the eighth', () => {
  assert.deepEqual(usHatSize(575), { decimal: 7.25, label: '7 1/4' });
  assert.deepEqual(usHatSize(559), { decimal: 7, label: '7' });
});

test('nightcap: silk inside, cotton outside, logo on the brim, baby not for sleep', () => {
  const w = nightcapSpec({ head_mm: 560, wearer: 'WOMAN' });
  assert.match(w.inner, /SILK/); assert.match(w.outer, /COTTON/);
  assert.equal(w.band_mm, 521);
  assert.match(w.brim.accent, /blue/);
  const baby = nightcapSpec({ head_mm: 400, wearer: 'BABY' });
  assert.equal(baby.sleep_use_allowed, false);
  assert.ok(nightcapSpec({ head_mm: 580, wearer: 'MAN' }).band_mm < 580);
});

test('two people both called 2X get different shirts by body and preference', () => {
  const a = shirtSpec({ chest_mm: 1220, waist_mm: 1120, body_length_mm: 790, sleeve_mm: 260, fit: 'SNUG' });
  const b = shirtSpec({ chest_mm: 1220, waist_mm: 1120, body_length_mm: 790, sleeve_mm: 260, fit: 'BAGGY' });
  assert.equal(a.finished_mm.chest_mm, 1270);
  assert.equal(b.finished_mm.chest_mm, 1470);
  assert.doesNotMatch(a.maker_instruction, /\b2X\b/);
});

test('story economy: family share appears on every product and nothing is lost', () => {
  const shares = { beneficiary: 4000, creator: 4000, platform: 2000 };
  const r = storyEconomy([
    { product: 'Documentary purchase', units: 1000, price_minor: 999, fee_bp: 300 },
    { product: 'Book', units: 500, price_minor: 2499, unit_cost_minor: 700, fee_bp: 300 },
    { product: 'Nightcap', units: 300, price_minor: 3800, unit_cost_minor: 1400, fee_bp: 300 }
  ], shares);
  for (const row of r.rows) {
    assert.ok(row.split.beneficiary > 0);
    assert.equal(Object.values(row.split).reduce((a, b) => a + b, 0), row.base);
  }
  assert.equal(r.basis, 'ASSUMPTION');
  assert.throws(() => storyEconomy([], { a: 5000 }));
});

test('make nothing until it is paid for', () => {
  assert.deepEqual(breakEvenUnits({ fixed_minor: 300000, price_minor: 3800, unit_cost_minor: 1400, fee_bp: 300 }), { possible: true, margin_minor: 2286, units: 132 });
  assert.equal(breakEvenUnits({ fixed_minor: 1, price_minor: 100, unit_cost_minor: 100 }).possible, false);
  assert.deepEqual(productionRelease({ paid_preorders: 40, maker_minimum: 100, cash_minor: 1, run_cost_minor: 2 }).blockers, ['NEED_60_MORE_PAID_PREORDERS', 'CASH_BELOW_RUN_COST']);
  assert.equal(productionRelease({ paid_preorders: 120, maker_minimum: 100, cash_minor: 5, run_cost_minor: 2 }).release, true);
});

test('restaurant partner pays only on improvement; tip at the door adds up', () => {
  assert.equal(turnaroundFee({ baseline_minor: 2000000, after_minor: 2600000, rate_bp: 2000 }).fee_minor, 120000);
  assert.equal(turnaroundFee({ baseline_minor: 2000000, after_minor: 1800000, rate_bp: 2000 }).fee_minor, 0);
  assert.deepEqual(tipPlan({ bill_minor: 8000, arrival_bp: 1000, service_bp: 1500 }), { arrival_minor: 800, service_minor: 1200, total_minor: 2000, total_bp: 2500 });
});

test('a response with any unanswered point is not complete', () => {
  const c = coverage([{ id: 1, answered_in: '§1' }, { id: 2, answered_in: null }]);
  assert.equal(c.complete, false); assert.deepEqual(c.gaps, [2]);
  assert.equal(coverage([{ id: 1, answered_in: '§1' }]).complete, true);
  assert.ok(splitPoints("let's start the show. I want a nightcap with silk inside. what about my apps you mentioned").length >= 3);
});

test('logic modes each carry a question and a worked example', () => {
  assert.ok(LOGIC_MODES.length >= 12);
  for (const m of LOGIC_MODES) { assert.ok(m.asks.endsWith('?')); assert.ok(m.example.length > 20); }
});
