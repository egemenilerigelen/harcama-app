# Harcama — proje notları

Mobil öncelikli, tek sayfalık (alt sekme çubuklu) kredi kartı harcama takip uygulaması. Framework, derleme adımı ve dış JS bağımlılığı yok. Çalıştırmak için `index.html` tarayıcıda açılır (`file://` ile de çalışır). Telefonda ana ekrana eklenen uygulama (PWA) olarak kullanılır: bir adresten bir kez Safari'de açılıp "Ana Ekrana Ekle" denir; sonra kendi ikonuyla tam ekran, internetsiz açılır.

## Dosya yapısı

Katmanlar; script sırası = bağımlılık yönü (bir dosya sadece kendinden önce yüklenenlere bağımlı olabilir):

```
index.html            iskelet (açılış ekranı + 4 sekme görünümü + alt bar + paneller) + script sırası
css/style.css         tüm tasarım; renk, font ve boşluk değişkenleri :root'ta
manifest.webmanifest  ana ekran uygulaması: ad, ikon, tam ekran (standalone), renkler
sw.js                 çevrimdışı katman (service worker): önce ağ, geç kalırsa ya da yoksa önbellek; ASSETS listesi
icons/                uygulama ikonu (apple-touch-icon 180, 192, 512; koyu zemin + metalik altın kart)

js/core/              ÇEKİRDEK: DOM'a dokunmaz
  config.js           Config: sabitler (gün ms, kesim günü, süreler, eşikler)
  storage.js          Store: localStorage katmanı (veriye tek kapı)
  calc.js             Calc (sınıf): tutar girişi durumu (tuş takımı mantığı); örneğini EntryPanel tutar
  categories.js       Categories: kategori anahtarları (tahmin sözlüğü yok)
  domain.js           Domain: saf iş mantığı (dönem, taksit ve abonelik açma, toplam, gruplama, kategori hatırlama ve kırılımı)
  format.js           Format: ekran metinleri (para, tarih, etiketler; saf, "bugün" için now alır)
  backup.js           Backup: JSON yedeği yazma/okuma/doğrulama, birleştirme, CSV (saf)

js/ui/                ARAYÜZ YARDIMCILARI ve ortak bileşenler
  dom.js              $ (id ile seçim), el (eleman oluşturma, textContent ile), svgEl (SVG elemanı), paintMoney (₺ ve kuruş ayrı span)
  motion.js           Motion: kısa hareketler (Web Animations API; eğri CSS'ten, dokununca biter, Hareketi Azalt'ta yok)
  cat-icon.js         CatIcon: kategori ikonları (ince çizgi SVG; renk CSS'te, data-cat) ve tonlu kuyu (well)
  device.js           Device: ana ekran algılama, service worker kaydı, kalıcı depolama, dosya paylaş/seç, ekran klavyesi yüksekliği
  haptics.js          Haptics: titreşim (Android vibrate; iPhone'da öğenin üstüne serilen etiket + gizli iOS anahtarı), Ayarlar'dan kapatılır
  touch.js            Touch: haptic, bindPress, trackDrag (ortak yatay/dikey sürükleme + bırakma hızı; iptal bırakma sayılmaz), bindSwipe, bindPager, bindDismiss
  rolling.js          RollingText: kayan haneler (sayı değişince sadece değişen haneler kayar; ana sayfa toplamları)
  row.js              ExpenseRow: harcama satırı (ana sayfa ve Harcamalar ortak)
  undo.js             UndoBar: geri alma kapsülü (Dynamic Island gibi tepeden; silme ve düzenleme; show({ kind, title, sub }, geriAl, gecikme))
  date-choice.js      DateChoice: tarih seçimi "Bugün · Dün · Takvim" (isim adımı ve düzenleme ortak; onPick, not satırı isteğe bağlı)
  cat-choice.js       CategoryChoice: kategori çip şeridi (isim adımı ve düzenleme ortak; seçilmemiş olabilir, onPick)
  sheet.js            BottomSheet: alttan açılan panel (temel sınıf; [data-close] ya da aşağı çekince kayarak kapanır; klavye açıkken klavyenin üstünde)
  detail.js           DetailSheet extends BottomSheet: kayıt detay paneli ve düzenleme (isim, tutar, taksit, tarih)
  goal-sheet.js       GoalSheet extends BottomSheet: dönem hedefi girme/kaldırma, geçmiş ekstrelerden öneri
  cutoff-sheet.js     CutoffSheet extends BottomSheet: kesim günü seçimi (ayın 1–28. günleri + dönem önizlemesi)
  name-sheet.js       NameSheet extends BottomSheet: girişin 2. adımı (isim, sık kullanılan isim çipleri, özet satırı: kategori · taksit · tarih)
  ring.js             GoalRing: hedef ilerleme halkası (SVG)
  barchart.js         BarChart: tek serili sütun grafik (SVG, adım sayacı tarzı)

js/views/             EKRANLAR: her biri kendi DOM'unu ve kendi durumunu yönetir
  entry.js            EntryPanel: girişin 1. adımı (tutar ekranı, tuş takımı, Devam)
  home.js             HomeView: özet kartı, son harcamalar
  list.js             ListView: dönem gezgini, arama, günlere göre liste
  summary.js          SummaryView: hedef halkası, günlük/ekstre grafiği, kategoriler, abonelikler, devam eden taksitler
  settings.js         SettingsView: kesim günü ve hedef satırları (panelleri açtırır), tümünü sil
  tabs.js             TabBar: alt sekme çubuğu (dokunarak ya da parmağı çubukta gezdirip bırakarak geçiş)

js/app.js             App: bileşenleri kurar ve bağlar (composition root), veri akışını yönetir

tests/                ÇEKİRDEK TESTLERİ (uygulamanın parçası değil, sw.js ASSETS'e girmez)
  index.html          tarayıcıda açılır (file:// da olur): çekirdeği ve testleri yükler, sonucu yazar
  runner.js           Test: group, eq, ok, throws, D (yerel tarih, ay 1'den)
  *.test.js           domain, format, calc, backup, category, subscription
```

