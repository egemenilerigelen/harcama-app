# Harcama — proje notları

Mobil öncelikli, tek sayfalık kredi kartı harcama takip uygulaması. Framework, derleme adımı ve dış JS bağımlılığı yok. Çalıştırmak için `index.html` tarayıcıda açılır (`file://` ile de çalışır).

## Dosya yapısı

```
index.html       iskelet + script sırası
css/style.css    tüm tasarım; renk ve font değişkenleri :root'ta
js/storage.js    Store: localStorage katmanı
js/calc.js       Calc: tutar girişi (tuş takımı mantığı)
js/ui.js         yardımcılar (fmt, dk, dayLabel), renderAmount, renderList
js/main.js       tuş takımı, taksit seçimi, EKLE, tümünü sil, açılış render'ı
```

## Mimari kurallar

- **Modül sistemi yok.** Dosyalar global değişken kullanır (`Store`, `Calc`, `$`, `fmt`, `renderList` ...). Script sırası önemlidir: `storage → calc → ui → main`. `import/export` veya `type="module"` ekleme; `file://` ile çalışmayı bozar.
- **Veri katmanı soyut.** Veriye sadece `Store.all/add/remove/clear/getCutoff/setCutoff` üzerinden eriş. `localStorage`'ı başka dosyadan doğrudan çağırma.
- **Render tek yönlü.** Durum değişince `renderList()` çağrılır, liste DOM'u baştan kurulur. Kullanıcı metnini `textContent` ile yaz; `innerHTML`'e kullanıcı girdisi koyma.

## Veri modeli

`localStorage['expenses_v1']` altında JSON dizisi (yeni kayıt başa eklenir):

```ts
{ id: string, name: string, amt: number, inst?: number, ts: number }
```

- `id`: Base36 zaman damgası + rastgele 3 karakter
- `amt`: toplam tutar (taksitliyse tamamı)
- `inst`: taksit sayısı, yoksa 1 sayılır (eski kayıtlarla uyum için)
- `ts`: epoch ms

Ek anahtar: `cutoff_day_v1` — hesap kesim günü, varsayılan 15. Şu an arayüzden değiştirilemez, sadece `Store.setCutoff` ile.

Veri şemasını değiştirirsen eski kayıtları bozma. `ui.js` zaten eksik `inst` ve `amt` için varsayılan kullanıyor.

## Taksit mantığı (`renderList`)

- Taksitli kayıt (`inst > 1`) her render'da sanal kayıtlara açılır: tutar `amt / inst`, id `<id>_<n>`, `rawId` asıl kaydın id'si, etiket `💳 n/inst Taksit`.
- İlk taksit kaydın kendi tarihine, sonrakiler sonraki hesap kesim günlerine düşer.
- `ts > Date.now()` olan gelecek taksitler listeden gizlenir; toplamlara da girmez.
- Silme sanal satırdan yapılsa bile `Store.remove(i.rawId || i.id)` ile asıl kaydı siler.
- "BU AY" = içinde bulunulan hesap dönemi (kesim gününden itibaren), takvim ayı değil.

## Tuş takımı (`calc.js`)

Sadece rakam ve nokta kabul eder: en fazla 9 hane, 2 ondalık, tek nokta. Ham değer `Calc.raw()`, sayısal değer `Calc.value()`.

## Arayüz ve tasarım

- Koyu glassmorphism tema; arka plan `#07080c`, vurgu `--gold: #d9b877`, `--gold2: #a8843f`.
- Fontlar: `--num` (Orbitron) tuş takımı ve tutar ekranı; `--num-sub` (Space Grotesk / Inter) özet kartları ve liste. Google Fonts `index.html`'deki `<link>` ile yüklenir.
- Düzen sabit: `body { overflow: hidden }`; üst panel (`.fixed-top`) kayar, sadece `#list` (yükseklik 250px) kaydırılır. "Tümünü sil" (`.tools`) altta sabit durur. Bu düzeni bozacak değişiklik yapma.
- Dokunmatik: tuşlar `pointerdown` ile `bindPressEffect` üzerinden tetiklenir ve `navigator.vibrate(12)` ile titreşim verir. Yeni tuşlarda aynı yardımcıyı kullan.
- "Tümünü sil" iki dokunuşla onaylanır (2,5 sn içinde).
- Arayüz dili Türkçe; sayı biçimi `tr-TR`, para birimi ₺.

## Çalışma kuralları

- Değişikliği küçük ve mevcut koda benzer tut: aynı isimlendirme, aynı yorum yoğunluğu, Türkçe yorumlar.
- Derleme, paket yöneticisi veya test altyapısı yok. Doğrulama için tarayıcıda aç; mobil görünüm için dar viewport kullan.
- Commit mesajları Türkçe ve kısa (örn. `UI font güncellemeleri: ...`).
- Commit mesajlarına ve PR açıklamalarına `Co-Authored-By` veya benzeri atıf satırı ekleme.
- Commit ve push sadece kullanıcı isteyince yapılır. Ana dal `main`.
- README ve bu dosya kodla uyumlu kalmalı; mimari değişirse ikisini de güncelle.

## Bilinen sınırlar / fikirler

PWA dosyaları (manifest, service worker) henüz yok. Hesap kesim günü için arayüz yok. Kayıt düzenleme, kategoriler, limit takibi, CSV dışa aktarma ve çoklu kart planlanan fikirler.
