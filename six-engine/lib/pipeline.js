// SIX UNDERSTANDING ENGINE · CORE PIPELINE
// Workroom: WR-SIXENGINE-001 · THY-SIX-UNDERSTANDING-ENGINE-001
//
//   QUESTION → MEANING → PREREQUISITES → KNOWLEDGE → EVIDENCE
//            → CONNECTIONS → EXPLAIN → TRANSFER → NEXT QUESTION
//
// The stage list is not fixed for every question: the route decides which
// stages are mandatory for that KIND of question (routing.js). What is fixed is
// the order, the append-only trail, and the gates between stages.
//
// A gate is a place the engine is allowed to stop. Stopping with a named reason
// and a next action is a result. Continuing past a gate to produce a confident
// paragraph is the failure this file exists to prevent.

import { routeQuestion } from './routing.js';
import { resolveBlockers, comprehensionCoverage } from './language.js';
import { separateLoads } from './mathload.js';
import { prerequisiteClosure, explanationReady, SEED_GRAPH } from './prerequisites.js';
import { resolveClaim, understandingReport } from './evidence.js';
import { parityCheck } from './parity.js';
import { detectFailures } from './failures.js';

export const STAGES = Object.freeze([
  'QUESTION', 'MEANING', 'LOAD_SEPARATION', 'PREREQUISITES', 'KNOWLEDGE',
  'EVIDENCE', 'CONNECTIONS', 'EXPLAIN', 'TRANSFER', 'NEXT_QUESTION'
]);

export const RUN_STATES = Object.freeze(['COMPLETE', 'HALTED', 'GATED', 'PARTIAL']);

class Trail {
  constructor() { this.entries = []; }
  append(stage, state, summary, data = null) {
    const entry = Object.freeze({ seq: this.entries.length + 1, stage, state, summary, data });
    this.entries.push(entry);
    return entry;
  }
  get last() { return this.entries[this.entries.length - 1] ?? null; }
  toJSON() { return this.entries; }
}

/**
 * Resolve one question.
 *
 * Everything the engine cannot derive is supplied by the caller — the knowledge
 * positions, the concept graph, the learner's mastery, the candidate wording.
 * The engine's job is to route, gate, separate loads, check parity, weigh
 * evidence and refuse to overclaim. It does not invent facts, and where a
 * caller supplies none it says so rather than filling the space.
 */