## Mimari kurallar

Bu kurallar her yeni özellikte uygulanır (OOP, clean code, loose coupling):

- **Modül sistemi yok.** Her dosya tek bir global (`Config`, `Store`, `Domain`, `Format`, `Touch`, `ExpenseRow` ya da bir sınıf) tanımlar. `import/export` veya `type="module"` ekleme; `file://` ile çalışmayı bozar. Yeni dosya `index.html`'de katmanına uygun sıraya eklenir.
- **Bağımlılık tek yönlü:** `core → ui → views → app`. Alt katman üst katmanı asla çağırmaz. Her dosyanın başında `// Bağımlılık:` satırı vardır; güncel tutulur.
- **Veriye sadece `App` erişir.** `Store` çağrıları `app.js`'te. Görünümler ve bileşenler Store'u bilmez; `localStorage` sadece `storage.js`'te.
- **Bileşenler birbirini tanımaz.** İletişim constructor'da verilen geri çağrılarla (`onAdd`, `onDelete`, `onOpen`, `onChange`, `onSeeAll` ...) olur; bağlantıyı `App` kurar.
- **Durumu sahibi tutar.** Her sınıf kendi durumunu private alanlarda (`#`) tutar: tutar girişi (`Calc` örneği) `EntryPanel`'de, isim adımının seçili taksiti `NameSheet`'te, dönem/arama `ListView`'de, geri alma kaydı `UndoBar`'da. Global değişebilir durum yok; tek istisna cihaz geneli titreşim tercihi (`Haptics.enabled`), onu da sadece `App` verir.
- **İş mantığı saf.** `Domain` veriyi ve zamanı (`now`, `cutoff`) parametre olarak alır; DOM, Store ve `Date.now()` kullanmaz. Dönem hesabı tek yerde: `Domain.periodStart(date, cutoff, offset)`. `Format` da saf: "Bugün / Dün" ve "başka yılsa yıl" gibi metinler `now`'ı parametre alır (görünümler modeldeki `now`'ı verir); zamanı sadece `App` okur.
- **Metin ve sabit tek yerde.** Ekranda görünen sayı/tarih/etiket metinleri `Format`'ta; sayılar `Config`'te (sihirli sayı yok).
- **Render tek yönlü.** Veri değişince `App.refresh()` çağrılır: veriyi bir kez okur, `model = { now, cutoff, goal, periodStart, items, rows }` kurar (`items` ham kayıtlar, `rows` ekrandaki satırlar; `animate` değişiklik bir eylemden geldi: `refresh({ animate: true })` ekleme, silme ve geri almada), `HomeView`, `ListView` ve `SummaryView`'in `render`'ına verir; listeler baştan kurulur. Görünüm kendi durumu değişince `onChange` ile yeniden çizim ister. Uygulama öne gelince de (`visibilitychange`) `refresh()` çağrılır: ana ekran uygulaması kapanmadan arka planda bekler, döndüğünde gün ya da dönem değişmiş olabilir.
- **Güvenli DOM.** Kullanıcı metni `textContent` (veya `el(tag, cls, text)`) ile yazılır; `innerHTML`'e veri konmaz (sadece temizlemek için boş string).
- **Refactor kanıtlanır.** Yapısal değişiklikte görünüm ve davranış aynı kalmalı; önizlemede önce/sonra DOM karşılaştırmasıyla doğrulanır.

