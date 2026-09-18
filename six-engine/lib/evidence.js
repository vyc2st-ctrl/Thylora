// SIX UNDERSTANDING ENGINE · EVIDENCE, CONTEST AND THE HONEST UNKNOWN
// Workroom: WR-SIXENGINE-001
//
// When a definitive answer exists, the engine gives it. When one does not, the
// engine does not go quiet and does not bluff. It returns five things:
//
//   KNOWN · EVIDENCE · CONTESTED · UNKNOWN · WHAT WOULD ANSWER IT
//
// Three rules are enforced here rather than trusted to the writer:
//
//  1. Confidence may not exceed the evidence under it (FM-03). Strength comes
//     from independent lines of evidence, never from how many people repeat a
//     claim and never from how confidently it is written.
//  2. Standing is not strength (FM-04). "Most researchers hold X" says who
//     holds X. It is recorded, it is reported, and it never raises the cap. A
//     consensus resting on tertiary summaries is capped like tertiary
//     summaries. A minority position resting on contemporaneous records is
//     capped like contemporaneous records.
//  3. A gap in the record is not evidence of absence (FM-05). Where records
//     were destroyed, never kept, or kept only about some people, the engine
//     records the gap AND who was outside the record-keeping, and refuses to
//     read silence as a finding either way.

export const EVIDENCE_TIERS = Object.freeze({
  CONTEMPORANEOUS_RECORD: { weight: 0.92, label: 'written or made at the time by someone present' },
  PHYSICAL_EVIDENCE:      { weight: 0.90, label: 'the object, site, remains or measurement itself' },
  REPLICATED_EXPERIMENT:  { weight: 0.94, label: 'result reproduced by independent teams' },
  SYSTEMATIC_REVIEW:      { weight: 0.88, label: 'all qualifying studies gathered and weighed' },
  SINGLE_STUDY:           { weight: 0.62, label: 'one study, not yet reproduced' },
  DIRECT_TESTIMONY:       { weight: 0.60, label: 'first-hand account given later' },
  SECONDARY_ACCOUNT:      { weight: 0.45, label: 'written later, using sources' },
  ORAL_TRANSMISSION:      { weight: 0.42, label: 'passed down by people, not written at the time' },
  TERTIARY_SUMMARY:       { weight: 0.28, label: 'a summary of summaries — textbook, encyclopaedia' },
  INFERENCE:              { weight: 0.35, label: 'reasoned from other facts, not observed' },
  ANECDOTE:               { weight: 0.15, label: 'one story, no way to check it' },
  UNSOURCED_ASSERTION:    { weight: 0.05, label: 'stated with nothing behind it' }
});

export const STANDINGS = Object.freeze(['CONSENSUS', 'MAJORITY', 'MINORITY', 'CONTESTED', 'EMERGING', 'FRINGE', 'UNSTATED']);

export const UNKNOWN_KINDS = Object.freeze({
  RECORD_GAP:              'the record that would settle it was destroyed, never kept, or kept only about some people',
  NOT_YET_MEASURED:        'it could be measured, and has not been',
  NOT_YET_OBSERVABLE:      'no instrument or access currently reaches it',
  UNDEFINED_TERMS:         'the question uses a term no one has pinned down, so no answer can be checked',
  FUTURE_CONTINGENT:       'it has not happened yet and depends on choices not yet made',
  PRIVATE_FACT:            'someone knows, and the engine has no legitimate route to it',
  UNDECIDABLE_IN_PRINCIPLE:'no observation could separate the answers'
});

export const CLAIM_STATES = Object.freeze([
  'RESOLVED', 'RESOLVED_WITH_CONDITIONS', 'CONTESTED', 'UNKNOWN', 'UNDECIDABLE', 'MALFORMED'
]);

/**
 * Independent lines of evidence.
 *
 * Twenty articles tracing to one dataset are one line, not twenty. Collapsing
 * by origin is what stops a repeated claim from looking like a proved one.
 */
