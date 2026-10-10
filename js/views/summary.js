// ÖZET: dönem hedefi halkası, günlük / ekstre sütun grafiği, devam eden taksitler.
// Hedefi kendisi değiştirmez (onEditGoal); taksite dokununca detayı açtırır (onOpen).
// Bağımlılık: Config, Domain, Format, GoalRing, BarChart, Touch, $, el, svgEl
class SummaryView {
  #mode = 'day'; // 'day' günlük, 'period' ekstre
  #instOpen = false; // taksit listesi tamamen açık mı
  #model = null;
  #ring;
  #chart;
  #onOpen;

  constructor({ onOpen, onEditGoal }) {
    this.#onOpen = onOpen;
    this.#ring = new GoalRing($('ringBtn'));
    this.#chart = new BarChart({
      svg: $('chart'),
      label: $('chartLabel'),
      value: $('chartValue'),
      note: $('chartNote')
    });

    // Halkaya dokununca hedef paneli (click: iPhone klavyesi açılabilsin)
    $('ringBtn').onclick = onEditGoal;

    document.querySelectorAll('#chartMode button').forEach(btn => {
      btn.onclick = () => {
        this.#mode = btn.dataset.mode;
        document.querySelectorAll('#chartMode button').forEach(b => b.classList.toggle('active', b === btn));
        Touch.haptic();
        this.#renderChart();
      };
    });
  }

  render(model) {
    this.#model = model;
    this.#renderGoal();
    this.#renderChart();
    this.#renderInstallments();
  }

  // Sekme görünür olunca / ekran boyutu değişince grafiği yeniden ölç
  redraw() {
    if (this.#model) this.#chart.redraw();
  }

  // Bu dönemin sınırları
  #period() {
    const { now, cutoff, periodStart } = this.#model;
    return { start: periodStart.getTime(), end: Domain.periodStart(now, cutoff, 1).getTime() };
  }

  // HEDEF KARTI: halka, harcanan / hedef / kalan, ne yapmalı satırı
  #renderGoal() {
    const { now, rows, goal } = this.#model;
    const { start, end } = this.#period();
    const period = rows.filter(r => r.ts >= start);
    const spent = Domain.sum(period);

    $('sumRange').textContent = Format.range(start, end - Config.DAY_MS);
    $('gSpent').textContent = Format.money(spent);

    if (!goal) {
      this.#ring.render(0, 'none');
      $('gGoal').textContent = '—';
      $('gLeftLabel').textContent = 'Kalan';
      $('gLeft').textContent = '—';
      $('gHint').textContent = Format.goalHint(null);
      return;
    }

    const p = Domain.goalProgress(spent, goal, start, end, now);
    this.#ring.render(p.ratio, p.state);

    $('gGoal').textContent = Format.money(goal);
    $('gLeftLabel').textContent = p.remaining < 0 ? 'Aşım' : 'Kalan';
    $('gLeft').textContent = Format.money(Math.abs(p.remaining));
    $('gHint').textContent = Format.goalHint(p, Domain.sum(period.filter(Domain.isCarried)));
  }

  // SÜTUN GRAFİK: günlük (bu dönemin günleri) ya da ekstre (son dönemler)
  #renderChart() {
    const { now, cutoff, items, rows, goal } = this.#model;
    const { start, end } = this.#period();

    if (this.#mode === 'day') {
      // Sütun o gün yapılan harcama. Önceki alışverişlerin bu döneme yansıyan taksitleri sütuna girmez
      // (kesim gününde tek dev sütun olup diğer günleri ezerdi); düştükleri günün okuma notunda yazar.
      const inPeriod = rows.filter(r => r.ts >= start && r.ts < end);
      const days = Domain.dailyTotals(inPeriod.filter(r => !Domain.isCarried(r)), start, end);
      const carried = Domain.dailyTotals(inPeriod.filter(Domain.isCarried), start, end);
      const today = Domain.dayKey(now);
      const last = days.length - 1, mid = Math.floor(last / 2);
      const bars = days.map((d, i) => ({
        value: d.total,
        future: d.ts > now,
        label: Format.shortWhen(d.ts),
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
      return {
        value: p.total,
        future: false,
        missing,
        label: offset === 0 ? current : Format.periodName(offset, lastDay),
        tick: Format.monthShort(lastDay),
        // Hedef grafiğe çizilmez; dokunulan ekstrenin hedefe göre durumu okuma satırında
        note: missing ? Format.noRecord : goal ? Format.goalNote(p.total, goal) : ''
      };
    });
    this.#chart.render(bars, {
      key: 'period',
      selected: bars.length - 1,
      title: 'Son ' + periods.length + ' ekstre'
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
    $('instNextLabel').textContent = Format.intoStatement(after - Config.DAY_MS);
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
    // click (pointerdown değil): ekran kayarken yanlışlıkla açılmasın.
    // Aşağı ok listenin bu kartın içinde açılacağını söyler (açıkken yukarı döner; "›" başka ekrana geçiştir)
    const more = el('button', 'inst-more');
    const chev = svgEl('svg', { viewBox: '0 0 24 24', 'aria-hidden': 'true' });
    chev.append(svgEl('path', { d: 'm6 9.5 6 6 6-6' }));
    more.append(el('span', '', Format.instToggle(hidden, this.#instOpen)), chev);
    more.setAttribute('aria-expanded', this.#instOpen);
    more.onclick = () => {
      this.#instOpen = !this.#instOpen;
      Touch.haptic();
      this.#renderInstallments();
    };
    list.appendChild(more);
  }
}
