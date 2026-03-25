// ── Economy Configuration ──
// Formulas and caps for the coin/reward system.
// Re-exports from game-config for convenience; extend here for shop prices etc.

import { CONFIG, calculateCoins } from '../core/game-config.js';

export { calculateCoins };

export const ECONOMY = {
  COINS_PER_SCORE_UNIT: CONFIG.COINS_PER_SCORE_UNIT,
  MAX_COINS_PER_GAME: CONFIG.MAX_COINS_PER_GAME,

  // TODO [P2]: Shop prices
  // PRICE_TIME_BOOST: 50,
  // PRICE_COMBO_SHIELD: 80,
};
