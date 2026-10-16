// ALTTAN AÇILAN PANEL (temel sınıf): açma/kapama; içindeki [data-close] öğeleri paneli kapatır,
// panel parmakla aşağı çekilerek de kapanır. Kapanırken aşağı kayar, arka plan solar.
// Detay, hedef, kesim günü ve isim panelleri bundan türer.
// Bağımlılık: Config, Touch
class BottomSheet {
  #root;
  #panel;
  #bg;
  #timer = null;

  constructor(root) {
    this.#root = root;
    this.#panel = root.querySelector('.sheet');
    this.#bg = root.querySelector('.sheet-bg');
    root.querySelectorAll('[data-close]').forEach(n => n.addEventListener('click', () => this.close()));

    Touch.bindDismiss(this.#panel, {
      onMove: dy => this.#place(dy),
      onDismiss: () => this.close(),
      onCancel: () => this.#place(0)
    });
  }

  open() {
    clearTimeout(this.#timer);
    this.#root.classList.remove('closing');
    this.#place(0);
    this.#root.classList.add('open');
  }

  // Açıksa kayarak kapanır (çekilerek kapanıyorsa kaldığı yerden devam eder)
  close() {
    if (!this.#root.classList.contains('open') || this.#root.classList.contains('closing')) return;
    this.#root.classList.add('closing');
    this.#timer = setTimeout(() => {
      this.#root.classList.remove('open', 'closing');
      this.#place(0);
    }, Config.SHEET_CLOSE_MS);
  }

  // Sürüklerken panel parmakla kayar, arka plan kaydığı oranda solar; 0 = yerinde
  #place(dy) {
    this.#panel.style.transform = dy ? 'translateY(' + dy + 'px)' : '';
    this.#bg.style.opacity = dy > 0 ? String(Math.max(0, 1 - dy / this.#panel.offsetHeight)) : '';
  }
}
