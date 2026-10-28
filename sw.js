// ÇEVRİMDIŞI KATMAN (service worker): önce ağ, olmazsa önbellek.
// İnternet varken her açılışta güncel sürüm gelir (push edilen değişiklikler telefona ulaşır),
// yokken son açılan sürüm çalışır. Ağdan alırken tarayıcının HTTP önbelleği atlanır (no-cache:
// sunucuya "değişti mi" diye sorulur); GitHub Pages dosyaları 10 dk önbelleklenebilir işaretliyor. Veriye dokunmaz; sadece uygulama dosyalarını saklar.
// Çekim zayıfsa ağ NETWORK_WAIT_MS içinde yanıt vermezse önbellekteki sürümle açılır; ağ yanıtı
// yine önbelleğe yazılır, yeni sürüm bir sonraki açılışta gelir (kasada açılış takılmasın).
// Yeni dosya eklenince ASSETS listesine de eklenir (eksik dosya kurulumu bozar).
const CACHE = 'harcama-v34';
const NETWORK_WAIT_MS = 2500;
const ASSETS = [
  './',
  'index.html',
  'manifest.webmanifest',
  'css/base.css',
  'css/home.css',
  'css/entry.css',
  'css/common.css',
  'css/list.css',
  'css/row.css',
  'css/summary.css',
  'css/settings.css',
  'css/controls.css',
  'css/sheets.css',
  'css/name-sheet.css',
  'css/sheet.css',
  'css/dialog.css',
  'css/undo.css',
  'css/tabbar.css',
  'css/media.css',
  'icons/apple-touch-icon.png',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'js/core/config.js',
  'js/core/storage.js',
  'js/core/calc.js',
  'js/core/categories.js',
  'js/core/domain.js',
  'js/core/format.js',
  'js/core/backup.js',
  'js/ui/dom.js',
  'js/ui/motion.js',
  'js/ui/tab-icons.js',
  'js/ui/cat-icon.js',
  'js/ui/device.js',
  'js/ui/haptics.js',
  'js/ui/touch.js',
  'js/ui/segmented.js',
  'js/ui/rolling.js',
  'js/ui/row.js',
  'js/ui/undo.js',
  'js/ui/date-choice.js',
  'js/ui/cat-choice.js',
  'js/ui/sheet.js',
  'js/ui/detail.js',
  'js/ui/goal-sheet.js',
  'js/ui/cutoff-sheet.js',
  'js/ui/name-sheet.js',
  'js/ui/ring.js',
  'js/ui/barchart.js',
  'js/ui/dialog.js',
  'js/ui/statement.js',
  'js/ui/clear-dialog.js',
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
  // Sayfa açılışı (navigate) isteğine RequestInit verilemeyebilir; adresle yeniden istenir
  const network = req.mode === 'navigate' ? fetch(req.url, { cache: 'no-cache' }) : fetch(req, { cache: 'no-cache' });
  // Ağ yanıtı önbelleğe yazılır (kopyası, sayfaya verilmeden önce alınır); geç gelse de yazılsın diye beklenir
  const saved = network.then(res => {
    if (!res.ok) return;
    const copy = res.clone();
    return caches.open(CACHE).then(c => c.put(req, copy));
  });
  e.waitUntil(saved.catch(() => {}));
  const cached = () => caches.match(req, { ignoreSearch: true });

  e.respondWith(new Promise(resolve => {
    // Ağ geç kalırsa önbellekteki sürüm; önbellekte yoksa ağı beklemeye devam
    const timer = setTimeout(() => cached().then(hit => hit && resolve(hit)), NETWORK_WAIT_MS);
    network.then(
      res => { clearTimeout(timer); resolve(res); },
      // Ağ yoksa önbellek (sayfa hiç önbellekte yoksa ana sayfa)
      () => { clearTimeout(timer); cached().then(hit => resolve(hit || caches.match('index.html'))); }
    );
  }));
});
