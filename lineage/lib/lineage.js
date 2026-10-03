// THE ROOT HOUSE · lineage model, research planner and credit ledger
// Workroom: WR-ROOTHOUSE-001
//
// People first. Every person in the tree carries an Ahnentafel number, the
// standard genealogists use: 1 is you, a person n has father 2n and mother 2n+1.
// That makes the four grandparent lines exact and machine-checkable:
//
//   4  father's father   →  8, 16, 32 … (the Y-DNA line)
//   5  father's mother   →  10, 11, 20, 21 …
//   6  mother's father   →  12, 13, 24, 25 …
//   7  mother's mother   →  15, 31, 63 … (the mtDNA line)
//
// Nothing here guesses a name. A person is either a fact with a source and a
// confidence, or an open slot with a research plan.

import { sourcesFor, SOURCE_BY_CODE } from './sources.js';

export const LINES = [
  { code: 'FF', root: 4, label: "Father's father line", desk: 'DESK_FF', dna: ['YDNA', 'AUTOSOMAL'],
    dnaNote: 'Y-DNA from you (if male), your father, his brothers, or any male cousin through the father-to-son line.' },
  { code: 'FM', root: 5, label: "Father's mother line", desk: 'DESK_FM', dna: ['MTDNA', 'AUTOSOMAL'],
    dnaNote: "Your father and his siblings carry his mother's mtDNA — one of them tests it. Autosomal for everything else." },
  { code: 'MF', root: 6, label: "Mother's father line", desk: 'DESK_MF', dna: ['YDNA', 'AUTOSOMAL'],
    dnaNote: "Your mother's brother, or his sons, carry her father's Y-DNA. Autosomal for everything else." },
  { code: 'MM', root: 7, label: "Mother's mother line", desk: 'DESK_MM', dna: ['MTDNA', 'AUTOSOMAL'],
    dnaNote: 'mtDNA from you, your mother, or any of her children — it passes mother to child unbroken.' }
];

export const CONFIDENCE = ['ORAL', 'INDICATED', 'DOCUMENTED', 'PROVEN'];

export function fatherOf(n) { return 2 * n; }
export function motherOf(n) { return 2 * n + 1; }
export function generationOf(n) { return Math.floor(Math.log2(n)); }

// Which grandparent line a slot belongs to (null for 1, 2, 3).
export function lineOf(n) {
  if (n < 4) return null;
  let k = n;
  while (k >= 8) k = Math.floor(k / 2);
  return LINES.find(l => l.root === k)?.code ?? null;
}

const RELATION = { 1: 'You', 2: 'Father', 3: 'Mother', 4: "Father's father", 5: "Father's mother", 6: "Mother's father", 7: "Mother's mother" };

export function relationOf(n) {
  if (RELATION[n]) return RELATION[n];
  const steps = [];
  let k = n;
  while (k > 1) { steps.unshift(k % 2 === 0 ? 'father' : 'mother'); k = Math.floor(k / 2); }
  const gen = steps.length;
  const greats = gen - 2;
  const tail = steps[steps.length - 1] === 'father' ? 'grandfather' : 'grandmother';
  const side = steps[0] === 'father' ? "father's side" : "mother's side";
  const via = steps.slice(1, -1).map(s => (s === 'father' ? 'F' : 'M')).join('');
  return `${greats === 1 ? 'Great-' : `${greats}× great-`}${tail} (${side}${via ? `, via ${via}` : ''})`;
}

// Places the planner understands, derived from what the family wrote down.
export function placesFromText(text = '') {
  const t = text.toLowerCase();
  const out = new Set();
  if (/memphis/.test(t)) out.add('MEMPHIS');
  if (/memphis|tennessee|\btn\b|shelby/.test(t)) out.add('TN');
  if (/canada|ontario|windsor|chatham|toronto|buxton|amherstburg|nova scotia|halifax|montreal|qu[eé]bec/.test(t)) out.add('CANADA');
  if (/ontario|windsor|chatham|toronto|buxton|amherstburg|st\.? catharines|hamilton/.test(t)) out.add('ONTARIO');
  if (/nova scotia|halifax|birchtown|preston/.test(t)) out.add('NOVA_SCOTIA');
  if (/montreal|qu[eé]bec/.test(t)) out.add('QUEBEC');
  if (/africa|nigeria|ghana|senegal|congo|angola|sierra leone|benin|cameroon/.test(t)) out.add('AFRICA');
  // "Canada" with no province: open all three provinces Black families most
  // often came through, rather than guessing one.
  if (out.has('CANADA') && !['ONTARIO', 'NOVA_SCOTIA', 'QUEBEC'].some(p => out.has(p)))
    ['ONTARIO', 'NOVA_SCOTIA', 'QUEBEC'].forEach(p => out.add(p));
  if (out.size === 0 || [...out].some(p => ['TN', 'MEMPHIS'].includes(p))) out.add('US');
  return [...out];
}

