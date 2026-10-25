// Abonelikler: her ay kendiliğinden çekim, bitirme, günlük harcamaya girmeme, kart ve hedef hesabı.
// Bağımlılık: Test, Config, Categories, Domain, Format, Backup
(() => {
  const { D, eq, ok } = Test;
  const netflix = { id: 'n', name: 'Netflix', amt: 229, inst: 1, ts: D(2026, 8, 5, 10), cat: 'subs', sub: true };

  Test.group('Abonelik · çekimler', {
    'her ay aynı gün ve saat, bugüne kadar; ilki kaydın kendisi'() {
      const rows = Domain.expand([netflix], 15, D(2026, 10, 20));
      eq(rows.map(r => r.ts), [D(2026, 8, 5, 10), D(2026, 9, 5, 10), D(2026, 10, 5, 10)]);
      eq(rows.map(r => r.id), ['n', 'n_m1', 'n_m2']);
      eq(rows.map(r => r.rawId), [undefined, 'n', 'n']);
      ok(rows.every(r => r.displayAmt === 229 && r.sub && r.cat === 'subs'));
    },
    'now verilmezse sadece ilk çekim; çekim günü gelmediyse yazılmaz'() {
      eq(Domain.expand([netflix], 15).length, 1);
      eq(Domain.expand([netflix], 15, D(2026, 10, 5, 9)).length, 2, 'saati gelmedi');
    },
    'ay kısaysa ayın son günü'() {
      eq(Domain.addMonths(D(2026, 1, 31), 1), D(2026, 2, 28));
      eq(Domain.addMonths(D(2026, 1, 31), 2), D(2026, 3, 31));
      eq(Domain.addMonths(D(2026, 12, 15), 1), D(2027, 1, 15));
    },
    'bitirilince sonraki çekimler yok'() {
      const ended = { ...netflix, end: D(2026, 9, 20) };
      eq(Domain.expand([ended], 15, D(2026, 12, 1)).length, 2);
    },
    'bozuk tarih sonsuz döngüye girmez'() {
      eq(Domain.expand([{ ...netflix, ts: NaN }], 15, D(2026, 10, 20)).length, 1);
    },
    'günün harcaması değil (önceki taksit gibi)'() {
      const rows = Domain.visibleRows([netflix, { id: 'm', name: 'Migros', amt: 50, ts: D(2026, 10, 5) }], 15, D(2026, 10, 20));
      eq(rows.filter(Domain.isDaily).map(r => r.name), ['Migros']);
    }
  });

  Test.group('Abonelik · kayıt', {
    'Abonelik + tek çekim abonelik olur; taksitli ya da başka kategori olmaz'() {
      eq(Domain.subscriptionEntry('subs', 1), true);
      eq(Domain.subscriptionEntry('subs', 3), false);
      eq(Domain.subscriptionEntry('fun', 1), false);
    },
    'düzenleme: elle girilmiş eski Abonelik kaydı kendiliğinden tekrar etmeye başlamaz'() {
      eq(Domain.subscriptionEntry('subs', 1, { cat: 'subs' }), false, 'eski kayıt');
      eq(Domain.subscriptionEntry('subs', 1, { cat: 'subs', sub: true }), true, 'abonelik kalır');
      eq(Domain.subscriptionEntry('subs', 1, { cat: 'fun' }), true, 'kategorisi çevrildi');
      eq(Domain.subscriptionEntry('fun', 1, { cat: 'subs', sub: true }), false, 'çıkarıldı');
    }
  });

  Test.group('Abonelik · kart ve hedef', {
    'süren abonelikler sıradaki çekime göre; bitenler yok'() {
      const spotify = { id: 's', name: 'Spotify', amt: 99, ts: D(2026, 9, 25), sub: true, cat: 'subs' };
      const old = { id: 'o', name: 'Eski', amt: 50, ts: D(2026, 7, 1), sub: true, end: D(2026, 9, 1) };
      const list = Domain.activeSubscriptions([netflix, spotify, old], D(2026, 10, 20));
      eq(list.map(s => [s.name, s.next]), [['Spotify', D(2026, 10, 25)], ['Netflix', D(2026, 11, 5, 10)]]);
    },
    'dönemin kalanına gelecek çekimler; hedefin günlük tutarı onlardan sonra'() {
      // Bu dönem 16 Eki – 15 Kas, bugün 20 Eki: 5 Kas'taki Netflix kalan güne düşer
      const end = D(2026, 11, 16);
      eq(Domain.upcomingCharges([netflix], D(2026, 10, 20), end), 229);
      eq(Domain.upcomingCharges([netflix], D(2026, 11, 6), end), 0, 'çekildi');
      const p = Domain.goalProgress(1000, 2000, D(2026, 10, 16), end, D(2026, 10, 20), 229);
      eq(p.remaining, 1000);
      eq(Math.round(p.perDay * p.daysLeft), 771);
    }
  });

  Test.group('Abonelik · metin ve yedek', {
    'sıradaki çekim ve ödeme'() {
      eq(Format.subNext(D(2026, 10, 20, 18), D(2026, 10, 20, 9)), 'Sıradaki bugün');
      eq(Format.subNext(D(2026, 10, 21), D(2026, 10, 20, 9)), 'Sıradaki yarın');
      eq(Format.subPay(netflix.ts), "Her ayın 5'i");
      eq(Format.subState({ ...netflix, end: D(2026, 10, 10) }, D(2026, 10, 20)), 'Bitti · 10 Eki');
      eq(Format.undoTitle('ended', 'Netflix'), 'Netflix aboneliği bitti');
    },
    'yedek abonelik ve bitişi korur; CSV "Her ay"'() {
      const items = [{ ...netflix, end: D(2026, 10, 10) }];
      const back = Backup.parse(Backup.json({ items, cutoff: 15, goal: 0 }, D(2026, 10, 20)));
      eq([back.items[0].sub, back.items[0].end], [true, D(2026, 10, 10)]);
      ok(Backup.csv(items).includes(';Her ay;'));
    }
  });
})();
