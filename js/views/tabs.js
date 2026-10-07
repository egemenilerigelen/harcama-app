// ALT SEKME ÇUBUĞU: görünümler arası geçiş (router/hash yok)
// Bağımlılık: Touch
class TabBar {
  #onShow;

  // onShow(name): sekme açıldıktan sonra yapılacaklar
  constructor({ onShow }) {
    this.#onShow = onShow;
    document.querySelectorAll('.tab').forEach(t => {
      Touch.bindPress(t, () => this.show(t.dataset.tab));
    });
  }

  show(name) {
    // Açık klavyeyi kapat (gizlenen sekmedeki inputta kalmasın)
    if (document.activeElement) document.activeElement.blur();
    document.querySelectorAll('.view').forEach(v => v.classList.toggle('active', v.dataset.view === name));
    document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === name));
    this.#onShow(name);
  }
}
