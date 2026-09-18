// HISTORY → SHOW FACTORY · rules tests
// Workroom: WR-SHOWFACTORY-001
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { validateClaim, classifyQuote, strongestSource, tierProfile, TIERS } from '../show-factory/lib/evidence.js';
import { evaluateFormula, scoreFactor, isBiographySummary, FACTORS } from '../show-factory/lib/formula.js';
import { evaluateProvenance, evaluateEvidenceList } from '../show-factory/lib/rights.js';
import { validateFormat, FORMATS, LADDER_ORDER } from '../show-factory/lib/formats.js';
import { productionGate, validateCandidate, recordCorrection, LANES } from '../show-factory/lib/seed.js';

const SEED_DIR = new URL('../show-factory/seeds/', import.meta.url);
const readSeed = name => JSON.parse(fs.readFileSync(new URL(name, SEED_DIR), 'utf8'));

// ── the evidence ladder ──────────────────────────────────────────────────────

test('a claim with no tier is refused before anything else is checked', () => {
  const r = validateClaim({ statement: 'something' });
  assert.equal(r.ok, false);
  assert.equal(r.problems[0].code, 'TIER_MISSING');
});

test('DOCUMENTED needs a primary, archival or scholarly source; popular repetition is not documentation', () => {
  const popular = validateClaim({
    tier: 'DOCUMENTED', statement: 'x',
    sources: [{ source_class: 'POPULAR', citation: 'a quotation website' }]
  });
  assert.ok(popular.problems.some(p => p.code === 'TIER_TOO_STRONG'));

  const primary = validateClaim({
    tier: 'DOCUMENTED', statement: 'x',
    sources: [{ source_class: 'PRIMARY', citation: 'the letter itself' }]
  });
  assert.equal(primary.ok, true);
});

test('a CONTESTED claim must say who disputes it and why', () => {
  const r = validateClaim({
    tier: 'CONTESTED', statement: 'x',
    sources: [{ source_class: 'SCHOLARLY', citation: 'a journal' }]
  });
  assert.ok(r.problems.some(p => p.code === 'DISPUTE_NOTE_MISSING'));
});

test('an UNKNOWN must be stated; a silent gap is not a stated gap', () => {
  assert.ok(validateClaim({ tier: 'UNKNOWN' }).problems.some(p => p.code === 'UNKNOWN_UNSTATED'));
  assert.equal(validateClaim({ tier: 'UNKNOWN', statement: 'Onesimus’s birth name' }).ok, true);
});

test('source ranking prefers the document over the encyclopaedia', () => {
  assert.equal(strongestSource([
    { source_class: 'POPULAR' }, { source_class: 'PRIMARY' }, { source_class: 'JOURNALISTIC' }
  ]), 'PRIMARY');
  assert.equal(strongestSource([]), 'UNSOURCED');
});

// ── quotations: the rule the Curie seed exists to enforce ────────────────────

test('a quotation cannot be called documented wording without the document', () => {
  const r = classifyQuote({
    text: 'Nothing in life is to be feared...',
    state: 'DOCUMENTED_WORDING',
    sources: [{ source_class: 'POPULAR', citation: 'widely quoted' }]
  });
  assert.ok(r.problems.some(p => p.code === 'QUOTE_NOT_DOCUMENTED'));
});

test('an altered quotation must record what the source actually says', () => {
  const r = classifyQuote({ state: 'ALTERED_IN_CIRCULATION', sources: [{ source_class: 'PRIMARY', citation: 'the letter' }] });
  assert.ok(r.problems.some(p => p.code === 'ORIGINAL_WORDING_MISSING'));
});

test('an unsourced line may be an episode subject but never its factual spine', () => {
  const r = classifyQuote({
    state: 'ATTRIBUTED_UNSOURCED', used_as_title: true,
    sources: [{ source_class: 'POPULAR', citation: 'everywhere' }]
  });
  assert.ok(r.problems.some(p => p.code === 'UNSOURCED_QUOTE_AS_TITLE'));
});

test('a misattributed quotation must name who actually wrote it', () => {
  const r = classifyQuote({ state: 'MISATTRIBUTED', sources: [{ source_class: 'PRIMARY', citation: 'Seaborg 1968' }] });
  assert.ok(r.problems.some(p => p.code === 'ACTUAL_AUTHOR_MISSING'));
});

// ── the formula is a product, not a sum ──────────────────────────────────────

