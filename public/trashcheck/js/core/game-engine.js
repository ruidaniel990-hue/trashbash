// ── Game Engine ──
// Core gameplay orchestrator with Hotspot/Level system.
// Flow: Start -> Preview -> Game -> (LevelUp -> Transition -> Preview -> Game)* -> End

import { CATEGORIES } from './game-data.js';
import { CONFIG } from './game-config.js';
import { state, resetState } from '../state/game-state.js';
import { showScreen } from '../ui/screen-manager.js';
import { resetHUD, updateScore, updateCombo, bumpCombo, updateLevel, updateHotspot, updateShield, updateTimer } from '../ui/hud.js';
import { showPause, hidePause, showLevelUpFlash } from '../ui/overlay-manager.js';
import { binHtml } from '../ui/bin-view.js';
import { applyScene } from '../ui/scene.js';
import { iconHtml } from '../ui/icons.js';
import { floatPoints, flashBin, hintCorrectBin, animateItemSort, animateItemMiss, shakeScreen, flashVignette, showBanner, showTip } from '../effects/animation-manager.js';
import { burstAt, confettiRain } from '../effects/particle-manager.js';
import { sfx } from '../effects/audio-manager.js';
import { vibrate } from '../effects/haptic-manager.js';
import { startMusic, stopMusic } from '../effects/music.js';
import { startTimer, stopTimer } from './game-timer.js';
import { getHighscore, setHighscore } from '../storage/storage-bridge.js';
import { earnCoins, grantBonus, getBalance } from '../economy/coin-manager.js';
import { getHotspotForLevel } from '../level/level-definitions.js';
import { getLevelFallTime, getLevelSpawnDelay, getItemsToComplete, hotspotChanges } from '../level/level-manager.js';
import { setCurrentHotspot } from '../hotspot/hotspot-manager.js';
import { showDeliverySequence, showResultsScreen, showHub } from '../base/hub-manager.js';
import { renderShop } from '../shop/shop-screen.js';
import { getActiveEffects } from '../shop/shop-manager.js';
import { trackDaily } from '../progress/daily.js';
import { recordLevel, getSelectedStartLevel, getStartSpots } from '../progress/unlocks.js';
import { isTutorialDone, markTutorialDone } from '../progress/tutorial.js';

const COMBO_MILESTONES = { 5: 'Combo ×5', 8: 'Combo ×8', 10: 'Max Combo!' };
const GOLDEN_CHANCE = 0.08;
const POWERUP_CHANCE = 0.06;
const POWER_UPS = [
  { power: 'freeze', emoji: '❄️', name: 'Frost' },
  { power: 'hint',   emoji: '🧭', name: 'Tipp-Blick' },
  { power: 'time',   emoji: '⏱️', name: '+5 Sekunden' },
];
const DIR_WORDS = ['nach links', 'nach unten', 'nach rechts'];

// ── Render bins at bottom ──
function renderBins() {
  const row = document.getElementById('bins-row');
  if (!row) return;
  row.innerHTML = state.activeBins.map((key, i) => binHtml(key, i, 'bin-' + i)).join('');
}

// ── Set bins from hotspot ──
function applyHotspotBins() {
  const hotspot = state.currentHotspot;
  if (hotspot) {
    state.activeBins = hotspot.categories.slice(0, CONFIG.ACTIVE_BINS_COUNT);
  }
  renderBins();
}

// ── Populate and show level preview screen ──
function showLevelPreview() {
  const hotspot = state.currentHotspot;
  if (!hotspot) return;

  const setText = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };

  setText('preview-icon', hotspot.icon);
  setText('preview-level', 'Level ' + state.level);
  setText('preview-name', hotspot.name);
  setText('preview-desc', hotspot.description);

  const previewBins = document.getElementById('preview-bins');
  if (previewBins) {
    previewBins.innerHTML = hotspot.categories
      .slice(0, CONFIG.ACTIVE_BINS_COUNT)
      .map((key, i) => binHtml(key, i))
      .join('');
  }

  applyScene('screen-preview', hotspot.id);
  applyScene('screen-game', hotspot.id);
  showScreen('screen-preview');
}

