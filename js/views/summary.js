// ÖZET: dönem hedefi halkası, günlük / ekstre sütun grafiği, devam eden taksitler.
// Hedefi kendisi değiştirmez (onEditGoal); taksite dokununca detayı açtırır (onOpen).
// Bağımlılık: Config, Domain, Format, GoalRing, BarChart, Touch, $, el
class SummaryView {
  #mode = 'day'; // 'day' günlük, 'period' ekstre
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
    const spent = Domain.sum(rows.filter(r => r.ts >= start));

    $('sumRange').textContent = Format.range(start, end - Config.DAY_MS);
    $('gSpent').textContent = Format.money(spent);

    if (!goal) {
      this.#ring.render(0, 'none');
      $('gGoal').textContent = '—';
      $('gLeftLabel').textContent = 'Kalan';
      $('gLeft').textContent = '—';
      $('gHint').textContent = 'Halkaya dokunup bir dönem hedefi koy; her ekstre bu tutarla ölçülür.';
      return;
    }

    const p = Domain.goalProgress(spent, goal, start, end, now);
    const state = p.ratio > 1 ? 'over' : p.ratio >= Config.GOAL_WARN_RATIO ? 'warn' : 'ok';
    this.#ring.render(p.ratio, state);

    $('gGoal').textContent = Format.money(goal);
    $('gLeftLabel').textContent = p.remaining < 0 ? 'Aşım' : 'Kalan';
    $('gLeft').textContent = Format.money(Math.abs(p.remaining));
    $('gHint').textContent = p.remaining < 0
      ? 'Hedefi ' + Format.money(-p.remaining) + ' aştın.'
      : 'Günde ' + Format.money(Math.floor(p.perDay)) + ' ile hedefte kalırsın · ' + p.daysLeft + ' gün kaldı';
  }

  // SÜTUN GRAFİK: günlük (bu dönemin günleri) ya da ekstre (son dönemler)
  #renderChart() {
    const { now, cutoff, rows, goal } = this.#model;

    if (this.#mode === 'day') {
      const { start, end } = this.#period();
      const days = Domain.dailyTotals(rows, start, end);
      const today = Domain.dayKey(now);
      const last = days.length - 1, mid = Math.floor(last / 2);
      const bars = days.map((d, i) => ({
        value: d.total,
        future: d.ts > now,
        label: Format.shortWhen(d.ts),
        tick: i === 0 || i === mid || i === last ? Format.shortDate(d.ts) : ''
      }));
      // Günlük görünümde bütçe çizgisi yok: hedef kartındaki "günde ₺X" ile çelişen ikinci bir sayı olurdu
      this.#chart.render(bars, {
        key: 'day',
        selected: days.findIndex(d => Domain.dayKey(d.ts) === today),
        title: 'Bu dönemin günlük harcamaları'
      });
      return;
    }

    const periods = Domain.periodTotals(rows, now, cutoff, Config.CHART_PERIODS);
    const bars = periods.map((p, i) => {
      const lastDay = p.end - Config.DAY_MS;
      return {
        value: p.total,
        future: false,
        label: Format.periodName(i - (periods.length - 1), lastDay),
        tick: Format.monthShort(lastDay),
        // Hedef grafiğe çizilmez; dokunulan ekstrenin hedefe göre durumu okuma satırında
        note: goal ? Format.goalNote(p.total, goal) : ''
      };
    });
    this.#chart.render(bars, {
      key: 'period',
      selected: bars.length - 1,
      title: 'Son ' + periods.length + ' ekstre'
    });
  }

  // DEVAM EDEN TAKSİTLER: gelecek ekstreye yazılan, toplam kalan, alışveriş başına ilerleme
  #renderInstallments() {
    const { now, cutoff, items } = this.#model;
    const active = Domain.activeInstallments(items, cutoff, now);
    const next = Domain.periodStart(now, cutoff, 1).getTime();
    const after = Domain.periodStart(now, cutoff, 2).getTime();

    $('instSum').hidden = !active.length;
    $('instNext').textContent = Format.money(Domain.installmentsBetween(items, cutoff, next, after));
    $('instTotal').textContent = Format.money(active.reduce((s, i) => s + i.remaining, 0));

    const list = $('instList');
    list.innerHTML = '';
    if (!active.length) {
      list.appendChild(el('div', 'empty', 'Devam eden taksit yok'));
      return;
    }

    active.forEach(i => {
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
  }
}
