// VYC Stream: voice capture → atomic idea extraction → relation map → queue →
// restart → no-loss.
//
// The no-loss guarantee is arithmetic, not a promise: every non-whitespace
// character of the verbatim transcript must fall inside exactly one atom span,
// every atom must sit in the queue, the queue may never discard (only PARK with
// a reason), and a restart snapshot must hash-verify before it is restored.

import { canonical, sha256, appendLink, verifyChain } from './lineage.js';

export const QUEUE_STATES = Object.freeze(['QUEUED', 'ROUTED', 'IN_WORK', 'DONE', 'PARKED']);
const TRANSITIONS = {
  QUEUED: ['ROUTED', 'PARKED'],
  ROUTED: ['IN_WORK', 'PARKED', 'QUEUED'],
  IN_WORK: ['DONE', 'PARKED', 'ROUTED'],
  PARKED: ['QUEUED'],
  DONE: [],
};

/**
 * Capture a voice transcript verbatim. Speaker identity is DECLARED unless a
 * verification ref from the existing voice identity gates is supplied — the
 * stream never upgrades a declared speaker to a verified one on its own.
 */
export function capture({ capture_id, transcript, speaker_declared, speaker_verification_ref, audio_ref, captured_at, transcription_confidence }) {
  if (!capture_id || typeof transcript !== 'string' || !transcript.trim()) throw new Error('capture_id and transcript required');
  return Object.freeze({
    capture_id, transcript, audio_ref: audio_ref || null, captured_at: captured_at || null,
    transcription_confidence: transcription_confidence ?? null,
    speaker: speaker_declared || null,
    speaker_state: speaker_verification_ref ? 'VERIFIED_BY_GATE' : 'DECLARED_UNVERIFIED',
    speaker_verification_ref: speaker_verification_ref || null,
    transcript_hash: sha256(transcript),
  });
}

// Boundaries where one spoken idea usually ends and the next begins.
const BOUNDARY = /(?<=[.!?;])\s+|\n+|\s+(?=(?:and also|also,|another thing|next thing|separately|number (?:one|two|three|four|five|six|seven|eight|nine|ten)\b|\d+\.\s))/gi;

/** Split a capture into atoms that exactly tile the transcript. */
export function extractAtoms(cap) {
  const t = cap.transcript;
  const atoms = [];
  let start = 0;
  const cut = end => {
    const raw = t.slice(start, end);
    const lead = raw.length - raw.trimStart().length;
    const text = raw.trim();
    if (text) {
      atoms.push({
        atom_id: `${cap.capture_id}-A${String(atoms.length + 1).padStart(3, '0')}`,
        capture_id: cap.capture_id,
        text,
        span: [start + lead, start + lead + text.length],
        capture_hash: cap.transcript_hash,
      });
    }
  };
  let m;
  const re = new RegExp(BOUNDARY.source, 'gi');
  while ((m = re.exec(t)) !== null) {
    if (m[0].length === 0) { re.lastIndex++; continue; }
    cut(m.index);
    start = m.index + m[0].length;
  }
  cut(t.length);
  return atoms;
}

/** Proves every non-whitespace character is covered by exactly one atom. */
export function verifyCoverage(cap, atoms) {
  const t = cap.transcript;
  const hits = new Uint8Array(t.length);
  for (const a of atoms) {
    if (a.capture_hash !== cap.transcript_hash) return { ok: false, reason: `atom ${a.atom_id} from another transcript` };
    if (t.slice(a.span[0], a.span[1]) !== a.text) return { ok: false, reason: `atom ${a.atom_id} text does not match its span` };
    for (let i = a.span[0]; i < a.span[1]; i++) hits[i]++;
  }
  for (let i = 0; i < t.length; i++) {
    if (/\s/.test(t[i])) continue;
    if (hits[i] === 0) return { ok: false, reason: `character ${i} ("${t[i]}") not in any atom` };
    if (hits[i] > 1) return { ok: false, reason: `character ${i} in more than one atom` };
  }
  return { ok: true, atoms: atoms.length };
}

const STOP = new Set('this that with from have they them their there would could should about which what when where your into been were will just like also then than some more very only over such make made want need thing things going know really because while'.split(' '));

