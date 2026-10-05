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

let armed = false;
$('clear').onclick = () => {
  if (!armed) {
    armed = true;
    $('clear').textContent = 'Emin misin? Tekrar dokun';
    setTimeout(() => {
      armed = false;
      $('clear').textContent = 'Tümünü sil';
    }, 2500);
    return;
  }
  Store.clear();
  hideUndo();
  renderList();
  armed = false;
  $('clear').textContent = 'Tümünü sil';
};

renderAmount();
renderList();