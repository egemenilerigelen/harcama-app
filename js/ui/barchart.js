// SÜTUN GRAFİK (Apple Sağlık tarzı): tek seri, ince aralıklı sütunlar (renk --chart-bar). Sağda sabit genişlikte
// Y ekseni şeridi (0, orta, üst; sembolsüz kompakt değer), 3 yatay ızgara çizgisi (taban biraz belirgin); günlükte
// haftalık kesikli dikey ayırıcılar ve sağlarında tarih, ekstrede sütun başına ortalı etiket. Çizgiler silik,
// etiketler seyrek: grafik okunur ama kalabalıklaşmaz.
// Dokunulan sütunun etiketi, değeri ve varsa notu (ör. hedefe göre durumu) üstteki okuma satırında görünür;
// seçili sütun tam, diğerleri soluk.
// Veriyi bilmez: render(bars, opts) ile çizer. bar: { value, label, tick, future, missing?, note? }
// future: henüz gelmemiş (iz, dokunulmaz); missing: verisi yok (iz, dokununca değer yerine "—")
// opts: { key, selected, title, clip, guides }; clip: tek dev değer diğerlerini ezmesin (Config.CHART_CLIP_*): onu
// aşanlar ölçeğin tepesinde kesik çizilir (gövde, boşluk, yuvarlak başlık), ölçek kalanlara göre.
// guides: tick'i olan sütunun soluna kesikli dikey çizgi, etiket çizginin sağında sola hizalı (günlük); yoksa
// etiket sütunun altında ortalı (ekstre)
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

    const { title, clip, guides } = this.#opts;
    const H = Config.CHART_H, TOP = Config.CHART_TOP, AXIS = Config.CHART_AXIS_H;
    const plotW = width - Config.CHART_AXIS_W; // sütunların alanı; sağdaki şerit Y ekseninin
    const limit = clip ? BarChart.#clipLimit(this.#bars.map(b => b.value)) : Infinity;
    const top = Math.max(...this.#bars.map(b => b.value).filter(v => v <= limit));
    const max = BarChart.#niceMax(top);
    const y = v => H - (v / max) * (H - TOP);

    svg.innerHTML = '';
    svg.setAttribute('viewBox', '0 0 ' + width + ' ' + (H + AXIS));
    svg.setAttribute('height', H + AXIS);
    svg.setAttribute('aria-label', top ? title + ', ölçek ' + Format.money(max) : title);

    // Izgara: üst, orta, taban (taban biraz belirgin), sütun alanı boyunca. Y ekseni değerleri sağdaki şeritte,
    // çizgilerin hemen üstünde, sağa hizalı. Hiç değer yoksa eksen değeri yazılmaz (veriden gelmeyen uydurma sayı olurdu)
    [max, max / 2, 0].forEach(v => {
      const ly = v ? Math.round(y(v)) + 0.5 : H + 0.5;
      svg.append(svgEl('line', { class: v ? 'grid' : 'grid base', x1: 0, x2: plotW, y1: ly, y2: ly }));
      if (top) svg.append(BarChart.#text(Format.axisValue(v), width, ly - Config.CHART_LABEL_RISE, 'end'));
    });

    // Sütunlar: slotun BAR_WIDTH_RATIO'su kadar (en fazla BAR_MAX_W), slot içinde ortalı; üst köşeler genişliğe oranlı yuvarlak
    const slot = plotW / this.#bars.length;
    const barW = Math.max(2, Math.min(Config.BAR_MAX_W, slot * Config.BAR_WIDTH_RATIO));
    const radius = barW * Config.BAR_RADIUS_RATIO;
    this.#bars.forEach((b, i) => {
      const x = i * slot + (slot - barW) / 2;
      const h = H - y(b.value);
      const mark = b.future || b.missing || !b.value
        ? svgEl('rect', { class: b.future || b.missing ? 'stub' : 'stub zero', x, y: H - 2, width: barW, height: 2 })
        : b.value > limit ? BarChart.#clipped(x, H, barW, TOP, radius)
          : svgEl('path', { class: 'bar', d: BarChart.#barPath(x, H, barW, h, radius) });
      mark.dataset.i = i;
      svg.append(mark);
    });

    if (guides) this.#guides(slot, plotW, width);
    else this.#ticks(slot, plotW);

    // Dokunma alanları: sütunun tamamı ve slotun genişliği kadar (işaretten büyük)
    this.#bars.forEach((b, i) => {
      if (b.future) return;
      const hit = svgEl('rect', { class: 'hit', x: i * slot, y: 0, width: slot, height: H + AXIS });
      hit.addEventListener('click', () => this.#select(i));
      svg.append(hit);
    });

    this.#mark();
  }

  // Günlük: tick'i olan sütunun soluna tepeden alt şeride kesikli çizgi, etiket çizginin sağında sola hizalı.
  // Bir sonraki çizgiye (sonuncuda grafiğin sağ ucuna) sığmayan etiket gizlenir: taşma ve çakışma yok
  #guides(slot, plotW, width) {
    const H = Config.CHART_H, PAD = Config.CHART_LABEL_PAD;
    const at = this.#bars.map((b, i) => (b.tick ? i : -1)).filter(i => i >= 0);
    at.forEach((i, k) => {
      const x = Math.round(i * slot) + 0.5;
      this.#svg.append(svgEl('line', { class: 'guide', x1: x, x2: x, y1: Config.CHART_TOP, y2: H + Config.CHART_AXIS_H }));
      const t = BarChart.#text(this.#bars[i].tick, x + PAD, H + Config.CHART_TICK_Y, 'start');
      this.#svg.append(t);
      const bound = k < at.length - 1 ? Math.round(at[k + 1] * slot) - PAD : width;
      if (x + PAD + t.getComputedTextLength() > bound) t.remove();
    });
  }

  // Ekstre: etiket sütunun tam altında ortalı, sadece sütun alanının dışına taşacaksa kenara kadar kaydırılır
  #ticks(slot, plotW) {
    this.#bars.forEach((b, i) => {
      if (!b.tick) return;
      const cx = i * slot + slot / 2;
      const t = BarChart.#text(b.tick, cx, Config.CHART_H + Config.CHART_TICK_Y, 'middle');
      this.#svg.append(t);
      const half = t.getComputedTextLength() / 2;
      t.setAttribute('x', Math.min(Math.max(cx, half), plotW - half));
    });
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
  static #clipped(x, base, w, top, radius) {
    const cap = Config.CHART_CLIP_CAP, neck = top + cap + Config.CHART_CLIP_CUT;
    const g = svgEl('g', { class: 'bar' });
    g.append(
      svgEl('path', { d: 'M' + x + ',' + base + 'V' + neck + 'H' + (x + w) + 'V' + base + 'Z' }),
      svgEl('path', { d: BarChart.#barPath(x, top + cap, w, cap, radius) })
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

  // Üst köşeleri yuvarlak (radius, sütundan uzun olamaz), tabanı düz sütun
  static #barPath(x, base, w, h, radius) {
    const r = Math.min(radius, w / 2, h);
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

  // Ölçek üst sınırı: en yakın temiz değere yukarı yuvarlar (× 10ⁿ); sütunlar alanı boşa harcamasın. Adımların
  // yarısı da kısa yazılır (orta eksen değeri "1,25B" gibi uzayıp şeride taşmasın), bu yüzden 2,5 yok
  static #STEPS = [1, 1.5, 2, 3, 4, 5, 6, 8, 10];

  static #niceMax(v) {
    if (v <= 0) return 100;
    const exp = Math.pow(10, Math.floor(Math.log10(v)));
    return BarChart.#STEPS.find(s => s * exp >= v) * exp;
  }
}
