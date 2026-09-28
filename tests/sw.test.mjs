import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

// Loads app/sw.js into a sandbox with a fake Cache API and records what it stores.
function loadWorker() {
  const listeners = {};
  const store = new Map();
  const deleted = [];
  const cache = { put: async (req, res) => { store.set(req.url, res); }, addAll: async () => {} };
  const sandbox = {
    self: {
      location: { origin: 'https://thylora.example' },
      addEventListener: (type, fn) => { listeners[type] = fn; },
      skipWaiting: () => {},
      clients: { claim: async () => {} },
    },
    caches: {
      open: async () => cache,
      match: async (req) => store.get(req.url),
      keys: async () => ['thylora-app-v9-witness-hotfix', 'thylora-app-v10-private-reads-excluded'],
      delete: async (k) => { deleted.push(k); return true; },
    },
    fetch: async () => ({ ok: true, clone() { return this; }, text: async () => '' }),
    URL, Response: class {}, Promise,
  };
  vm.createContext(sandbox);
  vm.runInContext(readFileSync(new URL('../app/sw.js', import.meta.url), 'utf8'), sandbox);
  return { listeners, store, deleted };
}

function fetchEvent(url, headers = {}) {
  const h = new Map(Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v]));
  let responded = null;
  return {
    request: { method: 'GET', url, headers: { has: (k) => h.has(k.toLowerCase()) } },
    respondWith(p) { responded = p; },
    get responded() { return responded; },
  };
}

test('signed-in backend reads on another origin are never cached', async () => {
  const w = loadWorker();
  const e = fetchEvent('https://jvsdxhrfhtlgaknhjxlz.supabase.co/rest/v1/family_story_archives?select=*', { Authorization: 'Bearer x' });
  w.listeners.fetch(e);
  assert.equal(e.responded, null);
  await new Promise((r) => setTimeout(r, 5));
  assert.equal(w.store.size, 0);
});

test('same-origin request carrying Authorization is not cached', async () => {
  const w = loadWorker();
  const e = fetchEvent('https://thylora.example/app/private', { Authorization: 'Bearer x' });
  w.listeners.fetch(e);
  assert.equal(e.responded, null);
});

test('same-origin static asset is still cached for offline use', async () => {
  const w = loadWorker();
  const e = fetchEvent('https://thylora.example/app/styles.css');
  w.listeners.fetch(e);
  await e.responded;
  await new Promise((r) => setTimeout(r, 5));
  assert.ok(w.store.has('https://thylora.example/app/styles.css'));
});

test('activation deletes the previous cache that may hold private reads', async () => {
  const w = loadWorker();
  let done;
  w.listeners.activate({ waitUntil: (p) => { done = p; } });
  await done;
  assert.deepEqual(w.deleted, ['thylora-app-v9-witness-hotfix']);
});
