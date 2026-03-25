// ── Game Engine ──
// Core gameplay orchestrator with Hotspot/Level system.
// Flow: Start -> Preview -> Game -> (LevelUp -> Transition -> Preview -> Game)* -> End

import { CATEGORIES } from './game-data.js';
import { CONFIG, getScoreThreshold } from './game-config.js';
import { state, resetState } from '../state/game-state.js';
import { showScreen } from '../ui/screen-manager.js';
import { resetHUD, updateScore, updateCombo, bumpCombo, updateLevel, updateHotspot } from '../ui/hud.js';
import { showPause, hidePause, showLevelUpFlash } from '../ui/overlay-manager.js';
import { floatPoints, flashBin, animateItemSort } from '../effects/animation-manager.js';
import { startTimer, stopTimer } from './game-timer.js';
import { getHighscore, setHighscore } from '../storage/storage-bridge.js';
import { earnCoins, getBalance } from '../economy/coin-manager.js';
import { getHotspotForLevel } from '../level/level-definitions.js';
import { getLevelFallTime, getLevelSpawnDelay, getItemsToComplete, hotspotChanges } from '../level/level-manager.js';
import { setCurrentHotspot, getHotspotBinPreview } from '../hotspot/hotspot-manager.js';
import { showDeliverySequence, showResultsScreen, showHub } from '../base/hub-manager.js';
import { renderShop } from '../shop/shop-screen.js';

// ── Render bins at bottom ──
function renderBins() {
  const row = document.getElementById('bins-row');
  if (!row) return;
  const arrows = ['◀ LINKS', '⬇ MITTE', 'RECHTS ▶'];
  row.innerHTML = state.activeBins.map((key, i) => {
    const c = CATEGORIES[key];
    return `<div class="bin ${c.cls}" id="bin-${i}">
      <div class="bin-arrow">${arrows[i]}</div>
      <div class="bin-icon">${c.icon}</div>
      <div class="bin-label">${c.name}</div>
    </div>`;
  }).join('');
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

  // Render preview bins with staggered animation
  const previewBins = document.getElementById('preview-bins');
  if (previewBins) {
    const binData = getHotspotBinPreview(hotspot);
    previewBins.innerHTML = binData.map(b =>
      `<div class="preview-bin ${b.cls}">
        <div class="preview-bin-arrow">${b.direction}</div>
        <div class="preview-bin-icon">${b.icon}</div>
        <div class="preview-bin-name">${b.name}</div>
      </div>`
    ).join('');
  }

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

  showScreen('screen-transition');

  // Short dynamic transition, then callback
  setTimeout(callback, 1800);
}

// ── Initialize start screen ──
export function initStart() {
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

  // Apply hotspot's bins
  applyHotspotBins();
  updateLevel(state.level);
  updateHotspot(state.currentHotspot);

  showScreen('screen-game');

  // Start timer only on first level (timer persists across levels)
  if (state.level === 1) {
    startTimer(() => endGame());
  }

  setTimeout(() => spawnItem(), CONFIG.INITIAL_SPAWN_DELAY);
}

// ── Get spawn X position ──
// Level 1-5: always center. Level 6+: very gradually more side spawns.
function getSpawnXPercent() {
  if (state.level <= 5) return 50;

  // Gentle ramp: 5% per level, cap at 50%
  // L6=5%, L7=10%, L8=15%, L9=20%, L10=25% ... L15=50% cap
  const sideChance = Math.min(0.5, (state.level - 5) * 0.05);
  if (Math.random() < sideChance) {
    return Math.random() < 0.5 ? 25 : 75;
  }
  return 50;
}

// ── Spawn Item ──
function spawnItem() {
  if (!state.gameActive) return;

  // Pick random item from one of the active bins
  const binKey = state.activeBins[Math.floor(Math.random() * state.activeBins.length)];
  const cat = CATEGORIES[binKey];
  const item = cat.items[Math.floor(Math.random() * cat.items.length)];
  state.currentItem = { ...item, bin: binKey };
  state.totalItems++;

  const zone = document.getElementById('fall-zone');
  if (!zone) return;

  // Create item element with dynamic spawn position
  const spawnX = getSpawnXPercent();
  const el = document.createElement('div');
  el.className = 'swipe-item spawn';
  el.style.left = spawnX + '%';
  el.style.top = '18%';
  el.innerHTML = `<div class="item-emoji">${item.emoji}</div><div class="item-name">${item.name}</div>`;
  zone.appendChild(el);
  state.itemEl = el;

  // Remove spawn class after animation (350ms) so inline transform (swipe) works
  setTimeout(() => el.classList.remove('spawn'), 360);

  // Auto-fall timer (no swipe = center bin) - uses level-specific timing
  clearTimeout(state.fallTimer);
  state.fallTimer = setTimeout(() => {
    if (state.gameActive && !state.paused && state.currentItem) {
      sortItem(1);
    }
  }, getLevelFallTime(state.level));

  // Reset swipe hints
  const hintLeft = document.getElementById('hint-left');
  const hintRight = document.getElementById('hint-right');
  if (hintLeft) hintLeft.classList.remove('show');
  if (hintRight) hintRight.classList.remove('show');
}

