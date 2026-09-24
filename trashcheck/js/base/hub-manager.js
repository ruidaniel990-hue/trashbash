// ── Hub Manager ──
// Central hub logic: delivery sequence, results display, navigation.

import { showScreen } from '../ui/screen-manager.js';
import { getBalance } from '../economy/coin-manager.js';
import { sfx } from '../effects/audio-manager.js';
import { confettiRain } from '../effects/particle-manager.js';

let lastResults = null;

const setText = (id, text) => {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
};

// Store results from the last completed run
export function setRunResults(results) {
  lastResults = results;
}

export function getRunResults() {
  return lastResults;
}

// Show the trash delivery sequence (short animation before results)
export function showDeliverySequence(results, onComplete) {
  setRunResults(results);

  setText('delivery-hotspot', results.hotspot ? results.hotspot.icon + ' ' + results.hotspot.name : '');
  setText('delivery-items', results.correctCount + ' Objekte richtig sortiert');

  showScreen('screen-delivery');

  // Short delivery animation, then show results
  setTimeout(() => {
    if (onComplete) onComplete();
  }, 2200);
}

function countUp(id, target, prefix = '', duration = 900) {
  const el = document.getElementById(id);
  if (!el) return;
  const start = performance.now();
  const step = now => {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = prefix + Math.round(target * eased);
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function starsFor(accuracy, correct) {
  if (correct === 0) return 0;
  if (accuracy >= 90) return 3;
  if (accuracy >= 70) return 2;
  if (accuracy >= 50) return 1;
  return 0;
}

// Show the results/reward screen
export function showResultsScreen(results) {
  const accuracy = results.totalItems > 0
    ? Math.round((results.correctCount / results.totalItems) * 100)
    : 0;
  const errors = results.totalItems - results.correctCount;
  const stars = starsFor(accuracy, results.correctCount);

  const ratings = [
    'Übung macht den Meister!',
    'Guter Anfang!',
    'Sehr gut sortiert!',
    'Perfekte Sortierung!',
  ];
  setText('results-rating-text', ratings[stars]);
  setText('results-level', 'Bis Level ' + results.level + (results.hotspot ? ' · ' + results.hotspot.name : ''));
  setText('results-correct', results.correctCount);
  setText('results-errors', errors);
  setText('results-accuracy', accuracy + '%');
  setText('results-combo-bonus', '+' + results.comboBonus);
  setText('results-max-combo', '×' + results.maxCombo);

  const starEls = document.querySelectorAll('#results-stars .star');
  starEls.forEach((el, i) => {
    el.classList.remove('on');
    if (i < stars) {
      setTimeout(() => { el.classList.add('on'); sfx.star(i); }, 450 + i * 280);
    }
  });

  const hsEl = document.getElementById('results-new-hs');
  if (hsEl) hsEl.hidden = !results.isNewHighscore;

  showScreen('screen-results');

  countUp('results-score', results.score);
  countUp('results-coins-val', results.coinsEarned, '+', 1100);
  for (let i = 0; i < 4; i++) sfx.coin(1.0 + i * 0.12);
  if (results.isNewHighscore || stars === 3) setTimeout(() => confettiRain(48), 900);
}

// Show the hub/base screen
export function showHub() {
  setText('hub-coins', getBalance());
  showScreen('screen-hub');
}
