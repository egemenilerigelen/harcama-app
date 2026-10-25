# Harcama — proje notları

Mobil öncelikli, tek sayfalık (alt sekme çubuklu) kredi kartı harcama takip uygulaması. Framework, derleme adımı ve dış JS bağımlılığı yok; `index.html` tarayıcıda açılır (`file://` ile de çalışır). Telefonda ana ekran uygulaması (PWA) olarak kullanılır: kendi ikonuyla tam ekran, internetsiz açılır.

## Dosya yapısı

Stil ve script sırası `index.html`'de = bağımlılık yönü (bir dosya sadece kendinden önce yüklenenlere bağımlı olabilir).

```
index.html            iskelet (açılış ekranı + 4 sekme görünümü + alt bar + paneller), stil ve script sırası
manifest.webmanifest  ana ekran uygulaması: ad, ikon, tam ekran, renkler
sw.js                 çevrimdışı katman: önce ağ, geç kalırsa ya da yoksa önbellek; ASSETS listesi
icons/                uygulama ikonu (180, 192, 512)

css/                  tasarım, bölümlere ayrılmış; sıra önemli (aynı ağırlıktaki kuralda sonraki kazanır)
  base.css            :root değişkenleri (renk, font, boşluk, eğri), zemin, uygulama çerçevesi, sekme görünümleri
  home.css            ana sayfa özet kartı, büyük rakam (.hero), kayan haneler
  entry.css           giriş: tutar ekranı, taksit ve tarih seçimi, tuş takımı, EKLE
  common.css          son harcamalar, bölüm başlıkları, ikon butonu
  list.css            Harcamalar: dönem kartı, arama, liste, gün başlıkları
  row.css             harcama satırı, kaydırarak silme, kategori ikonu, taksit etiketi, fiyat
  summary.css         Özet: kart başlığı, hedef, grafik, kategoriler, abonelikler, taksitler
  settings.css        Ayarlar satırları, yedek, veri işlemlerinin sonucu
  controls.css        titreşim etiketi (Haptics.attach), açma/kapama anahtarı
  sheets.css          hedef ve kesim günü panelleri
  name-sheet.css      isim adımı, seçim özeti, kategori çipleri
  sheet.css           BottomSheet temeli, kayıt detayı ve düzenleme
  dialog.css          ortada açılan ekran (CenterDialog), ekstre özeti
  undo.css            geri alma kapsülü
  tabbar.css          alt sekme çubuğu (cam)
  media.css           küçük ekran, Hareketi Azalt (hep en son)

js/core/              ÇEKİRDEK: DOM'a dokunmaz
  config.js           Config: sabitler (gün ms, kesim günü, süreler, eşikler, VERSION)
  storage.js          Store: localStorage katmanı (veriye tek kapı)
  calc.js             Calc (sınıf): tutar girişi durumu; örneğini EntryPanel tutar
  categories.js       Categories: kategori anahtarları
  domain.js           Domain: saf iş mantığı (dönem, taksit ve abonelik açma, toplam, gruplama, kategori)
  format.js           Format: ekran metinleri (para, tarih, etiketler; saf, "bugün" için now alır)
  backup.js           Backup: JSON yedeği yazma/okuma/doğrulama, birleştirme, CSV (saf)

js/ui/                ARAYÜZ YARDIMCILARI ve ortak bileşenler
  dom.js              $ (id ile seçim), el (eleman, textContent ile), svgEl, paintMoney (₺ ve kuruş ayrı span)
  motion.js           Motion: kısa hareketler (Web Animations API; dokununca biter, Hareketi Azalt'ta yok)
  cat-icon.js         CatIcon: kategori ikonları (ince çizgi SVG, renk CSS'te data-cat) ve kuyu
  device.js           Device: ana ekran algılama, service worker, kalıcı depolama, dosya paylaş/seç, klavye yüksekliği
  haptics.js          Haptics: titreşim (Android vibrate; iPhone'da gizli iOS anahtarı)
  touch.js            Touch: haptic, bindPress, trackDrag, bindSwipe, bindPager, bindDismiss
  rolling.js          RollingText: kayan haneler (ana sayfa toplamları)
  row.js              ExpenseRow: harcama satırı (ana sayfa ve Harcamalar ortak)
  undo.js             UndoBar: geri alma kapsülü (show({ kind, title, sub }, geriAl, gecikme))
  date-choice.js      DateChoice: "Bugün · Dün · Takvim" (isim adımı ve düzenleme ortak)
  cat-choice.js       CategoryChoice: kategori çip şeridi (isim adımı ve düzenleme ortak)
  sheet.js            BottomSheet: alttan açılan panel (temel sınıf)
  detail.js           DetailSheet extends BottomSheet: kayıt detayı ve düzenleme
  goal-sheet.js       GoalSheet extends BottomSheet: dönem hedefi, geçmiş ekstrelerden öneri
  cutoff-sheet.js     CutoffSheet extends BottomSheet: kesim günü (1–28 + dönem önizlemesi)
  name-sheet.js       NameSheet extends BottomSheet: girişin 2. adımı (isim, çipler, özet satırı)
  ring.js             GoalRing: hedef halkası (SVG)
  barchart.js         BarChart: tek serili sütun grafik (SVG)
  dialog.js           CenterDialog: ortada açılan ekran (temel sınıf; arka plan kararır)
  statement.js        StatementDialog extends CenterDialog: geçmiş ekstrelerin özeti (‹ › ve kaydırma)

js/views/             EKRANLAR: her biri kendi DOM'unu ve durumunu yönetir
  entry.js            EntryPanel: girişin 1. adımı (tutar, tuş takımı, Devam)
  home.js             HomeView: özet kartı, son harcamalar
  list.js             ListView: dönem gezgini, arama, günlere göre liste
  summary.js          SummaryView: hedef, grafik, kategoriler, abonelikler, taksitler
  settings.js         SettingsView: kesim günü, hedef, uygulama, veri
  tabs.js             TabBar: alt sekme çubuğu

js/app.js             App: bileşenleri kurar ve bağlar (composition root), veri akışını yönetir

docs/                 geliştirici notları, konu başına bir dosya (uygulamanın parçası değil, ASSETS'e girmez)

tests/                ÇEKİRDEK TESTLERİ (sw.js ASSETS'e girmez): index.html tarayıcıda açılır; runner.js, *.test.js
```

