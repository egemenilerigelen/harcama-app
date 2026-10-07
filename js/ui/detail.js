// KAYIT DETAYI: satıra dokununca alttan açılan panel
// Bağımlılık: BottomSheet, Domain, Format, $
class DetailSheet extends BottomSheet {
  #id = null;

  // onDelete(id): paneldeki "Harcamayı sil"
  constructor({ onDelete }) {
    super($('sheet'));
    $('dDel').onclick = () => {
      const id = this.#id;
      this.close();
      onDelete(id);
    };
  }

  // item: Store'daki asıl kayıt
  open(item, cutoff, now) {
    const parts = Math.max(1, Number(item.inst) || 1);
    const total = Number(item.amt) || 0;

    $('dName').textContent = item.name;
    $('dAmt').textContent = Format.money(total);
    $('dDate').textContent = Format.longDateTime(item.ts);
    $('dPay').textContent = Format.installment(parts) + (parts > 1 ? ' × ' + Format.money(total / parts) : '');

    // Kalan taksit: henüz gelmemiş taksitler
    const rest = Domain.remainingParts(item, cutoff, now);
    $('dRestRow').style.display = parts === 1 ? 'none' : '';
    $('dRest').textContent = rest ? rest + ' taksit · ' + Format.money(rest * total / parts) : 'Tamamlandı';

    this.#id = item.id;
    super.open();
  }
}
