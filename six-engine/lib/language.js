// SIX UNDERSTANDING ENGINE · LANGUAGE BLOCKER RESOLVER
// Workroom: WR-SIXENGINE-001
//
// Rule held by this module: a word is resolved for the sentence it is standing
// in, not for the language in general. No dictionary dumps. Every resolved
// blocker returns the same seven fields:
//
//   WORD · CONTEXT · MEANING HERE · SIMPLER SUBSTITUTE · EXAMPLE ·
//   NON-EXAMPLE · LEARNER RESTATEMENT
//
// The seventh is not decoration. Until the learner restates it, the engine has
// no evidence the blocker cleared, and it records the blocker as OPEN. An
// engine that assumes comprehension is the failure this module exists to stop.

import { LEXICON, BAND_HINTS, lookup } from './lexicon.js';

export const BLOCKER_STATES = Object.freeze(['OPEN', 'AMBIGUOUS', 'RESTATED', 'CLEARED', 'UNKNOWN_WORD']);

const WORD_RE = /[A-Za-z][A-Za-z'-]*/g;
const MULTIWORD = ['more than', 'less than', 'fewer than', 'greater than'];

// Words whose sense never blocks and never needs a card.
const TRANSPARENT = new Set(['the', 'a', 'an', 'and', 'is', 'are', 'was', 'were', 'it', 'he', 'she',
  'they', 'you', 'we', 'to', 'in', 'on', 'at', 'that', 'this', 'has', 'have', 'had', 'his', 'her',
  'their', 'my', 'many', 'much', 'how', 'what', 'who', 'does', 'do', 'did', 'be', 'by', 'for',
  'from', 'with', 'there', 'then', 'them', 'him', 'its', 'as', 'or', 'but']);

function sentencesOf(text) {
  return String(text).split(/(?<=[.?!])\s+/).map(s => s.trim()).filter(Boolean);
}

function tokensOf(text) {
  return (String(text).match(WORD_RE) ?? []).map(w => w.toLowerCase());
}

/** Which lemmas — single and multi-word — actually appear in this text. */
export function lemmasPresent(text) {
  const lower = String(text).toLowerCase();
  const found = new Set();
  for (const phrase of MULTIWORD) if (lower.includes(phrase)) found.add(phrase);
  for (const w of tokensOf(text)) if (LEXICON[w]) found.add(w);
  return [...found];
}

function bandOf(word) {
  const senses = lookup(word);
  if (senses) return Math.min(...senses.map(s => s.band));
  for (const [band, patterns] of Object.entries(BAND_HINTS)) {
    if (patterns.some(p => p.test(word))) return Number(band);
  }
  return word.length >= 11 ? 4 : 2;
}

/**
 * Select the sense a word is carrying in this context.
 *
 * Returns the chosen sense plus every runner-up, and flags ambiguity when the
 * context does not separate them. The engine never silently picks a winner:
 * an ambiguous word becomes a question to the learner, not a guess (FM-01).
 */
export function resolveSense(lemma, context, { domain = null } = {}) {
  const senses = lookup(lemma);
  if (!senses) return { lemma, found: false, ambiguous: false, chosen: null, candidates: [] };

  const scored = senses.map(sense => {
    let score = 0;
    const hits = [];
    for (const cue of sense.cues) {
      if (cue.test(context)) { score += 3; hits.push(String(cue)); }
    }
    if (domain && sense.domains.includes(domain)) score += 2;
    if (sense.domains.includes('general')) score += 1;
    return { sense, score, cue_hits: hits };
  }).sort((a, b) => b.score - a.score);

  const top = scored[0];
  const runnerUp = scored[1] ?? null;
  const separated = !runnerUp || (top.score - runnerUp.score) >= 2;
  const anyCue = top.score > 0;
  const ambiguous = senses.length > 1 && (!separated || !anyCue);

  return {
    lemma,
    found: true,
    ambiguous,
    chosen: ambiguous ? null : top.sense,
    leading: top.sense,
    candidates: scored.map(x => ({ id: x.sense.id, job: x.sense.job, score: x.score, meaning: x.sense.meaning })),
    disambiguation_question: ambiguous
      ? `In "${trim(context)}", is "${lemma}" doing the job of ${scored.slice(0, 2).map(x => `"${x.sense.meaning}"`).join(' or ')}?`
      : null
  };
}

function trim(text, max = 90) {
  const t = String(text).replace(/\s+/g, ' ').trim();
  return t.length <= max ? t : `${t.slice(0, max - 1)}…`;
}

/**
 * Is this word material — worth spending the learner's attention on?
 *
 * Material means: getting it wrong changes the answer, or it costs effort this
 * learner has not yet banked. Everything else is left alone. Explaining every
 * word is itself a language load, and it buries the words that matter.
 */
export function isMaterial(lemma, context, learner) {
  const senses = lookup(lemma);
  const known = new Set((learner?.known_lemmas ?? []).map(w => String(w).toLowerCase()));
  if (known.has(lemma)) return { material: false, reason: 'ALREADY_ESTABLISHED' };
  if (TRANSPARENT.has(lemma) && !senses) return { material: false, reason: 'TRANSPARENT' };

  if (senses) {
    if (senses.length > 1) return { material: true, reason: 'SENSE_SWITCH_CHANGES_ANSWER' };
    if (senses[0].invariant) return { material: true, reason: 'CARRIES_LOGICAL_WEIGHT' };
  }
  const band = bandOf(lemma);
  const learnerBand = learner?.language_band ?? 2;
  if (band > learnerBand) return { material: true, reason: 'ABOVE_LANGUAGE_BAND' };
  return { material: false, reason: 'WITHIN_BAND' };
}

/** Guard: a resolution card must be contextual, not a dictionary entry (FM-01). */
export function assertNotDictionaryDump(card) {
  const problems = [];
  if (!card.meaning_here) problems.push('no MEANING HERE');
  if (String(card.meaning_here).length > 180) problems.push('MEANING HERE reads as a dictionary entry, not a job in this sentence');
  if (/^\s*(a word |the word |noun|verb|adjective|adverb)\b/i.test(card.meaning_here ?? '')) {
    problems.push('MEANING HERE opens as a dictionary gloss');
  }
  if (!card.context) problems.push('no CONTEXT — a meaning with no sentence attached is a dictionary entry');
  if (!card.example) problems.push('no EXAMPLE');
  if (!card.non_example) problems.push('no NON-EXAMPLE — the learner is not shown the sense they would otherwise reach for');
  if (!card.simpler_substitute) problems.push('no SIMPLER SUBSTITUTE');
  if (!card.learner_restatement_prompt) problems.push('no LEARNER RESTATEMENT prompt');
  return { valid: problems.length === 0, problems };
}

/**
 * Resolve every material word in a text.
 *
 * Returns resolution cards, open ambiguities and unknown words. Nothing here
 * claims the learner understood: cards leave in state OPEN until a restatement
 * is recorded through `recordRestatement`.
 */
export function resolveBlockers(text, { learner = {}, domain = null, max_cards = 8 } = {}) {
  const sentences = sentencesOf(text);
  const cards = [];
  const ambiguities = [];
  const unknown_words = [];
  const seen = new Set();

  const contextFor = (lemma) => sentences.find(s => s.toLowerCase().includes(lemma)) ?? String(text);

  for (const lemma of lemmasPresent(text)) {
    if (seen.has(lemma)) continue;
    seen.add(lemma);
    const context = contextFor(lemma);
    const material = isMaterial(lemma, context, learner);
    if (!material.material) continue;

    const resolved = resolveSense(lemma, context, { domain });
    if (resolved.ambiguous) {
      ambiguities.push({
        word: lemma, context: trim(context), state: 'AMBIGUOUS',
        candidates: resolved.candidates,
        question: resolved.disambiguation_question
      });
      continue;
    }
    const sense = resolved.chosen;
    const card = {
      word: lemma,
      context: trim(context),
      meaning_here: sense.meaning,
      simpler_substitute: sense.substitute,
      example: sense.example,
      non_example: sense.non_example,
      learner_restatement_prompt: `Say "${trim(context, 60)}" back in your own words — what is "${lemma}" telling you to do there?`,
      sense_id: sense.id,
      job: sense.job,
      invariant: sense.invariant,
      why_material: material.reason,
      state: 'OPEN'
    };
    const guard = assertNotDictionaryDump(card);
    if (!guard.valid) throw new Error(`Malformed resolution card for "${lemma}": ${guard.problems.join('; ')}`);
    cards.push(card);
  }

  // Words above band that the lexicon does not carry are reported as gaps
  // rather than invented. The engine does not make up a meaning.
  const learnerBand = learner.language_band ?? 2;
  const known = new Set((learner.known_lemmas ?? []).map(w => String(w).toLowerCase()));
  for (const w of new Set(tokensOf(text))) {
    if (LEXICON[w] || TRANSPARENT.has(w) || known.has(w) || seen.has(w)) continue;
    if (bandOf(w) > learnerBand + 1) unknown_words.push({ word: w, context: trim(contextFor(w)), state: 'UNKNOWN_WORD', band: bandOf(w) });
  }

  const ordered = cards.sort((a, b) => Number(b.invariant) - Number(a.invariant)).slice(0, max_cards);
  return {
    cards: ordered,
    ambiguities,
    unknown_words,
    deferred: Math.max(0, cards.length - ordered.length),
    blocked: ambiguities.length > 0 || unknown_words.length > 0,
    open_count: ordered.length
  };
}

/**
 * Record what the learner said back. Fidelity is measured against the job the
 * word is doing, not against a form of words.
 */
export function recordRestatement(card, restatement, { accepted = null } = {}) {
  const said = String(restatement ?? '').toLowerCase().trim();
  if (!said) return { ...card, state: 'OPEN', restatement: null, fidelity: 0 };

  const substituteHit = said.includes(String(card.simpler_substitute).toLowerCase().split(' ')[0]);
  const meaningTokens = String(card.meaning_here).toLowerCase().match(/[a-z]{4,}/g) ?? [];
  const overlap = meaningTokens.filter(t => said.includes(t)).length / Math.max(1, meaningTokens.length);
  const wrongSense = String(card.non_example).toLowerCase().match(/[a-z]{5,}/g)?.some(t => said.includes(t)) ?? false;

  let fidelity = Math.min(1, overlap * 1.6 + (substituteHit ? 0.35 : 0));
  if (wrongSense) fidelity = Math.min(fidelity, 0.3);
  const pass = accepted === null ? fidelity >= 0.5 : Boolean(accepted);

  return {
    ...card,
    restatement: String(restatement),
    fidelity: Number(fidelity.toFixed(2)),
    reached_for_wrong_sense: wrongSense,
    state: pass ? 'CLEARED' : 'RESTATED'
  };
}

/** Share of material words the learner has actually cleared. */
export function comprehensionCoverage(cards) {
  if (cards.length === 0) return 1;
  return Number((cards.filter(c => c.state === 'CLEARED').length / cards.length).toFixed(2));
}
