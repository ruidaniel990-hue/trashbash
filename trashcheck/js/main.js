// ── Trashcheck Entry Point ──
// Boots the game, wires up input, and exposes functions for HTML onclick handlers.

import { initStart, startGame, startLevel, togglePause, quitGame, sortItem, goToHub, openShop, openAvatar, replayLastRun } from './core/game-engine.js';
import { setupInput } from './core/game-input.js';

// Expose to window for onclick handlers in HTML
window.startGame = startGame;
window.startLevel = startLevel;
window.togglePause = togglePause;
window.quitGame = quitGame;
window.goToHub = goToHub;
window.openShop = openShop;
window.openAvatar = openAvatar;
window.replayLastRun = replayLastRun;

// Boot
window.addEventListener('load', () => {
  initStart();

  const zone = document.getElementById('fall-zone');
  if (zone) {
    setupInput(zone, sortItem);
  }
});
