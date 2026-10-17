// VERİ KATMANI: localStorage'a sadece buradan erişilir
// Bağımlılık: Config
const Store = {
  KEY: 'expenses_v1',
  CUTOFF_KEY: 'cutoff_day_v1',
  GOAL_KEY: 'goal_v1',
  BACKUP_KEY: 'backup_at_v1',
  HAPTICS_KEY: 'haptics_v1',

  all() {
    try {
      return JSON.parse(localStorage.getItem(this.KEY)) || [];
    } catch {
      return [];
    }
  },

  // inst: taksit sayısı (varsayılan 1), ts: harcamanın zamanı (varsayılan şimdi; geçmiş tarihli ekleme),
  // cat: kategori anahtarı (Categories). Kayıtlar yeniden eskiye sıralı kalır. Eklenen kaydı döner
  add(name, amt, inst = 1, ts = Date.now(), cat) {
    const item = {
      id: Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
      name,
      amt: Number(amt),
      inst: Number(inst),
      ts,
      cat
    };
    this.replaceAll([item, ...this.all()]);
    return item;
  },

  remove(id) {
    const items = this.all().filter(i => i.id !== id);
    localStorage.setItem(this.KEY, JSON.stringify(items));
  },

  // Kaydı düzenler (isim, tutar, taksit, tarih, kategori); id aynı kalır. Önceki halini döner (geri alma için)
  update(id, { name, amt, inst, ts, cat }) {
    const items = this.all();
    const i = items.findIndex(e => e.id === id);
    if (i < 0) return null;
    const before = items[i];
    items[i] = { ...before, name, amt: Number(amt), inst: Number(inst), ts, cat };
    this.replaceAll(items);
    return before;
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
  }
};