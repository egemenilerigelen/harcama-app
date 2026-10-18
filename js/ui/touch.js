// DOKUNMATİK: titreşim, basma efekti, sürükleme (kaydırarak silme, sayfa kaydırma, paneli aşağı çekip kapatma)
// Bağımlılık: Config, Haptics
const Touch = Object.freeze({
  // Kod içinden titreşim (kaydırma bitişi gibi dokunuş olmayan anlar): sadece Android'de
  haptic() {
    Haptics.tap();
  },

  // Öğeye dokununca titrer: iPhone'da gerçek dokunuşla (Haptics.attach), Android'de tıklamada
  hapticOn(el) {
    Haptics.attach(el);
    el.addEventListener('click', Touch.haptic);
  },

  // pointerdown'da gecikmesiz tetikler; basılıyken .pressed verir.
  // Titreşim: Android'de basınca, iPhone'da parmak kalkınca (Haptics.attach)
  bindPress(btn, action) {
    Haptics.attach(btn);
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
  // onStart(): sürükleme başladı, onMove(d), onEnd(d, v): bırakıldı (d: eksendeki yol, v: son hız px/ms),
  // onCancel(): dokunuş iptal edildi (pointercancel: tarayıcı listeyi kaydırmaya başladı ya da sistem
  // hareketi); bırakma sayılmaz, eylem yapılmaz. Verilmezse onEnd(0, 0): yerine dön
  trackDrag(el, axis, { ignore, onStart, onMove, onEnd, onCancel }) {
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

    const end = (e, cancelled) => {
      if (x0 === null || e.pointerId !== pointer) return;
      x0 = null;
      if (dir !== axis) return;
      // İptal bırakma değildir: parmak hâlâ ekrandayken satır silinmesin, panel kapanmasın
      if (cancelled) {
        if (onCancel) onCancel();
        else onEnd(0, 0);
        return;
      }
      const [t0, d0] = trail[0] || [0, d];
      const [t1] = trail[trail.length - 1] || [0];
      // Parmak bırakmadan önce durduysa hız yok (fiske değil)
      const still = e.timeStamp - t1 > Config.FLICK_WINDOW_MS;
      onEnd(d, t1 > t0 && !still ? (d - d0) / (t1 - t0) : 0);
    };

    el.addEventListener('pointerup', e => end(e, false));
    el.addEventListener('pointercancel', e => end(e, true));

    // Sürükleme bu eksende başladıktan sonra tarayıcı kaydırmayı devralmasın: kayan listede (Harcamalar)
    // parmak biraz dikey oynayınca iPhone listeyi kaydırmaya başlayıp dokunuşu iptal ediyordu.
    // Pointer olayı touch olayından önce gelir; yön belirlendiği hareketten itibaren engellenir
    el.addEventListener('touchmove', e => {
      if (x0 !== null && dir === axis) e.preventDefault();
    }, { passive: false });
  },

  // Satırı sola kaydırınca onDelete, kaydırmadan dokununca onTap.
  // wrap: silme hapını taşıyan sarmalayıcı (--reveal: açılan genişlik, --reveal-p: eşiğe oran,
  // --ico-x: ikonun sağdan uzaklığı; eşik geçilince .armed), row: kayan satır
  bindSwipe(wrap, row, { onDelete, onTap }) {
    let swiped = false;
    let limit = 0; // silme eşiği (px), sürükleme başında ölçülür
    row.addEventListener('pointerdown', () => (swiped = false));

    // İkon eşiğe kadar açılan alanın ortasında, eşikten sonra satırın kenarında.
    // Eşik geçilince (bırakırsan silinir) bir kez titrer (Android; iPhone'da hapın rengi söyler)
    const place = dx => {
      const reveal = -dx, armed = reveal > limit;
      row.style.transform = dx ? 'translateX(' + dx + 'px)' : '';
      wrap.style.setProperty('--reveal', reveal + 'px');
      wrap.style.setProperty('--reveal-p', limit ? Math.min(1, reveal / limit) : 0);
      wrap.style.setProperty('--ico-x', (armed ? reveal - Config.SWIPE_ICON_EDGE_PX : reveal / 2) + 'px');
      if (armed !== wrap.classList.contains('armed')) {
        wrap.classList.toggle('armed', armed);
        if (armed) Touch.haptic();
      }
    };

    // Sürükleme bitti: ardından gelen tıklama onTap'i tetiklemesin
    const release = () => {
      swiped = true;
      row.style.transition = '';
      wrap.classList.remove('dragging');
    };
    // Yerine yaylan (eşik geçilmediyse ya da dokunuş iptal edildiyse)
    const back = () => {
      place(0);
      setTimeout(() => wrap.classList.remove('on'), Config.SWIPE_BACK_MS);
    };

    Touch.trackDrag(row, 'x', {
      onStart: () => {
        limit = Math.min(Config.SWIPE_DELETE_PX, row.offsetWidth * Config.SWIPE_DELETE_RATIO);
        row.style.transition = 'none';
        wrap.classList.add('on', 'dragging');
      },
      onMove: mx => place(Math.min(0, mx)),
      onEnd: () => {
        release();
        if (!wrap.classList.contains('armed')) {
          back();
          return;
        }
        // Satır çıkar, ardından yeri kapanır (alttakiler yukarı kayar), sonra silinir
        place(-row.offsetWidth);
        setTimeout(() => {
          wrap.classList.add('gone');
          setTimeout(onDelete, Config.SWIPE_COLLAPSE_MS);
        }, Config.SWIPE_OUT_MS);
      },
      // Parmak kalkmadan iptal (liste kaydırma, sistem hareketi): eşik geçilmiş olsa da silinmez
      onCancel: () => {
        release();
        back();
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
