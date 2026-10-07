// GİRİŞ PANELİ: isim, taksit seçimi, tutar ekranı ve tuş takımı
// Kaydın nereye yazılacağını bilmez; hazır kaydı onAdd ile dışarı verir.
// Bağımlılık: Calc, Config, Format, Touch, $, el
class EntryPanel {
  static #KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'EKLE'];

  #inst = 1;
  #onAdd;
  #entry = $('entry');
  #name = $('name');
  #amt = $('amt');

  // onAdd({ name, amt, inst }): yeni kayıt
  constructor({ onAdd }) {
    this.#onAdd = onAdd;
    this.#buildPad();
    this.#bindInstallments();
    Touch.bindPress($('back'), () => {
      Calc.back();
      this.#renderAmount();
    });
    this.#renderAmount();
  }

  #buildPad() {
    EntryPanel.#KEYS.forEach(k => {
      const b = el('button', k === 'EKLE' ? 'add' : '', k === 'EKLE' ? 'Ekle' : k);
      Touch.bindPress(b, k === 'EKLE' ? () => this.#add() : () => {
        Calc.press(k);
        this.#renderAmount();
      });
      $('pad').appendChild(b);
    });
  }

  // Taksit: küçük düğme; dokununca seçenekler aynı satırda açılır, seçince kapanır
  #bindInstallments() {
    Touch.bindPress($('instChip'), () => this.#entry.classList.add('picking'));

    document.querySelectorAll('.inst-btn').forEach(btn => {
      btn.onclick = () => {
        this.#setInst(Number(btn.dataset.inst));
        Touch.haptic();
      };
    });

    // Seçenekler açıkken başka yere dokunulursa kapat
    document.addEventListener('pointerdown', e => {
      if (!e.target.closest('#entry')) this.#entry.classList.remove('picking');
    });
  }

  #setInst(n) {
    this.#inst = n;
    document.querySelectorAll('.inst-btn').forEach(b => b.classList.toggle('active', Number(b.dataset.inst) === n));
    $('instLabel').textContent = Format.installment(n);
    $('instChip').classList.toggle('set', n > 1);
    this.#entry.classList.remove('picking');
  }

  #renderAmount() {
    const text = Format.amountInput(Calc.raw());
    this.#amt.textContent = text;
    this.#amt.classList.toggle('sm', text.length > Config.AMOUNT_SM_LEN && text.length <= Config.AMOUNT_XS_LEN);
    this.#amt.classList.toggle('xs', text.length > Config.AMOUNT_XS_LEN);
    document.body.classList.toggle('has-amt', Calc.value() > 0);
  }

  #add() {
    const amt = Calc.value();
    if (amt <= 0) return;

    const entry = { name: this.#name.value.trim() || 'Adsız', amt, inst: this.#inst };

    // Paneli sıfırla: tutar, isim, taksit tek çekime
    Calc.reset();
    this.#name.value = '';
    this.#setInst(1);
    this.#renderAmount();

    this.#onAdd(entry);
  }
}
