const CACHE='thylora-app-v9-witness-hotfix';
const ASSETS=['/app/','/app/index.html','/app/styles.css','/app/app.js','/app/hotfix-build7-witness.js','/app/manifest.webmanifest','/app/time-run.html','/app/time-run.css','/app/time-run.js'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)))});
self.addEventListener('activate',e=>e.waitUntil(Promise.all([self.clients.claim(),caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))])));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const url=new URL(e.request.url);
  if(url.origin===self.location.origin&&url.pathname==='/app/app.js'){
    e.respondWith(Promise.all([
      fetch('/app/app.js',{cache:'no-store'}).then(r=>r.text()),
      fetch('/app/hotfix-build7-witness.js',{cache:'no-store'}).then(r=>r.text())
    ]).then(([base,hotfix])=>new Response(`${base}\n\n${hotfix}`,{headers:{'Content-Type':'application/javascript; charset=utf-8','Cache-Control':'no-store'}})).catch(()=>caches.match(e.request)));
    return;
  }
  e.respondWith(fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return r}).catch(()=>caches.match(e.request)));
});
