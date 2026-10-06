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

// Silme geri alma şeridi (4 sn görünür)
let undoItem = null;
let undoTimer = null;

function hideUndo() {
  clearTimeout(undoTimer);
  undoItem = null;
  $('undo').classList.remove('show');
}

function showUndo(item) {
  undoItem = item;
  $('undo').classList.add('show');
  clearTimeout(undoTimer);
  undoTimer = setTimeout(hideUndo, 4000);
}

// Ekranda binlik ayracı (.) ve ondalık virgül (,) ile göster; ham değer Calc'ta kalır
function formatRaw(raw) {
  if (!raw) return '';
  const [i, d] = raw.split('.');
  const grouped = i.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return raw.includes('.') ? grouped + ',' + (d || '') : grouped;
}

function renderAmount() {
  const text = formatRaw(Calc.raw());
  const el = $('amt');
  el.textContent = text;
  el.classList.toggle('sm', text.length > 9 && text.length <= 12);
  el.classList.toggle('xs', text.length > 12);
  document.body.classList.toggle('has-amt', Calc.value() > 0);
}

const hm = ts => new Date(ts).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
const shortDate = ts => new Date(ts).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });

// Kısa zaman etiketi: bugünse saat, dünse "Dün", değilse "5 Eki"
function shortWhen(ts) {
  const k = dk(ts);
  if (k === dk(Date.now())) return hm(ts);
  if (k === dk(Date.now() - 864e5)) return 'Dün';
  return shortDate(ts);
}

// Harcamalar sekmesi filtresi: 'period' (bu dönem), 'prev' (geçen dönem), 'all'
let listFilter = 'period';
let listQuery = '';

// Taksitli kayıtları sanal taksit satırlarına açar (gelecek taksitler dahil)
function expandItems(cutoffDay) {
  const rawItems = Store.all();
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

  return processedItems;
}

// Tek harcama satırı; ana sayfa ve Harcamalar sekmesi aynı satırı kullanır
function buildRow(i, when) {
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
  t.textContent = when;

  const a = document.createElement('span');
  a.className = 'a';
  a.textContent = fmt(i.displayAmt);

  const x = document.createElement('button');
  x.className = 'x';
  x.textContent = '✕';
  x.setAttribute('aria-label', 'Sil');
  x.onclick = () => {
    const id = i.rawId || i.id;
    const removed = Store.all().find(e => e.id === id);
    Store.remove(id);
    if (removed) showUndo(removed);
    renderList();
  };

  r.append(info, t, a, x);
  return r;
}

// Son harcamalar: sadece tam sığan satırları göster (en az 1); ekran boyuna göre 3 / 2 / 1
function fitRecent() {
  const R = $('recent');
  if (!R.clientHeight) return; // ana sayfa gizliyken ölçülemez
  const rows = R.querySelectorAll('.row');
  rows.forEach(r => (r.style.display = ''));
  for (let k = rows.length - 1; k > 0 && R.scrollHeight > R.clientHeight; k--) {
    rows[k].style.display = 'none';
  }
}

function renderList() {
  const cutoffDay = Store.getCutoff();
  const periodStart = getPeriodStartDate(cutoffDay);
  const periodStartTs = periodStart.getTime();
  const prevStartTs = new Date(periodStart.getFullYear(), periodStart.getMonth() - 1, cutoffDay).getTime();
  const nextStartTs = new Date(periodStart.getFullYear(), periodStart.getMonth() + 1, cutoffDay).getTime();

  // Henüz gelmemiş (gelecek aylara ait) taksitleri gizle, yeniden eskiye sırala
  const nowTs = Date.now();
  const visibleItems = expandItems(cutoffDay)
    .filter(i => i.ts <= nowTs)
    .sort((a, b) => b.ts - a.ts);

  const sum = list => list.reduce((s, i) => s + i.displayAmt, 0);

  // BUGÜN Toplamı
  const today = dk(nowTs);
  $('sToday').textContent = fmt(sum(visibleItems.filter(i => dk(i.ts) === today)));

  // BU AY (Mevcut Hesap Dönemi) Toplamı
  $('sMonth').textContent = fmt(sum(visibleItems.filter(i => i.ts >= periodStartTs)));

  // ANA SAYFA: son 3 harcama
  const R = $('recent');
  R.innerHTML = '';
  if (!visibleItems.length) {
    R.innerHTML = '<div class="empty">Henüz harcama yok</div>';
  } else {
    const box = document.createElement('div');
    box.className = 'day';
    visibleItems.slice(0, 3).forEach(i => box.appendChild(buildRow(i, shortWhen(i.ts))));
    R.appendChild(box);
  }
  fitRecent();

  // HARCAMALAR: dönem filtresi ve arama
  let items = visibleItems;
  let range = 'Tüm zamanlar';
  if (listFilter === 'period') {
    items = items.filter(i => i.ts >= periodStartTs);
    range = shortDate(periodStartTs) + ' – ' + shortDate(nextStartTs - 864e5);
  } else if (listFilter === 'prev') {
    items = items.filter(i => i.ts >= prevStartTs && i.ts < periodStartTs);
    range = shortDate(prevStartTs) + ' – ' + shortDate(periodStartTs - 864e5);
  }

  const q = listQuery.trim().toLocaleLowerCase('tr-TR');
  if (q) items = items.filter(i => (i.name || '').toLocaleLowerCase('tr-TR').includes(q));

  $('listRange').textContent = range;
  $('listSum').textContent = items.length ? items.length + ' harcama · ' + fmt(sum(items)) : '';

  // Tarihe göre gruplama (sıralı listeden geldiği için gün sırası korunur)
  const g = {};
  items.forEach(i => (g[dk(i.ts)] = g[dk(i.ts)] || []).push(i));

  const L = $('list');
  L.innerHTML = '';
  const days = Object.keys(g);

  if (!days.length) {
    const msg = q ? 'Sonuç yok' : listFilter === 'all' ? 'Henüz harcama yok' : 'Bu dönemde harcama yok';
    const e = document.createElement('div');
    e.className = 'empty';
    e.textContent = msg;
    L.appendChild(e);
    return;
  }

  days.forEach(k => {
    const h = document.createElement('h2');
    h.innerHTML = '<span>' + dayLabel(k) + '</span><span>' + fmt(sum(g[k])) + '</span>';
    L.appendChild(h);

    const box = document.createElement('div');
    box.className = 'day';
    g[k].forEach(i => box.appendChild(buildRow(i, hm(i.ts))));
    L.appendChild(box);
  });
}