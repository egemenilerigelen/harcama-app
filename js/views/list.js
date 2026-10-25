// HARCAMALAR: dönem gezgini, arama ve günlere göre liste
// Kendi durumunu (seçili dönem, arama) kendisi tutar; değişince onChange ile yeniden çizim ister.
// Bağımlılık: Config, Domain, Format, ExpenseRow, Touch, paintMoney, $, el
class ListView {
  #offset = 0;          // 0 bu dönem, -1 geçen dönem ...
  #searching = false;
  #query = '';
  #rowActions;
  #onChange;
  #view = document.querySelector('[data-view="list"]');
  #card = document.querySelector('.period');
  #list = $('list');
  #search = $('search');
  #prev = $('perPrev');
  #next = $('perNext');

  constructor({ rowActions, onChange }) {
    this.#rowActions = rowActions;
    this.#onChange = onChange;

    Touch.bindPress(this.#prev, () => { if (!this.#prev.disabled) this.#step(-1); });
    Touch.bindPress(this.#next, () => { if (!this.#next.disabled) this.#step(1); });

    // Dönem kartını kaydırarak da gezilir; sınırlar okların durumundan okunur
    Touch.bindPager(this.#card, {
      canPrev: () => !this.#prev.disabled,
      canNext: () => !this.#next.disabled,
      onPrev: () => this.#step(-1),
      onNext: () => this.#step(1)
    });

    $('searchBtn').onclick = () => this.#setSearch(!this.#searching);
    $('searchCancel').onclick = () => this.#setSearch(false);
    this.#search.oninput = () => {
      this.#query = this.#search.value;
      this.#onChange();
    };
  }

  // "Tümünü gör" ile gelindiğinde bu döneme dön (çizimi çağıran yapar)
  resetPeriod() {
    this.#offset = 0;
  }

  // Dönemde abonelik çekimleri ve önceki alışverişlerin taksitleri günlere girmez (kendiliğinden gelen
  // ödemeler; taksitler dönemin ilk gününü şişirmesin), altta kendi gruplarında durur; dönem toplamında sayılır
  render({ now, cutoff, rows }) {
    this.#list.innerHTML = '';
    if (this.#searching) {
      this.#renderDays(this.#renderSearch(rows), this.#query.trim() ? 'Sonuç yok' : 'Henüz harcama yok', now);
      return;
    }
    const items = this.#renderPeriod(now, cutoff, rows);
    const subs = items.filter(r => r.sub);
    const carried = items.filter(Domain.isCarried);
    this.#renderDays(items.filter(Domain.isDaily), subs.length || carried.length ? '' : 'Bu dönemde harcama yok', now);
    if (subs.length) this.#renderGroup(Format.subsTitle, subs, now);
    if (carried.length) this.#renderGroup(Format.carriedTitle, carried, now);
  }

  // Arama: tüm dönemlerde isimle eşleşenler. Özet: boşken tüm zamanların, yazınca eşleşenlerin toplamı
  #renderSearch(rows) {
    const q = this.#query.trim().toLocaleLowerCase('tr-TR');
    const items = q ? rows.filter(r => (r.name || '').toLocaleLowerCase('tr-TR').includes(q)) : rows;
    $('searchSum').textContent = items.length
      ? (q ? 'Toplam · ' : 'Tüm zamanlar · ') + Format.money(Domain.sum(items))
      : '';
    return items;
  }

  // Dönem kartı: seçili dönemin toplamı (önceki taksitler ve abonelikler dahil) ve günlük ortalaması
  // (sadece o dönemde yapılan harcamalar: taksitler ilk günde toplanıp ortalamayı şişirmesin)
  #renderPeriod(now, cutoff, rows) {
    const start = Domain.periodStart(now, cutoff, this.#offset).getTime();
    const end = Domain.periodStart(now, cutoff, this.#offset + 1).getTime();
    const items = rows.filter(r => r.ts >= start && r.ts < end);
    const total = Domain.sum(items);
    const spent = Domain.sum(items.filter(Domain.isDaily));

    const lastDay = end - Config.DAY_MS;
    $('perName').textContent = Format.periodName(this.#offset, lastDay, now);
    $('listRange').textContent = Format.rangeWithYear(start, lastDay, now);
    paintMoney($('perTotal'), Format.money(total));
    $('listSum').textContent = items.length
      ? 'Günlük ort. ' + Format.money(Math.round(spent / Domain.periodDays(start, end, now)))
      : 'Harcama yok';

    // En eski kaydın dönemine kadar geri, bu döneme kadar ileri gidilebilir
    const oldest = rows.length ? rows[rows.length - 1].ts : now;
    this.#prev.disabled = start <= oldest;
    this.#next.disabled = this.#offset >= 0;
    return items;
  }

  // Günlere göre gruplar; hiç gün yoksa emptyText (boşsa yazılmaz)
  #renderDays(items, emptyText, now) {
    const groups = Domain.groupByDay(items);
    const days = Object.keys(groups);

    if (!days.length) {
      if (emptyText) this.#list.appendChild(el('div', 'empty', emptyText));
      return;
    }
    days.forEach(k => this.#renderGroup(Format.dayLabel(k, now), groups[k], now));
  }

  // Başlık (etiket + toplam) ve satırlar. Kategorinin yanında saat; önceki taksitte saat anlamsız
  // (dönem başına düşer), yerine alışverişin tarihi; abonelikte çekimin günü (gruplar günlere ayrılmaz)
  #renderGroup(label, rows, now) {
    const head = el('h2');
    head.append(el('span', '', label), el('span', '', Format.money(Domain.sum(rows))));
    this.#list.appendChild(head);

    const box = el('div', 'day');
    rows.forEach(r => {
      const when = Domain.isCarried(r) ? Format.shortWhen(r.buyTs, now)
        : r.sub && !this.#searching ? Format.shortWhen(r.ts, now) : Format.time(r.ts);
      box.appendChild(ExpenseRow.create(r, when, this.#rowActions));
    });
    this.#list.appendChild(box);
  }

  #step(d) {
    this.#offset = Math.min(0, this.#offset + d);
    this.#onChange();
    this.#list.scrollTop = 0;
  }

  // Arama ikonla açılır, Vazgeç ile kapanır; açıkken dönem kartının yerini alır
  #setSearch(open) {
    this.#searching = open;
    this.#query = '';
    this.#search.value = '';
    this.#view.classList.toggle('searching', open);
    this.#onChange();
    if (open) this.#search.focus();
    else this.#search.blur();
  }
}
