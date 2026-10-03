// THE ROOT HOUSE · lineage tests
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  lineOf, relationOf, fatherOf, motherOf, placesFromText, planFor,
  validatePerson, coverage, creditFinding, LINES
} from '../lineage/lib/lineage.js';
import { SOURCES, sourcesFor } from '../lineage/lib/sources.js';
import { RESEARCHERS, deskTeamFor, silhouetteSignature } from '../lineage/lib/researchers.js';

test('the four grandparent lines are exact', () => {
  assert.equal(lineOf(4), 'FF');
  assert.equal(lineOf(5), 'FM');
  assert.equal(lineOf(6), 'MF');
  assert.equal(lineOf(7), 'MM');
  assert.equal(lineOf(fatherOf(fatherOf(4))), 'FF');      // 16
  assert.equal(lineOf(motherOf(motherOf(7))), 'MM');      // 31
  assert.equal(lineOf(motherOf(6)), 'MF');                // 13
  assert.equal(lineOf(fatherOf(5)), 'FM');                // 10
  assert.equal(lineOf(1), null);
  assert.equal(lineOf(3), null);
});

test('relations read in plain words', () => {
  assert.equal(relationOf(7), "Mother's mother");
  assert.match(relationOf(15), /^Great-grandmother \(mother's side, via M\)$/);
  assert.match(relationOf(16), /^2× great-grandfather/);
});

test('every grandparent line has a DNA route', () => {
  for (const l of LINES) assert.ok(l.dna.length >= 1 && l.dnaNote);
  assert.ok(LINES.find(l => l.code === 'FF').dna.includes('YDNA'));
  assert.ok(LINES.find(l => l.code === 'MM').dna.includes('MTDNA'));
});

test('Canada and Memphis are recognised from the family\'s own words', () => {
  const p = placesFromText('Mama said she came out of Canada, then Memphis');
  for (const want of ['CANADA', 'MEMPHIS', 'TN', 'US']) assert.ok(p.includes(want), want);
  assert.ok(placesFromText('Chatham, Ontario').includes('ONTARIO'));
});

test('a Canada-claim great-grandmother gets the census birthplace test and Canadian records', () => {
  const plan = planFor({ slot: 15, clue: 'came out of Canada, settled Memphis', born: 1890, died: 1960 });
  const codes = plan.steps.map(s => s.source);
  assert.ok(plan.flags.includes('CANADA_ORIGIN_CLAIM'));
  for (const want of ['US_CENSUS_1900_1940', 'US_CANADA_BORDER', 'LAC_CENSUS', 'ONTARIO_VITALS', 'SHELBY_REGISTER', 'MTDNA'])
    assert.ok(codes.includes(want), want);
  assert.ok(!codes.includes('YDNA'), 'Y-DNA cannot follow a mother\'s-mother line');
  assert.ok(codes.indexOf('ELDER_INTERVIEW') < codes.indexOf('LAC_CENSUS'), 'ask the family first');
});

test('pre-1870 people are flagged for the bridge desk', () => {
  const plan = planFor({ slot: 16, name: 'Unknown', place: 'Shelby County, Tennessee', born: 1840, died: 1900 });
  assert.ok(plan.flags.includes('PRE_1870_WALL'));
  assert.ok(plan.steps.some(s => s.source === 'US_SLAVE_SCHEDULES'));
  assert.ok(deskTeamFor(plan).some(r => r.desk === 'DESK_BRIDGE'));
});

test('sources respect era: no 1950 census for someone who died in 1900', () => {
  const codes = sourcesFor({ places: ['US'], born: 1830, died: 1900 }).map(s => s.code);
  assert.ok(!codes.includes('US_CENSUS_1950'));
  assert.ok(codes.includes('US_CENSUS_1870'));
});

test('documented facts need evidence', () => {
  assert.equal(validatePerson({ slot: 4, name: 'X', confidence: 'ORAL' }).valid, true);
  assert.equal(validatePerson({ slot: 4, name: 'X', confidence: 'PROVEN' }).valid, false);
  assert.equal(validatePerson({ slot: 0, name: 'X' }).valid, false);
});

test('coverage shows open slots per line', () => {
  const c = coverage([{ slot: 4, name: 'A' }, { slot: 7, name: 'B' }], 3);
  assert.deepEqual(c.perLine.FF, { known: 1, total: 3 });
  assert.deepEqual(c.perLine.FM, { known: 0, total: 3 });
  assert.equal(c.rows.length, 15);
});

test('every finding credits a person and the record holder', () => {
  const bad = creditFinding({ slot: 15, fact: 'Born Ontario 1891', source: 'ONTARIO_VITALS', credits: [] });
  assert.equal(bad.ok, false);
  const good = creditFinding({ slot: 15, fact: 'Born Ontario 1891', source: 'ONTARIO_VITALS',
    credits: [{ who: 'Desmond Aubin', role: 'FOUND' }, { who: 'Grandma', role: 'REMEMBERED' }] });
  assert.equal(good.ok, true);
  assert.ok(good.finding.credits.some(c => c.role === 'HOLDS_RECORD' && /Archives of Ontario/.test(c.who)));
});

test('the source registry is well formed and unique', () => {
  assert.ok(SOURCES.length >= 45);
  assert.equal(new Set(SOURCES.map(s => s.code)).size, SOURCES.length);
  for (const s of SOURCES) {
    assert.ok(s.name && s.holder && s.yields, s.code);
    assert.ok(s.era[0] <= s.era[1], s.code);
    assert.ok(['FREE', 'PAID', 'REQUEST'].includes(s.access), s.code);
  }
});

test('no two researchers look alike', () => {
  const sigs = RESEARCHERS.map(silhouetteSignature);
  assert.equal(new Set(sigs).size, RESEARCHERS.length);
  assert.equal(new Set(RESEARCHERS.map(r => r.look.hair ?? r.look.head)).size, RESEARCHERS.length);
});