export function independentLines(items = []) {
  const byOrigin = new Map();
  for (const item of items) {
    const origin = item.origin_id ?? item.source_id ?? `anon:${byOrigin.size}`;
    const tier = EVIDENCE_TIERS[item.tier];
    if (!tier) throw new Error(`Unknown evidence tier: ${item.tier}`);
    const existing = byOrigin.get(origin);
    if (!existing || tier.weight > EVIDENCE_TIERS[existing.tier].weight) byOrigin.set(origin, item);
  }
  return [...byOrigin.values()];
}

/**
 * Strength of a body of evidence, capped by its best independent line and
 * lifted — modestly — by genuine corroboration.
 */
export function gradeEvidence(items = []) {
  if (items.length === 0) {
    return { strength: 0, independent_lines: 0, best_tier: null, cap: 0, flags: ['NO_EVIDENCE_SUPPLIED'] };
  }
  const lines = independentLines(items);
  const weights = lines.map(i => EVIDENCE_TIERS[i.tier].weight).sort((a, b) => b - a);
  const best = weights[0];
  const corroboration = Math.min(0.08, 0.04 * (lines.length - 1));
  const strength = Number(Math.min(best + corroboration, 0.98).toFixed(2));

  const flags = [];
  if (items.length > lines.length) flags.push('REPETITION_COLLAPSED');
  if (lines.length === 1) flags.push('SINGLE_LINE');
  if (lines.every(i => ['TERTIARY_SUMMARY', 'SECONDARY_ACCOUNT'].includes(i.tier))) flags.push('NO_PRIMARY_LINE');
  const dated = lines.filter(i => i.as_of).map(i => i.as_of).sort();
  if (dated.length && dated[dated.length - 1] < '2000-01-01') flags.push('EVIDENCE_MAY_BE_STALE');

  return {
    strength,
    cap: strength,
    independent_lines: lines.length,
    supplied_items: items.length,
    best_tier: lines.find(i => EVIDENCE_TIERS[i.tier].weight === best)?.tier ?? null,
    flags
  };
}

/**
 * Standing — who holds the position — recorded and reported, never converted
 * into strength. This function returns a note, not a number, deliberately.
 */
export function standingNote(standing, evidenceGrade) {
  if (!STANDINGS.includes(standing)) throw new Error(`Unknown standing: ${standing}`);
  const strong = evidenceGrade.strength >= 0.6;
  const map = {
    CONSENSUS: strong
      ? 'Most researchers in the field hold this, and the evidence under it is strong.'
      : 'Most researchers in the field currently hold this, but the evidence under it is thin. Widely held is not the same as well evidenced.',
    MAJORITY: 'More researchers hold this than hold the alternatives. That is a count of people, not of evidence.',
    MINORITY: strong
      ? 'Fewer researchers hold this, and the evidence under it is strong. Being outnumbered is not being wrong.'
      : 'Fewer researchers hold this, and the evidence under it is thin.',
    CONTESTED: 'The field is genuinely split on this.',
    EMERGING: 'Recently argued; the field has not finished responding to it.',
    FRINGE: 'Held well outside the field. Recorded here so the learner can see it exists and see what it rests on.',
    UNSTATED: 'No standing was recorded for this position.'
  };
  return { standing, note: map[standing], counts_toward_strength: false };
}

/** Does a gap in the record cut one way? It does not. */
export function recordGap({ what_is_missing, why_missing = null, who_kept_records = null, who_was_outside_the_records = null }) {
  return {
    kind: 'RECORD_GAP',
    what_is_missing,
    why_missing,
    who_kept_records,
    who_was_outside_the_records,
    absence_of_record_is_not_absence_of_event: true,
    reading_rule: 'Silence in a record can only be read once you know who was writing it, what they wrote about, and who they never wrote about. Where the record-keepers excluded people, the gap is evidence about the record-keeping, not about the people.'
  };
}

/**
 * Resolve a claim from its positions.
 *
 * positions: [{ id, statement, standing, evidence: [...], conditions: [] }]
 * unknowns:  [{ kind, detail }]
 */
