// ── Overlay Manager ──
// Pause overlay, level-up flash, and popup management.

import { updatePauseInfo } from './hud.js';

let pauseOverlay = null;

function getPauseOverlay() {
  if (!pauseOverlay) {
    pauseOverlay = document.getElementById('pause-overlay');
  }
  return pauseOverlay;
}

export function showPause(level, score) {
  updatePauseInfo(level, score);
  getPauseOverlay().classList.remove('hidden');
  document.getElementById('screen-game')?.classList.add('is-paused');
}

export function hidePause() {
  getPauseOverlay().classList.add('hidden');
  document.getElementById('screen-game')?.classList.remove('is-paused');
}

export function showLevelUpFlash(level) {
  const flash = document.createElement('div');
  flash.className = 'level-up-flash';
  flash.innerHTML = `<div class="level-up-rays"></div>
    <div class="level-up-card">
      <div class="level-up-kicker">Level geschafft</div>
      <div class="level-up-text">Level ${level}</div>
    </div>`;
  document.body.appendChild(flash);
  setTimeout(() => flash.remove(), 1000);
}
