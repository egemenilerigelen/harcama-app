# Harcama — proje notları

Mobil öncelikli, tek sayfalık (alt sekme çubuklu) kredi kartı harcama takip uygulaması. Framework, derleme adımı ve dış JS bağımlılığı yok. Çalıştırmak için `index.html` tarayıcıda açılır (`file://` ile de çalışır).

## Dosya yapısı

Katmanlar; script sırası = bağımlılık yönü (bir dosya sadece kendinden önce yüklenenlere bağımlı olabilir):

```
index.html            iskelet (4 sekme görünümü + alt bar + detay paneli) + script sırası
css/style.css         tüm tasarım; renk, font ve boşluk değişkenleri :root'ta

js/core/              ÇEKİRDEK: DOM'a dokunmaz
  config.js           Config: sabitler (gün ms, kesim günü, süreler, eşikler)
  storage.js          Store: localStorage katmanı (veriye tek kapı)
  calc.js             Calc: tutar girişi durumu (tuş takımı mantığı)
  domain.js           Domain: saf iş mantığı (dönem, taksit açma, toplam, gruplama)
  format.js           Format: ekran metinleri (para, tarih, etiketler)

js/ui/                ARAYÜZ YARDIMCILARI ve ortak bileşenler
  dom.js              $ (id ile seçim), el (eleman oluşturma, textContent ile)
  touch.js            Touch: haptic, bindPress, trackHorizontal (ortak yatay sürükleme), bindSwipe, bindPager
  row.js              ExpenseRow: harcama satırı (ana sayfa ve Harcamalar ortak)
  undo.js             UndoBar: geri alma şeridi
  detail.js           DetailSheet: kayıt detay paneli

js/views/             EKRANLAR: her biri kendi DOM'unu ve kendi durumunu yönetir
  entry.js            EntryPanel: isim, taksit düğmesi, tutar ekranı, tuş takımı
  home.js             HomeView: özet kartı, son harcamalar
  list.js             ListView: dönem gezgini, arama, günlere göre liste
  settings.js         SettingsView: kesim günü, tümünü sil
  tabs.js             TabBar: alt sekme çubuğu

js/app.js             App: bileşenleri kurar ve bağlar (composition root), veri akışını yönetir
```

## Mimari kurallar

Bu kurallar her yeni özellikte uygulanır (OOP, clean code, loose coupling):

- **Modül sistemi yok.** Her dosya tek bir global (`Config`, `Store`, `Domain`, `Format`, `Touch`, `ExpenseRow` ya da bir sınıf) tanımlar. `import/export` veya `type="module"` ekleme; `file://` ile çalışmayı bozar. Yeni dosya `index.html`'de katmanına uygun sıraya eklenir.
- **Bağımlılık tek yönlü:** `core → ui → views → app`. Alt katman üst katmanı asla çağırmaz. Her dosyanın başında `// Bağımlılık:` satırı vardır; güncel tutulur.
- **Veriye sadece `App` erişir.** `Store` çağrıları `app.js`'te. Görünümler ve bileşenler Store'u bilmez; `localStorage` sadece `storage.js`'te.
- **Bileşenler birbirini tanımaz.** İletişim constructor'da verilen geri çağrılarla (`onAdd`, `onDelete`, `onOpen`, `onChange`, `onSeeAll` ...) olur; bağlantıyı `App` kurar.
- **Durumu sahibi tutar.** Her sınıf kendi durumunu private alanlarda (`#`) tutar: seçili taksit `EntryPanel`'de, dönem/arama `ListView`'de, geri alma kaydı `UndoBar`'da. Global değişebilir durum yok.
- **İş mantığı saf.** `Domain` veriyi ve zamanı (`now`, `cutoff`) parametre olarak alır; DOM, Store ve `Date.now()` kullanmaz. Dönem hesabı tek yerde: `Domain.periodStart(date, cutoff, offset)`.
- **Metin ve sabit tek yerde.** Ekranda görünen sayı/tarih/etiket metinleri `Format`'ta; sayılar `Config`'te (sihirli sayı yok).
- **Render tek yönlü.** Veri değişince `App.refresh()` çağrılır: veriyi bir kez okur, `model = { now, cutoff, periodStart, rows }` kurar, `HomeView.render` ve `ListView.render`'a verir; listeler baştan kurulur. Görünüm kendi durumu değişince `onChange` ile yeniden çizim ister.
- **Güvenli DOM.** Kullanıcı metni `textContent` (veya `el(tag, cls, text)`) ile yazılır; `innerHTML`'e veri konmaz (sadece temizlemek için boş string).
- **Refactor kanıtlanır.** Yapısal değişiklikte görünüm ve davranış aynı kalmalı; önizlemede önce/sonra DOM karşılaştırmasıyla doğrulanır.

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

Veri şemasını değiştirirsen eski kayıtları bozma. `Domain.expand` ve `DetailSheet` eksik `inst` ve `amt` için varsayılan kullanıyor.

## Taksit mantığı (`Domain.expand`)

