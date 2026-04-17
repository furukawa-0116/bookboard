var CACHE_NAME = 'bookboard-v1';
var URLS = [
  '/bookboard/',
  '/bookboard/index.html',
  '/bookboard/manifest.json',
  '/bookboard/icon-192.png',
  '/bookboard/icon-512.png',
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(URLS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(
        names.filter(function(n) { return n !== CACHE_NAME; })
             .map(function(n) { return caches.delete(n); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  // API calls go to network
  if (e.request.url.includes('googleapis.com')) {
    e.respondWith(fetch(e.request));
    return;
  }
  // App files: cache first, then network
  e.respondWith(
    caches.match(e.request).then(function(res) {
      return res || fetch(e.request).then(function(fetchRes) {
        return caches.open(CACHE_NAME).then(function(cache) {
          cache.put(e.request, fetchRes.clone());
          return fetchRes;
        });
      });
    })
  );
});
