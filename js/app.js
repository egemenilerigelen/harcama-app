// UYGULAMA: bileşenleri kurar ve birbirine bağlar (composition root).
// Veriye (Store) sadece burası erişir; bileşenler birbirini tanımaz,
// kendilerine verilen geri çağrılarla konuşur.
// Bağımlılık: Store, Domain ve tüm görünümler
class App {
  #undo;
  #detail;
  #goalSheet;
  #cutSheet;
  #model = null;
  #home;
  #list;
  #summary;
  #settings;
  #tabs;

  constructor() {
    // Satır eylemleri: ana sayfa ve Harcamalar aynı davranışı paylaşır
    const rowActions = {
      onOpen: id => this.#openDetail(id),
      onDelete: id => this.#delete(id)
    };

    this.#undo = new UndoBar({ onRestore: item => this.#restore(item) });
    this.#detail = new DetailSheet({ onDelete: id => this.#delete(id) });
    this.#goalSheet = new GoalSheet({ onSave: goal => this.#setGoal(goal) });
    this.#cutSheet = new CutoffSheet({ onSave: day => this.#setCutoff(day) });
    this.#home = new HomeView({ rowActions, onSeeAll: () => this.#seeAll() });
    this.#list = new ListView({ rowActions, onChange: () => this.refresh() });
    this.#summary = new SummaryView({
      onOpen: id => this.#openDetail(id),
      onEditGoal: () => this.#editGoal()
    });
    this.#settings = new SettingsView({
      onEditCutoff: () => this.#editCutoff(),
      onEditGoal: () => this.#editGoal(),
      onBackup: () => this.#backup(),
      onImport: () => this.#import(),
      onExportCsv: () => this.#exportCsv(),
      onClear: () => this.#clear()
    });
    this.#tabs = new TabBar({ onShow: name => this.#onTab(name) });
    new EntryPanel({ onAdd: entry => this.#add(entry) });

    // Ana ekran uygulaması kapanmadan arka planda bekler; öne gelince gün ya da dönem değişmiş olabilir
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) this.refresh();
    });
    window.addEventListener('resize', () => this.#fit());
    // Fontlar yüklenince satır yükseklikleri değişebilir
    if (document.fonts) document.fonts.ready.then(() => this.#fit());

    this.#settings.showCutoff(Store.getCutoff());
    this.#settings.showGoal(Store.getGoal());
    this.#settings.showInstall(!Device.isStandalone());
    this.refresh();
    document.body.classList.add('ready'); // açılış ekranı kalkar

    // Ana ekran uygulaması: internetsiz açılsın, veriler kendiliğinden silinmesin
    Device.registerOffline();
    Device.persistStorage();
  }

  // Tek yönlü render: veriyi bir kez okur, taksitleri bir kez açar, ekranlara dağıtır.
  // items: ham kayıtlar (taksit planları için), rows: ekrandaki satırlar
  refresh() {
    const now = Date.now();
    const cutoff = Store.getCutoff();
    const items = Store.all();
    const model = this.#model = {
      now,
      cutoff,
      goal: Store.getGoal(),
      periodStart: Domain.periodStart(now, cutoff),
      items,
      rows: Domain.visibleRows(items, cutoff, now)
    };
    this.#home.render(model);
    this.#list.render(model);
    this.#summary.render(model);
    this.#settings.showBackup(Store.getBackupAt(), now, Domain.backupDue(Store.getBackupAt(), now, items.length > 0));
  }

  #add({ name, amt, inst }) {
    Store.add(name, amt, inst);
    this.refresh();
    this.#home.flashNewest();
  }

  // Silme: taksitliyse asıl kayıt silinir; geri alma şeridi açılır
  #delete(id) {
    const removed = Store.all().find(e => e.id === id);
    Store.remove(id);
    if (removed) this.#undo.show(removed);
    this.refresh();
  }

  #restore(item) {
    Store.restore(item);
    this.refresh();
  }

  #openDetail(id) {
    const item = Store.all().find(e => e.id === id);
    if (item) this.#detail.open(item, Store.getCutoff(), Date.now());
  }

  #editCutoff() {
    this.#cutSheet.open(Store.getCutoff(), Date.now());
  }

  #setCutoff(day) {
    const cutoff = Domain.clampCutoff(day);
    Store.setCutoff(cutoff);
    this.#settings.showCutoff(cutoff);
    this.refresh();
  }

  // Hedef paneli: dokunma olayının içinden açılır (klavye için); geçmiş ekstrelerden öneri verir
  #editGoal() {
    const { now, cutoff, items, rows } = this.#model;
    this.#goalSheet.open(Store.getGoal(), Domain.goalSuggestion(items, rows, now, cutoff));
  }

  #setGoal(goal) {
    Store.setGoal(goal);
    this.#settings.showGoal(goal);
    this.refresh();
  }

  // YEDEK: harcamalar + kesim günü + hedef tek dosyada; paylaşımdan vazgeçilirse yedek sayılmaz
  async #backup() {
    const now = Date.now();
    const text = Backup.json({ items: Store.all(), cutoff: Store.getCutoff(), goal: Store.getGoal() }, now);
    if (!await Device.saveFile(Format.backupName(now), 'application/json', text)) return;
    Store.setBackupAt(now);
    this.refresh();
  }

  // GERİ YÜKLEME: kayıtlar birleştirilir (aynısı iki kez eklenmez); yedekteki kesim günü ve hedef alınır
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
    this.refresh();
    this.#settings.flash(Format.importResult(added, data.items.length - added));
  }

  #exportCsv() {
    const items = Store.all();
    if (!items.length) {
      this.#settings.flash('Dışa aktarılacak kayıt yok', true);
      return;
    }
    Device.saveFile(Format.csvName(Date.now()), 'text/csv', Backup.csv(items));
  }

  #clear() {
    Store.clear();
    this.#undo.hide();
    this.refresh();
  }

  // "Tümünü gör": Harcamalar bu dönemden açılır
  #seeAll() {
    this.#list.resetPeriod();
    this.refresh();
    this.#tabs.show('list');
  }

  #onTab(name) {
    this.#detail.close();
    this.#goalSheet.close();
    this.#cutSheet.close();
    if (name === 'home') this.#home.fit();
    if (name === 'summary') this.#summary.redraw();
  }

  // Ölçüye bağlı bileşenler: son harcamalar ve grafik
  #fit() {
    this.#home.fit();
    this.#summary.redraw();
  }
}

new App();