export function resolveQuestion(input, ctx = {}) {
  const {
    text,
    learner = { language_band: 2, known_lemmas: [], mastery: {} },
    domain = null,
    force_class = null,
    structure = null,
    attempt = {},
    knowledge = null,
    concept = null,
    graph = SEED_GRAPH,
    simplification = null,
    connections = [],
    transfer = null,
    gate_routed = false
  } = input;

  const trail = new Trail();
  const run = {
    question: text, learner_id: learner.id ?? null, domain,
    started_at_floor: false, gate_routed, stages: [], transfer: null
  };

  // 1 · QUESTION ------------------------------------------------------------
  const route = routeQuestion(text, { learner, domain, force_class });
  run.route = route;
  run.stages = route.stages;
  trail.append('QUESTION', 'OK', `routed as ${route.class}: ${route.label}`, {
    class: route.class, alternates: route.alternates, contract: route.answer_contract
  });

  if (route.gate === 'GUARDIAN' && !gate_routed) {
    trail.append('QUESTION', 'HALT', 'guardian gate: this question carries a real-world consequence for a child', {
      gate: 'GUARDIAN',
      permitted: 'general understanding of the topic, with no instruction to act',
      next_action: 'Route to a named adult on this learner\'s protection list before anything actionable is returned.'
    });
    return finish(run, trail, 'GATED', { answer: null });
  }

  // 2 · MEANING -------------------------------------------------------------
  const language = resolveBlockers(text, { learner, domain });
  run.language = language;
  trail.append('MEANING', language.blocked ? 'HALT' : 'OK',
    `${language.cards.length} material word(s) resolved; ${language.ambiguities.length} ambiguous; ${language.unknown_words.length} unknown`,
    { cards: language.cards, ambiguities: language.ambiguities, unknown_words: language.unknown_words });

  if (language.blocked) {
    // The engine does not guess a sense and carry on. The ambiguity becomes the
    // next thing said to the learner.
    return finish(run, trail, 'HALTED', {
      answer: null,
      halt_reason: 'LANGUAGE_AMBIGUOUS',
      ask_the_learner: [
        ...language.ambiguities.map(a => a.question),
        ...language.unknown_words.map(u => `Is "${u.word}" a word you already know in "${u.context}"?`)
      ]
    });
  }

  // 3 · LOAD SEPARATION (word problems only) --------------------------------
  if (route.stages.includes('LOAD_SEPARATION')) {
    const load = separateLoads({
      source: text, cards: language.cards,
      learner_restatement: attempt.learner_restatement ?? null,
      structure, attempt
    });
    run.load = load;
    trail.append('LOAD_SEPARATION', 'OK',
      `${load.diagnosis.verdict} · L=${fmt(load.diagnosis.L)} M=${fmt(load.diagnosis.M)} S=${fmt(load.diagnosis.S)} · P_solve=${fmt(load.diagnosis.P_solve)}`,
      load.diagnosis);

    if (['LANGUAGE_BLOCKED', 'LANGUAGE_UNMEASURED'].includes(load.diagnosis.verdict)) {
      return finish(run, trail, 'GATED', {
        answer: null,
        halt_reason: load.diagnosis.verdict,
        teaching_target: load.diagnosis.teaching_target,
        next_action: load.diagnosis.next_action,
        controlled_form: load.controlled_form,
        mathematics_deficit_claim: load.diagnosis.mathematics_deficit_claim
      });
    }
  }

  // 4 · PREREQUISITES -------------------------------------------------------
  if (route.stages.includes('PREREQUISITES')) {
    const closure = concept
      ? prerequisiteClosure(graph, concept, learner.mastery ?? {})
      : { found: false, unmet: [], chain: [], cycles: [], truncated: false, floor: null,
          gap: { code: 'NO_CONCEPT_SUPPLIED', detail: 'No concept was named for this question, so no prerequisite chain was walked.' } };
    run.prerequisites = closure;
    const ready = explanationReady(closure);
    run.started_at_floor = !ready.ready && Boolean(ready.start_at);
    const prereqSummary = !concept
      ? 'no concept was named for this question, so no prerequisite chain was walked'
      : !closure.found
        ? closure.gap.detail
        : ready.ready
          ? 'every prerequisite is held'
          : `start at "${ready.start_at}" — ${ready.reason}`;
    trail.append('PREREQUISITES', 'OK', prereqSummary,
      { closure_chain: closure.chain, unmet: closure.unmet, floor: closure.floor, ready });
  }

  // 5 · KNOWLEDGE + 6 · EVIDENCE -------------------------------------------
  let resolution = null;
  if (route.stages.includes('KNOWLEDGE')) {
    if (!knowledge) {
      trail.append('KNOWLEDGE', 'HALT', 'no knowledge positions were supplied to the engine', {
        next_action: 'Supply positions with their evidence, or record the question as UNKNOWN with the gap named. The engine will not write an answer it has no source for.'
      });
      return finish(run, trail, 'HALTED', { answer: null, halt_reason: 'NO_KNOWLEDGE_SUPPLIED' });
    }
    trail.append('KNOWLEDGE', 'OK', `${(knowledge.positions ?? []).length} position(s), ${(knowledge.unknowns ?? []).length} named unknown(s)`, {
      positions: (knowledge.positions ?? []).map(p => ({ id: p.id, standing: p.standing })),
      unknowns: knowledge.unknowns ?? []
    });

    resolution = resolveClaim({
      question: text,
      positions: knowledge.positions ?? [],
      unknowns: knowledge.unknowns ?? [],
      presupposition_failure: route.presupposition
    });
    run.resolution = resolution;

    if (route.stages.includes('EVIDENCE')) {
      const lines = Math.max(0, ...resolution.evidence.map(e => e.independent_lines ?? 0));
      const short = lines < route.min_independent_lines;
      trail.append('EVIDENCE', short ? 'HALT' : 'OK',
        `state ${resolution.state} at confidence ${resolution.confidence} — ${resolution.confidence_cap_reason}`,
        { evidence: resolution.evidence, short_of_requirement: short, required_lines: route.min_independent_lines });
      if (short) {
        run.evidence_short = true;
        resolution.state = resolution.state === 'RESOLVED' ? 'RESOLVED_WITH_CONDITIONS' : resolution.state;
        (resolution.known[0]?.conditions ?? []).push(
          `this route requires ${route.min_independent_lines} independent lines and has ${lines}`);
      }
    }
  }

  // 7 · CONNECTIONS ---------------------------------------------------------
  if (route.stages.includes('CONNECTIONS')) {
    const links = connections.length ? connections : deriveConnections(run);
    run.connections = links;
    trail.append('CONNECTIONS', 'OK', `${links.length} connection(s) to what the learner already holds`, links);
  }

  // 8 · EXPLAIN -------------------------------------------------------------
  if (route.stages.includes('EXPLAIN')) {
    const report = resolution ? understandingReport(resolution) : null;
    let parity = null;
    if (simplification) {
      parity = parityCheck(simplification.source ?? text, simplification.candidate);
      run.parity = parity;
      if (!parity.pass) {
        trail.append('EXPLAIN', 'HALT', `child-facing wording refused — parity ${parity.parity}`, parity);
        return finish(run, trail, 'HALTED', {
          answer: null, halt_reason: 'PARITY_VIOLATION', parity,
          next_action: 'Rewrite keeping every concept invariant. Reduce sentence load only.'
        });
      }
    }
    run.explanation = {
      starts_at: run.started_at_floor ? run.prerequisites.floor.id : (concept ?? 'the question itself'),
      contract: route.answer_contract,
      report,
      child_facing: simplification?.candidate ?? null,
      parity
    };
    trail.append('EXPLAIN', 'OK', `explanation starts at ${run.explanation.starts_at}`, {
      contract: route.answer_contract, report, parity
    });
  }

  // 9 · TRANSFER ------------------------------------------------------------
  if (route.stages.includes('TRANSFER')) {
    const task = transfer ?? deriveTransfer(run);
    run.transfer = task;
    trail.append('TRANSFER', task ? 'OK' : 'HALT',
      task ? `transfer task: ${task.prompt}` : 'no transfer task could be derived',
      task);
  }

  // 10 · NEXT QUESTION ------------------------------------------------------
  const next = deriveNextQuestions(run);
  run.next_questions = next;
  trail.append('NEXT_QUESTION', 'OK', `${next.length} question(s) opened by this answer`, next);

  return finish(run, trail, 'COMPLETE', {
    // A word problem's answer is its load diagnosis. Returning an empty
    // five-section evidence report for one would say "nothing is known here",
    // which is not what the run found.
    answer: run.explanation?.report ?? (run.load ? loadAnswer(run.load) : null),
    child_facing: run.explanation?.child_facing ?? null
  });
}

