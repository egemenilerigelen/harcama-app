// Veri katmanı: localStorage. Kayıt formatı: {id, name, amt, ts}
const Store = (() => {
  const K = 'harcama:v1';
  let items = [];
  try { items = JSON.parse(localStorage.getItem(K) || '[]'); } catch (e) {}
  const save = () => { try { localStorage.setItem(K, JSON.stringify(items)); } catch (e) {} };
  return {
    all: () => items,
    add(name, amt) { items.unshift({ id: Date.now(), name, amt, ts: Date.now() }); save(); },
    remove(id) { items = items.filter(i => i.id !== id); save(); },
    clear() { items = []; save(); }
  };
})();
