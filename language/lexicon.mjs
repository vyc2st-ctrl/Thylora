// EDEREARIAH LEXICON · RECOVERY BY ATTESTATION
//
// Work code: THY-WORK-DAILY-LANGUAGE-584
//
// RULE HELD BY THIS FILE: no fabricated words.
//
// An entry may exist here only if the exact token appears in committed source
// that this session read, and the entry records where. Nothing was inferred,
// reconstructed, back-formed, regularised or filled in. A plausible word is not
// an attested word, and this module has no mechanism for adding one.
//
// WHAT WAS RECOVERED, AND WHAT WAS NOT.
// The approved lexicon named in the instruction was NOT recovered. It is not in
// vyc2st-ctrl/Thylora at HEAD, not in any of that repository's 51 commits, and
// not in vyc2st-ctrl/thylora-executive-dashboard at a634249. The backend that
// would hold it — thylora-dash (jvsdxhrfhtlgaknhjxlz) — refused CONNECT with 403
// at the egress proxy on 2026-09-22T04:07:20Z, so it could not be read.
//
// One correction to carry forward: the instruction spells the world "EdereAirah".
// Every occurrence in committed source spells it "EdereAriah" — r before i in the
// second element. 14 occurrences across 9 files, zero occurrences of the other
// spelling. This file uses the attested spelling and records the variant so the
// discrepancy is visible rather than silently normalised.
//
// What IS recovered below is a real corpus: the attested THYLORA/EdereAriah name
// set, every token carried by file and line. It is a name set, not a language.
// No common noun, no verb, no pronoun, no numeral, no grammatical form and no
// phonology is attested anywhere this session could read. Lesson 001 is built on
// this corpus alone, and says plainly what it cannot yet teach.

export const ATTESTED_SPELLING = 'EdereAriah';
export const INSTRUCTION_VARIANT = 'EdereAirah';

export const SPELLING_NOTE = Object.freeze({
  attested: ATTESTED_SPELLING,
  variant_in_instruction: INSTRUCTION_VARIANT,
  attested_occurrences: 14,
  variant_occurrences_in_source: 0,
  files: 9,
  disposition: 'Attested spelling used. Variant recorded, not adopted. Chairman decision D4 settles which is canon.',
});

/**
 * CERTAINTY levels. These describe how much this session can honestly say about
 * an entry, and they are deliberately conservative.
 *
 *   ATTESTED_MEANING  the token appears AND committed source states what it means
 *   ATTESTED_TOKEN    the token appears, but no source states it is a word of the
 *                     EdereAriah language rather than a system identifier
 */
export const CERTAINTY = Object.freeze({
  ATTESTED_MEANING: 'ATTESTED_MEANING',
  ATTESTED_TOKEN: 'ATTESTED_TOKEN',
});

/**
 * Part of speech is recorded only where committed source settles it. Everything
 * else is UNKNOWN. There is no inferred part of speech in this file.
 */
