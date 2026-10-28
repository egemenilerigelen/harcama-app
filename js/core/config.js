// SABİTLER: sihirli sayılar tek yerde; hiçbir dosyaya bağımlı değil
const Config = Object.freeze({
  // Yayın sürümü (Ayarlar'ın en altında): her push'ta artırılır ki telefonda yeni sürümün geldiği görülsün
  VERSION: '2026.10.28-8',

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
  // Satırın basma zemini: parmak kalkınca da en az bu kadar görünür (kısa dokunuş fark edilsin)
  PRESS_MIN_MS: 180,

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

  // Hedef halkasının rengi doluluğa göre ısınır: bu orana kadar altın, sonra turuncuya döner, burada tam
  // turuncu, %100'e doğru kırmızıya geçer (tempo uyarısında en az turuncu)
  RING_HEAT_FROM: 0.5,
  RING_HEAT_FULL: 0.8,

  // Hedef geçmişi: en fazla kaç değişiklik saklanır (eskiler düşer)
  GOAL_LOG_MAX: 100,

  // Hedef önerisi: son kaç bitmiş ekstrenin ortalaması, kaça yuvarlanır
  GOAL_SUGGEST_PERIODS: 3,
  GOAL_SUGGEST_ROUND: 100,

  // Sütun grafik: çizim alanı yüksekliği, üst boşluk (en üst eksen değeri), alttaki tarih şeridi ve etiketin
  // tabandan uzaklığı, sağdaki Y ekseni şeridi; Y ekseni değeri çizginin ne kadar üstünde, günlükte tarih kesikli
  // çizginin ne kadar sağında; sütun genişliği slotun oranı (en fazla BAR_MAX_W, ekstrede kalın olmasın), üst köşe
  // yarıçapı sütun genişliğinin oranı; günlükte kaç günde bir kesikli ayırıcı, ekstre görünümünde kaç dönem
  CHART_H: 132,
  CHART_TOP: 18,
  CHART_AXIS_H: 22,
  CHART_TICK_Y: 15,
  CHART_AXIS_W: 52,
  CHART_LABEL_RISE: 3,
  CHART_LABEL_PAD: 4,
  BAR_WIDTH_RATIO: 0.62,
  BAR_MAX_W: 24,
  BAR_RADIUS_RATIO: 0.25,
  CHART_WEEK_DAYS: 7,
  CHART_PERIODS: 6,
  // Günlük grafikte tek bir dev gün diğerlerini ezmesin: en az CHART_CLIP_MIN dolu gün varken, dolu günlerin
  // CHART_CLIP_PCT dilimindeki değerin CHART_CLIP_RATIO katını aşan sütunlar ölçeğin tepesinde kesik çizilir
  // (gövde ile başlık arasında CHART_CLIP_CUT boşluk, başlık CHART_CLIP_CAP yüksekliğinde); değeri dokununca okunur
  CHART_CLIP_MIN: 4,
  CHART_CLIP_PCT: 0.75,
  CHART_CLIP_RATIO: 3,
  CHART_CLIP_CUT: 3,
  CHART_CLIP_CAP: 6,

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
  SUB_SOON_DAYS: 3,

  // Dönem sonu tahmini: dönemin kaçıncı gününden itibaren (tempo otursun)
  FORECAST_MIN_DAYS: 5,

  // Ana sayfa: kesime bu kadar gün (ya da daha az) kalınca dönem aralığının yerinde kısa not
  CUTOFF_NOTE_DAYS: 2,

  // Ekstre özeti: kaç büyük harcama gösterilir; kesimden sonra kendiliğinden açılmadan önceki bekleme
  // (açılış ekranı kalksın, ana sayfa otursun); ortadaki ekranın kapanış süresi (CSS'teki
  // .dialog-wrap.closing geçişiyle aynı olmalı)
  STATEMENT_TOP: 3,
  // Haberler: en fazla kaç satır; rekor (en düşük / en yüksek ekstre) için en az ve en çok kaç önceki ekstre
  STATEMENT_NEWS_MAX: 3,
  STATEMENT_RECORD_MIN: 2,
  STATEMENT_RECORD_PERIODS: 5,
  STATEMENT_DELAY_MS: 450,
  // Alt çubuk ikonlarının hareketi (TabIcons; heroicons-animated'ın süreleri): ev, fişte yüzde çizgisinin çizilmesi
  // ve belirmesi, noktalar ve sırayla gecikmeleri, pasta dilimi, dişli
  ICON_HOME_MS: 400,
  ICON_DRAW_MS: 400,
  ICON_FADE_MS: 100,
  ICON_DOT_MS: 300,
  ICON_DOT_DELAYS: [200, 350],
  ICON_PIE_MS: 500,
  ICON_GEAR_MS: 800,
  DIALOG_CLOSE_MS: 200
});
