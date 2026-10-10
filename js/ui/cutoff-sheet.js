// KESİM GÜNÜ PANELİ: ayın 1–28. günleri (iPhone Hatırlatıcılar'daki "her ay" seçicisi gibi;
// gün adı ve ay başlığı yok, çünkü kesim belirli bir tarih değil her ay tekrar eden gün).
// Seçilen gün altın daire, bugün sayının altında nokta. Altta dönem aralığı ve sonraki kesim.
// Seçim "Kaydet"e kadar uygulanmaz (her dokunuşta dönemler yeniden hesaplanmasın).
// Nereye kaydedileceğini bilmez; sonucu onSave(gün) ile dışarı verir.
// Bağımlılık: BottomSheet, Config, Domain, Format, Touch, $, el
class CutoffSheet extends BottomSheet {
  #buttons = [];
  #day = Config.DEFAULT_CUTOFF;
  #now = 0;

  constructor({ onSave }) {
    super($('cutSheet'));

    const grid = $('cutGrid');
    for (let d = Config.CUTOFF_MIN; d <= Config.CUTOFF_MAX; d++) {
      const btn = el('button', 'cal-day');
      btn.appendChild(el('span', 'n', String(d)));
      btn.setAttribute('role', 'radio');
      btn.setAttribute('aria-label', Format.cutoffDay(d));
      Touch.bindPress(btn, () => this.#select(d));
      grid.appendChild(btn);
      this.#buttons.push(btn);
    }

    $('cutSave').onclick = () => {
      this.close();
      onSave(this.#day);
    };
  }

  // day: kayıtlı kesim günü, now: bugün ve önizlemenin hesaplandığı an
  open(day, now) {
    this.#now = now;
    const today = new Date(now).getDate();
    this.#buttons.forEach((b, i) => b.classList.toggle('today', i + Config.CUTOFF_MIN === today));
    this.#select(day);
    super.open();
  }

  #select(day) {
    this.#day = day;
    this.#buttons.forEach((b, i) => {
      const on = i + Config.CUTOFF_MIN === day;
      b.classList.toggle('sel', on);
      b.setAttribute('aria-checked', on);
    });
    const start = Domain.periodStart(this.#now, day).getTime();
    const lastDay = Domain.periodStart(this.#now, day, 1).getTime() - Config.DAY_MS;
    $('cutRange').textContent = Format.range(start, lastDay);
    $('cutNext').textContent = Format.nextCutoff(lastDay, this.#now);
  }
}
