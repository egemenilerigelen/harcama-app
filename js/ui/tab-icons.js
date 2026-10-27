// SEKME İKONLARI: alt çubuktaki dört ikonun kısa hareketi (heroicons-animated'dan uyarlandı, MIT). Sekmeye
// dokununca ya da parmak çubukta gezerken üstüne gelince bir kez oynar. Dokunuşun kendi geri bildirimi olduğu
// için dokunma ve kaydırma onu kesmez (Motion.feedback); Hareketi Azalt'ta oynamaz.
// İkon hangi hareketi oynayacağını svg'deki data-icon ile söyler; parçaları sınıfla (.pct, .dot, .slice).
// Bağımlılık: Config, Motion
const TabIcons = Object.freeze({
  // tab: sekme düğmesi
  play(tab) {
    const svg = tab.querySelector('svg[data-icon]');
    const move = svg && TabIcons.MOVES[svg.dataset.icon];
    if (move) move(svg);
  },

  MOVES: Object.freeze({
    // Ev: hafifçe büyüyüp yukarı sekerek yerine döner
    home(svg) {
      Motion.feedback(svg, [{ transform: 'none' }, { transform: 'translateY(-1px) scale(1.1)' }, { transform: 'none' }], Config.ICON_HOME_MS);
    },

    // Fiş: yüzde çizgisi baştan çizilir (pathLength 1), iki nokta sırayla belirip yerine oturur
    receipt(svg) {
      const line = svg.querySelector('.pct');
      Motion.feedback(line, [{ strokeDasharray: '0 1' }, { strokeDasharray: '1 0' }], Config.ICON_DRAW_MS);
      Motion.feedback(line, [{ opacity: 0 }, { opacity: 1 }], Config.ICON_FADE_MS);
      svg.querySelectorAll('.dot').forEach((dot, i) => Motion.feedback(dot,
        [{ transform: 'scale(0)', opacity: 0 }, { transform: 'scale(1.2)', opacity: 1 }, { transform: 'none', opacity: 1 }],
        Config.ICON_DOT_MS, '--ease', Config.ICON_DOT_DELAYS[i]));
    },

    // Pasta: dilim yaylanarak dışarı çıkıp yerine döner
    pie(svg) {
      Motion.feedback(svg.querySelector('.slice'),
        [{ transform: 'none' }, { transform: 'translate(1.1px, -1.1px)' }, { transform: 'none' }], Config.ICON_PIE_MS);
    },

    // Dişli: yaylı yarım tur (altı dişli simetrik: bitince başa dönüşü görünmez)
    gear(svg) {
      Motion.feedback(svg, [{ transform: 'none' }, { transform: 'rotate(180deg)' }], Config.ICON_GEAR_MS, '--spring');
    }
  })
});
