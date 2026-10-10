// SÜTUN GRAFİK (adım sayacı tarzı): tek seri, ince altın sütunlar, grafiğin içinde çizgi/yazı kalabalığı yok.
// Dokunulan sütunun etiketi, değeri ve varsa notu (ör. hedefe göre durumu) üstteki okuma satırında görünür;
// seçili sütun tam, diğerleri soluk.
// Veriyi bilmez: render(bars, opts) ile çizer. bar: { value, label, tick, future, note? }
// opts: { key, selected, title }
// Bağımlılık: Config, Format, svgEl
class BarChart {
  #svg;
  #label;
  #value;
  #note;
  #bars = [];
  #opts = {};
  #selected = -1;
  #key = null;

  // label / value / note: okuma satırındaki etiket, değer ve küçük not alanları
  constructor({ svg, label, value, note }) {
    this.#svg = svg;
    this.#label = label;
    this.#value = value;
    this.#note = note;
  }

  render(bars, opts) {
    // Aynı görünüm yeniden çizilirken kullanıcının seçtiği sütun korunur
    if (opts.key !== this.#key || bars.length !== this.#bars.length) this.#selected = opts.selected;
    this.#key = opts.key;
    this.#bars = bars;
    this.#opts = opts;
    this.#draw();
  }

  // Genişlik değişince (sekme açıldı, ekran döndü) yeniden çiz
  redraw() {
    this.#draw();
  }

  #draw() {
    const svg = this.#svg;
    const width = svg.getBoundingClientRect().width;
    if (!width || !this.#bars.length) return; // gizliyken ölçülemez

    const { title } = this.#opts;
    const H = Config.CHART_H, TOP = Config.CHART_TOP;
    const max = BarChart.#niceMax(Math.max(...this.#bars.map(b => b.value)));
    const y = v => H - (v / max) * (H - TOP);

    svg.innerHTML = '';
    svg.setAttribute('viewBox', '0 0 ' + width + ' ' + (H + Config.CHART_AXIS_H));
    svg.setAttribute('height', H + Config.CHART_AXIS_H);
    svg.setAttribute('aria-label', title + ', ölçek ' + Format.money(max));

    // Ölçek: üstte tek silik çizgi + değeri, altta taban çizgisi
    svg.append(
      svgEl('line', { class: 'grid', x1: 0, x2: width, y1: TOP, y2: TOP }),
      BarChart.#text(Format.money(max), width, TOP - 5, 'end'),
      svgEl('line', { class: 'grid', x1: 0, x2: width, y1: H + 0.5, y2: H + 0.5 })
    );

    // Sütunlar: slot içinde ortalı, en fazla BAR_MAX_W, aralarda BAR_GAP boşluk
    const slot = width / this.#bars.length;
    const barW = Math.max(2, Math.min(Config.BAR_MAX_W, slot - Config.BAR_GAP));
    this.#bars.forEach((b, i) => {
      const x = i * slot + (slot - barW) / 2;
      const h = H - y(b.value);
      const mark = b.future || !b.value
        ? svgEl('rect', { class: b.future ? 'stub' : 'stub zero', x, y: H - 2, width: barW, height: 2 })
        : svgEl('path', { class: 'bar', d: BarChart.#barPath(x, H, barW, h) });
      mark.dataset.i = i;
      svg.append(mark);
    });

    // X ekseni etiketleri (seçici; her sütuna değil): sütunun tam altında ortalı,
    // sadece grafiğin dışına taşacaksa kenara kadar kaydırılır (dar günlük sütunlarda ilk/son gün)
    this.#bars.forEach((b, i) => {
      if (!b.tick) return;
      const cx = i * slot + slot / 2;
      const t = BarChart.#text(b.tick, cx, H + 15, 'middle');
      svg.append(t);
      const half = t.getComputedTextLength() / 2;
      t.setAttribute('x', Math.min(Math.max(cx, half), width - half));
    });

    // Dokunma alanları: sütunun tamamı ve slotun genişliği kadar (işaretten büyük)
    this.#bars.forEach((b, i) => {
      if (b.future) return;
      const hit = svgEl('rect', { class: 'hit', x: i * slot, y: 0, width: slot, height: H + Config.CHART_AXIS_H });
      hit.addEventListener('click', () => this.#select(i));
      svg.append(hit);
    });

    this.#mark();
  }

  #select(i) {
    this.#selected = i;
    this.#mark();
  }

  // Seçili sütunu vurgula, okuma satırını güncelle
  #mark() {
    this.#svg.querySelectorAll('[data-i]').forEach(m => m.classList.toggle('sel', Number(m.dataset.i) === this.#selected));
    const b = this.#bars[this.#selected];
    this.#label.textContent = b ? b.label : '';
    this.#value.textContent = b ? Format.money(b.value) : '';
    this.#note.textContent = (b && b.note) || '';
  }

  // Üstü yuvarlak, tabanı düz sütun
  static #barPath(x, base, w, h) {
    const r = Math.min(Config.BAR_RADIUS, w / 2, h);
    const top = base - h;
    return 'M' + x + ',' + base +
      'V' + (top + r) +
      'Q' + x + ',' + top + ' ' + (x + r) + ',' + top +
      'H' + (x + w - r) +
      'Q' + (x + w) + ',' + top + ' ' + (x + w) + ',' + (top + r) +
      'V' + base + 'Z';
  }

  static #text(content, x, y, anchor) {
    const t = svgEl('text', { x, y, 'text-anchor': anchor });
    t.textContent = content;
    return t;
  }

  // Ölçek üst sınırı: en yakın temiz değere yukarı yuvarlar (× 10ⁿ); sütunlar alanı boşa harcamasın
  static #STEPS = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10];

  static #niceMax(v) {
    if (v <= 0) return 100;
    const exp = Math.pow(10, Math.floor(Math.log10(v)));
    return BarChart.#STEPS.find(s => s * exp >= v) * exp;
  }
}
