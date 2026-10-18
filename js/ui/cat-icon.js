// KATEGORİ İKONLARI: 24'lük ızgarada ince çizgi. Renk CSS'te: data-cat taşıyan öğe kategorinin rengini
// (--c) verir, ikon currentColor ile çizilir. Anahtarlar Categories'te.
// Bağımlılık: svgEl, el
const CatIcon = Object.freeze({
  PATHS: Object.freeze({
    market: 'M4 9.5h16l-1.6 9a2 2 0 0 1-2 1.5H7.6a2 2 0 0 1-2-1.5L4 9.5zM8.5 9.5 12 4l3.5 5.5M9.5 13.5v3M14.5 13.5v3',
    food: 'M7 3v6.5a2 2 0 0 0 2 2V21M11 3v6.5a2 2 0 0 1-2 2M9 3v5.5M17 21V3c-2 1.5-3 4-3 7.5h3',
    transport: 'M5 16.5V12l1.7-4.4A2 2 0 0 1 8.6 6.3h6.8a2 2 0 0 1 1.9 1.3L19 12v4.5M4 16.5h16M5.5 16.5v2.5M18.5 16.5v2.5M5 12h14M8 14.3h.01M16 14.3h.01',
    subs: 'M17 3.5 20 6.5l-3 3M4 11.5V9.5a3 3 0 0 1 3-3h13M7 20.5l-3-3 3-3M20 12.5v2a3 3 0 0 1-3 3H4',
    shopping: 'M5.5 8h13l-1 12.5h-11L5.5 8zM9 10V6.5a3 3 0 0 1 6 0V10',
    bills: 'M6.5 3h11v18l-2-1.4-1.8 1.4-1.7-1.4-1.7 1.4-1.8-1.4-2 1.4V3zM9.5 8h5M9.5 11.5h5M9.5 15h3',
    health: 'M12 20s-8-5.2-8-10.7A4.3 4.3 0 0 1 12 7a4.3 4.3 0 0 1 8 2.3C20 14.8 12 20 12 20zM7.5 12h2.3l1.4-2.3 1.9 4.3 1.3-2h2',
    fun: 'M4 7h16v3a2 2 0 0 0 0 4v3H4v-3a2 2 0 0 0 0-4V7zM14.5 7v1.5M14.5 11v2M14.5 15.5V17',
    other: 'M6.5 12h.01M12 12h.01M17.5 12h.01'
  }),

  // Bilinmeyen anahtar "Diğer" ikonunu alır; ikon süs değil, ad yanında yazar (ekran okuyucu atlar)
  create(key) {
    const svg = svgEl('svg', { viewBox: '0 0 24 24', class: 'cat-ico' + (key === 'other' ? ' dots' : ''), 'aria-hidden': 'true' });
    svg.append(svgEl('path', { d: CatIcon.PATHS[key] || CatIcon.PATHS.other }));
    return svg;
  },

  // Nötr gömük kuyuda, kategorinin renginde çizilmiş ikon (satır ve Özet kartı)
  well(key) {
    const well = el('span', 'cat-well');
    well.dataset.cat = key;
    well.appendChild(CatIcon.create(key));
    return well;
  }
});
