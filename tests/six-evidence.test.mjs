// SIX UNDERSTANDING ENGINE · evidence, contest and honest unknown tests
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  gradeEvidence, independentLines, resolveClaim, understandingReport,
  whatWouldAnswerIt, recordGap, standingNote, EVIDENCE_TIERS, UNKNOWN_KINDS
} from '../six-engine/lib/evidence.js';

test('repeated sources tracing to one origin count as one line', () => {
  const items = [
    { tier: 'SECONDARY_ACCOUNT', origin_id: 'dataset-A' },
    { tier: 'TERTIARY_SUMMARY', origin_id: 'dataset-A' },
    { tier: 'TERTIARY_SUMMARY', origin_id: 'dataset-A' }
  ];
  assert.equal(independentLines(items).length, 1);
  const grade = gradeEvidence(items);
  assert.equal(grade.independent_lines, 1);
  assert.ok(grade.flags.includes('REPETITION_COLLAPSED'));
});

test('strength is capped by the best independent line, not by how often it is repeated', () => {
  const repeated = gradeEvidence(Array.from({ length: 20 }, () => ({ tier: 'TERTIARY_SUMMARY', origin_id: 'book' })));
  const single = gradeEvidence([{ tier: 'CONTEMPORANEOUS_RECORD', origin_id: 'register' }]);
  assert.ok(repeated.strength < single.strength);
  assert.ok(repeated.strength <= EVIDENCE_TIERS.TERTIARY_SUMMARY.weight + 0.001);
});

test('standing is recorded and reported but never counts toward strength', () => {
  const thin = gradeEvidence([{ tier: 'TERTIARY_SUMMARY', origin_id: 'x' }]);
  const note = standingNote('CONSENSUS', thin);
  assert.equal(note.counts_toward_strength, false);
  assert.match(note.note, /Widely held is not the same as well evidenced/);
});

test('a minority position on a contemporaneous record outranks a consensus on summaries', () => {
  const r = resolveClaim({
    question: 'Where was she born?',
    positions: [
      { id: 'mainstream', statement: 'In the parish', standing: 'CONSENSUS',
        evidence: [{ tier: 'TERTIARY_SUMMARY', origin_id: 'b1' }, { tier: 'TERTIARY_SUMMARY', origin_id: 'b1' }] },
      { id: 'minority', statement: 'Outside the parish, registered later', standing: 'MINORITY',
        evidence: [{ tier: 'CONTEMPORANEOUS_RECORD', origin_id: 'reg' }, { tier: 'PHYSICAL_EVIDENCE', origin_id: 'stone' }] }
    ]
  });
  assert.equal(r.known[0].statement, 'Outside the parish, registered later');
  assert.ok(r.evidence[0].independent_lines >= 2);
});

test('two positions of comparable strength return CONTESTED, not a winner', () => {
  const r = resolveClaim({
    question: 'Which account is right?',
    positions: [
      { id: 'A', statement: 'Account A', standing: 'MAJORITY', evidence: [{ tier: 'DIRECT_TESTIMONY', origin_id: 'a' }], discriminator: 'the ledger entry for that week' },
      { id: 'B', statement: 'Account B', standing: 'MINORITY', evidence: [{ tier: 'SINGLE_STUDY', origin_id: 'b' }] }
    ]
  });
  assert.equal(r.state, 'CONTESTED');
  assert.equal(r.contested.length, 2);
  assert.ok(r.what_would_answer_it.some(w => /cannot fit/.test(w.requirement)));
});

test('a contested claim reports both standings without collapsing them', () => {
  const r = resolveClaim({
    question: 'q',
    positions: [
      { id: 'A', statement: 'A', standing: 'CONSENSUS', evidence: [{ tier: 'SECONDARY_ACCOUNT', origin_id: 'a' }] },
      { id: 'B', statement: 'B', standing: 'MINORITY', evidence: [{ tier: 'ORAL_TRANSMISSION', origin_id: 'b' }] }
    ]
  });
  const report = understandingReport(r);
  assert.equal(r.state, 'CONTESTED');
  assert.equal(report.CONTESTED.length, 2);
  assert.ok(report.CONTESTED.some(c => /Most researchers/.test(c)));
  assert.ok(report.CONTESTED.some(c => /Fewer researchers/.test(c)));
});

