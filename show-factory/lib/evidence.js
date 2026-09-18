// HISTORY → SHOW FACTORY · the evidence ladder
// Workroom: WR-SHOWFACTORY-001
//
// The factory turns documented history into shows. The single thing that makes
// that safe is refusing to let four different kinds of knowing wear the same
// clothes. Every claim carries a tier, and the tier decides what the claim is
// allowed to do on screen.
//
// DOCUMENTED  a primary or archival source says it, and we can name the source
// CONTESTED   sources conflict, or qualified people dispute it, and we say so
// INFERENCE   we reason to it from documented facts; it is our reasoning, labelled
// UNKNOWN     nobody knows; we say that out loud rather than filling the hole

export const TIERS = Object.freeze(['DOCUMENTED', 'CONTESTED', 'INFERENCE', 'UNKNOWN']);

// What each tier may do in a finished piece.
export const TIER_RULES = Object.freeze({
  DOCUMENTED: { assertable: true,  needs_source: true,  needs_dispute_note: false, children_safe: true  },
  CONTESTED:  { assertable: false, needs_source: true,  needs_dispute_note: true,  children_safe: false },
  INFERENCE:  { assertable: false, needs_source: true,  needs_dispute_note: false, children_safe: false },
  UNKNOWN:    { assertable: false, needs_source: false, needs_dispute_note: false, children_safe: false }
});

// Source classes, strongest first. A quotation is only "documented wording"
// when it reaches ARCHIVAL or better.
export const SOURCE_CLASSES = Object.freeze([
  'PRIMARY',        // the document itself: the letter, the log, the transcript
  'ARCHIVAL',       // a named archive or edition reproducing the primary document
  'SCHOLARLY',      // peer-reviewed work citing primary material
  'INSTITUTIONAL',  // museum, agency or university statement
  'JOURNALISTIC',   // reported, contemporaneous or later
  'POPULAR',        // trade books, encyclopaedias, quotation sites
  'UNSOURCED'       // repeated everywhere, traced nowhere
]);

const STRENGTH = Object.fromEntries(SOURCE_CLASSES.map((c, i) => [c, SOURCE_CLASSES.length - i]));

export const QUOTE_STATES = Object.freeze([
  'DOCUMENTED_WORDING',   // exact words, primary/archival source, verified
  'REPORTED_WORDING',     // someone else reports the words; no primary text
  'ALTERED_IN_CIRCULATION', // real source exists; the popular version is not what it says
  'ATTRIBUTED_UNSOURCED', // universally attributed, no source ever found
  'MISATTRIBUTED'         // traced to a different author
]);

/**
 * Rank a set of sources and return the strongest class present.
 */
export function strongestSource(sources = []) {
  let best = 'UNSOURCED';
  for (const s of sources) {
    const cls = s?.source_class;
    if (!SOURCE_CLASSES.includes(cls)) continue;
    if (STRENGTH[cls] > STRENGTH[best]) best = cls;
  }
  return best;
}

/**
 * Check one claim against the ladder. Returns every problem at once, each with
 * a code and a plain-language route, so a researcher fixes the whole record in
 * one pass instead of one round trip per problem.
 */
export function validateClaim(claim) {
  const problems = [];
  const tier = claim?.tier;

  if (!TIERS.includes(tier)) {
    problems.push({ code: 'TIER_MISSING', detail: 'Classify this claim: DOCUMENTED, CONTESTED, INFERENCE or UNKNOWN.' });
    return { ok: false, problems };
  }

  const rules = TIER_RULES[tier];
  const sources = claim.sources || [];

  if (rules.needs_source && sources.length === 0) {
    problems.push({ code: 'SOURCE_MISSING', detail: `A ${tier} claim must name at least one source.` });
  }
  for (const s of sources) {
    if (!SOURCE_CLASSES.includes(s?.source_class)) {
      problems.push({ code: 'SOURCE_CLASS_INVALID', detail: `Unknown source class: ${s?.source_class}.` });
    }
    if (!s?.citation) {
      problems.push({ code: 'CITATION_MISSING', detail: 'Every source needs a citation a reader can follow.' });
    }
  }
  if (rules.needs_dispute_note && !claim.dispute) {
    problems.push({ code: 'DISPUTE_NOTE_MISSING', detail: 'A CONTESTED claim must say who disputes it and why.' });
  }
  if (tier === 'DOCUMENTED' && STRENGTH[strongestSource(sources)] < STRENGTH.SCHOLARLY) {
    problems.push({
      code: 'TIER_TOO_STRONG',
      detail: 'DOCUMENTED needs a primary, archival or scholarly source. Popular repetition is not documentation.'
    });
  }
  if (tier === 'UNKNOWN' && !claim.statement) {
    problems.push({ code: 'UNKNOWN_UNSTATED', detail: 'Name the thing that is unknown. A silent gap is not a stated gap.' });
  }

  return { ok: problems.length === 0, problems };
}

/**
 * Decide the state of a quotation. This is the check that the Curie seed exists
 * to teach: a line everyone knows, that no primary source carries.
 */
export function classifyQuote(quote) {
  const problems = [];
  const sources = quote?.sources || [];
  const best = strongestSource(sources);
  const state = quote?.state;

  if (!QUOTE_STATES.includes(state)) {
    problems.push({ code: 'QUOTE_STATE_MISSING', detail: 'Classify the quotation before using it.' });
    return { ok: false, state: null, best_source: best, problems };
  }
  if (state === 'DOCUMENTED_WORDING' && STRENGTH[best] < STRENGTH.ARCHIVAL) {
    problems.push({
      code: 'QUOTE_NOT_DOCUMENTED',
      detail: 'Documented wording needs the document. Downgrade to REPORTED_WORDING or ATTRIBUTED_UNSOURCED.'
    });
  }
  if (state === 'ALTERED_IN_CIRCULATION' && !quote?.as_documented) {
    problems.push({ code: 'ORIGINAL_WORDING_MISSING', detail: 'Record what the source actually says beside the popular version.' });
  }
  if (state === 'MISATTRIBUTED' && !quote?.actual_author) {
    problems.push({ code: 'ACTUAL_AUTHOR_MISSING', detail: 'Name who actually wrote it.' });
  }
  if ((state === 'ATTRIBUTED_UNSOURCED' || state === 'MISATTRIBUTED') && quote?.used_as_title) {
    problems.push({
      code: 'UNSOURCED_QUOTE_AS_TITLE',
      detail: 'An unsourced or misattributed line may be the subject of an episode, never its factual spine.'
    });
  }
  return { ok: problems.length === 0, state, best_source: best, problems };
}

/**
 * Tally a moment's claims by tier. Production reads this before anything is cut.
 */
export function tierProfile(claims = []) {
  const profile = { DOCUMENTED: 0, CONTESTED: 0, INFERENCE: 0, UNKNOWN: 0, UNCLASSIFIED: 0 };
  for (const c of claims) {
    if (TIERS.includes(c?.tier)) profile[c.tier] += 1;
    else profile.UNCLASSIFIED += 1;
  }
  return profile;
}
