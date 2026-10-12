// Tutar girişi: sadece rakam ve nokta. Max 9 hane, 2 ondalık.
// Durumu örnekte tutar; sahibi giriş paneli (EntryPanel).
class Calc {
  #v = '';

  press(k) {
    const v = this.#v;
    if (k === '.') { if (!v.includes('.')) this.#v = v === '' ? '0.' : v + '.'; return; }
    if (v === '0') { this.#v = k; return; }
    const dec = v.split('.')[1];
    if (dec !== undefined && dec.length >= 2) return;
    if (v.replace('.', '').length >= 9) return;
    this.#v = v + k;
  }

  back() { this.#v = this.#v.slice(0, -1); }
  reset() { this.#v = ''; }
  raw() { return this.#v; }
  value() { return parseFloat(this.#v) || 0; }
}
