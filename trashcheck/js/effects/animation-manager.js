// ── Animation Manager ──
// Programmatically triggers CSS animations for game feedback.

import { CONFIG } from '../core/game-config.js';

export function floatPoints(text, correct, binEl) {
  if (!binEl) return;
  const rect = binEl.getBoundingClientRect();
  const el = document.createElement('div');
  el.className = 'float-pts ' + (correct ? 'correct' : 'wrong');
  el.textContent = text;
  el.style.left = (rect.left + rect.width / 2) + 'px';
  el.style.top = (rect.top - 10) + 'px';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), CONFIG.FLOAT_POINTS_DURATION);
}

export function flashBin(binEl, correct) {
  if (!binEl) return;
  if (correct) {
    binEl.classList.remove('flash-right');
    void binEl.offsetWidth;
    binEl.classList.add('flash-right');
  } else {
    binEl.classList.remove('shake', 'flash-wrong');
    void binEl.offsetWidth;
    binEl.classList.add('shake', 'flash-wrong');
  }
}

export function animateItemSort(itemEl, binIndex) {
  if (!itemEl) return;
  const positions = ['10%', '50%', '90%'];
  itemEl.style.transition = 'all 0.3s ease-in';
  itemEl.style.left = positions[binIndex];
  itemEl.style.top = '85%';
  itemEl.style.opacity = '0.3';
  itemEl.style.transform = 'translateX(-50%) scale(0.5)';
  setTimeout(() => { if (itemEl.parentNode) itemEl.remove(); }, CONFIG.ITEM_SORT_ANIM);
}
