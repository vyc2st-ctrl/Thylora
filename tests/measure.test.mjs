// THYLORA Kaelorps · Measuring — tape-reading math tests (WR-SPINE-624, Lane M)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseReading, formatReading, toMixed, tickClass, TICK, SIXTEENTHS_PER_CLASS,
  sixteenthsToTenThousandthsMm, sixteenthsToMmTenths, sixteenthsToMmExact, formatMmTenths,
  toMm, parseMm, mmToSixteenths, clearance, ALLOWED_DENOMINATORS
} from '../learn/lib/measure.js';

test('round trip: every sixteenth from 0 to 12 in (0..192) formats and parses back', () => {
  for (let s = 0; s <= 16 * 12; s++) {
    const text = formatReading(s);
    assert.equal(parseReading(text), s, `round trip failed at ${s} (${text})`);
  }
});

test('worked examples: 8 3/4 = 140/16, 8 5/8 = 138/16, 8 7/16 = 135/16', () => {
  assert.equal(parseReading('8 3/4'), 140);
  assert.equal(parseReading('8 5/8'), 138);
  assert.equal(parseReading('8 7/16'), 135);
  assert.equal(formatReading(140), '8 3/4');
  assert.equal(formatReading(138), '8 5/8');
  assert.equal(formatReading(135), '8 7/16');
});

test('ordering: 8 7/16 < 8 5/8 < 8 3/4', () => {
  const a = parseReading('8 7/16'), b = parseReading('8 5/8'), c = parseReading('8 3/4');
  assert.ok(a < b && b < c);
  assert.equal(b - a, 3); // 3/16 apart
  assert.equal(c - b, 2); // 2/16 = 1/8 apart
});

test('plain whole and pure fractions parse', () => {
  assert.equal(parseReading('8'), 128);
  assert.equal(parseReading('0'), 0);
  assert.equal(parseReading('3/16'), 3);
  assert.equal(parseReading('1/2'), 8);
  assert.equal(parseReading('  12  '), 192);
  assert.equal(parseReading('8-3/4'), 140);
  assert.equal(parseReading('8 3/4"'), 140);
  assert.equal(parseReading('8 3/4 in'), 140);
});

test('unreduced readings are accepted and format to lowest terms', () => {
  assert.equal(parseReading('8 6/8'), 140);
  assert.equal(parseReading('8 12/16'), 140);
  assert.equal(formatReading(parseReading('4 8/16')), '4 1/2');
  assert.equal(formatReading(parseReading('2/4')), '1/2');
});

test('formatting always reduces: 8/16 -> 1/2, 4/16 -> 1/4, 2/16 -> 1/8', () => {
  assert.equal(formatReading(8), '1/2');
  assert.equal(formatReading(4), '1/4');
  assert.equal(formatReading(2), '1/8');
  assert.equal(formatReading(1), '1/16');
  assert.equal(formatReading(16), '1');
  assert.deepEqual(toMixed(140), { whole: 8, num: 3, den: 4 });
  assert.deepEqual(toMixed(192), { whole: 12, num: 0, den: 1 });
});

test('tick classes for representative positions', () => {
  assert.equal(tickClass(0), TICK.WHOLE);
  assert.equal(tickClass(128), TICK.WHOLE);
  assert.equal(tickClass(136), TICK.HALF);      // 8 1/2
  assert.equal(tickClass(140), TICK.QUARTER);   // 8 3/4
  assert.equal(tickClass(138), TICK.EIGHTH);    // 8 5/8
  assert.equal(tickClass(135), TICK.SIXTEENTH); // 8 7/16
});

test('tick class counts in one inch: 1 whole-start, 1 half, 2 quarters, 4 eighths, 8 sixteenths', () => {
  const count = { WHOLE: 0, HALF: 0, QUARTER: 0, EIGHTH: 0, SIXTEENTH: 0 };
  for (let s = 0; s < 16; s++) count[tickClass(s)]++;
  assert.deepEqual(count, { WHOLE: 1, HALF: 1, QUARTER: 2, EIGHTH: 4, SIXTEENTH: 8 });
});

test('why each mark is half the previous: 1/2 = 8/16, 1/4 = 4/16, 1/8 = 2/16, 1/16 = 1/16', () => {
  assert.equal(parseReading('1'), 16);
  assert.equal(parseReading('1/2'), 8);
  assert.equal(parseReading('1/4'), 4);
  assert.equal(parseReading('1/8'), 2);
  assert.equal(parseReading('1/16'), 1);
  const order = ['WHOLE', 'HALF', 'QUARTER', 'EIGHTH', 'SIXTEENTH'];
  for (let i = 1; i < order.length; i++) {
    assert.equal(SIXTEENTHS_PER_CLASS[order[i]] * 2, SIXTEENTHS_PER_CLASS[order[i - 1]]);
  }
});

test('mm conversion is exact: 1 in = 25.4 mm, 1/16 in = 1.5875 mm', () => {
  assert.equal(sixteenthsToTenThousandthsMm(16), 254000);
  assert.equal(sixteenthsToMmExact(16), '25.4');
  assert.equal(sixteenthsToMmExact(1), '1.5875');
  assert.equal(sixteenthsToMmExact(192), '304.8');   // 12 in = 1 ft
  assert.equal(sixteenthsToMmExact(140), '222.25');  // 8 3/4
  assert.equal(sixteenthsToMmExact(138), '219.075'); // 8 5/8
  assert.equal(sixteenthsToMmExact(135), '214.3125');// 8 7/16
  assert.equal(sixteenthsToMmExact(0), '0');
});