test('a missing factor is a zero, not a deduction', () => {
  const four = {
    DOCUMENTED_MOMENT: 'On 12 April 1896 Carver wrote to Booker T. Washington accepting the Tuskegee post.',
    HIDDEN_MECHANISM: 'Legumes fix nitrogen through rhizobia; every famous thing about him is downstream of that.',
    HUMAN_DECISION: 'He stopped painting because he judged it would do his people less good than agriculture.',
    EVIDENCE_GAP: 'No audited product list exists.'
  };
  const r = evaluateFormula({ formula: four });
  assert.equal(r.product, 0);
  assert.deepEqual(r.missing, ['QUESTION_FOR_TODAY']);
});

test('a mood is not a mechanism', () => {
  const r = scoreFactor('HIDDEN_MECHANISM', 'He was ahead of his time and truly changed the world for everyone.');
  assert.equal(r.score, 0);
  assert.ok(r.problems.some(p => p.code === 'HIDDEN_MECHANISM_VAGUE'));
});

test('the question for today must actually be a question', () => {
  const r = scoreFactor('QUESTION_FOR_TODAY', 'We should all think about who checks the machines today.');
  assert.ok(r.problems.some(p => p.code === 'QUESTION_NOT_A_QUESTION'));
});

test('a seed that is only a moment is named as a biography summary', () => {
  const r = isBiographySummary({
    formula: { DOCUMENTED_MOMENT: 'On 12 April 1896 Carver wrote to Booker T. Washington accepting the Tuskegee post.' }
  });
  assert.equal(r.biography_summary, true);
});

// ── rights, provenance, and the people still living ──────────────────────────

test('unresolved copyright blocks production but not research', () => {
  const r = evaluateProvenance({ copyright_state: 'UNRESOLVED', provenance_state: 'CLEAR' });
  assert.equal(r.production_use, false);
  assert.equal(r.research_use, true);
});

test('contested or looted provenance must be disclosed, not quietly used', () => {
  const r = evaluateProvenance({ copyright_state: 'PUBLIC_DOMAIN', provenance_state: 'LOOTED_DOCUMENTED' });
  assert.ok(r.problems.some(p => p.code === 'RESTITUTION_NOT_DISCLOSED'));
});

test('human remains and violated consent require a named clearance', () => {
  const remains = evaluateProvenance({
    copyright_state: 'PUBLIC_DOMAIN', provenance_state: 'CLEAR', people_flags: ['HUMAN_REMAINS']
  });
  assert.ok(remains.problems.some(p => p.code === 'AUTHORITY_CLEARANCE_REQUIRED'));
  const cleared = evaluateProvenance({
    copyright_state: 'PUBLIC_DOMAIN', provenance_state: 'CLEAR',
    people_flags: ['HUMAN_REMAINS'], authority_clearance: 'Oversight committee, 2026-09-01'
  });
  assert.equal(cleared.ok, true);
});

test('identified living descendants must be recorded as contacted, declined or unreachable', () => {
  const r = evaluateProvenance({
    copyright_state: 'PUBLIC_DOMAIN', provenance_state: 'CLEAR',
    people_flags: ['LIVING_DESCENDANTS_IDENTIFIED']
  });
  assert.ok(r.problems.some(p => p.code === 'DESCENDANT_CONTACT_UNRESOLVED'));
});

test('one blocked item blocks that item, not the whole evidence list', () => {
  const r = evaluateEvidenceList([
    { ref: 'A', copyright_state: 'PUBLIC_DOMAIN', provenance_state: 'CLEAR' },
    { ref: 'B', copyright_state: 'UNRESOLVED', provenance_state: 'CLEAR' }
  ]);
  assert.equal(r.production_ready, 1);
  assert.equal(r.blocked.length, 1);
  assert.equal(r.blocked[0].ref, 'B');
});

// ── the output ladder ────────────────────────────────────────────────────────

test('a 60-second short cannot carry a contested claim', () => {
  const claims = [{ ref: 'C1', tier: 'CONTESTED' }];
  const r = validateFormat('SHORT_60', { claim_refs: ['C1'], sources_on_screen: true }, claims);
  assert.ok(r.problems.some(p => p.code === 'SHORT_60_CONTESTED_NOT_ALLOWED'));
});

test('the 20-minute episode may carry inference; the short may not', () => {
  const claims = [{ ref: 'C1', tier: 'INFERENCE' }];
  assert.equal(FORMATS.EPISODE_20.allows_inference, true);
  assert.equal(FORMATS.SHORT_60.allows_inference, false);
  const short = validateFormat('SHORT_60', { claim_refs: ['C1'], sources_on_screen: true }, claims);
  assert.ok(short.problems.some(p => p.code === 'SHORT_60_INFERENCE_NOT_ALLOWED'));
});

