// THYLORA · Talk While Working · BACKTRACE semantic markers
// App record: THY-TALK-WHILE-WORKING-APP-001
//
// Every structured event the operator extracts from speech becomes a marker:
//   object + action + location + reason + time (Nahla Mercer's anchor method)
// Markers are hash-chained and append-only. A correction is a new marker that
// supersedes an earlier one; the earlier one stays readable (raw is never
// overwritten). Reverse reading walks the chain newest -> oldest so a person can
// recover "where did I put it, and why" from the last trustworthy placement.

import { createHash } from 'node:crypto';

export const ACTIONS = Object.freeze({
  PLACE: 'PLACE',       // object now rests at location
  TAKE: 'TAKE',         // object leaves location with the speaker
  MOVE: 'MOVE',         // object goes from A to B
  USE: 'USE',           // object used, location unchanged
  MENTION: 'MENTION',   // object referenced without a location claim
  INSPECT: 'INSPECT',
  HANDOFF: 'HANDOFF'    // custody passes to another named person
});

export const SOURCE = Object.freeze({ OPERATOR_SPEECH: 'OPERATOR_SPEECH', BACKGROUND: 'BACKGROUND', OTHER_SPEAKER: 'OTHER_SPEAKER' });

const sha = s => createHash('sha256').update(s).digest('hex');

export function createSession({ session_id, operator_id, user_id, started_at, earth_timezone = 'America/New_York', native_stamp = null }) {
  if (!operator_id) throw new Error('an accountable operator must be assigned before recording starts');
  return {
    session_id, operator_id, user_id, started_at, earth_timezone, native_stamp,
    recording_known_to_user: true,
    raw: [],       // verbatim transcript segments, never edited
    markers: [],   // structured, hash-chained
    routed: [],
    improvements: [],
    closed: null
  };
}

export function addRaw(session, { t, speaker, source, text, confidence }) {
  if (!Object.values(SOURCE).includes(source)) throw new Error(`unknown source ${source}`);
  const seg = { seg_id: `R${session.raw.length + 1}`, t, speaker, source, text, confidence };
  session.raw.push(seg);
  return seg;
}

// Background audio may never become a placement claim on its own.
export function addMarker(session, m) {
  const prev = session.markers.at(-1);
  const seg = session.raw.find(r => r.seg_id === m.raw_ref);
  if (!seg) throw new Error('marker must cite a raw segment');
  if (seg.source === SOURCE.BACKGROUND && [ACTIONS.PLACE, ACTIONS.MOVE, ACTIONS.TAKE].includes(m.action)) {
    throw new Error('background audio cannot establish object placement; confirm with the speaker');
  }
  const uncertain = m.uncertain ?? (seg.confidence != null && seg.confidence < 0.8);
  const body = {
    marker_id: `BT-${session.session_id}-${String(session.markers.length + 1).padStart(4, '0')}`,
    seq: session.markers.length + 1,
    t: m.t, object: m.object, action: m.action,
    location: m.location ?? null, reason: m.reason ?? null,
    raw_ref: m.raw_ref, speaker: seg.speaker, source: seg.source,
    uncertain, supersedes: m.supersedes ?? null,
    prev_hash: prev?.hash ?? 'GENESIS'
  };
  body.hash = sha(JSON.stringify(body));
  session.markers.push(body);
  return body;
}

// Correction: a new marker that points at the one it fixes. Nothing is deleted.
export function correct(session, markerId, fix) {
  const target = session.markers.find(x => x.marker_id === markerId);
  if (!target) throw new Error(`no marker ${markerId}`);
  return addMarker(session, { ...target, ...fix, supersedes: markerId, uncertain: fix.uncertain ?? false });
}

export function verifyChain(session) {
  let prev = 'GENESIS';
  for (const m of session.markers) {
    const { hash, ...body } = m;
    if (body.prev_hash !== prev || sha(JSON.stringify(body)) !== hash) return { valid: false, broken_at: m.marker_id };
    prev = hash;
  }
  return { valid: true, length: session.markers.length };
}

