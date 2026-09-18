// THYLORA CONTINUITY WATCHDOG · THY-CONTINUITY-WATCHDOG-001
//
//   D = max_i | F_i(current) - F_i(controlling) |
//   unauthorized D > 0  =>  HOLD + ALERT
//
// Two gates around every task:
//
//   PRE   compile the controlling facts relevant to the task, seal them, and
//         refuse to start if the controlling set already contradicts itself.
//   POST  compare produced state against that sealed brief, classify every
//         field, and refuse to proceed on any hard-watch breach.
//
// Distance is defined per field, not per character:
//
//   d(field) = 0  for UNCHANGED, ADVANCED, EXPLICITLY_SUPERSEDED
//   d(field) = 1  for DRIFTED, MISSING, CONFLICTING
//
// so D > 0 is exactly "something moved and nothing authorized it". Numeric
// fields also carry the raw magnitude, which is reported but never used to
// soften the verdict: a price that drifts by one cent holds the same as one
// that drifts by a thousand.
//
// This file is the executable rule. db/continuity/0002_watchdog_functions.sql
// is the same rule inside the backend, so a direct write is checked too.

import { BREACH, FIELDS, fieldSpec, hardWatchKeys } from './fields.mjs';
import {
  digest, isAbsent, normalizeByKind, normalizeScalar, setDelta, stableStringify
} from './normalize.mjs';

const DAY_MS = 86_400_000;

// ---------------------------------------------------------------------------
// PRE
// ---------------------------------------------------------------------------

/**
 * Compile the controlling facts relevant to a task.
 *
 * Only facts that are still current count as controlling: a fact carrying
 * superseded_by has been replaced and is history, which is read but never
 * rewritten. Two current facts that disagree with each other are a conflict in
 * the controlling set itself, and that is caught here rather than after work.
 */
