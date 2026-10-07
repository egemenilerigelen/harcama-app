// GERİ ALMA ŞERİDİ: silinen kaydı kısa bir süre geri getirilebilir tutar
// Bağımlılık: Config, $
class UndoBar {
  #bar = $('undo');
  #item = null;
  #timer = null;

  // onRestore(item): geri alınan kaydı veriye geri koyar
  constructor({ onRestore }) {
    $('undoBtn').onclick = () => {
      if (this.#item) onRestore(this.#item);
      this.hide();
    };
  }

  show(item) {
    this.#item = item;
    this.#bar.classList.add('show');
    clearTimeout(this.#timer);
    this.#timer = setTimeout(() => this.hide(), Config.UNDO_MS);
  }

  hide() {
    clearTimeout(this.#timer);
    this.#item = null;
    this.#bar.classList.remove('show');
  }
}
