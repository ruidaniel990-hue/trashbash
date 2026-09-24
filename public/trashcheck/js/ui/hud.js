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
      comboChip: document.getElementById('hud-combo'),
      timer: document.getElementById('hud-timer'),
      timerBar: document.getElementById('timer-bar'),
      level: document.getElementById('hud-level'),
      hotspot: document.getElementById('hud-hotspot'),
      pauseInfo: document.getElementById('pause-info'),
    };
  }
  return els;
}

function comboTier(value) {
  if (value >= 8) return 3;
  if (value >= 5) return 2;
  if (value >= 3) return 1;
  return 0;
}

export function updateScore(value) {
  const el = getEls().score;
  el.textContent = value;
  el.classList.remove('bump');
  void el.offsetWidth;
  el.classList.add('bump');
}

export function updateCombo(value) {
  const e = getEls();
  e.combo.textContent = '×' + value;
  if (e.comboChip) e.comboChip.dataset.tier = comboTier(value);
}

export function bumpCombo() {
  const el = getEls().comboChip || getEls().combo;
  el.classList.remove('bump');
  void el.offsetWidth; // force reflow
  el.classList.add('bump');
}

export function updateShield(count) {
  const el = document.getElementById('hud-shield');
  if (!el) return;
  el.hidden = count <= 0;
  el.textContent = '🛡️' + count;
}

export function setFrozen(frozen) {
  getEls().timer.parentElement.classList.toggle('frozen', frozen);
  document.getElementById('screen-game')?.classList.toggle('is-frozen', frozen);
}

export function updateTimer(timeLeft) {
  const e = getEls();
  const ratio = Math.max(0, Math.min(1, timeLeft / CONFIG.GAME_DURATION));
  e.timer.textContent = Math.ceil(timeLeft);
  e.timerBar.style.width = (ratio * 100) + '%';
  // Hue slides from green (140) to red (0) as time runs out
  e.timerBar.style.setProperty('--hue', Math.round(140 * Math.min(1, ratio * 1.6)));
  const warn = timeLeft <= 10;
  e.timerBar.classList.toggle('warn', warn);
  e.timer.parentElement.classList.toggle('warn', warn);
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
  updateCombo(1);
  updateTimer(CONFIG.GAME_DURATION);
  e.level.textContent = 'Level 1';
  if (e.hotspot) e.hotspot.textContent = '';
}

// Allow re-initialization (e.g. after DOM changes)
export function clearCache() {
  els = null;
}
