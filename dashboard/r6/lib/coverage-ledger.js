// THYLORA Dashboard R6 · Prompt Coverage Ledger
// Canonical backend record: THY-IDEA-PROMPT-COVERAGE-LEDGER-001
//
// The Chairman's complaint this ledger answers: a prompt carries eight things,
// the answer covers five, and the other three vanish without anyone saying they
// were dropped. Nobody lied — the items just stopped existing.
//
// So substantive prompts are atomized on arrival, and from that moment every
// atom has to end somewhere visible:
//
//   ANSWERED              a question was asked and it was answered
//   EXECUTED              work was asked for and the work was done
//   REGISTERED            it was recorded into a backend record as an idea,
//                         decision or instruction to act on later
//   DEFERRED_WITH_REASON  it is not being done now, and the reason is stated
//   UNKNOWN               not yet resolved — the only state that blocks completion
//
// DEFERRED_WITH_REASON cannot be set without a reason. That is the whole point
// of the state: deferral is allowed, silent deferral is not.
//
// `completionGate` is the enforcement. A run cannot be called complete while an
// atom sits at UNKNOWN, and it cannot be called complete if an atom that existed
// in an earlier reading of the ledger is missing from the current one. An atom
// that disappears is a harder failure than an atom that is unresolved, because
// an unresolved atom is at least still visible.

export const ATOM_STATES = Object.freeze({
  ANSWERED: 'ANSWERED',
  EXECUTED: 'EXECUTED',
  REGISTERED: 'REGISTERED',
  DEFERRED_WITH_REASON: 'DEFERRED_WITH_REASON',
  UNKNOWN: 'UNKNOWN'
});

export const RESOLVED_STATES = Object.freeze([
  ATOM_STATES.ANSWERED, ATOM_STATES.EXECUTED,
  ATOM_STATES.REGISTERED, ATOM_STATES.DEFERRED_WITH_REASON
]);

export const FAILURES = Object.freeze({
  ATOM_DISAPPEARED: 'ATOM_DISAPPEARED',
  ATOM_UNRESOLVED: 'ATOM_UNRESOLVED',
  ATOM_MUTATED: 'ATOM_MUTATED',
  DEFERRAL_WITHOUT_REASON: 'DEFERRAL_WITHOUT_REASON'
});

/**
 * Lines that carry no instruction and no question. Atomizing these would bury
 * the real atoms in noise, which defeats the ledger as surely as dropping them.
 */
const NON_SUBSTANTIVE = /^(ok(ay)?|thanks?|thank you|got it|understood|yes|no|good|fine|noted|proceed|continue|go ahead|perfect|great)[.!]?$/i;

/** Enumerated or bulleted lines are already atoms; the Chairman wrote them as a list. */
const LIST_MARKER = /^\s*(?:(\d+)[.)]\s+|[-*•]\s+|[A-Z][.)]\s+)/;

/** A heading like "BUILD:" or "LANE: ..." frames the atoms under it. */
const HEADING = /^\s*([A-Z][A-Z0-9 _/&-]{2,}):\s*(.*)$/;

const SENTENCE_SPLIT = /(?<=[.!?])\s+(?=[A-Z0-9])/;

let counter = 0;

export function atomId(promptId, ordinal) {
  counter += 1;
  return `${promptId || 'THY-PROMPT'}-A${String(ordinal).padStart(3, '0')}-${counter.toString(36).toUpperCase()}`;
}

/**
 * Decide whether a fragment is substantive enough to be held to account.
 * Anything that asks, instructs, constrains or names a deliverable is.
 */
export function isSubstantive(fragment) {
  const line = String(fragment ?? '').trim();
  if (line.length < 3) return false;
  if (NON_SUBSTANTIVE.test(line)) return false;
  if (/^[^a-z0-9]+$/i.test(line)) return false;   // rules, dividers, punctuation
  return true;
}

