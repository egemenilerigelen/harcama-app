// GİRİŞ PANELİ (1. adım): tutar ekranı ve tuş takımı. İsim ve taksit 2. adımda (NameSheet).
// Kaydın nereye gideceğini bilmez; girilen tutarı onNext ile dışarı verir.
// Bağımlılık: Calc, Config, Format, Touch, $, el
class EntryPanel {
  static #KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'NEXT'];

  #calc = new Calc(); // tutar girişinin durumu
  #onNext;
  #amt = $('amt');

  // onNext(amt): tutar girildi, isim adımına geç
  constructor({ onNext }) {
    this.#onNext = onNext;
    this.#buildPad();
    Touch.bindPress($('back'), () => {
      this.#calc.back();
      this.#renderAmount();
    });
    this.#renderAmount();
  }

  // Kayıt eklendi: tutarı sıfırla. (İsim adımından vazgeçilirse tutar kalır, düzeltilebilir)
  clear() {
    this.#calc.reset();
    this.#renderAmount();
  }

  #buildPad() {
    EntryPanel.#KEYS.forEach(k => {
      if (k === 'NEXT') {
        // Devam: basma efekti pointerdown'da, geçiş click'te; isim adımının klavyesi ancak
        // dokunuşun içinden açılır (iPhone pointerdown'da odaklanınca klavyeyi açmıyor)
        const b = el('button', 'add', 'Devam');
        Touch.bindPress(b, () => {});
        b.onclick = () => this.#next();
        $('pad').appendChild(b);
        return;
      }
      const b = el('button', '', k);
      Touch.bindPress(b, () => {
        this.#calc.press(k);
        this.#renderAmount();
      });
      $('pad').appendChild(b);
    });
  }

  #renderAmount() {
    const text = Format.amountInput(this.#calc.raw());
    this.#amt.textContent = text;
    this.#amt.classList.toggle('sm', text.length > Config.AMOUNT_SM_LEN && text.length <= Config.AMOUNT_XS_LEN);
    this.#amt.classList.toggle('xs', text.length > Config.AMOUNT_XS_LEN);
    document.body.classList.toggle('has-amt', this.#calc.value() > 0);
  }

  #next() {
    const amt = this.#calc.value();
    if (amt > 0) this.#onNext(amt);
  }
}
