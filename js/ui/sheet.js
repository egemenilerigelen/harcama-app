// ALTTAN AÇILAN PANEL (temel sınıf): açma/kapama; içindeki [data-close] öğeleri paneli kapatır.
// Detay ve hedef panelleri bundan türer.
class BottomSheet {
  #root;

  constructor(root) {
    this.#root = root;
    root.querySelectorAll('[data-close]').forEach(n => n.addEventListener('click', () => this.close()));
  }

  open() {
    this.#root.classList.add('open');
  }

  close() {
    this.#root.classList.remove('open');
  }
}
