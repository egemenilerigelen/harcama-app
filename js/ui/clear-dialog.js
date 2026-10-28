// SİLMEDEN ÖNCE YEDEK: "Tümünü sil"e basılınca bugün yedek alınmadıysa ortada açılır. Üç yol: "Yedek al ve sil"
// (paylaşım menüsü açılır; kaydedilirse siler, vazgeçilirse bu ekranda kalır), "Yedeksiz sil", "Vazgeç".
// Veriyi bilmez: yedek ve silme geri çağrılarla App'te. Bu ekran onay yerine geçer (iki dokunuş yok).
// Bağımlılık: CenterDialog, Touch, $
class ClearDialog extends CenterDialog {
  #age = $('clearAge');
  #busy = false;

  // onBackup(): yedeği alır, kaydedildiyse true döner; onClear(yedekAlındı): kayıtları siler
  constructor({ onBackup, onClear }) {
    super($('clearAsk'));
    $('clearBackup').onclick = async () => {
      if (this.#busy) return;
      this.#busy = true;
      const saved = await onBackup();
      this.#busy = false;
      if (!saved) return;
      this.close();
      onClear(true);
    };
    $('clearSkip').onclick = () => {
      this.close();
      onClear(false);
    };
    Touch.hapticOn($('clearBackup'));
    Touch.hapticOn($('clearSkip'));
  }

  // count: neyin silineceği ("52 harcama · ₺48.320"), age: son yedek ("12 gün önce", "Hiç alınmadı")
  open(count, age) {
    $('clearCount').textContent = count;
    this.#age.textContent = age;
    super.open();
  }
}
