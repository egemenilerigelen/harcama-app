// HEDEF HALKASI: harcamanın hedefe oranını gösteren ilerleme halkası.
// Durum (ok / warn / over / none) rengi belirler; aynı bilgi ortadaki yazıda da var (sadece renge kalmaz).
// Bağımlılık: Format, el, svgEl
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
    this.#arc.style.strokeDasharray = filled + ' ' + circumference;
    this.#arc.style.opacity = filled > 0 ? '' : '0'; // %0'da yuvarlak uç nokta gibi görünmesin

    this.#pct.textContent = state === 'none' ? 'Hedef' : Format.percent(ratio);
    this.#sub.textContent = state === 'none' ? 'koy' : 'doldu';
  }
}
