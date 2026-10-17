// BİÇİMLENDİRME: ekranda görünen sayı ve tarih metinleri (tr-TR).
// Saf: "bugün" ve "bu yıl" gerektiren metinler zamanı (now) parametre olarak alır, Date.now() kullanmaz.
// Bağımlılık: Config, Domain
const Format = Object.freeze({
  // Önce kuruşa yuvarlanır: taksit paylarının toplamı 6,999999… çıkıp "₺7,00" yazılmasın
  money(amount) {
    const n = Math.round(amount * 100) / 100;
    return '₺' + n.toLocaleString('tr-TR', { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 });
  },

  time(ts) {
    return new Date(ts).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  },

  shortDate(ts) {
    return new Date(ts).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
  },

  // Detay paneli: "5 Ekim 2026 Pzt, 17:42"
  longDateTime(ts) {
    return new Date(ts).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'short' }) + ', ' + Format.time(ts);
  },

  // Gün başlığı: "Bugün, 7 Ekim Sal" / "Dün, ..." / "5 Ekim Pzt"
  dayLabel(key, now) {
    const [Y, M, D] = key.split('-');
    const label = new Date(Y, M - 1, D).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'short' });
    if (key === Domain.dayKey(now)) return 'Bugün, ' + label;
    if (key === Domain.dayKey(now - Config.DAY_MS)) return 'Dün, ' + label;
    return label;
  },

  // Kısa tarih etiketi: "Bugün", "Dün" ya da "5 Eki"
  shortWhen(ts, now) {
    const key = Domain.dayKey(ts);
    if (key === Domain.dayKey(now)) return 'Bugün';
    if (key === Domain.dayKey(now - Config.DAY_MS)) return 'Dün';
    return Format.shortDate(ts);
  },

  // Dönem aralığı: "13 Eyl – 12 Eki"
  range(a, b) {
    return Format.shortDate(a) + ' – ' + Format.shortDate(b);
  },

  // Dönem aralığı; başka yıldaysa yıl da yazılır
  rangeWithYear(a, b, now) {
    const y = new Date(b).getFullYear();
    return Format.range(a, b) + (y !== new Date(now).getFullYear() ? ' ' + y : '');
  },

  // Dönem gezgini etiketi: bu dönem "Bu dönem", geçmişler bittiği ayın ekstresi
  periodName(offset, lastDay, now) {
    return offset === 0 ? 'Bu dönem' : Format.statement(lastDay, now);
  },

  // Bittiği ayın ekstresi: "Eylül ekstresi"; başka yıldaysa yıl da yazılır ("Aralık 2025 ekstresi")
  statement(lastDay, now) {
    const d = new Date(lastDay);
    const year = d.getFullYear() !== new Date(now).getFullYear() ? ' ' + d.getFullYear() : '';
    return d.toLocaleDateString('tr-TR', { month: 'long' }) + year + ' ekstresi';
  },

  // Taksitlerin şimdiden yazıldığı ekstre: "Kasım ekstresine"
  intoStatement(lastDay, now) {
    return Format.statement(lastDay, now) + 'ne';
  },

  // Kesim günü: "Ayın 13'ü"
  cutoffDay(day) {
    return 'Ayın ' + day + Format.possessive(day);
  },

  // Sonraki ekstre kesimi: "12 Eki · 2 gün sonra" / "· yarın" / "· bugün"
  nextCutoff(lastDay, now) {
    const n = Domain.daysBetween(now, lastDay);
    return Format.shortDate(lastDay) + ' · ' + (n === 0 ? 'bugün' : n === 1 ? 'yarın' : n + ' gün sonra');
  },

  // Ayarlar'daki yedek satırı: "Son yedek: bugün" / "dün" / "12 gün önce" / "Henüz yedek alınmadı"
  backupAge(ts, now) {
    if (!ts) return 'Henüz yedek alınmadı';
    const n = Domain.daysBetween(ts, now);
    return 'Son yedek: ' + (n === 0 ? 'bugün' : n === 1 ? 'dün' : n + ' gün önce');
  },

  // Geri yükleme sonucu: "12 kayıt eklendi · 3 kayıt zaten vardı"
  importResult(added, skipped) {
    const parts = [added ? added + ' kayıt eklendi' : 'Yeni kayıt yok'];
    if (skipped) parts.push(skipped + ' kayıt zaten vardı');
    return parts.join(' · ');
  },

  // Dosya adları: "harcama-yedek-2026-10-10.json", "harcama-2026-10-10.csv"
  backupName(now) {
    return 'harcama-yedek-' + Domain.dayKey(now) + '.json';
  },

  csvName(now) {
    return 'harcama-' + Domain.dayKey(now) + '.csv';
  },

  // "3 gün kaldı"
  daysLeft(n) {
    return n + ' gün kaldı';
  },

  // Yüzde: Türkçede işaret önde ("%62")
  percent(ratio) {
    return '%' + Math.round(ratio * 100);
  },

  // Sayıya gelen iyelik eki, Türkçe okunuşun son kelimesine göre: 74 → "'ü" (dört), 50 → "'si" (elli), 6 → "'sı" (altı)
  possessive(n) {
    const ones = ['', "'i", "'si", "'ü", "'ü", "'i", "'sı", "'si", "'i", "'u"];
    const tens = ['', "'u", "'si", "'u", "'ı", "'si", "'ı", "'i", "'i", "'ı"];
    if (n === 0) return "'ı";
    if (n % 10) return ones[n % 10];
    if (n % 100) return tens[(n / 10) % 10];
    return n % 1000 ? "'ü" : "'i"; // yüz / bin
  },

  // Tutarın hedefe payı: "hedefin %74'ü"
  goalShare(amount, goal) {
    const pct = Math.round(amount / goal * 100);
    return 'hedefin %' + pct + Format.possessive(pct);
  },

  // Ekstrenin hedefe göre durumu: "%33 · hedef ₺9.500" ya da "₺1.200 aştı · hedef ₺9.500"
  goalNote(total, goal) {
    const status = total > goal ? Format.money(total - goal) + ' aştı' : Format.percent(total / goal);
    return status + ' · hedef ' + Format.money(goal);
  },

  // Hedef kartının alt satırı: ne yapmalı. p: Domain.goalProgress (hedef yoksa null),
  // carried: bu döneme yansıyan önceki taksitler. Aşımda tutarı tekrar etmez (halka ve "Aşım" satırı söylüyor).
  goalHint(p, carried) {
    if (!p) return 'Halkaya dokunup bir dönem hedefi koy; her ekstre bu tutarla ölçülür.';
    const days = Format.daysLeft(p.daysLeft);
    if (p.state === 'over') {
      return carried ? Format.money(carried) + ' önceki taksitlerden · ' + days : 'Dönemin bitmesine ' + p.daysLeft + ' gün var';
    }
    if (p.perDay < 1) return 'Hedefin sınırındasın · ' + days;
    const perDay = Format.money(Math.floor(p.perDay)) + ' ile hedefte kalırsın · ' + days;
    return p.state === 'warn' ? 'Hızlı gidiyorsun · günde ' + perDay : 'Günde ' + perDay;
  },

  // Hedef önerisi: "Son 3 ekstre ortalaması ≈ ₺8.900" / "Geçen ekstre ≈ ₺8.900"
  goalSuggestion({ count, amount }) {
    return (count === 1 ? 'Geçen ekstre' : 'Son ' + count + ' ekstre ortalaması') + ' ≈ ' + Format.money(amount);
  },

  // Günlük grafikte dönemin ilk gününün notu: "+₺7.000 önceki taksitler"
  carriedNote(amount) {
    return '+' + Format.money(amount) + ' önceki taksitler';
  },

  // Tarih seçimi: takvim düğmesi ve seçilen gün kesilmiş döneme düşünce notun sonu
  // ("5 Eki · Ekim ekstresine girer (kesilmiş dönem)")
  calendar: 'Takvim',
  pastPeriod: 'girer (kesilmiş dönem)',

  // Harcamalar listesinde önceki alışverişlerin bu döneme yansıyan taksitleri (günlerden ayrı grup)
  carriedTitle: 'Önceki taksitler',

  // Ekstre grafiğinde ilk kayıttan önceki dönemler
  noRecord: 'Kayıt yok',

  // Geri alma kapsülü: "Netflix silindi"; düzenlemede tutar değiştiyse "₺320 → ₺298"
  undoTitle(kind, name) {
    return name + ' ' + { deleted: 'silindi', edited: 'düzenlendi' }[kind];
  },

  change(from, to) {
    return from === to ? Format.money(to) : Format.money(from) + ' → ' + Format.money(to);
  },

  // Kısa ay adı: "Eki" (ekstre grafiği ekseni)
  monthShort(ts) {
    return new Date(ts).toLocaleDateString('tr-TR', { month: 'short' });
  },

  installment(n) {
    return n === 1 ? 'Tek çekim' : n + ' taksit';
  },

  part(no, of) {
    return no + '/' + of + ' taksit';
  },

  // Taksit listesini açan / kapatan satır: "5 taksit daha" / "Daha az göster"
  instToggle(hidden, open) {
    return open ? 'Daha az göster' : hidden + ' taksit daha';
  },

  // Tutar girişi: binlik ayracı (.) ve ondalık virgül (,); ham değer Calc'ta kalır
  amountInput(raw) {
    if (!raw) return '';
    const [i, d] = raw.split('.');
    const grouped = i.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return raw.includes('.') ? grouped + ',' + (d || '') : grouped;
  }
});
