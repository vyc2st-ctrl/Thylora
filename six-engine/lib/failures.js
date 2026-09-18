// SIX UNDERSTANDING ENGINE · FAILURE MODES
// Workroom: WR-SIXENGINE-001
//
// Every failure mode here is a way an engine can look like it is teaching while
// it is not. Each one carries a detector that runs against the finished run
// record, so the failure is caught by the machine rather than noticed later by
// a person — if it is noticed at all.
//
// Severity: BLOCKING halts the answer. CORRECTING rewrites it. NOTING is
// recorded on the run and shown to the adult reviewing it.

export const SEVERITY = Object.freeze(['BLOCKING', 'CORRECTING', 'NOTING']);

export const FAILURE_MODES = Object.freeze([
  { code: 'FM-01', name: 'Silent word-sense guess', severity: 'BLOCKING',
    description: 'A word with more than one job in this context was resolved without the context separating the senses.',
    response: 'Ask the learner which job the word is doing. Do not proceed on a guess.',
    detect: (run) => (run.language?.ambiguities ?? []).length > 0
      ? { hit: true, detail: `unresolved word sense: ${run.language.ambiguities.map(a => a.word).join(', ')}` } : { hit: false } },

  { code: 'FM-02', name: 'Language failure read as a mathematics deficit', severity: 'BLOCKING',
    description: 'A wrong answer to a word problem was taken as evidence about the mathematics when the sentence was never understood.',
    response: 'Report LANGUAGE_BLOCKED, discard the uncontrolled M and S, and re-present in language-controlled form.',
    detect: (run) => {
      const d = run.load?.diagnosis;
      if (!d) return { hit: false };
      const claimed = d.mathematics_deficit_claim?.startsWith('SUPPORTED');
      return claimed && (d.L === null || d.L < 0.5)
        ? { hit: true, detail: `mathematics deficit claimed at L=${d.L}` } : { hit: false };
    } },

  { code: 'FM-03', name: 'Confidence above the evidence', severity: 'CORRECTING',
    description: 'Stated confidence exceeds the strength of the independent lines under it.',
    response: 'Lower the stated confidence to the evidence cap and say what the cap is.',
    detect: (run) => {
      const r = run.resolution;
      if (!r) return { hit: false };
      const cap = Math.max(0, ...r.evidence.map(e => e.cap ?? e.strength ?? 0));
      return r.confidence > cap + 1e-9 ? { hit: true, detail: `confidence ${r.confidence} above cap ${cap}` } : { hit: false };
    } },

  { code: 'FM-04', name: 'Contested presented as settled', severity: 'BLOCKING',
    description: 'A question the field is split on was answered as a single fact.',
    response: 'Return every position with its evidence and standing, and what would settle it.',
    detect: (run) => run.route?.requires_contest_report && (run.resolution?.contested ?? []).length === 0
      ? { hit: true, detail: 'contested route produced no contest report' } : { hit: false } },

  { code: 'FM-05', name: 'Gap in the record read as a finding', severity: 'CORRECTING',
    description: 'Absence of a record was treated as evidence that the event did not happen.',
    response: 'Report the gap, who kept the records, and who was outside them. Read silence as evidence about the record-keeping.',
    detect: (run) => {
      const gaps = (run.resolution?.unknown ?? []).filter(u => u.kind === 'RECORD_GAP');
      const asserted = run.resolution?.state === 'RESOLVED' && gaps.length > 0;
      return asserted ? { hit: true, detail: 'a settled answer was returned over an open record gap' } : { hit: false };
    } },

  { code: 'FM-06', name: 'Explanation landed on nothing', severity: 'BLOCKING',
    description: 'The explanation was delivered over an unmet prerequisite.',
    response: 'Start at the floor concept instead.',
    detect: (run) => run.prerequisites && run.prerequisites.found && run.prerequisites.unmet.length > 0 && run.stages?.includes('EXPLAIN') && !run.started_at_floor
      ? { hit: true, detail: `unmet prerequisite: ${run.prerequisites.floor?.id}` } : { hit: false } },

  { code: 'FM-07', name: 'Simplification that shrank the concept', severity: 'BLOCKING',
    description: 'The child-facing wording dropped a concept invariant.',
    response: 'Refuse the wording. Keep the invariant, reduce only the language.',
    detect: (run) => run.parity && run.parity.pass === false
      ? { hit: true, detail: `parity ${run.parity.parity}, lost ${run.parity.lost.join(', ') || 'no friction relief'}` } : { hit: false } },

  { code: 'FM-08', name: 'Answering a malformed question as asked', severity: 'BLOCKING',
    description: 'The question carried an assumption that was never established, and the answer let it through as fact.',
    response: 'Name the assumption and offer the repaired question.',
    detect: (run) => run.route?.presupposition && run.route.class !== 'MALFORMED'
      ? { hit: true, detail: run.route.presupposition.assumption } : { hit: false } },

  { code: 'FM-09', name: 'Source monoculture', severity: 'NOTING',
    description: 'Several sources were counted that all trace to one origin.',
    response: 'Collapse them to one line and say so.',
    detect: (run) => (run.resolution?.evidence ?? []).some(e => (e.flags ?? []).includes('REPETITION_COLLAPSED'))
      ? { hit: true, detail: 'repeated sources collapsed to their origin' } : { hit: false } },

  { code: 'FM-10', name: 'Understanding assumed, never checked', severity: 'CORRECTING',
    description: 'The run finished without a transfer task, so nothing verified the learner understood.',
    response: 'Attach the transfer task before closing the run.',
    // A run halted at MEANING has no transfer task and should not have one:
    // the failure is only real once an explanation was actually delivered.
    detect: (run) => run.route?.stages?.includes('TRANSFER') && run.explanation && !run.transfer
      ? { hit: true, detail: 'an explanation was delivered with no transfer task to verify it' } : { hit: false } },

  { code: 'FM-11', name: 'Endless prerequisite regress', severity: 'NOTING',
    description: 'The prerequisite walk hit its depth cap or a cycle.',
    response: 'Teach from the deepest concept reached and mark the chain below it unexamined.',
    detect: (run) => run.prerequisites?.truncated || (run.prerequisites?.cycles ?? []).length > 0
      ? { hit: true, detail: run.prerequisites.truncation_note ?? run.prerequisites.cycle_note } : { hit: false } },

  { code: 'FM-12', name: 'Safety-gated topic answered without the gate', severity: 'BLOCKING',
    description: 'A medical, legal, financial or safety question was answered to a child without routing to a named adult.',
    response: 'Give general understanding only and route to the guardian.',
    // Stopping at the gate is the correct behaviour, not a failure. The failure
    // is answering anyway.
    detect: (run) => run.route?.gate === 'GUARDIAN' && !run.gate_routed && (run.explanation || run.resolution)
      ? { hit: true, detail: 'a guardian-gated question was answered without routing to a named adult' } : { hit: false } },

  { code: 'FM-13', name: 'Stale evidence', severity: 'NOTING',
    description: 'The strongest lines are old enough that the position may have moved.',
    response: 'Date the evidence in the answer and flag it for refresh.',
    detect: (run) => (run.resolution?.evidence ?? []).some(e => (e.flags ?? []).includes('EVIDENCE_MAY_BE_STALE'))
      ? { hit: true, detail: 'evidence predates 2000 with no newer independent line' } : { hit: false } },

  { code: 'FM-14', name: 'Personal question answered from general knowledge', severity: 'BLOCKING',
    description: "A question about the learner's own life was answered from general sources instead of the records the backend actually holds.",
    response: 'Answer only from the backend record, with provenance, or say the record does not hold it.',
    detect: (run) => run.route?.backend_only && run.resolution &&
      (run.resolution.evidence ?? []).some(e => e.origin_scope && e.origin_scope !== 'BACKEND_RECORD')
      ? { hit: true, detail: 'general-knowledge evidence used for a personal-record question' } : { hit: false } }
]);

export function byCode(code) {
  return FAILURE_MODES.find(f => f.code === code) ?? null;
}

/** Run every detector against a run record. */
export function detectFailures(run) {
  const hits = [];
  for (const mode of FAILURE_MODES) {
    let result;
    try { result = mode.detect(run); } catch (err) { result = { hit: true, detail: `detector error: ${err.message}` }; }
    if (result?.hit) hits.push({ code: mode.code, name: mode.name, severity: mode.severity, detail: result.detail, response: mode.response });
  }
  return {
    hits,
    blocking: hits.filter(h => h.severity === 'BLOCKING'),
    correcting: hits.filter(h => h.severity === 'CORRECTING'),
    noting: hits.filter(h => h.severity === 'NOTING'),
    clean: hits.length === 0
  };
}
