const CACHE='lms-inovasi-shell-v1.4';
const SHELL=['/','/login','/manifest.webmanifest','/icon-192.png','/icon-512.png'];

self.addEventListener('install',event=>{
  event.waitUntil(
    caches.open(CACHE)
      .then(cache=>cache.addAll(SHELL))
      .then(()=>self.skipWaiting())
  );
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin)return;
  if(url.pathname.startsWith('/api/'))return;

  // Course JSON changes between patches. Use network-first so semester updates
  // (28 -> 7 quizzes/discussions, schedules, etc.) are visible immediately.
  if(url.pathname.startsWith('/content/')){
    event.respondWith(
      fetch(event.request)
        .then(res=>{
          if(res && res.ok){
            const clone=res.clone();
            caches.open(CACHE).then(c=>c.put(event.request,clone)).catch(()=>{});
          }
          return res;
        })
        .catch(()=>caches.match(event.request))
    );
    return;
  }

  // App navigation is also network-first; cached shell is only an offline fallback.
  event.respondWith(
    fetch(event.request).catch(()=>caches.match(event.request).then(r=>r||caches.match('/login')))
  );
});
