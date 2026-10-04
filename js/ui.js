const $ = id => document.getElementById(id);
const fmt = n => '₺' + n.toLocaleString('tr-TR', { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 });
const dk = t => { 
  const d = new Date(t); 
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); 
};

function dayLabel(k) {
  const [Y, M, D] = k.split('-');
  const dateObj = new Date(Y, M - 1, D);
  const formattedDate = dateObj.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'short' });
  const todayStr = dk(Date.now());
  const yesterdayStr = dk(Date.now() - 864e5);

  if (k === todayStr) return 'Bugün, ' + formattedDate;
  if (k === yesterdayStr) return 'Dün, ' + formattedDate;
  return formattedDate;
}

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
  const rawItems = Store.all();
  const cutoffDay = Store.getCutoff();
  const periodStart = getPeriodStartDate(cutoffDay);

  const processedItems = [];

  rawItems.forEach(item => {
    // Güvenlik Düzeltmesi: Eski verilerde `inst` veya `amt` alanı yoksa varsayılan değerleri tanımlıyoruz
    const instCount = Math.max(1, Number(item.inst) || 1);
    const totalAmount = Number(item.amt) || 0;
    const singleAmt = totalAmount / instCount;

    if (instCount === 1) {
      processedItems.push({
        ...item,
        amt: totalAmount,
        displayAmt: totalAmount,
        tag: ''
      });
    } else {
      const itemDate = new Date(item.ts);
      let firstPeriodStart = new Date(itemDate.getFullYear(), itemDate.getMonth(), cutoffDay);
      if (itemDate.getDate() < cutoffDay) {
        firstPeriodStart.setMonth(firstPeriodStart.getMonth() - 1);
      }

      for (let m = 0; m < instCount; m++) {
        const activePeriodStart = new Date(firstPeriodStart.getFullYear(), firstPeriodStart.getMonth() + m, cutoffDay);
        const instTs = (m === 0) ? item.ts : activePeriodStart.getTime();

        processedItems.push({
          id: item.id + '_' + m,
          rawId: item.id,
          name: item.name,
          amt: singleAmt,
          displayAmt: singleAmt,
          ts: instTs,
          tag: `💳 ${m + 1}/${instCount} Taksit`
        });
      }
    }
  });

  // Henüz gelmemiş (gelecek aylara ait) taksitleri ekrandan gizlemek için zaman damgası filtresi
  const nowTs = Date.now();
  const visibleItems = processedItems.filter(i => i.ts <= nowTs);

  // Tarihe göre gruplama
  const g = {};
  visibleItems.forEach(i => (g[dk(i.ts)] = g[dk(i.ts)] || []).push(i));

  const today = dk(Date.now());
  const periodStartTs = periodStart.getTime();

  // BUGÜN Toplamı
  $('sToday').textContent = fmt((g[today] || []).reduce((s, i) => s + i.displayAmt, 0));

  // BU AY (Mevcut Hesap Dönemi) Toplamı
  const periodTotal = visibleItems
    .filter(i => i.ts >= periodStartTs && i.ts < periodStartTs + (32 * 864e5))
    .reduce((s, i) => s + i.displayAmt, 0);

  $('sMonth').textContent = fmt(periodTotal);

  const L = $('list'); 
  L.innerHTML = '';
  const days = Object.keys(g).sort().reverse();

  if (!days.length) { 
    L.innerHTML = '<div class="empty">Henüz harcama yok</div>'; 
    return; 
  }

  days.forEach(k => {
    const dayTotal = g[k].reduce((s, i) => s + i.displayAmt, 0);
    const h = document.createElement('h2');
    h.innerHTML = '<span>' + dayLabel(k) + '</span><span>' + fmt(dayTotal) + '</span>';
    L.appendChild(h);

    const box = document.createElement('div'); 
    box.className = 'day';

    g[k].forEach(i => {
      const r = document.createElement('div'); 
      r.className = 'row';
      
      const info = document.createElement('div'); 
      info.className = 'row-info';
      
      const n = document.createElement('span'); 
      n.className = 'n'; 
      n.textContent = i.name;
      info.appendChild(n);

      if (i.tag) {
        const tag = document.createElement('span'); 
        tag.className = 'tag'; 
        tag.textContent = i.tag;
        info.appendChild(tag);
      }

      const t = document.createElement('span'); 
      t.className = 't';
      t.textContent = new Date(i.ts).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
      
      const a = document.createElement('span'); 
      a.className = 'a'; 
      a.textContent = fmt(i.displayAmt);
      
      const x = document.createElement('button'); 
      x.className = 'x'; 
      x.textContent = '✕';
      x.onclick = () => { 
        Store.remove(i.rawId || i.id); 
        renderList(); 
      };

      r.append(info, t, a, x); 
      box.appendChild(r);
    });
    L.appendChild(box);
  });
}