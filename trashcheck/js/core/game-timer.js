// ── Game Timer ──
// Manages the countdown timer with configurable tick callbacks.

import { state } from '../state/game-state.js';
import { CONFIG } from './game-config.js';
import { updateTimer } from '../ui/hud.js';
import { sfx } from '../effects/audio-manager.js';

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
  if (!state.gameActive || state.paused || state.inTransition) return;

  const prevSecond = Math.ceil(state.timeLeft);
  state.timeLeft -= CONFIG.TICK_INTERVAL / 1000;
  const second = Math.ceil(state.timeLeft);
  if (second < prevSecond && second <= 5 && second > 0) sfx.tick();

  if (state.timeLeft <= 0) {
    state.timeLeft = 0;
    updateTimer(0);
    onTimeUp();
    return;
  }

  updateTimer(state.timeLeft);
}
