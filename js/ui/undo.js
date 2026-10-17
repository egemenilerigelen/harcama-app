// GERİ ALMA KAPSÜLÜ: son işlemi (silme, düzenleme) kısa bir süre geri alınabilir tutar. Eklemede yok:
// en sık işlem, her seferinde bildirim yorar (yanlış eklenen satır kaydırılıp silinir).
// Dynamic Island gibi ekranın tepesindeki siyahtan büyüyen siyah kapsül: solda işlemi söyleyen ikon,
// ortada ne olduğu (isim + tutar), sağda altın "Geri al"; altta kalan süreyi gösteren kıl çizgi. Basılı tutunca
// süre durur, yukarı itince hemen kapanır. Neyin nasıl geri alınacağını bilmez; show(...) ile verilir.
// Bağımlılık: Config, Touch, $, svgEl
class UndoBar {
  // İşlem başına ikon (bilgi taşır): silme çöp, düzenleme kalem
  static #ICONS = {
    deleted: 'M4.5 7h15M10 11v6M14 11v6M6.5 7l1 12.5h9l1-12.5M9.5 7V4.5h5V7',
    edited: 'M14.5 5.5l4 4L8 20H4v-4z'
  };

  #bar = $('undo');
  #ico = $('undoIco');
  #text = $('undoText');
  #sub = $('undoSub');
  #undo = null;
  #timer = null;
  #left = 0;     // kalan süre (ms), basılı tutunca durur
  #started = 0;

  constructor() {
    this.#bar.style.setProperty('--undo-ms', Config.UNDO_MS + 'ms');
    $('undoBtn').onclick = () => {
      const undo = this.#undo;
      this.hide();
      if (undo) undo();
    };
    Touch.hapticOn($('undoBtn'));

    // Basılı tutunca süre durur, bırakınca kaldığı yerden devam eder
    this.#bar.addEventListener('pointerdown', () => this.#pause());
    this.#bar.addEventListener('pointerup', () => this.#resume());
    this.#bar.addEventListener('pointercancel', () => this.#resume());

    // Yukarı itince kapanır (geldiği yere döner); az itilirse yerine yaylanır
    Touch.trackDrag(this.#bar, 'y', {
      onStart: () => this.#bar.classList.add('dragging'),
      onMove: dy => (this.#bar.style.transform = 'translateY(' + Math.min(0, dy) + 'px)'),
      onEnd: dy => {
        this.#bar.classList.remove('dragging');
        this.#bar.style.transform = '';
        if (dy < -Config.UNDO_SWIPE_PX) this.hide();
      }
    });
  }

  // kind: 'deleted' | 'edited', title: ne oldu ("Netflix silindi"), sub: tutar ya da değişim,
  // undo(): işlemi geri alır
  show({ kind, title, sub }, undo) {
    this.#ico.className = 'undo-ico ' + kind;
    this.#ico.textContent = '';
    const svg = svgEl('svg', { viewBox: '0 0 24 24', 'aria-hidden': 'true' });
    svg.append(svgEl('path', { d: UndoBar.#ICONS[kind] }));
    this.#ico.append(svg);
    this.#text.textContent = title;
    this.#sub.textContent = sub;
    this.#undo = undo;

    // Süre çizgisi her gösterişte baştan başlar
    this.#bar.classList.remove('show', 'paused');
    void this.#bar.offsetWidth;
    this.#bar.classList.add('show');
    this.#arm(Config.UNDO_MS);
  }

  hide() {
    clearTimeout(this.#timer);
    this.#undo = null;
    this.#bar.classList.remove('show', 'paused');
  }

  #arm(ms) {
    this.#left = ms;
    this.#started = Date.now();
    clearTimeout(this.#timer);
    this.#timer = setTimeout(() => this.hide(), ms);
  }

  #pause() {
    if (!this.#bar.classList.contains('show')) return;
    clearTimeout(this.#timer);
    this.#left -= Date.now() - this.#started;
    this.#bar.classList.add('paused');
  }

  #resume() {
    if (!this.#bar.classList.contains('paused')) return;
    this.#bar.classList.remove('paused');
    this.#arm(Math.max(this.#left, Config.UNDO_MIN_MS));
  }
}
