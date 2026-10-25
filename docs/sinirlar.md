# Bilinen sınırlar / fikirler

- İade nadir, şimdilik gerek yok.

Bekleyen bilinen konular (2026-10-12 genel kontrolünden):

- Takvim düğmesinin iPhone'un tarih seçicisini açması önizlemede denenemez; telefonda doğrulanacak.
- İki adımlı girişte isim panelinin klavyenin üstüne oturması ve klavyenin Devam'la kendiliğinden açılması önizlemede denenemez (iPhone klavyesi yok); telefonda doğrulanacak. Sırada: tutarı da hatırlayan çipler (ör. Netflix ₺229).
- Aramada önceki taksit satırları kendi günlerinde durur (gün başlığı onları da toplar); ayrı grup sadece dönem görünümünde.
- Titreşimin iPhone'da çalıştığı ve panelin parmakla çekilmesi önizlemede denenemez (iPhone yok); telefonda doğrulanacak.
- Hedef önerisi (`Domain.goalSuggestion`) ve ekstre grafiği, kayıtların başladığı yarım ilk dönemi tam ekstre gibi sayıyor; öneri olduğundan düşük çıkabilir. Şimdilik bekliyor.

## Sunucuya / gerçek zamanlı veriye geçiş (tasarım ve Faz 3'ten sonra)

Hedef: Supabase veya Firebase gibi CDN'den yüklenebilen, girişi ve gerçek zamanlı güncellemeyi sağlayan bir servis. Ayrı sunucu yazılmaz, derleme adımı eklenmez.

- Kolaylaştıran: veri sadece `Store` üzerinden ve sadece `App`'ten geçiyor; `App.refresh()` her değişimde baştan çiziyor (gerçek zamanlı dinleyici → `App.refresh()`); taksit/dönem hesapları istemcide, sunucuda sadece ham kayıtlar durur; id'ler cihazlar arası çakışmaz.
- Değişecekler: `Store` asenkron olur (etkisi `app.js` ile sınırlı: ekleme, silme, geri alma, açılış beklemeli); kullanıcı girişi; uygulama bir adreste yayınlanır (`file://` ile giriş çalışmaz, ör. GitHub Pages); `localStorage`'daki kayıtlar ilk girişte bir kez yüklenir (Faz 3'teki JSON yedekleme buna temel olur); çevrimdışı davranış seçilir; sunucuda "herkes sadece kendi verisini görür" kuralı yazılır.
- Ayarlar da taşınır: `cutoff_day_v1` ve `goal_v1` kullanıcı başına senkronlanmalı.
