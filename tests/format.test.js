// Format: ekrandaki para, tarih ve cümle metinleri (tr-TR).
// Bağımlılık: Test, Format
(() => {
  const { D, eq } = Test;
  const now = D(2026, 10, 17, 14);

  Test.group('Format · para', {
    'binlik nokta, ondalık virgül; tam sayıda kuruş yok'() {
      eq(Format.money(1234.5), '₺1.234,50');
      eq(Format.money(7000), '₺7.000');
      eq(Format.money(0), '₺0');
    },
    'kuruşa yuvarlanır: taksit paylarının toplamı ₺7,00 yazılmaz'() {
      eq(Format.money(7 / 3 + 7 / 3 + 7 / 3), '₺7');
      eq(Format.money(6.999999), '₺7');
      eq(Format.money(0.1 + 0.2), '₺0,30');
    },
    'tutar girişi: binlik ayraç ve ondalık virgül'() {
      eq(Format.amountInput(''), '');
      eq(Format.amountInput('1000000'), '1.000.000');
      eq(Format.amountInput('1234.5'), '1.234,5');
      eq(Format.amountInput('12.'), '12,');
    },
    'yüzde: işaret önde'() {
      eq(Format.percent(0.624), '%62');
    }
  });

  Test.group('Format · tarih', {
    'saat ve kısa tarih'() {
      eq(Format.time(D(2026, 10, 5, 9, 5)), '09:05');
      eq(Format.shortDate(D(2026, 10, 5)), '5 Eki');
      eq(Format.range(D(2026, 9, 13), D(2026, 10, 12)), '13 Eyl – 12 Eki');
    },
    'kısa etiket: Bugün / Dün / tarih'() {
      eq(Format.shortWhen(D(2026, 10, 17, 1), now), 'Bugün');
      eq(Format.shortWhen(D(2026, 10, 16, 23), now), 'Dün');
      eq(Format.shortWhen(D(2026, 10, 5), now), '5 Eki');
    },
    'gün başlığı'() {
      eq(Format.dayLabel('2026-10-17', now).startsWith('Bugün, 17 Ekim'), true);
      eq(Format.dayLabel('2026-10-16', now).startsWith('Dün, 16 Ekim'), true);
    },
    'aralık: başka yıldaysa yıl'() {
      eq(Format.rangeWithYear(D(2025, 11, 16), D(2025, 12, 15), now), '16 Kas – 15 Ara 2025');
      eq(Format.rangeWithYear(D(2026, 9, 16), D(2026, 10, 15), now), '16 Eyl – 15 Eki');
    },
    'ekstre adı: bu yıl ay, başka yıl yılıyla'() {
      eq(Format.statement(D(2026, 9, 15), now), 'Eylül ekstresi');
      eq(Format.statement(D(2025, 12, 15), now), 'Aralık 2025 ekstresi');
      eq(Format.intoStatement(D(2026, 11, 15), now), 'Kasım ekstresine');
      eq(Format.periodName(0, D(2026, 11, 15), now), 'Bu dönem');
    },
    'isim adımı tarih etiketi: kesilmiş dönemde hangi ekstre'() {
      // Kesim 15; bugün 17 Eki (dönem 16 Eki – 15 Kas)
      eq(Format.dayChoice(D(2026, 10, 17), now, 15), 'Bugün');
      eq(Format.dayChoice(D(2026, 10, 16), now, 15), 'Dün');
      eq(Format.dayChoice(D(2026, 10, 15), now, 15), '15 Eki · Ekim ekstresine');
      eq(Format.dayChoice(D(2026, 9, 3), now, 15), '3 Eyl · Eylül ekstresine');
    },
    'sonraki kesim'() {
      eq(Format.nextCutoff(D(2026, 10, 19), now), '19 Eki · 2 gün sonra');
      eq(Format.nextCutoff(D(2026, 10, 18), now), '18 Eki · yarın');
      eq(Format.nextCutoff(D(2026, 10, 17), now), '17 Eki · bugün');
    },
    'son yedek'() {
      eq(Format.backupAge(0, now), 'Henüz yedek alınmadı');
      eq(Format.backupAge(D(2026, 10, 17, 9), now), 'Son yedek: bugün');
      eq(Format.backupAge(D(2026, 10, 16, 9), now), 'Son yedek: dün');
      eq(Format.backupAge(D(2026, 10, 5), now), 'Son yedek: 12 gün önce');
    },
    'dosya adları'() {
      eq(Format.backupName(now), 'harcama-yedek-2026-10-17.json');
      eq(Format.csvName(now), 'harcama-2026-10-17.csv');
    }
  });

  Test.group('Format · Türkçe ekler', {
    'iyelik eki okunuşun son kelimesine göre'() {
      const cases = { 0: "'ı", 1: "'i", 2: "'si", 3: "'ü", 4: "'ü", 5: "'i", 6: "'sı", 7: "'si", 8: "'i", 9: "'u",
        10: "'u", 20: "'si", 30: "'u", 40: "'ı", 50: "'si", 60: "'ı", 70: "'i", 80: "'i", 90: "'ı",
        74: "'ü", 100: "'ü", 1000: "'i" };
      Object.entries(cases).forEach(([n, suffix]) => eq(Format.possessive(Number(n)), suffix, n));
    },
    'kesim günü ve hedef payı'() {
      eq(Format.cutoffDay(13), "Ayın 13'ü");
      eq(Format.goalShare(74, 100), "hedefin %74'ü");
    }
  });

  Test.group('Format · cümleler', {
    'ekstre özeti: hedefe ve geçen ekstreye göre oklu satırlar, biten taksitler'() {
      eq(Format.statementGoal(14250, 15000, 'down'), '↓ ₺750 hedefin altında');
      eq(Format.statementGoal(16200, 15000, 'up'), '↑ ₺1.200 hedefin üstünde');
      eq(Format.statementGoal(15000, 15000, 'same'), 'Hedefe tam denk');
      eq(Format.statementChange(14250, 15100, 'down'), '↓ ₺850 geçen ekstreden az');
      eq(Format.statementChange(15100, 14250, 'up'), '↑ ₺850 geçen ekstreden fazla');
      eq(Format.statementChange(100, 100, 'same'), 'Geçen ekstreyle aynı');
      eq(Format.statementTitle(new Date(2026, 9, 15).getTime(), new Date(2026, 9, 25).getTime()), 'Ekim Ekstresi');
      eq(Format.statementEmpty(), 'Bu ekstrede kayıt yok');
      eq(Format.finishedTitle(['Telefon']), 'Telefon taksitleri bitti');
      eq(Format.finishedTitle(['Telefon', 'TV', 'Koltuk']), '3 taksit bitti: Telefon, TV, Koltuk');
      eq(Format.finishedSub(1500), 'Sonraki ekstreler ₺1.500 hafifler');
      eq(Format.installmentShare(6, 12000), '6 × ₺2.000');
      eq(Format.installmentShare(3, 1000), '3 × ₺333,33');
      eq(Format.forecast(12184), 'bu tempoyla ₺12.180');
      eq(Format.cutoffSoon(0), 'kesim bugün');
      eq(Format.cutoffSoon(1), 'kesim yarın');
      eq(Format.cutoffSoon(2), 'kesime 2 gün');
      eq(Format.endedTitle(['Netflix']), 'Netflix aboneliği bitti');
      eq(Format.endedTitle(['Netflix', 'Spotify']), '2 abonelik bitti: Netflix, Spotify');
      eq(Format.endedSub(229), 'Her ay ₺229 daha az çekilecek');
      eq(Format.startedTitle([{ name: 'Laptop', parts: 6 }]), 'Laptop 6 taksite bölündü');
      eq(Format.startedTitle([{ name: 'Laptop', parts: 6 }, { name: 'Koltuk', parts: 3 }]), '2 alışveriş taksitlendi: Laptop, Koltuk');
      eq(Format.startedSub(2000), 'Sonraki ekstreye ₺2.000 yazıldı');
      eq(Format.newSubTitle(['Spotify']), 'Spotify aboneliği başladı');
      eq(Format.newSubSub(59), 'Her ay ₺59');
      eq(Format.recordTitle({ kind: 'low', count: 4 }), 'Son 4 ekstrenin en düşüğü');
      eq(Format.recordSub({ kind: 'high', ref: 9800 }), 'Önceki en yüksek ₺9.800');
    },
    'hedef notu: yüzde ya da aşım'() {
      eq(Format.goalNote(3135, 9500), '%33 · hedef ₺9.500');
      eq(Format.goalNote(10700, 9500), '₺1.200 aştı · hedef ₺9.500');
    },
    'hedef ipucu: tempo, sınır, aşım'() {
      eq(Format.goalHint({ state: 'ok', perDay: 333.7 }, 0), 'Günde ₺333 ile hedefte kalırsın');
      eq(Format.goalHint({ state: 'warn', perDay: 333.7 }, 0, 12184), 'Günde ₺333 ile hedefte kalırsın · bu tempoyla ₺12.180');
      eq(Format.goalHint({ state: 'ok', perDay: 0.5 }, 0), 'Hedefin sınırındasın');
      eq(Format.goalHint({ state: 'over', perDay: 0 }, 7000), '₺7.000 önceki taksitlerden');
      eq(Format.goalHint({ state: 'over', perDay: 0 }, 0, 16000), 'Hedef aşıldı · bu tempoyla ₺16.000');
      eq(Format.goalHint(null, 0, 8000), 'Halkaya dokunup hedef koy · bu tempoyla ₺8.000');
      eq(Format.periodLeft(new Date(2026, 9, 16).getTime(), new Date(2026, 10, 15).getTime(), 22), '16 Eki – 15 Kas · 22 gün kaldı');
    },
    'hedef önerisi'() {
      eq(Format.goalSuggestion({ count: 3, amount: 8900 }), 'Son 3 ekstre ortalaması ≈ ₺8.900');
      eq(Format.goalSuggestion({ count: 1, amount: 8900 }), 'Geçen ekstre ≈ ₺8.900');
    },
    'geri alma ve değişim'() {
      eq(Format.undoTitle('deleted', 'Netflix'), 'Netflix silindi');
      eq(Format.undoTitle('edited', 'Getir'), 'Getir düzenlendi');
      eq(Format.change(320, 298), '₺320 → ₺298');
      eq(Format.change(229, 229), '₺229');
    },
    'taksit etiketleri'() {
      eq(Format.installment(1), 'Tek çekim');
      eq(Format.installment(3), '3 taksit');
      eq(Format.part(1, 3), '1/3 taksit');
      eq(Format.instToggle(5, false), '5 taksit daha');
      eq(Format.instToggle(5, true), 'Daha az göster');
      eq(Format.carriedNote(7000), '+₺7.000 önceki taksitler');
    },
    'geri yükleme sonucu'() {
      eq(Format.importResult(12, 3), '12 kayıt eklendi · 3 kayıt zaten vardı');
      eq(Format.importResult(0, 0), 'Yeni kayıt yok');
    }
  });
})();
