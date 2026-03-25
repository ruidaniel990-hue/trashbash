// ── Game State ──
// Mutable state for the current round. Reset via resetState() on each new game.

import { CONFIG } from '../core/game-config.js';

export const state = {
  // Scoring
  score: 0,
  combo: 1,
  maxCombo: 1,
  correctCount: 0,
  totalItems: 0,

  // Time
  timeLeft: CONFIG.GAME_DURATION,
  timerInterval: null,

  // Game flow
  gameActive: false,
  paused: false,

  // Level & Hotspot
  level: 1,
  itemsSinceLevel: 0,
  itemsForNextLevel: CONFIG.BASE_ITEMS_PER_LEVEL,
  currentHotspot: null, // hotspot object from hotspot-data

  // Current round
  activeBins: [],    // 3 category keys
  currentItem: null, // { emoji, name, bin }

  // DOM references (set during gameplay)
  itemEl: null,
  fallTimer: null,

  // Input tracking
  swipeStartX: 0,
  swipeStartY: 0,
  swiping: false,
};

export function resetState() {
  state.score = 0;
  state.combo = 1;
  state.maxCombo = 1;
  state.correctCount = 0;
  state.totalItems = 0;
  state.timeLeft = CONFIG.GAME_DURATION;
  state.timerInterval = null;
  state.gameActive = true;
  state.paused = false;
  state.level = 1;
  state.itemsSinceLevel = 0;
  state.itemsForNextLevel = CONFIG.BASE_ITEMS_PER_LEVEL;
  state.currentHotspot = null;
  state.activeBins = [];
  state.currentItem = null;
  state.itemEl = null;
  state.fallTimer = null;
  state.swipeStartX = 0;
  state.swipeStartY = 0;
  state.swiping = false;
}
