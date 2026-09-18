// HISTORY → SHOW FACTORY · the seed record and the production gate
// Workroom: WR-SHOWFACTORY-001
//
// The gate is the whole factory. It reports EVERY unmet prerequisite in one
// call, each with the route that clears it, so a researcher fixes the record in
// one pass. It is written here so the researcher sees the answer immediately,
// and again in SQL (hsf_production_gate) so a different client cannot bypass it.

import { validateClaim, classifyQuote, tierProfile, TIERS } from './evidence.js';
import { evaluateFormula, isBiographySummary } from './formula.js';
import { evaluateEvidenceList } from './rights.js';
import { validateFormat, LADDER_ORDER, FORMATS } from './formats.js';

export const SEED_STATES = Object.freeze(['RESEARCH', 'SEEDED', 'GATED', 'PRODUCTION_READY', 'CORRECTED', 'WITHDRAWN']);

export const LANES = Object.freeze([
  'QUESTIONS', 'MISTAKES_TO_DISCOVERY', 'CHALLENGED_ASSUMPTIONS', 'ENGINEERING_FAILURE',
  'MAPS', 'MEDICINE', 'AGRICULTURE', 'SCIENCE', 'TRADE', 'EDUCATION', 'ART', 'LANGUAGE', 'ORDINARY_LIFE'
]);

// The nineteen fields a full seed carries. A candidate carries the first block only.
export const REQUIRED_SEED_FIELDS = Object.freeze([
  'source', 'date_context', 'documented_wording', 'what_happened', 'popular_retelling_error',
  'what_is_contested', 'formula', 'episode_premise', 'opening_question', 'three_act',
  'visual_evidence', 'formats', 'rights_notes'
]);

/**
 * The production gate. Returns a gate_state and every blocker at once.
 */
export function productionGate(seed) {
  const blockers = [];
  const add = (code, detail, route) => blockers.push({ code, detail, route });

  if (!seed || typeof seed !== 'object') {
    return { gate_state: 'BLOCKED', blockers: [{ code: 'SEED_MISSING', detail: 'No seed record.', route: 'seeds/' }] };
  }

  // 1 · Shape
  for (const field of REQUIRED_SEED_FIELDS) {
    const v = seed[field];
    const empty = v == null || (typeof v === 'string' && !v.trim()) ||
                  (Array.isArray(v) && v.length === 0) ||
                  (typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0);
    if (empty) add(`FIELD_MISSING_${field.toUpperCase()}`, `The seed has no ${field.replace(/_/g, ' ')}.`, `seed.${field}`);
  }
  if (!LANES.includes(seed.lane)) {
    add('LANE_MISSING', 'Assign the seed a lane.', 'seed.lane');
  }

  // 2 · The formula. A missing factor is a zero, not a deduction.
  const formula = evaluateFormula(seed);
  for (const p of formula.problems) add(p.code, p.detail, 'seed.formula');
  const bio = isBiographySummary(seed);
  if (bio.biography_summary) add('BIOGRAPHY_SUMMARY', bio.reason, 'seed.formula');

  // 3 · Claims on the evidence ladder
  const claims = seed.claims || [];
  if (claims.length === 0) add('CLAIMS_MISSING', 'A seed with no classified claims cannot be produced.', 'seed.claims');
  for (const claim of claims) {
    const result = validateClaim(claim);
    for (const p of result.problems) add(p.code, `${claim.ref || '(unref)'}: ${p.detail}`, `seed.claims[${claim.ref || '?'}]`);
  }
  const profile = tierProfile(claims);
  if (profile.UNCLASSIFIED > 0) {
    add('CLAIMS_UNCLASSIFIED', `${profile.UNCLASSIFIED} claim(s) carry no tier.`, 'seed.claims');
  }
  if (profile.DOCUMENTED === 0 && claims.length > 0) {
    add('NO_DOCUMENTED_SPINE', 'Nothing on this seed is DOCUMENTED. There is no spine to build on.', 'seed.claims');
  }

  // 4 · Quotations
  for (const quote of seed.quotes || []) {
    const result = classifyQuote(quote);
    for (const p of result.problems) add(p.code, `${quote.ref || '(unref)'}: ${p.detail}`, `seed.quotes[${quote.ref || '?'}]`);
  }

  // 5 · The correction the retelling needs
  if (typeof seed.popular_retelling_error === 'string' && seed.popular_retelling_error.trim() &&
      !(seed.claims || []).some(c => c.corrects_retelling)) {
    add('RETELLING_CORRECTION_UNSOURCED',
        'The seed says the popular retelling is wrong but no claim carries the correction.',
        'seed.claims[*].corrects_retelling');
  }

  // 6 · Rights and provenance
  const evidence = evaluateEvidenceList(seed.visual_evidence || []);
  for (const item of evidence.blocked) {
    for (const p of item.problems) add(p.code, `${item.ref}: ${p.detail}`, 'seed.visual_evidence');
  }

  // 7 · The output ladder
  for (const key of LADDER_ORDER) {
    const result = validateFormat(key, (seed.formats || {})[key], claims);
    for (const p of result.problems) add(p.code, p.detail, `seed.formats.${key}`);
  }

  // 8 · The children's rung carries the strictest rule in the factory
  const childDraft = (seed.formats || {}).CHILDREN;
  if (childDraft && Array.isArray(childDraft.claim_refs)) {
    const byRef = new Map(claims.map(c => [c.ref, c]));
    const unsafe = childDraft.claim_refs.filter(r => {
      const tier = byRef.get(r)?.tier;
      return tier && tier !== 'DOCUMENTED';
    });
    if (unsafe.length > 0) {
      add('CHILDREN_NON_DOCUMENTED',
          `The children's version rests on non-documented claims: ${unsafe.join(', ')}.`,
          'seed.formats.CHILDREN');
    }
  }

  const gate_state = blockers.length === 0 ? 'PASSED' : 'BLOCKED';
  return {
    gate_state,
    blockers,
    tier_profile: profile,
    formula_product: formula.product,
    evidence_ready: `${evidence.production_ready}/${evidence.total}`
  };
}

