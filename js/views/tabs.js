// ALT SEKME ÇUBUĞU: havada duran cam çubuk; görünümler arası geçiş (router/hash yok).
// Seçili sekmenin altındaki kapsül, sekme değişince yeni yerine kayar (--tab-i).
// Parmak çubukta sağa sola gezdirilebilir (iOS 26 / Instagram gibi): kapsül parmağı izler, biraz büyür,
// parmak hangi sekmenin üstüne gelirse o sekme hemen açılır; bırakınca kapsül sekmenin yerine oturur.
// Bağımlılık: Touch, el
class TabBar {
  #onShow;
  #bar = document.querySelector('.tabbar');
  #tabs = [...document.querySelectorAll('.tab')];
  #pill = el('span', 'tab-pill');
  #current = 'home';
  #x0 = 0;      // sürüklemenin başladığı nokta (px)
  #first = null; // ilk sekmenin yeri ve genişliği (sürükleme başında ölçülür)

  // onShow(name): sekme açıldıktan sonra yapılacaklar
  constructor({ onShow }) {
    this.#onShow = onShow;
    this.#pill.setAttribute('aria-hidden', 'true');
    this.#bar.prepend(this.#pill);
    this.#tabs.forEach(t => {
      Touch.bindPress(t, () => this.show(t.dataset.tab));
    });

    this.#bar.addEventListener('pointerdown', e => (this.#x0 = e.clientX));
    Touch.trackDrag(this.#bar, 'x', {
      onStart: () => {
        const r = this.#tabs[0].getBoundingClientRect();
        this.#first = { left: r.left, width: r.width };
        this.#bar.classList.add('dragging');
      },
      onMove: dx => this.#follow(this.#x0 + dx),
      onEnd: () => {
        this.#bar.classList.remove('dragging');
        this.#bar.style.removeProperty('--pill-x');
      }
    });
  }

  show(name) {
    this.#current = name;
    // Açık klavyeyi kapat (gizlenen sekmedeki inputta kalmasın)
    if (document.activeElement) document.activeElement.blur();
    document.querySelectorAll('.view').forEach(v => v.classList.toggle('active', v.dataset.view === name));
    this.#tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === name));
    this.#bar.style.setProperty('--tab-i', this.#tabs.findIndex(t => t.dataset.tab === name));
    this.#onShow(name);
  }

  // Kapsül parmağın altında (ortası parmakta, çubuğun içinde kalır); altındaki sekme açılır
  #follow(x) {
    const { left, width } = this.#first;
    const last = this.#tabs.length - 1;
    const pillX = Math.min(Math.max(x - left - width / 2, 0), last * width);
    this.#bar.style.setProperty('--pill-x', pillX + 'px');

    const i = Math.min(Math.max(Math.floor((x - left) / width), 0), last);
    const name = this.#tabs[i].dataset.tab;
    if (name !== this.#current) {
      Touch.haptic();
      this.show(name);
    }
  }
}
