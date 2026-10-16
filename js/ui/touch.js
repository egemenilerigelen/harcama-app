// DOKUNMATİK: titreşim, basma efekti, sürükleme (kaydırarak silme, sayfa kaydırma, paneli aşağı çekip kapatma)
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

  // Ortak sürükleme izleyici: önce yönü belirler (axis 'x' ya da 'y'; öteki yöndeyse karışmaz),
  // sadece başlatan parmağı izler. ignore(e): bu dokunuşla başlama
  // onStart(): sürükleme başladı, onMove(d), onEnd(d, v): bırakıldı (d: eksendeki yol, v: son hız px/ms)
  trackDrag(el, axis, { ignore, onStart, onMove, onEnd }) {
    let x0 = null, y0 = 0, d = 0, dir = null, pointer = null, trail = [];

    el.addEventListener('pointerdown', e => {
      if (ignore && ignore(e)) return;
      x0 = e.clientX; y0 = e.clientY; d = 0; dir = null; trail = [];
      pointer = e.pointerId;
    });

    el.addEventListener('pointermove', e => {
      // Sadece sürüklemeyi başlatan parmağı izle (ikinci parmak / fare karışmasın)
      if (x0 === null || e.pointerId !== pointer) return;
      const mx = e.clientX - x0, my = e.clientY - y0;
      if (!dir && Math.abs(mx) + Math.abs(my) > Config.SWIPE_SLOP_PX) {
        dir = Math.abs(mx) > Math.abs(my) ? 'x' : 'y';
        if (dir === axis) {
          el.setPointerCapture(e.pointerId);
          onStart();
        }
      }
      if (dir !== axis) return;
      d = axis === 'x' ? mx : my;
      // Hız için son anların izi
      trail.push([e.timeStamp, d]);
      while (trail.length > 2 && e.timeStamp - trail[0][0] > Config.FLICK_WINDOW_MS) trail.shift();
      onMove(d);
    });

    const end = e => {
      if (x0 === null || e.pointerId !== pointer) return;
      x0 = null;
      if (dir !== axis) return;
      const [t0, d0] = trail[0] || [0, d];
      const [t1] = trail[trail.length - 1] || [0];
      // Parmak bırakmadan önce durduysa hız yok (fiske değil)
      const still = e.timeStamp - t1 > Config.FLICK_WINDOW_MS;
      onEnd(d, t1 > t0 && !still ? (d - d0) / (t1 - t0) : 0);
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

    Touch.trackDrag(row, 'x', {
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

    Touch.trackDrag(el, 'x', {
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
  },

  // Alttan paneli parmakla aşağı çekip kapatma (iOS'taki gibi): panel parmağı izler, yukarı
  // çekince lastik gibi direnir. Yeterince aşağı ya da hızlı çekilince onDismiss, yoksa yerine yaylanır.
  // onMove(dy): panelin kaydığı yol (arka plan buna göre solar), onDismiss(dy), onCancel()
  bindDismiss(panel, { onMove, onDismiss, onCancel }) {
    let dragged = false;
    panel.addEventListener('pointerdown', () => (dragged = false));

    Touch.trackDrag(panel, 'y', {
      onStart: () => {
        dragged = true;
        panel.classList.add('dragging');
      },
      onMove: dy => onMove(dy > 0 ? dy : dy * Config.SHEET_RESIST),
      onEnd: (dy, v) => {
        panel.classList.remove('dragging');
        const far = dy > Math.min(Config.SHEET_DISMISS_PX, panel.offsetHeight * Config.SHEET_DISMISS_RATIO);
        if (dy > 0 && (far || v > Config.SHEET_FLICK_V)) onDismiss(dy);
        else onCancel();
      }
    });

    // Sürükleme bittiğinde parmağın altındaki düğme tıklanmış sayılmasın
    panel.addEventListener('click', e => {
      if (!dragged) return;
      dragged = false;
      e.stopPropagation();
      e.preventDefault();
    }, true);
  }
});
