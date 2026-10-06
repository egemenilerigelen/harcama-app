# Harcama — proje notları

Mobil öncelikli, tek sayfalık (alt sekme çubuklu) kredi kartı harcama takip uygulaması. Framework, derleme adımı ve dış JS bağımlılığı yok. Çalıştırmak için `index.html` tarayıcıda açılır (`file://` ile de çalışır).

## Dosya yapısı

```
index.html       iskelet (4 sekme görünümü + alt bar) + script sırası
css/style.css    tüm tasarım; renk ve font değişkenleri :root'ta
js/storage.js    Store: localStorage katmanı
js/calc.js       Calc: tutar girişi (tuş takımı mantığı)
js/ui.js         yardımcılar (fmt, dk, dayLabel, shortWhen), expandItems, buildRow, renderAmount, renderList
js/main.js       tuş takımı, taksit seçimi, EKLE, sekmeler (showTab), liste filtresi/arama, kesim günü, tümünü sil, açılış render'ı
```

## Mimari kurallar

- **Modül sistemi yok.** Dosyalar global değişken kullanır (`Store`, `Calc`, `$`, `fmt`, `renderList` ...). Script sırası önemlidir: `storage → calc → ui → main`. `import/export` veya `type="module"` ekleme; `file://` ile çalışmayı bozar.
- **Veri katmanı soyut.** Veriye sadece `Store.all/add/remove/clear/getCutoff/setCutoff` üzerinden eriş. `localStorage`'ı başka dosyadan doğrudan çağırma.
- **Render tek yönlü.** Durum değişince `renderList()` çağrılır; toplamlar, ana sayfadaki son harcamalar (`#recent`) ve Harcamalar listesi (`#list`) baştan kurulur. Satırlar iki yerde de `buildRow` ile çizilir. Kullanıcı metnini `textContent` ile yaz; `innerHTML`'e kullanıcı girdisi koyma.

## Veri modeli

`localStorage['expenses_v1']` altında JSON dizisi (yeni kayıt başa eklenir):

```ts
{ id: string, name: string, amt: number, inst?: number, ts: number }
```

- `id`: Base36 zaman damgası + rastgele 3 karakter
- `amt`: toplam tutar (taksitliyse tamamı)
- `inst`: taksit sayısı, yoksa 1 sayılır (eski kayıtlarla uyum için)
- `ts`: epoch ms

Ek anahtar: `cutoff_day_v1` — hesap kesim günü, varsayılan 15. Ayarlar sekmesinden 1–28 arası değiştirilir (29–31 her ayda olmadığı için kapalı).

Veri şemasını değiştirirsen eski kayıtları bozma. `ui.js` zaten eksik `inst` ve `amt` için varsayılan kullanıyor.

## Taksit mantığı (`expandItems`)

- Taksitli kayıt (`inst > 1`) her render'da sanal kayıtlara açılır: tutar `amt / inst`, id `<id>_<n>`, `rawId` asıl kaydın id'si, etiket `n/inst taksit`.
- İlk taksit kaydın kendi tarihine, sonrakiler sonraki hesap kesim günlerine düşer.
- `ts > Date.now()` olan gelecek taksitler listeden gizlenir; toplamlara da girmez.
- Silme sanal satırdan yapılsa bile `Store.remove(i.rawId || i.id)` ile asıl kaydı siler.
- "Bu dönem" = içinde bulunulan hesap dönemi (kesim gününden itibaren), takvim ayı değil. Arayüzde "ay" denmez, dönem aralığı yanında yazar.

## Tuş takımı (`calc.js`)

Sadece rakam ve nokta kabul eder: en fazla 9 hane, 2 ondalık, tek nokta. Ham değer `Calc.raw()`, sayısal değer `Calc.value()`.

## Arayüz ve tasarım

