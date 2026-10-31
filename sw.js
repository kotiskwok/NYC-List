// Offline support: map data and libraries come from the cache first (they rarely change);
// the page, app code and config always try the network first so updates arrive right away.
// Requests to other sites (Supabase, Google Maps, fonts) are never touched.
const CACHE = 'nyc-list-v22';
const CORE = ['/', '/index.html', '/config.js', '/manifest.webmanifest',
  '/src/runtime.js', '/src/native.js', '/src/sync.js', '/src/video.js', '/src/logic.js', '/src/lists.js', '/src/view.js',
  '/vendor/react.production.min.js', '/vendor/react-dom.production.min.js', '/vendor/htm.umd.js',
  '/vendor/leaflet.js', '/vendor/leaflet.css', '/vendor/supabase.js',
  '/data/nyc-map-data.js', '/data/nyc-subway-data.js', '/data/nyc-streets-data.js'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  const cacheFirst = url.pathname.startsWith('/data/') || url.pathname.startsWith('/vendor/') || url.pathname.startsWith('/icons/');
  if (cacheFirst) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
      const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return res;
    })));
  } else {
    e.respondWith(fetch(req).then(res => {
      const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return res;
    }).catch(() => caches.match(req).then(hit => hit || caches.match('/index.html'))));
  }
});