export function validatePerson(person) {
  const problems = [];
  if (!Number.isInteger(person.slot) || person.slot < 1) problems.push('Slot must be an Ahnentafel number of 1 or more.');
  if (!person.name && !person.clue) problems.push('Give a name, a nickname, or at least one clue.');
  if (person.confidence && !CONFIDENCE.includes(person.confidence)) problems.push(`Confidence must be one of ${CONFIDENCE.join(', ')}.`);
  if ((person.confidence === 'DOCUMENTED' || person.confidence === 'PROVEN') && !(person.evidence?.length))
    problems.push('DOCUMENTED and PROVEN need at least one evidence entry naming the record.');
  if (person.born && person.died && person.died < person.born) problems.push('Death year is before birth year.');
  return { valid: problems.length === 0, problems };
}

// The research plan for one person: which records to pull, in order, and why.
// Ordering rule: work from the person's death backwards — the newest records
// name the parents, and each answer unlocks the next older record.
export function planFor(person) {
  const places = placesFromText(`${person.place ?? ''} ${person.clue ?? ''}`);
  const born = person.born ?? null;
  const died = person.died ?? null;
  const line = LINES.find(l => l.code === lineOf(person.slot));
  const picked = sourcesFor({ places, born, died });

  const order = ['ORAL', 'VITAL', 'SOCIAL', 'CENSUS', 'BORDER', 'DIRECTORY', 'NEWSPAPER', 'CEMETERY',
    'MILITARY', 'CHURCH', 'COMMUNITY', 'FREEDOM', 'PROBATE', 'LAND', 'ENSLAVEMENT', 'INDEX', 'DNA'];
  picked.sort((a, b) => order.indexOf(a.kind) - order.indexOf(b.kind) || b.era[1] - a.era[1]);

  // DNA: only the test that actually follows this person's line.
  const dnaCodes = line?.dna ?? ['AUTOSOMAL'];
  const steps = picked
    .filter(s => s.kind !== 'DNA' || dnaCodes.includes(s.code))
    .map((s, i) => ({ step: i + 1, source: s.code, name: s.name, holder: s.holder, access: s.access, why: s.yields }));

  const flags = [];
  if (places.includes('CANADA')) flags.push('CANADA_ORIGIN_CLAIM');
  if (born !== null && born < 1870) flags.push('PRE_1870_WALL');
  if (!person.name) flags.push('NAME_UNKNOWN');
  return { slot: person.slot, relation: relationOf(person.slot), line: line?.code ?? null, dnaNote: line?.dnaNote ?? null, places, flags, steps };
}

// Empty slots are work, not silence: list every ancestor slot up to a
// generation depth with who is known and who is still open.
export function coverage(people, depth = 4) {
  const bySlot = new Map(people.map(p => [p.slot, p]));
  const rows = [];
  for (let n = 1; n < 2 ** (depth + 1); n++) {
    const p = bySlot.get(n);
    rows.push({ slot: n, relation: relationOf(n), line: lineOf(n), known: Boolean(p?.name), confidence: p?.confidence ?? null });
  }
  const perLine = Object.fromEntries(LINES.map(l => {
    const mine = rows.filter(r => r.line === l.code);
    return [l.code, { known: mine.filter(r => r.known).length, total: mine.length }];
  }));
  return { rows, perLine };
}

// ── Credit ledger ──────────────────────────────────────────────────────────
// Whoever finds it gets named on it: a Root House researcher, a family member
// who remembered, an archivist, a volunteer indexer, a cousin who tested.
export const CREDIT_ROLES = ['FOUND', 'CONFIRMED', 'REMEMBERED', 'TRANSCRIBED', 'TESTED_DNA', 'HOLDS_RECORD'];

export function creditFinding({ slot, fact, source, credits }) {
  const problems = [];
  if (!fact) problems.push('A finding states the fact it adds.');
  if (!SOURCE_BY_CODE.has(source)) problems.push(`Unknown source ${source}.`);
  if (!credits?.length) problems.push('Every finding credits at least one person or institution.');
  for (const c of credits ?? []) {
    if (!c.who) problems.push('A credit needs a name.');
    if (!CREDIT_ROLES.includes(c.role)) problems.push(`Credit role must be one of ${CREDIT_ROLES.join(', ')}.`);
  }
  if (problems.length) return { ok: false, problems };
  const holder = SOURCE_BY_CODE.get(source).holder;
  const withHolder = credits.some(c => c.role === 'HOLDS_RECORD')
    ? credits
    : [...credits, { who: holder, role: 'HOLDS_RECORD' }];
  return { ok: true, finding: { slot, relation: relationOf(slot), fact, source, credits: withHolder } };
}
