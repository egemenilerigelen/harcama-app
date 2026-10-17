// KAYIT DETAYI: satıra dokununca alttan açılan panel. "Düzenle" ile aynı panelde isim, tutar, taksit ve
// tarih değiştirilir; tutar girişi tuş takımıyla aynı kurallarla (Calc: en fazla 9 hane, 2 ondalık).
// Tarih değişince kaydın saati korunur.
// Nereye kaydedileceğini bilmez; sonucu onSave(id, { name, amt, inst, ts }) ile dışarı verir.
// Bağımlılık: BottomSheet, Calc, DateChoice, Domain, Format, Touch, paintMoney, $
class DetailSheet extends BottomSheet {
  #panel = $('sheet').querySelector('.sheet');
  #name = $('eName');
  #amt = $('eAmt');
  #calc = new Calc(); // düzenlenen tutar
  #date = new DateChoice($('eDate'), $('eDateHint'));
  #item = null;
  #now = 0;
  #cutoff = 0;
  #inst = 1;
  #onSave;

  // onDelete(id): paneldeki "Harcamayı sil", onSave(id, değişiklik): düzenleme kaydedildi
  constructor({ onDelete, onSave }) {
    super($('sheet'));
    this.#onSave = onSave;

    $('dDel').onclick = () => {
      const id = this.#item.id;
      this.close();
      onDelete(id);
    };

    // click: iPhone klavyesi ancak dokunuşun içinden açılır (alanlara dokununca)
    $('dEdit').onclick = () => this.#setEditing(true);
    $('eCancel').onclick = () => this.#setEditing(false);
    $('eSave').onclick = () => this.#save();
    [$('dEdit'), $('eSave')].forEach(b => Touch.hapticOn(b));

    // Tutar yazılırken binlik ayraçla gösterilir; virgül ondalık (tr-TR klavyesi)
    this.#amt.addEventListener('input', () => {
      const typed = this.#amt.value.replace(/\./g, '').replace(',', '.').replace(/[^\d.]/g, '');
      this.#calc.reset();
      [...typed].forEach(k => this.#calc.press(k));
      this.#amt.value = Format.amountInput(this.#calc.raw());
    });
    // Klavyedeki Bitti: kaydet
    [this.#name, this.#amt].forEach(input => input.addEventListener('keydown', e => {
      if (e.key === 'Enter') this.#save();
    }));

    document.querySelectorAll('#eInst .inst-btn').forEach(btn => {
      btn.onclick = () => this.#setInst(Number(btn.dataset.inst));
      Touch.hapticOn(btn);
    });
  }

  // item: Store'daki asıl kayıt; panel her açılışta görüntüleme modunda
  open(item, cutoff, now) {
    const parts = Math.max(1, Number(item.inst) || 1);
    const total = Number(item.amt) || 0;

    $('dName').textContent = item.name;
    paintMoney($('dAmt'), Format.money(total));
    $('dDate').textContent = Format.longDateTime(item.ts);
    $('dPay').textContent = Format.installment(parts) + (parts > 1 ? ' × ' + Format.money(total / parts) : '');

    // Kalan taksit: henüz gelmemiş taksitler
    const rest = Domain.remainingParts(item, cutoff, now);
    $('dRestRow').style.display = parts === 1 ? 'none' : '';
    $('dRest').textContent = rest ? rest + ' taksit · ' + Format.money(rest * total / parts) : 'Tamamlandı';

    this.#item = item;
    this.#now = now;
    this.#cutoff = cutoff;
    this.#setEditing(false);
    super.open();
  }

  close() {
    this.#name.blur();
    this.#amt.blur();
    super.close();
  }

  // Düzenleme modu: alanlar kaydın değerleriyle dolar; Vazgeç değişiklikleri bırakır
  #setEditing(on) {
    if (on) {
      const item = this.#item;
      this.#name.value = item.name;
      this.#calc.set(Number(item.amt) || 0);
      this.#amt.value = Format.amountInput(this.#calc.raw());
      this.#setInst(Math.max(1, Number(item.inst) || 1));
      this.#date.reset(this.#now, this.#cutoff, item.ts);
    } else {
      this.#name.blur();
      this.#amt.blur();
    }
    this.#panel.classList.toggle('editing', on);
  }

  #setInst(n) {
    this.#inst = n;
    document.querySelectorAll('#eInst .inst-btn').forEach(b => b.classList.toggle('active', Number(b.dataset.inst) === n));
  }

  // Tutar boşsa kaydetmez; isim boşsa "Adsız" (eklemedeki gibi)
  #save() {
    const amt = this.#calc.value();
    if (!amt) return;
    const { id, ts } = this.#item;
    const changes = { name: this.#name.value.trim() || 'Adsız', amt, inst: this.#inst, ts: Domain.atDay(this.#date.day, ts) };
    this.close();
    this.#onSave(id, changes);
  }
}
