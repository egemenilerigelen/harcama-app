// YEDEK: verinin dosyaya yazılması ve dosyadan okunması (saf; dosya açma/paylaşma Device'ta).
// JSON yedeği tam geri yüklenir; CSV Excel için (Türkçe Excel: ";" ayırıcı, ondalık virgül, UTF-8 BOM).
// Bağımlılık: Config, Categories, Format
const Backup = Object.freeze({
  APP: 'harcama',
  VERSION: 1,

  // Tam yedek: harcamalar + kesim günü + hedef
  json({ items, cutoff, goal }, now) {
    return JSON.stringify({
      app: Backup.APP,
      version: Backup.VERSION,
      exportedAt: new Date(now).toISOString(),
      cutoff,
      goal,
      expenses: items
    });
  },

  // Yedek dosyasını okur ve doğrular: { items, cutoff, goal } (geçersiz ayar null).
  // Bozuk ya da başka bir dosyada Error fırlatır; mesajı ekranda gösterilir.
  parse(text) {
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error('Dosya okunamadı; JSON yedeği değil.');
    }
    // Ham kayıt dizisi de kabul edilir (localStorage'daki expenses_v1 gibi)
    const raw = Array.isArray(data) ? data : data && data.app === Backup.APP ? data.expenses : null;
    if (!Array.isArray(raw)) throw new Error('Bu dosya bir Harcama yedeği değil.');

    // Kategori bilinmiyorsa alınmaz (ekranda isimden tahmin edilir)
    const items = raw.filter(Backup.isRecord).map(i => ({
      id: i.id,
      name: i.name,
      amt: Number(i.amt),
      inst: Math.max(1, Number(i.inst) || 1),
      ts: Number(i.ts),
      ...(Categories.KEYS.includes(i.cat) ? { cat: i.cat } : {})
    }));
    const cutoff = Number(data.cutoff);
    const goal = Number(data.goal);
    return {
      items,
      cutoff: Number.isInteger(cutoff) && cutoff >= Config.CUTOFF_MIN && cutoff <= Config.CUTOFF_MAX ? cutoff : null,
      goal: goal > 0 ? goal : null
    };
  },

  // Birleştirme: aynı id'li kayıt iki kez eklenmez; sonuç yeniden eskiye. { items, added }
  merge(current, incoming) {
    const ids = new Set(current.map(i => i.id));
    const fresh = incoming.filter(i => !ids.has(i.id));
    return { items: current.concat(fresh).sort((a, b) => b.ts - a.ts), added: fresh.length };
  },

  // Excel için: alışveriş başına bir satır, yeniden eskiye. Kategorisi olmayan kayıt "Diğer"
  // (App kategorilenmiş kayıtları verir: Domain.categorize)
  csv(items) {
    const num = n => n.toFixed(2).replace('.', ',');
    const cell = s => /[;"\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    const rows = [['Tarih', 'Saat', 'Harcama', 'Kategori', 'Tutar', 'Taksit', 'Taksit tutarı'].join(';')];
    items.slice().sort((a, b) => b.ts - a.ts).forEach(i => {
      const inst = Math.max(1, Number(i.inst) || 1);
      const amt = Number(i.amt) || 0;
      rows.push([
        new Date(i.ts).toLocaleDateString('tr-TR'),
        Format.time(i.ts),
        cell(String(i.name)),
        Format.category(i.cat),
        num(amt),
        inst,
        num(amt / inst)
      ].join(';'));
    });
    return '\uFEFF' + rows.join('\r\n') + '\r\n';
  },

  // Geri yüklenebilir kayıt: id, isim, sayısal tutar ve zaman
  isRecord(i) {
    return i && typeof i.id === 'string' && typeof i.name === 'string' &&
      Number.isFinite(Number(i.amt)) && Number.isFinite(Number(i.ts));
  }
});
