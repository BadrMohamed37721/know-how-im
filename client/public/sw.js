const CACHE_NAME = 'know-who-i-am-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/favicon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((fetchResponse) => {
        // Cache dynamic profiles for offline use
        if (event.request.url.includes('/p/')) {
           return caches.open(CACHE_NAME).then((cache) => {
             cache.put(event.request, fetchResponse.clone());
             return fetchResponse;
           });
        }
        return fetchResponse;
      });
    }).catch(() => caches.match('/index.html'))
  );
});