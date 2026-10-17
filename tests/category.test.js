// Kategoriler: isimden tahmin, öğrenme, kırılım ve geçen döneme göre değişim.
// Bağımlılık: Test, Config, Categories, Domain, Format
(() => {
  const { D, eq, ok } = Test;
  const guess = name => Domain.guessCategory(name);

  Test.group('Kategori · tahmin', {
    'tanınan isimler'() {
      eq(guess('Migros'), 'market');
      eq(guess('Netflix'), 'subs');
      eq(guess('Shell'), 'transport');
      eq(guess('Starbucks'), 'food');
      eq(guess('Turkcell'), 'bills');
      eq(guess('Eczane'), 'health');
      eq(guess('Zara'), 'shopping');
      eq(guess('Sinema'), 'fun');
    },
    'büyük/küçük harf ve Türkçe harfler'() {
      eq(guess('MİGROS'), 'market');
      eq(guess('şok'), 'market');
      eq(guess('  doğalgaz '), 'bills');
    },
    'tam kelime: isimde başka kelimeler olabilir'() {
      eq(guess('Shell Kadıköy'), 'transport');
      eq(guess("McDonald's"), 'food');
      eq(guess('H&M Kadıköy'), 'shopping');
    },
    'kelimenin parçası eşleşmez'() {
      eq(guess('Barış'), null, 'bar');
      eq(guess('Hamburgerci'), null, 'burger');
      eq(guess('Sushi'), null);
    },
    'çok kelimeli sözlük kelimesi, sıra: önce gelen kategori'() {
      eq(guess('Getir Yemek'), 'food');
      eq(guess('Amazon Prime'), 'subs');
      eq(guess('Amazon'), 'shopping');
    },
    'yazılırken kelime başı (en az 3 harf)'() {
      eq(guess('Netf'), 'subs');
      eq(guess('Ne'), null);
    },
    'tanınmayan ya da boş isim'() {
      eq(guess('Kuaför Ali'), null);
      eq(guess(''), null);
      eq(guess('   '), null);
    }
  });

  Test.group('Kategori · öğrenme', {
    'kullanıcının verdiği kategori sözlükten önce gelir, en son verilen geçerli'() {
      const items = [
        { name: 'getir', cat: 'market', ts: 3 },
        { name: 'Getir', cat: 'food', ts: 2 },
        { name: 'Migros', cat: 'fun', ts: 1 }
      ];
      const learned = Domain.learnedCategories(items);
      eq(Domain.guessCategory('GETİR', learned), 'market');
      eq(Domain.guessCategory('Migros', learned), 'fun');
    },
    'bilinmeyen kategori öğrenilmez'() {
      eq(Domain.learnedCategories([{ name: 'X', cat: 'uzay' }]).size, 0);
    },
    'eski kayıtlar tahminle, o da yoksa Diğer; kayıt değişmez'() {
      const old = { id: 'a', name: 'Migros', amt: 10, ts: 1 };
      const items = [old, { id: 'b', name: 'Kuaför', amt: 5, ts: 0 }, { id: 'c', name: 'Netflix', cat: 'fun', amt: 1, ts: 2 }];
      eq(Domain.categorize(items).map(i => i.cat), ['market', 'other', 'fun']);
      eq(old.cat, undefined, 'asıl kayıt');
    },
    'eski kayıt, aynı isme sonradan verilen kategoriyi alır'() {
      const items = [{ id: 'n', name: 'Getir', cat: 'food', ts: 2 }, { id: 'o', name: 'getir', ts: 1 }];
      eq(Domain.categorize(items)[1].cat, 'food');
    },
    'taksit satırları kategoriyi taşır'() {
      const rows = Domain.expand([{ id: 'a', name: 'TV', amt: 300, inst: 3, ts: D(2026, 10, 5), cat: 'shopping' }], 15);
      ok(rows.every(r => r.cat === 'shopping'));
    }
  });

  Test.group('Kategori · kırılım', {
    // Kesim 15; bu dönem 16 Eki – 15 Kas, bugün 20 Eki (5. gün); geçen dönem 16 Eyl'den 5 gün: 16–20 Eyl
    'bu dönem kategori başına, büyükten küçüğe; geçen dönemin aynı gününe kadar'() {
      const rows = [
        { cat: 'market', displayAmt: 300, ts: D(2026, 10, 17) },
        { cat: 'market', displayAmt: 100, ts: D(2026, 10, 19) },
        { cat: 'food', displayAmt: 600, ts: D(2026, 10, 18) },
        { cat: 'market', displayAmt: 200, ts: D(2026, 9, 18) },
        { cat: 'market', displayAmt: 999, ts: D(2026, 9, 25) } // aynı günden sonra: sayılmaz
      ];
      const b = Domain.categoryBreakdown(rows, {
        start: D(2026, 10, 16), end: D(2026, 11, 16), prevStart: D(2026, 9, 16), now: D(2026, 10, 20, 12), since: D(2026, 9, 16)
      });
      eq(b, [
        { cat: 'food', total: 600, share: 0.6, prev: 0 },
        { cat: 'market', total: 400, share: 0.4, prev: 200 }
      ]);
    },
    'geçen dönemde henüz kayıt yoksa kıyas yok'() {
      const b = Domain.categoryBreakdown([{ cat: 'food', displayAmt: 50, ts: D(2026, 10, 17) }], {
        start: D(2026, 10, 16), end: D(2026, 11, 16), prevStart: D(2026, 9, 16), now: D(2026, 10, 20), since: D(2026, 10, 16)
      });
      eq(b[0].prev, null);
      eq(Domain.categoryHighlights(b), null);
    },
    'değişim: küçük farklar aynı sayılır'() {
      eq(Domain.categoryChange({ total: 1000, prev: null }), null);
      eq(Domain.categoryChange({ total: 1050, prev: 1000 }), 'same');
      eq(Domain.categoryChange({ total: 1200, prev: 1000 }), 'up');
      eq(Domain.categoryChange({ total: 700, prev: 1000 }), 'down');
      eq(Domain.categoryChange({ total: 40, prev: 0 }), 'same', 'en az tutar');
    },
    'öne çıkanlar: en çok artan ve azalan'() {
      const b = [
        { cat: 'market', total: 4120, prev: 3500 },
        { cat: 'food', total: 2380, prev: 2900 },
        { cat: 'shopping', total: 2150, prev: 1300 },
        { cat: 'subs', total: 1180, prev: 1180 }
      ];
      const h = Domain.categoryHighlights(b);
      eq([h.up.cat, h.down.cat], ['shopping', 'food']);
    }
  });

  Test.group('Kategori · metinler', {
    'adlar; bilinmeyen Diğer'() {
      eq(Categories.KEYS.map(Format.category), ['Market', 'Yeme-içme', 'Ulaşım', 'Abonelik', 'Alışveriş', 'Fatura', 'Sağlık', 'Eğlence', 'Diğer']);
      eq(Format.category(undefined), 'Diğer');
    },
    'değişim etiketi'() {
      eq(Format.categoryDelta({ total: 4120, prev: 3500 }, 'up'), '↑ ₺620');
      eq(Format.categoryDelta({ total: 2380, prev: 2610 }, 'down'), '↓ ₺230');
      eq(Format.categoryDelta({ total: 1, prev: 1 }, 'same'), 'aynı');
      eq(Format.categoryDelta({ total: 1, prev: null }, null), '');
    },
    'kart cümlesi'() {
      const up = { cat: 'shopping', total: 2150, prev: 1300 }, down = { cat: 'food', total: 2380, prev: 2610 };
      eq(Format.categoryInsight({ up, down }), 'Geçen dönemin aynı gününe göre Alışveriş ₺850 fazla, Yeme-içme ₺230 az.');
      eq(Format.categoryInsight({ up, down: null }), 'Geçen dönemin aynı gününe göre Alışveriş ₺850 fazla.');
      eq(Format.categoryInsight({ up: null, down: null }), 'Geçen dönemle aynı tempodasın.');
      eq(Format.categoryInsight(null), '');
    },
    'liste aç/kapa'() {
      eq(Format.catToggle(2, false), '2 kategori daha');
    }
  });
})();