- Sade koyu tema ("siyah kart"): zemin `--bg`, yüzeyler `--surface` / `--surface-2` / `--surface-3`, kenar `--line`. Altın (`--gold`, `--gold-soft`) sadece sinyal: EKLE, seçili durumlar, ana toplamlar, bağlantılar.
- Derinlik fiziksel mantıkla verilir, süs için değil: ışık tek yerden (yukarıdan, zemindeki nötr radial). Basılan şeyler kabarık (`--raised` + `--hl` + nötr gölge; tuşlarda alt kalınlık, basınca 2px iner), yazılan şeyler gömük (`--sunken` + `--inset`: inputlar, segment izi, stepper). EKLE metalik altın (dikey ton + koyu altın alt kenar), parlama yok. Gölgeler her zaman siyah/nötr, asla renkli.
- Kaçınılacaklar ("AI slop" listesi): arka plan lekeleri, cam/blur efekti, renkli parlama gölgeleri, sürekli dönen animasyonlar, degrade yazı, dekoratif ışık çizgileri, kutu içinde kutu, geniş aralıklı BÜYÜK HARF mini etiketler, emoji ikonlar, 4.5:1 altı kontrast. Hareket sadece bir şey olduğunda (ör. yeni kayıt `.row.enter`).
- Font: sistem fontu (`--ui`; iPhone'da SF Pro). Dış font yüklenmez. Rakamlarda `font-variant-numeric: tabular-nums`. Etiketler normal yazım ("Son harcamalar"), en küçük yazı 11px.
- Düzen sabit: `body { overflow: hidden }`, sayfa kaymaz. `.app` = `.views` (esner) + `.tabbar` (altta, `--tab-h` + `safe-area-inset-bottom`). Aynı anda tek `.view.active` görünür; içinde sadece `#list` / `.scroll` kaydırılır.
- Sekmeler: Ana Sayfa (`home`), Harcamalar (`list`), Özet (`summary`, şimdilik yer tutucu), Ayarlar (`settings`). Geçiş `showTab(name)` ile; router/hash yok.
- Ana sayfa sırası: tek özet kartı ("Bu dönem" + dönem aralığı büyük, "Bugün" sağda küçük) → son harcamalar → giriş paneli (tuş takımı altta, başparmak bölgesinde). Son harcamalar kaymaz, panele yaslanır (artan boşluk üstte); `fitRecent()` en fazla 3 satırdan tam sığanları gösterir (iPhone 15 ve Pro Max'te 3, SE'de 1). Satırlarda saat değil tarih etiketi (`shortWhen`: Bugün / Dün / 5 Eki).
- Taksit: isim alanının yanında tek düğme (`#instChip`); dokununca `.inst-selector` aynı satırı kaplar (`#entry.picking`), seçince ya da dışarı dokununca kapanır. `setInst(n)` seçimi ve düğme etiketini günceller.
- Silme: satırlar `.swipe` sarmalayıcısında, sola kaydırınca (`bindSwipe`, eşik 90px / genişliğin %30'u) silinir ve geri alma şeridi açılır. Ana sayfada ✕ gizli; Harcamalar'da ✕ de durur.
- Boşluk ölçüsü `:root`'ta: `--edge` 16px (yan kenar), `--gap` 12px (bloklar arası), `--gap-s` 8px (bileşen içi). Bölüm başlıkları (`.sec-head`, `.sec-title`, `#list h2`) tek kuralı paylaşır. Kaydırma çubukları gizli. Küçük ekran sıkılaştırmaları `@media (max-height: 620px)` bloğunda.
- Hedef ekranlar: iPhone Safari içerik alanları 393×659 (iPhone 15), 430×739 (Pro Max), 375×548 (SE). Yatay kaydırma olmamalı, tuş takımı ve alt bar her birine sığmalı.
- Dokunmatik: tuşlar, sekmeler, taksit düğmesi ve stepper `pointerdown` ile `bindPressEffect` üzerinden tetiklenir ve `navigator.vibrate(12)` ile titreşim verir. Yeni tuşlarda aynı yardımcıyı kullan.
- "Tümünü sil" Ayarlar'dadır ve iki dokunuşla onaylanır (2,5 sn içinde).
- Arayüz dili Türkçe; sayı biçimi `tr-TR`, para birimi ₺.

## Çalışma kuralları

- Değişikliği küçük ve mevcut koda benzer tut: aynı isimlendirme, aynı yorum yoğunluğu, Türkçe yorumlar.
- Derleme, paket yöneticisi veya test altyapısı yok. Doğrulama için tarayıcıda aç; mobil görünüm için dar viewport kullan.
- Commit mesajları Türkçe ve kısa (örn. `UI font güncellemeleri: ...`).
- Commit mesajlarına ve PR açıklamalarına `Co-Authored-By` veya benzeri atıf satırı ekleme.
- Commit ve push sadece kullanıcı isteyince yapılır. Ana dal `main`.
- README ve bu dosya kodla uyumlu kalmalı; mimari değişirse ikisini de güncelle.

## Bilinen sınırlar / fikirler

PWA dosyaları (manifest, service worker) henüz yok. Özet sekmesi yer tutucu: Faz 2'de hedef halkası ve yaklaşan taksitler, Faz 3'te aylık grafik ve yedekleme / CSV dışa aktarma gelecek. Kayıt düzenleme, kategoriler ve çoklu kart planlanan fikirler.

### Sunucuya / gerçek zamanlı veriye geçiş (tasarım ve Faz 2–3'ten sonra)

Hedef: Supabase veya Firebase gibi CDN'den yüklenebilen, girişi ve gerçek zamanlı güncellemeyi sağlayan bir servis. Ayrı sunucu yazılmaz, derleme adımı eklenmez.

- Kolaylaştıran: veri sadece `Store` üzerinden geçiyor; `renderList()` her değişimde baştan çiziyor (gerçek zamanlı dinleyici → `renderList()`); taksit/dönem hesapları istemcide, sunucuda sadece ham kayıtlar durur; id'ler cihazlar arası çakışmaz.
- Değişecekler: `Store` asenkron olur (ekleme, silme, geri alma, açılış beklemeli); kullanıcı girişi; uygulama bir adreste yayınlanır (`file://` ile giriş çalışmaz, ör. GitHub Pages); `localStorage`'daki kayıtlar ilk girişte bir kez yüklenir (Faz 3'teki JSON yedekleme buna temel olur); çevrimdışı davranış seçilir; sunucuda "herkes sadece kendi verisini görür" kuralı yazılır.
- Ayarlar da taşınır: `cutoff_day_v1` ve ileride hedef (`goal_v1`) kullanıcı başına senkronlanmalı.
