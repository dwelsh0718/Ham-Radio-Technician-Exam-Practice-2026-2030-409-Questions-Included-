const CACHE_NAME = 'ham-trainer-v3-2026-pool';

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

    /* Existing local PWA shell, including the user's original icon files. */
    await cache.addAll(APP_SHELL);

    /*
      Pre-cache the pool and diagrams when possible. Failure here does not
      prevent installation; the page can fetch and cache them later.
    */
    await Promise.allSettled(
      REMOTE_ASSETS.map(async url => {
        const response = await fetch(url, {cache:'no-store'});

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

  /*
    Network-first for the question pool so published errata propagated by the
    source can be picked up, with the cached pool as the offline fallback.
  */
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

  /* Cache-first for app shell and diagrams. */
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
      if(event.request.mode === 'navigate'){
        const fallback = await cache.match('./index.html');

        if(fallback) return fallback;
      }

      throw error;
    }
  })());
});