/**
 * Atomize a Chairman prompt.
 *
 * Structure the Chairman already imposed is respected: numbered and bulleted
 * items become one atom each, and a heading above them is carried onto each
 * atom as its section, so "3. During readback..." keeps its place under "BUILD".
 * Unstructured paragraphs are split by sentence, because in this Chairman's
 * prompts a sentence is reliably one instruction.
 *
 * Sub-points indented under a numbered item become their own atoms too. That is
 * deliberate: "duck readback audio while Chairman speaks" is a separate
 * deliverable from "timestamp the note", and merging them is exactly how one of
 * them would later go missing.
 */
export function atomizePrompt(text, { promptId = null, capturedAt = Date.now() } = {}) {
  const source = String(text ?? '');
  const lines = source.split(/\r?\n/);
  const atoms = [];
  let section = null;
  let parent = null;

  const push = (fragment, { indent = 0, lineNo = 0 } = {}) => {
    if (!isSubstantive(fragment)) return;
    const ordinal = atoms.length + 1;
    atoms.push({
      atom_id: atomId(promptId, ordinal),
      prompt_id: promptId,
      ordinal,
      text: fragment.trim(),
      section,
      parent_ordinal: indent > 0 ? parent : null,
      source_line: lineNo,
      state: ATOM_STATES.UNKNOWN,
      reason: null,
      evidence: null,
      resolved_at: null,
      created_at: new Date(capturedAt).toISOString()
    });
    if (indent === 0) parent = ordinal;
  };

  lines.forEach((raw, i) => {
    const line = raw.replace(/\s+$/, '');
    if (!line.trim()) return;

    const heading = HEADING.exec(line);
    if (heading && !LIST_MARKER.test(line)) {
      section = heading[1].trim();
      if (heading[2] && isSubstantive(heading[2])) push(heading[2], { lineNo: i + 1 });
      return;
    }

    const indent = /^\s{2,}|^\t/.test(raw) ? 1 : 0;
    const marked = LIST_MARKER.exec(line);
    if (marked) {
      push(line.replace(LIST_MARKER, ''), { indent, lineNo: i + 1 });
      return;
    }

    // Unstructured prose: one atom per sentence.
    const body = line.trim();
    const sentences = body.split(SENTENCE_SPLIT);
    sentences.forEach(s => push(s, { indent, lineNo: i + 1 }));
  });

  return {
    prompt_id: promptId,
    captured_at: new Date(capturedAt).toISOString(),
    source_text: source,
    source_checksum: checksum(source),
    atoms
  };
}

/**
 * A cheap, stable content checksum. Not cryptographic — its job is to notice
 * that the text behind an atom changed, which is a mutation the ledger must
 * refuse just as firmly as a disappearance.
 */
export function checksum(text) {
  const s = String(text ?? '');
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 0x01000193) >>> 0;
    h2 = Math.imul(h2 + c + i, 0x85ebca6b) >>> 0;
  }
  return `${h1.toString(16).padStart(8, '0')}${h2.toString(16).padStart(8, '0')}`;
}

/**
 * Resolve an atom. Returns a new ledger; the input is not modified.
 * A deferral without a stated reason is refused outright.
 */
export function resolveAtom(ledger, targetAtomId, state, { reason = null, evidence = null, at = Date.now() } = {}) {
  if (!RESOLVED_STATES.includes(state) && state !== ATOM_STATES.UNKNOWN) {
    throw new Error(`Unknown coverage state: ${state}`);
  }
  if (state === ATOM_STATES.DEFERRED_WITH_REASON && !String(reason || '').trim()) {
    const err = new Error('DEFERRED_WITH_REASON requires a stated reason.');
    err.code = FAILURES.DEFERRAL_WITHOUT_REASON;
    throw err;
  }
  let found = false;
  const atoms = ledger.atoms.map(a => {
    if (a.atom_id !== targetAtomId) return a;
    found = true;
    return {
      ...a, state,
      reason: reason ? String(reason).trim() : null,
      evidence: evidence ?? null,
      resolved_at: state === ATOM_STATES.UNKNOWN ? null : new Date(at).toISOString()
    };
  });
  if (!found) throw new Error(`Cannot resolve unknown atom ${targetAtomId}`);
  return { ...ledger, atoms };
}

