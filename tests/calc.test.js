// Calc: tuş takımı kuralları (sadece rakam ve nokta, en fazla 9 hane, 2 ondalık, tek nokta).
// Bağımlılık: Test, Calc
(() => {
  const { eq } = Test;
  // Tuş dizisini basar, ham değeri döner: type('12.5') → "12.5"
  const type = (keys, c = new Calc()) => { [...keys].forEach(k => c.press(k)); return c.raw(); };

  Test.group('Calc · tuş takımı', {
    'baştaki sıfırın yerine rakam yazılır'() {
      eq(type('05'), '5');
    },
    'nokta önce basılırsa "0."'() {
      eq(type('.'), '0.');
    },
    'tek nokta'() {
      eq(type('1..2.'), '1.2');
    },
    'en fazla 2 ondalık'() {
      eq(type('1.239'), '1.23');
    },
    'en fazla 9 hane (nokta sayılmaz)'() {
      eq(type('1234567890'), '123456789');
      eq(type('12345678.99'), '12345678.9');
    },
    'silme, sıfırlama, sayısal değer'() {
      const c = new Calc();
      type('12.5', c);
      c.back();
      eq(c.raw(), '12.');
      eq(c.value(), 12);
      c.reset();
      eq([c.raw(), c.value()], ['', 0]);
    },
    'düzenlemede tutarı yerleştirir'() {
      const c = new Calc();
      c.set(12.5);
      eq(c.raw(), '12.5');
      c.set(0);
      eq(c.raw(), '');
    }
  });
})();