test("the children's version must still name what nobody knows", () => {
  const r = validateFormat('CHILDREN', { claim_refs: [], states_the_gap: false }, []);
  assert.ok(r.problems.some(p => p.code === 'CHILDREN_GAP_UNSTATED'));
});

test('a store product cannot ship on unresolved rights', () => {
  const r = validateFormat('STORE_PRODUCT', { product: 'a thing', rights_cleared: false }, []);
  assert.ok(r.problems.some(p => p.code === 'STORE_PRODUCT_RIGHTS_NOT_CLEARED'));
});

test('the ladder is produced top down so a correction propagates', () => {
  assert.equal(LADDER_ORDER[0], 'EPISODE_20');
  assert.ok(LADDER_ORDER.indexOf('EPISODE_20') < LADDER_ORDER.indexOf('SHORT_60'));
  assert.ok(LADDER_ORDER.indexOf('EPISODE_20') < LADDER_ORDER.indexOf('CHILDREN'));
});

// ── the gate ─────────────────────────────────────────────────────────────────

test('the gate reports every unmet prerequisite at once, not one per round trip', () => {
  const g = productionGate({});
  assert.equal(g.gate_state, 'BLOCKED');
  assert.ok(g.blockers.length > 15, `expected many blockers, got ${g.blockers.length}`);
  assert.ok(g.blockers.every(b => b.code && b.detail && b.route));
});

test('a seed whose retelling correction is unsourced is blocked', () => {
  const seed = readSeed('003-the-golden-door.json');
  const stripped = { ...seed, claims: seed.claims.map(c => ({ ...c, corrects_retelling: false })) };
  const g = productionGate(stripped);
  assert.ok(g.blockers.some(b => b.code === 'RETELLING_CORRECTION_UNSOURCED'));
});

test("the children's rung may not rest on a non-documented claim", () => {
  const seed = readSeed('003-the-golden-door.json');
  const bent = JSON.parse(JSON.stringify(seed));
  bent.formats.CHILDREN.claim_refs = ['C10'];  // C10 is CONTESTED
  const g = productionGate(bent);
  assert.ok(g.blockers.some(b => b.code === 'CHILDREN_NON_DOCUMENTED'));
});

test('a seed with no DOCUMENTED claim has no spine to build on', () => {
  const g = productionGate({
    claims: [{ tier: 'CONTESTED', statement: 'x', dispute: 'y', sources: [{ source_class: 'SCHOLARLY', citation: 'z' }] }]
  });
  assert.ok(g.blockers.some(b => b.code === 'NO_DOCUMENTED_SPINE'));
});

// ── the three built seeds ────────────────────────────────────────────────────

const BUILT = ['001-why-not.json', '002-understand-it-first.json', '003-the-golden-door.json'];

test('every built seed satisfies the formula completely', () => {
  for (const name of BUILT) {
    const g = productionGate(readSeed(name));
    assert.equal(g.formula_product, 1, `${name} formula incomplete: ${g.blockers.map(b => b.code).join(', ')}`);
  }
});

test('every built seed classifies every claim and names at least one unknown', () => {
  for (const name of BUILT) {
    const seed = readSeed(name);
    const profile = tierProfile(seed.claims);
    assert.equal(profile.UNCLASSIFIED, 0, `${name} has unclassified claims`);
    assert.ok(profile.UNKNOWN >= 1, `${name} names nothing as unknown`);
    assert.ok(profile.DOCUMENTED >= 1, `${name} has no documented spine`);
  }
});

test('every built seed carries all nine rungs of the output ladder', () => {
  for (const name of BUILT) {
    const seed = readSeed(name);
    for (const rung of LADDER_ORDER) {
      assert.ok(seed.formats[rung], `${name} is missing rung ${rung}`);
    }
  }
});

test('the Carver seed passes the gate outright', () => {
  const g = productionGate(readSeed('003-the-golden-door.json'));
  assert.equal(g.gate_state, 'PASSED', g.blockers.map(b => b.code).join(', '));
});

test('the two blocked seeds are blocked only on named rights problems, not on evidence', () => {
  const johnson = productionGate(readSeed('001-why-not.json'));
  assert.deepEqual(johnson.blockers.map(b => b.code), ['COPYRIGHT_UNRESOLVED']);

  const curie = productionGate(readSeed('002-understand-it-first.json'));
  assert.deepEqual(curie.blockers.map(b => b.code), ['STORE_PRODUCT_RIGHTS_NOT_CLEARED']);
});

