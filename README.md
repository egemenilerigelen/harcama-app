# Harcama (kredi kartı takip)
Mobil öncelikli, framework'süz. `index.html`'i tarayıcıda aç; derleme gerekmez.

harcama-app/
  index.html        iskelet + script sırası
  css/style.css     tüm tasarım (renk/font değişkenleri :root'ta)
  js/storage.js     Store: localStorage, kayıt {id,name,amt,ts}, anahtar harcama:v1
  js/calc.js        Calc: rakam/nokta girişi (9 hane, 2 ondalık)
  js/ui.js          fmt, dk, dayLabel, renderAmount, renderList
  js/main.js        tuş takımı, EKLE, kopyala, tümünü sil

Script sırası önemli: storage -> calc -> ui -> main (global değişkenler, modül yok; file:// ile çalışsın diye).

## Sıradaki fikirler
limit + kalan limit, hesap kesim günü/dönem toplamı, kategoriler, isim otomatik önerisi, taksit, düzenleme, CSV dışa aktarma, çoklu kart.
