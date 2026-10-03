// ROOT HOUSE · lineage, sources, worker, tea table tests
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LINES, generation, lineOf, relationName, seatsForLine, gradeClaim, isProtectedLiving,
  creditEntry, openTasks, migrationTests } from '../lineage/lib/lineage.js';
import { RESEARCHERS, silhouette, creditLine } from '../lineage/lib/researchers.js';
import { SOURCES, sourcesFor } from '../lineage/lib/sources.js';
import { runWorker, queriesFor } from '../lineage/lib/worker.js';
import { dealNight, pourOrder, elderAnswer, awardCube } from '../lineage/lib/teatable.js';

test('the four lines start at seats 4, 5, 6, 7', () => {
  assert.deepEqual(Object.values(LINES).map(l => l.root), [4, 5, 6, 7]);
  for (const [code, l] of Object.entries(LINES)) assert.equal(lineOf(l.root), code);
});

test('every ancestor seat belongs to exactly one line', () => {
  const all = Object.keys(LINES).flatMap(c => seatsForLine(c, 5));
  assert.equal(new Set(all).size, all.length);
  assert.equal(all.length, 4 * (1 + 2 + 4 + 8 + 16));
  for (const c of Object.keys(LINES)) for (const n of seatsForLine(c, 5)) assert.equal(lineOf(n), c);
});

test('great-grandparents 8–15 split two per grandparent', () => {
  assert.deepEqual(seatsForLine('FF', 2), [4, 8, 9]);
  assert.deepEqual(seatsForLine('MM', 2), [7, 14, 15]);
  assert.equal(generation(15), 3);
  assert.equal(relationName(14), 'Great-grandfather (MM line)');
  assert.equal(relationName(5), "Father's mother");
});

test('family memory is kept and graded, never promoted without records', () => {
  assert.equal(gradeClaim({}), 'UNKNOWN');
  assert.equal(gradeClaim({ family_told: ['Mom'] }), 'FAMILY_TOLD');
  assert.equal(gradeClaim({ family_told: ['Mom'], evidence: [{ value: 'Ontario' }] }), 'LEAD');
  const rec = (holder, informant) => ({ value: 'Ontario', reviewed: true, holder, informant });
  assert.equal(gradeClaim({ evidence: [rec('NARA', 'son')] }), 'POSSIBLE');
  assert.equal(gradeClaim({ evidence: [rec('NARA', 'son'), rec('NARA', 'son')] }), 'POSSIBLE', 'same record twice is not independent');
  assert.equal(gradeClaim({ evidence: [rec('NARA', 'son'), rec('TSLA', 'daughter')] }), 'PROBABLE');
  assert.equal(gradeClaim({ evidence: [rec('NARA', 'son'), rec('TSLA', 'daughter'), rec('LAC', 'self')] }), 'PROVEN');
});

test('records that disagree are contested, not averaged', () => {
  assert.equal(gradeClaim({ evidence: [{ value: 'Ontario', reviewed: true, holder: 'A' }, { value: 'Tennessee', reviewed: true, holder: 'B' }] }), 'CONTESTED');
});

test('living people stay private', () => {
  const now = new Date('2026-10-03');
  assert.equal(isProtectedLiving({ birth_year: 1960 }, now), true);
  assert.equal(isProtectedLiving({}, now), true);
  assert.equal(isProtectedLiving({ birth_year: 1890 }, now), false);
  assert.equal(isProtectedLiving({ birth_year: 1960, death_year: 2010 }, now), false);
});

test('credit needs a researcher, a seat, a field and a source', () => {
  assert.deepEqual(creditEntry({}).problems, ['RESEARCHER_MISSING', 'SEAT_MISSING', 'FIELD_MISSING', 'SOURCE_MISSING']);
  assert.equal(creditEntry({ researcher: 'ines', seat: 14, claim_field: 'birth_place', source_id: 'lac-census' }).ok, true);
  assert.match(creditLine('ines', 'Library and Archives Canada'), /Library and Archives Canada/);
  assert.throws(() => creditLine('ines'), /record holder/);
});

