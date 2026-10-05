# Harcama

Kredi kartı harcamalarını hızlıca kaydetmek için geliştirilmiş, mobil öncelikli ve framework'süz bir web uygulaması. Tutarı hesap makinesi tuş takımıyla gir, isim ver, taksit seç ve ekle. Veriler cihazında kalır, sunucu gerekmez.

## Özellikler

- **Hızlı giriş:** Üstte sabit hesap makinesi tuş takımı. En fazla 9 hane ve 2 ondalık.
- **Taksit desteği:** Tek çekim, 2x, 3x, 6x ve 12x. Taksitler hesap kesim günlerine göre aylara dağıtılır ve listede `💳 1/3 Taksit` gibi etiketlenir.
- **Özet kartlar:** Bugünün toplamı ve içinde bulunulan hesap dönemi (kesim gününden itibaren) toplamı.
- **Günlere göre liste:** Harcamalar tarihe göre gruplanır, gün toplamı gösterilir. Tek tek silinebilir.
- **Güvenli toplu silme:** "Tümünü sil" iki dokunuşla onaylanır.
- **Dokunmatik uyumlu:** Tuşlarda titreşim geri bildirimi ve basma efekti. Sayfa kaymaz, sadece liste kayar.
- **Çevrimdışı:** Veriler tarayıcının `localStorage` alanında tutulur.
- **Koyu glassmorphism tema:** Buzlu cam kartlar, altın vurgu rengi.

## Başlarken

Derleme veya kurulum gerekmez.

1. Depoyu indir:
   ```bash
   git clone https://github.com/egemenilerigelen/harcama-app.git
   ```
2. `index.html` dosyasını tarayıcıda aç.

Telefonda denemek için sayfayı mobil tarayıcıda aç ya da masaüstü tarayıcıda geliştirici araçlarından mobil görünüme geç. Fontlar Google Fonts'tan yüklenir; internet yoksa sistem fontlarına düşer.

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
    └── main.js       tuş takımı, taksit seçimi, ekleme, silme
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

Hesap kesim günü `cutoff_day_v1` anahtarında tutulur (varsayılan 15). `Store` nesnesi veri erişimini soyutladığı için ileride başka bir depolamaya geçmek kolaydır.

## Yol haritası

- [ ] Hesap kesim gününü arayüzden değiştirme
- [ ] Limit ve kalan limit
- [ ] Kategoriler
- [ ] Kayıt düzenleme
- [ ] CSV dışa aktarma
- [ ] Çoklu kart
- [ ] PWA (manifest ve service worker) ile ana ekrana ekleme

## Teknoloji

Saf HTML5, CSS3 ve ES6 JavaScript. Fontlar: Orbitron, Space Grotesk, Inter.
