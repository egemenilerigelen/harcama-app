// HAREKET: bir şey olunca oynayan kısa animasyonlar (Web Animations API, kütüphane yok).
// Rakamlar beklemez: öğe zaten son halinde çizilidir, hareket üstüne oynar (fill: backwards).
// Dokununca ya da kaydırınca bütün hareketler hemen biter; "Hareketi Azalt" açıksa hiç oynamaz.
// Eğriler CSS'te (:root --ease, --spring-soft ...): CSS ve JS aynı kaynaktan okur.
// Durum tutmaz: süren hareketler belgeden bulunur (id).
// Bağımlılık: yok
const Motion = Object.freeze({
  ID: 'motion',

  // el.animate gibi; ms süre, curve :root'taki eğrinin adı, delay gecikme (ms)
  play(el, frames, ms, curve = '--ease', delay = 0) {
    const a = Motion.feedback(el, frames, ms, curve, delay);
    if (a) a.id = Motion.ID;
  },

  // Dokunuşun kendi geri bildirimi (sekme ikonu): dokunuşla başladığı için dokunma ve kaydırma onu bitirmez.
  // Hareketi Azalt'ta oynamaz (null döner)
  feedback(el, frames, ms, curve = '--ease', delay = 0) {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return null;
    const easing = getComputedStyle(document.documentElement).getPropertyValue(curve).trim() || 'ease';
    return el.animate(frames, { duration: ms, delay, easing, fill: 'backwards' });
  },

  // Süren hareketleri son haline atlat
  finish() {
    document.getAnimations().forEach(a => {
      if (a.id === Motion.ID) a.finish();
    });
  }
});

// Kullanıcı dokunur ya da kaydırırsa hareket onu bekletmez
['pointerdown', 'wheel', 'touchmove'].forEach(type =>
  window.addEventListener(type, Motion.finish, { passive: true, capture: true }));