## Mimari kurallar

Her yeni özellikte uygulanır (OOP, clean code, loose coupling):

- **Modül sistemi yok.** Her dosya tek bir global (`Config`, `Store`, `Domain`, bir sınıf ...) tanımlar. `import/export` veya `type="module"` ekleme; `file://` ile çalışmayı bozar. Yeni dosya `index.html`'de katmanına uygun sıraya eklenir.
- **Bağımlılık tek yönlü:** `core → ui → views → app`. Alt katman üst katmanı asla çağırmaz. Her JS dosyasının başındaki `// Bağımlılık:` satırı güncel tutulur.
- **Veriye sadece `App` erişir.** `Store` çağrıları `app.js`'te; `localStorage` sadece `storage.js`'te.
- **Bileşenler birbirini tanımaz.** İletişim constructor'da verilen geri çağrılarla (`onAdd`, `onDelete`, `onOpen`, `onChange` ...) olur; bağlantıyı `App` kurar.
- **Durumu sahibi tutar.** Her sınıf kendi durumunu private alanlarda (`#`) tutar (`Calc` örneği `EntryPanel`'de, dönem/arama `ListView`'de, geri alma kaydı `UndoBar`'da). Global değişebilir durum yok; tek istisna `Haptics.enabled`, onu da sadece `App` verir.
- **İş mantığı saf.** `Domain` ve `Format` veriyi ve zamanı (`now`, `cutoff`) parametre alır; DOM, Store ve `Date.now()` kullanmaz. Zamanı sadece `App` okur. Dönem hesabı tek yerde: `Domain.periodStart(date, cutoff, offset)`.
- **Metin ve sabit tek yerde.** Ekran metinleri `Format`'ta, sayılar `Config`'te (sihirli sayı yok).
- **Render tek yönlü.** Veri değişince `App.refresh()`: veriyi bir kez okur, `model = { now, cutoff, goal, goalLog, periodStart, items, rows }` kurar (`items` ham kayıtlar, `rows` ekrandaki satırlar; eylemden geliyorsa `refresh({ animate: true })`), `HomeView`, `ListView`, `SummaryView`'in `render`'ına verir; listeler baştan kurulur. Görünüm kendi durumu değişince `onChange` ile yeniden çizim ister. `visibilitychange` ile öne gelince de `refresh()` (gün ya da dönem değişmiş olabilir).
- **Güvenli DOM.** Kullanıcı metni `textContent` (veya `el(tag, cls, text)`) ile yazılır; `innerHTML`'e veri konmaz (sadece temizlemek için boş string).
- **Refactor kanıtlanır.** Yapısal değişiklikte görünüm ve davranış aynı kalmalı; önizlemede önce/sonra DOM ya da computed style karşılaştırmasıyla doğrulanır.

## Veri modeli

`localStorage['expenses_v1']`: JSON dizisi, yeniden eskiye `ts` sıralı (`Store` her yazışta sıralar).

```ts
{ id: string, name: string, amt: number, inst?: number, ts: number, cat?: string, sub?: true, end?: number }
```

- `id` Base36 zaman damgası + rastgele 3 karakter · `amt` toplam tutar (taksitliyse tamamı) · `inst` taksit sayısı, yoksa 1 · `ts` epoch ms
- `cat`: `Categories.KEYS` (market, food, transport, subs, shopping, bills, health, fun, other). Yeni kayıtlarda hep yazılır (yoksa `other`); eski kayıtta yoksa ekranda `Domain.categorize` tamamlar, veriye yazılmaz.
- `sub`: abonelik (her ay kendiliğinden çekilir). `end`: aboneliğin bitirildiği an; sonrasında çekim yok.
- Ek anahtarlar: `cutoff_day_v1` (kesim günü, varsayılan 15, 1–28), `goal_v1` (dönem hedefi ₺, yoksa 0), `goal_log_v1` (hedef geçmişi `[{ ts, goal }]` eskiden yeniye; eski ekstreler kendi hedefiyle ölçülür), `backup_at_v1` (son yedek zamanı), `haptics_v1` (`'0'` = titreşim kapalı; cihaza özel, yedeğe girmez), `statement_seen_v1` (kendiliğinden gösterilen son ekstre özetinin dönem başı; cihaza özel, yedeğe girmez).
- Yedek (`Backup.json`): `{ app: 'harcama', version: 2, exportedAt, cutoff, goal, goals, expenses }` (`goals` hedef geçmişi; 1. sürüm yedeklerde yok). `Backup.parse` her kaydı doğrular, ham `expenses_v1` dizisini de kabul eder; şema değişirse `version` artar, eski sürümler okunmaya devam eder.
- Şemayı değiştirirsen eski kayıtları bozma: `Domain.expand` ve `DetailSheet` eksik `inst`/`amt` için varsayılan, eksik `cat` için `Domain.categorize` kullanır.

## İş kuralları (özet)

Ayrıntı `docs/is-kurallari.md`. Bunlar kullanıcı kararıdır:

- **Dönem** = hesap dönemi, takvim ayı değil; kesim günü dahil (kesim 12 → 13 Eyl – 12 Eki). Arayüzde "ay" denmez.
- **Taksit ve abonelik** her render'da `Domain.expand` ile sanal satırlara açılır (`rawId` asıl kayıt; silme/düzenleme ona gider). Gelecek satır yok, toplamlara girmez. Dönem toplamına, kategoriye ve hedefe girer, günlük harcamaya (Bugün, günlük grafik, gün başlıkları, günlük ort.) girmez.
- **Kategori tahmini yok**: sadece aynı isme en son verilen kategori hatırlanır.

## Tasarım (özet)

Ayrıntı `docs/tasarim.md`; CSS'e dokunmadan önce oku.

- Koyu "siyah kart" tema; renk, boşluk ve eğri değişkenleri `base.css` `:root`'ta. Altın sadece sinyal (EKLE, seçili, ana toplamlar, bağlantılar); kategori rengi sadece kategori bağlamında; gölgeler hep nötr.
- "AI slop" yok: lekeler, cam/blur (tek istisna alt sekme çubuğu), renkli parlama, sürekli dönen animasyon, degrade yazı, kutu içinde kutu, aralıklı BÜYÜK HARF etiket, emoji ikon, süs ikon, 4.5:1 altı kontrast.
- Hareket kütüphanesiz (CSS + `Motion`), sadece bir şey olduğunda; rakamlar beklemez, dokununca biter, Hareketi Azalt'ta oynamaz.
- Düzen sabit: sayfa kaymaz, `.app` `position: fixed; inset: 0`, vh/dvh yok. Hedef ekranlar 393×659, 430×739, 375×548: yatay kaydırma yok, tuş takımı ve alt bar sığar.
- Yeni tuşlar `Touch.bindPress` / `Touch.hapticOn` kullanır (iPhone titreşimi `Haptics.attach`, `docs/tasarim.md`'de).
- Sistem fontu, rakamlarda `tabular-nums`, en küçük yazı 11px. Arayüz Türkçe, `tr-TR`, ₺.

## Geliştirici notları (`docs/`)

Ekranların ve bileşenlerin davranışı, kararların gerekçeleri ve bilinen sınırlar `docs/`'ta, konu başına bir dosya: `is-kurallari`, `tasarim`, `ana-sayfa` (sekmeler, son harcamalar, kayan haneler), `giris` (`EntryPanel`, `NameSheet`), `geri-alma` (`UndoBar`), `satir` (`ExpenseRow`, kaydırarak silme, `DetailSheet`), `harcamalar` (`ListView`), `ozet` (`SummaryView`), `paneller` (`BottomSheet`, `CenterDialog`), `ayarlar`, `pwa` (ana ekran, çevrimdışı, açılış), `sinirlar` (bilinen sınırlar, sunucuya geçiş planı).

- Bir ekrana ya da bileşene dokunmadan önce o dosyayı oku; oradaki davranışlar kullanıcı kararıdır.
- Davranış değişince o dosyayı güncelle; aynı bilgi iki yere yazılmaz.
- Yazım kuralı (notlar şişmesin): bugünkü davranış yazılır, geçmişi ("eskiden şöyleydi, sonra ...") git'te kalır. Gerekçe tek cümle. Karar değişince eski paragraf yeniden yazılır, üstüne yenisi eklenmez. Biten "bilinen sınır" ve yol haritası maddeleri silinir (yol haritasında tamamlananlar [x] kalır).

## Çalışma kuralları

- Değişikliği küçük ve mevcut koda benzer tut: aynı isimlendirme, yorum yoğunluğu, Türkçe yorumlar. Yeni özellik katmanlara dağıtılır: mantık `Domain`'e, metin `Format`'a, sabit `Config`'e, ekran kendi sınıfına, stil kendi css dosyasına, bağlantı `App`'e.
- Büyük dosyaları bütün okuma: Grep ile yeri bul, sadece o aralığı oku.
- **Önizleme akışı (ana yol: bilgisayardaki önizleme):** sunucu `.claude/launch.json`'daki `harcama` (açıksa yeniden başlatılmaz). Döngü: kullanıcı "şunu değiştir" der → değişiklik dosyaya yazılır, sayfa yenilenir → kullanıcı önizleme panelinde kendisi bakar → beğenene kadar tekrar → beğenince birlikte commit (beğenmezse `git restore`). Kısa bir deneme için dosyaya yazmadan `javascript_tool` ile canlı sayfaya uygulanabilir (yenileyince kaybolur).
  - Token kuralları: ekran görüntüsü alınmaz, zorunda kalınmadıkça (o zaman da küçük ölçek / bölge, tek sefer); `read_page` tüm sayfada kullanılmaz; doğrulama tek satırlık JS ölçümüyle (computed style, boyut, taşma). Konu bitince yeni oturum.
- **Telefonda önizleme (sadece kullanıcı isterse):** `harcama-telefon` sunucusu (port 5520) ev ağına açılır; telefon aynı Wi-Fi'da Safari'den `http://<bilgisayarın-ip>:5520` açar (IP: `ipconfig` → IPv4). Sadece uygulama dosyaları verilir, noktayla başlayan yollar (`.git`, `.claude`) kapalı. Ayrı adres olduğu için verisi gerçek uygulamadan ayrı; http olduğu için service worker çalışmaz (internetsiz açılış burada denenmez). İş bitince sunucu kapatılır. `.claude/` git dışı: `serve.py` ve `launch.json` sadece bu bilgisayarda.
- Derleme ve paket yöneticisi yok. Çekirdek testleri `tests/index.html`'de (tarayıcıda; başlık "✓ geçen/toplam"). `Domain`, `Format`, `Calc` ya da `Backup` değişince ilgili test eklenir/güncellenir; sayfa yeşil olmadan push edilmez. Arayüz testi yok.
- Commit mesajları Türkçe ve kısa; `Co-Authored-By` veya benzeri atıf satırı yok. Commit ve push sadece kullanıcı isteyince; ana dal `main`; her commit tek bir karar/özellik ve kendi başına çalışır.
- Her yayında (push) `Config.VERSION` artırılır (`YYYY.AA.GG-n`, Ayarlar'ın en altında görünür) ve `sw.js`'teki `CACHE` adı artırılır.
- Yeni uygulama dosyası (js, css, ikon) `index.html`'e doğru sıraya ve `sw.js` `ASSETS` listesine eklenir (`tests/` hariç); eksik ya da yanlış yol service worker kurulumunu bozar.
- README, `docs/` ve bu dosya kodla uyumlu kalmalı; mimari değişirse hepsini güncelle.

## Yayın

GitHub Pages: https://egemenilerigelen.github.io/harcama-app/ (repo herkese açık; `main`'e her push birkaç dakikada yayına çıkar, `.nojekyll` var). Her push uygulamayı kullanan herkese gider: önce önizlemede doğrulanır. Veri her kullanıcının cihazında kalır. Commit e-postası GitHub'ın gizli adresi (repoda ayarlı). Sıradaki işler README'deki yol haritasında; bekleyen konular `docs/sinirlar.md`'de.