test('empty seats become routed tasks, parents first', () => {
  const tasks = openTasks({}, RESEARCHERS, 3);
  assert.equal(tasks.length, 2 + 4 * 7);
  assert.equal(tasks[0].seat, 2);
  assert.ok(tasks.every(t => t.assigned === 'odessa'));
  const named = openTasks({ 4: { given: 'A', surname: 'B' } }, RESEARCHERS, 1);
  assert.ok(named.some(t => t.seat === 4 && t.need === 'BIRTH' && t.assigned === 'dez'));
});

test('the Canada story becomes six record tests', () => {
  assert.equal(migrationTests('Canada -> Memphis').length, 6);
  assert.equal(migrationTests('Memphis').length, 0);
});

test('every researcher is different and every desk is staffed', () => {
  const looks = RESEARCHERS.map(r => `${r.look.hair}|${r.look.tool}|${r.look.height}`);
  assert.equal(new Set(looks).size, RESEARCHERS.length);
  const svgs = RESEARCHERS.map(r => silhouette(r.look));
  assert.equal(new Set(svgs).size, RESEARCHERS.length);
  const desks = new Set(RESEARCHERS.map(r => r.desk));
  for (const s of SOURCES) assert.ok(desks.has(s.desk), `${s.id} routes to an unstaffed desk`);
});

test('the vault: unique ids, https links, Canada and Memphis both covered', () => {
  assert.equal(new Set(SOURCES.map(s => s.id)).size, SOURCES.length);
  assert.ok(SOURCES.length >= 100);
  for (const s of SOURCES) assert.match(s.url, /^https?:\/\//);
  assert.ok(sourcesFor({ desk: 'CANADA' }).length >= 15);
  assert.ok(sourcesFor({ query: 'memphis' }).length >= 15);
});

test('worker turns names into leads and never grades them', async () => {
  const family = { people: { 7: { given: 'Hattie', surname: 'Doe', birth_place: 'Chatham, Ontario' } } };
  assert.deepEqual(queriesFor(family.people[7]), ['"Hattie Doe"', '"Hattie Doe" Chatham']);
  const fetchImpl = async url => ({ ok: true, json: async () => url.includes('loc.gov')
    ? { results: [{ title: 'Provincial Freeman', date: '1855-03-24', url: 'https://www.loc.gov/item/x/' }] }
    : { response: { docs: [{ identifier: 'chathamdir1871', title: 'Chatham directory' }] } } });
  const r = await runWorker(family, { fetchImpl, now: new Date('2026-10-03T00:00:00Z') });
  assert.equal(r.leads.length, 2, 'duplicate hits across queries collapse');
  assert.ok(r.leads.every(l => l.grade === 'LEAD' && l.reviewed === false && l.line === 'MM'));
});

test('worker records provider failures instead of stopping', async () => {
  const r = await runWorker({ people: { 4: { given: 'A', surname: 'B' } } }, { fetchImpl: async () => { throw new Error('denied'); } });
  assert.equal(r.leads.length, 0);
  assert.equal(r.errors.length, 2);
});

test('the tea table pours for everyone, rotates, and deals an Elder card every third night', () => {
  const players = ['Mom', 'Key', 'Jordan', 'Cali'];
  assert.deepEqual(pourOrder(players, 1), ['Key', 'Jordan', 'Cali', 'Mom']);
  const night = dealNight(players, '2026-10-03', 3);
  assert.equal(night.length, 4);
  assert.equal(night.filter(c => c.deck === 'ELDER').length, 1);
  assert.deepEqual(dealNight(players, '2026-10-03', 3), night, 'same night, same cards on every device');
  assert.equal(dealNight(players, '2026-10-04', 4).filter(c => c.deck === 'ELDER').length, 0);
  assert.throws(() => awardCube({}, 'Key'), /reason/);
  assert.equal(elderAnswer({ asker: 'Cali', teller: 'Grandma', answer: 'Ontario' }).grade, 'FAMILY_TOLD');
});
