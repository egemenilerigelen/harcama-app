// GERİ ALMA ŞERİDİ: son işlemi (silme, ekleme) kısa bir süre geri alınabilir tutar.
// Neyin nasıl geri alınacağını bilmez; show(metin, geriAl) ile verilir.
// Bağımlılık: Config, $
class UndoBar {
  #bar = $('undo');
  #text = $('undoText');
  #undo = null;
  #timer = null;

  constructor() {
    $('undoBtn').onclick = () => {
      const undo = this.#undo;
      this.hide();
      if (undo) undo();
    };
  }

  // text: ne oldu ("Harcama eklendi"), undo(): işlemi geri alır
  show(text, undo) {
    this.#text.textContent = text;
    this.#undo = undo;
    this.#bar.classList.add('show');
    clearTimeout(this.#timer);
    this.#timer = setTimeout(() => this.hide(), Config.UNDO_MS);
  }

  hide() {
    clearTimeout(this.#timer);
    this.#undo = null;
    this.#bar.classList.remove('show');
  }
}
