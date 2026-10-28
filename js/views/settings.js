// AYARLAR: ana ekrana ekleme yönergesi, titreşim, hesap kesim günü, dönem hedefi, yedekleme / geri yükleme / CSV,
// "Tümünü sil" (bugün yedek alınmadıysa önce yedek sorusu, yoksa iki dokunuşla onay) ve sürüm satırı (dokununca
// güncelleme denetlenir).
// Veriyi kendisi değiştirmez; istekleri geri çağrılarla dışarı verir.
// Bağımlılık: Config, Format, Touch, $
class SettingsView {
  #clear = $('clear');
  #status = $('dataStatus');
  #armed = false;
  #timer = null;
  #statusTimer = null;

  // onHaptics(açık): titreşim tercihi, onEditCutoff / onEditGoal: panelleri aç, onBackup: yedek al,
  // onImport: yedekten geri yükle, onExportCsv: CSV ver, onClear: tüm kayıtları sil,
  // onBeforeClear(): ilk dokunuşta sorulur, true dönerse App devraldı (yedek sorusu açıldı) ve iki dokunuşluk onay
  // atlanır, onCheckUpdate: sürüm satırına dokunuldu
  constructor({ onHaptics, onEditCutoff, onEditGoal, onBackup, onImport, onExportCsv, onClear, onBeforeClear, onCheckUpdate }) {
    $('hapticsToggle').onchange = e => onHaptics(e.target.checked);
    $('cutRow').onclick = onEditCutoff;
    $('goalRow').onclick = onEditGoal; // click: iPhone klavyesi açılabilsin
    // click: paylaşım menüsü ve dosya seçici ancak dokunuşun içinden açılır
    $('backupRow').onclick = onBackup;
    $('importRow').onclick = onImport;
    $('csvRow').onclick = onExportCsv;
    $('appVersion').onclick = onCheckUpdate;
    this.showUpdate(null);

    Touch.hapticOn(this.#clear);
    this.#clear.onclick = () => {
      if (!this.#armed) {
        if (!onBeforeClear()) this.#arm();
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
    $('installRow').hidden = !visible;
  }

  // Sürüm satırı: text yoksa "Sürüm … · Güncelle", denetim sırasında ve sonucunda o metin
  showUpdate(text) {
    $('appVersion').textContent = text || Format.versionLine(Config.VERSION);
  }

  showHaptics(on) {
    $('hapticsToggle').checked = on;
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
    this.#clear.firstChild.textContent = 'Emin misin?'; // ilk düğüm metin; sonrasında titreşim etiketi var
    this.#clear.classList.add('armed');
    clearTimeout(this.#timer);
    this.#timer = setTimeout(() => this.#disarm(), Config.CONFIRM_MS);
  }

  #disarm() {
    this.#armed = false;
    this.#clear.firstChild.textContent = 'Sil';
    this.#clear.classList.remove('armed');
  }
}
