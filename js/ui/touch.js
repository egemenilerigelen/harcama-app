// DOKUNMATİK: titreşim, basma efekti, yatay sürükleme (kaydırarak silme, sayfa kaydırma)
// Bağımlılık: Config, Haptics
const Touch = Object.freeze({
  haptic() {
    Haptics.tap();
  },

  // pointerdown'da gecikmesiz tetikler; basılıyken .pressed verir
  bindPress(btn, action) {
    const start = e => {
      e.preventDefault();
      btn.classList.add('pressed');
      Touch.haptic();
      action();
    };
    const end = () => btn.classList.remove('pressed');

    btn.addEventListener('pointerdown', start);
    btn.addEventListener('pointerup', end);
    btn.addEventListener('pointerleave', end);
    btn.addEventListener('pointercancel', end);
  },

  // Ortak yatay sürükleme izleyici: önce yönü belirler (dikeyse karışmaz),
  // sadece başlatan parmağı izler. ignore(e): bu dokunuşla başlama
  // onStart(): yatay sürükleme başladı, onMove(dx), onEnd(dx): bırakıldı
  trackHorizontal(el, { ignore, onStart, onMove, onEnd }) {
    let x0 = null, y0 = 0, dx = 0, axis = null, pointer = null;

    el.addEventListener('pointerdown', e => {
      if (ignore && ignore(e)) return;
      x0 = e.clientX; y0 = e.clientY; dx = 0; axis = null;
      pointer = e.pointerId;
    });

    el.addEventListener('pointermove', e => {
      // Sadece sürüklemeyi başlatan parmağı izle (ikinci parmak / fare karışmasın)
      if (x0 === null || e.pointerId !== pointer) return;
      const mx = e.clientX - x0, my = e.clientY - y0;
      if (!axis && Math.abs(mx) + Math.abs(my) > Config.SWIPE_SLOP_PX) {
        axis = Math.abs(mx) > Math.abs(my) ? 'x' : 'y';
        if (axis === 'x') {
          el.setPointerCapture(e.pointerId);
          onStart();
        }
      }
      if (axis !== 'x') return;
      dx = mx;
      onMove(dx);
    });

    const end = e => {
      if (x0 === null || e.pointerId !== pointer) return;
      x0 = null;
      if (axis === 'x') onEnd(dx);
    };

    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
  },

  // Satırı sola kaydırınca onDelete, kaydırmadan dokununca onTap.
  // wrap: kırmızı "Sil" zemini (--reveal genişliğinde) olan sarmalayıcı, row: kayan satır
  bindSwipe(wrap, row, { onDelete, onTap }) {
    let swiped = false;
    row.addEventListener('pointerdown', () => (swiped = false));

    const place = dx => {
      row.style.transform = dx ? 'translateX(' + dx + 'px)' : '';
      wrap.style.setProperty('--reveal', -dx + 'px');
    };

    Touch.trackHorizontal(row, {
      onStart: () => {
        row.style.transition = 'none';
        wrap.classList.add('on', 'dragging');
      },
      onMove: mx => place(Math.min(0, mx)),
      onEnd: mx => {
        const dx = Math.min(0, mx);
        swiped = true; // ardından gelen tıklama onTap'i tetiklemesin
        row.style.transition = '';
        wrap.classList.remove('dragging');
        if (dx < -Math.min(Config.SWIPE_DELETE_PX, row.offsetWidth * Config.SWIPE_DELETE_RATIO)) {
          row.style.transform = 'translateX(-100%)';
          wrap.style.setProperty('--reveal', '100%');
          Touch.haptic();
          setTimeout(onDelete, Config.SWIPE_OUT_MS);
        } else {
          place(0);
          setTimeout(() => wrap.classList.remove('on'), Config.SWIPE_BACK_MS);
        }
      }
    });

    row.addEventListener('click', () => {
      if (!swiped) onTap();
    });
  },

  // Kartı yatay kaydırarak önceki/sonraki sayfaya geçiş (dönem gezgini).
  // Parmak sağa: önceki (soldan gelir), sola: sonraki. Gidilemeyen yönde lastik gibi direnir.
  // canPrev()/canNext(): o yöne gidilebilir mi, onPrev()/onNext(): içeriği değiştir
  bindPager(el, { canPrev, canNext, onPrev, onNext }) {
    const move = (x, animate) => {
      el.classList.toggle('dragging', !animate);
      el.style.transform = x ? 'translateX(' + x + 'px)' : '';
    };

    Touch.trackHorizontal(el, {
      ignore: e => e.target.closest('button'), // oklar kendi işini yapar
      onStart: () => move(0, false),
      onMove: dx => {
        const allowed = dx > 0 ? canPrev() : canNext();
        move(allowed ? dx : dx * Config.PAGER_RESIST, false);
      },
      onEnd: dx => {
        const forward = dx < 0;
        const allowed = forward ? canNext() : canPrev();
        const far = Math.abs(dx) >= Math.min(Config.PAGER_COMMIT_PX, el.offsetWidth * Config.PAGER_COMMIT_RATIO);
        if (!allowed || !far) {
          move(0, true); // yerine yaylan
          return;
        }

        // Eski içerik kayarak çıkar, yenisi karşı taraftan girer
        const out = (forward ? -1 : 1) * el.offsetWidth * Config.PAGER_OUT_RATIO;
        Touch.haptic();
        el.style.opacity = '0';
        move(out, true);
        setTimeout(() => {
          (forward ? onNext : onPrev)();
          move(-out, false);
          void el.offsetWidth; // yeni başlangıç konumunu uygula
          el.style.opacity = '';
          move(0, true);
        }, Config.PAGER_SLIDE_MS);
      }
    });
  }
});
