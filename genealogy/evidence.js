// THYLORA · GENEALOGY EVIDENCE JOURNEY  (THY-WORK-GENEALOGY-EVIDENCE-JOURNEY-587)
//
// The rules the Chairman set, written as code so they cannot quietly lapse:
//
//   1. Source citation for every accepted relationship.
//   2. No random surname matching.
//   3. No race or tribal-citizenship claim from surname or geography alone.
//   4. Prioritise deceased people; treat the possibly-living as private.
//   5. Log negative searches. A search that found nothing is a finding.
//
// A rule enforced by a sentence in a document is a rule that survives until
// someone is in a hurry. These return blockers.

export const EVIDENCE_CLASSES = Object.freeze({
  ORIGINAL_RECORD: 'ORIGINAL_RECORD',           // the register page, the certificate, the manuscript census
  DERIVATIVE_RECORD: 'DERIVATIVE_RECORD',       // a transcription, an index, a typed abstract
  AUTHORED_WORK: 'AUTHORED_WORK',               // a county history, a published genealogy
  INDEX_ENTRY: 'INDEX_ENTRY',                   // a finding aid pointing at a record
  ORAL_HISTORY: 'ORAL_HISTORY',                 // family memory, with a teller
  USER_SUBMITTED_TREE: 'USER_SUBMITTED_TREE'    // never sufficient on its own
});

// Information in the record: who knew it, and were they there?
export const INFORMATION_CLASSES = Object.freeze({
  PRIMARY: 'PRIMARY',       // an informant present at the event
  SECONDARY: 'SECONDARY',   // reported later, or by someone not present
  UNDETERMINED: 'UNDETERMINED'
});

// What the source says about the question you are asking it.
export const EVIDENCE_DIRECTNESS = Object.freeze({
  DIRECT: 'DIRECT',         // answers the question outright
  INDIRECT: 'INDIRECT',     // answers it only in combination with something else
  NEGATIVE: 'NEGATIVE'      // its silence is itself informative
});

export const SOURCES_NEVER_SUFFICIENT_ALONE = Object.freeze([
  EVIDENCE_CLASSES.USER_SUBMITTED_TREE
]);

// Anchors that make a name match a match rather than a coincidence.
export const IDENTITY_ANCHORS = Object.freeze([
  'EXACT_OR_VARIANT_GIVEN_NAME',
  'DATE_WINDOW',
  'COUNTY_OR_STATE',
  'HOUSEHOLD_MEMBER',
  'FAN_NETWORK',          // friends, associates, neighbours
  'OCCUPATION',
  'RECORD_CROSS_REFERENCE'
]);

const MIN_ANCHORS = 2;

function blocker(code, detail, route) { return { code, detail, route }; }

// ---------------------------------------------------------------------------
// Rule 2 - no random surname matching
// ---------------------------------------------------------------------------

export function evaluateIdentityMatch(candidate = {}) {
  const blockers = [];
  const anchors = (candidate.anchors ?? []).filter((a) => IDENTITY_ANCHORS.includes(a));
  const unknown = (candidate.anchors ?? []).filter((a) => !IDENTITY_ANCHORS.includes(a));

  for (const a of unknown) {
    blockers.push(blocker('UNKNOWN_IDENTITY_ANCHOR',
      `"${a}" is not a recognised identity anchor.`,
      `Use one of: ${IDENTITY_ANCHORS.join(', ')}.`));
  }
  if (!candidate.surname_match) {
    blockers.push(blocker('NO_SURNAME_LINK',
      'The candidate does not match on surname or a documented surname variant.',
      'Record the variant, or drop the candidate.'));
  }
  if (anchors.length < MIN_ANCHORS) {
    blockers.push(blocker('SURNAME_ONLY_MATCH',
      `A surname plus ${anchors.length} anchor(s) is a coincidence, not an identification. At least ${MIN_ANCHORS} anchors are required.`,
      'Add a date window, a county, a household member, or a FAN-network tie.'));
  }
  return { accepted: blockers.length === 0, anchors, blockers };
}

// ---------------------------------------------------------------------------
// Rule 3 - no race or tribal-citizenship claim from surname or geography
// ---------------------------------------------------------------------------

export const FORBIDDEN_INFERENCE_BASES = Object.freeze(['SURNAME', 'GEOGRAPHY', 'PHOTOGRAPH', 'FAMILY_ASSUMPTION']);

