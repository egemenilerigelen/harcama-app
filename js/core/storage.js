// VERİ KATMANI: localStorage'a sadece buradan erişilir
// Bağımlılık: Config
const Store = {
  KEY: 'expenses_v1',
  CUTOFF_KEY: 'cutoff_day_v1',

  all() {
    try {
      return JSON.parse(localStorage.getItem(this.KEY)) || [];
    } catch {
      return [];
    }
  },

  // inst (taksit sayısı) eklendi (varsayılan: 1)
  add(name, amt, inst = 1) {
    const items = this.all();
    items.unshift({
      id: Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
      name,
      amt: Number(amt),
      inst: Number(inst),
      ts: Date.now()
    });
    localStorage.setItem(this.KEY, JSON.stringify(items));
  },

  remove(id) {
    const items = this.all().filter(i => i.id !== id);
    localStorage.setItem(this.KEY, JSON.stringify(items));
  },

  // Silinen kaydı geri koyar; yeni kayıtlar başta durduğu için ts'ye göre sıralar
  restore(item) {
    const items = this.all();
    if (items.some(i => i.id === item.id)) return;
    items.push(item);
    items.sort((a, b) => b.ts - a.ts);
    localStorage.setItem(this.KEY, JSON.stringify(items));
  },

  clear() {
    localStorage.removeItem(this.KEY);
  },

  getCutoff() {
    return Number(localStorage.getItem(this.CUTOFF_KEY)) || Config.DEFAULT_CUTOFF;
  },

  setCutoff(day) {
    localStorage.setItem(this.CUTOFF_KEY, day);
  }
};