test('confidence never exceeds the evidence cap', () => {
  const r = resolveClaim({ question: 'q', positions: [{ id: 'A', statement: 'A', standing: 'CONSENSUS', evidence: [{ tier: 'ANECDOTE', origin_id: 'a' }] }] });
  assert.ok(r.confidence <= EVIDENCE_TIERS.ANECDOTE.weight + 0.001);
  assert.equal(r.state, 'UNKNOWN');
});

test('one strong line is reported with conditions, not as closed', () => {
  const r = resolveClaim({ question: 'q', positions: [{ id: 'A', statement: 'A', standing: 'UNSTATED', evidence: [{ tier: 'REPLICATED_EXPERIMENT', origin_id: 'one' }] }] });
  assert.equal(r.state, 'RESOLVED_WITH_CONDITIONS');
  assert.ok(r.known[0].conditions.some(c => /one independent line/.test(c)));
});

test('a gap in the record is not evidence of absence, and names who was outside it', () => {
  const gap = recordGap({
    what_is_missing: 'parish register 1748–1761', why_missing: 'destroyed by fire',
    who_kept_records: 'the established church',
    who_was_outside_the_records: 'people not baptised in that church'
  });
  assert.equal(gap.absence_of_record_is_not_absence_of_event, true);
  assert.match(gap.reading_rule, /who they never wrote about/);

  const r = resolveClaim({
    question: 'Was there a birth?',
    positions: [{ id: 'A', statement: 'No birth recorded', standing: 'MAJORITY', evidence: [{ tier: 'SECONDARY_ACCOUNT', origin_id: 's' }] }],
    unknowns: [gap]
  });
  assert.notEqual(r.state, 'RESOLVED');
  const report = understandingReport(r);
  assert.ok(report.UNKNOWN[0].includes('parish register'));
  assert.ok(report.UNKNOWN[0].includes('outside those records'));
});

test('a question resting on an unestablished assumption is returned as MALFORMED', () => {
  const r = resolveClaim({
    question: 'When did they stop doing it?',
    positions: [],
    presupposition_failure: { assumption: 'that it was happening, and that it stopped', repair: 'Establish first whether it was happening.' }
  });
  assert.equal(r.state, 'MALFORMED');
  assert.equal(r.confidence, 0);
  assert.match(r.what_would_answer_it[0].requirement, /Repair the question/);
});

test('WHAT WOULD ANSWER IT names an observation, never "more research"', () => {
  const answers = whatWouldAnswerIt({ unknowns: [{ kind: 'NOT_YET_MEASURED' }, { kind: 'UNDECIDABLE_IN_PRINCIPLE' }], state: 'UNKNOWN' });
  assert.ok(answers.some(a => a.feasibility === 'OBTAINABLE'));
  assert.ok(answers.some(a => a.feasibility === 'IMPOSSIBLE'));
  assert.ok(answers.every(a => !/more research/i.test(a.requirement)));
});

test('the five-section report is always produced, in order, with nothing skipped', () => {
  const r = resolveClaim({ question: 'q', positions: [], unknowns: [{ kind: 'NOT_YET_MEASURED', detail: 'nobody has measured it' }] });
  const report = understandingReport(r);
  assert.deepEqual(Object.keys(report).slice(0, 5), ['KNOWN', 'EVIDENCE', 'CONTESTED', 'UNKNOWN', 'WHAT_WOULD_ANSWER_IT']);
  assert.equal(report.KNOWN[0], 'Nothing here is settled enough to state as known.');
  assert.equal(r.state, 'UNKNOWN');
});

test('unknown kinds cover the honest ways a question can have no answer', () => {
  for (const k of ['RECORD_GAP', 'NOT_YET_MEASURED', 'UNDEFINED_TERMS', 'UNDECIDABLE_IN_PRINCIPLE', 'FUTURE_CONTINGENT']) {
    assert.ok(UNKNOWN_KINDS[k], `missing unknown kind ${k}`);
  }
});

test('old evidence with no newer line is flagged rather than silently trusted', () => {
  const grade = gradeEvidence([{ tier: 'SINGLE_STUDY', origin_id: 'old', as_of: '1974-01-01' }]);
  assert.ok(grade.flags.includes('EVIDENCE_MAY_BE_STALE'));
});