export const LEXICON = Object.freeze([
  {
    token: 'EdereAriah',
    gloss: 'The world. A world distinct from Earth, whose inhabitants and channels are classified WORLD_SIMULATED.',
    part_of_speech: 'proper noun · place',
    certainty: CERTAINTY.ATTESTED_MEANING,
    attestations: [
      'rae-link/index.html:45',
      'rae-link/index.html:73',
      'rae-link/index.html:255',
      'rae-link/index.html:115',
      'db/rae-link/0001_identity_channels.sql:17',
      'docs/RAE-LINK-ARCHITECTURE.md:71',
      'docs/RAE-LINK-RIGHTS-PRIVACY.md:104',
      'public-site/index.html:33',
      'public-site/index.html:40',
      'app/sports-betting.html:7',
      'app/sports-betting.html:13',
      'tests/rights.test.mjs:50',
    ],
  },
  {
    token: 'EDEREARIAH_INHABITANT',
    gloss: 'One who lives in EdereAriah. Carries world status WORLD_SIMULATED and a mandatory disclosure of at least 12 characters; may never be presented as an Earth person.',
    part_of_speech: 'proper noun · class of person',
    certainty: CERTAINTY.ATTESTED_MEANING,
    attestations: [
      'rae-link/lib/rights.js:22',
      'db/rae-link/0001_identity_channels.sql:24',
      'db/rae-link/0001_identity_channels.sql:82',
      'tests/rights.test.mjs:43',
      'tests/rights.test.mjs:49',
    ],
  },
  {
    token: 'R',
    gloss: 'The currency of EdereAriah. Named in source as "EdereAriah R-currency" and "EdereAriah R currency". Earth real money is hard-blocked against it in the backend.',
    part_of_speech: 'proper noun · currency',
    certainty: CERTAINTY.ATTESTED_MEANING,
    attestations: ['app/sports-betting.html:7', 'app/sports-betting.html:13'],
  },
  {
    token: 'WORLD_CHANNEL',
    gloss: 'A channel of EdereAriah rather than of an Earth person. Subject to the same world-truth constraint as an inhabitant.',
    part_of_speech: 'proper noun · class of channel',
    certainty: CERTAINTY.ATTESTED_MEANING,
    attestations: ['db/rae-link/0001_identity_channels.sql:82', 'rae-link/index.html:73'],
  },
  {
    token: 'WORLD_SIMULATED',
    gloss: 'World status of everything belonging to EdereAriah. Its opposite is EARTH_REAL. The pair is enforced by database constraint, not by convention.',
    part_of_speech: 'proper noun · status',
    certainty: CERTAINTY.ATTESTED_MEANING,
    attestations: ['rae-link/lib/rights.js:22', 'docs/RAE-LINK-ARCHITECTURE.md:81'],
  },
  {
    token: 'EARTH_REAL',
    gloss: 'World status of everything belonging to Earth. Real people, real places, real money.',
    part_of_speech: 'proper noun · status',
    certainty: CERTAINTY.ATTESTED_MEANING,
    attestations: ['rae-link/lib/rights.js:22', 'tests/rights.test.mjs:49'],
  },
  {
    token: 'WORLD_PRODUCTION',
    gloss: 'A production basis available to world channels and refused to Earth channels. An Earth channel claiming it is blocked as WORLD_BASIS_ON_EARTH_CHANNEL.',
    part_of_speech: 'proper noun · production basis',
    certainty: CERTAINTY.ATTESTED_MEANING,
    attestations: ['rae-link/index.html:115', 'workrooms/WR-RAELINK-001.md'],
  },
  {
    token: 'THEHANDLUH',
    gloss: 'A named place or environment of the world: an approved living-art castle environment with cart and workers. Whether the name is EdereAriah-language or an internal designation is not settled by any source read.',
    part_of_speech: 'proper noun · place or environment',
    certainty: CERTAINTY.ATTESTED_TOKEN,
    attestations: [
      'thylora-executive-dashboard@a634249 app/build8-visual-floor.js:39',
      'thylora-executive-dashboard@a634249 app/thylora-forward.js:18',
      'thylora-executive-dashboard@a634249 app/index-v8.html:17',
    ],
  },
  {
    token: 'ERSATZREALITY',
    gloss: 'Named in source as the Business Factory room family. The only expansion in reachable source containing the letters E-R-C in sequence; whether it is what "ERC" abbreviates is NOT settled.',
    part_of_speech: 'proper noun · UNKNOWN category',
    certainty: CERTAINTY.ATTESTED_TOKEN,
    attestations: ['thylora-executive-dashboard@a634249 app/index-v8.html:17'],
  },
  {
    token: 'VLEGH',
    gloss: 'A registered lane with its own registry (vlegh_registry). No source read states what it names. Recorded so the token is not lost; its meaning is UNKNOWN.',
    part_of_speech: 'UNKNOWN',
    certainty: CERTAINTY.ATTESTED_TOKEN,
    attestations: ['thylora-executive-dashboard@a634249 db/0001_control_surface.sql (lane VLEGH)'],
  },
  {
    token: 'QYRIS',
    gloss: 'The five-field inspection: Question, Yield, Reason, Inspect, Safeguard. A THYLORA method; no source states it is an EdereAriah word.',
    part_of_speech: 'proper noun · method',
    certainty: CERTAINTY.ATTESTED_MEANING,
    attestations: ['thylora-executive-dashboard@a634249 db/0001_control_surface.sql', 'thylora-executive-dashboard@a634249 docs/CONTROL_SURFACE.md'],
  },
  {
    token: 'DASHUL',
    gloss: 'Names the router (DASHUL Router, thylora_router_jobs). No source states what DASHUL itself means.',
    part_of_speech: 'UNKNOWN',
    certainty: CERTAINTY.ATTESTED_TOKEN,
    attestations: ['thylora-executive-dashboard@a634249 db/0001_control_surface.sql (lane AGENT_JOBS)'],
  },
]);

