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

// Kısa tarih etiketi: "Bugün", "Dün" ya da "5 Eki"
function shortWhen(ts) {
  const k = dk(ts);
  if (k === dk(Date.now())) return 'Bugün';
  if (k === dk(Date.now() - 864e5)) return 'Dün';
  return shortDate(ts);
}

// Dönem aralığı etiketi; başka yıldaysa yıl da yazılır
function rangeLabel(a, b) {
  const y = new Date(b).getFullYear();
  return shortDate(a) + ' – ' + shortDate(b) + (y !== new Date().getFullYear() ? ' ' + y : '');
}

// Harcamalar sekmesi: dönem gezgini (0 = bu dönem, -1 = geçen dönem ...) ve arama
let listPeriod = 0;
let searchOpen = false;
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
          tag: `${m + 1}/${instCount} taksit`
        });
      }
    }
  });

  return processedItems;
}

// Sola kaydırarak silme: eşiği geçerse kayıt silinir (geri alma şeridi açılır)
function bindSwipe(s, r, onDelete) {
  let x0 = null, y0 = 0, dx = 0, axis = null;

  r.addEventListener('pointerdown', e => {
    x0 = e.clientX; y0 = e.clientY; dx = 0; axis = null;
    s.swiped = false;
  });

  r.addEventListener('pointermove', e => {
    if (x0 === null) return;
    const mx = e.clientX - x0, my = e.clientY - y0;
    // Önce yönü belirle: dikeyse listenin kaymasına karışma
    if (!axis && Math.abs(mx) + Math.abs(my) > 8) {
      axis = Math.abs(mx) > Math.abs(my) ? 'x' : 'y';
      if (axis === 'x') {
        r.setPointerCapture(e.pointerId);
        r.style.transition = 'none';
        s.classList.add('on');
      }
    }
    if (axis !== 'x') return;
    dx = Math.min(0, mx);
    r.style.transform = 'translateX(' + dx + 'px)';
  });

  const end = () => {
    if (x0 === null) return;
    x0 = null;
    if (axis !== 'x') return;
    s.swiped = true; // ardından gelen tıklama detayı açmasın
    r.style.transition = '';
    if (dx < -Math.min(90, r.offsetWidth * 0.3)) {
      r.style.transform = 'translateX(-100%)';
      haptic();
      setTimeout(onDelete, 160);
    } else {
      r.style.transform = '';
      setTimeout(() => s.classList.remove('on'), 200);
    }
  };

  r.addEventListener('pointerup', end);
  r.addEventListener('pointercancel', end);
}

// Tek harcama satırı; ana sayfa ve Harcamalar sekmesi aynı satırı kullanır
function buildRow(i, when) {
  const s = document.createElement('div');
  s.className = 'swipe';

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

  // Dokununca detay; sola kaydırınca silme
  r.onclick = () => {
    if (!s.swiped) openDetail(i.rawId || i.id);
  };

  r.append(t, info, a); // saat/tarih solda, ekstre gibi
  s.appendChild(r);
  bindSwipe(s, r, () => deleteEntry(i.rawId || i.id));
  return s;
}

// Kaydı siler (taksitliyse asıl kaydı), geri alma şeridini açar
function deleteEntry(id) {
  const removed = Store.all().find(e => e.id === id);
  Store.remove(id);
  if (removed) showUndo(removed);
  renderList();
}

// KAYIT DETAYI: alttan açılan panel
function openDetail(id) {
  const e = Store.all().find(x => x.id === id);
  if (!e) return;
  const inst = Math.max(1, Number(e.inst) || 1);
  const amt = Number(e.amt) || 0;

  $('dName').textContent = e.name;
  $('dAmt').textContent = fmt(amt);
  $('dDate').textContent = new Date(e.ts).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'short' }) + ', ' + hm(e.ts);
  $('dPay').textContent = inst === 1 ? 'Tek çekim' : inst + ' taksit × ' + fmt(amt / inst);

  // Kalan taksit: henüz gelmemiş sanal taksit satırları
  const rest = expandItems(Store.getCutoff()).filter(x => x.rawId === id && x.ts > Date.now()).length;
  $('dRestRow').style.display = inst === 1 ? 'none' : '';
  $('dRest').textContent = rest ? rest + ' taksit · ' + fmt(rest * amt / inst) : 'Tamamlandı';

  $('dDel').onclick = () => {
    closeDetail();
    deleteEntry(id);
  };
  $('sheet').classList.add('open');
}

