// HARCAMA SATIRI: ana sayfa ve Harcamalar aynı satırı kullanır. Tek satır: solda kategori ikonu (kategorinin
// renginde çizgi, nötr kuyuda; kategori yazıyla tekrarlanmaz), ortada isim + taksit etiketi, sağda küçük gri
// saat/tarih ve tutar. Satır neyin açılıp silineceğini bilmez; eylemler dışarıdan verilir.
// Bağımlılık: Format, Touch, CatIcon, el, svgEl
const ExpenseRow = Object.freeze({
  // item: Domain.visibleRows satırı (cat: Domain.categorize), when: tutarın yanındaki saat/tarih,
  // actions: { onOpen(id), onDelete(id) } — id taksitliyse asıl kaydın id'si
  create(item, when, { onOpen, onDelete }) {
    const wrap = el('div', 'swipe');
    const row = el('div', 'row');

    const info = el('div', 'row-info');
    info.appendChild(el('span', 'n', item.name));
    if (item.parts) info.appendChild(el('span', 'tag', Format.part(item.part, item.parts)));

    row.append(CatIcon.well(item.cat), info, el('span', 't', when), el('span', 'a', Format.money(item.displayAmt)));
    // Sola kaydırınca satırın altından çıkan silme hapı (çöp ikonuyla); görünümü CSS'te
    const cap = el('span', 'swipe-cap');
    const icon = svgEl('svg', { viewBox: '0 0 24 24', 'aria-hidden': 'true' });
    icon.append(svgEl('path', { d: 'M4.5 7h15M10 11v6M14 11v6M6.5 7l1 12.5h9l1-12.5M9.5 7V4.5h5V7' }));
    cap.append(icon);
    const inner = el('div', 'swipe-in'); // silinirken yeri kapanabilsin diye (bkz. .swipe.gone)
    inner.append(cap, row);
    wrap.appendChild(inner);

    const id = item.rawId || item.id;
    row.dataset.id = id; // yeni kaydı bulup göstermek için (HomeView.flash)
    Touch.bindHighlight(row);
    Touch.bindSwipe(wrap, row, {
      onDelete: () => onDelete(id),
      onTap: () => onOpen(id)
    });
    return wrap;
  }
});
