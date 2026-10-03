// ROOT HOUSE · the backend research worker
// Workroom: WR-LINEAGE-001
//
// Runs without anyone sitting at a screen (GitHub Actions on a schedule, or by
// hand). For every named ancestor it searches the open archives that allow
// automated queries, and writes LEADS. A lead is never a fact: a person on a
// Root House desk reviews it, and only then can it become a graded claim.
//
// fetchImpl is injected so tests run offline and the worker can swap providers.

import { relationName, lineOf, openTasks, migrationTests } from './lineage.js';
import { RESEARCHERS } from './researchers.js';

export const PROVIDERS = Object.freeze({
  chronam: {
    label: 'Chronicling America (Library of Congress)', desk: 'NEWSPAPERS', source_id: 'chron-am',
    url: q => `https://www.loc.gov/collections/chronicling-america/?q=${encodeURIComponent(q)}&fo=json&c=10`,
    parse: json => (json?.results ?? []).map(r => ({
      title: r.title, date: r.date, url: r.url ?? r.id,
      place: Array.isArray(r.location) ? r.location.join(', ') : r.location ?? null }))
  },
  archive: {
    label: 'Internet Archive', desk: 'NEWSPAPERS', source_id: 'ia',
    url: q => `https://archive.org/advancedsearch.php?q=${encodeURIComponent(q)}&fl%5B%5D=identifier&fl%5B%5D=title&fl%5B%5D=date&rows=10&output=json`,
    parse: json => (json?.response?.docs ?? []).map(d => ({
      title: d.title, date: d.date ?? null, url: `https://archive.org/details/${d.identifier}`, place: null }))
  }
});

export function displayName(p = {}) {
  return [p.given, p.middle, p.surname].filter(Boolean).join(' ').trim();
}

// Quoted full name, plus place when known; maiden name for women when known.
export function queriesFor(person = {}) {
  const out = [];
  const name = displayName(person);
  if (!name || !person.surname) return out;
  const places = [person.birth_place, person.residence, person.death_place].filter(Boolean);
  out.push(`"${name}"`);
  for (const place of places) out.push(`"${name}" ${place.split(',')[0]}`);
  if (person.maiden_name && person.maiden_name !== person.surname) {
    out.push(`"${person.given} ${person.maiden_name}"`);
  }
  return [...new Set(out)];
}

export async function runWorker(family, { fetchImpl = globalThis.fetch, providers = Object.keys(PROVIDERS), now = new Date() } = {}) {
  const people = family?.people ?? {};
  const leads = [];
  const errors = [];
  for (const [seatKey, person] of Object.entries(people)) {
    const seat = Number(seatKey);
    for (const q of queriesFor(person)) {
      for (const key of providers) {
        const provider = PROVIDERS[key];
        try {
          const res = await fetchImpl(provider.url(q), { headers: { 'User-Agent': 'THYLORA-RootHouse/1.0 (family research)' } });
          if (!res.ok) { errors.push({ seat, provider: key, query: q, status: res.status }); continue; }
          for (const hit of provider.parse(await res.json())) {
            leads.push({ seat, relation: relationName(seat), line: lineOf(seat), query: q,
              provider: key, source_id: provider.source_id, desk: provider.desk,
              assigned: RESEARCHERS.find(r => r.desk === provider.desk)?.id ?? null,
              grade: 'LEAD', reviewed: false, ...hit });
          }
        } catch (error) {
          errors.push({ seat, provider: key, query: q, error: String(error.message ?? error) });
        }
      }
    }
  }
  const seen = new Set();
  const unique = leads.filter(l => { const k = `${l.seat}|${l.url}`; if (seen.has(k)) return false; seen.add(k); return true; });
  const migrations = Object.entries(people)
    .filter(([, p]) => p.migration_story)
    .map(([seat, p]) => ({ seat: Number(seat), story: p.migration_story, tests: migrationTests(p.migration_story) }));
  return {
    run_at: now.toISOString(),
    named_people: Object.values(people).filter(p => p.surname).length,
    leads: unique,
    tasks: openTasks(people, RESEARCHERS, 3),
    migration_checks: migrations.concat((family?.stories ?? [])
      .filter(s => s.migration).map(s => ({ seat: s.seat ?? null, story: s.text, tests: migrationTests(s.migration) }))),
    errors
  };
}
