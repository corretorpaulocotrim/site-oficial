/* =====================================================
   SERVICE WORKER — Paulo Cotrim Site Oficial
   Versão: 3.0 | Estratégia: Cache-First para assets,
   Network-First para HTML
   ===================================================== */

const CACHE_NAME = 'paulocotrim-v42';
const CACHE_STATIC = 'paulocotrim-static-v15';

// Arquivos essenciais para cache (carregam offline)
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/logo-header.png',
  '/logo-paulo-cotrim-2.png',
  '/01.jpeg',
  '/02.jpeg',
  '/03.jpeg',
  '/paulo-cotrim-profissional.jpeg',
  '/img-luzes.jpg',
  '/img-porto.jpg',
  '/img-piedade.jpg',
  '/img-cristovao.jpg',
  '/img-niteroi.jpg',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap'
];

// ── INSTALL: pré-cache dos assets essenciais
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_STATIC).then(function(cache) {
      return cache.addAll(PRECACHE_ASSETS);
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

// ── ACTIVATE: limpar caches antigos
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) {
          return key !== CACHE_STATIC && key !== CACHE_NAME;
        }).map(function(key) {
          return caches.delete(key);
        })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// ── FETCH: estratégia inteligente
self.addEventListener('fetch', function(e) {
  var url = new URL(e.request.url);

  // Ignorar requisições não-GET
  if (e.request.method !== 'GET') return;

  // Ignorar Analytics, WhatsApp, APIs externas
  if (url.hostname !== location.hostname &&
      !url.hostname.includes('fonts.googleapis') &&
      !url.hostname.includes('fonts.gstatic')) {
    return;
  }

  // HTML: Network-First (sempre fresco, fallback no cache)
  if (e.request.headers.get('accept') &&
      e.request.headers.get('accept').includes('text/html')) {
    e.respondWith(
      fetch(e.request, { cache: 'reload' })
        .then(function(res) {
          var clone = res.clone();
          caches.open(CACHE_NAME).then(function(c) { c.put(e.request, clone); });
          return res;
        })
        .catch(function() {
          return caches.match(e.request).then(function(cached) {
            return cached || caches.match('/index.html');
          });
        })
    );
    return;
  }

  // Imagens e assets: Cache-First (rápido + offline)
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      if (cached) return cached;
      return fetch(e.request).then(function(res) {
        if (!res || res.status !== 200) return res;
        var clone = res.clone();
        caches.open(CACHE_STATIC).then(function(c) { c.put(e.request, clone); });
        return res;
      }).catch(function() {
        // Fallback para imagens offline
        if (e.request.destination === 'image') {
          return new Response(
            '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect fill="#0d2040" width="400" height="300"/><text fill="#c9993a" font-family="sans-serif" font-size="18" x="50%" y="50%" text-anchor="middle" dy=".3em">Paulo Cotrim</text></svg>',
            { headers: { 'Content-Type': 'image/svg+xml' } }
          );
        }
      });
    })
  );
});

// ── PUSH NOTIFICATIONS (futuro uso)
self.addEventListener('push', function(e) {
  if (!e.data) return;
  var data = e.data.json();
  e.waitUntil(
    self.registration.showNotification(data.title || 'Paulo Cotrim', {
      body: data.body || 'Novidade no site!',
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      tag: 'paulo-cotrim-notif',
      data: { url: data.url || '/' }
    })
  );
});

self.addEventListener('notificationclick', function(e) {
  e.notification.close();
  e.waitUntil(clients.openWindow(e.notification.data.url || '/'));
});
