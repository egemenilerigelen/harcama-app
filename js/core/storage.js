// VERİ KATMANI: localStorage'a sadece buradan erişilir
// Bağımlılık: Config
const Store = {
  KEY: 'expenses_v1',
  CUTOFF_KEY: 'cutoff_day_v1',
  GOAL_KEY: 'goal_v1',
  GOAL_LOG_KEY: 'goal_log_v1',
  BACKUP_KEY: 'backup_at_v1',
  HAPTICS_KEY: 'haptics_v1',
  STATEMENT_KEY: 'statement_seen_v1',

  all() {
    try {
      return JSON.parse(localStorage.getItem(this.KEY)) || [];
    } catch {
      return [];
    }
  },

  // inst: taksit sayısı (varsayılan 1), ts: harcamanın zamanı (varsayılan şimdi; geçmiş tarihli ekleme),
  // cat: kategori anahtarı (Categories), sub: abonelik (her ay tekrar eder; Domain.subscriptionEntry).
  // Kayıtlar yeniden eskiye sıralı kalır. Eklenen kaydı döner
  add(name, amt, inst = 1, ts = Date.now(), cat, sub = false) {
    const item = {
      id: Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
      name,
      amt: Number(amt),
      inst: Number(inst),
      ts,
      cat,
      ...(sub ? { sub: true } : {})
    };
    this.replaceAll([item, ...this.all()]);
    return item;
  },

  remove(id) {
    const items = this.all().filter(i => i.id !== id);
    localStorage.setItem(this.KEY, JSON.stringify(items));
  },

  // Kaydı düzenler (isim, tutar, taksit, tarih, kategori, abonelik, bitiş: verilen alanlar); id aynı kalır.
  // Abonelik değilse ya da bitmediyse o alan yazılmaz. Önceki halini döner (geri alma için)
  update(id, changes) {
    const items = this.all();
    const i = items.findIndex(e => e.id === id);
    if (i < 0) return null;
    const before = items[i];
    const item = { ...before, ...changes, amt: Number(changes.amt ?? before.amt), inst: Number(changes.inst ?? before.inst) || 1 };
    if (!item.sub) delete item.sub;
    if (!item.end) delete item.end;
    items[i] = item;
    this.replaceAll(items);
    return before;
  },

  // Kaydı olduğu gibi önceki haline koyar (düzenlemeyi geri alma)
  put(item) {
    const items = this.all().map(e => e.id === item.id ? item : e);
    this.replaceAll(items);
  },

  // Silinen kaydı geri koyar; yeni kayıtlar başta durduğu için ts'ye göre sıralar
  restore(item) {
    const items = this.all();
    if (items.some(i => i.id === item.id)) return;
    items.push(item);
    this.replaceAll(items);
  },

  clear() {
    localStorage.removeItem(this.KEY);
  },

  // Tüm kayıtları yeniden eskiye sıralı yazar (geri yükleme, geçmiş tarihli ekleme ve tarih düzenleme
  // sırayı bozmasın; birleştirme Backup.merge'te)
  replaceAll(items) {
    items.sort((a, b) => b.ts - a.ts);
    localStorage.setItem(this.KEY, JSON.stringify(items));
  },

  getCutoff() {
    return Number(localStorage.getItem(this.CUTOFF_KEY)) || Config.DEFAULT_CUTOFF;
  },

  setCutoff(day) {
    localStorage.setItem(this.CUTOFF_KEY, day);
  },

  // Dönem hedefi: her ekstre bu tutarla ölçülür; 0 = hedef yok
  getGoal() {
    return Number(localStorage.getItem(this.GOAL_KEY)) || 0;
  },

  setGoal(amount) {
    if (amount > 0) localStorage.setItem(this.GOAL_KEY, amount);
    else localStorage.removeItem(this.GOAL_KEY);
  },

  // Hedef geçmişi: [{ ts, goal }] eskiden yeniye (Domain.goalLogAdd yazar, Domain.goalAt okur); yoksa []
  getGoalLog() {
    try {
      const log = JSON.parse(localStorage.getItem(this.GOAL_LOG_KEY));
      return Array.isArray(log) ? log : [];
    } catch {
      return [];
    }
  },

  setGoalLog(log) {
    localStorage.setItem(this.GOAL_LOG_KEY, JSON.stringify(log));
  },

  // Son yedeğin zamanı (ms); hiç alınmadıysa 0
  getBackupAt() {
    return Number(localStorage.getItem(this.BACKUP_KEY)) || 0;
  },

  setBackupAt(ts) {
    localStorage.setItem(this.BACKUP_KEY, ts);
  },

  // Titreşim tercihi: varsayılan açık, kapatılınca '0' yazılır
  getHaptics() {
    return localStorage.getItem(this.HAPTICS_KEY) !== '0';
  },

  setHaptics(on) {
    if (on) localStorage.removeItem(this.HAPTICS_KEY);
    else localStorage.setItem(this.HAPTICS_KEY, '0');
  },

  // Kendiliğinden gösterilen son ekstre özetinin dönem başı (her ekstre bir kez; cihaza özel, yedeğe girmez)
  getStatementSeen() {
    return Number(localStorage.getItem(this.STATEMENT_KEY)) || 0;
  },

  setStatementSeen(start) {
    localStorage.setItem(this.STATEMENT_KEY, start);
  }
};