test('the Curie seed records the handed-down quotation as altered, with the real author of the second sentence', () => {
  const seed = readSeed('002-understand-it-first.json');
  const q = seed.quotes.find(q => q.ref === 'Q1');
  assert.equal(q.state, 'ALTERED_IN_CIRCULATION');
  assert.match(q.actual_author, /Seaborg/);
  assert.equal(classifyQuote(q).ok, true);
});

test('the Carver seed keeps the two phrases the popular version cuts', () => {
  const seed = readSeed('003-the-golden-door.json');
  const q = seed.quotes.find(q => q.ref === 'Q1');
  assert.match(q.as_documented, /this line of education/);
  assert.match(q.as_documented, /to our people/);
});

// ── the candidate queue ──────────────────────────────────────────────────────

test('every candidate in the queue validates', () => {
  const q = readSeed('candidates.json');
  for (const c of q.candidates) {
    const r = validateCandidate(c);
    assert.equal(r.ok, true, `${c.id}: ${r.problems.map(p => p.code).join(', ')}`);
  }
});

test('the queue holds at least twenty additional moments', () => {
  assert.ok(readSeed('candidates.json').candidates.length >= 20);
});

test('every candidate separates the four kinds of knowing', () => {
  for (const c of readSeed('candidates.json').candidates) {
    for (const tier of TIERS) {
      assert.ok(Array.isArray(c.evidence_status[tier]), `${c.id} has no ${tier} list`);
    }
    assert.ok(c.evidence_status.DOCUMENTED.length >= 1, `${c.id} documents nothing`);
    assert.ok(c.evidence_status.UNKNOWN.length >= 1, `${c.id} admits to knowing everything`);
  }
});

test('every lane is covered across the built seeds and the queue', () => {
  const covered = new Set(readSeed('candidates.json').candidates.map(c => c.lane));
  for (const name of BUILT) covered.add(readSeed(name).lane);
  for (const lane of LANES) assert.ok(covered.has(lane), `no seed or candidate in lane ${lane}`);
});

test('every candidate carries a rights flag, even when the answer is that it is clear', () => {
  for (const c of readSeed('candidates.json').candidates) {
    assert.ok(Array.isArray(c.rights_flags) && c.rights_flags.length >= 1, `${c.id} has no rights note`);
  }
});

// ── corrections ──────────────────────────────────────────────────────────────

test('a correction must record what was wrong, what is now said, the source and the date', () => {
  const r = recordCorrection({ corrections: [] }, { what_was_wrong: 'a figure' });
  assert.equal(r.ok, false);
  assert.ok(r.problems.some(p => p.code === 'CORRECTION_SOURCE_MISSING'));
});

test('corrections append and never overwrite', () => {
  const first = recordCorrection({ corrections: [] }, {
    what_was_wrong: 'the inoculated count', what_is_now_said: 'sources differ: 242, 276, 280',
    source: 'Boylston 1726 and later tabulations', dated: '2026-09-18'
  });
  const second = recordCorrection(first.seed, {
    what_was_wrong: 'the year Onesimus was given to Mather', what_is_now_said: 'sources give 1706 and 13 December 1707',
    source: 'Some Lost Works of Cotton Mather; Herbert 1975', dated: '2026-09-18'
  });
  assert.equal(second.seed.corrections.length, 2);
  assert.equal(second.seed.corrections[0].what_was_wrong, 'the inoculated count');
  assert.equal(second.seed.state, 'CORRECTED');
});

// ── the rules are written twice; they must not drift ─────────────────────────