export function resolveClaim({ question, positions = [], unknowns = [], presupposition_failure = null }) {
  if (presupposition_failure) {
    return {
      question, state: 'MALFORMED', confidence: 0,
      presupposition_failure,
      known: [], evidence: [], contested: [], unknown: unknowns,
      what_would_answer_it: [{
        requirement: 'Repair the question first',
        detail: presupposition_failure.repair ?? 'The question assumes something that is not established. Settle that, then ask again.',
        feasibility: 'OBTAINABLE'
      }],
      note: 'Answering as asked would smuggle the assumption through as fact.'
    };
  }

  const graded = positions.map(p => {
    const grade = gradeEvidence(p.evidence ?? []);
    return { ...p, grade, standing_note: standingNote(p.standing ?? 'UNSTATED', grade) };
  }).sort((a, b) => b.grade.strength - a.grade.strength);

  const lead = graded[0] ?? null;
  const rival = graded[1] ?? null;
  const separation = lead && rival ? Number((lead.grade.strength - rival.grade.strength).toFixed(2)) : null;

  let state, confidence;
  if (graded.length === 0) {
    state = unknowns.some(u => u.kind === 'UNDECIDABLE_IN_PRINCIPLE') ? 'UNDECIDABLE' : 'UNKNOWN';
    confidence = 0;
  } else if (rival && separation < 0.2 && rival.grade.strength >= 0.4) {
    state = 'CONTESTED';
    confidence = Number(lead.grade.strength.toFixed(2));
  } else if (lead.grade.strength >= 0.75) {
    // One strong line is still one line. It is reported as resolved only when
    // something else independent stands behind it (FM-03).
    const singleLine = lead.grade.independent_lines < 2;
    const openRecordGap = unknowns.some(u => u.kind === 'RECORD_GAP');
    state = (lead.conditions?.length ?? 0) > 0 || singleLine || openRecordGap
      ? 'RESOLVED_WITH_CONDITIONS' : 'RESOLVED';
    confidence = lead.grade.strength;
    if (singleLine) (lead.conditions ??= []).push('rests on one independent line — a second, independent line would confirm or break it');
    if (openRecordGap) (lead.conditions ??= []).push('a record that would bear on this is missing, so the question is not closed');
  } else if (lead.grade.strength >= 0.4) {
    state = 'RESOLVED_WITH_CONDITIONS';
    confidence = lead.grade.strength;
  } else {
    state = 'UNKNOWN';
    confidence = lead.grade.strength;
  }

  const known = state === 'RESOLVED' || state === 'RESOLVED_WITH_CONDITIONS'
    ? [{ statement: lead.statement, confidence, conditions: lead.conditions ?? [] }]
    : [];

  const contested = state === 'CONTESTED'
    ? graded.map(p => ({
        id: p.id, statement: p.statement, strength: p.grade.strength,
        independent_lines: p.grade.independent_lines,
        standing: p.standing_note.standing, standing_note: p.standing_note.note,
        flags: p.grade.flags
      }))
    : graded.slice(1).map(p => ({
        id: p.id, statement: p.statement, strength: p.grade.strength,
        standing: p.standing_note.standing, standing_note: p.standing_note.note, held_as: 'alternative'
      }));

  return {
    question, state, confidence,
    confidence_cap_reason: lead ? `capped by ${lead.grade.best_tier ?? 'no evidence'} across ${lead.grade.independent_lines} independent line(s)` : 'no position carries evidence',
    known,
    evidence: graded.map(p => ({ position: p.id, ...p.grade })),
    contested,
    unknown: unknowns,
    separation,
    what_would_answer_it: whatWouldAnswerIt({ positions: graded, unknowns, state })
  };
}

/**
 * WHAT WOULD ANSWER IT.
 *
 * Not "more research". A named observation that would separate the positions,
 * with an honest note on whether anyone can go and get it.
 */
