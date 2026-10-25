// ANA SAYFA: özet kartı ve son harcamalar (giriş paneli ayrı: EntryPanel)
// Bağımlılık: Config, Domain, Format, ExpenseRow, RollingText, Touch, $, el
class HomeView {
  #recent = $('recent');
  #rowActions;
  #month = new RollingText($('sMonth'));
  #today = new RollingText($('sToday'));
  #shown = null; // ekrandaki toplamlar { month, today }: hangi yöne kayılacağı buradan

  // rowActions: satır eylemleri, onSeeAll: "Tümünü gör"
  constructor({ rowActions, onSeeAll }) {
    this.#rowActions = rowActions;
    Touch.bindPress($('seeAll'), onSeeAll);
  }

  // animate: veri bir eylemle değişti (ekleme, silme, geri alma); toplamların değişen haneleri kayar.
  // Açılışta, sekme dönüşünde ve uygulama öne gelince değer anında yazılır
  render({ now, cutoff, periodStart, rows, animate }) {
    const start = periodStart.getTime();
    const next = Domain.periodStart(now, cutoff, 1).getTime();
    const todayKey = Domain.dayKey(now);

    // Bugün: bugün yapılan harcama. Önceki alışverişlerin taksitleri (dönemin ilk gününe düşer) ve abonelik
    // çekimleri girmez, yoksa dönemin ilk günü hiç harcama yokken "Bugün" taksit toplamını gösterirdi
    // (ikisi de dönem toplamında var)
    const today = Domain.sum(rows.filter(r => Domain.isDaily(r) && Domain.dayKey(r.ts) === todayKey));
    const month = Domain.sum(rows.filter(r => r.ts >= start));
    const dir = (from, to) => animate && this.#shown && from !== to ? (to > from ? 'up' : 'down') : null;
    this.#today.set(Format.money(today), dir(this.#shown?.today, today));
    this.#month.set(Format.money(month), dir(this.#shown?.month, month));
    this.#shown = { month, today };
    $('sPeriod').textContent = '· ' + Format.range(start, next - Config.DAY_MS);

    this.#renderRecent(rows.slice(0, Config.RECENT_MAX), now);
  }

  #renderRecent(rows, now) {
    this.#recent.innerHTML = '';
    if (!rows.length) {
      this.#recent.appendChild(el('div', 'empty', 'Henüz harcama yok'));
    } else {
      const box = el('div', 'day');
      rows.forEach(r => box.appendChild(ExpenseRow.create(r, Format.shortWhen(r.ts, now), this.#rowActions)));
      this.#recent.appendChild(box);
    }
    this.fit();
  }

  // Son harcamalar kaymaz: sadece tam sığan satırları göster (en az 1)
  fit() {
    const box = this.#recent;
    if (!box.clientHeight) return; // ana sayfa gizliyken ölçülemez
    const rows = box.querySelectorAll('.swipe');
    rows.forEach(r => (r.style.display = ''));
    for (let k = rows.length - 1; k > 0 && box.scrollHeight > box.clientHeight; k--) {
      rows[k].style.display = 'none';
    }
  }

  // Yeni kaydı listede kısa bir hareketle göster (bir kez); geçmiş tarihliyse son harcamalarda
  // olmayabilir. Bitince ya da yarıda kalınca (bitmeden sekme değişti) sınıf kalkar: kalırsa ana sayfa
  // yeniden göründükçe tarayıcı animasyonu baştan oynatır
  flash(id) {
    const first = this.#recent.querySelector('.row[data-id="' + id + '"]');
    if (!first) return;
    const done = () => first.classList.remove('enter');
    first.addEventListener('animationend', done, { once: true });
    first.addEventListener('animationcancel', done, { once: true });
    first.classList.add('enter');
  }
}
