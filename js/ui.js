// Çizim fonksiyonları.
const $ = id => document.getElementById(id);
const fmt = n => '₺' + n.toLocaleString('en-US', { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 });
const dk = t => { const d = new Date(t); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };

function dayLabel(k) {
  if (k === dk(Date.now())) return 'Bugün';
  if (k === dk(Date.now() - 864e5)) return 'Dün';
  const [Y, M, D] = k.split('-');
  return new Date(Y, M - 1, D).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'short' });
}

function renderAmount() { $('amt').textContent = Calc.raw() || '0'; }

function renderList() {
  const items = Store.all(), g = {};
  items.forEach(i => (g[dk(i.ts)] = g[dk(i.ts)] || []).push(i));
  const today = dk(Date.now()), month = today.slice(0, 7);
  $('sToday').textContent = fmt((g[today] || []).reduce((s, i) => s + i.amt, 0));
  $('sMonth').textContent = fmt(items.filter(i => dk(i.ts).startsWith(month)).reduce((s, i) => s + i.amt, 0));

  const L = $('list'); L.innerHTML = '';
  const days = Object.keys(g).sort().reverse();
  if (!days.length) { L.innerHTML = '<div class="empty">Henüz harcama yok</div>'; return; }
  days.forEach(k => {
    const h = document.createElement('h2');
    h.innerHTML = '<span>' + dayLabel(k) + '</span><span>' + fmt(g[k].reduce((s, i) => s + i.amt, 0)) + '</span>';
    L.appendChild(h);
    const box = document.createElement('div'); box.className = 'day';
    g[k].forEach(i => {
      const r = document.createElement('div'); r.className = 'row';
      const n = document.createElement('span'); n.className = 'n'; n.textContent = i.name;
      const t = document.createElement('span'); t.className = 't';
      t.textContent = new Date(i.ts).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
      const a = document.createElement('span'); a.className = 'a'; a.textContent = fmt(i.amt);
      const x = document.createElement('button'); x.className = 'x'; x.textContent = '✕';
      x.onclick = () => { Store.remove(i.id); renderList(); };
      r.append(n, t, a, x); box.appendChild(r);
    });
    L.appendChild(box);
  });
}
