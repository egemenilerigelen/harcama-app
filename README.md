# Harcama

Kredi kartı harcamalarını hızlıca kaydetmek için geliştirilmiş, mobil öncelikli ve framework'süz bir web uygulaması. Tutarı hesap makinesi tuş takımıyla gir, isim ver, taksit seç ve ekle. Veriler cihazında kalır, sunucu gerekmez.

## Özellikler

- **Hızlı giriş:** Üstte sabit hesap makinesi tuş takımı. En fazla 9 hane ve 2 ondalık.
- **Taksit desteği:** İsim alanının yanındaki düğmeden tek çekim, 2x, 3x, 6x ve 12x. Taksitler hesap kesim günlerine göre aylara dağıtılır ve listede `1/3 taksit` gibi etiketlenir.
- **Alt sekme çubuğu:** Ana Sayfa, Harcamalar, Özet ve Ayarlar. iPhone home çubuğu için güvenli alan bırakır.
- **Özet kartı:** İçinde bulunulan hesap dönemi (kesim gününden itibaren) toplamı ve tarih aralığı, yanında bugünün toplamı.
- **Son harcamalar:** Ana sayfada en son eklenen kayıtlar; "Tümünü gör" ile Harcamalar sekmesine geçilir.
- **Harcamalar sekmesi:** Hesap dönemleri arasında ‹ › ile gezinme, dönem toplamı ve günlük ortalama, günlere göre gruplu liste. Arama ikonu tüm dönemlerde arar.
- **Kayıt detayı:** Satıra dokununca toplam tutar, tarih, taksit planı ve kalan taksitler. Silme detaydan ya da satırı sola kaydırarak; silme geri alınabilir.
- **Ayarlar:** Hesap kesim günü (1–28) ve iki dokunuşla onaylanan "Tümünü sil".
- **Dokunmatik uyumlu:** Tuşlarda titreşim geri bildirimi ve basma efekti. Sayfa kaymaz, sadece listeler kayar.
- **Çevrimdışı:** Veriler tarayıcının `localStorage` alanında tutulur.
- **Sade koyu tema:** Düz yüzeyler, altın sadece vurgu için. Sistem fontu, çevrimdışı da aynı görünür.

## Başlarken

Derleme veya kurulum gerekmez.

1. Depoyu indir:
   ```bash
   git clone https://github.com/egemenilerigelen/harcama-app.git
   ```
2. `index.html` dosyasını tarayıcıda aç.

Telefonda denemek için sayfayı mobil tarayıcıda aç ya da masaüstü tarayıcıda geliştirici araçlarından mobil görünüme geç. Dış font yüklenmez; cihazın sistem fontu kullanılır.

## Proje yapısı

```
harcama-app/
├── index.html        iskelet ve script sırası
├── css/
│   └── style.css     tüm tasarım (renk ve font değişkenleri :root'ta)
└── js/
    ├── storage.js    Store: localStorage katmanı
    ├── calc.js       Calc: tutar girişi
    ├── ui.js         biçimlendirme yardımcıları, liste ve toplam çizimi
    └── main.js       tuş takımı, taksit seçimi, ekleme, sekmeler, ayarlar
```

Script sırası önemlidir: `storage → calc → ui → main`. Dosyalar global değişken kullanır ve ES modülü değildir; bu sayede `file://` ile doğrudan açılır.

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

Hesap kesim günü `cutoff_day_v1` anahtarında tutulur (varsayılan 15, Ayarlar'dan değiştirilir). `Store` nesnesi veri erişimini soyutladığı için ileride başka bir depolamaya geçmek kolaydır.

## Yol haritası

- [x] Hesap kesim gününü arayüzden değiştirme
- [x] Alt sekme çubuğu ve ayrı Harcamalar ekranı
- [ ] Özet: aylık hedef, ilerleme halkası, yaklaşan taksitler
- [ ] Aylık harcama grafiği
- [ ] JSON yedekleme / geri yükleme
- [ ] Kategoriler
- [ ] Kayıt düzenleme
- [ ] CSV dışa aktarma
- [ ] Çoklu kart
- [ ] PWA (manifest ve service worker) ile ana ekrana ekleme

## Teknoloji

Saf HTML5, CSS3 ve ES6 JavaScript. Font: cihazın sistem fontu (iPhone'da SF Pro).
