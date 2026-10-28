// CİHAZ: ana ekran uygulaması, çevrimdışı katman, kalıcı depolama, dosya paylaşma / seçme.
// Tarayıcı yeteneklerine tek kapı; desteklenmeyen yerde (file://, eski tarayıcı) sessizce geri çekilir.
// Bağımlılık: yok
const Device = Object.freeze({
  // Ana ekrana eklenmiş uygulama olarak mı açıldı
  isStandalone() {
    return navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches;
  },

  // Çevrimdışı katman: sadece http(s) üzerinden (file:// ile açılınca yok)
  registerOffline() {
    if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    }
  },

  // Yayındaki sürüm (config.js'teki VERSION); ulaşılamazsa null. Ağdan sorulur (HTTP önbelleği atlanır)
  async latestVersion() {
    try {
      const res = await fetch('js/core/config.js?t=' + Date.now(), { cache: 'no-store' });
      const match = /VERSION:\s*'([^']+)'/.exec(await res.text());
      return match ? match[1] : null;
    } catch (e) {
      return null;
    }
  },

  // Yeni sürümü alır: çevrimdışı katman güncellenir, sayfa yenilenir (veri localStorage'da kalır)
  async reload() {
    const reg = 'serviceWorker' in navigator ? await navigator.serviceWorker.getRegistration() : null;
    if (reg) await reg.update().catch(() => {});
    location.reload();
  },

  // Tarayıcıdan verilerin kendiliğinden silinmemesini ister (destekleniyorsa)
  persistStorage() {
    if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
  },

  // Ekran klavyesinin sayfanın altından ne kadarını kapattığı (px); değişince cb(px).
  // iPhone klavyesi sayfayı küçültmez, üstüne biner; görünen alan (visualViewport) küçülür.
  watchKeyboard(cb) {
    const vv = window.visualViewport;
    if (!vv) return;
    const update = () => cb(Math.max(0, Math.round(window.innerHeight - vv.height - vv.offsetTop)));
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
  },

  // Dosyayı verir: dokunmatik cihazda paylaşım menüsü (iPhone: Dosyalar'a kaydet, iCloud, mesaj),
  // bilgisayarda indirme. Kullanıcı paylaşımdan vazgeçerse false. Dokunma olayının içinden çağrılmalı.
  async saveFile(name, type, text) {
    const file = new File([text], name, { type });
    const touch = window.matchMedia('(pointer: coarse)').matches;
    if (touch && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file] });
        return true;
      } catch (e) {
        if (e.name === 'AbortError') return false; // vazgeçti
        // Paylaşım açılamadıysa indirmeye düş
      }
    }
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
  },

  // Dosya seçtirir, içeriğini metin olarak verir (vazgeçilirse söz hiç dönmeyebilir).
  // Dokunma olayının içinden çağrılmalı.
  pickFile(accept) {
    return new Promise(resolve => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = accept;
      input.onchange = () => {
        const file = input.files[0];
        if (!file) return resolve(null);
        file.text().then(resolve, () => resolve(null));
      };
      input.click();
    });
  }
});
