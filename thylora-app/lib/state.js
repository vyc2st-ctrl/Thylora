// THYLORA APP · state persistence
// Workroom: WR-THYAPP-001
//
// What a reader chose must survive a reload, a backgrounded tab and an app
// relaunch: chosen language, English subtitle setting, where they were, an
// unsent Ask Ersatz question, an unsaved Chairman margin note.
//
// Storage may be unavailable or may throw rather than return null (Safari
// private browsing, cleared site data, an embedded webview). Every read and
// write is therefore guarded, and an in-memory map stands in so the session
// still works when nothing can be written to disk. A failed write is never
// reported as a save.
//
// The auth session is deliberately NOT stored here. It stays in the canonical
// client's sessionStorage key so that one sign-in covers every THYLORA surface.

export const NAMESPACE = 'thylora_app_shell';
export const STATE_VERSION = 1;

export const DEFAULT_STATE = Object.freeze({
  version: STATE_VERSION,
  section: 'home',
  languageCode: 'en',
  englishSubtitles: true,
  drafts: Object.freeze({ question: '', marginNote: '' }),
  follows: Object.freeze([]),
  lastTransmission: null
});

const memory = new Map();

function backing() {
  try {
    const store = globalThis.localStorage;
    if (!store) return null;
    // Prove it actually accepts a write before trusting it.
    const probeKey = `${NAMESPACE}.__probe`;
    store.setItem(probeKey, '1');
    store.removeItem(probeKey);
    return store;
  } catch {
    return null;
  }
}

function readRaw(key) {
  const store = backing();
  if (store) {
    try { return store.getItem(key); } catch { /* fall through to memory */ }
  }
  return memory.has(key) ? memory.get(key) : null;
}

function writeRaw(key, value) {
  memory.set(key, value);
  const store = backing();
  if (!store) return false;
  try { store.setItem(key, value); return true; } catch { return false; }
}

/* ------------------------------------------------------------------- shape */
function clone(state) {
  return {
    version: STATE_VERSION,
    section: state.section,
    languageCode: state.languageCode,
    englishSubtitles: state.englishSubtitles,
    drafts: { ...state.drafts },
    follows: [...state.follows],
    lastTransmission: state.lastTransmission
  };
}

/** Coerce anything read off disk into a valid state object. */
export function normalize(candidate) {
  const base = clone(DEFAULT_STATE);
  if (!candidate || typeof candidate !== 'object') return base;
  if (typeof candidate.section === 'string' && candidate.section) base.section = candidate.section;
  if (typeof candidate.languageCode === 'string' && candidate.languageCode) {
    base.languageCode = candidate.languageCode;
  }
  if (typeof candidate.englishSubtitles === 'boolean') base.englishSubtitles = candidate.englishSubtitles;
  if (candidate.drafts && typeof candidate.drafts === 'object') {
    if (typeof candidate.drafts.question === 'string') base.drafts.question = candidate.drafts.question;
    if (typeof candidate.drafts.marginNote === 'string') base.drafts.marginNote = candidate.drafts.marginNote;
  }
  if (Array.isArray(candidate.follows)) {
    base.follows = [...new Set(candidate.follows.filter(f => typeof f === 'string' && f))];
  }
  if (typeof candidate.lastTransmission === 'string' || candidate.lastTransmission === null) {
    base.lastTransmission = candidate.lastTransmission;
  }
  return base;
}

export function loadState() {
  const raw = readRaw(NAMESPACE);
  if (!raw) return clone(DEFAULT_STATE);
  try { return normalize(JSON.parse(raw)); } catch { return clone(DEFAULT_STATE); }
}

/** Persist a patch. Returns { state, durable } — durable:false means memory only. */
export function saveState(patch) {
  const next = normalize({ ...loadState(), ...patch });
  const durable = writeRaw(NAMESPACE, JSON.stringify(next));
  return { state: next, durable };
}

export function patchDrafts(patch) {
  const current = loadState();
  return saveState({ drafts: { ...current.drafts, ...patch } });
}

export function toggleFollow(subjectCode) {
  const current = loadState();
  const follows = new Set(current.follows);
  if (follows.has(subjectCode)) follows.delete(subjectCode);
  else follows.add(subjectCode);
  const result = saveState({ follows: [...follows] });
  return { ...result, following: follows.has(subjectCode) };
}

export function isFollowing(subjectCode, state = loadState()) {
  return state.follows.includes(subjectCode);
}

export function clearState() {
  memory.delete(NAMESPACE);
  const store = backing();
  if (store) { try { store.removeItem(NAMESPACE); } catch { /* nothing to clear */ } }
  return clone(DEFAULT_STATE);
}

/** True when a reload would actually preserve state on this device. */
export function storageDurable() {
  return backing() !== null;
}
