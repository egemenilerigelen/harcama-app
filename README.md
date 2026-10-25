# Harcama

Kredi kartı harcamalarını hızlıca kaydetmek için geliştirilmiş, mobil öncelikli ve framework'süz bir web uygulaması. Tutarı hesap makinesi tuş takımıyla gir, isim ver, taksit seç ve ekle. Veriler cihazında kalır, sunucu gerekmez. iPhone'da ana ekrana eklenip kurulu bir uygulama gibi, internetsiz kullanılır.

## Özellikler

- **Hızlı giriş, iki adım:** Önce tutar: ana sayfanın altında, başparmak bölgesinde hesap makinesi tuş takımı (en fazla 9 hane ve 2 ondalık), "Devam". Sonra isim: alttan açılan panelde yazı alanı ve en sık girdiğin isimler; isme dokunmak kaydı hemen ekler. Altında tek satır özet (kategori · taksit · tarih; varsayılan tek çekim ve bugün): değiştirmek istediğine dokununca o satır yerinde seçiciye döner, panel zıplamaz. Eklenen kayıt listede kısa bir hareketle belirir, toplam kayarak güncellenir.
- **Kategoriler:** İsim adımında seçilir; bir isme verdiğin kategori o isim için hatırlanır (Migros'a bir kez Market dersen sonra hep Market gelir). Uygulama kendisi tahmin etmez. Özet'te bu dönemin kategori dağılımı (iPhone depolama ekranı gibi renkli şerit) ve geçen dönemin aynı gününe göre değişim ("Ulaşım ₺550 fazla").
- **Taksit desteği:** İsim adımında tek çekim, 2x, 3x, 6x ve 12x. Taksitler hesap kesim günlerine göre aylara dağıtılır ve listede `1/3 taksit` gibi etiketlenir. Önceki alışverişlerin bu döneme düşen taksitleri dönem toplamına girer ama gün toplamlarına ve günlük ortalamaya girmez; Harcamalar'da dönemin altında ayrı grupta durur.
- **Abonelikler:** İsim adımında Abonelik kategorisi seçilince (tek çekim) ödeme "Her ay" olur: bir kez girilir, her ay aynı gün aynı tutarla kendiliğinden yazılır, detaydan "Aboneliği bitir" denene kadar sürer. Taksit gibi dönem toplamına girer ama günlük harcamaya (Bugün, günlük grafik, gün başlıkları, günlük ortalama) girmez; Harcamalar'da dönemin altında kendi grubunda durur. Özet'te aylık ve yıllık toplam, abonelik başına sıradaki çekim. Hedefin "günde ₺X" tutarı dönemin kalanına düşecek abonelik çekimleri ayrıldıktan sonra hesaplanır.
- **Alt sekme çubuğu:** Ana Sayfa, Harcamalar, Özet ve Ayarlar. iOS 26'daki gibi havada duran cam çubuk; içerik arkasından akar, seçili sekmenin kapsülü kayarak geçer.
- **Özet kartı:** Harcama ekleyip silince toplamların sadece değişen haneleri kayar (iPhone'un sayı geçişi gibi). İçinde bulunulan hesap dönemi (kesim gününün ertesinden kesim gününe, kesim günü dahil) toplamı ve tarih aralığı, yanında bugün yapılan harcama (önceki alışverişlerin bu döneme düşen taksitleri hariç).
- **Özet sekmesi:** Dönem hedefi halkası (yüzde, kalan, "günde ₺X ile hedefte kalırsın"), adım sayacı tarzı günlük / ekstre sütun grafiği, kategoriler, abonelikler, devam eden taksitler (sonraki ekstreye şimdiden yazılan, toplam kalan, alışveriş başına ilerleme).
- **Son harcamalar:** Ana sayfada ekrana sığdığı kadar (en fazla 5) son kayıt; "Tümünü gör" ile Harcamalar sekmesine geçilir.
- **Harcamalar sekmesi:** Hesap dönemleri (ekstreler) arasında ‹ › ile ya da dönem kartını kaydırarak gezinme, dönem toplamı ve günlük ortalama, günlere göre gruplu liste. Arama ikonu tüm dönemlerde arar.
- **Kayıt detayı ve düzenleme:** Satıra dokununca toplam tutar, tarih, taksit planı ve kalan taksitler; "Düzenle" ile isim, tutar, taksit ve tarih değiştirilir. Silme detaydan ya da satırı sola kaydırarak (satırın altından yüzen bir hap çıkar, bırakınca silinecek noktada şarap rengine döner; silinen satırın yeri kayarak kapanır); silme ve düzenlemeden sonra birkaç saniye ekranın tepesinde Dynamic Island gibi açılan siyah kapsülde "Geri al" (ne yapıldığı isim ve tutarla yazar; basılı tutunca süre durur).
- **Geçmiş tarihli ekleme:** İsim adımında "Bugün · Dün · Takvim"; kesilmiş bir döneme düşen gün için hangi ekstreye gireceği yazar.
- **Ayarlar:** Ana ekrana ekleme yönergesi (Safari'den açılınca), hesap kesim günü (1–28, gün seçiciden tek dokunuşla; seçilen dönemin aralığı ve sonraki kesim tarihi önizlenir), dönem hedefi (geçmiş ekstrelerin ortalamasından öneriyle), yedekleme ve iki dokunuşla onaylanan "Tümünü sil". En altta sürüm etiketi.
- **Dokunmatik uyumlu:** Tuşlarda titreşim geri bildirimi (iPhone dahil; Ayarlar'dan kapatılır) ve basma efekti. Alttan paneller aşağı çekilerek kapanır. Sayfa kaymaz, sadece listeler kayar.
- **Yedekleme:** Tek dokunuşla JSON yedeği (iPhone paylaşım menüsüyle Dosyalar'a ya da iCloud'a), yedekten geri yükleme (kayıtlar birleştirilir, aynısı iki kez eklenmez) ve Excel'de açılan CSV. Uzun süre yedek alınmazsa hatırlatır.
- **Ana ekran uygulaması (PWA):** Kendi ikonu ve adıyla tam ekran açılır, internetsiz çalışır; internet varken her açılışta güncel sürümü alır. Çekim zayıfsa 2,5 saniyeden fazla beklemez, kayıtlı sürümle açılır (yenisi sonraki açılışta gelir). Açılırken temaya uygun açılış ekranı (altın kart) görünür. Arka plandan dönünce ekran güncellenir (gün ya da dönem değişmiş olabilir).
- **Çevrimdışı:** Veriler cihazdaki `localStorage` alanında tutulur.
- **Sade koyu tema:** Düz yüzeyler, altın sadece vurgu için. Sistem fontu, çevrimdışı da aynı görünür.

## Başlarken

Derleme veya kurulum gerekmez.

1. Depoyu indir:
   ```bash
   git clone https://github.com/egemenilerigelen/harcama-app.git
   ```
2. `index.html` dosyasını tarayıcıda aç.

Telefonda kullanmak için **https://egemenilerigelen.github.io/harcama-app/** adresini iPhone'da Safari ile aç, Paylaş → "Ana Ekrana Ekle" de; uygulama ana ekrandan kendi ikonuyla açılır. Bilgisayardaki kayıtları taşımak için orada "Yedekle", telefonda "Yedekten geri yükle".

Masaüstünde denemek için geliştirici araçlarından mobil görünüme geç. Çevrimdışı katman (service worker) sadece `http(s)` üzerinden çalışır, `file://` ile açınca devre dışıdır. Dış font yüklenmez; cihazın sistem fontu kullanılır.

## Proje yapısı

```
harcama-app/
├── index.html            iskelet, açılış ekranı ve script sırası
├── manifest.webmanifest  ana ekran uygulaması: ad, ikon, renkler
├── sw.js                 çevrimdışı katman (service worker)
├── icons/                uygulama ikonu
├── css/                bölümlere ayrılmış tasarım (base.css'te :root değişkenleri, media.css en sonda)
└── js/
    ├── core/             çekirdek, DOM'a dokunmaz
    │   ├── config.js     sabitler
    │   ├── storage.js    Store: localStorage katmanı
    │   ├── calc.js       Calc: tutar girişi
    │   ├── domain.js     iş mantığı: dönem, taksit, abonelik, toplamlar, hedef (saf fonksiyonlar)
    │   ├── format.js     para ve tarih metinleri (saf)
    │   └── backup.js     JSON yedeği ve CSV
    ├── ui/               ortak bileşenler: dokunma, titreşim, cihaz, kayan haneler, satır, geri alma, alttan paneller, halka, grafik
    ├── views/            ekranlar: giriş paneli, ana sayfa, harcamalar, özet, ayarlar, sekmeler
    └── app.js            bileşenleri kurar ve bağlar
tests/                    çekirdek testleri (tarayıcıda açılır)
```

Katmanlar tek yönlü bağımlıdır: `core → ui → views → app`. Veriye sadece `app.js` erişir; ekranlar birbirini tanımaz, geri çağrılarla konuşur. Durumu sahibi tutar (global değişebilir durum yok); iş mantığı ve metinler zamanı parametre olarak alır. Dosyalar ES modülü değildir (her biri tek bir global tanımlar); bu sayede `file://` ile doğrudan açılır. Script sırası `index.html`'dedir. Ayrıntılı kurallar `CLAUDE.md`'de.

## Veri modeli

Harcamalar `localStorage` içinde `expenses_v1` anahtarıyla JSON dizisi olarak saklanır:

```json
{ "id": "lx3k9ab2f", "name": "Market", "amt": 450, "inst": 1, "ts": 1760000000000 }
```

| Alan | Açıklama |
|---|---|
| `id` | Benzersiz kimlik (zaman damgası + rastgele) |
| `name` | Açıklama, boşsa "Adsız" |
| `amt` | Toplam tutar |
| `inst` | Taksit sayısı (yoksa 1) |
| `ts` | Eklenme zamanı (epoch ms) |
| `cat` | Kategori (yoksa aynı isme verilen ya da Diğer) |
| `sub` | Abonelik: `true` ise her ay aynı gün kendiliğinden çekilir (yoksa tek kayıt) |
| `end` | Aboneliğin bitirildiği an (epoch ms); sonrasında çekim olmaz |

Hesap kesim günü `cutoff_day_v1` (varsayılan 15), dönem hedefi `goal_v1`, son yedeğin zamanı `backup_at_v1` anahtarında tutulur. `Store` nesnesi veri erişimini soyutladığı için ileride başka bir depolamaya geçmek kolaydır.

## Testler

İş mantığı, metinler, tuş takımı ve yedekleme saf olduğu için derlemesiz test edilir: `tests/index.html`'i tarayıcıda aç (yerelde ya da yayındaki adreste `/tests/`). Sayfa başlığı ve üst satır sonucu söyler; kalan test varsa beklenen ve gelen değeri yazar.

## Yol haritası

- [x] Hesap kesim gününü arayüzden değiştirme
- [x] Alt sekme çubuğu ve ayrı Harcamalar ekranı
- [x] Özet: dönem hedefi, ilerleme halkası, devam eden taksitler
- [x] Günlük / ekstre harcama grafiği
- [x] JSON yedekleme / geri yükleme
- [x] CSV dışa aktarma
- [x] PWA (manifest ve service worker) ile ana ekrana ekleme
- [x] Kayıt düzenleme ve geçmiş tarihli ekleme
- [x] Çekirdek testleri
- [x] Kategoriler (seçilir, isme göre hatırlanır)
- [ ] Güçlü kategori tahmini
- [x] Abonelikler (her ay kendiliğinden yazılır, günlük harcamaya girmez)
- [ ] Tutarı hatırlayan çipler
- [ ] Dönem sonu tahmini ve ekstre kapanış özeti
- [ ] Son ödeme günü ve kart limiti
- [ ] İlk açılış rehberi
- [ ] Çoklu kart

## Teknoloji

Saf HTML5, CSS3 ve ES6 JavaScript. Font: cihazın sistem fontu (iPhone'da SF Pro).

## Geliştirici notları

Ekranların ayrıntılı davranışı ve kararların gerekçeleri. Genel kurallar (mimari, veri modeli, tasarım dili, çalışma kuralları) `CLAUDE.md`'de.

### Sekmeler ve ana sayfa

- Sekmeler: Ana Sayfa (`home`), Harcamalar (`list`), Özet (`summary`), Ayarlar (`settings`). Geçiş `TabBar.show(name)` ile; router/hash yok. Parmak çubukta sağa sola gezdirilebilir (iOS 26 / Instagram gibi; `Touch.trackDrag`): kapsül parmağı izler (`--pill-x`), basılı mercek gibi biraz büyür, parmağın altındaki sekme vurgulanır ama sayfa değişmez (gezinirken arka plan oynamasın); parmak kalkınca o sekme açılır, kapsül yaylanarak yerine oturur. Dokunuş iptal edilirse açık sekmede kalır. Çubuk `touch-action: none`.
- Ana sayfa sırası: tek özet kartı ("Bu dönem" + dönem aralığı büyük, "Bugün" sağda küçük; "Bugün" o gün yapılan harcama, önceki alışverişlerin dönemin ilk gününe düşen taksitleri ve abonelik çekimleri girmez, `Domain.isDaily`) → son harcamalar → tutar ekranı ve tuş takımı (altta, başparmak bölgesinde). Son harcamalar kaymaz, panele yaslanır; ekranın fazla yerini liste alır: `HomeView.fit()` en fazla `Config.RECENT_MAX` (5) satırdan tam sığanları gösterir, artan boşluk bir satırdan az kalır (ana ekran uygulamasında iPhone 15'te 5, SE'de 2). Satırlarda saat değil tarih etiketi (`Format.shortWhen`: Bugün / Dün / 5 Eki).
- Kayan haneler (`RollingText`): ana sayfadaki "Bu dönem" ve "Bugün" ekleme, silme ve geri almada değişince sadece değişen haneler kayar (iPhone'un sayı geçişi gibi): artınca eskisi yukarı çıkıp solar, yenisi alttan gelir; azalınca tersi, soldan sağa `Config.ROLL_STAGGER_MS` gecikmeyle. ₺ sabit. Hareket bitince düz metin olur. Açılışta, sekme dönüşünde ve uygulama öne gelince oynamaz (`model.animate`); "Hareketi Azalt"ta anında.

### Giriş (iki adım)

- Giriş iki adım (iki klavye hiç aynı anda görünmez; ekran elin sırasıyla ilerler: önce tutar, sonra isim):
  - **1. Tutar (`EntryPanel`):** tuş takımıyla tutar, altın "Devam" (tutar yokken bir şey yapmaz). Devam basma efektini `pointerdown`'da, geçişi `click`'te yapar: isim adımının klavyesi ancak dokunuşun içinden açılır.
  - **2. İsim (`NameSheet`, alttan panel):** başlıkta ‹ + girilen tutar (dokununca tutara döner, tutar silinmez) ve sağda "Ekle"; yazı alanı (klavye kendiliğinden açılır, klavyedeki Bitti = Ekle); altında sık kullanılan isim çipleri (`Domain.frequentNames`: en çok girilen önce, en fazla `Config.NAME_CHIPS_MAX`; yana kayan tek sıra, yazdıkça süzülür) en altta tek satır özet (`.picks`): kategori · taksit · tarih değer etiketleri (`.tok`; varsayılan: "Kategori" soluk · Tek çekim · Bugün; varsayılandan farklı değer altın). Bir etikete dokununca satır **yerinde** o seçiciye döner (kategori şeridi `CategoryChoice`, taksit `.inst-selector`: tek çekim, 2x, 3x, 6x, 12x, tarih `DateChoice`: "Bugün · Dün · Takvim"), seçince özete geri döner; dördü aynı 40px'lik yeri paylaşır, yumuşak geçişle değişir, panel hiç zıplamaz. Seçicilere dokunmak yazı alanının odağını almaz (`pointerdown`/`mousedown` engellenir, Takvim'in tarih alanı hariç): klavye kapanıp panel düşmez. İsim çipi sırası yazarken eşleşen kalmasa da yerini korur (`.empty`, görünmez). Kategori isim yazıldıkça hatırlanırsa gelir (elle seçildiyse dokunulmaz); her açılışta seçilmemiş, tek çekim, bugün. Kategori Abonelik ve tek çekimse ödeme etiketi "Her ay" olur (altın): kayıt abonelik olarak yazılır (`Domain.subscriptionEntry`, `sub: true`), her ay kendiliğinden tekrar eder. Geçmiş bir gün seçilirse o günden beri çekimler yazılır (süren bir aboneliği girmenin yolu). Takvim'in üstünde görünmez `<input type="date">` var: dokununca iPhone'un kendi tarih seçicisi açılır, gelecek gün seçilemez (`max` bugün), seçilen gün düğmede yazar ("5 Eki"). Seçilen gün kesilmiş bir döneme düşerse tarih etiketinin içinde yazar ("5 Eki · Ekim ekstresine", `Format.dayChoice`; ayrı not satırı açılıp panel zıplamasın; düzenlemede alttaki not satırında). Kayıt seçilen güne şimdiki saatle yazılır (`Domain.atDay`); yeni kayıt son harcamalardaysa kısa hareketle gösterilir (`HomeView.flash(id)`). Çipe dokunmak kaydı hemen ekler (`click`: şerit kayarken yanlışlıkla eklenmesin); kategorisi elle seçilen, yoksa o isme hatırlanan, o da yoksa Diğer. İsim boşsa "Adsız". Klavye açıkken panel klavyenin hemen üstünde: iPhone klavyesi sayfayı küçültmez, üstüne biner; `Device.watchKeyboard` görünen alandan (visualViewport) klavyenin kapladığı yeri verir, panel `--kb` ile kayar (bu `BottomSheet`'te: tüm paneller böyle).
  - **Ekledikten sonra** geri alma kapsülü yok (en sık işlem; her seferinde bildirim yorar ve görmezden gelinmeye başlar): onayı yeni satırın kısa hareketi, kayan toplam ve titreşim verir. Yanlış çipe dokunulduysa yeni satır sola kaydırılıp silinir (silme geri alınabilir).

### Geri alma kapsülü

- Geri alma kapsülü (`UndoBar`, silme ve düzenleme; eklemede yok): her sekmede ekranın tepesinde, Dynamic Island gibi tepedeki siyahtan büyüyen siyah kapsül (ana ekran uygulamasında durum çubuğu düz siyah, kapsül onunla bütünleşir; kapalıyken ortada ince siyah şerit, `clip-path` ile açılır, kapanırken geri büzülüp yukarı çekilir; yerleşim değil `clip-path`/`transform` hareket eder). Yumuşak siyah: üstte çok hafif ışık, ince kıl çerçeve. Solda işlemi söyleyen ince çizgili ikon, dairesiz (silme soluk kırmızı çöp, düzenleme kalem), ortada `Format.undoTitle` ("Netflix silindi") ve tutar (düzenlemede değiştiyse `Format.change`: "₺320 → ₺298"), sağda kutusuz düz altın "Geri al"; kalan süre (`Config.UNDO_MS`) kapsülün altında incecik yarı saydam altın kıl çizgi, ortadan iki yana kısalır (`.undo-hair`). Basılı tutunca süre durur, bırakınca devam eder (en az `UNDO_MIN_MS`); yukarı itince (`UNDO_SWIPE_PX`) hemen kapanır. Ana sayfada özet kartının üstünü örttüğü için kayan haneler bitmek üzereyken açılır (`Config.UNDO_DELAY_MS`: kapsül tepeden karta inene kadar haneler oturur; açık sekmeyi `App` bilir, diğer sekmelerde beklemeden).

### Satır, silme, detay

- Satır: tek satır (46px, her yerde aynı): solda kategori ikonu (kategorinin renginde çizgi, nötr gömük kuyu; kategori yazıyla tekrarlanmaz), ortada isim + taksit etiketi, sağda küçük gri saat (Harcamalar; gün başlıkta yazar) / tarih (ana sayfa) ve tutar. ✕ yok.
- Silme: satırlar `.swipe` sarmalayıcısında; sola kaydırınca (`Touch.bindSwipe`, eşik `Config.SWIPE_DELETE_PX` / `SWIPE_DELETE_RATIO`) `onDelete` çağrılır, `App` siler ve geri alma kapsülünü açar ("Netflix silindi · ₺229 · Geri al"). Satır kalkar (sağ kenarı yuvarlanır, gölgesi düşer), altında gömük kuyu açılır; kuyuda satırdan ayrı yüzen bir hap (`.swipe-cap`, iOS 26 Mail gibi, çöp ikonlu; `ExpenseRow` kurar) satırın açtığı kadar büyür (`--reveal`; genişlik değil `clip-path`). Hap önce koyu; eşik geçilince (bırakırsan silinir, `.armed`) EKLE'nin metaliği gibi metalik şarap rengine döner, ikon satırın kenarına yapışıp sıçrar (`Config.SWIPE_ICON_EDGE_PX`), Android'de bir kez titrer (iPhone'da koddan titreşim yok, eşiği renk söyler). Kırmızının gücü sadece silinecek ana saklanır. Bırakınca satır çıkar, yeri kapanır (alttakiler yukarı kayar, `Config.SWIPE_COLLAPSE_MS`), sonra silinir. Kaydırma sadece başlatan parmağı (`pointerId`) izler. `pointercancel` bırakma sayılmaz (`Touch.trackDrag` `onCancel`): kayan listede (Harcamalar) parmak biraz dikey oynayınca iPhone listeyi kaydırmaya başlayıp dokunuşu iptal ediyordu, kod bunu bırakma sayıp eşik geçilmişse parmak kalkmadan siliyordu; şimdi satır yerine döner. Ayrıca yatay sürükleme başlayınca `touchmove` engellenir (passive değil), liste kaymayı devralmaz.
- Detay: satıra dokununca (kaydırma değilse) `onOpen` → `App` kaydı bulur → `DetailSheet.open(item, cutoff, now, remember)` alttan panel açar: toplam tutar, kategori, tarih, ödeme (tek çekim / n taksit × tutar), kalan taksit, "Harcamayı sil". Abonelikte tarih satırı "Başlangıç", ödeme "Her ayın 5'i", kalan yerine "Durum" ("Sıradaki 5 Kas" / "Bitti · 25 Eki") ve sürüyorsa sade "Aboneliği bitir" düğmesi: `onEnd(id)` → `App` `end` yazar (geçmiş çekimler kalır, sonrakiler olmaz), geri alma kapsülü "Netflix aboneliği bitti". Abonelik silinirse bütün çekimleri gider (taksit gibi). Zam olunca: aboneliği bitir, yeni tutarla yeniden gir (tutarı düzenlemek geçmiş çekimleri de değiştirir). Kapat düğmesi yok: panel aşağı çekilerek ya da arka plana dokunarak kapanır. Sağ üstte "Düzenle": aynı panel düzenleme haline geçer (`.detail-sheet.editing`; başlık Vazgeç · Düzenle · Kaydet, Kaydet üstte ki klavye açıkken görünsün): isim, kategori (`CategoryChoice`; isim değişince o isme hatırlanan kategori gelir, elle seçildiyse dokunulmaz), tutar (`Calc` kurallarıyla, virgül ondalık, binlik ayraçlı), taksit ve tarih (`DateChoice`, isim adımındakiyle aynı; kaydın saati korunur). Kaydet → `onSave(id, { name, amt, inst, ts, cat })` → `App` `Store.update` eder (id aynı kalır), geri alma kapsülü açılır ("Getir düzenlendi · ₺320 → ₺298"), geri alınca önceki hali döner. Taksit sayısı ya da tarih değişirse taksitler yeniden açılır.

### Harcamalar sekmesi

- Harcamalar sekmesi: dönem kartı (`.period`) ‹ › ile hesap dönemleri arasında gezer (`ListView` içindeki offset: 0 bu dönem, -1 geçen ...; en eski kaydın dönemine kadar). Kart yatay kaydırılarak da gezilir (`Touch.bindPager`: parmak sağa = önceki ekstre, sola = sonraki; sınırda %35 dirençle lastik; eşik `Config.PAGER_COMMIT_PX`; sadece kartta çalışır, satır silme ile çakışmaz; sınırlar okların `disabled` durumundan okunur). Kart etiketi: bu dönem "Bu dönem", geçmişler bittiği ayın ekstresi ("Eylül ekstresi", başka yılsa "Aralık 2025 ekstresi"; `Format.periodName`). Kartta toplam (önceki taksitler dahil) ve altında "Günlük ort." var (ana sayfadaki toplamla çakışmasın diye bağlam; sadece o dönemde yapılan harcamalar, önceki taksitler ilk günde toplanıp ortalamayı şişirmesin). Arama başlıktaki ikonla açılır, dönem kartının yerini alır ve tüm dönemlerde arar. Özet satırında adet yok: boşken "Tüm zamanlar · ₺X", yazınca eşleşenlerin "Toplam · ₺X".
- Dönem görünümünde abonelik çekimleri günlere girmez: dönemin altında "Abonelikler" grubunda (saatin yerinde çekimin günü), "Önceki taksitler"in üstünde; dönem toplamına girer, günlük ortalamaya girmez. Aramada kendi günlerinde durur.

### Özet sekmesi

- Özet sekmesi (`SummaryView`, ekran kayar, beş kart). Kart başlıkları Apple Sağlık tarzı kartın içinde (`.card-head`: beyaz başlık, sağda gri ikincil bilgi), ikonsuz; kartlar boşlukla ayrılır:
  - **Açılış hareketi:** uygulama açıldıktan sonra Özet'e ilk girişte bir kez (`SummaryView.reveal`, işaret sadece bellekte): halka sıfırdan dolar (`Config.RING_REVEAL_MS` 600), sütunlar tabandan yükselir (`BARS_REVEAL_MS` 350, toplam sıra gecikmesi `BARS_REVEAL_SPREAD_MS` 150, sütun sayısından bağımsız), kategori şeridi soldan uzar (`STACK_REVEAL_MS` 400). Sekmeden çıkıp dönünce ve arka plandan gelince oynamaz; uygulama kapatılıp açılınca yine oynar (iPhone uzun arka planda uygulamayı bellekten atarsa da). Günlük ↔ Ekstre geçişinde sütunlar her seferinde kısa yükselir (`BARS_SWITCH_MS` 250, `BARS_SWITCH_SPREAD_MS` 80; seçili olana dokununca oynamaz).
  - **Dönem hedefi:** `GoalRing` halkası harcanan / hedef oranı; durumu `Domain.goalProgress` hesaplar ve tempoya bakar: `ok` (altın), `warn` (harcama oranı dönemin geçen kısmını `Config.GOAL_PACE_SLACK` kadar aşmış, `--warn`; dönem sonunda %80 normal, başında %50 alarm), `over` (%100+, `--danger`, halkada "aşıldı"). Aynı bilgi ortadaki yüzde ve alt satırda yazıyla da var. Yanında harcanan / hedef / kalan (aşımda "Aşım"); alt satır `Format.goalHint`: "Günde ₺X ile hedefte kalırsın · n gün kaldı", tempo hızlıysa başında "Hızlı gidiyorsun", tam sınırda "Hedefin sınırındasın"; aşımda tutarı tekrar etmez, varsa "₺X önceki taksitlerden · n gün kaldı". Hedef yoksa halka boş, "Hedef koy". Halkaya dokununca `GoalSheet` açılır (click ile, iPhone klavyesi açılsın diye).
  - **Harcama grafiği:** `BarChart`, "Günlük | Ekstre" (`.seg`). Günlük: bu dönemin her günü bir sütun, o gün yapılan harcama; önceki alışverişlerin bu döneme yansıyan taksitleri (`Domain.isCarried`, dönemin ilk gününe düşer) sütuna girmez (abonelik çekimleri de girmez, notları da yok: Abonelikler kartında), düştüğü günün notunda yazar ("+₺7.000 önceki taksitler"), yoksa dönemin ilk günü tek dev sütun olup ölçeği ezer. Gelecek günler tabanda iz; bütçe çizgisi yok (hedef kartındaki dinamik "günde ₺X" ile çelişen sabit ikinci bir günlük sayı olurdu). Ekstre: son `Config.CHART_PERIODS` dönem; ilk kayıttan önceki dönemler (`Domain.dataSince`) ₺0 değil iz, dokununca "—" ve "Kayıt yok"; süren dönemin etiketi "Bu dönem · n gün kaldı" (yarım dönem tam sanılmasın). Hiç değer yoksa ölçek değeri yazılmaz. Hedef grafiğe çizilmez (kalabalık olmasın), dokunulan ekstrenin hedefe göre durumu okuma satırındaki not alanında (`Format.goalNote`: "%33 · hedef ₺9.500" / "₺1.200 aştı · hedef ₺9.500"). Not alanının yeri iki görünümde de ayrılır (geçişte grafik zıplamaz). Grafiğin içinde çizgi/yazı kalabalığı yok: sadece üstte ölçek değeri ve altta seçici tarih etiketleri. Tek seri, tüm sütunlar altın; seçili tam, diğerleri soluk; dokununca üstteki okuma satırında etiket + değer (+ varsa not). Sütun en fazla `BAR_MAX_W`, 4px yuvarlak uç, 2px aralık, ızgara düz kıl çizgi. Basılı tutma yok: dokunma yeterli, basılı tutma iPhone'da görünmez ve Safari'nin seçim menüsüyle çakışır. Gizliyken çizilmez; sekme açılınca / ekran değişince `redraw()`.
  - **Kategoriler:** üstte renkli oran şeridi (iPhone depolama ekranı gibi; her kategori kendi renginde, payı kadar, kapalı satırlar dahil hepsi); altında bu dönem kategori başına satır (taksit kartıyla aynı kalıp): ikon (satırdakiyle aynı: renkli çizgi, nötr kuyu), ad ve altında pay ("%36"), tutar ve altında geçen dönemin aynı gününe göre değişim ("↑ ₺550" amber, "↓ ₺230" yeşil, "aynı" gri; `Format.categoryDelta`). Üstte cümle (`Format.categoryInsight`): "Geçen dönemin aynı gününe göre Ulaşım ₺550 fazla, Yeme-içme ₺230 az." (`Domain.categoryHighlights`; hepsi aynıysa "Geçen dönemle aynı tempodasın", kıyas yoksa cümle yok). Kapalıyken ilk `Config.CAT_VISIBLE` (4) satır, fazlası "n kategori daha ⌄" ile açılır (taksit kartıyla aynı düğme).
  - **Abonelikler** (kategoriler ile taksitler arasında; kart hep yerinde, hiç abonelik yoksa taksit kartı gibi "Devam eden abonelik yok"): taksit kartının kalıbı. Üstte "Her ay" toplamı (hedef varsa altında payı, `Format.goalShare`) ve "Yılda" (aylık × 12), başlığın sağında adet; altında süren abonelikler (`Domain.activeSubscriptions`, sıradaki çekimi yakın olan önce): ikon, ad, altında "Sıradaki 5 Kas" (`Format.subNext`; `Config.SUB_SOON_DAYS` içindeyse altın), tutar. Satıra dokununca kayıt detayı açılır. Biten abonelik listede yok.
  - **Devam eden taksitler:** üstte sonraki dönemin ekstresine şimdiden yazılan taksitler, ay adıyla ("Kasım ekstresine", `Format.intoStatement`; "gelecek ekstre" denmez, bankacılıkta o bu dönemin ekstresidir; `Domain.installmentsBetween`), hedef varsa altında payı ("hedefin %74'ü", `Format.goalShare`, iyelik eki `Format.possessive`), yanında "Toplam kalan"; altında alışveriş başına isim, `ödenen/toplam · taksit tutarı`, ince ilerleme çubuğu, kalan tutar (`Domain.activeInstallments`). Satıra dokununca kayıt detayı açılır. Liste kalan tutara göre sıralı; kapalıyken ilk `Config.INST_VISIBLE` (3) satır görünür, fazlası en alttaki "n taksit daha ⌄" satırıyla aynı kartın içinde açılır ("Daha az göster", ok yukarı döner; durum `SummaryView`'de). Aşağı ok "bu kartta açılır" demek, "›" başka ekrana geçiş. Kartın yeri sabit (hedef → grafik → kategoriler → taksitler).

### Alttan paneller

- Alttan paneller (`BottomSheet`) parmakla aşağı çekilerek de kapanır (`Touch.bindDismiss`): panel parmağı izler, arka plan kaydıkça solar, yukarı çekince direnir; `Config.SHEET_DISMISS_PX` / `SHEET_DISMISS_RATIO` kadar ya da hızlı (`SHEET_FLICK_V`) çekilince kapanır, yoksa yerine yaylanır. Panel `touch-action: pan-x` (çip şeridi yana kaymaya devam eder). Sürükleme bitince parmağın altındaki düğme tıklanmış sayılmaz. Her kapanış kayarak olur (`.sheet-wrap.closing`, `Config.SHEET_CLOSE_MS`).

### Ayarlar

- Ayarlar sekmesi: "Dönem" bölümünde iki satır, ikisi de aynı kalıp (değer + "›", dokununca alttan panel):
  - **Hesap kesim günü** ("Ayın 13'ü", `Format.cutoffDay`): `CutoffSheet` ayın 1–28. günlerini 7 sütunda tam 4 satır gösterir (iOS Hatırlatıcılar "her ay" seçicisi gibi; stepper yok: 15'ten 1'e 14 dokunuş olurdu). Gün adı ve ay başlığı yok: kesim belirli bir tarih değil her ay tekrar eden gün, gerçek takvim yanlış ipucu verir (haftanın günü, "Ekim 2026", boş hücreler, seçilemeyen 29–31). Kutusuz düz rakamlar; seçili gün metalik altın daire (EKLE ile aynı malzeme), bugün rakamın altında nokta. Tarih bilgisini alttaki iki satır taşır: "Bu dönem" aralığı ve "Sonraki kesim" (`Format.nextCutoff`: "12 Eki · 2 gün sonra"). Her dokunuşta anında güncellenir, "Kaydet"e kadar uygulanmaz. Not satırı kesim gününün dahil olduğunu ve geçmiş dönemlerin yeniden hesaplandığını söyler.
  - **Dönem hedefi** ("Her ekstre için harcama sınırın"): `GoalSheet`. Geçmiş veri varsa kutunun altında öneri: biten son `Config.GOAL_SUGGEST_PERIODS` ekstrenin ortalaması, `GOAL_SUGGEST_ROUND`'a yuvarlı ("Son 3 ekstre ortalaması ≈ ₺8.900 · Kullan", `Domain.goalSuggestion`). "Hedefi kaldır" kırmızı değil sade yazı düğmesi (`.plain-btn`): geri alınabilir iş; kırmızı (`.danger`) sadece silmede.
- Ayarlar'ın başında "Uygulama" bölümü: uygulama ana ekrandan açılmadıysa (`Device.isStandalone`) "Ana ekrana ekle" yönergesi (Safari'deki Paylaş işaretiyle; iPhone bunu kendisi önermez, ana ekrandan açılınca gizlenir) ve "Titreşim" anahtarı (`.toggle`: kapalıyken gömük iz, açıkken EKLE'nin metalik altını; açılınca bir kez titrer).
- "Veri" bölümü (satırlar `click` ile: paylaşım menüsü ve dosya seçici ancak dokunuşun içinden açılır):
  - **Yedekle:** harcamalar + kesim günü + hedef tek JSON (`harcama-yedek-2026-10-10.json`). Dokunmatikte iPhone paylaşım menüsü (Dosyalar, iCloud, mesaj), bilgisayarda indirme (`Device.saveFile`). Paylaşımdan vazgeçilirse yedek sayılmaz. Altında "Son yedek: 12 gün önce"; kayıt varken hiç yedek yoksa ya da `Config.BACKUP_WARN_DAYS` (30) geçtiyse uyarı rengi (`Domain.backupDue`).
  - **Yedekten geri yükle:** dosya seçilir, kayıtlar birleştirilir (`Backup.merge`: aynı id iki kez eklenmez), yedekteki kesim günü ve hedef alınır (hedef yedekte yoksa mevcut korunur). Sonuç kartın altındaki durum satırında ("12 kayıt eklendi · 3 kayıt zaten vardı"); bozuk dosyada kırmızı hata. Telefon değiştirme ve bilgisayardan telefona taşıma bu yolla.
  - **CSV olarak dışa aktar:** alışveriş başına satır; Türkçe Excel için `;` ayırıcı, ondalık virgül, binlik ayraç yok, UTF-8 BOM.
- "Tümünü sil" Ayarlar'dadır ve iki dokunuşla onaylanır (2,5 sn içinde).

### Ana ekran uygulaması, çevrimdışı, açılış

- Ana ekran uygulaması: `index.html`'de iOS meta etiketleri (tam ekran, durum çubuğu `black`: düz siyah, içerik altından başlar; sebebi CLAUDE.md'deki "Düzen sabit" notunda), `manifest.webmanifest`, `apple-touch-icon`. `App` açılışta `Device.registerOffline()` (sadece http(s); `file://`'da yok) ve `Device.persistStorage()` çağırır. Safari, ana ekrana eklenmemiş sitelerin verisini 7 gün kullanılmazsa silebilir; ana ekran uygulaması bundan muaf, yedekleme ikinci güvence.
- Çevrimdışı katman (`sw.js`): önce ağ (yeni sürüm hemen gelsin), ama ağ `NETWORK_WAIT_MS` (2,5 sn) içinde yanıt vermezse önbellekteki sürümle açılır (kasada zayıf çekimde açılış takılmasın); geç gelen yanıt yine önbelleğe yazılır, yeni sürüm sonraki açılışta gelir. İnternet hiç yoksa doğrudan önbellek.
- Açılış ekranı (`#splash`): `App` kurulana kadar `--bg` zeminde ikondaki metalik altın kart; dönen/bekleme animasyonu yok. Stili `index.html`'de satır içi (css/ dosyalarını beklemesin). `App` kurulumun sonunda `body.ready` verir, kısa geçişle kalkar; kurulum hata verirse 6 sn sonra kendiliğinden çekilir.

### Bilinen sınırlar / fikirler

Bekleyen bilinen konular (2026-10-12 genel kontrolünden):

- Takvim düğmesinin iPhone'un tarih seçicisini açması önizlemede denenemez; telefonda doğrulanacak.
- İki adımlı girişte isim panelinin klavyenin üstüne oturması ve klavyenin Devam'la kendiliğinden açılması önizlemede denenemez (iPhone klavyesi yok); telefonda doğrulanacak. Sırada: tutarı da hatırlayan çipler (ör. Netflix ₺229).
- Aramada önceki taksit satırları kendi günlerinde durur (gün başlığı onları da toplar); ayrı grup sadece dönem görünümünde.
- Titreşimin iPhone'da çalıştığı ve panelin parmakla çekilmesi önizlemede denenemez (iPhone yok); telefonda doğrulanacak.
- Hedef önerisi (`Domain.goalSuggestion`) ve ekstre grafiği, kayıtların başladığı yarım ilk dönemi tam ekstre gibi sayıyor; öneri olduğundan düşük çıkabilir. Şimdilik bekliyor.

#### Sunucuya / gerçek zamanlı veriye geçiş (tasarım ve Faz 3'ten sonra)

Hedef: Supabase veya Firebase gibi CDN'den yüklenebilen, girişi ve gerçek zamanlı güncellemeyi sağlayan bir servis. Ayrı sunucu yazılmaz, derleme adımı eklenmez.

- Kolaylaştıran: veri sadece `Store` üzerinden ve sadece `App`'ten geçiyor; `App.refresh()` her değişimde baştan çiziyor (gerçek zamanlı dinleyici → `App.refresh()`); taksit/dönem hesapları istemcide, sunucuda sadece ham kayıtlar durur; id'ler cihazlar arası çakışmaz.
- Değişecekler: `Store` asenkron olur (etkisi `app.js` ile sınırlı: ekleme, silme, geri alma, açılış beklemeli); kullanıcı girişi; uygulama bir adreste yayınlanır (`file://` ile giriş çalışmaz, ör. GitHub Pages); `localStorage`'daki kayıtlar ilk girişte bir kez yüklenir (Faz 3'teki JSON yedekleme buna temel olur); çevrimdışı davranış seçilir; sunucuda "herkes sadece kendi verisini görür" kuralı yazılır.
- Ayarlar da taşınır: `cutoff_day_v1` ve `goal_v1` kullanıcı başına senkronlanmalı.
