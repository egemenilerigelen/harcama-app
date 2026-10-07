// AYARLAR: hesap kesim günü, dönem hedefi ve iki dokunuşla onaylanan "Tümünü sil"
// Veriyi kendisi değiştirmez; istekleri geri çağrılarla dışarı verir.
// Bağımlılık: Config, Format, Touch, $
class SettingsView {
  #clear = $('clear');
  #armed = false;
  #timer = null;

  // onCutoffStep(+1 / -1): kesim gününü değiştir, onEditGoal(): hedef panelini aç,
  // onClear(): tüm kayıtları sil
  constructor({ onCutoffStep, onEditGoal, onClear }) {
    Touch.bindPress($('cutMinus'), () => onCutoffStep(-1));
    Touch.bindPress($('cutPlus'), () => onCutoffStep(1));
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
    $('cutDay').textContent = day;
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
