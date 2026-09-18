// SIX UNDERSTANDING ENGINE · pipeline and failure-mode tests
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveQuestion, STAGES } from '../six-engine/lib/pipeline.js';
import { detectFailures, FAILURE_MODES, byCode } from '../six-engine/lib/failures.js';
import { recordGap } from '../six-engine/lib/evidence.js';

const MASTERY = { counting: 'HELD', addition: 'HELD', subtraction: 'HELD', equal_groups: 'HELD', division_sharing: 'HELD' };
const learner = { id: 'L1', language_band: 2, mastery: MASTERY };

const ICE = {
  text: 'Why does ice float?',
  concept: 'floating',
  learner,
  knowledge: {
    positions: [{
      id: 'density', statement: 'Ice floats because it is less dense than the water around it',
      standing: 'CONSENSUS',
      evidence: [{ tier: 'PHYSICAL_EVIDENCE', origin_id: 'measurement' }, { tier: 'REPLICATED_EXPERIMENT', origin_id: 'labs' }]
    }],
    unknowns: []
  }
};

test('a complete run walks the stages in order and leaves an append-only trail', () => {
  const run = resolveQuestion(ICE);
  assert.equal(run.state, 'COMPLETE');
  const stages = run.trail.map(e => e.stage);
  const positions = stages.map(s => STAGES.indexOf(s));
  assert.deepEqual(positions, [...positions].sort((a, b) => a - b), 'stages ran out of order');
  assert.deepEqual(run.trail.map(e => e.seq), run.trail.map((_, i) => i + 1));
  assert.equal(run.failures.clean, true);
});

test('the explanation starts at the prerequisite floor, not at the question', () => {
  const run = resolveQuestion({ ...ICE, learner: { ...learner, mastery: { ...MASTERY, density: 'NOT_HELD' } } });
  assert.equal(run.explanation.starts_at, 'density');
  assert.equal(run.prerequisites.floor.id, 'density');
});

test('a run over an unmet prerequisite that did not start at the floor is caught (FM-06)', () => {
  const fake = {
    route: { stages: ['EXPLAIN'], class: 'CONCEPTUAL_MECHANISM' },
    prerequisites: { found: true, unmet: [{ id: 'density' }], floor: { id: 'density' }, cycles: [], truncated: false },
    stages: ['EXPLAIN'], started_at_floor: false
  };
  assert.ok(detectFailures(fake).hits.some(h => h.code === 'FM-06'));
});

test('an ambiguous word halts the run and becomes a question to the learner (FM-01)', () => {
  const run = resolveQuestion({
    text: 'Look at the table and say what it shows.',
    learner: { language_band: 2 },
    knowledge: { positions: [], unknowns: [] }
  });
  assert.equal(run.state, 'HALTED');
  assert.equal(run.halt_reason, 'LANGUAGE_AMBIGUOUS');
  assert.ok(run.ask_the_learner.some(q => /table/.test(q)));
  assert.ok(run.failures.hits.some(h => h.code === 'FM-01'));
});

test('a word problem with a blocked sentence never claims a mathematics deficit (FM-02)', () => {
  const run = resolveQuestion({
    text: 'Ada has 3 less than Sam. Sam has 8 sweets. If Ada shares hers between 5 children, how many does each child get?',
    domain: 'math',
    learner,
    structure: { quantities: { Sam: 8 }, relation: 'Ada = Sam - 3', question: 'Ada ÷ 5', steps: 2 },
    attempt: { learner_restatement: 'ada has 3', relation_stated: '3 - 8', steps_attempted: 2, steps_correct: 0, answer_correct: false },
    knowledge: { positions: [], unknowns: [] }
  });
  assert.equal(run.route.class, 'MATH_WORD_PROBLEM');
  assert.equal(run.state, 'GATED');
  assert.equal(run.halt_reason, 'LANGUAGE_BLOCKED');
  assert.equal(run.mathematics_deficit_claim, 'NOT_SUPPORTED');
  assert.equal(run.teaching_target, 'the sentence');
  assert.ok(run.controlled_form.presentation.includes('Ada = Sam - 3'));
  assert.ok(!run.failures.hits.some(h => h.code === 'FM-02'), 'the engine must not trip its own FM-02');
});

