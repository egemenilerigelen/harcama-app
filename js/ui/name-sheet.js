// İSİM ADIMI (girişin 2. adımı): tutardan sonra alttan açılır. İsim yazılır ya da sık kullanılan
// isimlerden biri seçilir (çipe dokunmak kaydı hemen ekler). Altında tek satır özet: kategori · taksit · tarih
// (varsayılan: seçilmemiş · tek çekim · bugün). Bir değere dokununca o satır yerinde seçiciye döner
// (kategori şeridi, taksit, Bugün · Dün · Takvim), seçince özete geri döner: yükseklik değişmez, panel zıplamaz.
// Kategori tahmin edilmez; aynı isme daha önce verilen kategori hatırlanır (elle seçilmediyse). Abonelik seçilirse
// (tek çekim) ödeme etiketi "Her ay" olur: kayıt her ay kendiliğinden tekrar eder.
// Klavye açıkken panel klavyenin hemen üstünde durur (BottomSheet); seçicilere dokunmak klavyeyi kapatmaz.
// Nereye kaydedileceğini bilmez; sonucu onAdd({ name, amt, inst, day, cat }) ile dışarı verir (day: seçilen günün başı).
// Bağımlılık: BottomSheet, CategoryChoice, Categories, CatIcon, DateChoice, Domain, Format, Touch, paintMoney, $, el, svgEl
class NameSheet extends BottomSheet {
  #input = $('nName');
  #chips = $('nChips');
  #picks = $('nPicks');
  #names = [];
  #amt = 0;
  #inst = 1;
  #now = 0;
  #cutoff = 0;
  #date = new DateChoice($('nDate'), null, { onPick: () => this.#closePick() });
  #cats = new CategoryChoice($('nCats'), { onPick: () => this.#closePick() });
  #remember = () => null; // isme daha önce verilen kategori (App verir)
  #onAdd;

  constructor({ onAdd }) {
    super($('nameSheet'));
    this.#onAdd = onAdd;

    // Klavyeyle Ekle (Return); yazdıkça çipler süzülür, isim tanıdıksa kategorisi gelir
    this.#input.addEventListener('keydown', e => {
      if (e.key === 'Enter') this.#add(this.#input.value);
    });
    this.#input.addEventListener('input', () => {
      this.#renderChips();
      if (!this.#cats.picked) this.#cats.show(this.#remember(this.#input.value));
      this.#renderTokens();
    });
    $('nAdd').onclick = () => this.#add(this.#input.value);
    Touch.hapticOn($('nAdd'));

    // Özet satırındaki değerler: dokununca o seçici satırın yerine açılır
    this.#picks.querySelectorAll('.tok').forEach(tok => {
      tok.onclick = () => this.#openPick(tok.dataset.pick);
      Touch.hapticOn(tok);
    });
    document.querySelectorAll('#nInst .inst-btn').forEach(btn => {
      btn.onclick = () => {
        this.#setInst(Number(btn.dataset.inst));
        this.#closePick();
      };
      Touch.hapticOn(btn);
    });

    // Seçicilere dokunmak yazı alanının odağını almasın: klavye kapanırsa panel aşağı düşerdi.
    // Takvim'in tarih alanı hariç (iPhone'un tarih seçicisi odakla açılır)
    const keepFocus = e => {
      if (!e.target.closest('input[type="date"]')) e.preventDefault();
    };
    this.#picks.addEventListener('pointerdown', keepFocus);
    this.#picks.addEventListener('mousedown', keepFocus);
  }

  // Dokunma olayının içinden çağrılmalı ki iPhone klavyeyi açsın.
  // amt: girilen tutar, names: sık kullanılan isimler (Domain.frequentNames), remember(isim): kategori ya da null;
  // her açılışta tek çekim, bugün, kategori seçilmemiş
  open(amt, names, now, cutoff, remember) {
    this.#amt = amt;
    this.#names = names;
    this.#now = now;
    this.#cutoff = cutoff;
    this.#remember = remember;
    paintMoney($('nAmt'), Format.money(amt));
    this.#input.value = '';
    this.#setInst(1);
    this.#date.reset(now, cutoff);
    this.#cats.show(null);
    this.#closePick();
    this.#renderChips();
    super.open();
    this.#input.focus();
  }

  close() {
    this.#input.blur();
    super.close();
  }

  // Çipler: yazılanla başlayanlar önce, içerenler sonra; boşken hepsi. Eşleşen yoksa sıranın yeri
  // korunur (yazarken panel kısalıp zıplamasın); hiç isim yoksa (ilk kullanım) sıra yok
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
    this.#chips.hidden = !this.#names.length;
    this.#chips.classList.toggle('empty', !shown.length);
  }

  // Özet satırı: kategori (seçilmemişse "Kategori"), taksit, tarih; varsayılandan farklı değer altınla.
  // Abonelik tek çekimse ödeme "Her ay": kayıt her ay kendiliğinden tekrar eder (Domain.subscriptionEntry)
  #renderTokens() {
    const cat = this.#cats.value;
    const monthly = Domain.subscriptionEntry(cat, this.#inst);
    this.#token('cat', cat ? Format.category(cat) : Format.noCategory, false, cat);
    this.#token('inst', monthly ? Format.monthly : Format.installment(this.#inst), monthly || this.#inst !== 1);
    this.#token('date', Format.dayChoice(this.#date.day, this.#now, this.#cutoff), this.#date.day !== Domain.dayStart(this.#now));
  }

  // Değer etiketi: [kategori ikonu] metin ⌄
  #token(key, text, changed, cat) {
    const tok = this.#picks.querySelector('[data-pick="' + key + '"]');
    tok.classList.toggle('changed', changed);
    tok.classList.toggle('empty', key === 'cat' && !cat);
    if (cat) tok.dataset.cat = cat;
    else delete tok.dataset.cat;
    const chev = svgEl('svg', { viewBox: '0 0 24 24', class: 'tok-chev', 'aria-hidden': 'true' });
    chev.append(svgEl('path', { d: 'm6 9.5 6 6 6-6' }));
    // Haptics.attach'in serdiği etiket korunur: sadece metin, ikon ve ok yenilenir
    tok.querySelectorAll(':scope > :not(.haptic)').forEach(n => n.remove());
    tok.prepend(...(cat ? [CatIcon.create(cat)] : []), el('span', '', text), chev);
  }

  // Seçici özet satırının yerinde açılır (yükseklik aynı); seçim yapılınca kapanır
  #openPick(key) {
    this.#picks.dataset.open = key;
  }

  #closePick() {
    delete this.#picks.dataset.open;
    this.#renderTokens();
  }

  #setInst(n) {
    this.#inst = n;
    document.querySelectorAll('#nInst .inst-btn').forEach(b => b.classList.toggle('active', Number(b.dataset.inst) === n));
  }

  // Kategori: elle seçilen, yoksa o isme daha önce verilen, o da yoksa Diğer
  #add(name) {
    const cat = this.#cats.picked ? this.#cats.value : this.#remember(name) || Categories.OTHER;
    const entry = { name: name.trim() || 'Adsız', amt: this.#amt, inst: this.#inst, day: this.#date.day, cat };
    this.close();
    this.#onAdd(entry);
  }
}
