// QYRIS QUICKCHECK · readout tests
// Product: THY-QYRIS-QUICKCHECK-001 · Workroom: WR-STORE-QYRIS-581
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createContext, runInContext } from 'node:vm';
import { readout, RULES, VERDICTS, allCombinations, EVIDENCE_CLASSES } from '../store/qyris-quickcheck/lib/readout.js';

// Load the SHIPPED sheet script the same way a browser would: as a classic
// script, with no DOM present. It exposes its own readout so the two rule
// tables can be compared by behaviour rather than by reading them.
function loadShippedSheet() {
  const source = readFileSync(new URL('../store/qyris-quickcheck/quickcheck.js', import.meta.url), 'utf8');
  const context = createContext({});
  runInContext(source, context);
  return runInContext('globalThis.QYRIS_QUICKCHECK', context);
}

test('the rule table covers every possible input combination', () => {
  const combinations = allCombinations();
  assert.equal(combinations.length, 48);
  for (const input of combinations) {
    const result = readout(input);
    assert.ok(VERDICTS[result.verdict], JSON.stringify(input));
    assert.ok(result.rule_fired, JSON.stringify(input));
  }
});

test('every combination reaches exactly one verdict, and it is reproducible', () => {
  for (const input of allCombinations()) {
    const first = readout(input);
    const second = readout({ ...input });
    assert.equal(first.verdict, second.verdict);
    assert.equal(first.rule_fired, second.rule_fired);
  }
});

test('every rule in the table can actually fire', () => {
  const fired = new Set(allCombinations().map(i => readout(i).rule_fired));
  for (const rule of RULES) assert.ok(fired.has(rule.id), `${rule.id} is unreachable`);
});

test('every rule states when it applies and why it exists', () => {
  for (const rule of RULES) {
    assert.ok(rule.when && rule.because, `${rule.id} is unexplained`);
    assert.ok(VERDICTS[rule.verdict], `${rule.id} has no verdict`);
  }
});

test('unabsorbable and unrecoverable is always DECLINE', () => {
  for (const weakest_link of EVIDENCE_CLASSES) {
    for (const stop_rule of [true, false]) {
      const result = readout({ weakest_link, reversal_cost: 'HIGH', can_absorb: false, stop_rule });
      assert.equal(result.verdict, 'DECLINE');
      assert.equal(result.rule_fired, 'R1');
    }
  }
});

test('a weakest link resting on hope never proceeds', () => {
  for (const input of allCombinations().filter(i => i.weakest_link === 'HOPED')) {
    const result = readout(input);
    assert.notEqual(result.verdict, 'PROCEED');
    assert.notEqual(result.verdict, 'PROCEED_WITH_SAFEGUARD');
  }
});

test('an assumption always demands a safeguard, never a bare proceed', () => {
  for (const input of allCombinations().filter(i => i.weakest_link === 'ASSUMED' && i.can_absorb)) {
    assert.equal(readout(input).verdict, 'PROCEED_WITH_SAFEGUARD');
  }
});

test('a hard-to-undo decision is never a bare proceed', () => {
  for (const input of allCombinations().filter(i => i.reversal_cost === 'HIGH')) {
    assert.notEqual(readout(input).verdict, 'PROCEED');
  }
});

test('a bare PROCEED requires observed or reported evidence and a reversible decision', () => {
  for (const input of allCombinations()) {
    if (readout(input).verdict !== 'PROCEED') continue;
    assert.ok(['OBSERVED', 'REPORTED'].includes(input.weakest_link));
    assert.notEqual(input.reversal_cost, 'HIGH');
    assert.equal(input.can_absorb, true);
  }
});

test('proceed-with-safeguard without a written stop rule demands one first', () => {
  const result = readout({ weakest_link: 'ASSUMED', reversal_cost: 'HIGH', can_absorb: true, stop_rule: false });
  assert.equal(result.verdict, 'PROCEED_WITH_SAFEGUARD');
  assert.ok(result.required_before_committing.some(r => r.code === 'STOP_RULE_REQUIRED'));
});

test('a hold always tells the reader to name the fact', () => {
  for (const input of allCombinations()) {
    const result = readout(input);
    if (result.verdict !== 'HOLD_FOR_ONE_MORE_FACT') continue;
    assert.ok(result.required_before_committing.some(r => r.code === 'NAME_THE_FACT'));
  }
});