test('every rule the SQL gate enforces is also enforced by the JS gate', () => {
  const sql = fs.readFileSync(new URL('../db/show-factory/0004_functions.sql', import.meta.url), 'utf8');
  const sqlCodes = new Set([...sql.matchAll(/select\s+'([A-Z][A-Z0-9_]{4,})'/g)].map(m => m[1]));

  // Probe the JS gate with seeds crafted to trip each rule, and collect what it
  // actually emits. Comparing emitted behaviour, not source text, is what makes
  // this a parity check rather than a spelling check.
  const emitted = new Set();
  const probe = seed => productionGate(seed).blockers.forEach(b => emitted.add(b.code));

  probe(null);
  probe({});
  probe({ ...readSeed('003-the-golden-door.json'), claims: [] });
  probe({ claims: [
    { ref: 'N1', statement: 'disputed', tier: 'CONTESTED', dispute: 'historians differ on this point', sources: [{ source_class: 'SCHOLARLY', citation: 'a journal' }] },
    { ref: 'N2', statement: 'also disputed', tier: 'CONTESTED', dispute: 'historians differ on this point too', sources: [] }
  ] });
  {
    const bent = JSON.parse(JSON.stringify(readSeed('003-the-golden-door.json')));
    bent.formats.CHILDREN.claim_refs = ['C10'];                     // CONTESTED in a children's cut
    bent.formats.SHORT_60.claim_refs = ['C10'];                     // CONTESTED in a short
    bent.claims = bent.claims.map(c => ({ ...c, corrects_retelling: false }));
    bent.visual_evidence = [
      { ref: 'X1', copyright_state: 'UNRESOLVED', provenance_state: 'CLEAR' },
      { ref: 'X2', copyright_state: 'PUBLIC_DOMAIN', provenance_state: 'CLEAR', people_flags: ['HUMAN_REMAINS'] },
      { ref: 'X3', copyright_state: 'PUBLIC_DOMAIN', provenance_state: 'CLEAR', people_flags: ['LIVING_DESCENDANTS_IDENTIFIED'] }
    ];
    bent.quotes = [{ ref: 'QX', text: 'x', state: 'DOCUMENTED_WORDING', sources: [{ source_class: 'POPULAR', citation: 'a website' }] }];
    bent.formats.QUESTION_CARDS.cards = ['Only one?'];
    bent.claims.push({ ref: 'CX', statement: 'x', tier: 'DOCUMENTED', sources: [{ source_class: 'POPULAR', citation: 'a website' }] });
    probe(bent);
  }

  // Each SQL rule, and the JS blocker that carries the same rule.
  const PAIRS = {
    SEED_MISSING:                   'SEED_MISSING',
    FACTOR_MISSING_:                'DOCUMENTED_MOMENT_MISSING',
    ACT_MISSING_:                   'FIELD_MISSING_THREE_ACT',
    NO_DOCUMENTED_SPINE:            'NO_DOCUMENTED_SPINE',
    TIER_TOO_STRONG:                'TIER_TOO_STRONG',
    SOURCE_MISSING:                 'SOURCE_MISSING',
    QUOTE_NOT_DOCUMENTED:           'QUOTE_NOT_DOCUMENTED',
    RETELLING_CORRECTION_UNSOURCED: 'RETELLING_CORRECTION_UNSOURCED',
    COPYRIGHT_UNRESOLVED:           'COPYRIGHT_UNRESOLVED',
    AUTHORITY_CLEARANCE_REQUIRED:   'AUTHORITY_CLEARANCE_REQUIRED',
    DESCENDANT_CONTACT_UNRESOLVED:  'DESCENDANT_CONTACT_UNRESOLVED',
    FORMAT_MISSING_:                'SHORT_60_MISSING',
    SHORT_60_TIER_NOT_ALLOWED:      'SHORT_60_CONTESTED_NOT_ALLOWED',
    CHILDREN_NON_DOCUMENTED:        'CHILDREN_NON_DOCUMENTED',
    QUESTION_CARDS_TOO_FEW:         'QUESTION_CARDS_TOO_FEW_CARDS'
  };

  const unmapped = [...sqlCodes].filter(c => !(c in PAIRS));
  assert.deepEqual(unmapped, [], `SQL emits rules with no JS counterpart declared: ${unmapped.join(', ')}`);

  const unenforced = Object.entries(PAIRS)
    .filter(([sqlCode]) => sqlCodes.has(sqlCode))
    .filter(([, jsCode]) => !emitted.has(jsCode))
    .map(([sqlCode, jsCode]) => `${sqlCode} -> ${jsCode}`);
  assert.deepEqual(unenforced, [], `SQL enforces rules the JS gate never emits: ${unenforced.join(', ')}`);

  assert.ok(sqlCodes.size >= 14, `expected the SQL gate to carry the rule set, found ${sqlCodes.size} codes`);
});

test('the seeds on disk are the seeds the gate was run against', () => {
  const dir = fs.readdirSync(new URL('../show-factory/seeds/', import.meta.url));
  assert.deepEqual(
    dir.filter(f => f.endsWith('.json')).sort(),
    ['001-why-not.json', '002-understand-it-first.json', '003-the-golden-door.json', 'candidates.json']
  );
});