/** What the coverage panel shows the Chairman. */
export function coverage(ledger) {
  const atoms = ledger?.atoms || [];
  const by = state => atoms.filter(a => a.state === state);
  const unresolved = by(ATOM_STATES.UNKNOWN);
  return {
    total: atoms.length,
    answered: by(ATOM_STATES.ANSWERED).length,
    executed: by(ATOM_STATES.EXECUTED).length,
    registered: by(ATOM_STATES.REGISTERED).length,
    deferred: by(ATOM_STATES.DEFERRED_WITH_REASON).length,
    unknown: unresolved.length,
    resolved: atoms.length - unresolved.length,
    percent: atoms.length ? Math.round(((atoms.length - unresolved.length) / atoms.length) * 1000) / 10 : 0,
    unresolved_atoms: unresolved.map(a => ({ atom_id: a.atom_id, ordinal: a.ordinal, text: a.text }))
  };
}

/**
 * Compare a later reading of the ledger against an earlier one.
 *
 * This is the check that catches the failure the Chairman named. An atom that
 * was in the ledger and is no longer there has not been deferred, answered or
 * declined — it has disappeared, and no one was told. That is reported as a
 * violation, with the atom's own text, so what went missing can be read back.
 */
export function verifyContinuity(previousLedger, currentLedger) {
  const before = previousLedger?.atoms || [];
  const after = currentLedger?.atoms || [];
  const afterById = new Map(after.map(a => [a.atom_id, a]));

  const missing = before
    .filter(a => !afterById.has(a.atom_id))
    .map(a => ({ atom_id: a.atom_id, ordinal: a.ordinal, text: a.text, last_state: a.state }));

  const mutated = before
    .filter(a => afterById.has(a.atom_id) && afterById.get(a.atom_id).text !== a.text)
    .map(a => ({ atom_id: a.atom_id, was: a.text, now: afterById.get(a.atom_id).text }));

  const violations = [];
  if (missing.length) violations.push({ failure: FAILURES.ATOM_DISAPPEARED, atoms: missing });
  if (mutated.length) violations.push({ failure: FAILURES.ATOM_MUTATED, atoms: mutated });

  return {
    ok: violations.length === 0,
    missing,
    mutated,
    added: after.filter(a => !before.some(b => b.atom_id === a.atom_id)).length,
    violations
  };
}

/**
 * The completion gate.
 *
 * Nothing in this lane may be reported complete unless this returns complete.
 * It refuses on an unresolved atom and refuses harder on a disappeared one.
 */
export function completionGate(ledger, { previous = null } = {}) {
  const cov = coverage(ledger);
  const blockers = [];

  if (previous) {
    const continuity = verifyContinuity(previous, ledger);
    for (const violation of continuity.violations) {
      blockers.push({
        failure: violation.failure,
        detail: violation.failure === FAILURES.ATOM_DISAPPEARED
          ? `${violation.atoms.length} atom(s) present earlier are missing from the ledger now.`
          : `${violation.atoms.length} atom(s) changed text after being recorded.`,
        atoms: violation.atoms
      });
    }
  }

  if (cov.unknown > 0) {
    blockers.push({
      failure: FAILURES.ATOM_UNRESOLVED,
      detail: `${cov.unknown} atom(s) still at UNKNOWN. Every atom must resolve to ANSWERED, EXECUTED, REGISTERED or DEFERRED_WITH_REASON.`,
      atoms: cov.unresolved_atoms
    });
  }

  return {
    complete: blockers.length === 0,
    coverage: cov,
    blockers,
    statement: blockers.length === 0
      ? `Coverage complete: ${cov.total}/${cov.total} atoms resolved.`
      : `Completion refused: ${blockers.map(b => b.failure).join(', ')}.`
  };
}

/** Restore a ledger read back from storage, keeping its atom identities. */
export function reviveLedger(raw) {
  if (!raw || !Array.isArray(raw.atoms)) return null;
  return { ...raw, atoms: raw.atoms.map(a => ({ ...a })) };
}
