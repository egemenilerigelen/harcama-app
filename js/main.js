// Cihaz destekliyorsa kısa titreşim verir
const haptic = () => {
  if (navigator.vibrate) navigator.vibrate(12);
};

// Basma ve kaldırma efektlerini anlık yöneten yardımcı fonksiyon
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

// Tuş takımını oluşturma ve olayları bağlama
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

// Silme (backspace) butonuna basma efekti bağlama
bindPressEffect($('back'), () => {
  Calc.back();
  renderAmount();
});

function addEntry() {
  const v = Calc.value();
  if (v <= 0) return;
  Store.add($('name').value.trim() || 'Adsız', v);
  Calc.reset();
  $('name').value = '';
  renderAmount();
  renderList();
}

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
  renderList();
  armed = false;
  $('clear').textContent = 'Tümünü sil';
};

renderAmount();
renderList();