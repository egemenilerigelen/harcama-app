// Çizim fonksiyonları.
const $ = id => document.getElementById(id);
const fmt = n => '₺' + n.toLocaleString('tr-TR', { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 });
const dk = t => { 
  const d = new Date(t); 
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); 
};

function dayLabel(k) {
  const [Y, M, D] = k.split('-');
  const dateObj = new Date(Y, M - 1, D);
  
  const formattedDate = dateObj.toLocaleDateString('tr-TR', { 
    day: 'numeric', 
    month: 'long', 
    weekday: 'short' 
  });

  const todayStr = dk(Date.now());
  const yesterdayStr = dk(Date.now() - 864e5);

  if (k === todayStr) return 'Bugün, ' + formattedDate;
  if (k === yesterdayStr) return 'Dün, ' + formattedDate;
  
  return formattedDate;
}

// Hesap kesim gününe göre mevcut dönemin başlangıç tarihini döndürür
function getPeriodStartDate(cutoffDay) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const date = now.getDate();

  if (date >= cutoffDay) {
    return new Date(year, month, cutoffDay, 0, 0, 0, 0);
  } else {
    return new Date(year, month - 1, cutoffDay, 0, 0, 0, 0);
  }
}

function renderAmount() { 
  $('amt').textContent = Calc.raw(); 
}

function renderList() {
  const items = Store.all(), g = {};
  items.forEach(i => (g[dk(i.ts)] = g[dk(i.ts)] || []).push(i));

  const today = dk(Date.now());
  const cutoffDay = Store.getCutoff();
  const periodStartTs = getPeriodStartDate(cutoffDay).getTime();

  // BUGÜN Toplamı
  $('sToday').textContent = fmt((g[today] || []).reduce((s, i) => s + i.amt, 0));

  // MEVCUT DÖNEM Toplamı (Hesap kesim tarihine göre)
  const periodTotal = items
    .filter(i => i.ts >= periodStartTs)
    .reduce((s, i) => s + i.amt, 0);

  $('sMonth').textContent = fmt(periodTotal);

  const L = $('list'); L.innerHTML = '';
  const days = Object.keys(g).sort().reverse();

  if (!days.length) { 
    L.innerHTML = '<div class="empty">Henüz harcama yok</div>'; 
    return; 
  }

  days.forEach(k => {
    const dayTotal = g[k].reduce((s, i) => s + i.amt, 0);
    const h = document.createElement('h2');
    h.innerHTML = '<span>' + dayLabel(k) + '</span><span>' + fmt(dayTotal) + '</span>';
    L.appendChild(h);

    const box = document.createElement('div'); 
    box.className = 'day';

    g[k].forEach(i => {
      const r = document.createElement('div'); r.className = 'row';
      const n = document.createElement('span'); n.className = 'n'; n.textContent = i.name;
      const t = document.createElement('span'); t.className = 't';
      t.textContent = new Date(i.ts).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
      const a = document.createElement('span'); a.className = 'a'; a.textContent = fmt(i.amt);
      const x = document.createElement('button'); x.className = 'x'; x.textContent = '✕';
      x.onclick = () => { Store.remove(i.id); renderList(); };
      r.append(n, t, a, x); 
      box.appendChild(r);
    });
    L.appendChild(box);
  });
}