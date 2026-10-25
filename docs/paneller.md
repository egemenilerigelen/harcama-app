# Alttan paneller

- Alttan paneller (`BottomSheet`) parmakla aşağı çekilerek de kapanır (`Touch.bindDismiss`): panel parmağı izler, arka plan kaydıkça solar, yukarı çekince direnir; `Config.SHEET_DISMISS_PX` / `SHEET_DISMISS_RATIO` kadar ya da hızlı (`SHEET_FLICK_V`) çekilince kapanır, yoksa yerine yaylanır. Panel `touch-action: pan-x` (çip şeridi yana kaymaya devam eder). Sürükleme bitince parmağın altındaki düğme tıklanmış sayılmaz. Her kapanış kayarak olur (`.sheet-wrap.closing`, `Config.SHEET_CLOSE_MS`).