// ── Show transition between hotspots ──
function showTransition(fromHotspot, toHotspot, callback) {
  const setText = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };

  setText('transition-from-icon', fromHotspot.icon);
  setText('transition-from-name', fromHotspot.name);
  setText('transition-to-icon', toHotspot.icon);
  setText('transition-to-name', toHotspot.name);

  applyScene('screen-transition', toHotspot.id);
  showScreen('screen-transition');

  // Short dynamic transition, then callback
  setTimeout(callback, 1800);
}

// ── Initialize start screen ──
let onStartShown = null;
export function setStartRenderer(fn) {
  onStartShown = fn;
}

export function initStart() {
  if (onStartShown) onStartShown();
  const hs = getHighscore();
  const hsEl = document.getElementById('hs-display');
  if (hsEl) hsEl.textContent = hs;

  const coins = getBalance();
  const coinsEl = document.getElementById('start-coins');
  if (coinsEl) coinsEl.textContent = coins;

  showScreen('screen-start');
}

// ── Start Game (from start screen) ──
export function startGame() {
  resetState();
  resetHUD();
  state.level = getSelectedStartLevel();
  state.effects = getActiveEffects();
  state.shieldsLeft = state.effects.comboShield;
  state.tutorialStep = isTutorialDone() ? null : 0;
  updateShield(state.shieldsLeft);

  // Set up first level's hotspot
  const hotspot = getHotspotForLevel(state.level);
  state.currentHotspot = hotspot;
  state.itemsForNextLevel = getItemsToComplete(state.level);
  setCurrentHotspot(hotspot);

  // Show level preview first
  showLevelPreview();
}

// ── Start Level (from preview screen, called by "Los geht's!" button) ──
export function startLevel() {
  // Clear leftover items
  const zone = document.getElementById('fall-zone');
  if (zone) zone.querySelectorAll('.swipe-item').forEach(e => e.remove());
  hidePause();
  state.inTransition = false;

  // Apply hotspot's bins
  applyHotspotBins();
  updateLevel(state.level);
  updateHotspot(state.currentHotspot);

  showScreen('screen-game');

  // Timer starts once per run (after the tutorial) and keeps running across levels
  if (!state.timerStarted && state.tutorialStep === null) {
    state.timerStarted = true;
    startTimer(() => endGame());
  }
  startMusic(state.currentHotspot?.id);

  setTimeout(() => spawnItem(), CONFIG.INITIAL_SPAWN_DELAY);
}

// ── Get spawn X position ──
// Level 1-14: always center. Level 15+: very slow ramp to 50% sides at L70.
function getSpawnXPercent() {
  if (state.level <= 14) return 50;

  // Ultra-gentle ramp: ~0.9% per level, cap at 50%
  // L15≈1%, L20≈5%, L30≈14%, L40≈23%, L50≈32%, L70≈50%
  const sideChance = Math.min(0.5, (state.level - 14) * 0.009);
  if (Math.random() < sideChance) {
    return Math.random() < 0.5 ? 25 : 75;
  }
  return 50;
}

// ── Spawn Item ──
function createItemEl(emoji, label, extraClass, fallTime) {
  const zone = document.getElementById('fall-zone');
  if (!zone) return null;
  const el = document.createElement('div');
  el.className = 'swipe-item spawn' + (extraClass ? ' ' + extraClass : '');
  el.style.left = getSpawnXPercent() + '%';
  el.style.top = '15%';
  el.innerHTML = `<div class="item-fall" style="--fall:${fallTime}ms">
      <div class="item-token">${iconHtml(emoji, 'item-icon')}</div>
      <div class="item-name"></div>
    </div>`;
  el.querySelector('.item-name').textContent = label;
  zone.appendChild(el);
  state.itemEl = el;

  // Remove spawn class after animation so inline transform (swipe) works
  setTimeout(() => el.classList.remove('spawn'), 360);

  document.getElementById('hint-left')?.classList.remove('show');
  document.getElementById('hint-right')?.classList.remove('show');
  return el;
}

