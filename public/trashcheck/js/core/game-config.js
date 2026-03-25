// ── Trashcheck Game Configuration ──
// Single source of truth for all tuning parameters

export const CONFIG = {
  // Timing
  GAME_DURATION: 60,          // seconds per round
  TICK_INTERVAL: 100,         // ms between timer ticks
  INITIAL_SPAWN_DELAY: 400,   // ms before first item spawns

  // Scoring
  BASE_POINTS: 10,            // points per correct sort (before combo)
  MAX_COMBO: 10,              // combo multiplier cap

  // Time adjustments
  TIME_BONUS_CORRECT: 0.8,    // seconds gained on correct sort
  TIME_PENALTY_WRONG: 3,      // seconds lost on wrong sort
  TIME_BONUS_LEVEL_UP: 3,     // seconds gained on level-up

  // Economy
  COINS_PER_SCORE_UNIT: 5,    // score / this = coins earned
  MAX_COINS_PER_GAME: 200,    // coin cap per round

  // Input
  SWIPE_THRESHOLD: 50,        // minimum px for swipe detection
  SWIPE_VISUAL_MULTIPLIER: 80,// item follows finger at this % of screen width

  // Difficulty scaling (per level)
  BASE_FALL_TIME: 2200,       // ms at level 1
  FALL_TIME_DECREASE: 300,    // ms less per level
  MIN_FALL_TIME: 800,         // ms floor

  BASE_SPAWN_DELAY: 350,      // ms at level 1
  SPAWN_DELAY_DECREASE: 40,   // ms less per level
  MIN_SPAWN_DELAY: 150,       // ms floor

  // Level progression
  BASE_ITEMS_PER_LEVEL: 8,    // correct sorts needed for level 1
  ITEMS_PER_LEVEL_INCREASE: 2,// additional items per level
  MAX_ITEMS_PER_LEVEL: 20,    // cap on items needed per level

  // Bins
  ACTIVE_BINS_COUNT: 3,       // bins shown at a time

  // Animation durations (ms) - match CSS
  ITEM_SORT_ANIM: 300,
  FLOAT_POINTS_DURATION: 900,
  LEVEL_UP_FLASH_DURATION: 1000,

  // End screen thresholds
  SCORE_THRESHOLDS: [
    { min: 200, icon: '🏆', title: 'Meister!',       sub: 'Unglaubliche Leistung!' },
    { min: 120, icon: '🥇', title: 'Klasse!',        sub: 'Du kennst deinen Müll!' },
    { min: 60,  icon: '👍', title: 'Gut gemacht!',   sub: 'Weiter so!' },
    { min: 0,   icon: '😅', title: 'Nicht schlecht!', sub: 'Versuch es nochmal!' },
  ],
};

// Derived calculations
export function getFallTime(level) {
  return Math.max(CONFIG.MIN_FALL_TIME, CONFIG.BASE_FALL_TIME - (level - 1) * CONFIG.FALL_TIME_DECREASE);
}

export function getSpawnDelay(level) {
  return Math.max(CONFIG.MIN_SPAWN_DELAY, CONFIG.BASE_SPAWN_DELAY - (level - 1) * CONFIG.SPAWN_DELAY_DECREASE);
}

export function calculateCoins(score) {
  return Math.min(Math.floor(score / CONFIG.COINS_PER_SCORE_UNIT), CONFIG.MAX_COINS_PER_GAME);
}

export function getScoreThreshold(score) {
  return CONFIG.SCORE_THRESHOLDS.find(t => score >= t.min);
}
