// HISTORY → SHOW FACTORY · the output ladder
// Workroom: WR-SHOWFACTORY-001
//
// One seed, nine outputs. The ladder exists so that the short is not a trailer
// for the episode and the children's version is not the episode with words
// removed. Each rung has its own job, its own budget, and its own rule about
// what it is allowed to assert.

export const FORMATS = Object.freeze({
  SHORT_60: {
    label: '60-second short',
    job: 'Land one documented surprise and one question. Nothing else.',
    target_seconds: 60,
    max_claims: 3,
    min_tier: 'DOCUMENTED',
    allows_contested: false,
    allows_inference: false,
    requires_gap_statement: false,
    requires_source_on_screen: true
  },
  VERSION_3: {
    label: '3-minute version',
    job: 'Moment, mechanism, decision. The gap gets one sentence.',
    target_seconds: 180,
    max_claims: 9,
    min_tier: 'DOCUMENTED',
    allows_contested: true,
    allows_inference: false,
    requires_gap_statement: true,
    requires_source_on_screen: true
  },
  EPISODE_20: {
    label: '20-minute episode',
    job: 'The full five factors, the dispute named, the inference labelled as ours.',
    target_seconds: 1200,
    max_claims: 60,
    min_tier: 'DOCUMENTED',
    allows_contested: true,
    allows_inference: true,
    requires_gap_statement: true,
    requires_source_on_screen: true
  },
  CHILDREN: {
    label: "children's version",
    job: 'The real question, at the real size, with nothing invented to smooth it.',
    target_seconds: 300,
    max_claims: 6,
    min_tier: 'DOCUMENTED',
    allows_contested: false,
    allows_inference: false,
    requires_gap_statement: true,     // "nobody knows" is a children's sentence too
    requires_source_on_screen: false  // sources go on the family page instead
  },
  QUESTION_CARDS: {
    label: 'question cards',
    job: 'Questions that survive being asked by someone who has not seen the episode.',
    min_cards: 5,
    allows_contested: true,
    allows_inference: true,
    requires_gap_statement: false,
    requires_source_on_screen: false
  },
  DISCUSSION_PAGE: {
    label: 'teacher / family discussion page',
    job: 'One page that lets an adult run the conversation without having to be an expert.',
    allows_contested: true,
    allows_inference: true,
    requires_gap_statement: true,
    requires_source_on_screen: true
  },
  STORE_PRODUCT: {
    label: 'store product',
    job: 'An object that carries the question home. Never a portrait sold as a relic.',
    allows_contested: false,
    allows_inference: false,
    requires_gap_statement: false,
    requires_source_on_screen: false,
    requires_rights_clearance: true
  }
});

export const FORMAT_KEYS = Object.freeze(Object.keys(FORMATS));

// The ladder in production order. Each rung is cut from the one above it, so a
// correction upstream propagates down instead of stranding a rung.
export const LADDER_ORDER = Object.freeze(['EPISODE_20', 'VERSION_3', 'SHORT_60', 'CHILDREN', 'QUESTION_CARDS', 'DISCUSSION_PAGE', 'STORE_PRODUCT']);

/**
 * Check one format's draft against its rung rules.
 */
export function validateFormat(key, draft, claims = []) {
  const spec = FORMATS[key];
  const problems = [];
  if (!spec) return { ok: false, problems: [{ code: 'FORMAT_UNKNOWN', detail: `${key} is not a rung of the ladder.` }] };

  if (!draft || (typeof draft === 'string' && !draft.trim()) || (typeof draft === 'object' && Object.keys(draft).length === 0)) {
    return { ok: false, problems: [{ code: `${key}_MISSING`, detail: `The ${spec.label} has not been written.` }] };
  }

  const used = draft.claim_refs || [];
  if (spec.max_claims && used.length > spec.max_claims) {
    problems.push({ code: `${key}_OVERPACKED`, detail: `${used.length} claims in a ${spec.label}; the rung holds ${spec.max_claims}.` });
  }
  if (spec.min_cards && (draft.cards || []).length < spec.min_cards) {
    problems.push({ code: `${key}_TOO_FEW_CARDS`, detail: `A question-card set needs at least ${spec.min_cards} cards.` });
  }

  const byRef = new Map(claims.map(c => [c.ref, c]));
  for (const ref of used) {
    const claim = byRef.get(ref);
    if (!claim) {
      problems.push({ code: `${key}_CLAIM_UNKNOWN`, detail: `${ref} is not a claim on this seed.` });
      continue;
    }
    if (claim.tier === 'CONTESTED' && !spec.allows_contested) {
      problems.push({ code: `${key}_CONTESTED_NOT_ALLOWED`, detail: `${ref} is CONTESTED and cannot carry a ${spec.label}.` });
    }
    if (claim.tier === 'INFERENCE' && !spec.allows_inference) {
      problems.push({ code: `${key}_INFERENCE_NOT_ALLOWED`, detail: `${ref} is INFERENCE and cannot carry a ${spec.label}.` });
    }
    if (claim.tier === 'UNKNOWN' && !draft.states_the_gap) {
      problems.push({ code: `${key}_UNKNOWN_UNMARKED`, detail: `${ref} is UNKNOWN; the piece must say so rather than use it.` });
    }
  }

  if (spec.requires_gap_statement && !draft.states_the_gap) {
    problems.push({ code: `${key}_GAP_UNSTATED`, detail: `The ${spec.label} must name what the record does not contain.` });
  }
  if (spec.requires_source_on_screen && !draft.sources_on_screen) {
    problems.push({ code: `${key}_SOURCES_NOT_SHOWN`, detail: `The ${spec.label} must show its sources on screen.` });
  }
  if (spec.requires_rights_clearance && !draft.rights_cleared) {
    problems.push({ code: `${key}_RIGHTS_NOT_CLEARED`, detail: `A store product cannot ship on unresolved rights.` });
  }

  return { ok: problems.length === 0, problems };
}
