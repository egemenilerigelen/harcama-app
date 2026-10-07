// DOM YARDIMCILARI
const $ = id => document.getElementById(id);

// Eleman oluşturur; metin her zaman textContent ile yazılır (kullanıcı girdisi güvenli)
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
