const CACHE_NAME = 'cronograma-cache-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/main.js',
  // ... outros recursos
];

self.addEventListener('install', ev => {
  ev.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', ev => {
  // Stale-while-revalidate
  ev.respondWith(
    caches.match(ev.request).then(cached => {
      const network = fetch(ev.request).then(res => {
        caches.open(CACHE_NAME).then(cache => cache.put(ev.request, res.clone()));
        return res;
      });
      return cached || network;
    })
  );
});