function pickItem(binKey, avoidTraps = false) {
  const pool = CATEGORIES[binKey].items.filter(i => !avoidTraps || !i.tip);
  return pool[Math.floor(Math.random() * pool.length)];
}

function spawnItem() {
  if (!state.gameActive || state.inTransition) return;
  if (state.tutorialStep !== null) return spawnTutorialItem();

  const fallTime = getLevelFallTime(state.level);

  if (state.totalItems >= 5 && Math.random() < POWERUP_CHANCE) {
    const power = POWER_UPS[Math.floor(Math.random() * POWER_UPS.length)];
    state.currentItem = { ...power };
    createItemEl(power.emoji, power.name, 'is-power', fallTime);
    armFallTimer(fallTime);
    return;
  }

  // Pick random item from one of the active bins
  const binKey = state.activeBins[Math.floor(Math.random() * state.activeBins.length)];
  const item = pickItem(binKey);
  const golden = state.totalItems >= 3 && Math.random() < GOLDEN_CHANCE;
  state.currentItem = { ...item, bin: binKey, golden };
  state.totalItems++;

  createItemEl(item.emoji, (golden ? '✨ ' : '') + item.name, golden ? 'is-golden' : '', fallTime);

  if (state.hintsLeft > 0) {
    state.hintsLeft--;
    document.getElementById('bin-' + state.activeBins.indexOf(binKey))?.classList.add('hint-glow');
  }

  // Not swiped before the fall ends = missed (level-specific timing)
  armFallTimer(fallTime);
}

function clearHintGlow() {
  document.querySelectorAll('.bin.hint-glow').forEach(b => b.classList.remove('hint-glow'));
}

// ── Tutorial: one guided item per bin, no time pressure ──
function spawnTutorialItem() {
  const index = state.tutorialStep;
  const binKey = state.activeBins[index];
  const item = pickItem(binKey, true);
  state.currentItem = { ...item, bin: binKey };
  createItemEl(item.emoji, item.name, 'is-tutorial', 0);
  showTutorialHint(index, CATEGORIES[binKey].name);
}

function showTutorialHint(index, binName) {
  let el = document.getElementById('tut-hint');
  if (!el) {
    el = document.createElement('div');
    el.id = 'tut-hint';
    el.className = 'tut-hint';
    document.getElementById('screen-game').appendChild(el);
  }
  el.dataset.dir = index;
  el.innerHTML = `<div class="tut-step">Übung ${index + 1} von ${state.activeBins.length}</div>
    <div class="tut-text">Wisch ${DIR_WORDS[index]} in die <strong></strong></div>
    <div class="tut-sub">oder tipp direkt auf die Tonne</div>
    <span class="tut-hand" aria-hidden="true">👆</span>`;
  el.querySelector('strong').textContent = binName;
  document.querySelectorAll('.bin').forEach(b => b.classList.toggle('tut-target', b.id === 'bin-' + index));
}

function clearTutorialHint() {
  document.getElementById('tut-hint')?.remove();
  document.querySelectorAll('.bin.tut-target').forEach(b => b.classList.remove('tut-target'));
}

