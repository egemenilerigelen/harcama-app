// js/storage.js
const Store = (() => {
  const K = 'harcama:v1';
  const K_CUTOFF = 'harcama:cutoff_day';
  let items = [];
  try { items = JSON.parse(localStorage.getItem(K) || '[]'); } catch (e) {}
  const save = () => { try { localStorage.setItem(K, JSON.stringify(items)); } catch (e) {} };

  return {
    all: () => items,
    add(name, amt) { items.unshift({ id: Date.now(), name, amt, ts: Date.now() }); save(); },
    remove(id) { items = items.filter(i => i.id !== id); save(); },
    clear() { items = []; save(); },
    // Hesap kesim gününü alma ve kaydetme (varsayılan: 15)
    getCutoff: () => parseInt(localStorage.getItem(K_CUTOFF) || '15', 10),
    setCutoff: (day) => { localStorage.setItem(K_CUTOFF, day); }
  };
})();