// ── Sort item into bin (0=left, 1=center, 2=right) ──
export function sortItem(binIndex) {
  if (!state.gameActive || !state.currentItem) return;
  clearTimeout(state.fallTimer);

  const targetBin = state.activeBins[binIndex];
  const isCorrect = targetBin === state.currentItem.bin;
  const binEl = document.getElementById('bin-' + binIndex);

  // Animate item falling to bin
  animateItemSort(state.itemEl, binIndex);

  if (isCorrect) {
    state.correctCount++;
    const pts = CONFIG.BASE_POINTS * state.combo;
    state.score += pts;
    state.combo = Math.min(state.combo + 1, CONFIG.MAX_COMBO);
    state.maxCombo = Math.max(state.maxCombo, state.combo);
    state.timeLeft = Math.min(state.timeLeft + CONFIG.TIME_BONUS_CORRECT, CONFIG.GAME_DURATION);

    updateScore(state.score);
    updateCombo(state.combo);
    bumpCombo();
    flashBin(binEl, true);
    floatPoints('+' + pts, true, binEl);
  } else {
    state.combo = 1;
    state.timeLeft = Math.max(state.timeLeft - CONFIG.TIME_PENALTY_WRONG, 0);
    updateCombo(1);
    flashBin(binEl, false);
    floatPoints('-' + CONFIG.TIME_PENALTY_WRONG + 's', false, binEl);
  }

  // Level up check on correct answers
  if (isCorrect) checkLevelUp();

  state.currentItem = null;
  setTimeout(() => spawnItem(), getLevelSpawnDelay(state.level));
}

// ── Level Up ──
function checkLevelUp() {
  state.itemsSinceLevel++;
  if (state.itemsSinceLevel < state.itemsForNextLevel) return;

  // Level complete
  const prevLevel = state.level;
  state.level++;
  state.itemsSinceLevel = 0;
  state.itemsForNextLevel = getItemsToComplete(state.level);

  // Bonus time
  state.timeLeft = Math.min(state.timeLeft + CONFIG.TIME_BONUS_LEVEL_UP, CONFIG.GAME_DURATION);

  // Check if hotspot changes
  const prevHotspot = state.currentHotspot;
  const nextHotspot = getHotspotForLevel(state.level);

  if (hotspotChanges(prevLevel, state.level)) {
    // Hotspot changes: pause game, show transition, then preview
    clearTimeout(state.fallTimer);
    if (state.itemEl && state.itemEl.parentNode) state.itemEl.remove();
    state.currentItem = null;

    state.currentHotspot = nextHotspot;
    setCurrentHotspot(nextHotspot);

    showLevelUpFlash(state.level);

    // After flash, show transition
    setTimeout(() => {
      showTransition(prevHotspot, nextHotspot, () => {
        showLevelPreview();
      });
    }, CONFIG.LEVEL_UP_FLASH_DURATION);

  } else {
    // Same hotspot: just update bins and continue
    state.currentHotspot = nextHotspot;
    setCurrentHotspot(nextHotspot);

    updateLevel(state.level);
    applyHotspotBins();
    showLevelUpFlash(state.level);
  }
}

// ── Pause / Resume ──
export function togglePause() {
  if (!state.gameActive) return;
  state.paused = !state.paused;

  if (state.paused) {
    showPause(state.level, state.score);
    clearTimeout(state.fallTimer);
  } else {
    hidePause();
    // Restart fall timer for current item
    if (state.currentItem) {
      state.fallTimer = setTimeout(() => {
        if (state.gameActive && state.currentItem) sortItem(1);
      }, getLevelFallTime(state.level));
    }
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

  // Calculate coins
  const coinsEarned = earnCoins(state.score);

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
    isNewHighscore: isNewHs,
    hotspot: state.currentHotspot,
  };

  // Show delivery -> results flow
  showDeliverySequence(results, () => {
    showResultsScreen(results);
  });
}

// ── Go to Hub (called from results screen) ──
export function goToHub() {
  showHub();
}

// ── Replay last run (same hotspot/level) ──
export function replayLastRun() {
  startGame();
}

// ── Navigation from Hub ──
export function openShop() {
  renderShop();
  showScreen('screen-shop');
}

export function openAvatar() {
  // TODO [P2]: Show avatar screen
  alert('Avatar kommt bald!');
}