function tutorialSort(binIndex) {
  const item = state.currentItem;
  const binEl = document.getElementById('bin-' + binIndex);
  if (state.activeBins[binIndex] !== item.bin) {
    flashBin(binEl, false);
    sfx.wrong();
    vibrate('heavy');
    if (state.itemEl) {
      state.itemEl.style.transition = 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)';
      state.itemEl.style.transform = '';
    }
    return;
  }

  sfx.whoosh();
  animateItemSort(state.itemEl, binEl);
  state.currentItem = null;
  const step = state.tutorialStep;
  setTimeout(() => {
    flashBin(binEl, true);
    burstAt(binEl, { color: CATEGORIES[item.bin].color, count: 14 });
    sfx.correct(step + 1);
  }, CONFIG.ITEM_SORT_ANIM * 0.7);
  vibrate('light');

  state.tutorialStep++;
  if (state.tutorialStep < state.activeBins.length) {
    setTimeout(() => spawnItem(), 550);
    return;
  }
  finishTutorial();
}

function finishTutorial() {
  state.tutorialStep = null;
  markTutorialDone();
  clearTutorialHint();
  setTimeout(() => {
    showBanner('Jetzt echt – los!', 'combo');
    sfx.levelUp();
  }, 400);
  setTimeout(() => {
    if (!state.gameActive) return;
    state.timerStarted = true;
    startTimer(() => endGame());
    spawnItem();
  }, 1600);
}

// ── Power-ups: collected by any swipe, tap or key ──
function collectPowerUp(item) {
  const el = state.itemEl;
  burstAt(el?.querySelector('.item-token'), { color: '#7fe2ff', count: 26 });
  el?.remove();
  state.currentItem = null;

  if (item.power === 'freeze') {
    state.frozenUntil = Date.now() + 5000;
    showBanner('❄️ Frost: 5 s Zeitstopp', 'shield');
  } else if (item.power === 'hint') {
    state.hintsLeft = 3;
    showBanner('🧭 Tipp-Blick: 3 Hinweise', 'shield');
  } else {
    state.timeLeft = Math.min(state.timeLeft + 5, CONFIG.GAME_DURATION);
    updateTimer(state.timeLeft);
    showBanner('⏱️ +5 Sekunden', 'golden');
  }
  sfx.combo();
  vibrate('double');
  setTimeout(() => spawnItem(), getLevelSpawnDelay(state.level));
}

let fallDeadline = 0;
let fallRemaining = 0;

function armFallTimer(ms) {
  clearTimeout(state.fallTimer);
  fallDeadline = Date.now() + ms;
  state.fallTimer = setTimeout(missItem, ms);
}

function rewardDaily(event) {
  const reward = trackDaily(event);
  if (!reward) return;
  grantBonus(reward);
  setTimeout(() => {
    showBanner('Tagesaufgabe geschafft! +' + reward + ' 🪙', 'daily');
    sfx.combo();
  }, 500);
}

// A mistake breaks the combo unless a shield from the equipment absorbs it.
function breakCombo() {
  if (state.shieldsLeft > 0 && state.combo > 1) {
    state.shieldsLeft--;
    updateShield(state.shieldsLeft);
    showBanner('🛡️ Combo geschützt', 'shield');
    return;
  }
  state.combo = 1;
  updateCombo(1);
}

function registerMistake(item, chosenBinEl) {
  const correctBinEl = document.getElementById('bin-' + state.activeBins.indexOf(item.bin));
  breakCombo();
  state.timeLeft = Math.max(state.timeLeft - CONFIG.TIME_PENALTY_WRONG, 0);
  state.mistakes.push({ emoji: item.emoji, name: item.name, bin: item.bin });

  if (chosenBinEl) flashBin(chosenBinEl, false);
  floatPoints('-' + CONFIG.TIME_PENALTY_WRONG + 's', false, chosenBinEl || correctBinEl);
  hintCorrectBin(correctBinEl);
  // Trap items explain themselves; otherwise the bin's general tip, once per run.
  const tipKey = item.tip ? 'item:' + item.name : item.bin;
  if (!state.tipsShown[tipKey]) {
    state.tipsShown[tipKey] = true;
    const cat = CATEGORIES[item.bin];
    showTip(item.tip ? { name: item.name + ' → ' + cat.name, tip: item.tip } : cat);
  }
  shakeScreen(document.getElementById('screen-game'));
  flashVignette('wrong');
  sfx.wrong();
  vibrate('heavy');
}