## Veri modeli

`localStorage['expenses_v1']` altında JSON dizisi, yeniden eskiye `ts` sıralı (`Store` her yazışta sıralar: geçmiş tarihli ekleme ve tarih düzenleme sırayı bozmasın):

```ts
{ id: string, name: string, amt: number, inst?: number, ts: number, cat?: string, sub?: true, end?: number }
```

- `id`: Base36 zaman damgası + rastgele 3 karakter
- `amt`: toplam tutar (taksitliyse tamamı)
- `inst`: taksit sayısı, yoksa 1 sayılır (eski kayıtlarla uyum için)
- `ts`: epoch ms
- `cat`: kategori anahtarı (`Categories.KEYS`: market, food, transport, subs, shopping, bills, health, fun, other). Yeni kayıtlarda her zaman yazılır (seçilmediyse ve isim hatırlanmıyorsa `other`); yoksa (eski kayıtlar) ekranda aynı isme verilmiş kategori ya da Diğer gösterilir, veriye yazılmaz (`Domain.categorize`). Kayıt düzenlenince yazılır.

- `sub`: abonelik (her ay kendiliğinden çekilir; bkz. Abonelikler). Yoksa tek kayıt.
- `end`: aboneliğin bitirildiği an (ms); sonrasında çekim olmaz. Yoksa sürüyor.

Ek anahtarlar:

- `cutoff_day_v1` — hesap kesim günü, varsayılan 15. Ayarlar sekmesinden 1–28 arası değiştirilir (29–31 her ayda olmadığı için kapalı).
- `goal_v1` — dönem hedefi (₺, tam sayı); her ekstre aynı hedefle ölçülür. Yoksa hedef yok (`Store.getGoal()` 0 döner). Özet'teki halkadan ya da Ayarlar'dan değiştirilir.
- `backup_at_v1` — son yedeğin zamanı (ms); Ayarlar'daki "Son yedek" ve hatırlatma için.
- `haptics_v1` — titreşim kapalıysa `'0'`; yoksa açık (`Store.getHaptics()`). Cihaza özel, yedeğe girmez.

Yedek dosyası (`Backup.json`): `{ app: 'harcama', version: 1, exportedAt, cutoff, goal, expenses: [...] }`. Geri yüklemede (`Backup.parse`) her kayıt doğrulanır (id, isim, sayısal tutar ve zaman), ham `expenses_v1` dizisi de kabul edilir; şema değişirse `version` artırılır ve eski sürümler okunmaya devam eder.

Veri şemasını değiştirirsen eski kayıtları bozma. `Domain.expand` ve `DetailSheet` eksik `inst` ve `amt` için varsayılan kullanıyor; eksik `cat` için `Domain.categorize`.