/**
 * What this corpus does NOT contain. Named explicitly so a later session cannot
 * mistake a name set for a language, and cannot quietly fill these in.
 */
export const NOT_RECOVERED = Object.freeze([
  { category: 'common nouns', note: 'No word for any everyday thing is attested. Zero entries.' },
  { category: 'verbs', note: 'No verb is attested. Zero entries.' },
  { category: 'pronouns', note: 'No pronoun is attested. Zero entries.' },
  { category: 'numerals', note: 'No numeral is attested. Zero entries.' },
  { category: 'greetings', note: 'No greeting or formula of address is attested. Zero entries.' },
  { category: 'grammar', note: 'No word order, inflection, agreement or particle is attested.' },
  { category: 'phonology', note: 'No pronunciation guidance is attested. Spellings are orthographic only; how any of these names sound is UNKNOWN.' },
]);

/**
 * Refuse any entry that cannot name where it came from. This is the mechanism
 * that keeps the no-fabrication rule enforced rather than merely stated: a word
 * without an attestation cannot enter the lexicon through this function.
 */
export function admitEntry(entry) {
  if (!entry || typeof entry !== 'object') {
    return { admitted: false, reason: 'NOT_AN_ENTRY' };
  }
  if (!entry.token || String(entry.token).trim() === '') {
    return { admitted: false, reason: 'NO_TOKEN' };
  }
  if (!Array.isArray(entry.attestations) || entry.attestations.length === 0) {
    return {
      admitted: false,
      reason: 'NO_ATTESTATION',
      detail: `"${entry.token}" cannot be admitted: no committed source is named for it. A word without an attestation is a fabricated word.`,
    };
  }
  if (!Object.values(CERTAINTY).includes(entry.certainty)) {
    return { admitted: false, reason: 'NO_CERTAINTY_LEVEL' };
  }
  return { admitted: true, reason: null };
}

/**
 * Look a token up. Returns null rather than a guess.
 */
export function lookup(token) {
  const needle = String(token ?? '').trim().toLowerCase();
  return LEXICON.find((e) => e.token.toLowerCase() === needle) ?? null;
}

export function corpusReport() {
  return {
    entries: LEXICON.length,
    attested_meaning: LEXICON.filter((e) => e.certainty === CERTAINTY.ATTESTED_MEANING).length,
    attested_token_only: LEXICON.filter((e) => e.certainty === CERTAINTY.ATTESTED_TOKEN).length,
    fabricated: 0,
    common_vocabulary: 0,
    grammar_rules: 0,
    spelling: SPELLING_NOTE,
    not_recovered: NOT_RECOVERED,
    approved_lexicon_recovered: false,
    approved_lexicon_blocker: 'Backend thylora-dash (jvsdxhrfhtlgaknhjxlz) refused CONNECT with 403 at the egress proxy, 2026-09-22T04:07:20Z. The approved lexicon was not in either reachable repository or in any of the 51 commits swept.',
  };
}
