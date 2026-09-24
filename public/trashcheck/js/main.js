// ── Trashcheck Entry Point ──
// Boots the game, wires up input, and exposes functions for HTML onclick handlers.

import { initStart, startGame, startLevel, togglePause, quitGame, sortItem, goToHub, openShop, openAvatar } from './core/game-engine.js';
import { setupInput } from './core/game-input.js';
import { watchIcons, iconHtml } from './ui/icons.js';
import { unlockAudio, toggleMute, isMuted } from './effects/audio-manager.js';
import { CATEGORIES } from './core/game-data.js';

// Expose to window for onclick handlers in HTML
window.startGame = startGame;
window.startLevel = startLevel;
window.togglePause = togglePause;
window.quitGame = quitGame;
window.goToHub = goToHub;
window.openShop = openShop;
window.openAvatar = openAvatar;

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

// Boot
window.addEventListener('load', () => {
  watchIcons(document.body);
  unlockAudio();
  renderMuteButtons();
  fillStartRain();
  initStart();

  const zone = document.getElementById('fall-zone');
  if (zone) {
    setupInput(zone, sortItem);
  }
});
