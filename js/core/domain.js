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

  // Bir kaydın henüz gelmemiş taksit sayısı
  remainingParts(item, cutoff, now) {
    return Domain.expand([item], cutoff).filter(r => r.ts > now).length;
  },

  sum(rows) {
    return rows.reduce((s, r) => s + r.displayAmt, 0);
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
