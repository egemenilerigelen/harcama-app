// KAYAN SEÇİCİ: segmentli kontrol, alt sekme çubuğunun kurallarıyla. Seçili düğmenin altındaki kapsül
// seçim değişince yeni yerine kayar (--seg-i). Parmak seçicide sağa sola gezdirilebilir: kapsül yerinden
// kıpırdamadan parmağı izler (nereden tutulursa tutulsun sıçramaz; tutulan nokta ile kapsülün ortası arasındaki
// fark bir düğme genişliği kadar yolda eriyip kapsül parmağın altına oturur), biraz büyür, kapsülün altındaki
// düğme vurgulanır; seçim parmak kalkınca değişir. Dokunuş iptal edilirse
// seçili olanda kalır. Dokunma (click) da seçer; seçili olana dokununca bir şey olmaz.
// root: düğmeleri (data-mode) taşıyan öğe; onChange(mode): seçim değişti
// Bağımlılık: Touch, el
class Segmented {
  #root;
  #btns;
  #onChange;
  #pill = el('span', 'seg-pill');
  #current;
  #hover = null; // gezinirken parmağın altındaki düğme
  #x0 = 0;       // sürüklemenin başladığı nokta (px)
  #first = null; // ilk düğmenin yeri ve genişliği (sürükleme başında ölçülür)
  #grab = 0;     // tutulan nokta ile kapsülün ortası arasındaki fark (px, sürükleme başında ölçülür)
  #dragged = false;

  constructor(root, { onChange }) {
    this.#root = root;
    this.#btns = [...root.querySelectorAll('[data-mode]')];
    this.#onChange = onChange;
    this.#current = (this.#btns.find(b => b.classList.contains('active')) || this.#btns[0]).dataset.mode;
    this.#pill.setAttribute('aria-hidden', 'true');
    root.prepend(this.#pill);
    root.style.setProperty('--seg-n', this.#btns.length);
    this.#place(this.#current);

    this.#btns.forEach(b => {
      b.addEventListener('click', () => {
        // Sürükleme bittiğinde parmağın altındaki düğme ayrıca tıklanmış sayılmasın
        if (this.#dragged) return;
        this.#select(b.dataset.mode);
      });
      Touch.hapticOn(b);
    });

    root.addEventListener('pointerdown', e => {
      this.#x0 = e.clientX;
      this.#dragged = false;
    });
    Touch.trackDrag(root, 'x', {
      onStart: () => {
        const r = this.#btns[0].getBoundingClientRect();
        this.#first = { left: r.left, width: r.width };
        const from = this.#btns.findIndex(b => b.dataset.mode === this.#current) * r.width;
        this.#grab = this.#x0 - r.left - r.width / 2 - from;
        this.#hover = this.#current;
        this.#dragged = true;
        root.classList.add('dragging');
      },
      onMove: dx => this.#follow(dx),
      onEnd: () => this.#settle(this.#hover),
      onCancel: () => this.#settle(this.#current)
    });
  }

  #select(mode) {
    if (mode === this.#current) return;
    this.#current = mode;
    this.#place(mode);
    this.#onChange(mode);
  }

  // Kapsül ve vurgu seçili düğmede
  #place(mode) {
    this.#highlight(mode);
    this.#root.style.setProperty('--seg-i', this.#btns.findIndex(b => b.dataset.mode === mode));
  }

  #highlight(mode) {
    this.#btns.forEach(b => b.classList.toggle('active', b.dataset.mode === mode));
  }

  // Kapsül parmağı izler: tutulan noktadaki fark bir düğme genişliği yolda erir (sıçrama yok), seçicinin içinde
  // kalır; kapsülün altındaki düğme vurgulanır
  #follow(dx) {
    const { left, width } = this.#first;
    const last = this.#btns.length - 1;
    const ease = Math.min(1, Math.abs(dx) / width);
    const x = Math.min(Math.max(this.#x0 + dx - left - width / 2 - this.#grab * (1 - ease), 0), last * width);
    this.#root.style.setProperty('--pill-x', x + 'px');

    const i = Math.min(Math.max(Math.floor((x + width / 2) / width), 0), last);
    const mode = this.#btns[i].dataset.mode;
    if (mode !== this.#hover) {
      this.#hover = mode;
      Touch.haptic();
      this.#highlight(mode);
    }
  }

  // Gezinme bitti: kapsül yerine oturur, seçim değiştiyse şimdi bildirilir
  #settle(mode) {
    this.#root.classList.remove('dragging');
    this.#root.style.removeProperty('--pill-x');
    this.#hover = null;
    if (mode !== this.#current) this.#select(mode);
    else this.#place(mode);
  }
}
