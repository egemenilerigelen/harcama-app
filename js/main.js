// Olay bağlama.
['1','2','3','4','5','6','7','8','9','.','0','EKLE'].forEach(k => {
  const b = document.createElement('button');
  b.textContent = k;
  if (k === 'EKLE') { b.className = 'add'; b.onclick = addEntry; }
  else b.onclick = () => { Calc.press(k); renderAmount(); };
  $('pad').appendChild(b);
});
$('back').onclick = () => { Calc.back(); renderAmount(); };

function addEntry() {
  const v = Calc.value();
  if (v <= 0) return;
  Store.add($('name').value.trim() || 'Adsız', v);
  Calc.reset(); $('name').value = '';
  renderAmount(); renderList();
}

$('copy').onclick = async () => {
  const txt = Store.all().map(i => dk(i.ts) + '\t' + i.name + '\t' + i.amt).join('\n');
  try { await navigator.clipboard.writeText(txt); $('copy').textContent = 'Kopyalandı ✓'; }
  catch (e) { $('copy').textContent = 'Kopyalanamadı'; }
  setTimeout(() => $('copy').textContent = 'Verileri kopyala', 1500);
};

let armed = false;
$('clear').onclick = () => {
  if (!armed) { armed = true; $('clear').textContent = 'Emin misin? Tekrar dokun';
    setTimeout(() => { armed = false; $('clear').textContent = 'Tümünü sil'; }, 2500); return; }
  Store.clear(); renderList(); armed = false; $('clear').textContent = 'Tümünü sil';
};

renderAmount(); renderList();
