// ── Trashcheck Entry Point ──
// Boots the game, wires up input, and exposes functions for HTML onclick handlers.

import { initStart, setStartRenderer, startGame, startLevel, togglePause, quitGame, sortItem, goToHub, openShop, openAvatar } from './core/game-engine.js';
import { setupInput } from './core/game-input.js';
import { watchIcons, iconHtml } from './ui/icons.js';
import { unlockAudio, toggleMute, isMuted } from './effects/audio-manager.js';
import { CATEGORIES } from './core/game-data.js';
import { getDailyTask } from './progress/daily.js';
import { getStartSpots, getSelectedStartId, setSelectedStart } from './progress/unlocks.js';
import { getActiveEffects, getEquipped } from './shop/shop-manager.js';
import { getItemById } from './shop/shop-data.js';
import { resetTutorial } from './progress/tutorial.js';

// Expose to window for onclick handlers in HTML
window.startGame = startGame;
window.startLevel = startLevel;
window.togglePause = togglePause;
window.quitGame = quitGame;
window.goToHub = goToHub;
window.openShop = openShop;
window.openAvatar = openAvatar;
window.showStart = initStart;
window.replayTutorial = () => {
  resetTutorial();
  startGame();
};

function renderMuteButtons() {
  const muted = isMuted();
  document.querySelectorAll('.btn-mute').forEach(btn => {
    btn.classList.toggle('is-muted', muted);
    btn.setAttribute('aria-pressed', String(muted));
    btn.setAttribute('aria-label', muted ? 'Ton an' : 'Ton aus');
  });
}

window.toggleSound = () => {
  toggleMute();
  renderMuteButtons();
};

// Gently falling trash behind the start screen
function fillStartRain() {
  const rain = document.getElementById('start-rain');
  if (!rain) return;
  const items = Object.values(CATEGORIES).flatMap(c => c.items);
  let html = '';
  for (let i = 0; i < 12; i++) {
    const item = items[Math.floor(Math.random() * items.length)];
    const style = `--x:${(i / 12 * 100 + Math.random() * 6).toFixed(1)}%;--d:${(9 + Math.random() * 7).toFixed(1)}s;--delay:${(-Math.random() * 16).toFixed(1)}s;--s:${(0.7 + Math.random() * 0.6).toFixed(2)};--r:${Math.round(Math.random() * 360)}deg`;
    html += `<span class="rain-item" style="${style}">${iconHtml(item.emoji)}</span>`;
  }
  rain.innerHTML = html;
}

function renderDaily() {
  const card = document.getElementById('daily-card');
  if (!card) return;
  const task = getDailyTask();
  card.classList.toggle('is-done', task.done);
  card.innerHTML = `
    <div class="daily-icon">${iconHtml(task.icon)}</div>
    <div class="daily-body">
      <div class="daily-kicker">Tagesaufgabe</div>
      <div class="daily-text"></div>
      <div class="daily-bar"><span style="width:${Math.round(task.progress / task.target * 100)}%"></span></div>
    </div>
    <div class="daily-reward">${task.done ? '✓' : '+' + task.reward + ' ' + iconHtml('🪙')}</div>`;
  card.querySelector('.daily-text').textContent = task.done ? 'Geschafft – morgen gibt es eine neue!' : `${task.text} (${task.progress}/${task.target})`;
}

function renderSpots() {
  const box = document.getElementById('spot-picker');
  if (!box) return;
  const spots = getStartSpots();
  const selected = getSelectedStartId();
  box.innerHTML = spots.map(spot => `
    <button class="spot${spot.id === selected ? ' is-selected' : ''}" data-spot="${spot.id}" ${spot.unlocked ? '' : 'disabled'}
      aria-pressed="${spot.id === selected}" aria-label="${spot.name}${spot.unlocked ? '' : ' (ab Level ' + spot.level + ')'}">
      <span class="spot-icon">${iconHtml(spot.unlocked ? spot.icon : '🔒')}</span>
      <span class="spot-name">${spot.unlocked ? spot.name : 'Level ' + spot.level}</span>
    </button>`).join('');
  box.querySelectorAll('.spot:not([disabled])').forEach(btn => {
    btn.addEventListener('click', () => {
      setSelectedStart(btn.dataset.spot);
      renderSpots();
    });
  });
}

function renderEquipment() {
  const row = document.getElementById('equip-row');
  if (!row) return;
  const items = Object.values(getEquipped()).map(getItemById).filter(Boolean);
  const fx = getActiveEffects();
  const parts = [];
  if (fx.timeBonusCorrect) parts.push('+' + fx.timeBonusCorrect + ' s pro Treffer');
  if (fx.comboShield) parts.push(fx.comboShield + '× Combo-Schutz pro Level');
  if (fx.coinMultiplier > 1) parts.push('+' + Math.round((fx.coinMultiplier - 1) * 100) + ' % Münzen');
  row.hidden = items.length === 0;
  row.innerHTML = `<span class="equip-icons">${items.map(i => iconHtml(i.icon)).join('')}</span>
    <span class="equip-text">${parts.length ? parts.join(' · ') : 'Nur kosmetisch'}</span>`;
}

function renderStartExtras() {
  renderDaily();
  renderSpots();
  renderEquipment();
}

// Boot
window.addEventListener('load', () => {
  watchIcons(document.body);
  unlockAudio();
  renderMuteButtons();
  fillStartRain();
  setStartRenderer(renderStartExtras);
  initStart();

  const zone = document.getElementById('fall-zone');
  if (zone) {
    setupInput(zone, sortItem);
  }
});
