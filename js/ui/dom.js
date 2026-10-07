// DOM YARDIMCILARI
const $ = id => document.getElementById(id);

// Eleman oluşturur; metin her zaman textContent ile yazılır (kullanıcı girdisi güvenli)
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

// SVG elemanı oluşturur (grafikler için)
function svgEl(tag, attrs = {}) {
  const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
  Object.keys(attrs).forEach(k => node.setAttribute(k, attrs[k]));
  return node;
}
