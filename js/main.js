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

// TAKSİT SEÇİMİ YÖNETİMİ
let selectedInst = 1;
document.querySelectorAll('.inst-btn').forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll('.inst-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedInst = Number(btn.dataset.inst);
    haptic();
  };
});

// Tuş takımını oluşturma
['1','2','3','4','5','6','7','8','9','.','0','EKLE'].forEach(k => {
  const b = document.createElement('button');
  b.textContent = k;
  
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
  
  // Taksiti tekrar Tek Çekim'e sıfırla
  selectedInst = 1;
  document.querySelectorAll('.inst-btn').forEach(b => b.classList.remove('active'));
  document.querySelector('.inst-btn[data-inst="1"]').classList.add('active');

  renderAmount();
  renderList();
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
}

document.querySelectorAll('.tab').forEach(t => {
  bindPressEffect(t, () => showTab(t.dataset.tab));
});

bindPressEffect($('seeAll'), () => showTab('list'));

// HARCAMALAR: dönem filtresi ve arama
document.querySelectorAll('#listFilter button').forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll('#listFilter button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    listFilter = btn.dataset.f;
    haptic();
    renderList();
  };
});

$('search').oninput = () => {
  listQuery = $('search').value;
  renderList();
};

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