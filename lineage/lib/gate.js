// ROOT HOUSE · Lineage Hypothesis Gate
// Math: MATH-LINEAGE-HYPOTHESIS-GATE-656 (backend thylora_math_equation_registry)
// Workroom: WR-LINEAGE-001
//
// No default story. Every origin hypothesis for a person starts equal, and only
// records move it. The family's own word is a hard input: a hypothesis the
// family has ruled out stays at zero unless a primary record about that exact
// person says otherwise. Words that state a hypothesis as fact are blocked
// until that hypothesis clears the claim gate.
//
//   prior        π_h = (1 − F_neg(h)·(1 − R_direct(h))) / Z
//   posterior    P(h|E) = π_h · Π_i λ_i(h) / Σ_g π_g · Π_i λ_i(g)
//   claim gate   C(h) = 1[P(h|E) ≥ θ] · 1[N_indep(h) ≥ 2] · 1[R_direct(h) = 1],  θ = 0.95
//   word gate    W(text) = Π_{t ∈ T(h) mentioned} C(h)    (0 blocks the sentence)
//   reclass      Δ(r_i, r_j) = 1 when the same person's race/origin category
//                changes between two records; INDIGENOUS ↔ BLACK/COLORED/MULATTO
//                changes are recorded as findings and weighted toward the
//                Indigenous hypotheses.

export const THETA = 0.95;

// Origin hypotheses for an ancestor whose family says she came out of Canada.
export const ORIGIN_HYPOTHESES = Object.freeze({
  FIRST_NATIONS:            'Indigenous (First Nations) — nation open',
  INDIGENOUS_AND_AFRICAN:   'Both Indigenous and African ancestry',
  METIS:                    'Métis',
  BLACK_CANADIAN_FREEBORN:  'Free-born Black Canadian community',
  OTHER_OR_UNKNOWN:         'Another origin not yet named'
});

// Words that assert a story as fact. A sentence using them about a person is
// blocked unless the hypothesis behind the word has passed the claim gate.
export const ASSERTION_TERMS = Object.freeze({
  ENSLAVED:      [/\benslav/i, /\bslave\b/i, /\bfugitive\b/i, /\brunaway\b/i, /\bfreedom[- ]seeker/i, /\bunderground railroad\b/i],
  GREAT_MIGRATION: [/\bgreat migration\b/i],
  FIRST_NATIONS: [/\bwas (?:a )?(?:first nations|indigenous|native)\b/i],
  METIS:         [/\bwas (?:a )?m[ée]tis\b/i]
});

// Hypotheses the family has stated are false for a person.
export function familyNegations(person) {
  return new Set(person?.familySays?.never ?? []);
}

export function priors(hypotheses, person, directRecords = new Set()) {
  const neg = familyNegations(person);
  const raw = Object.fromEntries(hypotheses.map(h => [h, 1 - (neg.has(h) ? 1 : 0) * (1 - (directRecords.has(h) ? 1 : 0))]));
  const z = Object.values(raw).reduce((a, b) => a + b, 0);
  return Object.fromEntries(Object.entries(raw).map(([h, v]) => [h, z ? v / z : 0]));
}

// evidence: [{ id, source, independentOf?, direct: bool, lr: { HYP: likelihoodRatio } }]
export function posterior(hypotheses, person, evidence = []) {
  const direct = new Set(evidence.filter(e => e.direct).flatMap(e => Object.entries(e.lr ?? {}).filter(([, v]) => v > 1).map(([h]) => h)));
  const pi = priors(hypotheses, person, direct);
  const score = Object.fromEntries(hypotheses.map(h => [h, pi[h] * evidence.reduce((acc, e) => acc * (e.lr?.[h] ?? 1), 1)]));
  const z = Object.values(score).reduce((a, b) => a + b, 0);
  return Object.fromEntries(hypotheses.map(h => [h, z ? score[h] / z : 0]));
}

