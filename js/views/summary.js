// ÖZET: dönem hedefi halkası, günlük / ekstre sütun grafiği, kategoriler, abonelikler, devam eden taksitler.
// Hedefi kendisi değiştirmez (onEditGoal); aboneliğe ya da taksite dokununca detayı açtırır (onOpen);
// başlıktaki bağlantı son kapanan ekstrenin özetini açtırır (onStatement); kategoriye dokununca o kategorinin
// harcamalarını açtırır (onCategory).
// Açılış hareketi uygulama açıldıktan sonra Özet'e ilk girişte bir kez oynar (reveal); sekmeden çıkıp dönünce
// ya da arka plandan gelince oynamaz, uygulama kapatılıp açılınca yine oynar (işaret sadece bellekte).
// Bağımlılık: Config, Domain, Format, GoalRing, BarChart, CatIcon, Motion, Touch, $, el, svgEl
class SummaryView {
  #mode = 'day'; // 'day' günlük, 'period' ekstre
  #catOpen = false; // kategori listesi tamamen açık mı
  #instOpen = false; // taksit listesi tamamen açık mı
  #revealed = false; // bu oturumda açılış hareketi oynadı mı
  #model = null;
  #ring;
  #chart;
  #onOpen;
  #onCategory;

  constructor({ onOpen, onEditGoal, onStatement, onCategory }) {
    this.#onOpen = onOpen;
    this.#onCategory = onCategory;
    this.#ring = new GoalRing($('ringBtn'));
    this.#chart = new BarChart({
      svg: $('chart'),
      label: $('chartLabel'),
      value: $('chartValue'),
      note: $('chartNote')
    });

    // Halkaya dokununca hedef paneli (click: iPhone klavyesi açılabilsin)
    $('ringBtn').onclick = onEditGoal;
    $('stmtLink').onclick = onStatement;
    Touch.hapticOn($('stmtLink'));

    document.querySelectorAll('#chartMode button').forEach(btn => {
      btn.onclick = () => {
        if (btn.dataset.mode === this.#mode) return; // seçili olana dokununca sütunlar boşuna oynamasın
        this.#mode = btn.dataset.mode;
        document.querySelectorAll('#chartMode button').forEach(b => b.classList.toggle('active', b === btn));
        this.#renderChart();
        // Grafiğin konusu değişti: sütunlar her geçişte kısa yükselir (okuma satırı anında)
        this.#chart.grow(Config.BARS_SWITCH_MS, Config.BARS_SWITCH_SPREAD_MS);
      };
      Touch.hapticOn(btn);
    });
  }

  render(model) {
    this.#model = model;
    this.#renderStatementLink();
    this.#renderGoal();
    this.#renderChart();
    this.#renderCategories();
    this.#renderSubscriptions();
    this.#renderInstallments();
  }

  // Sekme görünür olunca / ekran boyutu değişince grafiği yeniden ölç
  redraw() {
    if (this.#model) this.#chart.redraw();
  }

  // Sekme açıldı (görünür, grafik çizili): ilk seferinde halka dolar, sütunlar yükselir, şerit uzar
  reveal() {
    if (this.#revealed || !this.#model) return;
    this.#revealed = true;
    this.#ring.reveal(Config.RING_REVEAL_MS);
    this.#chart.grow(Config.BARS_REVEAL_MS, Config.BARS_REVEAL_SPREAD_MS);
    Motion.play($('catStack'), [{ clipPath: 'inset(0 100% 0 0 round 5px)' }, { clipPath: 'inset(0 0 0 0 round 5px)' }], Config.STACK_REVEAL_MS);
  }

  // Bu dönemin sınırları
  #period() {
    const { now, cutoff, periodStart } = this.#model;
    return { start: periodStart.getTime(), end: Domain.periodStart(now, cutoff, 1).getTime() };
  }

  // Başlıktaki bağlantı: son kapanan ekstre ("Eylül ekstresi ›"); hep görünür, harcama yoksa özet boş not gösterir
  #renderStatementLink() {
    const { now, periodStart } = this.#model;
    $('stmtLink').hidden = false;
    $('stmtLink').textContent = Format.statementLink(periodStart.getTime() - Config.DAY_MS, now);
  }

  // HEDEF KARTI: başlıkta aralık ve kalan gün; halka, harcanan / hedef / kalan; tek satırda ne yapmalı ve dönem sonu
  // tahmini. Günlük tutar ve tahmin
  // dönemin kalanına düşecek abonelik çekimlerini hesaba katar (onlar zaten gelecek)
  #renderGoal() {
    const { now, items, rows, goal } = this.#model;
    const { start, end } = this.#period();
    const period = rows.filter(r => r.ts >= start);
    const spent = Domain.sum(period);
    const upcoming = Domain.upcomingCharges(items, now, end);

    const forecast = Domain.forecast(spent, Domain.sum(period.filter(Domain.isDaily)), start, end, now, upcoming);

    $('sumRange').textContent = Format.periodLeft(start, end - Config.DAY_MS, Domain.daysLeft(start, end, now));
    $('gSpent').textContent = Format.money(spent);

    if (!goal) {
      this.#ring.render(0, 'none');
      $('gGoal').textContent = '—';
      $('gLeftLabel').textContent = 'Kalan';
      $('gLeft').textContent = '—';
      $('gHint').textContent = Format.goalHint(null, 0, forecast);
      return;
    }

    const p = Domain.goalProgress(spent, goal, start, end, now, upcoming);
    this.#ring.render(p.ratio, p.state);

    $('gGoal').textContent = Format.money(goal);
    $('gLeftLabel').textContent = p.remaining < 0 ? 'Aşım' : 'Kalan';
    $('gLeft').textContent = Format.money(Math.abs(p.remaining));
    $('gHint').textContent = Format.goalHint(p, Domain.sum(period.filter(Domain.isCarried)), forecast);
  }

  // SÜTUN GRAFİK: günlük (bu dönemin günleri) ya da ekstre (son dönemler)
  #renderChart() {
    const { now, cutoff, items, rows, goal, goalLog } = this.#model;
    const { start, end } = this.#period();

    if (this.#mode === 'day') {
      // Sütun o gün yapılan harcama. Önceki alışverişlerin bu döneme yansıyan taksitleri sütuna girmez
      // (dönemin ilk gününde tek dev sütun olup diğer günleri ezerdi); düştükleri günün okuma notunda yazar.
      // Abonelik çekimleri de girmez (kendiliğinden gelir; Abonelikler kartında)
      const inPeriod = rows.filter(r => r.ts >= start && r.ts < end);
      const days = Domain.dailyTotals(inPeriod.filter(Domain.isDaily), start, end);
      const carried = Domain.dailyTotals(inPeriod.filter(Domain.isCarried), start, end);
      const today = Domain.dayKey(now);
      const last = days.length - 1, mid = Math.floor(last / 2);
      const bars = days.map((d, i) => ({
        value: d.total,
        future: d.ts > now,
        label: Format.shortWhen(d.ts, now),
        tick: i === 0 || i === mid || i === last ? Format.shortDate(d.ts) : '',
        note: carried[i].total ? Format.carriedNote(carried[i].total) : ''
      }));
      // Günlük görünümde bütçe çizgisi yok: hedef kartındaki "günde ₺X" ile çelişen ikinci bir sayı olurdu
      this.#chart.render(bars, {
        key: 'day',
        selected: days.findIndex(d => Domain.dayKey(d.ts) === today),
        title: 'Bu dönemin günlük harcamaları'
      });
      return;
    }

    // İlk kayıttan önceki dönemler ₺0 değil "Kayıt yok"; süren dönem bitmişlerle eşit sanılmasın diye kalan günüyle
    const periods = Domain.periodTotals(rows, now, cutoff, Config.CHART_PERIODS);
    const since = Domain.dataSince(items, cutoff, now);
    const current = Format.periodName(0) + ' · ' + Format.daysLeft(Domain.daysLeft(start, end, now));
    const bars = periods.map((p, i) => {
      const offset = i - (periods.length - 1);
      const lastDay = p.end - Config.DAY_MS;
      const missing = p.start < since;
      const target = Domain.goalAt(goalLog, p.end, goal); // o ekstrenin hedefi (hedef geçmişi)
      return {
        value: p.total,
        future: false,
        missing,
        label: offset === 0 ? current : Format.periodName(offset, lastDay, now),
        tick: Format.monthShort(lastDay),
        // Hedef grafiğe çizilmez; dokunulan ekstrenin kendi hedefine göre durumu okuma satırında
        note: missing ? Format.noRecord : target ? Format.goalNote(p.total, target) : ''
      };
    });
    this.#chart.render(bars, {
      key: 'period',
      selected: bars.length - 1,
      title: 'Son ' + periods.length + ' ekstre'
    });
  }

  // KATEGORİLER: üstte renkli oran şeridi, en çok değişenleri söyleyen cümle; altında kategori başına
  // tutar, pay ve geçen dönemin aynı gününe göre değişim (artış uyarı, azalış iyi rengi).
  // İlk Config.CAT_VISIBLE satır görünür, fazlası "n kategori daha" ile açılır
  #renderCategories() {
    const { now, cutoff, items, rows } = this.#model;
    const { start, end } = this.#period();
    const list = Domain.categoryBreakdown(rows, {
      start,
      end,
      prevStart: Domain.periodStart(now, cutoff, -1).getTime(),
      now,
      since: Domain.dataSince(items, cutoff, now)
    });
    $('catInsight').textContent = Format.categoryInsight(Domain.categoryHighlights(list));

    // Oran şeridi (iPhone depolama ekranı gibi): her kategori kendi renginde, payı kadar; hepsi (kapalı olanlar da)
    const stack = $('catStack');
    stack.innerHTML = '';
    stack.hidden = !list.length;
    list.forEach(c => {
      const part = el('i');
      part.dataset.cat = c.cat;
      part.style.flexGrow = c.total;
      stack.appendChild(part);
    });

    const box = $('catList');
    box.innerHTML = '';
    if (!list.length) {
      box.appendChild(el('div', 'empty', 'Bu dönemde harcama yok'));
      return;
    }

    const hidden = list.length - Config.CAT_VISIBLE;
    const shown = this.#catOpen || hidden <= 0 ? list : list.slice(0, Config.CAT_VISIBLE);
    shown.forEach(c => {
      const info = el('div', 'inst-info');
      info.append(el('span', 'n', Format.category(c.cat)), el('small', 'cat-share', Format.percent(c.share)));

      const change = Domain.categoryChange(c);
      const right = el('div', 'inst-left');
      right.append(el('b', '', Format.money(c.total)), el('small', 'cat-delta ' + (change || ''), Format.categoryDelta(c, change)));

      const row = el('div', 'inst-row cat-row cat-link');
      row.append(CatIcon.well(c.cat), info, right);
      row.onclick = () => this.#onCategory(c.cat);
      box.appendChild(row);
    });

    if (hidden > 0) {
      box.appendChild(this.#more(Format.catToggle(hidden, this.#catOpen), this.#catOpen, () => {
        this.#catOpen = !this.#catOpen;
        this.#renderCategories();
      }));
    }
  }

  // ABONELİKLER: her ay kendiliğinden yazılanlar; aylık ve yıllık toplam (hedef varsa aylığın payı),
  // abonelik başına sıradaki çekim (yakınsa vurgulu) ve tutar. Kart hep yerinde; hiç yoksa taksit kartı gibi boş satır
  #renderSubscriptions() {
    const { now, items, goal } = this.#model;
    const active = Domain.activeSubscriptions(items, now);
    const monthly = active.reduce((s, i) => s + i.amt, 0);
    $('subsSum').hidden = !active.length;
    $('subsCount').textContent = active.length ? Format.subsCount(active.length) : '';
    $('subsMonth').textContent = Format.money(monthly);
    $('subsMonthNote').textContent = goal && monthly ? Format.goalShare(monthly, goal) : '';
    $('subsYear').textContent = Format.money(monthly * 12);

    const list = $('subsList');
    list.innerHTML = '';
    if (!active.length) {
      list.appendChild(el('div', 'empty', Format.noSubs));
      return;
    }
    active.forEach(s => {
      const soon = Domain.daysBetween(now, s.next) <= Config.SUB_SOON_DAYS;
      const info = el('div', 'inst-info');
      info.append(el('span', 'n', s.name), el('small', 'sub-next' + (soon ? ' soon' : ''), Format.subNext(s.next, now)));
      const right = el('div', 'inst-left');
      right.append(el('b', '', Format.money(s.amt)));
      const row = el('div', 'inst-row cat-row sub-row');
      row.append(CatIcon.well(s.cat), info, right);
      row.onclick = () => this.#onOpen(s.id);
      list.appendChild(row);
    });
  }

  // DEVAM EDEN TAKSİTLER: sonraki ekstreye şimdiden yazılan (ve hedefe payı), toplam kalan, alışveriş başına ilerleme.
  // İlk Config.INST_VISIBLE satır görünür, fazlası kartın içinde "n taksit daha" ile açılır (özetler hepsini kapsar)
  #renderInstallments() {
    const { now, cutoff, items, goal } = this.#model;
    const active = Domain.activeInstallments(items, cutoff, now);
    const next = Domain.periodStart(now, cutoff, 1).getTime();
    const after = Domain.periodStart(now, cutoff, 2).getTime();
    const nextAmt = Domain.installmentsBetween(items, cutoff, next, after);

    // "Gelecek ekstre" değil ay adı: bankacılıkta gelecek ekstre bu dönemin ekstresidir
    $('instSum').hidden = !active.length;
    $('instNextLabel').textContent = Format.intoStatement(after - Config.DAY_MS, now);
    $('instNext').textContent = Format.money(nextAmt);
    $('instNextNote').textContent = goal && nextAmt ? Format.goalShare(nextAmt, goal) : '';
    $('instTotal').textContent = Format.money(active.reduce((s, i) => s + i.remaining, 0));

    const list = $('instList');
    list.innerHTML = '';
    if (!active.length) {
      list.appendChild(el('div', 'empty', 'Devam eden taksit yok'));
      return;
    }

    const hidden = active.length - Config.INST_VISIBLE;
    const shown = this.#instOpen || hidden <= 0 ? active : active.slice(0, Config.INST_VISIBLE);

    shown.forEach(i => {
      const row = el('div', 'inst-row');
      const info = el('div', 'inst-info');
      const top = el('div', 'inst-top');
      top.append(el('span', 'n', i.name), el('span', 'inst-meta', i.paid + '/' + i.parts + ' · ' + Format.money(i.single)));
      const bar = el('div', 'inst-bar');
      const fill = el('i');
      fill.style.width = (i.paid / i.parts * 100) + '%';
      bar.appendChild(fill);
      info.append(top, bar);

      const left = el('div', 'inst-left');
      left.append(el('b', '', Format.money(i.remaining)), el('small', '', 'kaldı'));

      row.append(info, left);
      row.onclick = () => this.#onOpen(i.id);
      list.appendChild(row);
    });

    if (hidden <= 0) return;
    list.appendChild(this.#more(Format.instToggle(hidden, this.#instOpen), this.#instOpen, () => {
      this.#instOpen = !this.#instOpen;
      this.#renderInstallments();
    }));
  }

  // Listenin devamını kartın içinde açan / kapatan satır. click (pointerdown değil): ekran kayarken
  // yanlışlıkla açılmasın. Aşağı ok listenin bu kartın içinde açılacağını söyler (açıkken yukarı döner;
  // "›" başka ekrana geçiştir)
  #more(label, open, onToggle) {
    const more = el('button', 'inst-more');
    const chev = svgEl('svg', { viewBox: '0 0 24 24', 'aria-hidden': 'true' });
    chev.append(svgEl('path', { d: 'm6 9.5 6 6 6-6' }));
    more.append(el('span', '', label), chev);
    more.setAttribute('aria-expanded', open);
    more.onclick = onToggle;
    Touch.hapticOn(more);
    return more;
  }
}
