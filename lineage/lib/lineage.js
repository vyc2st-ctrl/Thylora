// ROOT HOUSE · lineage rules
// Workroom: WR-LINEAGE-001
//
// People first. Every ancestor is a numbered seat (Ahnentafel numbering), every
// fact about them is a claim, and every claim carries a grade that only evidence
// can raise. Family-told memory is kept, credited and graded — never erased and
// never silently promoted to proof.

// Ahnentafel: you are 1. Father = 2n, mother = 2n+1.
export const LINES = Object.freeze({
  FF: { code: 'FF', label: "Father's father line", root: 4, dna: 'Y-DNA (carried father → son)' },
  FM: { code: 'FM', label: "Father's mother line", root: 5, dna: 'Autosomal / X-DNA' },
  MF: { code: 'MF', label: "Mother's father line", root: 6, dna: 'Autosomal / X-DNA' },
  MM: { code: 'MM', label: "Mother's mother line", root: 7, dna: 'mtDNA (carried mother → every child)' }
});

export const GRADES = Object.freeze([
  'UNKNOWN',      // seat exists, nothing known
  'FAMILY_TOLD',  // oral history: credited, preserved, not yet tested
  'LEAD',         // a record that might be them, not yet reviewed
  'POSSIBLE',     // one record agrees, nothing conflicts
  'PROBABLE',     // two independent records agree
  'PROVEN',       // three+ independent records agree, conflicts resolved
  'CONTESTED'     // records disagree — held open, both sides shown
]);

export function generation(n) {
  if (!Number.isInteger(n) || n < 1) throw new RangeError('seat must be a positive integer');
  return Math.floor(Math.log2(n));
}

export function lineOf(n) {
  const g = generation(n);
  if (g < 2) return null;              // you, your parents: above the four lines
  return ['FF', 'FM', 'MF', 'MM'][n >> (g - 2) & 3];
}

export function relationName(n) {
  const g = generation(n);
  if (n === 1) return 'You';
  const parent = n % 2 === 0 ? 'father' : 'mother';
  if (g === 1) return parent[0].toUpperCase() + parent.slice(1);
  if (g === 2) return (n === 4 || n === 5 ? "Father's " : "Mother's ") + parent;
  const prefix = g === 3 ? 'Great-grand' : `${g - 2}× great-grand`;
  return `${prefix}${parent} (${lineOf(n)} line)`;
}

export function seatsForLine(code, generations = 5) {
  const root = LINES[code]?.root;
  if (!root) throw new Error(`unknown line ${code}`);
  const seats = [];
  for (let g = 2; g < 2 + generations; g++) {
    const width = 1 << (g - 2);
    for (let i = 0; i < width; i++) seats.push(root * width + i);
  }
  return seats;
}

export function parentsOf(n) { return { father: 2 * n, mother: 2 * n + 1 }; }
export function childOf(n) { return n > 1 ? Math.floor(n / 2) : null; }

// Independent = different record holders AND different informants.
export function gradeClaim(claim = {}) {
  const evidence = claim.evidence ?? [];
  const told = claim.family_told ?? [];
  const values = new Set(evidence.map(e => normalise(e.value)).filter(Boolean));
  if (values.size > 1) return 'CONTESTED';
  const reviewed = evidence.filter(e => e.reviewed);
  const independent = new Set(reviewed.map(e => `${e.holder}|${e.informant ?? 'unknown'}`)).size;
  if (independent >= 3) return 'PROVEN';
  if (independent === 2) return 'PROBABLE';
  if (independent === 1) return 'POSSIBLE';
  if (evidence.length) return 'LEAD';
  if (told.length) return 'FAMILY_TOLD';
  return 'UNKNOWN';
}

function normalise(value) {
  return value == null ? '' : String(value).trim().toLowerCase().replace(/\s+/g, ' ');
}

// Living people are never published. Anyone without a death record and born
// within 110 years is treated as living.
export function isProtectedLiving(person = {}, today = new Date()) {
  if (person.death_year || person.deceased) return false;
  if (!person.birth_year) return true;
  return today.getUTCFullYear() - person.birth_year < 110;
}

// Credit is recorded at the moment a find is accepted and can never be removed,
// only corrected with a new entry.
export function creditEntry({ researcher, seat, claim_field, source_id, note = '' }, at = new Date()) {
  const problems = [];
  if (!researcher) problems.push('RESEARCHER_MISSING');
  if (!Number.isInteger(seat) || seat < 1) problems.push('SEAT_MISSING');
  if (!claim_field) problems.push('FIELD_MISSING');
  if (!source_id) problems.push('SOURCE_MISSING');
  if (problems.length) return { ok: false, problems };
  return { ok: true, entry: { researcher, seat, claim_field, source_id, note, credited_at: at.toISOString() } };
}

// Turn empty seats into research tasks routed to the right desk.
export function openTasks(people = {}, researchers = [], generations = 3) {
  const tasks = [];
  const seats = [[2, null], [3, null]];
  for (const code of Object.keys(LINES)) for (const seat of seatsForLine(code, generations)) seats.push([seat, code]);
  {
    for (const [seat, code] of seats) {
      const p = people[seat];
      const named = p && (p.given || p.surname);
      if (!named) {
        tasks.push({ seat, line: code, need: 'NAME', ask: `Name of ${relationName(seat)}`,
          desk: 'ORAL_HISTORY', route: 'Parlor · ask the eldest living relative on this line' });
        continue;
      }
      if (!p.birth_year) tasks.push({ seat, line: code, need: 'BIRTH',
        ask: `Birth year and place for ${p.given ?? ''} ${p.surname ?? ''}`.trim(), desk: 'CENSUS',
        route: 'Census 1880–1950: age + birthplace + parents’ birthplaces' });
      if (!p.death_year && p.birth_year && !isProtectedLiving(p)) tasks.push({ seat, line: code, need: 'DEATH',
        ask: `Death record for ${p.given ?? ''} ${p.surname ?? ''}`.trim(), desk: 'CHURCH_CEMETERY',
        route: 'State death certificate → informant → funeral home → cemetery' });
    }
  }
  return tasks.map(t => ({ ...t, assigned: (researchers.find(r => r.desk === t.desk) ?? {}).id ?? null }));
}

// Migration claims (e.g. "came out of Canada") become testable checkpoints.
export function migrationTests(place) {
  const p = String(place ?? '').toLowerCase();
  if (!p.includes('canada')) return [];
  return [
    { test: 'US census birthplace', look: '1880–1950 US census: person or a parent born "Canada", "Can Eng", "Can Fr", "Ontario", "Nova Scotia"' },
    { test: 'Border crossing', look: 'Canada → US border crossings 1895–1956 (NARA St. Albans lists and port manifests)' },
    { test: 'Canadian census', look: 'LAC census 1851–1931: surname in Kent, Essex, Lincoln, Grey counties ON or Halifax, Annapolis counties NS' },
    { test: 'Death certificate', look: 'Tennessee death certificate fields: birthplace, father’s and mother’s birthplaces' },
    { test: 'Refugee settlement', look: 'Elgin/Buxton, Chatham, Windsor, Amherstburg, St. Catharines, Owen Sound, Toronto, Halifax records' },
    { test: 'Place-name check', look: 'Confirm "Canada" means the country — not a nickname, a US community, or a church/lodge name' }
  ];
}