export function whatWouldAnswerIt({ positions = [], unknowns = [], state = 'UNKNOWN' }) {
  const out = [];

  for (const u of unknowns) {
    const map = {
      RECORD_GAP: { requirement: 'A surviving record from the time, or a parallel record kept elsewhere', feasibility: 'EXISTS_UNEXAMINED' },
      NOT_YET_MEASURED: { requirement: 'The measurement itself, taken and published', feasibility: 'OBTAINABLE' },
      NOT_YET_OBSERVABLE: { requirement: 'An instrument or access route that does not exist yet', feasibility: 'NOT_CURRENTLY_OBTAINABLE' },
      UNDEFINED_TERMS: { requirement: 'A definition both sides will accept before the evidence is weighed', feasibility: 'OBTAINABLE' },
      FUTURE_CONTINGENT: { requirement: 'Waiting — the events have not happened', feasibility: 'NOT_CURRENTLY_OBTAINABLE' },
      PRIVATE_FACT: { requirement: 'The person who knows, choosing to say', feasibility: 'NOT_CURRENTLY_OBTAINABLE' },
      UNDECIDABLE_IN_PRINCIPLE: { requirement: 'Nothing would. No observation separates the answers.', feasibility: 'IMPOSSIBLE' }
    };
    const base = map[u.kind] ?? { requirement: 'An observation that bears on it', feasibility: 'UNKNOWN' };
    out.push({ ...base, detail: u.detail ?? UNKNOWN_KINDS[u.kind], from_unknown: u.kind });
  }

  if (state === 'CONTESTED' && positions.length >= 2) {
    const [a, b] = positions;
    out.push({
      requirement: `One piece of evidence that fits ${a.id} and cannot fit ${b.id}`,
      detail: `Both positions currently survive the same evidence. The discriminator is the observation the two would disagree about in advance: ${a.discriminator ?? b.discriminator ?? 'name the prediction each makes that the other does not'}.`,
      feasibility: a.discriminator || b.discriminator ? 'OBTAINABLE' : 'UNKNOWN'
    });
    for (const p of positions) {
      if (p.grade.flags.includes('NO_PRIMARY_LINE')) {
        out.push({
          requirement: `A primary source under "${p.id}"`,
          detail: 'This position currently rests only on later accounts. A contemporaneous record or physical evidence would move it.',
          feasibility: 'EXISTS_UNEXAMINED'
        });
      }
    }
  }

  if (out.length === 0) {
    const lines = positions[0]?.grade?.independent_lines ?? 0;
    out.push({
      requirement: 'An independent line of evidence not already counted',
      detail: lines >= 2
        ? `The present answer rests on ${lines} independent lines. A line of a different KIND — a record where there is now only measurement, or the reverse — is what would test it further.`
        : 'The present answer rests on a single line; a second, independent one would confirm or break it.',
      feasibility: 'OBTAINABLE'
    });
  }
  return out;
}

/** The learner-facing shape. Five sections, always in this order, never skipped. */
export function understandingReport(resolution) {
  return {
    KNOWN: resolution.known.length
      ? resolution.known.map(k => k.conditions?.length ? `${k.statement} (holds when: ${k.conditions.join('; ')})` : k.statement)
      : ['Nothing here is settled enough to state as known.'],
    EVIDENCE: resolution.evidence.map(e =>
      `${e.position}: ${e.independent_lines} independent line(s), best is ${e.best_tier ? EVIDENCE_TIERS[e.best_tier].label : 'nothing'}${e.flags.length ? ` — ${e.flags.join(', ')}` : ''}`),
    CONTESTED: resolution.contested.length
      ? resolution.contested.map(c => `${c.statement} — ${c.standing_note}`)
      : ['No live dispute at this level of detail.'],
    UNKNOWN: resolution.unknown.length
      ? resolution.unknown.map(u => u.what_is_missing
          ? `${u.what_is_missing} — ${UNKNOWN_KINDS[u.kind]}${u.who_was_outside_the_records ? `; outside those records: ${u.who_was_outside_the_records}` : ''}`
          : (u.detail ?? UNKNOWN_KINDS[u.kind]))
      : ['Nothing further is outstanding for this question.'],
    WHAT_WOULD_ANSWER_IT: resolution.what_would_answer_it.map(w => `${w.requirement} [${w.feasibility}] — ${w.detail}`),
    state: resolution.state,
    confidence: resolution.confidence
  };
}
