// ÇEVRİMDIŞI KATMAN (service worker): önce ağ, olmazsa önbellek.
// İnternet varken her açılışta güncel sürüm gelir (push edilen değişiklikler telefona ulaşır),
// yokken son açılan sürüm çalışır. Veriye dokunmaz; sadece uygulama dosyalarını saklar.
// Yeni dosya eklenince ASSETS listesine de eklenir (eksik dosya kurulumu bozar).
const CACHE = 'harcama-v1';
const ASSETS = [
  './',
  'index.html',
  'manifest.webmanifest',
  'css/style.css',
  'icons/apple-touch-icon.png',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'js/core/config.js',
  'js/core/storage.js',
  'js/core/calc.js',
  'js/core/domain.js',
  'js/core/format.js',
  'js/core/backup.js',
  'js/ui/dom.js',
  'js/ui/device.js',
  'js/ui/touch.js',
  'js/ui/row.js',
  'js/ui/undo.js',
  'js/ui/sheet.js',
  'js/ui/detail.js',
  'js/ui/goal-sheet.js',
  'js/ui/cutoff-sheet.js',
  'js/ui/ring.js',
  'js/ui/barchart.js',
  'js/views/entry.js',
  'js/views/home.js',
  'js/views/list.js',
  'js/views/summary.js',
  'js/views/settings.js',
  'js/views/tabs.js',
  'js/app.js'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

// Eski sürümlerin önbelleğini temizle, açık sayfaları hemen devral
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    fetch(req)
      .then(res => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req, { ignoreSearch: true }).then(hit => hit || caches.match('index.html')))
  );
});
