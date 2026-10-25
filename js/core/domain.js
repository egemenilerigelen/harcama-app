// İŞ MANTIĞI: saf fonksiyonlar. DOM'a ve Store'a dokunmaz, veriyi parametre olarak alır.
// Bağımlılık: Config, Categories
const Domain = Object.freeze({
  // Gün anahtarı (YYYY-MM-DD): günlere göre gruplama ve tarih alanının değeri için
  dayKey(ts) {
    const d = new Date(ts);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  },

  // Tarihin içinde bulunduğu hesap döneminin başı; offset ile önceki (-1) / sonraki (+1) dönemler.
  // Bankalardaki gibi kesim günü dahil: kesim günü 12 ise dönem 13 Eyl – 12 Eki, yeni dönem ertesi gün başlar.
  // (Kesim 28'se Şubat'ta 29. gün 1 Mart'a taşar; Date bunu kendisi yapar, dönem doğru kalır.)
  periodStart(date, cutoff, offset = 0) {
    const d = new Date(date);
    const month = d.getDate() > cutoff ? d.getMonth() : d.getMonth() - 1;
    return new Date(d.getFullYear(), month + offset, cutoff + 1);
  },

  // Dönemde sayılan gün: süren dönemde bugüne kadar, biten dönemde tamamı
  periodDays(start, end, now) {
    return now < end
      ? Math.floor((now - start) / Config.DAY_MS) + 1
      : Math.round((end - start) / Config.DAY_MS);
  },

  // Günün başı (yerel 00:00, ms)
  dayStart(ts) {
    const d = new Date(ts);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  },

  // n gün önceki günün başı (yaz saati geçişinde de doğru gün)
  daysAgo(now, n) {
    const d = new Date(now);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate() - n).getTime();
  },

  // Seçilen günün tarihi + verilen anın saati (geçmiş tarihli ekleme: şimdiki saat;
  // tarih düzenleme: kaydın kendi saati)
  atDay(day, timeTs) {
    const d = new Date(day), t = new Date(timeTs);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), t.getHours(), t.getMinutes(), t.getSeconds(), t.getMilliseconds()).getTime();
  },

  // İki an arasındaki takvim günü farkı (saatten bağımsız): dün → bugün = 1
  daysBetween(a, b) {
    return Math.round((Domain.dayStart(b) - Domain.dayStart(a)) / Config.DAY_MS);
  },

  // Yedek hatırlatması: kayıt varken hiç yedek yoksa ya da son yedek Config.BACKUP_WARN_DAYS'ten eskiyse
  backupDue(lastBackup, now, hasData) {
    return hasData && (!lastBackup || Domain.daysBetween(lastBackup, now) >= Config.BACKUP_WARN_DAYS);
  },

  // Dönemin kalan günü (bugün dahil, en az 1)
  daysLeft(start, end, now) {
    return Math.max(1, Domain.periodDays(start, end, end) - Domain.periodDays(start, end, now) + 1);
  },

  clampCutoff(day) {
    return Math.min(Config.CUTOFF_MAX, Math.max(Config.CUTOFF_MIN, day));
  },

  // Taksitli kayıtları sanal taksit satırlarına açar (gelecek taksitler dahil).
  // İlk taksit kaydın kendi tarihine, sonrakiler sonraki dönem başlarına düşer; buyTs alışverişin tarihi.
  // Abonelikler her ayın çekimine açılır, now'a kadar (gelecek çekim yok; now verilmezse sadece ilki)
  expand(items, cutoff, now = 0) {
    const rows = [];
    items.forEach(item => {
      // Eski kayıtlarda inst veya amt yoksa varsayılan
      const parts = Math.max(1, Number(item.inst) || 1);
      const total = Number(item.amt) || 0;

      if (item.sub) {
        rows.push(...Domain.charges(item, now));
        return;
      }
      if (parts === 1) {
        rows.push({ ...item, amt: total, displayAmt: total });
        return;
      }

      const single = total / parts;
      for (let m = 0; m < parts; m++) {
        rows.push({
          id: item.id + '_' + m,
          rawId: item.id,
          name: item.name,
          cat: item.cat,
          amt: single,
          displayAmt: single,
          ts: m === 0 ? item.ts : Domain.periodStart(item.ts, cutoff, m).getTime(),
          buyTs: item.ts,
          part: m + 1,
          parts
        });
      }
    });
    return rows;
  },

  // Ekranda gösterilecek satırlar: gelmemiş taksitler hariç, yeniden eskiye
  visibleRows(items, cutoff, now) {
    return Domain.expand(items, cutoff, now)
      .filter(r => r.ts <= now)
      .sort((a, b) => b.ts - a.ts);
  },

  // Önceki dönemlerde yapılmış alışverişin bu döneme yansıyan taksiti (2. taksit ve sonrası, dönemin ilk gününe düşer)
  isCarried(row) {
    return row.part > 1;
  },

  // Günün harcaması: önceki taksitler ve abonelik çekimleri değil (ikisi de dönem toplamına girer ama
  // "Bugün", günlük grafik, gün başlıkları ve günlük ortalama saymaz: kendiliğinden gelen ödemeler)
  isDaily(row) {
    return !Domain.isCarried(row) && !row.sub;
  },

  // İlk kaydın döneminin başı: daha eski dönemlerde veri yok (₺0 değil). Kayıt yoksa bu dönem.
  dataSince(items, cutoff, now) {
    const first = items.reduce((min, i) => Math.min(min, i.ts), now);
    return Domain.periodStart(first, cutoff).getTime();
  },

  // Bir kaydın henüz gelmemiş taksit sayısı
  remainingParts(item, cutoff, now) {
    return Domain.expand([item], cutoff).filter(r => r.ts > now).length;
  },

  sum(rows) {
    return rows.reduce((s, r) => s + r.displayAmt, 0);
  },

  // Dönemin her günü için toplam (gün başı ts ile): [{ ts, total }]
  dailyTotals(rows, start, end) {
    const byDay = Domain.groupByDay(rows.filter(r => r.ts >= start && r.ts < end));
    const days = [];
    for (let d = new Date(start); d.getTime() < end; d.setDate(d.getDate() + 1)) {
      days.push({ ts: d.getTime(), total: Domain.sum(byDay[Domain.dayKey(d)] || []) });
    }
    return days;
  },

  // Son `count` dönemin toplamı, eskiden yeniye; son eleman bu dönem: [{ start, end, total }]
  periodTotals(rows, now, cutoff, count) {
    const periods = [];
    for (let k = 1 - count; k <= 0; k++) {
      const start = Domain.periodStart(now, cutoff, k).getTime();
      const end = Domain.periodStart(now, cutoff, k + 1).getTime();
      periods.push({ start, end, total: Domain.sum(rows.filter(r => r.ts >= start && r.ts < end)) });
    }
    return periods;
  },

  // Hedef ilerlemesi: oran, kalan (eksiyse aşım), kalan gün, hedefte kalmak için günlük tutar ve durum.
  // Durum tempoya bakar, sadece orana değil: dönemin sonunda %80 normal, başında %50 alarm.
  // 'over' hedef aşıldı, 'warn' harcama dönemin geçen kısmının Config.GOAL_PACE_SLACK'ten fazla önünde, 'ok'
  // reserved: dönemin kalanında gelecek abonelik çekimleri; günlük tutar onlar ayrıldıktan sonra hesaplanır
  goalProgress(spent, goal, start, end, now, reserved = 0) {
    const daysLeft = Domain.daysLeft(start, end, now);
    const remaining = goal - spent;
    const free = remaining - reserved;
    const ratio = goal ? spent / goal : 0;
    const elapsed = Domain.periodDays(start, end, now) / Domain.periodDays(start, end, end);
    return {
      ratio,
      remaining,
      daysLeft,
      perDay: free > 0 ? free / daysLeft : 0,
      state: ratio > 1 ? 'over' : ratio > elapsed + Config.GOAL_PACE_SLACK ? 'warn' : 'ok'
    };
  },

  // Hedef önerisi: ilk kayıttan beri biten son Config.GOAL_SUGGEST_PERIODS ekstrenin ortalaması,
  // Config.GOAL_SUGGEST_ROUND'a yuvarlanmış: { count, amount }. Biten ekstre ya da harcama yoksa null.
  goalSuggestion(items, rows, now, cutoff) {
    const since = Domain.dataSince(items, cutoff, now);
    const done = Domain.periodTotals(rows, now, cutoff, Config.GOAL_SUGGEST_PERIODS + 1)
      .slice(0, -1)
      .filter(p => p.start >= since);
    if (!done.length) return null;
    const avg = done.reduce((s, p) => s + p.total, 0) / done.length;
    const amount = Math.round(avg / Config.GOAL_SUGGEST_ROUND) * Config.GOAL_SUGGEST_ROUND;
    return amount > 0 ? { count: done.length, amount } : null;
  },

  // Devam eden taksitli alışverişler, kalan borcu büyükten küçüğe:
  // [{ id, name, paid (yansıyan taksit), parts, single, remaining }]
  activeInstallments(items, cutoff, now) {
    return items
      .filter(item => Math.max(1, Number(item.inst) || 1) > 1)
      .map(item => {
        const parts = Domain.expand([item], cutoff);
        const paid = parts.filter(p => p.ts <= now).length;
        const single = parts[0].amt;
        return { id: item.id, name: item.name, paid, parts: parts.length, single, remaining: (parts.length - paid) * single };
      })
      .filter(i => i.paid < i.parts)
      .sort((a, b) => b.remaining - a.remaining);
  },

  // Bir aralığa düşen taksitlerin toplamı (ör. gelecek ekstreye şimdiden yazılanlar)
  installmentsBetween(items, cutoff, start, end) {
    return Domain.sum(Domain.expand(items, cutoff).filter(r => r.parts && r.ts >= start && r.ts < end));
  },

  // Sık kullanılan isimler (isim adımındaki çipler): en çok girilen önce, eşitse en son girilen.
  // Büyük/küçük harf farkı aynı isim sayılır, en son yazılışı gösterilir; "Adsız" girmez.
  frequentNames(items, limit) {
    const byKey = new Map();
    items.forEach(i => {
      const name = String(i.name || '').trim();
      if (!name || name === 'Adsız') return;
      const key = name.toLocaleLowerCase('tr-TR');
      const e = byKey.get(key) || { name, count: 0, last: 0 };
      e.count++;
      if (i.ts > e.last) { e.last = i.ts; e.name = name; }
      byKey.set(key, e);
    });
    return [...byKey.values()]
      .sort((a, b) => b.count - a.count || b.last - a.last)
      .slice(0, limit)
      .map(e => e.name);
  },

  // ABONELİKLER: Abonelik kategorisinde tek çekim kayıt (sub: true) bir kez girilir, her ay aynı gün
  // kendiliğinden yazılır; bitirilince (end) sonraki çekimler olmaz

  // Kayıt abonelik olarak mı yazılsın: Abonelik kategorisi ve tek çekim. Düzenlemede (before: önceki hali)
  // abonelik işareti olmayan eski Abonelik kaydı (her ay elle girilmiş) kendiliğinden tekrar etmeye başlamaz;
  // sadece kategorisi Abonelik'e çevrilen kayıt abonelik olur
  subscriptionEntry(cat, inst, before = null) {
    if (cat !== Categories.SUBS || Number(inst) !== 1) return false;
    return !before || !!before.sub || before.cat !== Categories.SUBS;
  },

  // n ay sonrası, aynı gün ve saat; ay o kadar uzun değilse ayın son günü (31 Oca → 28 Şub)
  addMonths(ts, n) {
    const d = new Date(ts);
    const last = new Date(d.getFullYear(), d.getMonth() + n + 1, 0).getDate();
    return new Date(d.getFullYear(), d.getMonth() + n, Math.min(d.getDate(), last),
      d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds()).getTime();
  },

  // Aboneliğin çekimleri: ilki kaydın kendisi, sonrakiler her ay aynı gün (id <id>_m<n>, rawId asıl kayıt);
  // until'e kadar (dahil), bitirildiyse (end) bitişten öncekiler
  charges(item, until) {
    const amt = Number(item.amt) || 0;
    const rows = [{ ...item, amt, displayAmt: amt }];
    for (let m = 1; ; m++) {
      const ts = Domain.addMonths(item.ts, m);
      if (!(ts <= until) || (item.end && ts >= item.end)) break; // tarih bozuksa da (NaN) durur
      rows.push({ ...item, id: item.id + '_m' + m, rawId: item.id, amt, displayAmt: amt, ts });
    }
    return rows;
  },

  // Aboneliğin now'dan sonraki ilk çekimi
  nextCharge(item, now) {
    let m = 1;
    while (Domain.addMonths(item.ts, m) <= now) m++;
    return Domain.addMonths(item.ts, m);
  },

  // Süren abonelikler, sıradaki çekimi yakın olan önce: [{ id, name, cat, amt, next }]
  activeSubscriptions(items, now) {
    return items
      .filter(i => i.sub && (!i.end || i.end > now))
      .map(i => ({ id: i.id, name: i.name, cat: i.cat, amt: Number(i.amt) || 0, next: Domain.nextCharge(i, now) }))
      .sort((a, b) => a.next - b.next);
  },

  // now'dan sonra, end'den önce gelecek abonelik çekimlerinin toplamı (dönemin kalanına ayrılan)
  upcomingCharges(items, now, end) {
    return Domain.sum(Domain.expand(items.filter(i => i.sub), 0, end - 1).filter(r => r.ts > now));
  },

  // KATEGORİLER

  // İsmin karşılaştırma anahtarı: küçük harf (Türkçe), kenar boşluksuz
  nameKey(name) {
    return String(name || '').trim().toLocaleLowerCase('tr-TR');
  },

  // Kullanıcının verdiği kategoriler: isim → kategori, en son verilen geçerli (kayıtlar yeniden eskiye)
  learnedCategories(items) {
    const learned = new Map();
    items.forEach(i => {
      const key = Domain.nameKey(i.name);
      if (key && Categories.KEYS.includes(i.cat) && !learned.has(key)) learned.set(key, i.cat);
    });
    return learned;
  },

  // Hatırlama: kullanıcının bu isme en son verdiği kategori; yoksa null. Tahmin yok (uygulama kendisi
  // kategori uydurmaz): "Getir"e bir kez Market dendiyse sonraki "Getir" Market gelir. learned: Domain.learnedCategories
  rememberedCategory(name, learned = new Map()) {
    return learned.get(Domain.nameKey(name)) || null;
  },

  // Kayıtlara kategori: verilmişse o, yoksa (eski kayıtlar) aynı isme verilmiş olan, o da yoksa "Diğer".
  // Kayıtlar değişmez, kopyası döner
  categorize(items) {
    const learned = Domain.learnedCategories(items);
    return items.map(i => Categories.KEYS.includes(i.cat)
      ? i
      : { ...i, cat: Domain.rememberedCategory(i.name, learned) || Categories.OTHER });
  },

  // Dönemin kategori kırılımı, büyükten küçüğe: [{ cat, total, share, prev }]. prev: geçen dönemin aynı
  // gününe kadarki tutar (süren dönem yarımken tam dönemle kıyaslanmasın); geçen dönemde henüz kayıt
  // yoksa (since: Domain.dataSince) null. Önceki alışverişlerin taksitleri de dönemin harcamasıdır, girer.
  categoryBreakdown(rows, { start, end, prevStart, now, since }) {
    const p = new Date(prevStart);
    const prevCut = Math.min(start, new Date(p.getFullYear(), p.getMonth(), p.getDate() + Domain.periodDays(start, end, now)).getTime());
    const byCat = (from, to) => rows.filter(r => r.ts >= from && r.ts < to).reduce((m, r) => {
      const cat = r.cat || Categories.OTHER;
      m[cat] = (m[cat] || 0) + r.displayAmt;
      return m;
    }, {});
    const cur = byCat(start, end);
    const prev = prevStart >= since ? byCat(prevStart, prevCut) : null;
    const total = Object.values(cur).reduce((s, v) => s + v, 0);
    return Object.keys(cur)
      .map(cat => ({ cat, total: cur[cat], share: cur[cat] / total, prev: prev ? prev[cat] || 0 : null }))
      .sort((a, b) => b.total - a.total);
  },

  // Kategorinin geçen döneme göre değişimi: 'up', 'down', 'same' ya da kıyas yoksa null.
  // Küçük farklar (Config.CAT_SAME_RATIO / CAT_SAME_MIN altı) "aynı" sayılır
  categoryChange({ total, prev }) {
    if (prev === null) return null;
    const d = total - prev;
    if (Math.abs(d) < Math.max(Config.CAT_SAME_MIN, prev * Config.CAT_SAME_RATIO)) return 'same';
    return d > 0 ? 'up' : 'down';
  },

  // Kırılımın öne çıkanları: en çok artan ve en çok azalan kategori (yoksa null); kıyas yoksa null
  categoryHighlights(breakdown) {
    if (!breakdown.length || breakdown[0].prev === null) return null;
    const pick = dir => breakdown
      .filter(c => Domain.categoryChange(c) === dir)
      .sort((a, b) => Math.abs(b.total - b.prev) - Math.abs(a.total - a.prev))[0] || null;
    return { up: pick('up'), down: pick('down') };
  },

  // Satırları gün anahtarına göre gruplar; sıralı listeden geldiği için gün sırası korunur
  groupByDay(rows) {
    const groups = {};
    rows.forEach(r => {
      const k = Domain.dayKey(r.ts);
      (groups[k] = groups[k] || []).push(r);
    });
    return groups;
  }
});
