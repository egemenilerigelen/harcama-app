# Harcama

Kredi kartı harcamalarını hızlıca kaydetmek için geliştirilmiş, mobil öncelikli ve framework'süz bir web uygulaması. Tutarı hesap makinesi tuş takımıyla gir, isim ver, taksit seç ve ekle. Veriler cihazında kalır, sunucu gerekmez. iPhone'da ana ekrana eklenip kurulu bir uygulama gibi, internetsiz kullanılır.

## Özellikler

- **Hızlı giriş, iki adım:** Önce tutar: ana sayfanın altında, başparmak bölgesinde hesap makinesi tuş takımı (en fazla 9 hane ve 2 ondalık), "Devam". Sonra isim: alttan açılan panelde yazı alanı ve en sık girdiğin isimler; isme dokunmak kaydı hemen ekler. Altında tek satır özet (kategori · taksit · tarih; varsayılan tek çekim ve bugün): değiştirmek istediğine dokununca o satır yerinde seçiciye döner, panel zıplamaz. Eklenen kayıt listede kısa bir hareketle belirir, toplam kayarak güncellenir.
- **Kategoriler:** İsim adımında seçilir; bir isme verdiğin kategori o isim için hatırlanır (Migros'a bir kez Market dersen sonra hep Market gelir). Uygulama kendisi tahmin etmez. Özet'te bu dönemin kategori dağılımı (iPhone depolama ekranı gibi renkli şerit) ve geçen dönemin aynı gününe göre değişim ("Ulaşım ₺550 fazla").
- **Taksit desteği:** İsim adımında tek çekim, 2x, 3x, 6x ve 12x. Taksitler hesap kesim günlerine göre aylara dağıtılır ve listede `1/3 taksit` gibi etiketlenir. Önceki alışverişlerin bu döneme düşen taksitleri dönem toplamına girer ama gün toplamlarına ve günlük ortalamaya girmez; Harcamalar'da dönemin altında ayrı grupta durur.
- **Abonelikler:** İsim adımında Abonelik kategorisi seçilince (tek çekim) ödeme "Her ay" olur: bir kez girilir, her ay aynı gün aynı tutarla kendiliğinden yazılır, detaydan "Aboneliği bitir" denene kadar sürer. Taksit gibi dönem toplamına girer ama günlük harcamaya (Bugün, günlük grafik, gün başlıkları, günlük ortalama) girmez; Harcamalar'da dönemin altında kendi grubunda durur. Özet'te aylık ve yıllık toplam, abonelik başına sıradaki çekim. Hedefin "günde ₺X" tutarı dönemin kalanına düşecek abonelik çekimleri ayrıldıktan sonra hesaplanır.
- **Alt sekme çubuğu:** Ana Sayfa, Harcamalar, Özet ve Ayarlar. iOS 26'daki gibi havada duran cam çubuk; içerik arkasından akar, seçili sekmenin kapsülü kayarak geçer. İkonlar (Heroicons) dokununca ya da parmak üstlerinden geçince kısa bir hareket oynar.
- **Özet kartı:** Harcama ekleyip silince toplamların sadece değişen haneleri kayar (iPhone'un sayı geçişi gibi). İçinde bulunulan hesap dönemi (kesim gününün ertesinden kesim gününe, kesim günü dahil) toplamı ve tarih aralığı, yanında bugün yapılan harcama (önceki alışverişlerin bu döneme düşen taksitleri hariç).
- **Özet sekmesi:** Dönem hedefi halkası (yüzde, kalan, "Günde ₺X harcayabilirsin"; doldukça altından turuncuya, kırmızıya ısınır), adım sayacı tarzı günlük / ekstre sütun grafiği (kayan seçiciyle; tek dev gün ölçeği ezmez), geçmiş ekstrelerin özeti (‹ › ya da kaydırarak, her biri kendi hedefiyle), kategoriler, abonelikler, devam eden taksitler (sonraki ekstreye şimdiden yazılan, toplam kalan, alışveriş başına ilerleme).
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
- [x] Dönem sonu tahmini ve ekstre kapanış özeti
- [ ] Son ödeme günü ve kart limiti
- [ ] İlk açılış rehberi
- [ ] Çoklu kart

## Teknoloji

Saf HTML5, CSS3 ve ES6 JavaScript. Font: cihazın sistem fontu (iPhone'da SF Pro).

## Geliştirici notları

İş kuralları, tasarım dili, ekranların ayrıntılı davranışı ve kararların gerekçeleri `docs/` klasöründe, konu başına bir dosya. Mimari ve çalışma kuralları `CLAUDE.md`'de.

| Konu | Dosya |
|---|---|
| İş kuralları | [docs/is-kurallari.md](docs/is-kurallari.md) |
| Tasarım dili | [docs/tasarim.md](docs/tasarim.md) |
| Sekmeler ve ana sayfa | [docs/ana-sayfa.md](docs/ana-sayfa.md) |
| Giriş (iki adım) | [docs/giris.md](docs/giris.md) |
| Geri alma kapsülü | [docs/geri-alma.md](docs/geri-alma.md) |
| Satır, silme, detay | [docs/satir.md](docs/satir.md) |
| Harcamalar sekmesi | [docs/harcamalar.md](docs/harcamalar.md) |
| Özet sekmesi | [docs/ozet.md](docs/ozet.md) |
| Alttan paneller | [docs/paneller.md](docs/paneller.md) |
| Ayarlar | [docs/ayarlar.md](docs/ayarlar.md) |
| Ana ekran uygulaması, çevrimdışı, açılış | [docs/pwa.md](docs/pwa.md) |
| Bilinen sınırlar / fikirler | [docs/sinirlar.md](docs/sinirlar.md) |
