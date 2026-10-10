// AYARLAR: ana ekrana ekleme yönergesi, hesap kesim günü, dönem hedefi, yedekleme / geri yükleme / CSV
// ve iki dokunuşla onaylanan "Tümünü sil".
// Veriyi kendisi değiştirmez; istekleri geri çağrılarla dışarı verir.
// Bağımlılık: Config, Format, Touch, $
class SettingsView {
  #clear = $('clear');
  #status = $('dataStatus');
  #armed = false;
  #timer = null;
  #statusTimer = null;

  // onEditCutoff / onEditGoal: panelleri aç, onBackup: yedek al, onImport: yedekten geri yükle,
  // onExportCsv: CSV ver, onClear: tüm kayıtları sil
  constructor({ onEditCutoff, onEditGoal, onBackup, onImport, onExportCsv, onClear }) {
    $('cutRow').onclick = onEditCutoff;
    $('goalRow').onclick = onEditGoal; // click: iPhone klavyesi açılabilsin
    // click: paylaşım menüsü ve dosya seçici ancak dokunuşun içinden açılır
    $('backupRow').onclick = onBackup;
    $('importRow').onclick = onImport;
    $('csvRow').onclick = onExportCsv;
    $('appVersion').textContent = 'Sürüm ' + Config.VERSION;

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

  // Son yedek; due: hatırlatma zamanı geldi (uyarı rengi)
  showBackup(ts, now, due) {
    const age = $('backupAge');
    age.textContent = Format.backupAge(ts, now);
    age.classList.toggle('warn', due);
  }

  // Ana ekrana ekleme yönergesi: uygulama zaten ana ekrandan açıldıysa gizli
  showInstall(visible) {
    $('installSec').hidden = !visible;
  }

  // Veri işlemlerinin sonucu kartın altında birkaç saniye görünür
  flash(text, isError = false) {
    this.#status.textContent = text;
    this.#status.classList.toggle('err', isError);
    clearTimeout(this.#statusTimer);
    this.#statusTimer = setTimeout(() => { this.#status.textContent = ''; }, Config.STATUS_MS);
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
