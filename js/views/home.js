// ANA SAYFA: özet kartı ve son harcamalar (giriş paneli ayrı: EntryPanel)
// Bağımlılık: Config, Domain, Format, ExpenseRow, Touch, $, el
class HomeView {
  #recent = $('recent');
  #rowActions;

  // rowActions: satır eylemleri, onSeeAll: "Tümünü gör"
  constructor({ rowActions, onSeeAll }) {
    this.#rowActions = rowActions;
    Touch.bindPress($('seeAll'), onSeeAll);
  }

  render({ now, cutoff, periodStart, rows }) {
    const start = periodStart.getTime();
    const next = Domain.periodStart(now, cutoff, 1).getTime();
    const today = Domain.dayKey(now);

    // Bugün: bugün yapılan harcama. Önceki alışverişlerin taksitleri (dönemin ilk gününe düşer) girmez,
    // yoksa dönemin ilk günü hiç harcama yokken "Bugün" taksit toplamını gösterirdi (dönem toplamında var)
    $('sToday').textContent = Format.money(Domain.sum(rows.filter(r => !Domain.isCarried(r) && Domain.dayKey(r.ts) === today)));
    $('sMonth').textContent = Format.money(Domain.sum(rows.filter(r => r.ts >= start)));
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

  // Yeni kaydı listede kısa bir hareketle göster (bir kez). Bitince ya da yarıda kalınca (bitmeden
  // sekme değişti) sınıf kalkar: kalırsa ana sayfa yeniden göründükçe tarayıcı animasyonu baştan oynatır
  flashNewest() {
    const first = this.#recent.querySelector('.row');
    if (!first) return;
    const done = () => first.classList.remove('enter');
    first.addEventListener('animationend', done, { once: true });
    first.addEventListener('animationcancel', done, { once: true });
    first.classList.add('enter');
  }
}
