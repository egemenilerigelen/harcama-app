// KATEGORİ SEÇİMİ: yana kayan tek sıra çip (kendi renginde ikon + ad). Seçili kategori şeridin başında
// durur (görünür kalsın), kendi renginde tonlanır. İsim adımı (yeni harcama) ve kayıt düzenleme kullanır.
// Kategoriyi kendisi bulmaz: dışarıdan alır (show; seçilmemiş olabilir), seçimi value ile verir,
// dokununca onPick(cat) çağrılır (isim adımında şerit kapanıp özete döner).
// Bağımlılık: Categories, Format, Touch, CatIcon, el
class CategoryChoice {
  #box;
  #cat = null;
  #picked = false; // kullanıcı elle seçti: hatırlanan kategori artık onu ezmez
  #onPick;

  constructor(box, { onPick } = {}) {
    this.#box = box;
    this.#onPick = onPick;
  }

  // cat: gösterilecek kategori (null: seçilmemiş); elle seçim sıfırlanır
  show(cat) {
    this.#picked = false;
    this.#cat = Categories.KEYS.includes(cat) ? cat : null;
    this.#render();
  }

  // Elle seçildiyse true (isim değişince hatırlanan kategori bunun üstüne yazmaz)
  get picked() {
    return this.#picked;
  }

  // Seçili kategori ya da null
  get value() {
    return this.#cat;
  }

  #render() {
    const order = this.#cat ? [this.#cat, ...Categories.KEYS.filter(k => k !== this.#cat)] : Categories.KEYS;
    this.#box.innerHTML = '';
    order.forEach(key => {
      const on = key === this.#cat;
      const chip = el('button', 'chip cat-chip' + (on ? ' active' : ''));
      chip.type = 'button';
      chip.dataset.cat = key; // renk CSS'te
      chip.setAttribute('aria-pressed', on);
      chip.append(CatIcon.create(key), Format.category(key));
      // click (pointerdown değil): şerit yana kayarken yanlışlıkla seçilmesin
      chip.onclick = () => {
        this.#picked = true;
        this.#cat = key;
        this.#render();
        if (this.#onPick) this.#onPick(key);
      };
      Touch.hapticOn(chip);
      this.#box.appendChild(chip);
    });
    this.#box.scrollLeft = 0;
  }
}