// Not swiping in time counts as a miss, never as a free center-bin guess.
function missItem() {
  if (!state.gameActive || state.paused || !state.currentItem) return;
  const item = state.currentItem;
  clearHintGlow();
  animateItemMiss(state.itemEl);
  if (!item.power) {
    showBanner('Verpasst!', 'miss');
    registerMistake(item, null);
  }
  state.currentItem = null;
  setTimeout(() => spawnItem(), getLevelSpawnDelay(state.level));
}

// ── Sort item into bin (0=left, 1=center, 2=right) ──
export function sortItem(binIndex) {
  if (!state.gameActive || !state.currentItem) return;
  if (state.tutorialStep !== null) return tutorialSort(binIndex);
  clearTimeout(state.fallTimer);
  clearHintGlow();

  const item = state.currentItem;
  if (item.power) return collectPowerUp(item);
  const correctKey = item.bin;
  const targetBin = state.activeBins[binIndex];
  const isCorrect = targetBin === correctKey;
  const binEl = document.getElementById('bin-' + binIndex);

  sfx.whoosh();
  animateItemSort(state.itemEl, binEl);

  if (isCorrect) {
    state.correctCount++;
    const pts = CONFIG.BASE_POINTS * state.combo * (item.golden ? 2 : 1);
    state.score += pts;
    state.combo = Math.min(state.combo + 1, CONFIG.MAX_COMBO);
    state.maxCombo = Math.max(state.maxCombo, state.combo);
    const timeBonus = CONFIG.TIME_BONUS_CORRECT + state.effects.timeBonusCorrect;
    state.timeLeft = Math.min(state.timeLeft + timeBonus, CONFIG.GAME_DURATION);

    updateScore(state.score);
    updateCombo(state.combo);
    bumpCombo();
    setTimeout(() => {
      flashBin(binEl, true);
      floatPoints('+' + pts, true, binEl);
      burstAt(binEl, { color: item.golden ? '#ffd23f' : CATEGORIES[correctKey].color, count: 10 + state.combo * 2 + (item.golden ? 16 : 0) });
      sfx.correct(state.combo);
      if (item.golden) sfx.coin();
    }, CONFIG.ITEM_SORT_ANIM * 0.7);
    vibrate('light');
    if (item.golden) showBanner('✨ Goldener Müll ×2', 'golden');

    rewardDaily({ type: 'correct', bin: correctKey });
    rewardDaily({ type: 'combo', value: state.combo });
    rewardDaily({ type: 'score', value: state.score });
    if (item.golden) rewardDaily({ type: 'golden' });

    if (COMBO_MILESTONES[state.combo]) {
      showBanner(COMBO_MILESTONES[state.combo], state.combo >= 8 ? 'fire' : 'combo');
      sfx.combo();
      vibrate('double');
    }
  } else {
    registerMistake(item, binEl);
  }

  state.currentItem = null;

  // Level up check on correct answers; a hotspot change resumes via startLevel()
  const hotspotChanged = isCorrect && checkLevelUp();
  if (!hotspotChanged) {
    setTimeout(() => spawnItem(), getLevelSpawnDelay(state.level));
  }
}

function celebrateLevelUp() {
  showLevelUpFlash(state.level);
  confettiRain(36);
  sfx.levelUp();
  vibrate('long');
}

