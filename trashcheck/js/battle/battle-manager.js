// ── Battle Manager ──
// High-level orchestrator for the battle system.
// Provides a clean API for the game engine and UI to interact with.

import { MATCH_STATUS, OUTCOME, BATTLE_CONFIG } from './battle-data.js';
import { createBattleRound } from './battle-seed.js';
import { normalizeBattleStats, isMatchFair } from './battle-fairness.js';
import {
  createChallenge,
  acceptChallenge,
  declineChallenge,
  getBattleRound,
  submitResult,
  getPlayerMatches,
  getPendingChallenges,
  getActiveMatches,
  cleanupExpiredMatches,
} from './battle-match.js';

// ── Current battle state ──
let activeBattleId = null;
let activeBattleRound = null;

// ── Initialize battle system ──
export function initBattle() {
  cleanupExpiredMatches();
}

// ── Challenge a friend ──
export function challengeFriend(myId, friendId, myLevel, friendLevel) {
  // Check matchmaking fairness
  if (!isMatchFair(myLevel, friendLevel)) {
    return { ok: false, reason: 'level_mismatch', detail: 'Level-Unterschied zu groß' };
  }

  const result = createChallenge(myId, friendId);
  return { ok: true, matchId: result.matchId };
}

// ── Respond to a challenge ──
export function respondToChallenge(matchId, accept) {
  if (accept) {
    return acceptChallenge(matchId);
  }
  return declineChallenge(matchId);
}

// ── Start playing a battle ──
// Returns the battle round data (categories, item sequence, config).
// The game engine should use this instead of random pickBins/spawnItem.
export function startBattleRun(matchId) {
  const round = getBattleRound(matchId);
  if (!round) return { ok: false, reason: 'match_not_found' };

  activeBattleId = matchId;
  activeBattleRound = round;

  return {
    ok: true,
    round: {
      categories: round.categories,
      itemSequence: round.itemSequence,
      config: round.config,
    },
  };
}

// ── Get the next item from the battle sequence ──
// Used by game-engine instead of random item selection.
export function getNextBattleItem(index) {
  if (!activeBattleRound) return null;
  if (index >= activeBattleRound.itemSequence.length) return null;
  return activeBattleRound.itemSequence[index];
}

// ── Check if currently in a battle ──
export function isInBattle() {
  return activeBattleId !== null;
}

// ── Get active battle config ──
// Game engine uses this for timing instead of level-based timing.
export function getBattleConfig() {
  if (!activeBattleRound) return null;
  return activeBattleRound.config;
}

// ── Get normalized effects for battle mode ──
export function getBattleEffects(soloEffects) {
  return normalizeBattleStats(soloEffects);
}

// ── Submit result and end battle ──
export function finishBattleRun(playerId, result) {
  if (!activeBattleId) return { ok: false, reason: 'no_active_battle' };

  const submitOutcome = submitResult(activeBattleId, playerId, result);

  // Clear active battle state
  const finishedBattleId = activeBattleId;
  activeBattleId = null;
  activeBattleRound = null;

  return {
    ...submitOutcome,
    battleId: finishedBattleId,
  };
}

// ── Get my pending challenges ──
export function getMyPendingChallenges(playerId) {
  return getPendingChallenges(playerId);
}

// ── Get my active battles (waiting for me or opponent to play) ──
export function getMyActiveBattles(playerId) {
  return getActiveMatches(playerId);
}

// ── Get my battle history ──
export function getBattleHistory(playerId) {
  return getPlayerMatches(playerId)
    .filter(m => m.status === MATCH_STATUS.COMPLETED)
    .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
}

// ── Get battle rewards for display ──
export function getBattleRewards() {
  return { ...BATTLE_CONFIG.REWARDS };
}
