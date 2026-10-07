// DOKUNMATİK: titreşim, basma efekti, kaydırarak silme
// Bağımlılık: Config
const Touch = Object.freeze({
  haptic() {
    if (navigator.vibrate) navigator.vibrate(Config.HAPTIC_MS);
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

  // Satırı sola kaydırınca onDelete, kaydırmadan dokununca onTap.
  // wrap: arkasında kırmızı "Sil" zemini olan sarmalayıcı, row: kayan satır
  bindSwipe(wrap, row, { onDelete, onTap }) {
    let x0 = null, y0 = 0, dx = 0, axis = null, swiped = false;

    row.addEventListener('pointerdown', e => {
      x0 = e.clientX; y0 = e.clientY; dx = 0; axis = null;
      swiped = false;
    });

    row.addEventListener('pointermove', e => {
      if (x0 === null) return;
      const mx = e.clientX - x0, my = e.clientY - y0;
      // Önce yönü belirle: dikeyse listenin kaymasına karışma
      if (!axis && Math.abs(mx) + Math.abs(my) > Config.SWIPE_SLOP_PX) {
        axis = Math.abs(mx) > Math.abs(my) ? 'x' : 'y';
        if (axis === 'x') {
          row.setPointerCapture(e.pointerId);
          row.style.transition = 'none';
          wrap.classList.add('on');
        }
      }
      if (axis !== 'x') return;
      dx = Math.min(0, mx);
      row.style.transform = 'translateX(' + dx + 'px)';
    });

    const end = () => {
      if (x0 === null) return;
      x0 = null;
      if (axis !== 'x') return;
      swiped = true; // ardından gelen tıklama onTap'i tetiklemesin
      row.style.transition = '';
      if (dx < -Math.min(Config.SWIPE_DELETE_PX, row.offsetWidth * Config.SWIPE_DELETE_RATIO)) {
        row.style.transform = 'translateX(-100%)';
        Touch.haptic();
        setTimeout(onDelete, 160);
      } else {
        row.style.transform = '';
        setTimeout(() => wrap.classList.remove('on'), 200);
      }
    };

    row.addEventListener('pointerup', end);
    row.addEventListener('pointercancel', end);
    row.addEventListener('click', () => {
      if (!swiped) onTap();
    });
  }
});
