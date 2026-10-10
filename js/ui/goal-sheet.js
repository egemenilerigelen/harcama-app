// HEDEF PANELİ: dönem hedefini girer, değiştirir ya da kaldırır; geçmiş ekstrelerden öneri gösterir.
// Nereye kaydedileceğini bilmez; sonucu onSave(tutar) ile dışarı verir (0 = hedef yok).
// Bağımlılık: BottomSheet, Config, Format, $
class GoalSheet extends BottomSheet {
  #input = $('goalInput');
  #clear = $('goalClear');
  #suggest = $('goalSuggest');
  #suggested = 0;
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
    // Öneriyi kutuya yazar; klavye açık kalsın diye odak kutuda
    this.#suggest.onclick = () => {
      this.#setDigits(String(this.#suggested));
      this.#input.focus();
    };
    this.#clear.onclick = () => {
      this.close();
      this.#onSave(0);
    };
  }

  // Dokunma olayının içinden çağrılmalı ki iPhone klavyeyi açsın.
  // suggestion: Domain.goalSuggestion ({ count, amount }) ya da null; mevcut hedefle aynıysa gösterilmez
  open(goal, suggestion) {
    this.#setDigits(goal ? String(Math.round(goal)) : '');
    this.#clear.hidden = !goal;
    this.#suggested = suggestion && suggestion.amount !== goal ? suggestion.amount : 0;
    this.#suggest.hidden = !this.#suggested;
    if (this.#suggested) $('goalSuggestText').textContent = Format.goalSuggestion(suggestion);
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
