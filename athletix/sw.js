var CACHE_NAME = 'athletix-v63';
var URLS_TO_CACHE = [
  './', './index.html', './manifest.json',
  './css/theme.css', './css/app.css',
  './js/config.js', './js/i18n.js',
  './js/storage.js', './js/core.js', './js/timers.js',
  './js/athletes.js', './js/wallet.js', './js/status.js',
  './js/diary.js', './js/reports.js', './js/plans.js', './js/data.js', './js/settings.js',
  './js/supabase-config.js', './js/sync.js',
  'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap'
];

self.addEventListener('install', function(e) {
  e.waitUntil(caches.open(CACHE_NAME).then(function(cache) { return cache.addAll(URLS_TO_CACHE); }));
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(caches.keys().then(function(names) {
    return Promise.all(names.filter(function(n) { return n !== CACHE_NAME; }).map(function(n) { return caches.delete(n); }));
  }));
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  // Don't cache POST/DELETE/PATCH (Supabase API calls)
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      if (e.request.mode === 'navigate') {
        return fetch(e.request).then(function(r) {
          if (r.ok) { var c = r.clone(); caches.open(CACHE_NAME).then(function(cache) { cache.put(e.request, c); }); }
          return r;
        }).catch(function() { return cached; });
      }
      return cached || fetch(e.request).then(function(r) {
        if (r.ok) { var c = r.clone(); caches.open(CACHE_NAME).then(function(cache) { cache.put(e.request, c); }); }
        return r;
      });
    })
  );
});