function fmt(v) { return v === null || v === undefined ? 'UNMEASURED' : String(v); }

/** The answer shape for a word problem: three separated loads and one target. */
function loadAnswer(load) {
  const d = load.diagnosis;
  return {
    VERDICT: d.verdict,
    LANGUAGE_LOAD: d.L === null ? 'UNMEASURED' : d.L,
    MATHEMATICAL_LOAD: d.M === null ? 'UNMEASURED' : d.M,
    SOLVING_PROCEDURE: d.S === null ? 'UNMEASURED' : d.S,
    P_SOLVE: d.P_solve === null ? 'NOT COMPUTABLE' : d.P_solve,
    MATHEMATICS_DEFICIT_CLAIM: d.mathematics_deficit_claim,
    TEACHING_TARGET: d.teaching_target,
    NEXT_ACTION: d.next_action,
    NOTES: d.evidence_notes
  };
}

function finish(run, trail, state, extra) {
  const failures = detectFailures(run);
  const finalState = failures.blocking.length && state === 'COMPLETE' ? 'HALTED' : state;
  return Object.freeze({
    engine: 'THY-SIX-UNDERSTANDING-ENGINE-001',
    question: run.question,
    state: finalState,
    route: run.route,
    trail: trail.toJSON(),
    language: run.language ?? null,
    load: run.load ?? null,
    prerequisites: run.prerequisites ?? null,
    resolution: run.resolution ?? null,
    explanation: run.explanation ?? null,
    transfer: run.transfer ?? null,
    next_questions: run.next_questions ?? [],
    connections: run.connections ?? [],
    failures,
    ...extra
  });
}