// ── Level Up ── returns true when the hotspot changes (game frozen until startLevel)
function checkLevelUp() {
  state.itemsSinceLevel++;
  if (state.itemsSinceLevel < state.itemsForNextLevel) return false;

  // Level complete
  const prevLevel = state.level;
  state.level++;
  state.itemsSinceLevel = 0;
  state.itemsForNextLevel = getItemsToComplete(state.level);

  // Bonus time, fresh combo shields, progress
  state.timeLeft = Math.min(state.timeLeft + CONFIG.TIME_BONUS_LEVEL_UP, CONFIG.GAME_DURATION);
  state.shieldsLeft = state.effects.comboShield;
  updateShield(state.shieldsLeft);
  const newSpot = recordLevel(state.level) && getStartSpots().find(spot => spot.level === state.level)?.name;
  rewardDaily({ type: 'level', value: state.level });
  if (newSpot) setTimeout(() => showBanner('Neuer Startort: ' + newSpot, 'daily'), 1100);

  // Check if hotspot changes
  const prevHotspot = state.currentHotspot;
  const nextHotspot = getHotspotForLevel(state.level);

  if (hotspotChanges(prevLevel, state.level)) {
    // Hotspot changes: freeze game, show transition, then preview
    state.inTransition = true;
    clearTimeout(state.fallTimer);
    stopMusic();
    state.currentItem = null;

    state.currentHotspot = nextHotspot;
    setCurrentHotspot(nextHotspot);

    celebrateLevelUp();

    // After flash, show transition
    setTimeout(() => {
      showTransition(prevHotspot, nextHotspot, () => {
        showLevelPreview();
      });
    }, CONFIG.LEVEL_UP_FLASH_DURATION);
    return true;
  }

  // Same hotspot: just update bins and continue
  state.currentHotspot = nextHotspot;
  setCurrentHotspot(nextHotspot);

  updateLevel(state.level);
  applyHotspotBins();
  celebrateLevelUp();
  return false;
}

// ── Pause / Resume ──
export function togglePause() {
  if (!state.gameActive || state.inTransition) return;
  state.paused = !state.paused;

  if (state.paused) {
    showPause(state.level, state.score);
    clearTimeout(state.fallTimer);
    fallRemaining = Math.max(0, fallDeadline - Date.now());
    stopMusic();
  } else {
    hidePause();
    startMusic(state.currentHotspot?.id);
    // Resume with the remaining fall time, not a fresh one (tutorial items never fall)
    if (state.currentItem && state.tutorialStep === null) armFallTimer(fallRemaining);
  }
}

// ── Quit from pause ──
export function quitGame() {
  state.paused = false;
  hidePause();
  endGame();
}

// ── End Game ──
function endGame() {
  state.gameActive = false;
  stopTimer();
  clearTimeout(state.fallTimer);
  if (state.itemEl && state.itemEl.parentNode) state.itemEl.remove();
  clearTutorialHint();
  clearHintGlow();
  stopMusic();
  sfx.gameOver();

  // Calculate coins (score coins + combo bonus)
  const comboBonus = grantBonus(state.maxCombo * 2);
  const coinsEarned = earnCoins(state.score, state.effects.coinMultiplier) + comboBonus;

  // Highscore check
  const prevHs = getHighscore();
  const isNewHs = state.score > prevHs;
  if (isNewHs) setHighscore(state.score);

  // Build results object
  const results = {
    score: state.score,
    correctCount: state.correctCount,
    totalItems: state.totalItems,
    maxCombo: state.maxCombo,
    level: state.level,
    coinsEarned,
    comboBonus,
    coinMultiplier: state.effects.coinMultiplier,
    mistakes: state.mistakes,
    isNewHighscore: isNewHs,
    hotspot: state.currentHotspot,
  };

  // Delivery sequence, then results screen
  showDeliverySequence(results, () => {
    showResultsScreen(results);
  });
}

// ── Go to Hub (called from results screen) ──
export function goToHub() {
  showHub();
}

// ── Navigation from Hub ──
export function openShop() {
  renderShop();
  showScreen('screen-shop');
}

export function openAvatar() {
  // TODO [P2]: Show avatar screen
  showBanner('Avatar kommt bald!', 'info');
}
