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
  domain.js           Domain: saf iş mantığı (dönem, taksit açma, toplam, gruplama)
  format.js           Format: ekran metinleri (para, tarih, etiketler; saf, "bugün" için now alır)
  backup.js           Backup: JSON yedeği yazma/okuma/doğrulama, birleştirme, CSV (saf)

js/ui/                ARAYÜZ YARDIMCILARI ve ortak bileşenler
  dom.js              $ (id ile seçim), el (eleman oluşturma, textContent ile), svgEl (SVG elemanı), paintMoney (₺ ve kuruş ayrı span)
  device.js           Device: ana ekran algılama, service worker kaydı, kalıcı depolama, dosya paylaş/seç, ekran klavyesi yüksekliği
  haptics.js          Haptics: titreşim (Android vibrate; iPhone'da öğenin üstüne serilen etiket + gizli iOS anahtarı), Ayarlar'dan kapatılır
  touch.js            Touch: haptic, bindPress, trackDrag (ortak yatay/dikey sürükleme + bırakma hızı), bindSwipe, bindPager, bindDismiss
  rolling.js          RollingText: kayan haneler (sayı değişince sadece değişen haneler kayar; ana sayfa toplamları)
  row.js              ExpenseRow: harcama satırı (ana sayfa ve Harcamalar ortak)
  undo.js             UndoBar: geri alma kapsülü (Dynamic Island gibi tepeden; silme ve düzenleme; show({ kind, title, sub }, geriAl, gecikme))
  date-choice.js      DateChoice: tarih seçimi "Bugün · Dün · Takvim" (isim adımı ve düzenleme ortak)
  sheet.js            BottomSheet: alttan açılan panel (temel sınıf; [data-close] ya da aşağı çekince kayarak kapanır; klavye açıkken klavyenin üstünde)
  detail.js           DetailSheet extends BottomSheet: kayıt detay paneli ve düzenleme (isim, tutar, taksit, tarih)
  goal-sheet.js       GoalSheet extends BottomSheet: dönem hedefi girme/kaldırma, geçmiş ekstrelerden öneri
  cutoff-sheet.js     CutoffSheet extends BottomSheet: kesim günü seçimi (ayın 1–28. günleri + dönem önizlemesi)
  name-sheet.js       NameSheet extends BottomSheet: girişin 2. adımı (isim, sık kullanılan isim çipleri, taksit, tarih)
  ring.js             GoalRing: hedef ilerleme halkası (SVG)
  barchart.js         BarChart: tek serili sütun grafik (SVG, adım sayacı tarzı)

js/views/             EKRANLAR: her biri kendi DOM'unu ve kendi durumunu yönetir
  entry.js            EntryPanel: girişin 1. adımı (tutar ekranı, tuş takımı, Devam)
  home.js             HomeView: özet kartı, son harcamalar
  list.js             ListView: dönem gezgini, arama, günlere göre liste
  summary.js          SummaryView: hedef halkası, günlük/ekstre grafiği, devam eden taksitler
  settings.js         SettingsView: kesim günü ve hedef satırları (panelleri açtırır), tümünü sil
  tabs.js             TabBar: alt sekme çubuğu (dokunarak ya da parmağı çubukta gezdirerek geçiş)

js/app.js             App: bileşenleri kurar ve bağlar (composition root), veri akışını yönetir

tests/                ÇEKİRDEK TESTLERİ (uygulamanın parçası değil, sw.js ASSETS'e girmez)
  index.html          tarayıcıda açılır (file:// da olur): çekirdeği ve testleri yükler, sonucu yazar
  runner.js           Test: group, eq, ok, throws, D (yerel tarih, ay 1'den)
  *.test.js           domain, format, calc, backup
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
{ id: string, name: string, amt: number, inst?: number, ts: number }
```

- `id`: Base36 zaman damgası + rastgele 3 karakter
- `amt`: toplam tutar (taksitliyse tamamı)
- `inst`: taksit sayısı, yoksa 1 sayılır (eski kayıtlarla uyum için)
- `ts`: epoch ms

Ek anahtarlar:

- `cutoff_day_v1` — hesap kesim günü, varsayılan 15. Ayarlar sekmesinden 1–28 arası değiştirilir (29–31 her ayda olmadığı için kapalı).
- `goal_v1` — dönem hedefi (₺, tam sayı); her ekstre aynı hedefle ölçülür. Yoksa hedef yok (`Store.getGoal()` 0 döner). Özet'teki halkadan ya da Ayarlar'dan değiştirilir.
- `backup_at_v1` — son yedeğin zamanı (ms); Ayarlar'daki "Son yedek" ve hatırlatma için.
- `haptics_v1` — titreşim kapalıysa `'0'`; yoksa açık (`Store.getHaptics()`). Cihaza özel, yedeğe girmez.

Yedek dosyası (`Backup.json`): `{ app: 'harcama', version: 1, exportedAt, cutoff, goal, expenses: [...] }`. Geri yüklemede (`Backup.parse`) her kayıt doğrulanır (id, isim, sayısal tutar ve zaman), ham `expenses_v1` dizisi de kabul edilir; şema değişirse `version` artırılır ve eski sürümler okunmaya devam eder.

Veri şemasını değiştirirsen eski kayıtları bozma. `Domain.expand` ve `DetailSheet` eksik `inst` ve `amt` için varsayılan kullanıyor.

## Taksit mantığı (`Domain.expand`)

- Taksitli kayıt (`inst > 1`) her render'da sanal satırlara açılır: tutar `amt / inst`, id `<id>_<n>`, `rawId` asıl kaydın id'si, `part` / `parts` (etiketi `ExpenseRow`, `Format.part` ile yazar: `n/inst taksit`).
- İlk taksit kaydın kendi tarihine, sonrakiler sonraki dönemlerin ilk gününe (kesim gününün ertesi) düşer.
- `ts > Date.now()` olan gelecek taksitler listeden gizlenir; toplamlara da girmez.
- Silme sanal satırdan yapılsa bile asıl kaydı siler: `ExpenseRow` eylemlere `rawId || id` verir.
- Önceki alışverişlerin bu döneme yansıyan taksitleri (`Domain.isCarried`) dönem toplamına girer ama hiçbir "gün" harcamasına girmez: ana sayfadaki "Bugün", günlük grafik, Harcamalar'daki gün başlıkları ve "Günlük ort." onları saymaz. Harcamalar'da dönemin en altında kendi grubundadır ("Önceki taksitler"), soldaki sütunda saat yerine alışverişin tarihi (`buyTs`).
- "Bu dönem" = içinde bulunulan hesap dönemi, takvim ayı değil. Kesim günü dahil (bankalardaki gibi): kesim günü 12 ise dönem 13 Eyl – 12 Eki, 12 Ekim'in harcaması Ekim ekstresine girer, yeni dönem ertesi gün başlar (`Domain.periodStart`). Arayüzde "ay" denmez, dönem aralığı yanında yazar.

## Tuş takımı (`calc.js`)

`Calc` sınıfı; durumu örnekte, örneği `EntryPanel` tutar (global durum yok). Sadece rakam ve nokta kabul eder: en fazla 9 hane, 2 ondalık, tek nokta. Ham değer `raw()`, sayısal değer `value()`; `set(tutar)` kayıt düzenlemede mevcut tutarı yerleştirir.

## Arayüz ve tasarım

- Sade koyu tema ("siyah kart"): zemin `--bg`, yüzeyler `--surface` / `--surface-2` / `--surface-3`, kenar `--line`. Altın (`--gold`, `--gold-soft`) sadece sinyal: EKLE, seçili durumlar, ana toplamlar, bağlantılar.
- Derinlik fiziksel mantıkla verilir, süs için değil: ışık tek yerden (yukarıdan, zemindeki nötr radial). Basılan şeyler kabarık (`--raised` + `--hl` + nötr gölge; tuşlarda alt kalınlık, basınca 2px iner), yazılan şeyler gömük (`--sunken` + `--inset`: inputlar, segment izi). EKLE metalik altın (dikey ton + koyu altın alt kenar), parlama yok. Gölgeler her zaman siyah/nötr, asla renkli.
- Kaçınılacaklar ("AI slop" listesi): arka plan lekeleri, cam/blur efekti (tek istisna: havada duran alt sekme çubuğu; iOS 26'nın kendi kalıbı, içerik arkasından akar), renkli parlama gölgeleri, sürekli dönen animasyonlar, degrade yazı, dekoratif ışık çizgileri, kutu içinde kutu, geniş aralıklı BÜYÜK HARF mini etiketler, emoji ikonlar, başlığı tekrar eden süs ikonları (ikon ancak bilgi taşıyorsa: sekme çubuğu, oklar, arama), 4.5:1 altı kontrast. Hareket sadece bir şey olduğunda (ör. yeni kayıt `.row.enter`; ana sayfa toplamlarında kayan haneler).
- Font: sistem fontu (`--ui`; iPhone'da SF Pro). Dış font yüklenmez. Rakamlarda `font-variant-numeric: tabular-nums`. Büyük toplamlar (`.hero`: ana sayfa "Bu dönem" / "Bugün", Harcamalar dönem toplamı, detaydaki tutar, isim adımının başlığı) büyük ve sıkı; ₺ küçük ve üst hizada, kuruş küçük ve soluk (`paintMoney`; kayan hanelerde de). Satırlardaki küçük tutarlarda yok. Etiketler normal yazım ("Son harcamalar"), en küçük yazı 11px.
- Düzen sabit: `body { overflow: hidden }`, sayfa kaymaz. `.app` = `.views` (tüm ekran) + `.tabbar`: havada duran cam hap (iOS 26 gibi; `--bar-h` 62pt, kenarlardan `--edge` içeride, alttan `--bar-bottom`: ana ekran çizgisinin hemen üstü). Cam: `backdrop-filter` bulanıklık + doygunluk, üstte ışık çizgisi, kenarlarda hafif parıltı, nötr gölge; seçili sekmede cam kapsül (`.tab-pill`, `TabBar` `--tab-i` ile kaydırır, yaylı geçiş). Kayan sekmeler (Harcamalar, Özet, Ayarlar) ekranın altına kadar uzanır, içerik çubuğun arkasından akar; kayan alanların sonunda `--bar-space` boşluk var. Ana sayfada tuş takımı çubuğun üstünde (`padding-bottom: var(--bar-space)`). "Saydamlığı Azalt" açıksa ya da bulanıklık yoksa çubuk düz koyu. `.app` ekranın dört kenarına sabit (`position: fixed; inset: 0`); yükseklik için vh/dvh kullanılmaz. Ana ekran uygulamasında durum çubuğu düz siyah (`apple-mobile-web-app-status-bar-style: black`): `black-translucent`'ta iOS sayfa yüksekliğini üst güvenli alan kadar kısa hesaplıyor ve altta boşluk kalıyordu. Aynı anda tek `.view.active` görünür; içinde sadece `#list` / `.scroll` kaydırılır.
- Sekmeler: Ana Sayfa (`home`), Harcamalar (`list`), Özet (`summary`), Ayarlar (`settings`). Geçiş `TabBar.show(name)` ile; router/hash yok. Parmak çubukta sağa sola gezdirilebilir (iOS 26 / Instagram gibi; `Touch.trackDrag`): kapsül parmağı izler (`--pill-x`), basılı mercek gibi biraz büyür, parmağın altına gelen sekme hemen açılır; bırakınca kapsül yaylanarak yerine oturur. Çubuk `touch-action: none`.
- Ana sayfa sırası: tek özet kartı ("Bu dönem" + dönem aralığı büyük, "Bugün" sağda küçük; "Bugün" o gün yapılan harcama, önceki alışverişlerin dönemin ilk gününe düşen taksitleri girmez, `Domain.isCarried`) → son harcamalar → tutar ekranı ve tuş takımı (altta, başparmak bölgesinde). Son harcamalar kaymaz, panele yaslanır; ekranın fazla yerini liste alır: `HomeView.fit()` en fazla `Config.RECENT_MAX` (5) satırdan tam sığanları gösterir, artan boşluk bir satırdan az kalır (ana ekran uygulamasında iPhone 15'te 5, SE'de 2). Satırlarda saat değil tarih etiketi (`Format.shortWhen`: Bugün / Dün / 5 Eki).
- Kayan haneler (`RollingText`): ana sayfadaki "Bu dönem" ve "Bugün" ekleme, silme ve geri almada değişince sadece değişen haneler kayar (iPhone'un sayı geçişi gibi): artınca eskisi yukarı çıkıp solar, yenisi alttan gelir; azalınca tersi, soldan sağa `Config.ROLL_STAGGER_MS` gecikmeyle. ₺ sabit. Hareket bitince düz metin olur. Açılışta, sekme dönüşünde ve uygulama öne gelince oynamaz (`model.animate`); "Hareketi Azalt"ta anında.
- Giriş iki adım (iki klavye hiç aynı anda görünmez; ekran elin sırasıyla ilerler: önce tutar, sonra isim):
  - **1. Tutar (`EntryPanel`):** tuş takımıyla tutar, altın "Devam" (tutar yokken bir şey yapmaz). Devam basma efektini `pointerdown`'da, geçişi `click`'te yapar: isim adımının klavyesi ancak dokunuşun içinden açılır.
  - **2. İsim (`NameSheet`, alttan panel):** başlıkta ‹ + girilen tutar (dokununca tutara döner, tutar silinmez) ve sağda "Ekle"; yazı alanı (klavye kendiliğinden açılır, klavyedeki Bitti = Ekle); altında sık kullanılan isim çipleri (`Domain.frequentNames`: en çok girilen önce, en fazla `Config.NAME_CHIPS_MAX`; yana kayan tek sıra, yazdıkça süzülür) ve taksit (`.inst-selector`: tek çekim, 2x, 3x, 6x, 12x; varsayılan tek çekim); en altta tarih (`DateChoice`: "Bugün · Dün · Takvim", taksit seçicisiyle aynı kalıp; her açılışta Bugün). Takvim'in üstünde görünmez `<input type="date">` var: dokununca iPhone'un kendi tarih seçicisi açılır, gelecek gün seçilemez (`max` bugün), seçilen gün düğmede yazar ("5 Eki"). Seçilen gün kesilmiş bir döneme düşerse altta not: "5 Eki · Ekim ekstresine girer (kesilmiş dönem)". Kayıt seçilen güne şimdiki saatle yazılır (`Domain.atDay`); yeni kayıt son harcamalardaysa kısa hareketle gösterilir (`HomeView.flash(id)`). Çipe dokunmak kaydı hemen ekler (`click`: şerit kayarken yanlışlıkla eklenmesin). İsim boşsa "Adsız". Klavye açıkken panel klavyenin hemen üstünde: iPhone klavyesi sayfayı küçültmez, üstüne biner; `Device.watchKeyboard` görünen alandan (visualViewport) klavyenin kapladığı yeri verir, panel `--kb` ile kayar (bu `BottomSheet`'te: tüm paneller böyle).
  - **Ekledikten sonra** geri alma kapsülü yok (en sık işlem; her seferinde bildirim yorar ve görmezden gelinmeye başlar): onayı yeni satırın kısa hareketi, kayan toplam ve titreşim verir. Yanlış çipe dokunulduysa yeni satır sola kaydırılıp silinir (silme geri alınabilir).
- Geri alma kapsülü (`UndoBar`, silme ve düzenleme; eklemede yok): her sekmede ekranın tepesinde, Dynamic Island gibi tepedeki siyahtan büyüyen siyah kapsül (ana ekran uygulamasında durum çubuğu düz siyah, kapsül onunla bütünleşir; kapalıyken ortada ince siyah şerit, `clip-path` ile açılır, kapanırken geri büzülüp yukarı çekilir; yerleşim değil `clip-path`/`transform` hareket eder). Yumuşak siyah: üstte çok hafif ışık, ince kıl çerçeve. Solda işlemi söyleyen ince çizgili ikon, dairesiz (silme soluk kırmızı çöp, düzenleme kalem), ortada `Format.undoTitle` ("Netflix silindi") ve tutar (düzenlemede değiştiyse `Format.change`: "₺320 → ₺298"), sağda kutusuz düz altın "Geri al"; kalan süre (`Config.UNDO_MS`) kapsülün altında incecik yarı saydam altın kıl çizgi, ortadan iki yana kısalır (`.undo-hair`). Basılı tutunca süre durur, bırakınca devam eder (en az `UNDO_MIN_MS`); yukarı itince (`UNDO_SWIPE_PX`) hemen kapanır. Ana sayfada özet kartının üstünü örttüğü için kayan haneler bitmek üzereyken açılır (`Config.UNDO_DELAY_MS`: kapsül tepeden karta inene kadar haneler oturur; açık sekmeyi `App` bilir, diğer sekmelerde beklemeden).
- Satır: solda saat (Harcamalar) / tarih (ana sayfa) sütunu, ortada isim + taksit etiketi yan yana (satır yüksekliği her yerde aynı), sağda tutar. ✕ yok.
- Rakam renkleri: altın = toplamlar (dönem, gün), beyaz kalın = tek harcama, gri = bağlam (saat, ortalama).
- Silme: satırlar `.swipe` sarmalayıcısında; sola kaydırınca (`Touch.bindSwipe`, eşik `Config.SWIPE_DELETE_PX` / `SWIPE_DELETE_RATIO`) `onDelete` çağrılır, `App` siler ve geri alma kapsülünü açar ("Netflix silindi · ₺229 · Geri al"). Satır kalkar (sağ kenarı yuvarlanır, gölgesi düşer), altında gömük kuyu açılır; kuyuda satırdan ayrı yüzen bir hap (`.swipe-cap`, iOS 26 Mail gibi, çöp ikonlu; `ExpenseRow` kurar) satırın açtığı kadar büyür (`--reveal`; genişlik değil `clip-path`). Hap önce koyu; eşik geçilince (bırakırsan silinir, `.armed`) EKLE'nin metaliği gibi metalik şarap rengine döner, ikon satırın kenarına yapışıp sıçrar (`Config.SWIPE_ICON_EDGE_PX`), Android'de bir kez titrer (iPhone'da koddan titreşim yok, eşiği renk söyler). Kırmızının gücü sadece silinecek ana saklanır. Bırakınca satır çıkar, yeri kapanır (alttakiler yukarı kayar, `Config.SWIPE_COLLAPSE_MS`), sonra silinir. Kaydırma sadece başlatan parmağı (`pointerId`) izler.
- Detay: satıra dokununca (kaydırma değilse) `onOpen` → `App` kaydı bulur → `DetailSheet.open(item, cutoff, now)` alttan panel açar: toplam tutar, tarih, ödeme (tek çekim / n taksit × tutar), kalan taksit, "Harcamayı sil". Kapat düğmesi yok: panel aşağı çekilerek ya da arka plana dokunarak kapanır. Sağ üstte "Düzenle": aynı panel düzenleme haline geçer (`.detail-sheet.editing`; başlık Vazgeç · Düzenle · Kaydet, Kaydet üstte ki klavye açıkken görünsün): isim, tutar (`Calc` kurallarıyla, virgül ondalık, binlik ayraçlı), taksit ve tarih (`DateChoice`, isim adımındakiyle aynı; kaydın saati korunur). Kaydet → `onSave(id, { name, amt, inst, ts })` → `App` `Store.update` eder (id aynı kalır), geri alma kapsülü açılır ("Getir düzenlendi · ₺320 → ₺298"), geri alınca önceki hali döner. Taksit sayısı ya da tarih değişirse taksitler yeniden açılır.
- Harcamalar sekmesi: dönem kartı (`.period`) ‹ › ile hesap dönemleri arasında gezer (`ListView` içindeki offset: 0 bu dönem, -1 geçen ...; en eski kaydın dönemine kadar). Kart yatay kaydırılarak da gezilir (`Touch.bindPager`: parmak sağa = önceki ekstre, sola = sonraki; sınırda %35 dirençle lastik; eşik `Config.PAGER_COMMIT_PX`; sadece kartta çalışır, satır silme ile çakışmaz; sınırlar okların `disabled` durumundan okunur). Kart etiketi: bu dönem "Bu dönem", geçmişler bittiği ayın ekstresi ("Eylül ekstresi", başka yılsa "Aralık 2025 ekstresi"; `Format.periodName`). Kartta toplam (önceki taksitler dahil) ve altında "Günlük ort." var (ana sayfadaki toplamla çakışmasın diye bağlam; sadece o dönemde yapılan harcamalar, önceki taksitler ilk günde toplanıp ortalamayı şişirmesin). Arama başlıktaki ikonla açılır, dönem kartının yerini alır ve tüm dönemlerde arar. Özet satırında adet yok: boşken "Tüm zamanlar · ₺X", yazınca eşleşenlerin "Toplam · ₺X".
- Özet sekmesi (`SummaryView`, ekran kayar, üç kart). Kart başlıkları Apple Sağlık tarzı kartın içinde (`.card-head`: beyaz başlık, sağda gri ikincil bilgi), ikonsuz; kartlar boşlukla ayrılır:
  - **Dönem hedefi:** `GoalRing` halkası harcanan / hedef oranı; durumu `Domain.goalProgress` hesaplar ve tempoya bakar: `ok` (altın), `warn` (harcama oranı dönemin geçen kısmını `Config.GOAL_PACE_SLACK` kadar aşmış, `--warn`; dönem sonunda %80 normal, başında %50 alarm), `over` (%100+, `--danger`, halkada "aşıldı"). Aynı bilgi ortadaki yüzde ve alt satırda yazıyla da var. Yanında harcanan / hedef / kalan (aşımda "Aşım"); alt satır `Format.goalHint`: "Günde ₺X ile hedefte kalırsın · n gün kaldı", tempo hızlıysa başında "Hızlı gidiyorsun", tam sınırda "Hedefin sınırındasın"; aşımda tutarı tekrar etmez, varsa "₺X önceki taksitlerden · n gün kaldı". Hedef yoksa halka boş, "Hedef koy". Halkaya dokununca `GoalSheet` açılır (click ile, iPhone klavyesi açılsın diye).
  - **Harcama grafiği:** `BarChart`, "Günlük | Ekstre" (`.seg`). Günlük: bu dönemin her günü bir sütun, o gün yapılan harcama; önceki alışverişlerin bu döneme yansıyan taksitleri (`Domain.isCarried`, dönemin ilk gününe düşer) sütuna girmez, düştüğü günün notunda yazar ("+₺7.000 önceki taksitler"), yoksa dönemin ilk günü tek dev sütun olup ölçeği ezer. Gelecek günler tabanda iz; bütçe çizgisi yok (hedef kartındaki dinamik "günde ₺X" ile çelişen sabit ikinci bir günlük sayı olurdu). Ekstre: son `Config.CHART_PERIODS` dönem; ilk kayıttan önceki dönemler (`Domain.dataSince`) ₺0 değil iz, dokununca "—" ve "Kayıt yok"; süren dönemin etiketi "Bu dönem · n gün kaldı" (yarım dönem tam sanılmasın). Hiç değer yoksa ölçek değeri yazılmaz. Hedef grafiğe çizilmez (kalabalık olmasın), dokunulan ekstrenin hedefe göre durumu okuma satırındaki not alanında (`Format.goalNote`: "%33 · hedef ₺9.500" / "₺1.200 aştı · hedef ₺9.500"). Not alanının yeri iki görünümde de ayrılır (geçişte grafik zıplamaz). Grafiğin içinde çizgi/yazı kalabalığı yok: sadece üstte ölçek değeri ve altta seçici tarih etiketleri. Tek seri, tüm sütunlar altın; seçili tam, diğerleri soluk; dokununca üstteki okuma satırında etiket + değer (+ varsa not). Sütun en fazla `BAR_MAX_W`, 4px yuvarlak uç, 2px aralık, ızgara düz kıl çizgi. Basılı tutma yok: dokunma yeterli, basılı tutma iPhone'da görünmez ve Safari'nin seçim menüsüyle çakışır. Gizliyken çizilmez; sekme açılınca / ekran değişince `redraw()`.
  - **Devam eden taksitler:** üstte sonraki dönemin ekstresine şimdiden yazılan taksitler, ay adıyla ("Kasım ekstresine", `Format.intoStatement`; "gelecek ekstre" denmez, bankacılıkta o bu dönemin ekstresidir; `Domain.installmentsBetween`), hedef varsa altında payı ("hedefin %74'ü", `Format.goalShare`, iyelik eki `Format.possessive`), yanında "Toplam kalan"; altında alışveriş başına isim, `ödenen/toplam · taksit tutarı`, ince ilerleme çubuğu, kalan tutar (`Domain.activeInstallments`). Satıra dokununca kayıt detayı açılır. Liste kalan tutara göre sıralı; kapalıyken ilk `Config.INST_VISIBLE` (3) satır görünür, fazlası en alttaki "n taksit daha ⌄" satırıyla aynı kartın içinde açılır ("Daha az göster", ok yukarı döner; durum `SummaryView`'de). Aşağı ok "bu kartta açılır" demek, "›" başka ekrana geçiş. Kartın yeri sabit (hedef → grafik → taksitler).
- Boşluk ölçüsü `:root`'ta: `--edge` 16px (yan kenar), `--gap` 12px (bloklar arası), `--gap-s` 8px (bileşen içi). Bölüm başlıkları (`.sec-head`, `.sec-title`, `#list h2`) tek kuralı paylaşır. Kaydırma çubukları gizli. Küçük ekran sıkılaştırmaları `@media (max-height: 620px)` bloğunda.
- Hedef ekranlar: iPhone Safari içerik alanları 393×659 (iPhone 15), 430×739 (Pro Max), 375×548 (SE). Yatay kaydırma olmamalı, tuş takımı ve alt bar her birine sığmalı.
- Dokunmatik: tuşlar, sekmeler, dönem okları ve kesim günü seçicisi `pointerdown` ile `Touch.bindPress` üzerinden tetiklenir ve titreşim verir. `click` ile çalışan düğmeler titreşimi `Touch.hapticOn(el)` ile alır. Yeni tuşlarda aynı yardımcıları kullan; `Touch.haptic()` (koddan) sadece Android'de titretir (kaydırarak silmede eşik, dönem kaydırma).
- Titreşim: iPhone Safari'de `navigator.vibrate` yok; tek yol iOS anahtarı (`<input type="checkbox" switch>`): değişince sistem titrer. iOS 26.5'ten beri koddan tıklatmak (`label.click()`) titretmiyor (güvenilmeyen tıklama), parmağın gerçekten dokunması gerekiyor. Bu yüzden `Haptics.attach(el)` öğenin üstüne görünmez bir etiket (`.haptic`, içinde gizli anahtar) serer: dokunuş etiketten anahtara geçer, iPhone titrer; tıklama öğeye de ulaşır, anahtarın kopya tıklaması durdurulur. Titreşim parmak kalkınca olur. Öğenin metni `textContent` ile değiştirilirse etiket silinir (bkz. "Tümünü sil": `firstChild` metni değişir). Kapalıyken `html.no-haptics` etiketleri gizler. iOS'ta "Sistem Dokunuş Geri Bildirimi" kapalıysa hiç titremez. Ayarlar > Uygulama > Titreşim anahtarı da gerçek iOS anahtarıdır.
- Alttan paneller (`BottomSheet`) parmakla aşağı çekilerek de kapanır (`Touch.bindDismiss`): panel parmağı izler, arka plan kaydıkça solar, yukarı çekince direnir; `Config.SHEET_DISMISS_PX` / `SHEET_DISMISS_RATIO` kadar ya da hızlı (`SHEET_FLICK_V`) çekilince kapanır, yoksa yerine yaylanır. Panel `touch-action: pan-x` (çip şeridi yana kaymaya devam eder). Sürükleme bitince parmağın altındaki düğme tıklanmış sayılmaz. Her kapanış kayarak olur (`.sheet-wrap.closing`, `Config.SHEET_CLOSE_MS`).
- Ayarlar sekmesi: "Dönem" bölümünde iki satır, ikisi de aynı kalıp (değer + "›", dokununca alttan panel):
  - **Hesap kesim günü** ("Ayın 13'ü", `Format.cutoffDay`): `CutoffSheet` ayın 1–28. günlerini 7 sütunda tam 4 satır gösterir (iOS Hatırlatıcılar "her ay" seçicisi gibi; stepper yok: 15'ten 1'e 14 dokunuş olurdu). Gün adı ve ay başlığı yok: kesim belirli bir tarih değil her ay tekrar eden gün, gerçek takvim yanlış ipucu verir (haftanın günü, "Ekim 2026", boş hücreler, seçilemeyen 29–31). Kutusuz düz rakamlar; seçili gün metalik altın daire (EKLE ile aynı malzeme), bugün rakamın altında nokta. Tarih bilgisini alttaki iki satır taşır: "Bu dönem" aralığı ve "Sonraki kesim" (`Format.nextCutoff`: "12 Eki · 2 gün sonra"). Her dokunuşta anında güncellenir, "Kaydet"e kadar uygulanmaz. Not satırı kesim gününün dahil olduğunu ve geçmiş dönemlerin yeniden hesaplandığını söyler.
  - **Dönem hedefi** ("Her ekstre için harcama sınırın"): `GoalSheet`. Geçmiş veri varsa kutunun altında öneri: biten son `Config.GOAL_SUGGEST_PERIODS` ekstrenin ortalaması, `GOAL_SUGGEST_ROUND`'a yuvarlı ("Son 3 ekstre ortalaması ≈ ₺8.900 · Kullan", `Domain.goalSuggestion`). "Hedefi kaldır" kırmızı değil sade yazı düğmesi (`.plain-btn`): geri alınabilir iş; kırmızı (`.danger`) sadece silmede.
- Ayarlar'ın başında "Uygulama" bölümü: uygulama ana ekrandan açılmadıysa (`Device.isStandalone`) "Ana ekrana ekle" yönergesi (Safari'deki Paylaş işaretiyle; iPhone bunu kendisi önermez, ana ekrandan açılınca gizlenir) ve "Titreşim" anahtarı (`.toggle`: kapalıyken gömük iz, açıkken EKLE'nin metalik altını; açılınca bir kez titrer).
- "Veri" bölümü (satırlar `click` ile: paylaşım menüsü ve dosya seçici ancak dokunuşun içinden açılır):
  - **Yedekle:** harcamalar + kesim günü + hedef tek JSON (`harcama-yedek-2026-10-10.json`). Dokunmatikte iPhone paylaşım menüsü (Dosyalar, iCloud, mesaj), bilgisayarda indirme (`Device.saveFile`). Paylaşımdan vazgeçilirse yedek sayılmaz. Altında "Son yedek: 12 gün önce"; kayıt varken hiç yedek yoksa ya da `Config.BACKUP_WARN_DAYS` (30) geçtiyse uyarı rengi (`Domain.backupDue`).
  - **Yedekten geri yükle:** dosya seçilir, kayıtlar birleştirilir (`Backup.merge`: aynı id iki kez eklenmez), yedekteki kesim günü ve hedef alınır (hedef yedekte yoksa mevcut korunur). Sonuç kartın altındaki durum satırında ("12 kayıt eklendi · 3 kayıt zaten vardı"); bozuk dosyada kırmızı hata. Telefon değiştirme ve bilgisayardan telefona taşıma bu yolla.
  - **CSV olarak dışa aktar:** alışveriş başına satır; Türkçe Excel için `;` ayırıcı, ondalık virgül, binlik ayraç yok, UTF-8 BOM.
- "Tümünü sil" Ayarlar'dadır ve iki dokunuşla onaylanır (2,5 sn içinde).
- Ana ekran uygulaması: `index.html`'de iOS meta etiketleri (tam ekran, durum çubuğu `black`: düz siyah, içerik altından başlar; sebebi yukarıdaki düzen notunda), `manifest.webmanifest`, `apple-touch-icon`. `App` açılışta `Device.registerOffline()` (sadece http(s); `file://`'da yok) ve `Device.persistStorage()` çağırır. Safari, ana ekrana eklenmemiş sitelerin verisini 7 gün kullanılmazsa silebilir; ana ekran uygulaması bundan muaf, yedekleme ikinci güvence.
- Çevrimdışı katman (`sw.js`): önce ağ (yeni sürüm hemen gelsin), ama ağ `NETWORK_WAIT_MS` (2,5 sn) içinde yanıt vermezse önbellekteki sürümle açılır (kasada zayıf çekimde açılış takılmasın); geç gelen yanıt yine önbelleğe yazılır, yeni sürüm sonraki açılışta gelir. İnternet hiç yoksa doğrudan önbellek.
- Açılış ekranı (`#splash`): `App` kurulana kadar `--bg` zeminde ikondaki metalik altın kart; dönen/bekleme animasyonu yok. Stili `index.html`'de satır içi (style.css'i beklemesin). `App` kurulumun sonunda `body.ready` verir, kısa geçişle kalkar; kurulum hata verirse 6 sn sonra kendiliğinden çekilir.
- Arayüz dili Türkçe; sayı biçimi `tr-TR`, para birimi ₺.

## Çalışma kuralları

- Değişikliği küçük ve mevcut koda benzer tut: aynı isimlendirme, aynı yorum yoğunluğu, Türkçe yorumlar. Yeni özellik katmanlara dağıtılır: mantık `Domain`'e, metin `Format`'a, sabit `Config`'e, ekran kendi sınıfına, bağlantı `App`'e.
- Derleme ve paket yöneticisi yok. Doğrulama için tarayıcıda aç; mobil görünüm için dar viewport kullan.
- Çekirdek testleri `tests/index.html`'de (derlemesiz, tarayıcıda; başlık "✓ 70/70"). `Domain`, `Format`, `Calc` ya da `Backup` değişince ilgili test eklenir/güncellenir; sayfa yeşil olmadan push edilmez. Arayüz testi yok, o önizlemede ve telefonda doğrulanır.
- Commit mesajları Türkçe ve kısa (örn. `UI font güncellemeleri: ...`).
- Commit mesajlarına ve PR açıklamalarına `Co-Authored-By` veya benzeri atıf satırı ekleme.
- Commit ve push sadece kullanıcı isteyince yapılır. Ana dal `main`. Commit'ler konu konu: her commit tek bir karar/özellik ve kendi başına çalışır.
- Her yayında (push) `Config.VERSION` artırılır (`YYYY.AA.GG-n`); Ayarlar'ın en altında görünür, telefonda yeni sürümün geldiği buradan kontrol edilir. `sw.js` ağdan alırken HTTP önbelleğini atlar (`cache: 'no-cache'`), değişince `CACHE` adı da artırılır.
- Yeni bir uygulama dosyası (js, css, ikon) eklenince `sw.js`'teki `ASSETS` listesine de eklenir (`tests/` hariç); eksik ya da yanlış yol service worker kurulumunu bozar (internetsiz açılış çalışmaz).
- README ve bu dosya kodla uyumlu kalmalı; mimari değişirse ikisini de güncelle.

## Bilinen sınırlar / fikirler

Yayın: GitHub Pages, https://egemenilerigelen.github.io/harcama-app/ (repo herkese açık; `main`'e her push'ta birkaç dakika içinde güncellenir, `.nojekyll` dosyaları işlemeden yayınlatır). Gönderilen her değişiklik uygulamayı kullanan herkese gider: push'tan önce önizlemede doğrulanır. Veri her kullanıcının kendi cihazında kalır, sunucuya gelmez. Commit e-postası GitHub'ın gizli adresi (`git config user.email` bu repoda ayarlı). Sıradaki fikirler: tutarı da hatırlayan çipler, son ödeme günü, kart limiti, iade (nadir, şimdilik gerek yok); sonra kategoriler ve çoklu kart.

Bekleyen bilinen konular (2026-10-12 genel kontrolünden):

- Takvim düğmesinin iPhone'un tarih seçicisini açması önizlemede denenemez; telefonda doğrulanacak.
- İki adımlı girişte isim panelinin klavyenin üstüne oturması ve klavyenin Devam'la kendiliğinden açılması önizlemede denenemez (iPhone klavyesi yok); telefonda doğrulanacak. Sırada: tutarı da hatırlayan çipler (ör. Netflix ₺229).
- Aramada önceki taksit satırları kendi günlerinde durur (gün başlığı onları da toplar); ayrı grup sadece dönem görünümünde.
- Titreşimin iPhone'da çalıştığı ve panelin parmakla çekilmesi önizlemede denenemez (iPhone yok); telefonda doğrulanacak.
- Hedef önerisi (`Domain.goalSuggestion`) ve ekstre grafiği, kayıtların başladığı yarım ilk dönemi tam ekstre gibi sayıyor; öneri olduğundan düşük çıkabilir. Şimdilik bekliyor.

### Sunucuya / gerçek zamanlı veriye geçiş (tasarım ve Faz 3'ten sonra)

Hedef: Supabase veya Firebase gibi CDN'den yüklenebilen, girişi ve gerçek zamanlı güncellemeyi sağlayan bir servis. Ayrı sunucu yazılmaz, derleme adımı eklenmez.

- Kolaylaştıran: veri sadece `Store` üzerinden ve sadece `App`'ten geçiyor; `App.refresh()` her değişimde baştan çiziyor (gerçek zamanlı dinleyici → `App.refresh()`); taksit/dönem hesapları istemcide, sunucuda sadece ham kayıtlar durur; id'ler cihazlar arası çakışmaz.
- Değişecekler: `Store` asenkron olur (etkisi `app.js` ile sınırlı: ekleme, silme, geri alma, açılış beklemeli); kullanıcı girişi; uygulama bir adreste yayınlanır (`file://` ile giriş çalışmaz, ör. GitHub Pages); `localStorage`'daki kayıtlar ilk girişte bir kez yüklenir (Faz 3'teki JSON yedekleme buna temel olur); çevrimdışı davranış seçilir; sunucuda "herkes sadece kendi verisini görür" kuralı yazılır.
- Ayarlar da taşınır: `cutoff_day_v1` ve `goal_v1` kullanıcı başına senkronlanmalı.
