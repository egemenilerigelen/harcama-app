// İSİM ADIMI (girişin 2. adımı): tutardan sonra alttan açılır. İsim yazılır ya da sık kullanılan
// isimlerden biri seçilir (çipe dokunmak kaydı hemen ekler), taksit burada seçilir.
// Klavye açıkken panel klavyenin hemen üstünde durur (iPhone klavyesi sayfayı küçültmez, üstüne biner).
// Nereye kaydedileceğini bilmez; sonucu onAdd({ name, amt, inst }) ile dışarı verir.
// Bağımlılık: BottomSheet, Device, Format, Touch, $, el
class NameSheet extends BottomSheet {
  #panel = $('nameSheet').querySelector('.sheet');
  #input = $('nName');
  #chips = $('nChips');
  #names = [];
  #amt = 0;
  #inst = 1;
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

    // Klavye açılıp kapandıkça panel klavyenin üstüne kayar
    Device.watchKeyboard(px => {
      this.#panel.style.setProperty('--kb', px + 'px');
      this.#panel.classList.toggle('kb', px > 0);
    });
  }

  // Dokunma olayının içinden çağrılmalı ki iPhone klavyeyi açsın.
  // amt: girilen tutar, names: sık kullanılan isimler (Domain.frequentNames)
  open(amt, names) {
    this.#amt = amt;
    this.#names = names;
    $('nAmt').textContent = Format.money(amt);
    this.#input.value = '';
    this.#setInst(1);
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
    const entry = { name: name.trim() || 'Adsız', amt: this.#amt, inst: this.#inst };
    this.close();
    this.#onAdd(entry);
  }
}
