// SABİTLER: sihirli sayılar tek yerde; hiçbir dosyaya bağımlı değil
const Config = Object.freeze({
  DAY_MS: 864e5,

  // Hesap kesim günü: varsayılan ve sınırlar (29–31 her ayda olmadığı için kapalı)
  DEFAULT_CUTOFF: 15,
  CUTOFF_MIN: 1,
  CUTOFF_MAX: 28,

  // Ana sayfada en fazla kaç son harcama gösterilir
  RECENT_MAX: 3,

  // Süreler (ms)
  UNDO_MS: 4000,
  CONFIRM_MS: 2500,
  HAPTIC_MS: 12,

  // Yatay sürükleme: yön belirleme payı
  SWIPE_SLOP_PX: 8,

  // Kaydırarak silme: eşik ve animasyon süreleri
  SWIPE_DELETE_PX: 90,
  SWIPE_DELETE_RATIO: 0.3,
  SWIPE_OUT_MS: 160,
  SWIPE_BACK_MS: 200,

  // Dönem kartını kaydırma: geçiş eşiği, sınırda direnç, çıkış mesafesi, kayma süresi
  // (PAGER_SLIDE_MS, CSS'teki .period geçiş süresiyle aynı olmalı)
  PAGER_COMMIT_PX: 60,
  PAGER_COMMIT_RATIO: 0.25,
  PAGER_RESIST: 0.35,
  PAGER_OUT_RATIO: 1.1,
  PAGER_SLIDE_MS: 180,

  // Tutar ekranında yazının küçüldüğü karakter sayıları
  AMOUNT_SM_LEN: 9,
  AMOUNT_XS_LEN: 12,

  // Dönem hedefi: bu orandan sonra halka uyarı rengine döner; en fazla hane
  GOAL_WARN_RATIO: 0.8,
  GOAL_MAX_DIGITS: 9,

  // Sütun grafik: çizim alanı yüksekliği, üst boşluk (ölçek etiketi), x ekseni bandı,
  // sütun en fazla genişliği, sütunlar arası boşluk, uç yuvarlaklığı, ekstre görünümünde kaç dönem
  CHART_H: 132,
  CHART_TOP: 18,
  CHART_AXIS_H: 22,
  BAR_MAX_W: 24,
  BAR_GAP: 2,
  BAR_RADIUS: 4,
  CHART_PERIODS: 6
});
