// Domain: dönem, taksit, toplamlar, hedef. Örnek: kesim günü 15, dönem 16 Eyl – 15 Eki.
// Bağımlılık: Test, Config, Domain
(() => {
  const { D, eq, ok } = Test;
  const tv = { id: 'a', name: 'TV', amt: 300, inst: 3, ts: D(2026, 10, 5, 12) };

  Test.group('Domain · dönem', {
    'kesim günü dahil: 12 Ekim, 13 Eyl – 12 Eki dönemine girer'() {
      eq(+Domain.periodStart(D(2026, 10, 12, 23), 12), D(2026, 9, 13));
    },
    'kesimin ertesi günü yeni dönem başlar'() {
      eq(+Domain.periodStart(D(2026, 10, 13, 0), 12), D(2026, 10, 13));
    },
    'offset ile önceki ve sonraki dönem'() {
      eq(+Domain.periodStart(D(2026, 10, 20), 15, -1), D(2026, 9, 16));
      eq(+Domain.periodStart(D(2026, 10, 20), 15, 1), D(2026, 11, 16));
    },
    'yıl dönümü: 5 Ocak, Aralık\'ta başlayan dönemde'() {
      eq(+Domain.periodStart(D(2027, 1, 5), 15), D(2026, 12, 16));
    },
    'kesim 28: Şubat\'ın 29. günü 1 Mart\'a taşar'() {
      eq(+Domain.periodStart(D(2026, 3, 1), 28), D(2026, 3, 1));
      eq(+Domain.periodStart(D(2026, 2, 28), 28), D(2026, 1, 29));
    },
    'dönem günü: süren dönemde bugüne kadar, biten dönemde tamamı'() {
      const start = D(2026, 9, 16), end = D(2026, 10, 16);
      eq(Domain.periodDays(start, end, D(2026, 9, 16, 9)), 1);
      eq(Domain.periodDays(start, end, D(2026, 10, 1, 12)), 16);
      eq(Domain.periodDays(start, end, end), 30);
    },
    'kalan gün bugün dahil, en az 1'() {
      const start = D(2026, 9, 16), end = D(2026, 10, 16);
      eq(Domain.daysLeft(start, end, D(2026, 10, 1, 12)), 15);
      eq(Domain.daysLeft(start, end, D(2026, 10, 15, 23)), 1);
    },
    'ilk kaydın dönemi; kayıt yoksa bu dönem'() {
      const now = D(2026, 10, 20);
      eq(Domain.dataSince([], 15, now), D(2026, 10, 16));
      eq(Domain.dataSince([{ ts: D(2026, 7, 20) }], 15, now), D(2026, 7, 16));
    }
  });

  Test.group('Domain · gün ve zaman', {
    'gün anahtarı'() {
      eq(Domain.dayKey(D(2026, 3, 7, 23, 59)), '2026-03-07');
    },
    'seçilen gün + verilen anın saati'() {
      eq(Domain.atDay(D(2026, 10, 5), D(2026, 10, 17, 14, 30)), D(2026, 10, 5, 14, 30));
    },
    'takvim günü farkı saatten bağımsız'() {
      eq(Domain.daysBetween(D(2026, 10, 16, 23), D(2026, 10, 17, 1)), 1);
      eq(Domain.daysBetween(D(2026, 10, 17, 1), D(2026, 10, 17, 23)), 0);
    },
    'n gün önce'() {
      eq(Domain.daysAgo(D(2026, 10, 3, 15), 5), D(2026, 9, 28));
    },
    'yedek hatırlatması'() {
      const now = D(2026, 10, 17, 12);
      eq(Domain.backupDue(null, now, true), true, 'hiç yedek yok');
      eq(Domain.backupDue(null, now, false), false, 'kayıt yok');
      eq(Domain.backupDue(Domain.daysAgo(now, Config.BACKUP_WARN_DAYS - 1), now, true), false, 'süre dolmadı');
      eq(Domain.backupDue(Domain.daysAgo(now, Config.BACKUP_WARN_DAYS), now, true), true, 'süre doldu');
    },
    'kesim günü 1–28 arasında tutulur'() {
      eq(Domain.clampCutoff(0), 1);
      eq(Domain.clampCutoff(31), 28);
      eq(Domain.clampCutoff(12), 12);
    }
  });

  Test.group('Domain · taksit', {
    'tek çekim tek satır'() {
      const rows = Domain.expand([{ id: 'x', name: 'Market', amt: 450, ts: D(2026, 10, 5) }], 15);
      eq(rows.length, 1);
      eq(rows[0].displayAmt, 450);
      eq(rows[0].parts, undefined);
    },
    'eski kayıt: inst ve amt yoksa varsayılan'() {
      const rows = Domain.expand([{ id: 'x', name: 'Eski', ts: D(2026, 10, 5) }], 15);
      eq(rows.length, 1);
      eq(rows[0].amt, 0);
    },
    '3 taksit: eşit pay, id, asıl kayıt'() {
      const rows = Domain.expand([tv], 15);
      eq(rows.map(r => r.id), ['a_0', 'a_1', 'a_2']);
      eq(rows.map(r => r.amt), [100, 100, 100]);
      ok(rows.every(r => r.rawId === 'a' && r.buyTs === tv.ts && r.parts === 3), 'rawId / buyTs / parts');
    },
    'ilk taksit kaydın günü, sonrakiler sonraki dönemlerin ilk günü'() {
      eq(Domain.expand([tv], 15).map(r => r.ts), [tv.ts, D(2026, 10, 16), D(2026, 11, 16)]);
    },
    'gelecek taksitler görünmez, yeniden eskiye sıralı'() {
      const rows = Domain.visibleRows([tv], 15, D(2026, 10, 20));
      eq(rows.map(r => r.id), ['a_1', 'a_0']);
    },
    'önceki taksit: 2. taksit ve sonrası'() {
      eq(Domain.expand([tv], 15).map(Domain.isCarried), [false, true, true]);
    },
    'kalan taksit sayısı'() {
      eq(Domain.remainingParts(tv, 15, D(2026, 10, 20)), 1);
    },
    'devam eden taksitler: ödenen, kalan, büyükten küçüğe'() {
      const phone = { id: 'b', name: 'Telefon', amt: 1200, inst: 12, ts: D(2026, 10, 1) };
      const done = { id: 'c', name: 'Bitti', amt: 200, inst: 2, ts: D(2026, 8, 1) };
      const list = Domain.activeInstallments([tv, phone, done], 15, D(2026, 10, 20));
      eq(list.map(i => i.id), ['b', 'a']);
      eq(list[1], { id: 'a', name: 'TV', paid: 2, parts: 3, single: 100, remaining: 100 });
    },
    'aralığa düşen taksitler (sonraki ekstreye yazılanlar)'() {
      eq(Domain.installmentsBetween([tv], 15, D(2026, 11, 16), D(2026, 12, 16)), 100);
    }
  });

  Test.group('Domain · toplamlar', {
    'günlük toplamlar: dönemin her günü bir eleman'() {
      const rows = Domain.expand([tv], 15);
      const days = Domain.dailyTotals(rows, D(2026, 9, 16), D(2026, 10, 16));
      eq(days.length, 30);
      eq(days.find(d => d.ts === D(2026, 10, 5)).total, 100);
      eq(days.reduce((s, d) => s + d.total, 0), 100);
    },
    'dönem toplamları eskiden yeniye, son eleman bu dönem'() {
      const rows = Domain.expand([tv], 15);
      const p = Domain.periodTotals(rows, D(2026, 10, 20), 15, 2);
      eq(p.map(x => [x.start, x.total]), [[D(2026, 9, 16), 100], [D(2026, 10, 16), 100]]);
    },
    'satırları güne göre gruplar'() {
      const g = Domain.groupByDay([{ ts: D(2026, 10, 5, 9) }, { ts: D(2026, 10, 5, 20) }, { ts: D(2026, 10, 4) }]);
      eq(Object.keys(g), ['2026-10-05', '2026-10-04']);
      eq(g['2026-10-05'].length, 2);
    }
  });

  Test.group('Domain · hedef', {
    'tempoda: oran dönemin geçen kısmından fazla değil → ok'() {
      const p = Domain.goalProgress(5000, 10000, D(2026, 9, 16), D(2026, 10, 16), D(2026, 10, 1, 12));
      eq(p.state, 'ok');
      eq(p.daysLeft, 15);
      eq(Math.round(p.perDay), 333);
    },
    'hızlı: oran geçen kısmı paydan fazla aştı → warn'() {
      eq(Domain.goalProgress(7000, 10000, D(2026, 9, 16), D(2026, 10, 16), D(2026, 10, 1, 12)).state, 'warn');
    },
    'aşıldı → over, kalan eksi, günlük tutar 0'() {
      const p = Domain.goalProgress(11000, 10000, D(2026, 9, 16), D(2026, 10, 16), D(2026, 10, 1, 12));
      eq([p.state, p.remaining, p.perDay], ['over', -1000, 0]);
    },
    'öneri: biten son 3 ekstrenin ortalaması, yuvarlı'() {
      const items = [
        { id: '1', name: 'a', amt: 8000, ts: D(2026, 7, 20) },
        { id: '2', name: 'b', amt: 9000, ts: D(2026, 8, 20) },
        { id: '3', name: 'c', amt: 9700, ts: D(2026, 9, 20) }
      ];
      const rows = Domain.expand(items, 15);
      eq(Domain.goalSuggestion(items, rows, D(2026, 10, 20), 15), { count: 3, amount: 8900 });
    },
    'öneri: ilk kayıttan önceki dönemler sayılmaz'() {
      const items = [{ id: '3', name: 'c', amt: 9700, ts: D(2026, 9, 20) }];
      eq(Domain.goalSuggestion(items, Domain.expand(items, 15), D(2026, 10, 20), 15), { count: 1, amount: 9700 });
    },
    'tahmin: harcanan + kalan abonelik + kalan gün × günlük tempo'() {
      const start = D(2026, 9, 16), end = D(2026, 10, 16);
      // 10. gün (25 Eyl): günlük 1.000 → günde 100; 20 gün kaldı (bugün hariç)
      eq(Domain.forecast(3000, 1000, start, end, D(2026, 9, 25, 12), 229), 3000 + 229 + 100 * 20);
    },
    'tahmin: ilk günlerde ve son gün yok'() {
      const start = D(2026, 9, 16), end = D(2026, 10, 16);
      eq(Domain.forecast(500, 500, start, end, D(2026, 9, 19, 12)), null);
      eq(Domain.forecast(500, 500, start, end, D(2026, 10, 15, 12)), null);
    },
    'öneri: biten ekstre yoksa null'() {
      const items = [{ id: '1', name: 'a', amt: 500, ts: D(2026, 10, 18) }];
      eq(Domain.goalSuggestion(items, Domain.expand(items, 15), D(2026, 10, 20), 15), null);
    },
    'hedef geçmişi: ilk değişiklikte eski hedef başa yazılır, aynısı tekrar yazılmaz'() {
      let log = Domain.goalLogAdd([], 8000, 9500, D(2026, 10, 2));
      eq(log, [{ ts: 0, goal: 8000 }, { ts: D(2026, 10, 2), goal: 9500 }]);
      log = Domain.goalLogAdd(log, 9500, 9500, D(2026, 10, 3));
      eq(log.length, 2);
      eq(Domain.goalLogAdd([], 0, 5000, D(2026, 10, 2)), [{ ts: D(2026, 10, 2), goal: 5000 }]);
    },
    'hedef geçmişi: ekstrenin hedefi dönem sonundan önceki son değişiklik'() {
      const log = [{ ts: 0, goal: 8000 }, { ts: D(2026, 10, 2), goal: 9500 }];
      eq(Domain.goalAt(log, D(2026, 9, 16), 9500), 8000);
      eq(Domain.goalAt(log, D(2026, 10, 16), 9500), 9500);
      eq(Domain.goalAt([], D(2026, 9, 16), 9500), 9500);
      eq(Domain.goalAt([{ ts: D(2026, 10, 2), goal: 5000 }], D(2026, 9, 16), 5000), 0);
    }
  });

  Test.group('Domain · ekstre özeti', {
    'toplam, geçen ekstre, en büyük 3 kategori ve harcama, son taksiti düşen alışveriş'() {
      const items = [
        { id: 'a', name: 'Kulaklık', amt: 3000, ts: D(2026, 9, 20), cat: 'shopping' },
        { id: 'b', name: 'Market', amt: 500, ts: D(2026, 9, 25), cat: 'market' },
        { id: 'c', name: 'Kahve', amt: 100, ts: D(2026, 10, 1), cat: 'food' },
        { id: 'd', name: 'Simit', amt: 20, ts: D(2026, 10, 2), cat: 'food' },
        { id: 'e', name: 'TV', amt: 600, inst: 2, ts: D(2026, 8, 20), cat: 'shopping' }
      ];
      const rows = Domain.visibleRows(items, 15, D(2026, 10, 20));
      const s = Domain.statementSummary(items, rows, 15, D(2026, 9, 16));
      eq(s.end, D(2026, 10, 16));
      eq(s.total, 3920);
      eq(s.prev, 300);
      eq(s.cats, [{ cat: 'shopping', total: 3300 }, { cat: 'market', total: 500 }, { cat: 'food', total: 120 }]);
      eq(s.top.map(r => r.name), ['Kulaklık', 'Market', 'TV']);
      eq(s.finished.map(r => r.name), ['TV']);
      eq(s.ended, []);
      eq(s.started, []);
      eq(s.record, null);
    },
    'bu ekstrede taksite bölünen alışverişler ve başlayan abonelikler'() {
      const items = [
        { id: 'l', name: 'Laptop', amt: 12000, inst: 6, ts: D(2026, 9, 20), cat: 'shopping' },
        { id: 's', name: 'Spotify', amt: 59, ts: D(2026, 10, 1), cat: 'subs', sub: true }
      ];
      const s = Domain.statementSummary(items, Domain.visibleRows(items, 15, D(2026, 10, 20)), 15, D(2026, 9, 16));
      eq(s.started.map(r => [r.name, r.parts, r.displayAmt]), [['Laptop', 6, 2000]]);
      eq(s.newSubs.map(i => i.name), ['Spotify']);
    },
    'rekor: önceki ekstrelerin hepsinden düşük ya da yüksek; kıyas azsa yok'() {
      eq(Domain.statementRecord(800, [1000, 1200]), { kind: 'low', count: 3, ref: 1000 });
      eq(Domain.statementRecord(1500, [1000, 1200, 900]), { kind: 'high', count: 4, ref: 1200 });
      eq(Domain.statementRecord(1100, [1000, 1200]), null);
      eq(Domain.statementRecord(800, [1000]), null);
    },
    'bu ekstrede bitirilen abonelikler; önce ya da sonra bitenler değil'() {
      const sub = (id, end) => ({ id, name: id, amt: 59, ts: D(2026, 6, 5), cat: 'subs', sub: true, end });
      const items = [sub('a', D(2026, 10, 1)), sub('b', D(2026, 9, 10)), sub('c', D(2026, 10, 18)), sub('d')];
      const rows = Domain.visibleRows(items, 15, D(2026, 10, 20));
      eq(Domain.statementSummary(items, rows, 15, D(2026, 9, 16)).ended.map(i => i.id), ['a']);
    },
    'yön liraya yuvarlanır'() {
      eq(Domain.trend(120, 100), 'up');
      eq(Domain.trend(80, 100), 'down');
      eq(Domain.trend(100.3, 100), 'same');
    },
    'geçen ekstre ilk kayıttan önceyse null; harcama yoksa özet yok'() {
      const items = [{ id: 'a', name: 'a', amt: 100, ts: D(2026, 9, 20) }];
      const rows = Domain.visibleRows(items, 15, D(2026, 10, 20));
      eq(Domain.statementSummary(items, rows, 15, D(2026, 9, 16)).prev, null);
      eq(Domain.statementSummary(items, rows, 15, D(2026, 8, 16)), null);
    }
  });

  Test.group('Domain · sık kullanılan isimler', {
    'en çok girilen önce; büyük/küçük harf aynı, son yazılış; Adsız ve boş girmez'() {
      const items = [
        { name: 'Netflix', ts: 1 },
        { name: 'Migros', ts: 2 },
        { name: 'netflix', ts: 3 },
        { name: 'Adsız', ts: 4 }, { name: 'Adsız', ts: 5 }, { name: 'Adsız', ts: 6 },
        { name: '  ', ts: 7 }
      ];
      eq(Domain.frequentNames(items, 10), ['netflix', 'Migros']);
      eq(Domain.frequentNames(items, 1), ['netflix']);
    },
    'eşit sayıda en son girilen önce'() {
      eq(Domain.frequentNames([{ name: 'A', ts: 1 }, { name: 'B', ts: 2 }], 10), ['B', 'A']);
    },
    'Türkçe büyük/küçük harf: İ ve i aynı'() {
      eq(Domain.frequentNames([{ name: 'İzmir', ts: 1 }, { name: 'izmir', ts: 2 }], 10), ['izmir']);
    }
  });
})();