test('mm rounding rule: nearest 0.1 mm, halves away from zero', () => {
  assert.equal(formatMmTenths(sixteenthsToMmTenths(140)), '222.3'); // 222.25 -> 222.3 (half up)
  assert.equal(formatMmTenths(sixteenthsToMmTenths(138)), '219.1'); // 219.075 -> 219.1
  assert.equal(formatMmTenths(sixteenthsToMmTenths(135)), '214.3'); // 214.3125 -> 214.3
  assert.equal(formatMmTenths(sixteenthsToMmTenths(1)), '1.6');     // 1.5875 -> 1.6
  assert.equal(formatMmTenths(sixteenthsToMmTenths(-140)), '-222.3');
  assert.deepEqual(toMm(16), { exact: '25.4', rounded: '25.4' });
});

test('mm -> nearest sixteenth', () => {
  assert.equal(parseMm('25.4'), 254000);
  assert.equal(mmToSixteenths('25.4'), 16);
  assert.equal(mmToSixteenths('222.25'), 140);
  assert.equal(mmToSixteenths('2743.2'), 108 * 16); // 9 ft
  assert.equal(mmToSixteenths('0.79'), 0);   // below half of 1.5875
  assert.equal(mmToSixteenths('0.8'), 1);    // above half
  assert.throws(() => parseMm('-3'), RangeError);
  assert.throws(() => parseMm('abc'), RangeError);
});

test('every sixteenth 0..192 survives inch -> exact mm -> inch', () => {
  for (let s = 0; s <= 192; s++) assert.equal(mmToSixteenths(sixteenthsToMmExact(s)), s);
});

test('clearance: 9 ft door vs 74 in vehicle, 12 in minimum per side -> FIT', () => {
  const r = clearance('108', '74', '12');
  assert.equal(r.C.sixteenths, 34 * 16);
  assert.equal(r.C.reading, '34');
  assert.equal(r.C.mm, '863.6');
  assert.equal(r.perSide.reading, '17');
  assert.equal(r.perSide.mm, '431.8');
  assert.equal(r.verdict, 'FIT');
});

test('clearance with fractions and odd sixteenths keeps per-side exact in 32nds', () => {
  const r = clearance('8 3/4', '8 7/16', '1/8');
  assert.equal(r.C.sixteenths, 5);           // 5/16
  assert.equal(r.C.reading, '5/16');
  assert.equal(r.perSide.thirtySeconds, 5);  // 5/32 per side
  assert.equal(r.perSide.reading, '5/32');
  assert.equal(r.perSide.sixteenthsFloor, 2);
  assert.equal(r.C.mm, '7.9');               // 7.9375 -> 7.9
  assert.equal(r.perSide.mm, '4.0');         // 3.96875 -> 4.0
  assert.equal(r.verdict, 'FIT');            // 5/32 >= 4/32
});

test('clearance: below minimum and vehicle wider than opening both fail', () => {
  const tight = clearance('96', '80', '12'); // 8 ft door, 80 in vehicle -> 8 in per side
  assert.equal(tight.perSide.reading, '8');
  assert.equal(tight.verdict, 'NO_FIT');
  assert.equal(tight.reason, 'BELOW_MINIMUM_PER_SIDE');
  const wide = clearance('70', '74 1/2', '0');
  assert.equal(wide.C.sixteenths, -72);
  assert.equal(wide.C.reading, '−4 1/2');
  assert.equal(wide.verdict, 'NO_FIT');
  assert.equal(wide.reason, 'VEHICLE_WIDER_THAN_OPENING');
  const exact = clearance('100', '76', '12');  // exactly 12 per side -> FIT at threshold
  assert.equal(exact.verdict, 'FIT');
});

test('clearance requires a stated minimum and accepts integer sixteenths', () => {
  assert.throws(() => clearance('108', '74'), TypeError);
  assert.equal(clearance(1728, 1184, 192).verdict, 'FIT');
  assert.throws(() => clearance(-1, 0, 0), RangeError);
});

test('invalid denominators throw (only 1, 2, 4, 8, 16)', () => {
  assert.deepEqual([...ALLOWED_DENOMINATORS], [1, 2, 4, 8, 16]);
  for (const bad of ['8 1/3', '8 3/5', '1/32', '8 5/10', '3/12', '1/1']) {
    assert.throws(() => parseReading(bad), RangeError, bad);
  }
});

test('numerator >= denominator, zero numerator and malformed readings throw', () => {
  for (const bad of ['8 4/4', '8 16/16', '8 17/16', '5/4', '8 0/4', '', '   ', '-8', '8.75', 'eight', '8 3/', '/4', '8 3 / 4 x']) {
    assert.throws(() => parseReading(bad), RangeError, JSON.stringify(bad));
  }
  assert.throws(() => parseReading(140), TypeError);
});

test('bad integer inputs throw in format / tick / mm', () => {
  assert.throws(() => formatReading(1.5), TypeError);
  assert.throws(() => formatReading(-1), RangeError);
  assert.throws(() => tickClass(-2), RangeError);
  assert.throws(() => tickClass(2.5), TypeError);
  assert.throws(() => sixteenthsToMmExact(0.5), TypeError);
});
