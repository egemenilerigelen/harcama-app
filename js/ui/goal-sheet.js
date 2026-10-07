// HEDEF PANELİ: dönem hedefini girer, değiştirir ya da kaldırır.
// Nereye kaydedileceğini bilmez; sonucu onSave(tutar) ile dışarı verir (0 = hedef yok).
// Bağımlılık: BottomSheet, Config, Format, $
class GoalSheet extends BottomSheet {
  #input = $('goalInput');
  #clear = $('goalClear');
  #digits = '';
  #onSave;

  constructor({ onSave }) {
    super($('goalSheet'));
    this.#onSave = onSave;

    // Sadece rakam; yazarken binlik ayraçla gösterilir
    this.#input.addEventListener('input', () => this.#setDigits(this.#input.value.replace(/\D/g, '')));
    this.#input.addEventListener('keydown', e => {
      if (e.key === 'Enter') this.#save();
    });
    $('goalSave').onclick = () => this.#save();
    this.#clear.onclick = () => {
      this.close();
      this.#onSave(0);
    };
  }

  // Dokunma olayının içinden çağrılmalı ki iPhone klavyeyi açsın
  open(goal) {
    this.#setDigits(goal ? String(Math.round(goal)) : '');
    this.#clear.hidden = !goal;
    super.open();
    this.#input.focus();
  }

  close() {
    this.#input.blur();
    super.close();
  }

  #setDigits(digits) {
    this.#digits = digits.replace(/^0+/, '').slice(0, Config.GOAL_MAX_DIGITS);
    this.#input.value = Format.amountInput(this.#digits);
  }

  #save() {
    const amount = Number(this.#digits);
    if (!amount) return;
    this.close();
    this.#onSave(amount);
  }
}