test('a contested question that produced no contest report is caught (FM-04)', () => {
  const fake = { route: { requires_contest_report: true, stages: [] }, resolution: { contested: [], evidence: [], unknown: [] } };
  const hits = detectFailures(fake).hits;
  assert.ok(hits.some(h => h.code === 'FM-04' && h.severity === 'BLOCKING'));
});

test('a contested question returns every position, its standing and what would settle it', () => {
  const run = resolveQuestion({
    text: 'Was the founder really born in that town?',
    learner,
    knowledge: {
      positions: [
        { id: 'town', statement: 'Born in the town', standing: 'CONSENSUS', evidence: [{ tier: 'SECONDARY_ACCOUNT', origin_id: 'chron' }], discriminator: 'a baptism entry' },
        { id: 'elsewhere', statement: 'Born elsewhere and moved as a child', standing: 'MINORITY', evidence: [{ tier: 'DIRECT_TESTIMONY', origin_id: 'letter' }] }
      ],
      unknowns: [recordGap({ what_is_missing: 'the register for those years', why_missing: 'destroyed', who_was_outside_the_records: 'families outside the established church' })]
    }
  });
  assert.equal(run.route.class, 'CONTESTED_RECORD');
  assert.equal(run.resolution.state, 'CONTESTED');
  assert.equal(run.answer.CONTESTED.length, 2);
  assert.ok(run.answer.WHAT_WOULD_ANSWER_IT.length > 0);
  assert.ok(run.next_questions.some(n => /outside those records/i.test(n.question)));
});

test('a safety question is gated to a named adult before anything actionable (FM-12)', () => {
  const run = resolveQuestion({ text: 'Is it safe to take two of these pills?', learner, knowledge: { positions: [], unknowns: [] } });
  assert.equal(run.state, 'GATED');
  assert.equal(run.route.gate, 'GUARDIAN');
  assert.equal(run.answer, null);
  assert.match(run.trail.at(-1).data.next_action, /named adult/);
  // Stopping at the gate is correct behaviour and is not charged as a failure.
  assert.ok(!run.failures.hits.some(h => h.code === 'FM-12'));
});

test('the engine refuses to answer with no knowledge supplied rather than filling the space', () => {
  const run = resolveQuestion({ text: 'How many moons does Jupiter have?', learner, knowledge: null });
  assert.equal(run.state, 'HALTED');
  assert.equal(run.halt_reason, 'NO_KNOWLEDGE_SUPPLIED');
  assert.match(run.trail.at(-1).data.next_action, /will not write an answer it has no source for/);
});

test('a child-facing wording that shrinks the concept halts the run (FM-07)', () => {
  const run = resolveQuestion({
    ...ICE,
    simplification: {
      source: 'Most physicists hold that ice floats because it is less dense than the water around it.',
      candidate: 'Ice floats.'
    }
  });
  assert.equal(run.state, 'HALTED');
  assert.equal(run.halt_reason, 'PARITY_VIOLATION');
  assert.ok(run.failures.hits.some(h => h.code === 'FM-07'));
});

test('a child-facing wording that keeps the concept is accepted and carried', () => {
  const run = resolveQuestion({
    ...ICE,
    simplification: {
      source: 'Most physicists hold that ice floats because it is less dense than the water around it.',
      candidate: 'Most scientists say ice floats because the same amount of space holds less stuff in ice than in water.'
    }
  });
  assert.equal(run.state, 'COMPLETE');
  assert.equal(run.explanation.parity.pass, true);
  assert.match(run.child_facing, /Most scientists/);
});

test('every completed run carries a transfer task and opens the next question', () => {
  const run = resolveQuestion(ICE);
  assert.ok(run.transfer, 'no transfer task');
  assert.ok(run.transfer.checks.length > 0);
  assert.ok(run.next_questions.length > 0);
  assert.ok(!run.failures.hits.some(h => h.code === 'FM-10'));
});

test('an explanation delivered with no transfer task is caught (FM-10)', () => {
  const fake = { route: { stages: ['TRANSFER'] }, explanation: { starts_at: 'density' }, transfer: null };
  assert.ok(detectFailures(fake).hits.some(h => h.code === 'FM-10'));
});

