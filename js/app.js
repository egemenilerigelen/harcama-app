// UYGULAMA: bileşenleri kurar ve birbirine bağlar (composition root).
// Veriye (Store) sadece burası erişir; bileşenler birbirini tanımaz,
// kendilerine verilen geri çağrılarla konuşur.
// Bağımlılık: Store, Domain, Config, Haptics, StatementDialog ve tüm görünümler
class App {
  #undo;
  #detail;
  #goalSheet;
  #cutSheet;
  #nameSheet;
  #statement;
  #entry;
  #model = null;
  #home;
  #list;
  #summary;
  #settings;
  #tabs;
  #tab = 'home'; // açık sekme: geri alma kapsülü ana sayfada kayan hanelerden sonra açılır
  #remember = () => null; // isme daha önce verilen kategori (tahmin yok; refresh kurar)

  constructor() {
    // Satır eylemleri: ana sayfa ve Harcamalar aynı davranışı paylaşır
    const rowActions = {
      onOpen: id => this.#openDetail(id),
      onDelete: id => this.#delete(id)
    };

    this.#undo = new UndoBar();
    this.#detail = new DetailSheet({
      onDelete: id => this.#delete(id),
      onSave: (id, changes) => this.#edit(id, changes),
      onEnd: id => this.#endSubscription(id)
    });
    this.#goalSheet = new GoalSheet({ onSave: goal => this.#setGoal(goal) });
    this.#cutSheet = new CutoffSheet({ onSave: day => this.#setCutoff(day) });
    this.#nameSheet = new NameSheet({ onAdd: entry => this.#add(entry) });
    this.#statement = new StatementDialog({ load: offset => this.#statementAt(offset) });
    this.#home = new HomeView({ rowActions, onSeeAll: () => this.#seeAll() });
    this.#list = new ListView({ rowActions, onChange: () => this.refresh() });
    this.#summary = new SummaryView({
      onOpen: id => this.#openDetail(id),
      onEditGoal: () => this.#editGoal(),
      onStatement: () => this.#openStatement(),
      onCategory: cat => this.#showCategory(cat)
    });
    this.#settings = new SettingsView({
      onHaptics: on => this.#setHaptics(on),
      onEditCutoff: () => this.#editCutoff(),
      onEditGoal: () => this.#editGoal(),
      onBackup: () => this.#backup(),
      onImport: () => this.#import(),
      onExportCsv: () => this.#exportCsv(),
      onClear: () => this.#clear()
    });
    this.#tabs = new TabBar({ onShow: name => this.#onTab(name) });
    this.#entry = new EntryPanel({ onNext: amt => this.#askName(amt) });

    // Ana ekran uygulaması kapanmadan arka planda bekler; öne gelince gün ya da dönem değişmiş olabilir
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) return;
      this.refresh();
      this.#offerStatement();
    });
    window.addEventListener('resize', () => this.#fit());
    // Fontlar yüklenince satır yükseklikleri değişebilir
    if (document.fonts) document.fonts.ready.then(() => this.#fit());

    Haptics.enabled = Store.getHaptics();
    this.#settings.showHaptics(Store.getHaptics());
    this.#settings.showCutoff(Store.getCutoff());
    this.#settings.showGoal(Store.getGoal());
    this.#settings.showInstall(!Device.isStandalone());
    this.refresh();
    document.body.classList.add('ready'); // açılış ekranı hemen kalkar (yapay bekleme yok)
    this.#offerStatement();

    // Ana ekran uygulaması: internetsiz açılsın, veriler kendiliğinden silinmesin
    Device.registerOffline();
    Device.persistStorage();
  }

  // Tek yönlü render: veriyi bir kez okur, taksitleri bir kez açar, ekranlara dağıtır.
  // items: kayıtlar (taksit planları için; kategorisi olmayan eski kayıtlar aynı isme verilenle ya da Diğer), rows: ekrandaki satırlar,
  // animate: değişiklik bir eylemden (ekleme, silme, geri alma) geldi; değişen toplamlar hareketle gösterilir
  refresh({ animate = false } = {}) {
    const now = Date.now();
    const cutoff = Store.getCutoff();
    const raw = Store.all();
    const learned = Domain.learnedCategories(raw);
    this.#remember = name => Domain.rememberedCategory(name, learned);
    const items = Domain.categorize(raw);
    const model = this.#model = {
      now,
      cutoff,
      goal: Store.getGoal(),
      goalLog: Store.getGoalLog(),
      periodStart: Domain.periodStart(now, cutoff),
      items,
      rows: Domain.visibleRows(items, cutoff, now),
      animate
    };
    this.#home.render(model);
    this.#list.render(model);
    this.#summary.render(model);
    this.#settings.showBackup(Store.getBackupAt(), now, Domain.backupDue(Store.getBackupAt(), now, items.length > 0));
  }

  // Giriş 2. adımı: tutar girildi, isim paneli sık kullanılan isimlerle açılır (dokunma olayının içinden)
  #askName(amt) {
    this.#nameSheet.open(amt, Domain.frequentNames(this.#model.items, Config.NAME_CHIPS_MAX), Date.now(), Store.getCutoff(), this.#remember);
  }

  // Ekleme: seçilen güne şimdiki saatle yazılır. Geri alma kapsülü yok (en sık işlem, her seferinde
  // bildirim yorar): yeni satır, kayan toplam ve titreşim yeterli onay; yanlışsa satır kaydırılıp silinir
  // Abonelik kategorisinde tek çekim kayıt abonelik olur: her ay kendiliğinden tekrar eder
  #add({ name, amt, inst, day, cat }) {
    const item = Store.add(name, amt, inst, Domain.atDay(day, Date.now()), cat, Domain.subscriptionEntry(cat, inst));
    this.#entry.clear();
    this.refresh({ animate: true });
    this.#home.flash(item.id);
  }

  // Silme: taksitliyse asıl kayıt silinir; geri alma kapsülü açılır
  #delete(id) {
    const removed = Store.all().find(e => e.id === id);
    Store.remove(id);
    if (removed) {
      const info = { kind: 'deleted', title: Format.undoTitle('deleted', removed.name), sub: Format.money(Number(removed.amt) || 0) };
      this.#offerUndo(info, () => this.#restore(removed));
    }
    this.refresh({ animate: true });
  }

  // Geri alma kapsülü: ana sayfada özet kartını örttüğü için kayan haneler bitmek üzereyken açılır
  #offerUndo(info, undo) {
    this.#undo.show(info, undo, this.#tab === 'home' ? Config.UNDO_DELAY_MS : 0);
  }

  // Düzenleme: geri alma kapsülü açılır, geri alınınca kayıt önceki haline döner. Kategori Abonelik'e
  // çevrilirse abonelik olur, çıkarılırsa tekrar etmez (elle girilmiş eski Abonelik kaydı tekrar etmeye başlamaz)
  #edit(id, changes) {
    const old = Store.all().find(e => e.id === id);
    if (!old) return;
    const before = Store.update(id, { ...changes, sub: Domain.subscriptionEntry(changes.cat, changes.inst, old) });
    const info = { kind: 'edited', title: Format.undoTitle('edited', changes.name), sub: Format.change(Number(before.amt) || 0, changes.amt) };
    this.#offerUndo(info, () => {
      Store.put(before);
      this.refresh({ animate: true });
    });
    this.refresh({ animate: true });
  }

  // Aboneliği bitir: bu andan sonra çekim olmaz, geçmiş çekimler kalır; geri alınabilir
  #endSubscription(id) {
    const before = Store.update(id, { end: Date.now() });
    if (!before) return;
    const info = { kind: 'edited', title: Format.undoTitle('ended', before.name), sub: Format.money(Number(before.amt) || 0) };
    this.#offerUndo(info, () => {
      Store.put(before);
      this.refresh({ animate: true });
    });
    this.refresh({ animate: true });
  }

  #restore(item) {
    Store.restore(item);
    this.refresh({ animate: true });
  }

  // Kategorisi olmayan eski kayıt Domain.categorize'ın verdiğiyle açılır; düzenlenip kaydedilince kategorisi yazılır
  #openDetail(id) {
    const item = this.#model.items.find(e => e.id === id);
    if (item) this.#detail.open(item, Store.getCutoff(), Date.now(), this.#remember);
  }

  // Titreşim açılınca hemen bir kez titrer: ne açıldığı hissedilsin
  #setHaptics(on) {
    Store.setHaptics(on);
    Haptics.enabled = on;
    if (on) Haptics.tap();
  }

  #editCutoff() {
    this.#cutSheet.open(Store.getCutoff(), Date.now());
  }

  // Kesim günü değişince geçmiş dönemler yeni güne göre yeniden hesaplanır (ekstre özetleri dahil). Son kapanan
  // ekstre kaydığı için "görüldü" işareti ona taşınır: yeni bir ekstre kapanmadan özet kendiliğinden yeniden açılmasın
  #setCutoff(day) {
    const cutoff = Domain.clampCutoff(day);
    Store.setCutoff(cutoff);
    const last = Domain.periodStart(Date.now(), cutoff, -1).getTime();
    if (Store.getStatementSeen() && Store.getStatementSeen() < last) Store.setStatementSeen(last);
    this.#settings.showCutoff(cutoff);
    this.refresh();
  }

  // Hedef paneli: dokunma olayının içinden açılır (klavye için); geçmiş ekstrelerden öneri verir
  #editGoal() {
    const { now, cutoff, items, rows } = this.#model;
    this.#goalSheet.open(Store.getGoal(), Domain.goalSuggestion(items, rows, now, cutoff));
  }

  // Özet'ten de Ayarlar'dan da buraya gelir; her değişiklik hedef geçmişine yazılır (eski ekstreler kendi hedefiyle)
  #setGoal(goal) {
    Store.setGoalLog(Domain.goalLogAdd(Store.getGoalLog(), Store.getGoal(), goal, Date.now()));
    Store.setGoal(goal);
    this.#settings.showGoal(goal);
    this.refresh();
  }

  // YEDEK: harcamalar + kesim günü + hedef + hedef geçmişi tek dosyada; paylaşımdan vazgeçilirse yedek sayılmaz
  async #backup() {
    const now = Date.now();
    const text = Backup.json({ items: Store.all(), cutoff: Store.getCutoff(), goal: Store.getGoal(), goals: Store.getGoalLog() }, now);
    if (!await Device.saveFile(Format.backupName(now), 'application/json', text)) return;
    Store.setBackupAt(now);
    this.refresh();
  }

  // GERİ YÜKLEME: kayıtlar birleştirilir (aynısı iki kez eklenmez); yedekteki kesim günü, hedef ve hedef geçmişi alınır
  async #import() {
    const text = await Device.pickFile('.json,application/json');
    if (text == null) return;
    let data;
    try {
      data = Backup.parse(text);
    } catch (e) {
      this.#settings.flash(e.message, true);
      return;
    }
    const { items, added } = Backup.merge(Store.all(), data.items);
    Store.replaceAll(items);
    if (data.cutoff) {
      Store.setCutoff(data.cutoff);
      this.#settings.showCutoff(data.cutoff);
    }
    if (data.goal) {
      Store.setGoal(data.goal);
      this.#settings.showGoal(data.goal);
    }
    if (data.goals) Store.setGoalLog(data.goals);
    this.refresh();
    this.#settings.flash(Format.importResult(added, data.items.length - added));
  }

  #exportCsv() {
    const items = Store.all();
    if (!items.length) {
      this.#settings.flash('Dışa aktarılacak kayıt yok', true);
      return;
    }
    Device.saveFile(Format.csvName(Date.now()), 'text/csv', Backup.csv(Domain.categorize(items)));
  }

  #clear() {
    Store.clear();
    this.#undo.hide();
    this.refresh();
  }

  // EKSTRE ÖZETİ: son kapanan ekstre (harcama yoksa null)
  #lastStatement() {
    const { now, cutoff, items, rows } = this.#model;
    return Domain.statementSummary(items, rows, cutoff, Domain.periodStart(now, cutoff, -1).getTime());
  }

  // Özet ekranının bir sayfası (offset: -1 son kapanan ...): o ekstrenin özeti (harcama yoksa null) ve kendi
  // hedefi; en eski kaydın dönemine kadar geri gidilir
  #statementAt(offset) {
    const { now, cutoff, items, rows, goal, goalLog } = this.#model;
    const start = Domain.periodStart(now, cutoff, offset).getTime();
    const end = Domain.periodStart(now, cutoff, offset + 1).getTime();
    const oldest = rows.length ? rows[rows.length - 1].ts : now;
    return {
      start,
      end,
      now,
      summary: Domain.statementSummary(items, rows, cutoff, start),
      goal: Domain.goalAt(goalLog, end, goal),
      canPrev: start > oldest
    };
  }

  // Başlıktaki bağlantıdan: son kapanan ekstre (harcama yoksa boş not), oradan geçmişe gezilir
  #openStatement() {
    this.#statement.open();
  }

  // Kesimden sonra ilk açılışta (ya da öne gelişte) kapanan ekstrenin özeti bir kez kendiliğinden açılır;
  // açılış ekranı kalkıp ana sayfa oturduktan sonra
  #offerStatement() {
    const s = this.#lastStatement();
    if (!s || Store.getStatementSeen() >= s.start) return;
    Store.setStatementSeen(s.start);
    setTimeout(() => this.#statement.open(), Config.STATEMENT_DELAY_MS);
  }

  // "Tümünü gör": Harcamalar bu dönemden açılır
  #seeAll() {
    this.#list.resetPeriod();
    this.refresh();
    this.#tabs.show('list');
  }

  // Özet'te kategoriye dokununca: Harcamalar bu dönemden, o kategoriyle süzülmüş açılır
  #showCategory(cat) {
    this.#list.showCategory(cat);
    this.refresh();
    this.#tabs.show('list');
  }

  #onTab(name) {
    this.#tab = name;
    this.#detail.close();
    this.#goalSheet.close();
    this.#cutSheet.close();
    this.#nameSheet.close();
    this.#statement.close();
    if (name === 'home') this.#home.fit();
    if (name === 'summary') {
      this.#summary.redraw();
      this.#summary.reveal();
    }
  }

  // Ölçüye bağlı bileşenler: son harcamalar ve grafik
  #fit() {
    this.#home.fit();
    this.#summary.redraw();
  }
}

new App();