/**
 * A candidate is a moment that has earned a place in the queue but has not been
 * built out. It is held to a much shorter bar, on purpose: the queue should be
 * cheap to add to and expensive to promote out of.
 */
export function validateCandidate(candidate) {
  const problems = [];
  const need = ['moment', 'date_context', 'lane', 'seed_title', 'hidden_mechanism', 'opening_question', 'why_it_carries', 'evidence_status'];
  for (const f of need) {
    if (!candidate?.[f] || (typeof candidate[f] === 'string' && !candidate[f].trim())) {
      problems.push({ code: `CANDIDATE_${f.toUpperCase()}_MISSING`, detail: `Candidate has no ${f.replace(/_/g, ' ')}.` });
    }
  }
  if (candidate?.lane && !LANES.includes(candidate.lane)) {
    problems.push({ code: 'CANDIDATE_LANE_INVALID', detail: `${candidate.lane} is not a lane.` });
  }
  for (const key of Object.keys(candidate?.evidence_status || {})) {
    if (!TIERS.includes(key)) {
      problems.push({ code: 'CANDIDATE_TIER_INVALID', detail: `${key} is not a tier.` });
    }
  }
  if (candidate?.opening_question && !String(candidate.opening_question).includes('?')) {
    problems.push({ code: 'CANDIDATE_QUESTION_NOT_A_QUESTION', detail: 'The opening question must be a question.' });
  }
  return { ok: problems.length === 0, problems };
}

/**
 * Corrections are append-only and public. A history product that quietly edits
 * itself is a history product nobody can trust twice.
 */
export function recordCorrection(seed, correction) {
  const problems = [];
  for (const f of ['what_was_wrong', 'what_is_now_said', 'source', 'dated']) {
    if (!correction?.[f]) problems.push({ code: `CORRECTION_${f.toUpperCase()}_MISSING`, detail: `A correction must record ${f.replace(/_/g, ' ')}.` });
  }
  if (problems.length > 0) return { ok: false, problems, seed };
  const log = Array.isArray(seed.corrections) ? seed.corrections : [];
  return {
    ok: true,
    problems: [],
    seed: { ...seed, state: 'CORRECTED', corrections: [...log, { ...correction }] }
  };
}

export { FORMATS, LADDER_ORDER };