## Kategoriler (`Domain.rememberedCategory`)

- Uygulama kategori tahmin etmez (isimden tahmin sözlüğü kullanıcı kararıyla kaldırıldı; ileride güçlü bir tahminle yeniden ele alınacak). Sadece hatırlar: kullanıcının aynı isme en son verdiği kategori (`Domain.learnedCategories`; büyük/küçük harf ve Türkçe harf farkı aynı isim, yarım isim tutmaz). "Getir"e bir kez Market dendiyse sonraki "Getir" Market gelir; hatırlanan yoksa seçilmemiş, eklenirken "Diğer".
- Kırılım (`Domain.categoryBreakdown`): bu dönem kategori başına (önceki taksitler dahil, dönemin harcaması), geçen dönemin **aynı gününe kadarki** tutarla kıyaslanır (süren yarım dönem tam dönemle kıyaslanmasın); geçen dönemde henüz kayıt yoksa kıyas yok. Küçük farklar (`Config.CAT_SAME_RATIO` %10 / `CAT_SAME_MIN` ₺50 altı) "aynı" sayılır.

## Taksit mantığı (`Domain.expand`)

- Taksitli kayıt (`inst > 1`) her render'da sanal satırlara açılır: tutar `amt / inst`, id `<id>_<n>`, `rawId` asıl kaydın id'si, `part` / `parts` (etiketi `ExpenseRow`, `Format.part` ile yazar: `n/inst taksit`).
- İlk taksit kaydın kendi tarihine, sonrakiler sonraki dönemlerin ilk gününe (kesim gününün ertesi) düşer.
- `ts > Date.now()` olan gelecek taksitler listeden gizlenir; toplamlara da girmez.
- Silme sanal satırdan yapılsa bile asıl kaydı siler: `ExpenseRow` eylemlere `rawId || id` verir.
- Önceki alışverişlerin bu döneme yansıyan taksitleri (`Domain.isCarried`) dönem toplamına girer ama hiçbir "gün" harcamasına girmez: ana sayfadaki "Bugün", günlük grafik, Harcamalar'daki gün başlıkları ve "Günlük ort." onları saymaz. Harcamalar'da dönemin en altında kendi grubundadır ("Önceki taksitler"), soldaki sütunda saat yerine alışverişin tarihi (`buyTs`).
- "Bu dönem" = içinde bulunulan hesap dönemi, takvim ayı değil. Kesim günü dahil (bankalardaki gibi): kesim günü 12 ise dönem 13 Eyl – 12 Eki, 12 Ekim'in harcaması Ekim ekstresine girer, yeni dönem ertesi gün başlar (`Domain.periodStart`). Arayüzde "ay" denmez, dönem aralığı yanında yazar.

## Abonelikler (`Domain.charges`)

- Abonelik kategorisinde tek çekim girilen kayıt abonelik olur (`Domain.subscriptionEntry` → `sub: true`; isim adımında ödeme etiketi "Her ay"). Bir kez girilir, her render'da çekimlere açılır (`Domain.expand(items, cutoff, now)`): ilki kaydın kendisi, sonrakiler her ay aynı gün ve saat (ay kısaysa son günü, `Domain.addMonths`), id `<id>_m<n>`, `rawId` asıl kayıt; sadece `now`'a kadar (gelecek çekim satırı yok). `end` varsa ondan sonrası yok.
- Taksit gibi dönem toplamına, kategoriye ve hedefe girer, günlük harcamaya girmez (`Domain.isDaily`: Bugün, günlük grafik, gün başlıkları, günlük ort.). Hedefin günlük tutarı dönemin kalanına düşecek çekimler (`Domain.upcomingCharges`) ayrıldıktan sonra hesaplanır.
- Düzenlemede: elle her ay girilmiş eski Abonelik kayıtları (`sub` yok) kategori değişmeden abonelik olmaz (çift çekim olmasın); kategorisi Abonelik'e çevrilen olur, Abonelik'ten çıkan ya da taksitlenen tekrar etmez. Bitirme `end = şimdi` (geri alınabilir, `Store.put`).

