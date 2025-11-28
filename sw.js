const CACHE_VERSION = 'v1';
const CACHE_NAME = `followthemoney-static-${CACHE_VERSION}`;
const CORE_ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './seasonal.js',
  './manifest.json',
  './img/favicon.png?v=2',
  './favicon.ico'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CORE_ASSETS))
      .catch(err => console.warn('SW install cache error', err))
      .finally(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key.startsWith('followthemoney-static-') && key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', event => {
  if(event.data && event.data.type === 'SKIP_WAITING'){
    self.skipWaiting();
  }
});

self.addEventListener('fetch', event => {
  const { request } = event;
  if(request.method !== 'GET') return;
  const url = new URL(request.url);
  if(url.origin !== self.location.origin) return;
  const acceptHeader = request.headers.get('accept') || '';
  const acceptsHTML = acceptHeader.indexOf('text/html') !== -1;

  if(acceptsHTML){
    event.respondWith(
      fetch(request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => {
      const networkFetch = fetch(request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
          return response;
        })
        .catch(() => cached);
      return cached || networkFetch;
    })
  );
});
