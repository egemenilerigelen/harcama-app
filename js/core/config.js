// SABİTLER: sihirli sayılar tek yerde; hiçbir dosyaya bağımlı değil
const Config = Object.freeze({
  // Yayın sürümü (Ayarlar'ın en altında): her push'ta artırılır ki telefonda yeni sürümün geldiği görülsün
  VERSION: '2026.10.25-3',

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
  // Geri alma kapsülü: basılı tutup bırakınca en az kalan süre, yukarı itince kapanma eşiği
  UNDO_MIN_MS: 800,
  // Ana sayfada kapsül, özet kartındaki kayan haneler bitmek üzereyken açılır (kart kapsülün altında
  // kalır; kapsül tepeden büyüyüp karta inene kadar haneler oturur, kullanıcı fazla beklemez)
  UNDO_DELAY_MS: 400,
  UNDO_SWIPE_PX: 24,
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

  // Kaydırarak silme: eşik, eşikten sonra ikonun satır kenarına uzaklığı ve animasyon süreleri
  // (SWIPE_COLLAPSE_MS, CSS'teki .swipe.gone geçişiyle aynı olmalı)
  SWIPE_DELETE_PX: 90,
  SWIPE_DELETE_RATIO: 0.3,
  SWIPE_ICON_EDGE_PX: 30,
  SWIPE_OUT_MS: 160,
  SWIPE_COLLAPSE_MS: 240,
  SWIPE_BACK_MS: 200,

  // Dönem kartını kaydırma: geçiş eşiği, sınırda direnç, çıkış mesafesi, kayma süresi
  // (PAGER_SLIDE_MS, CSS'teki .period geçiş süresiyle aynı olmalı)
  PAGER_COMMIT_PX: 60,
  PAGER_COMMIT_RATIO: 0.25,
  PAGER_RESIST: 0.35,
  PAGER_OUT_RATIO: 1.1,
  PAGER_SLIDE_MS: 180,

  // Kayan haneler (ana sayfa toplamları): bir hanenin kayma süresi (CSS'teki .slot animasyonuyla aynı
  // olmalı) ve haneler arası gecikme
  ROLL_MS: 460,
  ROLL_STAGGER_MS: 28,

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
  INST_VISIBLE: 3,

  // Özet açılış hareketi (uygulama açıldıktan sonra Özet'e ilk girişte bir kez): halka dolar, sütunlar
  // tabandan yükselir (sıra gecikmesi sütun sayısından bağımsız toplam), kategori şeridi soldan uzar.
  // Günlük ↔ Ekstre geçişinde sütunlar her seferinde daha kısa yükselir
  RING_REVEAL_MS: 600,
  BARS_REVEAL_MS: 350,
  BARS_REVEAL_SPREAD_MS: 150,
  STACK_REVEAL_MS: 400,
  BARS_SWITCH_MS: 250,
  BARS_SWITCH_SPREAD_MS: 80,

  // Kategoriler kartı: kapalıyken görünen satır; geçen döneme göre bu orandan ve tutardan (₺) küçük
  // farklar "aynı" sayılır (her kuruş farkı ok çıkarmasın)
  CAT_VISIBLE: 4,
  CAT_SAME_RATIO: 0.1,
  CAT_SAME_MIN: 50,

  // Abonelikler kartında sıradaki çekim bu kadar gün içindeyse vurgulanır
  SUB_SOON_DAYS: 3
});
