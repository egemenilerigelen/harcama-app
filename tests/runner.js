// TEST ÇALIŞTIRICI: derlemesiz, tarayıcıda. tests/index.html çekirdeği, bunu ve *.test.js dosyalarını
// yükler; test dosyaları Test.group ile kayıt olur, Test.run sonucu sayfaya yazar.
// Uygulamanın parçası değil (sw.js ASSETS'e girmez); sadece saf çekirdeği (core) dener.
// Bağımlılık: yok
const Test = (() => {
  const groups = [];

  // Yerel tarih (ay 1'den başlar, okunur olsun): D(2026, 10, 5, 14) → 5 Ekim 2026 14:00, ms
  const D = (y, m, d, h = 0, min = 0) => new Date(y, m - 1, d, h, min).getTime();

  // Karşılaştırma: sayı, metin ve düz nesne/dizi (JSON ile)
  const same = (a, b) => Object.is(a, b) || (typeof a === 'object' && JSON.stringify(a) === JSON.stringify(b));
  const show = v => typeof v === 'string' ? JSON.stringify(v) : JSON.stringify(v) ?? String(v);

  function eq(actual, expected, label = '') {
    if (!same(actual, expected)) throw new Error((label ? label + ': ' : '') + 'beklenen ' + show(expected) + ', gelen ' + show(actual));
  }

  function ok(value, label = 'doğru değil') {
    if (!value) throw new Error(label);
  }

  // Hata fırlatmalı; mesaj verilirse aynı olmalı
  function throws(fn, message) {
    try { fn(); } catch (e) {
      if (message !== undefined) eq(e.message, message, 'hata mesajı');
      return;
    }
    throw new Error('hata fırlatmadı');
  }

  // Grup: başlık + { test adı: fonksiyon }
  function group(title, tests) {
    groups.push({ title, tests });
  }

  function run(root) {
    let passed = 0, failed = 0;
    groups.forEach(({ title, tests }) => {
      const sec = document.createElement('section');
      const h = document.createElement('h2');
      h.textContent = title;
      sec.appendChild(h);
      Object.entries(tests).forEach(([name, fn]) => {
        const row = document.createElement('div');
        try {
          fn();
          passed++;
          row.className = 'pass';
          row.textContent = '✓ ' + name;
        } catch (e) {
          failed++;
          row.className = 'fail';
          row.textContent = '✗ ' + name + ' — ' + e.message;
        }
        sec.appendChild(row);
      });
      root.appendChild(sec);
    });
    const total = passed + failed;
    const summary = document.getElementById('summary');
    summary.textContent = failed ? failed + ' test kaldı · ' + passed + '/' + total + ' geçti' : 'Tüm testler geçti · ' + total;
    summary.className = failed ? 'fail' : 'pass';
    document.title = (failed ? '✗ ' : '✓ ') + passed + '/' + total + ' · Testler';
    // Önizlemeden okunabilsin
    window.testResults = { passed, failed };
  }

  return Object.freeze({ D, eq, ok, throws, group, run });
})();
