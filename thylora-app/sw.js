// THYLORA APP · service worker
// Workroom: WR-THYAPP-001
//
// Scope is /thylora-app/ only, with its own cache name, so it never competes
// with the member app's worker at /app/.
//
// Network-first for the shell's own files, cache only as an offline fallback.
// Backend requests are deliberately NOT cached: a stale transmission list or a
// stale approval queue read as current data, which is exactly the failure this
// lane must not introduce.

const CACHE = 'thylora-shell-v1';
const ASSETS = [
  '/thylora-app/',
  '/thylora-app/index.html',
  '/thylora-app/styles.css',
  '/thylora-app/app.js',
  '/thylora-app/manifest.webmanifest',
  '/thylora-app/lib/registry.js',
  '/thylora-app/lib/identity.js',
  '/thylora-app/lib/router.js',
  '/thylora-app/lib/state.js',
  '/thylora-app/lib/analytics.js',
  '/thylora-app/lib/media-studio.js',
  '/rae-link/lib/pipeline.js',
  '/lib/thylora-backend.js'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  // One missing asset must not fail the whole install.
  event.waitUntil(caches.open(CACHE).then(cache =>
    Promise.all(ASSETS.map(asset => cache.add(asset).catch(() => null)))));
});

self.addEventListener('activate', event => event.waitUntil(Promise.all([
  self.clients.claim(),
  caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
])));

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  // Never serve backend reads from cache.
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        const copy = response.clone();
        caches.open(CACHE).then(cache => cache.put(event.request, copy)).catch(() => {});
        return response;
      })
      .catch(() => caches.match(event.request).then(hit => hit ?? caches.match('/thylora-app/index.html')))
  );
});
