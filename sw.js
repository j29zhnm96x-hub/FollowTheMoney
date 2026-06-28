const CACHE_NAME = 'ftm-v1';

const APP_SHELL = [
  './index.html',
  './manifest.json',
  './styles.css?v=2',
  './app.js?v=2',
  './theme.js?v=2',
  './seasonal.js?v=2',
  './img/favicon.png?v=2',
  './favicon.ico'
];

async function normalizeResponse(res) {
  if (!res || !res.redirected) return res;
  const body = await res.blob();
  return new Response(body, { status: res.status, statusText: res.statusText, headers: res.headers });
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const results = await Promise.allSettled(APP_SHELL.map(async (url) => {
        const res = await fetch(url);
        const normalized = await normalizeResponse(res);
        await cache.put(url, normalized);
      }));
      results.forEach((r, i) => { if (r.status === 'rejected') console.warn('SW precache failed for', APP_SHELL[i]); });
      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(key => key !== CACHE_NAME ? caches.delete(key) : null))).then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (req.mode === 'navigate') {
    event.respondWith(
      (async () => {
        const cached = await caches.match('./index.html');
        if (cached) return await normalizeResponse(cached);
        try { const res = await fetch(req); return await normalizeResponse(res); }
        catch { return new Response('Offline', { status: 503 }); }
      })()
    );
    return;
  }

  event.respondWith(
    (async () => {
      const cached = await caches.match(req);
      if (cached) return await normalizeResponse(cached);
      try {
        const res = await fetch(req);
        if (!res.ok || res.type === 'opaque') return res;
        const normalized = await normalizeResponse(res);
        const cache = await caches.open(CACHE_NAME);
        await cache.put(req, normalized.clone());
        return normalized;
      } catch { return new Response('Offline', { status: 503 }); }
    })()
  );
});
