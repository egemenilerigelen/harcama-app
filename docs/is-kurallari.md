# İş kuralları

**Kategoriler (`Domain.rememberedCategory`)**

- Uygulama kategori tahmin etmez (isimden tahmin sözlüğü kullanıcı kararıyla kaldırıldı; ileride güçlü bir tahminle yeniden ele alınacak). Sadece hatırlar: kullanıcının aynı isme en son verdiği kategori (`Domain.learnedCategories`; büyük/küçük harf ve Türkçe harf farkı aynı isim, yarım isim tutmaz). "Getir"e bir kez Market dendiyse sonraki "Getir" Market gelir; hatırlanan yoksa seçilmemiş, eklenirken "Diğer".
- Kayıtta `cat` yoksa (eski kayıtlar) ekranda aynı isme verilmiş kategori ya da Diğer gösterilir, veriye yazılmaz (`Domain.categorize`). Kayıt düzenlenince yazılır.
- Kırılım (`Domain.categoryBreakdown`): bu dönem kategori başına (önceki taksitler dahil, dönemin harcaması), geçen dönemin **aynı gününe kadarki** tutarla kıyaslanır (süren yarım dönem tam dönemle kıyaslanmasın); geçen dönemde henüz kayıt yoksa kıyas yok. Küçük farklar (`Config.CAT_SAME_RATIO` %10 / `CAT_SAME_MIN` ₺50 altı) "aynı" sayılır.

**Taksit (`Domain.expand`)**

- Taksitli kayıt (`inst > 1`) her render'da sanal satırlara açılır: tutar `amt / inst`, id `<id>_<n>`, `rawId` asıl kaydın id'si, `part` / `parts` (etiketi `ExpenseRow`, `Format.part` ile yazar: `n/inst taksit`).
- İlk taksit kaydın kendi tarihine, sonrakiler sonraki dönemlerin ilk gününe (kesim gününün ertesi) düşer.
- `ts > now` olan gelecek taksitler listeden gizlenir; toplamlara da girmez.
- Silme sanal satırdan yapılsa bile asıl kaydı siler: `ExpenseRow` eylemlere `rawId || id` verir.
- Önceki alışverişlerin bu döneme yansıyan taksitleri (`Domain.isCarried`) dönem toplamına girer ama hiçbir "gün" harcamasına girmez: ana sayfadaki "Bugün", günlük grafik, Harcamalar'daki gün başlıkları ve "Günlük ort." onları saymaz. Harcamalar'da dönemin en altında kendi grubundadır ("Önceki taksitler"), soldaki sütunda saat yerine alışverişin tarihi (`buyTs`).
- "Bu dönem" = içinde bulunulan hesap dönemi, takvim ayı değil. Kesim günü dahil (bankalardaki gibi): kesim günü 12 ise dönem 13 Eyl – 12 Eki, 12 Ekim'in harcaması Ekim ekstresine girer, yeni dönem ertesi gün başlar (`Domain.periodStart`). Arayüzde "ay" denmez, dönem aralığı yanında yazar.

**Abonelikler (`Domain.charges`)**

- Abonelik kategorisinde tek çekim girilen kayıt abonelik olur (`Domain.subscriptionEntry` → `sub: true`; isim adımında ödeme etiketi "Her ay"). Bir kez girilir, her render'da çekimlere açılır (`Domain.expand(items, cutoff, now)`): ilki kaydın kendisi, sonrakiler her ay aynı gün ve saat (ay kısaysa son günü, `Domain.addMonths`), id `<id>_m<n>`, `rawId` asıl kayıt; sadece `now`'a kadar (gelecek çekim satırı yok). `end` varsa ondan sonrası yok.
- Taksit gibi dönem toplamına, kategoriye ve hedefe girer, günlük harcamaya girmez (`Domain.isDaily`: Bugün, günlük grafik, gün başlıkları, günlük ort.). Hedefin günlük tutarı dönemin kalanına düşecek çekimler (`Domain.upcomingCharges`) ayrıldıktan sonra hesaplanır.
- Düzenlemede: elle her ay girilmiş eski Abonelik kayıtları (`sub` yok) kategori değişmeden abonelik olmaz (çift çekim olmasın); kategorisi Abonelik'e çevrilen olur, Abonelik'ten çıkan ya da taksitlenen tekrar etmez. Bitirme `end = şimdi` (geri alınabilir, `Store.put`).

**Tuş takımı (`Calc`)**

`Calc` sınıfı; durumu örnekte, örneği `EntryPanel` tutar (global durum yok). Sadece rakam ve nokta kabul eder: en fazla 9 hane, 2 ondalık, tek nokta. Ham değer `raw()`, sayısal değer `value()`; `set(tutar)` kayıt düzenlemede mevcut tutarı yerleştirir.
