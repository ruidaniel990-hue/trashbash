// ── Hub Manager ──
// Central hub logic: delivery sequence, results display, navigation.

import { showScreen } from '../ui/screen-manager.js';
import { getBalance } from '../economy/coin-manager.js';

let lastResults = null;

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

  // Populate delivery screen
  const setText = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };

  setText('delivery-hotspot', results.hotspot ? results.hotspot.icon + ' ' + results.hotspot.name : '');
  setText('delivery-items', results.correctCount + ' Objekte');

  showScreen('screen-delivery');

  // Short delivery animation, then show results
  setTimeout(() => {
    if (onComplete) onComplete();
  }, 2200);
}

// Show the results/reward screen
export function showResultsScreen(results) {
  const setText = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };

  const accuracy = results.totalItems > 0
    ? Math.round((results.correctCount / results.totalItems) * 100)
    : 0;

  // Combo bonus: extra coins for high max combo
  const comboBonus = Math.floor(results.maxCombo * 2);

  const errors = results.totalItems - results.correctCount;

  setText('results-correct', results.correctCount);
  setText('results-errors', errors);
  setText('results-accuracy', accuracy + '%');
  setText('results-score', results.score);
  setText('results-combo-bonus', '+' + comboBonus);
  setText('results-coins', '+' + results.coinsEarned);
  setText('results-level', 'Level ' + results.level);

  // Accuracy rating
  let ratingIcon = '😅';
  let ratingText = 'Übung macht den Meister!';
  if (accuracy >= 90) { ratingIcon = '🏆'; ratingText = 'Perfekte Sortierung!'; }
  else if (accuracy >= 70) { ratingIcon = '⭐'; ratingText = 'Sehr gut sortiert!'; }
  else if (accuracy >= 50) { ratingIcon = '👍'; ratingText = 'Guter Anfang!'; }

  setText('results-rating-icon', ratingIcon);
  setText('results-rating-text', ratingText);

  // New highscore indicator
  const hsEl = document.getElementById('results-new-hs');
  if (hsEl) hsEl.style.display = results.isNewHighscore ? 'block' : 'none';

  showScreen('screen-results');
}

// Show the hub/base screen
export function showHub() {
  const setText = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };

  setText('hub-coins', getBalance());

  showScreen('screen-hub');
}
