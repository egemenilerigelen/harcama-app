// TARİH SEÇİMİ: "Bugün · Dün · Takvim" (taksit seçicisiyle aynı kalıp). Bugün ve Dün tek dokunuş;
// Takvim'in üstünde görünmez bir tarih alanı var, dokununca iPhone'un kendi tarih seçicisi açılır
// (gelecek gün seçilemez). Seçilen gün kesilmiş bir döneme düşerse not satırında (verildiyse) hangi
// ekstreye girdiği yazar. İsim adımı (yeni harcama) ve kayıt düzenleme kullanır; seçilen günü day ile verir,
// kullanıcı bir gün seçince onPick(day) çağrılır (isim adımında seçici kapanıp özete döner).
// Bağımlılık: Config, Domain, Format, Touch, el
class DateChoice {
  #buttons;
  #cal;
  #calText;
  #picker;
  #hint;
  #day = 0;     // seçili günün başı (ms)
  #now = 0;
  #cutoff = 0;
  #onPick;

  // root: .date-choice (data-ago="0|1" düğmeleri + .date-cal etiketi), hint: ekstre notu satırı (yoksa null)
  constructor(root, hint, { onPick } = {}) {
    this.#buttons = [...root.querySelectorAll('.inst-btn')];
    this.#cal = root.querySelector('.date-cal');
    this.#calText = this.#cal.querySelector('span');
    this.#picker = this.#cal.querySelector('input');
    this.#hint = hint;
    this.#onPick = onPick;

    this.#buttons.filter(b => b !== this.#cal).forEach(btn => {
      btn.onclick = () => this.#pick(Domain.daysAgo(this.#now, Number(btn.dataset.ago)));
      Touch.hapticOn(btn);
    });
    // Bilgisayarda tarih alanı tıklanınca takvim kendiliğinden açılmaz; iPhone'da açılır (hata vermesin)
    this.#picker.addEventListener('click', () => {
      try { this.#picker.showPicker(); } catch { /* zaten açık ya da desteklenmiyor */ }
    });
    this.#picker.addEventListener('change', () => {
      if (!this.#picker.value) return;
      const [y, m, d] = this.#picker.value.split('-').map(Number);
      const day = new Date(y, m - 1, d).getTime();
      if (day <= Domain.dayStart(this.#now)) this.#pick(day);
    });
  }

  // Kullanıcının seçimi (reset değil): dışarıya haber verilir
  #pick(day) {
    this.#select(day);
    if (this.#onPick) this.#onPick(day);
  }

  // Seçimi kurar: ts'nin günü (varsayılan bugün)
  reset(now, cutoff, ts = now) {
    this.#now = now;
    this.#cutoff = cutoff;
    this.#picker.max = Domain.dayKey(now);
    this.#select(Domain.dayStart(ts));
  }

  // Seçili günün başı (ms)
  get day() {
    return this.#day;
  }

  #select(day) {
    this.#day = day;
    const ago = Domain.daysBetween(day, this.#now);
    const quick = this.#buttons.find(b => b !== this.#cal && Number(b.dataset.ago) === ago);
    this.#buttons.forEach(b => b.classList.toggle('active', b === (quick || this.#cal)));
    this.#calText.textContent = quick ? Format.calendar : Format.shortDate(day);
    this.#picker.value = Domain.dayKey(day);

    // Kesilmiş döneme düşüyorsa: "5 Eki · Ekim ekstresine girer"
    if (!this.#hint) return;
    this.#hint.textContent = '';
    if (Domain.periodStart(day, this.#cutoff) < Domain.periodStart(this.#now, this.#cutoff)) {
      const lastDay = Domain.periodStart(day, this.#cutoff, 1).getTime() - Config.DAY_MS;
      this.#hint.append(Format.shortDate(day) + ' · ', el('b', '', Format.intoStatement(lastDay, this.#now)), ' ' + Format.pastPeriod);
    }
  }
}
