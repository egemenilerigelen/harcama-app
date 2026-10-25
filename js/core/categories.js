// KATEGORİLER: anahtarlar (sıra = seçicideki sıra). Ekrandaki adlar Format'ta, ikonlar CatIcon'da, renkler
// CSS'te (--cat-*). Uygulama kategori tahmin etmez; sadece kullanıcının aynı isme verdiğini hatırlar
// (Domain.rememberedCategory).
// Bağımlılık: yok
const Categories = Object.freeze({
  KEYS: ['market', 'food', 'transport', 'subs', 'shopping', 'bills', 'health', 'fun', 'other'],
  OTHER: 'other',
  SUBS: 'subs' // Abonelik: tek çekimse her ay kendiliğinden tekrar eder (Domain.charges)
});