test('the worked example reaches PROCEED WITH SAFEGUARD on rule R4', () => {
  // C&W Auto transmission: $4,200 repair against a ~$6,800 car.
  // Weakest link "the rest of the car has three years left" rests on an
  // assumption; paying the shop cannot be undone; $4,200 is absorbable.
  const result = readout({ weakest_link: 'ASSUMED', reversal_cost: 'HIGH', can_absorb: true, stop_rule: true });
  assert.equal(result.verdict, 'PROCEED_WITH_SAFEGUARD');
  assert.equal(result.rule_fired, 'R4');
  assert.deepEqual([...result.required_before_committing], []);
});

test('the same decision without the inspection stop rule is not clean', () => {
  const result = readout({ weakest_link: 'ASSUMED', reversal_cost: 'HIGH', can_absorb: true, stop_rule: false });
  assert.equal(result.required_before_committing[0].code, 'STOP_RULE_REQUIRED');
});

test('bad input is refused rather than guessed', () => {
  assert.throws(() => readout({ weakest_link: 'PROBABLY', reversal_cost: 'LOW', can_absorb: true, stop_rule: true }), /weakest_link/);
  assert.throws(() => readout({ weakest_link: 'OBSERVED', reversal_cost: 'SOME', can_absorb: true, stop_rule: true }), /reversal_cost/);
  assert.throws(() => readout({ weakest_link: 'OBSERVED', reversal_cost: 'LOW', can_absorb: 'yes', stop_rule: true }), /can_absorb/);
});

// --------------------------------------------------------- shipped sheet ---

test('the shipped sheet runs as a classic script with no DOM and no network', () => {
  const source = readFileSync(new URL('../store/qyris-quickcheck/quickcheck.js', import.meta.url), 'utf8');
  assert.ok(!/\bimport\s|\bexport\s/.test(source), 'a module script is blocked when the file is opened from disk');
  assert.ok(!/fetch\(|XMLHttpRequest|navigator\.sendBeacon|https?:\/\//.test(source), 'the sheet must make no network call');
  assert.ok(loadShippedSheet(), 'the sheet did not expose its readout');
});

test('the shipped sheet and the canonical rule table agree on all 48 combinations', () => {
  const shipped = loadShippedSheet();
  for (const input of allCombinations()) {
    const canonical = readout(input);
    const onSheet = shipped.readout(input);
    assert.equal(onSheet.verdict, canonical.verdict, JSON.stringify(input));
    assert.equal(onSheet.rule_fired, canonical.rule_fired, JSON.stringify(input));
    assert.equal(onSheet.label, canonical.label, JSON.stringify(input));
    // Array.from re-creates the value in this realm; the vm sandbox is a
    // different realm, so a cross-realm array is never reference-equal.
    assert.deepEqual(Array.from(onSheet.required_before_committing, r => r.code),
      canonical.required_before_committing.map(r => r.code), JSON.stringify(input));
  }
});

test('the shipped sheet carries the same five rules in the same order', () => {
  const shipped = loadShippedSheet();
  assert.deepEqual(Array.from(shipped.RULES, r => r.id), RULES.map(r => r.id));
  assert.deepEqual(Array.from(shipped.RULES, r => r.verdict), RULES.map(r => r.verdict));
  assert.deepEqual(Array.from(shipped.RULES, r => r.because), RULES.map(r => r.because));
});

test('the document makes no external request and stores nothing off-device', () => {
  const html = readFileSync(new URL('../store/qyris-quickcheck/quickcheck.html', import.meta.url), 'utf8');
  assert.ok(!/https?:\/\/|\/\/[a-z0-9-]+\./i.test(html.replace(/<!--[\s\S]*?-->/g, '')), 'the document references an external origin');
  assert.ok(!/type=["']module["']/.test(html), 'a module script will not load from disk');
  assert.equal((html.match(/<section class="page"/g) || []).length, 14);
});

test('the document contains no testimonial and no invented statistic', () => {
  const html = readFileSync(new URL('../store/qyris-quickcheck/quickcheck.html', import.meta.url), 'utf8');
  assert.ok(!/testimonial|five stars|customers say|reviews|\bguarantee[ds]?\b/i.test(html));
  assert.ok(!/\b\d{1,3}% of (people|users|decisions|customers)/i.test(html));
  // The only counts the document states are ones the test suite can verify.
  assert.ok(html.includes('48'), 'the document should state the combination count it can prove');
});