function closeDetail() {
  $('sheet').classList.remove('open');
}

// Son harcamalar: sadece tam sığan satırları göster (en az 1); ekran boyuna göre 3 / 2 / 1
function fitRecent() {
  const R = $('recent');
  if (!R.clientHeight) return; // ana sayfa gizliyken ölçülemez
  const rows = R.querySelectorAll('.swipe');
  rows.forEach(r => (r.style.display = ''));
  for (let k = rows.length - 1; k > 0 && R.scrollHeight > R.clientHeight; k--) {
    rows[k].style.display = 'none';
  }
}

function renderList() {
  const cutoffDay = Store.getCutoff();
  const periodStart = getPeriodStartDate(cutoffDay);
  const periodStartTs = periodStart.getTime();
  const nextStartTs = new Date(periodStart.getFullYear(), periodStart.getMonth() + 1, cutoffDay).getTime();
  const periodRange = shortDate(periodStartTs) + ' – ' + shortDate(nextStartTs - 864e5);

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
  $('sPeriod').textContent = '· ' + periodRange;

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

  // HARCAMALAR: arama açıksa tüm dönemlerde arar, değilse seçili dönemi gösterir
  let items, emptyMsg;
  if (searchOpen) {
    const q = listQuery.trim().toLocaleLowerCase('tr-TR');
    items = q ? visibleItems.filter(i => (i.name || '').toLocaleLowerCase('tr-TR').includes(q)) : visibleItems;
    $('searchSum').textContent = items.length ? items.length + (q ? ' sonuç · ' : ' harcama · ') + fmt(sum(items)) : '';
    emptyMsg = q ? 'Sonuç yok' : 'Henüz harcama yok';
  } else {
    const ps = new Date(periodStart.getFullYear(), periodStart.getMonth() + listPeriod, cutoffDay).getTime();
    const pe = new Date(periodStart.getFullYear(), periodStart.getMonth() + listPeriod + 1, cutoffDay).getTime();
    items = visibleItems.filter(i => i.ts >= ps && i.ts < pe);
    const total = sum(items);

    // Günlük ortalama: bu dönemde geçen gün sayısına, geçmiş dönemde dönemin tamamına göre
    const dayCount = listPeriod === 0 ? Math.floor((nowTs - ps) / 864e5) + 1 : Math.round((pe - ps) / 864e5);

    $('perName').textContent = listPeriod === 0 ? 'Bu dönem' : listPeriod === -1 ? 'Geçen dönem' : -listPeriod + ' dönem önce';
    $('listRange').textContent = rangeLabel(ps, pe - 864e5);
    $('perTotal').textContent = fmt(total);
    $('listSum').textContent = items.length ? 'Günlük ort. ' + fmt(Math.round(total / dayCount)) : 'Harcama yok';

    // En eski kaydın dönemine kadar geri, bu döneme kadar ileri gidilebilir
    const oldest = visibleItems.length ? visibleItems[visibleItems.length - 1].ts : nowTs;
    $('perPrev').disabled = ps <= oldest;
    $('perNext').disabled = listPeriod >= 0;
    emptyMsg = 'Bu dönemde harcama yok';
  }

  // Tarihe göre gruplama (sıralı listeden geldiği için gün sırası korunur)
  const g = {};
  items.forEach(i => (g[dk(i.ts)] = g[dk(i.ts)] || []).push(i));

  const L = $('list');
  L.innerHTML = '';
  const days = Object.keys(g);

  if (!days.length) {
    const e = document.createElement('div');
    e.className = 'empty';
    e.textContent = emptyMsg;
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