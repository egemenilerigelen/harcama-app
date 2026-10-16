// TİTREŞİM: dokunuşa hafif titreşim. Ayarlar'dan kapatılabilir.
// Android'de titreşim API'si (navigator.vibrate) var: tap() titretir.
// iPhone Safari'de yok; tek yol iOS'un anahtarı (<input type="checkbox" switch>): anahtar değişince
// sistem titrer. iOS 26.5'ten beri koddan tıklatmak titretmiyor, parmağın gerçekten dokunması gerekiyor.
// Bu yüzden attach(el) öğenin üstüne görünmez bir etiket serer; etiketin içinde gizli bir anahtar
// vardır. Parmak öğeye dokununca etiket tıklamayı anahtara iletir, iPhone titrer; tıklama öğeye de
// ulaşır (öğenin kendi işi aynen çalışır). Titreşim parmak kalkınca olur (iPhone'un izin verdiği an).
// Tercih cihaz geneli (tek durum): App açılışta ve ayar değişince `enabled` verir.
// Bağımlılık: Config
class Haptics {
  static #on = true;
  static #ios = /iPhone|iPad|iPod/.test(navigator.userAgent)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  // Kapalıyken iPhone'daki etiketler de gizlenir (CSS: .no-haptics .haptic)
  static set enabled(on) {
    Haptics.#on = on;
    document.documentElement.classList.toggle('no-haptics', !on);
  }

  // Android: hemen titret. iPhone'da koddan titretilemez (attach edilen öğeler kendisi titrer)
  static tap() {
    if (Haptics.#on && navigator.vibrate) navigator.vibrate(Config.HAPTIC_MS);
  }

  // iPhone: öğeye dokununca titresin. Öğenin konumu yoksa CSS'te göreli olur (.haptic-host)
  static attach(el) {
    if (!Haptics.#ios || el.querySelector(':scope > .haptic')) return;
    const label = document.createElement('label');
    label.className = 'haptic';
    label.setAttribute('aria-hidden', 'true');
    const sw = document.createElement('input');
    sw.type = 'checkbox';
    sw.setAttribute('switch', '');
    sw.tabIndex = -1;
    // Etiketin anahtara ilettiği kopya tıklama öğenin tıklama işini ikinci kez tetiklemesin
    sw.addEventListener('click', e => e.stopPropagation());
    label.appendChild(sw);
    el.classList.add('haptic-host');
    el.appendChild(label);
  }
}
