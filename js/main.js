const haptic = () => {
  if (navigator.vibrate) navigator.vibrate(12);
};

function bindPressEffect(btn, action) {
  const start = (e) => {
    e.preventDefault();
    btn.classList.add('pressed');
    haptic();
    action();
  };

  const end = () => {
    btn.classList.remove('pressed');
  };

  btn.addEventListener('pointerdown', start);
  btn.addEventListener('pointerup', end);
  btn.addEventListener('pointerleave', end);
  btn.addEventListener('pointercancel', end);
}

// TAKSİT SEÇİMİ: küçük düğme; dokununca seçenekler aynı satırda açılır, seçince kapanır
let selectedInst = 1;

function setInst(n) {
  selectedInst = n;
  document.querySelectorAll('.inst-btn').forEach(b => b.classList.toggle('active', Number(b.dataset.inst) === n));
  $('instLabel').textContent = n === 1 ? 'Tek çekim' : n + ' taksit';
  $('instChip').classList.toggle('set', n > 1);
  $('entry').classList.remove('picking');
}

bindPressEffect($('instChip'), () => $('entry').classList.add('picking'));

document.querySelectorAll('.inst-btn').forEach(btn => {
  btn.onclick = () => {
    setInst(Number(btn.dataset.inst));
    haptic();
  };
});

// Seçenekler açıkken başka yere dokunulursa kapat
document.addEventListener('pointerdown', e => {
  if (!e.target.closest('#entry')) $('entry').classList.remove('picking');
});

// Tuş takımını oluşturma
['1','2','3','4','5','6','7','8','9','.','0','EKLE'].forEach(k => {
  const b = document.createElement('button');
  b.textContent = k === 'EKLE' ? 'Ekle' : k;
  
  if (k === 'EKLE') {
    b.className = 'add';
    bindPressEffect(b, addEntry);
  } else {
    bindPressEffect(b, () => {
      Calc.press(k);
      renderAmount();
    });
  }
  
  $('pad').appendChild(b);
});

bindPressEffect($('back'), () => {
  Calc.back();
  renderAmount();
});

function addEntry() {
  const v = Calc.value();
  if (v <= 0) return;
  
  // Taksit sayısı parametresi eklendi
  Store.add($('name').value.trim() || 'Adsız', v, selectedInst);
  
  Calc.reset();
  $('name').value = '';
  
  // Taksiti tekrar tek çekime sıfırla
  setInst(1);

  renderAmount();
  renderList();

  // Yeni kaydı ana sayfadaki listede kısa bir hareketle göster
  const first = document.querySelector('#recent .row');
  if (first) first.classList.add('enter');
}

$('undoBtn').onclick = () => {
  if (undoItem) Store.restore(undoItem);
  hideUndo();
  renderList();
};

// ALT SEKME ÇUBUĞU
function showTab(name) {
  // Açık klavyeyi kapat (gizlenen sekmedeki inputta kalmasın)
  if (document.activeElement) document.activeElement.blur();
  document.querySelectorAll('.view').forEach(v => v.classList.toggle('active', v.dataset.view === name));
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === name));
  closeDetail();
  if (name === 'home') fitRecent();
}

window.addEventListener('resize', fitRecent);
// Fontlar yüklenince satır yükseklikleri değişebilir
if (document.fonts) document.fonts.ready.then(fitRecent);

document.querySelectorAll('.tab').forEach(t => {
  bindPressEffect(t, () => showTab(t.dataset.tab));
});

// "Tümünü gör": Harcamalar bu dönemden açılır
bindPressEffect($('seeAll'), () => {
  listPeriod = 0;
  renderList();
  showTab('list');
});

// HARCAMALAR: dönem gezgini
function stepPeriod(d) {
  listPeriod = Math.min(0, listPeriod + d);
  renderList();
  $('list').scrollTop = 0;
}

bindPressEffect($('perPrev'), () => { if (!$('perPrev').disabled) stepPeriod(-1); });
bindPressEffect($('perNext'), () => { if (!$('perNext').disabled) stepPeriod(1); });

// HARCAMALAR: arama (ikonla açılır, Vazgeç ile kapanır)
function setSearch(open) {
  searchOpen = open;
  listQuery = '';
  $('search').value = '';
  document.querySelector('[data-view="list"]').classList.toggle('searching', open);
  renderList();
  if (open) $('search').focus();
  else $('search').blur();
}

$('searchBtn').onclick = () => setSearch(!searchOpen);
$('searchCancel').onclick = () => setSearch(false);

$('search').oninput = () => {
  listQuery = $('search').value;
  renderList();
};

// KAYIT DETAYI: arka plana ya da Kapat'a dokununca kapanır
$('sheetBg').onclick = closeDetail;
$('dClose').onclick = closeDetail;

// AYARLAR: hesap kesim günü (1–28, her ayda bulunan günler)
function renderCutoff() {
  $('cutDay').textContent = Store.getCutoff();
}

function stepCutoff(d) {
  const day = Math.min(28, Math.max(1, Store.getCutoff() + d));
  Store.setCutoff(day);
  renderCutoff();
  renderList();
}

bindPressEffect($('cutMinus'), () => stepCutoff(-1));
bindPressEffect($('cutPlus'), () => stepCutoff(1));

let armed = false;
let armTimer = null;
const disarm = () => {
  armed = false;
  $('clear').textContent = 'Sil';
  $('clear').classList.remove('armed');
};

$('clear').onclick = () => {
  if (!armed) {
    armed = true;
    $('clear').textContent = 'Emin misin?';
    $('clear').classList.add('armed');
    haptic();
    clearTimeout(armTimer);
    armTimer = setTimeout(disarm, 2500);
    return;
  }
  clearTimeout(armTimer);
  Store.clear();
  hideUndo();
  renderList();
  disarm();
};

renderAmount();
renderCutoff();
renderList();