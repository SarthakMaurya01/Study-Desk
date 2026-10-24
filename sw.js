const CACHE_NAME = 'study-desk-v2';
const APP_SHELL = [
  '/', '/manifest.webmanifest', '/icons/study-mark.svg', '/icons/study-mark-192.png', '/icons/study-mark-512.png',
  '/tesseract/worker.min.js', '/tesseract/core/tesseract-core-lstm.wasm.js',
  '/tesseract/core/tesseract-core-lstm.wasm', '/tesseract/lang/eng.traineddata', '/tesseract/lang/hin.traineddata',
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(APP_SHELL);
    try {
      const response = await fetch('/precache-manifest.json');
      if (response.ok) {
        const manifest = await response.json();
        const builtFiles = Object.values(manifest)
          .flatMap((entry) => [entry.file, ...(entry.css || []), ...(entry.assets || [])])
          .filter(Boolean)
          .map((path) => `/${path.replace(/^\//, '')}`);
        await cache.addAll([...new Set(builtFiles)]);
      }
    } catch (error) {
      // Vite dev mode does not emit the production manifest; same-origin files cache on use.
    }
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((key) => key.startsWith('study-desk-') && key !== CACHE_NAME).map((key) => caches.delete(key))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    if (cached) return cached;
    try {
      const response = await fetch(request);
      if (response.ok && (request.destination === 'script' || request.destination === 'style' || request.destination === 'font' || request.destination === 'image' || request.destination === 'worker' || url.pathname.startsWith('/tesseract/'))) {
        await cache.put(request, response.clone());
      }
      return response;
    } catch (error) {
      if (request.mode === 'navigate') return cache.match('/');
      throw error;
    }
  })());
});
