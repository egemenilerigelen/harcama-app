# Harcama

Kredi kartı harcamalarını hızlıca kaydetmek için geliştirilmiş, mobil öncelikli ve framework'süz bir web uygulaması. Tutarı hesap makinesi tuş takımıyla gir, isim ver, taksit seç ve ekle. Veriler cihazında kalır, sunucu gerekmez. iPhone'da ana ekrana eklenip kurulu bir uygulama gibi, internetsiz kullanılır.

## Özellikler

- **Hızlı giriş:** Ana sayfanın altında, başparmak bölgesinde hesap makinesi tuş takımı. En fazla 9 hane ve 2 ondalık.
- **Taksit desteği:** İsim alanının yanındaki düğmeden tek çekim, 2x, 3x, 6x ve 12x. Taksitler hesap kesim günlerine göre aylara dağıtılır ve listede `1/3 taksit` gibi etiketlenir.
- **Alt sekme çubuğu:** Ana Sayfa, Harcamalar, Özet ve Ayarlar. iOS 26'daki gibi havada duran cam çubuk; içerik arkasından akar, seçili sekmenin kapsülü kayarak geçer.
- **Özet kartı:** İçinde bulunulan hesap dönemi (kesim gününün ertesinden kesim gününe, kesim günü dahil) toplamı ve tarih aralığı, yanında bugün yapılan harcama (önceki alışverişlerin bu döneme düşen taksitleri hariç).
- **Özet sekmesi:** Dönem hedefi halkası (yüzde, kalan, "günde ₺X ile hedefte kalırsın"), adım sayacı tarzı günlük / ekstre sütun grafiği, devam eden taksitler (sonraki ekstreye şimdiden yazılan, toplam kalan, alışveriş başına ilerleme).
- **Son harcamalar:** Ana sayfada en son eklenen kayıtlar; "Tümünü gör" ile Harcamalar sekmesine geçilir.
- **Harcamalar sekmesi:** Hesap dönemleri (ekstreler) arasında ‹ › ile ya da dönem kartını kaydırarak gezinme, dönem toplamı ve günlük ortalama, günlere göre gruplu liste. Arama ikonu tüm dönemlerde arar.
- **Kayıt detayı:** Satıra dokununca toplam tutar, tarih, taksit planı ve kalan taksitler. Silme detaydan ya da satırı sola kaydırarak; silme geri alınabilir.
- **Ayarlar:** Ana ekrana ekleme yönergesi (Safari'den açılınca), hesap kesim günü (1–28, gün seçiciden tek dokunuşla; seçilen dönemin aralığı ve sonraki kesim tarihi önizlenir), dönem hedefi (geçmiş ekstrelerin ortalamasından öneriyle), yedekleme ve iki dokunuşla onaylanan "Tümünü sil". En altta sürüm etiketi.
- **Dokunmatik uyumlu:** Tuşlarda titreşim geri bildirimi ve basma efekti. Sayfa kaymaz, sadece listeler kayar.
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
├── css/
│   └── style.css         tüm tasarım (renk, font ve boşluk değişkenleri :root'ta)
└── js/
    ├── core/             çekirdek, DOM'a dokunmaz
    │   ├── config.js     sabitler
    │   ├── storage.js    Store: localStorage katmanı
    │   ├── calc.js       Calc: tutar girişi
    │   ├── domain.js     iş mantığı: dönem, taksit, toplamlar, hedef (saf fonksiyonlar)
    │   ├── format.js     para ve tarih metinleri (saf)
    │   └── backup.js     JSON yedeği ve CSV
    ├── ui/               ortak bileşenler: dokunma, cihaz, satır, geri alma, alttan paneller, halka, grafik
    ├── views/            ekranlar: giriş paneli, ana sayfa, harcamalar, özet, ayarlar, sekmeler
    └── app.js            bileşenleri kurar ve bağlar
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

Hesap kesim günü `cutoff_day_v1` (varsayılan 15), dönem hedefi `goal_v1`, son yedeğin zamanı `backup_at_v1` anahtarında tutulur. `Store` nesnesi veri erişimini soyutladığı için ileride başka bir depolamaya geçmek kolaydır.

## Yol haritası

- [x] Hesap kesim gününü arayüzden değiştirme
- [x] Alt sekme çubuğu ve ayrı Harcamalar ekranı
- [x] Özet: dönem hedefi, ilerleme halkası, devam eden taksitler
- [x] Günlük / ekstre harcama grafiği
- [x] JSON yedekleme / geri yükleme
- [x] CSV dışa aktarma
- [x] PWA (manifest ve service worker) ile ana ekrana ekleme
- [ ] Kayıt düzenleme
- [ ] Kategoriler
- [ ] Çoklu kart

## Teknoloji

Saf HTML5, CSS3 ve ES6 JavaScript. Font: cihazın sistem fontu (iPhone'da SF Pro).
