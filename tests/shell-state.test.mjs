// THYLORA APP · state persistence tests
// Workroom: WR-THYAPP-001
//
// Proves that what a reader chose survives a reload, and that when a device
// refuses to store anything the shell says so instead of pretending to save.

import { test } from 'node:test';
import assert from 'node:assert/strict';

/** Minimal Storage stand-in, matching the throwing behaviour we guard against. */
function makeStorage({ throwOnWrite = false } = {}) {
  const map = new Map();
  return {
    get length() { return map.size; },
    getItem: key => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => {
      if (throwOnWrite) throw new DOMException('QuotaExceededError');
      map.set(key, String(value));
    },
    removeItem: key => { map.delete(key); },
    clear: () => map.clear(),
    __raw: map
  };
}

function install(storage) { globalThis.localStorage = storage; }
function uninstall() { delete globalThis.localStorage; }

// Each import with a fresh query string is a fresh module instance with an
// empty in-memory fallback — which is what a page reload actually looks like.
let generation = 0;
const freshState = () => import(`../thylora-app/lib/state.js?gen=${generation++}`);

test('defaults are sane before anything is chosen', async () => {
  uninstall();
  const { loadState, DEFAULT_STATE } = await freshState();
  const state = loadState();
  assert.equal(state.section, 'home');
  assert.equal(state.languageCode, 'en');
  assert.equal(state.englishSubtitles, true);
  assert.deepEqual(state.follows, []);
  assert.equal(DEFAULT_STATE.drafts.question, '');
});

test('choices survive a reload when the device allows storage', async () => {
  const storage = makeStorage();
  install(storage);

  const first = await freshState();
  const saved = first.saveState({
    section: 'casefiles', languageCode: 'yo', englishSubtitles: false, lastTransmission: 'TX-1'
  });
  assert.equal(saved.durable, true, 'a working storage must report a durable save');
  first.patchDrafts({ question: 'Who signed the 1871 register?' });
  first.toggleFollow('CORR-ADEYEMI');

  // Reload: a brand new module instance, nothing left in memory.
  const afterReload = await freshState();
  const state = afterReload.loadState();
  assert.equal(state.section, 'casefiles');
  assert.equal(state.languageCode, 'yo');
  assert.equal(state.englishSubtitles, false);
  assert.equal(state.lastTransmission, 'TX-1');
  assert.equal(state.drafts.question, 'Who signed the 1871 register?');
  assert.deepEqual(state.follows, ['CORR-ADEYEMI']);
  assert.equal(afterReload.isFollowing('CORR-ADEYEMI'), true);
  uninstall();
});

test('a device that refuses to store is reported, not faked', async () => {
  install(makeStorage({ throwOnWrite: true }));
  const { saveState, loadState, storageDurable } = await freshState();
  assert.equal(storageDurable(), false);
  const result = saveState({ languageCode: 'pt' });
  assert.equal(result.durable, false, 'a failed write must never be reported as durable');
  // The choice still applies for this session.
  assert.equal(loadState().languageCode, 'pt');
  uninstall();
});

test('with no storage at all the session still works in memory', async () => {
  uninstall();
  const { saveState, loadState, storageDurable } = await freshState();
  assert.equal(storageDurable(), false);
  assert.equal(saveState({ section: 'store' }).durable, false);
  assert.equal(loadState().section, 'store');
});

test('corrupt or hostile stored state falls back to defaults', async () => {
  const storage = makeStorage();
  storage.__raw.set('thylora_app_shell', '{not json');
  install(storage);
  const { loadState } = await freshState();
  assert.equal(loadState().section, 'home');
  uninstall();
});

test('stored state of the wrong shape is coerced, not trusted', async () => {
  const { normalize } = await freshState();
  const state = normalize({
    section: 42, languageCode: null, englishSubtitles: 'yes',
    drafts: { question: { evil: true }, marginNote: 'kept' },
    follows: ['A', 'A', '', null, 'B'], lastTransmission: 7
  });
  assert.equal(state.section, 'home');
  assert.equal(state.languageCode, 'en');
  assert.equal(state.englishSubtitles, true);
  assert.equal(state.drafts.question, '');
  assert.equal(state.drafts.marginNote, 'kept');
  assert.deepEqual(state.follows, ['A', 'B']);
  assert.equal(state.lastTransmission, null);
});

test('following toggles off again and is de-duplicated', async () => {
  install(makeStorage());
  const { toggleFollow, loadState, clearState } = await freshState();
  clearState();
  assert.equal(toggleFollow('BUREAU-LAGOS').following, true);
  assert.equal(toggleFollow('BUREAU-LAGOS').following, false);
  assert.deepEqual(loadState().follows, []);
  toggleFollow('X'); toggleFollow('Y');
  assert.deepEqual(loadState().follows.sort(), ['X', 'Y']);
  uninstall();
});

test('the auth session is not stored in shell state', async () => {
  // One sign-in must cover every THYLORA surface, so the session stays in the
  // canonical client's own key and is never copied into this namespace.
  const { NAMESPACE, DEFAULT_STATE } = await freshState();
  assert.equal(NAMESPACE, 'thylora_app_shell');
  assert.ok(!('access_token' in DEFAULT_STATE));
  assert.ok(!JSON.stringify(DEFAULT_STATE).includes('token'));
});