/** Connections are only claimed where the learner actually holds the other end. */
function deriveConnections(run) {
  const held = Object.entries(run.learner_mastery ?? {}).filter(([, v]) => ['HELD', 'TRANSFERRED'].includes(v));
  const chain = run.prerequisites?.chain ?? [];
  return chain.filter(c => c.held).map(c => ({
    to: c.id, label: c.label,
    link: `this rests on "${c.label}", which the learner already holds`,
    verified: true
  })).concat(held.length === 0 && chain.length === 0
    ? [{ to: null, label: null, link: 'no verified connection available — nothing is claimed', verified: false }]
    : []);
}

/**
 * A transfer task is the only evidence that understanding happened. Same
 * relationship, unfamiliar surface.
 */
function deriveTransfer(run) {
  if (run.load?.controlled_form) {
    return {
      kind: 'SAME_RELATION_NEW_SURFACE',
      prompt: `Write a different story that needs the same relationship (${run.load.controlled_form.relation}) and the same number of steps.`,
      checks: ['the relationship survives', 'the step count survives', 'the surface is genuinely different'],
      verifies: 'the relationship, not the wording'
    };
  }
  if (run.resolution?.state === 'CONTESTED') {
    return {
      kind: 'APPLY_THE_TEST',
      prompt: 'Take one of the positions and say what single piece of evidence would make you drop it.',
      checks: ['names a real observation', 'the observation actually separates the positions'],
      verifies: 'that the learner can hold a position without being held by it'
    };
  }
  if (run.explanation?.starts_at) {
    return {
      kind: 'RUN_THE_MECHANISM_FORWARD',
      prompt: `Use ${run.explanation.starts_at} to predict what happens in a case we have not talked about.`,
      checks: ['prediction follows from the mechanism', 'the case is new'],
      verifies: 'mechanism, not recall'
    };
  }
  return null;
}

/** NEXT QUESTION — the run ends by opening the next one, never by closing down. */
function deriveNextQuestions(run) {
  const out = [];
  for (const w of run.resolution?.what_would_answer_it ?? []) {
    out.push({ question: `What would it take to get: ${w.requirement.toLowerCase()}?`, from: 'WHAT_WOULD_ANSWER_IT', feasibility: w.feasibility });
  }
  for (const u of run.resolution?.unknown ?? []) {
    if (u.who_was_outside_the_records) {
      out.push({ question: `Who was outside those records, and what happened to what they knew?`, from: 'RECORD_GAP' });
    }
  }
  if (run.load?.diagnosis?.verdict === 'RELATIONSHIP_BLOCKED') {
    out.push({ question: 'Which way round does the comparison run, and how would you show it with objects?', from: 'LOAD_DIAGNOSIS' });
  }
  if (run.prerequisites?.floor) {
    out.push({ question: `What is "${run.prerequisites.floor.label}" for, in a case the learner already cares about?`, from: 'PREREQUISITE_FLOOR' });
  }
  if (out.length === 0) out.push({ question: 'Where else would this hold, and where would it stop holding?', from: 'DEFAULT_TRANSFER' });
  return out.slice(0, 5);
}
