// ── Battle Fairness ──
// Ensures PvP integrity: equipment normalization, stat caps, anti-cheat hints.
// In battle mode, solo upgrades are either disabled or capped to prevent pay-to-win.

import { BATTLE_CONFIG } from './battle-data.js';

// ── Equipment Normalization ──
// In battles, ALL equipment bonuses are disabled. Both players play with
// identical base stats. This is the strictest fairness model.
// Alternative: cap bonuses at a small value (see SOFT_CAPS below).

const FAIRNESS_MODE = 'strict'; // 'strict' = no bonuses, 'soft' = capped bonuses

const SOFT_CAPS = {
  timeBonusCorrect: 0.1,    // max +0.1s even with best gear
  comboShield: 0,            // no combo protection in battles
  coinMultiplier: 1.0,       // no coin bonus (battle rewards are fixed)
};

export function normalizeBattleStats(soloEffects) {
  if (FAIRNESS_MODE === 'strict') {
    // All bonuses zeroed out in battle mode
    return {
      timeBonusCorrect: 0,
      comboShield: 0,
      coinMultiplier: 1.0,
    };
  }

  // Soft mode: cap each bonus
  return {
    timeBonusCorrect: Math.min(soloEffects.timeBonusCorrect || 0, SOFT_CAPS.timeBonusCorrect),
    comboShield: Math.min(soloEffects.comboShield || 0, SOFT_CAPS.comboShield),
    coinMultiplier: Math.min(soloEffects.coinMultiplier || 1, SOFT_CAPS.coinMultiplier),
  };
}

// ── Matchmaking Fairness ──
// Checks if two players are within the allowed level range for fair matching.
export function isMatchFair(playerLevel, opponentLevel) {
  return Math.abs(playerLevel - opponentLevel) <= BATTLE_CONFIG.MATCHMAKING_LEVEL_RANGE;
}

// ── Result Validation ──
// Basic sanity checks on a submitted battle result.
// These catch obvious cheating (impossible scores, negative values, etc.)
export function validateBattleResult(result, battleConfig) {
  const issues = [];

  if (result.score < 0) issues.push('negative_score');
  if (result.correctCount < 0) issues.push('negative_correct');
  if (result.totalItems < 0) issues.push('negative_items');
  if (result.correctCount > result.totalItems) issues.push('correct_exceeds_total');
  if (result.totalItems > battleConfig.itemCount + 5) issues.push('too_many_items'); // small buffer for timing
  if (result.maxCombo > result.correctCount) issues.push('combo_exceeds_correct');
  if (result.accuracy < 0 || result.accuracy > 100) issues.push('invalid_accuracy');

  // Max theoretical score check
  const maxPossibleScore = battleConfig.itemCount * 10 * 10; // all correct at max combo
  if (result.score > maxPossibleScore) issues.push('score_exceeds_maximum');

  return {
    valid: issues.length === 0,
    issues,
  };
}

// ── Time-based fairness ──
// Both players must complete their run within the match expiry window.
export function isMatchExpired(match) {
  const expiryMs = BATTLE_CONFIG.MATCH_EXPIRY_HOURS * 60 * 60 * 1000;
  const createdAt = new Date(match.createdAt).getTime();
  return Date.now() - createdAt > expiryMs;
}
