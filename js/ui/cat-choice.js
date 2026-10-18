// KATEGORİ SEÇİMİ: yana kayan tek sıra çip (kendi renginde ikon + ad). Seçili kategori şeridin başında
// durur (görünür kalsın), kendi renginde tonlanır; tahmin edildiyse yanında "tahmin" yazar. İsim adımı (yeni harcama) ve kayıt düzenleme kullanır.
// Tahmin etmeyi bilmez: kategoriyi dışarıdan alır (show), seçimi value ile verir.
// Bağımlılık: Categories, Format, Touch, CatIcon, el
class CategoryChoice {
  #box;
  #cat = Categories.OTHER;
  #guessed = false;
  #picked = false; // kullanıcı elle seçti: tahmin artık onu ezmez

  constructor(box) {
    this.#box = box;
  }

  // cat: gösterilecek kategori, guessed: isimden tahmin edildi (elle seçim sıfırlanır)
  show(cat, guessed = false) {
    this.#picked = false;
    this.#set(cat, guessed);
  }

  // Elle seçildiyse true (isim değişince tahmin bunun üstüne yazmaz)
  get picked() {
    return this.#picked;
  }

  get value() {
    return this.#cat;
  }

  #set(cat, guessed) {
    this.#cat = Categories.KEYS.includes(cat) ? cat : Categories.OTHER;
    this.#guessed = guessed;
    this.#render();
  }

  #render() {
    const order = [this.#cat, ...Categories.KEYS.filter(k => k !== this.#cat)];
    this.#box.innerHTML = '';
    order.forEach(key => {
      const on = key === this.#cat;
      const chip = el('button', 'chip cat-chip' + (on ? ' active' : ''));
      chip.type = 'button';
      chip.dataset.cat = key; // renk CSS'te
      chip.setAttribute('aria-pressed', on);
      chip.append(CatIcon.create(key), Format.category(key));
      if (on && this.#guessed) chip.appendChild(el('small', 'cat-guess', Format.guessed));
      // click (pointerdown değil): şerit yana kayarken yanlışlıkla seçilmesin
      chip.onclick = () => {
        this.#picked = true;
        this.#set(key, false);
      };
      Touch.hapticOn(chip);
      this.#box.appendChild(chip);
    });
    this.#box.scrollLeft = 0;
  }
}
