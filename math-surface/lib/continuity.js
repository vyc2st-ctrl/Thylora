// THYLORA · continuity, voice and protected-name protocols
// Workroom: WR-MATH-SURFACE-001
//
// Three standing protocols, written as executable checks rather than as
// paragraphs somebody is trusted to remember:
//
//   THY-CONTINUITY-WATCHDOG-001              no active workstream is dropped at a restart
//   THY-VOICE-PROMPT-NO-SILENT-MUTATION-001  spoken and prompt text cannot change unannounced
//   THY-MINOR-NAME-ADULT-USE-001             a protected name is not worn by a child
//
// A protocol that only exists as prose is a protocol that survives exactly as
// long as the person who remembers it. These run in the test suite.

// ---------------------------------------------------------------------------
// Shared: a small deterministic digest. No dependency, no crypto import, and
// the same input always produces the same value on every machine.
// ---------------------------------------------------------------------------

export function digest(text) {
  const s = String(text ?? '');
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

// ---------------------------------------------------------------------------
// THY-CONTINUITY-WATCHDOG-001
//
// Every lane that was running at the restart point is named here. A later
// delta may add lanes. It may not quietly stop carrying one. "I was working on
// the mathematics surface" is not a reason for the RAE Link lane to vanish
// from the manifest.
// ---------------------------------------------------------------------------

export const CONTINUITY_WATCHDOG = 'THY-CONTINUITY-WATCHDOG-001';

export const ACTIVE_WORKSTREAMS = Object.freeze([
  Object.freeze({ id: 'WS-DASHBOARD-AUTHORITY', label: 'Chairman dashboard authority', state: 'CARRIED_UNTOUCHED', held_by: 'DASHBOARD_AUTHORITY.md · dashboard-baseline.json', note: 'Authority remains vyc2st-ctrl/thylora-executive-dashboard → thylora-public-world. This delta does not touch dashboard-current-head.html.' }),
  Object.freeze({ id: 'WS-APP-BUILD7', label: 'THYLORA member app, Build 7 command rooms', state: 'CARRIED_ADDITIVE', held_by: 'app/', note: 'One navigation entry added. No existing view, script or cache rule changed.' }),
  Object.freeze({ id: 'WS-PUBLIC-SITE', label: 'THYLORA public site and storefront', state: 'CARRIED_UNTOUCHED', held_by: 'public-site/', note: 'Store product candidates from this lane are candidates only; nothing is listed.' }),
  Object.freeze({ id: 'WS-RAELINK', label: 'RAE Link owned media network', state: 'CARRIED_UNTOUCHED', held_by: 'rae-link/ · db/rae-link/ · WR-RAELINK-001', note: '48 existing tests continue to pass unchanged.' }),
  Object.freeze({ id: 'WS-TIME-RUN', label: 'Time Run room', state: 'CARRIED_UNTOUCHED', held_by: 'app/time-run.*' }),
  Object.freeze({ id: 'WS-GAME-BET', label: 'GAME-BET-001 sportsbook and casino workroom', state: 'CARRIED_UNTOUCHED', held_by: 'app/sports-betting.*' }),
  Object.freeze({ id: 'WS-SPINE-VOICE', label: 'SPINE FORWARD voice command spine', state: 'CARRIED_UNDER_PROTOCOL', held_by: 'app/index.html · .github/workflows/spine-forward-both.yml', note: 'Voice text governed by THY-VOICE-PROMPT-NO-SILENT-MUTATION-001; untouched by this delta.' }),
  Object.freeze({ id: 'WS-FAMILY-STORY', label: 'Family Story archive and Story Studio', state: 'CARRIED_UNTOUCHED', held_by: 'app/index.html · db/rae-link/0007_family_partnership.sql' }),
  Object.freeze({ id: 'WS-MATH-SURFACE', label: 'THYLORA mathematics surface layer (L × M × S)', state: 'OPENED', held_by: 'math-surface/ · db/math-surface/ · WR-MATH-SURFACE-001', note: 'Opened by this delta.' })
]);

/** The manifest as it stood at the restart point: everything except the lane this delta opened. */
export const RESTART_POINT = Object.freeze({
  id: 'THY-RESTART-20260918-MATH-SURFACE',
  workstreams: Object.freeze(ACTIVE_WORKSTREAMS.filter(w => w.state !== 'OPENED').map(w => w.id))
});

/**
 * Compare a previous manifest of workstream ids against a current one.
 * Dropping is the failure. Adding is fine. Carrying is the point.
 */
export function checkContinuity(previous = [], current = []) {
  const before = new Set(previous);
  const after = new Set(current);
  const dropped = [...before].filter(id => !after.has(id)).sort();
  const added = [...after].filter(id => !before.has(id)).sort();
  const carried = [...before].filter(id => after.has(id)).sort();
  return Object.freeze({
    protocol: CONTINUITY_WATCHDOG,
    ok: dropped.length === 0,
    carried: Object.freeze(carried),
    added: Object.freeze(added),
    dropped: Object.freeze(dropped),
    statement: dropped.length === 0
      ? `${carried.length} workstream(s) carried, ${added.length} opened, none dropped.`
      : `DROPPED: ${dropped.join(', ')}. A workstream may be closed deliberately and said so. It may not disappear.`
  });
}

export function assertContinuity(previous, current) {
  const result = checkContinuity(previous, current);
  if (!result.ok) {
    const error = new Error(`${CONTINUITY_WATCHDOG}: ${result.statement}`);
    error.name = 'ContinuityWatchdogError';
    error.dropped = result.dropped;
    throw error;
  }
  return result;
}

// ---------------------------------------------------------------------------
// THY-VOICE-PROMPT-NO-SILENT-MUTATION-001
//
// Anything the system says aloud to a child, or prompts a child with, is
// registered with its text and digest. Changing the words is allowed. Changing
// them without a declaration is not — because a spoken line is the one part of
// the system nobody diffs.
// ---------------------------------------------------------------------------

export const VOICE_PROTOCOL = 'THY-VOICE-PROMPT-NO-SILENT-MUTATION-001';

function line(id, role, text) {
  return Object.freeze({ id, role, text, digest: digest(text) });
}

/**
 * The child-facing spoken and prompt lines of the mathematics surface.
 * The learner surface reads these; it does not restate them. One source.
 */
export const VOICE_LINES = Object.freeze([
  line('VX-L-ASK', 'learner', 'First, just the sentence. What is this telling us, and what is it asking for? Do not work anything out yet.'),
  line('VX-M-ASK', 'learner', 'Now the relationship. Here are the numbers, already found for you. Which one of these is happening to them?'),
  line('VX-S-ASK', 'learner', 'Now just the working. No story, no words. Only the numbers.'),
  line('VX-EXPLAIN-ASK', 'learner', 'Last part. Tell me what your answer means in the story, in your own words. Not how you got it — what it means.'),
  line('VX-L-ZERO', 'learner', 'That sentence was doing the blocking, not you. We have not found out anything about your mathematics yet, so we are going to look at that next, with the words taken off.'),
  line('VX-M-HELD', 'learner', 'You had the relationship right. The sentence was in the way. Those are two different things and we keep them apart here.'),
  line('VX-UNMEASURED', 'learner', 'We have not checked that part yet, so we are not going to say anything about it.'),
  line('VX-CARD-EARNED', 'learner', 'Understanding Card. It records what we actually watched you do, and it says plainly what we did not check.'),
  line('VX-FAMILY-OPEN', 'family', 'A wrong answer on a word problem has at least three possible causes, and they need completely different help. This page shows you which one it was.'),
  line('VX-TEACHER-REFUSAL', 'teacher', 'This learner has no isolated measurement of the relationship layer. No statement about their mathematics is available from this sitting.')
]);

export function voiceLine(id) {
  return VOICE_LINES.find(l => l.id === id) ?? null;
}

/**
 * Diff two registries of voice lines by id.
 * A change in text is a mutation; a missing id is a removal; both need declaring.
 */
export function diffVoiceLines(before = [], after = []) {
  const beforeById = new Map(before.map(l => [l.id, l]));
  const afterById = new Map(after.map(l => [l.id, l]));
  const mutations = [];
  for (const [id, b] of beforeById) {
    const a = afterById.get(id);
    if (!a) { mutations.push({ id, kind: 'REMOVED', from: b.text, to: null }); continue; }
    if (digest(a.text) !== digest(b.text)) mutations.push({ id, kind: 'CHANGED', from: b.text, to: a.text });
  }
  for (const [id, a] of afterById) {
    if (!beforeById.has(id)) mutations.push({ id, kind: 'ADDED', from: null, to: a.text });
  }
  return mutations;
}

/**
 * A declaration is {id, kind, reason, declared_by}. Every mutation must have one.
 * An undeclared mutation is a protocol violation, reported by id and by text so
 * the change is visible rather than merely flagged.
 */
export function checkVoiceMutations(before, after, declarations = []) {
  const declared = new Map(declarations.map(d => [`${d.id}:${d.kind}`, d]));
  const mutations = diffVoiceLines(before, after);
  const undeclared = mutations.filter(m => !declared.has(`${m.id}:${m.kind}`));
  return Object.freeze({
    protocol: VOICE_PROTOCOL,
    ok: undeclared.length === 0,
    mutations: Object.freeze(mutations),
    undeclared: Object.freeze(undeclared),
    statement: undeclared.length === 0
      ? `${mutations.length} voice change(s), all declared.`
      : `${undeclared.length} undeclared voice change(s): ${undeclared.map(m => m.id).join(', ')}.`
  });
}

export function assertNoSilentMutation(before, after, declarations = []) {
  const result = checkVoiceMutations(before, after, declarations);
  if (!result.ok) {
    const error = new Error(`${VOICE_PROTOCOL}: ${result.statement}`);
    error.name = 'SilentMutationError';
    error.undeclared = result.undeclared;
    throw error;
  }
  return result;
}

/** Verify a rendered surface still carries a registered line verbatim. */
export function surfaceCarriesLine(surfaceText, id) {
  const registered = voiceLine(id);
  if (!registered) return Object.freeze({ id, ok: false, reason: 'UNREGISTERED_LINE' });
  const present = String(surfaceText ?? '').includes(registered.text);
  return Object.freeze({
    id, ok: present,
    reason: present ? 'VERBATIM' : 'SURFACE_TEXT_DIFFERS_FROM_REGISTRY',
    expected: registered.text
  });
}

// ---------------------------------------------------------------------------
// THY-MINOR-NAME-ADULT-USE-001
//
// A protected name is reserved for adult use. It is not given to a child in a
// story, a worked example, a probe, a card or a product candidate. The check is
// mechanical and runs over every piece of learner-facing text this lane ships.
// ---------------------------------------------------------------------------

export const MINOR_NAME_PROTOCOL = 'THY-MINOR-NAME-ADULT-USE-001';

export const PROTECTED_NAMES = Object.freeze(['Daniel']);

export const ADULT_AGE = 18;

/** Find protected names in a piece of text, matched on whole words only. */
export function scanForProtectedNames(text) {
  const s = String(text ?? '');
  const hits = [];
  for (const name of PROTECTED_NAMES) {
    const pattern = new RegExp(`\\b${name}(?:'s)?\\b`, 'gi');
    let match;
    while ((match = pattern.exec(s)) !== null) {
      hits.push({ name, at: match.index, matched: match[0] });
    }
  }
  return hits.sort((a, b) => a.at - b.at);
}

/**
 * Check one piece of content.
 *
 * `people` describes who appears, e.g. [{ name: 'Amara', age: 9 }]. A protected
 * name is permitted only when the content declares an adult bearer of that name
 * (age ≥ 18) and marks the usage as adult use.
 */
export function checkMinorNameRule({ id = null, text = '', people = [], adult_use = null } = {}) {
  const hits = scanForProtectedNames(text);
  const minors = people.filter(p => typeof p.age === 'number' && p.age < ADULT_AGE);
  const minorUsingProtected = minors.filter(p => PROTECTED_NAMES.some(n => n.toLowerCase() === String(p.name ?? '').toLowerCase()));

  const violations = [];
  if (minorUsingProtected.length > 0) {
    for (const p of minorUsingProtected) {
      violations.push({ kind: 'PROTECTED_NAME_ON_MINOR', name: p.name, age: p.age });
    }
  }
  if (hits.length > 0) {
    const declared = adult_use && adult_use.declared === true && Number(adult_use.age) >= ADULT_AGE
      && PROTECTED_NAMES.some(n => n.toLowerCase() === String(adult_use.name ?? '').toLowerCase());
    if (!declared) {
      violations.push({
        kind: 'PROTECTED_NAME_WITHOUT_DECLARED_ADULT_USE',
        occurrences: hits.length,
        names: [...new Set(hits.map(h => h.name))]
      });
    }
  }

  return Object.freeze({
    protocol: MINOR_NAME_PROTOCOL,
    id,
    ok: violations.length === 0,
    occurrences: Object.freeze(hits),
    violations: Object.freeze(violations),
    statement: violations.length === 0
      ? 'No protected name is carried by a person under 18.'
      : `${violations.length} violation(s): a protected name may only appear as declared adult use (age ≥ ${ADULT_AGE}).`
  });
}

/** Run the rule across many content items at once. */
export function checkMinorNameRuleAcross(items = []) {
  const results = items.map(checkMinorNameRule);
  const failing = results.filter(r => !r.ok);
  return Object.freeze({
    protocol: MINOR_NAME_PROTOCOL,
    ok: failing.length === 0,
    checked: results.length,
    failing: Object.freeze(failing),
    statement: failing.length === 0
      ? `${results.length} item(s) checked, no protected name on a minor.`
      : `${failing.length} of ${results.length} item(s) violate ${MINOR_NAME_PROTOCOL}.`
  });
}

export function assertMinorNameRule(items) {
  const result = checkMinorNameRuleAcross(Array.isArray(items) ? items : [items]);
  if (!result.ok) {
    const error = new Error(`${MINOR_NAME_PROTOCOL}: ${result.statement}`);
    error.name = 'ProtectedNameError';
    error.failing = result.failing;
    throw error;
  }
  return result;
}

export const PROTOCOLS = Object.freeze([
  Object.freeze({ id: CONTINUITY_WATCHDOG, subject: 'Active parallel workstreams', check: 'checkContinuity' }),
  Object.freeze({ id: VOICE_PROTOCOL, subject: 'Spoken and prompt text', check: 'checkVoiceMutations' }),
  Object.freeze({ id: MINOR_NAME_PROTOCOL, subject: 'Protected names in story and person examples', check: 'checkMinorNameRule' })
]);
