// İSİM ADIMI (girişin 2. adımı): tutardan sonra alttan açılır. İsim yazılır ya da sık kullanılan
// isimlerden biri seçilir (çipe dokunmak kaydı hemen ekler), taksit ve tarih (Bugün · Dün · Takvim) burada seçilir.
// Klavye açıkken panel klavyenin hemen üstünde durur (BottomSheet).
// Nereye kaydedileceğini bilmez; sonucu onAdd({ name, amt, inst, day }) ile dışarı verir (day: seçilen günün başı).
// Bağımlılık: BottomSheet, DateChoice, Format, Touch, $, el
class NameSheet extends BottomSheet {
  #input = $('nName');
  #chips = $('nChips');
  #names = [];
  #amt = 0;
  #inst = 1;
  #date = new DateChoice($('nDate'), $('nDateHint'));
  #onAdd;

  constructor({ onAdd }) {
    super($('nameSheet'));
    this.#onAdd = onAdd;

    // Klavyeyle Ekle (Return); yazdıkça çipler süzülür
    this.#input.addEventListener('keydown', e => {
      if (e.key === 'Enter') this.#add(this.#input.value);
    });
    this.#input.addEventListener('input', () => this.#renderChips());
    $('nAdd').onclick = () => this.#add(this.#input.value);
    Touch.hapticOn($('nAdd'));

    document.querySelectorAll('#nInst .inst-btn').forEach(btn => {
      btn.onclick = () => this.#setInst(Number(btn.dataset.inst));
      Touch.hapticOn(btn);
    });
  }

  // Dokunma olayının içinden çağrılmalı ki iPhone klavyeyi açsın.
  // amt: girilen tutar, names: sık kullanılan isimler (Domain.frequentNames); tarih her açılışta bugün
  open(amt, names, now, cutoff) {
    this.#amt = amt;
    this.#names = names;
    $('nAmt').textContent = Format.money(amt);
    this.#input.value = '';
    this.#setInst(1);
    this.#date.reset(now, cutoff);
    this.#renderChips();
    super.open();
    this.#input.focus();
  }

  close() {
    this.#input.blur();
    super.close();
  }

  // Çipler: yazılanla başlayanlar önce, içerenler sonra; boşken hepsi
  #renderChips() {
    const q = this.#input.value.trim().toLocaleLowerCase('tr-TR');
    const low = n => n.toLocaleLowerCase('tr-TR');
    const shown = !q ? this.#names : [
      ...this.#names.filter(n => low(n).startsWith(q)),
      ...this.#names.filter(n => !low(n).startsWith(q) && low(n).includes(q))
    ];

    this.#chips.innerHTML = '';
    shown.forEach(name => {
      const chip = el('button', 'chip', name);
      // click (pointerdown değil): çip şeridi yana kayarken yanlışlıkla eklenmesin
      chip.onclick = () => this.#add(name);
      Touch.hapticOn(chip);
      this.#chips.appendChild(chip);
    });
    this.#chips.hidden = !shown.length;
  }

  #setInst(n) {
    this.#inst = n;
    document.querySelectorAll('#nInst .inst-btn').forEach(b => b.classList.toggle('active', Number(b.dataset.inst) === n));
  }

  #add(name) {
    const entry = { name: name.trim() || 'Adsız', amt: this.#amt, inst: this.#inst, day: this.#date.day };
    this.close();
    this.#onAdd(entry);
  }
}
