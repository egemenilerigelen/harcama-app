// HARCAMA SATIRI: ana sayfa ve Harcamalar aynı satırı kullanır.
// Satır neyin açılıp silineceğini bilmez; eylemler dışarıdan verilir.
// Bağımlılık: Format, Touch, el
const ExpenseRow = Object.freeze({
  // item: Domain.visibleRows satırı, when: soldaki saat/tarih metni,
  // actions: { onOpen(id), onDelete(id) } — id taksitliyse asıl kaydın id'si
  create(item, when, { onOpen, onDelete }) {
    const wrap = el('div', 'swipe');
    const row = el('div', 'row');

    const info = el('div', 'row-info');
    info.appendChild(el('span', 'n', item.name));
    if (item.parts) info.appendChild(el('span', 'tag', Format.part(item.part, item.parts)));

    // Saat/tarih solda, ekstre gibi
    row.append(el('span', 't', when), info, el('span', 'a', Format.money(item.displayAmt)));
    wrap.appendChild(row);

    const id = item.rawId || item.id;
    row.dataset.id = id; // yeni kaydı bulup göstermek için (HomeView.flash)
    Touch.bindSwipe(wrap, row, {
      onDelete: () => onDelete(id),
      onTap: () => onOpen(id)
    });
    return wrap;
  }
});
