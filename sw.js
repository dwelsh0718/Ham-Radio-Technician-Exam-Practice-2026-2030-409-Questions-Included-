const CACHE_NAME = 'ham-trainer-v2-2026-09';

const POOL_URL =
  'https://raw.githubusercontent.com/russolsen/ham_radio_question_pool/refs/heads/main/technician-2026-2030/technician-2026-2030.json';

const FIGURE_BASE_URL =
  'https://raw.githubusercontent.com/russolsen/ham_radio_question_pool/refs/heads/main/technician-2026-2030/';

const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-512-maskable.png',
  './apple-touch-icon.png',
  './favicon-32.png'
];

const REMOTE_ASSETS = [
  POOL_URL,
  FIGURE_BASE_URL + 't-1.png',
  FIGURE_BASE_URL + 't-2.png',
  FIGURE_BASE_URL + 't-3.png'
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);

    // Local shell is required. If one of these fails, the service worker
    // should not claim to be ready for offline use.
    await cache.addAll(APP_SHELL);

    // Remote pool/figures are optional during installation. The page can
    // still load them normally, and successful responses are cached later.
    await Promise.allSettled(
      REMOTE_ASSETS.map(async url => {
        const response = await fetch(url, { cache: 'no-store' });
        if(response.ok || response.type === 'opaque'){
          await cache.put(url, response);
        }
      })
    );
  })());

  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );

  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if(event.request.method !== 'GET') return;

  const url = event.request.url;

  // Network-first for the question pool so future NCVEC errata propagated
  // by the mirror can be picked up while still retaining an offline fallback.
  if(url === POOL_URL){
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);

      try{
        const response = await fetch(event.request);
        if(response.ok || response.type === 'opaque'){
          await cache.put(event.request, response.clone());
        }
        return response;
      }catch(error){
        const cached = await cache.match(event.request);
        if(cached) return cached;
        throw error;
      }
    })());
    return;
  }

  // Cache-first for diagrams and the local app shell.
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(event.request);
    if(cached) return cached;

    try{
      const response = await fetch(event.request);
      if(response.ok || response.type === 'opaque'){
        await cache.put(event.request, response.clone());
      }
      return response;
    }catch(error){
      // For navigation while offline, fall back to the cached app shell.
      if(event.request.mode === 'navigate'){
        const fallback = await cache.match('./index.html');
        if(fallback) return fallback;
      }
      throw error;
    }
  })());
});
