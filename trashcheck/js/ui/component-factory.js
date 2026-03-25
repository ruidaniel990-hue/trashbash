// ── Component Factory [P2] ──
// Creates reusable UI elements programmatically.

export function createButton(text, className, onClick) {
  // TODO [P2]: Create styled button element
  const btn = document.createElement('button');
  btn.textContent = text;
  btn.className = className;
  if (onClick) btn.addEventListener('click', onClick);
  return btn;
}

export function createCard(title, content) {
  // TODO [P2]: Create styled card element
  const card = document.createElement('div');
  card.className = 'card';
  return card;
}