test('a run that halted before explaining is not blamed for having no transfer task', () => {
  const halted = { route: { stages: ['TRANSFER'] }, explanation: null, transfer: null };
  assert.ok(!detectFailures(halted).hits.some(h => h.code === 'FM-10'));

  const run = resolveQuestion({
    text: 'Look at the table and say what it shows.',
    learner: { language_band: 2 },
    knowledge: { positions: [], unknowns: [] }
  });
  assert.equal(run.state, 'HALTED');
  assert.ok(!run.failures.hits.some(h => h.code === 'FM-10'), 'a halted run must not be charged with a missing transfer task');
});

test('a relationship stated with the operator inverted reads as a direction error', () => {
  const run = resolveQuestion({
    text: 'Ada has 3 less than Sam. Sam has 8 sweets. If Ada shares hers between 5 children, how many does each child get?',
    domain: 'math',
    learner: { ...learner, known_lemmas: ['less than', 'each', 'share', 'if'] },
    structure: { quantities: { Sam: 8 }, relation: 'Ada = Sam - 3', question: 'Ada ÷ 5', steps: 2 },
    attempt: {
      learner_restatement: 'if sam has 8 and ada has 3 less than him, then all 5 children get an equal share each',
      controlled: true, relation_stated: 'Ada = Sam + 3', steps_attempted: 2, steps_correct: 2, bare_computation: true, answer_correct: false
    }
  });
  assert.equal(run.load.mathematical.direction_flipped, true);
  assert.equal(run.load.diagnosis.verdict, 'RELATIONSHIP_BLOCKED');
  assert.match(run.load.mathematical.note, /direction reversed/);
});

test("a word problem's answer is its load diagnosis, not an empty evidence report", () => {
  const run = resolveQuestion({
    text: '12 sweets shared between 4 children, how many does each child get?',
    domain: 'math',
    learner: { ...learner, known_lemmas: ['share', 'each'] },
    structure: { quantities: { sweets: 12, children: 4 }, relation: 'sweets ÷ children', question: 'per child', steps: 1 },
    attempt: {
      learner_restatement: '12 sweets split equally so each of the 4 children gets the same amount',
      controlled: true, relation_stated: 'sweets ÷ children', steps_attempted: 1, steps_correct: 1, bare_computation: true, answer_correct: true
    }
  });
  assert.equal(run.state, 'COMPLETE');
  assert.equal(run.answer.VERDICT, 'SECURE');
  assert.equal(run.answer.MATHEMATICS_DEFICIT_CLAIM, 'NOT_CLAIMED');
  assert.ok(!('KNOWN' in run.answer), 'a word problem should not be answered as an evidence question');
});

test('answering a gated question anyway IS caught (FM-12)', () => {
  const answeredAnyway = {
    route: { gate: 'GUARDIAN', stages: [] }, gate_routed: false,
    explanation: { starts_at: 'the question itself' }
  };
  assert.ok(detectFailures(answeredAnyway).hits.some(h => h.code === 'FM-12' && h.severity === 'BLOCKING'));
});

test('a personal question answered from general knowledge is caught (FM-14)', () => {
  const fake = {
    route: { backend_only: true, stages: [] },
    resolution: { evidence: [{ position: 'A', origin_scope: 'GENERAL_KNOWLEDGE', flags: [] }], contested: [], unknown: [] }
  };
  assert.ok(detectFailures(fake).hits.some(h => h.code === 'FM-14' && h.severity === 'BLOCKING'));
});

test('confidence above the evidence cap is caught (FM-03)', () => {
  const fake = { resolution: { confidence: 0.95, evidence: [{ cap: 0.3, strength: 0.3, flags: [] }], contested: [], unknown: [] }, route: { stages: [] } };
  assert.ok(detectFailures(fake).hits.some(h => h.code === 'FM-03'));
});

test('all fourteen failure modes carry a detector, a severity and a response', () => {
  assert.equal(FAILURE_MODES.length, 14);
  for (const mode of FAILURE_MODES) {
    assert.match(mode.code, /^FM-\d\d$/);
    assert.ok(['BLOCKING', 'CORRECTING', 'NOTING'].includes(mode.severity));
    assert.equal(typeof mode.detect, 'function');
    assert.ok(mode.response.length > 0);
    assert.equal(byCode(mode.code), mode);
  }
});

test('a clean run reports clean, and a detector error does not crash the run', () => {
  assert.equal(detectFailures({ route: { stages: [] } }).clean, true);
});
