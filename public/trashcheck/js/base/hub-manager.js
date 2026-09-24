// ── Hub Manager ──
// Central hub logic: delivery sequence, results display, navigation.

import { showScreen } from '../ui/screen-manager.js';
import { getBalance } from '../economy/coin-manager.js';
import { sfx } from '../effects/audio-manager.js';
import { confettiRain } from '../effects/particle-manager.js';
import { CATEGORIES } from '../core/game-data.js';
import { iconHtml } from '../ui/icons.js';
import { getDailyTask } from '../progress/daily.js';

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
  // An item still in the air when the round ends is neither right nor wrong.
  const errors = results.mistakes.length;
  const judged = results.correctCount + errors;
  const accuracy = judged > 0 ? Math.round((results.correctCount / judged) * 100) : 0;
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
  setText('results-max-combo', '×' + results.maxCombo);

  const starEls = document.querySelectorAll('#results-stars .star');
  starEls.forEach((el, i) => {
    el.classList.remove('on');
    if (i < stars) {
      setTimeout(() => { el.classList.add('on'); sfx.star(i); }, 450 + i * 280);
    }
  });

  const bonusParts = ['Combo-Bonus +' + results.comboBonus];
  if (results.coinMultiplier > 1) bonusParts.push('Ausrüstung +' + Math.round((results.coinMultiplier - 1) * 100) + ' %');
  setText('results-coins-note', 'inkl. ' + bonusParts.join(' · '));

  renderMistakes(results.mistakes || []);
  renderDailyStatus();

  const hsEl = document.getElementById('results-new-hs');
  if (hsEl) hsEl.hidden = !results.isNewHighscore;

  showScreen('screen-results');

  countUp('results-score', results.score);
  countUp('results-coins-val', results.coinsEarned, '+', 1100);
  for (let i = 0; i < 4; i++) sfx.coin(1.0 + i * 0.12);
  if (results.isNewHighscore || stars === 3) setTimeout(() => confettiRain(48), 900);
}

function renderMistakes(mistakes) {
  const box = document.getElementById('results-mistakes');
  const list = document.getElementById('mistakes-list');
  if (!box || !list) return;
  const unique = [...new Map(mistakes.map(m => [m.name, m])).values()].slice(0, 4);
  box.hidden = unique.length === 0;
  list.innerHTML = unique.map(m => {
    const cat = CATEGORIES[m.bin];
    return `<li class="mistake">
      <span class="mistake-icon">${iconHtml(m.emoji)}</span>
      <span class="mistake-name">${m.name}</span>
      <span class="mistake-bin ${cat.cls}">→ ${cat.name}</span>
    </li>`;
  }).join('');
}

function renderDailyStatus() {
  const el = document.getElementById('results-daily');
  if (!el) return;
  const task = getDailyTask();
  el.classList.toggle('is-done', task.done);
  el.textContent = task.done
    ? `${task.icon} Tagesaufgabe erledigt`
    : `${task.icon} Tagesaufgabe: ${task.progress}/${task.target}`;
}

// Show the hub/base screen
export function showHub() {
  setText('hub-coins', getBalance());
  showScreen('screen-hub');
}
