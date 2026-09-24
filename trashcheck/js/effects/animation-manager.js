// ── Animation Manager ──
// Programmatically triggers CSS animations for game feedback.

import { CONFIG } from '../core/game-config.js';

function restartClass(el, ...classes) {
  el.classList.remove(...classes);
  void el.offsetWidth;
  el.classList.add(...classes);
}

export function floatPoints(text, correct, binEl) {
  if (!binEl) return;
  const rect = binEl.getBoundingClientRect();
  const el = document.createElement('div');
  el.className = 'float-pts ' + (correct ? 'correct' : 'wrong');
  el.textContent = text;
  el.style.left = (rect.left + rect.width / 2) + 'px';
  el.style.top = (rect.top - 6) + 'px';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), CONFIG.FLOAT_POINTS_DURATION);
}

export function flashBin(binEl, correct) {
  if (!binEl) return;
  if (correct) restartClass(binEl, 'gulp');
  else restartClass(binEl, 'shake', 'flash-wrong');
}

// Pulses the bin the item actually belonged in, with a short label.
export function hintCorrectBin(binEl) {
  if (!binEl) return;
  restartClass(binEl, 'hint-correct');
  const tag = document.createElement('div');
  tag.className = 'bin-hint-tag';
  tag.textContent = 'Hier rein!';
  binEl.appendChild(tag);
  setTimeout(() => { binEl.classList.remove('hint-correct'); tag.remove(); }, 900);
}

// Flies the item from where it is right now into the bin's opening.
export function animateItemSort(itemEl, binEl) {
  if (!itemEl) return;
  const token = itemEl.querySelector('.item-token') || itemEl;
  const fall = itemEl.querySelector('.item-fall');
  if (fall) fall.style.animationPlayState = 'paused';

  const from = token.getBoundingClientRect();
  const current = new DOMMatrixReadOnly(getComputedStyle(itemEl).transform);
  let dx = 0;
  let dy = window.innerHeight * 0.4;
  if (binEl) {
    const to = binEl.querySelector('.bin-art')?.getBoundingClientRect() || binEl.getBoundingClientRect();
    dx = (to.left + to.width / 2) - (from.left + from.width / 2);
    dy = (to.top + to.height * 0.3) - (from.top + from.height / 2);
  }

  itemEl.classList.add('sorting');
  itemEl.style.transition = `transform ${CONFIG.ITEM_SORT_ANIM}ms cubic-bezier(0.45, 0, 0.9, 0.55), opacity ${CONFIG.ITEM_SORT_ANIM}ms ease-in`;
  itemEl.style.transform = `translate(${current.m41 + dx}px, ${current.m42 + dy}px) scale(0.32) rotate(${dx > 0 ? 25 : -25}deg)`;
  itemEl.style.opacity = '0';
  setTimeout(() => { if (itemEl.parentNode) itemEl.remove(); }, CONFIG.ITEM_SORT_ANIM);
}

// Missed item drops out of the play area instead of flying into a bin.
export function animateItemMiss(itemEl) {
  if (!itemEl) return;
  itemEl.style.transition = '';
  itemEl.style.transform = '';
  itemEl.classList.add('missed');
  setTimeout(() => { if (itemEl.parentNode) itemEl.remove(); }, 420);
}

let tipEl = null;
export function showTip(category) {
  if (tipEl) tipEl.remove();
  tipEl = document.createElement('div');
  tipEl.className = 'tip-toast';
  tipEl.innerHTML = `<span class="tip-label">Tipp · ${category.name}</span><span class="tip-text"></span>`;
  tipEl.querySelector('.tip-text').textContent = category.tip;
  document.body.appendChild(tipEl);
  const el = tipEl;
  setTimeout(() => { el.remove(); if (tipEl === el) tipEl = null; }, 3400);
}

export function shakeScreen(screenEl) {
  if (screenEl) restartClass(screenEl, 'jolt');
}

export function flashVignette(kind = 'wrong') {
  const el = document.createElement('div');
  el.className = 'vignette vignette-' + kind;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 450);
}

export function showBanner(text, variant = 'combo') {
  const el = document.createElement('div');
  el.className = 'banner banner-' + variant;
  el.innerHTML = `<span class="banner-text">${text}</span>`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1100);
}