- Taksitli kayıt (`inst > 1`) her render'da sanal satırlara açılır: tutar `amt / inst`, id `<id>_<n>`, `rawId` asıl kaydın id'si, `part` / `parts` (etiketi `ExpenseRow`, `Format.part` ile yazar: `n/inst taksit`).
- İlk taksit kaydın kendi tarihine, sonrakiler sonraki hesap kesim günlerine düşer.
- `ts > Date.now()` olan gelecek taksitler listeden gizlenir; toplamlara da girmez.
- Silme sanal satırdan yapılsa bile asıl kaydı siler: `ExpenseRow` eylemlere `rawId || id` verir.
- "Bu dönem" = içinde bulunulan hesap dönemi (kesim gününden itibaren), takvim ayı değil. Arayüzde "ay" denmez, dönem aralığı yanında yazar.

## Tuş takımı (`calc.js`)

Sadece rakam ve nokta kabul eder: en fazla 9 hane, 2 ondalık, tek nokta. Ham değer `Calc.raw()`, sayısal değer `Calc.value()`.

## Arayüz ve tasarım

- Sade koyu tema ("siyah kart"): zemin `--bg`, yüzeyler `--surface` / `--surface-2` / `--surface-3`, kenar `--line`. Altın (`--gold`, `--gold-soft`) sadece sinyal: EKLE, seçili durumlar, ana toplamlar, bağlantılar.
- Derinlik fiziksel mantıkla verilir, süs için değil: ışık tek yerden (yukarıdan, zemindeki nötr radial). Basılan şeyler kabarık (`--raised` + `--hl` + nötr gölge; tuşlarda alt kalınlık, basınca 2px iner), yazılan şeyler gömük (`--sunken` + `--inset`: inputlar, segment izi, stepper). EKLE metalik altın (dikey ton + koyu altın alt kenar), parlama yok. Gölgeler her zaman siyah/nötr, asla renkli.
- Kaçınılacaklar ("AI slop" listesi): arka plan lekeleri, cam/blur efekti, renkli parlama gölgeleri, sürekli dönen animasyonlar, degrade yazı, dekoratif ışık çizgileri, kutu içinde kutu, geniş aralıklı BÜYÜK HARF mini etiketler, emoji ikonlar, 4.5:1 altı kontrast. Hareket sadece bir şey olduğunda (ör. yeni kayıt `.row.enter`).
- Font: sistem fontu (`--ui`; iPhone'da SF Pro). Dış font yüklenmez. Rakamlarda `font-variant-numeric: tabular-nums`. Etiketler normal yazım ("Son harcamalar"), en küçük yazı 11px.
- Düzen sabit: `body { overflow: hidden }`, sayfa kaymaz. `.app` = `.views` (esner) + `.tabbar` (altta, `--tab-h` + `safe-area-inset-bottom`). Aynı anda tek `.view.active` görünür; içinde sadece `#list` / `.scroll` kaydırılır.
- Sekmeler: Ana Sayfa (`home`), Harcamalar (`list`), Özet (`summary`, şimdilik yer tutucu), Ayarlar (`settings`). Geçiş `TabBar.show(name)` ile; router/hash yok.
- Ana sayfa sırası: tek özet kartı ("Bu dönem" + dönem aralığı büyük, "Bugün" sağda küçük) → son harcamalar → giriş paneli (tuş takımı altta, başparmak bölgesinde). Son harcamalar kaymaz, panele yaslanır (artan boşluk üstte); `HomeView.fit()` en fazla `Config.RECENT_MAX` (3) satırdan tam sığanları gösterir (iPhone 15 ve Pro Max'te 3, SE'de 1). Satırlarda saat değil tarih etiketi (`Format.shortWhen`: Bugün / Dün / 5 Eki).
- Taksit: isim alanının yanında tek düğme (`#instChip`); dokununca `.inst-selector` aynı satırı kaplar (`#entry.picking`), seçince ya da dışarı dokununca kapanır. Seçim `EntryPanel` içinde tutulur, düğme etiketi `Format.installment`.
- Satır: solda saat (Harcamalar) / tarih (ana sayfa) sütunu, ortada isim + taksit etiketi yan yana (satır yüksekliği her yerde aynı), sağda tutar. ✕ yok.
- Rakam renkleri: altın = toplamlar (dönem, gün), beyaz kalın = tek harcama, gri = bağlam (saat, ortalama).
- Silme: satırlar `.swipe` sarmalayıcısında; sola kaydırınca (`Touch.bindSwipe`, eşik `Config.SWIPE_DELETE_PX` / `SWIPE_DELETE_RATIO`) `onDelete` çağrılır, `App` siler ve geri alma şeridini açar. Kırmızı "Sil" zemini sadece satırın açtığı alanda (`--reveal` genişliğinde `::before`), satırın arkasında kırmızı yok. Kaydırma sadece başlatan parmağı (`pointerId`) izler.
- Detay: satıra dokununca (kaydırma değilse) `onOpen` → `App` kaydı bulur → `DetailSheet.open(item, cutoff, now)` alttan panel açar: toplam tutar, tarih, ödeme (tek çekim / n taksit × tutar), kalan taksit, "Harcamayı sil". Kayıt düzenleme ileride buraya gelir.
- Harcamalar sekmesi: dönem kartı (`.period`) ‹ › ile hesap dönemleri arasında gezer (`ListView` içindeki offset: 0 bu dönem, -1 geçen ...; en eski kaydın dönemine kadar). Kart yatay kaydırılarak da gezilir (`Touch.bindPager`: parmak sağa = önceki ekstre, sola = sonraki; sınırda %35 dirençle lastik; eşik `Config.PAGER_COMMIT_PX`; sadece kartta çalışır, satır silme ile çakışmaz; sınırlar okların `disabled` durumundan okunur). Kart etiketi: bu dönem "Bu dönem", geçmişler bittiği ayın ekstresi ("Eylül ekstresi", başka yılsa "Aralık 2025 ekstresi"; `Format.periodName`). Kartta toplam ve altında "Günlük ort." var (ana sayfadaki toplamla çakışmasın diye bağlam). Arama başlıktaki ikonla açılır, dönem kartının yerini alır ve tüm dönemlerde arar. Özet satırında adet yok: boşken "Tüm zamanlar · ₺X", yazınca eşleşenlerin "Toplam · ₺X".
- Boşluk ölçüsü `:root`'ta: `--edge` 16px (yan kenar), `--gap` 12px (bloklar arası), `--gap-s` 8px (bileşen içi). Bölüm başlıkları (`.sec-head`, `.sec-title`, `#list h2`) tek kuralı paylaşır. Kaydırma çubukları gizli. Küçük ekran sıkılaştırmaları `@media (max-height: 620px)` bloğunda.
- Hedef ekranlar: iPhone Safari içerik alanları 393×659 (iPhone 15), 430×739 (Pro Max), 375×548 (SE). Yatay kaydırma olmamalı, tuş takımı ve alt bar her birine sığmalı.
- Dokunmatik: tuşlar, sekmeler, taksit düğmesi, dönem okları ve stepper `pointerdown` ile `Touch.bindPress` üzerinden tetiklenir ve titreşim verir (`Config.HAPTIC_MS`). Yeni tuşlarda aynı yardımcıyı kullan.
- "Tümünü sil" Ayarlar'dadır ve iki dokunuşla onaylanır (2,5 sn içinde).
- Arayüz dili Türkçe; sayı biçimi `tr-TR`, para birimi ₺.

## Çalışma kuralları

- Değişikliği küçük ve mevcut koda benzer tut: aynı isimlendirme, aynı yorum yoğunluğu, Türkçe yorumlar. Yeni özellik katmanlara dağıtılır: mantık `Domain`'e, metin `Format`'a, sabit `Config`'e, ekran kendi sınıfına, bağlantı `App`'e.
- Derleme, paket yöneticisi veya test altyapısı yok. Doğrulama için tarayıcıda aç; mobil görünüm için dar viewport kullan.
- Commit mesajları Türkçe ve kısa (örn. `UI font güncellemeleri: ...`).
- Commit mesajlarına ve PR açıklamalarına `Co-Authored-By` veya benzeri atıf satırı ekleme.
- Commit ve push sadece kullanıcı isteyince yapılır. Ana dal `main`.
- README ve bu dosya kodla uyumlu kalmalı; mimari değişirse ikisini de güncelle.

## Bilinen sınırlar / fikirler

PWA dosyaları (manifest, service worker) henüz yok. Özet sekmesi yer tutucu: Faz 2'de hedef halkası ve yaklaşan taksitler, Faz 3'te aylık grafik ve yedekleme / CSV dışa aktarma gelecek. Kayıt düzenleme, kategoriler ve çoklu kart planlanan fikirler.

### Sunucuya / gerçek zamanlı veriye geçiş (tasarım ve Faz 2–3'ten sonra)

Hedef: Supabase veya Firebase gibi CDN'den yüklenebilen, girişi ve gerçek zamanlı güncellemeyi sağlayan bir servis. Ayrı sunucu yazılmaz, derleme adımı eklenmez.

- Kolaylaştıran: veri sadece `Store` üzerinden ve sadece `App`'ten geçiyor; `App.refresh()` her değişimde baştan çiziyor (gerçek zamanlı dinleyici → `App.refresh()`); taksit/dönem hesapları istemcide, sunucuda sadece ham kayıtlar durur; id'ler cihazlar arası çakışmaz.
- Değişecekler: `Store` asenkron olur (etkisi `app.js` ile sınırlı: ekleme, silme, geri alma, açılış beklemeli); kullanıcı girişi; uygulama bir adreste yayınlanır (`file://` ile giriş çalışmaz, ör. GitHub Pages); `localStorage`'daki kayıtlar ilk girişte bir kez yüklenir (Faz 3'teki JSON yedekleme buna temel olur); çevrimdışı davranış seçilir; sunucuda "herkes sadece kendi verisini görür" kuralı yazılır.
- Ayarlar da taşınır: `cutoff_day_v1` ve ileride hedef (`goal_v1`) kullanıcı başına senkronlanmalı.
