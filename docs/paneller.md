# Alttan paneller

- Alttan paneller (`BottomSheet`) parmakla aşağı çekilerek de kapanır (`Touch.bindDismiss`): panel parmağı izler, arka plan kaydıkça solar, yukarı çekince direnir; `Config.SHEET_DISMISS_PX` / `SHEET_DISMISS_RATIO` kadar ya da hızlı (`SHEET_FLICK_V`) çekilince kapanır, yoksa yerine yaylanır. Panel `touch-action: pan-x` (çip şeridi yana kaymaya devam eder). Sürükleme bitince parmağın altındaki düğme tıklanmış sayılmaz. Her kapanış kayarak olur (`.sheet-wrap.closing`, `Config.SHEET_CLOSE_MS`).

## Ortada açılan ekran

- `CenterDialog` (`dialog.js`, `dialog.css`): arka plan kararır (bulanıklık yok: cam sadece alt sekme çubuğunda), kart ortada hafif büyüyerek belirir; `[data-close]` öğeleri (Kapat, arka plan) kapatır, kapanırken kart küçülerek solar (`Config.DIALOG_CLOSE_MS`). Ekranı aşan içerik kartın içinde kayar. Ekstre özeti (`StatementDialog`, `docs/ozet.md`) bundan türer.
