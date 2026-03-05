const CACHE = 'sol-monitor-v1';
const SHELL = ['./index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

// Network first — always get fresh data from Bybit, fall back to cache for shell
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // Always network for Bybit API calls
  if (url.hostname.includes('bybit.com') || url.hostname.includes('tradingview.com')) {
    return;
  }
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