## Tuş takımı (`calc.js`)

`Calc` sınıfı; durumu örnekte, örneği `EntryPanel` tutar (global durum yok). Sadece rakam ve nokta kabul eder: en fazla 9 hane, 2 ondalık, tek nokta. Ham değer `raw()`, sayısal değer `value()`; `set(tutar)` kayıt düzenlemede mevcut tutarı yerleştirir.

## Arayüz ve tasarım

- Sade koyu tema ("siyah kart"): zemin `--bg`, yüzeyler `--surface` / `--surface-2` / `--surface-3`, kenar `--line`. Altın (`--gold`, `--gold-soft`) sadece sinyal: EKLE, seçili durumlar, ana toplamlar, bağlantılar. Kategorilerin kendi rengi var (`--cat-*`, düşük doygunluk; altına ve kırmızıya yakın renk yok), ama sadece kategori bağlamında: ikonlarda renk sadece çizgide (kuyu nötr, gömük; satır ve Özet kartı aynı), dolu hali yalnız Özet'teki oran şeridinde ve seçili kategori çipinin tonunda. Renk kodu her yerde aynı (yeşil = Market), ekran sakin kalır. Değişim renkleri: artış `--warn`, azalış `--good`.
- Derinlik fiziksel mantıkla verilir, süs için değil: ışık tek yerden (yukarıdan, zemindeki nötr radial). Basılan şeyler kabarık (`--raised` + `--hl` + nötr gölge; tuşlarda alt kalınlık, basınca 2px iner), yazılan şeyler gömük (`--sunken` + `--inset`: inputlar, segment izi). EKLE metalik altın (dikey ton + koyu altın alt kenar), parlama yok. Gölgeler her zaman siyah/nötr, asla renkli.
- Kaçınılacaklar ("AI slop" listesi): arka plan lekeleri, cam/blur efekti (tek istisna: havada duran alt sekme çubuğu; iOS 26'nın kendi kalıbı, içerik arkasından akar), renkli parlama gölgeleri, sürekli dönen animasyonlar, degrade yazı, dekoratif ışık çizgileri, kutu içinde kutu, geniş aralıklı BÜYÜK HARF mini etiketler, emoji ikonlar, başlığı tekrar eden süs ikonları (ikon ancak bilgi taşıyorsa: sekme çubuğu, oklar, arama, kategori), 4.5:1 altı kontrast. Hareket sadece bir şey olduğunda (ör. yeni kayıt `.row.enter`; ana sayfa toplamlarında kayan haneler; Özet'in açılış hareketi).
- Hareket dili: kütüphane yok (CSS geçişleri + `Motion`, Web Animations API). Dört eğri `:root`'ta, hepsi oradan: `--ease` yerine oturma (çoğu hareket), `--ease-in` çıkış (kapanan panel), `--spring` yaylı oturma (sekme kapsülü), `--spring-soft` hafif yay (Özet açılışı). Renk/opaklık geri bildirimi düz `ease` 0.15–0.2s, basma 0.05s. JS'ten oynayan hareketin süresi `Config`'te. Kurallar: rakamlar beklemez (öğe son halinde çizilir, hareket üstüne oynar; sayı saydırma yok), dokununca ya da kaydırınca hemen biter (`Motion.finish`), "Hareketi Azalt"ta oynamaz.
- Font: sistem fontu (`--ui`; iPhone'da SF Pro). Dış font yüklenmez. Rakamlarda `font-variant-numeric: tabular-nums`. Büyük toplamlar (`.hero`: ana sayfa "Bu dönem" / "Bugün", Harcamalar dönem toplamı, detaydaki tutar, isim adımının başlığı) büyük ve sıkı; ₺ küçük ve üst hizada, kuruş küçük ve soluk (`paintMoney`; kayan hanelerde de). Satırlardaki küçük tutarlarda yok. Etiketler normal yazım ("Son harcamalar"), en küçük yazı 11px.
- Düzen sabit: `body { overflow: hidden }`, sayfa kaymaz. `.app` = `.views` (tüm ekran) + `.tabbar`: havada duran cam hap (iOS 26 gibi; `--bar-h` 62pt, kenarlardan `--edge` içeride, alttan `--bar-bottom`: ana ekran çizgisinin hemen üstü). Cam: `backdrop-filter` bulanıklık + doygunluk, üstte ışık çizgisi, kenarlarda hafif parıltı, nötr gölge; seçili sekmede cam kapsül (`.tab-pill`, `TabBar` `--tab-i` ile kaydırır, yaylı geçiş). Kayan sekmeler (Harcamalar, Özet, Ayarlar) ekranın altına kadar uzanır, içerik çubuğun arkasından akar; kayan alanların sonunda `--bar-space` boşluk var. Ana sayfada tuş takımı çubuğun üstünde (`padding-bottom: var(--bar-space)`). "Saydamlığı Azalt" açıksa ya da bulanıklık yoksa çubuk düz koyu. `.app` ekranın dört kenarına sabit (`position: fixed; inset: 0`); yükseklik için vh/dvh kullanılmaz. Ana ekran uygulamasında durum çubuğu düz siyah (`apple-mobile-web-app-status-bar-style: black`): `black-translucent`'ta iOS sayfa yüksekliğini üst güvenli alan kadar kısa hesaplıyor ve altta boşluk kalıyordu. Aynı anda tek `.view.active` görünür; içinde sadece `#list` / `.scroll` kaydırılır.
- Rakam renkleri: altın = toplamlar (dönem, gün), beyaz kalın = tek harcama, gri = bağlam (saat, ortalama, kategori payı), amber/yeşil = geçen döneme göre artış/azalış.
- Boşluk ölçüsü `:root`'ta: `--edge` 16px (yan kenar), `--gap` 12px (bloklar arası), `--gap-s` 8px (bileşen içi). Bölüm başlıkları (`.sec-head`, `.sec-title`, `#list h2`) tek kuralı paylaşır. Kaydırma çubukları gizli. Küçük ekran sıkılaştırmaları `@media (max-height: 620px)` bloğunda.
- Hedef ekranlar: iPhone Safari içerik alanları 393×659 (iPhone 15), 430×739 (Pro Max), 375×548 (SE). Yatay kaydırma olmamalı, tuş takımı ve alt bar her birine sığmalı.
- Dokunmatik: tuşlar, sekmeler, dönem okları ve kesim günü seçicisi `pointerdown` ile `Touch.bindPress` üzerinden tetiklenir ve titreşim verir. `click` ile çalışan düğmeler titreşimi `Touch.hapticOn(el)` ile alır. Yeni tuşlarda aynı yardımcıları kullan; `Touch.haptic()` (koddan) sadece Android'de titretir (kaydırarak silmede eşik, dönem kaydırma).
- Titreşim: iPhone Safari'de `navigator.vibrate` yok; tek yol iOS anahtarı (`<input type="checkbox" switch>`): değişince sistem titrer. iOS 26.5'ten beri koddan tıklatmak (`label.click()`) titretmiyor (güvenilmeyen tıklama), parmağın gerçekten dokunması gerekiyor. Bu yüzden `Haptics.attach(el)` öğenin üstüne görünmez bir etiket (`.haptic`, içinde gizli anahtar) serer: dokunuş etiketten anahtara geçer, iPhone titrer; tıklama öğeye de ulaşır, anahtarın kopya tıklaması durdurulur. Titreşim parmak kalkınca olur. Öğenin metni `textContent` ile değiştirilirse etiket silinir (bkz. "Tümünü sil": `firstChild` metni değişir). Kapalıyken `html.no-haptics` etiketleri gizler. iOS'ta "Sistem Dokunuş Geri Bildirimi" kapalıysa hiç titremez. Ayarlar > Uygulama > Titreşim anahtarı da gerçek iOS anahtarıdır.
- Arayüz dili Türkçe; sayı biçimi `tr-TR`, para birimi ₺.

## Ekran ayrıntıları (README'de)

Ekranların ve bileşenlerin ayrıntılı davranışı, kararların gerekçeleri ve bekleyen konular `README.md`'nin "Geliştirici notları" bölümündedir: sekmeler ve ana sayfa (sekme çubuğunda gezinme, son harcamalar, kayan haneler), giriş (`EntryPanel`, `NameSheet`), geri alma kapsülü (`UndoBar`), satır / kaydırarak silme / detay ve düzenleme (`ExpenseRow`, `DetailSheet`), Harcamalar sekmesi (`ListView`), Özet sekmesi (`SummaryView`: açılış hareketi, hedef halkası, grafik, kategoriler, taksitler), alttan paneller (`BottomSheet`), Ayarlar (kesim günü, hedef, Uygulama, Veri), ana ekran uygulaması / çevrimdışı / açılış ekranı, bilinen sınırlar ve sunucuya geçiş planı.

- Bir ekrana ya da bileşene dokunmadan önce README'deki bölümünü oku (başlığı Grep ile bul, sadece o bölümü oku). Oradaki davranışlar kullanıcı kararıdır; bilmeden değiştirme.
- Davranış değişince o bölümü güncelle; aynı bilgi iki dosyaya yazılmaz.

## Çalışma kuralları

- Değişikliği küçük ve mevcut koda benzer tut: aynı isimlendirme, aynı yorum yoğunluğu, Türkçe yorumlar. Yeni özellik katmanlara dağıtılır: mantık `Domain`'e, metin `Format`'a, sabit `Config`'e, ekran kendi sınıfına, bağlantı `App`'e.
- Derleme ve paket yöneticisi yok. Doğrulama için tarayıcıda aç; mobil görünüm için dar viewport kullan.
- Çekirdek testleri `tests/index.html`'de (derlemesiz, tarayıcıda; sayfa başlığı "✓ geçen/toplam"). `Domain`, `Format`, `Calc` ya da `Backup` değişince ilgili test eklenir/güncellenir; sayfa yeşil olmadan push edilmez. Arayüz testi yok, o önizlemede ve telefonda doğrulanır.
- Commit mesajları Türkçe ve kısa (örn. `UI font güncellemeleri: ...`).
- Commit mesajlarına ve PR açıklamalarına `Co-Authored-By` veya benzeri atıf satırı ekleme.
- Commit ve push sadece kullanıcı isteyince yapılır. Ana dal `main`. Commit'ler konu konu: her commit tek bir karar/özellik ve kendi başına çalışır.
- Her yayında (push) `Config.VERSION` artırılır (`YYYY.AA.GG-n`); Ayarlar'ın en altında görünür, telefonda yeni sürümün geldiği buradan kontrol edilir. `sw.js` ağdan alırken HTTP önbelleğini atlar (`cache: 'no-cache'`), değişince `CACHE` adı da artırılır.
- Yeni bir uygulama dosyası (js, css, ikon) eklenince `sw.js`'teki `ASSETS` listesine de eklenir (`tests/` hariç); eksik ya da yanlış yol service worker kurulumunu bozar (internetsiz açılış çalışmaz).
- README ve bu dosya kodla uyumlu kalmalı; mimari değişirse ikisini de güncelle.

## Yayın

Yayın: GitHub Pages, https://egemenilerigelen.github.io/harcama-app/ (repo herkese açık; `main`'e her push'ta birkaç dakika içinde güncellenir, `.nojekyll` dosyaları işlemeden yayınlatır). Gönderilen her değişiklik uygulamayı kullanan herkese gider: push'tan önce önizlemede doğrulanır. Veri her kullanıcının kendi cihazında kalır, sunucuya gelmez. Commit e-postası GitHub'ın gizli adresi (`git config user.email` bu repoda ayarlı). Sıradaki fikirler (README yol haritası): güçlü kategori tahmini (kullanıcı kendisi ele alacak), tutarı da hatırlayan çipler, dönem sonu tahmini ve ekstre kapanış özeti, son ödeme günü ve kart limiti, ilk açılış rehberi; sonra çoklu kart. İade nadir, şimdilik gerek yok. Kategori satırına dokununca o kategorinin harcamaları (Harcamalar'da süzme) henüz yok.
