/* =====================================================
   SERVICE WORKER — Paulo Cotrim Site Oficial
   Estratégia: HTML sempre da rede (network-first) para
   nunca mostrar versão velha; assets estáticos rápidos
   (stale-while-revalidate). Atualiza NA HORA (skipWaiting).
   ===================================================== */
const CACHE_NAME = 'paulocotrim-v78';

self.addEventListener('install', function (e) {
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil((async function () {
    var keys = await caches.keys();
    await Promise.all(keys.filter(function (k) { return k !== CACHE_NAME; })
                          .map(function (k) { return caches.delete(k); }));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url;
  try { url = new URL(req.url); } catch (err) { return; }
  if (url.origin !== self.location.origin) return; // só mesmo domínio

  var isHTML = req.mode === 'navigate' ||
               (req.headers.get('accept') || '').indexOf('text/html') >= 0;

  if (isHTML) {
    // HTML: rede primeiro (sempre o mais novo), cache só como fallback offline
    e.respondWith((async function () {
      try {
        var fresh = await fetch(req);
        var c = await caches.open(CACHE_NAME);
        c.put(req, fresh.clone());
        return fresh;
      } catch (err) {
        var cached = await caches.match(req);
        return cached || caches.match('/index.html');
      }
    })());
    return;
  }

  // Estáticos (css/js/img): mostra o cache e atualiza em segundo plano
  e.respondWith((async function () {
    var cached = await caches.match(req);
    var network = fetch(req).then(function (res) {
      caches.open(CACHE_NAME).then(function (c) { c.put(req, res.clone()); });
      return res;
    }).catch(function () { return cached; });
    return cached || network;
  })());
});