export function claimGate(h, person, evidence = [], theta = THETA) {
  const hyps = Object.keys(person.hypotheses ?? ORIGIN_HYPOTHESES);
  const p = posterior(hyps.includes(h) ? hyps : [...hyps, h], person, evidence)[h] ?? 0;
  const supporting = evidence.filter(e => (e.lr?.[h] ?? 1) > 1);
  const independent = new Set(supporting.map(e => e.independentOf ?? e.source)).size;
  const direct = supporting.some(e => e.direct);
  return { hypothesis: h, p, independent, direct, pass: p >= theta && independent >= 2 && direct };
}

// Returns { allowed, blocked: [{ hypothesis, term }] } for a sentence about a person.
export function wordGate(text, person, evidence = []) {
  const blocked = [];
  for (const [h, patterns] of Object.entries(ASSERTION_TERMS)) {
    const hit = patterns.find(rx => rx.test(text));
    if (!hit) continue;
    const gate = claimGate(h, { ...person, hypotheses: { ...(person.hypotheses ?? ORIGIN_HYPOTHESES), [h]: h } }, evidence);
    if (!gate.pass) blocked.push({ hypothesis: h, term: String(hit) });
  }
  return { allowed: blocked.length === 0, blocked };
}

// ── Reclassification detector ──────────────────────────────────────────────
const CATEGORY = [
  ['INDIGENOUS', /^(in|ind|indian|i|r|red|native|nat|am ?ind|american indian|first nations?|cree|blackfoot|siksika|kainai|piikani|ojibwe?|mohawk|cherokee|chickasaw|choctaw)$/i],
  ['BLACK', /^(b|bl|blk|black|neg|negro|n|colored|coloured|c|col|african)$/i],
  ['MULATTO', /^(mu|m|mul|mulatto)$/i],
  ['WHITE', /^(w|wh|white)$/i],
  ['METIS', /^(m[ée]tis|half ?breed|hb)$/i]
];
export function raceCategory(written) {
  const w = String(written ?? '').trim().replace(/\.$/, '');
  if (!w) return 'NOT_RECORDED';
  return CATEGORY.find(([, rx]) => rx.test(w))?.[0] ?? 'OTHER';
}

// records: [{ year, source, race }] for ONE person, any order.
export function reclassifications(records) {
  const rows = [...records].sort((a, b) => a.year - b.year).map(r => ({ ...r, category: raceCategory(r.race) }))
    .filter(r => r.category !== 'NOT_RECORDED');
  const changes = [];
  for (let i = 1; i < rows.length; i++) {
    const a = rows[i - 1], b = rows[i];
    if (a.category === b.category) continue;
    const indigenousShift = [a.category, b.category].includes('INDIGENOUS') || [a.category, b.category].includes('METIS');
    changes.push({ from: a, to: b, indigenousShift });
  }
  return changes;
}

// A reclassification becomes evidence: it raises the Indigenous hypotheses by a
// stated likelihood ratio (default 3) and is never treated as clerical noise
// without a record that says so.
export function reclassificationEvidence(changes, lr = 3) {
  return changes.filter(c => c.indigenousShift).map((c, i) => ({
    id: `RECLASS-${c.from.year}-${c.to.year}-${i}`,
    source: `${c.from.source} → ${c.to.source}`,
    direct: true,
    lr: { FIRST_NATIONS: lr, INDIGENOUS_AND_AFRICAN: lr, METIS: lr }
  }));
}

// The board the Root House shows: every hypothesis, its probability, and its gate.
export function hypothesisBoard(person, evidence = []) {
  const hyps = Object.keys(person.hypotheses ?? ORIGIN_HYPOTHESES);
  const post = posterior(hyps, person, evidence);
  const neg = familyNegations(person);
  return hyps.map(h => ({ hypothesis: h, label: (person.hypotheses ?? ORIGIN_HYPOTHESES)[h], p: post[h],
    gate: claimGate(h, person, evidence), familyRuledOut: neg.has(h) }));
}
