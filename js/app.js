// UYGULAMA: bileşenleri kurar ve birbirine bağlar (composition root).
// Veriye (Store) sadece burası erişir; bileşenler birbirini tanımaz,
// kendilerine verilen geri çağrılarla konuşur.
// Bağımlılık: Store, Domain ve tüm görünümler
class App {
  #undo;
  #detail;
  #home;
  #list;
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
    this.#home = new HomeView({ rowActions, onSeeAll: () => this.#seeAll() });
    this.#list = new ListView({ rowActions, onChange: () => this.refresh() });
    this.#settings = new SettingsView({
      onCutoffStep: d => this.#stepCutoff(d),
      onClear: () => this.#clear()
    });
    this.#tabs = new TabBar({ onShow: name => this.#onTab(name) });
    new EntryPanel({ onAdd: entry => this.#add(entry) });

    window.addEventListener('resize', () => this.#home.fit());
    // Fontlar yüklenince satır yükseklikleri değişebilir
    if (document.fonts) document.fonts.ready.then(() => this.#home.fit());

    this.#settings.showCutoff(Store.getCutoff());
    this.refresh();
  }

  // Tek yönlü render: veriyi bir kez okur, taksitleri bir kez açar, ekranlara dağıtır
  refresh() {
    const now = Date.now();
    const cutoff = Store.getCutoff();
    const model = {
      now,
      cutoff,
      periodStart: Domain.periodStart(now, cutoff),
      rows: Domain.visibleRows(Store.all(), cutoff, now)
    };
    this.#home.render(model);
    this.#list.render(model);
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

  #stepCutoff(d) {
    const day = Domain.clampCutoff(Store.getCutoff() + d);
    Store.setCutoff(day);
    this.#settings.showCutoff(day);
    this.refresh();
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
    if (name === 'home') this.#home.fit();
  }
}

new App();
