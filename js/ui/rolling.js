// KAYAN HANELER: sayı metni değişince sadece değişen haneler kayar (iPhone'un kendi sayı geçişi gibi).
// Artınca eskisi yukarı çıkıp solar, yenisi alttan gelir; azalınca tersi. Baştaki ₺ sabit durur.
// Haneler soldan sağa hafif gecikmeyle oturur. Hareket bitince düz metne döner (ekran okuyucu ve
// kopyalama tek sayı görsün). "Hareketi Azalt" açıksa CSS hareketi kapatır, değer anında değişir.
// Bağımlılık: Config, el
class RollingText {
  #node;
  #text = '';
  #timer = null;

  constructor(node) {
    this.#node = node;
  }

  // dir: 'up' (arttı) ya da 'down' (azaldı) ise kayarak, yoksa anında
  set(text, dir) {
    const from = this.#text;
    this.#text = text;
    clearTimeout(this.#timer);
    if (!dir || !from || from === text) {
      this.#node.textContent = text;
      return;
    }

    // Baştaki işaret (₺) iki metinde aynıysa sabit kalır, sadece sayı karşılaştırılır
    const lead = s => s.match(/^\D*/)[0];
    const prefix = lead(from) === lead(text) ? lead(text) : '';
    const a = from.slice(prefix.length), b = text.slice(prefix.length);

    // Sağdan hizala: hane basamakları alt alta gelsin (₺9.497 → ₺11.897)
    const len = Math.max(a.length, b.length);
    const oa = a.padStart(len), ob = b.padStart(len);
    const roll = el('span', 'roll');
    let changed = 0;
    for (let i = 0; i < len; i++) {
      if (oa[i] === ob[i]) {
        roll.append(ob[i]);
        continue;
      }
      const delay = changed++ * Config.ROLL_STAGGER_MS + 'ms';
      // Kısalan sayının fazla hanesi: kayarak çıkarken yeri daralır
      const slot = el('span', 'slot ' + dir + (ob[i] === ' ' ? ' gone' : ''));
      if (ob[i] !== ' ') slot.appendChild(this.#digit('new', ob[i], delay));
      if (oa[i] !== ' ') slot.appendChild(this.#digit('old', oa[i], delay));
      roll.appendChild(slot);
    }

    this.#node.textContent = prefix;
    this.#node.appendChild(roll);
    this.#timer = setTimeout(() => {
      this.#node.textContent = text;
    }, Config.ROLL_MS + changed * Config.ROLL_STAGGER_MS);
  }

  #digit(cls, ch, delay) {
    const d = el('span', cls, ch);
    d.style.animationDelay = delay;
    if (cls === 'old') d.setAttribute('aria-hidden', 'true');
    return d;
  }
}
