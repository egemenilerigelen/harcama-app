// AYARLAR: hesap kesim günü, dönem hedefi ve iki dokunuşla onaylanan "Tümünü sil"
// Veriyi kendisi değiştirmez; istekleri geri çağrılarla dışarı verir.
// Bağımlılık: Config, Format, Touch, $
class SettingsView {
  #clear = $('clear');
  #armed = false;
  #timer = null;

  // onEditCutoff(): kesim günü panelini aç, onEditGoal(): hedef panelini aç, onClear(): tüm kayıtları sil
  constructor({ onEditCutoff, onEditGoal, onClear }) {
    $('cutRow').onclick = onEditCutoff;
    $('goalRow').onclick = onEditGoal; // click: iPhone klavyesi açılabilsin

    this.#clear.onclick = () => {
      if (!this.#armed) {
        this.#arm();
        return;
      }
      clearTimeout(this.#timer);
      onClear();
      this.#disarm();
    };
  }

  showCutoff(day) {
    $('cutDay').textContent = Format.cutoffDay(day);
  }

  showGoal(goal) {
    $('goalValue').textContent = goal ? Format.money(goal) : 'Yok';
  }

  // İlk dokunuş: onay ister, süre dolarsa vazgeçer
  #arm() {
    this.#armed = true;
    this.#clear.textContent = 'Emin misin?';
    this.#clear.classList.add('armed');
    Touch.haptic();
    clearTimeout(this.#timer);
    this.#timer = setTimeout(() => this.#disarm(), Config.CONFIRM_MS);
  }

  #disarm() {
    this.#armed = false;
    this.#clear.textContent = 'Sil';
    this.#clear.classList.remove('armed');
  }
}