export function evaluateAncestryOrCitizenshipClaim(claim = {}) {
  const blockers = [];
  const bases = claim.bases ?? [];
  const forbiddenOnly = bases.length > 0 && bases.every((b) => FORBIDDEN_INFERENCE_BASES.includes(b));

  if (bases.length === 0) {
    blockers.push(blocker('NO_BASIS_STATED',
      'The claim states no basis at all.',
      'Name the records the claim rests on, or withdraw it.'));
  } else if (forbiddenOnly) {
    blockers.push(blocker('INFERENCE_FROM_SURNAME_OR_GEOGRAPHY',
      `A claim of descent, race or tribal citizenship cannot rest on ${bases.join(' + ')} alone.`,
      'Tribal citizenship is determined by the nation itself, from its own rolls and its own criteria. Cite an enrolment record, or state the claim as an open question.'));
  }
  if (claim.claim_type === 'TRIBAL_CITIZENSHIP' && !claim.nation_determined) {
    blockers.push(blocker('CITIZENSHIP_NOT_DETERMINED_BY_NATION',
      'Only the nation can determine its own citizenship. This record cannot assert it.',
      'Record it as a family account pending the nation\'s own determination.'));
  }
  return { accepted: blockers.length === 0, blockers };
}

// ---------------------------------------------------------------------------
// Rule 4 - prioritise the deceased; the possibly-living stay private
// ---------------------------------------------------------------------------

export const PRIVACY_HORIZON_YEARS = 100;

export function livingStatus(person = {}, asOfYear = new Date().getUTCFullYear()) {
  if (person.death_year || person.death_record_id) {
    return { state: 'DECEASED', publishable: true, reason: 'A death is documented.' };
  }
  const birth = person.birth_year ?? person.estimated_birth_year;
  if (birth && asOfYear - birth >= PRIVACY_HORIZON_YEARS) {
    return { state: 'PRESUMED_DECEASED', publishable: true, reason: `Born ${birth}, more than ${PRIVACY_HORIZON_YEARS} years ago.` };
  }
  return {
    state: 'POSSIBLY_LIVING',
    publishable: false,
    reason: 'No documented death and inside the privacy horizon. Held private and deprioritised.'
  };
}

export function researchPriority(person, asOfYear) {
  const status = livingStatus(person, asOfYear);
  return status.state === 'POSSIBLY_LIVING' ? 'DEFERRED' : 'ACTIVE';
}

// ---------------------------------------------------------------------------
// Rule 1 - a relationship is accepted only with citations that resolve
// ---------------------------------------------------------------------------

export function validateCitation(citation = {}) {
  const blockers = [];
  for (const field of ['repository', 'collection', 'locator', 'evidence_class', 'information_class', 'directness']) {
    if (!citation[field]) {
      blockers.push(blocker('CITATION_INCOMPLETE', `Citation is missing "${field}".`, `Supply ${field}.`));
    }
  }
  if (citation.evidence_class && !EVIDENCE_CLASSES[citation.evidence_class]) {
    blockers.push(blocker('EVIDENCE_CLASS_UNKNOWN', `"${citation.evidence_class}" is not a recognised evidence class.`,
      `Use one of: ${Object.keys(EVIDENCE_CLASSES).join(', ')}.`));
  }
  if (citation.information_class && !INFORMATION_CLASSES[citation.information_class]) {
    blockers.push(blocker('INFORMATION_CLASS_UNKNOWN', `"${citation.information_class}" is not a recognised information class.`,
      `Use one of: ${Object.keys(INFORMATION_CLASSES).join(', ')}.`));
  }
  if (!citation.retrieved_at) {
    blockers.push(blocker('CITATION_UNDATED', 'A citation with no retrieval date cannot be re-checked.', 'Add retrieved_at.'));
  }
  return { valid: blockers.length === 0, blockers };
}

