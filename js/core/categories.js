// KATEGORİLER: anahtarlar (sıra = seçicideki sıra) ve isimden tahmin sözlüğü. Ekrandaki adlar Format'ta,
// ikonlar CatIcon'da. Sözlük tam kelimeyle eşleşir (Domain.guessCategory): "Shell Kadıköy" Ulaşım olur,
// "Barış" Eğlence'nin "bar"ına düşmez. Kullanıcının daha önce verdiği kategori her zaman sözlükten önce gelir.
// Bağımlılık: yok
const Categories = Object.freeze({
  KEYS: ['market', 'food', 'transport', 'subs', 'shopping', 'bills', 'health', 'fun', 'other'],
  OTHER: 'other',

  // Küçük harf, Türkçe yazımıyla; çok kelimeli olabilir
  WORDS: Object.freeze({
    market: ['migros', 'a101', 'bim', 'şok', 'carrefour', 'carrefoursa', 'file', 'macrocenter', 'hakmar',
      'onur market', 'getir büyük', 'market', 'süpermarket', 'manav', 'kasap', 'fırın', 'bakkal', 'pazar'],
    food: ['starbucks', 'kahve', 'kafe', 'cafe', 'restoran', 'lokanta', 'yemeksepeti', 'getir yemek', 'trendyol yemek',
      'burger', 'mcdonald', 'pizza', 'dominos', 'popeyes', 'kfc', 'döner', 'kebap', 'simit', 'pastane', 'tatlı',
      'öğle yemeği', 'akşam yemeği', 'kahvaltı', 'yemek', 'espresso lab', 'kahve dünyası', 'gloria jeans'],
    transport: ['shell', 'opet', 'bp', 'petrol ofisi', 'total', 'akaryakıt', 'benzin', 'mazot', 'uber', 'bitaksi', 'taksi',
      'otopark', 'hgs', 'ogs', 'köprü', 'istanbulkart', 'akbil', 'metro bilet', 'otobüs', 'thy', 'pegasus', 'ajet',
      'uçak', 'tren', 'tcdd', 'martı', 'araba', 'oto yıkama', 'lastik'],
    subs: ['netflix', 'spotify', 'youtube', 'disney', 'apple music', 'apple one', 'apple tv', 'icloud', 'exxen', 'blutv', 'hbo max', 'amazon prime',
      'prime video', 'gain', 'tod', 'chatgpt', 'claude', 'google one', 'xbox game pass', 'abonelik', 'üyelik'],
    shopping: ['zara', 'trendyol', 'hepsiburada', 'amazon', 'n11', 'lcw', 'lc waikiki', 'mavi', 'koton', 'defacto',
      'h&m', 'ikea', 'decathlon', 'teknosa', 'mediamarkt', 'vatan', 'boyner', 'gratis', 'watsons', 'rossmann',
      'kıyafet', 'ayakkabı', 'elbise', 'hediye'],
    bills: ['turkcell', 'vodafone', 'türk telekom', 'superonline', 'türknet', 'elektrik', 'enerjisa', 'doğalgaz',
      'igdaş', 'iski', 'aski', 'su faturası', 'fatura', 'internet', 'kira', 'aidat', 'sigorta', 'vergi'],
    health: ['eczane', 'hastane', 'doktor', 'diş', 'klinik', 'tahlil', 'ilaç', 'gym', 'spor salonu', 'macfit', 'optik'],
    fun: ['sinema', 'cinemaximum', 'konser', 'biletix', 'passo', 'bubilet', 'steam', 'playstation', 'nintendo',
      'tiyatro', 'müze', 'bowling', 'bilardo', 'bar', 'oyun', 'kitap', 'd&r']
  })
});
