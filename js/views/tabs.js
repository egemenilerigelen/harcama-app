// ALT SEKME ÇUBUĞU: havada duran cam çubuk; görünümler arası geçiş (router/hash yok).
// Seçili sekmenin altındaki kapsül, sekme değişince yeni yerine kayar (--tab-i).
// Bağımlılık: Touch, el
class TabBar {
  #onShow;
  #bar = document.querySelector('.tabbar');
  #tabs = [...document.querySelectorAll('.tab')];

  // onShow(name): sekme açıldıktan sonra yapılacaklar
  constructor({ onShow }) {
    this.#onShow = onShow;
    const pill = el('span', 'tab-pill');
    pill.setAttribute('aria-hidden', 'true');
    this.#bar.prepend(pill);
    this.#tabs.forEach(t => {
      Touch.bindPress(t, () => this.show(t.dataset.tab));
    });
  }

  show(name) {
    // Açık klavyeyi kapat (gizlenen sekmedeki inputta kalmasın)
    if (document.activeElement) document.activeElement.blur();
    document.querySelectorAll('.view').forEach(v => v.classList.toggle('active', v.dataset.view === name));
    this.#tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === name));
    this.#bar.style.setProperty('--tab-i', this.#tabs.findIndex(t => t.dataset.tab === name));
    this.#onShow(name);
  }
}
