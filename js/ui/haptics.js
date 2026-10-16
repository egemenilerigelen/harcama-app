// TİTREŞİM: dokunuşa hafif titreşim. Android'de titreşim API'si (navigator.vibrate) var;
// iPhone Safari'de yok. iOS 18+ anahtar (switch) türü onay kutusu değişince sistem titreşimi verir:
// gizli bir anahtarın etiketine tıklanarak tetiklenir. Ayarlar'dan kapatılabilir.
// Tercih cihaz geneli (tek durum): App açılışta ve ayar değişince `enabled` verir.
// Bağımlılık: Config
class Haptics {
  static #on = true;
  static #label = null;
  static #waiting = false;

  static set enabled(on) {
    Haptics.#on = on;
  }

  static tap() {
    if (!Haptics.#on) return;
    if (navigator.vibrate) {
      navigator.vibrate(Config.HAPTIC_MS);
      return;
    }
    // iPhone anahtarı ancak kullanıcı etkileşiminin içinde titrer; dokunmatikte pointerdown bunu
    // saymaz, parmak kalkınca (pointerup) sayar. Etkileşim yoksa o ana bırakılır, bir dokunuşta bir kez.
    const act = navigator.userActivation;
    if (!act || act.isActive) {
      Haptics.#toggle();
      return;
    }
    if (Haptics.#waiting) return;
    Haptics.#waiting = true;
    const done = e => {
      window.removeEventListener('pointerup', done, true);
      window.removeEventListener('pointercancel', done, true);
      Haptics.#waiting = false;
      if (e.type === 'pointerup') Haptics.#toggle();
    };
    window.addEventListener('pointerup', done, true);
    window.addEventListener('pointercancel', done, true);
  }

  // Gizli anahtar ilk titreşimde kurulur, sonra hep aynısı kullanılır (odak almaz, klavyeyi kapatmaz)
  static #toggle() {
    if (!Haptics.#label) {
      const label = document.createElement('label');
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.setAttribute('switch', '');
      input.tabIndex = -1;
      label.setAttribute('aria-hidden', 'true');
      label.style.display = 'none';
      label.appendChild(input);
      document.body.appendChild(label);
      Haptics.#label = label;
    }
    Haptics.#label.click();
  }
}
