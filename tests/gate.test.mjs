// ROOT HOUSE · lineage hypothesis gate + GEDCOM tests
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ORIGIN_HYPOTHESES, posterior, claimGate, wordGate, reclassifications, reclassificationEvidence,
  hypothesisBoard, raceCategory } from '../lineage/lib/gate.js';
import { parseGedcom, seatFrom } from '../lineage/lib/gedcom.js';
import { migrationTests } from '../lineage/lib/lineage.js';

const maSweet = { familySays: { never: ['ENSLAVED'] } };
const H = Object.keys(ORIGIN_HYPOTHESES);

test('no default story: every origin hypothesis starts equal', () => {
  const p = posterior(H, maSweet, []);
  for (const h of H) assert.equal(p[h], 1 / H.length);
});

test('the family word holds: "enslaved" stays at zero and the word is blocked', () => {
  const g = claimGate('ENSLAVED', maSweet, []);
  assert.equal(g.p, 0);
  assert.equal(g.pass, false);
  const w = wordGate('She was enslaved before she left', maSweet, []);
  assert.equal(w.allowed, false);
  assert.equal(w.blocked[0].hypothesis, 'ENSLAVED');
  assert.equal(wordGate('She was part of the Great Migration', maSweet, []).allowed, false);
  assert.equal(wordGate('She came out of Canada', maSweet, []).allowed, true);
});

test('only a direct record can lift a family-ruled-out hypothesis', () => {
  const ev = [{ id: 'x', source: 'A', direct: true, lr: { ENSLAVED: 50 } }];
  assert.ok(claimGate('ENSLAVED', maSweet, ev).p > 0);
});

test('a race change Indian → Negro across censuses is caught and raises the Indigenous hypotheses', () => {
  const changes = reclassifications([
    { year: 1930, source: 'US census 1930', race: 'Neg' },
    { year: 1910, source: 'US census 1910', race: 'In' },
    { year: 1920, source: 'US census 1920', race: '' }
  ]);
  assert.equal(changes.length, 1);
  assert.equal(changes[0].indigenousShift, true);
  const ev = reclassificationEvidence(changes);
  const p = posterior(H, maSweet, ev);
  assert.ok(p.FIRST_NATIONS > 1 / H.length);
  assert.ok(p.BLACK_CANADIAN_FREEBORN < 1 / H.length);
  assert.equal(raceCategory('Mu'), 'MULATTO');
  assert.equal(raceCategory('Blackfoot'), 'INDIGENOUS');
});

test('a claim needs probability, two independent sources and a direct record', () => {
  const one = [{ id: 'a', source: 'Indian Register', direct: true, lr: { FIRST_NATIONS: 400 } }];
  assert.equal(claimGate('FIRST_NATIONS', maSweet, one).pass, false);
  const two = [...one, { id: 'b', source: 'Treaty 7 paylist', direct: true, lr: { FIRST_NATIONS: 400 } }];
  assert.equal(claimGate('FIRST_NATIONS', maSweet, two).pass, true);
  assert.equal(hypothesisBoard(maSweet, two).length, H.length);
});

test('Canada tests open Indigenous records and read the race column', () => {
  const t = migrationTests('Canada');
  assert.ok(t.some(x => /Indian Register|treaty/i.test(x.look)));
  assert.ok(t.some(x => /race column/i.test(x.look)));
  assert.ok(!t.some(x => /refugee|freedom/i.test(x.test + x.look)));
});

test('GEDCOM import seats ancestors by Ahnentafel number', () => {
  const ged = `0 HEAD
0 @I1@ INDI
1 NAME Root /Person/
1 FAMC @F1@
0 @I2@ INDI
1 NAME Dad /Person/
1 SEX M
1 BIRT
2 DATE 1936
2 PLAC Tipton, Tennessee
1 FAMS @F1@
0 @I3@ INDI
1 NAME Mom /Other/
1 SEX F
1 FAMC @F2@
1 FAMS @F1@
0 @I4@ INDI
1 NAME Gran /Line/
1 FAMS @F2@
0 @F1@ FAM
1 HUSB @I2@
1 WIFE @I3@
1 CHIL @I1@
0 @F2@ FAM
1 WIFE @I4@
1 CHIL @I3@
0 TRLR`;
  const tree = parseGedcom(ged);
  const seats = seatFrom(tree, '@I1@');
  assert.equal(seats.get(2).name, 'Dad Person');
  assert.equal(seats.get(2).birth.place, 'Tipton, Tennessee');
  assert.equal(seats.get(7).name, 'Gran Line');
  assert.equal(seats.has(6), false);
});
