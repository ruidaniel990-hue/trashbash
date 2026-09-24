// ── Game Timer ──
// Manages the countdown timer with configurable tick callbacks.

import { state } from '../state/game-state.js';
import { CONFIG } from './game-config.js';
import { updateTimer, setFrozen } from '../ui/hud.js';
import { sfx } from '../effects/audio-manager.js';
import { setMusicUrgent } from '../effects/music.js';

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

  const frozen = Date.now() < state.frozenUntil;
  setFrozen(frozen);
  if (frozen) return;

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
  setMusicUrgent(state.timeLeft <= 10);
}