export function compileControlling(task, { facts = [], supersessions = [], extraFields = {} } = {}) {
  const resolve = key => fieldSpec(key) ?? extraFields[key] ?? null;
  const wanted = task.fields?.length
    ? task.fields
    : [...hardWatchKeys(), ...Object.keys(extraFields)];
  const subjects = subjectIndex(task);
  const entries = [];
  const conflicts = [];
  const grouped = new Map();

  for (const fact of facts) {
    if (fact.superseded_by) continue;
    if (!wanted.includes(fact.field_key)) continue;
    const ref = subjectKey(fact);
    if (subjects.size && !subjects.has(ref)) continue;
    if (!resolve(fact.field_key)) continue;
    const slot = `${ref}::${fact.field_key}`;
    if (!grouped.has(slot)) grouped.set(slot, []);
    grouped.get(slot).push(fact);
  }

  for (const [slot, group] of [...grouped.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    const spec = resolve(group[0].field_key);
    const values = new Map();
    for (const fact of group) {
      values.set(stableStringify(normalizeByKind(spec.kind, fact.value)), fact);
    }
    const winner = [...group].sort(bySequence).at(-1);
    const entry = {
      subject_kind: winner.subject_kind ?? null,
      subject_ref: winner.subject_ref ?? null,
      field_key: winner.field_key,
      value: winner.value,
      kind: spec.kind,
      normalized: normalizeByKind(spec.kind, winner.value),
      sequence_no: winner.sequence_no ?? null,
      recorded_at: winner.recorded_at ?? null,
      authority_ref: winner.authority_ref ?? null,
      hard_watch: spec.hard_watch,
      conflicting: values.size > 1
    };
    if (values.size > 1) {
      entry.conflict_values = [...values.values()].map(fact => ({
        value: fact.value,
        sequence_no: fact.sequence_no ?? null,
        recorded_at: fact.recorded_at ?? null
      }));
      conflicts.push({
        slot,
        subject_kind: entry.subject_kind,
        subject_ref: entry.subject_ref,
        field_key: entry.field_key,
        hard_watch: spec.hard_watch !== false,
        detail: `${values.size} current controlling facts disagree for this field.`,
        values: entry.conflict_values
      });
    }
    entries.push(entry);
  }

  return { entries, conflicts, supersessions: supersessions.slice() };
}

/**
 * PRE gate. Returns a sealed brief. POST compares against this and nothing else,
 * so a controlling fact that changes mid-task cannot quietly move the target.
 */
export function preTask(task, sources = {}) {
  if (!task?.task_ref) throw new Error('CONTINUITY_TASK_REF_REQUIRED');
  const { entries, conflicts, supersessions } = compileControlling(task, sources);
  const brief = {
    task_ref: task.task_ref,
    phase: 'PRE',
    sequence_no: task.sequence_no ?? null,
    compiled_at: task.now ?? new Date().toISOString(),
    field_count: entries.length,
    entries,
    supersessions,
    conflicts,
    authorities: [...new Set(sources.authorities ?? [])].sort(),
    authorities_supplied: Array.isArray(sources.authorities),
    extra_fields: sources.extraFields ?? {},
    proceed_allowed: conflicts.length === 0,
    D: conflicts.length ? 1 : 0
  };
  brief.brief_digest = digest({
    task_ref: brief.task_ref,
    entries: entries.map(e => [e.subject_ref, e.field_key, e.normalized])
  });
  brief.alert = conflicts.length
    ? alertRecord({
      task_ref: brief.task_ref,
      phase: 'PRE',
      sequence_no: brief.sequence_no,
      checked_at: brief.compiled_at,
      D: 1,
      proceed_allowed: false,
      brief_digest: brief.brief_digest,
      produced_digest: null,
      field_count: entries.length,
      findings: conflicts.map(c => ({
        subject_kind: c.subject_kind,
        subject_ref: c.subject_ref,
        field_key: c.field_key,
        classification: 'CONFLICTING',
        d: 1,
        magnitude: 1,
        hard_watch: c.hard_watch !== false,
        controlling: c.values.map(v => v.value),
        current: null,
        detail: c.detail
      }))
    })
    : null;
  return brief;
}

// ---------------------------------------------------------------------------
// POST
// ---------------------------------------------------------------------------

/**
 * POST gate. Compare produced state against the sealed brief.
 *
 * `produced` may be given as { subject_ref: { field_key: value } }, as a flat
 * { field_key: value } when the task has one subject, or as a list of
 * { subject_ref, field_key, value } rows. A field the task never touched is
 * read from the brief as unchanged only if the produced state omits the whole
 * subject; an omitted field inside a present subject is MISSING, because that
 * is exactly how continuity is lost in practice.
 */
export function postTask(brief, produced, options = {}) {
  if (!brief?.brief_digest) throw new Error('CONTINUITY_BRIEF_REQUIRED');
  const now = options.now ?? new Date().toISOString();
  const lookup = indexProduced(produced);
  const authorities = new Set(options.authorities ?? brief.authorities ?? []);
  const authoritiesSupplied = options.authorities
    ? true
    : Boolean(brief.authorities_supplied);
  const findings = [];

  for (const entry of brief.entries) {
    const spec = fieldSpec(entry.field_key)
      ?? options.extraFields?.[entry.field_key]
      ?? brief.extra_fields?.[entry.field_key];
    if (!spec) continue;
    const read = lookup.read(entry.subject_ref, entry.field_key);
    const finding = classifyField(spec, entry, read, {
      now,
      authorities,
      authoritiesSupplied,
      supersessions: brief.supersessions,
      subjectPresent: lookup.hasSubject(entry.subject_ref)
    });
    findings.push(finding);
  }

  const breaches = findings.filter(finding => BREACH.includes(finding.classification));
  const hardBreaches = breaches.filter(finding => finding.hard_watch);
  const D = findings.reduce((max, finding) => Math.max(max, finding.d), 0);

  const check = {
    task_ref: brief.task_ref,
    phase: 'POST',
    sequence_no: brief.sequence_no,
    checked_at: now,
    brief_digest: brief.brief_digest,
    produced_digest: digest(lookup.snapshot),
    field_count: findings.length,
    D,
    proceed_allowed: hardBreaches.length === 0,
    findings,
    breaches,
    hard_breach_count: hardBreaches.length,
    soft_breach_count: breaches.length - hardBreaches.length
  };
  check.alert = breaches.length ? alertRecord(check) : null;
  return check;
}

/**
 * Classify one field against its controlling fact.
 *
 * Order matters and is deliberate: a conflict in the controlling set outranks
 * everything, absence outranks difference, and an explicit supersession is
 * checked before any advance rule so an authorized change is never called drift.
 */
export function classifyField(spec, entry, read, ctx = {}) {
  const base = {
    subject_kind: entry.subject_kind ?? null,
    subject_ref: entry.subject_ref ?? null,
    field_key: entry.field_key,
    hard_watch: spec.hard_watch !== false,
    controlling: entry.value,
    current: read?.present ? read.value : null
  };
  const controlling = entry.normalized ?? normalizeByKind(spec.kind, entry.value);
  const verdict = (classification, detail, magnitude) => ({
    ...base,
    classification,
    detail,
    d: BREACH.includes(classification) ? 1 : 0,
    magnitude: magnitude ?? (BREACH.includes(classification) ? 1 : 0)
  });

  if (entry.conflicting) {
    return verdict('CONFLICTING',
      'Controlling set contains more than one current value for this field.');
  }

  // A subject the task never produced is not evidence of loss; a subject that
  // was produced with this field dropped is.
  if (!read?.present || isAbsent(read.value)) {
    if (!ctx.subjectPresent) return verdict('UNCHANGED', 'Subject not produced by this task; controlling fact untouched.');
    return verdict('MISSING', 'Controlling fact carries a value; produced state carries none.');
  }

  const current = normalizeByKind(spec.kind, read.value);

  if (spec.kind === 'SET') {
    const delta = setDelta(controlling, current);
    if (!delta.missing.length && !delta.added.length) return verdict('UNCHANGED', 'Set membership identical.');
    const superseded = matchSupersession(spec, entry, current, ctx);
    if (superseded.matched) return verdict('EXPLICITLY_SUPERSEDED', superseded.detail);
    if (superseded.contradicted) return verdict('CONFLICTING', superseded.detail);
    if (delta.missing.length) {
      return verdict('MISSING',
        `${delta.missing.length} member(s) dropped without a closure record: ${delta.missing.join(', ')}.`);
    }
    if (spec.rule === 'SET_GROWTH') {
      return verdict('ADVANCED', `${delta.added.length} member(s) added: ${delta.added.join(', ')}.`);
    }
    return verdict('DRIFTED',
      `${delta.added.length} member(s) added to an immutable set: ${delta.added.join(', ')}.`);
  }

  // A numeric field whose value does not parse as a number is still compared —
  // by text — rather than declared drift for failing to be a number.
  const equal = spec.kind === 'NUMERIC'
    ? (controlling !== null && current !== null
      ? Math.abs(current - controlling) <= (spec.tolerance ?? 0)
      : normalizeScalar(entry.value) === normalizeScalar(read.value))
    : controlling === current;
  if (equal) return verdict('UNCHANGED', 'Value identical to controlling fact.');

  const superseded = matchSupersession(spec, entry, current, ctx);
  if (superseded.matched) return verdict('EXPLICITLY_SUPERSEDED', superseded.detail);
  if (superseded.contradicted) return verdict('CONFLICTING', superseded.detail);

  const magnitude = spec.kind === 'NUMERIC' && controlling !== null && current !== null
    ? Math.abs(current - controlling)
    : 1;

  if (spec.rule === 'MONOTONIC_TIME') {
    if (current === null) return verdict('DRIFTED', 'Produced value is not a number.', magnitude);
    if (current < controlling) {
      return verdict('DRIFTED', `Value moved backward: ${controlling} -> ${current}.`, magnitude);
    }
    const elapsedDays = elapsed(entry.recorded_at, ctx.now);
    if (elapsedDays === null) {
      return verdict('DRIFTED',
        'Value advanced with no recorded time basis to advance against.', magnitude);
    }
    const allowed = Math.floor(elapsedDays / 365) + 1;
    if (current - controlling <= allowed) {
      return verdict('ADVANCED',
        `Advanced ${current - controlling} within ${allowed} allowed by ${Math.floor(elapsedDays)} elapsed day(s).`,
        magnitude);
    }
    return verdict('DRIFTED',
      `Advanced ${current - controlling}; elapsed time allows at most ${allowed}.`, magnitude);
  }

  if (spec.rule === 'LADDER') {
    const ladder = (spec.ladder ?? []).map(normalizeScalar);
    const from = ladder.indexOf(controlling);
    const to = ladder.indexOf(current);
    if (to === -1) return verdict('DRIFTED', `Value "${read.value}" is not on the declared ladder.`, magnitude);
    if (from === -1) return verdict('CONFLICTING', `Controlling value "${entry.value}" is not on the declared ladder.`, magnitude);
    if (to < from) return verdict('DRIFTED', `Ladder reversed: ${spec.ladder[from]} -> ${spec.ladder[to]}.`, magnitude);
    const authority = authorize(spec, entry, read, ctx);
    if (!authority.ok) return verdict('DRIFTED', authority.detail, magnitude);
    return verdict('ADVANCED',
      `${spec.ladder[from]} -> ${spec.ladder[to]}${authority.detail ? `, ${authority.detail}` : ''}.`, magnitude);
  }

  if (spec.rule === 'AUTHORITY_ONLY') {
    const authority = authorize(spec, entry, read, ctx);
    if (!authority.ok) return verdict('DRIFTED', authority.detail, magnitude);
    return verdict('ADVANCED', authority.detail, magnitude);
  }

  return verdict('DRIFTED', 'Immutable field changed with no supersession record.', magnitude);
}

// ---------------------------------------------------------------------------
// Carryforward
// ---------------------------------------------------------------------------

/**
 * Detect an active workstream that silently disappears from carryforward.
 *
 * Silent is the word that matters: a workstream that was closed, superseded or
 * handed off has a record and is accounted for. One that is simply absent from
 * the next carryforward, with nothing saying why, is continuity loss and holds.
 */
export function carryforwardGap(previousActive, carriedForward, options = {}) {
  const before = normalizeByKind('SET', previousActive);
  const after = normalizeByKind('SET', carriedForward);
  const accounted = new Set(normalizeByKind('SET', options.closed ?? []));
  const delta = setDelta(before, after);
  const vanished = delta.missing.filter(item => !accounted.has(item));
  const closed = delta.missing.filter(item => accounted.has(item));
  return {
    checked_at: options.now ?? new Date().toISOString(),
    sequence_no: options.sequence_no ?? null,
    previous_count: before.length,
    carried_count: after.length,
    vanished,
    closed_with_record: closed,
    added: delta.added,
    D: vanished.length ? 1 : 0,
    proceed_allowed: vanished.length === 0,
    detail: vanished.length
      ? `${vanished.length} active workstream(s) disappeared from carryforward with no closure record: ${vanished.join(', ')}.`
      : 'Every active workstream is either carried forward or closed on the record.'
  };
}

// ---------------------------------------------------------------------------
// Alert
// ---------------------------------------------------------------------------

/** Build the alert record a HOLD raises. Shape mirrors thy_continuity_alerts. */
export function alertRecord(check) {
  const breaches = (check.findings ?? []).filter(finding => BREACH.includes(finding.classification));
  const hard = breaches.filter(finding => finding.hard_watch !== false);
  const severity = hard.length ? 'HOLD' : 'WARN';
  const counts = breaches.reduce((acc, finding) => {
    acc[finding.classification] = (acc[finding.classification] ?? 0) + 1;
    return acc;
  }, {});
  const code = `THY-CONT-${check.sequence_no ?? '0'}-${digest({
    task: check.task_ref, phase: check.phase, breaches: breaches.map(b => [b.subject_ref, b.field_key, b.classification])
  }).slice(0, 8)}`.toUpperCase();

  return {
    alert_code: code,
    raised_at: check.checked_at,
    task_ref: check.task_ref,
    phase: check.phase,
    sequence_no: check.sequence_no ?? null,
    severity,
    state: 'OPEN',
    proceed_allowed: severity !== 'HOLD',
    D: check.D ?? (breaches.length ? 1 : 0),
    headline: severity === 'HOLD'
      ? `HOLD · ${hard.length} hard-watch field(s) lost continuity at ${check.phase}.`
      : `WARN · ${breaches.length} watched field(s) deviated at ${check.phase}.`,
    counts,
    breaches: breaches.map(finding => ({
      subject_kind: finding.subject_kind,
      subject_ref: finding.subject_ref,
      field_key: finding.field_key,
      classification: finding.classification,
      hard_watch: finding.hard_watch !== false,
      controlling: finding.controlling,
      current: finding.current,
      magnitude: finding.magnitude,
      detail: finding.detail
    })),
    evidence: {
      brief_digest: check.brief_digest ?? null,
      produced_digest: check.produced_digest ?? null,
      field_count: check.field_count ?? (check.findings ?? []).length,
      breach_count: breaches.length,
      hard_breach_count: hard.length
    }
  };
}

// ---------------------------------------------------------------------------
// Internals
// ---------------------------------------------------------------------------

function bySequence(a, b) {
  const seq = (Number(a.sequence_no ?? 0)) - (Number(b.sequence_no ?? 0));
  if (seq !== 0) return seq;
  return String(a.recorded_at ?? '').localeCompare(String(b.recorded_at ?? ''));
}

function subjectKey(fact) {
  return String(fact.subject_ref ?? '');
}

function subjectIndex(task) {
  const set = new Set();
  for (const subject of task.subjects ?? []) {
    set.add(String(typeof subject === 'object' ? subject.ref ?? subject.subject_ref : subject));
  }
  if (!set.size && task.subject_ref) set.add(String(task.subject_ref));
  return set;
}

/**
 * Accept the shapes a caller is likely to hand us, and index them once:
 *
 *   { subjects: { REF: { field: value } } }   explicit, preferred
 *   { REF: { field: value } }                 nested
 *   { field: value }                          flat, single-subject task
 *   [ { subject_ref, field_key, value } ]     row list
 *
 * A field value may be given bare, or wrapped as { value, authority_ref } when
 * the produced state carries the authority that moved it.
 */
function indexProduced(produced) {
  const table = new Map();
  const subjects = new Set();
  const put = (subject, field, value) => {
    const ref = String(subject ?? '');
    subjects.add(ref);
    table.set(`${ref}::${field}`, value);
  };

  const source = (produced && !Array.isArray(produced) && typeof produced === 'object' &&
    produced.subjects && typeof produced.subjects === 'object')
    ? produced.subjects
    : produced;

  if (Array.isArray(source)) {
    for (const row of source) {
      put(row.subject_ref, row.field_key,
        row.authority_ref ? { value: row.value, authority_ref: row.authority_ref } : row.value);
    }
  } else if (source && typeof source === 'object') {
    for (const [key, value] of Object.entries(source)) {
      if (isSubjectBag(key, value)) {
        for (const [field, inner] of Object.entries(value)) put(key, field, inner);
      } else {
        put('', key, value);
      }
    }
  }

  const unwrap = raw => (raw && typeof raw === 'object' && !Array.isArray(raw) && 'value' in raw)
    ? { present: true, value: raw.value, authority_ref: raw.authority_ref ?? null }
    : { present: true, value: raw, authority_ref: null };

  return {
    snapshot: Object.fromEntries([...table.entries()].sort((a, b) => a[0].localeCompare(b[0]))),
    hasSubject(ref) {
      return subjects.has(String(ref ?? '')) || subjects.has('');
    },
    read(ref, field) {
      const key = `${String(ref ?? '')}::${field}`;
      if (table.has(key)) return unwrap(table.get(key));
      const flat = `::${field}`;
      if (table.has(flat)) return unwrap(table.get(flat));
      return { present: false, value: null, authority_ref: null };
    }
  };
}

/** A nested object is a subject bag unless it is a field, or a wrapped value. */
function isSubjectBag(key, value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  if (fieldSpec(key)) return false;
  if ('value' in value && 'authority_ref' in value) return false;
  return true;
}

/**
 * An explicit supersession authorizes a change only when it names this field,
 * this subject, the value it came from and the value it goes to. A supersession
 * that points somewhere other than the produced value is a conflict, not a pass:
 * two authorities disagreeing is worse than one silent change.
 */
function matchSupersession(spec, entry, current, ctx) {
  const rows = (ctx.supersessions ?? []).filter(row =>
    row.field_key === entry.field_key &&
    String(row.subject_ref ?? '') === String(entry.subject_ref ?? '') &&
    row.approved_at && row.authority_ref);
  if (!rows.length) return { matched: false, contradicted: false };

  const from = normalizeByKind(spec.kind, entry.value);
  const applicable = rows.filter(row =>
    row.from_value === undefined ||
    stableStringify(normalizeByKind(spec.kind, row.from_value)) === stableStringify(from));
  if (!applicable.length) {
    return {
      matched: false,
      contradicted: true,
      detail: 'A supersession exists for this field but records a different prior value.'
    };
  }
  for (const row of applicable) {
    if (stableStringify(normalizeByKind(spec.kind, row.to_value)) === stableStringify(current)) {
      return {
        matched: true,
        contradicted: false,
        detail: `Superseded by ${row.authority_ref} on ${row.approved_at}${row.reason ? `: ${row.reason}` : ''}.`
      };
    }
  }
  return {
    matched: false,
    contradicted: true,
    detail: `Supersession ${applicable[0].authority_ref} authorizes a different value than the one produced.`
  };
}

/**
 * Authority has to come from the controlling side. A reference the produced
 * state supplies about itself is not authorization, so when no authority
 * registry was compiled the answer is HOLD rather than trust.
 */
function authorize(spec, entry, read, ctx) {
  if (!spec.requires_authority) return { ok: true, detail: '' };
  const ref = read?.authority_ref ?? null;
  if (!ref) return { ok: false, detail: 'Change requires a recorded authority reference; none present.' };
  if (!ctx.authoritiesSupplied) {
    return { ok: false, detail: `Authority "${ref}" could not be verified: no authority registry was compiled.` };
  }
  if (!ctx.authorities.has(ref)) {
    return { ok: false, detail: `Authority "${ref}" is not in the compiled authority registry.` };
  }
  return { ok: true, detail: `authorized by ${ref}` };
}

function elapsed(recordedAt, now) {
  if (!recordedAt) return null;
  const from = Date.parse(recordedAt);
  const to = Date.parse(now ?? new Date().toISOString());
  if (Number.isNaN(from) || Number.isNaN(to)) return null;
  return Math.max(0, (to - from) / DAY_MS);
}

export { FIELDS, fieldSpec, hardWatchKeys };
