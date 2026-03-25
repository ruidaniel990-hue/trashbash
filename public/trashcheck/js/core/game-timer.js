// ── Game Timer ──
// Manages the countdown timer with configurable tick callbacks.

import { state } from '../state/game-state.js';
import { CONFIG } from './game-config.js';
import { updateTimer } from '../ui/hud.js';

export function startTimer(onTimeUp) {
  stopTimer();
  state.timerInterval = setInterval(() => tick(onTimeUp), CONFIG.TICK_INTERVAL);
}

export function stopTimer() {
  if (state.timerInterval) {
    clearInterval(state.timerInterval);
    state.timerInterval = null;
  }
}

function tick(onTimeUp) {
  if (!state.gameActive || state.paused) return;

  state.timeLeft -= CONFIG.TICK_INTERVAL / 1000;

  if (state.timeLeft <= 0) {
    state.timeLeft = 0;
    updateTimer(0);
    onTimeUp();
    return;
  }

  updateTimer(state.timeLeft);
}