function terms(text) {
  return new Set((text.toLowerCase().match(/[a-z][a-z'-]{3,}/g) || []).filter(w => !STOP.has(w)));
}

/**
 * Relation map. Edges between atoms that share meaningful terms, plus edges to
 * registry names (lanes, ideas, workrooms) mentioned by name.
 */
export function relate(atoms, registry = []) {
  const bag = atoms.map(a => ({ id: a.atom_id, t: terms(a.text), low: a.text.toLowerCase() }));
  const edges = [];
  for (let i = 0; i < bag.length; i++) {
    for (let j = i + 1; j < bag.length; j++) {
      const shared = [...bag[i].t].filter(w => bag[j].t.has(w));
      if (shared.length) edges.push({ from: bag[i].id, to: bag[j].id, kind: 'SHARED_TERMS', shared: shared.sort() });
    }
    for (const r of registry) {
      if (r.name && bag[i].low.includes(r.name.toLowerCase())) edges.push({ from: bag[i].id, to: r.code, kind: 'NAMES_REGISTRY_ITEM', shared: [r.name] });
    }
  }
  return edges;
}

export function createQueue(queue_id) {
  return { queue_id, items: new Map(), trail: [] };
}

export function enqueue(q, atoms, at) {
  for (const a of atoms) {
    if (q.items.has(a.atom_id)) continue;
    q.items.set(a.atom_id, { atom_id: a.atom_id, text: a.text, state: 'QUEUED', route: null, park_reason: null });
    appendLink(q.trail, { event: 'ENQUEUED', atom_id: a.atom_id, at: at || null });
  }
}

/** Move an atom. Discarding does not exist; parking requires a reason. */
export function move(q, atom_id, to, { route, reason, at } = {}) {
  const it = q.items.get(atom_id);
  if (!it) return { ok: false, error: 'unknown atom' };
  if (!QUEUE_STATES.includes(to)) return { ok: false, error: `state ${to} does not exist (atoms are never discarded)` };
  if (!TRANSITIONS[it.state].includes(to)) return { ok: false, error: `${it.state} → ${to} not allowed` };
  if (to === 'PARKED' && !reason) return { ok: false, error: 'parking requires a reason' };
  if (to === 'ROUTED' && !route) return { ok: false, error: 'routing requires a route (lane/workroom code)' };
  it.state = to;
  if (route) it.route = route;
  it.park_reason = to === 'PARKED' ? reason : null;
  appendLink(q.trail, { event: 'MOVED', atom_id, to, route: route || null, reason: reason || null, at: at || null });
  return { ok: true };
}

/** Snapshot for restart. The hash covers items and trail head. */
export function snapshot(q) {
  const body = { queue_id: q.queue_id, items: [...q.items.values()], trail: q.trail };
  return { ...body, snapshot_hash: sha256(canonical(body)) };
}

/** Restore after a restart; refuses a snapshot that was altered or truncated. */
export function restore(snap) {
  const { snapshot_hash, ...body } = snap;
  if (sha256(canonical(body)) !== snapshot_hash) return { ok: false, error: 'snapshot hash mismatch' };
  const chain = verifyChain(body.trail);
  if (!chain.ok) return { ok: false, error: `trail ${chain.reason} at ${chain.at}` };
  const q = { queue_id: body.queue_id, items: new Map(body.items.map(i => [i.atom_id, { ...i }])), trail: [...body.trail] };
  return { ok: true, queue: q, restart_point: restartPoint(q) };
}

/** First atom not DONE, in capture order — where work resumes. */
export function restartPoint(q) {
  for (const it of q.items.values()) if (it.state !== 'DONE') return it.atom_id;
  return null;
}

/** End-to-end no-loss check across capture, atoms and queue. */
export function noLoss(cap, atoms, q) {
  const cov = verifyCoverage(cap, atoms);
  if (!cov.ok) return cov;
  for (const a of atoms) if (!q.items.has(a.atom_id)) return { ok: false, reason: `atom ${a.atom_id} not queued` };
  for (const it of q.items.values()) if (it.state === 'PARKED' && !it.park_reason) return { ok: false, reason: `atom ${it.atom_id} parked without reason` };
  const chain = verifyChain(q.trail);
  if (!chain.ok) return { ok: false, reason: `trail ${chain.reason}` };
  return { ok: true, atoms: atoms.length, restart_point: restartPoint(q) };
}
