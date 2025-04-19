// service-worker.js
const CACHE = 'cronograma-v1';

// coloque apenas o que EXISTE realmente
const PRECACHE = [
  '/',                       // root
  '/index.html',
  '/css/style.css',
  '/js/app.js',              // ponto de entrada
  '/assets/icons/icon-192.png',
  '/assets/icons/icon-512.png'
];

self.addEventListener('install', evt => {
  evt.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(PRECACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', evt => {
  evt.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
});

self.addEventListener('fetch', evt => {
  // Network‑first → se offline devolve do cache
  evt.respondWith(
    fetch(evt.request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(evt.request, clone));
        return res;
      })
      .catch(() => caches.match(evt.request))
  );
});
