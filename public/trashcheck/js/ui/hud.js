// ── HUD ──
// Centralizes all in-game HUD DOM updates.

import { CONFIG } from '../core/game-config.js';

// Cached DOM references (initialized on first use)
let els = null;

function getEls() {
  if (!els) {
    els = {
      score: document.getElementById('hud-score'),
      combo: document.getElementById('combo-val'),
      timer: document.getElementById('hud-timer'),
      timerBar: document.getElementById('timer-bar'),
      level: document.getElementById('hud-level'),
      hotspot: document.getElementById('hud-hotspot'),
      pauseInfo: document.getElementById('pause-info'),
    };
  }
  return els;
}

export function updateScore(value) {
  getEls().score.textContent = value;
}

export function updateCombo(value) {
  getEls().combo.textContent = '×' + value;
}

export function bumpCombo() {
  const el = getEls().combo;
  el.classList.remove('bump');
  void el.offsetWidth; // force reflow
  el.classList.add('bump');
}

export function updateTimer(timeLeft) {
  const e = getEls();
  e.timer.textContent = Math.ceil(timeLeft);
  e.timerBar.style.width = ((timeLeft / CONFIG.GAME_DURATION) * 100) + '%';
  if (timeLeft <= 10) {
    e.timerBar.classList.add('warn');
  }
}

export function updateLevel(level) {
  getEls().level.textContent = 'Level ' + level;
}

export function updateHotspot(hotspot) {
  const el = getEls().hotspot;
  if (el && hotspot) {
    el.textContent = hotspot.icon + ' ' + hotspot.name;
  }
}

export function updatePauseInfo(level, score) {
  getEls().pauseInfo.textContent = 'Level ' + level + ' · ' + score + ' Punkte';
}

export function resetHUD() {
  const e = getEls();
  e.score.textContent = '0';
  e.combo.textContent = '×1';
  e.timer.textContent = String(CONFIG.GAME_DURATION);
  e.timerBar.style.width = '100%';
  e.timerBar.classList.remove('warn');
  e.level.textContent = 'Level 1';
  if (e.hotspot) e.hotspot.textContent = '';
}

// Allow re-initialization (e.g. after DOM changes)
export function clearCache() {
  els = null;
}
