// CİHAZ: dosya paylaşma / seçme.
// Tarayıcı yeteneklerine tek kapı; desteklenmeyen yerde (file://, eski tarayıcı) sessizce geri çekilir.
// Bağımlılık: yok
const Device = Object.freeze({
  // Dosyayı verir: dokunmatik cihazda paylaşım menüsü (iPhone: Dosyalar'a kaydet, iCloud, mesaj),
  // bilgisayarda indirme. Kullanıcı paylaşımdan vazgeçerse false. Dokunma olayının içinden çağrılmalı.
  async saveFile(name, type, text) {
    const file = new File([text], name, { type });
    const touch = window.matchMedia('(pointer: coarse)').matches;
    if (touch && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file] });
        return true;
      } catch (e) {
        if (e.name === 'AbortError') return false; // vazgeçti
        // Paylaşım açılamadıysa indirmeye düş
      }
    }
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
  },

  // Dosya seçtirir, içeriğini metin olarak verir (vazgeçilirse söz hiç dönmeyebilir).
  // Dokunma olayının içinden çağrılmalı.
  pickFile(accept) {
    return new Promise(resolve => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = accept;
      input.onchange = () => {
        const file = input.files[0];
        if (!file) return resolve(null);
        file.text().then(resolve, () => resolve(null));
      };
      input.click();
    });
  }
});
