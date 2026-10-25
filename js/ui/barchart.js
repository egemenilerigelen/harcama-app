// SÜTUN GRAFİK (adım sayacı tarzı): tek seri, ince altın sütunlar, grafiğin içinde çizgi/yazı kalabalığı yok.
// Dokunulan sütunun etiketi, değeri ve varsa notu (ör. hedefe göre durumu) üstteki okuma satırında görünür;
// seçili sütun tam, diğerleri soluk.
// Veriyi bilmez: render(bars, opts) ile çizer. bar: { value, label, tick, future, missing?, note? }
// future: henüz gelmemiş (iz, dokunulmaz); missing: verisi yok (iz, dokununca değer yerine "—")
// opts: { key, selected, title, clip }; clip: tek dev değer diğerlerini ezmesin (Config.CHART_CLIP_*): onu aşanlar
// ölçeğin tepesinde kesik çizilir (gövde, boşluk, yuvarlak başlık), ölçek kalanlara göre

// Bağımlılık: Config, Format, Motion, svgEl
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

  // Sütunlar tabandan yükselir: ms süre, spread soldan sağa toplam gecikme (sütun sayısından bağımsız)
  grow(ms, spread) {
    const bars = [...this.#svg.querySelectorAll('.bar')];
    const last = Math.max(1, bars.length - 1);
    bars.forEach((bar, i) => Motion.play(bar, [{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }], ms, '--spring-soft', spread * i / last));
  }

  #draw() {
    const svg = this.#svg;
    const width = svg.getBoundingClientRect().width;
    if (!width || !this.#bars.length) return; // gizliyken ölçülemez

    const { title, clip } = this.#opts;
    const H = Config.CHART_H, TOP = Config.CHART_TOP;
    const limit = clip ? BarChart.#clipLimit(this.#bars.map(b => b.value)) : Infinity;
    const top = Math.max(...this.#bars.map(b => b.value).filter(v => v <= limit));
    const max = BarChart.#niceMax(top);
    const y = v => H - (v / max) * (H - TOP);

    svg.innerHTML = '';
    svg.setAttribute('viewBox', '0 0 ' + width + ' ' + (H + Config.CHART_AXIS_H));
    svg.setAttribute('height', H + Config.CHART_AXIS_H);
    svg.setAttribute('aria-label', top ? title + ', ölçek ' + Format.money(max) : title);

    // Ölçek: üstte tek silik çizgi + değeri, altta taban çizgisi. Hiç değer yoksa ölçek
    // değeri yazılmaz (veriden gelmeyen uydurma bir sayı olurdu)
    svg.append(
      svgEl('line', { class: 'grid', x1: 0, x2: width, y1: TOP, y2: TOP }),
      svgEl('line', { class: 'grid', x1: 0, x2: width, y1: H + 0.5, y2: H + 0.5 })
    );
    if (top) svg.append(BarChart.#text(Format.money(max), width, TOP - 5, 'end'));

    // Sütunlar: slot içinde ortalı, en fazla BAR_MAX_W, aralarda BAR_GAP boşluk
    const slot = width / this.#bars.length;
    const barW = Math.max(2, Math.min(Config.BAR_MAX_W, slot - Config.BAR_GAP));
    this.#bars.forEach((b, i) => {
      const x = i * slot + (slot - barW) / 2;
      const h = H - y(b.value);
      const mark = b.future || b.missing || !b.value
        ? svgEl('rect', { class: b.future || b.missing ? 'stub' : 'stub zero', x, y: H - 2, width: barW, height: 2 })
        : b.value > limit ? BarChart.#clipped(x, H, barW, TOP)
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
    this.#value.textContent = !b ? '' : b.missing ? '—' : Format.money(b.value);
    this.#note.textContent = (b && b.note) || '';
  }

  // Ölçeği aşan sütun: düz gövde, kısa boşluk, ölçek çizgisinde yuvarlak başlık ("kırık" eksen gibi)
  static #clipped(x, base, w, top) {
    const cap = Config.CHART_CLIP_CAP, neck = top + cap + Config.CHART_CLIP_CUT;
    const g = svgEl('g', { class: 'bar' });
    g.append(
      svgEl('path', { d: 'M' + x + ',' + base + 'V' + neck + 'H' + (x + w) + 'V' + base + 'Z' }),
      svgEl('path', { d: BarChart.#barPath(x, top + cap, w, cap) })
    );
    return g;
  }

  // Kesme sınırı: dolu sütunların Config.CHART_CLIP_PCT dilimi × CHART_CLIP_RATIO; en büyük onu aşmıyorsa ya da
  // dolu sütun azsa kesme yok (Infinity)
  static #clipLimit(values) {
    const full = values.filter(v => v > 0).sort((a, b) => a - b);
    if (full.length < Config.CHART_CLIP_MIN) return Infinity;
    const limit = full[Math.floor((full.length - 1) * Config.CHART_CLIP_PCT)] * Config.CHART_CLIP_RATIO;
    return full[full.length - 1] > limit ? limit : Infinity;
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
