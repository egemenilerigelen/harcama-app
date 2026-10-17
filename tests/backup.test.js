// Backup: yedek yazma/okuma/doğrulama, birleştirme, CSV.
// Bağımlılık: Test, Backup
(() => {
  const { D, eq, ok, throws } = Test;
  const items = [
    { id: 'b', name: 'Market', amt: 450, inst: 1, ts: D(2026, 10, 6, 18) },
    { id: 'a', name: 'TV', amt: 300, inst: 3, ts: D(2026, 10, 5, 12) }
  ];

  Test.group('Backup · yedek', {
    'yazılan yedek aynen geri okunur'() {
      const back = Backup.parse(Backup.json({ items, cutoff: 12, goal: 9500 }, D(2026, 10, 17)));
      eq(back, { items, cutoff: 12, goal: 9500 });
    },
    'ham expenses_v1 dizisi de kabul edilir (ayarsız)'() {
      eq(Backup.parse(JSON.stringify(items)), { items, cutoff: null, goal: null });
    },
    'JSON olmayan dosya'() {
      throws(() => Backup.parse('merhaba'), 'Dosya okunamadı; JSON yedeği değil.');
    },
    'başka uygulamanın dosyası'() {
      throws(() => Backup.parse('{"app":"baska","expenses":[]}'), 'Bu dosya bir Harcama yedeği değil.');
    },
    'geçersiz kayıtlar elenir, sayılar düzeltilir'() {
      const text = JSON.stringify([
        { id: 'x', name: 'Tamam', amt: '450', ts: 1 },
        { name: 'Id yok', amt: 1, ts: 1 },
        { id: 'y', name: 'Tutar bozuk', amt: 'abc', ts: 1 }
      ]);
      eq(Backup.parse(text).items, [{ id: 'x', name: 'Tamam', amt: 450, inst: 1, ts: 1 }]);
    },
    'aralık dışı kesim günü ve eksi hedef alınmaz'() {
      const back = Backup.parse(JSON.stringify({ app: 'harcama', version: 1, cutoff: 29, goal: -5, expenses: [] }));
      eq([back.cutoff, back.goal], [null, null]);
    }
  });

  Test.group('Backup · birleştirme ve CSV', {
    'aynı id iki kez eklenmez, sonuç yeniden eskiye'() {
      const fresh = { id: 'c', name: 'Yeni', amt: 10, inst: 1, ts: D(2026, 10, 7) };
      const r = Backup.merge(items, [items[0], fresh]);
      eq(r.added, 1);
      eq(r.items.map(i => i.id), ['c', 'b', 'a']);
    },
    'CSV: BOM, ; ayırıcı, ondalık virgül, tırnaklı hücre'() {
      const csv = Backup.csv([{ id: 'a', name: 'A;B', amt: 300, inst: 3, ts: D(2026, 10, 5, 12) }]);
      ok(csv.startsWith('﻿'), 'BOM yok');
      eq(csv.slice(1).split('\r\n'), [
        'Tarih;Saat;Harcama;Tutar;Taksit;Taksit tutarı',
        '05.10.2026;12:00;"A;B";300,00;3;100,00',
        ''
      ]);
    }
  });
})();