export function acceptRelationship(assertion = {}) {
  const blockers = [];
  if (!assertion.person_id || !assertion.related_person_id) {
    blockers.push(blocker('PERSON_UNRESOLVED', 'Both people must resolve to person records.', 'Create or link the person records.'));
  }
  if (!assertion.relationship_type) {
    blockers.push(blocker('RELATIONSHIP_TYPE_MISSING', 'No relationship type is stated.', 'Set relationship_type.'));
  }

  const citations = assertion.citations ?? [];
  if (citations.length === 0) {
    blockers.push(blocker('NO_CITATION',
      'No source citation. An uncited relationship is a rumour with a line drawn under it.',
      'Cite at least one source that speaks to this relationship.'));
  }
  citations.forEach((c, i) => {
    const r = validateCitation(c);
    for (const b of r.blockers) blockers.push({ ...b, detail: `citation[${i}]: ${b.detail}` });
  });

  const usable = citations.filter((c) => !SOURCES_NEVER_SUFFICIENT_ALONE.includes(c.evidence_class));
  if (citations.length > 0 && usable.length === 0) {
    blockers.push(blocker('TREE_ONLY_EVIDENCE',
      'Every citation is a user-submitted tree. That points at a claim, not at a record.',
      'Follow the tree back to the record it cites, and cite that.'));
  }

  const direct = usable.filter((c) => c.directness === EVIDENCE_DIRECTNESS.DIRECT);
  const indirect = usable.filter((c) => c.directness === EVIDENCE_DIRECTNESS.INDIRECT);
  if (usable.length > 0 && direct.length === 0 && indirect.length < 2) {
    blockers.push(blocker('INDIRECT_EVIDENCE_INSUFFICIENT',
      'No direct evidence, and fewer than two independent indirect sources.',
      'Add a direct record, or a second independent indirect source, and write the reasoning out.'));
  }
  if (direct.length === 0 && indirect.length >= 2 && !assertion.reasoning) {
    blockers.push(blocker('REASONING_NOT_WRITTEN',
      'A conclusion built from indirect evidence must show its working.',
      'Write assertion.reasoning: what each source contributes and why together they settle it.'));
  }
  if ((assertion.conflicts ?? []).length > 0 && !assertion.conflict_resolution) {
    blockers.push(blocker('CONFLICT_UNRESOLVED',
      `${assertion.conflicts.length} conflicting item(s) recorded with no resolution.`,
      'Explain which source is preferred and why, or leave the relationship unaccepted.'));
  }

  const confidence = blockers.length > 0 ? 'NOT_ACCEPTED'
    : direct.length >= 2 ? 'ESTABLISHED'
    : direct.length === 1 ? 'SUPPORTED'
    : 'REASONED';

  return { accepted: blockers.length === 0, confidence, blockers };
}

// ---------------------------------------------------------------------------
// Rule 5 - a search that found nothing is a finding
// ---------------------------------------------------------------------------

export const SEARCH_RESULTS = Object.freeze(['HIT', 'NEGATIVE', 'UNREACHABLE', 'INSUFFICIENT_INPUT']);

export function validateSearchLogEntry(entry = {}) {
  const blockers = [];
  for (const field of ['search_id', 'searched_at', 'repository', 'query', 'result']) {
    if (!entry[field]) blockers.push(blocker('SEARCH_LOG_INCOMPLETE', `Missing "${field}".`, `Supply ${field}.`));
  }
  if (entry.result && !SEARCH_RESULTS.includes(entry.result)) {
    blockers.push(blocker('SEARCH_RESULT_UNKNOWN', `"${entry.result}" is not a recognised result.`,
      `Use one of: ${SEARCH_RESULTS.join(', ')}.`));
  }
  // A negative is only informative if you say what it covered.
  if (entry.result === 'NEGATIVE' && !entry.coverage) {
    blockers.push(blocker('NEGATIVE_WITHOUT_COVERAGE',
      'A negative search without a coverage statement proves nothing - it may simply have looked in the wrong place.',
      'State what the search covered: which years, which county, which collection, and what it could not reach.'));
  }
  if (entry.result === 'UNREACHABLE' && !entry.obstacle) {
    blockers.push(blocker('UNREACHABLE_WITHOUT_OBSTACLE',
      'An unreachable repository must name the obstacle so the next session knows what to fix.',
      'State the obstacle: paywall, login, egress block, offline holding.'));
  }
  return { valid: blockers.length === 0, blockers };
}

export function searchLogSummary(entries = []) {
  const tally = { HIT: 0, NEGATIVE: 0, UNREACHABLE: 0, INSUFFICIENT_INPUT: 0 };
  for (const e of entries) if (tally[e.result] !== undefined) tally[e.result] += 1;
  return { total: entries.length, ...tally };
}
