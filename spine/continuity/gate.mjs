// THYLORA CONTINUITY WATCHDOG · the execution gate
// Workstream: THY-CONTINUITY-WATCHDOG-001
//
// This is where the watchdog sits in the real path. A task does not call the
// comparison and then decide what to do about it; it runs inside the gate, and
// the gate is what decides whether the task may start and whether its output
// may be accepted.
//
//   PRE   compile controlling facts  ->  held if they already contradict
//   WORK  the task itself, given the sealed brief
//   POST  compare produced state     ->  held on any hard-watch breach
//
// Nothing here writes to a backend. Records are handed to `sink` so the caller
// persists them where it already has custody — thy_continuity_check() for the
// backend path, a file or a log anywhere else. The gate holds whether or not a
// sink is supplied: a watchdog that only works when storage is reachable is not
// a watchdog.

import { carryforwardGap, postTask, preTask } from './watchdog.mjs';

export const STATES = Object.freeze([
  'PASSED', 'HELD_PRE', 'HELD_POST', 'HELD_CARRYFORWARD', 'FAILED'
]);

/**
 * Run a task under the watchdog.
 *
 * @param {object} task     { task_ref, sequence_no?, subjects?, fields?, now? }
 * @param {object} sources  { facts, supersessions?, authorities?, extraFields?,
 *                            carryforward?: { previous, carried, closed? } }
 * @param {function} work   async (brief) => produced state
 * @param {object} options  { sink?, now? }
 * @returns {Promise<object>} the gate record; `proceed_allowed` is the verdict
 */
export async function runGuarded(task, sources = {}, work = async () => ({}), options = {}) {
  const now = options.now ?? task.now ?? new Date().toISOString();
  const sink = options.sink ?? (async () => {});
  const record = {
    task_ref: task.task_ref,
    sequence_no: task.sequence_no ?? null,
    started_at: now,
    state: 'FAILED',
    proceed_allowed: false,
    D: 1,
    pre: null,
    post: null,
    carryforward: null,
    produced: null,
    alerts: []
  };

  const brief = preTask({ ...task, now }, sources);
  record.pre = brief;
  await sink({ kind: 'PRE', record: brief });
  if (brief.alert) record.alerts.push(brief.alert);

  // Held before any work: the controlling set contradicts itself, so there is
  // no target to build against and producing anything would pick a side.
  if (!brief.proceed_allowed) {
    return finish(record, 'HELD_PRE', brief.D, now);
  }

  let produced;
  try {
    produced = await work(brief);
  } catch (error) {
    record.error = { message: String(error?.message ?? error) };
    await sink({ kind: 'ERROR', record: record.error });
    return finish(record, 'FAILED', 1, now);
  }
  record.produced = produced ?? null;

  const check = postTask(brief, produced ?? {}, { now, ...options });
  record.post = check;
  await sink({ kind: 'POST', record: check });
  if (check.alert) record.alerts.push(check.alert);

  if (sources.carryforward) {
    const gap = carryforwardGap(
      sources.carryforward.previous ?? [],
      sources.carryforward.carried ?? [],
      { closed: sources.carryforward.closed ?? [], now, sequence_no: task.sequence_no ?? null }
    );
    record.carryforward = gap;
    await sink({ kind: 'CARRYFORWARD', record: gap });
    if (!gap.proceed_allowed) {
      return finish(record, 'HELD_CARRYFORWARD', Math.max(check.D, gap.D), now);
    }
  }

  if (!check.proceed_allowed) return finish(record, 'HELD_POST', check.D, now);
  return finish(record, 'PASSED', check.D, now);
}

/**
 * The one line a caller reads. A held task states which fields lost continuity
 * and how, never only that something is wrong.
 */
export function verdictLine(record) {
  if (record.state === 'PASSED') {
    return `PROCEED · ${record.task_ref} · D=0 · ${record.post?.field_count ?? 0} field(s) checked.`;
  }
  if (record.state === 'FAILED') {
    return `FAILED · ${record.task_ref} · task threw before comparison: ${record.error?.message ?? 'unknown'}`;
  }
  const breaches = record.state === 'HELD_CARRYFORWARD'
    ? (record.carryforward?.vanished ?? []).map(ref => `active_workstreams:${ref} MISSING`)
    : [...(record.pre?.conflicts ?? []).map(c => `${c.field_key} CONFLICTING`),
      ...(record.post?.breaches ?? []).map(b => `${b.field_key} ${b.classification}`)];
  return `HOLD · ${record.task_ref} · D=${record.D} · ${breaches.join(' · ')}`;
}

function finish(record, state, D, now) {
  record.state = state;
  record.D = D;
  record.proceed_allowed = state === 'PASSED';
  record.finished_at = now;
  return record;
}
