// Tutar girişi: sadece rakam ve nokta. Max 9 hane, 2 ondalık.
const Calc = (() => {
  let v = '';
  return {
    press(k) {
      if (k === '.') { if (v.includes('.')) return; v = v === '' ? '0.' : v + '.'; return; }
      if (v === '0') { v = k; return; }
      const dec = v.split('.')[1];
      if (dec !== undefined && dec.length >= 2) return;
      if (v.replace('.', '').length >= 9) return;
      v += k;
    },
    back() { v = v.slice(0, -1); },
    reset() { v = ''; },
    raw: () => v,
    value: () => parseFloat(v) || 0
  };
})();
