// EKSTRE ÖZETİ: kapanan ekstrenin kısa özeti, ortada açılan ekranda. Halka toplamı hedefe göre gösterir
// (hedef yoksa halka yok, sadece toplam); altında hedefe ve geçen ekstreye göre oklu satırlar, ikiye bölünmüş
// en büyükler (solda kategoriler, sağda tek harcamalar), varsa haberler (rekor, biten ve başlayan taksitler ve abonelikler;
// etkisiyle, en fazla Config.STATEMENT_NEWS_MAX). Harcaması olmayan ekstrede sadece başlık, aralık ve tek not.
// Geçmiş ekstreler arasında Harcamalar'daki dönem kartı gibi gezilir: ‹ › ya da sayfayı yatay kaydırma
// (Touch.bindPager); hangi ekstrede olduğunu (offset: -1 son kapanan, -2 ondan önceki ...) kendisi tutar.
// Hesap Domain.statementSummary'de, veriyi load(offset) verir (App); burası sadece çizer.
// Bağımlılık: CenterDialog, GoalRing, Config, Domain, Format, CatIcon, Touch, $, el, paintMoney
class StatementDialog extends CenterDialog {
  #ring;
  #load;
  #offset = -1;
  #prev = $('stmtPrev');
  #next = $('stmtNext');

  // load(offset): { start, end, summary (Domain.statementSummary ya da null), goal (o ekstrenin hedefi), now,
  // canPrev (daha eski ekstre var mı) }
  constructor({ load }) {
    super($('stmt'));
    this.#load = load;
    this.#ring = new GoalRing($('stmtRing'));
    Touch.hapticOn($('stmtClose'));

    Touch.bindPress(this.#prev, () => { if (!this.#prev.disabled) this.#step(-1); });
    Touch.bindPress(this.#next, () => { if (!this.#next.disabled) this.#step(1); });
    Touch.bindPager($('stmtPage'), {
      canPrev: () => !this.#prev.disabled,
      canNext: () => !this.#next.disabled,
      onPrev: () => this.#step(-1),
      onNext: () => this.#step(1)
    });
  }

  // Son kapanan ekstreden açılır (halka dolarak)
  open() {
    this.#offset = -1;
    const goal = this.#paint();
    super.open();
    if (goal) this.#ring.reveal(Config.RING_REVEAL_MS);
  }

  #step(d) {
    this.#offset += d;
    this.#paint();
  }

  // Seçili ekstreyi çizer; o ekstrenin hedefini döner (halka için)
  #paint() {
    const p = this.#load(this.#offset);
    this.#prev.disabled = !p.canPrev;
    this.#next.disabled = this.#offset >= -1;
    this.#head(p.start, p.end, p.now);
    $('stmtCard').classList.toggle('empty', !p.summary);
    if (!p.summary) {
      $('stmtEmpty').textContent = Format.statementEmpty();
      return 0;
    }
    this.#fillSummary(p.summary, p.goal);
    return p.goal;
  }

  // s: Domain.statementSummary; goal: o ekstrenin hedefi (yoksa 0)
  #fillSummary(s, goal) {
    paintMoney($('stmtTotal'), Format.money(s.total));
    $('stmtGoal').textContent = goal ? Format.statementTarget(goal) : '';
    $('stmtRing').hidden = !goal;
    if (goal) this.#ring.render(s.total / goal, s.total > goal ? 'over' : 'ok');

    // Hedefe ve geçen ekstreye göre oklu satırlar: fazla uyarı, az iyi rengi
    const says = [];
    if (goal) {
      const t = Domain.trend(s.total, goal);
      says.push({ t, text: Format.statementGoal(s.total, goal, t) });
    }
    if (s.prev != null) {
      const t = Domain.trend(s.total, s.prev);
      says.push({ t, text: Format.statementChange(s.total, s.prev, t) });
    }
    const box = $('stmtSays');
    box.innerHTML = '';
    says.forEach(l => box.appendChild(el('p', l.t, l.text)));
    box.hidden = !says.length;

    this.#fill($('stmtCats'), s.cats.map(c => ({ cat: c.cat, name: Format.category(c.cat), amt: c.total })));
    this.#fill($('stmtTop'), s.top.map(r => ({ cat: r.cat, name: r.name, amt: r.displayAmt })));

    const news = this.#news(s).slice(0, Config.STATEMENT_NEWS_MAX);
    $('stmtNews').hidden = !news.length;
    const list = $('stmtNewsList');
    list.innerHTML = '';
    news.forEach(n => {
      const row = el('div', 'stmt-news-row');
      row.append(el('b', '', n.title), el('small', '', n.sub));
      list.appendChild(row);
    });
  }

  // Başlık ("Ekim Ekstresi") ve aralık
  #head(start, end, now) {
    const lastDay = end - Config.DAY_MS;
    $('stmtTitle').textContent = Format.statementTitle(lastDay, now);
    $('stmtRange').textContent = Format.rangeWithYear(start, lastDay, now);
  }

  // Haberler, önem sırasıyla: rekor, biten taksitler, yeni taksitler, biten abonelikler, yeni abonelikler.
  // İkonsuz ve renksiz (solda kıl çizgi, etki gri): renk üstteki hükümde kalır, haber ayrıntıdır
  #news(s) {
    const news = [];
    if (s.record) {
      news.push({ title: Format.recordTitle(s.record), sub: Format.recordSub(s.record) });
    }
    if (s.finished.length) {
      news.push({ title: Format.finishedTitle(s.finished.map(r => r.name)), sub: Format.finishedSub(Domain.sum(s.finished)) });
    }
    if (s.started.length) {
      news.push({ title: Format.startedTitle(s.started), sub: Format.startedSub(Domain.sum(s.started)) });
    }
    const monthly = list => list.reduce((t, i) => t + (Number(i.amt) || 0), 0);
    if (s.ended.length) {
      news.push({ title: Format.endedTitle(s.ended.map(i => i.name)), sub: Format.endedSub(monthly(s.ended)) });
    }
    if (s.newSubs.length) {
      news.push({ title: Format.newSubTitle(s.newSubs.map(i => i.name)), sub: Format.newSubSub(monthly(s.newSubs)) });
    }
    return news;
  }

  // Sütun satırları: kategori ikonu (kuyuda), ad, sağda tutar
  #fill(box, list) {
    box.innerHTML = '';
    list.forEach(r => {
      const item = el('div', 'stmt-item');
      item.append(CatIcon.well(r.cat), el('span', 'n', r.name), el('b', '', Format.money(r.amt)));
      box.appendChild(item);
    });
  }
}