// Reverse reading: newest -> oldest, skipping superseded markers.
export function backtrace(session, object) {
  const superseded = new Set(session.markers.map(m => m.supersedes).filter(Boolean));
  return session.markers.filter(m => m.object === object && !superseded.has(m.marker_id)).reverse();
}

// Place recovery: the last trustworthy location claim, plus anything after it
// that makes the claim doubtful.
export function whereIs(session, object) {
  const trail = backtrace(session, object);
  const placing = trail.find(m => [ACTIONS.PLACE, ACTIONS.MOVE].includes(m.action) && m.location);
  if (!placing) return { object, state: 'UNKNOWN', trail };
  const after = trail.slice(0, trail.indexOf(placing));
  const doubt = after.filter(m => [ACTIONS.TAKE, ACTIONS.HANDOFF, ACTIONS.USE].includes(m.action) || m.uncertain);
  const taken = after.find(m => m.action === ACTIONS.TAKE || m.action === ACTIONS.HANDOFF);
  return {
    object,
    state: taken ? 'MOVED_AFTER_LAST_PLACEMENT' : placing.uncertain || doubt.length ? 'LAST_KNOWN_UNCERTAIN' : 'LAST_KNOWN',
    location: placing.location,
    reason: placing.reason,
    at: placing.t,
    marker_id: placing.marker_id,
    doubts: doubt.map(d => d.marker_id),
    trail
  };
}

export function routeToExpert(session, { question, domain, role_holder_id }) {
  if (!role_holder_id) return { routed: false, reason: `no verified ${domain} role holder; question held OPEN` };
  const r = { question, domain, role_holder_id, state: 'ROUTED_AWAITING_ANSWER' };
  session.routed.push(r);
  return { routed: true, ...r };
}

// Handoff receipt: the operator may not close with "all set". Every object
// touched in the session must resolve to a location or be listed as UNKNOWN.
export function closeWithReceipt(session, { closed_at, next_person_id }) {
  const objects = [...new Set(session.markers.map(m => m.object))];
  const items = objects.map(o => { const w = whereIs(session, o); return { object: o, state: w.state, location: w.location ?? null, marker_id: w.marker_id ?? null }; });
  const unresolved = items.filter(i => i.state !== 'LAST_KNOWN');
  const receipt = {
    session_id: session.session_id,
    operator_id: session.operator_id,
    next_person_id,
    closed_at,
    items,
    unresolved,
    open_routes: session.routed.filter(r => r.state !== 'ANSWERED'),
    chain: verifyChain(session),
    head_hash: session.markers.at(-1)?.hash ?? 'GENESIS',
    closable_as_clean: unresolved.length === 0
  };
  session.closed = receipt;
  return receipt;
}

// Process-improvement extraction: repeated corrections and repeated uncertainty
// on the same object/location pattern become candidate rule changes.
export function extractImprovements(session) {
  const out = [];
  const corrections = session.markers.filter(m => m.supersedes);
  if (corrections.length) out.push({ kind: 'CORRECTION_PATTERN', count: corrections.length, suggestion: 'require location + reason at the moment of placement for the corrected objects', objects: [...new Set(corrections.map(c => c.object))] });
  const bgMentions = session.raw.filter(r => r.source === SOURCE.BACKGROUND).length;
  if (bgMentions) out.push({ kind: 'BACKGROUND_AUDIO', count: bgMentions, suggestion: 'confirm background speech with the speaker before it is treated as a record' });
  const vague = session.markers.filter(m => m.action === ACTIONS.PLACE && !m.reason);
  if (vague.length) out.push({ kind: 'MISSING_REASON', count: vague.length, suggestion: 'prompt for reason on placement', objects: vague.map(v => v.object) });
  session.improvements = out;
  return out;
}
