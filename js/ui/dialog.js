// ORTADA AÇILAN EKRAN (temel sınıf): arka plan kararır, kart ortada hafif büyüyerek belirir.
// İçindeki [data-close] öğeleri (Kapat, arka plan) kapatır; kapanırken kart küçülerek solar.
// Ekstre özeti ve silmeden önce yedek sorusu bundan türer.
// Bağımlılık: Config
class CenterDialog {
  #root;
  #timer = null;

  constructor(root) {
    this.#root = root;
    root.querySelectorAll('[data-close]').forEach(n => n.addEventListener('click', () => this.close()));
  }

  open() {
    clearTimeout(this.#timer);
    this.#root.classList.remove('closing');
    this.#root.classList.add('open');
  }

  close() {
    if (!this.#root.classList.contains('open') || this.#root.classList.contains('closing')) return;
    this.#root.classList.add('closing');
    this.#timer = setTimeout(() => this.#root.classList.remove('open', 'closing'), Config.DIALOG_CLOSE_MS);
  }
}
