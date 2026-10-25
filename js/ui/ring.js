// HEDEF HALKASI: harcamanın hedefe oranını gösteren ilerleme halkası.
// Renk doluluğa göre ısınır: altından turuncuya, %100'e doğru kırmızıya (--heat-a, --heat-b; karışım CSS'te);
// tempo uyarısında (warn) en az turuncu, aşımda (over) kırmızı. Aynı bilgi ortadaki yazıda da var (sadece renge kalmaz).
// Bağımlılık: Config, Format, Motion, el, svgEl
class GoalRing {
  static #RADIUS = 42;

  #root;
  #arc;
  #pct;
  #sub;

  // root: halkanın çizileceği öğe (dokunulabilir düğme)
  constructor(root) {
    const r = GoalRing.#RADIUS;
    const svg = svgEl('svg', { viewBox: '0 0 100 100', 'aria-hidden': 'true' });
    this.#arc = svgEl('circle', { class: 'ring-arc', cx: 50, cy: 50, r });
    svg.append(svgEl('circle', { class: 'ring-track', cx: 50, cy: 50, r }), this.#arc);

    const text = el('span', 'ring-text');
    this.#pct = el('b');
    this.#sub = el('small');
    text.append(this.#pct, this.#sub);

    root.append(svg, text);
    this.#root = root;
  }

  // ratio: harcanan / hedef (1'i geçebilir, halka %100'de durur)
  render(ratio, state) {
    const circumference = 2 * Math.PI * GoalRing.#RADIUS;
    const filled = state === 'none' ? 0 : Math.min(1, ratio) * circumference;

    this.#root.classList.remove('ok', 'warn', 'over', 'none');
    this.#root.classList.add(state);
    const clamp = v => Math.min(1, Math.max(0, v));
    const a = state === 'warn' || state === 'over' ? 1 : clamp((ratio - Config.RING_HEAT_FROM) / (Config.RING_HEAT_FULL - Config.RING_HEAT_FROM));
    const b = state === 'over' ? 1 : clamp((ratio - Config.RING_HEAT_FULL) / (1 - Config.RING_HEAT_FULL));
    this.#root.style.setProperty('--heat-a', Math.round(a * 100) + '%');
    this.#root.style.setProperty('--heat-b', Math.round(b * 100) + '%');
    this.#arc.style.strokeDasharray = filled + ' ' + circumference;
    this.#arc.style.opacity = filled > 0 ? '' : '0'; // %0'da yuvarlak uç nokta gibi görünmesin

    this.#pct.textContent = state === 'none' ? 'Hedef' : Format.percent(ratio);
    this.#sub.textContent = state === 'none' ? 'koy' : state === 'over' ? 'aşıldı' : 'doldu';
  }

  // Açılış hareketi: yay sıfırdan bugünkü değerine dolar (yüzde yazısı beklemez, anında)
  reveal(ms) {
    const full = this.#arc.style.strokeDasharray;
    if (!full || this.#arc.style.opacity === '0') return;
    const circumference = full.split(/[\s,]+/)[1];
    Motion.play(this.#arc, [{ strokeDasharray: '0 ' + circumference }, { strokeDasharray: full }], ms, '--spring-soft');
  }
}
