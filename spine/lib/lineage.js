// VYC2ST 0→∞ Lineage Run + Contribution Wake.
//
// Shared primitive. One append-only, hash-chained ledger of units. Every unit
// is one artifact-bearing step (iteration → batch → unit), carries provenance,
// and carries at least one Contribution Wake record naming who made it, the
// question it answered, the ideas rejected on the way and what is still open.
//
// Used by: lineage run (lane 2), contribution wake (lane 3), VYC Stream
// (lane 5, chain + canonical hashing), access log (lane 6), every lane artifact.

import { createHash } from 'node:crypto';

export const MAKER_KINDS = Object.freeze(['PERSON', 'TEAM', 'AI_ASSISTANT', 'IN_WORLD_CHARACTER']);
export const UNIT_KINDS = Object.freeze([
  'SCHEMA', 'CONTRACT', 'LESSON', 'SCRIPT', 'VISUAL', 'AUDIO', 'CODE', 'RECORD',
  'DECISION', 'CAPTURE', 'OFFER', 'TEMPLATE',
]);
export const GENESIS = '0'.repeat(64);

/** Deterministic JSON: object keys sorted at every depth. */
export function canonical(v) {
  if (v === null || typeof v !== 'object') return JSON.stringify(v);
  if (Array.isArray(v)) return '[' + v.map(canonical).join(',') + ']';
  return '{' + Object.keys(v).sort().filter(k => v[k] !== undefined)
    .map(k => JSON.stringify(k) + ':' + canonical(v[k])).join(',') + '}';
}

export function sha256(s) {
  return createHash('sha256').update(s, 'utf8').digest('hex');
}

/** Hash one link: previous hash + canonical body (without its own hash). */
export function linkHash(prev, body) {
  const { hash, ...rest } = body;
  return sha256(prev + '|' + canonical(rest));
}

/** Generic append-only chain used by lineage units, access logs and stream queues. */
export function appendLink(chain, body) {
  const prev = chain.length ? chain[chain.length - 1].hash : GENESIS;
  const link = { ...body, seq: chain.length, prev_hash: prev };
  link.hash = linkHash(prev, link);
  chain.push(Object.freeze(link));
  return link;
}

/** Verifies order, linkage and content of a chain. Detects edits, drops and reorders. */
export function verifyChain(chain) {
  let prev = GENESIS;
  for (let i = 0; i < chain.length; i++) {
    const l = chain[i];
    if (l.seq !== i) return { ok: false, at: i, reason: 'sequence gap or reorder' };
    if (l.prev_hash !== prev) return { ok: false, at: i, reason: 'broken link' };
    if (linkHash(prev, l) !== l.hash) return { ok: false, at: i, reason: 'content altered' };
    prev = l.hash;
  }
  return { ok: true, head: prev, length: chain.length };
}

// ---------------------------------------------------------------- Contribution Wake

/**
 * Validates one Contribution Wake record.
 * An AI contribution must say it is AI. An in-world character must carry its
 * world layer so it is never mistaken for an Earth person. A rejected idea must
 * say why. An open question must have an owner.
 */
export function validateContribution(c) {
  const errors = [];
  if (!c || typeof c !== 'object') return ['contribution missing'];
  if (!c.artifact_ref) errors.push('artifact_ref missing');
  if (!c.maker || !c.maker.id) errors.push('maker.id missing');
  if (c.maker && !MAKER_KINDS.includes(c.maker.kind)) errors.push(`maker.kind must be ${MAKER_KINDS.join('|')}`);
  if (c.maker && c.maker.kind === 'IN_WORLD_CHARACTER' && !c.maker.world_layer) errors.push('in-world maker needs world_layer');
  if (c.maker && c.maker.kind === 'AI_ASSISTANT' && c.maker.disclosed !== true) errors.push('AI contribution must be disclosed');
  if (!c.role) errors.push('role missing');
  if (!c.question) errors.push('question missing (what this contribution answered)');
  for (const r of c.rejected_ideas || []) {
    if (!r.idea || !r.reason) errors.push('rejected idea needs idea + reason');
  }
  for (const q of c.open_questions || []) {
    if (!q.question || !q.owner) errors.push('open question needs question + owner');
  }
  if (c.maker && c.maker.kind === 'PERSON' && c.public_credit === true && c.consent_state !== 'GRANTED') {
    errors.push('public credit for a person requires consent_state GRANTED');
  }
  return errors;
}

// ---------------------------------------------------------------- Lineage Run

export function createRun({ run_id, title, owner, started_at }) {
  if (!run_id || !owner) throw new Error('run_id and owner required');
  return { run_id, title: title || run_id, owner, started_at: started_at || null, units: [] };
}

/**
 * Append one unit. Iterations start at 0 and are unbounded; they may repeat
 * (several batches per iteration) but never go backwards.
 */
export function appendUnit(run, u) {
  const errors = [];
  if (!Number.isInteger(u.iteration) || u.iteration < 0) errors.push('iteration must be an integer ≥ 0');
  const last = run.units[run.units.length - 1];
  if (last && u.iteration < last.iteration) errors.push('iteration may not go backwards');
  if (!u.batch) errors.push('batch missing');
  if (!u.unit_id) errors.push('unit_id missing');
  if (run.units.some(x => x.unit_id === u.unit_id)) errors.push('unit_id already used');
  if (!UNIT_KINDS.includes(u.kind)) errors.push(`kind must be ${UNIT_KINDS.join('|')}`);
  if (!u.artifact_ref) errors.push('artifact_ref missing');
  for (const p of u.parent_units || []) {
    if (!run.units.some(x => x.unit_id === p)) errors.push(`parent ${p} not in run`);
  }
  const pv = u.provenance || {};
  for (const k of ['source', 'method', 'rights_basis', 'recorded_at']) if (!pv[k]) errors.push(`provenance.${k} missing`);
  const wake = u.contributions || [];
  if (wake.length === 0) errors.push('Contribution Wake missing: every artifact needs ≥1 contribution');
  for (const c of wake) {
    if (c.artifact_ref !== u.artifact_ref) errors.push('contribution artifact_ref does not match unit');
    errors.push(...validateContribution(c));
  }
  if (errors.length) return { ok: false, errors };
  const link = appendLink(run.units, { run_id: run.run_id, ...u, parent_units: u.parent_units || [] });
  return { ok: true, unit: link };
}

export function verifyRun(run) {
  return verifyChain(run.units);
}

/** Everything upstream of a unit (its ancestry), nearest first. */
export function ancestry(run, unit_id) {
  const byId = new Map(run.units.map(u => [u.unit_id, u]));
  const out = [];
  const seen = new Set();
  const walk = id => {
    for (const p of (byId.get(id) || {}).parent_units || []) {
      if (seen.has(p)) continue;
      seen.add(p); out.push(p); walk(p);
    }
  };
  walk(unit_id);
  return out;
}

/** Contribution Wake rollup for a unit: makers, questions, rejections, open questions. */
export function wakeFor(run, unit_id) {
  const u = run.units.find(x => x.unit_id === unit_id);
  if (!u) return null;
  const c = u.contributions;
  return {
    artifact_ref: u.artifact_ref,
    makers: c.map(x => ({ id: x.maker.id, kind: x.maker.kind, role: x.role, team: x.team || null })),
    questions: c.map(x => x.question),
    rejected_ideas: c.flatMap(x => x.rejected_ideas || []),
    open_questions: c.flatMap(x => x.open_questions || []),
  };
}
