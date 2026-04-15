/* ═══════════════════════════════════════════════════════════════
   SafetyPro AI — Service Worker v1.0
   Offline-first strategy: Cache static assets, serve from cache
   HIRA data persisted via IndexedDB (injected on main page)
═══════════════════════════════════════════════════════════════ */
const CACHE_NAME   = 'safetypro-audit-v1';
const RUNTIME_CACHE = 'safetypro-runtime-v1';

/* Assets to pre-cache on install */
const PRECACHE_ASSETS = [
  '/safetypro_audit_compliance',
  '/safetypro_audit_compliance.html',
  'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
];

/* ── INSTALL: pre-cache static assets ── */
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return Promise.allSettled(
        PRECACHE_ASSETS.map(function(url) {
          return cache.add(url).catch(function(e) {
            console.warn('[SW] Failed to pre-cache:', url, e.message);
          });
        })
      );
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

/* ── ACTIVATE: clean old caches ── */
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames
          .filter(function(name) { return name !== CACHE_NAME && name !== RUNTIME_CACHE; })
          .map(function(name) { return caches.delete(name); })
      );
    }).then(function() { return self.clients.claim(); })
  );
});

/* ── FETCH: cache-first for static, network-first for API ── */
self.addEventListener('fetch', function(event) {
  var url = event.request.url;

  /* Skip non-GET and cross-origin API calls */
  if (event.request.method !== 'GET') return;
  if (url.includes('api.anthropic.com')) return;
  if (url.includes('railway.app') || url.includes('/api/')) return;

  /* CDN assets: cache-first */
  if (url.includes('cdnjs.cloudflare.com') || url.includes('cdn.jsdelivr.net')) {
    event.respondWith(
      caches.match(event.request).then(function(cached) {
        return cached || fetch(event.request).then(function(response) {
          var clone = response.clone();
          caches.open(RUNTIME_CACHE).then(function(cache) { cache.put(event.request, clone); });
          return response;
        });
      })
    );
    return;
  }

  /* Main page: network-first, fallback to cache */
  if (url.includes('safetypro_audit_compliance')) {
    event.respondWith(
      fetch(event.request).then(function(response) {
        var clone = response.clone();
        caches.open(CACHE_NAME).then(function(cache) { cache.put(event.request, clone); });
        return response;
      }).catch(function() {
        return caches.match(event.request).then(function(cached) {
          return cached || caches.match('/safetypro_audit_compliance');
        });
      })
    );
    return;
  }

  /* Default: stale-while-revalidate */
  event.respondWith(
    caches.match(event.request).then(function(cached) {
      var networkFetch = fetch(event.request).then(function(response) {
        if (response && response.status === 200) {
          var clone = response.clone();
          caches.open(RUNTIME_CACHE).then(function(cache) { cache.put(event.request, clone); });
        }
        return response;
      }).catch(function() { return cached; });
      return cached || networkFetch;
    })
  );
});

/* ── MESSAGE: force update from page ── */
self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
