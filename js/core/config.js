// SABİTLER: sihirli sayılar tek yerde; hiçbir dosyaya bağımlı değil
const Config = Object.freeze({
  // Yayın sürümü (Ayarlar'ın en altında): her push'ta artırılır ki telefonda yeni sürümün geldiği görülsün
  VERSION: '2026.10.13-1',

  DAY_MS: 864e5,

  // Hesap kesim günü: varsayılan ve sınırlar (29–31 her ayda olmadığı için kapalı)
  DEFAULT_CUTOFF: 15,
  CUTOFF_MIN: 1,
  CUTOFF_MAX: 28,

  // Ana sayfada en fazla kaç son harcama gösterilir (sığdığı kadar; fazla yeri liste alır)
  RECENT_MAX: 5,

  // İsim adımında en fazla kaç sık kullanılan isim çipi
  NAME_CHIPS_MAX: 12,

  // Süreler (ms)
  UNDO_MS: 4000,
  CONFIRM_MS: 2500,
  STATUS_MS: 4000,

  // Yedek bu kadar gün eskiyse (ya da hiç alınmadıysa) Ayarlar'da uyarı rengiyle gösterilir
  BACKUP_WARN_DAYS: 30,

  // Titreşim süresi (Android; iPhone'da süre sistemin)
  HAPTIC_MS: 12,

  // Sürükleme: yön belirleme payı, bırakma hızının ölçüldüğü son an (ms)
  SWIPE_SLOP_PX: 8,
  FLICK_WINDOW_MS: 100,

  // Alttan paneli aşağı çekip kapatma: kapanma eşiği (px ya da panel boyunun oranı), hızlı fiske (px/ms),
  // yukarı çekince direnç, kapanış süresi (CSS'teki .sheet-wrap.closing geçişiyle aynı olmalı)
  SHEET_DISMISS_PX: 110,
  SHEET_DISMISS_RATIO: 0.35,
  SHEET_FLICK_V: 0.5,
  SHEET_RESIST: 0.2,
  SHEET_CLOSE_MS: 220,

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

  // Dönem hedefi: harcama oranı dönemin geçen kısmını bu paydan fazla geçerse halka uyarı rengine döner
  // (ör. dönemin %30'u geçmişken hedefin %40'ından fazlası harcandıysa); en fazla hane
  GOAL_PACE_SLACK: 0.1,
  GOAL_MAX_DIGITS: 9,

  // Hedef önerisi: son kaç bitmiş ekstrenin ortalaması, kaça yuvarlanır
  GOAL_SUGGEST_PERIODS: 3,
  GOAL_SUGGEST_ROUND: 100,

  // Sütun grafik: çizim alanı yüksekliği, üst boşluk (ölçek etiketi), x ekseni bandı,
  // sütun en fazla genişliği, sütunlar arası boşluk, uç yuvarlaklığı, ekstre görünümünde kaç dönem
  CHART_H: 132,
  CHART_TOP: 18,
  CHART_AXIS_H: 22,
  BAR_MAX_W: 24,
  BAR_GAP: 2,
  BAR_RADIUS: 4,
  CHART_PERIODS: 6,

  // Devam eden taksitler kartında kapalıyken görünen satır sayısı (fazlası "n taksit daha" ile açılır)
  INST_VISIBLE: 3
});
