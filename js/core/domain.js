// İŞ MANTIĞI: saf fonksiyonlar. DOM'a ve Store'a dokunmaz, veriyi parametre olarak alır.
// Bağımlılık: Config
const Domain = Object.freeze({
  // Gün anahtarı (YYYY-MM-DD): günlere göre gruplama için
  dayKey(ts) {
    const d = new Date(ts);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  },

  // Tarihin içinde bulunduğu hesap döneminin başı; offset ile önceki (-1) / sonraki (+1) dönemler
  periodStart(date, cutoff, offset = 0) {
    const d = new Date(date);
    const month = d.getDate() >= cutoff ? d.getMonth() : d.getMonth() - 1;
    return new Date(d.getFullYear(), month + offset, cutoff);
  },

  // Dönemde sayılan gün: süren dönemde bugüne kadar, biten dönemde tamamı
  periodDays(start, end, now) {
    return now < end
      ? Math.floor((now - start) / Config.DAY_MS) + 1
      : Math.round((end - start) / Config.DAY_MS);
  },

  // Dönemin kalan günü (bugün dahil, en az 1)
  daysLeft(start, end, now) {
    return Math.max(1, Domain.periodDays(start, end, end) - Domain.periodDays(start, end, now) + 1);
  },

  clampCutoff(day) {
    return Math.min(Config.CUTOFF_MAX, Math.max(Config.CUTOFF_MIN, day));
  },

  // Taksitli kayıtları sanal taksit satırlarına açar (gelecek taksitler dahil).
  // İlk taksit kaydın kendi tarihine, sonrakiler sonraki dönem başlarına düşer.
  expand(items, cutoff) {
    const rows = [];
    items.forEach(item => {
      // Eski kayıtlarda inst veya amt yoksa varsayılan
      const parts = Math.max(1, Number(item.inst) || 1);
      const total = Number(item.amt) || 0;

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
          amt: single,
          displayAmt: single,
          ts: m === 0 ? item.ts : Domain.periodStart(item.ts, cutoff, m).getTime(),
          part: m + 1,
          parts
        });
      }
    });
    return rows;
  },

  // Ekranda gösterilecek satırlar: gelmemiş taksitler hariç, yeniden eskiye
  visibleRows(items, cutoff, now) {
    return Domain.expand(items, cutoff)
      .filter(r => r.ts <= now)
      .sort((a, b) => b.ts - a.ts);
  },

  // Önceki dönemlerde yapılmış alışverişin bu döneme yansıyan taksiti (2. taksit ve sonrası, kesim gününe düşer)
  isCarried(row) {
    return row.part > 1;
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
  goalProgress(spent, goal, start, end, now) {
    const daysLeft = Domain.daysLeft(start, end, now);
    const remaining = goal - spent;
    const ratio = goal ? spent / goal : 0;
    const elapsed = Domain.periodDays(start, end, now) / Domain.periodDays(start, end, end);
    return {
      ratio,
      remaining,
      daysLeft,
      perDay: remaining > 0 ? remaining / daysLeft : 0,
      state: ratio > 1 ? 'over' : ratio > elapsed + Config.GOAL_PACE_SLACK ? 'warn' : 'ok'
    };
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
